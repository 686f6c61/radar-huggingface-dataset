# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF es una cuantización GGUF de precisión mixta del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario Synchopate. El objetivo es permitir la inferencia en CPU de un modelo de aproximadamente 31.600 millones de parámetros totales (con arquitectura MoE de Top-6 activo) dentro de un presupuesto de 16 GB de RAM, mediante un esquema de cuantización vectorial propietario (`LUT-VQ3-64` a 3,00 bpw y `Fractal-64` a 3,75 bpw) que reduce el peso en disco a 13,30 GiB.

El modelo subyacente combina 52 bloques con tres tipos de capas: 23 bloques Mamba-2 (SSM), 23 bloques de mezcla de expertos dispersos (Sparse MoE) y 6 bloques de atención GQA-2. Esta arquitectura híbrida permite un contexto de hasta 256K tokens, aunque la model card no documenta explícitamente el límite de contexto del checkpoint cuantizado. La cuantización está diseñada específicamente para hosts con AVX-512 VBMI y AVX2, y requiere el fork `llama-modchip` en su versión v3.1.1 para funcionar, ya que introduce dos tipos de tensor personalizados (`GGML_TYPE_FRACTAL_64 = 44` y `GGML_TYPE_VQ3_64 = 45`) que el `llama.cpp` upstream no reconoce.

La relevancia de esta ficha radica en que demuestra una vía para ejecutar modelos de 30B+ en hardware de consumo sin GPU, con un throughput reportado de 24,18 tok/s en un AMD Zen 5 de 16 núcleos. No obstante, la dependencia de un fork no estándar y de tipos de tensor propietarios implica un riesgo de portabilidad considerable para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 52 bloques (23 Mamba-2 SSM + 23 Sparse MoE + 6 GQA-2 Attention) |
| Parámetros totales | 31.577.940.288 (31,58B) |
| Parámetros activos | Top-6 expertos activos en capas MoE (número exacto de parámetros activos no disponible) |
| Longitud de contexto | Hasta 256K tokens (según model card; límite efectivo del checkpoint no verificado) |
| Tipos de cuantización | `LUT-VQ3-64` (3,00 bpw) y `Fractal-64` (3,75 bpw); tipos GGML 44 y 45 |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (un único archivo, 14.282.559.040 bytes, 401 tensores) |
| Tamaño en disco | 13,30 GiB |
| RAM pico residente | 14,6–16,04 GiB (medido en Zen 5 de 16 núcleos) |
| Runtime requerido | `llama-modchip` v3.1.1 (fork de llama.cpp) |
| SHA-256 del archivo | `04a460cdd831002d80b2f47ec5d70e7a92227abcf0a57f31ad73fe0bd50e711f` |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida que alterna capas de espacio de estados (Mamba-2 SSM) con capas de mezcla de expertos dispersos y un pequeño número de capas de atención con query grouping (GQA-2). La distribución es de 23 bloques Mamba-2, 23 bloques MoE y 6 bloques de atención, lo que reduce el coste cuadrático de la atención clásica en contextos largos y permite escalar a 256K tokens. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación técnica de esta publicación no reside en el modelo base, sino en el esquema de cuantización. Se aplican dos formatos personalizados: `LUT-VQ3-64` (cuantización vectorial con tabla de búsqueda a 3,00 bits por peso) y `Fractal-64` (3,75 bpw), que requieren un fork específico de `llama.cpp` (`llama-modchip`) con decodificación especulativa y soporte para los tipos GGML 44 y 45. La migración a la versión v3.1.1 se realizó sin modificar un solo byte del payload de los tensores (SHA-256 del payload idéntico a la versión v2.5.4), cambiando únicamente las cabeceras de tipo. El autor reporta que la inferencia se beneficia de decodificación especulativa, aunque no se detalla la configuración exacta del draft model ni la tasa de aceptación.

## Capacidades

