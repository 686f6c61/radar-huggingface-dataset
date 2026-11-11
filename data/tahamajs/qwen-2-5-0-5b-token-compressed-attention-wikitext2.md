# tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-token-compressed-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del denominado NeuralOps Qwen Attention Zoo. No se trata de un modelo entrenado desde cero, sino de un derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un modulo propio llamado `TokenCompressedAttention`, una atencion subcuadratica basada en compresion de tokens por chunks. El resto de capas (6 de 24) mantiene la atencion cuadratica original como anclas.

El objetivo del experimento es evaluar si una atencion de complejidad subcuadratica puede recuperar calidad de lenguaje tras una sustitucion agresiva de capas, mediante un proceso de destilacion de conocimiento en dos etapas sobre el corpus WikiText-2. El modelo reporta una perplejidad de validacion de 36,81 en `wikitext-2-raw-v1`, partiendo de una linea base post-cirugia de 235,49, lo que supone una recuperacion de 198,67 puntos de perplejidad.

Es relevante para investigadores interesados en arquitecturas de atencion eficiente, en tecnicas de cirugia de modelos y en destilacion de conocimiento aplicada a la recuperacion de capacidades tras modificaciones estructurales. No es un modelo pensado para uso en produccion: es un artefacto de investigacion con un unico benchmark publicado y sin evaluaciones de tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `TokenCompressedAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | No disponible (modelo base Qwen2.5-0.5B; el checkpoint publicado solo contiene pesos de atencion de 163,48 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 14 cabezas de query, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica un patron de cirugia `hybrid_3_1`: cada bloque de tres capas con atencion comprimida va seguido de una capa con atencion cuadratica completa, preservando las capas en los indices `[3, 7, 11, 15, 19, 23]` como anclas. El adaptador `QwenAttentionAdapter` realiza una expansion 7x de las cabezas KV cuando es necesario y mantiene el contrato de un unico `o_proj`.

El modulo `TokenCompressedAttention` implementa compresion causal de tokens por chunks: la secuencia se divide en bloques de tamano `chunk_size`; dentro de cada bloque se conservan los `top-k` tokens segun una puntuacion de importancia (`0.5 * ||x|| + learned_score(x) + 0.5 * causal_attn_score(x)`), ademas del token 0 y los ultimos `local_window` tokens del bloque. Los chunks futuros nunca influyen en las selecciones de chunks pasados, lo que garantiza causalidad. Soporta atencion causal, bidireccional, cross-attention y GQA nativo.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas sobre WikiText-2 con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado) duro 119 pasos (54,2 s) con MSE y coseno por capa a peso 0,25 y `lm_head` desactivado. La etapa 2 (destilacion de representaciones multicapa) duro 277 pasos (125,8 s) con peso 0,50. El total fueron 396 pasos en 180,3 s con un pico de VRAM de 15.855 MB en FP16 autocast con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo (`TokenCompressedAttention`).
- Soporte nativo de GQA con expansion 7x de cabezas KV mediante el adaptador.
- Capacidad de continuar texto sobre dominios similares a WikiText-2 (texto enciclopedico en ingles).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues: solo ingles segun la model card, aunque el modelo base Qwen2.5 soporta mas idiomas; no se ha verificado su preservacion tras la cirugia.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint sirve como referencia reproducible para comparar `TokenCompressedAttention` frente a atencion cuadratica completa en la misma base Qwen2.5-0.5B, midiendo perplejidad en WikiText-2.
- Estudio de cirugia de modelos: permite analizar el impacto de sustituir 18 de 24 capas de atencion y la eficacia de un esquema `hybrid_3_1` con anclas cuadraticas, usando los indices de capa publicados.
- Validacion de pipelines de destilacion: las dos etapas documentadas (alineacion con backbone congelado y destilacion de representaciones multicapa) sirven como plantilla para recuperar modelos tras modificaciones estructurales.
- Reproduccion de experimentos de eficiencia: util para medir el coste real (pasos, tiempo, VRAM) de recuperar perplejidad en un modelo pequeno antes de escalar a modelos mayores.
- Benchmark de compresion de tokens: permite evaluar el efecto de `topk=64`, `chunk_size` y `local_window` sobre la calidad del lenguaje en un entorno controlado.
- Docencia y formacion: ejemplo practico y ligero (163,48 MB de pesos de atencion) para explicar GQA, atencion causal por chunks y destilacion de conocimiento sin requerir hardware de gran escala.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 36,81 |
| WikiText-2 (post-cirugia, Stage 0) | Perplejidad | 235,49 |
| Delta de recuperacion | Perplejidad | -198,67 |

Telemetria de entrenamiento reportada:

| Etapa | Pasos | Tiempo | Notas |
|---|---:|---:|---|
| Stage 1 (alineacion con backbone congelado) | 119 | 54,2 s | MSE + coseno por capa, peso 0,25 |
| Stage 2 (destilacion de representaciones multicapa) | 277 | 125,8 s | MSE + coseno por capa, peso 0,50 |
| Total | 396 | 180,3 s | `seq_len=512`, `grad_accum=4`, `topk=64` |
| Pico de VRAM | - | - | 15.855 MB (FP16 autocast, maestros FP32) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras tareas downstream en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia, el entrenamiento uso 15.855 MB en FP16 con parametros maestros en FP32; la inferencia pura en FP16 del modelo base de 0,5B deberia requerir del orden de 1-2 GB, pero no se ha verificado para este checkpoint.
- GPU recomendadas: no disponible. El modelo base Qwen2.5-0.5B es ejecutable en GPUs consumer; este checkpoint requiere ademas cargar el modulo `TokenCompressedAttention` desde el repositorio NeuralOps.
- GPU consumer: probablemente compatible con RTX 3060, RTX 4060 o superiores por el tamano del modelo base, pero no confirmado por el autor.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El unico flujo soportado es el uso de `transformers` junto con `apply_qwen_attention_surgery` del repositorio NeuralOps y la carga de `attention_weights.safetensors` con `strict=False`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Atencion | Benchmark publicado |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2` | Base 0,5B (solo pesos de atencion publicados) | No disponible | MIT | Hibrida 18/24 comprimida + 6/24 cuadratica | WikiText-2 PPL 36,81 |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun Qwen2.5) | Apache 2.0 | Cuadratica completa con GQA | Multiples benchmarks publicados por Qwen |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | Base 0,5B | No disponible | MIT | Variantes de atencion subcuadratica | Perplejidad en WikiText-2 |

