# ulasZoi/smolvla_pickcube_bs64_LeAUG

## Resumen

SmolVLA es un modelo compacto de tipo vision-lenguaje-accion (VLA) orientado a robotica, desarrollado en el ecosistema de Hugging Face y descrito en el paper arXiv:2506.01844. El repositorio `ulasZoi/smolvla_pickcube_bs64_LeAUG` no es el modelo fundacional, sino un ajuste fino de `lerobot/smolvla_base` entrenado con LeRobot 0.6.2 para una unica tarea de manipulacion: "pick up the cube" (coger un cubo). Cuenta con 450.046.176 parametros (aproximadamente 450 millones) almacenados en safetensors, con un tamano de repositorio de 0,9 GB.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres imagenes de 256x256) y produce acciones de 6 dimensiones, es decir, controla directamente un brazo robotico de 6 grados de libertad. Esta pensado para el robot `so_follower` (familia SO-100/SO-101 de bajo coste) y fue entrenado con 243 episodios y 76.011 fotogramas capturados a 30 FPS.

Su relevancia es doble: por un lado demuestra que un VLA de ~450 M de parametros puede desplegarse en hardware de consumo, algo que la propia model card destaca; por otro, sirve como ejemplo reproducible de flujo completo de imitacion con LeRobot (grabacion de datos, entrenamiento y rollout). Las descargas (14) y los "likes" (0) indican que es un artefacto experimental de un usuario, no un modelo ampliamente validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA; detalles internos de capas no disponibles en la model card |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo no opera con contexto de texto extenso, sino con una instruccion de tarea y observaciones por paso |
| Tipos de cuantizacion | No disponible en la model card; el repositorio distribuye pesos en safetensors (0,9 GB, coherente con precision de 16 bits) |
| Idiomas soportados | No disponible; la tarea se define mediante una instruccion textual ("pick up the cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas | `observation.state` (6,), `observation.images.camera1` (3, 256, 256), `observation.images.camera2` (3, 256, 256), `observation.images.camera3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras declaradas | `front` (la model card tambien lista camera1, camera2 y camera3 como entradas) |
| Modelo base | `lerobot/smolvla_base` (ajuste fino) |
| Dataset de entrenamiento | `ulasZoi/smolvla_pickcube_all` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-lenguaje-accion: un backbone de vision y lenguaje que procesa imagenes e instrucciones de tarea, acoplado a una cabeza que genera acciones motoras continuas. La model card no detalla la composicion exacta de capas, el mecanismo de atencion ni el tipo de cabeza de accion, por lo que esos detalles deben consultarse en el paper arXiv:2506.01844. Si se sabe que el modelo consume tres vistas de camara a 256x256 junto con el estado articular y emite un vector de 6 acciones, el formato tipico de las politicas de imitacion entrenadas con LeRobot.

El entrenamiento se realizo por ajuste fino supervisado sobre `lerobot/smolvla_base` con 20.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2 sobre CUDA. El dataset contiene 243 episodios y 76.011 fotogramas a 30 FPS de una unica tarea ("pick up the cube"); no se indica que se aplicaran tecnicas de RLHF, DPO ni aumentos de datos adicionales, aunque el nombre del repositorio incluye el sufijo `LeAUG`, que sugiere algun tipo de aumento de datos no documentado en la model card. No hay informacion sobre el numero de tokens de entrenamiento ni sobre la composicion completa del dataset mas alla del enlace al repositorio de datos.

## Capacidades

- Control robotico de manipulacion: genera acciones continuas de 6 dimensiones para un brazo `so_follower` de 6 grados de libertad.
- Percepcion visual multimodal: procesa tres flujos de imagen de 256x256 de forma simultanea, lo que permite combinar vistas de la escena.
- Condicionamiento por instruccion en lenguaje natural: la politica acepta una tarea textual (por ejemplo, "pick up the cube") como parte de la entrada.
- Politica de imitacion de tarea unica: especializada en la tarea de coger un cubo, aprendida de demostraciones humanas.
- Despliegue en hardware de consumo: segun la model card, el modelo esta disenado para ejecutarse en equipos de gama de consumo.
- Integracion con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-rollout` de LeRobot 0.6.2.
- No dispone, segun la informacion disponible, de tool calling, function calling, capacidades de agente, modo de razonamiento explicito, vision general de proposito multiple ni procesamiento de audio.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: ejecutar la tarea de coger un cubo con un brazo SO-100/SO-101 equipado con tres camaras, usando `lerobot-rollout` con `--strategy.type=base`. Es el uso para el que fue entrenado exactamente.
- Baseline en investigacion de imitacion: comparar nuevas politicas o variantes de aumento de datos contra este checkpoint en la misma tarea y con el mismo robot, ya que se conocen los hiperparametros exactos del entrenamiento.
- Docencia en robotica de bajo coste: ilustrar el ciclo completo de aprendizaje por imitacion (grabacion con LeRobot, entrenamiento de 20.000 pasos y evaluacion en robot real) con un modelo de 450 M de parametros que cabe en una GPU de consumo.
- Punto de partida para ajustes finos en tareas relacionadas: reentrenar desde `lerobot/smolvla_base` o desde este checkpoint con un dataset propio de pick-and-place para variar la posicion del objeto, la iluminacion o el tipo de pieza.
- Validacion de pipelines de datos en el Hub: emplear el dataset `ulasZoi/smolvla_pickcube_all` (243 episodios, 76.011 fotogramas a 30 FPS) para probar herramientas de visualizacion, conversion y control de calidad de datasets de robotica.
- Pruebas de robustez y transferencia de dominio: evaluar como se degrada la politica ante cambios de posicion inicial, iluminacion o distracciones, dado que el modelo carece de resultados de evaluacion publicados.
- Demostraciones reproducibles de VLA compactos: mostrar en un blog, taller o asignatura que un VLA de 450 M de parametros puede ejecutarse en una GPU de gama media sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica: "No evaluation results have been provided for this policy yet" (no se han proporcionado resultados de evaluacion para esta politica). No hay datos de tasa de exito, numero de ensayos, MMLU, HumanEval ni metricas equivalentes, que por otra parte no aplican a un modelo de control motor.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan 0,9 GB (coherente con precision de 16 bits); en FP32 serian aproximadamente 1,8 GB. Sumando activaciones de tres imagenes de 256x256 y el estado, el consumo de inferencia se situa en el rango de 2 a 4 GB de VRAM. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Para desarrollo, RTX 3060, RTX 4060 o superiores; para produccion, L4, A100 o H100 si se despliegan muchas instancias o se quiere margen de memoria. El entrenamiento completo con lote 64 requiere mas memoria que la inferencia.
- GPU de consumo: si, es uno de los puntos fuertes del modelo. Cabe en practicamente cualquier GPU de consumo moderna con 4 GB o mas, y potencialmente en plataformas embebidas tipo Jetson Orin, siempre que el entorno de PyTorch y LeRobot lo soporte.
- Opciones de despliegue: LeRobot 0.6.2 mediante `lerobot-rollout` (inferencia sobre robot real) y `lerobot-train` (reentrenamiento). vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo de generacion de texto.
- Latencia y rendimiento: no disponibles. El dataset de entrenamiento se capturo a 30 FPS, pero no se publica ninguna medida de latencia de inferencia ni de frecuencia de control alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ulasZoi/smolvla_pickcube_bs64_LeAUG` (este) | 450.046.176 | Estado (6,) y 3 imagenes de 256x256 | apache-2.0 | Publico en el Hub, 14 descargas, 0 likes |
| `lerobot/smolvla_base` | No disponible | No disponible | No disponible en la informacion proporcionada | Publico en el Hub (modelo base del ajuste) |
| SmolVLA (paper arXiv:2506.01844) | No disponible en la informacion proporcionada | No disponible | No disponible | Paper y descripcion del metodo |
| Otras politicas de imitacion de LeRobot (ACT, Diffusion Policy) | No disponible | No disponible | No disponible | Implementadas en la libreria LeRobot, sin datos comparativos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros declarados, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea unica: el modelo solo ha sido entrenado para "pick up the cube". Fuera de esa tarea, o con objetos distintos, el comportamiento no esta garantizado.
- Dominio de datos estrecho: 243 episodios y 76.011 fotogramas de una sola tarea, con una unica configuracion de robot y camaras. El riesgo de sobreajuste al entorno de grabacion es alto.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que no se puede estimar su fiabilidad real en produccion.
- Dependencia estricta del hardware: requiere un robot `so_follower` con un estado de 6 dimensiones y tres camaras cuyos nombres de observacion coincidan con los del entrenamiento. Cualquier discrepancia en nombres, calibracion o indices de camara provoca fallos de ejecucion o de politica.
- Ambiguedad en la definicion de camaras: la model card declara `front` como camara, pero la tabla de entradas lista tres camaras (`observation.images.camera1`, `camera2` y `camera3`). Conviene verificar la configuracion exacta antes de desplegarlo.
- Sensibilidad al lenguaje: al estar condicionado por una instruccion textual, cambios en la formulacion de la tarea pueden alterar el comportamiento, aunque no hay estudios publicados al respecto.
- Alucinacion: no aplica en el sentido de generacion de texto libre; el riesgo equivalente es la ejecucion de acciones fisicas incorrectas o inseguras, con impacto directo en el robot y su entorno.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de licencia y citar el trabajo original. Conviene verificar los terminos del modelo base `lerobot/smolvla_base` y del dataset `ulasZoi/smolvla_pickcube_all`, no confirmados en esta informacion.
- Entrenamiento no reproducible al detalle: se conocen los hiperparametros principales (20.000 pasos, lote 64, AdamW, lr 1e-4, semilla 1000, LeRobot 0.6.2), pero no la composicion exacta del dataset ni el tratamiento de aumentos de datos sugerido por el sufijo `LeAUG`.
- Madurez: 14 descargas y 0 likes indican que es un experimento personal, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_LeAUG
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden del repositorio de HuggingFace y de la model card.
