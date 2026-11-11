# tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por el módulo `unified_rope` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No es un modelo nuevo entrenado desde cero, sino una intervención sobre la arquitectura de atención de un modelo base ya existente, seguida de un proceso de destilación de conocimiento en dos etapas para recuperar la calidad perdida tras la operación.

El modelo forma parte de lo que el autor denomina "Qwen Attention Zoo": una colección de checkpoints que exploran variantes de atención subcuadrática sobre la misma base Qwen2.5-0.5B. En este caso concreto, el patrón aplicado es `hybrid_3_1`, que reemplaza 18 de las 24 capas de atención con `unified_rope` y conserva 6 capas de atención cuadrática completa como anclas. El resultado se evalúa mediante perplejidad en WikiText-2, obteniendo 15.14 en validación tras la destilación (frente a 17.57 inmediatamente después de la cirugía, sin destilación).

Es relevante para investigadores interesados en técnicas de sustitución modular de atención, destilación de representaciones internas y evaluación controlada de variantes arquitectónicas sobre modelos pequeños. Su licencia MIT y su tamaño reducido (0.2 GB de repo) facilitan la experimentación, pero conviene subrayar que se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `unified_rope` y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0.5B (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se declara explícitamente en la información proporcionada; el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors FP16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 161.50 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only Qwen2 de 0.5B parámetros, con 24 capas, 14 cabezas de query, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esta base se aplica una "cirugía" que sustituye los bloques de atención según el patrón `hybrid_3_1`: 18 capas se reemplazan por el módulo `UnifiedRoPE` (soporta causal, bidireccional, cross-attention, GQA nativo y RoPE), y 6 capas se mantienen con atención cuadrática completa como anclas. El adaptador `QwenAttentionAdapter` gestiona la expansión de cabezas KV (14:2 con expansión 7x donde sea necesario) y respeta el contrato de `o_proj` único.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (baseline post-cirugía, sin destilar) arroja una perplejidad causal de 17.57. La etapa 1 (alineación con backbone congelado) ejecuta 130 pasos en 54.3 s, omitiendo `lm_head` y usando MSE + coseno sobre estados ocultos por capa (peso 0.25). La etapa 2 (destilación de representaciones multicapa) ejecuta 299 pasos en 125.8 s con MSE + coseno (peso 0.50). En total: 429 pasos, 180.4 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y 16 250 MB de VRAM pico en FP16 autocast con parámetros maestros en FP32. La perplejidad final es 15.14, una mejora de −2.43 respecto al baseline post-cirugía.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- El módulo `unified_rope` soporta además atención bidireccional y cross-attention a nivel de módulo, aunque el checkpoint se distribuye como modelo causal de generación.
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo "thinking", visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como referencia reproducible para comparar `unified_rope` frente a atención cuadrática estándar en un modelo de 0.5B, con perplejidad medida en WikiText-2 y telemetría de entrenamiento detallada.
- Estudio de destilación de representaciones: las dos etapas (alineación con backbone congelado y destilación multicapa) y sus hiperparámetros (MSE + coseno, pesos 0.25/0.50) son un caso práctico para investigar recuperación de calidad tras modificaciones arquitectónicas.
- Experimentación con cirugía modular: el patrón `hybrid_3_1` y el adaptador `QwenAttentionAdapter` permiten reproducir la sustitución de atención y extenderla a otras combinaciones del `ATTENTION_REGISTRY`.
- Benchmarking controlado de variantes: al compartir base con otros checkpoints del "Attention Zoo", permite comparaciones aislando el efecto de la atención sobre la perplejidad.
- Prototipado de generación de texto en inglés con recursos muy limitados: 0.5B parámetros y pesos de 161.50 MB caben en GPUs de consumo y permiten iteración rápida.
- Docencia y divulgación: ejemplo didáctico de cómo se sustituye un bloque de atención, se mantienen anclas cuadráticas y se recupera rendimiento mediante destilación.

## Benchmarks y rendimiento

| Modelo | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-unified-rope-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 15.14 |
| Baseline post-cirugía (etapa 0, sin destilar) | Salesforce/wikitext (`wikitext-2-raw-v1`) | validation | Perplejidad | 17.57 |

Nota: el valor 15.14 figura en la model card con `verified: false`. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (0.5B parámetros, 161.50 MB de pesos en FP16) se estima un consumo del orden de 1-2 GB en FP16, aunque no se documenta oficialmente.
- VRAM de entrenamiento (destilación): 16 250 MB pico en FP16 autocast con parámetros maestros FP32, según la model card.
- GPU recomendadas: no se especifican modelos concretos; el entrenamiento cabe en GPUs con ≥16 GB (por ejemplo, RTX 4090, A100, H100). Para inferencia, cualquier GPU consumer moderna es suficiente por el tamaño del modelo.
- Cabe en GPU consumer: sí, por tamaño; no se documentan modelos concretos.
- Opciones de despliegue: la model card usa `transformers` + `safetensors` + el script `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-unified-rope-wikitext2 | 0.5B | no disponible | 15.14 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0.5B | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face |
| Otras variantes del Qwen Attention Zoo (mismo autor) | 0.5B | no disponible | no disponible | MIT (según repo NeuralOps) | Hugging Face |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B ni de otras variantes del zoo en la información proporcionada, por lo que no es posible una comparación cuantitativa directa.

## Limitaciones y advertencias

- Artefacto de investigación: el checkpoint se distribuye como pesos de atención (`attention_weights.safetensors`) que requieren aplicar la cirugía con el script del repositorio NeuralOps antes de cargarlos; no es un modelo autónomo cargable con `AutoModelForCausalLM.from_pretrained` directamente.
- Entrenado y evaluado únicamente en WikiText-2 (inglés): no hay evidencia de calidad en otros dominios, tareas instruccionales o conversación.
- Idiomas: solo inglés declarado.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 0.5B, la calidad factual es limitada por tamaño.
- Sesgos: no documentados; hereda los del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero la ausencia de evaluación fuera de WikiText-2 desaconseja su uso en producción.
- El valor de perplejidad 15.14 está marcado como `verified: false`.
- No se documenta la longitud de contexto efectiva tras la cirugía; el entrenamiento usó `seq_len=512`.
- No se documenta soporte de tool calling, agentes ni cuantización, lo que limita su integración en pipelines de producción estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del repositorio: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText: https://huggingface.co/datasets/Salesforce/wikitext
