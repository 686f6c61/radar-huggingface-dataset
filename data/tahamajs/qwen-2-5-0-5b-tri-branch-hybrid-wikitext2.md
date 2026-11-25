# tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2` es un checkpoint experimental publicado por el autor independiente tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". Se trata de un Qwen2.5-0.5B (modelo base de Alibaba Qwen, 0,49 mil millones de parametros, arquitectura transformer decoder-only) al que se le han sustituido quirurgicamente 18 de sus 24 capas de atencion por un operador propio denominado `TriBranchHybridAttention` (clave de registro `tri_branch_hybrid`), manteniendo 6 capas de atencion cuadratica completa como anclas. El objetivo no es producir un modelo de proposito general, sino servir de banco de pruebas reproducible para investigar atencion subcuadratica e hibrida sobre un backbone conocido.

El modelo se ha recuperado mediante un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de una perplejidad causal de 43.434,69 tras la cirugia y descendiendo hasta 221,30 en validacion. Es relevante ahora porque demuestra un flujo de trabajo de "cirugia de atencion" con recuperacion via KD en apenas 180,3 segundos de entrenamiento (319 pasos) y 21.640 MB de VRAM pico, lo que lo convierte en una referencia practica para quien quiera experimentar con variantes de atencion sin reentrenar desde cero.

