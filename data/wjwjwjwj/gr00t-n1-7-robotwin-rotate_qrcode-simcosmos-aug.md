# wjwjwjwj/gr00t-n1.7-robotwin-rotate_qrcode-simcosmos-aug

## Resumen

GR00T N1.7-3B es un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por NVIDIA para robótica generalista. El checkpoint aquí documentado es un ajuste fino del modelo base `nvidia/GR00T-N1.7-3B` realizado por el usuario `wjwjwjwj` sobre la tarea `rotate_qrcode` del benchmark de simulación RoboTwin 2.0, incorporando un pipeline de aumento de datos sintéticos generados con NVIDIA Cosmos3-Nano-Sim-Transfer. El objetivo es mejorar la transferencia sim-to-real en manipulación robótica mediante datos de entrenamiento aumentados con vídeo sintético fotorrealista.

El modelo mantiene la arquitectura del GR00T N1.7 original: un backbone visión-lenguaje congelado (Cosmos-Reason2-2B) acoplado a una cabeza de acción basada en flow-matching con arquitectura DiT (Diffusion Transformer). El ajuste entrena únicamente la cabeza de acción sobre un nuevo embodiment (`NEW_EMBODIMENT`) con configuración `robotwin_aloha_config.py`, que define acciones de 6 articulaciones relativas por brazo más gripper absoluto, horizonte de acción de 16 pasos y tres cámaras (cam_high, cam_left_wrist, cam_right_wrist).

La relevancia de este checkpoint es empírica: el autor reporta que el aumento con vídeo sintético Cosmos3 eleva la tasa de éxito en RoboTwin 2.0 del 14% (baseline limpio) al 56% en escenarios fáciles y del 3% al 36% en escenarios difíciles, sobre 100 episodios de test con instrucciones no vistas. El modelo se distribuye con licencia NVIDIA Open Model License y un tamaño de repositorio de 6,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone visión-lenguaje Cosmos-Reason2-2B (congelado) + cabeza de acción flow-matching DiT |
| Parámetros totales | 3B (modelo base GR00T N1.7-3B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (librería: cosmos) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7: un backbone de visión-lenguaje Cosmos-Reason2-2B que permanece congelado durante el ajuste fino, y una cabeza de acción entrenable basada en flow-matching con arquitectura DiT (Diffusion Transformer). La cabeza genera secuencias de acciones con un horizonte de 16 pasos. El embodiment utilizado es `NEW_EMBODIMENT` con la configuración `robotwin_aloha_config.py`, que define 6 articulaciones de brazo relativas más gripper absoluto por brazo, y consume tres cámaras: cam_high, cam_left_wrist y cam_right_wrist.

El entrenamiento se realizó durante 10.000 pasos con batch global de 64 sobre 2 GPUs NVIDIA B300, guardando checkpoints cada 2.500 pasos. El checkpoint liberado es `checkpoint-10000`, seleccionado sobre una semilla de validación separada (escenario Hard, 50 episodios). Los datos de entrenamiento combinan 50 demostraciones limpias de RoboTwin 2.0 con un conjunto aumentado (`v9clut`) de vídeo sintético generado mediante NVIDIA Cosmos3-Nano-Sim-Transfer. El dataset está publicado como `wjwjwjwj/robotwin-rotate_qrcode-clean50-simcosmos68-gr00t`. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset más allá de esta descripción.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 articulaciones por brazo más gripper para la tarea `rotate_qrcode` en un entorno Aloha simulado.
- Percepción multi-cámara: procesa simultáneamente vistas de cam_high, cam_left_wrist y cam_right_wrist.
- Comprensión de instrucciones en lenguaje natural: el backbone visión-lenguaje permite condicionar la política de acción a instrucciones textuales (evaluado con instrucciones no vistas).
- Generación de trayectorias con horizonte de 16 pasos mediante flow-matching.
- Transferencia sim-to-real asistida por aumento de datos sintéticos (Cosmos3).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo general ni modos de razonamiento explícito; el modelo está especializado en robótica.

## Casos de uso

- Investigación en manipulación robótica simulada: servir como checkpoint de referencia para reproducir el experimento EXP-087 en RoboTwin 2.0 y comparar recetas de aumento de datos.
- Aumento de datos con vídeo sintético: evaluar el impacto de Cosmos3-Nano-Sim-Transfer en la tasa de éxito de políticas VLA, replicando la comparativa baseline (14%/3%) frente a aumentado (56%/36%).
- Desarrollo de pipelines sim-to-real: usar el modelo como punto de partida para transferir políticas entrenadas en simulación a robots físicos con configuración Aloha.
- Benchmarking de políticas VLA: emplear el modelo como baseline en la tarea `rotate_qrcode` con el script `eval_policy.py` de RoboTwin 2.0 y un servidor de política GR00T.
- Estudio de generalización a instrucciones no vistas: el checkpoint está evaluado con instrucciones no vistas, lo que permite analizar robustez ante variaciones lingüísticas.
- Ajuste fino sobre nuevos embodiments: la configuración `robotwin_aloha_config.py` sirve de plantilla para adaptar el modelo a otras morfologías de robot con 6 articulaciones por brazo.
- Reproducibilidad de recetas de entrenamiento: el código y el registro completo del experimento están publicados en el repositorio de GitHub del autor.

## Benchmarks y rendimiento

Evaluación en RoboTwin 2.0, `eval_policy.py` con servidor de política GR00T, 8 pasos de acción ejecutados por inferencia, instrucciones no vistas, semilla 0, 100 episodios por configuración. Tasa de éxito en porcentaje:

| Datos de entrenamiento | Easy (%) | Hard (%) | Experimento |
|---|---|---|---|
| Clean 50 (baseline) | 14 | 3 | modelo v1 |
| Clean 50 + aumento Cosmos3 (v1) | 49 | 13 | modelo v1 |
| Clean 50 + v9clut (este checkpoint) | 56 | 36 | EXP-087 |

El autor reporta que la mejora del checkpoint actual frente a v1 en los mismos 100 escenarios es de +24 puntos en Hard (prueba de McNemar, p<0,001). No se han publicado en la información disponible resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 3B parámetros y el repositorio ocupa 6,9 GB en safetensors.
- GPUs de entrenamiento utilizadas: 2x NVIDIA B300 (según la model card).
- GPU recomendadas para inferencia: no especificadas en la información disponible; por tamaño (3B), cabría esperar viabilidad en GPUs consumer de gama alta, pero no se confirma en la documentación.
- Despliegue: servidor de política GR00T integrado con `eval_policy.py` de RoboTwin 2.0. No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de éxito (Easy/Hard) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 + v9clut) | 3B | no disponible | 56% / 36% | NVIDIA Open Model License | Hugging Face |
| GR00T N1.7 RoboTwin clean 50 (v1 baseline) | 3B | no disponible | 14% / 3% | NVIDIA Open Model License | Hugging Face |
| GR00T N1.7 RoboTwin + Cosmos3 (v1) | 3B | no disponible | 49% / 13% | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.7-3B (base) | 3B | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

