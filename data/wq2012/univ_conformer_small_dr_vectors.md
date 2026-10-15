# wq2012/univ_conformer_small_dr_vectors

## Resumen

`univ_conformer_small_dr_vectors` es un modelo de reconocimiento y verificacion de locutor (speaker verification/recognition) desarrollado por el usuario `wq2012` dentro del proyecto open source FlaxSpeaker. Se trata de la reproduccion limpia (clean-room) en JAX/Flax de los algoritmos publicados por Google en GE2E, Dr-Vectors, Conformer-ATP y PFAS. El modelo no es un producto oficial de Google y los resultados de los papers originales se obtuvieron con infraestructura y datos internos, no con esta libreria ni con los splits publicos.

El checkpoint combina un backbone Conformer de tamano "small" (2.088.007 parametros de encoder) con pooling temporal atento (`atp`), una perdida `extended_set_softmax` y puntuacion de verificacion basada en `dr_vector` (Decision Residual). La salida es un embedding de locutor de 192 dimensiones a partir de un frontend de audio de 80 dimensiones `log_mel` a 16 kHz con VAD de energia y normalizacion CMVN.

Es relevante por su tamano extremadamente reducido (poco mas de 2 millones de parametros), su licencia Apache 2.0 y su implementacion nativa en JAX/Flax, lo que lo convierte en un candidato para entornos con recursos limitados, para investigacion reproducible y como pieza de extraccion de embeddings dentro de pipelines de diarizacion o VAD personalizado. Su rendimiento absoluto, sin embargo, es modesto: 20,10 % de EER en el pool universal a una sola locucion y 15,40 % con tres locuciones de enrolamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal atento (`atp`) |
| Parametros totales | 2.088.007 (parametros del encoder) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la ventana efectiva la fija el frontend `log_mel` de 80 dimensiones a 16 kHz con VAD de energia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible como lista formal; entrenado y evaluado con LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (celebridades en condiciones reales) |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` (principal) y `flax_model.msgpack` (nativo Flax); configuracion en `config.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de configuracion `small` como encoder acustico. Sobre las representaciones del encoder se aplica un pooling temporal atento (`atp`, Attentive Temporal Pooling), tecnica descrita en el paper Conformer-ATP para agregar secuencias largas en un unico vector. El resultado es un embedding de locutor de 192 dimensiones. El frontend de audio es compatible con `WhisperFeatureExtractor` y produce espectrogramas `log_mel` de 80 dimensiones a 16 kHz, precedidos de un VAD de energia y normalizacion CMVN.

