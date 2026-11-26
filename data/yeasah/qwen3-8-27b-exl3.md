# yeasah/Qwen3.8-27B-exl3

## Resumen

yeasah/Qwen3.8-27B-exl3 es una familia de cuantizaciones EXL3 del modelo Qwen/Qwen3.8-27B, publicada por el usuario yeasah. No se trata de un modelo entrenado desde cero, sino de un conjunto de checkpoints comprimidos con la técnica EXL3 (ExLlamaV3) que preservan las capacidades del modelo base a un coste de almacenamiento y VRAM muy inferior. El repositorio contiene múltiples revisiones correspondientes a distintas tasas de bits por peso (bpw), desde 2,50 hasta 6,00, lo que permite elegir el equilibrio entre calidad y huella de memoria.

El modelo base es multimodal (pipeline image-text-to-text), de 27B parámetros y licencia Apache 2.0. Las cuantizaciones están calibradas específicamente para cargas de trabajo agénticas y de programación, usando como material de calibración documentos, salidas de herramientas, código, diffs y las propias respuestas del modelo, en lugar de texto web genérico. La asignación de bits se realiza por tensor según la sensibilidad medida en las respuestas del modelo, manteniendo el mismo tamaño total que una asignación uniforme.

La relevancia actual radica en que permite desplegar un modelo de 27B con capacidades multimodales y agénticas en GPUs de consumo, con tan solo 7,88 GiB de VRAM para la variante de 2,50 bpw y 17,94 GiB para la de 6,00 bpw. El repositorio se actualizó en noviembre de 2026 con mejoras en la cuantización de embeddings y una nueva tasa de 2,50 bpw.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,50, 3,00, 3,50, 4,00, 5,00 y 6,00 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | EXL3 (compatible con exllamav3 y vLLM mediante vllm-exl3-plugin) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal (image-text-to-text) de 27B parámetros. No se dispone de información detallada sobre su arquitectura interna (número de capas, dimensiones, mecanismo de atención) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada.

Las cuantizaciones EXL3 aplican una asignación de bits por tensor basada en la sensibilidad medida del modelo en sus propias respuestas, manteniendo el mismo tamaño total que una asignación uniforme. La calibración se realizó sobre documentos, salidas de herramientas, código, diffs y respuestas del modelo, con evaluación primaria en tareas agénticas y de programación. Los embeddings de tokens también están cuantizados, lo que requiere exllamav3 1.6.4 o superior y reduce el tamaño en disco entre 1,6 y 1,9 GiB en todas las tasas. Se evaluó y descartó la técnica two-sided LDLQ (YAQA) por no compensar la mejora en métricas de divergencia frente al coste en recall de hechos.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo base es multimodal.
- Generación de código y trabajo con diffs: la calibración está orientada explícitamente a código y programación.
- Flujos agénticos: calibrado y evaluado con cargas de trabajo agénticas como caso de uso primario.
- Soporte de tool calling: no confirmado explícitamente en la información disponible, aunque la calibración incluye salidas de herramientas.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de programación en local: la variante de 3,00 bpw (9,30 GiB de VRAM) permite ejecutar un modelo de 27B en una GPU de consumo para autocompletado, revisión de diffs y generación de código, gracias a la calibración específica sobre código y diffs.
- Agentes autónomos con tool calling: la calibración sobre salidas de herramientas y conversaciones multi-turno hace que estas cuantizaciones sean adecuadas para pipelines agénticos donde el modelo lee documentos, ejecuta herramientas e interpreta resultados.
- Procesamiento de documentos con imágenes: al ser un modelo image-text-to-text, puede usarse para extraer información de capturas, diagramas o documentos escaneados en entornos con VRAM limitada.
- Despliegue en servidores con vLLM: mediante vllm-exl3-plugin, la variante de 6,00 bpw (17,94 GiB de VRAM) ofrece una calidad casi idéntica al modelo sin cuantizar (+0,04% de perplejidad) para servir peticiones en producción.
- Evaluación e investigación en hardware modesto: las tasas de 2,50 y 3,00 bpw permiten estudiar el comportamiento de un modelo de 27B en una única GPU consumer, con una degradación de perplejidad de +3,17% y +1,42% respectivamente.
- Sustitución de cuantizaciones GGUF en flujos ExLlamaV3: para usuarios que ya usan exllamav3 y necesitan un modelo multimodal de 27B, estas revisiones ofrecen una alternativa calibrada frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

