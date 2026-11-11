# tahamajs/qwen-2.5-0.5b-routing-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-routing-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decoder por el operador `RoutingAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de proposito general, sino validar la viabilidad de operadores de atencion subcuadraticos basados en clustering por contenido dentro de una arquitectura transformer preentrenada, midiendo la recuperacion de perplejidad tras una destilacion de conocimiento en dos etapas.

El modelo parte de la arquitectura Qwen2.5 con 0,5 mil millones de parametros, 24 capas y 14 cabezas de consulta con 2 cabezas KV (GQA 7:1), `head_dim=64` y `hidden_size=896`. La intervencion reemplaza 18 de las 24 capas con `RoutingAttention` y conserva 6 capas de atencion cuadratica completa como anclas en los indices `[3, 7, 11, 15, 19, 23]`, siguiendo el patron `hybrid_3_1`.

Es relevante ahora porque demuestra un flujo reproducible de "cirugia de atencion" sobre modelos abiertos: tras la sustitucion, la perplejidad causal en WikiText-2 se dispara a 146.289,08 y, despues de 407 pasos de destilacion en dos fases (180,2 s en total), se recupera hasta 146,99. El repositorio solo contiene los pesos de atencion (59,29 MB), no el modelo completo, y esta pensado para investigadores que trabajen con el framework NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 con atencion hibrida: 18/24 capas con `RoutingAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; los pesos publicados son solo de atencion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors FP16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 59,29 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen2.5-0.5B: transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 7:1), `head_dim=64` y `hidden_size=896`. Sobre ella se aplica `apply_qwen_attention_surgery` con el patron `hybrid_3_1`, que sustituye las proyecciones de atencion de 18 capas mediante el `QwenAttentionAdapter` (contrato de `o_proj` unico, expansion automatica 7x de cabezas KV cuando es necesario) y mantiene intactas las capas 3, 7, 11, 15, 19 y 23 como anclas cuadraticas. El operador `RoutingAttention` implementa clustering por contenido para atencion dispersa, es bidireccional y soporta cross-attention y GQA nativo, pero **no** soporta causalidad de forma nativa (`supports_causal: No`), lo que obliga a adaptar el flujo autoregresivo.

El entrenamiento es una destilacion de conocimiento en dos etapas desde el modelo base congelado, sobre `wikitext-2-raw-v1` (split de validacion), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado) ejecuta 124 pasos en 54,3 s con `lm_head` desactivado y perdida layerwise MSE + coseno con peso 0,25. La etapa 2 (destilacion de representacion multicapa) ejecuta 283 pasos en 125,6 s con peso coseno 0,50. En total, 407 pasos y 180,2 s, con un pico de VRAM de 15.066 MB en FP16 con parametros maestros del estudiante en FP32. No se documenta uso de RLHF, DPO ni datos adicionales fuera de WikiText-2.

## Capacidades

- Generacion de texto autoregresiva sobre el checkpoint base, condicionada a la recuperacion de perplejidad tras la cirugia (no se valida calidad generativa mas alla de WikiText-2).
- Atencion bidireccional y cross-attention a nivel de operador, utiles para tareas de representacion fuera del paradigma causal puro.
- Soporte nativo de GQA y expansion de cabezas KV (7:1) a traves del `QwenAttentionAdapter`.
- Compatibilidad con el ecosistema Hugging Face (`transformers`, `safetensors`, `huggingface_hub`) para carga del checkpoint base y sustitucion de pesos.
- Tokenizer de Qwen2.5 incluido (`tokenizer.json`, 10,89 MB) con el vocabulario original.
- Capacidad de servir como banco de pruebas para comparar operadores de atencion subcuadraticos frente a atencion cuadratica completa.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking especificas de este checkpoint.

## Casos de uso

- Investigacion en atencion eficiente: servir de referencia reproducible para medir el coste de recuperacion de perplejidad al sustituir atencion cuadratica por `RoutingAttention` en un transformer preentrenado.
- Benchmarking de operadores en el registro NeuralOps: comparar `routing_attention` con otros operadores del `ATTENTION_REGISTRY` bajo el mismo protocolo de cirugia y destilacion.
- Estudio de destilacion de conocimiento post-cirugia: analizar la contribucion de cada etapa (alineacion con backbone congelado frente a destilacion multicapa) al delta de perplejidad de -146.142,09.
- Validacion de contratos de adaptadores: probar el `QwenAttentionAdapter` con GQA 14:2 y el contrato de `o_proj` unico en modelos Qwen2 de distintos tamanos.
- Prototipado de inferencia con arquitecturas hibridas: evaluar el equilibrio entre capas subcuadraticas y anclas cuadraticas (patron 3:1) en terminos de coste y calidad.
- Reproduccion de experimentos academicos: replicar el pipeline de 407 pasos en 180,2 s con 15 GB de VRAM en una unica GPU para validar resultados de investigacion sobre atencion dispersa.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Dataset / split | Metrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-routing-attention-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`), validation | Perplejidad | 146,99 |
| Baseline post-cirugia (Stage 0, sin KD) | `wikitext-2-raw-v1` | Perplejidad | 146.289,08 |
| Delta tras destilacion | `wikitext-2-raw-v1` | Perplejidad | -146.142,09 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: 15.066 MB de pico con FP16 autocast y parametros maestros del estudiante en FP32 (una sola GPU de 16 GB es suficiente).
- VRAM de inferencia: no disponible de forma explicita; el checkpoint base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB, pero el modelo requiere aplicar la cirugia y cargar los pesos de atencion (59,29 MB) ademas del base.
- GPU recomendadas para reproducir el entrenamiento: cualquier GPU con al menos 16 GB (RTX 4090, A100 40 GB, H100); para inferencia basta una GPU consumer con 4-8 GB.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores; no confirmado por el autor.
- Opciones de despliegue: el autor documenta un flujo con `transformers`, `huggingface_hub` y `safetensors` mas `scripts.benchmarks.qwen_zoo_train_mix.apply_qwen_attention_surgery`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la falta de variantes GGUF hace improbable el despliegue directo en llama.cpp sin conversion adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-routing-attention-wikitext2 | 0,5 B | no disponible | 146,99 | MIT | Pesos de atencion en HF (59,29 MB) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (segun el modelo base, no verificado aqui) | Modelo completo en HF |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5 B | no disponible | no disponible | MIT (previsiblemente) | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El checkpoint solo contiene pesos de atencion (`attention_weights.safetensors`); es imprescindible descargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con `apply_qwen_attention_surgery` antes de cargar el estado, lo que anade dependencia del repositorio NeuralOps.
- `RoutingAttention` no soporta causalidad nativa (`supports_causal: No`), por lo que el uso autoregresivo depende de la capa de anclas cuadraticas y del adaptador; el rendimiento en generacion abierta no esta validado.
- Entrenado y evaluado unicamente sobre WikiText-2 en ingles; no hay evidencia de generalizacion a otros dominios ni idiomas.
- La perplejidad de 146,99 es muy superior a la esperable en un modelo de 0,5 B sin cirugia (tipicamente decenas), lo que sugiere una degradacion sustancial de la calidad del lenguaje; no debe usarse como modelo de produccion.
- La metrica de perplejidad esta marcada como `verified: false` en la model card; no ha sido validada de forma independiente.
- Riesgo elevado de alucinacion y de generar texto incoherente por la sustitucion de atencion y la destilacion limitada (407 pasos sobre un unico dataset).
- Licencia MIT declarada, pero el modelo base Qwen2.5-0.5B puede tener condiciones adicionales; conviene revisar la licencia del base antes de uso comercial.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ) ni integracion documentada con motores de inferencia de alto rendimiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin senales de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-routing-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
