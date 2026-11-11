# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP8

## Resumen

Este repositorio contiene una versión del modelo Gemma 4 E2B instructivo (base `google/gemma-4-E2B-it-qat-q4_0-unquantized`) recuantizada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix, como Wormhole y Blackhole. La operación no es una cuantización agresiva a la baja: las capas lineales de atención y MLP se redondean a la rejilla `ttnn.bfloat8_b` (BFP8, block floating point de 8,5 bits por peso) mediante GPTQ, mientras que embeddings, normas, cabeza LM y las torres de visión y audio permanecen en bf16. El resultado ocupa 7,54 GB empaquetados, con una media de 13,03 bits por peso.

El modelo es multimodal any-to-any: procesa imagen, texto y audio, y genera texto. Cuenta con 5.506.950.723 parámetros totales según los safetensors del repositorio, y las 35 capas del transformer del lenguaje son las que se han recuantizado. La motivación es práctica: TT-NN empaqueta formatos de bloque sin volver a redondear si los valores ya están en la rejilla, de modo que este checkpoint se carga directamente en DRAM del dispositivo sin pérdida adicional.

La relevancia del artefacto es doble. Por un lado, demuestra que una cuantización BFP8 calibrada con GPTQ preserva casi por completo el comportamiento del modelo BF16 (KL media de 0,00154 y 98,23% de top-1 frente al original). Por otro, es una de las primeras publicaciones que adapta un Gemma 4 al stack de Tenstorrent, aunque la validación se ha hecho sobre simulador (ttsim) y no sobre hardware físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de visión y audio; detalles internos no disponibles |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`bfloat8_b`) en q, k, v, o y gate, up, down de 35 capas; bf16 en el resto; media de 13,03 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya sobre la rejilla BFP8) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 E2B instructivo, de la familia Gemma 4 de Google, con arquitectura transformer y capacidades multimodales de entrada (imagen, texto y audio) y salida de texto. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el sufijo `it` y `qat-q4_0` del nombre base indica instrucción y quantisation-aware training con esquema Q4_0, pero los detalles no están disponibles en la información proporcionada.

La innovación técnica de esta ficha es el proceso de recuantización: Xylolabs aplica GPTQ sobre la rejilla de bloques `ttnn.bfloat8_b`, con el exponente compartido de cada bloque fijado por el empaquetador de TT-NN, y calibra con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se redondeó y evaluó el modelo de lenguaje; las torres de visión y audio quedan intactas en bf16. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar. La validación en dispositivo se hizo con ttnn 0.81.1 sobre ttsim, el simulador Blackhole de Tenstorrent, no sobre silicio real.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Entrada de imagen y texto (pipeline `image-text-to-text`), con torre de visión en bf16.
- Entrada de audio, con `audio_tower` y `embed_audio` en bf16.
- Razonamiento de varios pasos: la evaluación incluye 7 preguntas de razonamiento además de 33 prompts cortos con comprobación automática.
- Multilingüismo parcial verificado en inglés y coreano durante la calibración y la evaluación.
- Integración con el stack de Tenstorrent: TT-NN, tt-metal y, de forma experimental, tt-forge (tt-xla).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar el checkpoint directamente en DRAM de un Wormhole o Blackhole sin recuantizar en el host, gracias a que los pesos ya están sobre la rejilla BFP8 que espera TT-NN.
- Inferencia multimodal en el borde: al ocupar 7,54 GB empaquetados, el modelo cabe en la memoria de un Blackhole P150 y permite procesar imagen, audio y texto en un único dispositivo sin GPU dedicada.
- Asistentes conversacionales con contexto visual: usar la torre de visión en bf16 para responder preguntas sobre capturas, documentos escaneados o fotografías manteniendo la calidad original del modelo base.
- Transcripción y diálogo por voz: la torre de audio intacta permite construir interfaces de voz-a-texto con respuesta generativa en el mismo grafo de inferencia.
- Evaluación de pipelines de cuantización: servir como referencia para medir la degradación de BFP8 frente a BF16 y Q4_0 en tareas de razonamiento corto, con las métricas KL y top-1 ya publicadas.
- Prototipado en simulador: validar integraciones con tt-metal o tt-forge sobre ttsim antes de pasar a hardware, usando los scripts de verificación incluidos.
- Investigación en formatos de bloque: el par de scripts `pack_tensix.py` y `verify_grid.py` sirve para estudiar cómo se comporta el empaquetado BFP8 capa a capa en un modelo real de 5.500 millones de parámetros.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base Google) | 16 | 9,26 | 0 | 100 | 38 de 40 | - |
| Este modelo (BFP8) | 13,03 | 7,536 | 0,00154 | 98,23 | 38 de 40 | 0 |
| Q4_0 (llama.cpp) | 5,76 | 3,350 | 0,04435 | 89,47 | 39 de 40 | 0 |

Las métricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat aplicada. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 preguntas de razonamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 11 GB para los 5.500 millones de parámetros; el repositorio ocupa 11,0 GB en disco.
- Tamaño empaquetado en BFP8: 7,54 GB, que es la cifra relevante para planificar memoria de dispositivo en Tensix.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole; el demo de tt-metal para Gemma 4 ejecuta E2B, E4B y 12B en una sola Blackhole P150.
- GPU consumer: no se documenta soporte ni rendimiento en RTX 4090 u otras GPU; el checkpoint es cargable con `transformers` en bf16, pero el interés del artefacto es el empaquetado Tensix.
- Opciones de despliegue: TT-NN (ttnn 0.81.1), tt-metal (demo Gemma 4), tt-forge/tt-xla (sin soporte verificado para Gemma 4) y `transformers` con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; la validación se hizo en simulador, no en hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, Tensix BFP8) | 5.506.950.723 | no disponible | BFP8 + bf16, 7,54 GB | Apache 2.0 | Hugging Face, validado en ttsim |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (BF16) | 5.506.950.723 | no disponible | bf16, 9,26 GB | Apache 2.0 | Hugging Face |
| Q4_0 vía llama.cpp | 5.506.950.723 | no disponible | Q4_0, 3,35 GB | Apache 2.0 | Requiere conversión a GGUF |

La comparación con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se recuantizó y evaluó el modelo de lenguaje; el comportamiento de las torres de visión y audio tras el cambio de pesos no se ha medido.
- La validación en Tensix se realizó exclusivamente sobre ttsim (simulador Blackhole con ttnn 0.81.1); no hay resultados en hardware físico.
- tt-transformers no soporta Gemma 4; el camino de despliegue pasa por el demo de tt-metal o por `transformers` en bf16.
- tt-forge (tt-xla) no se ha probado con Gemma 4; sus opciones `bfp_bf8` y `bfp_bf4` vuelven a redondear los pesos y degradan la precisión respecto a este checkpoint.
- La calibración GPTQ usó únicamente WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son heredados del modelo base de Google.
- La licencia Apache 2.0 del repositorio no exime de revisar los términos del modelo base de Google antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como URL verificada en la información proporcionada
