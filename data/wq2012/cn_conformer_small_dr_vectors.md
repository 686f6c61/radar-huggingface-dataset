# wq2012/cn_conformer_small_dr_vectors

## Resumen

`cn_conformer_small_dr_vectors` es un extractor de embeddings de locutor (speaker embeddings) implementado en JAX/Flax y publicado bajo el paraguas de la librería FlaxSpeaker, desarrollada por el usuario `wq2012`. No es un modelo de lenguaje: su función es convertir fragmentos de audio en vectores de 192 dimensiones que representan la identidad del hablante, para tareas de verificación e identificación de locutor. El checkpoint es una reimplementación desde cero, basada únicamente en artículos publicados (GE2E, Dr-Vectors, ATP y PFAS), de los algoritmos de reconocimiento de locutor de Google.

La arquitectura combina un backbone Conformer de tamaño "small" con pooling temporal atento (ATP) y una cabeza de verificación basada en una variante reducida de Dr-Vector. El modelo tiene 2.088.007 parámetros de inferencia y se entrenó exclusivamente sobre CN-Celeb2 (119 hablantes, 2.909 enunciados) durante 1.600 pasos, lo que lo convierte en un checkpoint de referencia para comparaciones relativas dentro del benchmark de FlaxSpeaker, no en un sistema de producción a gran escala.

Su relevancia es principalmente metodológica y de reproducibilidad: ofrece una implementación abierta, en JAX, de técnicas de reconocimiento de locutor que normalmente solo existen en frameworks propietarios o en implementaciones PyTorch. La licencia Apache 2.0 y el tamaño reducido del repositorio (0,1 GB) facilitan su inspección y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) y cabeza Dr-Vector |
| Parametros totales | 2.088.007 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90-180 frames durante entrenamiento; ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrenado solo con CN-Celeb2, corpus en mandarín) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuración `small` para extraer representaciones acústicas frame a frame, seguido de un pooling temporal atento (ATP, tomado de un artículo sobre identificación de idioma) que agrega la secuencia en un vector de dimensión 192. La verificación se realiza con una variante reducida de Dr-Vector: sin separación base/side-info, con capas ocultas (128, 64) con ReLU y LayerNorm, y un peso residual fijo de 0,25. La función de pérdida es una Extended-Set Softmax mezclada (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit −log N), una variante propia de FlaxSpeaker que no coincide con la ecuación 2 del artículo original.

El entrenamiento se realizó sobre CN-Celeb2 únicamente: 119 hablantes y 2.909 enunciados, con mini-batches de 32 enunciados (8 hablantes × 4 enunciados), 1.600 pasos de gradiente (~17,60 épocas), warmup de 160 pasos y semilla 42, sobre una estación de trabajo con CPU. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz, con VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face. Los crops de entrenamiento son de longitud variable U(90, 180) frames con máscara de validez exacta.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificación de locutor (1:1): comparación de dos audios mediante la cabeza Dr-Vector.
- Identificación de locutor (1:N) mediante comparación de embeddings.
- Scoring con Dr-Vector y con PFAS (Parameter-Free Attentive Scoring).
- Evaluación con métricas EER, minDCF y ROC-AUC.
- Procesamiento de audio a 16 kHz con VAD integrado.
- No soporta tool calling, agentes, visión ni generación de texto: es un modelo de feature extraction de audio.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera embeddings de 192 dimensiones que pueden compararse con una plantilla registrada mediante la cabeza Dr-Vector para aceptar o rechazar una identidad.
- Identificación de hablantes en grabaciones de reuniones: al ser un extractor ligero (2,08 M de parámetros), puede ejecutarse sobre segmentos cortos y compararse contra una base de embeddings de participantes conocidos.
- Diarización de audio como componente de extracción de embeddings: integrado en un pipeline que segmenta el audio y agrupa los vectores resultantes por similitud para separar interlocutores.
- Investigación y reproducción de algoritmos de reconocimiento de locutor: sirve como referencia ejecutable en JAX/Flax de GE2E, Dr-Vectors, ATP y PFAS, útil para comparar variantes dentro del benchmark de FlaxSpeaker.
- Evaluación comparativa de arquitecturas de pooling y scoring: el checkpoint permite medir el efecto de ATP frente a pooling universal y de Dr-Vector frente a PFAS con las métricas incluidas en `eval_results.json`.
- Prototipado de sistemas multilingües con ajuste fino: al ser un modelo pequeño y con licencia Apache 2.0, puede reentrenarse sobre corpus propios en otros idiomas para tareas de verificación específicas.
- Filtrado de audio por locutor en conjuntos de datos: extracción de embeddings para agrupar o descartar grabaciones de un mismo hablante antes de entrenar otros modelos.

