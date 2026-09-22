# sovrasov/act_policy_black_cubes

## Resumen

`act_policy_black_cubes` es una politica de imitacion (imitation learning) para robotica real, publicada por el usuario sovrasov en HuggingFace Hub y entrenada con LeRobot. Implementa el metodo ACT (Action Chunking with Transformers, arXiv:2304.13705), que en lugar de predecir una unica accion por paso predice un bloque corto de acciones futuras (action chunking) a partir de observaciones visuales y de estado. El modelo resuelve una tarea concreta de manipulacion: recoger un cubo negro y depositarlo en un contenedor de carton.

Arquitectonicamente es un transformer encoder-decoder con componente CVAE, con 51.668.614 parametros reales en safetensors (unos 51,7 millones) y un repositorio de 0,2 GB. No es un modelo de lenguaje: consume dos flujos de imagen RGB de 480x640 (camaras `top` y `wrist`) mas un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. Su relevancia es la de un ejemplo reproducible y ligero de politica visomotora entrenada de extremo a extremo con el stack de LeRobot, util como punto de partida para fine-tuning, comparacion de metodos de imitacion y despliegue en robots de bajo coste.

El modelo se distribuye bajo licencia Apache 2.0, no tiene resultados de evaluacion publicados en su model card y fue entrenado con 42 episodios (16.962 fotogramas a 30 FPS) de teleoperacion. Al estar ligado a un robot de tipo `PhysicalAIRobot` y a una nomenclatura de camaras concreta, su uso directo fuera de esa configuracion requiere reentrenamiento o adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (metodo ACT, action chunking) |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica como contexto de texto. ACT consume una ventana de observacion y predice un chunk de acciones (el tamano de chunk no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; la model card no documenta precision ni variantes cuantizadas |
| Idiomas soportados | no aplica (politica visomotora); la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de politica | `act` (imitation learning) |
| Robot objetivo | `PhysicalAIRobot` |
| Camaras de entrada | `top`, `wrist` (RGB, 3x480x640 cada una, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.top` (3,480,640), `observation.images.wrist` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `local/pick-black-cubes-room-2`, 42 episodios, 16.962 fotogramas, 30 FPS |
| Tarea | "pick a black cube and move it to the cardboard bin" |
| Pasos de entrenamiento | 30.000 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que aprende de datos teleoperados. El modelo emplea un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas y mitiga el problema del error compounding propio de las politicas que predicen un solo paso: al predecir un chunk de acciones, la politica se ejecuta en bucle abierto durante varios pasos y reduce la acumulacion de errores. Las observaciones visuales de las dos camaras se procesan con codificadores visuales (tipicamente ResNet) y se fusionan con el vector de estado de 6 dimensiones antes de entrar en el transformer.

El entrenamiento se realizo con LeRobot 0.6.2: 30.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset consta de 42 episodios y 16.962 fotogramas grabados a 30 FPS en una unica tarea de pick-and-place sobre cubos negros. La model card no documenta el uso de RLHF, DPO ni tecnicas de refinement posteriores al entrenamiento supervisado; tampoco detalla la composicion exacta del dataset, la aumentacion de datos ni el tamano de chunk utilizado. No se declara ningun componente de lenguaje ni de condicionamiento por instrucciones: la tarea esta fijada por el dataset.

## Capacidades

- Generacion de acciones de manipulacion: predice vectores de accion de 6 dimensiones (tipicamente posicion/orientacion de efector final o articulaciones) a partir de observacion visual y de estado.
- Action chunking: predice bloques de acciones en lugar de pasos individuales, lo que mejora la estabilidad de la ejecucion en bucle abierto.
- Percepcion visomotora con dos camaras: fusiona una vista cenital (`top`) y una vista de muneca (`wrist`) a 480x640 y 30 FPS.
- Aprendizaje por imitacion: replica comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Ejecucion en robot real mediante el comando `lerobot-rollout` del stack LeRobot.
- Fine-tuning: al ser una politica LeRobot, puede reentrenarse con `lerobot-train` sobre nuevos datasets.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico, generacion de texto ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision-lenguaje, audio ni generacion de codigo.

## Casos de uso

- Automatizacion de pick-and-place en celda robotica: la politica cubre la secuencia completa de recoger un cubo negro y depositarlo en un contenedor de carton, por lo que puede integrarse en una celda de clasificacion de piezas con objetos de caracteristicas visuales similares.
- Base para fine-tuning en tareas propias: partiendo de estos pesos, un equipo puede reentrenar con `lerobot-train` sobre su propio dataset teleoperado y adaptar la politica a nuevos objetos, iluminacion o posiciones de bandeja.
- Recogida de piezas en laboratorio o linea de montaje: el uso de dos camaras (cenital y de muneca) aporta robustez parcial frente a oclusiones, adecuado para tareas de recogida en espacios con objetos pequenos y poco reflectantes.
- Investigacion en imitation learning: sirve como referencia reproducible para comparar ACT frente a otros metodos (Diffusion Policy, VLA ligeros) en un montaje experimental identico, con configuracion de entrenamiento documentada.
- Docencia y prototipado en robotica de bajo coste: con 51,7 M de parametros y 0,2 GB de pesos, el modelo se puede ejecutar en portatiles con GPU modesta, lo que facilita practicas de aprendizaje por imitacion sin infraestructura de centro de datos.
- Recopilacion autonomica de datos: puede ejecutarse como politica base para generar episodios adicionales que despues se filtren o corrijan y se reutilicen en un ciclo de mejora iterativa.
- Validacion de pipeline de despliegue LeRobot: util para verificar la integracion de camaras, calibracion del robot, nombres de claves de observacion y frecuencia de control antes de entrenar politicas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluacion (tarea, ensayos, exitos, tasa de exito) sin rellenar. No se dispone por tanto de tasas de exito en robot real, ni de metricas de error de accion (MSE/MAE) sobre el conjunto de validacion.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 207 MB en fp32 y unos 103 MB en fp16/bf16 (calculo derivado de los 51.668.614 parametros, ya que la model card no declara la precision de los pesos).
- VRAM total en inferencia: dominada por los buffers de imagen de las dos camaras a 480x640 y por las activaciones del transformer; por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. No se requieren A100 ni H100; tarjetas como RTX 3060, RTX 4090 o incluso integradas recientes pueden ejecutar la politica. La model card no especifica hardware de referencia.
- Ejecucion en CPU: viable tecnicamente por el tamano del modelo, aunque el requisito de operar a 30 FPS para coincidir con la frecuencia de entrenamiento puede hacer recomendable una GPU.
- Cabe en GPU consumer: si, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=sovrasov/act_policy_black_cubes`), PyTorch; entrenamiento mediante `lerobot-train`. No aplican vLLM, TGI, llama.cpp, Ollama ni formatos GGUF para esta clase de modelo.
- Latencia y throughput: no disponible. La politica debe ejecutarse a 30 FPS para reproducir la cadencia de control del dataset de entrenamiento; no se publican mediciones de latencia por chunk ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sovrasov/act_policy_black_cubes | ACT (transformer + CVAE, action chunking) | 51,7 M | chunk de acciones, tamano no disponible | 42 episodios, 16.962 fotogramas, 1 tarea | apache-2.0 | HuggingFace Hub, via LeRobot |
| ACT original (tonyzhaozh/act, paper arXiv:2304.13705) | ACT (transformer + CVAE, action chunking) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | repositorio de codigo del paper; pesos no verificados |
| Diffusion Policy (arXiv:2303.04137) | politica generativa por difusion | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | implementaciones publicas de terceros; no verificado |
| Politicas VLA ligeras (por ejemplo SmolVLA) | vision-lenguaje-accion | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | no verificado |

La comparacion cuantitativa no es posible con los datos disponibles: no se han publicado tasas de exito ni metricas de error para esta politica, y la busqueda web realizada no devolvio informacion tecnica sobre modelos comparables.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no existe ninguna tasa de exito publicada, por lo que el rendimiento real en robot es desconocido.
- Dataset muy reducido: 42 episodios y 16.962 fotogramas de una unica tarea y un unico entorno. Es probable un sobreajuste a posiciones, iluminacion y apariencia concretas de los objetos.
- Referencia al dataset no resoluble: el dataset se identifica como `local/pick-black-cubes-room-2`, una ruta con aspecto local, lo que limita la reproducibilidad del entrenamiento desde cero.
- Acoplamiento al hardware: la politica espera `PhysicalAIRobot`, estado de 6 dimensiones, accion de 6 dimensiones y camaras con nombres exactos `top` y `wrist` a 480x640 y 30 FPS. Cualquier desviacion en el montaje, la calibracion o la frecuencia de control degrada el comportamiento.
- Sin condicionamiento por lenguaje ni instrucciones: la tarea esta fijada por los datos; no se puede reutilizar la misma politica para una tarea distinta sin reentrenar.
- Generalizacion limitada a objetos: el entrenamiento se centra en cubos negros; no hay evidencia de transferencia a otros colores, tamanos, materiales o configuraciones con distractores.
- Riesgo de fallo fisico: en despliegues reales, los errores de la politica pueden provocar colisiones, dano al robot, a la pinza o a los objetos manipulados. Es obligatorio usar limites de par, paradas de emergencia y supervision.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y atribucion; no se declaran restricciones adicionales ni clausulas de uso responsable en la model card.
- Idiomas: no aplica; no hay capacidades de procesamiento de lenguaje natural.
- Observacion de gobernanza: los campos de fecha del repositorio (creacion y actualizacion en septiembre de 2026) y su nula traccion (0 descargas, 0 likes) apuntan a una publicacion reciente y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sovrasov/act_policy_black_cubes
- Dataset referenciado en la model card: https://huggingface.co/datasets/local/pick-black-cubes-room-2
- Visualizacion del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/pick-black-cubes-room-2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de imitation learning (grabacion de datos y entrenamiento): https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio original del metodo ACT: https://github.com/tonyzhaozh/act
- Paper de Diffusion Policy (alternativa comparable): https://arxiv.org/abs/2303.04137
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a un foro de tematica ajena), por lo que no se incluye ningun enlace adicional procedente de esa busqueda.
