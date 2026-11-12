# Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp

## Resumen

Este repositorio contiene una versión cuantizada del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized`, adaptada específicamente para su ejecución en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en aplicar cuantización de bloque en coma flotante (block floating point, BFP) a las capas lineales del transformer, usando GPTQ para los tensores bfloat4_b y redondeo al más cercano para los bfloat8_b. El resultado es un checkpoint de 12.966.363.184 parámetros que ocupa 10,77 GB empaquetado, con una media de 7,23 bits por peso.

El modelo base es un Gemma 4 de 12B parámetros en variante instruct, multimodal (pipeline `any-to-any`, con torres de visión y audio), y este derivado conserva intactas las partes no lingüísticas en bf16. La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantización de precisión mixta orientada a hardware no-GPU; por otro, sirve como referencia para quienes necesiten desplegar modelos de 12B en NPUs de Tenstorrent con pérdida de calidad controlada. La evaluación publicada muestra una KL media de 0,03348 frente a BF16 y un 92,88 % de top-1, con 39 de 40 respuestas correctas en un conjunto de pruebas cortas.

La licencia es Apache 2.0, lo que facilita el uso comercial, aunque conviene revisar las condiciones del modelo base original de Google. El checkpoint se ha validado únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en hardware físico, y no se ha probado con tt-transformers ni tt-forge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), con torres de visión y audio; cuantización BFP en capas lineales |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) y BFP8 (bfloat8_b) por bloques; media de 7,23 bits por peso; tensores restantes en bf16 |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con tensores almacenados en la rejilla BFP4/BFP8 como valores bf16; índice en `model.safetensors.index.json` y mapa de formatos en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma 4 en variante instruct, con 48 capas y componentes multimodales (embedding de visión, embedding de audio y vision_embedder). Sobre esa base, Xylolabs aplica una cuantización selectiva por tipo de proyección: las matrices q, k, o y v de atención se almacenan en bfloat8_b (8,5 bits por peso), al igual que las proyecciones down del MLP; las proyecciones gate y up del MLP se cuantizan a bfloat4_b (4,5 bits por peso) con GPTQ y búsqueda de exponente por bloque. El resto de tensores (embedding, LM head atada, normas, torres de visión y audio) permanece en bf16 sin cambios.

El calibrado de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, y los tensores bfloat8_b se obtuvieron por redondeo al más cercano. El checkpoint resultante pesa 10,77 GB empaquetado y conserva los valores exactos en la rejilla BFP, de modo que TT-NN puede empaquetarlos sin alterar los números, tal como verifica el script `pack_tensix.py`. No se menciona en la información disponible ningún entrenamiento adicional, ajuste fino ni etapa de RLHF/DPO específica para este derivado; se trata exclusivamente de un proceso de cuantización post-entrenamiento sobre el checkpoint de Google.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat (`apply_chat_template`).
- Razonamiento de varios pasos, con soporte de modo "thinking" según la evaluación publicada (7 de las 40 pruebas se repiten con thinking activado).
- Procesamiento multimodal any-to-any: el pipeline declarado es `any-to-any` y se conservan los módulos `embed_audio`, `embed_vision` y `vision_embedder` en bf16.
- Capacidades multilingües, al menos inglés y coreano según el conjunto de evaluación (WikiText-2 y Wikipedia en coreano); no se detalla la lista completa de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por el modo thinking, sin documentación específica de orquestación de agentes.
- Ejecución en NPUs Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo a bfloat4_b y bfloat8_b.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole a través de TT-NN, con tensores ya en la rejilla BFP que el runtime empaqueta sin transformación. Es el escenario principal del repositorio.
- Inferencia multimodal en entornos con restricciones de memoria: al conservar visión y audio en bf16 y comprimir el LM a 7,23 bits por peso, permite ejecutar un modelo de 12B con torres multimodales en un presupuesto de ~11 GB de pesos.
- Asistentes conversacionales con contexto largo: el modelo base es instruct y soporta plantilla de chat; útil para atención al cliente o asistentes internos, siempre que se valide la longitud de contexto real del modelo base (no disponible aquí).
- Razonamiento asistido con modo thinking: para tareas de análisis, resolución de problemas o generación de explicaciones paso a paso, activando el modo de razonamiento que la evaluación cubre con 7 pruebas específicas.
- Procesamiento de documentación en inglés y coreano: el calibrado y la evaluación incluyen coreano, lo que lo hace adecuado para flujos bilingües en esos idiomas.
- Investigación en cuantización BFP: el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) y un mapa `quant4.json` que permiten reproducir y auditar la cuantización, útil para estudiar el impacto de BFP4/BFP8 en calidad.
- Prototipado en simulador: validado en `ttsim` (simulador de Blackhole), sirve para desarrollar pipelines antes de disponer de hardware físico.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| Este modelo | 7,23 | 10,765 | 0,03348 | 92,88 | 39 de 40 | 0 |
| Q4_0 (llama.cpp) | 4,68 | 6,976 | 0,03254 | 93,14 | 33 de 33 | 0 |

La KL y el top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática, más 7 de razonamiento repetidos con thinking activado (40 en total); la fila de Q4_0 solo contabiliza los 33. "Perdidas" indica respuestas correctas en BF16 que fallan o se rompen en el modelo cuantizado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 10,77 GB de pesos empaquetados en BFP; en BF16 para comparación, 23,81 GB. El repo completo ocupa 26,0 GB.
- GPU recomendadas: no aplica de forma nativa; el destino son NPUs Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecución en GPU vía transformers se puede cargar con `dtype="bfloat16"` y `device_map="auto"`, requiriendo al menos ~24 GB de memoria para el modelo completo en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) si se carga en bf16; en el formato BFP empaquetado el peso baja a ~11 GB, aunque el runtime de referencia es TT-NN.
- Opciones de despliegue: TT-NN (ttnn 0.81.1, probado en ttsim), transformers con safetensors; tt-transformers y tt-forge no se han probado con este checkpoint. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La validación se hizo en simulador, no en hardware, por lo que no hay cifras reales de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 12,97B | no disponible | BFP4/BFP8 mixto, 7,23 bits/peso | Apache 2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-12B-it-qat-q4_0-unquantized (base) | 12,97B | no disponible | bf16 (sin cuantizar) | Apache 2.0 | Hugging Face |
| Q4_0 generado con llama.cpp v0.9.0 | 12,97B (mismo base) | no disponible | Q4_0, 4,68 bits/peso | Apache 2.0 (heredada) | Generado localmente, sha256 publicado |

La comparación directa con otras alternativas de la misma categoría (por ejemplo, otros Gemma 4 de 12B o modelos de tamaño similar en formato GGUF) no está disponible en la información proporcionada. Los únicos puntos de referencia son el modelo base en BF16 y la cuantización Q4_0 de llama.cpp, ambos incluidos en la tabla de evaluación del autor.

## Limitaciones y advertencias

- Solo se ha validado en el simulador `ttsim` (Blackhole) con ttnn 0.81.1; no hay pruebas en hardware Tensix físico.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, por lo que la integración con esos stacks no está garantizada.
- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de las torres de visión y audio en este derivado no está documentado.
- La evaluación se limita a 8.048 posiciones de texto y 40 respuestas cortas; no cubre benchmarks estándar ni tareas largas, por lo que el impacto en producción puede ser mayor que el reportado.
- La pérdida de calidad frente a BF16 es medible: KL media de 0,03348 y top-1 del 92,88 %, con una respuesta perdida de 40.
- Riesgo de alucinación inherente al modelo base; no se documenta mitigación específica en este derivado.
- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse sobre el modelo base de Google.
- Idiomas: solo se documentan inglés y coreano en la evaluación; el resto de idiomas no está verificado.
- Licencia Apache 2.0 en este repositorio, pero conviene verificar las condiciones del modelo base de Google para uso comercial y atribución.
- El calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano; dominios muy distintos (código, matemáticas, lenguas no cubiertas) pueden degradarse más de lo que indica la evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tensix-BFP4-GateUp/blob/main/LICENSE
