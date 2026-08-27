# woojin0831/act_so101_block_pick_place_3x3_v1

## Resumen

El modelo `woojin0831/act_so101_block_pick_place_3x3_v1` es una política de robótica basada en Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con datos teleoperados. Fue desarrollada por el usuario woojin0831 y publicada en HuggingFace bajo licencia Apache 2.0, utilizando la librería LeRobot en su versión 0.6.1. El modelo está diseñado para controlar un brazo robótico SO101 (tipo `so_follower`) en una tarea concreta de recogida y colocación de bloques en una cuadrícula de 3x3.

La arquitectura ACT, propuesta en el artículo arxiv 2304.13705, predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo cuenta con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT sobre un robot de bajo coste, con un pipeline completo documentado para entrenamiento e inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en Transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones de longitud fija en lugar de acciones individuales. La política consume observaciones multimodales: un vector de estado de 6 dimensiones (`observation.state`) y tres imágenes RGB de 480x640 píxeles procedentes de cámaras frontal, superior y de pinza (`observation.images.front`, `observation.images.top`, `observation.images.gripper`). Produce como salida un vector de acción de 6 dimensiones (`action`), correspondiente a los grados de libertad del brazo SO101.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `woojin0831/so101_block_pick_place_3x3_v1`, que contiene 90 episodios y 47.663 fotogramas a 30 FPS, capturados mediante teleoperación. La configuración de entrenamiento incluye 59.580 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. No se especifica el uso de RLHF, DPO ni técnicas de refuerzo adicionales; el aprendizaje es puramente por imitación supervisada sobre los datos teleoperados.

## Capacidades

- Ejecución de tareas de recogida y colocación de bloques en una cuadrícula 3x3, con la instrucción "Pick up the block and place it in the target area".
- Percepción visual multimodal con tres cámaras simultáneas (frontal, superior y de pinza) a 480x640 píxeles.
- Control de 6 grados de libertad del brazo robótico SO101, incluyendo posición y orientación de la pinza.
- Generación de secuencias de acciones (action chunking) para movimientos suaves y estables.
- Inferencia en tiempo real a 30 FPS, compatible con el flujo de trabajo de LeRobot.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger un bloque y colocarlo en una zona objetivo, útil para validar pipelines de aprendizaje por imitación en brazos robóticos de bajo coste.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de manipulación con datos teleoperados, permitiendo comparar variantes de arquitectura o configuraciones de entrenamiento.
- Prototipado de celdas de trabajo robóticas: al ser un modelo ligero (0,2 GB), puede desplegarse en estaciones de trabajo con GPU de consumo para pruebas rápidas de viabilidad antes de escalar a entornos industriales.
- Formación y educación en robótica: el repositorio incluye instrucciones completas de instalación, entrenamiento y rollout, lo que lo convierte en un recurso didáctico para cursos de robótica y aprendizaje automático.
- Benchmarking de políticas ACT: la tarea estandarizada de 3x3 permite comparar el rendimiento de distintas políticas entrenadas con LeRobot sobre el mismo hardware y dataset.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede integrarse en flujos donde un operador humano demuestra la tarea y la política la reproduce de forma autónoma, reduciendo la carga de trabajo repetitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de éxito en robot real ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 51,6 millones de parámetros y un tamaño de 0,2 GB, el modelo es compatible con GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) es suficiente para inferencia; el entrenamiento se realizó con `--policy.device=cuda`.
- Compatibilidad con hardware de consumo: sí, el modelo cabe en GPUs de gama media y baja, e incluso podría ejecutarse en CPU para pruebas de baja frecuencia.
- Opciones de despliegue: LeRobot (framework principal), con comandos `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La política está diseñada para operar a 30 FPS, que es la frecuencia de captura del dataset, pero no se han publicado mediciones reales de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Framework | Licencia | Evaluacion |
|---|---|---|---|---|---|
| woojin0831/act_so101_block_pick_place_3x3_v1 | 51,7 M | Pick-and-place 3x3 | LeRobot | Apache 2.0 | Sin resultados publicados |
| Políticas ACT genéricas de LeRobot (ej. ejemplos oficiales) | Variable (tipicamente 20-100 M) | Manipulacion variada | LeRobot | Apache 2.0 | Depende del modelo |
| Modelos BB-ACT para SO100/SO101 (tutoriales de terceros) | No disponible | Pick-and-place | LeRobot / Phosphobot | No disponible | No disponible |

No se dispone de información suficiente sobre modelos comparables con métricas de rendimiento publicadas. Los tutoriales de terceros (SO101_ACT_Training, Trelis substack) documentan entrenamientos similares con ACT sobre brazos SO-101, pero no publican resultados cuantitativos comparables.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card no incluye tasas de éxito en robot real, por lo que el rendimiento real del modelo es desconocido y no debe asumirse como fiable en producción.
- Especificidad de la tarea: el modelo está entrenado exclusivamente para la tarea de recoger un bloque y colocarlo en una zona objetivo sobre una cuadrícula 3x3. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: la política está entrenada para el robot SO101 (`so_follower`) con tres cámaras específicas (frontal, superior, pinza). Cambios en la configuración de cámaras, iluminación o calibración pueden degradar el rendimiento.
- Datos de entrenamiento limitados: solo 90 episodios, lo que puede provocar sobreajuste a las condiciones específicas de captura (posiciones de objetos, iluminación, fondo).
- Riesgo de alucinación de acciones: como cualquier política de imitación, puede generar acciones incorrectas ante estados no vistos durante el entrenamiento, sin mecanismo de detección de errores.
- Sin soporte multilingüe ni capacidades de lenguaje: es un modelo puramente motor, no procesa texto ni instrucciones naturales más allá de la tarea fija.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/woojin0831/act_so101_block_pick_place_3x3_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/woojin0831/so101_block_pick_place_3x3_v1
- Dataset relacionado (variante): https://huggingface.co/datasets/woojin0831/so101_block_pick_place_3x3_v1_20260827_150141
- Dataset relacionado (pick_place_50): https://huggingface.co/datasets/woojin0831/so101_pick_place_50_v1
- Paper ACT (arxiv 2304.13705): https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento SO101 con SOLO CLI: https://github.com/omkarputti/SO101_ACT_Training
- Tutorial de entrenamiento ACT para SO-101 (Trelis): https://trelis.substack.com/p/train-an-act-policy-for-an-so-101
- Tutorial en vídeo para SO100/SO101: https://www.youtube.com/watch?v=vC7E6ZmXBT8
