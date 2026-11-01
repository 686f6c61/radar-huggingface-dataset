# wjwjwjwj/gr00t-n1.7-robotwin-adjust_bottle-cosmos-aug

## Resumen

GR00T N1.7-3B es un modelo visión-lenguaje-acción (VLA) desarrollado por NVIDIA para el control de robots manipuladores. Este repositorio concreto, publicado por el usuario `wjwjwjwj`, contiene un fine-tuning del checkpoint base `nvidia/GR00T-N1.7-3B` sobre la tarea `adjust_bottle` del benchmark de simulación RoboTwin 2.0. El modelo combina un backbone de razonamiento visión-lenguaje con una cabeza de acción basada en flow matching, lo que le permite generar trayectorias de control a partir de observaciones visuales e instrucciones en lenguaje natural.

La relevancia de esta ficha no reside en el modelo base, sino en el experimento de aumento de datos que documenta. El autor compara dos recetas de entrenamiento idénticas salvo en los datos: una con 50 demostraciones limpias (`baseline`) y otra que añade 138 escenas sintéticas generadas con NVIDIA Cosmos3-Nano-Sim-Transfer (`cosmos-aug`). La diferencia de éxito es notable: 73 %/52 % (Easy/Hard) frente a 99 %/97 %, respectivamente. El checkpoint publicado corresponde a la variante aumentada (EXP-018B).

