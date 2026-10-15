# wq2012/univ_conformer_small_ge2e_contrast

## Resumen

`univ_conformer_small_ge2e_contrast` es un modelo de verificación e identificación de locutor (speaker verification) desarrollado por el usuario `wq2012` (Quan Wang) y publicado bajo la librería `flaxspeaker`. No es un modelo generativo: su única función es convertir una grabación de voz en un embedding de locutor de 192 dimensiones y producir una puntuación de similitud coseno entre dos utterances. El modelo se distribuye con 2.029.894 parámetros en el encoder, lo que lo sitúa en la categoría de modelos extremadamente ligeros, aptos para ejecución en CPU o en cualquier GPU de consumo.

Técnicamente es un Conformer de tamaño «small» con pooling temporal ATP (Attentive Temporal Pooling) y entrenamiento con la pérdida `ge2e_contrast`. La parte frontal de audio es una extracción de log-mel de 80 dimensiones a 16 kHz, acompañada de un VAD de energía y normalización CMVN. El checkpoint forma parte de una reproducción open source, tipo clean-room, en JAX/Flax de los algoritmos publicados en los papers GE2E, Dr-Vectors, Conformer-ATP y PFAS, todos ellos de autores de Google, aunque el modelo no es un producto oficial de Google.

Su relevancia actual es doble. Por un lado, ofrece un baseline reproducible y ligero para investigación en reconocimiento de locutor dentro del ecosistema JAX/Flax, poco poblado en comparación con PyTorch. Por otro lado, publica resultados de evaluación multi-dominio con intervalos de confianza bootstrap sobre LibriSpeech (inglés leído), CN-Celeb2 (chino multigénero) y VoxCeleb1 (inglés en condiciones reales), lo que permite calibrar expectativas en escenarios cross-domain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal ATP (Attentive Temporal Pooling) |
| Parametros totales | 2.029.894 (encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de utterance; no se documenta límite de duración de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible de forma explícita; entrenamiento declarado como dominio `universal` sobre LibriSpeech (inglés), CN-Celeb (chino) y VoxCeleb |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (SafeTensors) y `flax_model.msgpack` (Flax Msgpack nativo) |
| Dimension del embedding de salida | 192 |
| Perdida de entrenamiento | `ge2e_contrast` |
| Scoring de verificacion | similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Pipeline declarado | `audio-classification` |

## Arquitectura y entrenamiento

El encoder es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales sobre la secuencia de características acústicas. La variante empleada es la `small`, con 2.029.894 parámetros. Sobre las representaciones del encoder se aplica ATP (Attentive Temporal Pooling), que agrega la secuencia temporal en un único vector de 192 dimensiones mediante atención, en lugar de un promedio simple. La verificación entre dos utterances se realiza calculando la similitud coseno entre sus embeddings.

El entrenamiento usa la pérdida `ge2e_contrast`, derivada del trabajo GE2E (Generalized End-to-End Loss) con la variante de contraste descrita en Dr-Vectors. Los datos de entrenamiento provienen de los corpus LibriSpeech (inglés leído), CN-Celeb (chino multigénero) y VoxCeleb (inglés en condiciones reales), y el dominio se declara como `universal`, es decir, entrenado de forma conjunta sobre los tres. La información disponible no detalla el número de tokens, horas de audio, composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO, algo que además no aplica habitualmente a modelos discriminativos de locutor. El autor advierte explícitamente que se trata de una reproducción clean-room y que los experimentos de los papers originales se realizaron con infraestructura interna y datasets internos de Google, no con esta librería ni con estos splits públicos.

## Capacidades

- Extracción de embeddings de locutor: genera un vector de 192 dimensiones por utterance mediante `model.extract_embedding()`.
- Verificación de locutor 1-utt: compara dos grabaciones y devuelve una puntuación de similitud coseno mediante `model.verify()`.
- Verificación multi-enrolamiento: los resultados publicados incluyen evaluación con 3 utterances de enrolamiento, con mejoras notables de EER respecto al modo 1-utt.
- Puntuación por similitud coseno, adecuada para umbralización directa y para búsqueda por similitud en índices vectoriales.
- Evaluación multi-dominio declarada: inglés leído (LibriSpeech), chino multigénero (CN-Celeb2) e inglés en condiciones reales (VoxCeleb1).
- Frontend integrado: la configuración incluye extracción log-mel de 80 dimensiones a 16 kHz, VAD de energía y CMVN, compatible con `WhisperFeatureExtractor`.
- Inferencia por línea de comandos mediante `scripts/inference.py`, con argumentos `--enroll_audio` y `--test_audio`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio-a-texto, tool calling, function calling ni flujos de agentes. Es un modelo puramente discriminativo de speaker embeddings.
- No se documenta capacidad de diarización, anti-spoofing (detección de voz sintética) ni detección de voz cantada.

## Casos de uso

- Verificación biométrica de acceso por voz: se enrola al usuario con una o tres grabaciones y se compara cada intento posterior mediante similitud coseno. El modelo es lo bastante pequeño (2 M de parámetros) para ejecutarse en el propio dispositivo.
- Autenticación adicional en atención telefónica: antes de permitir operaciones sensibles, el sistema verifica que la voz del interlocutor coincide con el embedding almacenado del titular, usando el scoring coseno como segunda barrera además de las preguntas de seguridad.
- Etiquetado y agrupación de archivos de audio por locutor: extrayendo embeddings de una colección de grabaciones y agrupándolos por distancia coseno se pueden agrupar llamadas, entrevistas o notas de voz por hablante.
- Búsqueda por similitud de voz en archivos: dado un fragmento de referencia, recuperar del archivo histórico los fragmentos con mayor similitud coseno, útil en investigación periodística o compliance.
- Personalización de asistentes de voz: el embedding de locutor puede usarse como vector de condicionamiento para adaptar respuestas o activar perfiles de usuario, un patrón que el mismo autor emplea en su modelo `personal-vad-v2-conformer-unified`.
- Baseline reproducible para investigación en JAX/Flax: al publicar pesos en SafeTensors y Msgpack junto con `config.json` y `eval_results.json`, sirve como punto de partida para comparar variantes de pooling, pérdidas o estrategias de entrenamiento multi-dominio.
- Evaluación de robustez cross-domain: el conjunto de resultados sobre LibriSpeech, CN-Celeb2 y VoxCeleb1 permite medir la degradación al cambiar de dominio e idioma antes de comprometerse con un modelo mayor.
- Pre-filtrado en pipelines de diarización: usar los embeddings como característica de entrada para un clustering posterior de turnos de habla, reduciendo el coste computacional frente a modelos de mayor tamaño.

## Benchmarks y rendimiento

Verificacion con un unico utterance de prueba (1-utt):

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 20,67 | [19,10; 22,13] | 0,9127 | 0,7753 | 0,8831 |
| CN-Celeb2 (chino multigenero) | 3.000 | 31,77 | [30,07; 33,45] | 0,8940 | 0,8500 | 0,7596 |
| VoxCeleb1 (condiciones reales) | 2.000 | 26,65 | [24,60; 28,40] | 0,9590 | 0,9320 | 0,8139 |
| Universal pooled (3 dominios) | 8.000 | 27,24 | [26,36; 28,22] | 0,9550 | 0,8680 | 0,8035 |
| Universal macro-average | 8.000 | 26,36 | — | 0,9219 | 0,8524 | 0,8189 |

Verificacion con tres utterances de enrolamiento (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,30 | [9,10; 13,51] | 0,7960 | 0,9485 |
| CN-Celeb2 (3-utt) | 1.000 | 25,90 | [23,60; 28,80] | 0,8380 | 0,8214 |
| VoxCeleb1 (3-utt) | 1.000 | 21,50 | [18,50; 23,75] | 0,9200 | 0,8685 |
| Universal pooled (3-utt) | 3.000 | 20,37 | [18,95; 21,80] | 0,8913 | 0,8721 |
| Universal macro-average (3-utt) | 3.000 | 19,57 | — | 0,8513 | 0,8795 |

No se han publicado en la informacion disponible comparaciones directas contra otros modelos concretos (por ejemplo, ECAPA-TDNN o x-vector con sus cifras de EER en los mismos splits).

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de 2.029.894 parametros, no un dato publicado): aproximadamente 8,1 MB en fp32, 4,1 MB en fp16 y 2,0 MB en int8. El consumo real de memoria incluye activaciones, buffers del frontend log-mel y el grafo de JAX, por lo que será superior a estas cifras.
- GPU recomendadas: no aplica ninguna GPU de gama alta. Cualquier GPU con soporte CUDA sirve; el modelo es viable incluso en CPU.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas y en dispositivos móviles o embebidos.
- Ejecucion en CPU: plenamente viable dado el tamano del modelo, aunque la latencia depende del backend XLA/JAX y no hay cifras publicadas.
- Opciones de despliegue documentadas: la libreria `flaxspeaker` (JAX/Flax) con carga desde Hugging Face Hub o directorio local, y el script `scripts/inference.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no encajan con un modelo discriminativo de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye cifras de modelos alternativos en los mismos splits de evaluacion, por lo que los datos cuantitativos se marcan como no disponibles.

| Modelo | Tipo | Parametros | Embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_conformer_small_ge2e_contrast` | Conformer + ATP + GE2E-Contrast | 2.029.894 | 192 | Apache 2.0 | Hugging Face, PyPI, GitHub |
| Modelos de la familia ECAPA-TDNN | TDNN con atencion | no disponible | no disponible | depende del checkpoint | no disponible |
| Modelos de la familia x-vector / GE2E clasicos | TDNN | no disponible | no disponible | depende del checkpoint | no disponible |
| `wq2012/personal-vad-v2-conformer-unified` | Conformer causal unificado (VAD con condicionamiento de locutor) | no disponible | no disponible | Apache 2.0 | Hugging Face |

Comparativa cualitativa: frente a las implementaciones tipicas en PyTorch, la ventaja diferencial de este checkpoint es su integracion nativa en JAX/Flax y su publicacion conjunta de pesos en SafeTensors y Msgpack. Frente a modelos de verificacion de mayor tamano, su limitacion es un EER de dos cifras en todos los dominios evaluados.

## Limitaciones y advertencias

- Rendimiento de verificacion modesto: el EER 1-utt oscila entre el 20,67 % en inglés leído y el 31,77 % en chino multigénero. Para control de acceso en produccion suele exigirse un EER muy inferior, de modo que se recomienda usar multi-enrolamiento (3-utt) y combinarlo con otros factores de autenticacion.
- Fuerte dependencia del dominio: la mejor cifra (11,30 % EER con 3 utterances en LibriSpeech) corresponde a inglés leído, mientras que en CN-Celeb2 sube al 25,90 %. No se debe asumir un rendimiento homogéneo al cambiar de idioma, canal o estilo de habla.
- Sesgos potenciales: al entrenarse sobre LibriSpeech, CN-Celeb y VoxCeleb, la cobertura de acentos, idiomas distintos del inglés y el chino, habla infantil, voz cantada y condiciones de ruido extremo no está documentada y puede degradar el rendimiento.
- El riesgo de alucinación no aplica: el modelo no genera texto ni contenido libre, únicamente embeddings y puntuaciones de similitud.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios.
- No es un producto oficial de Google, pese a que los papers de referencia y los autores originales sean de esa organizacion. La model card lo declara de forma explícita.
- Reproduccion clean-room: los experimentos originales de GE2E, Dr-Vectors, Conformer-ATP y PFAS se hicieron con infraestructura y datasets internos, por lo que los resultados publicados aquí no son directamente comparables con los de los papers.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, y el repositorio ocupa 0.0 GB segun la informacion disponible, lo que sugiere que el modelo no ha pasado por validacion de la comunidad.
- No se documentan tipos de cuantizacion soportados ni limites de duracion de audio por utterance, dos aspectos que habria que validar antes de un despliegue en produccion.
- El campo de idiomas aparece como no disponible en los metadatos, aunque el entrenamiento sea multi-corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ge2e_contrast
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Perfil de GitHub del autor (Quan Wang): https://github.com/wq2012
- Modelo relacionado `personal-vad-v2-conformer-unified`: https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
