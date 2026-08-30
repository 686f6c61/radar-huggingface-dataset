# SriRamanaAtmic/AtmicQuoterv2

## Resumen

AtmicQuoterv2 es un modelo de embeddings de frases (sentence-transformers) desarrollado por SriRamanaAtmic, dentro del Atmic Intelligence Project vinculado a Sri Ramanasramam. Está diseñado para tareas de similitud semántica y recuperación de información, especializándose en el corpus de enseñanzas y anécdotas de Ramana Maharshi. El modelo se basa en AtmicQuoterv1, su versión anterior, y se ha ajustado con un conjunto de datos de 1103 ejemplos utilizando la función de pérdida MultipleNegativesRankingLoss, lo que lo orienta a emparejar preguntas con pasajes relevantes del corpus.

Con 33,36 millones de parámetros y arquitectura BERT, es un modelo compacto adecuado para despliegue en entornos con recursos limitados. Su relevancia radica en ofrecer una herramienta de búsqueda semántica especializada en un dominio concreto: la obra y enseñanzas de Ramana Maharshi, un corpus que no suele estar bien cubierto por modelos genéricos. La fecha de creación (agosto de 2026) indica que es un modelo reciente, aunque su número de descargas es cero y no cuenta con valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (sentence-transformers) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el corpus de ejemplo esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, adaptada para generar embeddings de frases mediante sentence-transformers. El entrenamiento se realizó a partir del modelo base SriRamanaAtmic/AtmicQuoterv1, aplicando un ajuste fino (fine-tuning) con un dataset de 1103 ejemplos y la función de pérdida MultipleNegativesRankingLoss. Esta función es estándar para tareas de búsqueda semántica, ya que optimiza el modelo para que las frases emparejadas (pregunta-respuesta o consulta-pasaje) tengan embeddings cercanos en el espacio vectorial, mientras que los pares negativos (muestras aleatorias del lote) queden alejados.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset más allá del tamaño, ni sobre el uso de técnicas adicionales como hard negative mining o data augmentation. El modelo se entrenó con el framework de Hugging Face (generated_from_trainer), lo que sugiere un pipeline estándar de entrenamiento supervisado. No hay evidencia de fases de RLHF o DPO.

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica y recuperacion de informacion.
- Busqueda de pasajes relevantes dentro del corpus de ensenanzas de Ramana Maharshi a partir de preguntas en lenguaje natural.
- Soporte para busqueda por similitud coseno, como indican las metricas de evaluacion (accuracy, precision, recall).
- Integrable en pipelines de retrieval-augmented generation (RAG) y sistemas de pregunta-respuesta sobre el dominio.
- Capacidad multilingue: no confirmada; los ejemplos del widget estan en ingles, por lo que el modelo esta probablemente optimizado para ese idioma.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Busqueda semantica en bibliotecas digitales: permite localizar pasajes concretos dentro de las obras completas de Ramana Maharshi a partir de consultas tematicas, como "¿que dijo sobre la ira?" o "ensenanzas sobre el alcohol".
- Asistente virtual para estudiantes de advaita vedanta: un chatbot o herramienta de consulta que responda preguntas sobre las ensenanzas del maestro, utilizando el modelo para recuperar los fragmentos mas relevantes antes de generar una respuesta.
- Sistema de recomendacion de lecturas: dado un pasaje o tema, el modelo puede sugerir otros fragmentos relacionados dentro del corpus, facilitando el estudio comparativo.
- Anotacion y curacion de contenidos: ayuda a organizar y etiquetar automaticamente grandes colecciones de textos espirituales, agrupando pasajes por temas o conceptos.
- Investigacion academica en estudios religiosos: los investigadores pueden usar el modelo para rastrear la aparicion de conceptos clave (como "vichara" o "ego") a lo largo de la obra y analizar su evolucion.
- Integracion en pipelines RAG: el modelo puede servir como componente de recuperacion en un sistema de generacion aumentada, donde un LLM genera respuestas basandose en los pasajes recuperados, garantizando fidelidad a las fuentes.

## Benchmarks y rendimiento

El autor declara los siguientes resultados sobre el conjunto de validacion "atmic val" (no se especifica el tamaño ni la composicion del conjunto):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,0471 |
| Cosine Accuracy@3 | 0,0978 |
| Cosine Accuracy@5 | 0,1268 |
| Cosine Accuracy@10 | 0,2138 |
| Cosine Precision@1 | 0,0471 |
| Cosine Precision@3 | 0,0326 |
| Cosine Precision@5 | 0,0254 |
| Cosine Precision@10 | 0,0214 |
| Cosine Recall@1 | 0,0471 |
| Cosine Recall@3 | 0,0978 |
| Cosine Recall@5 | 0,1268 |
| Cosine Recall@10 | 0,2138 |

Estos valores son notablemente bajos, especialmente Accuracy@1 (4,7 %), lo que sugiere que el modelo tiene un rendimiento limitado en tareas de recuperacion de un solo resultado correcto. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo BERT de 33 millones de parametros, la inferencia requiere aproximadamente 130-200 MB de VRAM en precision FP32, y menos de 100 MB en cuantizacion INT8 o menor. Es compatible con cualquier GPU consumer moderna (incluso integradas) y con CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requieren GPUs de datacenter.
- Despliegue en CPU: viable con latencias de pocos milisegundos por embedding gracias al tamano reducido.
- Opciones de despliegue: compatible con sentence-transformers, Hugging Face Inference Endpoints (el tag "endpoints_compatible" lo confirma), y librerias de busqueda vectorial como FAISS o Qdrant para indexar los embeddings.
- Throughput estimado: no disponible, aunque por el tamano del modelo se espera un alto numero de consultas por segundo en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio (embeddings especializados en textos de Ramana Maharshi o filosofia advaita). Como referencia general, modelos como all-MiniLM-L6-v2 (tambien de 33 millones de parametros) ofrecen un rendimiento estandar en tareas de similitud semantica, pero no estan especializados en este corpus. Sin datos de evaluacion comparativa, no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento de recuperacion bajo: las metricas de accuracy@1 (4,7 %) indican que el modelo falla en la mayoria de las consultas si se exige el resultado correcto en primera posicion. Es adecuado solo para escenarios donde se permita revisar varios resultados (por ejemplo, top-10).
- Dominio muy restringido: el modelo esta entrenado exclusivamente sobre el corpus de Ramana Maharshi; su uso en otros dominios producira resultados pobres.
- Sesgos del corpus: las ensenanzas de Ramana Maharshi tienen una perspectiva filosofica y espiritual concreta; el modelo puede reflejar sesgos linguisticos o tematicos de las traducciones al ingles utilizadas.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, pero en un pipeline RAG los pasajes recuperados pueden no responder directamente a la pregunta si el modelo no encuentra el pasaje correcto.
- Licencia no especificada: no se indica la licencia de uso, lo que impide garantizar su uso comercial o en proyectos propietarios. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Idioma no confirmado: aunque los ejemplos estan en ingles, no se documentan oficialmente los idiomas soportados.
- Sin mantenimiento aparente: el modelo no tiene descargas ni likes, y no se ha publicado informacion sobre actualizaciones o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SriRamanaAtmic/AtmicQuoterv2
- Perfil de la organizacion (Atmic Intelligence Project - Sri Ramanasramam): https://huggingface.co/SriRamanaAtmic
- Modelo base AtmicQuoterv1: https://huggingface.co/SriRamanaAtmic/AtmicQuoterv1 (enlace inferido del campo base_model; no verificado en la busqueda)
