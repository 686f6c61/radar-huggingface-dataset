# VibeCuisine/vds-smoke-20260907-gcp-molmoact2-v3-us-central1-c-longspot40

## Resumen

El modelo `VibeCuisine/vds-smoke-20260907-gcp-molmoact2-v3-us-central1-c-longspot40` es una política de robótica de aprendizaje por imitación basada en MolmoAct2, un modelo fundacional de robótica de código abierto desarrollado por el Allen Institute for AI (Ai2). Está implementado con la librería LeRobot de Hugging Face y ha sido entrenado por VibeCuisine para una tarea concreta: agarrar un pepino en el punto de un tercio de su longitud, utilizando un robot tipo `vibeboard_follower_tilt` con tres cámaras (esquina, superior y muñeca).

El modelo mapea imágenes de cámara y una instrucción en lenguaje natural a chunks de acciones de robot. Tiene un total de 5.591.928.368 parámetros (aproximadamente 5.59 mil millones) y se distribuye en formato safetensors. El entrenamiento se realizó sobre un dataset curado de 64 episodios y 3478 fotogramas a 20 FPS, con una configuración de solo 10 pasos de entrenamiento, lo que indica un ajuste fino muy ligero. Actualmente no se han publicado resultados de evaluación, por lo que su rendimiento real en el robot no está validado públicamente.

La relevancia de este modelo radica en que demuestra cómo un modelo fundacional de visión-lenguaje-acción puede adaptarse a una tarea de manipulación específica con muy pocos datos y pasos de entrenamiento, dentro del ecosistema LeRobot. Es un ejemplo práctico de fine-tuning en robótica para aplicaciones de preparación de alimentos, como la plataforma VibeBoard de VibeCuisine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de política de visión-lenguaje-acción (VLA) basado en MolmoAct2 de Ai2; arquitectura interna no especificada en la información disponible |
| Parametros totales | 5.591.928.368 |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica de código abierto del Allen Institute for AI (Ai2) que mapea imágenes de cámara e instrucciones en lenguaje natural a chunks de acciones de robot. La implementación en LeRobot permite entrenar y evaluar el modelo estándar. En este caso, VibeCuisine ha realizado un fine-tuning sobre el modelo base para una tarea específica de agarre.

El dataset de entrenamiento es `VibeCuisine/vibepi3-grab-poseexpert-r3-curated`, compuesto por 64 episodios y 3478 fotogramas a 20 FPS, con la tarea "Grab the cucumber at the one-third point". La configuración de entrenamiento incluye 10 pasos, tamaño de lote 1, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y la versión 0.6.0 de LeRobot. No se proporcionan detalles sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO, ya que no es un modelo de lenguaje general.

## Capacidades

- Control robótico: genera acciones de 7 dimensiones para el robot a partir de observaciones visuales y del estado del robot.
- Entrada multimodal: procesa tres cámaras (corner, top, wrist) con resolución 480x640 y el estado del robot de 7 dimensiones.
- Ejecución de tareas de manipulación: entrenado específicamente para agarrar un pepino en el punto de un tercio de su longitud.
- Integración con LeRobot: puede ejecutarse con `lerobot-rollout` y entrenarse con `lerobot-train`, siguiendo la guía oficial de MolmoAct2.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto general.
- Capacidades multilingües no especificadas.

## Casos de uso

- Automatización de preparación de alimentos: el modelo puede integrarse en un robot tipo VibeBoard para agarrar ingredientes como pepinos en puntos específicos, reduciendo la intervención manual en tareas repetitivas de cocina.
- Investigación en aprendizaje por imitación: permite a investigadores probar políticas de visión-lenguaje-acción en el framework LeRobot, con un dataset y una configuración de entrenamiento reproducibles.
- Prototipado rápido de tareas robóticas: al ser un fine-tuning ligero, se puede reentrenar para nuevas tareas con pocos datos y validar en hardware real en cuestión de horas.
- Control de brazo robótico en entornos de cocina: el modelo puede usarse como componente de un sistema de manipulación para tareas de agarre preciso, aprovechando las tres cámaras para una percepción robusta.
- Benchmarking de políticas: sirve como referencia para comparar el rendimiento de diferentes políticas de imitación en la misma tarea, aunque aún no se han publicado resultados de evaluación.
- Educación y demostraciones: es útil para cursos de robótica y demostraciones de IA aplicada, ya que está integrado en LeRobot y puede ejecutarse con comandos sencillos.
- Integración en sistemas de producción de alimentos: potencial para automatizar líneas de manipulación de ingredientes, siempre que se realice una validación adicional en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Dado el tamaño de los pesos (5.59 mil millones de parámetros, ~11.5 GB en el repositorio), en FP16 los pesos ocupan aproximadamente 11.2 GB. Con las entradas de imagen y el overhead de inferencia, se estima que se requieren al menos 16 GB de VRAM.
- GPU recomendadas: se recomienda una GPU con 24 GB o más, como RTX 4090, A100 40GB o H100 80GB, para disponer de margen con las tres cámaras y el estado del robot.
- Compatibilidad con GPU de consumo: es probable que funcione en una RTX 3090 o RTX 4090 (24 GB), pero no está garantizado sin cuantización.
- Opciones de despliegue: LeRobot (rollout), Hugging Face Hub, PyTorch. No es compatible con vLLM ni llama.cpp, ya que es un modelo de política robótica, no un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa directa. El modelo es un fine-tuning específico de MolmoAct2 para una tarea de agarre con un robot concreto; no se han encontrado otras políticas públicas con la misma configuración de robot y tarea en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dataset pequeño (64 episodios y 3478 fotogramas) y solo 10 pasos de entrenamiento: el modelo es un ajuste muy ligero, lo que puede provocar sobreajuste y poca generalización.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real en la tarea de agarre.
- Tarea y robot específicos: no generaliza a otros objetos, entornos o robots sin reentrenamiento.
- Dependencia de cámaras concretas: los nombres y configuraciones de las cámaras deben coincidir con las usadas durante el entrenamiento.
- Riesgo de comportamiento no seguro en entornos no controlados, especialmente en aplicaciones con contacto físico con objetos o personas.
- Licencia Apache 2.0: permite uso comercial, pero requiere atribución; el modelo base MolmoAct2 también tiene su propia licencia.
- No soporta tool calling ni interacción de lenguaje más allá de la instrucción de tarea.
- Posibles sesgos derivados del dataset de entrenamiento, que solo cubre una tarea y un entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-molmoact2-v3-us-central1-c-longspot40
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Web de VibeCuisine: https://www.vibecuisine.com/
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
