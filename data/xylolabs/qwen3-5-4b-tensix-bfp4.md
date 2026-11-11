# Xylolabs/Qwen3.5-4B-Tensix-BFP4

## Resumen

Qwen3.5-4B-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.5-4B publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (Wormhole y Blackhole). El modelo mantiene la arquitectura original de Qwen3.5-4B —que combina capas de atención clásica con capas Gated DeltaNet y un bloque MTP (multi-token prediction)— pero redondea todas las proyecciones lineales del modelo de lenguaje al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4, 4,5 bits por peso) mediante GPTQ. El resultado son pesos almacenados en bf16 cuyos valores ya descansan sobre la rejilla BFP4, de modo que TT-NN puede empaquetarlos sin un segundo redondeo.

El interés del checkpoint es doble. Por un lado, demuestra una ruta de cuantización de bajo nivel (block floating point con búsqueda de exponente por bloque) que reduce el peso medio a 6,24 bits y el tamaño empaquetado a 3,28 GB frente a los 8,41 GB en BF16, con una divergencia media de KL de 0,04447 respecto al modelo original y un 89,58 % de coincidencia top-1. Por otro, es un artefacto pensado para el ecosistema tt-metal/ttnn: incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y un fichero `quant4.json` que describe el formato de cada proyección.

Conviene subrayar que el autor indica que solo se cuantizó y evaluó el modelo de lenguaje; los tensores `visual` y `mtp` permanecen en bf16 sin cambios. La verificación en hardware Tenstorrent no se completó: las pruebas se hicieron con el simulador ttsim (Blackhole) y con el demo de tt-metal v0.81.1, que solo construyó las capas 0 a 3 del checkpoint. Es, por tanto, un modelo experimental y de nicho, no un reemplazo listo para producción del Qwen3.5-4B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5 (atención clásica + Gated DeltaNet + bloque MTP), cuantizado a BFP4 en capas lineales |
| Parametros totales | 5.295.564.288 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embedding, LM head, normas, `mtp` y `visual`. Media de 6,24 bits/peso |
| Idiomas soportados | no disponible (calibración GPTQ en inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP4); repo de 10,6 GB, 3,28 GB empaquetados |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida: 8 capas con atención q/k/v/o clásica, 24 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y output) y 32 capas MLP con proyecciones gate, up y down. Incluye además un bloque MTP (multi-token prediction) y un módulo visual, ambos preservados en bf16. Sobre esta base, Xylolabs aplica GPTQ con búsqueda de exponente por bloque para redondear cada proyección lineal a BFP4, calibrando con 65.536 tokens de WikiText-2 y Wikipedia en coreano. El fichero `quant4.json` documenta el formato asignado a cada proyección.

La innovación técnica principal no está en el entrenamiento sino en el formato de compresión: el block floating point comparte un exponente por bloque, lo que permite que TT-NN empaquete los pesos directamente sin volver a redondear. El autor verifica que los valores empaquetados en `ttnn.bfloat4_b` (y también en `ttnn.bfloat8_b`) son idénticos a los del checkpoint. No se documenta RLHF, DPO ni detalles adicionales del entrenamiento del modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento con modo "thinking" (el autor evalúa 7 prompts de razonamiento con thinking activado).
- Procesamiento image-text-to-text según el pipeline declarado, aunque los tensores visuales no fueron cuantizados ni evaluados.
- Razonamiento multi-paso y predicción multi-token gracias al bloque MTP (preservado en bf16).
- Capacidades multilingües: no documentadas explícitamente; la calibración incluyó inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está empaquetado para TT-NN, de modo que se puede cargar directamente en DRAM del dispositivo sin recuantizar, reduciendo el peso de 8,41 GB a 3,28 GB.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ con block floating point y búsqueda de exponente por bloque, con scripts de verificación incluidos.
- Validación de pipelines tt-metal: el demo Qwen3.5/3.6 de tt-metal v0.81.1 lee las formas desde `config.json`, por lo que este checkpoint permite probar la ruta de carga con `MESH_DEVICE=P150`.
- Prototipado de asistentes conversacionales en hardware de borde: con 3,28 GB empaquetados y licencia Apache-2.0, es viable para pruebas de concepto en entornos con memoria limitada.
- Evaluación comparativa de formatos: el fichero `quant4.json` y las métricas KL/top-1 permiten contrastar BFP4 frente a Q4_K_M de llama.cpp en el mismo modelo base.
- Desarrollo de kernels TT-NN: los scripts `pack_tensix.py --device` y `verify_grid.py` facilitan la validación de empaquetado y round-trip por DRAM en el simulador ttsim.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP4)** | 6,24 | 3,281 | 0,04447 | 89,58 | 33 de 40 | 1 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.312 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 3,28 GB empaquetados en BFP4; 8,41 GB si se carga en BF16 en un dispositivo convencional.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix). Probado con ttnn 0.81.1 sobre ttsim (simulador Blackhole), no en hardware real.
- GPU consumer: no es el objetivo del checkpoint; al estar los pesos en bf16 sobre la rejilla BFP4, una GPU convencional los cargaría como bf16 (8,41 GB), por lo que cabría en GPUs con al menos 10-12 GB de VRAM, aunque sin la ventaja del empaquetado BFP4.
- Despliegue: transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`), tt-metal v0.81.1 con `MESH_DEVICE=P150`, y verificación con `pack_tensix.py` / `verify_grid.py`.
- Latencia y throughput: no disponibles. El autor indica que no se ejecutó una pasada completa en hardware ni con tt-forge (tt-xla).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Tensix-BFP4 | 5.295.564.288 | no disponible | 6,24 | 3,28 GB | Apache-2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-4B (BF16) | 5.295.564.288 | no disponible | 16 | 8,41 GB | Apache-2.0 | Hugging Face |
| Qwen3.5-4B Q4_K_M (llama.cpp) | 5.295.564.288 | no disponible | 5,13 | 2,783 GB | Apache-2.0 (derivado) | llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información disponible no incluye alternativas de otros desarrolladores. Frente a Q4_K_M, el checkpoint BFP4 ocupa algo más de espacio y presenta peor KL y top-1, pero está diseñado para empaquetarse sin recuantización en TT-NN, lo que Q4_K_M no ofrece.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; los tensores `visual` y `mtp` permanecen en bf16 y no fueron validados.
- No se ha ejecutado en hardware Tensix real: las pruebas usan el simulador ttsim y el demo de tt-metal solo construyó las capas 0 a 3. Una pasada completa no fue probada.
- tt-transformers no soporta esta arquitectura; tt-forge (tt-xla) no se ha probado con este checkpoint.
- El demo de tt-metal vuelve a redondear el LM head (siempre en bfloat8_b) y el bloque MTP (bfloat8_b, con gate/up en bfloat4_b), lo que introduce una divergencia adicional respecto al checkpoint.
- Pérdida de calidad medible: KL media de 0,04447 y top-1 del 89,58 % frente a BF16, con una respuesta perdida en la batería de evaluación.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredables del modelo base.
- Idiomas soportados no declarados; la calibración se limitó a inglés y coreano.
- Licencia Apache-2.0 permite uso comercial, pero la naturaleza experimental y la falta de validación en hardware desaconsejan su uso en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP4/blob/main/LICENSE
