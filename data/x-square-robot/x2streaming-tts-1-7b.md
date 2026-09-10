# x-square-robot/X2Streaming-TTS-1.7B

## Resumen

X2Streaming-TTS-1.7B es un modelo de síntesis de voz (text-to-speech) desarrollado por X Square Robot, construido como un fine-tuning de Qwen/Qwen3-TTS-12Hz-1.7B-Base. Se trata de un checkpoint de tipo `custom_voice` con una única voz integrada en la tabla de hablantes, `robot_service_v1` (identificador de hablante 3000), descrita por el autor como una voz de asistente de servicio en mandarín. El modelo genera directamente forma de onda mono a 24 kHz.

Su relevancia no está en ser un TTS genérico, sino en ser el checkpoint concreto que sirve el motor Qwen3TTS-Streaming dentro del stack de diálogo hablado de X Square Robot, y sobre el que se publican el método X2Streaming-TTS y el observador de progreso X2-NativeCursor. La propuesta técnica es la síntesis a nivel de token (*token-level streaming*) desplegada sobre TensorRT, lo que permite emitir audio a medida que llega el texto en lugar de esperar a la frase completa: "habla mientras llega el texto, sigue el progreso de lectura y usa el reloj de reproducción para alinear interrupciones e historial de diálogo con el audio ya reproducido".

