# tsangb34/molmoact2-so101-soccer-red_bowl-40episodes

## Resumen

MolmoAct2-so101-soccer-red_bowl-40episodes es una politica robotica entrenada mediante aprendizaje por imitacion y publicada por el usuario tsangb34 en Hugging Face. Se trata de un ajuste del modelo fundacional MolmoAct2 de Allen Institute for AI (Ai2), un modelo de vision-lenguaje-accion (VLA) que transforma imagenes de camara e instrucciones en lenguaje natural en bloques de acciones ("action chunks") para un brazo robotico. El entrenamiento se ha realizado con LeRobot sobre un robot SO-101 (`so_follower`) equipado con dos camaras: una frontal y otra montada en la muneca.

La politica resuelve una unica tarea: recoger un pequeno balon de futbol de juguete y depositarlo en un cuenco rojo. El conjunto de datos empleado contiene 40 episodios y 14.729 fotogramas a 30 FPS, y el entrenamiento se ejecuto durante 921 pasos con tamano de lote 16. Se trata, por tanto, de una politica especializada, no de un modelo generalista multiuso.

Su interes practico esta en demostrar el flujo completo de LeRobot para ajustar un VLA de aproximadamente 5,44 mil millones de parametros sobre un brazo de bajo coste, y en servir como punto de partida reproducible para replicar el pipeline con datos propios. El repositorio no incluye resultados de evaluacion en robot real ni metricas de exito, por lo que su rendimiento efectivo no puede verificarse con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); componentes internos no disponibles |
| Parametros totales | 5.442.196.272 (aprox. 5,44 B), segun los pesos en safetensors |
| Parametros activos | No aplica (no se indica que sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan variantes cuantizadas; pesos publicados en safetensors (precision no declarada) |
| Idiomas soportados | No disponible (la instruccion de tarea del ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras de entrada | `front`, `wrist` |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes (40 episodios, 14.729 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 921 (lote 16, AdamW, lr 1e-05, semilla 1000, LeRobot 0.6.1) |
| Tamano del repositorio | 10,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe MolmoAct2 como un modelo fundacional abierto de robotica de Ai2 que mapea imagenes de camara e instrucciones en lenguaje a bloques de acciones. No se detallan en la model card la arquitectura interna del backbone, el numero de tokens de entrenamiento ni la composicion del dataset del modelo base. La implementacion utilizada es la de LeRobot, que permite entrenar y evaluar el modelo MolmoAct2 estandar.

El ajuste de esta politica concreta se realizo mediante aprendizaje por imitacion supervisado (behavioral cloning) sobre el dataset indicado: 40 episodios y 14.729 fotogramas grabados a 30 FPS, con una unica tarea definida como "Pick up the small soccer ball toy and place it in the red bowl". La configuracion de entrenamiento registrada es de 921 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, sobre LeRobot 0.6.1. No se menciona el uso de RLHF, DPO ni ninguna otra etapa de alineacion o refuerzo, ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion) en la informacion proporcionada.

## Capacidades

- Generacion de acciones motoras condicionadas por lenguaje: dado un estado de 6 dimensiones y dos vistas de camara de 480x640, produce un vector de accion de 6 dimensiones.
- Percepcion multimodal con dos camaras simultaneas (frontal y de muneca), lo que ayuda a manejar oclusiones parciales durante la manipulacion.
- Ejecucion de una tarea de pick-and-place concreta: recoger un balon de futbol de juguete y colocarlo en un cuenco rojo.
- Integracion con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecucion en robot con `lerobot-rollout`.
- Reentrenamiento y ajuste fino sobre datasets propios en formato LeRobot con `--policy.type=molmoact2`.
- No dispone de tool calling ni function calling: es una politica robotica, no un modelo de lenguaje para agentes.
- No hay soporte documentado de agentes, razonamiento multi-paso, generacion de codigo, matematicas ni modo de pensamiento.
- No hay informacion sobre capacidades multilingues ni sobre idiomas distintos del de la instruccion de tarea.
- No se documentan capacidades de vision mas alla del uso de las imagenes como entrada de observacion del robot.

## Casos de uso

- Recogida y deposito de objetos por color: es exactamente la tarea entrenada; el modelo puede desplegarse en un SO-101 para recoger el balon de juguete y dejarlo en el cuenco rojo con dos vistas de camara.
- Automatizacion de kitting en linea de montaje: el mismo esquema de pick-and-place se aplica a piezas pequenas que deben ir a un contenedor concreto, siempre que se reentrene con datos de la nueva pieza y posicion.
- Separacion de residuos o muestras en laboratorio: con un ajuste fino sobre episodios propios, la politica puede trasladar objetos pequenos de una bandeja a un recipiente designado.
- Base para transferencia a tareas propias: al ser un ajuste de un modelo fundacional, sirve como punto de partida para fine-tuning con `lerobot-train` en nuevos datasets, reduciendo el numero de episodios necesarios frente a entrenar desde cero.
- Evaluacion interna del stack de robotica: permite validar de extremo a extremo la instalacion de LeRobot, la calibracion del SO-101, la captura de dos camaras a 30 FPS y el bucle de inferencia en hardware real.
- Docencia y divulgacion: util para demostrar en un brazo de bajo coste como un VLA de ~5,44 B de parametros ejecuta una tarea condicionada por lenguaje.
- Reproducibilidad de experimentos: al publicarse la semilla (1000), el numero de pasos y la configuracion completa, permite replicar el entrenamiento y comparar variantes (numero de episodios, tasa de aprendizaje) bajo condiciones controladas.
- Manipulacion con oclusion: en celdas donde la camara frontal pierde el objeto, la vista de muneca aporta informacion complementaria, lo que resulta util en recogida de piezas en espacios reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: "No evaluation results have been provided for this policy yet". No existen, por tanto, tasas de exito en robot real, numero de ensayos ni metricas comparables con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 11 GB solo para pesos (5,44 B de parametros), mas el coste de activaciones y cache de atencion para dos imagenes de 480x640; en la practica se recomienda contar con 14-16 GB o mas. Estimacion propia a partir del recuento de parametros y del tamano del repositorio (10,9 GB), no un dato publicado por el autor.
- GPU recomendadas (estimacion): NVIDIA A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB) sin problema de espacio; RTX 4080 y RTX 4060 Ti de 16 GB quedan en el limite.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas, siempre que la precision de los pesos sea de 16 bits; en 8 GB no cabe sin cuantizacion, y no se documentan pesos cuantizados.
- Despliegue: el soporte oficial es a traves de LeRobot (`lerobot-rollout` para ejecutar la politica y `lerobot-train` para reentrenar) sobre PyTorch. No se indica compatibilidad con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje y no al bucle de control de un robot.
- Latencia y throughput: no disponibles. Como referencia de requisito, el dataset esta grabado a 30 FPS, lo que implica que el ciclo completo de inferencia deberia mantenerse por debajo de los 33 ms por paso para no ralentizar la politica en robot.
- Requisitos adicionales de robot: brazo SO-101 (`so_follower`), dos camaras configuradas con los nombres `front` y `wrist` y capturando a 640x480 y 30 FPS, y calibracion previa del robot.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, parametros, contexto ni licencia de modelos alternativos, por lo que la comparacion se limita a la categoria funcional. Los modelos de la misma familia (VLA para manipulacion robotica) que suelen considerarse alternativas son OpenVLA, SmolVLA, pi0 y NVIDIA GR00T N1.

| Modelo | Desarrollador | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MolmoAct2-so101-soccer-red_bowl-40episodes | tsangb34 (sobre MolmoAct2 de Ai2) | VLA de imitacion, tarea unica | 5,44 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| OpenVLA | Comunidad de investigacion | VLA de imitacion | No disponible | No disponible | No disponible | No disponible |
| SmolVLA | Hugging Face | VLA de imitacion, orientado a bajo coste | No disponible | No disponible | No disponible | No disponible |
| pi0 | Physical Intelligence | VLA de imitacion | No disponible | No disponible | No disponible | No disponible |
| NVIDIA GR00T N1 | NVIDIA | VLA de imitacion | No disponible | No disponible | No disponible | No disponible |

No se dispone de cifras verificables para establecer una comparacion cuantitativa de rendimiento entre estas alternativas con la informacion facilitada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se ha entrenado sobre una unica tarea y 40 episodios, por lo que su generalizacion a otros objetos, posiciones, iluminacion o entornos distintos del dataset original no esta garantizada.
- Ausencia de evaluacion: no hay tasa de exito, numero de ensayos ni resultados en robot real. Adoptarlo en produccion sin una evaluacion propia previa es arriesgado.
- Volumen de datos reducido: 921 pasos de entrenamiento y 14.729 fotogramas son cifras bajas, lo que aumenta la sensibilidad al sobreajuste al entorno de grabacion.
- Riesgo de fallo silencioso: al ser una politica de imitacion, ante una observacion fuera de distribucion puede generar acciones incorrectas sin ninguna senal de incertidumbre.
- Dependencia de la configuracion fisica: los nombres de camara (`front`, `wrist`), la calibracion del brazo y la tasa de 30 FPS deben coincidir con los del entrenamiento, o el modelo no funcionara correctamente.
- Idioma: no se especifican idiomas soportados; la instruccion de tarea registrada esta en ingles y no hay evidencia de que el modelo responda a instrucciones en castellano.
- Sin informacion sobre sesgos: no hay documentacion sobre sesgos de datos ni sobre el efecto de variables como el color o el tipo de objeto en el comportamiento de la politica.
- Licencia: la model card declara Apache 2.0 para esta politica, lo que permite uso comercial. Al derivar de MolmoAct2 de Ai2, conviene verificar de forma independiente la licencia y las condiciones de los pesos del modelo base antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 interacciones, esta etiquetado como `region: us` y es un artefacto de investigacion, sin mantenimiento ni soporte documentado.
- Sin compatibilidad con herramientas de agentes: no admite tool calling, function calling ni razonamiento multi-paso, por lo que no debe integrarse como componente de agentes de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/molmoact2-so101-soccer-red_bowl-40episodes
- Dataset de entrenamiento: https://huggingface.co/datasets/tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tsangb34/robocolosseum-so101-soccer-red_bowl-40episodes
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
