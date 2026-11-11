# tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el operador `PerformerAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El resultado es un modelo de 0,5 mil millones de parametros con atencion subcuadratica basada en FAVOR+ (Fast Attention Via Positive Orthogonal Random Features) en 18 de sus 24 capas, manteniendo 6 capas con atencion cuadratica completa como anclas. Lo publica el usuario tahamajs como parte del "NeuralOps Qwen Attention Zoo", una iniciativa de investigacion sobre operadores de atencion alternativos.

El modelo no es un modelo de proposito general: es un artefacto de investigacion orientado a medir el impacto de la sustitucion de atencion y la recuperacion de calidad mediante destilacion de conocimiento en dos etapas. Tras la cirugia, la perplejidad en WikiText-2 se dispara a 2549,43 y, despues de 336 pasos de destilacion (unos 180 segundos en una sola GPU), se recupera hasta 102,92. Esa recuperacion es el dato central del repositorio y la razon por la que resulta relevante para quien investiga atencion eficiente, no para despliegues en produccion.

La relevancia actual radica en que demuestra un flujo reproducible de "surgery + distillation" sobre un transformer denso pequeno, con pesos publicados en safetensors (124,03 MB) y licencia MIT. No obstante, el checkpoint contiene unicamente los pesos de atencion, no el modelo completo, y requiere el codigo de NeuralOps para reconstruir la topologia hibrida antes de cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con PerformerAttention (FAVOR+) y 6/24 capas con atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; el entrenamiento uso seq_len=512) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 124,03 MB) |
| Cabezas de atencion | 14 query heads, 2 KV heads (GQA), head_dim=64, hidden_size=896 |
| Patron de sustitucion | `hybrid_3_1` (3:1 intercalado) |
| Soporte causal / bidireccional | si / si |
| Soporte cross-attention | si |
| Soporte GQA nativo | si |
| Soporte RoPE en el operador | no aplica (N/A en la implementacion PerformerAttention) |
| Biblioteca | neuralops |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 capas, hidden_size de 896, 14 cabezas de consulta y 2 cabezas KV (GQA con expansion 14:2). Sobre esa base se aplica el `QwenAttentionAdapter`, que mapea las proyecciones `Qwen2Attention` al operador `PerformerAttention` con expansion automatica de cabezas KV cuando es necesario y un contrato de bypass con una unica `o_proj`. La sustitucion sigue el patron `hybrid_3_1`: 18 de las 24 capas se reemplazan por atencion Performer y 6 se conservan con atencion cuadratica completa como anclas en los indices [3, 7, 11, 15, 19, 23]. PerformerAttention implementa FAVOR+ (Fast Attention Via Positive Orthogonal Random Features), una aproximacion al kernel softmax que reduce el coste de O(n^2) a O(n) en la longitud de secuencia.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 es el estado post-cirugia sin entrenamiento, con perplejidad causal de 2549,43. La etapa 1 (alineamiento con backbone congelado) ejecuta 102 pasos en 54,4 segundos con `lm_head` desactivado y perdida MSE + coseno sobre estados ocultos por capa (peso 0,25). La etapa 2 (destilacion de representacion multicapa) ejecuta 234 pasos en 125,5 segundos con la misma perdida pero peso 0,50. En total, 336 pasos de optimizacion en 180,3 segundos con seq_len=512, grad_accum=4 y topk=64, alcanzando 13.892 MB de VRAM pico en FP16 autocast con parametros maestros FP32. La perplejidad final es 102,92, una mejora de -2446,51 respecto al estado post-cirugia.

## Capacidades

