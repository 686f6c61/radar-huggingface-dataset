# towfique-elahe/beyond-words-whisper-medium-did

## Resumen

Beyond Words Whisper-medium Bangla dialect classifier es un modelo de clasificación de audio derivado de `openai/whisper-medium`, desarrollado por towfique-elahe en el marco de una tesis de grado de la East Delta University (2026). El modelo reutiliza únicamente el codificador de Whisper, descarta el decodificador y añade un projector, un mean-pooling y una cabeza lineal para clasificar fragmentos de audio de 5 segundos en nueve clases dialectales del bengalí: Barishal, Chattogram, Dhaka, Formal (registro estándar), Khulna, Mymensingh, Noakhali, Rajshahi y Sylhet.

El problema que aborda es la identificación automática de variedades dialectales del bengalí a partir de habla espontánea, una tarea con aplicaciones en sociolingüística computacional, adaptación de sistemas ASR y análisis de contenido audiovisual. Frente a clasificadores entrenados sobre hablantes compartidos entre train y test, el autor publica un checkpoint con partición estricta por pseudo-hablante (clustering con ECAPA-TDNN), lo que ofrece una estimación más realista de la generalización a hablantes no vistos.

El modelo tiene 306.201.097 parámetros, un repo de 1,2 GB en safetensors y licencia Apache 2.0. Su relevancia actual es limitada pero concreta: es uno de los pocos clasificadores públicos de dialectos del bengalí con protocolo de evaluación estricto y métricas por clase reportadas, lo que lo hace útil como línea base reproducible para investigación en dialectología computacional de lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (`WhisperForAudioClassification`), basado en el encoder de `openai/whisper-medium` con projector, mean-pooling y cabeza lineal |
| Parametros totales | 306.201.097 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 5 segundos de audio (250 posiciones de la tabla posicional, `max_source_positions = 250`); entrada de 80-band log-mel con 500 frames |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en fp32/fp16) |
| Idiomas soportados | Bengalí (bn), nueve clases dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del codificador de `openai/whisper-medium` y elimina el decodificador. Sobre las representaciones del encoder se aplica un projector, seguido de mean-pooling sobre la dimensión temporal y una capa lineal que produce logits para las nueve clases dialectales. La tabla posicional se recorta a 250 filas, por lo que el modelo acepta exclusivamente entradas de 5 segundos (80.000 muestras a 16 kHz); los audios más largos deben puntuarse en ventanas de 5 segundos.

El entrenamiento se realizó sobre 9.303 clips (13,1 horas) de televisión, cine y habla en línea de Bangladés, procedentes de los conjuntos de Badhon et al. (2020) y Alam et al. (2023). La partición se hizo por pseudo-hablante mediante clustering con ECAPA-TDNN, con 6.931 clips de entrenamiento, 1.045 de validación y 1.327 de test. La receta emplea entropía cruzada con pesos por clase, learning rate de 2e-5 para el encoder y 1e-4 para la cabeza, batch de 8 × 2, precisión fp16 y 12 épocas sobre una GPU T4 de Kaggle, seleccionando el mejor checkpoint por macro-F1 de validación en la época 5. No se reporta uso de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de audio en nueve clases dialectales del bengalí: Barishal, Chattogram, Dhaka, Formal, Khulna, Mymensingh, Noakhali, Rajshahi y Sylhet.
- Procesamiento de fragmentos de 5 segundos a 16 kHz con extractor de características log-mel de 80 bandas.
- Salida de distribución de probabilidad sobre las nueve clases mediante softmax, lo que permite umbralizar o combinar ventanas.
- Evaluación con partición estricta por hablante, orientada a medir generalización a hablantes no vistos.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio más allá de la clasificación descrita.
- Capacidad multilingüe limitada al bengalí; no se ha entrenado para otras lenguas.

## Casos de uso

