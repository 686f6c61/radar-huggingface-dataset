# ymelka/camembert-med-reranker-base

## Resumen

El modelo `ymelka/camembert-med-reranker-base` es un cross-encoder de reranking especializado en el dominio médico francés, desarrollado por el laboratorio `camembert-med`. Se basa en el modelo `antoinelouis/crossencoder-camembert-base-mmarcoFR`, que a su vez es una adaptación de CamemBERT, el modelo de lenguaje francés basado en RoBERTa. Con 110 millones de parámetros, este modelo está diseñado para reordenar listas de documentos o fragmentos de texto según su relevancia con respecto a una consulta médica, mejorando la precisión de sistemas de recuperación de información y de generación aumentada por recuperación (RAG).

El modelo fue fine-tuneado con datos de evaluación médica francesa, concretamente los conjuntos MediQAl (licencia CC-BY-4.0) y FrenchMedMCQA (licencia Apache-2.0). Su relevancia radica en que aborda un nicho poco cubierto: el reranking en francés para contenidos clínicos y educativos médicos, donde los modelos genéricos multilingües suelen mostrar un rendimiento inferior. El autor reporta mejoras significativas sobre la línea base sin especializar, con un aumento de P@1 del 0.3445 al 0.4678.

Al ser un modelo de tamaño compacto (110M), puede ejecutarse en GPUs de consumo estándar, lo que facilita su integración en pipelines de búsqueda y RAG sin requerir infraestructura de alto coste. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en CamemBERT (RoBERTa francés) |
| Parametros totales | 110.622.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda de CamemBERT, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (formato safetensors, cuantizacion no especificada) |
| Idiomas soportados | Francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura cross-encoder, donde la consulta y el documento se concatenan y se procesan conjuntamente a través del transformer, produciendo una puntuación de relevancia entre 0 y 1. Esta arquitectura ofrece mayor precisión que los bi-encoders, aunque a costa de mayor coste computacional por par, siendo adecuada para la fase de reranking tras una primera recuperación.

La base es `antoinelouis/crossencoder-camembert-base-mmarcoFR`, un cross-encoder entrenado sobre el dataset mMARCO en francés, que a su vez parte de CamemBERT. El fine-tuning se realizó con datos médicos franceses: MediQAl y FrenchMedMCQA, ambos con preguntas de examen. Los distractores se construyeron a partir de las respuestas incorrectas de cada pregunta, verificadas previamente. El entrenamiento se llevó a cabo en un pipeline de GPU gratuito de Kaggle, con versionado completo del proceso.

No se reportan innovaciones técnicas adicionales como decodificación especulativa o attention lineal; es un fine-tuning estándar de un cross-encoder existente.

## Capacidades

- Reranking de pares consulta-documento en francés médico: dado un conjunto de candidatos, reordena por relevancia con alta precisión.
- Especialización en terminología médica, farmacológica y clínica francesa.
- Compatible con sistemas RAG: puede integrarse como etapa de reranking tras un retriever bi-encoder.
- Funciona como clasificador binario de relevancia (puntuación 0-1), útil para filtrado umbral.
- Soporta el idioma francés de forma nativa; no se garantiza rendimiento en otros idiomas.
- No soporta tool calling, agentes ni razonamiento multi-step; su función es exclusivamente de puntuación de pares.

## Casos de uso

- Búsqueda semántica en historiales clínicos: un hospital puede indexar informes médicos y usar este modelo para reordenar los resultados de una consulta sobre síntomas o tratamientos, priorizando los documentos más relevantes.
- Asistente de preguntas-respuestas médicas: en un sistema RAG que responda dudas de pacientes, el reranker mejora la precisión de las respuestas al seleccionar los fragmentos más pertinentes de la literatura médica.
- Revisión de literatura científica: investigadores pueden filtrar artículos en francés sobre un tema concreto, usando el modelo para ordenar los resúmenes según su relevancia.
- Preparación de exámenes médicos: estudiantes pueden buscar preguntas y respuestas relacionadas, con el reranker destacando las más similares a una consulta dada.
- Chatbots de salud pública: para responder consultas de ciudadanos sobre medicamentos o síntomas, el modelo ayuda a recuperar información oficial de fuentes francesas.
- Sistemas de soporte a la decisión clínica: al integrarse con bases de conocimiento médicas, el reranker prioriza guías o protocolos relevantes para un caso concreto.
- Indexación de contenidos de formación médica: plataformas educativas pueden ordenar materiales (cursos, vídeos, artículos) según la consulta del alumno.

