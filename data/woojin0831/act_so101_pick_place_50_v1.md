# woojin0831/act_so101_pick_place_50_v1

## Resumen

El modelo `woojin0831/act_so101_pick_place_50_v1` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario woojin0831, el modelo está diseñado para ejecutar la tarea de recoger un objeto y colocarlo en un área objetivo ("Pick up the object and place it in the target area") sobre un robot tipo `so_follower`. Se trata de un ejemplo de aprendizaje por imitación a partir de datos teleoperados, donde la política predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulaciones robóticas.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo convierte en una política ligera y adecuada para entornos de investigación y prototipado. Fue entrenado con un dataset de 50 episodios (24.712 fotogramas a 30 FPS) y utiliza tres cámaras (frontal, superior y pinza) junto con el estado del robot como entradas. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una herramienta de código abierto que está ganando adopción en la comunidad de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el paper [Action Chunking with Transformers](https://arxiv.org/abs/2304.13705). ACT utiliza un transformer encoder-decoder que recibe observaciones multimodales (imágenes de tres cámaras y estado del robot) y produce un chunk de acciones futuras, en lugar de una única acción. Esta predicción por bloques reduce la acumulación de errores y permite movimientos más suaves y coherentes.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `woojin0831/so101_pick_place_50_v1`, que contiene 50 episodios teleoperados con 24.712 fotogramas a 30 FPS. La configuración de entrenamiento incluye 30.890 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de un pipeline de imitación supervisada.

## Capacidades

- Control robótico para tareas de pick and place: el modelo genera comandos de acción de 6 dimensiones (posición y orientación de la pinza) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (frontal, superior y pinza) de 480x640 píxeles, junto con el estado del robot.
- Predicción por chunks: genera secuencias de acciones (action chunking) que mejoran la fluidez del movimiento en comparación con políticas de un solo paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de recogida y colocación en entornos controlados: el modelo puede integrarse en un robot SO-101 para mover objetos de una posición a otra en una zona delimitada, útil en líneas de montaje o celdas de trabajo repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de episodios, la configuración de cámaras o los hiperparámetros en el rendimiento de políticas ACT.
- Prototipado rápido de políticas robóticas con LeRobot: al ser un modelo pequeño y con un dataset de solo 50 episodios, permite iterar rápidamente en el flujo de entrenamiento y despliegue sin necesidad de grandes recursos computacionales.
- Benchmarking de métodos de imitación: puede utilizarse como referencia para comparar ACT con otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea y con el mismo robot.
- Educación en robótica y aprendizaje automático: el repositorio incluye documentación y comandos listos para ejecutar, lo que facilita su uso en cursos o talleres sobre control robótico basado en aprendizaje.
- Validación de pipelines de datos: el dataset asociado permite probar herramientas de visualización, aumento de datos o limpieza de episodios antes de aplicarlas a conjuntos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros y 0,2 GB de peso, la inferencia es ligera. Se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM, aunque no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., RTX 3060, RTX 4090, A100) es suficiente. El entrenamiento también es viable en una GPU de gama media.
- Compatibilidad con hardware de consumo: sí, el modelo cabe en GPUs de consumo habituales, siempre que se disponga de las cámaras y el robot adecuados.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que ofrece comandos como `lerobot-rollout` para inferencia en tiempo real. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. Aunque existen otras políticas ACT entrenadas con LeRobot en el Hub, no se han encontrado datos públicos de rendimiento, configuración o licencia que permitan una comparación rigurosa. Se recomienda consultar el [espacio de LeRobot en Hugging Face](https://huggingface.co/lerobot) para explorar alternativas.

## Limitaciones y advertencias

- Entrenamiento con un dataset reducido: solo 50 episodios, lo que puede limitar la generalización a variaciones de posición, iluminación o presencia de objetos distractores.
- Sin evaluación en robot real: la model card no incluye resultados de pruebas físicas, por lo que el rendimiento real en el robot no está verificado.
- Dependencia de la configuración de cámaras: el modelo espera exactamente tres cámaras (frontal, superior y pinza) con resoluciones específicas; cualquier cambio en la disposición puede degradar el rendimiento.
- Riesgo de sobreajuste: al ser un modelo pequeño entrenado con pocos datos, puede memorizar las trayectorias del dataset en lugar de aprender una política general.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con los términos de la licencia y de atribuir correctamente al autor original.
- No es un modelo de propósito general: está especializado en la tarea de pick and place y no puede utilizarse para otras tareas robóticas sin reentrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/woojin0831/act_so101_pick_place_50_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/woojin0831/so101_pick_place_50_v1)
- [Paper de ACT (Action Chunking with Transformers)](https://arxiv.org/abs/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=woojin0831/so101_pick_place_50_v1)
