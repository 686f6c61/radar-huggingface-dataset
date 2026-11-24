# StudioYebisu-ship-it/Drama-3-Japanese-speech-cpp-gguf

## Resumen

Drama-3-Japanese-speech-cpp-gguf es una coleccion de cuantizaciones GGUF del modelo de sintesis de voz Aratako/Drama-3-Japanese, un TTS de 35.774 millones de parametros basado en fishaudio/s2-pro y construido con Fish Audio. El autor de las cuantizaciones es StudioYebisu-ship-it y el objetivo es permitir inferencia local de clonacion de voz zero-shot y generacion de habla emocional en japones mediante los runtimes speech.cpp y audio.cpp, ambos basados en ggml.

El modelo es relevante porque democratiza el despliegue local de un TTS de gran tamano con arquitectura de mezcla de expertos (la nomenclatura "35B-A3B" indica aproximadamente 3 mil millones de parametros activos), ofreciendo variantes calibradas con imatrix estratificado para japones que van desde 9,09 GiB en IQ3_XXS hasta 24,57 GiB en Q5_K. Incluye parches especificos que reportan aceleraciones de hasta 2,96x en CUDA sobre una RTX 4090.

La ficha describe una cuantizacion, no el modelo original; los datos de arquitectura y entrenamiento se limitan a lo indicado en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basada en fishaudio/s2-pro, con mezcla de expertos (nomenclatura 35B-A3B); detalles internos no disponibles |
| Parametros totales | 35.774.376.977 |
| Parametros activos | aproximadamente 3 mil millones (segun nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | 8192 tokens de texto (`max_text_tokens` en el sidecar .gguf.json) |
| Tipos de cuantizacion | IQ3_XXS, Q4_K, Q5_K (hibridas: expertos en IQ3_XXS/Q4_K/Q5_K con Q8_0/F16/F32 en otras capas) |
| Idiomas soportados | japones (ja) |
| Licencia | fish-audio-community-license-1.0 |
| Formato de pesos | GGUF (ggml), con sidecar .gguf.json y ficheros .voice.gguf para prompts de voz |

## Arquitectura y entrenamiento

El modelo base Aratako/Drama-3-Japanese deriva de fishaudio/s2-pro y esta orientado a sintesis de voz expresiva en japones con clonacion zero-shot. La nomenclatura "35B-A3B" sugiere una arquitectura de mezcla de expertos con unos 35.774 millones de parametros totales y aproximadamente 3 mil millones activos por token, aunque la model card del repositorio de cuantizaciones no detalla la composicion interna (capas, atencion, codec de voz). El sidecar incluye un identificador de codec de voz (`voice_codec: 2cf2ec268a087bd2ad91bfbb6796b0429fb03a73cdb8fd07f445d503e9a14d37`), lo que indica una representacion discreta de audio tipo codec neural.

Las cuantizaciones se han calibrado con imatrix estratificado sobre japones, aplicando precisiones mixtas: los expertos se cuantizan a IQ3_XXS, Q4_K o Q5_K mientras que otras capas se mantienen en Q8_0, F16 o F32. El repositorio incluye parches para speech.cpp v0.11.2 (`drama3-speechcpp-fast.patch` y `drama3-small-speechcpp.patch`) que anaden compatibilidad con IQ3_XXS y optimizaciones CUDA con grafos (`GGML_CUDA_GRAPHS=ON`). No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el modelo original.

## Capacidades

- Sintesis de voz (text-to-speech) en japones con prosodia expresiva.
- Clonacion de voz zero-shot a partir de una muestra de referencia y su transcripcion, generando un fichero reutilizable `.voice.gguf`.
- Etiquetas de emocion y de escena en linea, segun TAG_LIST.md del modelo base, para controlar la interpretacion.
- Generacion de habla emocional (emotional-speech-generation) con control de pausas mediante variables como `SPEECH_DRAMA3_MAX_PAUSE_FRAMES`.
- Servidor HTTP local incluido en speech.cpp (`speech serve`) para integracion como servicio.
- Modo de diseno de voz solo por texto ademas del modo de clonacion por referencia.
- Soporte de inferencia en CPU, Vulkan y CUDA (con restricciones de backend segun cuantizacion).

## Casos de uso

- Audiolibros y narracion en japones: el modelo genera habla expresiva con etiquetas de emocion y escena, adecuado para narraciones largas gracias a los 8192 tokens de contexto de texto.
- Clonacion de voz para doblaje: extrayendo un `.voice.gguf` de una muestra de referencia se puede sintetizar el mismo timbre de forma consistente, util para localizacion de contenido al japones.
- Asistentes de voz y agentes conversacionales en japones: el servidor local de speech.cpp permite desplegar un endpoint HTTP de TTS en infraestructura propia.
- Prototipado de videojuegos y personajes: las etiquetas de emocion y escena permiten variar la interpretacion de un mismo personaje sin reentrenar.
- Accesibilidad y lectura de textos: conversion de documentos a audio en japones con control de pausas para mejorar la comprension.
- Investigacion en TTS: las cuantizaciones IQ3_XXS permiten ejecutar un modelo de 35B en GPUs de 16-24 GB, facilitando experimentos de clonacion y evaluacion acustica en hardware de consumo.
- Generacion de voces para contenido educativo o podcasts en japones con prosodia controlada por semilla (`--seed`) para reproducibilidad.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), pero si mediciones de velocidad de inferencia del parche CUDA sobre una RTX 4090 con CUDA 12.8, usando `Drama-35B-A3B-Japanese-v3-small-IQ3_XXS.gguf` y `--experts-on-cpu=false`:

| Caso | Base RTFx | Base audio / wall / TTFA | Base dVRAM | Fast RTFx | Fast audio / wall / TTFA | Fast dVRAM | Aceleracion |
|---|---|---|---|---|---|---|---|
| narration | 1,19 | 5,712 s / 4,817 s / 0,403 s | +11,63 GiB | 3,17 | 2,601 s / 0,820 s / 0,280 s | +10,87 GiB | 2,68x |
| clone_jvnv | 1,26 | 6,223 s / 4,948 s / 0,418 s | +11,69 GiB | 3,68 | 5,759 s / 1,564 s / 0,292 s | +10,89 GiB | 2,93x |
| pause_clamp | 1,40 | 13,235 s / 9,434 s / 0,321 s | +11,60 GiB | 4,18 | 12,678 s / (wall no disponible en el extracto) | no disponible | no disponible |

La model card indica una aceleracion agregada de aproximadamente 2,96x en CUDA. No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (pesos + reserva de computo/KV de aproximadamente 2,40 GiB):
  - Q4_K: aproximadamente 23,21 GiB en GPU completa.
  - Q5_K: aproximadamente 26,96 GiB en GPU completa.
  - small-IQ3_XXS: aproximadamente 11,48 GiB (apto para GPUs de 16-24 GB).
  - Variante audio.cpp IQ3_XXS: aproximadamente 11-12 GiB.
- GPU recomendadas: para Q4_K/Q5_K se requiere GPU de 24 GB o mas con Vulkan o CPU; en GPUs de escritorio de 24 GB con 19-21 GiB libres, Q4_K desborda 6-10 capas de expertos (aproximadamente 0,42 GiB por capa) a CPU. Para CUDA se recomienda usar small-IQ3_XXS en GPUs de 16-24 GB (probado en RTX 4090).
- Aviso de backend: Q4_K y Q5_K no deben ejecutarse en CUDA con el ggml-cuda upstream, ya que `block_q8_1.ds` en FP16 desborda en `ffn_down_exps` y provoca aserciones de "not finite numbers". Usar Vulkan (con `GGML_VK_DISABLE_F16=1`, `GGML_VK_DISABLE_COOPMAT=1`, `GGML_VK_DISABLE_COOPMAT2=1`) o CPU.
- Opciones de despliegue: speech.cpp v0.11.2+ (CPU, Vulkan, CUDA con parche), audio.cpp (CUDA), servidor HTTP integrado en speech.cpp.
- Latencia y throughput: con small-IQ3_XXS y parche fast en RTX 4090, RTFx de 3,17-4,18 y TTFA de 0,280-0,403 s segun caso; sin parche, RTFx de 1,19-1,40 y TTFA de 0,321-0,418 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Drama-3-Japanese-speech-cpp-gguf (esta ficha) | 35.774 M totales, ~3B activos | 8192 tokens de texto | ja | fish-audio-community-license-1.0 | GGUF / speech.cpp, audio.cpp |
| Aratako/Drama-3-Japanese (modelo base) | 35.774 M totales, ~3B activos | no disponible | ja | fish-audio-community-license-1.0 | pesos originales (no disponible el formato exacto) |
| fishaudio/s2-pro (modelo de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros TTS en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; no hay capacidades multilingues documentadas.
- La licencia fish-audio-community-license-1.0 es de tipo comunitario y puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- Riesgo de alucinacion acustica y prosodia inconsistente en entradas largas o con etiquetas de emocion mal formadas; la clonacion por referencia produce resultados mas limpios que el diseno de voz solo por texto.
- Q4_K y Q5_K no son fiables en CUDA con ggml-cuda upstream por desbordamiento en FP16; requieren Vulkan o CPU.
- En GPUs de 24 GB con Windows y VRAM libre limitada, Q4_K desborda capas de expertos a CPU, degradando latencia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion comunitaria publica de la calidad de las cuantizaciones.
- El modelo esta etiquetado como region us; pueden aplicarse restricciones de exportacion o uso segun jurisdiccion.
- No se han publicado evaluaciones de sesgo, robustez ni similitud de hablante; se recomienda validacion propia antes de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StudioYebisu-ship-it/Drama-3-Japanese-speech-cpp-gguf
- Modelo base: https://huggingface.co/Aratako/Drama-3-Japanese
- Lista de etiquetas de emocion y escena: https://huggingface.co/Aratako/Drama-3-Japanese/blob/main/TAG_LIST.md
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- audio.cpp: https://github.com/JarodMica/audio.cpp
