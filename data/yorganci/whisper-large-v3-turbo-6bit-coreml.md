# yorganci/whisper-large-v3-turbo-6bit-coreml

## Resumen

yorganci/whisper-large-v3-turbo-6bit-coreml es una conversión del modelo de reconocimiento automático de voz OpenAI Whisper large-v3-turbo a formato Core ML, optimizada para ejecutarse en el Neural Engine de los chips Apple Silicon (series M). El paquete lo publica el desarrollador yorganci dentro del proyecto `transcribe` y está pensado para ser cargado por la crate de Rust `transcribe-model-darwin` (`AnyModel::load`).

El modelo base, openai/whisper-large-v3-turbo, es un transformer encoder-decoder de aproximadamente 809 millones de parámetros (la variante "turbo" recorta el decoder respecto a large-v3 para reducir latencia). Esta conversión mantiene la arquitectura `whisper` (formato 3 del paquete `transcribe`) pero aplica compresión de pesos de 6 bits mediante paletas k-means por tensor en el encoder y el decoder, mientras que el frontend se deja sin comprimir. El resultado ocupa 583 MiB repartidos en 17 ficheros.

Su relevancia radica en que permite transcripción multilingüe (100 idiomas) en local sobre hardware Apple, sin GPU dedicada y sin depender de servicios en la nube, con requisito de macOS 15.0 o superior en Apple Silicon. La licencia es MIT y el paquete se distribuye como modelos Core ML compilados que aprovechan CPU y Neural Engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), convertido a Core ML |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base openai/whisper-large-v3-turbo ronda los 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por chunk; long-form mediante troceado con timestamps |
| Tipos de cuantizacion | 6 bits con paletas k-means por tensor (encoder y decoder); frontend sin comprimir; conversión base en float16 (constantes del frontend en float32) |
| Idiomas soportados | 100 idiomas (af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, cs, cy, da, de, el, en, es, et, eu, fa, fi, fo, fr, gl, gu, ha, haw, he, hi, hr, ht, hu, hy, id, is, it, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, yi, yo, yue, zh) |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (paquete `transcribe` formato 3, arquitectura `whisper`; 3 submodelos: frontend, encoder, decoder) |

## Arquitectura y entrenamiento

El modelo base openai/whisper-large-v3-turbo es un transformer encoder-decoder de tipo seq2seq, entrenado por OpenAI sobre cientos de miles de horas de audio etiquetado y pseudolabelado multilingüe. La variante "turbo" reduce el numero de capas del decoder respecto a large-v3 para abaratar la decodificación, a cambio de una pérdida pequena de precision frente al modelo grande. El entrenamiento original incluye tecnicas de supervision debil y ajuste para transcription y traduccion de voz.

Esta publicacion concreta no reentrena el modelo: es una conversion. Segun la model card, el proyecto `transcribe-models` (0.0.1, commit `f2d171f91efaba91053e99586c694d82c4238479`) porto los pesos originales a PyTorch y los convirtio a Core ML con coremltools 9.0, en float16 (con las constantes del frontend en float32). Sobre el encoder y el decoder se aplico compresion de pesos de 6 bits mediante paletas k-means por tensor. El paquete se descompone en tres submodelos: `frontend` (unidades de computo CPU, con funciones `audio_160000`, `audio_320000`, `audio_480000`), `encoder` (CPU y Neural Engine, mismas funciones) y `decoder` (CPU y Neural Engine, una unica funcion). En la primera carga, Core ML compila los modelos para el Neural Engine, lo que puede tardar de segundos a un par de minutos; las cargas posteriores son rapidas.

## Capacidades

- Reconocimiento automatico de voz (ASR) en 100 idiomas, con soporte nativo de espanol, ingles, aleman, frances, japones, chino, arabe, hindi, entre otros.
- Transcripcion de audio de 30 segundos por chunk y modo long-form con marcas de tiempo mediante troceado del audio.
- Transcripcion con marcas temporales a nivel de segmento (funcion long-form con timestamps reportada en la evaluacion).
- Ejecucion local en Apple Silicon aprovechando CPU y Neural Engine, sin dependencia de servicios externos.
- Carga mediante la crate de Rust `transcribe-model-darwin` (API `AnyModel::load` + `Transcriber::transcribe`) y la crate auxiliar `transcribe-core`.
- Verificacion de integridad de los ficheros descargados a partir de `manifest.json` (tamano y SHA-256 por fichero).
- No se documentan capacidades de traduccion de voz, diarizacion de hablantes, tool calling ni modo de razonamiento en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones en local sobre un Mac con Apple Silicon: el modelo procesa audio en ventanas de 30 s y permite flujo long-form con timestamps, sin enviar datos a la nube, lo que ayuda a cumplir requisitos de privacidad.
- Subtitulado automatico de videos multilingues: al soportar 100 idiomas y salida con marcas temporales, se puede integrar en un pipeline que genere ficheros SRT/VTT a partir de la pista de audio.
- Dictado y notas de voz en aplicaciones macOS nativas: la crate de Rust y el formato Core ML permiten empaquetar la transcripcion dentro de una app de escritorio sin backend remoto.
- Asistentes de voz embebidos: la ejecucion en Neural Engine reduce el consumo energetico frente a la inferencia en GPU, adecuado para aplicaciones de escritorio o portatiles que funcionan de forma continua.
- Indexacion y busqueda de audio corporativo: convirtiendo reuniones, llamadas o podcasts a texto con este modelo se pueden generar indices buscables sobre archivos de audio almacenados localmente.
- Investigacion en ASR en espanol y otras lenguas: el paquete ofrece un punto de comparacion en hardware Apple y cuantizacion de 6 bits, util para medir el impacto de la compresion frente al modelo original.
- Preprocesado de datasets de audio para pipelines de NLP: transcripcion en lote sobre un Mac para alimentar tareas posteriores (resumen, analisis de sentimiento, extraccion de entidades).
- Prototipado rapido sin infraestructura GPU: al requerir unicamente macOS 15.0 en Apple Silicon, permite validar prototipos de ASR sin contratar instancias con GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con `transcribe-eval` en un Apple M4 (tasa de error en caracteres para japones, palabras en el resto):

