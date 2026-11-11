# Xylolabs/gemma-4-12B-it-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-12B-it-Tensix-BFP8` es una cuantizacion del modelo multimodal `google/gemma-4-12B-it` realizada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original de Gemma 4 (transformer multimodal any-to-any, con torres de vision y audio) y sustituye unicamente las proyecciones lineales del transformer por pesos redondeados a la rejilla `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque) mediante GPTQ.

La particularidad tecnica es que los tensores se almacenan en bf16, pero cada valor ya esta alineado a la rejilla BFP8 del empaquetador de TT-NN, de modo que el runtime de Tenstorrent puede empaquetarlos sin re-redondeo adicional. El resultado es un modelo de 12.966.363.184 parametros que ocupa 13,60 GB empaquetado (9,13 bits por peso de media) frente a los 23,81 GB del BF16 original, con una divergencia medida muy baja respecto al modelo de referencia (KL medio de 0,00183 y 98,35 % de top-1 sobre 8.048 posiciones).

Es relevante porque demuestra que es posible una cuantizacion de 8 bits por bloque con perdida practicamente nula en un modelo multimodal de 12B, y porque publica el pipeline de verificacion (packer y scripts de comprobacion) para integrarlo en el stack `tt-metal`/`ttnn`. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4 unified), 48 capas, con torres de vision y audio |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en proyecciones de atencion (q, k, v, o) y MLP (gate, up, down); bf16 en LM head, embeddings, normas y torres de vision/audio |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8); `quant4.json` describe el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer multimodal "any-to-any" que procesa y genera texto, imagen y audio. La cuantizacion afecta exclusivamente al modelo de lenguaje: las 48 capas del transformer tienen sus proyecciones de atencion (q, k, v, o) y de MLP (gate, up, down) redondeadas a la rejilla `bfloat8_b`, es decir, punto flotante por bloques con exponente compartido y 8,5 bits efectivos por peso. El resto de tensores (LM head atada al embedding, embeddings, normas, `embed_audio`, `embed_vision` y `vision_embedder`) permanece en bf16 sin tocar.

El proceso de cuantizacion es GPTQ sobre la propia rejilla BFP8, usando como exponente compartido de cada bloque el que asigna el empaquetador de TT-NN, y calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado medio es de 9,13 bits por peso y 13,60 GB empaquetados. El autor solo redondeo y evaluo el modelo de lenguaje; las torres de vision y audio no fueron cuantizadas ni evaluadas. El repositorio incluye `pack_tensix.py` (empaqueta cada matriz y comprueba que ningun valor cambia) y `verify_grid.py` (verifica la rejilla solo con PyTorch). Las pruebas se hicieron con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre hardware real.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de chat propia.
- Procesamiento de imagen y audio (pipeline `image-text-to-text` / `any-to-any`), aunque las torres correspondientes quedan en bf16 sin evaluar.
- Modo "thinking" (razonamiento extendido), segun la evaluacion del autor que repite 7 prompts de razonamiento con thinking activado.
- Capacidades multilingues del modelo base (evaluacion parcial en ingles y coreano).
- Integracion con el stack de Tenstorrent: `tt-metal` (demo de Gemma 4 v0.81.1), `ttnn` y `tt-forge`/`tt-xla`.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer` en bf16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado en la informacion proporcionada.

## Casos de uso

- Inferencia en NPU Tenstorrent: el caso principal. El modelo esta pensado para cargarse en Wormhole o Blackhole mediante `ttnn.as_tensor` con `ttnn.bfloat8_b`, reduciendo el peso en DRAM de 23,81 GB a 13,60 GB sin re-redondeo en el empaquetado.
- Despliegue multimodal en un solo Blackhole P150: la demo de `tt-metal` v0.81.1 ejecuta las variantes E2B, E4B y 12B en una unica tarjeta; este checkpoint encaja en el mismo flujo con una entrada de `precision_overrides.json` que fija atencion y MLP en `bfp8`.
- Servicio de chat con contexto largo: al mantener el LM head y los embeddings en bf16 y solo comprimir las proyecciones, se preserva la calidad conversacional (98,35 % de top-1 frente a BF16) con menor huella de memoria.
- Prototipado en `transformers`: la quickstart permite cargar el modelo en bf16 con `device_map="auto"` para validar respuestas antes de portarlo a la NPU, util como paso de verificacion en CI.
- Validacion de pipelines de cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar bit a bit que el empaquetado BFP8 no altera valores, lo que sirve como test de regresion para otras cuantizaciones del mismo stack.
- Investigacion sobre formatos de bloque: el par `quant4.json` + pesos alineados facilita experimentos con `bfp4` o `bfp8` en `tt-forge`, comparando la perdida de calidad (el autor mide un re-redondeo del 8-25 % de valores con `bfp_bf8` en las dos primeras capas).
- Evaluacion de cuantizacion en modelos multimodales: la tabla de KL y top-1 frente a BF16 y Q4_K_M sirve de referencia para estudiar el impacto de formatos de 8 bits por bloque en lugar de 4 bits por escalar.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B-it`) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP8)** | 9,13 | 13,596 | 0,00183 | 98,35 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

