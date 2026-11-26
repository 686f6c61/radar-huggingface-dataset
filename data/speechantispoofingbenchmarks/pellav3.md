# SpeechAntiSpoofingBenchmarks/Pellav3

## Resumen

Pellav3 es un detector de deepfakes de audio (anti-spoofing) de pesos abiertos desarrollado por Sadanie en noviembre de 2026. Se trata de un sistema de dos vistas que combina dos codificadores auto-supervisados de gran tamano: XLS-R 1B, que procesa la forma de onda estandarizada, y w2v-BERT 2.0, que procesa caracteristicas log-mel fbank de 80 bins. Cada vista se proyecta a 256 dimensiones, se refina mediante bloques Res2 y las secuencias de frames se concatenan y agregan con attentive statistics pooling para producir un unico logit que indica la probabilidad de que el audio sea falso.

El modelo cuenta con 1.544,09 millones de parametros y se distribuye como un checkpoint de PyTorch en formato safetensors. Su proposito es discriminar entre voz bona fide (autentica) y voz sintetica o convertida, un problema central en la verificacion de locutor y la deteccion de fraude por voz. La puntuacion que emite es `-logit(fake)`, de modo que valores mas altos indican mayor probabilidad de audio autentico.

Su relevancia actual radica en que se publica como wrapper empaquetado para la Speech Anti-Spoofing Arena, un banco de pruebas comparativo de sistemas anti-spoofing. El modelo se situa en la categoria "no publicada" de la Arena (se muestra, no se clasifica) porque no existe articulo cientifico asociado y los datos de entrenamiento no se han divulgado. Aun asi, sus resultados en varios conjuntos de evaluacion estandar son muy competitivos, con tasas de error igual o inferiores al 1 % en ASVspoof2019_LA, ASVspoof2021_DF, InTheWild, CD-ADD, LibriSeVoc, SONAR y ArAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de dos vistas: XLS-R 1B (forma de onda) + w2v-BERT 2.0 (log-mel fbank), proyecciones a 256-d, bloques Res2 y attentive statistics pooling |
| Parametros totales | 1.544,09 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 4 s (64.000 muestras a 16 kHz); en la Arena se evalua un unico primer segmento de 4 s |
| Tipos de cuantizacion | no disponible (pesos en FP32; los autores usan autocast bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`pellav3_detector.safetensors`) |

## Arquitectura y entrenamiento

Pellav3 es un clasificador binario de audio construido sobre dos modelos auto-supervisados de gran tamano. La primera vista procesa la forma de onda estandarizada con XLS-R 1B y combina sus 49 estados ocultos mediante un softmax mix. La segunda vista procesa caracteristicas log-mel fbank de 80 bins estilo kaldi con w2v-BERT 2.0, combinando 25 estados. Cada vista se proyecta a 256 dimensiones y se refina con dos bloques Res2. Las secuencias de frames resultantes se concatenan por frame (512 dimensiones), se refinan con dos bloques Res2 compartidos y se agregan mediante attentive statistics pooling, seguidas de una capa `Linear(1024,1)` que produce el logit de falso.

El preprocesado de entrada es estricto: 16 kHz, eliminacion de la media, filtro paso alto de 20 Hz (Butterworth de segundo orden de fase cero), normalizacion de sonoridad ITU-R BS.1770 a -23 LUFS (semantica de pyloudnorm) y relleno con ceros hasta 4 s. Los autores promedian ventanas de 4 s cada 2 s en clips largos; en la Arena, dado el limite de 4 s, se puntua unicamente la primera ventana de 64.000 muestras.

No existe articulo cientifico ni model card detallada por parte de los autores originales. Los datos de entrenamiento no se han divulgado, por lo que no se puede descartar fuga de datos (leakage); la Arena senala que las puntuaciones en J-SPAW_LA estan perfectamente separadas, lo que resulta sospechoso. La inferencia se realizo en FP32 con TF32 desactivado en las tarjetas RTX 4070 Ti SUPER y RTX 5060 Ti, y con PyTorch en las RTX 4060 Ti; el wrapper de TensorRT coincidio con PyTorch en el conjunto completo de J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999).

## Capacidades

- Deteccion de audio deepfake: clasifica un clip de 4 s como voz autentica o sintetica/convertida mediante un unico logit.
- Puntuacion continua: emite `-logit(fake)`, lo que permite umbralizar segun el coste de falsos positivos y falsos negativos.
- Robustez multi-dominio: evaluado en conjuntos de spoofing TTS, voice conversion y deepfake en condiciones variadas (ASVspoof2019/2021/5, ADD22/2023, InTheWild, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, EmoSpoofTTS, LRLspoof).
- Inferencia por ventana: procesa clips de hasta 4 s de forma identica a los autores; para clips mas largos, el wrapper de la Arena recorta la primera ventana.
- Integracion en pipelines: disponible como checkpoint PyTorch con script de inferencia de referencia (`pellav3_infer.py`).
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo; es exclusivamente un clasificador de audio.

## Casos de uso

