# x-ion-org/NVIDIA-SCRUTIUM-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-SCRUTIUM-3.5-Transcribe-30B-A4B es un modelo de reconocimiento automático del habla (ASR) desarrollado por x-ion-org sobre la base de nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16. Se distribuye con la librería NeMo y el formato nemo_speechlm, y está orientado a tareas de transcripción, traducción de voz, diarización de hablantes, identificación de idioma y respuesta a preguntas sobre audio. El modelo combina un backbone de lenguaje de tipo MoE (30B parámetros totales, aproximadamente 3B activos según la nomenclatura A3B del modelo base) con un codificador de audio, lo que da lugar a un total de 33.697.781.029 parámetros en el checkpoint.

El modelo cubre 40 idiomas, incluyendo inglés, español, francés, alemán, chino, japonés, árabe, hindi y una amplia representación de lenguas europeas, además de soportar cambios de código (code-switching) y audio de formato largo con marcas de tiempo. Está pensado para flujos de trabajo de producción que requieren transcripción multilingüe fiable y capacidades de instrucción sobre el contenido de audio.

Su relevancia radica en la integración de un LLM de gran escala con un stack de audio en un único checkpoint NeMo, lo que permite cubrir ASR, traducción de voz y question answering sobre audio sin encadenar varios modelos. El acceso está restringido (gated) en HuggingFace y la licencia es OpenMDW-1.1, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo SpeechLM sobre backbone Nemotron-3.5 Lightning (MoE transformer + codificador de audio) |
| Parametros totales | 33.697.781.029 |
| Parametros activos | no disponible (la nomenclatura del modelo base es A3B, aprox. 3B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (acceso restringido/gated en HuggingFace) |
| Formato de pesos | safetensors (formato NeMo nemo_speechlm) |

## Arquitectura y entrenamiento

El modelo es un SpeechLM de NeMo que combina un codificador de audio con el backbone Nemotron-3.5 Lightning 30B-A3B, un transformer de mezcla de expertos (MoE) con 30B parámetros totales y aproximadamente 3B activos por token, según la nomenclatura del modelo base. El checkpoint resultante tiene 33.697.781.029 parámetros, lo que refleja la adición del stack de audio sobre el LLM. La arquitectura está etiquetada como nemo_speechlm y la tarea principal es text2text-generation, con soporte para ASR, traducción de voz y question answering sobre audio.

Los datos de entrenamiento indicados en la ficha de HuggingFace apuntan al dataset nvidia/Granary-v2, un corpus de audio multilingüe de NVIDIA. No se dispone de información sobre el número exacto de tokens de audio o texto utilizados, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia integración multimodal audio-texto y el soporte de audio de formato largo con marcas de tiempo.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en 40 idiomas.
- Traducción de voz (speech translation) entre idiomas soportados.
- Diarización de hablantes (speaker diarization) para separar interlocutores.
- Identificación de idioma (language identification) en el audio.
- Manejo de cambios de código (code-switching) dentro de una misma emisión.
- Transcripción de audio de formato largo con marcas de tiempo (timestamps).
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones (instruction-following) sobre contenido de audio.
- Generación de texto a partir de audio (pipeline text2text-generation).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de formato largo con marcas de tiempo y diarización, lo que permite generar actas con intervenciones atribuidas a cada hablante en entornos corporativos multilingües.
- Subtitulado y localización de vídeo: gracias a la traducción de voz y a los timestamps, se pueden generar subtítulos traducidos directamente desde la pista de audio original, reduciendo la cadena de herramientas.
- Atención al cliente y análisis de llamadas: la combinación de ASR, diarización e identificación de idioma permite transcribir y analizar conversaciones de contact center en varios idiomas y extraer métricas de calidad.
- Documentación clínica o legal dictada: la transcripción con marcas de tiempo y separación de hablantes facilita la revisión posterior y el cumplimiento de trazabilidad en sectores regulados.
- Búsqueda y question answering sobre archivos de audio: el modelo puede responder preguntas directas sobre el contenido de una grabación, útil para archivos de medios, podcasts y repositorios de formación.
- Investigación lingüística y corpus multilingües: el soporte de 40 idiomas y code-switching permite construir y anotar corpus en lenguas menos representadas con un único modelo.
- Accesibilidad: generación de transcripciones y traducciones para contenido audiovisual dirigido a personas con discapacidad auditiva o hablantes de otras lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en BF16 ocupa aproximadamente 67,5 GB, por lo que requiere al menos 80 GB de VRAM para cargarse sin cuantización adicional.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs con memoria equivalente; el tamaño del repo (67,5 GB) descarta su carga completa en GPUs de consumo sin cuantización.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en modelos inferiores en BF16; se requeriría cuantización, para la que no se documentan formatos disponibles.
- Opciones de despliegue: la librería indicada es NeMo; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| NVIDIA-SCRUTIUM-3.5-Transcribe-30B-A4B | 33,7B totales (MoE, ~3B activos) | no disponible | 40 | OpenMDW-1.1 | Gated |
| Whisper large-v3 | no disponible en la informacion | no disponible | ~99 | MIT (modelo abierto) | Abierto |
| nvidia/Canary | no disponible en la informacion | no disponible | no disponible | no disponible | Abierto/gated segun variante |

La comparativa con alternativas concretas no puede completarse con datos verificados en la información proporcionada; los datos de Whisper y Canary no se han confirmado en esta ficha y se indican como no disponibles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace y requiere aceptar condiciones antes de su descarga.
- Licencia OpenMDW-1.1: es necesario revisar los términos para uso comercial, ya que no es una licencia permisiva estándar tipo Apache 2.0 o MIT.
- Riesgo de alucinación: al integrar un LLM generativo, las transcripciones y respuestas sobre audio pueden contener contenido inventado, especialmente en audio con ruido o idiomas poco representados.
- Cobertura lingüística desigual: aunque se listan 40 idiomas, no se documenta el rendimiento por idioma; los idiomas con menos datos pueden degradarse.
- Sin datos de benchmarks: no hay métricas publicadas de WER, BLEU u otras que permitan estimar la calidad real frente a alternativas.
- Requisitos de hardware elevados: 67,5 GB de checkpoint limitan el despliegue a infraestructura con GPUs de 80 GB o cuantización no documentada.
- Sin información sobre contexto máximo ni sobre el manejo de audio de muy larga duración más allá de la etiqueta long-form-audio.

## Enlaces

- HuggingFace: https://huggingface.co/x-ion-org/NVIDIA-SCRUTIUM-3.5-Transcribe-30B-A4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper de referencia (arXiv 2310.09424): https://arxiv.org/abs/2310.09424
- DOI de la ficha: https://doi.org/10.57967/hf/11406
