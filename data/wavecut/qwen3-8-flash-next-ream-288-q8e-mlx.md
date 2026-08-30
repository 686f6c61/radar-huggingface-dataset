# WaveCut/Qwen3.8-Flash-Next-REAM-288-Q8E-MLX

## Resumen

WaveCut/Qwen3.8-Flash-Next-REAM-288-Q8E-MLX es una adaptación cuantizada del modelo multimodal Qwen3.8-Flash-Next de Qwen, un MoE híbrido de 125B parámetros que sirve como vista previa de la arquitectura Qwen4. Esta variante concreta aplica la técnica REAM (Merging Improves Pruning of Experts) desarrollada por Samsung SAIL Montréal, que fusiona los expertos menos relevantes en lugar de eliminarlos, reduciendo el número de expertos activos de 512 a 288 por capa. El resultado es un checkpoint drop-in compatible con el runtime de mlx-vlm, con los expertos cuantizados a 8 bits sobre un backbone de 4 bits, y un tamaño total de 29,7B parámetros según los safetensors.

El modelo está diseñado como una alternativa directa al REAP-288 de sh0wie (que poda expertos), con la diferencia de que los expertos absorbidos se fusionan mediante alineación húngara y coeficientes proporcionales a la saliencia. La evaluación A/B del autor muestra una KL ligeramente inferior frente al modelo stock y un rendimiento comparable en pruebas de nombres raros, aunque con una pequeña pérdida en HumanEval (88% vs 92% en subconjuntos diferentes). Es relevante ahora porque ofrece una vía para ejecutar un modelo de 125B en hardware de consumo (Apple Silicon) con calidad cercana al original, y porque su arquitectura híbrida Gated DeltaNet + QSA anticipa los diseños de próxima generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Gated Attention), 512 expertos originales, 288 mantenidos tras REAM |
| Parametros totales | 29.696.177.491 (según safetensors de este checkpoint; el modelo base completo es de 125B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según documentación de Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | Backbone 4-bit, expertos 8-bit (gs64 affine), formato MLX |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para esta variante) |
| Licencia | Qwen Community License 1.0 (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) con Gated Attention (QSA), una innovación introducida en Qwen3-Next y que se ha mantenido en las series Qwen3.5, Qwen3.6, Qwen3.7 y Qwen3.8. Es un MoE multimodal con 512 expertos por capa y una ventana de contexto de 262K tokens. La variante REAM-288 aplica una adaptación offline: en lugar de podar los 224 expertos no mantenidos por capa (como hace REAP), cada uno se fusiona en el experto más similar según el coseno de las filas del router, con coeficientes de fusión proporcionales a una proxy de saliencia (1/R, con R=10). Se realiza una alineación de permutación húngara de los canales intermedios antes del promediado, y el router se mantiene byte-idéntico al stock en las filas conservadas. El bloque MTP se procesa con centroides k-center sobre sus propias filas de gate. No se menciona entrenamiento adicional supervisado; es una adaptación puramente de compresión basada en merging.

## Capacidades

- Generación de texto multimodal: procesa y genera texto a partir de imágenes (pipeline image-text-to-text).
- Razonamiento avanzado: el modelo base supera a Claude-4.6-Opus (Max) en benchmarks públicos según la documentación de Qwen.
- Generación de código: optimizado para tráfico de codificación agéntica (la saliencia se calibró sobre ~686K tokens de ese tipo de tráfico).
- Soporte de agentes y multi-step reasoning: el modelo base incluye capacidades de agente, aunque no se confirma explícitamente para esta variante cuantizada.
- Decodificación especulativa: compatible con el drafter MTP independiente de sh0wie para acelerar la inferencia (no incluye tensores mtp.*).
- Multilingüismo: el modelo base es multilingüe (incluye ruso en las evaluaciones), pero no se detalla la lista de idiomas para este checkpoint.

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir refactorizaciones, añadir validación de entrada y generar código en tiempo real, aprovechando su entrenamiento en tráfico de codificación agéntica y su ventana de 262K tokens para mantener contexto de proyectos grandes.
- Agente de automatización de tareas: con soporte de tool calling (heredado del modelo base) y razonamiento multi-paso, puede orquestar flujos de trabajo como gestión de incidencias, generación de informes o interacción con APIs.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada en texto.
- Chatbot multilingüe de atención al cliente: su capacidad multilingüe (no especificada pero presente en el base) permite atender consultas en varios idiomas con contexto largo para mantener el historial de la conversación.
- Generación de documentación técnica: a partir de código fuente o especificaciones, puede redactar documentación coherente y detallada, gracias a su capacidad de razonamiento y generación de texto largo.
- Prototipado rápido en entornos con recursos limitados: al poder ejecutarse en 75GB de memoria unificada (Apple Silicon), es viable para equipos de desarrollo sin GPUs dedicadas, permitiendo pruebas locales de agentes de IA.

