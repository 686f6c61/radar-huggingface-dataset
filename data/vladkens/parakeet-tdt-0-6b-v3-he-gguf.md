# vladkens/parakeet-tdt-0.6b-v3-he-gguf

## Resumen

`parakeet-tdt-0.6b-v3-he-gguf` es la versión cuantizada en GGUF del modelo de reconocimiento automático del habla `thewh1teagle/parakeet-tdt-0.6b-v3-he`, un ajuste fino en hebreo de NVIDIA Parakeet TDT 0.6B v3 realizado por Yakov Kolani. El modelo original parte de la arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer) de NVIDIA, con 628.351.100 parámetros, y ha sido especializado exclusivamente para transcribir audio en hebreo. Esta ficha cubre la conversión publicada por `vladkens`, que empaqueta los pesos en un único fichero GGUF Q8_0 de 741 MB para poder ejecutarse con las herramientas `wavo` y `transcribe.cpp` sin necesidad de PyTorch ni de NeMo en tiempo de inferencia.

El interés práctico de esta publicación es doble. Por un lado, permite ejecutar un modelo ASR de 0,6 mil millones de parámetros en CPU o en GPU de gama baja con un consumo de memoria en torno a 1 GB, algo relevante para aplicaciones de transcripción offline o en dispositivos sin acelerador dedicado. Por otro, el autor documenta una comparativa de tasa de error por palabra (WER) frente a `openai/whisper-large-v3-turbo` en cinco conjuntos de evaluación en hebreo, con mejoras que van de los 2,67 puntos en `eval-d1` a los 10,47 puntos en FLEURS.

