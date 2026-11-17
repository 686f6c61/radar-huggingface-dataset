# Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-2B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.5-2B, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack `tt-metal` y `ttnn`. El modelo base es un transformer híbrido de 2.274.069.824 parámetros que combina capas de atención clásica con capas Gated DeltaNet, e incorpora una torre de visión para tareas image-text-to-text. Esta variante cuantiza las proyecciones del modelo de lenguaje a BFP4 (block floating point de 4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque, manteniendo en bf16 el embedding, el LM head, las normas, la torre de visión y el módulo MTP.

La relevancia de esta ficha reside en que ejemplifica un patrón de despliegue emergente: cuantizaciones de precisión ultra-baja diseñadas para un backend de hardware concreto en lugar de para GPUs convencionales. El resultado es un peso empaquetado de 1,790 GB frente a los 3,76 GB en bf16, con una divergencia KL media de 0,0577 respecto al modelo original, comparable al Q4_K_M de llama.cpp (0,0554). No obstante, los ficheros del repositorio almacenan los valores cuantizados como bf16 para compatibilidad con el Hub, por lo que el tamaño descargado es de 4,6 GB y el empaquetado real a BFP4 lo realiza TT-NN en tiempo de despliegue.

El modelo se distribuye bajo licencia Apache-2.0 y declara soporte de inglés y coreano. No se han publicado mediciones de velocidad en dispositivo: todas las cifras de evaluación son en host. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención clásica (6) y Gated DeltaNet (18), más torre de visión y módulo MTP; base Qwen3.5-2B |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits/peso) en proyecciones de atención, Gated DeltaNet y MLP; bf16 en embedding, LM head, normas, torre de visión y MTP; float32 en `linear_attn.A_log` y `linear_attn.norm.weight`; media de 7,61 bits/peso |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP4); empaquetado a BFP4 vía TT-NN; compatible también con `ttnn.bfloat8_b` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida: 18 capas usan Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) y 6 capas usan atención clásica, según el desglose de tensores de la model card. El modelo incluye además una torre de visión (`model.visual`) para entrada image-text-to-text y un módulo MTP (multi-token prediction). No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La innovación técnica de esta variante es el proceso de cuantización: GPTQ con búsqueda de exponente por bloque sobre las proyecciones q/k/v/o de atención, las entradas y salidas de Gated DeltaNet (q/k/v, z, a, b) y las proyecciones gate/up/down del MLP, calibrado con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el MTP conservan los pesos del modelo base. Las herramientas de cuantización y verificación (`tools/pack_tensix.py` y `tools/verify_grid.py`) se distribuyen en el repositorio `tensix-bfp-gptq v0.1.0` y se validaron sobre `ttsim` con `ttnn 0.81.1`, comprobando que ningún valor cambia al empaquetar.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo thinking activable o desactivable (`enable_thinking`).
- Procesamiento image-text-to-text: la torre de visión se conserva en bf16 y el pipeline declarado es `image-text-to-text`.
- Razonamiento multi-turno en inglés y coreano.
- Predicción multi-token mediante el módulo MTP heredado del modelo base.
- Ejecución en NPU Tenstorrent Wormhole y Blackhole mediante kernels dedicados (`tensix-kernels v0.1.0`) y runner (`tensix-runner v0.1.0`).
- Compatibilidad con la librería `transformers` mediante `AutoModelForImageTextToText` para inspección y evaluación en host.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal del artefacto es ejecutar el modelo de lenguaje en NPU Wormhole o Blackhole usando `pack_tensix.py` para empaquetar las matrices a BFP4 y `tensix-runner` para la inferencia, aprovechando el formato de bloque para reducir el ancho de banda de memoria frente a bf16.
- Evaluación de precisión de cuantizaciones ultra-bajas: investigadores que comparan BFP4 con Q4_K_M pueden usar las métricas publicadas (KL media 0,0577 frente a 0,0554; 25/40 respuestas correctas en ambos casos) como referencia para decidir el formato de despliegue en hardware de bajo ancho de banda.
- Asistentes conversacionales bilingües inglés-coreano: el calibrado incluye Wikipedia en coreano y la model card declara ambos idiomas, lo que permite prototipar atención al cliente o asistentes internos en esos mercados sobre hardware Tenstorrent.
- Procesamiento de documentos con imagen y texto: al conservar la torre de visión en bf16, el modelo puede emplearse en tareas de descripción de imágenes o extracción de información de capturas y formularios, siempre que el backend soporte el pipeline `image-text-to-text`.
- Prototipado en entornos con restricciones de memoria: el peso empaquetado de 1,790 GB permite alojar el modelo de lenguaje en DRAM de dispositivo limitada, frente a los 3,76 GB de la versión bf16.
- Verificación de pipelines de cuantización: los scripts `verify_grid.py` y `pack_tensix.py` permiten a ingenieros de MLOps validar que el empaquetado no altera valores antes de desplegar en producción, integrándolo en un pipeline de CI previo al despliegue.
- Investigación sobre arquitecturas híbridas atención/DeltaNet: al mantener la estructura de 18 capas Gated DeltaNet y 6 de atención clásica, sirve para estudiar el comportamiento de modelos de estado recurrente en tareas de lenguaje con contexto corto o medio.

