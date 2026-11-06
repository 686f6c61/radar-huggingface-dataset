# TRiLinLID/ambernet-lid-si-ta-en-v1

## Resumen

TriLinLID V1 es un modelo de identificacion de idioma (language ID, LID) en tiempo real especializado en distinguir entre cingales (si), tamil (ta) e ingles (en), con una cuarta clase adicional para no-habla (ns). Lo desarrolla el usuario TRiLinLID como un fine-tuning de `nvidia/langid_ambernet`, el modelo AmberNet de NVIDIA entrenado originalmente sobre VoxLingua107. El modelo resuelve un problema muy concreto: elegir automaticamente el modo de reconocimiento de voz (ASR) en un sistema bilingue cingales+ingles o tamil+ingles a partir de los primeros segundos de habla en directo.

La arquitectura subyacente es AmberNet, una red neuronal del ecosistema NVIDIA NeMo orientada a clasificacion de audio, reentrenada con una cabeza de 4 clases. El modelo esta disenado para operar en streaming con trozos de 0,25 s y tomar una decision temprana (mediana de 1,05 s de habla antes de decidir). El repositorio ocupa 7,4 GB y se distribuye en formato `.nemo`.

Es relevante ahora porque cubre un par de idiomas (cingales y tamil) poco representados en los sistemas LID comerciales, y porque su enfoque de streaming con calibracion de temperatura y reglas de decision explicitas lo hace directamente desplegable en pipelines de ASR en produccion para el sur de Asia y comunidades diasporicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AmberNet (red de clasificacion de audio de NVIDIA NeMo) con cabeza de 4 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de streaming de 4,0 s (hop 0,25 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | cingales (si), tamil (ta), ingles (en), no-habla (ns) |
| Licencia | other (AmberNet bajo terminos NGC de NVIDIA) |
| Formato de pesos | `.nemo` (NeMo), mas `calibration.json` y `lid_stream.py` |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/langid_ambernet` y se afina con una nueva cabeza de clasificacion de 4 clases: `si`, `ta`, `en` y `ns`. El entrenamiento usa recortes de 0,5 a 5 s con aumentacion independiente del idioma: ruido, eco de sala, ecualizacion de microfono, banda telefonica, codecs, babble y fondos reales de corpus mezclados entre idiomas. Tambien aplica consistencia entre recortes cortos y largos y un adversario de fuente intra-idioma para evitar que el modelo aprenda a distinguir la fuente de grabacion en lugar del idioma.

Los datos de entrenamiento combinan, para cingales, OpenSLR y clips puros de YouTube/BizBrains; para tamil, Common Voice e IndicTTS; y para ingles, Svarah, LibriTTS-R y clips en ingles grabados dentro de los corpus de cingales y tamil. El dataset asociado es `TriLingDATA/si-ta-en-asr`. La huella del entrenamiento es `228df918d465` y el mejor checkpoint se alcanzo en el paso 26000. La calibracion aplica temperatura 1,719 (ya incorporada en el `.nemo`) y un margen cingales/tamil de 3,55.

## Capacidades

- Clasificacion de idioma entre cingales, tamil e ingles, con deteccion explicita de no-habla.
- Operacion en streaming con trozos de 0,25 s y ventana de 4,0 s.
- Decision temprana: mediana de 1,05 s de habla antes de emitir la etiqueta.
- Salida con etiqueta de idioma, modo de ASR sugerido (`si+en`, `ta+en`, `en`) y nivel de confianza.
- Regla de streaming configurable: `hop_s` 0,25, `window_s` 4,0, `min_speech_s` 0,8, `en_prob` 0,9, `en_min_speech_s` 2,0, `max_wait_s` 6,0, `hard_cap_s` 8,0.
- Integracion con el ecosistema NeMo y API Python (`StreamingLID`, `load_nemo_predict_fn`).
- No soporta generacion de texto, tool calling, agentes ni vision; es un clasificador de audio.

## Casos de uso

- Enrutado automatico de ASR en centros de atencion al cliente: el modelo escucha los primeros segundos de la llamada y selecciona el modo cingales+ingles o tamil+ingles antes de arrancar el reconocedor, evitando ejecutar dos modelos en paralelo.
- Asistentes de voz bilingues en dispositivos: con 1,05 s de mediana hasta la decision, permite cambiar el idioma del dialogo sin que el usuario lo indique explicitamente.
- Transcripcion de reuniones y entrevistas en Sri Lanka y diaspora: segmenta el audio por idioma para alimentar el ASR correcto en cada tramo.
- Moderacion y analitica de contenido audiovisual: clasifica horas de video o podcast por idioma para indexacion, subtitulado o busqueda.
- Filtrado de no-habla en pipelines de audio: la clase `ns` con 100 % de deteccion en test permite descartar silencios y musica antes de invocar el ASR.
- Sistemas de subtitulado en directo para television o streaming: la regla de decision temprana y el `hard_cap_s` de 8,0 s acotan la latencia maxima por segmento.
- Investigacion en LID de lenguas de bajos recursos: sirve como linea base afinable para cingales y tamil, idiomas con poca cobertura en modelos LID generalistas.

## Benchmarks y rendimiento

Resultados publicados en la model card (recortes desde el inicio de cada clip):

| Fuente | clean 1s | clean 2s | clean full | live 1s | live 2s | live full |
|---|---:|---:|---:|---:|---:|---:|
| en:libritts_r | 100 | 100 | 100 | 98,3 | 100 | 99,3 |
| en:svarah_english | 95,3 | 99,6 | 99,7 | 91,6 | 96,5 | 98,7 |
| si:bizbrains_sinhala | 100 | 100 | 100 | 100 | 100 | 100 |
| si:openslr_sinhala | 92 | 96,7 | 99,3 | 91,3 | 95,1 | 98,3 |
| si:youtube_sinhala | 92 | 98,8 | 100 | 94,5 | 97,5 | 99,4 |
| ta:common_voice_tamil | 72,7 | 95,9 | 99 | 62,3 | 87,8 | 95,3 |
| ta:indic_tts_tamil | 94,6 | 99,5 | 99,1 | 89,2 | 99,5 | 98,2 |

Metricas globales: exactitud macro 95,5 %, confusion cingales-tamil 1,75 %, no-habla detectada 100,0 %. La exactitud sobre fuentes no usadas en entrenamiento figura como no disponible (n/a).

Simulacion de streaming (trozos de 0,25 s): exactitud de decision 98,9 %, errores cingales-tamil 0,50 %, decision antes de terminar el clip en el 90 % de los casos, mediana de 1,05 s de habla antes de decidir.

| Grupo | n | acc | early | mediana habla (s) |
|---|---:|---:|---:|---:|
| en:libritts_r | 300 | 1,000 | 0,760 | 2,055 |
| en:svarah_english | 300 | 0,990 | 0,803 | 2,070 |
| si:bizbrains_sinhala | 10 | 1,000 | 1,000 | 0,885 |
| si:openslr_sinhala | 300 | 0,997 | 0,980 | 0,990 |
| si:youtube_sinhala | 163 | 1,000 | 0,982 | 0,990 |
| ta:common_voice_tamil | 300 | 0,963 | 0,937 | 0,990 |
| ta:indic_tts_tamil | 223 | 0,991 | 0,973 | 0,960 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el ejemplo de uso de la model card ejecuta la inferencia en CPU (`device="cpu"`).
- GPU recomendadas: no especificadas por el autor; AmberNet es un modelo de audio compacto y no requiere GPU de datacenter para inferencia en tiempo real.
- GPU de consumo: plausible en tarjetas consumer por el perfil de AmberNet, aunque no hay cifras publicadas.
- Despliegue: NeMo (formato `.nemo`) con el script `lid_stream.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: mediana de 1,05 s de habla hasta la decision; `max_wait_s` 6,0 y `hard_cap_s` 8,0 como cotas superiores.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Parametros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRiLinLID ambernet-lid-si-ta-en-v1 | si, ta, en, ns | no disponible | streaming 0,25 s / ventana 4,0 s | other (NGC) | Hugging Face |
| nvidia/langid_ambernet | ~107 idiomas (VoxLingua107) | no disponible | no disponible | other (NGC) | Hugging Face / NGC |
| Whisper (large) como LID implicito | multilingue amplio | ~1550 M (large) | 30 s | MIT (variantes) | Hugging Face / OpenAI |

AmberNet original cubre muchas mas lenguas, pero no esta especializado en la confusion cingales-tamil ni ofrece la clase de no-habla ni la logica de streaming calibrada. Whisper puede usarse como detector de idioma implicito, pero es un modelo de ASR mucho mas pesado y con latencia mayor, poco adecuado para enrutado en tiempo real de llamadas.

## Limitaciones y advertencias

- Entrenado sobre corpus de estilo lectura y locucion; el autor recomienda validar con los microfonos propios antes de produccion.
- La exactitud sobre fuentes no vistas en entrenamiento no se ha medido (n/a), por lo que el rendimiento fuera de dominio es incierto.
- El tamil de Common Voice es el punto mas debil: 72,7 % en clean 1s y 62,3 % en live 1s.
- Confusion cingales-tamil residual del 1,75 % en test y 0,50 % en streaming; en dominios acusticamente dificiles puede crecer.
- Solo cubre tres idiomas; cualquier otra lengua se clasificara erroneamente entre las clases disponibles.
- La licencia es "other" y AmberNet se distribuye bajo los terminos NGC de NVIDIA: hay que revisarlos antes de uso comercial.
- Riesgo de alucinacion no aplica (es un clasificador), pero si de falsos positivos en audio musical o ruidoso pese a la clase `ns`.
- No hay datos publicados de cuantizacion ni de rendimiento en GPU, lo que limita la planificacion de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v1
- Variante smoke: https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v1-smoke
- Modelo base: https://huggingface.co/nvidia/langid_ambernet
- Dataset de entrenamiento: https://huggingface.co/datasets/TriLingDATA/si-ta-en-asr
