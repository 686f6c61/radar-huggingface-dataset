# tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2

## Resumen

`qwen-2.5-0.5b-svd-compressed-wikitext2` es un checkpoint experimental publicado por el usuario `tahamajs` dentro del proyecto NeuralOps Qwen Attention Zoo. No se trata de un modelo entrenado desde cero, sino de un derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder original por un módulo propio denominado `SVDCompressedAttention`, que aplica proyecciones SVD truncadas con adaptadores LoRA entrenables, soporte de GQA y RoPE. Las 6 capas restantes conservan la atención cuadrática completa como anclas.

El objetivo del experimento es evaluar hasta qué punto es posible reemplazar la atención estándar por variantes subcuadráticas o comprimidas manteniendo la coherencia del modelo, y para ello el autor aplica una destilación de conocimiento en dos etapas sobre WikiText-2. El resultado es un modelo de 0,5 mil millones de parámetros con licencia MIT, publicado principalmente como artefacto de investigación sobre topologías de atención híbridas.

La relevancia es acotada: se trata de un checkpoint de nicho, con cero descargas y cero likes en el momento de la consulta, cuyo interés reside en la metodología de sustitución de atención y en las métricas de recuperación tras la cirugía, no en su calidad como modelo de propósito general. Su perplejidad final en WikiText-2 (195,39) es muy superior a la del modelo base, lo que refleja el coste de la intervención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B, con 18/24 capas de atención reemplazadas por `SVDCompressedAttention` (patrón `hybrid_3_1`) y 6 capas de atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors, presumiblemente FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (64,25 MB), más `config.json` y `tokenizer.json`; requiere el modelo base Qwen2.5-0.5B para cargarse |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` y aplica una cirugía de atención mediante `QwenAttentionAdapter`, que mapea las proyecciones originales de `Qwen2Attention` (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica una expansión automática de cabezas KV de 7x cuando es necesario, respetando el contrato de bypass de una sola `o_proj`. El módulo `SVDCompressedAttention` implementa atención multi-cabeza con proyecciones SVD truncadas, adaptadores LoRA entrenables, soporte nativo de GQA y RoPE, y residuales dispersos opcionales. Soporta atención causal, bidireccional y cross-attention.

El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin destilación) arrojó una perplejidad causal de 335030,92, lo que evidencia el colapso inicial tras la sustitución. La etapa 1 (alineación con backbone congelado, `lm_head` bypassado, MSE y coseno por capa con peso 0,25) se ejecutó en 88 pasos (54,4 s). La etapa 2 (destilación de representación multicapa, MSE y coseno con peso 0,50) se ejecutó en 203 pasos (125,4 s). En total, 291 pasos y 180,2 s de optimización con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 17729 MB en FP16 autocast con parámetros maestros en FP32.

## Capacidades

- Generación de texto causal autorregresiva, heredada del modelo base Qwen2.5-0.5B.
- Atención causal, bidireccional y cross-attention a nivel de módulo.
- Soporte nativo de GQA (grouped-query attention) y RoPE.
- Capacidad de ejecutarse como modelo de lenguaje de propósito general, aunque degradada por la cirugía.
- Soporte de tool calling / function calling: no disponible de forma específica en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como referencia reproducible para estudiar cómo afecta la sustitución de atención a la perplejidad y a la coherencia de un modelo pequeño, con métricas de recuperación documentadas etapa por etapa.
- Evaluación de técnicas de destilación de conocimiento: el par de etapas (alineación con backbone congelado y destilación de representación multicapa) puede replicarse sobre otros modelos y otros datasets para comparar estrategias.
- Benchmarking de módulos de atención en el registro NeuralOps: permite medir el rendimiento de `svd_compressed` frente a otras variantes del `ATTENTION_REGISTRY` con un coste de cómputo bajo (180 s de entrenamiento, 17,7 GB de VRAM pico).
- Pruebas de integración de `QwenAttentionAdapter`: útil para validar el contrato de bypass de una sola `o_proj` y la expansión de cabezas KV en pipelines propios.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y destilación en dos etapas sobre un modelo de 0,5B que cabe en una GPU de consumo.
- Prototipado de bajo coste en entornos con recursos limitados: al pesar 64,25 MB el artefacto de atención, se puede iterar rápidamente sobre el modelo base sin reentrenar desde cero.
- No recomendado para producción: la perplejidad de 195,39 en WikiText-2 lo sitúa lejos de un modelo utilizable en tareas reales de generación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 195,39 |

Telemetría de entrenamiento declarada:

| Métrica / etapa | Valor |
|---|---|
| Perplejidad causal pre-KD (etapa 0) | 335030,92 |
| Perplejidad causal post-KD | 195,39 |
| Delta de perplejidad | -334835,54 |
| Etapa 1 (alineación, backbone congelado) | 88 pasos (54,4 s) |
| Etapa 2 (destilación multicapa) | 203 pasos (125,4 s) |
| Pasos totales / tiempo | 291 pasos / 180,2 s |
| VRAM pico | 17729 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y contexto, se estima un uso de 2-4 GB en FP16, aunque no se dispone de medición oficial para este checkpoint.
- VRAM de entrenamiento documentada: 17729 MB en FP16 autocast con parámetros maestros en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento se requiere al menos una GPU de 24 GB (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, tanto en inferencia como en entrenamiento con una RTX 3090 o superior.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` + `safetensors` con la función `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2` | 0,5B | No disponible | 195,39 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32768 tokens (según especificaciones de Qwen2.5) | No disponible en esta ficha | Apache 2.0 (según Qwen2.5) | Hugging Face |
| Otras variantes del NeuralOps Qwen Attention Zoo | 0,5B | No disponible | No disponible | MIT | Hugging Face |

La comparación directa con el modelo base es la más relevante: el checkpoint comprimido introduce una degradación sustancial de la perplejidad respecto al original, a cambio de una topología de atención experimental. No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Perplejidad muy elevada (195,39 en WikiText-2), lo que indica una calidad de generación muy inferior a la del modelo base Qwen2.5-0.5B.
- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo alto de alucinación y de generación incoherente debido a la cirugía de atención y a la destilación limitada (291 pasos sobre WikiText-2).
- Entrenado exclusivamente sobre WikiText-2, un corpus de Wikipedia; no se ha validado en dominios como código, matemáticas o diálogo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe asumirse.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse al redistribuir o combinar pesos.
- Los pesos publicados son solo de atención (`attention_weights.safetensors`); es imprescindible descargar el modelo base y aplicar la cirugía para poder cargarlo.
- Requiere la librería `neuralops` y scripts del repositorio del autor; no es un checkpoint estándar de `transformers`.
- Los benchmarks declarados no están verificados (`verified: false`) y proceden del propio autor.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-compressed-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
