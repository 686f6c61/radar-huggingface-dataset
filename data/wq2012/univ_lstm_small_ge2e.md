# wq2012/univ_lstm_small_ge2e

## Resumen

`univ_lstm_small_ge2e` es un extractor de embeddings de hablante (speaker embeddings) de tamano reducido, desarrollado por el usuario `wq2012` y publicado dentro del ecosistema FlaxSpeaker. Su funcion es convertir una muestra de audio de voz en un vector de 192 dimensiones que representa la identidad del hablante, de modo que dos fragmentos del mismo locutor queden proximos en el espacio de embeddings y dos de locutores distintos queden alejados. Resuelve, por tanto, tareas de verificacion e identificacion de hablante (speaker verification y speaker recognition) en entornos donde el coste computacional y el tamano del modelo son criticos.

Tecnicamente es una red recurrente LSTM de backbone `small` con pooling temporal `asp` (attentive temporal pooling) y una cabeza de clasificacion entrenada con la perdida GE2E softmax, con puntuacion final por similitud coseno. El checkpoint completo de inferencia (encoder mas cabeza de scoring) tiene 1.710.914 parametros, un tamano de repositorio de 0,1 GB y una salida de 192 dimensiones. La entrada es audio a 16 kHz procesado con un frontend propio de 80 coeficientes Mel en logaritmo natural, VAD por energia a nivel de trama y CMVN.

Su relevancia actual es acotada pero clara: es un checkpoint de referencia reproducible, escrito desde cero en JAX/Flax a partir de papers publicados (GE2E, Dr-Vectors, ATP y PFAS), sin codigo ni datos propietarios. No pretende ser un modelo de estado del arte, sino una linea base ligera y auditable para comparaciones relativas controladas dentro del benchmark FlaxSpeaker, con exportaciones TFLite en FP32 e INT8 para despliegue en dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM recurrente (backbone `lstm`, variante `small`) con pooling temporal `asp` y cabeza GE2E softmax |
| Parametros totales | 1.710.914 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de entrada fija de 180 tramas (1,8 s) en las exportaciones TFLite; entrenamiento con recortes variables U(90, 180) tramas |
| Tipos de cuantizacion | FP32 e INT8 (exportaciones `jax2tf` a TFLite del encoder); pesos en safetensors y msgpack sin cuantizar |
| Idiomas soportados | no disponible (el modelo es independiente del idioma en la practica: modela identidad de hablante, no contenido linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors`, `flax_model.msgpack`, `model_fp32.tflite`, `model_int8.tflite` |

## Arquitectura y entrenamiento

El modelo combina un encoder LSTM de tamano `small` que procesa secuencias de tramas acusticas, un cabezal de pooling temporal atento (`asp`, tomado del paper de ATP sobre identificacion de idioma en streaming) que agrega la secuencia en un unico vector, y una cabeza de clasificacion GE2E softmax con centroides leave-one-out exactos (Wan et al. 2018, Eq. 6). La verificacion se realiza por similitud coseno entre embeddings de 192 dimensiones. El frontend acustico no es un `AutoFeatureExtractor` de Hugging Face, sino el componente `flaxspeaker.AudioFrontend`: 80 coeficientes Mel en logaritmo natural a 16 kHz, VAD por energia a nivel de trama y normalizacion CMVN.

El entrenamiento se realizo sobre un pool controlado de tres dominios (LibriSpeech, CN-Celeb2 y VoxCeleb1) con 381 hablantes y 9.447 enunciados, durante 4.600 pasos de gradiente con mini-batches de 32 enunciados (8 hablantes x 4 enunciados), lo que equivale a unas 15,58 epocas, con semilla 42 y warmup de 460 pasos. Se usaron recortes de longitud variable U(90, 180) tramas con mascara de validez exacta. La EER agrupada universal evoluciono de 26,90 % (1 utterance) y 23,77 % (3 utterances) en el paso 400 a 19,14 % y 14,87 % en el paso 4.600. La desviacion estandar entre semillas 0-2 del EER agrupado a 1 utterance es de 0,08-0,41 % absolutos, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de aproximadamente 0,8 %. El checkpoint esta entrenado hasta convergencia con un margen de seguridad de 2 epocas, pero sobre un corpus de 381 hablantes, no sobre VoxCeleb2-dev.

## Capacidades

- Extraccion de embeddings de hablante de 192 dimensiones a partir de audio de voz a 16 kHz.
- Verificacion de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificacion de hablante (1:N) por comparacion contra un conjunto de embeddings de referencia.
- Segmentacion y agrupacion de hablantes (diarizacion) como componente de embedding dentro de un pipeline externo.
- Robustez multi-dominio por entrenamiento conjunto en LibriSpeech (lectura en ingles), CN-Celeb2 (mandarin) y VoxCeleb1 (habla espontanea en ingles).
- Exportacion a TFLite FP32 e INT8 del encoder para inferencia en dispositivos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Verificacion biométrica de voz en autenticacion telefonica: el modelo genera un embedding de 192 dimensiones de la frase del usuario y se compara por coseno contra el embedding de referencia enrolado, con un coste de 1,7 M de parametros que permite ejecutarlo en el mismo servidor de telefonia.
- Control de acceso en dispositivos empotrados: la exportacion `model_int8.tflite` con ventana fija de 180 tramas (1,8 s) y entrada `[1, 180, 80]` cabe en microcontroladores y SoCs de bajo consumo, lo que permite verificacion local sin enviar audio a la nube.
- Diarizacion de reuniones y transcripciones: usar los embeddings como caracteristica para un clustering posterior (por ejemplo, agglomerative clustering) y separar intervenciones por hablante en grabaciones multi-participante.
- Indexado y busqueda de archivos de audio: precalcular embeddings de cada segmento de voz y construir un indice vectorial para recuperar todas las apariciones de un locutor concreto en un archivo de decenas de horas.
- Deteccion de locutor en pipelines de moderacion o compliance: marcar segmentos que no correspondan al hablante esperado en grabaciones de atencion al cliente, con umbral calibrado sobre la EER del dominio objetivo.
- Linea base reproducible para investigacion: al estar implementado en JAX/Flax a partir de papers publicados y con semilla y presupuesto documentados, sirve para comparar variantes de pooling, perdida o frontend bajo condiciones controladas.
- Filtrado de datos de entrenamiento ASR: descartar o agrupar utterances por hablante antes de entrenar modelos de reconocimiento de voz, reduciendo fuga de identidad entre particiones.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la evolucion del EER agrupado universal durante el entrenamiento y las referencias externas citadas por el autor.

| Metrica | Paso 400 | Paso 4000 (rodilla) | Paso 4600 (final) |
|---|---|---|---|
| EER agrupada, 1 utterance | 26,90 % | 19,34 % | 19,14 % |
| EER agrupada, 3 utterances | 23,77 % | 15,40 % | 14,87 % |

Referencias externas citadas en la model card (no son resultados de este modelo): ECAPA-TDNN entrenado en VoxCeleb2-dev alcanza aproximadamente 0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1 M de parametros aproximadamente 2 % (Wang et al., EfficientTDNN, 2022). El archivo `eval_results.json` del repositorio contiene EER a 1 y 3 utterances, minDCF, ROC-AUC, intervalos bootstrap al 95 % y resultados sobre un subconjunto de 10 hablantes de VoxCeleb1-O, pero sus valores concretos no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para los 1,7 M de parametros, mas el buffer de activaciones de la secuencia de entrada; en INT8, por debajo de 50 MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo se entreno en una estacion de trabajo CPU. Una NVIDIA T4, L4 o RTX 4090 ofrece margen de sobra para lotes grandes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con al menos 1 GB de memoria, e incluso en CPU.
- Cabe en dispositivos: si, mediante las exportaciones TFLite FP32 e INT8 del encoder con entrada fija `[1, 180, 80]`.
- Opciones de despliegue: JAX/Flax con la libreria `flaxspeaker` (via PyPI), TFLite Runtime para las exportaciones, y contenedores propios basados en Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_lstm_small_ge2e` | 1.710.914 | Ventana de 180 tramas (1,8 s) en TFLite; recortes U(90,180) en entrenamiento | 19,14 % (1 utt) / 14,87 % (3 utt) en el benchmark de 381 hablantes | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia citada) | no disponible en la informacion | no disponible | ~0,9 % en VoxCeleb1-O completo | no disponible | no disponible |
| EfficientTDNN (Wang et al., 2022, referencia citada) | < 1 M | no disponible | ~2 % | no disponible | no disponible |

