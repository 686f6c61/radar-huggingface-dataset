# twangodev/wav2vec2-xls-r-300m-hmong

## Resumen

El modelo `twangodev/wav2vec2-xls-r-300m-hmong` es un ajuste fino de `facebook/wav2vec2-xls-r-300m` para reconocimiento automático del habla (ASR) en hmong (código ISO 639-3 `hmn`). Lo publica el usuario `twangodev` en Hugging Face y está pensado para transcripción con CTC, con audio mono a 16 kHz. El repositorio tiene 315.470.495 parámetros (safetensors) y ocupa 1,3 GB, lo que corresponde al backbone XLS-R de 300M más la cabeza CTC.

El modelo parte de XLS-R, un backbone wav2vec2 preentrenado en más de 400.000 horas de audio multilingüe (según la documentación original de Facebook), y lo especializa en hmong. La relevancia práctica es doble: por un lado, aporta cobertura ASR a una lengua de bajos recursos con escasa representación en sistemas comerciales; por otro, la model card lo vincula a un proyecto de "screening" de palabras y tonos (repositorio `yancyou/hmong-screener` y paper arXiv:2601.09050) que, según el autor, requiere código y recursos adicionales del proyecto original.

La información publicada es escasa: no hay licencia declarada, no se detallan datos de entrenamiento, hiperparámetros ni métricas de evaluación, y el modelo acumula 14 descargas y 0 likes en el momento de la consulta. Cualquier uso en producción debería ir precedido de una evaluación propia sobre audio hmong representativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLS-R) con cabeza CTC (`AutoModelForCTC`) |
| Parametros totales | 315.470.495 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; la model card indica 16 kHz mono, sin duración máxima documentada) |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | hmong (`hmn`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2 en su variante XLS-R: un extractor de características convolucional sobre la forma de onda, seguido de un transformer de 24 capas con 1024 dimensiones ocultas (backbone de 300M), y una cabeza lineal de clasificación CTC (`AutoModelForCTC`) que produce logits por fotograma. El preentrenamiento original de XLS-R es auto-supervisado sobre audio multilingüe; el ajuste fino aquí es supervisado con transcripciones hmong y función de pérdida CTC, según se deduce del pipeline declarado y de la API de uso.

No se publican datos sobre el corpus de ajuste fino (horas, procedencia, hablantes, proporción de ruido), ni sobre hiperparámetros, ni sobre si hubo aumentación de datos. Tampoco se documenta ningún paso de RLHF/DPO, algo esperable en un modelo ASR. La model card menciona que el "word and tone screening" requiere el código de puntuación y los assets del proyecto upstream (`yancyou/hmong-screener`), lo que sugiere que el modelo se entrenó en el marco de un sistema de evaluación de pronunciación o screener, pero no se detalla esa integración.

## Capacidades

- Reconocimiento automático del habla en hmong con decodificación CTC (transcripción de audio a texto).
- Entrada de audio mono a 16 kHz, tal como especifica la model card.
- Compatible con la API de `transformers` (`AutoProcessor` + `AutoModelForCTC`) y con `pipeline("automatic-speech-recognition")`.
- Etiqueta `endpoints_compatible`, por lo que puede desplegarse en Hugging Face Inference Endpoints.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni agentes.
- No se documentan modos de razonamiento, visión ni audio más allá del ASR.
- El screening de palabras y tonos no es una capacidad autónoma del modelo: requiere código y assets externos del proyecto upstream.

## Casos de uso

- Transcripción de audio hmong en archivos y flujos de trabajo: cargar el modelo con `AutoModelForCTC` y `AutoProcessor`, remuestrear a 16 kHz mono y decodificar los logits con `processor.batch_decode`. Adecuado por ser un ajuste específico del idioma sobre un backbone multilingüe.
- Subtitulado y archivado de contenido audiovisual en hmong: el pipeline ASR permite generar transcripciones para vídeos, entrevistas o material educativo que de otro modo carecería de subtítulos.
- Investigación lingüística y documentación de lenguas de bajos recursos: permite generar corpus transcritos de hmong para estudios fonéticos o léxicos, con revisión humana posterior.
- Evaluación de pronunciación y screening de tonos: la model card vincula el modelo al proyecto `hmong-screener`; integrado con el código de puntuación upstream, puede emplearse para detectar errores de palabra o tono en aprendices.
- Preprocesado para pipelines de NLP en hmong: usar las transcripciones como entrada de sistemas de búsqueda, resumen o traducción que operen sobre texto hmong.
- Prototipado en Hugging Face Inference Endpoints: al estar marcado como `endpoints_compatible`, permite desplegar un servicio ASR hmong sin infraestructura propia para pruebas de concepto.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenidos hablados en hmong.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni comparaciones con otros sistemas, y tampoco se especifica el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB de pesos más activaciones y buffers de atención; en la práctica, entre 2 y 4 GB según la duración del audio y el tamaño de lote.
- En fp16/bf16: alrededor de 0,7 GB de pesos; el consumo total suele quedar por debajo de 2 GB para audios cortos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también es viable en CPU para audios cortos, aunque con mayor latencia.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia individual; solo tienen sentido para servir lotes grandes con `vLLM`/TGI o para reentrenamiento.
- Opciones de despliegue: `transformers` en Python, `pipeline("automatic-speech-recognition")`, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No se publican pesos GGUF, por lo que `llama.cpp`/`Ollama` no son aplicables sin conversión propia; `vLLM` y TGI no documentan soporte específico para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twangodev/wav2vec2-xls-r-300m-hmong` | 315,47 M | audio 16 kHz mono, duración máxima no documentada | hmong | no disponible | Hugging Face, 14 descargas |
| `facebook/wav2vec2-xls-r-300m` (base) | ~315 M | audio 16 kHz mono | multilingüe (XLS-R, 128 idiomas según documentación original) | no disponible en la información proporcionada | Hugging Face, ampliamente usado |
| `facebook/wav2vec2-large-xlsr-53` | ~315 M | audio 16 kHz mono | 53 idiomas | no disponible en la información proporcionada | Hugging Face |
| `openai/whisper-small` | ~244 M | audio 16 kHz, ventanas de 30 s | multilingüe (99 idiomas) | no disponible en la información proporcionada | Hugging Face |

La comparación relevante es con el backbone base: este checkpoint es una especialización monolingüe de XLS-R 300M, por lo que se espera mejor rendimiento en hmong que el modelo base a costa de perder cobertura multilingüe. Frente a Whisper, la arquitectura es distinta (encoder-decoder frente a CTC) y no se dispone de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia: no hay autorización explícita para uso comercial ni para redistribución; hay que contactar con el autor antes de integrarlo en productos.
- Ausencia total de métricas: no hay WER/CER publicado, ni tamaño del conjunto de evaluación, ni caracterización de los hablantes de entrenamiento.
- Riesgo de sobreajuste al dominio del corpus de ajuste: al no documentarse la composición de los datos, el rendimiento puede degradarse con acentos, ruido de fondo, micrófonos distintos o hablantes fuera de la distribución.
- Sesgos desconocidos: no se documenta la distribución demográfica, geográfica ni de género de los datos de entrenamiento.
- Riesgo de alucinación en CTC: la decodificación puede producir texto plausible pero incorrecto en segmentos con ruido o silencio; conviene aplicar umbrales de confianza y revisión humana.
- Cobertura limitada a hmong: no se ha entrenado para otros idiomas ni para code-switching, y no se documenta detección de idioma.
- El screening de palabras y tonos no funciona solo con el checkpoint: requiere el código de puntuación y los assets del proyecto upstream, que no se incluyen en el repositorio.
- El modelo tiene muy poca adopción (14 descargas, 0 likes) y fue publicado en noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento continuado.
- El paper referenciado (arXiv:2601.09050) no se ha verificado en la información proporcionada; conviene consultarlo antes de citar resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twangodev/wav2vec2-xls-r-300m-hmong
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Repositorio del proyecto de screening: https://github.com/yancyou/hmong-screener
- Paper referenciado: https://arxiv.org/abs/2601.09050
