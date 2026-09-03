# Yu-Zhou-Wang/dp_so_101_red_foam_ball_20k

## Resumen

Este modelo es un checkpoint intermedio (paso 20 000) de una política de robótica basada en Diffusion Policy, entrenada con la librería LeRobot para el brazo robótico SO-101. La tarea consiste en recoger una bola roja de espuma y colocarla en un contenedor, utilizando episodios del dataset SOTAC. El modelo procesa imágenes de dos cámaras (superior y muñeca) y las posiciones articulares del robot para generar acciones de control en un horizonte de 32 pasos.

Desarrollado por Yu-Zhou-Wang, este checkpoint representa la primera parada de un entrenamiento más largo (el modelo completo alcanza 100 000 pasos). Su relevancia radica en servir como referencia para estudiar la evolución del aprendizaje durante el entrenamiento de políticas de difusión en robótica, así como para evaluar el rendimiento temprano de este tipo de arquitecturas. Con aproximadamente 278 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión condicionada por observaciones) |
| Parametros totales | 277 840 246 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de 2 pasos y predice 32 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Diffusion Policy, que modela la política de control como un proceso de denoising iterativo sobre secuencias de acciones. La entrada combina observaciones de dos cámaras (imagen superior y de muñeca, ambas a 640×480 píxeles) con las posiciones de las 6 articulaciones del brazo SO-101. El horizonte de observación es de 2 pasos, y el modelo predice un chunk de 32 acciones futuras.

El entrenamiento se realizó desde cero sobre los episodios 0 a 20 del dataset SOTAC, sin utilizar información táctil. Se empleó un tamaño de lote de 8 y se guardó este checkpoint en el paso 20 000. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de aprendizaje por imitación supervisada.

## Capacidades

- Generación de acciones de control para el brazo robótico SO-101, específicamente para la tarea de recoger y colocar una bola roja de espuma.
- Procesamiento multimodal de visión y propriocepción: combina imágenes de dos cámaras con estados articulares.
- Predicción de secuencias de acciones de 32 pasos mediante denoising difusivo.
- Ejecución en bucle cerrado con el robot SO-101 a través de la librería LeRobot (comando `lerobot-rollout`).
- No soporta tool calling, agentes, razonamiento simbólico ni procesamiento de lenguaje natural, al ser un modelo puramente motor.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar la dinámica de entrenamiento de Diffusion Policies en robótica, comparando este checkpoint temprano con versiones más entrenadas.
- Desarrollo de pipelines de control robótico: puede integrarse en sistemas LeRobot para tareas de manipulación con brazo SO-101, sirviendo como punto de partida para fine-tuning en tareas similares.
- Evaluación de generalización: al ser un checkpoint intermedio, es útil para analizar cómo evoluciona la capacidad de generalización del modelo con más pasos de entrenamiento.
- Benchmarking de hardware: su tamaño moderado (278 M de parámetros) lo hace adecuado para probar el rendimiento de GPUs de consumo en inferencia de políticas robóticas.
- Educación en robótica y aprendizaje profundo: sirve como ejemplo práctico de entrenamiento de políticas de difusión con LeRobot, con una tarea sencilla y reproducible.
- Reproducibilidad de experimentos: al estar disponible públicamente con licencia Apache-2.0, permite replicar los resultados del entrenamiento y comparar con otras arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de la tarea, tasas de acierto ni comparaciones con otros modelos. El único dato cuantitativo es el número de pasos de entrenamiento (20 000) y el tamaño del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamaño de 277 M de parámetros y la entrada de dos imágenes 640×480, se estima que requiere entre 2 y 4 GB de VRAM en FP32, y menos de 2 GB en cuantización de 8 bits (aunque no se ofrecen cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. Para entrenamiento, se recomienda al menos 8 GB (RTX 3070, RTX 4060, etc.).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: LeRobot (librería principal), con soporte para ejecución en tiempo real mediante `lerobot-rollout`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia de Diffusion Policy requiere múltiples pasos de denoising (típicamente entre 10 y 100), lo que puede limitar la frecuencia de control en tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de robótica. Se puede mencionar que existen alternativas como ACT (Action Chunking with Transformers) o modelos basados en world models (p. ej., DreamZero-SO101), pero no hay datos públicos de rendimiento de este checkpoint frente a ellos. La comparativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente para una tarea específica (recoger bola roja y colocarla en contenedor); no generaliza a otras tareas sin fine-tuning.
- Checkpoint temprano (20 000 pasos) que puede presentar un rendimiento inferior al modelo final de 100 000 pasos.
- No se ha evaluado su robustez ante variaciones de iluminación, posición de la cámara o cambios en el entorno.
- Depende de las claves de cámara `top` y `wrist`; si se usan otras nomenclaturas, es necesario remapear.
- No se proporcionan métricas de éxito ni tasas de error, por lo que su fiabilidad en producción no está demostrada.
- Licencia Apache-2.0 permite uso comercial, pero el dataset SOTAC puede tener sus propias restricciones (no verificadas en esta ficha).
- No soporta procesamiento de lenguaje natural ni interacción multimodal más allá de visión y propriocepción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yu-Zhou-Wang/dp_so_101_red_foam_ball_20k
- Checkpoint completo (100k): https://huggingface.co/Yu-Zhou-Wang/dp_so_101_red_foam_ball
- Dataset SOTAC: https://huggingface.co/datasets/Jingyi-Z/sotac
- Librería LeRobot: https://huggingface.co/lerobot (documentación oficial en https://github.com/huggingface/lerobot)
