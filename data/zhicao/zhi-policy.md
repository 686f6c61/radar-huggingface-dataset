# zhicao/Zhi-Policy

## Resumen

Zhi-Policy no es un modelo de lenguaje ni un modelo fundacional publicado: es un stack de despliegue en bucle cerrado para ejecutar políticas robóticas entrenadas con LeRobot sobre un brazo seguidor yambox (lado izquierdo) y una mano Sharpa (lado izquierdo). El autor, zhicao, lo describe como la capa de *rollout* que consume las interfaces de su stack de teleoperación y grabación (`../Zhi`): servidor de brazo, driver UDP de la mano y roster de cámaras. El primer checkpoint soportado es `lzy001Yuki/SteeringPolicyReal/left_pipette_correct/020000`, una política pi0.5 de tipo visión-lenguaje-acción.

El repositorio resuelve un problema muy concreto de ingeniería: pasar de un checkpoint entrenado a una ejecución real, segura y reproducible sobre hardware físico, con límites de velocidad, recorte de objetivos al rango de entrenamiento, parada ante datos obsoletos o excepciones de inferencia y registro completo de cada acción enviada. Incluye utilidades de comprobación de cámaras, evaluación offline contra tomas de teleoperación, un modo `--dry-run` sin envío de comandos y un *tile* de control dentro del panel de teleoperación.

Los pesos asociados ocupan 9,4 GB en `model.safetensors` y se sirven desde NVMe. El bucle consume dos cámaras RGB (D435 en la cabeza a 480x640 y ZED-M izquierda a 720x1280), un vector de estado de 28 dimensiones (6 del brazo más 22 de la mano) y emite 28 objetivos absolutos en radianes, en chunks de 50 acciones, con el brazo a 30 Hz y la mano a 120 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (LeRobot, commit `71a11efe77f55e61f3ab2ce45b40da8cf626afa9`): política visión-lenguaje-acción con flow matching y chunking de acciones |
| Parámetros totales | no disponible (checkpoint de 9,4 GB en `model.safetensors`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de acción (chunk) de 50 pasos a 30 Hz, equivalente a ~1,67 s |
| Tipos de cuantización | no disponible (no se documenta cuantización; se ejecuta el checkpoint tal cual) |
| Idiomas soportados | no disponible; el prompt de tarea está en inglés y debe coincidir con el usado en entrenamiento |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) con pre/post-procesadores propios del checkpoint; normalización QUANTILES incluida |
| Espacio de observación | `observation.images.head` 480x640 RGB (D435), `observation.images.wrist_left` 720x1280 RGB (ZED-M ojo izquierdo), `observation.state[28]` en radianes: `[arm_left q(6), hand_left(22)]` |
| Espacio de acción | `action[28]` objetivos absolutos en radianes, mismo layout que el estado; se alimenta en radianes crudos |
| Frecuencia de control | brazo a 30 Hz, mano a 120 Hz; replanificación cada 10 ticks |
| Hardware de robot | brazo seguidor yambox izquierdo (servidor `:11334`), mano Sharpa izquierda (driver `:59201`, tee `:59250`), e-stop manual |
| Entorno de ejecución | Python 3.12 con `uv` en `/data/zhicao/policy_env`; `lerobot` fijado por commit, más `portal`, `h5py` y `opencv` |

## Arquitectura y entrenamiento

El checkpoint es una política pi0.5 de LeRobot, es decir, un modelo visión-lenguaje-acción que mapea observaciones multimodales (dos vistas RGB más el estado propioceptivo de 28 dimensiones) y un prompt de lenguaje a una secuencia de acciones. La generación de acciones emplea flow matching, lo que explica la varianza de muestreo documentada: la misma observación produce chunks que difieren en torno a 9 grados en el brazo y 0,2 rad en la mano, aunque la media sea precisa. La inferencia devuelve chunks de 50 acciones a 30 Hz y el bucle reutiliza el chunk hasta la siguiente replanificación (`--replan 10` por defecto).

