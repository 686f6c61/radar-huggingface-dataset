# tusharverma5350/meetingai-models

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una redistribucion de un modelo de reconocimiento automatico del habla (ASR) ya existente: **NVIDIA Parakeet TDT 0.6B v2** exportado a ONNX con cuantizacion int8 para el runtime [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx). Lo publica el usuario `tusharverma5350` como parte de la infraestructura de una aplicacion de escritorio llamada MeetingAI, que lo utiliza para transcripcion local de reuniones en ingles.

El modelo base tiene aproximadamente 600 millones de parametros y pertenece a la familia Parakeet de NVIDIA, basada en arquitectura de transductor TDT (Token-and-Duration Transducer). La conversion a int8 ONNX reduce el peso del repositorio a unos 0,7 GB, lo que permite ejecucion en CPU sin GPU dedicada, un requisito habitual en aplicaciones de escritorio orientadas a privacidad.

Es relevante ahora porque ejemplifica el patron de despliegue "on-device" de ASR en produccion: modelo grande de alta calidad, exportado a un formato portable y cuantizado, con verificacion de integridad mediante SHA-256 en un fichero de configuracion. La licencia del original es CC-BY-4.0 y se redistribuye sin modificaciones con atribucion. No se han publicado resultados de benchmarks propios en la informacion disponible, ni hay descargas o valoraciones registradas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer), familia NVIDIA Parakeet; encoder tipo FastConformer segun la documentacion del modelo original |
| Parametros totales | 0,6 mil millones (600 M), segun el nombre del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de ASR; la model card no especifica ventana de audio ni estrategia de chunking) |
| Tipos de cuantizacion | int8 (unica variante incluida en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8), preparado para sherpa-onnx |
| Tarea | Reconocimiento automatico del habla / transcripcion |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 (NVIDIA) |
| Conversion | k2-fsa / sherpa-onnx (release asr-models) |
| Tamano del repositorio | 0,7 GB |
| Contenido adicional | `meetingai-config.json` con motor de transcripcion, URL de servidor, ficheros de modelo y hashes SHA-256 |
| Autor de la redistribucion | tusharverma5350 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original de NVIDIA, no a un entrenamiento realizado por el autor del repositorio. Los transductores TDT combinan un encoder acustico con un decoder de transductor que predice de forma conjunta el token y su duracion, lo que permite emitir varios fotogramas por paso de decodificacion y reduce el coste de inferencia frente a un CTC o un transductor clasico. El encoder de la familia Parakeet sigue el diseno FastConformer, una variante de Conformer con atencion submuestreada de 8x, orientada a audio de 16 kHz. Cualquier detalle adicional sobre capas, cabezas de atencion o dimensiones ocultas no esta disponible en la informacion proporcionada.

Tampoco se dispone de datos sobre el corpus de entrenamiento del modelo original (numero de horas, composicion, presencia de RLHF o fine-tuning), ni sobre si la conversion a ONNX int8 se valido con un conjunto de evaluacion. Lo unico verificable en esta ficha es el proceso de exportacion y empaquetado: conversion a ONNX, cuantizacion a int8 y redistribucion sin modificaciones con atribucion a NVIDIA y al proyecto k2-fsa. El repositorio incluye ademas un fichero de configuracion que la aplicacion MeetingAI lee al arrancar para localizar los ficheros de modelo y comprobar sus hashes SHA-256, un mecanismo de integridad relevante en despliegues de escritorio.

## Capacidades

- Transcripcion de voz a texto en ingles, en modo offline y sobre dispositivo (on-device).
- Reconocimiento de habla continua con un modelo de 600 M de parametros, muy por encima de las variantes tiny/base de otras familias ASR.
- Ejecucion sin conexion a internet ni envio de audio a servicios externos, al integrarse mediante sherpa-onnx.
- Integracion con el runtime sherpa-onnx, que expone APIs en C/C++, Python, Java, C#, Kotlin y Swift, y por tanto encaja en aplicaciones de escritorio multiplataforma.
- Verificacion de integridad de los ficheros de modelo mediante SHA-256 declarados en `meetingai-config.json`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo "thinking": son capacidades ajenas a un modelo ASR.
- No se documenta multilingueidad: el modelo base esta etiquetado unicamente como ingles.
- No se documenta deteccion de hablantes (diarizacion), marcas de tiempo a nivel de palabra, puntuacion automatica ni normalizacion de texto.

## Casos de uso

