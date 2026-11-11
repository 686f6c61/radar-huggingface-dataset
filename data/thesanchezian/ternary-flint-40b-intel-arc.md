# TheSanchezian/Ternary-Flint-40B-Intel-Arc

## Resumen

Ternary-Flint-40B-Intel-Arc es un repositorio de código, no un modelo con pesos, publicado por el usuario TheSanchezian. Contiene un runtime mínimo escrito en un único fichero Python (numpy + pyopencl) que permite ejecutar el modelo ternario MoE Ternary-Flint-40B, en formato GGUF PQ2_0 de aproximadamente 11 GB, sobre una única tarjeta Intel Arc A770 de 16 GB mediante OpenCL. El autor reporta velocidades de decodificación de 106,3 tok/s en contexto corto y 102,9 tok/s de media hasta la posición 2048, muy por encima de su mejor conversión a OpenVINO (17,7 tok/s).

El interés técnico del proyecto radica en que demuestra que es posible servir un modelo MoE ternario de 40B parámetros en hardware consumer de Intel sin recurrir a CUDA ni a frameworks de inferencia convencionales. El runtime implementa atención con ventana deslizante y caché global, enrutado MoE top-6 sobre 256 expertos con rotación Hadamard y GEMV de 2 y 4 bits escritos específicamente para la arquitectura Xe-HPG.

