# wq2012/univ_lstm_small_ge2e

## Resumen

`univ_lstm_small_ge2e` es un modelo de verificacion e identificacion de hablante (speaker verification) publicado por el usuario wq2012 dentro de la libreria `flaxspeaker`, una reimplementacion limpia (clean-room) en JAX/Flax de varios algoritmos de reconocimiento de locutor publicados por Google. No es un modelo generativo ni un LLM: su salida es un embedding de 192 dimensiones que representa la identidad vocal de una locucion, y la decision de verificacion se toma mediante similitud coseno entre embeddings.

El modelo es deliberadamente pequeno: el encoder LSTM cuenta con 1.710.914 parametros segun la model card (1.710.912 segun el recuento de safetensors), lo que lo situa en la categoria "small" de la familia y lo hace apto para inferencia en CPU, movil y dispositivos de borde gracias a sus exportaciones a TensorFlow Lite en FP32 e INT8. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz con VAD por energia y normalizacion CMVN.

Su relevancia actual es fundamentalmente metodologica: sirve como referencia reproducible y ligera de tecnicas como la perdida GE2E, el pooling atencional y el scoring coseno, y como punto de partida para experimentos de verificacion de hablante en entornos con recursos limitados. Sus tasas de error (EER del 14,97 % en LibriSpeech y del 21,31 % en el pool universal de una locucion) estan lejos de los sistemas de produccion de alto rendimiento, por lo que debe entenderse como modelo de investigacion o de borde, no como solucion de seguridad critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (backbone `lstm`, variante `small`) con temporal pooling atencional (`asp`) |
| Parametros totales | 1.710.914 (model card) / 1.710.912 (recuento de safetensors); discrepancia de 2 parametros sin documentar |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica: modelo de embeddings de audio, no generativo; opera sobre ventanas de caracteristicas log-mel de 80 dimensiones |
| Tipos de cuantizacion | FP32 y INT8 dynamic range (TensorFlow Lite, ~3,5x mas pequeno) |
| Idiomas soportados | no disponible como lista oficial; entrenado y evaluado con datos en ingles (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax msgpack (`flax_model.msgpack`), TensorFlow Lite FP32 e INT8 |
| Dimension del embedding | 192 |
| Pooling temporal | `asp` (attentive statistics pooling) |
| Perdida de entrenamiento | `ge2e_softmax` |
| Scoring de verificacion | similitud coseno |
| Dominio de entrenamiento | `universal` |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Libreria | `flaxspeaker` (PyPI), JAX/Flax |
| Pipeline declarado | audio-classification |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder recurrente LSTM de tamano reducido con un pooling temporal atencional (`asp`), que agrega la secuencia de estados ocultos en un unico vector de 192 dimensiones. El entrenamiento utiliza la perdida `ge2e_softmax` (Generalized End-to-End Loss), formulada originalmente para aprender embeddings de hablante directamente a partir de lotes de locuciones, de modo que la similitud coseno dentro de la misma clase se maximiza y entre clases distintas se minimiza. En inferencia, la verificacion se resuelve comparando embeddings con similitud coseno, y no se requiere una cabeza clasificadora adicional.

Los datos de entrenamiento declarados son LibriSpeech ASR, CN-Celeb y VoxCeleb, lo que explica el diseno "universal" del checkpoint y su evaluacion cruzada en tres dominios (lectura en ingles, multi-genero en chino, y audio "in-the-wild" de celebridades). No se especifican en la informacion disponible el numero exacto de tokens, horas de audio ni la composicion detallada del dataset, ni si se aplicaron etapas de ajuste tipo RLHF o DPO (no aplicables en un modelo de embeddings). El autor indica explicitamente que se trata de una reproduccion independiente y no de un producto oficial de Google, y que los articulos originales (GE2E, Dr-Vectors, Conformer-ATP y PFAS) se entrenaron con infraestructura y datasets internos propietarios, no con esta libreria ni con estos splits publicos.

Como innovaciones tecnicas destacables, el checkpoint incorpora pooling atencional en lugar de estadisticas simples, exportacion a TensorFlow Lite con cuantizacion dinamica INT8 para inferencia en CPU de borde, y un frontend compatible con `WhisperFeatureExtractor`. El repositorio incluye `eval_results.json` con metricas verificadas, intervalos de confianza bootstrap al 95 % y evaluacion multi-dominio con uno y tres utterances de enrolamiento.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio de entrada.
- Verificacion de hablante (1:1) mediante puntuacion por similitud coseno entre dos locuciones.
- Identificacion de hablante (1:N) mediante comparacion contra una galeria de embeddings, utilizable con clustering posterior.
- Enrolamiento multiple: el rendimiento mejora al promediar embeddings de 3 utterances (por ejemplo, EER del 21,31 % al 18,00 % en el pool universal).
- Funcionamiento multi-dominio: evaluado en ingles leido (LibriSpeech), chino multi-genero (CN-Celeb2) y audio in-the-wild (VoxCeleb1).
- Inferencia en CPU y dispositivos de borde mediante `model_fp32.tflite` y `model_int8.tflite`.
- Integracion con JAX/Flax mediante la libreria `flaxspeaker` y API de carga desde Hugging Face Hub (`load_pretrained`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo "thinking".

## Casos de uso

- Autenticacion por voz en aplicaciones moviles: el modelo INT8 de aproximadamente 1,95 MB puede ejecutarse en el propio dispositivo para verificar que quien habla es el usuario enrolado, evitando enviar audio biometrico a un servidor.
- Personalizacion de asistentes de voz: extraer el embedding del hablante al inicio de la sesion y conmutar el perfil de usuario (idioma, historial, preferencias) sin necesidad de un identificador explicito.
- Diarizacion de reuniones y transcripciones: usar los embeddings como entrada a un algoritmo de clustering (por ejemplo, spectral clustering) para segmentar quien habla en cada tramo de una grabacion multi-participante antes de pasar el audio a un sistema ASR.
- Indexado y busqueda de archivos de audio por locutor: generar embeddings de un archivo de podcasts, entrevistas o grabaciones de archivo y agrupar o recuperar fragmentos por similitud de voz.
- Filtrado previo en pipelines de datos de voz: descartar o etiquetar automaticamente locuciones de hablantes no deseados (por ejemplo, limpiar un corpus de entrenamiento o aislar a un unico hablante de un dataset ruidoso).
- Prototipado e investigacion reproducible: punto de partida ligero para comparar estrategias de pooling (`asp` frente a estadisticas simples), perdidas (`ge2e_softmax` frente a alternativas) y esquemas de scoring, con metricas de referencia ya publicadas.
- Control de acceso de baja criticidad en dispositivos embebidos: verificacion complementaria a un PIN o token en escenarios donde el coste computacional es la restriccion principal, asumiendo la tasa de error documentada.

## Benchmarks y rendimiento

Verificacion con 1 utterance de enrolamiento:

| Split de evaluacion | Trials | EER (%) | IC 95 % bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,97 | [13,80; 16,35] | 0,9493 | 0,7667 | 0,9236 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 25,53 | [23,83; 26,98] | 0,9787 | 0,9660 | 0,8305 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,50 | [20,70; 24,20] | 0,9580 | 0,9070 | 0,8643 |
| Universal pooled (3 dominios) | 8.000 | 21,31 | [20,42; 22,15] | 0,9750 | 0,9028 | 0,8730 |
| Universal macro-average | 8.000 | 21,00 | no disponible | 0,9620 | 0,8799 | 0,8728 |

Verificacion con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,20 | [9,20; 13,10] | 0,7840 | 0,9630 |
| CN-Celeb2 (3-utt) | 1.000 | 21,60 | [18,75; 23,60] | 0,9860 | 0,8732 |
| VoxCeleb1 (3-utt) | 1.000 | 19,50 | [16,60; 21,80] | 0,9820 | 0,8904 |
| Universal pooled (3-utt) | 3.000 | 18,00 | [16,67; 19,33] | 0,9853 | 0,9082 |
| Universal macro-average (3-utt) | 3.000 | 17,43 | no disponible | 0,9173 | 0,9089 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de reconocimiento de hablante (por ejemplo, protocolos oficiales VoxCeleb1-O/E/H con normalizacion de score AS-norm) que permitan una comparacion directa con sistemas de referencia.

## Requisitos de hardware

- VRAM estimada: practicamente despreciable. Con 1,71 M de parametros, los pesos en FP32 ocupan aproximadamente 6,8 MB y la version INT8 en torno a 1,95 MB.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB libres es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Estas GPU solo tendrian sentido para procesar lotes muy grandes en paralelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU. Tambien cabe comodamente en RAM de sistemas embebidos.
- Opciones de despliegue: JAX/Flax con la libreria `flaxspeaker` (API `load_pretrained` y `scripts/inference.py`), TensorFlow Lite (FP32 o INT8 dynamic range) para Android, iOS y dispositivos de borde, y `safetensors` o `flax_model.msgpack` para integraciones personalizadas. vLLM, llama.cpp, Ollama, TGI y GGUF no aplican, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que la version INT8 es aproximadamente 3,5 veces mas pequena, pero no publica mediciones de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_lstm_small_ge2e` | LSTM + pooling ASP, perdida GE2E-softmax | 1.710.914 (encoder) | Audio 16 kHz, log-mel 80 dim, embedding 192 | Apache-2.0 | Hugging Face, PyPI, GitHub, TFLite |
| ECAPA-TDNN (familia, p. ej. `speechbrain/spkrec-ecapa-voxceleb`) | CNN con squeeze-excitation + attentive statistics pooling | no disponible en la informacion proporcionada | Audio 16 kHz, embedding 192 | Apache-2.0 | Hugging Face, SpeechBrain |
| x-vector / TDNN clasico | TDNN con pooling estadistico | no disponible en la informacion proporcionada | Audio 16 kHz, embedding tipicamente 512 | variada segun implementacion | Kaldi, implementaciones diversas |
| ResNet de reconocimiento de hablante (familia WeSpeaker / VoxCeleb) | CNN ResNet con pooling estadistico | no disponible en la informacion proporcionada | Audio 16 kHz, embedding variable | Apache-2.0 en varias implementaciones | Hugging Face, WeSpeaker |

No se dispone de cifras de EER comparables bajo un mismo protocolo de evaluacion para estos sistemas dentro de la informacion proporcionada; las tasas publicadas por cada proyecto emplean splits, normalizacion de score y condiciones de prueba distintos, por lo que una comparacion numerica directa no seria valida. La ventaja objetiva y verificable de `univ_lstm_small_ge2e` frente a estas alternativas es su tamano (1,71 M de parametros) y su exportacion a TFLite INT8, no su precision.

## Limitaciones y advertencias

- Tasas de error elevadas para uso en produccion: EER del 14,97 % en LibriSpeech y del 21,31 % en el pool universal con una utterance de enrolamiento. No es adecuado para autenticacion de alta seguridad ni para decisiones con consecuencias legales o economicas.
- Fuerte dependencia del dominio: el rendimiento cae del 14,97 % (ingles leido) al 25,53 % (chino multi-genero) en la misma configuracion, lo que evidencia un sesgo hacia habla leida y limpia.
- Sin lista oficial de idiomas soportados; la evaluacion cubre ingles y chino, y no hay garantias para otras lenguas ni para acentos no representados en los datos de entrenamiento.
- Modelo no generativo: no puede alucinar texto, pero si producir puntuaciones de similitud erroneas (falsos positivos o falsos negativos) en condiciones de ruido, canal desconocido o locuciones muy cortas.
- Riesgo de sesgo demografico: los datasets de entrenamiento y evaluacion (LibriSpeech, VoxCeleb, CN-Celeb) tienen una representacion demografica y de genero limitada y no documentada, por lo que el rendimiento puede degradarse de forma desigual entre grupos de hablantes.
- Necesidad de calibracion: no se documentan umbrales de decision recomendados ni normalizacion de score (por ejemplo AS-norm); el uso directo de similitud coseno con un umbral fijo puede dar tasas de falsa aceptacion inaceptables.
- Caveat de procedencia: el autor declara explicitamente que no es un producto soportado oficialmente por Google y que los articulos originales se entrenaron con infraestructura y datos internos propietarios, por lo que los resultados no son directamente comparables con los publicados en esos papers.
- Metadatos a verificar: las fechas de creacion y actualizacion registradas (2026-10-15) son posteriores a la fecha habitual de publicacion de esta ficha; conviene comprobar la version real del repositorio antes de desplegarlo.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion de avisos, pero no exime del cumplimiento de normativas de proteccion de datos biometricos (RGPD y equivalentes) al tratar embeddings de voz.
- Sin descargas ni likes registrados y sin validacion independiente por parte de terceros en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_lstm_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E: Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- Paper PFAS: Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; las unicas fuentes utiles son las listadas anteriormente.
