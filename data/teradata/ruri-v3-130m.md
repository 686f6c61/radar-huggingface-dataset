# Teradata/ruri-v3-130m

## Resumen

Teradata/ruri-v3-130m es una conversión a formato ONNX del modelo de embeddings japonés `cl-nagoya/ruri-v3-130m`, empaquetada específicamente para la función `mldb.ONNXEmbeddings` de Teradata Vantage (BYOM, Bring Your Own Model). No se trata del modelo PyTorch original, sino del grafo de inferencia y el tokenizador necesarios para generar embeddings directamente dentro de la base de datos, sin necesidad de exportar datos a un entorno externo.

El modelo base, desarrollado por el grupo cl-nagoya, está construido sobre la arquitectura ModernBERT-Ja y cuenta con 132 millones de parámetros, una dimensión de salida de 512 y una ventana de contexto de hasta 8192 tokens. Está entrenado específicamente para texto en japonés y utiliza un esquema de prefijos de instrucción según el uso (consulta, documento, clasificación, etc.). Esta versión de Teradata añade cuantización dinámica int8 en dos variantes (`per_channel` y `ffn_skip`) además de la referencia fp32, con métricas de fidelidad coseno y recuperación (R@1) medidas sobre una muestra fija de JMTEB.

La relevancia de este modelo radica en que permite a los usuarios de Teradata Vantage integrar embeddings semánticos de alta calidad en flujos SQL sin mover datos, manteniendo la compatibilidad con el ecosistema BYOM. Es una opción práctica para entornos empresariales que ya utilizan Teradata como plataforma de datos principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertModel (encoder) |
| Parametros totales | 132.140.544 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (anunciado) |
| Tipos de cuantizacion | fp32, int8 dinámico (per_channel y ffn_skip) |
| Idiomas soportados | ja (japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 14, IR version 8) |

## Arquitectura y entrenamiento

El modelo base `cl-nagoya/ruri-v3-130m` es un encoder Transformer basado en ModernBERT-Ja, una variante de ModernBERT adaptada al japonés. El entrenamiento original incluye un esquema de prefijos de instrucción específicos para cada tarea: `トピック: ` para clasificación, `検索クエリ: ` para consultas de recuperación y `検索文書: ` para documentos. El pooling utilizado es la media (`mean`) sobre los tokens de salida.

La versión de Teradata no reentrena el modelo, sino que convierte los pesos del modelo original a ONNX con un post-procesado específico para la arquitectura. Se aplica cuantización dinámica int8 en dos variantes: `per_channel` (cuantiza todas las capas por canal) y `ffn_skip` (omite la cuantización en las capas feed-forward). El grafo ONNX emite directamente el tensor `sentence_embedding` y es agnóstico al prefijo, que debe añadirse como texto plano en la consulta SQL.

## Capacidades

- Generación de embeddings semánticos para texto en japonés, con salida de 512 dimensiones.
- Recuperación de información (retrieval) con prefijos diferenciados para consultas (`検索クエリ: `) y documentos (`検索文書: `).
- Clasificación y agrupamiento (clustering) mediante el prefijo `トピック: `.
- Similitud semántica y codificación general sin prefijo.
- Soporte de secuencias largas de hasta 8192 tokens, adecuado para documentos extensos.
- Integración nativa con Teradata Vantage a través de la función `mldb.ONNXEmbeddings` (BYOM).
- Compatible con la librería `sentence-transformers` para su uso fuera de Teradata, aunque el formato ONNX está orientado al despliegue en base de datos.

## Casos de uso

- Búsqueda semántica en bases de datos Teradata: indexar documentos almacenados en tablas y realizar consultas por similitud coseno directamente en SQL, sin exportar datos.
- Clasificación automática de tickets de soporte: usar el prefijo `トピック: ` para codificar textos y asignar categorías mediante un clasificador entrenado sobre los embeddings.
- Deduplicación de registros: comparar embeddings de descripciones de productos o clientes para detectar duplicados con alta precisión.
- Sistemas de recomendación: codificar ítems y preferencias de usuario con el mismo modelo y calcular similitudes para sugerir contenidos.
- Análisis de sentimiento en japonés: generar embeddings de reseñas o comentarios y alimentar un modelo de regresión o clasificación ligero.
- Pipeline de moderación de contenido: detectar temas sensibles o tóxicos en texto japonés mediante codificación y comparación con prototipos.
- Integración en flujos ETL: enriquecer tablas con columnas de embeddings calculadas en el momento de la carga, usando la función BYOM.

