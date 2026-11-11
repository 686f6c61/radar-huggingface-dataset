# Xylolabs/Qwen3.8-27B-Tensix-BFP4

## Resumen

Qwen3.8-27B-Tensix-BFP4 es una cuantización del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por Xylolabs y publicada bajo licencia Apache 2.0. El checkpoint adapta el modelo base para su ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el uso de formatos de coma flotante por bloques propietarios de TT-NN: `bfloat4_b` (BFP4, 4,5 bits por peso) para las capas lineales y `bfloat8_b` (BFP8, 8,5 bits por peso) para la cabeza del modelo de lenguaje. El resultado es un checkpoint de 17,60 GB empaquetado, con una media de 5,23 bits por peso, que conserva los tensores de embedding, normalizaciones, `mtp` y `visual` en bf16 sin modificar.

El modelo resuelve un problema muy concreto: permitir desplegar un LLM multimodal de 27.781.427.952 parámetros en hardware Tenstorrent sin recurrir a la re-cuantización en tiempo de carga. Los pesos se almacenan en safetensors en bf16, pero cada valor ya está alineado a la rejilla BFP4, de modo que TT-NN los empaqueta sin redondeos adicionales. La cuantización de las capas lineales se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue para el stack de Tenstorrent, un ecosistema emergente frente a CUDA; por otro, ofrece datos de evaluación reproducibles (KL medio respecto a BF16 de 0,02783 y top-1 del 93,19 % sobre 4.094 posiciones) que permiten valorar la pérdida de calidad frente al modelo original. La arquitectura subyacente combina atención clásica con capas Gated DeltaNet, lo que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica (16 capas) y Gated DeltaNet (48 capas); MLP en 64 capas; incluye módulos `mtp` y `visual` |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en LM head; bf16 en embeddings, norms, `mtp` y `visual`; media de 5,23 bits/peso |
| Idiomas soportados | no disponible (la calibración usó texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP4/BFP8); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida: 16 capas con atención q, k, v, o convencional y 48 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y output), además de 64 capas MLP con proyecciones gate, up y down. El checkpoint incluye también un módulo `mtp` (multi-token prediction) y un módulo `visual`, ambos conservados en bf16, lo que confirma la naturaleza image-text-to-text del pipeline. Esta combinación de atención y DeltaNet reduce el coste computacional en secuencias largas respecto a un transformer denso equivalente.

El entrenamiento original del modelo base no se detalla en la información disponible. Lo que sí está documentado es el proceso de cuantización: las capas lineales se redondearon a BFP4 mediante GPTQ con búsqueda de exponente por bloque, usando un conjunto de calibración de 65.536 tokens compuesto por WikiText-2 y Wikipedia en coreano. La LM head se redondeó a BFP8 por redondeo al más cercano. Solo se cuantizó y evaluó el modelo de lenguaje; los módulos `visual` y `mtp` quedaron intactos en bf16. La innovación técnica principal es que los valores almacenados ya están en la rejilla BFP4, evitando el redondeo en el momento de la carga en el dispositivo Tensix.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento image-text-to-text (pipeline declarado), gracias al módulo `visual` conservado en bf16.
- Razonamiento y respuesta a preguntas: la evaluación incluye 33 prompts cortos con comprobación automática, de los que el modelo acierta 38 de 40 respuestas (según la tabla de evaluación).
- Predicción multi-token (`mtp`), útil para decodificación especulativa o generación acelerada.
- Capacidades multilingües: la calibración incluyó coreano, y la evaluación KL/top-1 cubre texto en inglés y coreano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está diseñado para empaquetarse directamente en TT-NN con `ttnn.as_tensor` usando `bfloat4_b`/`bfloat8_b`, lo que permite servir el modelo de 27B en hardware Tensix sin re-cuantizar en carga.
- Demo tensor-parallel en QuietBox 2: el demo `qwen38_27b_qb2` de tt-metal v0.81.1 ejecuta el modelo en cuatro chips Blackhole; útil para validar pipelines de inferencia distribuida en este hardware con `QWEN_PRECISION_CONFIG=baseline`.
- Evaluación de pérdida por cuantización: investigadores pueden comparar el KL medio (0,02783) y el top-1 (93,19 %) frente a BF16 y Q4_K_M para decidir si BFP4 es aceptable en su tarea, usando los scripts `verify_grid.py` y `pack_tensix.py`.
- Procesamiento de documentos con componente visual: al conservar el módulo `visual` en bf16, el modelo puede emplearse en tareas image-text-to-text (descripción de imágenes, VQA) sobre el stack de transformers con `device_map="auto"`.
- Generación de texto multilingüe inglés-coreano: la calibración y la evaluación cubren ambos idiomas, por lo que es adecuado para aplicaciones que requieran texto en coreano además de inglés.
- Investigación sobre formatos de coma flotante por bloques: el repositorio incluye `quant4.json` con el formato de cada proyección, lo que facilita estudiar el impacto de BFP4 por capa y reproducir el pipeline GPTQ con búsqueda de exponente.
- Prototipado en CPU/GPU con transformers: aunque el objetivo sea Tensix, el checkpoint carga con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")`, lo que permite validar comportamiento antes de portar a TT-NN.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.8-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,23 | 17,596 | 0,02783 | 93,19 | 38 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,811 | 0,02084 | 93,50 | 40 de 40 | 0 |

