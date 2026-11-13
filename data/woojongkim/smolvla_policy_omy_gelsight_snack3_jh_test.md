# WoojongKim/smolvla_policy_omy_gelsight_snack3_jh_test

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico con requisitos computacionales reducidos y capacidad de despliegue en hardware de consumo. Esta ficha concreta corresponde a un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario WoojongKim sobre el dataset `omy_gelsight_snack3_jh_test`, orientado a una tarea específica de manipulación con sensor táctil GelSight.

El modelo combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único transformer de aproximadamente 450 millones de parámetros. Su relevancia radica en que demuestra que es posible ejecutar políticas VLA en GPUs de gama consumer, algo poco habitual en el espacio de modelos VLA de mayor tamaño.

Esta publicación es un artefacto de investigación: no cuenta con descargas ni validación pública, y su model card es esencialmente la plantilla estándar de LeRobot sin métricas de rendimiento publicadas. Debe tratarse como un checkpoint experimental de fine-tuning, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, implementada en LeRobot (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que integra un codificador visual, un codificador de lenguaje y un decodificador de acciones en una arquitectura transformer unificada. El modelo base `lerobot/smolvla_base` fue presentado en el paper arXiv:2506.01844, que describe un VLA compacto con rendimiento competitivo a coste computacional reducido y despliegue viable en hardware de consumo. La arquitectura concreta (número de capas, dimensión de embeddings, mecanismo de atención) no se detalla en la información disponible.

Este checkpoint es un fine-tuning del modelo base sobre el dataset `WoojongKim/omy_gelsight_snack3_jh_test`, un conjunto de demostraciones de manipulación que incorpora señal de sensor táctil GelSight. No se dispone de información sobre el número de episodios, tokens de entrenamiento, composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. El entrenamiento se realizó con la herramienta `lerobot-train` del ecosistema LeRobot.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones de lenguaje natural (política de imitación).
- Percepción visual para localización de objetos y guiado de manipulación.
- Integración de señal táctil procedente de sensores GelSight en el bucle de control (según el nombre del dataset de entrenamiento).
- Ejecución de políticas en robots tipo SO-100 follower mediante `lerobot-record`.
- Fine-tuning adicional sobre nuevos datasets con el pipeline de LeRobot.
- No se documenta soporte de tool calling, razonamiento multi-paso, capacidades multilingües explícitas ni modos de pensamiento.

## Casos de uso

- Manipulación robótica de precisión con retroalimentación táctil: el modelo se entrenó sobre datos con sensor GelSight, por lo que es adecuado para tareas donde la fuerza de agarre y el contacto importan (por ejemplo, recoger objetos delicados).
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning sobre nuevos datasets de demostraciones con el pipeline de LeRobot.
- Despliegue en laboratorios con hardware limitado: sus 450 M de parámetros permiten ejecutar inferencia en GPUs de consumo, lo que facilita prototipado sin clústeres dedicados.
- Evaluación comparativa de políticas VLA: útil como baseline compacto frente a modelos VLA de mayor tamaño en estudios de coste-rendimiento.
- Automatización de tareas de pick-and-place en entornos controlados: la política puede ejecutar secuencias de agarre y colocación aprendidas de demostraciones.
- Reproducción de experimentos académicos: al estar publicado en el Hub con licencia Apache 2.0 y formato safetensors, permite replicar el entrenamiento y la evaluación con `lerobot-record`.
- Docencia en robótica: ejemplo práctico de pipeline completo (dataset, entrenamiento, evaluación) con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de tarea, tasas de acierto ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,8 GB solo para pesos, más memoria para activaciones y codificadores visuales; en la práctica se recomienda al menos 4-6 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,9 GB para pesos, con margen adicional para el pipeline de inferencia.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. El modelo está diseñado explícitamente para hardware de consumo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WoojongKim/smolvla_policy_omy_gelsight_snack3_jh_test | 450 M | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | no disponible (ver paper arXiv:2506.01844) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas. La comparación relevante es cualitativa: este checkpoint es un fine-tuning específico de tarea, mientras que `smolvla_base` es el modelo generalista del que deriva.

## Limitaciones y advertencias

- Modelo de investigación sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que la política funcione fuera del entorno de entrenamiento.
- Especialización estrecha: entrenado sobre un único dataset (`omy_gelsight_snack3_jh_test`), por lo que probablemente no generaliza a otras tareas, objetos o configuraciones de robot.
- Dependencia de hardware específico: el dataset sugiere el uso de sensores GelSight; sin ese sensor, el rendimiento puede degradarse de forma significativa.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con demostraciones humanas puede heredar sesgos de los demostradores.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante observaciones novedosas, con riesgo físico en entornos reales.
- Sin datos de idiomas ni de contexto: no se puede garantizar el comportamiento ante instrucciones en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y validación hace desaconsejable su uso en producción sin evaluación previa.
- Model card genérica: no incluye detalles de entrenamiento, hiperparámetros ni curvas de aprendizaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omy_gelsight_snack3_jh_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omy_gelsight_snack3_jh_test
