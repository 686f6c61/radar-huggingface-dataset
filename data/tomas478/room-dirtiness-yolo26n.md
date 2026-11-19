# tomas478/room-dirtiness-yolo26n

## Resumen

YOLO26n — room dirtiness es un checkpoint de detección de objetos afinado por el usuario tomas478 a partir de los pesos preentrenados `yolo26n.pt` de Ultralytics. El modelo resuelve una tarea muy concreta: identificar cinco tipos de suciedad en imágenes de habitaciones (derrame de líquido, papelera, basura, moho y mancha), lo que lo hace directamente aplicable a sistemas de inspección visual de limpieza en entornos domésticos, hoteleros o de facilities management. Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Se trata de un detector de una sola etapa de la familia YOLO (arquitectura convolucional tipo CSP con cuello PAN y cabecera de detección anclada), con 2.535.830 parámetros, lo que lo sitúa en la gama "nano" de Ultralytics. El entrenamiento se realizó sobre un dataset propio de 1.200 imágenes de entrenamiento, 150 de validación y 150 de test (split con semilla 44) a `imgsz=640` durante 40 épocas con batch 16.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso de visión artificial muy específico (detección de suciedad) con métricas de test publicadas; por otro, sirve como referencia de cómo se comporta un YOLO nano afinado con un dataset pequeño, con las limitaciones de generalización que ello implica. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar alojados o que el tamaño es inferior a la resolución de medida de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO (detector de una etapa, CNN, familia Ultralytics YOLO26) |
| Parámetros totales | 2.535.830 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (formato nativo PyTorch `.pt`; exportable a ONNX/TensorRT/OpenVINO vía Ultralytics) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); exportable a otros formatos con la CLI de Ultralytics |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de una etapa basado en la arquitectura YOLO de Ultralytics, con backbone convolucional, cuello de agregación de características tipo PAN/FPN y cabecera de predicción densa. La variante "n" (nano) es la de menor tamaño de la familia, con 2,5 millones de parámetros, lo que la orienta a inferencia en tiempo real en hardware modesto. No se trata de un transformer ni de un modelo híbrido; es una CNN pura de detección.

El entrenamiento parte de los pesos COCO preentrenados `yolo26n.pt` y se afina sobre un dataset de suciedad en habitaciones con 1.200 imágenes de train, 150 de validación y 150 de test (split con semilla 44), a resolución 640, 40 épocas, batch 16 y optimizador `auto` (AdamW según la model card). Se realizó una búsqueda de hiperparámetros de 30 épocas (`runs/hparam30`) antes del entrenamiento final. El hardware empleado fue una NVIDIA RTX PRO 4000 Blackwell con Ultralytics 8.4.215 y PyTorch 2.11+cu128. No se documenta el número total de tokens (no aplica), la composición exacta del dataset más allá del recuento, ni si hubo aumento de datos o técnicas de regularización específicas.

## Capacidades

- Detección de objetos en imágenes con cinco clases: derrame de líquido, papelera, basura, moho y mancha.
- Salida de cajas delimitadoras con clase y confianza por instancia.
- Inferencia a resolución 640 píxeles con latencia mediana (p50) de 18,5 ms según la model card.
- Exportación a formatos de despliegue habituales de Ultralytics (ONNX, TensorRT, OpenVINO, CoreML, TFLite) mediante la CLI, aunque no se documenta en la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión multimodal, audio ni generación de texto.

## Casos de uso

- Inspección de limpieza en hoteles: el modelo puede procesar imágenes de habitaciones tomadas por el personal o por cámaras fijas para detectar derrames, basura o manchas antes de dar la habitación por lista, con latencias de ~18 ms que permiten procesar lotes grandes en pocos segundos.
- Mantenimiento de oficinas y facilities: integración en una app móvil donde el operario fotografía la estancia y el modelo marca las zonas sucias, priorizando la intervención del equipo de limpieza.
- Verificación automatizada en alquiler vacacional: análisis de fotos de checkout para detectar moho o manchas persistentes y generar alertas de mantenimiento.
- Robótica de servicio: el detector puede alimentar la capa de percepción de un robot aspirador o de limpieza para localizar papeleras, basura o derrames y planificar la ruta de recogida.
- Control de calidad en lavandería industrial o tintorería: detección de manchas en prendas o superficies antes del proceso de limpieza, con umbral de confianza ajustable.
- Auditoría de estado de inmuebles: procesamiento por lotes de imágenes de inventario para identificar moho (clase con mAP50-95 de 0,576) y manchas (0,441) como indicadores de riesgo, aceptando que estas clases son las más débiles del modelo.
- Dataset augmentation y etiquetado asistido: usar el modelo como preetiquetador en un pipeline de anotación para acelerar el etiquetado de nuevas imágenes de suciedad, dado su recall global de 0,903.

