# vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka

## Resumen

El modelo `vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka` es un ajuste fino (fine-tuning) del modelo de embeddings `nomic-ai/nomic-embed-text-v1.5` especializado en el dominio de ensayos clínicos. Desarrollado por el usuario `vab46`, este modelo está diseñado para representar textos relacionados con protocolos de ensayos clínicos, criterios de inclusión, títulos y resúmenes de estudios, facilitando tareas de recuperación de información semántica y búsqueda de similitudes en bases de datos biomédicas. Utiliza una arquitectura basada en `nomic_bert`, con 136,7 millones de parámetros y una ventana de contexto heredada del modelo base (8192 tokens, aunque el ajuste no lo confirma explícitamente). Su relevancia radica en la necesidad de procesar documentación clínica compleja y extensa, donde la precisión semántica es crítica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nomic_bert` (BERT modificado, con atención al contexto largo) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base `nomic-embed-text-v1.5` tiene 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nomic-ai/nomic-embed-text-v1.5`, un embedder de texto basado en `nomic_bert`, una variante de BERT con atención adaptada para contextos largos. El ajuste fino se realizó con un conjunto de datos propio de 7.193 muestras (dataset_size:7193) procedentes de ensayos clínicos, utilizando dos funciones de pérdida combinadas: `MatryoshkaLoss` y `MultipleNegativesRankingLoss`. La primera permite entrenar representaciones con dimensiones de salida reducidas (por ejemplo, 768, 512, 256) sin pérdida significativa de calidad, mientras que la segunda optimiza la similitud entre pares positivos y negativos, típica en tareas de recuperación de información. No se han publicado detalles sobre la composición exacta del dataset ni sobre el número de tokens de entrenamiento, pero el tamaño reducido sugiere un ajuste dirigido a un dominio concreto.

## Capacidades

- Generación de embeddings semánticos para texto en inglés, especialmente orientados a documentos de ensayos clínicos (títulos, resúmenes, criterios de inclusión y exclusión).
- Recuperación de información mediante similitud coseno, con soporte para dimensiones de salida variables gracias a la pérdida Matryoshka (por ejemplo, 768, 512, 256).
- Búsqueda de similitud semántica entre textos, útil para deduplicación de documentos o agrupamiento de estudios clínicos por temática.
- Clasificación de pasajes relevantes dentro de un conjunto de documentos clínicos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo de embeddings puro, no generativo.

## Casos de uso

- **Búsqueda semántica de ensayos clínicos**: permite encontrar estudios clínicos relevantes a partir de una consulta libre, usando embeddings de alta dimensión para comparar títulos y resúmenes. El modelo ha sido entrenado específicamente con datos de ensayos clínicos, por lo que captura terminología médica y criterios de inclusión con mayor precisión que un modelo genérico.
- **Comparación de criterios de inclusión**: dado un conjunto de criterios de elegibilidad, el modelo puede calcular la similitud entre distintos ensayos para identificar solapamientos o divergencias, útil en revisiones sistemáticas o meta-análisis.
- **Matching de pacientes con ensayos clínicos**: al representar tanto el perfil de un paciente como los criterios de un ensayo, el modelo permite evaluar la compatibilidad semántica, mejorando la selección de candidatos en plataformas de reclutamiento clínico.
- **Deduplicación de documentos**: en repositorios de literatura clínica, el modelo puede identificar duplicados o variantes del mismo estudio comparando embeddings de títulos y resúmenes.
- **Clasificación automática de documentos**: los embeddings pueden alimentar clasificadores supervisados para etiquetar ensayos por fase, especialidad o tipo de intervención, usando un número reducido de dimensiones gracias a la propiedad Matryoshka.
- **Sistema de recomendación de literatura**: un sistema puede sugerir artículos o ensayos relacionados a un investigador en función de la similitud semántica de los resúmenes, mejorando la exploración bibliográfica.

## Benchmarks y rendimiento

