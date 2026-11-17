# zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF

## Resumen

DeepSeek-V4-Flash-0731 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 284.334.567.511 parámetros totales según los pesos en safetensors del modelo base. Esta ficha cubre la cuantización GGUF publicada por zephel01 bajo el identificador `DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF`, un build de 72,0 GB pensado específicamente para ejecutarse en un PC con una GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 64 GB de RAM. El objetivo del autor no es otro que hacer viable un modelo de casi 285.000 millones de parámetros en hardware de consumo, manteniendo los 256 expertos enrutados de cada capa sin poda.

La cuantización mezcla varios tipos por componente: los expertos enrutados (gate/up) en IQ1_S, los down de los expertos en IQ2_S (capas 36-42 en IQ3_XXS), las proyecciones de atención `attn_q_b`, `attn_output_a` y `attn_output_b` en Q5_K, y el resto de tensores tomados de los bytes de UD-Q2_K_XL de unsloth. El resultado son 1,92 bits por peso de media, aproximadamente equivalentes a un IQ2_XXS. El modelo está etiquetado como BETA y medido en un único equipo hasta la fecha.

La relevancia actual radica en la relación entre ajuste y velocidad: frente al UD-Q2_K_XL de 96,8 GB, que no cabe en el target y recurre al SSD en cada token (33,4 tok/s), este L72 alcanza 90,0 tok/s, un 2,7x más rápido, a costa de peor divergencia KL (0,314 frente a 0,186) pero con resultados equivalentes en las pruebas de uso real documentadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer; 256 expertos enrutados por capa, sin poda |
| Parámetros totales | 284.334.567.511 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor cubren needles de 8K a 31K) |
| Tipos de cuantización | Mezcla: IQ1_S (gate/up de expertos), IQ2_S (down de expertos, capas 36-42 en IQ3_XXS), Q5_K (attn_q_b, attn_output_a, attn_output_b), resto de bytes de UD-Q2_K_XL; 1,92 bits/peso de media |
| Idiomas soportados | en, ja (según model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 72,0 GB; SHA256SUMS incluido) |

## Arquitectura y entrenamiento

El modelo base es un MoE de DeepSeek con 284.334.567.511 parámetros totales y 256 expertos enrutados por capa, que esta cuantización conserva íntegramente. Los expertos originales del modelo base están en MXFP4 y fueron recuantizados con LDLQ a partir de UD-Q8_K_XL de unsloth, usando un volcado de Hessiano generado con las propias respuestas de chat de V4 (241 prompts, 104 de ellos en japonés) más texto general, junto con una imatrix propia. Las proyecciones de atención se mantienen en Q5_K para preservar calidad en esa parte crítica.

El resultado es un archivo híbrido que no corresponde a ningún quant estándar de llama.cpp: el nombre del repo indica el tipo más cercano a la media de bits de los expertos, no el tipo real de todos los tensores. El primer shard (solo metadatos, 5 MB) es el archivo de unsloth tal cual, por lo que su campo `general.quantized_by` sigue indicando Unsloth. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. El autor menciona un drafter denominado DSpark, no medido a este tamaño y desaconsejado por su consumo de VRAM (~6,5 GB), que en el build de 32G96G ralentizaba la decodificación.

## Capacidades

- Generación de texto conversacional multi-turno (la model card documenta una conversación de 11 turnos).
- Razonamiento y respuesta a preguntas factuales (verificado con 10 respuestas en japonés sin errores factuales en las pruebas del autor).
- Generación de código: 5 tareas de programación con tests superadas 5/5 en el build L72.
- Tool calling / function calling: incluido en la batería de comprobaciones `--check` de Abyss (superada 11/11).
- Recuperación en contexto largo: needle de 8K encontrado; el `--check` cubre needles de 8K a 31K.
- Capacidades multilingües limitadas a inglés y japonés según la model card; el autor documenta 9 de 10 respuestas que se mantuvieron en japonés.
- Integración con endpoints compatibles con la API de OpenAI (`/v1/chat/completions`).

## Casos de uso

- Asistente conversacional local multi-turno: el modelo mantiene contexto en conversaciones de al menos 11 turnos, lo que permite desplegar un chatbot privado en una estación de trabajo con RTX 5090 sin depender de la nube.
- Generación de código en local con verificación: las 5 tareas de programación con tests se superaron al 100% en las pruebas del autor, lo que lo hace apto para pipelines de generación y test automatizado en entornos con requisitos de privacidad.
- Automatización con tool calling: la comprobación de llamada a herramientas se superó, habilitando agentes que invocan funciones externas (APIs, scripts) desde un endpoint compatible con OpenAI en `127.0.0.1:8082`.
- Procesamiento de documentos largos en japonés e inglés: con needles verificados hasta 31K tokens, sirve para resumen y extracción sobre contratos o informes en esos dos idiomas.
- Desarrollo y evaluación de cuantizaciones: el repo incluye métricas de KL, porcentaje de mismo token top y scripts de reproducción, útil para investigadores que comparan estrategias de cuantización MoE con LDLQ e imatrix.
- Inferencia con offload CPU/GPU en hardware de consumo: el diseño 32G64G permite ejecutar un modelo de 284B parámetros en un PC con 32 GB de VRAM y 64 GB de RAM a 90 tok/s, escenario inviable con cuants que exceden la memoria disponible.
- Experimentación con modelos frontera sin infraestructura de datacenter: útil para laboratorios pequeños que necesitan evaluar comportamiento de un MoE grande antes de comprometer presupuesto de GPU profesionales.

