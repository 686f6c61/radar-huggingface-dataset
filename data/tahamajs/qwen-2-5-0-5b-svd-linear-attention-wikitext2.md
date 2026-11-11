# tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por un modulo de atención lineal factorizada via SVD (`SVDLinearAttention`), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs` y el modelo se publica bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una cirugia de atención seguida de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2.

El objetivo del artefacto es servir como banco de pruebas para arquitecturas de atención subcuadratica: reemplaza 18 de las 24 capas de atención del transformer original por atención lineal SVD, manteniendo 6 capas de atención cuadratica completa como anclas (patron `hybrid_3_1`). El modelo resultante conserva la tokenizer y el `lm_head` de Qwen2.5-0.5B, pero solo distribuye los pesos de atención entrenados (76,62 MB en `attention_weights.safetensors`), no el checkpoint completo.

La relevancia es fundamentalmente investigadora: demuestra un flujo de trabajo reproducible para transplantar mecanismos de atención alternativos en modelos preentrenados y medir la recuperacion de perplejidad tras destilacion. El rendimiento final es muy pobre en terminos absolutos (perplejidad de 3158,09 en WikiText-2 frente a valores tipicamente de un digito bajo para el modelo base), por lo que no es apto para uso en produccion ni como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SVDLinearAttention` y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atencion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; no se declara contexto maximo) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB), mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica una "cirugia" que sustituye la atencion en 18 de las 24 capas por `SVDLinearAttention`, un modulo de atencion lineal con factorizacion SVD y gating de decaimiento exponencial opcional. El adaptador `QwenAttentionAdapter` gestiona la expansion 14:2 de cabezas KV (7x) y respeta el contrato de un unico `o_proj`. Se preservan 6 capas de atencion cuadratica como anclas en los indices `[3, 7, 11, 15, 19, 23]`, configurando un patron hibrido `hybrid_3_1`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 1 (alineamiento con backbone congelado) ejecuta 128 pasos en 54,3 s, con `lm_head` desactivado y perdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilacion de representacion multicapa) ejecuta 293 pasos en 125,8 s con peso 0,50. En total, 421 pasos y 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, usando autocast FP16 con parametros maestros FP32 y un pico de VRAM de 16.839 MB. La perplejidad causal paso de 1.207.852,35 (post-cirugia, zero-shot) a 3.158,09 tras la destilacion, lo que evidencia una recuperacion sustancial pero muy lejos de un modelo funcional.

## Capacidades

- Generacion de texto causal autoregresiva (soporte `supports_causal=Yes`).
- Soporte bidireccional declarado en el modulo (`supports_bidirectional=Yes`), aunque el checkpoint se entrena para modelado causal.
- Soporte de cross-attention declarado en el modulo (`supports_cross_attention=Yes`).
- Soporte nativo de GQA (`supports_gqa=Yes`) con expansion 14:2 gestionada por el adaptador.
- Soporte de RoPE marcado como `N/A` en el modulo (`supports_rope=N/A`).
- Capacidad multilingue: solo ingles declarado.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se declara capacidad destacada de razonamiento, codigo o matematicas; el entrenamiento se limita a WikiText-2.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por atencion lineal SVD en un transformer preentrenado, usando la perplejidad de WikiText-2 como metrica de recuperacion.
- Desarrollo y validacion de modulos en NeuralOps: permite probar el `SVDLinearAttention` y el `QwenAttentionAdapter` dentro del `ATTENTION_REGISTRY`, verificando contratos de GQA, `o_proj` unico y patrones hibridos `hybrid_3_1`.
- Benchmark de destilacion de conocimiento: las dos etapas documentadas (alineamiento con backbone congelado y destilacion multicapa) sirven como plantilla para experimentar con otras combinaciones de perdidas, pesos y pasos.
- Estudio de topologias hibridas: los indices de capas ancla `[3, 7, 11, 15, 19, 23]` permiten investigar como varia la perplejidad al cambiar que capas conservan atencion cuadratica.
- Pruebas de pipeline de cirugia de atencion: util para validar `apply_qwen_attention_surgery` y el flujo de carga de pesos parciales con `strict=False` antes de escalar a modelos mayores.
- Docencia y divulgacion: ejemplo didactico de como una cirugia agresiva de atencion degrada la perplejidad en varios ordenes de magnitud y de como la destilacion recupera solo parcialmente el rendimiento.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 3158,09 | No (declarado por el autor) |

Telemetria de entrenamiento (declarada por el autor):

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 1.207.852,35 |
| Post-KD | Perplejidad de validacion | 3158,09 |
| Delta de perplejidad | Reduccion | -1.204.694,26 |
| Stage 1 (alineamiento) | Pasos / tiempo | 128 / 54,3 s |
| Stage 2 (destilacion multicapa) | Pasos / tiempo | 293 / 125,8 s |
| Total | Pasos / tiempo | 421 / 180,4 s |
| Pico de VRAM | FP16 autocast | 16.839 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B ocupa aproximadamente 1 GB en FP16; con la atencion SVD y las capas ancla, el checkpoint completo requiere del orden de 1-2 GB en FP16.
- El entrenamiento reportado uso un pico de 16.839 MB con autocast FP16 y parametros maestros FP32, lo que sugiere una GPU con al menos 24 GB para reproducir el pipeline.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas deberia poder ejecutar inferencia del modelo base en FP16; para reproducir el entrenamiento se necesita una GPU de 24 GB o superior (RTX 3090/4090, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de GPUs con 4 GB o mas para inferencia del modelo base.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La carga requiere `transformers` mas el codigo de NeuralOps (`apply_qwen_attention_surgery`) y `safetensors`. No hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2` | 0,5 B | no disponible | 3158,09 | MIT | Pesos de atencion en HF |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens (segun Qwen2.5) | no disponible en esta ficha | Apache 2.0 (segun Qwen2.5) | Checkpoint completo en HF |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | 0,5 B | no disponible | no disponible | MIT | Pesos de atencion en HF |

La comparacion directa con el modelo base no es posible en terminos de perplejidad porque la informacion proporcionada no incluye el valor de referencia de Qwen2.5-0.5B en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0) y la naturaleza parcial del checkpoint (solo pesos de atencion) son las diferencias practicas mas relevantes.

## Limitaciones y advertencias

- Perplejidad de 3158,09 en WikiText-2: el modelo no es funcional como generador de texto general; la calidad es muy inferior a la del modelo base.
- Solo se distribuyen pesos de atencion (`attention_weights.safetensors`); es necesario cargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con el codigo de NeuralOps antes de cargar los pesos.
- Dependencia de codigo externo (`scripts.benchmarks.qwen_zoo_train_mix`, `apply_qwen_attention_surgery`) no empaquetado en el repo; la reproducibilidad depende de la version de NeuralOps.
- Entrenado unicamente sobre WikiText-2 en ingles; no hay evidencia de capacidad multilingue ni de generalizacion fuera del dominio.
- No se declaran datos de sesgos, alucinacion ni evaluaciones de seguridad; al heredar el modelo base, puede reproducir sesgos presentes en Qwen2.5-0.5B.
- Contexto de entrenamiento de 512 tokens; no se declara contexto maximo soportado en inferencia.
- El modulo declara `supports_rope=N/A`, lo que puede afectar a la extrapolacion de contexto.
- No hay soporte documentado de tool calling, agentes ni modos de razonamiento.
- Uso comercial: la licencia MIT lo permite tecnicamente, pero el rendimiento hace inviable su uso en produccion; ademas, el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse.
- Los resultados de benchmarks no estan verificados (`verified: false`) y proceden del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
