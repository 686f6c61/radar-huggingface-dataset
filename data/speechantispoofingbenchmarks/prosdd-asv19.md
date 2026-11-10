# SpeechAntiSpoofingBenchmarks/ProSDD-ASV19

## Resumen

ProSDD-ASV19 es un sistema de detección de voz sintética (anti-spoofing) empaquetado como wrapper para el banco de pruebas Speech Anti-Spoofing Arena. El modelo subyacente es ProSDD, propuesto por Mahapatra et al. (2026), y consiste en un encoder wav2vec 2.0 XLS-R de 300M parámetros afinado completamente para una tarea de clasificación binaria: distinguir audio real (bona fide) de audio generado o manipulado. El repositorio de Hugging Face no contiene los pesos originales, sino un paquete de integración para reproducir la evaluación del modelo dentro de la Arena.

La relevancia de este modelo reside en su doble objetivo de entrenamiento: primero aprende representaciones de hablante y prosodia mediante predicción de objetivos enmascarados a nivel de trama sobre LibriSpeech, y después se afina conjuntamente con ese objetivo auxiliar y una cabeza binaria real/fake sobre ASVspoof 2019 LA. Este enfoque híbrido busca mejorar la generalización frente a ataques de síntesis y conversión de voz no vistos durante el entrenamiento, un problema central en la detección de deepfakes de audio.

El modelo tiene 315.963.522 parámetros, opera a 16 kHz con recortes fijos de 4 segundos (64.000 muestras) y produce una puntuación donde valores más altos indican mayor probabilidad de audio genuino. Su licencia es "other" y los pesos no se realojan en Hugging Face, sino que se enlazan desde el Google Drive de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (CNN front-end + proyección de features + transformer de 24 capas) con pooling por media y cabeza Linear(1024,512)-ReLU-Linear(512,2) |
| Parametros totales | 315.963.522 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 200 tramas latentes (secuencia fija, zero-padded); entrada de audio fija de 4 s a 16 kHz (64.000 muestras) |
| Tipos de cuantizacion | no disponible (inferencia en FP32; existe clase TensorRT drop-in en FP32) |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech y ASVspoof 2019 LA, ambos en inglés) |
| Licencia | other (los autores no conceden licencia para los pesos; no se realojan) |
| Formato de pesos | checkpoint de PyTorch (no realojado en HF; enlazado desde Google Drive de los autores) |

## Arquitectura y entrenamiento

El sistema parte de un encoder wav2vec 2.0 XLS-R de 300M parámetros. La entrada se procesa mediante el front-end convolucional y la proyección de features de XLS-R, generando una secuencia latente fijada a 200 tramas mediante zero-padding. Esa secuencia pasa por un transformer de 24 capas, se agrega con mean pooling y se clasifica con una cabeza Linear(1024,512)-ReLU-Linear(512,2). En inferencia se usa únicamente la ruta limpia (sin aumentación RawBoost).

El entrenamiento es en dos etapas. La etapa I entrena sobre LibriSpeech train-clean-100 y dev (solo audio bona fide) para predecir objetivos enmascarados a nivel de trama de hablante y prosodia. La etapa II afina conjuntamente ese objetivo auxiliar y una cabeza binaria real/fake sobre ASVspoof 2019 LA train/dev con la serie 3 de RawBoost. El preprocesado de evaluación sigue el `data_utils_eval.py` de los autores: 16 kHz, sin normalización de amplitud, recorte central fijo de 4 s y zero-padding central para clips más cortos. La puntuación es `logits[:,1]` (clase bona fide). El wrapper incluye además una clase TensorRT drop-in que, según la model card, coincidió con PyTorch en el conjunto completo J-SPAW_LA.

## Capacidades

- Detección binaria de audio real frente a audio sintético o manipulado (anti-spoofing, deepfake detection).
- Puntuación continua por clip: valores más altos indican mayor probabilidad de bona fide.
- Evaluación estandarizada en 18 conjuntos de datos del Speech Anti-Spoofing Arena, incluyendo ASVspoof 2019 LA, ASVspoof 2021 LA/DF, ASVspoof5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO, J-SPAW_LA, ODSS, EmoSpoofTTS y LRLspoof.
- Inferencia en FP32 con opción de despliegue TensorRT para GPUs consumer.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio de entrada.
- No se documentan capacidades multilingües; el entrenamiento se limita a corpus en inglés.

## Casos de uso

