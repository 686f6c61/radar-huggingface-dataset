# Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF es una cuantización GGUF de 284.334.567.511 parámetros (284,33B totales, 13,17B activos) del checkpoint abliterado `prem-research/DeepSeek-V4-Flash-0731-abliterated`, publicada por el usuario Synchopate. El modelo base es una variante de DeepSeek-V4-Flash, una arquitectura Mixture-of-Experts con 43 capas, 256 expertos enrutados más un experto compartido por capa y enrutamiento Top-6 sin podar. La versión abliterada aplica proyección ortogonal de la dirección de rechazo sobre los pesos del residual stream para eliminar los filtros de alineamiento sin reentrenar.

La contribución principal de esta ficha es la cuantización: un único paso directo desde safetensors nativos (BF16/FP8_E4M3/MXFP4) hasta GGUF, sin recuantización intermedia, que deja las 130 matrices densas de cuello de botella (embeddings, salida y proyecciones `attn_q_a`, `ffn_gate_shexp`, `ffn_up_shexp` de las 43 capas) en Q6_K (6,5625 bpw), la atención MLA en un tipo personalizado `Fractal-64` (3,75 bpw) y los 256 expertos enrutados con una importance matrix de 1,5M de tokens. El resultado ocupa 61.129.364.000 bytes (56,93 GiB) en tres shards, diseñado para caber en 64 GB de RAM DDR5 y ejecutarse íntegramente en CPU.

Es relevante porque demuestra inferencia de un MoE de casi 285B parámetros en hardware de consumo sin GPU, mediante un runtime parcheado (`llama-modchip`) que implementa tipos de tensor personalizados y kernels AVX-512/AVX2. La licencia es MIT, aunque el checkpoint está explícitamente descensurado y restringido a investigación de seguridad y desarrollo local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención MLA, 43 capas, 256 expertos enrutados + 1 compartido por capa, Top-6 |
| Parametros totales | 284.334.567.511 (284,33B) |
| Parametros activos | 13,17B |
| Longitud de contexto | no disponible (el benchmark usa 3.038 tokens y `-c 32768` de configuración) |
| Tipos de cuantizacion | Q6_K (6,5625 bpw) para 130 tensores densos; Fractal-64 / `GGML_TYPE_Q2_0 = 42` (3,75 bpw) para atención MLA; expertos enrutados con importance matrix de 1,5M tokens |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 61.129.364.000 bytes / 56,93 GiB) |
| Modelo base | prem-research/DeepSeek-V4-Flash-0731-abliterated (a su vez derivado de deepseek-ai/DeepSeek-V4-Flash-0731) |
| Runtime requerido | llama-modchip (fork de llama.cpp con tipos personalizados); no compatible con Ollama, LM Studio, vLLM ni llama.cpp sin parchear |
| Instrucciones ISA | AVX-512 (Zen 4/5, Ice Lake+) o AVX2 (Haswell, Skylake, Zen 2/3, Alder/Raptor Lake) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención Multi-head Latent Attention (MLA), 43 capas y 256 expertos enrutados más un experto compartido por capa, con enrutamiento Top-6 sin podar. Los 284,33B parámetros totales se reducen a 13,17B activos por token. La cuantización parte de safetensors nativos en BF16, FP8_E4M3 y MXFP4 y se realiza en un solo paso, evitando la doble cuantización típica de las transcodificaciones multi-etapa (`FP8/MXFP4 -> Q8_0/Q5_K -> destino`). Las 130 matrices densas de activación completa se elevan a Q6_K, mientras que la atención MLA se preserva en el tipo personalizado Fractal-64 de bloque 64 (`type 42`) y los expertos enrutados se cuantizan guiados por una importance matrix de 1,5M de tokens de @antirez.

