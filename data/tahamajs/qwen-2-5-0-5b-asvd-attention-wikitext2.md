# tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se ha realizado una "cirugía de atención": 18 de las 24 capas del decodificador (75%, disposición híbrida 3:1) han sido sustituidas por el operador `ASVDAttention` de la librería NeuralOps, que aplica descomposición matricial de bajo rango (SVD) factorizada con GQA, RoPE y LoRA. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) conservan la atención softmax GQA original de Qwen2 como anclas de enrutamiento contextual global.

El modelo no es un modelo de propósito general listo para producción, sino un artefacto de investigación sobre eficiencia de atención y destilación de conocimiento. Tras el transplante, la perplejidad en WikiText-2 se disparó a 254.182,30; mediante un protocolo de destilación de representaciones ocultas en dos etapas se redujo a 77,30, frente a los 15,38 del modelo profesor. El resultado es un checkpoint de 483,7 M de parámetros (FP16, 922,76 MB) que documenta hasta qué punto una topología de atención subcuadrática puede recuperar el comportamiento del modelo original en un LM compacto.

Su relevancia es metodológica: publica telemetría completa del proceso (perplejidad pre y post-destilación, presupuesto de entrenamiento, hardware) y demuestra que es posible ejecutar la destilación con 0 MB de VRAM del profesor en una única RTX 3090 gracias a la caché offline de representaciones de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B con atención híbrida: 18/24 capas `ASVDAttention` (SVD de bajo rango) + 6/24 capas GQA softmax nativas |
| Parametros totales | 483.756.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero la model card no confirma el contexto efectivo tras la cirugía) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el repositorio no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (etiqueta `language: en` en la model card); multilingüe heredado del base no verificado |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, 922,76 MB) + adaptador |
| Dimensiones internas | D = 896, 24 capas, H_q = 14, H_kv = 2, d_h = 64 |
| RoPE theta | 1.000.000 |
| Librería | `neuralops` |
| Despacho de kernels | CUDA / Triton / PyTorch (3 niveles) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (494 M de parámetros, 24 bloques, dimensión oculta 896, 14 cabezas de consulta y 2 de clave-valor con GQA, dimensión por cabeza 64). Sobre esa base se aplica la cirugía `hybrid_3_1`: las capas en los índices [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22] se sustituyen por `ASVDAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas [3, 7, 11, 15, 19, 23] mantienen la atención softmax GQA preentrenada como anclas de recuperación. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con una única `o_proj` (sin duplicación) y expansión de cabezas KV de 2 a 14.

El operador `ASVDAttention` combina proyecciones factorizadas de bajo rango —coste O(B·N·r·(d + d_all))— con puntuación de atención O(B·H·N²·d_k), GQA, RoPE (theta = 1.000.000) y LoRA. El entrenamiento consistió en una destilación de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8 y acumulación de gradiente 4, ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con caché offline de representaciones (0 MB de VRAM del profesor). La etapa 1 (30% del presupuesto, 124 pasos) congela el backbone y entrena solo módulos de atención y layer norms, con AdamW (lr = 2,0e-4, weight decay 0,01, clipping 1,0), pesos maestros FP32 y AMP FP16 con `GradScaler`, minimizando MSE por capa más 0,25·(1 − coseno) entre estados ocultos del alumno y del profesor. La etapa 2 no está detallada en la información disponible.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Conversación multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y conocimiento general heredados del base Qwen2.5-0.5B, aunque degradados por la destilación (perplejidad 5× superior a la del profesor).
- Soporte de atención causal con GQA y RoPE en las capas nativas; las capas ASVD mantienen el enmascaramiento causal.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe: no verificada; la model card declara únicamente inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como banco de pruebas reproducible para medir el coste en perplejidad de sustituir atención softmax por operadores SVD de bajo rango en un LM compacto, con telemetría pre y post-destilación publicada.
- Estudio de destilación de representaciones ocultas: el protocolo en dos etapas y la caché offline de representaciones permiten replicar el experimento en hardware de consumo (una RTX 3090) sin mantener el profesor en memoria.
- Evaluación de la técnica "attention surgery": útil para comparar topologías híbridas (3:1, 2:1, etc.) y decidir qué capas conservar como anclas GQA en modelos mayores.
- Prototipado de eficiencia en edge: con 483,7 M de parámetros en FP16 (922,76 MB), cabe en GPUs de consumo y permite medir latencia y throughput de kernels CUDA/Triton frente a la atención nativa.
- Docencia y divulgación: ejemplo didáctico de modificación arquitectónica sobre un modelo abierto con licencia MIT e instrumentación completa.
- Base para experimentos de recuperación de calidad: punto de partida para aplicar más pasos de destilación o fine-tuning supervisado y medir cuánto del gap de perplejidad (77,30 frente a 15,38) es recuperable.
- No recomendado para atención al cliente, generación de código en producción ni tareas de razonamiento exigentes: la degradación de perplejidad y la falta de validación en benchmarks de tareas lo desaconsejan.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`). Evaluación en el split de validación de WikiText-2 (`wikitext-2-raw-v1`), longitud de secuencia 512, batch 8, acumulación 4, sobre RTX 3090.

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (`Qwen/Qwen2.5-0.5B`) | 15,38 |
| Perplejidad del alumno tras la cirugía (zero-shot) | 254.182,30 |
| Perplejidad del alumno tras destilación (2 etapas) | 77,30 |
| Delta absoluto de perplejidad | −254.105,00 |
| Reducción relativa de perplejidad | 99,97% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (922,76 MB) más overhead de activaciones y caché KV; en la práctica, alrededor de 2 GB con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor validó el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs integradas solo si se convierte a cuantizaciones de 8 o 4 bits (no publicadas).
- Opciones de despliegue: la librería `neuralops` es el entorno de referencia (registro `ATTENTION_REGISTRY` con clave `asvd_attention`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de operadores personalizados hace improbable su uso directo en esos motores sin portar el kernel.
- Latencia y throughput: no disponibles. El despacho de kernels en tres niveles (CUDA / Triton / PyTorch) sugiere que el rendimiento depende del backend seleccionado, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2` | 483,7 M | no disponible | 77,30 (post-KD, declarada) | MIT | Hugging Face, requiere `neuralops` |
| `Qwen/Qwen2.5-0.5B` (profesor) | 494 M | 32.768 tokens | 15,38 (declarada por el autor) | Apache 2.0 | Hugging Face, transformers |
| `Qwen/Qwen2.5-1.5B` | 1.540 M | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |
| `HuggingFaceTB/SmolLM2-360M` | 360 M | 8.192 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, transformers |

La comparación relevante es con su propio profesor: el modelo entrega la misma arquitectura base con un 75% de capas de atención sustituidas y una perplejidad 5,03× superior en WikiText-2. Frente a alternativas de tamaño similar, la diferencia clave no es el rendimiento sino la compatibilidad de ecosistema: los modelos Qwen y SmolLM se ejecutan en transformers, vLLM y llama.cpp, mientras que este requiere la librería NeuralOps.

## Limitaciones y advertencias

- Degradación severa de calidad: perplejidad de 77,30 frente a 15,38 del profesor, un factor de 5,03×; no es apto para producción sin validación adicional.
- Sesgos: no evaluados ni documentados; hereda los sesgos del corpus de Qwen2.5 y de WikiText-2, sin filtrado posterior conocido.
- Riesgo de alucinación: elevado por la pérdida de fidelidad del modelo; la destilación solo optimiza la alineación de estados ocultos, no la veracidad.
- Contexto: la longitud efectiva tras la cirugía no está documentada; las capas ASVD con proyecciones factorizadas pueden comportarse de forma distinta a contextos largos.
- Idioma: declarado únicamente inglés; el multilingüismo del base no está verificado tras la destilación.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0 y el autor enlaza su propia licencia en el repositorio NeuralOps; conviene revisar ambas.
- Dependencia de la librería `neuralops`: los pesos no son cargables con `transformers` estándar sin portar el operador `ASVDAttention` y el adaptador `QwenAttentionAdapter`.
- Benchmarks no verificados: el campo `verified` es `false` y no hay evaluaciones independientes; los números de perplejidad provienen del propio autor.
- Solo 309 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-asvd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `ASVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/asvd_attention.py
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
