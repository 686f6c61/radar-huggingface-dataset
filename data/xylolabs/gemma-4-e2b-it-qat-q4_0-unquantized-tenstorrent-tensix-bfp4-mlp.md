# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una cuantización del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized` (la versión instruct de la familia Gemma 4, checkpoint QAT sin cuantizar) adaptada específicamente para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y no es un modelo nuevo: es un artefacto de despliegue que reempaqueta los pesos en los formatos de bloque flotante nativos de Tensix (`bfloat4_b` y `bfloat8_b`) para que `tt-metal`/`ttnn` pueda cargarlos directamente en memoria DRAM del dispositivo sin conversiones en tiempo de ejecución.

La relevancia es de nicho pero concreta: los NPU de Tenstorrent no soportan los formatos habituales de cuantización de 4 bits (GGUF Q4_0, GPTQ int4, AWQ) y trabajan con block floating point por tiles. Este repositorio resuelve esa fricción con un pipeline GPTQ adaptado a BFP4 para las proyecciones MLP y redondeo a BFP8 para las proyecciones de atención, manteniendo en bf16 la cabeza LM, los embeddings, las normas y las torres de visión y audio. El resultado ocupa 6,758 GB empaquetado frente a 9,26 GB en bf16, con una divergencia KL media de 0,0601 respecto al modelo en bf16.

El modelo subyacente conserva la pila `any-to-any` de Gemma 4 (texto, imagen y audio), con 5.506.950.723 parámetros totales según los safetensors del repo. La licencia declarada es Apache 2.0, aunque conviene verificar la licencia del checkpoint base de Google antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), pesos cuantizados a block floating point para Tensix |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible (la información disponible no indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atención q/k/v/o; bf16 en LM head, embeddings, normas, `vision_tower`, `audio_tower`, `embed_vision`, `embed_audio` |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado Tensix; índice `model.safetensors.index.json`, mapa `quant4.json`), compatible con carga vía `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4 en variante instruct, con torres separadas de visión y audio que permiten el pipeline `any-to-any`. La model card referencia 35 capas con proyecciones MLP (gate, up, down) y un subconjunto de 15 capas con proyecciones k, v en atención, dato que describe el esquema de cuantización más que la topología completa del modelo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el checkpoint base se presenta como QAT (quantization-aware training) en formato Q4_0, lo que implica que Google entrenó el modelo con conciencia de la cuantización de 4 bits.

La innovación técnica de este repositorio es el pipeline de cuantización `tensix-bfp-gptq`: las proyecciones MLP se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención usan redondeo al más cercano a `bfloat8_b`. El empaquetado se valida con `pack_tensix.py` (round-trip exacto matriz a matriz, opcionalmente a través de DRAM del dispositivo) y `verify_grid.py` (verificación de la rejilla solo con torch). Los mismos valores empaquetan de forma exacta en `ttnn.bfloat8_b`, lo que permite un modo de mayor precisión cambiando el formato por capa.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Entrada imagen-texto (`image-text-to-text`) y pipeline `any-to-any` con torres de visión y audio en bf16.
- Razonamiento y respuesta instruct heredados del checkpoint `gemma-4-E2B-it`.
- Ejecución nativa en NPU Tenstorrent Wormhole y Blackhole mediante `ttnn`, con tensores en `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG`.
- Carga estándar vía `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) para inspección, evaluación o inferencia en GPU/CPU.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la evaluación KL y top-1 se limita a inglés y coreano.

## Casos de uso

