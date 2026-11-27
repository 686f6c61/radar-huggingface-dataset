# wq2012/univ_conformer_small_ge2e

## Resumen

`univ_conformer_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` como parte de la biblioteca FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de los algoritmos de reconocimiento de locutor descritos en los papers GE2E, Dr-Vectors, ATP y PFAS, escrita únicamente a partir de las publicaciones científicas, sin código ni datos propietarios. El modelo no es un producto oficialmente soportado por Google.

La arquitectura combina un backbone Conformer de tamaño pequeño con pooling temporal atento (ATP) y una función de pérdida GE2E softmax con centroides leave-one-out exactos. La verificación se realiza mediante similitud coseno sobre embeddings de 192 dimensiones. El checkpoint tiene 2.029.894 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y un tamaño de repositorio de 0,1 GB.

Es relevante porque ofrece un punto de referencia reproducible y ligero para experimentación con verificación de locutor en JAX, con pesos en SafeTensors, Msgpack de Flax y exportaciones TFLite (fp32 e int8) del encoder. No obstante, el propio autor advierte que se trata de un checkpoint de convergencia sobre un corpus pequeño de 381 locutores, no de una reproducción a gran escala de los resultados de los papers, por lo que sus cifras absolutas de EER no son comparables con sistemas industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (tamaño `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como ventana de tokens; entrada de audio de 180 frames (1,8 s) en las exportaciones TFLite; entrenamiento con crops variables U(90, 180) frames |
| Tipos de cuantizacion | Exportacion TFLite int8 (`model_int8.tflite`); pesos originales en fp32 |
| Idiomas soportados | No disponible (modelo de audio, no de texto; entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite fp32 e int8 (solo encoder) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de configuracion `small` para extraer representaciones acusticas, seguidas de un pooling temporal atento (ATP, adaptado de un paper de identificacion de idioma) que agrega la informacion temporal en un embedding de 192 dimensiones. La funcion de perdida es GE2E softmax (Wan et al. 2018, ecuacion 6) con centroides leave-one-out exactos, y la verificacion se realiza por similitud coseno. El frontend de audio es propio de la biblioteca (`flaxspeaker.AudioFrontend`): Mel de 80 dimensiones en escala logaritmica natural a 16 kHz, VAD a nivel de frame basado en energia y CMVN; no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizo sobre un pool multi-dominio de 381 locutores y 9.447 utterances, combinando LibriSpeech, CN-Celeb2 y VoxCeleb1. Se ejecutaron 4.600 pasos de gradiente con mini-batches de 32 utterances (8 locutores x 4 utterances), lo que equivale a aproximadamente 15,58 epocas, con warmup de 460 pasos, semilla 42 y un margen de seguridad de 2 epocas (`S_safe`). El entrenamiento se llevo a cabo en una estacion de trabajo CPU. Los crops de entrenamiento fueron de longitud variable U(90, 180) frames con mascara de validez exacta; el fingerprint de perdida en el paso 0 (2,2212) coincide con el checkpoint liberado. El EER agrupado universal paso de 25,52 % (1 utterance) y 22,37 % (3 utterances) en el paso 400 a 17,54 % y 13,87 % respectivamente en el paso 4.600.

## Capacidades

- Extraccion de embeddings de locutor (speaker embeddings) de 192 dimensiones a partir de audio.
- Verificacion de locutor (speaker verification) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (speaker recognition) en escenarios de comparacion 1:1 y posible extension a 1:N.
- Entrenamiento multi-dominio: el modelo fue entrenado con datos de tres corpus distintos (LibriSpeech en ingles, CN-Celeb2 en chino, VoxCeleb1 en multiples idiomas), lo que le aporta cierta robustez entre dominios.
- Exportacion a TFLite (fp32 e int8) del encoder para despliegue en entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de audio y extraccion de caracteristicas.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Verificacion de identidad por voz en aplicaciones de autenticacion: el modelo genera un embedding de 192 dimensiones por utterance y compara con similitud coseno contra el embedding de referencia del usuario, con umbrales calibrables a partir de las metricas EER y minDCF publicadas.
- Benchmarking reproducible de arquitecturas de reconocimiento de locutor: al ser una implementacion JAX/Flax abierta con pesos y scripts de evaluacion, sirve como linea base controlada para comparar variantes de Conformer, pooling o funciones de perdida dentro del mismo corpus de 381 locutores.
- Investigacion academica en JAX/Flax: permite estudiar el efecto de GE2E softmax, Dr-Vectors y PFAS sobre un modelo pequeno sin depender de infraestructura propietaria, con la ventaja de que los pesos y la configuracion completa estan disponibles.
- Despliegue en dispositivos de borde: las exportaciones TFLite int8 del encoder permiten integrar la extraccion de embeddings en moviles o sistemas embebidos con ventanas fijas de 180 frames (1,8 s), util para aplicaciones de acceso por voz con recursos limitados.
- Segmentacion y agrupacion de hablantes en grabaciones (diarizacion ligera): los embeddings por segmento pueden alimentar un clustering para separar voces en reuniones o transcripciones, aunque la ventana fija de 1,8 s en TFLite limita la granularidad.
- Prototipado rapido de pipelines de speaker verification: la biblioteca `flaxspeaker` en PyPI y los scripts de evaluacion permiten montar un flujo completo (frontend VAD + CMVN, encoder, scoring coseno) en pocas lineas para validar ideas antes de escalar a corpus mayores.
- Educacion y docencia: el modelo y su codigo asociado sirven para explicar de forma practica el pipeline completo de verificacion de locutor, desde el frontend de audio hasta la metrica EER y el intervalo de confianza bootstrap.

## Benchmarks y rendimiento

Los datos de evaluacion proporcionados en la model card son los siguientes (EER agrupado universal sobre el corpus de benchmark de 381 locutores):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER 1-utt | 25,52 % | 17,91 % | 17,54 % |
| EER 3-utt | 22,37 % | 13,90 % | 13,87 % |

Datos adicionales de la model card:
- Desviacion estandar entre semillas 0-2 del EER agrupado 1-utt: 0,08-0,41 % absoluto.
- Semiancho del intervalo de confianza bootstrap al 95 % con 8.000 ensayos: ~0,8 %.
- Se incluye una evaluacion sobre un subconjunto de 10 locutores de VoxCeleb1-O en `eval_results.json`.

Para orientacion, la model card cita que sistemas ECAPA-TDNN publicados entrenados en VoxCeleb2-dev alcanzan ~0,9 % EER en la lista completa VoxCeleb1-O, y sistemas de menos de 1M de parametros ~2 % (EfficientTDNN). El autor advierte explicitamente que estas cifras no son comparables con las del checkpoint liberado, entrenado sobre un corpus mucho menor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamano del modelo (2,03 M de parametros) y el frontend de audio; la exportacion int8 reduce aun mas el requisito.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se entreno en CPU, por lo que la inferencia en CPU es viable. GPU como RTX 3060, RTX 4090, A100 o H100 no son necesarias pero acelerarian el procesamiento por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte para JAX o TFLite, e incluso en CPU.
- Opciones de despliegue: JAX/Flax mediante la biblioteca `flaxspeaker` (PyPI), TFLite runtime para las exportaciones `model_fp32.tflite` y `model_int8.tflite` (solo encoder, ventana fija de 180 frames). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_ge2e` (este) | 2,03 M | crops de 90-180 frames; TFLite fijo a 180 frames | 17,54 % (1-utt) / 13,87 % (3-utt) en corpus de 381 locutores | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | No disponible en la informacion | No disponible | ~0,9 % en VoxCeleb1-O completo | No disponible en la informacion | Referencia bibliografica citada en la model card |
| EfficientTDNN (Wang et al., 2022) | < 1 M | No disponible | ~2 % en VoxCeleb1-O | No disponible en la informacion | Referencia bibliografica citada en la model card |

La comparacion directa no es valida en terminos absolutos: los sistemas ECAPA-TDNN y EfficientTDNN se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances), mientras que este checkpoint se entreno sobre 381 locutores y 9.447 utterances. La model card indica que el modelo esta pensado para comparaciones relativas controladas dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- Corpus de entrenamiento pequeno: 381 locutores y 9.447 utterances, muy por debajo de los corpus industriales; el EER absoluto esta acotado por la diversidad de locutores de entrenamiento.
- No es una reproduccion a gran escala de los papers: el autor lo califica explicitamente como un checkpoint de convergencia sobre un corpus pequeno, no como un modelo state-of-the-art.
- No es un producto oficialmente soportado por Google, aunque reimplemente algoritmos publicados por investigadores de Google.
- Ventana de entrada fija en TFLite: las exportaciones solo aceptan 180 frames (1,8 s) sin mascara, lo que limita utterances mas largas o mas cortas en ese formato.
- Frontend no estandar: usa `flaxspeaker.AudioFrontend` (Mel log natural de 80 dimensiones, VAD por energia, CMVN) en lugar de un `AutoFeatureExtractor` de Hugging Face, lo que complica la integracion con pipelines estandar de `transformers`.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la verificacion, cuantificado por las metricas EER y minDCF publicadas.
- Sesgos: no se documentan analisis de sesgo por genero, edad, acento o idioma; el entrenamiento multi-dominio (LibriSpeech, CN-Celeb2, VoxCeleb1) no garantiza equidad entre grupos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y recomienda no usarlo como sistema de produccion sin validacion propia.
- Caveat de produccion: el intervalo de confianza bootstrap al 95 % (~0,8 %) y la variabilidad entre semillas (0,08-0,41 %) deben tenerse en cuenta al fijar umbrales de decision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ge2e
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
