# tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2` es un checkpoint experimental del modelo Qwen2.5-0.5B de Alibaba, publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Zoo". No es un modelo entrenado desde cero: es el resultado de una cirugía arquitectónica sobre los bloques de atención del transformer original, sustituyendo 18 de las 24 capas de atención cuadrática estándar por un módulo propietario denominado `TokenCompressedAttention`, un mecanismo de compresión de tokens basado en chunks con top-k causal.

El objetivo del experimento es demostrar que es posible reemplazar la atención cuadrática por una variante subcuadrática y recuperar la calidad del modelo original mediante destilación de conocimiento en dos etapas, sin reentrenar el backbone completo. Tras la cirugía, la perplejidad en WikiText-2 se dispara de forma drástica (235,49) y, después de 396 pasos de destilación (unos 180 segundos en una sola GPU), se recupera hasta 36,81.

Es relevante como referencia técnica para investigadores interesados en atención eficiente, destilación post-cirugía y arquitecturas híbridas de atención, no como modelo de producción. Con 0,5 mil millones de parámetros, licencia MIT y solo inglés declarado, su utilidad práctica es acotada y su interés es fundamentalmente metodológico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `TokenCompressedAttention` y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo distribuye pesos de atención de 163,48 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó `seq_len=512` |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 163,48 MB) más `config.json` y `tokenizer.json` |
| Cabezas de atención | 14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896` (GQA 14:2 con expansión 7x automática en el adaptador) |
| Patrón de cirugía | `hybrid_3_1` (3:1 intercalado) |
| Librería | `neuralops` |
| Modelo base | Qwen/Qwen2.5-0.5B |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 14:2), dimensión de cabeza 64 y tamaño oculto 896. Sobre esa base se aplica una "cirugía" que sustituye los bloques de atención en 18 de las 24 capas por `TokenCompressedAttention`, un módulo de compresión de tokens por chunks. En modo causal, la secuencia se divide en chunks de tamaño `chunk_size`; dentro de cada chunk se conservan los top-k tokens según una puntuación de importancia (0,5·||x|| + `learned_score(x)` + 0,5·`causal_attn_score(x)`), más el token 0 y los últimos `local_window` tokens del chunk. Los chunks futuros nunca influyen en las selecciones de chunks pasados, lo que preserva la causalidad. El módulo soporta además modo bidireccional (top-k global sin chunking) y cross-attention, y declara soporte nativo de GQA.

La integración se realiza mediante un `QwenAttentionAdapter` que mapea las proyecciones de `Qwen2Attention` y aplica una expansión automática de 7x en las cabezas KV cuando es necesario, manteniendo un contrato de `o_proj` única. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) conservan atención cuadrática completa como anclas.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): una primera etapa de alineación con backbone congelado (119 pasos, 54,2 s) que omite `lm_head` y usa MSE y coseno a nivel de capa (peso 0,25), y una segunda etapa de destilación multi-capa (277 pasos, 125,8 s, peso 0,50). En total, 396 pasos en 180,3 s con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 15.855 MB en FP16 con autocast y parámetros maestros en FP32. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención subcuadrática con compresión de tokens por chunks y top-k causal.
- Soporte de modo bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del módulo).
- Soporte nativo de GQA con expansión automática de cabezas KV en el adaptador.
- Capacidades conversacionales y de tool calling potencialmente heredadas del base, aunque no verificadas tras la cirugía y la destilación.
- No se declaran capacidades de visión, audio, thinking mode ni agentes multi-paso específicas para este checkpoint.

## Casos de uso

- Investigación en atención eficiente: servir como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por variantes subcuadráticas en un transformer pequeño, con telemetría de perplejidad antes y después de la destilación.
- Experimentos de destilación post-cirugía: el pipeline de dos etapas (alineación con backbone congelado y destilación multi-capa) es reutilizable para otros modelos y otros módulos del registro `ATTENTION_REGISTRY`.
- Prototipado de arquitecturas híbridas: el patrón `hybrid_3_1` con capas ancla cuadráticas permite evaluar compromisos entre coste de atención y calidad en un modelo de 0,5B que cabe en una sola GPU consumer.
- Validación de adaptadores de atención: el `QwenAttentionAdapter` con contrato de `o_proj` única y expansión GQA 7x sirve para probar la portabilidad de módulos de atención entre variantes de Qwen2.
- Benchmarking de perplejidad en WikiText-2: útil como baseline controlado (PPL 36,81) para comparar nuevas variantes de atención sobre el mismo base y dataset.
- Docencia y divulgación: ejemplo compacto y de código abierto (MIT) para explicar cirugía de modelos, destilación de conocimiento y atención subcuadrática sin requerir clústeres grandes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad (causal) | WikiText-2 (`wikitext-2-raw-v1`, validation) | 36,81 |
| Perplejidad pre-destilación (Stage 0) | WikiText-2 validation | 235,49 |
| Delta de perplejidad | WikiText-2 validation | -198,67 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint. Tampoco se proporciona la perplejidad del modelo base Qwen2.5-0.5B sin cirugía como referencia directa en la model card.

## Requisitos de hardware

- VRAM para inferencia: el entrenamiento usó 15.855 MB de pico en FP16 con autocast y maestros FP32; para inferencia en FP16 del modelo completo (0,5B) se estima alrededor de 1-2 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para FP16; una RTX 4090, A100 o H100 es sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se instale la librería `neuralops` y se aplique la cirugía correspondiente.
- Opciones de despliegue: la carga requiere `neuralops` (`load_surgeried_model`) o el flujo manual con `apply_qwen_attention_surgery` y `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF, el despliegue en esos motores no está cubierto.
- Latencia y throughput: no disponibles. Solo se conoce el tiempo de entrenamiento (180,3 s para 396 pasos con `seq_len=512`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2` | 0,5B | no disponible | 36,81 (declarada) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (según especificación pública de Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |

La comparación directa con el base no puede cerrarse porque la model card no incluye la perplejidad del Qwen2.5-0.5B original en WikiText-2. La diferencia clave frente a los modelos de Alibaba es la arquitectura de atención (híbrida con compresión de tokens) y el hecho de que este checkpoint solo distribuye pesos de atención, no un modelo autónomo listo para usar sin la librería `neuralops`.

## Limitaciones y advertencias

- Es un checkpoint experimental de investigación, no un modelo listo para producción: solo se publican pesos de atención (163,48 MB) y requiere aplicar la cirugía y cargar el base Qwen2.5-0.5B por separado.
- Dependencia de la librería `neuralops` y de `apply_qwen_attention_surgery`; no hay soporte documentado en motores de inferencia estándar como vLLM, llama.cpp, Ollama o TGI.
- Entrenado únicamente sobre WikiText-2 con `seq_len=512`; el dominio y la longitud de contexto están muy acotados y no se garantiza un comportamiento correcto fuera de ese régimen.
- Idioma declarado: solo inglés. No se garantiza calidad multilingüe aunque el base la tuviera.
- Riesgo de alucinación y degradación de capacidades instruccionales tras la cirugía y la destilación; no se han publicado evaluaciones de MMLU, HumanEval ni GSM8K que lo descarten.
- La perplejidad de 36,81 está declarada por el autor y marcada como `verified: false`; no ha sido validada de forma independiente.
- Licencia MIT para los pesos publicados, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según la especificación pública de Qwen); conviene revisar ambas antes de uso comercial.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, hereda los sesgos del corpus y del base sin mitigación adicional.
- El módulo declara soporte de RoPE como `N/A`, lo que puede afectar a la extrapolación de contexto más allá de la longitud de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
