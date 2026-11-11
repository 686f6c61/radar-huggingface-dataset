# Xylolabs/Qwen3.5-9B-Tensix-BFP4

## Resumen

Qwen3.5-9B-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.5-9B, desarrollada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5 (atención clásica combinada con capas Gated DeltaNet, además de un bloque MTP y un torre visual) y sustituye las proyecciones lineales del modelo de lenguaje por tensores cuantizados en formato block-floating-point de 4 bits (`ttnn.bfloat4_b`), de modo que TT-NN puede empaquetarlos sin re-redondeo adicional.

La relevancia de esta ficha radica en que es un ejemplo poco habitual de cuantización "hardware-aware": no se distribuye en GGUF ni en un formato genérico, sino en safetensors bf16 cuyos valores ya están alineados a la rejilla BFP4 del acelerador. Esto permite cargar el checkpoint directamente en TT-NN con una pérdida de precisión mínima respecto al modelo base en BF16 (KL media de 0,03473 y 90,96 % de top-1 sobre 16.312 posiciones de texto en inglés y coreano).

El checkpoint tiene 9.653.104.368 parámetros totales, ocupa 19,3 GB en el repositorio y 7,96 GB una vez empaquetado en BFP4 (7,11 bits por peso de media). Está publicado bajo licencia Apache-2.0 y solo se ha evaluado la parte de lenguaje; las torres visual y MTP se mantienen en bf16 sin evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5: atención clásica (8 capas) + Gated DeltaNet (24 capas), con bloque MTP y torre visual; cuantización BFP4 de proyecciones lineales |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (el demo de tt-metal incluye una variante `traced_128k`, lo que sugiere soporte de hasta 128K, sin confirmación oficial) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales; bf16 en embeddings, LM head, normas, MTP y torre visual; media de 7,11 bits por peso |
| Idiomas soportados | no disponible (la calibración y evaluación usan inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP4), índice `model.safetensors.index.json` y mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida: 8 capas con atención clásica (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y output), más 32 capas de MLP con proyecciones gate, up y down. A esto se añade un bloque MTP (multi-token prediction) y una torre visual, ambos preservados en bf16 en este checkpoint. La cuantización no altera la topología: solo redondea las proyecciones lineales del modelo de lenguaje a la rejilla `bfloat4_b` mediante GPTQ, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica principal es el empaquetado exacto: los tensores se almacenan en bf16, pero cada valor ya se encuentra en la rejilla BFP4, de forma que TT-NN los empaqueta sin un segundo redondeo (verificable con `pack_tensix.py` y `verify_grid.py`). El mismo checkpoint también se empaqueta de forma exacta en `ttnn.bfloat8_b`. No se dispone de información sobre el proceso de entrenamiento original de Qwen3.5-9B (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo "thinking" (la evaluación incluye 7 prompts de razonamiento repetidos con thinking activado).
- Procesamiento image-text-to-text: la pipeline declarada es `image-text-to-text` y la torre visual se conserva en bf16, aunque no se ha evaluado.
- Predicción multi-token (bloque MTP), que puede desactivarse con `QWEN36_SPEC=0` en el demo de tt-metal.
- Capacidades multilingües: la calibración y evaluación cubren inglés y coreano; el resto de idiomas no está documentado.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Cargar el checkpoint en TT-NN sobre Wormhole o Blackhole permite ejecutar un modelo de 9B con proyecciones en BFP4 sin re-redondear, reduciendo el peso empaquetado a 7,96 GB.
- Prototipado en el simulador ttsim: el autor valida el empaquetado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), lo que permite desarrollar y depurar pipelines antes de disponer de hardware.
- Evaluación de precisión de cuantizaciones: sirve como referencia para medir el impacto de BFP4 frente a BF16 y Q4_K_M mediante KL y top-1 sobre corpus bilingües.
- Investigación en cuantización hardware-aware: el par de scripts `pack_tensix.py` y `verify_grid.py` permite verificar que cada matriz se empaqueta sin pérdida, útil para estudiar rejillas block-floating-point.
- Asistente conversacional bilingüe inglés-coreano: el modelo se calibró y evaluó sobre Wikipedia en coreano, por lo que es adecuado para prototipos en ese par de idiomas.
- Demo de referencia con tt-metal: el demo `qwen36` de tt-metal v0.81.1 ejecuta Qwen3.5-9B en una Blackhole P150, y este checkpoint encaja en él con dos re-redondeos conocidos (LM head y MTP).
- Inferencia con Transformers en GPU: al ser safetensors estándar, puede cargarse con `AutoModelForCausalLM` en bf16 para comparar contra la versión empaquetada, aunque sin ganancia de memoria.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP4)** | 7,11 | 7,962 | 0,03473 | 90,96 | 35 de 40 | 2 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

