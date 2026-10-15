# wq2012/univ_conformer_small_cosface

## Resumen

`univ_conformer_small_cosface` es un modelo de verificación e identificación de locutor (speaker verification / speaker recognition) desarrollado por el usuario wq2012 y distribuido a través de Hugging Face. Forma parte de **FlaxSpeaker**, una reproducción open source en JAX/Flax, realizada desde cero (clean-room), de los algoritmos de reconocimiento de locutor publicados en los trabajos GE2E, Dr-Vectors, Conformer-ATP y PFAS. No es un producto oficial de Google y los experimentos originales de esos artículos se ejecutaron sobre infraestructura y datos internos propietarios, no sobre esta librería ni sobre los splits públicos que aquí se emplean.

Se trata de un modelo convolucional-aumentado de tipo **Conformer** en configuración `small`, con pooling temporal atencional (ATP), entrenado con la pérdida **CosFace** y puntuación de verificación por similitud coseno. Es un modelo muy compacto: el encoder tiene **2.029.892 parámetros** y genera embeddings de locutor de **192 dimensiones**. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz, con detección de actividad de voz (VAD) basada en energía y normalización CMVN.

Su relevancia práctica reside en que permite extraer embeddings de locutor y verificar identidades a partir de audio con un coste computacional mínimo, lo que lo hace apto para despliegue en CPU o en hardware muy modesto. El contrapunto es su precisión: el propio autor publica tasas de error (EER) del 20-26 % en verificación de una única utterance sobre LibriSpeech, CN-Celeb2 y VoxCeleb1, cifras muy alejadas de los sistemas de verificación de locutor de producción actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`small`), con pooling temporal atencional (ATP) |
| Parametros totales | 2.029.892 (parametros del encoder) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (procesa utterances de audio de duración variable; no se especifica ventana máxima) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors y msgpack; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (el campo de idiomas no está informado; los datos de evaluación son inglés y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

Datos adicionales del modelo:

| Parametro | Valor |
|---|---|
| Dimensión del embedding de salida | 192 |
| Pérdida de entrenamiento | CosFace |
| Puntuación de verificación | Coseno |
| Dominio de entrenamiento | `universal` |
| Frontend de audio | log_mel de 80 dimensiones a 16.000 Hz + VAD por energía + CMVN |
| Librería | `flaxspeaker` |
| Pipeline declarado | audio-classification |
| Métricas evaluadas | EER, minDCF, ROC-AUC |
| Datasets citados | librispeech_asr, cnceleb, voxceleb |

## Arquitectura y entrenamiento

El backbone es un **Conformer**, es decir, un transformer aumentado con módulos convolucionales, en su variante `small`. Sobre las representaciones del encoder se aplica **Attentive Temporal Pooling (ATP)**, que agrega la secuencia temporal en un único vector de embedding de 192 dimensiones. La pérdida de entrenamiento es **CosFace** (large margin cosine loss, con margen aditivo sobre coseno), una función objetivo de tipo softmax normalizado que opera sobre geometría hiperesférica y que se popularizó en reconocimiento facial y se adoptó también en verificación de locutor. La verificación final se realiza mediante similitud coseno entre embeddings, con una variante de puntuación sin parámetros descrita en el trabajo PFAS.

El modelo está entrenado con dominio declarado `universal`, sobre los datasets públicos LibriSpeech (inglés leído), CN-Celeb2 (chino multi-género) y VoxCeleb (locutores célebres en condiciones in-the-wild). La model card no especifica el número de tokens o de horas de audio utilizadas, la composición exacta de la mezcla de entrenamiento, ni si se aplicaron etapas de ajuste fino tipo RLHF o DPO (no tendría sentido en esta tarea). El frontend fijo incluye VAD por energía y CMVN, lo que implica que el modelo espera audio a 16 kHz con un preprocesado concreto, configurado en `preprocessor_config.json` con un extractor compatible con `WhisperFeatureExtractor`.

## Capacidades

- Extracción de embeddings de locutor: genera vectores de 192 dimensiones a partir de una utterance de audio.
- Verificación de locutor (1:1): compara dos audios y devuelve una puntuación de similitud coseno mediante `model.verify()`.
- Verificación con múltiples enrollments (3 utterances): soporta agregación de varias muestras de enrollment para mejorar la tasa de error (EER baja del 25,60 % al 21,83 % en el pool universal).
- Identificación de locutor por similitud: los embeddings permiten búsqueda 1:N por comparación coseno contra una galería.
- Robustez multi-dominio: evaluado sobre inglés leído (LibriSpeech), chino multi-género (CN-Celeb2) y audio in-the-wild (VoxCeleb1).
- Inferencia en JAX/Flax: API Python (`flaxspeaker.load_pretrained`) y script de línea de comandos (`scripts/inference.py`).
- No soporta: generación de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión ni audio-speech recognition (no es un modelo de lenguaje ni un ASR).

## Casos de uso

- Verificación biométrica de voz en acceso a sistemas: el modelo permite comparar la voz de un usuario enrolado con una muestra de entrada y decidir si coincide, con un coste de cómputo muy bajo. Adecuado solo en escenarios de baja exigencia de seguridad dado el EER publicado.
- Análisis de llamadas en centros de atención: extraer embeddings de cada intervención para agrupar y contar locutores distintos a lo largo de una conversación, lo que permite métricas de participación y detección de hablantes recurrentes.
- Diarización asistida: usar los embeddings como entrada de un clustering (por ejemplo, k-means o agglomerative clustering) para segmentar audio en hablantes, aprovechando que la puntuación es una simple similitud coseno.
- Enrolamiento multi-muestra en asistentes de voz: con tres utterances de enrollment el EER baja a 17,10 % en LibriSpeech, lo que permite personalizar la respuesta de un asistente sin depender de la nube.
- Procesado por lotes en CPU: al tener 2 millones de parámetros, el modelo puede ejecutarse en servidores sin GPU para indexar grandes archivos de audio y precalcular embeddings de locutor en pipelines offline.
- Investigación y reproducción de resultados: sirve como referencia open source en JAX/Flax para comparar GE2E, Dr-Vectors, ATP y PFAS sobre datasets públicos, algo que los artículos originales no permitían al haber usado datos internos.
- Filtrado previo en pipelines de transcripción: descartar o separar segmentos de audio según el locutor detectado antes de enviarlos a un modelo de ASR más costoso.

## Benchmarks y rendimiento

Verificación con una única utterance (resultados publicados en la model card):

| Split de evaluación | Trials | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (inglés leído) | 3.000 | 20,37 | [19,12; 21,85] | 0,9960 | 0,8940 | 0,8730 |
| CN-Celeb2 (chino multi-género) | 3.000 | 25,73 | [24,07; 27,28] | 0,9833 | 0,9587 | 0,8193 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 26,40 | [24,40; 28,18] | 0,9950 | 0,9840 | 0,8278 |
| Universal pooled (3 dominios) | 8.000 | 25,60 | [24,64; 26,58] | 0,9978 | 0,9503 | 0,8256 |
| Universal macro-average (3 dominios) | 8.000 | 24,17 | — | 0,9914 | 0,9456 | 0,8400 |

Verificación con tres utterances de enrollment:

| Split de evaluación | Trials | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 17,10 | [15,00; 19,65] | 0,8440 | 0,9186 |
| CN-Celeb2 (3-utt) | 1.000 | 22,20 | [19,85; 24,65] | 0,9440 | 0,8592 |
| VoxCeleb1 (3-utt) | 1.000 | 20,30 | [17,85; 23,20] | 0,9700 | 0,8806 |
| Universal pooled (3-utt) | 3.000 | 21,83 | [20,17; 23,20] | 0,9260 | 0,8720 |
| Universal macro-average (3-utt) | 3.000 | 19,87 | — | 0,9193 | 0,8861 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a un modelo de verificación de locutor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,1 MB en fp32 y 4,1 MB en fp16/bf16, calculados a partir de los 2.029.892 parámetros del encoder (sin contar activaciones ni buffers del frontend).
- GPU recomendadas: no disponible en la documentación; dado el tamaño, cualquier GPU con al menos unos pocos cientos de MB libres es suficiente y no se requiere hardware de datacenter (A100, H100) en absoluto.
- Cabe en GPU de consumo: sí, con enorme margen. También cabe en GPUs integradas y en CPU, e incluso en dispositivos embebidos con memoria muy limitada.
- Opciones de despliegue: la librería `flaxspeaker` (API Python y script `scripts/inference.py`) sobre JAX/Flax, cargando pesos desde `model.safetensors` o `flax_model.msgpack`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Dependencias del frontend: audio a 16 kHz con log-mel de 80 dimensiones, VAD por energía y CMVN, definidos en `preprocessor_config.json`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones verificables de modelos comparables (parámetros, contexto, EER en los mismos splits, licencia) que permitan una comparación rigurosa. Los trabajos citados en la model card (GE2E, Dr-Vectors, Conformer-ATP, PFAS) emplearon infraestructura y datos internos propietarios de Google, por lo que sus resultados no son directamente comparables con los de este checkpoint. Tampoco se dispone de datos de otros modelos de verificación de locutor open source (por ejemplo, variantes basadas en ECAPA-TDNN o en WavLM) dentro de la información suministrada.

## Limitaciones y advertencias

- Precisión limitada: las tasas de EER publicadas (20,37 % en LibriSpeech, 25,73 % en CN-Celeb2 y 26,40 % en VoxCeleb1 con una utterance) implican una tasa de error elevada para uso biométrico real. No es adecuado para control de acceso de alta seguridad sin capas adicionales de verificación.
- Sensibilidad al número de enrollment: el rendimiento mejora notablemente con tres utterances (EER de 17,10 % en LibriSpeech), lo que sugiere que el uso con una sola muestra es frágil.
- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgo por género, edad, acento, idioma o condición de grabación.
- Riesgo de aceptación falsa y rechazo falso: al ser un verificador biométrico, existe riesgo intrínseco de confundir locutores con voces similares o de rechazar a un locutor legítimo por condiciones acústicas adversas. No hay umbral de decisión recomendado en la información disponible.
- Limitaciones de idioma: el campo de idiomas no está informado. Los datos de entrenamiento y evaluación cubren inglés y chino, por lo que el comportamiento en otras lenguas es desconocido.
- Dependencia del frontend: el modelo espera audio a 16 kHz con log-mel de 80 dimensiones, VAD por energía y CMVN. Desviarse de este preprocesado degrada los resultados.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificación, pero el modelo no es un producto oficial de Google y se distribuye sin garantías ni soporte.
- Caveat de procedencia: se trata de una reproducción clean-room; los resultados de los artículos originales no se reproducen necesariamente con este checkpoint.
- Caveat de versionado: el repositorio registra una fecha de creación y actualización de 2026-10-15, sin historial de versiones adicional; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de puntuaciones de similitud incorrectas sin calibración previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_conformer_small_cosface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E — Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors — Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Conformer-ATP — Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- PFAS — Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Modelo relacionado del mismo autor (Personal VAD 2.0): https://huggingface.co/wq2012/personal-vad-v2-conformer-unified
