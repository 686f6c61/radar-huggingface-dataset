# wq2012/univ_conformer_small_ext_softmax

## Resumen

`univ_conformer_small_ext_softmax` es un modelo de verificación e identificación de locutor (speaker verification/recognition) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos de reconocimiento de hablante descritos en las publicaciones GE2E, Dr-Vectors, Conformer-ATP y PFAS. El modelo no es un producto oficial de Google: la propia model card aclara que se trata de una implementación "clean-room" independiente y que los experimentos originales de esos papers se hicieron con infraestructura y datos internos propietarios.

Se trata de un encoder Conformer de tamano "small" con 2.029.894 parametros, pooling temporal atento (ATP) y una cabeza de entrenamiento con perdida Extended Set Softmax, que produce embeddings de locutor de 192 dimensiones comparables mediante similitud coseno. El frontend de audio es un extractor compatible con WhisperFeatureExtractor: log-mel de 80 dimensiones a 16 kHz, con deteccion de actividad de voz (VAD) por energia y normalizacion CMVN.

Su relevancia es acotada pero clara: ocupa el nicho de los modelos de speaker embedding ultraligeros (unos 8 MB en fp32) que caben en cualquier CPU o GPU de consumo y que pueden ejecutarse en pipelines de audio a gran escala. El entrenamiento se declara como "universal" y la evaluacion cubre tres dominios distintos (LibriSpeech en ingles leido, CN-Celeb2 en chino multigenero y VoxCeleb1 in-the-wild), con resultados de EER que reflejan su tamano reducido mas que un estado del arte competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer "small" + pooling temporal atento (ATP) + cabeza de perdida Extended Set Softmax |
| Parametros totales | 2.029.894 (parametros del encoder, segun safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica; entrada de audio de longitud variable con pooling temporal atento. Frontend: log-mel de 80 dimensiones a 16 kHz + VAD por energia + CMVN |
| Tipos de cuantizacion | No disponible (solo se publican pesos nativos safetensors y msgpack de Flax; no hay versiones GGUF, INT8 ni AWQ) |
| Idiomas soportados | No declarados explicitamente en la model card; evaluado en ingles (LibriSpeech), chino (CN-Celeb2) y habla in-the-wild multilingue (VoxCeleb1). El embedding de locutor es, por diseno, agnostico al idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y msgpack nativo de Flax (`flax_model.msgpack`); incluye `config.json`, `preprocessor_config.json` y `eval_results.json` |
| Dimension del embedding de salida | 192 |
| Puntuacion de verificacion | Similitud coseno |
| Dominio de entrenamiento | "universal" |
| Datasets de entrenamiento/evaluacion | librispeech_asr, cnceleb, voxceleb |
| Metricas declaradas | EER, minDCF, ROC-AUC |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline de HuggingFace | audio-classification |

## Arquitectura y entrenamiento

El backbone es un Conformer, la arquitectura que combina bloques de transformer con convoluciones depthwise para capturar simultaneamente dependencias globales y patrones locales en la secuencia de frames acusticos. En esta variante "small" el encoder completo suma apenas 2.029.894 parametros, lo que lo situa muy por debajo de los modelos habituales de speaker verification basados en ECAPA-TDNN o en transformers de gran tamano. Sobre la salida del encoder se aplica un pooling temporal atento (ATP, Attentive Temporal Pooling), el mecanismo descrito en el trabajo Conformer-ATP para agregar la secuencia completa en un unico vector de utterance, que en este caso tiene 192 dimensiones.

El entrenamiento sigue las lineas de GE2E (Generalized End-to-End Loss) y de Dr-Vectors (Decision Residual Networks), con la perdida Extended Set Softmax como funcion de entrenamiento (equivalente a la familia de perdidas de clasificacion por conjunto extendido) y similitud coseno como criterio de puntuacion en verificacion. El frontend procesa audio a 16 kHz con caracteristicas log-mel de 80 dimensiones, aplica VAD por energia y normaliza con CMVN antes de alimentar al encoder. Los datos de entrenamiento y evaluacion citados son LibriSpeech (ingles leido), CN-Celeb2 (chino, multiples generos) y VoxCeleb1 (habla in-the-wild de celebridades), y el modelo se presenta como de dominio "universal". No se documentan en la informacion disponible el numero total de tokens o de horas de audio empleadas, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en este tipo de modelo).

## Capacidades

