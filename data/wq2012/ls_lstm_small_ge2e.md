# wq2012/ls_lstm_small_ge2e

## Resumen
`ls_lstm_small_ge2e` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por wq2012 como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor. El modelo convierte fragmentos de audio en vectores de 192 dimensiones que representan la identidad vocal, y la verificación se realiza mediante similitud coseno entre embeddings. Es relevante para desarrolladores que necesitan un modelo de speaker verification ligero, con licencia Apache 2.0, exportable a TFLite y ejecutable en CPU, útil como referencia reproducible en entornos con recursos limitados.

La arquitectura es una LSTM pequeña con pooling temporal atentivo (ASP) y objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. Con solo 1.710.914 parámetros de inferencia (encoder más cabeza de scoring), es un modelo deliberadamente compacto. Se entrenó únicamente sobre LibriSpeech (232 locutores, 5.788 enunciados) durante 2.400 pasos (~13,27 épocas), por lo que es un checkpoint de benchmark de corpus pequeño, no una reproducción a gran escala de los resultados de los papers originales.

El modelo se distribuye en safetensors, msgpack de Flax y exportaciones TFLite fp32 e int8 del encoder con ventana fija de 180 frames (1,8 s). Su interés actual reside en ser una pieza de referencia abierta y reproducible para comparaciones relativas dentro del benchmark FlaxSpeaker, no un modelo de estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM pequeña con pooling temporal atentivo (ASP) |
| Parametros totales | 1.710.914 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 180 frames (1,8 s) en las exportaciones TFLite; entrenamiento con recortes variables U(90, 180) frames |
| Tipos de cuantizacion | fp32 e int8 (exportaciones TFLite del encoder) |
| Idiomas soportados | no disponible (modelo acústico independiente del idioma; entrenado solo con LibriSpeech, inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, flax_model.msgpack, model_fp32.tflite, model_int8.tflite |

## Arquitectura y entrenamiento
El backbone es una LSTM de tamaño pequeño seguida de pooling temporal atentivo (ASP, repurposed de un paper de identificación de idioma) que produce un embedding de 192 dimensiones. La función de pérdida es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, y la verificación se puntúa con similitud coseno. El frontend de audio es propio de FlaxSpeaker: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y CMVN; no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó en una estación de trabajo CPU con semilla 42, 2.400 pasos de gradiente (warmup de 240 pasos), mini-batches de 32 enunciados (8 locutores x 4 enunciados), lo que supone ~13,27 épocas sobre 5.788 enunciados de 232 locutores de LibriSpeech. Se usaron recortes de longitud variable U(90, 180) frames con máscara de validez exacta. No se menciona RLHF ni DPO; el objetivo es puramente de verificación de locutor. El autor documenta desviaciones respecto a los papers originales y una huella de pérdida en el paso 0 de 2,1498, que coincide con la de los pesos publicados.

## Capacidades
- Extracción de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificación de locutor (1:1) mediante similitud coseno.
- Identificación de locutor (1:N) por comparación contra un conjunto de embeddings de referencia.
- Reconocimiento de locutor independiente del contenido lingüístico.
- Exportación a TFLite fp32 e int8 del encoder para despliegue en dispositivos.
- Cálculo de métricas de evaluación: EER, minDCF y ROC-AUC.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio generativo ni texto.
- Capacidades multilingües: no disponibles; entrenado solo con LibriSpeech (inglés).

## Casos de uso
- Verificación biométrica de acceso: el modelo genera un embedding del audio entrante y lo compara por similitud coseno con el embedding de referencia del usuario, permitiendo autenticación por voz en aplicaciones con recursos limitados.
- Identificación de hablante en reuniones: procesar segmentos de audio y comparar embeddings contra un registro de participantes para etiquetar quién habla en cada tramo.
- Despliegue en dispositivos embebidos: las exportaciones TFLite int8 del encoder permiten ejecutar la extracción de embeddings en móviles o hardware de bajo consumo con ventanas fijas de 1,8 s.
- Filtrado y diarización básica: usar los embeddings como característica para agrupar segmentos de audio por locutor en pipelines de transcripción.
- Benchmark de referencia para investigación: comparar variantes de arquitectura, pooling o pérdida dentro del benchmark FlaxSpeaker con métricas EER, minDCF y ROC-AUC reproducibles.
- Detección de locutor en grabaciones de call center: extraer embeddings de cada llamada y verificar la identidad del cliente frente a una base de referencia.
- Prototipado educativo: servir como ejemplo completo y ligero de un sistema de speaker verification en JAX/Flax, entrenable en CPU.

## Benchmarks y rendimiento
Resultados de evaluación publicados en la model card (LibriSpeech in-domain, EER):

| Metrica | Paso 400 | Paso 2000 | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 20,00 % | 14,67 % | 14,00 % |
| EER 3-utt | 16,40 % | 10,80 % | 10,20 % |
| EER pooled universal 1-utt | no disponible | no disponible | 21,73 % |
| EER pooled universal 3-utt | no disponible | no disponible | 18,27 % |

La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. El autor cita como orientación sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O y sistemas de menos de 1M de parámetros con ~2 % (EfficientTDNN, Wang et al. 2022), pero advierte que este checkpoint no es comparable directamente por la diferencia de corpus de entrenamiento.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1,7M de parámetros y el repositorio ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; se entrenó y evaluó en CPU. Cualquier GPU consumer (RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer y en CPU; las exportaciones TFLite están pensadas para dispositivos embebidos.
- Opciones de despliegue: JAX/Flax con la biblioteca `flaxspeaker`, TFLite runtime (fp32 o int8) para el encoder, y serialización nativa msgpack de Flax.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ls_lstm_small_ge2e | 1.710.914 | 180 frames (1,8 s) en TFLite; recortes U(90,180) en entrenamiento | 14,00 % (1-utt) / 10,20 % (3-utt) en LibriSpeech | apache-2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al. 2020) | no disponible | no disponible | ~0,9 % en VoxCeleb1-O | no disponible | referencia bibliográfica |
| EfficientTDNN (Wang et al. 2022) | < 1M | no disponible | ~2 % en VoxCeleb1-O | no disponible | referencia bibliográfica |

La comparación directa no es válida por diferencias de corpus de entrenamiento (232 locutores frente a 5.994 de VoxCeleb2-dev); los valores se incluyen solo como orientación.

## Limitaciones y advertencias
- Entrenado solo con 232 locutores de LibriSpeech; la diversidad de locutores limita el EER absoluto frente a sistemas industriales.
- EER in-domain de 14,00 % (1-utt) y 21,73 % en pooled universal, muy lejos de sistemas de estado del arte.
- No es una reproducción a gran escala de los papers originales; es un checkpoint de convergencia sobre corpus pequeño.
- Riesgo de sesgo por el corpus de entrenamiento (LibriSpeech, inglés, dominio de lectura de libros).
- No se documentan evaluaciones fuera de dominio más allá del subconjunto de 10 locutores de VoxCeleb1-O incluido en `eval_results.json`.
- El frontend de audio es propio de FlaxSpeaker y no es compatible con `AutoFeatureExtractor` de Hugging Face; requiere usar la biblioteca del autor.
- Las exportaciones TFLite solo cubren el encoder y usan una ventana fija sin máscara de 180 frames, lo que limita la variabilidad de duración.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google.
- Riesgo de falsos positivos y negativos en verificación biométrica; no debe usarse como único factor de autenticación en producción sin umbrales calibrados y validación propia.

## Enlaces
- Hugging Face: https://huggingface.co/wq2012/ls_lstm_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- GE2E: https://arxiv.org/abs/1710.10467
- Dr-Vectors: https://arxiv.org/abs/2104.01989
- ATP: https://arxiv.org/abs/2202.12163
- PFAS: https://arxiv.org/abs/2203.05642
