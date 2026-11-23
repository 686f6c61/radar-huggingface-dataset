# Tostibrown/Inkling-2-Mini-Mei-Vocab-Q4

## Resumen

Inkling-2-Mini-Mei-Vocab-Q4 es una cuantización de 4 bits del modelo Inkling-2-Mini publicado por Thinking Machines Lab bajo licencia Apache 2.0, adaptada por el usuario Tostibrown para inferencia de texto nativa en Mei sobre Apple Silicon mediante la librería MLX. El bundle mantiene la arquitectura y el tokenizador del checkpoint original, pero reduce el peso de las tablas de embedding de entrada y proyección de salida mediante cuantización afín de 4 bits en grupos de 64, mientras que los expertos enrutados conservan la precisión de entrenamiento (NVFP4 en las capas físicas 0-19 y MXFP8 en las capas 20-23).

El modelo cuenta con 26.388.641.280 parámetros totales según los safetensors del repositorio, que ocupa 18,2 GB, de los cuales 18.194.297.856 bytes corresponden a datos tensoriales distribuidos en cuatro shards. La reducción de 1,24 GiB respecto al checkpoint original proviene exclusivamente de la cuantización del vocabulario de entrada y la proyección de salida. Está pensado como un perfil opcional de menor memoria para ejecutar el modelo en equipos con 32 GiB de memoria unificada, a costa de una ligera pérdida de calidad medible en la suite de tareas del autor.

La relevancia de esta ficha radica en que documenta un caso de cuantización selectiva sobre un modelo de gran tamaño para hardware de consumo Apple, con métricas de compromiso publicadas (calidad, memoria pico y velocidad de decodificación) y un proceso de conversión reproducible con hashes verificables. No obstante, la información pública es escasa: no se detallan idiomas soportados, benchmarks estándar ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) enrutados; capas físicas 0-19 en NVFP4 y 20-23 en MXFP8; layout MLX con expertos empaquetados |
| Parámetros totales | 26.388.641.280 |
| Parámetros activos | no disponible |
| Longitud de contexto | Objetivo de 26.624 tokens en M1 Max de 32 GiB; se completó una petición de 32.768 tokens; 65.536 superó el presupuesto de 24 GiB del experimento |
| Tipos de cuantización | 4 bits afín en grupos de 64 para embedding de entrada y proyección de salida; expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 18.194.297.856 bytes de datos tensoriales); librería mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) según la estructura de capas descrita en la model card: los expertos enrutados se distribuyen en capas físicas 0-19 con precisión NVFP4 y en capas 20-23 con MXFP8, lo que sugiere una organización por bloques con distinta precisión según la profundidad. El bundle emplea el layout MLX empaquetado para los expertos, junto con el tokenizador y la plantilla de chat originales. La cuantización se aplica solo a la tabla de embedding de entrada y a la proyección de salida, convertidas directamente desde los tensores BF16 del publicador, y se realiza por filas en la CPU en lotes de 1.024 mediante el script `tools/quantize_inkling_vocab.py`, que verifica los hashes del shard del publicador y del manifiesto de layout antes de procesar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el checkpoint original. La model card tampoco documenta innovaciones de decodificación especulativa ni mecanismos de atención lineal; el perfil de texto ejecuta una generación a la vez. La reproducibilidad está garantizada mediante `conversion.json` (revisiones del checkpoint y layout, receta de cuantización, versión del conversor y hashes) y `checksums.json` (SHA-256 por shard), con la versión de Mei fijada en el commit `d7402db0e35eb9cde969aa1a621de3c03ec1c7e5` y dependencias `mlx==0.32.4` y `numpy==2.5.5`.

## Capacidades

