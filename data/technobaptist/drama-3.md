# TechnoBaptist/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de sintesis de voz (text-to-speech) de nueva generacion desarrollado por Fish Audio, distribuido en HuggingFace bajo el identificador TechnoBaptist/drama-3. Esta disenado especificamente para escenas con multiples personajes y contenido de formato largo, e incorpora clonacion de voz, control en lenguaje natural y edicion de audio por continuacion sobre las tomas previas. Frente a los TTS clasicos, que dependen de etiquetas o marcado, Drama 3 acepta instrucciones y eventos escritos directamente en el texto (por ejemplo `[sighs]` o `[laughs]`) en la posicion exacta donde deben sonar.

Tecnicamente es un modelo MoE de aproximadamente 35.900 millones de parametros totales con unos 3.000 millones de parametros activos por token. El backbone de texto combina atencion completa y atencion lineal (hibrida) y se apoya en un decodificador de audio de tipo Codebook-MTP que genera 10 codebooks de forma causal sobre la secuencia completa. Los expertos MoE estan almacenados en FP8, mientras que el resto de pesos permanece en bf16, lo que reduce el peso en disco a 41,5 GB para el repositorio completo.

El modelo soporta hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`, trocea automaticamente el texto largo y permite streaming por fragmentos. Desde el dia de lanzamiento es compatible con SGLang-Omni, con un rendimiento medido en una H200 de 88,9 ms de latencia hasta el primer audio (p50) en concurrencia 1 y 1.687 frames acusticos por segundo en concurrencia 64. La licencia es fish-audio-research-license, de tipo research, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con backbone de texto de atencion hibrida (completa + lineal) y decodificador de audio Codebook-MTP de 10 codebooks con decodificacion causal |
| Parametros totales | 35.899.643.008 (aprox. 35,9 B) |
| Parametros activos | Aprox. 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE en FP8; resto de pesos en bf16. No se documentan formatos GGUF, AWQ, GPTQ ni cuantizaciones de menor precision |
| Idiomas soportados | 83 idiomas: zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (license: other) |
| Formato de pesos | safetensors (tag bsgemm-moe) |
| Tamano del repositorio | 41,5 GB |
| Pipeline declarado | text-to-speech |
| Fecha de publicacion segun metadatos | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

Drama 3 se construye sobre un backbone de texto de tipo Mixture of Experts con atencion hibrida, que combina capas de atencion completa con capas de atencion lineal. Esta mezcla persigue mantener la capacidad de modelado de contexto de la atencion densa reduciendo el coste computacional en secuencias largas, algo relevante cuando el texto de entrada se trocea en fragmentos y se genera audio de forma continua. El modelo activa aproximadamente 3.000 millones de parametros por token de un total cercano a 35.900 millones, y almacena los expertos en FP8 mientras mantiene el resto de la red en bf16; esa decision explica que un modelo de este tamano ocupe 41,5 GB en el repositorio.

La parte de audio no sigue el esquema habitual de un vocoder acoplado a un decodificador autoregresivo convencional: emplea un decodificador Codebook-MTP que produce 10 codebooks decodificados de forma causal sobre la secuencia completa, lo que permite tratar los tokens de audio (VQ) como si fuesen tokens de lenguaje. Esa eleccion habilita dos comportamientos poco frecuentes: la edicion como continuacion, enviando los tokens VQ de tomas anteriores como contexto, y la regeneracion de fragmentos conservando el audio circundante. El control de la generacion se realiza en lenguaje natural dentro del propio texto, con etiquetas de evento puntuales y etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`) que permiten hasta 16 personajes en una sola pasada.

