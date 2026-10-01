# Yohan2003/whisper-small-sinhala-run11-v6-e6

## Resumen

whisper-small-sinhala-run11-v6-e6 es un ajuste fino completo del modelo openai/whisper-small para reconocimiento automático de voz (ASR) en cingalés (sinhala, código `si`). Lo desarrolla Yohan2003, vinculado a la Universidad de Moratuwa, y forma parte de una serie iterativa de entrenamientos (runs 6, 10 y 11) sobre el mismo conjunto de datos. El modelo cuenta con 241.734.912 parámetros y conserva la arquitectura encoder-decoder de tipo Transformer propia de Whisper small, con una ventana de audio de 30 segundos por segmento.

El problema que resuelve es concreto: el cingalés es un idioma con pocos recursos y una ortografía compleja (conjuntos consonantitos con ZWJ, como el rakaransaya, y variación de registro léxico), lo que degrada el rendimiento de los modelos Whisper multilingües originales. Este ajuste se entrena sobre el split `stratified_v6` del dataset `Yohan2003/whisper-sl-data`, con 123.205 filas de entrenamiento y divisiones disjuntas por hablante, y alcanza un WER del 16,38 % y un CER del 4,43 % en el conjunto de test completo (15.860 filas).

Es relevante ahora porque supone la mejor marca publicada del proyecto: mejora en 0,77-0,79 puntos de WER y 0,19-0,28 puntos de CER a los dos mejores runs anteriores (`run10-v6` y `run6-v5`), lo que sugiere que la configuración no había convergido a 5 épocas y que aún hay margen de mejora con más cómputo. Su licencia Apache 2.0 facilita la integración en productos comerciales sin las restricciones de otros modelos de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (configuración Whisper small: 12 capas de encoder y 12 de decoder, dimensión 768, 12 cabezas de atención) |
| Parámetros totales | 241.734.912 (según safetensors; la model card cita 244 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en tokens; ventana de audio de 30 segundos por segmento (arquitectura Whisper) |
| Tipos de cuantización | No disponible: el autor no publica versiones cuantizadas; solo se ofrece el checkpoint en precisión completa |
| Idiomas soportados | Cingalés (`si`); los datos de entrenamiento incluyen referencias con code-switching a inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Método de ajuste | Fine-tune completo (todos los pesos) |
| Dataset de entrenamiento | `Yohan2003/whisper-sl-data`, split `stratified_v6` |
| Tamaño del repositorio | 8,7 GB (incluye artefactos de entrenamiento además del checkpoint) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-09-30 |

## Arquitectura y entrenamiento

Se trata de un Transformer encoder-decoder idéntico a Whisper small: el encoder procesa espectrogramas mel de 80 canales correspondientes a ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de idioma y de tarea (transcripción o traducción). El ajuste es completo, no mediante adaptadores ni LoRA, por lo que se actualizan los aproximadamente 242 millones de parámetros del modelo original.

La receta de entrenamiento está documentada con detalle: tasa de aprendizaje 3e-5 con schedule lineal y 500 pasos de warmup, tamaño de batch efectivo de 64 y 6 épocas sobre hardware AMD Instinct MI300X con ROCm. El corpus `stratified_v6` contiene 123.205 filas de entrenamiento, 15.763 de validación y 15.860 de test, con particiones disjuntas por hablante para evitar fuga de información. Respecto a la versión v5 del dataset, v6 canonicaliza unas 2.954 instancias de palabra: ortografía a nivel de letra, conjuntos con ZWJ y rakaransaya, pares de registro a nivel de palabra y erratas en inglés dentro de referencias con code-switching. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en cingalés a partir de audio de hasta 30 segundos por segmento (requiere troceado externo para audio más largo).
- Reconocimiento de habla con tolerancia a code-switching cingalés-inglés, ya que el dataset de entrenamiento incluye referencias mezcladas con términos en inglés.
- Manejo de ortografía cingalesa compleja: conjuntos con ZWJ y rakaransaya, así como variación de registro léxico, corregidos explícitamente en la versión v6 de los datos.
- Salida de transcripción con marcas de tiempo a nivel de segmento (capacidad heredada de la arquitectura Whisper, no verificada específicamente en este checkpoint).
- No se documenta soporte de tool calling, function calling, uso agéntico ni razonamiento multi-paso: es un modelo puramente acústico-textual.
- No dispone de capacidades de visión, audio comprensivo, traducción verificada ni generación de texto libre fuera del contexto de transcripción.
- No se documenta diarización de hablantes, detección de emociones ni clasificación de audio.

## Casos de uso

- Transcripción de archivos sonoros y audiovisuales en cingalés: digitalización de entrevistas, programas de radio o archivos orales con un WER de referencia del 16,38 % en el dominio del corpus de evaluación; para piezas largas habría que segmentar el audio en ventanas compatibles con el modelo.
- Subtitulado automático de vídeo: el modelo genera transcripciones con marcas temporales por segmento, lo que permite producir subtítulos en cingalés para plataformas de vídeo, con revisión humana posterior dado el nivel de error.
- Analítica de centros de contacto: transcripción de llamadas de atención al cliente en cingalés para alimentar sistemas de búsqueda, clasificación de motivos o control de calidad; el ajuste específico al idioma supera al Whisper small original en este dominio.
- Dictado y asistentes de voz: integración en aplicaciones de escritorio o móviles con un coste de cómputo bajo (menos de 250 M de parámetros), aunque requeriría conversión a un formato optimizado para inferencia en tiempo real.
- Indexación y búsqueda semántica de audio: convertir grandes volúmenes de grabaciones en cingalés a texto indexable para bibliotecas, archivos judiciales o repositorios académicos.
- Documentación clínica o administrativa dictada: transcripción de notas de voz en consultas o expedientes, siempre con revisión profesional dada la criticidad del contenido y el riesgo de error de sustitución de palabras.
- Investigación lingüística y de ASR de bajos recursos: el checkpoint sirve como punto de partida para fine-tunes adicionales o para estudios comparativos sobre ortografía cingalesa, ya que se publican el dataset y las métricas de cada run.
- Base para destilación o cuantización: al ser un modelo pequeño y con licencia permisiva, puede usarse como profesor en destilación o como candidato a conversión a CTranslate2 o GGUF para despliegue ligero.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER y CER, en porcentaje; menor es mejor):

