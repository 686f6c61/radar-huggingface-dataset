# Stealth-org/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, disenado especificamente para escenas con multiples personajes y contenido de formato largo. A diferencia de los sistemas TTS clasicos, emplea un backbone de texto de tipo Mixture-of-Experts (MoE) de 35.900 millones de parametros totales con solo 3.000 millones activos por token, lo que permite un rendimiento de inferencia propio de un modelo mucho mas pequeno.

El modelo combina ese backbone textual con un decodificador de audio basado en codebooks (Codebook-MTP) que decodifica 10 codebooks de forma causal sobre toda la secuencia. Esto le permite generar hasta 16 personajes distintos en un mismo texto mediante etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), clonar voces a partir de una referencia corta y controlar la emocion y los eventos no verbales mediante etiquetas en el texto.

Su relevancia actual radica en que cubre un caso de uso poco atendido: la produccion de audio multi-voz de formato largo (audiolibros, doblaje, podcasts, dramatizaciones) con control en lenguaje natural y edicion por continuacion. Se distribuye bajo la licencia de investigacion de Fish Audio, con soporte de dia uno en SGLang-Omni y vLLM-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto MoE con atencion hibrida (full + linear); decodificador de audio Codebook-MTP |
| Parametros totales | 35.899.643.008 (aprox. 35,9 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para los expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | 88 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, nl, hi, th, vi, tr, pl, sv, fi, da, he, id, uk, cs, ro, hu, el, bg, ca, gl, eu, cy y otros |
| Licencia | fish-audio-research-license (licencia de investigacion, no comercial directa) |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Tamano del repositorio | 41,5 GB |
| Etiquetas de hablante | `<|speaker:0|>` a `<|speaker:15|>` (hasta 16 personajes) |

## Arquitectura y entrenamiento

Drama 3 se articula en dos componentes. El primero es un backbone de texto de tipo transformer con mezcla de expertos (MoE) y atencion hibrida que combina capas de atencion completa con capas de atencion lineal, lo que reduce el coste computacional en secuencias largas. De los 35,9 B de parametros totales, solo 3 B se activan por token, lo que explica el throughput medido. Los expertos MoE se almacenan en FP8 mientras que el resto de pesos permanece en bf16, una decision de diseno orientada a reducir la huella de memoria sin degradar la calidad del decodificador.

El segundo componente es un decodificador de audio Codebook-MTP (multi-token prediction) que decodifica 10 codebooks de forma causal sobre la secuencia completa, en lugar de generar cada codebook de forma independiente. Esto permite modelar la estructura acustica de forma conjunta y sostener coherencia de voz a lo largo de textos largos, que se trocean automaticamente y pueden emitirse en streaming por fragmentos. La edicion de audio se plantea como continuacion: se envian los tokens VQ de tomas anteriores junto con el texto nuevo, de modo que el modelo reescribe solo lo necesario manteniendo el contexto previo. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz multihablante con hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:N|>`.
- Clonacion de voz a partir de un clip de referencia corto (el ejemplo de la model card usa 3,9 s) con su transcripcion.
- Control en lenguaje natural de emociones y eventos no verbales mediante etiquetas puntuales en el texto, como `[sighs]` o `[laughs]`.
- Edicion de audio por continuacion: se envian las tomas anteriores como contexto y el modelo regenera la toma nueva conservando la coherencia.
- Generacion de contenido de formato largo con troceado automatico del texto y streaming por fragmentos.
- Soporte multilingue en 88 idiomas, con especial cobertura de lenguas europeas, asiaticas y africanas.
- Salida de audio en streaming con baja latencia de primer audio.

## Casos de uso

- Audiolibros y ficcion sonora: el modelo puede narrar dialogos de hasta 16 personajes en un mismo texto usando etiquetas de hablante, manteniendo voces diferenciadas y consistentes a lo largo de capitulos completos gracias al troceado automatico y al streaming por fragmentos.
- Doblaje y localizacion: con 88 idiomas y clonacion de voz, permite generar pistas dobladas conservando el timbre del actor original a partir de un clip de referencia y su transcripcion.
- Produccion de podcasts multi-voz: varios locutores sinteticos pueden alternar en un mismo guion con marcas de hablante, y las ediciones de guion se aplican por continuacion sin regenerar el audio ya validado.
- Edicion de audio en postproduccion: el flujo de `previous_takes` permite corregir una palabra o frase concreta (por ejemplo, cambiar "Wednesday" por "Thursday") manteniendo el resto de la toma intacta, lo que reduce el coste frente a regenerar el clip completo.
- Asistentes de voz y atencion al cliente: la latencia de primer audio inferior a 100 ms en un solo stream y el RTF de 0,131 en H200 hacen viable la conversacion en tiempo real con voz clonada de marca.
- Accesibilidad y lectura de contenido: conversion de articulos, documentacion o libros a audio con control emocional y eventos no verbales, util para plataformas de lectura asistida.
- Generacion de contenido para videojuegos: personajes con voces propias y reacciones emocionales etiquetadas en el guion, generadas bajo demanda en pipelines de produccion.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks academicos como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS. Si se publican metricas de rendimiento en produccion medidas sobre GPUs NVIDIA H200 con peticiones en streaming sobre prompts en ingles de Seed-TTS, con temperatura 1,0, top_p 0,9, top_k 30 y max_new_tokens 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF medio |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El throughput se mide en frames acusticos generados por segundo, TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envio de la peticion hasta el ultimo fragmento dividido por la duracion del audio devuelto.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 41,5 GB en safetensors, con expertos MoE en FP8 y el resto en bf16; se necesita al menos esa cantidad de memoria para cargar los pesos completos, mas el espacio de trabajo del decodificador de audio y del cache de atencion.
- GPU recomendadas: la model card mide el rendimiento en NVIDIA H200. Por tamano de memoria, se requiere una GPU de 80 GB (H100, H200, A100 80 GB) o varias GPUs para servir el modelo completo.
- GPU de consumo: no es viable en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion adicional no documentada; la informacion disponible no incluye variantes GGUF ni cuantizaciones de menor precision.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`), ambas con soporte desde el dia de lanzamiento.
- Latencia y throughput: en un solo H200, TTFA p50 de 88,9 ms y RTF de 0,131 con concurrencia 1; a concurrencia 16 se mantienen 927,6 frames/s con RTF de 0,373; a concurrencia 64 el throughput sube a 1.687,3 frames/s pero el RTF llega a 0,801 y el TTFA p95 supera el segundo.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros modelos TTS. Los datos de la model card no incluyen tablas frente a alternativas como otros sistemas de sintesis multihablante, por lo que la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| Fish Audio Drama 3 | 35,9 B totales / 3 B activos | no disponible | fish-audio-research-license | SGLang-Omni, vLLM-Omni |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es la fish-audio-research-license, una licencia de investigacion; el uso comercial requiere revisar los terminos del archivo LICENSE.md del repositorio y, previsiblemente, un acuerdo aparte con Fish Audio.
- No se han publicado datos sobre sesgos de generacion de voz por idioma, genero o acento; con 88 idiomas, la calidad puede variar de forma significativa entre lenguas con pocos recursos.
- Riesgo de artefactos acusticos y de inconsistencia de timbre en textos muy largos o en cambios frecuentes de hablante; la model card no documenta tasas de error.
- La clonacion de voz plantea riesgos de suplantacion y uso indebido; no se documentan en la informacion disponible mecanismos de marca de agua o deteccion de audio sintetico.
- No hay datos publicados sobre la longitud maxima de contexto soportada ni sobre el comportamiento con referencias de audio muy largas o ruidosas.
- El modelo no cabe en GPUs de consumo; el despliegue en produccion exige hardware de 80 GB o configuraciones multi-GPU, lo que limita su adopcion en entornos pequenos.
- Las metricas de rendimiento se han medido exclusivamente en H200 y con prompts en ingles; el rendimiento en otros idiomas y GPUs no esta documentado.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos y riesgos de memorizacion de voces concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stealth-org/drama-3
- Licencia: https://huggingface.co/Stealth-org/drama-3/blob/main/LICENSE.md
- Paper referenciado (arXiv:2610.18010): https://arxiv.org/abs/2610.18010
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Drama 3 Recipe (vLLM-Omni): https://recipes.vllm.ai/fishaudio/drama-3