- Transcripcion de reuniones en la aplicacion de escritorio MeetingAI: es el uso explicito para el que se publica el repositorio; el modelo se carga localmente al arrancar la app y procesa el audio sin enviarlo a un servidor externo.
- Escenarios con requisitos de privacidad o cumplimiento estricto (sanidad, legal, banca): al ejecutarse en la maquina del usuario, el audio no abandona el puesto de trabajo, lo que simplifica el analisis de impacto relativo a proteccion de datos frente a APIs en la nube.
- Subtitulado y notas de voz en herramientas internas: la cuantizacion int8 y los 0,7 GB de peso permiten distribuir el modelo dentro de un instalador de escritorio sin dependencias de GPU.
- Pre-procesado de audio para pipelines de analisis de texto: la transcripcion se puede encadenar con resumen, extraccion de acciones o indexado de reuniones, siempre que el idioma de entrada sea ingles.
- Dictado y accesibilidad: transcripcion local para usuarios que necesitan escribir por voz en aplicaciones de escritorio, con latencia dependiente solo del hardware local.
- Despliegue en entornos con GPU limitada o inexistente: al ser int8 ONNX, puede ejecutarse en CPU, lo que lo hace apto para portatiles de oficina y equipos sin tarjeta grafica dedicada.
- Prototipado y evaluacion de ASR: util como punto de partida para comparar calidad de transcripcion frente a alternativas multilingues, asumiendo que el alcance se limita al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los metadatos de HuggingFace incluyen WER, latencia, throughput ni comparaciones con otros modelos. Para valorar la calidad del modelo base conviene consultar la model card original de `nvidia/parakeet-tdt-0.6b-v2` y tablas de evaluacion independientes de ASR; esta ficha no reproduce cifras porque no forman parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo int8 de 600 M de parametros ocupa aproximadamente 0,6-0,7 GB de pesos, a lo que hay que sumar el estado de decodificacion y los buffers de audio.
- GPU compatibles: cualquier GPU con soporte de ONNX Runtime, incluidas tarjetas de gama media y baja. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion disponible.
- Viabilidad en GPU de consumo: si, es previsible que quepa en practicamente cualquier GPU de consumo de los ultimos anos por su tamano reducido, y tambien en ejecucion exclusiva por CPU.
- Opciones de despliegue: sherpa-onnx (runtime previsto por el autor de la conversion) y ONNX Runtime de forma directa. vLLM, TensorRT-LLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo, ya que estan orientados a modelos de lenguaje y no a reconocimiento de voz.
- Latencia y throughput: no disponibles. Dependeran del hardware, del modo de ejecucion (CPU o GPU), del numero de hilos y de la longitud de los segmentos de audio.
- Almacenamiento: 0,7 GB de repositorio, mas el espacio adicional de la aplicacion que lo integra.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v2 int8 (este repositorio) | 0,6 mil millones | Ingles | CC-BY-4.0 | ONNX int8 para sherpa-onnx | Redistribucion de terceros, sin benchmarks publicados en el repositorio |
| NVIDIA Parakeet TDT 0.6B v2 (original) | 0,6 mil millones | Ingles | CC-BY-4.0 | Pesos originales de NVIDIA | Fuente del modelo redistribuido; consultar su model card para metricas |
| Whisper large-v3 (OpenAI) | 1,55 mil millones | Multilingue (decenas de idiomas) | MIT | safetensors, entre otros | Alternativa multilingue ampliamente desplegada; mayor tamano |
| Whisper small (OpenAI) | 244 millones | Multilingue | MIT | safetensors, entre otros | Alternativa mas ligera, habitualmente menor calidad de transcripcion |

Los datos de parametros, idiomas y licencias de las alternativas corresponden a informacion publica ampliamente conocida de esas familias y no se han verificado contra sus model cards en el contexto de esta ficha; tratalos como orientativos. No hay datos de rendimiento comparado disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma unico: solo ingles. El modelo base no esta etiquetado como multilingue, por lo que su uso con audio en castellano u otros idiomas no esta soportado.
- Ausencia de benchmarks: el repositorio no publica WER ni evaluaciones de calidad, y la cuantizacion int8 puede degradar ligeramente la precision respecto a los pesos originales en punto flotante. No hay datos que cuantifiquen esa posible degradacion.
- Riesgo de alucinacion y de repeticiones: es un comportamiento documentado de forma general en modelos ASR ante audio ruidoso, silencios largos o dominios muy alejados del entrenamiento. No hay informacion especifica para este modelo.
- Redistribucion de terceros: el autor del repositorio no es NVIDIA ni el proyecto k2-fsa; conviene validar los hashes SHA-256 y contrastar los ficheros con la fuente original antes de usarlos en produccion.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Al tratarse de una redistribucion sin modificaciones, esa obligacion recae tambien sobre quien lo integre en un producto.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que significa que no existe validacion comunitaria del contenido del repositorio.
- Metadatos a revisar: las fechas de creacion y actualizacion que muestra HuggingFace (2026-10-07) no coinciden con el ciclo de vida conocido del modelo base; conviene verificarlas antes de citar este repositorio.
- Sin garantias de soporte: no se documentan tareas auxiliares como diarizacion, puntuacion, marcas de tiempo o deteccion de idioma, que en muchos productos de transcripcion se resuelven con componentes adicionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tusharverma5350/meetingai-models
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Release de modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
