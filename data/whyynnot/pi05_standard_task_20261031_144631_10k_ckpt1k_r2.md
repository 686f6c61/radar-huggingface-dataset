# Whyynnot/pi05_standard_task_20261031_144631_10k_ckpt1k_r2

## Resumen

pi05_standard_task_20261031_144631_10k_ckpt1k_r2 es un *fine-tuning* del modelo visión-lenguaje-acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado mediante la librería LeRobot de Hugging Face y publicado por el usuario Whyynnot. El modelo base, `lerobot/pi05_base`, evoluciona π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento; esta versión concreta se ha especializado en una única tarea robótica de manipulación: "pick up the red block and put it on the plate" (coger el bloque rojo y ponerlo en el plato).

El modelo consume observaciones multimodales (estado de las articulaciones y tres flujos de imagen: cámara de cabeza, cámara de muñeca y una cámara vacía) y produce un vector de acción de 6 dimensiones que controla un robot tipo `so_follower` (SO-100/101 de LeRobot). Con 4.143.404.816 parámetros (~4,1 mil millones) y un repositorio de 115,5 GB, es un modelo de investigación en robótica de imitación, no un LLM de propósito general.

Es relevante porque demuestra el flujo completo de *fine-tuning* de un VLA de última generación sobre un dataset propio pequeño (30 episodios, 19.800 fotogramas a 30 FPS) usando herramientas open source (LeRobot 0.6.2), lo que permite a laboratorios y aficionados replicar políticas de manipulación con hardware asequible. No obstante, carece de evaluación publicada y su utilidad está acotada a la tarea y al robot concretos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea son en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Cámaras de entrada | head, wrist, empty_camera_0 |
| Entrada de estado | observation.state, shape (6,) |
| Salida de acción | action, shape (6,) |
| Tamaño del repositorio | 115,5 GB |
| Librería | lerobot 0.6.2 |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π₀.₅ de Physical Intelligence, cuya implementación en LeRobot se adapta del repositorio OpenPI. La arquitectura combina un *backbone* visión-lenguaje con un cabezal de acciones que mapea observaciones (estado articular de 6 dimensiones y tres imágenes RGB: dos a 480×640 y una a 224×224) a comandos motores de 6 dimensiones. No se dispone en la información proporcionada de detalles sobre el número de capas, mecanismos de atención ni innovaciones internas específicas de π₀.₅ (como decodificación de acciones o *flow matching*), por lo que se indica como no disponible.

El entrenamiento es un *fine-tuning* supervisado por imitación sobre el dataset `Whyynnot/standard_task_20261031_144631`: 30 episodios, 19.800 fotogramas a 30 FPS, una única tarea ("pick up the red block and put it on the plate"). La configuración reportada es de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, ejecutado con LeRobot 0.6.2. No se menciona uso de RLHF, DPO ni refuerzo; es aprendizaje por imitación puro sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un robot `so_follower` a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente cámara de cabeza, cámara de muñeca y una tercera cámara (`empty_camera_0`), fusionando información de múltiples puntos de vista.
- Ejecución de instrucciones en lenguaje natural: acepta una descripción textual de la tarea (`--task`) que condiciona la política.
- Generalización derivada de π₀.₅: el modelo base está diseñado para generalizar a entornos y situaciones no vistas; el *fine-tuning* preserva parcialmente esa capacidad, aunque no hay evaluación que lo confirme.
- Política de imitación de una sola tarea: especializada en "coger el bloque rojo y ponerlo en el plato".
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de *tool calling*, agentes multi-paso, matemáticas, código ni generación de texto general; es un modelo exclusivamente de robótica.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de coger un bloque rojo y depositarlo en un plato sobre un robot SO-100/101, adecuado para validar pipelines de imitación con hardware de bajo coste.
- Reproducción de experimentos de VLA: sirve como referencia para comparar el *fine-tuning* de π₀.₅ sobre datasets pequeños (30 episodios) y medir la viabilidad del aprendizaje por imitación con pocos datos.
- Base para *fine-tuning* adicional: partiendo de `lerobot/pi05_base` o de este checkpoint, un laboratorio puede adaptar la política a nuevas tareas de recogida y colocación con su propio dataset.
- Docencia y formación en robótica: permite a estudiantes ejecutar una política VLA entrenada de extremo a extremo con `lerobot-rollout` y estudiar el flujo de datos (observaciones, acciones, FPS).
- Pruebas de integración de hardware: valida la calibración de cámaras (head, wrist) y del robot `so_follower`, así como la correspondencia entre claves de observación y configuración de sensores.
- Benchmark interno de infraestructura: con 4,1 B de parámetros y 115,5 GB de repositorio, sirve para medir latencia de inferencia y throughput en GPUs de consumo o de centro de datos antes de escalar a modelos mayores.
- Prototipado de automatización de tareas repetitivas: en entornos controlados, la política puede ejecutar la tarea de forma autónoma durante un tiempo configurable (`--duration`), útil para estimar tasas de éxito antes de invertir en más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas de robótica (success rate) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,1 B de parámetros en precisión completa (fp32) se requieren aproximadamente 16,6 GB solo para pesos; en fp16/bf16, unos 8,3 GB; en cuantización de 8 bits, unos 4,1 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería suficiente para inferencia en fp16; A100/H100 para entrenamiento o *fine-tuning* con batch size 8.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en fp16; en 8 bits podría caber en GPUs de 8-12 GB, aunque no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de acciones robóticas.
- Latencia y throughput: no disponible. El control se ejecuta a 30 FPS según el dataset de entrenamiento, pero no se publican cifras de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_standard_task_20261031_144631_10k_ckpt1k_r2 | ~4,1 B | no disponible | Pick-and-place (bloque rojo → plato), robot so_follower | gemma | Hugging Face (27 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base para *fine-tuning* | gemma | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista open source (OpenPI) | no disponible | OpenPI / Physical Intelligence |
| Otros VLA de LeRobot (p. ej. SmolVLA) | no disponible | no disponible | Manipulación robótica de bajo coste | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad fuera del dataset de entrenamiento.
- Especialización extrema: entrenado para una única tarea ("pick up the red block and put it on the plate"); no generaliza a otras tareas sin *fine-tuning* adicional.
- Dependencia del hardware: diseñado para el robot `so_follower` y para cámaras concretas (head, wrist, empty_camera_0); cambiar la configuración de sensores o el robot invalida la política.
- Dataset pequeño: solo 30 episodios y 19.800 fotogramas, lo que aumenta el riesgo de sobreajuste y de baja robustez ante cambios de iluminación, posición de objetos o distractores.
- Licencia "gemma": impone restricciones de uso comercial derivadas de los términos de Gemma; es necesario revisar las condiciones de Google antes de un despliegue comercial.
- Idiomas: no se documentan capacidades multilingües; las instrucciones de tarea están en inglés.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones fuera de distribución ante observaciones novedosas, con riesgo de colisiones o daños en el robot.
- Sesgos: no documentados, pero el dataset de 30 episodios probablemente refleja posiciones y condiciones limitadas, lo que sesga la política hacia esas configuraciones.
- Repositorio de 115,5 GB: requiere espacio de almacenamiento considerable y tiempos de descarga elevados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Whyynnot/pi05_standard_task_20261031_144631_10k_ckpt1k_r2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Whyynnot/standard_task_20261031_144631
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Whyynnot/standard_task_20261031_144631
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
