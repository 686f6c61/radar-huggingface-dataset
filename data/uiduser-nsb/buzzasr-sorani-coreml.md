# UIDUser-NSB/BuzzASR-Sorani-CoreML

## Resumen

BuzzASR-Sorani-CoreML es una conversion del modelo de reconocimiento automatico del habla BuzzASR/sorani-kurdish al formato Core ML de Apple, pensada para ejecutarse en local mediante el runtime WhisperKit en iPhone, iPad y Mac. El modelo subyacente es un Whisper large-v3 afinado especificamente para sorani (kurdo central, codigo ISO `ckb`), de modo que reconoce unicamente esa variedad linguistica y no transcribe ingles ni arabe. El trabajo de conversion lo publica el usuario UIDUser-NSB y no modifica los pesos mas alla del cambio de formato y la compresion.

La relevancia de esta ficha reside en que empaqueta un modelo de reconocimiento de habla de aproximadamente 1.550 millones de parametros (arquitectura Whisper large-v3) en un contenedor de 898 MB gracias a una cuantizacion de 4 bits con paletizacion, frente a los 3,1 GB de la version original en punto flotante. Segun la model card, la precision se mantiene esencialmente identica: en 30 clips del conjunto de test FLEURS de sorani el WER pasa del 34,2 % al 33,9 % y el CER del 9,0 % al 8,8 %.

