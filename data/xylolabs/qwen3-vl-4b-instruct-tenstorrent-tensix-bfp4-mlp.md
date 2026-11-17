# Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por Xylolabs y orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una redistribucion de pesos cuantizados con GPTQ y un esquema de exponente por bloque, pensada para que el modelo base de 4.437.815.808 parametros pueda ejecutarse en hardware de inferencia de bajo consumo energetico sin perder practicamente calidad respecto al original en bf16.

La innovacion principal es el uso combinado de formatos BFP4 y BFP8: las matrices del bloque MLP (gate, up y down en las 36 capas) se almacenan en `bfloat4_b` (4,5 bits por peso) y las proyecciones de atencion (q, k, v, o) en `bfloat8_b` (8,5 bits por peso), mientras que el embedding atado, la cabeza LM, las normalizaciones y la torre de vision se mantienen en bf16. El resultado es un modelo de 6,55 bits por peso de media en el language model, con un tamano empaquetado de 3,29 GB frente a los 8,04 GB en bf16.

El modelo es relevante ahora porque demuestra que es posible llevar un VLM de 4B a aceleradores especializados distintos de las GPU, manteniendo una divergencia KL media de 0,0282 respecto al bf16 y sin perder ninguna respuesta en las pruebas de evaluacion del autor. La licencia Apache 2.0 y la compatibilidad con `transformers` facilitan su adopcion tanto en entornos de investigacion como en despliegues de produccion sobre hardware Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision tower + language model, cuantizacion BFP4/BFP8 via GPTQ |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (BFP4, 4,5 bits/peso) en MLP; bfloat8_b (BFP8, 8,5 bits/peso) en atencion; bf16 en embedding atado, LM head, normas y torre de vision |
| Idiomas soportados | en, ko (segun la model card); el modelo base Qwen3-VL soporta mas idiomas, no detallados aqui |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla del formato); empaquetado para Tensix via TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un transformer multimodal que combina una torre de vision con un language model de 4B parametros y 36 capas. La cuantizacion realizada por Xylolabs aplica GPTQ con busqueda de exponente por bloque sobre las matrices del language model: el bloque MLP (gate, up, down) se cuantiza a BFP4 y las proyecciones de atencion (q, k, v, o) a BFP8. La calibracion se realizo sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El embedding atado, la cabeza LM, las normas y la torre de vision permanecen en bf16. Los tensores cuantizados se almacenan como valores bf16 situados sobre la rejilla del formato, de modo que TT-NN los empaqueta sin modificar sus valores.

La verificacion se llevo a cabo con las herramientas `tensix-bfp-gptq` v0.1.0, `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0, ejecutadas sobre ttsim con ttnn 0.81.1. Los scripts `tools/pack_tensix.py` y `tools/verify_grid.py` se incluyen sin cambios en el repositorio. No se detalla en la informacion proporcionada si el modelo base fue entrenado con RLHF, DPO u otras tecnicas de alineamiento, ni la composicion exacta del dataset de preentrenamiento.

## Capacidades

- Generacion de texto e inferencia multimodal image-text-to-text: acepta imagenes y texto en el mismo prompt y produce respuestas en lenguaje natural.
- Razonamiento visual: descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas de comprension de escenas.
- Conversacion multi-turno: pipeline `image-text-to-text` con plantilla de chat compatible con `transformers`.
- Capacidades multilingues limitadas a ingles y coreano segun la model card, aunque el modelo base Qwen3-VL soporta mas idiomas no listados aqui.
- Integracion con el ecosistema `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Despliegue en hardware Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado nativo de los formatos BFP4 y BFP8.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal en NPU Tensix: el modelo esta disenado para ejecutarse en Wormhole y Blackhole con TT-NN, lo que permite desplegar un VLM de 4B en aceleradores de bajo consumo energetico en lugar de GPU. Es adecuado porque el empaquetado BFP4/BFP8 reduce el peso del language model a 3,29 GB.
- Descripcion automatica de imagenes en entornos edge: con 3,29 GB empaquetados y una torre de vision en bf16, el modelo puede generar descripciones de una frase por imagen en pipelines de catalogacion o accesibilidad, como muestra el ejemplo de quickstart de la model card.
- Preguntas y respuestas sobre documentos escaneados: la combinacion de vision y language model permite extraer informacion de capturas, formularios o graficos, manteniendo la calidad del bf16 original segun las pruebas del autor (15 de 17 preguntas de imagen correctas).
- Prototipado de asistentes visuales en investigacion: la licencia Apache 2.0 y la compatibilidad con `transformers` permiten cargar el modelo con `AutoModelForImageTextToText` y evaluar variantes cuantizadas frente al bf16 sin infraestructura propietaria.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que permiten reproducir la comprobacion de que ningun valor cambia al empaquetar, util para investigadores que comparan BFP4/BFP8 con Q4_K_M.
- Despliegue en coreano e ingles: la calibracion incluye Wikipedia en coreano y las pruebas cubren textos en ambos idiomas, por lo que es adecuado para aplicaciones bilingues en esos dos idiomas.
- Integracion en pipelines de CI para validacion de modelos cuantizados: los scripts de verificacion y las metricas de KL permiten automatizar la comprobacion de que una nueva cuantizacion no degrada la distribucion de salida respecto al bf16.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluaciones en host, no en dispositivo; no se reporta velocidad):

