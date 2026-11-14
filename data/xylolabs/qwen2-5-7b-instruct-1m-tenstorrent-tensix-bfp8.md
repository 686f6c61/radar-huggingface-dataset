# Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP8 es una cuantización del modelo Qwen2.5-7B-Instruct-1M de Alibaba Qwen, adaptada específicamente para su ejecución en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en aplicar GPTQ sobre las capas lineales del transformer para almacenarlas en el formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits con exponente compartido por bloque), conservando el resto de tensores (embeddings, LM head, normas) en bf16.

El modelo resuelve un problema de despliegue: llevar un LLM de 7.600 millones de parámetros con ventana de contexto de hasta 1 millón de tokens a NPUs de Tenstorrent reduciendo el peso de 15,23 GB (bf16) a 9,11 GB empaquetados, con un promedio de 9,57 bits por peso. La motivación es ofrecer una alternativa de cuantización de mayor fidelidad que Q4_K_M de llama.cpp (4,91 bits por peso) manteniendo un tamaño manejable para la memoria DRAM del dispositivo.

La relevancia actual radica en que el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge) está creciendo como alternativa de hardware abierto a GPU, y este checkpoint demuestra un flujo de cuantización reproducible con verificación bit a bit del empaquetado en la rejilla BFP8. Es un modelo de nicho: útil para quien despliegue sobre Tensix, no para inferencia convencional en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), capas lineales cuantizadas a BFP8 |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.000.000 tokens (heredada del modelo base Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en q/k/v/o y gate/up/down de las 28 capas; bf16 en LM head, embeddings, normas y resto de tensores; media de 9,57 bits/peso |
| Idiomas soportados | en (inglés declarado; el modelo base Qwen2.5 es multilingüe, pero la model card solo declara inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json` para el empaquetado Tensix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct-1M: un transformer decoder-only denso de 28 capas con atención de múltiples cabezas, entrenado por Alibaba Qwen con soporte de contexto largo (hasta 1M tokens mediante técnicas de extensión de contexto). Sobre esa base, Xylolabs no reentrena el modelo: aplica GPTQ para cuantizar las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) en las 28 capas al formato BFP8 de TT-NN.

La innovación técnica clave es el uso de la rejilla `bfloat8_b`: un formato de coma flotante por bloques en el que cada bloque comparte un exponente y los valores se almacenan como mantisas de 8 bits. Los pesos cuantizados se guardan como valores bf16 sobre esa rejilla, de modo que TT-NN los empaqueta sin alterar su valor (verificable con `pack_tensix.py` y `verify_grid.py`). La calibración de GPTQ se hizo con 65.536 tokens de WikiText-2 y Wikipedia en coreano. No se reporta RLHF/DPO adicional más allá del que ya incorpora el modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados de Qwen2.5-7B-Instruct-1M.
- Manejo de contexto muy largo (hasta 1M tokens en el modelo base), útil para documentos extensos.
- Capacidades multilingües del modelo base (aunque la model card solo declara inglés).
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5-Instruct.
- Ejecución optimizada en NPUs Tensix (Wormhole, Blackhole) mediante TT-NN.
- Verificación de empaquetado bit a bit en la rejilla BFP8.

## Casos de uso

- Despliegue en hardware Tenstorrent: servir el modelo en NPUs Wormhole o Blackhole usando TT-NN, aprovechando el empaquetado BFP8 nativo para reducir el uso de DRAM a 9,11 GB de pesos.
- Procesamiento de documentos largos: análisis de contratos, informes o bases de código que requieran ventanas de contexto de cientos de miles de tokens, gracias a la ventana de 1M del modelo base.
- Inferencia de bajo consumo en edge con aceleradores Tensix: escenarios donde no hay GPU disponible y se prefiere una NPU de bajo consumo con memoria limitada.
- Asistente conversacional autoalojado: chatbot multi-turno con plantilla de chat, para entornos que exigen control total del hardware y de los datos.
- Evaluación de pipelines de cuantización: uso del checkpoint como referencia para validar flujos GPTQ sobre BFP8, comparando la fidelidad frente a BF16 y Q4_K_M.
- Investigación en formatos de coma flotante por bloques: estudio del impacto de BFP8 en la calidad de un LLM de 7B, con métricas de KL y top-1 publicadas.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct-1M) | 16 | 15,23 | 0 | 100 | 30 de 33 | - |
| **Este modelo (BFP8)** | 9,57 | 9,114 | 0,00154 | 98,42 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03061 | 91,63 | 31 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.184 posiciones de texto en inglés y coreano (WikiText-2 test, Wikipedia coreana), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El modelo cumple el criterio del autor: KL media 0,05 veces la de Q4_K_M y 0 respuestas perdidas frente a 0. No se reportan datos de velocidad ni throughput.

## Requisitos de hardware

- VRAM/DRAM estimada: ~9,11 GB solo para los pesos del modelo, más espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole, Blackhole). Verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- GPU convencionales: no es el objetivo; el checkpoint puede cargarse con transformers en bf16 (requiere ~15 GB), pero el formato BFP8 está pensado para TT-NN.
- Opciones de despliegue: TT-NN / tt-metal; tt-transformers y tt-forge no se probaron con este checkpoint según la model card.
- Alternativa en dispositivos con menos memoria: versión BFP4 (Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP4-MLP).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (BFP8) | 7,6 B | 1M | 9,57 | 9,11 GB | Apache 2.0 | Tensix (Wormhole/Blackhole) |
| Qwen2.5-7B-Instruct-1M (BF16) | 7,6 B | 1M | 16 | 15,23 GB | Apache 2.0 | GPU/CPU |
| Q4_K_M (llama.cpp) | 7,6 B | 1M | 4,91 | 4,68 GB | Apache 2.0 | CPU/GPU |
| Xylolabs BFP4-MLP | 7,6 B | 1M | no disponible | menor que BFP8 | Apache 2.0 | Tensix |

## Limitaciones y advertencias

- Solo declara inglés en la model card, aunque el modelo base es multilingüe; el soporte de otros idiomas no está garantizado en esta cuantización.
- El checkpoint está optimizado para TT-NN sobre Tensix; tt-transformers y tt-forge no se probaron con él.
- No se reportan datos de velocidad, latencia ni throughput.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct-1M; la cuantización puede amplificarlo ligeramente (KL media de 0,00154 frente a BF16).
- Los benchmarks miden fidelidad respecto a BF16, no calidad de tarea; no sustituyen a evaluaciones de tarea reales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no está afiliado ni respaldado por Tenstorrent.
- Se entrega "as is", sin garantía.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP4-MLP
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen2.5-1M: arxiv:2501.15383
