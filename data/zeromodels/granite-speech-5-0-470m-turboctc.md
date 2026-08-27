# zeromodels/granite-speech-5.0-470m-turboctc

## Resumen

Granite Speech 5.0 TurboCTC es un modelo de reconocimiento automático del habla (ASR) no autorregresivo desarrollado por IBM, del que zeromodels ofrece una conversión íntegra a Keras 3 que funciona sin modificaciones sobre TensorFlow, PyTorch o JAX. Con 470 millones de parámetros, emplea un encoder basado en conformer con atención por bloques y posiciones relativas de Shaw, junto con una cabeza CTC autocondicionada. La transcripción se realiza en una única pasada hacia delante, sin bucle de decodificación, lo que permite velocidades de inferencia extremadamente altas: según el blog de IBM, alcanza 12 600 veces la velocidad en tiempo real, transcribiendo 3,5 horas de audio por segundo.

Este modelo resuelve el problema de la transcripción de voz a texto en inglés con una latencia mínima y un coste computacional reducido, lo que lo hace adecuado para despliegue en dispositivos de borde y para el procesamiento masivo de audio. Su licencia Apache 2.0 permite uso comercial, a diferencia de la variante no comercial del mismo modelo. La conversión de zeromodels mantiene los pesos originales en formato safetensors y añade una implementación Keras 3 que facilita la integración en entornos heterogéneos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (block-wise self-attention con Shaw relative positions, dos bloques de time-subsampling) + cabeza CTC autocondicionada |
| Parametros totales | 470 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio de duración variable, sin contexto de texto explícito) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (el modelo turboctc de IBM es específico para inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también pesos Keras 3 en el repo de zeromodels) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de dos pasadas típico de la familia Granite Speech, pero en su variante TurboCTC se simplifica a un único encoder conformer con una cabeza CTC autocondicionada. El encoder aplica dos bloques de submuestreo temporal temprano para reducir la resolución temporal, seguidos de capas de atención por bloques con posiciones relativas de Shaw. La salida se decodifica con CTC greedy, colapsando repeticiones y eliminando el token blank. No hay decodificador autorregresivo ni componente de lenguaje.

El entrenamiento se describe en el artículo arXiv:2505.08699, aunque la información disponible no detalla el número de tokens ni la composición exacta del dataset. Se sabe que el modelo está entrenado específicamente para ASR en inglés y produce texto en subwords en minúsculas. La conversión de zeromodels no altera los pesos originales; solo reimplementa la arquitectura en Keras 3, permitiendo elegir backend entre TensorFlow, PyTorch y JAX.

## Capacidades

- Transcripción de voz a texto en inglés (ASR) con salida en subwords en minúsculas.
- Inferencia no autorregresiva: la transcripción completa se genera en una sola pasada, sin bucle de decodificación.
- Velocidad de procesamiento muy alta: 12 600 veces la velocidad en tiempo real (según el blog de IBM), lo que equivale a transcribir 3,5 horas de audio por segundo.
- Compatibilidad multi-backend gracias a Keras 3: puede ejecutarse en TensorFlow, PyTorch o JAX sin cambios en el código.
- Integración sencilla con el ecosistema zeromodels, incluyendo extractor de características y tokenizador.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en tiempo real de reuniones y conferencias: su baja latencia permite generar subtítulos al instante, incluso en dispositivos con recursos limitados.
- Transcripción masiva de archivos de audio (podcasts, entrevistas, grabaciones): la velocidad de 12 600x tiempo real permite procesar horas de audio en segundos, ideal para pipelines de indexación.
- Asistentes de voz en dispositivos de borde: al ser un modelo compacto de 470M, puede ejecutarse en hardware modesto (Raspberry Pi, teléfonos) con un consumo energético reducido.
- Preprocesamiento para análisis de texto: transcribir audio antes de aplicar modelos de NLP (análisis de sentimiento, extracción de entidades) en flujos de datos.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en aplicaciones de streaming o videollamadas.
- Análisis de llamadas de atención al cliente: transcribir conversaciones telefónicas para su posterior análisis y control de calidad, aprovechando la alta velocidad para procesar grandes volúmenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, CER, etc.) en la información disponible. El único dato de rendimiento documentado es la velocidad de inferencia: 12 600 veces la velocidad en tiempo real, según el blog de IBM. No se proporcionan comparaciones con otros modelos en términos de precisión.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 470M parámetros, la inferencia en FP32 requiere aproximadamente 1,9 GB de memoria. Con cuantización a FP16 o INT8, cabría en GPUs con 1-2 GB de VRAM, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU, aunque con menor rendimiento.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en tarjetas integradas si se usa cuantización.
- Opciones de despliegue: al ser una implementación Keras 3, puede servirse con TensorFlow Serving, TorchServe o mediante exportación a ONNX para usar con ONNX Runtime. No es compatible directamente con vLLM ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput: la latencia es mínima (una sola pasada) y el throughput es muy alto, del orden de 3,5 horas de audio por segundo en hardware adecuado, según el blog de IBM.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Velocidad |
|---|---|---|---|---|---|
| Granite Speech 5.0 TurboCTC (este) | 470M | Conformer + CTC | Inglés | Apache 2.0 | 12 600x tiempo real |
| Whisper tiny (OpenAI) | 39M | Transformer autorregresivo | Multilingüe | MIT | ~1x tiempo real (aprox.) |
| Whisper small (OpenAI) | 244M | Transformer autorregresivo | Multilingüe | MIT | ~0.3x tiempo real (aprox.) |
| wav2vec2 base (Facebook) | 95M | Conformer + CTC | Multilingüe (según checkpoint) | Apache 2.0 | ~100x tiempo real (aprox.) |

La comparativa muestra que Granite Speech TurboCTC ofrece una velocidad muy superior a los modelos autorregresivos como Whisper, a costa de estar limitado al inglés. Frente a wav2vec2, que también es no autorregresivo, Granite Speech incorpora un encoder conformer más moderno y una cabeza CTC autocondicionada, además de un tamaño mayor (470M frente a 95M), lo que probablemente mejore la precisión, aunque no se dispone de datos de WER para confirmarlo.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para inglés; no soporta otros idiomas, a diferencia de otros miembros de la familia Granite Speech.
- La salida es texto en minúsculas y sin puntuación, lo que puede requerir postprocesamiento para aplicaciones que necesiten formato.
- Al ser un modelo ASR puro, no tiene capacidades de comprensión del lenguaje, generación de texto ni razonamiento.
- Puede presentar errores en habla con acentos no representados en los datos de entrenamiento, ruido de fondo o solapamiento de voces.
- No se han publicado resultados de benchmarks de precisión (WER) en la información disponible, por lo que su rendimiento exacto en escenarios reales no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la atribución requerida y las condiciones de la licencia del modelo original de IBM.

## Enlaces

- Modelo en HuggingFace (zeromodels): https://huggingface.co/zeromodels/granite-speech-5.0-470m-turboctc
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Paper arXiv: https://arxiv.org/abs/2505.08699
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de Granite Speech en ZeroModels: https://imvision12.github.io/ZeroModels/granite_speech5/
- Documentación de IBM Granite Speech: https://www.ibm.com/granite/docs/models/speech
- Repositorio de modelos Granite Speech de IBM: https://github.com/ibm-granite/granite-speech-models
