# yale-cultural-heritage/shadow-puppets-yolov11

## Resumen

Shadow puppets YOLO11 es una familia de detectores de objetos basados en Ultralytics YOLO11, desarrollada por Yale Cultural Heritage, para localizar marionetas de sombras javanesas (wayang kulit) en las fotografías de la colección de Yale. El modelo no es un modelo generativo de lenguaje, sino un detector de objetos de visión por computador entrenado para identificar cinco clases concretas: el cuerpo de la marioneta, la marioneta completa con varillas, la banda del hombro y dos reglas de referencia (una vertical de 92 cm y otra horizontal de 61 cm) que permiten convertir las cajas detectadas a centímetros reales.

Se publican cinco variantes de tamaño (n, s, m, l, x) de la misma arquitectura YOLO11, cada una como el mejor checkpoint de su entrenamiento. El conjunto de datos de entrenamiento es pequeño (747 imágenes) y muy específico de un único montaje fotográfico, lo que hace que el modelo sea útil como herramienta de digitalización y catalogación de patrimonio cultural, pero poco generalizable fuera de ese contexto.

La relevancia actual del modelo reside en su aplicación práctica: permite automatizar la medición de piezas de museo a partir de fotografías con reglas de referencia, integrable en flujos de trabajo como chai-engine. La licencia AGPL-3.0 es un factor determinante para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (depende de la variante n/s/m/l/x; no se especifican cifras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos .pt de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase están en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11 de Ultralytics, un detector de objetos de una sola etapa con backbone y cuello de agregación de características multi-escala, en cinco escalas (n, s, m, l, x). Cada variante se inicializa desde los pesos preentrenados en COCO y se ajusta con 100 épocas, tamaño de imagen 640, batch 16 y una única GPU H200. No se documenta el uso de RLHF, DPO ni técnicas de alineación, al no ser un modelo generativo.

El conjunto de datos es Roboflow `yale-ai/yale-shadow-puppets` versión 10, con 747 imágenes en formato YOLO y licencia CC BY 4.0. Cada imagen muestra una marioneta sobre cartón gris con una regla vertical de 92 cm y una horizontal de 61 cm, más una etiqueta de pizarra. Las cinco clases son `body-without-rods`, `horizontal-ruler`, `puppet-with-rods`, `shoulder` y `vertical-ruler`. La innovación técnica destacable no está en la arquitectura, sino en el uso de las reglas como referencia de escala para convertir las cajas a centímetros mediante la herramienta `ScaleMeasurer` de chai-engine.

## Capacidades

- Detección de objetos en imágenes con cinco clases específicas de marionetas wayang kulit y sus reglas de referencia.
- Localización de la marioneta completa con varillas y del cuerpo sin varillas.
- Detección de la banda del hombro de la marioneta.
- Detección de las dos reglas de referencia (vertical de 92 cm y horizontal de 61 cm) para el cálculo de escala.
- Conversión de cajas de píxeles a centímetros mediante la comparación con las reglas detectadas.
- Integración con flujos de trabajo de chai-engine mediante `YoloSegmenter` y `ScaleMeasurer`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- Catalogación de colecciones museísticas: el modelo detecta la marioneta y las reglas en cada fotografía, y `ScaleMeasurer` convierte las cajas a centímetros, permitiendo registrar dimensiones reales de forma automatizada en bases de datos de patrimonio.
- Digitalización de archivos fotográficos de wayang kulit: procesamiento por lotes de las fotografías de la colección de Yale para extraer bounding boxes y medidas de cada pieza sin intervención manual.
- Control de calidad de la fotografía de documentación: la comparación entre la escala derivada de la regla horizontal y la de la vertical permite detectar fotografías mal encuadradas o reglas parcialmente visibles antes de aceptar las medidas.
- Segmentación previa a análisis morfológico: las cajas de `body-without-rods` y `shoulder` sirven como entrada para pipelines posteriores de análisis de forma o comparación entre piezas.
- Integración en flujos chai-engine: el modelo se referencia como `hf://yale-cultural-heritage/shadow-puppets-yolov11/shadow-puppets-yolo11m.pt` dentro de un workflow JSON, lo que permite encadenar detección y medición en un solo proceso reproducible.
- Investigación en humanidades digitales: permite estudiar la proporción y dimensiones de marionetas de distintas regiones o épocas a partir de fotografías estandarizadas, con métricas reproducibles.
- Prototipado rápido en colecciones similares: al ser un modelo pequeño (variante n o s), puede servir como base para fine-tuning en otros montajes fotográficos con reglas de referencia.

## Benchmarks y rendimiento

Métricas sobre el split de validación en la mejor época de cada entrenamiento, según la model card:

| Variante | Base | Precision | Recall | mAP50 | mAP50-95 |
|---|---|---|---|---|---|
| shadow-puppets-yolo11n.pt | yolo11n | 0.947 | 0.948 | 0.952 | 0.673 |
| shadow-puppets-yolo11s.pt | yolo11s | 0.954 | 0.941 | 0.962 | 0.700 |
| shadow-puppets-yolo11m.pt | yolo11m | 0.949 | 0.956 | 0.959 | 0.692 |
| shadow-puppets-yolo11l.pt | yolo11l | 0.940 | 0.950 | 0.957 | 0.700 |
| shadow-puppets-yolo11x.pt | yolo11x | 0.960 | 0.959 | 0.966 | 0.670 |

No se han publicado comparaciones con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la variante (n/s/m/l/x) y del tamaño de imagen de entrada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H200; para inferencia, cualquier GPU con soporte CUDA es suficiente, incluidas las variantes pequeñas en GPUs de consumo.
- Cabe en GPU de consumo: sí, previsiblemente las variantes n y s en tarjetas con 4-8 GB de VRAM; las variantes l y x requieren más memoria, aunque no se documentan cifras exactas.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT u otros formatos soportados por Ultralytics; integración con chai-engine.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shadow puppets YOLO11 (este modelo) | Detección de marionetas y reglas | no disponible (5 variantes n/s/m/l/x) | no aplica | AGPL-3.0 | HuggingFace, 90 descargas |
| YOLO11 base (COCO) | Detección de objetos genérica | no disponible | no aplica | AGPL-3.0 | Ultralytics |
| Otros detectores específicos de patrimonio cultural | Detección de objetos | no disponible | no aplica | variable | no disponible |

No se dispone de datos de benchmarks comparativos con otros detectores en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para un único montaje fotográfico: una marioneta sobre cartón gris con dos reglas y una etiqueta de pizarra. No generaliza a otros fondos, iluminaciones o disposiciones.
- La precisión de las medidas depende de la calidad de las cajas de las reglas; una caja que no cubra los extremos de la regla introduce error en todas las medidas de esa fotografía.
- El conjunto de entrenamiento es pequeño (747 imágenes), lo que aumenta el riesgo de sobreajuste al montaje y de falsos negativos en condiciones ligeramente distintas.
- La licencia AGPL-3.0 impone obligaciones copyleft para uso en red y distribución; es necesario revisar su compatibilidad con el uso comercial previsto.
- No se documentan sesgos demográficos ni de otro tipo, al no tratar personas; el sesgo relevante es el de dominio (estilo fotográfico y tipo de marioneta).
- No se han publicado datos de latencia, throughput ni requisitos exactos de VRAM.
- Las etiquetas de clase están en inglés y el modelo no procesa lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yale-cultural-heritage/shadow-puppets-yolov11
- Dataset en Roboflow: https://universe.roboflow.com/yale-ai/yale-shadow-puppets/dataset/10
- Repositorio chai-engine: https://github.com/yale-ch/chai-engine
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
