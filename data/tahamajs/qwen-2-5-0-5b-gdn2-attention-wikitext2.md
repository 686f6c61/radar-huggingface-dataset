# tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-gdn2-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Surgery Zoo. No es un modelo entrenado desde cero, sino el resultado de una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención softmax GQA del transformer original por el operador `gdn2_attention` (Gated DeltaNet 2 con recurrencia lineal y borrado/escritura desacoplados), manteniendo 6 capas nativas como anclas de recuperación global. El objetivo declarado es explorar atenciones subcuadráticas en modelos causales compactos y medir el coste de la sustitución vía destilación de representaciones ocultas.

La relevancia del artefacto es metodológica más que práctica: sirve como banco de pruebas reproducible para investigar arquitecturas híbridas de atención lineal y técnicas de destilación sobre WikiText-2. El propio autor reporta que la perplejidad tras la destilación en dos etapas no mejora respecto al estado cero-shot posterior a la cirugía, lo que convierte al modelo en un caso de estudio sobre los límites de la destilación con presupuestos mínimos (6 pasos totales) y sobre la dificultad de transplantar operadores recurrentes en modelos pequeños.

El modelo tiene 533.994.100 parámetros según los pesos safetensors y un tamaño de repositorio de 1,2 GB. La model card declara licencia MIT, idioma inglés y pipeline de generación de texto, aunque las capacidades conversacionales reales no están validadas empíricamente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `gdn2_attention` (Gated DeltaNet 2, recurrencia lineal) y 6/24 capas con GQA softmax nativa de Qwen2 |
| Parametros totales | 533.994.100 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 1018,56 MB, más un adaptador) |
| Idiomas soportados | inglés (declarado en la model card; el modelo base es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas decoder, dimensión oculta D=896, 14 cabezas de query y 2 de key/value (GQA), dimensión por cabeza d_h=64, RoPE con theta=1.000.000. La cirugía `hybrid_3_1` sustituye las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `GDN2Attention`, un operador de la familia `gated` implementado en `neuralops/layers/gated/flagship_fla.py`. La formulación del operador es S_t = S_{t-1} · alpha_t · (I − beta_erase_t · k_t k_t^T) + beta_write_t · k_t v_t^T, es decir, una recurrencia lineal con compuertas de borrado y escritura desacopladas. Las 6 capas restantes [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax original para mantener el enrutamiento contextual global y las cabezas de inducción. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 mediante un adaptador, y un único `o_proj` sin duplicación. El operador soporta despacho de kernels en tres niveles (CUDA, Triton, PyTorch).

El entrenamiento consiste en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 2 pasos) congela embeddings, MLPs y `lm_head`, y entrena solo módulos de atención y layer norms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), pesos maestros FP32 con AMP FP16 y GradScaler, minimizando MSE por capa más 0.25·(1 − cos(h_s, h_t)). La etapa 2 (70% del presupuesto, 4 pasos) hace destilación extremo a extremo con lr=6.0e-5 y el mismo objetivo con peso coseno de 0.50. El presupuesto total es de 6 pasos de optimización, lo que explica el resultado nulo de la destilación.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento básico y respuesta conversacional de un modelo de 0,5B, sin validación empírica específica en la información disponible.
- Generación de código y matemáticas elementales: capacidad potencial por herencia del modelo base, no evaluada en la model card.
- Tool calling y function calling: no disponible (no declarado ni evaluado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado ni evaluado).
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base es multilingüe.
- Modo thinking, visión o audio: no disponible.
- Eficiencia de atención lineal en 18 de 24 capas, con despacho de kernels CUDA/Triton/PyTorch, orientada a reducir el coste cuadrático en secuencias largas.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el checkpoint permite reproducir el experimento de cirugía `hybrid_3_1` y comparar la perplejidad frente al profesor Qwen2.5-0.5B en WikiText-2 con el mismo protocolo (secuencia 512, batch 8, grad_accum 4).
- Estudio de destilación de representaciones ocultas: sirve como caso base para medir cuánto recupera la destilación de dos etapas con presupuestos mínimos (6 pasos) frente a presupuestos mayores, usando la telemetría reportada (PPL 1.805.602,10 antes y después).
- Benchmark de operadores `gdn2_attention`: útil para validar el despacho de kernels CUDA/Triton/PyTorch de NeuralOps en una GPU consumer (RTX 3090) y comparar latencia y throughput frente a la atención GQA nativa.
- Prototipado de modelos híbridos compactos: permite experimentar con proporciones de capas lineales vs. softmax (3:1 en este caso) en un modelo de 0,5B que cabe en una sola GPU de 24 GB.
- Educación y divulgación técnica: ejemplo reproducible de cirugía de atención, herencia de pesos `q/k/v/o_proj` y expansión de cabezas KV de 2 a 14 mediante adaptador.
- Pruebas de integración de la librería `neuralops`: el checkpoint valida el pipeline de serialización determinista de pesos y el formato safetensors FP16 más adaptador en un flujo de carga real.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (WikiText-2, `wikitext-2-raw-v1`, split de validación, secuencia 512, batch_size 8, grad_accum 4, RTX 3090 24 GB). El valor de perplejidad del estudiante está marcado como no verificado (`verified: false`).

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax causal exacta |
| Perplejidad del estudiante zero-shot tras cirugía (pre-KD) | 1.805.602,10 | Inmediatamente tras transplantar 18/24 capas |
| Perplejidad del estudiante destilado (post-KD) | 1.805.602,10 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | +0,00 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 0,00% | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB solo para pesos (1018,56 MB), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB (no se publican GGUF oficiales, la cuantización requeriría conversión propia).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 en secuencias moderadas; el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB. Para despliegue en producción, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: la librería `neuralops` es la vía nativa; para vLLM, llama.cpp, Ollama o TGI sería necesaria conversión y soporte del operador `gdn2_attention`, que no está declarado en la información disponible.
- Latencia y throughput: no disponibles. La model card no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2` | 533.994.100 | no disponible | 1.805.602,10 (post-KD, no verificado) | MIT | Hugging Face (334 descargas) |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494M | 32.768 tokens | 15,38 (referencia del autor) | Apache 2.0 | Hugging Face, ampliamente desplegado |
| `Qwen/Qwen2.5-1.5B` | 1,5B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `meta-llama/Llama-3.2-1B` | 1,2B | 128.000 tokens | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face |

La comparativa directa con alternativas de atención lineal (Mamba, RWKV, Griffin) no está disponible en la información proporcionada. El dato clave es que el checkpoint quirúrgico está tres órdenes de magnitud por encima en perplejidad respecto a su profesor, sin recuperación tras la destilación.

## Limitaciones y advertencias

- Perplejidad post-cirugía de 1.805.602,10 frente a 15,38 del profesor: el modelo no es utilizable para generación de texto de calidad en producción.
- La destilación en dos etapas con solo 6 pasos de optimización no produce ninguna mejora medible (delta +0,00, reducción 0,00%).
- El resultado de perplejidad está marcado como no verificado (`verified: false`) en el model-index.
- Riesgo elevado de alucinación y salidas incoherentes por la degradación severa de la distribución de probabilidad.
- Idiomas: la model card declara solo inglés; el comportamiento multilingüe no está evaluado.
- Contexto efectivo tras la cirugía no documentado; no se debe asumir la ventana de 32.768 tokens del modelo base.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable cualquier despliegue productivo real.
- Dependencia de la librería `neuralops` y del operador `gdn2_attention`; no hay soporte declarado en vLLM, llama.cpp, Ollama o TGI.
- El modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0; conviene revisar la compatibilidad si se redistribuye.
- No hay datos de sesgos específicos, evaluación de seguridad ni pruebas de robustez en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gdn2-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/Salesforce/wikitext
