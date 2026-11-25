# tahamajs/qwen-2.5-0.5b-wgqa-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-wgqa-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el módulo `wgqa_attention` (Weighted Grouped-Query Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es tahamajs y el modelo se distribuye con licencia MIT. No es un modelo de propósito general nuevo, sino un banco de pruebas para medir el impacto de arquitecturas de atención subcuadráticas sobre un transformer causal pequeño.

El modelo conserva la topología del Qwen2.5-0.5B original (24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`), pero reemplaza 18 de las 24 capas de atención por WGQA y mantiene 6 capas de atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23]. Sobre esa estructura se aplica una destilación de conocimiento en dos etapas usando WikiText-2 como corpus de ajuste.

Su relevancia es doble: por un lado, demuestra que es posible recuperar calidad tras una cirugía agresiva de atención (la perplejidad baja de 35,45 a 11,85 en validación de WikiText-2); por otro, sirve como referencia reproducible para quien quiera evaluar variantes de atención en modelos pequeños antes de escalar a modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `WeightedGroupedQueryAttention` (WGQA) y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atención de 86,28 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B y aplica una cirugía de atención con patrón `hybrid_3_1`: por cada bloque de tres capas WGQA se conserva una capa de atención cuadrática completa como ancla. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales (`14` cabezas de consulta, `2` cabezas KV, `head_dim=64`, `hidden_size=896`) y realiza una expansión de cabezas KV de 7x cuando es necesario, respetando el contrato de `o_proj` único. El módulo WGQA añade pesos de importancia aprendibles por cabeza KV, junto con LoRA, caché KV y enmascaramiento causal; soporta además atención bidireccional, cross-attention, GQA nativo y RoPE.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin ajuste) arroja una perplejidad causal de 35,45. La etapa 1 (alineación con backbone congelado, `lm_head` omitido, MSE y coseno por capa con peso 0,25) dura 133 pasos (54,3 s). La etapa 2 (destilación de representaciones multicapa, MSE y coseno con peso 0,50) dura 307 pasos (125,9 s). En total, 440 pasos en 180,5 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15.660 MB en FP16 con parámetros maestros en FP32. La perplejidad final es 11,85 (delta de -23,60).

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de Qwen2.5-0.5B.
- Atención con enmascaramiento causal, bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del registro).
- Soporte nativo de GQA y RoPE en las capas WGQA.
- Caché KV compatible con generación incremental.
- Pesos de importancia por cabeza KV aprendibles (la innovación principal del módulo).
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo permite comparar directamente WGQA frente a atención cuadrática estándar sobre el mismo backbone y corpus, midiendo perplejidad antes y después de la destilación (35,45 frente a 11,85).
- Reproducción de experimentos de cirugía de atención: el patrón `hybrid_3_1` y los índices de capas ancla están documentados, lo que facilita replicar la topología en otros modelos Qwen.
- Validación de pipelines de destilación en dos etapas: los tiempos (54,3 s y 125,9 s) y la VRAM pico (15.660 MB) permiten estimar costes antes de escalar a modelos mayores.
- Prototipado de módulos de atención en entornos con recursos limitados: al ser un modelo de 0,5B, cabe en GPUs de consumo para pruebas rápidas de generación.
- Benchmarking de perplejidad en WikiText-2: útil como punto de referencia para comparar variantes de atención del registro NeuralOps.
- Integración en el ecosistema NeuralOps: la API `load_surgeried_model` permite cargar el checkpoint en una línea para experimentos de ablation.

## Benchmarks y rendimiento

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-wgqa-attention-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplexity | 11,85 |
| qwen-2.5-0.5b-wgqa-attention-wikitext2 (pre-KD, stage 0) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplexity | 35,45 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras tareas estándar. El único dato verificado es la perplejidad en WikiText-2, marcada como no verificada (`verified: false`) en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 15.660 MB en FP16 con estados de optimizador en FP32. Para inferencia en FP16 de un modelo de 0,5B se espera un consumo notablemente inferior, pero no se declara cifra concreta.
- GPU recomendadas: no disponible. El entrenamiento se realizó con FP16 autocast y parámetros maestros FP32, lo que sugiere una GPU con al menos 16 GB (por ejemplo, A100, H100 o RTX 4090) para reproducir el pipeline.
- GPU de consumo: no se confirma compatibilidad explícita; por tamaño (0,5B) es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` (API universal) o carga manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-wgqa-attention-wikitext2 | 0,5B | no disponible | 11,85 (val) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en esta ficha | no disponible | Apache 2.0 (según el modelo base; no confirmado en esta ficha) | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (según el repo NeuralOps) | Hugging Face |

No se dispone de datos de benchmarks comparables de otras variantes de atención del mismo registro en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para producción ni para uso general; su evaluación se limita a perplejidad en WikiText-2.
- Solo inglés: el campo `language` declara únicamente `en`.
- Corpus de ajuste restringido: la destilación se hace sobre WikiText-2, lo que puede introducir sesgos de dominio y afectar a la generalización fuera de ese corpus.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 0,5B, es esperable una fiabilidad limitada en tareas de razonamiento.
- Pesos parciales: el repositorio publica únicamente `attention_weights.safetensors`; es necesario cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía antes de cargar los pesos.
- Dependencia del código NeuralOps: la carga requiere `apply_qwen_attention_surgery` o `load_surgeried_model`, lo que añade una dependencia externa al pipeline.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe verificarse por separado.
- Sin datos de tool calling, agentes, visión ni audio: no se debe asumir ninguna de estas capacidades.
- Perplejidad marcada como no verificada en el model-index.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-wgqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
