# zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF

## Resumen

Qwen3.8-Flash-Next-16G64G-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 176.943.899.520 parámetros totales (unos 177B), orientado a generación de texto conversacional y con capacidades declaradas en japonés, chino, inglés, código, matemáticas y tool calling. Esta ficha describe la cuantización, no el modelo original de Qwen.

La particularidad de esta publicación es su objetivo de despliegue: un PC con una GPU de 16 GB de VRAM y 64 GB de RAM. Para lograrlo se re-cuantizan los expertos del modelo NVFP4 original mediante LDLQ (una variante de cuantización con información de Hessian), manteniendo los 512 expertos sin poda. El resultado es un archivo de 86,9 GB con una media de 3,55 bits por peso, aproximadamente equivalente a IQ3_M.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización de precisión mixta aplicada a un MoE de gran tamaño; por otro, advierte de que se trata de una versión BETA medida en un único equipo emulado (una RTX 5090 con la VRAM limitada a 16 GB), por lo que las cifras de rendimiento no deben extrapolarse sin verificación. La licencia es qwen-community-1.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); arquitectura de motor `qwen4exp` en llama.cpp |
| Parámetros totales | 176.943.899.520 (aprox. 177B), dato de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card cita pruebas con prompts de 8K tokens, sin especificar el máximo) |
| Tipos de cuantización | Mezcla IQ3_XXS (56% de los bytes), IQ4_NL (42%), IQ3_S (1%); media de 3,55 bits por peso, aprox. IQ3_M |
| Idiomas soportados | no disponible en metadatos; la model card menciona japonés, chino, inglés y código en los datos de calibración |
| Licencia | qwen-community-1.0 (license_name: other) |
| Formato de pesos | GGUF, 3 shards (`Qwen3.8-Flash-Next-16G64G-0000N-of-00003.gguf`) |
| Tamaño del repo | 86,9 GB |
| Memoria residente estimada | 57,6 GB (GPU + RAM, excluye la tabla de embeddings por capa de 28,8 GB) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relación: quantized) |
| Descargas / likes | 72 / 0 |
| Fecha de creación | 2026-11-04 |
| Última actualización | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 177B parámetros totales y 512 expertos, según se deduce de la model card ("All 512 experts are kept"). No se dispone de información sobre el número de parámetros activos por token, la composición exacta del dataset de preentrenamiento ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

El proceso de cuantización sí está documentado con detalle. Se parte del modelo en formato NVFP4 (magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF) y se calculan matrices de Hessian sobre 1,26 millones de tokens de calibración: 181 prompts de conversación (44 en japonés, 20 en chino, 20 en inglés, 37 de código, 35 de matemáticas y 25 de tool calls), seguidos de texto mixto en los mismos idiomas y dominios. Con esos Hessians se aplica LDLQ para re-cuantizar cada experto: gate/up en IQ3_XXS (la capa 2 en IQ3_S) y down en IQ4_NL, con las escalas por experto plegadas en los pesos. Los tensores no expertos (atención, router, experto compartido, embeddings y la tabla de embeddings por capa) se copian sin cambios de la cuantización UD-IQ3_XXS de unsloth. La tabla de embeddings por capa ocupa 28,8 GB en IQ4_NL y se lee desde SSD unas pocas filas por token.

## Capacidades

- Generación de texto conversacional multi-turno, con modo "thinking" (razonamiento explícito) activable en el servidor Abyss.
- Generación de código: la model card reporta resultados en tareas de programación con tests ocultos (4/5 y 3/5 en dos semillas).
- Razonamiento aritmético y resolución de problemas matemáticos, con datos de calibración específicos de matemáticas.
- Soporte de tool calling / function calling, incluido en el conjunto de calibración (25 prompts dedicados).
- Capacidades multilingües: japonés, chino e inglés verificados en las pruebas; el japonés está tratado de forma explícita (correo empresarial, explicaciones, resúmenes, literatura y aritmética).
- Manejo de contexto largo: recuperación de información ("needle in a haystack") con prompts de 8K tokens verificada correctamente.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Asistente conversacional local en japonés: el modelo responde correctamente a prompts de correo empresarial, explicaciones y resúmenes en japonés (10/10 en las pruebas del autor), lo que lo hace adecuado para equipos que necesitan un asistente privado en ese idioma sin depender de la nube.
- Generación de código en estaciones de trabajo con GPU de 16 GB: con tool calling y modo thinking, puede integrarse en editores o pipelines locales; conviene aumentar `max_tokens` porque en algunas tareas el modelo agota el límite de 6.144 tokens razonando.
- Procesamiento de documentos largos: la ventana de contexto permite analizar prompts de 8K tokens con recuperación fiable de información, útil para resúmenes de contratos o informes.
- Automatización de flujos con function calling: los 25 prompts de tool calls en la calibración indican soporte para agentes que invocan APIs externas, aunque no hay benchmarks publicados de fiabilidad en agentes.
- Despliegue en hardware de consumo: al caber en 16 GB de VRAM + 64 GB de RAM, permite ejecutar un MoE de 177B en un PC de escritorio con una RTX 5090 o similar, algo inviable con el modelo en precisión completa.
- Inferencia con CPU offload en llama.cpp: con `--n-cpu-moe 39` (16,4 GB de VRAM) se obtienen 29-34 tok/s, suficiente para uso interactivo no intensivo.
- Experimentación e investigación en cuantización: el repositorio documenta el pipeline completo (Hessians, LDLQ, merge) con las herramientas de trench-gguf, lo que sirve como referencia para reproducir el método en otros MoE.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron en un PC emulado sobre una RTX 5090 (32 GB) con la VRAM limitada a 16 GB, 46 GB de RAM en un cgroup de 58 GB, 8 hilos de CPU, SSD NVMe y MTP drafter activado.

