# Spiteman/LFM3-Omni-2B-MLX-oQ3.5e

## Resumen

LFM3-Omni-2B-MLX-oQ3.5e es una cuantizacion en 3 bits (formato MLX, esquema oQ3.5e) del modelo multimodal LFM3-Omni-2B desarrollado por Liquid AI. Se trata de un modelo any-to-any capaz de procesar y generar texto, audio e imagenes, lo que incluye reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y respuesta a preguntas sobre imagenes. Esta version concreta ha sido publicada por el usuario Spiteman y esta pensada para su ejecucion en Apple Silicon mediante la libreria MLX.

El modelo base emplea la arquitectura LFM3 de Liquid AI, disenada para despliegue en dispositivo (on-device) con un tamano de 2.166.928.384 parametros (aproximadamente 2,17 mil millones). Su interes radica en combinar capacidades omni (texto, vision y audio) en un unico checkpoint de apenas 1,6 GB en esta cuantizacion, lo que facilita la inferencia local en equipos con memoria unificada limitada.

La relevancia de esta ficha estriba en que permite evaluar rapidamente una alternativa compacta y multilingue (23 idiomas declarados) para pipelines de voz y vision en local, sin depender de APIs en la nube. No obstante, al tratarse de una cuantizacion agresiva a 3 bits, conviene valorar la perdida de calidad frente al checkpoint original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (familia Liquid Foundation Models); detalles de la arquitectura interna no disponibles en la informacion proporcionada |
| Parametros totales | 2.166.928.384 (aprox. 2,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (esquema oQ3.5e, formato MLX); existe version BF16 del mismo autor |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | safetensors (MLX), con codec de audio en `audio_tokenizer/` |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B pertenece a la familia LFM3 de Liquid AI, orientada a modelos compactos para despliegue en dispositivo. La informacion proporcionada no detalla la arquitectura interna (tipo de transformer, atencion, capas), el numero de tokens de entrenamiento ni la composicion del dataset. Tampoco se especifica si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

Lo que si se documenta es la modalidad omni: el modelo integra un codec de audio (almacenado en `audio_tokenizer/`, con un peso aproximado de 0,15 GB en la version BF16) que permite entrada y salida de audio a 24 kHz, ademas de procesamiento de imagenes. La version aqui descrita es una cuantizacion MLX de 3 bits realizada por un tercero (Spiteman), no una publicacion oficial de Liquid AI, por lo que las innovaciones tecnicas del entrenamiento original no se recogen en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas en 23 idiomas.
- Reconocimiento automatico del habla (ASR) mediante prompts de sistema como "Perform ASR in English".
- Sintesis de voz (TTS) con salida WAV a 24 kHz, con seleccion de voz e idioma mediante prompt de sistema.
- Speech-to-speech: entrada de audio y salida de audio.
- Vision: respuesta a preguntas sobre imagenes (image question answering).
- Procesamiento any-to-any: combinacion de texto, audio e imagen en la misma interfaz.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: 23 idiomas declarados, incluido el espanol.

## Casos de uso

- Transcripcion de audio en local: el modelo puede realizar ASR sobre ficheros WAV mediante MLX-VLM en un Mac con Apple Silicon, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Lectura de documentos en voz alta: usando el modo TTS con prompts de sistema que fijan idioma y voz, se puede convertir texto en audio a 24 kHz para aplicaciones de accesibilidad.
- Asistentes de voz conversacionales: la capacidad speech-to-speech permite construir interfaces de voz que reciben audio y responden con audio, aprovechando el soporte multilingue para usuarios de distintos idiomas.
- Descripcion de imagenes y lectura de carteles: el modo de pregunta sobre imagen permite extraer informacion de fotografias (por ejemplo, leer senalizacion) en aplicaciones moviles o de escritorio con inferencia local.
- Prototipado rapido en Apple Silicon: al ocupar 1,6 GB en cuantizacion de 3 bits, es viable experimentar con pipelines multimodales en portatiles Mac sin GPU dedicada.
- Traduccion y atencion multilingue: con 23 idiomas soportados, puede emplearse en tareas de transcripcion y respuesta en varios idiomas dentro de una misma aplicacion.
- Evaluacion de cuantizaciones: sirve como referencia para medir la degradacion de calidad de una cuantizacion a 3 bits frente al checkpoint BF16 original en tareas de ASR, TTS y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 1,6 GB en cuantizacion de 3 bits; la version BF16 del mismo autor ocupa 4,33 GB de pesos mas 0,15 GB del codec de audio.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA en esta version.
- GPU recomendadas: no disponible; el formato MLX esta pensado para memoria unificada de chips Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (la cuantizacion de 3 bits es la opcion mas ligera).
- Opciones de despliegue: MLX-VLM (soporte de LFM3-Omni en curso segun la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-oQ3.5e (este) | 2,17 mil millones | no disponible | texto, audio, vision | lfm1.0 | MLX, 3 bits |
| LFM3-Omni-2B-MLX-bf16 (mismo autor) | 2,17 mil millones | no disponible | texto, audio, vision | lfm1.0 | MLX, BF16 (4,33 GB + 0,15 GB codec) |
| LiquidAI/LFM3-Omni-2B (original) | 2,17 mil millones | no disponible | texto, audio, vision | lfm1.0 | safetensors originales |

No se dispone de datos de benchmarks ni de modelos comparables de otros fabricantes en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: es previsible cierta degradacion de calidad frente al checkpoint BF16, especialmente en tareas de audio y vision; no se han publicado metricas que la cuantifiquen.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar los sesgos habituales de los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en tareas de vision el propio ejemplo de la model card recomienda basar las respuestas solo en lo visible.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; aunque se declaran 23 idiomas, no se especifica el nivel de calidad por idioma.
- Licencia: lfm1.0 (marcada como "other"); es necesario revisar los terminos del fichero LICENSE antes de cualquier uso comercial, ya que no se detallan en la informacion proporcionada.
- Madurez del ecosistema: el soporte de LFM3-Omni en MLX-VLM esta en desarrollo segun la model card, por lo que la API y el comportamiento pueden cambiar.
- Autor de la cuantizacion: se trata de una publicacion de un tercero (Spiteman), no oficial de Liquid AI; conviene validar la fidelidad de los pesos antes de usarla en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Spiteman/LFM3-Omni-2B-MLX-oQ3.5e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Version BF16 del mismo autor: https://huggingface.co/Spiteman/LFM3-Omni-2B-MLX-bf16 (referenciada en la model card)
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Consola de API de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
