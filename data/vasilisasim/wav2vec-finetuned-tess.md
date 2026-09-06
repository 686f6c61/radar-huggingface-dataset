# VasilisAsim/wav2vec-finetuned-TESS

## Resumen

El modelo VasilisAsim/wav2vec-finetuned-TESS es un clasificador de emociones en audio basado en la arquitectura Wav2Vec2, desarrollado por VasilisAsim. Se trata de un ajuste fino (fine-tuning) del modelo `facebook/wav2vec2-base` sobre un conjunto de datos denominado TESS, orientado a la tarea de clasificación de audio. El modelo tiene 94.570.375 parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,4 GB.

Su relevancia radica en que permite clasificar la emoción en señales de voz, una tarea aplicable al análisis de audio, la atención al cliente o la investigación en psicología. Sin embargo, la información disponible en la model card es muy limitada: no se detallan datos de entrenamiento, evaluación, licencia ni idiomas soportados, lo que condiciona su evaluación técnica y su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (CNN + Transformer) |
| Parametros totales | 94.570.375 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `facebook/wav2vec2-base` sobre el dataset TESS. La arquitectura Wav2Vec2 combina una red convolucional para extraer representaciones de la señal de audio y un transformer para modelar las dependencias temporales. El modelo base fue preentrenado de forma autosupervisada sobre audio sin etiquetar, y posteriormente se ha ajustado para clasificación de emociones en audio.

No se disponen de detalles sobre el proceso de entrenamiento, la composición del dataset, los hiperparámetros ni el número de épocas. La model card no incluye información sobre el procedimiento de ajuste fino.

## Capacidades

- Clasificación de emociones en audio: asigna una etiqueta de emoción a un segmento de voz.
- Procesamiento de señales de audio: acepta entradas de audio y devuelve una predicción de clase.
- No genera texto: es un modelo discriminativo, no generativo.
- No soporta tool calling ni function calling.
- No es multimodal: solo procesa audio, no imágenes ni texto.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Análisis de llamadas de atención al cliente: el modelo puede clasificar la emoción del cliente en cada segmento de audio, lo que permite detectar frustración o insatisfacción en tiempo real.
- Evaluación de entrevistas de trabajo: clasificar la emoción del candidato en grabaciones de entrevistas para analizar su reacción a preguntas concretas.
- Monitorización de salud mental: analizar el tono de voz en sesiones de terapia o en grabaciones de pacientes para detectar posibles signos de depresión o ansiedad.
- Sistemas de asistencia por voz: adaptar la respuesta del sistema según la emoción detectada en el usuario, mejorando la interacción en asistentes virtuales.
- Análisis de contenido de vídeo: clasificar la emoción en clips de audio de vídeos para etiquetar contenido de forma automática, por ejemplo, en plataformas de streaming.
- Investigación en psicología: estudiar la expresión emocional en muestras de voz para fines de investigación académica o clínica.
- Control de calidad en centros de contacto: monitorizar las interacciones entre agentes y clientes para evaluar el desempeño y la satisfacción del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 0,4 GB en disco. Con 94.570.375 parámetros en float32, la inferencia requiere aproximadamente 378 MB de VRAM.
- GPU recomendadas: no disponible. Cualquier GPU de consumo con al menos 1 GB de VRAM (por ejemplo, RTX 3060) puede ejecutarlo.
- También puede ejecutarse en CPU, ya que el tamaño del modelo es reducido.
- Opciones de despliegue: transformers (pipeline de HuggingFace), compatible con `audio-classification`. Puede convertirse a ONNX si se requiere.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VasilisAsim/wav2vec-finetuned-TESS | 94,57 M | no disponible | no disponible | HuggingFace |
| VasilisAsim/wav2vec-base-finetuned-TESS | 94,57 M | no disponible | no disponible | HuggingFace |
| VasilisAsim/wav2vec-base-finetuned-IEMOCAP | 94,57 M | no disponible | no disponible | HuggingFace |

Los tres modelos comparten la misma arquitectura base y el mismo número de parámetros. Se diferencian en el dataset de ajuste fino: TESS e IEMOCAP son conjuntos de datos de emociones en voz, aunque no se dispone de detalles sobre su composición ni sobre el rendimiento comparativo.

## Limitaciones y advertencias

- La model card está vacía: no se proporcionan detalles sobre el proceso de entrenamiento, los datos utilizados ni la evaluación.
- Se desconocen los sesgos del modelo, ya que no se ha documentado la composición del dataset TESS.
- El modelo se ha ajustado en un dataset concreto, por lo que puede no generalizar a otros acentos, idiomas o condiciones de audio (ruido, distintas frecuencias, etc.).
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto, solo clasifica audio.
- Restricciones de licencia: no disponibles. Es necesario verificar los términos de uso antes de desplegarlo en producción.
- No se han publicado resultados de evaluación, por lo que no se puede garantizar su rendimiento en tareas reales.

## Enlaces

- HuggingFace: https://huggingface.co/VasilisAsim/wav2vec-finetuned-TESS
- Modelo similar: https://huggingface.co/VasilisAsim/wav2vec-base-finetuned-TESS
- Modelo similar: https://huggingface.co/VasilisAsim/wav2vec-base-finetuned-IEMOCAP
