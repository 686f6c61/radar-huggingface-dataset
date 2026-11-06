# wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-cosmos-aug

## Resumen

El modelo `wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-cosmos-aug` es un ajuste fino (fine-tuning) de NVIDIA Isaac GR00T N1.7-3B, un modelo de vision-lenguaje-accion (VLA) orientado a robótica, sobre la tarea `shake_bottle` del benchmark RoboTwin 2.0. Lo publica el usuario `wjwjwjwj` como artefacto de un experimento reproducible que compara dos recetas de entrenamiento idénticas salvo en los datos: una con 50 demostraciones limpias (checkpoint `baseline/`) y otra con esas 50 más 50 escenas sintéticas generadas con NVIDIA Cosmos3 (checkpoint `cosmos-aug/`, que es el que da nombre al repositorio).

El interés del artefacto no está en la arquitectura, heredada íntegramente del modelo base, sino en la evidencia empírica sobre aumentación de datos con modelos generativos: según la model card, la versión aumentada eleva la tasa de éxito del 86 % al 97 % en escenas limpias (Easy) y del 63 % al 85 % en escenas con domain randomization (Hard), sobre 100 episodios de test con instrucciones no vistas y semilla 0. Es, por tanto, material relevante para quien investigue sim-to-real y generación de datos sintéticos para políticas robóticas.

