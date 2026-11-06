# yudai0209/so101_dual_mentos_handover_60ep_groot17

## Resumen

`so101_dual_mentos_handover_60ep_groot17` es una política robótica de imitación entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. En este caso concreto, el checkpoint está especializado en una única tarea de manipulación bimanual: recoger un caramelo Mentos con el brazo derecho, pasarlo al brazo izquierdo y depositarlo en un soporte.

El modelo tiene 3.144.016.000 parámetros totales (aproximadamente 3.14 mil millones) y un repositorio de 12.6 GB en formato safetensors, empaquetado para la librería `lerobot`. Consume tres cámaras (muñeca izquierda, vista cenital y muñeca derecha) más un vector de estado de 12 dimensiones, y produce un vector de acción de 12 dimensiones para un robot bimanual `bi_so_follower` (SO-101 dual). Es relevante ahora porque demuestra el flujo completo de LeRobot con GR00T: desde un dataset de teleoperación de 60 episodios hasta una política desplegable con un único comando CLI.

La licencia es Apache 2.0 y el modelo está publicado en Hugging Face con 26 descargas en el momento de la consulta. No se han publicado resultados de evaluación en la model card, por lo que el rendimiento real en robot debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching) |
| Parametros totales | 3.144.016.000 (~3.14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.1) |
| Tipo de robot | `bi_so_follower` (SO-101 dual) |
| Camaras | `left_wrist`, `overhead`, `right_wrist` (3, 480, 640) |
| Entrada de estado | `observation.state` (12,) |
| Salida de accion | `action` (12,) |
| Tamano del repo | 12.6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para robots humanoides. El backbone es un modelo visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las tres cámaras junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching genera las acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint está adaptado a un robot bimanual SO-101 con 12 grados de libertad de acción y estado.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `yudai0209/so101_dual_mentos_handover_60ep`, que contiene 60 episodios y 40.828 frames a 30 FPS de la tarea "Pick up the Mentos with the right arm, hand it over to the left arm, and put it in the rack". La configuración de entrenamiento reportada es de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 0.0001 y semilla 42. No se documenta el número total de tokens de entrenamiento ni si hubo fases de RLHF/DPO; al tratarse de aprendizaje por imitación supervisado, lo esperable es que no las haya.

## Capacidades

- Manipulación robótica bimanual: ejecuta una tarea de handover entre brazo derecho e izquierdo con un robot SO-101 dual.
- Percepción multimodal: integra tres vistas de cámara (muñeca izquierda, cenital y muñeca derecha) con estado propioceptivo de 12 dimensiones.
- Condicionamiento por lenguaje: la tarea se especifica mediante una instrucción en lenguaje natural en el comando de rollout.
- Control de acciones continuas: genera un vector de acción de 12 dimensiones a 30 FPS.
- Aprendizaje por imitación: política entrenada a partir de demostraciones de teleoperación, sin necesidad de recompensas explícitas.
- Despliegue con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- Capacidades de razonamiento general del backbone GR00T N1.7 (visión-lenguaje) disponibles a nivel de arquitectura, aunque este checkpoint está especializado en una única tarea.

## Casos de uso

- Automatización de handover bimanual en línea de montaje: el modelo ejecuta la secuencia completa de recogida, transferencia entre brazos y colocación, adecuado para tareas de pick-and-place que requieren coordinación entre dos efectores.
- Validación de pipelines de imitación con LeRobot: sirve como referencia reproducible para probar el flujo de entrenamiento GR00T con datasets propios de 60 episodios y comprobar la integración con `lerobot-train`.
- Benchmark de referencia para tareas de manipulación con SO-101: permite comparar nuevas políticas contra un checkpoint ya entrenado en la misma tarea y robot.
- Prototipado rápido en laboratorio: con un único comando `lerobot-rollout` se puede desplegar la política en un robot bimanual para evaluar viabilidad antes de invertir en más datos.
- Investigación en aprendizaje por imitación: útil para estudiar el comportamiento de flow matching en acciones continuas con condicionamiento visual múltiple.
- Demostración educativa de robótica fundacional: ejemplo completo de cómo un modelo fundacional GR00T se adapta a una tarea concreta mediante fine-tuning con LeRobot.
- Base para fine-tuning en tareas similares: el checkpoint puede servir de inicialización para tareas de handover con variaciones de objeto o posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.14 mil millones de parámetros en safetensors (12.6 GB de repo), la inferencia en fp16 requeriría del orden de 6-7 GB de VRAM solo para pesos, más memoria para activaciones y las tres cámaras.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con al menos 12-16 GB de VRAM (RTX 4090, A100, H100) sería razonable, pero no está confirmado por el autor.
- Cabe en consumer GPU: probablemente en GPUs de 16 GB o más (por ejemplo RTX 4080/4090), aunque no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) con dispositivo `cuda`.
- Latencia y throughput: no disponible; el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe operar a esa frecuencia, pero no se reportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_dual_mentos_handover_60ep_groot17 (este) | ~3.14 mil millones | no disponible | Handover bimanual SO-101 | Apache 2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la informacion | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT / Diffusion | no disponible | no disponible | Imitación robótica genérica | no disponible en la informacion | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito medidas en robot real, por lo que el rendimiento es desconocido.
- Especialización extrema: entrenado únicamente para la tarea de handover de Mentos; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 60 episodios y 40.828 frames pueden provocar sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Dependencia del hardware exacto: requiere un robot `bi_so_follower` con tres cámaras en las posiciones y nombres exactos (`left_wrist`, `overhead`, `right_wrist`); discrepancias en la configuración degradan el rendimiento.
- Riesgo de alucinación de acciones: como política de imitación, puede generar secuencias de acción no válidas ante distribuciones de entrada fuera de las vistas en entrenamiento.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se proporciona en inglés en el ejemplo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone GR00T N1.7 y de los componentes de NVIDIA.
- Sin datos de sesgos: no se documentan sesgos conocidos del modelo ni del dataset.
- Fecha de creación futura (2026-10-30) en los metadatos: conviene verificar la vigencia del checkpoint antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yudai0209/so101_dual_mentos_handover_60ep_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_dual_mentos_handover_60ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_dual_mentos_handover_60ep
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
