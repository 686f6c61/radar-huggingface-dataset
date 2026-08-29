# Sounderya/smolvla-ur3-base-10-90-simstats

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y presentado en el paper arxiv:2506.01844. Este modelo concreto, `Sounderya/smolvla-ur3-base-10-90-simstats`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Sounderya para controlar un robot UR3 en una tarea de manipulación: recoger una taza y colocarla en un plato. Con 450 millones de parámetros, está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto coste.

El modelo se ha entrenado mediante aprendizaje por imitación con el framework LeRobot, utilizando un dataset propio de 120 episodios y más de 91 000 frames. Su relevancia radica en demostrar que los VLA pueden ser lo suficientemente ligeros para desplegarse en robots reales con GPUs de gama media, manteniendo un rendimiento competitivo en tareas de manipulación. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM (ver paper arxiv:2506.01844) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no disponible (modelo orientado a tareas de robotica, no a lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje ligero (basado en SmolVLM) con una cabeza de acción que predice comandos de control del robot. En este caso, el modelo recibe tres imágenes de cámaras (resolución 256×256) y un vector de estado de 6 dimensiones (posición y orientación del efector), y produce una acción de 10 dimensiones (posiblemente posición, orientación y velocidad). La arquitectura exacta (número de capas, atención, etc.) no se detalla en la información proporcionada, pero se puede consultar el paper original.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios de la tarea "Pick the mug and place it on the plate" a 30 FPS. Se usaron 15 000 pasos de entrenamiento con batch size 64, optimizador AdamW y learning rate 5e-5. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera acciones de 10 dimensiones a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres flujos de cámara simultáneos (muñeca, derecha y una tercera cámara) a 256×256 píxeles.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecución en tiempo real: al ser un modelo compacto, puede operar a frecuencias de control adecuadas para robots reales (30 FPS de entrada).
- No incluye capacidades de lenguaje conversacional, tool calling ni razonamiento simbólico; está especializado en la tarea de manipulación concreta.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede controlar un brazo UR3 para recoger objetos de una posición fija y colocarlos en otra, como en líneas de ensamblaje o clasificación.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevos entornos o tareas, gracias a su pequeño tamaño y facilidad de fine-tuning.
- Prototipado rápido de tareas de manipulación: con LeRobot, un desarrollador puede grabar demostraciones, entrenar el modelo y desplegarlo en un robot en pocas horas, ideal para pruebas de concepto.
- Educación y formación en robótica: al requerir solo una GPU de consumo, es adecuado para laboratorios universitarios que enseñan aprendizaje por imitación.
- Benchmarking de VLA ligeros: puede utilizarse como referencia para comparar el rendimiento de modelos compactos frente a alternativas más grandes en tareas de manipulación.
- Integración en sistemas de control existentes: el modelo puede conectarse a un robot UR3 mediante el framework LeRobot, permitiendo sustituir controladores clásicos por una política aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 M de parámetros, en FP32 ocuparía ~1.8 GB, en FP16 ~0.9 GB. Se puede inferir que cabe en GPUs con 4 GB o más, aunque no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4090). Para entrenamiento, se recomienda una GPU con 8 GB o más.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: el modelo se usa a través de LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan formatos GGUF ni despliegue con vLLM u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Se espera que sea adecuado para control en tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla-ur3-base-10-90-simstats | 450 M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7 B | no disponible | MIT | Hugging Face |
| RT-2 (referencia) | 55 B | no disponible | propietaria | no publico |

SmolVLA es significativamente más pequeño que OpenVLA o RT-2, lo que facilita su despliegue en hardware modesto, aunque su rendimiento en tareas generales puede ser inferior. No hay datos objetivos para una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado para una única tarea (recoger taza y colocarla en plato) con un robot UR3 específico. No generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Dependencia del dataset: el rendimiento está limitado por la calidad y variedad de las demostraciones. Si el dataset tiene sesgos (p. ej., posiciones fijas de la cámara), el modelo fallará ante variaciones.
- Sin evaluación publicada: no hay métricas de éxito en el robot real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de alucinación visual: como todo modelo de visión, puede malinterpretar imágenes con condiciones de iluminación o fondos diferentes a los del entrenamiento.
- Sin soporte de lenguaje: no puede interpretar instrucciones en texto ni mantener diálogo; solo ejecuta la tarea aprendida.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones (el dataset es de Sounderya, aunque no se especifican restricciones adicionales).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-base-10-90-simstats
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
