# Xylolabs/gemma-4-E2B-Tensix-BFP8

## Resumen

Gemma 4 E2B Tensix BFP8 es una versión cuantizada del modelo multimodal google/gemma-4-E2B, adaptada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el stack TT-NN/TT-Metal. La cuantización aplica GPTQ sobre las capas lineales del modelo de lenguaje para llevar sus pesos a la rejilla `ttnn.bfloat8_b` (block floating point de 8 bits), manteniendo en bf16 el resto de tensores: embeddings, LM head, normas y las torres de visión y audio. El resultado es un checkpoint de 5.525.831.235 parámetros totales que ocupa 7,556 GB empaquetado, con una media de 13,01 bits por peso.

El interés de esta ficha es doble. Por un lado, demuestra una vía de cuantización específica para hardware: los pesos se almacenan en bf16 pero cada valor ya está alineado a la rejilla BFP8 que espera TT-NN, de modo que el empaquetado en el dispositivo es una conversión directa sin pérdida adicional. Por otro, cuantifica explícitamente la fidelidad respecto al modelo base: una divergencia KL media de 0,00151 frente a BF16 sobre 8.176 posiciones de texto en inglés y coreano, con un top-1 del 97,87 % y cero respuestas perdidas en un conjunto de 28 preguntas cortas.

