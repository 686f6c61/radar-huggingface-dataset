# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB es una cuantización GGUF del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario Synchopate bajo el esquema de compresión MaxQ v3.1.1. El modelo original, desarrollado por NVIDIA, es un transformer híbrido de 30.200 millones de parámetros totales con 3.000 millones activos (arquitectura MoE con enrutamiento Top-6 sobre 128 expertos) que combina 23 bloques Mamba-2, 23 bloques MoE dispersos con activación ReLU² y 6 bloques de atención GQA. Su ventana de contexto nativa alcanza los 262.144 tokens con un KV cache especialmente reducido (432 MB a contexto completo, gracias a solo 12 cabezas KV).

La contribución principal de esta variante es conseguir un archivo de 13,39 GiB que cabe en sistemas de 16 GB de RAM o VRAM, manteniendo compatibilidad total con el ABI estándar de ggml (tipos de tensor ≤ 42, sin tipos personalizados). Esto resuelve un problema práctico: los cuantizadores estándar Q3_K e IQ3_S no logran bajar de 17,6 GiB con este modelo porque sus dimensiones intermedias MoE (1856 × 2688) no son múltiplos de QK_K = 256, lo que fuerza caídas a Q4_0/Q8_0. MaxQ-16GB evita ese problema usando formatos de bloque de 32 y 64 elementos, sin tensores de reserva.

El resultado es relevante para quienes quieren ejecutar un modelo de 30B con contexto largo en hardware de consumo: Macs con memoria unificada de 16-24 GB, GPUs de 16 GB de VRAM o configuraciones híbridas de 8-12 GB VRAM más DDR5. El autor reporta 22,64 tok/s en un servidor fijado a 16 núcleos con un cgroup de 15 GiB, sin swap ni OOM kills.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 23 bloques Mamba-2 SSM + 23 bloques MoE dispersos (ReLU²) + 6 bloques de atención GQA |
| Parametros totales | 31.577.940.288 (30,2B) |
| Parametros activos | 3,0B (MoE, 128 expertos, Top-6 con router SIGMOID + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (256K) nativos; 12 cabezas KV totales (432 MB de KV cache a contexto completo) |
| Tipos de cuantizacion | GGUF con mezcla: F32 (237 tensores), Q4_0 (70), Q8_0 (48), MXFP4 tipo 39 (28), Q2_0 tipo 42 (18); max_type = 42, sin tipos personalizados |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base NVIDIA) |
| Formato de pesos | GGUF (archivo único de 14.382.336.640 bytes, 13,3946 GiB, 401 tensores) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que alterna capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y unas pocas capas de atención GQA. La distribución exacta es 23 bloques Mamba-2, 23 bloques MoE y 6 bloques de atención, sobre un total de 52 bloques. La parte MoE usa 128 expertos con enrutamiento Top-6 mediante router SIGMOID y un experto compartido adicional, con dimensión intermedia K = 1856 y K = 3712 para el experto compartido. Esta combinación busca eficiencia en inferencia (solo 3B parámetros activos por token) manteniendo capacidad de modelo grande.

