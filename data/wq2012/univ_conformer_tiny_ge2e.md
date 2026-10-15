# wq2012/univ_conformer_tiny_ge2e

## Resumen

`univ_conformer_tiny_ge2e` es un modelo de verificación e identificación de locutor (speaker verification) publicado por el autor wq2012 dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos de reconocimiento de hablante descritos en cuatro artículos de referencia (GE2E, Dr-Vectors, Conformer-ATP y PFAS). No se trata de un modelo de lenguaje: es un extractor de embeddings de locutor que transforma una señal de audio en un vector de 128 dimensiones, de forma que dos fragmentos del mismo hablante quedan próximos en el espacio de embeddings y dos fragmentos de hablantes distintos quedan alejados.

La arquitectura es un Conformer en su variante `tiny`, con pooling temporal atento (attentive temporal pooling, `atp`), entrenado con la pérdida `ge2e_softmax` y puntuado mediante similitud coseno. Con solo 693.126 parámetros en el codificador, es un modelo extremadamente compacto, pensado para inferencia ligera, despliegue en dispositivos con recursos limitados y experimentación reproducible sobre datos públicos.

Su relevancia actual radica en dos factores. Por un lado, ofrece una implementación limpia y verificable de técnicas que en los papers originales se evaluaron sobre infraestructura y datasets internos propietarios de Google, aquí reentrenada exclusivamente con datos públicos (LibriSpeech, CN-Celeb2 y VoxCeleb1). Por otro, publica resultados de evaluación multidominio con intervalos de confianza bootstrap y métricas EER, minDCF y ROC-AUC tanto para verificación con un único audio como con enrolamiento múltiple de tres audios, lo que permite comparar de forma honesta su rendimiento real, que es modesto por su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`tiny`) con pooling temporal atento (`atp`) |
| Parametros totales | 693.126 (parametros del codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio de duracion variable, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no declarados explicitamente; evaluado en ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 128 |
| Perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | similitud coseno |
| Dominio de entrenamiento | `universal` |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Biblioteca | flaxspeaker (JAX/Flax) |
| Pipeline | audio-classification |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer aumentado con convoluciones en el que cada bloque combina atencion multi-cabeza, un modulo convolucional y dos modulos feed-forward en estructura tipo macaron. Sobre la secuencia de representaciones, el modelo aplica attentive temporal pooling (ATP), que agrega los frames en un unico vector ponderando la importancia relativa de cada instante temporal. El resultado es un embedding de locutor de 128 dimensiones, y la decision de verificación se toma con similitud coseno entre embeddings, sin ningun clasificador adicional entrenado.

El entrenamiento sigue el esquema GE2E con `ge2e_softmax`, una pérdida de extremo a extremo que agrupa los embeddings del mismo hablante y separa los de hablantes distintos dentro de un lote, evitando la necesidad de muestrear pares. El modelo se entrena sobre lo que la model card denomina dominio `universal`, agregando tres corpus publicos: LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (habla espontanea de celebridades). El frontend usa log-mel de 80 dimensiones a 16.000 Hz, con deteccion de actividad de voz (VAD) basada en energia y normalizacion cepstral media y varianza (CMVN).

La innovacion mas relevante es metodologica: se trata de una reproduccion en JAX/Flax, limpia e independiente, de tecnicas publicadas por Google con infraestructura y datos internos, ahora reimplementadas con datos publicos. La model card declara explicitamente que no es un producto oficial de Google y que los resultados de los papers originales no son directamente comparables con los de este checkpoint. El repositorio incluye `config.json`, `preprocessor_config.json` compatible con `WhisperFeatureExtractor` y `eval_results.json` con metricas verificadas e intervalos de confianza al 95 por ciento.

## Capacidades

- Extraccion de embeddings de locutor: genera un vector de 128 dimensiones por audio o por segmento, apto para comparaciones por distancia coseno.
- Verificacion de locutor con un unico audio (1-utterance): decide si dos fragmentos corresponden al mismo hablante.
- Verificacion con enrolamiento multiple: soporta agregacion de tres audios de enrolamiento, con mejora clara de EER respecto al caso de un solo audio.
- Puntuacion directa mediante API (`model.verify`) y por linea de comandos (`scripts/inference.py`).
- Funcionamiento en tres dominios evaluados: ingles leido, chino multigenero y habla espontanea de celebridades.
- Capacidad de servir como modulo de embeddings para tareas derivadas, como diarizacion o agrupamiento de hablantes.
- No ofrece generacion de texto.
- No soporta tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No incorpora capacidades de vision ni de audio generativo.

## Casos de uso

- Control de acceso biometrico por voz: el modelo extrae el embedding de una frase de contrasena y lo compara por coseno con el embedding enrolado del usuario; su tamano de 693.126 parametros permite ejecutar la verificacion localmente sin enviar audio a un servidor.
- Diarizacion de reuniones: combinado con un sistema de segmentacion y VAD, los embeddings de 128 dimensiones permiten agrupar intervenciones por hablante y etiquetar transcripciones; es adecuado por su bajo coste computacional al procesar horas de audio.
- Personalizacion de ASR: el embedding de locutor puede inyectarse como condicionamiento en modelos de reconocimiento de habla, de forma analoga al enfoque de Personal VAD del mismo autor, para mejorar la transcripcion de un hablante concreto.
- Deteccion de fraude y suplantacion: como primera etapa de un pipeline de anti-spoofing, la puntuacion de verificacion detecta discrepancias entre la voz declarada y la voz real antes de aplicar contramedidas especificas.
- Busqueda de hablantes en archivos de audio: indexar grandes volumenes de grabaciones con embeddings de 128 dimensiones y recuperar por similitud coseno todos los fragmentos de una persona concreta.
- Verificacion de identidad en atencion al cliente: validar al interlocutor en conversaciones telefonicas con enrolamiento multiple de tres audios, donde el EER baja al 15,03 por ciento en el conjunto agrupado universal.
- Prototipado e investigacion reproducible: al publicar metricas multidominio con intervalos bootstrap, sirve como linea base ligera y verificable para comparar nuevas tecnicas de pooling, perdidas o frontends en JAX/Flax.

## Benchmarks y rendimiento

Verificacion con un unico audio (resultados publicados en la model card):

| Conjunto de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 13,23 | [12,05, 14,42] | 0,8420 | 0,6513 | 0,9403 |
| CN-Celeb2 (chino multigenero) | 3.000 | 22,00 | [20,43, 23,40] | 0,9793 | 0,9133 | 0,8616 |
| VoxCeleb1 (habla espontanea) | 2.000 | 22,55 | [20,32, 24,10] | 0,9420 | 0,8390 | 0,8744 |
| Universal agrupado (3 dominios) | 8.000 | 18,75 | [17,89, 19,68] | 0,9690 | 0,8402 | 0,8963 |
| Universal media macro (3 dominios) | 8.000 | 19,26 | no disponible | 0,9211 | 0,8012 | 0,8921 |

Verificacion con enrolamiento multiple de tres audios:

| Conjunto de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 8,80 | [6,80, 10,40] | 0,5220 | 0,9739 |
| CN-Celeb2 (3-utt) | 1.000 | 19,20 | [16,35, 21,20] | 0,9520 | 0,8981 |
| VoxCeleb1 (3-utt) | 1.000 | 17,60 | [15,25, 19,90] | 0,9320 | 0,9022 |
| Universal agrupado (3-utt) | 3.000 | 15,03 | [13,67, 16,20] | 0,9320 | 0,9272 |
| Universal media macro (3-utt) | 3.000 | 15,20 | no disponible | 0,8020 | 0,9247 |

No se han publicado comparaciones directas con otros checkpoints de la misma coleccion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 MB para los pesos en fp32 y 1,4 MB en fp16, dado el tamano de 693.126 parametros; el consumo real lo dominan las activaciones y el bucle de inferencia en JAX.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; resulta plenamente funcional en CPU y en aceleradores de borde.
- Cabe en GPU de consumo: si, en cualquier GPU consumer, e incluso en CPU. El modelo esta disenado para ser `tiny`.
- Opciones de despliegue: la libreria `flaxspeaker` (JAX/Flax) con `load_pretrained`, el script `scripts/inference.py` para linea de comandos, y el paquete PyPI `flaxspeaker`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada para modelos alternativos de verificacion de locutor. A continuacion se resumen los atributos verificables de este modelo frente a categorias alternativas, marcando como no disponible todo aquello que no consta:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| `wq2012/univ_conformer_tiny_ge2e` | 693.126 | no aplica (audio) | Apache 2.0 | Hugging Face, PyPI, GitHub | EER 18,75% pooled 1-utt; 15,03% pooled 3-utt |
| ECAPA-TDNN (SpeechBrain) | no disponible | no aplica (audio) | no disponible | no disponible | no disponible |
| x-vector (Kaldi) | no disponible | no aplica (audio) | no disponible | no disponible | no disponible |
| Modelos basados en WavLM para speaker verification | no disponible | no aplica (audio) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento es modesto por diseno: con 693.126 parametros, el EER agrupado universal es del 18,75 por ciento con un solo audio y del 15,03 por ciento con tres audios de enrolamiento, muy lejos de los sistemas de verificacion de locutor de gran tamano.
- Existe un desequilibrio claro entre dominios: el EER en LibriSpeech es del 13,23 por ciento frente al 22,55 por ciento en VoxCeleb1, lo que indica peor comportamiento en habla espontanea y ruidosa que en lectura limpia.
- Riesgo de falsos positivos y falsos negativos: al operar con similitud coseno sobre embeddings de 128 dimensiones, no existe umbral universal valido; el umbral debe calibrarse por dominio y con datos propios.
- No es un producto oficial de Google y los resultados de los papers de referencia no son comparables con los de este checkpoint, tal como advierte la propia model card.
- Los idiomas soportados no estan declarados explicitamente; la evaluacion cubre ingles y chino, por lo que el comportamiento en otras lenguas es desconocido.
- No se documentan tecnicas de mitigacion de sesgo ni evaluaciones por genero, edad, acento o canal telefonico, lo que supone un riesgo para despliegues en produccion con poblaciones diversas.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la asignacion erronea de identidad.
- Uso comercial: permitido bajo licencia Apache 2.0, sin restricciones adicionales documentadas, siempre que se cumplan las obligaciones de atribucion y aviso de cambios.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad ni garantias de mantenimiento.
- El tratamiento de datos biometricos de voz esta sujeto a normativa como el RGPD; la verificacion de locutor a partir de audio es un dato personal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_tiny_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Perfil de GitHub del autor (Quan Wang): https://github.com/wq2012
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642v3
- Personal VAD 2.0 (modelo relacionado del mismo autor): https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Personal VAD 2.0, variante standard VAD: https://huggingface.co/wq2012/personal-vad-v2-conformer-std-vad
- Guia de arquitectura Conformer: https://aiunderstanding.org/learn/conformer-architecture
