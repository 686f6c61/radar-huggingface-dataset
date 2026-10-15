# wq2012/ls_conformer_small_triplet

## Resumen

ls_conformer_small_triplet es un checkpoint de verificación e identificación de hablante publicado por wq2012 (Quan Wang) en Hugging Face. No es un modelo generativo de texto: a partir de una utterance de audio produce un embedding de 192 dimensiones que puede compararse mediante similitud coseno para decidir si dos fragmentos pertenecen al mismo hablante. Su backbone es un Conformer de configuración small con 2.029.892 parámetros en el encoder, pooling temporal atento (ATP) y entrenamiento con pérdida triplet.

El modelo forma parte de FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), pero no es un producto oficial de Google. Su relevancia actual está en ofrecer una alternativa ligera, con licencia Apache-2.0, para tareas de verificación de hablante en entornos con pocos recursos, así como una base reproducible para investigación. La model card reporta evaluación multi-dominio en LibriSpeech, CN-Celeb2 y VoxCeleb1, con EER de 16,07% a 28,93% en verificación de 1 utterance, lo que indica un rendimiento útil como baseline pero lejos de sistemas de producción de altas prestaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer small con pooling temporal atento (ATP) |
| Parámetros totales | 2.029.892 (encoder) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; modelo de embeddings de audio por utterance, sin ventana de tokens. Frontend de 80-dim log-mel a 16 kHz + Energy VAD + CMVN |
| Tipos de cuantización | no disponible; no se documentan técnicas de cuantización. Pesos en safetensors y Flax msgpack |
| Idiomas soportados | no disponible; evaluado en inglés (LibriSpeech, VoxCeleb1) y chino (CN-Celeb2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y flax_model.msgpack |
| Tarea principal | verificación/identificación de hablante; pipeline audio-classification |
| Dimensión de embedding | 192 |
| Pérdida de entrenamiento | triplet |
| Scoring de verificación | coseno |
| Dominio de entrenamiento | librispeech |
| Frontend de audio | 80-dim log-mel a 16 kHz + Energy VAD + CMVN |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración small. Conformer combina convoluciones y self-attention para modelar secuencias de audio; en este caso, el modelo usa ATP para agregar la secuencia temporal en un embedding de hablante de 192 dimensiones. La verificación se realiza con scoring coseno y la pérdida de entrenamiento es triplet. El frontend de audio es un extractor de 80-dim log-mel a 16 kHz, con VAD de energía y CMVN, compatible con WhisperFeatureExtractor según la configuración incluida.

Según la model card, el dominio de entrenamiento es librispeech. Los tags incluyen librispeech_asr, cnceleb y voxceleb; la evaluación multi-dominio se realiza en LibriSpeech (inglés leído), CN-Celeb2 (chino multigénero) y VoxCeleb1 (celebridades in-the-wild). No se menciona RLHF/DPO ni decodificación especulativa, ya que no aplica a este tipo de modelo. La implementación es una reproducción clean-room en JAX/Flax de GE2E, Dr-Vectors, Conformer-ATP y PFAS.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio.
- Verificación de hablante: compara dos utterances con similitud coseno.
- Identificación/reconocimiento de hablante: puede usarse para clasificar una utterance contra un conjunto de embeddings enrolados.
- Verificación multi-enrolamiento: la model card reporta resultados con 3 utterances.
- Clasificación de audio mediante pipeline audio-classification.
- Preprocesado integrado: 80-dim log-mel, VAD de energía y CMVN.
- Evaluación cross-domain en inglés y chino.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio generativo, tool calling ni agentes.
- No se documenta modo thinking ni capacidades multimodales.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de acceso: enrolar una o varias muestras y aceptar o rechazar con umbral coseno; adecuado para prototipos y entornos de baja criticidad, no para seguridad fuerte por su EER.
- Investigación en reconocimiento de hablante: baseline reproducible en JAX/Flax para comparar pérdidas, pooling y arquitecturas.
- Indexado y búsqueda de audio por hablante: extraer embeddings de archivos y agrupar o clusterizar por similitud.
- Diarización y segmentación asistida: generar embeddings por segmento y agrupar turnos de hablante en reuniones o podcasts.
- Personalización de asistentes de voz: identificar al usuario para adaptar respuestas o permisos en dispositivos con recursos limitados.
- Detección de fraude en centros de contacto: comparar la voz del interlocutor con embeddings de clientes conocidos, con revisión humana por los falsos positivos.
- Análisis de archivos multimedia: etiquetar automáticamente hablantes en archivos de audio o vídeo.
- Enrolamiento multi-utterance: usar 3 utterances para mejorar la robustez en dominios como VoxCeleb1 o CN-Celeb2.
- Despliegue en edge o CPU: por su tamaño de 2,03 M de parámetros, puede ejecutarse en CPU o GPUs de gama baja.

## Benchmarks y rendimiento

**Verificación de 1 utterance**

| Conjunto | Ensayos | EER (%) | IC bootstrap 95% (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech (inglés leído) | 3.000 | 16,07 | [14,68; 17,30] | 0,9793 | 0,7447 | 0,9227 |
| CN-Celeb2 (chino multigénero) | 3.000 | 28,93 | [27,47; 30,80] | 0,9860 | 0,9413 | 0,7843 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 22,00 | [20,25; 24,08] | 0,9520 | 0,8950 | 0,8547 |
| Universal pooled (3 dominios) | 8.000 | 23,41 | [22,55; 24,28] | 0,9885 | 0,8640 | 0,8536 |
| Universal macro-average (3 dominios) | 8.000 | 22,33 | — | 0,9724 | 0,8603 | 0,8539 |

**Verificación multi-enrolamiento con 3 utterances**

| Conjunto | Ensayos | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0,01 | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| LibriSpeech (3-utt) | 1.000 | 13,50 | [11,05; 15,60] | 0,7500 | 0,9487 |
| CN-Celeb2 (3-utt) | 1.000 | 25,20 | [22,70; 28,25] | 0,9500 | 0,8295 |
| VoxCeleb1 (3-utt) | 1.000 | 20,20 | [17,40; 22,60] | 0,9680 | 0,8891 |
| Universal pooled (3-utt) | 3.000 | 19,80 | [18,38; 21,32] | 0,9207 | 0,8913 |
| Universal macro-average (3-utt) | 3.000 | 19,63 | — | 0,8893 | 0,8891 |

No se han publicado resultados de benchmarks generativos tipo MMLU, HumanEval o GSM8K en la información disponible; no aplican a este modelo.

## Requisitos de hardware

- Modelo de 2.029.892 parámetros. Peso estimado: FP32 ~8,1 MB; FP16/BF16 ~4,1 MB.
- VRAM para inferencia: baja; con utterances cortos y batch pequeño, el uso típico está dominado por activaciones y buffers de audio, no por los pesos. No se dispone de medidas oficiales de VRAM pico.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o GTX 1650 puede ser suficiente; también CPU.
- Cabe en GPU consumer: sí.
- Opciones de despliegue: librería flaxspeaker (JAX/Flax), API Python load_pretrained, script scripts/inference.py, pesos safetensors y flax_model.msgpack. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponible en la información proporcionada.
- Requisitos de audio: 16 kHz, frontend de 80-dim log-mel, VAD de energía y CMVN.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados con alternativas en la información proporcionada. Los papers citados describen métodos relacionados, pero no una comparativa directa con este checkpoint. Como referencia de categoría, los sistemas de embeddings de hablante habituales incluyen ECAPA-TDNN, x-vectors/ResNet y modelos de WeSpeaker o pyannote; no se dispone de parámetros, contexto, rendimiento, licencia ni disponibilidad de estos en la búsqueda.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| ls_conformer_small_triplet | 2.029.892 | no aplica | EER 1-utt 16,07-28,93% según dominio; EER 3-utt 13,50-25,20% | Apache-2.0 | Hugging Face |
| ECAPA-TDNN (referencia de categoría) | no disponible | no aplica | no disponible | no disponible | no disponible |
| x-vector/ResNet (referencia de categoría) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Conformer-ATP original (Google) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- EER elevado para producción: 16,07% en LibriSpeech 1-utt, 22,00% en VoxCeleb1 y 28,93% en CN-Celeb2. No apto para autenticación de alta seguridad sin factores adicionales.
- minDCF alto en varios dominios (0,7447-0,9885 en 1-utt), lo que indica errores costosos en umbrales de operación.
- El multi-enrolamiento mejora el EER (13,50% LibriSpeech, 20,20% VoxCeleb1, 25,20% CN-Celeb2), pero sigue siendo limitado.
- Modelo pequeño (2,03 M de parámetros) y entrenado en dominio librispeech; puede degradarse en ruido, reverberación, telefonía o idiomas no vistos.
- Idiomas no declarados oficialmente: solo se reportan evaluaciones en inglés y chino; el comportamiento en otras lenguas no está documentado.
- Sesgos potenciales asociados a LibriSpeech (habla leída), VoxCeleb1 (celebridades, in-the-wild) y CN-Celeb2 (chino multigénero).
- No es un producto oficial de Google; es una reproducción clean-room independiente, sin soporte oficial.
- Licencia Apache-2.0: permite uso comercial, pero se debe revisar el cumplimiento de dependencias y citar los papers correspondientes.
- No hay cuantizaciones documentadas ni soporte GGUF; el despliegue está ligado a JAX/Flax y flaxspeaker.
- No aplica el riesgo de alucinación de modelos generativos, pero sí existen falsos positivos y falsos negativos en verificación.
- Dependencia del VAD de energía y CMVN; el rendimiento puede variar con la segmentación.
- No se especifica longitud máxima de audio; utterances muy largas pueden afectar el pooling.
- Los resultados proceden de eval_results.json de la model card; no se han verificado de forma independiente.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es nula.

## Enlaces

- https://huggingface.co/wq2012/ls_conformer_small_triplet
- https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- https://github.com/wq2012/FlaxSpeaker
- https://pypi.org/project/flaxspeaker/
- https://arxiv.org/abs/1710.10467
- https://arxiv.org/abs/2104.01989
- https://arxiv.org/abs/2202.12163
- https://arxiv.org/abs/2203.05642v3
- https://github.com/wq2012
- https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
- https://github.com/wq2012/wav2x/tree/main/models
- https://www.emergentmind.com/topics/conformer-model
- https://huggingface.co/speechbrain/asr-conformersmall-transformerlm-librispeech
