# wokenlex/bubblecrawler-models

## Resumen

`wokenlex/bubblecrawler-models` es un repositorio de pesos en formato Core ML que empaqueta los dos modelos que la aplicacion BubbleCrawler descarga en su primer arranque: una conversion de `google/gemma-4-E4B-it` para generacion de texto y una conversion de `google/embeddinggemma-300m` para generacion de embeddings. No es un modelo entrenado desde cero ni un fine-tune: es un artefacto de despliegue orientado exclusivamente al Apple Neural Engine (ANE), pensado para inferencia 100 % on-device en dispositivos Apple.

El problema que resuelve es de infraestructura: ejecutar un LLM de la familia Gemma 4 y un modelo de embeddings dentro de una app iOS/macOS sin depender de servidores. Para ello, el autor publica cuatro chunks de decodificacion mas un prefill por lotes (N = 2048) para el LLM, con un contexto de 4096 tokens, y corrige tres defectos presentes en conversiones previas: las tablas RoPE proporcionales, la mascara de banda de 512 tokens en las capas de ventana deslizante durante el prefill, y el empaquetado multifuncion de los chunks para compartir pesos entre `decode_q1` y `prefill`.

Es relevante ahora porque demuestra un patron reproducible de portado de LLMs a Core ML con correcciones tecnicas documentadas, y porque combina generacion y retrieval en un unico paquete de 6,3 GB. La limitacion principal es que no hay informacion publica sobre parametros totales del LLM, idiomas soportados ni cuantizacion aplicada, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4E4B: transformer decoder de la familia Gemma 4, con capas de atencion completa y capas de ventana deslizante, y RoPE proporcional. EmbeddingGemma: encoder de embeddings de 300M |
| Parametros totales | Gemma4E4B: no disponible. EmbeddingGemma: 300M |
| Parametros activos | no disponible |
| Longitud de contexto | Gemma4E4B: 4096 tokens. EmbeddingGemma: 128 tokens de entrada (`input_ids` con forma `[1, 128]`) |
| Tipos de cuantizacion | no disponible (la model card no especifica palettization ni precision de pesos) |
| Idiomas soportados | no disponible |
| Licencia | Gemma4E4B: Apache 2.0. EmbeddingGemma: Gemma Terms of Use y Gemma Prohibited Use Policy. El repositorio declara en conjunto `apache-2.0-and-gemma` |
| Formato de pesos | Core ML compilado (`.mlmodelc`), con tablas RoPE auxiliares en `.npy` (`cos_full.npy`, `sin_full.npy`) |
| Modelos base | `google/gemma-4-E4B-it`, `google/embeddinggemma-300m` |
| Tamano del repositorio | 6,3 GB |
| Motor de inferencia | Apple Neural Engine (Core ML) |
| Tokenizer del LLM | No anade token BOS; es necesario anteponer `<bos>` manualmente |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor, sino de una conversion a Core ML de dos modelos de Google. El componente de generacion es `google/gemma-4-E4B-it`, un transformer decoder de la familia Gemma 4 que combina capas de atencion completa con capas de ventana deslizante. La conversion se apoya en el motor por chunks de `john-rocky/CoreML-LLM` y se divide en cuatro chunks de decodificacion mas un prefill por lotes con N = 2048, sobre un contexto maximo de 4096 tokens. El componente de retrieval es `EmbeddingGemma-300M`, un encoder de 300M parametros que produce vectores de 768 dimensiones a partir de secuencias de hasta 128 tokens.

La innovacion tecnica del repositorio esta en tres correcciones sobre la conversion previa `mlboydaisuke/gemma-4-E4B-coreml`. Primera: las tablas `cos_full.npy` y `sin_full.npy` implementan el RoPE proporcional de Gemma 4 para atencion completa, de modo que solo rotan las primeras 64 de las 256 frecuencias; la conversion upstream rota todas y, como consecuencia, pierde el rastro de cualquier contenido situado a mas de unos 512 tokens de distancia. Segunda: el prefill aplica la mascara de banda de 512 tokens a las capas de ventana deslizante. Tercera: cada `chunkN.mlmodelc` contiene dos funciones, `decode_q1` (por defecto) y `prefill`, que comparten una unica copia de los pesos; las funciones `verify_qK` no se incluyen. No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que el autor no entrena los modelos base.

## Capacidades

- Generacion de texto autoregresiva en local, con decodificacion por chunks sobre el Apple Neural Engine y ventana de contexto de 4096 tokens.
- Prefill por lotes con N = 2048, lo que permite procesar prompts largos en una sola pasada antes de la decodificacion token a token.
- Generacion de embeddings de 768 dimensiones para busqueda semantica, recuperacion de pasajes y agrupamiento, mediante EmbeddingGemma-300M.
- Ejecucion completamente offline: no requiere red ni backend remoto una vez descargados los pesos.
- Integracion en apps iOS/iPadOS/macOS a traves de Core ML y del motor CoreML-LLM.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, modo agente, multi-step reasoning, vision, audio ni modo de razonamiento explicito.
- No hay informacion disponible sobre cobertura multilingue.

## Casos de uso

