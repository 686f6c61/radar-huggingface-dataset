# VocaHQ/whisperkit-coreml

## Resumen

El repositorio VocaHQ/whisperkit-coreml contiene la conversión a CoreML de Oriserve/Whisper-Hindi2Hinglish-Apex, un ajuste fino de Whisper large-v3-turbo que transcribe voz en hindi a script latino (Hinglish). Lo publica VocaHQ para su aplicación VocaMac y replica la estructura de argmaxinc/whisperkit-coreml, de modo que cualquier aplicación basada en WhisperKit puede cargarlo mediante `WhisperKitConfig(model:modelRepo:)`.

El objetivo es ejecutar reconocimiento automático del habla (ASR) en dispositivos Apple a través de CoreML y el Apple Neural Engine, sin depender de GPU CUDA ni de servicios en la nube. El encoder y el decoder se han palettizado a 8 bits mediante k-means y el espectrograma mel se mantiene en fp16, lo que deja el repositorio en 0,8 GB.

Su relevancia es de nicho pero concreta: cubre la transcripción de hindi a Hinglish en local dentro del ecosistema Apple y documenta el flujo de conversión de ajustes finos de comunidad a CoreML con whisperkittools, un proceso poco publicado. Como contrapartida, el repositorio acumula 0 descargas y 0 likes, y sus únicas métricas publicadas miden la fidelidad de la cuantización frente a la conversión fp16, no la calidad absoluta del ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a CoreML para WhisperKit |
| Parametros totales | No disponible en la ficha; el modelo base (whisper-large-v3-turbo) tiene 809 M de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de la arquitectura Whisper) |
| Tipos de cuantizacion | Palettization de 8 bits (k-means) en encoder y decoder; espectrograma mel en fp16 |
| Idiomas soportados | Entrada en hindi y salida en hindi romanizado (Hinglish); el campo `languages` del repositorio no esta cumplimentado |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML (whisperkit), cuantizado y palettizado; `generation_config.json` con los `alignment_heads` de openai/whisper-large-v3-turbo |
| Modelo base | Oriserve/Whisper-Hindi2Hinglish-Apex (ajuste fino de Whisper large-v3-turbo) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder desarrollado por OpenAI. El modelo base es Oriserve/Whisper-Hindi2Hinglish-Apex, un ajuste fino de Whisper large-v3-turbo: la variante «turbo» reduce el decoder de 32 a 4 capas y ronda los 809 millones de parametros. El ajuste fino de Oriserve se orienta a una tarea concreta: recibir audio en hindi y escribir la transcripcion en script latino (Hinglish). No se detallan en la informacion disponible ni el numero de tokens de entrenamiento ni la composicion del dataset ni si hubo RLHF o DPO.

La aportacion de este repositorio no es el entrenamiento, sino la conversion a CoreML con whisperkittools. El encoder y el decoder se palettizan a 8 bits con k-means, mientras que el espectrograma mel se conserva en fp16. Ademas, se anaden al `generation_config.json` los `alignment_heads` de openai/whisper-large-v3-turbo, ausentes en el repositorio de origen, necesarios para el conversor y que WhisperKit usa para la alineacion temporal a nivel de palabra. El uso previsto exige decodificar con `language: "en"`, que es la condicion con la que se entreno el modelo para producir Hinglish.

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto.
- Transcripcion de voz en hindi a texto en script latino (Hinglish), en lugar de devolver devanagari.
- Alineacion temporal a nivel de palabra cuando se usa a traves de WhisperKit (gracias a los `alignment_heads` incorporados).
- Ejecucion on-device en hardware Apple mediante CoreML, incluido el Apple Neural Engine.
- Integracion directa con aplicaciones basadas en WhisperKit mediante `WhisperKitConfig(model:modelRepo:)`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni modo «thinking».
- Capacidad multilingue limitada: esta especializado en hindi de entrada y Hinglish de salida; no es un modelo ASR multilingue general.

## Casos de uso

- Transcripcion on-device en aplicaciones para iPhone, iPad y Mac: el modelo esta compilado como CoreML y palettizado a 8 bits, por lo que la inferencia se ejecuta en el Apple Neural Engine sin enviar audio a la nube, lo que resulta util para aplicaciones que exigen privacidad.
- Subtitulado de contenido audiovisual en hindi a script latino: adecuado para plataformas que publican subtitulos en Hinglish para audiencias que leen hindi romanizado en lugar de devanagari.
- Dictado y notas de voz en aplicaciones de productividad para Apple: la ventana de 30 segundos por segmento y la salida en script latino facilitan la integracion en editores de texto sin pasos adicionales de transliteracion.
- Atencion al cliente con usuarios indios: transcripcion de llamadas o mensajes de voz en hindi a un formato de texto que los equipos pueden indexar y buscar.
- Mineria y analitica de conversaciones: conversion de grandes volumenes de audio en hindi a texto Hinglish para su posterior procesamiento de lenguaje natural, clasificacion o busqueda.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva que consumen contenido en hindi y prefieren lectura en script latino.
- Integracion en el propio cliente VocaMac: el repositorio esta pensado para ser consumido por esa aplicacion mediante WhisperKit, actuando como modelo de ASR por defecto para hindi.

