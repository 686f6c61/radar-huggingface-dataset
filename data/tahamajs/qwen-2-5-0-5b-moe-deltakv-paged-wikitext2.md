# tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2

## Resumen

`qwen-2.5-0.5b-moe-deltakv-paged-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de investigación centrado en la sustitución quirúrgica de bloques de atención en transformers. El modelo parte de `Qwen/Qwen2.5-0.5B` y reemplaza 18 de sus 24 capas de atención por el módulo `MoEDeltaKVPagedAttention`, una atención híbrida con enrutamiento MoE y paginación de claves/valores (DeltaKV). El resultado es un artefacto de investigación sobre atención subcuadrática, no un modelo de propósito general.

El checkpoint se ha entrenado exclusivamente sobre WikiText-2 (`wikitext-2-raw-v1`) mediante destilación de conocimiento en dos etapas (alineación de backbone congelado y destilación multi-capa de representaciones). Su perplexity de validación es de 1745.31, un valor que refleja que el proceso de destilación no ha recuperado la calidad del modelo base: el delta de perplexity tras el entrenamiento es de +0.00, es decir, no hay mejora respecto al estado post-cirugía. Se trata, por tanto, de una pieza de telemetría de investigación, no de un modelo listo para producción.

Su relevancia es acotada: sirve para estudiar cómo se comportan arquitecturas de atención alternativas (MoE con DeltaKV paginado, patrón híbrido 3:1) sobre un backbone pequeño de 0.5B parámetros, y para reproducir experimentos del Attention Zoo de NeuralOps. No está pensado para generación de texto útil, razonamiento ni aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida `moe_deltakv_paged` en 18/24 capas y 6 capas de atención cuadrática completa como anclas |
| Parametros totales | 0.5B (heredados de Qwen2.5-0.5B; el checkpoint pesa 944.59 MB en safetensors) |
| Parametros activos | no disponible (el módulo se denomina MoE pero no se publica el número de expertos ni de parámetros activos) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; no se declara la ventana máxima en config) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 para inferencia y FP32 para parámetros maestros durante el entrenamiento) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944.59 MB + `attention_weights.safetensors` 86.38 MB), config.json, tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B estándar (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) al que se le aplica una cirugía de atención mediante `QwenAttentionAdapter`. El patrón `hybrid_3_1` sustituye 18 de las 24 capas por `MoEDeltaKVPagedAttention` y preserva 6 capas de atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]` como anclas. El adaptador expande las cabezas KV 7x cuando es necesario y respeta el contrato de bypass de `o_proj` único. El módulo soporta atención causal, bidireccional, cross-attention y GQA nativo; no soporta RoPE (`supports_rope: N/A`). Cuando `num_pages <= 1` o `enable_moe=False`, el módulo ejecuta atención densa completa en lugar de la ruta paginada con MoE.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineación con backbone congelado (86 pasos, 54.5 s, `lm_head` desactivado, MSE + coseno por capa con peso 0.25) y una segunda etapa de destilación multi-capa de representaciones (198 pasos, 125.4 s, MSE + coseno con peso 0.50). En total, 284 pasos y 180.3 s de cómputo con `seq_len=512`, `grad_accum=4`, `topk=64` y 15 119 MB de VRAM pico en FP16 con parámetros maestros en FP32. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto causal autoregresiva, heredada del backbone Qwen2.5-0.5B, pero degradada por el proceso de cirugía y destilación (perplexity de 1745.31 en WikiText-2).
- Atención bidireccional y cross-attention a nivel de módulo, aunque el checkpoint se distribuye como modelo causal.
- Soporte de GQA nativo con expansión 14:2 de cabezas.
- Ruta de atención densa completa cuando la paginación no se activa (`num_pages <= 1` o `enable_moe=False`).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni thinking mode.
- Capacidad multilingüe limitada al inglés (`language: en`).
- Sin capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Investigación en atención subcuadrática: reproducir los experimentos del Attention Zoo de NeuralOps para comparar el comportamiento de `moe_deltakv_paged` frente a atención cuadrática completa en un backbone de 0.5B.
- Estudio de patrones híbridos de atención: analizar el efecto del patrón `hybrid_3_1` con 6 capas ancla sobre la estabilidad del entrenamiento y la perplejidad.
- Validación de pipelines de cirugía de atención: usar el checkpoint como referencia para verificar que `apply_qwen_attention_surgery` y `QwenAttentionAdapter` producen los pesos esperados.
- Telemetría de destilación de conocimiento: comparar las dos etapas (alineación de backbone y destilación multi-capa) sobre un dataset pequeño y controlado como WikiText-2.
- Benchmarking de kernels de atención paginada: medir latencia y uso de memoria de la ruta paginada frente a la ruta densa en GPUs con distinta VRAM.
- Docencia y divulgación: ilustrar cómo se sustituyen bloques de atención en un transformer pequeño sin reentrenar desde cero, con métricas reproducibles (284 pasos, 180.3 s, 15 119 MB de VRAM pico).

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 1745.31 | No (`verified: false`) |
| WikiText-2, pre-KD (Stage 0) | Perplexity | 1745.31 | No |
| WikiText-2, post-KD | Perplexity | 1745.31 | No |
| Delta de perplexity tras KD | Δ | +0.00 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El único dato es la perplexity de WikiText-2, declarada por el autor y marcada como no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los pesos (944.59 MB de safetensors) más overhead de activaciones y caché KV; el entrenamiento documentado consumió 15 119 MB pico con FP16 autocast y maestros FP32.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM para inferencia en FP16; el entrenamiento requiere GPUs de gama alta (el pico de 15 GB sugiere A100, H100 o RTX 4090/3090).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares para inferencia.
- Opciones de despliegue: la librería declarada es `neuralops` (API `load_surgeried_model`); también se documenta carga vía `transformers` con `apply_qwen_attention_surgery`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo publica tiempos de entrenamiento (180.3 s para 284 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2` | 0.5B | no disponible | 1745.31 (no verificado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0.5B | 32 768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (según repo) | Hugging Face |

La comparación directa con el modelo base no es posible con los datos proporcionados: no se incluye la perplexity de `Qwen/Qwen2.5-0.5B` en WikiText-2 en esta información. Cualitativamente, una perplexity de 1745.31 es muy superior a la que se espera de un modelo de 0.5B entrenado en un corpus amplio, lo que indica que la cirugía y la destilación sobre WikiText-2 no han preservado la calidad del backbone.

## Limitaciones y advertencias

- Perplexity de validación de 1745.31, muy alta para un modelo de 0.5B; la calidad de generación es previsiblemente pobre y no apta para uso real.
- El delta de perplexity tras la destilación es +0.00, lo que indica que las dos etapas de KD no han recuperado nada de la calidad perdida por la cirugía.
- Entrenado exclusivamente sobre WikiText-2, un corpus pequeño y de dominio limitado (texto enciclopédico en inglés); no hay evidencia de generalización fuera de ese dominio.
- Solo soporta inglés (`language: en`); no se declara capacitación multilingüe.
- No se documenta la longitud máxima de contexto del checkpoint; el entrenamiento usa `seq_len=512`.
- El módulo declara soporte MoE pero no se publican el número de expertos ni los parámetros activos, lo que impide estimar coste computacional real.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT, permisiva para uso comercial, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en producción.
- Riesgo alto de alucinación y de generar texto incoherente dado el estado del checkpoint.
- No se documentan sesgos específicos, pero al entrenarse solo sobre WikiText-2 hereda los sesgos y limitaciones de ese corpus.
- El checkpoint depende de la librería `neuralops` y del adaptador `QwenAttentionAdapter`; no es cargable directamente con `transformers` sin aplicar la cirugía previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