| Pesos | Formatos | Bits/peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---|---:|---:|---:|---:|---:|---:|
| bf16 (original) | todo bf16 | 16,00 | 8,04 | 0 | 100 | 30/33 | - |
| BFP4-MLP (este modelo) | atencion bfloat8_b, MLP bfloat4_b; cabeza atada bf16 | 6,55 | 3,294 | 0,0282 | 93,04 | 30/33 | 0 |
| BFP4 | todas las proyecciones bfloat4_b; cabeza atada bf16 | 5,61 | 2,822 | 0,0417 | 91,57 | 29/33 | 1 |
| Q4_K_M (llama.cpp) | F32 145, Q4_K 216, Q6_K 37 (GGUF oficial de Qwen, sin imatrix) | 4,95 | 2,497 | 0,0401 | 91,09 | 28/33 | 1 |

La KL media se calcula como la divergencia KL de cada distribucion de siguiente token respecto al modelo bf16, promediada sobre las posiciones de textos fijos en ingles y coreano. Top-1 indica la frecuencia con la que ambos modelos eligen el mismo token. En preguntas de imagen, el modelo acierta 15 de 17 con la torre de vision en bf16, sin perdidas respecto al original.

## Requisitos de hardware

- VRAM estimada para inferencia: el language model empaquetado ocupa 3,29 GB en Tensix; los ficheros del repositorio ocupan 8,9 GB porque almacenan los valores cuantizados como bf16. En GPU con `transformers` se cargan como bf16, por lo que se requiere espacio equivalente al modelo bf16 (8,04 GB) mas overhead.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo esta orientado a NPU Tensix (Wormhole, Blackhole).
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el modelo esta pensado para Tensix, no para GPU consumer.
- Opciones de despliegue: `transformers` (con `AutoModelForImageTextToText`), TT-NN mediante `tensix-runner` v0.1.0 y empaquetado con `pack_tensix.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no se reportan mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4-MLP | 4.437.815.808 | no disponible | BFP4 MLP + BFP8 atencion, bf16 resto | apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (bf16) | 4.437.815.808 | no disponible | bf16 | apache-2.0 (segun modelo base) | Hugging Face |
| Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4 | 4.437.815.808 | no disponible | BFP4 en todas las proyecciones, bf16 cabeza | apache-2.0 | Hugging Face |
| Qwen3-VL-4B-Instruct GGUF Q4_K_M (llama.cpp) | 4.437.815.808 | no disponible | Q4_K_M (4,95 bits/peso) | apache-2.0 | Hugging Face / llama.cpp |

## Limitaciones y advertencias

- El modelo esta cuantizado especificamente para Tensix; fuera de ese hardware, los pesos se cargan como bf16 y se pierde la ventaja de tamano, ademas de que el rendimiento en GPU no esta verificado.
- Solo el language model fue cuantizado; la torre de vision permanece en bf16, por lo que el ahorro de memoria se limita al LM.
- Idiomas soportados declarados: en y ko. El rendimiento en otros idiomas del modelo base no esta documentado en esta variante.
- La calibracion se realizo sobre WikiText-2 y Wikipedia en coreano (65.536 tokens), lo que puede introducir sesgos de dominio en la cuantizacion para otros tipos de texto.
- La KL media de 0,0282 respecto al bf16 implica una divergencia no nula en la distribucion de tokens; en tareas de alta precision puede haber degradacion no capturada por las 33 preguntas de evaluacion.
- No se han publicado mediciones de velocidad, latencia ni throughput en dispositivo; las cifras de la model card son evaluaciones en host.
- Riesgo de alucinacion inherente al modelo base Qwen3-VL-4B-Instruct, no cuantificado en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-VL-4B-Instruct.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Variante BFP4 completa: https://huggingface.co/Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix-BFP4
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3-VL (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL (arxiv:2502.13923): https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL (arxiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arxiv:2308.12966): https://arxiv.org/abs/2308.12966
