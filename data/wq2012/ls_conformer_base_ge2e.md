# wq2012/ls_conformer_base_ge2e

## Resumen

`ls_conformer_base_ge2e` es un extractor de embeddings de locutor (speaker embeddings) de 4,55 millones de parámetros, desarrollado por el usuario wq2012 como parte de la biblioteca FlaxSpeaker. Implementa en JAX/Flax una arquitectura Conformer con pooling temporal atento (ATP) y se entrena con la función de pérdida GE2E softmax para producir representaciones de 256 dimensiones que permiten verificar si dos fragmentos de audio pertenecen al mismo hablante mediante similitud coseno. El modelo resuelve la tarea de speaker verification y speaker recognition como `feature-extraction`: recibe audio a 16 kHz y devuelve un vector normalizado por utterance.

La relevancia de este checkpoint es fundamentalmente metodológica y de reproducibilidad: es una reimplementación desde cero, basada únicamente en artículos publicados (GE2E, Dr-Vectors, ATP, PFAS), sin código ni datos propietarios. No obstante, el propio autor advierte que se trata de un checkpoint de convergencia sobre un corpus pequeño (232 hablantes, 5.788 utterances de LibriSpeech) y no de una reproducción a gran escala de los resultados de los papers. Su EER en dominio (12,13 % con 1 utterance y 8,90 % con 3 utterances) está muy lejos de los sistemas industriales entrenados con miles de hablantes, por lo que debe interpretarse como una referencia controlada dentro del benchmark FlaxSpeaker y no como un modelo listo para producción.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y msgpack de Flax, y requiere la versión 0.5.0 o superior de `flaxspeaker`. Su tamaño reducido (repo de 0,1 GB) permite ejecutarlo en CPU, lo que lo hace útil para experimentación, docencia y validación de pipelines de verificación de locutor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`base`) con pooling temporal atento (ATP) |
| Parametros totales | 4.551.558 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa utterances con recortes variables de 90 a 180 frames durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre características acústicas, no sobre texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`) |
| Dimension de embedding | 256 |
| Funcion de perdida | GE2E softmax (Wan et al. 2018, Eq. 6, centroides leave-one-out exactos) |
| Scorer de verificacion | similitud coseno |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16.000 Hz, VAD por energia a nivel de frame y CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Datos de entrenamiento | LibriSpeech únicamente (232 hablantes, 5.788 utterances) |
| Pasos de entrenamiento | 2.600 pasos, batches de 32 utterances (8 hablantes x 4 utterances), ~14,37 epochs, semilla 42 |
| Libreria | flaxspeaker >= 0.5.0 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion `base`, una arquitectura que combina bloques de auto-atencion con convoluciones para capturar dependencias locales y globales en la secuencia acustica. Sobre la salida del encoder se aplica un pooling temporal atento (ATP), tomado del paper de identificación de idioma de referencia, que agrega la secuencia en un unico vector de 256 dimensiones. La cabeza de entrenamiento implementa la pérdida GE2E softmax con centroides leave-one-out exactos, y el repositorio incluye además las cabezas Dr-Vector y PFAS para el scoring. La verificacion en inferencia se realiza por similitud coseno entre embeddings.

El entrenamiento se ejecutó en una estación de trabajo con CPU, semilla 42, durante 2.600 pasos de gradiente con batches de 8 hablantes x 4 utterances (32 utterances por paso), lo que equivale a unas 14,37 épocas sobre las 5.788 utterances de LibriSpeech. Se usaron recortes de longitud variable `U(90, 180)` frames con máscara de validez exacta, y el `config.json` distribuido refleja esa configuración (`variable_length_training: true`). El autor documenta una huella de pérdida en el paso 0 de 2,143 con recortes variables frente a 2,1324 con recortes fijos de 180 frames, lo que confirma la procedencia del checkpoint. La desviación estándar entre semillas 0-2 del EER agrupado con 1 utterance es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades

- Extraccion de embeddings de locutor de 256 dimensiones a partir de audio a 16 kHz, aptos para verificacion e identificacion de hablante.
- Verificacion de locutor mediante similitud coseno entre pares de utterances (1-utt y 3-utt).
- Puntuacion con multiples cabezas: GE2E `w,b`, Dr-Vector y PFAS, incluidas en los pesos.
- Procesamiento de utterances de duracion variable gracias al frontend con VAD por energia y CMVN.
- Inferencia en CPU y en JAX/Flax, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni texto: es exclusivamente un extractor de características acusticas.
- Capacidades multilingues: no disponible; el modelo no modela idioma y se entreno solo con LibriSpeech (ingles).

## Casos de uso

- Verificacion biométrica de locutor en prototipos: comparar el embedding de una utterance de consulta con el de referencia mediante similitud coseno y fijar un umbral a partir de las curvas EER y minDCF publicadas en `eval_results.json`.
- Segmentacion y diarizacion de hablantes en experimentos academicos: extraer embeddings por segmento y agruparlos por similitud coseno para separar voces en una grabacion, asumiendo el limite de 232 hablantes vistos en entrenamiento.
- Validacion de pipelines de audio en JAX/Flax: usar el checkpoint como referencia reproducible para comprobar que un frontend (Mel de 80 dimensiones, VAD, CMVN) y un encoder Conformer producen embeddings estables antes de escalar a corpus mayores.
- Docencia e investigacion en reconocimiento de locutor: estudiar el efecto de la perdida GE2E softmax, el pooling ATP y las cabezas Dr-Vector/PFAS con un modelo pequeno que converge en CPU.
- Control de calidad en la recoleccion de datos de voz: detectar utterances que no coinciden con el hablante declarado en un corpus pequeno comparando embeddings contra una referencia.
- Benchmark interno de modelos de speaker verification: servir como linea base de 4,55 M de parametros contra la que medir modelos mas grandes bajo el mismo protocolo de evaluacion del proyecto FlaxSpeaker.
- Filtrado previo en pipelines de ASR: descartar segmentos de audio que no pertenecen al locutor objetivo antes de transcribir, con la advertencia de que el EER en dominio es del 12,13 % con 1 utterance.

## Benchmarks y rendimiento

Resultados reportados por el autor en `eval_results.json` y en la model card, sobre el split de validacion de LibriSpeech (232 hablantes):

| Metrica | Paso 400 | Paso 2200 (knee) | Paso 2600 (final) |
|---|---|---|---|
| EER 1-utt (LibriSpeech) | 19,77 % | 12,60 % | 12,13 % |
| EER 3-utt (LibriSpeech) | 16,60 % | 8,80 % | 8,90 % |
| EER 1-utt (Universal Pooled) | no disponible | no disponible | 20,32 % |
| EER 3-utt (Universal Pooled) | no disponible | no disponible | 16,73 % |

El repositorio incluye ademas minDCF, ROC-AUC, intervalos de confianza bootstrap del 95 % e resultados sobre un subconjunto de 10 hablantes de VoxCeleb1-O, pero los valores concretos no se detallan en la informacion disponible. Como referencia externa citada por el autor: los sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y los sistemas de menos de 1 M de parametros ~2 % (Wang et al., EfficientTDNN, 2022); estas cifras corresponden a corpus de miles de hablantes y no son comparables directamente con este checkpoint.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32; el modelo tiene 4,55 M de parametros (~18 MB en fp32) y el repo completo ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; el autor lo entreno y evaluo en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobrada para inferencia.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: API Python de `flaxspeaker` (>= 0.5.0) con JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_base_ge2e` (este) | 4,55 M | utterances de audio a 16 kHz, recortes 90-180 frames | 12,13 % 1-utt / 8,90 % 3-utt en LibriSpeech (232 hablantes) | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | no disponible en la informacion | audio | ~0,9 % en VoxCeleb1-O completo | no disponible | referencia bibliografica |
| EfficientTDNN (Wang et al., 2022) | < 1 M | audio | ~2 % (corpus no especificado en la informacion) | no disponible | referencia bibliografica |

