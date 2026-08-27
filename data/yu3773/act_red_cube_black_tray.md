# Yu3773/act_red_cube_black_tray

## Resumen

El modelo `Yu3773/act_red_cube_black_tray` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Yu Sakuta (usuario de Hugging Face `Yu3773`) y entrenada con el framework LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite al robot ejecutar tareas de manipulación con mayor fluidez y precisión. Este modelo concreto está especializado en la tarea de recoger un cubo rojo y colocarlo en una bandeja negra, utilizando un robot tipo `so_follower` con dos cámaras (muñeca y vista superior).

El modelo tiene 51,7 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. Fue entrenado con 30 episodios teleoperados (13.285 fotogramas a 30 FPS) durante 20.000 pasos de optimización. Su relevancia radica en que demuestra cómo un método de imitación relativamente ligero puede resolver tareas de manipulación específicas con un coste computacional bajo, siendo un ejemplo práctico para desarrolladores que trabajan con LeRobot y robots de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes de las cámaras) con un transformador que genera secuencias de acciones. A diferencia de los métodos que predicen una única acción por paso, ACT predice un "chunk" de acciones futuras, lo que reduce el error acumulativo y mejora la suavidad del movimiento. El modelo consume dos imágenes (cámara de muñeca y cámara superior, ambas de 480x640 píxeles) y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones (probablemente posición y orientación del efector final).

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `Yu3773/so101_red_cube_black_tray`, que contiene 30 episodios teleoperados de la tarea "recoger el cubo rojo y colocarlo en la bandeja negra". Se usaron 20.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 1e-5. No se aplicaron técnicas de refuerzo ni ajuste fino posterior; es un entrenamiento puramente supervisado sobre datos de demostración.

## Capacidades

- Manipulación robótica: el modelo controla un robot tipo `so_follower` para ejecutar la tarea de recoger y colocar un objeto específico (cubo rojo en bandeja negra).
- Percepción visual: procesa imágenes de dos cámaras (muñeca y vista superior) a 30 FPS, con resolución de 480x640 píxeles.
- Control de 6 grados de libertad: genera acciones de 6 dimensiones, típicamente posición (x, y, z) y orientación (roll, pitch, yaw) del efector final.
- Aprendizaje por imitación: no requiere programación explícita de movimientos; aprende directamente de demostraciones teleoperadas.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el pipeline de LeRobot para despliegue en robots reales.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda de trabajo para recoger objetos de una posición fija y depositarlos en un contenedor, útil en líneas de montaje sencillas o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT con pocos datos (30 episodios) y para comparar variaciones en la arquitectura o el dataset.
- Prototipado rápido con LeRobot: los desarrolladores pueden cargar este modelo en un robot `so_follower` mediante el comando `lerobot-rollout` y verificar la integración de cámaras, calibración y control en menos de una hora.
- Benchmark de generalización: al estar entrenado con una única tarea y un dataset pequeño, es útil para probar técnicas de aumento de datos, regularización o fine-tuning con nuevas demostraciones.
- Educación en robótica: permite a estudiantes universitarios experimentar con un pipeline completo de entrenamiento e inferencia de políticas neuronales sin necesidad de hardware caro (el modelo cabe en GPUs de consumo).
- Evaluación de robustez visual: al depender de dos cámaras, puede usarse para probar la sensibilidad del modelo a cambios de iluminación, oclusiones o variaciones en la posición del objeto, identificando límites de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 millones de parámetros. En FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. Se estima que una GPU con al menos 1-2 GB de VRAM es suficiente para inferencia en tiempo real.
- GPU recomendadas: cualquier GPU moderna de consumo, como NVIDIA GTX 1060 (6 GB) o superior, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU, aunque la latencia será mayor y podría no alcanzar los 30 FPS.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas integradas de gama alta (aunque con menor rendimiento).
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También es posible exportar los pesos a otros formatos (ONNX, TensorRT) para optimizar la inferencia, aunque no se documenta en la model card.
- Latencia y throughput estimados: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolución de entrada (dos imágenes de 480x640), se espera una latencia de decenas de milisegundos en GPU moderna, suficiente para control a 30 Hz.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor tiene otro modelo similar (`Yu3773/act_so101_redcube_policy001`, también de 51,7 M parámetros) que probablemente resuelve la misma tarea con una variante de entrenamiento, pero no se publican sus especificaciones ni resultados. En la literatura, ACT se compara con métodos como Diffusion Policy o Behavior Transformers, pero no hay datos de este modelo concreto frente a ellos. Por tanto, la comparativa se limita a indicar que es un modelo ACT estándar sin métricas publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de robótica entrenado con un único dataset, no presenta sesgos lingüísticos o sociales, pero puede tener sesgos de percepción (por ejemplo, sensibilidad a la iluminación o al color del objeto).
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico; produce acciones motoras que pueden ser incorrectas si el entorno difiere del de entrenamiento.
- Limitaciones de contexto: el modelo no tiene memoria de largo plazo ni capacidad de razonamiento; solo ejecuta la tarea aprendida. No puede adaptarse a nuevas tareas sin reentrenamiento.
- Limitaciones de idioma: no aplica, no procesa lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Caveats para producción: el modelo fue entrenado con solo 30 episodios, lo que puede provocar baja generalización a variaciones en la posición del cubo, cambios de iluminación o presencia de objetos distractores. No se han realizado pruebas de robustez en entornos no vistos. Además, el robot `so_follower` es un hardware específico; el modelo no es portable a otros robots sin reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Yu3773/act_red_cube_black_tray)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Yu3773/so101_red_cube_black_tray)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Cheat-sheet de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
