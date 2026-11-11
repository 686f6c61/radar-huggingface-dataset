# tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que las capas de atencion del decodificador han sido sustituidas quirurgicamente por el operador `RPCAttention` (Random Projection Compressed Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs` y el modelo forma parte de un "Attention Zoo" cuyo objetivo es evaluar variantes de atencion subcuadratica sobre arquitecturas transformer ya entrenadas.

El modelo no es un modelo de proposito general: es un artefacto de investigacion que demuestra una tecnica de "cirugia" de atencion combinada con destilacion de conocimiento en dos etapas para recuperar capacidad predictiva tras reemplazar la atencion cuadratica original. La topologia empleada es `hybrid_3_1`: 18 de las 24 capas usan `rpc_attention` y 6 capas conservan la atencion cuadratica completa como anclas.

Es relevante para investigadores interesados en atencion eficiente, en la viabilidad de sustituir mecanismos de atencion a posteriori y en metodologias de destilacion capa a capa. La perplexity final en WikiText-2 es de 246,16, un valor muy alto en terminos absolutos que refleja el caracter experimental y no pulido del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: `rpc_attention` en 18/24 capas y atencion cuadratica completa en 6/24 capas (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; solo se distribuyen pesos de atencion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el checkpoint se entreno con `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 80,52 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV y `head_dim=64` (GQA). Sobre esa base se aplica una "cirugia" de atencion mediante `QwenAttentionAdapter`, que sustituye las proyecciones de atencion en 18 capas por el operador `RPCAttention` (atencion comprimida por proyeccion aleatoria), con expansion automatica de cabezas KV (7x) y contrato de `o_proj` unico. Las 6 capas restantes mantienen atencion cuadratica completa como anclas, siguiendo el patron `hybrid_3_1`.

El operador `RPCAttention` soporta atencion causal, bidireccional y cross-attention, pero no soporta GQA nativo ni rotary embeddings (marcado como `N/A`). Tras la sustitucion, el modelo se somete a una destilacion de conocimiento en dos etapas: (1) alineacion con backbone congelado, 114 pasos (54,4 s), con `lm_head` desactivado y perdida MSE + coseno capa a capa a escala 0,25; (2) destilacion de representacion multicapa, 261 pasos (125,7 s), con escala 0,5. En total 375 pasos de optimizacion en 180,4 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 17.556 MB en FP16 con parametros maestros en FP32. La perplexity causal paso de 49.413,90 (baseline post-cirugia sin destilar) a 246,16 tras la destilacion.

## Capacidades

- Generacion de texto autoregresiva causal en ingles.
- Razonamiento y conocimiento general heredados parcialmente de Qwen2.5-0.5B, aunque muy degradados por la perplexity final.
- Soporte de atencion bidireccional y cross-attention a nivel de operador (segun la model card), aunque el checkpoint se distribuye para uso causal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- No dispone de modo "thinking", vision ni audio.
- Uso previsto: evaluacion de variantes de atencion y experimentacion, no produccion.

## Casos de uso

- Investigacion en atencion subcuadratica: servir como referencia reproducible para comparar `rpc_attention` frente a atencion cuadratica en un transformer ya entrenado, cargando los pesos de atencion sobre Qwen2.5-0.5B con `apply_qwen_attention_surgery`.
- Estudio de destilacion post-cirugia: el `training_metrics.json` y la telemetria de las dos etapas permiten analizar la recuperacion de perplexity (de 49.413,90 a 246,16) como caso de estudio metodologico.
- Benchmarking de operadores de atencion: util para medir el impacto de la topologia `hybrid_3_1` en latencia y memoria frente a la atencion original en GPUs de gama media.
- Prototipado de arquitecturas hibridas: base para experimentar con patrones de intercalado (por ejemplo, variantes 2:1 o 4:1) sin reentrenar desde cero.
- Docencia y divulgacion: ejemplo didactico de sustitucion de modulos de atencion y de destilacion capa a capa con presupuesto de computo reducido (180 s de entrenamiento).
- Validacion de pipelines NeuralOps: comprobar la integracion de `QwenAttentionAdapter` y del registro `ATTENTION_REGISTRY` en flujos de carga y evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 246,16 |

Telemetria de entrenamiento adicional reportada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, sin KD) | Perplexity causal | 49.413,90 |
| Post-KD | Perplexity causal | 246,16 |
| Delta | Perplexity | -49.167,74 |
| Stage 1 (alineacion) | Pasos / tiempo | 114 / 54,4 s |
| Stage 2 (KD multicapa) | Pasos / tiempo | 261 / 125,7 s |
| Total | Pasos / tiempo | 375 / 180,4 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; con overhead de activaciones y cache KV, cabe holgadamente en GPUs consumer con 4-8 GB.
- El entrenamiento reportado consumio un pico de 17.556 MB (FP16 autocast con parametros maestros FP32), por lo que se uso una GPU de al menos 24 GB (por ejemplo, RTX 3090/4090, A10G, L4 o superior).
- GPU recomendadas para inferencia: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) o profesional (A100, H100) sin problema de memoria.
- Despliegue: la libreria declarada es `neuralops`, no `transformers` estandar; la carga requiere `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2` | 0,5 B | no disponible | 246,16 (declarada) | MIT | Hugging Face (0 descargas) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens (nativo Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5 B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa directa de perplexity con el modelo base no esta disponible en la informacion proporcionada; el propio autor reporta que el modelo post-cirugia sin destilar alcanzaba 49.413,90, lo que sugiere que la atencion original de Qwen2.5-0.5B seria sustancialmente mejor que el resultado final de 246,16.

## Limitaciones y advertencias

- Perplexity muy elevada (246,16) en WikiText-2: la calidad de generacion es baja en terminos absolutos y no es apta para produccion.
- Solo se distribuyen los pesos de atencion (`attention_weights.safetensors`); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con el codigo de NeuralOps.
- Dependencia de una libreria no estandar (`neuralops`) y de scripts del repositorio del autor; no hay integracion documentada con transformers, vLLM o llama.cpp.
- Solo ingles declarado; no se garantiza comportamiento multilingue.
- No hay datos de sesgos, alucinacion ni evaluaciones de seguridad.
- Entrenado exclusivamente en WikiText-2 con `seq_len=512`, lo que limita el contexto efectivo observado.
- El operador `RPCAttention` no soporta GQA nativo ni rotary embeddings, lo que puede afectar a la fidelidad respecto a la arquitectura original.
- Licencia MIT permite uso comercial, pero el estado experimental y la baja calidad desaconsejan cualquier despliegue real.
- Cero descargas y cero likes en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
