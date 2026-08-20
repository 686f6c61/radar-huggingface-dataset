# Sunbird-experimental/asr-whisper-51-african-languages-grpo

## Resumen

El modelo `Sunbird-experimental/asr-whisper-51-african-languages-grpo` es una adaptación de Whisper Large v3, desarrollada por Sunbird AI, que amplía el reconocimiento automático del habla (ASR) a 51 lenguas africanas. Incluye idiomas como el swahili, el afrikáans, el tswana, el kinyarwanda, el pidgin nigeriano, el luganda, el acholi, el lugbara, el ateso, el runyankole, el rutooro, el lumasaba, el lusoga y el rukiga, además de inglés y francés con acentos africanos. El modelo se ha ajustado mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, lo que lo convierte en una propuesta novedosa dentro del ecosistema de ASR multilingüe.

Con 1.543.490.560 parámetros, el modelo sigue la arquitectura encoder-decoder de Whisper Large v3, con una ventana de contexto de 30 segundos de audio. Su relevancia actual radica en cubrir un vacío importante en el reconocimiento de voz para lenguas africanas de bajos recursos, que históricamente han estado infrarrepresentadas en los sistemas de ASR comerciales. El repositorio incluye pesos en formato safetensors y es compatible con la biblioteca transformers de Hugging Face, lo que facilita su integración en pipelines de procesamiento de audio.

