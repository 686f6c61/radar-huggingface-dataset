# tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decoder por el operador `residual_svd_attention` (Spectral Residual Low-Rank SVD Attention, o Res-SVD Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo publica el usuario tahamajs como parte del denominado "NeuralOps Qwen Attention Zoo", una coleccion de variantes de atencion subcuadratica aplicadas sobre modelos Qwen existentes.

El modelo no se entrena desde cero: parte de los pesos de Qwen2.5-0.5B y aplica un patron hibrido `hybrid_3_1`, en el que 18 de las 24 capas usan Res-SVD Attention y 6 capas conservan atencion cuadratica completa como anclas. Posteriormente se ejecuta una destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad de modelado del lenguaje tras la cirugia. El resultado es un checkpoint de investigacion orientado a explorar alternativas de atencion eficiente, no un modelo listo para produccion.

Su relevancia es acotada pero clara: sirve como banco de pruebas reproducible de atencion subcuadratica sobre un transformer pequeno (0,5B parametros), con telemetria detallada de perplexity antes y despues de la destilacion. La perplexity final en WikiText-2 es 328,55, muy superior a la del modelo base, lo que refleja que la sustitucion de atencion degrada sustancialmente la calidad del modelo pese a la recuperacion parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `ResidualSVDAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 51,37 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de query, 2 cabezas KV y `head_dim=64`. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye los modulos de atencion por `ResidualSVDAttention` (operador de atencion espectral basado en SVD de bajo rango con residual) siguiendo el patron `hybrid_3_1`: 18 capas transplantadas y 6 capas cuadraticas preservadas en los indices `[3, 7, 11, 15, 19, 23]`. El adaptador realiza una expansion 14:2 de cabezas GQA y mantiene el contrato de `o_proj` unico. El modulo declara soporte causal, bidireccional y cross-attention, pero no soporte nativo de GQA ni de RoPE.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`: una primera etapa de alineacion con backbone congelado (115 pasos, 54,2 s, MSE y coseno sobre estados ocultos con peso 0,25, `lm_head` omitido) y una segunda etapa de destilacion multi-capa (265 pasos, 126,1 s, MSE y coseno con peso 0,50, `topk=64`). En total, 380 pasos en 180,5 s con `seq_len=512` y `grad_accum=4`, alcanzando un pico de 17.317 MB de VRAM en FP16 con parametros maestros en FP32. La perplexity causal paso de 119.371,82 (post-cirugia, sin destilar) a 328,55 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada de la arquitectura Qwen2.
- Soporte declarado de atencion causal, bidireccional y cross-attention en el modulo `ResidualSVDAttention`.
- Capacidad de servir como banco de pruebas reproducible para evaluar atencion subcuadratica sobre un transformer pequeno.
- Integracion con el ecosistema NeuralOps mediante `apply_qwen_attention_surgery` y `QwenAttentionAdapter`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Investigacion en atencion eficiente: emplear el checkpoint como referencia reproducible para comparar `ResidualSVDAttention` frente a atencion cuadratica estandar en un modelo de 0,5B con telemetria de PPL publicada.
- Experimentacion con cirugia de atencion: usar el patron `hybrid_3_1` y el `QwenAttentionAdapter` como plantilla para transplantar otros operadores del `ATTENTION_REGISTRY` sobre modelos Qwen.
- Docencia y divulgacion: ilustrar el impacto real de sustituir atencion en un transformer pequeno, con datos medibles de PPL pre y post-destilacion.
- Benchmarking de destilacion de conocimiento: comparar la recuperacion de PPL (delta de -119.043,27) frente a otras estrategias de KD sobre el mismo modelo base.
- Pruebas de integracion del stack NeuralOps: validar pipelines de carga de pesos safetensors, aplicacion de cirugia y evaluacion sobre WikiText-2 en entornos de investigacion.
- Estudio de degradacion por sustitucion de atencion: analizar el coste en calidad de modelos de 0,5B al reemplazar 18 de 24 capas por un operador subcuadratico, como paso previo a decidir si merece la pena escalar el enfoque.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 328,55 | No (`verified: false`) |
| WikiText-2 (Stage 0, post-cirugia sin KD) | Perplexity | 119.371,82 | No |
| WikiText-2 (post-KD) | Perplexity | 328,55 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento reporto un pico de 17.317 MB en FP16 con parametros maestros en FP32; para inferencia en FP16 de un modelo de 0,5B se estima en torno a 1-2 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible de forma explicita; el entrenamiento se ejecuto con FP16 autocast, compatible con GPUs consumer modernas.
- Cabe en GPU consumer: si, dado el tamano de 0,5B parametros; no se especifican modelos concretos.
- Opciones de despliegue: la model card solo documenta carga via `transformers` + `safetensors` + `apply_qwen_attention_surgery`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el operador custom probablemente requiera el stack NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2` | 0,5B | no disponible | 328,55 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en la informacion | no disponible | Apache 2.0 (segun modelo base, no confirmado en esta ficha) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de otras variantes del Attention Zoo en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Perplexity muy elevada (328,55) frente a lo esperable en un modelo de 0,5B, lo que indica una degradacion severa de la calidad del lenguaje tras la sustitucion de atencion.
- Los resultados de benchmark estan marcados como `verified: false`: son declaraciones del autor, no verificadas de forma independiente.
- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas de generacion de texto de calidad.
- Solo soporta ingles; no se documentan capacidades multilingues.
- El modulo `ResidualSVDAttention` no soporta GQA nativo ni RoPE, lo que puede limitar la compatibilidad con tooling estandar de Qwen.
- La carga requiere el stack NeuralOps (`apply_qwen_attention_surgery`, `QwenAttentionAdapter`), no disponible en el ecosistema `transformers` estandar.
- Riesgo elevado de alucinacion y generacion incoherente dada la PPL reportada.
- Sin datos publicados sobre sesgos; al derivar de Qwen2.5-0.5B, hereda los sesgos del modelo base y de WikiText-2.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la practica.
- El checkpoint contiene unicamente pesos de atencion (`attention_weights.safetensors`); es necesario descargar el modelo base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-residual-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