El repositorio, publicado bajo licencia CC-BY-4.0, no incluye datos de entrenamiento propios: es una conversión de pesos con un parche mínimo en el script de conversión de `transcribe.cpp` para reconocer el perfil del modelo (vocabulario de 9.206 piezas, idioma `he`, carga con `weights_only=True`). Es, por tanto, una pieza de infraestructura de despliegue más que un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), heredada de NVIDIA Parakeet TDT 0.6B v3 |
| Parámetros totales | 628.351.100 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; al ser un modelo ASR la entrada es audio y la model card no documenta el límite de duración por segmento |
| Tipos de cuantización | Q8_0 (único fichero publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Hebreo (`he`) únicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (fichero `parakeet-tdt-0.6b-v3-he-Q8_0.gguf`, 741 MB); el checkpoint upstream se distribuye como `.nemo` |
| Vocabulario | 9.206 piezas (8.192 del tokenizador de v3 + 1.014 piezas hebreas añadidas) |
| Detección de idioma | Desactivada (`lang_detect: False`) |
| Tamaño del repositorio | 0,7 GB |
| Librería de inferencia | transcribe.cpp (también ejecutable con wavo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Parakeet TDT 0.6B v3 de NVIDIA: un codificador FastConformer (variante de Conformer con atención por bloques y submuestreo agresivo de la secuencia de audio) acoplado a un decodificador de tipo Transducer que predice conjuntamente tokens y duraciones (TDT). Este esquema permite emitir varios tokens por fotograma y reducir el coste de decodificación frente a un Transducer clásico, algo que se traduce en menor latencia con una precisión comparable. El modelo trabaja sobre audio mono a 16 kHz en el caso de `transcribe.cpp`.

El ajuste fino en hebreo, obra de Yakov Kolani, se realizó sobre audio en hebreo de ivrit.ai etiquetado con `ivrit-ai/whisper-large-v3-turbo`, es decir, mediante pseudo-etiquetado supervisado por un modelo mayor. El vocabulario se amplió en 1.014 piezas específicas del hebreo hasta las 9.206 entradas. La model card de esta conversión no detalla el número de horas de entrenamiento, la composición exacta del corpus, ni si hubo etapas de RLHF o DPO; esa información queda remitida a la model card del modelo upstream. La innovación técnica de esta publicación concreta es de herramienta: un perfil nuevo en `scripts/convert-parakeet.py` que reconoce la variante `v3-he` (vocabulario esperado, idioma, carga segura del checkpoint) y la posterior cuantización con `transcribe-quantize --quant Q8_0`.

## Capacidades

- Transcripción de voz a texto en hebreo, con salida de texto plano y sin detección automática de idioma.
- Decodificación TDT, que combina predicción de tokens y de duraciones para reducir pasos de decodificación.
- Manejo de audio de distintas fuentes: la ruta recomendada con `wavo` acepta cualquier formato y frecuencia de muestreo, y remuestrea internamente; `transcribe-cli` espera WAV mono a 16 kHz.
- Ejecución totalmente local, sin llamadas a servicios externos ni dependencias de PyTorch en inferencia.
- Integración en pipelines de línea de comandos, lo que facilita el procesamiento por lotes.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio-token prompting ni modo "thinking": es un modelo ASR puro, no un modelo de lenguaje generativo de propósito general.
- Capacidad multilingüe: nula más allá del hebreo; las palabras en inglés se emiten con caracteres hebreos, según advierte el autor.

## Casos de uso

- Transcripción de reuniones y llamadas en hebreo: el modelo convierte grabaciones completas en texto con una WER de 5,30 % en el conjunto `eval-d1`, adecuada para actas y resúmenes posteriores procesados por un LLM aparte.
- Subtitulado de vídeo en hebreo: al ejecutarse por CLI (`transcribe-cli -m ... audio.wav`), se puede encadenar con herramientas de segmentación y generación de subtítulos en un pipeline por lotes.
- Transcripción de notas de voz de WhatsApp y mensajería: el conjunto `eval-whatsapp` (WER 8,44 %) está específicamente orientado a audio conversacional de baja calidad, lo que respalda este uso en atención al cliente o archivo de conversaciones.
- Aplicaciones de escritorio offline: con 741 MB en Q8_0, el modelo cabe en el disco de un portátil y se ejecuta sin GPU, lo que permite ofrecer dictado o transcripción sin enviar audio a la nube (relevante por privacidad y RGPD).
- Investigación lingüística y creación de corpus: transcripción masiva de entrevistas o grabaciones de campo en hebreo para su posterior anotación y análisis.
- Digitalización de archivo audiovisual: indexación y búsqueda por texto en fondos de vídeo o radio en hebreo, ejecutando el modelo en CPU en servidores sin GPU dedicada.
- Evaluación comparativa de ASR: servir de referencia en hebreo frente a Whisper en estudios internos, gracias a los conjuntos de evaluación públicos de ivrit.ai.
- Despliegue en dispositivos de borde: al necesitar alrededor de 1 GB de memoria, es viable en mini-PC, Raspberry Pi de gama alta o contenedores con límites estrictos de RAM.

## Benchmarks y rendimiento

Los datos publicados en la model card son de WER (%, menor es mejor), calculados con el código de evaluación de ivrit.ai sobre los ficheros Q8_0 ejecutados en `wavo`. `eval-d1` y `eval-whatsapp` son los conjuntos completos; SASpeech, KAN y FLEURS (`he_il` test) son subconjuntos de 200 clips.

| Modelo | eval-d1 | eval-whatsapp | SASpeech | KAN | FLEURS |
|---|---:|---:|---:|---:|---:|
| parakeet-tdt-0.6b-v3-he (este) | 5,30 | 8,44 | 6,89 | 10,10 | 22,78 |
| openai/whisper-large-v3-turbo, Q8_0 | 7,97 | 15,21 | 10,80 | 16,66 | 33,25 |

La ventaja es consistente en los cinco conjuntos, con una diferencia máxima de 10,47 puntos absolutos en FLEURS y mínima de 2,67 puntos en `eval-d1`. No se han publicado resultados de latencia, throughput ni consumo de CPU/GPU en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 1 GB con el fichero Q8_0 de 741 MB, más el búfer de audio y el estado del decodificador. Cifra exacta no disponible.
- GPU recomendadas: no se documentan; al ser un modelo de 0,6 B, cualquier GPU con 2 GB o más de memoria es suficiente en la práctica. No hay pruebas publicadas con A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, etc.), así como en iGPU con memoria compartida suficiente.
- CPU: es el escenario natural del proyecto; el modelo está pensado para ejecutarse sin acelerador, aunque no se publican cifras de velocidad (RTF o x veces tiempo real).
- Opciones de despliegue: `wavo` (`wavo pull parakeet-he`, `wavo run parakeet-he audio.m4a`) y `transcribe.cpp` (`transcribe-cli -m parakeet-tdt-0.6b-v3-he-Q8_0.gguf audio.wav`). No es compatible con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje con arquitectura Transformer decoder estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Parámetros | Formato | WER FLEURS (he_il) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| parakeet-tdt-0.6b-v3-he (este, Q8_0) | he | 628.351.100 | GGUF | 22,78 | CC-BY-4.0 | HuggingFace, vía transcribe.cpp/wavo |
| openai/whisper-large-v3-turbo (Q8_0) | multilingüe | No disponible en la información | No disponible en la información | 33,25 | No disponible en la información | Referenciado en la model card como baseline |
| nvidia/parakeet-tdt-0.6b-v3 | multilingüe (europeo) | No disponible en la información | `.nemo` | No disponible | No disponible en la información | HuggingFace (modelo base de la cadena) |
| thewh1teagle/parakeet-tdt-0.6b-v3-he | he | No disponible en la información | `.nemo` | No disponible | CC-BY-4.0 | HuggingFace (origen de esta conversión) |

La comparación disponible se limita al eje de calidad en hebreo: el modelo supera a Whisper large-v3-turbo en los cinco conjuntos evaluados, con especial ventaja en audio conversacional y en FLEURS. No hay datos publicados que permitan comparar velocidad, consumo o robustez frente a ruido con las alternativas.

## Limitaciones y advertencias

- Idioma único: solo transcribe hebreo correctamente; el inglés y otros idiomas se emiten con caracteres hebreos, lo que invalida su uso en entornos multilingües sin un paso previo de detección de idioma.
- Detección de idioma desactivada (`lang_detect: False`): no hay mecanismo interno para avisar de que el audio no está en hebreo.
- Riesgo de alucinación: como todo modelo ASR entrenado con pseudo-etiquetas de Whisper, puede generar texto plausible en tramos de silencio, ruido o audio ininteligible. No se documenta ningún mecanismo de mitigación.
- Sesgos: no se documentan análisis de sesgo por acento, género, origen o calidad de grabación. El corpus de entrenamiento proviene de ivrit.ai y las etiquetas de `ivrit-ai/whisper-large-v3-turbo`, de modo que hereda los sesgos de ambos.
- Cadena de licencias: la licencia es CC-BY-4.0, que exige atribución. Hay que atribuir tanto a Yakov Kolani como a NVIDIA como origen de los pesos; el fichero `NOTICE` del repositorio detalla los cambios realizados.
- Restricciones de uso comercial: CC-BY-4.0 permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base de NVIDIA y del corpus ivrit.ai antes de explotarlo en producción.
- Formato y toolchain: al depender de `transcribe.cpp` y de un perfil específico en el script de conversión (commit `5bb2deb`), la compatibilidad con futuras versiones de la herramienta no está garantizada.
- Entrada de audio: `transcribe-cli` requiere WAV mono a 16 kHz; usar otra frecuencia o número de canales sin remuestreo previo puede degradar el resultado.
- Madurez: el repositorio registra cero descargas y cero valoraciones en el momento de la consulta, y no hay informes independientes de calidad fuera de los conjuntos de ivrit.ai.
- Sin datos de rendimiento: no hay cifras publicadas de latencia, throughput ni uso de memoria, lo que obliga a medir en el entorno propio antes de dimensionar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vladkens/parakeet-tdt-0.6b-v3-he-gguf
- Modelo base (ajuste fino hebreo): https://huggingface.co/thewh1teagle/parakeet-tdt-0.6b-v3-he
- Commit del modelo base usado en la conversión: https://huggingface.co/thewh1teagle/parakeet-tdt-0.6b-v3-he/commit/003720491ed0d2699a4c9e204b9ca19d6f1fe8a1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio `wavo`: https://github.com/vladkens/wavo
- Repositorio `transcribe.cpp` (commit de conversión): https://github.com/handy-computer/transcribe.cpp/tree/5bb2deb2a4afb1fd50534ecb51cfcb521ef94944
- ivrit.ai: https://www.ivrit.ai
- Modelo de etiquetado: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Código de evaluación de ivrit.ai: https://github.com/ivrit-ai/asr-training
- Conjunto de evaluación `eval-d1`: https://huggingface.co/datasets/ivrit-ai/eval-d1
- Conjunto de evaluación `eval-whatsapp`: https://huggingface.co/datasets/ivrit-ai/eval-whatsapp
- Conjunto de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Texto de la licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