No se dispone en la información proporcionada de comparativas con otros modelos VLA de la misma categoría (por ejemplo, OpenVLA, π0 u otros) en la tarea `rotate_qrcode`.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está ajustado exclusivamente para la tarea `rotate_qrcode` en RoboTwin 2.0 con configuración Aloha; no es un modelo generalista fuera de ese dominio.
- Evaluación únicamente en simulación: no se reportan resultados en robot físico; la transferencia sim-to-real no está validada empíricamente en la información disponible.
- Dependencia de datos sintéticos: parte del rendimiento se atribuye a vídeo generado con Cosmos3-Nano-Sim-Transfer, lo que introduce posibles sesgos del generador en la distribución de entrenamiento.
- Riesgo de alucinación en el backbone visión-lenguaje: aunque congelado, el componente Cosmos-Reason2-2B puede producir representaciones erróneas ante escenas fuera de distribución.
- Idiomas no documentados: no se especifican los idiomas soportados por el backbone.
- Restricciones de licencia: la NVIDIA Open Model License impone condiciones de uso comercial; debe revisarse el acuerdo completo antes de un despliegue productivo.
- Procedencia de datos: RoboTwin 2.0 es MIT y los vídeos Cosmos3 están bajo OpenMDW 1.1; es necesario verificar compatibilidad en usos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- Selección de checkpoint sobre validación Hard (50 episodios): posible sobreajuste a esa semilla de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-rotate_qrcode-simcosmos-aug
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint v1 de referencia: https://huggingface.co/wjwjwjwj/gr00t-n1.7-robotwin-rotate_qrcode-cosmos-aug
- Dataset de entrenamiento: https://huggingface.co/datasets/wjwjwjwj/robotwin-rotate_qrcode-clean50-simcosmos68-gr00t
- Código y registro del experimento: https://github.com/nota-github/xpu-gr00t-aug-recipe
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
