# tahamajs/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2

## Resumen

Este repositorio contiene un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente las capas de atención del decodificador por el modulo `svd_llm_v2_attention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es tahamajs y el modelo base es Qwen/Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parametros con contexto nativo de 32 768 tokens. La intervención afecta a 18 de las 24 capas del modelo, que pasan a usar atención factorizada por SVD con adaptadores LoRA de recuperación, mientras que 6 capas conservan la atención cuadrática original como anclas.

El objetivo del experimento es evaluar si una atención subcuadrática basada en descomposición SVD puede recuperar capacidad predictiva tras una cirugía agresiva de pesos, mediante un proceso de destilación de conocimiento en dos etapas sobre WikiText-2. El resultado declarado es una perplejidad de validación de 185,32, partiendo de una perplejidad post-cirugía de 242 621,87 antes de la destilación. No se trata de un modelo listo para producción, sino de un artefacto de investigación sobre topologías de atención alternativas.

La relevancia actual del checkpoint es acotada: sirve como referencia reproducible para estudiar la viabilidad de atenciones factorizadas en modelos pequenos, y como ejemplo de pipeline de cirugía y destilación implementado en la librería `neuralops`. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño total es de 0,1 GB, coherente con un artefacto que solo contiene pesos de atención y tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_llm_v2_attention` (SVD factorizada + LoRA) y 6/24 capas con atencion cuadrática completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero el checkpoint no lo declara explicitamente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 89,03 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugía de atención con patron `hybrid_3_1`: 18 de las 24 capas se sustituyen por el modulo `SVDLLMV2Attention`, que factoriza las matrices de atención en buffers explicitos U, Sigma y V^H y anade adaptadores LoRA entrenables para recuperar capacidad. Las 6 capas restantes conservan la atención cuadrática original como anclas. El `QwenAttentionAdapter` gestiona la expansión 14:2 de cabezas KV (hasta 7x cuando es necesario) y aplica el contrato de bypass de `o_proj` unico. El modulo declara soporte causal, bidireccional, cross-attention, GQA nativo y operador de atención personalizado; no declara soporte RoPE.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 120 pasos en 54,5 s con `lm_head` desactivado y perdida MSE + coseno a nivel de capa con peso 0,25. La etapa 2 (destilación multi-capa de representaciones) ejecuta 273 pasos en 125,5 s con peso coseno 0,50. En total son 393 pasos en 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 18 045 MB en FP16 autocast con parametros maestros en FP32. La perplejidad causal pasa de 242 621,87 (etapa 0, post-cirugía sin destilar) a 185,32 tras la destilación, un delta de -242 436,55.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo (`supports_causal`, `supports_bidirectional`, `supports_cross_attention` = Yes).
- Soporte nativo de GQA en el modulo de atención (`supports_gqa` = Yes).
- Operador de atención personalizado (`is_custom_attention` = Yes).
- Conversacional: la pipeline declarada es `text-generation` y los tags incluyen `conversational`, aunque no se documentan plantillas de chat especificas en la informacion disponible.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidad multilingue limitada al ingles (`language: en`).

## Casos de uso

- Investigacion sobre atenciones subcuadráticas: el checkpoint permite reproducir el pipeline de cirugía y destilación de NeuralOps para comparar perplejidad frente a la atención cuadrática original en WikiText-2, con telemetria de etapas y tiempos ya publicada.
- Estudio de recuperación tras cirugía de pesos: sirve para analizar cuanto rendimiento se recupera con destilación en dos etapas (de PPL 242 621,87 a 185,32) y que configuracion de LoRA y pesos de perdida funciona mejor.
- Benchmark de topologias hibridas: el patron `hybrid_3_1` con 6 anclas cuadráticas permite medir el impacto de la proporcion de capas sustituidas sobre la calidad final en un modelo de 0,5B.
- Prototipado de modulos de atención en `neuralops`: util para validar la integracion del `QwenAttentionAdapter`, la expansion GQA 14:2 y el contrato de `o_proj` unico antes de escalar a modelos mayores.
- Docencia y divulgacion: ejemplo reproducible de destilación de conocimiento capa a capa con MSE y coseno, con metricas de tiempo y VRAM documentadas.
- Base para experimentos de eficiencia en inferencia: al reducir la atencion a una forma factorizada en 18 de 24 capas, permite medir coste computacional y memoria frente al modelo base en entornos controlados, aunque no se publican cifras de latencia o throughput.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 185,32 |
| qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2 (etapa 0, post-cirugía sin destilar) | wikitext-2-raw-v1 | Perplejidad | 242 621,87 |

Los resultados proceden del `model-index` de la model card y estan marcados como `verified: false`. No se publican resultados de MMLU, HumanEval, GSM8K ni otras tareas en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 18 045 MB de pico en FP16 autocast con parametros maestros en FP32, `seq_len=512`, `grad_accum=4` y `topk=64`.
- VRAM de inferencia: no disponible en la informacion proporcionada. Para un modelo de 0,5B en FP16 se puede estimar en torno a 1-2 GB, pero el checkpoint solo contiene pesos de atención (89,03 MB) y requiere cargar el modelo base Qwen2.5-0.5B completo.
- GPU recomendadas: no disponible. El entrenamiento cabe en GPUs con al menos 18 GB (A100 40GB, A6000, RTX 4090 24GB). Para inferencia, cualquier GPU consumer con 4 GB o mas deberia ser suficiente, pero no se documenta.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (0,5B), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: el quick start usa `transformers` + `safetensors` + `huggingface_hub` con la funcion `apply_qwen_attention_surgery` de `scripts.benchmarks.qwen_zoo_train_mix`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2 | 0,5B | no disponible | 185,32 | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens | no disponible en la informacion proporcionada | Apache 2.0 (segun el modelo base, no confirmado en esta ficha) | Hugging Face |
| Otros checkpoints de NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en la informacion proporcionada, por lo que no se puede cuantificar la degradacion respecto al original. Tampoco se han identificado en la informacion otros modelos comparables de la misma categoria (atención factorizada sobre Qwen2.5-0.5B).

## Limitaciones y advertencias

- Perplejidad de 185,32 muy superior a la esperable en un modelo de 0,5B sin cirugía, lo que indica una degradacion severa de la calidad del lenguaje; no es apto para producción.
- El checkpoint solo contiene pesos de atención (`attention_weights.safetensors`, 89,03 MB); requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía con la funcion `apply_qwen_attention_surgery` antes de cargar el state dict con `strict=False`.
- Solo soporta ingles (`language: en`).
- Entrenado exclusivamente sobre WikiText-2, un corpus de Wikipedia; no se documenta entrenamiento en instrucciones, chat, codigo ni matematicas.
- Riesgo alto de alucinacion y de generar texto incoherente por la degradacion de perplejidad y el limitado conjunto de destilacion.
- No se declaran sesgos especificos, pero hereda los del modelo base Qwen2.5-0.5B y los del corpus WikiText-2.
- La licencia es MIT, lo que permite uso comercial del artefacto, pero la calidad del modelo hace inviable ese uso en la practica.
- El resultado de perplejidad esta marcado como no verificado (`verified: false`) en el model-index.
- No se documenta soporte para cuantizacion, vLLM, llama.cpp ni otras herramientas de despliegue estandar.
- El autor no publica comparacion con el modelo base sin cirugía, por lo que no se puede evaluar la perdida real de capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-llm-v2-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
