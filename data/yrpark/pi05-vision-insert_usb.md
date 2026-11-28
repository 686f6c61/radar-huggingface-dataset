# yrpark/pi05-vision-insert_USB

## Resumen

`pi05_vision_insert_USB` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario `yrpark` y publicado en Hugging Face. Se trata de una ablación del modelo base OpenVTLA `yrpark/openvtla-insert_USB`: emplea exactamente los mismos datos, modelo e hiperparámetros, pero elimina por completo la entrada táctil (los tokens táctiles AnyTouch2). El objetivo es servir de línea base "solo visión" para cuantificar cuánto aporta la modalidad táctil en una tarea de inserción física.

El modelo parte de `pi0.5` (familia pi0.5, del ecosistema openpi) y se especializa mediante LoRA en la tarea `insert_USB` del conjunto OpenViTac, en simulación, con una cámara GelSight Mini y 100 demostraciones. No es un modelo de lenguaje general: es una política de control que recibe imágenes de cámara de cabeza y muñeca, el estado del robot y un prompt textual, y produce acciones de horizonte 50.

Es relevante ahora porque acompaña al modelo base OpenVTLA como control experimental reproducible: permite aislar el efecto de la señal táctil en el rendimiento de una tarea de inserción, algo poco habitual en la literatura abierta de VLA. El repositorio ocupa 6.3 GB e incluye únicamente el checkpoint final (paso 19999) con los parámetros de inferencia y las estadísticas de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) con adaptadores LoRA; sin entrada táctil |
| Parametros totales | no disponible (el modelo base pi0.5 no reporta cifra en la información; LoRA sobre gemma_2b_lora + gemma_300m_lora) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint openpi en precisión de entrenamiento; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (el prompt es textual; no se documentan idiomas) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`19999/params/` para inferencia; `assets/` con estadísticas de normalización) |
| Entradas | cámara de cabeza + cámara de muñeca, estado del robot, prompt (sin táctil) |
| Horizonte de acciones | 50 |
| Tamaño del repo | 6.3 GB |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de `pi0.5` (partiendo de `pi05_base`) y adaptada mediante LoRA a la tarea de inserción de USB. Se aplican dos adaptadores LoRA (`gemma_2b_lora` y `gemma_300m_lora`) sobre el modelo base. La entrada combina imágenes de dos cámaras (cabeza y muñeca), el estado del robot y un prompt textual; a diferencia del modelo OpenVTLA del que es ablación, no recibe tokens táctiles AnyTouch2. La salida es una secuencia de acciones con horizonte 50.

El entrenamiento se realizó sobre el conjunto `openvitac/insert_USB_gelsight` (FVL-Lab/OpenViTac, revisión `5fb2757b88826917242adefd9196424ef8cf2d98`): simulación con sensor GelSight Mini y 100 demostraciones. Se ejecutaron 20.000 pasos con batch efectivo de 64 (64 × 1 con `--grad-accum-steps 1`), semilla 42 y scheduler coseno con LR de 5e-5 a 5e-6 y warmup de 1.000 pasos. El entrenamiento se llevó a cabo en una NVIDIA B200 entre el 27 y el 28 de noviembre de 2026 (hora KST), usando el código `tactile_base` en el commit `515e189`. La pérdida final de entrenamiento registrada se sitúa en 0.0002–0.0003 en los últimos cinco pasos logueados (hasta el paso 19950). Las estadísticas de normalización son idénticas a las del modelo base OpenVTLA.

## Capacidades

- Control robótico de inserción: genera secuencias de acciones de horizonte 50 para la tarea `insert_USB` a partir de observaciones visuales.
- Percepción visual multimodal: procesa simultáneamente cámara de cabeza y cámara de muñeca.
- Condicionamiento por prompt textual: acepta una instrucción en lenguaje natural junto con el estado del robot.
- Política de imitación entrenada con 100 demostraciones en simulación (GelSight Mini).
- Ablación controlada: sirve como línea base sin táctil frente al modelo OpenVTLA completo.
- Despliegue mediante servidor de políticas de `tactile_base` / openpi (`serve_policy.py`).
- No soporta tool calling, function calling, agentes multi-paso ni otras capacidades de propósito general: es una política especializada de una sola tarea.

## Casos de uso