- Asistente conversacional offline en una app iOS: el LLM local gestiona dialogos multi-turno de hasta 4096 tokens sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones con requisitos estrictos de privacidad.
- Busqueda semantica dentro de la app: EmbeddingGemma-300M vectoriza consultas y documentos del usuario a 768 dimensiones, permitiendo ranking por similitud coseno sobre un indice local.
- RAG on-device: el pipeline trocea documentos, genera embeddings con EmbeddingGemma y pasa los fragmentos recuperados al LLM de Gemma 4 para responder con contexto, todo en el mismo dispositivo y sin limite de red.
- Clasificacion y agrupamiento de notas o articulos: los embeddings permiten etiquetado automatico, deteccion de duplicados y clusters tematicos en una base de conocimiento personal.
- Resumen y reescritura de textos largos: el prefill por lotes de N = 2048 y el contexto de 4096 tokens permiten condensar documentos extensos en una sola pasada de prefill.
- Autocompletado y sugerencias en editores de texto: la decodificacion por chunks con los cuatro chunks de `decode_q1` mantiene baja la latencia por token en dispositivos con Neural Engine.
- Deduplicacion de contenido en pipelines de ingesta: los embeddings de 768 dimensiones sirven como firma semantica para descartar elementos repetidos antes de almacenarlos.
- Prototipado de features de IA en Xcode: el paquete `.mlmodelc` se puede compilar e integrar directamente en un proyecto Swift sin dependencias de Python en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MTEB ni de latencia o throughput, y tampoco se ofrecen comparaciones numericas con las conversiones alternativas.

## Requisitos de hardware

- Hardware objetivo: dispositivos Apple con Neural Engine, es decir, Apple Silicon (familia M) y SoC de la familia A con ANE. La model card indica explicitamente que la app los ejecuta en el Apple Neural Engine.
- Almacenamiento: 6,3 GB de repositorio, que hay que reservar en el dispositivo ademas del espacio de la aplicacion.
- Memoria: no se publica una cifra de VRAM o memoria unificada necesaria. No se puede confirmar que el LLM quepa en dispositivos con 6 GB de memoria unificada.
- GPU de escritorio: no aplica. El paquete esta compilado para Core ML y ANE, por lo que no se puede ejecutar en A100, H100, RTX 4090 ni similares.
- Opciones de despliegue: Core ML y `coremltools` para la compilacion; el motor de inferencia de referencia es `john-rocky/CoreML-LLM`; la app consumidora es BubbleCrawler. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito de integracion: el tokenizer no anade BOS, por lo que el codigo cliente debe anteponer `<bos>` manualmente antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `wokenlex/bubblecrawler-models` (Gemma4E4B) | no disponible | 4096 tokens | Core ML `.mlmodelc`, 4 chunks de decode + prefill | Apache 2.0 | RoPE proporcional corregida (solo 64 de 256 frecuencias), mascara de banda de 512 tokens en prefill, chunks multifuncion con pesos compartidos |
| `mlboydaisuke/gemma-4-E4B-coreml` | no disponible | no disponible | Core ML | no disponible | Conversion upstream; segun la model card, rota las 256 frecuencias y pierde el rastro mas alla de ~512 tokens |
| `erjigit17/embeddinggemma-300m-ane-coreml` | 300M | 128 tokens de entrada | Core ML | Gemma Terms of Use | Origen de la conversion de embeddings reutilizada por BubbleCrawler |
| `google/embeddinggemma-300m` (original) | 300M | no disponible | safetensors (formato original de Google) | Gemma Terms of Use | Modelo base de embeddings antes del portado a Core ML |

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es un artefacto de conversion. Cualquier evaluacion de capacidades debe remitirse a los modelos base `google/gemma-4-E4B-it` y `google/embeddinggemma-300m`.
- La model card advierte de un fallo conocido en la conversion upstream (`mlboydaisuke/gemma-4-E4B-coreml`): al rotar las 256 frecuencias en lugar de solo 64, el modelo pierde informacion de contexto mas alla de aproximadamente 512 tokens. Este repositorio corrige ese punto, pero conviene usarlo como referencia de la sensibilidad del portado a Core ML.
- El tokenizer no anade el token BOS. Omitir `<bos>` manualmente puede degradar la calidad de las respuestas.
- El contexto queda fijado en 4096 tokens para el LLM y en 128 tokens para el encoder de embeddings; no hay margen para entradas mas largas sin trocear.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion, evaluacion de factualidad ni calibracion. Es el comportamiento esperado de un LLM generativo sin capa de verificacion.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo ni sobre la composicion del dataset original.
- Idiomas: no disponibles. No se puede confirmar soporte del castellano ni de otras lenguas distintas del ingles.
- Licencia: el paquete combina dos regimenes. Gemma4E4B se distribuye bajo Apache 2.0, mientras que EmbeddingGemma esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Cualquier uso comercial debe verificar ambas condiciones y el fichero `EmbeddingGemma/NOTICE`.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso en produccion ni resultados de benchmarks publicados.
- Dependencia de plataforma total: el modelo solo funciona en hardware Apple con Neural Engine. No hay rutas de despliegue alternativas documentadas.
- El tamano de 6,3 GB y la ausencia de datos de cuantizacion hacen dificil estimar el impacto en almacenamiento y memoria de dispositivos de gama baja.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wokenlex/bubblecrawler-models
- Repositorio de la aplicacion BubbleCrawler: https://github.com/wokenlex/bubblecrawler
- Motor de inferencia CoreML-LLM: https://github.com/john-rocky/CoreML-LLM
- Conversion upstream del LLM: https://huggingface.co/mlboydaisuke/gemma-4-E4B-coreml
- Conversion de embeddings en ANE: https://huggingface.co/erjigit17/embeddinggemma-300m-ane-coreml
- Modelo base de generacion: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base de embeddings: https://huggingface.co/google/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
