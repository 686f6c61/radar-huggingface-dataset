# wjwjwjwj/gr00t-n1.7-robotwin-rotate_qrcode-cosmos-aug

## Resumen

Este repositorio contiene dos checkpoints de **NVIDIA Isaac GR00T N1.7-3B** ajustados (fine-tuned) para la tarea `rotate_qrcode` del benchmark de robótica RoboTwin 2.0. El autor, el usuario de HuggingFace `wjwjwjwj`, entrena el modelo base de NVIDIA con dos conjuntos de datos distintos para comparar el efecto de la augmentación de datos sintéticos generada con NVIDIA Cosmos3: una línea base entrenada solo con 50 demostraciones limpias y una versión aumentada que añade 68 escenas generadas por Cosmos3-Nano-Sim-Transfer.

El interés principal de esta ficha no es el modelo en sí, sino el experimento que documenta: la augmentación con escenas sintéticas de Cosmos3 eleva la tasa de éxito de la tarea del 14 % al 49 % en escenas "Easy" y del 3 % al 13 % en escenas "Hard" (100 episodios de test cada una). Es un resultado relevante para la comunidad de VLA (Vision-Language-Action) porque demuestra de forma controlada que la generación de datos sintéticos puede mitigar la escasez de demostraciones reales en robótica.

Arquitecturalmente, GR00T N1.7-3B es un modelo VLA híbrido: un backbone vision-lenguaje (Cosmos-Reason2-2B, congelado durante el fine-tuning) combinado con una cabeza de acción basada en flow-matching DiT que se entrena. El checkpoint liberado (`cosmos-aug`, EXP-035) ocupa unos 13,8 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrido: backbone vision-lenguaje (Cosmos-Reason2-2B) + cabeza de acción flow-matching DiT |
| Parametros totales | 3B (heredado del modelo base GR00T N1.7-3B) |
| Parametros activos | no disponible (el backbone VLM está congelado; solo se entrena la cabeza de acción) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (derivative de nvidia/GR00T-N1.7-3B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Isaac GR00T N1.7-3B, un modelo fundacional de robótica de tipo VLA. Su backbone vision-lenguaje es Cosmos-Reason2-2B y permanece congelado durante el ajuste; solo se entrena la cabeza de acción, un modelo de difusión tipo DiT (Diffusion Transformer) que genera acciones mediante flow matching. La configuración de embodiment utilizada es `robotwin_aloha_config.py`, con un espacio de acción de 6 articulaciones relativas más gripper absoluto por brazo, un horizonte de acción de 16 pasos y tres cámaras: `cam_high`, `cam_left_wrist` y `cam_right_wrist`.

El entrenamiento consistió en 10.000 pasos con un batch global de 64 sobre 2 GPUs NVIDIA B300, con checkpoints cada 2.500 pasos. El checkpoint liberado se seleccionó usando una semilla de validación independiente en el escenario "Hard" (50 episodios). Los datos de entrenamiento de la versión liberada son 50 demostraciones limpias más 68 escenas sintéticas generadas con NVIDIA Cosmos3-Nano-Sim-Transfer (sim-to-real mediante augmentación de escenas). No se aplicó RLHF ni DPO; el entrenamiento es puramente por imitación de demostraciones.

## Capacidades

- Generación de políticas de acción para manipulación bimanual tipo ALOHA (RoboTwin): control de 6 articulaciones relativas más gripper absoluto por brazo.
- Predicción de horizontes de acción de 16 pasos con flow-matching DiT, ejecutando 8 pasos de acción por inferencia en la evaluación.
- Percepción multiview: procesa imágenes de tres cámaras (cenital alta, muñeca izquierda y muñeca derecha).
- Comprensión de instrucciones en lenguaje natural gracias al backbone vision-lenguaje Cosmos-Reason2-2B (evaluado con instrucciones no vistas, "unseen instructions").
- Capacidad especial demostrada: robustez mejorada ante variaciones de dominio (domain randomization) gracias a la augmentación con escenas sintéticas de Cosmos3.
- No es un modelo de lenguaje de propósito general: sus capacidades se limitan a la tarea `rotate_qrcode` para la que fue ajustado.

## Casos de uso

- Investigación en augmentación de datos sintéticos para VLA: el repositorio sirve como referencia reproducible (EXP-034 vs EXP-035) para estudiar cómo las escenas generadas con Cosmos3 mejoran la generalización sim-to-real; el código y el log completo están en GitHub.
- Benchmarking de políticas de manipulación: puede evaluarse directamente con `eval_policy.py` de RoboTwin 2.0 mediante un servidor de políticas GR00T, útil como baseline comparativo.
- Automatización de tareas de manipulación con códigos QR: la tarea entrenada (rotar un código QR) es representativa de escenarios industriales o logísticos donde un robot debe orientar objetos con marcadores visuales.
- Transferencia a robots ALOHA reales: la configuración de embodiment y las cámaras de muñeca siguen el estándar de RoboTwin/ALOHA, lo que facilita el despliegue en hardware compatible para validar sim-to-real.
- Punto de partida para fine-tuning en tareas adyacentes: partiendo de este checkpoint (o del base GR00T N1.7-3B) se pueden ajustar nuevas tareas de RoboTwin con la misma receta de augmentación.
- Estudio de selección de checkpoints: la metodología de validación en semilla separada con escenario "Hard" es un ejemplo práctico de selección de modelos en robótica con pocos episodios.

## Benchmarks y rendimiento

Datos publicados por el autor (RoboTwin 2.0, `eval_policy.py`, 8 pasos de acción por inferencia, instrucciones no vistas, seed 0, 100 episodios por escenario; tasas de éxito en %):

| Checkpoint | Datos de entrenamiento | Easy | Hard |
|---|---|---|---|
| baseline (EXP-034) | 50 demostraciones limpias | 14 | 3 |
| cosmos-aug (EXP-035) | 50 limpias + 68 escenas Cosmos3 | 49 | 13 |

La comparación muestra una mejora de +35 puntos porcentuales en Easy y +10 en Hard atribuible a la augmentación con Cosmos3. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) por tratarse de un modelo de robótica, no de lenguaje general.

