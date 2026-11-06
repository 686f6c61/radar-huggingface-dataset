# Spiteman/LFM3-Omni-2B-MLX-oQ4e

## Resumen

LFM3-Omni-2B-MLX-oQ4e es una cuantizacion de 4 bits en formato MLX del modelo multimodal LFM3-Omni-2B desarrollado por Liquid AI. Se trata de un modelo any-to-any capaz de procesar y generar texto, audio e imagenes, lo que incluye reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y respuesta a preguntas sobre imagenes. Esta version concreta la publica el usuario Spiteman y esta optimizada para su ejecucion en Apple Silicon mediante la libreria MLX.

El modelo base emplea la arquitectura LFM3 de Liquid AI y cuenta con 2.166.928.384 parametros totales. Esta variante cuantizada reduce el peso de los pesos respecto al checkpoint original en BF16 (que ocupa 4,33 GB mas 0,15 GB del codec de audio), lo que facilita su despliegue en equipos con memoria unificada limitada. El repositorio ocupa 1,7 GB.

Su relevancia radica en que permite ejecutar localmente en Mac un modelo omni (texto, vision y audio) con soporte para 23 idiomas, incluyendo el castellano, sin depender de servicios en la nube. La licencia lfm1.0 condiciona el uso comercial, por lo que conviene revisarla antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer multimodal any-to-any, segun modelo base) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (oQ4e, formato MLX); el modelo base tambien existe en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX), mas codec de audio en `audio_tokenizer/` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B mas alla de su caracter multimodal any-to-any y su pertenencia a la familia LFM3 de Liquid AI. El modelo procesa y genera texto, audio e imagenes, e incorpora un codec de audio separado en el directorio `audio_tokenizer/` que ocupa aproximadamente 0,15 GB en la version BF16.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Esta version concreta es una cuantizacion de 4 bits (oQ4e) del checkpoint original, por lo que no aporta cambios arquitectonicos: unicamente reduce la precision de los pesos para optimizar el uso de memoria en Apple Silicon. El autor no documenta el proceso de cuantizacion empleado mas alla de la etiqueta oQ4e.

## Capacidades

- Generacion de texto con decodificacion greedy (`--temperature 0`) para respuestas deterministas.
- Reconocimiento automatico del habla (ASR) a partir de ficheros de audio WAV.
- Sintesis de voz (TTS) con salida en WAV a 24 kHz, con control de voz e idioma mediante system prompts (por ejemplo, voz femenina en ingles americano).
- Respuesta a preguntas sobre imagenes (VQA) basada en el contenido visual.
- Procesamiento any-to-any: combinacion de entradas de texto, audio e imagen con salidas de texto o audio.
- Soporte multilingue en 23 idiomas, incluidos castellano, ingles, arabe, chino, frances, aleman, japones, coreano, portugues, hindi y ruso, entre otros.
- Control de generacion de audio mediante parametros como `audio_temperature` (0,4 por defecto) y `audio_repetition_penalty` (1,2 por defecto).
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento agentico multi-paso.

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede ejecutar ASR sobre ficheros de audio mediante MLX-VLM con un system prompt especifico, lo que permite transcribir conversaciones en un Mac sin enviar datos a servicios externos.
- Lectura de documentos en voz alta: la capacidad de TTS con salida WAV a 24 kHz permite convertir texto en audio con control de voz e idioma, util para accesibilidad o consumo de contenido.
- Asistentes de voz para macOS: al combinar ASR y TTS en un mismo modelo any-to-any, se puede construir un bucle de speech-to-speech local para prototipos de asistente conversacional.
- Descripcion y analisis de imagenes: la funcion de VQA permite responder preguntas sobre capturas, fotografias o documentos escaneados, adecuada para herramientas de accesibilidad o extraccion de informacion visual.
- Prototipado de aplicaciones multimodales en Apple Silicon: al estar en formato MLX y ocupar 1,7 GB, es viable experimentar con pipelines de texto, audio y vision en un portatil con memoria unificada.
- Traduccion y atencion multilingue: con 23 idiomas soportados, puede emplearse para transcripcion o sintesis en castellano y otras lenguas en entornos donde no se permite el uso de la nube.
- Investigacion en modelos omni de pequeno tamano: sirve como referencia cuantizada para comparar el impacto de la cuantizacion 4-bit en tareas de audio y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 1,7 GB en cuantizacion 4-bit, a lo que hay que sumar el codec de audio y el overhead de inferencia. La version BF16 del mismo modelo requiere 4,33 GB de pesos mas 0,15 GB del codec.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA en esta variante.
- Cabe en equipos consumer: si, en Mac con memoria unificada suficiente (8 GB o mas recomendable para margen).
- Despliegue: libreria MLX y MLX-VLM. El soporte de LFM3-Omni en MLX-VLM estaba en desarrollo segun la model card, por lo que puede requerir una version concreta de esa herramienta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-oQ4e (este) | 2,17 B | no disponible | texto, audio, imagen | lfm1.0 | MLX 4-bit |
| LiquidAI/LFM3-Omni-2B (base) | 2,17 B | no disponible | texto, audio, imagen | lfm1.0 | BF16 |
| LFM3-Omni-2B-MLX-bf16 | 2,17 B | no disponible | texto, audio, imagen | lfm1.0 | MLX BF16 |

No se dispone de datos de rendimiento ni de modelos alternativos comparables fuera de la propia familia LFM3 en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede degradar la calidad respecto al checkpoint BF16, especialmente en tareas de audio y vision; no se documenta la magnitud de esa perdida.
- No hay datos publicados de benchmarks que permitan estimar la fiabilidad del modelo.
- El soporte en MLX-VLM estaba en progreso en el momento de publicacion de la model card, por lo que la integracion puede presentar problemas.
- La licencia lfm1.0 es de tipo "other" y condiciona el uso comercial; es imprescindible revisar el fichero LICENSE antes de desplegarlo en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; en VQA el propio autor recomienda basar las respuestas solo en lo visible en la imagen mediante system prompt.
- No se documentan sesgos conocidos ni limitaciones especificas de contexto o idioma mas alla de la lista de lenguas soportadas.
- El modelo esta pensado para Apple Silicon; no es portable directamente a CUDA sin conversion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spiteman/LFM3-Omni-2B-MLX-oQ4e
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Version MLX BF16: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-bf16
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
