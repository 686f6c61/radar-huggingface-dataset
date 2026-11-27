# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP

## Resumen

Este modelo es una adaptación del checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized` de Google, cuantizado específicamente para su ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Lo desarrolla Xylolabs y resuelve un problema muy concreto: los NPU de Tensix no soportan de forma nativa los formatos de cuantización habituales de llama.cpp o GGUF, sino formatos de bloque en coma flotante (`bfloat4_b` y `bfloat8_b`) definidos por la librería `ttnn` de Tenstorrent. Este repositorio empaqueta los pesos en esos formatos manteniendo el resto del modelo en bf16.

El modelo base es un Gemma 4 de la familia E2B, multimodal (pipeline `any-to-any`, con torres de visión y audio), en su variante instruct y con cuantización QAT Q4_0 de origen. El repositorio declara 5.506.950.723 parámetros reales en safetensors y ocupa 11,0 GB en disco, aunque el paquete empaquetado para Tensix son 6,758 GB frente a los 9,26 GB en bf16. La licencia es Apache 2.0.

Es relevante ahora porque permite ejecutar un modelo Gemma 4 multimodal sobre hardware de Tenstorrent sin pasar por GPU, con una pérdida de fidelidad medida y documentada respecto al bf16 original (KL media de 0,0601 frente a 0,0444 del Q4_0 de llama.cpp). Para equipos que ya trabajan con `tt-metal` o `tt-forge`, evita tener que reimplementar el pipeline de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B), con torres de visión y audio; pesos empaquetados en formatos de bloque Tensix (`bfloat4_b`, `bfloat8_b`) |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones MLP; BFP8 (`bfloat8_b`) en proyecciones de atención; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower` |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 E2B instruct con cuantización QAT Q4_0 publicada por Google y posteriormente "descuantizada" al checkpoint `unquantized`. Sobre ese checkpoint, Xylolabs aplica un proceso propio de cuantización: las proyecciones MLP (gate, up y down en 35 capas) se convierten a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque; las proyecciones de atención q, o (35 capas) y k, v (15 capas) se convierten a `bfloat8_b` por redondeo al más cercano. El LM head (atado al embedding), las normas y todos los tensores de las torres de visión y audio permanecen en bf16.

La innovación técnica no está en el entrenamiento sino en el formato de destino: los tensores se empaquetan en la disposición de bloque que espera `ttnn` para Tensix, de modo que se cargan directamente en DRAM del dispositivo sin conversión en tiempo de ejecución. El repositorio incluye las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` del proyecto `tensix-bfp-gptq` (commit 5c52065), que verifican que cada matriz empaquetada se reconstruye exactamente igual al hacer el viaje de ida y vuelta por `ttnn`. No se documentan datos de entrenamiento adicionales ni fases de RLHF o DPO propias de este repositorio.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat (`apply_chat_template`) compatible con `transformers`.
- Procesamiento imagen-texto: el pipeline declarado es `any-to-any` y conserva las torres `vision_tower` y `embed_vision` en bf16.
- Procesamiento de audio: conserva `audio_tower` y `embed_audio` en bf16.
- Razonamiento y matemáticas: heredado del modelo base Gemma 4 E2B instruct; no se aportan evaluaciones específicas en este repositorio.
- Generación de código: heredada del modelo base; sin benchmarks propios publicados.
- Capacidades multilingües: la evaluación de fidelidad incluye texto en inglés y coreano, pero no se declara una lista de idiomas soportados.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante `ttnn`, con kernels y runner publicados en `tensix-kernels` y `tensix-runner` v0.1.0.
- Compatibilidad con `transformers` en CPU/GPU mediante `AutoModelForCausalLM.from_pretrained` con `dtype="bfloat16"`.
- Tool calling y comportamiento agéntico: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: cargar el modelo directamente en NPU Wormhole o Blackhole usando `ttnn.as_tensor` con `bfloat4_b`/`bfloat8_b`, evitando la conversión en tiempo de ejecución y aprovechando el empaquetado de 6,758 GB frente a 9,26 GB en bf16.
- Servicio de chat multimodal en entornos con NPU: al conservar las torres de visión y audio en bf16, puede atender consultas que combinen texto, imagen y audio sin degradar esas modalidades por la cuantización.
- Validación de pipelines de cuantización: usar `pack_tensix.py` y `verify_grid.py` para comprobar que una matriz empaquetada se reconstruye bit a bit tras el viaje por DRAM del dispositivo, como paso previo a producción.
- Investigación en formatos de bloque: comparar la fidelidad de BFP4/BFP8 frente a Q4_0 de llama.cpp usando la métrica de KL y top-1 publicada (7.968 posiciones de WikiText-2 y Wikipedia en coreano).
- Prototipado en `transformers`: ejecutar el modelo en GPU convencional con `device_map="auto"` y bf16 para validar prompts y plantillas de chat antes de portar el flujo a Tensix.
- Evaluación de degradación por cuantización: emplear el checkpoint como referencia intermedia entre el bf16 original (KL 0) y el Q4_0 de llama.cpp (KL 0,0444) para estudiar el impacto de BFP4 en las proyecciones MLP.
- Reproducción de experimentos: el repositorio fija versiones concretas de código (`tensix-bfp-gptq` 5c52065, `tensix-kernels` v0.1.0, `tensix-runner` v0.1.0) y el sha256 del Q4_0 de referencia, lo que facilita la replicabilidad.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de cuantización, no benchmarks de tarea:

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it-qat-q4_0-unquantized`) | 9,26 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,758 | 0,06007 | 88,34 |
| Q4_0 (llama.cpp) | 3,350 | 0,04435 | 89,47 |

