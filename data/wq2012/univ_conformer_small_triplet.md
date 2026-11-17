# wq2012/univ_conformer_small_triplet

## Resumen
`univ_conformer_small_triplet` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada únicamente en papers publicados, de algoritmos clásicos de reconocimiento de locutor: GE2E, Dr-Vectors, ATP (pooling atencional) y PFAS. El modelo no es un producto oficial de Google y se distribuye con licencia Apache 2.0.

La arquitectura es un Conformer de tamaño pequeño (variante `small`) con pooling temporal atencional (ATP), entrenado con objetivo triplet y evaluado mediante similitud coseno. El encoder y la cabeza de scoring suman 2.029.892 parámetros de inferencia y producen embeddings de 192 dimensiones. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD por energía y CMVN, empaquetado en la librería `flaxspeaker` y no como `AutoFeatureExtractor` de Hugging Face.

Es relevante ahora porque ofrece un checkpoint ligero, reproducible y de código abierto en el ecosistema JAX/Flax para tareas de verificación de locutor, un nicho donde predominan implementaciones en PyTorch. Ahora bien, el propio autor advierte que se trata de un checkpoint de benchmark sobre un corpus pequeño (381 locutores, 9.447 utterances), no de una reproducción a gran escala de los resultados de los papers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal ATP |
| Parametros totales | 2.029.892 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable; entrenamiento con crops de `U(90, 180)` frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (multidominio: LibriSpeech EN, CN-Celeb2 ZH, VoxCeleb1 multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento
El modelo usa un backbone Conformer de variante pequeña, con pooling temporal atencional (ATP, tomado de un paper de identificación de idioma) y una cabeza de scoring basada en similitud coseno. La representación de salida es un embedding de 192 dimensiones. El objetivo de entrenamiento es triplet, complementado con las formulaciones GE2E, Dr-Vectors y PFAS descritas en los papers de referencia (arXiv:1710.10467, 2104.01989, 2202.12163, 2203.05642).

El entrenamiento se realizó sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 locutores y 9.447 utterances, durante 4.600 pasos de gradiente con mini-batches de 32 utterances (8 locutores x 4 utterances), lo que equivale a unas 15,58 épocas, con warmup de 460 pasos y semilla 42, sobre una estación de trabajo CPU. Se usaron crops de longitud variable `U(90, 180)` frames con máscara de validez exacta. El EER agrupado universal pasó de 28,89 % (1-utt) / 25,97 % (3-utt) en el paso 400 a 23,23 % / 19,57 % en el paso 4.600. La desviación estándar entre semillas 0-2 es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades
- Extracción de embeddings de locutor (feature-extraction) para verificación e identificación.
- Verificación de locutor mediante similitud coseno entre embeddings.
- Identificación de locutor (speaker recognition) sobre poblaciones cerradas.
- Scoring con cabeza PFAS (Parameter-Free Attentive Scoring).
- Procesamiento multidominio: entrenado con datos en inglés (LibriSpeech), chino (CN-Celeb2) y multilingües (VoxCeleb1).
- Entrada de audio de longitud variable con VAD por energía y CMVN.
- No soporta tool calling, agentes, visión, audio generativo ni modos de razonamiento; es un modelo puramente discriminativo de embeddings.

## Casos de uso
- Verificación biométrica de locutor en aplicaciones de control de acceso: se extrae el embedding del audio de enrolment y se compara por similitud coseno con el del audio de prueba, usando el umbral calibrado sobre el EER del checkpoint.
- Autenticación por voz en asistentes o sistemas telefónicos: el modelo es lo bastante pequeño (2,03 M de parámetros) para ejecutarse en CPU y validar la identidad del hablante antes de dar acceso a operaciones sensibles.
- Diarización de hablantes en grabaciones: extrayendo embeddings por segmentos y agrupándolos por similitud coseno se pueden separar interlocutores en reuniones o llamadas.
- Detección de fraude y suplantación de identidad: comparar el embedding de una llamada entrante con el perfil de voz registrado del cliente para detectar voces sintéticas o imitadores.
- Investigación reproducible en JAX/Flax: sirve como checkpoint de referencia y punto de partida para experimentos de reconocimiento de locutor en el ecosistema Flax, con métricas y fingerprints de paso 0 publicados.
- Benchmarking controlado de arquitecturas Conformer y funciones de pérdida (triplet, GE2E, Dr-Vectors, PFAS) dentro del conjunto de pruebas FlaxSpeaker.
- Filtrado y anonimización de audio: usar los embeddings para agrupar o separar locutores en pipelines de preprocesado de datasets de voz.

## Benchmarks y rendimiento
Los datos publicados en la model card son métricas internas del benchmark FlaxSpeaker sobre el corpus de 381 locutores, no comparables directamente con resultados sobre VoxCeleb1-O completo.

| Metrica | Paso 400 | Paso 4000 | Paso 4600 (final) |
|---|---|---|---|
| EER universal 1-utt | 28,89 % | 23,79 % | 23,23 % |
| EER universal 3-utt | 25,97 % | 20,13 % | 19,57 % |

Como referencia orientativa citada por el autor: sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1 M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). El checkpoint aquí descrito no es comparable directamente por la diferencia de corpus de entrenamiento. El repositorio incluye `eval_results.json` con EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap al 95 % y un subconjunto de 10 locutores de VoxCeleb1-O.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; con 2,03 M de parámetros los pesos ocupan del orden de 8 MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier RTX serie 20/30/40, A100 o H100 sirve, pero el modelo está dimensionado para ejecución en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de sistemas embebidos con suficiente memoria.
- Opciones de despliegue: librería `flaxspeaker >= 0.5.0` (JAX/Flax) mediante `load_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en una estación de trabajo CPU, lo que sugiere inferencia viable en CPU sin acelerador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_conformer_small_triplet` | 2,03 M | audio variable, crops 90-180 frames | EER 23,23 % (1-utt) en corpus interno de 381 locutores | Apache 2.0 | Hugging Face, JAX/Flax |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible | audio variable | ~0,9 % EER en VoxCeleb1-O | no disponible | implementaciones comunitarias en PyTorch |
| EfficientTDNN (Wang et al., 2022) | <1 M | audio variable | ~2 % EER en VoxCeleb1-O | no disponible | no disponible |