La relevancia practica es, por tanto, metodologica mas que de producto: el checkpoint es un artefacto de investigacion (87,05 MB de pesos de atencion) con licencia MIT, idioma declarado ingles y sin datos de benchmarks estandar (MMLU, HumanEval, GSM8K). No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atencion hibrida: 18/24 capas `TriBranchHybridAttention` + 6 capas de atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23); patron `hybrid_3_1` |
| Parametros totales | 0,49 mil millones (heredados de Qwen2.5-0.5B; hidden_size 896, 14 cabezas query, 2 cabezas KV, head_dim 64) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16; el autor no documenta GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 87,05 MB) + `config.json` + `tokenizer.json`; requiere aplicar la cirugia sobre el base Qwen/Qwen2.5-0.5B antes de cargar |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con GQA (14 cabezas query, 2 cabezas KV, head_dim 64, hidden_size 896). Sobre ese backbone se aplica un `QwenAttentionAdapter` que sustituye las proyecciones de atencion en 18 de las 24 capas por el operador `TriBranchHybridAttention`, con expansion automatica 7x de cabezas KV donde es necesario y contrato de un unico `o_proj`. Las 6 capas restantes conservan atencion cuadratica completa como anclas, siguiendo un patron intercalado 3:1. El operador declara soporte para causal, bidireccional, cross-attention, GQA nativo, RoPE y atencion personalizada.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineacion con backbone congelado (97 pasos, 54,5 s, MSE y coseno por capa a 0,25, con `lm_head` puenteado) y una segunda de destilacion de representaciones multicapa (222 pasos, 125,3 s, MSE y coseno a 0,50). En total, 319 pasos y 180,3 s con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 con parametros maestros FP32 y 21.640 MB de VRAM pico. La perplejidad causal pasa de 43.434,69 (post-cirugia, zero-shot) a 221,30 (final). No se documenta RLHF, DPO ni composicion detallada del dataset mas alla de WikiText-2.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada del backbone Qwen2.5-0.5B y recuperada parcialmente mediante KD.
- Atencion hibrida con soporte declarado para causal, bidireccional y cross-attention en el operador `TriBranchHybridAttention`.
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- Integracion con el ecosistema NeuralOps via `neuralops.hub.load_surgeried_model` para carga en una linea.
- Capacidad de servir como banco de pruebas para comparar variantes de atencion subcuadratica sobre un mismo backbone.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint permite reproducir el pipeline de cirugia y KD sobre Qwen2.5-0.5B en menos de 4 minutos de entrenamiento, util para comparar operadores del `ATTENTION_REGISTRY` bajo condiciones controladas.
- Validacion de recetas de destilacion: las dos etapas documentadas (alineacion con backbone congelado y destilacion multicapa) sirven como linea base reproducible para medir cuanto recupera una receta de KD tras una cirugia agresiva (delta de -43.213,38 puntos de perplejidad).
- Prototipado de arquitecturas hibridas: el patron `hybrid_3_1` con 6 anclas cuadraticas permite estudiar el equilibrio entre coste computacional y calidad en modelos pequenos antes de escalar a tamanos mayores.
- Educacion y divulgacion tecnica: el modelo ilustra de forma tangible que ocurre al sustituir capas de atencion y como se recupera con KD, con telemetria completa (pasos, tiempos, VRAM, perplejidad) publicada.
- Pruebas de integracion del stack NeuralOps: sirve para validar `load_surgeried_model`, `apply_qwen_attention_surgery` y el adaptador `QwenAttentionAdapter` en pipelines de CI antes de usar checkpoints mayores.
- Experimentos de eficiencia en hardware modesto: con 0,49 mil millones de parametros y pesos de atencion de 87 MB, cabe en GPUs de consumo para iterar rapidamente sobre hipotesis de atencion sin grandes presupuestos de computo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, wikitext-2-raw-v1, validation | Perplejidad | 221,30 |
| Baseline post-cirugia (Stage 0) | wikitext-2-raw-v1 | Perplejidad | 43.434,69 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La unica metrica reportada es la perplejidad en WikiText-2, y el propio autor la marca como no verificada (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento reporto 21.640 MB pico con FP16 y parametros maestros FP32; para inferencia en FP16 de un modelo de 0,49 mil millones de parametros se estima un consumo muy inferior (no cuantificado en la informacion disponible).
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizo con autocast FP16 y FP32 master, compatible con GPUs tipo A100 o superiores por el pico de 21,6 GB.
- Cabe en GPU de consumo: si, por tamano (0,49 mil millones de parametros y 87 MB de pesos de atencion), aunque no se documentan pruebas en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model` y el flujo manual con `transformers` + `safetensors` + `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta tiempo de entrenamiento (180,3 s para 319 pasos con `seq_len=512`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Benchmark reportado |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-tri-branch-hybrid-wikitext2 | 0,49 B | no disponible | Hibrida 3:1 (`tri_branch_hybrid` + cuadratica) | MIT | PPL WikiText-2: 221,30 |
| Qwen/Qwen2.5-0.5B (base) | 0,49 B | no disponible en la informacion proporcionada | Cuadratica completa con GQA | Apache 2.0 (segun el modelo base; no confirmado en la informacion) | no disponible en esta ficha |
| Otros checkpoints del NeuralOps Attention Zoo | 0,49 B | no disponible | Variantes de atencion del registro | MIT (presumiblemente, no confirmado) | no disponible |

La comparativa directa con el base Qwen2.5-0.5B no es posible con los datos aportados: no se incluye la perplejidad del modelo original en WikiText-2, por lo que no se puede cuantificar la perdida de calidad atribuible a la cirugia y la KD. No se dispone de datos de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad de 221,30 en WikiText-2, muy superior a la de un modelo de 0,49 mil millones bien entrenado; la calidad de generacion es previsiblemente baja y no apta para produccion.
- El checkpoint solo contiene pesos de atencion (87,05 MB); requiere el base Qwen2.5-0.5B y aplicar la cirugia antes de cargar, lo que anade pasos y dependencias (NeuralOps, `scripts.benchmarks.qwen_zoo_train_mix`).
- Idioma limitado a ingles; no se documenta soporte multilingue.
- Entrenado unicamente sobre WikiText-2 con `seq_len=512`; no se documenta la longitud de contexto efectiva ni comportamiento en contextos largos.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor; al ser un modelo pequeno y con KD parcial, el riesgo es alto.
- La metrica de perplejidad esta marcada como no verificada (`verified: false`); no hay evaluacion independiente.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse al combinarlos.
- No se documentan capacidades de tool calling, agentes, vision ni modo thinking; no asumir su disponibilidad.
- Proyecto de autor independiente sin mantenedor corporativo; la sostenibilidad y actualizaciones no estan garantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-tri-branch-hybrid-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
