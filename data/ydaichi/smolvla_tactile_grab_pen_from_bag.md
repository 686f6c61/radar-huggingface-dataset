# ydaichi/smolvla_tactile_grab_pen_from_bag

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por el equipo de LeRobot de Hugging Face. Su objetivo es reducir el coste computacional de los modelos VLA tradicionales manteniendo un rendimiento competitivo, lo que permite ejecutarlos en hardware de consumo, como GPUs domésticas. Este checkpoint concreto ha sido fine-tuned sobre el dataset `ydaichi/tactile_grab_pen_from_bag`, una colección de demostraciones robóticas de agarre de un bolígrafo desde una bolsa con sensores táctiles.

El modelo se basa en la arquitectura SmolVLA presentada en el paper `2506.01844`, y se distribuye a través de Hugging Face con la librería LeRobot. Su tamaño es de 451.043.616 parámetros (aproximadamente 0.45 mil millones), lo que lo sitúa en un rango muy inferior a modelos VLA como OpenVLA o RT-2, manteniendo una ventana de trabajo orientada a tareas de manipulación robótica. La relevancia actual del modelo radica en la posibilidad de entrenar y desplegar políticas de control robótico en entornos de laboratorio o prototipado sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) |
| Parametros totales | 451.043.616 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA basado en transformers que combina un codificador de vision con un modelo de lenguaje de tamano reducido y una cabeza de acciones. La entrada al modelo consiste en imagenes y/o senales de sensores (incluyendo datos tactiles en este checkpoint), junto con instrucciones de lenguaje. La salida es una secuencia de acciones de control para el robot. Esta arquitectura se entrena mediante imitacion de demostraciones, utilizando el framework LeRobot de Hugging Face.

El checkpoint concreto ha sido fine-tuned sobre el dataset `ydaichi/tactile_grab_pen_from_bag`, que contiene demostraciones de agarre de un boligrafo de una bolsa. No se proporcionan datos detallados sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset. La tecnica de entrenamiento es la estandar de LeRobot para politicas de aprendizaje por imitacion. No se ha aplicado RLHF ni DPO, al tratarse de un modelo de control robotico y no de lenguaje generativo.

## Capacidades

- Ejecucion de politicas de control robotico a partir de entradas de vision, sensores tactiles y lenguaje.
- Aprendizaje por imitacion de demostraciones humanas registradas con robots teleoperados.
- Soporte de sensores tactiles para tareas de manipulacion fina (en este checkpoint especifico).
- Integracion con el framework LeRobot para entrenamiento, evaluacion e inferencia.
- Compatibilidad con brazos roboticos tipo SO100 u otros soportados por LeRobot.
- Capacidad de despliegue en hardware de consumo gracias a su tamano reducido.

## Casos de uso

- Manipulacion robotica de objetos con feedback tactil: el modelo puede controlar un brazo robotico para agarrar objetos pequenos y fragiles, utilizando los datos tactiles para ajustar la fuerza y la presion.
- Tareas de pick-and-place en entornos de laboratorio: adecuado para clasificar objetos o colocarlos en posiciones concretas, con una precision suficiente para tareas de investigacion.
- Prototipado rapido de politicas de control: al ser compacto, permite iterar sobre nuevos datasets y tareas sin necesidad de grandes recursos de computo.
- Educacion y experimentacion en robotica: el modelo puede desplegarse en GPUs domesticas, facilitando su uso en cursos o proyectos de investigacion.
- Evaluacion de algoritmos de aprendizaje por imitacion: sirve como modelo base para comparar tecnicas de entrenamiento, como variaciones de la arquitectura VLA.
- Integracion en pipelines de robotica de bajo coste: gracias a su licencia Apache-2.0 y su tamano, puede incorporarse en sistemas roboticos de investigacion sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 451M parametros. En precision FP16, los pesos ocupan aproximadamente 0.9 GB. Considerando overhead de activaciones y buffer de entrada, se estima un consumo de 2-4 GB de VRAM.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o RTX 4090 son suficientes. En entornos de servidor, una A100 o H100 no son necesarias.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPUs domesticas de 6 GB o superiores.
- Opciones de despliegue: el modelo se utiliza principalmente a traves del framework LeRobot con `lerobot-record` o `lerobot-train`. No se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de control robotico y no de texto.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este checkpoint) | 451M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | no disponible | Hugging Face |
| RT-2 | 55B | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos.

## Limitaciones y advertencias

- El modelo ha sido fine-tuned para una tarea muy especifica (agarrar un boligrafo de una bolsa). Su capacidad de generalizacion a otras tareas no esta evaluada.
- No se han publicado analisis de sesgos. El comportamiento puede estar influenciado por la distribucion de los datos de entrenamiento, que probablemente provienen de un unico entorno o robot.
- Riesgo de alucinacion en la generacion de acciones: el modelo puede producir secuencias de acciones invalidas o no seguras si las entradas no se corresponden con los datos de entrenamiento.
- Limitaciones de contexto: no se dispone de la longitud de contexto, pero al ser un modelo de acciones, la ventana de tokens esta disenada para observaciones visuales y de sensores, no para conversaciones largas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones, pero no incluye garantias de seguridad ni soporte oficial.
- El modelo depende del framework LeRobot. Cambios en la API del framework pueden requerir adaptaciones en el codigo de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ydaichi/smolvla_tactile_grab_pen_from_bag
- Dataset de entrenamiento: https://huggingface.co/datasets/ydaichi/tactile_grab_pen_from_bag
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
