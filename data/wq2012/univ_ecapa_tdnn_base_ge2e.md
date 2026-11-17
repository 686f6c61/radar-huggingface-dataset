# wq2012/univ_ecapa_tdnn_base_ge2e

## Resumen

`univ_ecapa_tdnn_base_ge2e` es un extractor de embeddings de locutor (speaker embeddings) implementado en JAX/Flax por el autor `wq2012` como parte de la biblioteca FlaxSpeaker. El modelo reimplementa desde cero, usando solo las publicaciones cientificas, los algoritmos de reconocimiento de locutor GE2E, Dr-Vectors, ATP y PFAS, y se distribuye con licencia Apache 2.0. Su funcion es convertir fragmentos de audio de voz en vectores de 256 dimensiones que permiten verificar si dos grabaciones pertenecen al mismo hablante mediante similitud coseno.

Arquitectura ECAPA-TDNN en configuracion `base` con pooling temporal atencional (`asp`) y objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. El modelo tiene 3.199.264 parametros totales (encoder mas cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y un frontend de audio de 80 dimensiones Mel log-natural a 16 kHz con VAD por energia y CMVN.

Es relevante como referencia reproducible y ligera para tareas de verificacion de locutor en entornos controlados: se ha entrenado hasta convergencia sobre un corpus pequeno de 381 hablantes y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), con 4.600 pasos de gradiente. No pretende ser un modelo estado del arte, sino un punto de comparacion reproducible dentro del benchmark de FlaxSpeaker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`base`) con pooling temporal atencional (`asp`) |
| Parametros totales | 3.199.264 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90-180 frames durante entrenamiento; ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (el modelo opera sobre acustica de voz, no sobre texto; entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding | 256 |
| Frontend de audio | 80-dim Mel log-natural a 16 kHz + VAD por energia + CMVN |
| Funcion de perdida | GE2E softmax con centroides leave-one-out exactos |
| Scorer de verificacion | Similitud coseno |
| Pasos de entrenamiento | 4.600 pasos, batch de 32 utterances (8 hablantes x 4), ~15.58 epocas, semilla 42 |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 hablantes, 9.447 utterances) |
| Libreria | `flaxspeaker >= 0.5.0` |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en tamano `base` que combina bloques convolucionales con agregacion temporal atencional (`asp`) para producir un embedding de 256 dimensiones por utterance. Sobre ese embedding se aplica una cabeza GE2E softmax que emplea centroides leave-one-out exactos durante el entrenamiento, siguiendo la formulacion de Wan et al. (2018). La verificacion en inferencia se realiza por similitud coseno entre embeddings.

El entrenamiento se ejecuto en una estacion de trabajo CPU con semilla 42 durante 4.600 pasos de gradiente con mini-batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a aproximadamente 15,58 epocas sobre las 9.447 utterances del pool de 381 hablantes. Se usaron crops de longitud variable `U(90, 180)` frames con mascara de validez exacta. El autor documenta que se trata de un checkpoint de convergencia sobre corpus pequeno (con margen de seguridad de +2 epocas y warmup de 460 pasos), no de una reproduccion a gran escala de los papers originales, cuyos experimentos se ejecutaron sobre infraestructura y datos internos de Google. La desviacion estandar entre semillas 0-2 del EER pooled a 1 utterance es de 0,08-0,41 puntos absolutos, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semi-amplitud de ~0,8 puntos.

## Capacidades

- Extraccion de embeddings de locutor de 256 dimensiones a partir de audio de voz.
- Verificacion de locutor (mismo hablante / distinto hablante) mediante similitud coseno.
- Reconocimiento de locutor en modalidad multi-dominio (entrenado sobre LibriSpeech, CN-Celeb2 y VoxCeleb1).
- Scoring universal con 1 utterance y con 3 utterances (pooling de evidencias).
- Soporte de scoring PFAS (Parameter-Free Attentive Scoring) y Dr-Vectors segun la arquitectura descrita.
- Frontend de audio integrado con VAD por energia y CMVN, implementado en `flaxspeaker.AudioFrontend` (no es un `AutoFeatureExtractor` de Hugging Face).
- No soporta generacion de texto, codigo, vision, tool calling ni razonamiento multi-paso: es un modelo de extraccion de caracteristicas de audio.

## Casos de uso