Los datos publicados son métricas de cuantización (divergencia KL y perplejidad), no benchmarks de tareas estándar como MMLU o HumanEval.

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Delta perplejidad |
|---|---|---|---|---|
| 2,50 | 9,54 GiB | 7,88 GiB | 0,0305 | +3,17% |
| 3,00 | 10,96 GiB | 9,30 GiB | 0,0136 | +1,42% |
| 3,50 | 12,37 GiB | 10,71 GiB | 0,0074 | +0,78% |
| 4,00 | 13,94 GiB | 12,28 GiB | 0,0037 | +0,37% |
| 5,00 | 16,92 GiB | 15,11 GiB | 0,0009 | +0,12% |
| 6,00 | 19,75 GiB | 17,94 GiB | 0,0002 | +0,04% |
| base | 51,75 GiB | — | — | — |

Comparación con otras cuantizaciones del mismo modelo (turboderp/Qwen3.8-27B-exl3, SCP):

| BPW | Compuesto vs mejor otro quant | Comparado con | Diferencia de tamano | Peor slice |
|---|---|---|---|---|
| 2,50 | 0,99 | SCP_2.20bpw | +1,14 GiB (+17,0%) | 1,25 |
| 3,00 | 0,87 | SCP_3.00bpw | +0,15 GiB (+1,6%) | 1,18 |
| 3,50 | 0,93 | SCP_4.00bpw | -1,42 GiB (-11,7%) | 1,08 |
| 4,00 | 0,93 | SCP_4.00bpw | +0,15 GiB (+1,2%) | 1,20 |
| 5,00 | 0,92 | SCP_5.00bpw | +0 MiB (+0,0%) | 1,13 |
| 6,00 | 0,96 | SCP_6.00bpw | -1 MiB (-0,0%) | 1,14 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (vLLM con vllm-exl3-plugin): 7,88 GiB (2,50 bpw), 9,30 GiB (3,00 bpw), 10,71 GiB (3,50 bpw), 12,28 GiB (4,00 bpw), 15,11 GiB (5,00 bpw), 17,94 GiB (6,00 bpw). La VRAM real consumida puede ser significativamente menor según la configuración.
- GPU recomendadas: no especificadas en la información disponible. Por los requisitos de VRAM, las variantes de 2,50 a 4,00 bpw caben en GPUs consumer de 12-16 GB (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090); las de 5,00 y 6,00 bpw requieren 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: sí, al menos las variantes de 2,50 a 4,00 bpw en GPUs de 12 GB o más.
- Opciones de despliegue: exllamav3 (versión 1.6.4 o superior para embeddings cuantizados) y vLLM mediante vllm-exl3-plugin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yeasah/Qwen3.8-27B-exl3 | 27B | no disponible | EXL3 | apache-2.0 | Calibrado para agentes y código; 2,50-6,00 bpw |
| turboderp/Qwen3.8-27B-exl3 | 27B | no disponible | EXL3 | apache-2.0 | Cuantización alternativa del mismo base (SCP); comparado en la model card |
| unsloth/Qwen3.8-27B-GGUF | 27B | no disponible | GGUF | apache-2.0 | Cuantización GGUF del mismo base, evaluada en las mismas métricas |
| Qwen/Qwen3.8-27B-fp8 | 27B | no disponible | FP8 | apache-2.0 | Checkpoint oficial en FP8 del modelo base |

## Limitaciones y advertencias

- Al ser una cuantización, introduce degradación respecto al modelo sin cuantizar: incluso a 6,00 bpw hay un +0,04% de perplejidad y un exceso de KLD de 0,0002; a 2,50 bpw la degradación sube a +3,17% de perplejidad.
- La asignación de bits está optimizada para cargas agénticas y de código; el rendimiento en otras tareas (por ejemplo, texto creativo o idiomas distintos del inglés) puede degradarse más de lo que indican las métricas publicadas.
- El "peor slice" de la comparativa es "the model's own voice", con ratios de hasta 1,25 a 2,50 bpw, lo que indica mayor divergencia en el estilo propio del modelo.
- Requiere exllamav3 1.6.4 o superior por la cuantización de embeddings; versiones anteriores no son compatibles.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura de idiomas ni limitaciones específicas del modelo base en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen/Qwen3.8-27B, de la que depende.
- La VRAM indicada corresponde a vLLM con el plugin; el consumo real puede variar según la configuración de offloading y el espacio de KV cache necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/Qwen3.8-27B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- exllamav3: https://github.com/turboderp-org/exllamav3
- vllm-exl3-plugin: https://github.com/yeasah/vllm-exl3-plugin
- Cuantización alternativa: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Cuantización GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-fp8
- Documentación técnica del repositorio: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/blob/main/TECHNICAL.md
