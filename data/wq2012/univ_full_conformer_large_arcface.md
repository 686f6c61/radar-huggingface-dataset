# wq2012/univ_full_conformer_large_arcface

## Resumen

`univ_full_conformer_large_arcface` es un modelo de extracción de embeddings de hablante (speaker embeddings) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo generativo: su función es convertir una grabación de audio en un vector de 256 dimensiones que representa la identidad del hablante, de modo que dos fragmentos del mismo hablante produzcan vectores próximos (similitud coseno alta) y dos de hablantes distintos queden alejados. Se usa para verificación e identificación de hablante (speaker verification and recognition).

Técnicamente es un encoder Conformer de tamaño "large" con pooling temporal atento (ATP) y entrenamiento con pérdida ArcFace, implementado desde cero en JAX/Flax a partir de los papers GE2E, Dr-Vectors, ATP y PFAS. Con 6.983.364 parámetros de inferencia (solo encoder y cabeza de scoring), es un modelo muy ligero, adecuado para despliegue en CPU y dispositivos embebidos, y se distribuye además en formato TFLite FP32/INT8.

Su relevancia actual radica en que ofrece un checkpoint "universal" entrenado sobre múltiples corpus abiertos (VoxCeleb1/2, CN-Celeb1/2 y LibriSpeech 960h, 12.193 hablantes y 464.557 utterances limpias) bajo licencia Apache 2.0, algo poco habitual en reconocimiento de hablante, donde abundan checkpoints con licencias restrictivas o dependientes de infraestructura propietaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (variante `large`) con pooling temporal atento (ATP) y cabeza ArcFace |
| Parámetros totales | 6.983.364 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No es un modelo de contexto textual; acepta audio de hasta 3.000 frames (~30 s) en inferencia JAX con máscara; TFLite limitado a ventana fija de 180 frames (1,8 s) |
| Tipos de cuantización | FP32 e INT8 (exportaciones TFLite); pesos originales en FP32 |
| Idiomas soportados | No disponible (el modelo es independiente del idioma en la medida en que aprende identidad de hablante; entrenado con corpus en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que combina bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la secuencia de frames. Sobre la salida del encoder se aplica un pooling temporal atento (ATP, adaptado de un paper de identificación de idioma) que agrega la secuencia en un único vector de 256 dimensiones. El entrenamiento usa la pérdida ArcFace, que introduce un margen angular en la clasificación de hablantes para mejorar la discriminabilidad de los embeddings, y la verificación en inferencia se realiza por similitud coseno.

El frontend de audio es propio de la librería FlaxSpeaker y no un `AutoFeatureExtractor` de Hugging Face: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y CMVN. El modelo se entrenó durante 4.500 pasos de gradiente (warmup de 150, batch de 64 utterances, semilla 42, aproximadamente 0,62 épocas) con recortes variables de U(90, 180) frames y máscara de validez exacta, sobre 12.193 hablantes y 464.557 utterances limpias expandidas con perturbación de velocidad triple y aumentación MUSAN/RIR. Los conjuntos de evaluación oficiales no tienen solapamiento de hablantes con el entrenamiento.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificación de hablante uno a uno (mismo hablante / distinto hablante) mediante similitud coseno.
- Identificación de hablante uno a muchos comparando el embedding de consulta contra una galería de embeddings.
- Funcionamiento multilingüe de facto: al modelar identidad y no contenido lingüístico, es aplicable a audio en distintos idiomas, aunque el entrenamiento se hizo con corpus en inglés y chino.
- Robustez a ruido y reverberación gracias a la aumentación con MUSAN y RIR durante el entrenamiento.
- Exportación a TFLite FP32 e INT8 para inferencia en dispositivos con recursos limitados.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento multi-paso: es un extractor de features de audio.

## Casos de uso

- Verificación biométrica de acceso: el modelo genera un embedding de la frase de acceso y lo compara por coseno con el embedding enrolado del usuario; su tamaño reducido permite ejecutarlo en el propio dispositivo.
- Autenticación por voz en aplicaciones móviles: la exportación TFLite INT8 con ventana de 1,8 s y fidelidad de coseno de 0,999977 frente a FP32 permite integrar la verificación en apps Android/iOS sin backend.
- Diarización de reuniones: extrayendo embeddings por segmentos y agrupándolos (clustering), se separan los participantes de una grabación; el soporte de secuencias de hasta 30 s en JAX ayuda en segmentos largos.
- Indexación y búsqueda de archivos de audio: se precalculan embeddings de una fonoteca y se recuperan fragmentos del mismo hablante por búsqueda de vecinos más próximos.
- Control de calidad de locutores en doblaje y podcast: detectar si un clip pertenece realmente al locutor declarado antes de publicarlo.
- Detección de suplantación en call centers: comparar la voz del interlocutor con la voz registrada del cliente como señal adicional (no única) en un flujo antifraude.
- Anonimización y etiquetado de corpus: agrupar utterances por hablante para asignar pseudónimos consistentes en datasets de investigación.

## Benchmarks y rendimiento

Datos publicados en la model card para verificación zero-shot (EER de 1 utterance salvo indicación):

| Benchmark | Resultado |
|---|---|
| VoxCeleb1-O (secuencia completa, JAX con máscara) | 14,59 % EER |
| VoxCeleb1-O (TFLite FP32, recorte central de 180 frames, 37.611 trials) | 17,24 % EER |
| VoxCeleb1-O (TFLite INT8, recorte central de 180 frames) | 17,25 % EER |
| Fidelidad coseno media FP32 vs INT8 (180 frames) | 0,999977 |
| Desviación estándar entre semillas del EER agrupado 1-utt (semillas 0-2) | 0,08–0,41 % absoluto |
| Semiancho del intervalo bootstrap del 95 % (8.000 trials) | ~0,8 % |

La model card menciona métricas adicionales (1-utt y 3-utt EER, minDCF, ROC-AUC, subconjunto de 10 hablantes de VoxCeleb1-O) en `eval_results.json`, pero los valores concretos no están incluidos en la información disponible. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el encoder (6,98 M de parámetros, ~28 MB de pesos); el consumo dominante es el buffer de audio y activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; funciona igualmente en CPU, ya que el modelo es muy pequeño.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas) y en iGPU; también en dispositivos móviles vía TFLite.
- Opciones de despliegue: librería `flaxspeaker` (JAX/Flax) para inferencia completa; TFLite Runtime para las exportaciones FP32/INT8; exportación vía `jax2tf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma explícita; la ventana TFLite de 180 frames (1,8 s de audio) sugiere inferencia en tiempo real en dispositivos modestos, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| `univ_full_conformer_large_arcface` | 6,98 M | Hasta ~30 s (JAX); 1,8 s (TFLite) | Apache 2.0 | Hugging Face, PyPI `flaxspeaker` |
| ECAPA-TDNN (modelos tipo SpeechBrain) | ~20 M típicamente | Variable, típicamente 3 s | Apache 2.0 (SpeechBrain) | Hugging Face, SpeechBrain |
| WavLM / XLS-R basados en verificación | 90 M – 300 M+ | Variable | MIT / Apache 2.0 según checkpoint | Hugging Face |
| ResNet-based speaker embeddings (p. ej. WeSpeaker) | ~6–30 M | Variable | Apache 2.0 | Hugging Face, WeSpeaker |

La comparación de rendimiento concreto (EER) frente a estas alternativas no está disponible en la información proporcionada; el EER de 14,59 % en VoxCeleb1-O es sustancialmente más alto que el de los sistemas estado del arte actuales, coherente con el presupuesto de entrenamiento declarado (4.500 pasos, ~0,62 épocas).

## Limitaciones y advertencias

- Presupuesto de entrenamiento corto: 4.500 pasos y ~0,62 épocas; el propio autor lo señala como limitación y el EER resultante (14,59 % en VoxCeleb1-O) queda lejos del estado del arte.
- El checkpoint es una reimplementación no oficial de los papers; el autor declara explícitamente que no es un producto soportado por Google.
- La exportación TFLite usa una ventana fija de 180 frames sin máscara, lo que degrada el EER (17,24 % frente a 14,59 % en secuencia completa) y no admite audio de duración arbitraria.
- Riesgo de sesgo por los corpus de entrenamiento (VoxCeleb, CN-Celeb, LibriSpeech): sobrerrepresentación de ciertos acentos, géneros y condiciones de grabación; no se documentan análisis de equidad.
- No se documentan métricas por idioma ni por grupo demográfico; el uso en verificación biométrica real requiere evaluación propia y medidas adicionales anti-spoofing.
- El frontend de audio es específico de FlaxSpeaker (Mel log natural, VAD, CMVN); no es compatible directamente con `AutoFeatureExtractor` de Hugging Face, lo que complica la integración en pipelines estándar.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de biometría conviene revisar la normativa aplicable (RGPD, consentimiento del usuario) antes de desplegarlo.
- Solo 73 descargas y 0 likes en el momento de la consulta: ecosistema pequeño y poca validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_conformer_large_arcface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling): https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