- Investigación en dialectología computacional: el modelo permite etiquetar corpus de habla bengalí por variedad regional y cuantificar la distribución dialectal de un conjunto de audios, con la ventaja de un protocolo de evaluación estricto por hablante que evita sobreestimar la precisión.
- Enrutamiento previo en pipelines ASR: clasificar el dialecto de un clip de 5 segundos antes de enviarlo a un modelo acústico o a un léxico adaptado a esa variedad, mejorando la tasa de error en variedades alejadas del estándar.
- Análisis de contenido audiovisual: procesar emisiones de televisión o vídeos en línea por ventanas de 5 segundos para medir la presencia de cada dialecto en un programa o en un canal.
- Moderación y accesibilidad: detectar el registro formal frente a variedades regionales en material grabado para decidir la variante de subtitulado o de síntesis de voz.
- Docencia y preservación lingüística: construir inventarios etiquetados de muestras dialectales para materiales educativos o archivos lingüísticos, usando la probabilidad por clase para seleccionar ejemplos representativos.
- Línea base reproducible para tareas de clasificación de acento: servir como referencia en comparaciones con otros encoders (Wav2Vec2, HuBERT, MMS) sobre el mismo conjunto de datos, dado que el autor publica particiones y métricas por clase.
- Filtrado de datasets: descartar o agrupar clips por dialecto antes de entrenar modelos de habla bengalí, reduciendo el desbalance entre variedades.

## Benchmarks y rendimiento

| Split | Macro-F1 | IC 95 % por grupo de hablante |
|---|---|---|
| Estricto (ningún hablante de train en test) — este checkpoint | 0.919 | 0.808–0.931 |
| A nivel de clip (convencional) — checkpoint separado | 0.984 | 0.975–0.991 |

F1 por clase en el split estricto: Barishal 0.88, Chattogram 0.85, Dhaka 0.97, Formal 0.91, Khulna 0.97, Mymensingh 0.91, Noakhali 0.90, Rajshahi 0.95, Sylhet 0.94.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2–1,5 GB en fp16 para los 306 millones de parámetros, más el overhead de activaciones de un clip de 5 segundos, que es reducido.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo se entrenó en una T4 de 16 GB, por lo que cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `WhisperForAudioClassification` (la vía documentada por el autor), exportación a ONNX y servicio mediante un endpoint HTTP propio; no se documenta soporte específico en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beyond Words Whisper-medium Bangla DID | 306 M | 5 s de audio | Clasificación de 9 dialectos del bengalí | Apache 2.0 | HuggingFace |
| `openai/whisper-medium` | 769 M | 30 s de audio | ASR y traducción multilingüe | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Encoders de habla tipo Wav2Vec2/HuBERT para bengalí | No disponible | No disponible | ASR o clasificación de acento | Varía según checkpoint | HuggingFace |

No se dispone de resultados de benchmarks comparativos con alternativas en la información proporcionada; la comparación anterior se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con habla de medios de comunicación y en línea; el habla telefónica o con ruido no está representada y puede degradar la precisión.
- Los hablantes de regiones fuera de las nueve clases se asignan a la clase conocida más próxima, sin opción de rechazo ni clase "desconocida".
- Solo acepta entradas de 5 segundos (`max_source_positions = 250`); audios más largos deben trocearse y agregarse, lo que puede introducir errores en las fronteras.
- Entrenado con una sola semilla, por lo que la variabilidad entre ejecuciones no está caracterizada.
- Los límites entre clases reflejan en parte el registro (Formal) y no solo la región, lo que puede confundir la clasificación de habla formal de cualquier procedencia.
- El intervalo de confianza del 95 % para el split estricto (0.808–0.931) es amplio, lo que indica incertidumbre considerable en la estimación de generalización.
- Riesgo de sesgo hacia las variedades con más muestras en el corpus original; el autor mitiga parcialmente con pesos por clase, pero no se reporta el desbalance final.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de origen pueden tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- No es un modelo generativo: no produce transcripciones ni texto, solo etiquetas de dialecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/towfique-elahe/beyond-words-whisper-medium-did
- Repositorio de código: https://github.com/towfique-elahe/beyond-words
- Demo en vivo: https://huggingface.co/spaces/towfique-elahe/beyond-words-dialect-id
- Modelo base: https://huggingface.co/openai/whisper-medium
