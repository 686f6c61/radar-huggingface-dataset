# webbrain-one/Nanbeige4.3-33B-NVFP4

# Nanbeige4.3-33B-NVFP4: cuantización de 4 bits del modelo agéntico de Nanbeige

## Resumen

Nanbeige4.3-33B-NVFP4 es una versión cuantizada en NVFP4 del modelo denso Nanbeige4.3-33B, publicado por Nanbeige LLM Lab bajo licencia Apache-2.0 y orientado a tareas de agente: generación de código, automatización de terminal y flujos de trabajo de oficina. La cuantización la ha realizado el proyecto WebBrain (organización `webbrain-one` en HuggingFace) con `llm-compressor` y el formato `compressed-tensors`, con el objetivo de reducir el peso del modelo para poder servirlo en una única GPU de consumo.

El resultado ocupa 22,1 GB frente a los 66,2 GB del BF16 original, con pesos y activaciones en FP4 (W4A4): valores E2M1 agrupados en bloques de 16, escalas de bloque en FP8 (E4M3) y una escala por tensor en FP32; las escalas de las activaciones se calculan en tiempo de inferencia. Se mantienen en BF16 las embeddings de tokens, el `lm_head` y las normalizaciones. El modelo base conserva una ventana de contexto de 512K tokens, aunque en esta versión el contexto práctico está limitado por la memoria disponible para la caché KV.

Un detalle relevante para la evaluación: aunque el nombre comercial indica 33B, el recuento real de parámetros en los safetensors es de 19.676.626.648 (unos 19,7B), con 52 capas. La model card no explica esa discrepancia. Se trata, además, de un repositorio recién creado (25 de octubre de 2026) con 0 descargas y 1 like, y la única validación de calidad publicada es un chequeo de cordura de 100 preguntas de GSM8K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 52 capas; todas las capas `Linear` del decodificador (364 = 52 x 7) cuantizadas en NVFP4 |
| Parámetros totales | 19.676.626.648 (~19,7B) según safetensors; el nombre del modelo indica 33B (discrepancia no explicada en la model card) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512K tokens en el modelo base; en esta cuantización depende de la VRAM para la caché KV |
| Tipos de cuantización | NVFP4 (W4A4): pesos y activaciones en FP4 E2M1 en bloques de 16, escalas de bloque FP8 E4M3 y escala por tensor FP32. Embeddings, `lm_head` y normas en BF16. Algoritmo round-to-nearest |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (idéntica al modelo original) |
| Formato de pesos | Safetensors en formato `compressed-tensors` |
| Tamaño del repositorio | 22,1 GB (original en BF16: 66,2 GB) |
| Calibración | 256 muestras de hasta 2048 tokens (media 552), dataset `mlabonne/open-perfectblend`, renderizadas con la plantilla de chat del modelo |
| Herramientas de cuantización | llm-compressor 0.14.0.1, compressed-tensors 0.19.0, transformers 5.17.0, torch 2.11.0+cu128 |
| Precisión mixta | Capas lineales en FP4; `lm_head` excluido de la cuantización |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un transformer denso de 52 capas, sin mezcla de expertos, especializado en uso agéntico (código y tareas de oficina) y publicado el 24 de octubre de 2026 por Nanbeige LLM Lab. No se detallan en la documentación proporcionada la composición del dataset de preentrenamiento, el número de tokens, ni si hubo etapas de RLHF o DPO. La plantilla de chat incluye opciones `enable_thinking`, `preserve_thinking` y `tool_call_format`, y el servidor recomendado usa los parsers `qwen3` (razonamiento) y `qwen3_coder` (tool calling), lo que confirma la existencia de un modo de razonamiento explícito y de un formato estructurado de llamadas a herramientas.

