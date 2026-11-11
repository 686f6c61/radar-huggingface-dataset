# tahamajs/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps Attention Zoo. No es un modelo entrenado desde cero, sino una cirugía de atención sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas del decoder por un módulo propietario denominado `PreconditionedGDNAttention` (Gated DeltaNet con precondicionamiento de curvatura), conservando 6 capas con atención cuadrática completa como anclas. El resultado se destila sobre WikiText-2 con el objetivo de que el modelo modificado recupere el comportamiento del original.

La relevancia es fundamentalmente de investigación: sirve como banco de pruebas reproducible para evaluar mecanismos de atención subcuadrática sobre un transformer pequeño y bien conocido, y para estudiar técnicas de destilación de conocimiento aplicadas a sustituciones arquitectónicas. El repositorio solo distribuye los pesos de atención (`attention_weights.safetensors`, 132,36 MB), no un modelo autónomo listo para usar: requiere descargar el Qwen2.5-0.5B base y aplicar la cirugía con el código de NeuralOps.

El dato crítico es su perplejidad en WikiText-2: 64 264,64, idéntica antes y después de la destilación (delta +0,00). Es decir, el proceso de destilación de 6 pasos no ha recuperado capacidad alguna respecto al estado post-cirugía, y el modelo está muy lejos de ser funcional para generación de texto realista. Debe interpretarse como un artefacto de experimentación, no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `PreconditionedGDNAttention` (Gated DeltaNet con precondicionamiento) + 6/24 capas de atencion cuadratica completa |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo contiene pesos de atencion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos en FP16; el repo incluye solo safetensors de atencion) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 132,36 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de query, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. La cirugía aplica el patrón `hybrid_3_1`: 18 capas se sustituyen por `PreconditionedGDNAttention` mediante el `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y mantiene el contrato de una sola `o_proj`. Las capas en los indices `[3, 7, 11, 15, 19, 23]` conservan atencion cuadratica completa como anclas. El módulo `PreconditionedGDNAttention` implementa una Gated DeltaNet con precondicionamiento de covarianza empírica/diagonal: `P_t = (diag(s_t) + lambda*I)^{-1/2}`, `k_tilde_t = P_t @ k_t`, y una actualizacion de estado `S_t = alpha_t * S_{t-1}(I - beta_t * k_tilde_t k_tilde_t^T) + beta_t * k_tilde_t v_t^T`, alineada con el "Whitened Covariance Preconditioner" de NeuralOps.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) ejecuta 2 pasos en 60,4 s con `lm_head` desactivado y perdida MSE/coseno por capa (peso 0,25). La etapa 2 (destilacion de representacion multicapa) ejecuta 4 pasos en 120,3 s con MSE/coseno por capa (peso 0,50). En total, 6 pasos de optimizacion en 181,0 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 12 358 MB en autocast FP16 con parametros maestros en FP32. No se reporta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de texto causal autoregresiva (soporte `supports_causal: Yes`), si bien la calidad medida es muy baja (PPL 64 264,64 en WikiText-2).
- Soporte de atencion bidireccional (`supports_bidirectional: Yes`) y cross-attention (`supports_cross_attention: Yes`) a nivel de modulo.
- Soporte nativo de GQA (`supports_gqa: Yes`).
- Operador de atencion personalizado (`is_custom_attention: Yes`); no usa RoPE en el modulo sustituido (`supports_rope: N/A`).
- Capacidad multilingue: solo ingles declarado.
- No se documentan tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio.
- Capacidad conversacional declarada en los tags (`conversational`), pero sin evidencia de calidad en la model card.

## Casos de uso

- Investigacion en atencion subcuadratica: banco de pruebas reproducible para comparar `PreconditionedGDNAttention` frente a atencion cuadratica en un transformer de 0,5B con capas ancla, midiendo perplejidad en WikiText-2 bajo un protocolo fijo.
- Estudio de destilacion post-cirugia: el par de etapas (alineacion con backbone congelado + destilacion de representacion multicapa) sirve para analizar si 6 pasos de KD recuperan capacidad tras una sustitucion arquitectonica; el delta de +0,00 documenta un caso de no recuperacion.
- Validacion de adaptadores de atencion (`QwenAttentionAdapter`): util para verificar la expansion 14:2 de GQA y el contrato de `o_proj` unico al portar modulos de atencion entre arquitecturas.
- Reproduccion de telemetria de entrenamiento: los tiempos, pasos, VRAM pico y metricas permiten replicar el pipeline en una unica GPU de 16 GB o superior.
- Desarrollo de kernels y operadores: al ser un operador personalizado, sirve para probar implementaciones de Gated DeltaNet precondicionada en frameworks de inferencia.
- Docencia y experimentacion academica: ejemplo compacto (0,5B, repo de 0,2 GB) de cirugia arquitectonica y destilacion sobre un modelo base abierto.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes ni ninguna tarea que requiera texto coherente, dada su perplejidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 64 264,64 |
| WikiText-2, estado post-cirugia (Stage 0) | Perplejidad | 64 264,64 |
| Delta de perplejidad tras KD | Diferencia | +0,00 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la perplejidad, y su valor absoluto indica que el modelo no genera texto utilizable.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial; por tamano (0,5B en FP16) cabria en torno a 1-2 GB, pero el repo solo contiene pesos de atencion y requiere el modelo base completo.
- VRAM de entrenamiento reportada: 12 358 MB de pico con autocast FP16 y parametros maestros FP32, `seq_len=512`.
- GPU recomendadas: cualquier GPU con al menos 16 GB para replicar el entrenamiento (por ejemplo RTX 4090, A100, H100); para inferencia basta una GPU consumer con 4-8 GB.
- Cabe en GPU consumer: si, por tamano; la limitacion es la calidad, no el hardware.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El modulo es un operador personalizado de NeuralOps y requiere el codigo de `scripts.benchmarks.qwen_zoo_train_mix` para aplicar la cirugia; no hay GGUF publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B + preconditioned_gdn_attention) | ~0,5B | No disponible | PPL WikiText-2 64 264,64 | MIT | Solo pesos de atencion en HF |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens (segun model card de Qwen) | No reportado aqui | Apache 2.0 (segun Qwen) | Modelo completo en HF |
| Qwen2.5-1.5B | 1,5B | 32 768 tokens | No reportado aqui | Apache 2.0 | Modelo completo en HF |

La comparativa directa con alternativas subcuadraticas (Mamba, RWKV, Gated DeltaNet originales) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad de 64 264,64 en WikiText-2: el modelo no produce texto coherente; no debe usarse en produccion ni en tareas reales.
- La destilacion no ha recuperado capacidad alguna (delta +0,00): el checkpoint es equivalente al estado post-cirugia sin destilar.
- Solo se distribuyen pesos de atencion: es obligatorio descargar Qwen2.5-0.5B y aplicar la cirugia con codigo externo (NeuralOps); no es un modelo autónomo.
- Solo ingles declarado; sin capacidades multilingues verificadas.
- Riesgo alto de alucinacion y salidas degeneradas por la baja calidad del modelo.
- Sesgos: no documentados, pero hereda los del corpus WikiText-2 (texto enciclopedico en ingles) y del modelo base Qwen2.5-0.5B.
- Licencia MIT en este repo; conviene verificar la licencia del modelo base Qwen2.5-0.5B para uso comercial.
- Sin soporte documentado en frameworks de inferencia estandar (vLLM, llama.cpp, TGI) ni cuantizaciones publicadas.
- Entrenamiento muy corto (6 pasos, 181 s) y sin validacion mas alla de WikiText-2; resultados no verificados por terceros.
- No usar como referencia de rendimiento de `PreconditionedGDNAttention`: el experimento no demuestra que el mecanismo funcione, solo documenta un intento fallido de recuperacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
