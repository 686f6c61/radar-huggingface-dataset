# WZepher/act_so101_smoke_wzepher

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `WZepher/act_so101_smoke_wzepher`, es una política entrenada con LeRobot para el robot `so_follower` (SO-101), con una única cámara de muñeca y un estado de 6 dimensiones.

Se trata de un modelo específico para la tarea "Put the eraser into the pencil case", entrenado sobre un dataset propio de 32 episodios y 9.482 fotogramas a 30 FPS. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero orientado a inferencia en tiempo real sobre hardware de consumo.

Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación/experimentación que ilustra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue). La configuración de entrenamiento (100 pasos, batch 8) sugiere una ejecución de tipo "smoke test" más que un entrenamiento convergido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes) con un transformer que mapea observaciones (estado del robot de 6 dimensiones e imagen de muñeca de 3x480x640) a chunks de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación central del método: reduce el horizonte efectivo de error y permite un control más suave. El modelo consume `observation.state` (6,) y `observation.images.wrist` (3, 480, 640), y produce `action` (6,).

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `WZepher/so101_my_task_50ep_20261128_163705` (32 episodios, 9.482 fotogramas, 30 FPS, tarea "Put the eraser into the pencil case"). La configuración reportada es de solo 100 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni uso de RLHF/DPO (no aplica en aprendizaje por imitación).

## Capacidades

- Control robótico de manipulación: predice acciones de 6 grados de libertad para el robot SO-101 (`so_follower`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones para movimiento suave y estable.
- Percepción visual monocámara (muñeca) a 480x640.
- Ejecución de una tarea específica: introducir una goma de borrar en un estuche.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Reproducción de la tarea entrenada: ejecutar la política en un SO-101 real con `lerobot-rollout` para insertar la goma en el estuche, usando la cámara de muñeca como única entrada visual.
- Validación de pipeline de LeRobot: servir como prueba de humo (smoke test) del flujo completo de grabación, entrenamiento y despliegue antes de entrenar políticas más largas.
- Base para fine-tuning: punto de partida para reentrenar con más episodios o pasos sobre la misma tarea y robot.
- Benchmark de infraestructura: medir latencia y throughput de inferencia de ACT en hardware concreto (GPU de consumo) con un modelo de 51,7 M de parámetros.
- Docencia y divulgación: ejemplo didáctico de aprendizaje por imitación con ACT y LeRobot en entornos académicos.
- Experimentación con variaciones de cámara/estado: evaluar la sensibilidad de la política a cambios de iluminación, posiciones de objetos o distracciones en la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos safetensors (repo de 0,2 GB), la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el entrenamiento se realizó con `--policy.device=cuda`. No se especifica modelo concreto.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles. La captura se realiza a 30 FPS (640x480), pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_smoke_wzepher | 51,7 M | no aplica | Manipulación SO-101 (tarea única) | apache-2.0 | Hugging Face |
| ACT (paper original, 2304.13705) | no disponible | no aplica | Manipulación genérica (ALOHA) | no disponible | Paper/repo |
| Otras políticas LeRobot (p. ej. Diffusion Policy, VQ-BeT) | no disponible | no aplica | Manipulación con LeRobot | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento muy corto: 100 pasos con batch 8 y lr 1e-5, lo que sugiere un modelo no convergido o de prueba; el rendimiento real en robot es incierto.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la tarea se complete de forma fiable.
- Especificidad extrema: entrenado para una sola tarea, un solo robot (`so_follower`) y una sola cámara (`wrist`); no generaliza a otras tareas, robots ni configuraciones de cámara.
- Dataset pequeño: 32 episodios y 9.482 fotogramas; propenso a sobreajuste y a fallos ante variaciones de posición, iluminación o distracciones.
- Dependencia de calibración: requiere que el robot y las cámaras estén calibrados y que los nombres de cámara coincidan con las claves de observación (`observation.images.wrist`).
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Licencia apache-2.0: permite uso comercial, pero sin garantías; verificar que el dataset asociado y el hardware cumplan los requisitos de seguridad.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje; no debe usarse para generación de texto, código o razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/WZepher/act_so101_smoke_wzepher
- Dataset de entrenamiento: https://huggingface.co/datasets/WZepher/so101_my_task_50ep_20261128_163705
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=WZepher/so101_my_task_50ep_20261128_163705