- Extraccion de embeddings de locutor: genera un vector de 192 dimensiones por utterance a partir de audio a 16 kHz.
- Verificacion de locutor (1:1): compara dos audios mediante similitud coseno y devuelve una puntuacion de similitud.
- Multi-enrolamiento: soporta verificacion con 3 utterances de enrolamiento, con mejora clara de EER respecto al escenario de 1 utterance.
- Identificacion de locutor (1:N): los embeddings permiten clustering e indexado para tareas de diarizacion y busqueda por locutor.
- Funcionamiento multilingue de facto: evaluado en ingles y chino, y con habla in-the-wild multilingue en VoxCeleb1; el embedding no depende de transcripcion ni de idioma.
- Extraccion de caracteristicas robusta a duracion variable gracias al pooling temporal atento.
- Inferencia en CPU y GPU via JAX/Flax, con API Python (`flaxspeaker.load_pretrained`) y script de linea de comandos (`scripts/inference.py`).
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento: es exclusivamente un encoder discriminativo de locutor.

## Casos de uso

- Verificacion biométrica de voz en atencion telefonica: el modelo permite comparar la voz del cliente con una grabacion de enrolamiento previa en pocos milisegundos, con un coste computacional minimo que hace viable ejecutarlo en el propio servidor de telefonia sin GPUs dedicadas.
- Autenticacion adicional en banca o administracion publica: como segundo factor biometrico junto a contrasena o SMS, usando el score de similitud coseno con umbral calibrado. Conviene combinarlo con otras senales dado su EER en el rango del 15-25 % en 1 utterance.
- Diarizacion de hablantes en transcripciones: extrayendo un embedding cada pocos segundos y aplicando clustering (por ejemplo, k-means o agglomerative), se puede etiquetar quien habla en reuniones, podcasts o llamadas, con una mejora notable si se agregan varios segmentos por locutor (3-utt EER del 16,17 % agregado).
- Indexado y busqueda de archivos de audio por locutor: generar embeddings para un archivo de medios completo y construir un indice vectorial para localizar todas las intervenciones de una persona concreta.
- Personalizacion de asistentes de voz: identificar al usuario registrado para adaptar el tono, el idioma o los permisos de la sesion sin necesidad de autenticacion explicita.
- Filtrado y curación de datasets de ASR: agrupar y separar hablantes en corpus de audio para garantizar diversidad de voces o eliminar duplicados de la misma persona antes de entrenar modelos de reconocimiento de habla.
- Deteccion de locutores recurrentes en plataformas de contenido generado por usuarios: para moderacion, deteccion de cuentas duplicadas o analitica de creadores, gracias al bajo coste de procesar grandes volumenes de audio.
- Analisis forense de audio a pequena escala: comparacion de grabaciones dubitadas e indubitadas como apoyo, siempre con supervision humana y asumiendo el EER publicado.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluaciones de verificacion por dominio. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K porque el modelo no es de lenguaje.

Verificacion con 1 utterance:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,83 | [13,60, 16,15] | 0,9447 | 0,7840 | 0,9244 |
| CN-Celeb2 (chino multigenero) | 3.000 | 22,40 | [21,03, 23,97] | 0,9967 | 0,9007 | 0,8495 |
| VoxCeleb1 (in-the-wild) | 2.000 | 23,30 | [21,30, 25,55] | 0,9490 | 0,9040 | 0,8557 |
| Universal pooled (3 dominios) | 8.000 | 20,50 | [19,64, 21,26] | 0,9912 | 0,8795 | 0,8808 |
| Universal macro-average | 8.000 | 20,18 | No disponible | 0,9635 | 0,8629 | 0,8765 |

