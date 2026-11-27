# Xylolabs/Qwen3-8B-MLX-4bit

## Resumen
Xylolabs/Qwen3-8B-MLX-4bit es una conversión y cuantización a 4 bits del modelo Qwen/Qwen3-8B, publicada por Xylolabs para su uso con la librería MLX de Apple en `mlx-lm`. El modelo original, desarrollado por Alibaba Qwen, es un transformer denso de aproximadamente 8.190 millones de parámetros orientado a generación de texto, conversación y razonamiento con modo de pensamiento (thinking mode) activado por defecto. Esta variante resuelve el problema de ejecutar un modelo de 8B en hardware Apple Silicon con memoria unificada limitada, reduciendo el peso de 8,70 GB (8 bits) a 4,72 GB (4 bits).

La relevancia de esta ficha radica en que se trata de una cuantización afinada manualmente: no aplica 4 bits de forma uniforme, sino que mantiene en 6 bits las capas `mlp.down_proj` y `self_attn.v_proj` de las capas 0-3 y 32-35, y deja las normas en float16, con grupo de cuantización de tamaño 64. El resultado es una degradación medible frente a BF16 (KL de 0,099 en WikiText-2, top-1 del 87,27 %) que el autor documenta con detalle, algo poco habitual en repos de cuantización.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 26 de noviembre de 2026 y actualizado al día siguiente. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), convertido a MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40K tokens (según la tabla de hardware del autor) |
| Tipos de cuantizacion | 4 bits afín con grupo de 64; capas 0-3 y 32-35 de `mlp.down_proj` y `self_attn.v_proj` en 6 bits; normas en float16; escalas y sesgos en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 4,7 GB |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen3-8B, un transformer denso de la familia Qwen3 con 8.190 millones de parámetros. Esta publicación no entrena ni afina el modelo: únicamente convierte los pesos originales al formato MLX y los cuantiza. La cuantización es afín (affine) con tamaño de grupo 64, aplicada a todas las capas lineales, al embedding de tokens y a la LM head, con la excepción citada de `mlp.down_proj` y `self_attn.v_proj` en las capas 0-3 y 32-35, que se mantienen en 6 bits. Las normas se conservan en float16.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO, ya que la model card de esta conversión no lo detalla y no se ha proporcionado la del modelo base. La innovación técnica destacable de esta publicación es la estrategia de cuantización mixta 4/6 bits y la evaluación rigurosa de la degradación mediante divergencia KL y acuerdo top-1 frente a BF16 en tres conjuntos (WikiText-2, chat y held-out).

## Capacidades
- Generación de texto y conversación multi-turno, con plantilla de chat compatible con `mlx_lm.chat`.
- Modo de pensamiento (thinking) activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'` para respuestas directas.
- Razonamiento y matemáticas: capacidades heredadas de Qwen3-8B, aunque no se aportan benchmarks específicos en esta publicación.
- Generación de código: heredada del modelo base; no se documenta soporte explícito de tool calling en esta conversión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta publicación.
- Capacidades multilingües: no disponibles; la model card no lista idiomas.
- Ejecución local en Apple Silicon mediante MLX, con contexto de hasta 40K tokens según la tabla de hardware del autor.

## Casos de uso
- Asistente conversacional local en Mac: usar `mlx_lm.chat` con el modelo en 4 bits permite mantener conversaciones multi-turno en un Mac con memoria unificada de 16-32 GB, aprovechando el modo thinking para respuestas razonadas y desactivándolo para respuestas rápidas.
- Prototipado de aplicaciones de razonamiento en Apple Silicon: el modo thinking por defecto y el contexto de 40K tokens permiten probar cadenas de razonamiento sobre documentos largos sin salir del portátil.
- Generación de código en local para desarrolladores con Mac: al ser una cuantización de Qwen3-8B, sirve para autocompletado y explicación de código en entornos sin GPU dedicada, con la ventaja de que el peso de 4,72 GB cabe en memoria unificada modesta.
- Evaluación de cuantizaciones: el repositorio incluye métricas KL y top-1 frente a BF16, por lo que es útil como caso de estudio para comparar estrategias de cuantización (grupo 64 frente a grupo 128) en pipelines de investigación.
- Despliegue en estaciones de trabajo Mac Studio: la tabla de hardware del autor indica que el modelo de 8 bits es el recomendado para Mac Studio M5 Max y Ultra con 36-512 GB; el 4 bits sirve para equipos con menos memoria unificada.
- Educación y experimentación sin conexión: al ejecutarse íntegramente en local con MLX, permite experimentar con un LLM de 8B en aulas o entornos air-gapped donde no se permite enviar datos a la nube.
- Procesamiento de documentos largos: con 40K tokens de contexto, se puede usar para resumir o extraer información de contratos, informes o transcripciones extensas en local.

