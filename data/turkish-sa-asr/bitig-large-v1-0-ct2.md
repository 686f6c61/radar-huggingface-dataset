# turkish-sa-asr/bitig-large-v1.0-ct2

## Resumen

Bitig-large-v1.0-ct2 es la versión convertida a CTranslate2 del modelo de reconocimiento automático del habla Bitig-large-v1.0, desarrollado por la organización turkish-sa-asr. Se trata de un modelo especializado en transcripción de audio en turco, construido sobre la arquitectura Whisper y empaquetado en formato CTranslate2 para su uso con la librería faster-whisper, lo que permite una inferencia significativamente más rápida y con menor consumo de memoria que la implementación original.

El modelo base cuenta con aproximadamente 2.000 millones de parámetros, lo que lo sitúa en la categoría de los modelos Whisper de gran tamaño (equivalente a Whisper large). Su propósito es ofrecer transcripción de alta calidad específicamente optimizada para el idioma turco, un dominio donde los modelos Whisper genéricos suelen presentar un rendimiento inferior al de los modelos ajustados para un idioma concreto.

La relevancia de esta ficha radica en que el modelo se distribuye bajo acceso restringido (gated) y con una licencia de tipo "pre-release-evaluation", lo que implica que su uso está limitado a evaluación preliminar y no está pensado para producción sin una revisión de las condiciones por parte del usuario. El repositorio ocupa 3,1 GB y la fecha de creación indicada es noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), convertido a CTranslate2 |
| Parametros totales | ~2.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (formato CTranslate2; el repo indica modelo base cuantizado) |
| Idiomas soportados | Turco (tr) |
| Licencia | pre-release-evaluation (acceso restringido / gated) |
| Formato de pesos | CTranslate2 (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, un transformer encoder-decoder diseñado para reconocimiento automático del habla que procesa audio en ventanas y genera texto de forma autorregresiva. La versión aquí descrita es una conversión a CTranslate2 del modelo original Bitig-large-v1.0, lo que implica que los pesos han sido transformados al formato optimizado de CTranslate2 para su ejecución con faster-whisper, manteniendo la arquitectura y los parámetros del modelo base.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se confirma si el entrenamiento se realizó mediante fine-tuning del modelo Whisper original sobre corpus en turco o mediante entrenamiento desde cero. La única información técnica confirmada es el tamaño de 2.000 millones de parámetros y la especialización en turco.

## Capacidades

- Reconocimiento automático del habla (ASR) en turco: transcripción de audio a texto.
- Optimizado para el idioma turco, con presumible mejor rendimiento que los modelos Whisper multilingües genéricos en este idioma.
- Ejecución eficiente mediante CTranslate2 y faster-whisper, con menor latencia y consumo de memoria que la implementación original.
- No se confirma en la información disponible soporte de traducción de audio, detección de idioma, marcas de tiempo a nivel de palabra ni otras capacidades avanzadas de Whisper.
- No se confirma soporte de tool calling, agentes ni razonamiento multi-paso (no aplicable a un modelo ASR).
- Capacidades multilingües: limitadas al turco según los metadatos.

## Casos de uso

- Transcripción de reuniones y entrevistas en turco: el modelo puede convertir grabaciones de audio en texto para actas y documentación, aprovechando su especialización en el idioma.
- Subtitulado automático de vídeo en turco: generación de subtítulos para contenido audiovisual turco, con la ventaja de velocidad que aporta el formato CTranslate2.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de centros de contacto en turco para análisis de calidad y extracción de información.
- Archivado y búsqueda de contenido en audio: conversión de archivos de audio turcos a texto indexable para sistemas de búsqueda internos.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en turco.
- Investigación lingüística: creación de corpus transcritos en turco para estudios de lingüística computacional.
- Evaluación pre-producción: dado el carácter de licencia "pre-release-evaluation", su uso principal actual es la evaluación técnica antes de adoptar una versión estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada en la información disponible; para un modelo de ~2.000 millones de parámetros en formato CTranslate2 se requiere habitualmente una GPU con al menos 6-8 GB de VRAM, aunque la cifra exacta depende de la cuantización aplicada.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar compatibilidad con GPUs de consumo como RTX 3060/4090, pero no está confirmado.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada.
- Opciones de despliegue: faster-whisper (CTranslate2), y potencialmente otras herramientas que soporten CTranslate2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bitig-large-v1.0-ct2 | ~2.000 M | no disponible | Turco | pre-release-evaluation (gated) | CTranslate2 |
| Whisper large-v3 (OpenAI) | ~1.550 M | ventana de audio estándar | Multilingüe | MIT | safetensors, CTranslate2, GGUF |
| Whisper large-v2 (OpenAI) | ~1.550 M | ventana de audio estándar | Multilingüe | MIT | safetensors, CTranslate2, GGUF |

No se dispone de datos de rendimiento comparativo entre bitig-large-v1.0-ct2 y los modelos Whisper de OpenAI en la información proporcionada.

## Limitaciones y advertencias

- Licencia "pre-release-evaluation": el uso comercial puede estar restringido; es necesario revisar las condiciones en Hugging Face antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar las condiciones en Hugging Face para descargar el modelo.
- Especializado únicamente en turco: no es adecuado para otros idiomas.
- No se dispone de información sobre sesgos, tasas de alucinación ni robustez ante acentos o ruido de fondo.
- No se confirman detalles de cuantización ni de la ventana de audio máxima soportada.
- Al ser una conversión a CTranslate2, el comportamiento puede diferir ligeramente del modelo original en safetensors.
- Fecha de creación futura (2026) en los metadatos: verificar la vigencia y estabilidad del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turkish-sa-asr/bitig-large-v1.0-ct2
- Modelo base: https://huggingface.co/turkish-sa-asr/bitig-large-v1.0
- Organización: https://huggingface.co/turkish-sa-asr
