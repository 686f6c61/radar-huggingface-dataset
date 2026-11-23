# vis22/act_30_sim_cube

## Resumen

`vis22/act_30_sim_cube` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), publicada en Hugging Face Hub por el usuario `vis22` y entrenada con el framework LeRobot. El modelo resuelve una tarea robótica concreta de manipulación —coger un cubo y depositarlo en una papelera— en un entorno simulado de MuJoCo con un robot Piper. ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de control fino.

El modelo es pequeño (51,67 millones de parámetros, repo de 0,2 GB) y está pensado como artefacto reproducible de un pipeline de imitation learning: 30 episodios teleoperados, 17.713 frames a 30 FPS y 50.000 pasos de entrenamiento. No es un modelo de propósito general ni un LLM: es una política visuomotora específica para una tarea y un robot.

Su relevancia es práctica para quien trabaja con LeRobot: sirve como referencia de extremo a extremo (dataset → entrenamiento → rollout) y como punto de partida para replicar el flujo con otros robots o tareas. La licencia Apache 2.0 permite reutilización y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política por chunk; entrada de observaciones, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo robótico, sin salida lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de aprendizaje por imitación que mapea observaciones (estado articular de 7 dimensiones más dos cámaras RGB de 480x640) a chunks de acciones de 7 dimensiones. La innovación central del método es predecir un horizonte corto de acciones de forma conjunta, lo que mitiga el problema de compounding errors típico de las políticas paso a paso. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.1: 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `vis22/30_piper_sim_cube` (30 episodios, 17.713 frames, 30 FPS, tarea "pick the cube and place it in the bin"). No se documentan aumentos de datos, RLHF/DPO ni detalles sobre composición del dataset más allá del número de episodios y frames.

## Capacidades

- Control visuomotor de un brazo robótico Piper en simulación MuJoCo para la tarea de pick-and-place de un cubo.
- Entrada multimodal: estado articular `(7,)` y dos imágenes RGB (`cam_global`, `cam_gripper`) de 480x640.
- Salida de acciones continuas de 7 dimensiones por chunk.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere reward shaping.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento textual.

## Casos de uso

- Replicación de pipelines de imitation learning: usar el modelo como referencia para validar la instalación de LeRobot y el flujo completo dataset → entrenamiento → rollout en simulación.
- Benchmark interno de políticas ACT: comparar variantes entrenadas con más episodios o distintos hiperparámetros contra esta línea base de 50.000 pasos.
- Prototipado de tareas pick-and-place: adaptar el dataset y reentrenar para objetos o contenedores distintos manteniendo la arquitectura y configuración.
- Docencia y formación: ejemplo didáctico de entrenamiento con 30 episodios y 17.713 frames para explicar ACT, chunking de acciones y evaluación en simulación.
- Pruebas de integración hardware-software: validar drivers de cámara OpenCV, calibración y puertos del robot Piper antes de desplegar en hardware real.
- Generación de datos sintéticos de evaluación: ejecutar rollouts controlados en MuJoCo para medir robustez frente a posiciones iniciales del cubo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; 51,67 M parámetros caben holgadamente en GPUs consumer (menos de 1 GB en fp32 para los pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4090; también ejecutable en CPU para pruebas.
- Cabe en GPU consumer: sí, prácticamente en cualquier modelo moderno; el cuello de botella es el renderizado MuJoCo y las cámaras, no la red.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con PyTorch como backend; no se documentan exportaciones a ONNX, TensorRT o llama.cpp.
- Latencia y throughput: no disponibles; dependen del entorno MuJoCo y del hardware de captura a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `vis22/act_30_sim_cube` | 51,67 M | Pick-and-place de cubo en Piper/MuJoCo | apache-2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (generales) | ~50 M típicamente | Tareas diversas según dataset | apache-2.0 | Hugging Face Hub / LeRobot |
| Políticas Diffusion Policy | no disponible | Manipulación visuomotora | variable | Repos académicos |
| Políticas VQ-BeT | no disponible | Manipulación visuomotora | variable | Repos académicos |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación MuJoCo (`piper_mujoco`); el transfer a hardware real no está validado y probablemente requiera ajuste fino o domain randomization.
- Una sola tarea ("pick the cube and place it in the bin") y 30 episodios: cobertura limitada de posiciones, iluminación y distractores.
- Sin resultados de evaluación publicados; no hay tasa de éxito medida.
- Dependencia de nombres y formas exactas de observación (`cam_global`, `cam_gripper`, 480x640, estado `(7,)`); cambios en la configuración de cámaras rompen la política.
- Riesgo de sobreajuste al dataset pequeño (17.713 frames) y a la semilla 1000.
- Sesgos y alucinaciones en el sentido lingüístico no aplican; el riesgo equivalente es fallo silencioso ante distribuciones fuera del dataset.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre seguridad física en robots reales.
- No incluye instrucciones de seguridad para operar el robot; el rollout debe supervisarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/act_30_sim_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/30_piper_sim_cube
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/30_piper_sim_cube
