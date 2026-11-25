# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_r128_fullvision-steps30k-decay30k

## Resumen

Este repositorio contiene un *policy* de robótica denominado `pi0` afinado por el equipo `team-sobits` a partir del modelo base `lerobot/pi0_base`. Se trata de un modelo visión-lenguaje-acción (VLA) orientado a control robótico: recibe observaciones visuales y de estado del robot, junto con una instrucción en lenguaje natural, y emite directamente un vector de acciones. El modelo base π₀ (Pi0) procede de Physical Intelligence y su implementación en LeRobot está adaptada del repositorio OpenPI.

El modelo está especializado en una única tarea de manipulación móvil: "Throw the tomato can into the trash bin" (lanzar la lata de tomate a la papelera), sobre un robot de tipo `mobile_manipulator` con dos cámaras (`head_camera` y `hand_left_camera`). Se ha entrenado mediante aprendizaje por imitación sobre un conjunto de 200 episodios y 48 141 fotogramas a 10 FPS, con 30 000 pasos de entrenamiento.

El nombre del repositorio indica que el ajuste fino emplea LoRA sobre la torre de visión-lenguaje con rango 128 y visión completa (`vlmlora_r128_fullvision`), con un *schedule* de decaimiento a 30 000 pasos. Es relevante para quienes trabajan en manipulación robótica con LeRobot y quieren un punto de partida ya entrenado para tareas de recogida y descarte de objetos en entornos simulados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en π₀ (Pi0); ajuste fino con LoRA (r=128) sobre la torre visión-lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones se proporcionan en lenguaje natural; no se especifican idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un *policy* VLA π₀ (Pi0) de Physical Intelligence, implementado en LeRobot a partir de OpenPI. Consume tres entradas: `observation.state` con forma `(20,)`, `observation.images.head_camera` con forma `(3, 480, 640)` y `observation.images.hand_left_camera` con forma `(3, 400, 640)`. Produce una salida `action` con forma `(20,)`. El ajuste fino se realiza sobre el modelo base `lerobot/pi0_base` con LoRA de rango 128 aplicado a la torre visión-lenguaje, manteniendo la visión completa según el nombre del repositorio.

El entrenamiento se llevó a cabo con aprendizaje por imitación sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep` (200 episodios, 48 141 fotogramas, 10 FPS), con 30 000 pasos, *batch size* de 20, optimizador AdamW, *learning rate* de 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se dispone de información sobre la composición detallada del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de lo indicado.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones a partir de estado y dos vistas de cámara.
- Interpretación de instrucciones en lenguaje natural para ejecutar la tarea entrenada.
- Percepción visual multimodal mediante dos cámaras (cabeza y mano izquierda).
- Ejecución de una política de imitación especializada en una tarea concreta de recogida y descarte de objetos.
- Integración con el ecosistema LeRobot para *rollout* y entrenamiento.
- No se documentan capacidades de *tool calling*, agentes multi-paso, matemáticas, código ni otras modalidades (audio, thinking mode).

## Casos de uso

- Automatización de tareas de recogida y descarte en simulación: el *policy* se ejecuta con `lerobot-rollout` sobre un robot `mobile_manipulator` para lanzar la lata de tomate a la papelera, aprovechando las dos cámaras entrenadas.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un ajuste fino LoRA sobre π₀ con 200 episodios y 30 000 pasos, útil para comparar hiperparámetros y *schedules* de decaimiento.
- Prototipado de políticas VLA en robótica móvil: permite validar el pipeline completo de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas propias.
- Base para *fine-tuning* en tareas similares de manipulación: al partir de `lerobot/pi0_base` y usar LoRA, se puede reutilizar como punto de partida para otras tareas de recogida con el mismo robot y cámaras.
- Evaluación de robustez visual: al depender de `head_camera` y `hand_left_camera`, permite estudiar el impacto de cambios de iluminación, posiciones de objetos y distractores en la tasa de éxito.
- Docencia y demostraciones de VLA: el comando de *rollout* documentado facilita reproducir la inferencia en un robot físico o simulado con la tarea "Throw the tomato can into the trash bin".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 22,4 GB, pero no se detalla el peso del *checkpoint* ni su cuantización).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`) y `lerobot-train` para reentrenamiento; no se documentan vLLM, llama.cpp, Ollama ni TGI para este *policy*.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi0` afinado por team-sobits) | no disponible | no disponible | sin evaluación publicada | apache-2.0 | Hugging Face (13 descargas) |
| `lerobot/pi0_base` | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| π₀ original (Physical Intelligence, OpenPI) | no disponible | no disponible | no disponible | no disponible en la información | OpenPI (open source) |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Throw the tomato can into the trash bin") y un robot concreto (`mobile_manipulator`) con dos cámaras específicas; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito ni pruebas en robot real documentadas, por lo que el rendimiento en producción es desconocido.
- Dependencia de la configuración de hardware: los nombres e índices de cámara deben coincidir con las claves de observación entrenadas (`head_camera`, `hand_left_camera`).
- Posible sobreajuste al dataset de 200 episodios y a las condiciones de simulación; no se documenta robustez ante cambios de iluminación, posiciones o distractores.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de acciones erróneas o inseguras al ejecutar el *policy* en un robot físico.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base `lerobot/pi0_base` y de los datos de entrenamiento.
- Idiomas soportados: no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_r128_fullvision-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: no disponible como enlace directo en la información proporcionada
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/*rollout*: https://huggingface.co/docs/lerobot/main/en/inference