Se distribuye con licencia MIT, la misma que el modelo original, e incluye los submodelos de espectrograma mel, encoder de audio y decoder de texto, junto con el tokenizer propio del modelo. Es un artefacto de inferencia para el ecosistema Apple (iOS 18 / macOS 15 o superior) y esta pensado para reconocimiento de voz en dispositivo, no para entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (Whisper large-v3) |
| Parametros totales | ≈1.550 M (arquitectura Whisper large-v3; no explicitado en la model card) |
| Longitud de contexto | Ventanas de audio de 30 segundos por chunk (estandar Whisper); contexto de texto de 448 tokens. No disponible desglose adicional |
| Tipos de cuantizacion | 4 bits con paletizacion (k-means, una tabla por cada 16 canales, via coremltools) |
| Idiomas soportados | Sorani / kurdo central (`ckb`) unicamente |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`) para WhisperKit; incluye `tokenizer.json`, `tokenizer_config.json`, `config.json`, `generation_config.json` |
| Tamano del repositorio | 898 MB (modelo original: 3,1 GB) |
| Plataforma objetivo | Core ML, iOS 18 / macOS 15 o superior |
| Runtime | WhisperKit |
| Modelo base | BuzzASR/sorani-kurdish (revision `ce7e6a0f4d28c2f6a75815d2c9d79e0c81e917bf`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder que toma un espectrograma log-mel de 30 segundos (1500 frames) como entrada en el encoder y genera texto de forma autorregresiva en el decoder. El modelo original BuzzASR/sorani-kurdish es un ajuste fino de Whisper large-v3 sobre datos de sorani, y su paper de referencia es "BuzzASR: A Swarm of 100+ Monolingual Speech Recognition Models" (arXiv 2609.09554, Singh, Yadavalli, Arnett y Warstadt). Los detalles concretos del dataset de ajuste fino, el numero de tokens de audio/voz y si hubo etapas de RLHF o DPO no se especifican en la informacion disponible.

La innovacion de esta publicacion no esta en el entrenamiento sino en la conversion y compresion: los pesos se convirtieron con whisperkittools 0.4.2 para iOS 18 / macOS 15 y se paletizaron a 4 bits con coremltools mediante k-means con una tabla por cada 16 canales. Ademas, se reconstruyo `tokenizer.json` a partir de `vocab.json`, `merges.txt` y `added_tokens.json` del modelo original, renombrando las copias de tokens especiales en los ids 0 a 1608 como `<|unused_N|>` para que cada token especial tenga un unico id y la codificacion de texto coincida con la del tokenizer original. Tambien se incorporaron en `generation_config.json` las `alignment_heads` de `openai/whisper-large-v3`, necesarias para las marcas de tiempo a nivel de palabra.

## Capacidades

- Reconocimiento automatico del haba (ASR) en sorani / kurdo central (`ckb`) a partir de audio.
- Transcripcion con marcas de tiempo a nivel de palabra, gracias a las `alignment_heads` heredadas de Whisper large-v3.
- Ejecucion completamente en dispositivo (on-device) en iPhone, iPad y Mac, sin necesidad de conexion a red.
- Soporte de decodificacion voraz (greedy) y del mecanismo de temperature fallback de WhisperKit, activado por defecto, que reintenta salidas repetitivas.
- Uso del token de idioma `fa` para indicar sorani (el modelo fue entrenado con ese token), tal y como indica la model card.
- Capacidad de prefill prompt (`usePrefillPrompt = true`) segun el ejemplo de uso proporcionado.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni razonamiento multi-paso: es un modelo puramente de transcripcion.
- Multilingue: no. Solo sorani; la model card indica explicitamente que no transcribe ingles ni arabe.

## Casos de uso

- Transcripcion de voz en aplicaciones iOS y macOS sin conexion: al ejecutarse en Core ML sobre WhisperKit, permite dictado y transcripcion en local para hablantes de sorani sin enviar audio a servidores externos, lo que reduce latencia y mejora la privacidad.
- Subtitulado de contenido audiovisual en kurdo central: las marcas de tiempo a nivel de palabra facilitan la generacion de subtitulos sincronizados para videos, entrevistas o programas de radio en sorani.
- Herramientas de accesibilidad para hablantes de sorani: conversion de voz a texto en tiempo real en dispositivos Apple para personas con dificultades de escritura o movilidad.
- Documentacion de reuniones y notas de voz: transcripcion en el propio dispositivo de grabaciones de voz en sorani, util en entornos con conectividad limitada o requisitos de confidencialidad.
- Investigacion linguistica y creacion de corpus: al ser un modelo de codigo abierto con licencia MIT y pesos de 898 MB, puede desplegarse en equipos de campo para recopilar y transcribir corpus de sorani.
- Integracion en pipelines de procesamiento de audio en Apple Silicon: el formato Core ML y el runtime WhisperKit permiten incrustar el modelo en apps nativas o en flujos de automatizacion en Mac.
- Archivado y digitalizacion de material oral historico en kurdo central: transcripcion por lotes de grabaciones en sorani para su indexacion y busqueda textual.
- Asistentes de voz locales en sorani: base para interfaces de voz en aplicaciones que requieran funcionamiento offline y baja dependencia de servicios en la nube. (Nota: al ser solo ASR, no cubre la parte generativa de un asistente.)

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 30 clips del conjunto de test FLEURS de sorani, con decodificacion voraz. Menos es mejor.

| Modelo | WER | CER |
|---|---|---|
| Original BuzzASR (PyTorch) | 34,2 % | 9,0 % |
| Este modelo (Core ML, 4 bits) | 33,9 % | 8,8 % |

Nota de la model card: se excluye de ambas filas un clip en el que el modelo de 4 bits repitio su frase. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: el modelo ocupa 898 MB en disco y en memoria. En Apple Silicon comparte memoria unificada, por lo que cabe holgadamente en dispositivos con 4 GB o mas de RAM.
- GPU y aceleradores recomendados: Apple Neural Engine (ANE) y GPU integrada de los chips de la serie Apple M y A. No esta pensado para GPU NVIDIA (A100, H100, RTX 4090), ya que el formato es Core ML y no safetensors ni GGUF.
- Compatibilidad con hardware de consumo: si, es precisamente su objetivo. Cabe en iPhone, iPad y Mac compatibles con iOS 18 / macOS 15 o superior.
- Opciones de despliegue: WhisperKit (unico runtime documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con Core ML.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS sorani) | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| BuzzASR-Sorani-CoreML (este modelo) | ≈1.550 M | 30 s por chunk de audio | 33,9 % | MIT | Core ML / WhisperKit (Apple) |
| BuzzASR/sorani-kurdish (original) | ≈1.550 M | 30 s por chunk de audio | 34,2 % | MIT | PyTorch (safetensors) |
| Otros modelos ASR para sorani | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible con el modelo original, del que este es una conversion de formato. No se dispone de datos de benchmarks de otras alternativas de ASR en sorani en la informacion proporcionada, por lo que no se pueden establecer comparaciones adicionales.

## Limitaciones y advertencias

- Cobertura linguistica restringida: solo sorani (kurdo central). No transcribe ingles, arabe ni otras variedades del kurdo como el kurmanji.
- Riesgo de repeticion: como otros modelos Whisper, puede repetir una frase en clips poco frecuentes. Ocurrio en 1 de 30 clips de test con la version de 4 bits; el temperature fallback de WhisperKit (activo por defecto) reintenta ese tipo de salida.
- WER relativamente alto: 33,9 % de WER sobre FLEURS, un conjunto de habla leida. La propia model card advierte que la conversacion espontanea, los dialectos y el audio con ruido pueden dar resultados distintos, potencialmente peores.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible. Al derivar de Whisper large-v3 y de un ajuste fino sobre un corpus concreto, puede heredar sesgos de esos datos.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente con silencios o ruido; no hay evaluacion especifica de este fenomeno en la model card.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion. La model card pide citar el paper original de BuzzASR.
- Dependencia de plataforma: requiere iOS 18 / macOS 15 o superior y el runtime WhisperKit; no es portable a entornos Linux o Windows con GPU NVIDIA sin reconversion.
- Detalle de uso: es necesario configurar el idioma como `fa` (no `ckb`) en las opciones de decodificacion, ya que el modelo fue entrenado con ese token de idioma.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y lo publica un usuario no verificado, por lo que conviene validar el artefacto antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UIDUser-NSB/BuzzASR-Sorani-CoreML
- Modelo base (PyTorch): https://huggingface.co/BuzzASR/sorani-kurdish
- WhisperKit (repositorio de Argmax): https://github.com/argmaxinc/argmax-oss-swift
- Paper de BuzzASR: https://arxiv.org/abs/2609.09554
- Modelo base de OpenAI (Whisper large-v3): openai/whisper-large-v3 (referenciado en la model card para las `alignment_heads`)
