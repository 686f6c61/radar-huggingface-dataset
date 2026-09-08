# VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3

## Resumen

El modelo `VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3` es una política robótica basada en MolmoAct2, un modelo fundacional de robótica open source desarrollado por el Allen Institute for AI (Ai2). Este modelo mapea imágenes de cámara e instrucciones de lenguaje a acciones de robot, y ha sido entrenado y publicado por el usuario VibeCuisine utilizando el framework LeRobot de Hugging Face. El problema que resuelve es la generación de acciones de manipulación a partir de percepción visual y comandos en lenguaje natural, lo que permite a un robot ejecutar tareas de agarre con precisión.

El modelo cuenta con 5.591.928.368 parámetros (aproximadamente 5.592 millones) y su repositorio ocupa 11.5 GB en formato safetensors. La tarea para la que fue entrenado es "Grab the cucumber at the one-third point" en un robot de tipo `vibeboard_follower_tilt`, utilizando tres cámaras (`corner`, `top`, `wrist`). La longitud de contexto no está especificada en la información disponible. Su relevancia radica en ser un ejemplo de aplicación de modelos fundacionales multimodales a la robótica, con licencia Apache 2.0 y disponibilidad pública en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de robótica multimodal MolmoAct2) |
| Parametros totales | 5.591.928.368 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | LeRobot |
| Pipeline | Robotics |
| Tamano del repositorio | 11.5 GB |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por imitación basada en MolmoAct2, un modelo fundacional de robótica que combina percepción visual (imágenes de tres cámaras) y lenguaje natural (instrucciones) para generar acciones de robot. La implementación utiliza LeRobot y soporta entrenamiento y evaluación del modelo MolmoAct2 regular. No se proporcionan detalles sobre la arquitectura interna (por ejemplo, si es un transformer o un modelo de mezcla de expertos) en la información disponible.

El entrenamiento se realizó sobre el dataset `VibeCuisine/vibepi3-grab-poseexpert-r3-curated`, que contiene 64 episodios y 3478 frames a 20 FPS, con la tarea "Grab the cucumber at the one-third point". La configuración de entrenamiento incluye 10 pasos, batch size de 1, optimizador AdamW con learning rate de 1e-05, semilla 1000 y la versión 0.6.0 de LeRobot. No hay información sobre técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas destacables.

## Capacidades

- Mapea imágenes de tres cámaras (`corner`, `top`, `wrist`) y una instrucción de lenguaje a una acción de robot de 7 dimensiones.
- Es una política de imitación entrenada con demostraciones humanas, capaz de ejecutar la tarea específica "Grab the cucumber at the one-third point".
- Se integra con el framework LeRobot para entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- Soporta el formato de pesos safetensors y la licencia Apache 2.0.
- No se especifican capacidades de tool calling, razonamiento multi-paso, soporte de agentes, capacidades multilingües ni generación de texto en la información disponible.

## Casos de uso

- **Manipulación robótica de precisión en laboratorio:** el modelo puede ejecutar la tarea de agarrar un pepino en un punto específico usando tres cámaras, lo que permite automatizar experimentos de manipulación en entornos controlados.
- **Aprendizaje por imitación para tareas de picking:** entrenado con 64 episodios y 3478 frames, puede replicar movimientos de agarre en un robot de tipo `vibeboard_follower_tilt`, sirviendo como referencia para estudios de imitación.
- **Investigación en políticas robóticas:** el modelo actúa como baseline en el framework LeRobot para comparar el rendimiento de diferentes estrategias de aprendizaje por imitación.
- **Despliegue de robots en entornos controlados:** mediante el comando `lerobot-rollout`, se puede ejecutar la política en un robot real con el hardware especificado, lo que facilita la validación en laboratorio.
- **Fine-tuning para nuevas tareas:** se puede adaptar a otras tareas de manipulación mediante entrenamiento adicional con nuevos datasets usando `lerobot-train`, aprovechando la arquitectura MolmoAct2.
- **Evaluación de percepción multimodal en robótica:** el modelo combina imágenes de cámaras y lenguaje, lo que permite estudiar cómo las instrucciones afectan al comportamiento del robot en tareas de agarre.
- **Automatización de tareas repetitivas en producción:** con el robot adecuado, puede realizar agarres repetitivos en una línea de montaje, aunque requiere validación previa en el entorno real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible. El repositorio ocupa 11.5 GB en safetensors, por lo que se necesita una GPU con capacidad suficiente para cargar los pesos, pero no se especifica la cuantización ni la VRAM exacta.
- **GPU recomendadas:** no disponible.
- **¿Cabe en consumer GPU?:** no disponible.
- **Opciones de despliegue:** LeRobot, con los comandos `lerobot-rollout` y `lerobot-train`. El entrenamiento requiere CUDA (`--policy.device=cuda`).
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos alternativos de la misma categoría. Los repositorios relacionados son variantes del mismo modelo (molmoact2) con diferentes configuraciones, pero no se especifican sus parámetros ni rendimiento. A continuación se listan las variantes encontradas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3 | 5.591.928.368 | No disponible | Apache 2.0 | Hugging Face |
| VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1 | No disponible | No disponible | Apache 2.0 | Hugging Face |
| VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3-quantiles | No disponible | No disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No se han publicado resultados de evaluación, por lo que el rendimiento real en robot no está validado.
- El dataset de entrenamiento es muy pequeño (64 episodios, 3478 frames) y solo se realizaron 10 pasos de entrenamiento, lo que puede limitar la generalización y la robustez.
- La política está especializada en una tarea concreta ("Grab the cucumber at the one-third point") y puede fallar en otras tareas o en condiciones diferentes.
- Los idiomas soportados no están especificados; las instrucciones probablemente están en inglés, pero no se confirma.
- El modelo requiere un robot específico (`vibeboard_follower_tilt`) y cámaras concretas (`corner`, `top`, `wrist`), lo que limita su portabilidad a otros robots.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base MolmoAct2 y de LeRobot.
- El tamaño del repositorio es 11.5 GB, lo que puede ser un requisito de almacenamiento en entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Variante del modelo: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-naaseh1
- Variante con cuantización: https://huggingface.co/VibeCuisine/vds-smoke-20260907-runpod-molmoact2-v3-quantiles
- Blog de Ai2 sobre MolmoAct2: https://allenai.org/blog/molmoact2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
