# tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2` es un checkpoint experimental publicado por el desarrollador independiente tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un fine-tuning quirúrgico de `Qwen/Qwen2.5-0.5B` en el que 18 de las 24 capas de atención del decoder original han sido reemplazadas por el operador `gqa_attention` (GroupedQueryAttention) de la librería NeuralOps, seguidas de un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. El modelo base es un transformer causal de 494M parámetros con 24 capas, dimensión oculta 896, 14 cabezas de query y 2 cabezas KV.

El interés del checkpoint no reside en su rendimiento absoluto, sino en su valor como artefacto de investigación sobre sustitución de operadores de atención en modelos compactos. El autor documenta con detalle la topología híbrida aplicada (ratio 3:1, con seis capas ancla que conservan la GQA nativa de Qwen2) y la telemetría del proceso de destilación, incluyendo la perplejidad antes y después del proceso. La perplejidad final en WikiText-2 es de 126.42, frente a los 15.38 del modelo profesor, lo que sitúa al checkpoint muy lejos de la paridad con el original.

El modelo se distribuye con licencia MIT, en formato safetensors y FP16 completo (aproximadamente 1 GB de pesos), con un total de 535.364.224 parámetros según los tensores reales del repositorio. Está pensado para experimentación en atención subcuadrática y destilación, no para uso en producción como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con topología híbrida: 18/24 capas con operador `gqa_attention` (NeuralOps) y 6/24 capas con GQA nativa de Qwen2 |
| Parametros totales | 535.364.224 (según safetensors); 494M según la model card para el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la model card no declara contexto para este checkpoint) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos FP16 completos de 1.021,18 MB más un adaptador) |
| Idiomas soportados | Inglés (declarado en la model card; el modelo base es multilingüe pero este checkpoint no declara otros idiomas) |
| Licencia | MIT |
| Formato de pesos | Safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 bloques, dimensión oculta D=896, 14 cabezas de query, 2 cabezas KV y dimensión por cabeza de 64, con RoPE configurado a theta = 1.000.000. Sobre esa base, NeuralOps aplica una cirugía determinista denominada `hybrid_3_1`: las capas con índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] sustituyen su atención por `gqa_attention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única `o_proj` sin duplicación.

El operador `gqa_attention` declara soporte causal autoregresivo, gestión de caché KV, aceleración SDPA y un despacho de kernels en tres niveles (CUDA, Triton, PyTorch). El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`, split de validación), con longitud de secuencia 512, batch_size 8 y acumulación de gradiente 4, ejecutada en una única RTX 3090 de 24 GB mediante la arquitectura de caché offline de representaciones de NeuralOps (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 118 pasos) congela embeddings, MLPs y `lm_head` y entrena solo módulos de atención y layer norms con AdamW (lr 2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0.25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 (70 % del presupuesto, 270 pasos) aplica destilación end-to-end de representaciones con un objetivo descrito como "tightened layer-w..." en la información disponible, sin más detalle.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno básica (pipeline declarado: text-generation, tag conversational).
- Soporte de atención causal con caché KV y aceleración SDPA mediante el operador `gqa_attention`.
- Despacho de kernels en tres niveles (CUDA, Triton, PyTorch) según disponibilidad de hardware.
- Capacidad de servir como banco de pruebas para experimentos de sustitución de atención y destilación de representaciones.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint permite comparar el comportamiento de un operador GQA alternativo frente a la GQA nativa de Qwen2 en un modelo compacto, con telemetría de perplejidad publicada antes y después de la destilación.
- Reproducción de experimentos de destilación: la model card documenta el protocolo en dos etapas, hiperparámetros y hardware, lo que facilita replicar el pipeline con la librería NeuralOps en una GPU de consumo.
- Estudio de topologías híbridas: el layout 3:1 con capas ancla permite analizar el impacto de preservar atención softmax preentrenada en capas específicas sobre la recuperación de perplejidad.
- Benchmark de operadores de atención: útil para medir latencia y throughput de `gqa_attention` con despacho Triton/CUDA frente a implementaciones de referencia en secuencias de 512 tokens.
- Docencia y formación: ejemplo didáctico de cirugía de atención y destilación de estados ocultos en un modelo de 0,5B que cabe en una RTX 3090.
- Prototipado de pipelines de evaluación: sirve como sujeto de prueba para herramientas de evaluación de perplejidad en WikiText-2 con configuración fija (seq_len 512, batch 8, grad_accum 4).
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final, dado el deterioro de perplejidad frente al modelo base.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Métrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del alumno zero-shot tras la cirugía (pre-KD) | 579.546,96 | Inmediatamente después del transplante de 18/24 capas |
| Perplejidad del alumno destilado (post-KD) | 126,42 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplejidad | −579.420,54 | Cambio logrado mediante destilación |
| Reducción relativa de perplejidad | 99,98 % | Recuperación desde el pico post-cirugía |

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext (wikitext-2-raw-v1) | validation | Perplexity | 126,42 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo para pesos (1.021,18 MB), más caché KV y activaciones; en la práctica, menos de 3 GB para secuencias de 512 tokens con batch pequeño.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,35 GB (estimación a partir del tamaño FP16, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o CPU para inferencia lenta.
- Opciones de despliegue: la librería declarada es `neuralops`, por lo que la carga requiere esa librería o la conversión de los pesos al formato esperado por vLLM, llama.cpp, Ollama o TGI. No se documenta compatibilidad directa con esos motores en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta la configuración de entrenamiento (RTX 3090, seq_len 512, batch 8, grad_accum 4) sin métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2` | 535M | No disponible | 126,42 (post-KD) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32.768 tokens | No disponible | Apache 2.0 | Hugging Face |
| `HuggingFaceTB/SmolLM2-360M` | 360M | 8.192 tokens | No disponible | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: el checkpoint destilado multiplica por 8,2 la perplejidad del profesor (126,42 frente a 15,38), lo que refleja el coste de la sustitución de atención en un modelo tan compacto. Frente a alternativas de tamaño similar como SmolLM2-360M o Qwen2.5-0.5B-Instruct, el checkpoint de NeuralOps no ofrece ventajas de rendimiento declaradas y su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Perplejidad muy superior a la del modelo base (126,42 frente a 15,38), lo que indica una degradación sustancial de la calidad de generación.
- El checkpoint se entrenó únicamente sobre WikiText-2 en inglés; no hay evidencia de generalización a otras distribuciones o idiomas.
- Solo se declara soporte de inglés; el multilingüismo del modelo base no está garantizado tras la cirugía y la destilación.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, dado el deterioro de perplejidad.
- No se declaran evaluaciones de sesgo, seguridad ni alineación; el checkpoint no ha pasado por RLHF ni DPO según la información disponible.
- La longitud de contexto efectiva no está documentada; no se debe asumir el contexto de 32.768 tokens del modelo base.
- La licencia MIT permite uso comercial, pero el estado experimental del checkpoint hace desaconsejable su empleo en producción.
- Requiere la librería `neuralops` para cargar el modelo tal cual; la compatibilidad con motores estándar (vLLM, llama.cpp, TGI) no está documentada.
- El autor no ha publicado verificación independiente de las métricas; el model-index marca el resultado de perplejidad como `verified: false`.
- El repositorio tiene 343 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `gqa_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/gqa_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
