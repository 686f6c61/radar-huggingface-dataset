# wesjos/YOLO-head-detection

## Resumen

YOLO-head-detection es una colección de siete checkpoints de detección de objetos basados en las familias YOLOv8 y YOLO11 de Ultralytics, ajustados para una única clase: cabezas humanas. El autor, wesjos, los publica como alternativa específica a los detectores de personas genéricos, orientada a conteo de multitudes, desenfoque por privacidad y como primera etapa previa a un reconocimiento facial. No es un modelo de detección de caras: los datos de entrenamiento provienen de cámaras con dos ángulos predominantes, vista cenital y vista oblicua.

El conjunto de entrenamiento ronda las 15.000 imágenes y la tarea es detección de una sola clase con índice 0. Los checkpoints se distribuyen en formato nativo de Ultralytics (`.pt`) y se cargan con la librería `ultralytics`, lo que permite usarlos directamente con la API de YOLO sin conversiones. El tamaño del repositorio es de 0,2 GB, lo que refleja que se trata de pesos ligeros de las variantes nano, small y medium.

La relevancia práctica está en el equilibrio entre velocidad y precisión dentro de hardware modesto: las variantes nano rondan los 90 FPS y las variantes medium se quedan en torno a 50 FPS, con pesos de entre 6,2 MB y 22,5 MB. La licencia AGPL-3.0, heredada de Ultralytics, condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detección de objetos YOLOv8 y YOLO11 (CNN, single-stage) |
| Parametros totales | no disponible (siete checkpoints de distinto tamaño: n, s, m) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos `.pt` nativos de Ultralytics) |
| Idiomas soportados | no disponible (sin capacidades de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch nativo de Ultralytics) |

## Arquitectura y entrenamiento

Los checkpoints son ajustes finos de los detectores YOLOv8 y YOLO11 de Ultralytics, redes convolucionales de una sola etapa con cabeza de detección anclada y asignación dinámica de etiquetas. El autor publica siete variantes que cubren los tamaños nano, small y medium de ambas familias (por ejemplo `11n-head.pt`, `11m-head.pt`, `v8n-head.pt`, `v8s-head.pt`, `v8m-head.pt`). La tarea se reduce a una única clase, con índice 0 reservado para cabeza, y los checkpoints no incluyen el mapeo de nombres de clase.

El entrenamiento se realizó sobre aproximadamente 15.000 imágenes de escenas de cámara, con dos ángulos dominantes: cenital y oblicua. No se detalla en la información disponible la composición exacta del dataset, el número de épocas, la resolución de entrenamiento ni si hubo aumentos de datos específicos. El autor documenta un comportamiento diferencial entre familias: los checkpoints YOLOv8 no emiten cajas en imágenes sin cabezas en su prueba negativa, mientras que los YOLO11 tienden a producir cajas falsas de baja confianza. No se menciona uso de RLHF, DPO ni técnicas de alineación, algo esperable en un detector.

## Capacidades

- Detección de cabezas humanas en imágenes, con salida de cajas delimitadoras y puntuaciones de confianza.
- Conteo de personas en escenas de multitud, incluyendo vistas cenitales y oblicuas.
- Desenfoque o anonimización por privacidad: las cajas permiten aplicar blur selectivo sobre cabezas.
- Primera etapa de pipelines de reconocimiento facial, reduciendo la región de búsqueda antes de un detector de caras.
- Siete variantes con distintos compromisos de velocidad y recall, seleccionables según la carga de trabajo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye nombres de clase; el índice 0 debe mapearse manualmente para visualización.

## Casos de uso

- Conteo de afluencia en recintos: usar `11n-head.pt` o `v8s-head.pt` sobre fotogramas de cámara cenital para estimar ocupación por frame, con la ventaja de que las cabezas permanecen visibles cuando los cuerpos se solapan.
- Anonimización de vídeo en producción: aplicar las cajas sobre cada fotograma y desenfocar la región de la cabeza antes de almacenar o publicar el material, cumpliendo requisitos de privacidad.
- Preprocesado para reconocimiento facial: encadenar el detector de cabezas con un modelo facial, recortando la región de interés y reduciendo el coste computacional de la segunda etapa.
- Analítica de retail: medir flujos de personas en pasillos con cámaras oblicuas usando `11m-head.pt` o `v8m-head.pt`, que priorizan recall sobre falsos positivos.
- Sistemas embebidos y edge: desplegar `v8n-head.pt` (6,2 MB, 93 FPS) en dispositivos con recursos limitados donde un detector de personas completo no cabría.
- Moderación y control de accesos: contar cabezas en imágenes de entrada para estimar número de personas antes de aplicar reglas de aforo.
- Investigación en visión por computador: punto de partida para experimentos de detección de una sola clase con las familias YOLOv8 y YOLO11.

