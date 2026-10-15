# wq2012/vox_conformer_small_ge2e

## Resumen

`vox_conformer_small_ge2e` es un checkpoint de verificación de locutor (speaker verification) publicado por el usuario `wq2012` dentro de la biblioteca FlaxSpeaker, una reproducción independiente en JAX/Flax de algoritmos de reconocimiento de hablante descritos en los artículos GE2E, Dr-Vectors, Conformer-ATP y PFAS. No es un modelo generativo ni un LLM: su salida es un embedding de locutor de 192 dimensiones con el que se calcula una puntuación de similitud coseno entre dos fragmentos de audio.

La arquitectura es un encoder Conformer de tamaño `small` con pooling temporal atento (ATP), entrenado con la pérdida `ge2e_softmax` y puntuación de verificación por coseno. El encoder tiene 2.029.894 parámetros (dato real de safetensors) y el frontend de audio es log-mel de 80 dimensiones a 16 kHz con VAD de energía y CMVN. El entrenamiento se realizó sobre el dominio de VoxCeleb1.

Su relevancia actual es doble: por un lado es un artefacto muy ligero, con licencia Apache 2.0, pesos en safetensors y msgpack nativo de Flax, evaluado en tres dominios distintos (inglés leído, chino multigénero y voz in-the-wild); por otro, sus métricas son modestas (EER del 16,33 % en LibriSpeech y del 27,87 % en CN-Celeb2 con una única utterance, con minDCF@0.01 próximo a 1), por lo que es adecuado para prototipado, docencia o tareas de baja criticidad, no para autenticación segura. El repositorio no registra descargas ni likes y no es un producto soportado oficialmente por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (solo encoder, dato de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se documenta duración máxima de audio; el pooling ATP está pensado para audio de formato largo) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors y msgpack de Flax, sin variantes GGUF, int8 ni cuantizadas |
| Idiomas soportados | no declarados; evaluado en inglés (LibriSpeech), chino (CN-Celeb2) y voz in-the-wild multilingüe (VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` y `flax_model.msgpack` (Flax nativo) |
| Tarea | Verificación e identificación de locutor (`audio-classification`) |
| Dimension del embedding | 192 |
| Perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | Similitud coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16 kHz, VAD de energía y CMVN |
| Dominio de entrenamiento | VoxCeleb1 |
| Libreria | `flaxspeaker` (JAX/Flax) |
| Ficheros incluidos | `config.json`, `preprocessor_config.json`, `eval_results.json` |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer de configuración `small` seguido de un módulo de pooling temporal atento (Attentive Temporal Pooling, ATP) que agrega la secuencia de estados ocultos en un único vector de 192 dimensiones. El entrenamiento emplea la pérdida `ge2e_softmax`, una variante de la Generalized End-to-End Loss, y la verificación en inferencia se realiza por similitud coseno entre embeddings, siguiendo el enfoque de Parameter-Free Attentive Scoring (PFAS). No se documenta el uso de RLHF ni DPO, ya que no es un modelo generativo.

El autor indica que se trata de una reproducción *clean-room* independiente: los experimentos originales de los artículos citados se realizaron con infraestructura interna propietaria de Google y con conjuntos de datos internos, no con esta biblioteca ni con los splits públicos. El modelo se entrenó sobre el dominio de VoxCeleb1, y la evaluación publicada cubre además LibriSpeech (inglés leído) y CN-Celeb2 (chino multigénero). El número total de tokens o de horas de audio de entrenamiento, la composición exacta del dataset y los detalles del optimizador no están disponibles en la información proporcionada.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de un fichero de audio (FLAC y formatos compatibles con el extractor tipo WhisperFeatureExtractor).
- Verificación de locutor uno a uno mediante puntuación coseno entre un audio de enrolamiento y un audio de prueba.
- Verificación con múltiples utterances de enrolamiento (se publican resultados para 3 utterances, con mejora clara del EER).
- Identificación de locutor por comparación contra un conjunto de embeddings de referencia (la salida es un vector, por lo que el clustering o la búsqueda por similitud se implementan fuera del modelo).
- Funcionamiento multilingüe no declarado explícitamente pero evaluado en inglés y chino, con degradación notable en el dominio chino.
- Ejecución en CPU y GPU a través de los backends de JAX, sin dependencias de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (`thinking`), visión, audio generativo ni capacidades multimodales de salida.

## Casos de uso

- Autenticación de voz en aplicaciones de baja criticidad: el modelo genera un embedding de 192 dimensiones en CPU y permite comparar una frase de prueba con un audio de enrolamiento mediante coseno; es adecuado para demos o control de acceso no sensible, dado su minDCF@0.01 cercano a 1.
- Etiquetado y agrupación de hablantes en archivos de audio: los embeddings se pueden agrupar con k-means o clustering aglomerativo para separar interlocutores en entrevistas, reuniones o podcasts.
- Enriquecimiento de pipelines de ASR: asignar un identificador de hablante a cada segmento transcrito mejorando la legibilidad de la transcripción y facilitando la búsqueda por persona.
- Filtrado y limpieza de corpus de entrenamiento para TTS y ASR: detectar y descartar grabaciones en las que el locutor no coincide con el etiquetado, o duplicados del mismo hablante entre splits, reduciendo fugas de datos.
- Indexado y búsqueda por voz en archivos históricos: almacenar embeddings de una colección de grabaciones y recuperar todas las intervenciones de un hablante concreto mediante similitud coseno en un índice vectorial.
- Personalización de asistentes de voz: reconocer a un usuario previamente enrolado para cargar su perfil antes de activar funciones personalizadas, con verificación de 3 utterances para reducir el EER del 20,80 % al 16,40 % en VoxCeleb1.
- Investigación y reproducción de resultados: al ser una implementación JAX/Flax de GE2E, Dr-Vectors, Conformer-ATP y PFAS, sirve para estudiar el efecto del pooling atento y de la pérdida GE2E softmax con un coste computacional mínimo y compararlo con implementaciones en PyTorch.
- Análisis exploratorio de audio en entornos con recursos limitados: con solo 2,03 M de parámetros, puede ejecutarse en dispositivos embebidos, Raspberry Pi o portátiles sin GPU para tareas de diarización aproximada.

## Benchmarks y rendimiento

Verificación con una utterance (1-utt), datos de `eval_results.json`:

| Split de evaluacion | Trials | EER (%) | IC 95 % bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (inglés leído) | 3.000 | 16,33 | [14,92; 17,78] | 0,9960 | 0,8327 | 0,9127 |
| CN-Celeb2 (chino multigénero) | 3.000 | 27,87 | [26,05; 29,37] | 0,9660 | 0,8973 | 0,7959 |
| VoxCeleb1 (in-the-wild) | 2.000 | 20,80 | [19,15; 22,78] | 0,9260 | 0,8410 | 0,8834 |
| Universal agrupado (3 dominios) | 8.000 | 22,40 | [21,62; 23,32] | 0,9840 | 0,8690 | 0,8648 |
| Media macro universal | 8.000 | 21,67 | — | 0,9627 | 0,8570 | 0,8640 |

Verificación con tres utterances de enrolamiento (3-utt):

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,70 | [9,60; 13,60] | 0,8760 | 0,9578 |
| CN-Celeb2 (3-utt) | 1.000 | 25,80 | [23,00; 28,20] | 0,9220 | 0,8335 |
| VoxCeleb1 (3-utt) | 1.000 | 16,40 | [14,00; 18,60] | 0,8540 | 0,9285 |
| Universal agrupado (3-utt) | 3.000 | 17,63 | [16,02; 18,90] | 0,9353 | 0,9131 |
| Media macro universal (3-utt) | 3.000 | 17,97 | — | 0,8840 | 0,9066 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, porque el modelo no las aborda. Los únicos benchmarks disponibles son los de verificación de locutor recogidos arriba.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 8,1 MB en fp32 (2.029.894 × 4 bytes) y 4,1 MB en fp16. El consumo de memoria adicional depende de la longitud del audio procesado por el encoder y del tamaño de lote.
- VRAM estimada para inferencia: del orden de decenas a unos pocos cientos de MB, dominada por las activaciones del encoder y por el buffer de características log-mel, no por los pesos.
- GPU recomendadas: cualquiera, incluso las más modestas; una RTX 4090, A100 o H100 están enormemente sobredimensionadas para este modelo. El caso de uso natural es CPU.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo e incluso en iGPU y en dispositivos embebidos.
- Opciones de despliegue: biblioteca `flaxspeaker` (`pip install flaxspeaker`), API Python (`load_pretrained`, `extract_embedding`, `verify`) y script de línea de comandos `scripts/inference.py`; cualquier backend de JAX (CPU, GPU, TPU).
- No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama, ONNX Runtime ni TensorRT, ni se ofrecen pesos GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF, latencia por utterance ni rendimiento en lote.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Duracion/contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vox_conformer_small_ge2e` | Conformer small + ATP + GE2E softmax, embedding 192 | 2.029.894 (encoder) | no disponible | Apache 2.0 | HuggingFace y PyPI (`flaxspeaker`) |
| ECAPA-TDNN (p. ej. `speechbrain/spkrec-ecapa-voxceleb`) | TDNN con attentive statistics pooling, embedding 192 | no disponible en la informacion | no disponible | no disponible en la informacion | PyPI y HuggingFace |
| WeSpeaker ResNet (p. ej. `resnet34`) | CNN ResNet con pooling atento | no disponible en la informacion | no disponible | no disponible en la informacion | GitHub y PyPI |
| `microsoft/wavlm-base-sv` | Transformer preentrenado con cabeza de verificación | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de cifras de EER verificables de los modelos comparados en la información proporcionada, por lo que no es posible una comparación numérica directa. Como contexto cualitativo, los sistemas de referencia entrenados y evaluados sobre VoxCeleb1 alcanzan tasas de error muy inferiores al 1 % en condiciones de prueba estándar, mientras que este checkpoint declara un 20,80 % de EER en VoxCeleb1 con una utterance; la comparación debe tomarse con cautela porque los protocolos de evaluación y los splits pueden diferir.

## Limitaciones y advertencias

- El rendimiento es modesto para producción: entre el 16,33 % y el 27,87 % de EER con una utterance según el dominio, y minDCF@0.01 entre 0,9260 y 0,9960, lo que implica un comportamiento muy pobre en el punto de operación de baja tasa de falsa alarma exigido por la autenticación biométrica real.
- Degradación fuerte fuera de dominio: el modelo se entrenó sobre VoxCeleb1 y su peor resultado se da en CN-Celeb2 (27,87 % de EER), un dominio chino multigénero.
- Riesgo de sesgo: el entrenamiento con VoxCeleb1, compuesto por celebridades, puede introducir sesgos hacia determinados acentos, géneros, edades y condiciones de grabación. El autor no publica análisis de equidad ni métricas desagregadas por subgrupo.
- No hay contramedidas anti-spoofing documentadas: el modelo no incorpora detección de reproducción ni de voz sintética, por lo que es vulnerable a ataques de presentación y a voces generadas por TTS si se usa como control de acceso.
- Riesgo de error en utterances cortas o con mucho ruido: el frontend aplica VAD de energía, que puede descartar voz útil en grabaciones con baja relación señal-ruido o en habla solapada.
- No es un modelo generativo: no responde a instrucciones, no genera texto, no hace tool calling ni razonamiento multi-paso. Cualquier expectativa de uso como LLM es incorrecta.
- Artifacto sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, con fecha de creación reciente, y el propio autor declara que no es un producto soportado oficialmente por Google.
- Licencia Apache 2.0 en el checkpoint, lo que permite uso comercial del modelo, pero los conjuntos de datos subyacentes (VoxCeleb, CN-Celeb, LibriSpeech) tienen sus propias condiciones de uso que conviene revisar antes de explotarlo comercialmente.
- No se documentan límites de duración de audio, ni comportamiento con audios muy largos, ni estrategias de segmentación recomendadas.
- Para obtener un rendimiento aceptable es necesario el enrolamiento con varias utterances: el EER baja del 20,80 % al 16,40 % en VoxCeleb1 al pasar a 3 utterances, lo que añade complejidad operativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/vox_conformer_small_ge2e
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Artículo GE2E: https://arxiv.org/abs/1710.10467
- Artículo Dr-Vectors: https://arxiv.org/abs/2104.01989
- Artículo Conformer-ATP: https://arxiv.org/abs/2202.12163
- Artículo PFAS: https://arxiv.org/abs/2203.05642v3
- Los resultados de búsqueda web proporcionados no contienen información técnica sobre el modelo (contenido no relacionado y de spam), por lo que no se incluyen como fuentes.
