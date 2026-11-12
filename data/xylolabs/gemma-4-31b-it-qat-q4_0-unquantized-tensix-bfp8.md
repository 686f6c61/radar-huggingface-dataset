# Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tensix-BFP8

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal `google/gemma-4-31B-it-qat-q4_0-unquantized`, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). La cuantización se aplica únicamente a las capas lineales del modelo de lenguaje mediante GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) de TT-NN, mientras que el resto de tensores (embeddings, normas, cabeza de salida y torre de visión) permanece en bf16. El resultado son 8,85 bits por peso de media y un empaquetado de 33,94 GB.

El modelo base es un Gemma 4 de 31B parámetros con capacidades de imagen-a-texto, ajustado con QAT (quantization-aware training) y distribuido originalmente como Q4_0. Esta variante no reduce el tamaño tanto como Q4_0 (17,65 GB), pero se acerca mucho más al modelo BF16 de referencia en términos de divergencia KL (0,00174 frente a 0,01920 de Q4_0) y retención de top-1 (98,67 % frente a 95,33 %). Es relevante para quienes despliegan Gemma 4 en hardware Tenstorrent y necesitan pesos que TT-NN pueda empaquetar sin transformación adicional.

La licencia declarada es Apache-2.0, aunque conviene verificar las condiciones del modelo base de Google antes de un uso comercial. El checkpoint fue validado con `ttnn 0.81.1` sobre el simulador Blackhole (`ttsim`), no sobre hardware físico, y las herramientas `tt-transformers` y `tt-forge` no se han probado con estos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del linaje Gemma 4; capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en atencion q/k/o (60 capas), atencion v (50 capas) y MLP gate/up/down (60 capas); bf16 en embeddings, normas, LM head y torre de vision; media de 8,85 bits por peso |
| Idiomas soportados | no disponibles (la evaluacion cubre texto en ingles y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB; pesos empaquetados 33,94 GB), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 con 32.682 millones de parametros, capaz de procesar imagenes y texto (pipeline `image-text-to-text`). Incluye una torre de vision (`vision_tower`) y un proyector `embed_vision`, ambos conservados en bf16 en esta variante. El modelo base fue entrenado por Google con quantization-aware training y publicado como checkpoint Q4_0 sin cuantizar, lo que sirve de punto de partida para re-cuantizaciones alternativas.

La innovacion de este repositorio es la cuantizacion GPTQ sobre la rejilla `bfloat8_b` de TT-NN: cada bloque comparte un exponente y los valores se almacenan como bf16 sobre esa rejilla, de modo que el empaquetador de TT-NN los lee sin modificar su valor. El calibrado se realizo con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizo y evaluo el modelo de lenguaje; la parte de vision no fue cuantizada ni medida. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base ni sobre las etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`) y rol de sistema/usuario/asistente.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de vision en bf16.
- Razonamiento y respuesta a preguntas cortas: la evaluacion del autor incluye 33 prompts con comprobacion automatica, todos resueltos correctamente.
- Capacidad multilingue parcial: la evaluacion cubre texto en ingles y coreano.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Empaquetado directo en TT-NN para ejecucion en NPU Tensix (Wormhole, Blackhole).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint esta pensado para cargarse en NPU Wormhole o Blackhole mediante TT-NN, que empaqueta las matrices BFP8 sin recalcular valores; util para equipos con infraestructura Tenstorrent que quieren servir Gemma 4 sin conversion adicional.
- Servicio conversacional multimodal: al conservar la torre de vision en bf16 y el pipeline `image-text-to-text`, permite responder preguntas sobre imagenes en un chat multi-turno.
- Inferencia de mayor fidelidad que Q4_0: con una divergencia KL de 0,00174 frente a BF16 (frente a 0,01920 de Q4_0) y 98,67 % de retencion top-1, es adecuado cuando se necesita un modelo cercano al original con menos memoria que BF16 (33,94 GB frente a 61,39 GB).
- Evaluacion y benchmarking de cuantizacion: las herramientas `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado no altera valores, util para validar pipelines de cuantizacion propios.
- Prototipado en simulador: el autor lo valido con `ttnn 0.81.1` sobre `ttsim` (simulador Blackhole), por lo que sirve para desarrollar y depurar flujos TT-NN antes de disponer de hardware.
- Investigacion en cuantizacion por bloques: el codigo `tensix-bfp-gptq` y el fichero `quant4.json` documentan el formato por proyeccion, lo que facilita experimentos con otras rejillas o calibraciones.

## Benchmarks y rendimiento

Los datos publicados miden la cercania al modelo BF16, no la calidad en tareas. La evaluacion cubre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano) y 33 prompts cortos con comprobacion automatica.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 61,39 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,85 | 33,938 | 0,00174 | 98,67 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,60 | 17,651 | 0,01920 | 95,33 | 33 de 33 | 0 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni mediciones de velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos empaquetados ocupan 33,94 GB; en bf16 el modelo base ocupa 61,39 GB.
- GPU recomendadas: no se especifican; el checkpoint esta orientado a NPU Tenstorrent Tensix (Wormhole y Blackhole).
- Compatibilidad con GPU de consumo: no disponible; 33,94 GB de pesos exceden la memoria de la mayoria de GPU de consumo actuales.
- Despliegue: `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) y TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`). `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- Validacion: `ttnn 0.81.1` sobre `ttsim` (simulador Blackhole); no se ha ejecutado en hardware fisico segun el autor.
- Latencia y throughput: no disponibles; el autor indica que no se midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano (GB) | KL media vs BF16 | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (BFP8, Tensix) | 32,68 B | no disponible | 8,85 | 33,94 | 0,00174 | apache-2.0 |
| Gemma 4 31B BF16 (base) | 32,68 B | no disponible | 16 | 61,39 | 0 | ver modelo base |
| Gemma 4 31B Q4_0 (llama.cpp) | 32,68 B | no disponible | 4,60 | 17,65 | 0,01920 | ver modelo base |

La comparativa se limita a las variantes del mismo modelo base que aparecen en la evaluacion del autor; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; la torre de vision y el proyector `embed_vision` permanecen en bf16 y no fueron medidos.
- Los benchmarks miden divergencia respecto a BF16 (KL y top-1), no calidad en tareas; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- No se ha ejecutado en hardware Tensix fisico: la validacion se hizo con `ttnn 0.81.1` sobre el simulador `ttsim` (Blackhole).
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- No se midieron latencia ni throughput en dispositivo.
- El modelo puede alucinar y hereda los sesgos del modelo base; no se documentan sesgos especificos en la informacion disponible.
- La licencia declarada es Apache-2.0, pero conviene verificar las condiciones del modelo base de Google antes de un uso comercial.
- El calibrado de GPTQ uso WikiText-2 y Wikipedia en coreano; el rendimiento en otros idiomas o dominios no esta documentado.
- La longitud de contexto no se especifica en la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Codigo de cuantizacion (`tensix-bfp-gptq`): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
