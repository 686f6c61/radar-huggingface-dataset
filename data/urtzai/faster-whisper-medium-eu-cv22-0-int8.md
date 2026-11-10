# urtzai/faster-whisper-medium-eu-cv22.0-int8

## Resumen

`urtzai/faster-whisper-medium-eu-cv22.0-int8` es un modelo de reconocimiento automatico del habla (ASR) para euskera (`eu`) distribuido en formato CTranslate2 con cuantizacion int8. No es un modelo entrenado desde cero: se trata de una conversion de formato y cuantizacion del fine-tune `zuazo/whisper-medium-eu-cv22.0` de Xabier de Zuazo, que a su vez parte de `openai/whisper-medium`. El resultado son los mismos pesos que el modelo original, pero empaquetados para su uso con `faster-whisper` y con la integracion Whisper de Home Assistant.

El modelo resuelve un problema muy concreto: disponer de transcripcion de voz en euskera ejecutable en CPU, sin GPU, con un consumo de memoria reducido (775 MB en int8) y compatible con pipelines de domotica local. La cuantizacion int8 permite desplegarlo en dispositivos de bajos recursos, y la arquitectura encoder-decoder de Whisper medium aporta una ventana de contexto de audio de 30 segundos por segmento, con capacidad multilingue en el modelo base aunque este fine-tune este especializado en euskera.

