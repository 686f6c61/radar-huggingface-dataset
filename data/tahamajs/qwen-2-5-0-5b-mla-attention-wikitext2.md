# tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por una implementacion de Multi-Head Latent Attention (MLA) al estilo DeepSeek-V2, extraida del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de proposito general, sino servir como banco de pruebas reproducible para estudiar el impacto de arquitecturas de atencion subcuadraticas sobre un transformer preentrenado de 0,5 mil millones de parametros.

El autor aplica un patron hibrido `hybrid_3_1`: 18 de las 24 capas del decodificador se reemplazan por `mla_attention` mediante el adaptador `QwenAttentionAdapter`, mientras que 6 capas conservan la atencion cuadratica original como anclas en los indices 3, 7, 11, 15, 19 y 23. Tras la cirugia, el modelo se recupera mediante un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2, reduciendo la perplejidad de validacion desde 449.229,72 (baseline post-cirugia) hasta 295,32 en 394 pasos de optimizacion.

Es relevante ahora porque ejemplifica una linea de investigacion activa: reutilizar pesos preentrenados y sustituir solo el operador de atencion para evaluar alternativas a la atencion cuadratica con un coste de entrenamiento minimo (180,2 segundos en una sola GPU). El checkpoint es de licencia MIT, esta en formato safetensors y depende de la libreria `neuralops` para cargarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con MLA (DeepSeek-V2 style) y 6/24 capas con atencion cuadratica original |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 en el ejemplo de uso) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 940,50 MB; `attention_weights.safetensors` 82,29 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. Sobre esa base, el autor aplica una "cirugia" de atencion con patron `hybrid_3_1`: tres capas MLA por cada capa cuadratica preservada, resultando en 18 capas transplantadas y 6 anclas en los indices [3, 7, 11, 15, 19, 23]. El adaptador `QwenAttentionAdapter` realiza una expansion 14:2 de las cabezas GQA (hasta 7x de expansion KV donde es necesario) y fuerza el contrato de un unico `o_proj`. El modulo `MLAAttention` soporta atencion causal, bidireccional, cross-attention y GQA nativo, y declara `supports_rope = N/A`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) ejecuta 120 pasos en 54,5 segundos con `lm_head` desactivado y una perdida combinada de MSE y coseno sobre estados ocultos con peso 0,25. La etapa 2 (destilacion de representacion multicapa) ejecuta 274 pasos en 125,5 segundos con peso 0,50. En total: 394 pasos, 180,2 segundos, `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 17.652 MB en FP16 con parametros maestros en FP32. La perplejidad causal pasa de 449.229,72 (post-cirugia, sin entrenar) a 295,32 tras la destilacion.

## Capacidades

- Generacion de texto autoregresiva causal, heredada del modelo base Qwen2.5-0.5B.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo `MLAAttention` (utilidad para experimentacion, no para el checkpoint tal cual).
- Soporte nativo de GQA con expansion automatica de cabezas KV en el adaptador.
- Capacidades conversacionales basicas heredadas del base model (pipeline `text-generation`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- Capacidad multilingue limitada al ingles segun el campo `language: en` de la model card.

## Casos de uso

- Investigacion sobre atencion subcuadratica: banco de pruebas controlado para medir el impacto de MLA frente a atencion cuadratica en un transformer pequeno, con baseline post-cirugia y post-destilacion documentados.
- Reproducibilidad de experimentos de cirugia de atencion: el checkpoint permite validar el pipeline `apply_qwen_attention_surgery` del proyecto NeuralOps con un patron `hybrid_3_1` concreto.
- Estudio de destilacion de conocimiento post-cirugia: las metricas de las dos etapas (120 y 274 pasos, perdidas MSE y coseno) sirven como referencia para comparar estrategias de recuperacion de modelos modificados.
- Benchmarking de perplejidad en WikiText-2: util como punto de comparacion para otras variantes del Attention Zoo de NeuralOps sobre el mismo base model.
- Prototipado de inferencia con MLA en entornos de recursos limitados: el modelo cabe en GPUs de consumo y permite medir latencia y throughput de la implementacion MLA a pequena escala.
- Docencia y formacion: ejemplo didactico completo de sustitucion de operador de atencion con telemetria de entrenamiento publicada (pasos, tiempos, VRAM, deltas de perplejidad).

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-mla-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 295,32 | No |

Datos adicionales de telemetria de entrenamiento declarados por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 449.229,72 |
| Post-KD | Perplejidad de validacion | 295,32 |
| Delta de perplejidad | Reduccion | -448.934,40 |
| Stage 1 | Pasos / tiempo | 120 / 54,5 s |
| Stage 2 | Pasos / tiempo | 274 / 125,5 s |
| Total | Pasos / tiempo | 394 / 180,2 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para los pesos (940,50 MB de `model.safetensors` mas 82,29 MB de `attention_weights.safetensors`), mas overhead de activaciones y cache KV.
- El entrenamiento reportado uso 17.652 MB de VRAM pico en FP16 con parametros maestros en FP32, lo que sugiere que una GPU de 24 GB es suficiente para el pipeline de destilacion.
- GPU recomendadas para inferencia: cualquier GPU consumer moderna con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090); para entrenamiento o destilacion, RTX 3090/4090 o A100/H100.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 4 GB o mas de VRAM.
- Opciones de despliegue: la model card solo documenta carga via `transformers` (`AutoModelForCausalLM`) combinada con la libreria `neuralops` y la funcion `apply_qwen_attention_surgery`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2 | 0,5 B | no disponible | 295,32 (no verificado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| Otras variantes del NeuralOps Qwen Attention Zoo | 0,5 B | no disponible | no disponible | MIT (segun repo NeuralOps) | Hugging Face |

La comparativa con alternativas de la misma categoria (otros checkpoints con atencion subcuadratica sobre Qwen2.5-0.5B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: el autor no lo presenta como modelo de produccion, sino como artefacto de un banco de pruebas de atencion.
- Perplejidad de 295,32 en WikiText-2: muy superior a la de un modelo bien entrenado del mismo tamano, lo que indica que la destilacion solo recupera parcialmente el rendimiento del base model.
- Entrenamiento muy corto (394 pasos, 180,2 segundos, `seq_len=512`) sobre un unico dataset (WikiText-2): no hay garantia de generalizacion fuera de ese dominio.
- Solo ingles segun el campo `language: en`; no se documenta soporte multilingue.
- Riesgo elevado de alucinacion y degradacion en generacion abierta por el limitado proceso de recuperacion.
- Dependencia de la libreria `neuralops` y del pipeline `apply_qwen_attention_surgery`: la carga con `transformers` estandar puede no reproducir el comportamiento esperado sin aplicar la cirugia.
- El resultado de perplejidad esta marcado como `verified: false` en el model-index; no ha sido validado por un tercero.
- Sin datos publicados sobre sesgos, seguridad, tool calling ni agentes; no apto para casos de uso que requieran esas capacidades.
- Licencia MIT permite uso comercial, pero el estado experimental y el rendimiento degradado desaconsejan su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mla-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