Verificacion con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 9,80 | [8,00, 11,80] | 0,7720 | 0,9667 |
| CN-Celeb2 (3-utt) | 1.000 | 18,80 | [16,70, 21,40] | 0,9660 | 0,8952 |
| VoxCeleb1 (3-utt) | 1.000 | 19,90 | [17,40, 22,35] | 0,9540 | 0,8949 |
| Universal pooled (3-utt) | 3.000 | 16,17 | [14,98, 17,53] | 0,9593 | 0,9217 |
| Universal macro-average (3-utt) | 3.000 | 16,17 | No disponible | 0,8973 | 0,9189 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 MB en fp32 (2.029.894 parametros x 4 bytes) y unos 4 MB en fp16, sin contar buffers de activaciones ni el frontend de caracteristicas, que son despreciables frente a los pesos.
- GPU recomendadas: cualquier GPU, incluso integradas o de gama de entrada. No requiere A100, H100 ni RTX 4090; una GTX 1050 o una iGPU moderna es mas que suficiente.
- Cabe sobradamente en GPU de consumo: si, en cualquier GPU consumer actual y en la mayoria de CPUs modernas. El cuello de botella real es la decodificacion de audio y el calculo de log-mel, no la red.
- Opciones de despliegue: la libreria `flaxspeaker` (JAX/Flax) con carga desde Hugging Face Hub, el script `scripts/inference.py`, o una carga manual de `model.safetensors` / `flax_model.msgpack`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos GGUF y el modelo no es generativo.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni de utterances por segundo. Dado el tamano del modelo, en CPU se espera un coste dominado por el frontend de audio.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones directas de EER entre este modelo y alternativas sobre los mismos trials, por lo que la columna de rendimiento se deja como "no disponible". La comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| univ_conformer_small_ext_softmax (este modelo) | 2.029.894 | Audio de longitud variable, embedding de 192 dim. | Apache 2.0 | Hugging Face, libreria flaxspeaker (JAX/Flax) | EER 1-utt del 14,83-23,30 % segun dominio |
| ECAPA-TDNN (SpeechBrain, spkrec-ecapa-voxceleb) | No disponible en la informacion proporcionada | Audio de longitud variable | Apache 2.0 | Hugging Face, SpeechBrain | No disponible |
| NVIDIA TitaNet | No disponible en la informacion proporcionada | Audio de longitud variable | Licencia especifica de NVIDIA | NGC / Hugging Face | No disponible |
| WavLM (variantes para speaker verification) | No disponible en la informacion proporcionada | Audio de longitud variable | MIT | Hugging Face, repositorios de investigacion | No disponible |

Criterio cualitativo: este modelo es entre uno y dos ordenes de magnitud mas pequeno que las alternativas tipicas de speaker verification, lo que lo hace adecuado para despliegue masivo en CPU, pero con una tasa de error muy superior a la de los sistemas basados en ECAPA-TDNN o WavLM entrenados a gran escala.

## Limitaciones y advertencias

- Tasa de error elevada para produccion de alta seguridad: EER del 14,83 % en LibriSpeech y del 22,40-23,30 % en CN-Celeb2 y VoxCeleb1 con 1 utterance. Incluso con 3 utterances, el EER agregado es del 16,17 %. No es comparable al estado del arte en verificacion de locutor.
- Sesgo de dominio: el modelo se evalua en habla leida en ingles, habla china multigenero y celebridades in-the-wild. El rendimiento en audio telefonico de banda estrecha, entornos con ruido o reverberacion, o idiomas distintos de los citados no esta documentado y probablemente sea peor.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo produce embeddings y puntuaciones; el riesgo equivalente es producir un score alto entre locutores distintos (falsa aceptacion), especialmente en audio corto o degradado.
- Sin evaluacion anti-spoofing: no hay datos publicados sobre resistencia a voces sinteticas, deepfakes o reproduccion de grabaciones, por lo que no es adecuado como unico factor de autenticacion.
- Umbral de decision no calibrado: los valores de minDCF son elevados (0,77-0,99 segun dominio y operacion), lo que indica que la calibracion del umbral debe hacerse por dominio antes de cualquier uso real.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero la model card advierte explicitamente de que no es un producto oficialmente soportado por Google ni derivado de su infraestructura interna; los papers citados se basan en datos propietarios no reproducibles.
- Madurez ecosistemica muy baja: repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria y soporte limitado.
- Formatos limitados: no hay pesos GGUF, ONNX ni TensorRT publicados, lo que restringe las opciones de despliegue a entornos JAX/Flax o a una conversion manual.
- Metadatos con fechas inusuales: la fecha de creacion y actualizacion registrada es 2026-10-15, posterior a la fecha habitual de publicacion de modelos; conviene verificarlo antes de citar el modelo.
- Dependencia del frontend: la calidad del embedding depende del preprocesado (log-mel de 80 dimensiones a 16 kHz, VAD por energia, CMVN); cambiar el frontend invalida las metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ext_softmax
- Coleccion FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor, Personal VAD 2.0: https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Implementacion de referencia de Conformer en PyTorch (no oficial): https://github.com/sooftware/conformer/blob/main/conformer/model.py
- NVIDIA stt_en_conformer_ctc_small (Conformer para ASR, contexto arquitectonico): https://huggingface.co/nvidia/stt_en_conformer_ctc_small
