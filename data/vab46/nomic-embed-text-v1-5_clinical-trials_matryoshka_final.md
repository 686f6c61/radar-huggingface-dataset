# vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka_final

## Resumen

Este modelo es un fine-tuning de `nomic-ai/nomic-embed-text-v1.5`, un embedding de texto denso de 137 millones de parámetros, especializado en la recuperación de información sobre ensayos clínicos. Lo desarrolla el usuario vab46 y se distribuye bajo licencia Apache 2.0. El ajuste se realizó sobre un dataset de 7.079 ejemplos de ensayos clínicos, empleando las pérdidas MatryoshkaLoss y MultipleNegativesRankingLoss, lo que permite obtener representaciones vectoriales truncables (dimensiones 64, 128, 256, 512 y 768) con una pérdida mínima de calidad. Su relevancia radica en que aborda un dominio muy específico —la búsqueda semántica de ensayos clínicos y el emparejamiento de pacientes con criterios de elegibilidad— donde los modelos genéricos suelen fallar por falta de vocabulario biomédico y de comprensión de estructuras de datos clínicos.

La arquitectura base es un BERT con atención estándar, con una ventana de contexto de 8.192 tokens, lo que permite procesar documentos completos de ensayos sin necesidad de fragmentación agresiva. El modelo está pensado para integrarse en pipelines de retrieval aumentado (RAG) o en sistemas de búsqueda semántica dentro del ámbito sanitario y farmacéutico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (nomic_bert) con Matryoshka Representation Learning |
| Parametros totales | 136.731.648 (~137M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion posterior) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `nomic-embed-text-v1.5` es un transformer BERT con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, entrenado con Matryoshka Representation Learning. Esto significa que las representaciones finales pueden truncarse a 64, 128, 256, 512 o 768 dimensiones en tiempo de consulta, ofreciendo un control directo sobre el coste computacional y la velocidad sin necesidad de reentrenar. El fine-tuning se realizo sobre un dataset de 7.079 ejemplos de ensayos clinicos, combinando dos funciones de perdida: MatryoshkaLoss, que fuerza la consistencia entre las distintas dimensiones truncadas, y MultipleNegativesRankingLoss, que optimiza la similitud coseno entre pares positivos frente a negativos dentro del lote. El entrenamiento se llevo a cabo con la libreria sentence-transformers, y el checkpoint final se guardo con pesos en formato safetensors.

No se dispone de informacion detallada sobre la composicion exacta del dataset de entrenamiento ni sobre el numero de epocas o el tamaño del lote. El modelo hereda las capacidades del base, incluyendo la generacion de embeddings contextuales y la alineacion con tareas de similitud semantica.

## Capacidades

- Generacion de embeddings de texto densos para frases, parrafos y documentos completos de hasta 8.192 tokens.
- Similitud semantica entre textos, optimizada para el dominio de ensayos clinicos (titulos, resumenes, criterios de inclusion y exclusion).
- Recuperacion de informacion (retrieval) con soporte de Matryoshka: se puede truncar la dimension del embedding a 64, 128, 256, 512 o 768 segun el compromiso calidad/velocidad deseado.
- Búsqueda por similitud coseno, con metricas de accuracy, precision y recall publicadas para la dimension 768.
- Capacidad multilingue limitada: el modelo base soporta varios idiomas, pero el fine-tuning se realizo exclusivamente con datos en ingles, por lo que su rendimiento en otros idiomas puede degradarse.
- No soporta tool calling, generacion de texto ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semantica de ensayos clinicos: dado un texto libre (por ejemplo, una pregunta de un paciente o un resumen de una patologia), el modelo recupera los ensayos mas relevantes de una base de datos. Su contexto de 8.192 tokens permite indexar titulo, resumen y criterios de elegibilidad completos sin fragmentar.
- Emparejamiento paciente-ensayo (patient-trial matching): se pueden generar embeddings de los criterios de inclusion/exclusion de cada ensayo y del perfil clinico de un paciente, y calcular la similitud para sugerir ensayos elegibles. La especializacion en vocabulario clinico mejora la precision frente a modelos genericos.
- Deduplicacion de registros de ensayos: al comparar embeddings de documentos de ensayos, se pueden identificar duplicados o versiones actualizadas de un mismo estudio en distintas bases de datos (ClinicalTrials.gov, EUCTR, etc.).
- Clustering y organizacion de corpus de ensayos: agrupar ensayos por area terapeutica, poblacion objetivo o tipo de intervencion mediante la distancia coseno de sus embeddings.
- Sistemas de recomendacion de literatura clinica: integrar el modelo en un pipeline RAG para responder preguntas sobre ensayos, combinando la recuperacion con un LLM generativo.
- Analisis de competencia farmaceutica: comparar carteras de ensayos de distintas companias o instituciones mediante similitud semantica de sus protocolos.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a una tarea de recuperacion de informacion sobre el dataset de ensayos clinicos, evaluada con similitud coseno en la dimension 768. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,5476 |
| Cosine Accuracy@3 | 0,6620 |
| Cosine Accuracy@5 | 0,6938 |
| Cosine Accuracy@10 | 0,7395 |
| Cosine Precision@1 | 0,5476 |
| Cosine Precision@3 | 0,2207 |
| Cosine Precision@5 | 0,1388 |
| Cosine Precision@10 | 0,0740 |
| Cosine Recall@1 | 0,5476 |
| Cosine Recall@3 | 0,6620 |
| Cosine Recall@5 | 0,6938 |
| Cosine Recall@10 | 0,7395 |

