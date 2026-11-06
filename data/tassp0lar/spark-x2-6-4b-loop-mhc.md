# TassP0lar/Spark-X2.6-4B-Loop-mHC

## Resumen

Spark-X2.6-4B-Loop-mHC (denominado internamente `SparkX-Loop v0.2`) es un checkpoint derivado de `XHToken/Spark-X2.6-4B` publicado por el usuario TassP0lar. Se trata de un transformer recursivo ("looped") que desenrolla 36 capas fisicas en 60 capas efectivas mediante dos pasadas sobre un nucleo recurrente, y que incorpora conexiones hiperbolicas restringidas a variedad (manifold-constrained hyper-connections, mHC) junto con siete modulos MoE-Engram de memoria condicional de tres niveles, sumando 112 expertos de memoria. El modelo tiene 4.112.079.360 parametros totales y un repositorio de 8,4 GB en safetensors.

El problema que aborda es el de aumentar la profundidad efectiva y la capacidad de memoria sin incrementar proporcionalmente el numero de parametros fisicos, algo relevante para tareas de razonamiento matematico y cientifico con contexto largo. La model card reporta una mejora de perplexity del 5,3 % frente al backbone puro de 36 capas en un conjunto de validacion de pruebas matematicas y cientificas.

Es relevante ahora porque propone una via de escalado alternativa (recursion + memoria condicional) sobre un modelo base de 4B, con licencia Apache 2.0 y soporte declarado de contexto de hasta 1M tokens mediante compresion de cache KV log-lineal en tiempo de ejecucion. No obstante, el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, y no dispone de resultados de benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recursivo (looped) con Sublayer Dual-mHC y 7 modulos MoE-Engram de 3 niveles; backbone con 3x sliding attention (w=512, RoPE) + 1x full attention (NoPE) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (MoE-Engram con top-k=2 sobre 16 expertos por modulo; no se especifica el total de parametros activos) |
| Longitud de contexto | hasta 1M tokens declarados, con cache KV log-lineal O(n log n) en tiempo de ejecucion; ventana sliding de 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `loop_modules.safetensors` y `loop_config.json`) |

## Arquitectura y entrenamiento

El modelo parte del backbone `XHToken/Spark-X2.6-4B` de 36 capas fisicas y lo desenrolla en 60 capas efectivas mediante una estructura Prelude [0..4) + nucleo recurrente de 2 pasadas [4..28) + Coda [28..36). Sobre esta recursion se anaden conexiones mHC (manifold-constrained hyper-connections) a nivel de subcapa y siete modulos MoE-Engram de memoria condicional de tres niveles con 112 expertos de memoria en total, con top-k=2, rango de experto 16 y rango compartido 16. La atencion combina tres capas sliding de ventana 512 con RoPE y una capa full sin RoPE (NoPE), con GQA y SDPA fusionado.

