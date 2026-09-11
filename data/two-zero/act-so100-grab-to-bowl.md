# Two-Zero/act-so100-grab-to-bowl

## Resumen

ACT SO-100 Grab-to-Bowl es una politica de manipulacion robotica entrenada con Hugging Face LeRobot sobre un brazo SO-100/SO-101 en configuracion leader-follower. No es un modelo de lenguaje: se trata de un modelo visomotor de tipo ACT (Action Chunking Transformer) que aprende una unica tarea real, "coger el objeto y depositarlo en el cuenco", a partir de demostraciones de teleoperacion. La entrada combina imagen de camara frontal a 640x480 y 30 fps con el estado articular del robot, y la salida es una accion de posicion articular de 6 grados de libertad.

El autor publica el checkpoint final tras 20.000 pasos de entrenamiento, junto con los scripts de recogida de datos, entrenamiento y evaluacion, y un video de evaluacion en robot real. El dataset propio consta de 76 episodios de demostracion, con un bloque adicional de demostraciones especificas para corregir la fase de liberacion del objeto, que en politicas anteriores fallaba. El peso del modelo se distribuye en `model.safetensors` acompanado de ficheros JSON de preprocesado y postprocesado.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de extremo a extremo (hardware, teleoperacion, dataset, entrenamiento, inferencia autonoma) con robotica de bajo coste. Por otro, el autor incluye una comparacion controlada contra Diffusion Policy entrenada sobre el mismo dataset y con los mismos 20.000 pasos: ACT alcanza un 80% de exito en 10 ejecuciones reales, mientras que Diffusion Policy se muestra inestable y no completa la trayectoria de agarre. Ese contraste, aunque con muestra pequena, es un dato empirico util sobre eficiencia de datos en tareas fijas con datasets reales reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) implementada en Hugging Face LeRobot; politica visomotora con codificador de vision y decodificacion de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la observacion es una imagen de 640x480 a 30 fps mas el estado articular, no una ventana de tokens |
| Tipos de cuantizacion | no disponible; se distribuye `model.safetensors` sin indicar precision |
| Idiomas soportados | no aplica (modelo de control robotico sin entrada ni salida de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `train_config.json`, `policy_preprocessor.json` y `policy_postprocessor.json` |
| Tarea | "Grab the object and put it into the bowl" |
| Entradas | imagen de camara frontal (OpenCV indice 0, 640x480, 30 fps) + estado articular del robot |
| Salidas | accion de posicion articular de 6 grados de libertad |
| Pasos de entrenamiento | 20.000 |
| Checkpoint | `act_grab_to_bowl_full76/checkpoints/020000/pretrained_model` |
| Hardware objetivo | SO-100/SO-101 leader-follower con servos Feetech STS3215 (puerto follower `COM9`, leader `COM10`) |
| Tamano del dataset | 76 episodios de demostracion (`local/grab_to_bowl`) |
| Fecha de publicacion | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es una politica ACT, la familia introducida en el trabajo de manipulacion bimanual de bajo coste asociado a ALOHA y adoptada por LeRobot. Se trata de un enfoque de clonacion de comportamiento que, en lugar de predecir una unica accion por paso, genera trozos (chunks) de acciones a partir de la observacion visual y propioceptiva, lo que reduce el error de acumulacion y suaviza la ejecucion en robot real. La model card no detalla hiperparametros concretos de la implementacion, como el tamano del chunk de acciones, las dimensiones del transformador, la resolucion interna del backbone de vision o la presencia y peso del componente CVAE; esos datos figuran como no disponibles en la informacion proporcionada.

El entrenamiento se realizo de forma totalmente supervisada sobre demostraciones de teleoperacion leader-follower, con 76 episodios recogidos por el propio autor. El dataset incluye un conjunto adicional de demostraciones dirigidas especificamente a la fase de liberacion, con la secuencia "move above bowl -> open gripper fully -> pause -> lift empty gripper". Ese refuerzo se anadio despues de observar que politicas previas conseguian agarrar el objeto pero fallaban al soltarlo dentro del cuenco, lo que constituye un ejemplo practico de curacion de datos guiada por el modo de fallo. La observacion se limita a una camara frontal y al estado articular, sin camaras de muneca ni sensores de fuerza. No se documenta uso de RLHF, DPO ni aprendizaje por refuerzo; es clonacion de comportamiento pura.

Como experimento de control, el autor entreno tambien Diffusion Policy sobre los mismos 76 episodios y los mismos 20.000 pasos, con perdida final de entrenamiento entre 0,017 y 0,021. A pesar de esa perdida aparentemente baja, el comportamiento en robot real fue inestable: el gripper mostraba pequenos temblores y no llegaba a ejecutar una trayectoria completa de agarre. La conclusion del autor es que, para un dataset real pequeno y una tarea fija, ACT resulto mas eficiente en datos y mas fiable, y que Diffusion Policy probablemente requiere mas demostraciones, mayor cobertura de tareas y trayectorias estado-accion mas consistentes.

## Capacidades

- Ejecucion autonoma de una tarea de manipulacion pick-and-place: localizar el objeto, agarrarlo, desplazarlo hasta el cuenco y soltarlo dentro.
- Control visomotor continuo a partir de imagen RGB de 640x480 a 30 fps combinada con el estado articular del robot.
- Prediccion de acciones de posicion articular de 6 grados de libertad, adecuadas para el espacio de control del SO-100/SO-101.
- Reproduccion de trayectorias aprendidas por imitacion, incluyendo la fase critica de apertura de gripper y liberacion del objeto.
- Inferencia autonoma en robot fisico tras el entrenamiento, sin teleoperacion en tiempo de ejecucion.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, audio ni modo de pensamiento.
- No dispone de soporte multilingue, al no procesar lenguaje natural.
- El repositorio incluye scripts propios de recogida de datos (`record_data.py`), entrenamiento (`train_act.py`) y evaluacion (`eval_model.py`), lo que habilita reentrenamiento y ampliacion del dataset.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta el ciclo completo de agarre y deposito en un cuenco sobre un brazo SO-100/SO-101, con un 80% de exito medido en 10 ejecuciones reales, suficiente para tareas de prototipado y validacion de concepto.
- Plataforma docente de robotica de bajo coste: el conjunto hardware mas dataset mas scripts permite montar un curso practico de imitacion y control visomotor, con la teleoperacion leader-follower como metodo de captura de datos.
- Baseline reproducible para investigacion en clonacion de comportamiento: el checkpoint de 20.000 pasos y el dataset de 76 episodios sirven como referencia para comparar tecnicas alternativas bajo las mismas condiciones de datos y hardware.
- Comparacion empirica ACT frente a Diffusion Policy: el repositorio documenta el mismo protocolo de entrenamiento aplicado a ambas politicas y el comportamiento divergente en robot real, lo que resulta util para decidir que familia de politica emplear cuando el dataset es pequeno.
- Ampliacion iterativa del dataset con `record_data.py`: se pueden grabar episodios adicionales por teleoperacion y reentrenar para cubrir nuevos objetos, posiciones iniciales o variaciones de la tarea, siguiendo la misma estrategia que el autor uso para corregir la fase de liberacion.
- Correccion de modos de fallo concretos mediante datos dirigidos: el bloque adicional de demostraciones enfocado en "abrir gripper completamente, pausar y levantar" es un patron reutilizable cuando una politica dominada falla en una subtarea especifica.
- Integracion en un pipeline de investigacion con LeRobot: el formato de pesos safetensors mas los JSON de preprocesado y postprocesado facilitan cargar la politica en el ecosistema LeRobot y desplegarla con los scripts incluidos.
- Evaluacion de robustez frente a perturbaciones iniciales: al documentarse que el modo de fallo principal es desplazar el objeto fuera de la region de entrenamiento, el modelo sirve para estudiar limites de generalizacion espacial en politicas de imitacion.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible: evaluacion en robot real de 10 ejecuciones, con 8 exitosas.

| Metrica | ACT (este modelo) | Diffusion Policy (mismo dataset) |
|---|---|---|
| Pasos de entrenamiento | 20.000 | 20.000 |
| Perdida final de entrenamiento | no disponible | aprox. 0,017 a 0,021 |
| Ejecuciones en robot real | 10 | no disponible |
| Ejecuciones exitosas | 8 | no disponible |
| Tasa de exito | 80% | no completada; comportamiento inestable |
| Comportamiento observado | tarea completada de forma autonoma en 8 de 10 casos | temblores del gripper y ausencia de trayectoria completa de agarre |

Modo de fallo documentado: en los dos casos fallidos, el primer intento de agarre no alcanzo el objeto y lo empujo fuera de la region de inicio entrenada; la politica siguio intentando agarrar, pero el objeto ya estaba fuera de la distribucion de entrenamiento y la ejecucion termino por agotamiento de tiempo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- Robot: SO-100/SO-101 leader-follower con servos Feetech STS3215 en bus serie; puerto del follower `COM9`, puerto del leader `COM10`.
- Camara: una camara OpenCV (indice 0) a 640x480 y 30 fps para la observacion frontal.
- VRAM para inferencia: no publicada por el autor. Una politica ACT es un modelo relativamente pequeno dentro del espectro de modelos de robotica, por lo que la inferencia cabria en GPU de consumo (gama RTX 3060/4060 o superior) con margen amplio; esta estimacion es orientativa y no esta confirmada en la informacion disponible.
- GPU profesionales: H100, A100 o L40S son sobredimensionadas para inferencia de una sola politica ACT y solo tendrian sentido para entrenamiento por lotes o para servir varias politicas en paralelo.
- Idoneidad en GPU de consumo: probable segun el tamano tipico de estas politicas, sujeto a confirmacion con los pesos reales, cuyo numero de parametros no esta publicado.
- Ejecucion en CPU: viable en principio para politicas ACT pequenas, con mayor latencia por paso de control; no hay mediciones publicadas para este checkpoint.
- Opciones de despliegue: el ecosistema Hugging Face LeRobot con los scripts incluidos (`eval_model.py`), o carga directa de `model.safetensors` con la configuracion y los procesadores de normalizacion publicados. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo, al no ser un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles. El sistema opera a 30 fps en captura, pero no se documentan los tiempos de inferencia de la politica ni la frecuencia efectiva de control en robot real.
- Almacenamiento: el repositorio incluye pesos, video de demostracion y scripts; el tamano total no esta indicado. Destaca que el entrenamiento completo se realizo con 20.000 pasos sobre un dataset de 76 episodios, una carga de computo moderada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tasa de exito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT SO-100 Grab-to-Bowl (este modelo) | no disponible | imagen 640x480 a 30 fps + estado articular | 80% en 10 ejecuciones reales | no disponible | Hugging Face, 0 descargas, 0 likes |
| Diffusion Policy (entrenada por el autor sobre los mismos 76 episodios) | no disponible | mismas observaciones y mismo dataset | no completada; inestable, con temblores del gripper | no disponible | no publicada como modelo independiente en la informacion disponible |
| Politicas VLA preentrenadas del ecosistema LeRobot (pi0, SmolVLA y similares) | no disponible | habitualmente imagen y estado, con instrucciones en lenguaje natural | no disponible para esta tarea | no disponible | no disponible |

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre modelos comparables en la misma tarea; los unicos datos de comparacion son los que aporta la propia model card.

## Limitaciones y advertencias

- Dataset muy pequeno: 76 episodios de demostracion para una unica tarea, lo que limita la generalizacion a objetos, posiciones iniciales, iluminaciones y configuraciones de camara distintas.
- Modo de fallo conocido: si el primer agarre falla y desplaza el objeto fuera de la region de inicio entrenada, la politica no se recupera, sigue intentando agarrar y la ejecucion termina por agotamiento de tiempo.
- Evaluacion estadisticamente debil: 8 exitos sobre 10 ejecuciones deja un intervalo de confianza amplio; la tasa real de exito puede diferir notablemente de ese 80%.
- Acoplamiento fuerte al hardware: el comportamiento esta entrenado para el SO-100/SO-101 con servos STS3215, puertos `COM9` y `COM10` y camara OpenCV en el indice 0 a 640x480 y 30 fps. Cambiar cualquiera de esos elementos puede degradar el rendimiento sin reentrenamiento.
- Sin licencia declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Cualquier uso en produccion requeriria contactar con el autor.
- Sin informacion sobre sesgos: no aplica el concepto de sesgo linguistico, pero si existe un sesgo de distribucion hacia las condiciones exactas de recogida de datos.
- Riesgo de sobreajuste a la tarea: al estar entrenado para una sola tarea, no se puede reutilizar directamente para otras tareas de manipulacion sin reentrenamiento o ajuste fino con nuevas demostraciones.
- Ausencia de benchmarks estandar: no hay resultados comparables con la literatura, y la comparacion con Diffusion Policy es interna, con un unico dataset y una unica configuracion.
- Uso en produccion no recomendado con el estado actual del repositorio: 0 descargas y 0 likes, sin pipeline declarado, sin licencia y con evaluacion limitada a 10 ensayos.
- No incorpora seguridad fisica: la politica no incluye capa de supervision, parada de emergencia ni deteccion de colisiones; en un robot real estas funciones deben implementarse externamente.
- Contenido incompleto: el autor indica que los tutoriales seguidos durante el desarrollo no estan incluidos en el repositorio, lo que dificulta la reproduccion exacta del flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Two-Zero/act-so100-grab-to-bowl
- Repositorio de Hugging Face LeRobot (framework citado en la model card): https://github.com/huggingface/lerobot
- Proyecto SO-ARM100 / SO-100 / SO-101 (hardware del brazo): https://github.com/TheRobotStudio/SO-ARM100
- Articulo de ACT y ALOHA, base de la familia de politicas empleada: https://arxiv.org/abs/2304.13705
- Articulo de Diffusion Policy, usado como comparacion por el autor: https://arxiv.org/abs/2303.04137
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian a definiciones y traducciones de la palabra "two" y no aportan informacion tecnica.
