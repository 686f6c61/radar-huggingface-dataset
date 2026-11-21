# Xylolabs/Cosmos3-Nano-Text-GGUF

## Resumen

Cosmos3-Nano-Text-GGUF es una cuantización en formato GGUF del modelo de lenguaje extraído de nvidia/Cosmos3-Nano, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un desarrollo de NVIDIA orientado a la comprensión de texto, construido a partir de Qwen3-VL-8B, del que se ha aislado la torre de entendimiento textual y se ha reconvertido a nombres de tensores compatibles con Qwen3. Esta versión GGUF contiene únicamente el modelo de lenguaje, junto con el tokenizador y la plantilla de chat originales.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 8.190.735.360 parámetros en hardware de consumo mediante cuantizaciones que van desde Q8_0 (8,71 GB) hasta IQ4_XS-imat (4,56 GB), con métricas de degradación publicadas frente a BF16 (KL media y coincidencia top-1). El autor documenta el proceso de cuantización con importancia matrix (imatrix) para las variantes IQ4_XS, lo que reduce la pérdida de calidad respecto a la cuantización estándar.

El modelo soporta inglés y coreano, se distribuye bajo licencia OpenMDW-1.1 (la licencia de NVIDIA para Cosmos3-Nano) y mantiene la Apache License 2.0 del Qwen Team por su ascendencia sobre Qwen3-VL-8B. La información disponible no detalla la longitud de contexto nativa ni los datos de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-VL-8B, torre de texto extraída) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 8192`) |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | openmdw-1.1 (con Apache License 2.0 heredada de Qwen) |
| Formato de pesos | GGUF (un archivo por cuantización) |

## Arquitectura y entrenamiento

El modelo base, nvidia/Cosmos3-Nano, procede de Qwen3-VL-8B. Xylolabs ha extraído la torre de comprensión de texto, la ha convertido a nombres de tensores compatibles con Qwen3, la ha transformado a GGUF y la ha cuantizado. Cada archivo GGUF contiene el modelo de lenguaje completo más el tokenizador y la plantilla de chat originales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovación técnica destacable de esta publicación es el uso de importance matrix (imatrix) en la variante IQ4_XS-imat, que mejora las métricas de fidelidad frente a BF16: KL media de 0,0222 y 92,26 % de coincidencia top-1, frente a 0,0386 y 90,27 % de la IQ4_XS sin imatrix, con un tamaño prácticamente idéntico (4,56 GB frente a 4,59 GB). Las métricas se calcularon sobre 16.272 posiciones de texto en inglés y coreano. La distribución de tipos de tensor está documentada por cuantización (por ejemplo, IQ4_XS-imat: 145 tensores F32, 217 IQ4_XS, 36 Q5_K y 1 Q6_K).

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Comprensión de texto derivada de la torre textual de Qwen3-VL-8B.
- Plantilla de chat incluida en el archivo GGUF, compatible con `--jinja` en llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking. La extracción se limita a la torre de texto, por lo que las capacidades multimodales del modelo base no están presentes en esta cuantización.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: la variante IQ4_XS-imat (4,56 GB) permite ejecutar el modelo en CPU con llama.cpp, adecuado para prototipado y pruebas de conversación en inglés o coreano.
- Inferencia en GPU de consumo: Q5_K_M (5,85 GB) o Q6_K (6,73 GB) caben en tarjetas con 8-12 GB de VRAM, lo que facilita entornos de desarrollo con una sola GPU.
- Servicio de chat ligero con `llama-server`: el binario acepta los mismos flags que `llama-cli` y expone una API compatible con endpoints, útil para integrar el modelo en aplicaciones web internas.
- Procesamiento de texto en coreano: al ser uno de los dos idiomas soportados y estar las métricas de cuantización calculadas sobre texto coreano, es adecuado para tareas de generación y resumen en ese idioma.
- Evaluación comparativa de cuantizaciones: las métricas de KL y top-1 publicadas permiten seleccionar el equilibrio tamaño/calidad en pipelines de investigación sobre cuantización.
- Base para ajuste fino o experimentación: al conservar el tokenizador y la plantilla de chat originales, sirve como punto de partida para experimentos con llama.cpp en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16:

| Cuantización | Tamaño | KL media vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q8_0 | 8,71 GB | 0,0013 | 97,84 % |
| Q6_K | 6,73 GB | 0,0044 | 96,10 % |
| Q5_K_M | 5,85 GB | 0,0090 | 94,79 % |
| IQ4_XS | 4,59 GB | 0,0386 | 90,27 % |
| IQ4_XS-imat | 4,56 GB | 0,0222 | 92,26 % |

Las métricas cubren 16.272 posiciones de texto en inglés y coreano, tomando como referencia la pasada en BF16 con transformers.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. IQ4_XS-imat ~4,56 GB, Q5_K_M ~5,85 GB, Q6_K ~6,73 GB, Q8_0 ~8,71 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q8_0 encaja en GPUs de 12 GB o más; Q6_K y Q5_K_M en GPUs de 8-12 GB; las variantes IQ4_XS en GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, en tarjetas con VRAM suficiente según la cuantización elegida (por ejemplo, RTX 3060 12 GB para Q8_0; RTX 4060 8 GB para Q5_K_M).
- Opciones de despliegue: llama.cpp (compilación con `-DGGML_CUDA=ON` para NVIDIA), `llama-cli` y `llama-server`. Se requiere el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en tareas del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo deriva de Qwen3-VL-8B (8B parámetros, licencia Apache 2.0 en su componente Qwen) y de nvidia/Cosmos3-Nano (licencia OpenMDW-1.1). Cualquier comparación con otros modelos de 8B requeriría benchmarks que no se han publicado aquí.

## Limitaciones y advertencias

- Solo se ha extraído la torre de texto: las capacidades de visión del modelo base Qwen3-VL-8B no están disponibles en esta cuantización.
- Idiomas limitados a inglés y coreano; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto nativa no documentada; el ejemplo de ejecución usa 8.192 tokens, pero no se confirma como máximo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; se mantiene además la Apache License 2.0 del Qwen Team por la ascendencia del modelo.
- Xylolabs declara no estar afiliada ni respaldada por NVIDIA, Qwen ni Alibaba Cloud.
- Las métricas de cuantización se limitan a fidelidad frente a BF16, no a calidad absoluta en tareas.
- Para producción, verificar la compatibilidad del commit de llama.cpp indicado y la plantilla de chat con `--jinja`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
- Informe técnico de Cosmos 3: enlazado desde la model card de nvidia/Cosmos3-Nano (no se proporciona URL directa en la información disponible).
