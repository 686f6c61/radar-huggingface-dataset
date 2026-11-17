# wq2012/univ_conformer_small_ext_softmax

## Resumen

`univ_conformer_small_ext_softmax` es un modelo de extracción de embeddings de hablante (speaker verification/recognition) desarrollado por el usuario wq2012 como parte del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un encoder acústico que convierte fragmentos de audio en vectores de 192 dimensiones que representan la identidad vocal del hablante, permitiendo tareas de verificación (¿son la misma persona?) y reconocimiento (¿quién habla?). Emplea una arquitectura Conformer de tamaño "small" con pooling temporal atento (ATP) y un objetivo de entrenamiento de softmax extendido por conjuntos (extended-set softmax), todo implementado desde cero en JAX/Flax.

El modelo es relevante por su carácter de referencia reproducible: reimplementa desde cero, usando solo los papers publicados (GE2E, Dr-Vectors, ATP, PFAS), algoritmos clásicos de reconocimiento de hablante, sin código ni datos propietarios. Su tamaño es minúsculo (2.029.894 parámetros en inferencia), lo que lo hace apto para experimentación en CPU y para comparaciones controladas dentro del benchmark FlaxSpeaker.

Es importante contextualizar su alcance: se trata de un checkpoint de convergencia sobre un corpus pequeño (381 hablantes, 9.447 utterances, 4.600 pasos de entrenamiento), no una reproducción a gran escala de los resultados de los papers. Sus cifras de EER (18,61% a 1 utterance, 14,93% a 3 utterances) reflejan la diversidad limitada de hablantes del conjunto de entrenamiento y no deben compararse con sistemas industriales entrenados sobre VoxCeleb2-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal ATP (Attentive Temporal Pooling) |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa crops de audio de longitud variable U(90, 180) frames en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimensión del embedding de salida | 192 |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16.000 Hz + VAD a nivel de frame + CMVN |
| Objetivo de entrenamiento | Extended-set softmax mezclado (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit -log N) |
| Scorer de verificación | Similitud coseno |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 hablantes, 9.447 utterances) |
| Pasos de entrenamiento | 4.600 pasos × 32 utterances (~15,58 épocas), semilla 42 |
| Librería | `flaxspeaker` (JAX/Flax) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuración "small" seguido de una cabeza de pooling temporal atento (ATP), una técnica originalmente propuesta para identificación de idioma en streaming y aquí reutilizada para agregar la secuencia de estados ocultos en un único vector de hablante de 192 dimensiones. La verificación se realiza por similitud coseno entre embeddings. El objetivo de entrenamiento es una variante propia del softmax extendido por conjuntos: una mezcla al 50% de row-softmax y extended-set softmax con un desplazamiento de logit de -log N, que difiere de la formulación original del paper. La implementación completa es una reimplementación desde cero en JAX/Flax, sin código ni datos propietarios, basada únicamente en los papers de GE2E, Dr-Vectors, ATP y PFAS.

El entrenamiento se realizó sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 hablantes y 9.447 utterances, usando crops de longitud variable U(90, 180) frames con máscara de validez exacta, mini-batches de 32 utterances (8 hablantes × 4 utterances), 4.600 pasos de gradiente (~15,58 épocas) y semilla 42, sobre una estación de trabajo CPU. La convergencia se alcanzó con un margen de seguridad de 2 épocas. La desviación estándar entre semillas del EER pooled a 1 utterance es de 0,08-0,41% absoluto, y el intervalo de confianza bootstrap al 95% con 8.000 ensayos tiene una semi-amplitud de ~0,8%.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (speaker verification): determinar si dos fragmentos de audio corresponden al mismo hablante mediante similitud coseno.
- Reconocimiento de hablante (speaker recognition): identificar o clasificar hablantes comparando embeddings contra un conjunto de referencia.
- Evaluación multi-utterance: soporta agregación de 1 y 3 utterances por hablante (el EER mejora con más utterances).
- Funcionamiento multi-dominio: entrenado sobre tres corpus distintos (lectura en inglés, conversacional en chino, YouTube en múltiples idiomas), lo que le da cierta robustez a variaciones de canal y estilo.
- VAD integrado a nivel de frame y normalización CMVN como parte del frontend de audio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente de extracción de características.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de control de acceso: el modelo genera un embedding del audio entrante y lo compara por similitud coseno con el embedding de referencia del usuario registrado, permitiendo autenticación por voz con un umbral calibrado sobre el EER observado.
- Diarización de reuniones y transcripciones: extrayendo embeddings por segmentos de habla y agrupándolos (clustering), se puede atribuir cada intervención a un hablante distinto en grabaciones de múltiples participantes.
- Indexación y búsqueda por hablante en archivos de audio: generar embeddings para cada fragmento de un archivo histórico y almacenarlos en un índice vectorial permite recuperar todas las intervenciones de una persona concreta.
- Prototipado e investigación en reconocimiento de hablante: al ser una reimplementación limpia en JAX/Flax con solo 2 millones de parámetros, sirve como base reproducible para experimentar con funciones de pérdida, pooling y frontends sin depender de código propietario.
- Detección de suplantación o anomalías en centros de llamadas: comparar el embedding de la voz del interlocutor con el del cliente registrado para detectar posibles fraudes o inconsistencias de identidad.
- Evaluación comparativa de sistemas de speaker verification: el checkpoint forma parte del benchmark FlaxSpeaker, por lo que se usa como referencia para comparar variantes de arquitectura, pérdida y pooling bajo condiciones controladas.
- Filtrado y segmentación de datasets de audio: clasificar automáticamente fragmentos por hablante para construir corpus equilibrados o eliminar duplicados de una misma persona.

