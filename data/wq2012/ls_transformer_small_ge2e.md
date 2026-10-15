# wq2012/ls_transformer_small_ge2e

## Resumen

`ls_transformer_small_ge2e` es un modelo de verificación e identificación de locutor (speaker verification) publicado en HuggingFace por el desarrollador wq2012 (Quan Wang, autor principal del paper original de GE2E). No es un modelo de lenguaje: es un encoder de audio que transforma una locución en un embedding de locutor de 192 dimensiones, de forma que dos fragmentos del mismo hablante quedan próximos en el espacio de embeddings y dos de hablantes distintos quedan alejados. La verificación se realiza mediante similitud coseno entre embeddings.

Técnicamente es una red transformer de tamano "small" con pooling temporal atencional (ATP, Attentive Temporal Pooling) y entrenamiento con pérdida GE2E softmax (Generalized End-to-End Loss). Con solo 1.239.622 parámetros en el encoder es un modelo extraordinariamente compacto: cabe en unos 5 MB en fp32, lo que lo hace apto para CPU, dispositivos embebidos y despliegues con requisitos de latencia muy estrictos. La entrada es un frontend de log-mel de 80 dimensiones a 16 kHz, con VAD de energía y normalización CMVN.

Su relevancia es doble. Por un lado, es una reproducción open source, en JAX/Flax y con licencia Apache 2.0, de algoritmos de reconocimiento de locutor que hasta ahora se implementaban sobre infraestructura propietaria de Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS). Por otro, sirve como punto de partida reproducible y ligero para investigación en verificación de locutor, con evaluación multi-dominio publicada (LibriSpeech, CN-Celeb2 y VoxCeleb1). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin adopción comunitaria consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "small" con pooling temporal atencional (ATP) |
| Parametros totales | 1.239.622 (encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa uttarancias completas con pooling temporal; no se publica limite explicito de frames) |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (modelo de embedding de locutor independiente del idioma; entrenado en LibriSpeech, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimensión del embedding de salida | 192 |
| Función de pérdida | ge2e_softmax |
| Scoring de verificación | Similitud coseno |
| Frontend de audio | log_mel de 80 dimensiones a 16.000 Hz + VAD de energía + CMVN |
| Dominio de entrenamiento | LibriSpeech |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline declarado | audio-classification |

## Arquitectura y entrenamiento

El backbone es un transformer de tamano reducido que opera sobre tramas acústicas extraidas por un frontend compatible con `WhisperFeatureExtractor`: log-mel de 80 dimensiones a 16 kHz, segmentación mediante VAD de energía basado en la energía de la senal y normalización CMVN. Sobre las representaciones del encoder se aplica un pooling temporal atencional (ATP, descrito en el paper de Conformer-ATP para identificación de idioma en streaming), que agrega la secuencia temporal en un unico vector de 192 dimensiones. El entrenamiento emplea la pérdida GE2E softmax, variante de la Generalized End-to-End Loss que normaliza los centroides de embedding por locutor dentro de cada batch, y la verificación en inferencia se realiza con similitud coseno pura, sin capa de clasificación adicional.

Los datasets declarados en la model card son LibriSpeech ASR (dominio de entrenamiento principal), CN-Celeb2 y VoxCeleb (usados en la evaluación multi-dominio). No se especifica en la información proporcionada el número exacto de horas de entrenamiento, la composición detallada del dataset, ni si hubo etapas de fine-tuning con otras pérdidas. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La propio model card incluye un aviso explícito: se trata de una reproducción independiente tipo clean-room y no de un producto oficial de Google; los experimentos originales de los papers citados (GE2E, Dr-Vectors, Conformer-ATP, PFAS) se realizaron con infraestructura y datasets internos propietarios, no con esta libreria ni con los splits públicos.

## Capacidades

- Extracción de embeddings de locutor: genera un vector de 192 dimensiones por locución.
- Verificación de locutor (1:1): compara dos audios y devuelve una puntuación de similitud coseno.
- Identificación de locutor (1:N): por comparación de embeddings contra una galeria de referencia, implementable por búsqueda de vecinos más cercanos.
- Verificación multi-locución: se publican resultados específicos para registro con 3 locuciones (3-utt enrollment), con mejora significativa del EER respecto al modo de 1 locución.
- Robusto a múltiples dominios de evaluación: se evalúa en ingles leido (LibriSpeech), chino multigenero (CN-Celeb2) e in-the-wild (VoxCeleb1).
- Inferencia en CPU: el tamano del modelo permite ejecución sin GPU.
- API Python y CLI: `flaxspeaker.load_pretrained`, `model.extract_embedding`, `model.verify`, y `scripts/inference.py`.
- No soporta: generación de texto, razonamiento, código, matemáticas, tool calling, function calling, agentes, visión ni audio comprensivo. Es exclusivamente un extractor de embeddings acústicos.

## Casos de uso

- Verificación biométrica por voz en control de acceso: el modelo extrae el embedding de la frase de registro y lo compara con el de la frase de prueba mediante similitud coseno. Es adecuado por su tamano (1,24 M de parámetros) y su capacidad de ejecución en CPU, aunque el EER publicado en LibriSpeech de 1 locución (10,60%) obliga a combinarlo con factores adicionales o a usar registro de 3 locuciones (6,20%).
- Autenticación en centros de atención telefónica: verificar que el interlocutor es quien dice ser comparando su voz con una plantilla almacenada, como capa antifraude previa a operaciones sensibles. El soporte de registro multi-locución reduce el EER a 6,20% en LibriSpeech.
- Diarización de reuniones como componente de pipeline: calcular embeddings por segmento y agruparlos con clustering (por ejemplo, k-means o agglomerative clustering) para asignar turnos de palabra. El pooling temporal atencional permite procesar segmentos largos sin truncar agresivamente.
- Búsqueda y recuperación de audio por voz ("voice search"): indexar una fonoteca con embeddings de 192 dimensiones y resolver consultas por similitud coseno, permitiendo encontrar todas las intervenciones de un mismo hablante en un archivo histórico.
- Deduplicación y control de calidad de corpus de audio: detectar locuciones repetidas o hablantes duplicados en datasets de entrenamiento antes de usarlos para entrenar modelos ASR o TTS, evitando fugas de datos entre splits.
- Etiquetado de hablantes en corpus multilingües: el modelo se ha evaluado en chino (CN-Celeb2) además de inglés, por lo que puede usarse para anotar hablantes en colecciones mixtas, asumiendo el EER más alto en dominio chino (28,10% en 1 locución).
- Investigación y reproducción de resultados: al ser una implementación en JAX/Flax con licencia Apache 2.0, permite reproducir GE2E, evaluar ATP y comparar estrategias de scoring sin depender de infraestructura propietaria.
- Prototipado rápido en entornos sin GPU: el modelo se carga y ejecuta en portátiles o en dispositivos con recursos limitados, útil para validar una idea de producto antes de escalar a modelos de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados en la model card para verificación con 1 locución de registro:

| Split de evaluacion | Trials | EER (%) | IC 95% bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 10,60 | [9,47; 11,68] | 0,8873 | 0,5267 | 0,9562 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,10 | [26,40; 29,67] | 0,9413 | 0,8927 | 0,7932 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,30 | [20,50; 24,10] | 0,9580 | 0,8720 | 0,8643 |
| Universal pooled (3 dominios) | 8.000 | 20,80 | [19,82; 21,65] | 0,9293 | 0,7913 | 0,8800 |
| Universal macro-average (3 dominios) | 8.000 | 20,33 | no disponible | 0,9289 | 0,7638 | 0,8712 |

Resultados con registro de 3 locuciones:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95% bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,60; 7,80] | 0,6320 | 0,9827 |
| CN-Celeb2 (3-utt) | 1.000 | 23,30 | [20,60; 25,70] | 0,8480 | 0,8488 |
| VoxCeleb1 (3-utt) | 1.000 | 16,90 | [14,90; 19,40] | 0,8980 | 0,9022 |
| Universal pooled (3-utt) | 3.000 | 16,37 | [15,08; 17,62] | 0,8507 | 0,9199 |
| Universal macro-average (3-utt) | 3.000 | 15,47 | no disponible | 0,7927 | 0,9112 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje en la información disponible, dado que el modelo no realiza tareas de texto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 MB para los pesos en fp32 (1.239.622 parámetros x 4 bytes). En la practica, el consumo vendrá dominado por el runtime de JAX/Flax y los buffers de activaciones, no por los pesos.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con al menos unos cientos de MB libres (GTX 1050, RTX 3060, RTX 4090, A100, H100) es más que suficiente; el modelo no aprovechará la capacidad de cómputo de aceleradores de gama alta.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU. Es plausible su ejecución en dispositivos embebidos tipo Raspberry Pi o en movil, aunque no se documenta soporte oficial para esas plataformas.
- Opciones de despliegue: libreria `flaxspeaker` (JAX/Flax) instalable desde PyPI, con API Python y script de inferencia por linea de comandos. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son runtimes orientados a modelos generativos de lenguaje y este modelo no genera texto. No se documenta exportación a ONNX, TensorRT ni TFLite.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tiempo real factor (RTF) en la información proporcionada.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks de terceros, por lo que las celdas de rendimiento de las alternativas se marcan como no disponibles. La comparación es cualitativa:

