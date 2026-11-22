# Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-64GB-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Synchopate bajo la librería `gguf` y orientada a inferencia en CPU sin GPU. El checkpoint cuantizado ocupa 53,99 GiB (57,97 GB) repartidos en dos shards y está diseñado específicamente para encajar en contenedores con 64 GB de RAM, manteniendo intactos los 512 expertos enrutados del MoE original en lugar de podarlos, como hacen otras cuantizaciones de tamaño similar.

El modelo base es un transformer híbrido con arquitectura `qwen4exp`: 48 capas de tronco (36 Gated DeltaNet y 12 de atención completa GQA), una capa adicional NextN de Multi-Token Prediction, y una tabla Per-Layer Embedding (PLE) de 320 millones de filas. Los parámetros totales rondan los 176,5B, con aproximadamente 5,0B activos por token gracias al enrutamiento Top-10 sobre 512 expertos más un experto compartido. La ventana de contexto no se especifica en la información disponible.

La relevancia de esta ficha radica en su propuesta técnica: comprimir la tabla PLE de 26,82 GiB a 10,73 GiB mediante PCA-Wiener y RaBitQ Q1_0 permite reinvertir 16,09 GiB en conservar todos los expertos del MoE, algo poco habitual en cuantizaciones de este tamaño. El autor reporta métricas de perplejidad y divergencia KL sobre un conjunto de validación, así como throughput en CPU, que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen4exp`: 48 capas de tronco (36 Gated DeltaNet + 12 GQA full attention, `compress_ratio = 4`) + 1 capa NextN MTP; MoE con 512 expertos enrutados (Top-10) + 1 experto compartido; tabla Per-Layer Embedding (PLE) de 320.001.536 filas |
| Parametros totales | ~176,5B (según model card); 210.290.858.624 según safetensors del repo base |
| Parametros activos | ~5,0B por token (10 de 512 expertos + 1 compartido + tronco denso GDN/GQA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tipos estándar ggml: `{F32: 351, Q8_0: 339, Q6_K: 198, IQ2_S: 60, BF16: 49, Q2_0: 39, IQ3_XXS: 36, MXFP4: 7, IQ4_NL: 4, Q2_K: 2, Q1_0: 1}`; `max_type = 42`, sin tipos personalizados |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | GGUF (2 shards + proyector de visión opcional en BF16) |

## Arquitectura y entrenamiento

El modelo base combina capas Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención completa GQA en una proporción de 36 a 12 sobre 48 capas de tronco. Sobre ese tronco se aplica un MoE de 512 expertos enrutados con activación Top-10 y un experto compartido, lo que da un ancho efectivo de 640 (`K = 640`) por capa. Se añade una capa `blk.48` de Multi-Token Prediction (NextN) de 0,81 GiB que permite decodificación especulativa interna. La tabla PLE de 320 millones de filas actúa como embedding por capa y es, con diferencia, el componente de mayor huella del checkpoint.

La innovación principal de esta cuantización es la compresión de la tabla PLE: de 26,82 GiB en IQ4_NL a 10,73 GiB mediante una proyección PCA-Wiener a dimensión 256 combinada con cuantización RaBitQ Q1_0. Los 16,09 GiB liberados se reinvierten en mantener los 512 expertos sin podar, usar escalas firmadas Q2_0 con `FP64 Woodbury DualGram` y conservar el módulo MTP. El autor indica que la conversión se hizo sin donantes externos ("100% donor-free") a partir de la revisión `812d96e10a0dd82b69d749e68693698cf6c36daa` del modelo base. No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagen y texto combinados mediante el proyector de visión opcional `mmproj-Qwen3.8-Flash-Next-BF16.gguf` (0,85 GiB, 334 tensores).
- Razonamiento multi-paso y decodificación especulativa gracias a la capa NextN MTP integrada (`blk.48`), con una tasa de aceptación reportada del 79,95 % en la carga de trabajo de refactorización.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Inferencia en CPU sin GPU mediante `llama.cpp` y el fork `llama-modchip v3.1.1`.

## Casos de uso

- Inferencia local en CPU sin GPU: el checkpoint está dimensionado para contenedores de 64 GB de RAM y el autor certifica 48,09 GiB de VmHWM en un contenedor de 74 GiB con 16 núcleos Zen 5, lo que permite desplegar un modelo de ~176,5B en hardware sin acelerador.
- Refactorización de código asistida: la carga de trabajo `W1` (refactor) alcanza 21,38 tok/s con una tasa de aceptación del 79,95 % en el módulo MTP, adecuada para tareas de edición de código interactivas en entornos con restricciones de GPU.
- Procesamiento de documentos con imagen y texto: con el proyector de visión opcional, el modelo puede abordar tareas de image-text-to-text en pipelines por lotes donde la latencia no es crítica.
- Servicio de chat conversacional de bajo coste: `llama-server` con el binario portable (GLIBC ≤ 2.30, x86_64) permite montar un endpoint compatible con la API de OpenAI en servidores sin GPU dedicada.
- Evaluación e investigación de cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de comprimir tablas de embedding masivas (PCA-Wiener + RaBitQ) frente a podar expertos MoE, con métricas PPL y KLD publicadas.
- Despliegue en entornos con presupuesto de memoria estricto: el límite de 55,5 GiB y la verificación de `pgsteal=0`, `workingset_refault=0` y `Swap=0` lo hacen apto para contenedores con cgroups ajustados donde no cabe una cuantización mayor.
- Prototipado de decodificación especulativa: la capa NextN integrada y el fork `llama-modchip` permiten experimentar con MTP sin infraestructura adicional.

## Benchmarks y rendimiento

Datos reportados por el autor de la cuantización (no verificados de forma independiente):

| Metrica | MaxQ-64GB | GSQ-RCO-Coder-IQ1_M (referencia) |
|---|---|---|
| Tamano | 53,99 GiB | 54,40 GiB |
| Expertos MoE | 512/512 (sin podar) | 256/512 (podados) |
| MTP | Si (`blk.48`) | No |
| Mean PPL (wiki-alt.txt) | 3,4325 ± 0,0708 | 5,0916 |
| Mean KLD | 0,4971 ± 0,0099 | 0,9302 |
| Median KLD | no disponible en tabla | -64,3 % respecto a MaxQ |
| Throughput agregado (4 cargas) | 15,34 tok/s | no disponible |
| Throughput `W1` refactor | 21,38 tok/s | no disponible |
| Prompt processing `pp512` | 71,97 tok/s | no disponible |
| Tasa de aceptación MTP | 79,95 % | no disponible |

Conjunto de evaluación: `wiki-alt.txt`, 40 × 512 fragmentos, con 0,000000 % de solapamiento de 8-gramas y 13-gramas con el conjunto de calibración. El autor indica que la comparación con GSQ-RCO-Coder-IQ1_M es sobre prosa general de Wikipedia y que ese checkpoint está ajustado para código, lo que limita la comparabilidad directa.

## Requisitos de hardware

- VRAM estimada: no aplica; el checkpoint está diseñado para inferencia en CPU. El autor certifica 48,09 GiB de VmHWM y 48,35 GiB de pico de cgroup en un contenedor de 74 GiB.
- RAM recomendada: 64 GB o más; el autor fija un techo de 55,5 GiB para el checkpoint LLM completo.
- GPU recomendadas: no disponibles; el diseño es explícitamente CPU-only (`0` GPUs en la certificación del autor).
- CPU: el binario portable detecta AVX-512 (con `avx512_vbmi` y `avx512_vnni`) o cae a AVX2. La certificación se hizo en 16 núcleos Zen 5.
- Cabe en GPU de consumo: no disponible; el tamaño de 53,99 GiB excede la VRAM de cualquier GPU de consumo actual, aunque podría particionarse con offload parcial en configuraciones de 24 GB o más.
- Opciones de despliegue: `llama.cpp` a través del fork `llama-modchip v3.1.1` (preset `qwen38-64gb` o `llama-server` directo); otros runtimes GGUF no están mencionados en la información disponible.
- Latencia y throughput: 15,34 tok/s agregado en 4 cargas de trabajo, 21,38 tok/s en refactor `W1`, 71,97 tok/s en `pp512`, sobre 16 núcleos Zen 5 sin GPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Expertos MoE | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF | ~176,5B (5,0B activos) | no disponible | 512/512 sin podar | qwen-community-1.0 | GGUF | MTP integrado; PPL 3,4325 en wiki-alt |
| ISTA-DASLab GSQ-RCO-Coder-IQ1_M | no disponible | no disponible | 256/512 podados | no disponible | GGUF | Sin MTP; PPL 5,0916 en wiki-alt; ajustado a código |
| Qwen/Qwen3.8-Flash-Next (BF16) | ~176,5B (5,0B activos) | no disponible | 512/512 | qwen-community-1.0 | safetensors (329,72 GiB) | Modelo base sin cuantizar |

No se dispone en la información proporcionada de otras alternativas comparables de la misma categoría (cuantizaciones GGUF de Qwen3.8 orientadas a CPU).

## Limitaciones y advertencias

- La model card advierte de que el badge `general.size_label = "5.0B"` de Hugging Face es un artefacto heredado de la cabecera de conversión y no refleja el tamaño real (~176,5B totales, ~5,0B activos). Herramientas que lean ese campo pueden dimensionar mal el modelo.
- Los benchmarks PPL y KLD son autodeclarados por el autor de la cuantización y no se han verificado de forma independiente; además, la comparación con GSQ-RCO-Coder-IQ1_M se hace sobre prosa de Wikipedia contra un checkpoint ajustado a código, lo que sesga la comparación.
- La licencia `qwen-community-1.0` impone condiciones específicas de uso comunitario; es necesario revisar el enlace de licencia del modelo base antes de un despliegue comercial.
- El checkpoint depende del fork `llama-modchip v3.1.1` para aprovechar el MTP y el preset; otros runtimes GGUF pueden no soportar los tipos `Q2_0` (42) o `Q1_0` (41) ni la capa NextN.
- La compresión agresiva de la tabla PLE (PCA-Wiener D=256 + RaBitQ Q1_0) puede degradar el rendimiento en tareas que dependan fuertemente de representaciones de embedding por capa; no se han publicado evaluaciones por tarea más allá de PPL y KLD.
- No hay información sobre sesgos, tasas de alucinación, idiomas soportados ni rendimiento en contextos largos.
- El uso en producción requiere validar el consumo de memoria en el hardware objetivo: la certificación se hizo en un contenedor concreto de 74 GiB y 16 núcleos Zen 5, y el comportamiento puede variar en otras configuraciones.
- El modelo base tiene 329,72 GiB en BF16; la cuantización a 53,99 GiB implica una pérdida de precisión no cuantificada más allá de las métricas agregadas reportadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fork de inferencia: https://github.com/synchopate/llama-modchip
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
