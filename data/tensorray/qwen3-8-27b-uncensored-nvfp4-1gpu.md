# TensorRay/Qwen3.8-27B-Uncensored-NVFP4-1GPU

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-1GPU es una cuantización NVFP4 (W4A4) del modelo abliterado `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del `Qwen/Qwen3.8-27B` de Alibaba. El trabajo lo publica el usuario TensorRay y su objetivo es empaquetar los pesos en formato FP4 de cuantización completa para que un modelo de 27.781 millones de parámetros quepa, junto con su caché KV, en una única tarjeta Blackwell de 24 GB.

La arquitectura es `Qwen3_5ForConditionalGeneration`: 64 capas con atención híbrida (48 capas de atención linear Gated DeltaNet y 16 de atención completa), torre de visión y cabeza MTP para decodificación especulativa. El contexto máximo del modelo es de 262.144 tokens; esta build mide 131.072 tokens servibles en una RTX PRO 4000 Blackwell SFF de 24 GB, con un pool KV de 141.663 tokens.

La relevancia es doble: por un lado demuestra que una cuantización NVFP4 íntegra (sin mezclar FP8) preserva el tool calling en un modelo abliterado (0 fallos en 96 ejecuciones frente a 8/96 de otra build comparable); por otro, habilita despliegues de contexto largo en GPUs de consumo profesional pequeño, que es donde el modelo mixto NVFP4+FP8 original se queda en 22.080 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: transformer híbrido, 64 capas (48 Gated DeltaNet linear-attention + 16 full-attention), torre de visión, cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (límite del modelo); 131.072 tokens medidos en 24 GB con esta build |
| Tipos de cuantizacion | NVFP4 W4A4 (`nvfp4-pack-quantized`, grupos de 16, escala FP8-E4M3 por grupo y FP32 global por tensor); `lm_head`, torre de visión, `conv1d`, normas, embeddings y cabeza MTP en BF16 |
| Idiomas soportados | en, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` 0.20.1 (`model_backbone.safetensors` 19,71 GB + `model_mtp.safetensors` 0,85 GB, 2.687 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 64 capas que combina 48 capas de atención linear Gated DeltaNet con 16 capas de atención completa, lo que reduce el coste de la caché KV en contextos largos. Incorpora una torre de visión (27 bloques más un merger) que lo habilita para tareas image-text-to-text, y una cabeza MTP (multi-token prediction) que actúa como borrador para decodificación especulativa. Sobre el modelo original, orcarouter aplicó abliteración (eliminación de la dirección de rechazo, Arditi et al. 2024), y TensorRay aplicó únicamente cuantización.

La cuantización cubre 496 capas `Linear` en NVFP4: las tres proyecciones MLP en las 64 capas (192), las proyecciones q/k/v/o de las 16 capas de atención completa (64) y las cinco proyecciones de las 48 capas Gated DeltaNet (240). Se dejaron 126 módulos en la lista de ignorados. La calibración se hizo con `llm-compressor` 0.15.0, `QuantizationModifier` con esquema NVFP4, one-shot y redondeo al más próximo (sin GPTQ ni AWQ), usando 32 muestras de 2.048 tokens del dataset `perfectblend` y solo CPU (16 núcleos, ~30 GB de RAM). La cabeza MTP se mantiene en BF16 para conservar la tasa de aceptación de la decodificación especulativa, y la torre de visión también queda en BF16. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset original ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat y tokenizador idénticos a los del modelo BF16 de origen.
- Razonamiento multi-paso (etiqueta `reasoning` en el repo) y soporte de modo de pensamiento heredado del modelo base.
- Capacidades image-text-to-text mediante la torre de visión en BF16.
- Tool calling y function calling; el autor reporta 0 pérdidas en 96 ejecuciones de un prompt de agente con el parser estándar.
- Decodificación especulativa gracias a la cabeza MTP en BF16.
- Contexto largo: hasta 131.072 tokens servibles en una tarjeta de 24 GB con esta build.
- Multilingüe limitado a inglés, chino y alemán según los metadatos del repo.
- Modelo abliterado: responde a peticiones que el modelo base rechazaría, sin guardarraíles integrados.

## Casos de uso

- Agentes autónomos con tool calling: la build mantiene el formato `<function=...>` en el 100% de las ejecuciones medidas, por lo que puede integrarse en bucles de agente con herramientas externas sin fallos de parseo atribuibles a la cuantización.
- Análisis de documentos largos en una sola GPU: con 131.072 tokens de contexto y un pool KV de 141.663 tokens, permite ingerir contratos, informes o bases de código completas sin fragmentación ni recuperación externa.
- Asistencia sobre imágenes en entornos con restricciones de hardware: la torre de visión en BF16 permite tareas image-text-to-text en una única tarjeta de 24 GB, útil para inspección de capturas, diagramas o documentación escaneada.
- Despliegue en estaciones de trabajo con Blackwell de gama pequeña: la build ocupa 17,53 GiB en GPU, lo que deja margen para el resto del stack en tarjetas RTX PRO 4000 Blackwell SFF o similares.
- Generación de código y razonamiento técnico en pipelines internos: el soporte de razonamiento y function calling encaja en asistentes de desarrollo, revisión automatizada y generación de parches con contexto de repositorio amplio.
- Investigación sobre alineación y abliteración: al conservar la eliminación de la dirección de rechazo y el mismo tokenizador que el modelo de origen, sirve como banco de pruebas para estudiar el efecto de la cuantización W4A4 sobre el comportamiento abliterado.
- Evaluación de cuantización NVFP4: la comparación publicada frente a la build mixta NVFP4+FP8 (22.080 frente a 131.072 tokens de contexto en la misma tarjeta) la convierte en referencia para medir el impacto de FP4 completo en modelos híbridos con atención linear.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son medidas de despliegue y de fiabilidad de tool calling, no benchmarks académicos:

| Metrica | Esta build (NVFP4 completo) | Build mixta NVFP4 + FP8 |
|---|---|---|
| Pesos en disco | 20,58 GB | 24,72 GB |
| Pesos en GPU | 17,53 GiB | 21,38 GiB |
| Contexto máximo que arranca en 24 GB | 131.072 tokens (pool KV 141.663) | 22.080 tokens (util 0,97, len 32k) |
| Decodificación, 1 stream | 22,9 tok/s | no disponible |
| Decodificación, 4 streams | 89 tok/s agregados | no disponible |
| Pérdida de tool calls (96 ejecuciones) | 0 / 96 | no disponible (otra build comparable: 8 / 96) |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,53 GiB de pesos en GPU más la caché KV; el autor valida 131.072 tokens de contexto en una tarjeta de 24 GB con `util 0,97`.
- GPU validadas: NVIDIA RTX PRO 4000 Blackwell SFF (24 GB, 70 W). Requiere arquitectura Blackwell por el soporte de NVFP4.
- GPU recomendadas: cualquier Blackwell con 24 GB o más; en tarjetas de mayor VRAM se puede ampliar el contexto hasta el límite de 262.144 tokens, aunque no se han publicado medidas.
- No cabe en GPUs consumer sin soporte NVFP4 nativo; el autor descartó `--cpu-offload-gb` porque degrada cada token al cruzar PCIe.
- Despliegue: vLLM 0.34.0 con `compressed-tensors` y FlashInfer CUTLASS NVFP4 GEMM. No se mencionan otros runtimes (llama.cpp, Ollama, TGI).
- Throughput medido: 22,9 tok/s en un stream y 89 tok/s agregados con 4 streams en la RTX PRO 4000 Blackwell SFF.
- Calibración reproducible en CPU: 16 núcleos y ~30 GB de RAM con `llm-compressor` 0.15.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| TensorRay/Qwen3.8-27B-Uncensored-NVFP4-1GPU | 27,78 B | 262.144 (131.072 medidos en 24 GB) | NVFP4 W4A4 completo | Apache 2.0 | 17,53 GiB en GPU, 0/96 fallos de tool calling |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 | 27,78 B (mismo base) | 262.144 (22.080 medidos en 24 GB) | NVFP4 + FP8 mixto | Apache 2.0 | 21,38 GiB en GPU, mejor precisión esperada en tarjetas grandes |
| orcarouter/Qwen3.8-27B-Uncensored | 27,78 B (mismo base) | 262.144 | BF16 | Apache 2.0 | 55,59 GB en 18 shards, requiere hardware de mayor VRAM |
| Qwen/Qwen3.8-27B | 27,78 B (mismo base) | 262.144 | BF16 | no disponible en la información | Modelo original con guardarraíles intactos |

## Limitaciones y advertencias

- Modelo abliterado: cumple peticiones dañinas, poco éticas o ilegales que el modelo base rechaza. No tiene guardarraíles integrados y no debe exponerse a usuarios finales sin moderación propia.
- Riesgo elevado de alucinación y de contenido sensible; la cuantización W4A4 puede añadir degradación adicional de precisión frente a BF16, aunque el autor solo reporta medidas de tool calling, no de calidad generativa.
- Idiomas soportados limitados a inglés, chino y alemán según los metadatos; el rendimiento en castellano no está documentado.
- Requiere hardware Blackwell para NVFP4; no es desplegable en GPUs anteriores sin recalcular o reconvertir los pesos.
- El contexto de 131.072 tokens está medido en una tarjeta concreta de 24 GB; en configuraciones distintas el límite práctico variará.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado y debe cumplir la normativa aplicable.
- El autor no acepta responsabilidad por mal uso; las salidas no representan a TensorRay, orcarouter ni Qwen/Alibaba.
- Solo se ha validado el despliegue con vLLM 0.34.0 y `compressed-tensors`; otros runtimes no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorRay/Qwen3.8-27B-Uncensored-NVFP4-1GPU
- Modelo base abliterado en BF16: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Build mixta NVFP4 + FP8 de referencia: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Referencia de abliteración (Arditi et al. 2024): no disponible enlace directo en la información proporcionada
