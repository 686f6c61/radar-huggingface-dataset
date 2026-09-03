# willopcbeta/whisper-ja-anime-v0.3-ONNX

## Resumen

El modelo `willopcbeta/whisper-ja-anime-v0.3-ONNX` es una conversión automática a formato ONNX del modelo `efwkjn/whisper-ja-anime-v0.3`, un fine-tune de Whisper large-v3-turbo especializado en reconocimiento de voz en japonés, con un enfoque particular en vocabulario y entonación de anime. La conversión se realizó mediante el Space de Hugging Face `onnx-community/convert-to-onnx`, lo que permite su uso directo con la librería Transformers.js en entornos JavaScript, tanto en navegador como en Node.js.

El modelo original fue entrenado por el usuario `efwkjn` con un tokenizer japonés adaptado, un vocabulario reducido que mejora la eficiencia (aproximadamente 1,6 veces más bytes por token) y una arquitectura de decoder con 4 capas en lugar de las 2 capas típicas de los modelos destilados, lo que supone un decoder un 10% mayor. El entrenamiento se realizó durante 2^19 pasos con batch size 64, utilizando conjuntos de datos como OOPPEENN, Reazon, Common Voice 20 y otros. El modelo está pensado para transcripción de audio japonés, incluyendo contenido de anime y posiblemente letras de canciones, aunque esta última capacidad no ha sido probada.

La relevancia de esta versión ONNX radica en que facilita el despliegue en aplicaciones web y de escritorio basadas en JavaScript, sin necesidad de infraestructura Python, y aprovecha las optimizaciones de Transformers.js para ejecución en CPU, GPU o WebGPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer), basado en whisper-large-v3-turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estándar de Whisper: 30 segundos de audio, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base `efwkjn/whisper-ja-anime-v0.3` es un fine-tune completo de Whisper large-v3-turbo, que a su vez es una versión optimizada de Whisper large-v3 con decodificación más rápida. El fine-tune incorpora un tokenizer japonés específico, reduciendo el vocabulario original y aumentando la eficiencia en bytes por token (aproximadamente 1,6 veces). El decoder se configuró con 4 capas en lugar de las 2 capas típicas de los modelos destilados, lo que incrementa el tamaño del decoder en un 10% pero mejora la calidad en transcripciones largas.

El entrenamiento se realizó durante 2^19 pasos (524.288 pasos) con un batch size de 64, utilizando conjuntos de datos públicos como OOPPEENN, Reazon, Common Voice 20 y otros. No se especifica si se aplicaron técnicas de RLHF o DPO. La versión ONNX se generó automáticamente mediante el Space de conversión de Hugging Face, sin modificaciones adicionales en los pesos.

## Capacidades

- Reconocimiento de voz automático (ASR) en japonés, con especialización en vocabulario y expresiones propias del anime.
- Transcripción de audio de larga duración con mejor rendimiento que versiones anteriores (según el autor, la forma larga mejora notablemente respecto a v0.2).
- Posible capacidad para transcribir letras de canciones (lyrics), aunque no ha sido probada.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.js, lo que permite su uso en aplicaciones JavaScript.
- Soporte para ejecución en navegador mediante WebGPU o WebAssembly, y en Node.js.

## Casos de uso

- Transcripción de episodios de anime: el modelo puede convertir diálogos de series japonesas en texto, facilitando la creación de subtítulos o resúmenes automáticos. Su entrenamiento específico en anime mejora la precisión con jerga y nombres propios.
- Subtitulado automático para creadores de contenido: los youtubers o streamers que trabajan con material japonés pueden generar subtítulos en tiempo real o post-producción usando Transformers.js en el navegador.
- Asistentes de voz en japonés: integración en aplicaciones web que requieran dictado o comandos de voz, aprovechando la baja latencia de ONNX en WebGPU.
- Archivado y búsqueda de audio: transcripción de podcasts, entrevistas o material de archivo en japonés para indexación y búsqueda textual.
- Herramientas de estudio de idiomas: transcripción de audio educativo japonés para generar ejercicios de comprensión auditiva o anotaciones.
- Análisis de contenido multimedia: extracción de diálogos de anime para análisis de sentimiento, minería de texto o generación de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona la existencia de un archivo `BENCH.md` en el repositorio del modelo base, pero no se ha podido acceder a su contenido. Por tanto, no se dispone de métricas como MMLU, WER o CER para comparar con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la información proporcionada.
- Al ser un modelo ONNX de aproximadamente 8,2 GB (tamaño del repositorio), se estima que requiere al menos 8 GB de VRAM para inferencia en GPU, aunque puede ejecutarse en CPU con mayor latencia.
- Compatible con Transformers.js, por lo que puede desplegarse en navegadores con WebGPU (Chrome, Edge) o en Node.js con ONNX Runtime.
- Para uso en producción, se recomienda GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 o superior) para tiempos de inferencia aceptables.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de ASR japonés. El modelo base es un fine-tune de Whisper large-v3-turbo, por lo que puede compararse cualitativamente con otros fine-tunes de Whisper para japonés, como `kotoba-tech/kotoba-whisper-v2.0` o `openai/whisper-large-v3`, pero no se tienen datos de rendimiento de este modelo en particular.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en japonés y con un sesgo hacia contenido de anime, por lo que su rendimiento en otros dominios (noticias, conversación formal, acentos regionales) puede ser inferior.
- No se ha probado la capacidad de transcripción de letras de canciones, a pesar de que se menciona en el entrenamiento.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en productos comerciales.
- El modelo puede presentar alucinaciones en segmentos de audio ambiguos o con ruido, como es común en sistemas ASR.
- Al ser una conversión ONNX automática, no se garantiza que todas las optimizaciones del modelo original se hayan mantenido, aunque la conversión es estándar.
- Para usar con faster-whisper, el autor advierte que los cambios de vocabulario pueden afectar a `is_multilingual` y `suppress_tokens`, requiriendo ajustes en el código.

## Enlaces

- Modelo ONNX: https://huggingface.co/willopcbeta/whisper-ja-anime-v0.3-ONNX
- Modelo base: https://huggingface.co/efwkjn/whisper-ja-anime-v0.3
- Space de conversión ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de Transformers.js para ASR: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
