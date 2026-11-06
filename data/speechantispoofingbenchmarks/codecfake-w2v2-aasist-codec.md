# SpeechAntiSpoofingBenchmarks/Codecfake-W2V2-AASIST-Codec

## Resumen

Codecfake-W2V2-AASIST-Codec es un sistema de contramedidas (countermeasure) para la deteccion de voz sintetica y deepfakes de audio, empaquetado por la organizacion SpeechAntiSpoofingBenchmarks para su uso en la Speech Anti-Spoofing Arena. No es un modelo generativo, sino un clasificador binario que asigna a cada utterance una puntuacion en forma de log-odds de que la senal sea *bona fide* (voz real) frente a *spoof* (voz generada o manipulada). Deriva del trabajo Codecfake de Xie et al. (arXiv:2405.04880) y combina un front-end wav2vec 2.0 XLS-R de 300 M de parametros, congelado, con una cabeza AASIST.

El modelo resulta relevante ahora porque los codecs neuronales de audio (EnCodec, SoundStream, DAC y similares) han abierto una via nueva de falsificacion de voz que los detectores entrenados solo con TTS clasico no cubren bien. Codecfake aborda precisamente ese escenario, y esta version concreta corresponde al checkpoint entrenado unicamente con el split de entrenamiento de Codecfake, lo que la convierte en una referencia util para medir generalizacion frente a variantes entrenadas con datos adicionales.

El wrapper tiene 76,55 M de parametros efectivos reportados y un tamano de repositorio de 0,1 GB. Los pesos no se redistribuyen: el script descarga el checkpoint original desde un commit fijado del repositorio GitHub de los autores y verifica su sha256. La entrada se trunca o repite hasta los primeros 64 600 samples, y la salida es un unico score escalar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end wav2vec 2.0 XLS-R 300M congelado + cabeza AASIST (linear 1024->128, residual encoder, spectro-temporal graph attention) |
| Parametros totales | 76,554634 M (reportado por el autor; corresponde a los parametros efectivos del sistema empaquetado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto de texto; entrada de audio fija de los primeros 64 600 samples (aprox. 4,04 s a 16 kHz), con repeticion en mosaico si la senal es mas corta |
| Tipos de cuantizacion | No disponible en la model card; el wrapper opera en FP32 y existe una clase alternativa TensorRT en FP32/FP16 |
| Idiomas soportados | No disponible (modelo acustico dependiente del idioma de los datos de entrenamiento; la card no lo especifica) |
| Licencia | other (el repositorio upstream no declara licencia; los pesos no se rehospedan) |
| Formato de pesos | Checkpoint PyTorch `.pt` (`anti-spoofing_feat_model.pt`) descargado desde GitHub con verificacion sha256; libreria pytorch |

## Arquitectura y entrenamiento

El sistema es un pipeline en dos etapas. La primera es un extractor de caracteristicas wav2vec 2.0 XLS-R de 300 M de parametros, congelado durante todo el proceso, que recibe la forma de onda normalizada por media y varianza a nivel de utterance. De sus estados ocultos se toma la salida tras la quinta capa transformer (equivalente a `hidden_states[5]` en Hugging Face), es decir, una representacion intermedia y no la capa final. La segunda etapa es una cabeza AASIST que proyecta 1024 dimensiones a 128 mediante una capa lineal, aplica un encoder residual y agrega informacion con graph attention espectro-temporal. La salida se transforma en log-odds de *bona fide*.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de Codecfake (Xie et al.), un corpus disenado en torno a voces generadas por codecs neuronales. No se documentan en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplico RLHF, DPO o fine-tuning preferencial; en un clasificador de este tipo esos mecanismos no aplican de forma estandar. La innovacion tecnica central es el uso de un front-end SSL grande y congelado con una cabeza ligera entrenable, lo que reduce coste de entrenamiento y facilita el reuso del extractor. El wrapper anade un detalle de ingenieria practica: una implementacion TensorRT *drop-in* que en FP32 sobre RTX 4070 Ti SUPER y en FP16 sobre RTX 5060 Ti reprodujo los resultados de PyTorch en el conjunto completo J-SPAW_LA.

## Capacidades

- Deteccion binaria de voz sintetica o manipulada: devuelve un score donde mayor valor implica mayor probabilidad de *bona fide*.
- Funciona como contramedida de sistemas ASV (anti-spoofing) en escenarios de verificacion de hablante.
- Evaluado frente a ataques generados por codecs neuronales, TTS clasico, voz convertida y datasets de deepfake en condiciones diversas.
- Evaluacion en conjuntos *spoof-only* (EmoSpoofTTS, LRLspoof) mediante 1-SRR% al umbral EER de DeepVoice.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni comportamiento de agente.
- No es multilingue en el sentido de un LLM: procesa audio, no texto, y la cobertura idiomatica depende de los datos de entrenamiento, no declarada.
- Capacidad especial: inferencia acelerada opcional via TensorRT con precision FP32 o FP16.

## Casos de uso

- Verificacion antifraude en banca y telecomunicaciones: integrar el score como una senal mas en el pipeline de autenticacion por voz, de modo que una utterance con log-odds bajo de *bona fide* dispare revision manual o segundo factor. Su EER de 3,81 % en ASVspoof2019_LA y 3,27 % en ASVspoof2021_DF lo hace util como capa de deteccion en produccion con umbrales calibrados por dominio.
- Moderacion de contenido en plataformas de audio: clasificar clips subidos por usuarios para marcar posibles voces sinteticas antes de publicacion, con un coste de inferencia bajo gracias a los 76,55 M de parametros efectivos y la ruta TensorRT.
- Monitorizacion de campanas de desinformacion: procesar lotes de audio de redes sociales o mensajeria para identificar locuciones generadas por codecs neuronales, aprovechando el entrenamiento especifico en Codecfake.
- Evaluacion de sistemas TTS y codecs en I+D: usar el modelo como discriminador de referencia al comparar la naturalidad de un codec propio frente a senales reales, midiendo EER sobre un conjunto de validacion interno.
- Benchmarking de contramedidas: servir como baseline reproducible en la Speech Anti-Spoofing Arena y en comparaciones academicas, dado que el wrapper fija commit, sha256 y preprocesado exacto.
- Filtrado previo en datasets de habla: descartar muestras sospechosas de ser sinteticas antes de entrenar modelos ASR o de identificacion de hablante, reduciendo contaminacion del corpus.
- Analisis forense de evidencia audio: aportar una puntuacion objetiva complementaria al peritaje humano en casos de posible suplantacion de voz.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor). EmoSpoofTTS y LRLspoof son *spoof-only* y se reportan como 1-SRR% al umbral EER de DeepVoice.

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 3,81 |
| ASVspoof2021_LA | 8,63 |
| ASVspoof2021_DF | 3,27 |
| ASVspoof5 | 17,93 |
| InTheWild | 9,27 |
| ADD22_eval_31 | 5,66 |
| ADD2023_track12_test_r1 | 13,70 |
| CFAD | 11,90 |
| CD-ADD | 1,38 |
| CVoiceFake_small | 11,13 |
| DeepVoice | 8,44 |
| LibriSeVoc | 0,61 |
| SONAR | 8,58 |
| ArAD | 12,40 |
| DECRO | 9,44 |
| J-SPAW_LA | 0,13 |
| ODSS | 10,35 |

