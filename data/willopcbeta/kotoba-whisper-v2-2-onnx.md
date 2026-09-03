# willopcbeta/kotoba-whisper-v2.2-ONNX

## Resumen

El modelo `willopcbeta/kotoba-whisper-v2.2-ONNX` es una conversión a formato ONNX del sistema de reconocimiento automático de voz (ASR) japonés `kotoba-tech/kotoba-whisper-v2.2`, publicada por el usuario willopcbeta. Esta versión está pensada para ser utilizada con la librería Transformers.js, lo que permite ejecutar el modelo directamente en el navegador o en entornos Node.js sin necesidad de un backend de Python. El modelo original, desarrollado por Kotoba Technologies en colaboración con Asahi Ushio, amplía las capacidades del Whisper estándar añadiendo dos funcionalidades clave: diarización de hablantes (identificación de quién habla y en qué intervalo) y puntuación automática del texto transcrito, integradas como un pipeline de Transformers.

La relevancia de esta conversión ONNX radica en que facilita el despliegue de un sistema ASR japonés completo (transcripción + diarización + puntuación) en aplicaciones web y de escritorio ligeras, sin depender de infraestructura GPU dedicada. El modelo base es Whisper, aunque no se especifica la variante concreta (large, medium, etc.) en la información disponible. El repositorio ocupa 9,4 GB, lo que sugiere que se trata de una versión de gran tamaño, probablemente la variante large. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (basado en kotoba-whisper-v2.0, tamaño exacto no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper típicamente usa ventanas de 30 segundos, no confirmado) |
| Tipos de cuantizacion | no disponible (formato ONNX, se desconoce si FP32/FP16/INT8) |
| Idiomas soportados | ja (japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, un transformer encoder-decoder diseñado originalmente por OpenAI para reconocimiento de voz multilingüe. La versión original `kotoba-whisper-v2.2` parte del modelo `kotoba-whisper-v2.0` y le añade una capa de postprocesamiento integrada en el pipeline de Transformers. Esta capa incluye dos componentes adicionales: un modelo de diarización de hablantes basado en `diarizers` (con el modelo `diarizers-community/speaker-segmentation-fine-tuned-callhome-jpn`) y un modelo de puntuación (`punctuators`). El entrenamiento específico de estos módulos no está detallado en la información proporcionada, pero se sabe que el pipeline completo se desarrolló mediante la colaboración entre Asahi Ushio y Kotoba Technologies. La conversión a ONNX se realizó automáticamente mediante un Space de Hugging Face, sin modificaciones adicionales en los pesos.

## Capacidades

- Transcripción de audio en japonés con alta precisión, basada en el modelo Whisper.
- Diarización de hablantes: identifica distintos interlocutores en una grabación y asigna segmentos de texto a cada uno, con marcas de tiempo.
- Puntuación automática: añade signos de puntuación (puntos, comas, etc.) al texto transcrito cuando se activa la opción `add_punctuation=True`.
- Integración nativa con la clase `pipeline` de Transformers, tanto en Python como en Transformers.js.
- Procesamiento por lotes (batch) y troceado de audio en segmentos de 15 segundos (`chunk_length_s=15`).
- Soporte para ejecución en CPU y GPU (con `torch_dtype=float16` en CUDA).
- Requiere autenticación con Hugging Face para acceder a los modelos de diarización de pyannote (segmentation-3.0 y speaker-diarization-3.1).

## Casos de uso

- Transcripción de reuniones de empresa en japonés: el modelo puede procesar una grabación de una reunión y devolver un texto segmentado por hablante, con marcas de tiempo, lo que facilita la elaboración de actas automáticas.
- Subtitulación de vídeos en japonés: al combinar la transcripción con la diarización, se pueden generar subtítulos que indiquen qué personaje o participante está hablando en cada momento.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas telefónicas en japonés y clasificar las intervenciones de cliente y agente, mejorando el control de calidad.
- Asistentes de voz para aplicaciones web: gracias a la versión ONNX y Transformers.js, el modelo puede ejecutarse en el navegador para transcribir comandos de voz en japonés sin enviar audio a un servidor.
- Generación de actas de conferencias o seminarios: con la puntuación activada, el texto resultante es más legible y apto para su publicación directa.
- Procesamiento por lotes de archivos de audio históricos: el pipeline permite transcribir grandes volúmenes de grabaciones en japonés (por ejemplo, archivos de radio o podcasts) con segmentación por hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos exactos de VRAM, pero el tamaño del repositorio (9,4 GB) sugiere que el modelo es grande (posiblemente la variante Whisper large-v3).
- Para inferencia en CPU, se recomienda al menos 16 GB de RAM, ya que el modelo ONNX cargará varios gigabytes en memoria.
- En GPU, una tarjeta con 8-10 GB de VRAM sería suficiente para ejecutar el modelo en FP16, aunque no se confirma.
- Puede desplegarse con Transformers.js en el navegador o Node.js, así como con ONNX Runtime en Python u otros entornos.
- No se indican cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información para comparar este modelo con otras alternativas ASR japonesas en el contexto de la conversión ONNX. El modelo original `kotoba-whisper-v2.2` se posiciona como una mejora sobre `kotoba-whisper-v2.0`, pero no se aportan datos de otros competidores como ReazonSpeech o Whisper japonés afinado.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para el idioma japonés; no es adecuado para otros idiomas.
- Para usar la diarización, es obligatorio aceptar los términos de uso de los modelos de pyannote (`pyannote/segmentation-3.0` y `pyannote/speaker-diarization-3.1`) y disponer de un token de Hugging Face.
- La diarización depende de modelos adicionales que no están incluidos en el repositorio ONNX; deben cargarse por separado.
- No se ha verificado el comportamiento del modelo en dominios específicos (argot, ruido de fondo, acentos regionales) ni se han documentado sesgos potenciales.
- Al ser una conversión automática, podría haber pequeñas diferencias de precisión respecto al modelo original en PyTorch.
- El tamaño del repositorio (9,4 GB) puede dificultar su uso en entornos con limitaciones de ancho de banda o almacenamiento.

## Enlaces

- [Modelo en Hugging Face (willopcbeta/kotoba-whisper-v2.2-ONNX)](https://huggingface.co/willopcbeta/kotoba-whisper-v2.2-ONNX)
- [Modelo original (kotoba-tech/kotoba-whisper-v2.2)](https://huggingface.co/kotoba-tech/kotoba-whisper-v2.2)
- [Repositorio GitHub de kotoba-whisper](https://github.com/kotoba-tech/kotoba-whisper)
- [Conversión ONNX automática (Space)](https://huggingface.co/spaces/onnx-community/convert-to-onnx)
