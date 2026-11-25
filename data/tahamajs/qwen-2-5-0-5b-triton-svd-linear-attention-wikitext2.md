# tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el módulo `TritonSVDLinearAttention`, una atención lineal acelerada con Triton que incorpora proyecciones de bajo rango basadas en SVD genuina, RoPE y atención enmascarada. El modelo lo publica el autor independent `tahamajs` dentro del proyecto NeuralOps (Attention Zoo), un marco de investigación centrado en el intercambio modular de mecanismos de atención en transformers preentrenados.

El problema que aborda es la experimentación con atención subcuadrática sobre modelos ya entrenados: en lugar de preentrenar desde cero, se realiza una "cirugía" de atención sobre Qwen2.5-0.5B y se recupera la calidad mediante destilación de conocimiento en dos etapas. El resultado es un modelo de 0,5 mil millones de parámetros con arquitectura híbrida (`hybrid_3_1`) que alcanza una perplejidad de 86,79 en el split de validación de WikiText-2, partiendo de una perplejidad de 174.088,24 inmediatamente después de la cirugía.

Su relevancia es fundamentalmente metodológica: demuestra que es viable sustituir bloques de atención cuadrática por alternativas lineales en un LLM existente y recuperar un régimen de perplejidad razonable con un coste de entrenamiento muy bajo (452 pasos, 180,3 segundos en total). No obstante, se trata de un artefacto de investigación sobre un dataset único (WikiText-2) y con pesos de atención aislados, no de un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cirugía de atención híbrida `hybrid_3_1`: 18/24 capas con `TritonSVDLinearAttention` y 6/24 capas de atención cuadrática completa preservadas en los índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atención de 57,16 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la información disponible) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 57,16 MB) más `config.json`, `tokenizer.json` y `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV y `head_dim=64` (GQA 14:2). Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye la atención en 18 capas por `TritonSVDLinearAttention`, manteniendo 6 capas de atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23], lo que configura un patrón de intercalado 3:1. El adaptador gestiona la expansión automática de cabezas KV (7x) donde es necesario y respeta el contrato de `o_proj` única.

El módulo `TritonSVDLinearAttention` declara soporte causal autorregresivo, bidireccional y de atención cruzada, así como operador de atención personalizado (`is_custom_attention=Yes`); en cambio, no soporta GQA de forma nativa (`supports_gqa=No`) y el soporte de RoPE figura como `N/A`.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenamiento) arroja una perplejidad causal de 174.088,24. La etapa 1 (alineación con backbone congelado) ejecuta 108 pasos en 54,4 segundos, con `lm_head` desactivado y pérdida MSE + coseno por capa con peso 0,25. La etapa 2 (destilación de representación multicapa) ejecuta 344 pasos en 125,7 segundos con peso coseno 0,50. El total son 452 pasos en 180,3 segundos, con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 y parámetros maestros del alumno en FP32, alcanzando un pico de VRAM de 11.680 MB.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada de la base Qwen2.5-0.5B y ajustada sobre WikiText-2.
- Atención lineal subcuadrática con proyecciones SVD de bajo rango en 18 de las 24 capas, lo que reduce el coste asintótico frente a la atención cuadrática en secuencias largas.
- Soporte de atención bidireccional y de atención cruzada a nivel de módulo (`supports_bidirectional=Yes`, `supports_cross_attention=Yes`).
- Capacidad de razonamiento, código y matemáticas: no verificada en esta información; el ajuste se limita a modelado de lenguaje causal sobre WikiText-2.
- Tool calling / function calling: no disponible (no se documenta ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por `TritonSVDLinearAttention` en un LLM preentrenado, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento post-cirugía: el par de etapas (alineación con backbone congelado y destilación multicapa) y sus hiperparámetros documentados permiten replicar y comparar estrategias de recuperación de calidad tras modificar la arquitectura.
- Benchmarking de kernels Triton: el módulo implementa un operador de atención personalizado en Triton, útil para evaluar rendimiento y corrección de kernels de atención lineal frente a implementaciones de referencia.
- Prototipado de modelos ligeros en entornos con VRAM limitada: con 0,5 mil millones de parámetros y pesos de atención de 57,16 MB, el checkpoint cabe en GPUs de consumo y permite experimentar con arquitecturas híbridas sin grandes recursos.
- Evaluación comparativa de mecanismos de atención: al formar parte del NeuralOps Attention Zoo, permite contrastar `triton_svd_linear_attention` con otras variantes del registro sobre la misma base y dataset.
- Docencia y divulgación sobre arquitecturas transformer: la topología híbrida 3:1 con capas ancla es un ejemplo didáctico claro de cómo intercalar atención lineal y cuadrática preservando estabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, wikitext-2-raw-v1, validation | Perplejidad | 86,79 |

Telemetría interna del proceso de destilación:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía) | Perplejidad causal | 174.088,24 |
| Post-KD | Perplejidad de validación | 86,79 |
| Delta de perplejidad | Reducción | -174.001,45 |
| Stage 1 | Pasos / tiempo | 108 pasos / 54,4 s |
| Stage 2 | Pasos / tiempo | 344 pasos / 125,7 s |
| Total | Pasos / tiempo | 452 pasos / 180,3 s |
| Entrenamiento | VRAM pico | 11.680 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento usó 11.680 MB de pico con FP16 y maestros FP32. Para inferencia en FP16 de un modelo de 0,5 mil millones de parámetros se espera un consumo del orden de 1-2 GB, aunque este dato no está confirmado en la documentación.
- GPU recomendadas: no disponible. El entrenamiento se ejecutó en una GPU con al menos 12 GB de VRAM (no se especifica el modelo).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,5 mil millones de parámetros, aunque no se documenta una lista concreta de GPUs validadas.
- Opciones de despliegue: la carga oficial se realiza mediante `neuralops.hub.load_surgeried_model` o mediante `transformers` + `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace inviable el despliegue en llama.cpp/Ollama sin conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2` | 0,5 B | no disponible | 86,79 (validation) | MIT | Hugging Face (repo de 0,1 GB, pesos de atención) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | no disponible en esta información | no disponible | no disponible en esta información | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (según el repo NeuralOps) | Hugging Face |

No se dispone de datos de benchmarks comparables de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Artefacto de investigación: el ajuste se limita a WikiText-2 y no se han evaluado capacidades generales (razonamiento, código, matemáticas, instrucciones), por lo que no debe asumirse un rendimiento conversacional equivalente al de Qwen2.5-0.5B original.
- Pesos parciales: el repositorio contiene únicamente `attention_weights.safetensors` (57,16 MB); es necesario descargar la base Qwen2.5-0.5B y aplicar la cirugía de atención para reconstruir el modelo completo.
- Perplejidad elevada: 86,79 en WikiText-2 es un valor alto en términos absolutos para un modelo de este tamaño, lo que sugiere una degradación sustancial respecto al checkpoint original.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Sesgos: no documentados por el autor; al heredar la base Qwen2.5-0.5B, puede reproducir sesgos de su corpus de preentrenamiento, pero no hay análisis disponible.
- Riesgo de alucinación: no evaluado; el ajuste sobre WikiText-2 no incluye alineación por RLHF/DPO documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse al redistribuir el modelo reconstruido.
- Compatibilidad: el módulo declara `supports_gqa=No` y `supports_rope=N/A`, lo que puede limitar la integración con toolchains estándar de inferencia y obliga a usar el adaptador de NeuralOps.
- Sin datos verificados: el único benchmark está marcado como `verified: false` y no hay resultados de benchmarks de capacidad publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-triton-svd-linear-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
