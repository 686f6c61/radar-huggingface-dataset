# SteveNguyen/sugar_cup_chunkrel_pi05_step4000

## Resumen

SteveNguyen/sugar_cup_chunkrel_pi05_step4000 es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por SteveNguyen mediante un fine-tuning del modelo base `lerobot/pi05_base` de Physical Intelligence. Está entrenado con la librería LeRobot de Hugging Face y tiene como objetivo controlar un robot para la tarea específica de "pick up the sugar cup" (recoger la taza de azúcar). El modelo forma parte de la familia π₀.₅ (Pi05), que evoluciona π₀ para generalizar a entornos y situaciones nuevas.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4.1 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 9.4 GB. Está diseñado para consumir observaciones de una cámara (imágenes de 360x480 píxeles) y un estado de 2 dimensiones, produciendo acciones de 8 dimensiones. La licencia es Apache 2.0, lo que permite uso comercial. El modelo fue entrenado durante 4000 pasos con un dataset de 150 episodios y 23.046 frames a 50 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es una implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. Pi05 es un modelo Vision-Language-Action diseñado para generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación utilizada proviene del repositorio OpenPI de código abierto.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.1) sobre el dataset `SteveNguyen/sugar_cup_graspproj_chunkrel`, que contiene 150 episodios y 23.046 frames grabados a 50 FPS. La tarea es "pick up the sugar cup". La configuración de entrenamiento incluye 4000 pasos, batch size de 32, optimizador AdamW, learning rate de 2.5e-5 y semilla 1000. Las entradas del modelo son imágenes de la cámara `cam0` (3, 360, 480) y un estado de 2 dimensiones; la salida es una acción de 8 dimensiones. No se especifica la arquitectura interna exacta (número de capas, dimensiones ocultas, etc.) en la información disponible.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 8 dimensiones para controlar un robot, basándose en observaciones visuales y de estado.
- Visión-lenguaje-acción: integra percepción visual y razonamiento de lenguaje para ejecutar tareas de manipulación, como recoger una taza de azúcar.
- Generalización a nuevos entornos: según la descripción del modelo base pi05, está diseñado para generalizar a situaciones no vistas durante el entrenamiento.
- Fine-tuning: gracias a la integración con LeRobot, el modelo puede ser ajustado para otras tareas o robots mediante el entrenamiento con nuevos datasets.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: no disponible (no es un modelo de lenguaje para agentes).
- Capacidades multilingües: no disponibles.
- Capacidades especiales: visión y acción robótica, sin soporte de audio ni modo de pensamiento explícito.

## Casos de uso

- Recogida de objetos en entornos domésticos: el modelo puede controlar un robot para recoger objetos pequeños como tazas de azúcar, gracias a su entrenamiento con imágenes de cámara y estado del robot.
- Automatización de laboratorios: en entornos de investigación, el modelo puede ejecutar tareas repetitivas de agarre y colocación de muestras o recipientes.
- Robótica de almacén: el modelo puede adaptarse a tareas de picking de productos en almacenes mediante fine-tuning con datasets específicos.
- Asistencia en cocina: el modelo puede ser utilizado para tareas de manipulación de utensilios o ingredientes, como recoger una taza de azúcar de una encimera.
- Investigación en robótica: sirve como punto de partida para experimentos de aprendizaje por imitación, permitiendo a investigadores fine-tunear el modelo para nuevas tareas con LeRobot.
- Integración en pipelines de LeRobot: el modelo puede ser desplegado en robots compatibles con LeRobot (tipo `grabette`) usando el comando `lerobot-rollout` para ejecutar la política en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se han proporcionado resultados de evaluación para esta política. No se dispone de datos de rendimiento en tareas como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se han publicado datos específicos).
- GPU recomendadas: no disponible (no se han publicado recomendaciones oficiales).
- Compatibilidad con GPU de consumo: no disponible (no se especifica si cabe en GPUs de consumo).
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot, que utiliza PyTorch. Se puede desplegar con el comando `lerobot-rollout` para inferencia en robots, y `lerobot-train` para entrenamiento.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos similares en la información proporcionada. El modelo es un fine-tuning específico de `lerobot/pi05_base`, pero no se proporcionan datos de rendimiento ni características detalladas de otros modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: al ser un modelo de acción robótica, el riesgo de "alucinación" se manifiesta como acciones incorrectas o movimientos no deseados, especialmente en entornos no vistos durante el entrenamiento.
- Limitaciones de contexto o idioma: el modelo no es un modelo de lenguaje y no soporta tareas de conversación o generación de texto.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `lerobot/pi05_base` y del dataset utilizado.
- Importante para producción: el modelo está entrenado para una tarea específica ("pick up the sugar cup") con un robot concreto (`grabette`) y una cámara (`cam0`). No se han proporcionado resultados de evaluación, por lo que su rendimiento real en producción es desconocido.
- Dependencia de hardware: el modelo requiere una configuración de robot y cámaras específica que coincida con las observaciones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/sugar_cup_chunkrel_pi05_step4000
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/sugar_cup_graspproj_chunkrel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
