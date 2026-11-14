# Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP8

## Resumen

Llama-3.1-8B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B de Meta, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only original de Llama 3.1 con 8.030.261.248 parámetros, pero cuantiza las capas lineales (atención q/k/v/o y MLP gate/up/down en las 32 capas) al formato de coma flotante por bloques `bfloat8_b` (BFP8) mediante GPTQ.

La relevancia de esta ficha reside en que no es una cuantización genérica para GPU, sino un empaquetado específico para el stack de software de Tenstorrent (tt-metal, TT-NN, tt-forge), donde las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8 para que TT-NN las empaquete sin alterar sus valores. El resultado ocupa unos 9,52 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 16,06 GB del checkpoint BF16 original, y está pensado para desplegarse en hardware Tensix en lugar de GPUs convencionales.

El modelo es de tipo base (pretrained): continúa texto y no incluye plantilla de chat. Está disponible bajo licencia Llama 3.1 y soporta oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), capas lineales cuantizadas a BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1-8B soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q/k/v/o y gate/up/down de las 32 capas; bf16 en LM head, embeddings, normas y resto de tensores. Media de 9,48 bits por peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (4 shards, repo de 16,1 GB); matrices almacenadas como bf16 sobre rejilla BFP8; incluye `quant4.json` con el formato de cada proyeccion |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1-8B: un transformer decoder-only con 32 capas, atención multi-cabeza con GQA y las proyecciones habituales de atención (q, k, v, o) y MLP (gate, up, down). Xylolabs no reentrena el modelo; parte de los pesos bf16 de Meta (verificados por sha256 contra los shards de unsloth/Llama-3.1-8B) y aplica cuantización GPTQ sobre la rejilla `bfloat8_b` de TT-NN, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La innovación técnica principal es el formato de empaquetado: las matrices cuantizadas se guardan como valores bf16 que caen exactamente sobre la rejilla BFP8, de modo que TT-NN puede empaquetarlas en memoria de dispositivo sin modificar sus valores (verificable con `pack_tensix.py` y `verify_grid.py`). El modelo se validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; según la model card, tt-transformers y tt-forge no se ejecutaron con este checkpoint. No se documenta entrenamiento adicional, RLHF ni DPO; es una exportación cuantizada del modelo base.

## Capacidades

- Generación de texto autoregresiva en modo completado (modelo base, sin plantilla de chat).
- Razonamiento, código y matemáticas heredados de Llama 3.1-8B (capacidades del modelo base, no reevaluadas en esta ficha).
- Multilingüismo en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Compatibilidad con el ecosistema transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`).
- Despliegue en NPU Tensix mediante TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`).
- Soporte declarado de `text-generation-inference` y `endpoints_compatible` en los tags del repo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El modelo está empaquetado para ejecutarse en NPU Wormhole o Blackhole con TT-NN, ocupando 9,52 GB de memoria de dispositivo para los pesos, lo que permite servir Llama 3.1-8B en aceleradores Tensix en lugar de GPU.
- Prototipado en simulador: validación de pipelines de inferencia sobre `ttsim` (simulador de Blackhole) antes de disponer de hardware físico, usando los scripts `pack_tensix.py` y `verify_grid.py` incluidos en el repo.
- Generación de texto en modo completado: al ser un modelo base, encaja en tareas de continuación de texto, autocompletado de documentos y generación de borradores donde no se requiere formato conversacional.
- Procesamiento multilingüe: atención a usuarios o generación de contenido en los ocho idiomas soportados, incluyendo español, hindi y tailandés.
- Investigación en cuantización: sirve como referencia reproducible de GPTQ sobre rejilla BFP8, con métricas publicadas de KL y top-1 frente a BF16 y frente a Q4_K_M de llama.cpp.
- Evaluación comparativa de hardware: permite medir latencia y throughput de un modelo de 8B en Tensix frente a alternativas en GPU, usando el mismo checkpoint base.
- Fine-tuning posterior sobre el checkpoint cuantizado: el repo expone pesos en safetensors cargables con transformers, lo que facilita experimentos de adaptación (aunque la cuantización BFP8 puede limitar la precisión de un ajuste fino directo).

## Benchmarks y rendimiento

La model card publica métricas de fidelidad respecto a BF16 (no de calidad de tarea):

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B) | 16 | 16,06 | 0 | 100 | 23 de 28 | - |
| **Este modelo (BFP8)** | 9,48 | 9,517 | 0,00095 | 98,44 | 23 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03478 | 90,58 | 24 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana). Las 28 respuestas corresponden a prompts cortos con comprobación automática, en formato de completado y 3-shot. El Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El criterio de aceptación del autor (KL media ≤ 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más) se cumple con holgura: 0,03 veces la KL de Q4_K_M y 0 respuestas perdidas. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tarea en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 9,52 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). No está pensado para GPU convencional, aunque los pesos pueden cargarse en bf16 con transformers.
- En memoria host: el repo ocupa 16,1 GB en disco (safetensors en bf16 sobre rejilla BFP8).
- Para dispositivos con menos memoria, el autor remite a la versión BFP4 (`Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8`).
- Opciones de despliegue: TT-NN (ttnn 0.81.1 validado sobre ttsim), transformers con `device_map="auto"`, y compatibilidad declarada con text-generation-inference. tt-transformers y tt-forge no se probaron con este checkpoint según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| **Este modelo (BFP8)** | 8,03B | no disponible | BFP8 (9,48 bits/peso) | llama3.1 | Tensix (Wormhole, Blackhole) |
| meta-llama/Llama-3.1-8B (BF16) | 8,03B | 128K (modelo base) | bf16 (16 bits/peso) | llama3.1 | GPU/CPU |
| Llama-3.1-8B Q4_K_M (llama.cpp) | 8,03B | 128K (modelo base) | Q4_K_M (4,89 bits/peso) | llama3.1 | CPU/GPU (llama.cpp) |
| Xylolabs Llama-3.1-8B Tensix BFP4-Down8 | 8,03B | no disponible | BFP4 | llama3.1 | Tensix con menos memoria |

La diferencia clave frente a las alternativas es la plataforma: este checkpoint es el único de la comparativa empaquetado para NPU Tensix. En fidelidad a BF16 supera claramente a Q4_K_M (KL 0,00095 frente a 0,03478) a costa de mayor tamaño (9,52 GB frente a 4,92 GB).

## Limitaciones y advertencias

- Es un modelo base: no incluye plantilla de chat ni ajuste por instrucciones; no debe usarse directamente como asistente conversacional sin adaptación.
- La cuantización BFP8 introduce una degradación medible (KL media 0,00095, top-1 98,44 % frente a BF16), pequeña pero no nula.
- El checkpoint está validado solo en el simulador ttsim con ttnn 0.81.1; tt-transformers y tt-forge no se probaron, por lo que el soporte en producción sobre hardware real no está confirmado en la información disponible.
- La licencia Llama 3.1 impone restricciones de uso comercial (política de uso aceptable de Meta) y obligaciones de atribución; conviene revisar los términos antes de desplegar en producción.
- Riesgo de alucinación y sesgos inherentes al modelo base Llama 3.1-8B, no mitigados en esta exportación.
- El soporte de contexto largo (128K del modelo base) no se confirma en esta ficha; la longitud de contexto efectiva de esta exportación figura como no disponible.
- El modelo tiene un volumen de descargas muy bajo (40) y ningún like, lo que sugiere poca validación comunitaria.
- La calibración GPTQ se hizo sobre WikiText-2 y Wikipedia coreana; el rendimiento en otros dominios o idiomas puede diferir.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Versión BFP4: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8
- Checkpoint bf16 de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
