# Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF

## Resumen

DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF es una cuantización GGUF de tipo "MaxQ-Fractal" del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario Synchopate. Se trata de una compilación optimizada para inferencia en CPU sobre equipos con 64 GB de memoria RAM, que comprime los 284.334 millones de parámetros totales del modelo original (13,17 mil millones activos) hasta ocupar 56,93 GiB en tres shards, con una media de 1,72 bits por peso.

El checkpoint se construyó en una pasada única y "donor-free" sobre los 1.328 tensores del modelo base, combinando cuantización Fractal-64 (30 bytes por cada 64 pesos) para las proyecciones MLA y el Lightning Indexer, Q6_K y Q8_0 para los tensores densos, y una matriz de importancia de 1,5 millones de tokens calibrada por Salvatore Sanfilippo (antirez) para los 129 tensores MoE enrutados. El resultado es una variante alineada en seguridad que sirve como referencia de calidad dentro de la familia de cuantizaciones del autor.

Su relevancia radica en permitir ejecutar un modelo MoE de casi 300.000 millones de parámetros en un equipo de sobremesa sin GPU, a costa de requerir un runtime parcheado (`llama-modchip` v2.5.4) que soporta el tipo `GGML_TYPE_Q2_0 = 42` reutilizado y la arquitectura `deepseek4` con MLA y Sinkhorn-20. No es compatible con Ollama, LM Studio, vLLM ni llama.cpp estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (Multi-head Latent Attention) y Lightning Indexer, arquitectura `deepseek4`; 43 capas, 256 expertos enrutados + 1 compartido por capa, Top-6 sin podar |
| Parametros totales | 284.334.567.511 (284,33B) |
| Parametros activos | 13,17B |
| Longitud de contexto | no disponible (la model card no declara la ventana nativa; las pruebas usan ctx=5632 y 8192 tokens) |
| Tipos de cuantizacion | Fractal-64 (3,75 bpw) para MLA e Indexer; Q6_K (173 tensores) y Q8_0 (1 tensor) para densos; media global 1,72 bpw; tipo GGML `Q2_0 = 42` reutilizado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 61.129.364.160 bytes = 56,93 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 43 capas, 256 expertos enrutados y 1 experto compartido por capa, con enrutamiento Top-6 sin podar y 13,17B parámetros activos sobre 284,33B totales. Incorpora atención MLA (Multi-head Latent Attention) y un mecanismo denominado Lightning Indexer, propio de la familia DeepSeek-V4. Los pesos originales se distribuyen en safetensors en BF16, FP8_E4M3 y MXFP4.

