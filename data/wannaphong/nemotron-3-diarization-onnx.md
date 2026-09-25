# wannaphong/Nemotron-3-Diarization-ONNX

## Resumen

Nemotron-3-Diarization-ONNX es una exportación a ONNX del modelo de diarización de hablantes nvidia/Nemotron-3-Diarization, publicada por el usuario wannaphong. Su función es resolver "quién habla y cuándo" en una grabación de audio completa, en modo offline, con hasta 8 hablantes rastreados simultáneamente y una resolución temporal de 10 ms. No es un modelo de lenguaje: no genera texto ni acepta prompts, y su etiqueta de pipeline en HuggingFace es voice-activity-detection.

El interés de esta conversión es de despliegue: los tres grafos ONNX incluidos permiten ejecutar la inferencia en CPU con únicamente numpy, onnxruntime y soundfile, sin PyTorch ni CUDA. El grafo int8 ocupa 103,7 MB y el fp32 397,4 MB, de modo que cabe en cualquier portátil o servidor modesto, algo relevante para pipelines de diarización por lotes donde no se quiere reservar GPU.

La conversión es independiente y no está producida ni respaldada por NVIDIA. El autor documenta la paridad numérica con la referencia en PyTorch (DER 9,225% en fp32 frente a 9,226% de la referencia sobre las 16 reuniones de test de AMI) y publica la tolerancia y el detalle por archivo en docs/RESULTS.md, además del pipeline de exportación, cuantización y verificación en scripts/.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de diarizacion de hablantes tipo Sortformer, exportado como grafo de paso ("chunk-step"): preprocesador log-mel + encoder y cabecera |
| Parametros totales | Aproximadamente 100 M (dato del modelo base segun explainx.ai; coherente con los 397,4 MB del grafo fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: procesamiento por pasos de 30,4 s sobre la grabacion completa en modo offline |
| Tipos de cuantizacion | fp32 (model.onnx) e int8 dinamica por canal (model.int8.onnx, grafo por defecto) |
| Idiomas soportados | no disponible (no se declaran idiomas en la informacion proporcionada) |
| Licencia | openmdw-1.1 |
| Formato de pesos | ONNX (model.onnx, model.int8.onnx, preprocessor_core.onnx) y constants.npz |
| Frecuencia de muestreo de entrada | 16 kHz obligatorios; se lanza ValueError si sr != 16000 |
| Resolucion de trama | 10 ms |
| Hablantes simultaneos maximos | 8, ordenados por primera aparicion |
| Canales de entrada | audio mono; el downmix de multicanal se hace automaticamente |
| Modo de inferencia | solo offline (grabacion completa); no se exporta el modo streaming |
| Tamano del repositorio | 0,5 GB (MB decimales, 10^6 bytes) |
| Dependencias de ejecucion | numpy, onnxruntime, soundfile (sin PyTorch) |

## Arquitectura y entrenamiento

El modelo base sigue el esquema Sortformer descrito por NVIDIA: la salida tiene un canal por hablante y la permutacion se resuelve ordenando dichos canales segun la primera aparicion de cada hablante en el audio. La exportacion separa el sistema en tres grafos: preprocessor_core.onnx (0,14 MB) convierte la forma de onda en un espectrograma log-mel mediante llamadas ventaneadas de memoria acotada; model.onnx (397,4 MB, fp32) y model.int8.onnx (103,7 MB, int8 dinamica por canal) contienen un paso de 30,4 s del encoder mas la cabecera. constants.npz (0,01 MB) guarda la configuracion de la cache de hablantes y el peso silence_embeds que necesita diarize.py.

La parte mas delicada del port es la cache de hablantes en streaming, reimplementada en numpy: en cada paso de compresion conserva solo las speaker_cache_length tramas mas relevantes, seleccionadas mediante una puntuacion top-k. Cuando dos tramas puntuan exactamente igual, la implementacion de PyTorch en CPU y la de esta exportacion pueden elegir tramas distintas, lo que explica las pequenas diferencias en modo libre frente a la paridad exacta en modo teacher-forced. Los tres grafos ONNX tienen eliminados los metadatos de depuracion del exportador (trazas de pila con rutas locales) mediante scripts/strip_metadata.py, verificado sin cambios en las salidas de onnxruntime.

No se dispone de informacion sobre el entrenamiento del modelo base (numero de tokens o horas de audio, composicion del dataset, uso de RLHF/DPO) en la documentacion proporcionada, y esta exportacion no reentrena ni ajusta ningun peso.

## Capacidades

- Diarizacion de hablantes en modo offline sobre la grabacion completa: devuelve, por cada trama de 10 ms, una probabilidad por hablante con forma (1, num_frames, 8).
- Seguimiento de hasta 8 hablantes concurrentes, con orden de canales fijado por la primera aparicion de cada voz.
- Deteccion de actividad de voz implicita (pipeline_tag declarado: voice-activity-detection).
- Conversion directa de la salida a formato RTTM mediante segments_to_rttm, y extraccion de segmentos con extract_speaker_dict.
- Ejecucion en CPU sin PyTorch, con control del numero de hilos de onnxruntime (por ejemplo threads=8).
- Interfaz de linea de comandos: python diarize.py meeting.wav --out meeting.rttm.
- Validacion de entrada: error explicito si la frecuencia de muestreo no es 16 kHz y downmix automatico de audio multicanal a mono.
- No realiza reconocimiento automatico del habla, traduccion, generacion de texto, tool calling, razonamiento multi-paso ni procesamiento de vision. No hay modo "thinking" ni soporte multimodal.
- No se declaran capacidades multilingues; al ser un modelo acustico la diarizacion no depende idiomaticamente del contenido, pero no hay evaluacion multilingue en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones con etiquetado de interlocutor: se combina la salida RTTM con un sistema ASR externo para producir transcripciones del tipo "hablante 2: ...", aprovechando la resolucion de 10 ms para alinear turnos rapidos.
- Actas y resumenes con atribucion de turnos: el RTTM generado permite segmentar la reunion por hablante y alimentar despues un modelo de resumen que respete quien dijo cada cosa.
- Investigacion cualitativa y entrevistas: en audio de dos a ocho participantes (entrevistas grupales, grupos focales), la ordenacion por primera aparicion simplifica el etiquetado manual posterior de los hablantes.
- Pre-anotacion de corpus para anotacion humana: el modelo genera una primera capa de segmentos que los anotadores corrigen, reduciendo el coste frente a la anotacion desde cero.
- Subtitulado con identificacion de interlocutores: se puede unir el RTTM a los subtitulos existentes para marcar cambios de hablante en contenido tipo podcast o documental.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse solo con onnxruntime sobre CPU y con el grafo int8 de 103,7 MB, encaja en flotas de workers economicos o en entornos con restricciones de hardware.
- Auditoria y revision de grabaciones largas: la segmentacion por hablante permite buscar e indexar rapidamente quien intervino en cada tramo de una grabacion de reuniones o de atencion telefonica de pocos interlocutores.
- Referencia reproducible para evaluacion: el autor publica el protocolo de medida y los resultados por reunion, lo que sirve como linea base en CPU para comparar variantes de cuantizacion o de port a otros runtimes.

## Benchmarks y rendimiento

Evaluacion con el protocolo de la model card de NVIDIA: las 16 reuniones del split test de AMI, Mix-Headset, verdad de referencia por alineacion forzada, collar 0, solapamiento puntuado y umbral 0,5.

| Sistema | DER | Miss | FA | Confusion |
|---|---|---|---|---|
| PyTorch (referencia) | 9,226% | 4,68% | 3,67% | 0,88% |
| Esta exportacion, fp32 | 9,225% | 4,68% | 3,67% | 0,88% |
| Esta exportacion, int8 | 9,248% | 4,80% | 3,58% | 0,87% |

La model card del modelo base declara 9,25% de DER bajo este protocolo; la referencia en PyTorch reproducida por el autor obtiene 9,226%, y los grafos fp32 e int8 de esta exportacion se mantienen a 0,02 y 0,03 puntos de esa cifra. Por reunion, la diferencia entre int8 y PyTorch va de -0,14 a +0,28 puntos de DER en las 16 reuniones (peores casos: IS1009b -0,14 y IS1009c +0,28).

Paridad con PyTorch, medida sobre ES2004a (17,5 min) y TS3006d (49,5 min, usado como prueba de estres de la compresion de cache):

| Comparacion | Resultado |
|---|---|
| Teacher-forced, maxima diferencia absoluta de probabilidad | 1,4e-05 (ES2004a) y 1,3e-05 (TS3006d) |
| Teacher-forced, acuerdo de trama al umbral 0,5 | 100,000% en ambos archivos |
| Free-running, DER (esta exportacion frente a PyTorch) | 0,000% (ES2004a) y 0,035% (TS3006d) |

Criterio de aceptacion de int8: DER(int8, fp32) <= 1,0% absoluto por archivo (collar de +-0,25 s, solapamiento puntuado). Se cumplio en todos los archivos dentro de la capacidad de 8 hablantes, pero fallo en los dos archivos con mas hablantes reales que ranuras de salida: 13 hablantes dieron 3,70% y 14 hablantes 11,97%. Tras investigarlo, el criterio se reviso a: dentro de capacidad sigue aplicando el 1,0%; por encima de capacidad, int8 no debe ser peor que fp32 frente a la verdad de referencia, con una tolerancia de +0,5 puntos. La investigacion atribuye el fallo a que, superada la capacidad, una unica diferencia de redondeo de int8 puede cambiar la trama que se conserva en un empate exacto de la cache, tras lo cual ambas rutas son validas pero divergentes.

Aparte de estos datos, no se han publicado resultados de benchmarks en la informacion disponible para las otras conversiones ONNX del mismo modelo base.

## Requisitos de hardware

- Inferencia solo en CPU con onnxruntime; no se requiere GPU ni CUDA.
- VRAM: no aplica, no hay requisito de VRAM.
- Memoria RAM estimada a partir del tamano de los pesos (estimacion, no dato medido): del orden de 200-300 MB con el grafo int8 y alrededor de 500 MB-1 GB con el fp32, mas el buffer de audio y las estructuras de la cache.
- GPU recomendadas: ninguna en particular; el proyecto no documenta ruta GPU. Podria probarse onnxruntime-gpu, pero no aparece en la informacion proporcionada.
- Cabe en cualquier portatil o mini-PC actual: el grafo int8 son 103,7 MB y el fp32 397,4 MB, ambos en disco.
- Opciones de despliegue documentadas: onnxruntime en Python (clase OnnxDiarizer, con parametro threads) y la CLI diarize.py con salida RTTM. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos generativos.
- Seleccion de grafo: model.int8.onnx por defecto; para fp32 se pasa --model model.onnx en la CLI o model_filename="model.onnx" en la clase.
- Latencia y throughput: no disponible. El diseno procesa la grabacion en pasos de 30,4 s y usa una cache de hablantes comprimida, pero no se publican tiempos de ejecucion medidos.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Modos | DER (AMI test, protocolo NVIDIA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wannaphong/Nemotron-3-Diarization-ONNX | ONNX fp32 + int8 | ~100 M | Solo offline | 9,225% (fp32) / 9,248% (int8) | openmdw-1.1 | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| nvidia/Nemotron-3-Diarization (base) | PyTorch | ~100 M | Streaming y offline | 9,25% segun su model card | no disponible en la informacion proporcionada | Publicado por NVIDIA |
| onnx-community/Nemotron-3-Diarization-ONNX | ONNX | no disponible | no disponible | no disponible | no disponible | Publicado |
| NealCaren/Nemotron-3-Diarization-ONNX | ONNX | no disponible | no disponible | no disponible | no disponible | Publicado |

Nota sobre discrepancias de medida: una fuente secundaria (explainx.ai) describe el modelo base como un modelo abierto de 100 M de parametros con 14,72% de DER y hasta 8 hablantes solapados. La diferencia frente al 9,25% de la model card y al 9,226% de la referencia reproducida por el autor sugiere protocolos o conjuntos de evaluacion distintos, pero la informacion disponible no permite confirmar cual es la causa, por lo que ambas cifras deben manejarse por separado y con su fuente.

## Limitaciones y advertencias

- Capacidad maxima de 8 hablantes: con 13 hablantes reales el int8 se desvia 3,70% respecto al fp32 y con 14 hablantes la desviacion sube al 11,97%; mas alla de esa capacidad el sistema reparte voces entre las ranuras disponibles.
- Solo modo offline: la exportacion procesa la grabacion completa y no reproduce el modo streaming del modelo base, por lo que no sirve para diarizacion en tiempo real con audio que llega por trozos.
- Frecuencia de muestreo fija: todos los calculos posteriores asumen 16 kHz; el autor advierte de que una tasa incorrecta produciria basura con aspecto plausible, por lo que la comprobacion lanza ValueError en lugar de continuar. Hay que remuestrear antes si el audio original no esta a 16 kHz.
- Sensibilidad a los empates de la cache: cuando dos tramas puntuan exactamente igual, la eleccion de trama puede diferir entre implementaciones; en modo libre esto genera divergencias pequenas pero reales (DER de 0,000% a 0,035% frente a PyTorch en los dos archivos de prueba) que pueden amplificarse en audio muy largo.
- Evaluacion limitada: los numeros publicados proceden de las 16 reuniones del split test de AMI con Mix-Headset; no hay resultados para otros dominios (telefonia, reuniones lejanas con reverberacion, audio multilingue) ni sobre el numero de hablantes en escenarios reales mas alla de los casos de capacidad.
- Idiomas: no se declaran idiomas soportados; al ser un modelo acustico no depende del lexico, pero no hay evidencia multilingue publicada.
- Metadatos eliminados: los grafos llevan borrada la informacion de depuracion del exportador; el autor verifica que las salidas de onnxruntime son identicas, pero conviene no depender de metadatos ONNX para trazabilidad.
- Licencia openmdw-1.1: la informacion proporcionada no detalla las condiciones de uso comercial. Hay que consultar el texto de la licencia enlazado antes de un despliegue en produccion.
- Origen independiente: no es una publicacion de NVIDIA y NVIDIA no respalda esta conversion; los avisos NOTICE y LICENSE del repositorio aplican.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe el riesgo de asignar tramas a un hablante equivocado (confusion del 0,88% en la referencia), especialmente en segmentos solapados o con voces similares.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, y el repositorio se creo y actualizo el mismo dia, por lo que no hay historial de uso en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/wannaphong/Nemotron-3-Diarization-ONNX
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Texto de la licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Conversion ONNX de la comunidad (onnx-community): https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX
- Conversion ONNX de NealCaren: https://huggingface.co/NealCaren/Nemotron-3-Diarization-ONNX
- Articulo sobre Nemotron 3 Diarization (100 M de parametros, 14,72% de DER): https://www.explainx.ai/blog/nvidia-nemotron-3-diarization-open-weight-eight-speakers-2026
- Pagina de la familia Nemotron 3 de NVIDIA Research: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Ficha en Dell Enterprise Hub (modos streaming y offline, herencia de Sortformer): https://dell.huggingface.co/models/nvidia/Nemotron-3-Diarization
- Verdad de referencia por alineacion forzada usada en la evaluacion (CC BY 4.0): https://github.com/nttcslab-sp/diar-forced-alignment
