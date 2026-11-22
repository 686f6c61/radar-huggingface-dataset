# Synchopate/DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731, publicada por el usuario Synchopate bajo el marco técnico propio denominado MaxQ-v4 y ConeCollapse. El modelo base es un transformer de mezcla de expertos (MoE) de DeepSeek con 284.330 millones de parámetros totales y 13.170 millones de parámetros activos por token, distribuidos en 43 capas con 256 expertos enrutados más uno compartido por capa y enrutamiento Top-6 sin podar. Esta versión cuantizada comprime el modelo hasta 57,99 GiB (62,27 GB) para que quepa en máquinas con 64 GB de RAM y pueda ejecutarse en CPU.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo MoE de casi 285.000 millones de parámetros puede servirse en un equipo de 64 GB sin GPU, algo impensable hace pocos años. Por otro, introduce una dependencia crítica: el checkpoint emplea un sesgo de experto colapsado (`blk.*.ffn_down_exps.bias`) con anchura intermedia K = 1792 en 34 de las 43 capas MoE, lo que obliga a cargarlo con un fork específico de llama.cpp llamado `llama-modchip v3.1.1`. Las herramientas estándar como Ollama o LM Studio no cargan ese sesgo y, por tanto, no son compatibles.

El autor publica métricas de perplejidad y divergencia KL sobre el corpus wiki-alt, con una perplejidad media de 6,8592 frente a los 4,3310 del modelo base sin cuantizar, y una tasa de coincidencia en el top-1 del 73,28 %. La licencia es MIT, lo que facilita el uso comercial, aunque la dependencia de un loader no estándar y la ausencia de datos sobre idiomas y benchmarks estándar limitan su adopción inmediata en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 43 capas, 256 expertos enrutados + 1 compartido por capa, Top-6 routing |
| Parámetros totales | 284.330 millones (256.989.802.583 según safetensors del repo) |
| Parámetros activos | 13.170 millones |
| Longitud de contexto | No disponible en la información proporcionada (el benchmark se ejecutó con `-c 5632` y `-c 32768` en la nota de memoria) |
| Tipos de cuantización | Mezcla de F32, BF16, I32, Q8_0, Q6_K, Q5_K, Q4_K, MXFP4, IQ2_XXS, IQ1_M, IQ1_S (max_type = 39, sin tipos personalizados) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 1.362 tensores, 62.270.037.248 bytes) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de mezcla de expertos con 43 capas, 256 expertos enrutados más un experto compartido por capa y enrutamiento Top-6 sin podar. La variante MaxQ-v4 conserva esa topología y aplica una técnica propia del autor llamada ConeCollapse, que colapsa la anchura intermedia de los expertos a K = 1792 (7 × 256) en 34 de las 43 capas MoE, añadiendo un sesgo `ffn_down_exps.bias`. Según la model card, la cuantización es 100 % donor-free: no se copian pesos de otros checkpoints cuantizados, sino que se derivan directamente del modelo base en el commit `7872f01b1d1fe23eabc4c98b48bffcef5a386062`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card tampoco detalla innovaciones de decodificación especulativa ni atención lineal. La innovación técnica destacable de esta publicación es el formato de cuantización: usa exclusivamente tipos ggml estándar, lo que permite compatibilidad nativa con Metal (M1–M5), CUDA MMQ con fusión automática de `MUL_MAT_ID + ADD_ID`, Vulkan, ARM64 NEON y x86-64 AVX2/AVX-512, a cambio de requerir el loader `llama-modchip v3.1.1` para interpretar el sesgo ConeCollapse.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card lo etiqueta como `conversational`.
- Razonamiento y matemáticas: no hay datos específicos publicados en la información disponible; el modelo base es un MoE de gran tamaño, pero no se documentan evaluaciones.
- Generación de código: la etiqueta `claude-code` sugiere uso en entornos de asistencia a la programación, aunque no se aportan benchmarks.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repo está vacío.
- Capacidades especiales: inferencia en CPU sin GPU, con soporte para Metal, CUDA, Vulkan, AVX2 y AVX-512; pensado para entornos de 64 GB de RAM.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU: el checkpoint ocupa 57,99 GiB y está diseñado para caber en 64 GB de RAM. Se cargaría con `llama-modchip v3.1.1` en un equipo x86-64 con AVX-512 o AVX2, o en un Apple Silicon con Metal, para tareas de generación de texto sin depender de la nube.
- Asistencia a la programación en local: la etiqueta `claude-code` y el tamaño del modelo lo orientan a flujos de autocompletado y revisión de código dentro de un IDE, siempre que se integre mediante el loader compatible y no mediante Ollama o LM Studio.
- Procesamiento por lotes de documentos largos: con una ventana de contexto que el autor ha probado hasta 32.768 tokens en la nota de memoria, podría usarse para resumir o extraer información de documentos extensos en un servidor sin GPU.
- Servicio de chat interno en una pyme: al tener licencia MIT, se puede desplegar en un servidor de 64 GB para atención al cliente o asistentes internos, aceptando el coste de latencia de la inferencia en CPU.
- Investigación sobre cuantización extrema: el checkpoint sirve como caso de estudio para medir la degradación de perplejidad y divergencia KL al comprimir un MoE de 284B a 58 GiB, con métricas publicadas sobre wiki-alt.
- Despliegue en entornos con restricciones de hardware: para organizaciones que no pueden adquirir GPU pero sí disponen de nodos de 64 GB, este modelo ofrece una alternativa local a APIs comerciales, con la advertencia de que el rendimiento en bare-metal a 60 GiB está sin verificar según el propio autor.

