# wq2012/cn_conformer_small_pfas

## Resumen

`cn_conformer_small_pfas` es un modelo de verificación e identificación de locutor (speaker verification) publicado por el desarrollador `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación limpia (clean-room) en JAX/Flax de varios algoritmos de reconocimiento de hablante publicados por Google. No es un modelo generativo de lenguaje: su salida es un embedding de locutor de 640 dimensiones y una puntuación de verificación entre dos audios. El encoder es un Conformer de tamaño "small" con solo 2.162.184 parámetros (2.162.187 según la model card para el encoder), lo que lo sitúa en la categoría de modelos ultraligeros aptos para CPU.

El modelo combina tres piezas técnicas concretas: pooling temporal PFAS (Parameter-Free Attentive Scoring), entrenamiento con la pérdida `extended_set_softmax` (derivada de GE2E y Dr-Vectors) y scoring de verificación basado también en PFAS. Se entrena sobre el dominio CN-Celeb2 (chino, multigénero) con un frontend de audio de 80 dimensiones de log-mel a 16 kHz, más VAD de energía y CMVN. La relevancia actual está en su tamaño (menos de 9 MB en precisión completa), su licencia Apache 2.0 y su carácter reproducible y auditable, frente a checkpoints de reconocimiento de hablante mucho más pesados.

Conviene aclarar una ambigüedad importante: el acrónimo `pfas` en este repositorio significa Parameter-Free Attentive Scoring, no tiene ninguna relación con las sustancias perfluoroalquiladas (PFAS) que dominan los resultados de búsqueda web sobre ese término. Cualquier búsqueda genérica sobre "PFAS" devolverá literatura de química ambiental sin relación con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal PFAS |
| Parametros totales | 2.162.184 (recuento de safetensors); la model card indica 2.162.187 para el encoder |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable; no se declara límite explícito) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas ni la precisión exacta de los pesos) |
| Idiomas soportados | no declarados explícitamente; entrenado en CN-Celeb2 (chino) y evaluado también en LibriSpeech (inglés) y VoxCeleb1 |
| Licencia | apache-2.0 |
| Formato de pesos | `model.safetensors` (SafeTensors) y `flax_model.msgpack` (Flax nativo) |
| Dimension del embedding de salida | 640 |
| Pooling temporal | PFAS (Parameter-Free Attentive Scoring) |
| Perdida de entrenamiento | `extended_set_softmax` |
| Scoring de verificacion | PFAS |
| Dominio de entrenamiento | `cnceleb2` |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energía + CMVN |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Pipeline declarado | audio-classification |
| Ficheros del repositorio | `model.safetensors`, `flax_model.msgpack`, `config.json`, `preprocessor_config.json`, `eval_results.json` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-15T01:38:03Z |
| Ultima actualizacion (metadatos) | 2026-10-15T01:38:05Z |

## Arquitectura y entrenamiento

El encoder es un Conformer, es decir, un transformer aumentado con módulos convolucionales, en su variante "small". Sobre las representaciones del encoder se aplica un pooling temporal PFAS, que según la literatura de referencia (Pelecanos et al., Odyssey 2022) permite agregar tramas en el tiempo sin parámetros adicionales de atención aprendidos. El resultado es un embedding de locutor de 640 dimensiones, que se utiliza tanto para la pérdida de entrenamiento como para el scoring de verificación. La pérdida `extended_set_softmax` proviene de la familia GE2E / Dr-Vectors, y el esquema de pooling atencional se inspira en Conformer-ATP. El frontend procesa audio a 16 kHz, extrae log-mel de 80 dimensiones, aplica VAD de energía y normalización CMVN; es compatible con `WhisperFeatureExtractor`, según `preprocessor_config.json`.

La model card es explícita sobre el alcance del proyecto: se trata de una reproducción open source independiente y no de un producto soportado oficialmente por Google. Los experimentos originales de los papers (GE2E, Dr-Vectors, Conformer-ATP y PFAS) se realizaron con infraestructura interna propietaria de Google y con conjuntos de datos internos, por lo que los números de este checkpoint no son directamente comparables con los publicados en esos artículos. No hay información disponible sobre el número de horas o de tokens de entrenamiento, la composición detallada del dataset más allá del dominio `cnceleb2`, ni sobre si se aplicó algún tipo de ajuste posterior (RLHF, DPO u otro), algo por otra parte poco habitual en modelos de verificación de locutor. Los datasets citados en las etiquetas del repositorio son `librispeech_asr`, `cnceleb` y `voxceleb`.

## Capacidades

- Extracción de embeddings de locutor: genera vectores de 640 dimensiones a partir de un fichero de audio, pensados para comparación por similitud coseno o scoring específico.
- Verificación de locutor con una sola utterance: compara un audio de enrolamiento con un audio de prueba y devuelve una puntuación de verificación.
- Verificación con multi-enrolamiento (3 utterances): el repositorio publica métricas específicas para este modo, que reduce el EER de forma consistente en todos los dominios evaluados.
- Identificación de locutor (speaker recognition): los embeddings pueden usarse para clasificación cerrada o abierta mediante clustering o comparación contra una galería.
- Detección de actividad de voz integrada en el frontend, lo que permite descartar segmentos sin habla antes del encoder.
- Funcionamiento multilingüe de facto: aunque el entrenamiento se realiza en CN-Celeb2 (chino), se publican evaluaciones en LibriSpeech (inglés) y VoxCeleb1 (audio in-the-wild), con degradación moderada.
- Inferencia en CPU: con 2,16 M de parámetros, el modelo no requiere GPU.
- API de alto nivel: `load_pretrained`, `extract_embedding` y `verify` desde la librería `flaxspeaker`.
- Capacidades que NO tiene: no es un modelo generativo de texto, no hace razonamiento multi-paso, no soporta tool calling ni function calling, no es multimodal (solo audio de una única modalidad) y no implementa modo "thinking" ni agentes.

## Casos de uso

- Control de acceso por voz en aplicaciones móviles o web: el modelo genera un embedding de 640 dimensiones por utterance y permite verificar si el hablante coincide con el usuario enrolado. Su tamaño de 2,16 M de parámetros y ~8,6 MB en precisión completa permite ejecutarlo en CPU o en el propio dispositivo, sin necesidad de GPU ni de conexión a un servidor de inferencia.
- Enrolamiento multi-utterance en asistentes de voz: con solo tres utterances de enrolamiento el EER baja de 22,13 % a 19,80 % en CN-Celeb2 y de 28,15 % a 24,80 % en VoxCeleb1, lo que hace práctico pedir al usuario que lea tres frases cortas en el alta de la cuenta en lugar de una sola.
- Diarización y segmentación de hablantes en pipelines de transcripción: extraer embeddings por segmento y agruparlos con clustering permite etiquetar quién habla en cada tramo de una reunión o de una llamada; la integración de VAD de energía en el frontend simplifica el preprocesado.
- Filtrado y etiquetado de corpus de audio a gran escala: al ser un modelo minúsculo y sin dependencia de GPU, se puede aplicar sobre millones de ficheros para detectar duplicados de locutor, verificar la coherencia de etiquetas en un dataset o limpiar audios con varios hablantes mezclados.
- Investigación reproducible en reconocimiento de hablante: sirve como punto de partida para comparar variantes de pooling (PFAS frente a attentive statistics pooling) o de pérdida, ya que el código es JAX/Flax puro, la licencia es Apache 2.0 y todo el pipeline de evaluación está incluido.
- Prototipado en entornos embebidos o edge: 2,16 M de parámetros y embeddings de 2,56 KB (640 × 4 bytes) en precisión completa hacen viable desplegar el modelo en dispositivos con memoria muy limitada; el coste dominante pasará a ser el cálculo del log-mel y el VAD, no el encoder.
- Detección de locutor no registrado (open-set): combinando la puntuación de verificación con un umbral calibrado sobre las métricas publicadas (EER y minDCF@0.01 y @0.10) se puede rechazar a hablantes fuera de la galería en escenarios de antifraude de baja criticidad.

## Benchmarks y rendimiento

Resultados de verificación con una sola utterance, tomados de `eval_results.json` y de la model card del autor:

| Conjunto de evaluacion | Trials | EER (%) | IC 95 % bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 24,47 | [22,90; 26,00] | 0,9727 | 0,9400 | 0,8471 |
| CN-Celeb2 (chino multigenero) | 3.000 | 22,13 | [20,75; 23,82] | 0,9660 | 0,8607 | 0,8569 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 28,15 | [26,30; 30,05] | 0,9720 | 0,9720 | 0,8053 |
| Universal agrupado (los 3 dominios) | 8.000 | 26,20 | [25,26; 27,20] | 0,9872 | 0,9630 | 0,8243 |
| Universal macro-media (3 dominios) | 8.000 | 24,92 | — | 0,9702 | 0,9242 | 0,8364 |

Resultados con multi-enrolamiento de tres utterances:

| Conjunto de evaluacion | Trials | 3-Utt EER (%) | IC 95 % bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 18,90 | [16,60; 21,50] | 0,8440 | 0,8982 |
| CN-Celeb2 (3-utt) | 1.000 | 19,80 | [17,30; 22,25] | 0,9280 | 0,8893 |
| VoxCeleb1 (3-utt) | 1.000 | 24,80 | [21,85; 27,60] | 0,9660 | 0,8414 |
| Universal agrupado (3-utt) | 3.000 | 23,20 | [21,65; 24,57] | 0,9407 | 0,8624 |
| Universal macro-media (3-utt) | 3.000 | 21,17 | — | 0,9127 | 0,8763 |

No se han publicado en la información disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza del modelo: no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 8,6 MB en precisión completa (2.162.184 parámetros × 4 bytes). El modelo cabe holgadamente en CPU, sin necesidad de VRAM dedicada.
- Embeddings: 640 dimensiones por utterance, 2,56 KB en precisión completa; el almacenamiento de una galería de miles de locutores es trivial.
- GPU recomendadas: no se requiere ninguna. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero resultaría enormemente infrautilizada para un encoder de 2,16 M de parámetros.
- Compatibilidad con GPU de consumo: sí en todas, incluidas las más modestas, y también en aceleradores integrados. El cuello de botella real será el cálculo de log-mel y el VAD de energía, no el encoder.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) con carga directa desde Hugging Face Hub mediante `load_pretrained`, o el script incluido `scripts/inference.py`. No se documentan rutas de despliegue para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de embeddings. Conversiones a ONNX, TFLite u otros runtimes: no disponible en la información proporcionada.
- Latencia y throughput: no se publican cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto de audio | Licencia | Disponibilidad | Rendimiento reportado |
|---|---|---|---|---|---|---|
| `wq2012/cn_conformer_small_pfas` | Conformer small + pooling PFAS | 2.162.184 | Longitud variable, sin límite declarado | Apache 2.0 | Hugging Face + GitHub + PyPI | 1-utt EER 22,13 % (CN-Celeb2), 24,47 % (LibriSpeech), 28,15 % (VoxCeleb1) |
| ECAPA-TDNN (familia) | TDNN con atención de canal y pooling estadístico | no disponible en la información proporcionada | No disponible | No disponible | Implementaciones en SpeechBrain y otras librerías | No disponible |
| WeSpeaker ResNet34 (familia) | ResNet con pooling estadístico | no disponible en la información proporcionada | No disponible | No disponible | WeSpeaker | No disponible |
| NVIDIA TitaNet (familia) | Conformer/1D convolucional con atención | no disponible en la información proporcionada | No disponible | No disponible | NeMo | No disponible |

No se dispone, en la información proporcionada, de cifras verificables de parámetros, contexto ni EER para los modelos comparables, por lo que la comparación cuantitativa no puede establecerse aquí. Como referencia cualitativa, el checkpoint analizado es entre uno y dos órdenes de magnitud más pequeño que las alternativas habituales de reconocimiento de hablante, lo que explica sus tasas de EER relativamente altas (por encima del 20 % con una utterance) frente a los sistemas de referencia de la literatura, que suelen operar por debajo del 5 % en VoxCeleb1 con protocolos estandarizados.

## Limitaciones y advertencias

- Tasa de error elevada: un EER del 22-28 % con una sola utterance es muy superior al de los sistemas de verificación de locutor en producción. Este modelo no es apto para seguridad crítica, control de acceso sensible ni autenticación bancaria.
- Rendimiento desigual por dominio: el mejor resultado se obtiene en el dominio de entrenamiento (CN-Celeb2, 22,13 % con 1-utt) y el peor en audio in-the-wild (VoxCeleb1, 28,15 %). El ruido, la reverberación y las condiciones de grabación degradan claramente el sistema.
- Sesgo de dominio: el entrenamiento se limita a CN-Celeb2, un corpus chino multigénero. No hay garantía de comportamiento equitativo en otros idiomas, acentos, edades, géneros o condiciones de canal; la ausencia de una evaluación desagregada por subgrupos impide cuantificarlo.
- No es un producto oficial de Google: la propia model card incluye el aviso explícito de que no se trata de un producto soportado oficialmente. La reproducción es clean-room y los resultados de los papers originales no son comparables, ya que se obtuvieron con datasets internos y con una arquitectura distinta.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar el aviso de licencia, pero no implica ninguna garantía de rendimiento ni respaldo por parte del autor original del algoritmo.
- Validación externa inexistente: el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no hay evidencia de uso independiente ni reproducción de los resultados por terceros.
- Calibración de umbral necesaria: en producción, las puntuaciones de verificación necesitan un umbral calibrado sobre datos propios. Los valores minDCF publicados (0,86-0,99 según dominio y umbral) indican un margen de mejora considerable en la decisión.
- Riesgo de falso positivo o falso negativo: aunque el modelo no genera texto y por tanto no "alucina" en el sentido lingüístico, sí puede producir puntuaciones de similitud engañosas entre hablantes distintos (falsos positivos), especialmente con audio corto.
- Ausencia de información de entrenamiento: no se documentan horas de audio, tamaño efectivo del dataset, hiperparámetros de entrenamiento ni precisión de los pesos, lo que dificulta la reproducibilidad exacta.
- Ambigüedad del acrónimo: `pfas` designa aquí Parameter-Free Attentive Scoring y no debe confundirse con las sustancias perfluoroalquiladas, que son el objeto de los resultados de búsqueda web más frecuentes para ese término.
- Anomalía en los metadatos: las fechas de creación y actualización del repositorio (15 de octubre de 2026) son posteriores a la fecha habitual de consulta, lo que sugiere un error de marca temporal o un reloj mal configurado en el momento de la subida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/cn_conformer_small_pfas
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor (Personal VAD 2.0): https://huggingface.co/wq2012/personal-vad-v2-conformer-unified

Nota sobre la busqueda web: los resultados obtenidos al buscar "PFAS" corresponden mayoritariamente a literatura sobre sustancias perfluoroalquiladas (gestion medioambiental, toxicidad, sistemas de filtrado) y a proyectos de aprendizaje automatico aplicados a quimica ambiental. Ninguno de ellos guarda relacion con este checkpoint. El unico resultado relevante encontrado es el modelo `wq2012/personal-vad-v2-conformer-unified`, del mismo autor y con arquitectura Conformer tambien orientada a audio.
