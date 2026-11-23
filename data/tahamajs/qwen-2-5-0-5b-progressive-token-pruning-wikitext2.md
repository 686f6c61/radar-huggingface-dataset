# tahamajs/qwen-2.5-0.5b-progressive-token-pruning-wikitext2

## Resumen

El modelo `tahamajs/qwen-2.5-0.5b-progressive-token-pruning-wikitext2` es un checkpoint derivado de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el módulo de atención `progressive_token_pruning` (PTP v2) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario tahamajs como parte del "NeuralOps Qwen Attention Zoo", una iniciativa que experimenta con mecanismos de atención subcuadrática aplicados a modelos ya entrenados y recuperados mediante destilación de conocimiento.

El objetivo es doble: por un lado, demostrar que es viable reemplazar atención cuadrática estándar por atención con poda progresiva de tokens en un transformer causal sin colapsar el modelo; por otro, servir como artefacto de referencia para comparar mecanismos de atención alternativos sobre una base común (Qwen2.5-0.5B). La recuperación se realiza en dos etapas de destilación de conocimiento sobre WikiText-2, reduciendo la perplejidad de validación de 58,69 (tras la cirugía, sin entrenamiento) a 15,61.

Se trata de un modelo de 0,5 mil millones de parámetros con contexto nativo de Qwen2.5 (no se especifica en la información disponible el contexto conservado tras la cirugía), pesos publicados únicamente como artefacto de atención (`attention_weights.safetensors`, 163,48 MB), licencia MIT e idioma declarado inglés. No es un modelo listo para producción directa: requiere cargar la base Qwen2.5-0.5B, aplicar la cirugía con la API de NeuralOps y cargar los pesos de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `progressive_token_pruning` (PTP v2) y 6/24 capas con atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23]; patron `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica el contexto conservado; el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 163,48 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esta base se aplica una "cirugia" que sustituye la atención de 18 capas por el módulo `ProgressiveTokenPruning` mediante `QwenAttentionAdapter`, que expande automáticamente las 2 cabezas KV a 7 cabezas por consulta (factor 7x) y respeta el contrato de `o_proj` único. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) conservan atención cuadrática completa como anclas de estabilidad.

El mecanismo PTP v2 funciona en el forward de la siguiente forma: puntúa cada token con una red `score_network` por capa (o un scorer compartido opcional), fuerza la retención del primer token (BOS/CLS), selecciona `k = ceil(L · keep_ratio)` tokens —en modo causal, el primer token más los últimos `k-1` para no filtrar futuro—, calcula atención solo sobre ese subconjunto reducido de claves/valores y devuelve la forma original `(B, L, D)`. Si no hay poda efectiva y no hay caché, usa la ruta rápida SDPA. El módulo soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE declarado (`supports_rope: N/A`).

El entrenamiento consistió en dos etapas de destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4`, `topk=64` y 345 pasos totales en 180,1 s. La etapa 1 (alineación con backbone congelado, 104 pasos, 54,4 s) omite el `lm_head` y usa MSE/coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa, 241 pasos, 125,5 s) usa MSE/coseno con peso 0,50. El pico de VRAM fue de 15.063 MB en FP16 con autocast y parámetros maestros FP32.

## Capacidades

