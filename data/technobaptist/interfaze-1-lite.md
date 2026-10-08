# TechnoBaptist/interfaze-1-lite

## Resumen

Interfaze 1 Lite es un modelo multimodal de pesos abiertos publicado por TechnoBaptist (con model card atribuida a interfaze-ai) que se presenta como una "mixture-of-architectures" (MoA): no es una sola red, sino un nucleo de razonamiento vision-language al que se conectan especialistas independientes mediante llamadas de herramienta. El nucleo es un decoder de atencion hibrida con vision encoder en FP8 y 131.000 tokens de contexto, que planifica, invoca a los especialistas y compone la respuesta final. El conjunto esta orientado a cargas de trabajo de desarrollador: lectura de documentos, transcripcion de voz, localizacion de objetos y elementos de interfaz, y respuesta estructurada sobre todo ello.

El modelo cubre OCR y comprension de documentos (PDF de hasta 50 paginas por llamada, con caja y confianza por linea y palabra), reconocimiento de voz con marcas de tiempo y diarizacion de hablantes, deteccion de objetos de vocabulario abierto, grounding de elementos GUI para agentes de uso de ordenador, segmentacion, traduccion, forecasting de series temporales y guardrails. Todo ello se ejecuta de forma autocontenida en una unica GPU de 80 GB, sin servicios externos, lo que lo hace relevante para despliegues on-premise con requisitos de privacidad o de operacion offline.

La licencia es Apache 2.0 y el repositorio ocupa 44,3 GB. No se declara el numero de parametros totales ni activos, ni los datos de entrenamiento. Las cifras de rendimiento publicadas estan medidas por el propio autor con los scorers oficiales de cada benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-architectures (MoA): nucleo de razonamiento decoder de atencion hibrida con vision encoder (FP8) mas especialistas conectados por tool calls |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | FP8 en el nucleo de razonamiento; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | 15 idiomas declarados (en, zh, es, fr, de, it, pt, ja, ko, ar, hi, bn, id, sw, yo); 160+ idiomas en traduccion y 99 en reconocimiento de voz |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 44,3 GB |
| Libreria | transformers (con custom_code) |
| Pipeline declarado | image-text-to-image |

## Arquitectura y entrenamiento

El modelo se organiza como un nucleo de razonamiento mas un conjunto de arquitecturas especialistas. El nucleo es un decoder de atencion hibrida con vision encoder, cuantizado en FP8 y con 131.000 tokens de contexto; su funcion es leer la peticion, decidir que especialistas ejecutar y redactar la respuesta. Los especialistas documentados en la model card son: un lector de documentos basado en vision-language model (texto, orden de lectura, tablas y markdown); un detector y reconocedor de texto para la geometria de cada linea (caja y confianza); un detector de layout documental (titulos, parrafos, tablas y figuras con cajas); un reconocedor de voz encoder-decoder (transcripcion y marcas de tiempo en 99 idiomas); un pipeline de segmentacion y embeddings de hablante para diarizacion; un modelo de segmentacion promptable para contornos y mascaras; un modelo fundacional de series temporales para forecasting; y un clasificador de seguridad con 14 categorias de texto.

La combinacion de componentes se describe con detalle: el OCR se obtiene cosiendo dos vistas de la misma pagina, de modo que el lector aporta las palabras y el detector de lineas aporta la geometria; los hablantes se atribuyen palabra por palabra segun el mayor solapamiento con los turnos de cada hablante y despues se agrupan en fragmentos; la deteccion y el grounding GUI se ejecutan sobre el nucleo de razonamiento, que devuelve cajas en una rejilla de 0 a 1000, mientras que los contornos proceden del modelo de segmentacion. Existe un modo "run task" que omite la planificacion: nombrar una capacidad concreta (`task="ocr"`, `"speech_to_text"`, etc.) ejecuta ese especialista directamente y devuelve su resultado en bruto.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla la innovacion concreta del esquema de atencion hibrida del nucleo.

## Capacidades

- Comprension de documentos: extraccion de texto, orden de lectura, tablas y layout desde imagenes, PDF (hasta 50 paginas por llamada) y ficheros Word, con caja y confianza por cada linea y palabra.
- Reconocimiento de voz con marcas de tiempo, en 99 idiomas, con segmentacion por pausas y decodificacion por lotes (una grabacion de 95 minutos se transcribe en unos 90 segundos segun el autor).
- Diarizacion de hablantes: atribucion de quien habla y cuando, con asignacion palabra a palabra por solapamiento de turnos.
- Grounding visual: deteccion de objetos de vocabulario abierto con contornos, y grounding de elementos de interfaz grafica para agentes de computer use.
- Segmentacion promptable de imagen, con mascaras y contornos.
- Salida estructurada: respuestas restringidas a un esquema JSON proporcionado por el usuario, a partir de cualquier mezcla de texto, imagenes, documentos y audio.
- Traduccion en mas de 160 idiomas y forecasting de series temporales a partir de CSV o JSON.
- Guardrails: comprobaciones de seguridad sobre texto e imagen, con 14 categorias de seguridad textual.
- Razonamiento multilingue en ciencia, matematicas, SQL y conocimiento general en 14+ idiomas.
- Soporte de tool calling y de agentes multi-paso, dado que el propio nucleo funciona orquestando especialistas mediante llamadas.
- Modo de ejecucion directa de tarea ("run task") para omitir la planificacion cuando solo se necesita un especialista.