- Verificacion antifraude en banca y telecomunicaciones: el modelo puede puntuar llamadas grabadas o transmitidas en tiempo casi real para detectar voz sintetica en intentos de suplantacion de identidad, con umbral ajustable segun el coste operativo de cada falso positivo.
- Moderacion de contenido en plataformas de audio: integrado en un pipeline de subida de podcasts o notas de voz, clasifica cada segmento de 4 s y marca clips sospechosos para revision humana, aprovechando su EER de 0,55 % en ASVspoof2021_DF.
- Proteccion de sistemas de verificacion de locutor (ASV): como modulo complementario de un sistema ASV, filtra ataques de replay y sintesis antes de la decision de autenticacion, dado su rendimiento en ASVspoof2019_LA (0,57 % EER).
- Investigacion en deteccion de deepfakes: sirve como linea base fuerte y reproducible en la Speech Anti-Spoofing Arena para comparar nuevos detectores, con pesos fijos y preprocesado documentado.
- Analisis forense de evidencias de audio: peritajes que necesiten una senal cuantitativa de autenticidad de un clip corto, complementaria a la inspeccion pericial, con la cautela de que los datos de entrenamiento son desconocidos.
- Monitorizacion de campanas de desinformacion con voz clonada: procesamiento por lotes de grandes volumenes de audio para priorizar la revision de los clips con mayor probabilidad de ser sinteticos.
- Filtrado en la generacion de datos de entrenamiento para ASV: descartar automaticamente muestras sinteticas o corruptas antes de entrenar modelos de reconocimiento de locutor.

## Benchmarks y rendimiento

Resultados publicados en la model card de la Arena (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % en el umbral EER de DeepVoice):

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 0,57 |
| ASVspoof2021_LA | 1,63 |
| ASVspoof2021_DF | 0,55 |
| ASVspoof5 | 9,88 |
| InTheWild | 1,00 |
| ADD22_eval_31 | 1,08 |
| ADD2023_track12_test_r1 | 3,79 |
| CFAD | 9,72 |
| CD-ADD | 0,01 |
| CVoiceFake_small | 5,19 |
| DeepVoice | 1,91 |
| LibriSeVoc | 0,03 |
| SONAR | 0,04 |
| ArAD | 0,03 |
| J-SPAW_LA | separacion perfecta (posible fuga de datos) |

No se han publicado resultados comparativos directos con otros sistemas en la informacion disponible; el modelo figura en la categoria no clasificada de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 1.544,09 M de parametros; en FP32 son aproximadamente 6,2 GB solo de pesos, mas activaciones de XLS-R 1B y w2v-BERT 2.0, por lo que se recomienda al menos 12-16 GB de VRAM en FP32. Con autocast bfloat16 (como usan los autores) la huella se reduce aproximadamente a la mitad.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti (usadas por los autores con TensorRT en FP32), RTX 4060 Ti (PyTorch), A100/H100 para procesamiento por lotes de alto rendimiento.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bfloat16; en FP32 conviene 16 GB o mas.
- Opciones de despliegue: PyTorch con el script de inferencia de referencia, wrapper TensorRT (clase drop-in mencionada en la model card) y despliegue en la propia Speech Anti-Spoofing Arena.
- Latencia y throughput: no disponibles de forma numerica; la model card solo indica que TensorRT en FP32 coincidio con PyTorch en J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999).

## Comparativa con modelos similares

No se dispone de datos de otros sistemas anti-spoofing en la informacion proporcionada. La Speech Anti-Spoofing Arena permite comparar Pellav3 con otros sistemas participantes, pero sus cifras no se incluyen aqui.

| Modelo | Parametros | Contexto | EER ASVspoof2019_LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pellav3 | 1.544,09 M | 4 s | 0,57 % | MIT | Hugging Face (wrapper de la Arena) |
| Alternativas de la Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Datos de entrenamiento no divulgados y ausencia de articulo cientifico: no es posible auditar la composicion del dataset ni descartar fuga de datos. La separacion perfecta en J-SPAW_LA es una senal de alarma.
- Clasificacion no publicada en la Arena: se muestra pero no se clasifica, por lo que su posicion relativa frente a otros sistemas no esta validada.
- Ventana fija de 4 s: en la Arena solo se puntua la primera ventana de 64.000 muestras; clips mas largos no se evaluan completos con el wrapper. Los autores originales promedian ventanas cada 2 s, lo que puede dar resultados distintos.
- Preprocesado sensible: requiere 16 kHz, eliminacion de media, filtro paso alto de 20 Hz, normalizacion a -23 LUFS y relleno a 4 s; desviaciones del pipeline degradan la puntuacion.
- Rendimiento desigual: EER de 9,88 % en ASVspoof5, 9,72 % en CFAD y 5,19 % en CVoiceFake_small, muy por encima de los conjuntos clasicos; no es uniformemente robusto.
- Idiomas no especificados: se desconoce el rendimiento en lenguas de bajos recursos, pese a que XLS-R es multilingue.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos; la puntuacion debe tratarse como evidencia probabilistica, no como veredicto.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los modelos base (XLS-R 1B y w2v-BERT 2.0) y de los pesos re-alojados.
- Uso en produccion: requiere calibracion del umbral por dominio y validacion con datos propios antes de tomar decisiones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Pellav3
- Pesos (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Pellav3/blob/9bb345f5ec6dedc34f26458d5a5d545d9bb1c3ab/pellav3_detector.safetensors
- Modelo original de los autores: https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector
- Script de inferencia de referencia: https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector/blob/47b69420803c01de65af264ecdc2c5f35f2184f3/pellav3_infer.py
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha de Pellav3 en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=pellav3
