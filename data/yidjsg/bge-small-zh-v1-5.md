# yidjsg/bge-small-zh-v1.5

## Resumen

El modelo `yidjsg/bge-small-zh-v1.5` es una copia del modelo de embeddings `BAAI/bge-small-zh-v1.5`, desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) dentro de la familia FlagEmbedding. Se trata de un modelo de tipo BERT (encoder-only transformer) de tamaño pequeño, diseñado específicamente para generar representaciones vectoriales densas de texto en chino, con 23,95 millones de parámetros y una ventana de contexto de 512 tokens. Su propósito principal es convertir cualquier texto en un vector de 512 dimensiones que pueda utilizarse en tareas de recuperación semántica, clasificación, agrupamiento o búsqueda en bases de datos vectoriales.

La versión 1.5 de la familia BGE se publicó en septiembre de 2023 para corregir problemas de distribución de similitudes y mejorar la capacidad de recuperación sin necesidad de instrucciones previas. Este modelo es relevante porque ofrece un equilibrio excelente entre rendimiento y eficiencia para aplicaciones de procesamiento de lenguaje natural en chino, siendo una opción ligera y de código abierto (licencia MIT) que puede ejecutarse incluso en entornos con recursos limitados. Aunque el autor de esta copia es `yidjsg`, el modelo es idéntico al original de BAAI, por lo que todas las características técnicas y de uso se corresponden con el modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 23.954.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se puede cuantizar a int8/int4 con herramientas externas) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder-only con atención bidireccional. En concreto, la familia BGE (BAAI General Embedding) utiliza una configuración de 12 capas, 12 cabezas de atención y un tamaño de ocultación de 384 para la variante "small". El modelo fue entrenado con una combinación de datos masivos en chino, incluyendo el conjunto de datos público BAAI-MTP (liberado en septiembre de 2023), y posteriormente ajustado con técnicas de contraste y minería de negativos duros. La versión 1.5 incorpora una mejora en la distribución de similitudes, lo que reduce el problema de que todos los pares de texto obtuvieran puntuaciones altas, y además mejora la capacidad de recuperación sin necesidad de añadir instrucciones específicas a la consulta.

El entrenamiento se realizó en dos fases: primero un preentrenamiento general sobre corpus chino, y después un fine-tuning con pares de consulta-documento y ejemplos negativos minados. No se ha publicado información detallada sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO, ya que se trata de un modelo de embeddings y no de generación de texto.

## Capacidades

- Generacion de embeddings densos de texto en chino, con salida de 512 dimensiones.
- Busqueda semantica y recuperacion de pasajes relevantes a partir de una consulta.
- Clasificacion de textos mediante la comparacion de vectores (por ejemplo, con un clasificador lineal sobre los embeddings).
- Agrupamiento (clustering) de documentos por similitud semantica.
- Soporte para integracion en bases de datos vectoriales (por ejemplo, FAISS, Milvus, Qdrant) para alimentar sistemas de recuperacion aumentada (RAG) en modelos de lenguaje.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales, al ser un modelo exclusivamente de codificacion.

## Casos de uso

- Busqueda semantica en corpus chino: el modelo puede indexar documentos y responder a consultas en lenguaje natural devolviendo los pasajes mas relevantes, gracias a su ventana de 512 tokens y su capacidad para capturar relaciones semanticas.
- Recuperacion aumentada para LLMs (RAG): se puede usar como componente de embedding en pipelines de RAG para modelos como Qwen o ChatGLM, permitiendo que el LLM acceda a informacion externa en chino de forma eficiente.
- Clasificacion de textos: los embeddings generados pueden alimentar clasificadores lineales o redes neuronales ligeras para tareas como analisis de sentimiento, deteccion de spam o categorizacion de noticias en chino.
- Agrupamiento de documentos: permite agrupar grandes colecciones de articulos, informes o mensajes por similitud tematica, util para organizacion de conocimiento o deteccion de duplicados.
- Sistemas de recomendacion basados en contenido: al vectorizar descripciones de productos o articulos, se pueden calcular similitudes para sugerir elementos relacionados.
- Moderacion de contenido: comparando embeddings de mensajes con ejemplos etiquetados, se puede detectar contenido inapropiado o toxico en foros o redes sociales chinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de BAAI reporta buenos resultados en el benchmark C-MTEB (Chinese Massive Text Embedding Benchmark), pero no se incluyen cifras concretas en los datos proporcionados. Se recomienda consultar la documentacion oficial de FlagEmbedding para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 24 millones de parametros, el uso de memoria es muy reducido. En precision FP32, el modelo ocupa aproximadamente 96 MB; en FP16, unos 48 MB; y en int8, unos 24 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA T4, RTX 3060, RTX 4090 o incluso CPUs modernas pueden ejecutarlo sin problemas.
- Si cabe en consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en integradas con suficiente RAM compartida.
- Opciones de despliegue: se puede servir con librerias como sentence-transformers, FlagEmbedding, o mediante servidores de inferencia como vLLM (aunque no es optimo para embeddings), o mas adecuadamente con FastAPI y un modelo cargado en memoria. Tambien es compatible con herramientas como Xinference, que lo incluye en su catalogo.
- Latencia y throughput: al ser un modelo pequeno, la latencia por consulta es del orden de milisegundos en GPU (tipicamente <10 ms) y de decenas de milisegundos en CPU. El throughput puede alcanzar cientos de consultas por segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Idioma |
|---|---|---|---|---|---|
| bge-small-zh-v1.5 (este) | 24 M | 512 | 512 | MIT | chino |
| bge-base-zh-v1.5 | 102 M | 512 | 768 | MIT | chino |
| bge-large-zh-v1.5 | 326 M | 512 | 1024 | MIT | chino |
| text2vec-base-chinese | 102 M | 512 | 768 | Apache 2.0 | chino |

El modelo small es el mas ligero de la familia BGE en chino, con menor capacidad pero tambien menor coste computacional. Para tareas que requieran mayor precision, se recomienda usar las versiones base o large, aunque con mayor consumo de recursos. La comparativa con text2vec es orientativa, ya que no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos web chinos, el modelo puede reflejar sesgos presentes en esos corpus, como sesgos de genero, region o ideologicos.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto, solo produce vectores. Sin embargo, los embeddings pueden ser poco discriminativos para textos muy similares o con matices ironicos.
- Limitaciones de contexto: la ventana maxima es de 512 tokens, por lo que textos mas largos deben truncarse o dividirse en fragmentos, lo que puede perder informacion relevante.
- Limitaciones de idioma: el modelo esta entrenado exclusivamente para chino; no es adecuado para otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion sin restricciones, pero se recomienda atribuir la autoría original de BAAI.
- Caveat para produccion: al ser una copia del modelo original, se debe verificar que los pesos coinciden con los de BAAI para evitar problemas de integridad. Ademas, la ausencia de benchmarks publicados en esta copia obliga a validar el rendimiento en el caso de uso concreto.

## Enlaces

- Repositorio de HuggingFace de esta copia: https://huggingface.co/yidjsg/bge-small-zh-v1.5
- Modelo original de BAAI: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Repositorio GitHub de FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper tecnico de BGE: https://arxiv.org/pdf/2309.07597.pdf
- Paper de LLM-Embedder: https://arxiv.org/pdf/2310.07554.pdf
- Documentacion de Xinference para este modelo: https://inference.readthedocs.io/en/latest/models/builtin/embedding/bge-small-zh-v1.5.html
