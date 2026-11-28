# wasi-master/addis-scribe-tigrinya-streaming-sherpa-onnx

## Resumen

`addis-scribe-tigrinya-streaming-sherpa-onnx` es una exportación al formato sherpa-onnx del modelo de reconocimiento automático del habla (ASR) `addisai/addis-scribe-tigrinya-streaming`, desarrollado por Addis AI. El artefacto lo publica el usuario `wasi-master` y su función es empaquetar el modelo original en ONNX cuantizado a int8 para su uso en inferencia en streaming mediante la librería sherpa-onnx, sin necesidad de framework de deep learning completo en tiempo de ejecución.

La exportación se realizó con el exportador "Nemotron 3.5" de sherpa-onnx, con un tamaño de chunk de 320 ms y cuantización int8, y está pensada para integrarse en WM Keyboard, un teclado con reconocimiento de voz offline. El modelo base está especializado en tigriña, una lengua etíope, y el prompt propio del modelo (índice 49) queda fijado como `auto_prompt_id` del encoder, de modo que no es necesario seleccionar idioma en cada stream.

Este artefacto es relevante porque permite ejecutar ASR en streaming de una lengua de bajos recursos de forma local y ligera, pero conviene tener en cuenta que la información pública disponible es muy escasa: no hay datos de arquitectura, parámetros, benchmarks ni composición del corpus de entrenamiento en la model card. El repositorio ocupa 0,7 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ASR en streaming; exportado con el exportador Nemotron 3.5 de sherpa-onnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks de 320 ms) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | tigriña (según especialización del modelo base; no se listan otros idiomas) |
| Licencia | openmdw-1.1 (etiquetada como `other` en los tags) |
| Formato de pesos | ONNX (formato sherpa-onnx) |
| Tamano del repositorio | 0,7 GB |
| Modelo base | addisai/addis-scribe-tigrinya-streaming (commit da29ac74411a68ee5fb0ccc9350bf176252c3b08) |
| Pipeline | automatic-speech-recognition |
| Libreria | sherpa-onnx |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `addisai/addis-scribe-tigrinya-streaming`: la model card no detalla si se trata de un transformer encoder-decoder, un modelo conformer, un transducer o una arquitectura híbrida. Lo único documentado es el proceso de exportación: se aplicó el exportador Nemotron 3.5 de sherpa-onnx sobre el checkpoint `da29ac74411a68ee5fb0ccc9350bf176252c3b08`, con chunk de 320 ms y cuantización int8, para producir pesos ONNX aptos para inferencia en streaming.

Tampoco se especifican los datos de entrenamiento (número de horas de audio, composición del corpus, uso de aumentación de datos, técnicas de alineación o fine-tuning). La model card atribuye todo el entrenamiento a Addis AI y no menciona procesos de RLHF, DPO ni otras etapas de ajuste. La innovación destacable del artefacto es de empaquetado, no de modelado: la fijación del prompt interno (índice 49) como `auto_prompt_id` del encoder simplifica el despliegue, ya que elimina la necesidad de configurar el idioma en cada sesión de reconocimiento.

## Capacidades

- Reconocimiento automático del habla en tigriña, orientado a dictado y transcripción.
- Inferencia en streaming con chunks de 320 ms, adecuada para reconocimiento en tiempo real.
- Ejecución offline mediante sherpa-onnx, sin dependencia de servicios en la nube.
- Cuantización int8 que reduce el peso y el coste computacional de la inferencia.
- Prompt de idioma preconfigurado (`auto_prompt_id`), sin selección manual de lengua por stream.
- Integración prevista en WM Keyboard (teclado con dictado offline).
- No consta soporte de tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento explícito.

## Casos de uso

- Dictado por voz en tigriña en teclados móviles: el modelo se integra en WM Keyboard para transcribir la voz del usuario en local, aprovechando el streaming de 320 ms para mostrar texto parcial mientras se habla.
- Transcripción offline en entornos sin conectividad: al ejecutarse con sherpa-onnx sobre ONNX int8, puede desplegarse en dispositivos sin acceso a red, útil en zonas con cobertura limitada.
- Subtitulado en directo de contenido en tigriña: el procesamiento por chunks permite generar subtítulos con latencia baja en emisiones o reuniones.
- Documentación de reuniones y entrevistas: grabaciones en tigriña pueden transcribirse en local para su posterior revisión, sin enviar audio a terceros.
- Aplicaciones de accesibilidad: entrada de texto por voz para personas con movilidad reducida en comunidades tigriñoparlantes.
- Investigación lingüística y creación de corpus: permite generar transcripciones preliminares de audio en tigriña que después se revisan y anotan manualmente.
- Sistemas de atención telefónica o presencial en tigriña: transcripción previa de la interacción para enrutado o registro, siempre con revisión humana dada la falta de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,7 GB y los pesos están en int8, por lo que la huella en memoria es del orden de cientos de megabytes, aunque no se detalla el reparto entre encoder y decoder.
- GPU recomendadas: no disponibles; al ser un modelo ONNX int8 para sherpa-onnx, está pensado para ejecución en CPU y en dispositivos de borde más que para GPU de datacenter.
- GPU de consumo: no se especifica compatibilidad ni rendimiento en RTX 4090 u otras; la ejecución con sherpa-onnx no requiere GPU.
- Opciones de despliegue: sherpa-onnx (librería nativa del artefacto) y, en general, runtimes de ONNX; no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo ASR de este formato.
- Latencia y throughput: no disponibles; el único dato objetivo es el tamaño de chunk de 320 ms, que condiciona la granularidad de la salida en streaming.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de ASR en tigriña ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Información pública muy limitada: no hay datos de arquitectura, parámetros, corpus de entrenamiento ni evaluación, lo que dificulta estimar su calidad real.
- Riesgo de alucinación y errores de transcripción: sin benchmarks publicados no puede acotarse la tasa de error (WER) en condiciones de ruido, acentos o vocabulario técnico.
- Cobertura lingüística restringida a tigriña; no se documenta soporte de code-switching con amárico, inglés u otras lenguas.
- Licencia openmdw-1.1: antes de un uso comercial es necesario revisar los términos en el enlace oficial, ya que el tag de Hugging Face figura como `other`.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Dependencia del ecosistema sherpa-onnx: la integración en otros frameworks requeriría convertir o reexportar los pesos.
- El artefacto es una exportación de terceros; la responsabilidad sobre el modelo original recae en Addis AI, y cualquier actualización del modelo base no se refleja automáticamente aquí.
- No consta que el modelo incluya detección de voz, diarización de hablantes ni puntuación automática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasi-master/addis-scribe-tigrinya-streaming-sherpa-onnx
- Modelo base: https://huggingface.co/addisai/addis-scribe-tigrinya-streaming
- Commit del modelo base: https://huggingface.co/addisai/addis-scribe-tigrinya-streaming/tree/da29ac74411a68ee5fb0ccc9350bf176252c3b08
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- sherpa-onnx (repositorio del proyecto): no disponible en la información proporcionada