- Verificacion biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 256 dimensiones y permite comparar una muestra de voz con un perfil registrado mediante similitud coseno, con un coste computacional muy bajo (3,2 M de parametros).
- Autenticacion por voz en call centers: integrado en un pipeline que extrae el embedding de la llamada entrante y lo compara contra el perfil del cliente, usando el scoring de 3 utterances para reducir falsos rechazos.
- Diarizacion de reuniones y transcripciones: agrupar segmentos de audio por hablante calculando embeddings por segmento y aplicando clustering sobre la similitud coseno.
- Benchmarking reproducible de arquitecturas de reconocimiento de locutor: al ser un checkpoint de convergencia sobre un corpus controlado de 381 hablantes, sirve como referencia relativa para comparar variantes (ECAPA-TDNN frente a otros backbones) dentro de FlaxSpeaker.
- Filtrado y limpieza de datasets de audio: detectar utterances que no corresponden al hablante declarado comparando el embedding contra el centroide del hablante en el corpus.
- Prototipado de sistemas de speaker recognition en JAX/Flax: el modelo se carga con `flaxspeaker` y permite experimentar con el frontend de audio, el pooling atencional y las funciones de perdida sin depender de frameworks propietarios.
- Investigacion sobre perdidas metricas: al implementar GE2E softmax con centroides leave-one-out exactos, es util para estudiar el efecto de la perdida en corpus pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus de evaluacion multi-dominio (381 hablantes, split abierto con <= 25 utterances por hablante). No se han publicado resultados de MMLU, HumanEval o GSM8K porque el modelo no realiza tareas de texto.

| Metrica | 1 utterance | 3 utterances |
|---|---|---|
| EER pooled (paso 400) | 27,94 % | 24,50 % |
| EER pooled (paso 4000, knee) | 17,57 % | 14,50 % |
| EER pooled (paso 4600, final) | 17,25 % | 14,00 % |

El autor reporta tambien minDCF y ROC-AUC en `eval_results.json`, ademas de un subconjunto de 10 hablantes de VoxCeleb1-O. Como referencia externa (no comparable directamente por diferencia de corpus), el autor cita ~0,9 % EER en VoxCeleb1-O completo para ECAPA-TDNN entrenado sobre VoxCeleb2-dev (Desplanques et al., 2020) y ~2 % para sistemas de menos de 1 M de parametros (Wang et al., EfficientTDNN, 2022).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamano del modelo (3,2 M de parametros, ~12,8 MB en fp32); el repo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo se entreno en CPU, por lo que la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU de portatil.
- Opciones de despliegue: `flaxspeaker >= 0.5.0` (API Python nativa en JAX/Flax). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_ecapa_tdnn_base_ge2e` | 3,2 M | Audio 16 kHz, crops 90-180 frames | 17,25 % (1-utt) / 14,00 % (3-utt) en corpus propio de 381 hablantes | Apache 2.0 | Hugging Face + PyPI (`flaxspeaker`) |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia tipica) | Audio 16 kHz | ~0,9 % en VoxCeleb1-O completo | Codigo de referencia publicado | Implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | < 1 M | Audio 16 kHz | ~2 % en VoxCeleb1-O | No disponible | No disponible |

La comparacion directa no es valida: los EER del checkpoint de FlaxSpeaker se miden sobre un corpus de 381 hablantes, mientras que las cifras de referencia corresponden a VoxCeleb1-O con miles de hablantes. El autor indica explicitamente que el modelo esta pensado para comparaciones relativas dentro del benchmark de FlaxSpeaker.

## Limitaciones y advertencias

- EER absolutos altos (17,25 % a 1 utterance) limitados por la diversidad de hablantes del corpus de entrenamiento (381 hablantes), muy inferior a los miles de hablantes de benchmarks industriales.
- No es una reproduccion a gran escala de los papers originales: se entreno sobre un corpus pequeno y controlado, no sobre VoxCeleb2-dev.
- Riesgo de sesgo por composicion del corpus: LibriSpeech (ingles), CN-Celeb2 (chino) y VoxCeleb1 (multilingue) no representan de forma equilibrada la diversidad acustica global; el rendimiento puede degradarse en hablantes fuera de esa distribucion.
- No es un producto oficialmente soportado por Google; el autor lo declara explicitamente.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere usar `flaxspeaker.AudioFrontend`, lo que complica la integracion con pipelines estandar.
- La ventana de inferencia y el comportamiento con audios muy largos no estan documentados; el entrenamiento uso crops de 90-180 frames.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias de precision para produccion en escenarios de autenticacion critica.
- No apto para tareas de texto, codigo, vision ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_ecapa_tdnn_base_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
