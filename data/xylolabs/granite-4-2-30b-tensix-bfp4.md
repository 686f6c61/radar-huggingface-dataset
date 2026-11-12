# Xylolabs/granite-4.2-30b-Tensix-BFP4

## Resumen

Granite-4.2-30b-Tensix-BFP4 es una cuantización del modelo base ibm-granite/granite-4.2-30b (IBM Granite 4.2, 30B parámetros) realizada por Xylolabs para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Tensix Wormhole y Blackhole). El modelo no es un modelo nuevo: es el mismo checkpoint de IBM con las capas lineales (atención q/k/v/o y MLP gate/up/down de las 64 capas) cuantizadas a `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ, mientras que embeddings, LM head, normas y demás tensores permanecen en bf16. El resultado ocupa 17,65 GB empaquetados con 4,82 bits por peso de media, frente a los 58,55 GB del modelo en BF16.

El interés práctico de esta ficha es doble. Por un lado, documenta un formato de cuantización poco habitual (block floating point con exponente por bloque) pensado específicamente para el hardware Tensix de Tenstorrent, no para GPUs convencionales. Por otro, ofrece datos de evaluación de fidelidad frente al BF16 original: KL medio de 0,09391 sobre 16.216 posiciones de texto inglés y coreano, top-1 del 88,14 % y 36 de 40 respuestas correctas en un conjunto de pruebas cortas, frente a 35 de 40 del BF16 (sin pérdidas netas). Estos números miden proximidad al modelo original, no rendimiento absoluto en tareas.

La relevancia actual viene de que Tenstorrent está desplegando NPUs Tensix como alternativa de coste a las GPU, y este checkpoint es uno de los primeros intentos públicos de adaptar un modelo de 30B a ese formato. No obstante, el autor advierte que solo se ha validado en `ttsim` (simulador Blackhole) con ttnn 0.81.1, no en hardware real, y que `tt-transformers` no es usable con Granite por incompatibilidad en el multiplicador de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Granite 4.2 de IBM); cuantización post-entrenamiento GPTQ de capas lineales |
| Parametros totales | 29.276.770.304 (29,28B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base granite-4.2-30b) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso en capas lineales) + bf16 en resto; media 4,82 bits/peso; también empaquetable en `ttnn.bfloat8_b` |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP4), más `quant4.json` con el formato de cada proyección |

## Arquitectura y entrenamiento

El modelo subyacente es Granite 4.2 de IBM, un transformer decoder-only de 29,28B parámetros con 64 capas. Esta versión no ha sido reentrenada: es una cuantización GPTQ del checkpoint original, con búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las capas de atención (q, k, v, o) y las MLP (gate, up, down) de las 64 capas se almacenan en `bfloat4_b` a 4,5 bits por peso; embeddings, LM head, normas y el resto de tensores se mantienen en bf16. El autor indica que los ficheros se guardan en bf16 pero con cada valor ya situado en la rejilla BFP4, de modo que TT-NN los empaqueta sin transformación adicional.

La innovación técnica principal es el propio formato block floating point: en lugar de cuantizar por tensor o por grupo lineal, BFP4 comparte un exponente por bloque, lo que encaja con la unidad de cómputo Tensix. El autor documenta una verificación de integridad (`pack_tensix.py` y `verify_grid.py`) que comprueba que el empaquetado no altera ningún valor, y señala que los mismos valores caben exactamente en `ttnn.bfloat8_b`. Como limitación de ingeniería, `tt-transformers` no soporta Granite (lo carga como Llama e ignora el multiplicador de atención 1/128 frente a 1/√128), y `tt-forge` (tt-xla) aún no se ha probado con este checkpoint; por defecto mantiene bf16 exacto y su opción `bfp_bf4` recuantiza en layout [out, in] de PyTorch.

## Capacidades

- Generación de texto conversacional multilingüe en 12 idiomas (en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh).
- Razonamiento con modo "thinking" (el conjunto de evaluación incluye 7 prompts de razonamiento reevaluados con thinking activado).
- Respuesta a prompts cortos con verificación automática (33 prompts más 7 de razonamiento, 40 en total en la evaluación del autor).
- Capacidades del modelo base Granite 4.2 (código, matemáticas, tool calling, agentes) heredadas, aunque no se detallan en la información disponible para esta ficha.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) para inferencia en GPU/CPU convencional.
- No se documenta soporte de visión ni audio en esta variante.

## Casos de uso

- Despliegue en NPUs Tenstorrent: el formato BFP4 está diseñado para empaquetarse directamente en TT-NN, lo que permite servir un modelo de 30B en 17,65 GB sobre Wormhole o Blackhole, reduciendo la presión de memoria frente a los 58,55 GB en BF16.
- Inferencia en GPU de consumo con `transformers`: al cargarse como bf16 (los valores ya están en la rejilla BFP4), puede ejecutarse con `device_map="auto"` en GPUs de 24-48 GB, aunque el ahorro real de memoria solo se materializa al empaquetar en TT-NN.
- Evaluación de fidelidad de cuantización: útil para investigadores que quieran reproducir las métricas KL/top-1 del autor (`verify_grid.py`, `pack_tensix.py`) y comparar BFP4 con Q4_K_M de llama.cpp sobre el mismo checkpoint.
- Asistente conversacional multilingüe: los 12 idiomas soportados y el formato de chat (`apply_chat_template`) permiten atención al cliente o asistentes internos en entornos europeos y asiáticos.
- Razonamiento con thinking mode: los prompts de razonamiento reevaluados con thinking activado sugieren uso en tareas de análisis paso a paso donde la latencia no es crítica.
- Prototipado en simulador: `ttsim` permite validar pipelines TT-NN antes de disponer de hardware Blackhole, útil para equipos que preparan despliegues.
- Investigación sobre block floating point: caso de estudio para comparar BFP4 (4,82 bits/peso, KL 0,09391) frente a Q4_K_M (4,84 bits/peso, KL 0,07629) en la misma base.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor (fidelidad frente al BF16, no rendimiento absoluto en tareas):

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-30b) | 16 | 58,55 | 0 | 100 | 35 de 40 | - |
| Este modelo (BFP4) | 4,82 | 17,651 | 0,09391 | 88,14 | 36 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 17,721 | 0,07629 | 88,96 | 36 de 40 | 0 |

KL y top-1 se calculan sobre 16.216 posiciones de texto inglés y coreano (WikiText-2 test, Wikipedia coreana), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática más 7 de razonamiento con thinking (40 en total). El criterio del autor era KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple con 1,23 veces el KL de Q4_K_M y 0 pérdidas frente a 0.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,65 GB empaquetados en BFP4 (4,82 bits/peso); 58,55 GB si se carga en bf16 con `transformers` tal como se distribuye.
- GPU recomendadas: no especificadas por el autor; por tamaño, encaja en GPUs de 24 GB (RTX 4090, L4) solo si se empaqueta en TT-NN o se recuantiza; en bf16 requiere 80 GB (A100/H100) o multi-GPU.
- NPUs objetivo: Tenstorrent Wormhole y Blackhole (Tensix), validadas solo en `ttsim` (simulador Blackhole) con ttnn 0.81.1, no en hardware real.
- Cabe en consumer GPU: sí en RTX 4090 (24 GB) si se sirve empaquetado en TT-NN o mediante una recuantización adicional; no en bf16.
- Opciones de despliegue: `transformers` (GPU/CPU), TT-NN (`ttnn.as_tensor`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`), `tt-forge` (tt-xla, aún no probado con este checkpoint); `tt-transformers` no es usable con Granite.
- Latencia y throughput: no disponibles; el autor no publica cifras de rendimiento en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|
| Este modelo (BFP4) | 29,28B | 4,82 | 17,65 GB | no disponible | Apache-2.0 | Hugging Face (Xylolabs) |
| ibm-granite/granite-4.2-30b (BF16) | 29,28B | 16 | 58,55 GB | no disponible | Apache-2.0 | Hugging Face (IBM) |
| Q4_K_M (llama.cpp, misma base) | 29,28B | 4,84 | 17,72 GB | no disponible | Apache-2.0 | Generado por el autor |
| granite-4.2-8b (BFP8, referencia del autor) | ~8B | 8 | no disponible | no disponible | Apache-2.0 | Hugging Face (IBM) |

