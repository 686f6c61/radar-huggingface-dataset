# Xylolabs/gemma-4-26B-A4B-Tensix-BFP8

## Resumen

Xylolabs/gemma-4-26B-A4B-Tensix-BFP8 es una version cuantizada del modelo google/gemma-4-26B-A4B, publicada por Xylolabs y optimizada para su ejecucion en aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). El modelo base es un transformer multimodal de tipo image-text-to-text con 26.544.133.710 parametros totales, y esta cuantizacion reduce su huella de 50,47 GB en bf16 a 27,513 GB empaquetados para Tensix, manteniendo la cabeza LM, los embeddings, las normas y el tower de vision en bf16.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones publicadas especificamente para el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge), no para GPU convencionales. Emplea una rejilla de punto flotante en bloque `bfloat8_b` (BFP8) y GPTQ para las proyecciones de atencion, MLP y expertos enrutados, con el objetivo de preservar la fidelidad respecto al modelo bf16 original. Segun la model card, la divergencia media KL frente a bf16 es de 0,0027, muy inferior a la de una cuantizacion Q4_K_M de llama.cpp (0,0568).

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad declarada con transformers. No incluye plantilla de chat ni ajuste de instrucciones: es el checkpoint preentrenado, por lo que su uso principal es la continuacion de texto y la experimentacion en hardware Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE); detalles completos no disponibles |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones de atencion, MLP y expertos; bf16 en LM head, embeddings, normas y vision tower; existe variante BFP4 |
| Idiomas soportados | no disponible (evaluacion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix, 27,513 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE), segun se deduce del nombre "26B-A4B" y de la presencia de proyecciones de "routed experts" en la tabla de formatos de la model card. La cuantizacion afecta a las proyecciones q, k, o (30 capas), v (25 capas) y a las proyecciones gate, up y down tanto de la MLP compartida como de los expertos enrutados (30 capas), todas en `bfloat8_b`. El router, sus escalas por experto, el LM head (atado al embedding), las normas y los tensores de vision (`embed_vision`, `vision_tower`) permanecen en bf16.

El proceso de cuantizacion se realizo con GPTQ sobre la rejilla `bfloat8_b`, mediante el codigo tensix-bfp-gptq (commit 5c52065). La model card no detalla el dataset de calibracion ni el numero de tokens de entrenamiento del modelo base. La evaluacion de fidelidad se realizo sobre 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), comparando la distribucion de salida frente a bf16. No se especifican innovaciones de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto y continuacion de secuencias (modelo preentrenado, sin plantilla de chat).
- Procesamiento multimodal image-text-to-text (pipeline declarado), con vision tower en bf16.
- Razonamiento y comprension del lenguaje heredados del modelo base Gemma 4.
- Capacidades multilingues: la evaluacion incluye ingles y coreano; el conjunto completo de idiomas no esta documentado.
- Ejecucion en hardware Tensix (Wormhole, Blackhole) mediante ttnn, tt-metal y tt-forge.
- Compatibilidad con transformers (`AutoModelForCausalLM`, `AutoTokenizer`) para inferencia en GPU/CPU convencional.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente en la informacion disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado y verificado para Wormhole y Blackhole, lo que permite inferencia en NPUs Tensix sin GPU, con un footprint de 27,513 GB en DRAM.
- Investigacion en cuantizacion de bajo nivel: sirve como referencia para estudiar el impacto de BFP8 frente a Q4_K_M en terminos de KL y top-1 sobre un modelo MoE multimodal.
- Continuacion de texto en pipelines de generacion: al ser un checkpoint preentrenado, encaja en tareas de completado, generacion libre y evaluacion de perplejidad.
- Prototipado multimodal: el tower de vision en bf16 permite experimentar con entradas imagen-texto en entornos Tensix antes de pasar a produccion.
- Validacion de kernels y toolchains: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad de cada matriz en dispositivo, util para equipos que desarrollan sobre ttnn.
- Base para ajuste fino o destilacion: al estar en safetensors y ser compatible con transformers, puede servir como punto de partida para post-entrenamiento en dominios concretos.
- Benchmarking de hardware: comparar latencia y throughput de Tensix frente a GPU usando un modelo de 26B con cuantizacion agresiva.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B) | 50,47 | 0 | 100 |
| Este modelo (BFP8) | 27,513 | 0,00268 | 97,29 |
| Q4_K_M (llama.cpp) | 16,796 | 0,05678 | 89,89 |

Las metricas KL y top-1 se calcularon sobre 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), como texto plano. La Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 27,513 GB empaquetados para Tensix; el repositorio ocupa 53,1 GB en total (incluye pesos en bf16 y metadatos).
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole). Verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- GPU convencionales: el modelo puede cargarse con transformers en bf16 (`dtype="bfloat16"`, `device_map="auto"`), lo que requiere aproximadamente 50 GB de memoria; cabe en A100 80 GB, H100 80 GB y configuraciones multi-GPU. No se documenta su ejecucion en GPUs consumer de 24 GB sin cuantizacion adicional.
- Existe una variante BFP4 para dispositivos con menos memoria.
- Opciones de despliegue: ttnn/tt-metal/tt-forge para Tensix; transformers para GPU/CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-Tensix-BFP8 | 26,54 B | no disponible | BFP8 | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| google/gemma-4-26B-A4B (bf16) | 26,54 B | no disponible | bf16 | Apache 2.0 | GPU/CPU |
| Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4 | 26,54 B | no disponible | BFP4 | Apache 2.0 | Tensix con menos memoria |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26,54 B | no disponible | Q4_K_M | Apache 2.0 | CPU/GPU |

La comparativa se limita a variantes del mismo checkpoint, ya que la informacion disponible no incluye modelos alternativos de otros autores con los que contrastar rendimiento en tareas.

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat: no esta ajustado para instrucciones ni para dialogos; su uso directo produce continuaciones de texto.
- Los sesgos conocidos del modelo base no se documentan en la informacion disponible; se heredan los de google/gemma-4-26B-A4B.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- La evaluacion de fidelidad se limita a 8.184 posiciones de ingles y coreano; el comportamiento en otros idiomas no esta verificado.
- La cuantizacion BFP8 introduce una divergencia no nula (KL 0,00268, top-1 97,29 %), aceptable para muchos usos pero no identica al bf16.
- El soporte esta verificado sobre el simulador Blackhole (ttsim); no se documenta validacion en silicio real en la model card.
- La licencia Apache 2.0 se aplica segun la model card del modelo base, que no incluye archivo LICENSE en su repositorio; el autor aporta el texto estandar.
- El autor declara no estar afiliado a Tenstorrent.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tenstorrent-Tensix-BFP4
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
