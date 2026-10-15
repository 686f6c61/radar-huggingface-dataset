# wq2012/ls_resnet_small_ge2e

## Resumen

`ls_resnet_small_ge2e` es un modelo de verificacion de locutor (speaker verification) publicado en HuggingFace por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: se trata de un extractor de embeddings de voz de 192 dimensiones que, a partir de una grabacion de audio, produce una representacion vectorial que permite decidir si dos fragmentos corresponden al mismo hablante. La comparacion entre embeddings se realiza mediante similitud coseno.

El modelo es una reproduccion open source, independiente y "clean-room", en JAX/Flax de algoritmos publicados por Google en cuatro articulos: GE2E (arXiv:1710.10467), Dr-Vectors (arXiv:2104.01989), Conformer-ATP (arXiv:2202.12163) y PFAS (arXiv:2203.05642). El autor advierte explicitamente que no es un producto oficialmente soportado por Google y que los experimentos originales se hicieron con infraestructura y datos internos propietarios, no con esta libreria ni con los splits publicos empleados aqui.

Tecnicamente es un modelo muy pequeno: 2.239.922 parametros en el encoder, con backbone ResNet en configuracion "small", pooling temporal por atencion estadistica (`asp`), funcion de perdida `ge2e_softmax` y scoring coseno. El frontend de audio usa log-mel de 80 dimensiones a 16 kHz con VAD de energia y normalizacion CMVN. La relevancia actual es la de ofrecer un checkpoint ligero, reproducible y con licencia Apache 2.0 para tareas de identificacion de locutor en entornos con recursos limitados, aunque su rendimiento medido (EER entre el 15 % y el 32 % segun dominio) esta muy lejos del estado del arte actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (configuracion `small`) con pooling temporal `asp` (attentive statistics pooling) |
| Parametros totales | 2.239.922 (encoder) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; procesa audio de longitud variable mediante VAD de energia y pooling temporal |
| Tipos de cuantizacion | no disponibles (no se publican versiones cuantizadas; pesos en safetensors y msgpack, presumiblemente fp32) |
| Idiomas soportados | no disponibles en los metadatos; entrenamiento declarado en LibriSpeech (ingles leido) y evaluacion en dominios ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Libreria | flaxspeaker (JAX / Flax) |
| Tarea (pipeline) | audio-classification |
| Dimension del embedding | 192 |
| Funcion de perdida | `ge2e_softmax` |
| Scoring de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16 kHz, VAD de energia y CMVN; configuracion compatible con `WhisperFeatureExtractor` |
| Datasets de entrenamiento | librispeech_asr (dominio de entrenamiento: `librispeech`) |
| Datasets de evaluacion | librispeech_asr, cnceleb, voxceleb |
| Metricas reportadas | EER, minDCF, ROC-AUC |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de verificacion de locutor en dos etapas: un encoder convolucional que transforma el espectrograma log-mel en un embedding (aqui de 192 dimensiones) y un scoring posterior de similitud coseno entre embeddings. El encoder es una ResNet pequena; sobre las representaciones temporales se aplica `asp` (attentive statistics pooling), que pondera los frames para agregarlos en un unico vector. El frontend incluye VAD de energia para recortar silencio y CMVN para normalizar las features, detalles relevantes en produccion porque reducen la variabilidad no relacionada con el locutor.