Este es un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a quienes trabajan en sim-to-real, aumento de datos sintéticos y evaluación de políticas robóticas en RoboTwin 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone visión-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de acción DiT con flow matching |
| Parametros totales | 3B (según el nombre del modelo base; desglose exacto no disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (etiquetada como `other`) |
| Formato de pesos | safetensors (librería `cosmos`, repo de 13,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2-2B que permanece congelado durante el fine-tuning y una cabeza de acción basada en un transformer de difusión (DiT) entrenada con flow matching. La configuración de embodiment es `NEW_EMBODIMENT` con `robotwin_aloha_config.py`, que define 6 articulaciones de brazo en coordenadas relativas más pinza en absoluto por brazo, un horizonte de acción de 16 pasos y tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`).

El entrenamiento se realizó durante 10 000 pasos con batch global de 64 en 2 GPUs NVIDIA B300, guardando checkpoints cada 2500 pasos. El checkpoint liberado se seleccionó sobre una semilla de validación separada (Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 (licencia MIT) con 138 escenas generadas mediante Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares observación-acción.

## Capacidades

- Generación de acciones de control robótico de 16 pasos a partir de observaciones multicámara e instrucciones en lenguaje natural.
- Comprensión visión-lenguaje heredada del backbone Cosmos-Reason2-2B para interpretar escenas e instrucciones.
- Ejecución de la tarea de manipulación `adjust_bottle` (ajuste de botella) en el simulador RoboTwin 2.0.
- Generalización a escenas con domain randomization (evaluación Hard) gracias al aumento con datos sintéticos.
- Soporte de instrucciones no vistas durante el entrenamiento (evaluación con unseen instructions).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio.

## Casos de uso

- Investigación en sim-to-real: el checkpoint sirve como referencia para estudiar cómo el aumento de datos sintéticos con Cosmos3 mejora la robustez frente a domain randomization, pasando de 52 % a 97 % en escenas Hard.
- Evaluación de recetas de aumento de datos: permite reproducir el experimento EXP-018B y compararlo con EXP-019 (50 escenas generadas, 98 %/93 %) para aislar el efecto del volumen de datos sintéticos.
- Baseline para fine-tuning en RoboTwin 2.0: la configuración de embodiment `robotwin_aloha_config.py` y el horizonte de acción de 16 pasos sirven de plantilla para adaptar GR00T N1.7 a otras tareas del benchmark.
- Servidor de política para simulación: se integra con `eval_policy.py` de RoboTwin 2.0 mediante un GR00T policy server, ejecutando 8 pasos de acción por inferencia.
- Estudio de congelación del backbone: al mantener Cosmos-Reason2-2B congelado y entrenar solo la cabeza DiT, es útil para analizar el coste/beneficio de fine-tuning parcial en modelos VLA.
- Docencia y reproducción experimental: el log completo de experimentos en el repositorio de GitHub facilita replicar el pipeline con 2 GPUs B300 y 10 000 pasos.

## Benchmarks y rendimiento

Evaluación sobre RoboTwin 2.0, seed 0, 100 episodios por configuración, instrucciones no vistas:

| Checkpoint | Datos de entrenamiento | Easy (%) | Hard (%) | Experimento |
|---|---|---|---|---|
| `baseline/` | 50 demos limpias | 73 | 52 | EXP-008 |
| `cosmos-aug/` (publicado) | 50 limpias + 138 Cosmos3 | 99 | 97 | EXP-018B |
| Variante EXP-019 | 50 limpias + 50 generadas | 98 | 93 | EXP-019 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es específico de robótica y se evalúa mediante tasa de éxito en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 13,8 GB en safetensors, lo que sugiere que en precisión nativa requiere del orden de 14-16 GB, y bastante más para el servidor de política con cámaras y buffers.
- GPU de entrenamiento documentadas: 2 × NVIDIA B300 con batch global 64 durante 10 000 pasos.
- GPU recomendadas para inferencia: no disponible; por tamaño, cabría en GPUs de 24 GB o superiores, aunque no se confirma en la documentación.
- ¿Cabe en consumer GPU? No confirmado. Un modelo de 3B en safetensors de 13,8 GB no cabe en GPUs de 8-12 GB sin cuantización, y no se documentan formatos GGUF.
- Opciones de despliegue: servidor de política GR00T integrado con `eval_policy.py` de RoboTwin 2.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`cosmos-aug`) | 3B | no disponible | `adjust_bottle` RoboTwin 2.0 | NVIDIA Open Model License | HuggingFace, 0 descargas |
| `nvidia/GR00T-N1.7-3B` (base) | 3B | no disponible | VLA generalista | NVIDIA Open Model License | HuggingFace (NVIDIA) |
| Variante `baseline` (EXP-008) | 3B | no disponible | `adjust_bottle` RoboTwin 2.0 | NVIDIA Open Model License | No publicada como checkpoint separado en la información disponible |

No se dispone de datos de otros modelos VLA comparables (p. ej. OpenVLA, π0) en la información proporcionada; la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Especialización extrema: solo se ha evaluado en la tarea `adjust_bottle` de RoboTwin 2.0; no hay evidencia de transferencia a otros objetos, tareas o robots reales.
- Evaluación exclusivamente en simulación: los resultados (99 %/97 %) proceden del simulador, no de un robot físico; el salto sim-to-real no está medido.
- Sesgos: no documentados, pero al entrenar con 50 demostraciones limpias más escenas sintéticas de un único generador (Cosmos3), el modelo puede heredar sesgos visuales de ese pipeline.
- Riesgo de alucinación de acciones: como modelo generativo de trayectorias, puede producir comandos plausibles pero incorrectos en configuraciones fuera de distribución.
- Idiomas: no se especifican idiomas soportados; las instrucciones de evaluación son las de RoboTwin 2.0 y no se documenta cobertura multilingüe.
- Licencia: NVIDIA Open Model License, con términos específicos para uso comercial; es necesario revisar el acuerdo antes de desplegar en producción. Los datos sintéticos usan OpenMDW 1.1 y RoboTwin 2.0 es MIT.
- Artefacto de investigación: 0 descargas, 0 likes, sin mantenimiento conocido; no apto como dependencia de producción sin validación propia.
- Checkpoint seleccionado sobre una semilla de validación concreta (Hard, 50 episodios), lo que introduce riesgo de sobreajuste a esa partición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-adjust_bottle-cosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset asociado: https://huggingface.co/datasets/wjwjwjwj/robotwin-adjust_bottle-clean50-cosmos50-gr00t
- Código y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
