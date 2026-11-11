# tahamajs/qwen-2.5-0.5b-progressive-token-pruning-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-progressive-token-pruning-wikitext2` es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decodificador por un mecanismo propio denominado Progressive Token Pruning (PTP v2), perteneciente al registro de atención del framework NeuralOps. El objetivo no es ofrecer un modelo de propósito general, sino validar empíricamente una técnica de atención subcuadrática: en lugar de calcular atención sobre todas las claves y valores, el módulo puntúa cada token con una red por capa y conserva únicamente `k = ceil(L · keep_ratio)` tokens, manteniendo el primer token (BOS) y, en modo causal, los últimos `k-1` para evitar fugas de información futura.

El checkpoint se ha recuperado mediante destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de una perplejidad causal de 58,69 tras la cirugía y alcanzando 15,61 tras el ajuste. La topología de sustitución es `hybrid_3_1`: 18 de las 24 capas usan PTP y 6 capas conservan atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23).

Es relevante ahora porque documenta de forma reproducible el coste y la recuperación de calidad de una intervención arquitectónica sobre un transformer pequeño, con telemetría detallada de pasos, tiempos y VRAM. No obstante, el repositorio solo contiene los pesos de atención (163,48 MB en `attention_weights.safetensors`), no un modelo completo listo para `from_pretrained` directo: requiere cargar el base Qwen2.5-0.5B y aplicar la cirugía antes de inyectar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con Progressive Token Pruning (PTP v2) y 6/24 capas con atención cuadrática completa |
| Parametros totales | No disponible de forma explícita; el modelo base Qwen2.5-0.5B tiene ~0,5 mil millones, pero el repo solo publica pesos de atención (163,48 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó `seq_len=512` |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo de uso emplea `torch.float16`) |
| Idiomas soportados | `en` (inglés), según la model card |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896` (GQA 14:2). Sobre esa base se aplica un `QwenAttentionAdapter` que expande automáticamente las cabezas KV (7x) donde es necesario y respeta el contrato de `o_proj` único. La cirugía reemplaza la atención en 18 de las 24 capas con `ProgressiveTokenPruning`, que puntúa tokens mediante una `score_network` por capa (con opción de scorer compartido), fuerza la conservación del primer token y selecciona `k = ceil(L · keep_ratio)` tokens; en modo causal conserva el primero y los últimos `k-1`, lo que evita fugas de futuro y pérdida de claves en el paso 0. Si no hay poda (`k == L`) y no hay caché, se usa la ruta rápida SDPA. El módulo soporta causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE de forma nativa (según la tabla de capacidades del módulo).

El entrenamiento consistió en destilación de conocimiento en dos etapas sobre WikiText-2: la etapa 1 (alineación con backbone congelado, `lm_head` puenteado, MSE y coseno sobre estados ocultos con peso 0,25) duró 104 pasos (54,4 s); la etapa 2 (KD multi-capa de representaciones, MSE y coseno con peso 0,50) duró 241 pasos (125,5 s). En total, 345 pasos y 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 15.063 MB en FP16 autocast con parámetros maestros en FP32. La perplejidad pasó de 58,69 (etapa 0, post-cirugía) a 15,61.

## Capacidades

- Generación de texto causal en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención causal segura para decodificación autoregresiva (el módulo declara `supports_causal: Yes`).
- Soporte de atención bidireccional y cross-attention a nivel de módulo (no necesariamente expuesto en el checkpoint).
- Poda adaptativa de tokens por capa mediante red de puntuación, con ratio de conservación configurable.
- Fallback a SDPA cuando no hay poda ni caché.
- Capacidades conversacionales y de tool calling: no confirmadas en la información disponible para este checkpoint; el modelo base Qwen2.5-0.5B las soporta, pero la cirugía y el ajuste solo sobre WikiText-2 no garantizan su preservación.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como referencia reproducible para medir la degradación y recuperación de perplejidad al sustituir atención cuadrática por poda progresiva de tokens en un transformer pequeño.
- Validación de pipelines de cirugía de atención: permite probar el `QwenAttentionAdapter`, la topología `hybrid_3_1` y el contrato de `o_proj` único en un entorno controlado antes de escalar a modelos mayores.
- Experimentos de destilación de conocimiento: la telemetría de dos etapas (pasos, tiempos, VRAM, delta de perplejidad) sirve de línea base para comparar estrategias de KD sobre arquitecturas modificadas.
- Benchmarking de eficiencia: útil para medir el ahorro computacional de PTP frente a atención completa en secuencias de hasta 512 tokens, aunque sin datos publicados de latencia o throughput.
- Estudio de estabilidad post-cirugía: el salto de PPL de 58,69 a 15,61 documenta cuánto puede recuperarse con solo 345 pasos de KD, útil para planificar presupuestos de ajuste.
- Docencia y divulgación técnica: ejemplo didáctico de intervención arquitectónica sobre un modelo open source con licencia MIT y pesos de atención de pequeño tamaño (163,48 MB).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Dataset / split | Métrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, `wikitext-2-raw-v1`, validation | Perplejidad | 15,61 |
| Baseline post-cirugía (etapa 0) | `wikitext-2-raw-v1` | Perplejidad | 58,69 |
| Delta de perplejidad | `wikitext-2-raw-v1` | Δ PPL | -43,08 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento usó 15.063 MB de pico con FP16 autocast y maestros FP32. Para inferencia en FP16 de un modelo de ~0,5B más los pesos de atención, se estima un consumo moderado (por debajo de 4 GB), aunque no hay cifra publicada.
- GPU recomendadas: no especificadas por el autor; el entrenamiento cabe en una GPU con al menos ~16 GB (p. ej. RTX 4090, A100 40 GB, H100).
- ¿Cabe en consumer GPU? Sí, previsiblemente en GPUs con 8 GB o más en FP16, dado el tamaño del base (0,5B); no confirmado oficialmente.
- Opciones de despliegue: el flujo documentado usa `transformers` + `safetensors` + `huggingface_hub` con la función `apply_qwen_attention_surgery` del repo NeuralOps. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con estos frameworks no está garantizada por la naturaleza experimental del checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen-2.5-0.5b-progressive-token-pruning-wikitext2` (este) | ~0,5B (base) | No disponible (entreno a 512) | Híbrida PTP + cuadrática (18/24 + 6/24) | MIT | Pesos de atención solamente |
| Qwen/Qwen2.5-0.5B | ~0,5B | 32.768 tokens (según modelo base) | Cuadrática completa con GQA | Apache 2.0 | Modelo completo |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens | Cuadrática completa con GQA | Apache 2.0 | Modelo completo, ajustado a instrucciones |
| Modelos con atención subcuadrática (p. ej. variantes Mamba/SSM) | Variable | Variable | SSM/híbrida | Variable | Variable |

