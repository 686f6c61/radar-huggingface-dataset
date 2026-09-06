# thomasgardiner/Qwen3.8-27B-NVFP4-all

## Resumen

Qwen3.8-27B-NVFP4-all es un checkpoint cuantizado del modelo Qwen/Qwen3.8-27B, publicado por thomasgardiner. Se construye sobre RadixArk/Qwen3.8-27B-NVFP4, al que sustituye las 208 proyecciones lineales que estaban en FP8 por NVFP4, reduciendo el tamaño de 20,6 GB a 18 GB y aumentando el rendimiento de decodificación entre un 13% y un 17% en una RTX 5090. La arquitectura es híbrida: Gated DeltaNet y atención completa en 64 capas. El checkpoint expone 14.982.247.152 parámetros, a pesar de la nomenclatura "27B" del modelo base. No se especifica la longitud de contexto en la información disponible.

El objetivo principal es ofrecer una versión más compacta y rápida para inferencia en GPU de consumo, manteniendo la precisión. Las evaluaciones muestran una ligera mejora en GSM8K y MATH-500 frente al checkpoint base, con una reducción del tiempo por token en workloads de una sola petición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + atención completa, 64 capas |
| Parametros totales | 14.982.247.152 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (bloque 16, escalas E4M3) + bf16 (mixta) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards) |
| Tamaño de los pesos | 18 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que combina capas de Gated DeltaNet con capas de atención completa, con un total de 64 capas. No se proporcionan datos sobre el preentrenamiento o ajuste fino del modelo base en la información disponible.

El proceso de cuantización de este checkpoint es la innovación principal. Los pesos se cuantizaron desde el release bf16 de Qwen3.8-27B, no desde los tensores FP8 del checkpoint base. Las 208 proyecciones lineales que RadixArk mantenía en FP8 se almacenan ahora en NVFP4 con un esquema simétrico por bloques de tamaño 16, escalas de bloque E4M3 y una escala global FP32 por tensor. Las activaciones usan una escala estática por tensor, calculada como la escala FP8 del checkpoint base dividida entre 6. No se realizó nueva calibración: se reutilizó la calibración de Model Optimizer sobre 1.024 muestras de cnn_dailymail a 512 tokens. Los tensores MLP y lm_head son byte-idénticos al checkpoint base, mientras que in_proj_a, in_proj_b, convoluciones, normas, embeddings y la cabeza mtp permanecen en bf16.

## Capacidades

- Generación de texto conversacional, con modo de razonamiento ("thinking") disponible en el modelo base y habilitado en las evaluaciones.
- Razonamiento matemático: en las evaluaciones sobre las primeras 100 muestras de GSM8K y MATH-500, obtiene un 88,0% y un 64,0% respectivamente.
- Soporte de decodificación especulativa mediante el algoritmo DFLASH, con el modelo borrador incoai/Qwen3.8-27B-DFlash2 y 8 tokens de borrador.
- No se documenta tool calling en la model card; para agentes es necesario validarlo.
- El modelo base es vision-language (imagen y vídeo), pero este checkpoint se presenta como text/text; la compatibilidad con visión no se ha verificado en la versión cuantizada.
- Idiomas soportados no especificados.

## Casos de uso

- Chat local en GPU de consumo: con SGLang y el parche b12x, el modelo alcanza ~215 tok/s en MT-Bench en una RTX 5090, lo que permite asistentes personales de baja latencia sin depender de la nube.
- Resolución de problemas matemáticos en aplicaciones educativas: los resultados en GSM8K y MATH-500 lo hacen apto para generar y verificar ejercicios paso a paso, siempre que se valide el formato de salida.
- Investigación de técnicas de cuantización: sirve como caso de estudio para comparar NVFP4 frente a FP8 en la misma arquitectura, con datos de throughput y accuracy publicados.
- Prototipado de agentes con razonamiento multi-step: el modo "thinking" del modelo base permite cadenas de razonamiento; sin embargo, el soporte de tool calling no está documentado y requiere pruebas adicionales.
- Despliegue en aplicaciones de una sola petición: la configuración `--max-running-requests 1` está optimizada para workloads single-user, como asistentes en terminal o editores de código con una ventana de conversación activa.
- Evaluación de rendimiento en GPUs SM120 (Blackwell consumer): el modelo demuestra la viabilidad de NVFP4 con FlashInfer en esta arquitectura, útil para diseñar pipelines de inferencia eficientes en hardware de consumo.

