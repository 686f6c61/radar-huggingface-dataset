# zephel01/Qwen3.8-Flash-Next-16G64G-GGUF

## Resumen

Qwen3.8-Flash-Next-16G64G-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 176.943.899.520 parámetros totales (unos 177 mil millones), desarrollado por el equipo Qwen. Esta ficha se centra en la versión cuantizada distribuida en Hugging Face, cuyo objetivo es hacer viable la inferencia local de un modelo de gran tamaño en hardware de consumo: una GPU con 16 GB de VRAM y 64 GB de RAM.

La cuantización emplea una receta propia basada en LDLQ aplicada sobre los pesos en formato NVFP4 de NVIDIA, conservando los 512 expertos del modelo original y utilizando tipos mixtos (IQ3_XXS, IQ4_NL, IQ3_S) con una media de 3,55 bits por peso. El resultado es un archivo de 86,9 GB distribuido en tres shards, que se ejecuta en los motores Abyss y llama.cpp con la arquitectura `qwen4exp`. El autor la etiqueta como BETA, medida en un único equipo.

La relevancia de esta publicación radica en que demuestra que un modelo MoE de 177 mil millones de parámetros puede ejecutarse en un PC con una GPU de gama alta de consumo (RTX 5090) limitada a 16 GB de VRAM, con un rendimiento de decodificación de 70,7 tok/s en tareas de código, a costa de requerir 64 GB de RAM y de leer desde SSD la tabla de embeddings por capa (28,8 GB). Incluye soporte declarado para inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), arquitectura `qwen4exp` en llama.cpp |
| Parametros totales | 176.943.899.520 (unos 177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en los ejemplos de ejecución se usa `-c 32768`) |
| Tipos de cuantizacion | Mezcla de IQ3_XXS (56% de los bytes), IQ4_NL (42%), IQ3_S (1%); media de 3,55 bits por peso; aproximadamente equivalente a IQ3_M |
| Idiomas soportados | Inglés y japonés (según los tags del repo y el calibrado) |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (3 shards, 86,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 512 expertos por capa y una tabla de embeddings por capa de 28,8 GB. La cuantización re-cuantiza cada experto con LDLQ a partir de los pesos en formato NVFP4 de NVIDIA, manteniendo el layout de unsloth UD-IQ3_XXS con las proyecciones gate/up un paso por encima (IQ3_XXS). Los tensores no expertos (atención, router, experto compartido, embeddings y tabla de embeddings por capa) son los bytes de unsloth UD-IQ3_XXS sin modificar. No se eliminó ningún experto.

El calibrado se realizó con los propios turnos de chat del modelo (181 prompts, 44 de ellos en japonés) junto con texto mixto en los mismos idiomas. El autor no detalla en la información disponible el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacable de esta publicación es la receta de cuantización mixta con LDLQ sobre NVFP4, que consigue una divergencia KL de 0,083 frente al modelo NVFP4 (frente a 0,154 de unsloth UD-IQ3_XXS) con un archivo solo 4,9 GB mayor.

## Capacidades

- Generación de texto conversacional y tareas de razonamiento (modelo base orientado a `text-generation`).
- Generación de código: el autor reporta pruebas específicas de coding (3/5 prompts resueltos en uso real).
- Capacidades multilingües limitadas a inglés y japonés según los tags y el calibrado.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Modo thinking: el autor menciona "thinking on" en las pruebas de uso real del servidor Abyss.
- Capacidad de contexto largo: se reporta la recuperación de una aguja ("needle") en 8K tokens.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Inferencia local de un modelo de gran escala en hardware de consumo: un PC con GPU de 16 GB de VRAM y 64 GB de RAM puede ejecutar un MoE de 177 mil millones de parámetros con 70,7 tok/s en tareas de código, lo que permite usar el modelo sin depender de servicios en la nube.
- Asistencia a la programación en local: las pruebas del autor muestran 3/5 prompts de coding resueltos y una velocidad de decodificación de 29-34 tok/s en uso real con llama.cpp, adecuada para autocompletado y generación de fragmentos de código en un IDE.
- Procesamiento de documentación en inglés y japonés: el calibrado incluye 44 prompts en japonés y el autor reporta 5/5 respuestas no vacías en japonés en uso real, lo que lo hace apto para tareas de resumen o extracción en entornos bilingües EN/JA.
- Experimentación e investigación en cuantización: la publicación incluye métricas de KL, coincidencia de top token y comparativas con otras cuantizaciones (unsloth UD-IQ3_XXS, ISTA-DASLab GSQ-RCO IQ3_S), lo que la convierte en una referencia para estudiar el impacto de recetas LDLQ sobre NVFP4.
- Despliegue en estaciones de trabajo con DGX Spark: el mismo conjunto de archivos se distribuye en el repo Qwen3.8-Flash-Next-DGX-Spark-GGUF para equipos con 128 GB de memoria unificada.
- Recuperación de información en contexto medio: la prueba de aguja en 8K tokens encontrada sugiere uso para preguntas sobre documentos de extensión moderada dentro de la ventana configurada (32K en los ejemplos).
- Servicio local compatible con API OpenAI: el motor Abyss expone un endpoint `/v1/chat/completions`, lo que permite integrar el modelo en herramientas existentes que consuman la API de OpenAI sin cambios de código.

## Benchmarks y rendimiento

| Metrica | Este archivo (16G64G) | unsloth UD-IQ3_XXS | ISTA-DASLab GSQ-RCO IQ3_S | unsloth UD-IQ4_XS (24 GB) |
|---|---:|---:|---:|---:|
| Descarga | 86,9 GB | 82,0 GB | 83,6 GB | 93,7 GB |
| Residente (GPU + RAM) | 57,6 GB | 52,6 GB | 54,8 GB | 64,9 GB |
| KL (10 secuencias) | 0,083 | 0,154 | 0,117 | 0,092 |
| Mismo token top | 89,3% | 85,9% | 87,3% | 88,7% |
| KL, japonés | 0,176 | 0,317 | 0,251 | 0,195 |
| KL, código | 0,108 | 0,176 | 0,149 | 0,116 |

Otras métricas reportadas por el autor:

| Metrica | Valor |
|---|---|
| Velocidad de decodificación (RTX 5090 limitada a 16 GB, tier RAM 46 GB) | 70,7 tok/s en tareas de código (frente a 71,3 tok/s de unsloth UD-IQ3_XXS) |
| Velocidad en uso real con llama.cpp | 29-34 tok/s |
| VRAM medida en llama.cpp con `-ngl 99 --n-cpu-moe 39` | 16,4 GB |
| Prueba de aguja en 8K | encontrada |
| Prompts de japonés en uso real | 5/5 respondidos (ninguno vacío) |
| Prompts de coding en uso real | 3/5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB de VRAM para la GPU, con 64 GB de RAM del sistema (tier de RAM de 46 GB en un cgroup de 58 GB). El autor indica que en una tarjeta real de 16 GB conviene usar `--n-cpu-moe 40` o más.
- GPU recomendadas: RTX 5090 (usada en las mediciones), cualquier GPU con 16 GB de VRAM. El repo hermano de 24 GB está pensado para GPUs de 24 GB; el de 12 GB para GPUs de 12 GB con 32 GB de RAM.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 16 GB de VRAM con 64 GB de RAM, y en GPUs de 12 GB con 32 GB de RAM usando la variante E448 (448 de 512 expertos).
- Almacenamiento: se recomienda SSD, ya que la tabla de embeddings por capa (28,8 GB) se lee desde disco unas pocas filas por token.
- Opciones de despliegue: motor Abyss (v1.3.108 o posterior, con `setup-deepseek.sh`/`.bat`), llama.cpp (arquitectura `qwen4exp`, upstream `ac8e1694d` del 2026-10-29) mediante `llama-server`.
- Latencia y throughput: 70,7 tok/s en decodificación sobre RTX 5090 limitada a 16 GB en tareas de código; 29-34 tok/s en uso real con llama.cpp.
- Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-16G64G-GGUF (este) | 177 mil millones (MoE) | no disponible | GGUF, 86,9 GB | qwen-community-1.0 | Hugging Face (zephel01) |
| unsloth UD-IQ3_XXS (cuantización del mismo base) | 177 mil millones (MoE) | no disponible | GGUF, 82,0 GB | qwen-community-1.0 | Hugging Face (unsloth) |
| ISTA-DASLab GSQ-RCO IQ3_S (cuantización del mismo base) | 177 mil millones (MoE) | no disponible | GGUF, 83,6 GB | qwen-community-1.0 | Hugging Face (ISTA-DASLab) |
| unsloth UD-IQ4_XS (cuantización del mismo base, tier 24 GB) | 177 mil millones (MoE) | no disponible | GGUF, 93,7 GB | qwen-community-1.0 | Hugging Face (unsloth) |

No se dispone de información sobre modelos de otros desarrolladores comparables en la misma categoría (MoE de ~177 mil millones de parámetros con cuantización para hardware de consumo) en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones se realizaron en un único PC; el autor solicita reportes de GPUs reales de 16 GB y de otros tamaños de RAM.
- Requiere 64 GB de RAM además de la GPU de 16 GB; no es apto para equipos con menos memoria.
- Dependencia de SSD: la tabla de embeddings por capa (28,8 GB) se lee desde disco, lo que puede afectar la latencia en almacenamiento lento.
- Idiomas limitados a inglés y japonés según los tags; no se declara soporte de castellano ni de otros idiomas.
- Licencia qwen-community-1.0: es necesario revisar los términos completos en el enlace de licencia del modelo base antes de un uso comercial.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo en la información disponible.
- Los tipos de cuantización son mixtos y no corresponden a un tipo estándar de llama.cpp con ese nombre; el nombre del repo indica el tipo más cercano, no el tipo exacto.
- La ventana de contexto no se especifica en la documentación; los ejemplos de ejecución usan 32.768 tokens.
- Los benchmarks estándar (MMLU, HumanEval, GSM8K) no están publicados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión 12G32G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Versión 24G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+16G64G+on+YOUR_GPU