## Casos de uso

- Digitalizacion de archivos y facturas: el modelo puede procesar PDF de hasta 50 paginas por llamada extrayendo texto, orden de lectura, tablas y layout, con caja y confianza por linea, lo que permite auditar la calidad del OCR y alimentar sistemas de contabilidad con salida JSON validada.
- Transcripcion y actas de reuniones: la combinacion de ASR con marcas de tiempo y diarizacion permite generar actas con atribucion de intervenciones; el procesado por lotes con corte en pausas hace viable transcribir grabaciones largas (el autor cifra 95 minutos en unos 90 segundos).
- Atencion al cliente con salida estructurada: al restringir la respuesta a un esquema JSON, el modelo puede clasificar y extraer campos de tickets que incluyan texto, capturas de pantalla y audio de forma homogenea.
- Agentes de automatizacion de interfaz (computer use): el grounding GUI devuelve cajas sobre una rejilla de 0 a 1000, lo que permite a un agente localizar y pulsar elementos de una aplicacion a partir de una instruccion en lenguaje natural.
- Analisis documental con razonamiento multimodal: MMMU-Pro mide razonamiento que requiere la imagen; esto lo hace util para responder preguntas sobre graficos, diagramas tecnicos o documentos escaneados con tablas.
- Traduccion multilingue a escala: con mas de 160 idiomas y contexto de 131.000 tokens se pueden traducir documentos completos manteniendo coherencia terminologica dentro de una misma llamada.
- Moderacion de contenido: el especialista de guardrails con 14 categorias de seguridad textual permite filtrar entradas y salidas en un pipeline propio, ejecutandose offline en la misma GPU.
- Forecasting operativo: a partir de CSV o JSON, el especialista de series temporales proyecta valores futuros, util para previsiones de demanda o de capacidad sin depender de un servicio externo.
- Procesamiento de datos en entornos con requisitos de privacidad: al ejecutarse en una sola GPU de 80 GB y sin servicios externos, encaja en despliegues on-premise donde los documentos o el audio no pueden salir de la infraestructura.
- Pipeline multimodal con salida validada: la combinacion de OCR, ASR y JSON schema permite construir extraccion de datos de contratos que incluya anexos escaneados y llamadas de voz registradas.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las puntuaciones de Interfaze 1 Lite fueron medidas por el autor con el scorer oficial de cada benchmark; el resto de cifras proceden del leaderboard de Interfaze. Mayor es mejor excepto en WER.

| Benchmark | Que mide | Interfaze 1 Lite | Interfaze | GPT-5.4-Mini | Claude-Sonnet-4.6 | Gemini-3-Flash | Grok-4.3 |
|---|---|---|---|---|---|---|---|
| GPQA Diamond | Ciencia de nivel de posgrado | 85,9 | 92,4 | 82,8 | 89,9 | 88,5 | 73,6 |
| MMMLU | Conocimiento en 14 idiomas | 87,8 | 90,9 | 75,3 | 84,9 | 88,7 | 89,7 |
| MMMU-Pro | Razonamiento multimodal | 73,2 | 71,1 | 40,4 | 46,3 | 67,6 | 68,7 |
| olmOCR-Bench | OCR de documentos | 83,8 | 85,7 | 80,1 | 73,9 | 75,3 | 81,9 |
| OCRBench v2 (ingles) | Texto en imagenes | 60,9 | 70,7 | 52,7 | 54,7 | 55,8 | 54,7 |
| RefCOCO (Acc@0.5) | Grounding por expresion referencial | 83,8 | 82,1 | – | – | – | – |
| VoxPopuli-Cleaned (WER, menor es mejor) | Reconocimiento de voz | 3,01 | 2,4 | – | – | 4,0 | – |
| SOB (value accuracy) | Salida estructurada desde texto, imagen y audio | 81,5 | 80,5 | – | 77,9 | 77,3* | – |
| Spider 2.0-Lite (SQLite) | Texto a SQL | 48,9 | 52,9 | 26,7 | 49,6 | 45,2 | 45,9 |

\* Gemini-3-Flash-Preview.

