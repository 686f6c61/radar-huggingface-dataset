# tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por el operador `QCQAAttention` (Quality and Capacity-Aware Grouped Query Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No es un modelo nuevo entrenado desde cero, sino un ejercicio de "cirugía de atención" más destilación de conocimiento para recuperar la calidad perdida tras el reemplazo.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con GQA, RoPE y SwiGLU, 896 de hidden size, 14 cabezas de query y 2 de KV con `head_dim=64`) pero intercala 18 de sus 24 capas con atención QCQA y mantiene 6 capas con atención cuadrática completa como anclas (patrón `hybrid_3_1`, índices `[3, 7, 11, 15, 19, 23]`). El ajuste se realiza sobre WikiText-2 mediante destilación en dos etapas desde el modelo base original, alcanzando una perplejidad de validación de 25,35.

Su relevancia es fundamentalmente investigadora: sirve como banco de pruebas reproducible para evaluar si un operador de atención subcuadrática puede sustituir a la atención estándar en un LLM pequeño sin degradar gravemente la modelización del lenguaje, y para medir el coste de recuperación vía knowledge distillation. No está pensado como modelo de producción conversacional, pese a la etiqueta `text-generation`, y sus pesos publicados son únicamente los de atención (161,51 MB), no el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `QCQAAttention` y 6/24 con atención cuadrática completa (patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se declara recuento propio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usa `seq_len=512` |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en FP16/Safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 161,51 MB) más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de query y 2 de KV (`head_dim=64`), RoPE y GQA nativo. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye la atención en 18 capas por `QCQAAttention`, un operador con soporte causal, bidireccional, cross-attention, GQA nativo, RoPE y operador de atención personalizado. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) mantienen atención cuadrática completa como anclas, dando lugar al patrón intercalado `hybrid_3_1`. El adaptador gestiona una expansión 7x de cabezas KV cuando es necesario y respeta el contrato de `o_proj` único.

El entrenamiento es una destilación de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 0 (post-cirugía, sin ajuste) arroja una perplejidad causal de 139,14. La etapa 1 (alineación con backbone congelado, `lm_head` bypassado, MSE y coseno a nivel de capa con peso 0,25) dura 130 pasos (54,5 s). La etapa 2 (destilación multi-capa de representaciones, MSE y coseno con peso 0,50) dura 298 pasos (125,5 s). En total, 428 pasos de optimización en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15.970 MB en FP16 con parámetros maestros en FP32. La perplejidad final es 25,35, una mejora de 113,79 puntos respecto al baseline post-cirugía.

## Capacidades

- Generación de texto causal autorregresiva en inglés, limitada al dominio y la distribución de WikiText-2.
- Modelización del lenguaje y cálculo de perplejidad, que es la métrica para la que fue entrenado y validado.
- Soporte nativo de GQA y RoPE en las capas QCQA, lo que permite reutilizar el tokenizador y el pipeline de Qwen2.5-0.5B.
- Soporte de atención bidireccional y cross-attention a nivel de operador (según la tabla de capacidades del módulo), aunque el checkpoint se entrena y evalúa en modo causal.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: solo inglés declarado (`language: en`); no se garantiza comportamiento en otros idiomas.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por `QCQAAttention` en un LLM pequeño y medir el impacto en perplejidad con un pipeline documentado (`apply_qwen_attention_surgery`).
- Benchmarking de operadores de atención: sirve como referencia cuantitativa (PPL 25,35 en WikiText-2) para comparar `qcqa_attention` con otros operadores del `ATTENTION_REGISTRY` de NeuralOps bajo el mismo protocolo de destilación.
- Estudio de destilación de conocimiento post-cirugía: los datos de las dos etapas (pasos, tiempos, pesos de MSE/coseno, VRAM pico) permiten analizar la eficiencia de la recuperación de calidad en modelos pequeños.
- Validación de pipelines de carga modular: el ejemplo con `neuralops.hub.load_surgeried_model` sirve para probar la integración de pesos quirúrgicos en flujos de Hugging Face Hub.
- Pruebas de compatibilidad con el ecosistema Qwen2.5: al conservar tokenizador y configuración base, se puede usar para verificar que adaptadores y herramientas de Qwen2.5-0.5B siguen funcionando tras el reemplazo de atención.
- Docencia y experimentación académica: modelo de bajo coste (0,2 GB de repo, inferencia en una sola GPU consumer) para ilustrar cirugía de arquitecturas y destilación en dos etapas.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 25,35 | No (declarado por el autor) |