Sobre los datos de entrenamiento, la documentación solo aporta el conjunto de referencia cuyas estadísticas coinciden con el normalizador del checkpoint: `../Zhi/episodes/12`, con 30 tomas y 23.400 frames con contacto efectivo (*engaged*). No se detallan número total de tokens, composición del dataset, ni si hubo RLHF o DPO; en el contexto de una política robótica, el equivalente sería el ajuste por preferencias o recompensa, y no se menciona. Sí se indica que el checkpoint actual no incorpora entrenamiento con RTC (`policy.rtc_training_max_delay` = 0) frente a un retardo medido del sistema de aproximadamente 18 ticks, y que la corrección real del salto entre chunks pasaría por reentrenar con RTC o ampliar datos y pasos.

La capa de despliegue añade innovaciones de ingeniería más que de modelado: un ruido inicial fijo para todas las inferencias y un cross-fade de 8 ticks al entrar en cada chunk nuevo (con `--random-noise` y `--blend 0` para recuperar el comportamiento original), límite de desplazamiento por tick (`--max-step-deg`, por defecto 4 grados), recorte de objetivos al rango de acciones de entrenamiento más 0,10 rad, y parada con retención de pose ante datos de cámara, brazo o mano obsoletos, excepciones de inferencia o agotamiento del chunk.

## Capacidades

- Ejecución de políticas robóticas de manipulación en bucle cerrado: observación, inferencia de chunk y envío de comandos a 30 Hz para el brazo y 120 Hz para la mano.
- Control conjunto de brazo de 6 grados de libertad y mano de 22 articulaciones mediante un vector de acción absoluto de 28 dimensiones.
- Condicionamiento por lenguaje: el prompt de tarea (`task_prompt.txt` o `--task`) modula la política y debe coincidir con el del entrenamiento; se documenta que la frase larga de la tarea 1 obtiene mejor puntuación que la etiqueta corta.
- Evaluación offline sin robot: `offline_eval.py` compara el chunk predicho con la acción grabada de una toma de teleoperación.
- Validación en seco: `--dry-run` ejecuta el bucle completo sin enviar comandos al hardware.
- Comprobación de cadenas de cámara: `cams.py` captura el último frame a tasa completa y `check_wrist_cams.sh` verifica que la ZED sea UVC real y no un enlace USB3 degradado.
- Registro y auditoría: `rollout.h5` guarda cada acción enviada, cada chunk inferido con su latencia, y vídeos `*_policy_input.mp4` con los frames exactos que vio el modelo.
- Control interactivo desde panel: *tile* Block con Start, Pause (SIGUSR1, sin envío y con el seguidor retenido), reanudación (SIGUSR2, desde observación fresca) y Stop (SIGINT más guardado).
- Arranque rápido en modo evaluación mínima: `eval_stack_cube.py` construye el modelo directamente en GPU en unos 4 s, frente a los ~2 minutos del camino estándar, con puesta a punto total en torno a 11 s.
- Multilingüismo, tool calling, agentes y visión general: no disponibles (no aplica a esta política robótica).

## Casos de uso