La comparacion directa no es valida: los EER de las referencias corresponden a VoxCeleb1-O con modelos entrenados en VoxCeleb2-dev (5.994 hablantes, ~1,1 M utterances), mientras que este checkpoint se entrena en 381 hablantes y 9.447 utterances. El propio autor advierte que los checkpoints estan pensados para comparaciones relativas dentro del benchmark FlaxSpeaker.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementacion independiente en JAX/Flax.
- EER absoluta alta (19,14 % a 1 utterance) por la baja diversidad de hablantes del corpus de entrenamiento (381 hablantes, maximo 25 utterances por hablante); no debe usarse como referencia de estado del arte.
- Riesgo de sesgo por dominio y acento: el entrenamiento cubre lectura en ingles, mandarin y habla espontanea en ingles; el rendimiento en otros idiomas, acentos o condiciones acusticas no esta caracterizado.
- Sensibilidad a la calidad del audio y al VAD: el frontend es propio y no es un `AutoFeatureExtractor` de Hugging Face, lo que complica la integracion con pipelines estandar y puede degradar resultados si el preprocesado difiere.
- Las exportaciones TFLite solo incluyen el encoder y usan una ventana fija sin mascara de 180 tramas (1,8 s); no reproducen el comportamiento con recortes variables del entrenamiento.
- Riesgo de falsos positivos y negativos en verificacion: hay que calibrar el umbral sobre el dominio de despliegue; la semianchura del intervalo bootstrap al 95 % es de aproximadamente 0,8 %, lo que limita la resolucion de comparaciones finas.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantias ni soporte; conviene revisar las licencias de los datasets de entrenamiento (LibriSpeech, CN-Celeb2, VoxCeleb1) para usos derivados.
- No apto para tareas de generacion de texto, razonamiento, codigo ni agentes; su unico cometido es la extraccion de embeddings de hablante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_lstm_small_ge2e
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
