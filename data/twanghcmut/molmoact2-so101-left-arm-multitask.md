# twanghcmut/molmoact2-so101-left-arm-multitask

## Resumen

MolmoAct2 SO101 Left Arm es un checkpoint de politica robotica vision-lenguaje-accion (VLA) derivado de allenai/MolmoAct2-SO100_101 mediante ajuste fino completo (full finetune). Lo publica el usuario twanghcmut y cubre 11 tareas de manipulacion con un unico brazo robotico SO101 (lado izquierdo, 5 articulaciones mas pinza) a partir de instrucciones en lenguaje natural. El checkpoint integra en un solo modelo los 11 conjuntos de datos de la coleccion SO101_LeftArmOnly_Task, que suman 551 episodios y 253.745 fotogramas.

Se trata de un modelo denso de 5.442.196.272 parametros (unos 5,44 mil millones), con un backbone de tipo VLM mas un experto de accion entrenado con flow matching, y un espacio de accion de 6 dimensiones (cinco articulaciones mas pinza) expresado como objetivos articulares absolutos en bloques de 30 pasos. El interes practico esta en que un solo policy cubre 11 comportamientos distintos y la instruccion de texto selecciona cual se ejecuta, lo que evita mantener 11 checkpoints separados sobre el mismo brazo.

Es relevante ahora porque comparte exactamente los mismos datos y presupuesto de muestras (768k) que otros dos checkpoints del mismo autor basados en pi0.5 y GR00T N1.7, lo que permite comparar arquitecturas de politica VLA sobre un mismo banco de tareas de robotica de bajo coste. No es un modelo de generacion de texto: es un modulo de control para manipulacion robotica y no se han publicado resultados de benchmarks completos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): VLM transformer con experto de accion entrenado con flow matching; detalle exacto del backbone no disponible en la model card |
| Parametros totales | 5.442.196.272 (aproximadamente 5,44 mil millones); 5,05 mil millones entrenables en el ajuste fino |
| Longitud de contexto | no disponible; ventana de accion de 30 pasos (n_action_steps=30) por chunk |
| Tipos de cuantizacion | no disponible; pesos en bfloat16, no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | instrucciones en ingles unicamente, y solo las 11 frases exactas de entrenamiento (no entrenado con parafrasis) |
| Licencia | no disponible en el repositorio; es un derivado de allenai/MolmoAct2-SO100_101 y se aplican los terminos de ese modelo base |
| Formato de pesos | safetensors (checkpoint de politica LeRobot), repositorio de 12,0 GB |

## Arquitectura y entrenamiento

El modelo parte de allenai/MolmoAct2-SO100_101 y se ajusta por completo con `train_mode_vlm=fft`, dejando los embeddings congelados: 5,05 mil millones de parametros entrenables. La politica combina un backbone de vision-lenguaje (VLM) con un experto de accion que genera las trayectorias mediante flow matching, con 8 pasos de flujo por muestra y aislamiento de conocimiento (knowledge insulation) desactivado. Las entradas son dos camaras (`observation.images.top` a 360x640 y `observation.images.wrist` a 480x640), el estado articular (6 dimensiones en unidades crudas) y una instruccion de texto; la salida es un chunk de 30 acciones de 6 dimensiones en forma de objetivos articulares absolutos.

El entrenamiento se realizo sobre los 11 datasets de la coleccion SO101_LeftArmOnly_Task fusionados en un unico conjunto multitarea: 551 episodios y 253.745 fotogramas, con 24.000 pasos, batch de 32 y un presupuesto de 768k muestras (3,0 epocas). Se uso AdamW (0.9, 0.95) con weight decay 0, learning rate coseno con 200 pasos de calentamiento, pico de 1e-5 para el VLM y 5e-5 para el experto de accion, decaimiento hasta 1e-6 y recorte de gradiente por grupo de 1.0. La aumentacion se limito a RandomRotation de mas-menos 5 grados y ColorJitter, descartando RandomResizedCrop cuadrado porque los fotogramas son 16:9 y 4:3. Se entreno en bfloat16 con gradient checkpointing y `torch.compile` sobre una sola H100 de 80 GB, con un pico de 55,6 GB y 24,3 horas a 3,6 s por paso. La normalizacion usa los cuantiles q01/q99 propios de este conjunto de datos (estado, accion y pinza); no se emplean `joint_signs` ni `joint_offsets`.

## Capacidades

