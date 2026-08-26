# vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka2

## Resumen

El modelo `vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka2` es un modelo de embeddings de texto denso, especializado en recuperación de información sobre ensayos clínicos. Es un fine-tuning del modelo open source `nomic-ai/nomic-embed-text-v1.5`, desarrollado por el usuario vab46, y entrenado sobre un dataset de 7869 ejemplos de pares pregunta-documento en el dominio clínico.

El modelo resuelve el problema de la búsqueda semántica en documentación biomédica, un dominio con vocabulario especializado y estructuras de texto complejas. Su relevancia actual radica en que permite construir sistemas de recuperación de información (RAG, clasificación, deduplicación) sobre ensayos clínicos, un área con alto volumen de datos no estructurados. La arquitectura es un BERT con atención rotatoria (nomic_bert), con 136,7 millones de parámetros y una ventana de contexto de 8192 tokens heredada del modelo base.

El entrenamiento emplea pérdidas de Matryoshka y de ranking de negativos múltiples, lo que permite generar embeddings de dimensiones variables (768, 512, 256, 128) sin perder funcionalidad, facilitando su uso en entornos con restricciones de almacenamiento o cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nomic_bert (BERT con atención rotatoria) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nomic-ai/nomic-embed-text-v1.5`, un modelo de embeddings basado en una variante de BERT con atención rotatoria (rotary position embeddings), que permite manejar secuencias de hasta 8192 tokens con un coste de memoria moderado. La adaptación se realizó mediante fine-tuning sobre un dataset de 7869 ejemplos de ensayos clínicos, compuesto por pares de documentos y preguntas extraídas de protocolos de ensayos.

El entrenamiento utilizó dos funciones de pérdida combinadas: `MatryoshkaLoss`, que permite truncar las dimensiones del embedding (768, 512, 256, etc.) manteniendo la calidad, y `MultipleNegativesRankingLoss`, que optimiza la similitud entre pares positivos frente a negativos del batch. La duración del entrenamiento fue de aproximadamente 1.6 horas. No se menciona el uso de RLHF o DPO; el proceso se limitó a un fine-tuning supervisado con contraste.

## Capacidades

- Generación de embeddings de texto densos de 768 dimensiones, con soporte de Matryoshka para reducir dimensionalidad (512, 256, 128) sin pérdida significativa de rendimiento.
- Recuperación de información semántica en documentos de ensayos clínicos, incluyendo protocolos, criterios de elegibilidad, objetivos y resultados.
- Similitud entre frases y documentos en el dominio biomédico, con sensibilidad al vocabulario técnico y a las estructuras de texto formalizadas.
- Soporte de contexto largo de hasta 8192 tokens, adecuado para párrafos extensos de protocolos clínicos.
- Integración con pipelines de sentence-transformers, permitiendo uso directo con librerías estándar de embeddings.

## Casos de uso

- Búsqueda semántica de ensayos clínicos: dado un texto de consulta (por ejemplo, "tratamiento para cáncer de mama en pacientes mayores de 60 años"), el modelo recupera los ensayos más relevantes de una base de datos de protocolos, gracias a su contexto largo y a su entrenamiento específico en preguntas clínicas.
- Clasificación de documentos de investigación: permite asignar automáticamente documentos a categorías temáticas (por ejemplo, oncología, cardiología) basándose en la similitud de embeddings, sin necesidad de etiquetas manuales.
- Sistemas de preguntas y respuestas sobre ensayos: al generar embeddings de preguntas y pasajes de protocolos, se puede construir un pipeline de RAG que extraiga la respuesta exacta a consultas como "¿cuál es el criterio de exclusión en este ensayo?".
- Deduplicación de protocolos: en bases de datos de ensayos clínicos, el modelo puede identificar duplicados o versiones similares de un mismo estudio, comparando la similitud coseno de los embeddings generados.
- Filtrado de documentos en revisiones sistemáticas: para investigadores que revisan miles de estudios, el modelo permite priorizar los documentos más relevantes para una pregunta de revisión, reduciendo el esfuerzo manual.
- Integración en bases de datos vectoriales para RAG en medicina: al combinarse con sistemas como FAISS o Milvus, permite construir asistentes de consulta clínica que respondan preguntas basadas en protocolos de ensayos, con contexto de hasta 8192 tokens.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor se basan en una tarea de recuperación de información sobre el dataset de ensayos clínicos. Se presentan para la dimensión de embedding 768:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.289 |
| Cosine Accuracy@3 | 0.370 |
| Cosine Accuracy@5 | 0.394 |
| Cosine Accuracy@10 | 0.433 |
| Cosine Precision@1 | 0.289 |
| Cosine Precision@3 | 0.123 |
| Cosine Precision@5 | 0.079 |
| Cosine Precision@10 | 0.043 |
| Cosine Recall@1 | 0.289 |
| Cosine Recall@3 | 0.370 |
| Cosine Recall@5 | 0.394 |
| Cosine Recall@10 | 0.433 |
| Cosine NDCG@10 | 0.359 |
| Cosine MRR@10 | 0.335 |
| Cosine MAP@100 | 0.341 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de precisión y recall son modestos, lo que indica que la tarea de recuperación en este dominio es desafiante y que el modelo puede requerir más datos o ajustes para alcanzar rendimiento superior.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 136,7 millones de parámetros. En FP32 ocupa aproximadamente 547 MB, por lo que puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM. En cuantización FP16 o int8, el uso de memoria sería aún menor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o superiores). No se requiere una GPU de alto rendimiento para inferencia de embeddings.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de consumo habituales.
- Opciones de despliegue: se puede servir con `sentence-transformers` (Python), `text-embeddings-inference` de Hugging Face, o con soluciones como FAISS/Milvus para indexación vectorial. También es compatible con la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo BERT de 137M de parámetros, la latencia típica de una inferencia con batch de 1 en GPU es de unos pocos milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| nomic-embed-text-v1.5 (base) | 137M | 8192 | apache-2.0 | Generalista |
| bge-m3-v1.5 | 100M | 8192 | apache-2.0 | Multilingue |
| text-embedding-3-small (OpenAI) | no publicados | 8192 | propietaria | Generalista, API |

El modelo se diferencia del base `nomic-embed-text-v1.5` por su especialización en ensayos clínicos, lo que mejora la precisión en ese dominio a costa de generalizar peor en textos no clínicos. Frente a alternativas multilingües como `bge-m3`, pierde la capacidad multilingüe pero mantiene el mismo contexto. No hay datos de benchmarks comparativos disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés (idioma `en`). No soporta otros idiomas, lo que limita su uso en entornos multilingües.
- La especialización en ensayos clínicos implica que su rendimiento fuera de ese dominio es previsiblemente inferior al del modelo base. No se recomienda para tareas genéricas de búsqueda de texto sin evaluación previa.
- El dataset de entrenamiento es pequeño (7869 ejemplos), lo que puede provocar sobreajuste a los patrones específicos de los protocolos de ensayo, con riesgo de alucinación en consultas muy alejadas del dominio.
- No se han publicado resultados de cuantización ni de rendimiento en otros idiomas o dominios.
- La licencia es apache-2.0, que permite uso comercial sin restricciones adicionales, pero es responsabilidad del usuario evaluar la calidad del modelo para su caso de uso.
- No se han reportado sesgos explícitos, pero al ser un modelo entrenado en datos de ensayos clínicos, puede heredar sesgos presentes en los protocolos originales (por ejemplo, demográficos o de enfermedades).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka2
- Modelo base: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Documentación de `sentence-transformers`: https://www.sbert.net/
