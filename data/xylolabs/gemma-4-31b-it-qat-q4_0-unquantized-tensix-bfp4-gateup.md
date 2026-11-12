# Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal `google/gemma-4-31B-it-qat-q4_0-unquantized`, preparada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización emplea formatos de coma flotante por bloques propios de TT-NN (`bfloat4_b` y `bfloat8_b`), aplicando GPTQ sobre las proyecciones MLP gate/up y redondeo al más cercano sobre atención y MLP down. El resultado es un checkpoint de 27,00 GB empaquetados con una media de 7,04 bits por peso, frente a los 61,39 GB del modelo base en BF16.

El modelo subyacente es Gemma 4 de Google, con 32.682.375.020 parámetros totales según los safetensors, pipeline image-text-to-text y licencia Apache 2.0. Se trata de un transformer denso con capacidad de visión (torre visual conservada en BF16) y modo de razonamiento explícito ("thinking"), orientado a conversación, generación de código y tareas multimodales.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización específica de hardware (block floating point para Tensix), y por otro advierte de que el checkpoint fue validado únicamente en `ttsim`, el simulador de Blackhole, no en silicio real, y que tt-transformers y tt-forge no se han ejecutado con él. Es, por tanto, material de investigación más que un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), con torre visual y LM; detalles internos de capas no disponibles |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) con GPTQ en MLP gate/up; BFP8 (`ttnn.bfloat8_b`) con round-to-nearest en atención q/k/v/o y MLP down; bf16 en embeddings, LM head, normas, torre visual y resto de tensores. Media de 7,04 bits por peso |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards indexados con `model.safetensors.index.json`), más `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base de Google. No se ha reentrenado: los pesos BF16 se transforman a los formatos de bloque de TT-NN. Las matrices BFP4 se obtuvieron con GPTQ y una búsqueda de exponente por bloque, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices BFP8 se generaron con redondeo al más cercano. Los tensores cuantizados se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar sus valores.

El reparto por capas es el siguiente: atención q, k y o en 60 capas a BFP8 (8,5 bits por peso); atención v en 50 capas a BFP8; MLP gate y up en 60 capas a BFP4 (4,5 bits por peso); MLP down en 60 capas a BFP8. Embeddings, LM head (atada al embedding), normas y el resto de tensores permanecen en bf16, igual que `embed_vision` y `vision_tower`. Solo se cuantizó y evaluó el modelo de lenguaje; la parte visual no fue evaluada.

Como innovación técnica destaca el uso de block floating point con exponente compartido por bloque, un formato nativo de los NPU Tensix, y la verificación de empaquetado exacto: el script `pack_tensix.py` comprueba matriz a matriz que ningún valor cambia al pasar a TT-NN, y `verify_grid.py` valida la rejilla solo con torch. No se dispone de información sobre datos de preentrenamiento, número de tokens, RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre visual intacta en bf16.
- Razonamiento explícito mediante modo "thinking" activable; la evaluación incluye 7 prompts de razonamiento repetidos con thinking activado.
- Respuesta a preguntas de conocimiento general y tareas de verificación automática (33 prompts cortos con comprobación automática).
- Capacidad multilingüe parcial: la evaluación cubre inglés y coreano, aunque la lista oficial de idiomas no está disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Ejecución en aceleradores Tenstorrent Tensix mediante TT-NN (empaquetado verificado en simulador).

## Casos de uso

- Investigación en cuantización para NPU: el checkpoint sirve para validar pipelines de GPTQ con block floating point sobre Tensix, comparando la fidelidad KL frente a BF16 antes de desplegar en Wormhole o Blackhole.
- Evaluación de fidelidad de cuantización: con una KL media de 0,02360 y un top-1 del 94,97 % frente a BF16, es útil como referencia para calibrar nuevas recetas de cuantización en el mismo hardware.
- Prototipado multimodal en simulador: al conservar la torre visual en bf16, permite probar flujos image-text-to-text en `ttsim` antes de disponer de silicio.
- Despliegue con requisitos estrictos de memoria: sus 27,00 GB empaquetados frente a 61,39 GB en BF16 reducen a menos de la mitad la huella, lo que facilita alojar el modelo en DRAM de aceleradores con capacidad limitada.
- Generación de código y asistencia técnica en inglés y coreano: el modelo base es instruction-tuned y la evaluación cubre respuestas cortas verificables, adecuado para asistentes de documentación en esos idiomas.
- Comparación de estrategias de cuantización: junto con la variante Q4_0 de llama.cpp (4,60 bits, 17,651 GB), permite analizar el compromiso entre bits por peso, tamaño y pérdida de calidad en el mismo checkpoint de origen.
- Validación de empaquetado en cadenas TT-Metal: los scripts `pack_tensix.py` y `verify_grid.py` sirven como test de regresión para verificar que TT-NN lee los pesos sin alterarlos.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 61,39 | 0 | 100 | 40 de 40 | - |
| Este modelo | 7,04 | 27,002 | 0,02360 | 94,97 | 40 de 40 | 0 |
| Q4_0 (llama.cpp) | 4,60 | 17,651 | 0,01920 | 95,33 | 33 de 33 | 0 |

La KL y el top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total); la fila de Q4_0 solo contabiliza los 33. "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la variante; los empates cercanos no se contabilizan. Q4_0 se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia, con sha256 `141db4794deefb1b40be410f297e53ac17a0742b879edbe98c591210c68b47cd`.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 27,00 GB empaquetados para los pesos en los formatos BFP4/BFP8, más overhead de activaciones y caché KV no cuantificada en la información disponible.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validación: probado con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole; no se ha ejecutado en hardware real.
- GPU convencionales: el quickstart usa `transformers` con `dtype="bfloat16"` y `device_map="auto"`, pero no se especifican GPU probadas ni VRAM necesaria en ese modo; no disponible.
- Cabe en GPU de consumo: no disponible; con 32,68 mil millones de parámetros y pesos almacenados en bf16 sobre rejilla BFP, el peso en memoria ronda los 65,4 GB del repositorio, por lo que no es viable en GPU de consumo sin cuantización adicional.
- Opciones de despliegue: TT-NN / TT-Metal en Tensix; `transformers` para carga y generación; `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Gemma 4 31B, Tensix BFP4) | 32,68 B | no disponible | 7,04 | 27,002 GB | Apache 2.0 | Hugging Face, validado solo en simulador |
| Gemma 4 31B base (BF16) | 32,68 B | no disponible | 16 | 61,39 GB | Apache 2.0 | Hugging Face |
| Q4_0 llama.cpp del mismo checkpoint | 32,68 B | no disponible | 4,60 | 17,651 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks frente a otras familias. Frente a Q4_0, este checkpoint ocupa más espacio (27,00 frente a 17,65 GB) pero conserva el 100 % de las respuestas correctas en el conjunto de 40 pruebas, mientras que Q4_0 solo se evaluó en 33.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y `embed_vision` no fueron evaluados, por lo que el rendimiento multimodal no está verificado.
- El checkpoint se probó únicamente en `ttsim` (simulador de Blackhole con `ttnn` 0.81.1), no en hardware Wormhole o Blackhole real.
- `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint.
- La evaluación es reducida: 8.048 posiciones para KL y top-1, y 40 prompts cortos con comprobación automática; no sustituye a benchmarks estándar.
- La calibración de GPTQ usó solo WikiText-2 y Wikipedia en coreano, lo que puede sesgar la fidelidad hacia esos dominios e idiomas.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información proporcionada.
- Longitud de contexto e idiomas oficialmente soportados: no disponibles, lo que impide garantizar comportamiento en contextos largos o en idiomas distintos del inglés y el coreano.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base de Google antes de un despliegue en producción.
- El repositorio ocupa 65,4 GB pese a los 27,00 GB empaquetados, por la presencia de tensores en bf16 y posibles duplicados; conviene revisar el espacio en disco antes de la descarga.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Revisión concreta del modelo base citada en la evaluación: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized/tree/1e4d8beecacb8b7590c1d8bedd7335f687bf311f
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del checkpoint: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp/blob/main/LICENSE
