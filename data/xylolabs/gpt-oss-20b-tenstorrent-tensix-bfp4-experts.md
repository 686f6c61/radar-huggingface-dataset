# Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts

## Resumen

`Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts` es una cuantizacion del modelo `openai/gpt-oss-20b` realizada por Xylolabs y orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de pesos que aplica block floating point (BFP) selectivo: los expertos enrutados del bloque MoE se cuantizan a `bfloat4_b` (BFP4) mediante GPTQ, mientras que las proyecciones de atencion y la cabeza LM se mantienen en `bfloat8_b` (BFP8) por redondeo al mas cercano. El resultado ocupa 13,218 GB empaquetados frente a los 41,83 GB del modelo base en bf16.

El modelo hereda la arquitectura completa de `gpt-oss-20b` de OpenAI: un transformer con mezcla de expertos (MoE) de 20.914.757.184 parametros totales, con capacidades de generacion de texto, razonamiento y conversacion. La relevancia de esta variante radica en que permite ejecutar un modelo de ~21B parametros en hardware de inferencia especializado con un coste de memoria sustancialmente menor, manteniendo una fidelidad respecto al original medida en terminos de divergencia KL (0,0636 de media frente a bf16).

La ficha tecnica resulta de interes para desarrolladores que trabajan con el stack de Tenstorrent (`tt-metal`, `ttnn`, `tt-forge`) y necesitan desplegar modelos conversacionales en NPU. La licencia Apache 2.0, identica a la del modelo base, facilita su adopcion comercial, aunque la model card no documenta idiomas soportados ni resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en expertos enrutados; BFP8 (`bfloat8_b`) en atencion y LM head; bf16 en router, embeddings y normas |
| Idiomas soportados | no disponible (evaluacion limitada a ingles y coreano) |
| Licencia | Apache 2.0 (con `USAGE_POLICY` del modelo base) |
| Formato de pesos | safetensors (empaquetado Tensix, 13,218 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `gpt-oss-20b` de OpenAI, un transformer con capas de mezcla de expertos. Esta variante no entrena el modelo: aplica un proceso de cuantizacion post-entrenamiento (PTQ) sobre los pesos originales. La estrategia es granular por tipo de tensor: las 24 capas de atencion (q, k, v, o) se convierten a `bfloat8_b` por redondeo al mas cercano; los expertos enrutados (gate, up, down) de las 24 capas se cuantizan a `bfloat4_b` con GPTQ y busqueda de exponente por bloque de 16 elementos a lo largo de las entradas; el router permanece en bf16; la cabeza LM se lleva a `bfloat8_b`; y embeddings, normas y el resto de tensores se mantienen en bf16 como en el modelo base.

El proceso de GPTQ se aplico exclusivamente a los expertos enrutados, y aquellos expertos que recibieron pocos tokens de calibracion se cuantizaron por redondeo al mas cercano. El repositorio incluye `quant4.json`, que documenta el formato de cada proyeccion, y el codigo de cuantizacion y verificacion (`tools/pack_tensix.py` y `tools/verify_grid.py`) publicado en el repositorio `XylolabsInc/tensix-bfp-gptq`. La verificacion se realizo con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent. No se documentan en la informacion disponible datos sobre el dataset de calibracion (numero de tokens, composicion) ni sobre fases de RLHF o DPO, que corresponderian al modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de `gpt-oss-20b`.
- Razonamiento y respuesta a instrucciones en formato chat (la model card muestra el uso de `apply_chat_template` con roles `user`).
- Inferencia sobre NPU Tenstorrent Tensix (Wormhole y Blackhole) mediante `ttnn`, con empaquetado nativo de matrices en `bfloat4_b` y `bfloat8_b`.
- Ejecucion tambien en `transformers` con `AutoModelForCausalLM` en bf16 y `device_map="auto"`, lo que permite validacion en GPU convencional.
- Capacidades multilingues: no documentadas; la evaluacion cubre solo ingles y coreano.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal del modelo es ejecutar un LLM conversacional de ~21B parametros en Wormhole o Blackhole con 13,218 GB empaquetados, reduciendo la huella de memoria frente a los 41,83 GB en bf16 y aprovechando los kernels de `tt-metal`/`ttnn`.
- Validacion de pipelines de cuantizacion: util para equipos que desarrollan o auditan flujos GPTQ con block floating point, ya que el repo incluye `pack_tensix.py`, `verify_grid.py` y `quant4.json` para comprobar matriz a matriz el round-trip por DRAM.
- Sustitucion de MXFP4 en produccion sobre Tensix: la model card compara directamente con el GGUF MXFP4 de llama.cpp (KL media 0,0636 frente a 0,0678), por lo que sirve como alternativa cuando el objetivo es minimizar la divergencia respecto a bf16 en hardware Tenstorrent.
- Prototipado de asistentes conversacionales en entornos con NPU: mediante el snippet de `transformers` de la model card se puede levantar un chat basico en bf16 para pruebas funcionales antes de portar a Tensix.
- Investigacion en compresion de modelos MoE: la combinacion de BFP4 en expertos y BFP8 en atencion constituye un caso de estudio reproducible para medir el impacto de la precision mixta sobre la fidelidad (top-1 del 81,90 % frente a bf16).
- Evaluacion comparativa de formatos de cuantizacion: el modelo permite contrastar BFP4/BFP8 de Tensix contra MXFP4 de llama.cpp sobre el mismo modelo base, con metodologia de KL y top-1 documentada sobre 8.188 posiciones de WikiText-2 y Wikipedia en coreano.

## Benchmarks y rendimiento

La model card solo publica metricas de fidelidad de cuantizacion, no benchmarks de tareas (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Metrica | BF16 (`openai/gpt-oss-20b`) | Este modelo (BFP4/BFP8) | MXFP4 (llama.cpp) |
|---|---:|---:|---:|
| Tamano (GB) | 41,83 | 13,218 | 12,110 |
| KL media a BF16 | 0 | 0,0636 | 0,0678 |
| Top-1 (%) | 100 | 81,90 | 82,65 |

La evaluacion de KL y top-1 cubre 8.188 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano) en formato de texto plano. La referencia MXFP4 corresponde al GGUF de `ggml-org/gpt-oss-20b-GGUF` en el commit `15dcfc7e`, leido con llama.cpp v0.9.0 (`cd959bae`), con sha256 `27cd6c432c7672cb812a92f611cf3ba7bbc35928262bb1e1253ff4ee6ae35901`. Segun la model card, el BF16 propio de llama.cpp esta a 0,0435 de KL media respecto al de referencia, por lo que cada lado se mide contra su propio BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: 13,218 GB empaquetados en formato Tensix; en bf16 (via `transformers`) el modelo ocupa 41,83 GB, por lo que requiere al menos ~42 GB de memoria de GPU o descarga a CPU.
- GPU recomendadas para la ruta `transformers`: A100 80 GB, H100, o configuraciones multi-GPU con `device_map="auto"`; una RTX 4090 de 24 GB no puede alojar el modelo completo en bf16 sin offloading.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole; verificado con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole).
- Cabe en consumer GPU: no en bf16 completo con 24 GB; solo mediante tecnicas de offloading o cuantizacion adicional no incluidas en este repo.
- Opciones de despliegue: `transformers` (ruta de validacion), `ttnn`/`tt-metal` (ruta de produccion en Tensix), kernels y runner en `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts` | 20,91B | no disponible | 13,218 GB (BFP4/BFP8) | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `openai/gpt-oss-20b` (bf16) | 20,91B | no disponible | 41,83 GB | Apache 2.0 | GPU generica |
| `ggml-org/gpt-oss-20b-GGUF` (MXFP4) | 20,91B | no disponible | 12,110 GB | Apache 2.0 | CPU/GPU via llama.cpp |

