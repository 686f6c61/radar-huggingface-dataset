# youakrim/yolo12n-mlx

## Resumen

yolo12n-mlx es la conversión a formato MLX de los pesos oficiales de Ultralytics YOLO12n para detección de objetos, publicada por el usuario youakrim. Se trata del modelo YOLO12 de tamaño "n" (nano), con 2,6 millones de parámetros, cuyos pesos han sido transformados desde el formato PyTorch original (`.pt`) a ficheros NumPy `.npz` para poder ejecutarse con la implementación yolo12-mlx sobre Apple MLX. No hay reentrenamiento: únicamente cambia el layout de los tensores (de OIHW a OHWI), por lo que los pesos son idénticos a los del modelo oficial.

El modelo resuelve la tarea de detección de objetos sobre las 80 clases del dataset COCO, ejecutándose de forma nativa en hardware Apple Silicon mediante el framework MLX. Es relevante para desarrolladores que trabajan en Mac con chip de la serie M y quieren ejecutar un detector YOLO12 sin depender de PyTorch ni de CUDA, aprovechando la GPU unificada de estos equipos.

Se distribuye bajo licencia AGPL-3.0, heredada de Ultralytics, y el repositorio contiene únicamente los pesos convertidos junto con las instrucciones de uso para la librería yolo12-mlx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12 (base Ultralytics/YOLO12), detector de objetos |
| Parametros totales | 2,6 M |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp32 y bf16 en inferencia (pesos sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | NumPy `.npz` (layout OHWI); origen PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo es un detector de objetos YOLO12 en su variante nano, derivado directamente de los pesos oficiales de Ultralytics/YOLO12. La conversión publicada no modifica los valores de los pesos ni reentrena el modelo: solo se transforma la disposición de los tensores de convolución de OIHW (formato PyTorch) a OHWI (formato esperado por MLX). Esta operación es la que permite cargar el mismo modelo entrenado en el ecosistema MLX sin pérdida de precisión, como confirman los resultados de evaluación idénticos entre ambos backends.

No se dispone en la información proporcionada de detalles sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset más allá de COCO, ni sobre el uso de técnicas de ajuste como RLHF o DPO (no aplicables a un detector). Tampoco se documentan innovaciones de arquitectura específicas internas al modelo más allá de las propias de YOLO12.

## Capacidades

- Detección de objetos en imágenes sobre las 80 clases del dataset COCO.
- Salida de cajas delimitadoras con clase y puntuación de confianza, procesadas con NMS (conf 0,001, IoU 0,7, máximo 300 detecciones).
- Ejecución nativa en Apple Silicon mediante MLX, tanto en fp32 como en bf16.
- Preprocesado con letterbox a resolución 640, consistente con el backend PyTorch oficial.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye capacidades de segmentación, pose ni audio: la única tarea soportada es la detección de objetos.

## Casos de uso

- Prototipado de visión por computador en Mac: un desarrollador puede clonar el repositorio yolo12-mlx, descargar los pesos `.npz` y ejecutar detecciones sobre imágenes locales aprovechando la GPU de un chip Apple Silicon, sin configurar CUDA ni PyTorch.
- Procesamiento por lotes de imágenes en estaciones de trabajo Mac: al ser un modelo nano de 2,6 M de parámetros con 8,37 ms por imagen en bf16 (M5), es viable procesar miles de imágenes en pipelines de etiquetado o filtrado previo.
- Análisis de imágenes en el borde sobre portátiles Apple: la baja huella de memoria permite ejecutar el detector junto a otras aplicaciones sin agotar la memoria unificada.
- Filtrado previo en flujos de datos visuales: usar el detector para descartar o priorizar imágenes antes de enviarlas a modelos mayores o a servicios en la nube, reduciendo coste de cómputo.
- Evaluación y comparación de backends: sirve como referencia para medir el rendimiento de MLX frente a PyTorch MPS en la misma tarea, con cifras reproducibles de latencia y mAP.
- Sistemas de monitorización o vigilancia local: integración en scripts que analicen fotogramas o capturas almacenadas en un Mac para detectar las clases COCO relevantes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre COCO val2017 (5000 imágenes), con el mismo preprocesado y NMS en ambos backends y evaluación con pycocotools:

| Backend | mAP50-95 | mAP50 |
|---|---|---|
| MLX (este repositorio) | 0,4054 | 0,5631 |
| PyTorch (`.pt` oficial) | 0,4054 | 0,5631 |

Velocidad (solo forward del modelo, Apple M5, 640x640, batch 1, mediana de 100 ejecuciones tras calentamiento, GPU sincronizada, sin NMS ni E/S):

| Backend | ms / imagen |
|---|---|
| MLX fp32 | 10,17 |
| MLX bf16 | 8,37 |
| PyTorch MPS fp32 | 16,53 |
| PyTorch MPS fp16 | 14,45 |

Los valores de mAP no están verificados de forma independiente (marcados como `verified: false` en el model-index).

## Requisitos de hardware

- VRAM/memoria: muy baja, por debajo de 1 GB, dado que el modelo tiene 2,6 M de parámetros y procesa imágenes a 640x640.
- GPU recomendadas: cualquier chip Apple Silicon de la serie M (el autor reporta medidas en un M5). No requiere GPU NVIDIA ni CUDA.
- Cabe con holgura en cualquier Mac con Apple Silicon, incluidos modelos con memoria unificada reducida.
- Opciones de despliegue: MLX a través de la librería yolo12-mlx (repositorio del autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia medida: 8,37 ms por imagen en MLX bf16 y 10,17 ms en MLX fp32 (Apple M5, 640x640, batch 1), sin incluir NMS ni E/S.

## Comparativa con modelos similares

| Modelo | Parametros | mAP50-95 (COCO) | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo12n-mlx | 2,6 M | 0,4054 | MLX (Apple Silicon) | AGPL-3.0 | HuggingFace (este repo) |
| Ultralytics YOLO12n (`.pt`) | 2,6 M | 0,4054 | PyTorch | AGPL-3.0 | Ultralytics |
| Otras variantes YOLO12 (s, m, l, x) | no disponible | no disponible | MLX | AGPL-3.0 | Colección YOLO12 for MLX |
| Otros detectores nano comparables (YOLOv8n, YOLO11n) | no disponible | no disponible | varios | AGPL-3.0 | no disponible |

El único punto de comparación con datos en la información proporcionada es el propio YOLO12n en PyTorch, con resultados de precisión idénticos y mayor latencia en el backend MPS (16,53 ms fp32 y 14,45 ms fp16 frente a 10,17 ms y 8,37 ms en MLX).

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso en productos de código cerrado o como servicio de red exige cumplir las obligaciones de la AGPL, lo que puede limitar su adopción comercial sin una licencia alternativa de Ultralytics.
- Solo funciona con MLX: requiere Apple Silicon y la librería yolo12-mlx; no es directamente cargable en PyTorch, TensorFlow ni en runtimes de GPU NVIDIA.
- Restringido a las 80 clases del dataset COCO, sin capacidad de detectar clases no incluidas en ese conjunto.
- Al ser la variante nano (2,6 M de parámetros), su precisión (mAP50-95 de 0,4054) es inferior a la de las variantes s, m, l o x de la misma familia, aunque no se aportan cifras de estas en la información disponible.
- No hay reentrenamiento ni ajuste: para dominios específicos habría que reentrenar el modelo original en Ultralytics y volver a convertirlo.
- Los resultados de mAP no están verificados de forma independiente; proceden del model-index declarado por el autor.
- En detección de objetos, los errores se manifiestan como falsos positivos, falsos negativos o cajas mal localizadas, con impacto especialmente en objetos pequeños u ocluidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youakrim/yolo12n-mlx
- Repositorio yolo12-mlx (GitHub): https://github.com/youakrim/yolo12-mlx
- Colección YOLO12 for MLX: https://huggingface.co/collections/youakrim/yolo12-for-mlx-6ac659ef0a06781003d1d3cc
- Modelo base (Ultralytics YOLO12): https://huggingface.co/Ultralytics/YOLO12
- Dataset COCO utilizado en la evaluación: https://huggingface.co/datasets/detection-datasets/coco
