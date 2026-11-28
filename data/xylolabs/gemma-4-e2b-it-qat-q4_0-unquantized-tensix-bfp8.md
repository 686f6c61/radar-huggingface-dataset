# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP8

## Resumen

Este repositorio contiene una versión cuantizada del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized`, adaptada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). La cuantización la ha realizado Xylolabs mediante GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8), un formato nativo de TT-Metal/TTNN. El resultado es un checkpoint de 7,536 GB empaquetado para Tensix, frente a los 9,26 GB del modelo base en bf16.

El modelo subyacente es un Gemma 4 de la familia E2B, con 5.506.950.723 parámetros totales según los safetensors del repositorio, capacidades multimodales (pipeline `any-to-any`, con torres de visión y audio en bf16 sin cuantizar) y una licencia Apache 2.0. La relevancia de esta ficha radica en que es una de las primeras publicaciones que lleva un Gemma 4 multimodal al ecosistema Tenstorrent con un esquema de cuantización de precisión mixta verificado tensor a tensor.

La motivación técnica es doble: por un lado, reducir la huella de memoria para que el modelo quepa en dispositivos Tensix con DRAM limitada; por otro, preservar la fidelidad respecto al bf16 mucho mejor que una cuantización Q4_0 convencional, con un KL medio de 0,00154 frente al 0,04435 de Q4_0 según la evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, familia E2B) con torres de visión y audio; proyecciones attention y MLP cuantizadas a BFP8 |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones q, o (35 capas), k, v (15 capas) y MLP gate, up, down (35 capas); bf16 en LM head, embedding, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`; existe variante BFP4 para MLP |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 11,0 GB; 7,536 GB empaquetados para Tensix) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 E2B instruction-tuned, presumiblemente entrenado por Google con cuantización aware training (QAT) a Q4_0, tal como indica el nombre del checkpoint original. La arquitectura es un transformer multimodal con torres separadas de visión y audio que se mantienen en bf16 en esta versión. La model card detalla que las proyecciones de atención q y o se cuantizan en 35 capas, mientras que k y v lo hacen en 15 capas, y que las tres proyecciones MLP (gate, up, down) se cuantizan en las 35 capas.

La innovación principal de este repositorio no está en el entrenamiento sino en el post-procesado: Xylolabs aplica GPTQ directamente sobre la rejilla de coma flotante por bloques `bfloat8_b`, un formato que TT-Metal/TTNN implementa de forma nativa en hardware Tensix. El pipeline (`tensix-bfp-gptq`, commit `5c52065`) incluye herramientas de empaquetado (`pack_tensix.py`) y verificación (`verify_grid.py`) que comprueban el round-trip tensor a tensor, opcionalmente pasando por DRAM del dispositivo. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), tal como muestra el ejemplo de quickstart.
- Procesamiento multimodal any-to-any: el pipeline declarado es `any-to-any` e incluye torres de visión y audio, aunque esta versión las mantiene en bf16 sin cuantizar.
- Inferencia sobre hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante TTNN y el runner `tensix-runner`.
- Ejecución estándar en Transformers con `AutoModelForCausalLM` y `dtype="bfloat16"` sobre GPU/CPU convencional.
- Capacidades multilingües: la evaluación cubre inglés y coreano, aunque no se publica la lista completa de idiomas.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para que las proyecciones attention y MLP se carguen directamente como tensores `bfloat8_b` en DRAM del dispositivo, reduciendo la huella frente a bf16 en aproximadamente un 19 % (7,536 GB frente a 9,26 GB).
- Servicio de chat multimodal en entornos con memoria limitada: al mantener las torres de visión y audio en bf16 pero comprimir el backbone lingüístico, se puede servir un modelo any-to-any en dispositivos Tensix de gama media sin recurrir a la variante BFP4, que degrada más la precisión.
- Evaluación de fidelidad de cuantización: el repositorio incluye `verify_grid.py` y `pack_tensix.py`, útiles para validar pipelines de cuantización GPTQ sobre rejillas de coma flotante por bloques en proyectos de investigación.
- Prototipado en Transformers antes de portar a Tensix: el quickstart con `AutoModelForCausalLM` permite validar prompts y comportamiento del modelo en GPU estándar antes de empaquetar los pesos para el NPU.
- Investigación sobre cuantización de precisión mixta: la separación entre capas cuantizadas (q, o en 35 capas; k, v en 15) y capas en bf16 (normas, embeddings, LM head) sirve como caso de estudio reproducible de qué componentes toleran BFP8 sin pérdida significativa.
- Benchmarking de KL y top-1 frente a Q4_0: el conjunto de evaluación sobre WikiText-2 y Wikipedia en coreano (7.968 posiciones) permite comparar esquemas de cuantización con una metodología publicada y un hash de referencia para el checkpoint Q4_0.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E2B-it-qat-q4_0-unquantized) | 9,26 | 0 | 100 |
| Este modelo (BFP8) | 7,536 | 0,00154 | 98,23 |
| Q4_0 (llama.cpp v0.9.0, sin importance matrix) | 3,350 | 0,04435 | 89,47 |

