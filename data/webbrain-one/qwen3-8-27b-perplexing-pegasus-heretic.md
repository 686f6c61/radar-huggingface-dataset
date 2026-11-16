# webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic

## Resumen

Qwen3.8-27B-Perplexing-Pegasus-Heretic es un ajuste fino (finetune) del modelo multimodal AveLabs/Qwen3.8-27B-Perplexing-Pegasus, publicado por el usuario webbrain-one. Su rasgo distintivo es la aplicación de una técnica de "abliteración" o "decensurado" mediante la herramienta heretic-llm (variante ARA, Arbitrary-Rank Ablation), que reduce drásticamente la tasa de rechazos del modelo ante peticiones que el modelo original bloqueaba, preservando al mismo tiempo el chat conversacional, el razonamiento en modo `<think>`, la visión multimodal y el tool calling.

El modelo hereda la arquitectura de Qwen3.8-27B (etiquetada internamente como `qwen3_5` en los tags) y combina dos linajes: Qwen/Qwen3.8-27B como base y perplexity-ai/pplx-decider-v1-27b, del que incorpora un mecanismo de "typed-decision" o lectura de decisiones tipadas mediante logprobs sobre un conjunto cerrado de códigos. Además, conserva los 15 tensores de Multi-Token Prediction (MTP), lo que permite decodificación especulativa nativa en vLLM.

Con 27.356.728.560 parámetros totales (unos 27,36 mil millones) en BF16 y un repositorio de 55,6 GB, el modelo se posiciona en la franja de modelos densos de gran tamaño con capacidades multimodales. Es relevante para quienes necesitan un modelo con visión, razonamiento extendido y salidas estructuradas de decisión, pero sin las restricciones de rechazo del modelo original, siempre asumiendo la responsabilidad legal y ética de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (tag `qwen3_5`), con cabezal `lm_head` intacto y tensores MTP |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (según `--max-model-len 131072` en el ejemplo de vLLM) |
| Tipos de cuantizacion | BF16 (referencia); AutoRound W4A16 INT4 simétrico; NVFP4 + FP8 mixto; GGUF imatrix (`Q8_0` a `IQ3_XXS`, más split BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), además de variantes AutoRound, NVFP4 y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de 27,36 mil millones de parámetros, derivado de Qwen3.8-27B, con pipeline `image-text-to-text`, lo que implica un codificador visual acoplado al backbone de lenguaje. Sobre esa base, AveLabs/Qwen3.8-27B-Perplexing-Pegasus incorporó el mecanismo de typed-decision de perplexity-ai/pplx-decider-v1-27b: un conjunto de códigos de decisión con sus `token_ids` asociados y una temperatura configurable, leídos directamente de los logits del `lm_head` para producir distribuciones de probabilidad sobre opciones predefinidas. Este finetune Heretic conserva intactos el `lm_head` (similitud coseno media de 1,000001 respecto al original) y los 15 tensores `mtp.*` (restaurados en `model-mtp-restored.safetensors`), además de los artefactos `decision/` y la plantilla de chat `chat_template.jinja`.

