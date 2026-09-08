# VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1

## Resumen

VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1 es un checkpoint de política robótica basado en MolmoAct2, un modelo fundacional abierto de robótica desarrollado por el Allen Institute for AI (Ai2). MolmoAct2 mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones de robot, y esta versión concreta ha sido ajustada mediante LeRobot para ejecutar una tarea de manipulación específica. El modelo está publicado bajo licencia Apache 2.0 y contiene 5.591.928.368 parámetros, con un peso total de 11,5 GB en formato safetensors.

El autor, VibeCuisine, se presenta como un proyecto orientado a reinventar la cocina doméstica para la era de la IA física, y este modelo parece ser un experimento de ajuste fino para una tarea de agarre y colocación de una jarra. El checkpoint fue entrenado con un único episodio de 270 frames a 20 FPS, con una configuración mínima de 10 pasos de entrenamiento. No se han publicado resultados de evaluación ni benchmarks, por lo que su rendimiento real no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo de robótica de Ai2) |
| Parametros totales | 5.591.928.368 (5,59 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica de Ai2 que transforma imágenes de cámara e instrucciones de lenguaje en chunks de acciones de robot. La implementación utilizada en este checkpoint es la de LeRobot, que soporta entrenamiento y evaluación del modelo original. El modelo consume observaciones de estado (7 dimensiones) y dos entradas visuales: una cámara superior `top` con resolución 640x480 y una cámara de muñeca `wrist` con resolución 480x640, y produce una salida de acción de 7 dimensiones.

El entrenamiento se realizó con el dataset `VibeCuisine/naaseh1-bottle-holder-calib-090326`, compuesto por un solo episodio de 270 frames a 20 FPS, con la tarea: "grasp the standing jug across its wide faces and stand it in the holder, spout to the right". La configuración de entrenamiento fue de 10 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y seed 1000, usando la versión 0.6.0 de LeRobot. No se indica la composición del dataset de preentrenamiento ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es, por tanto, un ajuste fino muy ligero sobre el modelo base, con una cantidad mínima de datos.

## Capacidades

- Generación de acciones robóticas a partir de imágenes y lenguaje natural.
- Soporte de dos cámaras (top y wrist) como entradas visuales.
- Entrada de estado del robot de 7 dimensiones y salida de acción de 7 dimensiones.
- Ejecución de una tarea específica de agarre y colocación de una jarra en un soporte.
- Compatibilidad con el framework LeRobot para entrenamiento e inferencia.
- Capacidades multilingües: no disponible.
- No se indica soporte de tool calling, razonamiento multi-step ni generación de texto general.

## Casos de uso

- Manipulación de objetos en cocinas domésticas: el modelo ha sido ajustado para agarrar una jarra y colocarla en un soporte, por lo que puede servir como base para tareas similares de agarre y colocación de utensilios en entornos de cocina, aprovechando la visión de cámara superior y de muñeca.
- Aprendizaje por imitación en robótica: se puede utilizar como punto de partida para fine-tuning en nuevas tareas de manipulación mediante LeRobot, dado que el modelo base MolmoAct2 es un modelo fundacional de políticas robóticas.
- Investigación en robótica: permite estudiar cómo un modelo de visión y lenguaje se adapta a tareas de manipulación con muy pocos datos, útil para experimentos de aprendizaje few-shot en políticas de acción.
- Automatización de laboratorio: el modelo puede adaptarse para manipular frascos, botellas y otros recipientes en entornos controlados, gracias a su capacidad de mapear imágenes a acciones.
- Robótica de asistencia en el hogar: tareas de recoger y colocar objetos en posiciones concretas, como colocar un recipiente en un soporte, son relevantes para robots domésticos.
- Evaluación de políticas robóticas: puede integrarse en pipelines de LeRobot para realizar rollout en un robot `seeed_b601_rs_follower`, permitiendo probar el comportamiento del modelo en entornos reales o simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 5.591.928.368 parámetros. En precisión fp32 requiere aproximadamente 22 GB, en fp16 unos 11 GB, y con cuantización 4-bit podría reducirse a unos 3 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones reales.
- GPU recomendadas: para ejecutar en fp16 se recomienda una GPU con al menos 12 GB de VRAM, como una RTX 4090 (24 GB) o una A100 40 GB. Para cuantización 4-bit podría usarse una GPU de gama media con 8 GB.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 puede alojar el modelo en fp16, ya que el repositorio pesa 11,5 GB y la VRAM disponible es suficiente.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, tanto en entrenamiento como en inferencia. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El checkpoint es un ajuste fino de MolmoAct2 para una tarea específica, y no se han publicado benchmarks comparativos con otros modelos. El modelo base MolmoAct2 es un modelo fundacional de robótica de Ai2, pero este checkpoint concreto se diferencia por haber sido entrenado con un dataset extremadamente pequeño (1 episodio, 270 frames). No se conocen alternativas comparables con datos de parámetros, contexto o rendimiento en la información disponible.

## Limitaciones y advertencias

- Entrenado con un solo episodio de 270 frames, lo que limita severamente su capacidad de generalización a nuevas situaciones, objetos o posiciones.
- No se han publicado resultados de evaluación, por lo que no se conoce su tasa de éxito ni su fiabilidad en entornos reales.
- Está ajustado para una tarea muy concreta: agarrar una jarra de pie por sus caras anchas y colocarla en un soporte con el pico a la derecha. Cualquier variación en el objeto o el entorno puede provocar fallos.
- Depende de las cámaras específicas `top` y `wrist` con las resoluciones indicadas; cambios en la configuración de cámaras pueden degradar el rendimiento.
- No se indica soporte multilingüe ni capacidades de razonamiento general, por lo que no debe usarse para tareas de lenguaje o visión fuera del ámbito robótico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no parece estar listo para producción debido a la falta de evaluación y a la escasez de datos de entrenamiento.
- Posibles sesgos derivados del dataset: al contener un único episodio, el modelo puede sobreajustarse a las condiciones específicas de ese episodio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/naaseh1-bottle-holder-calib-090326
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- GitHub de VibeCuisine: https://github.com/VibeCuisine
