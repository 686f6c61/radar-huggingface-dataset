# ubr-physical-ai/rescue-target-yolo26n

## Resumen

`rescue-target-yolo26n` es un modelo de detección de objetos desarrollado por `ubr-physical-ai` para localizar una única señal de búsqueda y rescate: una persona tumbada en el suelo con un chaleco de alta visibilidad. El modelo está afinado sobre el checkpoint `yolo26n.pt` de Ultralytics, por lo que hereda la arquitectura YOLO de la familia YOLO26 en su variante nano. Todo el entrenamiento se ha realizado con imágenes sintéticas generadas en NVIDIA Isaac Sim, con 3.960 imágenes de entrenamiento y 440 de validación a resolución 1024×768, en tres entornos interiores (almacén, hospital y oficina) y tres vistas de cámara.

La relevancia del modelo radica en que ofrece una solución específica para robots de rescate y trabajo experimental, no para despliegue como componente de seguridad. Se distribuye bajo licencia AGPL-3.0, tanto en formato PyTorch (`.pt`) como en ONNX (`.onnx`), y su carácter de detector de visión hace que no tenga contexto de lenguaje. El autor advierte, no obstante, de un hallazgo de saturación: las métricas headlie están en el techo del conjunto de validación y el slice de largo alcance no permite distinguir entre variantes, lo que obliga a interpretar cualquier cifra con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics, red neuronal convolutional de detección de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo es un YOLO26n, la variante nano de la familia YOLO de Ultralytics. Se ha realizado un ajuste fino sobre los pesos preentrenados `yolo26n.pt`, con un esquema de entrenamiento documentado en `configs/args.yaml` y `run.json`. Los hiperparámetros principales para la ejecución v0 son: resolución de entrada 640, 2 clases, 60 épocas, tamaño de lote 64, `patience=0` (sin early stopping), `deterministic=False`, aumentos por defecto de Ultralytics (mosaic 1.0, `close_mosaic=10`, `fliplr` 0.5, HSV, randaugment, `erasing` 0.4), `optimizer=auto` y `lr0` 0.01. El entrenamiento se ejecutó con Ultralytics 8.4.145 y PyTorch 2.13.0+cu130 sobre una NVIDIA B300.

El conjunto de datos es `ubr-physical-ai/isaac-sdg-rescue-target`, compuesto por rendidos sintéticos de NVIDIA Isaac Sim en 3.960 imágenes de entrenamiento y 440 de validación, todos a 1024×768. El autor indica explícitamente que estos hiperparámetros no se han ajustado de forma exhaustiva y que no hay una búsqueda realizada más allá del barrido de `imgsz` y número de clases. No se menciona ninguna innovación técnica destacable más allá del uso de datos sintéticos para generar el conjunto objetivo.

## Capacidades

- Detección de una clase específica: personas en posición prona o supina en el suelo, con chaleco de alta visibilidad (naranja o amarillo), identificada como `person_lying_vest`.
- Inclusión de una clase `distractor` para rechazar objetos irrelevantes o clutter, presente solo en la variante de 2 clases. Esta clase no es una salida útil por sí misma.
- Disponibilidad en dos formatos: PyTorch (`.pt`) y ONNX (`.onnx`).
- Los archivos ONNX están exportados con `nms=False` y `end2end=False`, por lo que el modelo no realiza supresión de no máximos internamente. El tensor de salida es `output0`, con cajas en formato `cx, cy, w, h` en píxeles de resolución de entrada y puntuaciones de clase activadas por sigmoide.
- No soporta tool calling, generación de texto, agentes ni capacidades multilingües: es exclusivamente un detector de visión por computador.
- El modelo está entrenado en tres vistas de cámara: `orbit`, `roverview` (4–8,5 m) y `roverview_far` (10–17,5 m), lo que le confiere cierta capacidad de detección a distintas distancias.

## Casos de uso

- Búsqueda y rescate en interiores: robots con cámara pueden emplear el modelo para localizar personas inconscientes o caídas que lleven un chaleco de alta visibilidad en almacenes, hospitales u oficinas. La clase `person_lying_vest` está diseñada específicamente para este escenario.
- Entrenamiento de robots de rescate en simulación: el dataset sintético generado con Isaac Sim permite probar el detector en entornos virtuales controlados antes de trasladarlo al mundo real. La variante de 2 clases con distractor facilita la evaluación de rechazo de ruido.
- Banco de pruebas para algoritmos de detección: al estar disponible en ONNX con salida sin NMS, el modelo puede integrarse en pipelines de investigación donde se quiera implementar una supresión de no máximos personalizada o comparar distintas estrategias de postprocesado.
- Vigilancia en instalaciones industriales: cámaras fijas o móviles pueden monitorizar zonas de trabajo para detectar personas caídas con chaleco reflectante, un posible indicador de accidente laboral.
- Drones de búsqueda con visión aérea: la vista `roverview_far` (10–17,5 m) permite plantear su uso en dronos que sobrevuelan una zona afectada para localizar a víctimas que lleven un chaleco de alta visibilidad.
- Investigación académica en visión por computador: el modelo es un caso práctico de transferencia de datos sintéticos a un dominio específico. Los archivos `B_summary.csv` y `v0_results.csv` son útiles para analizar el rendimiento por vista y por clase, y para estudiar el efecto de la saturación de métricas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación corresponden únicamente a la clase `person_lying_vest` sobre el conjunto de validación de 440 imágenes.

