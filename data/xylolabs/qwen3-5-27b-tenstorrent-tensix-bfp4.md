# Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-27B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.5-27B, desarrollada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de una cuantización genérica: el formato `bfloat4_b` (BFP4, punto flotante por bloques de 4,5 bits por peso) está pensado para que TT-NN lo empaquete sin pérdida de valores, de modo que el modelo resultante se ejecuta de forma nativa en hardware Tensix.

El modelo base Qwen3.5-27B es un transformer multimodal de tipo image-text-to-text con 27.781.427.952 parámetros, que combina capas de atención clásica con capas Gated DeltaNet (atención lineal) e incluye una torre de visión y un módulo MTP (multi-token prediction). La cuantización de Xylolabs reduce el peso de 53,79 GB en bf16 a 18,788 GB empaquetados para Tensix, manteniendo en bf16 el LM head, los embeddings, las normas, la torre de visión y el módulo MTP.

Su relevancia es doble: por un lado demuestra que es posible llevar un modelo de 27B multimodal a NPUs de Tenstorrent con una degradación de calidad medida y acotada (KL medio de 0,0254 frente al bf16); por otro, publica junto al modelo las herramientas de cuantización, empaquetado y verificación (`tensix-bfp-gptq`, `tensix-kernels`, `tensix-runner`), lo que permite reproducir y auditar el proceso completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas con Gated DeltaNet (atención lineal) y 16 capas con atención clásica; incluye torre de visión y módulo MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque; media de 5,59 bits por peso; LM head, embeddings, normas, visión y MTP en bf16; `A_log` y `norm.weight` de atención lineal en float32 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4); empaquetado para Tensix con TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-27B emplea una arquitectura híbrida en la que conviven 48 capas con Gated DeltaNet —un mecanismo de atención lineal con estado recurrente— y 16 capas con atención clásica, además de una torre de visión (`model.visual`) y un módulo de predicción multi-token (`mtp`). Los detalles sobre el volumen de tokens de entrenamiento, la composición del dataset y las fases de alineación (RLHF/DPO) del modelo original no están disponibles en la información proporcionada.

La contribución de Xylolabs es la cuantización: las proyecciones q/k/v/o de atención, las entradas y salidas q/k/v, z, a, b de las 48 capas Gated DeltaNet y las proyecciones gate/up/down del MLP (64 capas) se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores se conserva en bf16 o float32 tal como en el modelo base. Las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de forma que TT-NN las empaqueta sin alterar ningún valor; `quant4.json` documenta el formato de cada proyección. El proceso se validó con `pack_tensix.py` y `verify_grid.py` sobre ttsim con ttnn 0.81.1, y los mismos valores también se empaquetan exactamente en `ttnn.bfloat8_b`. Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el módulo MTP son los del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y modo thinking activable o desactivable (`enable_thinking`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), heredado de la torre de visión del modelo base en bf16.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado sobre 33 prompts fijos con respuesta conocida.
- Capacidad multilingüe limitada a inglés y coreano según los metadatos del modelo y el conjunto de calibración.
- Predicción multi-token (MTP) disponible a través del módulo del modelo base, aunque no cuantizado.
- Inferencia sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, además de ejecución estándar con transformers en bf16.
- Soporte de tool calling, function calling y flujos de agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo está empaquetado para ejecutarse en NPUs Wormhole y Blackhole con TT-NN, lo que permite servir un modelo de 27B multimodal en aceleradores Tensix con 18,788 GB de pesos en lugar de 53,79 GB en bf16.
- Evaluación de cuantizaciones de bajo bit en producción: sirve como referencia reproducible para comparar BFP4 (5,59 bits por peso) frente a Q4_K_M de llama.cpp (4,92 bits) en términos de KL y acierto, usando las herramientas publicadas.
- Asistentes conversacionales en inglés y coreano: el modelo conserva 39/40 respuestas correctas frente al bf16 en la comprobación del autor, lo que lo hace apto para atención al cliente o asistentes de dominio acotado en esos idiomas.
- Procesamiento de documentos con imagen y texto: al mantener la torre de visión en bf16, puede emplearse para tareas de image-text-to-text como descripción de capturas o extracción de información de documentos escaneados.
- Investigación en eficiencia de memoria: con 18,788 GB empaquetados, permite estudiar el equilibrio entre precisión y huella de memoria en modelos híbridos con Gated DeltaNet y atención clásica.
- Integración en pipelines de transformers: el código de ejemplo de la model card permite cargar el modelo con `AutoModelForImageTextToText` en bf16 y `device_map="auto"` para prototipado y validación antes de pasar a Tensix.
- Validación de kernels y formatos: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que ningún valor cambia al empaquetar, útil para equipos que desarrollan sobre tt-metal y ttnn.

