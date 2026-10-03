# yorganci/cohere-transcribe-03-2026-6bit-coreml

## Resumen

`yorganci/cohere-transcribe-03-2026-6bit-coreml` es un paquete de modelos Core ML compilados que porta a Apple Silicon el modelo de reconocimiento automatico del habla (ASR) `CohereLabs/cohere-transcribe-03-2026` de Cohere Labs. Lo publica el usuario yorganci dentro del proyecto `transcribe` y se distribuye como un conjunto de ficheros Core ML cuantizados a 6 bits, disenados para ejecutarse mayoritariamente en el Neural Engine de los chips de Apple.

El paquete separa el modelo en seis componentes: un `frontend` que se ejecuta solo en CPU y cuatro `encoder` mas un `decoder` que se ejecutan en CPU y Neural Engine. Cada componente expone funciones de audio (`audio_160000`, `audio_320000`, `audio_560000`) que corresponden a ventanas de 160.000, 320.000 y 560.000 muestras, es decir, 10, 20 y 35 segundos a 16 kHz. El repositorio ocupa 1.490 MiB repartidos en 29 ficheros y requiere macOS 15.0 o superior sobre Apple Silicon.

Su relevancia es practica: permite ejecutar un modelo ASR multilingue de 14 idiomas de forma local y privada en un portatil o un Mac de sobremesa con chip M-series, sin GPU dedicada y sin enviar audio a la nube. Se carga mediante la crate Rust `transcribe-model-darwin` (`AnyModel::load`) y esta licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card identifica la arquitectura del paquete como `cohere-asr`, con un `frontend`, cuatro `encoder` y un `decoder` |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; el paquete expone funciones de audio de 160.000, 320.000 y 560.000 muestras (10 s, 20 s y 35 s a 16 kHz) y admite modo long-form con timestamps |
| Tipos de cuantizacion | 6 bits con paletas k-means por tensor en `encoder_0` a `encoder_3` y `decoder`; `frontend` sin comprimir. La conversion a Core ML se hizo en float16, con las constantes del frontend en float32 |
| Idiomas soportados | 14: arabe, aleman, griego, ingles, espanol, frances, italiano, japones, coreano, neerlandes, polaco, portugues, vietnamita y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (paquete con `manifest.json` y 29 ficheros, 1.490 MiB) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo original ni su proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se conoce es la estructura del paquete Core ML resultante, que divide el grafo en un frontend de preprocesado de audio (solo CPU, con constantes en float32 y sin compresion) y cinco modulos neuronales (`encoder_0` a `encoder_3` y `decoder`) que se reparten entre CPU y Neural Engine.

La innovacion tecnica principal de este repositorio es la conversion y compresion: `transcribe-models` porto los pesos originales a PyTorch y los convirtio con coremltools 9.0, aplicando paletas k-means de 6 bits por tensor en los encoders y el decoder. La primera carga en una maquina compila los modelos para el Neural Engine (de segundos a un par de minutos); las cargas posteriores son rapidas porque el modelo ya esta compilado en el dispositivo.

## Capacidades

- Reconocimiento automatico del habla en 14 idiomas (ar, de, el, en, es, fr, it, ja, ko, nl, pl, pt, vi, zh).
- Transcripcion por lotes de enunciados cortos y modo long-form con marcas de tiempo, segun la evaluacion publicada.
- Procesamiento de audio a 16 kHz con ventanas configurables de 10, 20 o 35 segundos mediante las funciones `audio_160000`, `audio_320000` y `audio_560000`.
- Ejecucion mayoritariamente en el Neural Engine de Apple Silicon, con el frontend en CPU.
- Integracion en aplicaciones Rust mediante la crate `transcribe-model-darwin` y la API `AnyModel::load` / `Transcriber::transcribe`.
- Verificacion de integridad de los ficheros mediante `manifest.json` con tamanos y hashes SHA-256.
- No se documentan capacidades de vision, audio generativo, tool calling ni agentes; se trata exclusivamente de un modelo ASR.

## Casos de uso

- Actas de reunion locales: transcribir reuniones grabadas en un Mac sin enviar el audio a servicios externos, aprovechando el modo long-form con timestamps para generar actas con marcas temporales.
- Subtitulado de video: generar subtitulos para contenido en cualquiera de los 14 idiomas soportados ejecutando el modelo en el propio equipo de edicion, con las marcas de tiempo como base para ficheros SRT.
- Asistentes de voz de escritorio: dotar a una aplicacion macOS de dictado continuo, usando ventanas de 10 a 35 segundos para ajustar el equilibrio entre latencia y precision.
- Transcripcion de entrevistas para periodismo o investigacion cualitativa: procesar audio multilingue de campo en un portatil Apple, manteniendo la confidencialidad de las fuentes al no salir los datos del dispositivo.
- Analitica de llamadas de atencion al cliente: transcribir conversaciones en espanol, aleman, frances o portugues como paso previo a la indexacion y busqueda de texto completo.
- Accesibilidad: alimentar sistemas de subtitulado en directo o lectura asistida para personas con discapacidad auditiva, integrados en aplicaciones nativas de macOS sin dependencia de red.
- Indexacion de archivos de audio y podcasts: convertir bibliotecas de audio a texto para busqueda semantica, usando el decoder cuantizado para mantener un consumo de memoria reducido.
- Pipelines de datos en Rust: incorporar la crate `transcribe-model-darwin` a herramientas de linea de comandos o servicios locales que necesiten transcripcion por lotes sin salir del ecosistema Rust.