| Conjunto | Tasa de error | Substituciones | Eliminaciones | Inserciones | Unidades de referencia |
|---|---|---|---|---|---|
| LibriSpeech test-clean, 20 utterances | 1,20 % | 3 | 1 | 2 | 500 |
| LibriSpeech test-clean, clip de 62 s, long-form con timestamps | 1,41 % | 2 | 0 | 0 | 142 |
| FLEURS de, 10 utterances | 3,79 % | 4 | 1 | 3 | 211 |
| FLEURS fr, 10 utterances | 10,32 % | 5 | 2 | 19 | 252 |
| FLEURS es, 10 utterances | 5,08 % | 7 | 3 | 3 | 256 |
| FLEURS ja, 10 utterances | 3,46 % | 12 | 3 | 1 | 462 |

No se han publicado en la informacion disponible comparaciones directas contra el modelo original sin cuantizar ni contra otras conversiones Core ML.

## Requisitos de hardware

- Plataforma: macOS 15.0 o superior sobre Apple Silicon (series M). No compatible con Macs Intel ni con otros sistemas operativos.
- Almacenamiento: 583 MiB en 17 ficheros segun el repositorio (tamano aproximado de 0,6 GB).
- Memoria unificada: no se especifica un minimo en la model card; al tratarse de submodelos Core ML compilados, cabria esperar un consumo moderado, pero el dato concreto no esta disponible.
- GPU y aceleradores: el calculo se reparte entre CPU y Neural Engine de los chips Apple Silicon (M1 en adelante). No utiliza GPU discretas tipo A100, H100 o RTX 4090.
- Cabe en equipos de consumo: si, siempre que sean Macs con Apple Silicon y macOS 15.0 o superior.
- Opciones de despliegue: la ruta documentada es la crate de Rust `transcribe-model-darwin` sobre el paquete `transcribe` (formato 3). No se documentan rutas oficiales para vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto es Core ML y no un modelo GGUF/safetensors generico.
- Latencia y throughput: la model card indica que la primera carga compila los modelos para el Neural Engine (de segundos a un par de minutos) y que las cargas posteriores son rapidas, pero no publica cifras de latencia por segundo de audio ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yorganci/whisper-large-v3-turbo-6bit-coreml | no disponible (base ~809 M) | 30 s por chunk, long-form por troceado | Core ML, 6 bits k-means por tensor | MIT | Ejecucion en Neural Engine de Apple Silicon; resultados de error publicados en LibriSpeech y FLEURS |
| openai/whisper-large-v3-turbo (original) | no disponible en esta ficha (referencia publica ~809 M) | 30 s por chunk, long-form por troceado | PyTorch (.pt) | MIT | Pesos de referencia; sin cuantizar; pensado para GPU/CPU genericas |
| Conversiones whisper.cpp / GGUF de large-v3-turbo | no disponible | 30 s por chunk | GGUF con cuantizaciones de 4 a 8 bits tipicamente | MIT | Orientadas a CPU y Metal, no a Neural Engine; ampliamente usadas en herramientas de escritorio |
| Otros modelos Core ML de Whisper | no disponible | 30 s por chunk | Core ML | habitualmente MIT | Publicaciones de la comunidad con distintos esquemas de cuantizacion; sin datos comparables aportados aqui |

Los datos de parametros y rendimiento de las alternativas no estan incluidos en la informacion proporcionada, por lo que no se realiza una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Requiere macOS 15.0 o superior y Apple Silicon; no es portable a Linux, Windows, CUDA ni a GPU discretas.
- La ventana de audio es de 30 s por chunk; el modo long-form depende de troceado y puede degradar la coherencia en audios largos con cambios de idioma o de hablante.
- La cuantizacion a 6 bits con paletas k-means reduce el tamano, pero puede introducir perdida de precision respecto al modelo original (no se publica comparacion directa).
- Los resultados publicados se han obtenido en subconjuntos muy pequenos (10 a 20 utterances por conjunto), por lo que las tasas de error no deben extrapolarse a produccion sin validacion propia.
- La tasa de error reportada en FLEURS fr (10,32 %) es notablemente superior a la de de, es y ja, lo que sugiere un comportamiento desigual entre idiomas.
- No se documentan mecanismos de mitigacion de sesgos ni evaluaciones demograficas; los sesgos del corpus original de Whisper pueden persistir.
- Riesgo de alucinacion tipico en modelos ASR seq2seq, especialmente con audio ruidoso, silencios largos o dominios alejados del entrenamiento.
- Licencia MIT, sin restricciones explicitas para uso comercial segun la model card, siempre que se respeten las condiciones de la licencia del modelo base.
- La integridad de los ficheros debe comprobarse contra `manifest.json` (tamano y SHA-256); no se documenta un instalador oficial que lo automatice.
- No se publican cifras de latencia, throughput ni consumo de memoria, lo que dificulta planificar capacidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yorganci/whisper-large-v3-turbo-6bit-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio del proyecto transcribe: https://github.com/atahanyorganci/transcribe
- Pesos originales de OpenAI (large-v3-turbo): https://openaipublic.azureedge.net/main/whisper/models/aff26ae408abcba5fbf8813c21e62b0941638c5f6eebfb145be0c9839262a19a/large-v3-turbo.pt
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- Herramienta coremltools: https://github.com/apple/coremltools
