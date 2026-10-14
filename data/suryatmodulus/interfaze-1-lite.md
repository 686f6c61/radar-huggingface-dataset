# suryatmodulus/interfaze-1-lite

## Resumen

Interfaze 1.1 Lite es un modelo multimodal "any-to-text" publicado por Interfaze AI (el repositorio de HuggingFace aparece bajo el autor `suryatmodulus`, mientras que la propia model card apunta a la organizacion `interfaze-ai/interfaze-1-lite`). No es una red unica, sino una arquitectura compuesta que el autor denomina mixture-of-architectures (MoA): un nucleo de razonamiento vision-lenguaje se combina con una serie de arquitecturas especialistas conectadas mediante llamadas de herramienta, cada una optimizada para un tipo de percepcion (lectura de documentos, reconocimiento de voz, segmentacion, deteccion de objetos, etc.).

El modelo esta disenado para cargas de trabajo de desarrollador: leer documentos (PDF de hasta 50 paginas por llamada, imagenes y Word), transcribir audio con marcas de tiempo y diarizacion de hablantes, localizar objetos y elementos de interfaz grafica, y responder sobre todo ello con salida estructurada. Incorpora una ventana de contexto de 131.000 tokens y soporta mas de 14 idiomas, ademas de traduccion en mas de 160 lenguas.

