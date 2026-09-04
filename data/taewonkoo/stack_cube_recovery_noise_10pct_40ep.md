# taewonkoo/stack_cube_recovery_noise_10pct_40ep

## Resumen

El modelo `taewonkoo/stack_cube_recovery_noise_10pct_40ep` es un fine-tuning de la política visión-lenguaje-acción (VLA) SmolVLA, desarrollado por Taewon Koo sobre el modelo base `lerobot/smolvla_base`. Su objetivo es controlar un robot de tipo `so_follower` para ejecutar la tarea de recoger un cubo de madera y colocarlo encima de un cubo de Rubik. El nombre del dataset indica que fue entrenado con un 10 % de ruido y 40 episodios, lo que sugiere una búsqueda de robustez frente a perturbaciones en la ejecución.

SmolVLA es una arquitectura compacta y eficiente diseñada para reducir el coste computacional de los modelos VLA y poder desplegarse en hardware de consumo. Este checkpoint concreto tiene un total de 450.046.176 parámetros y un tamaño de repositorio de 0,9 GB, lo que lo sitúa en la categoría de modelos ligeros para robótica. No se especifica la longitud de contexto ni soporte de idiomas, ya que se trata de una política orientada a acción más que a generación de lenguaje.

La relevancia del modelo radica en su integración con el ecosistema LeRobot de Hugging Face, que permite entrenar, evaluar y ejecutar políticas de aprendizaje por imitación de forma sencilla. Al estar licenciado bajo Apache-2.0, su uso, incluido el comercial, no presenta restricciones de licencia. Sin embargo, no se han publicado resultados de evaluación reales en el entorno físico, por lo que su eficacia práctica debe validarse experimentalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que, según el paper [2506.01844](https://huggingface.co/papers/2506.01844), consigue un rendimiento competitivo en tareas robóticas con un coste computacional reducido y puede ejecutarse en hardware de consumo. Este checkpoint hereda la arquitectura del modelo base `lerobot/smolvla_base` y se ha ajustado mediante fine-tuning con el framework LeRobot.

El dataset de entrenamiento, `taewonkoo/stack_cube_recovery_noise_10pct_40ep`, contiene 40 episodios y 13.720 frames a 30 FPS, con la tarea de "Pick up the wooden cube and place it on top of the Rubik's Cube". La configuración de entrenamiento es la siguiente: 30.000 pasos, tamaño de lote 4, optimizador AdamW con tasa de aprendizaje 0,0001, semilla 1000 y la versión 0.6.1 de LeRobot. No se detallan datos sobre composición del dataset ni técnicas de alineación como RLHF o DPO, ya que se trata de un aprendizaje de políticas por imitación.

## Capacidades

- Control de un robot de tipo `so_follower` mediante la generación de acciones de 6 dimensiones.
- Procesamiento de observaciones multimodales: estado del robot (6 valores) e imágenes de tres cámaras de resolución 256x256, además de una cámara superior de 480x640.
- Ejecución de la tarea específica de apilar un cubo de madera sobre un cubo de Rubik.
- Robustez parcial ante perturbaciones, derivada del entrenamiento con un 10 % de ruido en las trayectorias.
- Entrenamiento mediante aprendizaje por imitación con soporte del ecosistema LeRobot.
- Integración con el flujo de trabajo de `lerobot-rollout` para inferencia en robots reales.

No se declaran capacidades de tool calling, soporte de agentes, razonamiento de múltiples pasos ni generación de lenguaje general, al tratarse de una política especializada en control robótico.

## Casos de uso

- Automatización de apilado de piezas en líneas de montaje: el modelo puede integrarse en un brazo robótico para colocar objetos normalizados sobre otros, con tolerancia a pequeñas desviaciones gracias al entrenamiento con ruido.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para comparar políticas entrenadas con distintos niveles de ruido y número de episodios, utilizando el mismo dataset base.
- Prototipado rápido en robótica educativa: al ser un modelo compacto y compatible con LeRobot, permite a laboratorios universitarios desplegar una política en un robot `so_follower` sin necesidad de infraestructura de entrenamiento pesada.
- Evaluación de robustez en manipulación: se puede usar para medir la capacidad de recuperación de una política cuando los objetos están en posiciones ligeramente diferentes o hay interferencias visuales.
- Benchmarking de políticas VLA en hardware de consumo: el modelo se puede ejecutar en GPU domésticas, facilitando pruebas de rendimiento en entornos limitados.
- Documentación y demostraciones técnicas: el repositorio sirve como ejemplo de uso del flujo completo de LeRobot, desde el dataset hasta el rollout del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se deben asumir valores de precisión ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 450 millones de parámetros y un tamaño de 0,9 GB, lo que sugiere un uso ligero, pero no se aportan cifras de consumo de memoria.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: el paper de SmolVLA indica que la arquitectura está diseñada para ejecutarse en hardware de consumo, aunque no se detallan modelos concretos para este checkpoint.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout`, así como los flujos estándar de la documentación de SmolVLA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| taewonkoo/stack_cube_recovery_noise_10pct_40ep | 450.046.176 | no disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de información suficiente para una comparativa fiable con otros modelos VLA de la misma categoría. El único punto de referencia claro es el modelo base `lerobot/smolvla_base`, del que este checkpoint es un fine-tuning directo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos, pero el modelo está entrenado con un dataset pequeño (40 episodios) y específico, lo que puede provocar sobreajuste a la configuración de cámaras y al robot `so_follower`.
- Riesgo de alucinación: al ser un modelo de acción, si las observaciones difieren significativamente de las del entrenamiento, puede generar acciones inválidas o inconsistentes.
- Limitaciones de generalización: la política solo está entrenada para una tarea concreta (apilar cubo de madera sobre cubo de Rubik) y probablemente no generalice a otros objetos o tareas sin un nuevo fine-tuning.
- Dependencia de cámaras: los nombres y configuraciones de las cámaras en el rollout deben coincidir exactamente con las utilizadas durante el entrenamiento; cualquier cambio en el hardware puede degradar el rendimiento.
- Sin evaluación en el mundo real: no se han reportado tasas de éxito, por lo que su rendimiento en producción es incierto y debe validarse antes de un despliegue serio.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el usuario debe asegurarse de que el modelo se utiliza dentro del entorno técnico para el que fue diseñado.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/taewonkoo/stack_cube_recovery_noise_10pct_40ep](https://huggingface.co/taewonkoo/stack_cube_recovery_noise_10pct_40ep)
- Dataset en Hugging Face: [https://huggingface.co/datasets/taewonkoo/stack_cube_recovery_noise_10pct_40ep](https://huggingface.co/datasets/taewonkoo/stack_cube_recovery_noise_10pct_40ep)
- Paper de SmolVLA: [https://huggingface.co/papers/2506.01844](https://huggingface.co/papers/2506.01844)
- Guía de SmolVLA en LeRobot: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Visualización del dataset: [https://huggingface.co/spaces/lerobot/visualize_dataset?path=taewonkoo/stack_cube_recovery_noise_10pct_40ep](https://huggingface.co/spaces/lerobot/visualize_dataset?path=taewonkoo/stack_cube_recovery_noise_10pct_40ep)
- Modelo base: [https://huggingface.co/lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
