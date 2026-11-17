# wq2012/univ_conformer_small_sphereface

## Resumen

`univ_conformer_small_sphereface` es un extractor de embeddings de hablante (speaker embeddings) de 2.029.892 parámetros desarrollado por el usuario wq2012 como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de hablante basada únicamente en artículos publicados. El modelo combina un backbone Conformer de tamaño "small" con pooling temporal ATP (Attentive Temporal Pooling) y un objetivo de entrenamiento SphereFace, produciendo representaciones de 192 dimensiones que se comparan mediante similitud coseno para tareas de verificación e identificación de hablante.

El checkpoint es un benchmark de corpus pequeño entrenado hasta convergencia (4.600 pasos, ~31,16 épocas) sobre 9.447 enunciados de 381 hablantes procedentes de LibriSpeech, CN-Celeb2 y VoxCeleb1. No pretende ser un modelo de estado del arte: el propio autor lo posiciona como una referencia controlada para comparaciones relativas dentro del ecosistema FlaxSpeaker, con EER de verificación en torno al 14,20 % (1 enunciado) y 11,07 % (3 enunciados) en el pool universal de evaluación.

Su relevancia radica en ser un ejemplo reproducible y ligero (repo de 0,0 GB, pesos en safetensors y msgpack) de un pipeline completo de speaker verification en JAX, con frontend de audio propio (Mel de 80 dimensiones a 16 kHz con VAD y CMVN) y licencia Apache 2.0, lo que facilita su uso en investigación y en prototipos educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal ATP |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por recortes de audio de 90 a 180 frames en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre acústica, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack |
| Dimension de embedding | 192 |
| Objetivo de entrenamiento | SphereFace |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dims a 16.000 Hz + VAD por energia + CMVN |
| Libreria | flaxspeaker >= 0.5.0 |
| Pipeline HF | feature-extraction |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer, una arquitectura que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en secuencias de audio. Sobre la salida del encoder se aplica ATP (Attentive Temporal Pooling), una cabeza de pooling tomada de un artículo de identificación de idioma que agrega la secuencia temporal en un único vector de 192 dimensiones. La función de pérdida es SphereFace, una variante de margen angular sobre softmax que busca mejorar la separabilidad entre hablantes en el espacio de embeddings.

El entrenamiento se realizó con 4.600 pasos de gradiente (warmup de 460 pasos) y mini-batches de 64 enunciados (8 hablantes x 4 enunciados), lo que equivale a ~31,16 épocas sobre 9.447 enunciados de 381 hablantes, con semilla 42 y recortes de longitud variable U(90, 180) frames más máscara de validez exacta. Los datos provienen de LibriSpeech, CN-Celeb2 y VoxCeleb1 en un esquema multi-dominio controlado. El autor documenta la progresión del EER universal: 26,93 % (1 utt) en el paso 400, 14,59 % en el paso 4000 y 14,20 % en el paso 4600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos es de ~0,8 %. El modelo se entrenó en una estación de trabajo con CPU.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) por comparación contra un conjunto de referencia.
- Scoring con PFAS (Parameter-Free Attentive Scoring) y cabezas GE2E/Dr-Vector incluidas en los pesos.
- Procesamiento multi-dominio: entrenado sobre datos en inglés (LibriSpeech), chino (CN-Celeb2) y multilingüe (VoxCeleb1).
- Frontend de audio integrado con VAD por energía y normalización CMVN.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un extractor de características, no un modelo generativo.
- No dispone de capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera un embedding de 192 dims por utterance y se compara por coseno contra la plantilla del usuario registrado, con la ventaja de un footprint de 2M parámetros que cabe en cualquier dispositivo.
- Identificación de hablante en reuniones y transcripciones: segmentar un audio largo con VAD y extraer embeddings por segmento para agrupar intervenciones por locutor (diarización simple).
- Investigación comparativa en JAX/Flax: servir como baseline reproducible para medir el efecto de cambios en pooling, pérdida o backbone dentro del benchmark FlaxSpeaker.
- Prototipos educativos de speaker recognition: el modelo y la librería permiten estudiar el pipeline completo (frontend, encoder, pooling, scoring) con licencia Apache 2.0 y pesos ligeros.
- Detección de locutor en datasets multilingües: al haberse entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1, puede emplearse para explorar el comportamiento entre dominios lingüísticos distintos.
- Filtrado y limpieza de corpus de audio: identificar y separar voces no deseadas o verificar la consistencia de locutor en grabaciones antes de usarlas en entrenamiento de otros modelos.
- Integración en pipelines de evaluación de biometría de voz: calcular EER y minDCF sobre subconjuntos controlados para validar cambios de infraestructura.

