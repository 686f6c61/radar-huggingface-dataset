# tahamajs/qwen-2.5-0.5b-cosformer-wikitext2

## Resumen

`qwen-2.5-0.5b-cosformer-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. Se trata de un Qwen2.5-0.5B original de Alibaba Qwen al que se le han sustituido quirúrgicamente 18 de sus 24 bloques de atención (un 75 %, con topología híbrida 3:1) por el operador de atención lineal `CosformerAttention` de la librería NeuralOps. Los seis bloques restantes (índices 3, 7, 11, 15, 19 y 23) conservan la atención softmax GQA original de Qwen2 como anclas de recuperación contextual global.

El objetivo del experimento es evaluar si es posible convertir un transformer causal compacto en un modelo de complejidad subcuadrática mediante cirugía de atención y destilación de conocimiento, sin colapsar la capacidad de modelado del lenguaje. Tras el transplante, el modelo sufre un colapso severo (perplejidad de 345.903,37 en WikiText-2) que se recupera parcialmente mediante un protocolo de destilación de representaciones ocultas en dos etapas entrenado en una única RTX 3090.

El resultado es un modelo de 550 millones de parámetros (494 M en el backbone base más proyecciones adaptadas) con licencia MIT, pensado exclusivamente como artefacto de investigación sobre eficiencia de atención, no como modelo listo para producción. Su perplejidad final de 498,61 frente a los 15,38 del profesor original evidencia que la destilación recupera solo una fracción de la calidad, lo que lo convierte en una pieza de estudio sobre los límites de la atención lineal en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal Qwen2 con atención híbrida: 18/24 capas con `CosformerAttention` (lineal) y 6/24 con GQA softmax nativa |
| Parametros totales | 550.347.154 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1.049,77 MB, más un adaptador) |
| Idiomas soportados | inglés (etiqueta `en` en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`: 24 capas decoder, dimensión oculta D=896, 14 cabezas de consulta y 2 cabezas KV (GQA), dimensión por cabeza d_h=64, con RoPE configurado a theta=1.000.000. Sobre esa base, NeuralOps aplica una cirugía determinista `hybrid_3_1`: los índices de capa [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se envuelven en `QwenAttentionAdapter` con el operador `cosformer`, mientras que [3, 7, 11, 15, 19, 23] mantienen la atención softmax GQA preentrenada. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicados, lo que evita el colapso de proyecciones no inicializadas.

El operador Cosformer implementa atención lineal con soporte causal autoregresivo, gestión de GQA y un despacho de kernel en tres niveles (CUDA / Triton / PyTorch). Tras el transplante, el modelo pasa por una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 57 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layernorms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), minimizando MSE por capa más 0.25·(1 − coseno) entre estados ocultos. La etapa 2 (70 % del presupuesto, 159 pasos) aplica destilación extremo a extremo con una pérdida de alineación más estricta (MSE + 0.50·(1 − coseno)). El entrenamiento usa FP32 para pesos maestros con AMP FP16 y GradScaler.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del backbone Qwen2.5-0.5B.
- Atención lineal subcuadrática en el 75 % de las capas, con complejidad O(n) teórica en esas capas frente a O(n²) de la atención softmax.
- Soporte de GQA en las capas transplantadas mediante expansión de cabezas KV de 2 a 14.
- Soporte causal autoregresivo confirmado por el autor en el operador Cosformer.
- Capacidad conversacional declarada por el pipeline `text-generation` y la etiqueta `conversational`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma de la model card.
- Capacidad de razonamiento y código severamente degradada por la pérdida de calidad tras la destilación (perplejidad 498,61 frente a 15,38 del profesor).

## Casos de uso