## Benchmarks y rendimiento

La model card de esta versión ONNX no publica benchmarks generales (como JMTEB completo), pero sí incluye métricas de fidelidad y recuperación sobre una muestra fija de JMTEB retrieval (2 de 8 subconjuntos: `jagovfaqs_22k` y `nlp_journal_title_abs`), medidas con una longitud máxima de 512 tokens.

| Variante | Tamaño (MB) | p50 cosine | R@1 | Δ R@1 vs fp32 |
|---|---|---|---|---|
| fp32 | 529,0 | 1,000000 | 0,938 | — |
| per_channel | 136,7 | 0,983418 | 0,928 | -0,010 |
| ffn_skip | 312,4 | 0,998759 | 0,938 | +0,000 |

Nota: el p50 cosine de la fila fp32 se calcula contra el modelo PyTorch original (mide la deriva de exportación), mientras que en las filas cuantizadas se calcula contra el ONNX fp32 (mide la deriva de cuantización). El R@1 es la precisión top-1 absoluta sobre la muestra. Estos números pueden no generalizar a otros conjuntos de datos.

Según fuentes externas, el modelo original `cl-nagoya/ruri-v3-130m` alcanza una puntuación de 76,55 en el benchmark JMTEB, pero este dato no está verificado en la model card de esta versión ONNX.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card. Al ser un modelo ONNX orientado a Teradata BYOM, la inferencia se ejecuta dentro del motor de Teradata, por lo que los requisitos dependen de la infraestructura de Vantage.
- Para uso fuera de Teradata con ONNX Runtime, el tamaño del archivo fp32 es de 529 MB, lo que implica un uso de memoria de aproximadamente 1 GB en fp32 (considerando overhead). Las variantes int8 reducen el peso a 136-312 MB, permitiendo ejecución en CPU con memoria moderada.
- No se dispone de datos de latencia o throughput. En general, un modelo de 132M de parámetros puede ejecutarse en CPU moderna con decenas de milisegundos por secuencia corta, pero esto no está confirmado para esta versión.
- Opciones de despliegue: Teradata Vantage (BYOM), ONNX Runtime, o mediante `sentence-transformers` si se convierte a otro formato.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | JMTEB (original) | Licencia |
|---|---|---|---|---|---|
| ruri-v3-70m | 70M | 384 | 8192 | 75,48 | Apache 2.0 |
| ruri-v3-130m (base) | 132M | 512 | 8192 | 76,55 | Apache 2.0 |
| ruri-v3-310m | 310M | 768 | 8192 | no disponible | Apache 2.0 |

La versión de Teradata se diferencia de las anteriores por su formato ONNX y su integración específica con BYOM. No se dispone de comparativas con otros modelos de embeddings japoneses (como `pkshatech/GLuCoSE` o `hotchpotch/static-embedding`) en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivo para japonés; no soporta otros idiomas.
- Requiere el uso obligatorio de prefijos de instrucción específicos. Usar el prefijo incorrecto (o no usarlo) degrada la calidad de la recuperación sin generar errores.
- La cuantización int8 introduce una ligera pérdida de fidelidad (p50 cosine de 0,983 en `per_channel`), aunque el impacto en R@1 es mínimo en la muestra evaluada.
- Los resultados de calidad publicados se basan en una muestra fija de solo 2 subconjuntos de JMTEB; no garantizan el rendimiento en otros dominios.
- Esta versión no incluye el modelo PyTorch original, solo el grafo de inferencia ONNX. Para fine-tuning o extracción de características con `sentence-transformers`, debe usarse el repositorio original.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en Teradata Vantage puede requerir licencias adicionales del producto.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Teradata/ruri-v3-130m
- Modelo original: https://huggingface.co/cl-nagoya/ruri-v3-130m
- Modelo hermano (310M): https://huggingface.co/cl-nagoya/ruri-v3-310m
- Colección de conversiones ONNX de ruri-v3: https://huggingface.co/collections/sirasagi62/ruri-v3-onnx
- Ficha del modelo original en AIBase: https://model.aibase.com/en/models/details/1915758385515094017