El entrenamiento usa la perdida `extended_set_softmax` (una extension de la familia de perdidas set-based de GE2E) y el modelo se enmarca en el dominio declarado como `universal`, es decir, entrenado conjuntamente sobre LibriSpeech ASR, CN-Celeb y VoxCeleb. La verificacion no se realiza con una metrica de distancia fija, sino con `dr_vector` (Decision Residual Networks), la puntuacion propuesta en el paper Dr-Vectors. No se especifica en la informacion disponible el numero total de tokens, la composicion exacta del dataset, la duracion del entrenamiento ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). La model card indica explicitamente que es una reproduccion independiente en JAX/Flax y no un producto de Google.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de una locucion de audio.
- Verificacion de locutor (1:1): comparacion de dos audios y devolucion de una puntuacion de similitud.
- Enrolamiento multiple: soporta verificacion con tres locuciones de enrolamiento, con reduccion de EER de aproximadamente 4,7 puntos porcentuales en el pool universal (20,10 % a 15,40 %).
- Deteccion de actividad de voz (VAD) de energia integrada en el frontend de preprocesado.
- Funcionamiento multilingue y multigenero de facto: evaluado con exito relativo en ingles leido, chino multigenero y audio en condiciones reales.
- Integracion en pipelines de clustering para diarizacion al proporcionar embeddings compactos.
- Inferencia de bajo coste: 2,09 millones de parametros permiten ejecucion en CPU y en dispositivos embebidos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Autenticacion por voz en aplicaciones de acceso restringido: el modelo genera un embedding de 192 dimensiones y una puntuacion de verificacion entre un audio de enrolamiento y un audio de prueba, suficiente para umbrales de segunda factora en escenarios de baja criticidad.
- Diarizacion de hablantes en grabaciones de reuniones: los embeddings extraidos se pueden alimentar a un algoritmo de clustering (por ejemplo, agglomerative clustering con distancia coseno) para segmentar quien habla en cada tramo.
- VAD personalizado (Personal VAD): la combinacion del VAD de energia con un embedding de locutor objetivo permite filtrar la actividad de voz de un hablante concreto, util en asistentes que solo deben activarse con su usuario.
- Indexado y busqueda de archivos de audio: catalogar podcasts, entrevistas o archivos de telefonia por locutor mediante embeddings almacenados en una base vectorial.
- Preprocesado para ASR multi-locutor: separar o etiquetar intervinientes antes de pasar el audio a un sistema de reconocimiento de habla, mejorando la atribucion de transcripciones.
- Investigacion academica y reproduccion de resultados: la implementacion en JAX/Flax con licencia Apache 2.0 y splits publicos (LibriSpeech, CN-Celeb2, VoxCeleb1) permite reproducir y comparar tecnicas como Dr-Vectors o Conformer-ATP sin depender de infraestructura propietaria.
- Verificacion de locutor en el borde: con 2,09 millones de parametros, el modelo se puede ejecutar en dispositivos con CPU modesta o aceleradores de baja potencia para tareas de desbloqueo local.
- Control de calidad de datasets de voz: detectar si distintas grabaciones atribuidas a un mismo locutor son consistentes o si hay agrupaciones erroneas.

## Benchmarks y rendimiento

Verificacion con una locucion (1-utterance):

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 15,20 | [13,73, 16,22] | 0,9233 | 0,7353 | 0,9298 |
| CN-Celeb2 (chino multigenero) | 3.000 | 22,33 | [20,93, 23,80] | 0,9360 | 0,8547 | 0,8558 |
| VoxCeleb1 (celebridades en condiciones reales) | 2.000 | 22,75 | [20,55, 24,58] | 0,9450 | 0,8820 | 0,8624 |
| Universal agrupado (3 dominios) | 8.000 | 20,10 | [19,31, 20,96] | 0,9477 | 0,8183 | 0,8866 |
| Universal media macro (3 dominios) | 8.000 | 20,09 | no disponible | 0,9348 | 0,8240 | 0,8827 |

Verificacion con tres locuciones de enrolamiento (3-utterance):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 9,90 | [7,60, 11,45] | 0,4960 | 0,9694 |
| CN-Celeb2 (3-utt) | 1.000 | 18,20 | [15,85, 20,40] | 0,8840 | 0,8992 |
| VoxCeleb1 (3-utt) | 1.000 | 17,50 | [15,20, 20,20] | 0,8700 | 0,9038 |
| Universal agrupado (3-utt) | 3.000 | 15,40 | [14,08, 16,67] | 0,8360 | 0,9267 |
| Universal media macro (3-utt) | 3.000 | 15,20 | no disponible | 0,7500 | 0,9241 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos de texto (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje. Las metricas de referencia son EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap del 95 % calculados por el autor en `eval_results.json`.

## Requisitos de hardware

- VRAM estimada: el checkpoint tiene 2.088.007 parametros, unos 8,4 MB en fp32 y unos 4,2 MB en fp16/bf16, sin contar activaciones ni buffers del frontend. La memoria necesaria es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: no requiere GPU. Funciona en cualquier GPU (incluidas integradas), y tambien en CPU. No se indica en la informacion disponible un hardware objetivo especifico.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1050, etc.) e incluso en aceleradores embebidos o en CPU de un solo nucleo para audios cortos.
- Opciones de despliegue: la via documentada es la libreria `flaxspeaker` (API Python `load_pretrained`, `extract_embedding`, `verify`) y el script `scripts/inference.py` de linea de comandos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Requisitos de entrada: audio a 16 kHz, convertido a `log_mel` de 80 dimensiones mediante un extractor compatible con `WhisperFeatureExtractor`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de pooling | Licencia | Disponibilidad | Rendimiento en estos splits |
|---|---|---|---|---|---|
| univ_conformer_small_dr_vectors | 2.088.007 | Atento (`atp`) | Apache 2.0 | HuggingFace, GitHub, PyPI | EER universal 20,10 % (1-utt) y 15,40 % (3-utt) |
| ECAPA-TDNN (familia) | no disponible en la informacion proporcionada | Estadistico atento | variada segun implementacion | multiple (SpeechBrain, WeSpeaker, etc.) | no disponible en la informacion proporcionada |
| x-vector (familia TDNN) | no disponible en la informacion proporcionada | Estadistico simple | variada segun implementacion | multiple (Kaldi, SpeechBrain, etc.) | no disponible en la informacion proporcionada |
| Sistemas basados en WavLM/speech SSL para speaker verification | no disponible en la informacion proporcionada | Atento sobre representaciones SSL | variada segun checkpoint base | multiple | no disponible en la informacion proporcionada |

