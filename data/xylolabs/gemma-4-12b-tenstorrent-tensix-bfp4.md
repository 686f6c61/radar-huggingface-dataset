# Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP4` es una exportación cuantizada del modelo multimodal `google/gemma-4-12B`, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (transformer con componentes de visión y audio) y cuantiza únicamente las capas lineales del modelo de lenguaje a formato `ttnn.bfloat4_b` (BFP4) mediante GPTQ, dejando en bf16 las embeddings, las normas, la cabeza LM y todos los módulos multimodales.

El interés principal no reside en el modelo base, sino en el pipeline de cuantización y empaquetado: los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores. El resultado ocupa unos 8,15 GB de memoria de dispositivo para los pesos del modelo de lenguaje (frente a 23,81 GB en bf16), con un promedio de 5,47 bits por peso, lo que permite encajar un modelo de casi 13 000 millones de parámetros en NPUs Tensix con memoria limitada.

La relevancia es doble: por un lado, demuestra que la cuantización de bloque BFP4 con GPTQ puede acercarse a la calidad de BF16 (KL media de 0,073 frente a 0) y superar a Q4_K_M de llama.cpp en fidelidad; por otro, valida una ruta de despliegue para hardware no-GPU. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), con capas de atención y MLP cuantizadas; componentes de visión y audio |
| Parámetros totales | 12 966 363 184 (~12,97 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en capas lineales); resto en bf16; media de 5,47 bits por peso |
| Idiomas soportados | No disponible (evaluación en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con índice `model.safetensors.index.json` y `quant4.json` con el formato por proyección) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B`, un transformer multimodal que procesa texto, imagen y audio (pipeline `any-to-any`). La exportación de Xylolabs mantiene intacta la topología original y aplica cuantización GPTQ únicamente sobre las proyecciones lineales: atención q, k, o (48 capas), atención v (40 capas) y MLP gate, up y down (48 capas). Todas ellas se almacenan en `bfloat4_b` a 4,5 bits por peso. Las embeddings, la cabeza LM (atada a la embedding), las normas, `embed_audio`, `embed_vision` y `vision_embedder` permanecen en bf16 tal como en el modelo base.

La innovación técnica es el uso de punto flotante en bloques (block floating point) con búsqueda de exponente por bloque, calibrado sobre 65 536 tokens de WikiText-2 y Wikipedia en coreano. Los valores cuantizados se guardan como bf16 sobre la rejilla BFP4, lo que permite que TT-NN los empaquete de forma exacta sin pérdida adicional. El autor verificó el empaquetado con `ttnn 0.81.1` sobre `ttsim` (simulador de Blackhole) y proporciona los scripts `pack_tensix.py` y `verify_grid.py` para comprobar la integridad matriz a matriz. No se ejecutaron `tt-transformers` ni `tt-forge` con este checkpoint. No se dispone de información sobre el dataset de preentrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y continuación de secuencias; el checkpoint es el modelo preentrenado, sin plantilla de chat.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`) y pipeline `any-to-any`, con módulos de visión y audio en bf16.
- Razonamiento y matemáticas heredados del modelo base Gemma 4 de 12B.
- Capacidades multilingües del modelo base (no documentadas explícitamente en esta ficha).
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode) en la información disponible.
- Ejecución optimizada en NPUs Tensix (Wormhole, Blackhole) mediante TT-NN.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el modelo está empaquetado para ejecutarse en Wormhole y Blackhole con TT-NN, lo que permite servir un modelo de ~13B en hardware no-GPU con 8,15 GB de pesos en DRAM de dispositivo.
- Inferencia multimodal en el borde: al mantener visión y audio en bf16 y comprimir solo el LM, se puede desplegar un pipeline image-text-to-text en entornos con memoria de dispositivo ajustada.
- Prototipado de cuantización BFP4: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la integridad de la rejilla BFP4 y sirven como referencia para investigar cuantización de bloque en otros modelos.
- Generación de texto en lote sobre Tensix: la reducción de 23,81 GB a 8,15 GB libera memoria para KV cache y buffers, lo que facilita lotes mayores o contextos más largos en una sola NPU.
- Evaluación comparativa de fidelidad: útil para medir la degradación respecto a BF16 con métricas KL y top-1 sobre texto inglés y coreano antes de adoptar BFP4 en producción.
- Investigación en eficiencia energética: la combinación de BFP4 y NPUs Tensix es un banco de pruebas para estudiar el equilibrio entre precisión y coste computacional en transformers multimodales.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B`) | 16 | 23,81 | 0 | 100 | 27 de 28 | - |
| **Este modelo** | 5,47 | 8,146 | 0,07334 | 89,24 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,949 | 7,381 | 0,09127 | 87,90 | 25 de 28 | 0 |

Las métricas KL y top-1 se calculan sobre 8 184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos. El modelo supera el umbral fijado por el autor: KL media de 0,804 veces la de Q4_K_M y cero respuestas perdidas frente a cero. Estas cifras miden cercanía a BF16, no calidad de tarea, y no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 8,15 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix Wormhole y Blackhole; verificado en el simulador `ttsim` de Blackhole con `ttnn 0.81.1`.
- GPU consumer: no es el objetivo del checkpoint; no se documenta compatibilidad con CUDA ni con GPUs RTX.
- Despliegue: TT-NN (`ttnn`), con scripts `pack_tensix.py` y `verify_grid.py`; también es cargable con `transformers` (`AutoModelForCausalLM`) en bf16, aunque sin las ventajas de memoria del formato BFP4.
- `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bits | Tamaño | Licencia | Hardware objetivo |
|---|---|---|---:|---:|---|---|
| Este modelo | ~12,97 B | No disponible | BFP4 + bf16, 5,47 bits/peso | 8,146 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-12B` (BF16) | ~12,97 B | No disponible | BF16, 16 bits/peso | 23,81 GB | Apache 2.0 | GPU/CPU |
| Q4_K_M (llama.cpp) | ~12,97 B | No disponible | Q4_K_M, 4,949 bits/peso | 7,381 GB | Apache 2.0 | CPU/GPU |

La comparativa se limita al mismo modelo base en distintas precisiones, ya que no se dispone de datos de benchmarks de tarea frente a otros modelos de la categoría. El checkpoint de Xylolabs ofrece mejor fidelidad a BF16 que Q4_K_M (KL 0,073 frente a 0,091; top-1 89,24 % frente a 87,90 %) a costa de un tamaño ligeramente mayor y de requerir hardware Tensix para aprovechar el formato.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de los módulos de visión y audio en esta exportación no está documentado.
- Es el modelo preentrenado: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no es adecuado para diálogo directo sin un post-entrenamiento adicional.
- Las métricas publicadas miden fidelidad a BF16, no calidad de tarea; no hay benchmarks de MMLU, HumanEval o GSM8K en la información disponible.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos del modelo base no documentados en esta ficha.
- Idiomas soportados no declarados; la evaluación se limita a inglés y coreano.
- Longitud de contexto no disponible.
- La licencia Apache 2.0 se hereda del modelo base, cuyo repositorio no incluye fichero LICENSE; el autor añade el texto estándar y un NOTICE con los cambios.
- No afiliado ni respaldado por Tenstorrent; se distribuye "as is", sin garantía.
- El checkpoint no se ha probado con `tt-transformers` ni `tt-forge`, lo que limita su uso en esos stacks sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv): https://arxiv.org/abs/2607.02770
- Cita del modelo base: `@misc{gemmateam2026gemma4, title={Gemma 4 Tech...}}`
