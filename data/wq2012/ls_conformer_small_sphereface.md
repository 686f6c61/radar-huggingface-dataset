# wq2012/ls_conformer_small_sphereface

## Resumen

`ls_conformer_small_sphereface` es un modelo de verificacion e identificacion de hablante (speaker verification / speaker recognition) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproduccion open source en JAX/Flax de algoritmos de reconocimiento de hablante descritos en las publicaciones GE2E, Dr-Vectors, Conformer-ATP y PFAS. El modelo no es un producto oficial de Google: es una implementacion independiente tipo clean-room, y los articulos originales se validaron con infraestructura y datos internos propietarios, no con esta libreria ni con estos splits publicos.

Se trata de un encoder de audio no generativo: convierte una utterance en un embedding de 192 dimensiones que despues se compara mediante similitud coseno para decidir si dos audios pertenecen al mismo hablante. La arquitectura es un Conformer de tamano "small" con pooling temporal atento (ATP) y entrenamiento con perdida SphereFace, con un frontend de 80 dimensiones log-mel a 16 kHz mas VAD por energia y CMVN. El encoder tiene solo 2.029.892 parametros, lo que lo situa en la gama ultra-ligera y permite inferencia en CPU.

Su relevancia practica esta en que ofrece un pipeline completo y reproducible (pesos en safetensors, configuracion compatible con `WhisperFeatureExtractor`, resultados de evaluacion con intervalos de confianza bootstrap) para construir sistemas de verificacion biometrica por voz, diarizacion o indexado por hablante sin depender de checkpoints propietarios. El coste de esa ligereza es un rendimiento modesto: 14,73 % de EER en LibriSpeech y 22-30 % en dominios multilingues o in-the-wild.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con temporal pooling `atp` (attentive temporal pooling) |
| Parametros totales | 2.029.892 (parametros del encoder, dato de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de tokens; entrada de audio a 16.000 Hz con log-mel de 80 dimensiones, VAD por energia y CMVN |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles en los metadatos; el dominio de entrenamiento es LibriSpeech (ingles leido) y la evaluacion incluye CN-Celeb2 (chino multigenero) y VoxCeleb1 (ingles in-the-wild) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y msgpack nativo de Flax (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Perdida de entrenamiento | sphereface |
| Scoring de verificacion | cosine |
| Frontend de audio | 80-dim log_mel a 16 kHz + Energy VAD + CMVN (compatible con `WhisperFeatureExtractor`) |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline declarado | audio-classification |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion `small`, una arquitectura que combina bloques convolucionales con auto-atencion para capturar tanto patrones locales del espectrograma como dependencias temporales largas. Sobre la secuencia de representaciones se aplica un pooling temporal atento (ATP), la tecnica descrita en el articulo de Conformer-ATP para language identification en habla de formato largo, que agrega la informacion en un unico vector de 192 dimensiones en lugar de promediar uniformemente. El entrenamiento utiliza la perdida SphereFace, una variante de margen angular (A-Softmax) originaria del reconocimiento facial y adaptada aqui al dominio de hablante, mientras que la verificacion en inferencia se realiza con similitud coseno entre embeddings. El modelo pertenece a la familia de metodos contrastivos tipo GE2E y Dr-Vectors para generar embeddings discriminativos por hablante.

El dominio de entrenamiento declarado es LibriSpeech, es decir, ingles leido. La model card no detalla el numero de tokens o horas de audio utilizadas, la composicion exacta del dataset, ni si hubo etapas de refinamiento tipo RLHF o DPO (tecnicas, por otra parte, no aplicables a un encoder contrastivo de este tipo). Si se documentan las dependencias de preprocesado: VAD por energia, normalizacion de media y varianza (CMVN) y extraccion log-mel de 80 dimensiones a 16 kHz, lo que hace que el pipeline sea reproducible de forma determinista. La evaluacion se publica con intervalos de confianza bootstrap al 95 %, un detalle poco habitual en checkpoints de este tamano.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de una utterance de audio.
- Verificacion de hablante (1:1) mediante puntuacion por similitud coseno entre un audio de enrolamiento y un audio de prueba.
- Identificacion de hablante (1:N) por comparacion del embedding contra una galeria de referencia.
- Enrolamiento multiple: el modo de 3 utterances reduce el EER de forma consistente en todos los dominios evaluados.
- Reconocimiento multilingue parcial: aunque se entrena en ingles, se evalua con exito relativo en chino (CN-Celeb2) y en audio in-the-wild (VoxCeleb1), con degradacion notable respecto al dominio de entrenamiento.
- Preprocesado integrado: VAD por energia y CMVN dentro del propio pipeline de inferencia, mas un frontend compatible con `WhisperFeatureExtractor`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni capacidades de agente: es exclusivamente un encoder de audio.

## Casos de uso

- Verificacion biometrica de acceso por voz: enrolar al usuario con uno o varios audios y validar su identidad en cada interaccion comparando el score coseno contra un umbral calibrado con las metricas minDCF publicadas.
- Diarizacion y etiquetado de hablantes: usar los embeddings de 192 dimensiones como entrada a un clustering (por ejemplo, agglomerative clustering) para segmentar reuniones o podcasts por locutor antes de pasar cada segmento a un motor ASR.
- Indexado y busqueda de audio por hablante: precalcular embeddings de un archivo historico de grabaciones y construir un indice vectorial que permita recuperar todas las intervenciones de una persona concreta.
- Control de calidad en la recoleccion de datasets de voz: filtrar utterances que no pertenecen al locutor objetivo o detectar audios con multiples hablantes antes de etiquetar, usando el score de verificacion como criterio de aceptacion.
- Antifraude y verificacion de identidad en atencion telefonica: comparar la voz del interlocutor con un enrolamiento previo para detectar suplantaciones, con la advertencia de que el EER en dominio in-the-wild (22,20 % en VoxCeleb1) exige combinarlo con otros factores de autenticacion.
- Personalizacion de asistentes de voz: seleccionar el perfil acustico o el modelo de ASR adecuado segun el hablante detectado, mejorando la precision en entornos con varios usuarios recurrentes.
- Investigacion y docencia en reconocimiento de hablante: al ser un checkpoint de 2 millones de parametros con pesos abiertos y licencia Apache-2.0, sirve como banco de pruebas reproducible para estudiar el efecto de la perdida SphereFace, el pooling ATP o el enrolamiento multiple sobre el EER.

## Benchmarks y rendimiento

Resultados de verificacion con una unica utterance (1-utt), extraidos de los ficheros de evaluacion publicados por el autor:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,73 | [13,63; 16,22] | 0,9667 | 0,7040 | 0,9267 |
| CN-Celeb2 (chino multigenero) | 3.000 | 29,93 | [28,22; 31,42] | 0,9427 | 0,9147 | 0,7772 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,20 | [20,20; 23,95] | 0,9480 | 0,8900 | 0,8680 |
| Universal pooled (3 dominios) | 8.000 | 23,29 | [22,35; 24,10] | 0,9685 | 0,8355 | 0,8569 |
| Universal macro-average (3 dominios) | 8.000 | 22,29 | no disponible | 0,9525 | 0,8362 | 0,8573 |

Resultados con enrolamiento multiple de 3 utterances (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,00 | [9,00; 13,00] | 0,7800 | 0,9581 |
| CN-Celeb2 (3-utt) | 1.000 | 23,10 | [20,60; 26,00] | 0,9640 | 0,8412 |
| VoxCeleb1 (3-utt) | 1.000 | 16,30 | [14,20; 19,00] | 0,8880 | 0,9061 |
| Universal pooled (3-utt) | 3.000 | 17,97 | [16,52; 19,27] | 0,9407 | 0,9042 |
| Universal macro-average (3-utt) | 3.000 | 16,80 | no disponible | 0,8773 | 0,9018 |

No se han publicado en la informacion disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K) porque no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 MB en fp32 y 4 MB en fp16, calculado a partir de los 2.029.892 parametros del encoder; el dato exacto de memoria en ejecucion no esta disponible.
- GPU recomendadas: no se indica ninguna en la documentacion. Cualquier GPU con mas de 1 GB de memoria es sobradamente suficiente; incluso una GPU integrada o una RTX de gama de entrada resulta desproporcionada para este tamano.
- Cabe en GPU de consumo: si, en cualquier modelo actual (RTX 3050, RTX 4090, etc.) e incluso en CPU sin aceleracion, dado que el encoder tiene 2 millones de parametros.
- Opciones de despliegue: la ruta oficial es la libreria `flaxspeaker` (JAX/Flax), con API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de linea de comandos `scripts/inference.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un encoder de audio de este tipo. El frontend es compatible con `WhisperFeatureExtractor` de HuggingFace Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. El cuello de botella realista no sera el encoder, sino la extraccion de caracteristicas log-mel y el VAD sobre audios largos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | EER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ls_conformer_small_sphereface | 2.029.892 (encoder) | Audio 16 kHz, log-mel 80 dim | 14,73 % (LibriSpeech 1-utt), 23,29 % (pooled 1-utt) | Apache-2.0 | HuggingFace, PyPI (`flaxspeaker`), GitHub |
| Alternativas de la misma categoria (ECAPA-TDNN, x-vector, i-vector) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados comparativos contra otros sistemas de verificacion de hablante medidos sobre los mismos splits, por lo que no es posible establecer una comparacion cuantitativa fiable. Como referencia conceptual, la perdida SphereFace empleada aqui proviene del reconocimiento facial (SphereFace, arXiv:1704.08063), y el resto de componentes siguen los articulos GE2E, Dr-Vectors, Conformer-ATP y PFAS citados por el autor.

## Limitaciones y advertencias

- Rendimiento modesto en terminos absolutos: un EER del 14,73 % en el propio dominio de entrenamiento y del 22-30 % en dominios multilingues o in-the-wild esta lejos de lo que se espera de un sistema de verificacion de hablante en produccion.
- Fuerte degradacion fuera del dominio: CN-Celeb2 (chino) alcanza un 29,93 % de EER y VoxCeleb1 un 22,20 %, frente al 14,73 % de LibriSpeech. El modelo esta entrenado en ingles leido y no se ha disenado para audio espontaneo, ruidoso o multilingue.
- No es un producto oficial de Google: es una reproduccion clean-room independiente. Los resultados de los articulos originales no son trasladables a este checkpoint.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto; su modo de fallo es la confusion entre hablantes (falsos positivos y falsos negativos), no la fabricacion de contenido.
- Sesgos: no se ha publicado ningun analisis de sesgos por acento, edad, genero o canal en la informacion disponible. Dado el dominio de entrenamiento (Lectura en ingles), es razonable esperar sesgo hacia ese tipo de voz, pero no hay mediciones.
- Restricciones de licencia: la licencia es Apache-2.0, que permite uso comercial, modificacion y redistribucion con atribucion. No se declaran restricciones adicionales.
- Caveat de produccion: los umbrales de decision deben recalibrarse por dominio usando las metricas minDCF publicadas como punto de partida; los valores de minDCF@0.01 proximos a 0,95 en todos los dominios indican un comportamiento pobre en el regimen de falsa aceptacion muy baja.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre estos resultados.
- Sin informacion sobre cuantizacion: no se documentan variantes GGUF, int8 o int4, lo que limita el uso fuera del ecosistema JAX/Flax.
- La model card consultada aparece truncada al final de la seccion de citas, por lo que podria existir informacion adicional no recogida aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_sphereface
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- GE2E: Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors: Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP: Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS: Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- SphereFace: Deep Hypersphere Embedding for Face Recognition (origen de la perdida A-Softmax): https://arxiv.org/abs/1704.08063
- Implementacion de referencia de SphereFace: https://github.com/wy1iu/sphereface
