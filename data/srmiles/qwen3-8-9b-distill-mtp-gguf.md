# srmiles/Qwen3.8-9B-Distill-MTP-GGUF

## Resumen

Este repositorio contiene los **draft heads de multi-token prediction (MTP)** en formato GGUF para el modelo `empero-ai/Qwen3.8-9B-Distill`, una destilación comunitaria de 9B parámetros basada en Qwen3.8 de Alibaba. El modelo original incluye en sus pesos una cabeza MTP (`mtp_num_hidden_layers: 1` en `config.json`), pero el repositorio GGUF oficial del modelo base solo publica cuantizaciones del modelo principal, sin el head. Esto impide usar decodificación especulativa nativa con `--model-draft` en llama.cpp, dejando al modelo sin la ruta de aceleración para la que fue diseñado.

El autor, `srmiles`, convierte la cabeza MTP desde los safetensors BF16 del modelo base usando `convert_hf_to_gguf.py` de llama.cpp, generando dos ficheros: uno en BF16 (4.56 GB) y otro en Q8_0 (2.43 GB). La cabeza completa tiene 2.28B parámetros, de los cuales ~2.03B corresponden a las matrices de embedding y output del vocabulario (248,320 x 4,096, dos veces). La arquitectura es `qwen35`, la misma que el modelo base.

La relevancia de este trabajo radica en que restaura la capacidad de decodificación especulativa del modelo, permitiendo un aumento de velocidad de inferencia en hardware moderado. Las mediciones del autor sobre una GPU Intel Arc Pro B60 (Battlemage) muestran una tasa de aceptación del 81.4% y una velocidad de decode de 73.97 tok/s con el head Q8_0, cifras en línea con otros heads MTP de la misma arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (Qwen3.5/3.8) |
| Parametros totales | 2.277.540.160 (~2.28B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda del modelo base, no se especifica) |
| Tipos de cuantizacion | BF16, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un **draft head MTP de una sola capa** (`mtp_num_hidden_layers: 1`), diseñado para decodificación especulativa en llama.cpp. Contiene 18 tensores: el bloque `blk.32.nextn.*` (la capa MTP en sí) más `token_embd`, `output` y `output_norm`. De los 2.28B parámetros totales, ~2.03B corresponden a las matrices de embedding y output del vocabulario (248,320 x 4,096, dos veces), mientras que el bloque MTP real es una fracción menor.

No es un modelo entrenado de forma independiente; es una extracción de los pesos del modelo `empero-ai/Qwen3.8-9B-Distill`, que a su vez es una destilación del Qwen3.8 de Alibaba (27B parámetros) a una versión densa de 9B. La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el commit `bb4caa754`, usando la opción `--mtp` que exporta solo los tensores MTP como un GGUF de draft independiente. El modelo base se entrenó con técnicas de destilación sobre el modelo profesor, aunque los detalles del dataset y el proceso de entrenamiento no se detallan en la información disponible.

## Capacidades

- **Decodificación especulativa MTP nativa**: permite acelerar la inferencia del modelo base `Qwen3.8-9B-Distill` usando `--spec-type draft-mtp` en llama.cpp, en lugar de la decodificación clásica por n-gramas.
- **Compatibilidad con llama-server**: se integra como `--model-draft` en el servidor de llama.cpp, manteniendo la API compatible con OpenAI.
- **Dos formatos de precisión**: BF16 para verificación y requantización, y Q8_0 como opción recomendada por el autor por su equilibrio entre tamaño y tasa de aceptación.
- **Soporte de offload en GPU**: con `-ngld 99` se puede descargar el head a la GPU, evitando el cuello de botella de CPU.
- **Métricas de aceptación vía Prometheus**: expone contadores de tokens aceptados y generados para monitorizar la eficacia del draft en cada workload.
- **No es un modelo de generación autónoma**: es un componente auxiliar que solo funciona junto con el modelo base.

## Casos de uso

- **Servidor de inferencia en producción**: integrar el head MTP en un `llama-server` con el modelo base `Qwen3.8-9B-Distill` para reducir la latencia por token en cargas de trabajo de chat y generación de código.
- **Despliegue en GPUs de consumo**: con el head Q8_0 (2.43 GB) y el modelo base en Q4_K_M (5.38 GB), el conjunto cabe en una GPU de 24 GB, como la Intel Arc Pro B60 usada en los benchmarks, o en una RTX 3090/4090.
- **Verificación de calidad de decodificación**: usar las métricas de Prometheus para medir la tasa de aceptación en el workload real y ajustar `--spec-draft-n-max` o la temperatura.
- **Aceleración de prefill en contextos largos**: el head mantiene velocidades de prefill de ~2,000 tok/s en contextos de 2K a 12K, lo que beneficia a tareas de procesamiento de documentos largos.
- **Investigación sobre decodificación especulativa**: el repositorio permite reproducir la conversión con `convert_hf_to_gguf.py --mtp`, útil para estudiar el impacto de la cuantización de heads MTP en la tasa de aceptación.
- **Integración en pipelines de agentes**: al combinarse con el modelo base, que soporta tool calling y razonamiento, el head acelera los pasos de generación en agentes multi-step sin sacrificar calidad.

## Benchmarks y rendimiento

