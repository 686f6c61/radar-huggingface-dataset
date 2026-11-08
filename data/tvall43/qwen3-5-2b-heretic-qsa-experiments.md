# tvall43/Qwen3.5-2B-heretic-QSA-experiments

## Resumen

`tvall43/Qwen3.5-2B-heretic-QSA-experiments` es un repositorio de artefactos de investigación, no un modelo de producción, que documenta la aplicación de QSA (query-sparse attention) sobre `tvall43/Qwen3.5-2B-heretic`, una ablación Heretic v1.2.0 del modelo `unsloth/Qwen3.5-2B`. El autor lo concibe explícitamente como un banco de pruebas de una receta diseñada para un modelo de 35B, y advierte que no supera a la referencia de 35B con la misma esparsidad.

El modelo base tiene 1.889.691.712 parámetros (aproximadamente 1,89B) y una arquitectura híbrida de 24 capas, de las cuales solo seis (`[3, 7, 11, 15, 19, 23]`) son de atención completa; el resto son gated DeltaNet (atención lineal). QSA añade un indexer entrenado por destilación a cada capa de atención completa, con block size 4, 4 cabezas, dimensión de cabeza 128 y RoPE parcial de 64 dimensiones, en FP32.

La relevancia del repositorio es metodológica: publica los pesos del indexer, los GGUFs Q8_0 listos para ejecutar, los scripts de entrenamiento y evaluación, los datos públicos de NIAH y perplejidad, y un parche de llama.cpp con el port QSA a Vulkan. El objetivo declarado era `LLAMA_QSA_TOP_K=2048` tokens con contexto de 128k, es decir, 512 bloques o el 1,56% del contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas, 6 de atención completa (`[3, 7, 11, 15, 19, 23]`) y 18 de gated DeltaNet (atención lineal); QSA añade indexer por destilación a las capas de atención completa |
| Parámetros totales | 1.889.691.712 (1,89B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k (evaluado a 128k y 16k) |
| Tipos de cuantización | Q8_0 publicada en GGUF; pesos del indexer en FP32 (PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors/PyTorch (indexers), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 24 capas en el que solo seis capas usan atención completa; las dieciocho restantes emplean gated DeltaNet, un mecanismo de atención lineal. Sobre cada capa de atención completa, QSA inserta un indexer con block size `r = 4`, 4 cabezas, dimensión de cabeza 128, RoPE parcial de 64 dimensiones y precisión FP32. Para cada query, el indexer agrupa las claves en bloques, puntúa cada bloque y conserva los `K / r` bloques con mayor puntuación; la atención se calcula únicamente sobre esos bloques. `K` es un presupuesto de tokens, no un recuento de bloques: a 128k, K=2048 implica 512 bloques (1,56% del contexto), K=4096 implica 1024 bloques (3,125%) y K=8192 implica 2048 bloques (6,25%).

El indexer se entrena por destilación de la distribución de atención densa por bloques de la misma pasada forward, manteniendo el backbone congelado. El checkpoint seleccionado (`g125`) se entrenó sobre un corpus privado de sesiones de OpenCode a 32k de contexto; el repositorio no contiene texto de OpenCode ni de sesiones, solo los pesos resultantes, las configuraciones y los datos públicos de evaluación. La Fase 2 (con la atención descongelada) no pudo ejecutarse de forma válida en la GPU doméstica de 10 GiB: la única configuración que cabía aprendió un patrón local y colapsó el NIAH a 1/5, por lo que ese artefacto se publica marcado como inválido. El runtime es el port QSA a Vulkan de llama.cpp incluido en `patches/`, y la variable `LLAMA_QSA_TOP_K` permite sobrescribir los metadatos del GGUF en tiempo de carga.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-2B (pipeline `text-generation`, tag `conversational`).
- Atención dispersa de largo contexto: recuperación de información en ventanas de hasta 128k tokens con un presupuesto de tokens configurable (`LLAMA_QSA_TOP_K`).
- Evaluación multi-needle: 5/5 en NIAH de 32 agujas a 128k con el indexer `g125` a K=2048 y K=4096.
- Evaluación single-needle: 6/6 en seis profundidades tanto a 120k como a 128k con el indexer de 16k.
- Ejecución en llama.cpp mediante parche Vulkan y GGUF Q8_0.
- El modelo base Qwen3.5 incorpora, según su model card, una base unificada visión-lenguaje con entrenamiento de fusión temprana sobre tokens multimodales; no se documenta en este repositorio que dichas capacidades se conserven tras la ablación Heretic ni tras la aplicación de QSA.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación en atención dispersa: reproducir la destilación del indexer QSA sobre un backbone congelado usando `qsa/` y `scripts/`, y comparar curvas de perplejidad frente a atención densa con el harness `bench/`.
- Validación de recuperación en contexto largo: ejecutar los casos sintéticos de `eval_data/` (NIAH de 32 agujas, 128k) para medir la tasa de acierto de un checkpoint de indexer antes de portar la receta a un modelo mayor.
- Desarrollo del port de llama.cpp: usar `patches/` (parche completo y diff de trabajo) para integrar QSA en el backend Vulkan y verificar el comportamiento de `LLAMA_QSA_TOP_K` en tiempo de carga.
- Análisis de compromiso precisión-esparsidad: con los datos de `results/` se puede trazar la curva de perplejidad frente a K (2048, 4096, 8192) y fijar el punto operativo de contexto largo; el autor identifica K=4096 (+8,5% de PPL) como el punto práctico.
- Reproducibilidad en hardware de consumo: el GGUF Q8_0 seleccionado corre en una GPU AMD RX 6700-class de 10 GiB con ROCm 6.4.4 y `HSA_OVERRIDE_GFX_VERSION=10.3.0`, lo que permite replicar la evaluación sin acceso a H200.
- Estudio de fallos de destilación: el artefacto de Fase 2 inválido (NIAH 1/5) sirve como caso negativo documentado para analizar cuándo el entrenamiento con atención descongelada colapsa hacia patrones locales.
- Prueba de concepto de inferencia de largo contexto en local: `llama-server` con el GGUF `g125` y 128k de contexto permite experimentar con recuperación de información sin infraestructura de datacenter.

## Benchmarks y rendimiento

Perplejidad a 128k sobre FineWeb (Q8_0, `n_ctx=131072`, una ventana). PPL densa de referencia: 12,2869.

| Indexer | K=2048 (1,56%) | K=4096 (3,125%) | K=8192 (6,25%) |
|---|---:|---:|---:|
| 16k FineWeb | 16,2549 (+32,3%) | 14,0962 (+14,7%) | 12,9619 (+5,5%) |
| 32k OpenCode `g25` | 15,3252 (+24,7%) | 13,6194 (+10,8%) | 12,7571 (+3,8%) |
| 32k OpenCode `g50` | 14,9688 (+21,8%) | — | — |
| 32k OpenCode `g75` | 14,8243 (+20,6%) | — | — |
| 32k OpenCode `g100` | 14,7801 (+20,3%) | — | — |
| 32k OpenCode `g125` (seleccionado) | 14,7664 (+20,2%) | 13,3352 (+8,5%) | 12,6555 (+3,0%) |
| Referencia 35B `mm_64k` | +14,5% | +2,8% | +0,38% |

NIAH multi-needle de 32 agujas a 128k:

| Modelo | Resultado |
|---|---:|
| Denso | 5/5 |
| Indexer 16k, K=2048 | 4/5 (fallo en profundidad 75%: color y código incorrectos) |
| 32k `g25`, K=2048 | 5/5 |
| 32k `g125`, K=2048 | 5/5 |
| 32k `g125`, K=4096 | 5/5 |
| Fase 2 2k (inválido), K=2048 | 1/5 |

Checkpoints de 16k (ejecuciones rápidas en H200; porcentajes corregidos para block size 4):

| Contexto | K | Bloques | PPL densa | PPL QSA | Delta | NIAH |
|---:|---:|---:|---:|---:|---:|---:|
| 16k | 256 | 1,56% | 8,1630 | 8,8304 | +8,18% | 5/5 |
| 16k | 512 | 3,125% | 8,1630 | 8,3712 | +2,55% | 5/5 |
| 16k | 2048 | 12,5% | 8,1630 | no disponible (truncado en la información) | no disponible | no disponible |

Advertencia del autor: las PPL del 2B son Q8_0/FineWeb y la referencia del 35B es bf16/WikiText-2; solo son comparables los deltas dentro de una misma fila, no los valores absolutos entre modelos. No se publican resultados de MMLU, HumanEval ni GSM8K en la información disponible, aunque el repositorio incluye un script de GSM8K.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 con contexto de 128k se ejecutó en una GPU de 10 GiB (AMD RX 6700-class, gfx1031) con ROCm 6.4.4 y `HSA_OVERRIDE_GFX_VERSION=10.3.0`; el tamaño del repo es de 5,0 GB.
- GPU recomendadas: para inferencia, cualquier GPU con al menos 10 GiB y soporte Vulkan/ROCm; para entrenamiento del indexer, PyTorch 2.7.1+rocm6.4 en la misma tarjeta doméstica, y H200 para el indexer de 16k y el benchmark rápido inicial.
- GPU de consumo: sí cabe en tarjetas de 10 GiB como la RX 6700-class; no se documenta prueba en RTX 4090, A100 ni H100.
- Despliegue: llama.cpp con el port QSA a Vulkan de `patches/` (`llama-server`, `llama-perplexity`); los pesos del indexer se distribuyen en PyTorch/FP32 para entrenamiento. No se documenta soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-QSA-experiments (este) | 1,89B | 128k | Híbrida con QSA (1,56%–6,25% del contexto) | Apache 2.0 | Hugging Face, GGUF Q8_0 + PyTorch |
| Qwen3.5-2B-heretic (base denso) | 1,89B | 128k (heredado) | Densa + DeltaNet | Apache 2.0 | Hugging Face |
| Referencia 35B `mm_64k` (mencionada por el autor) | 35B (no confirmado) | 64k (por el nombre del checkpoint) | QSA | no disponible | no disponible |

El autor indica explícitamente que el 2B no supera a la referencia de 35B con la misma esparsidad: a K=2048 el 2B pierde +20,2% de PPL frente al +14,5% del 35B, y a K=8192 pierde +3,0% frente al +0,38%. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: el propio autor lo describe como banco de pruebas de una receta pensada para el 35B, y no supera a la referencia de 35B a igual esparsidad.
- El artefacto de Fase 2 incluido en `gguf/` es inválido: aprendió un patrón local y colapsó el NIAH a 1/5; no debe desplegarse.
- El indexer seleccionado se entrenó sobre un corpus privado de sesiones de OpenCode que no se publica, lo que impide reproducir el entrenamiento de forma completa; solo se liberan pesos, configuraciones y datos públicos de evaluación.
- La perplejidad a K=2048 se degrada un +20,2% frente a atención densa; el punto operativo práctico es K=4096 (+8,5%), no el objetivo original de K=2048.
- Las comparaciones de PPL entre el 2B (Q8_0/FineWeb) y el 35B (bf16/WikiText-2) no son válidas en valores absolutos; solo lo son los deltas dentro de una fila.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-08), por lo que no hay validación externa de los resultados.
- Idiomas soportados no documentados; el modelo base Qwen3.5 es multilingüe según su model card, pero no se verifica el efecto de la ablación Heretic ni de QSA sobre esa capacidad.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; la ablación Heretic del modelo base puede alterar el comportamiento de rechazo y seguridad respecto al original.
- La licencia Apache 2.0 permite uso comercial, pero el estado de investigación y los artefactos inválidos desaconsejan cualquier despliegue en producción.
- El runtime QSA depende de un parche no upstream de llama.cpp (Vulkan), lo que limita la portabilidad y el soporte a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tvall43/Qwen3.5-2B-heretic-QSA-experiments
- Modelo base denso: https://huggingface.co/tvall43/Qwen3.5-2B-heretic
- Modelo original de referencia (mencionado en la model card): `unsloth/Qwen3.5-2B` (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