Datos de telemetría del entrenamiento declarados por el autor:

| Etapa | Métrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, zero-shot) | Perplejidad causal | 139,14 |
| Post-KD | Perplejidad de validación | 25,35 |
| Delta | Mejora de perplejidad | -113,79 |
| Stage 1 | Pasos / tiempo | 130 / 54,5 s |
| Stage 2 | Pasos / tiempo | 298 / 125,5 s |
| Total | Pasos / tiempo | 428 / 180,2 s |
| Pico de VRAM | FP16 con maestros FP32 | 15.970 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (0,5B en FP16, ~1 GB de pesos) se puede inferir en GPUs consumer, pero el autor no publica cifras de inferencia.
- VRAM de entrenamiento documentada: 15.970 MB de pico en FP16 con parámetros maestros en FP32 (destilación).
- GPU recomendadas: no especificadas por el autor; el entrenamiento cabe en GPUs de ~16 GB (por ejemplo, RTX 4080/A4000 o superiores). Para inferencia, cualquier GPU con al menos ~2 GB libres en FP16 es suficiente en la práctica, aunque no está verificado oficialmente.
- Cabe en GPU consumer: sí, por tamaño; el repo ocupa 0,2 GB y los pesos de atención 161,51 MB.
- Opciones de despliegue: el autor documenta `transformers` + `safetensors` + `neuralops` (`load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, la cuantización no está disponible de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2` | 0,5B | no disponible (entreno a 512) | Híbrida QCQA 18/24 + cuadrática 6/24 | MIT | Pesos solo de atención en HF |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según Qwen2.5) | Cuadrática completa con GQA | Apache 2.0 | Pesos completos en HF |
| Modelos de 0,5B de la familia Qwen2.5 instruct | 0,5B | 32.768 tokens | Cuadrática completa con GQA | Apache 2.0 | Pesos completos en HF |

La comparación directa con el modelo base es la más informativa: el checkpoint quirúrgico solo publica pesos de atención y depende de `Qwen/Qwen2.5-0.5B` para el resto de parámetros, mientras que el base ofrece pesos completos, contexto de 32.768 tokens y licencia Apache 2.0. No se dispone de comparativas con otros modelos de atención subcuadrática en la información proporcionada.

## Limitaciones y advertencias

- Pesos incompletos: el repositorio solo contiene `attention_weights.safetensors`; es obligatorio cargar el modelo base `Qwen/Qwen2.5-0.5B` y aplicar la cirugía antes de cargar el estado, por lo que no es un modelo autónomo.
- Entrenado exclusivamente en WikiText-2: la distribución es enciclopédica y en inglés; el rendimiento fuera de ese dominio no está evaluado y probablemente sea deficiente.
- Perplejidad de 25,35 declarada por el autor y no verificada (`verified: false`); no hay benchmarks de tareas downstream (razonamiento, código, matemáticas).
- Solo inglés declarado; no se garantiza comportamiento multilingüe.
- Sin soporte documentado de tool calling, agentes ni modo de razonamiento.
- Riesgo de alucinación no cuantificado; al ser un modelo de 0,5B ajustado solo para modelización de lenguaje, la generación libre puede ser incoherente.
- Licencia MIT en el repo del autor, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar la compatibilidad para uso comercial y atribución.
- Fecha de creación declarada en el futuro (2026-11-10) en los metadatos de Hugging Face; conviene tratarla con cautela.
- No se publican pesos GGUF ni cuantizaciones, lo que limita el despliegue en CPU o GPUs de gama baja sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
