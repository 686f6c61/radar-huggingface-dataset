# Xylolabs/Qwen3.5-4B-Tensix-BFP8

## Resumen

Xylolabs/Qwen3.5-4B-Tensix-BFP8 es una cuantización del modelo multimodal Qwen/Qwen3.5-4B, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint derivado en el que las capas lineales del modelo de lenguaje se han redondeado a la rejilla `ttnn.bfloat8_b` (BFP8) mediante GPTQ, de forma que TT-NN pueda empaquetar los pesos sin volver a redondearlos.

El checkpoint conserva los tensores en bf16, pero cada valor ya está alineado a la rejilla BFP8, lo que da una media de 9,63 bits por peso y un tamaño empaquetado de 5,07 GB frente a los 8,41 GB del BF16 original. El modelo base Qwen3.5-4B es un transformer híbrido con atención clásica y capas Gated DeltaNet, además de un bloque MTP (multi-token prediction) y un codificador visual, lo que le permite tareas de imagen-a-texto.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue de Qwen3.5-4B en hardware de Tenstorrent, un ecosistema con soporte todavía limitado para esta arquitectura; por otro, ofrece una evaluación de degradación frente al BF16 en términos de KL y top-1 que resulta útil para decidir si la cuantización es aceptable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica y capas Gated DeltaNet, más bloque MTP y codificador visual (hereda la del modelo base Qwen3.5-4B) |
| Parámetros totales | 5.295.564.288 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en capas lineales); LM head, embeddings, normas, `mtp` y `visual` en bf16; media de 9,63 bits por peso |
| Idiomas soportados | no disponible (la evaluación usa texto en inglés y coreano, pero no se declara una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint no se ha entrenado desde cero: es una cuantización post-entrenamiento del modelo base Qwen/Qwen3.5-4B. La arquitectura subyacente es un transformer híbrido que combina 8 capas de atención clásica (q, k, v, o) con 24 capas Gated DeltaNet (q, k, v, z, a, b, output) y 32 capas MLP (gate, up, down). Además incluye un bloque MTP y un módulo visual, ambos conservados en bf16 sin cambios.

El proceso de cuantización aplica GPTQ sobre la rejilla bfloat8_b, con el exponente compartido de cada bloque fijado por el empaquetador de TT-NN. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Solo se redondeó y evaluó el modelo de lenguaje; los tensores `mtp` y `visual` permanecen intactos en bf16. El resultado son pesos que ocupan 5,07 GB empaquetados y que TT-NN puede cargar directamente sin un segundo redondeo.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del módulo visual del modelo base.
- Razonamiento multi-paso, con modo de pensamiento (`thinking`) evaluado explícitamente en 7 de las 40 preguntas de la evaluación.
- Capacidades multilingües: la calibración y la evaluación cubren inglés y coreano; no se declara una lista oficial de idiomas.
- Inferencia en hardware Tensix de Tenstorrent mediante TT-NN (`ttnn.bfloat8_b`), con empaquetado directo sin redondeo adicional.
- Compatibilidad con la librería `transformers` para ejecución en GPU/CPU en bf16.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse con TT-NN en `ttnn.bfloat8_b`, de modo que el empaquetado de pesos no introduce un segundo redondeo y se aprovecha el formato nativo del hardware.
- Validación de precisión antes de producción: la tabla de evaluación (KL media de 0,00084 frente a BF16 y top-1 del 98,62 %) permite decidir si la pérdida de calidad es aceptable para una tarea concreta antes de comprometer el despliegue.
- Investigación en cuantización block-floating-point: el repo incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, útiles para reproducir el empaquetado y comprobar que ningún valor cambia tras el paso por TT-NN.
- Asistente conversacional multimodal en inglés o coreano: al conservar el módulo visual en bf16 y la plantilla de chat, puede emplearse en tareas de imagen-a-texto y diálogo multi-turno en esos idiomas.
- Evaluación comparativa de formatos de cuantización: al publicarse junto a una referencia Q4_K_M de llama.cpp (KL media de 0,03981 y top-1 del 89,79 %), sirve como punto de comparación entre BFP8 y cuantizaciones enteras de 4 bits.
- Prototipado en el simulador `ttsim` de Blackhole: la model card documenta que el checkpoint se probó con ttnn 0.81.1 sobre el simulador, lo que permite desarrollar y depurar pipelines sin hardware físico.
- Integración en `transformers` para pruebas en GPU: el snippet de quickstart carga el modelo en bf16 con `device_map="auto"`, útil para validar respuestas antes de portar el flujo a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP8)** | 9,63 | 5,065 | 0,00084 | 98,62 | 35 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 | 0 |

Las métricas de KL y top-1 cubren 16.312 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 preguntas cortas con comprobación automática más las 7 de razonamiento repetidas con `thinking` activado (40 en total). "Perdidas" indica respuestas correctas en BF16 pero incorrectas o rotas en la cuantización; un fallo en un empate cercano no se contabiliza. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`).

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,6 GB en total; el modelo de lenguaje empaquetado en BFP8 son 5,07 GB, y el BF16 de referencia 8,41 GB. La carga en `transformers` con `dtype="bfloat16"` requiere al menos los 8,41 GB del BF16 más overhead de activaciones.
- GPU recomendadas para la ruta `transformers`: no especificadas en la información disponible; por tamaño, encaja en GPUs con 16 GB o más de VRAM en bf16.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16 GB o más; la ruta BFP8 está pensada para NPU Tensix, no para GPU.
- Despliegue en Tensix: TT-NN (ttnn 0.81.1), probado sobre el simulador `ttsim` de Blackhole, no sobre hardware físico. `tt-transformers` no soporta esta arquitectura. El demo de tt-metal para Qwen3.5/3.6 (v0.81.1) no lista Qwen3.5-4B y, además, empaqueta las proyecciones MLP gate y up en `bfloat4_b`, lo que vuelve a redondear estos pesos BFP8; para ese demo el export BFP4 sería el que coincide con lo que ejecuta.
- tt-forge (tt-xla): no probado con este checkpoint. Por defecto mantiene los pesos en bf16 (exacto); su opción `bfp_bf8` empaqueta el layout [out, in] de PyTorch y vuelve a redondear los valores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Xylolabs/Qwen3.5-4B-Tensix-BFP8** | 5.295.564.288 | no disponible | BFP8, 9,63 bits/peso | Apache-2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-4B (BF16) | 5.295.564.288 | no disponible | BF16, 16 bits/peso | Apache-2.0 | Hugging Face |
| Q4_K_M del mismo checkpoint (llama.cpp) | 5.295.564.288 | no disponible | 4 bits, 5,13 bits/peso | Apache-2.0 | Generado localmente con llama.cpp v0.9.0 |

La comparación se limita al modelo base y a la cuantización Q4_K_M referenciada en la model card; no se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; los módulos `mtp` y `visual` permanecen en bf16 y no se han validado tras el proceso.
- El checkpoint se probó con ttnn 0.81.1 sobre el simulador `ttsim` de Blackhole, no sobre hardware Tensix físico.
- `tt-transformers` no soporta esta arquitectura.
- El demo de tt-metal para Qwen3.5/3.6 no lista Qwen3.5-4B y reempaqueta las proyecciones MLP gate y up en `bfloat4_b`, lo que degrada la precisión respecto al BFP8 de este checkpoint.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf8` vuelve a redondear los pesos.
- La evaluación se limita a 40 preguntas y a 16.312 posiciones de texto en inglés y coreano; no hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Qwen3.5-4B.
- Licencia Apache-2.0, que permite uso comercial; conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de tt-metal para Qwen3.5/3.6 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP8/blob/main/LICENSE
