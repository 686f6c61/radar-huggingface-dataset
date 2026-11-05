# wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-simcosmos-aug

## Resumen

GR00T N1.7 RobotWin shake_bottle SimCosmos Aug es un ajuste fino del modelo fundacional de robótica NVIDIA Isaac GR00T N1.7-3B, publicado por el usuario wjwjwjwj. El modelo está especializado en la tarea de manipulación `shake_bottle` (agitar una botella) del benchmark RoboTwin 2.0, sobre una configuración de embodiment ALOHA de doble brazo. Se trata de un modelo visión-lenguaje-acción (VLA) que combina un backbone de razonamiento visión-lenguaje con una cabeza de acción basada en flow matching.

La relevancia de este checkpoint reside en su receta de aumento de datos: parte de 50 demostraciones limpias y añade datos sintéticos generados con el pipeline Cosmos3-Nano-Sim-Transfer (variante v9comp), lo que eleva la tasa de éxito del 86 % al 98 % en escenarios fáciles y del 63 % al 94 % en escenarios difíciles respecto al baseline entrenado solo con datos limpios. El resultado es un caso de estudio concreto de sim-to-real y data augmentation aplicado a políticas robóticas.

El modelo tiene 3B parámetros en su base, se distribuye en formato safetensors (6,9 GB de repositorio) y hereda la licencia NVIDIA Open Model License. No es un modelo de propósito general: es un artefacto de investigación orientado a la evaluación en simulación dentro de RoboTwin 2.0 y a la experimentación con recetas de aumento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone visión-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de acción DiT con flow matching |
| Parametros totales | 3B (modelo base GR00T-N1.7-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7: un backbone visión-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino y una cabeza de acción basada en Diffusion Transformer (DiT) entrenada con flow matching. La cabeza genera secuencias de acciones con un horizonte de 16 pasos. La configuración de embodiment es `NEW_EMBODIMENT` definida en `robotwin_aloha_config.py`, con 6 articulaciones de brazo en coordenadas relativas más gripper absoluto por brazo, y tres cámaras: `cam_high`, `cam_left_wrist` y `cam_right_wrist`.

El entrenamiento se realizó durante 10 000 pasos con batch global de 64 sobre 2 GPU NVIDIA B300, guardando checkpoints cada 2 500 pasos. El checkpoint publicado es el 7 500, seleccionado sobre una semilla de validación separada (escenario Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 (licencia MIT) con aumentos sintéticos generados mediante NVIDIA Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1), en la variante denominada v9comp. El dataset resultante está publicado como `wjwjwjwj/robotwin-shake_bottle-clean50-simcosmos68-gr00t`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Control robótico de manipulación bimanual para la tarea `shake_bottle` sobre el embodiment ALOHA de RoboTwin 2.0.
- Generación de acciones de 16 pasos por inferencia, con ejecución de 8 pasos de acción por llamada al servidor de política durante la evaluación.
- Percepción multimodal con tres vistas de cámara (alta y dos muñecas).
- Seguimiento de instrucciones en lenguaje natural, evaluado con instrucciones no vistas durante el entrenamiento.
- Generalización a escenarios fáciles y difíciles del benchmark mediante aumento de datos sintéticos.
- Integración con el servidor de políticas de GR00T y el script `eval_policy.py` de RoboTwin 2.0.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito más allá del backbone VLM subyacente.

## Casos de uso

- Evaluación de recetas de aumento de datos en robótica: sirve como referencia reproducible para medir cuánto mejora el éxito de una política al añadir datos sintéticos de Cosmos3 frente a datos limpios, con deltas medidos y prueba de McNemar incluida.
- Investigación en sim-to-real: el modelo permite estudiar la transferencia de políticas entrenadas en simulación con datos aumentados antes de desplegar en hardware real.
- Benchmarking de políticas VLA: se puede usar como checkpoint de referencia en RoboTwin 2.0 para comparar nuevas arquitecturas o estrategias de entrenamiento bajo el mismo protocolo (semilla 0, 100 episodios, instrucciones no vistas).
- Prototipado de pipelines de manipulación bimanual: la configuración ALOHA con tres cámaras y horizonte de 16 acciones sirve de plantilla para tareas de agarre y manipulación con dos brazos.
- Estudio de selección de checkpoints: el proceso de elegir el paso 7 500 sobre una semilla de validación separada es un ejemplo práctico de metodología de evaluación para políticas robóticas.
- Reproducción de experimentos: junto con el repositorio de recetas y el dataset publicado, permite reproducir el experimento EXP-093 de principio a fin.

## Benchmarks y rendimiento

Tasa de éxito (%) sobre 100 episodios de test en RoboTwin 2.0, semilla 0, instrucciones no vistas:

| Datos de entrenamiento | Easy | Hard | Experimento |
|---|---|---|---|
| Clean 50 (baseline) | 86 | 63 | v1 model repo |
| Clean 50 + Cosmos3 augmentation (v1) | 97 | 85 | v1 model repo |
| Clean 50 + v9comp (este checkpoint) | 98 | 94 | EXP-093 |

La comparación de este checkpoint frente a v1 sobre las mismas 100 escenas mediante prueba de McNemar arroja una mejora de +9 puntos en Hard con p = 0,049. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 6,9 GB en safetensors, lo que da una referencia mínima del orden de 7 GB solo para pesos en precisión de almacenamiento.
- GPU recomendadas: el entrenamiento se realizó en 2 GPU NVIDIA B300; para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no documentada; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: servidor de políticas de GR00T integrado con `eval_policy.py` de RoboTwin 2.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito (Hard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (v9comp) | 3B | no disponible | 94 % | NVIDIA Open Model License | HuggingFace |
| GR00T N1.7 RobotWin shake_bottle v1 (Cosmos3 aug) | 3B | no disponible | 85 % | NVIDIA Open Model License | HuggingFace |
| GR00T N1.7 RobotWin shake_bottle baseline (clean 50) | 3B | no disponible | 63 % | NVIDIA Open Model License | HuggingFace |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | no disponible | NVIDIA Open Model License | HuggingFace |

## Limitaciones y advertencias

- Modelo especializado en una única tarea (`shake_bottle`) y un único embodiment (ALOHA de RoboTwin 2.0); no es un modelo de propósito general.
- Las métricas proceden exclusivamente de simulación en RoboTwin 2.0; no hay evidencia publicada de transferencia a hardware real.
- El tamaño de la evaluación es de 100 episodios por escenario con una sola semilla (seed 0), lo que limita la significancia estadística; la mejora en Hard frente a v1 tiene p = 0,049, en el límite de significación.
- El checkpoint se seleccionó sobre una semilla de validación separada, pero no se documenta una evaluación independiente adicional más allá de la reportada.
- No se documentan sesgos conocidos, riesgos de alucinación en el sentido de modelos de lenguaje, ni limitaciones idiomáticas, al no ser un modelo de texto general.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar sus términos antes de cualquier despliegue productivo.
- Los datos de aumento sintético provienen de Cosmos3-Nano-Sim-Transfer bajo OpenMDW 1.1, con posibles restricciones adicionales derivadas de esa licencia.
- No hay información sobre cuantizaciones soportadas, latencia ni requisitos de VRAM, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-simcosmos-aug
- Modelo v1 de referencia: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-shake_bottle-cosmos-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-shake_bottle-clean50-simcosmos68-gr00t
- Repositorio de código y registro de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
