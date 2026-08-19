# yuval-nardi/so-101-test

## Resumen

El modelo `yuval-nardi/so-101-test` es una política robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Desarrollado por Yuval Nardi y publicado en Hugging Face bajo la licencia Apache 2.0, está diseñado específicamente para el brazo robótico SO-101 (So-Follower) y utiliza dos cámaras (muñeca y superior) junto con el estado del robot como entradas. Su tarea concreta es "recoger el Lego y ponerlo en el cuenco".

El modelo cuenta con 51,7 millones de parámetros y ha sido entrenado con el framework LeRobot sobre un conjunto de datos muy reducido: solo 2 episodios y 1800 fotogramas a 30 FPS. A pesar de su tamaño modesto, representa un ejemplo práctico de cómo aplicar ACT a la manipulación robótica real, y su relevancia radica en que demuestra un flujo completo de entrenamiento e inferencia con herramientas open source (LeRobot, safetensors) sobre hardware accesible. No se han publicado resultados de evaluación en el mundo real, por lo que su rendimiento efectivo no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper [arXiv:2304.13705](https://arxiv.org/abs/2304.13705). ACT utiliza un transformer codificador-decodificador que procesa observaciones visuales (imágenes de las cámaras `wrist` y `top`, cada una de 480x640 píxeles) y el estado del robot (vector de 6 dimensiones), y genera como salida un "chunk" de acciones futuras (vector de 6 dimensiones). La predicción por chunks permite una ejecución más suave y robusta que la predicción paso a paso, reduciendo el error acumulado.

El entrenamiento se realizó con LeRobot (versión 0.6.0) sobre un dataset de 2 episodios teleoperados, con un total de 1800 fotogramas a 30 FPS. Se usaron 200 pasos de entrenamiento, batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se menciona el uso de técnicas como RLHF o DPO, ya que es un método de imitación supervisada. El pequeño tamaño del dataset sugiere que el modelo está muy especializado en la tarea concreta y probablemente sobreajustado a las condiciones específicas de la demostración.

## Capacidades

- Control de un brazo robótico SO-101 para tareas de manipulación, específicamente pick-and-place de objetos pequeños.
- Procesamiento multimodal de visión (dos cámaras) y estado propioceptivo del robot.
- Generación de secuencias de acciones (chunks) de 6 dimensiones, lo que permite movimientos coordinados y suaves.
- Ejecución en tiempo real mediante el pipeline de rollout de LeRobot, con soporte para despliegue en el robot físico.
- No dispone de capacidades de tool calling, razonamiento simbólico, generación de texto ni funciones de agente, ya que es un modelo puramente motor.
- No es multilingüe ni tiene capacidades de lenguaje natural; su interfaz es exclusivamente numérica y visual.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede recoger piezas pequeñas (como un Lego) y depositarlas en una posición objetivo, útil para procesos de ensamblaje repetitivos.
- Prototipado rápido de políticas robóticas con LeRobot: al estar integrado en el ecosistema LeRobot, sirve como punto de partida para que desarrolladores aprendan a entrenar y desplegar sus propias políticas ACT sin necesidad de hardware especializado.
- Investigación en aprendizaje por imitación: dado su tamaño reducido y su dataset de entrenamiento mínimo, es un banco de pruebas para estudiar el comportamiento de ACT con pocos datos y analizar el sobreajuste.
- Demostración educativa en robótica: permite a estudiantes y aficionados ejecutar una política completa en un brazo SO-101, entendiendo el flujo de datos desde las cámaras hasta las acciones.
- Evaluación de transferencia sim-to-real: puede usarse como baseline para comparar con modelos entrenados en simulación (como los del curso de NVIDIA Isaac) y medir la brecha de realidad.
- Desarrollo de sistemas de manipulación asistida en entornos controlados, como laboratorios o talleres, donde se requiere repetir una tarea específica con alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. Por tanto, no se dispone de métricas como tasa de éxito, precisión o tiempo de ejecución en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño del modelo (51,7 M parámetros), en FP32 ocuparía aproximadamente 207 MB de memoria, y en FP16 unos 103 MB, por lo que cualquier GPU con al menos 2 GB de VRAM podría ejecutarlo con holgura.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior, RTX 3060, A100, H100). También podría ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, en prácticamente todas las GPUs de consumo actuales, incluso en las integradas de gama baja, siempre que se disponga de suficiente RAM para el procesamiento de imágenes.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la carga del modelo y la comunicación con el robot. También es posible exportar los pesos a otros formatos, aunque no se documenta en la ficha.
- Latencia y throughput: no disponibles. Dependen del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos equivalentes. Existe otro modelo para el mismo brazo SO-101, llamado DreamZero-SO101 (un world-action model), pero no se han encontrado datos de sus parámetros ni de su rendimiento. Tampoco se han localizado otras políticas ACT públicas para SO-101 con las que contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento extremadamente reducido (2 episodios, 1800 fotogramas), lo que conlleva un alto riesgo de sobreajuste y una generalización muy limitada a variaciones en la posición de los objetos, iluminación o configuraciones del robot.
- No se han reportado resultados de evaluación en el robot real, por lo que no hay evidencia de que la política funcione de forma fiable en condiciones reales.
- El modelo está especializado en una única tarea ("recoger el Lego y ponerlo en el cuenco"); cualquier cambio en la tarea requiere reentrenamiento.
- La dependencia de dos cámaras fijas (muñeca y superior) implica que cambios en la disposición de las cámaras o en el entorno pueden degradar el rendimiento.
- No se documentan sesgos específicos, pero al ser un modelo de imitación, hereda los sesgos y limitaciones de las demostraciones teleoperadas.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generar acciones erróneas si las observaciones se alejan de las distribuciones vistas en entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.
- Para producción, se requiere una validación exhaustiva en el robot físico y, probablemente, un reentrenamiento con un dataset mucho más amplio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yuval-nardi/so-101-test)
- [Dataset de entrenamiento](https://huggingface.co/datasets/yuval-nardi/so-101-test)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Curso de NVIDIA sobre sim-to-real con SO-101](https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html)
- [Proyecto DreamZero-SO101](https://vizuara-ai-lab.github.io/dreamzero-so101/index.html)
