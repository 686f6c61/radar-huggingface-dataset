# Xylolabs/gemma-4-E4B-it-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-E4B-it-Tensix-BFP4` es una cuantizacion del modelo multimodal `google/gemma-4-E4B-it` de Google, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 en su variante E4B (8.667 millones de parametros totales) y sustituye las proyecciones lineales de atencion y MLP por pesos redondeados a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ, mientras que el resto de tensores (embeddings, normas, torres de vision y audio) permanecen en bf16.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra un pipeline de cuantizacion reproducible (GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano) que produce pesos ya alineados con la rejilla BFP4 que consume TT-NN, evitando un segundo redondeo en tiempo de carga. El resultado ocupa 9,44 GB empaquetado con una media de 10,05 bits por peso, frente a los 15,04 GB del checkpoint BF16.

Es importante senalar que la evaluacion publicada se limita al modelo de lenguaje: las torres de vision y audio no fueron cuantizadas ni evaluadas. Ademas, las pruebas en hardware Tensix se realizaron sobre `ttsim` (simulador de Blackhole), no sobre silicio real, y el soporte en tt-forge/tt-xla para Gemma 4 aun no esta operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) derivado de Gemma 4 E4B; capas lineales cuantizadas a BFP4 |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y gate/up/down de 42 capas; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision`, `vision_tower`; media de 10,05 bits por peso |
| Idiomas soportados | no disponible (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP4), `quant4.json` con el formato por proyeccion, `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal con torres separadas de vision y audio (`vision_tower`, `embed_vision`, `audio_tower`, `embed_audio`) y un tronco de lenguaje de 42 capas. La intervencion de Xylolabs no altera la topologia: unicamente redondea las proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) a block floating point de 4 bits mediante GPTQ, con una busqueda de exponente por bloque que ajusta la escala compartida de cada bloque de pesos. El calibrado se realizo sobre 65.536 tokens combinados de WikiText-2 y Wikipedia en coreano.

