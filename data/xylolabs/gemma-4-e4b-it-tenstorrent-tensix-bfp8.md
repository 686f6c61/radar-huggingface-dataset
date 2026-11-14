# Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP8` es una exportación cuantizada del modelo multimodal `google/gemma-4-E4B-it`, publicada por Xylolabs y optimizada para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización se aplica exclusivamente a las capas lineales del modelo de lenguaje mediante GPTQ sobre la rejilla block-floating-point `bfloat8_b` (BFP8) de TT-NN, mientras que embeddings, normas, LM head y las torres de visión y audio permanecen en bf16 sin modificar.

El modelo base es un transformer multimodal any-to-any de la familia Gemma 4, con 8.667.245.130 parámetros totales según los pesos en safetensors del repositorio. El interés de esta exportación radica en que los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetador de TT-NN los carga sin alterar sus valores: la cuantización es "exacta" en el sentido de que el redondeo ya se hizo en el momento de la exportación y el hardware no vuelve a redondear.

El resultado es un modelo que ocupa 11,34 GB empaquetado (12,06 bits por peso de media) y que, según la evaluación del autor, mantiene una divergencia KL media de 0,00169 frente al BF16 original y una coincidencia top-1 del 98,12 %, perdiendo cero respuestas correctas en el conjunto de 40 preguntas utilizado. Es relevante para quien despliegue Gemma 4 en hardware Tenstorrent y necesite reducir el consumo de memoria de dispositivo sin degradar la calidad de forma apreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4), con torres de visión y audio; capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en proyecciones de atención y MLP); resto en bf16; existe variante BFP4 publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetables a `ttnn.bfloat8_b` para TT-NN |
| Tamano del repo | 17,4 GB |
| Memoria de dispositivo requerida | ~11,34 GB solo para pesos del LM, mas KV cache y buffers |
| Bits por peso (media LM) | 12,06 |
| Modelo base | google/gemma-4-E4B-it |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 con 42 capas en las que se cuantizan las proyecciones de atención q, o y las MLP gate, up y down, y 24 capas en las que se cuantizan también k y v. Las proyecciones cuantizadas usan `bfloat8_b` a 8,5 bits por peso; el embedding (atado con la LM head), las normas y todos los demás tensores permanecen en bf16 a 16 bits por peso, lo que eleva la media global del modelo de lenguaje a 12,06 bits por peso. Las torres `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio` se conservan íntegramente en bf16.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador, y se calibró con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor indica explícitamente que solo se cuantizó y evaluó el modelo de lenguaje. El fichero `quant4.json` documenta el formato asignado a cada proyección. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

