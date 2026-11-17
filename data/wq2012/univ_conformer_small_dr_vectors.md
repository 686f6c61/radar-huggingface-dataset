# wq2012/univ_conformer_small_dr_vectors

## Resumen

`univ_conformer_small_dr_vectors` es un extractor de embeddings de hablante (speaker embeddings) de 192 dimensiones desarrollado por el usuario `wq2012` como parte de la biblioteca FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de hablante publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo resuelve la tarea de verificación e identificación de hablante: dada una grabación de audio, produce un vector que caracteriza la identidad vocal del locutor, útil para autenticación biométrica, diarización o control de acceso por voz.

Arquitectura de tipo Conformer en configuración "small" con pooling temporal atento (ATP) y una cabeza de scoring basada en una variante reducida de Dr-Vectors. Con solo 2.088.007 parámetros en inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento), es un modelo extremadamente ligero, pensado como checkpoint de referencia para comparaciones controladas dentro del benchmark de FlaxSpeaker, no como un sistema de producción a gran escala.

Es relevante ahora porque ofrece una implementación reproducible, auditable y de código abierto (Apache 2.0) de técnicas de speaker recognition en el ecosistema JAX/Flax, un nicho poco cubierto frente al dominio de PyTorch. El checkpoint está entrenado sobre un corpus multi-dominio controlado de 381 hablantes y 9.447 utterances (LibriSpeech, CN-Celeb2 y VoxCeleb1), lo que lo convierte en una base útil para investigación comparativa más que para despliegues industriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) y cabeza de scoring Dr-Vector reducida |
| Parametros totales | 2.088.007 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90 a 180 frames en entrenamiento; ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acústico agnóstico de idioma; entrenado con datos en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax nativo) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de configuración "small" con pooling temporal atento (ATP, técnica originalmente propuesta para identificación de idioma en streaming) que agrega la secuencia de representaciones de frames en un único vector de 192 dimensiones. La función de pérdida es una variante propia de Extended-Set Softmax (mezcla 0.50 de row-softmax y 0.50 de extended-set con un desplazamiento de logit de -log N, distinta de la ecuación del paper original). El scoring de verificación usa una variante reducida de Dr-Vectors sin separación base/side-info, con capas ocultas (128, 64) ReLU más LayerNorm y un peso residual fijo de 0.25. El frontend de audio es propio de FlaxSpeaker: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame y CMVN, no un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre un pool multi-dominio controlado de 381 hablantes y 9.447 utterances combinando LibriSpeech, CN-Celeb2 y VoxCeleb1, con 4.600 pasos de gradiente (warmup de 460), mini-batches de 32 utterances (8 hablantes x 4 utterances) y aproximadamente 15,58 épocas, en una estación de trabajo CPU con semilla 42. Se usaron crops de longitud variable U(90, 180) frames con máscara de validez exacta. El EER agrupado universal evolucionó de 27,12% (1 utterance) a las 400 iteraciones, hasta 19,43% (1 utterance) / 15,13% (3 utterances) al final. La desviación estándar entre semillas 0-2 es de 0,08-0,41% absoluto y el intervalo de confianza bootstrap del 95% (8.000 ensayos) es de aproximadamente 0,8%.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio (tarea `feature-extraction`).
- Verificación de hablante (1:1): comparación de pares de utterances mediante scoring Dr-Vector.
- Identificación de hablante (1:N) mediante comparación de embeddings contra una galería.
- Scoring de verificación con puntuaciones calibradas por la cabeza Dr-Vector y alternativa PFAS (Parameter-Free Attentive Scoring).
- Funciona como extractor agnóstico de idioma a nivel acústico, aunque el entrenamiento se limita a datos en inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente acústico de representación.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de acceso: el modelo genera un embedding de 192 dimensiones por utterance y permite comparar contra una plantilla de referencia almacenada; su tamaño de 2M parámetros lo hace viable en dispositivos con recursos limitados.
- Diarización de reuniones y transcripciones: segmentar audio por hablante y agrupar segmentos comparando embeddings, útil en pipelines de actas automáticas.
- Investigación comparativa en JAX/Flax: sirve como checkpoint de referencia reproducible para medir el efecto de cambios en arquitectura, pooling o función de pérdida dentro del benchmark FlaxSpeaker.
- Detección de locutor en grabaciones de centros de llamadas: identificar si dos llamadas provienen del mismo usuario para tareas antifraude, con la advertencia de que el EER del modelo no es apto para producción a gran escala.
- Autenticación por voz en asistentes de hogar: al ser un modelo de 2M parámetros y 0,1 GB de repositorio, puede ejecutarse en CPU o dispositivos embebidos para verificación local sin enviar audio a la nube.
- Anonimización y control de calidad de datasets de voz: extraer embeddings para detectar duplicados de hablante o filtrar grabaciones antes de construir corpus de entrenamiento.
- Reproducción de experimentos académicos: el checkpoint permite validar implementaciones de GE2E, Dr-Vectors, ATP y PFAS en JAX con semilla y presupuesto de entrenamiento documentados.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER agrupado universal, sobre el pool multi-dominio de 381 hablantes):

