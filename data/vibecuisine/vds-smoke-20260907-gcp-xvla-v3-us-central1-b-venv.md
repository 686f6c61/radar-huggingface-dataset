# VibeCuisine/vds-smoke-20260907-gcp-xvla-v3-us-central1-b-venv

## Resumen

El modelo `VibeCuisine/vds-smoke-20260907-gcp-xvla-v3-us-central1-b-venv` es una política robótica de aprendizaje por imitación basada en el framework X-VLA (Vision-Language-Action), desarrollada por el usuario VibeCuisine. X-VLA es una arquitectura que utiliza soft-prompting y flow-matching para tratar cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto pequeño de embeddings aprendibles, lo que permite que un único modelo base se adapte a distintas morfologías, sensores y espacios de acción.

Este modelo concreto es un fine-tuning del modelo base `lerobot/xvla-base` y ha sido entrenado con el dataset `VibeCuisine/vibepi3-grab-poseexpert-r3-curated` para ejecutar la tarea específica de agarrar un pepino en el punto de un tercio en un robot tipo `vibeboard_follower_tilt` equipado con tres cámaras. El modelo tiene un total de 879.738.545 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 1.8 GB. Al ser un modelo de políticas robóticas, no es un modelo de lenguaje general y no ofrece capacidades de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA (Vision-Language-Action con soft-prompting y flow-matching) |
| Parametros totales | 879.738.545 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de políticas robóticas, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura X-VLA combina un modelo de visión-lenguaje-acción con un mecanismo de soft-prompting: cada robot o configuración de hardware se representa mediante un conjunto de embeddings aprendibles que condicionan la política. El modelo utiliza flow-matching para generar acciones de forma probabilística, lo que permite producir trayectorias suaves y multimodales. El modelo base `lerobot/xvla-base` fue preentrenado para reconciliar diversas morfologías de robots y sensores, y este fine-tuning lo adapta a una configuración específica.

El entrenamiento se realizó con el dataset `VibeCuisine/vibepi3-grab-poseexpert-r3-curated`, compuesto por 64 episodios y 3478 frames a 20 FPS, todos correspondientes a la tarea "Grab the cucumber at the one-third point". La configuración de entrenamiento incluye 10 pasos, batch size de 1, optimizador `xvla-adamw`, learning rate de 0.0001 y seed de 1000, utilizando la versión 0.6.0 de LeRobot. El modelo consume observaciones de estado de 7 dimensiones y tres imágenes de 480x640 (cámaras `corner`, `top` y `wrist`) y produce acciones de 7 dimensiones. No se ha aplicado RLHF ni DPO; el entrenamiento es puramente de aprendizaje por imitación.

## Capacidades

- Control robótico: genera acciones de 7 dimensiones a partir de observaciones de estado y tres cámaras simultáneas.
- Aprendizaje por imitación: entrenado para ejecutar una tarea de agarre específica en un robot `vibeboard_follower_tilt`.
- Visión: procesa imágenes RGB de 480x640 píxeles desde tres perspectivas (`corner`, `top`, `wrist`).
- Soft-prompting: permite adaptar el modelo a diferentes robots mediante embeddings aprendibles, aunque este fine-tuning está especializado en una configuración concreta.
- Flow-matching: genera acciones de forma probabilística, lo que facilita la ejecución de movimientos multimodales.
- Integración con LeRobot: compatible con las herramientas de entrenamiento, evaluación y despliegue del framework LeRobot.
- No soporta tool calling, generación de texto ni razonamiento simbólico: es exclusivamente un modelo de políticas robóticas.

## Casos de uso

- Manipulación robótica en entornos controlados: el modelo puede ejecutar la tarea de agarre de un pepino en el punto de un tercio, siendo adecuado para pruebas de laboratorio o entornos industriales con configuraciones fijas de cámara y robot.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un fine-tuning con pocos datos (64 episodios) se comporta en X-VLA, y como punto de partida para experimentos de transferencia a tareas similares.
- Benchmarking de políticas robóticas: puede utilizarse para comparar el rendimiento de diferentes configuraciones de X-VLA en el framework LeRobot, especialmente en tareas de agarre con múltiples vistas.
- Prototipado rápido de tareas robóticas: gracias al soft-prompting, el modelo puede adaptarse a nuevas tareas con pocos episodios de demostración, lo que acelera el desarrollo de prototipos en investigación.
- Despliegue en robots de bajo coste: al tratarse de un modelo de ~880M parámetros, es viable ejecutarlo en hardware de consumo para pruebas de campo en robótica educativa o de investigación.
- Integración en pipelines de LeRobot: el modelo se puede cargar directamente mediante `lerobot-rollout` para ejecutar la política en un robot real, permitiendo evaluar la tarea en bucle abierto o cerrado.
- Generación de datos para simuladores: las acciones generadas por el modelo pueden utilizarse para crear trayectorias sintéticas en simuladores robóticos, ampliando datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no es posible presentar una tabla comparativa de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el repositorio pesa 1.8 GB y el modelo tiene 879.738.545 parámetros, una estimación razonable para inferencia en FP16 sería de aproximadamente 2 GB de VRAM, y en FP32 alrededor de 3.5 GB, aunque no hay datos confirmados.
- GPU recomendadas: no disponibles oficialmente. Por tamaño, el modelo podría ejecutarse en GPUs consumer como RTX 3060 12GB, RTX 4060, o superiores, siempre que el framework de inferencia soporte la arquitectura X-VLA.
- Ejecución en GPU consumer: probablemente sí, dado el tamaño del modelo, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot y su CLI (`lerobot-rollout`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| VibeCuisine/vds-smoke-20260907-gcp-xvla-v3-us-central1-b-venv | 879.738.545 | Fine-tuning de X-VLA para tarea de agarre | Apache 2.0 | HuggingFace |
| lerobot/xvla-base | no disponible (modelo base) | Modelo base X-VLA preentrenado | Apache 2.0 | HuggingFace |
| Otros fine-tunings de X-VLA | no disponible | Políticas robóticas específicas | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría. La comparativa se limita al modelo base del que deriva este fine-tuning.

## Limitaciones y advertencias

- Sobreajuste probable: el modelo se entrenó con solo 64 episodios y 10 pasos de entrenamiento, lo que sugiere una alta probabilidad de sobreajuste al dataset específico y poca generalización a variaciones de la tarea.
- Sin evaluación publicada: no se han proporcionado resultados de evaluación en robot real, por lo que desconocemos su tasa de éxito real.
- Tarea extremadamente específica: el modelo solo está entrenado para agarrar un pepino en el punto de un tercio, y su comportamiento fuera de esa tarea no ha sido validado.
- Dependencia de la configuración de hardware: el modelo espera exactamente tres cámaras (`corner`, `top`, `wrist`) con resoluciones de 480x640 y un espacio de estado de 7 dimensiones; cualquier cambio en la configuración puede invalidar su funcionamiento.
- No es un modelo de lenguaje: no genera texto ni razona simbólicamente, por lo que no es utilizable para tareas de NLP o chatbots.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el rendimiento y la seguridad del sistema robótico recae en el usuario final.
- Riesgo de alucinación: en el contexto robótico, esto se traduce en acciones incorrectas o inseguras que podrían dañar el robot o su entorno si no se implementan salvaguardas adecuadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VibeCuisine/vds-smoke-20260907-gcp-xvla-v3-us-central1-b-venv
- Paper de X-VLA: https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/vibepi3-grab-poseexpert-r3-curated
- Modelo base: https://huggingface.co/lerobot/xvla-base
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