La comparativa se limita al mismo modelo base en distintas representaciones, ya que la informacion disponible no incluye modelos alternativos de otros autores. En fidelidad, este modelo queda ligeramente por encima de MXFP4 (KL 0,0636 frente a 0,0678), mientras que MXFP4 obtiene un top-1 marginalmente superior (82,65 % frente a 81,90 %). La diferencia principal es el hardware objetivo: la variante de Xylolabs esta disenada para Tensix, mientras que MXFP4 apunta a llama.cpp.

## Limitaciones y advertencias

- La cuantizacion BFP4 en los expertos enrutados introduce una divergencia medible respecto a bf16 (KL media 0,0636; top-1 81,90 %), lo que puede degradar tareas sensibles a la precision numerica.
- Algunos expertos con pocos tokens de calibracion se cuantizaron por redondeo al mas cercano en lugar de GPTQ, lo que puede producir heterogeneidad de calidad entre expertos.
- La evaluacion de fidelidad solo cubre ingles y coreano sobre 8.188 posiciones; no hay datos sobre otros idiomas ni sobre tareas de razonamiento, codigo o matematicas.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas de esta variante; deben asumirse los del modelo base `openai/gpt-oss-20b`.
- La model card no especifica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas sin verificacion adicional.
- El formato de pesos esta empaquetado para Tensix; la ruta `transformers` funciona en bf16 pero no aprovecha el empaquetado BFP4, por lo que el ahorro de memoria solo se materializa en hardware Tenstorrent.
- La licencia Apache 2.0 incluye la `USAGE_POLICY` del modelo base; es responsabilidad del integrador revisar dicha politica antes de un despliegue comercial.
- El modelo se verifico sobre el simulador `ttsim`, no necesariamente sobre silicio Blackhole/Wormhole fisico segun la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de codigo empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release `tensix-bfp-gptq` v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release `tensix-kernels` v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release `tensix-runner` v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- GGUF MXFP4 de referencia: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Paper referenciado en los tags (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
