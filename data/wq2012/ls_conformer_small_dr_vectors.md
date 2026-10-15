# wq2012/ls_conformer_small_dr_vectors

## Resumen

`ls_conformer_small_dr_vectors` es un modelo de verificacion e identificacion de locutor (speaker verification y speaker embeddings) desarrollado por el usuario wq2012 y distribuido a traves de la libreria open source FlaxSpeaker. Se trata de una reproduccion limpia (clean-room) en JAX/Flax de los algoritmos publicados en GE2E, Dr-Vectors, Conformer-ATP y PFAS, no de un producto oficial de Google. El modelo genera embeddings de locutor de 192 dimensiones y una puntuacion de verificacion a partir de audio.

La arquitectura es un encoder Conformer en variante `small`, con pooling temporal atento (ATP), entrenado con la perdida `extended_set_softmax` y puntuacion de verificacion mediante `dr_vector`. El modelo es muy pequeno: 2.088.007 parametros en el encoder, lo que lo hace apto para despliegue en CPU y en dispositivos con recursos limitados.

Su relevancia actual reside en que ofrece una implementacion reproducible y abierta de tecnicas de verificacion de locutor en el ecosistema JAX, con resultados de evaluacion verificados en tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) y con intervalos de confianza bootstrap publicados. No obstante, su tamano reducido implica tasas de error elevadas, especialmente fuera del dominio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.088.007 (encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa utterances completas; la segmentacion se realiza con VAD energetico previo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack (Flax nativo) |
| Dimension del embedding | 192 |
| Perdida de entrenamiento | extended_set_softmax |
| Puntuacion de verificacion | dr_vector |
| Frontend de audio | log_mel de 80 dimensiones a 16.000 Hz + VAD energetico + CMVN |
| Dominio de entrenamiento | librispeech |
| Libreria | flaxspeaker (JAX/Flax) |

## Arquitectura y entrenamiento

El modelo emplea un encoder Conformer, una arquitectura hibrida que combina convoluciones (para capturar patrones locales en la secuencia espectral) con auto-atencion (para dependencias globales). La variante `small` reduce el numero de capas y la anchura de las mismas hasta los 2.088.007 parametros del encoder. El pooling temporal es de tipo ATP (attentive temporal pooling), lo que permite agregar la secuencia temporal en un unico vector de embedding de 192 dimensiones ponderando los fragmentos mas informativos.

El entrenamiento utiliza la perdida `extended_set_softmax` y el modelo se enmarca en el dominio de LibriSpeech. La puntuacion de verificacion se realiza mediante `dr_vector` (decision residual), segun el enfoque publicado en Dr-Vectors. El frontend de audio aplica un log-mel de 80 dimensiones a 16 kHz, seguido de un VAD energetico y normalizacion CMVN. El modelo es una reproduccion independiente: los experimentos originales de los papers citados se realizaron con infraestructura y datos internos de Google, no con este checkpoint ni con los splits publicos empleados aqui. No se especifica en la informacion disponible el numero exacto de tokens o horas de audio utilizados ni si se aplicaron fases de RLHF o DPO (tecnicas poco habituales en verificacion de locutor).

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificacion de locutor (1:1): comparacion de dos utterances para determinar si pertenecen al mismo hablante.
- Identificacion de locutor (1:N): busqueda del hablante mas probable en un conjunto de embeddings de referencia.
- Verificacion con multiples enrolamientos (3-utterance multi-enrollment), que reduce la EER respecto al escenario de un solo utterance.
- Compatibilidad con el extractor de caracteristicas estilo `WhisperFeatureExtractor` para el preprocesado.
- API Python (`load_pretrained`, `extract_embedding`, `verify`) e inferencia por linea de comandos mediante `scripts/inference.py`.
- Ejecucion en JAX/Flax, con pesos disponibles tanto en safetensors como en el formato nativo msgpack.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido (thinking mode). Es un modelo exclusivamente discriminativo de locutor.

## Casos de uso

- Autenticacion por voz en atencion telefonica: verificacion 1:1 entre el utterance de enrolamiento y la locucion entrante para validar la identidad declarada por el cliente antes de operar en banca o seguros.
- Etiquetado de hablantes en transcripciones: extraccion de embeddings por segmento y clustering para asignar hablantes a cada turno en reuniones o entrevistas grabadas.
- Indexado y busqueda por locutor en archivos de audio: generacion de embeddings de una fonoteca completa y busqueda por similitud para localizar todas las apariciones de una persona.
- Analitica de contact center: agrupacion de llamadas por agente o por cliente mediante similitud de embeddings, para medir tiempos de habla y tasa de resolucion por operador.
- Moderacion y control parental: comparacion de la voz de un menor o de un usuario concreto contra voces no autorizadas en plataformas de audio o asistentes.
- Investigacion y reproduccion de resultados: base para comparar perdidas, pooling y estrategias de scoring en JAX sin depender de infraestructura propietaria, dado que el checkpoint es abierto y ligero.
- Preprocesado para VAD personalizado: el embedding de locutor puede alimentar variantes de VAD condicionado por hablante, en la linea de otros trabajos del mismo autor.

## Benchmarks y rendimiento

Los resultados de evaluacion verificados se publican en `eval_results.json` y se reproducen a continuacion. Las metricas corresponden a EER (%), minDCF a dos umbrales y ROC-AUC.

Verificacion con un unico utterance:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 11,17 | [9,87; 12,20] | 0,9187 | 0,5340 | 0,9565 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,80 | [27,28; 30,40] | 0,9960 | 0,9207 | 0,7933 |
| VoxCeleb1 (celebridades en condiciones reales) | 2.000 | 22,30 | [20,72; 24,43] | 0,9850 | 0,9370 | 0,8524 |
| Universal agrupado (3 dominios) | 8.000 | 20,69 | [19,82; 21,60] | 0,9925 | 0,8147 | 0,8784 |
| Universal media macro (3 dominios) | 8.000 | 20,76 | no disponible | 0,9666 | 0,7972 | 0,8674 |

Verificacion con tres utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 6,20 | [4,80; 7,80] | 0,3980 | 0,9851 |
| CN-Celeb2 (3-utt) | 1.000 | 24,00 | [21,40; 26,15] | 0,9240 | 0,8445 |
| VoxCeleb1 (3-utt) | 1.000 | 19,60 | [17,05; 21,80] | 0,9780 | 0,8880 |
| Universal agrupado (3-utt) | 3.000 | 16,60 | [15,33; 17,82] | 0,9607 | 0,9157 |
| Universal media macro (3-utt) | 3.000 | 16,60 | no disponible | 0,7667 | 0,9059 |

No se han publicado en la informacion disponible comparaciones directas con otros modelos en las mismas condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,4 MB en precision fp32 y 4,2 MB en bf16/fp16 para los pesos del encoder, mas el coste del frontend log-mel y de los buffers intermedios, que depende de la duracion del audio.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes.
- Cabe sin problemas en GPU de consumo y tambien en CPU, dado el reducido numero de parametros. Es viable en dispositivos embebidos.
- Opciones de despliegue: libreria `flaxspeaker` (Python, JAX/Flax) y el script `scripts/inference.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo de inferencia ni de utterances por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Metricas publicadas en la informacion disponible |
|---|---|---|---|---|
| wq2012/ls_conformer_small_dr_vectors | Conformer + ATP + dr_vector (JAX/Flax) | 2.088.007 | Apache 2.0 | EER 11,17% (LibriSpeech 1-utt), 20,69% (universal 1-utt) |
| SpeechBrain spkrec-ecapa-voxceleb | ECAPA-TDNN (PyTorch) | no disponible | no disponible | no disponible |
| pyannote/embedding | Red de embeddings de locutor (PyTorch) | no disponible | no disponible | no disponible |
| WeSpeaker ResNet34-LM | ResNet + attentive statistics pooling | no disponible | no disponible | no disponible |

Las tres alternativas se citan por ser referencias habituales en verificacion de locutor, pero no se dispone en la informacion proporcionada de sus especificaciones ni de resultados comparables bajo el mismo protocolo de evaluacion, por lo que los valores se marcan como no disponibles. Cualquier comparacion cuantitativa exigiria reejecutar la evaluacion con protocolos identicos.

## Limitaciones y advertencias

- Rendimiento limitado: con 2.088.007 parametros, la EER en el dominio de entrenamiento (LibriSpeech) es del 11,17% y sube al 20,69% en la agrupacion universal de tres dominios. Es un modelo pequeno, no competitivo con sistemas de verificacion de gran escala.
- Degradacion fuera de dominio: la EER alcanza el 28,80% en CN-Celeb2 (chino multigenero) y el 22,30% en VoxCeleb1, muy por encima del dominio de entrenamiento. La generalizacion entre idiomas y condiciones acusticas no esta garantizada.
- Intervalos de confianza amplios: el IC bootstrap del 95% en LibriSpeech 1-utt es [9,87; 12,20], lo que refleja una incertidumbre considerable en la estimacion.
- Sesgos conocidos: no se documenta ningun analisis de sesgo por genero, edad, acento o variacion dialectal. La ausencia de este analisis es un riesgo para despliegues en produccion.
- Riesgo de falsos positivos y falsos negativos: los valores de minDCF son altos (0,9187 en LibriSpeech 1-utt a umbral 0,01), lo que implica un coste elevado en escenarios de seguridad con umbrales estrictos.
- Ausencia de contramedidas anti-spoofing: no se documenta proteccion frente a ataques de reproduccion (replay), voz sintetizada o conversion de voz. No debe usarse como unico factor de autenticacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia. El autor declara explicitamente que no es un producto oficial de Google.
- Idiomas soportados: no disponibles; el entrenamiento se realizo en LibriSpeech (ingles), y los resultados en chino y en audio en condiciones reales son notablemente peores.
- Trazabilidad metodologica: es una reproduccion independiente, por lo que los resultados no son directamente equiparables a los de los papers originales, que usaron datos e infraestructura internos de Google.
- Cuantizacion: no se documentan pesos cuantizados ni recetas de cuantizacion; solo se ofrecen safetensors y msgpack en precision nativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_dr_vectors
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Repositorio wav2x del mismo autor: https://github.com/wq2012/wav2x
- Modelo relacionado personal-vad-v2-conformer-unified: https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- Modelo relacionado personal-vad-v2-conformer-film-dvector: https://huggingface.co/wq2012/personal-vad-v2-conformer-film-dvector
