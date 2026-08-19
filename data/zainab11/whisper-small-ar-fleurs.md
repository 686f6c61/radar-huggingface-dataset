# zainab11/whisper-small-ar-fleurs

## Resumen

El modelo `whisper-small-ar-fleurs` es un ajuste fino (fine-tuning) de `openai/whisper-small` realizado por el usuario zainab11, orientado al reconocimiento automático de voz (ASR) en árabe. Aunque la model card no especifica el dataset de entrenamiento, el nombre sugiere que se utilizó el corpus FLEURS, un conjunto multilingüe de referencia para ASR. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, listo para usar con la librería Transformers.

Con aproximadamente 241,7 millones de parámetros, este modelo hereda la arquitectura encoder-decoder de Whisper, diseñada para transcribir audio a texto. Su relevancia radica en ofrecer una alternativa ajustada para el árabe, un idioma con menos recursos que el inglés, y en que puede integrarse fácilmente en pipelines de ASR gracias a su compatibilidad con el ecosistema Hugging Face. El autor reporta un WER (Word Error Rate) de 0,1965 en el conjunto de evaluación, lo que indica un rendimiento moderado para tareas de transcripción en este idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (segun nombre del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-small`, que emplea una arquitectura encoder-decoder basada en transformer, con atención multi-cabeza y normalización de capas. Whisper-small cuenta con 12 capas de encoder y 12 de decoder, aunque los detalles específicos de esta variante ajustada no se detallan en la información proporcionada. El entrenamiento se realizó con la librería Transformers, utilizando un optimizador AdamW con learning rate de 1e-05, batch size total de 16 (con acumulación de gradientes de 2), scheduler lineal con 50 pasos de warmup y 5 épocas, además de precisión mixta (AMP). El dataset de entrenamiento no está especificado en la model card, pero el nombre del modelo apunta a FLEURS, un corpus multilingüe de referencia para ASR.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe: transcribe audio a texto, como se evidencia en las métricas de evaluación (WER 0,1965).
- Generación de transcripciones con timestamps (característica heredada de Whisper, aunque no se confirma en la documentación).
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face, lo que facilita su uso en aplicaciones de transcripción.
- No se documentan capacidades adicionales como traducción, diarización o soporte multilingüe más allá del árabe.

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo puede convertir grabaciones de audio en texto, útil para actas, análisis de contenido o búsqueda de información en archivos de voz.
- Subtitulado automático de vídeos en árabe: integrable en flujos de generación de subtítulos para plataformas de vídeo, mejorando la accesibilidad.
- Asistentes de voz y comandos por voz: al ser un modelo ligero (244M parámetros), puede desplegarse en entornos con recursos limitados para reconocer comandos en árabe.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para su posterior procesamiento con NLP (análisis de sentimiento, extracción de intenciones).
- Archivado y búsqueda de contenido audiovisual: conversión de archivos de audio en texto indexable para motores de búsqueda internos.
- Investigación académica en ASR para árabe: sirve como punto de partida para experimentos de fine-tuning o comparación con otros modelos de reconocimiento de voz en este idioma.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados durante el entrenamiento, con el WER final en el conjunto de evaluación:

| Época | Pérdida de entrenamiento | Pérdida de validación | WER |
|---|---|---|---|
| 1 | 1,0052 | 0,3952 | 0,2105 |
| 2 | 0,5065 | 0,3340 | 0,1992 |
| 3 | 0,2555 | 0,3322 | 0,2079 |
| 4 | 0,1306 | 0,3388 | 0,1933 |
| 5 | 0,0804 | 0,3480 | 0,1965 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 244M parámetros, la VRAM estimada para inferencia en FP32 es de aproximadamente 1 GB, aunque no se proporcionan datos oficiales.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (T4, A10, A100).
- Es compatible con la librería Transformers y el pipeline de Hugging Face; también puede exportarse a ONNX o convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se documenta explícitamente.
- La latencia y el throughput no están especificados en la información disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos ASR en árabe. Como referencia, el modelo base `openai/whisper-small` tiene 244M parámetros y soporta múltiples idiomas, pero no está ajustado específicamente para árabe. Otros modelos como `whisper-small` original o variantes multilingües podrían ser alternativas, pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que dificulta evaluar la generalización del modelo a dominios o acentos no representados en el corpus.
- El WER de 0,1965 indica que aún hay margen de error en la transcripción; puede fallar en audio con ruido, solapamiento de voces o dialectos árabes no cubiertos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus concreto, puede presentar sesgos hacia variedades lingüísticas o contextos particulares.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset subyacente (FLEURS) si se utiliza en producción.
- No se garantiza soporte para otros idiomas; el modelo está orientado al árabe y su uso fuera de este ámbito no está validado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zainab11/whisper-small-ar-fleurs)
- [Modelo base: openai/whisper-small](https://huggingface.co/openai/whisper-small)