| Punto de entrenamiento | EER 1 utterance | EER 3 utterances |
|---|---|---|
| Paso 400 | 27,12% | 24,90% |
| Paso 4000 (knee) | 19,49% | 14,93% |
| Paso 4600 (final) | 19,43% | 15,13% |

Como referencia orientativa, la model card cita sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev con ~0,9% EER en VoxCeleb1-O (Desplanques et al., 2020) y sistemas de menos de 1M de parámetros con ~2% EER (Wang et al., EfficientTDNN, 2022). El autor advierte explícitamente que estos checkpoints no son comparables a nivel absoluto con sistemas industriales entrenados sobre miles de hablantes. No se han publicado resultados de benchmarks adicionales (minDCF, ROC-AUC) en la información disponible más allá de las métricas declaradas en `eval_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2M parámetros en fp32 el modelo ocupa aproximadamente 8 MB de pesos, más overhead de activaciones y frontend.
- GPU recomendadas: cualquier GPU moderna es sobrada; el modelo fue entrenado en CPU y está pensado para ejecución en CPU o GPUs de gama baja (GTX 1650, RTX 3060, T4).
- Cabe en cualquier GPU consumer e incluso en Raspberry Pi o dispositivos embebidos con suficiente RAM.
- Opciones de despliegue: la librería oficial es `flaxspeaker` (JAX/Flax). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto. Los pesos también se distribuyen en safetensors y msgpack para integración manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_dr_vectors` | 2,09M | crops 90-180 frames | 19,43% (1-utt) / 15,13% (3-utt) en benchmark propio | Apache 2.0 | Hugging Face, JAX/Flax |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (típico) | utterances completas | ~0,9% en VoxCeleb1-O | depende de la implementación | SpeechBrain, PyTorch |
| EfficientTDNN (Wang et al., 2022) | <1M | utterances completas | ~2% en VoxCeleb1-O | según publicación | referencia académica |
| Modelos Dr-Vectors originales (Google) | no disponible | no disponible | no disponible | no disponible | no público |

La comparación no es directa: los EER de ECAPA-TDNN y EfficientTDNN se miden sobre VoxCeleb1-O con entrenamiento en VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances), mientras que este checkpoint se evalúa en su propio pool de 381 hablantes. La diferencia de ~19% frente a ~1-2% refleja principalmente la diversidad de hablantes del corpus de entrenamiento, no una deficiencia arquitectónica.

## Limitaciones y advertencias

- Checkpoint de benchmark de corpus pequeño: entrenado con 381 hablantes y 9.447 utterances, muy por debajo de los miles de hablantes de sistemas industriales; el EER absoluto (19,43%) no es apto para producción.
- Sesgos de dominio y demografía: el corpus combina LibriSpeech (inglés leído), VoxCeleb1 (inglés espontáneo de celebridades) y CN-Celeb2 (chino), lo que puede introducir sesgos hacia esas variedades y estilos; no hay evaluación documentada de sesgo por género, edad o acento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en verificación, especialmente con audio ruidoso o hablantes no representados en entrenamiento.
- Limitaciones de idioma: aunque el modelo es acústico, no se ha validado su comportamiento en idiomas distintos del inglés y el chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que no es un producto oficial de Google y que los resultados no reproducen los papers originales.
- Frontend propio: no usa `AutoFeatureExtractor` de Hugging Face, por lo que la integración requiere la librería `flaxspeaker` y su pipeline de VAD/CMVN; un uso incorrecto del frontend degrada los embeddings.
- Reproducibilidad dependiente de la versión: la model card indica que evaluar los pesos con el código actual reproduce las métricas archivadas, pero cambios futuros en el pipeline podrían alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_dr_vectors
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