La comparacion directa no es valida porque los corpus de entrenamiento y evaluacion difieren en orden de magnitud (232 hablantes frente a 5.994 de VoxCeleb2-dev); el propio autor lo advierte. No se dispone de datos de otros checkpoints de la coleccion FlaxSpeaker en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con LibriSpeech (232 hablantes, 5.788 utterances): la diversidad de hablantes es muy inferior a la de corpus industriales, lo que acota el EER alcanzable y limita la generalizacion a voces no vistas.
- EER en dominio del 12,13 % (1-utt) y 8,90 % (3-utt); en el pool universal sube al 20,32 % y 16,73 %. No es apto para produccion sin validacion especifica.
- El autor declara explicitamente que no es un producto oficial de Google y que no reproduce a gran escala los resultados de los papers de referencia.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenar solo con LibriSpeech (ingles, dominio de lectura), es probable un sesgo hacia acentos y condiciones acusticas de ese corpus, aunque no se cuantifica.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos/negativos en la verificacion, cuantificado por las curvas EER y minDCF.
- Limitaciones de contexto e idioma: el frontend espera audio a 16 kHz con Mel de 80 dimensiones; no es un `AutoFeatureExtractor` de Hugging Face, por lo que requiere `flaxspeaker.AudioFrontend`. No se documenta soporte multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el checkpoint se distribuye sin garantias y con la advertencia de que es un benchmark de corpus pequeno.
- Dependencia de `flaxspeaker >= 0.5.0` y del ecosistema JAX/Flax, lo que puede complicar la integracion en stacks basados en PyTorch.
- Los resultados de benchmarks detallados (minDCF, ROC-AUC, subconjunto VoxCeleb1-O) estan en `eval_results.json` pero no se reproducen en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_conformer_base_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
