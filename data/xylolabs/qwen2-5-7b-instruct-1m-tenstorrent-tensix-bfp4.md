# Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4

## Resumen

Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen2.5-7B-Instruct-1M de Alibaba Qwen, adaptada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). La desarrolla Xylolabs y emplea formatos de coma flotante por bloques (block floating point, BFP) propietarios del stack Tensix: BFP4 para las proyecciones MLP y BFP8 para las proyecciones de atención, manteniendo el resto de tensores en bf16.

El modelo resuelve un problema de despliegue: reduce el peso de 15,23 GB en bf16 a 6,262 GB empaquetados para Tensix, lo que permite ejecutar un modelo de 7.600 millones de parámetros con contexto de hasta un millón de tokens en hardware de inferencia de bajo consumo. Frente a la alternativa estándar de llama.cpp Q4_K_M (4,683 GB), ofrece un tamaño algo mayor pero con una degradación de calidad medida y documentada.

Es relevante ahora porque el contexto de 1M tokens de la familia Qwen2.5-1M abre casos de uso de documentos largos, y esta variante demuestra que es viable empaquetar ese modelo en formatos nativos de NPU con pérdida de precisión controlada (KL media de 0,0345 frente a bf16, con un top-1 del 91,41 %). La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), cuantizado en formatos BFP para Tensix |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta variante (el modelo base Qwen2.5-7B-Instruct-1M soporta hasta 1M tokens) |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en proyecciones MLP; BFP8 (bfloat8_b) en proyecciones de atencion; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (segun la model card; la evaluacion incluye texto en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix; tamano del repo 15,2 GB, pesos empaquetados 6,262 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct-1M: un transformer decoder-only denso con 28 capas, atención con query/key/value/output por capa y un bloque MLP con proyecciones gate, up y down. Sobre esa base, Xylolabs aplica un esquema de cuantización por bloques específico de Tensix: las 28 capas cuantizan sus proyecciones MLP a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención se cuantizan a `bfloat8_b` por redondeo al más cercano. El LM head, los embeddings y todas las normas permanecen en bf16, igual que en el modelo base.

No se documenta en la información disponible el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO), más allá de que se trata de la variante Instruct-1M de Qwen2.5. La innovación técnica destacable de esta ficha es el empaquetado BFP: el fichero `quant4.json` lista el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` permiten verificar que cada matriz empaquetada se reconstruye exactamente al pasarla por el dispositivo (round-trip en DRAM) con ttnn 0.81.1 sobre el simulador Blackhole (ttsim). Los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), tal como demuestra el quickstart de la model card.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-7B-Instruct-1M.
- Contexto largo: el modelo base admite hasta 1M tokens; esta variante conserva la arquitectura, aunque la model card no documenta pruebas específicas de longitud de contexto tras la cuantización.
- Capacidades multilingües: la model card declara únicamente inglés, pero la evaluación incluye texto en coreano (Wikipedia en coreano), lo que sugiere cierto soporte más allá del inglés declarado.
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante ttnn, con kernels y runner propios (tensix-kernels, tensix-runner).
- Compatibilidad con `transformers` y `text-generation-inference` (tags de la ficha de Hugging Face).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión o audio para esta variante.

## Casos de uso

- Procesamiento de documentos largos en inglés: con el contexto de 1M tokens del modelo base, se puede ingerir un corpus extenso (contratos, informes, expedientes) en una sola pasada y generar resúmenes o extracciones sin troceado.
- Inferencia en hardware Tenstorrent: el empaquetado BFP4/BFP8 permite desplegar el modelo en NPUs Wormhole o Blackhole con 6,262 GB de pesos, útil en entornos donde no hay GPU NVIDIA y se quiere evitar el coste energético de una GPU dedicada.
- Asistente conversacional multi-turno: la plantilla de chat y el pipeline `text-generation` permiten integrarlo en aplicaciones de atención al cliente o asistentes internos con contexto acumulado.
- Evaluación y validación de pipelines de cuantización: las herramientas `pack_tensix.py` y `verify_grid.py` permiten comprobar la fidelidad de cada matriz empaquetada, lo que sirve como caso de uso de QA para equipos que desarrollan sus propias cuantizaciones BFP.
- Generación de texto en lote sobre NPU: el runner `tensix-runner` y los kernels `tensix-kernels` permiten automatizar la generación de respuestas o resúmenes en pipelines de procesamiento por lotes.
- Investigación en formatos de coma flotante por bloques: el modelo sirve como referencia reproducible para estudiar el compromiso entre tamaño (6,262 GB frente a 15,23 GB en bf16) y calidad (KL media 0,0345) en comparación con Q4_K_M de llama.cpp.
- Prototipado de aplicaciones de contexto largo en inglés: útil para validar ideas de recuperación y síntesis sobre documentos extensos antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de cuantización (KL y top-1 frente a bf16), no benchmarks de tareas estándar como MMLU o HumanEval.

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-7B-Instruct-1M) | 15,23 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,262 | 0,03451 | 91,41 |
| Q4_K_M (llama.cpp) | 4,683 | 0,03061 | 91,63 |

Las métricas de KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con la plantilla de chat. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/tamaño de pesos: 6,262 GB empaquetados para Tensix frente a 15,23 GB en bf16.
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole. La verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.
- GPU de consumo: no se documenta soporte de ejecución en GPU de consumo para este empaquetado; la carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"` requeriría memoria suficiente para los pesos en bf16 (15,23 GB), lo que excede la mayoría de GPU de consumo de 8-12 GB y encaja en tarjetas de 24 GB o más.
- Opciones de despliegue: ttnn (stack Tensix), `transformers`, `text-generation-inference` (según los tags de la ficha de Hugging Face). No se documenta soporte de vLLM, llama.cpp u Ollama para este empaquetado concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Calidad (KL media a BF16) | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Este modelo (BFP4/BFP8 Tensix) | 7,6 B | no disponible en esta variante (base: 1M) | 6,262 GB | 0,03451 | Apache 2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen2.5-7B-Instruct-1M (bf16) | 7,6 B | 1M | 15,23 GB | 0 | Apache 2.0 | GPU/NPU genéricos |
| Q4_K_M de llama.cpp (mismo checkpoint) | 7,6 B | 1M | 4,683 GB | 0,03061 | Apache 2.0 | CPU/GPU vía llama.cpp |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de tareas que permitan contrastar con otras familias. Frente a Q4_K_M, este empaquetado ocupa un 33,7 % más de espacio y su KL media es 1,13 veces mayor, pero está optimizado para ejecutarse en NPU Tensix, algo que Q4_K_M no cubre de forma nativa.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado; el uso en otros idiomas no está garantizado, aunque la evaluación incluya coreano.
- La cuantización introduce degradación medible: top-1 del 91,41 % frente al 100 % de bf16, y KL media de 0,03451, superior a la de Q4_K_M (0,03061).
- El empaquetado está diseñado para Tensix; no se documenta su uso en GPU o CPU convencionales, y la carga en `transformers` en bf16 requiere memoria para los pesos completos.
- Riesgo de alucinación inherente a los modelos de 7B, no cuantificado en la información disponible.
- Sesgos conocidos del modelo base no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero los cambios respecto al modelo base se detallan en el fichero `NOTICE`; conviene revisarlo antes de redistribuir.
- El modelo solo se ha verificado sobre el simulador ttsim (ttnn 0.81.1); no se documentan pruebas en hardware físico Wormhole o Blackhole en la información disponible.
- La fecha de creación de la ficha (2026-11-12) y la actualización (2026-11-27, renombrado desde BFP4-MLP) indican un proyecto reciente con pocas descargas (149) y sin likes, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5-1M: https://qwenlm.github.io/blog/qwen2.5-1m/
- Paper referenciado (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
