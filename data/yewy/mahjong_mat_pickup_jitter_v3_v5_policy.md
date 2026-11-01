# Yewy/mahjong_mat_pickup_jitter_v3_v5_policy

## Resumen

`Yewy/mahjong_mat_pickup_jitter_v3_v5_policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo desarrolla el usuario Yewy y se distribuye a través del ecosistema LeRobot de Hugging Face, con la librería `lerobot` como dependencia de ejecución. Su propósito es controlar un brazo robótico (variantes SO100/SO101 y plataforma LeKiwi) para la tarea concreta de recoger una alfombrilla de mahjong en escenarios con jitter (variaciones y ruido en la posición inicial).

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo fundacional generalista, sino un checkpoint de política visomotora de 51.668.614 parámetros (aproximadamente 51,7 M) entrenado sobre un dataset propio de demostraciones teleoperadas (`Yewy/mahjong_mat_pickup_jitter_v3_v5_224`). El repositorio ocupa 0,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que permite reutilización comercial sin restricciones adicionales más allá de las de dicha licencia.

Al tratarse de un modelo de robótica con pipeline `robotics`, sus entradas son observaciones visuales y su salida es una secuencia de acciones motrices, no texto. Por tanto, las secciones de idiomas, contexto, benchmarks de NLP y cuantización estándar no aplican y se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por el dataset de 224 px) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Yewy/mahjong_mat_pickup_jitter_v3_v5_224 |
| Hardware objetivo | SO101 / SO100 follower, LeKiwi |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso de control, predice un chunk de acciones futuras de forma conjunta. La arquitectura combina un backbone transformer con un codificador de observaciones (imágenes de cámara y estado de las articulaciones) y un decodificador que emite la secuencia de acciones. Este diseño reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas con datos teleoperados relativamente modestos, que es la motivación original del paper.

En este checkpoint concreto no se dispone de información sobre el número exacto de episodios de demostración, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos más allá del propio jitter reflejado en el nombre. El sufijo `v3_v5` y `jitter` sugiere variantes del dataset con perturbaciones en la posición de la alfombrilla, pero el autor no detalla el procedimiento en la model card. Tampoco se documenta el uso de RLHF, DPO ni fine-tuning por refuerzo, algo por otra parte ajeno al paradigma ACT estándar.

## Capacidades

- Control visomotor para una tarea de pick-and-place concreta: recogida de una alfombrilla de mahjong.
- Predicción de chunks de acciones en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Robustez frente a variaciones de posición inicial (jitter) dentro del rango cubierto por el dataset de entrenamiento.
- Integración nativa con el stack LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatibilidad con robots SO100/SO101 follower y plataforma LeKiwi.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de pick-and-place de mahjong: el modelo recibe imágenes de la cámara y el estado articular, y emite comandos para que el brazo SO101 recoja la alfombrilla. Es adecuado porque está entrenado exactamente sobre esa tarea.
- Evaluación de robustez frente a jitter: al haberse entrenado con variaciones de posición, sirve como referencia para medir la degradación de una política ACT cuando el objeto no está en la posición nominal.
- Base para fine-tuning en tareas de manipulación similares: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset propio de otra pieza plana, aprovechando el backbone ya ajustado.
- Benchmark interno de pipelines LeRobot: útil para validar la cadena completa de entrenamiento, registro de episodios y despliegue en un robot real antes de escalar a tareas más complejas.
- Docencia y prototipado en robótica de imitación: un ejemplo reproducible de política ACT de tamaño pequeño (51,7 M de parámetros, 0,2 GB) que cabe en cualquier equipo de desarrollo.
- Integración en un sistema LeKiwi móvil: la política puede desplegarse en la plataforma LeKiwi para tareas de recogida en entornos con posición variable del objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1 GB o menos, dado el tamaño de 51,7 M de parámetros en safetensors (0,2 GB de pesos) más el codificador visual.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada con soporte CUDA/ROCm puede ejecutar la política.
- Cabe holgadamente en GPU consumer, incluidos portátiles con GPU discreta de gama media.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA. No se documentan exportaciones a ONNX, TensorRT ni llama.cpp/Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yewy/mahjong_mat_pickup_jitter_v3_v5_policy | 51,7 M | Pick-and-place de alfombrilla de mahjong con jitter | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas en LeRobot Hub | variable (tipicamente 10-80 M) | Manipulación diversa según dataset | variable | Hugging Face (LeRobot) |
| Políticas Diffusion Policy | variable | Manipulación visomotora | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo es fiable en la tarea y el entorno para los que fue entrenado; no generaliza a otras piezas ni a otras configuraciones de cámara sin reentrenamiento.
- Sin datos publicados de tasa de éxito, varianza entre episodios ni curvas de aprendizaje, lo que impide evaluar su robustez real más allá del nombre del checkpoint.
- Riesgo de sobreajuste al dataset de entrenamiento y de degradación ante cambios de iluminación, fondo o calibración del robot no cubiertos por el jitter del dataset.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (LeRobot, PyTorch) y del dataset asociado antes de desplegar en producción.
- El repositorio tiene muy poca tracción (28 descargas, 0 likes) y una única versión publicada, por lo que no hay evidencia de mantenimiento ni de validación por parte de terceros.
- La fecha de creación indicada (2026-10-29) es posterior a la de redacción habitual de fichas; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewy/mahjong_mat_pickup_jitter_v3_v5_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_mat_pickup_jitter_v3_v5_224
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
