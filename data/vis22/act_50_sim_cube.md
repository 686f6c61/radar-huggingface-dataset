# vis22/act_50_sim_cube

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación en tareas de manipulación robótica. Este repositorio concreto, `vis22/act_50_sim_cube`, contiene una política entrenada con LeRobot para el robot simulado `piper_mujoco` que resuelve una tarea específica: coger un cubo y depositarlo en una papelera.

El modelo tiene 51.670.663 parámetros y se distribuye en formato safetensors (0,2 GB), bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que consume el estado del robot (7 dimensiones) y dos cámaras RGB de 480x640 (global y de pinza) para emitir comandos de acción de 7 dimensiones a 30 FPS.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de imitación con LeRobot, desde un dataset de 50 episodios y 29.575 frames hasta un checkpoint ejecutable con `lerobot-rollout`. Es útil para quien quiera validar el flujo de entrenamiento o como línea base en tareas de pick-and-place simulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por la configuración ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `piper_mujoco` (simulado) |
| Cámaras de entrada | `cam_global`, `cam_gripper` (3, 480, 640) |
| Entrada de estado | `observation.state` (7,) |
| Salida de acción | `action` (7,) |
| Frecuencia de datos | 30 FPS |
| Librería | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

ACT emplea un transformer que combina observaciones visuales y propioceptivas con un mecanismo de predicción por chunks: en lugar de regresar una única acción, genera un bloque de acciones futuras, lo que mitiga el error compounding típico de las políticas paso a paso. El modelo integra dos cámaras RGB (global y de pinza) junto con el vector de estado del robot de 7 dimensiones, y produce acciones de 7 dimensiones.

El entrenamiento se realizó sobre el dataset `vis22/50_piper_sim_cube`: 50 episodios, 29.575 frames a 30 FPS, con la tarea "pick the cube and place it in the bin". La configuración reportada incluye 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.6.1. No se documenta el número de tokens de entrenamiento ni el uso de RLHF/DPO, ya que no aplica a este paradigma de imitación supervisada.

## Capacidades

- Manipulación robótica visomotora: ejecuta la tarea pick-and-place de un cubo en una papelera en el simulador `piper_mujoco`.
- Fusión multimodal de dos cámaras RGB (global y de pinza) con el estado propioceptivo del robot.
- Predicción de chunks de acción para mayor estabilidad en la ejecución.
- Compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Línea base de pick-and-place simulado: sirve para comparar nuevas políticas ACT o variantes (p. ej. Diffusion Policy) sobre la misma tarea y dataset en MuJoCo.
- Validación de pipelines de imitación con LeRobot: permite reproducir el flujo completo desde la grabación de datos hasta el rollout, útil para formación de equipos.
- Prototipado de control visomotor: se puede integrar en un bucle de control a 30 FPS con dos cámaras para probar latencias y estabilidad de chunks de acción.
- Benchmark interno de simulación: al ser un checkpoint pequeño (0,2 GB) y con licencia Apache 2.0, es adecuado para pruebas de regresión en infraestructura de robótica.
- Estudio de transferencia sim-a-real: aunque entrenado en simulación, puede servir como punto de partida para fine-tuning en un robot Piper real con datos propios.
- Docencia y demostraciones: ejemplo minimalista y reproducible de aprendizaje por imitación con arquitectura transformer y dataset público.
- Evaluación de robustez ante variaciones: útil para medir degradación al cambiar posiciones del cubo, iluminación o distracciones en el simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación (tasas de éxito, número de ensayos) para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, 0,2 GB en safetensors) es esperable que quepa en GPUs consumer con holgura, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Cualquier GPU compatible con CUDA y LeRobot debería ser suficiente para inferencia; el entrenamiento se realizó con `--policy.device=cuda`.
- ¿Cabe en GPU consumer? Muy probablemente sí (RTX 3060 o superior), pero no está confirmado en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; la política está pensada para operar a 30 FPS según la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vis22/act_50_sim_cube` (este) | 51,7 M | no aplica | Pick-and-place simulado (`piper_mujoco`) | Apache 2.0 | Hugging Face, LeRobot |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | Manipulación con chunks de acción | según implementación | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible | no aplica | Manipulación robótica | según repositorio | Hugging Face, LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (`piper_mujoco`); el rendimiento en un robot físico no está validado y puede degradarse por diferencias de dinámica, calibración y percepción.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar su fiabilidad.
- Dataset pequeño (50 episodios, 29.575 frames) y una única tarea; baja diversidad de posiciones, iluminación y distractores.
- Dependencia estricta de los nombres y formatos de observación (`observation.state`, `observation.images.cam_global`, `observation.images.cam_gripper`); cualquier cambio en cámaras o resolución requiere reentrenamiento.
- Riesgo de sobreajuste al entorno simulado y a la configuración de cámaras del dataset.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no soporta instrucciones en lenguaje natural más allá de la etiqueta de tarea.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la naturaleza simulada desaconsejan su despliegue directo en producción sin validación adicional.
- Posibles sesgos derivados de la distribución de datos de teleoperación (posiciones iniciales, velocidades, estilo del operador).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/act_50_sim_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/50_piper_sim_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/50_piper_sim_cube
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
