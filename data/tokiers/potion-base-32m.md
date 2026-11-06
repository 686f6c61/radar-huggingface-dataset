# tokiers/potion-base-32M

## Resumen

potion-base-32M es un modelo de embeddings estáticos desarrollado por tokiers, una reproducción del modelo original de Minish Lab, construido con la librería Model2Vec y preentrenado mediante Tokenlearn. Se trata de una destilación del sentence transformer `baai/bge-base-en-v1.5` que sustituye la inferencia basada en transformer por una tabla de embeddings estáticos de aproximadamente 32,3 millones de parámetros. El resultado es un modelo que calcula representaciones vectoriales de texto entre uno y dos órdenes de magnitud más rápido que un transformer denso, tanto en CPU como en GPU, manteniendo una calidad competitiva en tareas de similitud semántica y clasificación.

El modelo resuelve el problema del coste computacional en pipelines de búsqueda semántica, deduplicación, clustering y recuperación a gran escala, donde la latencia y el consumo de memoria son críticos. Al no requerir atención ni cómputo por token más allá de una búsqueda en tabla y una agregación de vectores, puede desplegarse en entornos con recursos muy limitados, incluidos dispositivos de borde y CPUs sin aceleración. Frente a potion-base-8M, utiliza un vocabulario mayor, lo que mejora tareas que requieren cobertura léxica amplia.

