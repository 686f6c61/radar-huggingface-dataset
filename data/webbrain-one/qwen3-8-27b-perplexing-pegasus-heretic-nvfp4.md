# webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4

## Resumen
Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4 es una cuantizacion de precision mixta NVFP4 + FP8 del checkpoint webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic, un derivado "abliterated" (sin censura, tecnica ARA/Heretic) del modelo AveLabs/Qwen3.8-27B-Perplexing-Pegasus. Este ultimo fusiona las decisiones tipadas de perplexity-ai/pplx-decider-v1-27b con el chat, el modo thinking, la vision multimodal, el tool calling y la prediccion multi-token (MTP) de Qwen/Qwen3.8-27B. El resultado es un modelo multimodal image-text-to-text que conserva el comportamiento estructurado de decisiones de pplx-decider y elimina los rechazos del modelo original.

La relevancia de esta release es doble. Por un lado, demuestra una receta de cuantizacion para hardware NVIDIA Blackwell (sm_100/sm_120) usando llm-compressor de vLLM con AWQ+GPTQ: las capas MLP 0-55 se comprimen a NVFP4 (W4A4 con micro-escalado por grupo de 16), la atencion y los ultimos 8 bloques MLP se mantienen en FP8 dinamico, y la KV cache en FP8. Por otro, preserva en BF16 el lm_head, la torre visual, las proyecciones de atencion lineal y los 15 tensores MTP, de modo que la decodificacion especulativa y la lectura de decisiones siguen funcionando intactas.

