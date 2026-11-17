# zhuomingliu/MaLoW-Qwen3.5-0.8B

## Resumen

MaLoW (Memory as Weights) es un adaptador de inferencia publicado por zhuomingliu para el modelo base Qwen/Qwen3.5-0.8B, orientado a la comprensión de vídeo en streaming con memoria de largo plazo. El nombre hace referencia al artículo "Memory as Weights: Internalizing Long-Term History for Streaming Videos" (arXiv:2610.22070), cuya idea central es internalizar el historial de un vídeo directamente en los pesos del modelo en lugar de mantenerlo en un contexto externo o en un buffer de tokens.

El repositorio no contiene un modelo autónomo: aloja módulos de inferencia (115.515.448 parámetros en safetensors, 0,5 GB) que deben cargarse junto al modelo base Qwen3.5-0.8B mediante el runtime específico del proyecto. La tarea declarada en el pipeline es video-text-to-text, es decir, responder preguntas sobre secuencias de vídeo continuas.

Su relevancia radica en abordar el problema del streaming: en vídeos largos o indefinidos, las ventanas de contexto convencionales se agotan o degradan. MaLoW propone convertir el historial en estado del modelo, lo que permite mantener coherencia temporal sin reenviar fotogramas previos, con resultados reportados en los benchmarks OVO-Bench y StreamingBench. La licencia es Apache-2.0 para los pesos y metadatos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de memoria sobre transformer multimodal (base Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 115.515.448 (pesos del repositorio, no incluye el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (junto con metadatos JSON de configuración de inferencia) |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3.5-0.8B, un transformer multimodal de 0,8 mil millones de parámetros, y añade un mecanismo de "memoria como pesos": en lugar de acumular el historial de fotogramas en el contexto, el adaptador actualiza un estado interno que persiste a lo largo del stream. El repositorio distribuido contiene únicamente los módulos de inferencia resultantes, no el modelo base ni los pesos completos fusionados.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. La model card remite al artículo y al repositorio de código para los detalles metodológicos y el procedimiento de evaluación (OVO-Bench y StreamingBench, documentado en `docs/video_evaluation.md`).

## Capacidades

- Comprensión de vídeo en streaming con memoria de largo plazo: responde preguntas sobre eventos pasados de una secuencia continua.
- Procesamiento video-text-to-text: entrada conjunta de fotogramas y texto, salida textual.
- Razonamiento temporal sobre eventos en orden hacia atrás (backward), en tiempo real (real-time) y en orden hacia delante (forward), según los ejes evaluados en OVO-Bench.
- Capacidades proactivas y de razonamiento omni evaluadas en StreamingBench.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación de texto y multimodalidad), si bien no se detallan en la información disponible.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Vigilancia y análisis de vídeo continuo: el adaptador mantiene un estado de memoria que permite responder consultas sobre eventos ocurridos minutos u horas antes sin reenviar todo el material, lo que encaja con el eje backward de OVO-Bench.
- Asistentes sobre retransmisiones en directo: al internalizar el historial, el modelo puede responder en tiempo real a preguntas sobre lo sucedido en un stream activo, aprovechando el rendimiento reportado en el eje real-time (67,7 en OVO-Bench).
- Resumen y auditoría de reuniones o clases grabadas en flujo: el modelo puede procesar la secuencia de forma incremental y generar respuestas sobre intervenciones previas.
- Moderación de contenido en plataformas de vídeo: detección de eventos acumulativos (por ejemplo, repetición de conductas) que requieren memoria del historial y no solo del fotograma actual.
- Análisis deportivo en directo: seguimiento de jugadas y consultas sobre acciones anteriores durante un partido, con latencia compatible con streaming.
- Robots o agentes con percepción continua: integración del adaptador en un bucle de percepción que necesita recordar el estado del entorno a lo largo del tiempo.
- Investigación en memoria de modelos: reproducción de los experimentos del artículo sobre OVO-Bench y StreamingBench usando el runtime oficial.

## Benchmarks y rendimiento

Resultados de referencia reportados en la model card (porcentaje):

| Benchmark | Metrica | Valor |
|---|---|---|
| OVO-Bench | Backward | 54,7 |
| OVO-Bench | Real-time | 67,7 |
| OVO-Bench | Forward | 48,65 |
| OVO-Bench | Average | 57,0 |
| StreamingBench | Average | 63,02 |
| StreamingBench | Real-time | 76,68 |
| StreamingBench | Omni | 48,86 |
| StreamingBench | Proactive | 26 |
| StreamingBench | SQA | 48,4 |

No se han publicado en la información disponible comparaciones numéricas con otros modelos en estos benchmarks.

## Requisitos de hardware

- El repositorio pesa 0,5 GB y contiene 115,5 millones de parámetros; debe cargarse junto al modelo base Qwen3.5-0.8B, cuyo peso adicional no está cuantificado en la información disponible.
- VRAM estimada: no disponible. Como referencia, un transformer de 0,8B en FP16 ocupa aproximadamente 1,6 GB de pesos, a lo que se suman los módulos de memoria y el procesador de vídeo, pero no se ha publicado una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, es plausible su ejecución en GPU de consumo (RTX 3060/4060/4090), pero no está confirmado en la documentación.
- Opciones de despliegue: el modelo requiere el runtime específico de MaLoW (repositorio GitHub); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaLoW-Qwen3.5-0.8B | 115,5 M (adaptador) + base 0,8B | No disponible | Vídeo streaming con memoria | Apache-2.0 | Hugging Face + runtime propio |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | Multimodal general | Según modelo base | Hugging Face |
| Alternativas de memoria en vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con otros adaptadores de memoria para vídeo en streaming.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar por separado Qwen/Qwen3.5-0.8B y usar el runtime de MaLoW; no funciona con pipelines estándar de transformers sin adaptación.
- Los resultados reportados son de referencia del autor y no han sido verificados de forma independiente en la información disponible.
- El rendimiento en el eje Proactive de StreamingBench es bajo (26), lo que sugiere limitaciones en la anticipación de eventos.
- El eje Forward de OVO-Bench (48,65) es notablemente inferior al real-time (67,7), lo que indica asimetrías en el razonamiento temporal.
- Idiomas soportados no declarados; el comportamiento multilingüe no está documentado.
- Riesgo de alucinación y sesgos: no documentado en la model card.
- Licencia Apache-2.0 para los pesos y metadatos de inferencia; los modelos base y los activos de benchmark conservan sus términos upstream, que deben revisarse para uso comercial.
- El modelo tiene pocas descargas (41) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-0.8B
- Artículo: https://arxiv.org/abs/2610.22070
- Página del proyecto: https://dragonlzm.github.io/MaLoW/
- Repositorio de código: https://github.com/dragonlzm/MaLoW
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
