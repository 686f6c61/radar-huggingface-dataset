# wq2012/cn_conformer_small_ge2e

## Resumen

`cn_conformer_small_ge2e` es un modelo de verificacion e identificacion de hablante (speaker verification / speaker recognition) publicado por el usuario `wq2012` dentro del proyecto de codigo abierto FlaxSpeaker. Se trata de una reproduccion independiente (clean-room) en JAX/Flax de una familia de algoritmos publicados por Google (GE2E, Dr-Vectors, Conformer-ATP y PFAS), cuyo objetivo es extraer embeddings de voz de 192 dimensiones que permitan decidir si dos fragmentos de audio pertenecen al mismo locutor.

El modelo usa un backbone Conformer en su variante `small`, con pooling temporal atento (ATP, attentive temporal pooling) y una funcion de perdida GE2E con cabezal softmax, y puntua la similitud entre embeddings mediante distancia coseno. Su encoder tiene unicamente 2.029.894 parametros, lo que lo situa en la gama ultraligera: esta pensado para inferencia en CPU o dispositivos de borde antes que para competir en precision con modelos de decenas o cientos de millones de parametros.

Su interes actual es que ofrece un pipeline completo y reproducible de reconocimiento de hablante bajo licencia Apache-2.0, con pesos en safetensors y msgpack nativo de Flax, y con una evaluacion multi-dominio verificada (1 y 3 utterances, con EER, minDCF y ROC-AUC e intervalos de confianza bootstrap) sobre LibriSpeech, CN-Celeb2 y VoxCeleb1. Es un punto de partida razonable para prototipos de biometria de voz, pero sus tasas de error son altas y hay que valorarlas antes de plantearlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`) con pooling temporal atento (`atp`) |
| Parametros totales | 2.029.894 (encoder) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible (procesa audio a 16 kHz con frontend log-mel de 80 dimensiones; no se especifica ventana maxima en las fuentes) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; se distribuyen pesos en safetensors y msgpack) |
| Idiomas soportados | No disponibles en la ficha. Entrenado sobre CN-Celeb2 (chino); evaluado ademas en ingles de LibriSpeech y en VoxCeleb1 |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Funcion de perdida | `ge2e_softmax` |
| Puntuacion de verificacion | Coseno |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN |
| Dominio de entrenamiento | `cnceleb2` |
| Libreria | `flaxspeaker` (JAX / Flax) |
| Pipeline declarado | `audio-classification` |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer aumentado con convoluciones que combina capas de autoatencion (dependencias globales de la secuencia) con capas convolucionales (dependencias locales y patrones espectrales de corto plazo). Sobre la secuencia de frames se aplica un pooling temporal atento (ATP), que agrega la informacion en un unico vector de 192 dimensiones en lugar de promediar ciegamente. El entrenamiento usa la perdida GE2E con cabezal softmax, en la linea del trabajo original *Generalized End-to-End Loss for Speaker Verification*, y la verificacion final se resuelve con similitud coseno entre embeddings.

El frontend de audio es un extractor compatible con `WhisperFeatureExtractor`: log-mel de 80 dimensiones a 16 kHz, mas deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN. El modelo se entrena sobre el dominio chino CN-Celeb2, aunque la evaluacion publicada cubre tres dominios distintos (ingles leido de LibriSpeech, chino multigenero de CN-Celeb2 y audio en condiciones reales de VoxCeleb1). No se especifican en las fuentes el numero de horas o tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste con RLHF o DPO (no aplicables en este tipo de tarea). El autor advierte explicitamente de que los papers de referencia se experimentaron con infraestructura y datos internos propietarios de Google, no con esta libreria ni con estos splits publicos, por lo que los resultados no son directamente comparables.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de un fichero de audio.
- Verificacion de locutor con una sola utterance de inscripcion (1-utt) y con inscripcion multiple de tres utterances (3-utt).
- Puntuacion de similitud coseno entre embeddings para decidir si dos audios son del mismo hablante.
- Identificacion / clasificacion de hablante (el pipeline declarado es `audio-classification`).
- Frontend de audio integrado con VAD de energia y normalizacion CMVN, lo que permite trabajar con grabaciones con silencios.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Soporte multilingue: la ficha no declara idiomas; el modelo se entreno en chino y se evaluo tambien en ingles, sin metricas especificas por idioma.
- No se documenta en las fuentes un modo de inferencia en streaming ni un modo "thinking".

## Casos de uso

- Autenticacion por voz en aplicaciones de acceso restringido: se inscribe la voz del usuario (uno o varios audios), se extrae su embedding de 192 dimensiones y se compara por coseno con el embedding de la muestra de acceso. Es viable porque el modelo es muy pequeno y puede ejecutarse en el propio dispositivo.
- Organizacion y etiquetado de archivos de audio y podcasts por locutor: se segmenta el audio, se extrae un embedding por segmento y se agrupan los segmentos con alta similitud coseno para separar intervenciones de distintos hablantes.
- Diarizacion ligera en grabaciones de reuniones: combinando el VAD de energia del frontend con los embeddings por segmento y un algoritmo de clustering, se obtiene un etiquetado basico de quien habla en cada tramo.
- Preprocesado para pipelines de ASR condicionados por hablante: el embedding puede usarse como vector de condicionamiento o como etiqueta auxiliar para separar transcripciones cuando varias personas hablan en la misma grabacion.
- Control de calidad de datasets de voz: detectar automaticamente audios mal etiquetados o con locutores cruzados comparando los embeddings entre si.
- Deteccion de duplicados y agrupacion de llamadas en centros de atencion: identificar si varias llamadas corresponden al mismo cliente comparando embeddings, sin necesidad de datos adicionales.
- Reproduccion e investigacion: sirve como linea base reproducible y de bajo coste para comparar variantes de perdida (GE2E, Dr-Vectors), de pooling (ATP, PFAS) o de scoring sobre los mismos splits publicos.
- Filtrado previo en sistemas anti-suplantacion: el embedding de hablante se puede usar como una senal mas dentro de un pipeline de verificacion, aunque el modelo por si solo no detecta ataques de replay o voz sintetica.

## Benchmarks y rendimiento

Resultados publicados en la model card del propio autor. Verificacion con una utterance de inscripcion:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 20,80 | [19,27; 22,33] | 0,9553 | 0,8740 | 0,8759 |
| CN-Celeb2 (chino multigenero) | 3.000 | 21,33 | [20,07; 23,08] | 0,9687 | 0,8500 | 0,8676 |
| VoxCeleb1 (celebridades en condiciones reales) | 2.000 | 27,20 | [25,30; 29,03] | 0,9890 | 0,9630 | 0,8203 |
| Universal agrupado (3 dominios) | 8.000 | 23,93 | [22,98; 24,92] | 0,9792 | 0,9335 | 0,8500 |
| Media macro universal (3 dominios) | 8.000 | 23,11 | — | 0,9710 | 0,8957 | 0,8546 |

Verificacion con tres utterances de inscripcion (multi-enrollment):

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 16,00 | [13,75; 18,20] | 0,8120 | 0,9250 |
| CN-Celeb2 (3-utt) | 1.000 | 16,80 | [14,90; 19,40] | 0,9540 | 0,9066 |
| VoxCeleb1 (3-utt) | 1.000 | 23,90 | [20,60; 26,65] | 0,9780 | 0,8521 |
| Universal agrupado (3-utt) | 3.000 | 20,13 | [18,38; 21,47] | 0,9160 | 0,8900 |
| Media macro universal (3-utt) | 3.000 | 18,90 | — | 0,9147 | 0,8946 |

La informacion proporcionada no incluye resultados de benchmarks de modelos comparables sobre estos mismos splits, por lo que no es posible establecer una comparacion cuantitativa directa.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precision habitual. Con 2.029.894 parametros, los pesos ocupan aproximadamente 8,1 MB en float32 y unos 4 MB en float16.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU sin problema. Una RTX 4090, A100 o H100 estan completamente sobredimensionadas para este modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, e incluso en GPU integradas y en muchos dispositivos de borde.
- Opciones de despliegue: el paquete `flaxspeaker` (JAX/Flax) con la funcion `load_pretrained`, o el script `scripts/inference.py` incluido en el repositorio. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje. No se documenta en las fuentes una conversion a GGUF ni a formatos de runtime movil para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frontend | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wq2012/cn_conformer_small_ge2e` | 2.029.894 | log-mel 80 dims a 16 kHz + VAD + CMVN | Apache-2.0 | HuggingFace y PyPI (`flaxspeaker`) |
| ECAPA-TDNN (SpeechBrain) | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |
| WavLM-base-plus-sv (Microsoft) | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |
| WeSpeaker ResNet (variantes) | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes | no disponible en las fuentes |

