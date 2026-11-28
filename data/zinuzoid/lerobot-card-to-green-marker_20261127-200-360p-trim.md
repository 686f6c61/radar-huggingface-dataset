# zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim

## Resumen

Este repositorio contiene una política de imitación entrenada con el método Action Chunking with Transformers (ACT), publicada por el usuario `zinuzoid` bajo el paraguas de LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras (`overhead` y `gripper`) y del estado articular del robot, predice vectores de acción de 7 dimensiones para un brazo `so101_suction_follower`. El modelo resuelve una tarea concreta de manipulación: mover una tarjeta hasta un marcador verde y pasarla.

El modelo es un fine-tune del checkpoint `zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim`, entrenado sobre un dataset propio de 200 episodios y 57.113 fotogramas a 30 FPS. Con 51.671.687 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo pequeño orientado a inferencia en tiempo real junto al robot, no a despliegue como servicio de texto.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento, rollout y evaluación), y como punto de partida para quien quiera reentrenar o adaptar la política a su propia celda robótica. La licencia Apache 2.0 facilita su reutilización, aunque la utilidad práctica está ligada al hardware y a la tarea específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.1 |
| Tipo de robot | so101_suction_follower |
| Camaras | overhead, gripper |
| Entrada observation.state | STATE, shape (8,) |
| Entrada observation.images.overhead | VISUAL, shape (3, 360, 640) |
| Entrada observation.images.gripper | VISUAL, shape (3, 360, 640) |
| Salida action | ACTION, shape (7,) |
| Dataset de entrenamiento | zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim |
| Episodios | 200 |
| Fotogramas | 57.113 |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Batch size | 24 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Modelo base | zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y estabiliza el control. La política combina un codificador visual que procesa las dos imágenes de 360x640 con un transformer que fusiona la observación del estado (8 dimensiones) y genera una secuencia de acciones de 7 dimensiones. El entrenamiento se realizó sobre 200 episodios teleoperados (57.113 fotogramas a 30 FPS) con dos tareas descritas: "Move a card to green marker" y "Pass a card".

La configuración de entrenamiento documentada es de 20.000 pasos, batch de 24, AdamW con learning rate 1e-05 y semilla 1000, ejecutado con LeRobot 0.7.1. El modelo parte del checkpoint de 170 pasos del mismo autor y se ha afinado sobre el dataset de 200 episodios. No se documentan detalles sobre aumentos de datos, normalización de acciones ni técnicas adicionales como decodificación especulativa; la model card no aporta información sobre la composición exacta de los datos más allá del número de episodios y la tasa de fotogramas.

## Capacidades

- Control visomotor de un brazo robótico `so101_suction_follower` con ventosa.
- Predicción de acciones de 7 dimensiones a partir de dos cámaras y del estado articular.
- Ejecución de la tarea "Move a card to green marker" y "Pass a card".
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Inferencia en tiempo real mediante `lerobot-rollout` con estrategia `base`.
- Reentrenamiento y fine-tune mediante `lerobot-train` desde el checkpoint base.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place con tarjetas: la política mueve una tarjeta hasta un marcador verde; es adecuada porque ha sido entrenada específicamente sobre esa tarea y ese robot, con 200 episodios de demostración.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia reproducible para validar la instalación de LeRobot, la calibración de cámaras y el flujo `lerobot-train` → `lerobot-rollout`.
- Fine-tune sobre una tarea nueva del mismo robot: al partir del checkpoint de 170 pasos, se puede reentrenar con un dataset propio y comparar curvas de éxito frente al modelo de 200 pasos.
- Docencia y divulgación en robótica: el tamaño reducido (0,2 GB, 51,7 M de parámetros) y la licencia Apache 2.0 permiten usarlo en laboratorios con hardware modesto.
- Evaluación de robustez ante cambios de iluminación o posición: al ser una política puramente visomotora, permite medir la degradación del éxito al variar las condiciones de la celda.
- Integración en un banco de pruebas de políticas ACT: comparar esta política con otras variantes del mismo autor o con políticas entrenadas con distintos números de episodios.
- Generación de datos sintéticos de evaluación: ejecutar rollouts con `--duration` acotado para recoger trayectorias y analizar el comportamiento del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tareas, ensayos, éxitos ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamaño del modelo (51,7 M de parámetros, 0,2 GB de pesos), es previsible que quepa en GPUs de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles; la model card solo menciona `--policy.device=cuda` para entrenamiento, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del checkpoint sugiere que sí, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de los datos de entrenamiento es de 30 FPS, pero no se publica la latencia de inferencia real.
- Hardware robótico requerido: robot `so101_suction_follower`, dos cámaras (`overhead` y `gripper`) configuradas a 640x480 y 30 FPS en el ejemplo de rollout.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim | 51.671.687 | no aplica | Manipulacion con tarjeta (ACT) | apache-2.0 | Hugging Face |
| zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim | no disponible | no aplica | Manipulacion con tarjeta (ACT) | apache-2.0 | Hugging Face (modelo base) |
| Otras politicas ACT de LeRobot | no disponible | no aplica | Manipulacion diversa | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la informacion proporcionada. La comparación se limita a parámetros, licencia y disponibilidad; el checkpoint de 170 pasos es el modelo base declarado y no se documentan sus métricas.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en la tarea.
- La política está acoplada al robot `so101_suction_follower` y a la configuración de cámaras `overhead` y `gripper`; no es transferible a otro hardware sin reentrenamiento.
- El dominio de la tarea es muy estrecho: mover una tarjeta a un marcador verde y pasarla; no generaliza a otras manipulaciones.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta tool calling ni agentes.
- Riesgo de sobreajuste a las condiciones de la celda de entrenamiento (iluminación, posiciones, fondo); no se documenta robustez ante cambios.
- No se documentan sesgos, pero al ser una política entrenada con datos teleoperados de un operador, puede heredar sesgos de ejecución de ese operador.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace recomendable validar en el hardware destino antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se documentan requisitos de calibración, límites de seguridad del robot ni protocolos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim
- Modelo base: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261127-170-360p-trim
- Dataset de entrenamiento: https://huggingface.co/datasets/zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinuzoid/lerobot-card-to-green-marker_20261127-200-360p-trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
