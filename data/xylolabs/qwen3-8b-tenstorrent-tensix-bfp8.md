# Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-8B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3-8B de Alibaba, adaptada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). La desarrolla Xylolabs y aplica cuantización GPTQ sobre la rejilla de punto flotante por bloques `ttnn.bfloat8_b` (BFP8) a las capas lineales de las 36 capas del transformer, manteniendo en bf16 la cabeza LM, los embeddings y las normas.

El problema que resuelve es la falta de checkpoints nativos para el stack de software de Tenstorrent (tt-metal, TT-NN, tt-forge). Al almacenar las matrices cuantizadas como valores bf16 sobre la rejilla BFP8, TT-NN puede empaquetarlas sin alterar sus valores, lo que permite validar la conversión bit a bit. El modelo pesa 9,87 GB empaquetado y requiere unos 9,87 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje.

Con 8.190.735.360 parámetros totales y licencia Apache-2.0, es relevante para equipos que despliegan inferencia en hardware Tenstorrent y necesitan conservar la calidad del modelo base con un consumo de memoria reducido. La evaluación reportada por el autor muestra una divergencia KL media de 0,00100 frente a BF16 y un 98,68 % de top-1, con las mismas 38 de 40 respuestas correctas que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas; capas lineales cuantizadas a BFP8 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ sobre rejilla `ttnn.bfloat8_b` (BFP8); 8,5 bits por peso en capas lineales, 9,64 bits por peso de media |
| Idiomas soportados | no disponible (calibrado con WikiText-2 y Wikipedia en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 sobre rejilla BFP8), transformers |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer decoder-only de 36 capas con 8.190.735.360 parámetros. Esta exportación no reentrena el modelo: parte de los pesos de Qwen/Qwen3-8B y aplica cuantización GPTQ post-entrenamiento sobre las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas, cuantizándolas a `ttnn.bfloat8_b`. La cabeza LM, los embeddings, las normas y el resto de tensores se mantienen en bf16 tal como en el modelo base.

La innovación técnica principal es el almacenamiento de las matrices cuantizadas como valores bf16 alineados a la rejilla BFP8, de modo que el empaquetador de TT-NN las lee sin modificar sus valores. La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la integridad de la rejilla. En la validación con tt-transformers (tt-metal v0.81.1) y `--use_hf_rope`, un prefill de 2 capas coincidió con transformers con PCC 0,9990.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen3-8B.
- Razonamiento y matemáticas, según las capacidades del modelo base.
- Generación de código, según las capacidades del modelo base.
- Plantilla de chat compatible con `apply_chat_template` de transformers.
- Ejecución en NPU Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN con `ttnn.bfloat8_b`.
- Compatibilidad con tt-transformers (tt-metal v0.81.1) y con tt-forge (tt-xla) en modo bf16.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales o de audio: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en hardware Tenstorrent: despliegue del modelo sobre NPU Wormhole o Blackhole usando TT-NN, aprovechando que las matrices BFP8 se empaquetan sin pérdida de valores y que el peso empaquetado es de 9,87 GB.
- Validación de pipelines de cuantización: uso de `pack_tensix.py` y `verify_grid.py` para comprobar bit a bit que cada matriz cuantizada se lee correctamente desde safetensors y desde la DRAM del dispositivo.
- Sustitución de bf16 en despliegues con memoria limitada: el checkpoint reduce el peso de 16,38 GB a 9,87 GB manteniendo 38 de 40 respuestas correctas en la evaluación del autor, lo que permite liberar memoria para caché KV y buffers.
- Benchmarking de precisión en tt-metal: ejecución del demo `simple_text_demo.py` de tt-transformers con configuraciones de precisión mixta (`bfp8` en ff1_3, ff2, wqkv, wo y kv_cache) para medir rendimiento y fidelidad en batch 1.
- Servicio de generación de texto conversacional: integración con transformers y text-generation-inference para endpoints compatibles, con plantilla de chat estándar.
- Evaluación comparativa de cuantizaciones: comparación del checkpoint BFP8 con la versión BFP4 del mismo autor y con Q4_K_M de llama.cpp usando las métricas de KL y top-1 publicadas.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B) | 16 | 16,38 | 0 | 100 | 38 de 40 | - |
| Este modelo (BFP8) | 9,64 | 9,870 | 0,00100 | 98,68 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,90 | 5,028 | 0,04236 | 91,24 | 38 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.240 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 9,87 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Para dispositivos con menos memoria, el autor recomienda la versión BFP4 del mismo modelo.
- Validación realizada con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.
- Despliegue en NPU: tt-metal v0.81.1 con tt-transformers (requiere `--use_hf_rope`) y tt-forge (tt-xla).
- Despliegue en GPU/CPU: transformers con `dtype="bfloat16"` y `device_map="auto"`; VRAM estimada no disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano (GB) | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3-8B-Tenstorrent-Tensix-BFP8 | 8.190.735.360 | no disponible | 9,64 | 9,870 | apache-2.0 | Tenstorrent Tensix |
| Qwen/Qwen3-8B (BF16) | 8.190.735.360 | no disponible | 16 | 16,38 | apache-2.0 | GPU/CPU |
| Q4_K_M (llama.cpp) | 8.190.735.360 (base) | no disponible | 4,90 | 5,028 | apache-2.0 (base) | CPU/GPU |
| Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4 | no disponible | no disponible | no disponible | no disponible | apache-2.0 | Tenstorrent Tensix |

## Limitaciones y advertencias

- El checkpoint está diseñado para hardware Tenstorrent; en GPU o CPU se ejecuta en bf16 con transformers, sin aprovechar el empaquetado BFP8.
- El demo de tt-transformers empaqueta la cabeza LM en bfloat8_b, por lo que la cabeza bf16 de este checkpoint no es exacta en ese demo.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` recuantizan los pesos en el layout [out, in] de PyTorch.
- La calibración GPTQ se realizó solo con WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios no está documentado.
- No se han publicado datos sobre sesgos, alucinación o evaluación multilingüe en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las limitaciones del modelo base Qwen3-8B.
- Solo se ha validado con ttnn 0.81.1 sobre el simulador ttsim; no se documenta validación en silicio Wormhole o Blackhole real.

## Enlaces

- [Hugging Face: Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP8](https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP8)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Version BFP4: Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4](https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4)
- [Codigo: tensix-bfp-gptq](https://github.com/XylolabsInc/tensix-bfp-gptq)
- [Documentacion de Tenstorrent](https://docs.tenstorrent.com)
- [Repositorio tt-metal](https://github.com/tenstorrent/tt-metal)
- [Paper Qwen3 (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)
