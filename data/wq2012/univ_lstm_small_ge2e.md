# wq2012/univ_lstm_small_ge2e

## Resumen

`univ_lstm_small_ge2e` es un modelo de extracción de embeddings de hablante (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de los algoritmos GE2E, Dr-Vectors, ATP y PFAS descritos en la literatura académica, sin uso de código ni datos propietarios. El modelo convierte una señal de audio en un vector de 192 dimensiones que representa la identidad vocal del hablante, pensado para tareas de verificación biométrica por voz.

Arquitectónicamente es un modelo muy compacto: un backbone LSTM de variante `small` con pooling temporal `asp` y una función de pérdida GE2E softmax con centroides leave-one-out. El checkpoint final cuenta con 1.710.914 parámetros de inferencia y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros desplegables incluso en entornos con recursos limitados. La entrada es un frontend de audio propio (80-dim natural-log Mel a 16 kHz con VAD por energía y CMVN), no un `AutoFeatureExtractor` estándar de Hugging Face.

Su relevancia actual es doble: por un lado, ofrece una referencia reproducible y abierta (licencia Apache 2.0) para experimentar con técnicas clásicas de speaker recognition en un stack moderno como JAX; por otro, sirve como baseline controlado dentro del benchmark FlaxSpeaker. Es importante subrayar que se entrenó sobre un corpus pequeño (381 hablantes, 9.447 utterances) y sus EER absolutos no son comparables con sistemas industriales entrenados sobre VoxCeleb2-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (`small`) con pooling temporal `asp` |
| Parametros totales | 1.710.914 (encoder + cabeza de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 180 frames (1,8 s) en export TFLite |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones TFLite del encoder) |
| Idiomas soportados | no disponible (modelo de hablante, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite` / `model_int8.tflite`) |
| Dimension del embedding | 192 |
| Pooling temporal | `asp` (attentive statistical pooling) |
| Funcion de perdida | GE2E softmax con centroides leave-one-out |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | 80-dim natural-log Mel @ 16 kHz + VAD por energia + CMVN |
| Datos de entrenamiento | LibriSpeech + CN-Celeb2 + VoxCeleb1 (381 hablantes, 9.447 utterances) |
| Pasos de entrenamiento | 4.600 pasos x 32 utterances (~15,58 epochs), seed 42 |
| Libreria | `flaxspeaker` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de red recurrente LSTM en su variante `small`, con una cabeza de pooling temporal `asp` que agrega la secuencia de estados ocultos en un vector de 192 dimensiones. Sobre ese embedding se aplica la pérdida GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificación en inferencia se realiza por similitud coseno. La implementación es una reescritura desde cero en JAX/Flax basada únicamente en los papers publicados (GE2E, Dr-Vectors, ATP y PFAS), sin código ni datos propietarios.

El entrenamiento se realizó sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 hablantes y 9.447 utterances, en mini-batches de 32 utterances (8 hablantes x 4 utterances), durante 4.600 pasos de gradiente (~15,58 epochs) con warmup de 460 pasos y semilla 42, sobre una estación de trabajo CPU. Se usaron crops de longitud variable `U(90, 180)` frames con máscara de validez exacta, y el fingerprint de pérdida en el paso 0 (`2.1943`) coincide con el checkpoint liberado. El EER agrupado (pooled) pasó de 26,90 % (1-utt) / 23,77 % (3-utt) en el paso 400 a 19,14 % / 14,87 % en el paso 4.600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos es de ~0,8 %.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio de entrada.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Reconocimiento de hablante (identificación 1:N) usando los embeddings como representación.
- Funciona como extractor de características (`feature-extraction`) en el pipeline de Hugging Face.
- Independiente del idioma en la práctica, al modelar identidad vocal y no contenido lingüístico.
- Exportación a TFLite (FP32 e INT8) para despliegue en entornos móviles o embebidos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica por voz en aplicaciones de autenticación: el modelo genera un embedding de 192 dimensiones por utterance y se compara por similitud coseno contra el embedding de referencia del usuario, con un umbral calibrado sobre el EER del dominio objetivo.
- Identificación de hablante en grabaciones de reuniones o llamadas: se extraen embeddings por segmento y se agrupan por similitud para diarización simple, aprovechando el frontend con VAD que descarta silencios.
- Control de acceso en dispositivos embebidos: la exportación TFLite INT8 del encoder con ventana fija de 180 frames (1,8 s) permite ejecutar la extracción en microcontroladores o móviles sin infraestructura de GPU.
- Detección de suplantación o reutilización de audio en pipelines de moderación: embeddings de referencia frente a embeddings de audio entrante para marcar discrepancias de identidad vocal.
- Investigación y docencia en speaker recognition: baseline reproducible en JAX/Flax con licencia Apache 2.0 y métricas de evaluación publicadas (EER, minDCF, ROC-AUC) para comparar variantes de pooling, pérdida y backbone.
- Preprocesado para sistemas de búsqueda o indexación de archivos de audio por hablante: los embeddings sirven como vectores indexables en bases de datos vectoriales para recuperación por identidad vocal.
- Benchmarking controlado dentro de FlaxSpeaker: sirve como referencia relativa para medir el impacto de cambios arquitectónicos o de datos en un corpus fijo de 381 hablantes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus de evaluación multi-dominio (EER agrupado, 1-utt y 3-utt):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER 1-utt | 26,90 % | 19,34 % | 19,14 % |
| EER 3-utt | 23,77 % | 15,40 % | 14,87 % |

Datos adicionales aportados por el autor:

| Referencia | EER | Notas |
|---|---|---|
| Este checkpoint (381 hablantes, corpus propio) | 19,14 % (1-utt) / 14,87 % (3-utt) | Convergencia en corpus pequeño |
| ECAPA-TDNN (Desplanques et al., 2020) | ~0,9 % en VoxCeleb1-O completo | Entrenado en VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances) |
| EfficientTDNN (Wang et al., 2022) | ~2 % | Sistemas de menos de 1M parámetros en VoxCeleb2-dev |

El autor advierte explícitamente que los EER absolutos de este checkpoint están limitados por la diversidad de hablantes del corpus de entrenamiento y no son comparables con sistemas industriales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (1,71M parámetros más buffers del frontend); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) ejecuta el modelo con holgura. El entrenamiento original se realizó en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en entornos sin GPU.
- Opciones de despliegue: `flaxspeaker` (JAX/Flax), TFLite Runtime para las exportaciones `model_fp32.tflite` / `model_int8.tflite`, y carga directa de SafeTensors o Msgpack en pipelines JAX.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La ventana fija de 180 frames (1,8 s) del export TFLite sugiere un coste de inferencia muy bajo por utterance, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_lstm_small_ge2e` | 1,71M | Ventana fija 180 frames (TFLite) | 19,14 % (1-utt) / 14,87 % (3-utt) en corpus propio de 381 hablantes | Apache 2.0 | Hugging Face, PyPI (`flaxspeaker`), GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | no disponible | ~0,9 % en VoxCeleb1-O completo | no disponible en esta ficha | Referencia académica; implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1M | no disponible | ~2 % en VoxCeleb2-dev | no disponible en esta ficha | Referencia académica |

La comparación directa es engañosa por la diferencia de corpus de entrenamiento: los sistemas ECAPA-TDNN y EfficientTDNN se entrenaron sobre VoxCeleb2-dev con miles de hablantes, mientras que este checkpoint usa 381 hablantes. No se dispone de otros modelos de la familia FlaxSpeaker con datos suficientes en la información proporcionada para una comparativa interna completa.

## Limitaciones y advertencias

- El EER absoluto (19,14 % en 1-utt) es alto en términos industriales y está acotado por la baja diversidad de hablantes del corpus de entrenamiento (381 hablantes, ≤25 utterances por hablante).
- No es una reproducción a gran escala de los resultados de los papers originales; es un checkpoint de benchmark sobre corpus pequeño.
- Riesgo de sesgo por composición de dominio: el entrenamiento mezcla LibriSpeech (inglés), CN-Celeb2 (chino) y VoxCeleb1 (multilingüe), lo que puede producir un rendimiento desigual según el idioma, el canal y las condiciones acústicas del hablante.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no es un `AutoFeatureExtractor` de Hugging Face; integrarlo requiere usar la librería `flaxspeaker` o replicar el pipeline (80-dim natural-log Mel, VAD por energía, CMVN).
- Las exportaciones TFLite cubren solo el encoder y usan una ventana fija sin máscara de 180 frames (1,8 s); audios más largos deben trocearse y agregarse externamente.
- Riesgo de degradación en audio con ruido, reverberación o canales distintos a los de entrenamiento; no se documentan métricas por condición.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google y no ofrece garantías.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; usarlo fuera de tareas de embedding de hablante no tiene sentido.
- No se han documentado sesgos demográficos específicos (género, edad, acento) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_lstm_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
