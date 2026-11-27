# SpeechAntiSpoofingBenchmarks/Thaki-VoiceSpoof-W2V2-Large

## Resumen

Thaki-VoiceSpoof-W2V2-Large es un modelo de deteccion de voz sintetica (anti-spoofing) desarrollado por ThakiCloud en 2026 como vista previa de investigacion. Se construye sobre facebook/wav2vec2-large, el conocido encoder auto-supervisado preentrenado con 960 horas de LibriSpeech, y anade una cabeza de clasificacion binaria que distingue entre voz autentica (bona fide) y voz falsificada (spoof). El modelo resuelve el problema de detectar deepfakes de audio y ataques de sintesis o conversion de voz, un ambito critico para la verificacion biomedica por voz y la lucha contra el fraude.

La arquitectura parte de las 24 capas transformer de wav2vec2-large, que se afinan junto con la proyeccion de caracteristicas sobre el conjunto de entrenamiento ASVspoof 5 (Track 1), manteniendo congelado el encoder convolucional de caracteristicas. Sobre las 25 representaciones ocultas se aplica una suma ponderada por softmax, una capa Linear(1024, 256) con activacion GELU, un pooling estadistico atencional y una cabeza lineal de dos clases. El modelo tiene 315,76 millones de parametros y se distribuye en safetensors bajo licencia Apache 2.0.

Este repositorio concreto es un empaquetado ("wrapper") realizado por SpeechAntiSpoofingBenchmarks para integrar el modelo en la Speech Anti-Spoofing Arena, un espacio de evaluacion comparativa de sistemas anti-spoofing. El modelo pertenece al nivel "no publicado" de la Arena (se muestra pero no se clasifica) porque no cuenta con un paper asociado. Su relevancia actual radica en que ofrece un punto de referencia abierto y reproducible para la deteccion de deepfakes de voz, con resultados de EER publicados en multiples conjuntos de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (wav2vec2-large) con cabeza de clasificacion binaria, pooling estadistico atencional y suma ponderada de estados ocultos |
| Parametros totales | 315.758.363 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada fija de 64.600 muestras a 16 kHz, aproximadamente 4,04 segundos) |
| Tipos de cuantizacion | No disponible (se menciona uso en BF16 y un wrapper TensorRT en BF16, pero no se documentan cuantizaciones tipo GGUF o int8) |
| Idiomas soportados | No disponibles (la tarea es de deteccion acustica, no dependiente de idioma de forma explicita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), libreria PyTorch |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone facebook/wav2vec2-large, un transformer de 24 capas y 1024 dimensiones ocultas preentrenado de forma auto-supervisada con 960 horas de LibriSpeech. Durante el afinado se actualizan las 24 capas transformer y la proyeccion de caracteristicas, mientras que el encoder convolucional de caracteristicas permanece congelado. La clasificacion final combina una suma ponderada por softmax de las 25 representaciones ocultas (la salida del encoder convolucional mas las 24 capas), una proyeccion Linear(1024, 256) con GELU, un pooling estadistico atencional y una cabeza lineal de dos salidas (bona fide frente a spoof). El score se calcula como la diferencia logit[bonafide] - logit[spoof], de modo que valores mas altos indican mayor probabilidad de voz autentica.

El entrenamiento se realizo exclusivamente sobre la particion de entrenamiento de ASVspoof 5 (Track 1), que constituye el conjunto de evaluacion de la Arena, lo que implica que los resultados en ASVspoof5 deben interpretarse con cautela por posible solapamiento con el dominio de entrenamiento. El checkpoint liberado corresponde a la epoca 5 seleccionada por los autores. El preprocesado es estricto: audio a 16 kHz, primeros 64.600 muestras, con repeticion (tiling) de clips mas cortos, y normalizacion por utterance a media cero y varianza unitaria dentro del propio modelo. La inferencia de referencia usa autocast en bf16 con parametros en fp32, atencion SDPA (backend cuDNN cuando esta disponible) y lotes fijos de 128 filas con relleno de ceros descartado. No se documenta el uso de RLHF ni DPO, al tratarse de una tarea de clasificacion, no de generacion.

## Capacidades

- Deteccion binaria de voz autentica frente a voz falsificada (anti-spoofing) a partir de forma de onda de audio a 16 kHz.
- Identificacion de ataques de sintesis de texto a voz (TTS) y de conversion de voz (voice conversion), segun los conjuntos de evaluacion empleados.
- Puntuacion continua mediante la diferencia de logits (bona fide menos spoof), util para umbralizar segun el coste de falsos positivos y falsos negativos.
- Procesamiento por utterance con normalizacion interna de la forma de onda.
- Compatible con despliegue en BF16 y con un wrapper TensorRT (BF16) que reproduce los resultados de PyTorch en el conjunto completo de J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999).
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo; es un clasificador acustico especializado.
- Capacidades multilingues no documentadas de forma explicita; el comportamiento depende del dominio acustico, no del idioma declarado.

## Casos de uso

