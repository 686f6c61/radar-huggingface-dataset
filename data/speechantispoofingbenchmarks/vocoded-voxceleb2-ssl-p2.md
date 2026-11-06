# SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P2

## Resumen

Vocoded-VoxCeleb2-SSL-P2 es un contramedida (countermeasure) de anti-spoofing de voz, es decir, un detector binario de audio sintetico o manipulado frente a voz genuina. Lo desarrollan Wang y Yamagishi en el NII (National Institute of Informatics, Japon) y lo empaqueta el proyecto SpeechAntiSpoofingBenchmarks como participante de la Speech Anti-Spoofing Arena. Corresponde al modelo identificado como P2 en su trabajo de ICASSP 2024 (arXiv:2309.06014).

Tecnicamente no es un modelo generativo: es un clasificador de dos clases construido sobre dos frontales wav2vec 2.0 cuyas salidas de ultima capa se restan (v.vox menos XLSR-53), seguido de un backend lineal ligero con dropout de Monte Carlo. El total de parametros asciende a 634.962.182 y el repositorio ocupa 2,6 GB en safetensors FP32.

Su relevancia actual radica en la evaluacion cruzada: el modelo se entrena solo con voz bona fide vocodificada de ASVspoof 2019 LA y se mide en catorce conjuntos de prueba distintos, lo que permite cuantificar la generalizacion de un detector SSL ante vocoders y ataques no vistos. El checkpoint publicado es el seed-01 de los autores, bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos frontales wav2vec 2.0 (XLSR-53 y v.vox, preentrenado de forma continua sobre VoxCeleb2 vocodificado) con resta de salidas de ultima capa; backend Linear 1024->128 + 3 bloques Linear+LeakyReLU+MC-dropout (p=0.5) + mean pooling + Linear 128->2 |
| Parametros totales | 634.962.182 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana fija de 64.600 muestras de audio (primeros 64.600 samples, clips mas cortos se repiten en mosaico) |
| Tipos de cuantizacion | no disponible (checkpoint en FP32; existe wrapper TensorRT drop-in en FP32) |
| Idiomas soportados | no disponible (modelo acustico dependiente del habla, sin declaracion de idiomas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch); commit fijado eb3f3823 |

## Arquitectura y entrenamiento

El modelo es un sistema de dos vias. El frontal v.vox es XLSR-53 preentrenado de forma continua y auto-supervisada (fairseq) sobre mas de 9.000 horas de VoxCeleb2 copy-sintetizado con multiples vocoders neuronales. El segundo frontal es XLSR-53 sin modificar. La representacion final es la diferencia entre las salidas de ultima capa de ambos frontales, un mecanismo de sustraccion que busca aislar el artefacto de vocodificacion comun. Sobre esa representacion se aplica un backend lineal con tres bloques Linear+LeakyReLU+MC-dropout y mean pooling sobre frames.

El ajuste fino se realiza sobre voc.LA, la parte bona fide del conjunto de entrenamiento de ASVspoof 2019 LA vocodificada (unas 10 horas), con aumento de datos RawBoost. La puntuacion final es el logit de la softmax media de clase bona fide sobre 144 muestras de Monte-Carlo-dropout con mascaras fijas por clip. El checkpoint publicado es el seed-01 de los autores. Es importante notar que la implementacion empaquetada usa una ventana determinista de los primeros 64.600 samples y no el protocolo de utterance completa del paper.

## Capacidades

- Deteccion binaria de voz sintetica o vocodificada frente a voz genuina (clasificacion bona fide / spoof).
- Puntuacion continua: mayor valor indica mayor probabilidad de voz bona fide.
- Estimacion de incertidumbre mediante Monte-Carlo-dropout (144 muestras por clip con mascaras fijas).
- Evaluacion robusta a vocoders neuronales no vistos durante el entrenamiento, gracias al preentrenamiento SSL sobre VoxCeleb2 vocodificado.
- Inferencia determinista con ventana fija de 64.600 muestras, lo que facilita el despliegue en pipelines por lotes.
- Compatibilidad con wrapper TensorRT drop-in ademas del wrapper PyTorch.
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo: es exclusivamente un clasificador acustico.

## Casos de uso