La cuantización MaxQ-16GB aplica precisión selectiva: estados Mamba-2 (ssm_conv1d, ssm_a, ssm_dt) en F32 exacto, atención densa y expertos compartidos en Q8_0/Q4_0, y los expertos MoE en MXFP4 (28 tensores) más Q2_0 con escala firmada (18 tensores de ffn_up_exps, 2,25 bits por peso). El autor documenta el uso de "FP64 Woodbury DualGram" para el cálculo de escalas y 2.208 sondas de estado oculto reales con max_kappa2 = 13,81 y 0,000000% de solapamiento de n-gramas 8/13 con wiki-alt.txt, lo que sugiere un proceso de calibración cuidadoso para evitar contaminación de datos de referencia. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional con plantilla de chat Jinja embebida (9.867 caracteres, vocabulario Tekken/GPT-2 de 131.072 tokens).
- Modo de razonamiento con cadena de pensamiento (`<think>...</think>`, campo `reasoning_content`) activado por defecto; se puede desactivar con `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Razonamiento multi-paso y respuesta directa o en JSON cuando se desactiva el modo thinking.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Compatibilidad con decodificación especulativa mediante `RouteCrack 2.0` (`--spec-type routecrack2`) en llama-modchip v3.1.1.

## Casos de uso

- Análisis de documentos largos: con 256K tokens de contexto y un KV cache de solo 432 MB, el modelo puede procesar contratos, informes o bases de código completas en una sola pasada sin truncar, algo inusual en modelos que caben en 16 GB.
- Asistente conversacional local en equipos de 16 GB: gracias a su tamaño de 13,39 GiB y los 3B parámetros activos, puede desplegarse en Macs con memoria unificada de 16-24 GB o portátiles con 16 GB de RAM, ofreciendo respuestas a 22,64 tok/s en configuraciones de 16 núcleos.
- Razonamiento con cadena de pensamiento en entornos sin GPU dedicada: el modo thinking por defecto permite resolver problemas de lógica o matemáticas paso a paso, siempre que se configure `max_tokens >= 4096` para no agotar el presupuesto dentro de `reasoning_content`.
- Generación de respuestas en JSON para integración en pipelines: desactivando el modo thinking se obtienen salidas concisas y estructuradas, útiles para extracción de datos o clasificación automatizada.
- Despliegue en GPUs de consumo con cuantización agresiva: en GPUs de 16 GB VRAM (por ejemplo, RTX 4080/4090 en configuraciones ajustadas) o híbridas de 8-12 GB VRAM + DDR5, el modelo corre vía llama.cpp con soporte CUDA o Vulkan sin necesidad de parches.
- Experimentación e investigación con modelos MoE híbridos: al ser compatible con el ABI estándar de ggml y con `llama-server`, sirve como banco de pruebas para estudiar el comportamiento de arquitecturas Mamba-2 + MoE en hardware modesto.
- Servicio de inferencia con decodificación especulativa: usando llama-modchip v3.1.1 con `RouteCrack 2.0` se puede acelerar la generación en CPU con kernels AVX-512 de 512 bits para Q2_0/MXFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Throughput (N=1, cgroup 15 GiB, 16 nucleos fijados) | 22,64 ± 0,03 tok/s |
| Throughput con RouteCrack 2.0 en cgroup respaldado por ARC | 26,28 ± 0,19 tok/s |
| Tamano del archivo | 13,3946 GiB (14.382.336.640 bytes) |
| Residencia en RAM (N=1, casi ajuste a 15 GiB) | 13,39 + 1,64 ≈ 15,03 GiB, 0,2 GiB de refault |
| Requisito para RouteCrack 2.0 a -c 32768 | 13,39 + 2,36 ≈ 15,75 GiB (requiere ≥ 16 GiB libres) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 13,39 GiB de pesos más overhead de contexto; aproximadamente 15,03 GiB en el escenario N=1 medido por el autor con cgroup de 15 GiB y swap desactivado.
- GPU recomendadas: GPUs con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090 en configuraciones ajustadas, A4000 de 16 GB) o configuraciones híbridas de 8-12 GB VRAM + DDR5. En Apple Silicon, Macs con 16-24 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en modelos de 16 GB VRAM; en GPUs de 8-12 GB requiere reparto con memoria del sistema (offloading parcial).
- Opciones de despliegue: llama.cpp upstream (de32b268c+), llama-server, runners que soporten GGML_TYPE_Q2_0 = 42, llama-modchip v3.1.1 (con kernels AVX-512 y decodificación especulativa RouteCrack 2.0), backends Metal, CUDA y Vulkan.
- Latencia y throughput: 22,64 ± 0,03 tok/s en servidor de 16 núcleos con cgroup de 15 GiB; 26,28 ± 0,19 tok/s con RouteCrack 2.0 en cgroup respaldado por ARC. El throughput en bare-metal de 16 GB con RouteCrack 2.0 a tope de 15 GiB no está verificado.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / tamano | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB (esta ficha) | 30,2B / 3,0B | 256K | OpenMDW-1.1 | GGUF, 13,39 GiB | Compatible con ggml estándar ≤ 42; orientado a 16 GB |
| NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF | 30,2B / 3,0B | 256K | OpenMDW-1.1 | GGUF con tipos personalizados 44/45 | Requiere llama-modchip v3.1.1; libreta de códigos personalizada |
| NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF | 30,2B / 3,0B | 256K | OpenMDW-1.1 | GGUF con tipos personalizados 44/45 | Requiere llama-modchip v3.1.1; alternativa fractal |
| Modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30,2B / 3,0B | 256K | OpenMDW-1.1 | BF16 safetensors, 58,84 GiB | Referencia sin cuantizar; no cabe en 16 GB |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; deben evaluarse sobre el modelo base NVIDIA.
- Riesgo de alucinación: inherente a los modelos generativos; el modo thinking por defecto puede consumir todo el presupuesto de tokens en `reasoning_content` si `max_tokens` es bajo (≤ 96), produciendo respuestas truncadas o vacías.
- Limitaciones de contexto: aunque soporta 256K tokens, en hosts de 16 GB el autor recomienda `-c 32768`; contextos mayores requieren 24 GB o más de memoria.
- Restricciones de licencia: OpenMDW-1.1; debe revisarse el texto completo en openmdw.ai/license/1-1/ antes de uso comercial.
- Compatibilidad: requiere llama.cpp de32b268c+ o runners que soporten GGML_TYPE_Q2_0 = 42; versiones anteriores no cargarán el archivo.
- Rendimiento en bare-metal: el throughput de RouteCrack 2.0 a 15 GiB en hardware físico de 16 GB no está verificado; las cifras de 26,28 tok/s provienen de un cgroup respaldado por ARC.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe sin evaluación previa.
- Calidad de cuantización: el uso de Q2_0 (2,25 bpw) en 18 tensores de expertos puede degradar la precisión frente al modelo BF16; no se han publicado evaluaciones de calidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante VQ3-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Variante Fractal-64: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Repositorio llama-modchip: https://github.com/synchopate/llama-modchip
- Resultados de benchmark cgroup 15 GiB: https://github.com/synchopate/llama-modchip/blob/main/benchmarks/results/nemotron_16gb_cgroup15g_v311.json
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
