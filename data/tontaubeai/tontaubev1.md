# TontaubeAI/TontaubeV1

## Resumen

TontaubeV1 es un modelo de texto a voz (TTS) multilingüe desarrollado por TontaubeAI, orientado a clonación de voz expresiva, generación de audio de formato largo y streaming de baja latencia. No es un modelo de lenguaje generativo al uso, sino un sistema de predicción de tokens de audio construido sobre troncales transformer derivados de Qwen3: un CB0 de 28 bloques y 2.048 de anchura a partir de Qwen3-1.7B, y tres predictores acústicos CB1–CB3 progresivamente más someros (16, 8 y 4 bloques, 1.024 de anchura) derivados de Qwen3-0.6B. El conjunto suma 2.873.962.498 parámetros almacenados.

La arquitectura sustituye la capa de salida del modelo de lenguaje heredado por una cabeza de dos capas que emite tokens de audio, y los cuatro flujos resultantes se decodifican con DualCodec; la ruta de inferencia publicada emplea además el codificador y decodificador acústico de VibeVoice. El texto hablado se tokeniza a nivel de carácter, mientras que los controles de idioma y estilo de habla se codifican con BPE compacto. Los estilos públicos son `audiobook`, `conversational` y `agentic`.

Es relevante porque cubre un hueco poco frecuente: clonación zero-shot con hasta 60 segundos de referencia, generación de formato largo con contexto acotado y streaming en MP3 u Opus, todo con pesos abiertos bajo una licencia comunitaria propia. El repositorio ocupa 6,0 GB y los checkpoints no son compatibles con `AutoModelForCausalLM`: requieren el adaptador de vLLM específico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multi-predictor de tokens de audio (CB0 semantico + CB1-CB3 acusticos), troncales derivados de Qwen3, decodificacion DualCodec y codec acustico de VibeVoice |
| Parametros totales | 2.873.962.498 |
| Parametros activos | no disponible (no es MoE; los cuatro predictores se ejecutan en cascada) |
| Longitud de contexto | no disponible (la model card indica generacion de formato largo con contexto acotado, sin cifra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, es, fr, it, nl, pt (primarios: ingles y aleman) |
| Licencia | tontaube-community-model-license-1.0 (etiqueta `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se organiza en cuatro predictores causales de codebook. CB0 (28 bloques, anchura 2.048, 1.829.116.930 parametros) genera audio semantico y duracion a partir del texto; CB1 (16 bloques, 1.024, 448.960.512 parametros), CB2 (8 bloques, 1.024, 327.307.264 parametros) y CB3 (4 bloques, 1.024, 268.577.792 parametros) anaden detalle acustico de forma progresiva. En total son 56 bloques transformer. Cada predictor sustituye la capa de salida del modelo de lenguaje heredado por una cabeza de dos capas para tokens de audio.

La entrada de texto se tokeniza a nivel de caracter, y los controles de idioma y estilo de habla se codifican con BPE compacto, lo que permite condicionar el estilo (`audiobook`, `conversational`, `agentic`) sin cambiar el texto. Los cuatro flujos de salida se decodifican con DualCodec, y la ruta de inferencia publicada utiliza el codificador y decodificador acustico de VibeVoice. La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa. El muestreo semantico por defecto es temperatura 0,8, con 0,6 orientado a correccion textual y valores cercanos a 1,0 a mayor expresividad.

## Capacidades

- Sintesis de voz multilingue en ingles, aleman, espanol, frances, italiano, neerlandes y portugues.
- Clonacion de voz zero-shot a partir de 5 a 60 segundos de audio de referencia limpio y de un solo hablante.
- Voces sinteticas incluidas en el paquete, sin necesidad de referencia.
- Tres estilos de habla publicos: `audiobook`, `conversational` y `agentic`.
- Generacion de formato largo con contexto acotado (bounded-context long-form generation).
- Salida en WAV y streaming de baja latencia en MP3 u Opus.
- Verbalizador de texto en ingles opcional, distribuido por separado como `TontaubeAI/TontaubeV1-Verbalizer`.
- Control de expresividad y fidelidad al texto mediante la temperatura de muestreo semantico.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni vision o audio de entrada mas alla de la referencia de voz.

## Casos de uso

- Audiolibros y narracion larga: el estilo `audiobook` junto con la generacion de formato largo permite sintetizar capitulos completos manteniendo consistencia de voz, usando una unica referencia clonada de hasta 60 segundos.
- Asistentes de voz conversacionales: el estilo `conversational` y el streaming en Opus o MP3 de baja latencia encajan en pipelines de respuesta hablada donde el tiempo hasta el primer audio es critico.
- Agentes telefonicos y atencion al cliente: el estilo `agentic` esta pensado para locuciones de sistema y respuestas de agente; la clonacion permite fijar una voz de marca reproducible en cada llamada.
- Doblaje y localizacion a siete idiomas: al soportar en, de, es, fr, it, nl y pt con el mismo checkpoint, se puede mantener una voz de referencia y generar la misma locucion en distintos mercados.
- Accesibilidad y lectura de contenido: conversion de articulos, documentacion o boletines a audio con voces sinteticas incluidas, sin necesidad de grabar referencias.
- Prototipado de productos de voz: el playground alojado y el servidor local con endpoint `/predict` permiten validar calidad y latencia antes de integrar el modelo en produccion.
- Generacion de material formativo y demos: la clonacion acotada a 60 segundos facilita producir locuciones con la voz de un ponente autorizado sin sesiones de grabacion extensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 6,0 GB en safetensors, lo que da una cota inferior orientativa para cargar los pesos en precision de almacenamiento; el consumo real depende del codec, del adaptador de vLLM y del buffer de streaming, y no esta documentado.
- GPU recomendadas: no disponible. La model card no especifica modelos de GPU ni minimos de memoria.
- Compatibilidad con GPU de consumo: no confirmada. Con 2.873.962.498 parametros y 6,0 GB de pesos, es plausible en tarjetas de 12-16 GB o superiores, pero el fabricante no lo certifica.
- Opciones de despliegue: exclusivamente mediante el adaptador de vLLM del repositorio de inferencia `craitech/tontaube`, rama `v1.0.0`, ejecutado con `uv run --python 3.12 --frozen tontaube serve`. No son checkpoints compatibles con `AutoModelForCausalLM`; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card menciona streaming de baja latencia en MP3 y Opus, pero sin cifras de tiempo hasta el primer audio ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| TontaubeV1 | 2.873.962.498 | no disponible | en, de, es, fr, it, nl, pt | tontaube-community-model-license-1.0 | vLLM con adaptador propio |
| Alternativas de TTS multilingue con clonacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de modelos comparables de la misma categoria (TTS multilingue con clonacion zero-shot y pesos abiertos), por lo que no se ofrece una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor. Al ser un modelo de voz, puede reproducir sesgos de acento, genero y prosodia presentes en los datos de entrenamiento, que tampoco se detallan.
- Alucinacion y fidelidad: la propia model card advierte de que temperaturas cercanas a 1,0 aumentan la variacion expresiva y pueden degradar la correccion respecto al texto; recomienda 0,6 cuando prima la fidelidad.
- Clonacion de voz: exige audio limpio, de un solo hablante y entre 5 y 60 segundos; referencias ruidosas o con multiples hablantes degradan el resultado. El uso de voces de terceros sin consentimiento plantea riesgos legales y eticos.
- Idioma: ingles y aleman son los idiomas primarios; es, fr, it, nl y pt estan soportados pero no se declaran como principales, sin datos de calidad por idioma.
- Licencia: `tontaube-community-model-license-1.0`, una licencia propia distinta de las licencias abiertas habituales. Es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; no se puede asumir permisividad tipo Apache o MIT.
- Dependencia de runtime: los checkpoints no funcionan con cargadores genericos; requieren el adaptador de vLLM y el layout de entrada del repositorio de inferencia, lo que limita la portabilidad y ata el despliegue a una version concreta (`v1.0.0`).
- Verbalizador opcional: la normalizacion de texto en ingles se distribuye como modelo aparte y solo se descarga si se activa, de modo que sin el la calidad de verbalizacion en ingles puede diferir.
- Madurez: el modelo tiene 0 descargas y 9 likes en el momento de la consulta, y la model card esta truncada en el apartado de arquitectura, lo que limita la verificacion independiente de detalles tecnicos.
- Ausencia de benchmarks: no hay resultados publicados que permitan validar calidad objetiva frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontaubeAI/TontaubeV1
- Licencia: https://huggingface.co/TontaubeAI/TontaubeV1/blob/main/LICENSE
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08703
- Repositorio de inferencia: https://github.com/craitech/tontaube
- Playground oficial: https://tontaube.ai/playground
- Verbalizador opcional en ingles: https://huggingface.co/TontaubeAI/TontaubeV1-Verbalizer