- Generación de texto conversacional y de razonamiento con modo `<think>` activado por defecto en la plantilla Jinja, que produce contenido en `reasoning_content`.
- Razonamiento multi-paso y modo de pensamiento controlable mediante `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Generación de código, con etiqueta específica `claude-code` en los tags del repositorio, lo que sugiere uso previsto en asistentes de programación.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card, pero la arquitectura MoE y el formato conversacional del modelo base son compatibles con estas funciones.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Inferencia en CPU sin GPU, con decodificación especulativa para acelerar la generación.

## Casos de uso

- Asistente de programación en estaciones de trabajo sin GPU: con 13,30 GiB en disco y un pico de 16 GB de RAM, el modelo puede ejecutarse en portátiles y equipos de escritorio con AVX-512, integrándose en editores o terminales como asistente de código con contexto de hasta 256K tokens.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite analizar contratos, informes o expedientes completos sin fragmentación, manteniendo la confidencialidad al no requerir conexión a servicios en la nube.
- Atención al cliente automatizada en entornos con recursos limitados: la arquitectura MoE con Top-6 reduce el coste computacional por token, permitiendo gestionar conversaciones multi-turno en servidores sin GPU dedicada.
- Generación de código en pipelines de CI/CD: la capacidad de razonamiento y el soporte de tool calling (si se confirma) permiten integrar el modelo en tareas de revisión de código, generación de tests o documentación técnica dentro de flujos automatizados.
- Investigación y experimentación con arquitecturas híbridas SSM/MoE: el checkpoint permite estudiar el comportamiento de Mamba-2 combinado con MoE en hardware de consumo, algo inviable con el modelo BF16 original de 58,84 GiB.
- Despliegue en entornos air-gapped: al ser un archivo GGUF único y autónomo, puede distribuirse en sistemas aislados sin acceso a repositorios de modelos, siempre que se instale el runtime `llama-modchip` v3.1.1.
- Prototipado de agentes multi-paso: el modo de razonamiento `<think>` y el contexto largo facilitan la construcción de agentes que planifican y ejecutan tareas secuenciales en local.

## Benchmarks y rendimiento

| Métrica | BF16 maestro | Fractal-64 (14,36 GiB) | VQ3-64 (13,30 GiB, este repo) | MaxQ-16GB (13,39 GiB, ggml estándar) |
|---|---|---|---|---|
| Tamaño en disco | 58,84 GiB | 15.420.034.624 B | 14.282.559.040 B | 14.382.336.640 B |
| PPL `wiki-alt.txt` (40×512) | — | 6,6533 (0,0688 nats) | 6,7614 (0,0871 nats) | 7,3129 ± 0,1923 (0,1722 nats) |
| PPL WikiText-2 (12.288 tok) | 6,9582 ± 0,2415 | 7,3610 ± 0,2602 (+5,79%) | 7,4400 ± 0,2626 (+6,92%) | — |
| KLD de logits vs. BF16 | 0,0000 nats (ref.) | 0,1254 / 0,0929 nats | 0,1495 / 0,0944 nats (85,2% Top-1) | — |
| Throughput decode (Zen 5, 16C) | 7,82 tok/s (N=1) | 25,02 tok/s | 24,18 tok/s | 22,64 tok/s (cold) / 15,10 tok/s (warm tg128) |
| RAM pico residente | 59,40 GiB | 15,6–17,27 GiB | 14,6–16,04 GiB | ~15,0G (N=1) / ~15,8G (RC2) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son métricas de perplejidad, divergencia de logits y rendimiento de inferencia reportadas por el autor de la cuantización, no evaluaciones de capacidad del modelo.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo está diseñado para inferencia en CPU. En caso de descarga parcial a GPU, se requeriría al menos 13,30 GiB de VRAM para el archivo completo.
- RAM: mínimo 16 GB; el pico medido es de 14,6–16,04 GiB en el régimen de 16 GB. Se recomienda 21–29 GB en hosts AVX-512 VBMI para el preset por defecto.
- GPU recomendadas: no aplica para el caso de uso principal. El repositorio gemelo con tipos ggml estándar (`MaxQ-16GB`) es compatible con Metal, CUDA y Vulkan, pero este checkpoint VQ3-64 requiere `llama-modchip`.
- CPU: se requiere AVX-512 VBMI o AVX2. El autor reporta 24,18 tok/s en un AMD Zen 5 de 16 núcleos y 54,43 tok/s en un Threadripper 9960X.
- Cabe en GPU de consumo: no de forma nativa; el archivo de 13,30 GiB cabría en GPUs con 16 GB o más (RTX 4080/4090, RTX 5080), pero el runtime `llama-modchip` está orientado a CPU y no se documenta soporte CUDA para los tipos 44/45.
- Opciones de despliegue: `llama-modchip` v3.1.1 (binarios estáticos Linux x86_64 con GLIBC 2.30) o instalación desde fuente con `./install.sh --preset nemotron-vq3`. No es compatible con `llama.cpp` upstream, Ollama, vLLM ni TGI sin parches.
- Latencia y throughput: 24,18 tok/s en Zen 5 de 16 núcleos; 54,43 tok/s en Threadripper 9960X; 111,6 tok/s en Threadripper 7985WX con `Q4_0` (dato de un issue del repositorio).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Nemotron-3.5-30B-A3B-VQ3-64 (este) | 31,58B (Top-6 activo) | 256K | VQ3-64 / Fractal-64 (13,30 GiB) | OpenMDW-1.1 | `llama-modchip` v3.1.1 |
| Nemotron-3.5-30B-A3B-MaxQ-16GB | 31,58B (Top-6 activo) | 256K | ggml estándar ≤42 (13,39 GiB) | OpenMDW-1.1 | `llama.cpp` upstream |
| Nemotron-3.5-30B-A3B-Fractal-64 | 31,58B (Top-6 activo) | 256K | Fractal-64 (14,36 GiB) | OpenMDW-1.1 | `llama-modchip` v3.1.1 |
| Nemotron-3.5-Lightning-30B-A3B-BF16 | 31,58B (Top-6 activo) | 256K | BF16 (58,84 GiB) | OpenMDW-1.1 | `llama.cpp` / NVIDIA |

La comparativa se limita a las variantes del mismo modelo base publicadas por el mismo autor, ya que no se dispone de información sobre modelos alternativos de la misma categoría (30B MoE híbrido SSM) en la documentación proporcionada. El modelo con licencia y tamaño más cercano sería la familia Qwen3.8-Flash-Next, pero no se dispone de datos de benchmarks comparables.

## Limitaciones y advertencias

- Dependencia de un fork no estándar: requiere `llama-modchip` v3.1.1; no funciona con `llama.cpp` upstream, Ollama, vLLM ni TGI. Esto limita la portabilidad y aumenta el coste de mantenimiento.
- Tipos de tensor propietarios (`GGML_TYPE_FRACTAL_64 = 44` y `GGML_TYPE_VQ3_64 = 45`) no reconocidos por el ecosistema ggml estándar; cualquier herramienta que inspeccione el archivo sin el fork fallará.
- Licencia OpenMDW-1.1: es una licencia "other" que debe revisarse antes de uso comercial; no se garantiza compatibilidad con licencias permisivas tipo Apache 2.0 o MIT.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Riesgo de alucinación inherente al modelo base, agravado por la cuantización agresiva (3,00–3,75 bpw), que introduce una degradación medible: +6,92% de perplejidad en WikiText-2 y 85,2% de coincidencia Top-1 frente a BF16.
- El modo `<think>` está activado por defecto y consume tokens de razonamiento; si no se configura `max_tokens >= 4096` o no se desactiva, las respuestas pueden truncarse o ser excesivamente verbosas.
- Sin soporte GPU documentado para los tipos 44/45: el rendimiento depende exclusivamente de la CPU y de las extensiones AVX-512 VBMI o AVX2.
- El autor reporta métricas en hardware concreto (Zen 5, Threadripper); el throughput en otras CPU puede variar significativamente y no se han publicado mediciones en Intel o ARM.
- La fecha de creación del repositorio (2026-11-11) y la referencia a modelos Qwen3.8 sugieren un contexto temporal que no se puede verificar con la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante ggml estándar (MaxQ-16GB): https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Variante Fractal-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Variante Abliterated-VQ3-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Abliterated-VQ3-64-CPU-GGUF
- Repositorio del runtime: https://github.com/synchopate/llama-modchip
- Release v3.1.1: https://github.com/synchopate/llama-modchip/releases/tag/v3.1.1
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Variante 32 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-32GB-GGUF
- Variante 64 GB: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
