# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una conversión de pesos que aplica block floating point (BFP) selectivo: las proyecciones gate y up del MLP se cuantizan a `bfloat4_b` (BFP4) mediante GPTQ, mientras que la atención y la proyección down del MLP se mantienen en `bfloat8_b` (BFP8) por redondeo al más cercano. El resultado ocupa 13,756 GB empaquetados, frente a los 29,54 GB del checkpoint BF16 original.

El modelo resuelve un problema de despliegue: ejecutar un LLM de 14.770 millones de parámetros en hardware Tensix con un formato nativo de la NPU, evitando conversiones en tiempo de ejecución. La relevancia actual radica en que el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge) necesita checkpoints preempaquetados y verificados para que los kernels funcionen sin recompilación ni ajustes manuales por matriz.

Arquitectónicamente hereda el transformer decoder-only denso de Qwen2.5, con 48 capas, atención con RoPE, GQA y ventana de contexto de 32.768 tokens. La model card reporta una fidelidad frente al BF16 de 0,10044 de KL media y 90,45 % de top-1, ligeramente por encima del Q4_K_M de llama.cpp en KL (0,0923) pero con mejor top-1 (90,34 %). Es, por tanto, una alternativa de cuantización orientada a hardware, no un modelo con capacidades nuevas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), 48 capas |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-14B-Instruct) |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en MLP gate/up; BFP8 (`bfloat8_b`) en atención q/k/v/o y MLP down; bf16 en LM head, embeddings y normas |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen2.5 soporta multilingüe, pero esta ficha solo declara `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; índice `model.safetensors.index.json` y `quant4.json` por proyección) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-14B-Instruct original: transformer decoder-only denso de 48 capas con atención multi-cabeza con consultas agrupadas (GQA), RoPE y normalización RMSNorm. No hay mezcla de expertos ni capas recurrentes. El checkpoint no se ha reentrenado: Xylolabs parte de los pesos oficiales y aplica un pipeline de cuantización post-entrenamiento. Las proyecciones gate y up del MLP pasan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque; las proyecciones de atención (q, k, v, o) y la proyección down del MLP se convierten a `bfloat8_b` por redondeo al más cercano. El LM head, los embeddings y las normas permanecen en bf16.

La innovación técnica está en el formato y en la verificación. El block floating point comparte un exponente por bloque de valores, lo que encaja con la unidad de cómputo Tensix y reduce el ancho de banda de memoria. El repositorio incluye `pack_tensix.py` y `verify_grid.py`, herramientas que comprueban matriz a matriz que el empaquetado en `ttnn.bfloat4_b`/`bfloat8_b` reproduce exactamente los valores de torch, con opción de round-trip por DRAM del dispositivo. La evaluación se hizo con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; no se reportan datos de entrenamiento adicionales ni procesos de RLHF o DPO, ya que la alineación proviene del modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de system prompt.
- Razonamiento multi-paso y matemáticas, heredados de Qwen2.5-14B-Instruct.
- Generación de código y comprensión de lenguajes de programación, según las capacidades del modelo base.
- Tool calling y function calling: el modelo base Qwen2.5-Instruct los soporta; esta cuantización los conserva al mantener el LM head y los embeddings en bf16.
- Capacidades multilingües del modelo base (Qwen2.5 declara decenas de idiomas), aunque la model card de esta conversión solo declara inglés.
- Ejecución en NPU Tensix con kernels nativos (`tensix-kernels`) y runner (`tensix-runner`).
- No incluye visión, audio ni modo thinking explícito; son capacidades ausentes en Qwen2.5-14B-Instruct estándar.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está empaquetado en formatos nativos `bfloat4_b`/`bfloat8_b`, de modo que los kernels ttnn cargan las matrices directamente en DRAM sin conversión en runtime, lo que reduce el tiempo de arranque y el consumo de memoria a 13,756 GB.
- Servicio de chat en inglés con contexto largo: con 32.768 tokens de ventana, admite conversaciones multi-turno extensas, resúmenes de documentos y análisis de contratos o informes sin truncar.
- Asistente de código en pipelines internos: al conservar tool calling, puede integrarse en flujos de CI/CD para revisar diffs, generar tests o resolver incidencias con llamadas a herramientas externas.
- Evaluación y benchmarking de hardware Tensix: sirve como carga de referencia reproducible (KL media 0,10044, top-1 90,45 %) para comparar kernels, versiones de ttnn y configuraciones de memoria.
- Generación aumentada por recuperación (RAG): la ventana de 32k permite inyectar varios fragmentos de documentación y mantener la coherencia de la respuesta en inglés.
- Prototipado de agentes multi-paso: el modelo base soporta razonamiento encadenado y llamadas a funciones, útil para orquestar tareas con varias herramientas en entornos de laboratorio.
- Inferencia en entornos con restricciones de memoria: 13,756 GB empaquetados permiten ejecutar un modelo de 14B en un solo acelerador Tensix, frente a los 29,54 GB del BF16.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 29,54 | 0 | 100 |
| Este modelo (BFP4 gate/up, BFP8 resto) | 13,756 | 0,10044 | 90,45 |
| Q4_K_M (llama.cpp) | 8,988 | 0,0923 | 90,34 |

Las métricas de KL y top-1 se calcularon sobre 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 y sin importance matrix. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 13,756 GB empaquetados para Tensix; el checkpoint BF16 de referencia ocupa 29,54 GB.
- GPU recomendadas: no aplica de forma nativa; el modelo está pensado para NPU Tensix (Wormhole y Blackhole). En GPU se puede cargar con `transformers` en bf16, lo que requiere aproximadamente 29,5 GB de VRAM (A100 40/80 GB, H100, o dos RTX 4090 de 24 GB con reparto).
- GPU de consumo: una RTX 4090 de 24 GB no basta en bf16; sería necesario cuantizar de nuevo a formatos GGUF/AWQ, que no se distribuyen en este repositorio.
- Despliegue: `ttnn` 0.81.1 con `tensix-runner` y `tensix-kernels` v0.1.0 para Tensix; `transformers` con `device_map="auto"` para GPU; el pipeline declarado es `text-generation` y es compatible con endpoints de text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada; las pruebas se hicieron sobre el simulador ttsim, no sobre silicio real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4) | 14,77B | 32.768 | BFP4/BFP8 nativo Tensix | Apache 2.0 | Hugging Face, 119 descargas |
| Qwen2.5-14B-Instruct (BF16) | 14,77B | 32.768 | bf16 | Apache 2.0 | Hugging Face oficial |
| Qwen2.5-14B-Instruct Q4_K_M (llama.cpp) | 14,77B | 32.768 | GGUF Q4_K_M, 8,988 GB | Apache 2.0 | Generado localmente |
| Qwen2.5-14B-Instruct AWQ/GPTQ (comunidad) | 14,77B | 32.768 | 4 bits GPU | Apache 2.0 | Varios repositorios de la comunidad |

Frente al BF16, este checkpoint reduce el tamaño un 53,4 % con una pérdida de 0,10044 de KL y 9,55 puntos de top-1. Frente al Q4_K_M, ocupa más espacio (13,756 GB frente a 8,988 GB) y tiene peor KL (0,10044 frente a 0,0923), pero mejor top-1 (90,45 % frente a 90,34 %) y está empaquetado para ejecutarse sin conversión en Tensix. La comparación con cuantizaciones AWQ/GPTQ para GPU no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card solo declara inglés; el multilingüismo del modelo base no está verificado en esta conversión y la evaluación incluyó coreano únicamente como conjunto de medida.
- Riesgo de alucinación inherente al modelo base Qwen2.5-14B-Instruct; la cuantización añade una degradación medible (KL 0,10044, top-1 90,45 %), que puede acumularse en cadenas de razonamiento largas.
- La evaluación se realizó sobre el simulador ttsim, no sobre silicio Wormhole o Blackhole real; el rendimiento y la latencia en hardware físico no están documentados.
- El formato BFP4/BFP8 es específico de Tensix; fuera de esa plataforma el checkpoint no ofrece ventajas y requiere cargarse en bf16 con `transformers`, con el coste de memoria asociado.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial; deben conservarse los avisos de `LICENSE` y `NOTICE` del repositorio.
- El repositorio tiene 119 descargas y 0 likes, con fecha de creación en noviembre de 2026; es un artefacto reciente y con poca validación comunitaria independiente.
- No se distribuyen pesos GGUF, AWQ ni GPTQ para GPU en este repositorio; quien necesite esos formatos debe generarlos por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
