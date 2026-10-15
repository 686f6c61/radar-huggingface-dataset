# wq2012/ls_lstm_small_ge2e

## Resumen

`wq2012/ls_lstm_small_ge2e` es un extractor de embeddings de locutor (speaker embeddings) de 192 dimensiones desarrollado por Quan Wang (usuario `wq2012`) dentro del proyecto FlaxSpeaker, una reimplementacion independiente en JAX/Flax de algoritmos de reconocimiento de locutor publicados por Google. El modelo resuelve dos tareas concretas: verificar si dos fragmentos de audio pertenecen al mismo hablante y extraer representaciones vectoriales de voz reutilizables para tareas posteriores como diarizacion o agrupamiento por identidad. Su tamano es deliberadamente reducido: 1.710.912 parametros segun los pesos en SafeTensors (1.710.914 en el encoder segun la model card), lo que lo situa en la categoria de modelos desplegables en dispositivos moviles y CPU.

Tecnicamente es una red recurrente LSTM de configuracion `small` con pooling temporal atencional (`asp`, attentive statistical pooling), entrenada con la funcion de perdida `ge2e_softmax` (Generalized End-to-End Loss) y puntuacion de verificacion por similitud coseno. La entrada es audio a 16 kHz procesado con un frontend de 80 dimensiones `log_mel` mas deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN. El entrenamiento se realizo sobre LibriSpeech, y la evaluacion publicada cubre tres dominios distintos: LibriSpeech (ingles leido), CN-Celeb2 (chino multigenero) y VoxCeleb1 (habla espontanea de celebridades).

