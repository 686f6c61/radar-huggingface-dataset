# tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF

## Resumen

VeriLoop E2 es un modelo de lenguaje de 27B parámetros (26.895.998.464 exactos) desarrollado por el Tsinghua SIGS Robot Lab, orientado a generación de código, razonamiento matemático y razonamiento científico. Esta ficha cubre la distribución GGUF oficial para llama.cpp, generada a partir del modelo base `tsinghua-sigs-robot-lab/VeriLoop-E2` y publicada bajo licencia Apache 2.0. El modelo se presenta como un modelo post-entrenado con 262K tokens de contexto nativo, lo que lo sitúa en la categoría de contexto largo para tareas de ingeniería de software y razonamiento formal.

La relevancia de esta distribución GGUF radica en que ofrece una escalera de cuantización completa (de BF16 a IQ1_M) con métricas de retención medidas frente a los logits BF16 de referencia: perplejidad, divergencia KL y tasa de coincidencia top-p. El autor documenta además el uso de imatrix y de un mecanismo MTP (multi-token prediction) con decodificación especulativa, lo que afecta directamente a la latencia en producción.

El modelo está etiquetado como coding-agent, software-engineering, mathematical-reasoning, scientific-reasoning y long-context, y soporta únicamente inglés y chino según la model card. La distribución incluye ocho variantes de cuantización con tamaños que van de 16.790 GiB (IQ1_M) a 50.113 GiB (BF16), lo que permite desplegarlo desde estaciones de trabajo con GPU de consumo hasta servidores con múltiples aceleradores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer post-entrenado; la model card no detalla la arquitectura interna) |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens nativos |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ2_S, IQ1_M (las variantes IQ son mixed-precision, no uniformes) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, cabezas, etc.), por lo que ese dato queda como no disponible. Sí se especifica que es un modelo post-entrenado (post-training) orientado a código, matemáticas y física, con 262K tokens de contexto nativo y entrenado para tareas de agente de programación y razonamiento científico. El repositorio incluye un informe técnico en OpenReview y un conjunto de evidencias de evaluación en Hugging Face, lo que sugiere que el post-entrenamiento se documenta con protocolos de evaluación reproducibles.

En el plano de la inferencia, la distribución GGUF incorpora dos elementos técnicos destacables. Primero, el uso de imatrix para las cuantizaciones de baja precisión, lo que permite que las variantes IQ1_M e IQ2_S mantengan métricas de retención razonables pese a su densidad efectiva de 5,36 bits por peso. Segundo, el soporte de MTP (multi-token prediction) con decodificación especulativa, validado explícitamente en el artefacto IQ1_M según la model card, lo que puede reducir la latencia de decodificación en llama.cpp. Las variantes IQ1_M e IQ2_S son artefactos de precisión mixta: en IQ1_M la política de tensores medida es 353 F32 + 1 IQ1_M + 2 IQ2_S + 64 Q4_K + 429 Q5_K + 2 Q6_K = 851 tensores, con 5,36 BPW efectivos.

## Capacidades

- Generación de texto conversacional y de formato largo en inglés y chino.
- Generación y razonamiento sobre código, con etiqueta explícita de coding-agent y software-engineering.
- Razonamiento matemático y científico (mathematical-reasoning, scientific-reasoning), con un artefacto publicado sobre la hipótesis de Riemann como demostración.
- Contexto largo nativo de 262K tokens, adecuado para repositorios completos, trazas de ejecución y documentos técnicos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la model card, aunque las etiquetas de agente de código y el pipeline conversacional lo hacen plausible; tratar como no verificado.
- Razonamiento multi-paso y flujos de agente: inferido de las etiquetas coding-agent y post-training; no se documentan detalles del protocolo de agente.
- Decodificación especulativa mediante MTP en las variantes GGUF compatibles con llama.cpp.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Agente de programación sobre repositorios completos: con 262K tokens de contexto, el modelo puede ingerir varios ficheros fuente, tests y trazas de error en una sola ventana y proponer parches coherentes con el resto del código.
- Revisión de código en pipelines de CI/CD: integrado vía llama.cpp o un servidor compatible con la API de OpenAI, el modelo puede analizar diffs y generar comentarios de revisión o descripciones de pull request en inglés o chino.
- Razonamiento matemático asistido: resolución de problemas de competición y demostraciones paso a paso, aprovechando el post-entrenamiento específico en matemáticas y el artefacto de la hipótesis de Riemann como referencia de capacidad.
- Asistencia en investigación científica: análisis de derivaciones físicas y matemáticas, comprobación de consistencia dimensional y generación de borradores de secciones técnicas en inglés.
- Despliegue en estación de trabajo con GPU de consumo: la variante Q4_K_M (18.301 GiB) o Q3_K_M (16.826 GiB) permite ejecutar el modelo en una GPU de 24 GB con contexto moderado, útil para prototipado local sin depender de la nube.
- Servicio de inferencia de bajo coste por token: la variante IQ1_M (16.790 GiB, 5,36 BPW efectivos) reduce el footprint un 66,50% frente a BF16 y habilita despliegues en hardware más modesto cuando la fidelidad estricta no es crítica.
- Documentación técnica bilingüe: generación y traducción de documentación entre inglés y chino dentro del mismo contexto, manteniendo terminología consistente a lo largo de documentos largos.
- Análisis de trazas y logs extensos: con 262K de contexto, el modelo puede correlacionar eventos distribuidos en ficheros de log de gran tamaño y resumir causas raíz.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de retención de cuantización frente a los logits BF16 de referencia, medidas con un protocolo congelado:

| Variante | Tamaño principal | Reducción vs BF16 | BPW efectivos | PPL vs BF16 | KLD | Same top-p |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 50.113 GiB | — | 16-bit | referencia | — | — |
| Q8_0 | 26.632 GiB | 46,86% | 8,50 | +0,0643% | 0,002176 | 98,815% |
| Q6_K | 20.566 GiB | 58,96% | 6,57 | paridad dentro de incertidumbre | 0,004409 | 98,204% |
| Q5_K_M | 18.965 GiB | 62,16% | 6,05 | +0,4450% | 0,006919 | 97,251% |
| Q4_K_M | 18.301 GiB | 63,48% | 5,84 | +0,4821% | 0,009700 | 96,786% |
| Q3_K_M | 16.826 GiB | 66,42% | 5,37 | +0,4090% | 0,014349 | 95,919% |
| IQ2_S | 16.799 GiB | 66,48% | 5,36 | +0,3457% | 0,014023 | 95,516% |
| IQ1_M | 16.790 GiB | 66,50% | 5,36 | +0,3191% | 0,014357 | 95,870% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto KV. Con 262K de contexto el KV cache puede ser muy grande; para contextos prácticos de 8K-32K se recomienda reservar entre 2 y 8 GB adicionales según la variante.
- BF16 (50.113 GiB): requiere 2× A100 80GB, 2× H100 80GB o 4× RTX 4090/3090 de 24 GB.
- Q8_0 (26.632 GiB): una A100 40GB, una H100 80GB o 2× RTX 4090.
- Q6_K (20.566 GiB) y Q5_K_M (18.965 GiB): caben en una GPU de 24 GB (RTX 4090, RTX 3090, L4 24GB) con contexto moderado; para contexto largo conviene repartir capas en CPU o usar dos GPU.
- Q4_K_M (18.301 GiB), Q3_K_M (16.826 GiB), IQ2_S (16.799 GiB) e IQ1_M (16.790 GiB): aptos para GPU de 24 GB con margen para contexto; IQ1_M e IQ2_S son las opciones de mínimo footprint.
- Despliegue: llama.cpp es el runtime oficial de esta distribución. También son viables servidores compatibles con llama.cpp (llama-server) y, para el modelo base en safetensors, vLLM o TGI, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles. La model card menciona validación de MTP y decodificación especulativa en IQ1_M, lo que sugiere mejoras de latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de capacidad del modelo, por lo que la comparación se limita a características estructurales. Los modelos comparables de la misma categoría (≈27B, contexto largo, orientados a código) serían Qwen2.5-Coder-32B, DeepSeek-Coder-V2-Lite y Gemma-2-27B; los datos de estos modelos no forman parte de la información proporcionada, por lo que sus cifras se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato GGUF |
|---|---:|---|---|---|---|
| VeriLoop E2 | 26,9B | 262K | en, zh | Apache 2.0 | sí (oficial) |
| Qwen2.5-Coder-32B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| DeepSeek-Coder-V2-Lite | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Gemma-2-27B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino según la model card; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; un modelo entrenado principalmente con datos en inglés y chino puede reflejar sesgos culturales y lingüísticos de esas fuentes.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de factualidad; en tareas de código y matemáticas conviene validar las salidas con tests o comprobadores formales.
- Contexto: aunque el contexto nativo es de 262K, el coste de KV cache crece linealmente y puede degradar el throughput; no se documenta la degradación de calidad a longitudes extremas.
- Cuantización: las variantes IQ1_M e IQ2_S son de precisión mixta y su retención se mide con PPL/KLD/top-p, no con benchmarks de capacidad; para tareas sensibles a la fidelidad se recomienda Q6_K o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el informe técnico y las condiciones del modelo base por si hubiera cláusulas adicionales no reflejadas en la model card.
- Producción: no se publican cifras de latencia ni throughput; el soporte de tool calling no está confirmado explícitamente y debe validarse antes de integrarlo en agentes.
- El repositorio ocupa 210 GB, por lo que la descarga completa de todas las variantes requiere planificación de almacenamiento.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF
- Modelo base: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Informe técnico (OpenReview): https://openreview.net/forum?id=P6FIQILHwX&noteId=P6FIQILHwX
- Evidencias de evaluación: https://huggingface.co/datasets/tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence
- Artefacto de la hipótesis de Riemann: https://github.com/brucewang123456789/GeniusTrail/tree/VeriLoop-E2/riemann-hypothesis
- ModelScope Global: https://modelscope.ai/models/tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF
- ModelScope China: https://modelscope.cn/models/tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
