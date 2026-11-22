# tinyopsec/isaacbot-GGUF

## Resumen

isaacbot-GGUF es la distribucion en formato GGUF del modelo Isaacwienert/isaacbot, un ajuste fino (fine-tune) de Qwen2.5-Coder-1.5B orientado a tareas de razonamiento, asistencia conversacional y generacion de codigo. El repositorio lo publica el usuario tinyopsec y contiene 13 archivos de cuantizacion generados con llama.cpp, desde F16 hasta Q2_K, lo que permite desplegar el modelo en hardware muy modesto. Con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), se situa en la categoria de modelos pequenos para inferencia local.

El modelo base fue entrenado por Isaacwienert a partir de Qwen2.5-Coder-1.5B, una arquitectura transformer densa de la familia Qwen2.5, empleando una mezcla de datasets de razonamiento, ultrachat y dolly. La relevancia actual de esta ficha radica en que ofrece una via sencilla para ejecutar un asistente de codigo en CPU o en GPUs de consumo, sin necesidad de infraestructura de servidor, manteniendo la licencia permisiva Apache 2.0.

La informacion disponible es limitada: la model card del repositorio GGUF es escueta y no detalla composicion del dataset, numero de tokens de entrenamiento ni resultados de evaluacion. Los datos de contexto y de rendimiento no estan publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 archivos de cuantizacion) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 1,5 mil millones de parametros derivado de Qwen2.5-Coder-1.5B, la variante pequena de la familia de codigo de Qwen. El fine-tune Isaacwienert/isaacbot se realizo sobre una mezcla de datos de razonamiento, ultrachat y dolly, segun indica la model card del repositorio GGUF. No se especifica el numero de tokens de entrenamiento, la proporcion exacta de cada dataset ni si se aplicaron tecnicas de RLHF, DPO o SFT con preferencias.

La contribucion de este repositorio concreto es la cuantizacion con llama.cpp en 13 variantes, desde F16 (3,0 GB) hasta Q2_K, lo que facilita el despliegue en entornos con memoria limitada. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento extendido en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a asistencia.
- Generacion y explicacion de codigo, heredada del modelo base Qwen2.5-Coder-1.5B.
- Razonamiento basico derivado del entrenamiento sobre datasets de reasoning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ejecucion en runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.

## Casos de uso

- Asistencia de codigo en local: el modelo puede autocompletar y explicar fragmentos de codigo en un portatil sin GPU dedicada, usando la cuantizacion Q4_K_M (recomendada por el autor) con llama.cpp.
- Prototipado rapido de chatbots: al ser un fine-tune conversacional sobre ultrachat y dolly, sirve para validar flujos de dialogo multi-turno antes de invertir en modelos mayores.
- Entornos con recursos restringidos: las variantes Q2_K y Q3_K permiten ejecutar el modelo en dispositivos con menos de 2 GB de RAM libre, util para demos en Raspberry Pi o contenedores ligeros.
- Educacion y experimentacion: investigadores pueden estudiar el efecto del fine-tune sobre Qwen2.5-Coder-1.5B comparando el modelo base con las distintas cuantizaciones.
- Integracion en pipelines de CI/CD para revision de codigo: el modelo puede invocarse desde scripts mediante llama-cli para generar sugerencias o resumenes de diffs, aunque sin garantias de calidad de produccion.
- Generacion de documentacion tecnica: el modelo puede redactar comentarios y descripciones de funciones a partir de fragmentos de codigo, aprovechando su entrenamiento en tareas de codigo y razonamiento.
- Despliegue en LM Studio u Ollama para uso personal: la disponibilidad de 13 cuantizaciones permite ajustar el equilibrio entre calidad y memoria segun el hardware del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (aproximada, segun tamano de archivo declarado y parametros): F16 ~3,0 GB; Q8_0 ~1,6 GB; Q6_K ~1,3 GB; Q5_K_M ~1,1 GB; Q4_K_M ~1,0 GB; Q3_K_M ~0,8 GB; Q2_K ~0,6 GB. Estas cifras son estimaciones a partir del tamano de los pesos y no incluyen el overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090 o superiores permiten ejecutar F16 con holgura. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 2 GB o mas de VRAM para cuantizaciones de 4 bits, y en CPU para todas las variantes.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| isaacbot-GGUF (este) | 1,54 B | no disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Fine-tune de Qwen2.5-Coder-1.5B |
| Qwen2.5-Coder-1.5B | 1,54 B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Modelo base; referencia directa |
| Qwen2.5-1.5B-Instruct | 1,54 B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Alternativa generalista de la misma familia |
| SmolLM2-1.7B-Instruct | 1,7 B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF | Alternativa pequena de otro fabricante |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2.5-Coder y de datasets como ultrachat y dolly, puede heredar sesgos presentes en esos corpus.
- Riesgo de alucinacion: elevado en un modelo de 1,5 B; el autor advierte explicitamente "Evaluate before use".
- Limitaciones de contexto o idioma: la longitud de contexto no esta publicada y los idiomas soportados no se especifican; no se debe asumir un rendimiento multilingue solido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-1.5B y del fine-tune original Isaacwienert/isaacbot.
- Caveats para produccion: el repositorio tiene 0 likes y 593 descargas, sin benchmarks publicados; no se recomienda su uso en produccion sin una evaluacion propia previa. La model card no documenta tool calling ni capacidades de agente, por lo que no deben asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/isaacbot-GGUF
- Modelo base del fine-tune: https://huggingface.co/Isaacwienert/isaacbot
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
