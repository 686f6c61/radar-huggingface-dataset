# Xylolabs/Qwen3.5-9B-Tensix-BFP8

## Resumen

Qwen3.5-9B-Tensix-BFP8 es una cuantización del modelo Qwen3.5-9B de Alibaba Qwen, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura original del base (atención con capas Gated DeltaNet híbridas, módulo MTP y torre visual) y sustituye las proyecciones lineales del modelo de lenguaje por valores redondeados a la rejilla `ttnn.bfloat8_b`, un formato de coma flotante por bloques (BFP8) que TT-NN empaqueta sin volver a redondear.

El interés práctico es doble: por un lado, permite ejecutar un modelo de ~9.650 millones de parámetros en hardware Tensix con un peso medio de 10,21 bits por parámetro y un tamaño empaquetado de 11,42 GB, frente a los 17,91 GB en BF16; por otro, demuestra una metodología de cuantización (GPTQ sobre la rejilla BFP8) que preserva la calidad con una divergencia KL media de solo 0,00074 respecto a BF16 y un top-1 del 98,68 %.

La relevancia es acotada pero clara: es una de las primeras publicaciones que combina un modelo multimodal reciente de Qwen con el stack de Tenstorrent (`tt-metal`, `ttnn`, `tt-forge`), un ecosistema con menos checkpoints optimizados que CUDA. No obstante, el autor advierte que la validación se ha hecho sobre el simulador `ttsim` de Blackhole con `ttnn` 0.81.1, no sobre silicio real, y que el demo oficial de tt-metal no ejecuta este checkpoint a su precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención (8 capas) + Gated DeltaNet (24 capas), MLP en 32 capas, módulo MTP y torre visual; cuantización BFP8 por bloques |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones lineales; BF16 en embedding, LM head, normas, `mtp` y `visual`. Media de 10,21 bits por peso |
| Idiomas soportados | No disponible (evaluación en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16 en disco, valores ya situados en la rejilla BFP8); compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida en la que conviven capas de atención clásica (8 capas, con proyecciones q, k, v, o) y capas Gated DeltaNet (24 capas, con proyecciones q, k, v, z, a, b y output), más un MLP de 32 capas con proyecciones gate, up y down. Incluye además un bloque MTP (multi-token prediction) y una torre visual, lo que explica su pipeline `image-text-to-text`. El checkpoint cuantizado mantiene intactos en BF16 el embedding, el LM head, las normas, el bloque MTP y la parte visual; solo se redondean las proyecciones lineales del modelo de lenguaje.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, usando como exponente compartido de cada bloque el que emplea el propio empaquetador de TT-NN. La calibración se hizo con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son ficheros en BF16 cuyos valores ya caen exactamente sobre la rejilla BFP8, de modo que TT-NN los empaqueta sin redondeo adicional; el repositorio incluye `quant4.json` con el formato de cada proyección. El autor solo redondeó y evaluó el modelo de lenguaje, no la torre visual ni el bloque MTP.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo de razonamiento (`thinking`) activable.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado de la torre visual del modelo base, aunque no evaluada en esta cuantización.
- Razonamiento multi-paso: la evaluación incluye 7 prompts de razonamiento ejecutados con thinking activado.
- Multilingüismo parcial verificado en inglés y coreano durante la calibración y la evaluación; el resto de idiomas del base no está documentado en esta ficha.
- Predicción multi-token (bloque MTP) presente en el checkpoint en BF16.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agente en la información disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent: el checkpoint está pensado para empaquetarse directamente en `ttnn.bfloat8_b` sobre Wormhole o Blackhole, reduciendo el peso de 17,91 GB a 11,42 GB y liberando DRAM del dispositivo para KV cache y activaciones.
- Inferencia de un modelo multimodal de 9,6B en un único Blackhole P150: el demo de tt-metal para Qwen3.5/3.6 ejecuta el modelo base en una sola tarjeta; este checkpoint sirve como referencia de precisión para adaptar dicho demo.
- Investigación en cuantización BFP8: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que ningún valor cambia al empaquetar, lo que facilita estudios de sensibilidad por capa.
- Servicio conversacional con `transformers`: la carga estándar con `AutoModelForCausalLM` y `dtype="bfloat16"` permite usar el modelo en pipelines de Hugging Face sin hardware Tensix, a costa de perder la ventaja de empaquetado.
- Evaluación comparativa de formatos: la tabla de evaluación frente a BF16 y Q4_K_M de llama.cpp permite medir el coste de calidad de BFP8 (KL 0,00074, top-1 98,68 %) frente a cuantizaciones de 4-5 bits.
- Base para exportaciones BFP4: el autor indica que el demo de tt-metal empaqueta gate y up del MLP en `bfloat4_b`, por lo que este checkpoint sirve de punto de partida para generar una variante BFP4 coherente con ese runtime.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP8)** | 10,21 | 11,422 | 0,00074 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

