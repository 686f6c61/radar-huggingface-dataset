# wq2012/ls_lstm_small_ge2e

## Resumen

FlaxSpeaker `ls_lstm_small_ge2e` es un modelo de verificación e identificación de hablante (speaker verification/recognition) que genera embeddings de voz de 192 dimensiones. Lo desarrolla el autor independiente `wq2012` como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de hablante (GE2E, Dr-Vectors, ATP y PFAS). No es un producto oficial de Google, aunque se basa exclusivamente en artículos académicos públicos.

El modelo resuelve el problema de extraer una representación vectorial compacta de la identidad vocal de un hablante, que luego se compara mediante similitud coseno para tareas de verificación (¿son la misma persona?) e identificación (¿quién habla?). Su relevancia radica en ser un checkpoint pequeño (1,7 M de parámetros) y ligero, entrenado en CPU, útil como referencia reproducible dentro de un benchmark controlado de código abierto.

Arquitectura LSTM con pooling atencional (`asp`), objetivo de entrenamiento GE2E softmax y salida de 192 dimensiones. El entrenamiento se limita a LibriSpeech (232 hablantes, 5.788 enunciados) y 2.400 pasos, por lo que es un checkpoint de benchmark de corpus pequeño, no un modelo de estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (`small`) con pooling temporal atencional (`asp`) |
| Parametros totales | 1.710.914 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio; ventana fija de 180 frames = 1,8 s en export TFLite) |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones `model_fp32.tflite` / `model_int8.tflite`, solo encoder) |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax msgpack, TFLite (FP32/INT8) |
| Dimension de embedding | 192 |
| Objetivo de entrenamiento | GE2E softmax (centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dims @ 16 kHz + VAD por energia + CMVN (`flaxspeaker.AudioFrontend`) |
| Datos de entrenamiento | LibriSpeech (232 hablantes, 5.788 enunciados) |
| Pasos / batch | 2.400 pasos x 32 enunciados (8 hablantes x 4), ~13,27 epocas, semilla 42 |

## Arquitectura y entrenamiento

El modelo usa un backbone LSTM de tamano `small` con pooling temporal atencional (`asp`, repurposed del paper ATP de identificación de idioma). La cabeza de entrenamiento es GE2E softmax con centroides leave-one-out exactos, y la verificación en inferencia se realiza por similitud coseno sobre embeddings de 192 dimensiones. El frontend convierte audio a Mel log-natural de 80 dimensiones a 16 kHz, con detección de actividad vocal por energía y normalización CMVN.

El entrenamiento se realizó desde cero en JAX/Flax, en una estación de trabajo CPU con semilla 42, durante 2.400 pasos de gradiente (warmup de 240 pasos) con mini-batches de 32 enunciados (8 hablantes x 4 enunciados), lo que supone ~13,27 épocas sobre el pool de entrenamiento de LibriSpeech (232 hablantes, 5.788 enunciados). Se usaron recortes de longitud variable `U(90, 180)` frames con máscara de validez exacta. No se reporta RLHF ni DPO. El autor indica que es un checkpoint convergido de benchmark de corpus pequeño, no una reproducción a gran escala de los resultados de los papers.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones (`feature-extraction`).
- Verificación de hablante (1:1) mediante similitud coseno.
- Identificación de hablante (1:N) comparando embeddings contra una galería.
- Scoring multi-utterance (se reportan métricas 1-utt y 3-utt).
- Exportación a TFLite FP32 e INT8 para despliegue ligero (solo encoder, ventana fija de 180 frames).
- No soporta tool calling, agentes, visión ni audio generativo; es un modelo discriminativo de representación.
- Capacidades multilingües: no disponibles; entrenado solo con inglés (LibriSpeech).

## Casos de uso

- Verificación biométrica de voz en aplicaciones de autenticación: extraer el embedding de una muestra y compararlo por coseno contra la plantilla del usuario, con umbral calibrado sobre EER.
- Identificación de hablante en grabaciones cortas: segmentar audio, generar embeddings por segmento y asignar hablante por vecino más cercano en una galería de referencia.
- Diarización ligera de reuniones: agrupar segmentos de audio por similitud de embeddings para separar interlocutores en entornos controlados.
- Prototipado e investigación reproducible: servir como referencia de bajo coste dentro del benchmark FlaxSpeaker para comparar arquitecturas y objetivos de pérdida.
- Despliegue en dispositivos embebidos o móviles: las exportaciones TFLite INT8 permiten inferencia del encoder con ventanas fijas de 1,8 s en hardware limitado.
- Filtrado y control de calidad de datasets de voz: detectar inconsistencias de hablante en corpus de audio mediante comparación de embeddings.
- Pruebas de regresión en pipelines de audio: validar que cambios en el frontend o en el preprocesado no degradan la separabilidad de hablantes.

## Benchmarks y rendimiento

Resultados reportados por el autor en `eval_results.json` (EER en dominio LibriSpeech):

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER LibriSpeech (paso 400) | 20,00% | 16,40% |
| EER LibriSpeech (paso 2000, knee) | 14,67% | 10,80% |
| EER LibriSpeech (paso 2400, final) | 14,00% | 10,20% |
| EER Universal Pooled (final) | 21,73% | 18,27% |

Otras métricas reportadas: minDCF, ROC-AUC y subconjunto VoxCeleb1-O de 10 hablantes (valores concretos no incluidos en la información disponible). El intervalo de confianza bootstrap al 95% con 8.000 ensayos tiene una semianchura de ~0,8% absoluto; la desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41% absoluto. Como referencia externa, el autor cita ECAPA-TDNN entrenado en VoxCeleb2-dev con ~0,9% EER en VoxCeleb1-O completo y sistemas sub-1M de parámetros con ~2% (EfficientTDNN, 2022); estos no son comparables directamente por la diferencia de corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1,7 M de parámetros y el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: JAX/Flax nativo, TFLite (FP32/INT8) para móvil/embebido, exportación vía `jax2tf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlaxSpeaker `ls_lstm_small_ge2e` | 1,71 M | ventana fija 180 frames (1,8 s) en TFLite | 14,00% (1-utt) / 10,20% (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | no disponible | ~0,9% en VoxCeleb1-O | no disponible | referencia académica |
| EfficientTDNN (Wang et al., 2022) | sub-1M | no disponible | ~2% en VoxCeleb1-O | no disponible | referencia académica |

La comparación directa no es equitativa: los modelos de referencia se entrenan en VoxCeleb2-dev (5.994 hablantes, ~1,1 M enunciados), mientras que este checkpoint usa 232 hablantes y 5.788 enunciados.

## Limitaciones y advertencias

- Entrenado solo con LibriSpeech (232 hablantes, inglés); el EER absoluto está acotado por la diversidad de hablantes y no es comparable a sistemas industriales.
- Es un checkpoint de benchmark de corpus pequeño, no una reproducción a gran escala de los papers citados.
- Riesgo de sesgo por el corpus: acento, género, edad y condiciones de grabación de LibriSpeech condicionan el rendimiento fuera de dominio.
- El EER pooled universal (21,73% 1-utt) indica degradación notable fuera del dominio de entrenamiento.
- El frontend no es un `AutoFeatureExtractor` de Hugging Face; requiere `flaxspeaker.AudioFrontend`, lo que complica la integración con pipelines estándar.
- Las exportaciones TFLite cubren solo el encoder y usan ventana fija sin máscara de 180 frames, por lo que no admiten audio de longitud variable sin recorte.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un producto oficial de Google.
- No hay datos de benchmarks en tareas multilingües ni de robustez ante ruido.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_lstm_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- GE2E: https://arxiv.org/abs/1710.10467
- Dr-Vectors: https://arxiv.org/abs/2104.01989
- ATP: https://arxiv.org/abs/2202.12163
- PFAS: https://arxiv.org/abs/2203.05642