El repositorio ocupa 13,8 GB y contiene los pesos en formato safetensors, con licencia NVIDIA Open Model License. No hay información sobre idiomas soportados ni sobre parámetros más allá de los 3B que indica el nombre del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone vision-lenguaje Cosmos-Reason2-2B congelado + cabeza de acción DiT con flow matching |
| Parametros totales | 3B (según el nombre del modelo base, `nvidia/GR00T-N1.7-3B`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7-3B: un backbone vision-lenguaje Cosmos-Reason2-2B que permanece congelado y una cabeza de acción basada en un transformer de difusión (DiT) entrenada con flow matching. La embodiment utilizada es `NEW_EMBODIMENT` con la configuración `robotwin_aloha_config.py` incluida en el repositorio: 6 articulaciones de brazo en coordenadas relativas más gripper absoluto por brazo, horizonte de acción de 16 pasos y tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`).

El entrenamiento se realizó durante 10 000 pasos con batch global de 64 sobre 2 GPU NVIDIA B300, guardando checkpoints cada 2500 pasos. El checkpoint publicado se seleccionó sobre una semilla de validación separada (setting Hard, 50 episodios), no sobre el conjunto de test. La diferencia entre las dos variantes es exclusivamente el dataset: `baseline` usa 50 demostraciones limpias de RoboTwin 2.0 y `cosmos-aug` añade 50 escenas generadas con NVIDIA Cosmos3-Nano-Sim-Transfer. El dataset está publicado como `wjwjwjwj/robotwin-shake_bottle-clean50-cosmos50-gr00t`. No se especifica el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO, algo esperable en un ajuste fino de política robótica.

## Capacidades

- Control robótico visomotor: genera acciones de 16 pasos a partir de observaciones de tres cámaras y una instrucción en lenguaje natural.
- Manipulación bimanual sobre el robot ALOHA de RoboTwin 2.0: 6 articulaciones por brazo más gripper.
- Ejecución de la tarea específica `shake_bottle` (agitar un frasco), incluyendo instrucciones no vistas durante el entrenamiento.
- Robustez a domain randomization: el checkpoint `cosmos-aug` está entrenado con escenas sintéticas para mejorar en entornos con variaciones visuales.
- Seguimiento de instrucciones en lenguaje natural heredado del backbone Cosmos-Reason2-2B.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, audio ni otras modalidades fuera de visión y acción.

## Casos de uso

- Investigación en sim-to-real: usar el checkpoint `cosmos-aug` como referencia de hasta qué punto la aumentación con Cosmos3 reduce la brecha entre escenas limpias y escenas con domain randomization (85 % frente a 63 % en Hard).
- Reproducción de experimentos de aumentación de datos: el repositorio incluye el dataset y el log completo en GitHub, lo que permite replicar la receta EXP-036/EXP-037 y comparar con otras técnicas de generación de datos.
- Punto de partida para nuevas tareas en RoboTwin 2.0: la configuración `robotwin_aloha_config.py` sirve como plantilla de embodiment para ajustar GR00T N1.7 a otras tareas de manipulación bimanual.
- Evaluación de políticas VLA en entornos estandarizados: integrar el modelo en `eval_policy.py` de RoboTwin 2.0 con un servidor de política GR00T para medir tasas de éxito de forma reproducible.
- Estudio de selección de checkpoints: el modelo documenta la selección sobre una semilla de validación separada, útil como ejemplo metodológico para evitar fuga de información del test.
- Despliegue en laboratorio con hardware NVIDIA de gama alta: servir la política desde un servidor GR00T y ejecutar 8 pasos de acción por inferencia sobre el robot real o simulado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre RoboTwin 2.0, tarea `shake_bottle`, instrucciones no vistas, semilla 0, 100 episodios por ajuste. Easy = escenas limpias; Hard = escenas con domain randomization.

| Checkpoint | Datos de entrenamiento | Easy (%) | Hard (%) | Experimento |
|---|---|---|---|---|
| `baseline/` | 50 demostraciones limpias | 86 | 63 | EXP-036 |
| `cosmos-aug/` | 50 limpias + 50 escenas Cosmos3 | 97 | 85 | EXP-037 |

No se han publicado resultados de benchmarks genéricos (MMLU, HumanEval, GSM8K) en la información disponible, algo coherente con un modelo de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 13,8 GB en safetensors, lo que da una cota inferior orientativa en FP16/BF16.
- GPU de entrenamiento documentadas: 2 × NVIDIA B300 con batch global 64 durante 10 000 pasos.
- GPU recomendadas para inferencia: no disponibles; por tamaño (3B) podría caber en GPUs de consumo con suficiente VRAM, pero no hay confirmación en la información proporcionada.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue: servidor de política GR00T integrado con `eval_policy.py` de RoboTwin 2.0; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluación ejecuta 8 pasos de acción por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-cosmos-aug` | 3B | no disponible | Manipulación bimanual `shake_bottle` en RoboTwin 2.0 | NVIDIA Open Model License | Hugging Face (0 descargas) |
| `nvidia/GR00T-N1.7-3B` | 3B | no disponible | VLA generalista para robótica | NVIDIA Open Model License | Hugging Face (modelo base) |
| Checkpoint `baseline/` del mismo autor | 3B | no disponible | Misma tarea, sin aumentación | NVIDIA Open Model License | Incluido en el mismo repositorio |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha evaluado en la tarea `shake_bottle` de RoboTwin 2.0; no hay evidencia de generalización a otras tareas.
- Sesgos: no documentados; al entrenarse con un dataset reducido (50 demostraciones limpias más 50 sintéticas) puede heredar sesgos de las escenas generadas por Cosmos3.
- Riesgo de alucinación: no evaluado en el contexto de políticas robóticas; el riesgo se traduce en acciones incorrectas o inseguras en el robot.
- Idiomas: no se especifica qué idiomas soporta el backbone para las instrucciones.
- Licencia: NVIDIA Open Model License, con condiciones específicas para uso comercial; es necesario revisar el acuerdo antes de desplegarlo en producción.
- Datos de entrenamiento con licencias mixtas: RoboTwin 2.0 (MIT) y vídeos generados con Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1).
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria; el checkpoint se seleccionó sobre validación, pero los resultados de test provienen de una única semilla.
- No hay información sobre cuantizaciones, por lo que el despliegue en hardware limitado requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-cosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-shake_bottle-clean50-cosmos50-gr00t
- Código y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
