# VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16

## Resumen

Este repositorio contiene el componente **Thinker** del modelo `Qwen/Qwen3-Omni-30B-A3B-Instruct`, fine-tuneado con QLoRA sobre el dataset SLURP para clasificación de intenciones en lenguaje hablado (spoken language understanding) y fusionado de vuelta a bfloat16. El autor, VikramPal, lo publica como la rama de referencia bf16 para una campaña de cuantización: es el punto de partida para medir cualquier otra versión cuantizada y el checkpoint desde el que se puede cuantizar el modelo uno mismo.

El checkpoint elimina por completo las pilas Talker y code2wav (3.540.613.057 parámetros anulados), por lo que acepta audio, imágenes, vídeo y texto como entrada, pero **solo genera texto**: no hay decodificador de audio ni salida de voz. Con 31.719.205.488 parámetros en bf16 (59,08 GiB), requiere una GPU de 80 GiB para inferencia en una sola tarjeta. En el protocolo de test SLURP descrito por el autor alcanza un 86,80% de accuracy (434/500), frente al 79,40% (397/500) del checkpoint base sin fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, variante Thinker de Qwen3-Omni |
| Parametros totales | 31.719.205.488 (solo Thinker; el modelo Omni completo tiene 35.259.818.545) |
| Parametros activos | no disponible (el nombre A3B del modelo base sugiere ~3B activos, pero no se confirma para este checkpoint) |
| Longitud de contexto | no disponible (el modelo base Qwen3-Omni-30B-A3B-Instruct soporta 65K según documentación de vLLM, no confirmado para este fine-tune) |
| Tipos de cuantizacion | bf16 (este repo), 4-bit DynQuant (hermano, 14,77 GiB), 3-bit DynQuant (hermano, registra colapso) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una variante **MoE** del Qwen3-Omni-30B-A3B-Instruct, limitada al componente Thinker. Según la model card, el checkpoint contiene 96 bancos de expertos con 28.991.029.248 parámetros, lo que supone el 91,399% del total del Thinker. Los pesos están en bfloat16 y `tie_word_embeddings` es `false`: `embed_tokens` y `lm_head` son dos tensores separados de 152064x2048.

El fine-tune se realizó con **QLoRA** sobre el dataset `marcel-gohsen/slurp` (clasificación de intenciones en habla). El autor anuló las pilas Talker y code2wav antes del entrenamiento, de modo que el modelo resultante solo contiene los subconfigs `audio_config`, `text_config` y `vision_config` (no hay `talker_config`). El checkpoint se publica como referencia bf16 para una campaña de cuantización: el hermano 4-bit DynQuant alcanza un 86,20% y el 3-bit registra un colapso medido, por lo que no se recomienda su uso.

## Capacidades

- **Entrada multimodal**: acepta audio, imágenes, vídeo y texto (según la model card del autor).
- **Salida exclusivamente textual**: no hay decodificador de audio ni posibilidad de habilitarlo en este repositorio.
- **Clasificación de intenciones en habla (SLURP)**: fine-tune específico para spoken language understanding e intent classification, con accuracy del 86,80% en el protocolo de test descrito.
- **Razonamiento chain-of-thought**: al ser la variante Thinker del modelo base, conserva las capacidades mejoradas de razonamiento paso a paso del Qwen3-Omni-30B-A3B-Thinking.
- **Comprensión multimodal**: puede procesar entradas de audio, imagen y vídeo junto con instrucciones textuales, tal como indica la documentación del modelo base.
- **Sin soporte de tool calling confirmado**: no se menciona en la información disponible para este checkpoint.

## Casos de uso

- **Clasificación de intenciones en asistentes de voz**: el modelo puede recibir un clip de audio del usuario y devolver la intención correspondiente (por ejemplo, "encender la luz", "poner una alarma") como texto estructurado, gracias al fine-tune en SLURP. Es adecuado porque el SLURP cubre un amplio abanico de comandos domésticos y de productividad.
- **Análisis de sentimiento en llamadas de soporte**: dado un audio de una conversación, el modelo puede clasificar la actitud del cliente y generar un resumen textual, aprovechando la entrada de audio y la salida de texto.
- **Transcripción y etiquetado de intenciones en centros de contacto**: se puede integrar en un pipeline que reciba grabaciones, extraiga la intención de cada turno y alimente un CRM o sistema de tickets.
- **Prototipado de interfaces de voz**: al aceptar audio y devolver texto, sirve para validar flujos de conversación en entornos de desarrollo sin necesidad de un motor de síntesis de voz.
- **Evaluación de modelos de lenguaje hablado**: al ser una referencia bf16 con métricas publicadas, se puede usar como baseline para comparar cuantizaciones o fine-tunes posteriores en tareas de SLU.
- **Investigación en comprensión del habla**: el checkpoint permite estudiar el comportamiento del Thinker en tareas de intent classification sin la complejidad del decodificador de audio, aislándolo como componente de razonamiento.

