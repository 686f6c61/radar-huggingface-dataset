# zephel01/DeepSeek-V4-Flash-0731-32G96G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-32G96G-GGUF es una cuantización GGUF del modelo DeepSeek-V4-Flash-0731 (desarrollado por DeepSeek AI, publicado bajo licencia MIT) realizada por el usuario zephel01. El objetivo es permitir la ejecución local de un modelo de arquitectura MoE (mixture of experts) de gran tamaño en un ordenador personal con una GPU de 32 GB de VRAM (RTX 5090 o AI PRO R9700) y 96 GB de RAM, manteniendo los 256 expertos enrutados de cada capa sin poda alguna. El archivo resultante pesa 96,8 GB y se distribuye en tres shards.

La cuantización emplea una mezcla heterogénea de tipos (IQ2_XS, IQ3_XXS, IQ2_S y MXFP4 para los expertos, Q5_K para determinadas proyecciones de atención y tipos densos de Unsloth para el resto), con una media de 2,64 bits por peso, lo que la sitúa cerca de un IQ2_M estándar. El autor aplica LDLQ (una variante de cuantización con corrección por matriz de Hessian) partiendo de los pesos originales en MXFP4 de Unsloth UD-Q8_K_XL, y genera su propia imatrix a partir de 241 prompts de chat (104 en japonés) más texto general.

La relevancia de esta ficha radica en que documenta una de las pocas alternativas prácticas para servir un modelo MoE de gran escala en hardware de consumo, con métricas de calidad (KL frente a la referencia Q8) y de rendimiento (69,1 tok/s en RTX 5090) medidas por el propio autor. El modelo está marcado como BETA y solo se ha validado en un único equipo hasta la fecha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles completos de la arquitectura base no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han validado pruebas needle de 8K a 31K) |
| Tipos de cuantización | Mezcla: expertos en IQ2_XS (41 %), IQ3_XXS (39 %), IQ2_S (18 %) y MXFP4 (2 %); atención (attn_q_b, attn_output_a, attn_output_b) en Q5_K; resto de tensores en tipos densos de Unsloth UD-Q2_K_XL; media de 2,64 bits por peso |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 96,8 GB en total) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash-0731, un transformer con arquitectura de mezcla de expertos (MoE) que conserva 256 expertos enrutados en cada capa. Esta ficha describe exclusivamente la cuantización: los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta versión reside en el proceso de cuantización. Los expertos enrutados se recuantizaron con LDLQ a partir de los pesos originales en MXFP4 de Unsloth UD-Q8_K_XL. Las matrices de Hessian necesarias para LDLQ se obtuvieron de 241 respuestas de chat generadas por el propio V4 (104 de ellas en japonés, usando la plantilla del modelo) junto con texto general. El autor generó su propia imatrix de aproximadamente 1 millón de tokens, ya que Unsloth no publicó una para V4. Las capas 31-42 usan IQ2_S, la capa 26 usa IQ3_XXS y las capas 26 y 42 mantienen los expertos down en MXFP4. El primer shard (solo metadatos, 5 MB) es el archivo de Unsloth sin modificar, por lo que su campo `general.quantized_by` sigue indicando Unsloth.

## Capacidades

- Generación de texto y conversación multi-turno (se han validado conversaciones de 11 turnos).
- Razonamiento y respuesta a preguntas factuales (0 hechos erróneos en 10 respuestas japonesas evaluadas).
- Generación de código (4 de 5 tareas con tests superadas en la evaluación del autor).
- Llamada a herramientas (tool calling), validada en la batería de pruebas `--check` de Abyss.
- Recuperación de información en contexto largo (needle de 8K a 31K tokens).
- Capacidades multilingües limitadas a inglés y japonés según los metadatos del repositorio.
- No se dispone de información sobre modo thinking, visión, audio ni otras capacidades especiales del modelo base.

## Casos de uso

- Asistente de código local en japonés e inglés: el modelo puede integrarse en un IDE o CLI para autocompletado y generación de funciones, aprovechando que la cuantización conserva los 256 expertos y que se han validado tareas de código con tests en ambos idiomas.
- Chat de atención al cliente en japonés: con contexto validado de hasta 31K tokens, puede gestionar conversaciones multi-turno (se probaron 11 turnos) manteniendo respuestas en japonés en 7 de cada 10 casos evaluados.
- Automatización de agentes con tool calling: la batería `--check` de Abyss incluye una prueba de llamada a herramientas superada, lo que permite integrarlo en pipelines de agentes que invocan APIs externas.
- Procesamiento de documentación técnica larga: la ventana de contexto validada (8K-31K) permite resumir y extraer información de manuales o informes extensos en una máquina de sobremesa.
- Desarrollo y pruebas de pipelines LLM en local: sirve como banco de pruebas para ingeniería de prompts, evaluación de cuantizaciones y comparación de motores (Abyss, llama.cpp) sin depender de APIs en la nube.
- Despliegue en estaciones de trabajo con GPU de consumo: un equipo con RTX 5090 (32 GB) y 96 GB de RAM puede servir el modelo a 69,1 tok/s, suficiente para uso interactivo individual o pequeños equipos internos.
- Investigación sobre cuantización extrema: el repositorio documenta KL, imatrix y tipos por tensor, lo que lo convierte en material de referencia para estudiar el impacto de LDLQ y las mezclas de tipos en modelos MoE.