## Benchmarks y rendimiento

Errores medidos con `transcribe-eval` en un Apple M4; la tasa se calcula sobre caracteres en japones y sobre palabras en el resto de casos.

| Conjunto | Tasa de error | Sustituciones | Eliminaciones | Inserciones | Unidades de referencia |
|---|---|---|---|---|---|
| LibriSpeech test-clean, 20 enunciados | 0,80 % | 2 | 0 | 2 | 500 |
| LibriSpeech test-clean, clip de 62 s, long-form con timestamps | 0,70 % | 1 | 0 | 0 | 142 |
| FLEURS de, 10 enunciados | 4,26 % | 7 | 1 | 1 | 211 |
| FLEURS fr, 10 enunciados | 9,13 % | 5 | 5 | 13 | 252 |
| FLEURS es, 10 enunciados | 2,73 % | 2 | 2 | 3 | 256 |
| FLEURS ja, 10 enunciados | 2,81 % | 11 | 0 | 2 | 462 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento, ya que no son aplicables a un modelo ASR. Tampoco se aportan datos de velocidad en tiempo real (RTF) ni de throughput.

## Requisitos de hardware

- Plataforma obligatoria: macOS 15.0 o superior sobre Apple Silicon (segun la model card).
- Espacio en disco: 1.490 MiB para los 29 ficheros del paquete, mas el espacio temporal de compilacion.
- Memoria y VRAM: no se especifica el consumo de memoria unificado; al ejecutarse en el Neural Engine y la CPU, no depende de una GPU dedicada ni de VRAM independiente.
- GPU recomendadas: no aplica; el objetivo es el Neural Engine de los chips M-series de Apple. No se contemplan A100, H100 ni RTX 4090, ya que el formato es Core ML.
- Primera carga: los modelos se compilan para el Neural Engine, lo que puede tardar de segundos a un par de minutos; las cargas posteriores son rapidas.
- Opciones de despliegue: la crate Rust `transcribe-model-darwin`, que carga el paquete con `AnyModel::load` y transcribe con `Transcriber::transcribe`. No se indican soportes de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato y plataforma | Cuantizacion | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| yorganci/cohere-transcribe-03-2026-6bit-coreml | Core ML, Apple Silicon (Neural Engine + CPU) | 6 bits por tensor con k-means, float16 en la conversion | 14 | Apache-2.0 | Incluidos en este repositorio (LibriSpeech, FLEURS) |
| CohereLabs/cohere-transcribe-03-2026 (modelo base) | Pesos originales (formato no especificado en la informacion disponible) | Sin cuantizar | 14 | Apache-2.0 | No disponible en la informacion proporcionada |
| Otras alternativas ASR para Core ML (por ejemplo, ports de Whisper) | Core ML, Apple Silicon | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva este paquete; los datos de parametros, contexto y rendimiento de alternativas como los ports de Whisper a Core ML no estan disponibles en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantizacion a 6 bits con paletas k-means por tensor es una modificacion de los pesos originales; puede introducir perdida de precision respecto al modelo base, aunque no se aporta una comparacion directa entre ambos.
- Solo funciona en macOS 15.0 o superior y en hardware Apple Silicon; no hay soporte para Linux, Windows, CUDA ni otros aceleradores.
- El rendimiento medido en idiomas distintos del ingles y el espanol es desigual: en la evaluacion publicada, el frances alcanza un 9,13 % de error frente al 0,80 % del ingles, con un numero elevado de sustituciones e inserciones.
- Las muestras de evaluacion son pequenas (10 a 20 enunciados por conjunto), por lo que las tasas de error deben considerarse indicativas y no un resultado consolidado.
- Riesgo de alucinacion y de errores de sustitucion propios de los sistemas ASR, especialmente en audio con ruido, solapamiento de voces o vocabulario especializado; la propia evaluacion registra sustituciones en todas las lenguas evaluadas.
- No hay informacion sobre sesgos demograficos, acentos o variedades dialectales, ni sobre el tratamiento de audio no vocal.
- La licencia Apache-2.0 permite uso comercial, pero el paquete incluye un fichero `NOTICE` y la obligacion de atribucion al modelo original de Cohere Labs; conviene revisar ambos antes de redistribuir.
- Al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, no cuenta con validacion de la comunidad ni con un historial de mantenimiento contrastado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yorganci/cohere-transcribe-03-2026-6bit-coreml
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Repositorio del proyecto transcribe: https://github.com/atahanyorganci/transcribe
- Fichero de licencia del paquete: LICENSE (incluido en el repositorio)
- Fichero de atribucion: NOTICE (incluido en el repositorio)