| Modelo | Parametros | Contexto / entrada | Rendimiento (EER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ls_transformer_small_ge2e | 1.239.622 | Utterance completo, log-mel 80 dim @ 16 kHz | 10,60% (LibriSpeech 1-utt), 6,20% (3-utt) | Apache 2.0 | HuggingFace + PyPI (flaxspeaker) |
| ECAPA-TDNN (SpeechBrain) | No disponible en la informacion | Utterance completo, mel spectrogram | No disponible | Apache 2.0 (SpeechBrain) | HuggingFace + PyPI |
| x-vector (Kaldi) | No disponible en la informacion | Utterance completo, MFCC | No disponible | Apache 2.0 | Repositorio Kaldi |
| WavLM / HuBERT + cabezal ECAPA | No disponible en la informacion | Utterance completo, waveform | No disponible | MIT / Apache 2.0 segun checkpoint | HuggingFace |
| Titanet (NVIDIA NeMo) | No disponible en la informacion | Utterance completo, mel spectrogram | No disponible | Apache 2.0 | NVIDIA NeMo |

La diferencia fundamental frente a todos ellos es el orden de magnitud del tamano: 1,24 M de parámetros sitúa a este modelo muy por debajo de las alternativas habituales de verificación de locutor, que suelen emplear decenas de millones de parámetros. A cambio, los EER publicados en domino in-the-wild y chino son altos, lo que limita su uso directo en producción sin un ajuste fino adicional.

## Limitaciones y advertencias

- Rendimiento absoluto limitado: un EER del 10,60% en LibriSpeech (1 locución) y del 22,30% en VoxCeleb1 indica una capacidad de discriminación moderada, alejada de lo que se exige en sistemas biométricos comerciales.
- Degradación fuerte en dominios no ingleses: el EER sube al 28,10% en CN-Celeb2, coherente con un entrenamiento centrado en LibriSpeech (ingles). El modelo no está equilibrado entre idiomas.
- Sesgo de dominio de entrenamiento: al haberse entrenado sobre LibriSpeech (lectura de audiolibros en ingles), el rendimiento puede degradarse con audio espontáneo, ruido de fondo, acentos no nativos, canales telefónicos o solapamiento de voces.
- Riesgo de falsos positivos y falsos negativos: los minDCF publicados (0,8873 en LibriSpeech a 0,01; 0,9580 en VoxCeleb1) reflejan una tasa de error elevada en el punto de operación estricto, lo que desaconseja su uso como único factor de autenticación.
- Riesgo de suplantación y ataques de reproducción: no se documenta ninguna mitigación anti-spoofing ni detección de voz sintetizada o reproducida.
- Sin datos sobre sesgos demográficos: no se publican métricas desagregadas por género, edad, acento o lengua materna.
- Limitaciones de idioma: la model card no declara una lista de idiomas soportados. El modelo es un extractor de embeddings independiente del contenido linguístico, pero su comportamiento está condicionado por los datos de entrenamiento.
- Adopción nula y escasa validación externa: 0 descargas, 0 likes y ningún benchmark de terceros en el momento de la consulta. Es un artefacto de investigación reciente, no un componente probado en producción.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial y modificación, con obligación de conservar el aviso de copyright y la licencia. Los papers subyacentes (GE2E, Dr-Vectors, Conformer-ATP, PFAS) están publicados por Google; la reproducción es independiente y no oficial.
- Requisitos de despliegue: la dependencia de JAX/Flax (libreria `flaxspeaker`) puede suponer fricción en stacks de producción basados en PyTorch u ONNX Runtime. No se documenta exportación a formatos portables.
- Limitación de contexto/audio: no se especifica duración máxima de audio por locución ni el comportamiento con segmentos muy cortos o muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_transformer_small_ge2e
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Perfil GitHub del autor: https://github.com/wq2012
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
