# tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por una implementación de atención lineal recurrente denominada Kernelized Decay Attention (KDA), procedente del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general, sino servir de banco de pruebas reproducible para evaluar arquitecturas de atención subcuadrática sobre un backbone conocido y de tamano reducido.

El modelo conserva 495.138.958 parámetros (prácticamente los mismos que el Qwen2.5-0.5B original) y mantiene 6 de las 24 capas con atención cuadrática completa como anclas, mientras que las 18 restantes usan KDA. El checkpoint se ha recuperado mediante un proceso de destilación de conocimiento en dos etapas sobre WikiText-2, que reduce la perplejidad de validación desde 22.158,08 (justo después de la cirugía) hasta 235,23.

Su relevancia es metodológica: documenta de forma transparente el coste de sustituir atención softmax por atención lineal recurrente y el esfuerzo de recuperación necesario, con telemetria de entrenamiento incluida. No es un modelo recomendado para producción ni para tareas generativas generales; su valor está en la investigación sobre eficiencia de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por Kernelized Decay Attention (KDA) lineal recurrente; patrón híbrido `hybrid_3_1` |
| Parametros totales | 495.138.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB; `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (`head_dim=64`) y GQA nativo. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye la atención softmax en 18 de las 24 capas por `KDAAttention`, una atención lineal recurrente con decaimiento aprendible por cabeza: `S_t = γ · S_{t-1} + φ(k_t)ᵀ · v_t`, con `γ = sigmoid(β)` y `φ(x) = ELU(x) + 1`. Las capas en los índices `[3, 7, 11, 15, 19, 23]` conservan atención cuadrática completa como anclas, siguiendo el patrón intercalado `hybrid_3_1`.

El entrenamiento es una destilación de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado) ejecuta 116 pasos en 54,1 s con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilación multi-capa de representaciones) ejecuta 266 pasos en 125,9 s con peso 0,50. En total, 382 pasos y 180,4 s de optimización con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 17.309 MB en FP16 autocast con parámetros maestros en FP32. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del backbone Qwen2.5-0.5B y recuperada parcialmente mediante destilación.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo KDA (según la tabla de capacidades del autor).
- Soporte nativo de GQA en el módulo KDA (expansión 7x de cabezas KV cuando es necesario).
- No usa RoPE en las capas KDA (`supports_rope: N/A`); las capas ancla conservan el esquema posicional original.
- Soporte de tool calling / function calling: no disponible (no verificado en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible (no verificado).
- Capacidades multilingües: limitadas al inglés declarado.
- Capacidad especial: banco de pruebas de atención subcuadrática con telemetria de destilación reproducible.

## Casos de uso

- Investigación en eficiencia de atención: comparar el rendimiento de KDA frente a atención softmax sobre un backbone fijo y reproducible, usando la perplejidad en WikiText-2 como métrica controlada.
- Reproducción de experimentos de cirugía de atención: el checkpoint y el script `apply_qwen_attention_surgery` permiten replicar la sustitución `hybrid_3_1` y medir el impacto de distintas topologías híbridas.
- Estudio del coste de recuperación tras cirugía: la telemetria de las dos etapas de destilación (PPL pre-KD de 22.158,08 frente a 235,23 post-KD) sirve como referencia para calibrar presupuestos de entrenamiento en modelos mayores.
- Validación de pipelines de destilación de conocimiento: el esquema MSE + coseno por capa con `topk=64` puede reutilizarse como plantilla para otros backbones y otros módulos del `ATTENTION_REGISTRY`.
- Docencia y divulgación técnica: ejemplo compacto (0,5 B parámetros, 1,1 GB de repo) para explicar atención lineal recurrente, decaimiento aprendible y GQA en un entorno manejable en una sola GPU.
- Pruebas de integración de la librería NeuralOps: validar `load_surgeried_model` y la carga de pesos quirúrgicos desde el Hub en pipelines de CI.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-kda-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 235,23 |
| qwen-2.5-0.5b-kda-attention-wikitext2 (Stage 0, pre-KD) | wikitext-2-raw-v1 | Perplejidad | 22.158,08 |

Los resultados proceden del `model-index` de la model card y están marcados como no verificados (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1 GB para pesos (495 M parámetros) más overhead de activaciones y caché; en la práctica, menos de 2 GB en FP16 y por debajo de 1 GB en cuantización de 8 bits (no se publican pesos cuantizados oficiales).
- VRAM de entrenamiento documentada: 17.309 MB de pico durante la destilación (FP16 autocast, maestros en FP32, `seq_len=512`).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente para inferencia; para reproducir el entrenamiento se necesitan al menos 24 GB (RTX 3090/4090, A5000) o una A100/H100 para mayor comodidad.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` tras aplicar la cirugía, o `neuralops.hub.load_surgeried_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que dependen de kernels de atención estándar y no del módulo KDA personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2 | 495 M | no disponible | 235,23 (no verificado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 494 M | 32.768 tokens (según el modelo original) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos de atención lineal comparables (p. ej. variantes Mamba, RWKV) | variable | variable | no disponible | variable | Hugging Face / repos propios |

La comparación directa con el backbone original no es posible con los datos proporcionados, ya que no se incluye la perplejidad de `Qwen/Qwen2.5-0.5B` en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del original) y la ausencia de soporte en runtimes estándar son los principales diferenciadores prácticos.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para tareas generativas generales; la perplejidad de 235,23 en WikiText-2 es muy superior a la de modelos entrenados de forma convencional del mismo tamano.
- Entrenamiento muy limitado: solo 382 pasos de destilación sobre WikiText-2, sin RLHF ni ajuste por instrucciones; el comportamiento conversacional es residual.
- Idiomas: únicamente inglés declarado; no se ha evaluado en castellano ni en otros idiomas.
- Contexto: entrenado con `seq_len=512`; no se documenta la longitud de contexto efectiva tras la cirugía.
- Riesgo de alucinación: alto, derivado del bajo rendimiento del modelo y de la falta de ajuste conversacional.
- Sesgos: no documentados por el autor; hereda los del corpus WikiText-2 y del backbone Qwen2.5-0.5B.
- Compatibilidad: requiere la librería NeuralOps y el módulo `KDAAttention`; no funciona con `transformers` estándar sin aplicar la cirugía. No hay pesos GGUF ni soporte en vLLM, llama.cpp, Ollama o TGI.
- Resultados no verificados: el `model-index` marca la perplejidad como `verified: false`; conviene reproducirla antes de citarla.
- Licencia MIT: permite uso comercial, pero la ausencia de garantías y el estado experimental desaconsejan su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
