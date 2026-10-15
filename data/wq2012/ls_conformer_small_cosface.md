# wq2012/ls_conformer_small_cosface

## Resumen

`ls_conformer_small_cosface` es un checkpoint de verificación e identificación de locutor (speaker verification / speaker embeddings) publicado por el usuario wq2012 dentro de la colección FlaxSpeaker. No es un modelo de lenguaje generativo: su salida es un embedding de 192 dimensiones por utterance, y la decisión de verificación se toma mediante similitud coseno entre embeddings. Está implementado en JAX/Flax y se distribuye con pesos en SafeTensors y en el formato nativo msgpack de Flax.

El modelo combina un encoder Conformer de tamaño "small" (2.029.892 parámetros de encoder) con pooling temporal atento (ATP, Attentive Temporal Pooling) y entrenamiento con la pérdida CosFace. El frontend de audio es un extractor log-mel de 80 dimensiones a 16 kHz con VAD por energía y normalización CMVN, compatible con `WhisperFeatureExtractor`. El entrenamiento se realizó sobre el dominio LibriSpeech (inglés leído), y la evaluación publicada cubre además CN-Celeb2 (chino multi-género) y VoxCeleb1 (inglés in-the-wild).

Su relevancia es doble. Por un lado, es una reproducción open source limpia ("clean-room") en JAX/Flax de algoritmos publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS) cuyos experimentos originales usaron infraestructura y datos internos no públicos. Por otro, con ~2 millones de parámetros es un modelo extremadamente ligero que puede ejecutarse en CPU o en hardware de borde, lo que lo hace útil para prototipado, investigación reproducible y pipelines embebidos. Con 0 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer "small" con pooling temporal atento (ATP); scoring por similitud coseno |
| Parametros totales | 2.029.892 (parametros de encoder, dato de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se declara duración máxima de audio; el frontend usa log-mel de 80 dimensiones a 16 kHz con Energy VAD y CMVN) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no se declara listado de idiomas; entrenamiento en LibriSpeech, inglés leído, y evaluación sobre CN-Celeb2 y VoxCeleb1) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y msgpack nativo de Flax (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Pooling temporal | ATP (attentive temporal pooling) |
| Pérdida de entrenamiento | CosFace |
| Métrica de verificación | similitud coseno |
| Dominio de entrenamiento | librispeech |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + Energy VAD + CMVN (compatible con `WhisperFeatureExtractor`) |
| Librería | flaxspeaker (JAX/Flax) |
| Pipeline declarado | audio-classification |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuración "small" que actúa como extractor de representaciones sobre tramas log-mel de 80 dimensiones a 16 kHz. Sobre las representaciones del encoder se aplica un pooling temporal atento (ATP) que agrega la secuencia en un único vector de 192 dimensiones por utterance. El entrenamiento utiliza la pérdida CosFace, una softmax normalizada con margen aditivo en el espacio hipsférico que incrementa la discriminación entre locutores. En inferencia, la verificación se realiza comparando dos embeddings con similitud coseno, siguiendo el enfoque de scoring atento sin parámetros (PFAS) descrito en la documentación del proyecto. El backend está implementado en JAX/Flax y los parámetros se serializan tanto en SafeTensors como en msgpack nativo.

El checkpoint es una reproducción open source independiente de cuatro trabajos publicados: GE2E, Dr-Vectors, Conformer-ATP y PFAS. El autor indica explícitamente que los experimentos de esos artículos se realizaron con infraestructura y datasets internos propietarios de Google, no con esta librería ni con los splits públicos. El modelo se entrenó sobre el dominio LibriSpeech y fue evaluado en tres dominios distintos (LibriSpeech, CN-Celeb2 y VoxCeleb1), con métricas de EER, minDCF y ROC-AUC acompañadas de intervalos de confianza bootstrap al 95 %. No se especifican en la información disponible el número total de tokens o horas de audio, la composición exacta del dataset ni si se aplicaron etapas de ajuste adicionales.

## Capacidades

- Extracción de embeddings de locutor: genera un vector de 192 dimensiones por utterance mediante `model.extract_embedding(...)`.
- Verificación de locutor (1:1): compara un audio de enrolamiento y uno de test con similitud coseno mediante `model.verify(...)`.
- Verificación con múltiples enrolamientos: los resultados publicados incluyen evaluación con 3 utterances de enrolamiento, con mejora consistente del EER (por ejemplo, de 14,13 % a 10,80 % en LibriSpeech).
- Reconocimiento de locutor (1:N): los embeddings pueden usarse para búsqueda e identificación dentro de un conjunto cerrado de locutores.
- Robustez multi-dominio evaluada: inglés leído (LibriSpeech), chino multi-género (CN-Celeb2) e inglés in-the-wild (VoxCeleb1), aunque con degradación notable fuera del dominio de entrenamiento.
- Procesamiento de audio de formato largo mediante streaming: el pooling atento procede de trabajos orientados a streaming, aunque la información disponible no detalla el modo de streaming en esta implementación.
- Interfaz de línea de comandos incluida en el repositorio GitHub (`scripts/inference.py`) además de la API de Python.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, capacidades de agente ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Control de acceso por voz: enrolamiento de un locutor con una o varias grabaciones y verificación biométrica en el momento de autenticación. El modelo es adecuado por su tamaño reducido (2 M de parámetros) y por la disponibilidad de una ruta de enrolamiento multi-utterance que reduce el EER publicado de 14,13 % a 10,80 % en inglés leído.
- Diarización y etiquetado de hablantes: extracción de embeddings por segmento y agrupamiento posterior para asignar turnos de palabra en transcripciones de reuniones o entrevistas. El embedding de 192 dimensiones es suficientemente compacto para clustering a gran escala.
- Indexado y búsqueda de archivos de audio por voz: generación de embeddings para un archivo histórico de grabaciones y búsqueda por similitud coseno para localizar intervenciones de un locutor concreto.
- Verificación de identidad en atención telefónica: comprobación complementaria de que quien llama coincide con el titular registrado, usando la puntuación coseno como señal auxiliar dentro de un sistema antifraude más amplio.
- Preprocesado para pipelines de ASR: enriquecer sistemas de reconocimiento de voz con etiquetas de locutor o embeddings de hablante, útil en transcripción con múltiples interlocutores.
- Prototipado e investigación en JAX/Flax: al ser una implementación limpia con pesos SafeTensors y msgpack, permite reproducir y modificar la arquitectura (Conformer, ATP, CosFace) sin depender de frameworks propietarios.
- Despliegue en hardware de borde o sin GPU: con ~2 M de parámetros puede ejecutarse en CPU, lo que habilita escenarios integrados donde no hay acelerador disponible.
- Detección de cambios de locutor en audio largo: uso de puntuaciones coseno entre ventanas consecutivas para segmentar por hablante con un coste computacional muy bajo.

## Benchmarks y rendimiento

Resultados de verificación con 1 utterance de enrolamiento (datos de `eval_results.json`, publicados en la model card):

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,13 | [12,85; 15,37] | 0,9327 | 0,6787 | 0,9320 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 30,53 | [28,96; 32,05] | 0,9793 | 0,9300 | 0,7665 |
| VoxCeleb1 (in-the-wild) | 2.000 | 23,00 | [21,12; 24,93] | 0,9620 | 0,8850 | 0,8613 |
| Universal agrupado (3 dominios) | 8.000 | 23,26 | [22,36; 24,23] | 0,9650 | 0,8468 | 0,8560 |
| Media macro de los 3 dominios | 8.000 | 22,56 | — | 0,9580 | 0,8312 | 0,8533 |

Resultados con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 10,80 | [8,80; 13,10] | 0,6520 | 0,9633 |
| CN-Celeb2 (3-utt) | 1.000 | 25,00 | [22,40; 27,85] | 0,9640 | 0,8360 |
| VoxCeleb1 (3-utt) | 1.000 | 17,40 | [14,80; 19,80] | 0,9100 | 0,9075 |
| Universal agrupado (3-utt) | 3.000 | 18,17 | [16,82; 19,53] | 0,8660 | 0,9071 |
| Media macro (3-utt) | 3.000 | 17,73 | — | 0,8420 | 0,9023 |

No se han publicado en la información disponible resultados de benchmarks de otra naturaleza (MMLU, HumanEval, GSM8K y similares), que no aplican a este tipo de modelo.

## Requisitos de hardware

- Huella de pesos: 2.029.892 parámetros equivalen a aproximadamente 7,7 MiB en fp32 y 3,9 MiB en fp16/bf16 (cálculo derivado del número de parámetros; el autor no publica cifras de VRAM).
- GPU: cualquier GPU con soporte de JAX sirve; no se requiere memoria significativa dado el tamaño del modelo. No se publica una lista de GPU recomendadas.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo, e incluso en CPU, dado que el peso de los parámetros es de unos pocos megabytes. La memoria dominante será la de las activaciones, no la de los pesos.
- Opciones de despliegue: la librería `flaxspeaker` (JAX/Flax) vía API de Python o script de inferencia. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no aplican a este checkpoint.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF ni de latencia por utterance.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados comparativos con otros modelos de verificación de locutor. La model card únicamente incluye las métricas del propio checkpoint, y la búsqueda web realizada no devuelve tablas comparativas.

| Modelo | Parametros | Contexto/entrada | EER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_conformer_small_cosface` | 2,03 M | log-mel 80 dim @ 16 kHz | 23,26 % (universal 1-utt); 14,13 % (LibriSpeech 1-utt) | Apache-2.0 | HuggingFace, colección FlaxSpeaker |
| Alternativas de la misma categoría (ECAPA-TDNN, x-vector, WeSpeaker u otros) | no disponible | no disponible | no disponible | no disponible | no disponible |

Únicamente se puede señalar que la colección FlaxSpeaker incluye otros checkpoints del mismo autor y que el repositorio relacionado `wq2012/personal-vad-v2-conformer-film-cos` cubre una tarea distinta (detección de actividad de voz personalizada) bajo la misma licencia Apache-2.0.

## Limitaciones y advertencias

- Rendimiento limitado en términos absolutos: un EER de 14,13 % en el dominio de entrenamiento y de 23,26 % en la evaluación universal agrupada es alto para verificación de locutor en producción, donde se buscan tasas muy inferiores.
- Degradación severa fuera del dominio: el EER sube de 14,13 % (LibriSpeech) a 30,53 % (CN-Celeb2) y 23,00 % (VoxCeleb1), lo que indica dependencia fuerte de las condiciones de entrenamiento (inglés leído).
- Entrenamiento mono-dominio: el único dominio de entrenamiento declarado es LibriSpeech; no hay evidencia de entrenamiento multilingüe ni con audio espontáneo o in-the-wild.
- No es un producto oficial de Google: la model card lo indica de forma explícita; los artículos citados se basaron en infraestructura y datos internos propietarios, por lo que las cifras de esos papers no son directamente comparables.
- Riesgo de falso positivo y falso negativo: cualquier uso biométrico requiere umbrales calibrados sobre datos propios y mecanismos de respaldo; las métricas publicadas provienen de splits concretos y con tamaños de muestra limitados (entre 1.000 y 8.000 trials).
- Sin defensa declarada frente a ataques de suplantación (replay, voice cloning, deepfakes). El modelo verifica identidad, no autenticidad de la señal.
- Listado de idiomas no disponible: la evaluación en CN-Celeb2 no implica soporte entrenado para chino ni para otros idiomas.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es la asignación errónea de identidad.
- Licencia Apache-2.0: permite uso comercial y modificación, pero al tratarse de un artefacto de investigación con 0 descargas, conviene auditar la reproducibilidad de las métricas antes de integrarlo en un sistema en producción.
- Dependencia del paquete `flaxspeaker` y del ecosistema JAX/Flax: añade una dependencia específica al stack de inferencia, sin conversiones publicadas a otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_conformer_small_cosface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor (Personal VAD 2.0): https://huggingface.co/wq2012/personal-vad-v2-conformer-film-cos