- Investigación sobre atención lineal: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención softmax por Cosformer en un transformer causal compacto, comparando perplejidad pre y post destilación con el profesor original.
- Estudio de topologías híbridas: permite experimentar con la proporción 3:1 entre capas lineales y capas softmax ancla, evaluando cuántas capas softmax son necesarias para preservar la recuperación contextual global.
- Validación de protocolos de destilación: el par de etapas (alineación de subespacio con backbone congelado y destilación extremo a extremo) puede replicarse sobre otros modelos base para comparar estrategias de recuperación tras cirugía.
- Benchmarking de kernels de atención: al incluir despacho CUDA/Triton/PyTorch, es útil para medir latencia y throughput de cada backend en una RTX 3090 u otras GPU consumer.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación de conocimiento con telemetría completa (PPL pre-KD de 345.903,37, post-KD de 498,61, delta de −345.404,77).
- Pruebas de infraestructura NeuralOps: valida la integración de la librería `neuralops` con el ecosistema Hugging Face, la serialización determinista de pesos y la caché offline de representaciones del profesor.
- No recomendado para atención al cliente, generación de código en producción ni aplicaciones que requieran calidad lingüística, dado el elevado nivel de perplejidad.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Evaluación en WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch_size=8, grad_accum=4, sobre NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot pre-KD | 345.903,37 | Inmediatamente tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-KD | 498,61 | Tras destilación de representaciones en dos etapas |
| Delta absoluto de perplejidad | −345.404,77 | Mejora lograda por la destilación |
| Reducción relativa de perplejidad | 99,86 % | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos (1.049,77 MB) más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB; para inferencia bastan GPU consumer como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM en FP16; con cuantización a 8 bits o 4 bits (si se generan los pesos con herramientas externas) cabría en GPUs de 2 GB.
- Opciones de despliegue: la librería nativa es `neuralops`, que requiere el operador `CosformerAttention`; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura híbrida con atención lineal personalizada no es estándar en esos runners.
- Latencia y throughput: no disponibles. El despacho de kernel en tres niveles (CUDA / Triton / PyTorch) sugiere que el rendimiento depende del backend seleccionado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-cosformer-wikitext2` | 550 M | no disponible | 498,61 (post-KD) | MIT | Hugging Face (328 descargas) |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens | 15,38 | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B` | 1.500 M | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1.200 M | 128.000 tokens | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face |

La comparativa relevante es contra el propio profesor: el modelo destilado multiplica por 32 la perplejidad del original (498,61 frente a 15,38) a cambio de atención lineal en el 75 % de las capas. Frente a alternativas de tamaño similar como Qwen2.5-1.5B o Llama-3.2-1B, el modelo de tahamajs no es competitivo en calidad, pero sí es singular como artefacto de investigación sobre atención subcuadrática.

## Limitaciones y advertencias

- Calidad lingüística muy degradada: la perplejidad post-destilación (498,61) es más de 32 veces la del modelo base (15,38), lo que implica generaciones incoherentes o repetitivas en la práctica.
- El colapso inicial tras la cirugía es extremo (PPL de 345.903,37); la destilación recupera solo un 99,86 % del pico, no la calidad original.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus WikiText-2 y del backbone Qwen2.5-0.5B, pero no se han realizado evaluaciones específicas.
- Riesgo de alucinación: muy elevado, derivado de la alta perplejidad y de la falta de ajuste fino conversacional o RLHF tras la cirugía.
- Limitación de idioma: solo inglés según la etiqueta `en`; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto efectivo no confirmado: aunque el modelo base soporta 32.768 tokens, la atención lineal Cosformer y la cirugía pueden alterar el comportamiento en secuencias largas; no hay evaluación publicada.
- Restricciones de licencia: MIT permite uso comercial, pero la calidad del modelo hace inviable su uso en producción; además, el backbone Qwen2.5-0.5B original está bajo Apache 2.0, lo que conviene verificar en la distribución derivada.
- Dependencia de la librería `neuralops`: no es un modelo estándar de `transformers`; requiere el operador `CosformerAttention` para cargarse correctamente, lo que limita la portabilidad a vLLM, llama.cpp, Ollama o TGI.
- Artefacto de investigación: el autor lo publica dentro de un "Attention Surgery Zoo" con fines experimentales, no como modelo listo para despliegue.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cosformer-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador Cosformer: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/cosformer.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
