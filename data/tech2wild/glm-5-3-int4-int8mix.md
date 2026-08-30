# Tech2wild/GLM-5.3-Int4-Int8Mix

## Resumen

GLM-5.3-Int4-Int8Mix es una cuantización mixta de precisión Int4/Int8 del modelo GLM-5.3 de z.ai, creada por el usuario Tech2wild. El modelo base es un MoE (Mixture of Experts) de 743B parámetros totales y ~40B activos, con 78 capas, atención sparse (DSA) y contexto de 1M tokens. Esta cuantización reduce el peso total a ~378 GB (frente a los ~465 GB de las cuantizaciones NVFP4 existentes), lo que permite servir el modelo en cuatro nodos DGX Spark (GB10) con margen real de KV-cache, algo que las alternativas NVFP4 no consiguen por quedarse sin memoria en producción.

La receta es data-free (sin calibración), estática y simétrica, en formato `compressed-tensors` para vLLM. La clave está en aplicar Int4 solo a los expertos MoE (el grueso de los pesos), Int8 a las capas densas y de atención, y mantener en BF16 los componentes críticos para la precisión: el router MoE, el selector de atención sparse (indexer), la capa 0 y la cabeza LM. El resultado es una cuantización que, según el autor, es la primera del GLM-5.3 grande que sirve bajo tráfico real en cuatro DGX Spark, con un rendimiento medido de hasta 46 tok/s agregados a 6 streams concurrentes.

La relevancia de esta ficha radica en que demuestra una vía práctica para desplegar modelos de ~750B en hardware de gama media (GB10) sin sacrificar la integridad estructural del modelo, y documenta de forma transparente el proceso de verificación y las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención sparse (DSA), 78 capas, `glm5_next` |
| Parametros totales | 779.187.038.208 (según safetensors) |
| Parametros activos | ~40B (según README del autor) |
| Longitud de contexto | 1M (modelo base); 131072 por defecto en esta cuantización, hasta ~600K con Decode Context Parallel |
| Tipos de cuantizacion | Int4 (W4A16) para expertos MoE, Int8 (W8A16) para denso y atención, grupo 128, formato `compressed-tensors` / `pack-quantized` |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica lista) |
| Licencia | glm-5.3 (licencia propia de z.ai, no MIT) |
| Formato de pesos | safetensors (282 shards), compressed-tensors |

## Arquitectura y entrenamiento

Esta no es una arquitectura nueva, sino una cuantización post-entrenamiento del modelo GLM-5.3 de z.ai. El modelo base es un MoE con 743B parámetros totales y ~40B activos, 78 capas, atención sparse (DSA) y un bloque MTP (Multi-Token Prediction) en la capa 78. La cuantización se realizó con un quantizador RTN (round-to-nearest) que procesa los shards de forma secuencial (shard-streaming), sin datos de calibración, usando las funciones `calculate_qparams`, `quantize` y `pack_to_int32` de la librería `compressed_tensors`. El proceso completo tardó 28,2 minutos con un pico de RAM de ~10 GiB.

La receta es la siguiente: los expertos MoE (capas 3-77) se cuantizan a W4A16 con grupo 128; las capas densas y de atención (capas 1-77) a W8A16 con grupo 128; el bloque MTP (capa 78) a W8A16 canal-wise. Se mantienen en BF16 íntegro la capa 0, todos los `mlp.gate` (router MoE), los `self_attn.indexer` / `indexers_proj` (selector de atención sparse), las normas del MTP y la cabeza LM (`shared_head.norm` / `shared_head.head`). Esta selección protege los componentes que más afectan a la calidad del modelo: el enrutamiento, la selección de atención y la salida final.

## Capacidades

- Generación de texto y razonamiento complejo, heredados del modelo base GLM-5.3, que según z.ai es el modelo open-weights más capaz en codificación (50% de mejora sobre GLM-5.2 en benchmarks internos).
- Codificación y tareas de largo horizonte (long-horizon tasks), con mejor token-efficiency que GLM-5.2: en modo Max effort alcanza 34,5% en agente de codificación con ~75K tokens de salida, frente al 23,4% de GLM-5.2 con 96K tokens.
- Soporte de agentes y razonamiento multi-paso, gracias a la capacidad de tool calling y al contexto largo (1M tokens en el modelo base).
- Decodificación especulativa: compatible con el drafter DFlash2 de incoai (4,9 GB) para acelerar la generación sin apenas coste adicional de KV-cache. El MTP nativo (capa 78) se conserva como respaldo.
- Contexto muy largo: con Decode Context Parallel (tamaño 4) se puede atender una única petición de ~600K tokens, repartiendo el KV entre los cuatro nodos.
- Multilingüismo: no se especifican idiomas concretos, pero el modelo base GLM-5.3 es multilingüe.

## Casos de uso