- Manipulación de precisión con pipeta: el checkpoint por defecto (`left_pipette_correct`) está pensado para tareas de pipeteo con la mano Sharpa; se lanzaría con `./run.sh --max-seconds 120` tras alinear la pose inicial con la de las demostraciones y colocar la escena como en entrenamiento.
- Apilado de cubos: `eval_stack_cube.py --task "stack the cubes"` ejecuta el bucle mínimo asumiendo los servicios de brazo y mano ya levantados, útil para pruebas repetidas de una tarea de pick-and-place sin panel ni ficheros de estado.
- Evaluación offline de checkpoints antes de tocar hardware: `./run.sh eval ../Zhi/episodes/12/episode_000030` compara la predicción del chunk con la acción teleoperada y permite descartar un checkpoint sin riesgo físico.
- Comparación de checkpoints y prompts: el repositorio incluye mediciones de desviación por prompt (2,3 grados frente a 3,0) y utilidades `var` y `cons` para cuantificar dispersión entre chunks y saltos en los cambios, lo que sirve para seleccionar configuración antes de un despliegue largo.
- Integración en una estación de teleoperación existente: el *tile* Block del panel permite que un operador arranque, pause y detenga la política sin salir de la interfaz, con registro en `~/teleop_logs/block_policy.log`.
- Auditoría de latencia y estabilidad en producción: `rollout.h5` con chunks, latencias y frames de entrada permite reconstruir por qué el robot se detuvo o se desvió, algo necesario para depurar políticas VLA en laboratorio.
- Validación en seco dentro de un pipeline de QA: `./run.sh --dry-run --max-seconds 20` o `eval_stack_cube.py --dry-run --max-seconds 15` verifican cámaras, estado, prompt y modelo sin enviar comandos, apto como paso previo automatizable antes de una sesión real.
- Investigación sobre chunking y flow matching: la documentación del salto entre chunks (~19 grados en brazo a ~2 Hz) y del retardo de ~18 ticks ofrece un caso concreto para estudiar cross-fading, ruido inicial fijo y entrenamiento con RTC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay MMLU, HumanEval ni GSM8K, y no aplican a una política robótica. Las únicas cifras disponibles son métricas internas de error y estabilidad del bucle de control:

| Métrica | Valor | Contexto |
|---|---|---|
| Error de seguimiento con el prompt largo de la tarea 1 | 2,3 grados | Medición frente a la acción teleoperada |
| Error de seguimiento con el prompt `left_pipette_correct` | 3,0 grados | Misma medición, prompt más corto |
| Salto en el cambio de chunk, mano | ~0,2 rad | Ocurre a ~2 Hz |
| Salto en el cambio de chunk, brazo | ~19 grados | Ocurre a ~2 Hz |
| Dispersión entre chunks para la misma observación | ~9 grados / 0,2 rad | Varianza del muestreo de flow matching |
| Retardo medido del sistema | ~18 ticks (~0,6 s a 30 Hz) | Referencia para dimensionar RTC |
| Datos de referencia del normalizador | 30 tomas, 23.400 frames con contacto | `../Zhi/episodes/12` |
| Tiempo de construcción del modelo en GPU | ~4 s (frente a ~2 min en el camino estándar) | `eval_stack_cube.py` |
| Puesta a punto completa (cámaras + modelo) | ~11 s | El primer frame de la D435 es el cuello de botella |

## Requisitos de hardware

- GPU: necesaria para construir el modelo (`torch.device("cuda")` en `eval_stack_cube.py`). No se especifica modelo de GPU ni VRAM. Como referencia, el checkpoint pesa 9,4 GB, de modo que solo los pesos en bf16 exigirían del orden de 10-12 GB de VRAM (estimación no confirmada en la documentación).
- Cabe en GPU de consumo: no disponible. No se documenta ninguna ejecución en RTX 4090 u otras tarjetas consumer.
- Almacenamiento: pesos en NVMe (`/data/zhicao/policy_ckpt`), con aviso explícito de que `/home` está lleno. La descarga mediante `hf download` se bloquea en la ruta xet, y se sustituye por `pdl.sh`, un curl por rangos en 8 vías.
- Periféricos obligatorios: cámara D435 en el yambox (480x640), ZED-M ojo izquierdo por USB3 real (IDs `2b03:f682` a 5000 Mbps; un `f681` solo HID indica enlace degradado y el runner rechaza la ejecución), brazo yambox izquierdo en `:11334` y driver de mano izquierda en `:59201` con tee en `:59250`.
- Red local: UDP `:59250` libre para las articulaciones medidas de la mano; sin grabador activo y con el *tile* Retarget detenido para evitar dos emisores de objetivos.
- Despliegue: scripts propios (`run.sh`, `eval_stack_cube.py`) sobre el entorno `policy_env`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles como cifra de inferencia. El bucle envía como máximo a 30 Hz, con replanificación cada 10 ticks y chunk de 50 acciones; el retardo medido del sistema es de ~18 ticks.