La KL y el top-1 se calculan sobre 16.312 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática más 7 de razonamiento con thinking activado (40 en total); "perdidas" cuenta las correctas en BF16 que fallan aquí. Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~18 GB en BF16 para cargar con `transformers`; ~11,4 GB empaquetados en BFP8 sobre Tensix.
- GPU consumer: cabe en tarjetas con 24 GB o más (RTX 3090, RTX 4090) en BF16; en GPUs de 16 GB requeriría cuantización adicional no incluida en el repositorio.
- GPU de datacenter: A100 40/80 GB, H100, L40S sin problema en BF16.
- Hardware objetivo: NPU Tensix de Tenstorrent, Wormhole y Blackhole; validado con `ttnn` 0.81.1 sobre el simulador `ttsim` de Blackhole, no sobre silicio.
- Opciones de despliegue: `transformers` (soporte estándar), `tt-metal` (demo Qwen3.5/3.6 en la rama v0.81.1, con la salvedad de que repaqueta gate y up en `bfloat4_b`), `tt-forge`/`tt-xla` (no probado con este checkpoint; por defecto mantiene BF16 y su opción `bfp_bf8` reempaqueta en layout [out, in] y vuelve a redondear).
- `llama.cpp`, vLLM, Ollama y TGI: no se documenta soporte para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Tensix-BFP8 | 9,65B | No disponible | BFP8 (10,21 bits/peso) | Apache-2.0 | Hugging Face, validado en simulador |
| Qwen/Qwen3.5-9B (BF16) | 9,65B | No disponible | BF16 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B Q4_K_M (llama.cpp) | 9,65B | No disponible | Q4_K_M (5,02 bits/peso) | Apache-2.0 | Generado localmente con llama.cpp |

La comparación relevante es de formato más que de modelo: BFP8 conserva 38 de 40 respuestas correctas con 10,21 bits por peso, mientras que Q4_K_M baja a 37 de 40 con 5,02 bits. No se dispone de datos de otros checkpoints Tensix comparables en la información proporcionada.

## Limitaciones y advertencias

- Validación solo en simulador: probado con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole), no en hardware real; el rendimiento y la corrección en silicio están por confirmar.
- El demo de tt-metal no ejecuta este checkpoint a su precisión: repaqueta gate y up del MLP en `bfloat4_b` y vuelve a redondear el LM head y el MTP a `bfloat8_b`; para ese demo encaja mejor una exportación BFP4.
- `tt-forge`/`tt-xla` no se ha probado con este checkpoint y su opción `bfp_bf8` reempaqueta en layout [out, in] con nuevo redondeo.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el bloque MTP no tienen métricas de calidad publicadas.
- La evaluación se limita a 16.312 posiciones de inglés y coreano y 40 prompts cortos; no hay benchmarks estándar ni cobertura multilingüe amplia.
- Riesgo de alucinación y sesgos del modelo base: no documentados específicamente en esta ficha; deben asumirse los del Qwen3.5-9B original.
- Longitud de contexto no disponible en la información proporcionada; conviene consultar la model card del base antes de diseñar aplicaciones con contexto largo.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del hardware y del stack de Tenstorrent (`tt-metal`, `ttnn`) se rigen por sus propias licencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP8/blob/main/LICENSE
