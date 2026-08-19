# ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN

## Resumen

`ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN` es una cuantización NVFP4 (4 bits para pesos y activaciones) del modelo base `Qwen/Qwen3-30B-A3B`, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 30 500 millones de parámetros totales y 3 000 millones de parámetros activos por token. La cuantización ha sido producida con la librería `llm-compressor` de NVIDIA utilizando el algoritmo RTN (round-to-nearest) sobre 1 024 muestras de calibración, y reduce el tamaño del checkpoint de 56,89 GB (bf16) a 18,11 GB, una reducción de 3,14 veces. El objetivo principal es permitir la inferencia eficiente en GPUs Blackwell (SM100) mediante el backend `FLASHINFER_TRTLLM` de vLLM, que soporta de forma nativa el formato NVFP4.

El modelo base Qwen3-30B-A3B introduce un modo de pensamiento (thinking mode) y un modo sin pensamiento (non-thinking mode) unificados, lo que lo hace adecuado para tareas de razonamiento complejo y respuestas rápidas. Esta versión cuantizada mantiene las capacidades del modelo original, aunque la model card advierte explícitamente que el comportamiento en código, multilingüe y contexto largo no ha sido evaluado en esta variante. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La publicación de este modelo forma parte de un par deliberado: el mismo autor publica también `ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ`, una versión con la misma anchura de bits pero construida con GPTQ, para que los usuarios puedan comparar la relación entre tiempo de cuantización y calidad. Según las mediciones del autor, esta versión RTN pierde aproximadamente 1 punto porcentual en MMLU frente al modelo bf16, mientras que la versión GPTQ pierde solo 0,36 puntos, aunque GPTQ requiere 4,5 veces más tiempo de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo Qwen3 |
| Parametros totales | 30 532 122 624 (~30,5 B) |
| Parametros activos | ~3 B (por token) |
| Longitud de contexto | 128 000 tokens (modelo base); no confirmado en la model card |
| Tipos de cuantizacion | NVFP4 (4 bits pesos y activaciones) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3 es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3-30B-A3B` es un transformer MoE con 30 500 millones de parámetros totales y 3 000 millones de parámetros activos por token. Incorpora un mecanismo de modo de pensamiento (thinking) y modo sin pensamiento (non-thinking) que permite alternar entre razonamiento profundo y respuestas rápidas según la tarea. La cuantización NVFP4 se aplicó sobre los pesos y las activaciones de los operadores lineales dentro de los bloques transformer, utilizando `llm-compressor` con el algoritmo RTN (round-to-nearest) en una pasada única sobre 1 024 muestras de calibración. El proceso de cuantización tardó 5 271 segundos en una GPU B200.

La inferencia requiere vLLM 0.27.1 o superior y utiliza el backend `FLASHINFER_TRTLLM` con soporte nativo para NVFP4 en GPUs Blackwell (SM100). En GPUs Hopper (H100/H200), vLLM cae a una emulación Marlin con rendimiento aproximadamente 0,85 veces el de bf16, por lo que la ventaja de velocidad solo se obtiene en Blackwell.

## Capacidades

- Generación de texto y razonamiento multi-step gracias al modo thinking del modelo base.
- Soporte de tool calling y function calling (capacidad del modelo base, no evaluada en esta cuantización).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base, no evaluadas).
- Multilingüe (el modelo base soporta más de 100 idiomas, aunque la model card no lo confirma para esta versión).
- Generación de código y matemáticas (capacidad del modelo base, no evaluada en esta versión).
- Modo de pensamiento (thinking) y modo sin pensamiento (non-thinking) conmutable.

## Casos de uso

- Inferencia de alto rendimiento en GPUs Blackwell: el modelo está optimizado para B200 con vLLM y backend FLASHINFER_TRTLLM, logrando 46,8 tokens por julio frente a 27,4 del bf16, lo que lo hace adecuado para despliegues donde el coste energético es crítico.
- Reducción de memoria en producción: con 18,11 GB en disco, el modelo cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) si se usa emulación, aunque el rendimiento nativo requiere Blackwell.
- Chatbots conversacionales con contexto largo: el modelo base soporta 128K tokens de contexto, lo que permite mantener conversaciones multi-turno extensas (aunque la model card no evalúa este aspecto en la versión cuantizada).
- Razonamiento matemático y lógico: las puntuaciones GSM8K de la versión cuantizada (0,8999) superan incluso al bf16 (0,8741), aunque la diferencia no es estadísticamente significativa.
- Asistentes de código en entornos con restricciones de memoria: la reducción de 3,14x permite ejecutar el modelo en GPUs de menor capacidad, aunque el rendimiento en código no ha sido medido.
- Investigación y experimentación con cuantización NVFP4: el par RTN/GPTQ publicado permite estudiar el impacto del algoritmo de cuantización en la calidad del modelo.

## Benchmarks y rendimiento

La model card reporta mediciones propias realizadas en una GPU B200 con vLLM 0.27.1 y lm-eval 0.4.12, sin límite de muestras. MMLU se evaluó con 14 042 muestras (loglikelihood) y GSM8K-CoT con 1 319 muestras (generativo, 8-shot).

| Build | Receta | MMLU | GSM8K (strict) |
|---|---|---|---|
| Qwen/Qwen3-30B-A3B (bf16) | — | 0,7779 | 0,8741 |
| **Este modelo (RTN)** | llm-compressor, RTN | 0,7676 (−1,03 pp) | 0,8999 |
| ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ | llm-compressor, GPTQ | 0,7743 (−0,36 pp) | 0,8878 |
| RedHatAI/Qwen3-30B-A3B-NVFP4 | RTN | 0,7675 (−1,04 pp) | 0,8939 |

La pérdida de 1,03 pp en MMLU es estadísticamente significativa (z = −2,2), mientras que la versión GPTQ no muestra degradación significativa (z = −0,8). El aumento en GSM8K no es separable del ruido de muestreo (z entre 1,1 y 2,1), por lo que la afirmación defendible es que no hay degradación medible en esa tarea.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18-20 GB para los pesos (18,11 GB en disco) más overhead de activaciones y caché KV; cabe en GPUs con 24 GB o más.
- GPU recomendada: B200 (SM100) para rendimiento nativo NVFP4 con backend FLASHINFER_TRTLLM.
- En GPUs Hopper (H100/H200), vLLM usa emulación Marlin con rendimiento ~0,85x de bf16; no se recomienda para velocidad.
- En GPUs consumer (RTX 4090, etc.) la emulación puede funcionar pero sin ventaja de velocidad; el beneficio principal es el ahorro de memoria.
- Opciones de despliegue: vLLM (versión 0.27.1 o superior) con `--max-model-len 8192` como ejemplo de uso.
- Latencia y throughput: no se reportan valores saturados; la model card solo indica un consumo energético de 46,8 tok/J en una carga no saturada (utilización de GPU 54-85%).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Tamaño en disco |
|---|---|---|---|---|---|---|
| Qwen3-30B-A3B (bf16) | 30,5B totales / 3B activos | 128K | 0,7779 | 0,8741 | Apache 2.0 | 56,89 GB |
| **Este modelo (RTN NVFP4)** | 30,5B totales / 3B activos | 128K (no confirmado) | 0,7676 | 0,8999 | Apache 2.0 | 18,11 GB |
| ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ | 30,5B totales / 3B activos | 128K (no confirmado) | 0,7743 | 0,8878 | Apache 2.0 | 18,11 GB |
| RedHatAI/Qwen3-30B-A3B-NVFP4 | 30,5B totales / 3B activos | 128K (no confirmado) | 0,7675 | 0,8939 | Apache 2.0 | 16,88 GB (según autor) |

La versión RTN de ThakiCloud es prácticamente idéntica en calidad a la de RedHatAI (diferencia de 0,01 pp en MMLU), pero esta última es 1,23 GB más pequeña. La versión GPTQ ofrece mejor calidad MMLU pero requiere 4,5 veces más tiempo de cuantización.

## Limitaciones y advertencias

- Solo Blackwell (SM100) ofrece rendimiento nativo NVFP4; en Hopper y GPUs consumer se usa emulación Marlin con rendimiento inferior al bf16.
- Pérdida de aproximadamente 1 punto porcentual en MMLU frente al modelo bf16 (estadísticamente significativa).
- No se han evaluado las capacidades de código, multilingüe ni contexto largo en esta versión cuantizada; la model card declara explícitamente que estos comportamientos no están verificados.
- El aumento en GSM8K no es estadísticamente significativo y no debe interpretarse como una mejora real.
- La model card no especifica la longitud de contexto soportada en la práctica; el ejemplo de uso sugiere `--max-model-len 8192`.
- El modelo no está desplegado en ningún proveedor de inferencia en Hugging Face (según la información del repo).
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos específicos de la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ThakiCloud/Qwen3-30B-A3B-NVFP4-RTN
- Versión GPTQ del mismo autor: https://huggingface.co/ThakiCloud/Qwen3-30B-A3B-NVFP4-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Technical report de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Variante NVFP4 de RedHatAI: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-NVFP4
- Versión en ModelScope (nv-community): https://www.modelscope.cn/models/nv-community/Qwen3-30B-A3B-NVFP4
