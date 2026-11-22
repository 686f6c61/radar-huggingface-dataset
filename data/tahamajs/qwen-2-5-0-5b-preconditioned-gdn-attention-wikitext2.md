# tahamajs/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2` es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente los bloques de atención del decoder por un módulo propio denominado `PreconditionedGDNAttention`, una variante de Gated DeltaNet con precondicionamiento de curvatura (covarianza empírica y curvatura diagonal). El modelo forma parte del denominado "NeuralOps Qwen Attention Zoo", una iniciativa que publica variantes de atención subcuadrática aplicadas sobre arquitecturas conocidas para facilitar su evaluación comparativa.

El checkpoint no es un modelo de propósito general: se trata de un artefacto de investigación que contiene únicamente los pesos de atención modificados (`attention_weights.safetensors`, 132,36 MB) y debe combinarse con el modelo base Qwen2.5-0.5B y el código de NeuralOps para poder ejecutarse. El ajuste se ha realizado sobre WikiText-2 (`Salesforce/wikitext`, split de validación) mediante un proceso de destilación de conocimiento en dos etapas.

Su relevancia es fundamentalmente metodológica: demuestra el flujo de trabajo de "cirugía de atención" sobre un transformer estándar y publica telemetría detallada del proceso. Sin embargo, la perplejidad de validación reportada (64.264,64) es varios órdenes de magnitud superior a la del modelo base, lo que indica que el checkpoint, tal como se publica, no es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención sustituida por `PreconditionedGDNAttention` (Gated DeltaNet precondicionado) en patrón híbrido 3:1 |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens; el checkpoint no documenta cambios) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 132,36 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: 18 de las 24 capas se reemplazan por `PreconditionedGDNAttention` y 6 capas cuadráticas completas se conservan como anclas en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` gestiona la proyección de las cabezas (expansión 7x de KV donde es necesario) y aplica un contrato de `o_proj` único. El módulo implementa un Gated DeltaNet con precondicionamiento: `P_t = (diag(s_t) + lambda * I)^{-1/2}`, `k_tilde_t = P_t @ k_t`, y una actualización de estado `S_t = alpha_t * S_{t-1}(I - beta_t * k_tilde_t k_tilde_t^T) + beta_t * k_tilde_t v_t^T`.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 con `seq_len=512`, `grad_accum=4` y `topk=64`. La etapa 1 (alineación con backbone congelado) ejecuta 2 pasos en 60,4 s con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilación multi-capa de representaciones) ejecuta 4 pasos en 120,3 s con peso 0,50. El total son 6 pasos de optimización en 181,0 s con un pico de VRAM de 12.358 MB en FP16 con autocast y parámetros maestros en FP32. El delta de perplejidad reportado es +0,00, es decir, la destilación no mejoró la perplejidad respecto al estado post-cirugía.

## Capacidades

- Generación de texto autoregresiva causal (soporte `supports_causal` confirmado).
- Soporte bidireccional (`supports_bidirectional`) y de atención cruzada (`supports_cross_attention`) a nivel de módulo.
- Soporte nativo de GQA (`supports_gqa`).
- Operador de atención personalizado (`is_custom_attention`), lo que implica dependencia de kernels específicos de NeuralOps.
- Soporte de RoPE: no disponible / no aplicable en el módulo.
- Capacidades multilingües: limitadas a inglés según la model card.
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados ni verificables en el checkpoint.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: servir como referencia reproducible para comparar `PreconditionedGDNAttention` frente a atención cuadrática estándar en tareas de modelado de lenguaje, usando la telemetría publicada como línea base.
- Estudio de técnicas de cirugía de atención: el patrón `hybrid_3_1` y el `QwenAttentionAdapter` son un ejemplo documentado de cómo sustituir bloques de atención en un transformer existente conservando un subconjunto de capas cuadráticas como anclas.
- Reproducción de destilación de conocimiento en dos etapas: los scripts y métricas (6 pasos, 181 s, 12,3 GB de VRAM) permiten replicar el pipeline en hardware de gama alta consumer.
- Benchmarking de kernels personalizados: útil para medir el rendimiento real del operador `PreconditionedGDNAttention` frente a implementaciones estándar de PyTorch o FlashAttention en GPUs concretas.
- Docencia y formación técnica: ejemplo didáctico de arquitecturas híbridas (lineal + cuadrática) y de contratos de adaptación entre módulos de atención.
- Desarrollo de la librería NeuralOps: validación de la API `neuralops.hub.load_surgeried_model` y del registro `ATTENTION_REGISTRY` en un caso real publicado.

No se recomienda su uso en aplicaciones de producción orientadas a usuario final: la perplejidad reportada (64.264,64) indica una calidad de generación muy degradada.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 64.264,64 | No (declarado por el autor) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El único dato de rendimiento es la perplejidad de validación en WikiText-2, idéntica antes y después de la destilación (delta +0,00).

## Requisitos de hardware

- VRAM estimada para inferencia: el módulo de atención ocupa 132,36 MB en safetensors; el modelo completo en FP16 requiere aproximadamente 1 GB de VRAM (0,5B parámetros × 2 bytes), más overhead de activaciones y kernels.
- VRAM de entrenamiento observada: 12.358 MB de pico en FP16 autocast con parámetros maestros FP32 durante la destilación (6 pasos, `seq_len=512`).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para reproducir el entrenamiento se necesitan al menos 16 GB (el autor reporta 12,3 GB de pico).
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070, RTX 4090 y superiores.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model` y el flujo manual con `transformers` + `safetensors` + `apply_qwen_attention_surgery`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la dependencia de un operador de atención personalizado hace improbable el soporte directo en estos frameworks sin portar el kernel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2` | 0,5B | no disponible | PPL WikiText-2: 64.264,64 | MIT | Hugging Face (pesos de atención únicamente) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens | PPL WikiText-2 muy inferior (no reportada en la información disponible) | Apache 2.0 (según el modelo base; no confirmado en la información proporcionada) | Hugging Face |
| Otros checkpoints del NeuralOps Qwen Attention Zoo | 0,5B | no disponible | no disponible | MIT | Hugging Face |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de Qwen2.5-0.5B en WikiText-2. No se dispone de información sobre otras variantes del Attention Zoo más allá de su existencia.

## Limitaciones y advertencias

- Calidad de generación muy degradada: la perplejidad de validación de 64.264,64 es varios órdenes de magnitud superior a la esperable en un modelo de 0,5B, lo que sugiere que el checkpoint no es funcional para generación de texto de calidad.
- La destilación no mejoró la perplejidad (delta +0,00): las dos etapas de KD no revirtieron el daño causado por la cirugía de atención.
- Solo se publican los pesos de atención (132,36 MB); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar el código de NeuralOps para reconstruir el modelo completo.
- Dependencia de un operador de atención personalizado (`is_custom_attention`): no es portable a frameworks estándar sin reimplementar el kernel.
- Idiomas: solo inglés según la model card.
- No hay información sobre sesgos, alucinación, seguridad o evaluaciones de robustez.
- Uso comercial: la licencia MIT lo permite, pero la calidad del checkpoint lo hace inadecuado para producción.
- Entrenamiento muy corto (6 pasos de optimización, 181 s): no constituye un ajuste representativo y los resultados no deben extrapolarse.
- El nombre del repositorio y la model card indican que es un artefacto de investigación, no un modelo listo para uso.
- No se documentan limitaciones de contexto específicas del checkpoint, pero el módulo `PreconditionedGDNAttention` no soporta RoPE de forma nativa, lo que puede afectar la extrapolación de longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