El autor del modelo ha publicado resultados en una tarea de recuperación de información, con métricas de precisión, recall y NDCG a varios niveles. A continuación se presentan los valores declarados en la model card (no verificados de forma independiente):

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0.38875 |
| Cosine Accuracy@3 | 0.51375 |
| Cosine Accuracy@5 | 0.5625 |
| Cosine Accuracy@10 | 0.60625 |
| Cosine Precision@1 | 0.38875 |
| Cosine Precision@3 | 0.17125 |
| Cosine Precision@5 | 0.1125 |
| Cosine Precision@10 | 0.060625 |
| Cosine Recall@1 | 0.38875 |
| Cosine Recall@3 | 0.51375 |
| Cosine Recall@5 | 0.5625 |
| Cosine Recall@10 | 0.60625 |
| Cosine NDCG@10 | 0.49719 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados indican un rendimiento moderado en la tarea de recuperación de información, con un NDCG@10 de aproximadamente 0,50, lo que sugiere que el modelo es útil para búsquedas de relevancia, aunque no alcanza niveles de precisión muy altos.

## Requisitos de hardware

- **VRAM estimada**: el modelo ocupa unos 0,5 GB en pesos de precisión FP32 (136,7M parámetros). En cuantización INT8, podría reducirse a ~0,25 GB, lo que lo hace viable en cualquier GPU con más de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU de consumo moderna, como NVIDIA RTX 3060 (12 GB) o superior, es suficiente. Incluso una GTX 1650 (4 GB) podría ejecutarlo sin problemas.
- **Compatibilidad con GPU consumer**: sí, cabe en prácticamente cualquier GPU actual.
- **Opciones de despliegue**: se puede servir con `sentence-transformers` (para inferencia en Python), con `text-embeddings-inference` (TEI) para endpoints de producción, o con `Ollama` si se convierte a formato GGUF (aunque no se ha indicado soporte oficial). También es compatible con `vLLM` para embeddings, aunque su uso más común es con TEI.
- **Latencia y throughput**: al ser un modelo de embeddings pequeño (137M), la latencia típica es de unos pocos milisegundos por lote en GPU. Por ejemplo, en una RTX 4090 se pueden procesar cientos de textos por segundo con un batch de 32, dependiendo de la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma | Rendimiento (MTEB) |
|---|---|---|---|---|---|
| `nomic-embed-text-v1.5` (base) | 137M | 8192 | Apache-2.0 | en | ~60,0 (MTEB) |
| `vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka` | 137M | 8192 (heredado) | Apache-2.0 | en | no disponible (solo métricas de recuperación propias) |
| `BAAI/bge-large-en-v1.5` | 335M | 512 | MIT | en | ~64,2 (MTEB) |
| `intfloat/e5-base-v2` | 110M | 512 | MIT | en | ~60,8 (MTEB) |

El modelo ajustado para ensayos clínicos no dispone de resultados en MTEB, pero su rendimiento en recuperación de información específica del dominio puede ser superior al del base en ese campo, a costa de menor generalización. `bge-large-en-v1.5` es más grande y mejor en benchmarks generales, pero su contexto es más corto (512 tokens) y no está especializado en clínica.

## Limitaciones y advertencias

- **Solo inglés**: el modelo está entrenado únicamente con textos en inglés, por lo que no sirve para documentos clínicos en otros idiomas.
- **Especialización excesiva**: al ser un fine-tuning sobre un dataset pequeño (7.193 muestras), puede presentar sesgos hacia el tipo de datos de ensayos clínicos utilizados, y podría perder rendimiento en textos generales o en dominios biomédicos no cubiertos.
- **Riesgo de alucinación**: no es un modelo generativo, por lo que no produce texto nuevo; sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, desequilibrios en tipos de estudios o poblaciones).
- **Contexto no confirmado**: aunque el modelo base tiene 8192 tokens, el ajuste fino no especifica si se mantiene esa longitud máxima; es posible que se haya truncado o modificado. Se recomienda probar con textos largos.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base también es Apache-2.0, por lo que no hay restricciones adicionales. No obstante, los datos de entrenamiento no se han publicado, lo que dificulta la auditoría.
- **Sin soporte para tool calling**: no se puede utilizar para tareas de razonamiento o ejecución de funciones; es exclusivamente para embeddings.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka)
- [Modelo base `nomic-ai/nomic-embed-text-v1.5`](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5)
- [Informe técnico de Nomic Embed (TMLR)](https://mlanthology.org/tmlr/2025/nussbaum2025tmlr-nomic/)
- [Model card de Nomic Embed en GitHub (Docker)](https://github.com/docker/model-cards/blob/main/ai/nomic-embed-text-v1.5.md)
- [Imagen Docker de nomic-embed-text-v1.5](https://hub.docker.com/r/ai/nomic-embed-text-v1.5)
