# wq2012/ls_conformer_small_ge2e

## Resumen

`ls_conformer_small_ge2e` es un modelo de verificación e identificación de hablante (speaker verification / speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de embeddings de hablante que convierte una señal de audio en un vector de 192 dimensiones que representa la identidad vocal de la persona que habla. Con esos vectores se pueden comparar dos fragmentos de audio mediante similitud coseno y decidir si pertenecen al mismo hablante.

El modelo combina un backbone Conformer de tamaño "small" con pooling temporal atento (ATP) y un objetivo de entrenamiento GE2E softmax con centroides leave-one-out exactos. La inferencia completa (encoder más cabeza de scoring, excluyendo los pesos del clasificador que solo se usan en entrenamiento) suma 2.029.894 parámetros. Está implementado desde cero en JAX/Flax a partir de los papers publicados (GE2E, Dr-Vectors, ATP y PFAS), sin código ni datos propietarios, y se distribuye bajo licencia Apache 2.0.

Su relevancia es doble. Por un lado, ofrece una implementación abierta y reproducible en el ecosistema JAX/Flax de algoritmos de reconocimiento de hablante que normalmente solo existen en implementaciones cerradas o en PyTorch. Por otro lado, es explícitamente un checkpoint de referencia para comparaciones relativas controladas dentro del benchmark de FlaxSpeaker: se ha entrenado hasta convergencia sobre un corpus pequeño y abierto (LibriSpeech, 232 hablantes, 5.788 enunciados), no sobre VoxCeleb2-dev, por lo que sus cifras absolutas de EER no deben compararse con sistemas industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija de 180 frames, 1,8 s, en las exportaciones TFLite; los pesos admiten crops variables de 90 a 180 frames) |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones `jax2tf` a TFLite del encoder, con entrada fija de 180 frames sin máscara) |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, que es inglés; el modelo no está orientado a transcripción sino a identidad de hablante) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite FP32/INT8 (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración `small` que procesa características Mel de 80 dimensiones en escala logarítmica natural a 16 kHz, con detección de actividad vocal (VAD) a nivel de frame y normalización CMVN. El frontend de audio es propio de la librería `flaxspeaker.AudioFrontend` y no es un `AutoFeatureExtractor` de Hugging Face, un detalle importante para quien quiera integrarlo. Sobre las representaciones del encoder se aplica un pooling temporal atento (ATP), tomado del paper de identificación de idioma de arXiv:2202.12163, que agrega la secuencia temporal en un único vector de 192 dimensiones. La verificación se hace por similitud coseno entre embeddings.

El entrenamiento usa el objetivo GE2E softmax (ecuación 6 de Wan et al. 2018) con centroides leave-one-out exactos, mini-batches de 32 enunciados (8 hablantes x 4 enunciados) y 2.400 pasos de gradiente, equivalentes a unas 13,27 épocas sobre las 5.788 utterances de 232 hablantes de LibriSpeech, con semilla 42 y una workstation de CPU. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. El modelo card documenta además cabezas Dr-Vector y PFAS, y un fingerprint de pérdida en el paso 0 de 2,2379 que coincide con el pipeline actual. La convergencia se alcanzó en el paso 2000 (knee) y el EER in-domain pasó de 19,50 % (1 utterance) / 14,80 % (3 utterances) en el paso 400 a 12,07 % / 7,50 % en el paso 2400.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1): comparar dos audios con similitud coseno y aplicar un umbral.
- Identificación de hablante (1:N): comparar un embedding contra una galería de embeddings de referencia.
- Reconocimiento independiente del texto: no requiere que el hablante pronuncie una frase concreta.
- Funciona con enunciados cortos (1 utterance) y mejora con múltiples utterances agregadas (3 utterances).
- Exportación a TFLite FP32 e INT8 para despliegue en entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de `feature-extraction` de audio.
- No dispone de capacidades de visión, audio-a-texto ni thinking mode.

## Casos de uso

