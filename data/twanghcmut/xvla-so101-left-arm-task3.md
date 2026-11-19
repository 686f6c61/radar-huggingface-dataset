# twanghcmut/xvla-so101-left-arm-task3

## Resumen

X-VLA fine-tuned on SO-101 left arm, 3 tasks es un checkpoint de visión-lenguaje-acción (VLA) para control robótico de un brazo SO-101. Se construye a partir de `2toINF/X-VLA-Pt`, un modelo de 0,9B parámetros que combina un codificador visual Florence-2-large con un transformer de acciones entrenado mediante flow matching y soft prompts. Este checkpoint concreto ha sido ajustado por el usuario `twanghcmut` sobre el dataset `hungho77/so101-left-arm-task3`, que contiene 159 episodios y 133.763 fotogramas a 30 fps para tres tareas de manipulación con un único brazo izquierdo SO-101.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de cámaras (`top` y `wrist`) en secuencias de acciones de 6 dimensiones (5 articulaciones en grados más apertura del gripper). Es relevante como ejemplo de adaptación de un VLA generalista a un robot de bajo coste mediante fine-tuning con receta reproducible, y porque el autor publica una comparación open-loop frente a otros VLA populares (GR00T N1.6/N1.7, pi0.5, Cosmos3-Edge) sobre el mismo dataset.

La arquitectura subyacente es un transformer con codificador visual Florence-2-large y un módulo de acciones con flow matching, con un total de 879.738.545 parámetros según los pesos en safetensors. El checkpoint se distribuye con licencia Apache 2.0 y requiere el repositorio oficial de X-VLA para su uso, ya que depende de código personalizado (`custom_code`) no incluido en `transformers` estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: codificador Florence-2-large + transformer de acciones con flow matching y soft prompts |
| Parametros totales | 879.738.545 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `2toINF/X-VLA-Pt`: un codificador visual Florence-2-large que procesa las imágenes de las cámaras `top` (360x640) y `wrist` (480x640), más una tercera vista vacía, y un transformer de acciones que genera trayectorias mediante flow matching condicionado por soft prompts. El espacio de acciones es `auto` con `real_action_dim 6` y `max_action_dim 20`; la pérdida es MSE multiplicada por 100 sobre las 6 dimensiones reales. Las articulaciones 0-4 se predicen como deltas respecto a la propiocepción y el gripper como objetivo absoluto, con acciones normalizadas min-max a [-1, 1] usando las estadísticas del dataset. La propiocepción es la acción previa (`action[t-1]`), no `observation.state`, siguiendo el handler LeRobot v2.1 original. El chunk de acción es de 30 pasos sobre 1 segundo.