## Benchmarks y rendimiento

Calidad medida por el autor frente a Unsloth UD-Q2_K_XL (referencia), con KL sobre log-probabilidades top-k, 12 secuencias de 1.024 tokens (8 de texto inglés, 1 de código, 3 de japonés), motor Abyss:

| Métrica | L97 (este repo) | UD-Q2_K_XL |
|---|---:|---:|
| Tamaño de descarga | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,150 | 0,186 |
| KL, japonés (3 secuencias) | 0,145 | 0,219 |
| Mismo token top-1 | 84,1 % | 81,5 % |

Pruebas de uso real (Abyss v1.3.120, RTX 5090, límites 32G96G):

| Prueba | L97 | UD-Q2_K_XL |
|---|---:|---:|
| `--check` (japonés, 3 tareas de código, tool call, needle 8K-31K, conversación de 11 turnos) | 10 / 11 | 11 / 11 |
| 10 respuestas en japonés que permanecieron en japonés | 7 / 10 | 7 / 10 |
| Hechos erróneos en esas respuestas | 0 | 0 |
| 5 tareas de código con tests | 4 / 5 | 5 / 5 |

Rendimiento: 69,1 tok/s en una RTX 5090 con el nivel de RAM limitado a 60 GB (bajo un límite de 84 GB). Frente a UD-Q2_K_XL, la versión L97 es un 6 % más rápida a 4K y un 3 % más rápida a 16K en el mismo equipo.

## Requisitos de hardware

- VRAM: 32 GB para la GPU; el autor recomienda no usar el drafter DSpark en una GPU de 32 GB porque consume unos 6,5 GB de VRAM y reduce el número de expertos que caben en la GPU, forzando más lecturas desde SSD.
- RAM: 96 GB en el equipo objetivo; en la medición se limitó el nivel de RAM a 60 GB bajo un límite de 84 GB.
- GPU recomendadas: RTX 5090 (32 GB) y AI PRO R9700; también existe una variante específica para DGX Spark (128 GB), donde el drafter sí aporta beneficios.
- Cabe en GPU de consumo: sí, en una RTX 5090 de 32 GB combinada con 96 GB de RAM del sistema.
- Otras variantes del mismo autor para hardware menor: IQ1_S-16G64G (16 GB GPU + 64 GB RAM, 61,7 GB de descarga) e IQ2_XXS-32G64G (32 GB GPU + 64 GB RAM, 72,0 GB).
- Despliegue: motor Abyss v1.3.120 o superior (recomendado, con `setup-deepseek.sh --quant 32G96G --no-dspark --download-model`); llama.cpp no ha sido verificado todavía, aunque los tipos de tensor son ggml estándar en el layout de Unsloth.
- Latencia y throughput: 69,1 tok/s medidos en RTX 5090 con RAM limitada a 60 GB; no hay datos de latencia publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-32G96G-GGUF (L97, este repo) | MoE, 256 expertos/capa; total no disponible | no disponible | 0,150 (12 seqs); 0,145 (japonés) | MIT | Hugging Face, 96,8 GB |
| Unsloth UD-Q2_K_XL (referencia) | MoE, mismos expertos | no disponible | 0,186 (12 seqs); 0,219 (japonés) | MIT (modelo base) | Hugging Face, 96,8 GB |
| DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF (mismo autor) | MoE, mismos expertos | no disponible | no disponible | MIT | Hugging Face, 72,0 GB |
| DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF (mismo autor) | MoE, mismos expertos | no disponible | no disponible | MIT | Hugging Face, 61,7 GB |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de comparaciones con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: solo se ha medido en un único PC (RTX 5090 de 32 GB con RAM limitada a 60 GB); el autor advierte que el archivo puede ser reemplazado por una compilación mejor tras nuevas mediciones, lo que cambiará el nombre de la carpeta.
- Rendimiento inferior a la referencia en pruebas de uso real: 10/11 en `--check` y 4/5 en tareas de código con tests, frente a 11/11 y 5/5 de UD-Q2_K_XL.
- Retención del idioma japonés limitada: solo 7 de cada 10 respuestas permanecieron en japonés en la evaluación del autor.
- Idiomas: únicamente inglés y japonés según los metadatos; no hay soporte declarado para castellano.
- Riesgo de alucinación: la cuantización a 2,64 bits por peso introduce degradación frente a los pesos originales (KL 0,150), aunque en la muestra evaluada no se registraron hechos erróneos.
- El drafter DSpark no debe usarse en GPU de 32 GB (consume 6,5 GB de VRAM y empeora el rendimiento al expulsar expertos de la GPU).
- llama.cpp no está verificado; el único motor validado es Abyss.
- El primer shard conserva los metadatos de Unsloth (`general.quantized_by` indica Unsloth), lo que puede confundir en auditorías de procedencia.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción y la validación es limitada a un solo equipo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 32G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante 16G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Formulario para reportar resultados de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G96G+L97+on+YOUR_GPU