| Split | WER | CER |
|---|---|---|
| Validación (época 6, final) | 19,61 % | 6,17 % |
| Test (completo, 15.860 filas) | 16,38 % | 4,43 % |

Comparativa con los runs anteriores del mismo proyecto (mismo split de test):

| Modelo | Época / datos | WER test | CER test |
|---|---|---|---|
| whisper-small-sinhala-run11-v6-e6 | 6 épocas, datos v6 | 16,38 % | 4,43 % |
| whisper-small-sinhala-run10-v6 | 5 épocas, datos v6 | 17,17 % | 4,71 % |
| whisper-small-sinhala-run6-v5 | 5 épocas, datos v5 | 17,15 % | 4,62 % |

No se han publicado resultados de benchmarks en la información disponible para tareas distintas de ASR (MMLU, HumanEval, GSM8K u otros), ya que no son aplicables a este tipo de modelo. Tampoco se publica el WER del `openai/whisper-small` sin ajustar sobre el mismo conjunto de test, por lo que no puede cuantificarse la ganancia bruta del fine-tune.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 0,97 GB (241,7 M de parámetros × 4 bytes). En fp16/bf16: unos 0,48 GB. En int8: unos 0,24 GB.
- VRAM estimada para inferencia: del orden de 1,5 a 3 GB en fp16 contando activaciones del encoder, caché de decodificación por haz y overhead del framework. Cifra estimada a partir del tamaño del modelo; el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4090, A100, H100 o MI300X; en las GPU de gama alta el modelo está infrautilizado y el cuello de botella pasa a ser el preprocesado de audio.
- Cabe holgadamente en GPU de consumo (GTX 1650 4 GB, RTX 3050, RTX 4060) e incluso puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, vLLM (con soporte de Whisper) y Text Generation Inference. Para faster-whisper (CTranslate2), whisper.cpp o llama.cpp sería necesaria una conversión manual, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible. La model card no incluye mediciones de tiempo de inferencia ni de factor de tiempo real (RTF).
- Nota de almacenamiento: el repositorio ocupa 8,7 GB, muy por encima del tamaño del checkpoint final, presumiblemente por artefactos de entrenamiento adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER test cingalés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-sinhala-run11-v6-e6 | 241,7 M | Ventana de 30 s | 16,38 % | Apache 2.0 | HuggingFace, 0 descargas |
| openai/whisper-small (base) | 244 M | Ventana de 30 s | No disponible en esta información | Apache 2.0 en HuggingFace | Ampliamente desplegado |
| whisper-small-sinhala-run10-v6 | ~242 M | Ventana de 30 s | 17,17 % | Apache 2.0 | HuggingFace, mismo autor |
| whisper-small-sinhala-run6-v5 | ~242 M | Ventana de 30 s | 17,15 % | Apache 2.0 | HuggingFace, mismo autor |
| openai/whisper-medium | 769 M | Ventana de 30 s | No disponible en esta información | Apache 2.0 en HuggingFace | Ampliamente desplegado |

No se dispone de datos de otros proyectos de ASR en cingalés (por ejemplo, ajustes sobre modelos wav2vec 2.0 o MMS) en la información proporcionada, por lo que la comparación se limita a la familia Whisper y a los runs del propio autor.

## Limitaciones y advertencias

- Tasa de error no despreciable: un WER del 16,38 % en test implica que aproximadamente una de cada seis palabras se transcribe incorrectamente, con un CER del 4,43 %; el modelo no es apto para usos que exijan transcripción literal sin revisión humana.
- Sesgos y cobertura de dominio: el rendimiento está medido sobre el split `stratified_v6` de un único corpus. No hay información sobre acentos regionales, hablantes fuera del corpus, ruido de fondo, solapamiento de voces ni calidad de micrófono.
- Longitud de audio: la arquitectura procesa ventanas de 30 segundos; la transcripción de audio largo depende de un troceado correcto y de la estrategia de unión de segmentos, lo que puede introducir errores en las fronteras.
- Alucinación en audio silencioso o ruidoso: es un comportamiento documentado en la familia Whisper; en segmentos sin habla el modelo puede generar texto plausible pero inexistente. Se recomienda aplicar detección de actividad de voz (VAD) antes de la transcripción.
- Idiomas: solo se declara cingalés. Aunque los datos incluyen términos en inglés, no hay métricas que respalden un rendimiento fiable en code-switching ni en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene conservar el aviso de licencia y verificar la licencia del dataset de entrenamiento (`Yohan2003/whisper-sl-data`), que puede ser distinta.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo día, sin pipeline declarado y con un repositorio de 8,7 GB; no se ha validado de forma independiente.
- Sin datos de cuantización ni de latencia: cualquier despliegue en producción requiere medir el rendimiento real en el hardware objetivo, incluida la conversión a formatos optimizados si se necesita inferencia en tiempo real.
- Nombres y entidades: no se documenta ningún mecanismo específico para preservar nombres propios o terminología técnica, un punto crítico en transcripciones médicas, legales o administrativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yohan2003/whisper-small-sinhala-run11-v6-e6
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Yohan2003/whisper-sl-data
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/yohanj-23-university-of-moratuwa/whisper/runs/1n2t4gpf
