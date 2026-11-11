# SpeechAntiSpoofingBenchmarks/WeDefense-W2V2-Large-MHFA

## Resumen

WeDefense-W2V2-Large-MHFA es un sistema de deteccion de audio falsificado (anti-spoofing) empaquetado para su evaluacion en la Speech Anti-Spoofing Arena. Lo desarrolla el grupo SpeechAntiSpoofingBenchmarks a partir del codigo y el paper del toolkit WeDefense (Zhang et al., 2026), y resuelve un problema concreto: distinguir voz real (bona fide) de voz sintetica o convertida (spoof) en escenarios de deepfake de audio. El modelo combina un front-end wav2vec 2.0 Large preentrenado en LibriSpeech-960 y ajustado en ASVspoof 5 con un back-end de pooling atencional factorizado multi-cabeza (MHFA).

La relevancia actual es alta: la deteccion de voz sintetica es una linea de defensa critica frente a estafas telefonicas, suplantacion de identidad y desinformacion con audio generado. Este checkpoint concreto no rehostea los pesos originales por restricciones del autor; el repositorio actua como envoltorio de evaluacion y referencia al checkpoint original alojado en otra cuenta de Hugging Face.

El modelo tiene 318,7 M de parametros, procesa waveform de 16 kHz en ventanas de 4 segundos (64.600 muestras) y produce una puntuacion continua donde valores mas altos indican voz bona fide. Su licencia es Apache 2.0 para el codigo de empaquetado, aunque los pesos originales no se redistribuyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large (front-end SSL) + Multi-Head Factorized Attentive Pooling (MHFA) + cabeza lineal 256->2 |
| Parametros totales | 318,6973 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64.600 muestras a 16 kHz (4 s); clips mas cortos se repiten con padding |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en FP32; TF32 desactivado) |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto) |
| Licencia | Apache 2.0 (empaquetado); pesos originales no rehosteados, sin licencia concedida por el autor |
| Formato de pesos | checkpoint PyTorch (referenciado externamente, no incluido en este repo) |

## Arquitectura y entrenamiento

El sistema sigue un esquema clasico de dos etapas para anti-spoofing. El front-end es un wav2vec 2.0 Large preentrenado en LibriSpeech-960 sin fine-tuning adicional (variante s3prl `wav2vec2_large_960`), del que se extraen los 25 estados ocultos (24 entradas de capa del encoder mas la salida final, cada uno de 1024 dimensiones). Estos se apilan, se normalizan por media sobre el eje de caracteristicas (equivalente al `apply_cmvn` del toolkit) y se agregan mediante MHFA con 32 cabezas, compresion a 128 dimensiones y embedding de 256 dimensiones. Sobre ese embedding se aplica una cabeza lineal 256->2 que produce los logits de bona fide y spoof.

El entrenamiento se realizo exclusivamente sobre el split train de ASVspoof 5, sin aumento de datos, durante 5 epocas, promediando los dos ultimos checkpoints. La puntuacion final se calcula como `logit[bonafide] - logit[spoof]`. La inferencia se ejecuta en FP32 con TF32 desactivado. No se documenta uso de RLHF ni DPO, ya que es un clasificador binario y no un modelo generativo. Una innovacion destacable es el uso de todos los estados ocultos del encoder SSL en lugar de solo la capa final, lo que aporta informacion de multiples niveles de abstraccion acustica al pooling.

## Capacidades

- Deteccion binaria de voz spoof frente a voz bona fide a partir de waveform de 16 kHz.
- Clasificacion de deepfakes de voz generados por TTS y por conversion de voz (VC).
- Puntuacion continua calibrada (`logit[bonafide] - logit[spoof]`) util para umbralizar en produccion.
- Procesamiento de clips de hasta 4 segundos con padding por repeticion para clips mas cortos.
- Evaluacion multi-dominio validada en 17 conjuntos de datos (ASVspoof 2019/2021/5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW_LA, entre otros).
- Compatible con una implementacion TensorRT que replica el comportamiento de PyTorch en FP32.
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso: es un clasificador acustico especializado.

## Casos de uso

