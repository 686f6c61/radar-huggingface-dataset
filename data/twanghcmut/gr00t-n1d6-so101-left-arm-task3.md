# twanghcmut/gr00t-n1d6-so101-left-arm-task3

## Resumen

`twanghcmut/gr00t-n1d6-so101-left-arm-task3` es un ajuste fino del modelo fundacional de robotica NVIDIA Isaac GR00T N1.6 3B, un modelo de vision-lenguaje-accion (VLA) disenado para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imagenes de camara. Lo publica el usuario `twanghcmut` y esta especializado en el brazo robotico SO101 (embodiment de 6 grados de libertad), cubriendo tres tareas de manipulacion de objetos y cajones que se seleccionan mediante la instruccion de lenguaje.

El modelo parte de la arquitectura GR00T N1.6 de NVIDIA, con 3.286.608.832 parametros, y se ha entrenado sobre el dataset `hungho77/so101-left-arm-task3` (159 episodios, 133.763 frames a 30 fps en formato LeRobot v2.1). La receta congela la torre de vision y la mayor parte del LLM, y solo entrena el proyector, la cabeza de difusion y las 4 capas superiores del LLM durante 6.000 pasos en una unica H100 de 80 GB.

Su relevancia es practica: demuestra un flujo completo de ajuste fino de un VLA de NVIDIA sobre un brazo de bajo coste (SO101, ecosistema LeRobot) con un presupuesto de computo modesto (unas 9 horas en una GPU), y publica evaluacion open-loop comparada con GR00T N1.7 y pi0.5 sobre los mismos datos. La licencia NVIDIA limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en NVIDIA Isaac GR00T N1.6 (transformer con torre de vision, LLM y cabeza de difusion para acciones) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona despliegue con TensorRT via VLA-RT) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | NVIDIA License (`nvidia-license`, uso limitado a fines no comerciales) |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repo 9,8 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/GR00T-N1.6-3B`. La receta de entrenamiento entrena unicamente el proyector, la cabeza de difusion y las 4 capas superiores del LLM; la torre de vision y el resto del LLM permanecen congelados. El estado y la accion tienen dimension 6 (`single_arm` con shoulder_pan, shoulder_lift, elbow_flex, wrist_flex y wrist_roll, mas `gripper`). La representacion de accion es RELATIVE para el brazo (delta respecto al estado actual) y ABSOLUTE para el gripper, con un horizonte de accion de 16 pasos. Las camaras de entrada son `top` (360x640) y `wrist` (480x640) en RGB; la imagen `observation.images.top_depth` no se utiliza.

El entrenamiento uso 6.000 pasos con batch global de 128 (32 x 4 de acumulacion de gradientes), lo que equivale a 768.000 muestras y 5,7 epocas sobre los 133.763 frames. Learning rate de 1e-4 con 5% de warmup, weight decay de 1e-5 y data augmentation de color jitter (brillo 0,3, contraste 0,4, saturacion 0,5, hue 0,08). El muestreo emplea shard size de 1024 y `episode_sampling_rate` de 0,1. El entrenamiento se ejecuto en 1 x H100 80GB durante 9 h 13 min (limitado por el dataloader). La perdida final de entrenamiento fue 0,0148 (media de los pasos 5.760-6.000), con una curva descendente: 0,054 en el paso 500, 0,044 en 1.000, 0,034 en 2.000, 0,022 en 3.000, 0,018 en 4.000, 0,016 en 5.000 y 0,015 en 6.000.

## Capacidades

- Control de robot manipulador SO101 de 6 dimensiones a partir de instrucciones en lenguaje natural e imagenes RGB.
- Multitarea: un unico modelo cubre tres tareas distintas y la instruccion de lenguaje selecciona cual ejecutar.
- Tarea 0: coger el cubo rojo de la olla de acero y colocarlo en el cubo hueco naranja (51 episodios).
- Tarea 1: abrir el cajon superior con el gripper izquierdo, coger el bloque cuadrado rojo, colocarlo dentro del cajon y cerrarlo (57 episodios).
- Tarea 2: abrir el cajon, coger el cubo rojo y apilarlo sobre el cubo azul (51 episodios).
- Prediccion de secuencias de accion con horizonte de 16 pasos y representacion relativa para el brazo y absoluta para el gripper.
- Entrada multimodal: dos vistas de camara (`top` y `wrist`) mas estado de articulaciones y descripcion textual de la tarea.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode; es un modelo especializado en control robotico.

## Casos de uso

- Manipulacion robotica de pick-and-place en laboratorio: el modelo recibe las imagenes de las camaras `top` y `wrist` y la instruccion "Take the red cube out of the steel pot and place it into the orange hollow cube." para generar las acciones del brazo SO101; es adecuado porque esta entrenado especificamente sobre esa tarea y ese embodiment.
- Automatizacion de apertura y cierre de cajones con recogida de objetos: la instruccion de la tarea 1 permite encadenar apertura, pick, colocacion y cierre en una sola politica; util para prototipos de robot domestico o de almacen.
- Apilado de objetos (stacking): la tarea 2 demuestra la capacidad de colocar un cubo sobre otro tras abrir un cajon, un primitivo habitual en tareas de ensamblaje y ordenacion.
- Investigacion en VLA sobre hardware de bajo coste: sirve como referencia reproducible de ajuste fino de GR00T N1.6 sobre el brazo SO101 y el ecosistema LeRobot, con hiperparametros y logs publicados.
- Evaluacion comparativa de politicas: al compartir datos y presupuesto con los checkpoints `gr00t-n1d7-so101-left-arm-task3` y `pi05-so101-left-arm-task3`, permite comparar recetas (GR00T N1.6, GR00T N1.7, pi0.5) sobre el mismo conjunto de tareas.
- Despliegue en tiempo real con servidor GR00T: mediante `run_gr00t_server.py` con `--embodiment-tag NEW_EMBODIMENT`, un cliente puede enviar observaciones y recibir acciones; util para integrar la politica en un bucle de control a 30 fps (con `smooth_step = control_hz / 30` si se interpola).
- Despliegue optimizado con TensorRT: VLA-RT permite servir GR00T N1.6 como motores TensorRT, orientado a reducir latencia en inferencia sobre GPU.

## Benchmarks y rendimiento

Evaluacion open-loop sobre dos trayectorias por tarea (hasta 400 pasos, horizonte de accion 16) contra los datos de entrenamiento. MAE en unidades de accion del dataset:

| Trayectoria | Tarea | MAE (este modelo) | MAE GR00T N1.7 | MAE pi0.5 |
|---|---|---|---|---|
| 0 | 0: cubo rojo, olla -> cubo hueco | 1,242 | 1,406 | 1,286 |
| 25 | 0: cubo rojo, olla -> cubo hueco | 1,476 | 1,542 | 1,690 |
| 51 | 1: cajon + bloque rojo | 1,211 | 1,359 | 1,239 |
| 80 | 1: cajon + bloque rojo | 1,531 | 1,601 | 1,704 |
| 108 | 2: cajon, apilar rojo sobre azul | 1,262 | 1,245 | 1,345 |
| 133 | 2: cajon, apilar rojo sobre azul | 1,347 | 1,486 | 1,488 |
| | **Media** | **1,345** (MSE 5,18) | 1,440 (MSE 5,47) | 1,459 (MSE 5,08) |

Normalizado por la desviacion estandar absoluta de la accion (29,97), el MAE medio representa el 4,49% de la escala de accion en horizonte 16 (GR00T N1.7: 4,80%; pi0.5: 4,87%). N1.6 es el mejor en 5 de las 6 trayectorias; pi0.5 mantiene un MSE ligeramente inferior. El dato de pi0.5 procede del script open-loop propio de openpi. No se han publicado tasas de exito en robot real ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 3,29 mil millones de parametros, los pesos en safetensors ocupan aproximadamente 6,6 GB en fp16/bf16 (repo de 9,8 GB incluyendo otros artefactos); a esto hay que sumar el estado del runtime y las imagenes de entrada.
- Entrenamiento documentado: 1 x NVIDIA H100 de 80 GB durante 9 h 13 min.
- GPU recomendadas: H100 (referencia de entrenamiento); para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado por el autor; por tamano de pesos seria plausible en GPUs con 12-16 GB o mas en bf16, pero no hay dato publicado.
- Opciones de despliegue: servidor Isaac-GR00T (`gr00t/eval/run_gr00t_server.py`, commit `7786639`) con `--embodiment-tag NEW_EMBODIMENT`; VLA-RT para servir como motores TensorRT. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El dato de control es 30 fps en el dataset de entrenamiento; si el cliente interpola entre pasos del modelo debe usar `smooth_step = control_hz / 30`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento open-loop (MAE medio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.6 SO101 task3) | 3.286.608.832 | no disponible | 1,345 (MSE 5,18; 4,49% de escala) | NVIDIA License, no comercial | Hugging Face, 0 descargas |
| `twanghcmut/gr00t-n1d7-so101-left-arm-task3` | no disponible | no disponible | 1,440 (MSE 5,47; 4,80%) | no disponible | Hugging Face |
| `twanghcmut/pi05-so101-left-arm-task3` (pi0.5) | no disponible | no disponible | 1,459 (MSE 5,08; 4,87%) | no disponible | Hugging Face |
| `nvidia/GR00T-N1.6-3B` (modelo base) | ~3B | no disponible | no disponible | NVIDIA License | Hugging Face |

Los tres checkpoints comparados se entrenaron con los mismos datos y presupuesto de muestras, lo que permite una comparacion directa de recetas. La comparativa se limita a la evaluacion open-loop sobre datos de entrenamiento; no hay tasas de exito en robot real para ninguno de ellos en la informacion disponible.

## Limitaciones y advertencias

- No hay split de validacion: los 159 episodios se usaron para entrenamiento, por lo que las metricas open-loop miden ajuste sobre datos de entrenamiento, no generalizacion, y no son una tasa de exito.
- La evaluacion usa solo dos trayectorias por tarea, una muestra muy pequena.
- El checkpoint no se ha ejecutado en el robot real.
- Especializado en un unico embodiment (SO101, brazo izquierdo) y en tres tareas concretas; fuera de ese dominio no hay garantia de comportamiento.
- Las instrucciones deben usarse con la redaccion exacta, incluida la puntuacion final, segun indica el autor.
- No se utiliza la imagen de profundidad `observation.images.top_depth`.
- Licencia NVIDIA: uso limitado a fines no comerciales y obligacion de acompanar el texto de la licencia en la redistribucion.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo de accion, el fallo se manifiesta como acciones incorrectas o inseguras en el robot.
- Idiomas: no se documenta soporte multilingue; las instrucciones de entrenamiento estan en ingles.
- Para despliegue hay que respetar el formato de observacion anidado que espera `Gr00tPolicy` y no usar `--use-sim-policy-wrapper`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-task3
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Checkpoint GR00T N1.7 comparable: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- Checkpoint pi0.5 comparable: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Checkpoint multitarea de 11 tareas: https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-multitask
- VLA-RT (servido con TensorRT): https://github.com/VLAOpt/VLA-RT
