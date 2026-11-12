# Xylolabs/Qwen3.6-27B-Tensix-BFP4

## Resumen

Qwen3.6-27B-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.6-27B, desarrollada por Xylolabs y publicada bajo licencia Apache-2.0. El modelo base es un transformer híbrido de Qwen que combina capas de atención clásica con capas Gated DeltaNet (atención lineal) y un módulo MTP (multi-token prediction), con 27.781 millones de parámetros totales y capacidad de procesamiento image-text-to-text. Esta versión cuantiza exclusivamente las capas lineales del modelo de lenguaje a `ttnn.bfloat4_b` (block floating point de 4 bits con exponente compartido por bloque) mediante GPTQ, manteniendo embeddings, normas, cabeza LM y los módulos `mtp` y `visual` en bf16.

El objetivo del checkpoint es el despliegue en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) a través de TT-NN, la pila de software `tt-metal`. Los pesos se guardan en ficheros bf16 cuyos valores ya están alineados a la rejilla BFP4, de modo que TT-NN los empaqueta sin pérdida adicional. El resultado son 5,59 bits por peso de media y 18,79 GB empaquetados, frente a los 53,79 GB del modelo base en BF16, lo que reduce aproximadamente a un tercio el espacio de pesos.

La relevancia actual del checkpoint es doble: por un lado, demuestra una ruta de cuantización de bajo nivel orientada a hardware no-GPU (NPU de Tenstorrent); por otro, la evaluación publicada es honesta y limitada (solo se ha probado en el simulador `ttsim`, no en silicio real, y solo el módulo de lenguaje fue cuantizado y evaluado). Es un artefacto de interés para investigadores que trabajen con TT-Metal o con formatos block-floating-point, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica (16 capas) + Gated DeltaNet (48 capas) + MTP; multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embeddings, normas, LM head, `mtp` y `visual`; media de 5,59 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores en la rejilla BFP4); índice `model.safetensors.index.json` y mapa de formatos `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer híbrido con 16 capas de atención q/k/v/o y 48 capas Gated DeltaNet con proyecciones q, k, v, z, a, b y output, además de 64 capas MLP con gate/up/down. Incorpora un módulo MTP (multi-token prediction) y un torre visual, ambos preservados en bf16 en esta cuantización. La combinación de atención cuadrática y atención lineal por DeltaNet busca equilibrar calidad y coste computacional en contextos largos.

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque (per-block exponent search) sobre las proyecciones lineales, con calibración en 65.536 tokens de WikiText-2 y Wikipedia en coreano. Cada matriz cuantizada se almacena en bf16 pero con todos sus valores ya redondeados a la rejilla BFP4, de forma que el empaquetado en TT-NN es exacto. El autor publica scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar en `ttnn.bfloat4_b` o `ttnn.bfloat8_b`. No se documentan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional (pipeline `image-text-to-text`).
- Procesamiento de imágenes junto con texto, heredado de la torre `visual` del modelo base (preservada en bf16).
- Predicción multi-token mediante el módulo `mtp` (preservado en bf16).
- Soporte de plantilla de chat (`apply_chat_template`) y formato conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización block-floating-point: el checkpoint sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en un transformer híbrido de 27B, con scripts de verificación incluidos en el repositorio.
- Desarrollo y depuración de kernels TT-NN: los pesos permiten validar el empaquetado `ttnn.bfloat4_b` y `ttnn.bfloat8_b` en el simulador `ttsim` antes de portar a hardware Wormhole o Blackhole.
- Despliegue en aceleradores Tenstorrent: el tamaño empaquetado de 18,79 GB permite evaluar el ajuste en DRAM de NPU Tensix y comparar con el demo `qwen38_27b_qb2` de tt-metal v0.81.1.
- Prototipado de asistentes multimodales en entornos con NPU: al conservar la torre visual en bf16, el modelo puede usarse para tareas image-text-to-text en infraestructura Tenstorrent, aunque sin validación en silicio publicada.
- Evaluación comparativa de precisión: la tabla de evaluación con KL medio frente a BF16 y top-1 permite medir la degradación introducida por la cuantización en tareas de generación.
- Integración en pipelines de investigación con Transformers: el quickstart con `AutoModelForCausalLM` y `device_map="auto"` permite cargar el modelo en GPUs convencionales para inspección y pruebas de calidad, aunque el formato está pensado para TT-NN.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.6-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | no disponible |
| Qwen3.6-27B-Tensix-BFP4 | 5,59 | 18,79 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La información proporcionada solo incluye la fila completa del modelo BF16 de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni los valores de KL y top-1 del checkpoint cuantizado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 55,6 GB en safetensors bf16; empaquetado en BFP4 son 18,79 GB de pesos.
- GPU recomendadas: no disponibles. El checkpoint está diseñado para NPU Tenstorrent Tensix (Wormhole, Blackhole), no para GPU.
- ¿Cabe en GPU consumer? No hay datos oficiales. Por tamaño empaquetado (18,79 GB) podría caber en GPUs con 24 GB o más, pero el formato BFP4 no es nativo en CUDA y requeriría conversión.
- Opciones de despliegue: TT-NN / tt-metal v0.81.1 (probado en el simulador `ttsim` con Blackhole, no en hardware); tt-forge (tt-xla) no probado con este checkpoint; Transformers con `AutoModelForCausalLM` para inspección en GPU.
- Demos compatibles: `qwen38_27b_qb2` de tt-metal v0.81.1 con `QWEN_PRECISION_CONFIG=baseline`, tensor-parallel en cuatro chips Blackhole (QuietBox 2); demo `qwen36` de tt-metal para P150x4 o x8 (no probado con este checkpoint).
- Latencia y throughput: no disponibles; no se han ejecutado pruebas en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-27B-Tensix-BFP4 | 27,78B | no disponible | BFP4 (4,5 bits/peso) | Apache-2.0 | Tenstorrent Tensix |
| Qwen/Qwen3.6-27B (base) | 27,78B | no disponible | BF16 | Apache-2.0 | GPU / CPU |
| Qwen3.8-27B (referencia del demo tt-metal) | no disponible | no disponible | QB2 (demo) | no disponible | Blackhole (QuietBox 2) |

La información disponible no incluye datos de rendimiento comparado con alternativas de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.6-27B o modelos de 27B en BFP4/BF16). La comparativa se limita a parámetros, licencia y hardware objetivo.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el módulo MTP se mantienen en bf16 sin evaluación publicada.
- No se ha probado en hardware Tensix real: las pruebas se hicieron en el simulador `ttsim` con ttnn 0.81.1 (Blackhole). El rendimiento y la corrección en silicio no están verificados.
- tt-transformers no soporta esta arquitectura; el despliegue requiere tt-metal y demos específicos.
- El demo `qwen38_27b_qb2` exige cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware; con `QWEN_PRECISION_CONFIG=baseline` re-cuantiza la cabeza LM bf16 a bfloat8_b, lo que introduce una diferencia respecto al checkpoint.
- El demo `qwen36` no se ha probado con este checkpoint y envía la proyección down y la cabeza a bfloat8_b.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación multilingüe específicos de esta cuantización.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-12) sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo tt-metal `qwen38_27b_qb2` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Demo tt-metal `qwen36` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tensix-BFP4/blob/main/LICENSE