No se dispone, en la informacion proporcionada, de datos sobre el numero de horas o tokens de audio empleados en el entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineamiento tipo RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de voz a partir de texto con salida de audio natural, incluyendo escenas con multiples personajes en una sola peticion.
- Multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` ... `<|speaker:15|>`.
- Clonacion de voz a partir de una referencia de audio acompanada de su transcripcion; los ejemplos de la model card clonan un clip de 3,9 s.
- Control en lenguaje natural: los eventos (por ejemplo `[sighs]`, `[laughs]`) se escriben dentro del texto y se sintetizan en la posicion exacta donde aparecen.
- Generacion emocional: la propia lista de tags del modelo incluye emotional-speech-generation.
- Edicion de audio como continuacion: se envian los tokens VQ y transcripciones de tomas previas (`previous_takes`) y el modelo regenera la toma manteniendo coherencia con el contexto, incluyendo ediciones encadenadas (cambiar una palabra y despues otra sobre el resultado anterior).
- Texto largo: troceado automatico con posibilidad de streaming por fragmentos.
- Cobertura multilingue amplia: 83 idiomas declarados, entre ellos espanol, ingles, chino, japones, coreano, portugues, arabe, ruso, frances y aleman.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni comportamiento de agente multi-paso; se trata de un modelo de sintesis de voz, no de un LLM de proposito general.
- No se documentan capacidades de vision, audio de entrada generativo distinto de la referencia de clonacion, ni modo de razonamiento explicito.

## Casos de uso

- Audiolibros y ficcion con varios personajes: un unico texto puede llevar hasta 16 voces diferenciadas mediante etiquetas de hablante, lo que evita encadenar llamadas separadas por personaje y mantiene la coherencia de la escena.
- Doblaje y localizacion: con 83 idiomas declarados y clonacion de voz, se puede reutilizar una voz de referencia y regenerar el audio en otro idioma conservando el timbre, sujeto a las condiciones de la licencia.
- Produccion de podcast y contenido largo: el troceado automatico y el streaming por fragmentos permiten procesar guiones extensos sin partir el flujo manualmente.
- Edicion de locucion sin regrabar: gracias a la edicion como continuacion, cambiar "Wednesday" por "Thursday" en una frase y despues "noon" por "five" sobre el resultado, pasando las tomas previas como contexto.
- Asistentes de voz y atencion al cliente: con TTFA p50 de 88,9 ms en concurrencia 1, la primera respuesta de audio llega en menos de 100 ms, lo que encaja en dialogos interactivos.
- Videojuegos y personajes interactivos: el control por lenguaje natural y las etiquetas de evento permiten disparar reacciones no verbales (suspiros, risas) en momentos concretos del guion sin edicion posterior.
- Generacion de voces sinteticas para datos de entrenamiento: la clonacion multiplilingue y el soporte de 16 hablantes por pasada facilitan crear corpus de voz diversos, siempre dentro de los limites de la licencia de investigacion.
- Postproduccion de accesibilidad: conversion de articulos o documentacion a version audio con voces consistentes y eventos expresivos insertados en el punto exacto del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas del tipo MMLU, HumanEval o GSM8K (no aplicables a un TTS) ni evaluaciones objetivas de calidad de audio frente a otros modelos.

Si se proporcionan mediciones de rendimiento en produccion sobre una GPU NVIDIA H200, con peticiones en streaming sobre prompts en ingles de Seed-TTS. Cada peticion clona una voz desde una referencia pre-codificada (`vq_codes` con su transcripcion) y usa `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500.

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Estos datos corresponden a la media de cuatro ejecuciones por celda. En concurrencia 16 el audio se genera aproximadamente 2,7 veces mas rapido de lo que se reproduce, y en concurrencia 64 el RTF medio se mantiene en 0,80. La model card menciona ademas una segunda tabla comparando dos ubicaciones del vocoder a alta concurrencia (1.088 peticiones por nivel de concurrencia, media de seis series), pero su contenido no esta disponible en el extracto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 41,5 GB con expertos en FP8 y resto en bf16, por lo que se necesita un minimo practico en torno a 40-50 GB de VRAM solo para pesos, mas el espacio de cache KV y el descompresor de audio. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- GPU recomendadas: NVIDIA H200 es la plataforma de referencia de las mediciones publicadas. Por capacidad, H100 80 GB y A100 80 GB son las opciones equivalentes dentro de la misma clase.
- No cabe en GPU de consumo: una RTX 4090 de 24 GB o una RTX 5090 no pueden alojar los 41,5 GB de pesos en las precisones documentadas, y no se han publicado variantes GGUF o cuantizadas a 4 bits que lo hicieran viable.
- Opciones de despliegue: SGLang-Omni es la via soportada desde el lanzamiento (`git clone https://github.com/sgl-project/sglang-omni.git`, `uv pip install --prerelease=allow -v -e ".[fishaudio]"`, `sgl-omni serve --model-path fishaudio/drama-3 --port 8000`). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- En SGLang-Omni la agrupacion de etapas del pipeline en procesos y su ubicacion en GPUs es configuracion de despliegue, no codigo especifico del modelo, lo que permite separar el vocoder en otra GPU.
- Latencia y throughput: en una H200, TTFA p50 de 88,9 ms y RTF de 0,131 en concurrencia 1; hasta 1.687,3 frames/s con RTF medio de 0,801 en concurrencia 64 (ver tabla de la seccion anterior).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto, rendimiento ni licencia de otros modelos de sintesis de voz comparables, por lo que no es posible construir una tabla de comparacion sin inventar cifras. Los unicos modelos citados en los resultados de busqueda (TechnoBaptist/d1-3B, derivado de LiquidAI/d1-3B) pertenecen a otra categoria y no son comparables.

