# tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atencion del decoder por un modulo de atencion subcuadratica denominado `ProjectionFactorizedAttention` (linearizacion SVD con factorizacion de proyecciones), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs`, y el modelo forma parte de una coleccion ("Qwen Attention Zoo") que compara distintas variantes de atencion eficiente sobre una misma base.

El proposito no es ofrecer un modelo de produccion, sino un banco de pruebas reproducible para investigar el impacto de sustituir atencion cuadratica por alternativas subcuadraticas en un LLM pequeno, midiendo la degradacion y la recuperacion mediante destilacion de conocimiento en dos etapas. Tras la cirugia, la perplejidad en WikiText-2 se dispara a 1.657.112,85 y, despues de 421 pasos de destilacion (180,2 s en total), se reduce hasta 3.099,36, un valor aun muy alejado de la calidad del modelo base original.

La relevancia actual es metodologica: documenta con telemetria detallada (pasos, tiempos, VRAM pico, deltas de perplejidad) el coste real de reemplazar el mecanismo de atencion, y publica unicamente los pesos de atencion (76,62 MB) mas tokenizer y config, no un modelo completo listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `ProjectionFactorizedAttention` (linear attention factorizada por SVD) y 6/24 capas con atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 B (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | No disponible (solo se documentan pesos FP16 y autocast FP16 con parametros maestros FP32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 76,62 MB) + `config.json` (2,2 KB) + `tokenizer.json` (10,89 MB) + `training_metrics.json` (388 B) |

Detalles del adaptador de atencion: `QwenAttentionAdapter` mapea las proyecciones de `Qwen2Attention` con 14 cabezas de query, 2 cabezas KV, `head_dim=64` y `hidden_size=896`, aplicando expansion automatica de cabezas KV (7x) y el contrato de bypass con una unica `o_proj`.

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-0.5B` y aplica una "cirugia" de atencion con patron `hybrid_3_1`: por cada bloque de tres capas linearizadas se conserva una capa de atencion cuadratica completa como ancla. El modulo `ProjectionFactorizedAttention` es una atencion lineal basada en factorizacion SVD de las proyecciones, con soporte declarado para causal, bidireccional, cross-attention y GQA nativo; no declara soporte RoPE (`supports_rope: N/A`). El modulo es un operador de atencion personalizado (`is_custom_attention: Yes`).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineacion con backbone congelado, `lm_head` puenteado, MSE + coseno a 0,25) duro 127 pasos (54,1 s). La etapa 2 (destilacion de representaciones multicapa, MSE + coseno a 0,50) duro 294 pasos (125,8 s). En total, 421 pasos y 180,2 s de optimizacion, con un pico de VRAM de 16.847 MB en FP16 autocast con parametros maestros FP32. No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto autoregresiva causal (tarea declarada: `text-generation`, `Causal Language Modeling`).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo.
- Soporte nativo de GQA con expansion de cabezas KV (14 query / 2 KV, con expansion 7x en las capas sustituidas).
- Capacidad de cargarse como pesos de atencion sobre el modelo base mediante `apply_qwen_attention_surgery` o via `neuralops.hub.load_surgeried_model`.
- Capacidades conversacionales heredadas del pipeline `text-generation` de Qwen2.5-0.5B, aunque no se validan en la model card.
- No se documentan tool calling, function calling, agentes, vision, audio ni modo thinking para este checkpoint.

## Casos de uso

- Investigacion sobre atencion eficiente: servir como punto de comparacion reproducible frente a otras variantes del "Qwen Attention Zoo" para medir el coste en perplejidad de sustituir atencion cuadratica por linear attention factorizada.
- Experimentos de destilacion de conocimiento: la telemetria publicada (perplejidad pre y post-KD, pasos, tiempos, VRAM) permite reproducir y ajustar recetas de KD de dos etapas sobre modelos pequenos.
- Benchmarking de operadores de atencion: evaluar `ProjectionFactorizedAttention` frente a atencion estandar en tareas de modelado de lenguaje con WikiText-2 como referencia controlada.
- Prototipado de arquitecturas hibridas: probar patrones de intercalado (aqui `hybrid_3_1`) y medir su impacto en calidad y coste computacional antes de escalar a modelos mayores.
- Docencia y formacion: ejemplo didactico de cirugia de modulos en un transformer y de evaluacion mediante perplejidad, con codigo de carga en dos lineas.
- Validacion de infraestructura NeuralOps: verificar el pipeline de carga (`neuralops.hub`), el registro de atenciones y el adaptador `QwenAttentionAdapter` en entornos de desarrollo.
- Analisis de degradacion por sustitucion de atencion: cuantificar cuanto se degrada un modelo de 0,5 B al reemplazar el 75 % de sus capas de atencion, util para decidir si merece la pena en modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad (post-KD) | `Salesforce/wikitext`, `wikitext-2-raw-v1`, validation | 3099,36 |
| Perplejidad pre-KD (Stage 0) | `wikitext-2-raw-v1` | 1.657.112,85 |
| Delta de perplejidad | `wikitext-2-raw-v1` | -1.654.013,49 |

Telemetria de entrenamiento:

| Etapa | Pasos | Tiempo | Detalle |
|---|---:|---:|---|
| Stage 1 (alineacion con backbone congelado) | 127 | 54,1 s | `lm_head` puenteado; MSE + coseno 0,25 |
| Stage 2 (KD de representaciones multicapa) | 294 | 125,8 s | MSE + coseno 0,50 |
| Total | 421 | 180,2 s | `seq_len=512`, `grad_accum=4`, `topk=64`, VRAM pico 16.847 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint de atencion pesa 76,62 MB; el modelo base Qwen2.5-0.5B en FP16 requiere aproximadamente 1 GB de VRAM, mas overhead de activaciones y KV cache.
- VRAM para entrenamiento/destilacion: 16.847 MB de pico documentados (FP16 autocast con parametros maestros FP32), lo que implica una GPU de 24 GB o superior en la practica.
- GPU recomendadas: para entrenamiento, A100 40 GB, H100 o RTX 4090 (24 GB); para inferencia, cualquier GPU consumer con 4 GB o mas (RTX 3060, RTX 4060, etc.).
- Cabe en GPU consumer: si, tanto para inferencia como, al limite, para la receta de KD documentada en GPUs de 24 GB.
- Opciones de despliegue: la carga oficial es via `neuralops.hub.load_surgeried_model` o mediante `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la naturaleza de pesos parciales (solo atencion) y el operador personalizado hacen poco probable un despliegue directo en esos runners sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` | 0,5 B (18/24 capas linearizadas) | No disponible | 3099,36 (post-KD) | MIT | Pesos de atencion en HF |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens (segun especificacion de Qwen2.5) | No disponible en esta ficha | Apache 2.0 | Modelo completo en HF |
| Otras variantes del Qwen Attention Zoo (NeuralOps) | 0,5 B | No disponible | No disponible | MIT | Pesos de atencion en HF |

La comparacion directa con el modelo base es la mas relevante: este checkpoint no iguala al original (perplejidad de 3099,36 frente a la calidad esperada de un 0,5 B entrenado de forma completa), y su interes es experimental, no de rendimiento absoluto.

## Limitaciones y advertencias

- Perplejidad muy elevada (3099,36) incluso tras destilacion: el modelo no es apto para generacion de texto de calidad en produccion.
- Solo se publican los pesos de atencion (76,62 MB), no el modelo completo; es necesario recomponerlo sobre `Qwen/Qwen2.5-0.5B` con el codigo de NeuralOps.
- Entrenado exclusivamente sobre WikiText-2 en ingles: no hay garantia de comportamiento multilingue ni de generalizacion fuera del dominio.
- No declara soporte RoPE en el modulo de atencion (`supports_rope: N/A`), lo que puede afectar a la extrapolacion de contexto.
- Riesgo alto de alucinacion y de texto incoherente dado el nivel de perplejidad.
- Sesgos: no documentados; hereda los del modelo base y los del corpus WikiText-2.
- Requiere el paquete `neuralops` y el script `qwen_zoo_train_mix` para la carga manual; la API `load_surgeried_model` simplifica el proceso pero anade dependencia de un repositorio de terceros.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario sin un reentrenamiento sustancial.
- No hay soporte documentado para runners de inferencia estandar (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-projection-factorized-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT (NeuralOps): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
