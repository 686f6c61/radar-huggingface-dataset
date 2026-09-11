# visheshd/parakeet-nemotron-int8

## Resumen

parakeet-nemotron-int8 es una cuantizacion dinamica a int8 (QInt8) en formato ONNX Runtime del modelo de reconocimiento automatico del habla (ASR) en streaming Parakeet / Nemotron de NVIDIA, con aproximadamente 0,6 mil millones de parametros. Lo publica el usuario visheshd en Hugging Face y su objetivo declarado es la dictado en dispositivo ("on-device dictation"), es decir, transcripcion de voz local sin depender de servicios en la nube.

El repositorio no contiene pesos originales, sino una conversion cuantizada de un export ONNX previo: el autor parte del subdirectorio `nemotron-speech-streaming-en-0.6b` del repositorio `altunenes/parakeet-rs` (revision `63b515f9fe053a47f8e5530d06ffdf7ae3afa049`) y aplica `onnxruntime.quantization.quantize_dynamic` con `weight_type=QuantType.QInt8` usando onnxruntime 1.30.0 sobre el encoder y el decoder joint. Las convoluciones se mantienen en coma flotante y solo las MatMul se convierten a int8 dinamico, una decision habitual para no degradar la precision de las capas convolucionales del encoder.

Su relevancia es practica mas que cientifica: ofrece un artefacto autocontenido (el `encoder.onnx` no depende de un fichero `.data` externo), de unos 0,7 GB de tamano de repositorio, pensado para ejecutarse con ONNX Runtime en CPU o en GPUs modestas. Es un modelo unicamente en ingles, orientado a streaming, con licencia heredada de NVIDIA (`license: other`, `license_name: nvidia-parakeet-upstream`), lo que condiciona su uso comercial. No tiene descargas ni likes registrados y no incluye model card detallada mas alla de la informacion de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card. Los artefactos (`encoder.onnx` y `decoder_joint.onnx`) corresponden a un ASR en streaming con estructura encoder-decoder de tipo transductor (familia RNN-T/TDT) |
| Parametros totales | ~0,6 mil millones (0,6B), segun el identificador del modelo upstream `nemotron-speech-streaming-en-0.6b` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de ASR que procesa ventanas de audio en streaming |
| Tipos de cuantizacion | int8 dinamico (QInt8) en las MatMul; convoluciones mantenidas en float |
| Idiomas soportados | ingles (el identificador upstream incluye el sufijo `en`); no se detallan mas idiomas |
| Licencia | other — `nvidia-parakeet-upstream` (hereda los terminos de NVIDIA del modelo upstream) |
| Formato de pesos | ONNX (`encoder.onnx` y `decoder_joint.onnx` en int8) + `tokenizer.model` (SentencePiece) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento del modelo original. Lo unico verificable es la estructura de los artefactos publicados: un `encoder.onnx` cuantizado a int8 y autocontenido (sin blob `.data` externo), un `decoder_joint.onnx` tambien en int8 y un `tokenizer.model` copiado sin cambios. La presencia de un "decoder joint" es caracteristica de los modelos de ASR con decodificacion conjunta tipo transductor (RNN-T/TDT), donde un predictor y un joiner combinan las representaciones acusticas del encoder con el historial de tokens para emitir texto de forma incremental, lo que habilita la transcripcion en streaming con latencia baja.

En cuanto al entrenamiento, no hay informacion en la model card sobre numero de tokens de audio, composicion del dataset, ni si hubo etapas de ajuste con RLHF, DPO o similares; esos detalles corresponden al modelo NVIDIA original y no se reproducen aqui. La innovacion tecnica de este repositorio es exclusivamente la cuantizacion: se aplica cuantizacion dinamica QInt8 con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.30.0), dejando las convoluciones en coma flotante y cuantizando unicamente las multiplicaciones matriciales. El autor indica explicitamente que el artefacto no deriva de ninguna cuantizacion int8 de terceros, sino directamente de los pesos exportados a ONNX.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles sobre audio en streaming, con salida de texto incremental.
- Transcripcion de dictado en dispositivo, que es el caso de uso declarado por el autor.
- Ejecucion autocontenida en ONNX Runtime sin dependencia de blobs de pesos externos en el encoder.
- Tokenizacion basada en SentencePiece mediante el fichero `tokenizer.model` incluido.
- No se documentan capacidades de traduccion, identificacion de hablante, diarizacion, puntuacion automatica ni marcas de tiempo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-textual, no un modelo de lenguaje conversacional.
- No se documentan capacidades multimodales (vision, audio generativo) ni modo de razonamiento explicito.

## Casos de uso