## Comparativa con modelos similares

No hay datos de benchmarks ni de rendimiento que permitan comparar esta política con alternativas de la misma categoría. La tabla compara el alcance de los artefactos implicados, no su calidad:

| Elemento | Naturaleza | Licencia | Disponibilidad | Requisitos |
|---|---|---|---|---|
| Zhi-Policy (este repositorio) | Stack de despliegue y evaluación en bucle cerrado | no disponible | HuggingFace, 0 descargas, 0 likes | Brazo yambox izquierdo, mano Sharpa izquierda, D435, ZED-M, GPU |
| `lzy001Yuki/SteeringPolicyReal` (checkpoint `left_pipette_correct/020000`) | Pesos de política pi0.5 | no disponible | Referenciado por el autor, no verificado en la búsqueda | Entorno LeRobot del commit indicado |
| Política pi0.5 genérica de LeRobot | Arquitectura VLA base | no disponible | Repositorio LeRobot | Depende del checkpoint y del robot |
| Otras políticas VLA (por ejemplo, familias tipo OpenVLA) | Modelos visión-lenguaje-acción | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo lado izquierdo: el estado y la acción están fijados a `[arm_left(6), hand_left(22)]`. Los checkpoints de mano derecha o bimanuales requieren extender `SIDE` y el layout en `run_policy.py`.
- Un checkpoint está atado a una tarea y a una escena: el prompt debe coincidir con el de entrenamiento y el entorno físico debe reproducir las condiciones de las demostraciones; el propio README insiste en resetear los brazos a la pose inicial y colocar la escena como en entrenamiento.
- Dataset de referencia pequeño: 30 tomas y 23.400 frames con contacto. Es plausible un sobreajuste a esa distribución; no hay datos publicados sobre generalización.
- Varianza de flow matching: saltos de ~19 grados en el brazo y ~0,2 rad en la mano en cada cambio de chunk (~2 Hz). Las mitigaciones por defecto (ruido inicial fijo y cross-fade de 8 ticks) palían el síntoma, no la causa; el arreglo real exige reentrenar con RTC (este checkpoint tiene `rtc_training_max_delay` = 0 frente a un retardo medido de ~18 ticks) o ampliar datos y pasos.
- Seguridad física: tras cualquier parada el seguidor queda rígido en la última pose, lo que puede ser peligroso si el efector está en contacto con el entorno; se indica usar "Reset arms" o "Loose". El e-stop manual es obligatorio durante el rollout.
- Dependencia fuerte del hardware y del sistema: un enlace USB3 degradado, un grabador activo o un *tile* Retarget sin detener provocan rechazo de ejecución o sacudidas en los dedos.
- Licencia no disponible: no puede confirmarse el uso comercial del stack ni del checkpoint asociado. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks públicos ni métricas de éxito por tarea: los números disponibles son errores de seguimiento y saltos, no tasas de éxito.
- Idiomas no disponibles: el condicionamiento de lenguaje se ha validado en inglés; no hay evidencia de soporte de prompts en castellano.
- Madurez temprana: 0 descargas y 0 likes, histórico de cambios fechado en septiembre y octubre de 2026, con rutas absolutas específicas del autor (`/data/zhicao/...`), lo que complica la reproducibilidad fuera de su máquina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhicao/Zhi-Policy
- Checkpoint referenciado: https://huggingface.co/lzy001Yuki/SteeringPolicyReal
- LeRobot (commit fijado en el entorno): https://github.com/huggingface/lerobot/commit/71a11efe77f55e61f3ab2ce45b40da8cf626afa9
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de entrenamiento citada por el autor (`PI05_STEERING.md`, dentro del repositorio del checkpoint): no disponible como enlace directo
- Paper, blog o demo del stack Zhi-Policy: no disponibles en la información proporcionada
