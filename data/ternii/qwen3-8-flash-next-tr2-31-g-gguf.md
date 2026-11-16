# Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF

## Resumen

Qwen3.8-Flash-Next-TR2.31-G es una cuantización ternaria extrema del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario Ternii (Wai Chung) bajo el identificador `Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF`. Se trata de un modelo de mezcla de expertos (MoE) de 176.943.899.520 parámetros totales, de los cuales aproximadamente 6.000 millones se activan por token, distribuidos en 120.800 millones de parámetros en expertos enrutados y 51.200 millones en una tabla de embeddings n-gram. El objetivo declarado es ejecutar un modelo de 177B en un MacBook Air de 16 GB a unos 12 tokens por segundo, algo que solo es posible mediante una compresión agresiva de los pesos y una gestión de memoria que mantiene los expertos en SSD.

La innovación central es la "TR Quantisation": los expertos enrutados se codifican a 2 trits (9 niveles), el resto de capas lineales a 3 trits (27 niveles) y la tabla de embeddings n-gram a 3 trits almacenada en un contenedor Q5_0, con una escala de 16 bits por cada grupo de 128 pesos. El resultado es una media de 2,31 trits por peso sobre los 176.200 millones de pesos traducidos, con un tamaño en disco de 89,8 GB. No hay reentrenamiento: la calibración se realiza con GPTQ sobre los pesos BF16 originales de Qwen.

El modelo requiere un fork parcheado de llama.cpp (`llama.cpp-tr-b11721-r3` o posterior) porque los tipos de tensor `TQ9_128` y `TQ27_128` no existen en el llama.cpp upstream; por tanto, no es compatible con LM Studio, Ollama ni compilaciones estándar. Está pensado exclusivamente para Apple Silicon con Metal, es solo texto (sin codificador de visión ni cabeza MTP) y su licencia es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse attention, `compress_ratios` 4 en las 12 capas de atención completa) |
| Parametros totales | 176.943.899.520 (176,9B) |
| Parametros activos | ~6B por token (10 expertos enrutados por defecto; 8 en los ajustes por defecto del runtime) |
| Longitud de contexto | Hasta 16.384 tokens en la configuración medida (por defecto 4.096 en el quick start) |
| Tipos de cuantizacion | TR Quantisation: 2 trits (9 niveles) en expertos enrutados, 3 trits (27 niveles) en otras capas lineales, 3 trits en tabla n-gram (contenedor Q5_0), 8 bits en pesos de hiperconexión; escala de 16 bits por grupo de 128 pesos; media de 2,31 trits por peso |
| Idiomas soportados | Inglés (según la model card y los tags del repositorio) |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF (8 shards, ~89,8 GB) más un fichero `.trpw` de 115 MiB con el predictor de expertos |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con atención dispersa: 12 capas de atención completa con `compress_ratios` 4, y un total de 176,9B parámetros de los que unos 6B se activan por token. La model card indica que el checkpoint de 180B incluye una cabeza de predicción multi-token (MTP) de 4B que esta cuantización elimina, quedándose en 176,2B pesos traducidos. No hay visión ni audio: es un modelo exclusivamente de texto.

Esta versión no reentrena nada: parte de los pesos BF16 de Qwen (revisión `de4b8e4d`) y aplica TR Quantisation con calibración GPTQ. Los expertos enrutados se codifican a 2 trits, el resto de capas lineales a 3 trits y la tabla de embeddings n-gram a 3 trits en un contenedor Q5_0, con escalas de 16 bits por grupo de 128 pesos. Comparte calibración y tensores no-experto con `Qwen3.8-Flash-Next-TR3-G-GGUF` (1.080 de 1.224 tensores son byte-idénticos); solo difieren los 144 tensores de expertos enrutados. El fichero `.trpw` es un predictor aprendido que el runtime usa para leer anticipadamente los expertos de la siguiente capa desde el SSD; no altera la salida (texto byte-idéntico con y sin él) y solo acelera la decodificación. El modelo se sirve con un fork de llama.cpp (serie de parches sobre `ggml-org/llama.cpp` en el commit `ff5a233`) que implementa los tipos de tensor ternarios y la carga de expertos desde SSD.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento opcional (`--reasoning off` para respuestas directas; sin él, el modelo "piensa" antes de responder).
- Razonamiento de múltiples pasos y matemáticas, evidenciado por el uso de los datasets GSM8K y Hendrycks MATH en la metadata del repositorio.
- Generación de código, con `nvidia/OpenCodeInstruct` como dataset de referencia declarado.
- Instrucción conversacional general, con `OpenAssistant/oasst2` como dataset de referencia.
- No dispone de codificador de visión ni de capacidades de audio.
- No se documenta soporte explícito de tool calling ni function calling en la model card.
- No se documenta soporte explícito de agentes o multi-step tool use más allá del razonamiento encadenado.
- Capacidad multilingüe limitada al inglés según la metadata (`language: [en]`).

## Casos de uso

- Inferencia local de un modelo de 177B en hardware de consumo: el caso principal es ejecutar un MoE de gran tamaño en un MacBook Air de 16 GB, manteniendo los expertos en SSD y una caché en memoria de los más usados, a unos 12 tokens/s. Adecuado para desarrolladores que quieren probar modelos grandes sin acceso a clústeres.
- Asistente de programación en local: con decodificación a ~12 tokens/s y contexto de 4k–16k, sirve para autocompletado, explicación de código y generación de funciones en un entorno totalmente offline, sin enviar código a servicios externos.
- Razonamiento matemático y resolución de problemas: el modelo se calibró con GSM8K y Hendrycks MATH, y el modo de razonamiento permite cadenas de pensamiento largas; útil para prototipos de tutores o asistentes de estudio en local.
- Experimentación con cuantización ternaria: sirve como banco de pruebas para investigar TR Quantisation, tipos de tensor ternarios y decodificación con expertos en SSD, comparando contra la variante TR3.
- Chat conversacional privado en Mac: el script de arranque levanta un servidor local en `127.0.0.1:8080` sin enviar datos a ningún sitio, adecuado para conversaciones con material sensible en un portátil.
- Evaluación de latencia y throughput en Apple Silicon: permite medir prefill (~75 tokens/s con prompt de 9.709 tokens) y decode (~12 tokens/s) en M5, útil para caracterizar el rendimiento de MoE con offloading a SSD.
- Docencia y demostraciones: al ejecutarse en un portátil de 16 GB con un solo comando, permite mostrar en clase el comportamiento de un modelo de 177B sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de velocidad medidas en un MacBook Air M5 de 16 GB:

| Configuracion | Decode (tokens/s) | Nota |
|---|---|---|
| Este fichero, ajustes por defecto (8 expertos, predictor aprendido) | ~12 (11,9–12,6) | 6 ejecuciones en dos días, incluida una re-prueba independiente |
| Igual, caché mayor (`-fit off`, 8.100 MiB) | 12,6–13,1 | 5 ejecuciones |
| Igual, prompt de 9.709 tokens con `-c 16384` | 12,6 | una ejecución; prefill 75 tokens/s |
| Igual, 10 expertos del modelo, read-ahead del router | 9,7–10,1 | — |

## Requisitos de hardware

- VRAM/RAM: el modelo ocupa 89,8 GB en disco; en un Mac de 16 GB se mantiene una caché de expertos en memoria de 6.750 MiB (por defecto) u 8.100 MiB (configuración rápida opcional).
- GPU recomendadas: Apple Silicon con Metal; la única configuración medida es un MacBook Air con Apple M5 y 16 GB. La model card indica que Macs de 24 GB o más pueden ejecutar el mismo comando, pero solo se ha medido en 16 GB.
- No cabe en GPUs consumer tipo RTX 4090 (24 GB) en su totalidad; requeriría offloading masivo y no está soportado por el runtime documentado.
- Opciones de despliegue: exclusivamente el fork `llama.cpp-tr` (release `llama.cpp-tr-b11721-r3` o posterior) con Metal. No funciona con llama.cpp upstream, LM Studio ni Ollama.
- Latencia y throughput: decode ~12 tokens/s y prefill ~75 tokens/s en M5 de 16 GB con contexto de 16k; sin `caffeinate -ims` el rendimiento cae notablemente porque la GPU baja frecuencias mientras espera al SSD.
- Variables de entorno relevantes: `LLAMA_MOE_SSD=1`, `LLAMA_MOE_CACHE_MIB=6750`, `LLAMA_MOE_CACHE_MAX_BATCH=512`, `LLAMA_MOE_ASYNC=1`, `GGML_SCHED_COPY_CB_FIRST=1`, `GGML_METAL_OPT_GDNPREP=1`, `GGML_METAL_OPT_NGATED=1`, `GGML_TQ_NO_REPACK=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TR2.31-G (este) | 176,9B totales, ~6B activos | hasta 16k | 2,31 trits medios | Qwen Community 1.0 | GGUF, solo llama.cpp-tr en Apple Silicon |
| Qwen3.8-Flash-Next-TR3-G | 176,9B totales, ~6B activos | no disponible | 3 trits | Qwen Community 1.0 | GGUF, llama.cpp-tr |
| Qwen/Qwen3.8-Flash-Next (base BF16) | 176,9B totales, ~6B activos | no disponible | BF16 | Qwen Community 1.0 | safetensors, requiere hardware de datacenter |

No se dispone de datos de benchmarks que permitan comparar la calidad de estas variantes entre sí ni con modelos de otros fabricantes.

## Limitaciones y advertencias

- Solo funciona con el fork parcheado de llama.cpp (`llama.cpp-tr-b11721-r3` o posterior); las compilaciones estándar, LM Studio y Ollama no pueden cargar los tipos `TQ9_128` / `TQ27_128`.
- Soporte limitado a Apple Silicon con Metal; no hay soporte documentado para CUDA, ROCm ni CPU.
- Modelo solo de texto: sin visión, sin audio y sin cabeza MTP.
- Idioma limitado al inglés según la metadata del repositorio.
- La cuantización a 2 trits en los expertos puede degradar la calidad frente al modelo BF16 o a la variante TR3; no se han publicado métricas de calidad que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Qwen Community License 1.0 impone restricciones de uso comercial; es necesario revisar el fichero `LICENSE` del repositorio antes de cualquier despliegue en producción.
- El rendimiento depende críticamente de mantener la alimentación conectada y de no ejecutar otras aplicaciones; sin `caffeinate -ims` la decodificación se ralentiza mucho.
- El uso de 8 expertos en lugar de 10 en los ajustes por defecto del runtime se describe como neutro en precisión, pero no se aportan métricas que lo respalden.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún nula y ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.31-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante TR3: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
- Runtime parcheado: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Script de arranque para Mac: https://github.com/ternii-ai/tritq-vllm/blob/main/mac/qwen38-16gb.sh
- Release del runtime: https://github.com/ternii-ai/tritq-vllm/releases/download/llama.cpp-tr-b11721-r3/llama.cpp-tr-macos-arm64.tar.gz
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
