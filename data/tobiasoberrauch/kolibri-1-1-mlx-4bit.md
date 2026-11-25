# tobiasoberrauch/Kolibri-1.1-mlx-4bit

## Resumen

Kolibri-1.1-mlx-4bit es una cuantizacion a 4 bits del modelo Kolibri-1.1 de Aleph Alpha, convertida al formato MLX para su ejecucion en Apple Silicon. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 75.112.665.344 parametros totales y 3,44B parametros activos por token, disenado especificamente para razonamiento en aleman e ingles. La cuantizacion la firma el usuario independiente tobiasoberrauch, no Aleph Alpha, y se distribuye bajo licencia Apache 2.0.

El modelo base emplea una arquitectura poco convencional: 384 expertos enrutados (6 seleccionados por token mas un experto compartido), dos capas MLP densas iniciales seguidas de 48 capas MoE, y una mezcla 4:1 de atencion de ventana deslizante y atencion dispersa (sparse attention) con indexadores que seleccionan claves de todo el contexto. Esta combinacion busca mantener un coste de inferencia bajo (solo 3,44B parametros activos) pese a un total de 75B, algo relevante para despliegue en hardware de consumo.

La relevancia de esta ficha concreta radica en que permite ejecutar un modelo de 75B en un Mac con Apple Silicon gracias a la cuantizacion a 4 bits (unos 39 GB en disco) y al soporte de MLX. No obstante, el propio autor advierte de limitaciones importantes en el port: no reproduce los kernels oficiales NVFP4, no soporta generacion por lotes ni cuantizacion de KV-cache, y el prefill es lento (unos 35 tokens/s). Es, por tanto, una opcion practica para experimentacion local en Mac, no para serving de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (sliding-window + sparse/indexed attention); 2 capas MLP densas + 48 capas MoE |
| Parametros totales | 75.112.665.344 |
| Parametros activos | 3,44B (384 expertos enrutados, 6 por token + 1 compartido) |
| Longitud de contexto | No disponible de forma explicita; validado con exito hasta 7441 tokens y no probado por encima de 16384 tokens (ruta de pool rankeado) |
| Tipos de cuantizacion | 4 bits (group size 64) en esta version; el script de conversion permite tambien 8 bits |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), escalas y sesgos de cuantizacion, normas y router en bf16; `expert_bias` en fp32 |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 de Aleph Alpha es un transformer MoE con 75B parametros totales y 3,44B activos. La pila consta de dos capas MLP densas (capas 0 y 1) seguidas de 48 capas MoE, cada una con 384 expertos enrutados de los que se seleccionan 6 por token, mas un experto compartido. La atencion combina dos regimenes: capas de ventana deslizante (512 tokens previos mas el actual, con RoPE) y capas indexadas o dispersas. En estas ultimas, 4 indexadores seleccionan claves de todo el contexto y los otros 6 reindexadores seleccionan del pool de 16k tokens del ultimo indexador; cada query atiende a 2048 claves seleccionadas mas 8 tokens sink y 128 locales. Las KV-cache se comparten segun `kv_source_layers`.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si se documenta es el proceso de cuantizacion: el autor parte del checkpoint FP8 original (con escalas de bloque 128x128) y, mediante `convert_fp8.py`, desquantiza cada tensor en streaming y lo recuantiza a 4 bits con group size 64. La innovacion tecnica mas destacable del port es la implementacion de la arquitectura `kolibri1_1` en MLX mediante un fichero `kolibri1_1.py` cargado dinamicamente (mlx-lm no la incluye de serie). El autor senala una desviacion relevante: los kernels oficiales usan NVFP4 para el indexador y las KV-cache, mientras que este port calcula esas rutas en bf16/fp32, lo que es numericamente mas limpio pero no reproduce la condicion de entrenamiento con cuantizacion, por lo que la calidad en contexto largo puede diferir del release oficial en vLLM.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento explicito con modo de pensamiento configurable mediante `reasoning_effort` (`none`, `low`, `medium`, `high`), que se expone como campo `reasoning` separado en la API.
- Soporte de tool calling / function calling a traves de `/v1/chat/completions`.
- Soporte de streaming en el servidor compatible con OpenAI.
- Capacidades de contexto largo mediante atencion dispersa indexada, con recuperacion de informacion verificada en prompts de hasta 7441 tokens (prueba de aguja).
- Capacidades multilingues limitadas a aleman e ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Razonamiento asistido en aleman para entornos de desarrollo: el modelo puede resolver problemas de logica o analisis paso a paso con `reasoning_effort` alto, adecuado para equipos que trabajan en aleman y quieren ejecutar el modelo localmente en un Mac.
- Prototipado de asistentes conversacionales bilingues (de/en): con un servidor compatible con OpenAI y soporte de tool calling, se puede integrar en un chatbot interno sin depender de la nube.
- Recuperacion aumentada sobre documentos de hasta varios miles de tokens: la atencion dispersa permite consultar contexto largo; validado con prompts de 1188, 2859 y 7441 tokens, aunque con prefill lento (unos 35 tokens/s) que hace inviable prompts muy largos en tiempo real.
- Evaluacion e investigacion de arquitecturas MoE con atencion dispersa: util para estudiar el comportamiento de indexadores y reindexadores en MLX, o para comparar la calidad frente a los kernels oficiales NVFP4.
- Generacion de codigo asistida en local: el modelo soporta conversacion multi-turno y tool calling, por lo que puede integrarse en editores o scripts de automatizacion en un Mac, siempre que la latencia no sea critica.
- Desarrollo de agentes de un solo hilo: el servidor MLX sirve peticiones de una en una, lo que encaja con flujos de agente secuenciales y no con cargas concurrentes.
- Experimentacion con cuantizacion: el script de conversion permite generar variantes de 8 bits y comparar perplexity y calidad, util para quien quiera estudiar el impacto de la cuantizacion en modelos MoE grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si reporta verificaciones propias sobre los pesos convertidos a 4 bits (Mac serie M, mlx-lm 0.31.3):