Es importante subrayar el alcance de la validación: el autor probó el checkpoint con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre silicio real, y ni tt-transformers ni tt-forge se ejecutaron con estos pesos. Además, el modelo es la variante preentrenada, sin plantilla de chat, por lo que continúa texto en lugar de mantener conversaciones. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de visión y audio; capas lineales cuantizadas a block floating point BFP8 |
| Parámetros totales | 5.525.831.235 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones de atención y MLP; bf16 en embeddings, LM head, normas y torres de visión/audio; media de 13,01 bits por peso |
| Idiomas soportados | no disponible (la calibración y evaluación usan inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E2B, un transformer multimodal de la familia Gemma 4 que procesa texto, imagen y audio (pipeline `any-to-any`). La cuantización afecta únicamente al modelo de lenguaje: las proyecciones q, o, k, v de atención y gate, up y down del MLP se convierten a `bfloat8_b` con GPTQ, mientras que `audio_tower`, `embed_audio`, `embed_vision`, `vision_tower`, el embedding, el LM head (atado al embedding) y las normas permanecen en bf16 sin cambios. Según la model card, las proyecciones de atención q/o cubren 35 capas y k/v 15 capas; el MLP gate/up/down cubre 35 capas. El detalle por proyección está en `quant4.json`.

La innovación técnica es el uso de la rejilla block floating point propia de Tenstorrent: cada bloque comparte un exponente y los pesos se cuantizan directamente sobre esa rejilla, de forma que TT-NN los empaqueta tal cual llegan, sin recuantización en el dispositivo. La calibración de GPTQ usó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban, matriz a matriz, que ningún valor cambia tras el empaquetado. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card de google/gemma-4-E2B, no incluida en la información proporcionada.

## Capacidades

- Generación de texto y continuación de texto: es la variante preentrenada, sin plantilla de chat.
- Procesamiento multimodal any-to-any: incluye torres de visión y audio en bf16, por lo que conserva las capacidades de imagen y audio del modelo base.
- Razonamiento y conocimiento general heredados de Gemma 4 E2B; el autor no evalúa calidad de tarea, solo fidelidad respecto a BF16.
- Soporte multilingüe: la calibración y la evaluación cubren inglés y coreano; el resto de idiomas no está documentado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN; verificado en simulador, no en hardware.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN, de modo que un equipo con Wormhole o Blackhole puede cargar los pesos directamente en DRAM sin recuantizar; adecuado para entornos que ya operan con el stack TT-Metal.
- Investigación en cuantización block floating point: sirve como referencia reproducible de GPTQ sobre la rejilla `bfloat8_b`, con scripts de verificación incluidos, para estudiar la pérdida de fidelidad frente a BF16 en modelos multimodales.
- Inferencia multimodal en inglés y coreano: las torres de visión y audio se mantienen en bf16, por lo que tareas de descripción de imagen o transcripción pueden ejecutarse sobre el mismo checkpoint, siempre que el runtime soporte las torres sin cuantizar.
- Prototipado en simulador: el autor validó con `ttsim`, el simulador de Blackhole, lo que permite desarrollar y depurar pipelines TT-NN sin disponer de hardware físico.
- Evaluación comparativa de fidelidad: el conjunto de 28 preguntas cortas con comprobación automática y las métricas KL/top-1 sobre 8.176 posiciones permiten comparar estrategias de cuantización (BFP8 frente a Q4_K_M de llama.cpp) con un protocolo definido.
- Generación de texto en modo completion: al no tener plantilla de chat, encaja en tareas de continuación, rellenado y generación condicionada por prefijo, no en asistentes conversacionales directos.
- Base para ajuste fino posterior: los pesos en safetensors con valores ya alineados a BFP8 pueden servir de punto de partida para experimentos de adaptación que respeten la rejilla del hardware destino.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. La evaluación cubre 8.176 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) y 28 preguntas cortas con comprobación automática, en formato completion y 3-shot.

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E2B) | 16 | 9,29 | 0 | 100 | 21 de 28 | - |
| Este modelo (BFP8) | 13,01 | 7,556 | 0,00151 | 97,87 | 21 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,10733 | 83,79 | 20 de 28 | 1 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el resultado es 0,01 veces la KL de Q4_K_M y cero respuestas perdidas frente a una. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `ecceec1c0048edfb92b9c9d8fe74a90c62da385604ad07e797cfdfe6bac6a94c`. No se midió velocidad en dispositivo. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,556 GB de pesos empaquetados en BFP8; el repo completo ocupa 11,1 GB. Para inferencia hay que sumar caché KV y activaciones, no cuantificadas.
- Hardware objetivo: aceleradores Tenstorrent Tensix, familias Wormhole y Blackhole, mediante TT-NN/TT-Metal.
- Validación: ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no probado en hardware real.
- GPU convencionales: el checkpoint se puede cargar con transformers en bf16 (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`), pero los pesos están alineados a la rejilla BFP8, no a formatos de GPU; no se documenta su rendimiento en CUDA.
- Opciones de despliegue: TT-NN (objetivo principal), transformers para carga y verificación; tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Latencia y throughput: no disponibles; el autor no midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B Tensix BFP8) | 5.525.831.235 | no disponible | BFP8 (13,01 bits/peso) | 7,556 GB | Apache 2.0 | Hugging Face, validado en simulador |
| google/gemma-4-E2B (BF16) | no disponible en la información | no disponible | BF16 | 9,29 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 5.525.831.235 | no disponible | Q4_K_M (5,87 bits/peso) | 3,428 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparativa relevante es de fidelidad y tamaño: BFP8 conserva el 97,87 % de top-1 y no pierde respuestas frente a BF16, mientras que Q4_K_M baja al 83,79 % y pierde una respuesta, a cambio de ocupar menos de la mitad (3,428 GB frente a 7,556 GB). No se dispone de comparación con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es la variante preentrenada: no incluye plantilla de chat y no está ajustado para diálogo; su uso conversacional requiere ajuste o ingeniería de prompts adicional.
- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y su comportamiento tras el cambio de precisión del LM no está evaluado.
- No hay validación en hardware Tensix real: las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; el rendimiento y la estabilidad en silicio están sin verificar.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint, lo que limita las garantías de compatibilidad con esos runtimes.
- Las métricas publicadas miden cercanía a BF16 (KL, top-1, 28 preguntas cortas), no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- La evaluación se limita a inglés y coreano; el comportamiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los heredados del modelo base, cuya model card no se incluye aquí.
- Licencia Apache 2.0 según la model card del modelo base; el repositorio del base no incluye fichero LICENSE, por lo que el autor aporta el texto estándar y detalla los cambios en `NOTICE`.
- El autor no está afiliado ni respaldado por Tenstorrent; el modelo se ofrece tal cual, sin garantía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Revisión concreta del modelo base citada: https://huggingface.co/google/gemma-4-E2B/tree/433813a669639fd7eaa83155828e9000ed357d53
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper citado (Gemma 4 Technical Report): arXiv:2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-Tensix-BFP8/blob/main/LICENSE