La comparacion con el modelo base en WikiText-2 no esta publicada en la informacion disponible, por lo que no es posible cuantificar la brecha de calidad respecto a la atencion cuadratica original.

## Limitaciones y advertencias

- Modelo de investigacion: no es un checkpoint listo para produccion; el repositorio solo contiene pesos de atencion (163,48 MB), no el modelo completo.
- Requiere codigo externo: la carga depende de `apply_qwen_attention_surgery` del repositorio NeuralOps, lo que introduce una dependencia no estandar frente a `transformers`.
- Evaluacion limitada: el unico benchmark publicado es perplejidad en WikiText-2; no hay datos de tareas downstream, tool calling ni agentes.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de 0,5B, la tasa esperable es alta en tareas de conocimiento factual.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Idioma: solo se declara ingles; el multilingue del modelo base no se ha verificado tras la cirugia.
- Contexto: el entrenamiento uso `seq_len=512`; no se documenta la ventana de contexto efectiva tras la cirugia.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, por lo que conviene revisar ambas licencias en un uso derivado.
- Reproducibilidad: los resultados de perplejidad estan marcados como no verificados (`verified: false`) y proceden del propio autor.
- Fecha de publicacion futura (2026-11-11) en los metadatos de Hugging Face; conviene tratar el artefacto con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-token-compressed-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
