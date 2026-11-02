# yugosakaguchi/smolvla_demo1

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, y esta ficha concreta (`yugosakaguchi/smolvla_demo1`) es un ajuste fino del checkpoint base `lerobot/smolvla_base` realizado por el usuario yugosakaguchi. El modelo resuelve el problema de control robotico por imitacion: recibe el estado articular del robot y tres imagenes de camara, y emite un vector de acciones de 6 dimensiones que el robot ejecuta. Su relevancia esta en que demuestra que es posible entrenar politicas VLA funcionales con un presupuesto computacional reducido y desplegarlas en hardware de consumo, algo impensable con VLA de gran escala.

Arquitectonicamente es un transformer multimodal que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones, con 450.046.176 parametros totales (aproximadamente 450 millones). El ajuste fino se ha realizado sobre un dataset propio de 30 episodios y 17.116 frames a 30 FPS para una unica tarea de manipulacion ("Pick up the black qube and place it on the bule goal").

Este repositorio concreto es un artefacto de demostracion: no incluye resultados de evaluacion, tiene 0 descargas y 0 likes, y su utilidad practica esta limitada al robot `so_follower` con una camara de muneca. Es relevante como ejemplo reproducible del flujo de trabajo de LeRobot y como punto de partida para quien quiera fine-tuning de SmolVLA con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en transformer, derivada de SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.1) |
| Tipo de robot | so_follower |
| Camaras | wrist (3 camaras visuales de 256x256) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | yugosakaguchi/demo_merged |
| Episodios de entrenamiento | 30 |
| Frames de entrenamiento | 17.116 a 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Seed | 1000 |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que procesa observaciones multimodales (estado articular de 6 dimensiones y tres imagenes RGB de 256x256) y genera acciones continuas de 6 dimensiones. La arquitectura sigue el diseno VLA descrito en el paper arXiv:2506.01844, que combina un backbone de lenguaje preentrenado con un adaptador visual y un cabezal de accion especifico para control robotico. El objetivo del diseno es reducir el coste computacional frente a VLA de mayor tamano manteniendo un rendimiento competitivo en tareas de manipulacion.

El ajuste fino de este repositorio se realizo con LeRobot 0.6.1 durante 20.000 pasos, batch size 32, AdamW con learning rate 1e-4 y seed 1000, partiendo del checkpoint `lerobot/smolvla_base`. El dataset `yugosakaguchi/demo_merged` contiene 30 episodios y 17.116 frames a 30 FPS de una unica tarea: coger un cubo negro y colocarlo en un objetivo azul. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de aprendizaje por imitacion supervisado. No se especifica en la informacion disponible el numero de tokens de entrenamiento del modelo base ni la composicion completa de su dataset.

## Capacidades

- Generacion de acciones roboticas continuas de 6 dimensiones a partir de observaciones visuales y de estado articular.
- Percepcion visual multimodal: procesa tres camaras simultaneamente (camera1, camera2, camera3) a 256x256.
- Control de robot tipo `so_follower` (SO-100/SO-101) mediante imitacion de politicas.
- Ejecucion de tareas de manipulacion pick-and-place en un unico escenario entrenado.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento via CLI (`lerobot-rollout`, `lerobot-train`).
- Soporte de despliegue en hardware de consumo segun la model card de SmolVLA.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito.

## Casos de uso

- **Automatizacion de pick-and-place en laboratorio**: el modelo ejecuta la tarea "Pick up the black qube and place it on the bule goal" sobre un robot SO follower con camara de muneca, util para validar pipelines de imitacion antes de escalar a tareas mas complejas.
- **Prototipado rapido de politicas VLA**: al ser un ajuste fino de 450 M de parametros entrenado en 20.000 pasos, sirve como plantilla para que equipos con pocos recursos prueben el flujo completo de LeRobot (grabacion, entrenamiento, rollout) en una tarde.
- **Docencia y formacion en robotica de imitacion**: el repositorio incluye comandos de entrenamiento y ejecucion reproducibles, lo que lo hace adecuado para talleres donde se ensena a fine-tunear SmolVLA con datasets propios.
- **Benchmark interno de infraestructura de inferencia robotica**: permite medir latencia y throughput de politicas VLA de 450 M en GPUs de consumo dentro de un pipeline LeRobot real.
- **Generacion de datos sinteticos de demostracion**: las trayectorias generadas por el modelo pueden usarse como datos aumentados para entrenar politicas posteriores o para analizar modos de fallo.
- **Validacion de integracion hardware-software**: sirve para comprobar la calibracion del robot `so_follower`, la asignacion de indices de camara y la sincronizacion a 30 FPS antes de desplegar modelos mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en robot real, ni de metricas de MMLU, HumanEval, GSM8K u otras, que ademas no aplican a un modelo de accion robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors, el peso en FP32 ronda 1,8 GB y en FP16/BF16 unos 0,9 GB, mas overhead de activaciones y buffers de imagen.
- GPU recomendadas: no especificadas en la informacion disponible. La model card de SmolVLA afirma que puede desplegarse en hardware de consumo.
- Cabe en GPU de consumo: si, segun la afirmacion generica de SmolVLA sobre hardware de consumo; no se detallan modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y por tanto el stack Python de LeRobot. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para politicas de accion.
- Latencia y throughput estimados: no disponibles. El modelo opera a 30 FPS en el dataset de entrenamiento, pero no se publica latencia medida en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yugosakaguchi/smolvla_demo1 | 450 M | no disponible | VLA robotica (pick-and-place) | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA robotica base | no disponible en la informacion | Hugging Face (modelo base) |
| Otros VLA de gran escala (p. ej. OpenVLA) | no disponible en la informacion | no disponible | VLA robotica | no disponible en la informacion | no disponible |

La comparacion se limita al modelo base del que deriva, ya que no se han proporcionado datos de otros VLA comparables en la informacion disponible. No se dispone de metricas de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- **Sobreajuste a una unica tarea**: entrenado exclusivamente para "Pick up the black qube and place it on the bule goal"; no generaliza a otras tareas sin reentrenamiento.
- **Dataset muy reducido**: 30 episodios y 17.116 frames son insuficientes para una politica robusta; se espera alta sensibilidad a posiciones, iluminacion y distractores.
- **Dependencia de hardware especifico**: disenado para robot `so_follower` con camara de muneca; no funciona con otras morfologias sin adaptacion.
- **Sin evaluacion publicada**: no hay tasas de exito en robot real, por lo que no se puede afirmar que la politica funcione de forma fiable.
- **Riesgo de alucinacion motora**: como toda politica de imitacion, puede generar acciones fuera de distribucion ante observaciones no vistas, con riesgo fisico para el robot o el entorno.
- **Sesgos**: no documentados; el dataset refleja un unico entorno, objeto y configuracion de camara.
- **Licencia apache-2.0**: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base `lerobot/smolvla_base` puede tener condiciones adicionales no detalladas en esta ficha.
- **Repositorio sin traccion**: 0 descargas y 0 likes; sin mantenimiento ni issues documentados.
- **Idiomas**: no aplica como modelo de lenguaje; el condicionamiento textual de la tarea es en ingles ("Pick up the black qube and place it on the bule goal").

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yugosakaguchi/smolvla_demo1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yugosakaguchi/demo_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yugosakaguchi/demo_merged
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