- Manipulacion robotica multitarea con un unico brazo SO101 izquierdo (5 articulaciones mas pinza) a 30 fps.
- Seleccion de comportamiento por instruccion de lenguaje: un solo checkpoint cubre las 11 tareas y el texto determina cual se ejecuta.
- Tareas de pick and place: coger el cubo rojo o azul y depositarlo en la olla de acero, o dejarlo junto a otro cubo.
- Tareas de apilado: apilar el cubo amarillo sobre el naranja, apilar bloques naranjas y ordenar cubos por altura.
- Manipulacion con recipientes: sacar cubos de la olla, meter el cubo rojo en un cubo hueco naranja y colocarlo despues en el tablero.
- Razonamiento visual sencillo guiado: tarea de equilibrio en la que debe elegir el cubo que iguala el numero de cubos rojos y azules en el tablero y colocarlo en la esquina vacia.
- Control de pinza con cierre de tapa (tarea de la banana con cierre de la olla).
- Generacion de trayectorias en forma de chunk de 30 acciones absolutas, reutilizables paso a paso mediante `policy.select_action`.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto: es exclusivamente una politica de control motor.

## Casos de uso

- Pick and place industrial de piezas pequenas: el modelo recibe imagenes cenital y de muneca y devuelve objetivos articulares absolutos, por lo que puede integrarse en una celda con brazo SO101 para mover cubos o piezas de una posicion a otra a 30 Hz.
- Clasificacion y ordenacion por atributos: la tarea 10 ordena cubos azules de menor a mayor altura, lo que sirve como base para lineas de clasificacion donde el criterio venga dado por la instruccion de texto.
- Apilado y paletizado ligero: las tareas 6 y 7 apilan cubos y bloques, utiles para validar estrategias de apilado estable con un solo brazo antes de escalar a configuraciones multi-brazo.
- Manipulacion dentro de contenedores: las tareas 0 a 5 requieren insertar y extraer objetos de una olla de acero, un caso representativo de carga y descarga de bandejas o cajas en logistica de piezas.
- Investigacion en aprendizaje por imitacion: al compartir datos y presupuesto de muestras (768k) con los checkpoints de pi0.5 y GR00T N1.7 del mismo autor, sirve como banco de comparacion reproducible entre arquitecturas VLA.
- Prototipado de politicas con instrucciones en lenguaje: permite demostrar el control de 11 comportamientos distintos cambiando solo la frase de entrada, sin reentrenar ni recargar pesos.
- Manipulacion guiada por razonamiento visual elemental: la tarea 8 exige contar cubos rojos y azules en el tablero y elegir el que equilibra la cuenta, util para estudiar hasta donde llega el componente VLM en tareas de decision.
- Validacion de hardware y calibracion: al usar objetivos articulares absolutos y normalizacion por cuantiles del propio conjunto, el checkpoint sirve para verificar que la cadena de preprocesado de LeRobot (q01/q99, resoluciones de camara y unidades articulares) esta correctamente configurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La model card incluye una tabla de evaluacion en lazo abierto (MAE a horizonte 16 comparada con pi0.5 y GR00T N1.7, 400 fotogramas por trayectoria), pero el contenido disponible esta truncado y no permite extraer cifras utilizables.

El unico dato cuantitativo completo es la evolucion de la perdida de entrenamiento (flow matching), que si se reproduce:

