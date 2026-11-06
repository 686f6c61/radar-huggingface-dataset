# wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-cosmos-aug

## Resumen

El modelo `wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-cosmos-aug` es un ajuste fino de NVIDIA Isaac GR00T N1.7-3B sobre la tarea `move_can_pot` del benchmark de manipulacion robotica RoboTwin 2.0. Lo publica el usuario `wjwjwjwj` como parte de un experimento de aumento de datos sinteticos (EXP-031) que compara un entrenamiento con 50 demostraciones limpias frente al mismo conjunto ampliado con 71 escenas generadas por NVIDIA Cosmos3-Nano-Sim-Transfer. El checkpoint liberado corresponde a la variante aumentada.

La relevancia del modelo es metodologica: documenta de forma cuantitativa el impacto del aumento de datos sinteticos en una politica vision-language-action (VLA). Segun la model card, la tasa de exito pasa del 34 % al 41 % en escenas limpias (Easy) y del 0 % al 35 % en escenas con randomizacion de dominio (Hard), medidas sobre 100 episodios de test con semilla 0 e instrucciones no vistas. El salto en Hard es el resultado mas llamativo y sugiere una mejora sustancial de robustez sim-to-real.

Arquitectura y tamano: el backbone vision-language Cosmos-Reason2-2B permanece congelado y se entrena una cabeza de acciones DiT con flow matching, sobre un total de 3B parametros. El repositorio pesa 13.8 GB y se distribuye en formato safetensors bajo la NVIDIA Open Model License. No hay informacion publicada sobre idiomas soportados ni sobre el numero de tokens de contexto del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-language Cosmos-Reason2-2B (congelado) + cabeza de acciones DiT con flow matching |
| Parametros totales | 3B (GR00T N1.7-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el diseno de GR00T N1.7: un backbone vision-language Cosmos-Reason2-2B que se mantiene congelado y una cabeza de acciones basada en Diffusion Transformer (DiT) entrenada con flow matching. La embodiment utilizada es `NEW_EMBODIMENT` con la configuracion `robotwin_aloha_config.py` incluida en el repositorio: 6 articulaciones de brazo en coordenadas relativas mas gripper en absoluto por brazo, horizonte de accion de 16 pasos y tres camaras (cam_high, cam_left_wrist, cam_right_wrist).

El entrenamiento se realizo durante 10 000 pasos con batch global de 64 sobre 2 GPUs NVIDIA B300, guardando checkpoints cada 2500 pasos. El checkpoint liberado se selecciono sobre una semilla de validacion distinta (setting Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 (licencia MIT) con 71 escenas generadas por NVIDIA Cosmos3-Nano-Sim-Transfer (OpenMDW 1.1); el dataset publicado contiene un subconjunto de 50 escenas generadas, balanceado para que ambas variantes aparezcan por igual. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Control robotico de manipulacion bimanual: predice acciones de 6 articulaciones por brazo mas gripper a partir de observaciones visuales de tres camaras.
- Ejecucion de instrucciones en lenguaje natural no vistas durante el entrenamiento (evaluacion con unseen instructions).
- Politica de horizonte corto: genera 16 pasos de accion por inferencia, de los cuales se ejecutan 8 antes de volver a consultar al modelo.
- Robustez ante randomizacion de dominio: el ajuste con datos Cosmos mejora la tasa de exito en escenas Hard del 0 % al 35 %.
- Integracion con servidor de politica GR00T para su uso con el script `eval_policy.py` de RoboTwin 2.0.
- Capacidades de tool calling, agentes multi-paso, vision general, audio o modo thinking: no documentadas para este ajuste.

## Casos de uso

- Investigacion en sim-to-real para manipulacion robotica: el checkpoint permite reproducir el experimento EXP-031 y comparar directamente contra la variante baseline entrenada con los mismos hiperparametros.
- Aumento de datos sinteticos en pipelines de entrenamiento VLA: sirve como referencia de como 71 escenas generadas por Cosmos3 modifican la tasa de exito en dominios randomizados, util para disenar recetas de data augmentation.
- Evaluacion estandarizada en RoboTwin 2.0: al seguir la configuracion oficial de embodiment y el servidor de politica, se puede integrar en el arnes `eval_policy.py` con semilla 0 y 100 episodios por setting.
- Benchmarking de robustez frente a dominio: el par baseline/cosmos-aug permite medir la brecha Easy-Hard de una politica VLA concreta antes y despues del aumento.
- Desarrollo de tareas de pick-and-place bimanual: la tarea `move_can_pot` con tres camaras y control de gripper sirve de plantilla para adaptar el modelo a tareas similares en laboratorio.
- Docencia y divulgacion sobre VLA: el repositorio incluye configuracion, dataset y log de experimentos, lo que facilita explicar el flujo completo de ajuste fino de GR00T N1.7 sobre un benchmark abierto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre RoboTwin 2.0, 100 episodios por setting, semilla 0, instrucciones no vistas:

| Checkpoint | Datos de entrenamiento | Easy (%) | Hard (%) | Experimento |
|---|---|---|---|---|
| baseline | 50 demostraciones limpias | 34 | 0 | EXP-030 |
| cosmos-aug (liberado) | 50 limpias + 71 escenas Cosmos3 | 41 | 35 | EXP-031 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio pesa 13.8 GB en safetensors, lo que da una cota inferior aproximada de 14 GB en precision de almacenamiento.
- GPU de entrenamiento documentadas: 2 x NVIDIA B300 con batch global 64 durante 10 000 pasos.
- GPU recomendadas para inferencia: no disponible; por tamano (3B) es plausible en GPUs de 24 GB o superiores, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: servidor de politica GR00T integrado con `eval_policy.py` de RoboTwin 2.0; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Easy / Hard (RoboTwin move_can_pot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t-n1.7-robotwin-move_can_pot-cosmos-aug | 3B | no disponible | 41 % / 35 % | NVIDIA Open Model License | Hugging Face |
| gr00t-n1.7-robotwin-move_can_pot baseline (EXP-030) | 3B | no disponible | 34 % / 0 % | NVIDIA Open Model License | Referenciado en la model card, no enlazado |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente a la tarea `move_can_pot` de RoboTwin 2.0; no es un modelo generalista de robotica.
- La evaluacion se limita a 100 episodios por setting con semilla 0; no se reportan intervalos de confianza ni repeticiones con otras semillas.
- El resultado Hard del baseline es 0 %, lo que sugiere una alta sensibilidad al dominio y un posible sobreajuste a escenas limpias.
- Los datos sinteticos provienen de Cosmos3-Nano-Sim-Transfer; su calidad y sesgos no se analizan en la model card.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento fuera de la tarea entrenada.
- Idiomas soportados y longitud de contexto no disponibles; el uso queda restringido a instrucciones en el formato del benchmark.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; debe revisarse antes de desplegar en produccion.
- El autor tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados.
- El checkpoint se selecciono sobre una semilla de validacion Hard, lo que puede introducir un sesgo optimista en la metrica Hard reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-move_can_pot-cosmos-aug
- Dataset: https://huggingface.co/datasets/wjwjwjwj/robotwin-move_can_pot-clean50-cosmos50-gr00t
- Codigo y log de experimentos: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