## Benchmarks y rendimiento

La model card no publica métricas estándar (mAP, precisión, recall) sobre conjuntos de validación. Solo se documentan velocidades y tamaños de pesos para algunas variantes, además de una prueba cualitativa negativa.

| Checkpoint | Tamaño | Velocidad indicada | Notas |
|---|---|---|---|
| `11n-head.pt` | no disponible | no disponible | Recomendado por el autor como opción por defecto |
| `v8n-head.pt` | 6,2 MB | 93 FPS | El más rápido en modelo pequeño |
| `v8s-head.pt` | 22,5 MB | 90 FPS | Equilibrio; cero cajas falsas en la prueba negativa del autor |
| `11m-head.pt` | no disponible | ~50 FPS | Mayor recall |
| `v8m-head.pt` | no disponible | ~50 FPS | Mayor recall |

No se han publicado resultados de benchmarks estándar (mAP, precisión, recall) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los pesos (6,2 MB a 22,5 MB) las variantes nano y small caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 para inferencia en tiempo real; A100 o H100 solo si se procesan muchos flujos en paralelo.
- Cabe en GPU consumer: sí, todas las variantes, incluidas las medium.
- Opciones de despliegue: librería `ultralytics` (PyTorch), exportación a ONNX, TensorRT, OpenVINO o CoreML mediante las utilidades de Ultralytics; también es posible servir con TorchServe o FastAPI.
- Latencia y throughput: el autor reporta 93 FPS para `v8n-head.pt` y 90 FPS para `v8s-head.pt`, y alrededor de 50 FPS para las variantes medium. No se especifica el hardware de medida.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO-head-detection (wesjos) | Detección de cabezas | 1 | Imagen, `imgsz=640` por defecto | AGPL-3.0 | Hugging Face, 7 checkpoints |
| YOLOv8 / YOLO11 base (Ultralytics) | Detección general | 80 (COCO) | Imagen | AGPL-3.0 | Hugging Face y GitHub |
| Detectores de personas COCO | Detección de personas | 1 (persona) | Imagen | variable | variable |
| Detectores de caras (p. ej. RetinaFace, SCRFD) | Detección facial | 1 (cara) | Imagen | variable | variable |

La diferencia clave frente a los detectores de personas genéricos es que aquí la clase objetivo es la cabeza, lo que mejora el conteo en vistas cenitales y en escenas con solapamiento corporal. Frente a los detectores faciales, este modelo no requiere que la cara sea visible. No se dispone de comparativas cuantitativas publicadas con estos modelos.

## Limitaciones y advertencias

- No es un detector de caras: no debe usarse para reconocimiento facial directo sin una etapa posterior.
- Los checkpoints YOLO11 tienden a emitir cajas falsas de baja confianza en imágenes sin cabezas; el autor recomienda `v8s-head.pt` si los falsos positivos son costosos.
- Los pesos no incluyen nombres de clase; el índice 0 debe mapearse manualmente, lo que puede provocar errores en pipelines que esperen etiquetas legibles.
- El dataset de entrenamiento (unas 15.000 imágenes) está sesgado hacia escenas de cámara con vistas cenital y oblicua; el rendimiento en otros ángulos, condiciones de iluminación extremas o dominios distintos no está documentado.
- No se publican métricas de precisión, recall ni mAP, por lo que la evaluación en un dominio concreto requiere validación propia.
- La licencia AGPL-3.0 impone obligaciones de liberación del código fuente en servicios en red; el uso comercial en productos propietarios requiere revisión legal o licencia comercial de Ultralytics.
- Riesgo de alucinación en el sentido de detecciones espurias, especialmente en las variantes YOLO11 y en escenas con patrones que se parezcan a cabezas.
- No hay información sobre sesgos demográficos, de género o de tono de piel en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/YOLO-head-detection
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- Modelo base YOLO11: https://huggingface.co/Ultralytics/YOLO11
- Modelo base YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
