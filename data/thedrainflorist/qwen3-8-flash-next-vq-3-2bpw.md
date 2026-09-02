# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-3.2bpw

## Resumen

TheDrainFlorist/Qwen3.8-Flash-Next-VQ-3.2bpw es una cuantización vectorial (VQ) sin datos del modelo Qwen3.8-Flash-Next de Alibaba, un MoE ultra-sparse multimodal de 180B parámetros totales (125B principales + 51.2B de embeddings n-gram PLE) con 10 de 512 expertos activos por token (6B activos). Esta build reduce el tamaño del checkpoint de 335 GiB (bf16) a 69.4 GiB, manteniendo una fidelidad alta al profesor: KL de 123.5 mnats/tok, acuerdo top-1 del 87.0% y perplexidad de 5.211 frente a 5.166 del bf16. Está diseñada específicamente para Apple Silicon y se ejecuta con `mlx-lm`, aunque requiere una versión con la arquitectura `qwen4_exp` aún no fusionada en el repositorio principal.

El autor, TheDrainFlorist, emplea VQLab para aplicar cuantización vectorial sobre los pesos del modelo bf16, con una mezcla de geometrías: expertos MoE a d=4/K=2048, PLE a d=4/K=2048, y seis capas de mayor apalancamiento (0, 1, 31, 35, 36, 39) actualizadas a d=2/K=256. La torre de visión (0.84 GiB) se mantiene en bf16. Es relevante porque permite ejecutar un modelo de frontera en equipos con 96 GB de memoria unificada, algo que antes era inviable sin cuantizaciones agresivas que degradaban mucho la calidad. El modelo está pensado para desarrolladores que trabajan con MLX en ecosistema Apple y necesitan un equilibrio entre tamaño y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), más PLE (n-gram) y torre de visión; cuantización vectorial (VQ) |
| Parametros totales | 39.610.184.595 (segun safetensors; el modelo base declara 180B totales: 125B + 51.2B PLE) |
| Parametros activos | 6B por token (10 de 512 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Vector-quantization (VQ) a 3.2 bits por peso (3.2bpw); torre de vision en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX), incluye `model.py` con el runtime VQ |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina cuatro ideas principales: Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir historia, Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de largo alcance, un MoE ultra-sparse con 512 expertos (10 activos) y una tabla de embeddings n-gram PLE de 51.2B parámetros. El modelo es multimodal, con una torre de visión de 333 tensores en bf16.

