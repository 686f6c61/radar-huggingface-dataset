# tuxboy/bengali-whisper-medium-mlx-8bit

## Resumen

Bengali Whisper Medium — MLX 8-bit es una conversión de formato y precisión del modelo de reconocimiento automático de habla (ASR) `bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium`, publicada por el usuario tuxboy. No aporta entrenamiento adicional: se limita a transformar los pesos originales al formato MLX (el framework de Apple para Apple Silicon) y a cuantizarlos a 8 bits con cuantización afín y tamano de grupo 64. El resultado es un modelo de 762.321.920 parámetros, con un fichero de pesos de 814 MB, capaz de transcribir voz en bengalí de forma local en un Mac.

Su relevancia es doble. Por un lado, cubre un idioma con poca cobertura en los modelos ASR mayoritarios, ya que el bengalí (bn) es el único idioma soportado. Por otro, demuestra una ruta de despliegue eficiente en hardware de consumo: en las pruebas del autor sobre un Apple M4 Pro con 20 núcleos de GPU y 48 GB de memoria unificada, la variante de 8 bits procesó 300 segundos de audio en 20,76 s con un pico de memoria de proceso (RSS) de 1,41 GB, frente a 43,78 s y 5,13 GB de la versión PyTorch/MPS en fp16.

El modelo hereda la arquitectura encoder-decoder de Whisper en su tamano medium y se distribuye bajo licencia Apache-2.0. Es un artefacto muy reciente y con adopción prácticamente nula (0 descargas y 1 like en el momento de redactar esta ficha), y su propia model card advierte de que las pruebas de exactitud realizadas son de alcance muy limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 762.321.920 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible como contexto de texto; ventana de audio de 30 s propia de Whisper. El script de inferencia divide el audio en pausas en secciones de 26 s o menos y limita la salida a 440 tokens por sección |
| Tipos de cuantizacion | 8 bits, cuantizacion afín con tamano de grupo 64; el repositorio incluye tambien referencia a la variante fp16 en las pruebas de velocidad. Algunos tensores conservan precision de coma flotante |
| Idiomas soportados | Bengalí (bn) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del fichero de pesos | 814 MB (tamano del repositorio reportado: 0,8 GB) |
| Modelo base | bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium (revision `76cce9a874e8752d561a7aff28f01383df270db4`) |
| Hardware probado por el autor | Apple M4 Pro, 20 nucleos de GPU, 48 GB de memoria unificada |
| Software probado por el autor | Python 3.13, MLX 0.32.1, MLX Audio 0.5.3 |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder con atencion completa, disenado para recibir espectrogramas mel de 30 segundos y generar texto de forma autorregresiva. Esta publicacion no modifica ni reentrena esa arquitectura; unicamente exporta los pesos al formato MLX y aplica cuantizacion afín de 8 bits con grupo 64 sobre parte de los tensores, manteniendo otros en coma flotante. El modelo de origen fue entrenado por BengaliAI y, segun la model card, los datos de entrenamiento provienen del dataset Ben-10.

No hay informacion disponible en los materiales consultados sobre el numero de tokens de audio utilizados, la composicion exacta del dataset Ben-10, ni sobre si el modelo base paso por etapas de RLHF, DPO o ajuste por instrucciones; en el caso de Whisper, el entrenamiento es tipicamente de tipo supervisado sobre pares audio-transcripcion, sin RLHF, pero esto no se confirma en la documentacion aportada. La innovacion tecnica de esta release es de caracter practico: la cuantizacion para reducir huella de memoria y el script `transcribe.py`, que incluye un fichero `whisper_compat.py` para corregir un error de busqueda de tokens en MLX Audio 0.5.3 que, sin ese parche, puede impedir que el decodificador se detenga. El repositorio incluye ademas `export-provenance.json` con los datos de conversion y `SHA256SUMS.json` con las sumas de verificacion de los ficheros.

## Capacidades