La evaluación KL y top-1 cubre 16.312 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática, más 7 de razonamiento repetidos con thinking activado (40 en total). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en GPU para inferencia en bf16: aproximadamente 18-20 GB (el repo pesa 19,3 GB); no cabe en GPUs de 16 GB.
- VRAM estimada empaquetado en BFP4 sobre Tensix: 7,96 GB de pesos, más activaciones y caché KV.
- GPU recomendadas para la ruta Transformers: A100 40/80 GB, H100, RTX 4090 (24 GB) para bf16; GPUs de 16 GB requerirían cuantización adicional no incluida.
- Aceleradores objetivo: Tensix de Tenstorrent, Wormhole y Blackhole; el demo de tt-metal se ejecuta en una Blackhole P150.
- Cabe en consumer GPU: sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB no sin cuantizar más.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM` con `dtype="bfloat16"`), TT-NN/tt-metal v0.81.1 (demo `qwen36`), tt-forge (tt-xla) no probado con este checkpoint, ttsim (simulador de Blackhole).
- Latencia y throughput: no disponibles; el autor indica que no se ha probado una ejecución completa en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Tensix-BFP4 | 9,65 B | no disponible | safetensors BFP4, 7,11 bits/peso | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (BF16) | 9,65 B | no disponible | safetensors bf16, 16 bits/peso | Apache-2.0 | Hugging Face |
| Q4_K_M de Qwen3.5-9B (llama.cpp) | 9,65 B | no disponible | GGUF, 5,02 bits/peso | Apache-2.0 | distribución comunitaria |

Frente al BF16, este checkpoint reduce el tamaño de 17,91 GB a 7,96 GB con una KL de 0,03473 y un top-1 del 90,96 %. Frente a Q4_K_M, ocupa más espacio (7,96 GB frente a 5,78 GB) pero logra una KL ligeramente menor (0,03473 frente a 0,03669) y un top-1 algo mayor (90,96 % frente a 90,47 %), aunque Q4_K_M conserva más respuestas correctas en el conjunto de 40 prompts (37 frente a 35). La ventaja diferencial es el empaquetado exacto en TT-NN, que Q4_K_M no ofrece.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; la torre visual y el bloque MTP se mantienen en bf16 sin evaluar.
- El demo de tt-metal no se ha ejecutado completo: el autor solo validó el empaquetado de las proyecciones de las capas 0 a 3 y no probó una ejecución completa en hardware.
- Dos componentes se re-redondean en el demo de tt-metal: el LM head (siempre en bfloat8_b) y el bloque MTP (bfloat8_b, con gate y up en bfloat4_b).
- tt-transformers no soporta esta arquitectura; es necesario usar tt-metal o TT-NN directamente.
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- La calibración de GPTQ se limita a 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede sesgar la precisión hacia esos dominios e idiomas.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de seguridad ni de sesgo.
- Idiomas soportados no documentados más allá del inglés y el coreano usados en evaluación.
- Longitud de contexto no confirmada oficialmente, aunque el demo incluye una variante `traced_128k`.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el modelo base Qwen3.5-9B recae en sus propios términos.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión del modelo base citada: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tensix-BFP4/blob/main/LICENSE
