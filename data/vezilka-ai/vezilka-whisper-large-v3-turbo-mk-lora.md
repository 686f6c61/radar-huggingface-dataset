# vezilka-ai/vezilka-whisper-large-v3-turbo-mk-lora

## Resumen

Vezilka Whisper Large V3 Turbo LoRA (Macedonian) es un adaptador LoRA de tipo PEFT sobre el modelo de reconocimiento automático del habla openai/whisper-large-v3-turbo, desarrollado por vezilka-ai en el marco del proyecto VEZILKA, financiado por el Ministerio de Educación y Ciencia de la República de Macedonia del Norte, la Comisión Europea/EuroHPC JU y la Facultad de Ingeniería Informática (FINKI) de Skopje. Su propósito es adaptar el modelo base de OpenAI al macedonio, un idioma con recursos limitados y escasa cobertura en los sistemas ASR comerciales.

El adaptador emplea un rango LoRA de 64, alpha de 128, dropout de 0,05 y se aplica sobre las proyecciones q/k/v/o del transformer del encoder-decodificador de Whisper. El resultado declarado por el autor es el mejor sistema publicado en el Vezilka FINKI Lecture ASR Benchmark, con un WER del 4,51 % y un CER del 1,52 % en la vista completa del benchmark, y un 4,15 % / 1,36 % en la vista equilibrada por hablante.

La relevancia del modelo es doble: por un lado, demuestra que un ajuste fino eficiente en parámetros (apenas 0,1 GB de pesos de adaptador) puede llevar un ASR multilingüe de propósito general a un rendimiento competitivo en un idioma de bajos recursos; por otro, el adaptador se distribuye con licencia Apache-2.0 sobre una base MIT, lo que facilita su uso comercial y su integración en pipelines de transcripción existentes sin necesidad de reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Whisper large-v3-turbo (transformer encoder-decoder) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,1 GB; el modelo base whisper-large-v3-turbo tiene 809 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones del adaptador; aplican las del modelo base: float32, float16, int8) |
| Idiomas soportados | Macedonio (mk) |
| Licencia | Apache-2.0 (modelo base MIT) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Whisper large-v3-turbo, la variante destilada de OpenAI que reduce el número de capas del decodificador respecto a large-v3 manteniendo el encoder. Sobre esa base se aplica un LoRA con rango 64, alpha 128 y dropout 0,05 en las proyecciones de query, key, value y output, con schedule coseno y learning rate pico de 5e-4. El entrenamiento parte de un adaptador anterior del mismo proyecto y continúa durante 5 épocas sobre donaciones aceptadas del proyecto Doniraj (submissions-20260831), el dataset interno prvatv_dataset y un subconjunto de replay de 15 horas de videa_so_transkript_od_yt.

La evaluación se realizó sobre cinco clases del FINKI no utilizadas en entrenamiento, con referencias revisadas manualmente, en CUDA, float32, batch 1 y beam 4, con normalización NFC, minúsculas y eliminación de puntuación. El autor declara explícitamente que ni el audio ni las transcripciones del benchmark se emplearon para entrenar, aunque el adaptador sí generó los borradores de transcripción del benchmark una vez segmentado el audio de evaluación. No se documentan técnicas de RLHF ni de decodificación especulativa.

## Capacidades

- Reconocimiento automático del habla en macedonio con salida de texto plano.
- Transcripción de audio a 16 kHz con ventana de 30 segundos por segmento, propia de la arquitectura Whisper.
- Soporte de decodificación con beam search (el autor recomienda `num_beams=4`).
- Control explícito de idioma y tarea mediante los parámetros `language="macedonian"` y `task="transcribe"`.
- Integración con el ecosistema Hugging Face Transformers y PEFT, incluyendo la fusión del adaptador con `merge_and_unload()`.
- No se documentan capacidades de traducción, diarización de hablantes, detección de idioma, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de clases universitarias: el adaptador está entrenado y evaluado sobre clases de informática de FINKI, por lo que es adecuado para generar actas y apuntes de asignaturas técnicas en macedonio con un WER inferior al 5 %.
- Subtitulado de vídeo educativo: la ventana de 30 s de Whisper y el bajo CER (1,52 %) permiten generar subtítulos sincronizados para plataformas de formación en línea en macedonio.
- Digitalización de archivos orales: el adaptador puede transcribir entrevistas, ponencias y material de archivo en macedonio con revisión humana ligera, dado el bajo índice de sustituciones (1.712 sobre 1.406 clips en la vista completa).
- Atención al ciudadano en instituciones públicas: integrado en un pipeline de Transformers con `merge_and_unload()`, permite transcribir llamadas y comparecencias en macedonio para generar registros textuales.
- Investigación lingüística y corpus: el modelo facilita la creación de corpus orales anotados en macedonio, un idioma con recursos limitados, para estudios fonéticos y morfológicos.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos educativos y administrativos de Macedonia del Norte.
- Integración en pipelines ASR existentes: al ser un adaptador PEFT de 0,1 GB, se puede cargar sobre una instancia ya desplegada de whisper-large-v3-turbo sin duplicar el modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el Vezilka FINKI Lecture ASR Benchmark (configuración `finki-benchmark` del dataset `vezilka-ai/macedonian-speech`, split test), WER/CER normalizados en porcentaje, CUDA, float32, batch 1, beam 4:

