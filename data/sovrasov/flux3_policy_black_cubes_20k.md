# sovrasov/flux3_policy_black_cubes_20k

## Resumen

`sovrasov/flux3_policy_black_cubes_20k` es una politica de robotica (policy) entrenada con LeRobot que aplica el metodo FLUX 3 Action (`flux3`) de Black Forest Labs. Se trata de un modelo de accion-video ("world action model") que parte del tronco de video FLUX.3, de 7B de parametros, al que se anade una modalidad de accion que se desruida de forma conjunta con los siguientes fotogramas de video. Cada encarnacion robotica recibe un ajuste fino propio con cabezas de accion nuevas.

Este checkpoint concreto es un ajuste fino sobre un unico robot (`PhysicalAIRobot`) y una unica tarea: "pick a black cube and move it to the cardboard bin". Consume dos camaras de 256x256 (`observation.images.scene` y `observation.images.wrist`) mas un vector de estado de 6 dimensiones, y produce una accion de 6 dimensiones. Se entreno durante 20.000 pasos con batch size 2 sobre un dataset de 50 episodios y 20.195 fotogramas a 30 FPS.

Su relevancia es doble: por un lado demuestra el flujo de ajuste por encarnacion del metodo flux3 dentro del ecosistema LeRobot; por otro, sirve como ejemplo reproducible de politica de imitacion de tarea unica. El repositorio es muy pequeno (0,5 GB) y no incluye resultados de evaluacion en robot real, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de accion-video (world action model) flux3: tronco de video FLUX.3 con modalidad de accion desruidada conjuntamente con los siguientes fotogramas; modelo flow multimodal segun Black Forest Labs |
| Parametros totales | 7B (tronco FLUX 3 Action, segun la documentacion de LeRobot); los parametros almacenados en este repositorio concreto no se detallan |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de accion de 32 acciones por inferencia segun la documentacion de flux3 |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de texto; los ejemplos de la model card estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria: lerobot) |
| Tipo de robot | `PhysicalAIRobot` |
| Camaras | `top`, `wrist` |
| Entradas | `observation.images.scene` (3, 256, 256), `observation.images.wrist` (3, 256, 256), `observation.state` (6,) |
| Salidas | `action` (6,) |
| Frecuencia de los datos | 30 FPS |
| Tamano del repositorio | 0,5 GB |
| Version de LeRobot | 0.6.2 |
| Pasos de entrenamiento | 20.000 |

## Arquitectura y entrenamiento

flux3 combina un tronco de video generativo con una cabeza de acciones. El proceso de inferencia parte de fotogramas de camara, el estado del robot y una instruccion de texto, y devuelve las siguientes 32 acciones, que se desruidan de forma conjunta con los siguientes 32 fotogramas. Segun la documentacion de LeRobot, el modelo base de FLUX 3 Action tiene 7B de parametros y fue ajustado sobre DROID, alcanzando un 42,6% de exito en la tarea en el benchmark RoboLab-120. FLUX 3, de Black Forest Labs, se presenta como un modelo fundacional multimodal que aprende de imagenes, video y audio en una unica arquitectura, y es el primer FLUX que entrega prediccion de video, audio y accion desde un mismo conjunto de pesos.

En este checkpoint, el ajuste se realizo por imitacion sobre un dataset propio de 50 episodios y 20.195 fotogramas grabados a 30 FPS, con una unica tarea de recogida y colocacion. La configuracion de entrenamiento documentada es: 20.000 pasos, batch size 2, optimizador AdamW, learning rate 1e-4, semilla 42 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de fases de refinamiento por preferencias, ni se detalla la composicion exacta del dataset mas alla de la tarea y las camaras empleadas. Las cabezas de accion se reinician para cada encarnacion robotica, de modo que este repositorio no es directamente reutilizable en otro robot sin un nuevo ajuste fino.

Nota: el repositorio ocupa 0,5 GB, muy por debajo de los aproximadamente 14 GB que ocuparia un tronco de 7B en bf16. Esto sugiere que el repositorio no contiene el tronco completo del modelo, pero la informacion disponible no lo confirma ni detalla como se resuelve la carga del tronco base.

## Capacidades