## Benchmarks y rendimiento

Evaluación del autor sobre los pesos en host (no medidas en dispositivo); la velocidad no se reporta.

| Pesos | Bits por peso | Tamano (GB) | KL medio a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precision |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 53,79 | 0 | 100 | 39/40 | - | - |
| BFP4 (este modelo) | 5,59 | 18,788 | 0,0254 | 93,69 | 39/40 | 0 | pasado (1,33x KL; 0 perdidas frente a 0) |
| Q4_K_M (llama.cpp) | 4,92 | 16,547 | 0,0192 | 94,38 | 39/40 | 0 | referencia |

El KL medio se calcula como divergencia entre la distribución del siguiente token de cada modelo y la del bf16, promediada sobre posiciones de textos fijos en inglés y coreano. Top-1 mide la coincidencia del siguiente token más probable. La comprobación de respuestas usa 33 prompts fijos con respuesta conocida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,788 GB de pesos empaquetados para Tensix; en bf16 con transformers, aproximadamente 55,6 GB (tamaño del repo) más overhead de activaciones y caché KV.
- GPU recomendadas para ejecución en bf16 con transformers: A100 80 GB o H100 80 GB; en configuraciones multi-GPU mediante `device_map="auto"`.
- Cabe en GPU consumer: no de forma completa en bf16 en tarjetas de 24 GB; sería necesario reparto entre varias GPU o una cuantización adicional no incluida en este repo.
- Aceleradores objetivo: NPUs Tenstorrent Tensix Wormhole y Blackhole, con empaquetado mediante TT-NN.
- Opciones de despliegue: transformers (bf16, con `AutoModelForImageTextToText`), TT-NN con `pack_tensix.py` para empaquetado y `tensix-runner` v0.1.0 para ejecución en Tensix. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad y que todas las cifras son evaluaciones en host, nunca medidas en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | KL medio a bf16 | Licencia |
|---|---|---:|---|---:|---:|---|
| Qwen3.5-27B-Tenstorrent-Tensix-BFP4 | 27,78B | no disponible | BFP4, 5,59 bits | 18,788 GB | 0,0254 | apache-2.0 |
| Qwen3.5-27B (bf16) | 27,78B | no disponible | bf16, 16 bits | 53,79 GB | 0 | apache-2.0 |
| Qwen3.5-27B Q4_K_M (llama.cpp) | 27,78B | no disponible | Q4_K/Q6_K/F32, 4,92 bits | 16,547 GB | 0,0192 | apache-2.0 |

La comparación se limita a las tres variantes de pesos evaluadas por el autor sobre el mismo modelo base. No se dispone de datos de benchmarks estándar ni de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el módulo MTP son los del modelo base en bf16 y no han sido validados en esta cuantización.
- La evaluación se realizó en host, no en dispositivo Tensix: no hay medidas de latencia, throughput ni comportamiento en DRAM del acelerador.
- El KL medio a bf16 (0,0254) es un 33 % superior al de Q4_K_M de llama.cpp (0,0192), y el top-1 es inferior (93,69 % frente a 94,38 %), aunque el tamaño es mayor (18,788 GB frente a 16,547 GB).
- Los idiomas declarados son únicamente inglés y coreano; el rendimiento en castellano no está evaluado ni garantizado.
- La comprobación de respuestas se basa en 33 prompts fijos, una muestra reducida que no cubre dominios especializados.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los heredados del modelo base Qwen3.5-27B.
- Restricciones de licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-27B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-17; es un artefacto reciente sin validación comunitaria.
- El formato está acoplado a TT-NN: los valores están almacenados como bf16 sobre la rejilla BFP4 y el empaquetado sin pérdida se ha verificado con ttnn 0.81.1, por lo que cambios de versión del stack podrían afectar al flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio de cuantización tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-27B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