El checkpoint declara 20.294.595.344 parametros reales en safetensors (pese al "27B" del nombre), un repositorio de 24,7 GB y ventana de contexto configurable hasta 131.072 tokens segun el ejemplo de servicio con vLLM. La licencia es Apache 2.0 y el unico idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal, vision multimodal y cabezales MTP (tag qwen3_5) |
| Parametros totales | 20.294.595.344 (segun safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | hasta 131.072 tokens (valor usado en el comando de servicio vLLM; no se documenta el maximo nativo) |
| Tipos de cuantizacion | NVFP4 W4A4 en MLP 0-55; FP8 dinamico en atencion y MLP 56-63; KV cache FP8 static_minmax; BF16 en lm_head, vision, in_proj_a/b y MTP |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (llm-compressor) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen/Qwen3.8-27B: un transformer con atencion completa combinada con atencion lineal (los tensores linear_attn.in_proj_qkv, in_proj_z y out_proj aparecen explicitamente en la receta de cuantizacion), torre visual para entrada image-text-to-text y cabezales de Multi-Token Prediction. Sobre esa base, AveLabs/Qwen3.8-27B-Perplexing-Pegasus incorpora el comportamiento de pplx-decider-v1-27b: un mecanismo de "decisiones tipadas" que expone logprobs de un solo token sobre un conjunto de codigos definidos en decision/decision_config.json, util para clasificacion estructurada y evaluacion de afirmaciones. El paso a Heretic aplica una ablacion ARA (abliteration) para eliminar los comportamientos de rechazo, con una divergencia KL reportada de 0,0618 frente al modelo base y una reduccion de rechazos del clasificador de 102/104 a 6/104.

La cuantizacion se realizo con vllm-project/llm-compressor usando la receta Blackwell AWQ + GPTQ, calibrada con perfectblend train[:512] a 4096 tokens. Las capas MLP 0-55 usan NVFP4 con micro-escalado por grupo de 16; la atencion (incluida la lineal) y los bloques MLP 56-63 usan FP8 dinamico; la KV cache usa FP8 static_minmax. Se preservan sin cuantizar el lm_head (para no degradar la lectura de decisiones), la torre visual, in_proj_a/b de atencion lineal y los 15 tensores mtp.* junto con los metadatos de decision. No se detalla en la informacion disponible el volumen de tokens de preentrenamiento, la composicion del dataset ni si hubo RLHF o DPO en las etapas originales.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Modo thinking con etiquetas `<think>` y parser de razonamiento qwen3 en vLLM.
- Vision multimodal: pipeline image-text-to-text con torre visual preservada en BF16.
- Tool calling / function calling, con parser qwen3_coder y auto tool choice en vLLM.
- Prediccion multi-token (MTP) para decodificacion especulativa con num_speculative_tokens configurable.
- Decisiones tipadas: lectura de logprobs de un solo token sobre codigos definidos en decision_config.json, con temperatura configurable.
- Capacidades de agente y razonamiento multi-paso derivadas del modelo base Qwen3.8-27B.
- Modelo "uncensored"/abliterated: 0/8 sondas de rechazo rechazadas con enable_thinking=False.

## Casos de uso
- Clasificacion estructurada y evaluacion de afirmaciones: usando el readout de decisiones tipadas con enable_thinking=False, se obtienen distribuciones de probabilidad sobre codigos discretos en un solo paso, lo que permite construir verificadores de hechos o enrutadores de contenido con latencia minima.
- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto de hasta 131.072 tokens, suficiente para arrastrar historiales largos o documentacion de producto sin truncar.
- Agentes con herramientas en produccion: con --enable-auto-tool-choice y el parser qwen3_coder, se puede integrar en orquestadores que encadenan llamadas a APIs, busquedas o ejecucion de codigo.
- Procesamiento de documentos con imagenes: al conservar la torre visual en BF16, es adecuado para extraer informacion de capturas, formularios o diagramas combinados con texto.
- Despliegue de alto rendimiento en Blackwell: la combinacion NVFP4 + FP8 + MTP esta pensada para servir en RTX PRO 6000 Blackwell, RTX 5090, B200 o GB200 con vLLM, reduciendo el coste por token frente al BF16.
- Investigacion sobre alineacion y censura: al ser un modelo abliterated con metricas de rechazo documentadas, sirve para estudiar el efecto de la ablacion en la utilidad y en la tasa de rechazos.
- Generacion de contenido sin filtros en entornos controlados: util para redaccion creativa o escenarios de simulacion donde los rechazos del modelo base resultan obstructivos.

## Benchmarks y rendimiento
La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Solo se documentan metricas de verificacion propias:

| Metrica | Resultado medido |
|---|---|
| Sondas de rechazo rechazadas (enable_thinking=False) | 0 / 8 |
| Acuerdo de decisiones tipadas vs Pegasus original (30 sondas) | 100,0 % |
| TVD media de decisiones vs Pegasus original | 0,06123 |
| TVD maxima de decisiones vs Pegasus original | 0,28388 |
| Divergencia KL de Heretic Trial 7 ARA | 0,0618 |
| Rechazos del clasificador | 6 / 104 (base: 102 / 104) |

No se han publicado resultados de benchmarks de conocimiento o razonamiento en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el checkpoint pesa 22,99 GB en safetensors, por lo que la inferencia requiere al menos unos 24 GB de VRAM para pesos, mas overhead de KV cache FP8 y activaciones.
- Hardware objetivo declarado: NVIDIA Blackwell sm_100/sm_120, es decir, RTX PRO 6000 Blackwell, RTX 5090, B200 y GB200.
- No es compatible con GPUs anteriores a Blackwell para el camino NVFP4 nativo; para esas plataformas el autor publica variantes AutoRound INT4 W4A16 y GGUF.
- Despliegue: vLLM con compressed-tensors (receta oficial de la model card), con soporte de MTP especulativo, parser de razonamiento qwen3 y parser de herramientas qwen3_coder.
- Alternativas de despliegue para otros entornos: llama.cpp, LM Studio u Ollama mediante la variante GGUF con mmproj F16; AutoRound INT4 para Intel Arc Pro B70 (32 GB XPU) y GPUs CUDA.
- Latencia y throughput: no disponibles en la informacion proporcionada; el uso de MTP con 3 tokens especulativos sugiere una mejora de decodificacion, pero no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4 | 20,29 B | hasta 131.072 (config vLLM) | NVFP4 + FP8 (compressed-tensors) | Apache 2.0 | Solo Blackwell, MTP y decisiones tipadas |
| webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic (BF16) | 20,29 B | no disponible | safetensors BF16 | Apache 2.0 | Referencia sin cuantizar, H100/B200/RTX PRO 6000 |
| webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4 | 20,29 B | no disponible | AutoRound W4A16 INT4 | Apache 2.0 | Compatible con Intel Arc Pro B70 y CUDA |
| webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF | 20,29 B | no disponible | GGUF Q8_0 a IQ3_XXS + mmproj F16 | Apache 2.0 | llama.cpp, LM Studio, Ollama, offload a CPU |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido que el modelo base bloquearia; requiere filtros y politicas de uso externas en produccion.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- La cuantizacion NVFP4 en MLP puede degradar ligeramente la calidad frente al BF16; la model card solo verifica el acuerdo de decisiones tipadas, no tareas generativas generales.
- Dependencia de hardware Blackwell para el camino NVFP4 nativo; en GPUs anteriores hay que usar las variantes INT4 o GGUF.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por el modo thinking y por la ausencia de benchmarks de razonamiento publicados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido generado sin censura.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- El nombre comercial "27B" no coincide con los 20,29 B reales de parametros; conviene dimensionar el hardware con la cifra real.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4
- Modelo base Heretic en BF16: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Variante AutoRound INT4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4
- Variante GGUF: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Modelo intermedio: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus
- Decisor tipado original: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo Qwen de origen: https://huggingface.co/Qwen/Qwen3.8-27B
