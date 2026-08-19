# yukamatsumae/molmoact2_otter_toycarresearch_20260817

## Resumen

El modelo `yukamatsumae/molmoact2_otter_toycarresearch_20260817` es una política robótica (policy) entrenada con la librería LeRobot de HuggingFace. Está diseñado para controlar un robot mediante aprendizaje por imitación, concretamente sobre un dataset de demostraciones de un coche de juguete (`ToyCarResearch_20260817_020059`). El nombre del modelo sugiere una arquitectura basada en ACT (Action Chunking Transformer) con un codificador visual de la familia Molmo, aunque la model card solo indica explícitamente `policy.type=act`. Con aproximadamente 5.400 millones de parámetros, es un modelo de tamaño considerable para tareas de robótica, lo que indica que incorpora un backbone de visión de gran capacidad.

Este modelo es relevante porque demuestra la aplicación de arquitecturas multimodales modernas al control robótico, un campo en auge. Al estar publicado con licencia Apache 2.0 y en formato safetensors, es accesible para la comunidad investigadora y de desarrollo. Sin embargo, al ser un modelo especializado en una tarea concreta (conducir un coche de juguete), su utilidad fuera de ese dominio es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con posible backbone visual Molmo (no confirmado) |
| Parametros totales | 5.442.196.272 (~5,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está entrenado con LeRobot, el framework de HuggingFace para robótica, utilizando el tipo de política ACT (Action Chunking Transformer). ACT es una arquitectura basada en transformers que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. El nombre "molmoact2" sugiere que el codificador visual podría ser un modelo de la familia Molmo (un modelo multimodal), aunque la model card no lo confirma explícitamente.

El entrenamiento se realizó sobre el dataset `yukamatsumae/ToyCarResearch_20260817_020059`, que contiene demostraciones de un coche de juguete. No se especifica el número de episodios, la duración total ni el método de entrenamiento (solo se menciona el uso de LeRobot). No hay indicios de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control robótico mediante predicción de acciones (posición del motor, velocidad, etc.) a partir de imágenes y estado del robot.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Manejo de secuencias de acciones (action chunking) para movimientos suaves y coordinados.
- Integración con el ecosistema LeRobot: permite entrenamiento, evaluación y despliegue en robots reales o simulados.
- No es un modelo de lenguaje: no genera texto ni comprende instrucciones verbales.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los transformers de visión actúan en tareas de control continuo, especialmente en entornos con objetos pequeños como coches de juguete.
- Desarrollo de robots de bajo coste: puede desplegarse en robots tipo SO-100 (u otros compatibles con LeRobot) para tareas de navegación o manipulación simple, siempre que la tarea sea similar a la demostrada.
- Benchmarking de arquitecturas: permite comparar el rendimiento de ACT con backbone Molmo frente a otras variantes (por ejemplo, ACT con ResNet) en la misma tarea.
- Educación en robótica: útil como ejemplo práctico de entrenamiento de políticas con LeRobot, ya que el dataset y el código están disponibles.
- Prototipado rápido: al estar preentrenado, puede evaluarse inmediatamente en un robot compatible para comprobar su comportamiento antes de reentrenar con nuevos datos.
- Transferencia a tareas similares: con fine-tuning sobre un pequeño conjunto de demostraciones nuevas, podría adaptarse a otras tareas de conducción o navegación de vehículos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de éxito, tasa de finalización de episodios ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.400 millones de parámetros, en precisión fp32 se necesitan ~21,8 GB solo para los pesos. En fp16 serían ~10,9 GB, más los activos y el overhead de la inferencia. Se recomienda al menos 16 GB de VRAM para fp16, y 24 GB o más para fp32.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). GPUs con menos de 16 GB no son adecuadas.
- En consumer GPU: sí, una RTX 3090 o 4090 puede ejecutar el modelo en fp16, aunque con margen limitado.
- Opciones de despliegue: LeRobot soporta inferencia con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en el mismo repositorio o en la documentación. Podrían existir otras políticas ACT entrenadas con LeRobot, pero no hay datos públicos para establecer una comparación objetiva. Se recomienda consultar el Hub de HuggingFace con el filtro `library_name:lerobot` para encontrar modelos similares.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado exclusivamente para una tarea de conducción de un coche de juguete. No generaliza a otras tareas robóticas sin fine-tuning.
- Sin datos de sesgos: al ser un modelo de control motor, los sesgos típicos de los LLM (lenguaje, género, etc.) no aplican, pero puede haber sesgos en los datos de demostración (por ejemplo, trayectorias limitadas a un entorno concreto).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero puede producir acciones erróneas si las observaciones difieren de las del entrenamiento.
- Dependencia del dataset: el rendimiento depende directamente de la calidad y variedad de las demostraciones del dataset `ToyCarResearch_20260817_020059`.
- Requisitos de hardware elevados: para ser un modelo de robótica de bajo coste, 5,4 B de parámetros es una carga computacional considerable, lo que limita su uso en robots con hardware modesto.
- Sin documentación técnica detallada: la model card es genérica de LeRobot y no incluye detalles sobre la arquitectura exacta, hiperparámetros ni resultados.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/yukamatsumae/molmoact2_otter_toycarresearch_20260817](https://huggingface.co/yukamatsumae/molmoact2_otter_toycarresearch_20260817)
- Dataset de entrenamiento: [https://huggingface.co/datasets/yukamatsumae/ToyCarResearch_20260817_020059](https://huggingface.co/datasets/yukamatsumae/ToyCarResearch_20260817_020059)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Guía de entrenamiento de LeRobot: [https://huggingface.co/docs/lerobot/il_robots#train-a-policy](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
