# thantzinphyo/Wav2Vec2-XLS-R-Burmese-ASR

## Resumen

El modelo thantzinphyo/Wav2Vec2-XLS-R-Burmese-ASR es un ajuste fino de facebook/wav2vec2-xls-r-300m orientado al reconocimiento automatico del habla (ASR) en birmano (codigo de idioma `my`). Lo publica el usuario thantzinphyo y su objetivo es cubrir una de las lenguas con menos recursos en tecnologia del habla: el birmano apenas cuenta con modelos ASR abiertos y los existentes suelen ser de calidad limitada. El modelo usa la arquitectura Wav2Vec2 con preentrenamiento multilingue XLS-R y una cabeza CTC, con 315.505.346 parametros (unos 317M, coherentes con la base XLS-R-300M).

El problema que resuelve es la transcripcion automatica de audio en birmano a texto en Unicode estandarizado, algo util para subtitulado, asistentes de voz, analitica de llamadas y accesibilidad en ese idioma. Se entrena sobre un corpus propio de aproximadamente 22 horas de audio, 24.560 enunciados y 13 hablantes sinteticos de birmano, con una division de prueba sobre dos voces no vistas durante el entrenamiento para medir generalizacion acustica zero-shot.

Es relevante ahora porque aporta una linea base abierta (licencia Apache 2.0) para un idioma infrarrepresentado, con metricas publicadas de WER, CER y chrF, y porque su tamano moderado permite desplegarlo en hardware de consumo. Su principal limitacion es que el corpus de entrenamiento usa voces sinteticas, lo que condiciona la generalizacion a hablantes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 XLS-R (transformer convolucional + encoder transformer, cabeza CTC) |
| Parametros totales | 315.505.346 (~317M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la informacion disponible (dependiente de la longitud de los segmentos de audio de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se listan variantes GGUF, int8 ni int4) |
| Idiomas soportados | birmano (`my`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | automatic-speech-recognition (ASR) |
| Frecuencia de muestreo | 16.000 Hz, mono |
| Vocabulario | 64 tokens de caracteres birmanos (cabeza CTC) |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo parte de facebook/wav2vec2-xls-r-300m, un checkpoint preentrenado de forma autosupervisada con el objetivo wav2vec 2.0 sobre aproximadamente 436.000 horas de audio sin etiquetar en 128 idiomas (VoxPopuli, MLS, CommonVoice, BABEL y VoxLingua107, entre otros). Sobre esa base, el ajuste fino anade una cabeza de clasificacion CTC con un vocabulario de 64 tokens de caracteres birmanos y se optimiza para transcripcion directa de audio a texto. La entrada se normaliza a 16 kHz mono.

El entrenamiento se realizo sobre un corpus propio de unas 22 horas (24.560 archivos WAV, 16 bits PCM, mono) con 13 hablantes sinteticos de birmano. La division fue de 11 hablantes para entrenamiento y validacion (20.699 enunciados de entrenamiento y 2.300 de validacion) y 2 hablantes no vistos para el conjunto de prueba (1.561 enunciados). El preprocesado de texto usa Unicode birmano estandarizado (rango `\u1000-\u109F`), con segmentacion de palabras unificada y eliminacion de puntuacion. La configuracion de entrenamiento incluye tamano de lote efectivo 32 (4 por dispositivo x 8 pasos de acumulacion de gradiente), tasa de aprendizaje maxima 3,0e-4, planificador lineal, 200 pasos de warmup, 2.000 pasos totales (aproximadamente 6 epocas), precision mixta BF16 y gradient checkpointing. No se aplico aumento de datos. No se documenta uso de RLHF ni DPO, algo poco habitual en ASR.

## Capacidades

- Reconocimiento automatico del habla en birmano: transcribe audio de 16 kHz mono a texto en Unicode birmano estandarizado.
- Salida a nivel de caracteres mediante cabeza CTC con 64 tokens, adecuada para una escritura sin separadores de palabra claros.
- Metricas de calidad publicadas: WER, CER, SER, DER, IER y chrF sobre validacion y sobre un conjunto de prueba con hablantes no vistos.
- Generalizacion a voces no vistas: el test held-out evalua dos hablantes excluidos del entrenamiento (generalizacion acustica zero-shot).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision, audio generativo ni salida multimodal.
- Capacidad multilingue: unicamente birmano; no se reporta transferencia a otros idiomas.

## Casos de uso

- Subtitulado y transcripcion de contenido en birmano: convertir audio de videos, podcasts o clases a texto para generar subtitulos en Unicode birmano estandarizado, aprovechando la salida a nivel de caracter con CER bajo en el conjunto de validacion.
- Analitica de centros de llamadas en birmano: transcribir conversaciones de atencion al cliente para extraer temas, palabras clave y sentimiento; el modelo aporta una linea base abierta y desplegable en GPU de consumo.
- Asistentes de voz para birmano: usar el modelo como modulo ASR dentro de un pipeline de voz (ASR → NLU → TTS) para aplicaciones de dictado o comandos por voz en ese idioma.
- Accesibilidad y documentacion linguistica: transcripcion de grabaciones de campo, entrevistas o material oral en birmano para su conservacion y busqueda textual, dado el escaso soporte abierto para este idioma.
- Indexacion y busqueda de archivos de audio: generar transcripciones para hacer buscable un archivo de audio birmano (por ejemplo, repositorios de entrevistas o medios).
- Modulo de preprocesado en pipelines de datos: usar las transcripciones como entrada para resumen, traduccion o clasificacion de contenido birmano en etapas posteriores.
- Evaluacion comparativa de ASR de bajos recursos: servir como referencia reproducible (metricas y division de prueba documentadas) para investigadores que trabajan en idiomas con pocos recursos.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion provienen de la model card del autor. Corresponden a la validacion (11 hablantes vistos) y al conjunto de prueba final (2 hablantes no vistos). No se aportan cifras comparativas con otros modelos en la informacion disponible.

| Fase / evaluacion | Paso | WER (%) | CER (%) | SER (%) | DER (%) | IER (%) | chrF |
|---|---:|---:|---:|---:|---:|---:|---:|
| Baseline (sin entrenar) | 0 | 100,00 | 113,39 | 100,00 | 85,06 | 0,00 | 0,55 |
| Validacion | 250 | 72,71 | 17,40 | 99,78 | 13,98 | 3,03 | 66,26 |
| Validacion | 500 | 39,69 | 7,33 | 87,70 | 6,37 | 3,16 | 87,39 |
| Validacion | 750 | 33,10 | 5,68 | 83,43 | 3,66 | 4,38 | 91,12 |
| Validacion | 1000 | 29,82 | 4,68 | 78,35 | 5,50 | 2,43 | 92,75 |
| Validacion | 1250 | 27,96 | 4,08 | 75,09 | 5,15 | 2,70 | 93,58 |
| Validacion | 1500 | 25,96 | 3,81 | 71,17 | 4,16 | 3,21 | 94,43 |
| Validacion | 1750 | 25,18 | 3,67 | 70,57 | 4,77 | 2,47 | 94,70 |
| Validacion | 2000 | 24,25 | 3,53 | 69,13 | 3,77 | 3,07 | 94,97 |
| Prueba no vista (final) | final | 33,24 | 6,58 | 91,35 | 5,87 | 2,57 | 87,69 |

Lectura rapida: en validacion el modelo alcanza 24,25 % de WER y 3,53 % de CER al paso 2.000, mientras que sobre hablantes no vistos sube a 33,24 % de WER y 6,58 % de CER, lo que indica una degradacion apreciable al pasar a voces nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 alrededor de 1,3 GB de pesos; en fp16/BF16 aproximadamente 0,7 GB; con overhead de activaciones, un margen practico de 2-4 GB es suficiente para audio de segmentos cortos.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- GPU recomendadas para produccion con throughput alto: NVIDIA A100, H100, L40S o T4 para lotes grandes; para uso individual, cualquier RTX moderna es suficiente.
- Opciones de despliegue: pipeline de Hugging Face Transformers (`automatic-speech-recognition`), Hugging Face Inference Endpoints, exportacion a ONNX Runtime para inferencia optimizada. No se documentan variantes GGUF ni soporte en llama.cpp/Ollama, ya que la arquitectura Wav2Vec2 (audio) no encaja en esos runners de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Consideracion adicional: al ser un modelo de audio, el rendimiento depende del remuestreo a 16 kHz mono y del troceado del audio largo en segmentos manejables.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparativos directos de WER en birmano frente a otros modelos. La tabla siguiente compara caracteristicas estructurales con alternativas de la misma categoria (ASR multilingue o de bajos recursos).

| Modelo | Parametros | Idiomas | Arquitectura / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thantzinphyo/Wav2Vec2-XLS-R-Burmese-ASR | ~317M | birmano (`my`) | Wav2Vec2 XLS-R + CTC | Apache 2.0 | Hugging Face |
| facebook/wav2vec2-xls-r-300m | ~317M | 128 idiomas (preentrenado) | Wav2Vec2 XLS-R, sin cabeza ASR ajustada | Apache 2.0 | Hugging Face |
| openai/whisper-small | ~244M | multilingue (99 idiomas, birmano incluido) | Transformer encoder-decoder seq2seq | MIT | Hugging Face / OpenAI |
| openai/whisper-medium | ~769M | multilingue | Transformer encoder-decoder seq2seq | MIT | Hugging Face / OpenAI |

Nota: no se dispone de cifras de WER en birmano para Whisper ni para otros modelos en la informacion proporcionada, por lo que la comparacion de calidad no puede cuantificarse aqui.

## Limitaciones y advertencias

- Entrenamiento con voces sinteticas: los 13 hablantes del corpus son sinteticos, lo que puede provocar un desajuste de dominio al transcribir voces humanas reales con acentos, ruido de fondo o estilos de habla no representados.
- Degradacion en hablantes no vistos: el WER sube de 24,25 % en validacion a 33,24 % en el conjunto de prueba con hablantes no vistos, y el SER alcanza 91,35 %, lo que indica que muchas frases se transcriben con algun error a nivel de oracion.
- Corpus pequeno: aproximadamente 22 horas de audio es un volumen reducido para ASR, especialmente si se compara con los cientos de miles de horas de preentrenamiento de XLS-R.
- Idioma unico: solo soporta birmano; no hay capacidades multilingues ni traduccion.
- Riesgo de alucinacion y de sustituciones: como todo modelo CTC, puede generar caracteres incorrectos o repetidos en audio ruidoso o fuera de dominio.
- Sin datos de latencia, throughput ni cuantizaciones disponibles: cualquier despliegue en produccion requerira medir rendimiento propio.
- Contexto de audio no especificado: no se documenta la longitud maxima de audio por inferencia; el audio largo debe trocearse.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene revisar el origen y los derechos del corpus de voces sinteticas empleado en el entrenamiento.
- Popularidad muy baja: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thantzinphyo/Wav2Vec2-XLS-R-Burmese-ASR
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Paper de XLS-R: https://arxiv.org/abs/2111.09296
- Documentacion de XLSR-Wav2Vec2 en Transformers: https://huggingface.co/docs/transformers/model_doc/xlsr_wav2vec2
- Guia de ajuste fino de XLS-R para ASR (blog de Hugging Face): https://github.com/huggingface/blog/blob/main/fine-tune-xlsr-wav2vec2.md
- Ejemplo de uso de Wav2Vec2-XLS-R: https://huggingface.co/Utkarshg02/Wav2vec2-XLS-R
