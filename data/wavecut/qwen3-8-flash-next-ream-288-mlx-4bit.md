# WaveCut/Qwen3.8-Flash-Next-REAM-288-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-REAM-288-MLX-4bit es una adaptación cuantizada del modelo multimodal Qwen3.8-Flash-Next, desarrollada por WaveCut como alternativa directa al REAP-288 de sh0wie. Mientras que REAP poda los expertos no esenciales de cada capa, REAM (Merging Improves Pruning of Experts in LLMs, Samsung SAIL Montréal) los fusiona en los expertos mantenidos más similares, preservando mejor la información del modelo original. Esta versión concreta está cuantizada a 4-bit en formato MLX, pensada para ejecutarse en hardware Apple Silicon mediante la librería mlx-vlm.

El modelo base, Qwen3.8-Flash-Next, es una vista previa de la arquitectura Qwen4: un MoE multimodal con atención híbrida GDN + QSA, 125B parámetros principales más 51B de embeddings n-gram, y 6B parámetros activos por token. La versión REAM-288 reduce el número de expertos por capa de 512 a 288 mediante fusión, y el cuantizado MLX-4bit ocupa 21.202.711.891 parámetros en safetensors. Su relevancia radica en ofrecer un modelo multimodal de alto rendimiento con un footprint reducido, ejecutable en equipos de consumo de Apple, manteniendo compatibilidad con el ecosistema mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (GDN + QSA) con expert merging (REAM), multimodal imagen-texto |
| Parametros totales | 21.202.711.891 (cuantizado 4-bit) |
| Parametros activos | no disponible (el modelo base original tiene 6B activos por token) |
| Longitud de contexto | no disponible (el Qwen3.8-Flash original soporta 1M de tokens, no confirmado para esta adaptacion) |
| Tipos de cuantizacion | 4-bit MLX: backbone 4-bit, expertos 4-bit gs64 affine, tabla n-gram 4-bit gs32 |
| Idiomas soportados | no disponible (evaluado en ingles, ruso y codigo) |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, una arquitectura MoE multimodal que combina atención Gated DeltaNet (GDN) con QSA (Query-Sparse Attention), diseñada para equilibrar eficiencia computacional y capacidad. El modelo original tiene 512 expertos por capa, 125B parámetros principales y 51B adicionales de embeddings n-gram, con 6B activos por token. Sobre esta base, el método REAM realiza una adaptación offline: en lugar de descartar los 224 expertos no mantenidos por capa (como hace REAP), los fusiona en los expertos mantenidos más similares, usando coeficientes proporcionales a la saliencia (los expertos absorbidos reciben un peso 1/R con R=10). La similitud se calcula mediante el coseno de las filas del router, y se aplica alineamiento húngaro de canales intermedios antes de promediar en fp32 con salida bf16. El conjunto de expertos mantenidos y su orden es exactamente el manifest REAP-288 publicado por sh0wie, calibrado sobre ~686K tokens de tráfico de codificación agéntica. Los tensores de expertos se cuantizan a 4-bit con group size 64, mientras que el backbone y la tabla n-gram usan 4-bit con gs32. No se incluyen tensores MTP; para decodificación especulativa se recomienda el drafter independiente de sh0wie.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, con capacidad conversacional.
- Generación de código: evaluado en HumanEval, mantiene un rendimiento cercano al modelo stock en tareas de programación.
- Razonamiento multi-step: soporta tareas de codificación agéntica, como refactorización y validación de entrada en funciones.
- Capacidades multilingües: aunque no hay lista oficial, la evaluación incluye corpus en ruso e inglés, con resultados aceptables en nombres de entidades raras en cirílico.
- Compatibilidad con mlx-vlm: se integra con la librería MLX de Apple para inferencia en hardware Apple Silicon.
- Decodificación especulativa: compatible con el MTP drafter independiente de sh0wie para acelerar la generación.

## Casos de uso

