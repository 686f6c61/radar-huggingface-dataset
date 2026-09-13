# VivekSai07/smolvla_pick_place_marker_bowl

## Resumen

smolvla_pick_place_marker_bowl es un policy de robotica basado en SmolVLA (paper arXiv:2506.01844), un modelo compacto de vision-lenguaje-accion (VLA) disenado para ejecutar tareas de manipulacion en hardware de consumo. Lo publica el usuario VivekSai07 en HuggingFace y consiste en un fine-tuning de lerobot/smolvla_base sobre un unico dataset de demostraciones teleoperadas. El modelo no genera texto: consume observaciones multimodales (estado articular e imagenes de camara) y produce directamente un vector de accion de 6 dimensiones para un robot tipo `so_follower` (familia SO-100/SO-101 de bajo coste).

El modelo resuelve una tarea concreta de manipulacion: "Pick up the marker and place it in the bowl" (coger el rotulador y dejarlo en el bol). Se entrena con 8017 fotogramas a 30 FPS repartidos en 10 episodios, mediante aprendizaje por imitacion con la libreria LeRobot 0.6.2. Su interes practico es acotado pero claro: sirve como ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabar datos, entrenar, desplegar) y como punto de partida para experimentos de VLA en robotica de bajo coste.

Tiene 450.046.176 parametros (~450 M) en formato safetensors, con un repositorio de 0,9 GB, lo que lo situa en el rango de modelos desplegables en GPU de consumo. Es un fine-tuning, no un modelo fundacional: su dominio de aplicacion esta limitado a la tarea y al montaje de robot con el que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta, segun el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; tamano del repo 0,9 GB) |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.2 |
| Modelo base | lerobot/smolvla_base |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Camaras declaradas | wrist, front |
| Entrada de estado | observation.state, forma (6,) |
| Entradas visuales | observation.images.camera1, camera2, camera3, forma (3, 256, 256) cada una |
| Salida | action, forma (6,) |
| Dataset de entrenamiento | Rakeshdharan56/pick_place_marker_bowl (10 episodios, 8017 fotogramas, 30 FPS) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La informacion proporcionada no detalla la composicion interna del backbone, el mecanismo de atencion ni el metodo exacto de generacion de acciones (por ejemplo, si emplea flow matching o regresion directa de acciones); esos detalles deben consultarse en el paper enlazado (arXiv:2506.01844). Lo que si se documenta es la interfaz: entra un vector de estado de 6 dimensiones mas hasta tres imagenes RGB de 256x256, y sale un vector de accion de 6 dimensiones.

El entrenamiento es un fine-tuning supervisado por imitacion desde lerobot/smolvla_base. La configuracion reportada es: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001, semilla 1000, LeRobot 0.6.2, sobre el dataset Rakeshdharan56/pick_place_marker_bowl (10 episodios, 8017 fotogramas a 30 FPS, una sola tarea). No se menciona uso de RLHF, DPO ni ninguna fase de refinamiento posterior. El volumen de datos es muy reducido (10 episodios), lo que condiciona fuertemente la generalizacion del policy.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad a partir de observaciones visuales y de estado articular.
- Ejecucion de una tarea concreta de pick and place: coger un rotulador y colocarlo en un bol.
- Procesamiento multimodal: fusiona estado proprioceptivo (6 valores) con hasta tres vistas RGB de 256x256.
- Control en bucle cerrado: produce acciones de forma continua para su ejecucion sobre el robot mediante `lerobot-rollout`.
- Ejecucion en hardware de consumo: el propio paper lo describe como desplegable en equipos no empresariales.
- Reentrenamiento y ajuste: compatible con el flujo `lerobot-train` para fine-tuning sobre nuevos datasets.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto ni modo de razonamiento explicito: no es un modelo de lenguaje, sino un policy de robotica.

## Casos de uso

