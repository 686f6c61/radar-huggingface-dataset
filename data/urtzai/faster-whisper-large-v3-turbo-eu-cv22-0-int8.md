# urtzai/faster-whisper-large-v3-turbo-eu-cv22.0-int8

## Resumen

`faster-whisper-large-v3-turbo-eu-cv22.0-int8` es un modelo de reconocimiento automatico del habla (ASR) especializado en euskera (`eu`), publicado por el usuario `urtzai` en formato CTranslate2 con cuantizacion int8. No se trata de un modelo entrenado desde cero, sino de una conversion de formato y cuantizacion del fine-tune `zuazo/whisper-large-v3-turbo-eu-cv22.0`, que a su vez deriva de `openai/whisper-large-v3-turbo` ajustado sobre el corpus Common Voice 22.0 en euskera.

El objetivo del artefacto es doble: por un lado, ofrecer una version optimizada para inferencia con la libreria `faster-whisper` (basada en el motor CTranslate2), que reduce el consumo de memoria y acelera la decodificacion respecto al modelo original en PyTorch; por otro, facilitar su integracion directa en Home Assistant como motor de transcripcion para asistentes de voz en euskera.

Su relevancia es acotada pero clara: cubre un idioma de bajos recursos como el euskera con un modelo derivado de Whisper large-v3-turbo, empaquetado en 820 MB (frente a los varios GB del modelo original en fp16) y con licencia MIT, lo que permite uso comercial sin restricciones adicionales. La ficha se limita a describir lo que la model card y los metadatos exponen; no hay informacion publicada sobre evaluaciones de calidad del fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) large-v3-turbo, convertido a CTranslate2 |
| Parametros totales | no disponible (deriva de Whisper large-v3-turbo; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | int8 (unico publicado en este repo) |
| Idiomas soportados | euskera (`eu`) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | CTranslate2 (`model.bin`), con `tokenizer.json`, `preprocessor_config.json` y `generation_config.json` |
| Tamano del repo | 0,8 GB |
| Libreria | ctranslate2 / faster-whisper |
| Pipeline | automatic-speech-recognition |
| Modelo base | `zuazo/whisper-large-v3-turbo-eu-cv22.0` |
| Dataset de ajuste | Common Voice 22.0 (`eu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio y traduccion. El modelo original de OpenAI se entreno sobre un corpus multilingue muy amplio de audio y texto; el fine-tune de `zuazo` adapta esos pesos al euskera usando Common Voice 22.0. La model card no detalla hiperparametros, numero de pasos, composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (en ASR no es habitual; no hay informacion al respecto).

La contribucion de este repositorio concreto es exclusivamente de ingenieria de despliegue: se ejecuta `ct2-transformers-converter` con `--quantization int8` sobre el modelo de `zuazo`, copiando los ficheros de tokenizer y configuracion. No hay reentrenamiento ni modificacion de pesos mas alla de la cuantizacion. El resultado es un artefacto de 820 MB que puede ejecutarse en CPU con `compute_type="int8"`, con mejor rendimiento en CPUs con AVX2 segun las notas del autor. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Transcripcion de voz a texto en euskera (`eu`) a partir de audio.
- Deteccion de idioma integrada en faster-whisper, aunque el autor recomienda fijar `language="eu"` porque la deteccion automatica es mucho mas lenta.
- Decodificacion con beam search configurable (`beam_size`), lo que permite ajustar el equilibrio entre velocidad y calidad.
- Ejecucion en CPU sin GPU, gracias a la cuantizacion int8 y al motor CTranslate2.
- Integracion directa con Home Assistant mediante la app Whisper (modelo personalizado) y el pipeline Assist en euskera.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Asistente de voz domotico en euskera: integrado en Home Assistant como motor de transcripcion de la app Whisper, permite dictar comandos en euskera al pipeline Assist y controlar dispositivos por voz sin depender de servicios en la nube.
- Transcripcion de reuniones y actas en euskera: el modelo puede procesar grabaciones y generar texto para documentacion interna, aprovechando que corre en CPU y no requiere GPU dedicada.
- Subtitulado de contenido audiovisual en euskera: util para television, radios o canales de YouTube en euskera que necesitan subtitulos automaticos; el formato CTranslate2 permite procesar por lotes con faster-whisper.
- Investigacion en lenguas de bajos recursos: sirve como punto de partida reproducible para experimentos de ASR en euskera, ya que la receta de conversion esta documentada y el modelo base es publico.
- Prototipado rapido en entornos sin GPU: al ejecutarse en CPU con int8, permite desplegar un servicio de transcripcion en un portatil o servidor modesto para validar productos de voz en euskera.
- Accesibilidad: transcripcion de audio a texto para personas con discapacidad auditiva en contextos donde el euskera es la lengua principal (administracion, educacion, medios publicos).
- Pipelines de datos: generacion de transcripciones para construir corpus de euskera etiquetados, que luego pueden alimentar otros modelos de lenguaje o sistemas de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER (word error rate) sobre Common Voice, FLEURS ni ningun otro conjunto de evaluacion, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuracion documentada; el modelo esta pensado para CPU con `compute_type="int8"`. En GPU, la huella de pesos ronda los 0,8 GB en int8, aunque no se documenta el consumo de activaciones.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA puede ejecutar faster-whisper, pero no hay cifras publicadas de latencia ni throughput para este artefacto.
- CPU: el autor indica que funciona en CPU pura y que es notablemente mas rapido en CPUs con AVX2. La calidad es maxima pero la velocidad es la mas baja en CPU pura, segun sus notas (encoder grande).
- Cabe en GPU de consumo: si, por tamano de pesos (0,8 GB), aunque no hay datos de rendimiento que lo confirmen.
- Opciones de despliegue: `faster-whisper` (libreria principal), CTranslate2 directamente, Home Assistant (app Whisper con modelo personalizado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a Whisper.
- Latencia y throughput: no disponibles. El autor solo senala cualitativamente que fijar `language="eu"` acelera frente a la deteccion automatica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `urtzai/faster-whisper-large-v3-turbo-eu-cv22.0-int8` | no disponible (deriva de large-v3-turbo) | segmentos de 30 s (Whisper) | eu | MIT | CTranslate2 int8 | Conversion del fine-tune de `zuazo`; 820 MB |
| `zuazo/whisper-large-v3-turbo-eu-cv22.0` | no disponible | segmentos de 30 s (Whisper) | eu | no disponible en esta ficha | safetensors/PyTorch (no confirmado) | Modelo base del que deriva; fine-tune sobre Common Voice 22.0 |
| `openai/whisper-large-v3-turbo` | no disponible | segmentos de 30 s (Whisper) | multilingue | MIT (Whisper) | PyTorch, CTranslate2 (comunidad) | Modelo original de OpenAI; sin ajuste especifico a euskera |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento ni de otros modelos ASR en euskera en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta euskera (`eu`); no es un modelo multilingue utilizable en castellano u otros idiomas.
- No hay evaluacion publicada de calidad (WER) sobre este artefacto ni sobre el fine-tune del que deriva, por lo que el rendimiento real en produccion es desconocido.
- La cuantizacion int8 puede introducir una perdida de precision respecto al modelo en fp16; el autor no cuantifica esa degradacion.
- La deteccion automatica de idioma es lenta; se recomienda fijar `language="eu"`, lo que limita su uso en escenarios con audio de idioma desconocido.
- En CPU pura la velocidad es la mas baja segun el autor; sin AVX2 el rendimiento puede ser insuficiente para tiempo real.
- Riesgo de alucinacion inherente a Whisper en segmentos con silencio, ruido o audio musical; no se documentan mitigaciones especificas.
- Sesgos: no se documentan analisis de sesgos por acento, edad o genero en el corpus Common Voice 22.0.
- Licencia MIT heredada: permite uso comercial, pero conviene verificar las condiciones del dataset Common Voice y del modelo base original de OpenAI.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urtzai/faster-whisper-large-v3-turbo-eu-cv22.0-int8
- Modelo base (fine-tune en euskera): https://huggingface.co/zuazo/whisper-large-v3-turbo-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Dataset Common Voice 22.0: https://commonvoice.mozilla.org/datasets
- Home Assistant, app Whisper: https://www.home-assistant.io/integrations/whisper/
