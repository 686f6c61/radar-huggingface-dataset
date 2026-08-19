# TOXIANG/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20

## Resumen

El modelo `sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20` es un sistema de reconocimiento automático de voz (ASR) bilingüe (chino e inglés) diseñado para funcionar en streaming, es decir, con baja latencia y procesamiento incremental de audio. Ha sido desarrollado por la comunidad de k2-fsa y empaquetado por el usuario TOXIANG en formato ONNX para su integración con la librería sherpa-onnx, que facilita el despliegue en producción sobre múltiples plataformas (CPU, GPU, móvil, web).

El modelo se basa en la arquitectura Zipformer, una variante eficiente de transformer optimizada para tareas de ASR en tiempo real, y está entrenado con el código de icefall del proyecto k2-fsa. Su tamaño de repositorio es de 0,7 GB, lo que sugiere un modelo de dimensiones medias, adecuado para entornos con recursos moderados. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su capacidad para transcribir audio en dos idiomas de forma simultánea y en tiempo real, algo útil para aplicaciones como subtitulado en directo, asistentes de voz o sistemas de atención al cliente multilingüe. Al estar exportado a ONNX, puede ejecutarse con runtime optimizados como ONNX Runtime, TensorRT o llama.cpp (aunque este último no es típico para ASR), y es compatible con herramientas como sherpa-onnx, que simplifican la integración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (transformer eficiente para ASR streaming) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (diseñado para streaming, procesa tramas de audio) |
| Tipos de cuantizacion | no disponible (formato ONNX, posible cuantizacion posterior) |
| Idiomas soportados | Chino (mandarin) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer, introducida por el equipo de k2-fsa en 2023. Zipformer es una mejora del transformer original que reduce la complejidad computacional mediante mecanismos de atención con ventanas locales y un diseño de bloques más eficiente, lo que lo hace especialmente adecuado para ASR en streaming donde la latencia es crítica. El modelo procesa audio en tramas cortas (típicamente 32 ms) y produce transcripciones de forma incremental.

El entrenamiento se realizó utilizando el código del repositorio `icefall` (rama `pruned_transducer_stateless7_streaming`) sobre el dataset LibriSpeech para la parte inglesa, y presumiblemente con datos adicionales en chino para la parte bilingüe. El modelo original en formato TorchScript proviene del repositorio `pfluo/k2fsa-zipformer-chinese-english-mixed`. No se dispone de detalles sobre el volumen total de datos de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas de RLHF/DPO (poco comunes en ASR). La exportación a ONNX se realizó para facilitar la inferencia en entornos de producción.

## Capacidades

- Reconocimiento de voz en chino (mandarín) e inglés, con capacidad de procesar ambos idiomas en una misma secuencia de audio.
- Streaming en tiempo real: procesa audio de forma incremental, adecuado para aplicaciones que requieren baja latencia (menos de 300 ms típicamente).
- Salida de texto plano con soporte para puntuación básica (dependiendo del modelo original).
- Compatible con sherpa-onnx, lo que permite su uso en Python, C++, Android, iOS, web (WebAssembly) y otros entornos.
- No incluye capacidades de tool calling, agentes o razonamiento multimodal; es un modelo puramente de ASR.

## Casos de uso

- Subtitulado en directo para eventos, reuniones o emisiones en vivo: el modelo transcribe audio en tiempo real, permitiendo generar subtítulos en chino e inglés simultáneamente. Su baja latencia es esencial para mantener sincronización con el habla.
- Asistentes de voz bilingües: integrable en sistemas de comandos por voz donde el usuario alterna entre chino e inglés. Puede ejecutarse en dispositivos embebidos o en servidores.
- Transcripción de reuniones y llamadas: al ser streaming, puede transcribir conversaciones en tiempo real, facilitando actas automáticas o búsqueda de contenido.
- Atención al cliente automatizada: en centros de contacto, el modelo puede transcribir llamadas para análisis posterior o para alimentar sistemas de IA conversacional.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en aplicaciones de videoconferencia o streaming.
- Investigación en ASR: sirve como punto de partida para experimentos con arquitecturas Zipformer o para comparaciones de rendimiento en escenarios bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas como WER (Word Error Rate) o CER (Character Error Rate) en su model card. Para evaluarlo, sería necesario ejecutarlo sobre conjuntos de datos como LibriSpeech (inglés) o AISHELL (chino), pero no se proporcionan cifras oficiales.

## Requisitos de hardware

- Al ser un modelo ONNX de 0,7 GB, puede ejecutarse en CPU con un rendimiento aceptable para streaming, gracias a la eficiencia de Zipformer.
- Para inferencia en tiempo real con baja latencia, se recomienda una GPU con al menos 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). Sin embargo, no se dispone de datos exactos de VRAM.
- Es compatible con ONNX Runtime, que permite aceleración por CPU (Intel MKL, ARM) y GPU (CUDA, DirectML).
- También puede ejecutarse con sherpa-onnx, que incluye bindings para C++, Python, Android y iOS.
- En CPU, el throughput estimado dependerá del número de hilos y de la optimización del runtime; para un solo flujo de audio, la latencia suele ser inferior a 200 ms en hardware moderno, pero no se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de ASR bilingüe. Sin embargo, se puede contextualizar con alternativas comunes:

| Modelo | Arquitectura | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| sherpa-onnx-streaming-zipformer (este) | Zipformer | chino, inglés | Sí | Apache 2.0 | ONNX |
| Whisper (OpenAI) | Transformer | 99 idiomas | No (procesa audio completo) | MIT | PyTorch, ONNX, etc. |
| Paraformer (Alibaba) | Transformer | chino, inglés | Sí (variante streaming) | Apache 2.0 | ONNX, PyTorch |

Whisper ofrece mayor cobertura multilingüe pero no es streaming nativo; Paraformer es similar en enfoque bilingüe pero con arquitectura distinta. No se dispone de métricas de WER para comparar cuantitativamente.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o errores específicos del modelo. Como cualquier ASR, puede fallar en entornos ruidosos, con acentos no estándar o con habla solapada.
- Riesgo de alucinación: los modelos de ASR pueden generar texto incorrecto cuando el audio es ambiguo o de baja calidad; no se han documentado casos específicos.
- Limitaciones de idioma: aunque es bilingüe, puede tener menor precisión en inglés británico u otros acentos no representados en los datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento originales (LibriSpeech es de dominio público, pero los datos en chino podrían tener licencias específicas).
- Para producción, es necesario validar el rendimiento con datos propios, ya que no hay benchmarks oficiales.
- El modelo está pensado para streaming; si se requiere transcribir audio largo de una sola vez, otros modelos no streaming podrían ser más precisos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TOXIANG/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20
- Modelo TorchScript original: https://huggingface.co/pfluo/k2fsa-zipformer-chinese-english-mixed
- Código de entrenamiento (icefall): https://github.com/k2-fsa/icefall/tree/master/egs/librispeech/ASR/pruned_transducer_stateless7_streaming
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
