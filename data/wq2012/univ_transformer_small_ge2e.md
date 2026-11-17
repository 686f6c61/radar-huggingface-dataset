# wq2012/univ_transformer_small_ge2e

## Resumen

`univ_transformer_small_ge2e` es un modelo de verificación e identificación de hablante (speaker verification/recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo generativo de texto: su función es extraer embeddings de voz de 192 dimensiones que permiten comparar si dos fragmentos de audio corresponden al mismo hablante mediante similitud coseno. Está implementado en JAX/Flax y se distribuye en formato SafeTensors y Msgpack.

El modelo emplea una arquitectura transformer de tamano "small" con pooling temporal atento (ATP) y se entrena con la función de pérdida GE2E softmax, siguiendo las recetas de los papers GE2E, Dr-Vectors, ATP y PFAS. Con 1.239.622 parámetros de inferencia, es un checkpoint deliberadamente compacto: un benchmark de convergencia sobre un corpus controlado de 381 hablantes y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), no una reproducción a gran escala de los resultados industriales de los papers originales.

Es relevante ahora por su carácter reproducible y abierto: reimplementa desde cero en JAX/Flax algoritmos publicados, con licencia Apache 2.0, y ofrece métricas de evaluación detalladas (EER, minDCF, ROC-AUC con intervalos de confianza bootstrap). Resulta útil para investigadores que quieran comparar variantes de arquitectura y pérdida en un entorno controlado, no como sistema de producción de verificación de hablante a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (`small`) con pooling temporal ATP (Attentive Temporal Pooling) |
| Parametros totales | 1.239.622 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio; crops de entrenamiento de U(90, 180) frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con LibriSpeech, CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |
| Dimension de embedding de salida | 192 |
| Objetivo de entrenamiento | GE2E softmax (Wan et al. 2018, Eq. 6; centroides leave-one-out exactos) |
| Scorer de verificacion | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dims @ 16 kHz + VAD por energia a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`) |
| Libreria | `flaxspeaker >= 0.5.0` (JAX/Flax) |
| Pipeline HF | `feature-extraction` |

## Arquitectura y entrenamiento

El backbone es un transformer de tamano "small" que procesa representaciones Mel de 80 dimensiones a 16 kHz, con VAD por energía a nivel de frame y normalización CMVN. Sobre la secuencia temporal se aplica un pooling atento ATP (repurposed del paper de identificación de idioma, arXiv:2202.12163) que produce un embedding de 192 dimensiones. La verificación se realiza por similitud coseno entre embeddings, y el entrenamiento usa la pérdida GE2E softmax con centroides leave-one-out exactos, complementada con las ideas de Dr-Vectors y PFAS.

El entrenamiento se realizó sobre un pool multi-dominio de 381 hablantes y 9.447 utterances (LibriSpeech + CN-Celeb2 + VoxCeleb1), con crops variables de U(90, 180) frames y máscara de validez exacta, durante 4.600 pasos de gradiente con batches de 32 utterances (8 hablantes x 4 utterances), lo que equivale a ~15,58 épocas, con seed 42 y warmup de 460 pasos. El autor documenta explícitamente que es un checkpoint de convergencia sobre corpus pequeño, no una reproducción a gran escala de los papers; el EER universal pooled evolucionó de 27,14 % (1-utt) en el paso 400 a 18,73 % (1-utt) / 14,87 % (3-utt) en el paso 4.600. La desviación estándar entre seeds 0-2 es de 0,08-0,41 % absoluto, y el intervalo bootstrap del 95 % (8.000 trials) tiene semiancho ~0,8 %.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) por comparación contra un conjunto de embeddings de referencia.
- Reconocimiento multi-dominio: entrenado con datos de LibriSpeech (inglés leído), CN-Celeb2 (chino) y VoxCeleb1 (multilingüe en entorno no controlado).
- Evaluación con métricas estándar de la tarea: EER (1-utt y 3-utt), minDCF, ROC-AUC.
- Soporte de audio de longitud variable mediante crops con máscara de validez.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un extractor de features de audio.
- No dispone de modo "thinking", visión ni audio-to-text.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: se extrae el embedding del audio de entrada y se compara por coseno contra el embedding de referencia del usuario; el modelo es ligero (1,24 M parámetros) y adecuado para despliegue en CPU.
- Benchmarking de arquitecturas y funciones de pérdida en investigación: sirve como punto de comparación controlado dentro del benchmark FlaxSpeaker para medir el efecto de variantes como Dr-Vectors, PFAS o distintos poolings.
- Diarización de hablantes en pipelines de transcripción: los embeddings permiten agrupar segmentos de audio por locutor antes o después de la transcripción, con un coste computacional muy bajo.
- Detección de cambios de hablante en grabaciones largas: procesando ventanas deslizantes y comparando embeddings consecutivos por coseno se pueden detectar transiciones de locutor.
- Reproducibilidad de papers: al ser una reimplementación desde cero en JAX/Flax con licencia Apache 2.0, permite reproducir y auditar los algoritmos GE2E, Dr-Vectors y ATP sin depender de código propietario.
- Filtrado y curación de datasets de audio: comparar embeddings de segmentos para detectar duplicados o inconsistencias de locutor en corpus de entrenamiento.
- Prototipado educativo: por su tamano reducido y su naturaleza multi-dominio (inglés, chino, habla no controlada), es útil para demostrar pipelines completos de verificación de hablante en cursos o talleres.

## Benchmarks y rendimiento

Datos reportados en la model card durante la trayectoria de entrenamiento (EER universal pooled):

| Paso | EER 1-utt | EER 3-utt |
|---|---|---|
| 400 | 27,14 % | 23,57 % |
| 4000 (knee) | 19,15 % | 14,93 % |
| 4600 (final) | 18,73 % | 14,87 % |

Referencias citadas por el autor para orientación (no comparables directamente por diferencias de corpus):

| Sistema | Corpus de entrenamiento | EER en VoxCeleb1-O |
|---|---|---|
| ECAPA-TDNN (Desplanques et al., 2020) | VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances) | ~0,9 % |
| EfficientTDNN (Wang et al., 2022), <1 M parámetros | VoxCeleb2-dev | ~2 % |
| `univ_transformer_small_ge2e` | 381 hablantes, 9.447 utterances | no evaluado en la lista completa; solo subset de 10 hablantes de VoxCeleb1-O en `eval_results.json` |

El autor advierte que los EER absolutos están acotados por la diversidad de hablantes del corpus de entrenamiento y que el modelo está pensado para comparaciones relativas controladas, no como estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,24 M parámetros los pesos ocupan del orden de unos pocos MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en sistemas embebidos.
- Opciones de despliegue: la librería oficial es `flaxspeaker >= 0.5.0` (JAX/Flax). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada.
- El modelo se entrenó en una estación de trabajo CPU, lo que confirma que la inferencia no exige acelerador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_transformer_small_ge2e` | 1.239.622 | Audio 16 kHz, crops U(90,180) frames | 18,73 % (1-utt) / 14,87 % (3-utt) en corpus propio de 381 hablantes | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la información | Audio | ~0,9 % en VoxCeleb1-O | no disponible en la información | paper; implementaciones de terceros |
| EfficientTDNN (Wang et al., 2022) | <1 M | Audio | ~2 % en VoxCeleb1-O | no disponible en la información | paper |
| Otros checkpoints FlaxSpeaker | variable | Audio | variable según variante | Apache 2.0 | colección FlaxSpeaker en Hugging Face |

