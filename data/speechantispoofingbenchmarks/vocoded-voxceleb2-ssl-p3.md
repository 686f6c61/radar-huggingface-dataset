# SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P3

## Resumen

Vocoded-VoxCeleb2-SSL-P3 es un contramedida (countermeasure) de anti-spoofing de voz, no un modelo generativo de lenguaje. Lo publica el grupo SpeechAntiSpoofingBenchmarks como wrapper empaquetado para la Speech Anti-Spoofing Arena, a partir del código y el paper originales de Wang y Yamagishi (NII, ICASSP 2024). Su tarea es discriminar entre audio bona fide y audio sintético (deepfake o voz procesada por vocoders neuronales), devolviendo una puntuación donde valores más altos indican mayor probabilidad de audio genuino.

El sistema combina un front end auto-supervisado wav2vec 2.0 inicializado desde XLSR-53 y destilado de la diferencia de características entre dos modelos profesor (v.vox menos XLSR-53), con un back end ligero de clasificación binaria. Suma 317.571.590 parámetros en FP32 y se distribuye como un único `model.safetensors` de 1,4 GB bajo licencia BSD-3-Clause.

Su relevancia es doble: por un lado, es la implementación de referencia del modelo de un solo SSL propuesto en el paper, con un protocolo de scoring basado en 144 muestras de Monte-Carlo dropout; por otro, está integrado en un banco de evaluación comparativo (la Arena) que publica EER por conjunto de datos, lo que permite situarlo frente a otros sistemas con métricas homogéneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front end wav2vec 2.0 (XLSR-53, destilado) + back end MLP con dropout Monte-Carlo |
| Parametros totales | 317.571.590 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana fija determinista de los primeros 64.600 muestras (clips más cortos se repiten en mosaico) |
| Tipos de cuantizacion | FP32 (checkpoint publicado); no se documentan otras precisiones |
| Idiomas soportados | no disponible (el front end XLSR-53 es multilingüe por origen, pero no se declara soporte por idioma) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilación entre modelos SSL. El front end es un estudiante wav2vec 2.0 inicializado desde XLSR-53 y destilado a partir de la diferencia de características entre dos profesores: v.vox (XLSR-53 preentrenado de forma continua y auto-supervisada con fairseq sobre más de 9.000 horas de VoxCeleb2 copy-sintetizado con múltiples vocoders neuronales) menos XLSR-53. Esta es la variante de un solo SSL propuesta en el paper, frente a configuraciones con múltiples SSL. El back end es una capa lineal de 1024 a 128, tres bloques de Linear + LeakyReLU + MC-dropout (p=0,5), pooling de media sobre tramas y una capa lineal de 128 a 2.

El ajuste final se realiza sobre voc.LA (parte bona fide del train de ASVspoof 2019 LA vocalizado, aproximadamente 10 horas) con aumento de datos RawBoost. El scoring no usa una única pasada: se calculan 144 muestras de Monte-Carlo dropout con máscaras fijas por clip y se toma el logit de la softmax media de la clase bona fide. El checkpoint publicado es el seed-01 de los autores, en FP32, y aplica una ventana determinista de las primeras 64.600 muestras, un protocolo que el propio autor advierte que no equivale al de utterance completa del paper.

## Capacidades

- Detección de audio sintético o procesado por vocoder (anti-spoofing) en voz.
- Clasificación binaria bona fide frente a spoof con puntuación continua (mayor valor, más genuino).
- Scoring robusto mediante 144 muestras de Monte-Carlo dropout con máscaras fijas por clip.
- Aumento de datos RawBoost durante el entrenamiento, orientado a condiciones de canal y ruido variables.
- Funcionamiento sobre ventanas fijas de 64.600 muestras con repetición en mosaico para clips más cortos.
- Inferencia en FP32 con wrappers PyTorch y una clase equivalente en TensorRT.
- No soporta tool calling, agentes, generación de texto, visión ni audio generativo: es un clasificador de audio.

## Casos de uso

- Verificación anti-fraude en call centers: puntuar cada audio entrante para detectar voz sintética antes de procesar una operación sensible, usando el logit medio de 144 muestras como umbral configurable.
- Filtrado de datasets de voz: descartar muestras vocodificadas o generadas en corpus de entrenamiento para ASR o TTS, con especial utilidad en dominios donde el EER es bajo (LibriSeVoc 0,92 %, ASVspoof2019 LA 2,66 %).
- Evaluación comparativa de detectores: usar el modelo como referencia dentro de la Speech Anti-Spoofing Arena para situar nuevos sistemas con métricas EER homogéneas por dataset.
- Monitorización de pipelines de TTS: comprobar que la salida de un sintetizador no se cuela como audio real en un sistema de autenticación de locutor.
- Investigación en destilación SSL: reutilizar el front end destilado de v.vox menos XLSR-53 como extractor de características para experimentos de anti-spoofing.
- Despliegue en GPU de consumo: el modelo en FP32 cabe en tarjetas de 8-16 GB y se ha validado con TensorRT en RTX 4070 Ti SUPER y RTX 5060 Ti, lo que permite integrarlo en estaciones de trabajo sin clúster.
- Auditoría de contenido en plataformas: precribar clips cortos (hasta 64.600 muestras) antes de una revisión humana, aceptando el coste de falsos positivos en dominios con EER alto.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor). EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR % en el umbral EER de DeepVoice.