No se dispone en la informacion proporcionada de las especificaciones ni de los resultados de benchmarks de estas alternativas, por lo que la comparacion cuantitativa se limita a la existencia de modelos de la misma categoria (verificacion de hablante) de tamano y precision muy superiores, habitualmente en el rango de decenas de millones de parametros.

## Limitaciones y advertencias

- Tasas de error elevadas: EER del 20,80% en LibriSpeech, 21,33% en CN-Celeb2 y 27,20% en VoxCeleb1 en verificacion con una utterance. En la mayoria de aplicaciones de biometria de voz se exige un EER muy inferior a estos valores.
- minDCF alto: entre 0,85 y 0,99 segun dominio y umbral, lo que indica un coste de decision elevado en escenarios reales.
- La mejora con multi-enrollment (3 utterances) es limitada: reduce el EER hasta 16,00-23,90% segun dominio, pero sigue siendo alto.
- Sesgo de dominio: el entrenamiento se hizo unicamente sobre CN-Celeb2 (chino). El rendimiento en ingles y en audio en condiciones reales es notablemente peor, y no hay datos de robustez frente a acentos, ruido de fondo, canales telefonicos o microfonos de baja calidad.
- Idiomas: la ficha no declara que idiomas soporta oficialmente, por lo que no se puede asumir cobertura multilingue general.
- Riesgo de falsos positivos y falsos negativos: al ser un modelo de verificacion, el fallo se manifiesta como aceptar a un impostor o rechazar a un usuario legitimo. No hay datos de robustez frente a ataques de suplantacion (replay, voz sintetica o conversion de voz).
- Licencia: Apache-2.0 permite uso comercial, pero el aviso del autor indica explicitamente que no es un producto soportado oficialmente por Google.
- Naturaleza de reproduccion: es una reproduccion clean-room de algoritmos publicados; los papers originales se validaron con infraestructura y datos internos de Google, de modo que sus cifras no son extrapolables a este checkpoint.
- Estado del repositorio: el tamano del repo indicado es 0,0 GB y el modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido ampliamente validado por la comunidad.
- No apto para tareas de generacion de texto, razonamiento, codigo o vision: es exclusivamente un modelo de audio para embeddings de hablante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/cn_conformer_small_ge2e
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor (Personal VAD 2.0, Conformer causal): https://huggingface.co/wq2012/personal-vad-v2-conformer-std-vad
- Descripcion general de la arquitectura Conformer: https://www.emergentmind.com/topics/conformer-model
- Publicacion original de Conformer en DeepAI: https://deepai.org/publication/conformer-convolution-augmented-transformer-for-speech-recognition
- Busqueda de modelos Conformer en HuggingFace: https://huggingface.co/models?search=conformer
- Implementacion de referencia de Conformer en GitHub: https://github.com/LuluW8071/Conformer
