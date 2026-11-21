# SOTAagi2030/lumen-search-reranker-v2

## Resumen

LumenSearch Reranker v2 es un cross-encoder de reordenación (reranking) desarrollado por SOTAagi2030 para la pila de recuperación documental LumenSearch. Su función es recibir los candidatos devueltos por un recuperador de primera etapa y recalcular su relevancia respecto a una consulta, devolviendo una puntuación que se usa para reordenar la lista. Se sirve detrás del endpoint `/search` del sistema y sustituye a la versión v1 que atendía tráfico en producción.

El modelo se construye mediante ajuste fino (fine-tuning) sobre el encoder `lumen-ai/lumen-encoder-base-110m`, del que hereda aproximadamente 110 millones de parámetros y la arquitectura transformer de tipo encoder. La model card documenta la ejecución de entrenamiento `rr-2026-03-02-a`, que alcanzó el paso 4200 y fue promovida tras la barrida de marzo de 2026 por obtener una puntuación compuesta de 0,7377 sobre el conjunto congelado `heldout_v2`.

Su relevancia radica en la mejora medida frente a la versión anterior: incrementos de +0,029 en nDCG@10, +0,027 en MRR@10, +0,025 en Recall@50 y +0,034 en MAP@10. Está pensado exclusivamente para reordenar pasajes web cortos de hasta 512 tokens en consultas en inglés, y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer encoder) |
| Parametros totales | ~110M (heredados del modelo base `lumen-encoder-base-110m`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512 tokens por par consulta-pasaje |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |
| Modelo base | lumen-ai/lumen-encoder-base-110m |
| Ejecucion de origen | rr-2026-03-02-a (paso 4200) |
| Conjunto de evaluacion | heldout_v2 |

## Arquitectura y entrenamiento

Se trata de un cross-encoder: recibe como entrada el par formado por la consulta y un pasaje candidato, y produce una puntuación de relevancia. A diferencia de los bi-encoders, que generan embeddings independientes para consulta y documento, el cross-encoder procesa ambos conjuntamente, lo que permite modelar interacciones token a token a costa de un mayor coste computacional por par evaluado. Esto lo hace adecuado para una segunda etapa de reordenación sobre un conjunto reducido de candidatos, no para la recuperación inicial sobre un índice completo.

El ajuste fino parte del encoder `lumen-ai/lumen-encoder-base-110m` (unos 110 millones de parámetros) y se ejecutó hasta el paso 4200 en la ejecución `rr-2026-03-02-a`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; únicamente indica que solo se consideraron para promoción las ejecuciones finalizadas limpiamente y evaluadas sobre `heldout_v2`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reordenación de pares consulta-pasaje: asigna una puntuación de relevancia a cada par y permite reordenar la lista de candidatos.
- Búsqueda de relevancia en ingles: entrenado y evaluado sobre tráfico de búsqueda web en inglés.
- Procesamiento de pasajes cortos: soporta pasajes de hasta 512 tokens.
- Integración con sentence-transformers: se carga mediante la librería homónima.
- Puntuación por par: no genera texto, no responde preguntas y no produce embeddings de documento reutilizables.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento (thinking mode).

## Casos de uso

- Reordenación en motores de búsqueda web: tras la recuperación de primera etapa (por ejemplo, BM25 o un bi-encoder), el modelo recalcula la relevancia de los 50-100 candidatos principales y reordena el resultado; es su uso previsto y el que se sirve en producción detrás de `/search`.
- Mejora de la precisión en las primeras posiciones: con un MRR@10 de 0,688 y un nDCG@10 de 0,731, es adecuado para escenarios donde importa que el resultado relevante aparezca en los primeros puestos, como buscadores internos o motores de documentación.
- Filtrado de candidatos en pipelines RAG: en un sistema de generación aumentada por recuperación, el reranker puede descartar pasajes poco relevantes antes de pasarlos al modelo generador, reduciendo el ruido en el contexto.
- Búsqueda en bases de conocimiento internas en inglés: reordenación de artículos, FAQs o documentación técnica de hasta 512 tokens por fragmento.
- Evaluación comparativa de recuperadores: al puntuar pares de forma determinista, sirve para medir la calidad de distintas configuraciones de recuperación de primera etapa sobre un mismo conjunto de consultas.
- Reordenación en comercio electrónico con catálogo en inglés: puntuación de descripciones de producto cortas frente a la consulta del usuario para mejorar el orden de los resultados.
- Sustitución directa de la versión v1: al mantener la misma interfaz de cross-encoder y el mismo modelo base, puede desplegarse como reemplazo de la versión anterior con las mejoras medidas en `heldout_v2`.

## Benchmarks y rendimiento

Resultados sobre el conjunto congelado `heldout_v2`, comparados con la línea base v1:

| Metrica | v1 (baseline) | v2 (release) | Delta |
|---|---|---|---|
| nDCG@10 | 0,702 | 0,731 | +0,029 |
| MRR@10 | 0,661 | 0,688 | +0,027 |
| Recall@50 | 0,849 | 0,874 | +0,025 |
| MAP@10 | 0,607 | 0,641 | +0,034 |
| Puntuacion compuesta | No disponible | 0,7377 | No disponible |

La puntuación compuesta se calcula como `0,4 * nDCG@10 + 0,3 * MRR@10 + 0,2 * Recall@50 + 0,1 * MAP@10`, redondeada a cuatro decimales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; con ~110M parámetros, la inferencia en fp32 requiere del orden de 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB, a lo que hay que sumar el estado de activaciones del par consulta-pasaje.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (~110M parámetros), aunque el autor no publica cifras de latencia ni throughput.
- Opciones de despliegue: la model card solo declara compatibilidad con sentence-transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (cross-encoders de reranking de tamaño similar), por lo que la comparación con alternativas externas no está disponible. La única comparación documentada es interna, frente a la versión v1 del propio modelo:

| Modelo | Parametros | Contexto | nDCG@10 (heldout_v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumenSearch Reranker v2 | ~110M | 512 tokens | 0,731 | Apache 2.0 | Hugging Face |
| LumenSearch Reranker v1 | No disponible | No disponible | 0,702 | No disponible | En produccion (baseline) |

## Limitaciones y advertencias

- Sesgos temáticos heredados: el modelo hereda los sesgos del encoder base `lumen-encoder-base-110m`, según advierte la propia model card.
- Alucinación y calibración: las puntuaciones no están calibradas entre cohortes de consultas, por lo que solo debe confiarse en el orden relativo dentro de una misma cohorte.
- Limitación de idioma: no está entrenado para recuperación multilingüe; su uso está restringido a consultas en inglés.
- Limitación de longitud: los pasajes deben tener hasta 512 tokens; no está pensado para documentos largos.
- Juicios de relevancia dispersos: las anotaciones de relevancia son escasas para consultas de cola (tail queries), lo que afecta a la fiabilidad de la evaluación en esos casos.
- Uso fuera de alcance: no debe emplearse para resumen de documentos largos, respuesta a preguntas sobre tablas ni como recuperador autónomo, ya que no dispone de índice propio.
- Evaluación limitada: el rendimiento se midió sobre un único conjunto congelado extraído de tráfico de búsqueda web en inglés, sin datos de benchmarks estándar.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que puede indicar que los pesos no están publicados o que el repositorio está incompleto.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte más allá del canal interno del equipo de search-relevance de LumenSearch.

## Enlaces

- Hugging Face: https://huggingface.co/SOTAagi2030/lumen-search-reranker-v2
- Modelo base: https://huggingface.co/lumen-ai/lumen-encoder-base-110m (referenciado en la model card; no verificado)