La comparación relevante es con Q4_K_M sobre la misma base: BFP4 tiene KL ligeramente peor (0,09391 frente a 0,07629) pero empata en respuestas correctas (36 de 40) y ocupa 70 MB menos. Frente al BF16, sacrifica top-1 (88,14 % frente a 100 %) a cambio de reducir el tamaño 3,3 veces.

## Limitaciones y advertencias

- Solo validado en simulador (`ttsim`, Blackhole) con ttnn 0.81.1; no hay evidencia de ejecución en hardware Wormhole o Blackhole real.
- `tt-transformers` no soporta Granite: carga el checkpoint como Llama e ignora el multiplicador de atención (1/128 frente a 1/√128), lo que produce divergencias (PCC 0,95 en el 8B de la misma familia).
- `tt-forge` (tt-xla) no se ha probado con este checkpoint; su opción `bfp_bf4` recuantiza en layout [out, in], lo que puede alterar los valores.
- Distribuido en safetensors bf16: cargarlo con `transformers` no ahorra memoria respecto al BF16 (58,55 GB); el ahorro solo se obtiene empaquetando en TT-NN.
- Fidelidad medida solo sobre inglés y coreano (WikiText-2 y Wikipedia coreana); no hay evaluación en los otros 10 idiomas declarados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; heredados del modelo base IBM Granite 4.2.
- Contexto máximo no documentado en esta ficha; debe consultarse en la model card del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre la validez legal del formato BFP4.
- El modelo base y esta cuantización comparten limitaciones de IBM Granite no detalladas aquí; conviene revisar la model card original antes de desplegar.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Xylolabs/granite-4.2-30b-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/granite-4.2-30b-Tensix-BFP4/blob/main/LICENSE