El entrenamiento se realizo sobre LibriSpeech ASR (ingles leido) con la perdida `ge2e_softmax`, una variante de la perdida Generalized End-to-End de GE2E adaptada al esquema softmax. No se indica en la informacion disponible el numero de tokens o de horas de audio utilizadas, ni si hubo etapas de ajuste adicionales. Las innovaciones que el autor cita como base metodologica son las de los articulos Dr-Vectors (residuales de decision y perdida mejorada), Conformer-ATP (pooling temporal atencional) y PFAS (scoring atencional sin parametros), aunque el checkpoint publicado usa pooling `asp` y scoring coseno. La evaluacion se hizo en tres dominios distintos (LibriSpeech, CN-Celeb2 y VoxCeleb1) con intervalos de confianza bootstrap al 95 %.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de un fichero de audio, mediante `model.extract_embedding(...)`.
- Verificacion de locutor uno a uno: comparacion de dos audios y devolucion de una puntuacion coseno de similitud (`model.verify(...)`).
- Verificacion con multiples inscripciones (multi-enrollment): los resultados publicados incluyen evaluacion con 1 y con 3 utterances por locutor, con mejora sistematica del EER al pasar de 1 a 3 utterance.
- Funcionamiento como modelo de audio-classification dentro del pipeline declarado en HuggingFace.
- Entrada de audio con longitud variable, gracias al pooling temporal y al preprocesado con VAD.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Soporte multilingue: no documentado; el entrenamiento declarado es exclusivamente en ingles leido (LibriSpeech), aunque se evalua en dominios con chino.

## Casos de uso

- Verificacion de identidad por voz en atencion telefonica: el modelo extrae un embedding de la grabacion del cliente y lo compara por similitud coseno con el embedding de inscripcion almacenado, con la ventaja de que los embeddings de 192 dimensiones ocupan menos de 1 KB por locutor.
- Control de acceso y desbloqueo por voz en dispositivos embebidos: con 2,24 M de parametros el modelo cabe sobradamente en memoria y puede ejecutarse en CPU en dispositivos de bajo consumo.
- Agrupacion (clustering) de hablantes en grabaciones largas: los embeddings sirven como entrada a un algoritmo de clustering para tareas de diarizacion, con la ventaja de ser un extractor independiente del idioma de la aplicacion.
- Preprocesado de datasets de audio: etiquetado automatico de quien habla en un corpus con muchos hablantes, usando la similitud coseno como criterio de agrupacion.
- Deteccion de suplantacion en conjuntos de datos de investigacion: comparacion de pares de audios para descartar que dos fragmentos atribuidos a la misma persona correspondan realmente al mismo locutor.
- Evaluacion comparativa y reproduccion de resultados: al ser una implementacion JAX/Flax limpia de GE2E, Dr-Vectors, Conformer-ATP y PFAS, resulta util como referencia para reproducir experimentos en un stack distinto de PyTorch.
- Prototipado rapido de un pipeline de verificacion completo: la libreria permite cargar el modelo desde el Hub, extraer embeddings y verificar pares en pocas lineas de Python, sin necesidad de GPU.
- Benchmarking de modelos de locutor de distinto tamano en dominios cruzados: el checkpoint publica resultados en LibriSpeech, CN-Celeb2 y VoxCeleb1 con intervalos de confianza, lo que facilita usarlo como linea base de modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en el fichero `eval_results.json` del repositorio, para verificacion con 1 utterance por locutor:

| Split de evaluacion | Trials | EER (%) | IC 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 15,20 | [13,95; 16,47] | 0,9227 | 0,7140 | 0,9264 |
| CN-Celeb2 (chino multigenero) | 3.000 | 32,17 | [30,28; 33,78] | 0,9900 | 0,9693 | 0,7454 |
| VoxCeleb1 (celebrities in-the-wild) | 2.000 | 21,40 | [19,62; 23,50] | 0,9960 | 0,9460 | 0,8585 |
| Universal pooled (3 dominios) | 8.000 | 23,94 | [22,86; 24,73] | 0,9862 | 0,9365 | 0,8468 |
| Universal macro-average (3 dominios) | 8.000 | 22,92 | no disponible | 0,9696 | 0,8764 | 0,8434 |