El fine-tuning se realizó con el repositorio oficial de X-VLA (commit `6bc2513`) usando `accelerate` con precisión mixta bf16, learning rate 1e-4, `learning_coef` 0.1, congelación durante 1.000 pasos y warmup lineal de 2.000 pasos. Se entrenó con batch 32 en una sola GPU H100 80GB durante 4 h 24 min (aproximadamente 0,65 s/paso), 24.000 iteraciones equivalentes a 768k muestras y unas 5,7 pasadas sobre los 133.763 fotogramas. El VLM y los soft prompts usan un factor 0.1 sobre el learning rate. La pérdida pasó de 10,7 en el paso 20 a 0,32 en el paso 2.000, con una media de 0,082 en los últimos 1.000 pasos.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones (5 articulaciones + gripper) a partir de instrucciones en lenguaje natural e imágenes de dos cámaras.
- Ejecución de tres tareas concretas de manipulación: extraer un cubo rojo de una olla de acero y colocarlo en un cubo hueco naranja; abrir el cajón superior, coger el bloque cuadrado rojo, meterlo en el cajón y cerrarlo; abrir el cajón, coger el cubo rojo y apilarlo sobre el cubo azul.
- Condicionamiento por cadena de tarea: el string de la tarea debe pasarse literalmente, incluyendo el punto final cuando exista.
- Control de un brazo SO-101 izquierdo con gripper de apertura continua.
- Predicción de chunks de 30 pasos (1 segundo a 30 fps) con 10 pasos de denoising en la evaluación.
- No soporta tool calling, function calling, agentes multi-step, visión general, audio ni modo thinking: es un modelo específico de política robótica.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea 0 (extraer el cubo rojo de la olla y colocarlo en el cubo hueco naranja) sobre un brazo SO-101, útil para prototipos de manipulación de bajo coste con dos cámaras.
- Manipulación de cajones en entornos domésticos simulados: las tareas 1 y 2 cubren apertura y cierre de cajones combinados con pick-and-place, un caso típico de benchmark para VLA de interior.
- Apilamiento de objetos: la tarea 2 permite evaluar la precisión de apilado del modelo sobre un cubo azul, útil para medir tolerancias de posicionamiento con el gripper.
- Investigación en fine-tuning de VLA: el repositorio incluye el parche upstream, el handler `so101.py`, el script de evaluación open-loop y el launcher, lo que permite reproducir la receta sobre otros datasets SO-101.
- Comparación de políticas robóticas: sirve como referencia X-VLA frente a GR00T N1.6/N1.7, pi0.5 y Cosmos3-Edge en el mismo dataset y protocolo open-loop.
- Evaluación offline antes de despliegue real: el script `eval_so101_open_loop.py` permite medir MAE/MSE sobre trayectorias del dataset sin necesidad de robot físico.
- Base para multi-tarea: el autor publica un checkpoint de 11 tareas (`twanghcmut/X-VLA-SO101-LeftArm-Multitask`) con la misma integración SO-101, útil como punto de partida para ampliar el conjunto de tareas.

## Benchmarks y rendimiento

Evaluación open-loop in-sample sobre 6 trayectorias de entrenamiento (2 por tarea: episodios 0, 25, 51, 80, 108, 133), política invocada cada 16 pasos, primeros 16 de los 30 pasos predichos comparados con las acciones ground-truth, hasta 400 pasos por trayectoria, 10 pasos de denoising. MAE en unidades del dataset; la MAE normalizada divide por la desviación estándar absoluta de las acciones (29,97).

| Trayectoria | Tarea | MAE | MSE |
|---|---|---|---|
| 0 | 0 | 0,872 | 1,85 |
| 25 | 0 | 1,090 | 3,07 |
| 51 | 1 | 0,940 | 1,99 |
| 80 | 1 | 0,967 | 2,15 |
| 108 | 2 | 1,065 | 4,40 |
| 133 | 2 | 1,045 | 3,74 |
| **Media** | | **0,997** | **2,87** |

MAE normalizada: 3,33%. Mantener la acción previa durante 16 pasos en las mismas trayectorias y protocolo da 2,313 (7,72%). El error crece con la posición en el chunk: 0,41 en el paso 0, 0,82 en el paso 4, 1,11 en el paso 8 y 1,32 en el paso 14.

Comparación con otros modelos sobre las mismas 6 trayectorias, 400 pasos y horizonte 16:

| Modelo | MAE | Entrada de estado | Checkpoint |
|---|---|---|---|
| X-VLA (este) | 0,997 | acción previa | este repo |
| GR00T N1.6 | 1,345 | `observation.state` | no disponible |
| GR00T N1.7 | 1,440 | `observation.state` | `twanghcmut/gr00t-n1d7-so101-left-arm-task3` |
| pi0.5 | 1,459 | `observation.state` | `twanghcmut/pi05-so101-left-arm-task3` |
| Cosmos3-Edge | 1,911 | `observation.state` | `twanghcmut/cosmos3-edge-so101-left-arm-task3` |