- Verificacion en sistemas de autenticacion por voz: el modelo puntua cada utterance entrante y permite rechazar intentos de suplantacion generados por TTS o voice conversion antes de pasar al verificador de hablante.
- Moderacion de contenido en plataformas de audio: procesado por lotes de clips subidos para marcar posibles deepfakes de voz, usando la puntuacion continua para priorizar revision humana.
- Analisis forense de grabaciones: apoyo a peritos que necesitan una primera senal objetiva sobre la autenticidad de un audio, con la salvedad de que el modelo no esta validado como prueba pericial.
- Monitorizacion de centros de llamadas: deteccion de llamadas entrantes sinteticas en tiempo cuasi-real, aprovechando la ventana fija de 64.600 muestras y el wrapper TensorRT para reducir latencia.
- Investigacion en anti-spoofing: linea base reproducible para comparar nuevas tecnicas de deteccion, dado que el checkpoint es publico y esta integrado en la Arena con metricas por conjunto de datos.
- Filtrado de datasets de voz: descarte automatico de muestras vocodificadas al construir corpus de entrenamiento para ASR o TTS.
- Evaluacion de robustez de vocoders: uso del EER como metrica de deteccion para auditar la calidad o el realismo de un vocoder concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER%, menor es mejor; EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR% en el umbral EER de DeepVoice):

| Conjunto de evaluacion | EER (%) |
|---|---|
| ASVspoof2019_LA | 2,24 |
| ASVspoof2021_LA | 15,93 |
| ASVspoof2021_DF | 7,25 |
| ASVspoof5 | 22,96 |
| InTheWild | 4,34 |
| ADD22_eval_31 | 11,52 |
| ADD2023_track12_test_r1 | 27,98 |
| CFAD | 10,73 |
| CD-ADD | 5,33 |
| CVoiceFake_small | 19,01 |
| DeepVoice | 15,86 |
| LibriSeVoc | 0,91 |
| SONAR | 10,20 |
| ArAD | 36,78 |
| DECRO | 18,55 |

No se dispone de comparacion numerica con otros sistemas de la Arena en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 634,96 M de parametros en FP32 el peso ronda los 2,5 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o mas.
- GPU empleadas por los autores en la evaluacion: RTX 4070 Ti SUPER y RTX 5060 Ti, ambas en FP32 con el wrapper TensorRT.
- Cabe en GPU de consumo: si, incluidas RTX 3060/4060 y superiores; en CPU es viable pero con mayor latencia por el coste de los dos frontales wav2vec 2.0.
- Opciones de despliegue: wrapper PyTorch del repositorio de los autores y clase TensorRT drop-in (FP32); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vocoded-VoxCeleb2-SSL-P2 | 634,96 M | 64.600 muestras | Doble wav2vec 2.0 con resta + backend MC-dropout | BSD-3-Clause | Hugging Face (este repo) |
| Vocoded-VoxCeleb2-SSL-P1 | no disponible | no disponible | Variante P1 del mismo trabajo (Wang & Yamagishi) | no disponible | Hugging Face (SpeechAntiSpoofingBenchmarks) |
| AASIST y familia | no disponible | no disponible | Grafos atencionales sobre features acusticas | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con voz bona fide vocodificada (voc.LA, ~10 h): no ha visto ataques spoof reales en entrenamiento, lo que limita su calibracion ante ataques no vocodificados.
- El protocolo empaquetado usa una ventana fija de los primeros 64.600 samples, no el protocolo de utterance completa del paper; los resultados pueden diferir de los reportados originalmente.
- EER elevado en varios conjuntos (ArAD 36,78 %, ADD2023 27,98 %, ASVspoof5 22,96 %), lo que indica escasa generalizacion a algunos dominios y ataques.
- Riesgo de falsos positivos y negativos en audio con ruido, canales telefonicos o codecs agresivos; no hay datos publicados de calibracion fuera de los conjuntos de la Arena.
- Sin declaracion de idiomas soportados ni evaluacion por idioma; el comportamiento en lenguas de bajos recursos es desconocido.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; usarlo fuera de la clasificacion binaria de audio no tiene sentido.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero no se ofrece garantia alguna; para uso forense o como prueba juridica se requiere validacion independiente.
- El repositorio tiene muy pocas descargas (8) y ningun like en el momento de la consulta, por lo que la comunidad de validacion es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P2
- Checkpoint fijado por commit: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P2/blob/eb3f38231935a53d37b5cfeaca3e12cb8bc73c64/model.safetensors
- Paper (Wang & Yamagishi, ICASSP 2024): https://arxiv.org/abs/2309.06014
- Codigo de los autores: https://github.com/nii-yamagishilab/project-NN-Pytorch-scripts/tree/b529705b65588d62db17b56f98636ee734ff725e/project/10-asvspoof-vocoded-trn-ssl
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Variante P1: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P1
