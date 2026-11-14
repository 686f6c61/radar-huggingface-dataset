# Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4

## Resumen

Arete-27B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen/Qwen3.8-27B realizado por Nous Research. Esta versión, publicada por Xylolabs, convierte las capas lineales del modelo al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4) mediante GPTQ, y la cabeza del modelo de lenguaje (LM head) a `ttnn.bfloat8_b` (BFP8) con redondeo al más cercano, con el objetivo de ejecutar el modelo en las NPU Tensix de Tenstorrent (Wormhole y Blackhole).

El modelo conserva la arquitectura híbrida del Qwen3.8-27B original, con 16 capas de atención clásica y 48 capas de Gated DeltaNet, más 64 capas MLP, sumando 27.356.728.560 parámetros totales. La cuantización reduce el peso del modelo a 17,60 GB empaquetados en memoria de dispositivo, con una media de 5,23 bits por peso, lo que lo hace viable en hardware Tensix con memoria limitada.

La relevancia de esta ficha radica en que es un ejemplo práctico de cuantización de precisión mixta orientada a aceleradores específicos (NPU), no a GPU convencionales. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y una guía de ejecución mediante el demo `qwen38_27b_qb2` de tt-metal, aunque la evaluación publicada es parcial y se centra únicamente en el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica (16 capas) y Gated DeltaNet (48 capas), más 64 capas MLP; basado en Qwen3.8-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits) en LM head; bf16 en embeddings, normas y tensores visuales; media de 5,23 bits por peso |
| Idiomas soportados | No disponible (la calibración GPTQ usó WikiText-2 y Wikipedia en coreano, pero no se especifican idiomas soportados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores bf16 almacenados sobre rejilla BFP4/BFP8), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado (SFT) de Qwen/Qwen3.8-27B. La arquitectura combina 16 capas de atención clásica (proyecciones q, k, v, o) con 48 capas de Gated DeltaNet (proyecciones q, k, v, z, a, b, output) y 64 capas MLP (gate, up, down). Esta mezcla de atención y capas recurrentes lineales es característica de la familia Qwen3.8 y busca reducir el coste computacional en contextos largos.

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque para los tensores BFP4, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los tensores BFP8 se obtuvieron por redondeo al más cercano. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `visual` permanece en bf16 sin cambios. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Arete-27B.
- Razonamiento y respuesta a preguntas, con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento de imagen y texto (`image-text-to-text`), ya que el módulo `visual` se conserva en bf16, aunque la evaluación publicada solo cubre el modelo de lenguaje.
- Capacidades multilingües del modelo base (no detalladas en la información disponible).
- Ejecución en NPU Tensix mediante TT-NN y el demo `qwen38_27b_qb2` de tt-metal.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tensix: el modelo está empaquetado para ejecutarse en Wormhole y Blackhole mediante TT-NN, con 17,60 GB de memoria de dispositivo para los pesos del modelo de lenguaje, lo que permite inferencia en hardware Tenstorrent con memoria limitada.
- Investigación en cuantización BFP: sirve como referencia para estudiar el impacto de BFP4 con GPTQ y BFP8 en la cabeza del modelo, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar.
- Prototipado de asistentes conversacionales: el modelo puede gestionar diálogos multi-turno mediante la plantilla de chat de Transformers, aunque la longitud de contexto no está documentada.
- Evaluación de pipelines tt-metal: el demo `qwen38_27b_qb2` permite ejecutar el modelo en paralelo de tensores sobre cuatro chips Blackhole (QuietBox 2) con `QWEN_PRECISION_CONFIG=baseline`.
- Tareas de imagen-texto: al conservar el módulo `visual` en bf16, el checkpoint puede emplearse en escenarios multimodales, si bien no se han publicado evaluaciones de estas capacidades.
- Base para ajuste fino o destilación sobre hardware Tenstorrent: al estar en safetensors y licencia Apache-2.0, puede reutilizarse como punto de partida en flujos de investigación con NPU.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial, truncada en la información disponible. Los datos completos no están accesibles.

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 16 | 53,79 | 0 | 100 | 40 (truncado) | No disponible |
| Arete-27B-Tenstorrent-Tensix-BFP4 | 5,23 | 17,60 | No disponible | No disponible | No disponible | No disponible |

No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 17,60 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- GPU recomendadas: no aplica directamente; el checkpoint está orientado a NPU Tensix de Tenstorrent (Wormhole y Blackhole).
- Compatibilidad con GPU de consumo: no documentada; el formato BFP4/BFP8 es específico de TT-NN y no se indica soporte en GPU convencionales.
- Opciones de despliegue: TT-NN (ttnn 0.81.1), demo `qwen38_27b_qb2` de tt-metal v0.81.1 (requiere cuatro chips Blackhole en QuietBox 2 y rechaza otro hardware), y Transformers con `AutoModelForCausalLM` para carga en bf16 (sin empaquetado BFP).
- tt-forge (tt-xla): no probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tenstorrent-Tensix-BFP4 | 27,36 B | No disponible | BFP4/BFP8 (5,23 bits/peso) | Apache-2.0 | Hugging Face, orientado a NPU Tensix |
| NousResearch/Arete-27B (BF16) | 27,36 B | No disponible | BF16 (16 bits/peso, 53,79 GB) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | No disponible | BF16 | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La evaluación publicada está truncada y solo cubre el modelo de lenguaje; no hay datos de rendimiento completos ni de capacidades multimodales.
- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo `visual` permanece en bf16 y no se ha validado su comportamiento tras la exportación.
- El formato BFP4/BFP8 es específico de TT-NN y Tensix; no es portable a GPU convencionales sin reconversión.
- El demo de tt-metal requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware; además, el `precision.json` incluido re-cuantizaría la cabeza a bfloat4_b, por lo que debe usarse `QWEN_PRECISION_CONFIG=baseline`.
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- La longitud de contexto y los idiomas soportados no están documentados.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados en esta exportación.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones completas desaconseja su uso en producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal qwen38_27b_qb2: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