## Benchmarks y rendimiento

El autor publica una evaluación de perplejidad y divergencia KL sobre el corpus `wiki-alt` con `llama-perplexity -f wiki-alt.txt -c 5632 -b 5632 --kl-divergence-base ref5632.kld`, con 143.565 posiciones puntuadas en 51 chunks. La perplejidad del modelo base de referencia es 4,331017 ± 0,027402.

| Checkpoint | Huella (GiB) | Partición | PPL media | KLD media (nats) | KLD mediana | KLD 90 % | KLD máxima | RMS Δp | Same top p (Top-1) |
|---|---|---|---|---|---|---|---|---|---|
| MaxQ-v4 (donor-free) | 57,99 | 1..51 (143.565) | 6,8592 ± 0,0482 | 0,64851 ± 0,00354 | 0,18382 | 1,70610 | 20,5424 | 27,562 % | 73,283 % (105.209) |
| MaxQ-Fractal v2.5.3 (legacy) | 56,93 | 1..51 (143.565) | 7,2977 ± 0,0504 | 0,74000 ± 0,00383 | 0,27039 | 1,97159 | 21,3412 | 29,857 % | 70,397 % (101.065) |
| MaxQ-v4 (donor-free) | 57,99 | Blind 3..51 (137.935) | 6,8471 | 0,62574 | — | — | — | 26,726 % | 73,595 % (101.513) |
| MaxQ-Fractal v2.5.3 (legacy) | 56,93 | Blind 3..51 (137.935) | 7,2938 | 0,71791 | — | — | — | 29,054 % | 70,701 % (97.521) |