Esta versión concreta no reentrena nada: aplica cuantización NVFP4 de tipo round-to-nearest sobre las 364 capas lineales del decodificador, usando 256 muestras de calibración del dataset `mlabonne/open-perfectblend`. El `config.json` es el original más el bloque `quantization_config`; tokenizer y ficheros de generación son copias sin modificar del modelo base. La cuantización se ejecutó en 3,1 minutos sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia.
- Modo de razonamiento explícito (`enable_thinking`) y conservación del bloque de pensamiento entre turnos (`preserve_thinking`).
- Tool calling / function calling estructurado, con parser dedicado (`qwen3_coder`) y soporte de `--enable-auto-tool-choice` en vLLM.
- Comportamiento orientado a agentes: el modelo base reporta resultados destacados en benchmarks agénticos, incluido Terminal-Bench 2.1 (80,9 según una fuente externa).
- Generación y edición de código, así como automatización de tareas de terminal y de "office-style agents".
- Ventana de contexto de hasta 512K tokens en el modelo base, útil para repositorios o documentos extensos.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Agentes de terminal y automatización de shell: el modelo base está diseñado para tareas de línea de comandos y reporta 80,9 en Terminal-Bench 2.1; esta versión permite ejecutarlo en una sola GPU de 32 GB.
- Asistente de código en IDE o pipelines de CI/CD: con tool calling estructurado y parser `qwen3_coder`, se puede integrar en flujos que invocan herramientas (linters, tests, APIs internas) y devuelven resultados parseables.
- Despliegue on-premise con requisitos de privacidad: al ocupar 22,1 GB, cabe en una RTX 5090 de 32 GB y evita enviar código o datos a APIs externas.
- Automatización de tareas administrativas: generación y transformación de documentos, extracción de datos y resúmenes en flujos multi-paso, aprovechando el modo de razonamiento.
- Análisis de repositorios o expedientes largos: con contexto de hasta 512K tokens en el modelo base (limitado por VRAM en la práctica), útil para revisar codebases completas o documentación extensa.
- Atención al cliente bilingüe inglés-chino: conversaciones multi-turno con contexto largo y respuestas en el idioma del usuario; el modelo no declara soporte de castellano.
- Servicio de inferencia de bajo coste con vLLM: sustituir el BF16 (66,2 GB) por NVFP4 (22,1 GB) reduce el número de GPUs necesarias para servir el modelo con una pérdida de calidad mínima en el chequeo publicado.

## Benchmarks y rendimiento

| Prueba | BF16 original | NVFP4 (este repositorio) |
|---|---|---|
| GSM8K, primeras 100 preguntas del test, greedy, sin thinking | 96,0 % | 95,0 % |

El propio autor advierte que se trata de un chequeo de cordura ejecutado justo después de cuantizar (vLLM 0.32.0, NVIDIA RTX PRO 6000 Blackwell Server Edition) para detectar una cuantización rota, no de un benchmark. No se han publicado en la información disponible resultados completos de MMLU, HumanEval, GSM8K completo ni de la propia cuantización frente al BF16 en tareas agénticas.

Como referencia externa (no verificada en la model card de esta cuantización), una entrada de blog sobre el modelo base cita 80,9 en Terminal-Bench 2.1 y afirma que lidera a tres modelos comparables de la clase 30B en la mayoría de benchmarks agénticos, sin detallar nombres ni cifras.

## Requisitos de hardware