## Benchmarks y rendimiento

Resultados reportados por el autor en `eval_results.json` y en la model card (pool universal multi-dominio):

| Metrica | 1 utterance | 3 utterances |
|---|---|---|
| EER universal (paso 400) | 26,93 % | 24,17 % |
| EER universal (paso 4000, knee) | 14,59 % | 10,90 % |
| EER universal (paso 4600, final) | 14,20 % | 11,07 % |

| Referencia externa (contexto, no comparable directamente) | EER VoxCeleb1-O |
|---|---|
| ECAPA-TDNN (Desplanques et al., 2020) | ~0,9 % |
| EfficientTDNN sub-1M parámetros (Wang et al., 2022) | ~2 % |

El autor advierte que estas cifras externas corresponden a sistemas entrenados sobre VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances), por lo que no son directamente comparables con este checkpoint de 381 hablantes. Se reportan también minDCF, ROC-AUC e intervalos bootstrap al 95 % en `eval_results.json`, pero sus valores concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,03M parámetros en fp32 los pesos ocupan ~8 MB, y el grueso del consumo proviene de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en CPU, por lo que la inferencia en CPU es viable.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en dispositivos embebidos.
- Opciones de despliegue: la librería `flaxspeaker >= 0.5.0` sobre JAX/Flax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un extractor de embeddings de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_sphereface` | 2,03M | recortes de 90-180 frames | 14,20 % (1 utt) / 11,07 % (3 utt) en pool universal de 381 hablantes | Apache 2.0 | Hugging Face, JAX/Flax |
| ECAPA-TDNN | no disponible | no disponible | ~0,9 % en VoxCeleb1-O | no disponible | referencia bibliográfica |
| EfficientTDNN (<1M parámetros) | <1M | no disponible | ~2 % en VoxCeleb1-O | no disponible | referencia bibliográfica |

La comparación directa no es posible porque los sistemas de referencia se entrenaron sobre VoxCeleb2-dev con miles de hablantes, mientras que este checkpoint usa 381 hablantes. No se dispone de otros modelos comparables dentro del ecosistema FlaxSpeaker en la información proporcionada.

## Limitaciones y advertencias

- EER absoluto elevado (14,20 % a 1 utterance) debido a la baja diversidad de hablantes del corpus de entrenamiento (381 hablantes, <=25 utterances por hablante).
- No es un modelo de estado del arte ni una reproducción a gran escala de los artículos originales; está pensado para comparaciones relativas controladas.
- Riesgo de degradación en dominios acústicos no representados (canales, idiomas, ruido) distintos de LibriSpeech, CN-Celeb2 y VoxCeleb1.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face; requiere usar `flaxspeaker.AudioFrontend` explícitamente, lo que complica la integración con pipelines estándar.
- No se documentan sesgos demográficos específicos; al entrenarse con VoxCeleb y LibriSpeech, puede heredar desequilibrios de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google.
- No apto para aplicaciones biométricas de producción sin validación adicional y consideraciones legales sobre datos biométricos.
- No disponible información sobre cuantización ni sobre latencia en producción.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_sphereface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
