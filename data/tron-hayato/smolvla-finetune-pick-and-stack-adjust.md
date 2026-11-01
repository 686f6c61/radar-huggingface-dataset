# Tron-Hayato/smolvla-finetune-pick-and-stack-adjust

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `Tron-Hayato/smolvla-finetune-pick-and-stack-adjust`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 100 episodios de la tarea de apilar bloques, y se distribuye con licencia Apache 2.0.

El modelo resuelve el problema de la imitación visual-motora de bajo coste computacional: con unos 450 millones de parámetros totales, está pensado para ejecutarse en hardware de consumo en lugar de requerir clústeres de GPU. La entrada combina el estado de 6 articulaciones con tres cámaras RGB de 480x640 (side, wrist y top), y la salida es un vector de acción de 6 dimensiones que se aplica al robot `so_follower` de LeRobot.

Es relevante ahora porque representa el patrón actual de la robótica open source: modelos base pequeños, fine-tuneables por cualquier laboratorio o aficionado con un dataset modesto, y desplegables con la CLI de LeRobot. No obstante, conviene subrayar que esta versión concreta es un fine-tuning de una única tarea y no se han publicado evaluaciones de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en inglés; el modelo no es un LLM conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower |
| Cámaras | side, wrist, top (3, 480, 640) |
| Entrada de estado | observation.state (6,) |
| Salida de acción | action (6,) |
| Tamaño del repo | 1.2 GB |
| Descargas | 38 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA descrita en el paper arXiv:2506.01844: un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un componente lingüístico para la instrucción de tarea y una cabeza de política que emite acciones continuas de 6 dimensiones. La información disponible no detalla el número de capas, la dimensión oculta ni la composición exacta del codificador visual, por lo que esos datos se marcan como no disponibles.

El fine-tuning se realizó con LeRobot 0.6.1 sobre el dataset `Tron-Hayato/record-pick-and-stack-adjust`, compuesto por 100 episodios y 115.802 fotogramas a 30 FPS. La tarea es "Pick up blocks on the left one by one and stack them on top of the blocks on the right side". La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica en la información proporcionada si hubo RLHF, DPO ni la composición exacta del dataset más allá de los episodios de demostración.

## Capacidades

- Control robótico de imitación: genera acciones de 6 grados de libertad a partir de observaciones multimodales (estado de articulaciones y tres cámaras).
- Fusión visión-lenguaje-acción: integra la instrucción textual de la tarea con las imágenes para producir la política de movimiento.
- Manipulación de objetos: entrenado específicamente para recoger bloques y apilarlos.
- Ejecución en hardware de consumo: el tamaño de 450 M de parámetros permite desplegarlo en GPUs de gama media.
- Compatibilidad con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se entrena con `lerobot-train`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modo de razonamiento explícito (thinking), según la información disponible.
- Capacidades multilingües: no aplicables; la instrucción de tarea se usa en inglés.

## Casos de uso

- Apilado de bloques en laboratorio: el modelo ejecuta directamente la tarea para la que fue entrenado, recogiendo bloques de la izquierda y apilándolos a la derecha, con la instrucción textual exacta del dataset.
- Reproducción de experimentos de imitación: sirve como referencia para comparar fine-tunings de SmolVLA sobre el mismo robot `so_follower` y las mismas tres cámaras.
- Base para nuevos fine-tunings: al partir de `lerobot/smolvla_base` y estar publicado en formato LeRobot, se puede reentrenar con `lerobot-train` sobre datasets propios de manipulación.
- Docencia y prototipado en robótica: su tamaño de 450 M de parámetros y su licencia Apache 2.0 permiten usarlo en cursos y talleres con GPUs de consumo.
- Validación de pipelines de datos: el dataset asociado (100 episodios, 115.802 fotogramas) y la política permiten probar el flujo completo de grabación, entrenamiento y despliegue de LeRobot.
- Investigación en políticas visuales: útil para estudiar la sensibilidad de SmolVLA a cambios de iluminación, posición de objetos o disposición de cámaras en tareas de apilado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors y un repo de 1,2 GB, la inferencia en precisión nativa requiere del orden de 2-4 GB de VRAM, y menos con cuantización, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la información; por tamaño, cabría esperar GPUs de consumo tipo RTX 3060/4060 en adelante, pero no se confirma.
- ¿Cabe en GPU de consumo? Sí, por el tamaño del modelo (450 M de parámetros), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-finetune-pick-and-stack-adjust (este) | 450 M | no disponible | Apilado de bloques con so_follower | Apache 2.0 | Hugging Face, 38 descargas |
| lerobot/smolvla_base | no disponible en la información | no disponible | Modelo base VLA generalista | no disponible en la información | Hugging Face |
| Otros fine-tunings de SmolVLA | no disponible | no disponible | Tareas de manipulación diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para la tarea de apilar bloques con el robot `so_follower` y las cámaras side, wrist y top; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la configuración física: cambios en la posición de las cámaras, la iluminación, los objetos o el robot pueden degradar el rendimiento.
- Dataset pequeño: 100 episodios y 115.802 fotogramas es un volumen modesto, lo que aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Idiomas: la instrucción de tarea está en inglés; no se documentan capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los componentes base y del dataset asociado.
- Sin datos de sesgos, alucinación o cuantización disponibles en la información proporcionada.
- Fecha de creación del repo: 2026-10-26, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tron-Hayato/smolvla-finetune-pick-and-stack-adjust
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tron-Hayato/record-pick-and-stack-adjust
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tron-Hayato/record-pick-and-stack-adjust
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