- Generacion de acciones de robot: produce vectores de accion de 6 dimensiones a partir de observaciones visuales y de estado.
- Control visomotor de tarea unica: recoger un cubo negro y depositarlo en un contenedor de carton.
- Entrada multimodal: dos flujos de imagen de 256x256 (escena y muneca) mas un vector de estado de 6 componentes.
- Condicionamiento por instruccion de texto: el modelo acepta una instruccion de tarea, como muestra el ejemplo `--task="pick a black cube and move it to the cardboard bin"`.
- Prediccion de video conjunta: segun la documentacion de flux3, las acciones se desruidan junto con los siguientes 32 fotogramas, lo que proporciona una senal de prediccion visual adicional.
- Horizonte de accion en bloque: 32 acciones por inferencia segun la documentacion de flux3.
- Soporte de tool calling / function calling: no disponible; no es una capacidad aplicable a una politica robotica de imitacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible; el modelo base FLUX 3 declara soporte de audio e imagen en su arquitectura, pero no se documenta su uso en esta politica.

## Casos de uso

- Automatizacion de picking y placing en laboratorio: la politica ejecuta la tarea de recoger un cubo negro y depositarlo en un contenedor. Es adecuada para prototipos de celulas de manipulacion con la misma iluminacion, posiciones y utillaje del dataset de entrenamiento.
- Generacion de datos sinteticos de video: al predecir 32 fotogramas futuros junto con las acciones, puede emplearse para generar trayectorias visuales plausibles y aumentar datasets de imitacion sin necesidad de teleoperacion adicional.
- Investigacion en world models para robotica: sirve como banco de pruebas para estudiar el acoplamiento entre prediccion visual y prediccion de acciones en el marco flux3.
- Punto de partida para ajuste por encarnacion: partiendo de los pesos de flux3, se puede reentrenar con `lerobot-train --policy.type=flux3` sobre un dataset propio de otro robot, sustituyendo unicamente las cabezas de accion.
- Validacion de pipelines LeRobot: util para verificar la instalacion, la calibracion de camaras y el flujo `lerobot-rollout` antes de invertir en grabacion de datos a gran escala.
- Benchmark interno de politicas de imitacion: comparar esta politica con alternativas como ACT sobre el mismo dataset permite medir el coste y el beneficio de usar un tronco de 7B frente a politicas mas ligeras.
- Demostraciones y material docente: el repositorio y su comando de rollout son un ejemplo compacto de como se publica y se ejecuta una politica en LeRobot, utile para cursos y talleres de robotica.
- Deteccion temprana de fallos de manipulacion: al disponer de prediccion de video, es posible inspeccionar los fotogramas desruidos para anticipar colisiones o agarres fallidos antes de ejecutar la accion en el robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de evaluacion para esta politica. La model card lo indica explicitamente: "No evaluation results have been provided for this policy yet."

Como referencia del modelo base, no de este checkpoint, la documentacion de LeRobot reporta lo siguiente:

| Modelo | Benchmark | Metrica | Resultado |
|---|---|---|---|
| FLUX 3 Action (base, ajustado sobre DROID) | RoboLab-120 | tasa de exito en tarea | 42,6% |
| sovrasov/flux3_policy_black_cubes_20k | no disponible | no disponible | no disponible |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que no es un modelo de texto.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del tronco base (7B) declarado en la documentacion de LeRobot, no datos confirmados por el autor del checkpoint:

- VRAM para el tronco en bf16/fp16: aproximadamente 14 GB solo para los pesos, mas la memoria de activaciones del proceso de desruido conjunto de acciones y fotogramas.
- VRAM para el tronco en fp32: aproximadamente 28 GB para los pesos.
- VRAM total recomendada para inferencia comoda: 24-48 GB, segun el tamano de lote y la resolucion del proceso de desruido.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ser suficiente en bf16 si las activaciones se mantienen bajas, pero queda muy ajustada y no esta confirmado por el autor.
- Opciones de despliegue: el flujo oficial es LeRobot mediante `lerobot-rollout` con `--policy.path=sovrasov/flux3_policy_black_cubes_20k` sobre PyTorch y CUDA. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica robotica de este tipo.
- Latencia y throughput: no documentados. Si el bloque de 32 acciones se ejecuta a la frecuencia del dataset (30 FPS), cada inferencia cubriria aproximadamente 1,07 segundos de control, lo que exige que el tiempo de inferencia se mantenga por debajo de ese margen para operar en tiempo real.
- Requisitos adicionales: el robot objetivo debe exponer las claves de observacion con las que se entreno la politica y las camaras deben configurarse con los nombres y los indices correctos en el comando de rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sovrasov/flux3_policy_black_cubes_20k | no disponible (tronco base de 7B) | 32 acciones por inferencia; contexto no disponible | sin resultados publicados | apache-2.0 | HuggingFace, via LeRobot |
| FLUX 3 Action (base, ajustado sobre DROID) | 7B | 32 acciones por inferencia; contexto no disponible | 42,6% de exito en RoboLab-120 | no disponible en la informacion proporcionada | documentado en el repositorio de LeRobot |
| sovrasov/act_policy_black_cubes | no disponible | no disponible | no disponible | no disponible | HuggingFace, via LeRobot |
| Otras politicas de LeRobot (pi0, SmolVLA, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes para establecer una comparacion cuantitativa entre estas alternativas en la misma tarea y con el mismo dataset.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("pick a black cube and move it to the cardboard bin") sobre una unica encarnacion robotica. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin evaluacion publicada: no hay tasa de exito en robot real, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que la politica funcione de forma fiable.
- Dependencia del entorno de entrenamiento: cualquier cambio en posiciones de objetos, iluminacion, camaras o utillaje puede degradar el rendimiento. Solo se grabaron 50 episodios, un volumen bajo para imitacion robusta.
- Dataset no verificable: el dataset referenciado es `local/pick-black-cubes-room-2`, una ruta local que no apunta a un repositorio publico resoluble en el Hub, lo que dificulta la reproducibilidad del entrenamiento.
- Inconsistencia documental en las claves de observacion: la model card lista las camaras como `top` y `wrist`, pero la tabla de entradas usa la clave `observation.images.scene`. El comando de rollout exige que los nombres de camara coincidan con las claves del entrenamiento, por lo que hay que resolver esta discrepancia antes de desplegar.
- Repositorio incompleto respecto al tamano declarado del modelo: 0,5 GB frente a los aproximadamente 14 GB de un tronco de 7B en bf16. No se documenta como se obtiene el tronco base durante la carga.
- Riesgo de alucinacion visual: al ser un modelo generativo que desruida fotogramas futuros, sus predicciones visuales no reflejan necesariamente lo que ocurrira en el entorno real y no deben usarse como senal de seguridad.
- Idiomas no documentados: no se especifica que idiomas acepta la instruccion de texto. Los ejemplos estan en ingles.
- Cuantizaciones no publicadas: no hay pesos GGUF, AWQ, GPTQ ni INT8 oficiales, lo que limita el despliegue en hardware con poca VRAM.
- Sin senal de seguridad: no se documentan limites de parada, deteccion de colisiones ni validacion de acciones. Cualquier uso en robot fisico requiere capas de seguridad externas.
- Licencia: el checkpoint se publica bajo apache-2.0, lo que permite uso comercial, pero la licencia del tronco base FLUX.3 de Black Forest Labs no se documenta en esta model card y debe verificarse por separado.
- Fechas del repositorio: los metadatos indican creacion el 2026-10-07 y actualizacion el 2026-10-07, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sovrasov/flux3_policy_black_cubes_20k
- Repositorio de LeRobot (GitHub): https://github.com/huggingface/lerobot
- Implementacion de la politica flux3 en LeRobot: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/flux3
- Guia de flux3 en la documentacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/flux3
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (`cheat-sheet`): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset referenciado: https://huggingface.co/datasets/local/pick-black-cubes-room-2
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/pick-black-cubes-room-2
- Politica ACT del mismo autor: https://huggingface.co/sovrasov/act_policy_black_cubes
- Pagina de FLUX 3 de Black Forest Labs: https://flux3.dev/
- Analisis de FLUX 3 en MarkTechPost: https://www.marktechpost.com/2026/07/26/black-forest-labs-releases-flux-3-a-multimodal-flow-model-for-image-video-audio-and-robot-action-prediction/
- Repositorio de LeRobot en PyTorch (GitHub): https://github.com/huggingface/lerobot
- Cita de LeRobot (BibTeX): Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024, https://github.com/huggingface/lerobot
