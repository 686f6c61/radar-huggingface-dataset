# ymelka/camembert-med-reranker-distil

## Resumen

El modelo `ymelka/camembert-med-reranker-distil` es un cross-encoder de reranking especializado en el dominio médico francés, desarrollado por el laboratorio `camembert-med` a partir del modelo base `antoinelouis/crossencoder-distilcamembert-mmarcoFR`. Con 68 millones de parámetros, está diseñado para reordenar documentos según su relevancia frente a una consulta médica, un paso crítico en sistemas de recuperación de información y respuesta a preguntas clínicas.

Su relevancia actual radica en que ofrece una alternativa ligera y eficiente para entornos de producción con recursos limitados, ya que puede ejecutarse en CPU sin sacrificar un rendimiento competitivo en tareas de reranking médico en francés. El modelo fue fine-tuneado sobre conjuntos de datos médicos públicos (MediQAl y FrenchMedMCQA) y presenta mejoras significativas frente al modelo base antes de la especialización, con un aumento de más de 11 puntos en P@1 y de casi 8 puntos en MRR@10. Su licencia Apache-2.0 facilita su adopción tanto en investigación como en aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DistilCamemBERT (transformer encoder) |
| Parametros totales | 68.095.489 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | fr (francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilCamemBERT, una versión destilada de CamemBERT, que a su vez es un transformer encoder monolingüe para francés. Como cross-encoder, recibe simultáneamente la consulta y el documento (separados por el token especial de separación) y produce una puntuación de relevancia binaria o continua. Esta arquitectura permite una mayor interacción entre consulta y documento que los bi-encoders, a costa de un mayor coste computacional, pero es especialmente eficaz en tareas de reranking de precisión.

El entrenamiento se realizó mediante fine-tuning supervisado sobre los conjuntos de datos médicos MediQAl (licencia CC-BY-4.0) y FrenchMedMCQA (licencia Apache-2.0). Los distractores utilizados como ejemplos negativos son las respuestas incorrectas de las propias preguntas, verificadas previamente. El proceso se ejecutó en un pipeline de GPU gratuito de Kaggle, con control de versiones completo. No se menciona el uso de RLHF ni de DPO; se trata de un fine-tuning clásico de clasificación binaria con pares relevantes/no relevantes.

## Capacidades

- Reranking de documentos médicos en francés: ordena listas de resultados según su relevancia para una consulta clínica o científica.
- Generación de puntuaciones de relevancia: produce una puntuación para cada par consulta-documento, usable para filtrar o reordenar resultados.
- Especialización en dominios médicos: entrenado con preguntas de examen médico francés, lo que lo hace útil para sistemas de QA y recuperación de información clínica.
- Integración en pipelines de retrieval-augmented generation (RAG): puede usarse como etapa de reranking tras una búsqueda inicial con bi-encoders.
- Soporte de contextos de documento moderadamente largos: al ser un transformer, la longitud máxima depende de la configuración de DistilCamemBERT (típicamente 512 tokens), aunque el dato exacto no está disponible.
- Multilingüe limitado: solo francés, sin capacidades multilingües adicionales.

## Casos de uso

- Búsqueda de literatura médica: un sistema de recuperación de artículos científicos puede usar este reranker para mejorar la precisión de los resultados cuando la consulta es en francés, reordenando los documentos obtenidos de una búsqueda inicial.
- Asistente de diagnóstico clínico: integrado en un sistema de apoyo a la decisión, puede seleccionar los pasajes más relevantes de historiales médicos o guías clínicas para responder preguntas de un profesional sanitario.
- Preguntas de examen médico: dado que se entrenó con preguntas de exámenes franceses, es útil para plataformas de preparación de oposiciones o tests médicos, ordenando respuestas candidatas por relevancia.
- Chatbots de salud en francés: para un chatbot que responde dudas médicas, el reranker puede seleccionar la información más pertinente de una base de conocimiento antes de generar la respuesta final.
- Búsqueda en expedientes electrónicos de salud: permite ordenar fragmentos de informes clínicos según su relación con una consulta específica del facultativo, mejorando la eficiencia en entornos hospitalarios.
- Sistemas RAG médicos: combina un bi-encoder para recuperación inicial y este cross-encoder para reranking, mejorando la calidad de las respuestas generadas por un LLM en dominios médicos francófonos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de test oficial de preguntas de examen médico francés (8965 consultas / 47789 pares consulta-documento). La comparación se realiza contra el modelo base sin especializar.

| Metrica | Modelo especializado (camembert-med-reranker-distil) | Baseline (antes de especialización) |
|---|---|---|
| P@1 | 0.4631 | 0.3445 |
| MRR@10 | 0.6560 | 0.5761 |
| nDCG@10 | 0.7355 | 0.6789 |
| Pairwise accuracy | 0.6836 | no disponible |

Estos resultados muestran una mejora sustancial en todas las métricas tras el fine-tuning médico, especialmente en P@1 (+34.4% relativo). No se han publicado comparaciones con otros cross-encoders médicos en francés ni con modelos de mayor tamaño.

## Requisitos de hardware

- Al ser un modelo de 68 millones de parámetros, es ligero y puede ejecutarse en CPU con razonable velocidad para tareas de reranking por lotes. Se recomienda para producción en CPU según el autor.
- La huella de memoria estimada es de aproximadamente 270 MB en FP32 (68M × 4 bytes), reducible a ~135 MB en FP16 o ~68 MB en int8, aunque no se proporcionan cuantizaciones oficiales.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060 o similares con 6-8 GB de VRAM, y por supuesto en GPUs profesionales como A10, A100 o H100.
- Opciones de despliegue: puede servirse con Hugging Face Transformers en Python, exportarse a ONNX para inferencia optimizada, o usarse con librerías como Sentence-Transformers (aunque es un cross-encoder, no un bi-encoder). También puede integrarse en vLLM o TGI como parte de un pipeline de reranking, aunque no hay soporte nativo documentado.
- Latencia estimada: para un par consulta-documento de longitud media (128 tokens), una CPU moderna (8 núcleos) puede procesar decenas de pares por segundo; una GPU como RTX 4090 puede superar los 1000 pares por segundo. Estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

No se dispone de comparativas públicas con otros cross-encoders médicos en francés. El único punto de referencia es el modelo base `antoinelouis/crossencoder-distilcamembert-mmarcoFR`, del cual deriva. Este modelo base está entrenado en el dataset mMARCO-fr para reranking general en francés, pero sin especialización médica. Los resultados del benchmark muestran que la especialización mejora significativamente el rendimiento en dominios médicos, a costa de un posible olvido catastrófico en tareas generales (no medido por el autor). No se han encontrado otros modelos comparables de tamaño similar en el ecosistema francés médico.

## Limitaciones y advertencias

- Los benchmarks se basan en preguntas de examen (gold) y no constituyen una prueba de calidad clínica en entornos reales de producción.
- El modelo se entrenó exclusivamente con datos médicos franceses; su rendimiento fuera de este dominio o en otros idiomas no está garantizado y podría degradarse.
- No se ha evaluado el posible olvido catastrófico sobre recuperación general (mMARCO); se recomienda evaluar antes de usarlo en tareas no médicas.
- La longitud de contexto no está documentada; se asume la limitación típica de DistilCamemBERT (512 tokens), lo que puede ser insuficiente para documentos largos.
- No se proporcionan cuantizaciones oficiales ni integraciones con frameworks de despliegue específicos, lo que puede requerir trabajo adicional de adaptación.
- El autor advierte que los resultados del benchmark no son una prueba de validez clínica; cualquier uso en medicina debe ser supervisado por profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ymelka/camembert-med-reranker-distil
- Modelo base (crossencoder-distilcamembert-mmarcoFR): https://huggingface.co/antoinelouis/crossencoder-distilcamembert-mmarcoFR
- Documentación de DistilCamemBERT (colección): https://huggingface.co/collections/cmarkea/distilcamembert
- Repositorio de CamemBERT (fairseq): https://github.com/facebookresearch/fairseq/blob/main/examples/camembert/README.md
