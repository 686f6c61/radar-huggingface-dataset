# tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs. Consiste en un Qwen2.5-0.5B al que se le ha sustituido el mecanismo de atención original por una implementación denominada `fused_svd_kernel`, extraída de un registro interno de atención (`ATTENTION_REGISTRY`) del proyecto NeuralOps. El resultado es un checkpoint de 533.299.840 parámetros (aproximadamente 0,53 mil millones) en formato safetensors.

El modelo no es un lanzamiento de producción ni un modelo base entrenado desde cero: es el producto de una intervención quirúrgica sobre la arquitectura de atención de un modelo existente, seguida de un proceso de destilación de conocimiento (KD) sobre el dataset WikiText-2 (`wikitext-2-raw-v1`) con un patrón de sustitución denominado `hybrid_3_1`. Según la model card, la perplejidad causal pasó de 821.427,41 antes de la destilación a 364,46 después, una mejora de 821.062,95 puntos, con un tiempo de destilación de 180,2 segundos en una NVIDIA RTX 3090.

Su relevancia es acotada y de carácter exploratorio: sirve como evidencia de que es posible trasplantar variantes de atención alternativas en modelos transformer pequeños y recuperar un comportamiento lingüístico razonable mediante destilación breve, aunque la perplejidad final (364,46) sigue siendo muy elevada para uso práctico. No hay información sobre pipeline, licencia, idiomas ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 con atención sustituida por `fused_svd_kernel` (patrón `hybrid_3_1`) |
| Parametros totales | 533.299.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar. Sobre esa base se aplica una "cirugía" que reemplaza determinadas capas de atención por la variante `fused_svd_kernel`, registrada en el `ATTENTION_REGISTRY` del proyecto NeuralOps. El patrón `hybrid_3_1` sugiere una mezcla de capas: probablemente tres capas con atención original por cada una con la atención SVD fusionada, aunque la model card no detalla la asignación exacta ni la formulación matemática del kernel.

El entrenamiento posterior es una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de texto de Wikipedia en inglés de aproximadamente 2 millones de tokens. La destilación se ejecutó en 180,2 segundos sobre una RTX 3090, lo que indica un proceso muy ligero (pocas épocas o un subconjunto del dataset). No se documentan hiperparámetros, número de tokens vistos, uso de RLHF/DPO ni detalles del objetivo de destilación (KL divergence, MSE sobre logits, etc.).

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2.
- Modelado de lenguaje causal: la métrica reportada es perplejidad causal sobre WikiText-2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (la destilación se hizo solo sobre WikiText-2 en inglés).
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el checkpoint permite reproducir y analizar el efecto del trasplante `fused_svd_kernel` frente a la atención Qwen2 original en un modelo pequeño.
- Estudio de destilación de conocimiento post-cirugía: sirve para medir cuánto se recupera de perplejidad con un presupuesto de cómputo mínimo (180 s en una RTX 3090).
- Benchmark de kernels de atención en GPUs de consumo: al ser un modelo de 0,53 mil millones de parámetros, cabe en tarjetas de gama media y permite comparar latencia y memoria del kernel SVD frente a atención estándar.
- Docencia y prototipado de arquitecturas híbridas: útil para ilustrar patrones como `hybrid_3_1` en cursos de arquitecturas transformer.
- Base para experimentos de compresión o cuantización: al estar en safetensors y ser pequeño, es un candidato para probar pipelines de cuantización sin coste elevado.
- Reproducibilidad de experimentos de NeuralOps: permite validar los números reportados (PPL pre/post KD) en hardware equivalente.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 821.427,41 |
| Perplejidad causal post-KD (WikiText-2) | 364,46 |
| Delta de perplejidad | -821.062,95 |
| Tiempo de destilación | 180,2 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La perplejidad post-KD de 364,46 es muy superior a la de un Qwen2.5-0.5B intacto, lo que indica que el modelo no es apto para uso generativo general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (533 M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en int8: alrededor de 0,6 GB para pesos; en int4, alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 3090, A100 o H100 son válidas.
- Cabe en GPUs de consumo: sí, en RTX 3050/3060/4060 y superiores.
- Opciones de despliegue: transformers con `trust_remote_code` si el kernel SVD requiere código personalizado; llama.cpp/Ollama/vLLM solo si se generan pesos GGUF o se adapta el kernel, ya que la atención `fused_svd_kernel` no es estándar.
- Latencia y throughput: no disponibles; la model card solo reporta el tiempo de destilación, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2 | 533.299.840 | No disponible | No disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base) | ~494 M | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | Producción |
| SmolLM2-360M | ~360 M | 8.192 tokens (según documentación de HuggingFace) | Apache 2.0 | Producción |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache 2.0 | Producción |

La comparación directa es desfavorable para el modelo experimental: pierde la licencia clara, el contexto documentado y la calidad del base original. Su interés es exclusivamente de investigación.

## Limitaciones y advertencias

- Perplejidad post-KD de 364,46, muy alta; la calidad de generación es previsiblemente pobre.
- Licencia no especificada: riesgo legal para uso comercial.
- Idiomas no documentados; la destilación se hizo solo sobre WikiText-2 en inglés.
- Longitud de contexto no documentada; no se garantiza compatibilidad con el contexto original de Qwen2.5.
- La atención `fused_svd_kernel` no es estándar: puede requerir código personalizado (`trust_remote_code`) y no es compatible con vLLM, llama.cpp u Ollama sin adaptación.
- Riesgo elevado de alucinación y degeneración de texto por la baja calidad del checkpoint.
- Sesgos heredados del corpus WikiText-2 y del modelo base Qwen2.5-0.5B, no evaluados.
- Creado y actualizado en noviembre de 2026, sin descargas ni likes: sin validación comunitaria.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-fused-svd-kernel-wikitext2
- Modelo base referenciado: Qwen2.5-0.5B (no se proporciona URL directa en la información disponible)
- Dataset: WikiText-2 (`wikitext-2-raw-v1`) en Hugging Face Datasets (no se proporciona URL directa)
- Proyecto NeuralOps / `ATTENTION_REGISTRY`: no disponible
- Paper o blog del método `fused_svd_kernel`: no disponible
