# Yu3773/act_red_cube_yellow_target_v4

## Resumen

El modelo `Yu3773/act_red_cube_yellow_target_v4` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por Yu Sakuta (Yu3773) y entrenada con el framework LeRobot de Hugging Face. El modelo está especializado en una tarea concreta de manipulación: recoger un cubo rojo y colocarlo dentro de un área objetivo amarilla. Esta política aprende a partir de datos teleoperados y predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

El modelo cuenta con 51.668.614 parámetros y consume observaciones de estado (6 dimensiones) junto con imágenes de dos cámaras (muñeca y vista cenital) de resolución 480x640. Se entrenó sobre un dataset de 53 episodios y 23.416 fotogramas a 30 FPS. Es un modelo pequeño y ligero, diseñado para ejecutarse en tiempo real en robots manipuladores, y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en que ejemplifica el uso de ACT y LeRobot para crear políticas de control robótico reproducibles y de código abierto, permitiendo a desarrolladores e investigadores implementar tareas de pick-and-place con un coste computacional reducido y sin necesidad de infraestructura de entrenamiento masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión original, probablemente fp32) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), propuesta en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir secuencias de acciones (chunks) de longitud fija a partir de observaciones visuales y del estado del robot. En lugar de predecir una sola acción por paso, el modelo genera un bloque de acciones futuras, lo que reduce la acumulación de errores y mejora la consistencia del movimiento.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `Yu3773/so101_red_cube_yellow_target_v4`, que contiene 53 episodios teleoperados de la tarea de recoger el cubo rojo y colocarlo en el área amarilla. Se ejecutaron 20.000 pasos de entrenamiento con un batch size de 8, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente de aprendizaje por imitación supervisado sobre las demostraciones.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 dimensiones (posición y orientación del efector final) para el robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (muñeca y vista cenital) de 480x640 píxeles, junto con el estado del robot (6 valores).
- Predicción de secuencias de acciones (action chunking): emite bloques de acciones en lugar de pasos individuales, lo que permite movimientos suaves y coordinados.
- Especialización en tarea única: está entrenado específicamente para la tarea de pick-and-place de un cubo rojo en un área amarilla, con alta precisión en ese escenario concreto.
- Ejecución en tiempo real: al ser un modelo pequeño (51M parámetros), puede ejecutarse en hardware modesto con latencias bajas, adecuado para control en bucle cerrado.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un robot `so_follower` para recoger objetos de una posición fija y depositarlos en una zona delimitada, útil para experimentos de robótica educativa o prototipado rápido.
- Benchmarking de algoritmos de aprendizaje por imitación: sirve como referencia para comparar ACT con otras políticas (p. ej., Diffusion Policy) en la misma tarea, ya que el dataset y el código de entrenamiento están disponibles.
- Desarrollo de sistemas de control robótico de bajo coste: al requerir solo dos cámaras RGB y un robot de bajo coste, es adecuado para montajes con hardware asequible (por ejemplo, brazos robóticos tipo SO-101).
- Investigación en generalización de políticas: al ser un modelo entrenado con pocos episodios (53), permite estudiar la robustez frente a variaciones de iluminación, posición del objeto o ruido en las cámaras.
- Educación en robótica y aprendizaje automático: se puede usar como ejemplo práctico en cursos para enseñar el flujo completo de LeRobot: recolección de datos, entrenamiento y despliegue en un robot real.
- Prototipado de soluciones de automatización en almacenes o líneas de montaje: aunque la tarea es sencilla, el enfoque puede escalarse a tareas más complejas con datasets más grandes, sirviendo como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en evaluaciones con robot real ni comparaciones con otros modelos. Se recomienda realizar una evaluación propia siguiendo el procedimiento de LeRobot (ejecutar el rollout varias veces y contar los éxitos) para obtener métricas fiables.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51M parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión fp32. En la práctica, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (p. ej., GTX 1650, RTX 2060, RTX 4090) o incluso CPU para inferencia en tiempo real, dado el bajo coste computacional.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna sin problemas.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que usa PyTorch. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se despliega con el comando `lerobot-rollout` en un robot real o en simulación.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo y el procesamiento de dos imágenes de 480x640, se espera una latencia de inferencia inferior a 50 ms en una GPU moderna, suficiente para control en tiempo real a 30 FPS.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Existen alternativas en robótica como Diffusion Policy o ACT con otras variantes, pero no hay benchmarks públicos que comparen este modelo concreto con ellas. Se recomienda consultar la literatura de LeRobot y los resultados de la comunidad para obtener comparaciones.

## Limitaciones y advertencias

- Especialización excesiva: el modelo solo funciona para la tarea concreta de recoger un cubo rojo y colocarlo en un área amarilla. No generaliza a otros objetos, colores o disposiciones del entorno.
- Sensibilidad a cambios en el entorno: variaciones en iluminación, posición de la cámara, oclusión o cambios en el fondo pueden degradar significativamente el rendimiento.
- Riesgo de alucinación en acciones: como cualquier modelo de imitación, puede generar acciones erróneas si las observaciones difieren mucho de los datos de entrenamiento, lo que podría provocar movimientos inseguros.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que la fiabilidad del modelo no está verificada fuera del conjunto de entrenamiento.
- Dependencia del hardware específico: el modelo está entrenado para el robot `so_follower` y las cámaras concretas; usarlo con otro hardware requeriría recalibración y posiblemente reentrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías; el usuario es responsable de su uso seguro en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yu3773/act_red_cube_yellow_target_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/Yu3773/so101_red_cube_yellow_target_v4
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
