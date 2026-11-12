# Xylolabs/Mistral-7B-Instruct-v0.3-Tensix-BFP4

## Resumen

Mistral-7B-Instruct-v0.3-Tensix-BFP4 es una versión cuantizada del modelo Mistral-7B-Instruct-v0.3 de Mistral AI, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). La cuantización se aplica exclusivamente a las capas lineales de atención (q, k, v, o) y del bloque MLP (gate, up, down) de las 32 capas del transformer, dejando en bf16 la cabeza LM, los embeddings y las normas. El formato empleado es `ttnn.bfloat4_b`, un block floating point de 4 bits por peso que TT-NN empaqueta directamente sin conversión adicional.

El modelo resuelve un problema muy concreto: permitir que un Mistral-7B Instruct se ejecute en hardware Tenstorrent con un peso empaquetado de 4,46 GB (frente a los 14,50 GB en bf16), manteniendo una calidad de generación cercana a la del modelo original. Según la evaluación del autor, la media de KL respecto a bf16 es de 0,03221 y la tasa de acierto top-1 es del 92,34 %, con 23 de 33 respuestas correctas frente a 25 de 33 del modelo base.

La relevancia actual del checkpoint es doble: por un lado, demuestra una ruta de cuantización GPTQ con búsqueda de exponente por bloque aplicada a block floating point; por otro, es uno de los pocos artefactos públicos preparados para el stack `tt-metal`/`ttnn` de Tenstorrent. Conviene señalar que las pruebas de ejecución se han realizado únicamente sobre `ttsim`, el simulador de Blackhole, y no sobre hardware físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B), capas lineales cuantizadas a BFP4 |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y gate/up/down; bf16 en LM head, embeddings y normas; media de 4,93 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4); fichero auxiliar `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only de 7,25 mil millones de parámetros. La modificación consiste en cuantizar con GPTQ las proyecciones lineales de atención y MLP de las 32 capas al formato `ttnn.bfloat4_b`, un block floating point de 4 bits con exponente compartido por bloque. La cuantización incorpora una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resto de tensores (embeddings, LM head, normas) permanece en bf16 tal como en el modelo base.

Los ficheros distribuidos están en bf16, pero cada valor ya se encuentra sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin pérdida adicional. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia tras el empaquetado. La integración con `tt-transformers` (tt-metal v0.81.1) requiere el flag `--use_hf_rope`; con esa configuración, todas las proyecciones de las dos primeras capas se empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0,9996. La ruta `tt-forge` (tt-xla) no se ha probado con este checkpoint.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas de Mistral-7B-Instruct-v0.3.
- Razonamiento, código y matemáticas en la medida en que lo soporta el modelo base de 7B.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer.
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) a través de TT-NN con `ttnn.bfloat4_b`.
- Compatibilidad con el stack `tt-metal`/`tt-transformers` y, potencialmente, `tt-forge` (no probado).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en aceleradores Tenstorrent: el checkpoint empaquetado ocupa 4,46 GB, lo que permite alojar el modelo completo en la DRAM de una NPU Tensix y servir respuestas de chat con la plantilla de Mistral.
- Prototipado e investigación en cuantización BFP4: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que la rejilla BFP4 se preserva bit a bit, útil para estudiar el impacto de block floating point en modelos de 7B.
- Evaluación de calidad post-cuantización: la tabla de evaluación con KL medio (0,03221) y top-1 (92,34 %) sirve como referencia para comparar contra Q4_K_M u otras recetas de cuantización.
- Integración en pipelines de `tt-metal`: el comando de `pytest` con `--use_hf_rope` y la configuración de precisión (`ff1_3: bfp4`, `ff2: bfp4`, `wqkv: bfp4`, `wo: bfp4`, `kv_cache: bfp8`) permite reproducir el demo de texto con batch 1.
- Sustitución de un Mistral-7B en bf16 en entornos con memoria limitada: al reducir el peso de 14,50 GB a 4,46 GB, se libera DRAM para caché KV y otros tensores.
- Base para comparativas de formatos de cuantización: el mismo checkpoint se empaqueta de forma exacta también en `ttnn.bfloat8_b`, lo que facilita comparar BFP4 frente a BFP8 sobre el mismo conjunto de pesos.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Mistral-7B-Instruct-v0.3) | 16 | 14,50 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP4) | 4,93 | 4,463 | 0,03221 | 92,34 | 23 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,02242 | 93,39 | 24 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.288 posiciones de texto en inglés y coreano. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: 4,46 GB empaquetados en BFP4; el repositorio completo ocupa 14,5 GB porque los tensores se distribuyen en bf16.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Pruebas realizadas: únicamente sobre `ttsim` (simulador de Blackhole) con `ttnn` 0.81.1; no se ha validado en hardware físico según la model card.
- GPU consumer: no es el objetivo del checkpoint; no se proporcionan estimaciones de VRAM para CUDA.
- Opciones de despliegue: `tt-metal` v0.81.1 con `tt-transformers` (`simple_text_demo.py`), `tt-forge`/`tt-xla` (no probado con este checkpoint), y carga en transformers con `dtype="bfloat16"` y `device_map="auto"` para inspección o verificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4) | 7,25 B | no disponible | BFP4 (4,93 bits/peso) | Apache 2.0 | Hugging Face, orientado a Tensix |
| Mistral-7B-Instruct-v0.3 (BF16) | 7,25 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.3 Q4_K_M (llama.cpp) | 7,25 B | no disponible | 4,83 bits/peso | Apache 2.0 | Hugging Face / GGUF |

La comparativa se limita al modelo base y a la cuantización Q4_K_M referenciada en la propia evaluación. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está diseñado para el stack TT-NN de Tenstorrent; su uso fuera de ese ecosistema requiere cargarlo en bf16 y pierde la ventaja de empaquetado.
- No se ha ejecutado en hardware Tensix físico: las pruebas se limitan al simulador `ttsim` de Blackhole con `ttnn` 0.81.1.
- La integración con `tt-forge` (tt-xla) no se ha probado con este checkpoint; su opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch.
- El demo de `tt-transformers` empaqueta la cabeza LM en `bfloat8_b`, por lo que la cabeza bf16 de este checkpoint no es exacta en ese flujo.
- Sin `--use_hf_rope`, el demo permuta las filas q y k y recuantiza el QKV fusionado, lo que altera los pesos.
- La cuantización introduce una degradación medible: KL medio de 0,03221 y top-1 del 92,34 % frente a bf16, con 2 respuestas menos correctas de 33.
- El calibrado GPTQ se realizó sobre WikiText-2 y Wikipedia en coreano; el comportamiento en otros dominios o idiomas no está caracterizado.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base Mistral-7B-Instruct-v0.3.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los scripts auxiliares del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tensix-BFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio `tt-metal` (rama v0.81.1): https://github.com/tenstorrent/tt-metal
