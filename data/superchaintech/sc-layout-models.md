# superchaintech/sc-layout-models

## Resumen

sc-layout-models es un conjunto de modelos de detección de layout de documentos exportados a formato ONNX, desarrollados por superchaintech (Super Cat Technology Limited). Se basa en el modelo original Armaggheddon/yolo26-document-layout, entrenado sobre el dataset DocLayNet, y se distribuye bajo licencia MIT. El modelo sirve como detector de layout por defecto en el toolkit híbrido de parseo de PDFs `sc_toolkit`, permitiendo identificar regiones como texto, títulos, tablas, figuras y listas en documentos escaneados o digitales.

Se ofrecen dos variantes: `yolo26m_doc_layout.onnx` (~82 MB), la opción estándar, y `yolo26n_doc_layout.onnx` (~10 MB), una versión ligera para entornos con recursos limitados. Ambos archivos están optimizados para inferencia con ONNX Runtime, sin necesidad de dependencias de Ultralytics en producción. La exportación se realizó con imgsz=1280, opset=17 y simplificación del grafo, incluyendo metadatos de nombres de clases.

La relevancia de este modelo radica en su formato ONNX, que facilita su integración en pipelines de procesamiento de documentos en múltiples plataformas (CPU, GPU, edge), y en su tamaño reducido, que lo hace adecuado para despliegues ligeros. Aunque no es un modelo de lenguaje, complementa sistemas de extracción de información al localizar con precisión las regiones estructurales de un documento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de una etapa, basado en CNN) |
| Parametros totales | no disponible (variante m: ~82 MB ONNX, variante n: ~10 MB ONNX) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (exportacion ONNX en FP32, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo detecta layout, no depende del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx, simplificados, opset 17) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26, una evolución de la familia YOLO (You Only Look Once) orientada a la detección de objetos en tiempo real. YOLO26 utiliza una backbone CNN con características multiescala y una cabeza de detección que predice cajas delimitadoras y clases para cada región del documento. El modelo original fue entrenado sobre el dataset DocLayNet, que contiene más de 80.000 páginas de documentos anotadas con 11 clases de layout (texto, título, lista, tabla, figura, etc.). El proceso de entrenamiento no se detalla en la información disponible, pero se asume un esquema supervisado estándar para detección de objetos.

La exportación a ONNX se realizó con un tamaño de imagen de entrada de 1280x1280 píxeles, opset 17 y simplificación del grafo. Los metadatos de nombres de clases se incrustan en el archivo ONNX. Según la documentación del autor, la inferencia ONNX coincide con el runtime de Ultralytics en aproximadamente el 98% de las regiones detectadas con IoU≥0.5, existiendo pequeñas diferencias en el 2% restante. Esto implica que el modelo es prácticamente equivalente al original en términos de precisión, con la ventaja de no requerir la dependencia de Ultralytics en producción.

## Capacidades

- Detección de regiones de layout en documentos: identifica y delimita elementos como texto, títulos, listas, tablas, figuras, formularios y otros componentes estructurales.
- Clasificación de regiones: asigna una de las 11 clases de DocLayNet a cada caja detectada.
- Inferencia eficiente en ONNX Runtime: permite ejecución en CPU, GPU y dispositivos edge sin dependencias adicionales.
- Dos variantes de tamaño: la variante `m` ofrece mayor precisión, mientras que la `n` es adecuada para entornos con recursos limitados o requisitos de latencia estrictos.
- Integración con pipelines de parseo híbrido: se usa como detector por defecto en `sc_toolkit`, combinando detección de layout con OCR para extraer contenido estructurado.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo localiza las regiones de texto, tablas y totales, permitiendo a un sistema posterior aplicar OCR y reglas de negocio para extraer campos como importes, fechas o números de factura.
- Digitalización de documentos escaneados: al detectar la estructura del documento, se puede reconstruir el flujo de lectura (títulos, párrafos, listas) para generar versiones digitales accesibles o indexables.
- Clasificación automática de documentos: las regiones detectadas sirven como características para distinguir tipos de documentos (contratos, informes, artículos científicos) en sistemas de gestión documental.
- Preprocesamiento para OCR: al conocer la ubicación de las regiones de texto, se puede recortar y mejorar la calidad de cada zona antes de aplicar un OCR, reduciendo errores en documentos con layouts complejos.
- Análisis de documentos científicos: identifica figuras, tablas y secciones de texto en artículos de investigación, facilitando la extracción de resultados y la comparación entre publicaciones.
- Automatización de procesos de negocio: integrado en un pipeline de RPA, permite procesar formularios, solicitudes o contratos sin intervención manual, alimentando sistemas de workflow con datos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una comparación interna en el repositorio `sc_toolkit` (`docs/layout-model-comparison-2026-08.md`) que indica una coincidencia del 98% con el runtime de Ultralytics a IoU≥0.5, pero no se proporcionan métricas detalladas como mAP o F1 sobre DocLayNet. Por tanto, no se pueden presentar datos numéricos verificables.

## Requisitos de hardware

- El modelo ONNX es ligero: la variante `m` ocupa ~82 MB y la `n` ~10 MB, por lo que puede ejecutarse en CPU sin GPU dedicada.
- VRAM estimada: no disponible oficialmente, pero para un modelo de ~82 MB en FP32, se estima un consumo de memoria de alrededor de 200-300 MB en GPU, aunque esto no está confirmado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede manejar la variante `m`; la variante `n` funciona incluso en GPUs integradas o en CPU.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), también compatible con herramientas como OpenVINO o TensorRT mediante conversión adicional.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño, se espera una inferencia en el rango de decenas de milisegundos en GPU y de cientos de milisegundos en CPU para imágenes de 1280x1280.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de detección de layout como LayoutLMv3, Detectron2 o modelos basados en YOLO similares. La información proporcionada no incluye métricas de rendimiento ni comparaciones publicadas. Se puede afirmar que, al estar basado en YOLO26, ofrece un equilibrio entre velocidad y precisión típico de la familia YOLO, pero sin datos cuantitativos no es posible realizar una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo presenta una desviación conocida del ~2% en las regiones detectadas respecto al runtime de Ultralytics, lo que puede provocar pequeñas diferencias en las cajas delimitadoras o en la clasificación en casos límite.
- No se ha evaluado su robustez en documentos con calidad de escaneo muy baja, rotaciones extremas o layouts no vistos en DocLayNet.
- El modelo solo detecta layout, no realiza OCR ni extracción de texto; requiere un sistema complementario para tareas de extracción de contenido.
- La licencia MIT permite uso comercial sin restricciones, pero el dataset DocLayNet original tiene su propia licencia (CC BY 4.0) que puede imponer atribución en algunos casos.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor; el repositorio puede no recibir actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superchaintech/sc-layout-models
- Modelo original (Armaggheddon/yolo26-document-layout): https://huggingface.co/Armaggheddon/yolo26-document-layout
- Repositorio sc_toolkit (mencionado en la model card, URL no disponible en la información proporcionada)
