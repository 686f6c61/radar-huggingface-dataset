# Teradata/ruri-v3-70m

## Resumen

Teradata/ruri-v3-70m es una conversión a ONNX del modelo de embeddings japonés `cl-nagoya/ruri-v3-70m`, empaquetada específicamente para la función `mldb.ONNXEmbeddings` de Teradata Vantage (BYOM, Bring Your Own Model). El modelo original, desarrollado por el grupo de procesamiento de lenguaje natural de la Universidad de Nagoya, es un encoder basado en la arquitectura ModernBERT-Ja, con 70 millones de parámetros y una ventana de contexto de 8192 tokens. Esta versión ONNX no incluye los pesos PyTorch originales, sino únicamente el grafo de inferencia y el tokenizador necesarios para generar embeddings directamente dentro de la base de datos.

La relevancia de esta ficha radica en que permite a equipos que ya usan Teradata Vantage incorporar búsqueda semántica y clasificación de texto en japonés sin mover datos a un servicio externo. El modelo está cuantizado en varias variantes (fp32, int8 per-channel e int8 con omisión de FFN) para equilibrar tamaño y calidad, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder) |
| Parametros totales | 70.002.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (anunciado) |
| Tipos de cuantizacion | fp32, int8 per-channel, int8 ffn_skip |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 14, IR version 8) |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-70m` es un encoder Transformer de tipo ModernBERT, adaptado al japones (ModernBERT-Ja). Emplea pooling por media (`mean`) sobre las representaciones de los tokens para producir un vector de 384 dimensiones. El entrenamiento original incluye un esquema de prefijos dependientes del rol: el texto debe prefijarse con cadenas fijas como `検索クエリ: ` (para consultas) o `検索文書: ` (para documentos) en tareas de recuperacion, o con `トピック: ` para clasificacion y clustering. La version ONNX de Teradata incorpora este comportamiento en el grafo, pero el prefijo se anade como texto plano en la consulta SQL, no dentro del modelo.

No se dispone de informacion detallada sobre el corpus de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO en la documentacion proporcionada. La unica innovacion destacable en esta variante es la cuantizacion dinamica int8 y la verificacion de fidelidad coseno frente al modelo PyTorch de referencia, medida sobre un subconjunto fijo de JMTEB.

## Capacidades

- Generacion de embeddings de texto en japones para similitud semantica, recuperacion, clasificacion y clustering.
- Soporte de prefijos de instruccion especificos para distinguir entre consultas y documentos en tareas de retrieval.
- Ventana de contexto de hasta 8192 tokens, adecuada para documentos largos.
- Salida de 384 dimensiones, compatible con indices vectoriales y funciones de similitud coseno.
- Integracion nativa con Teradata Vantage mediante la funcion `mldb.ONNXEmbeddings` (BYOM).
- No soporta tool calling, agentes ni generacion de texto; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en bases de datos Teradata: indexar documentos en japones con el prefijo `検索文書: ` y consultar con `検索クエリ: `, todo dentro de SQL mediante CTEs y la funcion `ONNXEmbeddings`.
- Clasificacion automatica de tickets o incidencias: prefijar el texto con `トピック: ` y usar los embeddings como entrada a un clasificador ligero (regresion logistica, k-NN) en el mismo entorno de base de datos.
- Deduplicacion de registros: comparar embeddings de nombres de clientes o descripciones de productos para detectar entradas duplicadas con alta similitud coseno.
- Agrupacion (clustering) de articulos o noticias en japones: generar embeddings con prefijo `トピック: ` y aplicar algoritmos como k-means sobre los vectores resultantes.
- Recomendacion de contenido: representar items y usuarios como embeddings y calcular similitudes para sugerir documentos o productos relevantes.
- Analisis de sentimiento en encuestas o comentarios: aunque el modelo no esta especializado en sentimiento, los embeddings pueden alimentar un modelo de clasificacion entrenado sobre datos propios.

## Benchmarks y rendimiento

La model card de Teradata reporta metricas de calidad para cada variante ONNX, medidas sobre una muestra fija de dos subconjuntos de JMTEB retrieval (`jagovfaqs_22k` y `nlp_journal_title_abs`), con una longitud maxima de 512 tokens. Los valores son absolutos y no generalizables a otros datos.

| Variante | Tamano (MB) | p50 cosine | R@1 | Δ R@1 vs fp32 |
|---|---|---|---|---|
| fp32 | 280,3 | 1,000000 | 0,927 | — |
| per_channel (int8) | 72,7 | 0,952567 | 0,891 | -0,036 |
| ffn_skip (int8) | 139,6 | 0,999625 | 0,929 | +0,002 |

La fila `fp32` compara contra el modelo PyTorch original (mide el drift de exportacion), mientras que las filas int8 comparan contra el propio fp32 ONNX. La variante `ffn_skip` muestra una degradacion minima e incluso una ligera mejora en R@1 en esta muestra, aunque el p50 cosine es ligeramente inferior a 1. No se han publicado resultados en el leaderboard MTEB completo para esta version ONNX.

## Requisitos de hardware

- El modelo es muy ligero: 70 millones de parametros. El archivo fp32 pesa 280 MB, y las versiones int8 entre 73 y 140 MB.
- VRAM estimada: menos de 1 GB para fp32 y menos de 500 MB para int8, asumiendo un batch pequeno. Cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior) y en GPUs de datacenter como T4 o A10.
- Al ser un modelo de embeddings, la inferencia es de un solo paso hacia adelante; la latencia por lote de 32 secuencias de 512 tokens deberia ser inferior a 100 ms en una GPU T4, aunque no se proporcionan mediciones oficiales.
- Despliegue: el formato ONNX es compatible con ONNX Runtime, y la integracion principal es via Teradata Vantage BYOM. Tambien puede usarse con librerias como sentence-transformers (cargando el ONNX) o con servidores de inferencia como ONNX Runtime Server.
- No requiere hardware especializado; es adecuado para entornos con recursos limitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Formato |
|---|---|---|---|---|---|
| cl-nagoya/ruri-v3-70m (original) | 70M | 8192 | 384 | Apache 2.0 | PyTorch / safetensors |
| Teradata/ruri-v3-70m (este) | 70M | 8192 | 384 | Apache 2.0 | ONNX |
| multilingual-e5-small (referencia) | 118M | 512 | 384 | MIT | PyTorch / ONNX |

No se dispone de una comparativa directa de rendimiento con otros modelos de embeddings japoneses en la informacion proporcionada. El modelo original `cl-nagoya/ruri-v3-70m` aparece en el leaderboard MTEB con 70M de parametros y 256 dimensiones (segun esa fuente, aunque la model card de Teradata indica 384; la discrepancia puede deberse a versiones distintas). Para una evaluacion justa, se recomienda consultar el leaderboard MTEB para tareas de retrieval en japones.

## Limitaciones y advertencias

- El modelo solo soporta japones; no es util para otros idiomas.
- Requiere el uso obligatorio de prefijos especificos (`検索クエリ: `, `検索文書: `, `トピック: `) para obtener resultados correctos. Aplicar el mismo prefijo a ambos lados de un par de retrieval degrada la calidad sin generar errores.
- La cuantizacion int8 per-channel reduce el R@1 en aproximadamente 3,6 puntos porcentuales en la muestra evaluada; la variante ffn_skip mantiene mejor la calidad pero ocupa mas espacio.
- Las metricas de calidad reportadas se basan en una muestra fija de JMTEB y pueden no generalizar a otros dominios o longitudes de texto.
- No se proporcionan datos sobre sesgos, alucinaciones (no aplica al ser embeddings) ni riesgos de seguridad especificos.
- La licencia Apache 2.0 permite uso comercial, pero la integracion con Teradata Vantage puede requerir una licencia de Teradata por separado.

## Enlaces

- Repositorio HuggingFace de Teradata: https://huggingface.co/Teradata/ruri-v3-70m
- Modelo original cl-nagoya/ruri-v3-70m: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Entrada en el leaderboard MTEB: https://mteb-leaderboard.hf.space/models/cl-nagoya/ruri-v3-70m
- Variante GGUF de la comunidad (keisuke-miyako): https://huggingface.co/keisuke-miyako/ruri-v3-70m-gguf-q8_0
- Ficha en Inferix: https://inferix.co/models/cl-nagoya/ruri-v3-70m
