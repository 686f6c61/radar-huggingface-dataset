# TriLinSL/nemotron-3.5-asr-streaming-si-ta-en-165h-modes-mwer

## Resumen

El modelo `TriLinSL/nemotron-3.5-asr-streaming-si-ta-en-165h-modes-mwer` es un sistema de reconocimiento automatico del habla (ASR) en streaming de caracter trilingue (cingales, tamil e ingles), desarrollado por el usuario TriLinSL a partir de la familia Nemotron de NVIDIA. Se trata de un ajuste fino del checkpoint `nemotron-3.5-asr-streaming-si-ta-en-165h-modes-continued`, que a su vez deriva de un modelo entrenado sobre 165 horas de audio en modo "modes" (con prompts y look-aheads especificos). El modelo resuelve el problema del reconocimiento de habla con cambio de codigo (code-switching) entre lenguas de Sri Lanka y el ingles, un escenario especialmente dificil para los ASR convencionales.

La innovacion principal de esta version es la incorporacion de entrenamiento MWER (Minimum Word Error Rate), una tecnica de ajuste discriminativo que optimiza directamente la tasa de error de palabras en lugar de la verosimilitud. Para cada clip de entrenamiento el modelo genera sus 4 mejores hipotesis mediante beam search y se incrementa la probabilidad de aquellas con menos errores, combinando la perdida MWER con un 0,1 de la perdida RNNT sobre la referencia (manteniendo FastEmit).

El checkpoint publicado corresponde al final de la ronda 2 de tres rondas de entrenamiento MWER, seleccionado por el mejor resultado de validacion. Con un tamano de repositorio de 10 GB y 189 descargas, esta pensado para desarrolladores que necesiten ASR en tiempo real para cingales, tamil e ingles en entornos con recursos limitados o con requisitos de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) en streaming, familia Nemotron |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de audio en streaming con look-ahead [56, 13]) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Cingales (si), tamil (ta), ingles (en) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | `.nemo` (checkpoint NeMo) |
| Tamano del repositorio | 10,0 GB |
| Libreria | NeMo |
| Look-ahead | [56, 13] |
| Entrenamiento | 76 h de clips (~25 h por idioma), 3 rondas MWER |

## Arquitectura y entrenamiento

El modelo es un RNNT (transducer) de streaming, la arquitectura tipica de la familia Nemotron ASR de NVIDIA, disenada para transcripcion incremental con baja latencia. El checkpoint parte del modelo base `nemotron-3.5-asr-streaming-si-ta-en-165h-modes-continued`, que a su vez se entreno sobre 165 horas de audio en tres modos: cingales+ingles, tamil+ingles e ingles puro. El streaming se gestiona mediante look-aheads de [56, 13], que definen cuanta informacion futura puede consultar el modelo en cada paso de decodificacion.

El ajuste fino MWER se realizo sobre 76 horas de clips de entrenamiento (aproximadamente 25 horas por idioma, incluyendo todos los clips de YouTube, BizBrains y Svarah), en 3 rondas con nuevas hipotesis generadas en cada una. La funcion de perdida combina MWER con 0,1 veces la perdida RNNT sobre la referencia, manteniendo la tecnica FastEmit. El checkpoint publicado corresponde al final de la ronda 2, que obtuvo el mejor resultado de validacion. Se conservan los mismos modos, prompts y look-aheads que en el entrenamiento original.

## Capacidades

- Reconocimiento automatico del habla en streaming para cingales, tamil e ingles.
- Manejo de cambio de codigo (code-switching) cingales-ingles y tamil-ingles dentro de una misma emision.
- Decodificacion con beam search (beam 4) y decodificacion greedy.
- Generacion de listas n-best (4 mejores hipotesis) por clip, util para rescoring o analisis.
- Transcripcion incremental con look-ahead configurable ([56, 13]).
- Soporte de prompts y modos de idioma heredados del modelo base.
- No se documentan capacidades de vision, audio generativo, tool calling ni agentes.

## Casos de uso

