# vertox-ai/speech-text-data-aligners

## Resumen

Speech-Text Data Aligners (STA) es un framework de software en Python, desarrollado por el usuario vertox-ai, para la alineacion forzada (forced alignment) de audio WAV contra una transcripcion en ingles conocida y autoritativa. No es un modelo ASR: no genera transcripciones ni sustituye el texto de referencia, sino que estima en que instante del audio aparecen las palabras ya proporcionadas por el usuario. El repositorio actua como capa de abstraccion sobre tres backends de alineacion consolidados (Montreal Forced Aligner, NVIDIA NeMo Forced Aligner y WhisperX) bajo un unico contrato Python neutral respecto al backend.

El paquete incluye anotacion determinista de CSV, benchmarking comparativo entre backends y servicios de comprobacion semantica offline, con garantias estrictas sobre las marcas de tiempo generadas (finitas, no negativas, monotonas, no solapadas y acotadas por la duracion del WAV). Es relevante para equipos que construyen datasets de voz, pipelines de TTS o corpus paralelos y necesitan marcas temporales fiables sin recurrir a ASR que introduzca texto reconocido en lugar del texto fuente.

Conviene subrayar que el repositorio no contiene un checkpoint neuronal propio: el fichero `config.json` es un manifiesto de proyecto, no un `AutoConfig` de Transformers. Los pesos reales son los de los modelos fijados por cada backend (por ejemplo, `english_us_mfa` 3.3.0 o `stt_en_fastconformer_hybrid_large_pc`), por lo que las cifras de parametros y contexto de esta ficha no aplican al repositorio en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework Python sobre backends de alineacion forzada (MFA, NeMo/NFA, WhisperX); no es un transformer propio |
| Parametros totales | no disponible (depende del modelo de cada backend) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (limitada por el modelo acustico del backend y por la duracion del WAV) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio distribuye codigo Python; los pesos los aportan MFA, NeMo y WhisperX) |

## Arquitectura y entrenamiento

El repositorio es una capa de orquestacion, no un modelo entrenado. Define un contrato Python neutral (`AlignmentBackend`) que abstrae tres motores: MFA con el modelo `MontrealCorpusTools/english_mfa@1009e3c6c689f10875146a5e4e5c2233f8eaf922` (modelo 3.3.0, baseline MFA 3.4.2, CPU, backend operativo seleccionado), WhisperX con el bundle `WAV2VEC2_ASR_BASE_960H` de Torchaudio 2.8.0 (WhisperX 3.8.6, CPU, alternativa aceptada) y NeMo/NFA con `stt_en_fastconformer_hybrid_large_pc` (NeMo 3.0.0, CUDA, aceptado pero no seleccionado operativamente). Cada backend se ejecuta en su propio entorno aislado y el proceso CLI padre invoca el runtime correspondiente, de modo que la ausencia de dependencias de NeMo, MFA o WhisperX no rompe las importaciones del paquete.

La innovacion tecnica esta en las garantias del contrato de datos: mapeo lexico reversible hasta las palabras exactas de la transcripcion fuente, validacion estricta de intervalos (`0 <= first_start <= first_end <= last_start <= last_end <= audio_duration`), publicacion atomica de CSV que preserva cabeceras, celdas y orden de filas, y rechazo explicito de NaN, infinitos, valores negativos, intervalos invertidos o solapados y cobertura lexica incompleta. No hay entrenamiento, RLHF ni DPO asociados al repositorio; el rendimiento depende integramente de los modelos acusticos subyacentes.

## Capacidades

- Alineacion forzada de audio WAV contra una transcripcion en ingles conocida, sin sustitucion silenciosa por ASR.
- Anotacion determinista de CSV anadiendo exactamente seis columnas: `first_word_text`, `first_word_start_s`, `first_word_end_s`, `last_word_text`, `last_word_start_s`, `last_word_end_s`.
- Mapeo lexico reversible a las palabras exactas del texto fuente.
- Validacion estricta de marcas temporales: finitas, no negativas, monotonas, no solapadas y dentro de la duracion del audio.
- Benchmarking comparativo entre backends mediante `benchmark_backend` y `benchmark_backends`.
- API Python estable invocable por servicios; la CLI delega en esos mismos servicios.
- Inyeccion de dependencias para backends personalizados que implementen `AlignmentBackend`.
- Aislamiento perezoso de backends en entornos separados (core, MFA, NeMo, WhisperX).
- Soporte de un unico caso de palabra (los campos first y last provienen de la misma palabra alineada).
- Puertas de cobertura deterministas por fichero, cabecera, manifiesto y arquitectura.

## Casos de uso

