# tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una cirugía de atención sobre 18 de las 24 capas del decoder, sustituyendo la atención softmax GQA original por el operador `gla_attention` (Gated Linear Attention) de la librería NeuralOps. Las 6 capas restantes conservan la atención GQA nativa como anclas de recuperación contextual, siguiendo un patrón híbrido 3:1. El modelo lo publica el usuario tahamajs como parte del "Attention Surgery Zoo" de NeuralOps, un proyecto de investigación sobre atención subcuadrática.

El modelo no es un modelo de propósito general: es un artefacto de investigación para estudiar la viabilidad de sustituir atención softmax por atención lineal en modelos compactos de 0,5B parámetros mediante destilación de representaciones ocultas sobre WikiText-2. Con 519.096.508 parámetros totales (frente a los 494M del base, por la expansión de cabezas KV en el adaptador), el checkpoint se distribuye en safetensors con pesos completos en FP16 (~990 MB) más un adaptador.

La relevancia actual es metodológica: documenta de forma transparente un resultado negativo. La perplejidad en validación de WikiText-2 tras la destilación es de 400.580,78 frente a 15,38 del profesor, es decir, la destilación no recupera nada (delta 0,00). Es un caso útil para quienes investigan atención lineal, destilación y límites de la cirugía de atención en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Qwen2 con 18/24 capas sustituidas por `gla_attention` (Gated Linear Attention, familia linear) y 6/24 capas con GQA softmax nativa (híbrido 3:1) |
| Parametros totales | 519.096.508 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado/evaluado a longitud de secuencia 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo + adaptador) |
| Idiomas soportados | inglés (declarado en la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo, ~990,14 MB, más adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (24 capas, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV, dimensión de cabeza 64). La cirugía sustituye la atención en los índices de capa [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] por `GLAttention`, una capa de atención lineal con recurrencia S_t = exp(g_t) · S_{t-1} + (K_t / sqrt(d))^T · V_t y salida O_t = Q_t · S_t, donde g_t = logsigmoid(gate_logits / tau) ≤ 0. Las capas [3, 7, 11, 15, 19, 23] mantienen la GQA softmax preentrenada. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 mediante un adaptador (`QwenAttentionAdapter`) y manejo de RoPE con theta = 1.000.000. El kernel usa despacho a tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consistió en destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con caché offline de representaciones del profesor en una RTX 3090 de 24 GB (0 MB de VRAM del profesor en GPU). La etapa 1 (30% del presupuesto, 6 pasos) congela embeddings, MLP y `lm_head` y entrena solo módulos de atención y layernorms con AdamW (lr=2.0e-4, weight decay 0.01, clipping 1.0), objetivo MSE por capa + 0.25·(1 − cos). La etapa 2 (70% del presupuesto, 11 pasos) hace destilación extremo a extremo con lr=6.0e-5 y peso 0.50 en el término coseno. El resultado es que la destilación no reduce la perplejidad: la métrica post-KD es idéntica a la pre-KD.

## Capacidades

- Generación de texto causal autorregresiva, heredada de la interfaz de Qwen2.5-0.5B.
- Razonamiento y conocimiento general: nominalmente presentes por herencia del base, pero degradados de forma severa según la perplejidad medida (400.580,78 en WikiText-2).
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado; el resto no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Valor como artefacto de investigación: permite reproducir y auditar el efecto de la cirugía de atención y del protocolo de destilación de NeuralOps.

## Casos de uso

- Investigación sobre atención lineal: usar el checkpoint como referencia reproducible para estudiar por qué la sustitución de atención softmax por GLA colapsa la perplejidad en modelos de 0,5B, comparando contra el profesor Qwen2.5-0.5B.
- Auditoría de protocolos de destilación: el par pre-KD/post-KD con delta 0,00 permite evaluar si el esquema de destilación de representaciones (MSE + coseno, 17 pasos totales) es suficiente o está mal calibrado.
- Desarrollo y test de la librería NeuralOps: sirve para validar el adaptador `QwenAttentionAdapter`, la expansión GQA 2→14 y el despacho de kernels CUDA/Triton/PyTorch en un caso real.
- Estudio de arquitecturas híbridas: el layout 3:1 (18 capas lineales + 6 softmax) permite experimentar con distintas proporciones y posiciones de capas ancla.
- Reproducción de infraestructura de bajo coste: el pipeline de caché offline de representaciones (0 MB de VRAM del profesor) es reutilizable en una única RTX 3090 para otros experimentos de destilación.
- Docencia y divulgación: ejemplo concreto y medido de los límites de la cirugía de atención y de la diferencia entre "entrenar" y "recuperar capacidad".

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre WikiText-2 (`wikitext-2-raw-v1`), split de validación, longitud de secuencia 512, batch_size=8, grad_accum=4, en una NVIDIA GeForce RTX 3090 de 24 GB.

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 | Referencia GQA softmax exacta |
| Perplejidad del estudiante pre-KD (zero-shot) | 400.580,78 | Tras el transplante de 18/24 capas |
| Perplejidad del estudiante post-KD | 400.580,78 | Tras destilación de representaciones en 2 etapas |
| Delta absoluto de perplejidad | +0,00 | Cambio logrado por la destilación |
| Reducción relativa de perplejidad | 0,00% | Recuperación desde el pico post-cirugía |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP16 (~990 MB) caben en menos de 2 GB de VRAM; con overhead de activaciones, por debajo de 4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usó una RTX 3090 (24 GB) para el pipeline de destilación, no para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: la librería `neuralops` es la vía documentada; vLLM, llama.cpp, Ollama y TGI no están confirmados para este operador `gla_attention`, por lo que su uso requeriría portar la capa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (qwen-2.5-0.5b-gla-attention-wikitext2) | 519.096.508 | no disponible (evaluado a 512) | 400.580,78 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | ~494M | 32.768 tokens (según ficha del base) | 15,38 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | ~1.540M | 32.768 tokens (según ficha del base) | no disponible en esta información | Apache 2.0 | Hugging Face |
| Modelos con atención lineal pura (p. ej. variantes GLA) | variable | variable | no disponible | variable | variable |

La comparación directa con el profesor es la más informativa: mismo tamaño y mismo tokenizador, pero una diferencia de perplejidad de más de cuatro órdenes de magnitud.

## Limitaciones y advertencias

- Calidad de generación severamente degradada: una perplejidad de 400.580,78 en WikiText-2 implica que el modelo no produce texto coherente en la práctica; no debe usarse en producción.
- La destilación no recuperó capacidad alguna (delta 0,00), lo que sugiere que el protocolo de 17 pasos es insuficiente o que la cirugía destruye información no recuperable con este esquema.
- Riesgo de alucinación: muy alto, consecuencia directa del colapso de la distribución de probabilidad.
- Idiomas: solo inglés declarado; no hay evidencia de capacidades multilingües.
- Contexto: no se documenta la longitud de contexto soportada; la evaluación se hizo a 512 tokens.
- Licencia MIT: permite uso comercial, pero la calidad del modelo hace inviable cualquier uso real más allá de la investigación.
- Dependencia de la librería `neuralops` y del operador `gla_attention`: no es un checkpoint estándar de `transformers` y requiere el código del proyecto para cargarse.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`).
- El modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0; conviene revisar la compatibilidad al redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `gla_attention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/gla_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
