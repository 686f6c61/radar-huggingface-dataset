# SpeechAntiSpoofingBenchmarks/tropa-voice-mini

## Resumen

tropa-voice-mini es un detector de voz sintetica (anti-spoofing) publicado por wasitaigenerated.com en 2026 y reempaquetado por el equipo de SpeechAntiSpoofingBenchmarks para integrarlo en su Arena de evaluacion. Se trata de un encoder wav2vec 2.0 XLS-R de 300 M de parametros afinado de extremo a extremo con una cabeza de atencion multicapa (SLS head) que produce un unico logit de "voz IA". El modelo es el motor del tier pequeno de la API comercial de wasitaigenerated y se libera con licencia Apache 2.0.

El problema que resuelve es la deteccion de audio generado por sintesis de voz y deepfakes, una tarea critica para verificación de identidad, moderacion de contenido y forense de audio. Con 315,87 M de parametros totales y un checkpoint de 1,4 GB en safetensors, es lo bastante compacto para desplegarse en GPU de consumo, pero su entrenamiento se realizo sobre datos no divulgados por los autores, lo que impide descartar fuga de datos (leakage) en las evaluaciones publicadas.

Su relevancia actual radica en que ocupa la franja de "modelos no publicados" de la Speech Anti-Spoofing Arena: se muestra pero no se clasifica en el ranking. Aun asi, sus resultados en el conjunto ASVspoof2019_LA (EER 0,72 %) y en CD-ADD (EER 0,01 %) son competitivos, mientras que en ASVspoof5 (12,19 %) y CFAD (10,71 %) muestra debilidades claras de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M + SLS head (atencion multicapa sobre los 25 estados ocultos) |
| Parametros totales | 315.868.803 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.600 muestras a 16 kHz (4 s); clips mas cortos se repiten con padding |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32; existe wrapper TensorRT del autor) |
| Idiomas soportados | no disponible (encoder XLS-R multilingue, pero no se documenta el conjunto de idiomas evaluados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch); el autor dispone de un wrapper TensorRT |
| Frecuencia de muestreo | 16 kHz |
| Normalizacion de entrada | zero-mean / unit-std por ventana, dentro del modelo |
| Precision de referencia | FP32 (TF32 desactivado) |
| Tamano del repositorio | 1,4 GB |
| Pipeline HF | no disponible |

## Arquitectura y entrenamiento

El modelo parte de un encoder wav2vec 2.0 XLS-R de 300 M de parametros, preentrenado de forma autosupervisada sobre audio multilingue, y se afina de extremo a extremo para la tarea binaria de deteccion de voz sintetica. Sobre las 25 capas ocultas del encoder se aplica una SLS head: una compuerta softmax que pondera dinamicamente todos los estados ocultos, seguida de LayerNorm, una proyeccion Linear(1024, 256), activacion GELU, pooling de estadisticos atencionales (attentive statistics pooling) y un MLP de dos capas que produce un unico logit de "voz IA". La normalizacion de la forma de onda (media cero, desviacion estandar unitaria) se realiza dentro del modelo por ventana.

No se ha divulgado la composicion del dataset de entrenamiento ni el numero de tokens o horas de audio utilizadas, ni si hubo etapas de RLHF, DPO o ajuste fino con datos etiquetados de forma supervisada mas alla del propio fine-tuning. El autor puntua ventanas de 6 s con un salto de 3 s sobre el clip completo y calibra la media del 30 % de logits mas alto; el wrapper de la Arena, en cambio, trunca a las primeras 64.600 muestras (4 s). El score final es `-(logit AI pre-calibracion)`, de modo que valores mas altos indican voz humana (bona fide).

## Capacidades

- Deteccion binaria de voz humana frente a voz generada por IA (TTS, voice conversion, deepfakes).
- Puntuacion continua por clip: devuelve un logit calibrable, no solo una etiqueta.
- Procesamiento de audio a 16 kHz con ventanas de hasta 4 s (64.600 muestras); clips mas cortos se repiten con padding.
- Encoder XLS-R multilingue, lo que en principio permite trabajar con habla en varios idiomas, aunque no se documenta el alcance exacto.
- Integracion con PyTorch (checkpoint safetensors) y con un wrapper TensorRT del autor para inferencia acelerada.
- No soporta tool calling, function calling, agentes, vision ni audio generation: es exclusivamente un clasificador de audio.
- No dispone de modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Verificacion de identidad en banca y telecomunicaciones: el modelo puede puntuar llamadas entrantes en tiempo real y marcar como sospechosas aquellas con logit de voz IA alto, gracias a su tamano compacto (315 M) que permite inferencia en GPU de consumo.
- Moderacion de contenido en plataformas de audio: integrado en un pipeline de subida de podcasts o mensajes de voz, el detector filtra clips sinteticos antes de su publicacion usando ventanas de 4 s.
- Forense de audio y peritaje judicial: como primera pasada sobre grabaciones incautadas, el score continuo permite priorizar las muestras que requieren analisis pericial mas profundo.
- Proteccion de sistemas de autenticacion por voz: desplegado como capa previa al verificador de hablante, bloquea ataques de replay y de sintesis (spoofing) antes de que lleguen al motor biometrico.
- Deteccion de desinformacion en campanas electorales: analisis por lotes de audios virales para identificar locuciones clonadas de politicos o figuras publicas.
- Investigacion en anti-spoofing: el checkpoint sirve como baseline reproducible en la Speech Anti-Spoofing Arena y como punto de partida para fine-tuning en dominios especificos (p. ej. ASVspoof5 o CFAD, donde su EER es alto).
- Control de calidad en pipelines de sintesis de voz: los equipos que entrenan TTS pueden usar el detector para medir la "humanidad" residual de sus audios generados y detectar artefactos.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % en el umbral EER de DeepVoice):

