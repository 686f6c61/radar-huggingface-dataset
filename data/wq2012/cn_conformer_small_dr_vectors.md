# wq2012/cn_conformer_small_dr_vectors

## Resumen

`wq2012/cn_conformer_small_dr_vectors` es un modelo de verificacion e identificacion de hablante (speaker verification) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementacion limpia en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google. No es un modelo de lenguaje: es un extractor de embeddings de hablante de 192 dimensiones construido sobre un backbone Conformer de tamano "small" con pooling temporal atento (ATP), funcion de perdida `extended_set_softmax` y puntuacion de verificacion basada en Dr-Vectors.

El modelo es deliberadamente pequeno: 2.088.007 parametros en el encoder, lo que lo situa muy por debajo de los sistemas de verificacion de hablante habituales (que suelen manejarse en decenas de millones de parametros). Se entreno sobre el dominio CN-Celeb2 (chino multi-genero) y se evaluo en tres dominios distintos: LibriSpeech (ingles leido), CN-Celeb2 y VoxCeleb1 (habla espontanea), con resultados de EER en el rango del 21-26 % para una sola utterance.

Su relevancia es fundamentalmente practica y reproducible: ofrece un checkpoint abierto (Apache 2.0), con pesos en safetensors y msgpack, frontend compatible con el extractor de caracteristicas de Whisper, y una evaluacion multi-dominio con intervalos de confianza bootstrap publicada junto al modelo. Resulta util como referencia reproducible en JAX para investigacion en reconocimiento de hablante, y como componente ligero en pipelines donde el coste computacional o la portabilidad a CPU sean criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (backbone `conformer` tamano `small`) con pooling temporal atento (`atp`) |
| Parametros totales | 2.088.007 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; no dispone de ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y flax msgpack; no se documentan esquemas de cuantizacion) |
| Idiomas soportados | no disponible en los metadatos; dominio de entrenamiento CN-Celeb2 (chino), evaluado tambien en ingles (LibriSpeech) y en habla espontanea multilingue (VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Configuracion adicional | `config.json` (`FlaxSpeakerConfig`), `preprocessor_config.json` (compatible con `WhisperFeatureExtractor`) |
| Libreria | `flaxspeaker` (JAX/Flax) |

## Arquitectura y entrenamiento

El modelo sigue la familia de disenos de reconocimiento de hablante descrita en las publicaciones de referencia: un encoder Conformer (convoluciones + auto-atencion) en configuracion "small", seguido de un pooling temporal atento (ATP, *Attentive Temporal Pooling*) que agrega la secuencia de tramas en un unico vector de 192 dimensiones. El entrenamiento utiliza la perdida `extended_set_softmax`, una extension de la familia Set- Softmax / GE2E descrita en *Generalized End-to-End Loss for Speaker Verification* (arXiv:1710.10467) y en *Dr-Vectors* (arXiv:2104.01989). La verificacion se realiza con puntuacion de tipo Dr-Vector, relacionada con el metodo *Parameter-Free Attentive Scoring* (PFAS, arXiv:2203.05642).

El frontend procesa audio a 16 kHz, extrae caracteristicas log-mel de 80 dimensiones, aplica deteccion de actividad de voz basada en energia y normalizacion CMVN antes de alimentar al encoder. El entrenamiento se realizo sobre el dominio CN-Celeb2. Los conjuntos de datos declarados en los metadatos incluyen `librispeech_asr`, `cnceleb` y `voxceleb`, empleados para el entrenamiento y/o la evaluacion multi-dominio. No se documenta en la informacion disponible el numero de tokens, horas de audio, composicion exacta del dataset, ni si hubo etapas de ajuste con RLHF o DPO (tecnicas propias de modelos de lenguaje y no aplicables directamente a este tipo de modelo).

Es importante senalar que el propio autor indica que este checkpoint es una reproduccion independiente *clean-room* de los algoritmos publicados, y que los experimentos originales de los articulos se realizaron con infraestructura y datos internos de Google, no con esta libreria ni con estos splits de datos publicos. El modelo no es un producto oficialmente soportado por Google.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de una utterance de audio.
- Verificacion de hablante uno-a-uno (comparacion de un audio de enrolamiento con un audio de prueba) devolviendo una puntuacion de similitud.
- Verificacion con multiples utterances de enrolamiento: la evaluacion publicada muestra mejoras consistentes al pasar de 1 a 3 utterances (por ejemplo, de 23,95 % a 18,97 % de EER en el pool universal).
- Funcionamiento multi-dominio: el modelo fue evaluado en ingles leido (LibriSpeech), chino multi-genero (CN-Celeb2) y habla espontanea de famosos (VoxCeleb1).
- Inferencia en JAX/Flax mediante la API de `flaxspeaker` (`load_pretrained`, `extract_embedding`, `verify`) y script de linea de comandos (`scripts/inference.py`).
- Integracion con el ecosistema Hugging Face Hub mediante `from_pretrained` de la libreria.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, soporte de agentes ni modo de razonamiento extendido (thinking mode). No es un modelo de lenguaje.
- No se documentan capacidades de diarizacion, deteccion de voz sintetica (anti-spoofing) ni reconocimiento de emociones.

## Casos de uso

- Verificacion biometrica ligera en aplicaciones moviles o embebidas: con 2,09 M de parametros el encoder es viable en CPU, lo que permite autenticacion por voz sin depender de GPU ni de servicios en la nube.
- Enrolamiento y control de acceso en productos en chino: el checkpoint se entreno sobre CN-Celeb2, por lo que es adecuado para escenarios de habla china donde se quiera un modelo pequeno y de licencia permisiva.
- Componente de embeddings para diarizacion de reuniones: los vectores de 192 dimensiones pueden alimentar un paso posterior de clustering (por ejemplo, agglomerative clustering) para separar interlocutores en transcripciones de reunion.
- Indexacion y busqueda por hablante en archivos de audio: extraer embeddings de un catalogo de grabaciones y recuperar por similitud coseno todas las apariciones de un mismo locutor.
- Preprocesado en pipelines de ASR o de personalizacion: usar la identidad estimada del hablante para seleccionar modelos de reconocimiento de voz o vocabularios especificos por usuario.
- Filtrado y control de calidad de datasets de voz: detectar grabaciones duplicadas o comprobar que un conjunto de audio atribuido a un locutor es coherente antes de usarlo para entrenamiento.
- Base para investigacion reproducible en JAX: sirve como punto de partida para experimentar con pooling atento, perdidas Set-Softmax/GE2E y esquemas de puntuacion Dr-Vector sin depender de frameworks propietarios.
- Verificacion de dos factores en centros de atencion telefonica: comparar la voz del cliente con un enrolamiento previo para reforzar la autenticacion antes de operaciones sensibles.

## Benchmarks y rendimiento

Resultados publicados en `eval_results.json` y en la model card, con intervalos de confianza bootstrap del 95 %.

Verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC 95 % (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 23,00 | [21,38; 24,57] | 0,9920 | 0,9273 | 0,8580 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 21,17 | [19,80; 22,80] | 0,9367 | 0,8253 | 0,8713 |
| VoxCeleb1 (habla espontanea) | 2.000 | 26,30 | [24,47; 28,28] | 0,9850 | 0,9320 | 0,8290 |
| Pool universal (3 dominios) | 8.000 | 23,95 | [23,09; 24,91] | 0,9965 | 0,9395 | 0,8462 |
| Media macro por dominio | 8.000 | 23,49 | no disponible | 0,9712 | 0,8949 | 0,8528 |

Verificacion con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 16,20 | [13,80; 18,40] | 0,9040 | 0,9255 |
| CN-Celeb2 (3-utt) | 1.000 | 16,70 | [14,65; 19,20] | 0,8680 | 0,9089 |
| VoxCeleb1 (3-utt) | 1.000 | 20,40 | [18,25; 23,40] | 0,9740 | 0,8737 |
| Pool universal (3-utt) | 3.000 | 18,97 | [17,47; 20,43] | 0,9627 | 0,8964 |
| Media macro por dominio (3-utt) | 3.000 | 17,77 | no disponible | 0,9153 | 0,9027 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de reconocimiento de hablante (por ejemplo VoxCeleb1-O con protocolo completo, CN-Celeb1-E o evaluaciones tipo NIST SRE), ni comparaciones directas con otros sistemas dentro de la propia model card.

## Requisitos de hardware

- Huella de memoria: 2.088.007 parametros. En fp32 los pesos ocupan aproximadamente 8,4 MB; en bf16/fp16, unos 4,2 MB. La memoria adicional vendra del estado de activaciones durante el forward, dependiente de la duracion del audio.
- GPU: no se requieren. Cualquier GPU moderna (RTX 3060 o superior, T4, A100, H100) puede ejecutar el modelo, pero no aporta ventajas significativas frente a CPU dado el tamano.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo, e incluso es ejecutable en CPU en entornos de produccion modestos.
- Despliegue: la via soportada es la libreria `flaxspeaker` (JAX/Flax) desde PyPI, cargando el checkpoint desde Hugging Face Hub o desde disco local. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, TensorRT ni TensorFlow Lite, ya que no es un modelo autorregresivo de texto.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo real (RTF), latencia por utterance ni throughput en la informacion proporcionada.
- El repositorio ocupa 0,0 GB segun los metadatos de Hugging Face, coherente con el reducido tamano del checkpoint.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa dentro de la informacion proporcionada. A continuacion se listan alternativas de la misma categoria funcional (extraccion de embeddings de hablante y verificacion), indicando que la mayoria de sus cifras no constan en la documentacion facilitada y no deben darse por validas sin consultar sus fuentes originales.

| Modelo | Tipo | Parametros | Dominio de entrenamiento | Licencia | Rendimiento (EER) |
|---|---|---|---|---|---|
| `wq2012/cn_conformer_small_dr_vectors` | Conformer small + ATP + Dr-Vector | 2.088.007 | CN-Celeb2 | Apache 2.0 | 21,17-26,30 % (1-utt); 16,20-20,40 % (3-utt) |
| ECAPA-TDNN (implementaciones publicas tipo SpeechBrain) | TDNN con attention statistics pooling | no disponible en la informacion proporcionada | VoxCeleb (habitual) | variable segun implementacion | no disponible |
| WeSpeaker / ResNet-based speaker embeddings | ResNet con pooling estadistico | no disponible | VoxCeleb, CN-Celeb (habitual) | variable | no disponible |
| X-vector clasico (TDNN) | TDNN con pooling estadistico | no disponible | VoxCeleb, otros | variable | no disponible |
| Otros checkpoints de la coleccion FlaxSpeaker | Conformer / variantes | no disponible | distintos dominios | Apache 2.0 (segun coleccion) | no disponible |

Nota: el EER de este checkpoint (21-26 % en 1 utterance) es sustancialmente mas alto que el de los sistemas de verificacion de hablante de referencia en la literatura, que suelen operar en el rango de fracciones de punto porcentual en VoxCeleb1-O. Esto es coherente con su naturaleza de modelo "small" con 2,09 M de parametros entrenado en un unico dominio. Cualquier comparacion cuantitativa con otros sistemas requiere reproducir la evaluacion con el mismo protocolo, ya que aqui los trials, el numero de utterances y los splits no coinciden necesariamente con los de los benchmarks publicos habituales.

## Limitaciones y advertencias

- Precision limitada: el EER de una sola utterance oscila entre el 21,17 % y el 26,30 % segun dominio. Esto implica tasas de error elevadas para escenarios de autenticacion con requisitos de seguridad estrictos.
- El rendimiento mejora con multi-enrolamiento (3 utterances), pero incluso asi el EER se mantiene entre el 16,20 % y el 20,40 %. No se documentan resultados con mas utterances.
- Sesgo de dominio: el modelo se entreno sobre CN-Celeb2 (chino). Aunque se evaluo en LibriSpeech y VoxCeleb1, no se documenta un ajuste especifico para otros idiomas, acentos, edades, generos o condiciones de grabacion.
- Riesgo de degradacion en condiciones no vistas: ruido de fondo, canales telefonicos, reverberacion o codecs agresivos pueden afectar negativamente al embedding, ya que no se documentan evaluaciones en estas condiciones.
- No es un sistema anti-spoofing: no se documenta ninguna capacidad para detectar voz sintetica, reproduccion o deepfakes de voz. Usarlo como unico factor de autenticacion es desaconsejable.
- Riesgo de colision entre hablantes con voces similares, especialmente en audios cortos, dado el reducido tamano del encoder.
- Ausencia de umbrales recomendados: la model card no especifica umbrales de decision calibrados por dominio, por lo que en produccion habria que calibrarlos con datos propios.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. El autor aclara explicitamente que no es un producto soportado oficialmente por Google, pese a reimplementar algoritmos publicados por esa empresa.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y se actualizo por ultima vez el 2026-10-15, lo que sugiere un proyecto de baja actividad y sin soporte amplio de la comunidad.
- Metadatos incompletos: no se declaran idiomas soportados en la ficha de Hugging Face, ni detalles del dataset de entrenamiento (horas, composicion, hablantes).
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/cn_conformer_small_dr_vectors
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E, *Generalized End-to-End Loss for Speaker Verification*: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, *Decision Residual Networks and an Improved Loss for Speaker Recognition*: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, *Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech*: https://arxiv.org/abs/2202.12163
- Paper PFAS, *Parameter-Free Attentive Scoring for Speaker Verification*: https://arxiv.org/abs/2203.05642
