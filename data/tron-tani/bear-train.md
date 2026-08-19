# tron-tani/bear-train

## Resumen

tron-tani/bear-train es una política de aprendizaje por imitación para robótica, entrenada con el método ACT (Action Chunking with Transformers) y publicada mediante el framework LeRobot de Hugging Face. El modelo fue desarrollado por Shoma Tani (tron-tani) y está diseñado para controlar un robot seguidor (so_follower) equipado con dos cámaras (frontal y de muñeca) para ejecutar la tarea de agarrar un objeto ("Grab the object").

Con 450 millones de parámetros, el modelo procesa observaciones visuales de 480x640 píxeles junto con el estado del robot (6 dimensiones) para producir acciones de 6 dimensiones. Se entrenó sobre un dataset de 50 episodios teleoperados (19.591 fotogramas a 30 FPS) durante 5.000 pasos con el optimizador AdamW. Publicado bajo licencia Apache 2.0, su relevancia radica en ser un ejemplo práctico y accesible de aplicación de ACT sobre hardware real, dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantización documentada) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de acciones individuales, lo que mejora la precisión y la consistencia temporal en tareas de manipulación robótica. La arquitectura se basa en transformers que procesan observaciones visuales de dos cámaras (frontal y de muñeca) junto con el estado del robot, y generan secuencias de acciones de 6 dimensiones. El método se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset tron-tani/record-moving-bear, que contiene 50 episodios teleoperados con 19.591 fotogramas a 30 FPS para la tarea "Grab the object". Se emplearon 5.000 pasos de entrenamiento con batch size 8, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni técnicas adicionales de refinamiento posterior.

## Capacidades

- Manipulación robótica por aprendizaje por imitación: el modelo ejecuta la tarea de agarrar objetos a partir de demostraciones teleoperadas.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y de muñeca) a 480x640 píxeles.
- Control de robot seguidor (so_follower): genera comandos de acción de 6 grados de libertad a partir del estado observado.
- Predicción de secuencias de acciones (action chunking): produce fragmentos de acciones en lugar de pasos individuales, lo que mejora la consistencia del movimiento.
- Integración completa con LeRobot: compatible con los comandos lerobot-rollout y lerobot-train, así como con el resto del ecosistema de Hugging Face para robótica.
- Entrenamiento reproducible: incluye configuración completa de entrenamiento (pasos, batch, optimizador, semilla) en la model card.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede controlar un brazo robótico para agarrar y mover objetos, reduciendo la intervención manual en entornos de investigación y pruebas.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, permite iterar sobre datasets teleoperados y validar nuevas tareas en horas, sin necesidad de escribir código de bajo nivel.
- Investigación en aprendizaje por imitación: sirve como referencia práctica para comparar ACT con otros métodos (diffusion policies, behavior cloning clásico) sobre hardware real.
- Educación y formación en robótica: al ser un modelo pequeño (450M parámetros) y con licencia Apache 2.0, es adecuado para cursos y talleres que utilicen robots de bajo coste tipo so_follower.
- Benchmarking de datasets de teleoperación: puede utilizarse como política de referencia para evaluar la calidad y consistencia de datasets de demostraciones antes de invertir en métodos más complejos.
- Desarrollo de estrategias de agarre guiado por visión: la combinación de cámara frontal y de muñeca permite experimentar con distintos enfoques de agarre y evaluar su robustez frente a variaciones de posición del objeto.
- Reentrenamiento transferible: el checkpoint puede servir como inicialización para fine-tuning en tareas similares con datasets más grandes, reduciendo el tiempo de convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación de la política en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros, los pesos en FP32 ocupan aproximadamente 1,8 GB, por lo que cabría en GPUs con 4 GB o más de VRAM. En FP16, el peso se reduce a unos 900 MB (estimación basada en el número de parámetros; no hay datos oficiales de consumo).
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de consumo estándar.
- Opciones de despliegue: LeRobot (lerobot-rollout), con soporte para hardware real (so_follower) y cámaras OpenCV.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los resultados de búsqueda. El modelo pertenece a la familia de políticas ACT entrenadas con LeRobot y comparte arquitectura con las políticas ACT publicadas en el repositorio oficial de LeRobot, pero no se han encontrado datos de otros modelos de la misma categoría (mismo robot o misma tarea) para comparar directamente métricas de rendimiento. Se puede señalar que, a diferencia de los modelos de lenguaje, este tipo de políticas se evalúa por tasa de éxito en tareas físicas, no por benchmarks de texto.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento efectivo no está verificado.
- El modelo se entrenó para una única tarea ("Grab the object") y un tipo de robot específico (so_follower); no es transferible directamente a otros robots o tareas sin reentrenamiento.
- El dataset de entrenamiento es limitado (50 episodios), lo que puede afectar a la generalización ante variaciones de iluminación, posición de objetos, distracciones o cambios en el entorno.
- No se especifican capacidades de procesamiento de lenguaje ni de razonamiento simbólico: es un modelo puramente de control robótico.
- El modelo no incluye mecanismos de seguridad, detección de fallos ni paradas de emergencia; en despliegue en robot real se requiere supervisión humana y validación previa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la compatibilidad del hardware y el cumplimiento de normativas de seguridad aplicables en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tron-tani/bear-train)
- [Dataset de entrenamiento](https://huggingface.co/datasets/tron-tani/record-moving-bear)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Visualización del dataset en LeRobot](https://huggingface.co/spaces/lerobot/visualize_dataset?path=tron-tani/record-moving-bear)
