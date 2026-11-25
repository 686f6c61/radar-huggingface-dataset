# tahamajs/qwen-2.5-0.5b-eat-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-eat-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el operador `eat` (Efficient Attention Transformer with Progressive Token Pruning) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es tahamajs y el modelo forma parte de la denominada "Qwen Attention Zoo", una colección de variantes de atención subcuadrática aplicadas sobre arquitecturas Qwen2.5.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer causal decoder-only, 495.138.688 parámetros, hidden_size 896, 14 cabezas de consulta y 2 cabezas KV con head_dim 64) pero introduce un patrón híbrido 3:1 en el que 6 capas mantienen atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19, 23) y el resto usan el bloque `eat`. Tras una destilación de conocimiento en dos etapas sobre WikiText-2, la perplejidad de validación pasa de 139,81 (baseline post-cirugía) a 26,79.

Su relevancia es fundamentalmente de investigación: sirve como banco de pruebas reproducible para evaluar si operadores de atención subcuadrática pueden sustituir a la atención estándar en modelos pequeños manteniendo una perplejidad razonable, con un coste de entrenamiento declarado de solo 357 pasos y 180,3 segundos en una única GPU. No está pensado como modelo de producción generalista, sino como artefacto de experimentación dentro del ecosistema NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5) con atención híbrida `eat` en patrón 3:1 |
| Parametros totales | 495.138.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó seq_len=512) |
| Tipos de cuantizacion | no disponible (pesos en FP16; repo safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB, `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, hidden_size 896, 14 cabezas de consulta y 2 cabezas KV (GQA), head_dim 64. Sobre esa base se aplica una "cirugía" de atención mediante `QwenAttentionAdapter`, que sustituye el bloque `Qwen2Attention` por `EATBlock` en 18 de las 24 capas siguiendo el patrón `hybrid_3_1`. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) conservan atención cuadrática completa como anclas. El adaptador gestiona la expansión de cabezas KV (7x donde es necesario) y respeta el contrato de `o_proj` único. El bloque `eat` declara soporte causal, bidireccional, cross-attention, GQA nativo y operador de atención personalizado; no usa RoPE nativo (`supports_rope: N/A`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 0 (post-cirugía, sin entrenamiento) da una perplejidad causal de 139,81. La etapa 1 (alineación con backbone congelado, 108 pasos, 54,2 s) usa MSE y coseno sobre estados ocultos por capas con peso 0,25 y omite `lm_head`. La etapa 2 (destilación multi-capa de representaciones, 249 pasos, 125,8 s) repite el esquema con peso 0,50. En total, 357 pasos en 180,3 s con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 y parámetros maestros del estudiante en FP32, con un pico de VRAM de 18.712 MB.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de Qwen2.5-0.5B.
- Atención causal con soporte declarado de GQA nativo y cross-attention en el bloque `eat`.
- Capacidad de operar como bloque de atención bidireccional (declarado, no verificado en la model card).
- Aplicable como sujeto de experimentación para medir perplejidad y calidad de representaciones frente al modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código ni visión en la información disponible.
- Multilingüismo limitado: la model card declara únicamente `en`.

## Casos de uso

- Investigación en atención subcuadrática: usar el checkpoint como referencia reproducible para comparar la perplejidad de `eat` frente a atención cuadrática en el mismo backbone Qwen2.5-0.5B.
- Reproducción de experimentos de destilación: el repo incluye `training_metrics.json` y un pipeline de dos etapas documentado, útil para replicar la recuperación de perplejidad (139,81 → 26,79) en otras variantes del Attention Zoo.
- Evaluación de cirugía de atención: emplear `apply_qwen_attention_surgery` con `attn_key="eat"` y `pattern="hybrid_3_1"` para generar nuevas variantes y medir su impacto.
- Benchmarking de eficiencia: comparar latencia y uso de memoria del patrón híbrido 3:1 frente al modelo base en secuencias largas, dado que el operador es subcuadrático.
- Estudio de contratos de adaptador: analizar cómo `QwenAttentionAdapter` gestiona la expansión de cabezas KV (2 → 14) y el bypass de `o_proj` en modelos GQA pequeños.
- Docencia y divulgación: ejemplo didáctico de sustitución modular de operadores de atención y destilación por capas en un modelo de 0,5B parámetros.
- Prototipado de generación de texto en inglés con requisitos mínimos de hardware (pesos de ~1 GB en FP16), siempre que se acepte la calidad limitada de un modelo de 0,5B destilado sobre WikiText-2.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 26,79 |
| WikiText-2 (Stage 0, post-cirugía sin KD) | Perplejidad | 139,81 |
| Delta de perplejidad tras KD | — | −113,01 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para pesos (495M parámetros) más overhead de activaciones; el entrenamiento declarado alcanzó 18.712 MB de pico con FP16 autocast y maestros FP32.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM para inferencia en FP16; el entrenamiento documentado cabe en una GPU de 24 GB (p. ej. RTX 3090/4090, A10, L4).
- Cabe en GPU de consumo: sí, en GTX 1650/1660, RTX 2060 en adelante, y en iGPU con suficiente memoria compartida para cuantizaciones agresivas (no documentadas).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (requiere aplicar la cirugía antes de cargar los pesos, según el quick start), o `neuralops.hub.load_surgeried_model` para carga directa desde el Hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-eat-wikitext2` | 495M | no disponible | 26,79 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 494M | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otras variantes del Attention Zoo (NeuralOps) | ~495M | no disponible | no disponible | MIT (repo) | Hugging Face |

La comparación directa con el modelo base en perplejidad de WikiText-2 no está disponible en la información proporcionada; el autor solo reporta el salto interno de 139,81 a 26,79 tras la destilación.

## Limitaciones y advertencias

- Modelo experimental de investigación: la perplejidad de 26,79 no está verificada (`verified: false`) y no se acompaña de benchmarks de razonamiento, código o matemáticas.
- Entrenado exclusivamente sobre WikiText-2 en inglés; el dominio y el idioma están muy acotados, con riesgo alto de degradación fuera de ese registro.
- El proceso de cirugía requiere aplicar `apply_qwen_attention_surgery` antes de cargar los pesos si se usa `transformers` directamente; una carga ingenua puede fallar o producir resultados incorrectos.
- El bloque `eat` declara `supports_rope: N/A`, lo que puede afectar a la extrapolación de contexto más allá de los 512 tokens vistos en entrenamiento.
- Riesgo de alucinación alto por el tamaño (0,5B) y por la naturaleza del corpus de entrenamiento.
- No se documentan sesgos específicos, pero hereda los del modelo base Qwen2.5-0.5B y los de WikiText-2.
- Licencia MIT permite uso comercial, pero la ausencia de evaluaciones de seguridad y la baja calidad esperable desaconsejan su uso en producción sin validación adicional.
- El ecosistema NeuralOps es nicho; el soporte de herramientas de terceros (vLLM, llama.cpp, TGI) no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-eat-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repo NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
