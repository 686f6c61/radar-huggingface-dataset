# wangxp9527/alisonscribe-whisper

## Resumen

AlisonScribe Whisper es un espejo (mirror) de los pesos de OpenAI Whisper large-v3-turbo convertidos a Core ML por Argmax para su uso con WhisperKit. No se trata de un modelo entrenado ni ajustado por el autor: el repositorio contiene copias byte a byte de los ficheros `openai_whisper-large-v3-v20240930_626MB` publicados en `argmaxinc/whisperkit-coreml`, junto con los ficheros de tokenizador de `openai/whisper-large-v3-turbo`. Su funcion es servir como origen de descarga fijo y redundante para la aplicacion AlisonScribe, que realiza transcripcion y deteccion automatica de idioma en local.

El modelo subyacente es Whisper large-v3-turbo, un modelo de reconocimiento automatico del habla (ASR) de tipo encoder-decoder transformer, con aproximadamente 809 millones de parametros en su variante turbo (frente a los 1550 millones de large-v3). La conversion a Core ML permite ejecucion on-device en hardware Apple (macOS e iOS) mediante WhisperKit, sin necesidad de enviar audio a servidores externos.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion: no aporta mejoras, ajustes ni cuantizaciones propias, y su interes practico reside en la disponibilidad de un artefacto Core ML listo para integrar en aplicaciones Swift que necesiten ASR multilingue en el dispositivo con una licencia permisiva (MIT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (el modelo base large-v3-turbo tiene aproximadamente 809 M; el repositorio no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (el autor indica que no se ha recuantizado; se distribuye la conversion Core ML de 626 MB de Argmax) |
| Idiomas soportados | no disponible en el repositorio (heredados de Whisper large-v3-turbo, que cubre transcripcion multilingue y deteccion de idioma) |
| Licencia | MIT (pesos © 2022 OpenAI; conversion Core ML © 2024 Argmax, Inc.) |
| Formato de pesos | Core ML (paquete para WhisperKit), mas `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, disenado para mapear espectrogramas Mel de audio a tokens de texto. La variante turbo reduce el numero de capas del decoder respecto a large-v3, lo que disminuye el coste de inferencia a cambio de una perdida moderada de precision. El repositorio no documenta el entrenamiento original; este se realizo en OpenAI y se describe en la model card de `openai/whisper-large-v3-turbo`.

El autor de este repositorio no ha reentrenado, ajustado ni recuantizado nada: los ficheros son copias verificadas por SHA-256 de la conversion Core ML de Argmax (revision `0f63a7800b00dd0226abd051b906c246e1907482`) y del tokenizador de OpenAI (revision `41f01f3fe87f28c78e2fbf8b568835947dd65ed9`). La innovacion tecnica, por tanto, es la conversion a Core ML y su empaquetado para WhisperKit, que habilita inferencia local en el Neural Engine y la GPU de Apple.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en local.
- Deteccion automatica de idioma, segun declara el autor como uso principal en la app.
- Transcripcion de idiomas no cubiertos por el reconocimiento integrado del sistema operativo.
- Ejecucion completamente on-device mediante WhisperKit; no se sube audio a ningun servidor.
- Integracion en aplicaciones Swift para macOS e iOS a traves de WhisperKit.
- Soporte multilingue heredado de Whisper large-v3-turbo (el repositorio no detalla la lista de idiomas).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones en local: la app puede procesar audio en ventanas de 30 segundos con el modelo Core ML, manteniendo el audio en el dispositivo y evitando requisitos de cumplimiento asociados al envio a la nube.
- Subtitulado de video en macOS: integracion en herramientas de edicion que necesiten generar subtitulos sin conexion, aprovechando el Neural Engine para reducir latencia.
- Deteccion de idioma previa a la transcripcion: util para aplicaciones que reciben audio de usuarios en idiomas variados y deben seleccionar el modelo o la configuracion adecuada antes de transcribir.
- Accesibilidad en iOS: dictado y transcripcion para usuarios con dificultades motoras o auditivas, con la ventaja de que el procesamiento no requiere red.
- Notas de voz en aplicaciones de productividad: conversion de grabaciones a texto en el dispositivo, con un artefacto de 601 MB que puede descargarse bajo demanda.
- Investigacion sobre ASR on-device: punto de partida reproducible (revision fija) para comparar latencia y calidad de Whisper large-v3-turbo en Core ML frente a otras implementaciones (whisper.cpp, MLX).
- Distribucion redundante en entornos con acceso restringido: el espejo permite descargar desde Hugging Face o ModelScope, util en regiones donde uno de los dos no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en hardware Apple mediante Core ML (Neural Engine y GPU integrada). El autor no publica requisitos de memoria unificada.
- GPU recomendadas: hardware Apple con soporte Core ML (chips de la serie M y A); el repositorio no especifica modelos concretos ni minimos.
- Cabe en GPU consumer: si, en equipos Apple Silicon; no se documenta soporte para GPU NVIDIA o AMD a traves de este repositorio.
- Opciones de despliegue: WhisperKit (libreria `whisperkit` declarada); el autor no menciona vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato Core ML.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlisonScribe Whisper (este repositorio) | no declarado (base large-v3-turbo, ~809 M) | ventanas de 30 s de audio | Core ML (WhisperKit) | MIT | Hugging Face, espejo de Argmax |
| openai/whisper-large-v3-turbo | ~809 M | ventanas de 30 s de audio | safetensors / PyTorch | MIT | Hugging Face (OpenAI) |
| argmaxinc/whisperkit-coreml | no declarado | ventanas de 30 s de audio | Core ML (WhisperKit) | MIT (segun el autor) | Hugging Face (Argmax) |

La comparativa se limita a los tres artefactos directamente relacionados, ya que el repositorio no aporta datos de rendimiento que permitan contrastarlo con otros sistemas ASR (por ejemplo, variantes de whisper.cpp o modelos ASR comerciales). No se dispone de cifras de WER ni de latencia para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo original: cualquier limitacion de Whisper large-v3-turbo (sesgos, errores en audio con ruido, acentos poco representados, alucinaciones en segmentos silenciosos) se hereda sin cambios.
- Riesgo de alucinacion: Whisper puede generar texto plausible en tramos de silencio o audio ininteligible; el repositorio no documenta mitigaciones.
- Idiomas: el autor no publica la lista concreta soportada; la cobertura depende de la del modelo base.
- Contexto: procesa ventanas de 30 segundos; audio mas largo requiere troceado y gestion de solapamientos por parte de la aplicacion.
- Licencia: MIT permite uso comercial, pero deben conservarse los avisos de copyright de OpenAI (pesos) y Argmax (conversion Core ML), incluidos en el fichero LICENSE.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- Dependencia de WhisperKit y de hardware Apple: no es portable a otras plataformas sin reconvertir los pesos.
- El tamano del repositorio (0,6 GB) implica descargas considerables para aplicaciones moviles; conviene gestionar la descarga bajo demanda.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wangxp9527/alisonscribe-whisper
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Conversion Core ML de Argmax: https://huggingface.co/argmaxinc/whisperkit-coreml
- WhisperKit (repositorio): https://github.com/argmaxinc/argmax-oss-swift
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