- Despliegue en NPU Tenstorrent: cargar los pesos directamente en Wormhole o Blackhole con `ttnn.as_tensor` en `bfloat4_b`/`bfloat8_b`, evitando la conversión de formato en el arranque y aprovechando los 6,758 GB empaquetados frente a 9,26 GB en bf16.
- Servicio de chat multimodal en hardware no NVIDIA: usar la pila `any-to-any` para consultas texto-imagen con la torre de visión intacta en bf16, manteniendo el coste de memoria del decoder reducido.
- Evaluación de calidad de cuantización: emplear `verify_grid.py` y la métrica KL a bf16 sobre WikiText-2 y Wikipedia coreana como referencia para comparar futuras variantes BFP4/BFP8 del mismo checkpoint.
- Investigación en formatos block floating point: servir de base reproducible para estudiar el impacto de GPTQ con búsqueda de exponente por bloque frente al redondeo a BFP8 en capas de atención.
- Fine-tuning o destilación sobre el checkpoint: al cargarse con `transformers` en bf16, puede usarse como punto de partida para adaptaciones que luego se recuanticen con el mismo pipeline.
- Integración en pipelines `tt-forge`: el repositorio declara compatibilidad con `tt-forge` y `tt-metal`, lo que permite compilar y ejecutar el modelo dentro del stack de Tenstorrent sin capas de traducción propias.
- Reproducción de referencia Q4_0: el artefacto documenta el sha256 del Q4_0 generado con llama.cpp v0.9.0, útil para auditar diferencias entre cuantización estándar y BFP.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it-qat-q4_0-unquantized`) | 9,26 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,758 | 0,06007 | 88,34 |
| Q4_0 (llama.cpp v0.9.0, sin importance matrix) | 3,350 | 0,04435 | 89,47 |

La evaluación cubre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tarea.

## Requisitos de hardware

- VRAM/RAM para inferencia en GPU: aproximadamente 9,3 GB en bf16 para el checkpoint completo; el empaquetado Tensix ocupa 6,758 GB, pero su uso óptimo requiere el dispositivo NPU.
- GPU recomendadas para carga vía `transformers`: una RTX 4090 (24 GB) o A100/H100 son suficientes para bf16; en consumer GPU de 12-16 GB puede requerir cuantización adicional o `device_map` con offload.
- NPU objetivo: Tenstorrent Wormhole y Blackhole, con `ttnn` y `tt-metal`; el repositorio incluye kernels y runner en `tensix-kernels v0.1.0` y `tensix-runner v0.1.0`.
- Cabe en consumer GPU: sí, en bf16 en tarjetas de 12 GB o más con offload parcial; en 8 GB no sin cuantización adicional.
- Opciones de despliegue: `transformers` (referencia), `ttnn`/`tt-metal` (nativo Tensix), `tt-forge`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, BFP4/BFP8 Tensix) | 5.506.950.723 | no disponible | BFP4 MLP + BFP8 atención | apache-2.0 | Hugging Face, requiere stack Tenstorrent para uso nativo |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` (base) | no disponible | no disponible | bf16 (checkpoint QAT Q4_0) | no disponible en la información | Hugging Face |
| Q4_0 generado con llama.cpp v0.9.0 | mismo checkpoint | no disponible | GGUF Q4_0 | derivada del base | generado localmente, sha256 documentado |

No se dispone de datos de benchmarks de tarea ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia KL media de 0,0601 respecto a bf16 (1,35 veces la de Q4_0) y una caída de top-1 de 100 % a 88,34 %; para tareas sensibles a la precisión conviene evaluar el modo BFP8 completo.
- El artefacto está diseñado para Tensix; fuera de `ttnn`/`tt-metal` se pierde la ventaja de tamaño y formato, y la carga estándar en `transformers` reconstruye tensores en bf16.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del checkpoint base de Google.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de un modelo instruct de este tamaño.
- Idiomas: la evaluación solo cubre inglés y coreano; el soporte real multilingüe no está documentado.
- Licencia: el repositorio declara Apache 2.0, pero es responsabilidad del usuario verificar los términos del checkpoint base `google/gemma-4-E2B-it-qat-q4_0-unquantized` antes de uso comercial.
- La model card aparece truncada en el apartado de licencia; conviene consultar el fichero `LICENSE` del repositorio.
- El pipeline de cuantización depende de versiones concretas (`tensix-bfp-gptq` en el commit `5c52065`, `tensix-kernels v0.1.0`, `tensix-runner v0.1.0`); cambios de versión pueden romper la reproducibilidad del empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit del pipeline: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release `tensix-bfp-gptq v0.1.0`: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release `tensix-kernels v0.1.0`: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release `tensix-runner v0.1.0`: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
