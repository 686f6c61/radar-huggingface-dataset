# tahamajs/qwen-2.5-0.5b-spectron-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-spectron-wikitext2` es un checkpoint derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por el operador `SpectronAttention`, perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo es experimental: evaluar si una atención subcuadrática (low-rank + sparse, activation-aware) puede reemplazar la atención cuadrática estándar de un transformer preentrenado y recuperar calidad mediante destilación de conocimiento en dos etapas. No se trata de un modelo nuevo entrenado desde cero, sino de un parche de pesos de atención sobre una base Qwen2.5-0.5B congelada.

El modelo conserva la topología de Qwen2.5-0.5B: 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. La intervención sigue el patrón `hybrid_3_1`: 18 de las 24 capas se reemplazan por Spectron, mientras que 6 capas ancla cuadráticas se preservan en los índices `[3, 7, 11, 15, 19, 23]`. El entrenamiento se limita a WikiText-2 (`wikitext-2-raw-v1`), con 258 pasos totales de destilación y unos 180 segundos de cómputo en FP16.

Es relevante ahora porque forma parte de una línea de investigación activa sobre eficiencia de atención en LLM pequeños, y porque publica telemetría detallada del proceso de sustitución y destilación. La perplexity final declarada en validación de WikiText-2 es 192,50, un valor alto en términos absolutos para un modelo de 0,5B, lo que sugiere que la sustitución degrada sustancialmente la calidad respecto al modelo base. El repositorio solo contiene los pesos de atención (64,25 MB) y no un checkpoint completo listo para usar con `transformers` sin aplicar la cirugía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5, con atencion `SpectronAttention` (low-rank + sparse, activation-aware) en 18/24 capas y atencion cuadratica en 6 capas ancla |
| Parametros totales | No disponible de forma explicita; hereda la base Qwen2.5-0.5B (aproximadamente 0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos de atencion en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 64,25 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La base es Qwen2.5-0.5B, un transformer decoder-only con GQA (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y 24 capas. Sobre esa base se aplica una cirugía de atención con `QwenAttentionAdapter`, que mapea las proyecciones originales y expande las cabezas KV 7x cuando es necesario (`14:2`), respetando un contrato de `o_proj` único. El patrón `hybrid_3_1` sustituye 18 capas por `SpectronAttention` (operador de atención subcuadrática con descomposición low-rank y sparsity dependiente de activaciones) y mantiene 6 capas cuadráticas como anclas en los índices `[3, 7, 11, 15, 19, 23]`.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2, con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) dura 90 pasos (54,3 s) y usa MSE + coseno sobre estados ocultos con peso 0,25, omitiendo `lm_head`. La etapa 2 (destilación multi-capa de representaciones) dura 168 pasos (125,9 s) con peso 0,50. El total son 258 pasos en 180,6 s, con un pico de VRAM de 17.729 MB en FP16 con parámetros maestros FP32. La perplexity causal pasa de 428.089,31 (post-cirugía, sin destilar) a 192,50 tras la destilación, una delta de −427.896,81 que indica recuperación, aunque el valor absoluto sigue siendo elevado.

## Capacidades

- Generación de texto causal autorregresiva, heredada de la base Qwen2.5-0.5B y del operador `SpectronAttention` (`supports_causal = Yes`).
- Soporte de atención bidireccional a nivel de operador (`supports_bidirectional = Yes`), aunque el checkpoint está configurado para uso causal.
- Soporte de cross-attention a nivel de operador (`supports_cross_attention = Yes`).
- Soporte nativo de GQA (`supports_gqa = Yes`), con expansión 7x de cabezas KV en las capas sustituidas.
- Rotary position embeddings: la model card indica `supports_rope = N/A` para el operador Spectron, por lo que la integración posicional efectiva no se detalla.
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.
- No se declaran capacidades de agente ni multi-step reasoning específicas.

## Casos de uso

- Investigación sobre atención subcuadrática: servir como checkpoint de referencia para comparar `SpectronAttention` frente a atención cuadrática en un transformer preentrenado de 0,5B, usando la telemetría de destilación publicada como línea base reproducible.
- Experimentos de cirugía de atención: aplicar el mismo pipeline (`apply_qwen_attention_surgery` con `pattern="hybrid_3_1"`) a otras bases Qwen2.5 para estudiar la transferibilidad del operador Spectron entre tamaños y configuraciones GQA.
- Destilación de conocimiento en modelos pequeños: usar las dos etapas descritas (alineación con backbone congelado y destilación multi-capa de representaciones) como receta reproducible para recuperar calidad tras modificaciones estructurales, con 258 pasos y menos de 3 minutos de cómputo.
- Evaluación de perplexity en WikiText-2: emplear el valor 192,50 como referencia declarada por el autor para validar implementaciones del operador o reproducir el pipeline en entornos controlados.
- Estudio de topologías híbridas: analizar el impacto del patrón `hybrid_3_1` (18 capas Spectron + 6 anclas cuadráticas) frente a patrones alternativos, midiendo la relación entre número de capas sustituidas y degradación de perplexity.
- Prototipado de eficiencia de memoria y atención: probar el operador en cargas con `seq_len=512` y medir el pico de VRAM (17.729 MB en FP16) como referencia para planificar experimentos en GPUs consumer de gama alta.
- Integración con el ecosistema NeuralOps: usar `neuralops.hub.load_surgeried_model` para cargar el checkpoint en pipelines de investigación internos de NeuralOps.

## Benchmarks y rendimiento

Datos declarados por el autor en la `model-index` de la model card. La métrica `verified` está en `false`, es decir, no verificada de forma independiente.

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext (`wikitext-2-raw-v1`, validation) | Perplexity | 192,50 |

Telemetría de destilación declarada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, sin KD) | Perplexity causal | 428.089,31 |
| Post-KD | Perplexity causal | 192,50 |
| Delta | Perplexity | −427.896,81 |
| Stage 1 (Frozen-Backbone Alignment) | Pasos / tiempo | 90 pasos / 54,3 s |
| Stage 2 (Multi-Layer Representation KD) | Pasos / tiempo | 168 pasos / 125,9 s |
| Total | Pasos / tiempo | 258 pasos / 180,6 s |
| Pico de VRAM | FP16 autocast + FP32 master | 17.729 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico declarado durante el entrenamiento es de 17.729 MB (aproximadamente 17,3 GB) en FP16 con parámetros maestros FP32. Para inferencia en FP16 del modelo completo (base Qwen2.5-0.5B + pesos de atención Spectron) se estima un consumo menor, pero no se publica una cifra específica.
- GPU recomendadas para entrenamiento/reproducción: una GPU con al menos 18 GB de VRAM efectiva, como RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB).
- GPU consumer: el entrenamiento cabe en RTX 4090 (24 GB) según el pico declarado; para inferencia en FP16 de un modelo de 0,5B, cabría en GPUs consumer con 8 GB o más, aunque no se declara latencia ni throughput.
- Opciones de despliegue: el checkpoint no es directamente cargable con `transformers` sin aplicar la cirugía de atención. Requiere el pipeline de NeuralOps (`apply_qwen_attention_surgery` con `attn_key="spectron"` y `pattern="hybrid_3_1"`) o la API `neuralops.hub.load_surgeried_model`. No se declaran integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-spectron-wikitext2` | ~0,5B (base Qwen2.5-0.5B) | No disponible | 192,50 (declarada, no verificada) | MIT | Pesos de atencion en HF (64,25 MB) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | No disponible en esta ficha | No disponible | Apache 2.0 (segun la base, no confirmado en esta ficha) | Checkpoint completo en HF |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | ~0,5B | No disponible | No disponible | MIT (segun el proyecto NeuralOps) | Pesos de atencion en HF |

No se dispone de datos de perplexity del modelo base Qwen2.5-0.5B ni de otros operadores del Attention Zoo en la información proporcionada, por lo que la comparación cuantitativa directa no es posible. La perplexity de 192,50 es alta en términos absolutos para un modelo de 0,5B y sugiere una degradación significativa respecto al modelo base, aunque el autor no publica la cifra de referencia.

## Limitaciones y advertencias

- Perplexity elevada: 192,50 en WikiText-2 es un valor alto para un modelo de 0,5B; la sustitución de atención degrada la calidad y la destilación solo recupera parcialmente (parte de 428.089,31).
- Entrenamiento limitado: solo 258 pasos y 180,6 s sobre WikiText-2, un dataset pequeño y de dominio único; no hay evidencia de generalización fuera de ese corpus.
- Solo inglés: el modelo declara únicamente `en`; no se garantiza comportamiento multilingüe.
- Checkpoint parcial: el repositorio contiene solo pesos de atención (64,25 MB), no un modelo completo; requiere aplicar la cirugía con NeuralOps antes de cargar con `transformers`.
- Dependencia de código externo: el pipeline depende del repositorio NeuralOps y de la función `apply_qwen_attention_surgery`, lo que introduce riesgo de reproducibilidad si el código cambia.
- Benchmarks no verificados: la métrica de perplexity está marcada como `verified: false`; no hay validación independiente.
- Sesgos: no se documentan sesgos conocidos; al derivar de Qwen2.5-0.5B y entrenar solo en WikiText-2, hereda los sesgos del modelo base y del corpus, sin mitigación declarada.
- Riesgo de alucinación: no evaluado en la información disponible; la degradación de perplexity sugiere mayor riesgo que el modelo base.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según la información habitual de Qwen, no confirmada en esta ficha), que debe respetarse.
- Sin soporte declarado de tool calling, agentes ni modos de razonamiento; no apto para pipelines de producción que dependan de esas capacidades.
- Contexto nativo no declarado: el entrenamiento usa `seq_len=512`; no hay garantía de comportamiento correcto en ventanas más largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-spectron-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2 (`Salesforce/wikitext`): https://huggingface.co/datasets/Salesforce/wikitext
