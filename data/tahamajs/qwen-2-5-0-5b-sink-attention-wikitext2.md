# tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el módulo `SinkAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. La atención de tipo sink, inspirada en StreamingLLM, combina tokens sumidero (sink tokens) con una KV-cache deslizante que conserva los primeros `num_sink_tokens` y los últimos `window_size - num_sink_tokens`, manteniendo las posiciones absolutas para el enmascaramiento causal. El autor es `tahamajs`, responsable del repositorio NeuralOps, y la licencia es MIT.

El modelo no es un LLM de propósito general listo para producción, sino un artefacto de investigación sobre atención subcuadrática: el objetivo es evaluar si un transformer con atención híbrida (sink + capas cuadráticas de anclaje) puede recuperar la calidad del modelo original mediante destilación de conocimiento en dos etapas. El checkpoint solo contiene los pesos de atención (`attention_weights.safetensors`, 161,50 MB); es necesario reconstruir la arquitectura aplicando el *surgery* sobre el modelo base Qwen2.5-0.5B antes de cargar los tensores.

La relevancia actual radica en que cuantifica el coste de sustituir atención completa por atención con ventana y sumideros en un modelo pequeño: la perplejidad en WikiText-2 pasa de 618,03 (tras la cirugía, sin entrenamiento) a 49,65 tras 539 pasos de destilación en dos etapas, lo que demuestra que la recuperación es viable pero deja al modelo lejos de la calidad del Qwen2.5-0.5B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `SinkAttention` (streaming con sink tokens y KV-cache rodante) y 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el checkpoint distribuido contiene solo los pesos de atención, 161,50 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el módulo soporta ventana deslizante configurable; el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos en FP16 en el checkpoint; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con `head_dim=64`). Sobre esa base se aplica el patrón `hybrid_3_1`: cada bloque de tres capas usa `SinkAttention` y la cuarta conserva atención cuadrática completa, resultando en 18 capas transplantadas y 6 capas de anclaje. El `QwenAttentionAdapter` adapta las proyecciones originales al contrato del módulo, incluyendo una expansión 7x de las cabezas KV cuando es necesario y el contrato de `o_proj` único. `SinkAttention` soporta causalidad, bidireccionalidad, cross-attention, GQA y RoPE, y usa la secuencia completa de hidden states para Q mientras poda K/V a [primeros `num_sink_tokens`] ++ [últimos `window_size - num_sink_tokens`].

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, `lm_head` desactivado) usa MSE y coseno a nivel de capa con peso 0,25 y dura 163 pasos (54,3 s). La etapa 2 (destilación de representaciones multicapa) usa MSE y coseno con peso 0,50 y dura 376 pasos (125,8 s). En total, 539 pasos (180,3 s) con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 11.490 MB en FP16 con parámetros maestros en FP32. La perplejidad causal pasa de 618,03 (etapa 0, cero-shot tras la cirugía) a 49,65.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de Qwen2.5-0.5B y ajustada por destilación sobre WikiText-2.
- Atención con ventana deslizante y sink tokens: adecuada para flujos largos con memoria KV acotada, aunque el checkpoint no documenta una longitud de contexto efectiva.
- Soporte de GQA nativo y RoPE, lo que permite integrarse en pipelines de transformers estándar tras aplicar la cirugía.
- Compatible con el registro de atención de NeuralOps (`ATTENTION_REGISTRY`), lo que facilita experimentar con otras variantes de atención.
- Capacidades de tool calling, agentes, visión, audio o modo de razonamiento: no disponibles en este checkpoint.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre atención subcuadrática: servir de base reproducible para comparar `SinkAttention` frente a atención completa en un modelo de 0,5B, aplicando la cirugía y midiendo perplejidad en WikiText-2.
- Experimentación con StreamingLLM: validar el comportamiento de sink tokens y KV-cache rodante en generación de secuencias largas con memoria acotada.
- Destilación de conocimiento: usar el pipeline de dos etapas (alineación con backbone congelado y destilación multicapa) como referencia para transplantar otros módulos de atención en modelos pequeños.
- Prototipado de bajo coste: el checkpoint completo ocupa 0,2 GB y el pico de entrenamiento fue de 11,5 GB de VRAM, por lo que cabe en una GPU de consumo para pruebas de inferencia y ajuste ligero.
- Evaluación de recuperación tras cirugía: medir la brecha entre el modelo post-cirugía sin entrenar (PPL 618,03) y el destilado (PPL 49,65) para estudiar la robustez de la arquitectura híbrida.
- Docencia y divulgación: ejemplo didáctico de sustitución modular de atención con adaptadores y de telemetría de entrenamiento detallada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 49,65 |
| WikiText-2 (etapa 0, post-cirugía sin KD) | Perplejidad | 618,03 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,5B parámetros; en FP16 requiere aproximadamente 1 GB de pesos, más overhead de activaciones y KV-cache. El entrenamiento documentado usó un pico de 11.490 MB con FP16 autocast y maestros FP32.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP16; para el pipeline de destilación completo se necesitan al menos 12 GB (el autor reporta 11.490 MB de pico).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs con 8 GB para inferencia.
- Opciones de despliegue: `transformers` con `apply_qwen_attention_surgery` y carga manual de safetensors, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2` | 0,5B | no disponible | 49,65 | MIT | Hugging Face (solo pesos de atención) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas de atención eficiente en 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otras variantes de atención del mismo registro NeuralOps en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint contiene únicamente los pesos de atención; no es cargable directamente con `AutoModelForCausalLM.from_pretrained` sin aplicar antes la cirugía sobre Qwen2.5-0.5B.
- La perplejidad de 49,65 en WikiText-2 es notablemente superior a la del Qwen2.5-0.5B original, por lo que la calidad de generación es inferior; no es adecuado para producción sin evaluación adicional.
- Entrenado exclusivamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados y el riesgo de alucinación y de degradación fuera de dominio es alto.
- No se documenta la longitud de contexto efectiva ni el comportamiento de la ventana deslizante en inferencia más allá de `seq_len=512` en entrenamiento.
- Sesgos conocidos: no documentados, pero hereda los del corpus WikiText-2 y del modelo base.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0 que debe respetarse al redistribuir.
- No hay soporte documentado para cuantización GGUF, vLLM, llama.cpp ni Ollama; el despliegue está limitado al stack NeuralOps/transformers.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de StreamingLLM (referencia del diseño de sink attention): no disponible en la información proporcionada