La evaluación cubre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. El checkpoint Q4_0 de referencia tiene sha256 `7976063c67c363ed292081c862051cd7b1f7caf529d972e42aa2e2fe098fd63e`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 11 GB de pesos (9,26 GB del base más overhead), más caché KV; el repo completo ocupa 11,0 GB.
- VRAM estimada con el empaquetado BFP8 para Tensix: 7,536 GB de pesos.
- GPU recomendadas para ejecución en Transformers: no especificadas; el ejemplo usa `device_map="auto"`, por lo que se requiere una GPU con al menos ~12 GB para bf16 (por ejemplo, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16; la variante BFP4 reduce aún más los requisitos.
- Opciones de despliegue: Transformers (safetensors), TTNN/TT-Metal sobre Tensix (Wormhole, Blackhole), `tensix-runner` v0.1.0; no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 5.506.950.723 | no disponible | Apache 2.0 | safetensors BFP8, Tensix | KL 0,00154; 7,536 GB |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (bf16) | 5.506.950.723 | no disponible | Apache 2.0 | safetensors bf16 | Referencia de fidelidad; 9,26 GB |
| Q4_0 llama.cpp del mismo checkpoint | 5.506.950.723 | no disponible | Apache 2.0 | GGUF Q4_0 | KL 0,04435; 3,350 GB |
| Xylolabs BFP4-MLP (variante) | no disponible | no disponible | Apache 2.0 | safetensors BFP4 | Recomendada para dispositivos con menos memoria |

## Limitaciones y advertencias

- El modelo está diseñado y empaquetado específicamente para hardware Tenstorrent Tensix; su uso en GPU convencional requiere cargarlo como bf16 y pierde la ventaja de tamaño del formato BFP8.
- La cuantización BFP8 introduce una degradación medible: KL medio de 0,00154 y top-1 del 98,23 % frente al bf16, aceptable pero no nula.
- Las torres de visión y audio permanecen en bf16, por lo que el ahorro de memoria se limita al backbone lingüístico; no se documenta el rendimiento multimodal tras la cuantización.
- No se publica información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base en la información disponible.
- La lista completa de idiomas soportados no está disponible; la evaluación solo cubre inglés y coreano.
- La licencia es Apache 2.0 según la model card del modelo base, pero el repositorio original de Google no incluye fichero LICENSE, por lo que el autor ha añadido el texto estándar; conviene verificar los términos antes de uso comercial.
- El autor advierte de que para dispositivos con menos memoria debe usarse la variante BFP4 de MLP, que presumiblemente degrada más la precisión (no se publican métricas de esa variante en esta ficha).
- No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K), solo métricas de fidelidad de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Variante BFP4 para MLP: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit del pipeline: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como URL verificada en la información proporcionada