| Metrica | Valor |
|---|---|
| mAP@0.5 (v0) | 0.9949 |
| mAP@0.5:0.95 (v0) | 0.9358 |
| Falsas alarmas en 8 imágenes reales vacías (conf 0.25) | 0 |

Recall por vista de cámara:

| Vista | Recall | Imagenes | Cajas clase 0 |
|---|---|---|---|
| `orbit` | 1.0000 | 240 | 236 |
| `roverview` (4–8,5 m) | 0.9900 | 100 | 100 |
| `roverview_far` (10–17,5 m) | 0.9815 | 100 | 54 |

Resultados del barrido de hiperparámetros (mediana de 3 semillas, clase 0):

| Arm | mAP@0.5 | mAP@0.5:0.95 | Recall `roverview_far` |
|---|---|---|---|
| `640_2cls` | 0.9949 | 0.9358 | 0.9815 |
| `640_1cls` | 0.9950 | 0.9442 | 0.9815 |
| `1280_2cls` | 0.9950 | 0.9514 | 0.9815 |
| `1280_1cls` | 0.9950 | 0.9580 | 0.9815 |

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA B300; el coste fue de 16,3 minutos para la ejecución v0 en solitario, 19 minutos por ejecución a `imgsz` 640 y 59 minutos a `imgsz` 1280 cuando se compartía la GPU.
- No se han publicado cifras específicas de VRAM, latencia ni throughput para la inferencia. Dado que es un modelo YOLO26n (variante nano), se puede asumir que es ligero, pero el autor no aporta datos concretos.
- Los archivos disponibles son pesos PyTorch y modelos ONNX, por lo que las opciones de despliegue incluyen Ultralytics para inferencia nativa y cualquier runtime de ONNX (por ejemplo, ONNX Runtime).
- No se mencionan requisitos de GPU para la ejecución en producción; la información disponible no permite determinar si cabe en una GPU de consumo ni en qué modelos concretos.

## Comparativa con modelos similares

No se han encontrado modelos comparables de la misma categoría en la información disponible. El propio modelo base, `Ultralytics/YOLO26`, es el punto de partida del ajuste fino, pero no se proporcionan resultados de rendimiento de dicho modelo base en el mismo dominio. En consecuencia, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos de NVIDIA Isaac Sim, por lo que la transferencia a imágenes reales puede ser limitada. El autor lo califica como "intended for bench and research work on rescue robots — not for deployment as a safety component".
- Los resultados de validación se encuentran en el techo del conjunto; el slice `roverview_far` no permite distinguir entre variantes del modelo. Esto significa que las métricas headline pueden sobreestimar la capacidad real en escenarios no vistos.
- La clase `distractor` está pensada solo para dar formas negativas al modelo; no es una salida útil para aplicaciones reales.
- Los archivos ONNX no realizan NMS internamente. Es obligatorio implementar la supresión de no máximos en el código del usuario, lo que añade carga de desarrollo.
- El modelo solo reconoce una clase muy concreta: personas tumbadas con chaleco de alta visibilidad. No detecta personas en general ni otro tipo de objetos, por lo que su uso se limita a ese escenario concreto.
- Licencia AGPL-3.0: si se modifican los pesos o el código y se ofrecen a través de una red (API web, demo, robot con interfaz remota), la sección 13 obliga a proporcionar el código fuente completo de la versión modificada. Ejecutar el modelo de forma privada en hardware propio no activa esa obligación, pero ofrecer el servicio a terceros sí.
- Para incluir el modelo en un producto cerrado se necesita una licencia empresarial de Ultralytics para el modelo original; el repositorio no puede concederla.
- La licencia de los datos de entrenamiento es CC-BY-4.0 y es independiente de la licencia de los pesos, que es AGPL-3.0.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/ubr-physical-ai/rescue-target-yolo26n
- Dataset de entrenamiento: https://huggingface.co/datasets/ubr-physical-ai/isaac-sdg-rescue-target
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