Estos valores indican que, en la dimension 768, el modelo acierta en el primer resultado en aproximadamente el 55% de las consultas, y en el 74% cuando se consideran los 10 primeros resultados. No se han publicado resultados para otras dimensiones truncadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en float32, el modelo ocupa aproximadamente 550 MB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM. Con cuantizacion a int8 o float16, el uso de memoria se reduce a unos 300-400 MB.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo es ligero y se puede ejecutar en CPU para lotes pequenos, aunque la GPU acelera notablemente el calculo de embeddings.
- Opciones de despliegue: sentence-transformers (inferencia local), Hugging Face Inference Endpoints, vLLM (con soporte de embeddings), llama.cpp (conversion a GGUF), y cualquier framework compatible con safetensors.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU RTX 3090, se puede estimar un throughput de varios cientos de documentos por segundo para lotes de 32, dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en el dominio de ensayos clinicos. Como referencia, se puede comparar con el modelo base `nomic-embed-text-v1.5` y con alternativas genericas de embeddings:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| nomic-embed-text-v1.5 (base) | 137M | 8.192 | Apache 2.0 | Generico, multilingue |
| vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka_final | 137M | 8.192 | Apache 2.0 | Ensayos clinicos (ingles) |
| BGE-M3 | 568M | 8.192 | MIT | Generico, multilingue, soporta sparse+dense |

El modelo fine-tuneado deberia superar al base en tareas de retrieval de ensayos clinicos, pero no se han publicado metricas comparativas. BGE-M3 ofrece capacidades adicionales (embeddings sparse y dense) pero no esta especializado en el dominio clinico.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en ingles; su rendimiento en otros idiomas es impredecible y probablemente inferior al del modelo base.
- La especializacion en ensayos clinicos puede provocar una degradacion del rendimiento en tareas genericas de similitud semantica fuera de este dominio.
- El dataset de entrenamiento (7.079 ejemplos) es relativamente pequeno, lo que puede limitar la generalizacion a variaciones no vistas de redaccion de ensayos.
- No se han publicado analisis de sesgos. El modelo podria reflejar sesgos presentes en los datos de ensayos clinicos (por ejemplo, sobrerrepresentacion de ciertas poblaciones o patologias).
- Riesgo de alucinacion no aplica directamente, ya que el modelo no genera texto, pero si puede producir falsos positivos en la recuperacion si los embeddings de textos semanticamente similares pero irrelevantes estan proximos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en entornos regulados (sanidad, farmacia).
- Para produccion, es recomendable evaluar el modelo con un conjunto de validacion propio del dominio objetivo, ya que las metricas publicadas provienen de un unico dataset y no son generalizables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vab46/nomic-embed-text-v1.5_Clinical-Trials_Matryoshka_final
- Modelo base nomic-embed-text-v1.5: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Blog de Nomic sobre nomic-embed-text-v1.5: https://www.nomic.ai/blog/posts/nomic-embed-text-v1.5
- Technical report de nomic-embed-text-v1.5: https://arxiv.org/abs/2402.18519
