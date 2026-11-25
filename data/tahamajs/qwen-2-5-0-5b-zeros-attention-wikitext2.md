# tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el operador `ZeroSAttention` (Zero-Mean Linear Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo es evaluar empíricamente si un mecanismo de atención subcuadrática puede sustituir a la atención cuadrática estándar de Qwen2 en un transformer preentrenado, manteniendo la coherencia del modelo mediante destilación de conocimiento en dos etapas.

El modelo no es un modelo de propósito general listo para producción: es un artefacto de investigación sobre arquitecturas de atención eficientes. Su perplexity final en WikiText-2 (validación) es de 656,20, un valor muy superior al de un modelo de lenguaje funcional, lo que refleja el coste de la cirugía arquitectónica y la limitación del proceso de recuperación (221 pasos de destilación, 180 segundos de cómputo).

Es relevante ahora porque forma parte de una línea de trabajo activa sobre atención subcuadrática (linear attention, state space models, híbridos) que busca reducir el coste cuadrático de la atención en contextos largos. Este checkpoint concreto sirve como referencia negativa o punto de partida para estudiar la viabilidad de trasplantar operadores de atención alternativos en modelos ya entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con `ZeroSAttention` (Zero-Mean Linear Attention) y 6/24 capas con atención cuadrática Qwen2 preservadas en índices [3, 7, 11, 15, 19, 23] |
| Parámetros totales | No disponible (modelo base Qwen2.5-0.5B: ~0,5 mil millones; el repo solo contiene pesos de atención de 114,86 MB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | No disponible (pesos distribuidos en safetensors FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 114,86 MB), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 14:2), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugía de atención con patrón `hybrid_3_1`: se intercalan bloques de 3 capas con `ZeroSAttention` por cada capa con atención cuadrática completa, resultando en 18 capas trasplantadas y 6 capas ancla preservadas. El `QwenAttentionAdapter` gestiona la expansión de cabezas KV (7x cuando es necesario) y mantiene el contrato de `o_proj` único.

`ZeroSAttention` es un operador de atención lineal de media cero que soporta causalidad, bidireccionalidad, cross-attention, GQA nativo y RoPE. Tras la cirugía, la perplexity causal se dispara a 406 888,29 (Stage 0). El proceso de destilación de conocimiento en dos etapas recupera parcialmente el modelo: la etapa 1 (alineación con backbone congelado, 67 pasos, 54,3 s) usa MSE y coseno sobre estados ocultos con `lm_head` desactivado; la etapa 2 (destilación multi-capa, 154 pasos, 125,6 s) refina la representación. El total son 221 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 17 333 MB de VRAM en FP16 con parámetros maestros en FP32. El resultado final es una PPL de 656,20, una mejora de 406 232 puntos pero aún muy lejos de un modelo utilizable.

## Capacidades

- Generación de texto causal autoregresiva (heredada del modelo base, aunque degradada por la cirugía y la destilación limitada).
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador `ZeroSAttention`.
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV) y RoPE.
- Compatibilidad con el ecosistema NeuralOps mediante `load_surgeried_model` y `apply_qwen_attention_surgery`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.
- No apto para razonamiento, código o matemáticas en producción dado su nivel de perplexity.

## Casos de uso

- Investigación en atención subcuadrática: servir como checkpoint de referencia para medir la degradación y recuperación al sustituir atención cuadrática por lineal en un transformer preentrenado, comparando PPL pre y post destilación.
- Estudio de destilación de conocimiento post-cirugía: analizar la eficacia de las dos etapas (alineación con backbone congelado y destilación multi-capa) sobre un modelo de 0,5B con 221 pasos de entrenamiento.
- Benchmarking de operadores del `ATTENTION_REGISTRY`: comparar `zeros_attention` frente a otros operadores del zoo (linear attention, SSM, híbridos) bajo el mismo protocolo de cirugía y destilación.
- Desarrollo de adaptadores de atención: validar el `QwenAttentionAdapter` y el contrato de `o_proj` único en escenarios de expansión GQA 7x.
- Reproducibilidad de experimentos: el repo incluye `training_metrics.json` y scripts de carga que permiten replicar el pipeline de cirugía y evaluación en WikiText-2.
- Docencia y divulgación: ejemplo didáctico de cómo una intervención arquitectónica agresiva sin reentrenamiento completo degrada severamente un modelo, y de los límites de la destilación con pocos pasos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (validación, `wikitext-2-raw-v1`) | Perplexity | 656,20 |
| WikiText-2 (Stage 0, post-cirugía sin destilación) | Perplexity | 406 888,29 |
| Delta de recuperación | Perplexity | −406 232,09 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint completo requiere cargar el modelo base Qwen2.5-0.5B (~1 GB en FP16) más los pesos de atención (114,86 MB).
- VRAM durante el entrenamiento de destilación: 17 333 MB en FP16 con autocast y parámetros maestros FP32.
- GPU recomendadas: cualquier GPU con ≥8 GB para inferencia del modelo base; para reproducir el entrenamiento se necesita al menos una GPU de ~24 GB (el autor reporta 17,3 GB pico, compatible con RTX 3090/4090, A10G, L4).
- Cabe en GPU de consumo: sí, el modelo base de 0,5B cabe en GPUs consumer (RTX 3060 12 GB, RTX 4060 Ti, etc.) para inferencia.
- Opciones de despliegue: `transformers` + `neuralops` (API `load_surgeried_model` o carga manual con `apply_qwen_attention_surgery`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que los pesos son solo de atención y requieren el modelo base y la cirugía previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2` | ~0,5B (base) | No disponible | 656,20 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | 32 768 tokens (según Qwen) | No disponible en esta ficha | Apache 2.0 (según Qwen) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | Variable | No disponible | No disponible | MIT (repo NeuralOps) | Hugging Face / GitHub |

No se dispone de datos de benchmarks comparables de otros operadores del zoo en la información proporcionada.

## Limitaciones y advertencias

- Perplexity de 656,20 en WikiText-2: el modelo está severamente degradado respecto al base y no es apto para generación de texto de calidad en producción.
- La destilación se limita a 221 pasos y 180 segundos; no hay evidencia de convergencia ni de recuperación completa de capacidades.
- Solo se distribuyen los pesos de atención (`attention_weights.safetensors`); es obligatorio cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía con `apply_qwen_attention_surgery` antes de usar los pesos.
- Requiere la librería `neuralops` y scripts específicos (`scripts.benchmarks.qwen_zoo_train_mix`), lo que limita la portabilidad a otros frameworks.
- Idiomas: solo inglés declarado; no se documenta comportamiento multilingüe.
- Riesgo de alucinación: alto, dado el bajo nivel de coherencia del modelo tras la cirugía.
- Sesgos: no documentados, pero heredados del corpus WikiText-2 (texto enciclopédico en inglés) y del modelo base Qwen2.5.
- Licencia MIT permite uso comercial, pero el estado del modelo hace inviable su uso en producción.
- No se documentan restricciones de contexto específicas para el checkpoint; el contexto efectivo puede verse afectado por la sustitución de atención.
- El checkpoint está marcado como `verified: false` en su model-index: los resultados no han sido validados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