## Benchmarks y rendimiento

El autor publica únicamente el resultado en el protocolo de test SLURP descrito en la model card (500 muestras). No se proporcionan otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | Accuracy SLURP (500 muestras) |
|---|---|
| Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16 (este repo) | **86,80%** (434/500) |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (base sin fine-tune) | 79,40% (397/500) |
| Hermano 4-bit DynQuant | 86,20% (según model card) |

## Requisitos de hardware

- **VRAM para inferencia en bf16**: los pesos ocupan 59,08 GiB, por lo que se necesita una GPU con 80 GiB (A100 80GB, H100, H200) para dejar ~20 GiB de margen para activaciones y KV cache en clips de longitud moderada.
- **GPUs de 48 GiB o 64 GiB**: no pueden alojar el modelo en una sola tarjeta; se debe usar `device_map="auto"` para fragmentar entre dos o más dispositivos.
- **Alternativa cuantizada**: el hermano 4-bit DynQuant ocupa 14,77 GiB de VRAM residente y cabe en una GPU de 24 GB (por ejemplo, RTX 4090), pero requiere `pip install dynquant` y llamar a `dynquant.register_hf_quantizer()` antes de cargar el modelo.
- **Opciones de despliegue**: transformers >= 5.0 (medido en 5.15.0 con torch 2.11+cu128); también se ha documentado el uso de vLLM-Omni en dos RTX 3090 para el modelo base, aunque no se confirma para este checkpoint.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Accuracy SLURP | Licencia |
|---|---|---|---|---|---|
| **VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16** (este repo) | 31,7B (Thinker) | no disponible | texto | 86,80% | apache-2.0 |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (base) | 35,3B (Omni completo) | 65K (según vLLM) | texto + habla | 79,40% | apache-2.0 |
| VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit | 31,7B (cuantizado 4-bit) | no disponible | texto | 86,20% | apache-2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de SLU en la información proporcionada.

## Limitaciones y advertencias

- **Sin salida de audio**: el Talker y code2wav fueron eliminados; el modelo solo genera texto. No se puede habilitar la respuesta hablada.
- **Requisito de versión**: necesita transformers >= 5.0. En transformers 4.x, el parámetro `dtype=` se ignora silenciosamente y el modelo carga en float32 (~127 GB), provocando OOM.
- **Carga explícita obligatoria**: `AutoModelForCausalLM` y `AutoModel` fallan con `ValueError: Unrecognized configuration class Qwen3OmniMoeThinkerConfig`. Hay que cargar `Qwen3OmniMoeThinkerForConditionalGeneration` o `AutoModelForImageTextToText`.
- **Riesgo de cuantización**: el hermano 3-bit DynQuant registra un colapso medido y no debe usarse como modelo.
- **Sesgos del modelo base**: al derivar de Qwen3-Omni, puede heredar sesgos de género, culturales o lingüísticos del entrenamiento original, no documentados en este repo.
- **Idioma**: el fine-tune está etiquetado solo en inglés; no se garantiza rendimiento en otros idiomas.
- **Alucinación**: como todo modelo de lenguaje, puede generar texto plausible pero incorrecto, especialmente en tareas de razonamiento abierto.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16)
- [Hermano 4-bit DynQuant](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit)
- [Hermano 3-bit DynQuant](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-3bit)
- [Adapter QLoRA](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-SLURP-QLoRA)
- [Modelo base Qwen/Qwen3-Omni-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct)
- [Repositorio GitHub de Qwen3-Omni](https://github.com/QwenLM/Qwen3-Omni)
- [Documentación de vLLM-Omni para Qwen3-Omni-30B-A3B](https://github.com/donwellsav/Ai3090/blob/master/models/qwen3-omni-30b-a3b/vllm-omni/README.md)
- [Dataset SLURP (marcel-gohsen/slurp)](https://huggingface.co/datasets/marcel-gohsen/slurp)
