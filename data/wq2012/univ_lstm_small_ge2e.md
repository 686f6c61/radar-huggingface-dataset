# wq2012/univ_lstm_small_ge2e

## Resumen

`univ_lstm_small_ge2e` es un modelo de extracción de embeddings de hablante (speaker embeddings) desarrollado por el usuario `wq2012` como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de verificación e identificación de hablante publicados en la literatura. El modelo convierte una señal de audio en un vector de 192 dimensiones que representa la identidad vocal del hablante, pensado para tareas de verificación (¿son la misma persona?) e identificación (¿quién habla?) mediante similitud coseno.

Arquitectónicamente es una red LSTM de tamaño "small" (1.710.914 parámetros de inferencia) con pooling temporal atento (`asp`) y entrenada con la función de pérdida GE2E softmax con centroides leave-one-out exactos. Se entrenó sobre un corpus multi-dominio controlado de 381 hablantes y 9.447 enunciados provenientes de LibriSpeech, CN-Celeb2 y VoxCeleb1, durante 4.600 pasos (~15,58 épocas).

Es relevante porque ofrece un checkpoint pequeño, ligero y con licencia Apache 2.0 para experimentación y comparativas controladas en verificación de hablante, exportable a TFLite (fp32 e int8) para despliegue en entornos con recursos limitados. El propio autor advierte que no es una reproducción a gran escala de los papers originales ni un modelo de estado del arte: es un benchmark de convergencia sobre un corpus pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (`small`) con pooling temporal atento (`asp`), implementada en JAX/Flax |
| Parametros totales | 1.710.914 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 180 frames (~1,8 s) en las exportaciones TFLite; entrenamiento con crops variables U(90, 180) frames y máscara de validez exacta |
| Tipos de cuantizacion | fp32 e int8 (exportaciones TFLite del encoder); pesos en safetensors y msgpack sin cuantizar |
| Idiomas soportados | no disponible (el modelo es agnóstico al idioma en la práctica, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack, TFLite (fp32 e int8) |

## Arquitectura y entrenamiento

El backbone es una LSTM de tamaño pequeño que procesa características de audio de 80 dimensiones Mel en escala logarítmica natural a 16 kHz, con detección de actividad de voz (VAD) a nivel de frame y normalización CMVN. Sobre la secuencia de estados ocultos se aplica un pooling temporal atento (`asp`) que produce un vector de embedding de 192 dimensiones. La verificación se realiza por similitud coseno entre embeddings.

El entrenamiento usa la pérdida GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, en mini-batches de 32 enunciados (8 hablantes x 4 enunciados) durante 4.600 pasos (~15,58 épocas) sobre 9.447 enunciados de 381 hablantes (LibriSpeech + CN-Celeb2 + VoxCeleb1), con semilla 42 y warmup de 460 pasos. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. La model card menciona además cabezas Dr-Vector y PFAS en los pesos, y una reimplementación de ATP para el pooling. No se reporta uso de RLHF/DPO (no es un modelo generativo).

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) por comparación contra un conjunto de embeddings de referencia.
- Detección de actividad de voz (VAD) integrada en el frontend de audio.
- Normalización CMVN y frontend Mel de 80 dimensiones incluidos en la configuración.
- Exportación a TFLite fp32 e int8 del encoder con ventana fija de 180 frames.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un extractor de características, no un modelo generativo.
- Capacidades multilingües: no declaradas explícitamente; el entrenamiento combina corpus en inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).

## Casos de uso

- Verificación biométrica de voz en aplicaciones de autenticación: el modelo genera embeddings de 192 dimensiones que se comparan por similitud coseno contra una plantilla de referencia del usuario, con un coste computacional muy bajo (1,7 M de parámetros).
- Identificación de hablante en reuniones o transcripciones: extraer embeddings por segmento de habla y agrupar por similitud para atribuir intervenciones a participantes, apoyándose en el VAD integrado para segmentar.
- Diarización ligera en dispositivos: la exportación TFLite int8 permite ejecutar el encoder en móviles o sistemas embebidos con ventanas de 1,8 s, útil para separar voces en grabaciones locales.
- Filtrado y limpieza de datasets de audio: detectar y eliminar duplicados o grabaciones del mismo hablante comparando embeddings, gracias a la naturaleza multi-dominio del entrenamiento (lectura, conversación, YouTube).
- Benchmarking y experimentación académica: sirve como línea base pequeña y reproducible (semilla 42, presupuesto fijo de pasos) para comparar variantes de backbone, pooling o pérdida dentro de FlaxSpeaker.
- Preprocesado en pipelines de ASR: enriquecer transcripciones con etiquetas de hablante antes de pasarlas a un sistema de reconocimiento de voz, usando los embeddings como metadatos.
- Investigación en privacidad del habla: medir cuánta información de identidad queda en representaciones o audios anonimizados comparando sus embeddings con los de referencia.

