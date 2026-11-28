# Xylolabs/gemma-4-12B-it-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-12B-it-Tensix-BFP4` es una cuantizacion del modelo multimodal `google/gemma-4-12B-it` desarrollada por Xylolabs, orientada especificamente a la inferencia sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole, nucleos Tensix). El modelo conserva la naturaleza any-to-any del original (entrada y salida de texto, imagen y audio) y aplica cuantizacion de bloque en coma flotante de 4 bits (`bfloat4_b`, BFP4) a las proyecciones de atencion y MLP, manteniendo en bf16 el LM head, los embeddings, las normas y los modulos de vision y audio.

El problema que resuelve es el despliegue eficiente de un modelo de ~13.000 millones de parametros en hardware Tensix con un presupuesto de memoria reducido: el checkpoint empaquetado ocupa 8,146 GB frente a los 23,81 GB en bf16, lo que permite ejecutarlo en dispositivos con DRAM limitada sin recurrir a formatos de cuantizacion de proposito general como Q4_K_M. Segun la model card, la fidelidad respecto al modelo base es superior a la de Q4_K_M de llama.cpp: KL medio de 0,12030 frente a 0,16924, y top-1 del 87,96 % frente al 85,52 %.

Es relevante ahora porque el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge) carece de checkpoints cuantizados de modelos frontera listos para usar, y esta publicacion incluye tanto los pesos empaquetados como las herramientas de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) bajo licencia Apache 2.0. El modelo base es Gemma 4, con arquitectura descrita en el informe tecnico arXiv:2607.02770.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`); atencion y MLP cuantizados a BFP4 |
| Parametros totales | 12.966.363.184 (~12,97 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) para q, k, v, o y MLP gate/up/down; bf16 para LM head, embeddings, normas, `embed_audio`, `embed_vision` y `vision_embedder`; compatible tambien con empaquetado exacto en `bfloat8_b` (bfp8) |
| Idiomas soportados | no disponible (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 26,0 GB; checkpoint empaquetado para Tensix de 8,146 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del checkpoint `google/gemma-4-12B-it`, no un modelo entrenado desde cero. La arquitectura subyacente es la de Gemma 4, un transformer multimodal unificado (`gemma4_unified`) con pipeline `any-to-any`, que integra codificadores de vision y audio junto al decodificador de lenguaje. La model card detalla que la cuantizacion afecta a 48 capas en las proyecciones de atencion q, k y o, a 40 capas en la proyeccion v (lo que sugiere atencion con capas sin value en parte de la pila, sin mas detalle disponible) y a las proyecciones MLP gate, up y down de las 48 capas. El resto de tensores permanece en bf16.

El metodo de cuantizacion es GPTQ con busqueda de exponente por bloque (block floating point), implementado en el repositorio `tensix-bfp-gptq`. No se proporcionan datos sobre el dataset de calibracion, el numero de tokens de entrenamiento original ni si el modelo base uso RLHF o DPO; esa informacion corresponderia al informe tecnico de Gemma 4 (arXiv:2607.02770), no incluido aqui. La innovacion destacable es el formato BFP4 empaquetado nativamente para `ttnn`, con verificacion de round-trip exacto a traves de DRAM del dispositivo y compatibilidad de los mismos valores con `ttnn.bfloat8_b`.

## Capacidades

- Generacion de texto y razonamiento conversacional en formato chat (la model card emplea `apply_chat_template`).
- Procesamiento multimodal any-to-any: entrada de imagen y audio (`embed_vision`, `embed_audio`, `vision_embedder` en bf16), con salida de texto.
- Cuantizacion selectiva que preserva la calidad de las proyecciones mas sensibles (embeddings, LM head, normas) en bf16.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer` con `dtype="bfloat16"` y `device_map="auto"`.
- Ejecucion nativa en NPU Tensix a traves de `ttnn` (layouts `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`) y del runner `tensix-runner`.
- Soporte de tool calling, agentes, modo thinking, vision detallada o audio generativo: no disponible en la informacion proporcionada (se infiere la parte multimodal de los tensores presentes, pero no se documentan capacidades concretas).
- Capacidades multilingues: no disponible; la evaluacion cubre ingles y coreano.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede cargar el checkpoint de 8,146 GB en DRAM y ejecutar inferencia sin GPU, usando `ttnn` y los kernels de `tensix-kernels`; el ahorro frente a bf16 (23,81 GB) es de aproximadamente un 66 %.
- Servicio de chat multimodal en edge o on-premise: al conservar los embedders de vision y audio en bf16, puede gestionar conversaciones que combinen texto e imagen con el mismo checkpoint cuantizado, util en entornos con requisitos de soberania de datos.
- Evaluacion comparativa de cuantizaciones: sirve como referencia reproducible para medir KL y top-1 frente a Q4_K_M, gracias a que la model card publica el sha256 del checkpoint Q4_K_M usado y las herramientas `verify_grid.py` y `pack_tensix.py`.
- Investigacion en formatos block floating point: el repo incluye `quant4.json` con el formato por proyeccion, lo que permite estudiar el impacto de cuantizar selectivamente 40 frente a 48 capas en la proyeccion v.
- Prototipado de pipelines any-to-any en `transformers`: con `device_map="auto"` puede ejecutarse en GPU convencional para validar aplicaciones antes de portarlas a Tensix, aunque con mayor huella de memoria que el empaquetado BFP4.
- Integracion en flujos CI de cuantizacion: los scripts de empaquetado y verificacion permiten automatizar la comprobacion de que cada matriz se reconstruye de forma exacta tras el round-trip por dispositivo.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-12B-it`) | 23,81 | 0 | 100 |
| **Este modelo (BFP4)** | 8,146 | 0,12030 | 87,96 |
| Q4_K_M (llama.cpp) | 7,381 | 0,16924 | 85,52 |

La evaluacion cubre 8.048 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), aplicando la plantilla de chat. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM para inferencia: 8,146 GB en formato empaquetado BFP4 para Tensix; 23,81 GB si se carga el modelo base en bf16. El repositorio completo en disco ocupa 26,0 GB.
- GPU recomendadas para la ruta `transformers`: no especificadas; por tamano, una GPU con al menos 24 GB (RTX 4090, L40S, A100 40 GB) es el minimo razonable en bf16, aunque no se documenta oficialmente.
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole con soporte `tt-metal`, `ttnn` y `tt-forge`.
- Cabe en GPU de consumo: no hay confirmacion oficial; en bf16 (23,81 GB) no cabe en GPUs de 16 GB o menos sin cuantizacion adicional.
- Opciones de despliegue: `transformers` (ruta de referencia), `ttnn` con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0 para Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (BFP4) | ~12,97 B | no disponible | BFP4, 8,146 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-12B-it` (bf16) | ~12,97 B | no disponible | bf16, 23,81 GB | Apache 2.0 | GPU/CPU generico |
| Q4_K_M de llama.cpp | ~12,97 B | no disponible | Q4_K_M, 7,381 GB | Apache 2.0 (derivado) | CPU/GPU via llama.cpp |