- Despliegue de modelos de ~750B en hardware de gama media: esta cuantización permite servir GLM-5.3 en cuatro DGX Spark (GB10) con 33 GB/rank de margen para KV-cache, algo que las cuantizaciones NVFP4 no logran. Es adecuada para organizaciones que ya tienen este hardware y quieren ejecutar el modelo completo sin recurrir a la nube.
- Asistente de codificación en producción: el modelo base destaca en tareas de codificación complejas y de largo horizonte. Con vLLM y tensor parallelism, se puede integrar en pipelines de CI/CD para generación de código, revisión de PRs o autocompletado en IDEs, aprovechando la decodificación especulativa con DFlash2 para reducir la latencia.
- Agentes autónomos de codificación: gracias a su capacidad de razonamiento multi-paso y tool calling, puede usarse como motor de agentes que planifican, escriben y ejecutan código de forma autónoma, con el contexto largo necesario para mantener el estado de la tarea.
- Procesamiento de documentos extensos: con el contexto de 1M tokens (o ~600K en modo Decode Context Parallel), es adecuado para resumir, analizar o extraer información de libros técnicos, expedientes legales o repositorios completos de código en una sola pasada.
- Investigación sobre cuantización mixta: la receta documentada (Int4 en expertos, Int8 en denso/atención, BF16 en componentes críticos) sirve como referencia reproducible para otros modelos MoE grandes. El autor publica el código y los launchers en GitHub.
- Servicio de chat conversacional con contexto largo: el modelo puede mantener conversaciones multi-turno con historial extenso, útil para asistentes virtuales en entornos técnicos donde se necesita recordar detalles de sesiones anteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) específicos para esta cuantización. El autor proporciona únicamente datos de rendimiento de inferencia medidos en su hardware (4× DGX Spark, TP4, 200K contexto, KV fp8_ds_mla, MTP k=4, thinking off):

| Concurrencia | 1 | 2 | 3 | 4 | 6 |
|---|---|---|---|---|---|
| **tok/s agregados** | 12,12 | 21,71 | 28,30 | 33,11 | **46,03** |

Como referencia, el modelo base GLM-5.3 (sin cuantizar) reporta en el blog de z.ai una mejora del 50% sobre GLM-5.2 en codificación, y un 34,5% en agente de codificación en modo Max effort (frente al 23,4% de GLM-5.2). Estos datos corresponden al modelo original, no a esta cuantización.

## Requisitos de hardware

- VRAM estimada: ~378 GB de pesos en total. Con tensor parallelism de 4 (TP4), cada rank necesita ~94,5 GB de VRAM para pesos, dejando ~33 GB/rank para el pool de KV-cache.
- GPU recomendadas: 4× NVIDIA DGX Spark (GB10, sm121) con 128 GB de VRAM cada una. También funciona en GPUs estándar CUDA (H100/A100) con vLLM, sin necesidad de overlays de kernel.
- No cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño total; se necesitan al menos 4 GPUs con 80 GB+ cada una.
- Opciones de despliegue: vLLM (versión 0.23.1rc1 o superior) con `--quantization compressed-tensors`, `--tensor-parallel-size 4` y `--enable-expert-parallel`. En GB10 se requieren overlays de kernel sm12x para la ruta sparse-MLA + fp8-KV (disponibles en el repositorio del autor). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 12,12 tok/s en un solo stream, hasta 46,03 tok/s agregados con 6 streams concurrentes (medido en 4× DGX Spark).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño pesos | ¿Sirve en 4× DGX Spark? | Licencia |
|---|---|---|---|---|---|
| **GLM-5.3-Int4-Int8Mix (este)** | 779B totales / ~40B activos | 1M (base) | ~378 GB | Sí (con margen KV) | glm-5.3 |
| GLM-5.3 NVFP4 (otras cuantizaciones) | 743B | 1M | ~465 GB | No (OOM en producción) | glm-5.3 |
| QuantTrio/GLM-5.2-Int4-Int8Mix | ~700B (estimado) | 200K | ~350 GB (estimado) | Sí (reporta 32,5 tok/s medios) | glm-5.2 |

La comparativa se basa en los datos del README del autor. No se dispone de benchmarks de calidad para las alternativas, solo de tamaño y capacidad de despliegue.

## Limitaciones y advertencias

- Es una cuantización, no un modelo entrenado: puede haber pérdida de precisión. El autor reporta un error relativo de ~12% en los pesos Int4 (normal para 16 niveles) y ~0,70% en Int8.
- Requiere hardware específico: sin 4× DGX Spark o GPUs equivalentes con ~95 GB/rank, no es viable. En GB10 se necesitan overlays de kernel no incluidos en vLLM estándar.
- La licencia es `glm-5.3`, no MIT (aunque el modelo base se anuncia como MIT en algunas fuentes, esta cuantización usa una licencia propia de z.ai). Hay que revisar los términos de uso comercial.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización; los datos de rendimiento son solo de inferencia.
- El repositorio tiene 0 descargas en el momento de la consulta, lo que sugiere que es muy reciente y aún no ha sido validado por la comunidad.
- No hay información sobre sesgos, alucinación o comportamiento en idiomas distintos del inglés; el modelo base es multilingüe pero no se detalla la cobertura.
- El contexto máximo de 1M tokens del modelo base no se alcanza en esta configuración por defecto (131072); para llegar a ~600K hay que activar Decode Context Parallel, lo que introduce un coste adicional por paso de decodificación entre nodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tech2wild/GLM-5.3-Int4-Int8Mix
- Repositorio de receta y launchers: https://github.com/tonyd2wild/GLM-5.3-Int4-Int8Mix-TP4-4x-DGX-Spark
- Repositorio de overlays para GB10: https://github.com/tonyd2wild/GLM-5.2-QuantTrio-200K-4x-DGX-Spark--36tok-s
- Drafter DFlash2 (decodificación especulativa): https://huggingface.co/incoai/GLM-5.3-DFlash2
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog de z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Repositorio oficial GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- Ficha de GLM-5.3 en OpenLM: https://openlm.ai/glm-5.5/