La comparación directa con alternativas subcuadráticas no está disponible en la información proporcionada. Frente al base Qwen2.5-0.5B, este checkpoint no ofrece un modelo completo ni contexto largo documentado, y su licencia MIT difiere de la Apache 2.0 del original.

## Limitaciones y advertencias

- El repositorio contiene solo los pesos de atención (`attention_weights.safetensors`); no es un modelo cargable directamente con `from_pretrained`. Requiere el base Qwen2.5-0.5B y aplicar la cirugía con `apply_qwen_attention_surgery`.
- El ajuste se realizó únicamente sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de inglés de Wikipedia; el rendimiento en otros dominios, idiomas o tareas conversacionales no está validado.
- La perplejidad de 15,61 está declarada por el autor y marcada como `verified: false`; no ha sido verificada de forma independiente.
- El módulo PTP no soporta GQA nativo ni RoPE de forma nativa según la tabla de capacidades, lo que puede limitar su integración con el stack estándar de Qwen.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del base Qwen2.5-0.5B, pero sin ajuste de alineación (RLHF/DPO) sobre este checkpoint.
- Capacidades de tool calling, agentes y multi-step reasoning: no confirmadas tras la cirugía y el ajuste solo sobre WikiText-2.
- Contexto: el entrenamiento usó `seq_len=512`; no hay evidencia de que el modelo mantenga el contexto largo del base (32.768 tokens).
- Licencia MIT permite uso comercial, pero al derivar de Qwen2.5-0.5B (Apache 2.0) conviene revisar las obligaciones de atribución del modelo base.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; no apto para producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-progressive-token-pruning-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
