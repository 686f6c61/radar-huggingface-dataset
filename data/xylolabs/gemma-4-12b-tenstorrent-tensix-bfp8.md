# Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP8

## Resumen

`Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP8` es una cuantización del modelo multimodal `google/gemma-4-12B` publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El checkpoint conserva la arquitectura original de Gemma 4 (transformer con componentes de visión y audio, pipeline `image-text-to-text`/`any-to-any`) y sustituye las proyecciones lineales del modelo de lenguaje por matrices cuantizadas a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ.

El interés de esta ficha radica en que no es una cuantización genérica para GPU, sino un empaquetado pensado para que TT-NN cargue los pesos sin transformación adicional: las matrices se almacenan como valores bf16 situados sobre la rejilla BFP8, de modo que el *packer* de Tenstorrent las empaqueta sin alterar sus valores. Esto permite reducir el peso del modelo de 23,81 GB (BF16) a 13,596 GB empaquetados, con una media de 9,13 bits por peso, manteniendo una fidelidad muy alta respecto al modelo base (KL medio de 0,00201 frente a BF16).

El modelo tiene 12.966.363.184 parámetros y un repositorio de 26,0 GB. La licencia declarada es Apache 2.0. Es relevante ahora porque representa uno de los primeros empaquetados públicos de Gemma 4 para el ecosistema Tenstorrent, una alternativa de hardware a NVIDIA/AMD para inferencia de modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con componentes de visión y audio; cuantización BFP8 sobre capas lineales |
| Parámetros totales | 12.966.363.184 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en las matrices cuantizadas; 9,13 bits por peso de media); LM head, embeddings, normas y tensores de visión/audio en bf16 |
| Idiomas soportados | no disponible (evaluación realizada sobre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e índice `model.safetensors.index.json`); compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B`, un transformer multimodal de 12,97 mil millones de parámetros con torres de visión (`embed_vision`, `vision_embedder`) y audio (`embed_audio`). Esta exportación no reentrena el modelo: aplica GPTQ sobre las proyecciones lineales del modelo de lenguaje para llevarlas a la rejilla `ttnn.bfloat8_b`. Concretamente, se cuantizan las proyecciones de atención q, k, o (48 capas), v (40 capas) y las proyecciones MLP gate, up y down (48 capas), todas a 8,5 bits por peso. El LM head (atado al embedding), el embedding, las normas y todos los tensores de visión y audio permanecen en bf16 sin cambios.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado son 13,60 GB empaquetados para los pesos del modelo de lenguaje, a los que hay que sumar espacio para la caché KV y buffers en el dispositivo. La innovación técnica principal es el empaquetado directo en la rejilla BFP8 de TT-NN: cada bloque mantiene su exponente compartido tal y como lo fija el *packer*, de forma que el valor almacenado en bf16 es idéntico al que TT-NN reconstruye al empaquetar. El autor verificó el round-trip con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole de Tenstorrent. Solo se cuantizó y evaluó el modelo de lenguaje.

## Capacidades

- Generación de texto y continuación de texto (el checkpoint es el modelo preentrenado, sin plantilla de chat).
- Procesamiento multimodal imagen-texto (`image-text-to-text`) y pipeline `any-to-any`, heredado de Gemma 4.
- Componentes de audio (`embed_audio`) y visión (`embed_vision`, `vision_embedder`) conservados en bf16.
- Capacidades multilingües del modelo base (evaluación parcial en inglés y coreano; lista completa de idiomas no disponible).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito en la información disponible.
- No se documenta comportamiento de agente ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para Wormhole y Blackhole, de modo que TT-NN lo carga directamente en DRAM del dispositivo sin conversión adicional; adecuado para entornos que ya operan hardware Tensix.
- Inferencia de bajo consumo de memoria en NPU: los 13,60 GB de pesos del modelo de lenguaje permiten ejecutar un modelo de 12,97 B en aceleradores con memoria de dispositivo limitada, dejando margen para caché KV y buffers.
- Servicio de continuación de texto y generación de documentación técnica: al ser un modelo preentrenado, encaja en tareas de *completion* y redacción asistida donde no se requiere plantilla de chat.
- Procesamiento de documentos con imagen y texto: el pipeline `image-text-to-text` permite tareas de descripción de imágenes o extracción de información de capturas y documentos escaneados.
- Evaluación y desarrollo sobre simulador: el autor verificó el empaquetado con `ttsim`, lo que facilita validar pipelines TT-NN antes de desplegar en silicio real.
- Reproducción de experimentos de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que ningún valor cambia tras el empaquetado, útil para auditar pipelines de cuantización en producción.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad de tarea.

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`google/gemma-4-12B`) | 16 | 23,81 | 0 | 100 | 27 de 28 | - |
| **Este modelo (BFP8)** | 9,13 | 13,596 | 0,00201 | 97,91 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,949 | 7,381 | 0,09127 | 87,90 | 25 de 28 | 0 |

El KL y el top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de *completion* y 3-shot. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El criterio de aceptación del autor (KL medio ≤ 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional) se cumple con holgura: 0,022 veces el KL de Q4_K_M y 0 respuestas perdidas. No se publican métricas de velocidad ni latencia.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 13,60 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix).
- Compatibilidad verificada con `ttnn 0.81.1` sobre `ttsim` (simulador de Blackhole).
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint según el autor.
- Carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"` (orientado a GPU/CPU convencional, aunque el empaquetado está pensado para TT-NN).
- No se documentan latencia ni throughput estimados.
- No se documenta si cabe en GPU de consumo; el tamaño de pesos (13,60 GB) requeriría al menos 16 GB de VRAM en una GPU convencional, pero esta vía no está validada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño pesos | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|---|
| Este modelo | 12,97 B | no disponible | BFP8 (9,13 bits/peso) | 13,596 GB | Apache 2.0 | Tenstorrent Tensix |
| `google/gemma-4-12B` (BF16) | 12,97 B | no disponible | BF16 | 23,81 GB | Apache 2.0 | GPU/CPU genérica |
| Q4_K_M del mismo checkpoint (llama.cpp) | 12,97 B | no disponible | Q4_K_M (4,949 bits/peso) | 7,381 GB | Apache 2.0 | CPU/GPU genérica |

No se dispone de información sobre otros empaquetados de Gemma 4 para Tenstorrent ni sobre comparativas con modelos de la misma categoría en el ecosistema Tensix.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de las torres de visión y audio en BFP8 no está validado.
- El checkpoint es el modelo preentrenado: no incluye plantilla de chat ni ajuste por instrucciones, por lo que no es adecuado para diálogo directo sin ajuste adicional.
- Los benchmarks publicados miden fidelidad a BF16 (KL, top-1), no calidad de tarea; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- No se han publicado métricas de latencia ni throughput en hardware Tensix real; la verificación se hizo sobre simulador.
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint, lo que limita su uso en esos *stacks*.
- La lista completa de idiomas soportados no está documentada; la evaluación cubre solo inglés y coreano.
- El repositorio del modelo base no incluye fichero LICENSE; el autor incluye el texto estándar de Apache 2.0 y un NOTICE con los cambios.
- El autor no está afiliado ni respaldado por Tenstorrent; se distribuye "as is", sin garantía.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al modelo base Gemma 4.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `google/gemma-4-12B` antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del checkpoint: https://huggingface.co/Xylolabs/gemma-4-12B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
