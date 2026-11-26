# SteveNguyen/put_red_cube_green_box_merged_aug8k_pi05_step8000

## Resumen

`put_red_cube_green_box_merged_aug8k_pi05_step8000` es un policy de robótica de tipo Vision-Language-Action (VLA) obtenido por fine-tuning del modelo base `lerobot/pi05_base`, que a su vez implementa la arquitectura π₀.₅ (Pi05) de Physical Intelligence en LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una única tarea de manipulación: introducir un cubo rojo en una caja verde, a partir de observaciones visuales de una cámara y del estado del robot.

Lo publica el usuario SteveNguyen y está entrenado sobre el dataset `SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel`, con 217 episodios y 39.650 frames a 30 FPS. Se trata de un artefacto de investigación y demostración de bajo perfil (0 descargas, 0 likes en el momento de la consulta), no de un modelo de propósito general: su valor está en servir como ejemplo reproducible de fine-tuning de π₀.₅ con LeRobot sobre un robot concreto (`grabette`) y una tarea concreta.

El modelo tiene 4.143.404.816 parámetros en formato safetensors (9,4 GB de repositorio), licencia Apache 2.0 y se ejecuta con el stack `lerobot` (comandos `lerobot-rollout` y `lerobot-train`). No se dispone de información sobre longitud de contexto, idiomas ni cuantizaciones, ya que no son parámetros aplicables a un policy de robótica de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un policy VLA π₀.₅ (Pi05) fine-tuneado desde `lerobot/pi05_base`. π₀.₅ es la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos abiertos; la implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI. La entrada del policy es multimodal: una imagen de cámara `observation.images.cam0` de shape `(3, 360, 480)` y un vector de estado `observation.state` de shape `(2,)`. La salida es un vector de acción `action` de shape `(8,)`, es decir, un chunk de acciones de 8 dimensiones por paso de inferencia.

El entrenamiento se realizó con LeRobot 0.6.1 durante 8.000 pasos, con batch size 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. El dataset de fine-tuning contiene 217 episodios y 39.650 frames a 30 FPS para la tarea "put the red cube in the green box", sobre un robot de tipo `grabette` con una sola cámara. No se documentan detalles sobre el dataset de preentrenamiento del modelo base, la composición de datos ni el uso de RLHF/DPO, por lo que esos datos deben consultarse en la documentación de `lerobot/pi05_base` y en el blog de Physical Intelligence.

## Capacidades

- Manipulación robótica end-to-end: genera comandos de acción de 8 dimensiones a partir de imagen y estado del robot.
- Ejecución de una tarea específica de pick-and-place: "put the red cube in the green box".
- Control por imitación (imitation learning) sobre el robot `grabette` con una cámara `cam0`.
- Integración con el stack LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es un policy de robótica, no un LLM.
- No se documentan capacidades de visión general, audio ni modos de "thinking".

## Casos de uso

- Reproducción de la tarea de pick-and-place: ejecutar el policy con `lerobot-rollout` sobre un robot `grabette` calibrado para depositar un cubo rojo en una caja verde, como demostración del pipeline completo de LeRobot.
- Punto de partida para fine-tuning: usar este checkpoint como referencia de configuración (8.000 pasos, batch 32, LR 2,5e-05) para entrenar policies similares sobre nuevos datasets de manipulación.
- Benchmark interno de imitación: comparar la tasa de éxito de este policy frente a otros checkpoints del mismo modelo base para evaluar el efecto del número de pasos y de la composición del dataset.
- Docencia y formación en robótica: ejemplo reproducible de entrenamiento VLA con LeRobot, útil en cursos y talleres sobre aprendizaje por imitación.
- Validación de hardware: probar la integración de una cámara `cam0` y del robot `grabette` en un entorno controlado antes de escalar a tareas más complejas.
- Investigación en generalización: evaluar cómo se comporta un policy entrenado con 217 episodios ante cambios de posición, iluminación o distractores, para estudiar la robustez de π₀.₅ en entornos no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 9,4 GB en safetensors, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos en precisión completa.
- GPU recomendadas: no disponible. No se especifican GPUs probadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada; los 4.143 millones de parámetros y los 9,4 GB de pesos sugieren que podría caber en GPUs con 12-16 GB de VRAM o más, pero este dato no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de policy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `put_red_cube_green_box_merged_aug8k_pi05_step8000` | 4.143.404.816 | no disponible | Pick-and-place específico (cubo rojo en caja verde) | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA de propósito general | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo está entrenado para "put the red cube in the green box"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito medidas, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia del hardware: requiere un robot `grabette` y una cámara `cam0` con la configuración exacta de observación (imagen 3x360x480, estado de 2 dimensiones); cualquier cambio de cámara o de morfología invalida el policy.
- Dataset pequeño: 217 episodios y 39.650 frames son insuficientes para garantizar robustez ante cambios de iluminación, posición de objetos o distractores.
- Riesgo de sobreajuste al entorno de grabación: no se documenta augmentación ni validación cruzada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` y la arquitectura π₀.₅ pueden tener condiciones adicionales que deben verificarse antes de un uso comercial.
- Sin información sobre sesgos: no se documentan sesgos conocidos, aunque al ser un modelo visual puede heredar sesgos de los datos de preentrenamiento del modelo base.
- Perfil de adopción nulo: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/put_red_cube_green_box_merged_aug8k_pi05_step8000
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/put_red_cube_green_box_merged_graspproj_chunkrel
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada.
