# yeasah/gemma-4-12B-it-exl3

## Resumen

`yeasah/gemma-4-12B-it-exl3` es un conjunto de cuantizaciones EXL3 del modelo `google/gemma-4-12B-it`, publicado por el usuario yeasah. No es un modelo nuevo: es una redistribución en varios niveles de bits por peso (BPW) del modelo base de Google, pensada para ejecutarse con exllamav3 o con vLLM mediante el plugin `vllm-exl3-plugin`. El repositorio ocupa 36,3 GB porque aloja varias revisiones (3.00, 3.50, 4.00, 5.00 y 6.00 BPW) en un mismo espacio.

El interés práctico está en la calibración. El autor afirma haber calibrado con contenido que los modelos leen y escriben durante el trabajo real (documentos y salidas de herramientas en conversaciones, código y diffs, respuestas del propio modelo), no solo con texto web. Además, la model card incluye métricas de divergencia (excess KLD), cambio de perplejidad y una prueba de retención de hechos con 2.469 preguntas cerradas, lo que permite elegir el nivel de cuantización con datos concretos en lugar de a ciegas.

La ficha se centra en lo que la información disponible permite verificar: especificaciones del checkpoint, niveles de cuantización y sus métricas. Los detalles del modelo base (arquitectura interna, datos de entrenamiento, benchmarks de capacidad) no vienen en la información proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/gemma-4-12B-it`; el repo es una cuantizacion EXL3) |
| Parametros totales | 12B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 3.00, 3.50, 4.00, 5.00 y 6.00 BPW (revisiones separadas); embeddings de entrada tambien cuantizados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | EXL3 (checkpoint para exllamav3 / vLLM con plugin); no es safetensors ni GGUF estándar |

Datos adicionales por revisión:

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Delta de perplejidad | Hechos retenidos | Errores confiados |
|---|---|---|---|---|---|---|
| 3.00 | 4,98 GiB | 4,50 GiB | 0,0928 | +9,99% | 81,1% | 7,90% |
| 3.50 | 5,61 GiB | 5,13 GiB | 0,0427 | +4,47% | 88,6% | 5,79% |
| 4.00 | 6,36 GiB | 5,89 GiB | 0,0214 | +2,18% | 91,5% | 3,36% |
| 5.00 | 7,75 GiB | 7,15 GiB | 0,0062 | +0,48% | 96,6% | 1,13% |
| 6.00 | 9,02 GiB | 8,42 GiB | 0,0021 | +0,13% | 98,6% | 0,16% |
| base | 22,28 GiB | no disponible | 0 (referencia) | 0% | 100% (referencia) | no disponible |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo: cuantiza el checkpoint `google/gemma-4-12B-it` en la revision `43c9d014b231474fa7212dbb48a762566c2b255d`. La técnica es EXL3, el formato de cuantización de pesos de exllamav3, que permite servir el modelo con distintos niveles de BPW manteniendo la mayor parte de la calidad del original. En este caso también se cuantiza la tabla de embeddings de entrada, lo que exige exllamav3 1.6.4 o superior.

La innovación declarada por el autor está en el conjunto de calibración: documentos y salidas de herramientas dentro de conversaciones, código y diffs, y respuestas generadas por el propio modelo, en lugar de texto web genérico. La model card reporta además una comparación contra `turboderp/gemma-4-12B-it-exl3` (otro conjunto EXL3 del mismo modelo) usando ratios de KLD frente a una cuantización EXL3 sin calibrar como línea base. En esa comparativa, el conjunto de yeasah queda en 0,62 en 3.50 BPW, 0,94 en 4.00 BPW, 0,90 en 5.00 BPW y 0,90 en 6.00 BPW (por debajo de 1,00 es mejor), con el peor segmento de evaluación en 0,66 (documentos como resultados de herramientas) para 3.50 BPW.

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, atención, posibles capas MoE), el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno: heredadas del modelo base `google/gemma-4-12B-it`.
- Modalidad any-to-any: el pipeline declarado en Hugging Face es `any-to-any`, aunque la información disponible no detalla qué combinaciones de entrada y salida soporta exactamente.
- Uso en herramientas de agente: la calibración incluye sesiones de agente reales (Open-SWE-Traces) y bucles de uso de herramientas, lo que sugiere soporte de tool calling en el modelo base (no confirmado de forma explícita en la información).
- Multilingüe: la calibración incluye documentos multilingües, pero la lista de idiomas soportados no está disponible.
- Razonamiento y código: el conjunto de calibración incluye código y diffs, pero no se aportan benchmarks de capacidad para confirmar el nivel.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: la revisión de 3.00 BPW ocupa 4,50 GiB en vLLM, por lo que encaja en tarjetas de 8 GB o 12 GB dejando espacio para caché KV y contexto; útil para prototipos locales de un modelo de 12B.
- Servicio de chat con calidad casi original en una sola GPU: la revisión de 6.00 BPW ocupa 8,42 GiB en vLLM y conserva el 98,6% de los hechos evaluados con solo +0,13% de perplejidad, adecuada para atención al cliente o asistentes internos donde la fidelidad factual importa.
- Agentes que leen documentos y salidas de herramientas: la calibración está orientada a ese escenario (documentos como resultados de herramientas, bucles de tool use), lo que reduce el riesgo de degradación en pipelines de agentes que procesan informes, logs o respuestas de API.
- Asistencia de código en local: el conjunto de calibración incluye código y diffs; combinado con la revisión de 5.00 o 6.00 BPW, permite autocompletado y revisión de parches en estaciones de trabajo sin GPU de datacenter.
- Evaluación comparativa de cuantizaciones: las métricas de excess KLD, perplejidad y retención de hechos permiten elegir el BPW óptimo para un presupuesto de VRAM concreto antes de desplegar, algo poco habitual en repositorios de cuantización.
- Sustitución de GGUF en entornos vLLM: mediante `vllm-exl3-plugin` se puede servir este checkpoint en una infraestructura vLLM existente, manteniendo el rendimiento del servidor y reduciendo el peso de los pesos en VRAM frente a los 22,28 GiB del modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las de fidelidad de la cuantización:

| Metrica | 3.00 BPW | 3.50 BPW | 4.00 BPW | 5.00 BPW | 6.00 BPW |
|---|---|---|---|---|---|
| Excess KLD (menor es mejor) | 0,0928 | 0,0427 | 0,0214 | 0,0062 | 0,0021 |
| Delta de perplejidad | +9,99% | +4,47% | +2,18% | +0,48% | +0,13% |
| Hechos retenidos (2469 preguntas) | 81,1% | 88,6% | 91,5% | 96,6% | 98,6% |
| Errores confiados (>=70% en token erroneo) | 7,90% | 5,79% | 3,36% | 1,13% | 0,16% |

Comparativa frente a `turboderp/gemma-4-12B-it-exl3` (ratio de KLD, menor es mejor):

| BPW | Ratio compuesto | Comparado con | Diferencia de tamano | Peor segmento | Segmento |
|---|---|---|---|---|---|
| 3.50 | 0,62 | turboderp 3.50bpw_mul1 | -0,12 GiB (-2,2%) | 0,66 | documentos como resultados de herramientas |
| 4.00 | 0,94 | turboderp 4.00bpw_mul1 | +0 MiB (0,0%) | 0,95 | prompts reales de usuario (WildChat) |
| 5.00 | 0,90 | turboderp 5.00bpw_mul1 | +0 MiB (0,0%) | 0,93 | la propia voz del modelo |
| 6.00 | 0,90 | turboderp 6.00bpw_mul1 | +0 MiB (0,0%) | 0,90 | la propia voz del modelo |

## Requisitos de hardware

- VRAM estimada en vLLM: 4,50 GiB (3.00 BPW), 5,13 GiB (3.50), 5,89 GiB (4.00), 7,15 GiB (5.00) y 8,42 GiB (6.00). La tabla de embeddings de entrada reside en memoria de host según la configuración por defecto del plugin.
- Tamano en disco de los pesos: entre 4,98 GiB y 9,02 GiB según revisión.
- GPU recomendadas: no especificadas en la información. Por VRAM, las revisiones bajas caben en GPUs de consumo de 8-12 GB; las altas requieren 12-16 GB o más para dejar espacio a caché KV.
- Cabe en GPU de consumo: sí, al menos las revisiones de 3.00 a 6.00 BPW según la VRAM disponible; no se detallan modelos concretos de tarjeta.
- Opciones de despliegue: exllamav3 (versión 1.6.4 o superior, obligatoria por la cuantización de embeddings) y vLLM mediante `vllm-exl3-plugin`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yeasah/gemma-4-12B-it-exl3 | 12B | no disponible | EXL3 (3.00-6.00 BPW) | apache-2.0 | Calibrado en documentos, código y trazas de agente; métricas de KLD y retención de hechos publicadas |
| turboderp/gemma-4-12B-it-exl3 | 12B | no disponible | EXL3 | no disponible | Mismo modelo base; referencia directa en la comparativa de KLD del autor |
| unsloth/gemma-4-12b-it-GGUF | 12B | no disponible | GGUF | no disponible | Mismo modelo base en formato GGUF; puntuado con llama.cpp en los mismos evals según la model card |
| google/gemma-4-12B-it | 12B | no disponible | safetensors (22,28 GiB) | licencia Gemma 4 | Modelo base sin cuantizar, referencia de calidad |

## Limitaciones y advertencias

- La cuantización introduce degradación medible: incluso a 6.00 BPW se pierde un 1,4% de los hechos evaluados y hay un 0,16% de errores confiados; a 3.00 BPW la pérdida de hechos llega al 18,9% y los errores confiados al 7,90%.
- El test de retención de hechos son 2.469 preguntas cerradas de memoria factual corta; no mide capacidad general, razonamiento ni código.
- La calibración está sesgada hacia documentos, código y trazas de agente; el rendimiento en otros dominios (por ejemplo, texto creativo o conversación informal) no está medido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de las métricas del autor.
- La licencia declarada es apache-2.0, pero el modelo base remite a la licencia de Gemma 4; conviene revisar los términos de uso comercial de Gemma antes de desplegar en producción.
- Requiere exllamav3 1.6.4 o superior o el plugin `vllm-exl3-plugin`; no es compatible con llama.cpp, Ollama ni TGI de forma directa.
- No se dispone de información sobre sesgos, idiomas soportados ni límites de contexto del modelo base.
- El pipeline `any-to-any` sugiere capacidades multimodales, pero no se detalla qué modalidades ni con qué calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/gemma-4-12B-it-exl3
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Commit del modelo base usado: https://huggingface.co/google/gemma-4-12B-it/tree/43c9d014b231474fa7212dbb48a762566c2b255d
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin vLLM EXL3: https://github.com/yeasah/vllm-exl3-plugin
- Cuantización EXL3 alternativa: https://huggingface.co/turboderp/gemma-4-12B-it-exl3
- Cuantización GGUF del mismo modelo: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
