# tkyoun13/so101_exp1_kiwi_smolvla

## Resumen

`tkyoun13/so101_exp1_kiwi_smolvla` es una política robótica de tipo vision-language-action (VLA) publicada en Hugging Face por el usuario tkyoun13. Se trata de un fine-tuning del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot (versión 0.6.2) y entrenado sobre el dataset propio `tkyoun13/so101_exp1_kiwi`. Con 450.046.176 parámetros (~450 M) y un repositorio de 0,9 GB, es un modelo compacto pensado para control robótico por imitación en hardware asequible.

El modelo resuelve dos tareas concretas de manipulación: "Pick up the kiwi and place it into the left basket" y "Pick up the kiwi and place it into the right basket", sobre un robot SO-101 (`so_follower`) con dos cámaras declaradas en la model card (`top`, `wrist`) aunque la interfaz de entrada define tres claves visuales de 256x256 píxeles. Consume un vector de estado de 6 dimensiones y produce un vector de acción de 6 dimensiones, es decir, control articular de 6 grados de libertad.

Su relevancia radica en que hereda el enfoque de SmolVLA (paper arXiv:2506.01844): adaptar un modelo de visión-lenguaje compacto a robótica y lograr un VLA desplegable en GPU de consumo, en lugar de los VLA de miles de millones de parámetros habituales. Este checkpoint concreto es, además, un ejemplo reproducible de flujo de trabajo de fine-tuning con LeRobot sobre un dataset pequeño y específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer, derivada de SmolVLA (modelo base `lerobot/smolvla_base`) |
| Parámetros totales | 450.046.176 (~450 M) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio se publica en precisión completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |

Datos adicionales de la model card: tipo de robot `so_follower`, cámaras `top` y `wrist`, tamaño del repositorio 0,9 GB, pipeline `robotics`.

## Arquitectura y entrenamiento

La arquitectura es la de SmolVLA: un modelo de visión-lenguaje compacto que se adapta a robótica añadiendo un experto de acciones, de modo que la política procesa observaciones multimodales (imágenes y estado propioceptivo) y emite acciones de control continuas. En este checkpoint, las entradas declaradas son `observation.state` con forma `(6,)` y tres entradas visuales `observation.images.camera1`, `camera2` y `camera3` con forma `(3, 256, 256)` cada una; la salida es `action` con forma `(6,)`. El detalle interno de capas, mecanismo de atención y estrategia de decodificación de acciones no está documentado en la información disponible y debe consultarse en el paper de SmolVLA.

El entrenamiento es un fine-tuning de imitación sobre el dataset `tkyoun13/so101_exp1_kiwi`, compuesto por 200 episodios y 88.688 fotogramas a 30 FPS, con dos tareas de recogida y colocación de un kiwi. La configuración registrada es: 25.000 pasos de entrenamiento, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documenta en la información disponible si hubo fases de RLHF, DPO u otro ajuste posterior, ni la composición exacta de datos de preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones para un robot SO-101 a partir de observaciones de estado y visión.
- Percepción visual multi-cámara: acepta hasta tres flujos de imagen de 256x256 píxeles (`camera1`, `camera2`, `camera3`).
- Condicionamiento por lenguaje natural: la tarea se especifica mediante una cadena de texto, por ejemplo "Pick up the kiwi and place it into the left basket".
- Ejecución de políticas entrenadas con LeRobot: compatible con el comando `lerobot-rollout` y con el ciclo de entrenamiento `lerobot-train`.
- Generalización limitada a las dos tareas del dataset de entrenamiento (cesta izquierda y cesta derecha).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio, visión generalista): no disponibles; el modelo es una política de control, no un asistente conversacional.

## Casos de uso