## Limitaciones y advertencias

- Licencia restrictiva: fish-audio-research-license es una licencia de investigacion (license: other). El uso comercial requiere revisar el archivo LICENSE.md del repositorio y, previsiblemente, obtener una licencia aparte de Fish Audio. No se debe asumir uso comercial libre.
- Riesgo de alucinacion acustica: como modelo generativo, puede producir prosodia, pausas o eventos no solicitados, especialmente con textos ambiguos o referencias de voz de baja calidad.
- La clonacion de voz exige consentimiento y cumple normativa: clonar voces de terceros sin autorizacion puede infringir derechos de imagen y voz y la legislacion aplicable (por ejemplo, normas sobre deepfakes en la UE).
- Idiomas: aunque se declaran 83 idiomas, la propia model card solo aporta ejemplos y mediciones en ingles; la calidad en el resto de idiomas no esta cuantificada y probablemente sea desigual segun el idioma.
- Longitud de contexto: no se publica la ventana de contexto del backbone, lo que dificulta planificar el troceado optimo en produccion.
- Sin benchmarks objetivos: no hay evaluaciones publicadas de similitud de hablante, naturalidad (MOS), robustez ante textos largos ni tasa de error de palabras, lo que complica la comparacion con alternativas.
- Requisitos de hardware elevados: 41,5 GB de pesos y ausencia de cuantizaciones ligeras implican GPU de datacenter o multi-GPU; no hay ruta viable en hardware de consumo.
- Dependencia del ecosistema de despliegue: la unica via documentada es SGLang-Omni, por lo que la portabilidad a otros servidores de inferencia no esta garantizada.
- Metadatos poco fiables: el modelo tiene 0 descargas y 0 likes, y la fecha de publicacion declarada (13 de octubre de 2026) es posterior a la fecha actual, ademas de que el autor del repositorio (TechnoBaptist) no coincide con la organizacion oficial de Fish Audio. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/drama-3
- Documentacion de SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni en GitHub: https://github.com/sgl-project/sglang-omni
- Ficha del modelo en There's An AI For That: https://theresanaiforthat.com/model/drama-3/
- Ficha de autor en Essa Mamdani (TechnoBaptist): https://essamamdani.com/ai-models/company/technobaptist
- Dataset de referencia para pruebas de clonacion: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
