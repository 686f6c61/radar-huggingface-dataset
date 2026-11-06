# zaqzulkan/act_gluestick_v2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, `zaqzulkan/act_gluestick_v2`, es una política entrenada con LeRobot sobre el robot `so_follower` para una tarea específica: coger una barra de pegamento y colocarla sobre un libro rojo.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 M) y consume como entrada el estado articular del robot (vector de 6 dimensiones) y una imagen de una cámara en la muñeca de resolución 480x640, produciendo como salida un vector de acción de 6 dimensiones. Se entrenó durante 30.000 pasos con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, usando el dataset `zaqzulkan/gluestick_v2` con 69 episodios y 37.202 frames a 30 FPS.

Es relevante como ejemplo de política de robótica de código abierto lista para desplegar con LeRobot, con licencia Apache 2.0, aunque su alcance es muy limitado: está especializada en una única tarea y un único tipo de robot, y no se han publicado resultados de evaluación en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.wrist` (3, 480, 640) |
| Salida | `action` (6,) |
| Tipo de robot | `so_follower` |
| Cámaras | `wrist` |
| Dataset de entrenamiento | `zaqzulkan/gluestick_v2` (69 episodios, 37.202 frames, 30 FPS) |
| Tarea | "Pick up the glue stick and place it on the red book" |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Seed | 1000 |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repo | 0.2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice chunks de acciones (secuencias cortas de posiciones articulares futuras) en lugar de una sola acción por paso. La arquitectura combina un codificador visual (para procesar la imagen de la cámara de muñeca), un codificador del estado propioceptivo (vector de 6 dimensiones) y un decodificador transformer que genera el chunk de acciones. Esta formulación reduce el error de compounding y permite un control más suave, tal como se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 69 episodios de teleoperación (37.202 frames a 30 FPS) de la tarea de coger el pegamento y depositarlo en el libro rojo. Se usaron 30.000 pasos con batch size 8, AdamW y learning rate 1e-5. No se especifica en la información disponible si se aplicaron técnicas de aumento de datos, RLHF/DPO (no aplicables a este tipo de modelo) ni decodificación especulativa. No se detalla la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para el robot `so_follower`.
- Aprendizaje por imitación: reproduce la tarea "coger la barra de pegamento y colocarla sobre el libro rojo" a partir de demostraciones teleoperadas.
- Predicción de chunks de acciones: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Percepción visual monocámara: utiliza una única cámara en la muñeca (`wrist`) a 480x640.
- Entrada propioceptiva: consume el estado articular del robot (6 dimensiones).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Automatización de una tarea de pick-and-place concreta: el modelo ejecuta la secuencia de coger el pegamento y colocarlo en el libro rojo sobre un robot SO-100/SO-101 follower, adecuado para demostraciones de laboratorio o prototipos de bajo coste.
- Investigación en aprendizaje por imitación: sirve como política de referencia para comparar variantes de ACT, ajustar hiperparámetros o evaluar técnicas de aumento de datos en robótica de mesa.
- Docencia y formación en robótica: permite a estudiantes desplegar una política entrenada con LeRobot y entender el flujo completo (grabación, entrenamiento, rollout) con hardware asequible.
- Base para fine-tuning en tareas similares: al estar entrenada para manipular objetos pequeños sobre superficies planas, puede servir como inicialización para tareas análogas con pocos datos adicionales.
- Pruebas de integración de pipelines LeRobot: útil para validar la CLI `lerobot-rollout`, la calibración de cámaras y la configuración de robots `so_follower` en un entorno controlado.
- Benchmark interno de latencia y robustez: permite medir el rendimiento de ACT en hardware consumer y evaluar la sensibilidad a cambios de iluminación o posición de objetos en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros, el modelo es muy ligero y probablemente quepa en GPUs consumer de gama baja, pero no se confirma.
- GPU recomendadas: no disponible; LeRobot soporta ejecución en CUDA (`--policy.device=cuda`), pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento), con soporte de CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zaqzulkan/act_gluestick_v2` | 51,7 M | no aplica | Pick-and-place de pegamento | Apache 2.0 | Hugging Face |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | Manipulación genérica | no disponible | Paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no aplica | Manipulación | varía | Hugging Face / LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para una tarea concreta ("coger el pegamento y colocarlo en el libro rojo") y un robot concreto (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez, por lo que se desconoce su fiabilidad real.
- Dependencia de la cámara de muñeca: requiere una configuración de cámara específica (`wrist`, 480x640) y una calibración correcta; cambios de iluminación, posición de objetos o fondo pueden degradar el rendimiento.
- Dataset pequeño: 69 episodios y 37.202 frames son limitados, lo que aumenta el riesgo de sobreajuste y de baja generalización.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje y no puede usarse para tareas de texto, código o agentes.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las dependencias de LeRobot y del dataset asociado.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras en el robot si el entorno difiere del de entrenamiento.
- No se especifican sesgos conocidos ni restricciones adicionales de uso comercial más allá de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zaqzulkan/act_gluestick_v2
- Dataset: https://huggingface.co/datasets/zaqzulkan/gluestick_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zaqzulkan/gluestick_v2
