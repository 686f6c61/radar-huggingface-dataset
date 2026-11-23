# vis22/act_50K_sim_cube

## Resumen

`vis22/act_50K_sim_cube` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para una tarea concreta de manipulación robótica: coger un cubo y depositarlo en una papelera. El modelo lo publica el usuario `vis22` y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que consume el estado articular del robot y dos flujos de imagen (cámara global y cámara del gripper) y emite directamente un vector de acción de 7 dimensiones.

La arquitectura sigue el método ACT descrito en el paper arXiv:2304.13705, que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El checkpoint tiene 51.670.663 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y desplegable en hardware modesto.

Su relevancia es la de un artefacto reproducible de investigación: entrena sobre un dataset simulado de 30 episodios y 17.702 fotogramas a 30 FPS en el entorno `piper_mujoco`, y sirve como referencia para reproducir el pipeline de entrenamiento de ACT con LeRobot 0.6.1. No obstante, no incluye resultados de evaluación ni garantías de transferencia a un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana temporal definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; no procesa texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de `cam_global` y `cam_gripper`, ambas de 3×480×640) con un transformer que genera chunks de acciones de dimensión 7. La entrada de estado es un vector `observation.state` de forma `(7,)` y la salida es un vector `action` de forma `(7,)`. El objetivo es predecir secuencias cortas de acciones de forma conjunta, lo que mitiga el problema de la acumulación de errores típico de las políticas que predicen un único paso.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `vis22/piper_sim_cube`: 30 episodios, 17.702 fotogramas a 30 FPS, tarea "pick the cube and place it in the bin", en el entorno simulado `piper_mujoco`. La configuración reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de los episodios citados, ni uso de RLHF/DPO (no aplica a este tipo de política).

## Capacidades

- Control visomotor de un brazo robótico tipo Piper en simulación (MuJoCo) para la tarea de recoger un cubo y colocarlo en una papelera.
- Fusión de dos cámaras (global y gripper) con estado articular de 7 dimensiones.
- Predicción de chunks de acciones de 7 dimensiones, lo que aporta estabilidad temporal en la ejecución.
- Ejecución autónoma mediante `lerobot-rollout` con la estrategia `base`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni otras modalidades fuera de las dos cámaras indicadas.

## Casos de uso

- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (pasos, learning rate, batch size) sobre el mismo dataset simulado.
- Validación del pipeline de LeRobot: permite verificar la instalación, el formato de dataset y el flujo `lerobot-train` / `lerobot-rollout` antes de escalar a datos propios.
- Benchmark interno de imitación en simulación: al ser un modelo pequeño (51,7 M de parámetros) y un dataset acotado, es útil como línea base para medir mejoras de nuevas políticas en la misma tarea.
- Docencia y formación: ejemplo mínimo y reproducible de entrenamiento de una política visomotora con dos cámaras y estado articular, adecuado para cursos de robótica o aprendizaje por imitación.
- Pruebas de integración de hardware simulado: el entorno `piper_mujoco` permite ensayar el bucle de control y la sincronización de cámaras a 30 FPS antes de pasar a un robot real.
- Punto de partida para fine-tuning: al estar bajo Apache 2.0 y con pesos en safetensors, se puede reentrenar sobre un dataset propio de la misma tarea o de tareas similares de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la inferencia cabe holgadamente en GPUs de consumo. No se documenta una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint; no se detalla una lista oficial de GPUs validadas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con el robot `piper_mujoco` y cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput: no disponibles; dependen del hardware y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vis22/act_50K_sim_cube` | 51.670.663 | no aplica | Pick-and-place en `piper_mujoco` | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Tareas de manipulación diversas | variable | Hugging Face |
| Políticas tipo Diffusion Policy | no disponible | no aplica | Manipulación visomotora | variable | Hugging Face / repos de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a aspectos de disponibilidad y licencia.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación; se desconoce la tasa de éxito real de la política.
- Entrenada únicamente en simulación (`piper_mujoco`); no hay evidencia de transferencia a un robot físico.
- Dataset muy reducido (30 episodios, 17.702 fotogramas) y una sola tarea ("pick the cube and place it in the bin"), lo que limita la generalización a variaciones de objeto, iluminación o posiciones.
- Depende de dos cámaras concretas (`cam_global`, `cam_gripper`) con resolución 3×480×640; cambios en la configuración de cámaras invalidan la política.
- Riesgo de sobreajuste al entorno simulado y a la semilla de entrenamiento (1000); no se documenta validación cruzada.
- No aplica evaluación de sesgos lingüísticos ni de alucinación en el sentido de un LLM, pero sí existe riesgo de fallo silencioso en la ejecución motora.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías de robustez desaconseja su uso en producción sin validación previa.
- No se documentan cuantizaciones soportadas ni requisitos mínimos de hardware oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/act_50K_sim_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/piper_sim_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/piper_sim_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
