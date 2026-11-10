# yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep1

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-32B-Instruct de Alibaba, orientado a tareas de memoria y recuperación de información en contextos multi-documento. El autor lo entrenó sobre pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus, un conjunto de datos diseñado para evaluar la capacidad de un modelo de localizar y combinar información dispersa en múltiples documentos. El checkpoint publicado corresponde a la época 1 de un total de 3 planificadas.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-32B con 32.763.876.352 parámetros, contexto nativo de 32.768 tokens (aunque el entrenamiento se realizó con longitud máxima de 8.096), y pesos en bf16 safetensors compatibles con `transformers`. Su relevancia radica en ser un experimento de especialización en memoria de trabajo sobre documentos largos, una capacidad crítica para agentes y sistemas RAG que necesitan razonar sobre información fragmentada.

Al ser un checkpoint intermedio (época 1 de 3) con 0 descargas y sin benchmarks publicados, debe considerarse un artefacto de investigación más que un modelo listo para producción. La licencia Apache 2.0 heredada del modelo base permite uso comercial, pero la ausencia de evaluación formal limita su adopción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo (entrenado con 8.096) |
| Tipos de cuantizacion | no disponible en la model card; compatible con bf16, fp16, int8 e int4 vía herramientas estándar |
| Idiomas soportados | no disponible (heredados de Qwen2.5, típicamente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 32.763.876.352 parámetros, sin mezcla de expertos. El ajuste fino se realizó con FSDP (Fully Sharded Data Parallel) sobre 8 GPUs AMD Instinct MI325X, actualizando el 100% de los parámetros en precisión bf16 con gradient checkpointing. La longitud máxima de secuencia durante el entrenamiento fue de 8.096 tokens, inferior al contexto nativo de 32.768 del modelo base, lo que puede limitar el rendimiento en escenarios que requieran ventanas más largas.

Los datos de entrenamiento consisten en 2.968.214 ejemplos sintéticos de QA generados a partir de BrowseComp-Plus (`bcp_subset300_numsamplingepochs1_crossdoc_entity_combination_v3.json`), diseñados para forzar la combinación de entidades a través de documentos. Se usó una tasa de aprendizaje constante de 2e-05 con warmup del 5%, weight decay 0.01, max grad norm 1.0, batch efectivo de 1024 (64 por dispositivo × 2 acumulaciones × 8 GPUs) y pérdida calculada solo sobre tokens del asistente. El entrenamiento completo de 3 épocas requirió 20,80 horas de reloj (166,4 GPU-horas); este checkpoint corresponde a la época 1.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Razonamiento sobre múltiples documentos y combinación de entidades dispersas (objetivo principal del ajuste).
- Recuperación y síntesis de información en contextos largos (hasta 8.096 tokens vistos en entrenamiento).
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no validado tras el ajuste).
- Capacidades multilingües heredadas del modelo base (no evaluadas en este checkpoint).
- Razonamiento multi-paso y uso en pipelines de agentes (no verificado empíricamente).
- Capacidad de matemáticas y código heredada de Qwen2.5-Instruct (no re-evaluada).

## Casos de uso

- Sistemas RAG multi-documento: el modelo puede recibir varios fragmentos recuperados y sintetizar una respuesta combinando entidades de distintos pasajes, que es exactamente el patrón de entrenamiento (cross-doc entity combination).
- Agentes de investigación: integrado en un bucle de agente que consulta fuentes y acumula hallazgos, el ajuste busca mejorar la retención de información entre pasos.
- Atención al cliente con base de conocimiento: con contexto de hasta 8.096 tokens puede ingerir manuales o FAQs extensas y responder consultas que requieran cruzar secciones.
- Análisis de contratos o documentación legal: extracción de cláusulas relacionadas dispersas en varios documentos y consolidación en un resumen coherente.
- Asistente de soporte técnico interno: diagnóstico que requiere correlacionar logs, incidencias y documentación de distintos sistemas.
- Análisis de literatura científica: combinación de hallazgos de varios abstracts o secciones para responder preguntas de revisión.
- Evaluación de pipelines de memoria: uso como baseline experimental para comparar estrategias de memoria en agentes LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 80 GB por GPU.
- VRAM en int8: alrededor de 33 GB; en int4: alrededor de 17-18 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB, MI300X/MI325X; en consumer, RTX 4090 (24 GB) solo con cuantización int4 y contexto reducido.
- Despliegue: compatible con `transformers` (verificado por el autor), y previsiblemente con vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF (no confirmado).
- Latencia y throughput: no disponibles; el tamaño de 32B implica decodificación de un token por paso sin decodificación especulativa documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep1 | 32,76 B | 32.768 (entrenado a 8.096) | Apache 2.0 | Checkpoint época 1/3, sin benchmarks |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | 32.768 | Apache 2.0 | Modelo base, benchmarks públicos |
| Qwen/Qwen2.5-72B-Instruct | 72,7 B | 32.768 | Apache 2.0 (con condiciones de uso) | Mayor capacidad, más VRAM |
| mistralai/Mistral-Large-Instruct-2411 | 123 B | 128.000 | MRL no comercial | Contexto mucho mayor, licencia restrictiva |

El checkpoint ajustado no aporta mejoras de contexto ni de tamaño frente a su base; su única diferencia es la especialización en memoria multi-documento, no cuantificada públicamente.

## Limitaciones y advertencias

- Checkpoint intermedio (época 1 de 3): puede no representar el rendimiento final del ajuste.
- Sin benchmarks ni evaluaciones publicadas; el rendimiento real es desconocido.
- Entrenado con secuencias de 8.096 tokens, por debajo del contexto nativo de 32.768; el rendimiento en ventanas largas puede degradarse.
- Riesgo de sobreajuste a la distribución sintética de BrowseComp-Plus y de olvido catastrófico parcial de capacidades del modelo base.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente agravado por el ajuste en QA sintético.
- Idiomas soportados no documentados; aunque hereda el multilingüismo de Qwen2.5, no hay validación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No usar en producción sin evaluación propia en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-bcp-full-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- BrowseComp-Plus (referencia del dataset, no enlazado en la model card): no disponible