La versión alojada por tokiers incluye además un tokenizador precompilado de tokie (`tokenizer.tkz`), que se presenta como reemplazo directo de los tokenizadores de Hugging Face con una velocidad de tokenización hasta cinco veces superior. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales. El modelo está pensado exclusivamente para inglés, ya que el corpus de destilación es `minishlab/tokenlearn-c4-en-bge-base-v1.5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec, sin transformer en inferencia) |
| Parametros totales | 32.302.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los embeddings estáticos agregan tokens sin ventana de atención; en la práctica limitado por el tokenizador y la memoria) |
| Tipos de cuantizacion | no disponible (pesos float; el formato ONNX permite optimizaciones de runtime) |
| Idiomas soportados | inglés (corpus de entrenamiento en inglés; no se declaran otros idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Model2Vec no es un transformer en tiempo de inferencia: cada token del vocabulario tiene asociado un vector aprendido y el embedding de una secuencia se obtiene mediante una agregación (media ponderada) de los vectores de sus tokens. Esto elimina el coste cuadrático de la atención y reduce la inferencia a una búsqueda en tabla más una operación de pooling. El modelo se destila a partir de `baai/bge-base-en-v1.5`, un sentence transformer de 110 millones de parámetros, de modo que la tabla estática aproxima el comportamiento del modelo profesor.

El proceso de Tokenlearn consta de cuatro fases: primero se destila el sentence transformer con Model2Vec; después se genera un corpus de entrenamiento calculando embeddings medios de salida del profesor sobre un corpus grande (el dataset `minishlab/tokenlearn-c4-en-bge-base-v1.5`, derivado de C4 en inglés); a continuación se entrena el modelo destilado sobre esos datos; y finalmente se aplica una re-regularización posterior que pondera los tokens por frecuencia, aplica PCA y termina con ponderación SIF. Esta última fase es clave para que un modelo sin contexto posicional ni atención alcance puntuaciones cercanas a las de un transformer pequeño.

El repositorio incluye un tokenizador tokie precompilado (`tokenizer.tkz`) que actúa como reemplazo directo de los tokenizadores de Hugging Face y acelera la fase de tokenización, que en modelos estáticos pasa a ser un cuello de botella relevante al ser la inferencia casi instantánea.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica, búsqueda y recuperación.
- Clasificación de texto mediante embeddings como features para clasificadores lineales.
- Clustering y deduplicación de documentos a gran escala.
- Ranking y re-ranking en pipelines de recuperación (retrieval).
- Similitud palabra a palabra (WordSim) y tareas de pares de frases.
- Inferencia en CPU y GPU con latencia muy baja, apta para tiempo real.
- Integración con `sentence-transformers` y con la API `StaticModel` de model2vec.
- Exportación a ONNX para despliegue en runtimes optimizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de representación.

## Casos de uso

- Búsqueda semántica en producción: indexar millones de documentos con embeddings calculados en CPU y servir consultas en milisegundos, gracias a que la inferencia es una agregación de vectores estáticos sin atención.
- Deduplicación de corpus de entrenamiento: comparar embeddings de pares de documentos a gran escala con similitud coseno; el bajo coste por documento permite procesar corpus de decenas de millones de entradas en horas.
- Clustering temático de noticias o tickets: generar embeddings de cada ítem y agrupar con k-means o HDBSCAN; la velocidad permite re-clusterizar en tiempo casi real cuando llegan nuevos datos.
- Filtrado previo en pipelines RAG: usar potion-base-32M como recuperador de primera etapa de bajo coste y reservar un cross-encoder más caro para el re-ranking de los candidatos.
- Moderación y clasificación de contenido: entrenar un clasificador logístico sobre los embeddings para detectar categorías; el modelo base no requiere GPU y puede ejecutarse en el mismo servicio que atiende las peticiones.
- Detección de duplicados en catálogos de e-commerce: comparar descripciones de productos y agrupar variantes del mismo artículo con umbrales de similitud calibrados sobre el conjunto de validación.
- Enrutamiento de consultas en asistentes: clasificar la intención del usuario comparando el embedding de la consulta con prototipos por intención, con latencia inferior a un milisegundo por consulta en CPU.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MTEB (media de tareas):

| Modelo | Avg (All) | Avg (MTEB) | Class | Clust | PairClass | Rank | Ret | STS | Sum | Pearl | WordSim |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| all-MiniLM-L6-v2 | 55,80 | 55,93 | 69,25 | 44,90 | 82,37 | 47,14 | 42,92 | 78,95 | 25,96 | 60,83 | 49,91 |
| potion-base-32M | 52,83 | 52,13 | 71,70 | 41,25 | 78,17 | 42,45 | 32,67 | 73,93 | 24,74 | 55,37 | 55,15 |
| potion-base-8M | 51,32 | 51,08 | 70,34 | 39,74 | 76,62 | 41,79 | 31,11 | 72,91 | 25,06 | 53,54 | 50,75 |
| potion-base-4M | 50,01 | 49,77 | 68,00 | 39,47 | 75,37 | 41,41 | 28,43 | 71,87 | 23,82 | 52,55 | 49,21 |
| M2V_base_output | 48,77 | 47,96 | 66,84 | 33,96 | 74,90 | 39,31 | 25,36 | 68,76 | 26,61 | 54,02 | 49,18 |
| potion-base-2M | 47,55 | 47,49 | 64,13 | 37,53 | 73,72 | 40,46 | 22,99 | 69,77 | 23,80 | 50,82 | 44,72 |
| GloVe_300d | 45,49 | 45,82 | 62,73 | 37,10 | 72,48 | 38,28 | 21,80 | 61,52 | 26,81 | 45,65 | 43,05 |
| BPEmb_50k_300d | 42,33 | 41,74 | 61,72 | 35,17 | 57,86 | 37,26 | 15,36 | 55,30 | 29,49 | 47,56 | 41,28 |

Según la model card, potion-base-32M alcanza el 94,66 % del rendimiento medio de all-MiniLM-L6-v2 siendo órdenes de magnitud más rápido. No se han publicado mediciones de latencia o throughput absolutos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en float32 ocupa aproximadamente 129 MB (32,3 M parámetros × 4 bytes); en float16 unos 65 MB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no necesita A100 ni H100. Funciona en RTX 4090, RTX 3090, T4, L4 y GPUs integradas.
- Cabe en cualquier GPU de consumo e incluso en CPU sin aceleración; el cuello de botella real es la tokenización, mitigada por el tokenizador tokie incluido.
- Opciones de despliegue: `model2vec` (`StaticModel.from_pretrained`), `sentence-transformers`, ONNX Runtime, y cualquier runtime que cargue safetensors. No requiere vLLM ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; la model card afirma que es "órdenes de magnitud más rápido" que los sentence transformers equivalentes, sin dar números.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Avg MTEB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| potion-base-32M | 32,3 M | no disponible | 52,13 | MIT | Hugging Face (toki, réplica) |
| potion-base-8M | 8 M (aprox.) | no disponible | 51,08 | MIT | Hugging Face (MinishLab) |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | 55,93 | Apache 2.0 | Hugging Face |
| baai/bge-base-en-v1.5 | 109 M | 512 tokens | no disponible en esta ficha | MIT | Hugging Face |
| GloVe 300d | 400 K vectores | no aplica | 45,82 | Público dominio / varias | Varios |

La comparación relevante es con all-MiniLM-L6-v2: potion-base-32M pierde unos 3,8 puntos medios en MTEB pero gana en clasificación (71,70 frente a 69,25) y en similitud palabra a palabra (55,15 frente a 49,91), mientras que cae notablemente en retrieval (32,67 frente a 42,92). Para tareas de recuperación de alta exigencia conviene un cross-encoder o un transformer denso; para clasificación, clustering y similitud a gran escala, potion-base-32M es la opción más eficiente.

## Limitaciones y advertencias

- Solo inglés: el corpus de destilación es C4 en inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Sin contexto posicional ni atención: no captura dependencias de largo alcance ni negaciones complejas; el rendimiento en retrieval es el punto más débil (32,67 en MTEB).
- Riesgo de sesgo heredado del corpus C4 y del profesor bge-base-en-v1.5, incluidos sesgos de género, raza y dominio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; usarlo para esas tareas es un error de categoría.
- No hay información publicada sobre límite de longitud de entrada efectivo; secuencias muy largas pueden degradar la calidad del embedding medio.
- Es una réplica no oficial: el autor es tokiers, no MinishLab; conviene validar que los pesos coinciden con el modelo original antes de usarlo en producción.
- Aunque la licencia MIT permite uso comercial, el modelo profesor bge-base-en-v1.5 tiene su propia licencia MIT, por lo que no hay conflicto conocido, pero conviene revisar los términos del dataset C4.
- El tokenizador tokie (`tokenizer.tkz`) es una dependencia adicional del repositorio de chonkie-inc; verificar su compatibilidad con el stack antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokiers/potion-base-32M
- Modelo original de MinishLab: https://huggingface.co/minishlab/potion-base-32M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Resultados de Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Tutoriales de Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Tokenizador tokie: https://github.com/chonkie-inc/tokie
- Modelo profesor bge-base-en-v1.5: https://huggingface.co/baai/bge-base-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/minishlab/tokenlearn-c4-en-bge-base-v1.5
- Leaderboard MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Modelos Model2Vec en el hub: https://huggingface.co/models?library=model2vec
- Paper de SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
- Cita del software: https://doi.org/10.5281/zenodo.17270888
