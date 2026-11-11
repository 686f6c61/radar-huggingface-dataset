# tahamajs/qwen-2.5-0.5b-eat-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-eat-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el operador `EATBlock` (Efficient Attention Transformer with Progressive Token Pruning) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de propósito general, sino validar empíricamente si un mecanismo de atención subcuadrática puede recuperar su calidad tras un reemplazo de atención mediante destilación de conocimiento en dos etapas.

El autor es `tahamajs`, desarrollador del framework NeuralOps, y el entrenamiento se ha realizado exclusivamente sobre WikiText-2 (`wikitext-2-raw-v1`), por lo que el resultado es un artefacto de investigación sobre atención eficiente, no un modelo listo para producción. El checkpoint parte de los pesos del Qwen2.5-0.5B original (495,1 M de parámetros, hidden size 896, 14 cabezas de consulta y 2 de clave/valor con GQA) y conserva su tokenizador.

La relevancia actual reside en la telemetría publicada: la perplexity de validación pasó de 139,81 inmediatamente después de la cirugía a 26,79 tras 357 pasos de destilación en dos fases (180,3 s en total, 18.712 MB de VRAM pico en FP16). Es un caso de estudio reproducible sobre hasta qué punto la destilación de representaciones internas puede compensar la pérdida de calidad al sustituir atención cuadrática por atención subcuadrática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `EATBlock` (patrón `hybrid_3_1`, atención subcuadrática con poda progresiva de tokens); 6 capas ancla cuadráticas en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 495.138.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con `seq_len=512`; el contexto nativo de Qwen2.5-0.5B es 32.768 tokens, no verificado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa FP16 en el ejemplo de uso) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB, `attention_weights.safetensors` 86,24 MB), `config.json`, `tokenizer.json`, `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo conserva la topología del Qwen2.5-0.5B: 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 de clave/valor (`head_dim=64`), con GQA. Sobre esa base se aplica un `QwenAttentionAdapter` que expande las cabezas KV 7x cuando el operador lo requiere y respeta el contrato de `o_proj` único. La cirugía sigue el patrón `hybrid_3_1`: se intercalan bloques `eat` con capas de atención cuadrática completas, de modo que 18 capas usan atención subcuadrática y 6 actúan como anclas. `EATBlock` declara soporte causal, bidireccional, cross-attention y GQA nativo, y no usa RoPE (`supports_rope: N/A`).

El entrenamiento es una destilación de conocimiento en dos fases con el backbone congelado. La fase 1 (alineación, 108 pasos, 54,2 s) omite `lm_head` y ajusta con MSE y coseno sobre estados ocultos por capa con peso 0,25. La fase 2 (destilación multi-capa de representaciones, 249 pasos, 125,8 s) repite el esquema con peso 0,50. La configuración es `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 con parámetros maestros en FP32. No se documenta uso de RLHF ni DPO, ni el volumen total de tokens de entrenamiento más allá del dataset WikiText-2.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada de la arquitectura Qwen2.5-0.5B.
- Atención híbrida: 18 capas con operador `EATBlock` y 6 capas cuadráticas de ancla.
- Soporte declarado de atención bidireccional y cross-attention a nivel de operador (no verificado en el checkpoint final).
- Soporte nativo de GQA con expansión de cabezas KV en el adaptador.
- Capacidad de ejecutarse con `transformers` aplicando previamente `apply_qwen_attention_surgery` o cargando directamente el repo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido para este checkpoint.

## Casos de uso

