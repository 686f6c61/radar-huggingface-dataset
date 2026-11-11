# tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el operador `QCQAAttention` (Quality and Capacity-Aware Grouped Query Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo listo para produccion, sino servir como banco de pruebas reproducible para medir el impacto de operadores de atencion subcuadraticos sobre un transformer pequeno ya entrenado.

El autor aplica una topologia de sustitucion `hybrid_3_1`: 18 de las 24 capas del decodificador adoptan `qcqa_attention`, mientras que 6 capas ancla conservan la atencion cuadratica original de Qwen2 en los indices `[3, 7, 11, 15, 19, 23]`. Sobre esa arquitectura hibrida se ejecuta una destilacion de conocimiento en dos etapas (alineamiento con backbone congelado y destilacion multi-capa) sobre WikiText-2, que reduce la perplejidad de validacion desde 139,14 (baseline post-cirugia sin entrenar) hasta 25,35.

El modelo es relevante para investigadores interesados en eficiencia de atencion, ya que publica telemetria detallada del proceso de recuperacion de capacidad tras la sustitucion del operador, con tiempos, pasos y VRAM pico. Se distribuye unicamente con pesos de atencion (161,51 MB) y requiere recomponer el modelo base Qwen2.5-0.5B mediante el adaptador `QwenAttentionAdapter` para poder ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con sustitucion hibrida de atencion: 18/24 capas con `QCQAAttention`, 6/24 capas con atencion cuadratica Qwen2 original |
| Parametros totales | no disponible (deriva de Qwen2.5-0.5B, ~0,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16; no se declaran GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 161,51 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV y `head_dim=64` (GQA 14:2). Sobre esa base se aplica una cirugia de atencion con patron `hybrid_3_1`: 18 de las 24 capas se reemplazan por `QCQAAttention` mediante `QwenAttentionAdapter`, con expansion automatica de cabezas KV (7x) donde es necesario y contrato de bypass con una unica `o_proj`. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) se mantienen como anclas cuadraticas para preservar estabilidad.

El operador `QCQAAttention` soporta atencion causal autoregresiva, bidireccional, cross-attention, GQA nativo y RoPE, y se registra como atencion personalizada (`is_custom_attention`). El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`): la etapa 1 (alineamiento con backbone congelado, `lm_head` en bypass) usa MSE y coseno de estados ocultos con peso 0,25 durante 130 pasos (54,5 s); la etapa 2 (destilacion de representaciones multi-capa) usa los mismos objetivos con peso 0,50 durante 298 pasos (125,5 s). En total, 428 pasos y 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una VRAM pico de 15.970 MB en FP16 con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva (tarea principal declarada: causal language modeling).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de operador (segun el perfil del modulo `QCQAAttention`).
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- Capacidad multilingue limitada al ingles (`language: en`).
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- El checkpoint publicado contiene unicamente pesos de atencion; el resto de pesos debe cargarse desde Qwen2.5-0.5B.

## Casos de uso

- Investigacion en eficiencia de atencion: permite comparar la perplejidad de un operador subcuadratico (`qcqa_attention`) frente a la atencion cuadratica original sobre el mismo backbone, con telemetria reproducible de las dos etapas de destilacion.
- Reproduccion de experimentos de cirugia de atencion: el parche `apply_qwen_attention_surgery` y el patron `hybrid_3_1` permiten replicar el procedimiento sobre otras variantes de Qwen2.5 para estudiar la recuperacion de capacidad.
- Benchmarking de destilacion de conocimiento: el modelo publica metricas de perplejidad antes y despues de la destilacion (139,14 frente a 25,35), util como linea base para comparar estrategias de KD en modelos pequenos.
- Validacion de adaptadores de atencion: sirve para probar el contrato de `QwenAttentionAdapter` (expansion de cabezas KV, Single-`o_proj`) antes de desplegarlo en modelos de mayor tamano.
- Prototipado educativo: con 0,5 mil millones de parametros y pesos de atencion de 161,51 MB, el modelo cabe en GPUs de consumo y permite experimentar con operadores de atencion personalizados sin infraestructura grande.
- Estudio de trade-offs precision-eficiencia: la mezcla 18/24 capas subcuadraticas frente a 6/24 cuadraticas ofrece un punto de comparacion para analizar el equilibrio entre coste de atencion y calidad de modelado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal language modeling | Salesforce/wikitext, `wikitext-2-raw-v1`, validation | Perplejidad | 25,35 |

Telemetria del proceso de destilacion:

| Etapa | Pasos | Tiempo | Perplejidad |
|---|---:|---:|---:|
| Stage 0 (post-cirugia, sin KD) | — | — | 139,14 |
| Stage 1 (frozen-backbone alignment) | 130 | 54,5 s | — |
| Stage 2 (multi-layer representation KD) | 298 | 125,5 s | — |
| Final (post-KD) | 428 | 180,2 s | 25,35 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 requiere aproximadamente 1 GB de pesos; con overhead de activaciones y cache KV, cabe holgadamente en GPUs de consumo con 4-8 GB.
- VRAM de entrenamiento observada: 15.970 MB pico con FP16 autocast y parametros maestros en FP32 durante la destilacion.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente para inferencia; para reproducir el entrenamiento se necesitan al menos 16 GB (RTX 4080, A4000, A100).
- Despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama o TGI. La libreria declarada es `neuralops`, y la carga requiere `transformers` mas el parche `apply_qwen_attention_surgery` del repositorio NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2` | ~0,5 B | no disponible | Hibrida 18/24 QCQA + 6/24 cuadratica | MIT | Hugging Face (solo pesos de atencion) |
| `Qwen/Qwen2.5-0.5B` | ~0,5 B | no disponible | Cuadratica estandar (GQA 14:2) | no disponible en la informacion | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | ~0,5 B | no disponible | Otros operadores del `ATTENTION_REGISTRY` | MIT (segun el repo NeuralOps) | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible: el unico dato publicado es la perplejidad en WikiText-2 (25,35), sin resultados del modelo base en la misma metrica dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no es un checkpoint listo para produccion; solo publica pesos de atencion y requiere recomponer el modelo base con el parche de cirugia.
- Entrenado exclusivamente sobre WikiText-2 en ingles; el dominio y el idioma estan muy acotados y no se garantiza calidad en otros contextos.
- Perplejidad de 25,35 declarada como `verified: false`; no ha sido validada de forma independiente.
- Riesgo de alucinacion y degradacion en generacion abierta: la destilacion se limita a 428 pasos sobre un corpus pequeno, sin RLHF ni DPO.
- La sustitucion hibrida de atencion puede introducir comportamientos no documentados en contextos largos; no se declara la longitud de contexto efectiva tras la cirugia.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene sus propias condiciones que deben respetarse al recomponer el checkpoint.
- No se declaran sesgos evaluados ni filtros de seguridad.
- Descargas y likes nulos en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-qcqa-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
