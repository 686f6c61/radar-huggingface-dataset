# Space0code/act_redblue_from_foil_v2

## Resumen

`act_redblue_from_foil_v2` es una política de control robótico basada en ACT (Action Chunking Transformer) entrenada para el brazo SO-101 en el contexto del Bilbao Physical AI Hackathon. Su tarea concreta es recoger una pelota objetivo rayada de un cuenco lleno de pelotas rojas y azules, desenterrando la pelota si está sepultada bajo otras. El modelo parte de los pesos de `molnrb/act_pick_ball_combined`, un checkpoint previo entrenado durante 30.000 pasos sobre 145 episodios de pelotas de papel de aluminio, y se afina con un conjunto de datos específico de 201 episodios (131.706 fotogramas) de pelotas rojas y azules mezcladas.

Se trata de un modelo de robótica de imitación (behavior cloning) con 51,7 millones de parámetros, entrenado con LeRobot 0.7.0. No es un modelo de lenguaje ni un modelo multimodal generalista: es un policy que mapea observaciones visuales y estado del robot a secuencias de acciones articulares. Su relevancia es acotada y práctica: demuestra el flujo de trabajo de ajuste fino de políticas ACT sobre brazos de bajo coste (SO-101) y sirve como referencia para quien replique tareas de pick-and-place con datos propios.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor. No hay datos publicados de benchmarks estándar, idiomas soportados ni licencia explícita, por lo que esos campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.7.0 |
| Modelo base | molnrb/act_pick_ball_combined (fine-tune) |
| Dataset de entrenamiento | molnrb/so101_pick_rb_mixed (201 episodios, 131.706 fotogramas) |
| Hardware de robot | SO-101 |
| Tamaño del repo | 0,6 GB |
| Pasos de entrenamiento | 20.000 (fine-tune) |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking Transformer), un transformer que predice fragmentos de acciones (action chunks) a partir de observaciones visuales y del estado del robot. Es un enfoque de behavior cloning: el modelo aprende a imitar las trayectorias demostradas por un operador humano en las grabaciones del dataset. No hay evidencia en la model card de uso de RLHF, DPO ni recompensas; el entrenamiento es supervisado sobre pares observación-acción.

El proceso de entrenamiento parte de los pesos de `molnrb/act_pick_ball_combined` (30.000 pasos sobre 145 episodios de pelotas de papel de aluminio) y se afina con `--policy.path`, reutilizando solo los pesos y recalculando las estadísticas de normalización con los datos nuevos. Se usó el dataset `molnrb/so101_pick_rb_mixed` (201 episodios, 131.706 fotogramas, 5% reservado para evaluación con `eval_split=0.05`, semilla 1000). Hiperparámetros: batch 32, learning rate 2e-5, precisión bf16, aumentación de brillo, contraste, nitidez y transformación afín (con tono y saturación desactivados), 20.000 pasos, entrenado en Modal con GPU L40S. La receta está en `scripts/modal_train.py` del repositorio del equipo.

Una observación relevante del autor: la pérdida de evaluación no predice el rendimiento del brazo para estas políticas, por lo que la selección de checkpoints debe hacerse ejecutando el modelo en el robot real. Los checkpoints intermedios están en `checkpoints/<step>/` y el más reciente en la raíz del repo.

## Capacidades

- Control robótico de pick-and-place: recoge una pelota objetivo rayada de un cuenco con pelotas rojas y azules.
- Manipulación con desenterramiento: si la pelota objetivo está sepultada, el modelo aprende a excavar para extraerla.
- Generación de acciones en chunks: predice secuencias de acciones articulares, no acciones individuales, lo que aporta suavidad y consistencia temporal.
- Operación a partir de observaciones visuales y estado del robot (política de imitación).
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes multi-step en el sentido de LLM; su "razonamiento" es puramente motor.
- Capacidades multilingües: no aplica.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual necesaria para la tarea.

## Casos de uso

