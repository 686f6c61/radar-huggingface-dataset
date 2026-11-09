# Thareah/ThaOCR-layout

## Resumen

ThaOCR-layout es un detector de maquetación de página (document layout analysis) basado en YOLO11 y distribuido en formato ONNX. Forma parte de ThaOCR, una tubería de OCR para jemer y inglés dividida en cinco etapas (layout, detección de líneas de texto, reconocimiento de líneas, clasificación de fuente y estructura de página). El modelo resuelve la primera etapa: localizar sobre una imagen de página las regiones semánticas (texto, título, tabla, sello, logotipo, escritura manual, casillas, campos de formulario, etc.) antes de que las etapas posteriores procesen el contenido.

El modelo por defecto es `layout_yolo11n_v3_22cls`, una variante YOLO11n de 2,6 millones de parámetros y 10,9 MB en ONNX, con 22 clases. Existe también una variante YOLO11s (38,2 MB) con 21 clases y mayor precisión en algunas métricas. La entrada es estática, de tamaño fijo `[1, 3, 1024, 1024]`, y el preprocesado (letterbox) y el postprocesado (NMS) corren a cargo del llamador, lo que simplifica el despliegue en entornos con onnxruntime sobre CPU.

La relevancia del modelo radica en su enfoque: un detector de maquetación ligero, específicamente entrenado con datos sintéticos y reales de documentos camboyanos (jemer) y anglosajones, pensado para ejecutarse en CPU y en dispositivos de gama baja (variante "phone-size"). Es un componente de infraestructura para pipelines de digitalización documental en contextos donde el jemer es idioma principal y los recursos de cómputo son limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | 2,6 M (variante nano por defecto); no disponible para la variante s |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 1024×1024) |
| Tipos de cuantización | no disponible (se distribuye en ONNX en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | km (jemer), en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (opset 17); también `.pt` (checkpoint Ultralytics) para la variante v1 |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 de Ultralytics, un detector de objetos de una sola etapa con entrada de imagen fija de 1024×1024 píxeles. Se ofrecen dos escalas: YOLO11n (2,6 M de parámetros, 10,9 MB en ONNX) y YOLO11s (38,2 MB en ONNX). El modelo no incluye preprocesado ni postprocesado: el letterbox y la supresión de no máximos (NMS) debe implementarlos el llamador. Los nombres de las clases se almacenan en los metadatos `names` del propio archivo ONNX.

El entrenamiento se realizó con Ultralytics YOLO11, tamaño de imagen 1024, optimizador AdamW, programación de tasa de aprendizaje coseno, mosaic 0,6 y sin volteo horizontal. La evolución fue iterativa: la v1 (12 clases) se entrenó sobre páginas sintéticas de jemer, páginas PDF reales de jemer con etiquetas heurísticas y DocLayNet. La v2 adoptó una taxonomía de 21 clases y se afinó en dos rondas sobre un conjunto de 32.290 páginas de entrenamiento y 923 de validación. La v2 nano partió de pesos preentrenados en COCO (`yolo11n.pt`). La v3 nano (modelo por defecto) se afinó sobre 18.000 páginas de entrenamiento y 1.100 de validación, añadiendo la clase `decoration` y reutilizando 8.000 páginas de la ronda 2 para evitar el olvido de clases anteriores; se aplicó rotación de ±2°, escala 0,35 y se cerró el mosaic en las últimas 3 épocas.

Los datos de entrenamiento combinan páginas sintéticas generadas (12.000 documentos camboyanos y estadounidenses/ingleses: cartas, memorandos, facturas, recibos, formularios, tarjetos de identidad, informes, hojas de examen y periódicos, con texto inglés de Project Gutenberg y sellos/logotipos procedurales), DocLayNet v2 (6.895 páginas reales de entrenamiento y 647 de validación), páginas PDF reales de jemer con etiquetas heurísticas (548 de entrenamiento y 173 de validación), recortes de firmas de SignverOD, escaneos de sellos de mapo80, un subconjunto de D4LA (2.834 páginas, con clases no etiquetadas completadas por un modelo profesor) y CommonForms (1.517 páginas, solo casillas). Las fotos privadas de exámenes del autor no se usaron para entrenar.

## Capacidades

- Detección de 22 clases de regiones de maquetación en la versión por defecto: text, title, section_header, list, table, figure, caption, header, footer, page_number, footnote, formula, signature, stamp, logo, qr_code, barcode, photo, handwriting, checkbox, form_field y decoration.
- Detección de maquetación específica para documentos en jemer e inglés, incluyendo documentos administrativos, facturas, formularios, tarjetas de identidad y hojas de examen.
- Localización de elementos gráficos y de seguridad documental: sellos, firmas, logotipos, códigos QR, códigos de barras y fotografías.
- Detección de campos de formulario y casillas de verificación, útil para pipelines de extracción de datos estructurados.
- Detección de escritura manual como región diferenciada del texto impreso.
- Ejecución en CPU mediante onnxruntime, sin necesidad de GPU.
- Integración como primera etapa de una tubería OCR de cinco fases (layout → textdet → rec → font → structure).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector de objetos.

## Casos de uso

- Digitalización de documentos administrativos camboyanos: el modelo localiza las regiones de texto, sellos y firmas en páginas escaneadas de documentos gubernamentales o de ONG, permitiendo que las etapas posteriores de OCR procesen solo las zonas relevantes y reduzcan el ruido.
- Procesamiento de facturas y recibos: la detección de tablas, campos de formulario y texto permite segmentar la página antes de aplicar extracción de campos, lo que mejora la precisión en documentos con maquetación heterogénea.
- Extracción de datos de formularios: la detección específica de `form_field` y `checkbox` permite localizar casillas y campos rellenables para su posterior lectura automática, útil en digitalización de solicitudes y encuestas.
- Análisis de hojas de examen: la clase `handwriting` y la detección de regiones de respuesta permiten separar las zonas manuscritas de las impresas, facilitando la corrección automática o la extracción de respuestas.
- Verificación documental y detección de elementos de seguridad: la localización de sellos, firmas, códigos QR y códigos de barras permite comprobar la presencia y posición de estos elementos en procesos de validación de documentos.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse con onnxruntime sobre CPU y con un modelo de 10,9 MB, es adecuado para pipelines de digitalización masiva en infraestructura de bajo coste o en dispositivos de gama baja.
- Preprocesado para OCR multilingüe jemer-inglés: la detección de regiones de texto y títulos permite ordenar la lectura de la página antes de la etapa de reconocimiento, mejorando la estructuración del texto extraído.

## Benchmarks y rendimiento

| Modelo | mAP50 | mAP50-95 | Precisión | Recall | Conjunto de validación |
|---|---|---|---|---|---|
| `layout_yolo11n_v3_22cls` (por defecto) | 0,972 | 0,842 | 0,967 | 0,939 | v3 val |
| `layout_yolo11s_v2_r2_21cls` | 0,971 | 0,847 | no disponible | no disponible | v3 val (clases compartidas) |
| `layout_yolo11s_v2_r2_21cls` | 0,962 | 0,834 | no disponible | no disponible | v2 val |
| `layout_yolo11n_v2_21cls` | 0,956 | 0,798 | no disponible | no disponible | v2 val |
| `layout_yolo11s_v1_12cls` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de validación internas indicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; en GPU, el modelo de 10,9 MB (nano) ocupa menos de 1 GB de VRAM incluyendo buffers de entrada de 1024×1024, y la variante s de 38,2 MB requiere igualmente menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se requiere una GPU de gama alta. Funciona en CPU sin GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, etc.) e incluso en iGPU.
- Opciones de despliegue: onnxruntime (CPU o GPU), con preprocesado letterbox y NMS implementados por el llamador. El checkpoint `.pt` de la variante v1 puede ejecutarse con Ultralytics.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Clases | mAP50-95 | Licencia | Formato |
|---|---|---|---|---|---|---|
| ThaOCR-layout (v3 nano) | YOLO11n | 2,6 M | 22 | 0,842 | AGPL-3.0 | ONNX |
| ThaOCR-layout (v2 s) | YOLO11s | no disponible | 21 | 0,847 | AGPL-3.0 | ONNX |
| DocLayNet baseline (referencia del dataset) | varios | no disponible | 11 + page_number | no disponible | CDLA-Permissive 1.0 (datos) | no disponible |
| LayoutLMv3 (modelo de maquetación con texto) | Transformer multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros detectores de maquetación en la información proporcionada. La comparativa se limita a las variantes del propio modelo y a la referencia del conjunto de datos DocLayNet, utilizado en su entrenamiento.

