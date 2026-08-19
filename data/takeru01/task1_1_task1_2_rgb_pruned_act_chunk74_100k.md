# takeru01/task1_1_task1_2_rgb_pruned_act_chunk74_100k

## Resumen

Este modelo es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. El autor, takeru01, ha publicado este checkpoint específico para controlar un robot manipulador dual UR5e mediante aprendizaje por imitación a partir de demostraciones teleoperadas. El modelo procesa observaciones visuales de cuatro cámaras y señales de estado articular, y genera secuencias de acciones (chunks) que permiten ejecutar tareas de manipulación bimanual.

La relevancia de este modelo radica en que ejemplifica el uso de transformers para robótica, un campo donde la predicción de acciones a corto plazo ha demostrado ser más efectiva que la predicción paso a paso. Con solo 51,6 millones de parámetros y un tamaño de repositorio de 0,4 GB, es un modelo ligero que puede ejecutarse en hardware modesto, lo que lo hace accesible para investigación y prototipado. El nombre del repositorio sugiere un chunk de acción de 74 pasos, aunque este dato no está confirmado en la documentación oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.658.382 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no procesa texto; el nombre del repo sugiere chunk de acción de 74 pasos) |
| Tipos de cuantizacion | No disponible (solo pesos completos en safetensors) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones (una secuencia de pasos de control) en lugar de una sola acción. La arquitectura combina un codificador visual (que procesa las imágenes de las cámaras) con un decodificador que genera las acciones futuras. En este caso, el modelo recibe como entrada el estado del robot (posición articular, velocidad, posición del gripper) y cuatro imágenes RGB de 240x424 píxeles, y produce un vector de acción de 14 dimensiones (probablemente posiciones articulares y comandos de gripper).

El entrenamiento se realizó con el dataset `takeru01/task1_1_task1_2_rgb_pruned`, que contiene 102 episodios y 278.142 fotogramas a 30 FPS, correspondientes a tareas de manipulación bimanual. Se usaron 100.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 1e-5. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado con datos de demostración. La versión de LeRobot utilizada fue la 0.6.1.

## Capacidades

- Control de robot manipulador dual UR5e: genera comandos de acción para dos brazos robóticos, incluyendo posiciones articulares y estado del gripper.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cuatro cámaras (frontal, superior, muñeca izquierda y muñeca derecha) para guiar la manipulación.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación, sin necesidad de programación explícita de trayectorias.
- Predicción de chunks de acción: genera secuencias de acciones de longitud fija (probablemente 74 pasos), lo que mejora la estabilidad del control frente a la predicción paso a paso.
- Ejecución en tiempo real: al ser un modelo pequeño, puede ejecutarse a frecuencias de control adecuadas para robótica (30 FPS o más) en hardware con GPU.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de tareas de ensamblaje: el modelo puede replicar secuencias de manipulación bimanual, como insertar piezas o atornillar, a partir de demostraciones previas. Su capacidad de predecir chunks de acción reduce la latencia y mejora la fluidez del movimiento.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones en la posición de objetos.
- Prototipado de celdas de fabricación flexibles: permite reconfigurar una celda robótica para nuevas tareas simplemente grabando nuevas demostraciones, sin reprogramar el controlador.
- Teleoperación asistida: el modelo puede complementar la teleoperación humana sugiriendo acciones o completando movimientos parciales, útil en entornos de cirugía o manipulación remota.
- Evaluación de algoritmos de visión robótica: al integrar cuatro cámaras, es útil para probar métodos de fusión sensorial o atención visual en tareas de manipulación.
- Benchmarking de frameworks de robótica: al estar integrado con LeRobot, permite comparar el rendimiento de ACT frente a otras políticas (como Diffusion Policy) en el mismo hardware y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de tasas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia (el modelo pesa 0,4 GB en safetensors, y la activación para un batch de 1 es mínima).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU, aunque la frecuencia de control podría verse limitada.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo, incluidas las integradas de gama alta.
- Opciones de despliegue: el modelo se ejecuta mediante la librería LeRobot, que usa PyTorch. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede desplegar en un robot real usando el comando `lerobot-rollout` o en simulación.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo, se espera una inferencia en el orden de milisegundos en GPU, suficiente para control a 30 Hz.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de robótica en la información proporcionada. El modelo es una implementación de ACT, que se puede comparar cualitativamente con:

- **ACT original (paper arXiv:2304.13705)**: misma arquitectura base, pero este checkpoint está entrenado específicamente para un robot dual UR5e con cuatro cámaras. No hay métricas públicas de rendimiento relativo.
- **Diffusion Policy (otro método de aprendizaje por imitación)**: utiliza modelos de difusión para generar acciones, pero no se han publicado comparaciones con este checkpoint concreto.
- **Otros checkpoints de LeRobot**: existen múltiples políticas ACT en el Hub, pero sin datos de evaluación no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay resultados de éxito en tareas reales, por lo que se desconoce su fiabilidad en producción.
- Dataset limitado: solo 102 episodios, lo que puede provocar sobreajuste a las condiciones específicas de las demostraciones (posición de objetos, iluminación, etc.).
- Dependencia de la configuración de cámaras: el modelo espera exactamente cuatro cámaras con las mismas posiciones y resoluciones; cualquier cambio en la configuración invalida la política.
- Tareas específicas: está entrenado para tareas de manipulación bimanual concretas ("task1_1" y "task1_2"); no generaliza a otras tareas sin reentrenamiento.
- Sin soporte de lenguaje: no procesa instrucciones verbales ni texto, solo observaciones visuales y de estado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las regulaciones de seguridad en robótica.
- Fecha de creación futura (2026): el modelo fue creado en agosto de 2026, lo que sugiere que es un artefacto reciente; se recomienda verificar su compatibilidad con la versión actual de LeRobot.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/takeru01/task1_1_task1_2_rgb_pruned_act_chunk74_100k)
- [Dataset de entrenamiento](https://huggingface.co/datasets/takeru01/task1_1_task1_2_rgb_pruned)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
