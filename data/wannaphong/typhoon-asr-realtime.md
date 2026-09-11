# wannaphong/typhoon-asr-realtime

## Resumen

Typhoon ASR Real-time es un modelo de reconocimiento automatico del habla (ASR) de codigo abierto disenado especificamente para transcripcion en tiempo real del idioma tailandes. Lo desarrolla OpenTyphoon (el proyecto asociado a SCB 10X, segun la informacion de la model card) y esta construido sobre la arquitectura FastConformer-Transducer de NVIDIA, partiendo del modelo base `nvidia/stt_en_fastconformer_transducer_large`. Con aproximadamente 114 millones de parametros, el objetivo es ofrecer transcripcion rapida y precisa que pueda ejecutarse de forma eficiente incluso en CPUs estandar, permitiendo autohospedar el servicio de ASR sin enviar datos sensibles a la nube.

El modelo se ha entrenado con 10.000 horas de audio en tailandes con sus transcripciones, lo que busca una buena generalizacion en entornos variados. Su propuesta de valor principal es la relacion entre latencia, velocidad y precision: la model card reporta una tasa de procesamiento de 4097x en tiempo real (RTFx) con un CER de 0,0984, lo que lo posiciona como una opcion de alto rendimiento para flujos de trabajo de produccion en tailandes.

La relevancia actual radica en que la mayoria de modelos ASR de alta calidad estan centrados en ingles u otros idiomas mayoritarios, mientras que el soporte para tailandes de nivel productivo es escaso. Este modelo cubre ese hueco combinando una arquitectura optimizada para streaming con un coste computacional bajo, lo que facilita su despliegue en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (encoder FastConformer + decoder transducer) |
| Parametros totales | 114M |
| Longitud de contexto | no disponible (modelo de voz; tamano de ventana de audio no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandes (th) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio gestionado con la libreria NeMo; formato tipico .nemo no confirmado en la informacion disponible) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer-Transducer de NVIDIA, una variante optimizada del transformer convolucional-aumentado (Conformer) disenada para reducir la latencia en tareas de ASR en streaming. La eleccion del esquema transducer (RVTN, es decir, red de transcripcion recurrente) permite decodificacion incremental adecuada para reconocimiento en tiempo real. El modelo parte del checkpoint preentrenado en ingles `nvidia/stt_en_fastconformer_transducer_large` y se ha afinado (finetune) sobre datos en tailandes.

El entrenamiento se realizo sobre 10.000 horas de audio en tailandes con transcripciones, segun indica la model card. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens de audio procesados ni si se aplicaron tecnicas de RLHF/DPO (no aplicables de forma convencional en ASR). Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de las propias del bloque FastConformer.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tailandes, orientado a transcripcion en tiempo real y streaming de baja latencia.
- Transcripcion con marcas de tiempo estimadas (opcion `--with-timestamps` en la CLI y `with_timestamps=True` en la API de Python).
- Procesamiento de archivos de audio en multiples formatos de entrada (por ejemplo `.wav`, `.mp3`, `.m4a`) gracias al remuestreo automatico del script de inferencia.
- Ejecucion eficiente tanto en CPU como en GPU (seleccion de dispositivo automatica o manual mediante `--device cuda`).
- Orientacion a despliegue autohospedado, sin necesidad de enviar audio a servicios de terceros.
- Paquete de inferencia propio (`typhoon-asr`) disponible via `pip`, con CLI y API de Python.

No se documentan en la informacion disponible capacidades de traduccion, diarizacion de hablantes, deteccion de idioma, tool calling, agentes ni modos de vision o audio-vision, dado que es un modelo puramente ASR.

## Casos de uso

- Transcripcion en tiempo real de reuniones y llamadas en tailandes: el modelo esta optimizado para streaming de baja latencia, lo que permite generar subtitulos o actas mientras se produce el habla, sin esperar a procesar el audio completo.
- Subtitulado automatico para medios audiovisuales: la opcion de marcas de tiempo estimadas facilita alinear los subtitulos con el audio en produccion de video o emision en directo.
- Atencion al cliente y centros de contacto: permite transcribir conversaciones telefonicas en tailandes para su posterior analisis, control de calidad o generacion de registros, ejecutandose en infraestructura propia para cumplir con requisitos de privacidad.
- Documentacion clinica o legal dictada: profesionales que dictan notas en tailandes pueden transcribirlas localmente en CPU, evitando enviar informacion sensible a la nube.
- Procesamiento por lotes de gran volumen: con una tasa declarada de 4097x en tiempo real, es adecuado para transcribir archivos de audio historicos o grandes volumenes de grabaciones en plazos cortos.
- Asistentes de voz y comandos por voz en tailandes: al ejecutarse en CPU con bajo coste, puede integrarse en dispositivos o servicios que requieran reconocimiento de voz siempre disponible.
- Indexacion y busqueda de contenido de audio: transcribir un archivo de audio para hacerlo buscable por texto en plataformas de podcast, archivos de video o repositorios educativos.
- Investigacion en procesamiento del habla para tailandes: servir como base de referencia abierta (con licencia cc-by-4.0) para comparativas, ajuste fino adicional o experimentos academicos.

