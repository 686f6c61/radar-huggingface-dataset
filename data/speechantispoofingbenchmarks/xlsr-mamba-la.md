# SpeechAntiSpoofingBenchmarks/XLSR-Mamba-LA

## Resumen

XLSR-Mamba-LA es un sistema de deteccion de voz sintetica (anti-spoofing) desarrollado por Xiao y Das y publicado en IEEE Signal Processing Letters. El modelo combina un front-end wav2vec 2.0 XLS-R de 300 M de parametros, afinado completamente en su ultima capa, con un back-end basado en Mamba bidireccional de doble columna. Su tarea es discriminar entre voz bona fide (humana) y voz generada por TTS o convertida por voice conversion, devolviendo una puntuacion de verosimilitud a partir de la cual se calcula la tasa de error igual (EER).

Este checkpoint concreto es la variante afinada para el track LA (logical access) de ASVspoof2019, entrenada exclusivamente con el conjunto de entrenamiento de dicho corpus y aumentacion RawBoost (algoritmo 5). Ha sido empaquetado por el proyecto Speech Anti-Spoofing Arena para servir como referencia reproducible en una comparativa publica de sistemas anti-spoofing, con resultados por dataset publicados en la model card.

Su relevancia actual reside en dos factores: por un lado, el uso de un modelo de estado selectivo (Mamba) en lugar del habitual back-end LSTM o Transformer sobre embeddings XLS-R, lo que reduce el coste computacional del back-end manteniendo precision; por otro, su inclusion en un banco de pruebas estandarizado que permite medir la generalizacion fuera de dominio, un problema central en la deteccion de deepfakes de audio. El modelo tiene 319.327.544 parametros y un peso de repositorio de 1,4 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end wav2vec 2.0 XLS-R 300M (ultima capa afinada) + proyeccion 144-d (Linear + BatchNorm + SELU) + back-end Mamba v1 bidireccional de doble columna (6 bloques forward + 6 backward, add+RMSNorm fusionado, attention pooling por direccion, fusion lineal y cabeza de 2 clases) |
| Parametros totales | 319.327.544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada fija de 66.800 muestras a 16 kHz, aproximadamente 4,18 s; los clips mas cortos se rellenan por repeticion) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en FP32) |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto; el entrenamiento se realizo sobre ASVspoof2019 LA, en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, commit fijado 31fea7e) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido convolucional-transformer-Mamba. El front-end es un wav2vec 2.0 XLS-R de 300 M de parametros completamente afinado en su ultima capa, que extrae representaciones acusticas auto-supervisadas. Estas se proyectan a 144 dimensiones mediante una capa lineal seguida de BatchNorm y activacion SELU. El back-end es un Mamba v1 (SSM selectivo) bidireccional de doble columna: seis bloques Mamba en direccion forward y seis en direccion backward, con fusion de la suma residual y RMSNorm en cada bloque, attention pooling independiente por direccion, concatenacion de ambas representaciones y una fusion lineal final que alimenta una cabeza de dos clases (bona fide frente a spoof).

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de ASVspoof2019 LA, con aumentacion de datos RawBoost en su algoritmo 5. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador acustico. La innovacion tecnica destacable es la sustitucion del back-end recurrente o Transformer habitual por bloques Mamba bidireccionales, que reducen el coste de atencion sobre secuencias largas de frames acusticos. La puntuacion del modelo es `logits[:, 1]`, donde valores mas altos indican mayor probabilidad de voz bona fide.

## Capacidades

- Deteccion binaria de voz sintetica: clasifica un clip de audio como bona fide o spoof y devuelve un logit utilizable como puntuacion continua para umbralizar.
- Deteccion de deepfakes de audio generados por TTS y por voice conversion, incluyendo ataques de logical access.
- Robustez parcial frente a aumentaciones y condiciones de canal, gracias al entrenamiento con RawBoost.
- Procesamiento de audio a 16 kHz con ventana fija de 66.800 muestras (aproximadamente 4,18 s); los clips mas cortos se rellenan por repeticion.
- Inferencia en FP32 con envoltorio PyTorch y clase equivalente en TensorRT.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador acustico puro.
- No dispone de capacidades multilingues declaradas ni de modo thinking, vision o audio generativo.

## Casos de uso