| Prueba | Resultado |
|---|---|
| Perplexity (texto corto de/en) | 3,10 |
| Consistencia chunked prefill vs. decodificacion cacheada (2600 tokens) | Brecha relativa 0,0002; mismo token top en el 100% de los casos |
| Recuperacion de aguja (1188, 2859, 7441 tokens) | Recuperada correctamente en los tres casos |
| Prefill | ~35 tokens/s |
| Prompts por encima de 16384 tokens | No probado |
| Comparacion numerica con kernels oficiales vLLM | No realizada |

## Requisitos de hardware

- Memoria unificada: al menos unos 39 GB (tamano en disco de los pesos) mas el espacio para la KV-cache. El autor indica que se necesita "al menos esa cantidad" de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). Probado en Mac serie M; no se especifica el chip concreto.
- GPU NVIDIA: no aplicable a esta version MLX; para CUDA habria que usar el modelo base o el release oficial en vLLM.
- Despliegue: `mlx-lm` (CLI `mlx_lm.generate`, API Python `load`/`generate` y servidor `mlx_lm.server` compatible con OpenAI). No soporta vLLM, llama.cpp ni Ollama en este formato.
- Limitaciones de serving: sin generacion por lotes (las KV-cache compartidas no se pueden fusionar ni dividir por secuencia), sin `--kv-bits` ni `--max-kv-size`; las peticiones se sirven de una en una.
- Memoria en prefill: una llamada de 1000 tokens genera aproximadamente 25 GB de temporales, por lo que prompts de mas de ~1000 tokens requieren mucha mas memoria que un kernel de serving optimizado.
- Latencia: prefill de ~35 tokens/s implica varios minutos para un prompt de 7k tokens.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kolibri-1.1-mlx-4bit (esta ficha) | 75B / 3,44B | No especificado; validado hasta 7,4k tokens | Apache 2.0 | MLX (Apple Silicon) | Port no oficial, sin lotes, sin cuantizacion KV |
| Aleph-Alpha/Kolibri-1.1 (base) | 75B / 3,44B | No disponible | Apache 2.0 | Pesos FP8, kernels oficiales vLLM | Referencia oficial; usa NVFP4 en indexador y KV-cache |
| Otros MoE de ~70-80B (p. ej. familia Mixtral o Qwen MoE) | Variable | Variable | Variable | Multiples formatos (GGUF, safetensors, vLLM) | No disponible comparacion de rendimiento concreta en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Port no oficial: la cuantizacion y el codigo de carga los mantiene un usuario independiente (tobiasoberrauch), no Aleph Alpha; no hay garantia de soporte ni de paridad con el release oficial.
- Desviacion numerica: el indexador y las KV-cache se calculan en bf16/fp32 en lugar de NVFP4, por lo que la calidad en contexto largo puede diferir del modelo oficial en vLLM.
- Sin fallback de atencion densa: no existe una ruta alternativa si la atencion dispersa falla o degrada.
- Contexto no validado por encima de 16384 tokens (ruta de pool rankeado sin probar) y sin comparacion numerica con los kernels oficiales.
- Rendimiento de serving limitado: sin generacion por lotes, sin cuantizacion de KV-cache, prefill lento y alto consumo de memoria en prompts largos; no apto para produccion concurrente.
- Idiomas restringidos a aleman e ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Aleph-Alpha/Kolibri-1.1 y de los datos de entrenamiento subyacentes.
- Dependencia de `mlx-lm` 0.31.3 y de un fichero de arquitectura externo (`kolibri1_1.py`); cambios de version pueden romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tobiasoberrauch/Kolibri-1.1-mlx-4bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