La comparativa cuantitativa con alternativas no puede realizarse con los datos proporcionados: no se incluyen resultados de otros sistemas evaluados sobre los mismos splits ni con el mismo protocolo de trials. La diferencia estructural mas relevante es el tamano: este modelo es aproximadamente un orden de magnitud mas pequeno que los sistemas habituales de verificacion de locutor basados en ECAPA-TDNN o en modelos auto-supervisados de habla.

## Limitaciones y advertencias

- Rendimiento absoluto modesto: 20,10 % de EER en el pool universal a una locucion y 22,75 % en VoxCeleb1, valores muy alejados de los sistemas de verificacion de locutor desplegados en produccion. No es adecuado para autenticacion critica sin un umbral cuidadosamente calibrado y, preferiblemente, multiples locuciones de enrolamiento.
- Intervalos de confianza amplios: con 1.000 a 3.000 trials por split, los IC bootstrap del 95 % abarcan varios puntos porcentuales, por lo que las diferencias finas entre dominios deben interpretarse con cautela.
- Sesgos de dataset: el entrenamiento y la evaluacion se apoyan en LibriSpeech (lectura en estudio), CN-Celeb2 (multigenero en chino) y VoxCeleb1 (celebridades, condiciones reales en ingles). No hay datos publicados sobre robustez frente a ruido de fondo severo, reverberacion, canales telefonicos, codecs de compresion agresiva ni audio infantil o de hablantes con patologias del habla.
- Cobertura de idiomas no declarada formalmente: aunque se evalua en ingles y chino, la model card no especifica una lista de idiomas soportados ni garantiza el comportamiento en otras lenguas.
- Umbral de decision no documentado: no se proporciona en la informacion disponible un umbral de operacion recomendado ni una calibracion de puntuaciones para produccion.
- Riesgo de confusion entre locutores con voces similares, especialmente en audios cortos o con fuerte solapamiento de canal, coherente con los valores de minDCF observados (hasta 0,9477 en el peor caso).
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia, y no se ofrece ninguna garantia. No hay clausulas adicionales de uso aceptable indicadas en la model card.
- Aviso de origen: el autor declara explicitamente que no es un producto soportado oficialmente por Google y que los papers de referencia se validaron con infraestructura y datos internos distintos de esta reproduccion. Los resultados publicados aqui no son comparables en sentido estricto con los de los papers originales.
- Formato de despliegue limitado: no hay soporte documentado para runtimes de inferencia ampliamente estandarizados (vLLM, llama.cpp, Ollama, TGI). Depende de la libreria `flaxspeaker` y del ecosistema JAX/Flax.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_conformer_small_dr_vectors
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor, Personal VAD 2.0 unified: https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Modelo relacionado del mismo autor, Personal VAD 2.0 con FiLM y d-vector: https://huggingface.co/wq2012/personal-vad-v2-conformer-film-dvector
- Repositorio GitHub de Personal VAD: https://github.com/wq2012/personal_vad