- VRAM estimada: 22,1 GB solo para pesos; hay que sumar caché KV y buffers de activación. Con `--kv-cache-dtype fp8` y 32K de contexto el modelo cabe en 32 GB; el contexto completo de 512K requiere mucha más memoria.
- GPUs con ruta nativa FP4: Blackwell (SM100 / SM120), es decir, RTX PRO 6000 Blackwell, B200 y RTX 5090 entre otras. En ellas se usa el camino de tensor cores FP4 y se cuantizan también las activaciones en tiempo de inferencia.
- GPUs anteriores (A100, H100, RTX 4090): vLLM ejecuta los pesos como FP4 pero omite la cuantización de activaciones, por lo que no se debe esperar la misma ganancia de rendimiento. Con 24 GB (RTX 4090) el margen es muy ajustado y no está confirmado en la documentación; la única configuración de una sola tarjeta documentada es la RTX 5090 de 32 GB.
- Despliegue: vLLM 0.32.0 es la vía documentada, con el comando `vllm serve webbrain-one/Nanbeige4.3-33B-NVFP4 --enable-auto-tool-choice --reasoning-parser qwen3 --tool-call-parser qwen3_coder`. El tag `text-generation-inference` está presente, pero no se confirma soporte de NVFP4 en TGI. No se publican pesos GGUF, por lo que llama.cpp u Ollama no están disponibles en este repositorio.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el de la cuantización (3,1 minutos en RTX PRO 6000 Blackwell).
- Parámetros de muestreo recomendados: temperatura 1.0 / top_p 0.95 para uso agéntico y de herramientas; 0.6 / 0.95 para razonamiento y chat.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-NVFP4 (este) | 19,68B reales (nombre 33B) | 512K en el base; limitado por VRAM | Safetensors NVFP4 W4A4, 22,1 GB | Apache-2.0 | HuggingFace, vLLM |
| Nanbeige4.3-33B (BF16 original) | 33B según el autor (recuento no disponible) | 512K | Safetensors BF16, 66,2 GB | Apache-2.0 | HuggingFace |
| Nanbeige4.2-3B | ~3B | No disponible | BF16 | No disponible en la información | HuggingFace |
| Qwen 3.5 9B | ~9B | No disponible | No disponible | No disponible en la información | Citado como comparable en benchmarks agénticos del 4.2-3B |
| Gemma 4 12B | ~12B | No disponible | No disponible | No disponible en la información | Citado como comparable en benchmarks agénticos del 4.2-3B |

No se dispone de datos de rendimiento de esta cuantización frente a alternativas de la clase 30B; la comparación relevante y documentada es contra el BF16 original, donde se gana un 67 % de reducción de tamaño a cambio de 1 punto en el chequeo de GSM8K.

## Limitaciones y advertencias

- Solo inglés y chino: no se declara soporte de castellano ni de otros idiomas, por lo que el rendimiento fuera de en/zh es incierto.
- La única evaluación publicada es un chequeo de cordura con 100 preguntas de GSM8K; no hay datos de la cuantización en tareas agénticas, de código ni de contexto largo, donde la pérdida por FP4 podría ser mayor.
- Riesgo de alucinación inherente a un modelo de lenguaje de esta escala; el autor no publica evaluación de factualidad ni de sesgos.
- Discrepancia de nomenclatura: el nombre indica 33B pero el recuento de safetensors es 19,68B; conviene verificar el modelo base antes de dimensionar infraestructura.
- Repositorio con 0 descargas y 1 like: no hay validación independiente de la calidad de esta cuantización concreta.
- El contexto completo de 512K no es viable en GPUs de consumo; en una RTX 5090 hay que limitarse a unos 32K tokens con caché KV en FP8 y ampliar según lo que reporte vLLM al arrancar.
- En GPUs no Blackwell se pierde el camino nativo FP4 y la cuantización de activaciones, con lo que el beneficio de rendimiento es menor aunque el ahorro de memoria se mantiene.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero exige conservar los avisos de copyright y licencia, y no incluye garantías ni cláusula de indemnización por patentes.
- El modelo base es un desarrollo de terceros (Nanbeige LLM Lab); los benchmarks citados de Terminal-Bench provienen de una fuente externa y no están verificados en la model card.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/webbrain-one/Nanbeige4.3-33B-NVFP4
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Commit del modelo base usado para cuantizar: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Organización WebBrain en HuggingFace: https://huggingface.co/webbrain-one
- llm-compressor: https://github.com/vllm-project/llm-compressor
- WebBrain, agente de navegador open source: https://www.webbrain.one/
- Repositorio GitHub de WebBrain: https://github.com/webbrain-one/webbrain
- Artículo sobre el benchmark del planner Nanbeige 4.2 3B en WebBrain: https://www.webbrain.one/blog/nanbeige-42-3b-bf16-planner-benchmark
- Guía externa sobre Nanbeige4.3-33B: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
