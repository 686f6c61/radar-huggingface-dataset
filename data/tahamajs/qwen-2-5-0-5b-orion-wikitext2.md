# tahamajs/qwen-2.5-0.5b-orion-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-orion-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo de lenguaje entrenado desde cero, sino un Qwen2.5-0.5B (desarrollado originalmente por Alibaba Qwen) al que se le han sustituido quirúrgicamente 18 de sus 24 capas de atencion por un operador de atencion alternativo denominado ORION (`ORIONAttention`), preservando 6 capas con atencion cuadratica completa como anclas. El objetivo es explorar mecanismos de atencion subcuadratica mediante destilacion de conocimiento, no ofrecer un modelo listo para produccion.

El modelo base Qwen2.5-0.5B es un transformer decoder-only denso de aproximadamente 494 millones de parametros, con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. El checkpoint publicado contiene unicamente los pesos de atencion modificados (`attention_weights.safetensors`, 59,29 MB), no los pesos completos del modelo, por lo que requiere cargar el Qwen2.5-0.5B original y aplicar la cirugia de atencion antes de inyectar los pesos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion (357 descargas, 0 likes, creado en noviembre de 2026) orientado a estudiar la viabilidad de operadores de atencion alternativos con destilacion en dos etapas. Su perplexity final en WikiText-2 es de 209,62, muy superior a la de un modelo de 0,5B bien entrenado, lo que confirma que es un experimento de arquitectura y no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atencion sustituidas por `ORIONAttention` (patron `hybrid_3_1`); 6 capas cuadraticas ancla en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | No disponible de forma explicita; el modelo base Qwen2.5-0.5B tiene ~494 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible (solo se documenta entrenamiento en FP16 con master FP32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 59,29 MB) + `config.json` + `tokenizer.json`; requiere el checkpoint base Qwen2.5-0.5B para funcionar |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atencion causal estandar, 24 capas, GQA con 14 cabezas de consulta y 2 cabezas KV (`head_dim=64`, `hidden_size=896`). La intervencion reemplaza las proyecciones de atencion de 18 capas mediante el `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y aplica el contrato "Single-`o_proj`". Se conservan 6 capas con atencion cuadratica completa como anclas (patron `hybrid_3_1`). El operador ORION soporta atencion causal, bidireccional, cross-attention y GQA nativa, pero no soporta RoPE segun la model card.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenar) arrojo una perplexity causal de 497.411,42. La etapa 1 (alineacion con backbone congelado, `lm_head` eludido, MSE y coseno a nivel de capa con peso 0,25) duro 78 pasos (54,5 s). La etapa 2 (destilacion de representaciones multicapa, MSE y coseno con peso 0,50) duro 179 pasos (125,3 s). En total, 257 pasos de optimizacion en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 17.404 MB de VRAM pico en FP16 con parametros maestro FP32. La perplexity final fue de 209,62, una reduccion de 497.201,80 puntos respecto al baseline post-cirugia, pero aun muy lejos de valores competitivos.

## Capacidades

- Generacion de texto causal autorregresiva (tarea declarada: `text-generation`).
- Atencion causal, bidireccional y cross-attention a nivel de modulo (`ORIONAttention`).
- Soporte nativo de GQA con expansion 7x de cabezas KV.
- Compatibilidad con el ecosistema NeuralOps (`neuralops.hub.load_surgeried_model`) y con `transformers` tras aplicar la cirugia.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta soporte de RoPE en el operador ORION, lo que limita la extrapolacion de contexto.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como banco de pruebas reproducible para comparar `ORIONAttention` frente a atencion cuadratica estandar en un backbone conocido (Qwen2.5-0.5B) con telemetria de perplexity y tiempos de entrenamiento documentados.
- Estudio de destilacion post-cirugia: el par de etapas (alineacion con backbone congelado y destilacion de representaciones multicapa) es un ejemplo concreto de recuperacion de perplexity tras reemplazar modulos de atencion, util para disenar pipelines de "surgery + KD" en otros modelos.
- Validacion de adaptadores de atencion: el `QwenAttentionAdapter` con expansion 7x de cabezas KV y contrato Single-`o_proj` puede reutilizarse para probar otros operadores del `ATTENTION_REGISTRY` sobre la misma familia Qwen.
- Prototipado de modulos en NeuralOps: permite ejercitar la API `load_surgeried_model` y el flujo de carga de pesos parciales (`strict=False`) antes de escalar a modelos mayores.
- Docencia y divulgacion tecnica: ejemplo minimo (0,5B, ~59 MB de pesos de atencion) para explicar GQA, atencion hibrida y destilacion de conocimiento sin requerir hardware grande.
- Benchmarking de perplexity en WikiText-2: util como referencia negativa (PPL 209,62) para calibrar cuanto margen de mejora aporta cada etapa de KD en futuros experimentos.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | `Salesforce/wikitext` / `wikitext-2-raw-v1` / validation | Perplexity | 209,62 |

Telemetria interna de entrenamiento (declarada por el autor):

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplexity causal | 497.411,42 |
| Stage 1 (alineacion, backbone congelado) | Pasos / tiempo | 78 / 54,5 s |
| Stage 2 (KD multicapa) | Pasos / tiempo | 179 / 125,3 s |
| Total | Pasos / tiempo | 257 / 180,1 s |
| Total | VRAM pico | 17.404 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; en FP32, unos 2 GB. El checkpoint de atencion anade 59,29 MB. El pico documentado de 17.404 MB corresponde al entrenamiento (FP16 autocast con master FP32), no a inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en FP16; para entrenamiento o KD se documenta el uso de una GPU con ~17,5 GB (clase RTX 4090 / A10 / L4).
- Cabe en GPU consumer: si, en GPUs tipo RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` (cargando el base Qwen2.5-0.5B y aplicando `apply_qwen_attention_surgery`), API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza parcial de los pesos (solo atencion) complica su uso con esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-orion-wikitext2` | ~494 M (base) | No disponible | 209,62 (declarado) | MIT | Hugging Face (pesos de atencion parciales) |
| `Qwen/Qwen2.5-0.5B` (base) | ~494 M | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 (Qwen2.5) | Hugging Face (pesos completos) |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~494 M | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 (Qwen2.5) | Hugging Face (pesos completos) |

La comparativa se limita a la familia base porque no se dispone de datos de perplexity de los modelos Qwen originales en la informacion proporcionada, ni de otros checkpoints del Attention Zoo con los que contrastar. Cualquier comparacion numerica adicional requeriria medir los modelos base en el mismo split.

## Limitaciones y advertencias

- Perplexity muy alta (209,62 en WikiText-2 validation) para un modelo de 0,5B; no es competitivo para generacion de texto real.
- Los pesos publicados son solo de atencion (`attention_weights.safetensors`, 59,29 MB); es imprescindible cargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugia antes de usarlo. No funciona como checkpoint autonomo en `transformers` ni en runtimes estandar.
- Solo ingles; sin capacidades multilingues documentadas.
- Sin soporte de RoPE en el operador ORION segun la model card, lo que limita la extrapolacion de contexto.
- Entrenado exclusivamente sobre WikiText-2 con `seq_len=512`; el dominio y la longitud de contexto estan muy acotados.
- Riesgo elevado de alucinacion y degeneracion de texto por la baja calidad del ajuste.
- No se documentan evaluaciones de sesgo, seguridad ni alineacion (sin RLHF/DPO).
- Licencia MIT declarada, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir o usar comercialmente.
- Proyecto experimental de un autor individual (0 likes, 357 descargas); sin garantias de mantenimiento ni soporte.
- Los benchmarks declarados no estan verificados (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-orion-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- No se han encontrado papers, blogs, demos ni repos adicionales en la informacion proporcionada.