- Generación de texto autoregresiva causal en inglés, heredada de Qwen2.5-0.5B.
- Atención subcuadrática con poda progresiva de tokens: reduce el coste de atención manteniendo la forma de salida original.
- Soporte de modo causal, bidireccional y cross-attention en el módulo PTP (según la tabla de capacidades del módulo).
- Compatible con el ecosistema `transformers` mediante `AutoModelForCausalLM` más la función `apply_qwen_attention_surgery` de NeuralOps.
- Carga directa a través de la API de NeuralOps Hub (`load_surgeried_model`).
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo "thinking" en la información disponible.
- Capacidad multilingüe: no disponible (solo se declara inglés).

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como artefacto reproducible para comparar PTP v2 frente a atención cuadrática estándar sobre una base común (Qwen2.5-0.5B) midiendo perplejidad en WikiText-2.
- Experimentos de destilación de conocimiento: el par de etapas (alineación con backbone congelado y destilación de representaciones multicapa) documentado con telemetría permite replicar el pipeline sobre otros modelos pequeños.
- Prototipado de modelos compactos con atención eficiente: útil para validar en local (0,5B, 163 MB de pesos de atención) si un esquema de poda de tokens preserva calidad antes de escalar a modelos mayores.
- Benchmarking de mecanismos de atención: la estructura `hybrid_3_1` con anclas cuadráticas permite aislar el efecto de la poda por capas y medir su impacto en perplejidad.
- Base para fine-tuning posterior: al estar bajo licencia MIT y ser un checkpoint de Qwen2.5-0.5B, puede servir como punto de partida para tareas de generación de texto en inglés con atención eficiente.
- Educación y divulgación técnica: ejemplo didáctico de cirugía de atención, contratos de adaptador (`QwenAttentionAdapter`) y recuperación por KD con métricas detalladas (PPL pre/post, pasos, VRAM).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 15,61 | PPL final tras KD |
| WikiText-2 (Stage 0, post-cirugia sin KD) | Perplejidad | 58,69 | Baseline zero-shot tras cirugia |
| Delta de perplejidad | Δ | -43,08 | Recuperacion por destilacion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (0,5B) y pesos FP16 (163,48 MB de atencion mas el backbone Qwen2.5-0.5B), la inferencia en FP16 deberia caber holgadamente en GPUs de consumo con 4-8 GB, aunque no se confirma en la informacion disponible.
- VRAM de entrenamiento documentada: 15.063 MB de pico en la destilacion (FP16 autocast, maestros FP32, `seq_len=512`).
- GPU recomendadas: no especificadas por el autor; para el pipeline de entrenamiento se uso una GPU con al menos ~15 GB (clase RTX 4090 / A10 / L4 en adelante).
- Cabe en GPU de consumo: muy probablemente si, dado el tamano de 0,5B, pero no confirmado en la documentacion.
- Opciones de despliegue: `transformers` + `neuralops` (via `load_surgeried_model` o `apply_qwen_attention_surgery`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el modulo PTP es una atencion personalizada (`is_custom_attention: Yes`), lo que limita la compatibilidad con runtimes estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (PTP v2, hybrid_3_1) | 0,5B | no disponible | Hibrida (18/24 PTP + 6/24 cuadratica) | MIT | Pesos de atencion en HF (requiere cirugia) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (contexto nativo de Qwen2.5, segun documentacion publica del modelo base) | Cuadratica estandar con GQA | Apache 2.0 | Pesos completos en HF |
| Modelos 0,5B de la familia Qwen2.5 (p. ej. variantes instruct) | 0,5B | 32.768 tokens | Cuadratica estandar | Apache 2.0 | Pesos completos en HF |

La comparativa directa con alternativas de atención subcuadratica (Mamba, RWKV, linear attention) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: los pesos publicados son solo de atención (`attention_weights.safetensors`); requiere cargar `Qwen/Qwen2.5-0.5B`, aplicar la cirugía con NeuralOps y cargar los pesos con `strict=False`.
- Dependencia de la librería `neuralops` y de la función `apply_qwen_attention_surgery`; no es un checkpoint estándar de `transformers` y no se garantiza su funcionamiento en runtimes genéricos (vLLM, llama.cpp, TGI).
- El módulo PTP no soporta GQA nativo (`supports_gqa: No`) y declara `supports_rope: N/A`, lo que puede afectar a la extrapolación de contexto.
- Entrenado y evaluado únicamente en WikiText-2 en inglés; no hay evidencia de calidad en otros dominios, tareas de instrucción ni idiomas distintos del inglés.
- La perplejidad de 15,61 no es verificada (`verified: false`) y no se compara con la del Qwen2.5-0.5B base en la información disponible, por lo que no puede afirmarse que la cirugía preserve la calidad original.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 0,5B, la calidad de generación es limitada.
- Licencia MIT permite uso comercial, pero la base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar ambas licencias en producción.
- Fecha de creación del repositorio: 2026-11-10 (según metadatos de Hugging Face); 408 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-progressive-token-pruning-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