- Reconocimiento automatico de habla en bengalí: convierte audio (WAV o FLAC en el flujo recomendado) en texto transcrito.
- Conversión previa a mono a 16 kHz dentro del script de inferencia, con segmentacion por pausas basada en energia del audio.
- Procesamiento por secciones de 26 segundos o menos, con un maximo de 440 tokens de salida por seccion, lo que permite transcribir grabaciones largas de forma troceada.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de enviar el audio a servicios en la nube.
- Ejecucion con cuantizacion de 8 bits, con una huella de memoria de proceso medida de 1,41 GB de pico (RSS).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada distinto al ASR ni modo de razonamiento explicito.
- No se documenta capacidad multilingue: el modelo esta etiquetado y entrenado para bengalí exclusivamente.
- No se documenta salida de marcas de tiempo, diarizacion de hablantes ni traduccion a otros idiomas, aunque Whisper dispone de tareas de transcripcion y traduccion en su formulacion original; esta release no especifica si conserva ambas.

## Casos de uso

- Transcripcion de archivos de audio periodisticos en bengalí: una redaccion puede pasar entrevistas y ruedas de prensa en bengalí por el script de transcripcion en un Mac y obtener un borrador de texto para editar, con procesamiento aproximadamente 14 veces mas rapido que el tiempo real segun las pruebas del autor.
- Subtitulado de video: el texto generado por secciones de audio de 26 segundos o menos encaja bien en un flujo de segmentacion por pausas para producir subtitulos sincronizados de contenido en bengalí.
- Analisis de grabaciones de atencion al cliente: transcripcion de llamadas en bengalí para posterior busqueda por palabras clave, control de calidad o clasificacion de motivos de contacto, con la ventaja de que el audio no sale del equipo.
- Documentacion administrativa y sanitaria por dictado: profesionales bengaliparlantes pueden dictar notas e informes en local; conviene revisar la salida por las limitaciones de exactitud documentadas por el propio autor.
- Creacion de corpus y datos de entrenamiento: transcripcion masiva de audio en bengalí para construir datasets etiquetados destinados a entrenar otros modelos ASR o TTS en ese idioma, gracias al bajo consumo de memoria que permite ejecutar varias instancias o lotes largos.
- Archivado de patrimonio oral: digitalizacion y transcripcion de grabaciones de historia oral, poesia recitada o material etnografico en bengalí, con la advertencia de que la deteccion de pausas basada en energia puede cortar palabras en habla continua.
- Asistentes de voz locales en Mac: integracion del modelo en una aplicacion de escritorio para dictado o comandos de voz en bengalí, aprovechando el flujo MLX y el pico de 1,41 GB de memoria.
- Accesibilidad: generacion de transcripciones en directo o diferidas para personas con discapacidad auditiva en entornos donde el bengalí es la lengua principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (WER, CER, MMLU, etc.) en la informacion disponible. El autor solo reporta una prueba de velocidad sobre una grabacion de 300 segundos dividida en 13 secciones, con una unica ejecucion tras un calentamiento:

| Runtime | Tiempo de procesamiento | Pico de memoria de proceso (RSS) | Factor de tiempo real derivado |
|---|---:|---:|---:|
| PyTorch/MPS fp16 | 43,78 s | 5,13 GB | ~6,9x |
| MLX fp16 | 24,79 s | 2,12 GB | ~12,1x |
| MLX 8 bits | 20,76 s | 1,41 GB | ~14,5x |

Los tiempos incluyen extraccion de caracteristicas y decodificacion, y excluyen carga del modelo, acceso a ficheros y conversion de audio. El propio autor indica que estas cifras no miden exactitud de transcripcion. Como unica comprobacion de calidad, senala que las salidas de 8 bits y fp16 coincidieron en 24 clips cortos de OpenSLR53, y advierte que esa muestra no permite establecer una exactitud general.

## Requisitos de hardware

