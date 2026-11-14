# Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP

## Resumen

`Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP` es una cuantización del modelo multimodal `google/gemma-4-E2B-it` de Google, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la pila completa del original (torre de visión, torre de audio y modelo de lenguaje) pero cuantiza las proyecciones lineales del modelo de lenguaje a formatos de coma flotante por bloques propietarios de TT-NN: `bfloat4_b` (BFP4) para las capas MLP y `bfloat8_b` (BFP8) para las proyecciones de atención.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta práctica para desplegar un modelo any-to-any de 5.525.831.235 parámetros en hardware de inferencia no-GPU con un presupuesto de memoria de aproximadamente 6,80 GB solo para los pesos del modelo de lenguaje, frente a los 9,29 GB del checkpoint BF16 original. Por otro, la model card documenta con precisión el proceso de cuantización (GPTQ con búsqueda de exponente por bloque, calibración sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano) y publica una evaluación de degradación frente al BF16 (KL medio de 0,12669, top-1 del 86,22 %).

El resultado es una pieza de infraestructura más que un modelo nuevo: un artefacto de pesos empaquetados para TT-NN que mantiene la semántica numérica exacta del grid BFP4/BFP8 (los tensores se almacenan como bf16 sobre la rejilla, de modo que TT-NN los empaqueta sin alterar sus valores). La licencia Apache-2.0 y la compatibilidad con `transformers` facilitan la inspección, aunque el rendimiento real solo se materializa sobre silicio Tensix.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any): modelo de lenguaje Gemma 4 + torre de visión + torre de audio; proyecciones lineales cuantizadas a formatos BFP de TT-NN |
| Parámetros totales | 5.525.831.235 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en embeddings, LM head, normas, torre de visión y torre de audio; media de 11,70 bits/peso |
| Idiomas soportados | no disponible (calibración de cuantización sobre WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 11,1 GB; pesos empaquetados BFP4/BFP8 almacenados como bf16 sobre el grid, más metadatos `quant4.json` e índice de shards) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de tipo any-to-any que combina un modelo de lenguaje con torres de visión y audio. Esta exportación no reentrena el modelo: parte del checkpoint instruct original y aplica cuantización post-entrenamiento sobre las proyecciones lineales del modelo de lenguaje. Las capas MLP (gate, up y down en 35 capas) se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con una búsqueda de exponente por bloque; las proyecciones de atención (q, o en 35 capas; k, v en 15 capas) se cuantizan a `ttnn.bfloat8_b` mediante redondeo al más cercano (round to nearest). El resto de tensores —embeddings de token y por capa, LM head atado al embedding, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower`— permanecen en bf16 sin cambios.

La innovación técnica clave es el uso de coma flotante por bloques (block floating point) nativo de TT-NN: cada matriz cuantizada se almacena como valores bf16 situados sobre la rejilla BFP4 o BFP8, de forma que el empaquetado en la NPU Tensix no modifica los valores. La calibración de GPTQ emplea 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El repositorio incluye utilidades de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban matriz a matriz que el empaquetado es exacto, validadas con ttnn 0.81.1 sobre el simulador Blackhole (ttsim). Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio no fueron cuantizadas ni evaluadas.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo instruct Gemma 4 E2B.
- Procesamiento de imagen y texto (image-text-to-text) mediante la torre de visión, conservada en bf16.
- Procesamiento de audio mediante `audio_tower` y `embed_audio`, conservados en bf16.
- Pipeline any-to-any: entrada y salida multimodales según la definición del modelo base.
- Plantilla de chat (`apply_chat_template`) y formato de mensajes rol/contenido compatibles con `transformers`.
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante TT-NN y empaquetado BFP nativo.
- Compatibilidad con `AutoModelForCausalLM` y `device_map="auto"` para inspección en GPU/CPU en bf16.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole P150: el modelo encaja en el demo Gemma 4 de tt-metal v0.81.1, que ejecuta E2B, E4B y 12B en una sola tarjeta; esta exportación reduce el peso del modelo de lenguaje a 6,80 GB, liberando DRAM para caché KV y buffers.
- Investigación en cuantización BFP: sirve como referencia reproducible para estudiar el impacto de BFP4 en MLP frente a BFP8 en atención, con métricas de KL y top-1 publicadas frente al BF16.
- Validación de pipelines TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar que el empaquetado de matrices no altera valores, útil en CI de compiladores y runtimes para Tensix.
- Prototipado multimodal en entornos sin GPU: al cargarse con `transformers` en bf16, permite inspeccionar el comportamiento del modelo base antes de portarlo a hardware Tensix.
- Benchmarking de serving en hardware no-GPU: comparación de latencia y throughput de un modelo any-to-any de 5,5B parámetros en Tensix frente a alternativas en GPU.
- Base para cuantizaciones derivadas: el formato `quant4.json` y la separación por proyección facilitan experimentos con otras combinaciones de BFP4/BFP8 o calibraciones multilingües.
- Evaluación de robustez multilingüe: la calibración incluye coreano además de inglés, lo que permite estudiar el efecto de la cuantización en idiomas no ingleses.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 16 | 9,29 | 0 | 100 | 37 de 40 | - |
| Este modelo (BFP4 MLP + BFP8 atención) | 11,70 | 6,796 | 0,12669 | 86,22 | 38 de 40 | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada se limita a la comparación KL/top-1 frente al BF16 sobre un conjunto de 40 preguntas, y solo cubre el modelo de lenguaje.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 6,80 GB para los pesos del modelo de lenguaje empaquetados, más espacio para caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim); el demo de tt-metal Gemma 4 v0.81.1 ejecuta E2B en una Blackhole P150.
- GPU consumer: no es el objetivo del artefacto; los pesos pueden cargarse en bf16 con `transformers` y `device_map="auto"` para inspección, pero el rendimiento optimizado requiere Tensix.
- Despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`/`ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`), tt-metal (demo Gemma 4 v0.81.1) y tt-forge/tt-xla (sin soporte verificado para Gemma 4; por defecto mantiene bf16 exacto y su opción `bfp_bf4` recuantiza en layout `[out, in]` de PyTorch).
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este formato; el artefacto está orientado a TT-NN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B Tensix BFP4) | 5.525.831.235 | no disponible | BFP4 MLP + BFP8 atención, 11,70 bits/peso | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-E2B-it` (BF16) | 5.525.831.235 | no disponible | bf16, 16 bits/peso | Apache-2.0 (según este repo) | GPU/CPU genéricas |
| Gemma 4 E4B / 12B (demo tt-metal) | no disponible | no disponible | bf16 (sin opción bfloat4_b en el demo) | no disponible | Blackhole P150 |

La comparativa directa con otros modelos de 5-6B parámetros (p. ej. Qwen o Llama de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no han sido evaluadas en esta exportación.
- La degradación medida es de KL medio 0,12669 y top-1 del 86,22 % frente al BF16, sobre un conjunto de solo 40 preguntas; la muestra es pequeña y no permite extrapolar a tareas de código, matemáticas o agentes.
- El formato BFP4/BFP8 es específico de TT-NN; fuera de Tensix los pesos se cargan en bf16 y se pierde la ventaja de memoria y velocidad.
- tt-forge/tt-xla no se ha probado con Gemma 4; su opción `bfp_bf4` recuantiza en layout `[out, in]`, lo que puede alterar los valores respecto al grid original.
- El demo de tt-metal v0.81.1 no soporta `bfloat4_b`; sin entrada en `precision_overrides.json` los módulos cargan en bf16 (exacto), por lo que el ahorro de memoria no se materializa sin configuración adicional.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados del modelo base Gemma 4 E2B.
- Idiomas soportados: no disponibles; la calibración incluye inglés y coreano, lo que puede introducir sesgo de cuantización hacia esos idiomas.
- Licencia Apache-2.0 según el repositorio; conviene verificar los términos del modelo base de Google para uso comercial.
- Repositorio con 105 descargas y 0 likes en el momento de la consulta; ecosistema muy incipiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Gemma 4 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado: arxiv:2607.02770 (según tags del repositorio)
