# VibeCuisine/vds-smoke-20260909-resume-molmoact2-cont

## Resumen

El modelo VibeCuisine/vds-smoke-20260909-resume-molmoact2-cont es una política de robótica basada en MolmoAct2, un modelo de fundación de robótica de código abierto desarrollado por el Allen Institute for AI (Ai2), que mapea imágenes de cámara e instrucciones de lenguaje natural a trozos de acción (action chunks) para el control de robots. Ha sido entrenado y publicado con el framework LeRobot de Hugging Face sobre el dataset VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-v1-trim, que contiene 751 episodios y 97.621 frames de tareas de manipulación de pepinos (agarrar, colocar, pelar e inclinar). El modelo tiene 5.601.988.144 parámetros, un peso total de 18,5 GB, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ser un ejemplo de política VLA (visión-lenguaje-acción) entrenada de extremo a extremo con LeRobot, pensada para ser ejecutada en el robot «vibeboard_follower_tilt» con tres cámaras (superior, muñeca y base).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MolmoAct2 (modelo de fundación de robótica, visión-lenguaje-acción) |
| Parametros totales | 5.601.988.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de política; no maneja ventana de contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MolmoAct2 definida por Ai2, diseñada para consumir observaciones multimodales (tres imágenes de 480x640 píxeles y un vector de estado de 7 dimensiones) y producir un vector de acción de 7 dimensiones, en forma de trozos de acción. Según la model card, las entradas son: observación del estado de 7 valores, imágenes de las cámaras top, wrist y base con forma (3, 480, 640). La salida es una acción de forma (7,).

Según la información disponible, el modelo es una implementación sobre el framework LeRobot 0.6.2 y se ha entrenado en el dataset VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-v1-trim, con 751 episodios y 97.621 frames a 20 FPS. La configuración de entrenamiento consta de 9.010 pasos, batch size 8, optimizador molmoact2_adamw, learning rate 1e-5 y seed 42. No se mencionan procesos de preentrenamiento adicionales, RLHF ni DPO. Las tareas específicas del dataset son: agarrar el pepino cerca de uno de sus extremos, colocarlo en el centro de la tabla de cortar (en distintas orientaciones), pelar la piel con varios movimientos y girar el pepino lateralmente.

## Capacidades

- Genera trozos de acción de 7 dimensiones para controlar un robot.
- Consume instrucciones de lenguaje natural junto con tres vistas de cámara simultáneas (top, muñeca y base).
- Integra una representación de estado del robot de 7 valores como entrada adicional.
- Está entrenado para tareas concretas de manipulación: agarrar, colocar, pelar e inclinar un pepino en un entorno de cocina.
- Es compatible con el ecosistema LeRobot: puede ejecutarse con `lerobot-rollout` y entrenarse con `lerobot-train`.
- No es un modelo de generación de texto general: no realiza razonamiento de lenguaje extenso, tool calling ni generación de código.

## Casos de uso

- Automatización de preparación de alimentos en cocinas: el modelo ejecuta tareas de pelado y colocación de vegetales, recibiendo órdenes en lenguaje natural en un robot con cámara en la muñeca y en la base.
- Investigación en aprendizaje por imitación: sirve como política de referencia para estudiar cómo los modelos VLA generalizan a partir de un número limitado de demostraciones (751 episodios).
- Manipulación en líneas de envasado de alimentos: robot que agarra y coloca objetos alargados, como pepinos, en posiciones precisas sobre una tabla de cortar.
- Robótica de laboratorio: tareas de agarre y reposicionamiento de muestras, adaptando la instrucción en lenguaje natural para variar el objetivo.
- Asistencia en entornos domésticos: robots colaborativos que interpretan órdenes simples («coge el pepino», «ponlo en la tabla») y ejecutan la secuencia de acciones necesaria.
- Benchmark de políticas VLA en robótica: el modelo puede usarse como comparativa en trabajos de investigación sobre control basado en visión y lenguaje, gracias a su integración con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia, los pesos en FP16 ocuparían aproximadamente 11,2 GB (5.601.988.144 × 2 bytes), por lo que se necesita una GPU con al menos 12 GB de VRAM, y probablemente más para activaciones y buffers de LeRobot.
- GPU recomendadas: no se especifica en el repo; para una carga de pesos de ~11,2 GB en FP16, una GPU de 24 GB (por ejemplo, RTX 4090 o A10G) ofrece margen suficiente, y una A100/H100 sería adecuada para entrenamiento.
- Capacidad en GPUs de consumo: con FP16 se requiere más de 12 GB de VRAM, por lo que no cabe en tarjetas de 8 GB.
- Opciones de despliegue: LeRobot (Python/PyTorch) mediante `lerobot-rollout`; no se documentan integraciones con vLLM, llama.cpp ni otros servidores de inferencia de LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente sobre un conjunto de demostraciones de manipulación de pepinos (751 episodios), por lo que su capacidad de generalización a otros objetos, texturas o escenarios es limitada.
- No se han publicado resultados de evaluación en robot real, por lo que no hay datos de tasa de éxito.
- Las entradas están fijadas a tres cámaras (top, muñeca y base) y a un vector de estado de 7 dimensiones; variaciones en la configuración del robot o de las cámaras pueden degradar el rendimiento.
- Al ser un modelo de política dependiente del hardware, la transferencia a otros robots o entornos requiere reentrenamiento o ajuste fino.
- No se proporcionan datos sobre sesgos, pero los sesgos en las demostraciones humanas (por ejemplo, posturas o patrones de agarre) pueden quedar reflejados en la política.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede requerir cambios sustanciales para adaptarse a un entorno de producción real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VibeCuisine/vds-smoke-20260909-resume-molmoact2-cont
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/molmoact2-cucumber-grab-place-peel-tilt-v2-v1-trim
- Blog de MolmoAct2: https://allenai.org/blog/molmoact2
- Guía de LeRobot para MolmoAct2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
