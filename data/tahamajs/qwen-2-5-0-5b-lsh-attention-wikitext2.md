# tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un operador de atención por hashing sensible a la localidad (LSH attention, estilo Reformer), manteniendo 6 capas de atención cuadrática completa como anclas. Lo desarrolla el autor independiente tahamajs dentro del proyecto NeuralOps, un "attention zoo" que permite intercambiar operadores de atención en modelos Transformer preentrenados mediante adaptadores.

El modelo no busca ser un asistente de propósito general, sino un banco de pruebas reproducible para estudiar atención subcuadrática en modelos pequeños: el checkpoint original se "cirugía", se recupera parcialmente mediante destilación de conocimiento en dos etapas y se evalúa con perplejidad sobre WikiText-2. Es relevante ahora porque demuestra empíricamente el coste de sustituir atención cuadrática por LSH en un modelo ya entrenado, y publica toda la telemetría del proceso (pasos, tiempos, VRAM, PPL pre- y post-destilación).

El resultado final es un modelo de 0,5 mil millones de parámetros con una perplejidad de validación de 709,91 en WikiText-2, muy lejos de la del Qwen2.5-0.5B original, lo que lo sitúa como artefacto de investigación más que como modelo listo para producción. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `LSHAttention` y 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 917,45 MB; `attention_weights.safetensors` 59,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un Transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica el patrón de cirugía `hybrid_3_1`: por cada tres capas consecutivas se sustituye la atención por `LSHAttention` (hashing sensible a la localidad al estilo Reformer) y se conserva una capa de atención cuadrática completa como ancla, resultando en 18 capas transplantadas y 6 preservadas. La integración se realiza mediante `QwenAttentionAdapter`, que mapea las proyecciones originales, expande las cabezas KV 7x donde es necesario y respeta el contrato de una única `o_proj`. El operador soporta causalidad, bidireccionalidad, cross-attention y GQA nativo, pero no soporta RoPE de forma nativa.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad causal de 233.308,17. La etapa 1 (alineación con backbone congelado, `lm_head` desactivado, MSE y coseno a nivel de capa con peso 0,25) ejecuta 119 pasos en 54,5 s. La etapa 2 (destilación de representaciones multicapa, MSE y coseno con peso 0,50) ejecuta 273 pasos en 125,5 s. En total, 392 pasos de optimización en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM fue de 16.540 MB en FP16 con autocast y parámetros maestros en FP32. La perplejidad final tras la destilación es 709,91, una reducción de 232.598,26 puntos respecto al baseline post-cirugía.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención subcuadrática mediante LSH en 18 de las 24 capas, con anclas cuadráticas cada cuatro capas.
- Soporte de atención bidireccional y cross-attention a nivel de operador (según la ficha del módulo).
- Soporte nativo de GQA en el operador LSH.
- Conversación y generación de texto según el pipeline declarado (`text-generation`, `conversational`).
- No se declaran capacidades específicas de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por LSH en un modelo preentrenado, con telemetría completa de perplejidad antes y después de la destilación.
- Experimentos de destilación de conocimiento: el par de etapas (alineación con backbone congelado y destilación de representaciones multicapa) es un protocolo reutilizable para recuperar modelos tras cirugías arquitectónicas.
- Benchmarking de operadores de atención: al formar parte del "attention zoo" de NeuralOps, permite comparar `lsh_attention` frente a otros operadores del registro bajo el mismo pipeline de evaluación.
- Docencia y divulgación: modelo pequeño (0,5 B) que cabe en GPUs de consumo y permite ilustrar en clase cómo se comporta la atención aproximada frente a la exacta.
- Pruebas de integración de la librería `neuralops`: el checkpoint sirve para validar la API `load_surgeried_model` y el adaptador `QwenAttentionAdapter` en entornos de desarrollo.
- Estudio de eficiencia memoria/tiempo: útil para analizar el equilibrio entre coste de atención y calidad en contextos moderados (`seq_len=512` en entrenamiento), como paso previo a escalar el enfoque a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 709,91 | No (declarado por el autor) |

Telemetría de entrenamiento declarada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, sin entrenar) | Perplejidad causal | 233.308,17 |
| Post-destilación | Perplejidad de validación | 709,91 |
| Delta de perplejidad | Reducción | -232.598,26 |
| Stage 1 (alineación, backbone congelado) | Pasos / tiempo | 119 / 54,5 s |
| Stage 2 (destilación multicapa) | Pasos / tiempo | 273 / 125,5 s |
| Total | Pasos / tiempo | 392 / 180,3 s |
| Pico de VRAM | Memoria | 16.540 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el peso de `model.safetensors` (917,45 MB) más `attention_weights.safetensors` (59,24 MB) sugiere un uso de aproximadamente 1 GB de VRAM para los pesos, más overhead de activaciones y caché KV; con cuantización a 8 bits o 4 bits (no publicada, pero posible vía herramientas estándar) cabría en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 con contexto moderado; A100, H100, RTX 4090, RTX 3090, RTX 4080 o superiores son holgadas.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 y similares; también en GPUs integradas con suficiente memoria compartida para contextos cortos.
- Opciones de despliegue: la carga estándar es vía `neuralops.hub.load_surgeried_model` o mediante `transformers` aplicando primero `apply_qwen_attention_surgery` con `attn_key="lsh_attention"` y `pattern="hybrid_3_1"`. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el operador LSH es personalizado.
- Latencia y throughput: no disponibles. El entrenamiento reporta 392 pasos en 180,3 s con `seq_len=512` y `grad_accum=4`, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2` | ~0,5 B | No disponible (entrenado a 512) | Híbrida LSH + cuadrática (18/6) | MIT | Hugging Face (NeuralOps) |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5 B | 32.768 tokens (según ficha oficial de Qwen) | Cuadrática completa con GQA y RoPE | Apache 2.0 | Hugging Face, ecosistema amplio |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~0,5 B | 32.768 tokens | Cuadrática completa con GQA y RoPE | Apache 2.0 | Hugging Face, integrable en vLLM, llama.cpp, Ollama |

La comparación directa con el base Qwen2.5-0.5B es la más informativa: el modelo cirugía conserva el tamaño pero sustituye gran parte de la atención por LSH, con una perplejidad de 709,91 frente a valores muy inferiores del original (no publicados en la información disponible para este checkpoint). No se dispone de datos de benchmarks comparables de otros modelos del "attention zoo" en la información proporcionada.

## Limitaciones y advertencias

- Perplejidad muy alta (709,91 en WikiText-2), indicativa de que la destilación solo recupera parcialmente la calidad del modelo base; no es apto para producción sin un ajuste adicional sustancial.
- El operador LSH no soporta RoPE de forma nativa, lo que puede degradar el modelado de posiciones largas y limita la extrapolación de contexto.
- Entrenado únicamente sobre WikiText-2 con `seq_len=512`; el contexto efectivo y la generalización fuera de dominio son inciertos.
- Solo se declara inglés; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación y de texto incoherente por la baja calidad del checkpoint.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable su uso en producto sin trabajo adicional.
- Depende de la librería `neuralops` y del adaptador `QwenAttentionAdapter`; no es un checkpoint estándar de `transformers` y requiere pasos de cirugía previos para cargarse correctamente.
- Los benchmarks están declarados por el autor y no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
