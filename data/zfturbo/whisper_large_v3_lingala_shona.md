# ZFTurbo/whisper_large_v3_lingala_shona

## Resumen

ZFTurbo/whisper_large_v3_lingala_shona es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) openai/whisper-large-v3, publicado por el usuario ZFTurbo en HuggingFace. El modelo parte de los pesos de Whisper large-v3 y se ha entrenado sobre el dataset google/WaxalNLP, una coleccion de corpus de voz en lenguas africanas, con el objetivo declarado en su nombre de mejorar el reconocimiento de lingala y shona, dos lenguas de bajos recursos con representacion limitada en los corpus generalistas de ASR.

El modelo conserva la arquitectura completa de Whisper large-v3, un transformer encoder-decoder de aproximadamente 1.543 millones de parametros, por lo que hereda el pipeline de inferencia, los formatos de entrada (audio a 16 kHz, ventanas de 30 segundos) y las herramientas del ecosistema Whisper. Su licencia MIT y su compatibilidad con librerias como transformers, faster-whisper o whisper.cpp lo hacen directamente desplegable en infraestructura existente sin cambios de arquitectura.

Su relevancia es doble: por un lado, amplia la cobertura de Whisper hacia lenguas africanas poco representadas; por otro, sirve como punto de partida reproducible para quien necesite ASR en lingala o shona sin entrenar desde cero. El repositorio no incluye todavia una model card descriptiva (solo la cabecera YAML con licencia, dataset y modelo base), ni resultados de evaluacion publicados, ni cifras de descargas o interacciones, por lo que su validacion practica queda en manos de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) heredada de openai/whisper-large-v3 |
| Parametros totales | 1.543.490.560 (~1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la arquitectura whisper-large-v3 procesa audio en ventanas de 30 s |
| Tipos de cuantizacion | No disponible (repositorio en safetensors sin conversiones publicadas) |
| Idiomas soportados | Segun el nombre del modelo, lingala y shona; la model card no detalla la lista de idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-large-v3, que a su vez es un transformer encoder-decoder de tipo seq2seq disenado para tareas de speech-to-text, traduccion de voz y deteccion de idioma. La entrada se procesa como espectrograma mel logaritmico y la salida se genera de forma autorregresiva con decodificacion por tokens de texto. El modelo base soporta decodificacion con timestamps a nivel de palabra y de segmento, ademas de multiples tareas definidas por tokens especiales de inicio.

El entrenamiento se ha realizado sobre google/WaxalNLP, un corpus de voz en lenguas africanas. La model card publicada no especifica el numero de tokens de audio, la composicion exacta del subconjunto empleado, la duracion del entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o aumentacion de datos. Tampoco se documenta si hubo etapas de RLHF o DPO, algo poco habitual en modelos ASR y no mencionado en este caso. No se describen innovaciones tecnicas propias mas alla del ajuste de los pesos sobre el corpus indicado.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio a 16 kHz en ventanas de hasta 30 segundos, con la arquitectura y el tokenizador de Whisper large-v3.
- Transcripcion potencialmente mejorada en lingala y shona respecto al modelo base, segun el objetivo declarado en el nombre del repositorio.
- Transcripcion con marcas temporales a nivel de segmento y de palabra, funcionalidad heredada de la familia Whisper.
- Deteccion de idioma y tarea mediante los tokens especiales de Whisper (<|lang|>, <|transcribe|>, <|translate|>), siempre que los pesos no hayan perdido esa capacidad durante el fine-tuning.
- Traduccion de voz a texto hacia ingles, capacidad propia de Whisper large-v3; no se confirma que se conserve intacta tras el ajuste.
- No hay evidencia publicada de soporte de tool calling, function calling, uso agentico, razonamiento multi-paso, vision ni audio mas alla del ASR estandar.
- Capacidades multilingues: no documentadas de forma explicita para este ajuste; se limitan, segun el propio identificador del modelo, a lingala y shona.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lingala o shona: el modelo convierte grabaciones de audio en texto con marcas temporales, lo que permite indexar y buscar contenido oral en lenguas sin tradicion escrita masiva en herramientas comerciales.
- Subtitulado de contenido audiovisual africano: integrado en un pipeline de ffmpeg mas transformers o faster-whisper, genera subtitulos segmentados con timestamps para plataformas de video o television publica.
- Archivado y digitalizacion de patrimonio oral: bibliotecas y universidades pueden transcribir colecciones de historia oral en lingala y shona, aplicando el modelo por lotes sobre ficheros largos divididos en fragmentos de 30 segundos.
- Sistemas de atencion ciudadana en servicios publicos: en regiones donde se habla lingala o shona, permite transcribir llamadas o mensajes de voz antes de su clasificacion y derivacion a un agente humano.
- Investigacion linguistica de bajos recursos: generacion de transcripciones preliminares sobre corpus propios para despues corregirlas manualmente, reduciendo el coste de anotacion frente a transcribir desde cero.
- Preprocesado para traduccion automatica: la salida de texto del modelo alimenta un sistema de traduccion (por ejemplo, NLLB o M2M-100) para producir versiones en otros idiomas de contenido originalmente oral.
- Evaluacion comparativa de ASR multilingue: sirve como referencia en experimentos academicos sobre lenguas africanas, comparando su salida con la de whisper-large-v3 sin ajustar y midiendo la mejora con WER propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de WER, CER ni comparaciones con otros sistemas para lingala o shona, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5-7 GB en fp32 (los pesos del repositorio suman 6,2 GB), en torno a 3,5 GB en fp16 y alrededor de 2 GB en int8. Son estimaciones a partir del numero de parametros, no mediciones publicadas.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes de alto volumen; RTX 4090, RTX 3090 o RTX A6000 para uso profesional en una sola tarjeta.
- Compatibilidad con GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090, tanto en fp16 como en int8; en tarjetas de 8 GB o menos es necesario cuantizar o usar CTranslate2.
- Opciones de despliegue: transformers (clase WhisperForConditionalGeneration), faster-whisper mediante conversion a CTranslate2, whisper.cpp u otras implementaciones GGUF tras convertir los pesos, y endpoints gestionados de HuggingFace. El soporte en vLLM para modelos Whisper es limitado; conviene verificar la version antes de plante