No se incluyen pesos en el repositorio: el usuario debe descargar el GGUF desde kabcpc/Ternary-Flint-40B-GGUF y el tokenizer.json desde el modelo base RecursiveSI/flint. La licencia del código es Apache-2.0; los pesos se rigen por su propia licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (ventana deslizante + caché global), pesos ternarios |
| Parámetros totales | 40B (según nombre del modelo) |
| Parámetros activos | top-6 de 256 expertos enrutados (más experto compartido); número exacto no disponible |
| Longitud de contexto | 2048 tokens por defecto en el runtime (`--max-ctx`); ventana deslizante de 513 tokens en 35 capas |
| Tipos de cuantización | PQ2_0 (2 bits ternario en expertos enrutados, 4 bits en experto compartido y atención) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (código); pesos con licencia propia no especificada |
| Formato de pesos | GGUF (fichero `Ternary-Flint-40B-PQ2_0-Calibrated-11GB.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40B parámetros con pesos ternarios, servido a través de un GGUF cuantizado a PQ2_0. El runtime describe 49 capas de atención: 35 usan una ventana deslizante de 513 tokens implementada como ring buffer y 14 emplean una caché global. La atención se calcula con split-KV y learned sinks, y las proyecciones q/k/v se ejecutan como GEMV fusionados de 4 bits con RMSNorm calculada al vuelo.

La capa MoE emplea un router en f32 con activación sigmoide, top-6 de 256 expertos y normalización multiplicada por 1,24. Los expertos enrutados se ejecutan como GEMV ternarios de 2 bits, mientras que el experto compartido usa GEMV de 4 bits con SiLU·up fusionado. Cada activación de experto se rota una vez con Hadamard-512 dentro del kernel del experto compartido. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto autorregresiva con decodificación greedy y batch 1.
- Razonamiento y generación de lenguaje derivados del modelo base Flint, si bien no se documentan evaluaciones específicas.
- Ejecución de un MoE ternario de 40B en 16 GB de VRAM mediante repacking de pesos a layouts interleaved de 16 filas.
- Procesamiento de prompts token a token (sin prefill batcheado).
- Selección del siguiente token en GPU mediante kernel argmax, sin intervención del host.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking según la información disponible.
- No incluye plantilla de chat ni servidor; solo modos de línea de comandos (`check`, `speed`, `prompts`, `long`, `compare`).

## Casos de uso

- Investigación de inferencia en hardware Intel: el runtime sirve como banco de pruebas para medir el rendimiento de kernels OpenCL escritos a mano sobre GPUs Xe-HPG, con métricas reproducibles de tok/s y perplejidad.
- Despliegue de modelos MoE ternarios en estaciones de trabajo con Arc A770: permite ejecutar un modelo de 40B en 16 GB de VRAM sin GPU NVIDIA, útil en entornos con hardware Intel ya adquirido.
- Validación de cuantizaciones ternarias: el modo `check` compara logits y la decodificación greedy en GPU frente a host, lo que facilita verificar la corrección de nuevas conversiones GGUF.
- Benchmarking comparativo de runtimes: el modo `compare` ejecuta un plan de referencia con más lanzamientos de kernel para contrastar precisión y velocidad frente al plan principal.
- Medición de perplejidad en textos largos: el modo `long` calcula perplejidad token a token sobre ficheros de texto (por ejemplo WikiText-2), útil para evaluar degradación de calidad con contexto extendido.
- Pruebas de portabilidad a otras GPUs Arc: el autor solicita testers con B580, B570, Arc Pro B60, A750 y GPUs integradas para validar el runtime fuera de la A770, lo que lo convierte en una herramienta de caracterización de hardware.
- Prototipado de decodificación especulativa o esquemas de caché: la arquitectura de ring buffer de 513 tokens y caché global en 14 capas sirve como referencia para experimentos de atención con ventana deslizante.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Decodificación, contexto corto (posiciones ~9–265) | 106,3 tok/s |
| Decodificación, media hasta posición 2048 | 102,9 tok/s |
| Procesamiento de prompt (512 tokens, un token por paso) | 113 tok/s (4,52 s) |
| Tiempo de carga desde caché repackeada | ~8 s |
| Lanzamientos de kernel por token | 484 |
| Perplejidad en texto largo (1.600 tokens WikiText-2) | 13,38 (top-1 56,0%) |
| NaN / Inf en ejecuciones largas | 0 |
| Conversión a OpenVINO con ops GPU personalizadas (referencia) | 17,7 tok/s |
| Histórico de velocidad del runtime (media hasta 2048) | 57,4 → 65,2 → 90,9 → 97,0 → 98,9 → 102,9 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU Intel Arc A770 de 16 GB como plataforma validada; otras tarjetas Xe-HPG (B580, B570, Arc Pro B60, A750, integradas) podrían funcionar pero no están probadas.
- Driver Intel con soporte OpenCL y las extensiones `cl_intel_subgroups` y `cl_intel_required_subgroup_size`; el autor reporta el driver 32.0.101.9150 en Windows.
- 16 GB de VRAM suficientes para contexto de 2048 tokens con el GGUF de 11 GB.
- 10,3 GB de disco adicionales para la caché de pesos repackeados en formato `.npy`.
- Python 3.10 o superior con `numpy`, `pyopencl` y `tokenizers`.
- No requiere CUDA, vLLM, llama.cpp, Ollama ni TGI; el runtime es propio y específico para OpenCL sobre Intel.
- Throughput medido: 102,9 tok/s de media en decodificación batch 1 y 113 tok/s en procesamiento de prompt token a token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Flint-40B (runtime Intel Arc) | 40B (MoE ternario) | 2048 por defecto | 102,9 tok/s en A770 16 GB; perplejidad 13,38 en WikiText-2 | Apache-2.0 (código); pesos con licencia propia | GGUF en kabcpc/Ternary-Flint-40B-GGUF |
| Ternary-Flint-40B vía OpenVINO | 40B (MoE ternario) | no disponible | 17,7 tok/s en A770 16 GB | Apache-2.0 (código) | Conversión propia del autor, no publicada |
| Modelo base RecursiveSI/flint | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks estándar ni de modelos comparables de la misma categoría (MoE ternario de 40B) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta decodificación greedy en batch 1; no hay sampling, plantilla de chat ni servidor HTTP.
- El prompt se procesa un token por paso, sin prefill batcheado, lo que limita el rendimiento en prompts largos.
- Validado únicamente en una Arc A770 con Windows; el comportamiento en otras GPUs Arc, Linux u otros drivers es desconocido.
- El repositorio no incluye pesos ni tokenizer; el usuario debe descargarlos de terceros y asumir sus licencias.
- La licencia de los pesos no se especifica en la información disponible, por lo que el uso comercial del modelo requiere verificación independiente.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información proporcionada.
- Idiomas soportados no documentados; no hay evaluación multilingüe.
- El runtime depende de extensiones OpenCL específicas de Intel; no es portable a otras plataformas sin reescritura de kernels.
- Algunos kernels del código fuente se conservan solo para comparación y no se usan en el plan principal, lo que puede confundir a quien audite el código.

## Enlaces

- Repositorio del runtime: https://huggingface.co/TheSanchezian/Ternary-Flint-40B-Intel-Arc
- Pesos GGUF: https://huggingface.co/kabcpc/Ternary-Flint-40B-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
