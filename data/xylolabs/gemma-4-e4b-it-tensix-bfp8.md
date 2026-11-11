# Xylolabs/gemma-4-E4B-it-Tensix-BFP8

## Resumen
Gemma 4 E4B IT Tensix BFP8 es una cuantización del modelo multimodal google/gemma-4-E4B-it, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo base es un transformer multimodal any-to-any de Google con 8.667 millones de parámetros totales; esta variante redondea las capas lineales de atención y MLP al formato block-floating-point bfloat8_b (BFP8) nativo de TT-NN, mientras mantiene en bf16 el resto de tensores (embeddings, normas, torres de visión y audio, cabeza LM).

La relevancia de esta ficha es doble: por un lado, demuestra una vía práctica de cuantización hardware-aware para aceleradores no-GPU, donde el formato de destino no es un estándar de facto como GGUF o AWQ sino la rejilla numérica concreta del compilador (ttnn.bfloat8_b); por otro, conserva una fidelidad alta respecto al BF16 original, con una KL media de 0.00169 y un 98.12 % de top-1 en la evaluación publicada, muy por encima de un Q4_K_M convencional de llama.cpp.

El resultado ocupa 11.34 GB empaquetados (12.06 bits por peso de media), frente a los 15.04 GB del BF16, y se distribuye en safetensors compatibles con transformers, aunque su destino real de despliegue es el stack tt-metal/ttnn sobre hardware Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de visión y audio; capas lineales cuantizadas a block-floating-point BFP8 |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (ttnn.bfloat8_b) en atención q/k/v/o y MLP gate/up/down de 42 capas; bf16 en embeddings, normas, LM head y torres de visión/audio |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya alineados a la rejilla BFP8); incluye quant4.json y model.safetensors.index.json |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del base google/gemma-4-E4B-it: un transformer multimodal con atención y MLP por capas, más torres específicas de visión y audio que permiten entrada image-text y salida any-to-any. Esta variante no reentrena el modelo; aplica GPTQ sobre la rejilla bfloat8_b de TT-NN para redondear las proyecciones q, k, v, o y gate, up, down de las 42 capas del language model. Cada bloque BFP8 comparte un exponente propio, fijado por el empaquetador de TT-NN, y la calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica clave es que los pesos se guardan en bf16 pero con todos los valores ya situados exactamente en la rejilla BFP8, de modo que el empaquetado en TT-NN no vuelve a redondear y la conversión es exacta (verificable con `pack_tensix.py` y `verify_grid.py`). El autor indica que solo se cuantizó y evaluó el language model; las torres de audio y visión permanecen en bf16 sin cambios. No se documentan detalles sobre datos de preentrenamiento, RLHF o DPO del modelo base en la información disponible.

## Capacidades
- Generación de texto y razonamiento, incluyendo modo "thinking" (la evaluación incluye 7 prompts de razonamiento repetidos con thinking activado).
- Procesamiento multimodal any-to-any: entrada de imagen y texto, con torres de visión y audio preservadas en bf16.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingües heredadas del base; la calibración cubrió inglés y coreano, pero el conjunto completo de idiomas no está documentado.
- Compatibilidad con el pipeline `any-to-any` de transformers y con `endpoints_compatible`.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn; el demo oficial de Gemma 4 en tt-metal v0.81.1 soporta E2B, E4B y 12B en una Blackhole P150.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso
- Despliegue en NPU Tenstorrent: el caso principal. El modelo está pensado para ejecutarse en Wormhole o Blackhole con tt-metal/ttnn, aprovechando que los pesos ya están en la rejilla BFP8 y el empaquetado es exacto, lo que reduce el uso de DRAM a 11.34 GB frente a 15.04 GB en BF16.
- Inferencia multimodal en el borde: al conservar en bf16 las torres de visión y audio, permite aplicaciones image-text-to-text en hardware Tenstorrent sin degradar la parte perceptiva, mientras el language model opera en BFP8.
- Evaluación de pipelines de cuantización hardware-aware: sirve como referencia reproducible para comparar GPTQ sobre rejillas BFP frente a GGUF/AWQ, con métricas de KL y top-1 publicadas y scripts de verificación (`pack_tensix.py`, `verify_grid.py`).
- Servicio de chat con plantilla: el quickstart con `AutoModelForCausalLM` y `apply_chat_template` permite montar un endpoint conversacional compatible con transformers y con el ecosistema de endpoints.
- Investigación en formatos block-floating-point: útil para estudiar el impacto de exponentes compartidos por bloque en calidad (KL 0.00169) frente a cuantizaciones de 4 bits (KL 0.19989 en Q4_K_M).
- Prototipado en simulador: el autor validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, lo que permite desarrollar y depurar sin hardware físico antes de desplegar en P150.
- Integración en tt-forge/tt-xla: aunque no probado aún con Gemma 4, el modelo puede cargarse en bf16 (exacto) por defecto en ese stack, sirviendo de base para futuras compilaciones.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E4B-it) | 16 | 15.04 | 0 | 100 | 36 de 40 | - |
| Este modelo (BFP8) | 12.06 | 11.337 | 0.00169 | 98.12 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5.66 | 5.335 | 0.19989 | 81.05 | 36 de 40 | 0 |

Las métricas de KL y top-1 cubren 7.968 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática más 7 de razonamiento repetidos con thinking activado (40 en total). El Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/DRAM estimada: 11.34 GB empaquetados en BFP8; 15.04 GB si se carga en BF16.
- Aceleradores objetivo: NPU Tenstorrent Tensix Wormhole y Blackhole. El demo de tt-metal v0.81.1 ejecuta E2B, E4B y 12B en una sola Blackhole P150.
- GPU consumer: no es el destino del modelo; el quickstart con transformers puede cargarse en bf16 con `device_map="auto"`, lo que requiere al menos ~15 GB de memoria, por lo que encajaría en GPUs de 16 GB o más, aunque sin las ventajas de formato.
- Opciones de despliegue: tt-metal/ttnn (destino principal), transformers (referencia y validación), tt-forge/tt-xla (no probado con Gemma 4). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Validación: probado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no en hardware físico según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-it-Tensix-BFP8 | 8.667 M | no disponible | safetensors BFP8 | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it (BF16) | 8.667 M | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de gemma-4-E4B-it (llama.cpp) | 8.667 M | no disponible | GGUF 4-bit | Apache 2.0 | generado por el autor |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es frente al BF16 original y al Q4_K_M: el BFP8 conserva 98.12 % de top-1 y KL 0.00169 con 12.06 bits por peso, mientras el Q4_K_M baja a 81.05 % de top-1 con 5.66 bits por peso. No se dispone de datos de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias
- Solo se cuantizó y evaluó el language model; el rendimiento de las torres de visión y audio en este formato no está medido.
- El modelo está validado en ttsim (simulador de Blackhole) con ttnn 0.81.1, no en hardware físico, según la propia model card.
- tt-transformers no soporta Gemma 4; es necesario usar el demo de tt-metal o el stack ttnn directamente.
- tt-forge/tt-xla no se ha probado con Gemma 4; su opción `bfp_bf8` re-redondea los pesos en layout [out, in] y `bfp_bf4` los redondea aún más, lo que puede degradar la calidad.
- Los pesos en disco son bf16; cargarlos con transformers no aporta la ventaja de memoria del BFP8, que solo se materializa al empaquetar en TT-NN.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Idiomas soportados no documentados; la calibración se limitó a inglés y coreano, por lo que el comportamiento en otras lenguas no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google por posibles condiciones adicionales.
- La evaluación se basa en 40 prompts cortos y 7.968 posiciones de texto; es una muestra limitada para garantizar comportamiento en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como URL directa en la información proporcionada.
