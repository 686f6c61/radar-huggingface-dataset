# yudai0209/so101_vial2_train80_L_groot17

## Resumen

`yudai0209/so101_vial2_train80_L_groot17` es una política de robótica (policy) entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El modelo combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. Lo publica el usuario yudai0209 bajo licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: coger un vial (blanco o azul) y colocarlo en un orificio específico de una gradilla, guiado por instrucciones en lenguaje natural. Está especializado para el robot `so_follower` (SO-101) con dos cámaras (`overhead` y `wrist`) y una observación de estado de 6 dimensiones. El checkpoint contiene 3.144.016.000 parámetros y ocupa 12,6 GB en el repositorio.

Es relevante porque demuestra el flujo completo de LeRobot con GR00T: desde un dataset de imitación de 80 episodios y 47.589 frames hasta una política desplegable con `lerobot-rollout`. No obstante, se trata de un modelo de nicho, sin descargas ni likes, sin resultados de evaluación publicados y entrenado sobre un dataset muy pequeño y específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `overhead`, `wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Dataset de entrenamiento | `yudai0209/so101_vial2_train80` (80 episodios, 47.589 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 42 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, un modelo fundacional de NVIDIA para robots humanoides que separa el razonamiento de alto nivel (backbone vision-language Cosmos-Reason2/Qwen3-VL) de la generación de acciones de bajo nivel (transformer de acciones con flow matching). Las acciones se predicen condicionadas por las imágenes de las cámaras `overhead` y `wrist`, la instrucción de tarea en lenguaje natural y el estado propioceptivo de 6 dimensiones del robot. El modelo es cross-embodiment por diseño, aunque este checkpoint concreto está especializado en el robot `so_follower`.

El entrenamiento se realizó con LeRobot 0.6.1 mediante imitación supervisada sobre el dataset `so101_vial2_train80`: 80 episodios, 47.589 frames a 30 FPS, con cuatro instrucciones de tarea (vial blanco al 1.er orificio por la derecha, vial blanco al 4.º, vial azul al 2.º y vial azul al 3.º). Se usaron 20.000 pasos, batch size de 32, AdamW con learning rate 1e-4 y semilla 42. No se documenta en la model card el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá de la propia arquitectura GR00T.

## Capacidades

- Manipulación robótica imitada: coger un vial (blanco o azul) y colocarlo en un orificio concreto de una gradilla, guiado por instrucción en lenguaje natural.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital (`overhead`) y una vista de muñeca (`wrist`) a resolución 640x480.
- Condicionamiento por lenguaje: acepta instrucciones de tarea en inglés del tipo "Pick up the white vial and put it in the 1st hole from the right".
- Control de acciones de 6 dimensiones sobre el robot `so_follower`.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni multimodalidad de audio.

## Casos de uso

- Automatización de picking y placing en laboratorio: el modelo ejecuta la tarea de coger un vial y depositarlo en un orificio concreto de una gradilla, adecuado para entornos de laboratorio con posiciones de gradilla relativamente estables.
- Prototipado de flujos de imitación con LeRobot: sirve como ejemplo reproducible de entrenamiento y despliegue de una policy GR00T sobre un robot SO-101, útil para equipos que quieran validar su pipeline antes de escalar a más datos.
- Investigación en manipulación con condicionamiento lingüístico: permite estudiar cómo responde una política GR00T a distintas instrucciones de destino sobre el mismo objeto.
- Benchmark interno de hardware robótico: al ser un checkpoint pequeño (12,6 GB) y con requisitos de inferencia moderados, se puede usar para medir latencia y estabilidad de un SO-101 con dos cámaras.
- Generación de datos sintéticos o aumentados: la política puede servir como baseline para comparar con nuevas políticas entrenadas sobre el mismo dataset.
- Educación y demostraciones: reproduce una tarea de manipulación comprensible y visual para talleres o demos de robótica con LeRobot.
- Reentrenamiento con fine-tuning: el checkpoint puede servir de inicialización para tareas similares de vial-a-gradilla con más posiciones u objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito por tarea, ni comparaciones con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144.016.000 parámetros, en FP16 se necesitan aproximadamente 6,3 GB solo para pesos, más memoria para activaciones y el backbone vision-language. En FP32 serían unos 12,6 GB solo de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, RTX A5000, L4) debería ser suficiente para inferencia en FP16; para entrenamiento se recomienda A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en FP16, aunque no está confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=yudai0209/so101_vial2_train80_L_groot17`; el entrenamiento se realiza con `lerobot-train` y `--policy.type=groot`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje general.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yudai0209/so101_vial2_train80_L_groot17` | 3.144.016.000 | no disponible | Manipulación vial-gradilla (SO-101) | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (base NVIDIA) | no disponible en la información | no disponible | Modelo fundacional humanoide cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otras políticas comparables entrenadas sobre el mismo dataset en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño: 80 episodios y 47.589 frames, con solo cuatro instrucciones de tarea; la generalización a nuevas posiciones, objetos o iluminación es limitada.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que no se puede afirmar fiabilidad en producción.
- Especialización estrecha: entrenado exclusivamente para el robot `so_follower` con cámaras `overhead` y `wrist`; no es transferible directamente a otros robots o configuraciones de cámara sin reentrenamiento.
- Dependencia de la instrucción exacta: las tareas están definidas con frases concretas en inglés; variaciones en la formulación pueden degradar el comportamiento.
- Riesgo de sobreajuste al entorno de captura: cambios en la posición de la gradilla, el color de los viales o la iluminación pueden provocar fallos.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo anterior.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo no es un LLM de propósito general: no debe usarse para generación de texto, código o razonamiento.
- Cero tracción en la comunidad (0 descargas, 0 likes) y creado en noviembre de 2026; sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/yudai0209/so101_vial2_train80_L_groot17
- Dataset: https://huggingface.co/datasets/yudai0209/so101_vial2_train80
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial2_train80
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
