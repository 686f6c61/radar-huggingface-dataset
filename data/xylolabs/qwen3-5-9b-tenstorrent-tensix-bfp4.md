# Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-9B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3.5-9B realizada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5-9B, un transformer híbrido que combina capas de atención clásica con capas Gated DeltaNet (atención lineal), y sustituye las proyecciones lineales de atención y MLP por matrices cuantizadas en formato `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits) mediante GPTQ. El resultado es un checkpoint de 7,11 bits por peso de media y 7,96 GB empaquetados, frente a los 17,91 GB del modelo en BF16.

La relevancia de esta ficha es doble. Por un lado, demuestra una ruta de despliegue de un LLM de ~9.650 millones de parámetros sobre hardware no-GPU (NPUs Tensix), un nicho donde la oferta de pesos cuantizados específicos para el backend es todavía escasa. Por otro, los datos de evaluación publicados por el autor permiten comparar la pérdida de calidad frente a BF16 y frente a una cuantización estándar de llama.cpp (Q4_K_M), con métricas de divergencia KL y top-1 sobre 16.312 posiciones en inglés y coreano.

El checkpoint está pensado para integrarse en el stack de Tenstorrent (tt-metal, TT-NN, tt-forge) y no como un modelo de propósito general en GPU: los pesos están almacenados como valores bf16 sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores, pero requieren el runtime adecuado para aprovechar la compresión. La licencia es Apache 2.0 y el repo ocupa 19,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica (8 capas) + Gated DeltaNet / atención lineal (24 capas); 32 capas MLP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el demo de tt-metal incluye una prueba `traced_128k`, lo que sugiere soporte de hasta 128K en ese backend, sin confirmación oficial) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en las proyecciones lineales) con GPTQ; resto de tensores en bf16; `A_log` y `norm.weight` de atención lineal en float32; media de 7,11 bits por peso |
| Idiomas soportados | no disponible (la calibración GPTQ usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`), más `quant4.json` con el formato por proyección y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida: 8 capas con atención multi-cabeza clásica (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet, un mecanismo de atención lineal con compuertas que reduce el coste computacional en secuencias largas. Las 32 capas MLP (gate, up, down) y todas las proyecciones de atención y DeltaNet han sido cuantizadas a BFP4; el LM head, los embeddings, las normas y el bloque MTP (`mtp`) y el módulo visual (`visual`) permanecen en bf16. Los tensores `linear_attn.A_log` y `linear_attn.norm.weight` se mantienen en float32 sin modificar.

La cuantización se realizó con GPTQ sobre las proyecciones lineales, calibrada con 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano. El autor indica que solo se cuantizó y evaluó el modelo de lenguaje, no el módulo visual. Un detalle técnico relevante: las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de forma que TT-NN las empaqueta sin cambiar sus valores; el script `verify_grid.py` comprueba la rejilla solo con torch y `pack_tensix.py` verifica cada matriz empaquetada. El mismo contenido también se empaqueta de forma exacta en `ttnn.bfloat8_b`. No se documentan en la información disponible detalles sobre el entrenamiento original de Qwen3.5-9B (número de tokens, composición del dataset, RLHF/DPO); esa información correspondería a la model card del modelo base.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de Qwen3.5-9B.
- Razonamiento y matemáticas (capacidad del modelo base; sin benchmarks específicos publicados en esta ficha).
- Generación de código (capacidad del modelo base; sin datos de HumanEval en la información disponible).
- Procesamiento image-text-to-text: el pipeline declarado en los tags incluye `image-text-to-text` y el checkpoint conserva el módulo `visual` en bf16, aunque el autor indica que solo se cuantizó y evaluó el modelo de lenguaje.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no confirmadas; la calibración incluyó inglés y coreano, pero no se documenta la cobertura idiomática.
- Modo thinking: no disponible en la información proporcionada.
- Bloque MTP (multi-token prediction) conservado en bf16 para decodificación especulativa en el backend tt-metal (`QWEN36_SPEC=0` permite omitirlo).

## Casos de uso

- Despliegue de un LLM de ~9,6B en NPUs Tenstorrent: el checkpoint está empaquetado para TT-NN y ocupa 7,96 GB de memoria de dispositivo solo en pesos del modelo de lenguaje, más KV cache y buffers. Es adecuado para entornos con Wormhole o Blackhole donde no se quiere depender de GPUs.
- Inferencia de texto en el demo de tt-metal Qwen3.5/3.6 (v0.81.1): el demo carga las proyecciones DeltaNet, atención y MLP down en `bfloat8_b` y las MLP gate/up en `bfloat4_b` sobre una Blackhole P150. Sirve para validar el flujo completo de un modelo híbrido en hardware Tensix.
- Evaluación de cuantización BFP4 frente a BF16 y Q4_K_M: el checkpoint incluye métricas de KL y top-1 que permiten medir la degradación de una cuantización de 4 bits en un transformer híbrido con atención lineal, un caso poco cubierto en la literatura.
- Investigación en decodificación especulativa: el bloque MTP conservado en bf16 permite experimentar con multi-token prediction en el backend tt-metal, con la opción de desactivarlo mediante `QWEN36_SPEC=0`.
- Prototipado de asistentes conversacionales en hardware de bajo consumo: la reducción de 17,91 GB a 7,96 GB facilita ejecutar un modelo de 9,6B en un único acelerador con memoria limitada.
- Validación de pipelines de cuantización GPTQ para arquitecturas híbridas: el repo incluye `quant4.json`, scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y el código `tensix-bfp-gptq`, útiles para reproducir el proceso sobre otros modelos.
- Integración en flujos de `transformers`: el checkpoint se carga con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16")`, lo que permite usarlo como referencia en CPU/GPU para comparar con la ejecución en Tensix.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. KL y top-1 se calculan sobre 16.312 posiciones de inglés y coreano; la columna "Answers right" refleja aciertos sobre 40 preguntas.

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Aciertos | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B) | 16 | 17,91 | 0 | 100 | 38 de 40 | - |
| **Este modelo (BFP4)** | 7,11 | 7,962 | 0,03473 | 90,96 | 35 de 40 | 2 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,03669 | 90,47 | 37 de 40 | 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 7,96 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Aceleradores soportados: Tenstorrent Wormhole y Blackhole; el demo de tt-metal se ha probado sobre una Blackhole P150.
- Compatibilidad con GPU: el checkpoint se carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"`, pero los pesos están almacenados como valores bf16 sobre la rejilla BFP4, por lo que en GPU no se aprovecha la compresión de 4 bits; no se documenta VRAM estimada para ese caso.
- Opciones de despliegue: TT-NN (`ttnn.bfloat4_b`) a través de tt-metal v0.81.1; tt-forge (tt-xla) aún no probado con este checkpoint; `transformers` para carga y referencia.
- Verificación: `pack_tensix.py` comprueba cada matriz empaquetada (con `--device` también hace round-trip por DRAM del dispositivo); `verify_grid.py` valida la rejilla solo con torch.
- Latencia y throughput: no disponibles. El autor indica que no se ha probado una ejecución completa del demo de tt-metal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** | 9,65B | no disponible | BFP4 GPTQ (7,11 bits/peso), 7,96 GB | Apache 2.0 | Hugging Face, pesos safetensors |
| Qwen/Qwen3.5-9B (BF16) | 9,65B | no disponible | BF16, 17,91 GB | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen3.5-9B Q4_K_M (llama.cpp) | 9,65B | no disponible | Q4_K_M, 5,02 bits/peso, 5,78 GB | Apache 2.0 (según modelo base) | Derivado de llama.cpp |