## Benchmarks y rendimiento

El autor proporciona una evaluación A/B frente al modelo stock (512 expertos) y al REAP-288 (prune), con el mismo harness y hardware:

| Modelo | KL vs stock (media) | Sonda de nombres raros (10 nombres) | Subconjunto HumanEval (25 tareas) |
|---|---|---|---|
| Stock 512e | 0 | 0.97 | 90.0% (full 50) |
| REAP-288 (prune) | 1.3066 | 0.91 | 92.0% (stock en mismo slice: 92.0%) |
| **REAM-288 (este)** | **1.2752** | **0.92** | **88.0% (stock en mismo slice: 88.0%)** |

Nota: la KL es teacher-forced top-256 sobre un corpus mixto fijo (~10K posiciones). La sonda de nombres raros usa 10 nombres con generaciones sembradas; los agregados se recalculan sobre el subconjunto común. HumanEval usa slices de 25 tareas de un subconjunto congelado de 50, sin thinking y greedy; los dos modelos 288e cayeron en slices diferentes (solapamiento de 2 tareas), por lo que cada uno se compara con el stock en su propio slice. Son ejecuciones únicas; diferencias de ±1-2 puntos son ruido estadístico. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) para esta variante específica.

## Requisitos de hardware

- Memoria: según unsloth, el modelo base completo puede ejecutarse en 75GB de RAM/unified memory sin GPU VRAM dedicada. Este checkpoint cuantizado (29.7B parámetros) requiere proporcionalmente menos, aunque no se especifica un valor exacto.
- GPU recomendadas: al estar en formato MLX, está orientado a Apple Silicon (M-series). No se indica soporte para CUDA/ROCm en esta variante.
- Compatibilidad con GPU de consumo: sí, en equipos Apple con ≥75GB de memoria unificada (por ejemplo, Mac Studio con M2 Ultra o superior).
- Opciones de despliegue: mediante mlx-vlm (pip install desde GitHub), usando el comando `mlx_vlm.generate`. También es compatible con el drafter MTP independiente para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | KL vs stock | HumanEval (25 tareas) |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (stock 512e) | 125B (base) | 262K | Original | 0 | 90.0% (full 50) |
| sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX | ~29.7B (cuantizado) | 262K | Poda de expertos (REAP) | 1.3066 | 92.0% (slice propio) |
| **WaveCut/Qwen3.8-Flash-Next-REAM-288-Q8E-MLX** | **~29.7B (cuantizado)** | **262K** | **Fusión de expertos (REAM)** | **1.2752** | **88.0% (slice propio)** |

Ambos modelos 288e son drop-in entre sí, con la misma estructura de archivos y runtime. La diferencia clave es que REAM fusiona los expertos absorbidos en lugar de eliminarlos, logrando una KL ligeramente menor frente al stock. En la sonda de nombres raros, REAM obtiene 0.92 frente a 0.91 de REAP, y en la submuestra rusa (3 nombres cirílicos, 30 generaciones) consigue 22 aciertos frente a 21 del prune.

## Limitaciones y advertencias

- Evaluación limitada: los benchmarks son de una sola ejecución y sobre subconjuntos pequeños; las diferencias de ±1-2 puntos son ruido. No hay resultados en benchmarks estándar (MMLU, GSM8K, etc.).
- Pérdida de calidad en tareas de código: en el slice de HumanEval evaluado, REAM obtiene 88% frente al 92% de REAP, aunque en slices diferentes y con solapamiento mínimo, por lo que la comparación directa no es concluyente.
- Sesgos potenciales: al ser una adaptación de un modelo grande, puede heredar sesgos del entrenamiento original (no documentados en esta variante).
- Riesgo de alucinación: inherente a modelos generativos; no se mitiga específicamente en esta versión.
- Restricciones de licencia: la Qwen Community License 1.0 permite uso comercial con condiciones (revisar el texto completo en el repositorio). No se detallan aquí las cláusulas exactas.
- Dependencia de la comunidad: el checkpoint depende de correcciones y manifests de sh0wie (RMSNorm, shards.N), y del drafter MTP externo para decodificación especulativa.
- Formato MLX exclusivo: no es directamente utilizable con otros runtimes (vLLM, llama.cpp) sin conversión adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-REAM-288-Q8E-MLX
- Modelo base (sin cuantizar): https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-REAM-288
- Modelo REAP-288 (prune) de sh0wie: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-Q8E-MLX
- Manifiesto REAP-288 (MLX 4-bit): https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- Drafter MTP independiente: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Paper de REAM (arXiv 2604.04356): https://arxiv.org/abs/2604.04356
- Documentación de unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