- Replicación de la tarea del hackathon: usar el modelo como punto de partida para recoger objetos específicos de un contenedor con distractores similares, aprovechando el fine-tune sobre 201 episodios y la receta documentada en `scripts/modal_train.py`.
- Base para fine-tuning en nuevas tareas de pick-and-place: al partir de un policy ya entrenado en manipulación de pelotas, se reduce el número de episodios necesarios para adaptar el brazo SO-101 a objetos distintos (por ejemplo, piezas de formas o colores diferentes).
- Evaluación de pipelines de imitación con LeRobot: sirve como caso de referencia para medir el flujo completo (grabación, normalización, entrenamiento, despliegue) en un brazo de bajo coste.
- Investigación en selección de checkpoints: dado que el autor advierte que la eval loss no correlaciona con el rendimiento real, el modelo es útil para estudiar métricas de selección basadas en ejecución en el robot.
- Docencia y demos de robótica de imitación: por su tamaño reducido (0,6 GB) y sus 51,7 M de parámetros, es viable ejecutarlo en estaciones de trabajo modestas para demostraciones de behavior cloning.
- Pruebas de robustez ante distractores: el dataset mezcla pelotas rojas y azules, lo que permite evaluar cómo se comporta la política cuando el objeto objetivo comparte forma y tamaño con los distractores.
- Integración en entornos de simulación o gemelos digitales del SO-101 para validar trayectorias antes de desplegar en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de evaluación sobre episodios reservados:

| Paso | Eval loss (episodios reservados) |
|---|---|
| 5.000 | 0,3374 |
| 10.000 | 0,3421 |
| 15.000 | 0,3381 |

El autor indica explícitamente que esta métrica no predice el rendimiento del brazo y que la selección de checkpoint debe hacerse en el robot real. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en la tarea (success rate) publicadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y precisión bf16, la huella de pesos ronda los 100 MB, por lo que la VRAM necesaria es muy baja (del orden de cientos de MB incluyendo buffers y visión).
- GPU recomendadas: el entrenamiento se realizó en Modal con GPU L40S. Para inferencia, cualquier GPU consumer moderna es suficiente; no se documentan requisitos oficiales.
- ¿Cabe en GPU consumer? Sí, por tamaño (51,7 M de parámetros) es viable en GPUs consumer convencionales, aunque no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: LeRobot 0.7.0 (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_redblue_from_foil_v2 | 51.668.614 | no aplica | Pick de pelota rayada en cuenco con distractores (SO-101) | no disponible | Hugging Face, LeRobot |
| molnrb/act_pick_ball_combined (modelo base) | no disponible | no aplica | Pick de pelotas de papel de aluminio (SO-101) | no disponible | Hugging Face |
| Otras políticas ACT para SO-101 | no disponible | no aplica | Pick-and-place genérico | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (por ejemplo, Diffusion Policy, VQ-BeT u otras políticas de imitación) en términos de parámetros, contexto o rendimiento, ya que no se han publicado métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- Tarea muy específica: el modelo está entrenado para una única tarea (pelota rayada en un cuenco con pelotas rojas y azules) y un único brazo (SO-101); no generaliza a otros objetos, entornos o robots sin nuevo fine-tuning.
- La pérdida de evaluación no correlaciona con el rendimiento real del brazo; el autor recomienda seleccionar checkpoints ejecutándolos en hardware. Esto complica la validación automatizada en producción.
- Riesgo de sobreajuste al dataset de 201 episodios y a las condiciones de iluminación y disposición del entrenamiento; la aumentación aplicada excluye cambios de tono y saturación, lo que puede limitar la robustez ante variaciones cromáticas fuertes.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo relevante para producción.
- Idiomas no disponibles: no aplica como modelo de lenguaje, pero implica que no hay interfaz conversacional ni soporte multilingüe.
- No hay métricas de éxito publicadas (success rate, tiempo de tarea), por lo que no se puede estimar su fiabilidad en producción sin evaluación propia.
- El modelo base es un fine-tune de otro checkpoint; posibles sesgos heredados del dataset original de pelotas de papel de aluminio no están documentados.
- Tamaño de repo pequeño (0,6 GB) y 0 descargas / 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Space0code/act_redblue_from_foil_v2
- Modelo base: https://huggingface.co/molnrb/act_pick_ball_combined
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- LeRobot (librería): https://github.com/huggingface/lerobot
- Repositorio del equipo con la receta (`scripts/modal_train.py`): no disponible como URL en la información proporcionada
- Paper de ACT (Action Chunking Transformer): no disponible en la información proporcionada
