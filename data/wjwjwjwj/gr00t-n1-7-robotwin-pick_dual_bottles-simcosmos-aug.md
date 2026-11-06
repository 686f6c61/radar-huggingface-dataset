# wjwjwjwj/gr00t-n1.7-robotwin-pick_dual_bottles-simcosmos-aug

## Resumen

GR00T N1.7-3B es un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por NVIDIA para el control de robots manipuladores. Este checkpoint concreto es un ajuste fino realizado por el usuario `wjwjwjwj` sobre la variante de 3B de parámetros, especializado en la tarea `pick_dual_bottles` del benchmark de simulación RoboTwin 2.0. El modelo parte de la arquitectura GR00T N1.7, que combina un backbone de visión-lenguaje con una cabeza de acción basada en flow matching.

La contribución principal de este checkpoint no es arquitectónica sino metodológica: demuestra que la aumentación de datos sintéticos generados con el simulador Cosmos3-Nano-Sim-Transfer mejora de forma sustancial la tasa de éxito en tareas de manipulación bimanual. Según la model card, el ajuste fino con datos aumentados (pipeline v3 "simcomp") eleva la tasa de éxito del 20% (entrenamiento con datos limpios) al 52% en escenarios fáciles y del 3% al 32% en escenarios difíciles, con significación estadística reportada mediante test de McNemar.

El modelo es relevante para investigadores en robótica que trabajen en transferencia sim-to-real, aumentación de datos para políticas VLA y evaluación reproducible en RoboTwin 2.0. Su licencia derivada de NVIDIA Open Model License condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de acción DiT con flow matching |
| Parametros totales | 3B (según nombre del modelo base; desglose no disponible) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone es un modelo de visión-lenguaje; idiomas no especificados) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Biblioteca | cosmos |
| Tamaño del repositorio | 6,9 GB |
| Horizonte de acción | 16 pasos |
| Configuración de embodiment | `NEW_EMBODIMENT` con `robotwin_aloha_config.py`: 6 articulaciones de brazo relativas + pinza absoluta por brazo |
| Cámaras de entrada | cam_high, cam_left_wrist, cam_right_wrist |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone de visión-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino, acoplado a una cabeza de acción basada en Diffusion Transformer (DiT) entrenada con flow matching. La cabeza genera secuencias de acciones de horizonte 16 a partir de observaciones multimodales (tres cámaras) e instrucciones en lenguaje natural.

