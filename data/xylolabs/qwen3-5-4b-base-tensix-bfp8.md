# Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8

## Resumen

Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8 es una cuantización del modelo base Qwen/Qwen3.5-4B-Base, desarrollada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5-4B-Base, pero sustituye las proyecciones lineales por versiones cuantizadas a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que TT-NN puede empaquetar los pesos directamente sin recuantización en el dispositivo.

El checkpoint pesa 5,07 GB empaquetado, con una media de 9,63 bits por peso, y cuenta con 5.295.564.288 parámetros totales según los safetensors. Los tensores se almacenan en bf16 pero con cada valor ya alineado a la rejilla BFP8, lo que permite que el runtime de Tenstorrent los consuma tal cual. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha radica en que es un ejemplo de cuantización hardware-aware: no se optimiza para GPU convencional sino para la rejilla numérica concreta de los NPU Tensix. Solo se ha cuantizado y evaluado el modelo de lenguaje; los bloques `mtp` y `visual` permanecen en bf16 sin cambios. Es un modelo base (no instruido), pensado para continuación de texto y para servir como punto de partida de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (atención + Gated DeltaNet), con bloques MTP y visual |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en proyecciones lineales; bf16 en embedding, LM head, normas y bloques `mtp`/`visual` |
| Idiomas soportados | no disponible (evaluado en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP8), índice `model.safetensors.index.json`, metadatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer híbrido que combina capas de atención clásica con capas Gated DeltaNet (un mecanismo de estado lineal recurrente). Según la model card, la cuantización afecta a 8 capas de atención (proyecciones q, k, v, o), 24 capas de Gated DeltaNet (q, k, v, z, a, b, output) y 32 capas de MLP (gate, up, down), todas ellas en `bfloat8_b` a 8,5 bits por peso. El LM head (atado al embedding), el embedding, las normas y el resto de tensores se mantienen en bf16 tal como en el modelo base. Los bloques `mtp` y `visual` también quedan en bf16 sin modificar.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. La calibración empleó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado es un checkpoint de 5,07 GB empaquetado con 9,63 bits por peso de media. Solo se cuantizó y evaluó el modelo de lenguaje; no hay datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y continuación de texto: es un modelo base, no instruido, por lo que su uso natural es la continuación y el ajuste fino.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.5-4B-Base (sin datos de benchmarks específicos en la información disponible).
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque el bloque `visual` no se ha cuantizado ni evaluado.
- Capacidades multilingües: la calibración incluye inglés y coreano; no se detalla la lista completa de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con pesos ya alineados a la rejilla BFP8.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está pensado para ejecutarse en NPU Tensix (Wormhole, Blackhole) con TT-NN, que empaqueta los pesos BFP8 directamente sin recuantizar, reduciendo el coste de carga y el uso de DRAM del dispositivo.
- Prototipado en el simulador ttsim: la model card indica que se probó con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), lo que permite validar pipelines de inferencia sin hardware físico antes de desplegar en una tarjeta real.
- Ajuste fino sobre dominio específico: al ser un modelo base Apache-2.0, sirve como punto de partida para fine-tuning (por ejemplo, con LoRA) en tareas de clasificación, extracción o generación especializada, partiendo de un checkpoint más compacto que el bf16.
- Investigación en cuantización hardware-aware: útil para estudiar el impacto de la rejilla BFP8 frente a bf16 y frente a cuantizaciones de GPU (Q4_K_M) en métricas de divergencia (KL) y precisión top-1, con la metodología de evaluación publicada en la model card.
- Evaluación comparativa de precisión numérica: la model card aporta datos de KL medio y top-1 sobre 8.188 posiciones de inglés y coreano, lo que permite reproducir y comparar el efecto de distintas rejillas de cuantización sobre el mismo checkpoint.
- Generación de texto en inglés y coreano: la calibración y la evaluación cubren ambos idiomas, por lo que es adecuado para tareas de continuación de texto en esos idiomas dentro de un pipeline de inferencia sobre Tensix.
- Integración en pipelines con tt-forge (tt-xla): aunque no se ha probado aún con este checkpoint, la model card documenta la opción `bfp_bf8` para recuantizar en el layout [out, in] de PyTorch, lo que abre la puerta a flujos de compilación vía XLA.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación del modelo de lenguaje, texto plano, 8.188 posiciones de WikiText-2 test y Wikipedia en coreano; 28 prompts cortos con comprobación automática, en formato de completación y 3-shot):

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B-Base) | 16 | 8,41 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 9,63 | 5,065 | 0,00072 | 98,57 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,02929 | 91,12 | 27 de 28 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 5,07 GB empaquetado en BFP8; el repo completo ocupa 10,6 GB (incluye tensores bf16 no cuantizados).
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Simulación: probado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se ha probado en hardware físico según la model card.
- GPU convencionales: el modelo puede cargarse con `transformers` en bf16 (`device_map="auto"`), pero no está optimizado para GPU; el uso previsto es Tensix.
- Opciones de despliegue: TT-NN (tt-metal), tt-forge (tt-xla, opción `bfp_bf8`, no probado con este checkpoint), y `transformers` para carga e inspección. El demo de tt-metal para Qwen3.5/3.6 (v0.81.1) no lista Qwen3.5-4B y recuantiza el MLP gate/up a bfloat4_b, por lo que no ejecuta este checkpoint a su precisión.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8 | 5.295.564.288 | no disponible | BFP8 (9,63 bits/peso) | Apache-2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | bf16 | Apache-2.0 | Hugging Face |
| Qwen3.5-4B-Base en Q4_K_M (llama.cpp) | mismo checkpoint | no disponible | Q4_K_M (5,13 bits/peso) | Apache-2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparativa de rendimiento entre estas tres variantes está en la tabla de benchmarks: el BFP8 pierde 1,43 puntos de top-1 frente a bf16 y mantiene 27 de 28 respuestas correctas, mientras que Q4_K_M baja a 91,12 % de top-1. No se dispone de comparación con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones de forma fiable; su tokenizer conserva la plantilla de chat del modelo base, pero el modelo no está ajustado para conversación.
- Solo se cuantizó y evaluó el modelo de lenguaje; el bloque `visual` y el `mtp` permanecen en bf16 y no se han validado.
- El checkpoint no se ha probado en hardware Tensix físico, solo en el simulador ttsim con ttnn 0.81.1.
- El demo de tt-metal para Qwen3.5/3.6 recuantiza el MLP gate/up a bfloat4_b y el LM head/MTP a bfloat8_b, por lo que no ejecuta este checkpoint a su precisión original; para ese demo, la exportación BFP4 sería la que coincide con lo que realmente se ejecuta.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su opción por defecto mantiene bf16 (exacto) y `bfp_bf8` recuantiza en el layout [out, in] de PyTorch.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo base, el riesgo de generar contenido incorrecto o sesgado es el propio del modelo original.
- Idiomas: solo se documenta evaluación en inglés y coreano; el resto de idiomas no está verificado.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B-Base y de las herramientas de cuantización (tensix-bfp-gptq).
- El repo ocupa 10,6 GB, más del doble que los 5,07 GB empaquetados, por los tensores bf16 no cuantizados; hay que prever espacio de almacenamiento y de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo de tt-metal Qwen3.5/3.6 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tensix-BFP8/blob/main/LICENSE