- Verificación de autenticidad en pipelines de atención al cliente: el modelo puede puntuar cada clip entrante y marcar como sospechosos aquellos con alta probabilidad de síntesis antes de que un agente humano los revise, usando el recorte fijo de 4 s como unidad de análisis.
- Moderación de contenido en plataformas de audio: integración como filtro previo en la subida de podcasts o mensajes de voz para detectar clips generados por TTS o voice conversion, con la puntuación continua como umbral configurable.
- Evaluación comparativa de sistemas anti-spoofing: el wrapper está diseñado específicamente para el Speech Anti-Spoofing Arena, por lo que sirve para reproducir la evaluación del modelo y compararlo con otros sistemas bajo las mismas condiciones.
- Investigación en detección de deepfakes: permite analizar el comportamiento del modelo en 18 conjuntos con distintos tipos de ataque (TTS, voice conversion, parcialmente sintético) y estudiar su generalización fuera de dominio.
- Autenticación de voz en entornos controlados: como componente adicional de una pipeline de verificación de hablante, la puntuación bona fide puede usarse para descartar grabaciones sintéticas antes de la verificación biométrica.
- Benchmarking de infraestructura de inferencia: la clase TensorRT drop-in permite medir latencia y throughput en GPUs consumer (RTX 4070 Ti SUPER, RTX 5060 Ti) frente a la implementación PyTorch en FP32.

## Benchmarks y rendimiento

Resultados de EER% (menor es mejor) publicados en la model card. EmoSpoofTTS y LRLspoof son solo-spoof y usan 1-SRR% en el umbral EER de DeepVoice del modelo.

| Conjunto de evaluacion | EER% |
|---|---|
| ASVspoof2019_LA | 0,42 |
| ASVspoof2021_LA | 8,29 |
| ASVspoof2021_DF | 8,61 |
| ASVspoof5 | 16,14 |
| InTheWild | 15,16 |
| ADD22_eval_31 | 20,60 |
| ADD2023_track12_test_r1 | 34,17 |
| CFAD | 21,10 |
| CD-ADD | 34,04 |
| CVoiceFake_small | 16,37 |
| DeepVoice | 46,89 |
| LibriSeVoc | 16,87 |
| SONAR | 33,55 |
| ArAD | 35,16 |
| DECRO | 26,14 |
| J-SPAW_LA | 24,73 |
| ODSS | 42,36 |

No se dispone de resultados para EmoSpoofTTS ni LRLspoof en la información proporcionada (la model card los menciona pero los badges están truncados).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 315,96 M de parámetros en FP32, el peso de los pesos ronda 1,26 GB, a lo que hay que sumar activaciones y buffers del transformer de 24 capas.
- GPU recomendadas: la model card documenta ejecuciones en RTX 4070 Ti SUPER y RTX 5060 Ti mediante la clase TensorRT drop-in en FP32, que coincidió con PyTorch en el conjunto completo J-SPAW_LA.
- Cabe en GPU consumer: sí, según las pruebas documentadas en RTX 4070 Ti SUPER y RTX 5060 Ti.
- Opciones de despliegue: PyTorch (wrapper del repositorio) y clase TensorRT drop-in incluida por los autores del empaquetado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni licencia de modelos alternativos en la información proporcionada, por lo que no es posible construir una comparativa cuantitativa fiable. El propio Speech Anti-Spoofing Arena permite comparar este sistema con otros participantes bajo las mismas condiciones de evaluación, pero los resultados de esos otros sistemas no se incluyen en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProSDD-ASV19 | 315.963.522 | 200 tramas latentes (4 s de audio) | other (pesos no realojados) | Wrapper en HF, pesos en Google Drive de los autores |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia "other": los autores no conceden licencia para los pesos, que no se realojan en Hugging Face. Cualquier uso comercial requiere contactar con los autores y verificar los términos exactos.
- El modelo está entrenado sobre corpus en inglés (LibriSpeech y ASVspoof 2019 LA); no se documenta comportamiento en otros idiomas.
- Entrada restringida a clips de 4 s (64.000 muestras) con recorte central; clips más cortos se rellenan con ceros, lo que puede degradar la detección en audios muy breves.
- No se aplica normalización de amplitud en la evaluación, lo que hace el sistema sensible a diferencias de nivel de señal respecto al preprocesado de entrenamiento.
- Los EER en conjuntos fuera de dominio son elevados (por ejemplo, 46,89% en DeepVoice, 42,36% en ODSS, 34,17% en ADD2023), lo que indica una generalización limitada frente a ataques y condiciones no vistas.
- Riesgo de falsos positivos y falsos negativos en audio real con ruido, canal telefónico o codecs agresivos; no se documentan análisis de sesgo por hablante, género o acento.
- El score es `logits[:,1]` sin calibración probabilística documentada; el umbral debe ajustarse por dominio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes, y su única salida es una puntuación binaria por clip.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/ProSDD-ASV19
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Paper (arXiv:2604.13229): https://arxiv.org/abs/2604.13229
- Código de los autores: https://github.com/ProSDD/codes/tree/bdb80440cd946368e77f4b51f6ddf26c7443dc33
- Checkpoint de los autores (Google Drive): https://drive.google.com/file/d/1RHY-VELyi4XH-L1egeRcgWjHdkdWV2bO/view