- Generacion de texto autoregresiva causal (pipeline `text-generation`).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de operador.
- Soporte nativo de GQA con expansion automatica de cabezas KV.
- Capacidad de procesar secuencias largas con coste lineal gracias a FAVOR+ (aunque el entrenamiento se hizo con seq_len=512).
- Razonamiento basico y generacion de codigo heredados del modelo base Qwen2.5-0.5B, aunque degradados por la sustitucion de atencion y el ajuste limitado a WikiText-2.
- Capacidades multilingues limitadas: la model card declara solo ingles.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion en atencion subcuadratica: el modelo sirve como banco de pruebas reproducible para medir el coste y la recuperacion de calidad al sustituir atencion cuadratica por Performer en un transformer denso pequeno, con telemetria completa de perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: las dos etapas documentadas (alineamiento con backbone congelado y destilacion de representacion multicapa) permiten replicar y comparar estrategias de recuperacion de calidad tras una cirugia de atencion.
- Validacion de operadores en el registro NeuralOps: util para verificar que el `QwenAttentionAdapter` y el contrato de Single-`o_proj` funcionan correctamente sobre Qwen2.5-0.5B antes de escalar a modelos mayores.
- Estudio de topologias hibridas: el patron `hybrid_3_1` con anclas cuadraticas permite comparar configuraciones alternativas (por ejemplo, 2:1 o 4:1) y medir el impacto en perplejidad.
- Prototipado de inferencia eficiente en entornos con VRAM limitada: al ser un modelo de 0,5 B y 124 MB de pesos de atencion, cabe en GPUs de consumo para pruebas de latencia y throughput con secuencias largas.
- Docencia y divulgacion: ejemplo didactico de como se aplica FAVOR+ a un modelo real y de como se mide la degradacion y recuperacion mediante perplejidad en WikiText-2.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad causal (Stage 0, post-cirugia) | wikitext-2-raw-v1 / validation | 2549,43 |
| Perplejidad causal (post-destilacion) | wikitext-2-raw-v1 / validation | 102,92 |
| Delta de perplejidad | wikitext-2-raw-v1 / validation | -2446,51 |

Telemetria de entrenamiento:

| Etapa | Pasos | Tiempo | Perdida |
|---|---|---|---|
| Stage 1 (frozen-backbone alignment) | 102 | 54,4 s | MSE + coseno (0,25) |
| Stage 2 (multi-layer representation KD) | 234 | 125,5 s | MSE + coseno (0,50) |
| Total | 336 | 180,3 s | - |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 13.892 MB pico en FP16 con parametros maestros FP32. Para inferencia en FP16 de un modelo de 0,5 B se puede estimar en torno a 1-2 GB, aunque no se confirma en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el entrenamiento se realizo en una sola GPU con 14 GB (clase RTX 3090/4090 o superior).
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el dato no esta confirmado.
- Opciones de despliegue: el modelo requiere el codigo de NeuralOps (`apply_qwen_attention_surgery` con `attn_key="performer_attention"` y `pattern="hybrid_3_1"`) para reconstruir la topologia antes de cargar los pesos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2 | 0,5 B | no disponible | 102,92 (declarada) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens (segun Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos Performer originales (Google) | variable | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con el modelo base Qwen2.5-0.5B en perplejidad WikiText-2 no esta disponible en la informacion proporcionada, por lo que no se puede cuantificar la perdida respecto al original. Tampoco se dispone de datos de otros modelos con atencion subcuadratica comparables en el mismo tamano y dataset.

## Limitaciones y advertencias

- El checkpoint contiene unicamente los pesos de atencion (`attention_weights.safetensors`), no el modelo completo; es necesario descargar Qwen2.5-0.5B y aplicar la cirugia con el codigo de NeuralOps para poder usarlo.
- La perplejidad de 102,92 es notablemente alta para WikiText-2 en un modelo de 0,5 B; el modelo base sin cirugia probablemente obtiene valores muy inferiores, aunque no se dispone del dato. La calidad de generacion esta degradada respecto al original.
- El ajuste se limita a WikiText-2 con seq_len=512; no hay evidencia de generalizacion a otras tareas, dominios o longitudes de contexto mayores.
- Solo se declara soporte de ingles; el rendimiento multilingue no esta evaluado.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen2.5-0.5B, no caracterizados en esta ficha.
- No se documenta soporte de tool calling, function calling ni de agentes, por lo que no es adecuado para pipelines de produccion que dependan de estas capacidades.
- La licencia es MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse en la distribucion combinada.
- Es un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de los resultados.
- No se documenta compatibilidad con frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI), lo que limita su uso fuera del ecosistema NeuralOps.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-performer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