- Verificacion biomedica por voz en banca y telefonia: el modelo puede actuar como capa antifraude que puntua cada utterance entrante y rechaza aquellas con score bajo (probable voz sintetica) antes de autenticar al cliente, aprovechando su salida continua para ajustar el umbral al coste del fraude.
- Moderacion de contenido en plataformas de audio y podcast: integrado en el pipeline de subida, permite marcar clips sospechosos de ser generados por TTS o conversion de voz para revision humana, dado su bajo coste computacional (315 M de parametros).
- Deteccion de deepfakes en periodismo y verificacion de hechos: como filtro previo que prioriza que grabaciones revisar manualmente, usando el score como indicador de riesgo en lugar de como veredicto definitivo.
- Investigacion en anti-spoofing: sirve como baseline reproducible en la Speech Anti-Spoofing Arena para comparar nuevos sistemas contra un backbone wav2vec2-large afinado en ASVspoof 5, con resultados de EER publicados por conjunto de datos.
- Automatizacion de centros de contacto: analisis por lotes de grabaciones para auditar campanas y detectar llamadas generadas automaticamente, aprovechando el procesamiento en lotes fijos de 128 filas documentado por los autores.
- Despliegue en hardware de gama media: al caber en GPUs de consumo (se mencionan RTX 4070 Ti SUPER, RTX 5060 Ti y RTX 4060 Ti en la model card) y disponer de wrapper TensorRT, es viable para prototipos y entornos con presupuesto limitado.
- Evaluacion de robustez frente a dominios: sus resultados publicados en ADD22, ADD2023, CFAD, InTheWild o DeepVoice permiten estudiar la generalizacion del detector a ataques y condiciones acusticas distintas de las de entrenamiento.

## Benchmarks y rendimiento

Resultados de la Speech Anti-Spoofing Arena (EER%, menor es mejor). EmoSpoofTTS y LRLspoof son solo-spoof y usan 1-SRR% en el umbral EER de DeepVoice; no se incluyen en la tabla por estar incompletos en la informacion disponible.

| Conjunto de evaluacion | EER (%) |
|---|---|
| ASVspoof2019_LA | 37,14 |
| ASVspoof2021_LA | 39,76 |
| ASVspoof2021_DF | 24,07 |
| ASVspoof5 | 7,33 |
| InTheWild | 12,67 |
| ADD22_eval_31 | 16,59 |
| ADD2023_track12_test_r1 | 26,2 |
| CFAD | 29,56 |
| CD-ADD | 4,98 |
| CVoiceFake_small | 40,75 |
| DeepVoice | 23,29 |
| LibriSeVoc | 31,17 |
| SONAR | 31,7 |
| ArAD | 20,08 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada, salvo la indicacion de que el modelo esta en el nivel "no publicado" de la Arena (se muestra, no se clasifica).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 1,4 GB; en fp32 los 315,76 M de parametros requieren aproximadamente 1,26 GB solo para pesos, mas activaciones. Con autocast en bf16 (parametros en fp32 segun la model card) el consumo real es mayor; no se documenta una cifra exacta de VRAM.
- GPU recomendadas: la model card cita ejecuciones en RTX 4070 Ti SUPER, RTX 5060 Ti y RTX 4060 Ti, todas GPUs de consumo. No se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, segun las pruebas citadas en RTX 4060 Ti, RTX 5060 Ti y RTX 4070 Ti SUPER.
- Opciones de despliegue: PyTorch (referencia) y un wrapper TensorRT en BF16 que reproduce los resultados de PyTorch en J-SPAW_LA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador acustico).
- Latencia y throughput: no disponibles de forma numerica; la model card solo indica el uso de lotes fijos de 128 filas y la equivalencia entre PyTorch y TensorRT en J-SPAW_LA.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de parametros, contexto, rendimiento o licencia de modelos alternativos de anti-spoofing comparables. La Arena en la que se integra este modelo incluye otros sistemas, pero sus especificaciones no se detallan en la informacion disponible.

| Modelo | Parametros | Contexto | EER ASVspoof5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-VoiceSpoof-W2V2-Large | 315,76 M | Entrada fija de 64.600 muestras | 7,33 % | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con ASVspoof 5 (Track 1); el EER de 7,33 % en ASVspoof5 puede estar inflado por solapamiento con el dominio de entrenamiento y no refleja el rendimiento en dominios nuevos.
- Rendimiento muy desigual entre conjuntos: EER de 4,98 % en CD-ADD frente a 40,75 % en CVoiceFake_small o 39,76 % en ASVspoof2021_LA, lo que indica escasa generalizacion a ciertos ataques y condiciones acusticas.
- Nivel "no publicado" en la Arena: no existe paper ni revision por pares que respalde los resultados; se muestra pero no se clasifica.
- Entrada fija de 64.600 muestras (aproximadamente 4,04 segundos a 16 kHz); clips mas largos se truncan y los mas cortos se repiten, lo que puede degradar la deteccion en utterances largas o con contenido relevante fuera de la ventana.
- Riesgo de falsos positivos y falsos negativos: el score es una diferencia de logits, no una probabilidad calibrada; el umbral debe ajustarse por dominio.
- No se documentan sesgos por idioma, acento, genero o canal; al depender de caracteristicas acusticas, es plausible que exista sesgo de dominio no medido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como vista previa de investigacion ("Research Preview") sin garantias de robustez en produccion.
- No apto para generacion de texto, codigo, vision ni tareas de agente; es exclusivamente un clasificador de audio.
- La informacion sobre cuantizaciones (GGUF, int8) es inexistente; el despliegue documentado se limita a PyTorch y TensorRT en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Thaki-VoiceSpoof-W2V2-Large
- Pesos (model.safetensors, commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Thaki-VoiceSpoof-W2V2-Large/blob/725e368ef4023eea5a226c3f08089bce8c469b9d/model.safetensors
- Repositorio upstream de ThakiCloud: https://huggingface.co/ThakiCloud/Thaki-VoiceSpoof-W2V2-Large
- Codigo de inferencia de los autores: https://huggingface.co/ThakiCloud/Thaki-VoiceSpoof-W2V2-Large/blob/093c7a1a8522670611c540f4912e86b356412821/voicespoof_inference.py
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del modelo en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=thaki-voicespoof-w2v2-large
- Modelo base facebook/wav2vec2-large: https://huggingface.co/facebook/wav2vec2-large