## Benchmarks y rendimiento
La model card proporciona métricas de fidelidad de cuantización frente a BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Cuantización | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 8,70 GB | 0,000602 | 98,82 % | 0,000565 | 99,10 % | 0,000502 | 99,06 % | 5/7 (BF16: 5/7) |
| MLX 4-bit | 4,72 GB | 0,099188 | 87,27 % | 0,077304 | 88,86 % | 0,085173 | 86,55 % | 5/7 (BF16: 5/7) |
| Qwen MLX 8-bit, grupo 128 | 8,45 GB | 0,001616 | 97,79 % | 0,001452 | 98,31 % | 0,001548 | 97,75 % | 5/7 (BF16: 5/7) |
| Qwen MLX 4-bit, grupo 128 | 4,35 GB | 0,096356 | 86,65 % | 0,075987 | 88,71 % | 0,100502 | 85,78 % | 5/7 (BF16: 5/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/memoria unificada: el archivo de 4 bits ocupa 4,72 GB; el de 8 bits, 8,70 GB. La memoria efectiva necesaria es mayor por el contexto y los estados de atención.
- GPU recomendadas: el autor documenta Mac Studio M5 Max (32 y 40 núcleos GPU) y M5 Ultra (80 núcleos GPU) con memoria unificada de 36 a 512 GB; para el modelo de 8 bits recomienda equipos con 36 GB o más.
- ¿Cabe en GPU de consumo? No se documenta soporte para GPU NVIDIA o AMD; el formato es MLX, específico de Apple Silicon. En Mac con memoria unificada de 16-32 GB el archivo de 4 bits debería caber, aunque el autor no lo confirma explícitamente.
- Opciones de despliegue: `mlx-lm` versión 0.32.2 o superior, con `mlx_lm.generate` y `mlx_lm.chat`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3-8B-MLX-4bit | 8,19 B | 40K | 4 bits mixta (grupo 64) | Apache 2.0 | Hugging Face, MLX |
| Xylolabs/Qwen3-8B-MLX-8bit | 8,19 B | 40K | 8 bits | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3-8B (MLX 4-bit, grupo 128) | 8,19 B | no disponible | 4 bits (grupo 128) | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3-8B (BF16 original) | 8,19 B | no disponible | BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye otros modelos de la misma categoría. En fidelidad, el 4 bits de Xylolabs (KL 0,099 en WikiText-2) es ligeramente peor que el 4 bits de Qwen con grupo 128 (KL 0,096), pero ocupa 0,37 GB más; el 8 bits de Xylolabs es claramente superior al de Qwen (KL 0,000602 frente a 0,001616).

## Limitaciones y advertencias
- Degradación medible frente a BF16: top-1 del 87,27 % en WikiText-2 y del 88,86 % en chat; para tareas sensibles a tokens exactos (código, matemáticas) conviene validar antes de producción.
- El chequeo de 7 preguntas da 5/7 tanto en 4 bits como en BF16, pero es una muestra demasiado pequeña para extraer conclusiones.
- Sesgos conocidos: no documentados en esta publicación; se heredan los del modelo base Qwen3-8B, no analizados aquí.
- Riesgo de alucinación: no evaluado en esta conversión; el modo thinking por defecto puede aumentar la latencia y el consumo de tokens.
- Limitaciones de idioma: la model card no lista idiomas soportados; no se puede confirmar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que solo convirtió y cuantizó los pesos (véase `NOTICE`); conviene revisar las condiciones del modelo base.
- Dependencia de hardware: formato MLX exclusivo para Apple Silicon; no es portable a CUDA sin reconversión.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- El contexto de 40K se cita en la tabla de hardware, pero no se detalla la configuración exacta de atención ni el consumo de memoria a esa longitud.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Variante 8 bits: https://huggingface.co/Xylolabs/Qwen3-8B-MLX-8bit