Las metricas de KL y top-1 se calculan sobre 8.048 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las "respuestas" son 33 prompts cortos con comprobacion automatica mas 7 de razonamiento repetidos con thinking activado (40 en total). Q4_K_M se genero del mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,60 GB empaquetado en BFP8; 23,81 GB si se carga en bf16 con `transformers`.
- NPU objetivo: Tensix de Tenstorrent, modelos Wormhole y Blackhole. La demo de `tt-metal` v0.81.1 ejecuta la variante 12B en una sola Blackhole P150.
- GPU consumer: no es el objetivo del checkpoint; en bf16 (23,81 GB) no cabe en GPUs de 16 GB y requiere al menos 24 GB (RTX 3090/4090) con cuantizacion adicional o descarga parcial. En BFP8 el formato es especifico de TT-NN y no se puede ejecutar directamente en CUDA sin reconvertir.
- Despliegue: `ttnn` 0.81.1 (probado en `ttsim`), `tt-metal` (demo de Gemma 4), `tt-forge`/`tt-xla` (sin soporte verificado para Gemma 4), y `transformers` en bf16 para validacion.
- Latencia y throughput: no disponible. Las pruebas se realizaron en simulador, no en hardware, por lo que no hay cifras reales de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Xylolabs/gemma-4-12B-it-Tensix-BFP8` | 12,97B | no disponible | BFP8 (safetensors) | 13,60 GB | Apache 2.0 | Hugging Face, orientado a Tensix |
| `google/gemma-4-12B-it` (BF16) | 12,97B | no disponible | bf16 (safetensors) | 23,81 GB | Apache 2.0 | Hugging Face, uso general |
| Q4_K_M de llama.cpp (mismo checkpoint) | 12,97B | no disponible | GGUF 4 bits | 7,381 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |
| Otras cuantizaciones de Gemma 4 12B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las tres variantes documentadas por el autor. No se dispone de datos de otros modelos de 12B multimodales con los que contrastar rendimiento en benchmarks estandar.

## Limitaciones y advertencias

- Solo se cuantizo y evaluo el modelo de lenguaje; las torres de vision y audio (`embed_audio`, `embed_vision`, `vision_embedder`) permanecen en bf16 y no fueron evaluadas, por lo que su comportamiento en BFP8 no esta caracterizado.
- Las pruebas en Tensix se hicieron sobre `ttsim` (simulador de Blackhole con `ttnn` 0.81.1), no sobre hardware real; no hay garantia de rendimiento ni de estabilidad en Wormhole o Blackhole fisicos.
- `tt-transformers` no soporta Gemma 4; la integracion requiere la demo de `tt-metal` y una entrada manual en `precision_overrides.json`.
- `tt-forge`/`tt-xla` no se ha ejecutado con Gemma 4; su opcion `bfp_bf8` re-redondea entre el 8 % y el 25 % de los valores (medido en las dos primeras capas) y `bfp_bf4` los redondea aun mas, degradando la fidelidad.
- El checkpoint esta pensado para el layout `[in, out]` de TT-NN; usarlo en otros runtimes requiere transposicion y posible re-redondeo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base `google/gemma-4-12B-it`.
- Idiomas: la evaluacion cubre solo ingles y coreano; el resto de idiomas del modelo base no esta verificado tras la cuantizacion.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de desplegar en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 11 de noviembre de 2026) sin validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Revision del modelo base citada: https://huggingface.co/google/gemma-4-12B-it/tree/43c9d014b231474fa7212dbb48a762566c2b255d
- Codigo del pipeline de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP8/blob/main/LICENSE