- Generación de texto en modo nativo sobre Apple Silicon mediante MLX, con una generación simultánea por proceso.
- Razonamiento y resolución de tareas de la suite histórica del autor: 20/25 en el bundle cuantizado frente a 22/25 del original en un M1 Max de 32 GiB.
- Uso de herramientas y casos de cordura de modelo-herramienta: 7/10 superados en el bundle cuantizado.
- Tareas domésticas simuladas: 10/12 casos superados.
- Automatización con Python: 3/3 casos superados.
- Ejercicios de programación adicionales retenidos: ambos checkpoints (original y cuantizado) los superaron.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente local de texto en Mac con 32 GiB de memoria unificada: el perfil cuantizado permite ejecutar un modelo de 26.388 millones de parámetros con un pico de memoria de 20,19-20,21 GiB, dejando margen para el sistema operativo y otras aplicaciones en un M1 Max.
- Automatización de tareas domésticas simuladas: el bundle supera 10 de 12 casos de la suite doméstica del autor, por lo que puede emplearse en agentes que gestionan listas, recordatorios y flujos de hogar con contexto conversacional.
- Generación y revisión de scripts de Python: con 3/3 casos de automatización Python superados y los ejercicios adicionales de programación aprobados, es adecuado para pipelines locales de generación de código y pruebas automatizadas.
- Integración en flujos con llamada a herramientas: los 7/10 casos de modelo-herramienta superados permiten usar el modelo como planificador que invoca funciones externas en un agente local, siempre con validación adicional en producción.
- Procesamiento de documentos largos con recuperación: el objetivo de 26.624 tokens en M1 Max de 32 GiB y el prefill de 173 segundos cerca de esa ventana permiten resumir o extraer información de contratos y manuales extensos en local, aceptando la latencia de prefill.
- Prototipado e investigación en MLX: al ser un bundle reproducible con hashes y script de conversión, sirve para estudiar el impacto de la cuantización selectiva del vocabulario en calidad y memoria sin salir del ecosistema Apple.
- Despliegue de bajo consumo en equipos de sobremesa Apple: la decodificación de 24,52 tokens/s en prompts cortos y 20,44 tokens/s a 2.048 tokens de prompt hace viable la interacción en tiempo real para chat y edición asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas internas del autor:

| Métrica | Original | Bundle Q4 |
|---|---|---|
| Suite histórica de tareas (sobre 25) | 22/25 | 20/25 |
| Casos modelo-herramienta y cordura (sobre 10) | no disponible | 7/10 |
| Casos domésticos (sobre 12) | no disponible | 10/12 |
| Casos de automatización Python (sobre 3) | no disponible | 3/3 |
| Ejercicios de programación retenidos | superados | superados |
| Memoria pico (GiB) | 21,48-21,95 | 20,19-20,21 |
| Decodificación mediana, prompt corto (tokens/s) | 23,85 | 24,52 |
| Decodificación mediana, prompt de 2.048 tokens (tokens/s) | 20,21 | 20,44 |
| Prefill cerca de 26.624 tokens (s) | no disponible | 173 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de 20,19-20,21 GiB en el bundle cuantizado, frente a 21,48-21,95 GiB del original, medido en un M1 Max de 32 GiB.
- GPU recomendadas: Apple Silicon con memoria unificada de al menos 32 GiB para el perfil objetivo; el experimento fija un presupuesto de proceso de 24 GiB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de 32 GiB; no hay datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: MLX 0.32.4 con Python 3.12 y NumPy 2.5.5 mediante `uv`; el runtime Mei en el commit `d7402db0e35eb9cde969aa1a621de3c03ec1c7e5`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificación mediana de 24,52 tokens/s en prompts cortos y 20,44 tokens/s a 2.048 tokens de prompt; prefill de 173 segundos cerca de la ventana de 26.624 tokens. Una petición de 32.768 tokens se completó; 65.536 superó el presupuesto de 24 GiB. Las máquinas mayores pueden fijar un total explícito con `--context-cap`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Mei-Vocab-Q4 (este) | 26.388.641.280 | objetivo 26.624 tokens; 32.768 completado | 4 bits selectiva (embedding y proyección), NVFP4/MXFP8 en expertos | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: 20/25 frente a 22/25 en la suite histórica de tareas, y 7/10 en casos de modelo-herramienta; no debe asumirse paridad con el checkpoint original.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor solo reporta casos de cordura, sin evaluación específica de factualidad.
- Limitaciones de contexto: el objetivo de 26.624 tokens exige 173 segundos de prefill en M1 Max; 65.536 tokens supera el presupuesto de 24 GiB del experimento y requiere `--context-cap` explícito en máquinas mayores.
- Una sola generación simultánea por proceso: el perfil de texto no está diseñado para servir peticiones concurrentes.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el bundle depende del checkpoint original de Thinking Machines Lab y de la conversión MLX de la comunidad nativ-community, cuyos términos deben verificarse por separado.
- Reproducibilidad dependiente de versiones fijas: MLX 0.32.4, NumPy 2.5.5 y el commit concreto de Mei; cambios de versión pueden alterar el comportamiento.
- Sin pipeline declarado, 0 descargas y 0 likes: el soporte de la comunidad es nulo y no hay validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Tostibrown/Inkling-2-Mini-Mei-Vocab-Q4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio Mei (commit de referencia): https://github.com/search?q=d7402db0e35eb9cde969aa1a621de3c03ec1c7e5
- Script de conversión: `tools/quantize_inkling_vocab.py` (incluido en el repositorio Mei)
- Metadatos de conversión: `conversion.json` y `checksums.json` (incluidos en el repositorio de Hugging Face)