## Benchmarks y rendimiento

Los únicos datos publicados son evaluaciones en host de los pesos, no mediciones en dispositivo. La tabla compara la variante BFP4 con el modelo bf16 original y con Q4_K_M de llama.cpp sobre el mismo modelo base:

| Pesos | Bits/peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precision |
|---|---|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 3,76 | 0 | 100 | 26/40 | - | - |
| BFP4 (esta ficha) | 7,61 | 1,790 | 0,0577 | 86,92 | 25/40 | 3 | superado (1,04x KL; 3 perdidas frente a 2) |
| Q4_K_M (llama.cpp) | 5,37 | 1,274 | 0,0554 | 86,80 | 25/40 | 2 | referencia |

La KL media se calcula sobre las posiciones de textos fijos en inglés y coreano; el top-1 mide la coincidencia del siguiente token con el modelo bf16. El chequeo de respuestas usa 33 prompts con respuesta conocida más 7 con thinking activado (40 en total). No se publican resultados de MMLU, HumanEval, GSM8K ni latencia/throughput en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el destino es DRAM de NPU Tenstorrent. El peso empaquetado ocupa 1,790 GB en BFP4 y 3,76 GB en bf16.
- GPU recomendadas: no disponibles; el artefacto está diseñado para Wormhole y Blackhole de Tenstorrent.
- Compatibilidad con GPU de consumo: el repositorio almacena los tensores como bf16 (4,6 GB en el Hub), por lo que la carga en `transformers` requiere al menos esos 4,6 GB más overhead de activaciones; no se documenta soporte de CUDA para el formato BFP4.
- Opciones de despliegue: `tt-metal`/`ttnn` con `tensix-runner v0.1.0` y `tensix-kernels v0.1.0` sobre NPU; `transformers` con `AutoModelForImageTextToText` para evaluación en host; empaquetado alternativo a `ttnn.bfloat8_b`.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reportan velocidades y que todas las cifras son evaluaciones en host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Tenstorrent-Tensix-BFP4 | 2,27 B | no disponible | BFP4, 7,61 bits/peso medio | Apache-2.0 | Hugging Face (Xylolabs) |
| Qwen/Qwen3.5-2B (bf16) | 2,27 B | no disponible | bf16, 16 bits/peso | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3.5-2B en Q4_K_M (llama.cpp) | 2,27 B | no disponible | Q4_K_M, 5,37 bits/peso | Apache-2.0 (pesos) | Generable con llama.cpp |

La comparación relevante es de precisión y tamaño: BFP4 ocupa 1,790 GB con una KL de 0,0577, mientras que Q4_K_M ocupa 1,274 GB con una KL de 0,0554; ambos aciertan 25 de 40 respuestas. BFP4 pierde tres respuestas frente a las dos de Q4_K_M. No se dispone de comparación con otros modelos de 2 B de la misma familia por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el módulo MTP no han sido validados tras la cuantización y conservan los pesos del modelo base.
- El calibrado de GPTQ usó únicamente WikiText-2 y Wikipedia en coreano (65.536 tokens), lo que puede sesgar la precisión hacia esos dominios y idiomas.
- La evaluación se limita a 40 prompts y a métricas de divergencia de distribución; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan estimar el rendimiento en tareas complejas.
- No se han publicado mediciones en dispositivo: latencia, throughput y consumo energético en Wormhole o Blackhole son desconocidos.
- El repositorio del Hub almacena los pesos como bf16 (4,6 GB), no en el formato empaquetado de 1,790 GB; el ahorro de memoria solo se materializa tras el empaquetado con TT-NN.
- Idiomas declarados únicamente inglés y coreano; el rendimiento en castellano no está evaluado ni garantizado.
- Riesgo de alucinación inherente a un modelo de 2 B parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero la licencia del modelo base Qwen3.5-2B debe verificarse por separado antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la publicación, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-2B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
