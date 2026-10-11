# subspecs/s2-pro-gguf

## Resumen

S2 Pro GGUF es una versión cuantizada en formato GGUF del modelo de síntesis de voz Fish Audio S2 Pro, publicada por el usuario subspecs a partir del modelo base fishaudio/s2-pro. Se trata de un modelo de text-to-speech (TTS) multilingüe con soporte de clonación de voz, empaquetado específicamente para inferencia local mediante s2.cpp, un motor de inferencia en C++/GGML sin dependencias de Python desarrollado por la comunidad. El repositorio ocupa 33,3 GB e incluye los pesos del transformer y el códec de audio en un único fichero GGUF por cuantización.

La arquitectura subyacente es Dual-AR, con aproximadamente 4.560 millones de parámetros: un componente Slow-AR de 36 capas basado en transformer Qwen3 (4,13B parámetros) con atención GQA de 32 cabezas y 8 cabezas KV, y un componente Fast-AR de 4 capas (0,42B parámetros) que genera 10 tokens de codebook acústico por paso semántico. El dato de parámetros reportado en safetensors para este repositorio asciende a 4.953.250.801.

Su relevancia actual radica en que permite ejecutar un sistema TTS con clonación de voz en hardware de consumo (desde 3-4 GB de VRAM en cuantizaciones bajas) sin depender de Python, aunque el propio autor lo marca explícitamente como ALFA y experimental, no apto para producción. La licencia Fish Audio Research License restringe el uso comercial sin licencia adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-AR: Slow-AR (transformer Qwen3 de 36 capas) + Fast-AR (transformer de 4 capas) + codec de audio convolucional RVQ |
| Parametros totales | 4.953.250.801 (segun safetensors); ~4,56B segun la model card (Slow-AR 4,13B + Fast-AR 0,42B) |
| Parametros activos | No aplica (no es MoE; arquitectura Dual-AR con dos componentes autoregresivos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, q8_0, q6_k, q5_k_m, q4_k_m, q3_k, q2_k |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | fish-audio-research-license (Fish Audio Research License, Copyright © 39 AI, INC.) |
| Formato de pesos | GGUF (con pesos del transformer y codec de audio en el mismo fichero); tokenizer.json aparte |

## Arquitectura y entrenamiento

El modelo base S2 Pro emplea una arquitectura Dual-AR de aproximadamente 4.560 millones de parametros. El componente Slow-AR es un transformer Qwen3 de 36 capas (4,13B parametros) que utiliza Grouped Query Attention con 32 cabezas de consulta y 8 cabezas KV, base RoPE de 1M y una cache KV persistente. El componente Fast-AR es un transformer de 4 capas (0,42B parametros) que genera 10 tokens de codebook acustico por cada paso semantico del Slow-AR. El codec de audio es un encoder/decoder convolucional RVQ con 10 codebooks de 4096 entradas cada uno.

Los ficheros GGUF de este repositorio fueron recuantizados con una version modificada de la herramienta `llama-quantize` con rutinas de cuantizacion mejoradas, segun indica el autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. El motor de inferencia, s2.cpp, es un proyecto en C++/GGML con backends de CPU, Vulkan, CUDA y Metal, sin dependencia de Python.

## Capacidades

- Generacion de voz (text-to-speech) multilingue de alta calidad.
- Clonacion de voz a partir de audio de referencia de 5 a 30 segundos (WAV o MP3) con transcripcion del audio de referencia.
- Sintesis condicionada por voz mediante los parametros `-pa` (audio de referencia) y `-pt` (transcripcion de la referencia).
- Ejecucion local sin Python mediante el motor s2.cpp con backends CPU, Vulkan, CUDA y Metal.
- Empaquetado de pesos del transformer y codec de audio en un unico fichero GGUF por cuantizacion.
- No se dispone de informacion sobre soporte de tool calling, agentes, modo thinking, vision u otras capacidades adicionales en la informacion proporcionada.

## Casos de uso

- Clonacion de voz para audiolibros y narracion: el modelo acepta una muestra de 5-30 segundos de una voz de referencia y sintetiza texto nuevo en esa misma voz, lo que permite producir narraciones largas con una identidad vocal consistente.
- Doblaje y localizacion de contenido multilingue: al ser un modelo multilingue, puede generar la misma locucion en varios idiomas manteniendo la clonacion de una voz dada, util para versionar videos o cursos.
- Asistentes de voz locales y privados: la inferencia en C++/GGML con backends Vulkan/CUDA/Metal permite integrar TTS en aplicaciones de escritorio sin enviar audio a servicios en la nube.
- Prototipado de interfaces conversacionales: su bajo requisito de VRAM (desde 3-4 GB en q4_k_m) permite probar rapidamente distintas voces y prosodias en una estacion de trabajo o portatil con GPU de gama media.
- Accesibilidad y lectura de textos: conversion de articulos, documentos o interfaces a audio con una voz personalizada, ejecutable en hardware de consumo.
- Investigacion en sintesis de voz: al estar bajo una licencia de investigacion, es adecuado para experimentos academicos sobre clonacion, prosodia y calidad de audio, no para productos comerciales sin licencia adicional.
- Generacion de voces para videojuegos o prototipos de personajes: la clonacion rapida permite crear voces de personajes para demos internas antes de contratar locucion definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, similitud de locutor, WER, latencia medida) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM recomendada segun cuantizacion (segun la model card):
  - ≥ 8 GB: q8_0 (fichero de 5,3 GB).
  - 6-8 GB: q6_k (fichero de 4,3 GB).
  - 4-6 GB: q5_k_m (fichero de 3,8 GB).
  - 3-4 GB: q4_k_m (fichero de 3,4 GB).
  - < 3 GB: q3_k (2,9 GB) o q2_k (2,4 GB); el autor advierte que la calidad se degrada.
  - Solo CPU: q4_k_m o inferior, con rendimiento lento.
