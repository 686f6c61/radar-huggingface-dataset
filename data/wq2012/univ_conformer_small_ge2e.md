# wq2012/univ_conformer_small_ge2e

## Resumen

`univ_conformer_small_ge2e` es un modelo de verificación e identificación de locutor (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: su función es convertir una grabación de audio en un embedding de locutor de 192 dimensiones, de modo que dos audios puedan compararse mediante similitud coseno para decidir si pertenecen a la misma persona. Se distribuye a través de Hugging Face con licencia Apache 2.0 y se ejecuta con la librería `flaxspeaker`, disponible en PyPI.

Técnicamente es un encoder Conformer de tamaño "small" con solo 2.029.894 parámetros, entrenado con la pérdida GE2E softmax sobre un dominio de entrenamiento "universal" que combina LibriSpeech (inglés leído), CN-Celeb (chino multi-género) y VoxCeleb (inglés espontáneo). Emplea attentive temporal pooling (ATP) para agregar la secuencia temporal en un único vector y puntuación por coseno en la fase de verificación. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz con VAD de energía y normalización CMVN.

Su relevancia es doble: por un lado es una reproducción open source, en JAX/Flax, de algoritmos publicados internamente por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS); por otro, su tamaño reducido y la exportación a TensorFlow Lite (FP32 e INT8) lo hacen apto para inferencia en CPU, dispositivos móviles y entornos edge sin GPU. El rendimiento publicado es modesto (EER del 12,50 % en LibriSpeech y del 24,80 % en VoxCeleb1 con una sola utterance), coherente con su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer ("small") con attentive temporal pooling (ATP) |
| Parametros totales | 2.029.894 (encoder) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de audio; ventana determinada por el frontend, no especificada) |
| Tipos de cuantizacion | FP32 (TFLite) e INT8 dynamic range (TFLite, ~3,5x mas pequeno); safetensors y msgpack sin cuantizacion declarada |
| Idiomas soportados | no disponible como campo explicito; datos de entrenamiento en ingles (LibriSpeech, VoxCeleb) y chino (CN-Celeb) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, flax_model.msgpack, TFLite (fp32 e int8) |
| Dimension del embedding de salida | 192 |
| Perdida de entrenamiento | ge2e_softmax |
| Puntuacion de verificacion | coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Dominio de entrenamiento | universal |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion "small", una arquitectura que combina bloques de autoatencion con convoluciones para capturar dependencias locales y globales en la secuencia acustica. Sobre las representaciones del encoder se aplica attentive temporal pooling (ATP), inspirado en el trabajo Conformer-ATP para language identification en habla larga, que pondera dinamicamente los frames para producir un embedding de locutor de 192 dimensiones. La verificacion final se realiza con similitud coseno entre embeddings, siguiendo el enfoque "parameter-free attentive scoring" (PFAS) citado en la model card.

El entrenamiento usa la perdida GE2E softmax, derivada del paper Generalized End-to-End Loss for Speaker Verification y de la variante Dr-Vectors, que introducen una funcion de perdida mejorada para reconocimiento de locutor. No se especifica en la informacion disponible el numero total de tokens o de horas de audio utilizadas, ni si hubo una fase de ajuste con RLHF o DPO (algo poco habitual en este tipo de modelos). Los datasets citados son LibriSpeech, CN-Celeb y VoxCeleb. Es importante senalar que este checkpoint es una reproduccion clean-room independiente: los experimentos originales de los papers se realizaron con infraestructura y datasets internos de Google, no con esta libreria ni con estos splits publicos, y el modelo no es un producto oficialmente soportado por Google.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de audio.
- Verificacion de locutor 1:1 (comparar dos audios y obtener una puntuacion de similitud).
- Verificacion con multiples utterances de enrolamiento (se publican resultados con 3 utterances).
- Puntuacion mediante similitud coseno, sin necesidad de cabezal de clasificacion adicional.
- Funcionamiento multilingue y multidominio: evaluado en ingles leido (LibriSpeech), chino multi-genero (CN-Celeb2) e ingles espontaneo (VoxCeleb1).
- Exportacion a TensorFlow Lite FP32 e INT8 para inferencia en CPU, movil y edge.
- Uso mediante API Python (`load_pretrained`, `extract_embedding`, `verify`) y mediante script de linea de comandos.
- No soporta tool calling, function calling, agentes, generacion de texto, codigo, matematicas ni vision: es un modelo puramente de audio.

## Casos de uso

- Verificacion biométrica de voz en autenticacion: el modelo genera un embedding de 192 dimensiones de la frase de acceso y lo compara por coseno con el embedding enrolado del usuario, con un umbral fijado a partir del EER publicado.
- Diarizacion de reuniones y podcasts: extrayendo embeddings por segmento y agrupandolos (clustering) se puede atribuir cada intervencion a un hablante, aprovechando el rendimiento de la variante de 3 utterances (EER del 16,03 % en el pool universal).
- Analitica de centros de llamadas: generar embeddings de cada llamada para agrupar clientes recurrentes, detectar fraude por suplantacion o medir la participacion de cada agente.
- Control de acceso en dispositivos edge: gracias a los modelos TFLite FP32 (aproximadamente 8 MB) e INT8 (aproximadamente 2,3 MB), la verificacion puede ejecutarse en moviles, Raspberry Pi o microcontroladores sin conexion.
- Transcripcion con etiquetado de hablante: combinado con un sistema ASR, los embeddings permiten anadir marcas de hablante al texto transcrito en aplicaciones de subtitulado.
- Investigacion en reconocimiento de locutor: sirve como checkpoint ligero y reproducible para comparar perdidas, tecnicas de pooling o esquemas de cuantizacion sin necesidad de grandes recursos de computo.
- Filtrado de datos de entrenamiento: agrupar grandes volumenes de audio por similitud de locutor para deduplicar o equilibrar corpus antes de entrenar otros modelos.

