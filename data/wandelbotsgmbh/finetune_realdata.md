# wandelbotsgmbh/finetune_RealData

## Resumen

El modelo `wandelbotsgmbh/finetune_RealData` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Wandelbots GmbH, empresa especializada en automatización industrial de robots. Se trata de un modelo de imitación que aprende a predecir secuencias de acciones a partir de demostraciones teleoperadas, en lugar de predecir un único paso, lo que mejora la estabilidad y el éxito en tareas de manipulación. El modelo ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, sobre el dataset `wandelbotsgmbh/Data-Real`, y cuenta con aproximadamente 51,6 millones de parámetros, un tamaño reducido que lo hace adecuado para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su aplicación directa en robótica industrial, donde la automatización de tareas repetitivas mediante aprendizaje por imitación reduce la necesidad de programación manual. Al estar licenciado bajo Apache 2.0, permite su uso comercial y modificación, lo que facilita su integración en plataformas propietarias o de código abierto. Aunque no se dispone de información detallada sobre el contexto o las capacidades lingüísticas (al ser un modelo puramente robótico), su arquitectura ACT y su entrenamiento con datos reales lo convierten en una opción práctica para tareas de manipulación en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.617.415 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | no disponible (modelo de control robotico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un "chunk" o secuencia de acciones futuras. Esto permite que el modelo sea más robusto ante perturbaciones y mejore la tasa de éxito en tareas de manipulación. La arquitectura se basa en un transformer que procesa observaciones (imágenes y estados del robot) y produce una secuencia de comandos de actuación.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `wandelbotsgmbh/Data-Real`, que contiene demostraciones teleoperadas de tareas robóticas reales. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o preferencia humana. El modelo se publica como un checkpoint entrenado, listo para ser evaluado o desplegado mediante las herramientas de LeRobot.

## Capacidades

- Control robótico por imitación: aprende a ejecutar tareas de manipulación a partir de demostraciones humanas teleoperadas.
- Predicción de secuencias de acciones (action chunking): genera múltiples pasos de actuación de una vez, mejorando la estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot (Hugging Face).
- Soporte para robots SO-100 y otros compatibles con LeRobot (según la documentación de la librería).
- No incluye capacidades de lenguaje, visión general ni razonamiento simbólico; está especializado exclusivamente en control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de producción: el modelo puede aprender a recoger y colocar piezas a partir de demostraciones, reduciendo el tiempo de programación.
- Manipulación de objetos en entornos industriales: gracias a su predicción de chunks de acciones, es adecuado para tareas que requieren movimientos suaves y coordinados.
- Integración en plataformas de Wandelbots: al ser desarrollado por Wandelbots, puede desplegarse en su plataforma de automatización definida por software, que controla robots de distintos fabricantes.
- Prototipado rápido de nuevas tareas robóticas: con LeRobot, se puede entrenar y evaluar una política en pocas horas usando un dataset pequeño, ideal para pruebas de concepto.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar variantes de ACT o comparar con otros métodos en entornos reales.
- Despliegue en robots de bajo coste: con solo 51,6 millones de parámetros, el modelo puede ejecutarse en hardware modesto, como una GPU de gama media o incluso CPU en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como tasa de éxito, precisión de movimiento o comparativas con otros modelos en tareas robóticas estándar.

## Requisitos de hardware

- Inferencia en GPU con soporte CUDA (recomendado por LeRobot para entrenamiento y evaluación).
- VRAM estimada: al tener ~51,6 millones de parámetros, en precisión fp32 ocupa aproximadamente 206 MB. Cabe en cualquier GPU moderna, incluso en tarjetas de entrada como GTX 1650 o RTX 3050.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia; para entrenamiento se recomienda 8 GB o más.
- Compatible con consumer GPU: sí, dado el tamaño reducido del modelo.
- Opciones de despliegue: LeRobot (entrenamiento y evaluación), posiblemente exportación a otros formatos si se convierte, aunque no se documenta.
- Latencia y throughput: no disponibles; dependerán del hardware y del número de cámaras/observaciones procesadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas basadas en ACT) dentro de los datos proporcionados. Se recomienda consultar el repositorio de LeRobot para encontrar otros checkpoints de políticas similares.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de propósito general; solo es útil para tareas robóticas específicas para las que fue entrenado.
- Dependencia del dataset: el rendimiento está limitado por la calidad y diversidad de las demostraciones en `wandelbotsgmbh/Data-Real`. Si las tareas difieren del dominio de entrenamiento, la política puede fallar.
- Sin información sobre sesgos: al ser un modelo de control motor, no se aplican sesgos lingüísticos, pero puede heredar sesgos del entorno de entrenamiento (por ejemplo, iluminación, posición de cámaras, tipos de objetos).
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero se debe mantener el aviso de copyright y no usar marcas registradas sin permiso.
- Para producción, se recomienda validar la política en el robot real con suficientes episodios de prueba antes de desplegarla, dado que no hay métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandelbotsgmbh/finetune_RealData
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Sitio web de Wandelbots: https://www.wandelbots.com/
- Organización de Wandelbots en Hugging Face: https://huggingface.co/wandelbotsgmbh
- Repositorios de Wandelbots en GitHub: https://github.com/orgs/wandelbotsgmbh/repositories
