# wq2012/ls_conformer_small_cosface

## Resumen

`ls_conformer_small_cosface` es un modelo de extracción de embeddings de hablante (speaker verification / speaker recognition) desarrollado por el usuario wq2012 como parte de la biblioteca FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de hablante (GE2E, Dr-Vectors, ATP y PFAS), escrita únicamente a partir de los papers originales, sin código ni datos propietarios. El checkpoint está pensado como referencia reproducible y de pequeño tamaño dentro del ecosistema FlaxSpeaker.

La arquitectura combina un backbone Conformer de variante "small", pooling temporal atento (ATP) y una función de pérdida CosFace con scoring por similitud coseno. El modelo produce embeddings de 192 dimensiones y cuenta con 2.029.892 parámetros de inferencia (encoder más cabezas de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento). Está entrenado exclusivamente sobre LibriSpeech (232 hablantes, 5.788 enunciados) durante 2.400 pasos, lo que lo convierte en un checkpoint de benchmark de corpus pequeño, no en un sistema de producción a gran escala.

Su relevancia actual es doble: por un lado, ofrece una implementación abierta y verificable en JAX/Flax de técnicas de speaker verification que normalmente solo existen en frameworks como PyTorch o TensorFlow; por otro, sirve como punto de comparación controlado para experimentos relativos dentro del benchmark de FlaxSpeaker. No está pensado para competir con sistemas industriales entrenados sobre VoxCeleb2-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) y cabeza CosFace |
| Parametros totales | 2.029.892 (encoder + cabezas de scoring; excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por recortes de 90-180 frames de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acústico agnóstico de idioma; entrenado sobre LibriSpeech, inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, flax_model.msgpack (Flax Msgpack) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Conformer de tamaño "small" para procesar características acústicas, seguido de un mecanismo de pooling temporal atento (ATP, adaptado de un paper de identificación de idioma) que agrega la secuencia en un único vector de 192 dimensiones. La función de pérdida es CosFace, una variante de margen angular sobre la similitud coseno, y la verificación se realiza comparando embeddings mediante similitud coseno. El frontend de audio es específico de la librería: Mel de 80 dimensiones en logaritmo natural a 16 kHz, VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó sobre LibriSpeech exclusivamente (232 hablantes, 5.788 enunciados), con recortes de longitud variable U(90, 180) frames y máscara de validez exacta, durante 2.400 pasos de gradiente con mini-batches de 64 enunciados (8 hablantes x 4 enunciados), lo que equivale a aproximadamente 26,54 épocas, semilla 42, sobre una estación de trabajo CPU. El warmup del margen angular se rampa linealmente durante los primeros 300 pasos. Según la model card, el EER in-domain en LibriSpeech evolucionó desde 23,73% (1-utt) / 19,00% (3-utt) en el paso 400 hasta 8,03% / 4,10% en el paso 2.400. La desviación estándar entre semillas del EER pooled 1-utt es de 0,08-0,41% absoluto.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante (misma persona / distinta persona) mediante similitud coseno.
- Reconocimiento e identificación de hablante por comparación contra una galería de embeddings.
- Procesamiento de audio de longitud variable mediante recortes de 90-180 frames.
- Evaluación con métricas estándar del dominio: EER, minDCF y ROC-AUC.
- Integración con el ecosistema JAX/Flax a través de la librería `flaxspeaker`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de feature extraction puramente acústico.
- Capacidades multilingües: no documentadas; el entrenamiento es solo en inglés (LibriSpeech).

## Casos de uso

- Verificación biométrica de hablante en aplicaciones de control de acceso: el modelo genera un embedding de 192 dimensiones por utterance y permite comparar contra un embedding de referencia mediante similitud coseno, con un EER in-domain de 8,03% (1-utt) en el checkpoint liberado.
- Benchmarking reproducible de pipelines de speaker recognition: al ser una reimplementación JAX/Flax de GE2E, Dr-Vectors, ATP y PFAS, sirve para comparar variantes de arquitectura y pérdida dentro del propio benchmark FlaxSpeaker con resultados controlados y semillas fijas.
- Investigación educativa sobre pérdidas de margen angular: el checkpoint permite estudiar el efecto del warmup de margen CosFace (300 pasos) y de los recortes de longitud variable sobre el EER.
- Prototipado de diarización simple: agrupando embeddings de segmentos cortos de audio por similitud coseno se pueden separar hablantes en grabaciones con pocos interlocutores, aunque la baja diversidad de entrenamiento limita la generalización.
- Integración en pipelines JAX existentes: al estar en formato safetensors y msgpack nativo de Flax, se puede cargar directamente en entornos JAX sin conversión a PyTorch.
- Validación de sistemas de verificación en dominios cruzados: la model card incluye evaluación multi-dominio (VoxCeleb1-O subconjunto de 10 hablantes, CN-Celeb) que permite medir la degradación fuera de dominio de un modelo entrenado solo con LibriSpeech.
- Docencia y reproducción de papers: el modelo y la librería permiten reproducir desde cero los algoritmos descritos en los papers citados sin depender de infraestructura propietaria.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint final (paso 2.400), in-domain LibriSpeech:

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER (LibriSpeech) | 8,03% | 4,10% |
| EER (Universal Pooled) | 17,62% | 13,67% |

Evolución del EER in-domain a lo largo del entrenamiento:

| Paso | EER 1-utt | EER 3-utt |
|---|---|---|
| 400 | 23,73% | 19,00% |
| 2.000 (knee) | 8,53% | 4,50% |
| 2.400 (final) | 8,03% | 4,10% |

Datos de referencia citados en la model card (no son resultados de este modelo): sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan ~0,9% EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2% (Wang et al., EfficientTDNN, 2022). El modelo incluye además `eval_results.json` con minDCF, ROC-AUC, intervalos de confianza bootstrap al 95% y evaluación sobre un subconjunto de 10 hablantes de VoxCeleb1-O, cuyos valores numéricos no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,03M de parámetros en fp32 el modelo ocupa del orden de 8 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente para inferencia en tiempo real de utterances cortas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: la librería nativa es `flaxspeaker` (JAX/Flax). El formato safetensors permite cargarlo con `safetensors` y JAX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el entrenamiento se realizó en una estación de trabajo CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_cosface` (este) | 2,03M | recortes 90-180 frames, 16 kHz | 8,03% (1-utt, LibriSpeech in-domain) | apache-2.0 | Hugging Face, JAX/Flax |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (referencia) | VoxCeleb2-dev | ~0,9% en VoxCeleb1-O | no disponible en la información | paper; implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1M (referencia) | VoxCeleb2-dev | ~2% (VoxCeleb1-O) | no disponible en la información | paper |

La comparación no es directa: este checkpoint se entrena sobre 232 hablantes de LibriSpeech, mientras que los sistemas de referencia usan VoxCeleb2-dev (5.994 hablantes, ~1,1M utterances). El autor lo indica explícitamente y desaconseja tratarlo como modelo state-of-the-art.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño: 232 hablantes y 5.788 enunciados, frente a los miles de hablantes de benchmarks industriales; el EER absoluto está acotado por esta diversidad.
- EER in-domain de 8,03% (1-utt) y 17,62% en Universal Pooled: muy lejos de sistemas de producción (~0,9-2% en VoxCeleb1-O).
- No es una reproducción a gran escala de los papers originales; el autor lo califica explícitamente como checkpoint de benchmark de corpus pequeño.
- Entrenado solo con LibriSpeech (inglés); el rendimiento en otros idiomas o dominios acústicos no está caracterizado y probablemente se degrade.
- Riesgo de sesgo demográfico y acústico por la composición limitada del corpus de entrenamiento (lectura de audiolibros en inglés).
- No es un producto oficialmente soportado por Google.
- El frontend de audio es propio de `flaxspeaker` y no un `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar.
- No soporta cuantización documentada ni despliegue en runtimes generativos (vLLM, llama.cpp, Ollama, TGI).
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja su uso en producción por las limitaciones de rendimiento y generalización.
- La variabilidad entre semillas (0,08-0,41% absoluto) y el intervalo bootstrap (~0,8%) implican que diferencias pequeñas entre modelos no son significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_cosface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
