# Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4

## Resumen

Gemma 4 E4B IT es un modelo multimodal de Google (familia Gemma 4) en su variante instruction-tuned, y este repositorio de Xylolabs es una cuantización específica para aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base es un transformer multimodal any-to-any (texto, imagen y audio) con aproximadamente 8.670 millones de parámetros totales, según los pesos publicados en safetensors. La cuantización reduce el peso de 15,04 GB en bf16 a 9,444 GB empaquetados, cuantizando a `bfloat4_b` (BFP4, block floating point de 4 bits) las proyecciones de atención y de MLP, mientras que el LM head, los embeddings, las normas y las torres de visión y audio permanecen en bf16.

La relevancia de este artefacto no es el modelo en sí, sino el formato: demuestra que un modelo multimodal de 8,7B puede ejecutarse en hardware NPU de Tenstorrent con pérdida de fidelidad moderada. Frente a una cuantización Q4_K_M de llama.cpp, esta BFP4 obtiene un KL medio a bf16 de 0,09700 frente a 0,19989 (aproximadamente 0,49 veces), con un top-1 del 86,56 % frente al 81,05 %, a costa de ocupar 9,444 GB frente a 5,335 GB.

Es un artefacto de nicho: útil para quien despliegue sobre Tensix con `ttnn`/`tt-metal`, no para inferencia convencional en GPU, donde el modelo base en bf16 o una cuantización GGUF estándar resulta más práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4); atención con 42 capas, de las cuales 24 con proyecciones k/v cuantizadas; torres de visión y audio separadas |
| Parametros totales | 8.667.245.130 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atención (q, o en 42 capas; k, v en 24 capas) y MLP (gate, up, down en 42 capas); bf16 en LM head, embeddings, normas, `vision_tower`, `embed_vision`, `audio_tower` y `embed_audio` |
| Idiomas soportados | no disponible (la evaluación de fidelidad usa inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; 9,444 GB frente a 15,04 GB en bf16) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4, con pipeline `any-to-any`: procesa y genera texto, imagen y audio. La arquitectura incluye 42 capas de atención y bloques MLP con proyecciones gate/up/down, además de torres dedicadas de visión y audio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada; la model card remite al informe técnico de Gemma 4 (arXiv:2607.02770).

La innovación de este repositorio es el proceso de cuantización: GPTQ con búsqueda de exponente por bloque, aplicado a las proyecciones lineales y empaquetado en el formato block floating point de Tensix (`bfloat4_b`). Los tensores cuantizados se pueden reempaquetar exactamente también en `bfloat8_b`, lo que permite subir la precisión sin recuantizar. El repositorio incluye las herramientas `pack_tensix.py` (verifica cada matriz contra `ttnn`) y `verify_grid.py` (verificación solo con torch).

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruction-tuned (chat template).
- Procesamiento de imagen (image-text-to-text) mediante `vision_tower` y `embed_vision`, conservados en bf16.
- Procesamiento de audio mediante `audio_tower` y `embed_audio`, conservados en bf16.
- Salida multimodal any-to-any según el pipeline declarado del modelo base.
- Soporte multilingüe: no disponible en detalle; la evaluación de fidelidad cubre inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento multi-paso explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Permite servir Gemma 4 E4B IT sobre Wormhole o Blackhole con 9,444 GB de pesos en DRAM, usando `ttnn` y los kernels de `tensix-kernels`, reduciendo la huella un 37 % respecto a bf16.
- Validación de pipelines de cuantización: sirve como referencia reproducible para comparar BFP4 frente a Q4_K_M con métricas de KL y top-1 sobre un conjunto fijo de posiciones (WikiText-2 y Wikipedia en coreano).
- Investigación en formatos block floating point: los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar el round-trip de cada matriz contra el dispositivo, útil para estudiar el impacto del exponente por bloque.
- Inferencia multimodal en entornos con memoria limitada: al mantener visión y audio en bf16 y comprimir solo las proyecciones, se preserva la calidad de los codificadores mientras se reduce el coste de las capas densas.
- Evaluación de fidelidad de cuantizaciones: el par KL/top-1 publicado permite usar el modelo como baseline al comparar nuevas recetas de cuantización sobre el mismo checkpoint.
- Prototipado con Transformers: la model card incluye un quickstart con `AutoModelForCausalLM` y `dtype="bfloat16"`, útil para validar comportamiento antes de pasar al runtime de Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E4B-it`) | 15,04 | 0 | 100 |
| Este modelo (BFP4) | 9,444 | 0,09700 | 86,56 |
| Q4_K_M (llama.cpp) | 5,335 | 0,19989 | 81,05 |

La evaluación cubre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con el chat template aplicado. La referencia Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `71766ed49554884dc89513c2787f67c360a1de92fb928078f6464c78b090b2e5`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 9,444 GB de pesos empaquetados para Tensix; el repo completo ocupa 17,4 GB (incluye tensores en bf16 y metadatos).
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole, vía `ttnn`/`tt-metal` y los paquetes `tensix-kernels` y `tensix-runner` v0.1.0.
- GPU consumer: no es el destino del artefacto; para inferencia en GPU conviene el modelo base en bf16 o una cuantización GGUF estándar. No se dispone de estimaciones de VRAM para ese escenario.
- Opciones de despliegue: runtime de Tensix (`ttnn`), y carga con Transformers (`AutoModelForCausalLM`, `device_map="auto"`) para validación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B IT BFP4) | 8,67B | no disponible | safetensors BFP4, 9,444 GB | Apache 2.0 | Hugging Face, 240 descargas |
| `google/gemma-4-E4B-it` (bf16) | 8,67B | no disponible | safetensors bf16, 15,04 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,67B | no disponible | GGUF, 5,335 GB | Apache 2.0 | generado localmente |

La comparación relevante es de fidelidad y tamaño: BFP4 ocupa un 63 % de bf16 con KL de 0,09700, mientras que Q4_K_M ocupa un 35 % con KL de 0,19989. No se dispone de comparación con otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Artefacto específico de hardware: los pesos están empaquetados para Tensix; fuera de ese runtime la utilidad es limitada y conviene usar el modelo base.
- Pérdida de fidelidad medible: top-1 del 86,56 % frente a bf16, con KL de 0,09700; puede degradar tareas sensibles a la precisión numérica.
- Evaluación de fidelidad limitada a 7.968 posiciones en inglés y coreano; no cubre otros idiomas ni tareas de razonamiento, código o matemáticas.
- Idiomas soportados no documentados en la información disponible.
- Riesgo de alucinación y sesgos: heredados del modelo base; no se documentan evaluaciones específicas en esta ficha.
- Licencia Apache 2.0 según la model card del modelo base, pero el repositorio original no incluye fichero LICENSE; aquí se aporta el texto estándar y los cambios se listan en `NOTICE`.
- El modelo base es de 2026 y su informe técnico (arXiv:2607.02770) es la única referencia de entrenamiento; no hay datos de dataset ni de alineación en esta información.
- Las herramientas de empaquetado (`pack_tensix.py`, `verify_grid.py`) se distribuyen sin cambios desde `tensix-bfp-gptq` en el commit `5c52065`.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release v0.1.0 de tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release v0.1.0 de tensix-kernels: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release v0.1.0 de tensix-runner: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Informe técnico de Gemma 4: https://arxiv.org/abs/2607.02770