No se dispone en la informacion proporcionada de resultados comparativos frente a otros sistemas en los mismos conjuntos, ni de metricas adicionales como AUC, t-DCF o accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia: el sistema completo en FP32 ocupa del orden de 0,3 GB de pesos (76,55 M de parametros), mas activaciones del front-end XLS-R, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: RTX 4070 Ti SUPER (validada en FP32 con TensorRT) y RTX 5060 Ti (validada en FP16). Para despliegue en servidor, A100, H100 o L4 son sobredimensionadas pero validas para procesamiento por lotes de alto volumen.
- Cabe en GPU consumer: si, practicamente en cualquier modelo con al menos 4 GB de VRAM.
- Opciones de despliegue: PyTorch nativo (wrapper incluido), TensorRT mediante la clase *drop-in* del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada. La entrada fija de 64 600 samples limita el coste por utterance y facilita el batching.

## Comparativa con modelos similares

| Modelo | Parametros | Entrenamiento | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codecfake-W2V2-AASIST-Codec (este) | 76,55 M efectivos | Codecfake train only | 64 600 samples fijos | other (sin licencia upstream) | Pesos descargados desde GitHub con sha256 |
| Codecfake-W2V2-AASIST-CoTrain | No disponible en la informacion | Codecfake co-train | No disponible | No disponible | Hugging Face, sin model card publica |
| AASIST original | No disponible en la informacion | ASVspoof | No disponible | No disponible | No disponible en la informacion |

La informacion disponible solo permite comparar con la variante CoTrain del mismo autor, de la que no se detallan parametros ni resultados. Para el resto de alternativas de la categoria (AASIST, RawNet2, WavLM-based countermeasures) no se han proporcionado datos verificables, por lo que la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- Licencia ambigua: el repositorio upstream no declara licencia y la model card usa `license: other`. El uso comercial requiere contactar con los autores originales; no hay permiso explicito de redistribucion.
- Los pesos no se rehospedan: la inferencia depende de la disponibilidad del commit fijado en GitHub y de la verificacion sha256; si el repositorio cambia o desaparece, el wrapper deja de funcionar.
- Entrenado solo con Codecfake train: la generalizacion a codecs o ataques no representados puede degradarse, como sugiere el EER de 17,93 % en ASVspoof5.
- Riesgo de falsos negativos ante ataques adversariales o post-procesado agresivo (compresion, ruido, reverberacion) no cubierto en entrenamiento.
- Entrada fija de 64 600 samples con repeticion en mosaico: senales mas cortas se replican artificialmente, lo que puede alterar la distribucion acustica y el score.
- Sesgos acusticos no documentados: no se especifican idiomas, genero, edad ni condiciones de grabacion de los datos de entrenamiento, lo que impide evaluar sesgos por subgrupo.
- No es un modelo generativo: no debe usarse para tareas de texto, codigo, razonamiento ni vision.
- El score es un log-odds sin calibracion publicada por dominio; el umbral debe ajustarse con datos propios antes de produccion.
- Resultados de benchmarks dependientes de la implementacion (PyTorch vs. TensorRT, FP32 vs. FP16); la card solo confirma equivalencia en J-SPAW_LA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Codecfake-W2V2-AASIST-Codec
- Variante CoTrain: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Codecfake-W2V2-AASIST-CoTrain
- Organizacion en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Paper Codecfake (arXiv:2405.04880): https://arxiv.org/abs/2405.04880
- Codigo de los autores: https://github.com/xieyuankun/Codecfake
- Checkpoint fijado (commit 72c32e2): https://github.com/xieyuankun/Codecfake/blob/72c32e2840eef95fbeade349425fa9c5391fa11e/pretrained_model/codec_w2v2aasist/anti-spoofing_feat_model.pt