- Evaluación de ablación táctil: ejecutar esta política junto con `yrpark/openvtla-insert_USB` sobre las mismas condiciones para medir la contribución de la señal táctil en la tasa de éxito de inserción (el modelo base reporta 24/100).
- Reproducción de experimentos: el checkpoint, las estadísticas de normalización y el log de entrenamiento permiten replicar el entrenamiento en `tactile_base` con el commit indicado.
- Investigación en VLA en simulación: usar la política como referencia "solo visión" en estudios comparativos de arquitecturas pi0.5 con y sin modalidad táctil.
- Desarrollo de pipelines de evaluación en simulador: el archivo de despliegue `policy/openpi/abs_joint/deploy_pi05_vision_insert_USB.yml` (con `send_tactile: false`) permite automatizar barridos de evaluación.
- Prototipado de control de manipulación: servir el modelo con `serve_policy.py` para integrarlo en un bucle de control simulado y estudiar latencia y estabilidad de las acciones generadas.
- Formación y docencia: ejemplo didáctico de cómo se construye una ablación rigurosa (mismos datos, modelo e hiperparámetros) en investigación de robótica con aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluación en simulador está pendiente según la model card; el modelo base OpenVTLA reporta 24/100 en la misma tarea, dato que sirve de referencia comparativa pero no constituye un resultado de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6.3 GB y el checkpoint se sirve en precisión de entrenamiento; no se documentan cuantizaciones.
- GPU de entrenamiento utilizada: 1× NVIDIA B200 (27–28 de noviembre de 2026, aproximadamente 11,5 horas).
- GPU del modelo base OpenVTLA: 1× RTX 3090 con batch 16 × 4 (batch efectivo 64).
- ¿Cabe en GPU de consumo? No confirmado para este checkpoint; el modelo base se entrenó en una RTX 3090, lo que sugiere que la inferencia es viable en GPUs de consumo con VRAM suficiente, pero no se aporta cifra concreta.
- Despliegue: servidor de políticas de `tactile_base`/openpi mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config pi05_vision_insert_USB --policy.dir checkpoints/pi05_vision_insert_USB/baseline/19999`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entrada táctil | Datos | Entrenamiento | Resultado simulación | Licencia |
|---|---|---|---|---|---|
| `yrpark/pi05-vision-insert_USB` (este) | No | `insert_USB_gelsight`, 100 demos | 20k pasos, batch efectivo 64, B200 | Pendiente | other |
| `yrpark/openvtla-insert_USB` | Sí (AnyTouch2) | `insert_USB_gelsight`, 100 demos | 20k pasos, batch efectivo 64, RTX 3090 | 24/100 | other |
| `pi05_base` (modelo base pi0.5) | No | No disponible | No disponible | No disponible | no disponible |

La comparación directa relevante es con `yrpark/openvtla-insert_USB`, del que este modelo es la ablación exacta: misma data, modelo e hiperparámetros, diferenciándose solo en la ausencia de tokens táctiles.

## Limitaciones y advertencias

- Es una política especializada en una única tarea (`insert_USB`) en simulación; no es un modelo de propósito general ni transferible sin reentrenamiento.
- Entrenado con solo 100 demostraciones y en simulación con GelSight Mini; el rendimiento en el mundo real no está validado.
- La evaluación en simulador está pendiente, por lo que no hay evidencia publicada de su tasa de éxito.
- No incorpora información táctil por diseño; en tareas de inserción con contacto físico esto puede degradar el rendimiento frente al modelo base.
- La licencia es "other": es necesario revisar los términos del autor antes de cualquier uso comercial.
- No se documentan sesgos, idiomas soportados, cuantizaciones ni límites de contexto; cualquier uso en producción requiere validación propia.
- El checkpoint no incluye `train_state/`, solo `params/` y `assets/`; no es reanudable para entrenamiento tal cual.
- La pérdida de entrenamiento muy baja (0.0002–0.0003) no implica buen rendimiento en evaluación; puede indicar sobreajuste a las 100 demostraciones.

## Enlaces

- Hugging Face: https://huggingface.co/yrpark/pi05-vision-insert_USB
- Modelo base OpenVTLA: https://huggingface.co/yrpark/openvtla-insert_USB
- Repositorio de código `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Conjunto de datos OpenViTac `insert_USB_gelsight`: FVL-Lab/OpenViTac, revisión `5fb2757b88826917242adefd9196424ef8cf2d98` (referenciado en la model card; no se proporciona URL directa)
- Documentación de la ablación: `docs/vision_baseline.md` (en el repositorio `tactile_base`)