La licencia y los idiomas soportados no están especificados en la model card, aunque la documentación externa indica que cubre 51 lenguas africanas. El modelo se publicó en agosto de 2026 y acumula 59 descargas en el Hub, lo que indica un interés inicial limitado pero en crecimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper Large v3 (encoder-decoder transformer) |
| Parámetros totales | 1.543.490.560 |
| Parámetros activos | No aplicable (modelo denso) |
| Longitud de contexto | 30 segundos de audio (fijos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | 51 lenguas africanas (swahili, afrikáans, tswana, kinyarwanda, pidgin nigeriano, luganda, acholi, lugbara, ateso, runyankole, rutooro, lumasaba, lusoga, rukiga, entre otras) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper Large v3, un transformer encoder-decoder diseñado para ASR con una ventana de audio fija de 30 segundos. La arquitectura consta de 32 capas de encoder y 32 de decoder, con 20 cabezas de atención y una dimensión de modelo de 1280. Se entrenó sobre un corpus de 5 millones de horas de audio débilmente supervisado, aunque la adaptación específica para las 51 lenguas africanas se realizó mediante un proceso de fine-tuning con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que optimiza directamente la política de decodificación.

El uso de GRPO es una innovación destacable en el contexto de ASR, ya que permite ajustar el modelo hacia métricas de calidad de transcripción (como WER) de forma explícita, en lugar de solo minimizar la pérdida de entropía cruzada. Este enfoque es particularmente útil para lenguas de bajos recursos, donde los datos de entrenamiento son escasos y el modelo debe generalizar bien a partir de pocos ejemplos. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de preprocesado de audio.

## Capacidades

- Reconocimiento automático de voz para 51 lenguas africanas, incluyendo lenguas bantúes, nilóticas y criollas.
- Transcripción de audio en inglés y francés con acentos africanos.
- Generación de transcripciones con timestamps a nivel de segmento, gracias a la arquitectura Whisper.
- Soporte para traducción de voz a texto en inglés y francés, aunque no se especifica la calidad en lenguas africanas.
- Decodificación autorregresiva con soporte para beam search y decodificación greedy.
- Integración directa con el pipeline de automatic-speech-recognition de transformers.
- Compatible con endpoints de inferencia (endpoints_compatible) para despliegue en producción.

## Casos de uso

- Atención al cliente multilingüe: una empresa de telecomunicaciones en Kenia puede desplegar el modelo para transcribir llamadas de soporte en swahili, luganda o kinyarwanda, y luego usar un sistema de clasificación para derivar los tickets a los agentes correctos. Su ventana de 30 segundos permite capturar interacciones cortas, y su soporte para 51 lenguas cubre la diversidad de la región de África Oriental.
- Generación de subtítulos automáticos para vídeo: una plataforma de streaming africana puede transcribir contenido audiovisual en lenguas locales, como acholi o rutooro, para generar subtítulos. El modelo se puede integrar en un pipeline de procesamiento por lotes con ffmpeg y transformers.
- Documentación médica: en clínicas de Uganda, el modelo puede transcribir consultas médicas en luganda o rukiga, ayudando a generar registros de pacientes estructurados sin intervención manual.
- Análisis de sentimiento en redes sociales: un equipo de análisis político puede transcribir audios de WhatsApp o Telegram en lenguas como tswana o afrikaans, y luego aplicar modelos de análisis de sentimiento para entender la opinión pública.
- Educación y aprendizaje de idiomas: una aplicación de aprendizaje de idiomas puede usar el modelo para dar retroalimentación de pronunciación en lenguas como swahili o kinyarwanda, comparando la transcripción con la referencia esperada.
- Asistencia legal y judicial: en un juzgado de Ruanda, el modelo puede transcribir audiencias en kinyarwanda, generando actas oficiales con timestamps, lo que reduce la carga administrativa de los secretarios judiciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han proporcionado métricas como WER (Word Error Rate), CER (Character Error Rate) ni comparativas con otros modelos de ASR para las 51 lenguas africanas. Se recomienda evaluar el modelo con un dataset propio de validación en el idioma objetivo antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 1,54B parámetros en fp32, se necesitan aproximadamente 6,2 GB de VRAM solo para los pesos. En fp16, se reduce a 3,1 GB. Con cuantización a int8, se puede bajar a 1,6 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente para inferencia en fp16 con un batch pequeño. Para producción con mayor throughput, se recomienda una A100 o H100.
- Consumer GPU: sí, cabe en GPUs de consumo como la RTX 3060 12 GB o RTX 4060 Ti 16 GB, siempre que se use cuantización o fp16.
- Opciones de despliegue: vLLM (compatible con whisper), llama.cpp (aunque el soporte para whisper es limitado), Hugging Face Inference Endpoints, y el pipeline de transformers.
- Latencia estimada: para un audio de 30 segundos, la latencia de inferencia en una RTX 4090 en fp16 es de aproximadamente 2-4 segundos. El throughput depende del batch y de la optimización del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sunbird-experimental/asr-whisper-51-african-languages-grpo | 1.543M | 30 s | 51 lenguas africanas | No disponible | Hugging Face |
| OpenAI Whisper Large v3 | 1.550M | 30 s | 99 idiomas | MIT | Hugging Face |
| Whisper Large v3-turbo | 809M | 30 s | 99 idiomas | MIT | Hugging Face |
| MWhisper (multilingüe) | 1.550M | 30 s | 100+ idiomas | MIT | Hugging Face |

La principal ventaja de este modelo frente a Whisper Large v3 es su adaptación específica a las lenguas africanas, que probablemente mejora el WER en estos idiomas en comparación con el modelo original. Sin embargo, no hay datos públicos que confirmen esta mejora. El modelo no es comparable con modelos de propósito general de otros tamaños, ya que su dominio es específico de ASR.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- No se han publicado datos de entrenamiento, ni se especifica el tamaño del dataset ni su composición, lo que dificulta evaluar el riesgo de sesgos.
- La ventana de contexto es fija en 30 segundos de audio, lo que limita el uso para transcripción de audio largo sin segmentación previa.
- El modelo puede tener un rendimiento desigual entre las 51 lenguas: las lenguas con más representación en el entrenamiento probablemente tengan mejor WER que las de bajos recursos.
- Riesgo de alucinación en audio con ruido o habla superpuesta, característico de los modelos Whisper.
- No se especifica si el modelo ha sido evaluado en entornos de campo (microfonía variada, acentos regionales, etc.), lo que puede afectar la robustez en producción.
- El modelo está entrenado con GRPO, una técnica de aprendizaje por refuerzo que puede introducir sesgos de optimización que no se han documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Sunbird-experimental/asr-whisper-51-african-languages-grpo
- Documentación SALT (Sunbird AI): https://salt.sunbird.ai/models/asr-whisper-51-african-languages/
- FriendliAI (despliegue en la nube): https://friendli.ai/models/Sunbird-experimental/asr-whisper-51-african-languages-grpo