- Construccion de datasets de voz para TTS: alinear cada WAV con su transcripcion autoritativa y obtener marcas de inicio y fin de la primera y ultima palabra para segmentar y validar clips antes de entrenar modelos de sintesis.
- Corpus paralelos ingles-ruso: el contrato de entrada exige `line_id, audio_id, en_transcript, ru_translation`, de modo que la anotacion temporal se preserva junto a la traduccion y permite construir alineaciones audio-texto bilingues sin alterar el texto fuente.
- Control de calidad de grabaciones: la validacion estricta de intervalos detecta audios truncados, silencios iniciales anomalos o transcripciones que no cubren el audio, marcando las filas como fallidas en el recibo de ejecucion.
- Evaluacion comparativa de backends: usar `benchmark_backends` contra un CSV de referencia gold para decidir que motor (MFA, WhisperX o NeMo) conviene desplegar segun precision y coste computacional en cada lote.
- Pipelines de subtitulado y karaoke: obtener tiempos de palabra para sincronizar subtitulos o resaltados sobre un guion ya existente, sin depender de reconocimiento automatico que pueda desviarse del texto aprobado.
- Investigacion en fonetica y prosodia: extraer limites de palabra estables y reproducibles sobre corpus controlados, con publicacion atomica de resultados que evita estados parciales en ejecuciones largas.
- Integracion en produccion con entornos aislados: desplegar el backend MFA en CPU para lotes masivos y reservar NeMo en CUDA para casos que requieran el fastconformer, manteniendo el mismo contrato de API y de CSV.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados), sobre el dataset local `five-row-first-word-manual-gold`, midiendo el error absoluto medio (MAE) del fin de la primera palabra en segundos:

| Backend | Metrica | MAE (s) | Verificado |
|---|---|---|---|
| MFA | first-word-end MAE | 0,0162 | No |
| WhisperX | first-word-end MAE | 0,0154 | No |
| NeMo | first-word-end MAE | 0,2210 | No |

WhisperX y MFA presentan errores en torno a 15-16 milisegundos, mientras que NeMo queda un orden de magnitud por encima (221 ms) en esta muestra de cinco filas. El tamano muestral es muy reducido y los valores no estan verificados, por lo que deben tratarse como indicativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el framework; depende del backend. MFA y WhisperX estan configurados por defecto en CPU, mientras que NeMo/NFA usa CUDA por defecto.
- GPU recomendadas: no disponible. El backend operativo seleccionado (MFA) no requiere GPU; NeMo puede ejecutarse en GPU CUDA, pero el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; MFA y WhisperX en CPU permiten ejecucion sin GPU dedicada.
- Opciones de despliegue: paquete Python instalable con `pip install -e .` sobre Python 3.12 o superior; entornos conda separados en `environments/core-dev.yml`, `environments/mfa.yml`, `environments/nemo.yml` y `environments/whisperx.yml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Enfoque | Backends soportados | Licencia | Disponibilidad |
|---|---|---|---|---|
| Speech-Text Data Aligners | Framework de alineacion forzada con contrato unico y validacion estricta | MFA, NeMo/NFA, WhisperX | apache-2.0 | Hugging Face (vertox-ai) |
| Montreal Forced Aligner (MFA) | Alineador forzado con modelos acusticos y diccionarios | Propio | no disponible en la informacion | Proyecto independiente, integrado como backend |
| WhisperX | Alineacion y diarizacion sobre Whisper con wav2vec2 | Propio (wav2vec2) | no disponible en la informacion | Proyecto independiente, integrado como backend |
| NVIDIA NeMo Forced Aligner (NFA) | Alineacion sobre modelos NeMo (FastConformer) | Propio | no disponible en la informacion | Proyecto independiente, integrado como backend |

La propuesta diferencial de STA no es un modelo acustico nuevo, sino la unificacion de los tres motores bajo un contrato de datos verificable, con anotacion determinista y benchmarking integrado.

## Limitaciones y advertencias

- Solo soporta ingles: el campo de transcripcion se denomina `en_transcript` y el modelo MFA fijado es `english_us_mfa`.
- No es un sistema ASR: no transcribe audio ni corrige el texto de referencia; si la transcripcion no coincide con el audio, la alineacion falla o produce resultados invalidos.
- El benchmark publicado se basa en cinco filas (`five-row-first-word-manual-gold`) y sus metricas no estan verificadas, por lo que la comparacion entre backends es debil estadisticamente.
- El repositorio no incluye pesos neuronales propios; la calidad final depende de los modelos de MFA, NeMo y WhisperX y de sus versiones fijadas.
- Requiere mantener entornos separados por backend, lo que anade complejidad operativa y de empaquetado en produccion.
- Las marcas de tiempo iguales se permiten solo en los limites de resolucion del backend; valores fuera del audio, solapados o no monotonos provocan fallo de validacion, lo que puede rechazar audios con problemas de metadatos.
- No se detallan sesgos demograficos ni de acento de los modelos acusticos subyacentes; al usar MFA con diccionario estadounidense, variedades no estadounidenses pueden alinearse peor.
- Licencia apache-2.0 para el codigo del framework, pero las licencias de los modelos y dependencias de cada backend deben verificarse por separado antes de un uso comercial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vertox-ai/speech-text-data-aligners
- Modelo MFA fijado: https://huggingface.co/MontrealCorpusTools/english_mfa
- Modelo NeMo fijado: `stt_en_fastconformer_hybrid_large_pc` (NVIDIA NeMo)
- Bundle WhisperX/Torchaudio: `WAV2VEC2_ASR_BASE_960H` (Torchaudio 2.8.0)
- Documentacion de configuracion del proyecto: `docs/CONFIGURATION.md` (dentro del repositorio)
- Manifiesto del proyecto: `config.json` (dentro del repositorio)