Las métricas de KL y top-1 se calculan sobre 4.094 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano. Las respuestas corresponden a 33 prompts cortos con comprobación automática. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint empaquetado ocupa 17,60 GB; en bf16 (carga con transformers) requiere aproximadamente 55,6 GB, coincidiendo con el tamaño del repo.
- GPU recomendadas: no se documentan GPU concretas; el destino principal son aceleradores Tenstorrent Tensix (Wormhole y Blackhole). Para carga en bf16 se necesitaría una GPU con al menos 56 GB (A100 80 GB, H100 80 GB).
- Cabe en consumer GPU: no en bf16; el checkpoint empaquetado de 17,60 GB podría caber en GPUs de 24 GB solo si el runtime soporta BFP4, lo cual no está documentado fuera de TT-NN.
- Opciones de despliegue: TT-NN (ttnn 0.81.1), tt-metal con el demo `qwen38_27b_qb2`, transformers con `AutoModelForCausalLM` (bf16), y scripts `pack_tensix.py` y `verify_grid.py`. tt-forge (tt-xla) aún no se ha probado con este checkpoint.
- Latencia y throughput: no disponibles. El demo de tt-metal requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware; no se han publicado cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-Tensix-BFP4 | 27,78 B | no disponible | BFP4/BFP8 (5,23 bits/peso) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (BF16) | 27,78 B | no disponible | bf16 (16 bits/peso) | Apache 2.0 (según base) | Hugging Face |
| Qwen3.8-27B Q4_K_M (llama.cpp) | 27,78 B | no disponible | Q4_K_M (4,92 bits/peso) | Apache 2.0 (según base) | Formato GGUF vía llama.cpp |

La comparación se limita al modelo base y a la cuantización Q4_K_M citada en la model card; no se dispone de datos de otros modelos de 27B comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `visual` y `mtp` no han sido evaluados tras la conversión.
- El demo de tt-metal solo se ha probado en el simulador `ttsim` (Blackhole) con ttnn 0.81.1, no en hardware real; la cabeza del modelo y una ejecución completa requieren los cuatro chips y no fueron probadas.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- El demo `qwen38_27b_qb2` rechaza hardware distinto de QuietBox 2 (cuatro Blackhole); no es portable a otras configuraciones sin adaptación.
- Es necesario exportar `QWEN_PRECISION_CONFIG=baseline`; de lo contrario, el `config/precision.json` incluido re-redondearía la cabeza a bfloat4_b.
- La pérdida de calidad es medible: KL medio de 0,02783 y top-1 del 93,19 % frente a 100 % en BF16; dos respuestas incorrectas de 40 en la evaluación corta.
- La calibración usó solo inglés y coreano; el comportamiento en otros idiomas no está caracterizado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo tt-metal qwen38_27b_qb2 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Qwen3.8-27B-Tensix-BFP4/blob/main/LICENSE
