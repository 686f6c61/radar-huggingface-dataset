# Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8-RTN-Exp

## Resumen

`Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8-RTN-Exp` es una exportación cuantizada del modelo multimodal `google/gemma-4-12B-it`, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante la pila de software TT-NN / tt-metal. La cuantización se aplica únicamente a las capas lineales de atención (q, k, o, v) y del bloque MLP (gate, up, down) del modelo de lenguaje, convirtiéndolas al formato de coma flotante por bloques `bfloat8_b` (BFP8) con redondeo al más cercano (RTN), sin calibración. El resto de tensores —embeddings, LM head, normas y los módulos de audio y visión— permanecen en bf16.

El resultado es un checkpoint de 12.966.363.184 parámetros que ocupa 13,60 GB empaquetado (frente a los 23,81 GB de la versión BF16), con un promedio de 9,13 bits por peso. La motivación es clara: reducir la huella de memoria del modelo para que quepa en la DRAM de las tarjetas Tensix sin degradar de forma apreciable la fidelidad respecto al original. Según la evaluación del autor, la divergencia media (KL) frente a BF16 es de 0,00319, muy por debajo de la de una cuantización Q4_K_M de llama.cpp (0,16924), y conserva las 40 respuestas correctas del modelo base en el conjunto de prueba.

Es relevante ahora porque el ecosistema Tenstorrent necesita checkpoints preempaquetados en los formatos nativos de TT-NN, y este trabajo demuestra que una cuantización BFP8 por bloques de 16 valores con exponente compartido es viable sin pérdida medible en tareas de respuesta corta. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial, aunque con las cautelas propias de un artefacto de cuantización de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), derivado de google/gemma-4-12B-it |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales de atención y MLP; bf16 en el resto |
| Idiomas soportados | no disponible en la model card (la evaluación cubre inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetados para TT-NN), con `quant4.json` e índice de shards |

## Arquitectura y entrenamiento

El checkpoint no entrena ningún modelo nuevo: es una conversión post-entrenamiento del `google/gemma-4-12B-it`. La arquitectura subyacente es un transformer multimodal de tipo `gemma4_unified` con pipeline `any-to-any`, que incluye módulos de visión (`embed_vision`, `vision_embedder`) y audio (`embed_audio`) además del modelo de lenguaje. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo base y no se reproduce aquí.

La innovación técnica es la cuantización BFP8 con redondeo al más cercano sobre la rejilla `bfloat8_b` de TT-NN. Cada bloque de 16 pesos comparte el exponente de su valor máximo, o uno inferior si eso reduce el error, y los valores cuantizados se almacenan como bf16 sobre dicha rejilla, de modo que TT-NN los empaqueta sin alterar su valor. Se cuantizaron 48 capas en q, k, o, gate, up y down, y 40 capas en v; el LM head (atado al embedding), las normas y los módulos de audio y visión quedan en bf16. No se usó calibración ni importance matrix. La verificación se realizó con ttnn 0.81.1 sobre el simulador Blackhole (ttsim), comprobando que ningún valor cambia tras el empaquetado.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base `gemma-4-12B-it`.
- Entrada y salida multimodal: el pipeline es `any-to-any`, con módulos de visión y audio conservados en bf16.
- Modo de razonamiento ("thinking") disponible en el modelo base; la evaluación del autor incluye 7 prompts de razonamiento ejecutados con thinking activado.
- Capacidades multilingües: la evaluación cubre inglés y coreano, pero la lista oficial de idiomas no está disponible.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones con roles.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta comportamiento agéntico ni multi-step reasoning más allá del modo thinking del modelo base.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está empaquetado para TT-NN y ocupa 13,60 GB de DRAM, por lo que encaja en tarjetas Wormhole o Blackhole para inferencia local sin GPU convencional.
- Servicio de chat multimodal en inglés y coreano: el modelo conserva los módulos de visión y audio en bf16 y puede gestionar conversaciones con imagen o audio de entrada, útil en asistentes de atención al cliente multiformato.
- Razonamiento con thinking activado: para tareas que requieren pasos intermedios explícitos (problemas de lógica, matemáticas básicas), el modo thinking del modelo base sigue disponible tras la cuantización.
- Prototipado e investigación en cuantización: el repositorio incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, lo que permite reproducir la verificación de matrices y estudiar el impacto de BFP8 frente a Q4_K_M.
- Inferencia en entornos con restricciones de memoria: con 13,60 GB frente a 23,81 GB en BF16, permite ejecutar el modelo en dispositivos con DRAM limitada donde la versión completa no cabría.
- Evaluación comparativa de fidelidad de cuantización: sirve como referencia para medir KL y top-1 frente a BF16 y Q4_K_M en pipelines de validación de checkpoints cuantizados.
- Integración en transformers para pruebas rápidas: el quickstart con `AutoModelForCausalLM` permite cargar el checkpoint en bf16 y validar respuestas antes de portarlo al backend Tensix.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las métricas KL y top-1 cubren 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con plantilla de chat. "Answers right" son 33 prompts cortos con comprobación automática más 7 de razonamiento con thinking activado (40 en total).

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-12B-it) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| Este modelo (BFP8 RTN) | 9,13 | 13,596 | 0,00319 | 98,27 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

El autor no reporta velocidad ni throughput. Los números miden cercanía al BF16, no calidad absoluta de tarea.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,60 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers según la model card.
- Hardware objetivo: aceleradores Tenstorrent Tensix (Wormhole, Blackhole) con TT-NN / tt-metal.
- Verificación realizada con ttnn 0.81.1 sobre el simulador Blackhole (ttsim), no sobre silicio real según la información disponible.
- GPU convencionales: el quickstart usa `transformers` con `dtype="bfloat16"` y `device_map="auto"`, pero no se especifican GPU recomendadas ni si cabe en tarjetas consumer.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; `transformers` para carga y pruebas. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano (GB) | KL vs BF16 | Licencia |
|---|---:|---|---:|---:|---:|---|
| Este modelo (BFP8 RTN) | 12,97 B | no disponible | 9,13 | 13,596 | 0,00319 | Apache 2.0 |
| google/gemma-4-12B-it (BF16) | 12,97 B | no disponible | 16 | 23,81 | 0 | Apache 2.0 |
| Q4_K_M de llama.cpp (mismo base) | 12,97 B | no disponible | 4,95 | 7,381 | 0,16924 | Apache 2.0 |

La comparativa se limita al mismo modelo base en distintas precisiones, que es lo que documenta el autor. No se dispone de datos frente a otros modelos de 12B de la competencia.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; los módulos de visión y audio no fueron evaluados tras la conversión.
- La evaluación se limita a 8.048 posiciones de texto y 40 respuestas cortas; no cubre tareas largas, generación extensa ni calidad multimodal.
- No se reportan métricas de velocidad, latencia ni throughput, por lo que el rendimiento en producción es desconocido.
- La verificación se hizo sobre el simulador ttsim, no sobre hardware Tensix físico; tt-transformers y tt-forge no se probaron.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificar errores en tareas de razonamiento largo no cubiertas por la evaluación.
- Sesgos: no documentados en la model card; dependen del modelo base y de sus datos de entrenamiento.
- Idiomas: la lista oficial no está disponible; la evaluación solo cubre inglés y coreano.
- Licencia Apache 2.0 heredada del modelo base, pero el repositorio del modelo base no incluye fichero LICENSE y el autor aporta el texto estándar; conviene verificar los términos del modelo original antes de uso comercial.
- Contexto máximo no documentado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8-RTN-Exp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como enlace directo en la información proporcionada
