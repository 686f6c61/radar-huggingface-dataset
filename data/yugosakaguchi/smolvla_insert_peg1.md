# yugosakaguchi/smolvla_insert_peg1

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, presentado en el artículo arXiv 2506.01844. Su objetivo es ofrecer un rendimiento competitivo en manipulación robótica con un coste computacional reducido, de forma que pueda desplegarse en hardware de consumo en lugar de requerir clústeres de GPU. La ficha que nos ocupa, `yugosakaguchi/smolvla_insert_peg1`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 100 episodios para la tarea concreta de insertar una clavija en un orificio con un brazo xArm6.

El modelo resultante tiene 450.046.176 parámetros (unos 450 M) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Consume tres cámaras RGB de 256x256 píxeles (front, top y wrist) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones a 30 FPS. Es, por tanto, una política de imitación especializada en una única tarea de ensamblaje, no un modelo de propósito general.

Su relevancia actual radica en que demuestra el flujo completo de LeRobot: grabar datos con un robot real, ajustar un VLA preentrenado y desplegar la política con `lerobot-rollout` en una estación de trabajo con GPU consumer. Para desarrolladores e investigadores de robótica es un ejemplo reproducible y de licencia permisiva (Apache 2.0) de un pipeline de aprendizaje por imitación de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según SmolVLA (arXiv 2506.01844); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de robótica; no procesa texto libre) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (la entrada es visual y de estado; la tarea se especifica mediante una instrucción de texto, "insert peg into hole") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción que combina un codificador visual, un codificador de instrucción textual y un decodificador de acciones, siguiendo el diseño descrito en el artículo arXiv 2506.01844. El modelo base `lerobot/smolvla_base` se ajusta de forma supervisada sobre demostraciones de robot (aprendizaje por imitación), no mediante RLHF ni DPO. En esta ficha concreta, el ajuste se realizó sobre el dataset `yugosakaguchi/xarm6_insert_peg`, compuesto por 100 episodios, 60.605 frames a 30 FPS y la única instrucción "insert peg into hole".

La configuración de entrenamiento documentada por el autor es: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.1. La entrada se compone de `observation.state` con forma (6,), tres imágenes `observation.images.camera1/2/3` de (3, 256, 256) y la salida es `action` con forma (6,). No se documentan innovaciones técnicas adicionales específicas de este ajuste fino (por ejemplo, decodificación especulativa o atención lineal) más allá de las del SmolVLA original.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo xArm6 a partir de observaciones multimodales.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB de 256x256 (frontal, cenital y muñeca).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica con el texto "insert peg into hole".
- Aprendizaje por imitación: reproduce la política aprendida de 100 episodios de demostración.
- Ejecución en bucle cerrado a 30 FPS, sincronizada con la frecuencia de grabación del dataset.
- Despliegue en hardware de consumo, según la motivación del SmolVLA original.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Ensamblaje de precisión en línea de producción: la política ejecuta la inserción de clavija en orificio sobre un xArm6, una tarea de tolerancia ajustada típica en celdas de montaje, usando las tres cámaras para corregir la alineación en bucle cerrado.
- Prototipado rápido de nuevas tareas de manipulación: sirve como plantilla reproducible para grabar un dataset propio con LeRobot, ajustar `lerobot/smolvla_base` y desplegar con `lerobot-rollout` en pocas horas.
- Investigación en aprendizaje por imitación: al ser un ajuste fino documentado (20.000 pasos, batch 32, AdamW, lr 1e-4), permite reproducir experimentos y estudiar la sensibilidad a hiperparámetros y al número de episodios.
- Benchmark de referencia para políticas VLA compactas: útil para comparar el rendimiento de modelos de ~450 M de parámetros frente a alternativas mayores en la misma tarea física.
- Formación y docencia en robótica: el flujo completo (instalación de LeRobot, calibración de hardware, grabación, entrenamiento e inferencia) es un caso didáctico de extremo a extremo con licencia Apache 2.0.
- Integración en estaciones de trabajo con GPU consumer: al estar pensado para hardware asequible, puede ejecutarse en un PC con GPU dedicada junto al robot, sin depender de servicios en la nube.
- Base para ajustes posteriores en tareas de inserción similares (por ejemplo, variantes de clavija u orificio), reutilizando los pesos como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (aproximadamente 1,8 GB en FP32 o 0,9 GB en FP16/BF16), más el codificador visual y los buffers de las tres cámaras de 256x256, es razonable esperar un consumo de pocos GB, pero no se documenta una cifra concreta.
- GPU recomendadas: no especificadas en la información proporcionada; el artículo del SmolVLA original indica que está diseñado para hardware de consumo.
- Compatibilidad con GPU consumer: según la motivación del modelo base, sí está pensado para ellas; no se detallan modelos concretos (RTX 4090, etc.) en esta ficha.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot y `lerobot-train` para reentrenamiento, ambos de la librería LeRobot 0.6.1. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: la política opera a 30 FPS, la misma frecuencia del dataset de entrenamiento (60.605 frames en 100 episodios); no se publican cifras de latencia por paso ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yugosakaguchi/smolvla_insert_peg1` | 450 M | VLA ajustada para xArm6 (inserción de clavija) | 3 cámaras 256x256 + estado (6,) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | No disponible en la información proporcionada | VLA base preentrenada | Multimodal (visión + instrucción) | No disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA (p. ej. familias tipo OpenVLA) | No disponible | VLA de propósito general | Visión + instrucción | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo de tarea y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "insert peg into hole" con un xArm6 y tres cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de robot sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del montaje: los nombres y la posición de las cámaras (`front`, `top`, `wrist`) deben coincidir con los usados en el entrenamiento; cambios de iluminación, fondo o colocación de objetos pueden degradar el rendimiento.
- Dataset pequeño: 100 episodios y 60.605 frames son una base limitada; es probable que la política sea sensible a variaciones fuera de la distribución de las demostraciones.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política de imitación, puede generar comandos plausibles pero erróneos fuera de las condiciones vistas, sin mecanismo de verificación explícito.
- Idiomas: no se documenta soporte multilingüe; la instrucción de texto usada es en inglés y el modelo no está pensado para procesamiento de lenguaje general.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías; conviene revisar también las licencias del modelo base y del dataset asociado.
- Para producción: requiere validación empírica propia (número de ensayos, tasa de éxito, condiciones de seguridad del robot) antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yugosakaguchi/smolvla_insert_peg1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yugosakaguchi/xarm6_insert_peg
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yugosakaguchi/xarm6_insert_peg