## Benchmarks y rendimiento

Los datos disponibles en la model card son los siguientes (EER universal pooled sobre el conjunto de evaluación multi-dominio del benchmark FlaxSpeaker):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER 1-utt | 26,10% | 18,84% | 18,61% |
| EER 3-utt | 23,00% | 15,20% | 14,93% |

El archivo `eval_results.json` del repositorio contiene además minDCF, ROC-AUC, intervalos de confianza bootstrap al 95% y resultados sobre el subconjunto de 10 hablantes de VoxCeleb1-O, pero esos valores concretos no se detallan en la información proporcionada. Como referencia externa citada por el autor (no medida con este modelo): los sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan ~0,9% EER en la lista completa VoxCeleb1-O, y los sistemas de menos de 1 millón de parámetros ~2% (EfficientTDNN, 2022). Estas cifras no son comparables directamente con las de este checkpoint, entrenado sobre 381 hablantes en lugar de 5.994.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 2,03 millones de parámetros en precisión completa (float32), los pesos ocupan aproximadamente 8 MB; el consumo dominante es el buffer de audio y los estados intermedios del Conformer, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de gama alta. Una RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de memoria libre (GTX 1650, RTX 3060, RTX 4060, etc.). También funciona en CPU, de hecho el checkpoint fue entrenado en una estación de trabajo CPU.
- Opciones de despliegue: la librería oficial `flaxspeaker` (JAX/Flax), disponible en PyPI. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es un `AutoFeatureExtractor` de Hugging Face.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_ext_softmax` | 2,03 M | Audio 16 kHz, crops 90-180 frames | 18,61% (1-utt) / 14,93% (3-utt) en benchmark propio de 381 hablantes | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (referencia del paper, Desplanques et al. 2020) | ~20 M (típico) | Audio 16 kHz | ~0,9% en VoxCeleb1-O completo (VoxCeleb2-dev) | Varía según implementación | Múltiples implementaciones públicas (SpeechBrain, etc.) |
| EfficientTDNN (Wang et al. 2022) | <1 M | Audio 16 kHz | ~2% en VoxCeleb1-O (VoxCeleb2-dev) | Varía según implementación | Paper; implementaciones no verificadas en la información disponible |

La comparación directa no es válida en términos absolutos: este checkpoint se entrena sobre 381 hablantes y 9.447 utterances, mientras que los sistemas de referencia se entrenan sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances). El propio autor advierte que el modelo está pensado para comparaciones relativas controladas dentro del benchmark FlaxSpeaker, no como estado del arte.

## Limitaciones y advertencias

- EER absoluto elevado (18,61% a 1 utterance) debido al limitado número de hablantes de entrenamiento (381); no apto para producción real sin reentrenamiento sobre un corpus mayor.
- No es una reproducción a gran escala de los papers: el autor lo declara explícitamente como checkpoint de convergencia sobre corpus pequeño.
- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con LibriSpeech, CN-Celeb2 y VoxCeleb1, puede heredar sesgos de dominio, idioma, género y acento de esos corpus.
- Riesgo de degradación fuera de dominio: el rendimiento puede caer con condiciones acústicas, canales o idiomas alejados de los tres corpus de entrenamiento.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es compatible con `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar.
- No es un modelo oficialmente soportado por Google, pese a reimplementar papers de autores de Google.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de rendimiento para producción.
- No se han documentado evaluaciones de robustez ante ataques de suplantación (spoofing) ni ante audio adversario.
- El intervalo de confianza bootstrap al 95% (~0,8% de semi-amplitud) implica que diferencias menores a ese margen entre configuraciones no son significativas.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ext_softmax
- Colección FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (Generalized End-to-End Loss for Speaker Verification): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (Decision Residual Networks and an Improved Loss for Speaker Recognition): https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling for Conformer-based Streaming Language Identification): https://arxiv.org/abs/2202.12163
- Paper PFAS (Parameter-Free Attentive Scoring for Speaker Verification): https://arxiv.org/abs/2203.05642