La comparación directa no es posible porque los modelos de referencia se entrenaron sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances), mientras que este checkpoint usa 381 locutores y 9.447 utterances. La diferencia de EER refleja principalmente la diversidad de locutores del corpus de entrenamiento, no una diferencia de arquitectura.

## Limitaciones y advertencias
- No es un producto oficial de Google; es una reimplementación independiente basada en papers.
- Checkpoint de benchmark sobre corpus pequeño: 381 locutores y 9.447 utterances, frente a los miles de locutores de los benchmarks industriales; los EER absolutos están acotados por la diversidad de locutores de entrenamiento.
- El EER de ~23 % (1-utt) es muy superior al de sistemas estado del arte; no debe usarse como referencia de rendimiento de producción.
- Sesgos conocidos: no documentados explícitamente, pero la composición del corpus (LibriSpeech, CN-Celeb2, VoxCeleb1) condiciona la cobertura de acentos, idiomas y condiciones acústicas.
- Riesgo de degradación en dominios no representados en el entrenamiento (por ejemplo, audio telefónico de baja calidad o ruido de fondo intenso).
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face; requiere la librería `flaxspeaker` para reproducir el preprocesado (Mel logarítmico de 80 dimensiones, VAD por energía, CMVN).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Los pesos del clasificador de entrenamiento están excluidos del recuento de parámetros de inferencia; hay que usar la cabeza de scoring correspondiente.

## Enlaces
- Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_triplet
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
