# wjwjwjwj/gr00t-n1.7-robotwin-adjust_bottle-simcosmos-aug

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo fundacional de robotica NVIDIA Isaac GR00T N1.7-3B, un modelo vision-language-action (VLA) de 3.000 millones de parametros desarrollado por NVIDIA para control de robots. El autor del ajuste es el usuario `wjwjwjwj`, que lo especializa en la tarea `adjust_bottle` del benchmark de simulacion RoboTwin 2.0, un escenario de manipulacion bimanual con un robot ALOHA.

El modelo resuelve un problema concreto de sim-to-real y aumento de datos: parte de 50 demostraciones limpias y anade datos sinteticos generados con el pipeline Cosmos3-Nano-Sim-Transfer de NVIDIA, consiguiendo elevar la tasa de exito del 73 % (baseline limpio) al 95 % en la variante dificil del benchmark. La relevancia radica en que demuestra que el aumento de datos generativo con modelos de mundo (Cosmos) puede reducir drasticamente la brecha de rendimiento en politicas roboticas con pocos datos reales.

Arquitectonicamente es un modelo hibrido: un backbone vision-language Cosmos-Reason2-2B congelado y una cabeza de accion basada en flow-matching DiT (Diffusion Transformer) entrenada. El contexto de accion es de horizonte 16, con 6 articulaciones de brazo relativas mas pinza absoluta por brazo, y tres camaras (cam_high, cam_left_wrist, cam_right_wrist).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA hibrida: backbone vision-language Cosmos-Reason2-2B (congelado) + cabeza de accion flow-matching DiT |
| Parametros totales | 3.000 millones (modelo base GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7-3B: un backbone vision-language Cosmos-Reason2-2B que permanece congelado durante el ajuste fino, y una cabeza de accion basada en flow-matching con arquitectura DiT (Diffusion Transformer) que es la unica parte entrenada. El embodiment utilizado es `NEW_EMBODIMENT` con la configuracion `robotwin_aloha_config.py`, que define 6 articulaciones de brazo relativas mas pinza absoluta por brazo, un horizonte de accion de 16 pasos y tres camaras (cam_high, cam_left_wrist, cam_right_wrist).

El entrenamiento se realizo durante 10.000 pasos con batch global de 64 sobre 2 GPUs NVIDIA B300, con checkpoints cada 2.500 pasos. El checkpoint liberado (checkpoint-10000) se selecciono sobre una semilla de validacion separada (variante Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 con 68 muestras sinteticas generadas por el pipeline Cosmos3-Nano-Sim-Transfer (variante v9comp), publicadas en el dataset `wjwjwjwj/robotwin-adjust_bottle-clean50-simcosmos68-gr00t`. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre demostraciones y datos sinteticos.

## Capacidades

- Control de robot bimanual tipo ALOHA para la tarea de manipulacion `adjust_bottle` (ajuste de botella).
- Prediccion de acciones continuas de 6 articulaciones por brazo mas pinza, con horizonte de 16 pasos.
- Fusion multimodal de tres vistas de camara (alta y munecas izquierda/derecha) con instrucciones en lenguaje natural.
- Generalizacion a instrucciones no vistas (evaluado explicitamente con unseen instructions).
- Aumento de datos sim-to-real mediante datos sinteticos generados con Cosmos3.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking mas alla del uso como politica robotica.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Manipulacion robotica bimanual en simulacion: el modelo actua como politica en RoboTwin 2.0 ejecutando 8 pasos de accion por inferencia, adecuado para prototipado rapido de tareas de ensamblaje y ajuste.
- Investigacion en sim-to-real: sirve como referencia reproducible de como el aumento de datos con modelos de mundo (Cosmos3) mejora la robustez frente a un baseline con datos limpios (73 % a 95 % en Hard).
- Generacion de datos sinteticos para entrenamiento: el pipeline v9comp documentado permite replicar la receta de aumento sobre otras tareas de RoboTwin.
- Benchmarking de politicas VLA: util como checkpoint de comparacion para nuevas tecnicas de aumento de datos o arquitecturas de cabeza de accion.
- Despliegue en servidor de politica: se integra con `eval_policy.py` de RoboTwin mediante un servidor de politica GR00T, util para evaluacion automatizada en pipelines de CI.
- Docencia y divulgacion: ejemplo completo de fine-tuning de un VLA de 3B con backbone congelado y cabeza DiT entrenada, con receta y log de experimentos publicos.

## Benchmarks y rendimiento

Evaluacion en RoboTwin 2.0 `adjust_bottle`, seed 0, 100 episodios por configuracion, instrucciones no vistas, 8 pasos de accion por inferencia:

| Configuracion de entrenamiento | Easy (%) | Hard (%) |
|---|---|---|
| Clean 50 (baseline) | 73 | 52 |
| Clean 50 + Cosmos3 augmentation (v1) | 99 | 97 |
| Clean 50 + v9comp (este checkpoint) | 95 | 95 |

Comparacion estadistica frente a v1 sobre las mismas 100 escenas (McNemar): Easy −4 puntos (p=0,22), Hard −2 puntos (p=0,69), es decir, dentro del ruido estadistico respecto a v1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo ocupa 6,9 GB en safetensors, lo que sugiere que en precision completa (bf16/fp16) requeriria del orden de 6-7 GB solo para pesos, mas memoria para el backbone visual y buffers de atencion.
- GPU recomendadas: el entrenamiento se realizo en 2x NVIDIA B300; para inferencia no se documentan requisitos especificos.
- Cabe en GPU consumer: no confirmado; por tamano de pesos (3B) es plausible en GPUs de 16-24 GB, pero no hay dato oficial.
- Opciones de despliegue: servidor de politica GR00T integrado con `eval_policy.py` de RoboTwin; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de accion).
- Latencia y throughput: no disponibles; la evaluacion ejecuta 8 pasos de accion por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (RoboTwin adjust_bottle) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (v9comp) | 3B | no disponible | Easy 95 / Hard 95 | NVIDIA Open Model License | HuggingFace |
| v1 (cosmos-aug) | 3B | no disponible | Easy 99 / Hard 97 | NVIDIA Open Model License | HuggingFace |
| Baseline clean 50 | 3B | no disponible | Easy 73 / Hard 52 | NVIDIA Open Model License | HuggingFace |
| GR00T N1.7-3B base | 3B | no disponible | no disponible | NVIDIA Open Model License | HuggingFace (nvidia) |

## Limitaciones y advertencias

- Especializado exclusivamente en la tarea `adjust_bottle` de RoboTwin 2.0; no es un modelo generalista.
- El rendimiento es ligeramente inferior a v1 (Easy 95 vs 99, Hard 95 vs 97), aunque la diferencia no es estadisticamente significativa.
- Evaluado solo en simulacion (RoboTwin 2.0); no hay validacion en robot real documentada.
- Riesgo de sobreajuste al embodiment ALOHA y a la configuracion de camaras especifica.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion en la generacion de acciones no cuantificado.
- Licencia NVIDIA Open Model License: revisar condiciones para uso comercial y redistribucion antes de produccion.
- Los datos sinteticos de aumento derivan de Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1) y RoboTwin 2.0 (MIT); verificar compatibilidad de licencias en uso derivado.
- Sin descargas ni likes en el momento de la consulta; modelo de investigacion, no validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-adjust_bottle-simcosmos-aug
- Modelo v1 de referencia: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-adjust_bottle-cosmos-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-adjust_bottle-clean50-simcosmos68-gr00t
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Codigo y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
