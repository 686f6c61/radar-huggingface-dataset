# zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) mediante la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación para ejecutar tareas manipulativas concretas sobre un robot de tipo `so101_suction_follower`, equipado con ventosa y dos cámaras (vista cenital y de pinza). Concretamente, la política resuelve dos tareas: mover una tarjeta hasta un marcador verde y pasarla de una posición a otra.

Técnicamente no es un modelo de lenguaje: es un transformer pequeño (51,67 millones de parámetros) que mapea observaciones multimodales (estado articular de 8 dimensiones y dos imágenes RGB de 360x640) a un vector de acción de 7 dimensiones. Su relevancia es práctica: demuestra el flujo completo de LeRobot para entrenar, publicar y desplegar políticas de imitación en hardware asequible, y sirve como punto de partida para reentrenar o afinar sobre el mismo robot.

El modelo se publicó el 27 de noviembre de 2026, deriva de un checkpoint anterior del mismo autor y se distribuye con licencia Apache 2.0. No incluye resultados de evaluación en robot real ni métricas de éxito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con horizonte de acción fijo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada: estado | `observation.state`, shape `(8,)` |
| Entrada: visión | `observation.images.overhead` y `observation.images.gripper`, shape `(3, 360, 640)` |
| Salida: acción | `action`, shape `(7,)` |
| Tipo de robot | `so101_suction_follower` |
| Cámaras | `overhead`, `gripper` |
| Tamaño del repositorio | 0,2 GB |
| Librería | lerobot 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y estabiliza la ejecución en tareas de manipulación. La política combina un codificador visual (procesa las dos cámaras a 360x640) con un transformer que atiende conjuntamente a las imágenes y al estado articular de 8 dimensiones, y emite una acción de 7 dimensiones por paso. El entrenamiento se realizó con 50.000 pasos, batch de 24, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000, usando LeRobot 0.7.1.

El dataset de entrenamiento (`zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim`) contiene 110 episodios, 33.764 fotogramas a 30 FPS, con dos tareas anotadas: "Move a card to green marker" y "Pass a card". El modelo parte del checkpoint `zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim`, de modo que este repositorio es un ajuste fino adicional sobre una política previa del mismo autor. No se documentan datos de RLHF, DPO ni aumentos de datos.

## Capacidades

- Control robótico por imitación para manipulación con ventosa: mueve una tarjeta hasta un marcador verde y la pasa entre posiciones.
- Fusión multimodal de dos cámaras RGB (cenital y de pinza) con el estado articular del robot.
- Predicción de acciones en chunks de 7 dimensiones, adecuada para control continuo a 30 FPS.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con estrategia `base`.
- Reentrenamiento y ajuste fino sobre el mismo robot y dataset mediante `lerobot-train`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: su ámbito es exclusivamente motor.

## Casos de uso

- Automatización de picking y colocación de tarjetas: la política mueve una tarjeta a un marcador verde, útil como demostración de flujo completo de imitación en un robot de bajo coste.
- Transferencia de objetos entre posiciones: la tarea "Pass a card" permite integrar la política en una celda de clasificación sencilla con ventosa.
- Base para reentrenamiento con nuevos objetos o posiciones: al partir de un checkpoint previo, sirve como inicialización para datasets propios del mismo robot `so101_suction_follower`.
- Validación de pipelines de LeRobot en producción: el comando `lerobot-rollout` con `--duration` permite ejecutar la política de forma controlada y medir tiempos de ciclo.
- Prototipado de investigación en aprendizaje por imitación: con 110 episodios y 33.764 fotogramas, es un caso reproducible para estudiar sensibilidad a iluminación y posiciones.
- Docencia y demostraciones de robótica: el tamaño reducido (0,2 GB) y la licencia Apache 2.0 facilitan su uso en laboratorios y cursos sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (trials, éxitos ni tasa de éxito) para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,67 millones de parámetros en safetensors, el peso de los parámetros ronda los 0,2 GB en FP32, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con soporte CUDA es suficiente por el tamaño del modelo, y el comando de entrenamiento documentado usa `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se documenta una GPU mínima concreta.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el dataset se capturó a 30 FPS, pero no se publican métricas de latencia de inferencia ni de tiempo de ciclo en robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, zinuzoid) | 51,67 M | no aplica | Manipulación con ventosa (mover/pasar tarjeta) | Apache 2.0 | Hugging Face |
| zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim | no disponible | no aplica | Misma familia de tareas (checkpoint base) | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | no aplica | Manipulación genérica por imitación | variable | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas políticas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay evaluación en robot real publicada: se desconoce la tasa de éxito de las tareas "Move a card to green marker" y "Pass a card".
- La política está ligada a un robot concreto (`so101_suction_follower`) y a dos cámaras con nombres y resoluciones específicos; cambiar el hardware o la disposición de cámaras invalida su uso directo.
- Sensibilidad esperable a cambios de iluminación, posiciones de objetos y distracciones; la model card no documenta robustez frente a estas variaciones.
- Dataset pequeño (110 episodios, 33.764 fotogramas) y centrado en dos tareas; el riesgo de sobreajuste a las condiciones de captura es alto.
- No es un modelo de lenguaje: no procesa texto libre, no soporta tool calling ni razonamiento, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim
- Modelo base: https://huggingface.co/zinuzoid/lerobot-card-to-green-marker_20261125-100-360p-trim
- Dataset de entrenamiento: https://huggingface.co/datasets/zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zinuzoid/lerobot-card-to-green-marker_20261126-110-360p-trim
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
