# VivekSai07/xvla_hfteam_box_middle

## Resumen

X-VLA para dos brazos SO-101 (`VivekSai07/xvla_hfteam_box_middle`) es un ajuste fino del modelo base `lerobot/xvla-base` (0,9B parámetros) orientado a robótica bimanual. Lo desarrolla el usuario VivekSai07 en el contexto del hackathon HFTeamA, y resuelve una tarea concreta: que dos brazos SO-101 seguidores levanten una caja de forma conjunta y la depositen en el centro. Se trata de un modelo de visión-lenguaje-acción (VLA) que combina observaciones visuales de tres cámaras con el estado articular y una instrucción en lenguaje natural para producir secuencias de acciones motoras.

El modelo se ha entrenado sobre un conjunto de 41 episodios teleoperados (20.556 fotogramas a 30 fps) del dataset `diegoloayza789/hfteam_box_middle`, con 7.000 pasos de entrenamiento a batch size 16, lo que equivale a unas 5,5 pasadas sobre los datos. La salida son bloques de 30 acciones (un segundo de control) con 12 objetivos articulares, seis por brazo.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino de un VLA de código abierto para manipulación bimanual con robots de bajo coste (SO-101), empaquetado en el ecosistema LeRobot 0.7.0. No obstante, el propio autor advierte de que la tasa de éxito real sobre los brazos aún no se ha medido, por lo que debe considerarse una prueba de concepto y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), ajuste fino de `lerobot/xvla-base` |
| Parametros totales | 879.687.256 (0,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del VLA base `lerobot/xvla-base` (0,9B parámetros) y se ha ajustado de forma completa: todos los parámetros son entrenables, con autocast en bf16. La entrada combina tres cámaras (`front`, `left_wrist`, `right_wrist`) a 640x480 reescaladas a 224x224, las 12 posiciones articulares de los dos brazos y el texto de la tarea. La salida es un chunk de 30 acciones (1 segundo a 30 fps) con 12 objetivos articulares, ordenados `left_*` seguidos de `right_*`.

El entrenamiento se realizó con LeRobot 0.7.0 sobre los 41 episodios completos del dataset, 7.000 pasos a batch size 16 (aproximadamente 5,5 épocas). La pérdida bajó de 0,79 en el paso 100 a 0,041 en el 1.000 y 0,003 en el 7.000. El autor reporta una comprobación en lazo abierto sobre 64 fotogramas de entrenamiento con un error medio de 0,9 (grados; pinza en escala 0-100) y un máximo de 1,65 por articulación, aunque señala explícitamente que esos fotogramas formaron parte del entrenamiento y que la métrica refleja ajuste a las demostraciones, no generalización. No se documentan innovaciones técnicas adicionales (RLHF, DPO, decodificación especulativa) en la información disponible.

## Capacidades

- Generación de acciones motoras bimanuales: produce chunks de 30 acciones con 12 objetivos articulares para dos brazos SO-101.
- Percepción visual multi-cámara: integra vista frontal y muñecas izquierda y derecha.
- Condicionamiento por lenguaje natural: acepta una instrucción de tarea ("Lift the box with both arms and place it in the middle").
- Control a 30 fps: los chunks de 30 acciones cubren un segundo de ejecución.
- Integración con LeRobot: despliegue mediante `lerobot-rollout` con estrategia `base`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, matemáticas, código ni otros dominios generales; el modelo está especializado en la tarea de manipulación descrita.

## Casos de uso

- Manipulación bimanual de objetos en laboratorio: dos brazos SO-101 levantan y colocan una caja de forma coordinada, usando las tres cámaras para alinear las pinzas y el objeto.
- Investigación en VLA de bajo coste: sirve como referencia reproducible para estudiar cómo se comporta un VLA de 0,9B ajustado con pocos datos (41 episodios) en hardware asequible.
- Recolección y replicación de pipelines de teleoperación: el flujo dataset → entrenamiento LeRobot → rollout permite replicar el experimento con otros objetos o configuraciones.
- Docencia y formación en robótica: ejemplo completo de extremo a extremo (grabación, ajuste fino, despliegue) para cursos de aprendizaje por imitación.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y sobre `xvla-base`, puede reutilizarse como punto de partida para tareas bimanuales similares.
- Evaluación comparativa de estrategias de control: permite contrastar control en lazo abierto frente a lazo cerrado y medir la degradación por acumulación de error en chunks de 30 acciones.
- Pruebas de integración con LeRobot 0.7.0: validación de la API `lerobot-rollout` y del mapeo de cámaras mediante `rename_map` en robots bimanuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas internas de entrenamiento y una comprobación en lazo abierto:

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento (paso 100) | 0,79 | bf16, batch 16 |
| Perdida de entrenamiento (paso 1.000) | 0,041 | bf16, batch 16 |
| Perdida de entrenamiento (paso 7.000) | 0,003 | bf16, batch 16 |
| Error medio lazo abierto (1 s) | 0,9 | grados; pinza 0-100; 64 fotogramas de entrenamiento |
| Error maximo por articulacion | 1,65 | grados; mismos fotogramas |
| Tasa de exito en los brazos | no medida | pendiente de evaluacion |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,88B parámetros en bf16 el peso ronda 1,8 GB, más el coste de los tres flujos de cámara y del codificador visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8-16 GB (RTX 3060/4070/4090) debería ser suficiente para inferencia, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probable por el tamaño del modelo, pero no verificado en la información disponible.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=VivekSai07/xvla_hfteam_box_middle`; requiere `--robot.type=bi_so_follower` y el `rename_map` de cámaras indicado en la model card.
- Latencia y throughput: no disponibles. El control está pensado para chunks de 1 segundo a 30 fps, pero no se documentan tiempos de inferencia reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VivekSai07/xvla_hfteam_box_middle` | 0,88B | no disponible | Bimanual SO-101 (levantar caja) | Apache 2.0 | Hugging Face |
| `lerobot/xvla-base` | 0,9B | no disponible | VLA base, ajustable a tareas | no disponible en la informacion | Hugging Face |
| Otros VLA de robótica open source (p. ej. familias OpenVLA/RT) | no disponible | no disponible | Manipulación general | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Tasa de éxito real no medida: el autor indica explícitamente que no se ha evaluado sobre los brazos físicos.
- Sobreajuste a las demostraciones: la métrica de lazo abierto se calcula sobre fotogramas de entrenamiento, por lo que no demuestra generalización.
- Dataset muy pequeño: 41 episodios y una sola tarea; la variedad de posiciones, iluminación y objetos es limitada.
- Especialización estrecha: no es un modelo de propósito general; no se documentan capacidades de texto, código, matemáticas ni tool calling.
- Dependencia de hardware concreto: asume dos brazos SO-101, tres cámaras con nombres específicos y el mapeo `rename_map` indicado.
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación motora: en lazo cerrado, errores de predicción pueden acumularse a lo largo de chunks sucesivos de 30 acciones.
- Sesgos: no documentados; al entrenarse con teleoperación de un único operador y entorno, puede heredar sesgos de esa configuración.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset deben verificarse por separado.
- Fecha de creación futura (2026-11-22) en los metadatos: conviene confirmar la vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VivekSai07/xvla_hfteam_box_middle
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/diegoloayza789/hfteam_box_middle
- LeRobot (librería): https://github.com/huggingface/lerobot