## Benchmarks y rendimiento

Las pruebas se realizaron con una RTX 5090, SGLang con el parche b12x, modelo borrador DFlash2, 8 tokens de borrador, greedy, thinking activado, max_tokens 1024 y una sola petición a la vez. La accuracy es un match sobre la respuesta final bajo el límite de 1024 tokens, aplicado de forma idéntica a ambos modelos.

| Benchmark | RadixArk/Qwen3.8-27B-NVFP4 | Qwen3.8-27B-NVFP4-all | Recovery |
| --- | ---: | ---: | ---: |
| GSM8K (test, first 100) | 87,0 | 88,0 | 101,1% |
| MATH-500 (first 100) | 62,0 | 64,0 | 103,2% |

| Workload | RadixArk/Qwen3.8-27B-NVFP4 | Qwen3.8-27B-NVFP4-all | Change |
| --- | ---: | ---: | ---: |
| MT-Bench, first turn, 80 prompts | 190,5 tok/s | 215,1 tok/s | +12,9% |
| GSM8K, 100 prompts | 264,0 tok/s | 309,2 tok/s | +17,1% |
| MATH-500, 100 prompts | 261,6 tok/s | 303,2 tok/s | +15,9% |
| bench_serving, random ISL 8192 / OSL 1024, concurrency 1 | 196,2 tok/s, TPOT 4,31 ms | 263,9 tok/s, TPOT 3,12 ms | +34,5% |

No se han publicado resultados para HumanEval ni para tamaños de lote superiores a 1.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 18 GB; para inferencia con SGLang y decodificación especulativa se estima una necesidad de al menos 24 GB de VRAM, basado en el tamaño de los pesos y las activaciones de una sola petición.
- GPU recomendada: RTX 5090 (SM120) con el parche b12x de FlashInfer para NVFP4. También es probable que funcione en otras GPUs con soporte NVFP4 (Ada, Hopper, Blackwell), pero no está documentado.
- Opciones de despliegue: SGLang con FlashInfer (recomendado), decodificación especulativa DFLASH; no se documenta soporte para vLLM, llama.cpp u Ollama en esta versión.
- Latencia y throughput: en MT-Bench 215,1 tok/s; en GSM8K 309,2 tok/s; en bench_serving con ISL 8192 y OSL 1024, 263,9 tok/s y TPOT 3,12 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto | Licencia |
| --- | --- | --- | --- | --- | --- |
| thomasgardiner/Qwen3.8-27B-NVFP4-all | 14,98B | NVFP4 + bf16 | 18 GB | no disponible | Apache-2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | 14,98B | NVFP4 (con FP8 en proyecciones) | 20,6 GB | no disponible | Apache-2.0 |
| Qwen/Qwen3.8-27B | 14,98B | bf16 | no disponible | no disponible | Apache-2.0 |

El modelo all presenta una mejora de throughput del +12,9% al +17,1% frente a RadixArk, con una accuracy ligeramente superior en GSM8K y MATH-500. Existe también una cuantización similar publicada por unsloth (unsloth/Qwen3.8-27B-NVFP4), pero no se dispone de especificaciones ni benchmarks en la información consultada.

## Limitaciones y advertencias

- El rendimiento solo se ha validado con una petición a la vez; no hay datos para cargas concurrentes ni tamaños de lote superiores a 1.
- No se han publicado benchmarks de HumanEval ni de otras tareas de código, por lo que no se puede evaluar su capacidad de generación de código.
- La cuantización NVFP4 se realizó sin nueva calibración, reutilizando la calibración del checkpoint base (1.024 muestras de cnn_dailymail). Puede degradar el rendimiento en dominios alejados de esa distribución.
- El checkpoint depende del parche b12x en SM120; sin él, los GEMMs NVFP4 usan CUTLASS y el throughput se reduce.
- La model card no especifica idiomas; el soporte multilingüe no está garantizado.
- La entrada multimodal (imagen/vídeo) del modelo base no está verificada en esta versión cuantizada.
- Riesgo de alucinación inherente; no se ha realizado una evaluación específica de seguridad o sesgos en este checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/thomasgardiner/Qwen3.8-27B-NVFP4-all
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint base RadixArk: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Modelo borrador para decodificación especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio con el parche SM120 para SGLang: https://github.com/thomgardiner/sglang-sm120-nvfp4
- Cuantización similar de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