Resultados con 3 utterances de inscripcion por locutor:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,30 | [9,30; 13,55] | 0,7460 | 0,9594 |
| CN-Celeb2 (3-utt) | 1.000 | 29,70 | [26,60; 32,10] | 0,9440 | 0,7903 |
| VoxCeleb1 (3-utt) | 1.000 | 20,20 | [17,25; 22,15] | 0,9300 | 0,8876 |
| Universal pooled (3-utt) | 3.000 | 20,47 | [18,98; 21,85] | 0,9260 | 0,8841 |
| Universal macro-average (3-utt) | 3.000 | 20,40 | no disponible | 0,8733 | 0,8791 |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (por ejemplo MMLU, HumanEval o GSM8K), que ademas no aplican a un modelo de locutor.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 MB en fp32 y 4,5 MB en fp16 solo para los pesos; el cuello de botella real es la memoria del frontend y de los buffers de audio, no el modelo.
- Inferencia en CPU: perfectamente viable, incluido en portatiles y en dispositivos tipo Raspberry Pi, dado el tamano del encoder.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve (GTX 1050, RTX 3060, RTX 4090, T4, L4). No se necesita A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna y tambien en iGPU.
- Opciones de despliegue: la libreria oficial `flaxspeaker` (Python API `load_pretrained` y script `scripts/inference.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Formatos de pesos desplegables: safetensors y msgpack de Flax; no se publican pesos en GGUF ni en ONNX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Framework | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wq2012/ls_resnet_small_ge2e | JAX / Flax (`flaxspeaker`) | 2.239.922 | longitud variable (VAD + pooling) | Apache 2.0 | HuggingFace, GitHub, PyPI |
| SpeechBrain ECAPA-TDNN (spkrec-ecapa-voxceleb) | PyTorch | no disponible | longitud variable | Apache 2.0 | HuggingFace, GitHub |
| WeSpeaker (modelos ResNet / ECAPA en VoxCeleb) | PyTorch | no disponible | longitud variable | Apache 2.0 | HuggingFace, GitHub |
| Modelos x-vector / ECAPA de referencia en VoxCeleb | PyTorch / Kaldi | no disponible | longitud variable | variable segun repositorio | GitHub |

La comparacion cuantitativa de parametros y EER con esas alternativas no esta disponible en la informacion proporcionada, y no debe inferirse de los resultados de este checkpoint: el modelo aqui descrito reporta un EER del 21,40 % en VoxCeleb1, cifra propia de un encoder muy pequeno entrenado solo con LibriSpeech y no directamente comparable con modelos entrenados especificamente sobre VoxCeleb.

## Limitaciones y advertencias

- Rendimiento limitado: un EER del 15,20 % en LibriSpeech y del 32,17 % en CN-Celeb2 esta muy lejos del estado del arte en verificacion de locutor, donde los mejores sistemas bajan del 1 % en VoxCeleb.
- Sesgo de dominio claro: el entrenamiento declarado es solo LibriSpeech (ingles leido, audiolibros), lo que explica el degradado en dominios in-the-wild (VoxCeleb1, 21,40 % EER) y multigenero en chino (CN-Celeb2, 32,17 % EER). No es un modelo multilingue equilibrado.
- Riesgo de falsos positivos y falsos negativos: con EER en torno al 20-30 % en dominios reales, no es apto por si solo para decisiones de seguridad criticas sin un umbral calibrado y varias utterances de inscripcion.
- Sesgos demograficos: no se documenta analisis por acento, edad, genero ni condicion de grabacion; son riesgos habituales en modelos entrenados sobre un unico corpus.
- Sensibilidad a la calidad del audio: el frontend usa VAD de energia y CMVN, por lo que ruido, musica de fondo o canales telefonicos pueden degradar los embeddings.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; no hay restricciones adicionales documentadas.
- Aviso del autor: no es un producto oficialmente soportado por Google; es una reproduccion independiente de articulos cientificos, y los resultados originales de esos articulos no se obtuvieron con esta libreria.
- Ambito de uso: es un modelo discriminativo de audio; no genera texto, no razona, no soporta tool calling y no debe evaluarse con benchmarks de LLM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- Los intervalos de confianza bootstrap publicados no cubren todos los agregados (el macro-average no los incluye), lo que limita la comparacion estadistica fina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_resnet_small_ge2e
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642v3
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos adicionales) en los resultados de la busqueda web disponible.