Su relevancia radica en que todo el sistema se ejecuta de forma autocontenida en una sola GPU de 80 GB sin servicios externos, con el nucleo de razonamiento cuantizado en FP8. La ficha del modelo incluye resultados de benchmarks que situan a la version 1 Lite por delante de modelos como GPT-5.4-Mini o Grok-4.3 en varias pruebas, aunque el propio autor advierte de que las puntuaciones corresponden a la version 1 Lite y que las de 1.1 se publicaran mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-architectures (MoA): nucleo de razonamiento decoder de atencion hibrida con vision encoder + especialistas (lector de documentos, detector de lineas, detector de layout, reconocedor de voz encoder-decoder, diarizacion, segmentacion promptable, modelo fundacional de series temporales, clasificador de seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantizacion | Nucleo de razonamiento en FP8; resto de cuantizaciones no disponible |
| Idiomas soportados | en, zh, es, fr, de, it, pt, ja, ko, ar, hi, bn, id, sw, yo (14+ idiomas listados; traduccion en mas de 160 lenguas) |
| Licencia | interfaze-open (license: other; enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se organiza en torno a un nucleo de razonamiento ("reasoning core") que es un decoder híbrido de atencion con un vision encoder, cuantizado en FP8 y con 131.000 tokens de contexto. Este nucleo planifica la tarea, decide que especialistas invocar mediante tool calls, ancla cajas delimitadoras sobre una rejilla 0-1000 y redacta la respuesta final. A su alrededor se despliegan varios modulos especializados: un lector de documentos entrenado para lectura de pagina; un detector y reconocedor de texto para geometria de lineas con caja y confianza; un detector de layout que identifica titulos, parrafos, tablas y figuras; un reconocedor de voz encoder-decoder con marcas de tiempo; un pipeline de diarizacion para atribucion de hablantes; un modelo de segmentacion promptable para siluetas y mascaras; un modelo fundacional de series temporales para prediccion; y un clasificador de seguridad (guardrails).

El modo de combinacion es relevante: el OCR se construye como dos vistas de una misma pagina cosidas (el lector aporta el texto y el detector de lineas la geometria, de modo que cada linea detectada toma las palabras del lector). Los hablantes se atribuyen palabra a palabra segun el mayor solapamiento con los turnos de cada hablante. La deteccion y el grounding de GUI se ejecutan sobre el nucleo de razonamiento, devolviendo cajas en la rejilla 0-1000. Existe ademas una modalidad de "run task" que omite la planificacion: nombrar una capacidad concreta (`task="ocr"`, `"speech_to_text"`, etc.) ejecuta ese especialista de forma directa y devuelve su resultado crudo.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset y si hubo RLHF o DPO: no disponible en la informacion proporcionada.

## Capacidades

- Comprension de documentos: extraccion de texto, orden de lectura, tablas y layout desde imagenes, PDF (hasta 50 paginas por llamada) y archivos Word, con caja y confianza para cada linea y palabra.
- Reconocimiento de voz: transcripcion con marcas de tiempo e identificacion de hablantes (diarizacion) en 99 idiomas; las grabaciones largas se cortan en pausas y se decodifican por lotes (se cita una grabacion de 95 minutos transcrita en unos 90 segundos).
- Grounding visual: deteccion de objetos de vocabulario abierto con contornos y grounding de elementos de interfaz grafica para agentes de uso de ordenador.
- Salida estructurada: respuestas restringidas a un esquema JSON proporcionado por el usuario, a partir de cualquier mezcla de texto, imagenes, documentos y audio.
- Traduccion: mas de 160 idiomas.
- Prediccion de series temporales a partir de CSV o JSON.
- Guardrails: comprobaciones de seguridad sobre texto e imagen, con codigos S1-S14 (S6 y S14 nunca).
- Razonamiento multilingue: ciencia, matematicas, SQL y conocimiento general en 14+ idiomas.
- Soporte de tool calling / function calling mediante las llamadas a especialistas.
- Modo de ejecucion directa por tarea (`task="ocr"`, `"speech_to_text"`, ...) que omite la fase de planificacion.
- Ejecucion autocontenida y offline en una sola GPU.

## Casos de uso

- Procesamiento masivo de documentos: extraer texto, tablas y layout de facturas, contratos o informes en PDF (hasta 50 paginas por llamada) con cajas y confianza por linea, usando `task="ocr"` para evitar la planificacion y maximizar el rendimiento.
- Digitalizacion de actas y reuniones: transcribir audio con marcas de tiempo y atribuir intervenciones a cada hablante (diarizacion) en grabaciones largas, aprovechando el troceado en pausas para procesar horas de audio en minutos.
- Atencion al cliente automatizada: gestionar conversaciones multi-turno sobre documentos adjuntos e imagenes con la ventana de 131k tokens, devolviendo respuestas ajustadas a un esquema JSON para integrarlas en un CRM.
- Agentes de uso de ordenador: localizar botones, campos y elementos de interfaz mediante grounding de GUI en la rejilla 0-1000 para automatizar flujos de escritorio o navegador.
- Analisis documental con salida estructurada: alimentar el modelo con mezclas de texto, imagenes y audio y forzar un JSON concreto para poblar bases de datos o pipelines de datos.
- Traduccion y localizacion: traducir contenido en mas de 160 idiomas como paso previo a la publicacion o a la indexacion multilingue.
- Moderacion y seguridad: aplicar el clasificador de guardrails sobre texto e imagen con codigos S1-S14 para filtrar contenido en plataformas de usuario.
- Prediccion y analitica: generar pronosticos de series numericas a partir de CSV o JSON para paneles de negocio o mantenimiento predictivo.
- Consultas SQL asistidas: traducir lenguaje natural a SQL (benchmark Spider 2.0-Lite) para herramientas de analitica de autoservicio.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion corresponden a **Interfaze 1 Lite** (no a 1.1), segun advierte el autor: "1.1 cambia el lector de documentos y el guard, y sus propias puntuaciones reemplazaran a estas cuando se midan". Fueron medidos por el equipo de Interfaze con el scorer oficial de cada benchmark; el resto de puntuaciones proceden del leaderboard de Interfaze.

| Benchmark | Que mide | Interfaze 1.1 Lite | Interfaze | GPT-5.4-Mini | Claude-Sonnet-4.6 | Gemini-3-Flash | Grok-4.3 |
|---|---|---|---|---|---|---|---|
| GPQA Diamond | Ciencia de nivel de posgrado | 85,9 | 92,4 | 82,8 | 89,9 | 88,5 | 73,6 |
| MMMLU | Conocimiento en 14 idiomas | 87,8 | 90,9 | 75,3 | 84,9 | 88,7 | 89,7 |
| MMMU-Pro | Razonamiento multimodal | 73,2 | 71,1 | 40,4 | 46,3 | 67,6 | 68,7 |
| olmOCR-Bench | OCR de documentos | 83,8 | 85,7 | 80,1 | 73,9 | 75,3 | 81,9 |
| OCRBench v2 (ingles) | Texto en imagenes | 60,9 | 70,7 | 52,7 | 54,7 | 55,8 | 54,7 |
| RefCOCO (Acc@0.5) | Grounding de expresiones referenciales | 83,8 | 82,1 | – | – | – | – |
| VoxPopuli-Cleaned (WER, menor es mejor) | Reconocimiento de voz | 3,01 | 2,4 | – | – | 4,0 | – |
| SOB (exactitud de valores) | Salida estructurada desde texto, imagenes y audio | 81,5 | 80,5 | – | 77,9 | 77,3* | – |
| Spider 2.0-Lite (SQLite) | Text-to-SQL | 48,9 | 52,9 | 26,7 | 49,6 | 45,2 | 45,9 |

Notas de la source: los conjuntos usados incluyen GPQA Diamond (las 198 preguntas), MMMLU-lite (19.950 preguntas, 1.425 por cada uno de 14 idiomas) y demas pruebas con scorer oficial. El asterisco (*) en Gemini-3-Flash corresponde a Gemini-3-Flash-Preview. No se han facilitado resultados desglosados por idioma mas alla de lo indicado.

## Requisitos de hardware

- VRAM: el modelo se ejecuta, segun su model card, en una sola GPU de 80 GB sin servicios externos. No se especifica el desglose de memoria por componente.
- GPU recomendadas: cualquier acelerador con 80 GB de VRAM (por ejemplo A100 80 GB o H100 80 GB). No se documenta soporte para GPUs de menor VRAM.
- GPU de consumo: no disponible; por el requisito de 80 GB no cabe en GPUs de consumo habituales (RTX 4090 de 24 GB, etc.) segun la informacion proporcionada.
- Opciones de despliegue: la libreria indicada es `transformers` y el modelo requiere `custom_code` (codigo personalizado), por lo que no se garantiza su uso directo con runners estandar. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el unico dato concreto aportado es que una grabacion de 95 minutos se transcribe en aproximadamente 90 segundos. No hay cifras de throughput de tokens por segundo ni de latencia de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntos fuertes (segun benchmarks citados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Interfaze 1.1 Lite | no disponible | 131k | MMMU-Pro 73,2; olmOCR 83,8; RefCOCO 83,8; SOB 81,5 | interfaze-open | safetensors en HuggingFace, transformers + custom_code |
| GPT-5.4-Mini | no disponible | no disponible | GPQA 82,8; MMLU-traducido 75,3; MMMU-Pro 40,4 | propietaria | API (no open weights) |
| Claude-Sonnet-4.6 | no disponible | no disponible | GPQA 89,9; MMMLU 84,9; Spider 49,6 | propietaria | API (no open weights) |
| Gemini-3-Flash | no disponible | no disponible | GPQA 88,5; MMMLU 88,7; MMMU-Pro 67,6 | propietaria | API (no open weights) |
| Grok-4.3 | no disponible | no disponible | GPQA 73,6; MMMLU 89,7; OCRBench v2 54,7 | propietaria | API (no open weights) |

No se dispone de datos de parametros ni de contexto de los modelos de comparacion en la informacion proporcionada; todos ellos son modelos propietarios servidos por API, mientras que Interfaze 1.1 Lite publica pesos safetensors bajo su licencia propia.

## Limitaciones y advertencias

- Los benchmarks presentados corresponden a Interfaze 1 Lite, no a 1.1; el autor advierte que las puntuaciones de 1.1 se publicaran cuando se midan, por lo que la comparacion actual es provisional.
- No se aporta informacion sobre sesgos conocidos, composicion del dataset ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion: no documentado explicitamente, aunque al tratarse de un modelo generativo multimodal con grounding sobre documentos y audio el riesgo existe; conviene validar salidas estructuradas antes de integrarlas en produccion.
- Limitacion de contexto: 131.000 tokens, lo que puede resultar insuficiente para documentos muy extensos o dialogos de gran duracion que superen ese limite.
- Cobertura de idiomas: se listan 14 idiomas en el card y 99 en reconocimiento de voz, pero la traduccion se anuncia en 160+ idiomas sin detalle de calidad por lengua.
- Licencia: es `interfaze-open` (license: other), una licencia personalizada; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que se desconoce si permite uso comercial irrestricto.
- Requisito de hardware: necesita una GPU de 80 GB para ejecutarse, lo que limita el despliegue en entornos de consumo o de bajos recursos.
- Dependencia de codigo personalizado (`custom_code`) en `transformers`, lo que puede complicar la integracion con herramientas estandar de inferencia.
- El repositorio de HuggingFace aparece bajo el autor `suryatmodulus` mientras que la model card referencia la organizacion `interfaze-ai`; conviene verificar cual es el canal oficial de pesos y licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/suryatmodulus/interfaze-1-lite
- Repositorio referenciado en el card: https://huggingface.co/interfaze-ai/interfaze-1-lite
- Licencia: https://huggingface.co/interfaze-ai/interfaze-1-lite/blob/main/LICENSE
- Web oficial: https://interfaze.ai
- Documentacion del modelo: https://interfaze.ai/docs/models/interfaze-1.1-lite
- Guia de ejecucion de tareas: https://interfaze.ai/docs/run-tasks
- Blog de presentacion: https://interfaze.ai/blog/introducing-interfaze-1-1-lite
- Repositorio GitHub: https://github.com/InterfazeAI/interfaze-1-lite
- Leaderboard de Interfaze: https://interfaze.ai/leaderboards
- Banner: https://huggingface.co/interfaze-ai/interfaze-1-lite/resolve/main/assets/interfaze-1.1-lite-banner.png
