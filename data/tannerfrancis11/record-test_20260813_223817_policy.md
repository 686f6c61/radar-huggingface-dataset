# tannerfrancis11/record-test_20260813_223817_policy

## Resumen

El modelo `tannerfrancis11/record-test_20260813_223817_policy` es una política de control robótico entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales. Ha sido desarrollado por Tanner Francis y publicado en Hugging Face usando la librería LeRobot, un framework open source de Hugging Face para robótica basada en aprendizaje automático. El modelo está diseñado para controlar un robot tipo `so_follower` con una cámara frontal, y ha sido entrenado para ejecutar la tarea "Grab the black cube" (agarrar el cubo negro).

Con 51.668.614 parámetros (aproximadamente 51,7 millones), es un modelo compacto en comparación con los grandes modelos de lenguaje, pero suficiente para tareas de manipulación robótica de baja dimensión. La política consume observaciones de estado (6 dimensiones) e imágenes (480x640 RGB) y produce acciones de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de entrenamiento y despliegue de políticas robóticas con LeRobot, demostrando el flujo completo desde la recolección de datos teleoperados hasta la publicación del modelo en el Hub. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir una secuencia de acciones futuras (un "chunk") condicionada a las observaciones actuales. A diferencia de los métodos que predicen una sola acción por paso, ACT reduce el error de acumulación y mejora la estabilidad del control. La arquitectura concreta del modelo no se detalla en la información disponible, pero típicamente consiste en un encoder de visión (como ResNet) para procesar las imágenes, un encoder de estado para las variables del robot, y un decoder transformer que genera los chunks de acción.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre un dataset de 30 episodios teleoperados, con un total de 16.311 frames a 30 FPS. La configuración de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico por imitación: ejecuta la tarea específica "Grab the black cube" sobre un robot `so_follower`.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles de una cámara frontal.
- Control de baja dimensión: produce acciones de 6 grados de libertad (posición y orientación del efector).
- Generalización limitada: al ser entrenado con solo 30 episodios, la capacidad de generalizar a variaciones del entorno (posición del objeto, iluminación, etc.) es reducida.
- No soporta tool calling, razonamiento multi-step ni procesamiento de lenguaje; es una política puramente reactiva para control motor.

## Casos de uso

- Manipulación robótica en entornos controlados: el modelo puede ejecutar la tarea de agarrar un cubo negro en un escenario fijo con la cámara y el robot configurados de la misma manera que durante el entrenamiento.
- Prototipado rápido de políticas con LeRobot: sirve como ejemplo de referencia para desarrolladores que quieren aprender a entrenar y desplegar políticas ACT con el framework LeRobot.
- Investigación en aprendizaje por imitación: útil para estudiar el comportamiento de ACT con datasets pequeños y evaluar el efecto del tamaño del dataset en el rendimiento.
- Automatización de tareas repetitivas en laboratorio: puede integrarse en un pipeline de robótica para realizar la misma tarea de recogida de objetos de forma autónoma, siempre que el entorno permanezca estable.
- Benchmark de políticas en robots `so_follower`: permite comparar el rendimiento de diferentes configuraciones de ACT (número de steps, chunk size, etc.) sobre la misma tarea.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede usarse como base para explorar la asistencia autónoma durante la teleoperación, aunque requeriría adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación: "_No evaluation results have been provided for this policy yet._". No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. La inferencia en GPU puede requerir menos de 1 GB de VRAM, pero no se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Incluso podría ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan sobre el robot. También es posible usar la librería directamente en Python para inferencia personalizada.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido del modelo, se espera una latencia baja (del orden de milisegundos) en GPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. ACT es un método conocido en robótica, y existen otras políticas entrenadas con LeRobot sobre diferentes robots y tareas, pero no se han proporcionado datos de rendimiento ni configuraciones que permitan una comparación rigurosa. Se puede señalar que, en general, las políticas ACT suelen tener entre 20 y 100 millones de parámetros dependiendo de la configuración, pero no hay datos concretos para este caso.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (30 episodios), lo que limita severamente la generalización a variaciones del entorno, posiciones del objeto o condiciones de iluminación diferentes a las del dataset.
- Tarea única y específica: el modelo solo ha sido entrenado para "Grab the black cube"; no puede ejecutar otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay métricas de éxito en el robot real, por lo que su rendimiento efectivo es desconocido.
- Dependencia de la configuración del robot y cámaras: el modelo espera exactamente las mismas observaciones (estado de 6 dimensiones, imagen frontal 480x640) y la misma configuración de robot `so_follower`. Cambios en la calibración o en la disposición de las cámaras invalidarán la política.
- Posibles sesgos del entorno de teleoperación: los datos provienen de un único operador y un entorno concreto, lo que puede introducir sesgos en la forma de ejecutar la tarea.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí existe riesgo de comportamientos erráticos si las observaciones se alejan de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de rendimiento ni soporte.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/tannerfrancis11/record-test_20260813_223817_policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/tannerfrancis11/record-test_20260813_223817)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=tannerfrancis11/record-test_20260813_223817)
