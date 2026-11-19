# Tridex/smolvla_3cam_100K_18_11

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face en el marco del proyecto LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `Tridex/smolvla_3cam_100K_18_11`, es un fine-tuning de `lerobot/smolvla_base` realizado por el usuario Tridex sobre un dataset propio de manipulación robótica con tres cámaras. El modelo consume el estado articular del robot y tres flujos de imagen de 256x256 píxeles, y produce un vector de acción de 6 dimensiones para el robot tipo `so_follower`.

El modelo resuelve el problema de la política de control extremo a extremo para tareas de manipulación: en lugar de programar reglas o usar percepción y planificación separadas, aprende directamente un mapeo de observaciones visuales y propioceptivas a comandos motores a partir de demostraciones humanas. Con 450 millones de parámetros, está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados que quieren prototipar políticas robóticas sin clústeres de GPU.

La tarea concreta aprendida es la selección y clasificación de objetos: tomar el rotulador fluorescente amarillo y la botella de gaseosa y depositarlos en una caja rosa, evitando explícitamente el mechero (briquet). El modelo se entrenó durante 40.000 pasos con un batch de 8 sobre 81 episodios (72.299 frames a 30 FPS) y se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (transformer multimodal con política de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en inglés: "take the yellow fluo and drop it inside the pink box...") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un cabezal de política que emite acciones continuas. El modelo base `lerobot/smolvla_base` se preentrena y después se fine-tunea por imitación sobre demostraciones específicas de robot. En este caso, la política recibe tres imágenes (cámaras `front`, `side`, `top`) de 3x256x256 y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones compatible con el robot `so_follower` de LeRobot.

El fine-tuning se realizó con 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.2. El dataset `Tridex/79_fluo-gazeuse_vs_briquet_final` contiene 81 episodios y 72.299 frames a 30 FPS, con una única instrucción en lenguaje natural que describe la tarea de recogida selectiva de objetos. No se documenta uso de RLHF/DPO ni de decodificación especulativa; se trata de aprendizaje por imitación supervisado sobre acciones.

## Capacidades

- Control robótico de manipulación extremo a extremo a partir de tres cámaras RGB y estado articular.
- Ejecución de una tarea de pick-and-place con instrucción en lenguaje natural: seleccionar el rotulador fluorescente y la gaseosa y depositarlos en la caja rosa.
- Discriminación negativa: la política está entrenada para no tomar el mechero (briquet), lo que implica capacidad de evitar un objeto distractor concreto.
- Fusión multisensorial de tres vistas (frontal, lateral y superior) para robustez ante oclusiones parciales.
- Salida de acciones continuas de 6 grados de libertad compatible con el robot `so_follower`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, visión general o audio; es una política específica de robot, no un modelo de propósito general.

## Casos de uso

- Clasificación automatizada de residuos o materiales en líneas de laboratorio: la política demuestra la capacidad de separar objetos por categoría (fluo y gaseosa frente a mechero) y depositarlos en un contenedor designado, patrón directamente transferible a tareas de triaje.
- Prototipado rápido de políticas de manipulación en investigación: al ser un fine-tuning de SmolVLA con 450 M de parámetros, un laboratorio puede reproducir el pipeline de entrenamiento con `lerobot-train` y adaptar la política a su propio robot `so_follower` en horas, no semanas.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado sirven como ejemplo completo y reproducible de grabación de datos, entrenamiento y despliegue con LeRobot.
- Pruebas de robustez ante distracciones: la instrucción explícita de no tomar el mechero permite evaluar cómo responde la política ante objetos distractores en el espacio de trabajo, un caso de estudio útil para medir sesgos de atención visual.
- Automatización de tareas de recogida en entornos controlados con cámara múltiple: las tres vistas (front, side, top) aportan información redundante que puede compensar oclusiones en celdas de trabajo con iluminación estable.
- Benchmark interno de políticas VLA compactas: sirve como referencia de línea base para comparar fine-tunings propios sobre el mismo robot y dataset, dado que el modelo base y la configuración de entrenamiento están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de MMLU, HumanEval, GSM8K u otras, que además no aplican a una política de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (0,9 GB de repo), la inferencia en fp32 requiere aproximadamente 1,8 GB de pesos, más overhead de activaciones y buffers de imagen; en fp16/bf16 se reduce a unos 0,9 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder ejecutar la política, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas con 6 GB o más, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado en la model card; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para políticas VLA de control.
- Latencia y throughput estimados: no disponibles; dependen del robot, de la frecuencia de control (el dataset se grabó a 30 FPS) y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/smolvla_3cam_100K_18_11 | 450 M | no aplica (política) | Pick-and-place con 3 cámaras, robot `so_follower` | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no aplica (política) | Modelo base VLA preentrenado, fine-tuneable | no disponible en la informacion | Hugging Face |
| Políticas de imitación tipo ACT/DP (LeRobot) | no disponible en la informacion | no aplica (política) | Manipulación por imitación | no disponible en la informacion | LeRobot |

La comparación con alternativas de la misma categoría (otras políticas VLA o de imitación) no puede completarse con datos verificables a partir de la información proporcionada; los datos de parámetros, contexto y rendimiento de los modelos comparables no están disponibles.

## Limitaciones y advertencias

- Es una política específica de tarea: solo se ha entrenado para la instrucción "take the yellow fluo and drop it inside the pink box and take the gazeuse and drop it inside the pink box, but nerver try to take the briquet". No generaliza a otras instrucciones ni a otros objetos sin reentrenamiento.
- Dependencia del hardware exacto: entrenada para el robot `so_follower` con tres cámaras concretas (`front`, `side`, `top`); cambios de calibración, montaje o índices de cámara pueden degradar el comportamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste al dataset: 81 episodios y 72.299 frames es un volumen modesto; la política puede memorizar posiciones y no generalizar bien fuera de la distribución de demostraciones.
- Sesgos de atención: la instrucción negativa sobre el mechero puede producir comportamientos de evitación excesivos o erráticos si el objeto aparece en posiciones no vistas durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Idiomas: la instrucción está en inglés; no se documenta soporte multilingüe.
- No apta para usos de lenguaje general, razonamiento, código o visión fuera del contexto robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/smolvla_3cam_100K_18_11
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/79_fluo-gazeuse_vs_briquet_final
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/79_fluo-gazeuse_vs_briquet_final
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