La variante abliterada aplica proyección ortogonal de la dirección de rechazo sobre los pesos del residual stream del checkpoint original, eliminando las respuestas de rechazo sin reentrenamiento ni RLHF adicional. El runtime `llama-modchip` añade los operadores `deepseek4` MLA, Hadamard y Sinkhorn-20, además del tipo de tensor personalizado, e incluye binarios precompilados con detección de ISA para AVX-512 y AVX2 (este último sin instrucciones `%zmm`). No se dispone de datos sobre el número de tokens de entrenamiento del modelo original ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas, con prueba de canary de 3.038 tokens y matemáticas asociadas al KV en el benchmark del autor.
- Generación de código ejecutable (evaluada en el suite `Hard-60` de código y matemáticas).
- Tool calling y function calling con coincidencia de esquema JSON (30/30 en la prueba de agentic tool-calling).
- Razonamiento agéntico multi-paso orientado a flujos tipo Claude Code (etiqueta `claude-code`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "uncensored": responde directamente a consultas técnicas de doble uso (ingeniería inversa, mecánica de exploits, seguridad ofensiva/defensiva, auditoría red-team) sin rechazos de alineamiento.
- Inferencia en CPU sin GPU mediante runtime parcheado con kernels AVX-512/AVX2.

## Casos de uso

- Auditoría de seguridad y CTF: el checkpoint abliterado responde a consultas de mecánica de exploits y análisis de vulnerabilidades sin filtros de rechazo, lo que lo hace adecuado para investigación autorizada y entornos offline; el autor reporta 8/8 en la auditoría de rechazos técnicos.
- Desarrollo local asistido por agente: con tool calling que alcanza 30/30 en coincidencia de esquema JSON, puede integrarse en flujos tipo Claude Code ejecutados íntegramente en una máquina de 64 GB de RAM sin GPU.
- Evaluación de sistemas en hardware de consumo: permite estudiar el comportamiento de un MoE de 284B parámetros en CPU (Ryzen 9 9955HX, 16 núcleos, DDR5-5600) con un consumo de RAM de 59,13 GiB y sin swap.
- Generación de código en pipelines offline: el suite `Hard-60` reporta 50/60 puntos, útil para tareas de generación y revisión de código en entornos aislados donde no se permite enviar datos a la nube.
- Investigación sobre alineamiento y abliteración: sirve como referencia para comparar el comportamiento de un checkpoint alineado frente a uno abliterado (el autor publica variantes alineadas equivalentes en tamaño).
- Procesamiento de contexto largo moderado: con configuración `-c 32768` y pruebas de needle a 3.038 tokens, es viable para resúmenes y análisis de documentos extensos en local.
- Desarrollo y depuración de runtimes de inferencia: el repositorio incluye binarios ISA-matched y el proyecto `llama-modchip`, útil para probar tipos de tensor personalizados y operadores MLA/Hadamard/Sinkhorn.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, medidos en un AMD Ryzen 9 9955HX de 16 núcleos con 64 GB DDR5-5600, Linux 6.8 y sin GPU. La comparación es contra las variantes del mismo autor `DeepSeek-V4-Fractal` (56,57 GiB) y `DeepSeek-V4-VQ3` (56,40 GiB).

| Metrica / Suite | Fractal (56,57 GiB) | VQ3 (56,40 GiB) | Abliterated-Fractal-MaxQ (56,93 GiB) |
|---|---|---|---|
| Tamano GGUF (3 shards) | 56,57 GiB | 56,40 GiB | 56,93 GiB |
| RAM residente pico (`-c 32768`) | 58,20 GiB | 58,31 GiB | 59,13 GiB |
| Perplejidad continua (4.096 tok) | 1,8284 ± 0,07038 | 1,8258 ± 0,06978 | 1,7597 ± 0,06534 |
| Tool calling agéntico (30 pts) | 24,0 / 30,0 | 26,0 / 30,0 | 30,0 / 30,0 |
| Generación de código ejecutable (30 pts) | 20,0 / 30,0 | 20,0 / 30,0 | 20,0 / 30,0 |
| Needle contexto largo y matemáticas (20 pts) | 20,0 / 20,0 | 20,0 / 20,0 | 20,0 / 20,0 |
| Subtotal puerta de calidad funcional (80 pts) | 64,0 / 80,0 | 66,0 / 80,0 | 70,0 / 80,0 |
| Suite extendida `Hard-60` código/matemáticas (60 pts) | 20,0 / 60,0 | 40,0 / 60,0 | 50,0 / 60,0 |
| Auditoría de rechazos técnicos (8 prompts) | 8 / 8 | 8 / 8 | 8 / 8 |
| Prefill frío / caliente (tok/s) | 37,8–44,0 / 44,36 | 41,1–44,0 / 44,36 | 37,8–43,5 frío / 44,0 caliente |
| Decode N=1 / especulativo (tok/s) | 9,55 / 11,5–21,2 | 9,05 / 19,4–25,3 | 8,75 / 11,2–21,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. Requiere aproximadamente 59,13 GiB de RAM residente con `-c 32768` y deja unos 3,4 GiB de margen para el sistema operativo en una máquina de 64 GB.
- GPU: no se requiere ninguna. El autor mide con 0 GPUs.
- CPU: Ryzen 9 9955HX (16 núcleos) como referencia. Se admiten Zen 4/5 e Ice Lake+ con AVX-512, y Haswell, Skylake, Zen 2/3, Alder Lake y Raptor Lake con AVX2 (binario sin instrucciones `%zmm`).
- Memoria: DDR5-5600 en la medición de referencia; se recomienda activar Transparent HugePages.
- Despliegue: exclusivamente con `llama-modchip` (binarios `llama-server-modchip-linux-x86_64-avx512` o `...-avx2` incluidos en el repo, o `./modchip setup` desde el repositorio GitHub). No compatible con Ollama, LM Studio, vLLM ni llama.cpp sin parchear.
- Rendimiento: prefill de 37,8–43,5 tok/s en frío y 44,0 tok/s en caliente; decode de 8,75 tok/s con N=1 y 11,2–21,0 tok/s con decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF (este) | 284,33B totales / 13,17B activos | no disponible | MIT | GGUF + llama-modchip | Abliterado; PPL 1,7597; 70/80 en puerta funcional |
| Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF | 284,33B totales / 13,17B activos | no disponible | MIT | GGUF + llama-modchip | Alineado; PPL 1,8284; 64/80 en puerta funcional |
| Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF | 284,33B totales / 13,17B activos | no disponible | MIT | GGUF + llama-modchip | Alineado; PPL 1,8258; 66/80 en puerta funcional |
| deepseek-ai/DeepSeek-V4-Flash-0731 (original) | 284,33B totales / 13,17B activos | no disponible | no disponible | safetensors BF16/FP8/MXFP4 | Checkpoint alineado de referencia; sin cuantización CPU |

## Limitaciones y advertencias

- Checkpoint abliterado: los filtros de rechazo del modelo original están desactivados y el modelo puede generar contenido sensible, dañino, ofensivo o inexacto si se le induce.
- No debe exponerse en endpoints públicos, multiusuario o sin autenticación sin moderación externa independiente; el autor restringe su uso a investigación de seguridad autorizada, CTF, auditoría de vulnerabilidades, evaluación académica y desarrollo local offline.
- El usuario asume toda la responsabilidad legal y ética del uso.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo en la información disponible.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingüe.
- Longitud de contexto oficial no disponible; las pruebas se limitan a 3.038 tokens y a una configuración de 32.768.
- Compatibilidad muy restringida: requiere el runtime `llama-modchip`; Ollama, LM Studio, vLLM y llama.cpp sin parchear fallan con `unknown tensor type 42`.
- Requiere hardware con AVX-512 o AVX2 y al menos 64 GB de RAM para el binario de 56,93 GiB; por debajo de ese umbral el modelo no cabe sin swap.
- El rendimiento en decode es bajo (8,75 tok/s en N=1), lo que limita su uso interactivo en tiempo real.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF
- Modelo base abliterado: https://huggingface.co/prem-research/DeepSeek-V4-Flash-0731-abliterated
- Variante alineada Fractal: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF
- Variante alineada VQ3: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF
- Runtime llama-modchip: https://github.com/synchopate/llama-modchip
- Modelo original DeepSeek-V4-Flash-0731: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
