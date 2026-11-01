# stoyani/Nanbeige4.3-33B-FP8-KVcal

## Resumen

Nanbeige4.3-33B-FP8-KVcal es una distribucion derivada del checkpoint FP8 de Nanbeige4.3-33B, un modelo de lenguaje de 33.118.977.180 parametros desarrollado originalmente por Nanbeige LLM Lab. La version base FP8 fue producida por Primitive AI y esta variante, publicada por el usuario stoyani, anade escalas de calibracion estaticas por tensor para la cache KV en formato FP8, orientadas al motor de inferencia vLLM. No se reentrena ni se recuantizan los pesos: los siete shards originales permanecen intactos.

El problema que resuelve es concreto: permitir el uso de `--kv-cache-dtype fp8` en vLLM sin degradar la correccion numerica por falta de escalas adecuadas. Para ello incorpora `kv_cache_scales.safetensors`, con 156 escalares float32 (escalas Q, K y V para cada una de las 52 capas de atencion), calculados a partir de rangos observados con los pesos FP8 exactos y cache KV en BF16. El modelo soporta un contexto declarado de 524.288 tokens, segun la configuracion de servicio de ejemplo de la model card.

Es relevante ahora porque combina tres piezas que rara vez aparecen juntas en un unico artefacto listo para servir: pesos en FP8, cache KV en FP8 calibrada y un contexto muy largo, todo bajo licencia Apache-2.0. La contrapartida es una dependencia estricta de runtime: solo se ha validado con vLLM 0.32.0 mas una correccion de tipo de query en FlashInfer, sobre una RTX PRO 6000 Blackwell de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama segun tags; detalles internos no disponibles) |
| Parametros totales | 33.118.977.180 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens (segun `--max-model-len` del ejemplo de servicio) |
| Tipos de cuantizacion | Pesos FP8 (heredados del checkpoint base); cache KV FP8 con escalas estaticas por tensor; dtype de activacion bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (7 shards de pesos + `kv_cache_scales.safetensors`), libreria vllm, compatible con compressed-tensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original mas alla de su pertenencia a la familia llama y de su naturaleza decoder-only. Se desconoce el numero de capas totales del transformer, aunque la calibracion revela 52 capas de atencion (`model.layers.{0..51}.self_attn.attn.{q,k,v}_scale`). Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta release no esta en el entrenamiento sino en el serving. Se anaden 156 escalares float32 de calibracion para la cache KV en FP8, calculados observando los rangos en la entrada de atencion, tras la rotacion posicional de Q/K, usando los pesos FP8 exactos con cache KV en BF16. Cada escala sigue la formula `1.10 * maximo_absoluto_observado / 448`, redondeada hacia arriba a float32. La calibracion empleo 14 muestras, la mas larga de 68.190 tokens. El `config.json` habilita el escalado estatico FP8 de KV y el indice anade los 156 tensores de escala (624 bytes de datos). Los pesos, tokenizer y ajustes de generacion no se modifican respecto al release fijado de Primitive AI.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Modo de razonamiento explicito (thinking), activable mediante `enable_thinking` en el chat template y parseable con el parser `qwen3`.
- Soporte de tool calling y function calling, con parser `qwen3_coder` y formato XML configurable (`tool_call_format: xml`).
- Flujos de agente con seleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Contexto largo de hasta 524.288 tokens, con validacion sintetica de recuperacion a ~200K y ~520K tokens de entrada.
- Generacion estructurada (JSON) verificada en las pruebas del autor.
- Cache de prefijos (`--enable-prefix-caching`) y prefill troceado (`--enable-chunked-prefill`) para cargas de contexto largo.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Analisis de repositorios y documentos extensos: con 524.288 tokens de contexto y cache KV en FP8, permite procesar bases de codigo o expedientes completos en una sola pasada, reduciendo el coste de memoria frente a cache en BF16.
- Atencion al cliente multi-turno en ingles y chino: el modo thinking y el soporte de tool calling permiten integrar consultas a sistemas internos dentro de conversaciones largas con historial extenso.
- Agentes con herramientas en produccion: la combinacion de `--enable-auto-tool-choice`, parser `qwen3_coder` y formato XML facilita pipelines donde el modelo decide que herramienta invocar y estructura la llamada.
- Generacion de codigo asistida: el soporte de tool calling y de salida estructurada permite integrarlo en asistentes de IDE o pipelines de CI/CD que necesiten invocar linters, tests o APIs.
- Recuperacion aumentada sobre corpus grandes: la validacion sintetica a ~200K y ~520K tokens respalda escenarios de RAG con muchos fragmentos inyectados en contexto.
- Razonamiento por etapas con traza visible: el modo thinking con `preserve_thinking` permite auditar el razonamiento intermedio en tareas de analisis o verificacion.
- Servicio de inferencia de alto rendimiento en vLLM: la cache KV en FP8 calibrada reduce la huella de memoria por token, lo que permite mayor concurrencia o contextos mas largos en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta validaciones funcionales: coincidencia de las 156 escalas con la lectura en runtime, pruebas de aritmetica corta, repeticion, JSON estructurado, tool-call y thinking, y recuperacion sintetica a ~200K y ~520K tokens. No se realizo un estudio comparativo de calidad frente a cache KV en BF16.

