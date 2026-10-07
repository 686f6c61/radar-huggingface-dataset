# youakrim/yolo12m-mlx

## Resumen

YOLO12m MLX es una conversión de los pesos oficiales de Ultralytics YOLO12m (20,3 millones de parámetros) al formato NumPy `.npz` para su uso con MLX, el framework de cómputo de Apple para silicio de la serie M. Se trata de un modelo de detección de objetos en tiempo real entrenado sobre COCO (80 clases), publicado por el usuario youakrim junto con la implementación yolo12-mlx en GitHub.

El problema que resuelve es la falta de una ruta de inferencia nativa en MLX para los pesos de YOLO12: en lugar de depender de PyTorch con el backend MPS, este repositorio permite ejecutar el detector directamente sobre el stack de MLX en Apple Silicon. Los pesos son idénticos a los originales; lo único que cambia es la disposición de los tensores, convertida de OIHW a OHWI, sin reentrenamiento alguno.

Es relevante para desarrolladores que despliegan visión por computador en Macs (portátiles o de sobremesa) y quieren evitar la capa de PyTorch, además de servir como punto de entrada para comparar el rendimiento de ambos backends sobre el mismo modelo. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12 (detector de objetos en tiempo real, base Ultralytics/YOLO12) |
| Parametros totales | 20,3 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | pesos en fp32 y bf16 ejecutables en MLX; el binario `.npz` se distribuye sin cuantizar |
| Idiomas soportados | no aplica (modelo de deteccion de objetos) |
| Licencia | AGPL-3.0 (heredada de Ultralytics YOLO12) |
| Formato de pesos | NumPy `.npz` (layout OHWI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO12, un detector de objetos de una sola etapa cuyo peso recae en mecanismos de atencion en lugar de convoluciones puras, orientado a latencia baja en tiempo real. El modelo concreto es la variante "m" (medium), con 20,3 millones de parametros, entrenada sobre el conjunto COCO y capaz de predecir cajas delimitadoras para 80 clases. Este repositorio no modifica esa arquitectura: unicamente reempaqueta los pesos oficiales de Ultralytics para que MLX pueda consumirlos.

No hubo reentrenamiento ni ajuste fino. La unica transformacion aplicada es la permutacion del layout de tensores de OIHW (formato habitual en PyTorch) a OHWI (formato esperado por MLX). Los detalles de entrenamiento original (numero exacto de tokens o imagenes, composicion del dataset mas alla de COCO, y cualquier fase de optimizacion) no se documentan en esta ficha y deben consultarse en la publicacion y el repositorio oficiales de YOLO12; el autor indica expresamente "No retraining" y "The weights are unchanged".

## Capacidades

- Deteccion de objetos en una sola pasada sobre imagenes de 640x640, con preprocesado letterbox.
- Salida de cajas delimitadoras con puntuacion de clase para las 80 categorias de COCO.
- Inferencia acelerada en Apple Silicon mediante MLX, con modo fp32 y bf16.
- Soporte de post-procesado NMS configurable (el autor usa conf 0,001, IoU 0,7 y maximo 300 detecciones para la evaluacion).
- No incluye segmentacion, pose, clasificacion ni deteccion orientada; es exclusivamente un detector de cajas.
- No ofrece tool calling, function calling, capacidades de agente ni razonamiento multi-paso, por tratarse de un modelo de vision puro.
- No tiene capacidades multilingues ni de generacion de texto.
- Interfaz de linea de comandos propia (`python -m yolo12mlx.predict`) para ejecutar la deteccion sobre una imagen.

## Casos de uso

- Deteccion de objetos en local sobre Mac: un desarrollador puede ejecutar el modelo directamente en un MacBook con MLX, sin necesidad de GPU NVIDIA ni del stack de PyTorch, gracias a que los pesos ya estan en el layout OHWI.
- Prototipado rapido de pipelines de vision: al ser un `.npz` pequeno (repo de 0,1 GB) y de carga rapida, resulta adecuado para validar ideas de deteccion antes de escalar a un modelo mayor o a otra plataforma.
- Aplicaciones de escritorio en macOS: integrar deteccion de objetos en apps nativas de Apple aprovechando MLX, por ejemplo para catalogar fotos, recortar sujetos o etiquetar automaticamente una biblioteca de imagenes.
- Analitica de retail o aforo en el borde: con 20,3 M de parametros y latencias de decenas de milisegundos por imagen, es viable en un Mac mini o un portatil para contar personas o productos en flujos de video, siempre que se respete la licencia AGPL-3.0.
- Robotica y vision embebida en hardware Apple: usar el detector como modulo de percepcion en prototipos que corran sobre chips M, con NMS y E/S gestionados fuera del nucleo del modelo.
- Comparacion de backends en investigacion: el repositorio permite medir la misma red en MLX y en PyTorch MPS bajo preprocessing identico, lo que facilita estudios de rendimiento entre frameworks en Apple Silicon.
- Preprocesado de datasets de imagenes: ejecutar deteccion masiva para generar cajas candidatas que alimenten anotaciones o filtros posteriores, aprovechando el modo bf16 para acelerar el barrido.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre COCO val2017 (5000 imagenes), con idéntico preprocesado (letterbox 640) y mismo NMS (conf 0,001, IoU 0,7, maximo 300 detecciones), puntuados con pycocotools:

| Backend | mAP50-95 | mAP50 |
|---|---|---|
| MLX (este repo) | 0,5217 | 0,6914 |
| PyTorch (`.pt` oficial) | 0,5217 | 0,6913 |

Metricas marcadas como no verificadas en el model-index del autor.

Velocidad (solo forward del modelo, Apple M5, 640x640, batch 1, mediana de 100 ejecuciones tras calentamiento, GPU sincronizada, NMS y E/S excluidos):

| Backend | ms / imagen |
|---|---|
| MLX fp32 | 45,43 |
| MLX bf16 | 32,69 |
| PyTorch MPS fp32 | 49,62 |
| PyTorch MPS fp16 | 27,25 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (serie M). MLX no se ejecuta en GPU NVIDIA ni AMD; requiere macOS con chip M1 o posterior.
- VRAM/unificada estimada: aproximadamente 81 MB solo para los pesos en fp32 (20,3 M x 4 bytes) y unos 41 MB en bf16, mas el coste de activaciones y buffers de inferencia. Cabe holgadamente en cualquier Mac con memoria unificada.
- GPU recomendadas: cualquier chip Apple M con GPU integrada; el autor reporta mediciones sobre Apple M5. No aplica A100, H100 ni RTX 4090, que no soportan MLX.
- Cabe en hardware de consumo: si, en cualquier Mac de la serie M, incluidos portatiles con memoria unificada basica, dado el tamano reducido del modelo.
- Opciones de despliegue: libreria MLX de Apple, junto con la implementacion yolo12-mlx del autor, invocada desde Python como modulo. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: 32,69 ms por imagen en MLX bf16 y 45,43 ms en MLX fp32 sobre Apple M5 (640x640, batch 1, solo forward, sin NMS ni E/S). El throughput depende del batch y del pipeline de pre/post-procesado, no medido en la informacion disponible.

## Comparativa con modelos similares

La comparacion mas directa es la misma red YOLO12m ejecutada en dos backends, ya que el repositorio es una conversion y no un modelo nuevo:

| Modelo / variante | Parametros | Backend | mAP50-95 | Licencia |
|---|---|---|---|---|
| YOLO12m MLX (este repo) | 20,3 M | MLX | 0,5217 | AGPL-3.0 |
| YOLO12m oficial (`.pt`) | 20,3 M | PyTorch | 0,5217 | AGPL-3.0 |

El autor mantiene ademas una coleccion "YOLO12 for MLX" con otras variantes de tamano (n, s, l, x), pero los datos concretos de esas variantes no se incluyen en la informacion disponible.

No se dispone de resultados verificados en la informacion proporcionada para comparar este modelo con alternativas de la misma categoria como YOLOv8, YOLO11 o RT-DETR.

## Limitaciones y advertencias

- Licencia AGPL-3.0: uso comercial sujeto a las obligaciones de copyleft de esta licencia, heredadas de Ultralytics YOLO12; conviene revisar las condiciones antes de integrarlo en productos propietarios o servicios en red.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no es portable a entornos CUDA ni a servidores sin chips Apple.
- Es un detector de cajas unicamente; no ofrece segmentacion, pose, clasificacion de escenas ni ninguna capacidad generativa.
- Riesgo de falsos positivos y negativos inherente a la deteccion en COCO, especialmente en clases poco frecuentes, objetos pequenos o condiciones de baja iluminacion u oclusion.
- El autor marca las metricas del model-index como no verificadas (verified: false), por lo que los valores de mAP deben tomarse como declarados por el autor y no auditados de forma independiente.
- El NMS y las E/S no estan incluidos en las mediciones de velocidad; la latencia efectiva en produccion sera mayor que los 32-45 ms reportados por imagen.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la actual, lo que sugiere un uso muy minoritario y poca validacion por parte de la comunidad.
- No se documentan sesgos especificos del modelo en la informacion disponible; los sesgos de COCO (desbalance de clases y de contextos geograficos) son aplicables de forma general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/youakrim/yolo12m-mlx
- Implementacion yolo12-mlx en GitHub: https://github.com/youakrim/yolo12-mlx
- Coleccion YOLO12 for MLX: https://huggingface.co/collections/youakrim/yolo12-for-mlx-6ac659ef0a06781003d1d3cc
- Modelo base: https://huggingface.co/Ultralytics/YOLO12
- Dataset COCO en HuggingFace: https://huggingface.co/datasets/detection-datasets/coco