El modelo tiene 1.916.676.352 parámetros reales (según los pesos en safetensors), se distribuye con pesos en bfloat16 en el layout estándar de Qwen3-TTS, y se publica bajo licencia Apache-2.0. El repositorio ocupa 4,5 GB. La versión de release es `cont7e3-f2b8ed5`. Primario en chino mandarín, secundario en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3TTSForConditionalGeneration`: Talker de 1,7B + Code Predictor, tokenizador de voz multi-codebook a 12 Hz, decodificador Code2Wav |
| Parámetros totales | 1.916.676.352 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en bfloat16 (sin GGUF, GPTQ ni AWQ). El motor Qwen3TTS-Streaming exporta a ONNX y compila motores TensorRT |
| Idiomas soportados | chino mandarín (primario), inglés (secundario) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16); `model.safetensors` de 3,83 GB + `speech_tokenizer/model.safetensors` de 0,68 GB |
| Tipo de modelo | `custom_voice` con tabla de hablantes integrada |
| Voces integradas | `robot_service_v1` (speaker id 3000), voz de asistente de servicio en mandarín |
| Salida | forma de onda mono a 24 kHz |
| Precisión | bfloat16 |
| Versión de release | `cont7e3-f2b8ed5` (fichero `MODEL_VERSION`) |
| Parámetros de muestreo por defecto | temperature 0,9; top_k 50; top_p 1,0; repetition_penalty 1,05 |
| Librería declarada | tensorrt |
| Tamaño del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-TTS tal cual, bajo la clase `Qwen3TTSForConditionalGeneration`: un componente Talker de aproximadamente 1,7B parámetros junto a un Code Predictor, un tokenizador de voz multi-codebook que opera a 12 Hz y un decodificador Code2Wav que reconstruye la señal a 24 kHz mono. El checkpoint se ha obtenido por fine-tuning desde Qwen3-TTS-12Hz-1.7B-Base, no por entrenamiento desde cero, y la model card lo etiqueta explícitamente como modelo de tipo `custom_voice`, es decir, con una tabla de hablantes propia en lugar de clonación por referencia de audio.

La innovación destacable no está en el preentrenamiento sino en el modo de explotación: el checkpoint está diseñado para exportarse sin cambios a través del pipeline de Qwen3TTS-Streaming, que convierte los pesos a ONNX, compila motores TensorRT y sirve síntesis a nivel de token. Los dos artículos asociados (arXiv 2608.18661 para X2Streaming-TTS y arXiv 2609.09677 para X2-NativeCursor) cubren el método de streaming y el observador de progreso que sincroniza resaltado de texto, interrupciones conscientes de la reproducción y actualización del historial de diálogo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en chino mandarín e inglés, con salida de audio mono a 24 kHz.
- Voz integrada única `robot_service_v1`, orientada a asistente de servicio; no requiere audio de referencia para generar.
- Síntesis en streaming a nivel de token: permite empezar a emitir audio antes de completar la frase, mediante el motor Qwen3TTS-Streaming sobre TensorRT.
- Observación de progreso de lectura mediante X2-NativeCursor, que asocia el avance de la narración con el texto fuente para resaltado sincronizado.
- Interrupción consciente de la reproducción (*playback-aware interruption*): el reloj de reproducción del audio determina qué parte del texto se considera ya emitida.
- Actualización del historial de diálogo alineada con el audio efectivamente reproducido, útil en agentes conversacionales multi-turno.
- Exportación a ONNX y compilación de motores TensorRT desde el propio checkpoint, sin conversión previa de pesos.
- Carga directa con el paquete Python `qwen_tts` para síntesis offline mediante `generate_custom_voice`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz para atención al cliente: la voz `robot_service_v1` está entrenada como voz de servicio en mandarín, y el streaming a nivel de token reduce el tiempo hasta el primer audio en respuestas largas de soporte.
- Lectura de documentos con resaltado sincronizado: combinado con X2-NativeCursor, el modelo narra texto a medida que llega y permite marcar en pantalla la frase que se está reproduciendo, útil en lectores accesibles o interfaces de aprendizaje.
- Diálogo hablado con interrupciones naturales: el mecanismo consciente de la reproducción permite que el agente corte la síntesis cuando el usuario habla y actualice el historial solo con lo que realmente se escuchó, evitando turnos fantasma.
- Locución integrada en robots de servicio: por el identificador de versión `cont7e3-f2b8ed5` y su uso como checkpoint desplegado en el stack propio de X Square Robot, encaja en productos de interacción física que necesitan voz consistente y de baja latencia.
- Narración continua por streaming dentro de pipelines de TensorRT: al exportarse a ONNX y compilar motores TensorRT, se puede integrar en servicios con GPU dedicada que priorizan throughput y latencia estable.
- Generación offline de audios de demostración o material formativo en mandarín e inglés: basta con el paquete `qwen_tts` y `generate_custom_voice`, sin necesidad de infraestructura de streaming.
- Prototipado de interfaces de voz multi-turno: el modelo sirve como base para evaluar estrategias de barge-in y de gestión de historial alineado con el audio reproducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,5 GB solo de pesos (`model.safetensors` 3,83 GB + `speech_tokenizer/model.safetensors` 0,68 GB); con activaciones, cachés y búferes de audio conviene reservar del orden de 6 a 8 GB. Es una estimación derivada de los tamaños de fichero publicados, no un dato medido.
- GPU recomendadas para el modo servidor con TensorRT: NVIDIA con soporte de TensorRT y bfloat16, preferiblemente A100, H100 o L40S para despliegues concurrentes.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. La compilación de motores TensorRT añade consumo de memoria temporal durante la construcción.
- Opciones de despliegue documentadas: motor Qwen3TTS-Streaming (exportación a ONNX + TensorRT) y el paquete Python `qwen_tts` para síntesis offline. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Ubicación de pesos esperada por el motor: la variante `custom-1.7b` lee los pesos desde `workspace/models/Qwen3-TTS-12Hz-1.7B-CustomVoice`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Voces | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| X2Streaming-TTS-1.7B | 1.916.676.352 | no disponible | 1 integrada (`robot_service_v1`) | zh (primario), en (secundario) | Apache-2.0 | HuggingFace, librería declarada tensorrt |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | no disponible en la información proporcionada | no disponible | no disponible (es el modelo base) | no disponible | no disponible | HuggingFace |
| x-square-robot/X2-NativeCursor-Qwen3TTS-12Hz | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos. La diferencia funcional conocida es que X2Streaming-TTS-1.7B incorpora una tabla de hablantes propia con una voz de servicio, mientras que el modelo base de Qwen no incluye esa voz específica, y X2-NativeCursor-Qwen3TTS-12Hz actúa como observador de progreso dentro del mismo stack.

## Limitaciones y advertencias

- Una sola voz integrada: `robot_service_v1`. No hay clonación de voz arbitraria ni selección entre múltiples hablantes.
- Cobertura de idiomas limitada: mandarín como idioma primario e inglés como secundario; no se documenta soporte para otras lenguas, incluido el castellano.
- Sin benchmarks publicados: no hay métricas objetivas de naturalidad, inteligibilidad o robustez frente a errores de pronunciación.
- Sin formatos cuantizados publicados: no hay GGUF, GPTQ ni AWQ en el repositorio, lo que dificulta el despliegue en entornos sin TensorRT o con VRAM muy ajustada.
- Dependencia del ecosistema TensorRT para el modo streaming: el pipeline de Qwen3TTS-Streaming exige exportar a ONNX y compilar motores, con la complejidad de versiones que eso implica.
- Longitud de contexto no disponible: no se puede dimensionar de antemano cuánto texto admite por petición sin truncar.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o lecturas erróneas de números y nombres propios; requiere verificación en producción.
- Sesgos: no se documenta ningún análisis de sesgos de acento, género o registro en la información disponible; la voz está orientada a un registro de asistente de servicio.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, es decir, sin validación externa de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-TTS-12Hz-1.7B-Base del que deriva, ya que sus términos propios no figuran en la información proporcionada.
- Idioma de la documentación: la model card está en inglés y los ejemplos de síntesis están en chino mandarín.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/x-square-robot/X2Streaming-TTS-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Observador de progreso X2-NativeCursor: https://huggingface.co/x-square-robot/X2-NativeCursor-Qwen3TTS-12Hz
- Repositorio del método X2Streaming-TTS: https://github.com/X-Square-Robot/X2Streaming-TTS
- Motor de streaming Qwen3TTS-Streaming: https://github.com/X-Square-Robot/Qwen3TTS-Streaming
- Paquete oficial Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Artículo arXiv 2608.18661: https://arxiv.org/abs/2608.18661
- Artículo arXiv 2609.09677: https://arxiv.org/abs/2609.09677

Nota: las búsquedas web realizadas devolvieron únicamente resultados sobre la red social X, sin relación con este modelo, por lo que no aportan enlaces adicionales relevantes.