| Métrica | Este archivo | unsloth UD-IQ3_XXS | ISTA-DASLab GSQ-RCO IQ3_S | unsloth UD-IQ4_XS |
|---|---:|---:|---:|---:|
| Descarga | 86,9 GB | 82,0 GB | 83,6 GB | 93,7 GB |
| Residente (GPU + RAM) | 57,6 GB | 52,6 GB | 54,8 GB | 64,9 GB |
| KL (10 secuencias) | 0,083 | 0,154 | 0,117 | 0,092 |
| Mismo token top | 89,3% | 85,9% | 87,3% | 88,7% |
| KL japonés | 0,176 | 0,317 | 0,251 | 0,195 |
| KL código | 0,108 | 0,176 | 0,149 | 0,116 |
| Decodificación (3 tareas de código) | 70,7 tok/s | 71,3 tok/s | 61,8 tok/s | no medido |

Pruebas de uso real (servidor Abyss, thinking activado, dos semillas):

| Prueba | Este archivo | unsloth UD-IQ3_XXS |
|---|---|---|
| Japonés (5 prompts) | 10/10 correctos | 10/10 |
| 5 tareas de código con tests ocultos | 4/5 y 3/5 | 5/5 y 4/5 |
| Prompt de 8K, needle | OK / OK | OK / OK |
| Respuestas vacías o eco del prompt | ninguno | ninguno |
| Procesamiento de prompt (8K) | 1.618-1.627 tok/s | 1.729-1.747 tok/s |

En llama.cpp con `--n-cpu-moe 39`: 29-34 tok/s. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados en la información disponible.

## Requisitos de hardware

- VRAM: 16 GB como objetivo de diseño; el archivo completo requiere 57,6 GB residentes entre GPU y RAM, más lectura desde SSD de la tabla de embeddings por capa (28,8 GB).
- RAM: 64 GB en el equipo objetivo; la model card recomienda `STRATA_GLM_RAM_GB=46` en Abyss.
- GPU recomendadas: el autor midió sobre una RTX 5090 con VRAM limitada a 16 GB; no hay mediciones en otras GPU. Cualquier GPU de 16 GB o más con buen ancho de banda debería poder ejecutarlo, pero no está verificado.
- Cabe en GPU de consumo: sí, en el sentido de que el diseño apunta a una GPU de 16 GB más RAM del sistema; no cabe completo en VRAM de una sola tarjeta de consumo.
- Opciones de despliegue: Abyss v1.3.108 o superior (con empaquetado previo mediante `tools/iq_pack.py` y `--glm-pack`) y llama.cpp (arquitectura `qwen4exp`, upstream `ac8e1694d` del 2026-10-29). No se mencionan vLLM, TGI ni Ollama.
- Rendimiento: 70,7 tok/s en decodificación y 1.618-1.627 tok/s de procesamiento de prompt en Abyss sobre el equipo emulado; 29-34 tok/s en llama.cpp con offload de 39 capas MoE a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (zephel01, 16G64G) | 177B (MoE) | GGUF mixto IQ3/IQ4 | 86,9 GB | qwen-community-1.0 | Objetivo 16 GB VRAM + 64 GB RAM; KL 0,083 |
| unsloth UD-IQ3_XXS | 177B (MoE) | GGUF | 82,0 GB | qwen-community-1.0 | Referencia de calidad; KL 0,154; 71,3 tok/s |
| ISTA-DASLab GSQ-RCO IQ3_S | 177B (MoE) | GGUF | 83,6 GB | qwen-community-1.0 | KL 0,117; 61,8 tok/s |
| unsloth UD-IQ4_XS | 177B (MoE) | GGUF | 93,7 GB | qwen-community-1.0 | Nivel de 24 GB de VRAM; KL 0,092 |
| zephel01 IQ3_M-24G64G | 177B (MoE) | GGUF | no disponible | qwen-community-1.0 | Variante para GPU de 24 GB |

Todas las alternativas comparten el mismo modelo base y licencia; la diferencia está en el equilibrio entre tamaño, calidad (KL) y hardware objetivo. No se dispone de comparaciones con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Versión BETA: las mediciones se hicieron en un único PC emulado (RTX 5090 con VRAM limitada a 16 GB); no hay datos de GPU reales de 16 GB ni de otros tamaños de RAM.
- Calidad inferior a unsloth UD-IQ3_XXS en código: 7 de 10 frente a 9 de 10 en las pruebas del autor; en dos fallos el modelo agotó el límite de 6.144 tokens razonando, por lo que conviene aumentar `max_tokens` en tareas de ese tipo.
- Riesgo de sobrepensamiento ("overthinking") en tareas que afectan a todas las builds de Qwen3.8, según la model card.
- El archivo es 4,9 GB más grande que UD-IQ3_XXS, lo que reduce el margen de memoria en equipos ajustados.
- La tabla de embeddings por capa (28,8 GB) se lee desde SSD; un almacenamiento lento degradará el rendimiento.
- No hay información sobre sesgos, idiomas oficialmente soportados ni límite máximo de contexto; los metadatos de idioma están vacíos.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el texto completo antes de un despliegue en producción.
- Solo se documentan motores Abyss y llama.cpp; no hay soporte verificado en vLLM, TGI u Ollama.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante para 24 GB de VRAM: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Variante para 12 GB + 32 GB: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Variante 16G64G / 32G96G (en preparación): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-32G96G-GGUF
- Modelo NVFP4 de origen: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramientas de cuantización trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de reporte de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+16G64G+on+YOUR_GPU
