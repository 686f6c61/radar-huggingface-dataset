# usuallynot/broend-edda-v0.2-run2

## Resumen

broend-edda-v0.2-run2 es un ajuste fino experimental del modelo de reconocimiento automático del habla (ASR) danés edda-v0.2, desarrollado por el usuario usuallynot y publicado en Hugging Face. El modelo parte de la arquitectura Whisper (transformador encoder-decoder) con 808.878.080 parámetros y está especializado en dos escenarios concretos: grabaciones de reuniones con solapamiento de voces y detección de silencio, es decir, no transcribir nada cuando no hay habla cerca del micrófono.

El problema que aborda es una limitación conocida de edda-v0.2: el modelo base siempre genera texto, incluso ante ruido de fondo o conversaciones lejanas, lo que produce alucinaciones en pasajes sin habla. Este ajuste busca corregir ese comportamiento y mejorar la robustez frente a voces superpuestas, a costa de un ligero aumento del error en conversaciones limpias.

Es relevante ahora porque los sistemas ASR desplegados en entornos reales (reuniones, atención al cliente, subtitulado) necesitan distinguir con fiabilidad entre habla y silencio, y porque el modelo demuestra que un ajuste fino de bajo coste (6 horas en una única GPU de consumo, Apple M5 de 24 GB) puede modificar comportamientos específicos de un modelo base grande. El autor lo marca explícitamente como experimental y recomienda edda-v0.2 para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformador encoder-decoder) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (da) |
| Licencia | apache-2.0-with-coral-use-restrictions |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en edda-v0.2, un Whisper de 808 millones de parámetros adaptado al danés, y conserva la estructura encoder-decoder propia de la familia. Durante el ajuste fino se congelaron las 24 capas inferiores del encoder y se entrenaron las 8 capas superiores del encoder y el decoder completo. El entrenamiento se realizó durante 6 horas en una única Apple M5 de 24 GB, con 1.445 pasos de 16 ejemplos cada uno, tasa de aprendizaje 1e-5 y optimizador AdamW.

Los datos combinan CoRal-v3 conversacional (35 h, 45%), CoRal-v3 de lectura en voz alta (32 h, 25%), NST Danish (30 h) y FLEURS danés de entrenamiento (7 h, 30%). Cada ejemplo contiene hasta 28 segundos de enunciados consecutivos; la mitad incorporan otras voces mezcladas por debajo (3-7 voces entre 2 y 18 dB por debajo del hablante, o una voz entre 5 y 18 dB por debajo), además de ruido y reverberación aleatorios. Un 4% de los ejemplos contienen únicamente charla lejana (-68 a -38 dBFS) o ruido, con objetivo vacío. La innovación principal es la modificación de `generation_config.json`: `begin_suppress_tokens` pasa de `[220, 50257]` a `[220]`, permitiendo que `<|endoftext|>` sea el primer token generado y, por tanto, que el modelo pueda responder con una salida vacía.

## Capacidades

- Reconocimiento automático del habla en danés sobre audio de reuniones y conversaciones.
- Transcripción robusta con solapamiento de voces: mantiene al hablante principal cuando otras personas hablan por debajo.
- Detección de silencio: genera salida vacía cuando no hay habla cerca del micrófono, reduciendo alucinaciones en pasajes sin voz.
- Manejo de ruido y reverberación añadidos durante el entrenamiento.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión ni audio más allá de la transcripción ASR.
- Capacidad multilingüe limitada al danés.
- No se documenta modo de razonamiento explícito (thinking mode).

## Casos de uso

- Transcripción de reuniones con múltiples participantes: el modelo sigue al hablante principal aunque haya conversaciones cruzadas de fondo, gracias al entrenamiento con voces mezcladas entre 2 y 18 dB por debajo.
- Generación de actas y subtítulos en entornos de oficina: la capacidad de devolver salida vacía en silencios evita insertar texto inventado en pausas y pasajes sin habla.
- Preprocesado de audio para pipelines de diarización: al no alucinar en tramos sin voz, reduce falsos positivos que luego contaminan la segmentación por hablante.
- Sistemas de notas de voz y grabadoras: útil para filtrar charla lejana o ruido ambiental (-68 a -38 dBFS) y transcribir solo lo próximo al micrófono.
- Investigación en ASR robusto: sirve como referencia para estudiar el equilibrio entre tasa de error y detección de silencio, con resultados comparables frente a edda-v0.2.
- Prototipado de subtitulado en danés para vídeo corporativo o educativo, siempre que se acepte el incremento de error en conversaciones limpias (16,62 frente a 14,50 en CoRal conversation).

## Benchmarks y rendimiento

Resultados con decodificación greedy. CoRal se evalúa sin palabras de relleno (øh, hm…) en ambos lados. Los conjuntos "chatter" mezclan seis hablantes de test de FLEURS bajo el hablante principal.

| Metrica | edda-v0.2 | broend-edda-v0.2-run2 |
|---|---|---|
| CoRal conversation (400), WER | 14,50 | 16,62 |
| CoRal overlap (200), WER | 17,80 | 18,64 |
| FLEURS clean, WER | 7,80 | 8,14 |
| Chatter 10 dB, WER | 14,99 | 14,09 |
| Chatter 5 dB, WER | 43,57 | 30,37 |
| Sin habla: texto inventado | 29/29 | 0-1/29 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,2 GB solo para pesos; en fp16/bf16 alrededor de 1,6 GB, más memoria para activaciones y audio de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; A100, H100 o RTX 4090 ofrecen margen amplio para lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; el autor entrenó en una Apple M5 de 24 GB.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER CoRal conversation | WER Chatter 5 dB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| broend-edda-v0.2-run2 | 808.878.080 | no disponible | 16,62 | 30,37 | apache-2.0-with-coral-use-restrictions | Hugging Face |
| danish-foundation-models/edda-v0.2 | no disponible | no disponible | 14,50 | 43,57 | Apache 2.0 | Hugging Face |
| Whisper large-v3 (OpenAI) | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face / OpenAI |

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: en conversaciones reales comete más errores que edda-v0.2 (16,62 frente a 14,50 de WER en CoRal conversation).
- Solo soporta danés; no es válido para otros idiomas sin un ajuste adicional.
- La licencia apache-2.0-with-coral-use-restrictions hereda las restricciones de CoRal-v3 (OpenRAIL-D), que prohíben el uso para síntesis de voz e identificación biométrica.
- Riesgo de alucinación reducido pero no eliminado: se documenta 0-1 casos de texto inventado sobre 29 en pasajes sin habla, frente a 29/29 del modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se documentan sesgos específicos, latencia ni requisitos de cuantización.
- Para uso en producción general se recomienda edda-v0.2 según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usuallynot/broend-edda-v0.2-run2
- Modelo base edda-v0.2: https://huggingface.co/danish-foundation-models/edda-v0.2
- Dataset CoRal-v3: https://huggingface.co/datasets/CoRal-project/coral-v3
- Licencia de CoRal: https://huggingface.co/datasets/alexandrainst/coral/blob/main/LICENSE
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
