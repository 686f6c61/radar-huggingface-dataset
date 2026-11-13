# xXFiEsTaDeAmOnXx/openarm-desk-pick-smolvla

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto es un fine-tuning de `lerobot/smolvla_base` realizado por el usuario xXFiEsTaDeAmOnXx sobre el robot `openarm_v2`, especializado en dos tareas de recogida de objetos sobre una mesa de trabajo.

El modelo resuelve el problema de la imitación visual-motora de bajo coste computacional: con aproximadamente 450 millones de parámetros, es capaz de ejecutarse en hardware de consumo, algo poco habitual en el espacio VLA, donde los modelos suelen superar los miles de millones de parámetros. La política consume estado articular de 6 dimensiones junto con varias cámaras y produce comandos de acción de 7 dimensiones a 30 FPS.

Es relevante ahora porque el fine-tuning de políticas VLA ligeras sobre robots asequibles (como OpenArm) está democratizando la robótica de manipulación: cualquier laboratorio o desarrollador puede entrenar y desplegar su propia política con LeRobot sin necesidad de clústeres de GPU. La licencia Apache 2.0 facilita además su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "pick up the apple", "pick up the potted meat can") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `openarm_v2` |
| Cámaras | `front`, `wrist` (más `camera1`, `camera2`, `camera3`, `empty_camera_0` en la definición de inputs) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de acción | `action` de forma `(7,)` |
| Resolución de imagen | 256x256 (cámaras 1-3) y 480x640 (`empty_camera_0`) |
| Tamaño del repositorio | 0.9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de SmolVLA, un VLA compacto presentado en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones multimodales (imágenes de varias cámaras y estado articular) a comandos motores de 7 dimensiones. El autor no detalla en la model card la arquitectura interna exacta del backbone ni la composición del dataset de preentrenamiento; solo se indica que parte de `lerobot/smolvla_base` y que el fine-tuning se realizó con LeRobot 0.7.1.

El entrenamiento se llevó a cabo sobre el dataset `xXFiEsTaDeAmOnXx/openarm_desk_pick_known`, compuesto por 200 episodios y 18.188 fotogramas a 30 FPS, con dos tareas: "pick up the apple" y "pick up the potted meat can". La configuración de entrenamiento fue de 15.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se documenta si hubo RLHF, DPO ni ninguna innovación técnica adicional más allá del propio método SmolVLA.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción de 7 dimensiones (posición y orientación del efector, más pinza) a partir de observaciones visuales y estado articular.
- Percepción visual multicámara: consume imágenes de varias cámaras (frontal, muñeca y otras) a 256x256 y 480x640.
- Condicionamiento por instrucción en lenguaje natural: ejecuta tareas descritas en texto ("pick up the apple", "pick up the potted meat can").
- Aprendizaje por imitación: política entrenada sobre demostraciones humanas teleoperadas.
- Ejecución en hardware de consumo: el tamaño de 450M parámetros permite despliegue en GPUs no profesionales.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas ni generación de texto; es una política robótica, no un LLM de propósito general.

## Casos de uso

- Recogida de objetos en línea de montaje: la política puede ejecutar tareas de pick sobre una mesa con objetos conocidos (manzana, lata de paté) usando las cámaras frontal y de muñeca, adecuada para prototipos de automatización de bajo coste.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar generalización de políticas VLA con solo 200 episodios de demostración, permitiendo comparar variantes de fine-tuning sobre la misma base.
- Benchmark de robots asequibles: al estar entrenada para `openarm_v2`, permite evaluar el rendimiento de un brazo de bajo coste frente a plataformas comerciales en tareas de manipulación.
- Docencia y formación en robótica: su reducido tamaño (0.9 GB) y licencia Apache 2.0 lo hacen apto para laboratorios universitarios que quieran reproducir el pipeline completo de LeRobot sin infraestructura pesada.
- Base para fine-tuning en tareas nuevas: cualquier equipo con un OpenArm puede reentrenar la política con su propio dataset siguiendo el comando `lerobot-train` documentado, reutilizando los pesos como inicialización.
- Pruebas de despliegue en el borde (edge): con 450M parámetros puede ejecutarse en estaciones de trabajo con GPU de consumo, útil para validar latencias de control a 30 FPS antes de escalar a hardware mayor.
- Validación de pipelines de datos: el dataset asociado y la política permiten probar herramientas de visualización y curación de datos de LeRobot de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en safetensors (0.9 GB de repositorio), la inferencia en fp32 requeriría aproximadamente 1,8 GB de VRAM solo para pesos, más overhead de activaciones y codificadores visuales.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090; el paper de SmolVLA afirma despliegue en hardware de consumo, pero no se detallan modelos concretos.
- Cabe en GPU de consumo: sí, según la descripción del método SmolVLA ("can be deployed on consumer-grade hardware"), aunque no se aportan cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; el control opera a 30 FPS en la captura de datos, pero no se reporta la frecuencia de inferencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Contexto / tarea | Disponibilidad |
|---|---|---|---|---|---|
| openarm-desk-pick-smolvla (este) | 450M | VLA fine-tuned para `openarm_v2` | Apache 2.0 | 2 tareas de pick, 200 episodios | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | VLA base (SmolVLA) | no disponible en la información | multitarea general | Hugging Face (modelo base) |
| Políticas VLA de gran escala (p. ej. familias tipo OpenVLA) | no disponible en la información | VLA | no disponible | manipulación general | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera de las condiciones de entrenamiento.
- Dominio muy estrecho: entrenada solo para dos tareas ("pick up the apple", "pick up the potted meat can") sobre una mesa concreta; probablemente no generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Dependencia de hardware específico: los nombres y la configuración de cámaras (`camera1`, `camera2`, `camera3`, `empty_camera_0`, `front`, `wrist`) deben coincidir exactamente con los del entrenamiento; la model card menciona una cámara "empty", lo que sugiere posibles inconsistencias en la definición de inputs.
- Riesgo de sobreajuste: 15.000 pasos con batch 64 sobre 200 episodios es un régimen propenso a memorizar las demostraciones.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados; en robótica por imitación los sesgos provienen de las condiciones de captura (iluminación, posiciones, operador).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base `lerobot/smolvla_base` debe verificarse por separado.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de validación por terceros.
- Alucinación: en el contexto de políticas VLA, el riesgo se traduce en acciones erráticas o inseguras; debe operarse con límites de par y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xXFiEsTaDeAmOnXx/openarm-desk-pick-smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/xXFiEsTaDeAmOnXx/openarm_desk_pick_known
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=xXFiEsTaDeAmOnXx/openarm_desk_pick_known
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
