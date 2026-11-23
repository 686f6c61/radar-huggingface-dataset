# twanghcmut/evo1-so101-left-arm-task3

## Resumen

Evo-1 fine-tuned on SO-101 left arm, 3 tasks es un checkpoint de robótica de tipo vision-language-action (VLA) publicado por el usuario twanghcmut en Hugging Face. Se trata de un ajuste fino del modelo base MINT-SJTU/Evo1_SO100, desarrollado por el grupo MINT de la Universidad Jiao Tong de Shanghái, que combina un codificador visual-lenguaje InternVL3-1B con una cabeza de acción basada en flow-matching y modulación cruzada, sumando 0,77B parámetros.

El modelo resuelve el problema de mapear observaciones multimodales (imágenes de cámaras y estado de las articulaciones) más una instrucción en lenguaje natural a secuencias de acciones motrices para un brazo robótico SO-101. Este checkpoint concreto está especializado en tres tareas de manipulación sobre un único brazo izquierdo SO-101, con estado y acción de 6 dimensiones (5 articulaciones en grados más apertura de pinza).

Es relevante ahora porque forma parte de una serie de comparaciones reproducibles entre familias VLA (GR00T, π0.5, X-VLA, MolmoAct) sobre el mismo conjunto de datos, lo que permite evaluar de forma directa el rendimiento relativo de Evo-1 en tareas de manipulación con horizonte de predicción de 50 pasos. La licencia MIT y la disponibilidad de scripts de entrenamiento y evaluación facilitan su reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: codificador InternVL3-1B + cabeza de acción flow-matching con modulación cruzada |
| Parámetros totales | 0,77B (770 millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (instrucciones de tarea en inglés en la model card) |
| Licencia | MIT |
| Formato de pesos | DeepSpeed model-state (`mp_rank_00_model_states.pt`, `checkpoint.json`); repo de 1,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Evo-1: un codificador vision-language InternVL3-1B que procesa las imágenes de las cámaras `top` (360x640) y `wrist` (480x640) junto con la instrucción textual, y una cabeza de acción de flow-matching con modulación cruzada que genera trozos de 50 acciones. El estado de entrada es `observation.state` en el frame ancla, y el chunk de salida son las siguientes 50 acciones, rellenadas a 24 dimensiones con una máscara de 6 dimensiones. Se usan objetivos articulares absolutos (`use_delta_action: False`) con normalización por límites (`bounds`).

El ajuste fino se realizó con el repositorio oficial Evo-1 (commit `5fd14b0`) sobre el dataset `hungho77/so101-left-arm-task3`: 159 episodios, 133.763 frames a 30 fps, tres tareas, un brazo izquierdo SO-101. La receta corresponde a la etapa 2 del README: `--finetune_vlm --finetune_action_head --use_augmentation --lr 1e-5 --dropout 0.2 --weight_decay 1e-3 --image_size 448 --horizon 50 --num_layers 8 --grad_clip_norm 1.0 --warmup_steps 1000`, con DeepSpeed ZeRO-2 y bf16. Se entrenó con batch 32 en una sola GPU H100 80GB (pico de 21,6 GB), durante 45,5 horas a aproximadamente 6,9 s/paso, alcanzando 24.000 pasos (768k muestras, unas 5,7 épocas). La pérdida MSE de velocidad bajó de 0,47 en el paso 20 a 0,005 en el paso 24.000 (mejor registrada 0,0030). El proceso estuvo limitado por CPU debido a la decodificación de vídeo AV1 en 8 CPUs compartidas.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y observaciones visuales.
- Control de un brazo SO-101 izquierdo con 5 articulaciones en grados más apertura de pinza (6 dimensiones de estado y acción).
- Predicción de trozos de acción de horizonte 50, con evaluación open-loop del primer subconjunto de 16 pasos.
- Procesamiento multimodal con dos vistas de cámara (`top` y `wrist`) y una tercera vista enmascarada.
- Ejecución de tres tareas específicas: extraer un cubo rojo de una olla de acero y colocarlo en un cubo hueco naranja; abrir el cajón superior, coger un bloque cuadrado rojo, colocarlo dentro y cerrar el cajón; abrir el cajón, coger el cubo rojo y apilarlo sobre el cubo azul.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio especial: no disponible.

## Casos de uso

- Manipulación de laboratorio con brazo SO-101: el modelo recibe las imágenes de las cámaras `top` y `wrist` y el estado articular, y devuelve objetivos absolutos de las 5 articulaciones más la pinza, lo que permite integrarlo en un bucle de control que ejecute los primeros pasos del chunk de 50 y vuelva a consultar la política.
- Automatización de tareas de pick-and-place: la tarea 0 (extraer un cubo rojo de una olla y colocarlo en un cubo hueco naranja) es un caso típico de recogida y colocación que el modelo aborda con una única instrucción textual pasada literalmente.
- Apilado de bloques: la tarea 2 (coger el cubo rojo y apilarlo sobre el cubo azul) permite evaluar la precisión de posicionamiento del modelo en tareas de ensamblaje simple.
- Manipulación de cajones: las tareas 1 y 2 requieren abrir un cajón, lo que ejercita la coordinación entre percepción visual, control de la pinza y movimiento articular en secuencia.
- Reproducción de experimentos VLA: al compartir dataset, receta y métricas con checkpoints de GR00T, π0.5, X-VLA y MolmoAct, sirve para comparar familias de modelos sobre el mismo conjunto de datos y las mismas trayectorias de evaluación.
- Base para ajuste fino en nuevos brazos o tareas: al estar bajo licencia MIT y partir de Evo1_SO100 con scripts de entrenamiento y configuración de dataset incluidos (`config_so101_task3.yaml`, `run_so101_task3_evo1.sh`), puede reutilizarse como punto de partida para otros setups SO-101.
- Evaluación open-loop en pipelines de CI: el script `eval_so101_open_loop.py` permite medir MAE y MSE sobre trayectorias de entrenamiento de forma automatizada, útil para detectar regresiones tras cambios en la receta.

## Benchmarks y rendimiento

Evaluación open-loop in-sample sobre 6 trayectorias de entrenamiento (2 por tarea: episodios 0, 25, 51, 80, 108, 133), con la política llamada cada 16 pasos y comparando los primeros 16 de los 50 pasos predichos, hasta 400 pasos por trayectoria. MAE en unidades del dataset; "normalizado" divide por la desviación estándar absoluta de la acción (29,97).

| Trayectoria | Tarea | MAE | MSE |
|---|---|---|---|
| 0 | 0 | 1,862 | 6,46 |
| 25 | 0 | 2,291 | 11,71 |
| 51 | 1 | 1,999 | 7,36 |
| 80 | 1 | 2,331 | 11,00 |
| 108 | 2 | 1,754 | 6,64 |
| 133 | 2 | 2,003 | 9,11 |
| **Promedio** | | **2,040** | **8,72** |

MAE normalizado: 6,81%. El error es mayoritariamente un desplazamiento constante más que deriva: MAE 1,77 en el paso 0 del chunk, 1,93 en el paso 4, 2,09 en el paso 8 y 2,17 en el paso 14. En el paso 4.000 la misma evaluación daba 17,4% (el run de 11 tareas estaba en 25,7% en ese punto y terminó en 11,46%).

Comparativa con otros checkpoints sobre las mismas trayectorias y horizonte (cada uno puntuado con el script de su propio framework):

| Modelo | MAE | Checkpoint |
|---|---|---|
| GR00T N1.6 | 1,345 | twanghcmut/gr00t-n1d6-so101-left-arm-task3 |
| π0.7-style π0.5 (RTC) | 1,366 | twanghcmut/openpi-pi07-so101-left-arm-task3 |
| GR00T N1.7 | 1,440 | twanghcmut/gr00t-n1d7-so101-left-arm-task3 |
| π0.5 | 1,459 | twanghcmut/pi05-so101-left-arm-task3 |
| MolmoAct2 | 1,877 | twanghcmut/molmoact2-so101-left-arm-task3 |
| **Evo-1 (este)** | **2,040** | |
| X-VLA | 0,997 (proprio = acción previa, no comparable) | twanghcmut/xvla-so101-left-arm-task3 |

No hay split de validación: los 159 episodios se usaron para entrenamiento, por lo que estas cifras miden ajuste, no generalización, y no son una tasa de éxito. El checkpoint no se ha ejecutado en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento con batch 32 alcanzó un pico de 21,6 GB en una H100 80GB, por lo que la inferencia con batch pequeño debería caber en GPUs de 24 GB o menos, aunque no se confirma en la información disponible.
- GPU recomendadas: H100 80GB para entrenamiento (única GPU usada en el ajuste fino). Para inferencia no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Dado el tamaño de 0,77B parámetros, es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: el repositorio oficial Evo-1 incluye `scripts/Evo1_server.py` con parámetros `ckpt_dir`, `arm_key` y `dataset_key`; el checkpoint usa formato DeepSpeed model-state, no safetensors ni GGUF. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento consumió aproximadamente 6,9 s/paso, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE (open-loop) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Evo-1 (este) | 0,77B | no disponible | 2,040 | MIT | Hugging Face |
| GR00T N1.6 | no disponible | no disponible | 1,345 | no disponible | Hugging Face (twanghcmut) |
| π0.5 | no disponible | no disponible | 1,459 | no disponible | Hugging Face (twanghcmut) |
| π0.7-style π0.5 (RTC) | no disponible | no disponible | 1,366 | no disponible | Hugging Face (twanghcmut) |
| GR00T N1.7 | no disponible | no disponible | 1,440 | no disponible | Hugging Face (twanghcmut) |
| MolmoAct2 | no disponible | no disponible | 1,877 | no disponible | Hugging Face (twanghcmut) |
| X-VLA | no disponible | no disponible | 0,997 (no comparable) | no disponible | Hugging Face (twanghcmut) |

Los datos de parámetros, contexto y licencia de los modelos comparables no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- No hay split de validación: los 159 episodios se usaron íntegramente para entrenamiento, por lo que las métricas open-loop miden ajuste y no generalización.
- El checkpoint no se ha probado en el robot real; toda la evaluación es open-loop sobre trayectorias de entrenamiento.
- Solo cubre tres tareas concretas y un único brazo SO-101 izquierdo; no es un modelo generalista de manipulación.
- Requiere pasar la cadena de tarea literalmente, incluido el punto final cuando esté presente.
- El error open-loop es principalmente un desplazamiento constante (MAE 1,77 en el paso 0 del chunk), lo que puede traducirse en sesgos sistemáticos de posicionamiento en ejecución real.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones no válidas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles; las instrucciones del dataset están en inglés.
- Licencia MIT: permite uso comercial, pero el modelo base MINT-SJTU/Evo1_SO100 y sus dependencias (InternVL3-1B) pueden tener condiciones adicionales que no se detallan en la información disponible.
- El repositorio usa formato DeepSpeed model-state, lo que puede complicar el despliegue fuera del framework Evo-1.
- El entrenamiento estuvo limitado por CPU (decodificación AV1 en 8 CPUs compartidas), lo que sugiere que la reproducibilidad depende en gran medida del pipeline de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/evo1-so101-left-arm-task3
- Modelo base: https://huggingface.co/MINT-SJTU/Evo1_SO100
- Repositorio oficial Evo-1: https://github.com/MINT-SJTU/Evo-1
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Checkpoint multitarea de 11 tareas: https://huggingface.co/twanghcmut/Evo-1-SO101-LeftArm-Multitask
- GR00T N1.6 (comparativa): https://huggingface.co/twanghcmut/gr00t-n1d6-so101-left-arm-task3
- GR00T N1.7 (comparativa): https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- π0.5 (comparativa): https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- π0.7-style π0.5 RTC (comparativa): https://huggingface.co/twanghcmut/openpi-pi07-so101-left-arm-task3
- MolmoAct2 (comparativa): https://huggingface.co/twanghcmut/molmoact2-so101-left-arm-task3
- X-VLA (comparativa): https://huggingface.co/twanghcmut/xvla-so101-left-arm-task3
