# zhuomingliu/MaLoW-Qwen3.5-2B

## Resumen

MaLoW-Qwen3.5-2B es un checkpoint de inferencia publicado por el usuario zhuomingliu bajo el identificador `zhuomingliu/MaLoW-Qwen3.5-2B`. No es un modelo base autónomo, sino un conjunto de módulos de inferencia (etiquetados como `adapter` y `memory-as-weights`) que se montan sobre el modelo base `Qwen/Qwen3.5-2B`, que debe descargarse por separado. Acompana al trabajo "Memory as Weights: Internalizing Long-Term History for Streaming Videos", cuyo objetivo es internalizar el historial de largo plazo de vídeos en streaming directamente en los pesos, en lugar de gestionarlo mediante un contexto creciente.

El checkpoint contiene 170.729.528 parámetros (dato real de los safetensors) y ocupa 0,7 GB en el repositorio. Sobre el base, un modelo denso de 2B parámetros de la familia Qwen3.5 con ventana de contexto de 262.000 tokens y cobertura de hasta 201 idiomas (según fuentes de terceros), MaLoW anade la capacidad de retener memoria de historial de vídeo. La relevancia actual radica en que aborda el problema del coste computacional y de memoria de los asistentes de vídeo en streaming, donde el contexto de largo plazo suele ser prohibitivo.

