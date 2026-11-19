# syun88/dual_scorpion_pi05_pick_place_cube

## Resumen

El modelo `dual_scorpion_pi05_pick_place_cube` es una política robótica de tipo Vision-Language-Action (VLA) publicada en Hugging Face por el usuario syun88 bajo licencia Apache 2.0. Se trata de un ajuste fino (o entrenamiento específico) de la arquitectura π₀.₅ (Pi05) desarrollada por Physical Intelligence, adaptada a la librería LeRobot de Hugging Face. El modelo está especializado en la tarea concreta de recoger y colocar un cubo (pick and place cube) con un robot denominado "dual scorpion", a partir del dataset `syun88/dual_scorpion_pick_place_cube_20261119_142553`.

El interés de esta ficha radica en que ejemplifica el flujo de trabajo actual de la robótica basada en aprendizaje: un modelo fundacional VLA de propósito general (π₀.₅) se especializa mediante entrenamiento supervisado sobre un dataset de demostraciones propio para una tarea y un robot concretos. El resultado es un checkpoint de aproximadamente 4.140 millones de parámetros (4,14 B) en formato safetensors, empaquetado con la librería LeRobot, con un tamaño de repositorio de 9,4 GB.

No se dispone de información pública sobre benchmarks, idiomas soportados ni detalles de entrenamiento más allá de lo indicado en la model card. Todos los datos no verificables se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, adaptada a LeRobot |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | syun88/dual_scorpion_pick_place_cube_20261119_142553 |
| Tarea | pick and place cube (recoger y colocar un cubo) |
| Tamano del repositorio | 9,4 GB |
| Fecha de creacion | 2026-11-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos. La model card describe π₀.₅ como una evolución de π₀ orientada a generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación incluida en este repositorio es la adaptación de LeRobot, derivada del repositorio de código abierto OpenPI de Physical Intelligence.

Este checkpoint concreto ha sido entrenado sobre el dataset `dual_scorpion_pick_place_cube_20261119_142553`, que contiene demostraciones de la tarea de recoger y colocar un cubo con un robot "dual scorpion". No se dispone de información sobre el número de tokens, la composición del dataset, el número de episodios de demostración, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de ajuste. Tampoco se documentan innovaciones técnicas específicas de este checkpoint más allá de las propias de la arquitectura π₀.₅. Toda esta información se considera "no disponible".

## Capacidades

- Control robótico de tipo Vision-Language-Action: el modelo recibe observaciones visuales y genera acciones motoras para el robot.
- Ejecución de la tarea específica de pick and place de un cubo con el robot "dual scorpion".
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante las herramientas `lerobot-train` y `lerobot-record`.
- Generalización de tipo open-world heredada de la arquitectura π₀.₅ (según la descripción del modelo base; no verificada para este checkpoint concreto).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de lenguaje de propósito general).
- Capacidades especiales (modo thinking, visión, audio): visión como entrada para control motor; otras capacidades no disponibles.

## Casos de uso

- Automatización de pick and place en línea de montaje: el modelo ejecuta la tarea de recoger y colocar un cubo sobre el robot dual scorpion, adecuado para tareas repetitivas de manipulación en entornos controlados.
- Prototipado de políticas VLA con LeRobot: sirve como punto de partida para desarrolladores que quieran reproducir el flujo de entrenamiento de π₀.₅ sobre sus propios datasets de demostración.
- Investigación en aprendizaje por imitación: el checkpoint permite evaluar cómo se comporta una política VLA especializada frente al modelo base en una tarea acotada.
- Evaluación de hardware robótico: útil para validar la integración de un robot dual scorpion con el stack de LeRobot y medir latencia y precisión en la tarea.
- Generación de datasets de evaluación: mediante `lerobot-record` se pueden grabar episodios etiquetados con prefijo `eval_` para comparar políticas.
- Formación y docencia en robótica: ejemplo realista de extremo a extremo (dataset, entrenamiento, checkpoint, inferencia) para cursos de robótica basada en aprendizaje.
- Base para ajuste fino adicional: al estar bajo Apache 2.0 y en formato safetensors, puede reentrenarse sobre nuevas tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,14 B parámetros en safetensors, una estimación orientativa en FP16 sería de aproximadamente 8-9 GB de pesos, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090, A100, H100), pero no está confirmado por el autor.
- ¿Cabe en consumer GPU? Probablemente en GPUs de gama alta con 24 GB o más, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dual_scorpion_pi05_pick_place_cube | 4,14 B | no disponible | Pick and place cube (dual scorpion) | Apache 2.0 | Hugging Face (LeRobot) |
| π₀.₅ (Pi05) base de Physical Intelligence | no disponible | no disponible | VLA generalista open-world | no disponible en esta ficha | OpenPI / Physical Intelligence |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación por imitación | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (pick and place cube) y un único robot (dual scorpion); no es un modelo de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset concreto puede heredar sesgos de las demostraciones (posiciones, iluminación, objetos).
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de generalización deficiente fuera de la distribución del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; el modelo no procesa lenguaje natural de forma general.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar su despliegue.
- Caveat importante: la model card incluye el comando de entrenamiento con `--policy.type=act`, lo que puede inducir a confusión sobre la arquitectura real (π₀.₅); conviene verificar la configuración antes de reentrenar.

## Enlaces

- Hugging Face: https://huggingface.co/syun88/dual_scorpion_pi05_pick_place_cube
- Dataset: https://huggingface.co/datasets/syun88/dual_scorpion_pick_place_cube_20261119_142553
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI de Physical Intelligence: no disponible como enlace directo en la información proporcionada.
