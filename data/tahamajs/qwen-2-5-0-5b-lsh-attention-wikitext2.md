# tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-lsh-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". Se trata de un fine-tune quirúrgico sobre `Qwen/Qwen2.5-0.5B` en el que se han sustituido 18 de las 24 capas de atención del decoder original por un operador de atención subcuadrática basado en Locality-Sensitive Hashing (LSH), al estilo de Reformer. El objetivo no es producir un modelo listo para producción, sino servir de banco de pruebas reproducible para evaluar cómo afecta la sustitución de atención cuadrática por LSH en un transformer pequeño y qué coste de recuperación exige la destilación posterior.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con GQA de 14 cabezas de query y 2 de key/value, `head_dim=64`, `hidden_size=896`) y aplica un patrón híbrido 3:1: cada bloque de tres capas LSH se ancla con una capa de atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`. Tras la cirugía, el modelo colapsa (perplejidad de 233.308 en WikiText-2) y se recupera parcialmente mediante un pipeline de destilación de conocimiento en dos etapas que lo lleva a una perplejidad final de 709,91.

Es relevante ahora porque ejemplifica una línea de trabajo activa en eficiencia de atención: reemplazar mecanismos cuadráticos por aproximaciones subcuadráticas sin reentrenar desde cero, midiendo el daño y la recuperación con métricas transparentes. El checkpoint es de 0,5 mil millones de parámetros, ocupa 0,1 GB en el repositorio y se distribuye bajo licencia MIT, lo que lo hace accesible para experimentación, aunque sus cifras de calidad distan mucho de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion LSH hibrida 3:1 sobre 18/24 capas; 6 capas de atencion cuadratica completa como ancla |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors` 917,45 MB; `attention_weights.safetensors` 59,24 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only Qwen2 de 0,5 mil millones de parámetros con GQA (14 cabezas de query, 2 de key/value, `head_dim=64`, `hidden_size=896`). La modificación consiste en un "transplante quirúrgico" de atención: 18 de las 24 capas se sustituyen por el operador `LSHAttention` del registro `ATTENTION_REGISTRY` de NeuralOps, una atención basada en Locality-Sensitive Hashing de estilo Reformer que soporta modo causal, bidireccional, cross-attention y GQA nativa, pero no RoPE (`supports_rope: N/A`). Las 6 capas restantes conservan la atención cuadrática original como anclas, siguiendo un patrón intercalado `hybrid_3_1` con anclas en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` gestiona la proyección con expansión automática de cabezas KV (7x) y el contrato de `o_proj` único.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad causal de 233.308,17. La etapa 1 (alineamiento con backbone congelado, `lm_head` desactivado, MSE y coseno por capa a 0,25) ejecuta 119 pasos en 54,5 s. La etapa 2 (destilación multi-capa de representaciones, MSE y coseno a 0,50) ejecuta 273 pasos en 125,5 s. En total, 392 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 16.540 MB de VRAM en FP16 con parámetros maestros en FP32. La perplejidad final es 709,91, una delta de −232.598,26 respecto al estado post-cirugía.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de Qwen2.5-0.5B.
- Atención LSH causal con soporte de GQA nativa en las capas transplantadas.
- Soporte de atención bidireccional y cross-attention a nivel del operador `LSHAttention` (no necesariamente expuesto en el uso estándar de generación).
- Capacidad de servir como banco de pruebas para comparar operadores de atención subcuadrática en el marco NeuralOps.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" en la información proporcionada.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint permite reproducir el pipeline de cirugía y destilación de NeuralOps para medir el impacto de LSH frente a atención cuadrática en un transformer pequeño, con telemetría de perplejidad paso a paso ya publicada.
- Benchmark de operadores de atención: sirve como referencia dentro del "Attention Zoo" para comparar `lsh_attention` con otros operadores del registro bajo un mismo protocolo de destilación y dataset.
- Estudio de destilación de conocimiento post-cirugía: las dos etapas (alineamiento de backbone congelado y destilación multi-capa) son reproducibles en 180 s, lo que permite iterar sobre hiperparámetros de KD en hardware modesto.
- Docencia y formación: ejemplo didáctico de cómo se sustituye un mecanismo de atención en un modelo preentrenado y cómo se mide la degradación y recuperación con perplejidad en WikiText-2.
- Pruebas de integración de la librería `neuralops`: valida el contrato de `QwenAttentionAdapter`, la expansión GQA y el patrón `hybrid_3_1` en un caso real con pesos publicados.
- Experimentación con eficiencia de memoria: al reducir el coste de atención en 18 de 24 capas, permite estudiar el trade-off memoria/calidad en secuencias de 512 tokens con 16,5 GB de VRAM pico durante el entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-lsh-attention-wikitext2 | Salesforce/wikitext (wikitext-2-raw-v1) | validation | Perplejidad | 709,91 |
| qwen-2.5-0.5b-lsh-attention-wikitext2 (Stage 0, post-cirugia) | wikitext-2-raw-v1 | validation | Perplejidad | 233.308,17 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La perplejidad de 709,91 es muy superior a la del modelo base Qwen2.5-0.5B (cuyo valor no se proporciona en la información), lo que indica que el checkpoint no es apto para uso en producción como generador de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño (0,5 B parámetros, ~977 MB de pesos FP16) cabría en GPUs consumer con 4 GB o más en FP16, y en 2-3 GB con cuantización a 8 bits, aunque no se documentan pesos cuantizados.
- VRAM de entrenamiento documentada: 16.540 MB pico en FP16 con parámetros maestros FP32 (suficiente para una RTX 4090 de 24 GB, A100 o H100).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con ≥16 GB para reproducir el entrenamiento y ≥4 GB para inferencia FP16.
- Cabe en GPU consumer: sí, para inferencia; para el pipeline de destilación completo se recomienda ≥16 GB.
- Opciones de despliegue: la librería declarada es `neuralops`, con integración vía `transformers` (`AutoModelForCausalLM`) más la función `apply_qwen_attention_surgery` de `scripts.benchmarks.qwen_zoo_train_mix`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen-2.5-0.5b-lsh-attention-wikitext2 | 0,5 B | No disponible | LSH hibrida 3:1 (18/24 capas) | 709,91 (val) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | No disponible en la informacion | Cuadratica completa con GQA | No disponible en la informacion | Apache 2.0 (segun el modelo base) | Hugging Face |
| Alternativas subcuadraticas de 0,5 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables de otros checkpoints del Attention Zoo ni de modelos subcuadraticos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad de 709,91 en WikiText-2 frente a un estado post-cirugía de 233.308; el modelo no es apto para generación de texto en producción.
- El checkpoint es un artefacto de investigación, no un modelo listo para uso real; la propia model card lo presenta como telemetría de un experimento de cirugía de atención.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- `supports_rope: N/A` en el operador LSH: la codificación posicional rotatoria no está soportada por el módulo transplantado, lo que puede afectar a la extrapolación de contexto.
- Entrenado únicamente sobre WikiText-2 con `seq_len=512`; no hay evidencia de generalización fuera de ese dominio ni de esa longitud.
- Riesgo elevado de alucinación y de texto incoherente dado el nivel de perplejidad.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y entrenarse solo en WikiText-2, hereda los sesgos del corpus y del modelo base.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero la calidad del modelo hace inviable ese uso en la práctica.
- Los resultados de benchmarks están marcados como `verified: false`; no han sido validados de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-lsh-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
