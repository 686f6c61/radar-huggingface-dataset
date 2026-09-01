# thantzinphyo/whisper-tiny-myanmar-piya

## Resumen

Whisper Tiny Myanmar (Piya Voice) es un modelo de reconocimiento automático del habla (ASR) desarrollado por thantzinphyo, especializado en la transcripción de audio en birmano (my). Se trata de un fine-tuning del modelo `thantzinphyo/whisper-tiny-myanmar-phase1`, que a su vez deriva de `openai/whisper-tiny`, adaptado específicamente al idioma birmano mediante el dataset refinado `thantzinphyo/burmese-speech-refined-openslr-80` con 2.529 grabaciones verificadas.

Con 37.760.640 parámetros, es un modelo compacto que resuelve la transcripción de voz en birmano, un idioma con escasos recursos en el ecosistema ASR. Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para aplicaciones de transcripción en este idioma, con un tamaño que permite su despliegue en entornos con recursos limitados. El modelo se publica con pesos en formato safetensors y está integrado en el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Tiny (transformer encoder-decoder) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estándar de Whisper: ventana de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | birmano (my) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Tiny de OpenAI, un transformer encoder-decoder con atención estándar, diseñado para procesar audio en ventanas de 30 segundos. El fine-tuning se realizó sobre el checkpoint `thantzinphyo/whisper-tiny-myanmar-phase1`, que ya había sido adaptado al birmano, y se entrenó durante 30 épocas (270 pasos) con el dataset `thantzinphyo/burmese-speech-refined-openslr-80`, compuesto por 2.529 grabaciones de voz birmana verificadas. El mejor checkpoint se obtuvo en la época 7, con una pérdida de validación de 0,0970. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar para ASR.

## Capacidades

- Transcripción de audio en birmano: convierte señales de voz en texto escrito en birmano.
- Reconocimiento automático del habla (ASR) con soporte para el pipeline `automatic-speech-recognition` de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni otras modalidades; es un modelo puramente de transcripción.
- Capacidad multilingüe limitada: aunque Whisper base soporta múltiples idiomas, este fine-tuning está especializado exclusivamente en birmano y no se garantiza un rendimiento adecuado en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en birmano: el modelo puede procesar grabaciones de audio y generar transcripciones textuales, útil para actas, análisis de contenido o archivado.
- Subtitulado automático de vídeos en birmano: integrado en pipelines de procesamiento de vídeo, permite generar subtítulos para contenido audiovisual dirigido a audiencias birmanas.
- Asistentes de voz para aplicaciones locales: al ser ligero, puede desplegarse en dispositivos con recursos limitados para comandos de voz en birmano, como búsqueda por voz o control de aplicaciones.
- Documentación médica o legal: transcripción de dictados o grabaciones en birmano para su posterior revisión y archivo.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas en birmano para extraer métricas de calidad o detectar problemas recurrentes.
- Accesibilidad: generación de texto a partir de audio para personas con discapacidad auditiva que necesiten leer contenido hablado en birmano.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en la model card, el mejor checkpoint (época 7) obtuvo los siguientes valores sobre el dataset de validación `thantzinphyo/burmese-speech-refined-openslr-80`:

| Metrica | Valor |
|---|---|
| WER (Word Error Rate) | 54,806 % |
| CER (Character Error Rate) | 19,3867 % |
| Pérdida de validación | 0,0970 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 37,7 millones de parámetros, puede ejecutarse en CPU o GPU con poca memoria, aunque no se proporcionan requisitos oficiales.
- En FP32, el peso del modelo ocupa aproximadamente 150 MB; en FP16, unos 75 MB, por lo que cabe en GPUs de consumo como una NVIDIA GTX 1050 Ti (4 GB) o superiores.
- Es compatible con el pipeline de Hugging Face Transformers, así como con librerías de inferencia como vLLM, llama.cpp u Ollama, aunque estas últimas están más orientadas a modelos de lenguaje.
- Para inferencia en tiempo real, una GPU moderna (por ejemplo, RTX 3060 o superior) ofrecería baja latencia; en CPU, la transcripción de un clip de 30 segundos puede tardar varios segundos, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. Sin embargo, el modelo se enmarca en una serie de fine-tunes del mismo autor:

| Modelo | Base | Dataset | Parámetros | Licencia |
|---|---|---|---|---|
| thantzinphyo/whisper-tiny-myanmar-piya | whisper-tiny-myanmar-phase1 | burmese-speech-refined-openslr-80 | 37.760.640 | Apache 2.0 |
| thantzinphyo/whisper-tiny-myanmar-phase1 | openai/whisper-tiny | no especificado | no disponible | Apache 2.0 |
| thantzinphyo/whisper-tiny-myanmar-phase2 | whisper-tiny-myanmar-phase1 | no especificado | no disponible | Apache 2.0 |

No se dispone de métricas para los modelos phase1 y phase2, por lo que no es posible realizar una comparación cuantitativa.

## Limitaciones y advertencias

- El WER de validación es elevado (54,8 %), lo que indica que el modelo comete errores significativos en la transcripción; puede ser adecuado para tareas donde la precisión no sea crítica, pero no para aplicaciones que requieran alta exactitud.
- El dataset de entrenamiento es reducido (2.529 grabaciones), lo que limita la generalización a diferentes acentos, condiciones de ruido o dominios específicos.
- El modelo está especializado únicamente en birmano; no se recomienda su uso para otros idiomas.
- No se han documentado sesgos específicos, pero al entrenarse con un corpus limitado, puede reflejar sesgos presentes en las grabaciones originales (por ejemplo, variedades dialectales o registros formales).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se proporcionan instrucciones sobre cuantización ni optimización para despliegue en entornos de baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thantzinphyo/whisper-tiny-myanmar-piya
- Dataset de entrenamiento: https://huggingface.co/datasets/thantzinphyo/burmese-speech-refined-openslr-80
- Modelo base (fase 1): https://huggingface.co/thantzinphyo/whisper-tiny-myanmar-phase1
- Modelo relacionado (fase 2): https://huggingface.co/thantzinphyo/whisper-tiny-myanmar-phase2