## Benchmarks y rendimiento

Las unicas metricas publicadas miden la fidelidad de la conversion cuantizada frente a la conversion CoreML en fp16 sin cuantizar, sobre 60 fragmentos del conjunto de test FLEURS `hi_in`. No son una medida de la calidad absoluta del ASR frente a la transcripcion de referencia.

| Metrica | Valor | Referencia de comparacion |
|---|---|---|
| WER | 0,9 % | conversion CoreML fp16 sin cuantizar |
| CER | 0,3 % | conversion CoreML fp16 sin cuantizar |
| Transcripciones identicas | 48 de 60 | conversion CoreML fp16 sin cuantizar |
| PSNR encoder | 53,2 dB | frente a PyTorch |
| PSNR decoder | 32–34 dB | frente a PyTorch (el decoder fp16 obtiene 34,3 dB) |

No se han publicado resultados de benchmarks en la informacion disponible para tareas como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de ASR.

## Requisitos de hardware

- Formato CoreML orientado a Apple Silicon; no se distribuye para GPU CUDA.
- Huella en disco: 0,8 GB de repositorio, gracias a la palettization de 8 bits del encoder y el decoder.
- Se ejecuta en iPhone, iPad y Mac con chip de Apple, apoyandose en el Apple Neural Engine, la GPU y la CPU a traves de CoreML.
- Al tratarse de un modelo para memoria unificada de Apple, la VRAM en el sentido tradicional (A100, H100, RTX 4090) no aplica; la cifra exacta de memoria en tiempo de ejecucion no esta disponible.
- Opciones de despliegue: WhisperKit en Swift, CoreML y la aplicacion VocaMac. No es compatible con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / destino |
|---|---|---|---|---|---|
| VocaHQ/whisperkit-coreml (esta ficha) | 809 M (heredados de whisper-large-v3-turbo) | 30 s de audio | Entrada hindi, salida Hinglish | Apache-2.0 | CoreML cuantizado 8 bits, Apple Silicon |
| openai/whisper-large-v3-turbo | 809 M | 30 s de audio | Multilingue (decenas de idiomas) | MIT (segun el repositorio de OpenAI) | PyTorch / safetensors, GPU |
| Oriserve/Whisper-Hindi2Hinglish-Apex | No disponible | 30 s de audio | Entrada hindi, salida Hinglish | Apache-2.0 | PyTorch / safetensors, GPU |
| argmaxinc/whisperkit-coreml | Varios tamanos | 30 s de audio | Multilingue | No disponible | CoreML para WhisperKit |

La diferencia clave frente a whisper-large-v3-turbo y a argmaxinc/whisperkit-coreml es la especializacion: este repositorio solo cubre hindi a Hinglish, pero a cambio se ejecuta on-device en Apple sin GPU dedicada. Frente al modelo original de Oriserve, aporta la conversion CoreML cuantizada y la incorporacion de los `alignment_heads`.

## Limitaciones y advertencias

- Especializacion estrecha: solo transcribe hindi a script latino; no es un modelo ASR multilingue general.
- La decodificacion debe forzarse con `language: "en"` para obtener Hinglish, un ajuste contraintuitivo que puede provocar errores si se configura mal.
- Las metricas publicadas (WER, CER, PSNR) miden la fidelidad frente a la conversion fp16, no la precision frente a la transcripcion de referencia; no deben interpretarse como calidad ASR absoluta.
- La cuantizacion con palettization de 8 bits puede degradar la precision en audio con ruido, acentos no vistos o solapamiento de hablantes.
- Repositorio sin traccion: 0 descargas y 0 likes, por lo que no cuenta con validacion independiente de la comunidad.
- Riesgo de alucinacion tipico del ASR: el modelo puede generar texto plausible en silencios, musica o ruido de fondo.
- Sesgos potenciales derivados del ajuste fino sobre hindi/Hinglish: puede rendir peor ante determinados acentos regionales, registros formales o mezclas de idioma distintas del Hinglish.
- La licencia es Apache-2.0 tanto en este repositorio como en el modelo base; conviene verificar aparte los terminos de WhisperKit y de whisperkittools antes de un uso comercial.
- Dependencia de plataforma: el formato CoreML limita su uso a dispositivos Apple; no se puede desplegar en servidores Nvidia sin reconvertir el modelo.
- El campo de idiomas del repositorio no esta cumplimentado, lo que dificulta la catalogacion automatica.
- No hay informacion publica sobre el dataset de entrenamiento del modelo base, lo que limita la evaluacion de sesgos.

## Enlaces

- HuggingFace de este repositorio: https://huggingface.co/VocaHQ/whisperkit-coreml
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Repositorio de referencia de conversiones CoreML: https://huggingface.co/argmaxinc/whisperkit-coreml
- Herramienta de conversion whisperkittools: https://github.com/argmaxinc/whisperkittools
- WhisperKit (argmax-oss-swift): https://github.com/argmaxinc/argmax-oss-swift
- Aplicacion VocaMac: https://vocamac.com
- Modelo de OpenAI cuyos `alignment_heads` se incorporan: https://huggingface.co/openai/whisper-large-v3-turbo
