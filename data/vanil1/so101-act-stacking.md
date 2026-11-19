# vanil1/SO101-ACT-Stacking

## Resumen

SO101-ACT-Stacking es una politica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot SO-101 de bajo coste. El modelo resuelve una tarea concreta de manipulacion: apilar tres cubos de colores (rojo, amarillo y morado) sobre una marca en la mesa. Lo desarrolla el usuario vanil1 y se publica en Hugging Face bajo licencia Apache 2.0.

ACT es un metodo de imitation learning que predice trozos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion y permite ejecutar politicas a mayor frecuencia efectiva. En este caso, la politica consume el estado articular de 6 dimensiones y una imagen de muneca de 640x480, y produce un vector de accion de 6 dimensiones a 30 FPS.

El interes practico es que se trata de un ejemplo reproducible de entrenamiento de robotica de bajo coste: 51,7 millones de parametros, un dataset de 74 episodios y 102.274 frames, y un flujo completo documentado con los comandos `lerobot-train` y `lerobot-rollout`. No es un modelo de lenguaje, sino un checkpoint de politica robotica, y su uso esta acotado al hardware y la tarea para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imagenes) con un transformer que modela secuencias de observaciones y acciones, y predice chunks de acciones de longitud fija. La politica recibe `observation.state` de forma `(6,)` y `observation.images.wrist` de forma `(3, 640, 480)`, y emite `action` de forma `(6,)`. El entrenamiento se realizo con LeRobot 0.6.1, optimizador AdamW, learning rate 1e-5, batch size 16, semilla 1000 y 40.000 pasos.

El dataset de entrenamiento es `shilpitha-03/so101_stack_rpy`, con 74 episodios, 102.274 frames a 30 FPS y una unica tarea: "Stack the red, yellow and purple cubes on the table mark". No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa; es aprendizaje supervisado por imitacion a partir de datos de teleoperacion. El robot declarado es `so_follower` con una camara de muneca.

## Capacidades

- Control robotico de manipulacion: genera comandos de accion de 6 dimensiones para el robot SO-101.
- Apilamiento de objetos: tarea especifica de colocar cubos rojo, amarillo y morado sobre una marca.
- Percepcion visual de muneca: usa una unica camara con resolucion 640x480 a 30 FPS.
- Prediccion de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecucion en tiempo real: disenado para inferencia a 30 FPS en el bucle de control del robot.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Demostracion de apilamiento en laboratorio: ejecutar la politica con `lerobot-rollout` sobre un SO-101 calibrado para reproducir la tarea de apilar tres cubos, util como baseline en experimentos de imitation learning.
- Reproduccion de experimentos: servir como referencia para comparar variantes de ACT, cambios de dataset o hiperparametros en el mismo setup de hardware.
- Formacion de nuevos usuarios de LeRobot: usar el flujo documentado (grabacion, entrenamiento con `lerobot-train`, rollout) como ejemplo completo de extremo a extremo.
- Prototipado de robotica de bajo coste: validar si una politica ligera de 51,7 M de parametros es suficiente para tareas de pick-and-place en entornos controlados.
- Base para fine-tuning: reentrenar o adaptar la politica con datos propios del mismo robot y camara para tareas de apilamiento similares.
- Evaluacion de robustez: probar la politica con cambios de iluminacion, posiciones de cubos o distracciones para medir la degradacion del exito, tal como sugiere la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 51,7 M de parametros en safetensors y un repo de 0,2 GB, la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente para inferencia; para entrenamiento se recomienda una GPU dedicada por el coste de 40.000 pasos con batch 16.
- GPU consumer: si, cabe en tarjetas de gama media y alta (por ejemplo, RTX 3060 en adelante) para inferencia.
- Despliegue: LeRobot con `lerobot-rollout` y `lerobot-train`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: el dataset y el control estan a 30 FPS; no se publican cifras de latencia por paso ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101-ACT-Stacking (este) | 51,7 M | ACT, una tarea, robot SO-101 | no aplica | apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | ACT, metodo general | no aplica | no disponible | paper y codigo de referencia |
| Otras politicas LeRobot | no disponible | difusion, ACT u otras | no aplica | segun repositorio | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenada para una unica tarea y un unico robot (`so_follower`) con una camara de muneca; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida en robot real.
- Depende de la calibracion del robot, del puerto y de los indices de camara; los nombres de camara deben coincidir con las claves de observacion del entrenamiento.
- Sensible a cambios de iluminacion, posiciones de objetos, distracciones o variaciones del entorno no representadas en los 74 episodios.
- Riesgo de sobreajuste al dataset pequeno (102.274 frames, una sola tarea); el comportamiento fuera de distribucion no esta caracterizado.
- No es un modelo de lenguaje: no tiene capacidades de texto, codigo, vision general ni razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las dependencias de LeRobot y del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanil1/SO101-ACT-Stacking
- Dataset de entrenamiento: https://huggingface.co/datasets/shilpitha-03/so101_stack_rpy
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shilpitha-03/so101_stack_rpy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