Las métricas cubren 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. El Q4_0 de referencia se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix y su sha256 es `7976063c67c363ed292081c862051cd7b1f7caf529d972e42aa2e2fe098fd63e`.

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: el repo ocupa 11,0 GB en disco y el paquete Tensix 6,758 GB; en bf16 el modelo base son 9,26 GB, por lo que en GPU se necesita al menos ese orden de magnitud más overhead de activaciones y caché KV (no cuantificada aquí).
- GPU recomendadas: no disponibles en la información proporcionada. El quickstart usa `device_map="auto"` con `dtype="bfloat16"`, lo que implica GPU con soporte bf16.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño en bf16 (9,26 GB) sugiere que requiere GPUs con al menos 12-16 GB de VRAM, pero no se documenta oficialmente.
- Despliegue en NPU: Tensix de Tenstorrent (Wormhole, Blackhole) mediante `ttnn`, con `tensix-kernels` y `tensix-runner` v0.1.0.
- Despliegue en GPU/CPU: `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | KL a BF16 | Top-1 | Licencia | Hardware objetivo |
|---|---|---:|---:|---:|---:|---|---|
| Este modelo (Xylolabs BFP4 MLP) | 5.506.950.723 | no disponible | 6,758 GB | 0,06007 | 88,34 % | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` (bf16) | no disponible | no disponible | 9,26 GB | 0 | 100 % | Apache 2.0 (según este repo) | GPU/CPU |
| Q4_0 de llama.cpp (mismo checkpoint) | no disponible | no disponible | 3,350 GB | 0,04435 | 89,47 % | Apache 2.0 | CPU/GPU vía llama.cpp |

La comparativa se limita a variantes del mismo checkpoint porque la información disponible no incluye otros modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La fidelidad es inferior al Q4_0 de llama.cpp: KL media 0,0601 frente a 0,0444 (1,35 veces peor) y top-1 88,34 % frente a 89,47 %, pese a ocupar casi el doble (6,758 GB frente a 3,350 GB).
- El formato está atado al hardware Tensix: los tensores BFP4/BFP8 no son directamente utilizables en GPUs convencionales sin pasar por las herramientas de empaquetado o por el checkpoint base.
- Las torres de visión y audio permanecen en bf16, por lo que el ahorro de memoria se concentra en las proyecciones del transformer de lenguaje.
- No se documenta la longitud de contexto soportada ni la lista de idiomas; la evaluación solo cubre inglés y coreano.
- No hay benchmarks de tarea (razonamiento, código, matemáticas) que permitan estimar la degradación funcional más allá de la KL.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan del modelo base Gemma 4 E2B.
- La licencia declarada es Apache 2.0, pero conviene verificar las condiciones del checkpoint base de Google antes de uso comercial, ya que el repo no detalla términos adicionales.
- El repositorio tiene muy poca tracción (197 descargas, 1 like) y una única release (2026-11-11), lo que reduce la base de validación externa.
- El quickstart usa `AutoModelForCausalLM`, aunque el pipeline declarado es `any-to-any`; para multimodal conviene revisar la clase adecuada en `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del código: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release `tensix-bfp-gptq` v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release `tensix-kernels` v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release `tensix-runner` v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2607.02770): no disponible como enlace verificado en la información proporcionada.
