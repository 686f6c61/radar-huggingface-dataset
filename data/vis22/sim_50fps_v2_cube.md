# vis22/sim_50fps_v2_cube

## Resumen

`vis22/sim_50fps_v2_cube` es una política de imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. La desarrolla el usuario `vis22` y está entrenada para una única tarea robótica simulada: recoger un cubo y depositarlo en una papelera. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador visuomotor que mapea observaciones (estado articular de 7 dimensiones y dos cámaras RGB de 480x640) a acciones de 7 dimensiones.

El modelo tiene 51.670.663 parámetros y un peso de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real. Se entrenó sobre el dataset `vis22/sim_50fps_v2_cube`, compuesto por 50 episodios y 47.172 fotogramas capturados a 50 FPS en el simulador MuJoCo con el robot `piper_mujoco`.

Su relevancia es acotada: se trata de un artefacto de investigación o demostración, no de un modelo listo para producción. Resulta útil como referencia para entender el flujo de trabajo de LeRobot con ACT, para reproducir el pipeline de entrenamiento y para comparar configuraciones de imitación en entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Tipo de robot | `piper_mujoco` |
| Cámaras | `cam_global`, `cam_gripper` |
| Entrada de estado | `observation.state` de forma `(7,)` |
| Entrada visual | dos imágenes `(3, 480, 640)` |
| Salida de acción | `action` de forma `(7,)` |
| Tarea entrenada | "pick the cube and place it in the bin" |
| Dataset de entrenamiento | `vis22/sim_50fps_v2_cube` (50 episodios, 47.172 fotogramas, 50 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador de imágenes (habitualmente un ResNet preentrenado) con un transformer que fusiona las representaciones visuales y el estado propioceptivo para emitir secuencias de acciones. En este caso, el modelo consume dos vistas RGB de 480x640 y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05. El dataset consta de 50 episodios teleoperados en simulación MuJoCo a 50 FPS, con 47.172 fotogramas en total. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre demostraciones. No se especifica la composición exacta del dataset más allá de la tarea única y del robot simulado.

## Capacidades

- Control visuomotor para manipulación robótica: recoger un cubo y colocarlo en una papelera en el simulador `piper_mujoco`.
- Predicción de acciones en chunks, lo que aporta suavidad y consistencia temporal en la ejecución.
- Fusión de dos cámaras RGB (`cam_global` y `cam_gripper`) con el estado articular de 7 dimensiones.
- Ejecución en tiempo real mediante `lerobot-rollout` con estrategia base.
- Entrenamiento reproducible con `lerobot-train` y el tipo de política `act`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación en simulación: sirve como punto de partida para validar el pipeline de LeRobot con ACT y comparar curvas de entrenamiento con otras configuraciones.
- Docencia y formación en robótica: permite mostrar de forma práctica cómo se entrena una política visuomotora con dos cámaras y un estado de 7 dimensiones en MuJoCo.
- Benchmark interno de infraestructura: al ser ligero (0,2 GB, 51,7 M de parámetros), es útil para medir latencia y throughput de `lerobot-rollout` en distintas GPUs antes de escalar a políticas mayores.
- Prueba de integración de sensores: valida la sincronización de dos cámaras OpenCV a 640x480 y 30 FPS con el estado del robot `piper_mujoco`.
- Base para fine-tuning en tareas similares de pick-and-place: se puede reentrenar con un dataset propio manteniendo la arquitectura ACT y ajustando hiperparámetros.
- Demostración de referencia en documentación o tutoriales: ilustra el flujo completo desde la grabación de datos hasta el despliegue de la política en el robot simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros y 0,2 GB de pesos), la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente; se recomienda una RTX 3060 o superior para ejecutar a 30 FPS con dos cámaras.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: `lerobot-rollout` (estrategia base), `lerobot-train` para reentrenamiento, y el ecosistema LeRobot en general. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La captura se realiza a 30 FPS según el comando de ejemplo, aunque el dataset se grabó a 50 FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vis22/sim_50fps_v2_cube` (ACT) | 51,7 M | Estado 7D + 2 cámaras 480x640 | Pick-and-place en `piper_mujoco` | Apache 2.0 | Hugging Face Hub |
| Otras políticas ACT en LeRobot | no disponible | no disponible | Manipulación genérica | Apache 2.0 (habitual) | Hugging Face Hub |
| Políticas basadas en Diffusion Policy | no disponible | no disponible | Manipulación visuomotora | no disponible | Hugging Face Hub / repos académicos |
| Políticas basadas en VLA (p. ej. RT-2, OpenVLA) | cientos de millones a miles de millones | instrucciones en lenguaje + imágenes | Manipulación generalista | variable | Repos académicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado para una única tarea y un único robot simulado (`piper_mujoco`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito.
- Dependencia estricta de los nombres y formas de las observaciones (`observation.state`, `observation.images.cam_global`, `observation.images.cam_gripper`); cualquier cambio en la configuración de cámaras o en el orden del estado invalida la política.
- Entrenado en simulación a 50 FPS, pero el comando de despliegue de ejemplo usa cámaras a 30 FPS; puede haber desajuste entre distribución de entrenamiento y ejecución.
- Riesgo de sobreajuste al dataset reducido (50 episodios) y a la posición concreta del cubo y la papelera en el simulador.
- No apto para uso comercial en robótica real sin validación adicional; la licencia Apache 2.0 permite el uso comercial, pero la política no está validada fuera del simulador.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe confundirse con un modelo de propósito general.
- Sesgos conocidos: no documentados, pero al derivar de demostraciones teleoperadas puede reproducir sesgos del operador y del entorno simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/sim_50fps_v2_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/sim_50fps_v2_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/sim_50fps_v2_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
