# wannaphong/typhoon-isan-asr-realtime

## Resumen

Typhoon Isan ASR Realtime es un modelo de reconocimiento automatico del habla (ASR) especializado en el dialecto isan del tailandes. Se trata de un ajuste fino del modelo Typhoon ASR Realtime, desarrollado originalmente por SCB 10X dentro del proyecto OpenTyphoon, y publicado en este repositorio por el usuario wannaphong. El objetivo es transcribir habla isan en tiempo real con una latencia baja, algo que los modelos genericos de tailandes estandar suelen resolver mal porque el isan presenta diferencias foneticas, lexicas y de tono notables respecto al tailandes central.

Arquitectonicamente es un FastConformer-Transducer, la arquitectura de NVIDIA NeMo optimizada para streaming de baja latencia, con aproximadamente 114 millones de parametros. El repositorio ocupa 0,5 GB, la licencia es CC-BY-4.0 y el unico idioma declarado es el tailandes (th), aplicado en la practica a su variante isan. El modelo esta pensado para correr de forma eficiente incluso en CPU, lo que lo hace accesible para despliegues sin GPU.

Su relevancia actual radica en que, segun los datos publicados por los autores, un modelo abierto de 114 M de parametros alcanza un CER de 0,1065 en isan, practicamente al mismo nivel que Gemini-2.5-pro (0,1020) y solo ligeramente por detras de la variante Whisper medium del mismo proyecto (0,0885). Esto lo posiciona como una alternativa ligera, desplegable en local y sin coste por token frente a APIs propietarias para transcripcion dialectal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (NeMo) |
| Parametros totales | 114 M |
| Longitud de contexto | no disponible (modelo de streaming por ventanas; no se especifica ventana de atencion) |
| Tipos de cuantizacion | no disponible (no se listan variantes cuantizadas en la informacion proporcionada) |
| Idiomas soportados | th (tailandes), especializado en el dialecto isan |
| Licencia | cc-by-4.0 |
| Formato de pesos | checkpoint NeMo (.nemo, PyTorch); no se listan safetensors ni GGUF |
| Entrada | audio (pipeline automatic-speech-recognition) |
| Salida | transcripcion de texto, con marcas de tiempo opcionales |
| Tamano del repositorio | 0,5 GB |
| Modelo base | scb10x/typhoon-asr-realtime |
| Libreria | nemo |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer-Transducer de NVIDIA NeMo. FastConformer es una variante del Conformer con atencion por muestreo (strided/depthwise) que reduce el coste computacional de la autocorrelacion sobre secuencias de audio largas, lo que permite procesar audio de forma continua con baja latencia. El decodificador de tipo Transducer (RNN-T) permite emitir tokens de forma incremental sin esperar a disponer de la frase completa, caracteristica esencial para aplicaciones de streaming en tiempo real.

El modelo es un ajuste fino del checkpoint scb10x/typhoon-asr-realtime sobre datos de habla isan. La informacion disponible no detalla el numero de horas de audio empleadas, la composicion exacta del dataset de ajuste, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a ASR). Si se menciona que el modelo se cruza como referencia contra scb10x/whisper-medium-slscu-nectec, un ajuste propio de los autores sobre datos dialectales de NECTEC y SLSCU, y que el trabajo previo destacado en ASR de isan es SLSCU/thai-dialect_korat_model. El informe tecnico asociado es arXiv:2601.13044, "Typhoon ASR Real-time: FastConformer-Transducer for Thai Automatic Speech Recognition".

## Capacidades

- Transcripcion de voz a texto en tiempo real (streaming) de habla en tailandes con acento o variante isan.
- Transcripcion offline de audio ya grabado, mediante el mismo pipeline NeMo.
- Generacion de marcas de tiempo por segmento (`with_timestamps=True` en el paquete `typhoon-asr`).
- Inferencia eficiente en CPU, sin necesidad de GPU, segun la propia model card.
- Integracion sencilla mediante la libreria `nemo` o el paquete Python `typhoon-asr`.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente acustico, no un modelo de lenguaje conversacional.
- No dispone de vision, audio generativo ni modo de razonamiento explicito.
- Multilingue: no. El unico idioma declarado es th, con foco en isan; no se documenta soporte de cambio de codigo tailandes/isan o tailandes/ingles.

## Casos de uso

- Subtitulado en directo de retransmisiones: al ser un Transducer de streaming, puede emitir texto de forma incremental mientras se recibe el audio, lo que encaja con pipelines de subtitulado en vivo para television o plataformas de video en tailandes isan.
- Atencion al cliente telefonica: transcripcion de llamadas de soporte en isan para generar registros textuales, alimentar sistemas de analitica o auditar la calidad del servicio sin depender de APIs externas.
- Analitica de centros de contacto: procesamiento por lotes de grabaciones para extraer motivos de llamada, tiempos de habla y terminos frecuentes, aprovechando que el modelo corre en CPU y no exige infraestructura GPU.
- Accesibilidad para hablantes de isan: generacion de subtitulos automaticos en contenido audiovisual dirigido a la region de Isan, donde los modelos de tailandes estandar presentan tasas de error mas altas.
- Documentacion y preservacion linguistica: transcripcion de entrevistas, relatos orales o archivos etnograficos en isan para su catalogacion y busqueda textual.
- Asistentes de voz locales en tailandes isan: reconocimiento de comandos o dictado en aplicaciones de escritorio o moviles que necesitan funcionar sin conexion y con un modelo de 114 M de parametros.
- Sistemas de toma de notas en reuniones: transcripcion con marcas de tiempo para generar actas en entornos donde se habla isan, integrandose via la libreria NeMo.