La comparación con ECAPA-TDNN y EfficientTDNN no es directa: aquellos se entrenaron sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances) y se evalúan sobre la lista completa de VoxCeleb1-O, mientras que este checkpoint se entrena sobre 381 hablantes y 9.447 utterances. Las cifras no son equiparables en términos absolutos.

## Limitaciones y advertencias

- Checkpoint de convergencia sobre corpus pequeño: 381 hablantes y 9.447 utterances, frente a los miles de hablantes de los benchmarks industriales; los EER absolutos son sustancialmente peores que los de sistemas entrenados a gran escala.
- No es una reproducción a gran escala de los papers GE2E, Dr-Vectors, ATP o PFAS: los experimentos originales se ejecutaron en infraestructura y datos internos de Google, no con esta librería.
- Sesgos potenciales derivados de la composición del corpus (LibriSpeech es inglés leído, CN-Celeb2 es chino, VoxCeleb1 es habla no controlada multilingüe); el rendimiento puede degradarse en dominios, acentos o condiciones acústicas no representadas.
- Riesgo de confusión entre hablantes con voces similares o en condiciones de ruido, dado el tamano reducido del modelo y del corpus de entrenamiento.
- No se documentan los idiomas soportados de forma explícita; el modelo es agnóstico al idioma por naturaleza, pero no hay garantías formales.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que no es un producto oficialmente soportado por Google.
- Los datos de evaluación de VoxCeleb1-O se limitan a un subset de 10 hablantes, no a la lista completa.
- El frontend de audio es propio de `flaxspeaker` (`flaxspeaker.AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face; integrarlo en pipelines estándar requiere adaptación.
- No apto para generación de texto, razonamiento, código ni tareas multimodales: es exclusivamente un extractor de embeddings de hablante.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_transformer_small_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling): https://arxiv.org/abs/2202.12163
- Paper PFAS (Parameter-Free Attentive Scoring): https://arxiv.org/abs/2203.05642