- Verificación biométrica de acceso por voz: se extrae el embedding del audio de entrada y se compara por coseno contra el embedding de referencia del usuario; el EER in-domain de 12,07 % (1 utterance) y 7,50 % (3 utterances) sirve como referencia de rendimiento en este corpus, aunque para producción con muchos usuarios conviene reentrenar con más hablantes.
- Identificación de hablante en grabaciones de reuniones: segmentar el audio, extraer embeddings por segmento y agrupar por similitud para obtener un diarizado básico de quién habla en cada tramo.
- Control de calidad de datasets de voz: detectar utterances mal etiquetadas o duplicadas comparando el embedding del hablante declarado con el del audio.
- Autenticación de segundo factor en aplicaciones móviles: el export TFLite INT8 del encoder permite ejecutar la extracción de embeddings en el dispositivo sin enviar audio a un servidor.
- Investigación en biometría de voz: el checkpoint sirve como baseline reproducible en JAX/Flax para comparar cambios de arquitectura, pooling o función de pérdida dentro del benchmark FlaxSpeaker.
- Detección de suplantación en locuciones pregrabadas: comparar el embedding del audio sospechoso con el del hablante legítimo y marcar discrepancias para revisión humana.
- Indexación y búsqueda de archivos de audio por hablante: precalcular embeddings de un archivo histórico y recuperar por similitud coseno todos los fragmentos de una persona concreta.

## Benchmarks y rendimiento

Los datos disponibles son los del `eval_results.json` y la trayectoria de entrenamiento documentada en el model card. Corresponden a EER in-domain sobre LibriSpeech con el protocolo del benchmark FlaxSpeaker.

| Metrica | 1 utterance | 3 utterances |
|---|---|---|
| EER in-domain, paso 400 | 19,50 % | 14,80 % |
| EER in-domain, paso 2000 (knee) | 12,40 % | 7,50 % |
| EER in-domain, paso 2400 (final) | 12,07 % | 7,50 % |
| EER Universal Pooled, final | 20,20 % | 16,93 % |

El model card indica que el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %, y que la desviación típica entre semillas 0-2 del EER pooled a 1 utterance es de 0,08-0,41 % absoluto. Como referencia externa, el autor cita ECAPA-TDNN sobre VoxCeleb2-dev con aproximadamente 0,9 % EER en VoxCeleb1-O y sistemas de menos de 1 M de parámetros con aproximadamente 2 % (EfficientTDNN, 2022); esas cifras no son comparables directamente con este checkpoint por la diferencia de corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 dado el tamaño de 2,03 M de parámetros y el encoder pequeño; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en CPU, de modo que la inferencia en CPU es viable. Para lotes grandes, una RTX 4090 o una A100 están sobradamente dimensionadas.
- Cabe en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también en Raspberry Pi y móviles mediante el export TFLite INT8.
- Opciones de despliegue: JAX/Flax con la librería `flaxspeaker` (vía PyPI), export TFLite FP32/INT8 para edge, y despliegue en servidor con el runtime de JAX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_ge2e` | 2,03 M | 180 frames fijos en TFLite; crops 90-180 en entrenamiento | LibriSpeech, 232 hablantes | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia citada) | no disponible | no disponible | VoxCeleb2-dev, 5.994 hablantes | varía según implementación | múltiples implementaciones |
| EfficientTDNN (Wang et al. 2022) | < 1 M | no disponible | no disponible | no disponible | paper |

La comparación directa con ECAPA-TDNN o EfficientTDNN no es limpia: aquellos se entrenan sobre corpus de miles de hablantes y reportan EER de aproximadamente 0,9 % y 2 % respectivamente en VoxCeleb1-O, mientras que este checkpoint se entrena sobre 232 hablantes y reporta 12,07 % a 1 utterance en su propio dominio. La comparación válida es relativa, dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- Entrenado solo con LibriSpeech (inglés, 232 hablantes): el rendimiento fuera de ese dominio y en otros idiomas no está caracterizado.
- El EER absoluto (12,07 % a 1 utterance) está limitado por la diversidad de hablantes del corpus de entrenamiento; no es un modelo listo para producción biométrica a gran escala sin reentrenamiento.
- El autor advierte explícitamente de que no es un producto oficial de Google y de que no reproduce los resultados a gran escala de los papers de referencia.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no un `AutoFeatureExtractor` de Hugging Face; usar el pipeline estándar de Hugging Face sin ese frontend producirá resultados incorrectos.
- Los exports TFLite tienen entrada fija de 180 frames sin máscara; no admiten audio de duración arbitraria sin troceado previo.
- Riesgo de sesgo por género, acento, edad y calidad de grabación, dado el corpus limitado y monolingüe.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de falsos positivos y falsos negativos en la verificación; hay que calibrar el umbral de coseno por caso de uso.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (LibriSpeech) si se redistribuye el modelo.
- No se han publicado métricas de latencia ni throughput, lo que dificulta planificar despliegues con requisitos de tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