## Benchmarks y rendimiento

Resultados reportados en la model card (EER agrupado universal, 1-utt y 3-utt):

| Metrica | Paso 400 | Paso 4000 (knee) | Paso 4600 (final) |
|---|---|---|---|
| EER 1-utt | 26,90 % | 19,34 % | 19,14 % |
| EER 3-utt | 23,77 % | 15,40 % | 14,87 % |

Datos adicionales de la model card:

| Dato | Valor |
|---|---|
| Desviación estándar EER 1-utt entre semillas 0-2 | 0,08-0,41 % absoluto |
| Semiancho del IC bootstrap al 95 % (8.000 ensayos) | ~0,8 % |
| EER de referencia ECAPA-TDNN en VoxCeleb1-O (paper, no este modelo) | ~0,9 % |
| EER de referencia sistemas sub-1M parámetros (paper, no este modelo) | ~2 % |
| Fingerprint de pérdida en paso 0 (semilla liberada) | 2,1943 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos (no aplican a este tipo de modelo). Las métricas declaradas en los tags incluyen EER, minDCF y ROC-AUC, con resultados detallados en `eval_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (1,7 M de parámetros); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en CPU y en dispositivos móviles vía TFLite.
- Opciones de despliegue: JAX/Flax nativo (biblioteca `flaxspeaker`), TFLite (fp32 e int8) para móvil y edge, y potencialmente ONNX si se convierte desde los pesos safetensors (no documentado en la model card).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una estación de trabajo CPU, lo que sugiere que la inferencia es viable sin acelerador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_lstm_small_ge2e` (este) | 1,71 M | 180 frames (~1,8 s) | 19,14 % (1-utt) / 14,87 % (3-utt) en corpus propio de 381 hablantes | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia del paper) | no disponible | ~0,9 % en VoxCeleb1-O completo | no disponible | implementaciones de terceros |
| EfficientTDNN (Wang et al., 2022) | <1 M (referencia del paper) | no disponible | ~2 % en VoxCeleb1-O | no disponible | implementaciones de terceros |

La comparación directa no es equivalente: los EER de los papers de referencia se miden sobre VoxCeleb1-O completo, mientras que este checkpoint se evalúa sobre un corpus controlado de 381 hablantes. El propio autor indica que no debe interpretarse como estado del arte.

## Limitaciones y advertencias

- No es un producto oficial de Google; es una reimplementación independiente basada solo en papers publicados.
- Checkpoint de convergencia sobre corpus pequeño (381 hablantes, 9.447 enunciados), no una reproducción a gran escala: los EER absolutos están acotados por la diversidad de hablantes del entrenamiento.
- EER de ~19 % (1-utt) y ~15 % (3-utt) en su propio benchmark, muy lejos de sistemas industriales entrenados con miles de hablantes (~0,9 % en VoxCeleb1-O).
- La ventana fija de 180 frames en las exportaciones TFLite limita el audio procesable a ~1,8 s por inferencia; audios más largos requieren segmentación manual.
- No es un `AutoFeatureExtractor` de Hugging Face: el frontend de audio es propio (`flaxspeaker.AudioFrontend`), lo que complica la integración con pipelines estándar.
- Riesgo de degradación en dominios acústicos no representados (idiomas no cubiertos, ruido, canales telefónicos) no cuantificado en la información disponible.
- Sesgos demográficos (género, edad, acento) no evaluados en la model card; en aplicaciones biométricas deben auditarse antes de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Las cifras de referencia de papers citadas en la model card corresponden a otros sistemas y corpus, no a este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_lstm_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
