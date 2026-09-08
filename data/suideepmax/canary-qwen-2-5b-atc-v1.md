# suideepmax/canary-qwen-2.5b-atc-v1

## Resumen

El modelo `suideepmax/canary-qwen-2.5b-atc-v1` es un fine-tuning con LoRA del modelo `nvidia/canary-qwen-2.5b`, especializado en reconocimiento de voz (ASR) para el dominio de control de tráfico aéreo (ATC). Lo desarrolla el autor `suideepmax` como parte de una investigación de reproducibilidad en el repositorio `Pilot-to-ATC-Research`. El problema que resuelve es la transcripción de comunicaciones piloto-torre, un escenario con vocabulario técnico y condiciones acústicas particulares.

Este checkpoint es la versión v1 de una comparativa entre tres configuraciones: LoRA sin regularización (este modelo), LoRA con regularización (v3) y un modelo con capas descongeladas (`unfrozen`). Su relevancia radica en que reproduce casi exactamente el valor histórico de WER del 23.32% citado en la literatura, lo que sirve como referencia para validar experimentos previos. La arquitectura es un SALM (Speech Audio Language Model) de NeMo basado en Qwen2.5, con un tamaño total de parámetros no especificado explícitamente, aunque el adaptador LoRA entrena 27.8 millones de parámetros (0.97% del modelo). La longitud de contexto no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SALM (Speech Audio Language Model) sobre Qwen2.5, con adaptador LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (archivo `consolidated_model.pt` de NeMo) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/canary-qwen-2.5b`, un modelo de ASR de NVIDIA basado en la familia Qwen2.5, y se adapta mediante LoRA (Low-Rank Adaptation) sobre las proyecciones `q_proj` y `v_proj` del transformer. El adaptador utiliza r=128, alpha=256 y dropout=0.01, sin regularización adicional (sin SpecAugment y con weight_decay=1e-3). El entrenamiento se realizó con el corpus UWB-ATCC de comunicaciones ATC del aeropuerto de Praga, compuesto por 11,543 muestras de entrenamiento y 2,886 de test.

El proceso de entrenamiento empleó 10,000 pasos con una tasa de aprendizaje de 5e-4 y warmup de 1,000 pasos, usando estrategia FSDP en 4 GPUs RTX 2080 Ti con precisión fp16-true. El framework fue NVIDIA NeMo 2.8.0rc0. El tiempo de entrenamiento verificado fue de aproximadamente 21 horas, según la model card. La innovación técnica principal es la aplicación de LoRA sobre un modelo de lenguaje y audio para un dominio especializado, en lugar de un fine-tuning completo.

## Capacidades

- Reconocimiento de voz (ASR) en inglés para el dominio de control de tráfico aéreo.
- Transcripción de comunicaciones piloto-torre, incluyendo vocabulario técnico de aviación.
- Soporta prompts con audio mediante el `audio_locator_tag` del modelo base, permitiendo instrucciones como "Transcribe the following: ...".
- Generación de texto condicionada a audio (speech-to-text), no es un modelo de lenguaje general.
- No soporta tool calling, function calling, visión, ni modos de razonamiento explícitos.
- No es multilingüe: está entrenado únicamente en inglés (corpus UWB-ATCC).
- No incluye modos de pensamiento (thinking mode) ni capacidades de audio adicionales más allá de la transcripción.

## Casos de uso

- Transcripción en tiempo real de comunicaciones piloto-torre: el modelo puede procesar grabaciones de radio y convertirlas en texto para sistemas de monitorización en torres de control, gracias a su adaptación al dominio ATC.
- Análisis de grabaciones históricas: permite transcribir archivos de audio antiguos para investigar incidentes, estudiar fraseología o generar datos etiquetados para otros sistemas.
- Entrenamiento de asistentes para controladores: las transcripciones generadas pueden alimentar modelos de lenguaje que resuman o extraigan información operativa de las comunicaciones.
- Generación de corpus anotados: el modelo produce transcripciones que pueden usarse como ground truth para entrenar otros modelos de ASR o NLP en el dominio aeronáutico.
- Investigación en reproducibilidad: sirve como baseline reproducible para comparar configuraciones de fine-tuning (v1 vs v3 vs unfrozen) en el repositorio `Pilot-to-ATC-Research`.
- Evaluación de técnicas de adaptación de bajo rango: permite estudiar el impacto de la regularización en LoRA para ASR especializado, comparando WER entre versiones.

## Benchmarks y rendimiento

La model card incluye resultados de WER (Word Error Rate) sobre el conjunto de test de UWB-ATCC:

| Modelo | Params entrenados | WER |
|---|---|---|
| Canary-Qwen (zero-shot) | 0 | 81.49% |
| **Canary-Qwen (LoRA, sin regularización — este checkpoint)** | **27.8M (0.97%)** | **23.32%** |
| Canary-Qwen (LoRA + regularización, v3) | 27.8M (0.97%) | 20.70% |
| W2V2 Large (sin LM) | 317M (100%) | 14.54% |
| W2V2 Large (con KenLM) | 317M (100%) | 12.69% |

El modelo v1 reproduce el valor histórico de 23.32% de WER. El modelo v3 (regularizado) lo supera con un 20.70%, y los modelos W2V2 Large, aunque con mejor WER, son modelos completos entrenados desde cero, no adaptaciones LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio tiene un tamaño de 5.9 GB, lo que sugiere pesos en fp16 (~2.9B parámetros × 2 bytes ≈ 5.8 GB). Para cargar el modelo en fp16 se recomienda una GPU con al menos 8 GB de VRAM, considerando overhead de activaciones y el framework NeMo.
- GPU recomendadas: una RTX 2080 Ti (11 GB) es suficiente para inferencia, ya que el entrenamiento usó 4 de estas GPUs. También son adecuadas RTX 3080/4090 o A100.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 8-12 GB de VRAM, siempre que se use fp16. No hay cuantizaciones publicadas para reducir más el tamaño.
- Opciones de despliegue: el modelo está diseñado para NeMo (código de ejemplo en la model card). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Params entrenados | WER | Licencia | Disponibilidad |
|---|---|---|---|---|
| `suideepmax/canary-qwen-2.5b-atc-v1` (este) | 27.8M (LoRA) | 23.32% | cc-by-4.0 | HuggingFace |
| `suideepmax/canary-qwen-2.5b-atc-lora` (v3 regularizado) | 27.8M (LoRA) | 20.70% | cc-by-4.0 | HuggingFace |
| `nvidia/canary-qwen-2.5b` (zero-shot) | 0 | 81.49% | cc-by-4.0 (según base) | HuggingFace |
| W2V2 Large (sin LM) | 317M (100%) | 14.54% | no disponible | no disponible en este contexto |

El modelo v1 es un baseline de investigación; el v3 es la versión recomendada por el autor por su mejor WER. W2V2 Large logra el mejor rendimiento, pero requiere entrenar todos los parámetros y no es una adaptación de bajo rango.

## Limitaciones y advertencias

- Solo está entrenado en inglés y en el corpus UWB-ATCC (aeropuerto de Praga), por lo que puede degradarse con otros acentos, idiomas o fraseologías ATC.
- Al no aplicar regularización adicional, existe riesgo de sobreajuste al corpus específico, lo que se refleja en el WER superior al modelo v3.
- Puede producir alucinaciones en palabras fuera del vocabulario ATC o en condiciones de ruido no representadas en el entrenamiento.
- No se han publicado resultados de benchmarks en otros dominios de voz ni en condiciones de ruido reales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base `nvidia/canary-qwen-2.5b` puede tener condiciones adicionales no documentadas en esta ficha.
- No hay cuantizaciones disponibles, lo que limita el despliegue en dispositivos con poca memoria.
- El autor indica que el modelo v3 (regularizado) supera a este v1, por lo que este checkpoint es principalmente un baseline de investigación.

## Enlaces

- HuggingFace: [https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-v1](https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-v1)
- Modelo base: [https://huggingface.co/nvidia/canary-qwen-2.5b](https://huggingface.co/nvidia/canary-qwen-2.5b)
- Repositorio de investigación: [https://github.com/suideepmax/Pilot-to-ATC-Research](https://github.com/suideepmax/Pilot-to-ATC-Research)
- Modelo v3 regularizado: [https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-lora](https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-lora)
- Modelo unfrozen: [https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-unfrozen](https://huggingface.co/suideepmax/canary-qwen-2.5b-atc-unfrozen)
