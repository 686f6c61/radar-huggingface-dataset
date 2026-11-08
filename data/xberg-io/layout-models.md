# xberg-io/layout-models

## Resumen

xberg-io/layout-models es un repositorio que agrupa tres modelos ONNX especializados en analisis de documentos, publicados por xberg-io para su uso dentro de la herramienta de extraccion documental xberg. No se trata de un modelo generativo ni de un LLM, sino de un conjunto de detectores visuales: dos para deteccion de layout de pagina (RT-DETR y PP-DocLayoutV3) y uno para reconocimiento de estructura de tablas (TATR). Su proposito es convertir imagenes de paginas en regiones semanticas etiquetadas (titulos, parrafos, tablas, formulas, encabezados, etc.) y reconstruir la estructura interna de las tablas.

El repositorio es fundamentalmente un espejo curado de pesos ya existentes: el modelo RT-DETR proviene de docling-project/docling-layout-heron-onnx (IBM Research), el TATR deriva de microsoft/table-transformer-structure-recognition (convertido a ONNX por Xenova y cuantizado a INT8) y el PP-DocLayoutV3 es una copia byte a byte del release oficial de PaddlePaddle. La aportacion de xberg-io es el empaquetado reproducible (hashes SHA256, revisiones fijadas) y la integracion en un pipeline unico.

Es relevante para desarrolladores que construyen sistemas de ingesta documental (RAG, digitalizacion, extraccion de datos) porque ofrece modelos ligeros, en formato ONNX portable, con licencias permisivas (Apache-2.0 y MIT) y tamanos que van de 29 MB a 169 MB, aptos para ejecucion en CPU y GPU sin infraestructura pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (transformer de deteccion); PP-DocLayoutV3 (DETR con mascaras y orden de lectura); TATR (DETR no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, sin contexto textual) |
| Tipos de cuantizacion | FP32 (RT-DETR y PP-DocLayoutV3); INT8 dinamica via ONNX Runtime (TATR) |
| Idiomas soportados | no disponible (modelos de vision; la salida son etiquetas de clase en ingles) |
| Licencia | Apache-2.0 (RT-DETR y PP-DocLayoutV3); MIT (TATR) |
| Formato de pesos | ONNX (opset 17, IR 8 en PP-DocLayoutV3) |

Tabla de componentes:

| Componente | Ruta | Tamano | Precision | Entrada | Salida | Clases |
|---|---|---|---|---|---|---|
| RT-DETR | `rtdetr/model.onnx` | 169 MB | FP32 | `images` [b,3,640,640] f32; `orig_target_sizes` [b,2] i64 | `labels` i64, `boxes` f32 [b,N,4], `scores` f32 | 17 |
| PP-DocLayoutV3 | `pp_doclayout_v3/model.onnx` | 130,5 MB | FP32 | `image` [b,3,800,800] f32; `im_shape` [b,2] f32; `scale_factor` [b,2] f32 | `fetch_name_0` [N,7] (clase, score, caja, orden de lectura), `fetch_name_1` [1], `fetch_name_2` [N,200,200] (mascaras) | 25 |
| TATR | `tatr/model.onnx` | 29 MB | INT8 | `pixel_values` [b,3,H,W] f32 | `logits` [b,125,7], `pred_boxes` [b,125,4] | 7 |

## Arquitectura y entrenamiento

Los tres componentes son detectores basados en transformer (familia DETR), no modelos de lenguaje. RT-DETR v2 sigue la arquitectura descrita por Zhao et al. en "DETRs Beat YOLOs on Real-time Object Detection" (arXiv:2304.08069) y fue entrenado por el equipo de Docling en IBM Research sobre DocLayNet y datasets internos de IBM. Predice 17 clases de layout (Caption, Footnote, Formula, ListItem, PageFooter, PageHeader, Picture, SectionHeader, Table, Text, Title, DocumentIndex, Code, CheckboxSelected, CheckboxUnselected, Form, KeyValueRegion).

