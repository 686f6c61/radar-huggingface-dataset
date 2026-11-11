# tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2` es un checkpoint experimental de investigación publicado por el usuario tahamajs dentro del proyecto NeuralOps "Attention Zoo". No es un modelo nuevo entrenado desde cero, sino una intervención quirúrgica sobre `Qwen/Qwen2.5-0.5B`: se sustituyen 18 de las 24 capas de atención del decoder original por un módulo propio llamado `SinkAttention`, que implementa una atención de estilo StreamingLLM con tokens sumidero (sink tokens) y caché KV rodante. Las 6 capas restantes conservan la atención cuadrática completa como anclas.

El objetivo del artefacto es doble: por un lado, demostrar que es posible aplicar atención subcuadrática a un transformer preentrenado sin reentrenar desde cero, recuperando calidad mediante destilación de conocimiento en dos etapas; por otro, servir como banco de pruebas reproducible para comparar variantes de atención dentro de NeuralOps. El modelo se ajusta exclusivamente sobre WikiText-2 en inglés y su métrica declarada es la perplejidad de validación (49,65), no capacidades generativas generales.

Es relevante ahora porque los mecanismos de atención eficiente (sliding window, sink tokens, atención lineal) están en el centro del debate sobre contextos largos y coste de inferencia, y este checkpoint ofrece una implementación concreta y medible de una de esas variantes sobre una base pequeña (0,5B parámetros) y con licencia MIT. No obstante, debe tratarse como un experimento de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SinkAttention` (StreamingLLM-style, sink tokens + KV-cache rodante) y 6/24 capas con atencion cuadratica completa en los indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atencion, 161,50 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento de destilacion uso `seq_len=512` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 161,50 MB) + `config.json` + `tokenizer.json`; requiere cargar la base Qwen2.5-0.5B y aplicar la cirugia de atencion antes de cargar los pesos |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas de decoder, `hidden_size=896`, 14 cabezas de query, 2 cabezas KV (GQA 14:2), `head_dim=64`. Sobre esa base se aplica un patron de cirugia `hybrid_3_1`: se reemplazan 18 capas con `SinkAttention` mediante `QwenAttentionAdapter` (que expande las cabezas KV 7x cuando es necesario y mantiene el contrato de `o_proj` unico) y se preservan 6 capas cuadraticas completas como anclas en los indices [3, 7, 11, 15, 19, 23]. El modulo `SinkAttention` usa la secuencia completa de hidden states para Q, acumula K/V en caché y poda a `[primeros num_sink_tokens] ++ [ultimos window_size - num_sink_tokens]`, preservando posiciones absolutas para el enmascaramiento causal. Soporta modo causal, bidireccional, cross-attention, GQA nativo y RoPE.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin ajuste) arroja una perplejidad causal de 618,03, lo que evidencia el dano inicial de la sustitucion. La etapa 1 (alineacion con backbone congelado, 163 pasos, 54,3 s) usa MSE y coseno a nivel de capa con `lm_head` eludido y peso 0,25. La etapa 2 (destilacion de representacion multicapa, 376 pasos, 125,8 s) usa MSE y coseno con peso 0,50. En total, 539 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 11.490 MB de VRAM pico en FP16 con parametros maestros FP32. La perplejidad final es 49,65 (delta -568,39).

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada de la base Qwen2.5-0.5B y modulada por la atencion hibrida.
- Modelado de lenguaje con perplejidad medida en WikiText-2 (validacion): 49,65.
- Soporte de atencion causal y bidireccional en el modulo `SinkAttention`, lo que abre la puerta a usos tipo encoder en experimentos.
- Soporte nativo de GQA y RoPE, compatible con la configuracion original de Qwen2.
- Caché KV rodante con sink tokens, pensada para inferencia con ventanas acotadas.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes, vision, audio ni thinking mode.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Investigacion en atencion eficiente: banco de pruebas reproducible para medir el impacto de sustituir atencion cuadratica por `SinkAttention` en un transformer preentrenado, comparando perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: el pipeline de dos etapas (alineacion con backbone congelado + destilacion de representacion multicapa) sirve como receta para adaptar otros modelos pequenos a modulos de atencion alternativos.
- Evaluacion de estrategias de poda de caché KV: el checkpoint permite estudiar como afectan `num_sink_tokens` y `window_size` a la calidad en tareas de modelado de lenguaje.
- Prototipado academico de contextos largos: la combinacion de sink tokens y ventana rodante es un punto de partida para investigar degradacion con secuencias largas, aunque el modelo solo se entreno con `seq_len=512`.
- Docencia y divulgacion: ejemplo concreto y ligero (0,5B, 161,50 MB de pesos de atencion) para explicar atención subcuadrática, GQA y cirugia de modelos en cursos o talleres.
- Base para ablaciones controladas: al preservar 6 capas cuadraticas como anclas, permite aislar el efecto de la atencion eficiente capa a capa en estudios comparativos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (model-index); no verificados de forma independiente (`verified: false`).

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 49,65 |

Telemetria interna del proceso de destilacion:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 618,03 |
| Stage 1 (alineacion, backbone congelado) | Pasos / tiempo | 163 / 54,3 s |
| Stage 2 (destilacion multicapa) | Pasos / tiempo | 376 / 125,8 s |
| Total | Pasos / tiempo | 539 / 180,3 s |
| Pico de VRAM | FP16 autocast + FP32 master | 11.490 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento de destilacion uso 11.490 MB pico, pero la inferencia del modelo de 0,5B en FP16 deberia caber holgadamente en GPUs consumer.
- GPU recomendadas: no especificadas por el autor. Por tamano (0,5B), cualquier GPU con al menos 2-4 GB de VRAM libre deberia poder ejecutarlo en FP16; una RTX 3060/4060 o superior es suficiente en la practica.
- Cabe en GPU consumer: si, por tamano del modelo base (0,5B), aunque la informacion proporcionada no lo confirma con mediciones.
- Opciones de despliegue: la libreria declarada es `neuralops`, con carga manual via `transformers` + `safetensors` + `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Perplejidad WikiText-2 | Disponibilidad |
|---|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2` | 0,5B | no disponible | Hibrida 18/24 `SinkAttention` + 6/24 cuadratica | MIT | 49,65 (declarada, no verificada) | Hugging Face, 0 descargas |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun ficha publica de Qwen2.5) | Cuadratica completa con GQA y RoPE | Apache 2.0 | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Otros checkpoints del NeuralOps Attention Zoo | ~0,5B | no disponible | Variantes de atencion subcuadratica | MIT | no disponible | Hugging Face |

La comparativa directa con la base Qwen2.5-0.5B en WikiText-2 no esta disponible en la informacion proporcionada; el autor solo reporta la perplejidad del checkpoint destilado y su baseline post-cirugia (618,03). No se dispone de datos de alternativas como Mamba, RWKV o variantes de atencion lineal sobre el mismo benchmark en esta ficha.

## Limitaciones y advertencias

- Modelo experimental de investigacion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Entrenado unicamente sobre WikiText-2 en ingles y con `seq_len=512`; no se debe asumir buen rendimiento en otros dominios, idiomas o secuencias mas largas.
- La perplejidad declarada (49,65) no esta verificada de forma independiente (`verified: false`).
- La carga requiere aplicar la cirugia de atencion (`apply_qwen_attention_surgery`) antes de cargar los pesos; no es un checkpoint plug-and-play con `AutoModelForCausalLM.from_pretrained` directo.
- Solo se publican pesos de atencion (161,50 MB); el resto del modelo debe descargarse de la base Qwen2.5-0.5B.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion proporcionada; al ser un modelo pequeno y ajustado solo con destilacion sobre WikiText-2, es esperable una calidad generativa limitada.
- Capacidades de tool calling, agentes y multilingue no documentadas ni verificadas.
- Licencia MIT permite uso comercial, pero la base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 segun la ficha publica de Qwen); conviene revisar la compatibilidad antes de un uso comercial.
- La ventana efectiva de atencion depende de `num_sink_tokens` y `window_size`, valores no publicados en la informacion disponible; el comportamiento con secuencias largas no esta caracterizado.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
