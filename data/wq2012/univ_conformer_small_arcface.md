# wq2012/univ_conformer_small_arcface

## Resumen

`univ_conformer_small_arcface` es un modelo de verificacion e identificacion de locutor (speaker verification / speaker recognition) publicado por el usuario wq2012 dentro de la biblioteca FlaxSpeaker, una reproduccion open source en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google Research. El modelo no es un producto oficial de Google: la propia model card lo describe como una reimplementacion independiente tipo clean-room de las tecnicas GE2E, Dr-Vectors, Conformer-ATP y PFAS, cuyos experimentos originales se realizaron con infraestructura y datos internos de Google.

Tecnicamente es una red Conformer de tamano "small" con 2.029.892 parametros en el encoder, pooling temporal atento (ATP, Attentive Temporal Pooling), entrenamiento con perdida ArcFace y puntuacion de verificacion por similitud coseno. Produce embeddings de locutor de 192 dimensiones a partir de audio de 16 kHz procesado con un frontend log-mel de 80 bandas, deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN.

Su relevancia practica esta en el tamano: con apenas 2 millones de parametros (aproximadamente 8 MB en fp32) es un candidato claro para verificacion de locutor en dispositivo, sistemas embebidos y pipelines de preprocesado de audio a gran escala. La contrapartida es el rendimiento: los EER publicados en su propia evaluacion (entre 17,4 % y 25,3 %) estan muy lejos del estado del arte actual en verificacion de locutor, por lo que conviene tratarlo como una pieza ligera de filtrado o clustering y no como un sistema de autenticacion de alta seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer "small" con pooling temporal atento (ATP) |
| Parametros totales | 2.029.892 (encoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio; la entrada es una utterance completa procesada por el frontend log-mel, no una ventana de tokens de texto) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precision completa; no hay variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en metadatos; evaluado sobre LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (audio in-the-wild multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`); configuracion en `config.json` y `preprocessor_config.json` (compatible con `WhisperFeatureExtractor`) |

Datos adicionales: dimension del embedding de salida 192, dominio de entrenamiento "universal", frontend de 80 dimensiones log-mel a 16.000 Hz con VAD de energia y CMVN, puntuacion de verificacion por coseno, metrica de evaluacion EER / minDCF / ROC-AUC. Repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que combina bloques de auto-atencion con convoluciones depthwise para capturar simultaneamente dependencias globales y patrones locales en la secuencia acustica. La variante utilizada es la configuracion "small" del codigo de FlaxSpeaker. Sobre el encoder se aplica ATP (Attentive Temporal Pooling), un mecanismo de agregacion temporal con atencion descrito en el trabajo sobre identificacion de idioma en streaming, que permite ponderar los frames mas informativos y funcionar tambien con audio de formato largo. El resultado se proyecta a un embedding de 192 dimensiones.

El entrenamiento utiliza la perdida ArcFace, una variante de margen angular sobre softmax que busca maximizar la separacion angular entre clases de locutor, combinada con tecnicas de la familia Dr-Vectors (redes de decision residual y perdida mejorada). El modelo se entreno en dominio "universal" a partir de los conjuntos LibriSpeech ASR, CN-Celeb y VoxCeleb, lo que explica su evaluacion cruzada en tres dominios (ingles leido, chino multigenero y audio de internet multilingue) con pooling de resultados. La puntuacion final de verificacion se obtiene por similitud coseno entre embeddings, siguiendo el enfoque PFAS (Parameter-Free Attentive Scoring) de los papers de referencia. No se especifican en la informacion disponible el numero total de tokens o horas de audio de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo).

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de un fichero de audio, mediante `model.extract_embedding(...)`.
- Verificacion de locutor (1:1): comparacion entre un audio de enrolamiento y un audio de test con una puntuacion de similitud coseno, mediante `model.verify(...)`.
- Verificacion multi-enrolamiento: la evaluacion publicada incluye resultados con 3 utterances de enrolamiento, con mejora consistente del EER.
- Identificacion de locutor (1:N) por comparacion de embeddings contra una galeria, utilizable como base para clustering y diarizacion.
- Funcionamiento en multiples dominios acusticos: ingles leido, chino multigenero y audio in-the-wild, con un unico conjunto de pesos.
- Inferencia por linea de comandos mediante `scripts/inference.py`.
- Frontend integrado de log-mel a 16 kHz con VAD de energia y CMVN, lo que simplifica el preprocesado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo "thinking". Es un modelo puramente discriminativo de audio.

## Casos de uso

- Autenticacion por voz en dispositivo: con 2 millones de parametros el modelo cabe en memoria de microcontroladores y moviles, de modo que se puede ejecutar la verificacion de locutor localmente sin enviar audio a la nube, reduciendo latencia y problemas de privacidad.
- Diarizacion de hablantes en pipelines de transcripcion: los embeddings de 192 dimensiones se pueden clusterizar (por ejemplo con k-means o agglomerative clustering) para segmentar reuniones, podcasts o llamadas en funcion de quien habla.
- Control de calidad y deduplicacion de corpus de habla: al extraer embeddings de grandes volumenes de audio se pueden detectar locutores repetidos, filtrar muestras duplicadas o equilibrar la representacion de hablantes antes de entrenar modelos ASR o TTS.
- Indexado y busqueda por locutor en archivos multimedia: en tareas de monitorizacion de medios o archivos de radiodifusion, permite buscar todas las intervenciones de una persona concreta a partir de un pequeno audio de referencia.
- Personalizacion de asistentes de voz multiusuario: identificar que miembro del hogar esta hablando para cargar su perfil, preferencias o historial de conversacion en un asistente domestico.
- Segmentacion de audio largo en streaming: gracias al pooling temporal atento, el modelo es adecuado para procesar audio de formato largo y detectar cambios de locutor en emisiones en directo o grabaciones extensas.
- Telemetria y analitica de contact center: agregar embeddings anonimizados para medir participacion de agentes, tiempos de habla o separar cliente y agente sin almacenar audio en claro.

## Benchmarks y rendimiento

Resultados publicados por el autor en `eval_results.json` para verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC 95 % bootstrap (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---:|---:|---|---:|---:|---:|
| LibriSpeech (ingles leido) | 3.000 | 20,57 | [19,07; 21,80] | 0,9900 | 0,9100 | 0,8736 |
| CN-Celeb2 (chino multigenero) | 3.000 | 25,27 | [23,77; 26,77] | 0,9907 | 0,9567 | 0,8278 |
| VoxCeleb1 (in-the-wild) | 2.000 | 25,00 | [23,22; 26,93] | 0,9800 | 0,9800 | 0,8344 |
| Universal agrupado (3 dominios) | 8.000 | 25,11 | [24,30; 26,06] | 0,9935 | 0,9460 | 0,8306 |
| Universal macro-media (3 dominios) | 8.000 | 23,61 | — | 0,9869 | 0,9489 | 0,8453 |

Resultados con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % bootstrap (%) | minDCF@0,01 | ROC-AUC |
|---|---:|---:|---|---:|---:|
| LibriSpeech (3-utt) | 1.000 | 17,40 | [14,90; 19,70] | 0,8360 | 0,9147 |
| CN-Celeb2 (3-utt) | 1.000 | 21,40 | [18,60; 23,60] | 0,9220 | 0,8670 |
| VoxCeleb1 (3-utt) | 1.000 | 21,80 | [19,20; 24,50] | 0,9900 | 0,8733 |
| Universal agrupado (3-utt) | 3.000 | 21,67 | [20,03; 23,17] | 0,9367 | 0,8730 |
| Universal macro-media (3-utt) | 3.000 | 20,20 | — | 0,9160 | 0,8850 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de verificacion de locutor (por ejemplo VoxCeleb1-O con EER de referencia) mas alla de estos splits, ni comparaciones directas con ECAPA-TDNN, TitaNet o modelos basados en WavLM.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cualquier precision. Con 2.029.892 parametros, los pesos ocupan aproximadamente 8,1 MB en fp32 y unos 4 MB en fp16/bf16; el consumo real depende del buffer de audio y de la longitud de la utterance.
- GPU recomendadas: cualquiera, incluida una GTX 1050 o una iGPU moderna. No requiere A100, H100 ni RTX 4090; usar una GPU de gama alta solo tiene sentido para procesar lotes masivos en paralelo.
- Compatibilidad con GPU de consumo: si, en todas las GPU consumer actuales, y tambien en CPU. Es viable incluso en dispositivos embebidos o moviles dada la magnitud de parametros.
- Opciones de despliegue: la via oficial es la biblioteca `flaxspeaker` sobre JAX/Flax, cargando pesos desde SafeTensors o Msgpack. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de texto y no aplican a este caso.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del modelo, es razonable esperar inferencia muy por debajo del tiempo real por utterance, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `univ_conformer_small_arcface` | 2.029.892 | Audio 16 kHz, log-mel 80 dim, utterance completa | Apache 2.0 | HuggingFace + GitHub + PyPI | EER 20,57 % (LibriSpeech 1-utt), 25,00 % (VoxCeleb1 1-utt) |
| ECAPA-TDNN (familia de referencia en speaker verification) | No disponible en la informacion proporcionada | Audio, embeddings tipicos de 192 dim | Varía segun implementacion | Implementaciones publicas (SpeechBrain, WeSpeaker) | No disponible en la informacion proporcionada |
| TitaNet (NVIDIA NeMo) | No disponible en la informacion proporcionada | Audio, embeddings de 192 dim | Varía segun checkpoint | NVIDIA NeMo | No disponible en la informacion proporcionada |
| Modelos basados en WavLM para SV | No disponible en la informacion proporcionada | Audio, embeddings de 256-512 dim | Varía segun checkpoint | HuggingFace / Microsoft | No disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion proporcionada no incluye cifras de esos modelos. Lo que si puede afirmarse es que `univ_conformer_small_arcface` es uno o dos ordenes de magnitud mas pequeno que los sistemas habituales de verificacion de locutor, y que sus EER publicados son notablemente mas altos que los de los sistemas de referencia de la literatura, a cambio de un coste computacional minimo.

## Limitaciones y advertencias

- Rendimiento limitado: los EER publicados (20,57 %-25,27 % con 1 utterance) son altos para verificacion de locutor. No es adecuado como unico factor de autenticacion en sistemas con requisitos de seguridad.
- Tamano reducido: 2 millones de parametros limitan la capacidad de modelar variabilidad de canal, ruido y emocion en comparacion con arquitecturas de decenas de millones de parametros.
- Cobertura de evaluacion estrecha: solo tres dominios (LibriSpeech, CN-Celeb2, VoxCeleb1) y tamanos de trial relativamente pequenos (1.000-3.000 trials), con intervalos de confianza bootstrap amplios.
- Riesgo de confusion entre locutores con timbres similares (familiares, hermanos, imitadores), inherente a cualquier modelo de embeddings de 192 dimensiones de este tamano.
- Sensibilidad al dominio: el modelo se evalua en regimen "universal" sobre dominios heterogeneos, lo que sugiere que un ajuste o calibracion por dominio puede ser necesario en produccion.
- Idiomas: los metadatos de HuggingFace no declaran idiomas soportados; la evidencia disponible son evaluaciones en ingles, chino y audio multilingue in-the-wild, sin garantia para el resto.
- Naturaleza del proyecto: es una reproduccion independiente en codigo abierto y no un producto oficial de Google. No cuenta con soporte oficial ni con validacion con los datasets internos de los papers originales, por lo que los resultados no son directamente comparables con los publicados en dichos papers.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datasets de entrenamiento (LibriSpeech, CN-Celeb, VoxCeleb) si se va a redistribuir el modelo o derivados.
- Privacidad y cumplimiento: los embeddings de locutor son datos biometricos en muchas jurisdicciones (por ejemplo, categorias especiales segun el RGPD). Su almacenamiento requiere base legal, y las puntuaciones deben calibrarse antes de tomar decisiones automatizadas.
- Sin cuantizaciones publicadas: no hay variantes GGUF, AWQ o GPTQ, y no hay soporte documentado para servidores de inferencia genericos.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, por lo que no existe un ecosistema de issues o validaciones de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_conformer_small_arcface
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642

Nota: la busqueda web realizada devolvio exclusivamente resultados sobre Arc2Face, un modelo de generacion de rostros condicionado por embeddings de ArcFace. Ese material pertenece a un dominio distinto (vision por computador, generacion de imagenes) y no guarda relacion con este checkpoint de verificacion de locutor, por lo que no se han incluido sus enlaces como referencias relevantes.
