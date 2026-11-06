# SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P1

## Resumen

Vocoded-VoxCeleb2-SSL-P1 es un sistema de contramedidas (countermeasure) para la deteccion de voz sintetica y deepfakes de audio, empaquetado por el proyecto Speech Anti-Spoofing Benchmarks para su evaluacion en el espacio Speech Anti-Spoofing Arena. El modelo original procede del laboratorio NII Yamagishi Lab y corresponde al modelo identificado como P1 en el trabajo de Wang y Yamagishi presentado en ICASSP 2024 (arXiv:2309.06014). No es un modelo generativo de lenguaje, sino un clasificador binario que distingue entre audio bona fide (humano) y audio spoof (generado o manipulado).

Tecnicamente, el sistema combina un front end auto-supervisado wav2vec 2.0 de tipo XLSR-53, que ha sido preentrenado de forma continua sobre mas de 9.000 horas de VoxCeleb2 re-sintetizado con multiples vocoders neuronales (de ahi el termino "vocoded"), con un back end ligero formado por capas lineales y bloques con Monte-Carlo dropout. El modelo completo tiene 317.571.590 parametros y se afina sobre el conjunto voc.LA (ASVspoof 2019 LA train bona fide vocodificado, aproximadamente 10 horas) con aumentacion RawBoost.

