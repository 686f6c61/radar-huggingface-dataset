# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullvision-steps30k-decay30k

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada pi05, desarrollada originalmente por Physical Intelligence y adaptada para LeRobot por el equipo team-sobits. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base` sobre un conjunto de datos propio de 200 episodios centrado en una única tarea de manipulación robótica: lanzar una lata de tomate a una papelera. El modelo no es un LLM conversacional, sino una política de control robótico que consume observaciones multimodales (estado del robot e imágenes de dos cámaras) y emite comandos de acción de 20 dimensiones.

La relevancia de este artefacto es doble. Por un lado, demuestra el flujo completo de trabajo de LeRobot para el ajuste fino de políticas VLA sobre robots móviles manipuladores, con configuración de entrenamiento documentada (30 000 pasos, batch 20, AdamW, learning rate 2,5e-05). Por otro, documenta un caso de simulación concreto (entorno simulado, 10 FPS, 48 141 fotogramas) que sirve como referencia reproducible para quien quiera entrenar políticas similares en tareas de pick-and-place.

El modelo se distribuye bajo licencia Apache 2.0, pesa 16,8 GB en el repositorio y emplea el formato de pesos safetensors. No se han publicado resultados de evaluación ni métricas de éxito, y la model card no detalla la arquitectura interna más allá de su origen en pi05 y su integración con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05 (Physical Intelligence), implementación LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | mobile_manipulator |
| Cámaras de entrada | head_camera (3, 480, 640), hand_left_camera (3, 400, 640) |
| Dimensión de estado | (20,) |
| Dimensión de acción | (20,) |
| Tamaño del repositorio | 16,8 GB |
| Librería | lerobot (versión 0.6.1) |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de pi05, la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos abiertos. La implementación procede del repositorio OpenPI y se ha integrado en LeRobot, que actúa como marco de entrenamiento e inferencia. La política consume dos flujos visuales (cámara de cabeza a 480×640 y cámara de mano izquierda a 400×640) junto con un vector de estado de 20 dimensiones, y produce un vector de acción de 20 dimensiones. No se detalla en la información disponible el número de parámetros, la profundidad del transformer ni el mecanismo exacto de fusión visión-lenguaje-acción.

El ajuste fino se realizó sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48 141 fotogramas a 10 FPS, correspondientes a la tarea "Throw the tomato can into the trash bin" en un entorno simulado. La configuración de entrenamiento incluye 30 000 pasos, batch size de 20, optimizador AdamW con learning rate 2,5e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. El nombre del repositorio sugiere un ajuste con LoRA sobre la torre VLM ("vlmlora") y visión completa ("fullvision"), aunque la model card no desarrolla estos detalles técnicos.

## Capacidades

- Control robótico de manipulación móvil: genera comandos de acción de 20 dimensiones a partir de observaciones multimodales.
- Percepción visual dual: procesa simultáneamente imágenes de cámara de cabeza y de mano izquierda.
- Ejecución de una tarea específica de pick-and-place: lanzar una lata de tomate a una papelera.
- Integración con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante CLI (`lerobot-train`, `lerobot-rollout`).
- Ajuste fino desde el modelo base `lerobot/pi05_base`, lo que permite reutilizar la receta para otras tareas.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento lingüístico ni procesamiento de audio.
- No se documentan capacidades multilingües (el modelo no es un modelo de lenguaje conversacional).

## Casos de uso

- Automatización de tareas de recogida y eliminación de residuos en entornos simulados: el modelo ejecuta la política entrenada para lanzar una lata a una papelera, sirviendo como banco de pruebas para pipelines de manipulación móvil antes de trasladarlos a hardware real.
- Generación de datos sintéticos de imitación: al ejecutarse en simulación a 10 FPS con 200 episodios de referencia, puede emplearse para validar la calidad de un dataset antes de escalar la recogida de datos reales.
- Base para ajuste fino en nuevas tareas domésticas: partiendo de `lerobot/pi05_base` y de esta receta (30 000 pasos, batch 20, AdamW), un equipo puede adaptar la política a otras tareas de manipulación con un dataset propio de tamaño similar.
- Evaluación de infraestructura LeRobot: el repositorio incluye comandos de rollout y entrenamiento listos para usar, lo que permite probar la instalación, la calibración de cámaras y el cableado del robot móvil manipulador.
- Investigación en generalización de políticas VLA: al derivar de pi05, diseñado para generalizar a entornos no vistos, el modelo sirve para estudiar la transferencia de simulación a realidad en tareas acotadas.
- Docencia y reproducción de experimentos: la configuración de entrenamiento completamente documentada (pasos, batch, learning rate, semilla, versión de LeRobot) facilita la replicación del experimento en cursos o laboratorios de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y que no se ha medido la tasa de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 16,8 GB en safetensors, lo que da una cota inferior orientativa del espacio en disco y memoria necesarios para cargar los pesos completos, pero no se especifica el consumo real en GPU.
- GPU recomendadas: no disponible. La model card solo indica `--policy.device=cuda` como opción de entrenamiento.
- Compatibilidad con GPU de consumo: no confirmada. Con 16,8 GB de pesos, una GPU de 24 GB (RTX 4090) sería el mínimo razonable para cargar el modelo sin cuantización, pero este dato no está verificado en la información disponible.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, pero no se indica la frecuencia de inferencia de la política ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullvision-steps30k-decay30k | no disponible | no disponible | Manipulación móvil (lata a papelera) | Apache 2.0 | Hugging Face (11 descargas) |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base, ajustable a múltiples tareas | no disponible en la información | Hugging Face |
| π₀ (pi0) de Physical Intelligence | no disponible | no disponible | Política VLA de propósito general | no disponible en la información | OpenPI (código abierto) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la política.
- Tarea única y altamente específica: el modelo solo se ha entrenado para "Throw the tomato can into the trash bin"; no se espera que funcione en otras tareas sin reentrenamiento.
- Entorno simulado: el dataset procede de simulación ("sim" en el nombre), y no se documenta la transferencia a un robot físico real.
- Dependencia de hardware concreto: las cámaras, sus resoluciones y el tipo de robot (`mobile_manipulator`) deben coincidir con los de entrenamiento; cualquier cambio en la configuración de sensores invalida la política.
- Sesgos conocidos: no documentados, pero al entrenarse sobre 200 episodios de una única tarea, la política heredará cualquier sesgo de posicionamiento, iluminación o disposición de objetos presente en el dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o no generalizables fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural de forma conversacional, solo la instrucción de tarea asociada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` y el código OpenPI pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- Repositorio de gran tamaño (16,8 GB) y pocas descargas (11), lo que sugiere un artefacto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullvision-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
