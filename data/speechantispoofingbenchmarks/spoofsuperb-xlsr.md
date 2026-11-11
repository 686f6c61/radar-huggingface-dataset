# SpeechAntiSpoofingBenchmarks/SpoofSUPERB-XLSR

## Resumen

SpoofSUPERB-XLSR es un detector de audio falso (anti-spoofing) empaquetado por el proyecto SpeechAntiSpoofingBenchmarks para su uso en la Speech Anti-Spoofing Arena. No es un modelo generativo, sino un clasificador binario que distingue voz autentica (bona fide) de voz sintetica o convertida (spoof). Se construye sobre el extractor de caracteristicas XLS-R 300M (wav2vec 2.0, 24 capas, 1024 dimensiones) congelado, sobre el que se anade una cabeza lineal entrenada especificamente para la tarea.

El modelo implementa el detector de cabeza lineal propuesto por Ali et al. (2026) en el marco Spoof-SUPERB. La innovacion principal es el uso de un Featurizer de s3prl que pondera mediante softmax los 25 estados ocultos de XLS-R (las 24 entradas de capa del transformer mas la salida del encoder), seguido de una proyeccion Linear(1024,256), un mean pooling sobre fotogramas y un clasificador final Linear(256,2). Solo se entrenan los pesos de ponderacion de capas, el proyector y el clasificador; el backbone XLS-R permanece congelado.

Su relevancia actual radica en la creciente necesidad de detectar deepfakes de voz en un contexto de sintesis de habla cada vez mas realista. El modelo se distribuye bajo licencia Apache 2.0, con 317,65 millones de parametros y un repositorio de 0,1 GB, y ha sido evaluado en 18 conjuntos de datos del arena, lo que permite comparar su robustez frente a dominios muy diversos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador sobre XLS-R 300M congelado (wav2vec 2.0, 24 capas, 1024-d); Featurizer s3prl con softmax sobre 25 estados ocultos + Linear(1024,256) + mean pooling + Linear(256,2) |
| Parametros totales | 317.653.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana fija de 64.600 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`xls_r_300m.pth`), FP32 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. En la primera, el extractor XLS-R 300M preentrenado y congelado procesa la forma de onda de entrada. Un Featurizer de s3prl combina los 25 estados ocultos (las 24 entradas de capa del transformer mas la salida del encoder) mediante pesos aprendidos con softmax, sin normalizacion por capa. En la segunda etapa, la representacion combinada pasa por una capa Linear(1024,256), se agrega mediante mean pooling sobre los fotogramas y se clasifica con una capa Linear(256,2) que produce dos logits (spoof y bona fide). La puntuacion final es `logits[:,1]`, de modo que valores mas altos indican mayor probabilidad de voz autentica.

El entrenamiento se realizo exclusivamente sobre el conjunto de entrenamiento de ASVspoof 2019 LA durante 50 epocas con Stochastic Weight Averaging (SWA). Solo se optimizaron los pesos de ponderacion de capas, el proyector y el clasificador; el backbone XLS-R no se actualizo. La entrada se procesa a 16 kHz, tomando las primeras 64.600 muestras (las locuciones mas cortas se repiten en bucle para completar la ventana), con la normalizacion por locucion propia del pipeline upstream y en precision FP32. No se menciona uso de RLHF ni DPO, al tratarse de una tarea de clasificacion supervisada.

## Capacidades

- Deteccion binaria de audio falso: clasifica una locucion como bona fide (autentica) o spoof (sintetica o convertida).
- Puntuacion continua: devuelve el logit de la clase bona fide, lo que permite umbralizar segun el coste de falsos positivos y falsos negativos.
- Evaluacion cruzada de dominios: ha sido puntuado en 18 conjuntos de datos del Speech Anti-Spoofing Arena, incluidos ASVspoof 2019/2021/5, InTheWild, ADD22/ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW, ODSS, EmoSpoofTTS y LRLspoof.
- Compatibilidad con PyTorch y con una clase drop-in de TensorRT (FP32) que replica el comportamiento del wrapper PyTorch.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; su unica funcion es la clasificacion anti-spoofing.

## Casos de uso

