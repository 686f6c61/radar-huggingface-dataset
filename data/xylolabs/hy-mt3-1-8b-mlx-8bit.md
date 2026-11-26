# Xylolabs/Hy-MT3-1.8B-MLX-8bit

## Resumen

Hy-MT3-1.8B-MLX-8bit es una cuantización en 8 bits del modelo de traducción automática tencent/Hy-MT3-1.8B, publicada por Xylolabs y convertida al formato MLX para su uso con la librería mlx-lm en hardware Apple Silicon. El modelo base, desarrollado por Tencent, es un transformer denso de 1.800 millones de parámetros especializado en traducción multilingüe, con soporte declarado para 102 idiomas. Esta versión cuantizada emplea cuantización afín con tamaño de grupo 64, escalas y sesgos en float16, y aplica 8 bits tanto a las matrices lineales como al embedding de tokens y a la cabeza LM.

El interés de esta ficha radica en que ofrece una alternativa de traducción de alta cobertura lingüística que cabe en 1,9 GB de disco y puede ejecutarse íntegramente en memoria unificada de un Mac, con una ventana de contexto declarada de 256K tokens. Frente a la versión BF16 (3,58 GB), la cuantización a 8 bits conserva prácticamente toda la calidad: la divergencia KL frente a BF16 en WikiText-2 es de 0,000859 y el chrF++ medio en WMT24++ cae solo 0,20 puntos (41,64 frente a 41,84).

