# sriram09764/itantra-tts-onnx

## Resumen

iTantra TTS ONNX es una coleccion de modelos de sintesis de voz (TTS) en formato ONNX, derivada de los repositorios `facebook/mms-tts-*` de Meta, y publicada por el usuario `sriram09764` en HuggingFace. El paquete contiene diez voces, una por idioma, pensadas para ser consumidas por `sherpa-onnx`, el runtime de inferencia de voz de k2-fsa. Cada carpeta incluye un fichero `model.onnx`, un `tokens.txt` y un `config.json`, lo que permite desplegar el modelo sin dependencias de PyTorch ni de frameworks pesados.

El modelo resuelve el problema de disponer de voces TTS ligeras y ejecutables en el dispositivo para diez idiomas indicos y el ingles: hindi, gujarati, marati, kannada, malabar (malayalam), tamil, telugu, bengali, odia e ingles. La base tecnica son los modelos MMS-TTS de Meta, que emplean la arquitectura VITS (sintesis end-to-end con aprendizaje adversario y modelado variacional), reconvertidos a ONNX para su uso en produccion.

Es relevante porque los modelos MMS originales se distribuyen en formato PyTorch y no estan optimizados para inferencia en movil o en el borde. Esta conversion habilita su uso en aplicaciones Android y en despliegues de baja latencia, tal como demuestra su integracion en la aplicacion iTantra Radio (proyecto SIH 2024 26173). El repositorio ocupa 2,3 GB en total, no declara licencia ni pipeline, y acumula 1 like y 0 descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, aprendizaje adversario con modelado variacional) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin cuantizacion declarada) |
| Idiomas soportados | Hindi, ingles, gujarati, marati, kannada, malayalam, tamil, telugu, bengali, odia (10) |
| Licencia | no disponible (el repositorio no la especifica) |
| Formato de pesos | ONNX (`model.onnx` + `tokens.txt` + `config.json` por idioma) |

## Arquitectura y entrenamiento

La arquitectura es VITS, segun declara el propio autor en la model card. VITS es un modelo de sintesis de voz end-to-end que combina un codificador de texto, un codificador posterior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial de multiples periodos. Esta diseno elimina la necesidad de un modelo acustico y un vocoder separados, y produce audio de forma directa a partir de fonemas o caracteres. Los modelos originales fueron entrenados por Meta dentro del proyecto MMS (Massively Multilingual Speech) y publicados como `facebook/mms-tts-<idioma>`.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de conversion a ONNX, mas alla de que produce artefactos compatibles con `sherpa-onnx`. La innovacion tecnica destacable aqui no es de entrenamiento, sino de empaquetado: la exportacion a ONNX permite ejecutar VITS en runtime de C/C++ sin dependencias de Python ni de PyTorch, lo que reduce el peso y facilita el despliegue en Android y en dispositivos de borde.

## Capacidades

- Sintesis de voz (texto a audio) en diez idiomas: hindi, ingles, gujarati, marati, kannada, malayalam, tamil, telugu, bengali y odia.
- Generacion de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Inferencia en formato ONNX compatible con `sherpa-onnx`, lo que permite su uso en C++, C#, Java (Android), Python y Go.
- Ejecucion en CPU y en dispositivos de gama baja, sin requerir GPU.
- Modelo especializado en TTS: no realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, ni entrada de audio, ni capacidades multimodales.

## Casos de uso

- Lectura por voz en aplicaciones Android: la aplicacion iTantra Radio ya lo integra para narrar contenido; el formato ONNX con `sherpa-onnx` evita empaquetar PyTorch en el APK.
- Audiolibros y contenido editorial en idiomas indicos: se puede generar audio de articulos o libros en hindi, tamil o telugu sin depender de servicios en la nube, manteniendo los datos en el dispositivo.
- Sistemas de respuesta interactiva de voz (IVR) multilingues: al cubrir diez idiomas, un mismo backend `sherpa-onnx` puede atender llamadas en varias lenguas del subcontinente indio.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en tiempo real con latencia baja y sin conexion, apta para lectores de pantalla embebidos.
- Asistentes de voz embebidos en dispositivos IoT: al ejecutarse en CPU y en el borde, encaja en altavoces inteligentes o paneles de informacion sin GPU dedicada.
- Generacion de avisos y anuncios automatizados en transporte publico: sintesis de mensajes en varios idiomas regionales a partir de plantillas de texto.
- Material educativo y aprendizaje de idiomas: lectura de ejercicios y vocabulario en los diez idiomas soportados para plataformas de e-learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano total del repositorio: 2,3 GB, repartidos en diez modelos (aproximadamente 200-250 MB por idioma).
- VRAM estimada para inferencia: no aplica; los modelos VITS ONNX son ligeros y pueden ejecutarse en CPU.
- Cabe en GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en GPU integradas, aunque no es necesario para un rendimiento aceptable.
- Compatible con despliegue en movil (Android) y dispositivos de borde (Raspberry Pi y similares) mediante `sherpa-onnx`.
- Opciones de despliegue: `sherpa-onnx`, ONNX Runtime. No se declara soporte explicito para vLLM ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idiomas (indicos) | Formato | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iTantra TTS ONNX | 10 (mas ingles) | ONNX | sherpa-onnx / ONNX Runtime | no disponible | HuggingFace (0 descargas) |
| facebook/mms-tts-* | Amplia cobertura MMS | PyTorch / safetensors | PyTorch | CC-BY-NC 4.0 (segun el proyecto MMS) | HuggingFace |
| Piper (rhasspy) | Voces por idioma, indico limitado | ONNX | sherpa-onnx / onnxruntime | MIT en el motor, voces con licencias variables | HuggingFace / GitHub |

Nota: los datos de la fila de `facebook/mms-tts-*` y de Piper proceden de conocimiento general de esos proyectos y no de la informacion proporcionada en esta busqueda; se incluyen solo como referencia cualitativa.

## Limitaciones y advertencias

- El repositorio no especifica licencia. La ausencia de licencia explicita impide confirmar si se permite el uso comercial de esta conversion; los modelos originales de Meta MMS se distribuyen habitualmente bajo CC-BY-NC 4.0, lo que restringiria su explotacion comercial, pero no se puede confirmar para este repositorio concreto.
- No hay informacion sobre sesgos, calidad por idioma ni evaluacion subjetiva de naturalidad de las voces.
- Como todo sistema TTS, puede presentar errores de pronunciacion en palabras poco frecuentes, nombres propios, siglas o numeros, y no procesa texto fuera de los idiomas para los que fue entrenado.
- No maneja contexto conversacional ni entrada de audio: es exclusivamente texto a voz.
- Al ser una conversion del modelo base, hereda las limitaciones acusticas de los `facebook/mms-tts-*` originales, cuyo detalle no se documenta aqui.
- Riesgo de desalineacion en textos largos si no se segmentan en frases; se recomienda dividir la entrada en fragmentos por debajo del limite gestionado por `sherpa-onnx`.
- El numero de descargas es 0 y la unica interaccion registrada es 1 like, por lo que no hay validacion de la comunidad sobre la calidad de la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriram09764/itantra-tts-onnx
- Modelos base de Meta MMS-TTS: https://huggingface.co/facebook/mms-tts-hin (y equivalentes por idioma)
- Proyecto MMS de Meta: https://ai.meta.com/blog/mms-massively-multilingual-speech/
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Piper (TTS en ONNX comparable): https://github.com/rhasspy/piper
- No se han encontrado papers, blogs o demos adicionales especificos de este repositorio en la busqueda web realizada.
