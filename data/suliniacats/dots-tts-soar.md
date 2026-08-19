# suliniacats/dots.tts-soar

## Resumen

dots.tts-soar es un modelo de síntesis de voz (text-to-speech) de 2 000 millones de parámetros desarrollado por el equipo de dots-studio (studio-dots-ai). Se trata de una variante post-entrenada del modelo base dots.tts-base, refinada mediante una etapa de alineación autocorrectiva (Self-corrective Alignment, SCA) que mejora la fidelidad del texto y la similitud del hablante sin cambiar el coste de inferencia. El modelo emplea una arquitectura totalmente continua y autorregresiva: un encoder semántico, un LLM (inicializado desde Qwen2.5-1.5B-Base) y una cabeza acústica de flow-matching sobre un AudioVAE a 48 kHz, sin tokens de códec discretos.

Esta versión está recomendada como punto de partida para clonación de voz zero-shot en producción, ya que logra la mayor similitud de hablante y la menor tasa de error de palabra (WER) entre las tres variantes publicadas (base, soar y mf). El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors, y está diseñado para ejecutarse mediante la librería dots_tts, tanto desde CLI como desde Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone autorregresivo continuo: encoder semántico + LLM (Qwen2.5-1.5B-Base) + cabeza de flow-matching (DiT) + AudioVAE a 48 kHz |
| Parametros totales | 2 198 091 778 (~2,2 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (usado en el ejemplo de inferencia); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés y chino (según benchmarks Seed-TTS-Eval); no se especifican otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

dots.tts-soar sigue el diseño de dots.tts-base: un AudioVAE congelado codifica la forma de onda mono a 48 kHz en un latente continuo y lo decodifica mediante un decodificador causal estilo BigVGAN. El backbone autorregresivo predice ese latente por parches. El encoder semántico re-codifica cada parche VAE generado en una representación compacta para el LLM, que consume texto BPE directamente (sin fonemas) y emite un estado oculto por paso de audio. Una cabeza de flow-matching (un DiT) condiciona sobre el estado del LLM y el prefijo AR para denoising del siguiente parche VAE, con un x-vector de hablante CAM++ congelado como entrada lateral.

El entrenamiento del backbone base utilizó aproximadamente 1,5 millones de horas de audio. Sobre ese pretrain, dots.tts-soar aplica Self-corrective Alignment, una etapa de post-entrenamiento sin recompensas, nativa de flow-matching, que refuerza la adherencia al texto y al timbre del hablante sin modificar el coste de inferencia ni el esquema de muestreo. Esto lo convierte en la variante con mayor fidelidad zero-shot y similitud de hablante de la familia.

## Capacidades

- Síntesis de voz a partir de texto en inglés y chino, con control fino sobre la prosodia mediante parámetros de sampling (num_steps y guidance_scale).
- Clonación de voz zero-shot: dado un audio de referencia y su transcripción exacta, el modelo reproduce la voz del hablante sin entrenamiento adicional.
- Generación de voz continua a 48 kHz sin tokens discretos, lo que reduce artefactos típicos de los codecs.
- Soporte de continuación de voz (continuation voice cloning) usando un prompt de audio y su transcripción.
- Ajuste fino (fine-tuning) sobre el backbone, tanto desde dots.tts-base como desde dots.tts-soar, para adaptar el modelo a voces o dominios específicos.
- Control de la calidad frente a la latencia mediante el número de pasos de muestreo (10–32) y el guidance scale (recomendado 1,2).
- No se documentan capacidades de tool calling, agentes ni procesamiento multimodal más allá del audio.

## Casos de uso

- Clonación de voz para audiobooks y podcasts: el modelo puede replicar la voz de un locutor con solo unos segundos de referencia, permitiendo generar narraciones largas con coherencia tímbrica y baja tasa de errores de pronunciación (WER inferior al 1,4 % en inglés según benchmarks).
- Doblaje automático de vídeo: al aceptar texto y audio de referencia, se puede reemplazar diálogos en un idioma manteniendo la voz original, útil para localización de contenido.
- Asistentes de voz personalizados: integración en sistemas de atención al cliente o asistentes virtuales para generar respuestas habladas con una voz corporativa consistente, aprovechando la baja latencia de la variante soar (aunque la variante mf es más rápida si se necesita aún menor latencia).
- Generación de contenido educativo: creación de lecciones en audio o explicaciones narradas con una voz natural, sin necesidad de estudio de grabación.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con calidad cercana a la humana y soporte de múltiples hablantes.
- Investigación en síntesis de voz: el modelo sirve como base para experimentos de fine-tuning en dominios específicos (voces de personajes, acentos regionales) gracias a su licencia Apache 2.0 y su arquitectura abierta.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la evaluación Seed-TTS-Eval, que mide la tasa de error de palabra (WER, menor es mejor) y la similitud del hablante (SIM, mayor es mejor) en tres conjuntos de prueba (inglés, chino y chino difícil). La tabla original de la model card se reproduce a continuación, aunque los valores de dots.tts-soar aparecen incompletos en la fuente (falta el SIM para test-en y el promedio global).

| Modelo | Params | test-en WER↓ / SIM↑ | test-zh WER↓ / SIM↑ | test-zh-hard WER↓ / SIM↑ | Avg WER↓ / SIM↑ |
|---|---:|---:|---:|---:|---:|
| Seed-TTS | — | 2,25 / 76,2 | 1,12 / 79,6 | 7,59 / 77,6 | 3,65 / 77,8 |
| Qwen3-TTS | 1,7B | 1,23 / 71,7 | 1,22 / 77,0 | 6,76 / 74,8 | 3,07 / 74,5 |
| VoxCPM 2 | 2B | 1,84 / 75,3 | 0,97 / 79,5 | 8,13 / 75,3 | 3,65 / 76,7 |
| dots.tts-base | 2B | 1,34 / 76,8 | 0,96 / 80,5 | 6,46 / 79,2 | 2,92 / 78,8 |
| dots.tts-soar | 2B | 1,30 / no disponible | no disponible | no disponible | no disponible |

Nota: los datos de dots.tts-soar están parcialmente disponibles en la documentación; la model card indica que alcanza el estado del arte en SIM promedio (79,2), pero no se muestran los valores completos de WER/SIM para todos los conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos del modelo ocupan aproximadamente 4,4 GB (2,2 B parámetros × 2 bytes). Sumando activaciones, el AudioVAE y el overhead del runtime, se recomienda al menos 8 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas de consumo como RTX 3090, RTX 4070 o superiores son suficientes; para despliegues de alta concurrencia se sugiere A100 o H100.
- En CPU: es posible ejecutar el modelo con suficiente RAM (≥16 GB), aunque la latencia será significativamente mayor.
- Opciones de despliegue: la librería dots_tts proporciona una API Python (DotsTtsRuntime) y una CLI. También hay un espacio de Hugging Face (Playground) y una demo en línea. No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no se publican cifras concretas, pero la variante soar está pensada para calidad máxima; la variante dots.tts-mf (con destilación MeanFlow) reduce el número de pasos a 4 para baja latencia si se requiere.

## Comparativa con modelos similares

La comparativa se basa en los datos de la evaluación Seed-TTS-Eval, ya que no se dispone de información detallada sobre otras alternativas (licencias, contexto, etc.).

| Modelo | Params | Contexto | Licencia | Avg WER↓ / SIM↑ (Seed-TTS-Eval) |
|---|---:|---|---:|---:|
| dots.tts-soar | 2B | no disponible | Apache 2.0 | no disponible (SIM promedio 79,2 según la model card) |
| dots.tts-base | 2B | no disponible | Apache 2.0 | 2,92 / 78,8 |
| Qwen3-TTS | 1,7B | no disponible | no disponible | 3,07 / 74,5 |
| VoxCPM 2 | 2B | no disponible | no disponible | 3,65 / 76,7 |
| Seed-TTS | — | no disponible | no disponible | 3,65 / 77,8 |

dots.tts-soar supera a todos los modelos comparados en similitud de hablante promedio (79,2), aunque los datos de WER promedio no están completos. Frente a dots.tts-base, la versión soar mejora la fidelidad del texto y el timbre sin coste adicional de inferencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o comportamientos discriminatorios; como todo sistema TTS, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación en la pronunciación de nombres propios o términos poco frecuentes, especialmente en idiomas no cubiertos por el entrenamiento (solo se confirma inglés y chino).
- La calidad de la clonación de voz depende críticamente de la calidad del audio de referencia y de que la transcripción proporcionada sea exacta; transcripciones erróneas degradan la similitud.
- La longitud de contexto no está documentada; para textos muy largos puede ser necesario segmentar la entrada.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar los derechos sobre las voces clonadas (consentimiento del hablante, marcas, etc.).
- No se documentan cuantizaciones oficiales (GGUF, int8, etc.); el despliegue en entornos con VRAM limitada puede requerir optimizaciones no soportadas oficialmente.

## Enlaces

- Repositorio Hugging Face del modelo (suliniacats/dots.tts-soar): https://huggingface.co/suliniacats/dots.tts-soar
- Repositorio Hugging Face oficial (dots-studio/dots.tts-soar): https://huggingface.co/dots-studio/dots.tts-soar
- Repositorio GitHub del proyecto: https://github.com/studio-dots-ai/dots.tts
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/dots-studio/dots.tts
- Página de demo: https://studio-dots-ai.github.io/dots.tts-demo/
- Informe técnico en arXiv: https://arxiv.org/html/2606.07080v2