Es relevante ahora porque permite desplegar traducción multilingüe de calidad casi BF16 en portátiles y equipos de sobremesa Apple sin GPU dedicada, un escenario hasta hace poco reservado a servidores. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo `hunyuan_v1_dense`), cuantizado en MLX |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantizacion | MLX 8-bit afín, group size 64, escalas y sesgos en float16; existe variante MLX 4-bit del mismo autor |
| Idiomas soportados | 102 idiomas, entre ellos es, en, zh, fr, de, it, pt, ja, ko, ru, ar, hi, entre otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx`; repo de 1,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 1,8B parámetros identificado en los tags como `hunyuan_v1_dense`, la familia de arquitecturas de Tencent Hunyuan. Esta publicación no entrena el modelo: es una conversión de pesos a MLX con cuantización afín de 8 bits (group size 64), aplicada a todas las matrices lineales, al embedding de tokens y a la cabeza LM, manteniendo las capas de normalización en float16. La model card no detalla la composición del dataset de entrenamiento del modelo base, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la ficha de tencent/Hy-MT3-1.8B y no se reproducen aquí.

La innovación técnica de esta publicación es la propia cuantización y su evaluación: el autor reporta divergencia KL frente a BF16 sobre WikiText-2, datos de chat y texto reservado, además de chrF++ sobre 1.200 segmentos de WMT24++ en seis direcciones (en-zh, zh-en, en-ko, ko-en, en-ja, ja-en). El resultado principal es que a 8 bits la pérdida de calidad es marginal (top-1 del 98,2-99,0 % frente a BF16), mientras que a 4 bits la degradación es apreciable (KL de 0,13-0,21 y top-1 del 77-83 %). No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Traducción automática entre 102 idiomas, con especial cobertura de lenguas asiáticas (zh, ja, ko, th, vi, km, my), europeas (es, fr, de, it, pt, nl, pl, ru, uk) y de bajos recursos (bo, ug, yue, ceb, war, mg, ht).
- Traducción bidireccional: la model card evalúa tanto direcciones hacia el inglés como desde el inglés.
- Instrucciones en lenguaje natural para controlar la salida (por ejemplo, "Translate the following text into English. Note that you should only output the translated result without any additional explanation").
- Generación de texto condicionada por prompt, al ser un modelo de lenguaje completo con cabeza LM cuantizada.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe amplia pero sin evaluación publicada por idioma más allá de las seis direcciones de WMT24++ reportadas.

## Casos de uso

- Traducción de documentación técnica en local: un equipo puede traducir manuales y README de inglés a español o a chino ejecutando el modelo en un Mac con mlx-lm, sin enviar contenido propietario a servicios en la nube, gracias al formato MLX y a los 1,9 GB de pesos.
- Localización de productos para mercados asiáticos: las direcciones en-zh, en-ko y en-ja son las evaluadas con chrF++ en la model card (31,86-34,25 en salida desde inglés), lo que permite estimar la calidad esperada antes de adoptarlo en un pipeline de localización.
- Traducción por lotes en estaciones de trabajo Apple: con 256K tokens de contexto declarado, se pueden procesar documentos largos o lotes de segmentos en una sola pasada sin trocear, reduciendo el coste de orquestación.
- Preprocesado multilingüe para investigación: normalizar corpus en lenguas de bajos recursos (bo, ug, yue, ceb, war) antes de análisis lingüístico, aprovechando la cobertura de 102 idiomas con una licencia Apache 2.0 que permite redistribuir derivados.
- Prototipado rápido de funciones de traducción en aplicaciones macOS/iOS: la integración con mlx-lm 0.32.2 permite validar la calidad de traducción en el propio dispositivo antes de decidir si se escala a un servidor con la versión BF16.
- Sustitución de la versión BF16 en entornos con memoria limitada: al ocupar 1,9 GB frente a 3,58 GB y conservar un chrF++ de 41,64 frente a 41,84, es adecuado cuando la memoria unificada es el recurso escaso y la pérdida de 0,20 puntos es aceptable.
- Traducción interactiva de conversaciones multi-turno: el formato de prompt con instrucciones explícitas permite integrarlo en un chat de atención al cliente que traduzca mensajes entrantes en tiempo real en un portátil.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. KL se mide frente a BF16; chrF++ es la media de seis direcciones sobre 1.200 segmentos de WMT24++.

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | chrF++ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 1,04 GB | 0,172997 | 77,706 % | 0,136311 | 82,510 % | 0,205585 | 77,353 % | 40,83 |
| MLX 8-bit | 1,90 GB | 0,000859 | 98,225 % | 0,000559 | 98,961 % | 0,000940 | 98,529 % | 41,64 |
| BF16 | 3,58 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 41,84 |

chrF++ por dirección:

| Cuantización | en-zh | zh-en | en-ko | ko-en | en-ja | ja-en |
|---|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 33,55 | 50,25 | 33,05 | 51,01 | 30,10 | 47,00 |
| MLX 8-bit | 34,25 | 50,27 | 34,14 | 51,73 | 31,86 | 47,58 |
| BF16 | 34,54 | 50,24 | 34,10 | 51,63 | 32,81 | 47,71 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con un modelo especializado en traducción.

## Requisitos de hardware

- VRAM/memoria: 1,9 GB de pesos en 8 bits; con overhead de mlx-lm y caché KV para contexto largo, se recomienda al menos 8 GB de memoria unificada para uso cómodo.
- Hardware validado en la model card: Mac Studio M5 Max (32 y 40 núcleos GPU) y M5 Ultra (80 núcleos GPU), con configuraciones de 36 GB a 512 GB de memoria unificada, todos con contexto declarado de 256K.
- GPU dedicadas: no se documenta soporte para CUDA, ROCm ni GPUs NVIDIA/AMD; el formato MLX está orientado a Apple Silicon.
- Cabe en consumer hardware: sí, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; también en iPhone/iPad recientes vía MLX, aunque no se documenta en la model card.
- Despliegue: `mlx-lm==0.32.2` con `mlx_lm.generate`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ (WMT24++) | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Xylolabs/Hy-MT3-1.8B-MLX-8bit | 1,8B | 256K | 41,64 | Apache 2.0 | safetensors MLX |
| tencent/Hy-MT3-1.8B (BF16) | 1,8B | no disponible | 41,84 | Apache 2.0 | safetensors |
| Xylolabs/Hy-MT3-1.8B-MLX-4bit | 1,8B | 256K | 40,83 | Apache 2.0 | safetensors MLX |

La comparación con alternativas de otros autores (por ejemplo, modelos de traducción de la familia NLLB o M2M-100) no está disponible en la información proporcionada, ya que no se aportan sus métricas en WMT24++ ni sus especificaciones en esta ficha.

## Limitaciones y advertencias

- Solo se evalúan seis direcciones de traducción (en-zh, zh-en, en-ko, ko-en, en-ja, ja-en); la calidad en el resto de los 102 idiomas declarados, incluido el español, no está medida en la model card.
- La evaluación se limita a 1.200 segmentos de WMT24++; no hay evaluación en dominios especializados (legal, médico, técnico) ni en texto conversacional informal.
- Riesgo de alucinación y de omisión de contenido en segmentos largos: no se documentan mecanismos de control de fidelidad más allá del prompt.
- La cuantización a 4 bits degrada notablemente la calidad (KL de 0,13-0,21, top-1 del 77-83 %); para producción se recomienda la variante de 8 bits.
- Restricción de plataforma: el formato MLX solo se ejecuta en Apple Silicon; no es portable a servidores x86 con GPU NVIDIA sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE.txt` y `NOTICE` según indica la model card.
- El modelo base es de Tencent; las condiciones y datos de entrenamiento originales deben consultarse en tencent/Hy-MT3-1.8B, no en esta conversión.
- No se documentan sesgos específicos por idioma ni evaluaciones de robustez frente a texto adversario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Librería MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantización del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfica de KL por tamano de fichero: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-8bit/resolve/main/accuracy-kl.png
- Gráfica de chrF++ por tamano de fichero: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-8bit/resolve/main/accuracy-chrf.png