- Fichero de mayor precision: f16 de 9,3 GB.
- Requisito de GPU: GPU con soporte Vulkan (AMD, NVIDIA o Intel) o CPU con RAM suficiente. El motor s2.cpp declara tambien backends CUDA y Metal.
- Modelo base de pesos: tokenizer.json (12 MB) debe descargarse por separado del GGUF.
- Opciones de despliegue: motor s2.cpp (compilado desde fuente con C++17 + CMake, opcion `-DS2_VULKAN=ON`); requiere clonar con submódulos y compilar el binario `s2`.
- Latencia y throughput: no disponibles. El autor no publica cifras.
- No se mencionan requisitos ni compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el unico motor documentado es s2.cpp.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto ni parametros de modelos alternativos en la informacion proporcionada. No es posible establecer una comparativa cuantitativa fiable con otros sistemas TTS (por ejemplo, variantes de Fish Speech, XTTS u otros) sin inventar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subspecs/s2-pro-gguf | 4.953.250.801 | No disponible | No disponible | fish-audio-research-license | HuggingFace (0 descargas, 0 likes al momento del registro) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Estado ALFA y EXPERIMENTAL: el autor declara explicitamente que el motor s2.cpp es un proyecto comunitario en fase temprana, con cambios incompatibles previsibles y no apto para produccion.
- Licencia restrictiva: la Fish Audio Research License permite uso gratuito solo para investigacion y fines no comerciales. El uso comercial requiere una licencia escrita separada de Fish Audio (business@fish.audio). Atribucion obligatoria: "This model is licensed under the Fish Audio Research License, Copyright © 39 AI, INC. All Rights Reserved."
- Degradacion de calidad en cuantizaciones bajas: q3_k y q2_k estan marcadas por el autor como opciones con calidad degradada, recomendadas solo por debajo de 3 GB de VRAM.
- Riesgo de uso indebido en clonacion de voz: la capacidad de clonar voces a partir de muestras cortas implica riesgos de suplantacion, fraude o deepfakes de audio; no se documentan en la model card mecanismos de mitigacion, marcas de agua ni filtros.
- Idiomas concretos no especificados: la model card solo indica "multilingual" sin detallar la lista de idiomas soportados ni la calidad por idioma.
- Requisitos de audio de referencia: la clonacion espera grabaciones limpias de 5-30 segundos en WAV o MP3; no se documenta el comportamiento con audio ruidoso, musica o multiples hablantes.
- Discrepancia de repositorio: el model card hace referencia a rutas del repositorio `rodrigomt/s2-pro-gguf` y a `LICENSE.md` en ese espacio, mientras que el ID de este repositorio es `subspecs/s2-pro-gguf`. Conviene verificar la procedencia y el fichero de licencia real antes de reutilizarlo.
- Recuento de descargas y likes nulo en el momento de la ficha: indicio de adopcion muy limitada y poca validacion externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, latencia ni similitud de locutor.
- La fecha de creacion del repositorio figura como 2026-10-11 en los metadatos, posterior a la fecha actual; conviene comprobar la coherencia de los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/subspecs/s2-pro-gguf
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Motor de inferencia s2.cpp (GitHub): https://github.com/rodrigomatta/s2.cpp
- Licencia (referenciada en la model card): https://huggingface.co/rodrigomt/s2-pro-gguf/blob/main/LICENSE.md
- Sitio de Fish Audio: https://fish.audio
- Contacto para licencia comercial: business@fish.audio