PP-DocLayoutV3 es un detector estilo DETR de PaddleDetection que anade dos capacidades sobre la deteccion pura: prediccion de mascaras por deteccion y estimacion del orden de lectura, con 25 clases (abstract, algorithm, aside_text, chart, content, display_formula, doc_title, figure_title, footer, footer_image, footnote, formula_number, header, header_image, image, inline_formula, number, paragraph_title, reference, reference_content, seal, table, text, vertical_text, vision_footnote). Se distribuye sin modificar desde el release oficial de PaddlePaddle y es el modulo de analisis de layout de PaddleOCR-VL-1.5.

TATR (Table Transformer) es un DETR no autorregresivo basado en microsoft/table-transformer-structure-recognition, entrenado sobre PubTables-1M (Smock et al., arXiv:2110.00061) y descrito en el paper "PubTables-1M: Towards comprehensive table extraction from unstructured documents". Reconoce 7 clases de estructura de tabla (table, table column, table row, table column header, table projected row header, table spanning cell, no object). La conversion a ONNX la realizo Xenova con HuggingFace Optimum y la cuantizacion INT8 es dinamica via ONNX Runtime. No se dispone de informacion sobre volumen de tokens ni sobre fases de RLHF/DPO, ya que no son modelos de lenguaje.

## Capacidades

