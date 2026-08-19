# TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.2bpw

## Resumen

Qwen3.5-397B-A17B-VQ-2.2bpw es una cuantización vectorial (VQ) del modelo Qwen3.5-397B-A17B, un mixture-of-experts multimodal de 397 mil millones de parámetros con 17 mil millones activos, desarrollado por Qwen y publicado bajo licencia Apache 2.0. Esta versión, creada por TheDrainFlorist, reduce el peso del modelo a 100.1 GiB mediante una técnica de product quantization con codebooks de 7 bits, lo que permite ejecutarlo en una única máquina Apple Silicon con 128 GB de memoria unificada sin necesidad de clústeres ni parches.

El objetivo principal de esta build es responder a la pregunta de hasta qué punto se puede comprimir un modelo de 397B sin perder utilidad práctica. Según las mediciones del autor, la perplexity en wikitext es de 3.1706 (mejor que la cuantización comunitaria de 2.6 bits) y en código de 2.6988 (ligeramente peor), con un ahorro de 20.5 GiB frente a esa alternativa. El modelo se distribuye en formato MLX (safetensors) e incluye una torre de visión de 333 tensores a precisión original, aunque `mlx-lm` solo la ignora.

Es una opción relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento de gran tamaño localmente en hardware Apple Silicon, con velocidades de decodificación de aproximadamente 20-21 tokens por segundo y una ventana de contexto de al menos 8192 tokens verificada en las pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (gated delta networks) |
| Parametros totales | 397B (modelo base) / 30.718.876.656 (parámetros almacenados en safetensors, cuantizados) |
| Parametros activos | 17B |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo; esta cuantización no especifica el máximo) |
| Tipos de cuantizacion | VQ 2.2 bpw (product quantization con codebooks de 7 bits, escalas fp16 por fila de 64 pesos) |
| Idiomas soportados | en (según la model card; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) con `model.py` incluido |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B emplea una arquitectura MoE con gated delta networks, una innovación que combina mecanismos de atención con capas recurrentes delta para mejorar la eficiencia en razonamiento y codificación. El modelo fue entrenado con fusión temprana de visión y lenguaje sobre billones de tokens multimodales, logrando rendimiento superior a Qwen3-VL en tareas de razonamiento, código, agentes y comprensión visual.

Esta cuantización no implica entrenamiento adicional. Los pesos de los expertos se someten a product quantization: cada subvector de 4 pesos se reemplaza por un índice de 7 bits en un codebook de 128 entradas fp16, con una escala fp16 por cada 64 pesos. Los códigos de 7 bits se empaquetan en palabras uint32 (bloques de 32 códigos), lo que resulta en 2.00 bits por peso almacenado. Los codebooks se ajustan mediante k-means en el espacio de pesos, sin usar Hessian ni datos de activación. La estructura no experta (atención, routers, cola de capas promovida) conserva una cuantización de mayor precisión. El proceso de ajuste tarda unos 26 minutos en un M3 Ultra y el empaquetado unos 15 minutos.

## Capacidades

- Generación de texto y razonamiento multi-step (modelo de pensamiento, consume tokens en razonamiento antes de responder).
- Capacidades de codificación: genera y depura código en múltiples lenguajes, aunque la cuantización 2.2 bpw degrada ligeramente el rendimiento en código frente a versiones menos agresivas.
- Soporte de tool calling y agentes: el modelo base está diseñado para integración con herramientas y ejecución de tareas agénticas.
- Capacidades multimodales: incluye torre de visión completa (333 tensores, 0.85 GiB) a precisión original, pero `mlx-lm` es solo texto; se puede cargar con `exo` o `mlx-vlm` (PR pendiente).
- Multilingüe: el modelo base soporta múltiples idiomas, aunque la model card de esta cuantización solo declara inglés.
- Conversación y diálogo: adecuado para asistentes conversacionales con contexto largo (verificado hasta 8k tokens en las pruebas).

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en su Mac Studio con 128 GB para generar código, explicar fragmentos o refactorizar sin depender de servicios en la nube. La velocidad de decodificación de ~20 tok/s es suficiente para interacción interactiva, y el soporte de tool calling permite integrarlo con editores o CLIs.
- Análisis de documentos extensos: con una ventana de contexto de al menos 8192 tokens (probablemente mayor en el modelo base), puede resumir informes, contratos o artículos largos en una sola pasada, manteniendo la coherencia gracias al razonamiento multi-step.
- Prototipado de agentes autónomos: investigadores pueden desplegar el modelo localmente para experimentar con pipelines agénticos (planificación, uso de herramientas, ejecución de acciones) sin coste de API. La arquitectura MoE con 17B activos reduce la latencia frente a un modelo denso de tamaño equivalente.
- Educación y tutoría técnica: el modelo puede actuar como tutor de programación o matemáticas, explicando conceptos paso a paso y resolviendo problemas, aprovechando su capacidad de razonamiento.
- Generación de documentación técnica: a partir de especificaciones o código fuente, el modelo puede redactar documentación, comentarios y guías de uso, con la ventaja de ejecutarse en local para entornos con requisitos de privacidad.
- Inferencia en entornos sin GPU dedicada: al estar optimizado para Apple Silicon, permite ejecutar un modelo de 397B en hardware de consumo (Mac con 128 GB) que de otro modo requeriría múltiples GPUs o servicios en la nube, habilitando despliegues edge o de desarrollo.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplexity (menor es mejor) comparando esta build con otras cuantizaciones. No se publican resultados de MMLU, HumanEval u otros benchmarks estándar.