- Verificacion de autenticidad en llamadas telefonicas: el modelo puntua cada segmento de 4 s de una llamada y permite al sistema de telefonia marcar alertas cuando la puntuacion de spoof supera un umbral, mitigando estafas con voz clonada.
- Moderacion de contenido en plataformas de audio: procesar subidas de podcasts o notas de voz y rechazar o etiquetar clips sinteticos antes de su publicacion, aprovechando la validacion en datasets como InTheWild y CVoiceFake.
- KYC y banca por voz: como capa adicional en procesos de verificacion de identidad telefonica, combinando la deteccion de spoof con la verificacion de locutor para reducir el fraude por suplantacion.
- Analisis forense de evidencia: peritaje de grabaciones aportadas como prueba, generando una puntuacion objetiva por segmento que complemente el analisis humano en casos de supuesta manipulacion.
- Filtrado en pipelines de recogida de datos: descartar muestras sinteticas en corpus de voz recopilados de internet antes de usarlos para entrenar modelos de ASR o TTS, evitando contaminacion del dataset.
- Investigacion en anti-spoofing: servir como baseline reproducible en la Speech Anti-Spoofing Arena para comparar nuevos sistemas con metricas EER homogeneas en 17 conjuntos de datos.
- Monitorizacion de medios: detectar campanas de desinformacion con audio sintetico en redes sociales, procesando clips cortos en lote con la implementacion TensorRT para alto rendimiento.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) reportados en la model card. EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% con el umbral EER de DeepVoice; no se incluyen sus valores numericos en la informacion disponible.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 18,24 |
| ASVspoof2021_LA | 22,64 |
| ASVspoof2021_DF | 13,78 |
| ASVspoof5 | 8,94 |
| InTheWild | 13,78 |
| ADD22_eval_31 | 21,57 |
| ADD2023_track12_test_r1 | 19,39 |
| CFAD | 24,56 |
| CD-ADD | 7,78 |
| CVoiceFake_small | 30,92 |
| DeepVoice | 16,93 |
| LibriSeVoc | 17,87 |
| SONAR | 38,05 |
| ArAD | 24,82 |
| DECRO | 37,76 |
| J-SPAW_LA | 2,38 |

No se dispone de resultados comparativos con otros sistemas de la Arena en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (318,7 M parametros x 4 bytes), mas activaciones y buffers; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti son las empleadas por los autores para la implementacion TensorRT; tambien valido en A100, H100, L4, T4 y RTX 4090 sin problema de capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM (GTX 1660, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: PyTorch nativo (referencia), TensorRT (implementacion drop-in validada por los autores), y potencialmente ONNX Runtime si se exporta; no se documenta soporte de vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numerica; los autores indican que la implementacion TensorRT en FP32 coincide con PyTorch en el conjunto completo J-SPAW_LA, lo que sugiere precision numerica equivalente.

## Comparativa con modelos similares

No se dispone de datos de otros sistemas de la misma categoria en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, este modelo se situa en la familia de detectores basados en front-ends SSL (wav2vec 2.0, WavLM, HuBERT) con back-ends de pooling atencional, pero no se aportan resultados de esos sistemas en el material recibido.

| Modelo | Parametros | Contexto | EER ASVspoof5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeDefense-W2V2-Large-MHFA | 318,7 M | 4 s (64.600 muestras) | 8,94% | Apache 2.0 (empaquetado); pesos no rehosteados | Referencia externa al checkpoint |
| Alternativas SSL anti-spoofing | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos originales no se redistribuyen en este repositorio; es necesario descargar el checkpoint del autor original (JYP2024/Wav2vec2_Large_960-MHFA-ASV5) y verificar su sha256 segun las notas de `meta.yaml`.
- Entrenado unicamente en ASVspoof 5 train sin aumento de datos, lo que puede limitar la generalizacion a dominios no representados; los EER elevados en SONAR (38,05%), DECRO (37,76%) y CVoiceFake (30,92%) apuntan a esta debilidad en dominios fuera de distribucion.
- Ventana fija de 4 segundos: clips mas largos deben segmentarse y agregarse, y clips mas cortos se repiten con padding, lo que puede alterar la distribucion acustica.
- No procesa texto ni comprende contenido semantico; solo detecta artefactos acusticos de sintesis o conversion.
- Riesgo de falsos positivos en voces con caracteristicas atipicas (microfono de baja calidad, ruido de fondo, patologias vocales) no cuantificado en la informacion disponible.
- La licencia Apache 2.0 cubre el empaquetado, pero el autor original no concede licencia explicita sobre los pesos; verificar condiciones antes de uso comercial.
- Requiere senal a 16 kHz sin normalizacion; un preprocesado incorrecto degrada el rendimiento.
- Inferencia en FP32 con TF32 desactivado; usar TF32 o FP16 sin validacion puede alterar las puntuaciones.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/SpeechAntiSpoofingBenchmarks/WeDefense-W2V2-Large-MHFA
- Checkpoint original de los pesos: https://huggingface.co/JYP2024/Wav2vec2_Large_960-MHFA-ASV5/tree/8591bfe3eddd303af79f29b4eddad00c5d156f99
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Entrada del modelo en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=wedefense-w2v2-large-mhfa
- Codigo del toolkit WeDefense (commit de referencia): https://github.com/zlin0/wedefense/tree/e7287fe125cefc4903ff6614afcaa6ae53842b19/egs/detection/asvspoof5/v15_ssl_mhfa
- Paper (arXiv:2601.15240): https://arxiv.org/abs/2601.15240
