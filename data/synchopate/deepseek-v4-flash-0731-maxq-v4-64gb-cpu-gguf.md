# Synchopate/DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF es una cuantización GGUF del modelo base deepseek-ai/DeepSeek-V4-Flash-0731, publicada por el usuario Synchopate bajo licencia MIT. El modelo original es un transformer de mezcla de expertos (MoE) con 284,33 mil millones de parámetros totales y 13,17 mil millones activos, distribuidos en 43 capas con 256 expertos enrutados y 1 compartido por capa, con enrutamiento Top-6 sin podar. Esta versión cuantizada comprime el checkpoint hasta 57,99 GiB (62,27 GB) en tres shards, lo que permite su ejecución en hosts con 64 GB de RAM sin GPU dedicada.

La innovación principal de esta ficha es el esquema de cuantización MaxQ-v4, que emplea únicamente tipos de tensor estándar de ggml (F32, BF16, I32, Q8_0, Q6_K, Q5_K, Q4_K, MXFP4, IQ2_XXS, IQ1_M, IQ1_S) sin tipos personalizados, lo que garantiza compatibilidad nativa con Metal en Apple Silicon (M1-M5), CUDA MMQ con fusión automática de MUL_MAT_ID y ADD_ID, Vulkan, ARM64 NEON y x86-64 AVX2/AVX-512. El autor denomina al método "ConeCollapse" con "DualGram" por defecto y lo describe como 100% libre de donantes, es decir, construido directamente desde los pesos del modelo original sin copiar de otras cuantizaciones externas.

