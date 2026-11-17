# Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-64GB-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next publicada por el usuario Synchopate bajo el sello MaxQ v3.0. El objetivo declarado es comprimir un modelo MoE de gran tamaño (aproximadamente 176,5B parámetros totales, con unos 5,0B activos por token) hasta un fichero de 53,99 GiB que pueda ejecutarse íntegramente en CPU con 64 GB de RAM, sin GPU y sin podar expertos enrutados (se conservan los 512/512). La arquitectura del modelo base combina capas Gated DeltaNet con atención completa QSA y una capa integrada de predicción multi-token (NextN MTP) en `blk.48`.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva orientada a inferencia en CPU: la tabla de embeddings por capa (PLE) de 320 millones de filas se comprime de 26,82 GiB a 10,73 GiB mediante PCA-Wiener con dimensión 256 y RaBitQ Q1_0, y el espacio liberado se reinvierte en mantener todos los expertos del MoE. Por otro lado, el pipeline declarado es `image-text-to-text`, con un proyector visual opcional en BF16 de 0,85 GiB, lo que añade capacidades multimodales al conjunto.

El checkpoint se distribuye en dos shards GGUF más un `mmproj` opcional, con hashes SHA-256 publicados, licencia Apache 2.0 y compatibilidad declarada con `llama.cpp` a través del fork `llama-modchip`. No constan descargas ni valoraciones en el momento de redactar esta ficha, y el autor no publica datos de benchmarks estándar (MMLU, HumanEval, GSM8K), sino únicamente métricas de perplejidad y divergencia de la propia cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen4exp`): 48 capas troncales (36 Gated DeltaNet + 12 QSA full attention con `compress_ratio = 4`) + 1 capa NextN MTP (`blk.48`) |
| Parametros totales | ~176,5B (~125,3B transformer + MoE de 512 expertos + MTP + 51,2B de tabla PLE de 320M filas) |
| Parametros activos | ~5,0B por token (10 de 512 expertos enrutados + 1 experto compartido + tronco denso GDN/QSA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla GGUF: F32, Q8_0, Q6_K, IQ2_S, BF16, Q2_0 (tipo 42), IQ3_XXS, MXFP4 (39), IQ4_NL, Q2_K, Q1_0 (41); `max_type = 42`, sin tipos personalizados >= 43 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards + `mmproj` BF16 opcional) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con tronco híbrido: 36 capas de Gated DeltaNet (estado lineal con matrices de 48×128×128) alternadas con 12 capas de atención completa QSA, más una capa NextN de predicción multi-token que actúa como borrador integrado para decodificación especulativa. El MoE mantiene 512 expertos enrutados con top-10 activos y un experto compartido, con anchura `K = 640` y sin sesgo en `ffn_down_exps`. El vocabulario es de 248.320 tokens y la tabla PLE tiene 320.001.536 filas con dimensión interna de 256 (`qwen4exp.embedding_length_per_layer_input = 256`).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización de esta versión: la tabla PLE se reduce de 26,82 GiB en IQ4_NL a 10,73 GiB mediante PCA-Wiener con D=256 y RaBitQ Q1_0, y los 16,09 GiB liberados se reinvierten en conservar los 512 expertos sin podar, aplicar escalas firmadas Q2_0 con Woodbury DualGram en FP64 y mantener el módulo MTP. El autor declara que la construcción es «100% donor-free», es decir, sin reutilizar tensores de otras cuantizaciones, y que todos los tipos de tensor son `ggml` estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagen y texto combinados mediante el proyector visual opcional `mmproj-Qwen3.8-Flash-Next-BF16.gguf` (0,85 GiB, 334 tensores).
- Decodificación especulativa integrada mediante la capa NextN MTP (`blk.48`), con una tasa de aceptación declarada del 93,0 % en la prueba `tg128`.
- Razonamiento y generación de código: no se documentan evaluaciones específicas, pero el modelo base pertenece a la familia Qwen3.8, orientada a tareas generales de lenguaje y código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (el campo de idiomas no está cumplimentado).
- Ejecución en CPU sin GPU mediante `llama-modchip` v3.0, con binarios portables para AVX2 y AVX-512.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU: el checkpoint ocupa 53,99 GiB y el autor reporta un `VmHWM` de 45,08 GiB en una CPU Zen 5 de 16 núcleos, por lo que encaja en equipos con 64 GB de RAM y permite desplegar un MoE de ~176,5B parámetros sin acelerador dedicado.
- Procesamiento de documentos con imagen y texto: al incluir un proyector visual BF16, el modelo puede recibir capturas, páginas escaneadas o diagramas junto a instrucciones textuales para tareas de extracción y resumen, siempre que se cargue el `mmproj` opcional.
- Servicio de chat conversacional de baja concurrencia: con `llama-server` y el binario portable GLIBC 2.30, se puede exponer un endpoint compatible con la API de OpenAI en entornos Linux x86_64 sin dependencias de CUDA.
- Prototipado e investigación sobre cuantización extrema: la ficha documenta métricas de PPL y KLD frente a una referencia cuantizada, lo que lo convierte en un artefacto útil para estudiar el impacto de técnicas como PCA-Wiener, RaBitQ o Q2_0 en modelos MoE de gran tamaño.
- Evaluación de decodificación especulativa con MTP: la capa NextN integrada y la tasa de aceptación reportada permiten medir en condiciones reales la ganancia de throughput de la predicción multi-token en CPU.
- Despliegue en entornos con restricciones de acelerador: al no requerir GPU, resulta adecuado para laboratorios, aulas o infraestructuras donde el acceso a A100/H100 no está disponible y se prioriza la reproducibilidad con hardware de consumo.
- Generación de código en local para desarrolladores: el modelo base pertenece a una familia con capacidades de código, aunque esta versión cuantizada no publica evaluaciones específicas de HumanEval ni similares, por lo que su idoneidad en producción debe validarse empíricamente.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas de calidad de cuantización y de rendimiento en CPU sobre el conjunto held-out `wiki-alt.txt` (40 × 512 chunks, sin solapamiento de 8-gramas ni 13-gramas con la calibración):

| Metrica | MaxQ-64GB | GSQ-RCO-Coder-IQ1_M (referencia) |
|---|---|---|
| Tamano | 53,99 GiB | 54,40 GiB |
| Expertos conservados | 512/512 | 256/512 (podados) |
| MTP integrado | Si (`blk.48`) | No |
| Mean PPL | 3,4325 ± 0,0708 | 5,0916 |
| Mean KLD | 0,4971 ± 0,0099 | 0,9302 |
| Median KLD | no disponible en detalle (-64,3% frente a referencia) | referencia |

| Metrica de inferencia (Zen 5, 16 nucleos, sin GPU) | Valor |
|---|---|
| Throughput `tg128` | 12,66 tok/s |
| Tasa de aceptación MTP | 93,0 % |
| Throughput `pp512` | 71,97 tok/s |
| Memoria maxima (`VmHWM`) | 45,08 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo declarado; la ejecución es en CPU. El autor fija un techo de menos de 55,5 GiB de RAM para el conjunto LLM.
- RAM necesaria: 64 GB recomendados (53,99 GiB de pesos + overhead de contexto y runtime); `VmHWM` medido de 45,08 GiB en la prueba del autor.
- GPU recomendadas: no disponibles para este checkpoint; el autor no documenta ejecución en GPU. El binario distribuido es `llama-server-modchip` para Linux x86_64 con AVX2 o AVX-512.
- ¿Cabe en GPU de consumo? No se documenta. El tamaño de 53,99 GiB excede la VRAM de cualquier GPU de consumo actual (máximo 24 GB en RTX 4090), por lo que requeriría offload parcial o CPU.
- Opciones de despliegue: `llama.cpp` a través del fork `llama-modchip` v3.0 (`./install.sh --preset qwen38-64gb` o `llama-server` directo). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 12,66 tok/s en generación y 71,97 tok/s en prefill sobre un Zen 5 de 16 núcleos, con hilos configurados como `N_CORES - 1` y `--poll 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-64GB (este) | ~176,5B totales / ~5,0B activos | no disponible | GGUF mixta, 53,99 GiB | Apache 2.0 | 512/512 expertos, MTP integrado, CPU-only |
| ISTA-DASLab GSQ-RCO-Coder-IQ1_M | no disponible | no disponible | GGUF, 54,40 GiB | no disponible | 256/512 expertos podados, sin MTP; PPL 5,0916, KLD 0,9302 |
| Qwen/Qwen3.8-Flash-Next (BF16 original) | ~176,5B totales / ~5,0B activos | no disponible | BF16, 329,72 GiB | Apache 2.0 | Modelo base sin cuantizar; requiere hardware de gran memoria |