## Benchmarks y rendimiento

Calidad (KL frente a UD-Q8_K_XL de unsloth, 12 secuencias x 1.024 tokens: 8 de texto inglés, 1 de código, 3 de japonés; motor Abyss):

| Modelo | Descarga | KL (12 seqs) | KL japonés (3) | Mismo token top |
|---|---:|---:|---:|---:|
| L72 (este repo) | 72,0 GB | 0,314 | 0,331 | 76,9% |
| UD-Q2_K_XL de unsloth (referencia) | 96,8 GB | 0,186 | 0,219 | 81,5% |
| L97 (32G96G) | 96,8 GB | 0,150 | 0,145 | 84,1% |

Uso real (Abyss v1.3.120, RTX 5090, límites 32G64G):

| Prueba | L72 | UD-Q2_K_XL |
|---|---:|---:|
| `--check` de Abyss (japonés, 3 tareas de código, tool call, needle 8K-31K, conversación de 11 turnos) | 11/11 | 11/11 |
| 10 respuestas en japonés que permanecieron en japonés | 9/10 | 8/10 |
| Hechos erróneos en esas respuestas | 0 | 0 |
| 5 tareas de código con tests | 5/5 | 5/5 |
| Needle 8K | encontrado | no indicado |

Rendimiento: 90,0 tok/s en RTX 5090 con el tier de RAM limitado a 40 GB bajo un límite de 58 GB (la cuota de un PC de 64 GB), frente a 33,4 tok/s de UD-Q2_K_XL, que no cabe y espera al SSD en cada token (2,7x más rápido). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: target de 32 GB de VRAM más 64 GB de RAM; el archivo completo ocupa 72,0 GB en disco.
- GPU recomendadas por el autor: RTX 5090 (32 GB) y AI PRO R9700 (32 GB).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con offload a RAM; no cabe íntegramente en GPUs de 24 GB o menos.
- Despliegue: motor Abyss v1.3.120 o superior (recomendado por el autor, con `setup-deepseek.sh --quant 32G64G --no-dspark --download-model`); llama.cpp no verificado todavía. El drafter DSpark no está medido a este tamaño y se desaconseja por su consumo de ~6,5 GB de VRAM.
- Latencia y throughput: 90,0 tok/s medidos en RTX 5090 con RAM limitada a 40 GB; sin datos de latencia por token ni de otras GPU.
- Alternativas del mismo autor: IQ1_S-16G64G (61,7 GB, para 16 GB VRAM + 64 GB RAM), IQ2_M-32G96G (96,8 GB, para 32 GB VRAM + 96 GB RAM, mayor calidad) y DGX-Spark (96,8 GB, para 128 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| L72 (este repo) | 284,3B totales | no disponible | 0,314 | 90,0 tok/s (RTX 5090) | MIT | GGUF, 72,0 GB |
| L97 (32G96G, mismo autor) | 284,3B totales | no disponible | 0,150 | no disponible | MIT | GGUF, 96,8 GB |
| UD-Q2_K_XL (unsloth) | 284,3B totales | no disponible | 0,186 | 33,4 tok/s (RTX 5090, con espera a SSD) | MIT | GGUF, 96,8 GB |
| IQ1_S-16G64G (mismo autor) | 284,3B totales | no disponible | no disponible | no disponible | MIT | GGUF, 61,7 GB |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: medido en un único PC (RTX 5090 de 32 GB) y el archivo puede sustituirse por un build mejor tras nuevas mediciones, con cambio de nombre de carpeta.
- Pérdida de calidad frente a cuants mayores: KL de 0,314 frente a 0,186 de UD-Q2_K_XL y 0,150 de L97; con 96 GB de RAM o más, el autor recomienda L97.
- Riesgo de alucinación: no cuantificado de forma sistemática; las pruebas del autor solo reportan 0 hechos erróneos en 10 respuestas en japonés.
- Idiomas: solo inglés y japonés declarados; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la longitud máxima no está publicada; las pruebas solo cubren needles hasta 31K tokens.
- Licencia MIT, que permite uso comercial, pero el modelo base y los bytes de parte de los tensores provienen de terceros (DeepSeek y unsloth) y deben verificarse sus condiciones.
- El primer shard conserva metadatos de unsloth (`general.quantized_by`), lo que puede confundir en auditorías de procedencia.
- El motor Abyss es el único entorno medido; llama.cpp no está verificado, por lo que el rendimiento en otros runners es desconocido.
- El drafter DSpark no está medido a este tamaño y consume ~6,5 GB de VRAM adicionales, por lo que se recomienda arrancar sin él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión 16G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Versión 32G96G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Envío de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G64G+L72+on+YOUR_GPU