| Conjunto de evaluacion | EER (%) |
|---|---|
| ASVspoof2019_LA | 0,72 |
| ASVspoof2021_LA | 3,22 |
| ASVspoof2021_DF | 2,14 |
| ASVspoof5 | 12,19 |
| InTheWild | 1,27 |
| ADD22_eval_31 | 3,93 |
| ADD2023_track12_test_r1 | 5,33 |
| CFAD | 10,71 |
| CD-ADD | 0,01 |
| CVoiceFake_small | 5,53 |
| DeepVoice | 5,27 |
| LibriSeVoc | 0,54 |
| SONAR | 0,35 |
| ArAD | 3,56 |
| DECRO | 3,73 |
| J-SPAW_LA | 0,12 |

No se han publicado resultados de benchmarks de otros modelos comparables en la informacion disponible. El modelo figura en el tier "unpublished" de la Arena (se muestra, no se clasifica) por no disponer de datos de entrenamiento divulgados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (315,87 M x 4 bytes), mas activaciones y buffers; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas por el autor en sus evaluaciones: RTX 4070 Ti SUPER y RTX 5060 Ti (ambas con wrapper TensorRT en FP32), y RTX 4060 Ti (PyTorch).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090, asi como en GPUs de portatil con 6 GB o mas.
- Despliegue: PyTorch nativo (checkpoint safetensors), wrapper TensorRT del autor para aceleracion; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de audio de este tipo).
- Latencia y throughput: no disponibles de forma numerica; el autor reporta que el wrapper TensorRT coincide con PyTorch en el conjunto completo J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999), lo que sugiere que la aceleracion no degrada la calidad de las puntuaciones.
- La ventana de entrada esta limitada a 64.600 muestras (4 s); clips mas largos deben trocearse y agregarse (p. ej. media del top-30 % de logits, como hace el autor).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. A modo de referencia estructural:

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| tropa-voice-mini | 315,87 M | 4 s (64.600 muestras) | Apache 2.0 | Hugging Face, weights safetensors |
| Alternativas de la misma categoria (AASIST, RawNet2, wav2vec2-AASIST) | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con detectores como AASIST o RawNet2 no puede realizarse con los datos disponibles; se recomienda consultar la Speech Anti-Spoofing Arena para obtener rankings actualizados de modelos con datos de entrenamiento divulgados.

## Limitaciones y advertencias

- Datos de entrenamiento no divulgados: no puede descartarse fuga de datos (leakage) en los conjuntos de evaluacion, por lo que los EER publicados deben interpretarse con cautela.
- Rendimiento irregular entre dominios: EER de 0,01 % en CD-ADD frente a 12,19 % en ASVspoof5 y 10,71 % en CFAD; la generalizacion a condiciones acusticas no vistas es limitada.
- Ventana de entrada fija de 4 s: clips mas largos requieren troceado y agregacion manual; el propio autor usa ventanas de 6 s con salto de 3 s y calibracion del top-30 %, lo que no replica exactamente el wrapper de la Arena.
- El score es un logit pre-calibracion: para uso en produccion es necesario calibrar el umbral sobre datos propios; el umbral de referencia del autor es el EER de DeepVoice.
- Sesgos conocidos: no documentados; al no divulgarse la composicion del dataset, no puede evaluarse el sesgo por idioma, genero, edad o acento.
- Riesgo de falsos positivos en voz humana con procesamiento agresivo (codecs, ruido, reverberacion) y de falsos negativos ante sintetizadores muy recientes no representados en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantias; el autor original no ofrece soporte ni mantenimiento documentado.
- Es un clasificador de audio, no un modelo generativo: no debe esperarse generacion de texto, codigo ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/tropa-voice-mini
- Checkpoint safetensors (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/tropa-voice-mini/blob/c57dd5ffc505ee75c8109469d0e11fa1239d3b6f/model.safetensors
- Codigo original del autor (detector.py): https://huggingface.co/wasitaigeneratedcom/ai-voice-detector-small/blob/4858b4064b1f8530def904e6340d2780ad847160/detector.py
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del modelo en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=tropa-voice-mini
- Paper: no disponible (modelo en el tier "unpublished" de la Arena)