## Benchmarks y rendimiento

La model card publica una comparativa de tasa de error de caracteres (CER) sobre habla en dialecto isan:

| Modelo | CER (isan) |
|---|---|
| typhoon-whisper-medium-isan-asr | 0,0885 |
| Gemini-2.5-pro | 0,1020 |
| typhoon-isan-asr-realtime (este modelo) | 0,1065 |
| scb10x/whisper-medium-slscu-nectec (baseline de los autores) | no disponible |
| SLSCU/thai-dialect_korat_model | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible, ya que no se trata de un modelo de lenguaje. Los autores senalan que la diferencia entre este modelo y Gemini-2.5-pro es inferior a 0,5 puntos porcentuales, y que la familia Typhoon Isan ASR es competitiva con modelos propietarios multimodales de gran escala en reconocimiento de habla dialectal.

## Requisitos de hardware

- VRAM estimada: con 114 M de parametros, los pesos en fp32 ocupan aproximadamente 0,46 GB y en fp16 alrededor de 0,23 GB; sumando activaciones y buffers de decodificacion, la inferencia cabe holgadamente en menos de 1-2 GB de memoria.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en aceleradores de borde.
- Tambien funciona en CPU: la model card indica explicitamente que esta disenado para ejecutarse de forma eficiente en CPUs estandar, lo que habilita servidores sin GPU.
- Despliegue: libreria NVIDIA NeMo y el paquete Python `typhoon-asr` (`pip install typhoon-asr`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a checkpoints NeMo de ASR.
- Latencia y throughput: no se publican cifras concretas de milisegundos por segundo de audio ni de factor de tiempo real en la informacion disponible; la arquitectura esta optimizada para baja latencia y streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | CER isan | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wannaphong/typhoon-isan-asr-realtime | 114 M | FastConformer-Transducer | th (isan) | 0,1065 | cc-by-4.0 | HuggingFace |
| typhoon-whisper-medium-isan-asr | no disponible (variante Whisper medium) | Whisper encoder-decoder | th (isan) | 0,0885 | no disponible en la informacion proporcionada | HuggingFace |
| Gemini-2.5-pro | no disponible | no disponible | multilingue | 0,1020 | propietaria | API de pago |
| scb10x/whisper-medium-slscu-nectec | no disponible | Whisper | th (isan) | no disponible | no disponible | HuggingFace |
| SLSCU/thai-dialect_korat_model | no disponible | no disponible | th (isan) | no disponible | no disponible | HuggingFace |

El principal diferenciador de este modelo frente a las alternativas Whisper es que su arquitectura Transducer permite decodificacion incremental, mientras que Whisper esta pensado para transcripcion offline de segmentos completos. Frente a Gemini-2.5-pro, la ventaja es el despliegue local, sin coste por uso y con un consumo de recursos muy inferior.

## Limitaciones y advertencias

- Modelo especializado en ASR: no genera texto libre, no razona, no ejecuta codigo y no soporta agentes ni tool calling.
- Cobertura limitada a tailandes e isan; no hay soporte documentado de otros idiomas ni de cambio de codigo con ingles.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, solapamiento de voces, terminologia tecnica o nombres propios; el CER de 0,1065 implica aproximadamente un 10,65 % de caracteres erroneos en el benchmark publicado.
- Posibles sesgos derivados de los datos de ajuste en isan: variabilidad dialectal dentro de la propia region, diferencias de registro y sesgo hacia el habla de los corpus utilizados; no hay analisis de sesgos publicado.
- La licencia declarada es CC-BY-4.0, que permite uso comercial con atribucion, pero la model card condiciona el uso a la aceptacion de los OpenTyphoon Terms and Conditions y su Privacy Notice, lo que puede anadir condiciones mas alla de CC-BY-4.0. Conviene revisar ambos documentos antes de un despliegue comercial.
- No se documentan versiones cuantizadas ni formatos alternativos (GGUF, ONNX, safetensors), por lo que el despliegue esta ligado al ecosistema NeMo.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados mas alla del benchmark publicado por los propios autores.
- Las fechas de creacion y actualizacion del repositorio (2026-09-12) y el identificador de arXiv (2601.13044) corresponden a material muy reciente; conviene verificar la disponibilidad del informe tecnico.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/wannaphong/typhoon-isan-asr-realtime
- Modelo base: https://huggingface.co/scb10x/typhoon-asr-realtime
- Informe tecnico (arXiv): https://arxiv.org/abs/2601.13044
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2601.13044
- Codigo y ejemplos: https://github.com/scb-10x/typhoon-asr
- Pagina del proyecto en OpenTyphoon: https://opentyphoon.ai/model/typhoon-asr-realtime
- Blog de lanzamiento: https://opentyphoon.ai/blog/en/typhoon-asr-realtime-release
- Terminos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
- Aviso de privacidad de OpenTyphoon: https://opentyphoon.ai/privacy
- Documentacion de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Modelo previo de referencia para isan: https://huggingface.co/SLSCU/thai-dialect_korat_model
- Twitter de OpenTyphoon: https://twitter.com/opentyphoon
- Discord de soporte: https://discord.gg/us5gAYmrxw
