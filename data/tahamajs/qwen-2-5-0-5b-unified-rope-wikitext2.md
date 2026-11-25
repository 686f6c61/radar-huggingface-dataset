# tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2

## Resumen

`qwen-2.5-0.5b-unified-rope-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino una cirugía sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder por el módulo `unified_rope` del registro `ATTENTION_REGISTRY` de NeuralOps, manteniendo 6 capas con atención cuadrática completa como anclas. El objetivo es validar empíricamente si un mecanismo de atención alternativo (subquadrático, con RoPE universal) puede recuperar el rendimiento del modelo original mediante destilación de conocimiento en dos etapas.

El modelo base Qwen2.5-0.5B es un transformer decoder-only de 0,5 mil millones de parámetros con GQA (14 cabezas de query, 2 de clave/valor, `head_dim=64`, `hidden_size=896`), entrenado por Alibaba Qwen. Sobre esa arquitectura, el autor aplica un patrón `hybrid_3_1`: por cada tres capas con `unified_rope` se conserva una capa con atención cuadrática original, en los índices `[3, 7, 11, 15, 19, 23]`. El resultado se destila contra el modelo base en WikiText-2, alcanzando una perplejidad de validación de 15,14 (frente a 17,57 tras la cirugía sin destilar).

La relevancia de este checkpoint es fundamentalmente metodológica: demuestra que es posible reemplazar atención estándar por operadores alternativos en un modelo ya entrenado y recuperar calidad con un coste de entrenamiento muy bajo (429 pasos, 180,4 segundos, 16.250 MB de VRAM pico en FP16). Es un artefacto de investigación, no un modelo listo para producción: solo se distribuyen los pesos de atención (`attention_weights.safetensors`, 161,50 MB) y requiere el paquete NeuralOps y el modelo base para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: 18/24 capas con `unified_rope` (subquadratic attention) y 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa `seq_len=512`, pero no se especifica el contexto máximo soportado) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors FP16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`attention_weights.safetensors`, 161,50 MB); requiere cargar el modelo base Qwen2.5-0.5B por separado |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only estándar con atención GQA (14 cabezas de query, 2 de clave/valor, `head_dim=64`, `hidden_size=896`). El autor aplica una "cirugía" que reemplaza los bloques de atención de 18 de las 24 capas por el módulo `UnifiedRoPE` del registro NeuralOps, que soporta atención causal, bidireccional, cross-attention, GQA nativa y RoPE, y está marcado como operador de atención personalizado (`is_custom_attention`). Se conservan 6 capas con atención cuadrática original como anclas, siguiendo un patrón `hybrid_3_1`. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales con expansión automática de cabezas KV (7x donde es necesario) y aplica un contrato de bypass con una única `o_proj`.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin destilar) da una perplejidad causal de 17,57. La etapa 1 (alineación con backbone congelado, 130 pasos, 54,3 s) usa MSE y coseno a nivel de capa con peso 0,25 y `lm_head` desactivado. La etapa 2 (destilación multi-capa de representaciones, 299 pasos, 125,8 s) usa MSE y coseno con peso 0,50. En total: 429 pasos, 180,4 s, `seq_len=512`, `grad_accum=4`, `topk=64`, con autocast FP16 y parámetros maestros del estudiante en FP32, alcanzando 16.250 MB de VRAM pico. La perplejidad final es 15,14 (delta de -2,43 respecto al baseline post-cirugía).

## Capacidades

- Generación de texto autoregresiva causal (tarea declarada: Causal Language Modeling).
- Soporte nativo de RoPE (rotary position embeddings) en el módulo `unified_rope`.
- Soporte de GQA (grouped-query attention) con expansión de cabezas KV.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del módulo, aunque el checkpoint se evalúa en modo causal).
- Capacidades conversacionales heredadas del modelo base Qwen2.5-0.5B (tag `conversational`).
- Tool calling / function calling: no disponible en la información proporcionada (no se documenta para este checkpoint).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en mecanismos de atención alternativos: el checkpoint sirve como referencia reproducible para estudiar cómo afecta la sustitución de atención cuadrática por `unified_rope` a la perplejidad en un modelo pequeño, con telemetría detallada de las dos etapas de destilación.
- Validación de pipelines de cirugía de atención: permite probar el flujo `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors` sobre Qwen2.5-0.5B para verificar que el adaptador `QwenAttentionAdapter` funciona correctamente antes de escalar a modelos mayores.
- Benchmarking de destilación de conocimiento: las métricas de las etapas 1 y 2 (pasos, tiempo, VRAM pico, perplejidad) permiten comparar estrategias de KD en entornos con recursos limitados (16 GB de VRAM).
- Docencia y experimentación con arquitecturas híbridas: útil para ilustrar patrones `hybrid_3_1` y el compromiso entre eficiencia de atención y calidad en modelos de 0,5B.
- Prototipado de inferencia con `neuralops.hub.load_surgeried_model`: permite cargar el modelo en una línea para pruebas rápidas de generación de texto en inglés.
- Estudio de recuperación post-cirugía: el delta de perplejidad (-2,43) y el desglose por etapas sirven para analizar cuánto rendimiento se recupera con KD de alineación frente a KD multi-capa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 15,14 |

Telemetría de entrenamiento declarada por el autor:

| Etapa | Métrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, sin KD) | Perplejidad causal | 17,57 |
| Post-KD | Perplejidad de validación | 15,14 |
| Delta | Perplejidad | -2,43 |
| Stage 1 (alineación, backbone congelado) | Pasos / tiempo | 130 / 54,3 s |
| Stage 2 (KD multi-capa) | Pasos / tiempo | 299 / 125,8 s |
| Total | Pasos / tiempo | 429 / 180,4 s |
| Pico de VRAM | FP16 autocast | 16.250 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 16.250 MB pico en FP16 con parámetros maestros FP32. Para inferencia en FP16 de un modelo de 0,5B se espera un consumo notablemente menor, pero no se documenta.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una GPU con al menos 16 GB de VRAM (no se especifica el modelo).
- ¿Cabe en GPU consumer? No confirmado en la información proporcionada; por tamaño (0,5B) es plausible en GPUs consumer modernas, pero no hay datos oficiales.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` (API universal de NeuralOps) y el flujo manual con `transformers` + `safetensors` + `scripts.benchmarks.qwen_zoo_train_mix.apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2` | 0,5B | No disponible | 15,14 (declarada, no verificada) | MIT | Pesos de atención únicamente (161,50 MB) + modelo base |
| `Qwen/Qwen2.5-0.5B` (modelo base) | 0,5B | 32.768 tokens (según Qwen2.5) | No disponible en esta ficha | Apache 2.0 (según Qwen) | Pesos completos en Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32.768 tokens (según Qwen2.5) | No disponible en esta ficha | Apache 2.0 (según Qwen) | Pesos completos en Hugging Face |

