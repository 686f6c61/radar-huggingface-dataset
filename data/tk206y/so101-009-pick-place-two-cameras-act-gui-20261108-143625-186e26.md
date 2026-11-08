# tk206y/so101-009-pick-place-two-cameras-act-gui-20261108-143625-186e26

## Resumen

El modelo `tk206y/so101-009-pick-place-two-cameras-act-gui-20261108-143625-186e26` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot SO-101. Lo desarrolla el usuario tk206y como parte de una serie de experimentos numerados (007, 008, 009) orientados a evaluar el efecto de añadir una segunda cámara en la muñeca del gripper sobre la precisión de agarre. El modelo resuelve una tarea muy concreta: coger una pelota amarilla de una posición fija sobre una mesa gris y depositarla en otra posición fija sobre una mesa negra.

La relevancia de esta ficha es acotada y debe entenderse en clave experimental: no es un modelo de propósito general ni un asistente, sino un artefacto de investigación que documenta un protocolo de recogida de datos, entrenamiento y evaluación sobre hardware real. El autor es explícito al señalar que el modelo depende de la calibración, la pose de reposo, la disposición de cámaras y el entorno físico concretos, y que no ha sido validado en otras máquinas.

Técnicamente se trata de una red transformer pequeña (51.668.614 parámetros) que predice secuencias cortas de acciones (action chunks) a partir de dos flujos de imagen (cámara frontal y cámara de muñeca) y del estado de las articulaciones. Se entrenó durante 20.000 pasos con un lote de 8 sobre tan solo 5 episodios de demostración teleoperada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice bloques de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política consume dos cámaras (frontal y de muñeca), el estado articular del SO-101 y produce comandos de articulación para el robot. El entrenamiento se realizó con LeRobot sobre 5 episodios teleoperados, 20.000 pasos, lote de 8, y se conservaron checkpoints a 10.000 y 20.000 pasos para evaluar el efecto de la cantidad de entrenamiento.

No se documenta en la información disponible el número de tokens, la composición exacta del dataset más allá de los 5 episodios, ni si hubo ajuste por RLHF o DPO (no aplica en este paradigma). La innovación metodológica del experimento es la incorporación de una segunda cámara en el gripper para observar la posición relativa del objeto desde un punto de vista cercano, con la hipótesis de que mejora la precisión de agarre frente a la configuración monocular de los experimentos 007 y 008.

## Capacidades

- Control robótico de pick-and-place sobre una posición fija de objeto y destino.
- Política de imitación multimodal: fusiona imagen frontal e imagen de muñeca.
- Predicción de chunks de acción para ejecución suave y estable.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Reproducción de experimentos de robótica de imitación: sirve como referencia para comparar configuraciones de una versus dos cámaras en tareas de pick-and-place con SO-101.
- Validación de pipelines LeRobot de extremo a extremo: permite comprobar el flujo de recogida de datos, entrenamiento, publicación en el Hub y ejecución en hardware real.
- Estudio del efecto del número de pasos de entrenamiento: los checkpoints a 10.000 y 20.000 pasos permiten analizar la curva de éxito en una tarea fija.
- Base para experimentos de ablación de cámaras: el autor plantea extenderlo a tareas de múltiples posiciones añadiendo la cámara de muñeca, por lo que este modelo sirve de línea base.
- Docencia y divulgación de ACT: ejemplo reproducible y de bajo coste computacional para explicar action chunking en robótica.
- Pruebas de integración con el stack SO-101: verificación de calibración, poses de reposo y sincronización de cámaras antes de abordar tareas más complejas.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los de evaluación en hardware real reportados por el autor, sobre 10 ensayos por checkpoint:

| Modelo | Éxito / ensayos juzgados | Fallos |
|---|---|---|
| 10.000 pasos | 9/10 | 1 |
| 20.000 pasos | 10/10 | 0 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo. El autor advierte que el fallo del checkpoint de 10.000 pasos podría deberse a la colocación del objeto o a un desplazamiento de la mesa negra durante la evaluación, y que se trata de hipótesis no confirmadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en precisión completa el modelo ocupa aproximadamente 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha ejecutado en el entorno del autor sin especificar el hardware exacto.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: LeRobot (librería nativa), con integración en el stack de control del SO-101; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El autor menciona interrupciones por exceso de tiempo de procesamiento y anomalías de captura de cámara durante la evaluación, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tk206y/so101-009-pick-place-two-cameras-act | 51,7 M | no aplica | Pick-and-place fijo, 2 cámaras | Apache 2.0 | Hugging Face |
| AriRyo/so101-pickplace_policy | no disponible | no aplica | Pick-and-place con ACT | no disponible | Hugging Face |
| ahmedsohail2003/act-so101-pickplace-v2 | no disponible | no aplica | Pick-and-place con ACT | no disponible | Hugging Face |

La comparación cuantitativa con estas alternativas no es posible con la información disponible, ya que no se publican parámetros, configuraciones de cámara ni tasas de éxito comparables. Los tres modelos comparten el mismo paradigma (ACT sobre SO-101) y el mismo ecosistema (LeRobot).

## Limitaciones y advertencias

- Dependencia fuerte del entorno físico: calibración, pose de reposo, disposición de cámaras y posiciones de las mesas deben coincidir con las del entrenamiento.
- El autor declara explícitamente que no es un modelo de propósito general y que no ha sido validado en otras máquinas.
- Dataset de entrenamiento muy reducido (5 episodios), lo que limita la generalización incluso dentro de la misma tarea.
- No se ha aislado la contribución de la imagen al éxito: el autor señala que la tarea podría resolverse reproduciendo trayectorias similares sin usar realmente la información visual.
- Riesgo de fallo por desplazamiento de objetos o mesas entre entrenamiento y evaluación, como ocurrió en uno de los ensayos.
- No hay datos publicados sobre sesgos, alucinación (concepto no aplicable) ni comportamiento fuera de la distribución entrenada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación fuera del entorno del autor desaconseja su uso en producción sin reentrenamiento y verificación.
- El dataset original es privado y no se incluyen vídeos ni registros, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tk206y/so101-009-pick-place-two-cameras-act-gui-20261108-143625-186e26
- Modelo comparable AriRyo/so101-pickplace_policy: https://huggingface.co/AriRyo/so101-pickplace_policy
- Modelo comparable ahmedsohail2003/act-so101-pickplace-v2: https://huggingface.co/ahmedsohail2003/act-so101-pickplace-v2
- Documentación de LeRobot (referenciada en las model cards comparables): https://huggingface.co/docs/lerobot