La innovación técnica principal es el empaquetado sin pérdida adicional: como los pesos cuantizados ya viven en la rejilla BFP8 pero se almacenan como bf16, TT-NN los empaqueta sin recalcular valores. El autor proporciona `pack_tensix.py` para verificar matriz a matriz que ningún valor cambia y `verify_grid.py` para comprobar la rejilla solo con torch.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Gemma 4 E4B instruct.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante la torre de visión conservada en bf16.
- Procesamiento de audio mediante la torre de audio conservada en bf16, dentro del pipeline `any-to-any`.
- Soporte de plantilla de chat instructiva (`apply_chat_template`) para diálogo con roles.
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó coreano, pero no se documenta la cobertura idiomática).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, decodificación especulativa u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de Gemma 4 en aceleradores Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede cargar este checkpoint en TT-NN y ejecutar el modelo de lenguaje con 11,34 GB de DRAM de dispositivo, evitando el coste de memoria del BF16 (15,04 GB) sin recalcular la cuantización en el dispositivo.
- Despliegue multimodal en el borde: al conservar las torres de visión y audio en bf16 y reducir solo el LM, el modelo sirve para aplicaciones any-to-any (descripción de imágenes, transcripción con contexto textual) en un único dispositivo Blackhole P150, que el demo de tt-metal valida para E2B, E4B y 12B.
- Evaluación de pipelines de cuantización: el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que permiten a un ingeniero de MLOps comprobar que el empaquetado no altera valores antes de desplegar en producción.
- Sustitución directa de BF16 en servidores Tensix con restricción de memoria: con una divergencia KL media de 0,00169 y 98,12 % de coincidencia top-1, es adecuado para tareas donde el BF16 no cabe pero se exige fidelidad alta, como resumen o generación asistida.
- Investigación en formatos block-floating-point: sirve como referencia reproducible de GPTQ sobre rejilla BFP8 con calibración multilingüe (WikiText-2 + Wikipedia coreana) para estudiar el impacto del redondeo por bloques.
- Prototipado de asistentes conversacionales con contexto largo: el modelo base E4B está pensado para diálogo instructivo; este export permite levantar el servicio en hardware Tenstorrent con la plantilla de chat estándar de transformers.
- Integración en flujos de CI que validen checkpoints cuantizados: los scripts de verificación permiten añadir una etapa que confirme, matriz a matriz, que el checkpoint empaquetado es idéntico al exportado.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E4B-it) | 16 | 15,04 | 0 | 100 | 36 de 40 | - |
| Este modelo (BFP8) | 12,06 | 11,337 | 0,00169 | 98,12 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,66 | 5,335 | 0,19989 | 81,05 | 36 de 40 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La tabla anterior recoge únicamente las métricas de fidelidad de cuantización publicadas por el autor.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,34 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. El autor recomienda la versión BFP4 en dispositivos con menos memoria.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. El demo de tt-metal v0.81.1 ejecuta E2B, E4B y 12B en una única Blackhole P150.
- GPU consumer: no es el objetivo del export; el checkpoint puede cargarse en transformers con `device_map="auto"` en bf16, pero el repositorio de 17,4 GB no cabe en GPUs de 16 GB y requiere al menos ~18-20 GB para cargar en bf16 (estimación a partir del tamaño del repo; no confirmada por el autor).
- Opciones de despliegue: TT-NN (ttnn 0.81.1, verificado en el simulador ttsim de Blackhole), tt-metal (demo de Gemma 4), tt-forge/tt-xla (no probado aún con Gemma 4), y transformers con `AutoModelForCausalLM` para inspección o inferencia en bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 8.667.245.130 | no disponible | safetensors, 12,06 bits/peso | 11,34 GB dispositivo | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it (BF16) | 8.667.245.130 | no disponible | safetensors, 16 bits/peso | 15,04 GB | Apache 2.0 (segun este repo) | Hugging Face |
| Xylolabs/gemma-4-E4B-it-Tensix-BFP4 | 8.667.245.130 | no disponible | BFP4 | menor que BFP8 (no cuantificada) | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 8.667.245.130 | no disponible | GGUF, 5,66 bits/peso | 5,335 GB | Apache 2.0 | llama.cpp |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de las torres de visión y audio en este export no está documentado más allá de que se conservan en bf16.
- La evaluación publicada es reducida: 40 preguntas, KL media y top-1. No sustituye a una batería de benchmarks estándar.
- El checkpoint está pensado para TT-NN sobre Tensix; cargarlo en transformers devuelve pesos en bf16 sobre rejilla BFP8, no una cuantización de 8 bits real, por lo que el ahorro de memoria solo se materializa al empaquetar en el dispositivo.
- tt-transformers no soporta Gemma 4; es necesario usar el demo de tt-metal o tt-forge, y tt-forge aún no se ha probado con este modelo.
- La calibración de GPTQ se hizo con WikiText-2 y Wikipedia en coreano; el comportamiento en otros dominios o idiomas no está evaluado.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; se heredan los del modelo base Gemma 4 E4B.
- Licencia Apache 2.0 según la model card y las etiquetas del repositorio; conviene verificar las condiciones del modelo base Google antes de uso comercial.
- El autor advierte que en tt-metal, sin entrada en `precision_overrides.json`, todos los módulos se cargan en bf16 (exacto); para aprovechar el empaquetado BFP8 hay que añadir la entrada correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tensix-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