El proceso de abliteración se realizó con heretic-llm en modo ARA (Arbitrary-Rank Ablation), con `lora_rank=50`, `preserve_row_magnitudes=true`, precisión BF16 completa (`quantization="none"`) y 150 ensayos de optimización Optuna TPE. El ganador del Pareto (ensayo 7) aplica la ablación entre las capas 16 y 52, con pesos `preserve_good_behavior_weight=0.8871`, `steer_bad_behavior_weight=0.0019`, `overcorrect_relative_weight=0.9689` y `neighbor_count=4`. El resultado medido: rechazos del clasificador de 102/104 en la base a 6/104 (5,77 %) en el modelo final, con divergencia KL de 0,0618 frente al Pegasus sin modificar sobre `mlabonne/harmless_alpaca`, y rechazos por keyword de 9/104 (8,65 %). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en las etapas previas del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento extendido mediante modo `<think>` (thinking mode), con parser de razonamiento `qwen3` en vLLM.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`, multimodal).
- Tool calling y function calling, con parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Salida estructurada de decisiones tipadas (typed-decision): distribución de probabilidad sobre un conjunto cerrado de códigos predefinidos, útil para clasificación y enrutamiento.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP), con `num_speculative_tokens` configurable.
- Capacidad de seguir instrucciones sin rechazos en la mayoría de sondas (0/8 rechazos con `enable_thinking=False` en la verificación del autor).
- No se documentan capacidades de audio ni de otros idiomas distintos del inglés.

## Casos de uso

- Enrutamiento y clasificación de peticiones: usando la lectura typed-decision, el modelo puede asignar una petición de usuario a una categoría predefinida (por ejemplo, tipo de incidencia o intención) leyendo la distribución de probabilidad sobre los códigos, lo que permite umbrales de confianza y abstención.
- Asistencia conversacional sin fricción: al reducir los rechazos a 6/104, resulta adecuado para entornos donde el modelo original bloqueaba consultas legítimas (ficción, seguridad, análisis de contenido sensible) y se requiere continuidad conversacional.
- Análisis de documentos con imágenes: al ser multimodal, puede procesar capturas, diagramas o formularios junto con texto para extraer información estructurada en pipelines de digitalización.
- Agentes con tool calling: la integración con `qwen3_coder` y el modo de razonamiento permiten construir agentes multi-paso que invocan funciones externas, consultan APIs y razonan sobre los resultados antes de responder.
- Razonamiento matemático y lógico con trazas: el modo `<think>` facilita tareas de resolución de problemas donde se necesita auditar el razonamiento intermedio, con contexto de hasta 131.072 tokens para problemas largos.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de abliteración con métricas publicadas (tasa de rechazo, KL, TVD), útil para estudiar el equilibrio entre supresión de rechazos y degradación de comportamiento.
- Despliegue en hardware heterogéneo: las variantes GGUF y AutoRound INT4 permiten ejecutar el modelo en CPU con offload, en GPUs Intel Arc Pro B70 de 32 GB o en GPUs NVIDIA con CUDA, ampliando los escenarios de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de verificación del proceso de abliteración:

| Metrica | Valor |
|---|---|
| Rechazos del clasificador (base Pegasus) | 102 / 104 |
| Rechazos del clasificador (Heretic) | 6 / 104 (5,77 %) |
| Rechazos por keyword (Heretic) | 9 / 104 (8,65 %) |
| Divergencia KL vs. Pegasus original | 0,0618 |
| Sondas de rechazo rechazadas (`enable_thinking=False`) | 0 / 8 |
| Acuerdo de decisión tipada vs. original (30 sondas) | 100,0 % (30/30) |
| Precisión de decisión tipada (original vs. Heretic) | 90,0 % → 90,0 % |
| Distancia de variación total media (probabilidades de opción) | 0,0192 |
| Distancia de variación total máxima | 0,1458 |

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- GPU recomendadas para BF16: H100, B200, RTX PRO 6000 (según el propio autor).
- Variante NVFP4: orientada a NVIDIA Blackwell (`sm_100` / `sm_120`) con vLLM y MTP.
- Variante AutoRound INT4 (W4A16): pensada para vLLM en Intel Arc Pro B70 (32 GB XPU) y GPUs NVIDIA CUDA; reduce el requisito de VRAM a aproximadamente 16-20 GB.
- Variante GGUF: permite offload a CPU y ejecución en hardware heterogéneo; las cuantizaciones `IQ3_XXS` reducen el peso a aproximadamente 12-15 GB, aptas para GPUs de consumo con suficiente VRAM o para CPU.
- Opciones de despliegue: vLLM (con `--speculative-config` para MTP), llama.cpp, LM Studio, Ollama y transformers (`AutoModelForImageTextToText`).
- Latencia y throughput: no disponibles en la información proporcionada; el uso de MTP con 3 tokens especulativos está pensado para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Perplexing-Pegasus-Heretic | 27,36 B | 131.072 | Apache-2.0 | Abliterado, multimodal, typed-decision, MTP |
| AveLabs/Qwen3.8-27B-Perplexing-Pegasus | 27,36 B (no confirmado) | No disponible | No disponible | Modelo base sin abliterar; rechazos 102/104 |
| perplexity-ai/pplx-decider-v1-27b | No disponible | No disponible | No disponible | Aporta el mecanismo de typed-decision |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible | Base original de la familia Qwen3.8 |

## Limitaciones y advertencias

- La abliteración elimina barreras de rechazo, pero no garantiza la corrección ni la seguridad del contenido generado; el autor declara que los usuarios son responsables de un despliegue seguro y legal.
- Riesgo de alucinación inherente a un modelo de 27 B sin benchmarks publicados que lo acoten; no hay datos de MMLU, HumanEval ni GSM8K en la información disponible.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- La divergencia KL de 0,0618 y la TVD máxima de 0,1458 indican que la abliteración introduce cambios medibles en el comportamiento, aunque la precisión de decisión tipada se mantiene en el 90 %.
- El contexto de 131.072 tokens es el configurado en el ejemplo de vLLM; no se confirma si es el máximo nativo del modelo base.
- Aunque la licencia es Apache-2.0, el uso comercial debe respetar las licencias de los modelos upstream (Qwen y perplexity-ai), cuyos términos no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- El modelo está etiquetado como `uncensored` y `decensored`; su uso en productos dirigidos al público requiere filtros adicionales y revisión legal.

## Enlaces

- Hugging Face: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Modelo base: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus
- Modelo upstream (decider): https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo upstream (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Variante AutoRound INT4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4
- Variante NVFP4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4
- Variante GGUF: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Clasificador de rechazos usado en la evaluación: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
