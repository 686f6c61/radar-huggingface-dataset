# Teradata/ruri-v3-30m

## Resumen

Teradata/ruri-v3-30m es una conversión a formato ONNX del modelo de embeddings japonés `cl-nagoya/ruri-v3-30m`, empaquetada específicamente para la función `mldb.ONNXEmbeddings` de Teradata Vantage (BYOM, Bring Your Own Model). No es el modelo PyTorch original, sino el grafo de inferencia y el tokenizador necesarios para generar embeddings directamente dentro de la base de datos, lo que elimina la necesidad de mover datos a un servicio externo.

El modelo base, desarrollado por el grupo cl-nagoya, es un encoder basado en la arquitectura ModernBERT con 36,7 millones de parámetros y una dimensión de salida de 256. Está entrenado exclusivamente para japonés y admite hasta 8192 tokens de entrada. La versión de Teradata incorpora cuantización int8 dinámica en tres variantes (fp32, per_channel y ffn_skip) con métricas de fidelidad coseno y recuperación top-1 documentadas frente al modelo de referencia. Su relevancia radica en permitir generación de embeddings en bases de datos Teradata sin infraestructura adicional, manteniendo un control de calidad cuantificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder) |
| Parametros totales | 36.705.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (maximo anunciado) |
| Tipos de cuantizacion | fp32, int8 per_channel, int8 ffn_skip |
| Idiomas soportados | ja (japones) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (opset 14, IR version 8) |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-30m` es un encoder transformer de tipo ModernBERT, una arquitectura optimizada para eficiencia en inferencia y manejo de secuencias largas. El modelo de Teradata no incluye el proceso de entrenamiento original, sino que es una exportacion del grafo de inferencia con el pooling `mean` integrado y un esquema de prefijos de instruccion especifico por rol (consulta, documento, topico o vacio para similaridad general). La cuantizacion int8 se aplico de forma dinamica sobre los pesos, con dos estrategias: `per_channel` (cuantizacion por canal) y `ffn_skip` (omite cuantizar las capas feed-forward). No se dispone de informacion sobre el dataset de entrenamiento ni el proceso de alineacion del modelo original en esta ficha.

## Capacidades

- Generacion de embeddings de texto en japones para tareas de similaridad semantica, recuperacion, clasificacion y clustering.
- Soporte de prefijos de instruccion especificos: `検索クエリ: ` para consultas, `検索文書: ` para documentos, `トピック: ` para clasificacion, y cadena vacia para uso general.
- Dimension de salida fija de 256, adecuada para indices vectoriales compactos.
- Ventana de contexto de hasta 8192 tokens, permitiendo procesar documentos largos en una sola pasada.
- Integracion nativa con Teradata Vantage mediante la funcion `mldb.ONNXEmbeddings`, sin necesidad de servicios externos.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente un modelo de embeddings de texto.

## Casos de uso

- Busqueda semantica en bases de datos Teradata: indexar documentos japoneses con el prefijo `検索文書: ` y consultar con `検索クエリ: `, todo dentro de SQL mediante `mldb.ONNXEmbeddings`.
- Deduplicacion de registros: generar embeddings de campos de texto (nombres, direcciones, descripciones) y calcular similaridad coseno para detectar duplicados en tablas grandes.
- Clasificacion automatica de tickets o documentos: usar el prefijo `トピック: ` y un clasificador ligero sobre los embeddings de 256 dimensiones.
- Agrupacion (clustering) de articulos o noticias en japones: aplicar K-means o HDBSCAN sobre los embeddings generados en base de datos.
- Sistemas de recomendacion basados en contenido: representar items (productos, articulos) como vectores y calcular vecinos proximos para sugerencias personalizadas.
- Analisis de similaridad entre pares de textos: comparar respuestas de encuestas, resenas o mensajes de soporte usando el prefijo vacio y distancia coseno.

## Benchmarks y rendimiento

La informacion disponible incluye metricas de calidad medidas sobre una muestra fija de JMTEB retrieval (2 de 8 subconjuntos: `jagovfaqs_22k` y `nlp_journal_title_abs`), con secuencias de hasta 512 tokens. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion proporcionada.

| Variante | Tamano (MB) | p50 coseno | R@1 | Δ R@1 vs fp32 |
|---|---|---|---|---|
| fp32 | 147,1 | 1,000000 | 0,918 | — |
| per_channel | 38,1 | 0,993101 | 0,911 | -0,007 |
| ffn_skip | 60,8 | 0,999800 | 0,918 | +0,000 |

Nota: p50 coseno en la fila fp32 mide la desviacion de la exportacion ONNX frente al modelo PyTorch original; en las filas cuantizadas mide la desviacion frente al ONNX fp32. R@1 es la precision top-1 absoluta sobre la muestra de evaluacion.

## Requisitos de hardware

- VRAM estimada: el modelo es muy ligero (36,7 M de parametros). La variante fp32 ocupa 147 MB en disco; las cuantizadas, entre 38 y 61 MB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 3060 o superiores.
- GPU recomendadas: cualquier GPU moderna es suficiente; para inferencia en lote dentro de Teradata, se recomienda una GPU con al menos 8 GB de VRAM para manejar multiples secuencias simultaneas.
- Despliegue: el formato ONNX es compatible con Teradata Vantage BYOM 6+; tambien puede ejecutarse con ONNX Runtime en cualquier entorno Python.
- Latencia y throughput: no se han publicado cifras especificas. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por lote en GPU moderna y throughput alto en CPU con cuantizacion int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension salida | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Teradata/ruri-v3-30m | 36,7 M | 8192 | 256 | ja | Apache 2.0 | ONNX |
| cl-nagoya/ruri-v3-30m | 36,7 M | 8192 | 256 | ja | Apache 2.0 | PyTorch |
| cl-nagoya/ruri-large (si existe) | no disponible | no disponible | no disponible | ja | no disponible | no disponible |

No se dispone de informacion suficiente sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente para japones; no soporta otros idiomas.
- El esquema de prefijos es obligatorio para tareas de recuperacion: usar el mismo prefijo en ambos lados degrada la calidad sin generar errores.
- Las metricas de calidad publicadas se basan en una muestra fija de 2 subconjuntos de JMTEB; pueden no generalizar a otros dominios o datos.
- La cuantizacion `per_channel` sacrifica algo de precision (Δ R@1 de -0,007) a cambio de un tamano mucho menor; `ffn_skip` mantiene la precision pero con mayor tamano.
- No se incluye el proceso de entrenamiento ni informacion sobre sesgos del modelo original en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el modelo esta pensado para el ecosistema Teradata; su uso fuera de ese entorno requiere adaptacion del grafo ONNX.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Teradata/ruri-v3-30m
- Modelo base original: https://huggingface.co/cl-nagoya/ruri-v3-30m
- Pagina de benchmarks y despliegue (OpenModelMap): https://openmodelmap.com/model/cl-nagoya/ruri-v3-30m
- Ficha en ThinkLLM: https://thinkllm.dev/models/ruri-v3-30m
- Modelo fine-tune relacionado (Chottokun/ruri-v3-30m_ft): https://huggingface.co/Chottokun/ruri-v3-30m_ft