| Paso | Perdida |
|---|---|
| 2.000 | 0,019 |
| 4.000 | 0,015 |
| 8.000 | 0,009 |
| 12.000 | 0,007 |
| 16.000 | 0,005 |
| 20.000 | 0,004 |
| 24.000 | 0,004 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 10,9 GB (5,44 mil millones de parametros). Con el preprocesado de dos camaras (360x640 y 480x640) y el calculo del chunk de 30 acciones, una estimacion prudente es de 12 a 18 GB en bfloat16.
- GPU recomendadas para entrenamiento: una H100 de 80 GB fue suficiente para el ajuste fino completo, con un pico medido de 55,6 GB. Un ajuste fino completo similar requeriria al menos una A100 de 80 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 4090 o RTX 3090 en bfloat16 para inferencia. En tarjetas de 16 GB el margen es ajustado y probablemente exija reducir resolucion de imagen o precision.
- Opciones de despliegue: la via documentada es LeRobot en Python, cargando `MolmoAct2Policy.from_pretrained` junto con `make_pre_post_processors` de `lerobot.policies.factory`. No se documentan soportes para llama.cpp, Ollama, TGI ni vLLM, que no aplican a un checkpoint de politica de accion.
- Aceleracion: la model card indica que el entrenamiento uso `torch.compile`; no hay datos publicados de latencia ni de throughput de inferencia.
- Restriccion temporal relevante: el chunk de 30 acciones se ejecuta a 30 fps, es decir, 1 segundo de movimiento por inferencia; para un control fluido conviene que la inferencia completa quede por debajo de ese segundo o bien solapar chunks mediante la cola de acciones.
- El repositorio ocupa 12,0 GB, por lo que hay que prever ese espacio en disco ademas de la VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Datos / presupuesto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| twanghcmut/molmoact2-so101-left-arm-multitask | 5.442.196.272 | 11 tareas, 551 episodios, 253.745 fotogramas, 768k muestras | 2 camaras + estado 6D + texto | derivada de allenai/MolmoAct2-SO100_101 | publico en HuggingFace, 0 descargas |
| twanghcmut/pi05-so101-left-arm-multitask | no disponible | mismos datos y mismo presupuesto de 768k muestras | no disponible | no disponible | publico en HuggingFace |
| twanghcmut/gr00t-n1d7-so101-left-arm-multitask | no disponible | mismos datos y mismo presupuesto de 768k muestras | no disponible | no disponible | publico en HuggingFace |
| allenai/MolmoAct2-SO100_101 | no disponible | mezcla de preentrenamiento SO100/101; calibracion distinta | no disponible | terminos del modelo base | publico en HuggingFace |

La comparacion directa de rendimiento entre los tres checkpoints hermanos no puede hacerse con los datos disponibles: la tabla de evaluacion en lazo abierto esta truncada.

## Limitaciones y advertencias

- El modelo no ha sido entrenado con parafrasis. Solo responde a las 11 instrucciones exactas de la model card, incluida la puntuacion final, que ademas es inconsistente entre tareas (algunas acaban en punto y otras no).
- Los resultados dependen criticamente de la cadena de normalizacion: hay que usar los cuantiles q01/q99 propios de este conjunto de datos, guardados en los ficheros de pre y posprocesado. La calibracion de este conjunto difiere de la mezcla de preentrenamiento SO100/101 del modelo base (por ejemplo, la media de `shoulder_lift` es -25,6), y ese desajuste solo queda absorbido por la normalizacion por cuantiles.
- No se usan `joint_signs` ni `joint_offsets`, y las transformaciones del port de LeRobot se aplican solo al estado, no a los objetivos de accion de entrenamiento: replicar el setup fuera de LeRobot puede introducir errores sistematicos.
- Datos de entrenamiento muy reducidos: 50 episodios por tarea (51 en una), lo que favorece el sobreajuste a la escena concreta, a los colores de los cubos y al utillaje especifico (olla de acero, tablero de madera, cubo hueco naranja).
- El modelo solo controla un brazo SO101 izquierdo con 5 articulaciones mas pinza. No hay soporte para configuraciones bimanuales, otras morfologias ni espacio de accion en velocidad o par.
- Entrada multimodal fija: dos camaras con resoluciones concretas (360x640 cenital y 480x640 de muneca). Cambiar numero, posicion o resolucion de camaras degrada el comportamiento y no esta soportado por los datos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y por tanto no tiene sentido hablar de alucinacion textual. Su modo de fallo es el error acumulado de control, la perdida de agarre o la colision, sin ninguna capa de seguridad ni planificacion consciente del entorno.
- Ausencia de datos de licencia en el repositorio. Al ser un derivado de allenai/MolmoAct2-SO100_101, hay que revisar y respetar los terminos de ese modelo base antes de cualquier uso comercial; la model card remite explicitamente a ellos.
- No hay benchmarks completos publicados ni datos de latencia, throughput o tasa de exito en el robot real, por lo que no se puede estimar fiabilidad en produccion con la informacion disponible.
- El repositorio no tiene descargas ni valoraciones, y las fechas de creacion y actualizacion son del 12 de octubre de 2026, con dos minutos de diferencia entre ambas: no hay historial de mantenimiento ni validacion por terceros.
- Los resultados de la busqueda web realizada no aportan ninguna fuente tecnica relevante sobre este modelo; el material encontrado es contenido no relacionado y no se ha utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/molmoact2-so101-left-arm-multitask
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Checkpoint hermano basado en pi0.5: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Checkpoint hermano basado en GR00T N1.7: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-multitask
- Coleccion de datasets SO101_LeftArmOnly_Task: https://huggingface.co/collections/hungho77/so101-leftarmonly-task
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.