El autor publicó resultados en una GPU Intel Arc Pro B70 24 GB (Battlemage) con llama.cpp SYCL (`GGML_SYCL_F16=ON`, build `b10566`), usando el modelo base en Q4_K_M y el head en Q8_0. La medición se realizó con 20 runs de 300 tokens a `temp 0.6 / top-p 0.95 / top-k 20` (muestreo, no greedy).

| Metrica | Valor |
|---|---|
| Decode (mediana) | 73.97 tok/s |
| Decode (media) | 65.56 tok/s (sigma 10.57) |
| Tasa de aceptacion | 81.4% (4,236 aceptados de 5,203 tokens draft) |
| Tokens aceptados por draft | 2.43 (con `--spec-draft-n-max 3`) |
| Prefill | 1,914 @ 2K · 1,957 @ 5K · 2,020 @ 12K tok/s |
| Pico de VRAM | 14.76 GiB (modelo + head, contexto <= 12K) |

Para contexto, el autor comparó con otro modelo de la misma arquitectura, Ornith 1.5-9B con head MTP Q8_0, que alcanzó 65.15 tok/s de mediana y 84.7% de aceptación en el mismo entorno. No se midió la velocidad sin head (baseline) en este hardware, por lo que no se reporta un factor de aceleración.

## Requisitos de hardware

- **VRAM estimada**: 14.76 GiB para el modelo base Q4_K_M + head Q8_0 con contexto de hasta 12K tokens. El head BF16 añade ~2.1 GB extra frente al Q8_0.
- **GPU recomendada**: GPU con 24 GB de VRAM, como la Intel Arc Pro B70 (Battlemage) usada en el benchmark, o equivalentes NVIDIA (RTX 3090/4090, A10G, L4).
- **Compatibilidad consumer**: Sí, cabe en GPUs de consumo con 24 GB VRAM. Con contexto reducido (<=8K) y cuantizaciones más agresivas del modelo base, podría caber en 16 GB.
- **Opciones de despliegue**: llama.cpp y llama-server (con soporte para arquitectura `qwen35` y MTP), vía `--model-draft` y `--spec-type draft-mtp`. No se ha documentado compatibilidad con vLLM u otros frameworks.
- **Latencia y throughput**: ~74 tok/s de mediana en decode con el head Q8_0 en la GPU de prueba, y prefill de ~2,000 tok/s. El decode es bimodal (clusters cerca de 74 y 50 tok/s), por lo que conviene usar la mediana en comparaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode (tok/s) | Aceptacion | Licencia |
|---|---|---|---|---|---|
| `srmiles/Qwen3.8-9B-Distill-MTP-GGUF` (head Q8_0) | 2.28B (head) | no disponible | 73.97 (mediana) | 81.4% | Apache 2.0 |
| Ornith 1.5-9B + MTP head Q8_0 | ~9B + 2.28B head | no disponible | 65.15 (mediana) | 84.7% | no disponible |
| `empero-ai/Qwen3.8-9B-Distill` (sin head) | 9B | no disponible | no medido | no aplica | Apache 2.0 |

La comparación directa se limita al head, no al modelo completo. El head de este repositorio supera al de Ornith en velocidad de decode, pero tiene una tasa de aceptación ligeramente inferior. La diferencia es menor y está dentro de la variabilidad esperada entre modelos de la misma arquitectura. No se dispone de datos de benchmarks de calidad (MMLU, GSM8K, etc.) para el modelo base con o sin head.

## Limitaciones y advertencias

- **No es un modelo autónomo**: este repositorio contiene únicamente el draft head para decodificación especulativa; sin el modelo base `empero-ai/Qwen3.8-9B-Distill` no genera texto alguno.
- **Dependencia del modelo base**: la tasa de aceptación y la velocidad final dependen del modelo base que se use, del hardware y del workload. Los números del benchmark se midieron en un entorno específico y no son una promesa para otros entornos.
- **Soporte de llama.cpp limitado**: se requiere una versión reciente de llama.cpp con soporte para la arquitectura `qwen35` y MTP. El autor indica que cualquier build reciente con ese soporte debería cargar estos ficheros.
- **Sesgos y alucinaciones**: no hay información específica sobre sesgos del modelo base; como es una destilación de Qwen3.8, puede heredar los sesgos del profesor. El riesgo de alucinación es inherente al modelo de lenguaje base, no al head.
- **Licencia**: Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones de atribución, pero conviene revisar los términos de Qwen3.8 original.
- **Cuántización del head**: el autor recomienda Q8_0 como opción por defecto, pero advierte que la tasa de aceptación puede degradarse con cuantizaciones más agresivas. BF16 es la referencia para verificar la pérdida de calidad.
- **No se midió la aceleración real**: al no haber baseline sin head en el mismo hardware, no se puede afirmar cuánto acelera el sistema completo. La cifra de 73.97 tok/s es lo que hace el modelo con el head, no el incremento frente a sin él.

## Enlaces

- [Repositorio HuggingFace del head MTP](https://huggingface.co/srmiles/Qwen3.8-9B-Distill-MTP-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/empero-ai/Qwen3.8-9B-Distill)
- [Modelo Qwen3.8-9B de Empero](https://huggingface.co/empero-ai/Qwen3.8-9B)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Blog de MindStudio sobre Qwen3.8-9B Distill](https://www.mindstudio.ai/blog/qwen3-8-9b-distill-empero)
- [Blog de MindStudio sobre ejecución local de Qwen3.8-9B](https://www.mindstudio.ai/blog/qwen3-8-9b-distillation-local)