Nota: los datos de contexto y licencia de los modelos Qwen2.5 provienen del conocimiento general del modelo base y no de la información proporcionada en esta ficha; verificar en las model cards oficiales. No se dispone de perplejidad WikiText-2 publicada para los modelos base en la información disponible.

## Limitaciones y advertencias

- Checkpoint experimental de investigación: no es un modelo listo para producción; solo se distribuyen los pesos de atención, no el modelo completo.
- Requiere el paquete NeuralOps y el modelo base `Qwen/Qwen2.5-0.5B` para funcionar; el flujo de carga manual depende de `scripts.benchmarks.qwen_zoo_train_mix`, que puede no estar estable.
- Entrenado y evaluado únicamente en WikiText-2 en inglés; el soporte multilingüe es prácticamente nulo.
- La perplejidad de 15,14 está marcada como `verified: false` en el model-index; no ha sido verificada de forma independiente.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no asumir que las hereda del modelo base sin verificación.
- Riesgo de alucinación: inherente a los modelos de 0,5B, especialmente tras una cirugía de atención y una destilación corta (429 pasos).
- Sesgos: no documentados por el autor; se heredan los del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT para los pesos publicados, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según Qwen); verificar compatibilidad para uso comercial.
- Longitud de contexto máxima no documentada; el entrenamiento usó `seq_len=512`, por lo que el rendimiento más allá de esa longitud no está validado.
- El patrón híbrido `hybrid_3_1` con 6 capas cuadráticas ancla implica que el ahorro computacional respecto a atención completa es parcial, no total.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