- Asistente de programación en local: el modelo puede refactorizar funciones, añadir validación de entrada o generar código a partir de descripciones, ejecutándose en un Mac con suficiente memoria unificada gracias a la cuantización 4-bit MLX.
- Análisis de capturas de pantalla y diagramas: al ser multimodal, puede interpretar imágenes de interfaces, esquemas o documentación visual y generar explicaciones o código asociado.
- Automatización de tareas agénticas: su entrenamiento con tráfico de codificación agéntica lo hace adecuado para pipelines que requieren razonamiento multi-paso, como generación de tests o revisión de código.
- Procesamiento de documentos mixtos: puede combinar texto e imágenes en un mismo prompt, útil para extraer información de informes con figuras o tablas escaneadas.
- Desarrollo de chatbots especializados: su naturaleza conversacional y su capacidad de seguir instrucciones permiten construir asistentes técnicos con conocimiento de código y contexto visual.
- Evaluación de modelos y experimentación: al ser una alternativa drop-in a REAP-288, sirve para comparar metodologías de pruning vs merging en entornos de investigación.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación A/B contra REAP-288 y el modelo stock (512 expertos), usando el mismo harness y hardware. Los resultados son de una sola ejecución, con diferencias de ±1-2 puntos consideradas ruido.

| Modelo | KL vs stock (media) | Sonda de nombres raros (10 nombres) | Subconjunto HumanEval (25 tareas) |
|---|---|---|---|
| Stock 512e | 0 | 0.97 | 90.0% (50 completas) |
| REAP-288 recon (prune) | 1.3066 | 0.91 | 92.0% (stock en su slice: 92.0%) |
| REAM-288 flat_sim (este) | 1.2752 | 0.92 | 88.0% (stock en su slice: 88.0%) |

La métrica KL se calcula con top-256 forzado contra el modelo stock sobre un corpus mixto fijo (en/ru/code/rare-entities/agentic, ~10K posiciones). La sonda de nombres raros mide la reproducción intacta de entidades poco comunes en 10 generaciones con semilla. En el subconjunto de HumanEval, los dos modelos de 288 expertos cayeron en slices diferentes (solapamiento de 2 tareas), por lo que cada uno se compara con el stock en su propio slice. En la porción rusa de la sonda (3 nombres cirílicos, 30 generaciones), el stock obtuvo 27, el prune 21 y el merge 22.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado tiene 21.2B parámetros en 4-bit, lo que supone aproximadamente 10.6 GB de pesos. Con overhead de activaciones y KV cache, se recomienda un mínimo de 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 16 GB de RAM unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No está diseñado para CUDA.
- Compatibilidad con hardware de consumo: sí, en Macs con suficiente memoria unificada. No es viable en GPUs NVIDIA sin convertir los pesos a otro formato.
- Opciones de despliegue: mlx-vlm (librería oficial MLX), con soporte para generación vía línea de comandos o API. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependerá del chip concreto y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-REAM-288-MLX-4bit (este) | 21.2B (4-bit) | no disponible | 88.0% (slice de 25) | qwen-community-license-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-REAP-288-MLX-4bit (sh0wie) | similar (prune) | no disponible | 92.0% (slice de 25) | qwen-community-license-1.0 | HuggingFace |
| Qwen3.8-Flash-Next stock (512e) | 125B + 51B n-gram | 1M (según QwenCloud) | 90.0% (50 tareas) | qwen-community-license-1.0 | QwenCloud / HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos para comparar con otros MoE multimodales de tamaño similar.

## Limitaciones y advertencias

- La evaluación es de una sola ejecución y con subconjuntos pequeños; las diferencias de ±1-2 puntos en HumanEval no son estadísticamente significativas.
- El modelo REAM-288 muestra un rendimiento ligeramente inferior al REAP-288 en el subconjunto de HumanEval (88% vs 92%), aunque en slices diferentes; la ventaja principal es una menor divergencia KL frente al stock (1.2752 vs 1.3066).
- No se han publicado resultados en benchmarks estándar completos (MMLU, GSM8K, etc.) para esta adaptación concreta.
- La licencia qwen-community-license-1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- El modelo está pensado para Apple Silicon; no hay soporte oficial para GPUs NVIDIA o AMD.
- No se especifica la longitud de contexto efectiva tras el merging y la cuantización; es posible que se degrade respecto al modelo original.
- Los idiomas soportados no están documentados; la evaluación sugiere competencia en inglés y ruso, pero no hay garantías para otros idiomas.
- El proceso de merging usa coeficientes basados en una suposición de saliencia (1/R con R=10) porque las magnitudes de saliencia crudas no eran públicas; los pesos exactos podrían diferir si se usara la saliencia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-REAM-288-MLX-4bit
- Modelo base (sin cuantizar): https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-REAM-288
- Modelo REAP-288 de sh0wie (referencia A/B): https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- MTP drafter para decodificación especulativa: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16
- Paper REAM (arXiv 2604.04356): https://arxiv.org/abs/2604.04356
- Repo oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación SGLang para Qwen3.8-Flash-Next: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