| Conjunto de datos | EER % |
|---|---|
| ASVspoof2019 LA | 2,66 |
| ASVspoof2021 LA | 16,37 |
| ASVspoof2021 DF | 6,41 |
| ASVspoof5 | 22,11 |
| InTheWild | 5,39 |
| ADD22 eval 31 | 13,57 |
| ADD2023 track12 test r1 | 28,37 |
| CFAD | 10,62 |
| CD-ADD | 5,82 |
| CVoiceFake small | 15,41 |
| DeepVoice | 28,03 |
| LibriSeVoc | 0,92 |
| SONAR | 9,56 |
| ArAD | 34,30 |
| DECRO | 18,35 |

No se dispone en la información proporcionada de comparaciones numéricas con otros sistemas concretos de la Arena; los resultados por dataset están en `.eval_results/` del repositorio.

## Requisitos de hardware

- VRAM estimada: unos 1,3 GB solo para pesos en FP32 (317,57 M de parámetros); con activaciones y buffers de inferencia, el consumo práctico es de pocos GB.
- GPU recomendadas: RTX 4070 Ti SUPER y RTX 5060 Ti validadas por el autor con TensorRT en FP32; cualquier GPU con al menos 8 GB es suficiente.
- Cabe en GPU de consumo: sí, en modelos de gama media y alta (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090).
- Opciones de despliegue: wrapper PyTorch del repositorio original y clase drop-in de TensorRT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numérica; el coste dominante es el front end wav2vec 2.0 sobre ventanas de 64.600 muestras y las 144 pasadas de Monte-Carlo dropout por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vocoded-VoxCeleb2-SSL-P3 (este) | 317,57 M | 64.600 muestras fijas | wav2vec 2.0 destilado + MLP con MC-dropout | BSD-3-Clause | Hugging Face, 4 descargas |
| Vocoded-VoxCeleb2-SSL-P1 | no disponible | no disponible | variante P1 del mismo linaje (wrapper de la Arena) | no disponible | Hugging Face |
| Sistemas de la Speech Anti-Spoofing Arena | no disponible | no disponible | diversos detectores evaluados con el mismo protocolo | no disponible | Hugging Face Space |

No se dispone de datos de benchmarks comparativos directos entre P1 y P3 en la información proporcionada.

## Limitaciones y advertencias

- El protocolo de ventana fija de 64.600 muestras no es el de utterance completa del paper; los resultados pueden diferir de los publicados originalmente.
- Los clips más cortos se repiten en mosaico, lo que puede alterar la distribución acústica y el scoring.
- El EER es muy variable según el dominio: 0,92 % en LibriSeVoc frente a 34,30 % en ArAD y 28,03 % en DeepVoice; no es un detector universal.
- Entrenado sobre voc.LA (unas 10 horas de ASVspoof 2019 LA bona fide vocalizado), lo que limita la generalización a ataques y canales no representados.
- Riesgo de falsos positivos y negativos en condiciones de ruido, codecs o idiomas poco cubiertos; el front end XLSR-53 es multilingüe por origen, pero no se declara soporte por idioma.
- El scoring con 144 muestras de Monte-Carlo dropout multiplica el coste de inferencia frente a una pasada única.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar las condiciones de los datasets de evaluación (ASVspoof, ADD, etc.) por separado.
- Solo se publica checkpoint en FP32; no hay versiones cuantizadas ni GGUF documentadas.
- No es un modelo generativo: no debe emplearse para transcripción, síntesis ni tareas de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P3
- Checkpoint (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P3/blob/e4405c9428c0c18bd7940bd0cb841d427280e3b6/model.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en la Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=vocoded-voxceleb2-ssl-p3
- Paper (Wang & Yamagishi, ICASSP 2024): https://arxiv.org/abs/2309.06014
- Código de los autores: https://github.com/nii-yamagishilab/project-NN-Pytorch-scripts/tree/b529705b65588d62db17b56f98636ee734ff725e/project/10-asvspoof-vocoded-trn-ssl
- Variante P1: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Vocoded-VoxCeleb2-SSL-P1
