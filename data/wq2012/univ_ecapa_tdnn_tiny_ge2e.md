# wq2012/univ_ecapa_tdnn_tiny_ge2e

## Resumen

`univ_ecapa_tdnn_tiny_ge2e` es un modelo de verificación e identificación de hablante desarrollado por el usuario wq2012 dentro de la biblioteca FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS). Se trata de un extractor de embeddings de hablante, no de un modelo generativo: recibe audio y devuelve un vector de 128 dimensiones que representa la identidad vocal, junto con una puntuación de similitud coseno entre dos audios.

La arquitectura es una ECAPA-TDNN en variante `tiny`, con pooling temporal atencional (ASP), entrenada con la pérdida `ge2e_softmax` y un frontend de 80 dimensiones log-mel a 16 kHz con VAD de energía y normalización CMVN. Con solo 626.720 parámetros en el encoder, es un modelo extremadamente ligero, pensado para despliegue en entornos con recursos limitados o para servir como bloque base en pipelines de diarización, autenticación biométrica por voz o indexado de audio.

Su relevancia actual reside en que ofrece una implementación limpia y reproducible en JAX/Flax, con pesos en safetensors, licencia Apache-2.0 y evaluación multicorpus verificada (LibriSpeech, CN-Celeb2 y VoxCeleb1). No obstante, hay que interpretar sus métricas con cautela: el EER de 1-utterance en el pool universal es del 23,02%, muy lejos de los sistemas de verificación de hablante de gran escala, lo que lo sitúa como herramienta de prototipado o de escenarios con múltiples utterances de inscripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `tiny`) con pooling temporal atencional (`asp`) |
| Parametros totales | 626.720 (encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa utterances completas; VAD de energia segmenta el audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (evaluado en corpus de ingles y chino; el embedding de hablante es en principio independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y msgpack nativo de Flax (`flax_model.msgpack`) |

Otros parametros tecnicos declarados en la model card: dimension del embedding de salida 128, perdida de entrenamiento `ge2e_softmax`, scoring de verificacion por similitud coseno, dominio de entrenamiento `universal`, frontend de audio de 80 dimensiones log-mel a 16.000 Hz con VAD de energia y CMVN.

## Arquitectura y entrenamiento

La arquitectura ECAPA-TDNN combina bloques TDNN (Time Delay Neural Network) con capas de squeeze-and-excitation y bloques Res2Block, un diseno descrito en la literatura de reconocimiento de hablante y disponible en implementaciones publicas como la de NVIDIA NeMo o la reimplementacion no oficial de TaoRuijie. En esta ficha concreta, el backbone se configura en tamano `tiny`, con pooling temporal atencional (`asp`) sobre las representaciones temporales, y produce un embedding de 128 dimensiones que se compara mediante similitud coseno.

El entrenamiento usa la perdida GE2E (Generalized End-to-End Loss for Speaker Verification) en su variante `ge2e_softmax`, que optimiza directamente la separabilidad de los embeddings de hablante sin necesidad de un clasificador de identidades cerrado. Segun la model card, los corpus empleados son LibriSpeech ASR, CN-Celeb y VoxCeleb. La model card indica explicitamente que se trata de una reproduccion open source independiente y que los experimentos de los articulos originales se realizaron con infraestructura y datos internos de Google, no con esta biblioteca ni con estos splits publicos. No se especifican en la informacion disponible el numero de tokens, horas de audio, composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a este tipo de modelo).

## Capacidades

- Extraccion de embeddings de hablante: genera un vector de 128 dimensiones por utterance mediante `model.extract_embedding(...)`.
- Verificacion de hablante: compara dos audios con scoring coseno mediante `model.verify(...)` y devuelve una puntuacion de similitud.
- Verificacion multi-utterance: la evaluacion incluida contempla inscripcion con 3 utterances, con mejora de EER respecto a 1 utterance.
- Clasificacion de audio orientada a identidad: el pipeline declarado en HuggingFace es `audio-classification`.
- Frontend de audio integrado: extraccion de log-mel de 80 dimensiones a 16 kHz, VAD de energia y CMVN, compatible con `WhisperFeatureExtractor`.
- Inferencia en Python y linea de comandos mediante el paquete `flaxspeaker` y el script `scripts/inference.py`.
- No dispone de tool calling, function calling, capacidades de agente, generacion de texto, vision ni audio comprensivo; es un extractor de embeddings acusticos, no un modelo de lenguaje.

## Casos de uso

- Verificacion biometrica de acceso: autenticacion por voz comparando el embedding del audio de entrada contra el de inscripcion del usuario, con umbral de decision calibrado sobre la puntuacion coseno y los valores minDCF publicados.
- Deteccion de fraude en atencion telefonica: comprobar si la voz del interlocutor coincide con la del titular registrado, usando inscripcion multi-utterance (3 utterances) para reducir el EER del 23,02% al 18,00% en el pool universal.
- Diarizacion de reuniones y transcripciones: generar embeddings por segmento para agrupar fragmentos del mismo hablante en un pipeline de clustering, aprovechando su bajo coste computacional para procesar horas de audio.
- Indexado y busqueda de locutores en archivos audiovisuales: construir un indice vectorial de 128 dimensiones por segmento para localizar rapidamente todas las intervenciones de un hablante en un catalogo.
- Personalizacion de asistentes de voz: identificar al usuario para cargar su perfil, historial o preferencias, con el modelo ejecutandose en el propio dispositivo dado su tamano inferior a 1 MB en pesos.
- Control parental o de dispositivos por voz: verificacion local de que la persona que habla es un usuario autorizado antes de ejecutar comandos en dispositivos domoticos.
- Filtrado de calidad en recogida de datos: descartar audios con multiples hablantes o con locutor incorrecto en procesos de anotacion, usando el scoring coseno como test de coherencia.
- Prototipado e investigacion: servir como linea base reproducible en JAX/Flax para comparar variantes de backbone, pooling o funcion de perdida, dado su reducido coste de entrenamiento e inferencia.

## Benchmarks y rendimiento

Resultados de verificacion con 1 utterance, extraidos de la model card (`eval_results.json`):

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 19,07 | [17,48, 20,42] | 0,9547 | 0,8533 | 0,8988 |
| CN-Celeb2 (chino multigenero) | 3.000 | 25,27 | [23,75, 26,80] | 0,9873 | 0,9533 | 0,8270 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 23,35 | [21,35, 25,15] | 0,9420 | 0,9220 | 0,8564 |
| Universal pooled (3 dominios) | 8.000 | 23,02 | [22,14, 23,96] | 0,9808 | 0,9313 | 0,8596 |
| Universal macro-average (3 dominios) | 8.000 | 22,56 | — | 0,9613 | 0,9095 | 0,8607 |

Resultados con inscripcion de 3 utterances:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 12,50 | [10,60, 15,11] | 0,8800 | 0,9466 |
| CN-Celeb2 (3-utt) | 1.000 | 21,40 | [19,00, 24,15] | 0,9080 | 0,8707 |
| VoxCeleb1 (3-utt) | 1.000 | 17,20 | [15,20, 19,80] | 0,8920 | 0,9004 |
| Universal pooled (3-utt) | 3.000 | 18,00 | [16,75, 19,37] | 0,9353 | 0,9046 |
| Universal macro-average (3-utt) | 3.000 | 17,03 | — | 0,8933 | 0,9059 |

No se han publicado en la informacion disponible resultados de benchmarks de MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de verificacion de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 626.720 parametros del encoder; el cuello de botella real es el buffer de audio, no los pesos.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte de JAX sirve, aunque es innecesaria. Se puede ejecutar en CPU, GPU integrada o dispositivos embebidos.
- Consumer GPU: cabe con enorme holgura en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650) e incluso en Raspberry Pi o moviles si se compila JAX/Flax para ARM.
- Opciones de despliegue: el paquete `flaxspeaker` (Python y CLI) es la via documentada. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a este tipo de checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / embedding | EER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_ecapa_tdnn_tiny_ge2e` | 626.720 | Embedding 128 dim, audio 16 kHz | 23,02% (universal 1-utt), 18,00% (universal 3-utt) | Apache-2.0 | HuggingFace, GitHub, PyPI |
| `yangwang825/ecapa-tdnn-vox2` | No disponible | No disponible | No disponible en la informacion recogida | No disponible | HuggingFace |
| NVIDIA NeMo `ecapa_tdnn` | No disponible | Speaker embeddings, angular softmax | No disponible en la informacion recogida | No disponible | NGC (NVIDIA) |
| TaoRuijie/ECAPA-TDNN | No disponible | Speaker embeddings | 0,86% en Vox1_O entrenando solo con Vox2 | No disponible | GitHub |

La comparacion cuantitativa directa no es posible con los datos recogidos: los sistemas de NVIDIA NeMo y TaoRuijie emplean backbones ECAPA-TDNN de mayor capacidad y reportan EER en ordenes de magnitud inferiores en VoxCeleb, mientras que este checkpoint es una variante `tiny` orientada a ligereza y reproducibilidad en JAX, no a maximizar precision.

## Limitaciones y advertencias

- Precision limitada: el EER universal de 1 utterance es del 23,02%, y del 25,27% en CN-Celeb2. Es un modelo de linea base o de prototipado, no un sistema de verificacion de alta seguridad.
- Sesgo de dominio: el rendimiento varia notablemente entre LibriSpeech (19,07% EER), VoxCeleb1 (23,35%) y CN-Celeb2 (25,27%), lo que indica sensibilidad a las condiciones acusticas, idioma y estilo de grabacion.
- Sesgo de hablante no evaluado: no se publican analisis de equidad por genero, acento, edad o etnia, por lo que se desconoce el comportamiento diferencial entre grupos demograficos.
- Vulnerabilidad a suplantacion: no se documenta ningun mecanismo de deteccion de voz sintetica o de replay (anti-spoofing), por lo que un atacante con audio generado podria intentar superar la verificacion.
- Idiomas: no se declara una lista oficial de idiomas soportados; las evaluaciones se limitan a ingles y chino.
- Longitud de contexto: no se especifica la duracion maxima de audio soportada ni el comportamiento con utterances muy largas; el VAD de energia segmenta la entrada.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero la model card aclara que no es un producto soportado oficialmente por Google y que se trata de una reproduccion independiente de articulos de investigacion.
- Ausencia de soporte para generacion de texto, tool calling o agentes: cualquier descripcion del modelo en esos terminos seria incorrecta.
- Cero descargas y cero likes en HuggingFace en el momento de la consulta, lo que implica una validacion externa practicamente nula por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_ecapa_tdnn_tiny_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
- NVIDIA NeMo ECAPA-TDNN: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/ecapa_tdnn
- Reimplementacion no oficial ECAPA-TDNN (TaoRuijie): https://github.com/TaoRuijie/ECAPA-TDNN
- Modelo ECAPA-TDNN en Vox2 (yangwang825): https://huggingface.co/yangwang825/ecapa-tdnn-vox2
