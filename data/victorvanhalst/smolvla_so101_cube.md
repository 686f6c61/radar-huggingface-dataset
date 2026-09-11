# victorvanhalst/smolvla_so101_cube

## Resumen

`victorvanhalst/smolvla_so101_cube` es una politica de robotica entrenada mediante aprendizaje por imitacion para una tarea concreta: coger un cubo rojo y dejarlo en un cuenco. Se trata de un fine-tune del modelo base `lerobot/smolvla_base`, que implementa la arquitectura SmolVLA (vision-language-action) descrita en el paper arXiv:2506.01844. El modelo consume un vector de estado proprioceptivo de 6 dimensiones y tres flujos de imagen de 3x256x256, y produce un vector de accion de 6 dimensiones, es decir, el control de las articulaciones de un brazo SO-101 (tipo `so_follower`).

Con 450.046.176 parametros (~450 M) y un repositorio de 0,9 GB, es un modelo compacto disenado para ejecutarse en hardware de consumo, en contraste con los VLA de escala 3-7 B que dominan buena parte del campo. La relevancia practica esta en que permite reproducir un ciclo completo de robotica con aprendizaje por imitacion (grabacion de datos, entrenamiento, despliegue) con un coste de computo bajo y bajo licencia Apache 2.0.

El modelo fue entrenado con LeRobot 0.6.1 sobre el dataset `victorvanhalst/so101_cube_picking1` (60 episodios, 18.981 fotogramas a 30 FPS), durante 20.000 pasos. Es, por tanto, una politica de tarea unica, no un modelo generalista: su utilidad fuera del escenario entrenado esta por verificar, y el propio autor no ha publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; politica de imitacion con codificador visual, codificador de lenguaje y modulo de generacion de acciones |
| Parametros totales | 450.046.176 (~450 M) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje conversacional; la entrada es un vector de estado de 6 dimensiones mas tres imagenes de 3x256x256) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible; la unica instruccion de tarea documentada esta en ingles ("Pick the red cube and place it in the bowl") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de modelo | politica de robotica (pipeline `robotics`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` (brazo SO-101) |
| Tamano del repositorio | 0,9 GB |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de tipo vision-language-action que combina un modelo compacto de vision-lenguaje con un modulo especifico de accion, de forma que la politica genera comandos motores condicionados simultaneamente por la instruccion de tarea en lenguaje natural y por las observaciones visuales. En este repositorio concreto, la politica mapea una entrada compuesta por el estado articular (vector de 6 componentes) y tres imagenes RGB de 256x256 a un vector de accion de 6 componentes, con una frecuencia de datos de origen de 30 FPS. El paper de referencia (arXiv:2506.01844) describe el metodo completo; los detalles internos exactos (numero de capas, mecanismo de decodificacion de acciones, composicion del corpus de preentrenamiento) no se detallan en la model card y no se reproducen aqui para no introducir datos no verificados.

El entrenamiento es un fine-tune supervisado por imitacion (behavior cloning) desde `lerobot/smolvla_base`, no un ajuste por refuerzo: no hay RLHF ni DPO documentados. La configuracion registrada es de 20.000 pasos, tamano de lote 16, optimizador AdamW con tasa de aprendizaje 1e-4 y semilla 1000. El dataset `victorvanhalst/so101_cube_picking1` contiene 60 episodios y 18.981 fotogramas a 30 FPS de una unica tarea. No se documenta aumento de datos, curriculum ni mezcla con otros datasets, lo que limita la diversidad de la distribucion de entrenamiento.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para un brazo SO-101 tipo `so_follower`, a partir de observaciones visuales y propioceptivas.
- Ejecucion de una tarea de manipulacion concreta condicionada por instruccion textual: "Pick the red cube and place it in the bowl".
- Fusion de tres flujos visuales simultaneos (etiquetados como camera1, camera2 y camera3) con un vector de estado articular de 6 dimensiones.
- Control reactivo en bucle cerrado mediante el comando `lerobot-rollout`, con estrategia `base` y duracion configurable.
- Reentrenamiento y ajuste fino adicionales mediante `lerobot-train`, partiendo del propio modelo o de `lerobot/smolvla_base`.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues ni de comprension general de lenguaje: la unica instruccion documentada esta en ingles.
- No dispone de modo de pensamiento (thinking), vision general, audio ni generacion de texto libre.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o linea de montaje: el modelo ejecuta la secuencia completa de coger un objeto y depositarlo en un recipiente a partir de las camaras, lo que permite integrarlo en una celda robotizada de bajo coste con un SO-101 y una GPU de gama media.
- Clasificacion y ordenacion de piezas en kitting: entrenando variantes sobre el mismo pipeline, la politica puede alimentar estaciones donde un brazo coloca objetos en contenedores identificados por color o posicion, reutilizando la infraestructura de LeRobot.
- Docencia y formacion en robotica e imitacion learning: al ser un modelo de 450 M parametros con licencia Apache 2.0 y un dataset publico de 60 episodios, sirve como ejemplo completo y reproducible del ciclo grabar-entrenar-desplegar en un curso universitario o bootcamp.
- Base para fine-tuning de tareas nuevas: dado que se apoya en `lerobot/smolvla_base`, un equipo puede reutilizar su configuracion de entrenamiento (20.000 pasos, batch 16, AdamW, lr 1e-4) como punto de partida para tareas de agarre con objetos distintos, reduciendo el tiempo de iteracion.
- Baseline de comparacion en investigacion en VLA: permite contrastar un modelo compacto de 450 M parametros contra arquitecturas mayores en tareas de manipulacion, con un coste de reproduccion de resultados bajo.
- Despliegue en el borde (edge): la politica esta pensada para ejecutarse en hardware de consumo, por lo que es candidata a integrarse en un PC con GPU de gama media o en una plataforma tipo Jetson junto al brazo, sin depender de servidores externos.
- Recogida de datos asistida y validacion de hardware: usar el `lerobot-rollout` para verificar la calibracion de camaras y articulaciones de un SO-101 antes de grabar un dataset nuevo, comprobando que las claves de observacion coinciden con las esperadas por la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita de que no se han proporcionado resultados para esta politica, y no hay tabla de exito por tarea ni numero de ensayos. Tampoco se dispone de datos de latencia, throughput ni tasa de exito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,9 GB para los pesos en bfloat16 y 1,8 GB en float32, mas el coste de activaciones del codificador visual al procesar tres imagenes de 256x256 y el estado de la politica. Como orden de magnitud, la inferencia deberia caber con holgura en 2-4 GB de VRAM, aunque no se dispone de una medicion publicada para este repositorio concreto.
- VRAM estimada para reentrenamiento: con AdamW en precision mixta y lote 16, el consumo es sustancialmente mayor que en inferencia (estados del optimizador y activaciones); se situa previsiblemente en la franja de 12-24 GB, pero es una estimacion derivada del numero de parametros, no un dato verificado del autor.
- GPU recomendadas: la model card indica que SmolVLA esta disenado para hardware de consumo. Cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 3060) deberia ser suficiente para inferencia; para reentrenamiento son recomendables RTX 3090/4090 o GPUs de centro de datos (A100, H100) si se busca reducir tiempo de entrenamiento.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del diseno segun el autor; tambien se documenta la posibilidad de despliegue en hardware de gama baja.
- Opciones de despliegue: LeRobot es la via soportada oficialmente, mediante `lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de acciones.
- Latencia y throughput: no disponibles. Como referencia de diseno, los datos se grabaron a 30 FPS, por lo que el bucle de control deberia acercarse a esa frecuencia para reproducir la dinamica observada, pero no se publica ninguna medicion de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| victorvanhalst/smolvla_so101_cube | 450.046.176 | Estado (6,) + 3 imagenes 256x256 | apache-2.0 | HuggingFace, libreria lerobot | Fine-tune de tarea unica sobre SO-101; sin resultados de evaluacion publicados |
| lerobot/smolvla_base | 450 M (mismo orden, segun el modelo del que deriva) | Configuracion equivalente de VLA | no disponible en la informacion proporcionada | HuggingFace | Modelo base preentrenado del que parte este fine-tune; no especializado en la tarea del cubo |
| Otras familias VLA de codigo abierto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Pick the red cube and place it in the bowl") sobre un unico montaje, con un solo tipo de objeto. No debe esperarse generalizacion a otras tareas, objetos o posiciones sin un nuevo ajuste fino.
- Volumen de datos reducido: 60 episodios y 18.981 fotogramas constituyen una base pequena para aprendizaje por imitacion, lo que aumenta el riesgo de sobreajuste a la iluminacion, la posicion del cubo, el fondo y la colocacion exacta de las camaras del montaje original.
- Ausencia de evaluacion: el autor no ha publicado tasa de exito ni numero de ensayos en robot real, por lo que el rendimiento real es desconocido y no puede asumirse ningun nivel de fiabilidad.
- Discrepancia en la configuracion de camaras: la model card declara dos camaras (`wrist` y `external`), mientras que la tabla de entradas define tres flujos visuales (`camera1`, `camera2`, `camera3`). Es necesario verificar esta correspondencia antes del despliegue, ya que los nombres de camara deben coincidir con las claves de observacion usadas en el entrenamiento.
- Dependencia de calibracion: el modelo asume un brazo `so_follower` calibrado y unas camaras con indices y montaje equivalentes a los del dataset. Cambios en la cinematica o en la posicion de las camaras degradan la politica de forma previsible.
- Sin capacidades de lenguaje general: aunque acepta una instruccion de tarea textual, no es un modelo conversacional ni multilingue; no hay evidencia de que responda a instrucciones distintas de la entrenada.
- Riesgo de alucinacion en el sentido de los modelos de lenguaje: no aplica, pero si existe un riesgo equivalente de acciones incorrectas o erraticas ante entradas fuera de distribucion, con consecuencias fisicas sobre el robot y el entorno.
- Seguridad fisica: al tratarse de un modelo que genera comandos motores, es obligatorio operar con parada de emergencia, limites de par y espacios de trabajo delimitados; el modelo no incorpora ninguna capa de seguridad propia.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor recomienda citar el metodo (SmolVLA) y LeRobot al reutilizar la politica.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de redactar esta ficha, lo que implica ausencia de validacion externa por parte de la comunidad.
- Cita incompleta en la model card: el bloque BibTeX de LeRobot aparece truncado en el texto publicado, por lo que conviene consultar la referencia completa en el repositorio de LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/victorvanhalst/smolvla_so101_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/victorvanhalst/so101_cube_picking1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=victorvanhalst/so101_cube_picking1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