- Manipulacion pick and place en laboratorio: el policy esta entrenado especificamente para coger un rotulador y depositarlo en un bol sobre un robot `so_follower`, por lo que es directamente util como referencia funcional de esa tarea en un banco de pruebas.
- Reproduccion del flujo completo de LeRobot: permite validar el ciclo grabar datos con `so_follower`, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` usando un caso real y de bajo coste.
- Fine-tuning sobre una tarea propia: partiendo de este checkpoint (o directamente de lerobot/smolvla_base) se puede reentrenar con un dataset nuevo; el ejemplo documenta los hiperparametros exactos usados (20.000 pasos, batch 8, AdamW, lr 1e-4).
- Docencia y prototipado en robotica: al tener ~450 M de parametros y 0,9 GB de pesos, se puede ejecutar en estaciones de trabajo modestas para practicas de aprendizaje por imitacion.
- Comparacion experimental de politicas: sirve como baseline de SmolVLA frente a otros policies de LeRobot (ACT, pi0, etc.) en una tarea de dificultad baja y con metricas de exito faciles de medir.
- Pruebas de robustez ante cambios de dominio: util para medir la degradacion del policy al variar posicion del rotulador, iluminacion o presencia de distractores, ya que la model card sugiere registrar precisamente esas condiciones.
- Automatizacion de una celda de manipulacion simple: si la tarea es estable y el montaje fijo (misma camara, misma posicion del bol), el policy puede encadenarse en un bucle de control continuo a la frecuencia de captura de los datos (30 FPS).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para este policy ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de exito medida en robot real ni numero de ensayos por tarea.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible (sin evaluacion publicada) |
| Numero de ensayos por tarea | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica: no es un modelo de lenguaje |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16/fp16 (el repositorio de pesos ocupa 0,9 GB), en torno a 1,8 GB en fp32 y alrededor de 0,45 GB en una cuantizacion de 8 bits. Son estimaciones derivadas del recuento de parametros (450 M), no cifras publicadas por el autor.
- Cabe en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM, asi como en GPUs de portatil; tambien es viable la ejecucion en CPU por el reducido tamano del modelo.
- GPUs recomendadas: cualquiera moderna con soporte CUDA suficiente para PyTorch, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. No se requiere GPU de datacenter.
- Opciones de despliegue: `lerobot-rollout` de la libreria LeRobot (version de referencia 0.6.2), con `--policy.path=VivekSai07/smolvla_pick_place_marker_bowl`. El entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`.
- vLLM, TGI, llama.cpp u Ollama no son aplicables: no existen pesos GGUF y el modelo no es un LLM de texto sino un policy que emite acciones.
- Latencia y throughput: no disponibles. Como referencia de contexto, los datos de entrenamiento se grabaron a 30 FPS, lo que marca el orden de magnitud de la frecuencia de control esperada en el bucle de inferencia, pero no se ha publicado ninguna medicion de latencia.
- Requisitos adicionales de sistema: el robot `so_follower` y las camaras deben estar calibrados y sus nombres de clave de observacion deben coincidir con los usados en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VivekSai07/smolvla_pick_place_marker_bowl | 450.046.176 | no disponible | sin evaluacion publicada | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (modelo base del fine-tuning) |
| Otros policies de LeRobot (ACT, pi0 y similares) | no disponible | no disponible | no disponible | no disponible | HuggingFace, via libreria LeRobot |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas, porque no hay evaluacion publicada. La comparacion relevante es funcional: este modelo es un fine-tuning de una sola tarea con 10 episodios, mientras que lerobot/smolvla_base es el modelo preentrenado generalista del que parte.

## Limitaciones y advertencias

- Especializacion extrema: esta entrenado unicamente para la tarea "Pick up the marker and place it in the bowl". Fuera de ese objetivo no hay garantia de comportamiento util.
- Dataset muy pequeno: 10 episodios y 8017 fotogramas a 30 FPS. Es un volumen bajo para aprendizaje por imitacion, con riesgo alto de sobreajuste al montaje, a las posiciones y a la iluminacion concretas de la grabacion.
- Sin validacion empirica: la model card no reporta ninguna tasa de exito ni numero de ensayos, y el repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia externa de funcionamiento.
- Inconsistencia documental: la seccion de detalles declara dos camaras (`wrist`, `front`), mientras que la tabla de entradas lista tres features visuales (`observation.images.camera1`, `camera2`, `camera3`). Hay que verificar los nombres y el numero exacto de camaras antes de desplegar.
- Riesgo fisico en robot real: un fallo del policy puede provocar colisiones, agarres fallidos o movimientos bruscos. Se recomienda ejecutar con limites de fuerza/par, supervision humana y espacio de trabajo despejado.
- Dependencia del hardware: el comportamiento esta ligado a un robot `so_follower` concreto y a una calibracion especifica; cambios de brazo, camara o montaje degradan el resultado.
- Idioma: la instruccion de tarea del dataset esta en ingles; no hay informacion sobre soporte multilingue.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia cubre el artefacto de software, no exime de responsabilidad por el comportamiento fisico del robot ni garantiza ausencia de sesgos en los datos de demostracion.
- Fechas del repositorio: fue creado el 12 de septiembre de 2026 y actualizado tres minutos despues, lo que sugiere una publicacion de prueba sin mantenimiento posterior conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VivekSai07/smolvla_pick_place_marker_bowl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Rakeshdharan56/pick_place_marker_bowl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rakeshdharan56/pick_place_marker_bowl
- Paper SmolVLA (referencia de la model card): https://huggingface.co/papers/2506.01844
- Paper SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de un policy: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
