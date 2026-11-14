# Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP8

## Resumen

Gemma-4-E2B-Tenstorrent-Tensix-BFP8 es una cuantización del modelo multimodal google/gemma-4-E2B, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de una conversión genérica: las capas lineales del modelo de lenguaje se han cuantizado a `ttnn.bfloat8_b` (block floating point de 8 bits, BFP8) mediante GPTQ, de forma que TT-NN puede empaquetar los pesos sin alterar sus valores. El resultado pesa 7,56 GB en memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 9,29 GB del checkpoint BF16 original.

El modelo base es un transformer multimodal de tipo any-to-any (texto, imagen y audio), con 5.525.831.235 parámetros totales según los safetensors del repositorio. La nomenclatura "E2B" del checkpoint original sugiere una variante eficiente, pero la model card no detalla parámetros activos ni arquitectura MoE, por lo que ese dato no está disponible. El repo ocupa 11,1 GB e incluye tanto el modelo de lenguaje cuantizado como los torres de visión y audio en bf16 sin modificar.

Su relevancia es doble: por un lado, demuestra una ruta de cuantización (GPTQ sobre la rejilla BFP8 nativa de Tenstorrent) que preserva casi exactamente el comportamiento del BF16 —KL media de 0,00151 frente a 0— y supera con claridad a una cuantización Q4_K_M de llama.cpp en fidelidad; por otro, es un artefacto de despliegue para hardware alternativo a GPU, un nicho con pocos checkpoints publicados. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, imagen, audio); detalles internos no disponibles |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones de atención y MLP; bf16 en embeddings, LM head, normas y torres de visión/audio; media de 13,01 bits por peso |
| Idiomas soportados | no disponible (evaluación en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado para TT-NN vía `ttnn.as_tensor` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal que procesa texto, imagen y audio (pipeline any-to-any), con torres específicas (`vision_tower`, `audio_tower`, `embed_vision`, `embed_audio`) y un modelo de lenguaje con 35 capas de atención y MLP según la tabla de formatos de la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación es el procedimiento de cuantización: GPTQ aplicado directamente sobre la rejilla block-floating-point `bfloat8_b` de Tenstorrent, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetado en TT-NN es una operación sin pérdida adicional. Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16. El checkpoint es el modelo preentrenado, sin plantilla de chat.

## Capacidades

- Generación de texto y continuación de texto (modelo preentrenado, sin ajuste de instrucciones).
- Procesamiento multimodal any-to-any: entrada de imagen y audio junto con texto, según el pipeline declarado y la presencia de torres de visión y audio.
- Razonamiento y conocimiento general heredados del modelo base Gemma-4-E2B (sin datos específicos de benchmarks de tarea en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas; la evaluación cubre inglés y coreano.
- Capacidades especiales (thinking mode, audio, visión): visión y audio presentes en la arquitectura; modo thinking no disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está empaquetado para Wormhole y Blackhole con TT-NN, y permite servir el modelo de lenguaje en hardware Tensix sin conversión adicional, con 7,56 GB de pesos en DRAM de dispositivo más espacio para KV cache y buffers.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible para estudiar el impacto de GPTQ sobre la rejilla BFP8, con métricas de KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Evaluación de fidelidad de cuantizaciones: el par de checkpoints BFP8/BFP4 del mismo autor permite comparar el compromiso entre memoria (7,56 GB frente a la variante BFP4) y degradación de salida en un mismo hardware.
- Prototipado multimodal en entornos con restricciones de GPU: al ser cargable con `transformers` en bf16 y `device_map="auto"`, puede usarse en GPU convencionales para validar pipelines de imagen-texto y audio-texto antes de portarlos a Tensix.
- Generación de texto en dominios técnicos en inglés y coreano: la calibración incluyó Wikipedia en coreano, lo que hace razonable su uso en tareas de continuación y resumen en esos idiomas, aunque sin garantías formales.
- Benchmarking de infraestructura: útil para medir latencia y throughput de TT-NN frente a llama.cpp o vLLM en cargas comparables, dado que el autor publica una cuantización Q4_K_M de referencia del mismo checkpoint.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. KL y top-1 cubren 8.176 posiciones de texto inglés y coreano (WikiText-2 test y Wikipedia en coreano); las respuestas corresponden a 28 prompts cortos con verificación automática, en formato de completion y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E2B) | 16 | 9,29 | 0 | 100 | 21 de 28 | - |
| Este modelo (BFP8) | 13,01 | 7,556 | 0,00151 | 97,87 | 21 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,10733 | 83,79 | 20 de 28 | 1 |

El autor fija como criterio de aceptación una KL media máxima de 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 0,01 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 1. No se publican datos de velocidad ni de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM/DRAM estimada: 7,56 GB solo para los pesos del modelo de lenguaje en el dispositivo Tensix, más KV cache y buffers. El repo completo ocupa 11,1 GB en disco.
- GPU recomendadas: no especificadas por el autor; al ser un checkpoint cargable con `transformers` en bf16, requiere del orden de 11 GB de memoria para los pesos en precisión completa, por lo que encaja en GPUs de 16 GB o más.
- Cabe en GPU de consumo: probablemente en RTX 4080/4090 y similares con 16-24 GB en bf16; no confirmado por el autor.
- Opciones de despliegue: TT-NN / tt-metal sobre Wormhole y Blackhole (verificado con ttnn 0.81.1 en el simulador ttsim), `transformers` para carga estándar; tt-transformers y tt-forge no fueron probados con este checkpoint. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.
- Herramientas de verificación incluidas: `pack_tensix.py` (comprueba cada matriz, con opción `--device` para round-trip por DRAM) y `verify_grid.py` (verificación de la rejilla solo con torch).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 5.525.831.235 | no disponible | BFP8, 13,01 bits/peso, 7,56 GB | Apache 2.0 | Hugging Face, 39 descargas |
| google/gemma-4-E2B (BF16) | 5.525.831.235 | no disponible | BF16, 16 bits/peso, 9,29 GB | Apache 2.0 | Hugging Face |
| Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP | no disponible | no disponible | BFP4 (MLP), menor huella | Apache 2.0 | Hugging Face |
| Q4_K_M del mismo checkpoint (llama.cpp) | 5.525.831.235 | no disponible | 5,87 bits/peso, 3,428 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparación relevante es de fidelidad y huella: BFP8 conserva 21 de 28 respuestas correctas con KL 0,00151, mientras que Q4_K_M baja a 20 de 28 con KL 0,10733 a costa de ocupar 3,428 GB. No se dispone de comparación con otros modelos multimodales de tamaño similar.

## Limitaciones y advertencias

- Es el modelo preentrenado: no incluye plantilla de chat ni ajuste de instrucciones, por lo que no debe usarse directamente como asistente conversacional sin post-entrenamiento.
- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de las torres de visión y audio en este checkpoint no está validado.
- No se han publicado benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.); las métricas existentes miden proximidad a BF16, no calidad.
- Idiomas soportados no documentados; la evaluación se limita a inglés y coreano.
- Longitud de contexto no disponible en la información proporcionada.
- Riesgo de alucinación inherente a un modelo preentrenado de 5,5 mil millones de parámetros; no se han publicado evaluaciones de sesgo.
- Dependencia de hardware: el formato BFP8 está pensado para Tensix; fuera de TT-NN se carga como bf16 y se pierde la ventaja de memoria. tt-transformers y tt-forge no fueron probados.
- La licencia Apache 2.0 se declara según la model card del modelo base, pero el repositorio de este último no contiene fichero LICENSE, lo que conviene verificar antes de un uso comercial.
- La calibración de GPTQ usó únicamente WikiText-2 y Wikipedia en coreano; dominios muy distintos pueden degradarse más de lo que indican las métricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Versión BFP4: https://huggingface.co/Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4-MLP
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arxiv:2607.02770