## Benchmarks y rendimiento

Los resultados corresponden al archivo `eval_results.json` publicado por el autor. La metrica principal es EER (Equal Error Rate), donde un valor mas bajo es mejor.

| Split de evaluacion | Trials | EER 1-utt (%) | IC 95 % (%) | minDCF@0,01 | minDCF@0,10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 12,50 | [11,16; 13,63] | 0,8793 | 0,6360 | 0,9441 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 22,33 | [20,73; 23,78] | 0,9673 | 0,9453 | 0,8543 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 24,80 | [22,55; 26,60] | 0,9610 | 0,9100 | 0,8599 |
| Pool universal (3 dominios) | 8.000 | 19,40 | [18,61; 20,26] | 0,9752 | 0,8675 | 0,8906 |
| Macro-media universal (3 dominios) | 8.000 | 19,88 | no disponible | 0,9359 | 0,8304 | 0,8861 |

| Split de evaluacion (3 utterances) | Trials | EER 3-utt (%) | IC 95 % (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 8,80 | [7,00; 10,95] | 0,5660 | 0,9743 |
| CN-Celeb2 (3-utt) | 1.000 | 20,00 | [17,60; 22,15] | 0,9740 | 0,8912 |
| VoxCeleb1 (3-utt) | 1.000 | 19,70 | [17,35; 22,20] | 0,9900 | 0,8938 |
| Pool universal (3-utt) | 3.000 | 16,03 | [14,73; 17,25] | 0,9860 | 0,9212 |
| Macro-media universal (3-utt) | 3.000 | 16,17 | no disponible | 0,8433 | 0,9198 |

No se han publicado en la informacion disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K, etc.), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier precision. Los pesos en FP32 ocupan aproximadamente 8,1 MB (2.029.894 parametros x 4 bytes) y la version INT8 aproximadamente 2,3 MB.
- GPU recomendadas: no se requiere GPU. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) ejecutaria el modelo con una utilizacion insignificante; el cuello de botella real es la extraccion del log-mel, no la red.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. Los TFLite estan pensados explicitamente para CPU de movil y edge.
- Opciones de despliegue: libreria `flaxspeaker` sobre JAX/Flax (Python), script `scripts/inference.py`, y TensorFlow Lite (runtime de Python, Android, iOS o microcontroladores) para las exportaciones fp32 e int8.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano del encoder, se espera una latencia dominada por el preprocesado de audio y el I/O de disco.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la informacion proporcionada, por lo que la comparacion numerica se marca como no disponible. La comparacion se limita a la categoria y a las arquitecturas citadas en la propia model card.

| Modelo | Categoria | Parametros | Contexto (audio) | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| univ_conformer_small_ge2e | Conformer + ATP, GE2E | 2.029.894 | no disponible | EER 12,50 % (LibriSpeech 1-utt), 16,03 % (pool 3-utt) | Apache 2.0 | Hugging Face, PyPI, GitHub |
| Modelos del paper GE2E (2018) | LSTM + GE2E | no disponible | no disponible | no disponible | no disponible | no disponible (entrenados con datos internos de Google) |
| Modelos del paper Dr-Vectors (2021) | Decision Residual Networks | no disponible | no disponible | no disponible | no disponible | no disponible (entrenados con datos internos de Google) |
| Arquitecturas ECAPA-TDNN o x-vector de referencia | TDNN con pooling estadistico | no disponible | no disponible | no disponible | variable | implementaciones publicas diversas |

Nota: el autor advierte de que las cifras de los papers originales no son directamente comparables con las de este checkpoint, ya que aquellos se entrenaron con infraestructura y datasets internos de Google.

## Limitaciones y advertencias

- Tasa de error elevada: el EER de 12,50 % en LibriSpeech y de 24,80 % en VoxCeleb1 con una sola utterance esta muy lejos del estado del arte en verificacion de locutor, que suele situarse por debajo del 1 % en VoxCeleb. Es un modelo pequeno y experimental.
- Degradacion fuera de dominio: el rendimiento cae notablemente en audio espontaneo y ruidoso (VoxCeleb1) frente a audio leido limpio (LibriSpeech).
- Sesgos de los datos: LibriSpeech, VoxCeleb y CN-Celeb son corpus con sesgos conocidos de acento, genero, edad, idioma y condiciones de grabacion; el modelo heredara esas limitaciones.
- Cobertura linguistica limitada: no hay un campo explicito de idiomas soportados y los datos de entrenamiento se limitan a ingles y chino. El comportamiento en otras lenguas no esta documentado.
- Riesgo de alucinacion: no aplicable en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la verificacion, especialmente cerca del umbral de decision.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor declara explicitamente que no es un producto oficialmente soportado por Google y que se trata de una reproduccion clean-room de algoritmos publicados.
- Advertencia de privacidad y legal: los embeddings de voz son datos biometricos; su uso en autenticacion o vigilancia esta sujeto a normativas como el RGPD y requiere base legal y consentimiento.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la libreria tiene poca trayectoria, lo que implica menor soporte de la comunidad y menor rodaje en produccion.
- Inconsistencia en metadatos: los tags incluyen `tflite`, pero no la etiqueta explicita de idiomas; el campo de idiomas aparece como no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- Paper PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la propia model card y de los identificadores arXiv incluidos en ella.