Su relevancia es practica: cubre un idioma de bajos recursos con un modelo abierto (licencia MIT), reproducible mediante un unico comando de conversion documentado, y orientado a un caso de uso real como es el control por voz de Home Assistant en euskera. No obstante, es un artefacto derivado: sus capacidades y limitaciones son las del fine-tune de origen, y no se han publicado evaluaciones propias en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a CTranslate2 |
| Parametros totales | 769 M (arquitectura Whisper medium; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estandar de Whisper) |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | euskera (`eu`); el modelo base Whisper es multilingue, pero este fine-tune esta especializado |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | CTranslate2 (modelo convertido con `ct2-transformers-converter`) |
| Tamano del repositorio | 0,8 GB (775 MB en int8) |
| Libreria | ctranslate2 / faster-whisper |
| Dataset de fine-tune | Common Voice 22.0 (`eu`) |
| Modelo base | `zuazo/whisper-medium-eu-cv22.0` (fine-tune de `openai/whisper-medium`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper medium de OpenAI: un transformer encoder-decoder con atencion estandar, disenado para transcripcion y traduccion de voz. El encoder procesa espectrogramas Mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Este repositorio no introduce cambios arquitectonicos: aplica `ct2-transformers-converter` con `--quantization int8` sobre los pesos del fine-tune euskera, copiando `tokenizer.json`, `preprocessor_config.json` y `generation_config.json`. Por tanto, no hay reentrenamiento ni ajuste adicional en esta conversion.

El entrenamiento original del fine-tune se realizo sobre Common Voice 22.0 en euskera, segun indica la model card. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (Whisper se entrena tipicamente con supervision, sin RLHF). La innovacion tecnica de este artefacto es el propio pipeline de conversion: cuantizacion int8 que reduce el peso a 775 MB, ejecucion en CPU con soporte de instrucciones AVX2 para acelerar la inferencia, y compatibilidad directa con `faster-whisper` y la app Whisper de Home Assistant.

## Capacidades

- Reconocimiento automatico del habla en euskera (`eu`) a partir de audio.
- Transcripcion con marcas de tiempo por segmento (la API de `faster-whisper` devuelve segmentos con `start`/`end`).
- Deteccion de idioma opcional (`info.language`, `info.language_probability`), aunque el autor recomienda fijar `language="eu"` porque la deteccion automatica es mucho mas lenta.
- Decodificacion con beam search configurable (`beam_size=5` en el ejemplo de uso).
- Ejecucion en CPU con `compute_type="int8"`; el autor indica que es notablemente mas rapido en CPU con AVX2.
- Integracion con Home Assistant mediante la app Whisper (modelo personalizado y pipeline en `eu`).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Control por voz de Home Assistant en euskera: el modelo se configura como `custom_model` en la app Whisper y el pipeline de Assist se fija en `eu`, permitiendo comandos de voz locales sin depender de servicios en la nube.
- Transcripcion de reuniones y notas de voz en euskera: procesamiento por lotes de ficheros WAV con `faster-whisper`, obteniendo segmentos con marcas de tiempo para generar actas o subtitulos.
- Subtitulado de contenido audiovisual en euskera: la salida segmentada con timestamps permite generar ficheros SRT directamente desde la API de `faster-whisper`.
- Despliegue en dispositivos sin GPU: al ejecutarse en CPU con int8 y ocupar 775 MB, es viable en mini-PC, Raspberry Pi de gama alta o servidores domésticos modestos.
- Archivado y busqueda de audio historico: transcripcion masiva de grabaciones en euskera para indexar y permitir busqueda textual sobre el contenido.
- Prototipado de asistentes conversacionales en euskera: servir la transcripcion como entrada a un LLM posterior en un pipeline de voz a texto mas generacion.
- Investigacion sobre ASR de bajos recursos: punto de partida reproducible (conversion documentada con un unico comando) para comparar fine-tunes de Whisper en euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni comparaciones numericas con otros modelos; solo menciona cualitativamente que en comandos cortos es mas rapido que la variante turbo debido a un encoder mas ligero, sin aportar cifras.

## Requisitos de hardware

- VRAM estimada: no aplica para el caso principal; el modelo esta pensado para CPU con `compute_type="int8"`. En GPU, el peso int8 de 775 MB requiere del orden de 1-2 GB de VRAM incluyendo overhead de runtime (estimacion, no publicada por el autor).
- GPU recomendadas: no especificadas en la informacion disponible; cualquier GPU compatible con CTranslate2 (por ejemplo, series RTX o A-series) puede ejecutar el modelo, pero no hay datos de rendimiento publicados.
- CPU: funciona en CPU sin GPU; el autor indica que rinde mucho mejor en CPU con AVX2.
- Cabe en hardware consumer: si, es uno de sus objetivos principales (775 MB en disco y ejecucion en CPU).
- Opciones de despliegue: `faster-whisper` (libreria Python), CTranslate2 directamente, y la app Whisper de Home Assistant con modelo personalizado.
- Latencia y throughput: no disponibles. La unica referencia es cualitativa (mas rapido que turbo en comandos cortos, deteccion automatica de idioma mas lenta que fijar `eu`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| urtzai/faster-whisper-medium-eu-cv22.0-int8 | 769 M (Whisper medium) | 30 s por segmento | eu (especializado) | MIT | CTranslate2 int8 | Conversion int8 del fine-tune de zuazo; orientado a CPU y Home Assistant |
| zuazo/whisper-medium-eu-cv22.0 | 769 M (Whisper medium) | 30 s por segmento | eu (especializado) | MIT (heredada) | safetensors/Transformers | Modelo de origen del que deriva esta conversion; requiere Transformers en lugar de CTranslate2 |
| openai/whisper-medium | 769 M | 30 s por segmento | Multilingue (99 idiomas) | MIT | safetensors/Transformers | Modelo base; cobertura multilingue pero sin fine-tune especifico en euskera |
| openai/whisper-large-v3-turbo | 809 M (segun variante) | 30 s por segmento | Multilingue | MIT | safetensors/Transformers | Alternativa mas reciente de OpenAI; el autor menciona que este modelo es mas rapido en comandos cortos, sin cifras |

Los datos de licencia y arquitectura de los modelos comparados provienen de sus fichas publicas habituales; no se dispone en la informacion proporcionada de comparaciones de WER entre ellos.

## Limitaciones y advertencias

- Es una conversion de formato y cuantizacion, no un modelo nuevo: hereda todos los sesgos y errores del fine-tune `zuazo/whisper-medium-eu-cv22.0` y de Whisper medium.
- La cuantizacion int8 puede introducir una perdida de precision en la transcripcion respecto al modelo original en float; no se han publicado mediciones de esa degradacion.
- Especializado en euskera: aunque el modelo base es multilingue, el fine-tune esta orientado a `eu` y no se garantiza un buen rendimiento en otros idiomas.
- La deteccion automatica de idioma es lenta segun el autor; en produccion conviene fijar `language="eu"`.
- Ventana de audio de 30 segundos por segmento: los audios largos requieren segmentacion, con el riesgo de cortes en fronteras de frase.
- Riesgo de alucinacion tipico de Whisper en audio con ruido, silencios o habla solapada; no se documentan mitigaciones especificas.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribucion a los autores originales (OpenAI, Xabier de Zuazo, SYSTRAN/OpenNMT) segun los creditos de la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente.
- No hay benchmarks publicados que permitan avalar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/urtzai/faster-whisper-medium-eu-cv22.0-int8
- Modelo base del fine-tune: https://huggingface.co/zuazo/whisper-medium-eu-cv22.0
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-medium
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Dataset Common Voice 22.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_22_0
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