| Métrica | Este modelo (VQ-2.2bpw) | spicyneuron 2.6bit | VQ-2.4bpw (del autor) |
|---|---|---|---|
| Wikitext perplexity (prefix-8192) | **3.1706** | 3.1843 | 2.7655 |
| Code perplexity (multilenguaje) | 2.6988 | **2.6667** | 2.6383 |
| Tamaño | 100.1 GiB | 120.6 GiB | ~110.8 GiB (estimado) |

El autor indica que frente a spicyneuron 2.6bit, esta build es un 0.43% mejor en prosa y un 1.20% peor en código, con 20.5 GiB menos. Frente a su propia VQ-2.4bpw, sacrifica calidad en ambos corpus a cambio de ~10.7 GiB de margen de memoria.

## Requisitos de hardware

- Memoria: 100.1 GiB residentes (pico 103.0 GiB a 8k contexto). Requiere una máquina Apple Silicon con al menos 128 GB de memoria unificada para dejar margen al sistema operativo.
- GPU: Apple Silicon (M4 Max, M3 Ultra o superior). No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) ni en la mayoría de GPUs de datacenter sin memoria suficiente.
- Opciones de despliegue: `mlx-lm` (stock, sin parches) para una sola máquina; `exo` para servir distribuido entre dos Macs (requiere una línea en la regla de sharding para replicar codebooks). `mlx-vlm` está pendiente de un PR para cargar la torre de visión.
- Rendimiento medido (M4 Max 128 GB, macOS): carga ~116 s (en volumen de red; SSD local es más rápido), decode ~20-21 tok/s plano de 512 a 8k contexto, prefill ~42-48 tok/s (fragmentado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B (base) | 397B total, 17B activo | no disponible (largo) | Apache 2.0 | ~250 GB (fp16) | Modelo original sin cuantizar, requiere múltiples GPUs |
| Qwen3.5-397B-A17B-FP8 (oficial) | 397B total, 17B activo | no disponible | Apache 2.0 | ~200 GB | Cuantización FP8 recomendada para vLLM |
| TheDrainFlorist VQ-2.4bpw | 397B total, 17B activo | no disponible | Apache 2.0 | ~110.8 GiB | Mejor calidad que 2.2bpw, requiere ~128 GB |
| TheDrainFlorist VQ-2.2bpw (este) | 397B total, 17B activo | no disponible | Apache 2.0 | 100.1 GiB | Máxima compresión, cabe con margen en 128 GB |

## Limitaciones y advertencias

- Cuantización agresiva (2.2 bits por peso): degrada el rendimiento en tareas de código frente a cuantizaciones menos extremas (+2.3% de perplexity en código vs VQ-2.4bpw). Para workloads intensivos en código se recomienda la versión de 2.4 bpw.
- Modelo de razonamiento: consume tokens en "pensamiento" antes de responder. Hay que presupuestar `max_tokens` generosamente para evitar respuestas truncadas.
- Solo Apple Silicon: el formato MLX y los kernels Metal JIT no funcionan en GPUs NVIDIA o AMD. No hay soporte para vLLM, llama.cpp u Ollama.
- La torre de visión está incluida pero `mlx-lm` la ignora; para usarla hay que esperar soporte en `mlx-vlm` (PR #1926 en revisión) o usar `exo`.
- El empaquetado de bits es una representación pura: la perplexity es idéntica a la versión desempaquetada, pero requiere el `model.py` incluido para descomprimir en tiempo de ejecución.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización concreta; las mediciones se limitan a perplexity.
- La model card solo declara inglés como idioma soportado, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está verificado en esta build.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.5-397B-A17B-VQ-2.2bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Recetas vLLM para Qwen3.5-397B-A17B: https://recipes.vllm.ai/Qwen/Qwen3.5-397B-A17B
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- PR de mlx-vlm para soporte de model_file: https://github.com/Blaizzy/mlx-vlm/pull/1926
- Proyecto exo: https://github.com/exo-explore/exo
