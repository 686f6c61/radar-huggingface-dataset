# Teradata/ruri-v3-310m

## Resumen

El modelo `Teradata/ruri-v3-310m` es una conversión a formato ONNX del modelo de embeddings de texto japonés `cl-nagoya/ruri-v3-310m`, empaquetada específicamente para la función `mldb.ONNXEmbeddings` de Teradata Vantage (BYOM). No se trata del modelo PyTorch original, sino del grafo de inferencia y el tokenizador necesarios para generar embeddings directamente dentro de la base de datos, sin mover los datos a un entorno externo.

El modelo original, desarrollado por la Universidad de Nagoya (cl-nagoya), está basado en la arquitectura ModernBERT-Ja, un encoder transformer optimizado para texto japonés. Con 314,6 millones de parámetros y una ventana de contexto de 8192 tokens, supera las limitaciones de las versiones anteriores de Ruri (v1 y v2, limitadas a 512 tokens) y amplía el vocabulario a 100K tokens, lo que reduce la longitud efectiva de las secuencias para un mismo texto.

Esta versión ONNX incluye cuantización dinámica int8 en dos variantes (`per_channel` y `ffn_skip`) además de la referencia fp32, y aplica un pooling de tipo `mean` con un esquema de prefijos de instrucción obligatorio para tareas de recuperación. Su relevancia radica en permitir la generación de embeddings de alta calidad en entornos de base de datos corporativos, con un coste de almacenamiento reducido y sin sacrificar excesivamente la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder) |
| Parametros totales | 314.611.968 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32, int8 dinamico (per_channel, ffn_skip) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 14, IR version 8) |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-310m` es un encoder transformer basado en ModernBERT-Ja, una variante de ModernBERT adaptada al idioma japones. Fue entrenado por el grupo cl-nagoya de la Universidad de Nagoya como un modelo de embeddings de texto de proposito general, optimizado para tareas de similitud semantica, clasificacion, clustering y recuperacion de informacion. El vocabulario expandido de 100K tokens (frente a los 32K de Ruri v1/v2) y la ventana de contexto de 8192 tokens permiten procesar parrafos completos o articulos cortos sin truncamiento.

La version alojada en este repositorio no es el modelo PyTorch original, sino una conversion a ONNX realizada por Teradata con post-procesamiento especifico de la arquitectura. El grafo emite el tensor `sentence_embedding` con pooling `mean` e incorpora un esquema de prefijos de instruccion en japones: `トピック: ` para clasificacion/clustering, `検索クエリ: ` para el lado de consulta en retrieval, y `検索文書: ` para el lado de documento. Estos prefijos son obligatorios y no personalizables; usarlos incorrectamente degrada la calidad de la recuperacion sin generar errores.

## Capacidades

- Generacion de embeddings de texto (feature extraction) para el idioma japones.
- Similitud semantica entre frases o documentos mediante similitud coseno.
- Recuperacion de informacion (retrieval) con prefijos diferenciados para consultas y documentos.
- Clasificacion de texto y clustering mediante el prefijo `トピック: `.
- Soporte de secuencias largas de hasta 8192 tokens, adecuado para parrafos completos.
- Integracion nativa con Teradata Vantage a traves de la funcion `mldb.ONNXEmbeddings` (BYOM).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Busqueda semantica en bases de datos documentales japonesas: se indexan los documentos con el prefijo `検索文書: ` y las consultas con `検索クエリ: `, generando embeddings que permiten recuperar pasajes relevantes por similitud coseno directamente en SQL.
- Clasificacion automatica de tickets o incidencias: aplicando el prefijo `トピック: `, el modelo genera embeddings que alimentan un clasificador (por ejemplo, regresion logistica o k-NN) para asignar categorias a textos de soporte.
- Clustering de articulos o noticias: los embeddings con prefijo `トピック: ` permiten agrupar documentos por tema mediante algoritmos como HDBSCAN o k-means, facilitando la organizacion de corpus.
- Deduplicacion de registros: comparando embeddings de nombres de empresas, direcciones o descripciones de productos para detectar entradas duplicadas en bases de datos.
- Sistemas de recomendacion basados en contenido: se vectorizan descripciones de items y se calcula la similitud para sugerir productos o articulos relacionados.
- Analisis de sentimiento en textos japoneses: los embeddings generados pueden usarse como caracteristicas de entrada para un modelo de clasificacion entrenado sobre etiquetas de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (como MMLU, HumanEval o GSM8K) porque se trata de un modelo de embeddings, no generativo. La informacion disponible incluye metricas de fidelidad de la conversion ONNX frente al modelo PyTorch original, medidas sobre una muestra fija de JMTEB retrieval (2 de 8 subconjuntos: `jagovfaqs_22k` y `nlp_journal_title_abs`), con una longitud maxima de secuencia de 512 tokens. Estos numeros pueden no generalizarse a otros datos.

| Variante | Tamano (MB) | p50 cosine | R@1 | Δ R@1 vs fp32 |
|---|---|---|---|---|
| fp32 | 1259,1 | 1,000000 | 0,947 | — |
| per_channel | 324,0 | 0,964021 | 0,924 | -0,023 |
| ffn_skip | 846,9 | 0,998872 | 0,949 | +0,002 |

La columna p50 cosine mide la similitud coseno mediana entre los embeddings de cada variante y la referencia fp32 ONNX (en la fila fp32, la comparacion es contra el modelo PyTorch original, por lo que mide la deriva de exportacion). R@1 es la precision de recuperacion top-1 absoluta sobre la muestra de evaluacion. Δ R@1 indica la perdida de calidad de recuperacion respecto al techo fp32.

## Requisitos de hardware

- Tamano del modelo: 314,6 millones de parametros. El archivo ONNX fp32 ocupa 1259,1 MB; las variantes int8 ocupan 324,0 MB (`per_channel`) y 846,9 MB (`ffn_skip`).
- VRAM estimada para inferencia: no se especifica en la documentacion, pero al ser un modelo de embeddings de tamano medio, puede ejecutarse en GPUs con 8 GB o mas dependiendo del lote y la longitud de secuencia. En CPU, la variante `per_channel` es viable para cargas moderadas.
- GPU recomendadas: no se indican modelos concretos. Cualquier GPU moderna con soporte FP16 o INT8 (por ejemplo, RTX 3060, RTX 4090, A10, A100) puede ejecutar el modelo.
- En consumer GPU: si, las variantes cuantizadas caben en GPUs de consumo con 8-12 GB de VRAM.
- Opciones de despliegue: el formato ONNX es compatible con ONNX Runtime, y el empaquetado esta disenado para Teradata Vantage BYOM (`mldb.ONNXEmbeddings`). El modelo original PyTorch puede usarse con sentence-transformers.
- Latencia y throughput: no se proporcionan datos numericos. Dependen del hardware, el tamano de lote y la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Teradata/ruri-v3-310m (este) | 314,6M | 8192 | ONNX (int8/fp32) | Apache-2.0 | Embeddings en Teradata BYOM |
| cl-nagoya/ruri-v3-310m (original) | 314,6M | 8192 | PyTorch / safetensors | Apache-2.0 | Embeddings generales en japones |
| Japan-AI-Consulting/ruri-v3-310m-onnx | 314,6M | 8192 | ONNX | Apache-2.0 | Embeddings ONNX genericos |

No se dispone de datos de rendimiento comparativo con otros modelos de embeddings japoneses como `multilingual-e5-large` o `bge-m3`. La comparativa se limita a las variantes del mismo modelo base, diferenciadas por formato y empaquetado.

## Limitaciones y advertencias

- El modelo solo soporta el idioma japones; no es util para textos en otros idiomas.
- Los prefijos de instruccion son obligatorios y no personalizables. Aplicar el mismo prefijo a ambos lados de un par de recuperacion, o no aplicarlo, degrada la calidad sin generar errores visibles.
- La cuantizacion int8 introduce una perdida de fidelidad: la variante `per_channel` reduce R@1 en 0,023 puntos absolutos respecto a fp32 en la muestra evaluada. La variante `ffn_skip` mantiene o mejora ligeramente R@1, pero ocupa mas espacio.
- Las metricas de calidad reportadas se basan en una muestra fija de 2 de 8 subconjuntos de JMTEB y pueden no generalizarse a otros dominios o longitudes de secuencia superiores a 512 tokens.
- No es un modelo generativo: no puede completar texto, responder preguntas ni generar contenido.
- La integracion en Teradata Vantage requiere la funcion `mldb.ONNXEmbeddings` y la configuracion adecuada de tablas de modelos y tokenizadores.
- La licencia Apache-2.0 permite uso comercial, pero el modelo esta limitado a japones y a tareas de embeddings.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Teradata/ruri-v3-310m
- Modelo original (cl-nagoya/ruri-v3-310m): https://huggingface.co/cl-nagoya/ruri-v3-310m
- Conversion ONNX alternativa (Japan-AI-Consulting/ruri-v3-310m-onnx): https://huggingface.co/Japan-AI-Consulting/ruri-v3-310m-onnx
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ruri-v3-310m-cl-nagoya
- Ficha en OpenModelMap: https://openmodelmap.com/model/cl-nagoya/ruri-v3-310m
- Ficha en AI App Dex: https://aiappdex.com/models/cl-nagoya-ruri-v3-310m/
