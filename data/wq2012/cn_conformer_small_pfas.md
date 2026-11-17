# wq2012/cn_conformer_small_pfas

## Resumen

`cn_conformer_small_pfas` es un modelo de extracción de embeddings de hablante (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor. El modelo combina un backbone Conformer de tamaño "small" con pooling temporal PFAS (Parameter-Free Attentive Scoring) y un objetivo de entrenamiento basado en Extended-Set Softmax, y produce representaciones de 640 dimensiones por utterance.

Su relevancia es fundamentalmente metodológica y de referencia: se trata de un checkpoint entrenado hasta convergencia sobre un corpus pequeño y autocontenido (CN-Celeb2, 119 hablantes, 2.909 utterances) con solo 2.162.187 parámetros de inferencia. No pretende competir con sistemas industriales tipo ECAPA-TDNN entrenados sobre VoxCeleb2-dev, sino servir como punto de comparación reproducible dentro del benchmark de FlaxSpeaker, con métricas archivadas y verificables (EER, minDCF, ROC-AUC).

El modelo es útil para desarrolladores e investigadores que quieran estudiar, auditar o reproducir pipelines de speaker verification en JAX/Flax sin depender de código propietario, y para quienes necesiten un baseline ligero y de licencia permisiva sobre el que medir mejoras. Su limitación principal es la diversidad de hablantes del conjunto de entrenamiento, que acota el rendimiento absoluto alcanzable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer "small" (backbone) + pooling temporal PFAS + cabeza de scoring PFAS-SN |
| Parametros totales | 2.162.187 (encoder + cabeza de scoring; excluye pesos de clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances con recortes variables de 90 a 180 frames durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado únicamente con CN-Celeb2, corpus en mandarín) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de configuración "small" para extraer representaciones frame-level del audio, seguidas de un pooling temporal PFAS que agrega la secuencia en un único embedding de 640 dimensiones. La verificación se realiza con un scorer PFAS-SN, una extensión propia de FlaxSpeaker sobre PFAS que combina atención frame-level `shared_nonlinear` con un ancla ATP global, usando 4 claves de 32 + 128 dimensiones y las ecuaciones 5-7 del paper original. La función de pérdida es un Extended-Set Softmax mezclado (variante FlaxSpeaker: 0.50 row-softmax + 0.50 extended-set con un desplazamiento de logit de -log N), que no coincide exactamente con la ecuación 2 del paper.

El frontend de audio es propio de la librería `flaxspeaker.AudioFrontend` y no un `AutoFeatureExtractor` de Hugging Face: calcula Mel de 80 dimensiones en logaritmo natural a 16 kHz, aplica VAD por energía a nivel de frame y CMVN. El entrenamiento se realizó exclusivamente sobre CN-Celeb2 (119 hablantes, 2.909 utterances) durante 1.600 pasos de gradiente con batches de 32 utterances (8 hablantes x 4 utterances), aproximadamente 17,60 épocas, semilla 42, sobre una estación de trabajo CPU, con recortes de longitud variable U(90, 180) frames y máscara de validez exacta. No se menciona RLHF ni DPO; el objetivo es puramente de verificación de locutor.

## Capacidades

- Extracción de embeddings de hablante de 640 dimensiones a partir de audio.
- Speaker verification (comparación 1:1 entre dos utterances) mediante el scorer PFAS-SN.
- Speaker recognition e identificación (comparación 1:N contra una galería de embeddings).
- Evaluación con métricas estándar de la tarea: EER, minDCF y ROC-AUC, tanto en modo 1-utt como 3-utt (promediado de embeddings).
- Procesamiento de audio a 16 kHz con VAD por energía y normalización CMVN integrados en el frontend.
- Compatibilidad con el ecosistema JAX/Flax y serialización en safetensors y Msgpack.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.

## Casos de uso

- Baseline reproducible para investigación en speaker verification: permite comparar variantes de pooling, pérdida o backbone dentro del benchmark FlaxSpeaker con métricas archivadas y verificables, sin depender de infraestructura propietaria.
- Auditoría y reproducción de papers: al ser una reimplementación desde cero en JAX/Flax de GE2E, Dr-Vectors, ATP y PFAS, sirve para validar experimentalmente las afirmaciones de esos trabajos en un entorno controlado.
- Prototipado de verificación de locutor en entornos JAX: equipos que ya trabajan con JAX pueden integrar el modelo sin introducir PyTorch en su stack, usando el frontend y el scorer incluidos.
- Educación y docencia: su tamaño reducido (2,16 M de parámetros, repo de 0,1 GB) y su licencia Apache 2.0 lo hacen adecuado para explicar pipelines completos de speaker verification en cursos y talleres.
- Pruebas de integración de pipelines de audio: sirve como componente de prueba para validar sistemas de ingesta, VAD, normalización y scoring antes de sustituirlo por un modelo de producción de mayor escala.
- Evaluación comparativa de frontends y VAD: al exponer el `AudioFrontend` como parte del modelo, permite medir el impacto de distintas configuraciones de Mel, VAD o CMVN en el EER final.
- Referencia para control de regresiones: las huellas de pérdida en el paso 0 y los resultados de evaluación archivados permiten detectar cambios no intencionados en el código de entrenamiento o inferencia.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del propio proyecto sobre CN-Celeb2, no comparaciones contra benchmarks estándar de la literatura.

| Metrica | Paso 400 | Paso 1400 (knee) | Paso 1600 (final) |
|---|---|---|---|
| EER CN-Celeb2 1-utt | 25,10 % | 23,43 % | 22,20 % |
| EER CN-Celeb2 3-utt | 23,50 % | 22,40 % | 20,70 % |
| EER Universal Pooled 1-utt | no disponible | no disponible | 27,65 % |
| EER Universal Pooled 3-utt | no disponible | no disponible | 25,47 % |

Como referencia contextual citada por el autor: los sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan aproximadamente 0,9 % EER en la lista completa VoxCeleb1-O, y los sistemas de menos de 1 M de parámetros alrededor del 2 %. La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,16 M de parámetros en fp32 los pesos ocupan aproximadamente 8,6 MB, por lo que el cuello de botella es el frontend y el batching, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo fue entrenado en CPU, por lo que la inferencia en CPU es perfectamente viable.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en Apple Silicon y en CPU.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) es la vía natural; los pesos en safetensors y Msgpack permiten cargarlos con Flax/JAX directamente. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor no publica cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / datos | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cn_conformer_small_pfas` | 2,16 M | CN-Celeb2 (119 hablantes) | 22,20 % (1-utt) / 20,70 % (3-utt) en CN-Celeb2 | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances) | ~0,9 % en VoxCeleb1-O | no disponible | Implementaciones de referencia en la literatura y en repositorios de terceros |
| EfficientTDNN (Wang et al., 2022) | < 1 M | VoxCeleb2-dev | ~2 % | no disponible | Literatura |
| PFAS original (paper) | no disponible | datos internos de Google | no disponible | no disponible | Literatura, sin checkpoint público |

La comparación debe interpretarse con cautela: los EER no son directamente comparables porque los conjuntos de evaluación y entrenamiento difieren en escala y dominio. El valor de `cn_conformer_small_pfas` es la reproducibilidad y la trazabilidad, no el rendimiento absoluto.

## Limitaciones y advertencias

- El EER absoluto está acotado por la diversidad de hablantes del entrenamiento (119 hablantes, 2.909 utterances), muy inferior a la de los sistemas industriales entrenados sobre miles de hablantes.
- El modelo fue entrenado únicamente con CN-Celeb2, corpus en mandarín; el rendimiento en otros idiomas o dominios no está caracterizado en la información disponible.
- No es una reproducción a gran escala de los papers de referencia: el propio autor lo describe como un checkpoint de benchmark sobre corpus pequeño (1.600 pasos, ~17,60 épocas).
- Riesgo de degradación fuera de dominio: no se han publicado métricas en VoxCeleb1-O ni en otros conjuntos estándar que permitan estimar la generalización.
- El frontend de audio es propio de `flaxspeaker` y no un `AutoFeatureExtractor` de Hugging Face, lo que impide usar el modelo con pipelines estándar de `transformers` sin adaptación.
- No hay información sobre sesgos demográficos, de género o de acento; al entrenarse sobre un corpus pequeño y de un solo idioma, es probable que presente sesgos no medidos.
- No se han publicado datos de cuantización ni de latencia, por lo que las estimaciones de despliegue en producción son limitadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un producto soportado oficialmente por Google.
- El modelo no es generativo: no debe esperarse generación de texto, razonamiento, código ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/cn_conformer_small_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
