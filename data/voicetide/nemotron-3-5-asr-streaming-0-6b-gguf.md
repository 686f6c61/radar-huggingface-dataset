# voicetide/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

El repositorio `voicetide/nemotron-3.5-asr-streaming-0.6b-gguf` contiene una conversion al formato GGUF del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema de reconocimiento automatico del habla (ASR) orientado a transcripcion en streaming. La conversion y cuantizacion a Q8_0 la ha realizado el usuario `voicetide` y se distribuye como "language pack" para la aplicacion Voice Tide, segun indica la propia model card. El modelo original es de NVIDIA.

Se trata de un modelo compacto: 637.991.968 parametros (aproximadamente 0,64 mil millones), con un unico fichero de pesos de 751.094.240 bytes en cuantizacion Q8_0. El repositorio ocupa 0,8 GB en total. Es relevante para desarrolladores que necesitan integrar transcripcion de voz en tiempo real en entornos con recursos limitados, ya que su tamano permite ejecucion en CPU y en GPUs de gama de consumo.

La licencia es OpenMDW-1.1, heredada del modelo original de NVIDIA, que se mantiene sobre esta version modificada. El modelo declara soporte para 28 idiomas, lo que lo situa en la categoria de los sistemas ASR multilingues ligeros. No se han publicado resultados de benchmarks ni datos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de reconocimiento automatico del habla en streaming; la arquitectura concreta no se especifica en la informacion proporcionada) |
| Parametros totales | 637.991.968 (aproximadamente 0,64 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en el repositorio) |
| Idiomas soportados | 28: en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et |
| Licencia | OpenMDW-1.1 (OpenMDW License Agreement, version 1.1) |
| Formato de pesos | GGUF (fichero `nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de encoder, mecanismo de atencion, modulos de streaming ni estrategia de decodificacion). El nombre del modelo base, `nemotron-3.5-asr-streaming-0.6b`, indica que se trata de un sistema ASR con capacidad de streaming y aproximadamente 0,6 mil millones de parametros, pero no se aportan mas detalles tecnicos sobre su diseno.

Tampoco se especifican los datos de entrenamiento: numero de horas de audio, composicion del dataset, idiomas cubiertos durante el entrenamiento, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. La unica innovacion documentada en este repositorio es la propia conversion: transformacion de los pesos originales de NVIDIA al formato GGUF y cuantizacion a Q8_0, manteniendo intacta la mayor parte de la precision numerica respecto a los pesos sin cuantizar.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en streaming, segun se desprende del nombre del modelo base.
- Transcripcion multilingue en 28 idiomas, incluidos ingles, castellano, frances, italiano, portugues, neerlandes, aleman, turco, ruso, arabe, hindi, japones, coreano, vietnamita, ucraniano, polaco, sueco, checo, noruego (nb), danes, bulgaro, finlandes, croata, eslovaco, chino, hungaro, rumano y estonio.
- Ejecucion en formato GGUF con cuantizacion Q8_0, lo que reduce los requisitos de memoria frente a los pesos originales.
- Integracion como language pack en la aplicacion Voice Tide, segun indica la model card.
- Soporte de tool calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modos especiales (thinking mode, vision, audio generativo): no disponible.

## Casos de uso

- Subtitulado en directo: el modelo puede generar transcripciones a medida que se produce el audio, lo que encaja con emisiones en vivo, webinars o retransmisiones donde se necesita texto sincronizado con baja latencia.
- Transcripcion de reuniones: al ser un modelo de 0,64 mil millones de parametros en Q8_0 (0,8 GB), se puede desplegar en un portatil o en un servidor modesto para transcribir reuniones internas sin enviar audio a servicios externos.
- Asistentes de voz para aplicaciones: integrado en un pipeline de voz a texto, permite convertir comandos hablados en texto para su posterior procesado por un LLM encargado de la logica de negocio.
- Analitica de llamadas de atencion al cliente: transcripcion masiva de grabaciones para alimentar sistemas de busqueda, clasificacion de motivos de contacto o control de calidad, con la ventaja de cubrir 28 idiomas sin cambiar de modelo.
- Dictado y accesibilidad: conversion de voz a texto en herramientas de escritura para usuarios con movilidad reducida o para profesionales que prefieren dictar en lugar de teclear, aprovechando el tamano reducido del modelo.
- Documentacion clinica o legal asistida por voz: transcripcion de notas dictadas por profesionales, con el modelo ejecutandose en infraestructura propia para mantener la confidencialidad de los datos.
- Procesado por lotes en CPU: en entornos sin GPU disponible, el formato GGUF y el tamano reducido permiten transcodificar volumenes grandes de audio usando unicamente CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del fichero de pesos: 751.094.240 bytes (aproximadamente 0,75 GB) en cuantizacion Q8_0.
- VRAM estimada para inferencia: a partir del tamano del fichero, el modelo requiere del orden de 0,75 GB solo para los pesos, mas el overhead del runtime y las estructuras de estado del decodificador. Una estimacion prudente se situaria en la franja de 1 a 2 GB, aunque la cifra exacta no esta publicada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre deberia ser suficiente; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 estan sobradamente dimensionados para este modelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo moderna e incluso en iGPUs con memoria compartida suficiente.
- Ejecucion en CPU: viable dado el tamano, aunque latencia y throughput dependeran fuertemente del hardware.
- Opciones de despliegue: el formato GGUF es compatible con runtimes que lean este formato; la model card menciona su uso como language pack dentro de Voice Tide. La compatibilidad concreta con otros motores no se especifica en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones de modelos alternativos de la misma categoria (ASR multilingue en el rango de 0,5 a 1 mil millones de parametros) ni datos de rendimiento que permitan una comparacion rigurosa. Se puede senalar que el modelo base pertenece a la familia NVIDIA Nemotron, pero no se aportan cifras de otros miembros de la familia ni de competidores.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible cuantificar la calidad de transcripcion ni compararla con alternativas.
- No hay informacion sobre sesgos acusticos, dialectales o de acento, ni sobre el rendimiento diferencial entre los 28 idiomas declarados.
- Riesgo de alucinacion: inherente a los sistemas ASR, especialmente en audio con ruido, solapamiento de voces o vocabulario tecnico fuera de dominio.
- No se especifica la longitud de contexto ni la ventana de audio maxima procesable en modo streaming.
- La licencia OpenMDW-1.1 es una licencia propia de NVIDIA cuyo texto completo esta en https://openmdw.ai/license/1-1/; conviene revisarla antes de un uso comercial, ya que no es una licencia permisiva estandar como Apache 2.0 o MIT.
- Este repositorio es una conversion de terceros: el autor es `voicetide` y no NVIDIA, por lo que la responsabilidad sobre la integridad de la conversion recae en el publicador. Se proporciona el hash SHA-256 del fichero (`b94545b313b3223fda7b2857a52681da813935c2127643d1e9ff0c23d988089c`) para verificacion.
- La cuantizacion Q8_0 puede introducir perdidas menores de precision frente a los pesos originales, aunque en este nivel de cuantizacion el impacto suele ser reducido.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- No se documentan requisitos de version de runtime, formato de entrada de audio (frecuencia de muestreo, canales) ni procedimiento de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/voicetide/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en HuggingFace: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
