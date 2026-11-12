# Xylolabs/gemma-4-26B-A4B-Tensix-BFP8

## Resumen

Gemma 4 26B-A4B Tensix BFP8 es una cuantización del modelo multimodal `google/gemma-4-26B-A4B` publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). No se trata de un modelo nuevo ni de un fine-tune: es el checkpoint original de Google con sus capas lineales (atención, MLP densa y expertos enrutados) cuantizadas a `ttnn.bfloat8_b` mediante GPTQ sobre la rejilla de coma flotante por bloques que utiliza el runtime TT-NN. El objetivo es permitir que el modelo se cargue directamente en hardware Tenstorrent sin conversión adicional en tiempo de ejecución.

El modelo conserva la arquitectura del base: un transformer con mezcla de expertos (MoE) de 26.544.133.710 parámetros totales, de los cuales solo una fracción se activa por token (el sufijo A4B indica aproximadamente 4.000 millones de parámetros activos). Mantiene las torres de visión en bf16 sin tocar, por lo que sigue siendo un modelo image-text-to-text. El repo ocupa 53,1 GB en disco, aunque los pesos empaquetados en BFP8 suman 27,51 GB, con un promedio de 8,72 bits por peso.

La relevancia es doble: por un lado, demuestra una ruta de cuantización pensada para un acelerador concreto (no para GPU), con verificación bit a bit contra la rejilla BFP8; por otro, publica una evaluación de degradación frente al BF16 original (KL media de 0,00268 y top-1 del 97,29 % sobre 8.184 posiciones). Es un artefacto de infraestructura más que un modelo de propósito general, y conviene tratarlo como tal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (image-text-to-text) |
| Parámetros totales | 26.544.133.710 |
| Parámetros activos | aproximadamente 4.000 millones (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en router, embeddings, normas, LM head y torre de visión |
| Idiomas soportados | no disponible (evaluación en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de Google, con 26.544 millones de parámetros totales y aproximadamente 4.000 millones activos por token. La cuantización de Xylolabs afecta a las 30 capas del modelo de lenguaje: las proyecciones q, k, v y o de atención, las proyecciones gate, up y down de la MLP densa, y las proyecciones gate, up y down de los expertos enrutados. También se cuantiza la proyección down de los expertos enrutados. El router por experto y el router global se mantienen en bf16, igual que el LM head (atado al embedding), las normas, el embedding y todos los tensores de visión (`embed_vision`, `vision_tower`).

La innovación técnica está en el método: GPTQ aplicado directamente sobre la rejilla `bfloat8_b` de TT-NN, preservando el exponente compartido por bloque tal y como lo fija el empaquetador de Tenstorrent. La calibración usó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los ficheros se distribuyen en bf16 con cada valor ya situado en la rejilla BFP8, de modo que TT-NN los empaqueta sin transformación. El resultado son 8,72 bits por peso de media y 27,51 GB empaquetados. No hay información sobre el entrenamiento original del base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y continuación de texto: el checkpoint es el modelo preentrenado, sin plantilla de chat.
- Comprensión de imagen y texto (`image-text-to-text`) gracias a la torre de visión conservada en bf16.
- Razonamiento y matemáticas: capacidades heredadas del base, evaluadas de forma parcial con 28 prompts cortos.
- Multilingüismo: evaluación en inglés y coreano; el resto de idiomas no está documentado.
- Mezcla de expertos con enrutado por token: activa aproximadamente 4.000 millones de parámetros por token.
- No se documenta soporte de tool calling, function calling ni modo thinking en la información disponible.
- No hay plantilla de chat incluida, por lo que el uso conversacional requiere aportar una plantilla externa.

## Casos de uso

- Despliegue en NPU Tenstorrent: cargar el modelo directamente en Wormhole o Blackhole con TT-NN 0.81.1 y el demo de Gemma 4 de tt-metal, usando los pesos ya empaquetados en BFP8 sin conversión adicional.
- Investigación en cuantización para aceleradores: usar el repo como referencia de GPTQ sobre rejilla de coma flotante por bloques, comparando la degradación medida (KL 0,00268) con otras estrategias como Q4_K_M de llama.cpp (KL 0,05678).
- Evaluación de precisión en hardware: ejecutar `pack_tensix.py` y `verify_grid.py` para verificar que cada matriz empaquetada coincide bit a bit con la rejilla BFP8 antes de desplegar en un clúster multi-chip.
- Prototipado multimodal en entornos Tenstorrent: aprovechar la torre de visión intacta en bf16 para tareas de imagen-texto sin reentrenar, asumiendo que el modelo es base y no instruct.
- Servicio de continuación de texto y generación de documentos largos: al ser un modelo preentrenado, encaja en pipelines de completado (autocompletado, generación de borradores) donde no se necesita formato conversacional.
- Benchmarking de infraestructura: usar el modelo como carga de trabajo representativa de 26B MoE para medir throughput y latencia en QuietBox 2, LoudBox o Wormhole T3K con paralelismo tensorial en cuatro u ocho chips.
- Validación de precisión multi-chip: comparar la salida en BF16 frente a BFP8 en las dos primeras capas simuladas para detectar regresiones antes de escalar a producción.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B) | 16 | 50,47 | 0 | 100 | 28 de 28 | - |
| **Este modelo (BFP8)** | 8,72 | 27,513 | 0,00268 | 97,29 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,05678 | 89,89 | 28 de 28 | 0 |

La evaluación de KL y top-1 cubre 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos. La columna "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la versión cuantizada. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 27,51 GB de pesos empaquetados en BFP8, más overhead de activaciones y caché KV no documentado.
- GPU recomendadas: no aplica de forma nativa; el modelo está pensado para NPU Tensix. En GPU requeriría al menos 28-32 GB de memoria para cargar los pesos empaquetados.
- Cabe en consumer GPU: no de forma holgada; una RTX 4090 (24 GB) no es suficiente para los 27,51 GB de pesos empaquetados.
- Opciones de despliegue: TT-NN 0.81.1 sobre Wormhole o Blackhole, con el demo de Gemma 4 de tt-metal (v0.81.1) en configuración tensor-parallel sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K. tt-transformers no soporta Gemma 4. tt-forge (tt-xla) no se ha probado con Gemma 4.
- Latencia y throughput: no disponibles. La verificación se realizó en `ttsim`, el simulador de Blackhole, no en hardware real.
- Nota: el demo de tt-metal no tiene entrada para este repositorio en `precision_overrides.json`, por lo que sin configurarlo carga todo en bf16; la entrada propuesta es `{"default": {"attention": "bfp8", "shared_mlp": "bfp8", "experts": "bfp8"}}`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 26,5B totales / ~4B activos | no disponible | BFP8 8,72 bits/peso | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B (BF16) | 26,5B totales / ~4B activos | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 26,5B totales / ~4B activos | no disponible | Q4_K_M 5,32 bits/peso | Apache 2.0 | Generado desde el mismo checkpoint |

La comparativa relevante es de precisión y tamaño, no de capacidades: los tres artefactos derivan del mismo checkpoint base. La versión BFP8 ocupa 27,51 GB y pierde 0,00268 de KL media frente a BF16, mientras que Q4_K_M ocupa 16,796 GB y pierde 0,05678. No se dispone de comparación con otros modelos de la misma categoría (otros MoE de ~26B) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo preentrenado: no incluye plantilla de chat y no está ajustado para seguir instrucciones.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión se mantiene en bf16 sin evaluación publicada.
- La verificación en hardware es limitada: se probó en `ttsim` (simulador de Blackhole) y solo en las dos primeras capas; el reparto multi-chip no se ejecutó.
- tt-transformers no soporta Gemma 4 y tt-forge no se ha probado con este modelo.
- Sin entrada en `precision_overrides.json`, el demo de tt-metal carga en bf16, lo que anula el beneficio de la cuantización.
- Riesgo de alucinación inherente al modelo base; no hay evaluación específica de sesgos en la información disponible.
- Idiomas soportados no documentados; la evaluación se limita a inglés y coreano.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google por si imponen condiciones adicionales.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en tags: arxiv:2607.02770 (no verificado en la información disponible)
