# WoojongKim/smolvla_policy_omy_gelsight_snack_all_nogel

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico con requisitos computacionales reducidos y capacidad de despliegue en hardware de consumo. La variante aquí documentada, `WoojongKim/smolvla_policy_omy_gelsight_snack_all_nogel`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre el dataset `WoojongKim/omy_gelsight_snack_all_nogel`, orientado a una tarea concreta de manipulación con sensor táctil GelSight.

El modelo cuenta con 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,9 GB. Está pensado para inferencia en tiempo real sobre brazos robóticos de bajo coste, como el SO-100/SO-101 del ecosistema LeRobot, y se integra mediante la librería `lerobot`.

Su relevancia radica en que demuestra que políticas VLA competitivas pueden entrenarse y ejecutarse sin clústeres de GPU de gama alta, lo que facilita la experimentación en robótica de manipulación desde laboratorios pequeños hasta prototipos de producción. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Dataset de entrenamiento | WoojongKim/omy_gelsight_snack_all_nogel |
| Pipeline | robotics |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que produce comandos motores de forma continua. El diseño prioriza la eficiencia computacional para permitir inferencia en hardware de consumo, manteniendo un rendimiento competitivo frente a políticas VLA de mayor tamaño. El paper de referencia (arXiv:2506.01844) describe el modelo base; la información disponible no detalla la composición exacta de sus componentes internos ni el número de tokens de entrenamiento.

La variante documentada es un fine-tuning supervisado del checkpoint `lerobot/smolvla_base` sobre el dataset `omy_gelsight_snack_all_nogel`, que combina observaciones visuales con lecturas de un sensor táctil GelSight para una tarea de manipulación (aparentemente relacionada con snacks). No se dispone de información sobre el número de episodios, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; en robótica de imitación lo habitual es el aprendizaje por imitación supervisado, pero este dato no se confirma en la model card.

## Capacidades

- Control robótico visuomotor: genera acciones de efector final a partir de observaciones visuales y, en este caso, entradas táctiles de un sensor GelSight.
- Integración con el ecosistema LeRobot: entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`.
- Aprendizaje por imitación: la política se entrena a partir de demostraciones grabadas en el dataset asociado.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros y 0,9 GB de pesos permite ejecución en GPU de gama media.
- Compatibilidad con robots de bajo coste: la model card cita el robot `so100_follower` como plataforma de evaluación.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes conversacionales ni procesamiento multilingüe, ya que el modelo no es un LLM de propósito general.

## Casos de uso

- Manipulación con realimentación táctil: el modelo consume lecturas de un sensor GelSight junto con imágenes para ejecutar agarres y colocaciones donde la información visual es insuficiente (objetos deformables, superficies reflectantes o tareas de precisión).
- Investigación en políticas VLA de bajo coste: sirve como punto de partida para comparar fine-tunings sobre el mismo checkpoint base, al ser un modelo pequeño y rápido de reentrenar.
- Prototipado de células robotizadas: permite validar una tarea de pick-and-place con un SO-100 antes de invertir en hardware industrial, gracias a su licencia Apache 2.0 y a su reducido tamaño.
- Automatización de tareas de clasificación y empaquetado de snacks: el dataset de entrenamiento sugiere un escenario de manipulación de alimentos o pequeños objetos, replicable en líneas de envasado ligeras.
- Evaluación de sensores táctiles: al estar entrenado con GelSight, permite estudiar el impacto de la modalidad táctil frente a políticas puramente visuales sobre la misma tarea.
- Docencia y formación en robótica: su integración con LeRobot y su bajo requisito de hardware lo hacen adecuado para laboratorios universitarios con presupuesto limitado.
- Despliegue en el borde (edge): con 450 M de parámetros puede ejecutarse en una estación de trabajo con GPU consumer junto al controlador del robot, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 450 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el estado de inferencia y las activaciones.
- GPU recomendadas: no especificadas en la model card. Por tamaño, una RTX 4090, RTX 3090 o incluso GPUs de gama media (RTX 4060 Ti, L4) deberían ser suficientes para inferencia; el paper del modelo base afirma despliegue en hardware de consumo.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-8 GB de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: la vía documentada es la librería `lerobot` (`lerobot-record` con `--policy.path`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WoojongKim/smolvla_policy_omy_gelsight_snack_all_nogel | 450 M | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Fine-tuning táctil de SmolVLA sobre tarea concreta |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | Apache 2.0 (segun repositorio base) | Hugging Face (LeRobot) | Checkpoint base sin fine-tuning específico de tarea |
| OpenVLA | no disponible en la informacion | no disponible | no disponible | Hugging Face | Política VLA de referencia, de mayor tamaño; sin datos comparativos en esta ficha |
| π0 (pi-zero) | no disponible en la informacion | no disponible | no disponible | no disponible | Política VLA generalista; sin datos comparativos en esta ficha |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa fiable entre estos modelos.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está fine-tuneado para una tarea y un dataset concretos; su rendimiento fuera de ese dominio (otros objetos, otras cámaras, otro robot) probablemente se degrade sin reentrenamiento.
- Dependencia del sensor GelSight: la política espera entradas táctiles específicas; sin ese sensor o con otro distinto, las observaciones no coincidirán con las de entrenamiento.
- Sin datos de evaluación publicados: no hay benchmarks ni métricas de éxito reportadas, por lo que no puede estimarse su fiabilidad en producción.
- Riesgo de sobreajuste a las condiciones de recogida de datos (iluminación, posición de cámara, fondo), típico del aprendizaje por imitación.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución del dataset de demostraciones y no están analizados en la model card.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas o no seguras ante observaciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Fechas de creación y actualización del repositorio (2026-11-13) posteriores a la fecha habitual de consulta; verificar su vigencia antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omy_gelsight_snack_all_nogel
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omy_gelsight_snack_all_nogel
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
