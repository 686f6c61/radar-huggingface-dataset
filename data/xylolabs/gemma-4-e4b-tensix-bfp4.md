# Xylolabs/gemma-4-E4B-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-E4B-Tensix-BFP4` es una cuantización del modelo multimodal `google/gemma-4-E4B` de Google, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (transformer multimodal con torres de visión y audio) y sustituye el formato de sus capas lineales por `ttnn.bfloat4_b`, un formato de coma flotante por bloques (BFP4) nativo del stack TT-NN de Tenstorrent. El resultado es un checkpoint de 8.667 millones de parámetros con un tamaño empaquetado de 9,37 GB.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta de cuantización (GPTQ con búsqueda de exponente por bloque) que reduce el peso medio a 9,96 bits por peso manteniendo una fidelidad alta respecto al modelo BF16 original. Por otro, es uno de los pocos artefactos públicos que apuntan explícitamente al ecosistema de aceleradores Tensix, un hardware alternativo a las GPU convencionales para inferencia en el borde y en servidor.

Conviene subrayar que se trata del modelo preentrenado, sin plantilla de chat, y que el autor solo cuantizó y evaluó la parte lingüística; las torres de visión y audio permanecen en BF16 sin evaluar. Las pruebas se realizaron sobre el simulador ttsim de Blackhole con ttnn 0.81.1, no sobre hardware físico, y ni tt-transformers ni tt-forge se han ejecutado con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (language model + vision_tower + audio_tower), derivado de google/gemma-4-E4B |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; BF16 en embeddings, LM head, normas y torres de visión/audio; tambien empaquetable en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 ya alineados a la rejilla BFP4); repo de 17,4 GB, 9,37 GB empaquetados |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B`, un transformer multimodal con 42 capas en el modelo de lenguaje y torres separadas de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`). La cuantización afecta únicamente a las proyecciones lineales del modelo de lenguaje: las matrices q, o, k, v de atención y gate, up y down del MLP se convierten a `bfloat4_b`. El LM head (atado al embedding), las normas y todos los tensores de las torres de visión y audio se mantienen en BF16 sin cambios.

El proceso de cuantización emplea GPTQ con una búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos se almacenan en safetensors como bf16, pero cada valor ya está situado sobre la rejilla BFP4, de modo que TT-NN los empaqueta directamente sin recálculo. El resultado es un peso medio de 9,96 bits por peso. El repositorio incluye `quant4.json`, que documenta el formato de cada proyección, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la integridad de la rejilla. No se documentan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) más allá de lo que figure en la model card de Google.

## Capacidades

- Generación de texto y continuación de texto en modo preentrenado (sin plantilla de chat).
- Procesamiento multimodal de imagen y texto (`pipeline_tag: any-to-any`), heredado del modelo base.
- Procesamiento de audio, heredado del modelo base (torre de audio intacta en BF16).
- Razonamiento y matemáticas: capacidades propias de Gemma 4 E4B, no reevaluadas en esta cuantización.
- Generación de código: capacidad heredada del base, no verificada en esta ficha.
- Soporte multilingüe: no documentado; la calibración incluyó inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de pesos BFP4.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está pensado para cargarse directamente en TT-NN, que empaqueta los pesos BFP4 sin conversión adicional, lo que simplifica el pipeline de inferencia en hardware Tensix.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque y formato BFP4, con scripts de verificación incluidos en el repositorio.
- Inferencia de modelos multimodales en entornos con restricciones de memoria: los 9,37 GB empaquetados frente a los 15,04 GB en BF16 permiten alojar el modelo en aceleradores con DRAM más limitada.
- Prototipado de asistentes multimodales: al conservar las torres de visión y audio en BF16, puede emplearse para tareas image-text-to-text y audio-texto en fase de desarrollo.
- Evaluación comparativa de formatos de cuantización: la tabla de evaluación del autor (KL medio, top-1, respuestas correctas) permite contrastar BFP4 frente a Q4_K_M de llama.cpp sobre el mismo checkpoint.
- Validación de pipelines de empaquetado: `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin pérdida de valores antes de desplegar en producción.
- Generación de texto en modo completion para tareas de continuación y few-shot, tal como se empleó en la evaluación del autor (3-shot, formato completion).

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad en tareas:

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E4B) | 16 | 15,04 | 0 | 100 | 27 de 28 | - |
| **Este modelo (BFP4)** | 9,96 | 9,365 | 0,05101 | 89,21 | 23 de 28 | 1 |
| Q4_K_M, blk.N.proj Q8_0 (llama.cpp) | 5,67 | 5,349 | 0,24892 | 76,39 | 20 de 28 | 4 |

La KL y el top-1 se calculan sobre 8.176 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las 28 respuestas corresponden a prompts cortos con comprobación automática, en formato completion y 3-shot. El Q4_K_M se generó con llama.cpp v0.9.0 sobre el mismo checkpoint, sin importance matrix, y mantiene la proyección por capa `blk.N.proj` en Q8_0. No se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,37 GB empaquetados en BFP4; el repo completo ocupa 17,4 GB en safetensors bf16.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole). Probado únicamente en el simulador ttsim de Blackhole con ttnn 0.81.1, no en hardware físico.
- GPU convencionales: no se documenta soporte; el modelo se distribuye en safetensors bf16 y podría cargarse con transformers en GPU, pero no se han publicado requisitos ni resultados en ese escenario.
- Despliegue: TT-NN (empaquetado BFP4 y BFP8), transformers para carga en bf16. tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-Tensix-BFP4 | 8,67 B | no disponible | BFP4, 9,96 bits/peso | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B (BF16) | 8,67 B | no disponible | BF16, 16 bits/peso | Apache 2.0 (segun card base) | Hugging Face |
| Q4_K_M de llama.cpp sobre el mismo checkpoint | 8,67 B | no disponible | Q4_K / Q8_0 mixto, 5,67 bits/peso | Apache 2.0 | Generado por el autor, no publicado como repo |

## Limitaciones y advertencias

- Es el modelo preentrenado: no incluye plantilla de chat ni ajuste de instrucciones; responde como continuación de texto.
- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en BF16 y no se han evaluado en esta versión.
- No se ha ejecutado en hardware Tensix físico: las pruebas se hicieron en el simulador ttsim de Blackhole con ttnn 0.81.1.
- tt-transformers y tt-forge no se han probado con este checkpoint.
- Los benchmarks miden fidelidad respecto a BF16 (KL, top-1), no calidad en tareas; no hay datos de MMLU, HumanEval, GSM8K ni similares en esta ficha.
- Idiomas soportados no documentados; la calibración cubrió inglés y coreano, lo que puede sesgar el comportamiento en otras lenguas.
- Riesgo de alucinación y sesgos: no evaluados en esta cuantización; se heredan los del modelo base.
- Licencia Apache 2.0 según la card del modelo base, aunque el repositorio base no incluye fichero LICENSE; el autor incluye el texto estándar y un NOTICE con los cambios.
- El proyecto no está afiliado ni respaldado por Tenstorrent.
- Se distribuye "as is", sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
