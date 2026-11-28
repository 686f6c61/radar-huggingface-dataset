# Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 12B IT en formato BFP4 para Tenstorrent Tensix es una versión cuantizada del modelo multimodal `google/gemma-4-12B-it`, publicada por Xylolabs. El objetivo es ejecutar el modelo sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) con un peso empaquetado de 8,146 GB frente a los 23,81 GB en bf16, manteniendo la fidelidad numérica respecto al checkpoint original. La cuantización se aplica a las proyecciones de atención y MLP en formato `bfloat4_b` (block floating point de 4 bits), mientras que el LM head, los embeddings, las normas y los módulos de audio y visión permanecen en bf16.

El modelo base es un transformer multimodal con 12.966.363.184 parámetros (aproximadamente 13B), pipeline `any-to-any` (entrada y salida de imagen, texto y audio) y licencia Apache 2.0. Esta variante concreta no es un modelo nuevo: es un artefacto de despliegue pensado para el ecosistema `tt-metal`/`ttnn`, con scripts de empaquetado y verificación incluidos en el repositorio.

Su relevancia actual radica en que demuestra que la cuantización BFP4 con GPTQ y búsqueda de exponente por bloque puede superar en fidelidad a Q4_K_M de llama.cpp (KL media de 0,12030 frente a 0,16924) ocupando solo un 10 % más de espacio, lo que la hace atractiva para inferencia en hardware no-GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, `gemma4_unified`), con torres de visión y audio |
| Parámetros totales | 12.966.363.184 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings, normas, `embed_audio`, `embed_vision`, `vision_embedder`; compatible también con empaquetado exacto en `bfloat8_b` |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` e índice `model.safetensors.index.json`), empaquetado para Tensix |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4 con 48 capas, según se deduce de la tabla de formatos (atención q, k, o en 48 capas; v en 40 capas; MLP gate, up, down en 48 capas). Incorpora módulos específicos para modalidades no textuales: `embed_audio`, `embed_vision` y `vision_embedder`, todos en bf16. El LM head está atado al embedding.

Esta variante no se ha reentrenado: se ha cuantizado mediante GPTQ con una búsqueda de exponente por bloque (block floating point), aplicada a las proyecciones de atención y MLP. El resto de tensores se conserva en bf16 tal como en el checkpoint original. Los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar cada matriz empaquetada contra su versión en torch y, opcionalmente, hacer round-trip por la DRAM del dispositivo Tensix. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional (pipeline `any-to-any`).
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a la torre de visión conservada en bf16.
- Procesamiento de audio mediante `embed_audio` en bf16.
- Conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Inferencia en hardware Tenstorrent Tensix (Wormhole, Blackhole) vía `ttnn`/`tt-metal`.
- Compatibilidad con `transformers` para ejecución estándar en GPU/CPU.
- Soporte multilingüe: no confirmado en la información disponible; la evaluación incluye inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado específicamente para Wormhole y Blackhole, con kernels (`tensix-kernels`) y runner (`tensix-runner`) publicados, lo que permite servir inferencia multimodal sin GPU.
- Sustitución de Q4_K_M en entornos con restricciones de memoria: con 8,146 GB empaquetados y mejor KL que Q4_K_M (0,12030 frente a 0,16924), es adecuado cuando se busca máxima fidelidad por byte en hardware Tensix.
- Prototipado multimodal en local: al conservar visión y audio en bf16, permite experimentar con entradas imagen-texto y audio-texto en una sola NPU.
- Evaluación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar la fidelidad de cada matriz, útil para investigación en formatos block floating point.
- Investigación en eficiencia de hardware: sirve como referencia para comparar BFP4 frente a esquemas de cuantización de llama.cpp en términos de KL y top-1.
- Integración en flujos `transformers` existentes: el quickstart con `AutoModelForCausalLM` permite usar el modelo como cualquier checkpoint de Hugging Face en entornos con GPU, aunque sin las ventajas de empaquetado Tensix.
- Docencia y reproducción de resultados: la model card documenta el proceso completo (GPTQ, exponente por bloque, verificación), lo que facilita reproducir la evaluación.

## Benchmarks y rendimiento

Evaluación publicada en la model card (8.048 posiciones de texto inglés y coreano: WikiText-2 test y Wikipedia en coreano, con plantilla de chat):

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-12B-it`) | 23,81 | 0 | 100 |
| **Este modelo (BFP4)** | 8,146 | 0,12030 | 87,96 |
| Q4_K_M (llama.cpp v0.9.0, sin importance matrix) | 7,381 | 0,16924 | 85,52 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: 8,146 GB empaquetados para Tensix; 26,0 GB de tamaño total del repositorio (incluye pesos bf16 y artefactos auxiliares).
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole con `tt-metal`/`ttnn`.
- GPU: no se especifican requisitos de VRAM para ejecución en GPU; el quickstart usa `device_map="auto"` con `dtype="bfloat16"`, lo que implica cargar los tensores en bf16 y, por tanto, un consumo cercano al del modelo base (23,81 GB en bf16), no al empaquetado BFP4.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el formato BFP4 está pensado para Tensix, no para GPUs convencionales.
- Opciones de despliegue: `transformers` (GPU/CPU), `ttnn` + `tt-metal` (Tensix), `tensix-runner` v0.1.0, `tensix-kernels` v0.1.0, `tensix-bfp-gptq` v0.1.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | KL a BF16 | Licencia | Hardware objetivo |
|---|---|---:|---:|---:|---|---|
| Este modelo (BFP4) | 12,97B | no disponible | 8,146 GB | 0,12030 | Apache 2.0 | Tenstorrent Tensix |
| `google/gemma-4-12B-it` (BF16) | 12,97B | no disponible | 23,81 GB | 0 | Apache 2.0 | GPU/CPU |
| Q4_K_M de llama.cpp | 12,97B | no disponible | 7,381 GB | 0,16924 | Apache 2.0 | CPU/GPU (llama.cpp) |

La comparación se limita al mismo checkpoint base en distintos formatos; no se dispone de datos frente a otros modelos de tamaño similar.

## Limitaciones y advertencias

- La cuantización BFP4 introduce degradación medible: top-1 del 87,96 % frente al 100 % del BF16 y KL media de 0,12030.
- El formato está diseñado para Tensix; en GPU el modelo se carga en bf16 y pierde la ventaja de tamaño, por lo que el quickstart con `transformers` no aprovecha el empaquetado BFP4.
- La evaluación de fidelidad cubre solo inglés y coreano (8.048 posiciones); no hay datos para otros idiomas ni para tareas multimodales.
- No hay información sobre sesgos, alucinación ni comportamiento en producción del modelo base en la documentación proporcionada.
- La licencia es Apache 2.0, pero la model card advierte que el repositorio del modelo base no incluye archivo LICENSE y que el texto estándar se ha añadido manualmente; conviene verificar los términos del modelo base antes de uso comercial.
- Los scripts `pack_tensix.py` y `verify_grid.py` se distribuyen sin cambios desde el repositorio `tensix-bfp-gptq` en el commit `5c52065`.
- El pipeline declarado es `any-to-any`, pero no se documentan ejemplos de uso multimodal ni límites de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release `tensix-bfp-gptq` v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release `tensix-kernels` v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release `tensix-runner` v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper del modelo base (Gemma 4 Technical Report): https://arxiv.org/abs/2607.02770
