# ulfaslak/edda-v0.2-onnx

## Resumen

Edda v0.2 ONNX es una exportación en formato ONNX del modelo de reconocimiento automático del habla danés `danish-foundation-models/edda-v0.2`, publicado por el usuario ulfaslak. El modelo original es un Whisper large-v3-turbo afinado completamente sobre danés y liberado con licencia Apache-2.0 por Danish Foundation Models. Esta versión concreta no aporta entrenamiento nuevo: se limita a convertir los pesos a ONNX con cuantización dinámica a int8 para permitir la inferencia en el navegador mediante ONNX Runtime Web.

La relevancia de esta exportación es práctica: permite ejecutar un modelo de reconocimiento del habla de tamaño grande (la familia Whisper large-v3-turbo ronda los 809 millones de parámetros) en entornos sin GPU dedicada y sin backend Python, algo útil para aplicaciones locales que procesan audio sensible sin enviarlo a un servidor. El repositorio ocupa aproximadamente 1,0 GB y está pensado para transcripción de audio en danés en ventanas de 30 segundos.

El caso de uso declarado por el autor es Rescribe, una aplicación de grabación de llamadas que funciona íntegramente en local. La ficha se centra en las características de esta exportación ONNX int8, no en el modelo base, del que solo se dispone de la información reflejada en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (el modelo base pertenece a la familia Whisper large-v3-turbo; no se indica cifra exacta en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s (entrada `input_features [1, 128, 3000]`, 128 bins log-mel) |
| Tipos de cuantizacion | int8 dinamica (`MatMul` y `Gather`, via `quantize_dynamic` de onnxruntime) |
| Idiomas soportados | danes (`da`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_int8.onnx`, `decoder_model_int8.onnx`, `decoder_with_past_model_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3-turbo, un transformer encoder-decoder con atención estándar y sin mecanismos recurrentes ni de estado. El modelo original fue afinado completamente sobre danés por Danish Foundation Models; esta exportación no añade entrenamiento ni ajuste fino, sino que reproduce el comportamiento del modelo base en formato ONNX. La exportación se realizó con `optimum-cli export onnx --task automatic-speech-recognition-with-past`, lo que genera tres grafos: encoder, decoder para el primer paso (recibe `encoder_hidden_states`) y decoder con caché para los pasos posteriores.

La cuantización aplicada es dinámica a int8 sobre las operaciones `MatMul` y `Gather` mediante `quantize_dynamic` de onnxruntime. La entrada son características log-mel de 128 bins sobre una ventana de 30 segundos. La decodificación debe forzarse con el prompt `<|startoftranscript|><|da|><|transcribe|><|notimestamps|>`. Un detalle relevante documentado por el autor es que la cabeza de idioma ha perdido capacidad discriminativa tras el ajuste y la cuantización: identifica audio en inglés como danés, por lo que no debe usarse para detección de idioma. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automático del habla en danés sobre ventanas de audio de 30 segundos.
- Transcripción sin marcas de tiempo, ya que el prompt recomendado incluye `<|notimestamps|>`.
- Ejecución en navegador mediante ONNX Runtime Web, sin backend Python ni GPU dedicada.
- Inferencia local y offline, adecuada para audio sensible que no debe salir del dispositivo.
- Uso de caché de decodificación (`decoder_with_past_model_int8.onnx`) para acelerar la generación paso a paso.
- No soporta tool calling ni function calling: es un modelo puramente de ASR.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No ofrece capacidades de visión, audio generativo ni modo de razonamiento extendido.
- Multilingüismo limitado al danés; la cabeza de idioma no es fiable para identificación de lengua.

## Casos de uso

- Grabación y transcripción de llamadas en local: el modelo está pensado para Rescribe, una aplicación que graba llamadas y las transcribe sin enviar audio a ningún servidor; la ventana de 30 s y la ejecución en navegador encajan con este flujo.
- Subtitulado de reuniones internas en danés: se puede integrar en una aplicación web que procese segmentos de 30 s y genere texto para actas, aprovechando que no requiere infraestructura de GPU.
- Herramientas de accesibilidad para hablantes de danés: transcripción en tiempo casi real de conversaciones presenciales desde el navegador, con la ventaja de que el audio permanece en el dispositivo.
- Procesamiento de entrevistas y notas de voz: un pipeline que divida el audio en ventanas de 30 s y las pase al encoder ONNX permite transcribir grabaciones largas por lotes en una máquina de escritorio.
- Aplicaciones de escritorio o PWA sin backend: al ser ONNX int8, puede empaquetarse en una aplicación Electron o web que funcione completamente offline, útil en entornos con conectividad limitada.
- Prototipado rápido de ASR danés: sirve para validar un producto o una interfaz de voz en danés antes de invertir en infraestructura de inferencia dedicada, gracias a su licencia Apache-2.0 y a su tamaño manejable (1,0 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser una exportación int8 de un modelo de la familia Whisper large-v3-turbo, el peso de los tres grafos ONNX ronda el gigabyte, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no se especifican; el destino principal es la ejecución en navegador mediante ONNX Runtime Web, que puede usar WebGPU o WASM según el entorno.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el diseño apunta a CPU y a aceleración web, no a GPUs de datacenter como A100 o H100.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ulfaslak/edda-v0.2-onnx | no disponible (familia Whisper large-v3-turbo) | ventana de 30 s | danes | Apache-2.0 | ONNX int8 |
| danish-foundation-models/edda-v0.2 | no disponible (familia Whisper large-v3-turbo) | ventana de 30 s | danes | Apache-2.0 | safetensors (formato original, segun el modelo base) |
| openai/whisper-large-v3-turbo | no disponible en la informacion proporcionada | ventana de 30 s | multilingue | no disponible en la informacion proporcionada | safetensors |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada; la comparación se limita a formato, licencia e idioma.

## Limitaciones y advertencias

- La cabeza de idioma no discrimina: el autor advierte que identifica audio en inglés como danés, por lo que no debe usarse para detección de lengua.
- Solo soporta danés; no es un modelo multilingüe utilizable para otras lenguas.
- Ventana de audio fija de 30 segundos; audios más largos requieren segmentación manual en el pipeline.
- La cuantización dinámica a int8 puede degradar ligeramente la precisión respecto al modelo base en fp32, aunque no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios o audio musical.
- Sesgos: no se documentan sesgos específicos en la información proporcionada, pero al estar afinado solo en danés puede tener peor comportamiento con acentos regionales o habla con code-switching.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución al modelo base y a sus autores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- El autor declara que todo el mérito corresponde a los autores del modelo base; esta exportación no ha sido validada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ulfaslak/edda-v0.2-onnx
- Modelo base: https://huggingface.co/danish-foundation-models/edda-v0.2
- Herramienta de exportación (Optimum): no disponible como enlace en la información proporcionada
- Aplicación Rescribe: no disponible como enlace en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