Su relevancia actual radica en que hace viable la inferencia local de un MoE de casi 285 mil millones de parámetros en hardware de consumo o estaciones de trabajo sin GPU, mediante el motor llama-modchip v2.5.5+ con loader deepseek4. El repositorio incluye binarios portables para Linux x86_64 (AVX-512 y AVX2) y scripts de compilación para Apple Silicon y Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 43 capas, 256 expertos enrutados + 1 compartido por capa, enrutamiento Top-6 |
| Parametros totales | 284,33 mil millones (256.989.802.583 según safetensors) |
| Parametros activos | 13,17 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, I32, Q8_0, Q6_K, Q5_K, Q4_K, MXFP4, IQ2_XXS, IQ1_M, IQ1_S (todos estándar de ggml, sin tipos personalizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 1.362 tensores, 62.270.037.248 bytes = 57,993491 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 43 capas, 256 expertos enrutados más 1 compartido por capa y enrutamiento Top-6 sin podar, con 284,33B parámetros totales y 13,17B activos. La cuantización MaxQ-v4 colapsa el ancho intermedio de los expertos en 34 de las 43 capas MoE a K = 1792 (7 × 256) e introduce un sesgo `blk.*.ffn_down_exps.bias`. El esquema emplea "DualGram" sin centrar con K=2048 y `output_norm` con tau=1.0 durante la validación, y se construye de forma 100% libre de donantes directamente desde el commit `7872f01b1d1fe23eabc4c98b48bffcef5a386062` del modelo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de esta publicación es la eliminación total de tipos de tensor personalizados (frente a MaxQ-Fractal, que usaba GGML_TYPE_Q2_0 = 42), lo que habilita la compatibilidad nativa con todos los backends de llama.cpp mencionados y reduce la fricción de despliegue. El motor requerido es llama-modchip v2.5.5+ con loader `deepseek4`, con binarios portables Linux x86_64 compilados contra GLIBC 2.30 y endurecidos para IPC.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y matemáticas: capacidades heredadas del modelo base DeepSeek-V4-Flash, si bien no se detallan en la información disponible.
- Generación de código: el tag `claude-code` sugiere uso orientado a asistentes de programación, aunque no se especifican detalles.
- Inferencia en CPU: diseñado explícitamente para ejecución sin GPU en hosts de 64 GB.
- Compatibilidad multiplataforma: Metal (M1-M5), CUDA MMQ, Vulkan, ARM64 NEON, x86-64 AVX2 y AVX-512.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU: el checkpoint de 57,99 GiB cabe en hosts de 64 GB de RAM y se ejecuta con los binarios AVX-512 (Zen 4/5, Ice Lake+) o AVX2 (Haswell, Skylake, Zen 2/3, Alder/Raptor Lake) incluidos en el repositorio, lo que permite desplegar un MoE de 284B parámetros en hardware de consumo.
- Asistencia de programación en local: el tag `claude-code` y el preset `dsv4-maxq` (por defecto en hosts de 60 GB+) apuntan a su uso como backend de asistentes de código sin depender de la nube, con la ventaja de privacidad que ello conlleva.
- Despliegue en Apple Silicon: gracias a la compatibilidad nativa con Metal (M1-M5) y al script `apple-silicon/build-dsv4-engine.sh`, puede ejecutarse en Mac Studios con memoria unificada suficiente para alojar los 57,99 GiB.
- Servicio conversacional de bajo coste: al no requerir GPU, el coste por token se reduce al consumo eléctrico de la CPU, adecuado para prototipos y entornos de desarrollo.
- Investigación en cuantización: el repositorio documenta metodología de evaluación con `llama-perplexity` y KL-divergence sobre `wiki-alt.txt`, lo que lo convierte en referencia para estudiar el impacto de esquemas de cuantización agresivos en MoE.
- Evaluación comparativa de variantes: el autor publica cinco variantes (MaxQ-v4, MaxQ-Fractal, VQ3, Fractal y Abliterated), lo que permite comparar fidelidad y huella en memoria para un mismo modelo base.
- Experimentación con modelos sin censura: la variante Abliterated Fractal (56,93 GiB) permite estudiar el comportamiento del modelo sin el alineamiento de seguridad, con las advertencias éticas correspondientes.

## Benchmarks y rendimiento

Evaluación con `llama-perplexity -f wiki-alt.txt -c 5632 -b 5632 --kl-divergence-base ref5632.kld` sobre 143.565 posiciones puntuadas (51 chunks) contra una perplexity base de 4,331017 ± 0,027402:

| Checkpoint | Huella (GiB) | Partición | Mean PPL(Q) | Mean KLD (nats) | Median KLD | 90% KLD | Max KLD | RMS Δp | Same top p (Top-1) |
|---|---|---|---|---|---|---|---|---|---|
| MaxQ-v4 (v2.5.5, donor-free) | 57,99 | Todos 1..51 (143.565) | 6,8592 ± 0,0482 | 0,64851 ± 0,00354 | 0,18382 | 1,70610 | 20,5424 | 27,562% | 73,283% (105.209) |
| MaxQ-Fractal (v2.5.3, donor-free) | 56,93 | Todos 1..51 (143.565) | 7,2977 ± 0,0504 | 0,74000 ± 0,00383 | 0,27039 | 1,97159 | 21,3412 | 29,857% | 70,397% (101.065) |
| MaxQ-v4 (v2.5.5, donor-free) | 57,99 | Blind 3..51 (137.935) | 6,8471 | 0,62574 | — | — | — | 26,726% | 73,595% (101.513) |
| MaxQ-Fractal (v2.5.3, donor-free) | 56,93 | Blind 3..51 (137.935) | 7,2938 | 0,71791 | — | — | — | 29,054% | 70,701% (97.521) |

Según el autor, MaxQ-v4 reduce la PPL media un 6,01%, la KLD media un 12,36% y la KLD mediana un 32,02% respecto a MaxQ-Fractal, y mejora la coincidencia argmax Top-1 en 2,886 puntos porcentuales. En la partición ciega 3..51, frente a un híbrido donante interno (MaxQ-v3), MaxQ-v4 gana en KLD media (0,62574 vs 0,64872, -3,54%, p = 6,58 × 10^-5), RMS Δp (p = 8,84 × 10^-10) y Same top p (+1,152 pp, p = 1,26 × 10^-13), empatando en PPL (p = 0,840). Como referencias del proveedor en `wiki-alt.txt` que exceden 64 GB de RAM: bullerwins MXFP4_MOE-BF16 (150,75 GiB, PPL 4,5381 en 8×5090 / 4,3406 en H100) y Unsloth UD-IQ1_S (76,87 GiB, PPL 5,9734). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 57,99 GiB (62,27 GB) de memoria, apto para hosts con 64 GB de RAM o más.
- GPU recomendadas: no requiere GPU; compatible con Apple Metal (M1-M5), NVIDIA CUDA MMQ (con fusión automática MUL_MAT_ID + ADD_ID) y Vulkan.
- Cabe en GPU de consumo: no disponible como dato explícito; el diseño está orientado a CPU y memoria unificada.
- CPU recomendadas: x86-64 con AVX-512 (Zen 4/5, Ice Lake+) o AVX2 (Haswell, Skylake, Zen 2/3, Alder/Raptor Lake); requiere OpenMP (`libgomp1`) y GLIBC 2.30+.
- Opciones de despliegue: llama-modchip v2.5.5+ con loader `deepseek4` (binarios incluidos en el repo), compilación vía `./modchip setup`, `apple-silicon/build-dsv4-engine.sh` o `windows/build_patched_engine.ps1`. No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Huella | PPL (wiki-alt) | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-MaxQ-v4 (esta ficha) | 284,33B totales / 13,17B activos | 57,99 GiB | 6,8592 | MIT | CPU, tipos ggml estándar |
| DeepSeek-V4-Flash-0731-MaxQ-Fractal | 284,33B / 13,17B | 56,93 GiB | 7,2977 | MIT | Requiere tipo personalizado Q2_0 |
| bullerwins MXFP4_MOE-BF16 | no disponible | 150,75 GiB | 4,5381 (8×5090) / 4,3406 (H100) | no disponible | Excede 64 GB de RAM |
| Unsloth UD-IQ1_S | no disponible | 76,87 GiB | 5,9734 | no disponible | Excede 64 GB de RAM |

## Limitaciones y advertencias

- La cuantización agresiva degrada la fidelidad respecto al modelo base: la PPL media sube de 4,331 a 6,859 y la coincidencia Top-1 es del 73,283%, lo que implica divergencias notables en la distribución de probabilidad.
- Requiere un motor específico (llama-modchip v2.5.5+ con loader `deepseek4`); no es compatible con llama.cpp estándar ni con otras herramientas convencionales sin adaptación.
- La dependencia de binarios portables con GLIBC 2.30 y OpenMP limita su despliegue en entornos con versiones antiguas de glibc o sin `libgomp1`.
- El modelo base es de noviembre de 2026 según la fecha de creación del repo; la información sobre sesgos, alucinación y comportamiento multilingüe no está disponible.
- El uso comercial está permitido por la licencia MIT, pero debe verificarse la licencia del modelo base DeepSeek-V4-Flash-0731, que no se detalla en la información proporcionada.
- Existe una variante "Abliterated" sin alineamiento de seguridad; no debe confundirse con esta versión y requiere precaución en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del rendimiento declarado.
- Los benchmarks presentados son de perplexity y divergencia KL, no de tareas downstream (razonamiento, código, matemáticas), por lo que no permiten extrapolar calidad en uso real.

## Enlaces

- Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-v4-64GB-CPU-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio del motor: https://github.com/synchopate/llama-modchip
- Log de benchmarks: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/results/atomicchat_wikialt_ctx5632_51c_dsv4_maxq_v4.log
- Variante MaxQ-Fractal: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF
- Variante VQ3: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF
- Variante Fractal: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF
- Variante Abliterated: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF
