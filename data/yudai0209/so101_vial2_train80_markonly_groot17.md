# yudai0209/so101_vial2_train80_markonly_groot17

## Resumen

`so101_vial2_train80_markonly_groot17` es una política de robótica entrenada mediante aprendizaje por imitación sobre el modelo fundacional GR00T N1.7 de NVIDIA, empaquetada con la librería LeRobot de Hugging Face. El autor, yudai0209, la ha publicado como checkpoint específico para el robot `so_follower` (SO-101) con el objetivo de ejecutar una tarea de manipulación concreta: recoger un vial (azul o blanco) y depositarlo en un orificio magenta.

El modelo no es un LLM de propósito general, sino un sistema visión-lenguaje-acción (VLA) que consume el estado de las articulaciones (6 dimensiones) y dos cámaras (overhead y wrist, 480x640) para predecir comandos de acción de 6 dimensiones. La arquitectura subyacente combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, lo que permite condicionar la predicción de acciones en visión, lenguaje y propiocepción.

Es relevante porque ejemplifica el flujo actual de fine-tuning de modelos fundacionales de robótica sobre hardware de bajo coste (SO-101) y datasets pequeños (80 episodios, 47.589 frames), mostrando cómo un modelo abierto puede adaptarse a tareas de pick-and-place en entornos controlados. Su licencia Apache 2.0 facilita la reutilización y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `overhead`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | yudai0209/so101_vial2_train80_markonly (80 episodios, 47.589 frames, 30 FPS) |
| Tareas | "pick up the blue vial and put it in the magenta hole", "pick up the white vial and put it in the magenta hole" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 42 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 12,6 GB |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional de NVIDIA para razonamiento y habilidades robóticas generalizadas, diseñado para ser agnóstico al embodiment (cross-embodiment). Su arquitectura combina un backbone de visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL con un transformer de acciones entrenado mediante flow matching, que genera trayectorias de acción condicionadas por las observaciones visuales, la instrucción de lenguaje y el estado de propiocepción del robot.

Este checkpoint concreto se ha obtenido mediante fine-tuning supervisado (aprendizaje por imitación) sobre el dataset `so101_vial2_train80_markonly`, compuesto por 80 episodios y 47.589 frames grabados a 30 FPS con dos cámaras. El entrenamiento se ejecutó durante 20.000 pasos con batch size 32, optimizador AdamW y learning rate 1e-4, usando LeRobot 0.6.1. No se dispone de información sobre la composición completa del dataset más allá de las dos tareas descritas, ni sobre si se aplicaron técnicas adicionales como RLHF o DPO (no aplicables habitualmente en este tipo de políticas).

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones para el robot SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente las vistas `overhead` y `wrist` a resolución 480x640.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea ("pick up the blue vial and put it in the magenta hole").
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas.
- Ejecución de tareas de pick-and-place específicas sobre objetos (viales azul y blanco) y un destino (orificio magenta).
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, capacidades de agente multi-paso, ni funciones de razonamiento general; su alcance es exclusivamente la política robótica entrenada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede recoger viales y depositarlos en una posición fija, adecuado para tareas repetitivas de manipulación de muestras en entornos controlados.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran evaluar el flujo de fine-tuning de GR00T con LeRobot sobre hardware SO-101.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de fine-tuning con datasets pequeños (80 episodios) y analizar la transferencia de modelos fundacionales a tareas concretas.
- Benchmarking de modelos VLA: útil como referencia para comparar el rendimiento de GR00T N1.7 frente a otras arquitecturas en tareas de manipulación con dos cámaras.
- Educación y formación en robótica: el modelo y su dataset asociado permiten demostrar el ciclo completo de grabación, entrenamiento y despliegue con LeRobot.
- Pruebas de integración hardware-software: valida la cadena de inferencia (cámaras, robot, política) en un SO-101 real antes de escalar a tareas más complejas.
- Base para data augmentation o currículos de aprendizaje: al estar entrenado en dos variantes de objeto (vial azul y blanco), puede servir para estudiar generalización entre objetos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.144 millones de parámetros en safetensors (12,6 GB de repo), se requiere al menos una GPU con memoria suficiente para cargar los pesos, aunque no se especifica el modo de precisión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos (12,6 GB) sugiere que podría requerir GPUs con 16 GB o más de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), con soporte para CUDA (`--policy.device=cuda` en entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vial2_train80_markonly_groot17 | 3.144.016.000 | no disponible | Pick-and-place con SO-101 | Apache 2.0 | Hugging Face |
| GR00T N1.7 (base) | no disponible | no disponible | Modelo fundacional robótico general | no disponible | GitHub NVIDIA Isaac-GR00T |
| Otras políticas LeRobot (p. ej., ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | varía | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos tareas muy concretas (vial azul y vial blanco hacia orificio magenta); no generaliza a otras tareas sin reentrenamiento.
- No se han publicado evaluaciones de éxito en robot real, por lo que se desconoce su tasa de acierto y robustez.
- Depende de la configuración exacta de cámaras (`overhead` y `wrist`) y de la resolución 480x640; cambios en la posición o calibración pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeño (80 episodios), lo que puede limitar la variabilidad de posiciones, iluminación y distractores.
- No se dispone de información sobre sesgos, alucinaciones (no aplicable en el sentido de LLM, pero sí en cuanto a predicciones erróneas de acción) ni limitaciones idiomáticas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 puede tener sus propias condiciones que deben verificarse.
- Para producción, es necesario validar la política en el robot objetivo y considerar la latencia de inferencia y la seguridad física del entorno.

## Enlaces

- [Hugging Face: yudai0209/so101_vial2_train80_markonly_groot17](https://huggingface.co/yudai0209/so101_vial2_train80_markonly_groot17)
- [Dataset: yudai0209/so101_vial2_train80_markonly](https://huggingface.co/datasets/yudai0209/so101_vial2_train80_markonly)
- [Visualizar dataset en LeRobot Spaces](https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial2_train80_markonly)
- [GR00T N1.7 en GitHub (NVIDIA Isaac-GR00T)](https://github.com/NVIDIA/Isaac-GR00T)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Chuleta de comandos CLI](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de inferencia (rollout)](https://huggingface.co/docs/lerobot/main/en/inference)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