## Benchmarks y rendimiento

Métricas de test publicadas por el autor sobre un holdout de 150 imágenes:

| Métrica | Valor |
|---|---|
| mAP50 | 0,946 |
| mAP50-95 | 0,705 |
| Precision | 0,913 |
| Recall | 0,903 |
| Parámetros | 2.535.830 |
| Latencia de inferencia p50 | 18,5 ms |

Rendimiento por clase (mAP50-95 / precision / recall):

| Clase | mAP50-95 | Precision | Recall |
|---|---|---|---|
| liquid spillage | 0,773 | 0,909 | 0,913 |
| bin | 0,810 | 0,961 | 0,882 |
| litter | 0,925 | 0,982 | 1,000 |
| mould | 0,576 | 0,877 | 0,853 |
| stain | 0,441 | 0,836 | 0,865 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo de 2,5 M de parámetros; en la práctica, el consumo dominante es el de las activaciones a 640×640, típicamente por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una NVIDIA RTX PRO 4000 Blackwell, pero la inferencia cabe en GPUs consumer muy modestas (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos años, e incluso en CPU con latencias mayores.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX Runtime, TensorRT, OpenVINO, TFLite y CoreML; también es posible servir con FastAPI o similar envolviendo el pipeline de Ultralytics.
- Latencia y throughput: latencia p50 de 18,5 ms por imagen a 640 px según la model card (hardware no especificado para esa medición). El throughput exacto en imágenes por segundo no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | mAP50-95 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomas478/room-dirtiness-yolo26n | 2.535.830 | no aplica | 0,705 | MIT | Hugging Face (repo de 0.0 GB, 0 descargas) |
| YOLO26n (COCO, Ultralytics) | ~2,5 M (variante nano) | no aplica | no disponible en esta ficha | AGPL-3.0 (Ultralytics) | Ultralytics / GitHub |
| YOLOv8n (COCO, Ultralytics) | ~3,2 M | no aplica | no disponible en esta ficha | AGPL-3.0 (Ultralytics) | Ultralytics / GitHub |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad. La licencia MIT del checkpoint afinado es más permisiva que la AGPL-3.0 de los pesos base de Ultralytics, lo que conviene verificar legalmente antes de uso comercial.

## Limitaciones y advertencias

- Dataset pequeño: 1.200 imágenes de entrenamiento y 150 de test; las métricas pueden no generalizar a dominios distintos (iluminación, tipos de superficie, cámaras).
- Clases débiles: "stain" (mAP50-95 0,441) y "mould" (0,576) tienen un rendimiento notablemente inferior al resto; su uso en producción requiere umbrales ajustados y revisión humana.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, reflejos o suciedad ambigua; la precision global de 0,913 y el recall de 0,903 dejan margen de error.
- Sesgos conocidos: no documentados por el autor; el dataset no describe composición demográfica, geográfica ni de tipos de habitación.
- Limitaciones de idioma: no aplica (modelo visual), pero las etiquetas de clase están en inglés.
- Restricciones de licencia: el checkpoint se publica como MIT, pero los pesos base `yolo26n.pt` de Ultralytics están bajo AGPL-3.0; el uso comercial del derivado puede requerir revisión legal o licencia comercial de Ultralytics.
- Repositorio con 0 descargas y 0 likes, tamaño de 0.0 GB: verificar que los pesos `best.pt` estén realmente disponibles antes de integrarlo en un pipeline.
- No se documenta el proceso de aumento de datos, la composición exacta del dataset ni la metodología de la búsqueda de hiperparámetros, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/tomas478/room-dirtiness-yolo26n
- Ultralytics (framework y pesos base): https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- Pesos base `yolo26n.pt`: no disponible como enlace directo en la información proporcionada
