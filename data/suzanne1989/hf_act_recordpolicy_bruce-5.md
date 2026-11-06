# suzanne1989/hf_act_recordpolicy_bruce-5

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No se trata de un modelo de lenguaje, sino de una política visomotora que asigna observaciones (estado del robot y dos cámaras) a comandos de acción de un robot seguidor de tipo `so_follower`. El autor, suzanne1989, la ha entrenado y publicado mediante la librería LeRobot de Hugging Face.

La política resuelve una única tarea concreta de manipulación: "Grab the green duplo". Se entrenó con el dataset `suzanne1989/record-bruce`, compuesto por 120 episodios y 38.452 fotogramas grabados a 30 FPS mediante teleoperación. El checkpoint ocupa 3,7 GB y contiene 51.668.614 parámetros en formato safetensors, con licencia Apache 2.0.

Su relevancia es acotada: es un ejemplo práctico de flujo de trabajo de aprendizaje por imitación en robótica real con LeRobot 0.7.0, útil para quien quiera reproducir el pipeline de entrenamiento y despliegue, pero no es un modelo generalista ni dispone de resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; ventana de observación por paso, no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,7 GB) |

| Parametro adicional | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `static` (3x480x640 cada una) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de accion | `action` de forma `(6,)` |
| Dataset de entrenamiento | `suzanne1989/record-bruce` (120 episodios, 38.452 fotogramas, 30 FPS) |
| Tarea | "Grab the green duplo" |
| Pasos de entrenamiento | 15.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acción (action chunks) en lugar de un único paso, lo que reduce el error de composición y suele mejorar la tasa de éxito en tareas de manipulación. La política consume el estado articular del robot (vector de 6 dimensiones) y dos flujos visuales de 480x640 píxeles procedentes de una cámara en la muñeca y otra estática, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.0 sobre 120 episodios teleoperados y 38.452 fotogramas a 30 FPS, durante 15.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05. La model card no detalla la composición del dataset, el uso de RLHF/DPO (no aplicable en este paradigma), ni innovaciones adicionales como decodificación especulativa. Tampoco se especifican la longitud de los chunks de acción ni la configuración interna del transformer.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: recoger un bloque Duplo verde.
- Política de imitación entrenada desde teleoperación, sin refuerzo ni instrucciones en lenguaje natural.
- Entrada multimodal: estado articular de 6 dimensiones más dos imágenes RGB de 480x640 (muñeca y cámara estática).
- Salida de acciones continuas de 6 dimensiones a 30 FPS.
- Despliegue mediante el comando `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del pipeline de imitación con LeRobot: servir como referencia para entrenar una política ACT propia partiendo de un dataset teleoperado y comparar hiperparámetros (15.000 pasos, batch 8, lr 1e-05).
- Recogida de un objeto concreto en un robot SO-100/SO-101 (`so_follower`): la política está entrenada para la tarea "Grab the green duplo" y puede ejecutarse con `lerobot-rollout` durante un tiempo acotado.
- Docencia y talleres de robótica: ejemplo completo y ligero (51,7 M de parámetros) para explicar de extremo a extremo la grabación de datos, el entrenamiento y el despliegue en hardware real.
- Validación de setups de cámaras: permite comprobar que la configuración `wrist` y `static` a 640x480 y 30 FPS funciona antes de grabar un dataset mayor.
- Punto de partida para fine-tuning: reentrenar sobre un dataset propio con la misma estructura de observaciones para adaptar la política a otra tarea de picking.
- Pruebas de integración con el stack de LeRobot 0.7.0: verificar compatibilidad de versiones, rutas de checkpoints y comandos CLI en un entorno controlado.
- Benchmark interno de latencia y throughput en el robot objetivo antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros el checkpoint en safetensors ocupa 3,7 GB en disco, pero el requisito de VRAM no se detalla.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamaño de parámetros es plausible, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (LeRobot) sobre el robot `so_follower` con dos cámaras OpenCV; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El bucle de control opera a 30 FPS según el dataset, pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suzanne1989/hf_act_recordpolicy_bruce-5 | 51.668.614 | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face |
| suzanne1989/hf_act_recordpolicy_bruce | no disponible | no aplica | sin evaluación publicada | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Grab the green duplo") y un único tipo de robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real.
- Requiere exactamente las mismas claves de observación (`observation.state`, `observation.images.wrist`, `observation.images.static`) y la misma configuración de cámaras (640x480, 30 FPS).
- Dataset pequeño (120 episodios, 38.452 fotogramas): riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; los sesgos lingüísticos no aplican, pero puede heredar sesgos de las demostraciones teleoperadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su uso en producción sin validación propia.
- Dependencia de LeRobot 0.7.0; cambios de versión pueden romper la compatibilidad de carga del checkpoint.
- No hay información sobre cuantización ni sobre despliegue en hardware sin CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-5
- Repositorio hermano: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-bruce
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-bruce