- Verificacion de autenticidad en sistemas de atencion al cliente: antes de aceptar una locucion como prueba de identidad, el modelo puntua el audio y rechaza aquellos con alta probabilidad de sintesis, reduciendo el riesgo de suplantacion.
- Filtrado en plataformas de contenido: integrado en un pipeline de subida de audio, permite marcar automaticamente clips sospechosos de ser deepfakes de voz para revision humana.
- Auditoria de datasets de habla: al construir corpus para entrenamiento de ASR o TTS, el modelo detecta muestras sinteticas o convertidas que podrian contaminar el conjunto.
- Monitorizacion de llamadas en tiempo casi real: con la variante TensorRT en FP32 sobre GPUs de consumo (RTX 4070 Ti SUPER o RTX 5060 Ti), puede desplegarse en servidores de telefonia para puntuar segmentos de 64.600 muestras.
- Investigacion en deteccion de deepfakes: sirve como linea base reproducible (cabeza lineal sobre XLS-R congelado) para comparar nuevas propuestas en el arena.
- Evaluacion de robustez entre dominios: util para estudiar como se degrada un detector entrenado en ASVspoof 2019 LA cuando se aplica a dominios como SONAR, DECRO o ArAD, con EER que oscilan entre el 2,21 % y el 28,84 %.
- Control de calidad en sintesis de voz: al generar un TTS propio, el modelo puede usarse como discriminador auxiliar para medir la naturalidad y detectar artefactos que delaten la sintesis.

## Benchmarks y rendimiento

Resultados de EER % (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR % en el umbral EER de DeepVoice.

| Conjunto de datos | EER % |
|---|---|
| ASVspoof2019_LA | 1,81 |
| ASVspoof2021_LA | 14,09 |
| ASVspoof2021_DF | 4,32 |
| ASVspoof5 | 14,39 |
| InTheWild | 17,77 |
| ADD22_eval_31 | 11,64 |
| ADD2023_track12_test_r1 | 28,84 |
| CFAD | 11,16 |
| CD-ADD | 13,82 |
| CVoiceFake_small | 19,17 |
| DeepVoice | 22,21 |
| LibriSeVoc | 2,21 |
| SONAR | 25,86 |
| ArAD | 16,85 |
| DECRO | 19,96 |
| J-SPAW_LA | 8,33 |
| ODSS | 25,64 |

No se han publicado en la informacion disponible resultados de benchmarks de modelos comparables (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 317,65 M de parametros en FP32, el peso de los pesos ronda 1,27 GB, a lo que hay que sumar activaciones y buffers del backbone XLS-R.
- GPU recomendadas: la model card menciona ejecucion en RTX 4070 Ti SUPER y RTX 5060 Ti mediante la clase TensorRT en FP32; no se detallan A100 ni H100.
- Cabe en GPU de consumo: si, segun las pruebas reportadas en RTX 4070 Ti SUPER y RTX 5060 Ti.
- Opciones de despliegue: wrapper PyTorch (referencia) y clase drop-in de TensorRT (FP32); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se indica que la variante TensorRT coincidio con PyTorch en el conjunto completo J-SPAW_LA.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento ni licencia de modelos alternativos de anti-spoofing con los que establecer una comparacion cuantitativa. La unica referencia interna es el propio arena, donde el modelo ocupa una posicion determinada por su tier y rank (badges enlazados en la model card), pero no se incluyen los valores numericos de esos rankings ni los de los competidores.

| Modelo | Parametros | Contexto | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpoofSUPERB-XLSR | 317,65 M | no disponible | 1,81 % | apache-2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado unicamente con ASVspoof 2019 LA: la degradacion en dominios alejados es notable (EER del 28,84 % en ADD2023_track12_test_r1 y del 25,86 % en SONAR), lo que limita su uso directo en produccion sin validacion en el dominio objetivo.
- Ventana fija de 64.600 muestras (unas 4,04 s a 16 kHz): las locuciones mas cortas se repiten en bucle, lo que puede introducir artefactos y afectar a la puntuacion; las mas largas se truncan a los primeros 64.600 samples.
- Dependencia de la normalizacion por locucion del pipeline upstream y de la implementacion exacta del Featurizer s3prl; cambios en estos componentes pueden alterar las puntuaciones.
- Riesgo de falsos negativos ante ataques de sintesis no representados en el conjunto de entrenamiento (generalizacion limitada a nuevos sistemas TTS y de conversion de voz).
- No se documentan sesgos por idioma, genero o acento; los idiomas soportados figuran como no disponibles, por lo que no puede asumirse un comportamiento homogeneo entre lenguas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero los pesos de XLS-R se re-alojan bajo la licencia upstream, que debe verificarse por separado antes de su redistribucion.
- El modelo ofrece una puntuacion, no una decision calibrada: el umbral debe ajustarse segun el coste de falsos positivos y falsos negativos en cada despliegue.
- No es un modelo generativo ni un sistema completo de verificacion de hablante; debe combinarse con un modulo ASV para una autenticacion robusta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/SpoofSUPERB-XLSR
- Pesos `xls_r_300m.pth` (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/SpoofSUPERB-XLSR/blob/1994736c380f9ef1477e4f7ee03bce9835420706/xls_r_300m.pth
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Codigo upstream (spoof_SUPERB): https://github.com/issflab/spoof_SUPERB/tree/8b457584e4120ba525f720e714d0a4b2ed400d68
- Paper (arXiv:2603.01482): https://arxiv.org/abs/2603.01482