Su relevancia para desarrolladores es doble. Por un lado, ofrece un punto de partida con licencia Apache 2.0 para integrar verificacion de locutor sin depender de modelos propietarios ni de pesos de gran tamano. Por otro, exporta pesos a TensorFlow Lite en FP32 e INT8 con cuantizacion de rango dinamico, lo que permite ejecucion local en Android, iOS o microcontroladores con CPU, sin acelerador hardware. El coste de esa ligereza se refleja en las tasas de error publicadas, notablemente mas altas que las de sistemas de verificacion de locutor de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM recurrente (`lstm` variante `small`) con pooling temporal atencional (`asp`) |
| Parametros totales | 1.710.912 (pesos en SafeTensors; la model card indica 1.710.914 para el encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio de longitud variable procesada con VAD y pooling estadistico atencional |
| Tipos de cuantizacion | FP32 (nativo y TFLite) e INT8 de rango dinamico (`model_int8.tflite`, ~3,5x menor) |
| Idiomas soportados | no disponible en los metadatos; entrenado con LibriSpeech (ingles leido) y evaluado tambien en chino (CN-Celeb2) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TensorFlow Lite FP32 e INT8 |
| Dimension del embedding de salida | 192 |
| Perdida de entrenamiento | `ge2e_softmax` (Generalized End-to-End Loss) |
| Puntuacion de verificacion | Similitud coseno |
| Frontend de audio | Log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Dominio de entrenamiento | LibriSpeech |
| Libreria | `flaxspeaker` |
| Tarea (pipeline) | audio-classification |
| Metricas declaradas | EER, minDCF, ROC-AUC |

## Arquitectura y entrenamiento

El backbone es una red neuronal recurrente de tipo LSTM en su configuracion `small`, que procesa la secuencia de tramas log-mel y produce una secuencia de estados ocultos. Sobre esa secuencia se aplica un pooling temporal atencional (`asp`), el mismo tipo de agregacion descrito en el trabajo de Conformer-ATP sobre pooling temporal atencional: en lugar de promediar uniformemente las tramas, se calculan pesos de atencion que priorizan los fragmentos con mayor contenido de informacion de locutor. El resultado es un unico vector de 192 dimensiones por utterance, normalizado implicitamente por el uso de similitud coseno como funcion de puntuacion.

El entrenamiento optimiza la perdida `ge2e_softmax`, la formulacion de Generalized End-to-End Loss introducida por Wan et al. (2018) que entrena el encoder de forma end-to-end optimizando directamente la separabilidad de los embeddings entre locutores dentro de cada batch, sin necesidad de una etapa separada de clasificacion. Los datos de entrenamiento corresponden al dominio LibriSpeech. La model card declara explicitamente que se trata de una reproduccion limpia y no oficial ("not an officially supported Google product"): los resultados de los articulos originales se obtuvieron con infraestructura interna propietaria de Google y conjuntos de datos no publicos, no con esta libreria ni con los splits publicos aqui empleados. Por tanto, las cifras de este repositorio no son comparables en condiciones equivalentes con las de los papers.

Los pesos se distribuyen en varios formatos: SafeTensors y msgpack de Flax para inferencia en Python mediante JAX, y dos exportaciones a TensorFlow Lite (FP32 y INT8 de rango dinamico) para despliegue en CPU de movil y borde. El repositorio incluye ademas `config.json` (configuracion `FlaxSpeakerConfig`), `preprocessor_config.json` (configuracion compatible con `WhisperFeatureExtractor`) y `eval_results.json` con las metricas de evaluacion y sus intervalos de confianza bootstrap al 95 por ciento.

## Capacidades

- Extraccion de embeddings de locutor de 192 dimensiones a partir de un fichero de audio, mediante `model.extract_embedding()`.
- Verificacion de locutor entre dos audios (enrolamiento contra prueba) mediante `model.verify()`, con puntuacion de similitud coseno.
- Verificacion multi-utterance: la evaluacion publicada incluye resultados con 1 y con 3 utterances de enrolamiento, y el segundo escenario mejora de forma consistente el EER.
- Clasificacion de audio a nivel de hablante (pipeline declarado `audio-classification`).
- Ejecucion en dispositivos de borde y moviles mediante los ficheros TFLite FP32 e INT8, con cuantizacion de rango dinamico.
- Operacion sobre audio de longitud variable gracias al VAD por energia y al pooling estadistico atencional.
- Uso independiente del idioma en teoria (el embedding representa identidad de locutor, no contenido linguistico), aunque el modelo solo se ha entrenado con LibriSpeech.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo, thinking mode ni razonamiento multi-paso. No es un modelo de lenguaje.

## Casos de uso

- Autenticacion por voz en aplicaciones moviles: el modelo exportado a INT8 ocupa del orden de megabytes y se ejecuta en CPU, por lo que puede integrarse en una app Android o iOS para verificar que la persona que habla coincide con el usuario enrolado, sin enviar el audio a un servidor.
- Enrolamiento ligero con 3 utterances: en escenarios donde el usuario no puede grabar una muestra larga, el modo de enrolamiento triple reduce el EER de 21,25 por ciento (1 utterance, pooled universal) a 17,73 por ciento, lo que hace viable un alta rapida de usuario con tres frases cortas.
- Diarizacion de hablantes en grabaciones: extrayendo el embedding de cada segmento de voz y aplicando agrupamiento (por ejemplo k-means o agglomerative clustering) sobre los vectores de 192 dimensiones se pueden etiquetar los turnos de habla de una reunion o entrevista.
- Preprocesado de pipelines de ASR multihablante: el modelo permite segmentar y agrupar por identidad antes de pasar el audio a un sistema de reconocimiento de voz, de modo que cada flujo se transcriba con un contexto de hablante coherente.
- Filtrado y curacion de datasets de audio: al comparar embeddings entre ficheros se pueden detectar duplicados de un mismo locutor o audios mal etiquetados en corpus de entrenamiento, una tarea habitual antes de entrenar modelos de ASR o TTS.
- Control de acceso fisico o telefonia: verificacion de identidad en llamadas de atencion al cliente o en sistemas de acceso, usando la puntuacion coseno con un umbral calibrado sobre el minDCF del dominio objetivo.
- Investigacion y docencia: al ser una reimplementacion limpia en JAX/Flax de GE2E, Dr-Vectors, Conformer-ATP y PFAS, sirve como banco de pruebas reproducible para experimentar con funciones de perdida, pooling temporal y estrategias de puntuacion (coseno frente a PFAS).
- Prototipado rapido de sistemas de verificacion en dominios no ingleses: la evaluacion multilingue publicada (CN-Celeb2 en chino) permite estimar de antemano el comportamiento esperado en un dominio alejado del entrenamiento antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados de verificacion con 1 utterance de enrolamiento:

| Split de evaluacion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---:|---:|---|---:|---:|---:|
| LibriSpeech (ingles leido) | 3.000 | 12,77 | [11,25; 13,83] | 0,8320 | 0,5927 | 0,9468 |
| CN-Celeb2 (chino multigenero) | 3.000 | 28,03 | [26,57; 29,67] | 0,9447 | 0,9167 | 0,7930 |
| VoxCeleb1 (habla espontanea) | 2.000 | 23,35 | [21,32; 25,00] | 0,8670 | 0,8540 | 0,8580 |
| Universal pooled (3 dominios) | 8.000 | 21,25 | [20,45; 22,12] | 0,9270 | 0,8173 | 0,8733 |
| Universal macro-average (3 dominios) | 8.000 | 21,38 | no disponible | 0,8812 | 0,7878 | 0,8659 |

Resultados de verificacion con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---:|---:|---|---:|---:|
| LibriSpeech (3-utt) | 1.000 | 7,90 | [6,40; 10,20] | 0,5180 | 0,9775 |
| CN-Celeb2 (3-utt) | 1.000 | 24,90 | [21,65; 27,00] | 0,9200 | 0,8403 |
| VoxCeleb1 (3-utt) | 1.000 | 19,70 | [17,20; 21,70] | 0,8500 | 0,8959 |
| Universal pooled (3-utt) | 3.000 | 17,73 | [16,32; 18,92] | 0,9073 | 0,9113 |
| Universal macro-average (3-utt) | 3.000 | 17,50 | no disponible | 0,7627 | 0,9046 |

No se han publicado en la informacion disponible resultados de benchmarks de otros modelos comparables en las mismas condiciones, ni cifras de MMLU, HumanEval o GSM8K (no aplicables a un modelo de audio).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 MB de pesos en FP32 (1.710.912 parametros x 4 bytes) y del orden de 2 MB en INT8, segun la reduccion de ~3,5x declarada para `model_int8.tflite`. El consumo real dependera de la longitud del audio y de las activaciones del LSTM, pero se mantiene muy por debajo de 1 GB en cualquier caso.
- GPU recomendadas: no requiere GPU. Funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) ejecutaria el modelo sobradamente, aunque no aporta ventaja relevante frente a CPU dado el tamano.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPU integradas, telefonos, Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: la libreria `flaxspeaker` (Python con JAX/Flax) mediante `load_pretrained()` o `scripts/inference.py`; runtime de TensorFlow Lite para FP32 o INT8 en CPU movil y de borde. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo. No se mencionan exportaciones a ONNX ni a Core ML.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/ls_lstm_small_ge2e` | 1.710.912 | Audio a 16 kHz, log-mel 80 dim, longitud variable | EER 1-utt 21,25% (pooled universal); 3-utt 17,73% | Apache 2.0 | HuggingFace, GitHub, PyPI, TFLite FP32/INT8 |
| `wq2012/wavenet-speaker-verifier-coded` | no disponible | Habla condicionada a codec 2 a 2,4 kb/s | no disponible | no disponible | HuggingFace |
| Red GE2E del articulo original (Wan et al., 2018) | no disponible | no disponible | no disponible (entrenada con datos internos propietarios) | no disponible | no disponible |
| Otros sistemas de verificacion de locutor de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card advierte de que las cifras publicadas en los articulos de referencia (GE2E, Dr-Vectors, Conformer-ATP, PFAS) no son directamente comparables con las de este repositorio, porque aquellos experimentos se ejecutaron con infraestructura y datos internos de Google. No se dispone de datos verificados de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que no es un producto soportado oficialmente por Google y que se trata de una reproduccion limpia e independiente.
- Las tasas de error son altas para estandares de produccion en verificacion de locutor: EER de 12,77 por ciento incluso en el dominio de entrenamiento (LibriSpeech) y de 28,03 por ciento en CN-Celeb2. En enrolamiento de una sola utterance y dominio cruzado, el rendimiento puede ser insuficiente para control de acceso con requisitos de seguridad estrictos.
- Degradacion clara fuera del dominio: el modelo se entrena con ingles leido y pierde mas de 15 puntos de EER al pasar a habla espontanea (VoxCeleb1) o a chino (CN-Celeb2).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la decision de verificacion; debe calibrarse un umbral a partir del minDCF del dominio de destino.
- Sesgos potenciales derivados de LibriSpeech: audiolibros en ingles con condiciones de grabacion relativamente limpias y una distribucion de hablantes limitada en acento, edad y genero. No se han publicado analisis de sesgo por subgrupo.
- El VAD por energia puede comportarse mal con ruido de fondo, musica o audio de baja relacion senal-ruido, generando embeddings poco fiables.
- No se documentan los idiomas soportados en los metadatos ni una evaluacion oficial de robustez multilingue; el uso en idiomas distintos del ingles queda bajo responsabilidad del integrador.
- Limitaciones de licencia: Apache 2.0 permite uso comercial, pero el aviso de reproduccion limpia implica que el usuario debe verificar de forma independiente que su aplicacion cumple la normativa aplicable en materia de biometria de voz (por ejemplo RGPD en la Union Europea), que no cubre la licencia del modelo.
- Para produccion: conviene validar el modelo en el dominio real con un conjunto de prueba propio antes de fijar umbrales, y considerar un sistema de mayor capacidad si los requisitos de EER son inferiores al 10 por ciento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/ls_lstm_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Perfil de GitHub del autor: https://github.com/wq2012
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Modelo relacionado `wavenet-speaker-verifier-coded`: https://huggingface.co/wq2012/wavenet-speaker-verifier-coded
- Paper GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- Paper PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642v3