- VRAM/memoria: el fichero de pesos de 8 bits ocupa 814 MB, pero el modelo requiere mas memoria que ese fichero. El pico de RSS medido es de 1,41 GB en 8 bits y 2,12 GB en fp16, sobre un equipo con 48 GB de memoria unificada.
- GPU compatibles: MLX esta disenado para Apple Silicon, por lo que el modelo se ejecuta en GPU integradas de la familia M (probado en M4 Pro con 20 nucleos de GPU). No se documenta soporte de CUDA ni de GPU NVIDIA.
- Cabe en equipos de consumo: si, en Macs con Apple Silicon y memoria unificada suficiente; con 1,41 GB de pico de proceso, un Mac de 8 GB deberia poder ejecutarlo, aunque la model card no confirma pruebas en configuraciones de menor memoria.
- Plataformas no probadas: el autor indica explicitamente que no se ha probado en Android ni en Raspberry Pi.
- Opciones de despliegue: MLX con MLX Audio 0.5.3 y Python 3.13; el repositorio incluye `transcribe.py` y `requirements.txt`. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni whisper.cpp para esta release concreta. Para GPU NVIDIA habria que recurrir al modelo base en PyTorch/transformers, no a estos pesos MLX.
- Latencia y throughput: segun la prueba del autor, unos 20,76 s para 300 s de audio en 8 bits (aproximadamente 14,5 veces el tiempo real en ese equipo), con una unica ejecucion y sin medicion de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| tuxboy/bengali-whisper-medium-mlx-8bit | 762.321.920 | 30 s (script en secciones de <=26 s) | Bengalí | Apache-2.0 | MLX safetensors, Apple Silicon |
| bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium (modelo base) | No disponible en la informacion proporcionada | No disponible | Bengalí | No disponible en la informacion proporcionada | PyTorch/transformers; es el origen de los pesos |
| openai/whisper-medium | ~769 M (dato de conocimiento general, no verificado en esta busqueda) | 30 s | Multilingue (aproximadamente 99 idiomas) | Apache-2.0 | PyTorch/transformers, GGUF en versiones de la comunidad; multiplataforma |
| openai/whisper-large-v3 | ~1,55 B (dato de conocimiento general, no verificado en esta busqueda) | 30 s | Multilingue | Apache-2.0 | PyTorch/transformers; requiere mas memoria |

Las cifras de los dos modelos de OpenAI no provienen de la informacion proporcionada en esta busqueda y se incluyen solo como referencia de categoria; conviene verificarlas en sus fichas oficiales. No se dispone de datos de WER comparativos entre estas alternativas para el idioma bengalí.

## Limitaciones y advertencias

- El modelo puede producir palabras incorrectas ante silencios o ruido; el script de inferencia desactiva el filtro de ausencia de habla, lo que aumenta ese riesgo.
- La deteccion de pausas se basa en la energia del audio: en habla continua puede cortar dentro de una palabra y degradar la transcripcion.
- La unica comprobacion de fidelidad de la cuantizacion es la coincidencia de salidas entre 8 bits y fp16 en 24 clips cortos de OpenSLR53; el autor advierte que esa muestra no establece exactitud general.
- No hay pruebas de exactitud por dialecto bengalí: el rendimiento puede variar notablemente entre variedades regionales y no esta cuantificado.
- Solo soporta bengalí; no se documenta capacidad multilingue ni traduccion a otros idiomas.
- No se documenta salida con marcas de tiempo, diarizacion ni filtrado de hablantes.
- Limitacion de plataforma: los pesos estan en formato MLX, por lo que quedan restringidos a Apple Silicon. No hay soporte documentado de CUDA, Android ni Raspberry Pi.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar del modelo base de BengaliAI conviene verificar las condiciones y la atribucion de ese modelo y del dataset Ben-10.
- Adopcion practicamente nula (0 descargas, 1 like) y ausencia de resultados de benchmarks: no es recomendable desplegarlo en produccion sin una evaluacion propia de WER sobre el dominio objetivo.
- Riesgo de alucinacion de texto en segmentos sin voz o con audio degradado, derivado de la desactivacion del filtro de no-habla.
- Fechas de creacion y actualizacion del repositorio reportadas como 2026-09-10 segun la ficha de HuggingFace; conviene confirmarlas en el propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuxboy/bengali-whisper-medium-mlx-8bit
- Modelo base (BengaliAI regional Whisper Medium): https://huggingface.co/bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium
- Dataset de entrenamiento del modelo base (Ben-10): https://huggingface.co/datasets/bengaliAI/Ben-10
- Model card del modelo base citada en el repositorio: SOURCE_MODEL_CARD.md (incluida en el repositorio del modelo)
- Datos de conversion: export-provenance.json (incluido en el repositorio)
- Sumas de verificacion: SHA256SUMS.json (incluido en el repositorio)
- Licencia: LICENSE (Apache-2.0, incluida en el repositorio)
- Framework MLX: no disponible en los resultados de busqueda proporcionados
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a un portal de noticias croata sin relacion con el contenido de esta ficha.
