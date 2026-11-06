# wq2012/univ_full_conformer_large_pfas

## Resumen

`univ_full_conformer_large_pfas` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje generativo: es un sistema de verificación e identificación de hablante que transforma una señal de audio en un vector de 1536 dimensiones que representa la identidad vocal del locutor. Su propósito es alimentar tareas de speaker verification (¿son la misma persona estas dos grabaciones?) y speaker recognition (¿quién habla en este audio?).

El modelo combina un backbone Conformer de tamaño "large" con una cabeza de pooling atencional sin parámetros (PFAS, Parameter-Free Attentive Scoring) y un objetivo de entrenamiento de Extended-Set Softmax mezclado. Está implementado desde cero en JAX/Flax, con pesos distribuidos en safetensors y msgpack, y se carga mediante la librería `flaxspeaker`. El checkpoint es un "flagship universal" entrenado sobre un pool multi-corpus de 12.193 locutores y 464.557 utterances limpias procedentes de VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h.

Con 7.312.327 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y un tamaño de repositorio de 0,4 GB, es un modelo ligero orientado a producción. Su relevancia actual reside en que ofrece una implementación abierta y reproducible en JAX de algoritmos de speaker recognition previamente descritos solo en papers, con evaluación multi-dominio publicada y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (variante `large`) con pooling temporal PFAS |
| Parámetros totales | 7.312.327 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances con crops de 90 a 180 frames en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible explícitamente; entrenado con corpus en inglés (VoxCeleb, LibriSpeech) y chino (CN-Celeb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimensión del embedding de salida | 1536 |
| Objetivo de entrenamiento | Blended Extended-Set Softmax (0.50 row-softmax + 0.50 extended-set con desplazamiento de logit -log N) |
| Scorer de verificación | PFAS (16 claves x (32 + 64)) |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16.000 Hz + VAD por energía a nivel de frame + CMVN |
| Librería | `flaxspeaker >= 0.5.0` |
| Pipeline HF | feature-extraction |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que intercala bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la secuencia de features acústicas. Sobre la salida del encoder se aplica un pooling temporal atencional PFAS (Parameter-Free Attentive Scoring), que agrega la secuencia en un único vector de 1536 dimensiones sin parámetros adicionales de scoring. La función de pérdida es una variante propia de FlaxSpeaker del Extended-Set Softmax: una mezcla al 50 % de row-softmax y extended-set con un desplazamiento de logit de -log N, distinta de la Ecuación 2 del paper original. El frontend convierte el audio a Mel logarítmico natural de 80 dimensiones a 16 kHz, aplica detección de actividad de voz por energía a nivel de frame y normalización CMVN.

El entrenamiento se realizó sobre un pool universal multi-corpus: VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con 12.193 locutores base y 464.557 utterances limpias, expandidas mediante perturbación de velocidad en tres vías y aumentación con MUSAN y RIR. Se garantiza cero solapamiento de locutores con los conjuntos de evaluación oficiales. El presupuesto fue de 2.400 pasos de gradiente con warmup de 150 pasos, batch de 64 utterances y semilla 42, lo que equivale a aproximadamente 0,33 épocas. Los crops de entrenamiento fueron de longitud variable U(90, 180) frames con máscara de validez exacta. La desviación estándar entre semillas del EER pooled de 1 utterance es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 1536 dimensiones a partir de audio.
- Verificación de locutor uno a uno (comparación de dos utterances y score de similitud).
- Identificación de locutor uno a muchos mediante comparación de embeddings contra una galería.
- Puntuación PFAS para verificación, con soporte de normalización de scores AS-Norm y QMF.
- Procesamiento multi-corpus y multi-dominio: inglés y chino, distintos canales y condiciones acústicas.
- Detección de actividad de voz integrada en el frontend de audio.
- API Python (`load_pretrained`, `extract_embedding`, `verify`) y CLI (`scripts/inference.py`).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modos de razonamiento; es exclusivamente un extractor de features de audio.

## Casos de uso

- Verificación biométrica de locutor en autenticación por voz: el modelo compara el embedding de una utterance de enrollment con el de una utterance de test y devuelve un score; es adecuado por su licencia Apache 2.0 y su tamaño reducido para despliegue en servidor.
- Identificación de hablantes en grabaciones largas: segmentando el audio y extrayendo embeddings por segmento, se puede construir una galería y asignar cada segmento al locutor más probable, gracias al frontend con VAD que descarta silencios.
- Diarización de reuniones y transcripciones: los embeddings de 1536 dimensiones sirven como features para clustering de turnos de habla en pipelines de diarización.
- Control de acceso y antifraude en call centers: verificación de que el cliente que llama es quien dice ser, con normalización AS-Norm para estabilizar scores entre condiciones de canal.
- Indexación y búsqueda de archivos de audio por locutor: extracción offline de embeddings para construir un índice vectorial y recuperar grabaciones de una persona concreta.
- Investigación en biometría de voz: reproducción de experimentos de speaker verification en JAX/Flax sobre VoxCeleb1-O y CN-Celeb-E con métricas publicadas y CIs bootstrap.
- Preprocesado para modelos downstream: generación de embeddings de locutor como features de entrada para modelos de reconocimiento de habla o de análisis conversacional.

## Benchmarks y rendimiento

Resultados de verificación de locutor zero-shot publicados en la model card:

| Benchmark | Trials | EER bruto (%) | EER con AS-Norm (%) | EER con AS-Norm + QMF (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|---|
| VoxCeleb1-O (`veri_test2.txt`, 40 locutores) | 37.611 | 14,23 | 13,80 | 13,61 | 0,8901 | 0,9417 |
| CN-Celeb-E (`eval/lists/trials.lst`, 200 locutores) | 3.484.292 | 19,88 | 19,36 | 18,98 | 0,9227 | 0,8960 |
| CN-Celeb-E multi-enroll (`enroll.map`) | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en formato de tabla comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,31 M de parámetros, los pesos en fp32 ocupan aproximadamente 29 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo es viable en CPU para volúmenes moderados. No se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) mediante `load_pretrained` o el script `scripts/inference.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_conformer_large_pfas` (este) | 7,31 M (inferencia) | no disponible | 1536 | Apache 2.0 | Hugging Face + PyPI |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de modelos comparables de speaker verification con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El EER en VoxCeleb1-O es del 14,23 % bruto (13,61 % con AS-Norm + QMF), un valor alto para verificación de locutor en producción; conviene evaluar el modelo en el dominio concreto antes de desplegarlo.
- En CN-Celeb-E el EER alcanza el 19,88 % bruto, lo que indica degradación en dominio chino y condiciones de canal distintas a las del entrenamiento.
- El entrenamiento equivale solo a unas 0,33 épocas sobre el pool universal; el modelo puede no estar completamente convergido pese a las métricas publicadas.
- Riesgo de sesgo por composición del corpus: predominio de audio de habla espontánea de VoxCeleb y LibriSpeech, con posible menor robustez ante acentos, idiomas, ruido o canales no representados.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es un `AutoFeatureExtractor` de Hugging Face; integrarlo en pipelines estándar requiere usar la librería `flaxspeaker >= 0.5.0`.
- No es un producto oficialmente soportado por Google; es una reimplementación desde cero basada en papers publicados.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías de exactitud ni de robustez biométrica.
- No se documentan tipos de cuantización ni optimizaciones de latencia para producción de alto throughput.
- El uso en verificación biométrica está sujeto a normativa de protección de datos y consentimiento; los embeddings de voz son datos personales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_conformer_large_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