No se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría; la comparación se limita a métricas de cuantización y tamaño.

## Limitaciones y advertencias

- El campo de idiomas no está cumplimentado: no hay garantía documentada de cobertura multilingüe más allá de la del modelo base, que no se detalla.
- No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas reales debe validarse de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación en esta cuantización.
- La cuantización es extremadamente agresiva (Q1_0 en la tabla PLE, Q2_0 en las escalas de expertos, IQ2_S e IQ3_XXS en otras partes), lo que puede degradar tareas sensibles a precisión numérica como matemáticas o código.
- El autor advierte de una etiqueta `general.size_label = "5.0B"` heredada del proceso de conversión que no refleja el tamaño real (~176,5B totales); herramientas que lean ese campo pueden dimensionar mal el modelo.
- El despliegue documentado depende del fork `llama-modchip` v3.0 y de binarios portables concretos; no se garantiza compatibilidad con `llama.cpp` upstream ni con otros runtimes.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-Flash-Next, que deben verificarse por separado.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación comunitaria del checkpoint.
- No se documentan requisitos de contexto máximo, por lo que el comportamiento con ventanas largas no está caracterizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork de inferencia: https://github.com/synchopate/llama-modchip
- Releases del binario: https://github.com/synchopate/llama-modchip/releases/download/v3.0/
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
