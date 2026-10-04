# yuldashev222/uzbek_stt_v1-ct2

## Resumen

uzbek_stt_v1-ct2 es una conversion del modelo de reconocimiento automatico del habla (ASR) Kotib/uzbek_stt_v1 al formato CTranslate2, publicada por el usuario yuldashev222. El modelo original es un Whisper medium ajustado (fine-tuned) para uzbeko por el equipo Kotibai & Rubai, y esta version mantiene los pesos sin modificar en precision completa (float32), pensada para usarse con la libreria faster-whisper. El repositorio ocupa 3,1 GB, lo que es coherente con los aproximadamente 769 millones de parametros de la arquitectura Whisper medium en float32.

Su relevancia es practica: CTranslate2 es un motor de inferencia optimizado que permite ejecutar modelos Whisper con mayor velocidad y menor uso de memoria que la implementacion original de PyTorch, ademas de soportar cuantizacion en el momento de la carga. Esto lo hace util para desplegar transcripcion en uzbeko en produccion, incluso en hardware modesto, siempre que se acepte que la deteccion automatica de idioma del fine-tune no es fiable y haya que forzar `language="uz"`.

El modelo se distribuye bajo licencia Apache 2.0, soporta unicamente el idioma uzbeko y no incluye datos de benchmarks publicados en la informacion disponible. No es un modelo generativo de proposito general: es un sistema de transcripcion de audio a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper medium, heredada del modelo base) |
| Parametros totales | ~769 M (correspondiente a Whisper medium; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (arquitectura Whisper); limite de 448 tokens de texto decodificado. No especificado en la model card |
| Tipos de cuantizacion | El repositorio contiene pesos en float32 sin cuantizar; faster-whisper permite seleccionar `compute_type` en la carga (float32, float16, int8_float16, int8, entre otros) |
| Idiomas soportados | Uzbeko (uz) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin` y ficheros asociados); incluye `tokenizer.json` generado a partir del tokenizer original |

## Arquitectura y entrenamiento

El modelo es la conversion a CTranslate2 de Kotib/uzbek_stt_v1, que a su vez es un Whisper medium ajustado para uzbeko por el equipo Kotibai & Rubai. Whisper medium es un transformer encoder-decoder con atencion estandar, disenado para tareas de reconocimiento y traduccion de voz, que procesa audio dividido en ventanas de 30 segundos. La conversion se realizo con `ctranslate2.converters.TransformersConverter` sin aplicar cuantizacion, de modo que los pesos se conservan en float32 y la eleccion de precision se delega al momento de la carga con faster-whisper. El `tokenizer.json` se genero a partir de los ficheros del tokenizer original.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones de alineamiento. Tampoco se detalla la receta de fine-tuning sobre el modelo base Whisper. La model card indica explicitamente que la deteccion automatica de idioma del fine-tune no es fiable, por lo que recomienda pasar `language="uz"` en cada llamada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en uzbeko, transcribiendo audio a texto.
- Procesamiento de audio en ventanas de 30 segundos, con capacidad de gestionar ficheros mas largos mediante segmentacion interna.
- Funcionamiento con faster-whisper sobre CTranslate2, con soporte de distintos tipos de computo para acelerar la inferencia.
- Salida con marcas de tiempo por segmento (comportamiento estandar de faster-whisper).
- Deteccion de idioma integrada, aunque la propia model card advierte de que es poco fiable en este fine-tune.
- No se documenta soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni procesamiento de imagen; es exclusivamente un modelo de voz a texto.
- Multilinguismo: limitado a uzbeko.

## Casos de uso

- Transcripcion de reuniones en uzbeko: el modelo convierte grabaciones de voz en texto con marcas de tiempo, util para generar actas automaticas de reuniones internas en organizaciones que trabajan en uzbeko.
- Subtitulado de video: integrado en una pipeline de post-produccion, permite generar subtitulos `.srt` para contenido audiovisual en uzbeko aprovechando las marcas de tiempo por segmento.
- Atencion al cliente por voz: transcripcion de llamadas grabadas para alimentar un sistema de analisis de sentimiento o de busqueda sobre conversaciones historicas en uzbeko.
- Archivado y busqueda de contenido oral: conversion de entrevistas, ponencias o archivos historicos de audio a texto indexable, facilitando la busqueda por palabras clave en corpus orales.
- Accesibilidad: generacion de transcripciones en directo o diferido para personas con discapacidad auditiva en entornos de habla uzbeka.
- Despliegue en edge o servidores modestos: gracias a CTranslate2 y a la cuantizacion seleccionable en carga (float16, int8), puede ejecutarse en GPUs de gama media o incluso en CPU, lo que facilita su integracion en aplicaciones locales.
- Preprocesado para pipelines de NLP: transcripcion de audio como primer paso antes de aplicar traduccion automatica, resumen o analisis de texto sobre contenido en uzbeko.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 3,1 GB en float32, lo que da una estimacion de VRAM de unos 3,1 GB solo para los pesos.
- Con `compute_type="float16"` los pesos ocupan aproximadamente 1,5 GB; con `int8` o `int8_float16`, alrededor de 0,8 GB, mas el consumo de activaciones y del buffer de audio.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090 y similares, con amplio margen incluso en float32.
- Puede ejecutarse en CPU con cuantizacion int8, con una penalizacion de latencia notable respecto a GPU.
- Opciones de despliegue principales: faster-whisper (recomendado, es el objetivo de esta conversion) y CTranslate2 directamente. El formato no es compatible con llama.cpp ni con Ollama.
- GPU profesionales como A100 o H100 no son necesarias para este tamano de modelo y solo tendrian sentido para lotes masivos en paralelo.
- No se dispone de datos de latencia ni de throughput medidos para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| yuldashev222/uzbek_stt_v1-ct2 | ~769 M | Ventanas de 30 s | Uzbeko | Apache 2.0 | CTranslate2 |
| Kotib/uzbek_stt_v1 (modelo base) | ~769 M | Ventanas de 30 s | Uzbeko | No disponible | Transformers (safetensors) |
| openai/whisper-medium | ~769 M | Ventanas de 30 s | Multilingue (~99 idiomas) | MIT | Transformers, CTranslate2 |
| openai/whisper-large-v3 | ~1550 M | Ventanas de 30 s | Multilingue (~99 idiomas) | MIT | Transformers, CTranslate2 |

No se dispone de datos de rendimiento comparativo (WER u otras metricas) para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La deteccion automatica de idioma del fine-tune es poco fiable; la model card recomienda forzar `language="uz"` en cada transcripcion.
- El modelo solo soporta uzbeko; no debe esperarse un rendimiento correcto en otros idiomas.
- Riesgo de alucinacion y de transcripciones erroneas en audio con ruido, acentos marcados, solapamiento de voces o vocabulario tecnico poco representado en el entrenamiento.
- No se documentan sesgos especificos, pero al ser un fine-tune sobre Whisper medium hereda los sesgos del modelo original y los del corpus de ajuste, no disponible publicamente.
- Arquitectura limitada a ventanas de 30 segundos: audios largos requieren segmentacion y pueden presentar incoherencias en los limites entre ventanas.
- Este repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026; no cuenta con validacion comunitaria ni con benchmarks publicados, por lo que conviene evaluarlo con datos propios antes de llevarlo a produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Kotib/uzbek_stt_v1, no disponible en la informacion proporcionada.
- La model card no especifica el proceso de conversion mas alla del uso de `TransformersConverter`, ni garantiza equivalencia numerica exacta frente al modelo original en Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuldashev222/uzbek_stt_v1-ct2
- Modelo base: https://huggingface.co/Kotib/uzbek_stt_v1
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