La innovacion tecnica principal es el alineamiento exacto con la representacion interna de TT-NN: los tensores se almacenan en bf16 pero cada valor ya cae sobre la rejilla BFP4, de modo que el empaquetado en la NPU no introduce un segundo redondeo. El repositorio incluye utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban matriz a matriz que el empaquetado es bit-exacto, y se documenta que los mismos valores tambien empaquetan exactamente en `ttnn.bfloat8_b`. No se detalla la composicion completa del dataset de preentrenamiento ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional en formato chat (la model card usa `apply_chat_template`).
- Razonamiento con modo "thinking" (la evaluacion incluye 7 prompts de razonamiento repetidos con thinking activado).
- Entrada imagen-texto y audio-texto: el pipeline declarado es `any-to-any` y se conservan las torres de vision y audio en bf16.
- Capacidades multilingues heredadas del modelo base (la calibracion cubre ingles y coreano; no se publica la lista completa de idiomas).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Despliegue en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado exacto verificado.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El modelo esta pensado para ejecutarse en Wormhole o Blackhole con TT-NN, donde el empaquetado BFP4 se realiza sin redondeo adicional y reduce la huella de pesos de 15,04 GB a 9,44 GB.
- Servicio conversacional multimodal en edge con acelerador dedicado: al conservar las torres de vision y audio en bf16, permite atender consultas que combinan imagen, audio y texto en un unico endpoint `any-to-any` sobre hardware Tensix.
- Evaluacion de pipelines de cuantizacion: sirve como referencia reproducible para validar tecnicas GPTQ con busqueda de exponente por bloque, comparando KL y top-1 frente a BF16 y frente a Q4_K_M de llama.cpp.
- Despliegue en entornos con restricciones de memoria: con 9,44 GB empaquetados y licencia Apache 2.0, encaja en escenarios donde el checkpoint BF16 de 15,04 GB no cabe en el presupuesto de DRAM del acelerador.
- Prototipado en simulador: la model card documenta ejecucion sobre `ttsim` (simulador de Blackhole), util para validar integraciones TT-NN antes de disponer de silicio.
- Razonamiento asistido con modo thinking: los prompts de razonamiento se mantienen correctos en la evaluacion (36 de 40 respuestas correctas, 0 perdidas respecto a BF16), lo que permite usarlo en tareas de analisis que requieren cadena de pensamiento.
- Integracion en transformers: el quickstart con `AutoModelForCausalLM` y `device_map="auto"` permite usarlo como checkpoint de transformers en GPU convencional, aunque sin la ventaja de empaquetado de TT-NN.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E4B-it`) | 16 | 15,04 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP4)** | 10,05 | 9,444 | 0,09700 | 86,56 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,66 | 5,335 | 0,19989 | 81,05 | 36 de 40 | 0 |

Metodologia declarada: KL y top-1 sobre 7.968 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobacion automatica mas los 7 de razonamiento repetidos con thinking activado (40 en total); "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la variante cuantizada. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,44 GB de pesos empaquetados en BFP4; el repo completo ocupa 17,4 GB (incluye tensores bf16 y pesos originales). En GPU convencional con transformers se cargan los safetensors bf16, por lo que el requisito real ronda los 15-17 GB mas overhead de activaciones.
- GPU recomendadas para el quickstart en transformers: no especificadas; por tamano, una GPU con 24 GB o mas (RTX 4090, L40S, A100 40 GB) permite cargar el checkpoint con margen.
- NPU objetivo: Tenstorrent Wormhole y Blackhole. La demo oficial de Gemma 4 de tt-metal (v0.81.1) ejecuta E2B, E4B y 12B en una unica Blackhole P150.
- Cabe en consumer GPU: si, en GPUs de 24 GB o superiores en modo bf16; no se documenta una ruta de cuantizacion adicional para GPU de consumo.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`), tt-metal (demo Gemma 4 v0.81.1, sin soporte nativo de bfloat4_b; requiere entrada en `precision_overrides.json` con `bfp8`), tt-forge/tt-xla (sin soporte verificado para Gemma 4), transformers (`AutoModelForCausalLM`), llama.cpp solo como referencia comparativa Q4_K_M.
- Latencia y throughput: no disponibles. Las pruebas en Tensix se hicieron sobre `ttsim`, no sobre hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Xylolabs/gemma-4-E4B-it-Tensix-BFP4` | 8.667 M | no disponible | BFP4 (GPTQ) | 9,44 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| `google/gemma-4-E4B-it` (BF16) | 8.667 M | no disponible | bf16 | 15,04 GB | Apache 2.0 | Hugging Face |
| Gemma-4-E4B-it Q4_K_M (llama.cpp) | 8.667 M | no disponible | Q4_K_M | 5,335 GB | Apache 2.0 (derivada) | Generado localmente con llama.cpp v0.9.0 |

Frente al checkpoint BF16, la variante BFP4 reduce el tamano un 37 % con una perdida de top-1 de 13,44 puntos pero sin perder ninguna respuesta correcta en el conjunto de 40 prompts. Frente a Q4_K_M, ocupa casi el doble de espacio pero obtiene mejor KL (0,097 frente a 0,200) y mejor top-1 (86,56 % frente a 81,05 %). La ventaja diferencial no es la relacion compresion/calidad, sino el empaquetado exacto en TT-NN sin segundo redondeo.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; las torres de vision y audio permanecen en bf16 y no se han evaluado en esta variante.
- Las pruebas en Tensix se realizaron sobre `ttsim` (simulador de Blackhole), no sobre hardware fisico; el comportamiento en Wormhole o Blackhole real no esta verificado.
- tt-metal no ofrece soporte nativo de `bfloat4_b` para Gemma 4: sin una entrada en `precision_overrides.json`, todos los modulos cargan en bf16 (exacto pero sin ganancia de memoria).
- tt-forge/tt-xla no se ha ejecutado con Gemma 4; su opcion `bfp_bf4` re-redondea los pesos con un layout de bloque distinto, por lo que no garantiza el mismo resultado.
- Riesgo de alucinacion inherente al modelo base; no se publican evaluaciones de factualidad ni de sesgos en esta variante.
- La calibracion de GPTQ se limita a ingles y coreano, lo que puede degradar la calidad en otros idiomas no representados.
- No se publica la longitud de contexto soportada ni la lista completa de idiomas.
- Licencia Apache 2.0, lo que permite uso comercial, pero las condiciones del modelo base de Google deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de codigo `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
