# struan-assembly/yapp-parakeet-tdt-0.6b-v3

## Resumen
Yapp Parakeet TDT 0.6B v3 es una redistribución en formato ONNX cuantizado a int8 del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B v3. Lo publica el proyecto struan-assembly para alimentar Yapp, una aplicación de dictado push-to-talk para macOS y Windows que descarga los ficheros en el primer arranque y ejecuta la inferencia en local mediante ONNX Runtime. No se trata, por tanto, de un modelo entrenado desde cero, sino de un empaquetado de artefactos listos para producción de escritorio.

El modelo subyacente es un sistema ASR de tipo Conformer con decodificación TDT (Token-and-Duration Transducer) y 0,6 mil millones de parámetros, capaz de transcribir voz en 25 idiomas europeos, entre ellos el castellano. La relevancia de esta ficha radica en que muestra una ruta de despliegue completa y ligera (repo de 0,7 GB, pesos int8, tokenizador SentencePiece de 8.192 tokens) para llevar un ASR multilingüe de calidad a hardware de consumo sin depender de la nube.

La licencia CC BY 4.0 del modelo original y de la exportación permite uso comercial con atribución, lo que convierte a este paquete en una opción práctica para integrar dictado por voz en aplicaciones de escritorio. La información disponible no incluye métricas de precisión ni detalles del entrenamiento original, por lo que las secciones correspondientes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + decoder/joint network con decodificacion TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600M), segun el nombre del modelo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | int8 (encoder y decoder_joint en ONNX int8) |
| Idiomas soportados | en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx, decoder_joint-model.int8.onnx, nemo128.onnx) + vocab.txt |

## Arquitectura y entrenamiento
La arquitectura del modelo base es un Conformer (transformer con convoluciones) que actúa como encoder sobre características log-mel de 128 bins a 16 kHz, generadas por el fichero `nemo128.onnx`. La decodificación emplea un esquema TDT, que predice conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación frente a transductores clásicos y mejora la eficiencia en inferencia. El vocabulario es SentencePiece con 8.192 tokens más el token blank.

Esta publicación no incluye información sobre el corpus de entrenamiento, el número de tokens de audio, la composición del dataset ni si hubo ajuste por RLHF o DPO; esos datos corresponden al modelo original de NVIDIA y no se detallan en la model card disponible. La innovación técnica relevante en este paquete es la exportación a ONNX y la cuantización int8 realizada por Ilya Stupakov, redistribuida sin modificaciones, que permite ejecutar el modelo con ONNX Runtime en CPU de escritorio con un consumo de disco de aproximadamente 0,7 GB.

## Capacidades
- Transcripción de voz a texto (ASR) en 25 idiomas europeos, incluido el castellano.
- Detección y soporte multilingüe según la lista de idiomas declarada (eslavas, germánicas, románicas, bálticas, ugrofinesas y griego).
- Procesamiento de audio a 16 kHz con extracción de características log-mel de 128 bins integrada en el paquete.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Ejecución local sin conexión mediante ONNX Runtime, orientada a aplicaciones de escritorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking; es un modelo exclusivamente ASR.

## Casos de uso
- Dictado push-to-talk en aplicaciones de escritorio: es el caso de uso nativo de Yapp; el modelo se descarga en el primer arranque y transcribe en local con ONNX Runtime, sin enviar audio a servidores externos.
- Subtitulado de reuniones y notas de voz: la ventana de audio y la latencia no están documentadas, pero el tamaño de 0,6B en int8 permite transcripción en CPU de portátiles para ficheros de audio cortos o medios.
- Transcripción de entrevistas y podcasts en varios idiomas: la cobertura de 25 idiomas facilita procesar material multilingüe con un único modelo.
- Accesibilidad: entrada por voz para usuarios con movilidad reducida en herramientas de escritorio macOS y Windows.
- Automatización de actas y documentación interna: integración en pipelines que reciben audio y generan texto para revisión humana.
- Aplicaciones de aprendizaje de idiomas: transcripción de pronunciación en lenguas como francés, alemán, italiano o polaco para ejercicios de práctica.
- Procesamiento por lotes en servidores sin GPU: al ser ONNX int8, puede desplegarse en contenedores CPU para transcripción masiva de bajo coste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, tasas de error por idioma, latencia ni throughput.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; al ser ONNX int8 y ejecutarse con ONNX Runtime, puede funcionar en CPU sin GPU dedicada.
- Tamaño en disco: aproximadamente 0,7 GB para el repositorio completo (encoder int8, decoder_joint int8, extractor nemo128 y vocabulario).
- GPU recomendadas: no especificadas; cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podría acelerar la inferencia, pero no hay datos publicados.
- GPU de consumo: el modelo debería caber en GPUs de consumo por su tamaño, aunque no se documenta el consumo exacto de memoria.
- Opciones de despliegue: ONNX Runtime (ruta oficial de Yapp). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Yapp Parakeet TDT 0.6B v3 (esta ficha) | 0,6B | no disponible | 25 | CC BY 4.0 | ONNX int8 |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | no disponible | 25 | CC BY 4.0 | NeMo (pesos originales) |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6B | no disponible | 25 | CC BY 4.0 | ONNX (exportacion de referencia) |
| Whisper large-v3 (referencia de categoria) | 1,55B | 30 s por ventana | ~99 | MIT | safetensors, GGUF, etc. |

La comparativa con Whisper se incluye como referencia de categoría; los datos de Whisper no proceden de la información proporcionada y deben verificarse en su model card oficial. No se dispone de métricas comparativas de precisión entre estos modelos en la información disponible.

## Limitaciones y advertencias
- Es una redistribución de artefactos, no un modelo nuevo: cualquier limitación del Parakeet original aplica íntegramente.
- No se documentan sesgos por idioma, acento o variedad dialectal; el rendimiento en castellano de España frente a otras variedades no está medido.
- Riesgo de alucinación y errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario técnico no cubierto por el vocabulario SentencePiece de 8.192 tokens.
- La licencia CC BY 4.0 exige atribución a NVIDIA y a Ilya Stupakov (exportación ONNX) en usos derivados y comerciales.
- El paquete está pensado para ONNX Runtime; no se garantiza compatibilidad con otros runtimes sin conversión adicional.
- No hay información publicada sobre latencia, uso de memoria ni calidad en producción, por lo que conviene validar con un conjunto propio antes de desplegar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/struan-assembly/yapp-parakeet-tdt-0.6b-v3
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de Ilya Stupakov: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
