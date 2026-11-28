# Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP

## Resumen
Esta ficha describe `Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP`, una cuantizacion del modelo multimodal `google/gemma-4-31B-it` realizada por Xylolabs y optimizada para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El objetivo concreto es reducir el peso del modelo para que quepa en la memoria DRAM de las NPU de Tenstorrent sin degradar en exceso la calidad respecto al checkpoint en bf16. El resultado empaqueta 23,534 GB frente a los 61,39 GB del original, aplicando BFP4 a las proyecciones MLP y BFP8 a las de atencion.

La relevancia de esta variante es de nicho pero clara: demuestra que es viable ejecutar un modelo de aproximadamente 32.700 millones de parametros con vision integrada sobre hardware no-GPU, usando el formato de bloque flotante nativo de Tensix. Incluye utilidades de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban la integridad de cada matriz, tanto en CPU como en DRAM del dispositivo.

No se trata de un modelo nuevo ni de un fine-tuning: la arquitectura, el tokenizador y los pesos base son los de Gemma 4 31B instruct. Los idiomas soportados, la longitud de contexto y los detalles de entrenamiento no se documentan en la informacion disponible y deben consultarse en la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del modelo base Gemma 4; cuantizacion por bloques para Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP; BFP8 (`bfloat8_b`) en atencion; bf16 en LM head, embeddings, norms, `embed_vision` y `vision_tower` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix), con `quant4.json` y `model.safetensors.index.json` |
| Tamano empaquetado | 23,534 GB (frente a 61,39 GB en bf16) |
| Tamano del repo | 65,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo base `google/gemma-4-31B-it`, un transformer multimodal que procesa imagen y texto. Esta variante no reentrena el modelo: aplica una cuantizacion post-entrenamiento. Las proyecciones MLP (`gate`, `up`, `down`) de las 60 capas se cuantizan a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque. Las proyecciones de atencion (`q`, `k`, `o` en 60 capas y `v` en 50 capas) se cuantizan a `bfloat8_b` por redondeo al mas cercano. El LM head (atado al embedding), las normas, el tower de vision y `embed_vision` permanecen en bf16.

El detalle tecnico diferencial es el uso del formato de bloque flotante de Tensix, que comparte exponente por bloque y encaja con las unidades matriciales de las NPU Wormhole y Blackhole. El repositorio incluye `quant4.json`, que lista el formato de cada proyeccion, y las herramientas `pack_tensix.py` y `verify_grid.py` (del proyecto `tensix-bfp-gptq`) para empaquetar matrices y verificar la ida y vuelta de cada tensor contra la representacion en torch. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Generacion de texto conversacional en formato chat, con plantilla de chat aplicada via `apply_chat_template`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento y respuesta a instrucciones propias de un modelo `-it` (instruct).
- Capacidades de codigo y matematicas del modelo base: no verificadas de forma independiente en esta cuantizacion.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; la evaluacion cubre texto en ingles y coreano.
- Ejecucion en hardware Tensix mediante `ttnn`, `tt-metal` y `tt-forge`, ademas de carga estandar con transformers.

## Casos de uso
- Despliegue en NPU Tenstorrent: el caso principal. El modelo esta empaquetado para cargarse en DRAM de Wormhole o Blackhole con `ttnn.as_tensor` y los kernels de `tensix-kernels`, lo que permite servir inferencia sin GPU.
- Prototipado de pipelines multimodales en hardware no-CUDA: al mantener el pipeline `image-text-to-text`, se puede usar para tareas de descripcion de imagenes o VQA en entornos con aceleradores Tensix.
- Validacion de cuantizacion BFP4/BFP8: sirve como referencia para equipos que quieran medir el impacto de BFP4 en MLP frente a BFP8 en atencion usando la tabla de KL y top-1 publicada.
- Servicio conversacional de contexto medio: con la plantilla de chat y generacion estandar de transformers, puede integrarse en un backend de chat siempre que el hardware disponga de memoria suficiente para los 23,5 GB empaquetados.
- Investigacion en formatos de bloque flotante: las herramientas `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y comprobar la fidelidad tensor a tensor.
- Evaluacion comparativa de cuantizaciones: la metrica de KL medio frente a bf16 (0,0600) y top-1 (92,25 %) permite comparar esta variante con Q4_K_M de llama.cpp en el mismo checkpoint.

## Benchmarks y rendimiento
Los unicos datos publicados son metricas de fidelidad de cuantizacion, no benchmarks de tareas (MMLU, HumanEval, GSM8K no estan disponibles).

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-31B-it`) | 61,39 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 attention) | 23,534 | 0,05998 | 92,25 |
| Q4_K_M (llama.cpp) | 18,687 | 0,05170 | 92,69 |

Las metricas de KL y top-1 se calculan sobre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), con la plantilla de chat. Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix; su sha256 es `b33a01989e939a8fbfc00ea0d8a91fb3bdf64460498c2a4ee0ce0783b76aa73e`. Este modelo tiene un KL 1,16 veces mayor que Q4_K_M y un top-1 ligeramente inferior (92,25 % frente a 92,69 %).

## Requisitos de hardware
- VRAM/DRAM estimada: 23,534 GB empaquetado para Tensix; el repo completo ocupa 65,4 GB. Para carga en bf16 con transformers se necesita aproximadamente el tamano del modelo base (61,39 GB), aunque la cuantizacion reduce el peso en disco.
- GPU recomendadas: no se especifican; el destino principal son NPU Tenstorrent Wormhole y Blackhole. Para ejecucion en GPU no hay datos de rendimiento publicados.
- GPU de consumo: no hay datos que confirmen que quepa en RTX 4090 (24 GB) en su formato empaquetado; el peso empaquetado de 23,5 GB se acerca al limite de 24 GB, pero no se documenta compatibilidad con CUDA.
- Opciones de despliegue: `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`), `ttnn` con `tt-metal`, `tt-forge`, `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0. No se mencionan vLLM, TGI, llama.cpp ni Ollama para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 32,68 B | no disponible | BFP4 MLP + BFP8 attention, 23,534 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| `google/gemma-4-31B-it` (bf16) | 32,68 B | no disponible | bf16, 61,39 GB | Apache 2.0 (segun card del base) | Hugging Face |
| Q4_K_M del mismo checkpoint (llama.cpp) | 32,68 B | no disponible | GGUF Q4_K_M, 18,687 GB | Apache 2.0 | Generado localmente con llama.cpp |

La comparacion con otros modelos de tamano similar fuera de la familia Gemma 4 no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion introduce perdida de calidad medible: KL medio de 0,0600 y top-1 de 92,25 % frente a 100 % en bf16.
- La evaluacion de fidelidad solo cubre ingles y coreano; el comportamiento en castellano no esta verificado.
- El modelo esta optimizado para Tensix; su uso en GPU o CPU no esta documentado y puede no aprovechar el formato BFP.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto del modelo base en la informacion disponible.
- La licencia es Apache 2.0 segun la card, pero el repositorio base no incluye fichero LICENSE; el autor indica que `LICENSE` contiene el texto estandar y que los cambios se listan en `NOTICE`.
- El pipeline declarado es `image-text-to-text`, pero el ejemplo de quickstart usa `AutoModelForCausalLM`; conviene verificar la carga multimodal antes de usarlo en produccion.
- El modelo base es `gemma-4-31B-it`, por lo que las restricciones de uso del modelo original podrian aplicar adicionalmente; revisar la card de Google antes de un despliegue comercial.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit del codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
