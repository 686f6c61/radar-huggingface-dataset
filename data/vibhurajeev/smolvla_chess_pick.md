# vibhurajeev/smolvla_chess_pick

## Resumen

El modelo `vibhurajeev/smolvla_chess_pick` es un ajuste fino (fine-tuning) del modelo base **SmolVLA** (Vision-Language-Action) desarrollado por Hugging Face, especializado en una tarea concreta de robótica: recoger piezas de ajedrez. Está publicado bajo licencia Apache 2.0 y ha sido entrenado con el framework LeRobot usando un dataset propio de 100 episodios con 30 259 frames a 30 FPS. El modelo base SmolVLA es una arquitectura compacta de 450 millones de parámetros diseñada para ejecutarse en hardware de consumo, lo que lo hace accesible para desarrolladores y laboratorios sin infraestructura de alto coste.

Este ajuste concreto consume tres imágenes de cámaras (top, muñeca y una tercera) y un vector de estado de 6 dimensiones, y produce acciones de 6 dimensiones para controlar un robot seguidor (`so_follower`). La tarea se define como "Pick up the piece" (recoger la pieza). El modelo se ha entrenado durante 25 000 pasos con un batch de 16, optimizador AdamW y una tasa de aprendizaje de 0.0001. No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado.

La relevancia actual radica en que demuestra cómo un modelo VLA de tamaño reducido puede ajustarse a tareas específicas con un dataset relativamente pequeño, siguiendo el flujo de trabajo abierto de LeRobot. Esto facilita la experimentación en robótica de manipulación sin necesidad de grandes clústeres de GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se especifica en la documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Está diseñado para procesar observaciones multimodales (imágenes de cámaras y estado del robot) y generar comandos de actuación de baja dimensión. El modelo base fue preentrenado por Hugging Face y este ajuste fino se realizó sobre él.

El entrenamiento se llevó a cabo con LeRobot (versión 0.6.2) sobre el dataset `vibhurajeev/chess_pick_20260830_161214`, que contiene 100 episodios de demostración de la tarea "recoger la pieza". Se usaron 25 000 pasos de entrenamiento con un batch de 16, optimizador AdamW, tasa de aprendizaje de 0.0001 y semilla 1000. No se mencionan técnicas adicionales como RLHF o DPO; se trata de un aprendizaje por imitación estándar. El modelo fue subido al Hub directamente desde LeRobot tras el entrenamiento.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Procesamiento de imágenes de múltiples cámaras: acepta tres entradas visuales de 256×256 píxeles, lo que permite percepción desde distintos ángulos.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo despliegue mediante `lerobot-rollout`.
- Especialización en tareas de recogida de piezas: el modelo está ajustado específicamente para la tarea "Pick up the piece", aunque podría generalizar a tareas similares con datos adicionales.
- No incluye capacidades de chat, tool calling ni razonamiento general de lenguaje: es un modelo de política puramente orientado a acciones de robot.

## Casos de uso

- Automatización de manipulación en laboratorios: el modelo puede controlar un robot tipo `so_follower` para recoger piezas de un tablero, útil en entornos de investigación de robótica.
- Prototipado rápido de políticas de imitación: sirve como ejemplo de cómo ajustar SmolVLA a una tarea concreta con pocos datos, permitiendo a otros desarrolladores replicar el flujo.
- Pruebas de hardware de bajo coste: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de consumo, facilitando experimentos en entornos sin servidores dedicados.
- Educación en robótica: como caso práctico de entrenamiento y despliegue de un VLA con LeRobot, útil para cursos y talleres.
- Recogida selectiva de objetos en líneas de montaje: con un dataset adecuado, el enfoque podría adaptarse a tareas de picking en entornos industriales sencillos.
- Benchmark de rendimiento de VLA compactos: este modelo puede servir como punto de referencia para comparar estrategias de ajuste fino en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, MMLU u otras comparativas.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros, lo que lo hace adecuado para GPUs de consumo como RTX 3090, RTX 4090 o similares con al menos 8-12 GB de VRAM (estimación orientativa, no hay datos oficiales).
- No se especifican requisitos exactos de VRAM en la documentación del modelo.
- Para inferencia en tiempo real con tres cámaras, se recomienda una GPU con soporte CUDA y suficiente memoria para el procesamiento de imágenes.
- El despliegue se realiza mediante LeRobot, que soporta ejecución local con `lerobot-rollout`. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados; dependerán del hardware y de la frecuencia de las cámaras (30 FPS en el dataset).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. SmolVLA base es significativamente más pequeño que alternativas como OpenVLA (7B parámetros), pero no se han publicado resultados de rendimiento para esta variante ajustada. Se recomienda consultar el paper de SmolVLA (arXiv:2506.01844) para comparaciones con el modelo base y otros enfoques.

## Limitaciones y advertencias

- No hay evaluación en robot real: la model card indica explícitamente que no se han proporcionado resultados de éxito, por lo que el rendimiento real no está verificado.
- Dataset limitado a una tarea específica: el modelo fue entrenado solo para recoger piezas de ajedrez en un entorno concreto; puede no generalizar a otras tareas o variaciones de iluminación, posición de objetos, etc.
- Dependencia de las cámaras y del robot: las observaciones esperan tres cámaras con nombres específicos (`top`, `wrist` y una tercera), y el robot debe ser del tipo `so_follower`; cualquier cambio en la configuración de hardware requerirá reentrenamiento.
- Riesgo de sobreajuste: con solo 100 episodios y 25 000 pasos, existe posibilidad de que el modelo memorice las demostraciones en lugar de aprender una política robusta.
- Sin soporte de idiomas ni interacción conversacional: no es un modelo de chat; su salida son acciones numéricas, no texto.
- Licencia abierta (Apache 2.0) permite uso comercial, pero el usuario debe verificar la licencia del dataset y del modelo base (ambos Apache 2.0, según la información disponible).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vibhurajeev/smolvla_chess_pick)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Documentación de LeRobot sobre SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Documentación de rollout de LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
- [Dataset de entrenamiento](https://huggingface.co/datasets/vibhurajeev/chess_pick_20260830_161214)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=vibhurajeev/chess_pick_20260830_161214)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