La model card reporta telemetria de puertas aprendidas (`Mean |attn_gate| = 0.0605`, `Mean |ffn_gate| = 0.1087`), lo que sugiere un uso moderado de las rutas recurrentes. El checkpoint se presenta como "merged" a partir de `TassP0lar/Spark-X2.6-4B-Loop-mHC-R24`. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica declarada es la compresion de cache KV log-lineal O(n log n) para contextos ultra-largos, activable en tiempo de ejecucion mediante `patch_spark_attention_for_loglinear_kv`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`).
- Razonamiento orientado a pruebas matematicas y cientificas, segun el conjunto de evaluacion de ablacion de la model card.
- Memoria condicional mediante modulos MoE-Engram de tres niveles con 112 expertos.
- Profundidad efectiva ampliada por recursion (36 capas fisicas, 60 efectivas).
- Soporte declarado de contexto ultra-largo (hasta 1M tokens) con cache KV log-lineal.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explicitamente en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Razonamiento matematico y demostraciones cientificas: el modelo se evalua precisamente sobre pruebas matematicas y cientificas retenidas, donde la configuracion completa reduce la perplexity un 5,3 % frente al backbone, lo que lo hace adecuado para asistencia en verificacion formal y resolucion de problemas paso a paso.
- Analisis de documentos tecnicos largos: la ventana declarada de hasta 1M tokens con cache KV log-lineal permite procesar manuales, papers o expedientes extensos sin truncamiento agresivo, manteniendo las capas sliding de 512 para el contexto local.
- Investigacion sobre arquitecturas recursivas: al ser un checkpoint abierto con codigo (`sparkx_loop_core`) y configuracion (`loop_config.json`), sirve como banco de pruebas para estudiar el efecto de la recursion y de los modulos de memoria condicional sobre un backbone de 4B.
- Generacion de codigo asistida en entornos con restricciones de VRAM: con 4,1B parametros en bfloat16 el modelo ocupa aproximadamente 8,2 GB, por lo que puede desplegarse en GPUs de consumo de 12-16 GB y usarse en tareas de autocompletado o generacion de scripts.
- Despliegue en pipelines de razonamiento con contexto largo: la combinacion de atencion sliding y full NoPE permite construir servicios de pregunta-respuesta sobre corpus extensos donde el coste de cache KV es el cuello de botella.
- Experimentacion academica con MoE-Engram: los siete modulos de memoria con 112 expertos y top-k=2 permiten estudiar el enrutamiento condicional y el olvido selectivo en modelos de tamano medio.

## Benchmarks y rendimiento

Resultados de ablacion publicados en la model card sobre pruebas matematicas y cientificas retenidas (eval loss y perplexity):

| Configuracion | Capas efectivas | Eval loss | Perplexity | PPL relativa |
|---|---|---|---|---|
| Backbone puro de 36 capas (Loop OFF, Engrams OFF) | 36 | 1,4648 | 4,3267 | Baseline |
| Loop solo de 60 capas (Loop ON, Engrams OFF) | 60 | 1,4447 | 4,2406 | -2,0 % |
| 36 capas + 7 MoE-Engrams (Loop OFF, Engrams ON) | 36 | 1,4206 | 4,1395 | -4,3 % |
| 60 capas completo (Loop + Dual-mHC + 7 MoE-Engrams) | 60 | 1,4099 | 4,0957 | -5,3 % (mejor) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8,2 GB solo para pesos; el ejemplo de la model card usa `device_map={"": "cuda:0"}` con `attn_implementation="eager"` y `use_cache=False`, lo que anade memoria de activaciones.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,1 GB; en 4 bits, alrededor de 2,1 GB (estimacion teorica a partir del numero de parametros; no se publican cuantizaciones oficiales).
- GPUs recomendadas: A100 40/80 GB o H100 para contextos largos y despliegue de produccion; RTX 4090 (24 GB) para inferencia en bfloat16 con margen.
- GPUs de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16 y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `trust_remote_code=True` y el modulo `sparkx_loop_core`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Nota: la recursion de dos pasadas sobre el nucleo recurrente incrementa el coste de computo respecto a un modelo de 36 capas equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Loop-mHC | 4,11B | hasta 1M (declarado) | Apache 2.0 | Hugging Face, repo de 8,4 GB | Recursion + MoE-Engram; sin benchmarks estandar publicados |
| XHToken/Spark-X2.6-4B (base) | 4B (no confirmado) | no disponible | no disponible | Hugging Face | Backbone de 36 capas sin recursion ni engrams |
| TassP0lar/Spark-X2.6-4B-Loop-mHC-R24 | no disponible | no disponible | Apache 2.0 (segun tag) | Hugging Face | Checkpoint previo del que deriva este merged |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Sin benchmarks estandar publicados (MMLU, HumanEval, GSM8K ni similares); la unica evidencia son ablaciones internas sobre un conjunto de pruebas matematicas y cientificas no descrito en detalle.
- Requiere `trust_remote_code=True` y un modulo externo (`sparkx_loop_core`) que no se distribuye en el repositorio, lo que anade riesgo de ejecucion de codigo no auditado.
- El ejemplo oficial desactiva la cache (`use_cache=False`), lo que penaliza fuertemente la latencia en generacion autoregresiva.
- El soporte de 1M de contexto depende de un parche en tiempo de ejecucion (`patch_spark_attention_for_loglinear_kv`) que no se ha validado de forma independiente.
- Idiomas soportados no declarados; riesgo de comportamiento degradado fuera del ingles.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no cuantificado; en tareas de razonamiento matematico sin benchmarks estandar no hay garantia de fidelidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion y de garantias hace recomendable evaluacion propia antes de produccion.
- El checkpoint se presenta como "merged" de un modelo previo; no se detalla el proceso de fusion ni posibles perdidas de capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/TassP0lar/Spark-X2.6-4B-Loop-mHC
- Checkpoint previo: https://huggingface.co/TassP0lar/Spark-X2.6-4B-Loop-mHC-R24
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio GitHub: https://github.com/BaiTian6641/Spark-X2.6-Recursion
