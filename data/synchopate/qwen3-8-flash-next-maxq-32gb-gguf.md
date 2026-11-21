# Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-32GB-GGUF es una cuantización GGUF extrema del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Synchopate bajo el marco de trabajo MaxQ v3.1.1. El objetivo declarado es hacer viable la inferencia en CPU de un modelo MoE de gran tamaño (189.206.616.704 parámetros totales según safetensors) dentro de una máquina con 32 GB de RAM y sin GPU, mediante una arquitectura híbrida de dos shards: un tronco residente de 24,98 GiB en DDR5 y una tabla de embeddings per-layer (PLE) de 10,73 GiB paginada bajo demanda desde NVMe mediante `mmap`.

El modelo conserva la topología del backbone `qwen4exp` del original: 48 capas de tronco (36 Gated DeltaNet y 12 GQA con atención completa, `compress_ratio = 4`) más una capa NextN de Multi-Token Prediction (`blk.48`), con 512 expertos enrutados de los cuales se activan Top-10 por token. Según la model card, los parámetros activos por token se sitúan en el rango de 4,6B–5,0B, lo que explica que el autor mantenga la etiqueta `general.size_label = "5.0B"` heredada del tronco denso.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva (1,63 bpw en el tronco) con verificación cgroup estricta; por otro, advierte de que el resultado es un artefacto de compromiso con requisitos de sampling obligatorios y calidad degradada frente a cuantizaciones mayores. Es un modelo para experimentación en hardware de consumo, no para producción de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen4exp`): 48 capas de tronco (36 Gated DeltaNet + 12 GQA full attention, `compress_ratio = 4`) + 1 capa NextN MTP |
| Parametros totales | 189.206.616.704 (safetensors); ~176,5B nominales según model card; ~152,3B tras ConeCollapse + PLE |
| Parametros activos | ~4,6B–5,0B por token (Top-10 de 512 expertos enrutados + 1 experto compartido + tronco denso GDN/GQA) |
| Longitud de contexto | No disponible de forma explícita; los benchmarks se ejecutan con `-c 32768` |
| Tipos de cuantizacion | GGUF mixto: F32 (393), Q8_0 (291), Q4_K (99), Q5_K (98), IQ1_S (62), IQ1_M (51), BF16 (49), MXFP4 (49), IQ2_XXS (17), IQ2_XS (10), Q2_0 (7), Q6_K (1), Q1_0 (1); `max_type = 42` |
| Idiomas soportados | No disponibles |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HF) |
| Formato de pesos | GGUF dividido en 2 shards (`-00001-of-00002` y `-00002-of-00002`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con backbone `qwen4exp` que combina 36 capas de Gated DeltaNet (atención lineal con estado recurrente, dimensión `[48×128×128]`) y 12 capas de GQA con atención completa, con un factor de compresión de 4. Incluye 512 expertos enrutados con activación Top-10 más un experto compartido, y una capa NextN de Multi-Token Prediction (`blk.48`) que actúa como decodificador especulativo integrado. La tabla PLE (Per-Layer Embedding) contiene 320.001.536 filas con dimensión 256.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí documenta el autor de la cuantización es el proceso de compresión: el tronco de 48 capas + MTP se comprime a 1,63 bpw en 24,98 GiB, aplicando ConeCollapse con `K = 512` en 42 capas interiores (con bias `ffn_down_exps` en F32 y descomposición FP64 Woodbury DualGram) y dejando 7 capas de frontera a `K = 640` de ancho completo. La tabla PLE se comprime mediante PCA-Wiener + RaBitQ Q1_0 en un subespacio de dimensión 256, con alineación interna de 2 MiB y `MADV_HUGEPAGE` para evitar el prefetch de páginas frías. La verificación se realiza bajo cgroup v2 con `memory.max = 28.5 GiB`, `MemorySwapMax = 0`, `drop_caches=3` y tres reinicios en frío.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`conversational`).
- Procesamiento image-text-to-text según el `pipeline_tag` declarado en el repositorio.
- Razonamiento y chain-of-thought, condicionado a la configuración de sampling obligatoria (temperatura 0,6).
- Generación de código, con la advertencia de que el modo greedy puro puede entrar en bucles de repetición.
- Extracción estructurada de JSON/SQL en modo determinista (`temperature = 0`), único escenario donde el autor recomienda greedy.
- Decodificación especulativa integrada mediante la capa NextN MTP (`blk.48`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado explícitamente en la model card.

## Casos de uso

- Experimentación en hardware de consumo sin GPU: el modelo está diseñado para ejecutarse en una máquina con 32 GB de RAM y CPU de 16 núcleos, lo que permite probar un MoE de gran tamaño en portátiles o estaciones de trabajo sin acelerador.
- Investigación sobre cuantización extrema: sirve como referencia para estudiar el impacto de 1,63 bpw en la calidad (KLD de 1,0069 frente a 0,9302 del competidor de 54,40 GiB) y para validar técnicas como ConeCollapse o PCA-Wiener sobre PLE.
- Extracción de datos estructurados en local: con `temperature = 0` y prompts cortos de JSON/SQL, el modelo puede usarse en pipelines de parsing sin conexión a servicios en la nube.
- Prototipado de asistentes conversacionales offline: la ventana de 32.768 tokens empleada en los benchmarks permite mantener contexto de conversación moderadamente largo en entornos aislados.
- Evaluación de decodificación especulativa: la capa NextN MTP integrada permite medir el impacto del MTP en throughput sobre CPU con llama.cpp.
- Docencia y formación técnica: útil para demostrar en un aula o taller cómo funciona un MoE con routing Top-10 y atención lineal Gated DeltaNet sin necesidad de clúster.
- Pruebas de integración con llama.cpp y `llama-modchip`: el autor publica un preset (`qwen38-32gb`) que configura automáticamente los parámetros de sampling, lo que facilita la validación en pipelines de CI.

## Benchmarks y rendimiento

Los datos publicados por el autor miden rendimiento de inferencia y divergencia de calidad, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación los valores disponibles:

| Metrica | Valor |
|---|---|
| Throughput `RouteCrack 2.0` | 14,58 ± 0,32 tok/s |
| Throughput `N=1` | 10,00 ± 0,01 tok/s |
| Throughput `tg128` (v3.0, caché caliente) | 11,45–14,29 tok/s |
| Throughput `pp512` (v3.0, caché caliente) | 74,55 tok/s |
| Pico VmHWM | 28,08 GiB |
| Pico cgroup | 28,26 GiB (límite 28,5 GiB, margen 0,24 GiB) |
| Mean KLD | 1,0069 (frente a 0,9302 del competidor de 54,40 GiB) |
| Delta de tamano | −18,69 GiB frente al competidor podado de 54,40 GiB |
| Hardware de medida | CPU Zen 5 de 16 núcleos, 0 GPUs |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- RAM: 32 GB DDR5 como mínimo; el pico medido es de 28,08 GiB VmHWM con `-c 32768`.
- Almacenamiento: 35,71 GiB en disco para ambos shards (`cg.file = 25,14 GiB` residentes, resto paginado bajo demanda).
- GPU: no se requiere GPU; el modelo está optimizado para inferencia en CPU.
- CPU: 16 núcleos Zen 5 en la medición de referencia; se recomienda al menos esa clase de CPU para acercarse a los 14,58 tok/s.
- Cabe en GPU de consumo: no aplica, el diseño es CPU-first con `mmap` sobre NVMe.
- Opciones de despliegue: llama.cpp y `llama-modchip` (preset `qwen38-32gb`); no se documentan otras (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: 14,58 ± 0,32 tok/s en `RouteCrack 2.0`, 10,00 tok/s en `N=1`, 74,55 tok/s en `pp512` (caché caliente).
- Requisito de kernel: cgroup v2 con `memory.max` configurable y `MADV_HUGEPAGE` para el correcto funcionamiento del paginado perezoso de PLE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-32GB | 189,2B totales / ~4,6–5,0B activos | No disponible (benchmarks a 32.768) | qwen-community-1.0 | GGUF (2 shards, 35,71 GiB) | 14,58 tok/s CPU, KLD 1,0069 |
| Qwen3.8-Flash-Next (base BF16) | 189,2B | No disponible | qwen-community-1.0 | safetensors (329,72 GiB) | Requiere hardware de gran escala |
| Cuantizaciones Unsloth / ISTA-DASLab de Qwen3.8-Flash-Next | 189,2B | No disponible | qwen-community-1.0 | GGUF (54,40–329,72 GiB) | Ninguna cabe en 32 GB RAM según el autor; KLD 0,9302 en el caso de 54,40 GiB |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~180B con activación ~5B) en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad degradada por compresión extrema: el tronco se comprime a 1,63 bpw y la PLE a Q1_0, con una KLD de 1,0069 frente a 0,9302 del competidor de 54,40 GiB; no es apto para tareas que exijan alta fidelidad.
- Bucles de repetición en modo greedy: el autor documenta 3/8 bucles de repetición sin penalizaciones y solo 2/8 de aprobación estricta con `temperature = 0`; es obligatorio usar `temperature = 0.6`, `top_p = 0.95`, `top_k = 20`, `presence_penalty` entre 0,2 y 1,0 y `repeat_penalty = 1.05` para uso general.
- Margen de memoria muy ajustado: 0,24 GiB de holgura sobre el límite de 28,5 GiB con contexto de 32.768 tokens; incrementar el contexto o el batch puede provocar OOM.
- Dependencia de NVMe: la PLE se pagina bajo demanda; un disco lento o un sistema de ficheros sin soporte adecuado de `mmap` degradará el throughput.
- Etiqueta `general.size_label = "5.0B"` engañosa: refleja los parámetros activos, no los totales; herramientas que infieran el tamaño desde esa etiqueta pueden dimensionar mal los recursos.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- Licencia `qwen-community-1.0`: es necesario revisar los términos del enlace de licencia del modelo base antes de uso comercial; la model card no aclara restricciones específicas.
- Sesgos y alucinaciones: no documentados en la información disponible; se heredan los del modelo base, no evaluados en esta cuantización.
- Verificación limitada a un único entorno: las pruebas cgroup se hicieron en una CPU Zen 5 de 16 núcleos; el comportamiento en otras plataformas no está validado.
- Repositorio con 0 likes y 769 descargas: ecosistema pequeño, sin validación independiente de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio llama-modchip: https://github.com/synchopate/llama-modchip
- Resultados de benchmark cgroup: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/results/qwen38_32gb_cgroup28g_v311.json