## Requisitos de hardware

- Tamaño del repositorio: 13,8 GB (dos checkpoints en safetensors); para inferencia de un solo checkpoint se estima del orden de 7 GB de pesos, más overhead del backbone VLM.
- Entrenamiento: el autor usó 2 GPUs NVIDIA B300 con batch global 64; hardware de aceleración de gama datacenter es recomendable para reproducir el entrenamiento.
- Inferencia: no disponible una cifra oficial de VRAM; un modelo VLA de 3B en fp16/bf16 debería caber en GPUs de consumo de 24 GB (por ejemplo RTX 4090), aunque esto es una estimación no confirmada por el autor.
- Despliegue: la evaluación oficial usa un servidor de políticas GR00T junto a `eval_policy.py` de RoboTwin 2.0; no se mencionan soportes de vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible; solo se conoce que se ejecutan 8 pasos de acción por cada inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t-n1.7-robotwin-rotate_qrcode-cosmos-aug (este) | 3B (base) | VLA fine-tuned, tarea rotate_qrcode | Horizonte de acción 16 | NVIDIA Open Model License | Pesos públicos en HuggingFace |
| nvidia/GR00T-N1.7-3B (base) | 3B | VLA fundacional multi-embodiment | no disponible | NVIDIA Open Model License | Pesos públicos en HuggingFace |
| Otros VLAs de tamaño similar (p. ej. OpenVLA, π0) | ~3B–7B / no disponible | VLA generales | no disponible | Variadas (MIT, openrail, etc.) | Pesos públicos |

Nota: no hay datos comparativos de rendimiento directo con otros VLAs en esta tarea; la comparación cuantitativa relevante publicada es interna (baseline vs cosmos-aug).

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido ajustado para la tarea `rotate_qrcode` de RoboTwin 2.0; no es útil fuera de esa tarea ni de esa configuración de embodiment sin reentrenamiento.
- Tasas de éxito todavía moderadas: incluso el mejor checkpoint alcanza el 49 % en Easy y 13 % en Hard, insuficiente para producción sin mejoras adicionales.
- Evaluación en simulación: los resultados provienen del simulador RoboTwin 2.0; el rendimiento en hardware real (sim-to-real) no está cuantificado en la model card.
- Licencia: la NVIDIA Open Model License impone condiciones específicas (atribución, restricciones comerciales potenciales); conviene revisar el texto antes de uso comercial. Los datos de entrenamiento combinan RoboTwin 2.0 (MIT) y vídeos de Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1).
- Sesgos y alucinación: conceptos de LLM no aplican directamente, pero como todo VLA puede fallar ante instrucciones ambiguas u objetos/escenas fuera de distribución; la brecha Easy/Hard evidencia sensibilidad al domain shift.
- Repositorio con descargas 0 y un solo like: proyecto de investigación individual, sin soporte garantizado ni mantenimiento a largo plazo.
- Requiere infraestructura específica (servidor de políticas GR00T, configuración RoboTwin) para reproducir la evaluación.

## Enlaces

- Modelo: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-rotate_qrcode-cosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-rotate_qrcode-clean50-cosmos50-gr00t
- Código y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
