# wandelbotsgmbh/act_Data-Real_policy

## Resumen

El modelo `wandelbotsgmbh/act_Data-Real_policy` es una política de aprendizaje por imitación para control robótico, desarrollada por Wandelbots GmbH y entrenada con el framework LeRobot de Hugging Face. Se basa en el método Action Chunking with Transformers (ACT), presentado en el paper arXiv:2304.13705, que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y precisión en tareas de manipulación robótica. El modelo ha sido entrenado sobre el dataset `wandelbotsgmbh/Data-Real`, que contiene datos de teleoperación de robots reales, y está publicado bajo licencia Apache-2.0.

Con aproximadamente 51,6 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real en sistemas embebidos o GPUs de gama media. Su relevancia actual radica en que demuestra cómo el aprendizaje por imitación con arquitecturas transformer puede transferirse a entornos industriales reales, un paso clave hacia la automatización flexible de robots. Al estar integrado en LeRobot, ofrece un flujo de trabajo reproducible para entrenar, evaluar y desplegar políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con predicción de secuencias de acciones |
| Parametros totales | 51.617.415 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se refiere a ventana de observación, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que procesa observaciones (imágenes y estados del robot) y genera un chunk de acciones futuras (por ejemplo, una secuencia de posiciones del efector final). A diferencia de los métodos que predicen un solo paso, ACT utiliza un decodificador autorregresivo que produce múltiples acciones a la vez, lo que reduce la acumulación de errores y mejora la suavidad del movimiento. El entrenamiento se realiza mediante imitación supervisada sobre datos de teleoperación, sin necesidad de recompensas ni aprendizaje por refuerzo.

Los detalles específicos del entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Se sabe que el dataset `wandelbotsgmbh/Data-Real` contiene demostraciones reales recopiladas con robots industriales, probablemente mediante teleoperación. El modelo se ha entrenado con LeRobot, que utiliza una configuración estándar para ACT (por ejemplo, backbones de visión como ResNet, y un transformer con capas de atención). No se documentan innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para tareas de manipulación, como alcanzar, agarrar o colocar objetos.
- Aprendizaje a partir de demostraciones: puede reproducir comportamientos aprendidos de datos de teleoperación, sin necesidad de programación explícita.
- Generalización a entornos reales: al estar entrenado con datos reales, es adecuado para robots físicos en entornos industriales o de investigación.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue de políticas robóticas.
- No soporta procesamiento de lenguaje, visión general ni tool calling: es un modelo especializado en control motor.

## Casos de uso

- Automatización de tareas repetitivas en líneas de producción: el modelo puede aprender a realizar operaciones de pick-and-place o ensamblaje a partir de demostraciones humanas, reduciendo el tiempo de programación de robots industriales.
- Robótica asistida en laboratorios de investigación: permite a investigadores implementar políticas de manipulación sin escribir código de control complejo, usando LeRobot para entrenar y evaluar.
- Teleoperación aumentada: puede usarse para asistir a un operador humano, suavizando los movimientos o completando trayectorias parciales.
- Prototipado rápido de nuevas tareas robóticas: con pocas demostraciones, se puede entrenar una política para una nueva tarea y desplegarla en un robot SO-100 u otros compatibles.
- Educación en robótica y aprendizaje por imitación: sirve como ejemplo práctico de entrenamiento de políticas con transformers, útil para cursos y talleres.
- Evaluación de algoritmos de control en robots reales: al ser un modelo ligero, puede ejecutarse en tiempo real en GPUs de gama media, facilitando pruebas comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas específicas, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el paper de ACT (arXiv:2304.13705) para resultados generales del método, pero no se dispone de métricas concretas para esta política entrenada con datos reales.

## Requisitos de hardware

- Tamaño del modelo: 51,6 millones de parámetros, lo que en FP32 ocupa aproximadamente 206 MB (0,2 GB según el repositorio). En FP16, alrededor de 103 MB.
- VRAM estimada: para inferencia en tiempo real, se estima que cabe en GPUs con al menos 2 GB de VRAM, aunque depende de la resolución de las imágenes de entrada y del tamaño del batch. Una GPU como la NVIDIA GTX 1650 o superior podría ser suficiente.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) para entrenamiento o inferencia. Para despliegue en robótica, se pueden usar GPUs embebidas como Jetson Orin.
- Compatibilidad con hardware de consumo: sí, es un modelo ligero que puede ejecutarse en GPUs de consumo medio.
- Opciones de despliegue: LeRobot proporciona scripts para entrenar y evaluar con `lerobot-train` y `lerobot-record`. También es compatible con frameworks como PyTorch y puede exportarse a ONNX o TensorRT para optimización.
- Latencia y throughput: no hay datos publicados. Dado el tamaño, se espera una inferencia de unos pocos milisegundos por chunk en GPUs modernas, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. El modelo se basa en ACT, que es uno de los métodos más utilizados en aprendizaje por imitación robótica. Alternativas comunes en el ecosistema LeRobot incluyen:

- **Diffusion Policy**: genera acciones mediante modelos de difusión, a menudo con mayor expresividad pero mayor coste computacional.
- **VQ-BeT**: utiliza discretización de acciones con transformers, similar a ACT pero con cuantización vectorial.
- **ACT con diferentes backbones o datasets**: otros checkpoints de ACT entrenados con distintos datasets (por ejemplo, simulación o datos públicos como Aloha).

Sin embargo, no hay métricas comparativas publicadas en la información proporcionada. Se recomienda consultar los benchmarks del paper de ACT o los resultados de LeRobot en su documentación.

## Limitaciones y advertencias

- Sesgos del dataset: al estar entrenado con datos de teleoperación de Wandelbots, puede no generalizar a otros robots o entornos sin fine-tuning.
- Riesgo de alucinación de acciones: como cualquier modelo de imitación, puede generar movimientos no deseados si las observaciones difieren de las del entrenamiento.
- Sin capacidades de razonamiento simbólico: no entiende instrucciones en lenguaje natural ni planifica tareas de alto nivel.
- Dependencia de la calidad de las demostraciones: el rendimiento está limitado por la calidad y diversidad de los datos de teleoperación.
- Licencia Apache-2.0: permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia.
- Sin soporte para otros idiomas ni procesamiento de texto: es exclusivamente un modelo de control motor.
- No se han documentado limitaciones de contexto ni de ventana de observación; se recomienda consultar la documentación de LeRobot para configuraciones típicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wandelbotsgmbh/act_Data-Real_policy)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Organización de Wandelbots en GitHub](https://github.com/wandelbotsgmbh)
- [Sitio web de Wandelbots](https://www.wandelbots.com/)