| Vista | Clips | WER (%) | CER (%) | S | I | D |
|---|---:|---:|---:|---:|---:|---:|
| full | 1.406 | 4,51 | 1,52 | 1.712 | 298 | 425 |
| speaker_balanced | 892 | 4,15 | 1,36 | 1.012 | 169 | 239 |

No se han publicado en la información disponible resultados comparativos con otros modelos en este benchmark ni métricas en conjuntos estándar como Common Voice o FLEURS para macedonio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste despreciable; el modelo base whisper-large-v3-turbo (809 M de parámetros) requiere aproximadamente 3,2 GB en float32 y unos 1,6 GB en float16 para los pesos, más memoria para activaciones y beam search.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 para inferencia de baja latencia en un solo equipo.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070) usando float16; con cuantización int8 puede ajustarse en 4-6 GB.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM (soporte ASR limitado), faster-whisper (requiere convertir el adaptador fusionado a CTranslate2), WhisperX para alineación temporal. Ollama y llama.cpp no soportan arquitecturas encoder-decoder de Whisper de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo documenta la configuración de evaluación (batch 1, beam 4) sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Rendimiento en macedonio |
|---|---|---|---|---|---|
| vezilka-whisper-large-v3-turbo-mk-lora | 809 M (base) + adaptador LoRA | 30 s por segmento | Macedonio | Apache-2.0 | WER 4,51 % (benchmark FINKI) |
| openai/whisper-large-v3-turbo | 809 M | 30 s por segmento | 99 idiomas (macedonio incluido) | MIT | No disponible en el benchmark FINKI |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | 99 idiomas | MIT | No disponible en el benchmark FINKI |
| whisper-small | 244 M | 30 s por segmento | 99 idiomas | MIT | No disponible en el benchmark FINKI |

La comparación cuantitativa con el modelo base y con otras variantes de Whisper en macedonio no está publicada en la información disponible; el autor solo afirma que este adaptador es el mejor sistema del benchmark FINKI, sin detallar los resultados de los competidores.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en macedonio; su uso con otros idiomas puede degradar el rendimiento respecto al modelo base.
- El dominio de entrenamiento son clases universitarias de informática y donaciones de voz, por lo que el rendimiento puede caer en otros registros (conversación espontánea, ruido de calle, acentos regionales no representados).
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o solapamiento de hablantes, comportamiento conocido en la familia Whisper.
- No se documentan sesgos demográficos, de género o de acento; la evaluación se limita a cinco clases del FINKI.
- El modelo no realiza diarización ni alineación temporal fina por sí solo; requiere herramientas adicionales como WhisperX.
- La licencia Apache-2.0 del adaptador es compatible con uso comercial, pero el modelo base whisper-large-v3-turbo se distribuye bajo MIT, cuyos términos deben respetarse igualmente.
- La model card indica que el adaptador generó los borradores de transcripción del benchmark de evaluación, lo que, aunque el autor afirma que no se usaron para entrenar, conviene tener en cuenta al interpretar los resultados.
- No hay información sobre el rendimiento en audio de más de 30 segundos sin segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vezilka-ai/vezilka-whisper-large-v3-turbo-mk-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de evaluación: https://huggingface.co/datasets/vezilka-ai/macedonian-speech
- Paper de datos (en revisión, según la model card): Gajdov, Karamachoski, Stojcheva, Mishkovski y Mishev, *Curated Macedonian speech datasets with regional transcription layers and a manually reviewed FINKI lecture benchmark*
- Proyecto VEZILKA (Grant Agreement No. 101263128): no se proporciona URL directa en la información disponible.
