# ymelka/camembert-med-reranker-v2-distil

## Resumen

El modelo `ymelka/camembert-med-reranker-v2-distil` es un cross-encoder de reranking especializado en el dominio médico francés, desarrollado por ymelka a partir de `antoinelouis/crossencoder-distilcamembert-mmarcoFR`. Con 68 millones de parámetros, este modelo está diseñado para reordenar documentos recuperados por un sistema de búsqueda o RAG, mejorando la relevancia de los resultados en consultas médicas. Su arquitectura se basa en DistilCamemBERT, una versión destilada de CamemBERT, lo que permite un equilibrio entre rendimiento y eficiencia computacional.

El modelo se ha fine-tuneado sobre un conjunto de datos que combina consultas médicas reales, datos adicionales de validación y un replay de MS MARCO FR para mitigar el olvido catastrófico. Los resultados reportados muestran una mejora significativa en métricas de reranking como P@1, MRR y nDCG en el conjunto de evaluación médica, así como una corrección del olvido en tareas de recuperación general. Su licencia Apache 2.0 y su tamaño compacto lo hacen atractivo para despliegues en producción con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DistilCamemBERT (transformer encoder) |
| Parametros totales | 68.095.489 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max_len 256) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, compatible con cuantizacion posterior) |
| Idiomas soportados | Frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, lo que significa que codifica conjuntamente la consulta y el documento como una única secuencia de entrada, produciendo una puntuación de relevancia. Se basa en DistilCamemBERT, una versión destilada de CamemBERT con 6 capas y 68 millones de parámetros, optimizada para inferencia rápida. El fine-tuning se realizó sobre un conjunto de datos compuesto por 30.846 grupos de consultas (171.000 pares), que incluye:

- Dataset-v1 train (17.843 grupos)
- Gold-extra v2_dev (3.003 grupos, sin usar los splits oficiales)
- mmarco-replay de 10.000 grupos (MS MARCO FR, con reservoir de 100.000 y BM25)

La mezcla de datos tiene una proporción de 71% de consultas de tipo A (médicas) y 29% de tipo C (generales). El entrenamiento se realizó durante 2 épocas con learning rate 2e-5, batch size 16, longitud máxima de secuencia 256 y precisión FP16 en una GPU T4, completándose en 22 minutos. La pérdida de validación pasó de 0.419 a 0.426, indicando un ligero sobreajuste al final del entrenamiento.

## Capacidades

- Reranking de pares consulta-documento: dado un query y un conjunto de documentos candidatos, devuelve una puntuación de relevancia para cada par.
- Especialización en dominio médico francés: entrenado con consultas médicas reales, terminología clínica y documentos de salud.
- Corrección del olvido catastrófico: el replay con MS MARCO FR mantiene la capacidad de reranking en dominios generales, como se muestra en la métrica mMARCO.
- Inferencia eficiente: al ser un modelo de 68M, puede ejecutarse en CPU o GPU de gama baja con baja latencia.
- Integración con pipelines de RAG: compatible con librerías como sentence-transformers o HuggingFace Transformers para su uso en sistemas de recuperación aumentada.

## Casos de uso

- Búsqueda semántica en historiales clínicos: el modelo puede rerankear resultados de una búsqueda por palabras clave en registros médicos electrónicos, priorizando los documentos más relevantes para una consulta específica de un profesional sanitario.
- Asistente de diagnóstico basado en RAG: en un sistema que recupera artículos médicos o guías clínicas, el reranker mejora la precisión de los pasajes que se alimentan al LLM generativo, reduciendo respuestas irrelevantes.
- Portal de información para pacientes: al integrarse en un buscador de preguntas frecuentes sobre síntomas o tratamientos, el modelo ordena las respuestas más útiles para el usuario final.
- Filtrado de literatura científica: para investigadores que buscan papers médicos en francés, el reranker puede refinar los resultados de un motor de búsqueda académica, destacando los estudios más pertinentes.
- Chatbot de triaje sanitario: en un sistema de atención al paciente, el modelo ayuda a seleccionar las respuestas más adecuadas de una base de conocimiento, mejorando la coherencia y relevancia de las respuestas automáticas.
- Optimización de motores de búsqueda internos en hospitales: para localizar protocolos, informes o resultados de pruebas, el reranker reduce el tiempo de búsqueda al priorizar los documentos correctos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación médica (legacy, 8.965 consultas) y en la prueba de olvido mMARCO (200 consultas de dev):

| Metrica | Valor (medical legacy) | Valor (mMARCO forgetting) |
|---|---|---|
| P@1 | 0.4632 | 0.970 |
| MRR | 0.6561 | - |
| nDCG | 0.7352 | - |

En la prueba mMARCO, se compara con el baseline distil (0.865) y con la versión v1 médica (0.610), mostrando que el olvido se ha corregido. No se han publicado comparaciones con otros modelos de reranking en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 68M parámetros, en FP16 ocupa aproximadamente 136 MB; en int8, unos 68 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA T4, GTX 1080, RTX 2060 o superiores. También funciona en CPU con baja latencia (inferencia de pocos milisegundos por par).
- Compatible con consumer GPU: sí, incluso en portátiles con GPU integrada.
- Opciones de despliegue: se puede servir con HuggingFace Transformers, sentence-transformers, ONNX Runtime o TorchServe. No es adecuado para vLLM o TGI, ya que no es un modelo generativo.
- Latencia estimada: en una T4, la inferencia de un par tarda ~5-10 ms; en CPU, ~20-50 ms dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| ymelka/camembert-med-reranker-v2-distil | 68M | No disponible | Medico frances | Apache 2.0 | Fine-tune sobre DistilCamemBERT |
| antoinelouis/crossencoder-distilcamembert-mmarcoFR | 68M | No disponible | Multilingue (mMARCO) | Apache 2.0 | Modelo base, sin especializacion medica |
| v1 (no publicado) | 68M | No disponible | Medico frances | - | Version anterior con olvido en mMARCO |

No se dispone de comparativas con otros cross-encoders médicos franceses en la información proporcionada.

## Limitaciones y advertencias

- El benchmark de evaluación se basa en preguntas de opción múltiple de exámenes médicos, no en tareas de RAG documental real. El rendimiento en escenarios de recuperación de documentos largos puede diferir.
- El modelo está entrenado exclusivamente en francés; no soporta otros idiomas.
- No se ha evaluado en un shadow holdout (972 consultas bloqueadas), por lo que los resultados pueden estar optimistas.
- Al ser un cross-encoder, no es adecuado para generación de texto ni para tareas que requieran razonamiento multi-paso.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo en el dominio específico antes de producción.
- Posibles sesgos en los datos de entrenamiento médicos, que podrían reflejar desigualdades o terminología limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ymelka/camembert-med-reranker-v2-distil
- Modelo base: https://huggingface.co/antoinelouis/crossencoder-distilcamembert-mmarcoFR
- Referencia de DistilCamemBERT: https://huggingface.co/cmarkea/distilcamembert-base
- Referencia de CamemBERT v2: https://huggingface.co/almanach/camembertv2-base
