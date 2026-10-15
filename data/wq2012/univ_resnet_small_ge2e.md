# wq2012/univ_resnet_small_ge2e

## Resumen

`univ_resnet_small_ge2e` es un modelo de verificacion e identificacion de locutor (speaker verification) publicado por el usuario wq2012 (Quan Wang) en Hugging Face. No es un modelo generativo de texto: se trata de un encoder convolucional de tipo ResNet que transforma una utterance de audio en un embedding de locutor de 192 dimensiones, sobre el que se aplica una puntuacion de similitud coseno para decidir si dos grabaciones pertenecen a la misma persona. El modelo forma parte de FlaxSpeaker, una reproduccion open source en JAX/Flax de algoritmos de reconocimiento de locutor publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), sin usar infraestructura ni datos internos propietarios.

El checkpoint es deliberadamente pequeno: 2.239.922 parametros en el encoder, lo que lo situa en la categoria de modelos ligeros capaces de ejecutarse en CPU o en hardware embebido con un coste de memoria inferior a 10 MB en precision FP32. El frontend de audio trabaja a 16 kHz con caracteristicas log-mel de 80 dimensiones, deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN. El pooling temporal es ASP (attentive statistics pooling) y la funcion de perdida de entrenamiento es `ge2e_softmax`.

Su relevancia actual es doble. Por un lado, ofrece un punto de partida reproducible y con licencia Apache-2.0 para experimentar con embeddings de locutor sin depender de frameworks propietarios. Por otro lado, sus resultados publicados son modestos (EER del 24-29 % en verificacion de una sola utterance), lo que lo convierte en una referencia honesta del rendimiento alcanzable con un backbone ResNet small en dominios abiertos, y en un candidato adecuado para prototipado, anotacion de corpus y pipelines donde la precision no sea critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (backbone `resnet` variante `small`) con pooling temporal ASP (attentive statistics pooling) |
| Parametros totales | 2.239.922 (aproximadamente 2,24 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa utterances de audio; no se documenta longitud maxima de entrada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors y Flax msgpack; no hay GGUF ni variantes INT8 documentadas) |
| Idiomas soportados | no disponibles (evaluado en ingles, chino y audio in-the-wild multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Funcion de perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Dominio de entrenamiento | universal (multidominio) |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ResNet de tamano reducido que consume caracteristicas log-mel de 80 dimensiones extraidas a 16 kHz. La secuencia temporal se resume mediante ASP (attentive statistics pooling), que calcula estadisticos ponderados por atencion en lugar de un promedio simple, y produce un embedding final de 192 dimensiones. El entrenamiento utiliza la perdida `ge2e_softmax`, derivada del trabajo original de GE2E (Generalized End-to-End Loss for Speaker Verification), que optimiza simultaneamente la atraccion entre utterances del mismo locutor y la repulsion entre locutores distintos dentro de cada batch. En inferencia, la verificacion se realiza calculando la similitud coseno entre embeddings, sin necesidad de una cabeza clasificadora adicional.

La model card indica explicitamente que se trata de una reproduccion "clean-room" en JAX/Flax de cuatro lineas de trabajo: GE2E, Dr-Vectors (Decision Residual Networks), Conformer-ATP (Attentive Temporal Pooling) y PFAS (Parameter-Free Attentive Scoring). El autor advierte que los experimentos de los papers originales se ejecutaron con infraestructura propietaria de Google y datasets internos, por lo que los resultados de este checkpoint no son directamente comparables con los publicados en esos articulos. El entrenamiento se realizo sobre los corpus LibriSpeech, CN-Celeb y VoxCeleb. No se especifica en la informacion disponible el numero exacto de tokens o horas de audio, la composicion porcentual de cada dataset ni si se aplicaron fases de RLHF o DPO (tecnicas propias de modelos generativos que no aplican a este caso). El propio modelo no es un producto oficial de Google.

## Capacidades

- Extraccion de embeddings de locutor: genera vectores de 192 dimensiones a partir de una utterance de audio, adecuados para comparacion por similitud coseno.
- Verificacion de locutor 1:1: compara un audio de enrolamiento con un audio de prueba y devuelve una puntuacion de similitud.
- Verificacion multi-utterance: soporta enrolamiento con 3 utterances (3-utt), con mejora consistente en EER respecto al modo de una sola utterance.
- Deteccion de actividad de voz integrada: el frontend incorpora VAD por energia, lo que permite descartar segmentos sin habla antes del encoder.
- Robustez multidominio: evaluado en ingles de lectura (LibriSpeech), chino multigenero (CN-Celeb2) y audio in-the-wild de celebridades (VoxCeleb1).
- Operacion multicanal: se puede emplear para clustering de locutores y diarizacion mediante agrupamiento de embeddings.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni agentes multi-paso: es un modelo discriminativo de audio, no un LLM.
- No dispone de modo de razonamiento (thinking mode), ni capacidades de audio a texto, ni vision.

## Casos de uso

- Autenticacion biométrica por voz: el modelo permite comparar una frase de enrolamiento con una muestra de prueba y aceptar o rechazar la identidad mediante un umbral sobre la similitud coseno. Es adecuado para prototipos de control de acceso, aunque su EER del 24-29 % en una sola utterance obliga a usar multi-enrolamiento y umbrales conservadores.
- Diarizacion y clustering de hablantes: los embeddings de 192 dimensiones se pueden agrupar (por ejemplo, con k-means o DBSCAN) para segmentar reuniones, podcasts o llamadas por locutor. Su bajo coste computacional permite procesar horas de audio en CPU.
- Etiquetado de corpus de audio: util para anotar automaticamente que segmentos de un corpus pertenecen al mismo hablante antes de entrenar modelos de ASR o TTS, reduciendo el trabajo manual de anotacion.
- Busqueda por locutor en archivos: indexar los embeddings de un archivo historico de grabaciones y recuperar todas las intervenciones de una persona concreta mediante busqueda por similitud vectorial.
- Preprocesado de pipelines de reconocimiento de habla: asignar identidades de locutor a las transcripciones de un sistema ASR, lo que habilita resumenes por participante y transcripciones etiquetadas en reuniones o entornos telefonicos.
- Seleccion de datos para entrenamiento de TTS: filtrar duplicados de locutor y verificar la coherencia de un corpus antes de entrenar un sintetizador, evitando que un mismo hablante se cuente varias veces con identidades distintas.
- Control de calidad de grabaciones: detectar cambios de hablante inesperados en una sesion de grabacion o comprobar que una locucion atribuida a un actor de voz corresponde realmente a esa persona.
- Despliegue en dispositivos con recursos limitados: con menos de 10 MB de pesos, puede ejecutarse en gateways, telefonos o sistemas embebidos siempre que se disponga de un runtime de JAX/Flax o de una conversion propia a otro formato.

## Benchmarks y rendimiento

Resultados publicados en la model card para verificacion con una sola utterance (1-utt):

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles de lectura) | 3.000 | 24,53 | [23,10; 26,17] | 0,9980 | 0,9760 | 0,8346 |
| CN-Celeb2 (chino multigenero) | 3.000 | 29,33 | [27,67; 30,93] | 1,0000 | 1,0000 | 0,7714 |
| VoxCeleb1 (in-the-wild) | 2.000 | 28,25 | [26,60; 30,55] | 0,9980 | 0,9980 | 0,7895 |
| Universal agrupado (3 dominios) | 8.000 | 27,89 | [26,88; 28,82] | 0,9990 | 0,9990 | 0,7989 |
| Universal macro-media (3 dominios) | 8.000 | 27,37 | no disponible | 0,9987 | 0,9913 | 0,7985 |

