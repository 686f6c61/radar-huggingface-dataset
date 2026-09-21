# suryatmodulus/nemotron-3.5-asr-streaming-0.6b

## Resumen

Nemotron 3.5 ASR es un modelo de reconocimiento automatico del habla (ASR) multilingue y en streaming, basado en la arquitectura FastConformer con decodificador RNNT (Recurrent Neural Network Transducer) y diseno "cache-aware" para inferencia en tiempo real. El repositorio analizado (suryatmodulus/nemotron-3.5-asr-streaming-0.6b) es una publicacion de la familia Nemotron de NVIDIA, segun declara la propia model card, que lo describe como la extension multilingue de nvidia/nemotron-speech-streaming-en-0.6b, anadiendo condicionamiento por prompt de identificacion de idioma (langID) para transcribir 40 configuraciones de idioma-localizacion con un unico modelo.

El modelo tiene 637.997.088 parametros reales (unos 638 M, ~0,6 B), lo que lo situa en la gama ligera de ASR, apto para despliegue en GPU de consumo e incluso CPU. Esta pensado para transcripcion de baja latencia en flujos de audio continuos, con transcripcion incremental por fragmentos (chunks) en lugar de procesar el audio completo de una vez. En los benchmarks declarados por el autor se evalua con un tamano de trama de 1,12 s y activacion de langID, obteniendo valores de WER en FLEURS que van desde 4,11 en espanol hasta 9,03 en frances.

Su relevancia actual radica en combinar ASR multilingue, streaming con cache y una huella de parametros reducida, lo que permite alimentar aplicaciones de subtitulado en vivo, asistentes de voz y pipelines de transcripcion masiva con coste de computo bajo. La licencia es OpenMDW-1.1 (licencia de pesos abiertos de NVIDIA), un punto a revisar segun el uso comercial previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware con decodificador RNNT (transducer) |
| Parametros totales | 637.997.088 (~638 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR en streaming; los benchmarks usan trama de 1,12 s) |
| Tipos de cuantizacion | safetensors (precision del repo) y GGUF (segun tags); niveles concretos no detallados |
| Idiomas soportados | 40 idioma-localizaciones declarados en la model card; 35 codigos de idioma listados en la metadata |
| Licencia | OpenMDW-1.1 (license: other, license_name: openmdw-1.1) |
| Formato de pesos | safetensors, GGUF (NeMo; libreria `nemo`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder FastConformer (variante de Conformer con atencion de submuestreo y bloques convolucionales) acoplado a un decodificador RNNT. La caracteristica denominada "cache-aware" implica que el encoder mantiene un estado de cache entre fragmentos de audio, de modo que puede procesar el flujo de forma incremental sin recalcular todo el contexto previo, lo que reduce la latencia y el coste computacional en streaming. El condicionamiento por langID permite que un mismo conjunto de pesos atienda multiples idiomas, pasando la identificacion del idioma como prompt al decoder.

Los conjuntos de datos de entrenamiento declarados en la metadata son nvidia/Granary, multilingual_librispeech, FLEURS, mozilla-foundation/common_voice_8_0, VoxPopuli y Europarl, todos ellos corpus de habla multilingue y de dominio diverso. La model card disponible esta truncada, por lo que no se especifican el numero exacto de tokens/horas de audio, la composicion detallada del dataset, ni si hubo etapas de RLHF/DPO u otras tecnicas de alineamiento; estos datos se consideran **no disponibles**. Los articulos arXiv referenciados en los tags (2312.17279 y 2305.05084) estan asociados al modelo en la metadata, aunque el contenido de la card proporcionada no detalla sus contribuciones.

## Capacidades

- Reconocimiento automatico del habla multilingue en 40 configuraciones de idioma-localizacion con un solo modelo.
- Transcripcion en streaming de baja latencia, con procesamiento por fragmentos y estado de cache.
- Condicionamiento por identificacion de idioma (langID) mediante prompt.
- Salida con puntuacion y etiquetado automatico de idioma, segun la descripcion de la card ("punctuated text with an automatic language tag").
- Inferencia en tiempo real orientada a audio continuo (no solo ficheros completos).
- Etiqueta de pipeline `automatic-speech-recognition` y `feature-extraction`; tambien marcado como `speech-recognition` en tags.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio generativo: son funciones propias de un modelo ASR especializado, no de un LLM.

## Casos de uso

- Subtitulado en vivo: el modelo transcribe audio por fragmentos manteniendo cache, lo que permite emitir texto incremental en retransmisiones, reuniones o eventos con baja latencia.
- Atencion al cliente por voz: integrar el modelo como motor ASR de un sistema IVR multilingue, aprovechando el condicionamiento por langID para no cambiar de modelo al alternar idiomas.
- Transcripcion masiva de archivos de audio: al tener ~638 M de parametros, se puede ejecutar por lotes en GPU de gama media para procesar grandes volumenes de grabaciones con coste contenido.
- Generacion de actas y notas de reunion: transcripcion multilingue de conversaciones con etiquetado de idioma para posterior resumen con un LLM.
- Accesibilidad (subtitulos automaticos): generacion de subtitulos para contenido audiovisual, con soporte de varios idiomas europeos y asiaticos.
- Analitica de contact center: conversion de llamadas a texto para busqueda, cumplimiento y analisis de sentimiento, con foco en idiomas como espanol, aleman, frances e italiano con WER bajo-medio en FLEURS.
- Sistemas de dictado y asistentes de voz locales: al caber en hardware modesto, permite despliegues on-premise o en el borde sin enviar audio a la nube.
- Enriquecimiento de pipelines de datos: transcripcion de corpus de audio para construir datasets de entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER sobre FLEURS, split de test, trama de 1,12 s, con langID). La metadata de la model card incluye un subconjunto de idiomas; los valores se reproducen tal cual:

| Dataset (FLEURS) | Config | WER | Trama / condicion |
|---|---|---|---|
| Ingles | en_us | 7,91 | 1,12 s, LangID |
| Espanol | es_419 | 4,11 | 1,12 s, LangID |
| Frances | fr_fr | 9,03 | 1,12 s, LangID |
| Italiano | it_it | 4,25 | 1,12 s, LangID |
| Portugues | pt_br | 5,48 | 1,12 s, LangID |
| Aleman | de_de | 8,31 | 1,12 s, LangID |
| Hindi | hi_in | 6,81 | 1,12 s, LangID |
| Coreano | ko_kr | 7,12 | 1,12 s, LangID |

No se han publicado en la informacion disponible resultados comparativos adicionales (por ejemplo, sobre LibriSpeech, Common Voice o VoxPopuli), ni cifras de latencia o throughput concretas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~638 M de parametros): aproximadamente 2,5 GB en FP32, ~1,3 GB en BF16/FP16 y en torno a 0,7 GB en cuantizacion de 8 bits. Son estimaciones de peso de parametros, no cifras oficiales.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090) es suficiente para una o varias instancias.
- Despliegue en servidor de alto rendimiento: la model card menciona comparativas de flujos concurrentes en una unica H100 frente a Parakeet RNNT, lo que indica que el modelo esta disenado para escalar en GPU de centro de datos (A100, H100). Las cifras concretas de concurrencia no se recogen en la informacion disponible.
- CPU: al ser un modelo de ~0,6 B, es viable su ejecucion en CPU para transcripcion offline o de baja concurrencia, aunque con mayor latencia.
- Opciones de despliegue: libreria NVIDIA NeMo (indicada como `library_name`), y por extension Riva y Triton Inference Server. Aunque los tags incluyen GGUF, el soporte de RNNT/FastConformer en runtimes tipo llama.cpp u Ollama no es estandar y debe verificarse antes de asumirlo.
- Latencia y throughput estimados: **no disponibles** en la informacion proporcionada; solo se indica cualitativamente que el modelo soporta streaming de baja latencia y multiples flujos concurrentes.

## Comparativa con modelos similares

Comparativa orientativa con alternativas del mismo segmento ASR. Los datos de los modelos comparados proceden de conocimiento general y pueden variar segun la version; los del modelo analizado provienen de la informacion proporcionada.

| Modelo | Parametros | Idiomas | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR streaming 0.6b (este) | ~638 M | 40 idioma-localizaciones (35 codigos) | Si (cache-aware) | OpenMDW-1.1 | Multilingue con condicionamiento langID |
| nvidia/nemotron-speech-streaming-en-0.6b | ~600 M (declarado en card) | Ingles | Si (cache-aware) | OpenMDW / NVIDIA (revisar) | Version monolingue de la que deriva este modelo |
| NVIDIA Parakeet RNNT (1.1B) | ~1,1 B | Ingles (principales variantes) | Si | NVIDIA (revisar) | Usado como referencia en las graficas de throughput de la card |
| OpenAI Whisper large-v3 | ~1,55 B | ~99 idiomas | No nativo (procesa audio completo) | MIT | Referencia no streaming; datos aproximados |

Los valores de parametros e idiomas de los modelos comparados son aproximados y deben confirmarse en sus respectivas fichas.

## Limitaciones y advertencias

- La model card disponible esta truncada, por lo que faltan detalles de entrenamiento, evaluacion completa y limitaciones declaradas por el autor.
- El WER varía de forma notable segun el idioma (de 4,11 en espanol a 9,03 en frances en FLEURS); el rendimiento no es uniforme entre los 40 idiomas y el ingles no es el mejor caso.
- No se detallan sesgos conocidos ni evaluaciones por acento, dialecto, ruido ambiental o dominio especifico; existe riesgo de peor rendimiento fuera de los corpus de entrenamiento (FLEURS, Common Voice, VoxPopuli, Europarl, Granary).
- Riesgo de alucinacion y de sustitucion de palabras en audio ruidoso o con solapamiento de hablantes, inherente a cualquier modelo ASR.
- La licencia OpenMDW-1.1 es una licencia personalizada ("license: other"); es imprescindible revisar sus terminos en https://openmdw.ai/license/1-1/ antes de un uso comercial.
- El repositorio figura con 0 descargas y 0 "likes" y la fecha de creacion/actualizacion es 2026-09-21; al ser una republicacion de un tercero (autor "suryatmodulus"), conviene contrastar la procedencia frente al repositorio oficial de NVIDIA.
- El soporte de los pesos GGUF depende del runtime; no debe asumirse compatibilidad con herramientas tipo llama.cpp u Ollama sin verificar.
- Al ser un modelo ASR especializado, no realiza razonamiento, generacion libre ni tool calling; requiere un LLM adicional para tareas posteriores (resumen, extraccion, traduccion).

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/suryatmodulus/nemotron-3.5-asr-streaming-0.6b
- Modelo de referencia monolingue: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Articulos arXiv referenciados en la metadata: https://arxiv.org/abs/2312.17279 y https://arxiv.org/abs/2305.05084
