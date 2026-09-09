# Syqnal/act_kitting_nut

## Resumen

`act_kitting_nut` es un modelo de aprendizaje por imitacion para robotica desarrollado por el usuario Syqnal y publicado en Hugging Face dentro del ecosistema LeRobot. Implementa el metodo Action Chunking with Transformers (ACT), que predice acciones en fragmentos en lugar de paso a paso. El checkpoint esta entrenado para una tarea concreta: coger una tuerca roscada y colocarla en una ranura de un kit.

El modelo se ha entrenado con el dataset `Syqnal/kitting_nut`, compuesto por 50 episodios y 9.083 fotogramas a 15 FPS, grabados de forma teleoperada. Su arquitectura consume la imagen frontal (480x640) y un vector de estado de 6 dimensiones, y produce una accion de 6 dimensiones. Tiene 51.668.614 parametros y se distribuye en formato safetensors con licencia Apache 2.0.

Al tratarse de un policy de robot, no es un modelo de lenguaje; no se especifica longitud de contexto ni idiomas. Su relevancia reside en que ofrece un checkpoint abierto y reentrenable para tareas de manipulacion, integrado en una de las librerias de robotica open source mas utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), policy de aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se han publicado pesos cuantizados) |
| Idiomas soportados | No disponible (modelo de robot, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower |
| Camaras | front |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir un unico paso de accion, predice un fragmento de acciones. Esta implementacion se ha entrenado con LeRobot y publicada como un policy reutilizable. Los datos de entrenamiento proceden del dataset `Syqnal/kitting_nut`, que contiene 50 episodios, 9.083 fotogramas a 15 FPS y una unica tarea: "Pick threaded nut and place into kit slot".

La configuracion de entrenamiento incluye 50.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-05, seed 1000 y LeRobot version 0.6.2. No se mencionan tecnicas de RLHF ni DPO, ya que no es un modelo de lenguaje. La informacion disponible no detalla la composicion exacta del dataset mas alla de la tarea, ni si se aplicaron aumentos de datos.

## Capacidades

- Genera acciones de 6 dimensiones para un robot, en lugar de un unico paso de accion.
- Consume observaciones de estado del robot (`observation.state`, dimension 6) e imagenes frontales de 480x640.
- Esta entrenado para la tarea especifica de recoger una tuerca roscada y colocarla en una ranura de kit.
- Se apoya en datos teleoperados, un enfoque habitual en aprendizaje por imitacion para manipulacion robotica.
- La documentacion del autor indica que el metodo ACT suele lograr tasas de exito altas, aunque no se aportan resultados de evaluacion para este checkpoint.
- Integrado con LeRobot, lo que permite ejecutar el policy con `lerobot-rollout` y reentrenarlo con `lerobot-train`.
- No soporta tool calling, ni generacion de texto, ni razonamiento general, ni vision de proposito general.

## Casos de uso

- Automatizacion de kitting industrial: el modelo puede ejecutarse en una celula robotica para repetir el ciclo de coger una tuerca y colocarla en una ranura de kit. Es adecuado porque la tarea es repetitiva y el policy ha sido entrenado especificamente para ella.
- Prototipado de celdas de ensamblaje: permite validar rapidamente un flujo de manipulacion con una camara frontal y un robot so_follower antes de escalar la solucion.
- Investigacion en aprendizaje por imitacion: sirve como checkpoint de referencia para comparar ACT con otros metodos dentro de LeRobot. Su tamano reducido facilita el reentrenamiento y la experimentacion.
- Educacion en robotica: puede usarse en laboratorios docentes para demostrar el flujo completo de grabacion, entrenamiento e inferencia con LeRobot, desde el dataset hasta el despliegue.
- Desarrollo de tareas de ensamblaje de pequenas piezas: el modelo puede integrarse en sistemas de manipulacion que trabajen con piezas roscadas y ranuras, siempre que el robot y la camara coincidan con la configuracion de entrenamiento.
- Generacion de nuevos datos: desplegando el policy se pueden recoger episodios adicionales para ampliar el dataset y mejorar la robustez, aunque antes habria que validar la tasa de exito del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de datos de tasa de exito, ni comparaciones con otros policies de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 0,2 GB, lo que sugiere que es un modelo ligero, pero no hay cifras oficiales de VRAM minima.
- GPU recomendada: no disponible. La documentacion de entrenamiento menciona `--policy.device=cuda`, por lo que se requiere una GPU compatible con CUDA para entrenar o ejecutar el policy.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano de los pesos, es probable que quepa en GPUs de consumo, pero no hay dato publicado.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. Requiere un robot y una camara configurados con los nombres y parametros esperados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparacion rigurosa con alternativas de la misma categoria. Existe otro checkpoint del mismo autor, `Syqnal/act_kitting_bolt`, tambien basado en ACT, pero no se han publicado sus especificaciones completas ni benchmarks en la informacion disponible.

| Modelo | Parametros | Dataset | Licencia |
|---|---|---|---|
| Syqnal/act_kitting_nut (este modelo) | 51.668.614 | Syqnal/kitting_nut | Apache 2.0 |
| Syqnal/act_kitting_bolt | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot, por lo que la tasa de exito real es desconocida.
- El dataset de entrenamiento es pequeno (50 episodios, 9.083 fotogramas) y cubre una unica tarea, lo que limita la generalizacion a otras piezas, iluminaciones o posiciones.
- El modelo depende de una camara frontal especifica y de un vector de estado de 6 dimensiones; no tiene capacidad visual general, por lo que cambios en el entorno pueden degradar el rendimiento.
- Esta entrenado para un robot tipo so_follower y puede no transferirse a otro brazo robotico sin reentrenamiento.
- No es un modelo de lenguaje ni de proposito general; no soporta tool calling, agentes ni razonamiento simbolico.
- Aunque la licencia Apache 2.0 permite uso comercial, no se debe desplegar en produccion sin una validacion propia sobre el robot objetivo.
- No se han publicado pesos cuantizados, ni datos de consumo de memoria o latencia.

## Enlaces

- Modelo: https://huggingface.co/Syqnal/act_kitting_nut
- Dataset: https://huggingface.co/datasets/Syqnal/kitting_nut
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Perfil de Syqnal: https://huggingface.co/Syqnal
- Otro checkpoint del mismo autor: https://huggingface.co/Syqnal/act_kitting_bolt