Detalles aportados por el autor sobre la evaluacion: GPQA Diamond se ejecuto sobre las 198 preguntas completas; MMMLU-lite sobre las 19.950 preguntas (1.425 en cada uno de 14 idiomas); MMMU-Pro sobre las 1.730 preguntas por track, con media de los tracks estandar y de vision. El autor senala que las lenguas de bajos recursos (suajili, yoruba, bengali) son donde el modelo pierde mas rendimiento. No hay verificacion independiente de estas cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo completo se ejecuta en una unica GPU de 80 GB, sin servicios externos. El repositorio ocupa 44,3 GB en safetensors, por lo que el peso en memoria de los pesos es de ese orden, mas el coste de activaciones y del contexto de 131.000 tokens.
- GPU recomendadas: H100 80 GB o A100 80 GB, dado el requisito declarado de 80 GB en una sola tarjeta. Otras GPU de 80 GB (por ejemplo, variantes de la misma generacion) serian igualmente validas segun el fabricante.
- GPU de consumo: no disponible. Con 44,3 GB de pesos y un requisito de 80 GB, no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). No se documentan cuantizaciones GGUF/AWQ/GPTQ que permitan reducir la huella, por lo que no se puede afirmar que quepa en GPU de consumo.
- Opciones de despliegue: la model card declara `library_name: transformers` con `custom_code`, por lo que el camino soportado es Transformers con codigo propio del repositorio. Para vLLM, TGI, llama.cpp u Ollama no hay informacion en la documentacion proporcionada.
- Latencia y throughput: el unico dato concreto es el de transcripcion, 95 minutos de audio en aproximadamente 90 segundos. No hay cifras de throughput de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

Comparativa basada en los modelos incluidos en la tabla de rendimiento de la model card. Los pesos de los competidores no son abiertos, por lo que la comparacion de licencia y disponibilidad es asimetrica.

| Modelo | Parametros | Contexto | Licencia | Pesos abiertos | Perfil |
|---|---|---|---|---|---|
| Interfaze 1 Lite | no disponible | 131.000 tokens | Apache 2.0 | Si | MoA multimodal autocontenido en una GPU de 80 GB |
| Interfaze | no disponible | no disponible | no disponible | No (no se indica) | Modelo de referencia del mismo autor, con mejores cifras en GPQA, MMMLU, OCR y SQL |
| GPT-5.4-Mini | no disponible | no disponible | propietaria | No | Alternativa generalista; queda por debajo en todas las categorias publicadas salvo en las no medidas |
| Claude-Sonnet-4.6 | no disponible | no disponible | propietaria | No | Mejor en GPQA Diamond (89,9) y Spider 2.0-Lite (49,6); inferior en MMMLU y MMMU-Pro |
| Gemini-3-Flash | no disponible | no disponible | propietaria | No | Competitivo en MMMLU (88,7) y GPQA (88,5); por debajo en MMMU-Pro y OCR |

En la franja de modelos multimodales de pesos abiertos con capacidades de OCR, ASR y grounding, la informacion proporcionada no incluye alternativas comparables con datos de rendimiento, por lo que no se puede establecer una comparativa adicional fiable.

## Limitaciones y advertencias

- No se declara el numero de parametros totales ni activos, lo que dificulta estimar coste de inferencia, requisitos de memoria mas alla del dato de 80 GB y comparaciones de eficiencia.
- Los benchmarks estan medidos por el propio autor con los scorers oficiales, y las cifras de los competidores provienen de su leaderboard. No hay verificacion independiente en la informacion disponible, por lo que deben tratarse como resultados autodeclarados.
- Rendimiento desigual por idioma: el propio autor reconoce que las lenguas de bajos recursos (suajili, yoruba, bengali) son donde el modelo pierde mas en MMMLU. El soporte real de los 15 idiomas declarados puede variar mucho entre ellos.
- No se documentan datos de entrenamiento, composicion del dataset ni etapas de alineacion (RLHF/DPO), lo que impide evaluar sesgos de origen y limita la trazabilidad para usos regulados.
- Riesgo de alucinacion inherente a los modelos generativos; en tareas de OCR, extraccion de campos o texto a SQL conviene validar la salida contra el esquema y contra la fuente, especialmente cuando se usa el modo de planificacion libre.
- Restricciones de hardware severas: requiere una GPU de 80 GB. Sin cuantizaciones documentadas, no hay via practica de desplegarlo en hardware de consumo ni en GPUs de 24 o 48 GB.
- No hay informacion sobre soporte en servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama); la integracion depende de `custom_code` y de Transformers.
- El repositorio tiene 44,3 GB y 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya validado el modelo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no documentarse las licencias de los componentes especialistas internos, conviene revisar el repositorio completo antes de un despliegue comercial.
- El software de guardrails cubre 14 categorias de texto; no hay detalle sobre su cobertura de imagen ni sobre sus tasas de falsos positivos.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/interfaze-1-lite
- Sitio web: https://interfaze.ai
- Documentacion del modelo: https://interfaze.ai/docs/models/interfaze-1-lite
- Guia de ejecucion de tareas: https://interfaze.ai/docs/run-tasks
- Blog de presentacion: https://interfaze.ai/blog/the-first-open-weight-model-for-deterministic-work-interfaze-1-lite
- Repositorio GitHub: https://github.com/InterfazeAI/interfaze-1-lite
- Leaderboard de referencia: https://interfaze.ai/leaderboards

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces encontrados correspondian a paginas de Google Translate y no se han incluido por no ser pertinentes.