- Recogida y clasificación de objetos en línea de laboratorio: el modelo puede ejecutar la tarea de coger un kiwi y depositarlo en la cesta izquierda o derecha, útil como banco de pruebas de manipulación con SO-101.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del número de episodios (200 en este caso) y de la configuración de entrenamiento en la tasa de éxito de una política VLA.
- Docencia y formación en robótica: permite montar un pipeline completo de LeRobot (grabación de datos, calibración, entrenamiento y despliegue) con un modelo de 450 M que cabe en una GPU de consumo.
- Prototipado rápido de nuevas tareas de pick-and-place: reentrenando desde `lerobot/smolvla_base` con un dataset propio, este checkpoint sirve de plantilla de configuración y de referencia de hiperparámetros.
- Validación de hardware y calibración de cámaras: al depender de claves de observación concretas, es útil para verificar que la disposición de cámaras `top`/`wrist` y el puerto del robot están correctamente configurados antes de entrenar modelos mayores.
- Benchmark interno de políticas compactas: permite comparar, en un mismo robot y con las mismas dos tareas, el rendimiento de un VLA de ~450 M frente a alternativas mayores en coste computacional y latencia.
- Automatización de demostraciones en ferias o vídeos técnicos: el comando de rollout permite ejecutar la política durante un tiempo acotado (`--duration`) sin grabar episodios, adecuado para demostraciones en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito en robot real ni métricas de simulación para este checkpoint. El repositorio tampoco reporta comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1,8 GB en función de la precisión (el repositorio completo ocupa 0,9 GB); no se dispone de cifras oficiales de consumo en ejecución.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente por tamaño de modelo; no hay recomendaciones oficiales de NVIDIA A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros (~450 M) es plausible en GTX 1650, RTX 3060, RTX 4060 y superiores; no hay confirmación oficial.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=tkyoun13/so101_exp1_kiwi_smolvla`; el entrenamiento posterior se realiza con `lerobot-train`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (orientado a `policy.device=cuda` en LeRobot).
- Latencia y throughput estimados: no disponibles. La ejecución está limitada por el bucle de control del robot y por la frecuencia de las cámaras (30 FPS en el dataset), no por el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tkyoun13/so101_exp1_kiwi_smolvla` | 450.046.176 | No disponible | Apache 2.0 | Hugging Face, librería `lerobot` | Fine-tuning sobre 200 episodios y dos tareas concretas |
| `lerobot/smolvla_base` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face | Modelo base del que deriva este checkpoint; entrenado para fine-tuning posterior |
| `tkyoun13/so101_kiwi_lr_v4_smolvla` | No disponible | No disponible | No disponible | Hugging Face | Otro checkpoint del mismo autor sobre el mismo dominio; no se dispone de datos comparativos de rendimiento |

No se dispone de datos verificados de benchmarks ni de tasas de éxito para ninguno de los modelos de la tabla, por lo que la comparación queda limitada a parámetros y licencia. La comparación con VLA de mayor tamaño (por ejemplo OpenVLA o pi0) no se incluye porque no hay datos contrastados en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no existen tasas de éxito en robot real, por lo que se desconoce su fiabilidad práctica.
- Especialización extrema: está entrenado únicamente para dos tareas de pick-and-place de un kiwi en un SO-101; no generaliza a otros objetos, tareas ni morfologías de robot sin reentrenamiento.
- Acoplamiento al hardware y a las cámaras: la política espera las claves de observación exactas (`observation.images.camera1/2/3`, `observation.state`) y una configuración de cámaras concreta; un cambio de nombre, resolución o montaje puede degradar o invalidar el comportamiento.
- Sesgos conocidos: no disponibles. Al entrenarse con 200 episodios de un único entorno, es probable que herede los sesgos de posición, iluminación y fondo de ese dataset, pero no hay análisis publicado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o incompletas ante posiciones de objeto, iluminación o distracciones no vistas en entrenamiento.
- Limitaciones de contexto e idioma: ni la longitud de contexto ni los idiomas soportados están documentados; las instrucciones de tarea del dataset están en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de `lerobot/smolvla_base` conviene verificar la licencia y las condiciones del modelo base y del dataset antes de un despliegue productivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Fechas del repositorio: creado el 2026-10-08 y actualizado el mismo día, lo que sugiere que no ha recibido mantenimiento posterior.
- La model card no documenta cuantizaciones, así que un despliegue en entornos con memoria muy restringida requeriría convertir los pesos por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkyoun13/so101_exp1_kiwi_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tkyoun13/so101_exp1_kiwi
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tkyoun13/so101_exp1_kiwi
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot (referencia): https://github.com/huggingface/lerobot
- Repositorio de práctica SmolVLA/SO-100: https://github.com/l2ktech/smolvla_project
- Fork de LeRobot para SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
- Otro checkpoint del mismo autor: https://huggingface.co/tkyoun13/so101_kiwi_lr_v4_smolvla
- Dataset adicional del autor: https://huggingface.co/datasets/tkyoun13/so101