El ajuste fino se realizó durante 10.000 pasos con batch global de 64 sobre 2 GPUs NVIDIA B300, guardando checkpoints cada 2.500 pasos. El checkpoint liberado es el paso 7.500, seleccionado sobre una semilla de validación separada (escenario Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 con aumentación sintética generada por el pipeline Cosmos3 (conjunto `clean50-simcosmos68`). No se especifica en la información disponible si hubo RLHF, DPO ni el número total de tokens de entrenamiento.

## Capacidades

- Control de manipulación robótica bimanual: genera acciones de 6 articulaciones por brazo más pinza a partir de observaciones de tres cámaras.
- Comprensión de instrucciones en lenguaje natural para guiar la política de acción (evaluación con instrucciones no vistas).
- Procesamiento multimodal: integra visión (cámara superior y dos cámaras de muñeca) con texto.
- Generalización a instrucciones no vistas en el mismo dominio de tarea, según la evaluación reportada.
- Ejecución de políticas en servidor GR00T con 8 pasos de acción ejecutados por inferencia.
- Aumentación de datos sim-to-real: el modelo sirve como evidencia de que la aumentación con Cosmos3 mejora la robustez en simulación.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, matemáticas, código, audio ni modo thinking.

## Casos de uso

- Investigación en manipulación bimanual: el modelo sirve como punto de partida para experimentos de agarre y recogida de objetos duales en RoboTwin 2.0, con una receta de entrenamiento reproducible y métricas de referencia publicadas.
- Aumentación de datos sintéticos para políticas VLA: permite comparar el efecto de pipelines de aumentación (Cosmos3 v1 frente a v3 simcomp) sobre la tasa de éxito, con deltas medidos y test estadístico reportado.
- Evaluación sim-to-real: al entrenarse en simulación con datos aumentados, es adecuado para estudiar la brecha entre entornos simulados y reales antes de desplegar en hardware físico.
- Baseline para ajuste fino en nuevas tareas de RoboTwin: la configuración de embodiment (`robotwin_aloha_config.py`) y el horizonte de acción de 16 facilitan adaptar el modelo a otras tareas del benchmark.
- Servidor de políticas en pipelines de evaluación: se integra con `eval_policy.py` de RoboTwin 2.0 mediante un servidor GR00T, lo que permite automatizar barridos de evaluación con semillas y episodios configurables.
- Estudio de selección de checkpoints: el checkpoint liberado (paso 7.500) fue elegido sobre una semilla de validación separada, lo que lo convierte en un caso práctico para investigar estrategias de selección de modelo en políticas de robot.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre RoboTwin 2.0, 100 episodios por escenario, semilla 0, instrucciones no vistas:

| Configuración de entrenamiento | Easy (%) | Hard (%) |
|---|---|---|
| Datos limpios, 50 demos (baseline) | 20 | 3 |
| Limpio 50 + aumentación Cosmos3 (v1) | 37 | 18 |
| Limpio 50 + v3 simcomp (este checkpoint) | 52 | 32 |

Comparación de este checkpoint frente a v1 sobre las mismas 100 escenas (test de McNemar): Easy +15 puntos (p=0,036), Hard +18 puntos (p=0,002).

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 6,9 GB en safetensors, lo que sugiere que la inferencia en precisión completa requiere del orden de 7-8 GB solo para pesos, más memoria para activaciones y el backbone de visión.
- GPU de entrenamiento utilizadas: 2 × NVIDIA B300 según la model card.
- GPU recomendadas para inferencia: no especificadas en la información disponible; por tamaño (3B), cabría esperar GPUs de gama alta con suficiente VRAM, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: servidor de políticas GR00T integrado con `eval_policy.py` de RoboTwin 2.0; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito Easy/Hard (RoboTwin 2.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (v3 simcomp) | 3B | no disponible | 52 / 32 | NVIDIA Open Model License | Hugging Face |
| v1 Cosmos aug (mismo autor) | 3B | no disponible | 37 / 18 | NVIDIA Open Model License | Hugging Face |
| Baseline datos limpios | 3B | no disponible | 20 / 3 | NVIDIA Open Model License | Hugging Face |
| Otros VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros modelos VLA de la misma categoría (por ejemplo, variantes de OpenVLA u otros checkpoints de GR00T).

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado únicamente para la tarea `pick_dual_bottles` de RoboTwin 2.0; no es un modelo generalista de manipulación.
- Evaluación exclusivamente en simulación: los resultados reportados provienen de RoboTwin 2.0 con semilla 0; no se documenta validación en robot físico ni transferencia sim-to-real real.
- Selección de checkpoint sobre una única semilla de validación (Hard, 50 episodios), lo que puede introducir sobreajuste a esa partición.
- Sesgos y alucinaciones: no documentados en la información disponible; al ser un modelo de acción, el riesgo principal es la ejecución de políticas incorrectas en escenarios fuera de distribución.
- Idiomas: no especificados; las instrucciones de evaluación son las del benchmark RoboTwin 2.0.
- Licencia: NVIDIA Open Model License, derivada de GR00T N1.7; es necesario revisar sus términos para uso comercial y redistribución.
- Datos de entrenamiento con licencias mixtas: RoboTwin 2.0 (MIT) y vídeos generados con Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1), lo que puede condicionar la redistribución del modelo derivado.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación independiente.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-pick_dual_bottles-simcosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint v1 de comparación: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-pick_dual_bottles-cosmos-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-pick_dual_bottles-clean50-simcosmos68-gr00t
- Código y registro del experimento: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