La comparativa se limita al mismo checkpoint en distintas precisiones, ya que la informacion proporcionada no incluye otros modelos de la competencia. Frente a Q4_K_M, este modelo ocupa un 10,4 % mas de espacio pero reduce el KL medio un 28,9 % y mejora el top-1 en 2,44 puntos porcentuales.

## Limitaciones y advertencias

- Es una cuantizacion PTQ: introduce una divergencia medible respecto a bf16 (KL 0,12030, top-1 87,96 %), por lo que no es adecuada cuando se requiere paridad exacta con el modelo original.
- La cuantizacion esta disenada y verificada para Tensix; su uso en GPU mediante `transformers` es funcional segun la model card, pero no se documenta su rendimiento ni su fidelidad en esa ruta.
- No se detalla el dataset de calibracion de GPTQ, lo que impide evaluar sesgos introducidos por la calibracion ni la cobertura idiomatica mas alla de ingles y coreano.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas de factualidad para esta cuantizacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La model card indica que el repositorio del modelo base no incluye fichero LICENSE y que el texto Apache 2.0 se aporta en este repo junto con un NOTICE de cambios; conviene revisar ambas cosas antes de un uso comercial en produccion.
- El identificador del repo aparece de forma inconsistente en la model card (`...-Tenstorrent-Tensix-BFP4` frente al ID de Hugging Face `...-Tensix-BFP4`); verificar la ruta exacta al descargar.
- No se documentan la longitud de contexto, los idiomas soportados ni el throughput, datos criticos para dimensionar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Codigo en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Informe tecnico de Gemma 4: https://arxiv.org/abs/2607.02770