Resultados con enrolamiento de 3 utterances (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 21,40 | [19,05; 24,60] | 0,9800 | 0,8715 |
| CN-Celeb2 (3-utt) | 1.000 | 26,40 | [23,80; 29,40] | 0,9820 | 0,8161 |
| VoxCeleb1 (3-utt) | 1.000 | 25,80 | [22,45; 28,35] | 0,9920 | 0,8152 |
| Universal agrupado (3-utt) | 3.000 | 25,47 | [23,85; 27,18] | 0,9887 | 0,8326 |
| Universal macro-media (3-utt) | 3.000 | 24,53 | no disponible | 0,9847 | 0,8343 |

No se han publicado, en la informacion disponible, resultados comparativos frente a otros modelos de la misma categoria obtenidos bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Los pesos en FP32 ocupan aproximadamente 8,96 MB (2.239.922 parametros x 4 bytes); el resto del consumo depende del tamano del lote y de la longitud de la secuencia log-mel.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no requiere A100 ni H100. Para lotes grandes en servidor se puede usar T4, L4, RTX 3090 o RTX 4090, pero estan sobredimensionadas para este modelo.
- GPU de consumo: cabe sin problemas en cualquier GPU de consumo e incluso en GPU integradas. La inferencia en CPU es completamente viable para uso interactivo de una sola utterance.
- Opciones de despliegue: la libreria oficial `flaxspeaker` (JAX/Flax) con API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de linea de comandos `scripts/inference.py`. El modelo se puede cargar desde Hugging Face Hub o desde un directorio local.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: son runtimes orientados a modelos generativos de lenguaje y el formato GGUF no esta soportado por este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera que el cuello de botella sea la extraccion de caracteristicas de audio y el propio decodificado del fichero, no la red neuronal.

## Comparativa con modelos similares

En los resultados de busqueda facilitados no se incluyen datos de rendimiento de modelos alternativos de verificacion de locutor, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Dim. embedding | EER VoxCeleb1 1-utt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_resnet_small_ge2e` | 2,24 M | 192 | 28,25 % | Apache-2.0 | Hugging Face (`wq2012/univ_resnet_small_ge2e`) |
| `wq2012/wavenet-speaker-verifier-coded` | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor, arquitectura WaveNet) |
| Alternativas tipicas de la categoria (ECAPA-TDNN, x-vector, sistemas basados en WavLM) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Rendimiento limitado: el EER de 1-utt se situa entre el 21,40 % y el 29,33 % segun dominio, y los valores de minDCF@0.01 son cercanos a 1,0 en varios splits. Esto indica que, en esos puntos de operacion, el modelo apenas mejora una decision aleatoria; no es apto para autenticacion de seguridad critica sin un ajuste cuidadoso de umbrales y sin verificacion adicional.
- Reproduccion no oficial: la model card aclara que no es un producto soportado oficialmente por Google y que los resultados no son comparables con los de los papers originales, que se entrenaron con datos e infraestructura internos.
- Sesgos de datos: el entrenamiento se apoya en LibriSpeech (ingles de lectura), CN-Celeb (chino) y VoxCeleb (celebridades, audio in-the-wild). Esto puede introducir sesgos hacia los acentos, generos, edades y condiciones acusticas sobrerrepresentados en esos corpus.
- Degradacion esperada fuera de dominio: no se documenta el comportamiento con audio telefónico de banda estrecha, reverberacion fuerte, musica de fondo, solapamiento de hablantes ni grabaciones de baja calidad. Cualquier despliegue en esos escenarios requiere una evaluacion propia.
- Idioma: no se declara una lista de idiomas soportados; el modelo aprende representaciones de locutor, pero su robustez linguistica fuera de ingles y chino no esta verificada.
- Riesgo de falso positivo y falso negativo: al tratarse de un clasificador biometrico, los errores tienen consecuencias directas; se recomienda combinar la puntuacion coseno con umbrales calibrados sobre datos propios y con factores adicionales de autenticacion.
- Proteccion de datos: el uso comercial esta permitido por la licencia Apache-2.0, pero el tratamiento de embeddings biometricos de voz puede estar sujeto al RGPD y a normativa local; es responsabilidad del integrador cumplir los requisitos de consentimiento y minimizacion de datos.
- Cuantizacion y portabilidad: no se publican versiones cuantizadas ni exportaciones a ONNX, TensorRT o GGUF, por lo que la integracion fuera del ecosistema JAX/Flax requiere trabajo adicional de conversion y validacion.
- Cita incorrecta de atribuciones: la model card atribuye el paper GE2E a "Wan, Li" en el BibTeX; conviene verificar la autoria original antes de reutilizar esa cita.
- Advertencia sobre la informacion: las fechas de creacion y actualizacion del repositorio indican 2026-10-15; no se dispone de informacion adicional sobre versionado o historial de cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_resnet_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Perfil del autor en GitHub: https://github.com/wq2012
- Otro checkpoint del mismo autor (verificador de locutor basado en WaveNet): https://huggingface.co/wq2012/wavenet-speaker-verifier-coded
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