- Dictado en dispositivo: integracion en aplicaciones de escritorio o moviles que necesitan transcribir voz a texto sin enviar audio a un servidor, aprovechando que el encoder int8 es autocontenido y el repositorio ocupa unos 0,7 GB.
- Subtitulado en directo: al ser un modelo de streaming, puede alimentar un pipeline que consuma audio por fragmentos y emita texto de forma incremental para subtitulos con latencia reducida.
- Asistentes de voz locales: reconocimiento de comandos y frases en ingles dentro de un asistente que corre en el propio dispositivo, evitando costes de API y problemas de privacidad.
- Transcripcion de reuniones con requisitos de privacidad: procesamiento del audio en infraestructura propia (CPU o GPU local) cuando la normativa impide enviar conversaciones a servicios externos.
- Despliegue en edge sin GPU: al estar cuantizado a int8 y exportado a ONNX Runtime, es candidato para mini-PC, portatiles y dispositivos embebidos con CPU x86 o ARM que ejecuten ONNX Runtime.
- Integracion en pipelines de accesibilidad: conversion de voz a texto en tiempo real para personas con dificultades auditivas, con la ventaja de operar sin conexion.
- Preprocesado de audio en analitica: transcripcion masiva de grabaciones en ingles antes de pasarlas a un sistema de busqueda, resumen o clasificacion, usando este modelo como etapa de ASR.
- Prototipado rapido de funciones de voz: al ser un artefacto ONNX listo para cargar, permite validar productos de dictado en pocas lineas de codigo antes de decidir si merece la pena desplegar el modelo NVIDIA original en precision completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER, latencia, factor de tiempo real ni comparaciones con otros modelos, y los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio completo pesa unos 0,7 GB. Con pesos int8 en las MatMul, es razonable esperar un consumo de memoria en el rango de 1 a 2 GB durante la inferencia, aunque se trata de una estimacion no confirmada por el autor.
- GPU recomendadas: no especificadas. ONNX Runtime permite ejecutar el modelo con CUDA Execution Provider o TensorRT en GPUs NVIDIA (por ejemplo, T4, L4, A10, RTX 3060 o superiores), pero no hay datos publicados de rendimiento en ninguna de ellas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de memoria, dado el tamano del modelo. Tampoco se descarta su ejecucion integra en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML o Web) es la via natural, ya que los pesos estan en formato ONNX. El modelo upstream del que deriva se distribuye tambien en otros formatos dentro del ecosistema `parakeet-rs`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No hay mediciones de factor de tiempo real ni de velocidad de transcripcion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Streaming nativo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-nemotron-int8 (este modelo) | ~0,6B | ventanas de audio | si | other (nvidia-parakeet-upstream) | ONNX int8 | Hugging Face, 0 descargas |
| NVIDIA Parakeet / Nemotron streaming 0.6B (upstream) | ~0,6B | ventanas de audio | si | terminos NVIDIA | ONNX, pesos originales | Hugging Face |
| OpenAI Whisper large-v3 | 1,55B | 30 s de audio por ventana | no (ventanas fijas) | MIT | safetensors, GGUF, ONNX | Hugging Face |
| Distil-Whisper large-v3 | ~0,76B | 30 s de audio por ventana | no | MIT | safetensors | Hugging Face |

Nota: los datos de los modelos comparativos corresponden a informacion publica ampliamente conocida y no proceden de la busqueda web adjunta; los campos de rendimiento se omiten por no disponer de cifras verificadas en la informacion proporcionada. No se dispone de comparativas de WER entre este artefacto int8 y los modelos alternativos.

## Limitaciones y advertencias

- Idiomas: el modelo esta orientado unicamente al ingles, segun el identificador del modelo upstream. No se documenta soporte multilingue.
- Cuantizacion: al ser una cuantizacion dinamica int8, cabe esperar una degradacion de la precision (WER) respecto al modelo en coma flotante, aunque el autor no publica mediciones que la cuantifiquen. Las convoluciones se mantienen en float, lo que limita parte de esa perdida pero no la elimina.
- Licencia: se heredan los terminos de NVIDIA (`license: other`, `license_name: nvidia-parakeet-upstream`). No se reproduce el texto de la licencia en el repositorio, por lo que es imprescindible consultar los terminos del modelo upstream antes de cualquier uso comercial o redistribucion.
- Trazabilidad: el artefacto es una conversion de terceros, no una publicacion oficial de NVIDIA ni de altunenes. No hay validacion independiente de que la cuantizacion preserve el comportamiento del modelo original.
- Alucinacion y errores de transcripcion: como cualquier modelo de ASR, puede producir texto plausible pero incorrecto en audio con ruido, acentos no nativos, solapamiento de voces o vocabulario tecnico fuera de dominio.
- Idiomas y dominio: no se especifican condiciones de grabacion, calidad de microfono ni dominios de entrenamiento, por lo que el rendimiento fuera de audio limpio en ingles es incierto.
- Madurez: el repositorio no tiene descargas ni likes, no incluye ejemplos de uso, scripts de evaluacion ni pruebas de integracion, lo que aumenta el coste de adopcion en produccion.
- Compatibilidad: depende de ONNX Runtime y de que el consumidor soporte el grafo cuantizado; otros runtimes pueden requerir conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/visheshd/parakeet-nemotron-int8
- Repositorio de origen de los pesos exportados: `altunenes/parakeet-rs`, revision `63b515f9fe053a47f8e5530d06ffdf7ae3afa049`, subdirectorio `nemotron-speech-streaming-en-0.6b`
- Documentacion de cuantizacion de ONNX Runtime (`onnxruntime.quantization.quantize_dynamic`): https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Los resultados de busqueda web proporcionados no contienen enlaces relacionados con este modelo (corresponden a articulos sobre instalaciones fotovoltaicas de suelo), por lo que no se incluyen.
