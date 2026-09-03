# stairmed/piper_dex15_grasp_bottle_finally_act_smooth_v1

## Resumen

El modelo `stairmed/piper_dex15_grasp_bottle_finally_act_smooth_v1` es una política de control robótico entrenada con la librería LeRobot de Hugging Face. Está diseñada para que un robot manipulador de tipo `piper_dex15_stairmed` realice la tarea de agarrar una botella utilizando una cámara en la palma como entrada visual y el estado del robot como entrada de estado. El modelo pertenece a la familia de políticas ACT (Action Chunking Transformer) con una variante denominada `act_smooth`, que incorpora suavizado en la generación de acciones para mejorar la fluidez del movimiento.

El modelo fue desarrollado por el usuario `stairmed` y se publica bajo licencia Apache 2.0. Tiene aproximadamente 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB. Se entrenó con un conjunto de datos de 60 episodios y 18.349 fotogramas a 30 FPS, recogidos específicamente para la tarea de agarre de botella. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas de imitación para robótica con LeRobot, y puede servir como punto de partida para tareas similares de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con variante `act_smooth` |
| Parametros totales | 51.675.883 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control robótico, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en la arquitectura ACT (Action Chunking Transformer), un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado. La variante `act_smooth` incorpora un mecanismo de suavizado temporal sobre las acciones generadas, lo que reduce la vibración y mejora la estabilidad del movimiento en el robot. El modelo consume como entrada una imagen de la cámara de la palma con forma `(3, 640, 480)` y un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-5, un tamaño de lote de 32 y 50.000 pasos de entrenamiento. El conjunto de datos proviene del repositorio `stairmed/piper_dex15_grasp_bottle_finally`, que contiene 60 episodios y 18.349 fotogramas a 30 FPS, con las tareas etiquetadas como "grasp bottle" y "grasp_bottle". No se especifica el uso de técnicas como RLHF o DPO, ya que es un modelo de imitación supervisada.

## Capacidades

- Control de agarre de objetos: el modelo está entrenado específicamente para agarrar una botella con un robot de 15 grados de libertad (tipo `piper_dex15_stairmed`).
- Percepción visual: utiliza una cámara en la palma del robot para observar la escena y generar acciones.
- Generación de acciones suavizadas: la variante `act_smooth` produce movimientos más fluidos y estables que una ACT estándar.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, razonamiento multimodal ni procesamiento de lenguaje natural, al ser un modelo puramente motor.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede integrarse en un brazo robótico para recoger botellas u objetos similares de una cinta transportadora, reduciendo la intervención manual.
- Manipulación en laboratorios de investigación: sirve como base para experimentos de aprendizaje por imitación en robótica, permitiendo reproducir y comparar resultados con otras políticas.
- Pruebas de control de robots de bajo coste: al ser un modelo pequeño (51,7 M de parámetros), puede ejecutarse en hardware modesto, facilitando su uso en entornos educativos o de prototipado.
- Desarrollo de nuevas tareas de agarre: el modelo puede fine-tuning con nuevos datasets para adaptarlo a otros objetos o configuraciones de cámara.
- Evaluación de políticas de imitación: se puede utilizar como referencia para medir el rendimiento de otras arquitecturas (por ejemplo, Diffusion Policy) en la misma tarea.
- Demostración de flujo completo de LeRobot: sirve como ejemplo práctico de cómo grabar datos, entrenar y desplegar una política con LeRobot, útil para talleres y tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la documentación del modelo.
- Dado el tamaño de 51,7 millones de parámetros, la inferencia es ligera y probablemente ejecutable en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos oficiales que lo confirmen.
- El despliegue se realiza mediante el ecosistema LeRobot, que soporta inferencia en PyTorch con CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la frecuencia de control del robot (30 FPS en el dataset), pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para agarre con LeRobot). No se han encontrado referencias a otros modelos con la misma arquitectura y tarea en la documentación proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de agarrar una botella con un robot específico (`piper_dex15_stairmed`). No generaliza a otros objetos, configuraciones de cámara o robots sin un reentrenamiento adecuado.
- El conjunto de datos es pequeño (60 episodios), lo que puede limitar la robustez frente a variaciones de iluminación, posición del objeto o distracciones en el entorno.
- No se han realizado evaluaciones en robot real, por lo que el rendimiento real en producción es desconocido.
- La política depende de la calibración de la cámara y del robot; cualquier cambio en la configuración física puede degradar el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no incluye soporte técnico.
- No se han documentado sesgos específicos, pero al ser un modelo de imitación, puede heredar sesgos del demostrador humano que recogió los datos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/stairmed/piper_dex15_grasp_bottle_finally_act_smooth_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/stairmed/piper_dex15_grasp_bottle_finally)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Referencia de LeRobot (paper)](https://github.com/huggingface/lerobot) (cita en la model card)
- [Repositorio relacionado de piper_act_bottle_grasp](https://github.com/zhitaoqiu/piper_act_bottle_grasp/tree/main/docs) (referencia externa encontrada en la búsqueda)
