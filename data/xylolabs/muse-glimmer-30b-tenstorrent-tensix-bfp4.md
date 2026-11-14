# Xylolabs/Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4

## Resumen

Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Muse-Glimmer-30B (desarrollado por meta-models) realizada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El checkpoint mantiene la arquitectura original `muse_glimmer` con 29.776.626.688 parámetros y cuantiza únicamente las capas lineales del modelo de lenguaje (atención q/k/v/o, output gate y MLP gate/up/down en 52 capas) al formato `ttnn.bfloat4_b` (BFP4, block floating point de 4.5 bits por peso) mediante GPTQ, mientras que embeddings, LM head, normas, vision tower y vision adapter permanecen en bf16.

El interés del checkpoint es práctico: reduce el peso del modelo de lenguaje a 19,54 GB empaquetados (5,61 bits por peso de media), lo que permite cargar el modelo en memoria DRAM de NPUs Tenstorrent con un empaquetado exacto —los valores cuantizados se almacenan como bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterarlos—. Es un artefacto orientado a despliegue en hardware Tenstorrent, no un modelo nuevo, y su relevancia radica en habilitar inferencia de un modelo multimodal de 30B en hardware no-GPU con verificación bit a bit del empaquetado.

La licencia es Apache-2.0, heredada del modelo base, y el pipeline declarado es `image-text-to-text`. La model card advierte de que solo se cuantizó y evaluó el modelo de lenguaje, y que el demo de tt-metal para esta arquitectura no ha sido probado en una ejecución completa con este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | muse_glimmer (transformer multimodal, decoder de lenguaje + vision tower + vision adapter) |
| Parámetros totales | 29.776.626.688 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4.5 bits/peso) en capas lineales del LM; bf16 en el resto; media de 5,61 bits/peso |
| Idiomas soportados | no disponible (calibración GPTQ sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), empaquetado para TT-NN |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: es una cuantización GPTQ del modelo base meta-models/Muse-Glimmer-30B. La arquitectura `muse_glimmer` combina un decoder de lenguaje de 52 capas con un vision tower y un vision adapter para entrada image-text-to-text. La cuantización afecta a las proyecciones de atención (q, k, v, o), al output gate y a las proyecciones MLP (gate, up, down) de las 52 capas, que se almacenan en `ttnn.bfloat4_b` a 4,5 bits por peso. El LM head, los embeddings, las normas, el vision tower y el vision adapter se conservan en bf16 tal como en el modelo base.

El proceso de cuantización emplea GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El archivo `quant4.json` documenta el formato de cada proyección. Un detalle técnico relevante es que las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP4, de modo que el empaquetado en TT-NN es exacto (no hay pérdida adicional al cargar). El autor proporciona scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la igualdad bit a bit del empaquetado, y señala que los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se dispone de información sobre el entrenamiento original del modelo base (tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento image-text-to-text: acepta entradas de imagen y texto a través del vision tower y el vision adapter (en bf16).
- Carga nativa en transformers 5.x con la clase `MuseGlimmerForConditionalGeneration` o `AutoModelForImageTextToText` (no `AutoModelForCausalLM`), sin código remoto.
- Empaquetado e inferencia sobre NPUs Tenstorrent Tensix mediante TT-NN (`ttnn.bfloat4_b` y `ttnn.bfloat8_b`).
- Compatibilidad con el demo `muse_glimmer_30b` de tt-metal v0.81.1 con paralelismo tensorial (TP 4 sobre QuietBox 2 / Blackhole Galaxy, TP 4 u 8 sobre Galaxy).
- Soporte de tool calling, agentes, razonamiento multi-step o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (solo se documenta calibración con datos en inglés y coreano).

## Casos de uso

- Despliegue de un modelo multimodal de 30B en hardware Tenstorrent: el checkpoint está diseñado para cargarse en DRAM de NPUs Wormhole/Blackhole con 19,54 GB de pesos del LM, lo que permite servir inferencia image-text-to-text sin GPUs NVIDIA.
- Validación de pipelines de cuantización BFP4: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar bit a bit que el empaquetado TT-NN no altera los valores, útil para equipos que auditan flujos de cuantización.
- Investigación en formatos block floating point: sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque sobre 65.536 tokens y comparación entre BFP4 y BFP8 exactos.
- Prototipado de asistentes conversacionales con entrada de imagen: al conservar el vision tower en bf16, puede emplearse para tareas de descripción de imágenes o VQA en entornos con aceleradores Tenstorrent.
- Benchmarking de tt-metal: el demo oficial permite medir latencia y throughput del decoder de texto en configuraciones TP 4/8 sobre Blackhole, útil para planificar capacidad de clúster.
- Evaluación de la degradación por cuantización: al disponer del modelo base en bf16, permite comparar calidad de salida entre el original y la versión BFP4 en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de empaquetado: 19,54 GB de memoria de dispositivo para los pesos del LM, 5,61 bits por peso de media y verificación exacta del empaquetado en las proyecciones de las capas 0 y 3 con los packers TP 4 del demo.

## Requisitos de hardware

- VRAM/DRAM estimada: 19,54 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole); el demo de tt-metal se ejecuta en cuatro chips Blackhole (QuietBox 2, TP 4) o en Blackhole Galaxy (TP 4 u 8).
- GPU consumer: no es el objetivo del checkpoint; la carga en transformers requiere ~60 GB de repo y suficiente memoria para bf16, por lo que no cabe en GPUs consumer típicas.
- Despliegue: transformers 5.x (probado en 5.22.1, config guardada con 5.15.0.dev0), TT-NN 0.81.1 (verificado en ttsim, simulador Blackhole de Tenstorrent), demo tt-metal v0.81.1.
- tt-forge (tt-xla): no ejecutado con este checkpoint; por defecto mantiene los pesos en bf16 (información truncada en la model card).
- Latencia y throughput: no disponibles; la ejecución completa en cuatro chips no fue probada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4 | 29,78B | no disponible | BFP4 (4,5 bits/peso) | Apache-2.0 | Hugging Face, 48 descargas |
| meta-models/Muse-Glimmer-30B (base) | 29,78B | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (multimodal 30B para NPUs Tenstorrent) en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el vision tower y el vision adapter no fueron evaluados tras la cuantización.
- El demo de tt-metal empaqueta el LM head en bfloat8_b, por lo que el head en bf16 de este checkpoint no es exacto en ese entorno.
- La ejecución completa del demo requiere cuatro chips Blackhole y no fue probada por el autor; la verificación se limitó a ttsim y a las capas 0 y 3.
- tt-transformers no soporta la arquitectura `muse_glimmer`; es necesario usar el demo de tt-metal.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- Riesgo de degradación por cuantización a 4,5 bits/peso: no se publican evaluaciones de calidad (perplejidad, benchmarks) frente al modelo base.
- Idiomas soportados no documentados; la calibración GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base meta-models/Muse-Glimmer-30B.
- El repositorio ocupa 59,6 GB, lo que exige espacio de almacenamiento considerable para la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Muse-Glimmer-30B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal muse_glimmer_30b (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/muse_glimmer_30b
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