Según la model card, MaxQ-v4 reduce la PPL media un 6,01 % respecto a MaxQ-Fractal. También se cita un rendimiento de `15,34 agg / 21,38 W1 tok/s` en la prueba RouteCrack 2.0 para el modelo hermano Qwen3.8-Flash-Next-MaxQ-64GB-GGUF, no para este checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su caso principal, ya que está diseñado para CPU. El checkpoint ocupa 57,99 GiB en disco y requiere al menos 61 GiB de RAM libre para residencia sin refault en bare-metal, según la nota del autor.
- GPU recomendadas: el autor declara compatibilidad con Apple Metal (M1–M5), NVIDIA CUDA con MMQ y Vulkan, pero no publica cifras de VRAM para GPU. No se dispone de datos de rendimiento en GPU para este checkpoint.
- ¿Cabe en GPU de consumo? No se puede confirmar: 57,99 GiB excede la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, por ejemplo). La inferencia está pensada para CPU o para GPU de datacenter con suficiente memoria, sin datos publicados.
- Opciones de despliegue: obligatoriamente `llama-modchip v3.1.1` (binarios estáticos GLIBC_2.30 para Linux x86_64, o instalación con `./install.sh --preset dsv4-maxq`). Ollama y LM Studio estándar no cargan el sesgo ConeCollapse y no son compatibles.
- Latencia y throughput: la model card cita `15,34 agg / 21,38 W1 tok/s` para un modelo hermano distinto (Qwen3.8-Flash-Next-MaxQ-64GB-GGUF), no para este. Para este checkpoint no se publican tok/s. La nota de memoria menciona `8,88 ± 0,25` RC2 y `7,68 ± 0,01` N=1 en un entorno con hypervisor y ZFS ARC, y advierte que el throughput en bare-metal a 60 GiB está sin verificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-MaxQ-v4-64GB | 284,33 B | 13,17 B | No disponible | MIT | GGUF (58 GiB) | Requiere llama-modchip v3.1.1 |
| DeepSeek-V4-Flash-0731 (base) | 284,33 B | 13,17 B | No disponible | No disponible | Safetensors | Referencia de PPL 4,3310 |
| MaxQ-Fractal v2.5.3 (retirado) | 284,33 B | 13,17 B | No disponible | MIT | GGUF (56,93 GiB) | Retirado en noviembre de 2026; PPL 7,2977 |
| Qwen3.8-Flash-Next-MaxQ-64GB | No disponible | No disponible | No disponible | No disponible | GGUF | Modelo hermano del mismo autor, con 3,4325 PPL wiki-alt y 15,34 tok/s |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de ~280B en GGUF para CPU) en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un loader no estándar: sin `llama-modchip v3.1.1`, el sesgo ConeCollapse no se carga y el modelo no funciona correctamente. Ollama y LM Studio estándar no son compatibles.
- Degradación de calidad medible: la PPL media sube de 4,3310 (base) a 6,8592, y la coincidencia top-1 es del 73,28 %, lo que implica una pérdida sustancial de fidelidad respecto al modelo original.
- Requisito de memoria ajustado: 57,99 GiB de GGUF más 2,25–2,67 GiB anónimos dan un working set de 60,3–60,7 GiB; se necesitan al menos 61 GiB de RAM libre para evitar refaults. En un cgroup de 60 GiB el autor reporta funcionamiento sin OOM pero con refaults de 10,7–30,7 GiB por ejecución.
- Throughput en bare-metal no verificado: el propio autor advierte que el rendimiento a 60 GiB en bare-metal de 64 GB está sin verificar; las cifras publicadas provienen de un entorno con hypervisor y ZFS ARC.
- Idiomas no declarados: el campo de idiomas está vacío, por lo que no se puede garantizar un comportamiento multilingüe adecuado.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad o sesgo en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; al ser una cuantización agresiva de un MoE, es esperable un aumento respecto al modelo base, pero no hay medición publicada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el modelo base ni sobre el fork del loader; conviene revisar las condiciones del repositorio `llama-modchip`.
- Historial de retiradas: el autor retiró previamente las variantes MaxQ-Fractal, VQ3, Fractal y Abliterated-Fractal en noviembre de 2026, lo que indica cierta inestabilidad en el linaje de publicaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio del loader llama-modchip: https://github.com/synchopate/llama-modchip
- Release v3.1.1 del loader: https://github.com/synchopate/llama-modchip/releases/tag/v3.1.1
- Benchmark de memoria en cgroup de 60 GiB: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/results/dsv4_64gb_cgroup60g_v311.json
- Log de perplejidad wiki-alt: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/results/atomicchat_wikialt_ctx5632_51c_dsv4_maxq_v4.log
- Resultados en Apple Silicon (build Fractal retirado): https://github.com/synchopate/llama-modchip/blob/main/apple-silicon/results/dsv4-m5max.md
- Modelo hermano Qwen3.8-Flash-Next-MaxQ-64GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Modelo hermano Qwen3.8-Flash-Next-MaxQ-32GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Modelo hermano NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Modelo hermano NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