## Requisitos de hardware

- VRAM: el repositorio ocupa 35,5 GB en pesos; con cache KV en FP8 y contexto completo de 524.288 tokens la demanda crece de forma significativa. El ejemplo validado usa una GPU de 96 GB con `--gpu-memory-utilization 0.95`.
- GPU recomendadas: RTX PRO 6000 Blackwell de 96 GB (unica configuracion validada). Por capacidad de memoria, H100 80 GB, H200 y A100 80 GB son candidatas, pero no han sido validadas para esta release.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB con contexto largo; en RTX 4090 seria necesario reducir drasticamente `--max-model-len` o recurrir a otras tecnicas de cuantizacion no cubiertas por estas escalas.
- Despliegue: vLLM 0.32.0 con la correccion de tipo de query en FlashInfer. Sin ese parche, FlashInfer nativo puede aplicar escalas Q no unitarias a queries BF16 y producir salidas incorrectas (vLLM issue #63043, PR #53754). No se ha validado llama.cpp, Ollama ni TGI para este checkpoint.
- Variables de entorno del ejemplo: `VLLM_USE_RUST_FRONTEND=0`, `VLLM_USE_V2_MODEL_RUNNER=1`, `VLLM_USE_FLASHINFER_SAMPLER=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-FP8-KVcal (este) | 33,1B | 524.288 | Pesos FP8 + KV FP8 calibrada | Apache-2.0 | Publicado, validado solo en vLLM 0.32.0 parcheado |
| Nanbeige/Nanbeige4.3-33B (original) | no disponible | no disponible en la informacion | BF16 (presumiblemente) | Apache-2.0 | Publicado |
| primitive-ai/Nanbeige4.3-33B-FP8 | 33,1B | no disponible | Pesos FP8, sin escalas KV calibradas | Apache-2.0 | Publicado |

No se dispone de datos de benchmarks ni de modelos de otros desarrolladores en la informacion proporcionada para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Dependencia critica de runtime: sin la correccion de FlashInfer en vLLM 0.32.0, las salidas pueden ser incorrectas. El checkpoint no parchea vLLM.
- Solo se ha validado en una RTX PRO 6000 Blackwell de 96 GB; otras GPU y backends quedan sin verificar.
- Las escalas estan pensadas exclusivamente para cache KV FP8 por tensor; no aplican a pesos NVFP4 ni a otros esquemas de cuantizacion de cache.
- No existe un estudio de equivalencia de calidad frente a cache KV en BF16; las pruebas de recuperacion sintetica no garantizan precision en cargas arbitrarias.
- Las entradas de calibracion y los artefactos por muestra no se distribuyen, lo que limita la reproducibilidad.
- Cobertura de calibracion limitada a 14 muestras, aunque una alcanza 68.190 tokens.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda mantener la atribucion a Nanbeige LLM Lab y Primitive AI.
- Las escalas Q incluidas no implican que las queries BF16 deban reescalarse.
- La configuracion de muestreo del ejemplo (temperatura 1.0) difiere de la recomendada por la model card original para razonamiento y chat (temperatura 0.6, top_p 0.95).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stoyani/Nanbeige4.3-33B-FP8-KVcal
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Checkpoint FP8 base: https://huggingface.co/primitive-ai/Nanbeige4.3-33B-FP8/tree/0140c157bc44507929a742c220865b0870052552
- Issue de vLLM #63043: https://github.com/vllm-project/vllm/issues/63043
- PR de vLLM #53754: https://github.com/vllm-project/vllm/pull/53754