- Verificacion de autenticidad en plataformas de atencion al cliente telefonica: el modelo puede puntuar cada locucion entrante y marcar como sospechosa la voz sintetica antes de procesar una solicitud sensible, con una ventana de 4,18 s suficiente para la mayoria de turnos de habla.
- Filtrado en pipelines de grabacion de reuniones y notas de voz: integrado como paso previo al ASR, descarta o etiqueta segmentos generados por TTS para evitar transcripciones fraudulentas o sinteticas.
- Auditoria de medios y periodismo: analisis de clips de audio recibidos para verificar si la voz es humana, usando la puntuacion continua para priorizar revision manual en los casos cercanos al umbral.
- Deteccion de fraude en banca por voz: como capa adicional en sistemas de autenticacion biometrica, complementando el reconocimiento de hablante con una senal de spoofing calculada sobre la misma ventana de audio.
- Investigacion en seguridad de modelos TTS: banco de pruebas para medir la robustez de nuevos sintetizadores frente a un detector publicado, con resultados de referencia en ASVspoof2019 LA, ASVspoof2021 LA/DF, ASVspoof5, InTheWild y otros conjuntos del Arena.
- Despliegue en produccion con TensorRT: la model card indica que la clase TensorRT en FP32 igualo al envoltorio PyTorch en el conjunto completo J-SPAW_LA, lo que permite servir el detector con baja latencia en GPUs de inferencia.
- Evaluacion comparativa de sistemas anti-spoofing: al estar empaquetado para el Speech Anti-Spoofing Arena, sirve como baseline reproducible para comparar nuevos detectores bajo el mismo protocolo y umbrales.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor). EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR % en el umbral EER de DeepVoice; el resto son EER.

| Conjunto de evaluacion | EER (%) |
|---|---|
| ASVspoof2019 LA | 0,42 |
| ASVspoof2021 LA | 6,40 |
| ASVspoof2021 DF | 5,37 |
| ASVspoof5 | 14,40 |
| InTheWild | 6,66 |
| ADD22_eval_31 | 28,81 |
| ADD2023_track12_test_r1 | 27,64 |
| CFAD | 23,04 |
| CD-ADD | 38,28 |
| CVoiceFake_small | 18,37 |
| DeepVoice | 39,64 |
| LibriSeVoc | 6,63 |
| SONAR | 39,27 |
| ArAD | 26,83 |
| DECRO | 12,10 |
| J-SPAW_LA | 18,03 |
| ODSS | 30,55 |
| HABLA | 7,95 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador acustico. No se proporcionan comparaciones numericas directas con otros sistemas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (319,3 M de parametros), mas activaciones y buffers de audio; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: T4, L4, RTX 3060/4060 o superiores para inferencia en tiempo real; A10G, L40S, A100 y H100 para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien es viable en CPU para lotes pequenos, aunque con mayor latencia.
- Opciones de despliegue: PyTorch nativo (envoltorio incluido), TensorRT (clase drop-in en FP32 validada contra PyTorch en J-SPAW_LA). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventana de entrada fija de 66.800 muestras a 16 kHz implica un coste por clip acotado y constante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLSR-Mamba-LA (este) | 319,3 M | 66.800 muestras a 16 kHz (~4,18 s) | XLS-R 300M + Mamba bidireccional | MIT | Hugging Face, safetensors |
| XLSR-Mamba-DF | no disponible | no disponible | Misma arquitectura, checkpoint afinado con RawBoost para DF | MIT (segun model card) | Hugging Face, mismo autor |
| XLSR-MamBo | no disponible | no disponible | Modelo distinto, no debe confundirse con este | no disponible | arXiv 2601.02944 |
| AASIST y variantes | no disponible | no disponible | Detectores anti-spoofing clasicos basados en grafos | no disponible | no disponible en la informacion |

No se dispone de datos numericos comparativos entre estos sistemas en la informacion proporcionada. La model card advierte explicitamente de no confundir XLSR-Mamba con XLSR-MamBo (arXiv 2601.02944), que es un modelo diferente.

## Limitaciones y advertencias

- Entrenado exclusivamente con ASVspoof2019 LA train: la generalizacion fuera de dominio es limitada, como reflejan las EER superiores al 20 % en ADD22, ADD2023, CFAD, CD-ADD, DeepVoice, SONAR, ArAD, ODSS y J-SPAW_LA.
- La EER en DeepVoice alcanza el 39,64 %, lo que indica un rendimiento deficiente frente a sintetizadores no vistos durante el entrenamiento.
- La ventana de entrada es fija (66.800 muestras); clips mas largos requieren troceado y agregacion de puntuaciones, y los mas cortos se rellenan por repeticion, lo que puede alterar la distribucion acustica.
- Es un clasificador binario: no identifica el tipo de ataque ni el sintetizador, solo la probabilidad de spoof.
- No se documentan sesgos por idioma, acento o canal en la informacion disponible; el entrenamiento se realizo sobre un corpus en ingles, por lo que el comportamiento en otras lenguas no esta caracterizado.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en funcion del umbral elegido; la puntuacion es un logit y requiere calibracion por dominio.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor original no ofrece soporte en este repositorio empaquetado.
- La clase TensorRT solo se valido en FP32 contra PyTorch en J-SPAW_LA; no se documenta validacion en otras precisiones.
- El repositorio tiene un uso muy bajo (117 descargas, 0 likes), por lo que la comunidad de usuarios es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Mamba-LA
- Peso commit-pinned: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-Mamba-LA/blob/31fea7e9a1ac4fdb39293398e1f0ff7f015403ce/model.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=xlsr-mamba-la
- Paper: https://arxiv.org/abs/2411.10027
- Codigo de los autores: https://github.com/swagshaw/XLSR-Mamba
- Modelo distinto a no confundir (XLSR-MamBo): https://arxiv.org/abs/2601.02944
