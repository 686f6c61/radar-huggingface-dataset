# wq2012/univ_full_eres2conformer_large

## Resumen

`univ_full_eres2conformer_large` es un modelo de reconocimiento y verificación de hablante (speaker verification) desarrollado por el usuario `wq2012` como parte de la biblioteca `FlaxSpeaker`, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento biométrico de voz. El modelo no es un producto oficial de Google, sino una reproducción independiente basada exclusivamente en papers públicos (GE2E, Dr-Vectors, ATP y PFAS) y entrenada sobre corpus abiertos, sin código ni datos propietarios.

La arquitectura combina un backbone `eres2conformer` de tamaño `large` con pooling temporal atento (`catp`) y un objetivo de entrenamiento Sub-Center ArcFace (K=3, scale=32, margin=0.3). El modelo produce embeddings de 256 dimensiones y emplea similitud coseno como función de scoring. Cuenta con 31.834.352 parámetros de inferencia (encoder más cabeza de scoring, excluyendo los pesos del clasificador usados solo en entrenamiento) y se distribuye como checkpoint "flagship universal" entrenado sobre 12.193 hablantes y 972.254 utterances limpias.

Su relevancia radica en tres factores: es una implementación completamente abierta (JAX/Flax) de un pipeline de speaker recognition de nivel SOTA, se entrena sobre un pool multi-corpus (VoxCeleb1/2, CN-Celeb1/2 y LibriSpeech 960h) con separación estricta de hablantes respecto a los conjuntos de evaluación, y ofrece exportaciones TFLite (FP32 e INT8) del encoder para despliegue en entornos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `eres2conformer` (variante `large`) con pooling temporal atento `catp` |
| Parametros totales | 31.834.352 (encoder + cabeza de scoring, excluye clasificador de entrenamiento); 31.906.992 segun safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; inferencia JAX con máscara hasta 3000 frames (30 s); export TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 y INT8 (exportaciones TFLite); pesos nativos en safetensors y msgpack |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado sobre corpus multilingües: VoxCeleb, CN-Celeb, LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone `eres2conformer` en configuración `large`, una arquitectura de tipo Conformer (convolución + atención) adaptada al reconocimiento de hablante, seguida de un pooling temporal atento (`catp`, repurposado del paper de ATP para identificación de idioma). La representación de salida es un embedding de 256 dimensiones. El objetivo de entrenamiento es Sub-Center ArcFace con K=3 subcentros, escala 32 y margen 0,3, y la verificación se realiza por similitud coseno. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` (no es un `AutoFeatureExtractor` de Hugging Face).

El entrenamiento se realizó durante 93.000 pasos de gradiente con batch de 512 utterances (aproximadamente 46,87 épocas), semilla 42, sobre un pool universal de 12.193 hablantes y 972.254 utterances limpias provenientes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con aumento de datos mediante perturbación de velocidad a 3 vías y MUSAN/RIR. Se usaron crops variables de `U(140, 200)` frames con máscara de validez exacta. La model card documenta controles de reproducibilidad (fingerprints de pérdida en step-0, desviación estándar entre semillas de 0,08-0,41 % absoluto en EER y un intervalo bootstrap del 95 % de ±0,8 % con 8.000 ensayos).

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante similitud coseno.
- Reconocimiento de hablante (identificación 1:N) usando los embeddings como representación.
- Procesamiento de audio de hasta 30 s en inferencia JAX con máscara de secuencia completa.
- Exportación TFLite FP32 e INT8 del encoder para despliegue en dispositivos con recursos limitados.
- Funcionamiento multilingüe y multi-dominio por el entrenamiento sobre VoxCeleb (inglés), CN-Celeb (chino) y LibriSpeech (inglés).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de feature extraction de audio, no un LLM.
- No soporta visión ni audio más allá del pipeline de embeddings de hablante.

## Casos de uso

- **Verificación biométrica en autenticación de usuario**: el modelo compara un audio de enrolamiento con uno de prueba mediante `model.verify(enroll, test)` y devuelve una puntuación coseno; es adecuado por su EER de 0,84 % en VoxCeleb1-O con inferencia completa, aunque para producción conviene calibrar umbrales por dominio.
- **Identificación de hablante en grabaciones largas**: con soporte de hasta 3000 frames (30 s) en JAX con máscara, se puede segmentar y agrupar hablantes en reuniones, llamadas o archivos de audio periodísticos.
- **Diarización y clustering de hablantes**: los embeddings de 256 dimensiones se pueden usar como entrada a algoritmos de clustering (por ejemplo, k-means o spectral clustering) para separar interlocutores en un audio multi-hablante.
- **Detección de fraude y deepfakes de voz**: comparar la voz de una llamada con la voz registrada del titular para detectar suplantaciones; el modelo está entrenado sobre múltiples corpus y aumentos de datos (MUSAN/RIR, speed perturbation), lo que mejora la robustez ante variaciones de canal.
- **Indexación y búsqueda de archivos de audio**: generar embeddings para una base de datos de podcasts o archivos de archivo y permitir búsquedas por similitud de voz ("encuentra más audios de esta persona").
- **Despliegue en dispositivos edge con TFLite INT8**: el encoder exportado a `model_int8.tflite` con ventana fija de 180 frames (1,8 s) permite ejecutar verificación de hablante en móviles o sistemas embebidos con un EER medido de 2,41 % en VoxCeleb1-O (crop central), a costa de perder el procesamiento de secuencias largas.
- **Investigación en biometría de voz**: al ser una reimplementación JAX/Flax de papers públicos con licencia Apache 2.0, sirve como base reproducible para experimentos académicos y comparaciones de arquitecturas Conformer para speaker recognition.

## Benchmarks y rendimiento

La model card reporta métricas de EER y minDCF sobre VoxCeleb1-O, aunque los valores completos del `eval_results.json` no se detallan en la información disponible. Los datos explícitos son:

| Metrica | Valor |
|---|---|
| EER 1-utt, VoxCeleb1-O, inferencia JAX completa (máscara, hasta 3000 frames) | 0,84 % |
| EER 1-utt, VoxCeleb1-O, TFLite FP32, crop central de 180 frames (37.611 trials) | 2,38 % |
| EER 1-utt, VoxCeleb1-O, TFLite INT8, crop central de 180 frames | 2,41 % |
| Similitud coseno media FP32 vs INT8 (180 frames) | 0,999707 |
| Fidelidad coseno TFLite vs JAX (>=) | 0,9999 |
| Desviación estándar entre semillas (EER absoluto, seeds 0-2) | 0,08-0,41 % |
| Intervalo bootstrap 95 % (8.000 ensayos) | ±0,8 % |
| Pérdida step-0 archivada (TPU bfloat16) | 11,7771 |
| Pérdida step-0 código actual, crops `U(140, 200)` (CPU float32) | 11,781 |

No se han publicado en la información disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo. Tampoco se detallan métricas de minDCF ni ROC-AUC en el texto proporcionado, aunque el repo incluye `eval_results.json` con esos datos.

## Requisitos de hardware

- **VRAM estimada**: con 31,8 M de parámetros, el modelo en FP32 ocupa aproximadamente 128 MB de pesos; en INT8, unos 32 MB. La VRAM real dependerá del tamaño del batch y de la longitud de secuencia (hasta 3000 frames).
- **GPU recomendadas**: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente para inferencia en batch pequeño; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento original se realizó en TPU (según la model card, con `bfloat16`).
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida para batch pequeño.
- **Opciones de despliegue**: JAX/Flax nativo mediante `flaxspeaker >= 0.6.0`; TFLite (`model_fp32.tflite`, `model_int8.tflite`) para edge y móvil; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada. La ventana TFLite fija de 180 frames (1,8 s) sugiere un coste de inferencia bajo por utterance, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, se puede comparar con:

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| `univ_full_eres2conformer_large` (este) | 31,8 M | hasta 30 s (JAX), 1,8 s (TFLite) | Apache 2.0 | Hugging Face, PyPI (`flaxspeaker`) |
| ECAPA-TDNN (referencia habitual en speaker verification) | no disponible en la información | no disponible | varía según checkpoint | ampliamente disponible en la comunidad |
| WavLM / X-Vector (referencias clásicas) | no disponible en la información | no disponible | varía según checkpoint | ampliamente disponibles |

No se han publicado en la información disponible comparaciones cuantitativas con estos modelos; los datos de EER de la tabla anterior corresponden únicamente a este checkpoint.

## Limitaciones y advertencias

- **No es un producto oficial de Google**: la model card lo indica explícitamente; es una reimplementación independiente y no debe presentarse como solución soportada por Google.
- **Riesgo de alucinación**: no aplica en el sentido de LLM, pero sí existe riesgo de falsos positivos/negativos en verificación; el EER de 0,84 % implica una tasa de error no despreciable en producción, y el umbral debe calibrarse por dominio.
- **Degradación en TFLite**: el EER sube de 0,84 % (JAX secuencia completa) a 2,38 % (FP32, crop de 180 frames) y 2,41 % (INT8) en VoxCeleb1-O; la ventana fija de 1,8 s limita el rendimiento en utterances largas.
- **Sesgos de dominio**: el entrenamiento se basa en VoxCeleb, CN-Celeb y LibriSpeech, corpus con sesgos de género, edad, acento y condiciones de grabación; el rendimiento puede degradarse en dominios no representados (audio telefónico de baja calidad, entornos ruidosos extremos, hablantes infantiles).
- **Idiomas**: aunque el modelo es agnóstico al idioma, no se documentan evaluaciones por idioma ni cobertura explícita más allá de los corpus de entrenamiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los corpus de entrenamiento (VoxCeleb, CN-Celeb, LibriSpeech, MUSAN) si se redistribuye el modelo o se usa en productos regulados.
- **Privacidad y regulación**: el uso para biometría de voz está sujeto a normativas como el RGPD y la AI Act europea; se requiere consentimiento explícito y evaluación de impacto.
- **Reproducibilidad**: la model card documenta controles de reproducibilidad, pero las métricas dependen de la versión de `flaxspeaker` (>= 0.6.0) y del pipeline de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_large
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
