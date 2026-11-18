# yhks/act_my_task_chunk10

## Resumen

`yhks/act_my_task_chunk10` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario yhks en Hugging Face mediante la librería LeRobot de Hugging Face, y está asociado al paper ACT (arXiv:2304.13705). Su propósito es controlar un robot seguidor de tipo `so_follower` (SO-100/SO-101 de LeRobot) para ejecutar la tarea "Grab the black cube" a partir de dos cámaras (overhead y wrist) y el estado de las articulaciones.

Técnicamente es un modelo pequeño: 51.576.454 parámetros en formato safetensors, con un repositorio de 0,2 GB. No es un modelo de lenguaje, sino un transformer de política visomotora que consume imágenes de 480x640 y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. La ventana de contexto no aplica en el sentido de los LLM: el "chunking" hace referencia al horizonte de acciones que predice por inferencia.

Es relevante como ejemplo práctico de flujo de trabajo end-to-end en robótica open source: dataset propio de 50 episodios y 44.947 frames a 30 FPS, entrenamiento de 100.000 pasos con LeRobot 0.6.0 y licencia Apache 2.0. No obstante, es un modelo de nicho, sin resultados de evaluación publicados y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de política visomotora |
| Parametros totales | 51.576.454 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; horizonte de chunk de acciones no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder visual (procesa las dos cámaras: `observation.images.overhead` y `observation.images.wrist`, ambas de 3x480x640) con un transformer que predice un chunk de acciones de forma `(6,)`. La entrada incluye además `observation.state` de forma `(6,)`, correspondiente al estado articular del robot `so_follower`. El modelo se entrenó sobre el dataset `yhks/my_task`, con 50 episodios, 44.947 frames a 30 FPS y la única tarea "Grab the black cube".

La configuración de entrenamiento reportada es: 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.0. No se especifica en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá de los episodios indicados, ni si hubo RLHF/DPO (no procede en aprendizaje por imitación). Tampoco se detalla la innovación de decodificación especulativa ni variantes de atención; el paper de ACT describe el chunking de acciones como mecanismo principal para reducir el error de compounding en políticas de imitación.

## Capacidades

- Control visomotor de un robot `so_follower` para la tarea "Grab the black cube".
- Fusión de dos cámaras (overhead y wrist) con estado articular de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones por inferencia.
- Ejecución de políticas en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Entrenamiento y reentrenamiento con `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento multi-turno (no es un LLM).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Recogida de objetos en laboratorio: el modelo ejecuta la tarea "Grab the black cube" sobre un SO-100/SO-101, útil como banco de pruebas para validar el pipeline de LeRobot antes de escalar a tareas más complejas.
- Prototipado de políticas de imitación: sirve como referencia reproducible (50 episodios, 100.000 pasos, hiperparámetros documentados) para comparar configuraciones de ACT en el mismo robot y dataset.
- Docencia y formación en robótica: al ser un modelo pequeño (51,6 M de parámetros, 0,2 GB) y con licencia Apache 2.0, se puede desplegar en equipos modestos para prácticas de aprendizaje por imitación.
- Integración en pipelines de investigación: el formato safetensors y la compatibilidad con LeRobot permiten cargarlo en scripts de evaluación propios y automatizar rollouts con `--strategy.type=base`.
- Base para fine-tuning con datos propios: partiendo de este checkpoint se puede reentrenar con `lerobot-train` sobre un dataset distinto del mismo robot para adaptar la política a nuevas posiciones de objeto o iluminación.
- Demostración de recogida pick-and-place: aunque la tarea declarada es una sola, el chunking de acciones permite evaluar la estabilidad de la política en secuencias de agarre y transporte en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,2 GB de repositorio), la huella en memoria es muy reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. El autor entrena con `--policy.device=cuda`, pero no indica modelo de GPU.
- Cabe en GPU consumer: sí, por el tamaño del modelo (51,6 M de parámetros); no se dispone de cifras oficiales de VRAM mínima.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura se realiza a 30 FPS según el dataset, pero no se reporta latencia de inferencia ni throughput medido.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de ACT comparables ni políticas alternativas (Diffusion Policy, VQ-BeT, etc.) con datos de rendimiento que permitan una comparación rigurosa. Se puede señalar únicamente que existen otras políticas LeRobot del mismo método, pero sin resultados publicados no es posible comparar parámetros, contexto ni rendimiento.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito en robot real; el rendimiento es desconocido.
- Tarea única y dataset reducido: entrenado solo para "Grab the black cube" con 50 episodios y 44.947 frames; la generalización a otras tareas, objetos o posiciones no está demostrada.
- Dependencia del hardware: la política asume un robot `so_follower` con dos cámaras concretas (`overhead` y `wrist`) y nombres de observación específicos; cambiar la configuración requiere reentrenar o adaptar las claves.
- Sensibilidad a condiciones de captura: al ser aprendizaje por imitación, es probable que varíe con iluminación, posiciones de objeto o distracciones, aunque el autor no documenta estos factores.
- Sin información sobre sesgos: no se reportan sesgos conocidos ni análisis de robustez.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erróneas o inseguras en el robot; se recomienda supervisión y límites de seguridad físicos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset `yhks/my_task` de forma independiente.
- Idiomas: no aplica; el modelo no procesa lenguaje natural, solo la instrucción de tarea como texto de configuración.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay comunidad ni validación externa que respalde su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhks/act_my_task_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/yhks/my_task
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yhks/my_task
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