Su relevancia actual radica en la creciente necesidad de detectar audio generado por TTS y voice cloning en escenarios forenses, de moderacion de contenido y de verificacion biometrica. Este checkpoint concreto se distribuye con licencia BSD-3-Clause y esta integrado en un banco de pruebas comparativo que evalua su robustez frente a multiples datasets de referencia, lo que facilita la reproducibilidad y la comparacion con otros sistemas anti-spoofing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front end wav2vec 2.0 XLSR-53 (SSL) + back end de capas lineales con LeakyReLU y MC-dropout |
| Parametros totales | 317.571.590 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana fija de 64.600 muestras de audio, con repeticion por tiling en clips mas cortos) |
| Tipos de cuantizacion | FP32 (checkpoint en safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el front end XLSR-53 es multilingue, pero no se especifica en la ficha) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (repo de 1,4 GB, libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un diseno en dos etapas. El front end es un wav2vec 2.0 basado en XLSR-53, preentrenado de forma auto-supervisada con fairseq sobre mas de 9.000 horas de VoxCeleb2 re-sintetizado mediante multiples vocoders neuronales. Este preentrenamiento continuado sobre audio vocodificado es la innovacion central del trabajo: expone al extractor de caracteristicas a los artefactos tipicos que introducen los vocoders, mejorando la deteccion de voz sintetica. El back end consta de una capa Linear 1024->128, tres bloques compuestos por Linear + LeakyReLU + MC-dropout (p=0.5), un mean pooling sobre frames y una capa final Linear 128->2.

El ajuste fino se realiza sobre voc.LA, la particion de entrenamiento bona fide de ASVspoof 2019 LA vocodificada, con aproximadamente 10 horas de audio y aumentacion RawBoost. La puntuacion de inferencia es el logit de la media de la softmax bona fide sobre 144 muestras de Monte-Carlo dropout con mascaras fijas por clip (el protocolo de scoring de los autores). El checkpoint liberado es la semilla 01 en FP32 y usa una ventana determinista de las primeras 64.600 muestras, con repeticion por tiling si el clip es mas corto; esto difiere del protocolo de utterance completa del paper original, un caveat importante para reproducir resultados.

## Capacidades

- Deteccion de audio spoof: clasifica una senal de audio como bona fide o generada/manipulada.
- Deteccion de deepfakes de voz: identifica voz sintetizada por TTS y vocoders neuronales.
- Puntuacion continua: devuelve un score (mayor = bona fide) utilizable para umbralizar en pipelines de decision.
- Robustez a vocoders: entrenado especificamente sobre audio vocodificado, lo que mejora la deteccion de artefactos de sintesis.
- Inferencia determinista por ventana: procesa una ventana fija de 64.600 muestras, con repeticion por tiling para clips cortos.
- No soporta tool calling, function calling, agentes ni generacion de texto; es un clasificador de audio puro.

## Casos de uso

- Verificacion biometrica antifraude: integrar el modelo como segunda capa de defensa en sistemas de autenticacion por voz, rechazando intentos de suplantacion con voz clonada antes de validar la identidad del hablante.
- Moderacion de contenido en plataformas de audio: analizar clips subidos por usuarios para marcar posibles deepfakes antes de su publicacion, usando el score como senal de revision humana.
- Analisis forense de grabaciones: apoyar a peritos que necesitan una primera clasificacion automatica de evidencia sonora, complementando el analisis manual con un score reproducible.
- Deteccion de fraude telefonico (vishing): desplegar el modelo en pasarelas de telefonia IP para alertar en tiempo real cuando una llamada entrante usa voz sintetizada.
- Evaluacion de sistemas TTS: usar el modelo como discriminador automatico para medir la naturalidad y detectabilidad de un nuevo sistema de sintesis durante su desarrollo.
- Monitorizacion de campanas de desinformacion: procesar grandes volumenes de audio en redes sociales para identificar patrones de voz generada y rastrear su origen.
- Investigacion en anti-spoofing: emplear el checkpoint como baseline reproducible en experimentos academicos, gracias a su integracion en el Speech Anti-Spoofing Arena y su licencia permisiva.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) publicados en la model card del autor. EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR% en el umbral EER de DeepVoice.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 3,19 |
| ASVspoof2021_LA | 16,97 |
| ASVspoof2021_DF | 6,15 |
| ASVspoof5 | 17,07 |
| InTheWild | 6,59 |
| ADD22_eval_31 | 16,41 |
| ADD2023_track12_test_r1 | 36,08 |
| CFAD | 15,31 |
| CD-ADD | 12,71 |
| CVoiceFake_small | 16,95 |
| DeepVoice | 29,46 |
| LibriSeVoc | 2,2 |
| SONAR | 17,68 |
| ArAD | 36,97 |
| DECRO | 24,39 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el checkpoint de 317,57 M de parametros ocupa aproximadamente 1,3 GB; con activaciones y buffers de inferencia, se estima un consumo en torno a 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Segun la model card, se han usado RTX 4070 Ti SUPER (con clase TensorRT drop-in) y RTX 5060 Ti (PyTorch) para las evaluaciones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (RTX 3060 en adelante) e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo y una clase TensorRT drop-in mencionada por los autores; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vocoded-VoxCeleb2-SSL-P1 | 317,57 M | wav2vec 2.0 XLSR-53 + back end lineal | Ventana fija de 64.600 muestras | BSD-3-Clause | Hugging Face (este repo) |
| Vocoded-VoxCeleb2-SSL-P3 | no disponible | no disponible | no disponible | no disponible | Hugging Face (SpeechAntiSpoofingBenchmarks) |
| AASIST | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| RawNet2 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento entre estos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint usa una ventana determinista de las primeras 64.600 muestras con repeticion por tiling, no el protocolo de utterance completa del paper; los resultados pueden diferir de los publicados originalmente.
- El rendimiento cae notablemente en datasets fuera de dominio: EER de 36,08% en ADD2023_track12_test_r1, 36,97% en ArAD y 29,46% en DeepVoice, lo que indica poca generalizacion a ciertos ataques y condiciones acusticas.
- Riesgo de falsos positivos y negativos en audio con ruido, musica de fondo o codecs agresivos no representados en entrenamiento.
- Entrenado principalmente sobre datos vocodificados (voc.LA y VoxCeleb2 vocodificado); puede degradarse ante ataques de spoofing no vocodificados o generados por tecnicas no vistas.
- No se documentan sesgos demograficos, de idioma o de acento; el front end XLSR-53 es multilingue, pero el ajuste fino se realizo sobre datos en ingles.
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin endoso, pero se recomienda revisar los terminos de los datasets de entrenamiento subyacentes (ASVspoof, VoxCeleb2) para produccion.
- Es un clasificador de audio, no un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Solo 6 descargas y 0 likes en el momento de la consulta, lo que sugiere validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P1
- Checkpoint (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P1/blob/8d1a95e66c55b0a5b80667d44028f54bade39744/model.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Codigo de los autores: https://github.com/nii-yamagishilab/project-NN-Pytorch-scripts/tree/b529705b65588d62db17b56f98636ee734ff725e/project/10-asvspoof-vocoded-trn-ssl
- Paper (arXiv): https://arxiv.org/abs/2309.06014
- Modelo relacionado (P3): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P3
