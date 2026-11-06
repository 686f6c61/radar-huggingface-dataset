# whisper-free/cohere-transcribe-arabic-gguf

## Resumen

`whisper-free/cohere-transcribe-arabic-gguf` es un espejo en formato GGUF del modelo de reconocimiento automatico del habla (ASR) `CohereLabs/cohere-transcribe-arabic-07-2026`, desarrollado originalmente por Cohere Labs y publicado bajo licencia Apache-2.0. Este repositorio concreto lo mantiene el usuario `whisper-free` para su uso dentro de la aplicacion Whisper Free, y contiene un unico fichero cuantizado en Q5_K_M generado por `handy-computer`, byte a byte identico al commit `715cbe09ca9b60fc1e497db1e4478fa9fcf4ac21` del repositorio original de conversion.

El modelo resuelve la transcripcion de audio a texto, con foco especifico en arabe (ar) e ingles (en). Cuenta con aproximadamente 2.049 millones de parametros (unos 2,05 mil millones), lo que lo situa en la gama de modelos ASR de tamano medio, manejables en hardware de consumo cuando se cuantizan. El repositorio ocupa 1,8 GB e incluye unicamente el fichero GGUF, sin pesos en safetensors.

La relevancia de esta ficha radica en que documenta una via de despliegue practica para un modelo ASR de Cohere Labs fuera del ecosistema Python habitual: la libreria `transcribe.cpp` permite ejecutar el modelo en entornos C/C++ con el formato GGUF. No obstante, la informacion publica disponible es muy limitada (0 descargas, 0 likes, model card minima), por lo que numerosos datos tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; arquitectura concreta no especificada en la informacion) |
| Parametros totales | 2.049.026.832 (~2,05 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico fichero incluido en el repo) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico fichero: `cohere-transcribe-arabic-07-2026-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `CohereLabs/cohere-transcribe-arabic-07-2026` en la informacion proporcionada. Se trata de un modelo de la familia de reconocimiento automatico del habla (pipeline `automatic-speech-recognition`), con aproximadamente 2,05 mil millones de parametros, especializado en arabe e ingles. La model card del espejo no describe la arquitectura (transformer, conformer, etc.), los datos de entrenamiento, el numero de horas de audio, ni si se aplicaron tecnicas de RLHF/DPO o ajuste supervisado.

Respecto a este repositorio concreto, la model card indica explicitamente que los pesos fueron convertidos y cuantizados, no reentrenados: se trata de una conversion a GGUF con cuantizacion Q5_K_M realizada por `handy-computer`, con SHA256 `55e61c9b047e36f0e084d367f6b0bfecc71a6a0527da6eea4f0c687f3584775f`. El autor advierte que las licencias de los datasets de entrenamiento no fueron auditadas. Cualquier innovacion tecnica del modelo original (atencion, decodificacion, etc.) no esta documentada en la informacion disponible.

## Capacidades

- Transcripcion automatica de voz a texto (ASR) en arabe e ingles.
- Procesamiento de audio como entrada y generacion de texto como salida (pipeline `automatic-speech-recognition`).
- Ejecucion mediante la libreria `transcribe.cpp`, orientada a despliegue en C/C++ con formato GGUF.
- Soporte de cuantizacion Q5_K_M, lo que reduce el peso del modelo respecto a los pesos originales.
- Capacidades multilingues limitadas a arabe e ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio adicional ni modo de razonamiento (thinking mode) en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y llamadas en arabe: el modelo puede convertir audio de conversaciones multi-participante en texto para actas o resumenes, aprovechando su especializacion en arabe.
- Subtitulado automatico de contenido audiovisual arabe-ingles: util para generar subtitulos en plataformas de video o medios de comunicacion que operan en ambos idiomas.
- Atencion al cliente en centros de llamadas arabohablantes: transcripcion de grabaciones para control de calidad, analisis de sentimiento o busqueda en historicos de llamadas.
- Dictado y notas de voz en aplicaciones moviles o de escritorio: integrable mediante `transcribe.cpp` en aplicaciones nativas que necesiten transcripcion local sin depender de servicios en la nube.
- Investigacion en procesamiento de habla arabe: uso como linea base o componente en estudios de ASR, dado su tamano moderado y licencia permisiva.
- Generacion de transcripciones para accesibilidad: conversion de audio a texto en entornos educativos o institucionales que requieran procesamiento local por motivos de privacidad.
- Despliegue en entornos con recursos limitados: la version Q5_K_M permite ejecutar el modelo en hardware modesto, adecuado para prototipos o sistemas embebidos con `transcribe.cpp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q5_K_M y ~2,05 mil millones de parametros, el fichero ocupa aproximadamente 1,8 GB; se estima un uso de VRAM en torno a 2-3 GB incluyendo overhead, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, es plausible su ejecucion en GPUs de consumo, pero no se confirma oficialmente.
- Cabe en GPU de consumo: probablemente si, dado el tamano del fichero (~1,8 GB), aunque no se documenta soporte oficial.
- Opciones de despliegue: `transcribe.cpp` (libreria indicada en el repositorio). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Informacion publica muy limitada: la model card es minima y no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks.
- Idiomas restringidos a arabe e ingles; no se garantiza soporte de otros idiomas.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, acentos o vocabulario tecnico; no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados; al no auditarse las licencias de los datasets de entrenamiento, no se puede evaluar la composicion ni posibles sesgos de los datos.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor advierte que las licencias de los datasets de entrenamiento no fueron auditadas.
- El repositorio contiene un unico fichero Q5_K_M; no se ofrecen otras cuantizaciones ni pesos originales en este espejo.
- Dependencia de la libreria `transcribe.cpp`; no se documenta compatibilidad con otros runners.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- El modelo se proporciona "as-is", sin garantia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whisper-free/cohere-transcribe-arabic-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Repositorio de conversion GGUF original: https://huggingface.co/handy-computer/cohere-transcribe-arabic-07-2026-gguf
- Commit de conversion: `715cbe09ca9b60fc1e497db1e4478fa9fcf4ac21`
