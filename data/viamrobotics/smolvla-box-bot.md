# viamrobotics/smolvla-box-bot

## Resumen

El modelo `viamrobotics/smolvla-box-bot` es un fine-tune del modelo base `lerobot/smolvla_base`, un Vision-Language-Action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este ajuste ha sido realizado por Viam Robotics para resolver una tarea concreta de manipulación robótica: abrir las solapas de una caja (tarea "open box flaps"). El modelo se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot, lo que facilita su despliegue en robots reales.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en una tarea física específica mediante fine-tuning sobre un dataset propio, manteniendo un coste computacional bajo y siendo ejecutable en hardware de consumo. Al estar basado en SmolVLA, hereda su arquitectura eficiente de 450M parámetros, diseñada para democratizar la robótica basada en modelos de visión-lenguaje-acción. La ventana de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto de 450M parámetros, desarrollado por Hugging Face, que adapta un VLM preentrenado a tareas de control robótico. No se dispone de detalles internos sobre la arquitectura (si es transformer puro, híbrido, etc.) en la información proporcionada, pero se sabe que está diseñado para eficiencia en hardware de consumo.

El fine-tune `smolvla-box-bot` se entrenó con LeRobot sobre el dataset `viamrobotics/box-opener`, que contiene 125 episodios y 34.296 frames a 10 FPS, con la tarea de abrir solapas de caja. La configuración de entrenamiento incluye 10.000 pasos, batch size 8, optimizador AdamW, learning rate 0.0001 y semilla 1000. Las entradas del modelo son el estado del robot (6 dimensiones) y tres imágenes RGB de 256x256 píxeles procedentes de cámaras (`realsense_cam`, `camera_transform`), y la salida es una acción de 6 dimensiones.

## Capacidades

- Percepción visual multimodal: procesa simultáneamente tres cámaras RGB de 256x256 para capturar el entorno del robot.
- Control de acciones continuas: genera acciones de 6 dimensiones (probablemente posición y orientación del efector final).
- Especialización en una tarea concreta: apertura de solapas de cajas, aprendida mediante imitación.
- Integración con LeRobot: compatible con el flujo de trabajo estándar de LeRobot para entrenamiento y despliegue en robots reales.
- No soporta tool calling, generación de texto libre ni razonamiento conversacional; su función es exclusivamente robótica.

## Casos de uso

- Automatización de empaquetado en logística: el modelo puede controlar un brazo robótico para abrir cajas de cartón de forma autónoma, reduciendo la intervención manual en líneas de preparación de pedidos.
- Manipulación en entornos industriales: sirve como punto de partida para adaptar el modelo a otras tareas de apertura o plegado de envases mediante fine-tuning adicional.
- Investigación en aprendizaje por imitación: permite estudiar cómo un VLA compacto se especializa en una tarea física con pocos datos (125 episodios) y qué factores afectan al rendimiento.
- Prototipado rápido en robótica: al estar integrado en LeRobot, se puede desplegar en un robot compatible en minutos con el comando `lerobot-rollout`, ideal para pruebas de concepto.
- Educación y desarrollo de habilidades robóticas: sirve como ejemplo práctico de fine-tuning de un VLA para una tarea específica, útil en cursos de robótica y aprendizaje automático.
- Base para transferencia de tareas: aunque está entrenado para abrir cajas, su arquitectura permite reutilizar el conocimiento visual y de control para tareas similares de manipulación con poco reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. No se proporcionan métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- Al tener 450 millones de parámetros, el modelo es considerablemente más ligero que otros VLA (como OpenVLA con 7B), lo que permite su ejecución en GPU de consumo.
- VRAM estimada: en FP32, los pesos ocupan aproximadamente 1,8 GB; en FP16, alrededor de 0,9 GB. Sin embargo, no se especifican requisitos oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.). Para entrenamiento, se recomienda una GPU con más memoria (por ejemplo, RTX 3090 o superior).
- Opciones de despliegue: el modelo se utiliza a través de LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Aunque existen otros VLA como OpenVLA (7B parámetros) o RT-2, no hay datos públicos sobre el rendimiento relativo de este fine-tune específico frente a ellos. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para comparaciones del modelo base, pero no se incluyen aquí por falta de datos concretos en la información disponible.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para la tarea de abrir solapas de caja; no es generalizable a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no se han reportado tasas de éxito en el robot real, por lo que su rendimiento efectivo es desconocido.
- Dependencia del dataset: el entrenamiento se realizó con 125 episodios, lo que puede limitar la robustez ante variaciones de iluminación, posiciones de caja o tipos de cartón.
- Requiere hardware específico: necesita un robot con las cámaras y configuración exactas utilizadas en el entrenamiento (tres cámaras, estado de 6 dimensiones).
- Sin soporte de lenguaje natural: a pesar de ser un VLA, no procesa instrucciones de texto en esta versión; la tarea está fijada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y el dataset asociado.

## Enlaces

- Modelo en Hugging Face: [viamrobotics/smolvla-box-bot](https://huggingface.co/viamrobotics/smolvla-box-bot)
- Modelo base: [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- Dataset de entrenamiento: [viamrobotics/box-opener](https://huggingface.co/datasets/viamrobotics/box-opener)
- Paper de SmolVLA: [arXiv:2506.01844](https://arxiv.org/abs/2506.01844)
- Guía de LeRobot para SmolVLA: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
