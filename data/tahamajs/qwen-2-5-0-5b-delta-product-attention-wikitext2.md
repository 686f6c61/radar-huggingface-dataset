# tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención" (*attention surgery*): 18 de las 24 capas del decoder original han sido sustituidas por el operador `delta_product_attention` (DeltaProductAttention) de la librería NeuralOps, manteniendo las 6 capas restantes con la atención GQA softmax nativa de Qwen2 (topología híbrida 3:1). Posteriormente se aplicó un proceso de destilación de conocimiento en dos etapas sobre WikiText-2 (`Salesforce/wikitext`), usando el modelo base como profesor.

El modelo lo publica el usuario `tahamajs`, autor de NeuralOps, y su propósito no es ofrecer un modelo de producción, sino servir como artefacto de investigación para estudiar la viabilidad de sustituir atención cuadrática por operadores subcuadráticos (basados en reflexiones de Householder acumuladas secuencialmente) en modelos compactos de 0.5B. La relevancia actual radica en el interés creciente por arquitecturas de atención lineal/subcuadrática que reduzcan el coste de inferencia en contextos largos.

El resultado empírico es, sin embargo, negativo: la perplejidad medida en el split de validación de WikiText-2 es `inf` tanto antes como después de la destilación, frente a `15.38` del profesor (Qwen2.5-0.5B original). Es decir, el checkpoint no es funcional como modelo de lenguaje en el momento de la publicación. El repositorio ocupa 1.2 GB e incluye pesos en FP16 completos más un adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `delta_product_attention` (NeuralOps, gated, subcuadrática) + 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 533.525.884 (según safetensors); 494M según la model card para el base Qwen2.5-0.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; el entrenamiento se realizó con `seq_len=512`; RoPE con `theta = 1.000.000` (heredado de Qwen2.5) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1017,66 MB, más adaptador) |
| Idiomas soportados | inglés (`en` según la model card); el resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, dimensión oculta D=896, 14 cabezas de query y 2 de clave/valor (GQA), dimensión de cabeza 64. La cirugía sustituye la atención en los índices de capa `[0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22]` por `DeltaProductAttention`, que modela el estado mediante reflexiones ortogonales de Householder acumuladas a lo largo de la secuencia (isometría estricta, espectro acotado y preservación de norma). Las capas `[3, 7, 11, 15, 19, 23]` conservan la GQA softmax original como anclas de enrutamiento contextual. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 mediante un adaptador (`QwenAttentionAdapter`) y manejo de RoPE también vía adaptador.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`, `seq_len=512`, `batch_size=8`, `grad_accum=4`). La etapa 1 (30 % del presupuesto, 2 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo atención y layer norms con AdamW (`lr=2.0e-4`, `weight_decay=0.01`, clipping 1.0) minimizando `MSE + 0.25·(1 − cos(h_s, h_t))`. La etapa 2 (70 %, 5 pasos) ajusta extremo a extremo con `lr=6.0e-5` y pérdida `MSE + 0.50·(1 − cos(h_s, h_t))` sobre los 24 flujos residuales, omitiendo `lm_head` para maximizar throughput. En total: 7 pasos de optimización, 201 s de reloj y 20.973 MB de VRAM pico en una RTX 3090. La destilación usó caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU durante el ajuste).

## Capacidades

- Generación de texto causal autoregresiva (soporte declarado en la model card), aunque en la práctica el checkpoint publicado produce perplejidad infinita en WikiText-2 y no es funcional como generador.
- Conversacional: el `pipeline_tag` es `text-generation` y los tags incluyen `conversational`, heredados del modelo base.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara inglés; el resto no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- La innovación técnica del checkpoint es la sustitución de atención por un operador subcuadrático con isometría estricta, no una capacidad funcional adicional.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como artefacto reproducible para estudiar el impacto de sustituir atención softmax por `DeltaProductAttention` en un modelo de 0.5B, con telemetría de destilación y topología documentadas.
- Reproducción de experimentos de *attention surgery*: permite replicar el protocolo de dos etapas sobre WikiText-2 y comparar perplejidad pre/post destilación frente al profesor Qwen2.5-0.5B.
- Estudio de topologías híbridas: la proporción 3:1 (18 capas transplantadas / 6 anclas GQA) es un punto de partida para analizar el equilibrio entre eficiencia subcuadrática y recuperación de *induction heads*.
- Análisis de fallos de destilación: la perplejidad `inf` documentada es un caso de estudio sobre los límites de la destilación de representaciones ocultas con presupuestos muy reducidos (7 pasos).
- Desarrollo de la librería NeuralOps: el checkpoint valida (o invalida) la integración de `DeltaProductAttention` con adaptadores GQA y RoPE en el ecosistema NeuralOps (dispatch CUDA/Triton/PyTorch).
- Benchmarking de kernels: útil para medir rendimiento de los kernels subcuadráticos frente a la GQA softmax de Qwen2 en hardware consumer (RTX 3090).

## Benchmarks y rendimiento

| Métrica (WikiText-2 valid, seq_len=512) | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | GQA softmax causal de referencia |
| Perplejidad del estudiante pre-destilación (zero-shot) | `inf` | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-destilación | `inf` | Tras las 2 etapas de destilación |
| Delta absoluto de perplejidad | `nan` | No calculable |
| Reducción relativa de perplejidad | N/A | No calculable |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la perplejidad en WikiText-2, que es infinita para el estudiante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 533,5M parámetros en FP16, el peso ocupa ~1,07 GB; en FP32 ~2,1 GB; una cuantización a 8 bits rondaría ~0,55 GB y a 4 bits ~0,28 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: la model card documenta el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB); para inferencia basta con cualquier GPU consumer con ≥4 GB de VRAM en FP16, aunque el checkpoint no es funcional.
- Cabe en GPU consumer: sí, por tamaño (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, etc.), pero la salida no es utilizable como modelo de lenguaje.
- Opciones de despliegue: la librería declarada es `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que los pesos son safetensors FP16 con un adaptador propio, la carga requeriría el código de NeuralOps.
- Latencia y throughput: no disponibles. La telemetría de entrenamiento reporta 201 s para 7 pasos de destilación con 20.973 MB de VRAM pico en RTX 3090, pero no hay mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2` | 533,5M | no disponible (entrenado a 512) | `inf` | MIT | Hugging Face (329 descargas) |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens (heredado, no verificado en esta ficha) | 15,38 | Apache 2.0 (según el modelo base; no verificado aquí) | Hugging Face |
| Alternativas subcuadráticas de 0.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el profesor es la más informativa: mismo tamaño, misma tokenización y mismo dataset de evaluación, pero una diferencia de perplejidad de `inf` frente a `15,38`. No se dispone de otros modelos comparables de la misma categoría (atención subcuadrática aplicada a un 0.5B) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no es funcional: la perplejidad en WikiText-2 es `inf` antes y después de la destilación, lo que indica que la distribución de salida está colapsada o degenerada. No debe usarse en producción ni como generador de texto.
- El presupuesto de destilación es extremadamente reducido (7 pasos, 201 s), insuficiente para recuperar la funcionalidad tras sustituir el 75 % de las capas de atención.
- Solo se declara inglés; no hay evaluación multilingüe.
- Riesgo de alucinación: no evaluable, dado que el modelo no genera salidas coherentes.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del modelo base Qwen2.5-0.5B (Apache 2.0 según la información disponible) debe respetarse en la medida en que los pesos derivan de él.
- La topología híbrida 3:1 y la expansión de cabezas KV de 2 a 14 mediante adaptador introducen un sesgo estructural no cuantificado; no hay ablaciones publicadas.
- El modelo depende de la librería `neuralops` para cargarse (adaptador `QwenAttentionAdapter`, dispatch de kernels CUDA/Triton/PyTorch); no es un checkpoint estándar de `transformers`.
- La model card mezcla datos de parámetros (533,5M en safetensors frente a 494M declarados para el base) sin aclarar la discrepancia.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-delta-product-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador (`flagship_fla.py`): https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