Advertencia del autor: no es una comparación homogénea. X-VLA recibe la acción registrada en `t-1` como propiocepción, mientras que los demás reciben el estado articular medido; en este dataset la acción previa y el estado medido difieren en 1,83 unidades de media, por lo que X-VLA parte de un anclaje exacto que los otros no tienen. La comparación decisiva sería en bucle cerrado o en robot real, y este checkpoint no se ha ejecutado en el robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Con 879,7M parámetros en bf16 los pesos ocupan aproximadamente 1,76 GB; el repo completo son 3,5 GB, por lo que se debe prever margen para activaciones, codificador Florence-2-large y buffers de flow matching.
- GPU de entrenamiento utilizada: 1 x H100 80GB (4 h 24 min, batch 32).
- GPU recomendadas para inferencia: no disponibles en la información. Por tamaño, una GPU consumer de 24 GB (RTX 4090) o superior debería ser suficiente en bf16, pero no hay confirmación del autor.
- Cabe en GPU consumer: probable por tamaño de parámetros, sin dato oficial.
- Opciones de despliegue: el repositorio oficial de X-VLA (commit `6bc2513`) con `models.modeling_xvla.XVLA` y `models.processing_xvla.XVLAProcessor`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo de entrenamiento (aproximadamente 0,65 s/paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE open-loop (este dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA (este) | 879,7M | no disponible | 0,997 | Apache 2.0 | Hugging Face, requiere repo X-VLA |
| GR00T N1.7 | no disponible | no disponible | 1,440 | no disponible | `twanghcmut/gr00t-n1d7-so101-left-arm-task3` |
| pi0.5 | no disponible | no disponible | 1,459 | no disponible | `twanghcmut/pi05-so101-left-arm-task3` |
| Cosmos3-Edge | no disponible | no disponible | 1,911 | no disponible | `twanghcmut/cosmos3-edge-so101-left-arm-task3` |

La comparación no es like-for-like por la diferencia en la entrada de propiocepción descrita en la sección de benchmarks. No se dispone de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre tres tareas de un brazo SO-101 izquierdo con una configuración de cámaras concreta (`top` 360x640 y `wrist` 480x640 más una tercera vista vacía).
- No se ha ejecutado en robot real: el autor indica explícitamente que este checkpoint no ha corrido en el robot físico, solo en evaluación open-loop.
- Evaluación in-sample: las 6 trayectorias evaluadas estaban en el conjunto de entrenamiento, por lo que la MAE mide ajuste, no generalización.
- Dependencia de la propiocepción como acción previa: en inferencia hay que alimentar la última acción comandada, no `observation.state`; usar el estado medido degrada el rendimiento y rompe la comparación con otros modelos.
- Sensibilidad al string de tarea: debe pasarse literalmente, incluyendo el punto final cuando exista.
- Error creciente dentro del chunk: la MAE sube de 0,41 en el paso 0 a 1,32 en el paso 14, lo que limita la precisión en horizontes largos sin re-planificación.
- Sin datos de sesgos, alucinación o cobertura idiomática: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el código upstream de X-VLA y las dependencias (Florence-2, LeRobot) deben verificarse por separado.
- Requiere aplicar un parche a tres archivos upstream y copiar el handler `so101.py`; no es un checkpoint plug-and-play con `transformers` estándar pese a la etiqueta `custom_code`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/xvla-so101-left-arm-task3
- Modelo base: https://huggingface.co/2toINF/X-VLA-Pt
- Repositorio oficial X-VLA: https://github.com/2toinf/X-VLA
- Dataset de fine-tuning: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Checkpoint multi-tarea 11 tareas: https://huggingface.co/twanghcmut/X-VLA-SO101-LeftArm-Multitask
- Checkpoint GR00T N1.7 comparable: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- Checkpoint pi0.5 comparable: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Checkpoint Cosmos3-Edge comparable: https://huggingface.co/twanghcmut/cosmos3-edge-so101-left-arm-task3
