# tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260816

## Resumen

El modelo `ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260816` es un fine-tune del modelo de robótica GR00T-N1.7-3B, desarrollado por el usuario tarzanagh para el skill **put_aside** en el robot bimanual DexMate Vega. Forma parte de una tarea más amplia de manipulación: pick → scan → place-on-scale → pick-from-scale → put-aside. El checkpoint corresponde al paso 8000 de entrenamiento y contiene únicamente los pesos del modelo.

El modelo está entrenado con datos de teleoperación de 87 episodios capturados entre el 10 y 11 de agosto de 2026, en una escena de oficina nueva, con 4 cámaras (head_left, head_right, left_wrist, right_wrist) a 30 Hz. Es un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, no a generación de texto. Su relevancia radica en demostrar un fine-tune específico de una habilidad concreta sobre una base GR00T, con validación pendiente en el robot real.

El repositorio incluye los pesos en formato safetensors, la configuración de 4 cámaras (que registra un nuevo embodiment), episodios de ejemplo con vídeo y un README de despliegue. El tamaño total del repositorio es de 6,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7-3B (fine-tune) |
| Parametros totales | 3B (segun el nombre del modelo, no confirmado explicitamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GR00T-N1.7-3B es un modelo de la familia GR00T de NVIDIA, diseñado para robótica generalista. Este checkpoint es un fine-tune específico para la habilidad **put_aside** en el robot DexMate Vega. El entrenamiento se realizó con datos de teleoperación segmentados en ventanas donde la base del robot permanece estacionaria (verificado visualmente), lo que simplifica el aprendizaje de la manipulación.

Los datos consisten en 87 episodios de la tarea `pick_from_scale_and_place_aside`, capturados con 4 cámaras a 30 Hz. El entrenamiento alcanzó 8000 pasos (checkpoint-8000). No se especifica el uso de RLHF, DPO ni otras técnicas de optimización posteriores al fine-tune supervisado. La configuración de 4 cámaras registra un nuevo embodiment (`NEW_EMBODIMENT`) en los archivos de configuración.

## Capacidades

- Control robótico bimanual: genera acciones de manipulación a partir de observaciones visuales de 4 cámaras (dos en la cabeza, dos en las muñecas).
- Ejecución de la habilidad **put_aside** dentro de una tarea de mayor alcance (pick → scan → place-on-scale → pick-from-scale → put-aside).
- Manejo de secuencias de vídeo de 30 Hz como entrada, junto con el estado del robot.
- Capacidad de ser desplegado en el robot DexMate Vega mediante los scripts incluidos en `deploy/README.md`.
- Incluye episodios de ejemplo con vídeos de las 4 cámaras y estados/acciones completos para reproducibilidad.

## Casos de uso

- Automatización de tareas de manipulación en entornos de laboratorio: el modelo puede ejecutar la tarea de dejar un objeto a un lado tras pesarlo, útil en líneas de inspección o clasificación.
- Investigación en aprendizaje por imitación: los 87 episodios y la configuración de 4 cámaras permiten estudiar el efecto del número de cámaras y la segmentación de tareas en el rendimiento del fine-tune.
- Desarrollo de habilidades robóticas modulares: al ser un checkpoint específico para put_aside, puede integrarse en un sistema de control que combine varios skills (pick, scan, place-on-scale) entrenados por separado.
- Validación de generalización a nuevas escenas: el entrenamiento se realizó en una oficina nueva, lo que permite evaluar si el modelo generaliza a entornos no vistos durante el entrenamiento.
- Base para fine-tunes posteriores: los pesos del modelo pueden servir como punto de partida para adaptar la habilidad a otros robots o tareas similares.
- Benchmarking de modelos VLA en robótica: comparar este checkpoint con otros modelos GR00T o VLA en la misma tarea para medir el impacto del fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que se debe validar en el robot real.

## Requisitos de hardware

- No se proporcionan requisitos de hardware en la informacion disponible.
- Al ser un modelo de 3B parámetros, se estima que podría ejecutarse en GPUs con al menos 12-16 GB de VRAM en FP16, pero esto es una estimación no confirmada.
- No se especifican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje sino de robótica.
- El repositorio incluye un `deploy/README.md` que debería contener instrucciones de despliegue, pero su contenido no está disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de robótica como OpenVLA, RT-2 o GR00T base. El autor no incluye benchmarks ni comparaciones en la model card.

## Limitaciones y advertencias

- El modelo se entrenó con solo 87 episodios, lo que puede limitar su generalización a variaciones de la tarea o del entorno.
- La validación en el robot real está pendiente; el autor indica explícitamente "Validate on the real robot".
- La licencia es "other" sin especificar, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto, ya que no es un modelo de texto.
- El checkpoint es solo de pesos del modelo (model-only), por lo que se necesitan los archivos de configuración y estadísticas incluidos en el repositorio para cargarlo correctamente.
- La tarea se limita a la habilidad put_aside con la base estacionaria; no es un modelo de manipulación general.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260816