La comparativa se limita al mismo modelo base en distintas precisiones, ya que la información disponible no incluye otros modelos de la misma categoría. Frente a Q4_K_M, este checkpoint ocupa más espacio (7,96 GB frente a 5,78 GB) y tiene peor KL (0,03473 frente a 0,03669 es mejor en este caso, pero peor top-1: 90,96 % frente a 90,47 %), con 35 aciertos frente a 37 sobre 40 preguntas. La ventaja de este checkpoint no es la compresión máxima, sino el empaquetado nativo para TT-NN sin re-cuantización.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual (`visual`) permanece en bf16 y no se ha validado su comportamiento tras la cuantización.
- El checkpoint está diseñado para TT-NN; en GPU o CPU no se aprovecha la compresión BFP4 y los pesos se cargan como bf16.
- El demo de tt-metal no se ha ejecutado completo con este checkpoint; el autor solo confirma el empaquetado exacto de las proyecciones de las capas 0 a 3 y advierte de que dos partes se re-cuantizan en el demo: el LM head (siempre en `bfloat8_b`) y el bloque MTP (bf16 en el checkpoint, `bfloat8_b` en el demo).
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- La calibración GPTQ usó solo inglés y coreano (WikiText-2 y Wikipedia en coreano), lo que puede sesgar la calidad en otros idiomas.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-9B.
- El repo ocupa 19,3 GB, muy por encima de los 7,96 GB de pesos empaquetados, por la presencia de tensores en bf16 y float32.
- Longitud de contexto no confirmada en la información disponible; el demo incluye una prueba `traced_128k`, pero no se especifica el máximo soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
