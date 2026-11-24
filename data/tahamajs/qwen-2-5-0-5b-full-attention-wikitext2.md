# tahamajs/qwen-2.5-0.5b-full-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-full-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que el autor (tahamajs, proyecto NeuralOps) ha sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el operador `FullAttention` de su propia librería, y ha aplicado después una destilación de conocimiento en dos etapas sobre WikiText-2. No es un modelo nuevo entrenado desde cero, sino un ejercicio de "cirugía de atención" (*attention surgery*) sobre los pesos preentrenados de Qwen2.5-0.5B, con el objetivo de validar la infraestructura de sustitución de operadores de NeuralOps.

El modelo conserva la arquitectura transformer densa de Qwen2.5 (24 capas, dimensión oculta 896, 14 cabezas de consulta y 2 de clave/valor con GQA, RoPE con theta 1.000.000) y un total de 535.364.224 parámetros según los pesos en safetensors. La relevancia es fundamentalmente metodológica: demuestra que es posible reemplazar la atención GQA nativa por atención multi-cabeza estándar con herencia de pesos y recuperar buena parte de la calidad mediante destilación, aunque el resultado final queda muy lejos del modelo profesor en perplejidad.

El interés práctico es limitado para producción: la perplejidad post-destilación en WikiText-2 es de 215,59 frente a los 15,38 del profesor, es decir, un modelo mucho peor en modelado de lenguaje. Su valor está en servir como referencia reproducible de las técnicas de sustitución de operadores y destilación de representaciones ocultas de NeuralOps, no como sustituto de Qwen2.5-0.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) con 18/24 capas de atención sustituidas por `FullAttention` (MHA estándar) y 6/24 capas GQA nativas de Qwen2 (híbrido 3:1) |
| Parametros totales | 535.364.224 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la ficha no confirma el contexto efectivo de este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (etiqueta `en` en la model card); no se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, ~1021,18 MB de pesos + adaptador; repo de 1,3 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 bloques de decodificador, dimensión oculta D=896, 14 cabezas de consulta, 2 cabezas KV (GQA), dimensión por cabeza 64 y RoPE con theta 1.000.000. Sobre esa base se aplica una "cirugía" determinista con ratio `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] (18 de 24, el 75 %) usan `FullAttention` envuelta en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] conservan la atención GQA softmax preentrenada como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansión de cabezas KV de 2 a 14 y una única proyección de salida sin duplicados. `FullAttention` es atención multi-cabeza escalada estándar (Vaswani et al., 2017) con soporte causal, GQA y RoPE, y despacho de kernels en tres niveles (CUDA / Triton / PyTorch).

El entrenamiento consiste en una destilación de conocimiento de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una única RTX 3090 de 24 GB con caché offline de representaciones del profesor (0 MB de VRAM del profesor en GPU). La etapa 1 (30 % del presupuesto, 117 pasos) congela el backbone y entrena solo módulos de atención y layer norms con AdamW (lr 2e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 con AMP FP16 y pérdida MSE + 0,25·(1 − coseno) por capa. La etapa 2 (70 %, 269 pasos) hace destilación extremo a extremo de representaciones con una alineación por capas más estricta. La perplejidad cero-shot tras la cirugía fue de 460.802,45 y bajó a 215,59 tras la destilación (reducción relativa del 99,95 %), frente a los 15,38 del profesor.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Conversación multi-turno (etiqueta `conversational` en el repo), sujeta a la degradación de calidad descrita por la perplejidad.
- Razonamiento básico y respuesta a instrucciones de un modelo de 0,5B, pero sin evaluación publicada que lo confirme tras la cirugía.
- Soporte de atención causal con RoPE y GQA en las capas ancla, lo que permite uso estándar como decodificador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidad multilingüe: solo inglés declarado; el resto de idiomas del modelo base no se garantiza.

## Casos de uso

- Investigación en sustitución de operadores de atención: permite reproducir el pipeline de *attention surgery* de NeuralOps sobre un modelo pequeño y verificar el impacto de cambiar GQA por MHA estándar en un decodificador de 24 capas.
- Estudio de destilación de representaciones ocultas: sirve como caso de referencia de destilación en dos etapas con caché offline de representaciones del profesor en una sola GPU de consumo.
- Docencia y divulgación: ejemplo didáctico de cómo se heredan pesos entre arquitecturas de atención distintas (expansión de 2 a 14 cabezas KV, reutilización de `o_proj`).
- Pruebas de integración de la librería NeuralOps: validación del despacho de kernels CUDA/Triton/PyTorch y del registro `ATTENTION_REGISTRY` en un modelo real.
- Prototipado de bajo coste en entornos con recursos limitados: al ser un modelo de 0,5B en FP16 (~1 GB), cabe en cualquier GPU de consumo para experimentos de generación de texto en inglés.
- Baseline negativo en evaluaciones: útil como referencia de un modelo degradado por cirugía para comparar contra Qwen2.5-0.5B original en tareas de perplejidad y generación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Metrica | Valor | Notas |
|---|---:|---|
| Perplejidad del profesor (Qwen2.5-0.5B) | 15,38 | Referencia GQA softmax causal |
| Perplejidad cero-shot tras cirugía (pre-KD) | 460.802,45 | Tras transplantar 18/24 capas |
| Perplejidad post-destilación (post-KD) | 215,59 | Medida en WikiText-2 validation, longitud 512 |
| Delta absoluto de perplejidad | −460.586,86 | Cambio logrado por destilación |
| Reducción relativa de perplejidad | 99,95 % | Recuperación desde el pico post-cirugía |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,1 GB de pesos más caché KV y activaciones; en la práctica, menos de 4 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida para contextos cortos.
- Opciones de despliegue: al publicarse en safetensors con arquitectura Qwen2, es compatible con vLLM, TGI, Transformers y, previsiblemente, llama.cpp/Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-full-attention-wikitext2 | 535 M | no disponible | 215,59 (post-KD) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (profesor) | ~494 M | 32.768 tokens (modelo base) | 15,38 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con el profesor muestra una degradación de perplejidad de más de 14 veces, lo que refleja el coste de la cirugía y de una destilación limitada a WikiText-2. No se dispone de datos de otros modelos comparables de 0,5B con atención híbrida en la información proporcionada.

## Limitaciones y advertencias

- Calidad de modelado de lenguaje muy inferior al modelo base: perplejidad de 215,59 frente a 15,38 del profesor.
- Entrenado exclusivamente para destilación sobre WikiText-2; no hay ajuste por instrucciones ni por preferencias humanas (RLHF/DPO) documentado.
- Riesgo elevado de alucinación y de generación incoherente en contextos largos o dominios fuera de WikiText-2.
- Idiomas: solo inglés declarado; el comportamiento en castellano u otros idiomas no está evaluado.
- Longitud de contexto efectiva no documentada; no se debe asumir el contexto de 32.768 tokens del modelo base.
- Sesgos: no se documentan evaluaciones de sesgo; hereda los del corpus WikiText-2 y del modelo base.
- Licencia MIT permite uso comercial, pero la calidad del checkpoint hace desaconsejable su uso en producción; para ello es preferible el Qwen2.5-0.5B original (Apache 2.0).
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-full-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `FullAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/dense/full_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