## Benchmarks y rendimiento

Los datos disponibles son métricas de evaluación interna del propio autor sobre CN-Celeb2, no comparaciones con benchmarks estándar de la literatura.

| Metrica | Paso 400 | Paso 1400 | Paso 1600 (final) |
|---|---|---|---|
| CN-Celeb2 EER, 1 utterance | 24,60 % | 25,10 % | 24,53 % |
| CN-Celeb2 EER, 3 utterances | 21,90 % | 20,70 % | 20,80 % |
| Universal Pooled EER, 1 utterance | no disponible | no disponible | 28,91 % |
| Universal Pooled EER, 3 utterances | no disponible | no disponible | 25,57 % |

El autor indica que la desviación estándar entre semillas 0-2 del EER pooled con 1 utterance es de 0,08-0,41 % absoluto, y que el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. Como referencia externa, el autor cita ECAPA-TDNN sobre VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O y sistemas de menos de 1 M de parámetros con ~2 % EER (EfficientTDNN, 2022), pero advierte que no son comparables porque este checkpoint se entrenó sobre un corpus mucho menor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,08 M de parámetros en fp32 los pesos ocupan aproximadamente 8 MB.
- GPU recomendadas: cualquier GPU con suficiente memoria para el frontend y el batch; el autor entrenó en CPU, por lo que no se documentan requisitos de GPU específicos.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) con JAX/Flax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EER (VoxCeleb1-O) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cn_conformer_small_dr_vectors` | 2,08 M | no disponible | no evaluado; 24,53 % en CN-Celeb2 (1 utt) | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia citada) | no disponible | ~0,9 % | no disponible en la información | Implementaciones en SpeechBrain y otras |
| EfficientTDNN (Wang et al., 2022) | <1 M | no disponible | ~2 % | no disponible en la información | no disponible en la información |

La comparación no es directa: los sistemas de referencia se entrenaron sobre VoxCeleb2-dev (5.994 hablantes, ~1,1 M de enunciados), mientras que este checkpoint usa 119 hablantes y 2.909 enunciados. El propio autor desaconseja tratarlo como estado del arte.

## Limitaciones y advertencias

- Entrenado solo con CN-Celeb2 (119 hablantes, mandarín); el rendimiento en otros idiomas y dominios acústicos no está documentado y probablemente sea pobre.
- EER absoluto elevado (24,53 % con 1 utterance en CN-Celeb2) por la baja diversidad de hablantes del corpus de entrenamiento; no apto para producción sin reentrenamiento.
- No es un producto oficial de Google; es una reimplementación independiente basada en artículos publicados.
- La función de pérdida y la cabeza de scoring se desvían de los artículos originales (variante propia de Extended-Set Softmax, Dr-Vector sin separación base/side-info).
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar de `transformers`.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos/negativos en verificación biométrica; no debe usarse como único factor de autenticación.
- No se documentan sesgos demográficos ni evaluaciones de equidad entre géneros, edades o acentos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento.
- El repositorio es pequeño (0,1 GB) y tiene pocas descargas (114) y ningún "like", lo que sugiere escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/cn_conformer_small_dr_vectors
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