- Deteccion de layout de pagina en imagenes de documentos: identificacion y localizacion de regiones semanticas con cajas delimitadoras y puntuaciones de confianza.
- Clasificacion en 17 clases (RT-DETR) o 25 clases (PP-DocLayoutV3), incluyendo tablas, formulas, titulos, parrafos, encabezados, pies de pagina, indices, codigo, formularios y casillas de verificacion.
- Segmentacion por mascara a nivel de region en PP-DocLayoutV3 (salida `fetch_name_2` de [N,200,200]).
- Estimacion del orden de lectura en PP-DocLayoutV3 (septimo campo de `fetch_name_0`).
- Reconocimiento de estructura de tablas con TATR: filas, columnas, cabeceras de fila y columna, y celdas con spanning.
- Soporte de imagenes en resolucion variable: RT-DETR con letterbox a 640x640, PP-DocLayoutV3 con squash a 800x800, TATR con tamano variable (tipicamente 800x800).
- Ejecucion portable via ONNX Runtime en CPU y GPU, con batch dinamico en PP-DocLayoutV3.
- Integracion en el pipeline de xberg: poblado de `ExtractedDocument.formulas` y comprension de graficos mediante `enable_chart_understanding`, con reconocimiento opcional de formulas a LaTeX.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Digitalizacion masiva de documentos escaneados: usar RT-DETR o PP-DocLayoutV3 para segmentar cada pagina en regiones (texto, tablas, figuras, formulas) antes de aplicar OCR selectivo solo a las zonas de texto, reduciendo coste y ruido.
- Extraccion de tablas en informes financieros: combinar la deteccion de regiones `Table` del layout con TATR para reconstruir filas, columnas y cabeceras, y volcar la estructura a CSV o bases de datos.
- Pipeline RAG sobre PDFs tecnicos: el orden de lectura de PP-DocLayoutV3 permite serializar el contenido de la pagina en secuencia correcta antes de trocear y generar embeddings, mejorando la coherencia de los fragmentos.
- Procesamiento de articulos cientificos: detectar formulas (`display_formula`, `inline_formula`, `formula_number`) y activar el reconocimiento LaTeX opcional de xberg para convertir expresiones matematicas en texto estructurado.
- Analisis de formularios administrativos: las clases `Form`, `KeyValueRegion`, `CheckboxSelected` y `CheckboxUnselected` de RT-DETR permiten localizar campos y casillas para su posterior extraccion de valores.
- Ingesta de documentos con maquetacion compleja (periodicos, revistas): PP-DocLayoutV3 incluye clases como `vertical_text`, `aside_text`, `header_image` y `seal`, utiles para separar elementos decorativos del contenido principal.
- Preprocesado en entornos sin GPU: al ser ONNX ligero (29-169 MB), puede ejecutarse en CPU en servicios serverless o contenedores pequenos, integrándose en un pipeline de documentos sin dependencias de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por tamano de pesos, RT-DETR (169 MB FP32) y PP-DocLayoutV3 (130,5 MB FP32) requieren menos de 1 GB de VRAM para inferencia en lote pequeno; TATR (29 MB INT8) es aun mas ligero.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama de entrada son sobradas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integracion nativa en xberg; al ser ONNX estandar, puede servirse con cualquier runtime compatible (ONNX Runtime Server, Triton con backend ONNX, etc.).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|
| RT-DETR (este repo) | Detector layout | 17 | 640x640 | Apache-2.0 | ONNX FP32 | 169 MB |
| PP-DocLayoutV3 (este repo) | Detector layout + mascaras + orden lectura | 25 | 800x800 | Apache-2.0 | ONNX FP32 | 130,5 MB |
| TATR (este repo) | Estructura de tablas | 7 | variable | MIT | ONNX INT8 | 29 MB |
| docling-layout-heron-onnx | Detector layout (origen de RT-DETR) | 17 | 640x640 | Apache-2.0 | ONNX | no disponible |
| microsoft/table-transformer-structure-recognition | Estructura de tablas (origen de TATR) | 7 | variable | MIT | PyTorch | no disponible |
| PaddlePaddle/PP-DocLayoutV3_onnx | Detector layout (origen) | 25 | 800x800 | Apache-2.0 | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta conversacion ni tool calling; su unica funcion es la deteccion visual de regiones.
- Las etiquetas de clase estan en ingles y el modelo no ofrece soporte multilingue declarado; la interpretacion de idioma corresponde a las etapas posteriores de OCR.
- Riesgo de falsos positivos y negativos en maquetaciones atipicas; las clases son fijas y no cubren todos los tipos de region posibles.
- PP-DocLayoutV3 tiene la imagen de entrada fija a 800x800, lo que puede degradar la deteccion en documentos de muy alta resolucion o con texto muy pequeno.
- RT-DETR usa letterbox a 640x640; documentos con relaciones de aspecto extremas pueden sufrir perdida de detalle.
- TATR esta cuantizado a INT8, lo que puede introducir una ligera perdida de precision frente al modelo original en FP32.
- El repositorio es un espejo: la responsabilidad de mantenimiento y las actualizaciones dependen de los proyectos upstream (Docling, PaddlePaddle, Microsoft).
- Las licencias (Apache-2.0 y MIT) permiten uso comercial, pero conviene verificar la procedencia y los terminos de los datasets de entrenamiento originales (DocLayNet, PubTables-1M) si se requiere cumplimiento estricto.
- No se han publicado benchmarks ni metricas de calidad en la informacion disponible, por lo que la evaluacion debe hacerse sobre el dominio concreto de cada usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xberg-io/layout-models
- Documentacion de xberg sobre deteccion de layout: https://docs.xberg.io/guides/layout-detection/
- Repositorio xberg en GitHub: https://github.com/xberg-io/xberg
- Origen RT-DETR (Docling): https://huggingface.co/docling-project/docling-layout-heron-onnx
- Repositorio Docling: https://github.com/docling-project/docling
- Paper RT-DETR: https://arxiv.org/abs/2304.08069
- Origen TATR (Microsoft): https://huggingface.co/microsoft/table-transformer-structure-recognition
- Conversion ONNX de TATR (Xenova): https://huggingface.co/Xenova/table-transformer-structure-recognition
- Paper PubTables-1M: https://arxiv.org/abs/2110.00061
- Origen PP-DocLayoutV3 ONNX: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_onnx
- Pesos originales PP-DocLayoutV3: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- Proyecto PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