Esta cuantización no entrena el modelo: parte de los safetensors del checkpoint `deepseek-ai/DeepSeek-V4-Flash-0731` (commit `7872f01b1d1fe23eabc4c98b48bffcef5a386062`) y aplica una compilación en una sola pasada sobre los 1.328 tensores. Los 174 tensores densos de cuello de botella (100% activos) se retienen en Q6_K/Q8_0, las 317 proyecciones de atención MLA y Lightning Indexer se codifican en Fractal-64 (3,75 bpw), y los 129 tensores MoE enrutados se ponderan con la matriz de importancia de 1,5 millones de tokens `DeepSeek-V4-Flash-chat-v2-routed-moe-ds4-1p5m.dat` de antirez, calibrada el 12 de mayo de 2026 sobre activaciones chat-v2. La innovación técnica principal es el formato Fractal-64 (30 bytes por 64 pesos) y el runtime `llama-modchip`, que reutiliza el identificador `GGML_TYPE_Q2_0 = 42` y añade soporte para MLA y Sinkhorn-20.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredadas del modelo base DeepSeek-V4-Flash.
- Tool calling y function calling: la puerta funcional del autor otorga 30/30 puntos en la categoría Tools.
- Recuperación de información en contexto largo (needle-in-a-haystack): 20/20 en la prueba funcional.
- Generación de código: 20/30 en la puerta funcional de Code, el punto más flojo de la evaluación del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Ejecución en CPU sin GPU, con binarios AVX-512 (Zen 4/5, Ice Lake+) y AVX2 (Haswell, Skylake, Zen 2/3, Alder/Raptor Lake).
- Integración declarada con Claude Code según las etiquetas del repositorio.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente de código en estación de trabajo sin GPU: con 13,17B parámetros activos y tool calling fiable (30/30 en Tools), puede integrarse en flujos tipo Claude Code sobre un equipo de 64 GB de RAM, aceptando la latencia de decodificación de ~8,66 tok/s.
- Atención al cliente automatizada en local: el modelo gestiona conversaciones multi-turno y recuperación de contexto (20/20 en Needle) sin enviar datos a la nube, lo que encaja en entornos con requisitos de soberanía del dato.
- Procesamiento por lotes de documentos largos en servidores sin acelerador: la ventana de contexto permite trocear y resumir corpus de forma secuencial, con un prefill de ~36-37 tok/s que hace viable el procesamiento nocturno.
- Despliegue en entornos air-gapped: al ser un GGUF autónomo con binarios portables Linux x86_64 (GLIBC 2.30), puede instalarse en máquinas aisladas sin acceso a repositorios de modelos.
- Evaluación e investigación de cuantización extrema: sirve como referencia alineada en seguridad (KLD 0,0000 nats frente a sí misma) para comparar técnicas de compresión MoE con matrices de importancia.
- Prototipado de agentes multi-paso con herramientas: la puntuación perfecta en Tools permite construir pipelines de agentes que invocan APIs locales antes de migrar a infraestructura con GPU.

## Benchmarks y rendimiento

Datos medidos por el autor en un AMD Ryzen 9 9955HX de 16 núcleos con 64 GB DDR5-5600, sin GPU, en Linux:

| Metrica | MaxQ-Fractal (56,93 GiB) | Fractal-64 (56,57 GiB) | VQ3 (56,40 GiB) |
|---|---|---|---|
| PPL WikiText-2 (8.192 tok) | 11,6139 ± 0,5845 | 11,5288 ± 0,5563 | 12,2345 ± 0,5976 |
| PPL AtomicChat wiki-alt (ctx=5632, 51 chunks) | 7,2977 ± 0,0504 | no disponible | no disponible |
| PPL AtomicChat wiki-alt (ctx=5632, 12 chunks) | 7,3180 ± 0,1039 | no disponible | 7,6579 ± 0,1077 |
| KLD step-0 vs. MaxQ v2.5.3 (32 sondas, T=1.0) | 0,0000 nats (100% Top-1) | 0,8437 nats (56,2% Top-1) | 0,8409 nats (59,4% Top-1) |
| KLD rollout con prefijo emparejado | 0,0000 nats (100% Top-1) | 0,4373 nats (74,3% Top-1) | 0,4397 nats (75,2% Top-1) |
| Puerta funcional (80 pts: Tools/Code/Needle) | 70,0 (30/20/20) | 64,0 (24/20/20) | 64,0 (24/20/20) |
| Auditoría de seguridad dual-use (8 prompts) | 8/8 | 8/8 | 8/8 |
| Prefill en frío (tok/s) | 36,11 (pp67) / 37,56 (Gate) | 37,79 (pp128) | 41,11 (pp128) |
| Decodificación pura (tg64, N=1) | 8,66 tok/s | 9,06 tok/s | 9,05 tok/s |
| VmRSS (heap anónimo, -c 32768 -ub 512) | 57,54 GiB idle / 58,13 GiB PVS | 58,20 GiB | 58,31 GiB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el checkpoint está diseñado para inferencia en CPU. El consumo de RAM medido es de 57,54 GiB en reposo y 58,13 GiB en configuración PVS, por lo que se recomienda un host con 64 GB de RAM o más.
- GPU: no se requiere ninguna; el autor ejecuta la evaluación con 0 GPUs. No se documenta soporte de offload a GPU en el runtime `llama-modchip`.
- Consumer GPU: no aplica en su forma actual; el checkpoint no carga en Ollama, LM Studio, vLLM ni llama.cpp sin parchear.
- CPU: se requieren binarios `llama-modchip` v2.5.4 portables para Linux x86_64 con GLIBC 2.30; variante `-avx512` para Zen 4/5 e Ice Lake o superior, y `-avx2` para Haswell, Skylake, Zen 2/3, Alder Lake y Raptor Lake (sin instrucciones `%zmm` ni `AVX512_BF16`). Requiere OpenMP (`libgomp1`).
- Despliegue: exclusivamente mediante `llama-modchip` (binarios incluidos o `./modchip setup` desde el repositorio del autor), con preset `dsv4-maxq`. No compatible con vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput medidos: prefill en frío de 36,11-37,56 tok/s y decodificación de 8,66 tok/s (media de 3 ejecuciones: 8,61 tok/s) en un Ryzen 9 9955HX de 16 núcleos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MaxQ-Fractal-64GB (este) | 284,33B totales / 13,17B activos | no disponible | MIT | GGUF, solo `llama-modchip` | Referencia alineada en seguridad; 70/80 en puerta funcional |
| Fractal-64GB (`Synchopate/...-Fractal-64GB-CPU-GGUF`) | 284,33B / 13,17B | no disponible | MIT | GGUF, `llama-modchip` | 56,57 GiB; 64/80 en puerta funcional; KLD 0,8437 nats frente a MaxQ |
| VQ3-64GB (`Synchopate/...-VQ3-64GB-CPU-GGUF`) | 284,33B / 13,17B | no disponible | MIT | GGUF, `llama-modchip` | 56,40 GiB; 64/80; PPL WikiText-2 de 12,2345 |
| Abliterated-Fractal-64GB (`Synchopate/...-Abliterated-Fractal-64GB-CPU-GGUF`) | 284,33B / 13,17B | no disponible | MIT | GGUF, `llama-modchip` | Variante sin censura opt-in; 70/80; KLD 0,0959 nats frente a MaxQ |

No se dispone de datos de benchmarks estándar para comparar con modelos de otros autores de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad restringida: no carga en Ollama, LM Studio, vLLM ni llama.cpp sin parchear; un runtime estándar falla con desajuste de límites de tensor o el error `unknown model architecture: 'deepseek4'`.
- Requiere el runtime `llama-modchip` v2.5.4 y binarios específicos por microarquitectura; no hay soporte documentado para Windows ni macOS.
- La cuantización a 1,72 bpw media introduce degradación medible: la puerta funcional baja a 70/80 (Code 20/30) y la PPL de WikiText-2 sube a 11,6139 frente a la referencia de línea base del autor.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de veracidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá del inglés implícito en las evaluaciones.
- Aunque la licencia es MIT, el uso comercial debe verificar las condiciones del modelo base DeepSeek-V4-Flash-0731 y del runtime `llama-modchip`.
- El rendimiento de 8,66 tok/s limita su uso interactivo en tiempo real; es más adecuado para procesos por lotes o asistentes asíncronos.
- Existe una variante "Abliterated" sin alineación de seguridad en el mismo repositorio del autor; no debe confundirse con este checkpoint alineado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Runtime `llama-modchip`: https://github.com/synchopate/llama-modchip
- Resultados de benchmarks del autor: https://github.com/synchopate/llama-modchip/tree/main/benchmarks/results
- Matriz de importancia de antirez: https://huggingface.co/antirez/deepseek-v4-gguf (commit f71f23d552d6)
- Variante Fractal-64: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Fractal-64GB-CPU-GGUF
- Variante VQ3: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-VQ3-64GB-CPU-GGUF
- Variante Abliterated: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-Abliterated-Fractal-64GB-CPU-GGUF
