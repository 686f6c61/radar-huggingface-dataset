# Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 12B IT Tenstorrent Tensix BFP8 es una exportación cuantizada del modelo multimodal `google/gemma-4-12B-it` de Google, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y las capacidades del original (pipeline `any-to-any`, con soporte de texto, imagen y audio), pero cuantiza las capas lineales de atención y MLP a `ttnn.bfloat8_b` (BFP8, block floating point) mediante GPTQ, dejando en bf16 la cabeza LM, los embeddings, las normas y los módulos de visión y audio.

El resultado es un checkpoint de unos 12.966 millones de parámetros que ocupa 13,60 GB empaquetado, con un promedio de 9,13 bits por peso, frente a los 23,81 GB del BF16 original. La motivación es práctica: permite cargar el modelo completo en una sola NPU Tenstorrent Blackhole P150, algo imposible con el checkpoint en bf16, manteniendo una degradación muy contenida (KL media de 0,00183 frente a BF16 y 98,35 % de top-1 en la evaluación del autor).

Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, TT-NN, tt-forge) está ganando tracción como alternativa de inferencia no-NVIDIA, y este tipo de exportaciones nativas para `bfloat8_b` son el paso necesario para que modelos de 12B con capacidades multimodales puedan desplegarse en hardware de inferencia dedicado con un coste energético y de memoria competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`), con módulos de visión y audio; atención y MLP cuantizados a `bfloat8_b` |
| Parametros totales | 12.966.363.184 (≈12,97B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en q, k, v, o, gate, up y down; bf16 en LM head, embeddings, normas y módulos de visión/audio; promedio de 9,13 bits por peso |
| Idiomas soportados | no disponible en la información proporcionada (la calibración usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con metadatos `quant4.json` y `model.safetensors.index.json` para el empaquetado en TT-NN |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any`: procesa y genera texto, imagen y audio. La exportación de Xylolabs mantiene la estructura completa del modelo (48 capas con proyecciones q, k, o, gate, up y down; 40 capas con proyección v) y solo cuantiza las matrices lineales de atención y MLP. Los tensores `embed_audio`, `embed_vision` y `vision_embedder` permanecen en bf16 sin cambios, al igual que la cabeza LM (atada al embedding) y todas las normas.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN, de modo que el empaquetado posterior no altera los valores. La calibración utilizó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El autor indica explícitamente que solo se cuantizó y evaluó el modelo de lenguaje. No se dispone de información sobre la composición del dataset de entrenamiento original ni sobre las fases de RLHF/DPO del modelo base en la información proporcionada.

La innovación técnica principal es la compatibilidad nativa con TT-NN: las matrices se almacenan como valores bf16 sobre la rejilla BFP8, de forma que `ttnn.as_tensor` las empaqueta sin pérdida adicional. El repositorio incluye scripts `pack_tensix.py` y `verify_grid.py` para verificar la integridad del empaquetado matriz a matriz.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat propia (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`) y pipeline `any-to-any`, heredado del modelo base Gemma 4.
- Procesamiento de audio mediante `embed_audio`, conservado en bf16.
- Capacidades de código y matemáticas del modelo base (no cuantificadas de forma diferencial; se mantienen las del original).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no detalladas; la calibración incluyó coreano, lo que sugiere cobertura al menos de inglés y coreano.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole P150: el checkpoint cabe en una sola tarjeta (13,60 GB de pesos más KV cache y buffers), lo que permite servir Gemma 4 12B en hardware no-NVIDIA con un solo dispositivo.
- Inferencia multimodal en el borde: al conservar visión y audio en bf16 y reducir el LM a BFP8, se puede ejecutar un modelo any-to-any en entornos con presupuesto de memoria ajustado, como servidores de una sola NPU.
- Sustitución del checkpoint BF16 en pipelines TT-NN existentes: el empaquetado exacto permite intercambiar el modelo sin recalibrar ni modificar el código de carga, usando la entrada correspondiente en `precision_overrides.json` del demo de tt-metal.
- Evaluación de precisión de cuantización: útil como referencia para estudiar el impacto de BFP8 con GPTQ frente a Q4_K_M en tareas de lenguaje, con métricas KL y top-1 publicadas.
- Prototipado de asistentes conversacionales con contexto multimodal: la ventana de contexto no está documentada, pero el modelo base admite conversaciones multi-turno con imagen y audio.
- Investigación en eficiencia de hardware: permite medir throughput y latencia de un modelo 12B multimodal en Tensix frente a GPU, con la ventaja de un formato de peso nativo para la NPU.
- Verificación de integridad de pesos cuantizados: los scripts incluidos (`pack_tensix.py`, `verify_grid.py`) sirven para auditar que el empaquetado no altera valores, un requisito habitual en entornos regulados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación del modelo de lenguaje, 8.048 posiciones de inglés y coreano en plantilla de chat; 33 prompts cortos con comprobación automática):

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-12B-it) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP8)** | 9,13 | 13,596 | 0,00183 | 98,35 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,60 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. El demo de tt-metal (v0.81.1) ejecuta E2B, E4B y 12B en una sola Blackhole P150.
- Verificación realizada por el autor con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- Para dispositivos con menos memoria, el autor recomienda la versión BFP4 (`Xylolabs/gemma-4-12B-it-Tenstix-BFP4`).
- GPU consumer: no es el objetivo del checkpoint; la carga vía `transformers` con `device_map="auto"` es posible en bf16, pero requeriría del orden de 24 GB o más, por lo que no cabe en GPUs de 16 GB sin cuantización adicional.
- Opciones de despliegue: TT-NN/tt-metal (nativo), tt-forge (tt-xla) —sin probar aún con Gemma 4 según el autor— y `transformers` para inspección o inferencia en GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Gemma 4 12B IT Tensix BFP8** | 12,97B | no disponible | BFP8, 9,13 bits/peso | Apache 2.0 | Hugging Face (80 descargas) |
| google/gemma-4-12B-it (BF16) | 12,97B | no disponible | BF16, 16 bits/peso | Apache 2.0 (según este repo) | Hugging Face |
| Q4_K_M de gemma-4-12B-it (llama.cpp) | 12,97B | no disponible | GGUF Q4_K_M, 4,95 bits/peso | Apache 2.0 | Hugging Face / llama.cpp |
| Gemma 4 12B IT Tensix BFP4 | 12,97B | no disponible | BFP4 | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de los módulos de visión y audio en este checkpoint no está verificado.
- La cuantización introduce una degradación medible: KL media de 0,00183 y top-1 del 98,35 % frente a BF16 (pérdida de 1,65 puntos porcentuales en top-1).
- La calibración GPTQ se realizó con WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios puede diferir.
- El checkpoint está pensado para TT-NN: fuera de ese ecosistema, el beneficio de tamaño se mantiene pero el empaquetado BFP8 no aporta ventajas de velocidad.
- tt-transformers no soporta Gemma 4 según el autor; es necesario usar el demo de tt-metal con la entrada adecuada en `precision_overrides.json`.
- tt-forge (tt-xla) no se ha probado con Gemma 4; sus opciones `bfp_bf8` y `bfp_bf4` recuantizan entre un 8 % y un 25 % de los valores en el layout `[out, in]` de PyTorch, lo que puede alterar la precisión.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; heredados del modelo base Gemma 4.
- Licencia Apache 2.0 según la model card, lo que permite uso comercial, pero conviene verificar los términos del modelo base de Google antes de desplegar en producción.
- Longitud de contexto e idiomas soportados no están documentados en la información disponible, lo que dificulta planificar despliegues con requisitos de ventana larga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Versión BFP4: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstix-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
