# wraithklu/cheeni-wakeword-xlsr_02

## Resumen

`wraithklu/cheeni-wakeword-xlsr_02` es un modelo de clasificación de audio publicado en Hugging Face por el usuario wraithklu. Por su nombre y por la arquitectura que declara (wav2vec2), se trata de un detector de palabra de activación (wake word) afinado a partir de un modelo preentrenado de la familia XLSR de Facebook/Meta, orientado a reconocer un término concreto ("cheeni") en flujo de audio.

El modelo emplea la librería `transformers`, se distribuye en formato safetensors y cuenta con 94.569.090 parámetros (aproximadamente 94,6 millones), lo que lo sitúa en el rango de los modelos wav2vec2-base. El repositorio ocupa 0,4 GB. La model card es la plantilla automática de Hugging Face y no aporta información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia.

La relevancia de esta ficha es limitada pero concreta: sirve como referencia para quien quiera evaluar o reutilizar un detector de wake word basado en wav2vec2, y como advertencia sobre los riesgos de desplegar un modelo sin documentación, sin métricas publicadas y sin licencia declarada. No hay descargas ni interacciones registradas en el Hub en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (clasificación de audio) |
| Parametros totales | 94.569.090 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no documentada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2, un transformer convolucional para representaciones auto-supervisadas de audio propuesto en el paper arXiv:1910.09700 (wav2vec 2.0). El modelo base del que parte es presumiblemente un checkpoint XLSR (cross-lingual speech representations), aunque el autor no lo especifica. La cabeza de clasificación es de tipo `audio-classification`, coherente con un detector binario de wake word.

No hay información sobre el conjunto de datos de entrenamiento, el número de horas de audio, el idioma del término de activación, si se aplicó aumento de datos, ni sobre el procedimiento de ajuste fino (learning rate, épocas, congelación de capas). Tampoco se documenta si hubo destilación o cuantización. Todo ello debe considerarse no disponible.

## Capacidades

- Clasificación de audio a nivel de clip o de ventana, orientada a la detección de una palabra de activación concreta.
- Extracción de representaciones acústicas mediante el encoder wav2vec2 subyacente, reutilizable para otras tareas de audio.
- Inferencia compatible con la pipeline `audio-classification` de `transformers`.
- No se documentan capacidades de transcripción, diarización, traducción, tool calling, razonamiento multi-paso ni procesamiento multimodal más allá del audio.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Detección de wake word en asistentes de voz embebidos: el modelo puede integrarse en un pipeline de captura continua de micrófono y emitir una probabilidad de activación por ventana de audio, despertando al asistente solo cuando supera un umbral configurable.
- Prototipado rápido de activación por voz en aplicaciones de escritorio: al ser un checkpoint `transformers` de ~95 M de parámetros, se puede cargar con `AutoModelForAudioClassification` y probar en CPU sin infraestructura dedicada.
- Filtrado previo en sistemas de grabación: usar el clasificador para segmentar audio y descartar fragmentos que no contengan la palabra clave, reduciendo el coste de etapas posteriores de ASR.
- Investigación sobre ajuste fino de wav2vec2: sirve como ejemplo de fine-tuning de un modelo XLSR para una tarea de clasificación binaria de audio, útil para comparar recetas de entrenamiento.
- Evaluación de robustez de wake words: permite medir falsos positivos y falsos negativos frente a ruido, acentos o distancia al micrófono, siempre que se construya un conjunto de test propio, ya que el autor no publica métricas.
- Base para un detector personalizado: el encoder wav2vec2 puede reutilizarse y reentrenar la cabeza de clasificación con una palabra de activación distinta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4 GB solo para pesos, más activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,2 GB para pesos, más overhead del runtime.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este tamaño. Funciona en CPU para audio de duración corta.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en iGPU y en CPU.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` para exportación a ONNX, y potencialmente `onnxruntime` para inferencia en edge. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no están orientadas a clasificación de audio.
- Latencia y throughput: no disponibles; dependen de la longitud de la ventana de audio y del hardware. Para ventanas de 1 segundo en CPU moderna se espera un orden de decenas de milisegundos, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wraithklu/cheeni-wakeword-xlsr_02 | 94,6 M | no disponible | Clasificación de audio (wake word) | no disponible | Hugging Face |
| facebook/wav2vec2-base-960h | ~95 M | audio de hasta ~10 s típicamente | ASR (transcripción) | Apache 2.0 (según el modelo base de Meta) | Hugging Face |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | audio variable | ASR multilingüe | Apache 2.0 (según el modelo base de Meta) | Hugging Face |
| Modelos de wake word propietarios (p. ej. Porcupine) | no disponible | flujo continuo | Detección de palabra clave | comercial | SDK propietario |

La comparación es aproximada: los dos primeros son modelos de ASR, no de clasificación, y el tercero es un producto comercial. No se dispone de métricas del modelo evaluado para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información sobre datos, evaluación, sesgos ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor; el riesgo legal es alto.
- Sin métricas publicadas de precisión, recall, falsos positivos ni falsos negativos; no es desplegable en producción sin una evaluación propia.
- El término de activación ("cheeni") y el idioma de entrenamiento no están documentados; el rendimiento fuera de ese dominio es incierto.
- Riesgo de sobreajuste al hablante o al micrófono de grabación, habitual en wake words con pocos datos.
- No hay garantía de robustez frente a ruido, reverberación, acentos o distancia al micrófono.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- No se documentan sesgos demográficos, pero un wake word entrenado con datos limitados puede tener peor rendimiento en determinados acentos o géneros.
- No se recomienda su uso en sistemas de seguridad, control de acceso ni aplicaciones críticas sin auditoría previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wraithklu/cheeni-wakeword-xlsr_02
- Paper wav2vec 2.0 (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Documentación de `transformers` para audio-classification: https://huggingface.co/docs/transformers/tasks/audio_classification
- Modelo base de referencia XLSR de Meta: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
