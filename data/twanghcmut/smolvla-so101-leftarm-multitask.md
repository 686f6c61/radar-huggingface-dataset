# twanghcmut/SmolVLA-SO101-LeftArm-Multitask

## Resumen

SmolVLA-SO101-LeftArm-Multitask es un ajuste fino del modelo fundacional de robotica lerobot/smolvla_base, publicado por el usuario twanghcmut, que convierte una politica vision-lenguaje-accion (VLA) generica en un controlador multitarea para el brazo seguidor SO-101. El checkpoint unico cubre 11 tareas de manipulacion de escritorio (recoger cubos, apilar bloques, introducir objetos en un recipiente y cerrar la tapa, ordenar por tamano), y la tarea concreta se selecciona pasando una cadena de instruccion en lenguaje natural como entrada. Con 450.046.176 parametros totales y 0,9 GB de pesos en safetensors, es un modelo lo bastante pequeno para ejecutarse en hardware de consumo.

La relevancia del modelo es doble. Por un lado, demuestra que congelar la torre vision-lenguaje y entrenar unicamente el experto de accion (100M de 450M parametros) reduce el coste de entrenamiento hasta hacerlo viable en una unica rebanada MIG de H100 de 40 GB con batch 128: 4,6 horas para 20.000 pasos sobre 551 episodios. Por otro, sirve como referencia practica de ajuste fino de politicas VLA en el ecosistema LeRobot, con un pipeline reproducible (mapa de renombrado de camaras, chunk de acciones de 50 pasos, datos a 30 fps).

