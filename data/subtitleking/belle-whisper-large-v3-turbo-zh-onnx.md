# subtitleking/belle-whisper-large-v3-turbo-zh-onnx

## Resumen

`subtitleking/belle-whisper-large-v3-turbo-zh-onnx` es una conversión a ONNX del checkpoint `BELLE-2/Belle-whisper-large-v3-turbo-zh`, un Whisper large-v3-turbo ajustado para reconocimiento de voz en mandarín (caracteres simplificados con puntuación). El modelo original lo desarrolla BELLE-2 (LianjiaTech); este repositorio, publicado por el usuario `subtitleking`, se limita a cambiar el formato de los pesos para permitir inferencia en navegador mediante Transformers.js sobre WebGPU, que es el uso previsto en la herramienta SubtitleKing.

La relevancia de esta ficha es acotada: no aporta un modelo nuevo ni pesos reentrenados, sino un artefacto de despliegue. Su interés práctico está en que empaqueta un encoder en fp16 y un decoder fusionado cuantizado a 4 bits en un único repositorio de 1,6 GB, listo para ejecutarse en cliente sin backend, algo poco habitual para un modelo de la familia Whisper large.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper (atención estándar, sin innovaciones propias), con licencia Apache-2.0 heredada del checkpoint fuente. La información pública disponible no incluye detalles sobre el proceso de fine-tuning, el volumen de datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parámetros totales | no disponible (el repo ocupa 1,6 GB con encoder fp16 y decoder q4) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; el autor no la especifica) |
| Tipos de cuantización | Encoder fp16 con I/O fp32; decoder fusionado 4-bit MatMul (bloque 32, simétrico) con past key values |
| Idiomas soportados | zh (mandarín, caracteres simplificados con puntuación) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged_q4.onnx`) más tokenizer y configuraciones del modelo fuente |

## Arquitectura y entrenamiento

El modelo subyacente es un Whisper large-v3-turbo, es decir, un transformer encoder-decoder para reconocimiento automático de voz con la variante "turbo" de OpenAI, que reduce el número de capas del decoder respecto a large-v3. BELLE-2 lo ajustó para mandarín y este repositorio lo exporta con Optimum ONNX en modo `automatic-speech-recognition-with-past`: encoder en fp16 con entradas y salidas en fp32, y decoder fusionado cuantizado a 4 bits con MatMul de bloque 32 simétrico, conservando las claves y valores del pasado para decodificación autorregresiva incremental.

No se dispone de información sobre el número de tokens de audio utilizados en el fine-tuning, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor indica que la conversión es reproducible con `tools/convert-whisper/` del repositorio de SubtitleKing, pero no documenta métricas de degradación por la cuantización del decoder.

## Capacidades

- Reconocimiento automático de voz en mandarín con salida en caracteres simplificados y puntuación.
- Transcripción de audio a texto con marcas temporales propias del pipeline ASR de Transformers.js.
- Inferencia en navegador sobre WebGPU, sin servidor, gracias a la exportación ONNX y a Transformers.js.
- Decodificación con past key values, lo que permite generación incremental token a token.
- No se documentan capacidades de traducción, diarización, tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Subtitulado en cliente de vídeos en mandarín: la herramienta SubtitleKing usa este artefacto para generar subtítulos sin enviar el audio a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.
- Edición de vídeo en aplicaciones web: integración directa en un editor basado en navegador para transcribir pistas de audio y sincronizar subtítulos con la línea de tiempo.
- Herramientas de accesibilidad: generación de subtítulos en directo para contenido en chino dentro de páginas web, aprovechando WebGPU para mantener la latencia baja en el cliente.
- Procesamiento por lotes de archivos locales: un script Node.js con Transformers.js puede transcribir carpetas de audio sin depender de una API externa.
- Prototipado rápido de pipelines ASR: el par encoder fp16 / decoder q4 permite validar flujos de reconocimiento en chino con un consumo de memoria contenido antes de invertir en despliegues con GPU dedicada.
- Aplicaciones offline o con conectividad limitada: al ejecutarse en el navegador, el modelo puede cachearse y funcionar tras la primera carga, útil en entornos con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de WER/CER, latencia ni comparativas con el checkpoint fuente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio pesa 1,6 GB y el decoder está cuantizado a 4 bits, por lo que el consumo en memoria debería ser del orden de unos pocos GB, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles. El uso previsto es WebGPU en el navegador, no CUDA.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo concretas; el requisito real es un navegador con soporte WebGPU.
- Opciones de despliegue: Transformers.js en navegador (WebGPU) y, potencialmente, cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| subtitleking/belle-whisper-large-v3-turbo-zh-onnx | Whisper large-v3-turbo fine-tuned | zh | ONNX (fp16 + q4) | Apache-2.0 | Artefacto de despliegue en navegador |
| BELLE-2/Belle-whisper-large-v3-turbo-zh | Whisper large-v3-turbo fine-tuned | zh | safetensors (checkpoint fuente) | Apache-2.0 | Modelo original; requiere runtime de PyTorch |
| onnx-community/whisper-large-v3-turbo | Whisper large-v3-turbo | multilingüe | ONNX | Apache-2.0 (según modelo base) | Conversión ONNX del modelo de OpenAI, sin fine-tuning específico para chino |

## Limitaciones y advertencias

- Solo soporta chino mandarín; no se ha validado para otros idiomas ni para variantes dialectales.
- La cuantización 4-bit del decoder puede degradar la precisión de transcripción respecto al checkpoint fp16 original; no se publican métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical.
- Sesgos lingüísticos y de dominio heredados del dataset de fine-tuning de BELLE-2, no documentado en este repositorio.
- Requiere un navegador con WebGPU habilitado; la compatibilidad y el rendimiento varían según plataforma y GPU.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del checkpoint fuente y citar el trabajo de BELLE-2, como pide el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/belle-whisper-large-v3-turbo-zh-onnx
- Modelo base: https://huggingface.co/BELLE-2/Belle-whisper-large-v3-turbo-zh
- Organización BELLE en GitHub: https://github.com/LianjiaTech/BELLE
- Transformers.js: https://github.com/huggingface/transformers.js
- Conversión ONNX de referencia de Whisper large-v3-turbo: https://huggingface.co/onnx-community/whisper-large-v3-turbo