## Benchmarks y rendimiento

Los unicos datos cuantitativos presentes en la informacion proporcionada son los reportados en la propia model card. No se dispone de una tabla comparativa detallada frente a otros modelos con cifras independientes.

| Metrica | Valor reportado |
|---|---|
| CER (tasa de error de caracteres) | 0,0984 |
| RTFx (factor de tiempo real) | 4097x |
| Mejora declarada de throughput | 6x frente al siguiente modelo mas rapido |
| Comparativa declarada con Whisper | 15-19x mas throughput, con precision comparable |

La model card afirma que los valores de RTFx proceden del Open ASR Leaderboard de Hugging Face. No se han publicado en la informacion disponible resultados de benchmarks adicionales (WER por subconjunto, pruebas por dominio, etc.) ni comparaciones cifradas con modelos alternativos especificos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 114M de parametros, el modelo ocupa aproximadamente 0,23 GB en FP16 y cerca de 0,46 GB en FP32 solo en pesos. Estas cifras son estimaciones calculadas a partir del numero de parametros, no datos confirmados por el autor.
- GPU recomendadas: cualquier GPU moderna con VRAM suficiente; para este tamano bastan tarjetas de gama media o consumer. No se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: si, el tamano del modelo (114M) permite ejecutarlo holgadamente en GPUs de consumo tipo RTX 3060/4060 o superiores, e incluso en iGPU modernas.
- CPU: el modelo esta explicitamente disenado para funcionar de forma eficiente en CPUs estandar, por lo que es viable sin GPU.
- Opciones de despliegue: libreria NeMo de NVIDIA; paquete `typhoon-asr` (CLI y API de Python); script de inferencia del repositorio GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: se declara una tasa de 4097x en tiempo real, lo que implica que puede transcribir audio unas 4000 veces mas rapido que su duracion en las condiciones de medida del leaderboard.

## Comparativa con modelos similares

No se dispone de datos tecnicos detallados (parametros, contexto, licencia) de modelos alternativos en la informacion proporcionada que permitan construir una tabla fiable. La model card menciona comparaciones declaradas con la familia Whisper (mejora de 15-19x en throughput con precision comparable), pero no incluye cifras desglosadas ni versiones concretas analizadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Typhoon ASR Real-time | 114M | no disponible | cc-by-4.0 | HuggingFace / NeMo |
| Alternativas (Whisper, etc.) | no disponible | no disponible | no disponible | no disponible |

No disponible: no se han encontrado en la informacion proporcionada los datos necesarios para completar una comparativa detallada con modelos equivalentes.

## Limitaciones y advertencias

- Cobertura idiomatica limitada: el modelo solo soporta tailandes (th), por lo que no es util para otros idiomas.
- Riesgo de alucinacion y errores de transcripcion: como todo modelo ASR, puede producir errores en audio con ruido, acentos marcados, solapamiento de hablantes o terminologia especializada; el CER reportado (0,0984) implica un margen de error no despreciable.
- Dependencia del modelo base en ingles: al partir de `nvidia/stt_en_fastconformer_transducer_large`, la calidad final puede verse afectada por las caracteristicas foneticas del tailandes que no esten bien cubiertas por el preentrenamiento.
- Sin datos sobre sesgos: no se documenta en la informacion disponible un analisis de sesgos por genero, edad o variedad dialectal del tailandes.
- Condiciones de uso adicionales: la model card senala que el uso implica aceptar los terminos y condiciones y el aviso de privacidad de OpenTyphoon, ademas de la licencia cc-by-4.0, lo que anade requisitos contractuales mas alla de la propia licencia.
- Ausencia de datos de despliegue: no se detallan requisitos oficiales de hardware, soporte de cuantizacion ni integraciones con frameworks de servido, lo que puede complicar su puesta en produccion sin validacion previa.
- Estado del repositorio: el modelo figura con 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y el enlace a la demo aparece vacio en la model card, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wannaphong/typhoon-asr-realtime
- Pagina del proyecto: https://opentyphoon.ai/model/typhoon-asr-realtime
- Repositorio de codigo y ejemplos: https://github.com/scb-10x/typhoon-asr
- Blog de lanzamiento: https://opentyphoon.ai/blog/en/typhoon-asr-realtime-release
- Informe tecnico (arXiv): https://arxiv.org/abs/2601.13044
- Notebook de Google Colab: https://colab.research.google.com/drive/1t4tlRTJToYRolTmiN5ZWDR67ymdRnpAz
- Terminos y condiciones: https://opentyphoon.ai/tac
- Aviso de privacidad: https://opentyphoon.ai/privacy
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_transducer_large
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Twitter: https://twitter.com/opentyphoon
- Discord: https://discord.gg/us5gAYmrxw

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del autor.
