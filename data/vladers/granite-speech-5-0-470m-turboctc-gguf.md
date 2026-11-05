# vladers/granite-speech-5.0-470m-turboctc-GGUF

## Resumen

Granite Speech 5.0 TurboCTC 470M es un modelo de reconocimiento automático del habla (ASR) desarrollado por IBM, publicado en su versión multilingüe el 21 de octubre de 2026. Esta ficha concreta corresponde a la conversión a formato GGUF realizada por el usuario vladers, pensada para su uso con el runtime transcribe.cpp. El modelo resuelve el problema de la transcripción de voz a texto local, con salida puntuada y capitalizada, en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.

La arquitectura combina un frontend convolucional (convoluciones depthwise y pointwise) con un cabezal CTC (Connectionist Temporal Classification) sobre un transformer de aproximadamente 473 millones de parámetros. El tamaño contenido permite ejecución en CPU y en GPUs de consumo, lo que lo sitúa como alternativa práctica a modelos ASR más pesados para dictado local, subtitulado y pipelines de transcripción por lotes.

La relevancia de esta conversión reside en su trazabilidad: cada fichero GGUF se reconstruye a partir de los pesos oficiales de IBM mediante una receta fijada en el repositorio, se verifica byte a byte contra sumas SHA256 y se acompaña de mediciones de tasa de error por palabra (WER) en inglés para cada nivel de cuantización. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend convolucional (depthwise + pointwise) con cabezal CTC; 520 tensores en total |
| Parametros totales | 473.014.752 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR por segmentos de audio, no de texto) |
| Tipos de cuantizacion | F32, F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Multilingüe: inglés (en), francés (fr), alemán (de), español (es), portugués (pt), italiano (it), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial de IBM `ibm-granite/granite-speech-5.0-470m-turboctc`, revisión `1dd23f46`. La arquitectura se organiza en dos bloques: un frontend de extracción de características basado en convoluciones (16 kernels de convolución depthwise, capas lineales y convoluciones pointwise, además de normas, sesgos y estadísticas de BatchNorm) y un cabezal de decodificación CTC que produce directamente la secuencia de tokens con puntuación y mayúsculas, sin necesidad de un módulo de lenguaje externo.

En la conversión a GGUF, cada fichero contiene 520 tensores. Los presets de cuantización actúan sobre 163 tensores (capas lineales y convoluciones pointwise); los 357 restantes permanecen en F32 en todos los ficheros, incluidos los kernels depthwise, las normas, los sesgos, las estadísticas de BatchNorm y las dos tablas del frontend. La excepción es BF16, que conserva los pesos lineales de IBM en su BF16 original y almacena los 48 kernels convolucionales en F16. El fichero F32 contiene los pesos de IBM exactamente y es la fuente de todas las versiones cuantizadas.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla multilingüe en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Salida con puntuación y capitalización, sin postprocesado adicional de texto.
- Decodificación CTC voraz (greedy), lo que simplifica el pipeline de inferencia y reduce la latencia.
- Entrada de audio en WAV mono a 16 kHz (conversión previa desde otros formatos mediante ffmpeg).
- Ejecución local en CPU y GPU mediante el runtime transcribe.cpp.
- Modelo compacto (473 M de parámetros) apto para aplicaciones de dictado y transcripción en tiempo real o por lotes.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Dictado local en escritorio: la aplicación Voiceour para macOS ya distribuye el fichero Q8_0 como reconocedor por defecto, lo que demuestra su idoneidad para transcripción continua en el propio equipo sin enviar audio a servicios externos.
- Subtitulado automático de vídeo: el modelo genera texto puntuado y capitalizado directamente, lo que reduce el trabajo de postprocesado en pipelines de generación de subtítulos para contenido en inglés, español, francés, alemán, italiano, portugués o japonés.
- Transcripción de reuniones: con un WER de 8,48 % en el corpus AMI (reuniones reales) en la versión Q8_0, es adecuado para actas automáticas y búsqueda sobre grabaciones, ejecutándose en local por motivos de privacidad.
- Procesamiento por lotes de archivos de audio: el tamaño reducido del fichero Q4_K_M (279 MB) permite desplegar múltiples instancias en un solo servidor o en máquinas modestas para transcribir grandes volúmenes de grabaciones.
- Integración en aplicaciones de accesibilidad: transcripción en vivo de conversaciones o contenido multimedia en el dispositivo, sin dependencia de la nube, gracias a la licencia Apache 2.0 y a la huella de memoria contenida.
- Transcripción de audio técnico y jerga: el modelo mantiene un WER de 6,41–6,56 % en el conjunto sintético de jerga técnica de la evaluación del autor, lo que lo hace viable para dominios especializados con vocabulario poco común.
- Investigación en ASR: la disponibilidad de siete niveles de cuantización con WER medido por fichero permite estudiar el compromiso entre precisión y tamaño en entornos de recursos limitados.

## Benchmarks y rendimiento

Los datos de WER (en %) proceden de la model card del autor de la conversión, medidos con decodificación CTC voraz en Metal, tras el normalizador de texto inglés de Whisper y sin postprocesado. Conjunto de confirmación de 17.858 clips:

| Fichero | Global (17.858) | AMI (12.393) | FLEURS (719) | LibriSpeech clean (2.210) | LibriSpeech other (2.536) |
|---|---:|---:|---:|---:|---:|
| BF16 | 5,30 | 8,48 | 4,50 | 1,28 | 2,67 |
| F16 | 5,30 | 8,48 | 4,53 | 1,28 | 2,68 |
| Q8_0 | 5,30 | 8,48 | 4,50 | 1,30 | 2,67 |
| Q6_K | 5,29 | 8,46 | 4,54 | 1,29 | 2,68 |
| Q5_K_M | 5,32 | 8,52 | 4,53 | 1,30 | 2,68 |
| Q4_K_M | 5,39 | 8,60 | 4,66 | 1,33 | 2,76 |
| Referencia: Parakeet TDT 0.6B v3, f16 | 7,21 | 11,62 | 5,02 | 1,98 | 3,71 |

Conjunto de cribado de 1.495 clips (F32 no se evaluó en el conjunto de confirmación; en el de cribado iguala a F16 en todos los corpus):

| Fichero | Habla natural (1.000) | AMI | FLEURS | LibriSpeech clean | LibriSpeech other | Jerga sintética (456) | Términos técnicos (16) |
|---|---:|---:|---:|---:|---:|---:|---:|
| F32 | 3,83 | 7,56 | 5,12 | 1,13 | 2,36 | 6,56 | 8,65 |
| BF16 | 3,82 | 7,54 | 5,14 | 1,11 | 2,36 | 6,54 | 8,65 |
| F16 | 3,83 | 7,56 | 5,12 | 1,13 | 2,36 | 6,56 | 8,65 |
| Q8_0 | 3,84 | 7,50 | 5,24 | 1,13 | 2,36 | 6,52 | 8,65 |
| Q6_K | 3,75 | 7,46 | 4,99 | 1,11 | 2,31 | 6,56 | 10,58 |
| Q5_K_M | 3,89 | 7,56 | 5,33 | 1,13 | 2,40 | 6,45 | 10,58 |
| Q4_K_M | 3,95 | 7,50 | 5,47 | 1,26 | 2,42 | 6,41 | 10,58 |
| Referencia: Parakeet TDT 0.6B v3, f16 | 4,71 | 9,31 | 5,11 | 1,89 | 3,57 | 6,13 | 6,73 |

Solo se midió en inglés. Las diferencias inferiores a 0,1 puntos entre precisiones no son significativas; el conjunto de términos técnicos tiene 16 clips, por lo que una palabra altera el resultado en unos 2 puntos.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 506 MB en disco y requiere un espacio similar en memoria; Q4_K_M baja a 279 MB y F32 sube a 1,89 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de memoria libre es suficiente; no se requiere una A100 ni H100. El autor midió en Metal (Apple Silicon).
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, iGPU recientes) e incluso en CPU sin GPU dedicada.
- Despliegue: runtime transcribe.cpp (compilación con CMake, binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada; solo se indica que la decodificación es CTC voraz.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER global (conjunto de confirmación) | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 TurboCTC 470M (Q8_0) | 473 M | 7 idiomas | 5,30 % | Apache 2.0 | GGUF |
| Parakeet TDT 0.6B v3 (f16) | 600 M | Inglés | 7,21 % | No disponible | No disponible |
| handy-computer/granite-speech-5.0-470m-turboctc-gguf | 473 M | Inglés (release anterior) | No disponible | Apache 2.0 | GGUF |

La comparativa con Parakeet se limita a los datos del propio autor de la conversión y solo cubre inglés. No se dispone de comparaciones con otros modelos ASR multilingües en la información proporcionada.

## Limitaciones y advertencias

- Solo se han publicado mediciones de WER en inglés; el rendimiento en francés, alemán, español, portugués, italiano y japonés no está cuantificado en la información disponible.
- Riesgo de alucinación o salida vacía en silencios y clips muy cortos: el autor documenta un comportamiento conocido en cinco clips de 40–60 ms, puntuados como vacíos.
- El conjunto de términos técnicos empleado en la evaluación tiene solo 16 clips, por lo que sus cifras tienen alta varianza y no deben tomarse como referencia firme.
- La conversión depende de una revisión concreta del modelo base (`1dd23f46`); el conversor de transcribe.cpp 0.4.1 no puede leer la release de octubre sin un parche.
- El runtime objetivo es transcribe.cpp; no se garantiza compatibilidad con otras herramientas GGUF como llama.cpp u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribución del modelo base de IBM.
- No se documentan sesgos específicos del modelo en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vladers/granite-speech-5.0-470m-turboctc-GGUF
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión concreta del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/1dd23f46f6d4e6eae2531982ba2e33220086dd97
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Conversión GGUF de handy-computer (release inglesa anterior): https://huggingface.co/handy-computer/granite-speech-5.0-470m-turboctc-gguf
- Aplicación Voiceour (dictado en macOS): https://github.com/joswha/voiceour
- Registro de benchmarks de Voiceour: https://github.com/joswha/voiceour/blob/main/docs/benchmarks.md#speech-recognizer-replacement-screen--2026-11-03
