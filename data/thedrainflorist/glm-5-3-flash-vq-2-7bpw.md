# TheDrainFlorist/GLM-5.3-Flash-VQ-2.7bpw

## Resumen

TheDrainFlorist/GLM-5.3-Flash-VQ-2.7bpw es una cuantización mediante vector quantization (VQ) del modelo GLM-5.3-Flash de ZAI, desarrollada por TheDrainFlorist. El objetivo es reducir el checkpoint original de 598.5 GiB en bf16 a 101.9 GiB para poder ejecutarlo en un único Mac con 128 GB de RAM unificada, utilizando el runtime de Apple Silicon `mlx-vlm` sin parches. El modelo base es un mixture of experts (MoE) híbrido multimodal de 320B parámetros totales y 18B activos, con Manifold-Constrained Hyper-Connections (mHC) y soporte de entrada de imagen y texto.

La cuantización VQ almacena pequeños grupos de pesos como índices en codebooks ajustados a los propios pesos, en lugar de redondear cada peso a una rejilla uniforme como hace la cuantización affine. Según el autor, este método supera a la cuantización affine con el mismo número de bytes por debajo de 6 bits. Esta build concreta mezcla tamaños de codebook: los expertos MoE usan códigos de 9 bits en d=4/K=512, y ocho capas de expertos se promueven a d=4/K=2048 (códigos de 11 bits) por su efecto medido en la calidad. El resultado es una build que cabe en un Mac de 128 GB y que, según las mediciones del autor, es la mejor opción en ese presupuesto de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida multimodal (image-text-to-text) con Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 320B (modelo base, según Fireworks AI) / 36.55B (checkpoint cuantizado, según metadatos de safetensors) |
| Parametros activos | 18B (modelo base, según Fireworks AI) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ (vector quantization) con códigos de 9/11 bits para expertos MoE, 8-bit affine para atención/embeddings/head, bf16 para norms/routers/vision tower; sidecar MTP opcional a q6 |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (con model.py para runtime VQ, compatible con mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, con 320B parámetros totales y 18B activos. Incorpora una arquitectura híbrida que reduce los costes de servido de contexto largo y utiliza Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado. El checkpoint cuantizado conserva la arquitectura original, pero sustituye los pesos de los expertos MoE por representaciones VQ.

La cuantización es data-free: no se utilizan datos de calibración. En lugar de redondear cada peso a una rejilla uniforme, VQ almacena grupos de pesos como índices en codebooks ajustados a los propios pesos. El método está descrito en el paper "Data-Free Vector Quantization Beats Affine Quantization at Matched Bytes Below 6 Bits". Esta build va más allá del recipe publicado: mezcla tamaños de codebook, promoviendo ocho capas de expertos individuales (capas 20, 27, 29, 31, 33, 34, 35 y 39) a d=4/K=2048 con códigos de 11 bits, elegidas por su efecto medido en calidad. La atención, los embeddings y la cabeza de salida se mantienen en 8-bit affine; las norms, los routers y el tower de visión completo (347 tensores) permanecen en bf16. No se dispone de información sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en los datos proporcionados.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto (pipeline image-text-to-text).
- Generación de texto conversacional en inglés y chino.
- Herencia de las capacidades del modelo base GLM-5.3-Flash: razonamiento, generación de código y matemáticas, aunque no se aportan datos específicos en la información disponible.
- Soporte de tool calling / function calling: no se menciona en la información.
- Soporte de agentes y multi-step reasoning: no se menciona en la información.
- Capacidades multilingües: inglés y chino.
- Capacidad especial: el runtime VQ viaja dentro del checkpoint como `model.py`, declarado mediante `model_file` en `config.json`, y se resuelve bajo `mlx-lm` y `mlx_vlm` sin parches. Incluye un sidecar de speculative decoding (MTP) opcional con una tasa de aceptación de 0.827.

## Casos de uso

- Inferencia multimodal local en Apple Silicon: el modelo puede procesar imágenes y texto en una Mac Studio M4 de 128 GB, reduciendo el tamaño de 598.5 GiB a 101.9 GiB. Es adecuado para prototipado y desarrollo sin depender de APIs en la nube.
- Investigación en cuantización: el modelo sirve como referencia para comparar VQ versus cuantización affine. Los resultados medidos (KL, perplejidad) permiten evaluar el trade-off entre tamaño y calidad en un mismo modelo base.
- Despliegue en clústeres con exo: el `config.json` incluye `vision_config` e `image_token_id`, y el vision tower se mantiene en bf16, lo que lo hace compatible con la rama `vq-serving` de exo para servido en clúster.
- Generación de código: el modelo alcanza un code ppl de 1.6671, mejor que la build affine q3 (1.7842). Puede utilizarse como asistente de programación en entornos locales con soporte multimodal.
- Procesamiento de documentos con imágenes: al ser multimodal, puede analizar diagramas, capturas de pantalla, formularios y gráficos en documentos, en inglés o chino.
- Aplicaciones conversacionales bilingües: soporta inglés y chino, adecuado para chatbots o asistentes en entornos multilingües.
- Evaluación de speculative decoding: el sidecar MTP opcional permite probar técnicas de decodificación especulativa en servido por lotes o multi-nodo, con verificación exacta de los tokens generados.

## Benchmarks y rendimiento

Medidas realizadas por el autor con su propio instrumento (mlx 0.32.2 / mlx-vlm 0.6.17), sobre 2048 tokens. La columna KL mide la distancia a la distribución del teacher bf16 utilizando una caché de logits top-64 de prosa. La perplejidad no es comparable entre familias de modelos y está dominada por contaminación en los corpus públicos usados.

| build | size | KL to bf16 (mnats/tok) | top-1 agreement | prose ppl | code ppl | literary ppl |
|---|---|---|---|---|---|---|
| VQ d4/K512 (base) | 98.5 GiB | 348.82 | 84.0% | 2.5743 | 1.7107 | 1.6166 |
| **this model** | **101.9 GiB** | **293.84** | **85.7%** | **2.4014** | **1.6671** | **1.4811** |
| VQ d4/K2048 (uniform) | 116.3 GiB | 199.53 | 88.6% | 2.1954 | 1.6187 | 1.3402 |
| affine q3 (ours) | 129 GiB | 377.08 | 83.1% | 2.6824 | 1.7842 | 1.4731 |
| VQ d4/K8192 (uniform) | 134.0 GiB | 94.54 | 92.1% | 2.0379 | 1.5475 | 1.2154 |
| affine q4 (ours) | 166 GiB | 98.34 | 91.9% | 2.0263 | 1.5718 | 1.2025 |
| affine q6 (ours) | 239 GiB | 13.47 | 97.1% | 1.9285 | 1.4929 | 1.1660 |
| bf16 teacher | 598.5 GiB | 0 | 100% | 1.9024 | 1.4888 | 1.1580 |

Rendimiento en runtime, medido en un Mac Studio M4 128 GB en caliente:

| Métrica | Valor |
|---|---|
| decode, stock generate | 19.7 tok/s |
| decode, MTP sidecar (`vqlab mtp-generate`) | 19.99 tok/s, acceptance 0.827 |
| prefill | ~88 tok/s (lower bound, derivado de wall time) |

## Requisitos de hardware

- Memoria estimada para inferencia: 101.9 GiB para el checkpoint principal. En la práctica, ~101 GiB residentes en un Mac Studio M4 128 GB. El sidecar MTP añade ~6.3 GiB residentes cuando se activa.
- GPU recomendadas: Apple Silicon (Mac Studio M4 128 GB). No se mencionan GPUs NVIDIA en la información.
- No cabe en GPU de consumo: 101.9 GiB excede la memoria de cualquier GPU de consumo (por ejemplo, una RTX 4090 tiene 24 GB).
- Opciones de despliegue: `mlx-vlm` (Apple Silicon) y exo (cluster serving mediante la rama `vq-serving`). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: decode a 19.7 tok/s con `generate` estándar, 19.99 tok/s con el sidecar MTP, y prefill a ~88 tok/s (cota inferior).

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada. Se comparan las distintas builds del mismo autor sobre el mismo modelo base, ordenadas por tamaño y calidad medida (KL):

| build | tamaño | KL to bf16 | prosa ppl | code ppl | literary ppl |
|---|---|---|---|---|---|
| **this model** | **101.9 GiB** | **293.84** | **2.4014** | **1.6671** | **1.4811** |
| VQ d4/K512 (base) | 98.5 GiB | 348.82 | 2.5743 | 1.7107 | 1.6166 |
| affine q3 (ours) | 129 GiB | 377.08 | 2.6824 | 1.7842 | 1.4731 |
| VQ d4/K8192 (uniform) | 134.0 GiB | 94.54 | 2.0379 | 1.5475 | 1.2154 |
| affine q4 (ours) | 166 GiB | 98.34 | 2.0263 | 1.5718 | 1.2025 |
| bf16 teacher | 598.5 GiB | 0 | 1.9024 | 1.4888 | 1.1580 |

Según el autor, esta build es la mejor opción medida dentro del presupuesto de 128 GB, siendo 27 GiB más pequeña que affine q3 y un 22% mejor en KL, aunque no alcanza la calidad de las builds de mayor tamaño.

## Limitaciones y advertencias

- El autor advierte que las puntuaciones de perplejidad no son comparables entre familias de modelos y están dominadas por contaminación: el teacher bf16 tiene memorizado casi verbatim los corpus públicos utilizados (probabilidad top-1 media de 0.857 en prosa). La KL al teacher sigue siendo válida, pero la perplejidad absoluta debe interpretarse con cautela.
- La métrica KL reportada es solo de prosa, ya que la caché del teacher es una caché de prosa. No es una medida completa de la calidad del modelo.
- El checkpoint es enorme (101.9 GiB) y requiere una Mac con 128 GB de RAM unificada. Los ciclos fríos paginan mal y se recomienda descartar el primer ciclo antes de hacer benchmarks.
- El sidecar MTP no aporta speedup en una sola caja; solo es útil en servido en pipeline multi-nodo o en batch serving.
- No se mencionan sesgos conocidos en la información proporcionada.
- La licencia del checkpoint es MIT, pero el modelo base GLM-5.3-Flash de ZAI puede tener su propia licencia; no se confirma en la información disponible.
- El modelo solo soporta inglés y chino.
- La longitud de contexto no está disponible en la información.

## Enlaces

- https://huggingface.co/TheDrainFlorist/GLM-5.3-Flash-VQ-2.7bpw
- https://huggingface.co/zai-org/GLM-5.3-Flash
- https://fireworks.ai/models/fireworks/glm-5p3-flash
- https://doi.org/10.5281/zenodo.22136000
- https://github.com/noahzelezny/VQLab
- https://github.com/noahzelezny/exo/tree/vq-serving