## Benchmarks y rendimiento

El autor reporta resultados sobre un benchmark gold compuesto por preguntas de examen francesas (splits de test oficiales), con 8965 consultas y 47789 pares. Las métricas comparadas entre el modelo fine-tuneado y la línea base (antes de la especialización) son las siguientes:

| Metrica | Modelo fine-tuneado | Baseline |
|---|---|---|
| P@1 | 0.4678 | 0.3445 |
| MRR@10 | 0.6598 | 0.5761 |
| nDCG@10 | 0.7378 | 0.6789 |
| Pairwise accuracy | 0.6903 | no disponible |

Estos resultados indican una mejora sustancial en precisión de primer resultado y en ranking general. No se han publicado comparaciones con otros modelos de reranking médicos franceses en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 110M parámetros, en FP16 ocupa aproximadamente 220 MB; en FP32 unos 440 MB. La inferencia para un par consulta-documento requiere menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo RTX 3060, RTX 4060, o incluso GPUs integradas con suficiente memoria compartida.
- En consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales sin problemas.
- Opciones de despliegue: puede servirse con librerías de Hugging Face (transformers), o mediante servidores de inferencia como vLLM, TGI, o llama.cpp (si se convierte a GGUF). Al ser un cross-encoder, no es habitual en Ollama, pero es posible con adaptaciones.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es rápida; en una GPU RTX 3090 se pueden procesar cientos de pares por segundo, aunque el coste por par es mayor que un bi-encoder. No se dispone de cifras exactas del autor.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de reranking médicos franceses en los datos proporcionados. Como referencia, otros cross-encoders populares como `cross-encoder/ms-marco-MiniLM-L-6-v2` (multilingüe) o `BAAI/bge-reranker-base` podrían servir, pero no hay resultados públicos que los comparen con este modelo en el dominio médico francés. Se recomienda evaluar directamente en el caso de uso específico.

## Limitaciones y advertencias

- El benchmark se basa en preguntas de examen con respuestas gold; no constituye una prueba de calidad clínica en entornos de producción reales.
- El entrenamiento se realizó sobre datos de evaluación médica (MediQAl y FrenchMedMCQA); puede no generalizar bien a otros tipos de textos médicos (notas clínicas, informes, etc.) fuera de ese dominio.
- No se ha medido el fenómeno de catastrophic forgetting sobre el retrieval general (mMARCO); el modelo podría haber degradado su rendimiento en tareas no médicas. Es necesario evaluarlo antes de usarlo fuera del ámbito médico.
- Los distractores se generaron a partir de respuestas incorrectas verificadas, pero no se detalla el proceso de verificación ni la cobertura de temas.
- Limitado al idioma francés; no se recomienda su uso en otros idiomas sin reentrenamiento.
- Al ser un cross-encoder, no es adecuado para indexación a gran escala; debe usarse como segunda etapa tras un retriever eficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ymelka/camembert-med-reranker-base
- Modelo base (crossencoder-camembert-base-mmarcoFR): https://huggingface.co/antoinelouis/crossencoder-camembert-base-mmarcoFR
- Referencia de CamemBERT (Azure AI Catalog): https://ai.azure.com/catalog/models/camembert-base
- Copia de CamemBERT en DataikuNLP: https://huggingface.co/DataikuNLP/camembert-base
- CamemBERT original (almanach): https://huggingface.co/almanach/camembert-base
- Artículo sobre modelos de reranking para RAG: https://machinelearningmastery.com/top-5-reranking-models-to-improve-rag-results/
