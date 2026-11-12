# Xylolabs/Qwen3-8B-Base-Tensix-BFP8

## Resumen

Qwen3-8B-Base-Tensix-BFP8 es una cuantización del modelo base Qwen/Qwen3-8B-Base publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de Qwen3-8B-Base con 8.190.735.360 parámetros y sustituye el formato de sus capas lineales por `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits), mientras mantiene el resto de tensores en bf16.

La relevancia de esta ficha es doble. Por un lado, demuestra una vía de despliegue de un LLM de 8B parámetros en hardware NPU no convencional, con un peso medio de 9,64 bits por parámetro y un tamaño empaquetado de 9,87 GB, frente a los 16,38 GB del checkpoint original en bf16. Por otro, la model card reporta métricas de fidelidad frente a la referencia bf16 (KL media de 0,00161 y top-1 del 98,25 %), lo que permite evaluar la pérdida de calidad de la cuantización con datos concretos.

Es importante señalar que se trata de un modelo *base* (no instruction-tuned): continúa texto y no sigue instrucciones. Además, según la propia model card, la verificación se realizó sobre el simulador ttsim de Blackhole con ttnn 0.81.1 y no sobre hardware físico, y el demo de tt-transformers no se ejecutó de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B-Base) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en LM head, embeddings, norms y resto de tensores; media de 9,64 bits por peso |
| Idiomas soportados | no disponible (calibración en inglés y coreano; el modelo base Qwen3 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8); `quant4.json` describe el formato de cada proyección |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer denso de 8,19B parámetros. Sobre esa base, Xylolabs aplica GPTQ restringido a la rejilla `bfloat8_b` de TT-NN: las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas se cuantizan a BFP8 (8,5 bits por peso), conservando el exponente compartido de cada bloque tal como lo fija el empaquetador. El LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. El resultado es un checkpoint de 9,87 GB empaquetados con una media de 9,64 bits por peso.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los ficheros se distribuyen en bf16 con cada valor ya situado en la rejilla BFP8, de modo que TT-NN los empaqueta sin recuantizar. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento original de Qwen3-8B-Base ni sobre etapas de RLHF o DPO (el checkpoint es el modelo base, sin ajuste por instrucciones).

## Capacidades

- Generación de texto autoregresiva y continuación de texto (modelo base, no instruction-tuned).
- Razonamiento, código y matemáticas heredados de Qwen3-8B-Base (no se detallan evaluaciones específicas en la información disponible).
- Multilingüismo heredado del modelo base (la model card no enumera idiomas).
- Tokenizer con la plantilla de chat del modelo base, aunque el modelo no está entrenado para seguir instrucciones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta variante.
- Ejecución en aceleradores Tensix (Wormhole, Blackhole) mediante TT-NN, con formatos `bfloat8_b` y `bfloat4_b` soportados por el packer.

## Casos de uso

- Despliegue en NPU Tenstorrent: el checkpoint está pensado para cargarse con TT-NN en Wormhole o Blackhole, aprovechando el empaquetado nativo BFP8 sin recuantización en el dispositivo.
- Investigación en cuantización block floating point: permite medir la degradación de un LLM de 8B al pasar de bf16 a BFP8 con GPTQ, usando las métricas de KL y top-1 reportadas como referencia.
- Generación de texto y continuación en pipelines de preentrenamiento: al ser un modelo base, encaja en tareas de *prompting* de continuación, evaluación de perplejidad o generación de datos sintéticos.
- Base para fine-tuning posterior: al mantener licencia Apache 2.0 y pesos en safetensors compatibles con transformers, puede servir como punto de partida para ajustes específicos de dominio antes de reempaquetar a BFP8.
- Validación de toolchains: útil para probar tt-transformers y tt-forge (tt-xla) con un modelo de 8B, comparando la salida frente al checkpoint bf16 de referencia.
- Experimentación con hardware emergente: escenario de laboratorio para evaluar latencia y fidelidad de un LLM en aceleradores Tensix frente a GPU convencionales.
- Evaluación de fidelidad numérica: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar que el empaquetado no altera valores, un caso de uso relevante en validación de pipelines de cuantización.

## Benchmarks y rendimiento

Datos reportados en la model card (evaluación sobre 8.184 posiciones de texto en inglés y coreano, WikiText-2 test y Wikipedia en coreano, como texto plano):

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B-Base) | 16 | 16,38 | 0 | 100 | 28 de 28 | - |
| **Este modelo (BFP8)** | 9,64 | 9,870 | 0,00161 | 98,25 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 5,028 | 0,04034 | 89,59 | 28 de 28 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,87 GB empaquetados en BFP8; el checkpoint en disco ocupa 16,4 GB (repo) y 16,38 GB en bf16 de referencia.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). Verificado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole, no sobre hardware físico según la model card.
- GPU consumer: no se documenta soporte ni requisitos para GPU; el checkpoint es cargable con transformers en bf16 (16,38 GB), lo que requiere al menos ~17-18 GB de VRAM en FP16/BF16, por encima de una RTX 4090 de 24 GB solo con margen ajustado y sin cuantización adicional.
- Opciones de despliegue: TT-NN (tt-metal v0.81.1), tt-transformers (demo `simple_text_demo.py` con `--use_hf_rope` y `--instruct 0`), tt-forge (tt-xla, no probado con este checkpoint), y transformers estándar para carga en bf16.
- Latencia y throughput: no disponibles. La model card indica que el demo de tt-transformers no se ejecutó de extremo a extremo; solo se reporta que un prefill de 2 capas coincidió con transformers (PCC 0.9988).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Base-Tensix-BFP8 | 8,19B | no disponible | BFP8 (9,64 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base (bf16) | 8,19B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | Hugging Face |
| Q4_K_M de Qwen3-8B-Base (llama.cpp) | 8,19B | no disponible | 4,91 bits/peso | Apache 2.0 | Hugging Face / GGUF |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información proporcionada no incluye alternativas de otros desarrolladores con especificaciones verificables. Frente a bf16, la variante BFP8 reduce el tamaño un 39,7 % con una KL media de 0,00161 y top-1 del 98,25 %; frente a Q4_K_M, ocupa casi el doble pero mejora notablemente la fidelidad (KL 0,00161 frente a 0,04034; top-1 98,25 % frente a 89,59 %).

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones de forma fiable; requiere prompting de continuación.
- Verificación solo en simulador (ttsim de Blackhole); no hay validación publicada en hardware Tensix físico.
- El demo de tt-transformers no se ejecutó de extremo a extremo; el LM head en bf16 de este checkpoint no es exacto en ese demo, que empaqueta la cabeza en bfloat8_b.
- tt-forge (tt-xla) no se ha probado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en el layout [out, in] de PyTorch.
- Riesgo de alucinación inherente a un modelo base de 8B; no se documentan evaluaciones de sesgo ni de seguridad.
- Idiomas soportados no documentados; la calibración se limitó a inglés y coreano, lo que puede sesgar la fidelidad de la cuantización en otros idiomas.
- Longitud de contexto no especificada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye garantías ni cláusulas adicionales más allá de la licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