Esta build VQ se entrena sin datos, mediante k-means/Lloyd sobre los pesos del checkpoint bf16 (seed 1234). El autor aplica una mezcla de geometrías: expertos MoE y PLE a d=4/K=2048, y seis capas de alto apalancamiento (0, 1, 31, 35, 36, 39) con d=2/K=256. El proceso de cuantización está documentado en el repositorio VQLab y es reproducible con las herramientas del autor. No se aplica fine-tuning posterior ni RLHF; el modelo es una compresión directa del profesor.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento y generacion de codigo (perplexity en corpus de codigo: 1.939).
- Procesamiento de imagenes gracias a la torre de vision bf16 integrada (configuracion vision_config + image_token_id).
- Ejecucion nativa en Apple Silicon via MLX, sin parches adicionales (el runtime VQ viaja en el checkpoint como `model.py`).
- Soporte para generacion con `mlx-lm` tras instalar la rama con la arquitectura `qwen4_exp` (PR #1788).
- No se documenta soporte explicito para tool calling, function calling ni modos de agente en la informacion disponible.

## Casos de uso

- Inferencia local en Mac Studio o MacBook Pro con 96 GB de memoria unificada: el modelo ocupa 69.4 GiB, lo que permite cargarlo completo en RAM con margen para el runtime y el sistema. Ideal para desarrolladores que necesitan un LLM de alta calidad sin depender de servidores externos.
- Prototipado de aplicaciones de chat y asistentes conversacionales en ingles: con 10 de 512 expertos activos, el throughput es suficiente para interacciones interactivas en hardware Apple.
- Procesamiento de documentos con imagenes: la torre de vision permite analizar capturas, diagramas o fotografias junto con texto, util para herramientas de documentacion tecnica o extraccion de informacion.
- Generacion de codigo asistida en entornos offline: la perplexidad en codigo (1.939) es baja, y el modelo puede integrarse en editores o pipelines de CI/CD locales que requieran privacidad.
- Evaluacion de tecnicas de cuantizacion vectorial: investigadores pueden comparar esta build con las afines (q3, q4, q5, q6, q8) para estudiar el impacto de la VQ en la fidelidad al profesor.
- Despliegue en entornos Apple Silicon con requisitos estrictos de licencia: la licencia qwen-community-1.0 permite uso comercial bajo ciertas condiciones (consultar el texto completo), lo que habilita aplicaciones propietarias en Mac.

## Benchmarks y rendimiento

El autor reporta mediciones de fidelidad frente al profesor bf16 (KL, acuerdo top-1 y perplexidad) sobre un corpus de prosa de 2048 tokens, comparando esta build con conversiones afines propias:

| Build | Tamano | KL al bf16 (mnats/tok) | Acuerdo top-1 | Perplexidad |
|---|---|---|---|---|
| affine q3 (propia) | 75 GiB | 1083.4 | 61.9% | 12.850 |
| **VQ 3.2bpw (este modelo)** | **69.4 GiB** | **123.5** | **87.0%** | **5.211** |
| affine q4 (propia) | 96 GiB | 293.9 | 79.6% | 6.453 |
| affine q5 (propia) | 116 GiB | 91.7 | 87.5% | 5.243 |
| affine q6 (propia) | 137 GiB | 52.8 | 91.6% | 4.916 |
| affine q8 (propia) | 178 GiB | 27.1 | 94.9% | 5.197 |
| bf16 teacher | 335 GiB | 0 | 100% | 5.166 |

Perplexidad adicional: codigo 1.939 (corpus mlx publico), literario 7.823 (Gutenberg); el profesor lee 1.902 y 7.664 respectivamente. El autor advierte que la clasificacion debe hacerse por KL, no por perplexidad, ya que esta ultima puede absorber errores compensados. No se proporcionan resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Memoria unificada: minimo 96 GB para cargar el checkpoint (69.4 GiB) con margen para el runtime y el sistema operativo. El autor menciona explicitamente "96 GB machines".
- Chips: Apple Silicon (M1/M2/M3/M4 en variantes Max o Ultra) con 96 GB o mas; no se requiere GPU NVIDIA.
- VRAM: no aplica en el sentido clasico; la memoria unificada de Apple hace la funcion de VRAM.
- Despliegue: `mlx-lm` con la rama del PR #1788 (arquitectura `qwen4_exp`); el runtime VQ se ejecuta sin parches adicionales. No es compatible con exo para servidores distribuidos.
- Latencia y throughput: no se proporcionan datos numericos en la informacion disponible; depende del chip y de la longitud de secuencia. Con 6B parametros activos, la generacion es viable para uso interactivo en hardware Apple reciente.

## Comparativa con modelos similares

La comparativa mas directa es contra las conversiones afines del mismo autor y el profesor bf16 (ver tabla de benchmarks). Frente a otros modelos MoE cuantizados para Apple Silicon, no se dispone de datos publicados en la informacion proporcionada.

| Modelo | Tamano | Parametros activos | Contexto | Fidelidad (KL) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (bf16) | 335 GiB | 6B | no disponible | 0 (referencia) | qwen-community-1.0 |
| VQ 3.2bpw (este modelo) | 69.4 GiB | 6B | no disponible | 123.5 | qwen-community-1.0 |
| affine q4 (mismo autor) | 96 GiB | 6B | no disponible | 293.9 | qwen-community-1.0 |
| affine q8 (mismo autor) | 178 GiB | 6B | no disponible | 27.1 | qwen-community-1.0 |

No se dispone de comparativas con modelos de otros autores en la informacion disponible.

## Limitaciones y advertencias

- Requiere una version no publicada de `mlx-lm` (PR #1788) con la arquitectura `qwen4_exp`; con la version estable de pip fallara con `ModuleNotFoundError`.
- No es compatible con exo para servir distribuido; solo funciona en una unica maquina Apple Silicon.
- El modelo solo soporta ingles; no se documentan capacidades multilingues.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- La cuantizacion VQ introduce perdida de fidelidad respecto al bf16 (KL de 123.5 mnats/tok, acuerdo top-1 del 87%), lo que puede manifestarse en alucinaciones o errores en tareas de alta precision.
- El autor no proporciona benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que la comparacion con otros modelos cuantizados es limitada.
- La torre de vision se mantiene en bf16, lo que incrementa el tamano total y el consumo de memoria; no se ha optimizado la parte visual.
- El modelo fue publicado en agosto de 2026 (segun la fecha de creacion), por lo que puede requerir versiones recientes de MLX; no se garantiza compatibilidad hacia atras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-3.2bpw
- Modelo base (HuggingFace): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base (GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- PR de mlx-lm para la arquitectura qwen4_exp: https://github.com/ml-explore/mlx-lm/pull/1788
- Herramienta VQLab: https://github.com/noahzelezny/VQLab
- Recetas de despliegue con vLLM (para el modelo base): https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