- Subtitulado en tiempo real de emisiones de television y radio en Sri Lanka: el modelo puede transcribir de forma incremental audio que alterna cingales, tamil e ingles, adecuado para programas informativos con invitados multilingues.
- Atencion al cliente en centros de contacto de Sri Lanka: transcripcion en vivo de llamadas que mezclan cingales o tamil con terminos tecnicos en ingles, con look-ahead reducido para baja latencia.
- Generacion de subtitulos para plataformas de video (YouTube, BizBrains): el modelo se entreno con clips de estas fuentes, por lo que esta adaptado al dominio y puede producir transcripciones con marcas de tiempo.
- Analisis de reuniones y entrevistas multilingues: transcripcion de conversaciones donde los hablantes alternan idiomas, con la lista n-best disponible para revision humana posterior.
- Investigacion linguistica y creacion de corpus: el modelo permite anotar grandes volumenes de audio en cingales y tamil, incluyendo el fenomeno del code-switching, para estudios sociolinguisticos.
- Sistemas de accesibilidad para hablantes de cingales y tamil: dictado y transcripcion en aplicaciones de asistencia, aprovechando el modo streaming para respuesta inmediata.
- Pipelines de moderacion de contenido en audio: transcripcion rapida de material subido por usuarios en estos idiomas para deteccion de contenido inapropiado.

## Benchmarks y rendimiento

Resultados de validacion del autor (wer_np, look-ahead [56, 13], beam 4):

| Idioma | Antes de MWER | Despues de MWER |
|---|---|---|
| Cingales | 34,07 | 33,74 |
| Tamil | 34,78 | 33,79 |
| Ingles | 6,60 | 6,51 |
| **Media** | 25,15 | **24,68** |

Decodificacion greedy: media 25,90 antes de MWER y 25,67 despues.

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estandar no aplican a un modelo ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 10 GB, lo que sugiere que el checkpoint completo puede requerir del orden de 10 GB o mas en memoria.
- GPU recomendadas: no disponible; por el tamano del checkpoint, se puede inferir que requiere GPU con al menos 12-16 GB de VRAM, aunque no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en RTX 4090 (24 GB) si el checkpoint cabe en memoria, pero no hay datos oficiales.
- Opciones de despliegue: NeMo (via `ASRModel.restore_from`), con soporte de streaming nativo. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR NeMo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto/look-ahead | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron 3.5 ASR streaming si-ta-en + MWER) | si, ta, en | RNNT streaming | [56, 13] | other | HuggingFace, 189 descargas |
| TriLinSL/nemotron-3.5-asr-streaming-si-ta-en-165h-modes-continued (modelo base) | si, ta, en | RNNT streaming | [56, 13] | other | HuggingFace |
| Modelos ASR multilingues genericos (p. ej. Whisper de OpenAI) | Multiples (incluye en, no si/ta de forma nativa) | Encoder-decoder transformer | No streaming nativo | MIT/Apache segun variante | Amplia disponibilidad |

No se dispone de datos de benchmarks comparativos directos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Las tasas de error de palabras son elevadas para cingales (33,74) y tamil (33,79), lo que limita su uso en produccion sin revision humana o adaptacion adicional.
- El modelo esta especializado en tres idiomas y modos concretos; no se ha validado su comportamiento fuera de ese dominio.
- Riesgo de alucinacion y errores en segmentos con ruido, acentos no vistos o cambio de codigo intenso.
- La licencia es "other": no se especifican los terminos exactos, por lo que es imprescindible revisar las condiciones antes de un uso comercial.
- El modelo deriva de la familia Nemotron de NVIDIA, cuyos terminos de licencia originales pueden aplicar en cascada.
- El checkpoint publicado corresponde a la ronda 2 de 3; no se garantiza que sea el optimo global.
- No se documentan sesgos especificos, pero al entrenarse con clips de YouTube, BizBrains y Svarah puede heredar sesgos de esas fuentes.
- No hay informacion sobre cuantizacion ni sobre rendimiento en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/TriLinSL/nemotron-3.5-asr-streaming-si-ta-en-165h-modes-mwer
- Modelo base: https://huggingface.co/TriLinSL/nemotron-3.5-asr-streaming-si-ta-en-165h-modes-continued
- NeMo (libreria): https://github.com/NVIDIA/NeMo
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