## Limitaciones y advertencias

- Licencia AGPL-3.0 heredada de los pesos base de Ultralytics YOLO11: el uso comercial en productos distribuidos o en servicios en red puede obligar a liberar el código fuente bajo la misma licencia. Es imprescindible revisar las implicaciones legales antes de usarlo en producción.
- Parte de los datos de entrenamiento son solo para uso de investigación (páginas PDF reales de jemer), lo que puede imponer restricciones adicionales al uso comercial del modelo entrenado.
- El modelo está especializado en jemer e inglés; su rendimiento en otros idiomas o sistemas de escritura no está documentado y probablemente sea deficiente.
- No incluye preprocesado ni postprocesado: el letterbox y el NMS deben implementarse correctamente por el llamador; errores en esta implementación degradan la precisión.
- La entrada es de tamaño fijo 1024×1024; imágenes de otras resoluciones deben redimensionarse, lo que puede afectar a la detección de regiones muy pequeñas.
- La variante por defecto (v3 nano) no puede predecir la clase `decoration` en la variante s de la ronda 2, y viceversa; la elección de variante condiciona las clases detectables.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de falsos positivos y falsos negativos en la detección, especialmente en documentos degradados o con maquetaciones no representadas en el entrenamiento.
- El modelo se distribuye con 0 descargas y 0 likes en Hugging Face, y fue creado en noviembre de 2026; no hay evidencia de validación externa por parte de la comunidad.
- Las métricas de validación son internas y sobre conjuntos de validación propios; no hay comparación con benchmarks públicos estándar de layout analysis.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thareah/ThaOCR-layout
- Etapa de detección de líneas de texto: https://huggingface.co/Thareah/ThaOCR-textdet
- Etapa de reconocimiento: https://huggingface.co/Thareah/ThaOCR-rec
- Etapa de clasificación de fuente: https://huggingface.co/Thareah/ThaOCR-font
- Etapa de estructura de página: https://huggingface.co/Thareah/ThaOCR-structure
- Repositorio índice con el manifiesto completo: https://huggingface.co/Thareah/ThaOCR-models
- Ultralytics YOLO11 (arquitectura base): https://github.com/ultralytics/ultralytics
- DocLayNet (conjunto de datos): https://huggingface.co/datasets/ds4sd/DocLayNet
- D4LA (conjunto de datos): https://modelscope.cn/datasets
- CommonForms (conjunto de datos): https://huggingface.co/datasets
- SignverOD (conjunto de datos de firmas): https://huggingface.co/datasets
- onnxruntime: https://onnxruntime.ai
