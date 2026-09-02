# vishnuprabha72/sbert-legal-v1-legacy

## Resumen

`sbert-legal-v1-legacy` es un modelo de embeddings de frases (sentence embeddings) especializado en el dominio legal, desarrollado por el usuario `vishnuprabha72` a partir del modelo base `sentence-transformers/all-MiniLM-L6-v2`. Se trata de un fine-tuning de un transformer BERT de tamaño reducido (22,7 millones de parámetros) entrenado con la función de pérdida `MultipleNegativesRankingLoss` sobre un dataset de 90.142 ejemplos de pares de textos jurídicos, aparentemente centrados en jurisprudencia india (sentencias, arbitraje, derecho constitucional, etc.).

El modelo está diseñado para tareas de similitud semántica y recuperación de información (information retrieval) en el ámbito legal. Su relevancia radica en que ofrece una alternativa ligera y de bajo coste computacional para indexar y buscar documentos legales, donde la terminología especializada y las citas jurisprudenciales requieren representaciones vectoriales adaptadas al dominio. Al estar basado en MiniLM-L6, hereda una arquitectura eficiente que permite su ejecución en CPU y en GPUs de gama baja.

La ficha de HuggingFace no declara licencia, idiomas soportados ni longitud de contexto explícita, por lo que estos datos se indican como no disponibles. El repositorio tiene un tamaño de 0,1 GB y los pesos se almacenan en formato `safetensors`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6) con pooling mean, fine-tuned con SentenceTransformer |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-MiniLM-L6-v2 soporta hasta 256 tokens por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos del widget están en inglés legal indio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 6 capas con 384 dimensiones ocultas y 12 cabezas de atención, que produce embeddings de 384 dimensiones. El fine-tuning se realizó con la librería `sentence-transformers` utilizando la función de pérdida `MultipleNegativesRankingLoss`, una técnica estándar para entrenar modelos de similitud semántica con pares positivos y negativos implícitos (los negativos se muestrean del batch). El dataset de entrenamiento contiene 90.142 ejemplos, según los tags de la model card.

No se especifican detalles sobre el número de épocas, la composición exacta del dataset ni si se aplicaron técnicas adicionales como hard negative mining o data augmentation. Tampoco se menciona el uso de RLHF o DPO, ya que se trata de un modelo de embeddings y no generativo. La referencia a los artículos arXiv 1908.10084 (Sentence-BERT) y 1807.03748 (BERT) en los tags indica que el entrenamiento sigue la metodología descrita en esos trabajos.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para similitud semántica.
- Recuperación de información (retrieval) mediante similitud coseno, con métricas de accuracy@k, precision@k y recall@k reportadas.
- Búsqueda semántica en corpus legales: dado un texto de consulta, encuentra pasajes o documentos relevantes.
- Clasificación de documentos legales por similitud (agrupación, deduplicación, recomendación).
- Soporte para integración con `sentence-transformers` y `text-embeddings-inference` (según tags `endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en jurisprudencia: un despacho de abogados puede indexar sentencias y consultar con lenguaje natural ("¿qué constituye un fallo per incuriam en arbitraje?") para recuperar los pasajes más relevantes. El modelo está entrenado con textos legales reales, por lo que entiende terminología como "per incuriam", "EXIM Policy" o "Section 302 IPC".
- Asistencia a la investigación legal: investigadores y estudiantes pueden encontrar precedentes o doctrina relacionada con un concepto jurídico concreto sin depender de palabras clave exactas.
- Deduplicación de documentos legales: al comparar embeddings, se pueden identificar versiones duplicadas o muy similares de contratos, escritos o resoluciones.
- Agrupación temática de expedientes: clasificar automáticamente un conjunto de documentos legales en categorías (arbitraje, propiedad, reservas, etc.) mediante clustering sobre los embeddings.
- Sistemas de recomendación de documentos: en una plataforma de gestión documental, sugerir casos o artículos relacionados con el que el usuario está consultando.
- Indexación de bases de datos jurídicas: generar vectores para todos los documentos de un corpus y almacenarlos en una base vectorial (FAISS, Milvus, etc.) para consultas de similitud a gran escala.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el modelo-index de la model card, sobre un conjunto de validación (val) para la tarea de recuperación de información:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,5051 |
| Cosine Accuracy@3 | 0,7408 |
| Cosine Accuracy@5 | 0,8375 |
| Cosine Accuracy@10 | 0,9250 |
| Cosine Precision@1 | 0,5051 |
| Cosine Precision@3 | 0,3231 |
| Cosine Precision@5 | 0,2406 |
| Cosine Precision@10 | 0,1484 |
| Cosine Recall@1 | 0,2525 |
| Cosine Recall@3 | 0,4836 |
| Cosine Recall@5 | 0,5998 |
| Cosine Recall@10 | 0,7393 |

Estos valores indican que el modelo es razonablemente eficaz para recuperar el documento correcto entre los 10 primeros resultados (accuracy@10 de 0,925), aunque la precisión es baja en rangos superiores, lo que sugiere que el corpus de validación contiene muchos documentos similares. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 22,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 91 MB. En FP16 serían unos 45 MB, y con cuantización de 8 bits unos 23 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650, RTX 3060, o incluso integradas con soporte CUDA. También funciona en CPU sin problemas.
- Ejecución en CPU: es viable para inferencia en lote o en tiempo real con baja latencia (del orden de milisegundos por frase en un procesador moderno).
- Opciones de despliegue: se puede servir con `sentence-transformers` directamente, o mediante `text-embeddings-inference` (TGI) según los tags del modelo. También es compatible con `HuggingFace Inference Endpoints`.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamaño del modelo se espera un throughput alto (cientos de frases por segundo en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de `all-MiniLM-L6-v2`, que es un modelo generalista de embeddings. Otros modelos legales como `InLegalBERT` (de law-ai) o `legal-bert-v1` (de LambdaX-AI) existen en el ecosistema, pero no se han encontrado datos de rendimiento comparables en la información disponible. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgo geográfico y jurisdiccional: los ejemplos del widget y el contexto del dataset sugieren que el modelo está entrenado principalmente con jurisprudencia india (Tribunal Supremo de la India, leyes como la Bombay Town Planning Act, EXIM Policy, etc.). Su rendimiento en otros sistemas legales (español, europeo, estadounidense) puede ser significativamente inferior.
- Longitud de contexto limitada: el modelo base `all-MiniLM-L6-v2` tiene una longitud máxima de secuencia de 256 tokens (configurable hasta 512). Los documentos legales suelen ser extensos, por lo que será necesario truncar o dividir el texto en fragmentos.
- No es un modelo generativo: no puede redactar textos legales, resumir sentencias ni responder preguntas de forma abierta. Solo produce embeddings.
- Riesgo de alucinación: no aplica directamente, pero los embeddings pueden producir falsas similitudes si el texto de entrada contiene terminología ambigua o fuera del dominio de entrenamiento.
- Licencia no declarada: al no especificarse la licencia, el uso comercial puede ser problemático. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Sin garantía de calidad: el modelo tiene 0 descargas y 0 likes en HuggingFace, y no se han publicado evaluaciones externas. Los benchmarks declarados son auto-reportados y no verificados (campo `verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vishnuprabha72/sbert-legal-v1-legacy
- Documentación de Sentence Transformers: https://www.sbert.net/
- Página de modelos preentrenados de SBERT: https://www.sbert.net/docs/sentence_transformer/pretrained_models.html
- Perfil de GitHub del autor: https://github.com/vishnuprabha72