Se distribuye bajo licencia Apache 2.0 y el formato de pesos es safetensors, orientado a inferencia con la libreria lerobot. No se publican datos de generalizacion ni de exito en robot real: las metricas disponibles son de evaluacion en bucle abierto sobre los mismos datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA: torre vision-lenguaje congelada mas experto de accion entrenable |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables en el ajuste | 100M de 450M (freeze_vision_encoder y train_expert_only activados) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye safetensors |
| Idiomas soportados | No disponible; las 11 instrucciones de tarea estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria de despliegue | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | hungho77/so101_left_arm_pick_red_cube_into_pot y la coleccion SO101_LeftArmOnly_Task (551 episodios, 253.745 frames, 11 tareas) |
| Robot objetivo | SO-101, brazo seguidor izquierdo, 5 articulaciones mas pinza |
| Dimension de estado/accion | 6 (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`) |
| Camaras | `top` (360x640) renombrada a `camera1`; `wrist` (480x640) renombrada a `camera2` |
| Chunk de acciones | 50 pasos |
| Frecuencia de control | 30 fps |
| Desviacion estandar absoluta de acciones | 28,67 (media sobre dimensiones) |
| Tamano del repositorio | 0,9 GB |
| Tamano de vision de entrada | 360x640 (`camera1`) y 480x640 (`camera2`) |

## Arquitectura y entrenamiento

El modelo sigue el diseno SmolVLA: un modelo vision-lenguaje que procesa las imagenes de las dos camaras junto con la instruccion de tarea, y un experto de accion que produce un chunk de 50 acciones de 6 dimensiones. Durante el ajuste fino se congelo la torre vision-lenguaje y se entreno unicamente el experto de accion, lo que deja 100M parametros entrenables de los 450M totales. Esta decision es la clave del coste de entrenamiento: al no almacenar activaciones de la torre congelada, el consumo por muestra baja a 0,19 GB, frente a 0,82 GB de X-VLA y aproximadamente 0,36 GB de pi-0.5, segun los datos del autor.

El entrenamiento uso 551 episodios y 253.745 frames repartidos en 11 tareas, con 20.000 pasos de optimizacion, batch de 128 (2,56 millones de muestras, unas 10,1 epocas), learning rate de 1e-4 y el schedule por defecto de lerobot. Se ejecuto en una unica rebanada H100 MIG 3g.40gb (39,5 GiB), con un pico de 27,3 GB, durante 4,6 horas a 0,835 s/paso (153 muestras/s). La perdida final fue de 0,050. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo de politica robotica.

Un detalle operativo del entrenamiento que condiciona la reproducibilidad es el renombrado de camaras: el dataset nombra las camaras `top` y `wrist`, mientras que `smolvla_base` espera `camera1`, `camera2` y `camera3`. El autor aplico el mapeo `observation.images.top` a `observation.images.camera1` y `observation.images.wrist` a `observation.images.camera2`; sin el, lerobot aborta con un error de tipo `Feature mismatch between dataset/environment and policy config`. La inferencia debe aplicar el mismo mapeo.

## Capacidades

- Generacion de acciones de robot de 6 dimensiones (5 articulaciones mas pinza) a partir de dos flujos de imagen y una instruccion textual.
- Multitarea real con un solo checkpoint: las 11 tareas se seleccionan mediante la cadena de instruccion, no cambiando de modelo.
- Prediccion de chunks de 50 acciones, lo que permite ejecutar varios pasos de control por inferencia y amortizar la latencia del modelo.
- Manipulacion de objetos con relaciones espaciales: recoger, colocar dentro de un recipiente, sacar, apilar, ordenar por altura.
- Cierre de tapa tras depositar un objeto (tarea 2), lo que implica una secuencia de varios pasos con la pinza.
- Tarea con criterio relacional sobre el tablero (tarea 8): seleccionar el cubo que iguala el numero de cubos rojos y azules.
- Control a 30 fps, con soporte de interpolacion sub-paso en el cliente (`smooth_step = control_hz / 30`).
- No soporta tool calling ni function calling: no es un LLM de proposito general y su salida son acciones motoras, no texto.
- No dispone de modo de razonamiento explicito (thinking mode), vision generativa, audio ni generacion de texto.
- Capacidad multilingue no disponible: las instrucciones deben pasarse literalmente en ingles.

## Casos de uso

- Manipulacion de escritorio con SO-101 en laboratorio: el modelo ejecuta directamente tareas de pick-and-place sobre cubos, platos y bloques con dos camaras fijas, sin necesidad de planificacion simbolica externa.
- Punto de partida para ajuste fino con datos propios: al estar construido sobre `lerobot/smolvla_base` y usar el pipeline de LeRobot, sirve como plantilla para reentrenar el experto de accion sobre un dataset nuevo de 50 a 500 episodios por tarea.
- Docencia en robotica y aprendizaje por imitacion: permite mostrar de punta a punta la grabacion de demostraciones, el entrenamiento en una GPU modesta y el despliegue en un brazo de bajo coste.
- Evaluacion comparativa de politicas VLA: la tabla de MAE por tarea del autor ofrece una linea base reproducible para comparar variantes de arquitectura, tamaño de dataset o duracion de entrenamiento bajo el mismo protocolo de bucle abierto.
- Automatizacion de clasificacion y apilado en linea de montaje ligera: las tareas 6, 7 y 10 (apilar cubos, ordenar por altura) son representativas de operaciones de ordenacion de piezas pequenas que requieren colocar un objeto sobre otro con precision.
- Sistemas de demostracion en demos y ferias: el modelo cabe en una GPU de consumo y un solo checkpoint cubre 11 comportamientos, lo que simplifica un puesto de demostracion robotica con seleccion de tarea por voz o interfaz grafica.
- Investigacion en transferencia entre morfologias: la dimension de estado/accion es explicitamente de 6 grados de libertad, lo que facilita estudiar que parte del comportamiento se transfiere a otros brazos con la misma cinematica.
- Generacion de trayectorias sinteticas para aumentar datos: el chunk de 50 acciones a 30 fps puede usarse como profesor para preentrenar politicas mas pequenas o para filtrar episodios mal etiquetados.

## Benchmarks y rendimiento

El autor publica una evaluacion en bucle abierto, con una trayectoria por tarea recorrida a saltos de la longitud del chunk y puntuada sobre los primeros 16 de los 50 pasos predichos. Los errores estan en las unidades de accion del dataset.

| Trayectoria | Tarea | MAE |
|---|---|---|
| 0 | Cubo rojo al recipiente | 1,592 |
| 50 | Cubo azul al recipiente | 1,369 |
| 100 | Platano al recipiente y cerrar tapa | 1,905 |
| 150 | Cubo azul junto a cubo azul | 2,430 |
| 200 | Sacar cubo azul del recipiente | 1,854 |
| 251 | Sacar cubo rojo del recipiente | 1,784 |
| 301 | Apilar cubo amarillo sobre naranja | 1,950 |
| 351 | Apilar bloques naranjas | 2,580 |
| 401 | Equilibrar numero de cubos rojos y azules | 1,881 |
| 451 | Cubo rojo al cubo hueco | 1,834 |
| 501 | Cubos azules de menor a mayor | 2,029 |
| | Media | 1,928 |

Dividiendo por la desviacion estandar absoluta de acciones (28,67) se obtiene un 6,72 % de la escala de accion. El autor advierte de dos cuestiones metodologicas: el error crece a lo largo del chunk, de modo que un horizonte de 50 no es comparable con uno de 16; y la puntuacion de solo las tres primeras trayectorias da 5,17 %, cifra que no debe citarse porque esas tareas son las mas faciles. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a un modelo de politica robotica.

## Requisitos de hardware

- Entrenamiento: una unica rebanada H100 MIG 3g.40gb (39,5 GiB) con un pico de 27,3 GB, batch 128 y 4,6 horas de ejecucion. No se documenta entrenamiento en GPU de consumo.
- Inferencia, estimacion a partir del numero de parametros (no publicada por el autor): pesos en bf16 de aproximadamente 0,9 GB, en int8 de unos 0,45 GB y en int4 de unos 0,23 GB. A esa cifra hay que sumar las activaciones de la torre vision-lenguaje, las dos imagenes de entrada (360x640 y 480x640) y el bucle de decodificacion del chunk de 50 pasos.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10, A100). El modelo cabe con holgura en una GPU de consumo de gama media; no se requiere H100 para servir.
- Opciones de despliegue: LeRobot sobre PyTorch es la via documentada, ya que la libreria declarada es `lerobot`. No se documentan exportaciones a vLLM, TGI, Ollama o llama.cpp, que ademas no aplican a un modelo de politica con salida motora continua.
- Latencia y throughput de inferencia: no disponibles. El unico dato de velocidad publicado es de entrenamiento (153 muestras/s, 0,835 s/paso).
- Restriccion de tiempo real: el modelo fue entrenado con datos a 30 fps. El cliente debe derivar el numero de sub-pasos de interpolacion como `control_hz / 30`; reutilizar un valor pensado para un robot de 15 fps estira cada trayectoria un factor 2 y el brazo avanza sin completar la tarea.

## Comparativa con modelos similares

| Modelo | Parametros totales | Memoria de activaciones por muestra (entrenamiento) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA-SO101-LeftArm-Multitask | 450M (100M entrenables) | 0,19 GB | No disponible | Apache 2.0 | HuggingFace, 13 descargas, 0 likes |
| lerobot/smolvla_base | No disponible | No disponible | No disponible | No disponible | HuggingFace (modelo base) |
| X-VLA | No disponible (citado como modelo de 3B en el texto del autor) | 0,82 GB | No disponible | No disponible | No disponible en la informacion proporcionada |
| pi-0.5 | No disponible | ~0,36 GB | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion disponible se limita al consumo de memoria durante el entrenamiento, que es el argumento que el autor utiliza para justificar el ajuste fino de SmolVLA en una GPU de 40 GB con batch 128. No hay datos publicados de precision, tasa de exito ni latencia que permitan comparar capacidades reales entre estos modelos, por lo que la comparativa de rendimiento se considera no disponible.

## Limitaciones y advertencias

- No existe split de validacion: los 551 episodios se usaron para entrenar y las cifras de MAE estan medidas sobre datos de entrenamiento. No miden generalizacion y no son una tasa de exito.
- El rendimiento en robot real no se ha medido. Cualquier despliegue fisico parte de una validacion en simulacion o en bucle abierto, no de evidencia de exito en hardware.
- Tamano de datos reducido: unos 50 episodios por tarea, con posiciones de objeto, iluminacion y montaje de camaras fijados por las demostraciones.
- Instrucciones literales: el modelo solo reconoce las 11 cadenas exactas del `meta/tasks.jsonl`, incluidos los puntos finales inconsistentes. No generaliza a parafrasis ni a reformulaciones en otro idioma.
- Renombrado de camaras obligatorio en inferencia (`top` a `camera1`, `wrist` a `camera2`). Omitirlo provoca el error `Feature mismatch between dataset/environment and policy config`.
- Sincronizacion temporal estricta a 30 fps. Un cliente que no derive `smooth_step = control_hz / 30` produce trayectorias estiradas y brazos que no completan la tarea.
- Alcance mecanico limitado: solo brazo izquierdo, 5 articulaciones mas pinza y cinematica concreta del SO-101. No hay capacidades bimanuales ni soporte para otras morfologias sin reentrenar.
- Riesgo de alucinacion linguistica: no aplica, el modelo no genera texto. El riesgo analogo es la ejecucion de acciones plausibles pero incorrectas, especialmente ante objetos, posiciones o iluminacion fuera de la distribucion de entrenamiento.
- Sesgos heredados de las demostraciones: distribucion de posiciones de objetos, fondo de la mesa, tipo de pinza y estilo de operador. No se documenta ningun analisis de sesgo.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y el fichero de cambios. No se documentan restricciones adicionales ni clausulas de uso responsable.
- Validacion comunitaria muy baja: 13 descargas y 0 likes en el momento de redactar la ficha. No hay revision por pares, informes de terceros ni replicaciones publicadas.
- El modelo base `lerobot/smolvla_base` no incluye informacion de licencia en la informacion proporcionada, por lo que conviene verificar su regimen antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/SmolVLA-SO101-LeftArm-Multitask
- Modelo base SmolVLA de LeRobot: https://huggingface.co/lerobot/smolvla_base
- Dataset de una de las tareas: https://huggingface.co/datasets/hungho77/so101_left_arm_pick_red_cube_into_pot
- Coleccion de datasets SO-101 LeftArmOnly Task: https://huggingface.co/collections/hungho77/so101-leftarmonly-task