La evaluación requiere el código de MaLoW, que según la model card está preparado localmente pero cuya publicación pública en GitHub está pendiente. El repositorio contiene módulos de inferencia y metadatos JSON, no un modelo base independiente. Los resultados de referencia reportados no proceden de una evaluación nueva de esta exportación, sino de cifras declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de memoria sobre base densa Qwen3.5-2B (gated delta networks con encoder de vision, segun fuentes de terceros); el checkpoint en si se etiqueta como `adapter` y `memory-as-weights` |
| Parametros totales | 170.729.528 (checkpoint MaLoW; el modelo base Qwen3.5-2B suma ~2B adicionales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens en el modelo base Qwen3.5-2B (segun fuentes de terceros); no disponible para el adaptador MaLoW |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible para MaLoW; el base Qwen3.5-2B declara cobertura de hasta 201 idiomas (segun fuentes de terceros) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un adaptador de tipo "memory-as-weights" que se acopla a `Qwen/Qwen3.5-2B`. La propuesta del trabajo es internalizar el historial de largo plazo de vídeos en streaming dentro de los propios pesos, en lugar de depender de un contexto que crece indefinidamente. El modelo base Qwen3.5-2B es, según fuentes de terceros, un modelo denso vision-language de la familia Qwen3.5 con arquitectura de gated delta networks, encoder de visión, ventana de 262.000 tokens y modo de razonamiento (thinking) opcional.

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El repositorio incluye metadatos JSON que registran la configuración de inferencia y que deben cargarse a través del runtime de MaLoW. La evaluación de OVO-Bench y StreamingBench debe seguir las instrucciones de `docs/video_evaluation.md` del código de MaLoW.

## Capacidades

- Comprensión de vídeo en streaming con memoria de historial de largo plazo (objetivo declarado del trabajo).
- Evaluación en tareas de referencia para vídeo en streaming: OVO-Bench (backward, real-time, forward) y StreamingBench (real-time, omni, proactive, SQA).
- Hereda del base Qwen3.5-2B las capacidades de modelo vision-language, incluyendo procesamiento de imagen/vídeo (según fuentes de terceros sobre el base).
- Hereda del base el modo de razonamiento (thinking) opcional (según fuentes de terceros).
- Capacidades multilingües heredadas del base (hasta 201 idiomas según fuentes de terceros); no confirmadas específicamente para el adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible para el adaptador; el base declara razonamiento mejorado según fuentes de terceros.

## Casos de uso

- Asistentes de vídeo en streaming: el modelo puede mantener memoria de eventos ocurridos a lo largo de una retransmisión sin reenviar todo el historial, apoyándose en la internalización del historial en pesos.
- Moderación de contenido en directo: análisis continuo de emisiones en tiempo real, aprovechando la evaluación reportada en la subtarea "Real-time" de StreamingBench (80,28).
- Preguntas y respuestas sobre grabaciones largas: consultas retrospectivas (tarea "backward" de OVO-Bench, 63,08) sobre material ya visionado.
- Resumen proactivo de eventos: generación de resúmenes o avisos sobre lo sucedido en una emisión, vinculado a la subtarea "Proactive" de StreamingBench (54,4).
- Interfaces de accesibilidad para vídeo en directo: descripción de escenas y eventos para personas con discapacidad visual, apoyándose en la comprensión vision-language del base.
- Investigación en memoria de largo plazo: uso como banco de pruebas para estudiar la internalización de historial frente a enfoques basados en contexto extenso, gracias a su tamano reducido (170,7 M de parámetros del adaptador).
- Análisis multimodal en el borde (edge): al montarse sobre un base de 2B, podría ejecutarse en hardware limitado, aunque no hay datos de despliegue confirmados para el adaptador.

## Benchmarks y rendimiento

Resultados de referencia reportados en la model card (porcentajes; no son una evaluación nueva de esta exportación). No se indica la comparación con modelos similares.

OVO-Bench:

| Backward | Real-time | Forward | Average |
|---:|---:|---:|---:|
| 63,08 | 70,14 | 49,33 | 60,85 |

StreamingBench:

| Average | Real-time | Omni | Proactive | SQA |
|---:|---:|---:|---:|---:|
| 68,82 | 80,28 | 54,3 | 54,4 | 55,6 |

Nota de redondeo recogida en la model card: las subtareas redondeadas de StreamingBench dan 68,81 con pesos 2500:1500:250:250, mientras que el promedio reportado es 68,82; la reproducción debe usar los resultados sin redondear del scorer. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador MaLoW: ~0,34 GB en fp16 y ~0,68 GB en fp32, a partir de sus 170,7 M de parámetros (estimación derivada del recuento de parámetros, no dato publicado).
- VRAM estimada del modelo base Qwen3.5-2B: aproximadamente 4 GB en fp16, ~2 GB en int8 y ~1,2-1,5 GB en cuantización Q4 (estimaciones según tamano; fuentes de terceros indican Q4_K_M y aptitud para GPUs de consumo de 8 GB).
- GPU recomendadas: no disponible de forma específica; fuentes de terceros sobre el base mencionan GPUs de consumo de 8 GB y despliegue en el borde.
- ¿Cabe en GPU de consumo? Según fuentes de terceros, el base Qwen3.5-2B es apto para GPUs de consumo de 8 GB; el adaptador por sí solo es de tamano reducido.
- Opciones de despliegue: el adaptador requiere el runtime de MaLoW (código pendiente de publicación). El base puede ejecutarse con vLLM (hay receta publicada en recipes.vllm.ai) y, según LocalClaw, con LM Studio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada. Se compara a continuación con el propio modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaLoW-Qwen3.5-2B | 170,7 M (adaptador) + 2B base | 262.000 tokens (base) | Memoria internalizada en pesos para vídeo en streaming | apache-2.0 | HuggingFace (adaptador); código pendiente |
| Qwen/Qwen3.5-2B | ~2B | 262.000 tokens (segun terceros) | Vision-language denso con thinking opcional | apache-2.0 (segun terceros) | HuggingFace |

Otros modelos comparables de memoria de vídeo en streaming: no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado `Qwen/Qwen3.5-2B` y cargarse a través del runtime de MaLoW.
- El código de MaLoW está pendiente de publicación pública en GitHub, por lo que la reproducibilidad y la evaluación no están garantizadas actualmente.
- Los resultados de benchmarks son cifras de referencia declaradas por el autor y no una evaluación nueva de esta exportación; además, la propia model card senala una discrepancia de redondeo en StreamingBench.
- El repositorio no incluye cuantizaciones (solo safetensors), lo que limita el despliegue directo en formatos GGUF/Ollama.
- Sin datos sobre sesgos, riesgo de alucinación, cobertura de idiomas específica del adaptador ni comportamiento en producción.
- Sin descargas ni likes en el momento de la consulta, lo que indica nula validación por parte de la comunidad.
- La licencia del adaptador es apache-2.0, pero los modelos base y los activos de benchmark conservan sus términos propios; conviene revisar `LICENSE` y `NOTICE`.
- Las capacidades vision-language, contexto de 262K y cobertura de 201 idiomas provienen de fuentes de terceros sobre el base Qwen3.5-2B, no de documentación confirmada del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código MaLoW (pendiente de publicación): https://github.com/dragonlzm/MaLoW
- Qwen3.5 2B en Modal: https://modal.com/library/qwen/qwen3-5-2b
- Qwen 3.5 (2B) en LocalClaw: https://localclaw.io/models/qwen3.5-2b
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Receta de vLLM para Qwen3.5-2B: https://recipes.vllm.ai/Qwen/Qwen3.5-2B
