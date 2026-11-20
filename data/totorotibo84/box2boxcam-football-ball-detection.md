# Totorotibo84/box2boxcam-football-ball-detection

## Resumen

box2boxcam-ball-v1.0 es un detector de balon de futbol (clase unica "sports ball") desarrollado por Totorotibo84, basado en YOLO26-small de Ultralytics. Esta pensado para partidos filmados con un telefono en la banda de campos amateur y de base, donde el balon aparece a un tamano util. El modelo se distribuye en pesos PyTorch y como paquete Core ML (FP16, con NMS incluido) para seguimiento del balon en tiempo real en iPhone, por ejemplo sobre un gimbal DockKit.

El problema que resuelve es el de la retencion automatica de camara en producciones deportivas de bajo presupuesto: sin operador humano, el dispositivo necesita localizar el balon en cada fotograma para orientar el encuadre. Fine-tunear un detector generico de COCO sobre footage amateur permite multiplicar la tasa de acierto frente al modelo de fabrica en ese dominio concreto (de 51 a 99 verdaderos positivos a confianza 0,25 en el split de test publico), a costa de sacrificar cualquier otra clase de objeto.

Es relevante ahora porque combina un modelo de deteccion de objetos pequeno con un pipeline de despliegue en dispositivo (Core ML) orientado a hardware de consumo, y porque documenta de forma transparente sus limites: menos de la mitad de los balones se detectan a tasas de falsos positivos utilizables, y la mayoria de los fallos corresponden a balones pequenos y lejanos (16 px o menos). La arquitectura concreta (YOLO26-small, ~9,5 M parametros segun la familia YOLO26s de Ultralytics), el contexto de entrenamiento (3.451 imagenes a 960 px) y la licencia AGPL-3.0 condicionan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-small (Ultralytics), detector de objetos single-stage, una sola clase |
| Parametros totales | no disponible (la model card no declara el recuento; la base es `yolo26s.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP16 en el paquete Core ML; pesos PyTorch sin cuantizar declarada |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch) y `.mlpackage` (Core ML) |

## Arquitectura y entrenamiento

Detector de objetos YOLO26-small (familia Ultralytics), preentrenado en COCO y fine-tuneado a una unica clase, "sports ball", con entrada de 960 px. Receta: 30 epocas, early stopping con paciencia 8, batch 8, AdamW con learning rate inicial 0,001, semilla 42, ejecutado en Hugging Face Jobs sobre una GPU a10g-small. El paquete Core ML se exporta en FP16 con supresion de no maximos (NMS) integrada, lo que permite ejecutar la deteccion completa en iPhone sin postproceso adicional significativo.

Datos de entrenamiento: 3.451 imagenes (3.283 de entrenamiento y 168 de validacion). De ellas, 1.941 fueron filmadas por el autor en campos amateur y en casa, 603 proceden de videos cortos online y 907 de un unico video online (739 para entrenamiento y 168 para validacion). Las cajas no son ground truth dibujado a mano: se generaron como propuestas automaticas (en parte mediante APIs de modelos de terceros) y fueron revisadas manualmente por el autor. El footage de terceros no se redistribuye, solo se referencia por URL. En el dataset publico las cabezas se difuminan con un modelo de pose, si bien el modelo se entreno sobre fotogramas sin difuminar y sobre algunos clips del autor no incluidos en el dataset publico.

## Capacidades

- Deteccion de una unica clase: balon de futbol ("sports ball"), sin deteccion de jugadores ni de otros objetos.
- Deteccion de objetos pequenos en resolucion de entrada alta (960 px), con recall parcial en balones de 16 px o menos.
- Ejecucion en tiempo real en dispositivo: paquete Core ML FP16 con NMS integrado, integrable via Vision (`VNCoreMLRequest`).
- Integracion con seguimiento de camara: pensado para alimentar un auto-tracking sobre gimbal DockKit en iPhone.
- Inferencia en Python con Ultralytics (`model.predict`, `imgsz=960`, `conf=0.25`).
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Retencion automatica de camara en partidos amateur: el detector localiza el balon en cada fotograma y el controlador del gimbal DockKit reorienta el telefono para mantener el juego en encuadre, sin operador.
- Produccion de video de base (grassroots) con presupuesto minimo: sustituye a un operador de camara en partidos filmados desde la banda con un unico iPhone.
- Analisis post-partido de clips amateur: ejecutar el detector sobre `match.mp4` con Ultralytics para extraer la trayectoria del balon y generar heatmaps o estadisticas de zona de juego.
- Segmentacion de clips por posesion: usar las detecciones por fotograma para marcar intervalos en los que el balon esta visible y util, descartando planos sin balon.
- Prototipado de pipelines de vision deportiva: base de partida para anadir deteccion de jugadores (el autor combina el detector con deteccion de personas y pose en el stack movil) y construir analitica deportiva.
- Demo educativa de despliegue Core ML en iOS: ejemplo completo de exportacion Ultralytics a `.mlpackage`, integracion con Vision y consumo en tiempo real en dispositivo.
- Filtrado previo en herramientas de etiquetado: usar las propuestas del modelo como precandidatos de caja del balon para revision humana, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre un partido amateur reservado nunca usado en entrenamiento: 396 fotogramas, 219 balones, de los cuales 149 miden 16 px o menos. Matching a IoU >= 0,5, entrada 960 px.

| Confianza | Verdaderos positivos | Falsos positivos |
|---:|---:|---:|
| 0,25 | 100 | 103 |
| 0,35 | 93 | 60 |
| 0,45 | 86 | 30 |
| 0,55 | 81 | 3 |

- A 0,25: recall 100/219 (45,7 %), precision 100/203 (49,3 %).
- Balones pequenos: 57 de 149 detectados a 0,25 (38 %).
- Variacion entre ejecuciones: un reentrenamiento de control con semilla 7 dio 100/110, 93/77, 86/38 y 76/12 en los cuatro umbrales; diferencias de ese orden deben tratarse como ruido.
- Precision del paquete Core ML: no medida; las cifras anteriores corresponden a los pesos PyTorch.
- Velocidad: aproximadamente 30 Hz en iPhone para el stack completo en dispositivo (detector de balon + deteccion de personas + pose); el detector aislado no fue cronometrado.

Comparacion con YOLO26s de fabrica (COCO, clase 32 "sports ball"), mismo split de test publico (396 fotogramas, 219 balones, 149 de 16 px o menos, cabezas difuminadas), misma herramienta de evaluacion, 960 px, IoU >= 0,5, formato VP/FP por umbral:

| Modelo | 0,25 | 0,35 | 0,45 | 0,55 | Recall / precision a 0,25 | Balones pequenos a 0,25 | Max VP con FP <= 25 / 60 / 100 / 200 |
|---|---:|---:|---:|---:|---:|---:|---:|
| YOLO26s de fabrica (COCO "sports ball") | 51 / 55 | 47 / 22 | 35 / 9 | 27 / 4 | 23 % / 48 % | 23 de 149 | 47 / 53 / 65 / 72 |
| Antes de etiquetas automaticas de campo | 96 / 207 | 93 / 113 | 88 / 61 | 81 / 18 | 44 % / 32 % | 54 de 149 | 85 / 88 / 92 / 96 |
| box2boxcam v1.0 | 99 / 100 | 92 / 52 | 85 / 22 | 82 / 4 | 45 % / 50 % | 55 de 149 | 86 / 93 / 99 / 111 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por la familia YOLO26-small y la entrada de 960 px, el modelo es desplegable en GPUs de consumo, pero no se declara una cifra.
- GPU recomendadas: entrenamiento ejecutado en una a10g-small (Hugging Face Jobs); para inferencia no se especifican modelos recomendados.
- Cabe en GPU de consumo: si, por tamano de familia (YOLO26-small), aunque el autor no aporta mediciones.
- Despliegue: Ultralytics (PyTorch) en Python; Core ML via Vision en iOS; exportable a otros formatos de Ultralytics no documentados en la model card (GGUF, TensorRT, ONNX: no confirmados).
- Latencia y throughput: ~30 Hz en iPhone para el stack completo en dispositivo; el detector aislado no fue cronometrado. En GPU no hay datos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Recall / precision (0,25) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| box2boxcam-ball-v1.0 | no disponible (base YOLO26s) | 960 px | 45 % / 50 % | AGPL-3.0 | Hugging Face, pesos `.pt` + `.mlpackage` |
| YOLO26s de fabrica (COCO, clase "sports ball") | no disponible en la informacion | 960 px | 23 % / 48 % | AGPL-3.0 (Ultralytics) | Ultralytics |
| Antes de etiquetas automaticas de campo (variante intermedia del autor) | no disponible | 960 px | 44 % / 32 % | AGPL-3.0 | No publicada como modelo independiente |

No se dispone en la informacion proporcionada de comparativas con otros detectores especializados de balon de terceros.

## Limitaciones y advertencias

- Recall bajo: a confianza 0,25 solo se detecta el 45,7 % de los balones del split de test; a tasas de falsos positivos utilizables (0,55) el recall cae al 37 % (81/219).
- Rendimiento pobre en balones pequenos y lejanos: solo 57 de 149 balones de 16 px o menos se detectan a 0,25.
- Alto indice de falsos positivos a umbrales bajos: 103 FP a 0,25 frente a 100 VP.
- Fuera de alcance: footage de television profesional (no esta en los datos de entrenamiento), otros deportes o balones (no evaluados).
- Etiquetas de entrenamiento generadas automaticamente y revisadas por clic, no ground truth dibujado a mano: introduce ruido en las cajas.
- Variacion entre ejecuciones no despreciable: diferencias de 7 a 17 falsos positivos entre semillas; no interpretar mejoras pequenas como significativas.
- Precision del paquete Core ML no medida; las cifras publicadas son de los pesos PyTorch.
- Privacidad: el dataset publico difumina cabezas con un modelo de pose, pero cabezas pequenas (menos de ~20 px) pueden permanecer y los jugadores pueden ser reconocibles por otras senales; el modelo se entreno con fotogramas sin difuminar.
- Licencia AGPL-3.0: uso comercial condicionado a las obligaciones de copyleft de la AGPL (distribucion del codigo fuente derivado, incluido el servicio en red); revisar antes de integrar en producto propietario.
- Modelo de autor individual con 0 descargas y 0 likes en el momento de la ficha: madurez y mantenimiento no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Totorotibo84/box2boxcam-football-ball-detection
- Dataset: https://huggingface.co/datasets/Totorotibo84/box2boxcam-football-ball-detection-dataset
- Paper referenciado (arXiv 2508.01802): https://arxiv.org/abs/2508.01802
- Ultralytics (framework y familia YOLO26): https://github.com/ultralytics/ultralytics
- Core ML / Vision (Apple): https://developer.apple.com/documentation/coreml
- DockKit (Apple): https://developer.apple.com/documentation/dockkit
