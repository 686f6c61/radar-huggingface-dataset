# yugosakaguchi/smolvla_insert_v2

## Resumen

`yugosakaguchi/smolvla_insert_v2` es un modelo de visión-lenguaje-acción (VLA) compacto, un fine-tuning de `lerobot/smolvla_base` publicado por el usuario yugosakaguchi. Está entrenado para una única tarea robótica de inserción ("Insert the connector into the hole") sobre un brazo xArm6 con tres cámaras (front, top y wrist). El modelo consume el estado articular de 6 dimensiones y tres imágenes de 256×256 píxeles, y produce un vector de acción de 6 dimensiones.

SmolVLA, la arquitectura base, se presenta como un VLA eficiente capaz de alcanzar rendimiento competitivo con costes computacionales reducidos y de desplegarse en hardware de consumo. Este checkpoint concreto no aporta evaluación publicada ni resultados de benchmarks, por lo que su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de una política de imitación con LeRobot 0.6.1 sobre un dataset de 100 episodios y 46.842 frames a 30 FPS.

Con 450 millones de parámetros y un repositorio de 0,9 GB en safetensors, el modelo está pensado para inferencia en el robot, no para servir como modelo de lenguaje general. Su licencia Apache 2.0 facilita la reutilización, aunque la ausencia de métricas de éxito limita cualquier afirmación sobre su calidad en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA, según paper arXiv:2506.01844); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es texto en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA compacto descrito en el paper SmolVLA (arXiv:2506.01844). La información disponible no detalla la composición interna de la arquitectura (backbone visual, encoder de lenguaje, política de acción), más allá de que se trata de un modelo de política para robótica gestionado por la librería LeRobot.

El entrenamiento se realizó sobre el dataset `yugosakaguchi/xarm6_insert_v2`: 100 episodios, 46.842 frames a 30 FPS, con la tarea "Insert the connector into the hole". La configuración reportada es de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se indica si hubo RLHF, DPO ni ninguna fase de alineación adicional; se trata de aprendizaje por imitación supervisado sobre demostraciones.

Las entradas son `observation.state` con forma `(6,)` y tres imágenes `(3, 256, 256)`; la salida es `action` con forma `(6,)`. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones para un brazo xArm6 a partir de estado articular y tres vistas de cámara.
- Ejecución de una tarea concreta de inserción de conector en orificio ("Insert the connector into the hole").
- Percepción visual multi-cámara: front, top y wrist, cada una a 256×256 píxeles.
- Condicionamiento por instrucción de tarea en texto (la política recibe la cadena de tarea en la inferencia).
- Integración con el ecosistema LeRobot para rollout y reentrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, código ni multilingüismo general.

## Casos de uso

- Automatización de inserción de conectores en línea de montaje: la política ejecuta la tarea de inserción sobre un xArm6 con las tres cámaras configuradas, adecuada porque fue entrenada exactamente para esa tarea y esa morfología.
- Base para fine-tuning de tareas de ensamblaje similares: al partir de `lerobot/smolvla_base` y usar LeRobot, se puede reentrenar con un dataset propio de inserción y reutilizar la configuración de entrenamiento reportada.
- Prototipado rápido de políticas de imitación en laboratorio: 100 episodios y 46.842 frames son un volumen asequible para validar un pipeline completo de captura, entrenamiento y rollout.
- Investigación en manipulación fina con múltiples vistas: la combinación de cámara de muñeca, frontal y superior permite estudiar el efecto de la configuración visual en tareas de precisión.
- Evaluación comparativa de VLA compactos: con 450 M de parámetros y despliegue en hardware de consumo, sirve como referencia de coste bajo frente a VLA de mayor tamaño.
- Docencia y reproducción de resultados: el checkpoint y el dataset están publicados con licencia Apache 2.0 y comandos de rollout y entrenamiento, lo que facilita reproducir el flujo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, el peso en precisión de entrenamiento ronda los 1,8 GB (fp32) o 0,9 GB (fp16/bf16), más el coste del backbone visual y de las tres cámaras a 256×256.
- GPU recomendadas: no disponibles en la información proporcionada; la model card de SmolVLA afirma que puede desplegarse en hardware de consumo.
- ¿Cabe en GPU de consumo? Según la descripción de SmolVLA, sí; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset de entrenamiento, pero no se reporta latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yugosakaguchi/smolvla_insert_v2` | 450 M | no disponible | Inserción de conector en xArm6 | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Otros VLA de la familia SmolVLA | no disponible | no disponible | Robótica general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito que respalden el rendimiento de la política.
- Especialización estrecha: entrenada para una única tarea y una morfología concreta (xArm6 con tres cámaras front, top y wrist); no es un modelo general.
- Dependencia de la configuración de hardware: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento; un cambio de robot, iluminación, posiciones de objeto o distractor puede degradar el comportamiento.
- Riesgo de sobreajuste al dataset de 100 episodios, sin datos que indiquen robustez ante variaciones.
- Sesgos: no documentados; al ser aprendizaje por imitación, hereda los sesgos y la distribución de las demostraciones.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía alguna sobre el comportamiento del modelo en producción.
- Sin información sobre idiomas ni cuantizaciones; el uso previsto es inferencia robótica, no procesamiento de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yugosakaguchi/smolvla_insert_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yugosakaguchi/xarm6_insert_v2
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