- Investigación en atención eficiente: banco de pruebas para medir la degradación y recuperación de perplexity al sustituir atención cuadrática por `EATBlock` en un transformer pequeño, con métricas de referencia publicadas (139,81 pre-KD frente a 26,79 post-KD).
- Reproducción de experimentos de destilación: el repositorio incluye `training_metrics.json` y la receta de dos fases, lo que permite replicar el pipeline con otros datasets o patrones de cirugía (`hybrid_3_1` u otros).
- Validación de frameworks: útil para comprobar la integración de `QwenAttentionAdapter` y el registro `ATTENTION_REGISTRY` de NeuralOps en un modelo real de 495 M de parámetros.
- Pruebas de despliegue en hardware modesto: con 495 M de parámetros y FP16, el checkpoint cabe en GPUs de consumo para tareas de generación corta y evaluación de perplexity.
- Estudio de contratos de proyección: sirve para analizar el efecto del contrato de `o_proj` único y la expansión 7x de cabezas KV sobre la estabilidad del entrenamiento.
- Docencia y divulgación: ejemplo compacto y de código abierto (MIT) de cirugía de atención y destilación por capas, con tiempos de entrenamiento de apenas tres minutos.
- Evaluación comparativa de operadores de atención: punto de partida para contrastar `eat` con otras entradas del registro sobre el mismo backbone y dataset.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`).

| Modelo / etapa | Dataset | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-eat-wikitext2 (Stage 0, pre-KD) | wikitext-2-raw-v1, validation | Perplexity | 139,81 |
| qwen-2.5-0.5b-eat-wikitext2 (post-KD) | wikitext-2-raw-v1, validation | Perplexity | 26,79 |
| Delta de perplexity | wikitext-2-raw-v1, validation | Perplexity | -113,01 |

Telemetría de entrenamiento:

| Etapa | Pasos | Tiempo | Notas |
|---|---:|---:|---|
| Stage 1 (frozen-backbone alignment) | 108 | 54,2 s | `lm_head` omitido; MSE + coseno (0,25) |
| Stage 2 (multi-layer representation KD) | 249 | 125,8 s | MSE + coseno (0,50) |
| Total | 357 | 180,3 s | `seq_len=512`, `grad_accum=4`, `topk=64`, VRAM pico 18.712 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los pesos (944,44 MB de `model.safetensors` más 86,24 MB de `attention_weights.safetensors`), más overhead de activaciones y caché KV.
- VRAM de entrenamiento observada: 18.712 MB pico con autocast FP16 y parámetros maestros FP32, `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en FP16; para reproducir el entrenamiento se necesita al menos una GPU de 24 GB (el pico medido de 18,7 GB encaja en una RTX 3090/4090 o A10G).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090 y equivalentes, siempre que se cargue en FP16 o cuantizado.
- Opciones de despliegue: `transformers` con el script de cirugía de NeuralOps o carga directa del repo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-eat-wikitext2 | 495,1 M | no disponible | PPL WikiText-2 val: 26,79 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 494 M aprox. | 32.768 tokens | No disponible en esta ficha (referencia de partida del checkpoint) | Apache 2.0 | Hugging Face |
| Otros checkpoints de NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (según repo) | Hugging Face / GitHub |

La comparación directa con el modelo base carece de datos de perplexity publicados en la información proporcionada; el único punto de referencia interno es el Stage 0 pre-KD (139,81), que mide el checkpoint tras la cirugía antes de destilar, no el Qwen2.5-0.5B original.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre WikiText-2 en inglés; no hay evidencia de calidad en otros dominios, idiomas o tareas instructivas.
- El checkpoint es un artefacto de investigación sobre atención eficiente, no un modelo afinado para instrucciones ni para conversación de producción.
- Riesgo elevado de alucinación y de degradación fuera de distribución: la perplexity de 26,79 es alta en términos absolutos para un modelo de 0,5 B y el autor no reporta evaluaciones de capacidad.
- El resultado de benchmarks está marcado como `verified: false`; procede de la model card del autor y no ha sido validado de forma independiente.
- La carga requiere el código de NeuralOps (`apply_qwen_attention_surgery`) o la compatibilidad del repo con `transformers`; la librería declarada es `neuralops`, no `transformers` estándar.
- `supports_rope: N/A` en `EATBlock`: el comportamiento posicional fuera de la longitud de entrenamiento (512 tokens) no está documentado.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar ambas condiciones al redistribuir.
- Sin datos de sesgos, toxicidad ni evaluaciones de seguridad publicadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-eat-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
