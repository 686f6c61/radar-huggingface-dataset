# superchaintech/yolo26m-doc-layout-onnx

## Resumen

Este repositorio contiene un export en formato ONNX del modelo `yolo26m_doc_layout.pt`, un detector de layout de documentos basado en la arquitectura YOLO26m y entrenado sobre el dataset DocLayNet. El modelo original fue publicado por Armaggheddon y este repositorio, mantenido por superchaintech, únicamente cambia el contenedor del modelo: de un archivo `.pt` de ultralytics a un grafo ONNX ejecutable con `onnxruntime`. La motivación principal es separar la licencia del modelo (MIT) de la del runtime de ultralytics (AGPL-3.0), permitiendo así su integración en entornos propietarios sin contaminación de licencia.

El modelo detecta 11 clases de elementos típicos de páginas de documentos (títulos, tablas, figuras, pies de página, etc.) y está pensado para tareas de análisis de layout en pipelines de procesamiento documental. El archivo ONNX ocupa 82 MB, tiene una entrada fija de 1280×1280 píxeles y fue exportado con `opset=17` y simplificación de grafo. Es relevante porque ofrece una alternativa ligera y sin dependencias pesadas para sistemas de extracción de información en documentos, con una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26m (red neuronal convolucional de deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (export FP32, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un YOLO26m, perteneciente a la familia YOLO26 de Ultralytics. Esta familia introduce inferencia end-to-end nativa, una cabeza de deteccion mas ligera, un regimen de entrenamiento actualizado y cabezas especificas para tareas de deteccion, segmentacion, estimacion de pose, clasificacion y deteccion orientada. En las escalas de deteccion publicadas, YOLO26 alcanza entre 40.9 y 57.5 mAP en COCO, con mejoras notables sobre YOLO11 en mAP@50-95 y recall, segun la documentacion oficial.

El modelo fue entrenado especificamente para analisis de layout de documentos sobre el dataset DocLayNet, que contiene paginas de articulos academicos, informes financieros y otros documentos tecnicos. El export ONNX conserva los pesos entrenados y la metadata de nombres de clases (11 clases DocLayNet). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO, al tratarse de un modelo de vision.

## Capacidades

- Deteccion de objetos en imagenes de paginas de documentos, identificando 11 clases: `Caption`, `Footnote`, `Formula`, `List-item`, `Page-footer`, `Page-header`, `Picture`, `Section-header`, `Table`, `Text` y `Title`.
- Procesamiento de imagenes a resolucion fija de 1280×1280 píxeles, con entrada en formato CHW y normalizacion a `float32 / 255`.
- Ejecucion mediante `onnxruntime` en CPU o GPU, sin necesidad de instalar ultralytics ni torch.
- Salida de cajas delimitadoras con confianza, lista para post-procesamiento (NMS) y mapeo de etiquetas.
- Compatible con la herramienta `sc_toolkit`, que envuelve el letterboxing, NMS y mapeo de clases.
- No soporta tool calling, agentes, razonamiento multimodal ni generacion de texto; es exclusivamente un detector de objetos.

## Casos de uso

- Extraccion de tablas en informes financieros: el modelo identifica regiones de tablas y permite aislarlas para posterior OCR o conversion a formatos estructurados. Su precision en DocLayNet lo hace adecuado para documentos de banca y auditoria.
- Digitalizacion de articulos academicos: detecta titulos, secciones, formulas y figuras, facilitando la conversion a HTML o LaTeX estructurado.
- Clasificacion de paginas en archivos PDF: al detectar pies de pagina, cabeceras y numeros de pagina, se pueden separar paginas de contenido de portadas o anexos.
- Preprocesamiento para pipelines de RAG (generacion aumentada por recuperacion): al segmentar el documento en bloques semanticos (texto, tablas, figuras), se mejora la calidad de la indexacion y recuperacion.
- Automatizacion de facturas y recibos: identifica regiones de texto y tablas para extraer campos clave (importes, fechas, proveedores) sin depender de plantillas rigidas.
- Control de calidad en impresion digital: verifica que los elementos del layout (imagenes, titulos, pies) esten presentes y correctamente posicionados en documentos generados automaticamente.
- Integracion en sistemas propietarios de gestion documental: al usar ONNX con licencia MIT, puede embeberse en aplicaciones comerciales sin conflictos de licencia con ultralytics (AGPL-3.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (como mAP sobre DocLayNet) en la informacion disponible. La model card incluye una evaluacion anecdota: sobre seis paginas reales (un articulo de contabilidad de KPMG y un informe anual de Hong Kong) a 150 dpi y con `min_conf=0.25`, se detectaron 78 regiones, sin paginas vacias y con confidencias maximas entre 0.84 y 0.99. No hay datos comparativos con otros modelos en este repositorio.

## Requisitos de hardware

- El archivo ONNX pesa 82 MB, por lo que la carga en memoria es ligera.
- Puede ejecutarse en CPU con `onnxruntime` (el ejemplo de uso de la model card usa `CPUExecutionProvider`), aunque la inferencia a 1280×1280 puede ser lenta en CPUs de gama baja.
- Para produccion con alto rendimiento se recomienda una GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650 o superior. Modelos como RTX 3060 o A100 ofrecen latencias mas bajas.
- No se requieren dependencias de torch ni ultralytics; basta con `onnxruntime` y una libreria de procesamiento de imagen (PIL, OpenCV).
- Opciones de despliegue: `onnxruntime` directamente, o mediante servidores de inferencia como Triton Inference Server, o integrado en pipelines con `sc_toolkit`.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `superchaintech/yolo26m-doc-layout-onnx` | YOLO26m | 11 (DocLayNet) | ONNX | MIT | Export sin dependencias ultralytics |
| `Armaggheddon/yolo26-document-layout` | YOLO26m | 11 (DocLayNet) | `.pt` (ultralytics) | MIT | Modelo original, requiere ultralytics (AGPL) |
| PP-DocLayoutV3 (mencionado en la model card) | CNN (PaddleOCR) | multiples | varios | Apache 2.0 | Usa `min_conf=0.5` por defecto, menor cobertura de span |

No se dispone de comparativas cuantitativas de rendimiento entre estos modelos en la informacion proporcionada. La comparativa se limita a aspectos cualitativos de formato, licencia y calibracion de confianza.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente en DocLayNet, que contiene documentos academicos y de negocios en ingles principalmente; puede degradarse en otros idiomas o tipos de documento (manuscritos, formularios, etc.).
- La entrada esta fijada a 1280×1280; cualquier otro tamaño requiere un letterboxing correcto, y un desajuste puede producir errores o cajas mal escaladas.
- No se incluyen cuantizaciones (INT8, FP16) en el repositorio; el modelo se distribuye en FP32, lo que puede limitar su uso en dispositivos con poca memoria.
- El modelo no realiza OCR ni extraccion de texto; solo detecta regiones. Para extraer el contenido se necesita un paso adicional.
- La licencia MIT del modelo no cubre posibles dependencias de terceros (como `onnxruntime`, que es MIT, o `sc_toolkit`, cuya licencia no se especifica).
- No se han publicado evaluaciones formales de sesgos o errores sistematicos; la unica prueba documentada es sobre seis paginas, por lo que el rendimiento en produccion debe validarse con datos propios.
- El export fue generado con `simplify=True` y `opset=17`; si se requiere compatibilidad con versiones antiguas de `onnxruntime`, puede ser necesario reexportar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/superchaintech/yolo26m-doc-layout-onnx
- Modelo base (Armaggheddon/yolo26-document-layout): https://huggingface.co/Armaggheddon/yolo26-document-layout
- Documentacion de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26
- Repositorio de YOLO26 en GitHub: https://github.com/ultralytics/yolo26
- Herramienta `sc_toolkit` (mencionada en la model card): https://github.com/catyung/sc_toolkit
