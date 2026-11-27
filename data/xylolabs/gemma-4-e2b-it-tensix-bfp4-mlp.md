# Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP

## Resumen

Gemma 4 E2B IT Tensix BFP4 MLP es una cuantización del modelo multimodal `google/gemma-4-E2B-it` realizada por Xylolabs y empaquetada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la torre de visión, la torre de audio y el pipeline `any-to-any` del original, pero comprime las proyecciones MLP a `bfloat4_b` (BFP4) y las proyecciones de atención a `bfloat8_b` (BFP8), manteniendo en bf16 el LM head, los embeddings, las normas y los módulos multimodales. El resultado ocupa 6,796 GB empaquetado frente a los 9,29 GB en bf16.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo práctico de cuantización con formato de coma flotante por bloques (block floating point) orientada a hardware acelerador no-GPU, un nicho que gana peso a medida que Tenstorrent despliega sus tarjetas. Por otro, el autor publica una comparación de fidelidad frente a bf16 y frente a una cuantización Q4_K_M de llama.cpp, con métricas de divergencia KL y top-1, lo que permite evaluar la pérdida de calidad de forma cuantitativa.

El modelo base tiene 5.525.831.235 parámetros totales según los safetensors del repositorio, y el pipeline declarado es `any-to-any`, lo que implica entrada y salida multimodales (texto, imagen y, por los módulos presentes, audio). La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con torres de visión y audio; cuantización BFP para Tensix |
| Parámetros totales | 5.525.831.235 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLP en `bfloat4_b` (BFP4) con GPTQ y búsqueda de exponente por bloque; atención en `bfloat8_b` (BFP8) por redondeo al más cercano; LM head, embeddings, normas y módulos multimodales en bf16 |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`); empaquetado Tensix de 6,796 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `google/gemma-4-E2B-it`, no un entrenamiento desde cero. La arquitectura subyacente es un transformer multimodal de Gemma 4 con 35 capas en el modelo de lenguaje, torre de visión (`vision_tower`, `embed_vision`), torre de audio (`audio_tower`, `embed_audio`) y LM head atado a los embeddings. Las proyecciones de atención de 35 capas (q, o) y de 15 capas (k, v) se almacenan en `bfloat8_b`; las proyecciones MLP (gate, up, down) de las 35 capas se almacenan en `bfloat4_b`. El resto de tensores permanece en bf16 como en el modelo base.

La innovación técnica está en el proceso de cuantización: los tensores BFP4 se obtuvieron con GPTQ y una búsqueda de exponente por bloque, mientras que los BFP8 usaron redondeo al más cercano. El autor publica el código de cuantización y empaquetado (`tensix-bfp-gptq`, con `tools/pack_tensix.py` y `tools/verify_grid.py` incluidos en el repo), así como kernels y runner para Tensix (`tensix-kernels` y `tensix-runner`, versión 0.1.0). La verificación se realizó con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; no se documenta una ejecución en silicio real en la información disponible. No se detallan datos de entrenamiento, número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base instruido.
- Procesamiento de imagen a texto (`image-text-to-text`) mediante `vision_tower` y `embed_vision`.
- Procesamiento de audio mediante `audio_tower` y `embed_audio`, según los módulos presentes en el checkpoint.
- Pipeline `any-to-any`, lo que permite combinaciones de entrada y salida multimodales.
- Plantilla de chat compatible con `apply_chat_template` de transformers.
- Inferencia en GPU/CPU mediante transformers con `dtype="bfloat16"` y `device_map="auto"`.
- Despliegue en NPU Tensix (Wormhole, Blackhole) mediante `ttnn`, con empaquetado directo de matrices a `bfloat4_b` y `bfloat8_b`.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en tarjetas Tenstorrent: el modelo está empaquetado para Wormhole y Blackhole, de modo que se puede servir imagen-texto y audio-texto en NPU sin GPU, aprovechando los 6,796 GB empaquetados frente a 9,29 GB en bf16.
- Despliegue en entornos con restricciones de memoria: la reducción de tamaño permite alojar el modelo en aceleradores con DRAM limitada, manteniendo una divergencia KL de 0,1267 frente a bf16, mejor que la de Q4_K_M (0,2933).
- Prototipado de asistentes conversacionales multimodales: la plantilla de chat y el pipeline `any-to-any` permiten construir un asistente que reciba texto e imagen y responda en lenguaje natural usando transformers.
- Evaluación de pipelines de cuantización: el repositorio incluye `pack_tensix.py` y `verify_grid.py`, útiles para validar el empaquetado de matrices y comparar fidelidad de formatos BFP frente a bf16.
- Investigación en formatos block floating point: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en proyecciones MLP y BFP8 en atención sobre la calidad de un modelo multimodal.
- Integración en flujos de transcripción y descripción de audio o imagen: los módulos `audio_tower` y `vision_tower` en bf16 permiten tareas de captioning o respuesta a preguntas sobre contenido multimedia.
- Base para ajuste fino o destilación sobre hardware Tensix: al conservar la estructura del modelo base y una licencia Apache 2.0, se puede partir de este checkpoint para experimentos posteriores.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 9,29 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,796 | 0,12669 | 86,22 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

Las métricas de KL y top-1 cubren 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. La comparación Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `fd8eb490a907ff085938760a39fac78eaebc43a9ce3963492f6261fde3931c04`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 11 GB de pesos (9,29 GB de pesos bf16 más overhead de activaciones y caché KV).
- VRAM estimada con el empaquetado Tensix: 6,796 GB de pesos, más overhead de runtime.
- GPU recomendadas para ejecución vía transformers: no especificadas por el autor; por tamaño, una GPU con 16 GB o más de memoria (RTX 4090, A100 40 GB, H100) es suficiente para bf16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM para bf16; no se documentan requisitos para cuantizaciones adicionales distintas de BFP.
- Despliegue en NPU: Tenstorrent Wormhole y Blackhole mediante `ttnn` (probado con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole).
- Opciones de despliegue documentadas: transformers (`AutoModelForCausalLM`, `device_map="auto"`), `ttnn` para Tensix y las herramientas `tensix-kernels` y `tensix-runner` v0.1.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E2B IT Tensix BFP4) | 5.525.831.235 | no disponible | BFP4 MLP / BFP8 atención, 6,796 GB | Apache 2.0 | Hugging Face |
| `google/gemma-4-E2B-it` (bf16) | 5.525.831.235 | no disponible | bf16, 9,29 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 5.525.831.235 | no disponible | Q4_K_M, 3,428 GB | Apache 2.0 | Generado por el autor |

La comparativa se limita al mismo checkpoint en distintos formatos, ya que la información proporcionada no incluye otros modelos de la misma categoría. Frente a bf16, este modelo reduce el tamaño un 26,8 % con una KL media de 0,1267; frente a Q4_K_M, ocupa casi el doble de espacio pero reduce la KL a 0,43 veces y mejora el top-1 en 5,97 puntos.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: top-1 del 86,22 % frente al 100 % de bf16 en las posiciones evaluadas.
- La evaluación de fidelidad solo cubre inglés y coreano y 7.968 posiciones; no hay datos para otros idiomas ni para tareas multimodales.
- No se documenta ejecución en hardware Tensix real, solo en el simulador `ttsim` con `ttnn` 0.81.1; el rendimiento en silicio no está verificado en la información disponible.
- El repositorio no incluye un archivo LICENSE original del modelo base; el autor indica que el suyo contiene el texto estándar de Apache 2.0 y que los cambios se listan en `NOTICE`.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base, sobre los que la información disponible no aporta detalles.
- Longitud de contexto e idiomas soportados no están declarados en la model card.
- El uso comercial está permitido por la licencia Apache 2.0, pero conviene verificar las condiciones del modelo base `google/gemma-4-E2B-it`.
- El formato de pesos es específico para Tensix; para otros backends hay que usar el checkpoint base o generar una cuantización propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
