# TheDrainFlorist/Qwen3.6-35B-A3B-VQ-3.4bpw

## Resumen

Qwen3.6-35B-A3B-VQ-3.4bpw es una cuantización vector-quantized del modelo Qwen3.6-35B-A3B, desarrollada por TheDrainFlorist para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base, creado por Alibaba Qwen, es un MoE de 35 mil millones de parámetros con 3 mil millones activos, orientado a estabilidad y utilidad real, con especial énfasis en coding agéntico y razonamiento a nivel de repositorio. Esta versión cuantizada reduce el tamaño a 13,8 GiB, lo que permite ejecutarlo en máquinas con 16 GB de RAM, manteniendo una perplexity solo un 2,9 % superior a la versión bf16, mejor que el 4,1 % del cuantizado 4-bit de 19 GiB.

La relevancia de este modelo radica en su equilibrio entre tamaño y calidad: ofrece un rendimiento cercano al de cuantizaciones más grandes pero con un 73 % de su peso, lo que lo convierte en una opción atractiva para desarrolladores que necesitan ejecutar un modelo de razonamiento potente en hardware Apple con memoria limitada. La cuantización utiliza vector quantization uniforme de los expertos (d=4, K=2048, 3,0 bits/peso) y 8-bit para los tensores no expertos, logrando una compresión significativa sin sacrificar demasiada fidelidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con vector quantization; base: Qwen3.6-35B-A3B |
| Parametros totales | 35B (modelo base); safetensors cuantizado reporta 4.227.929.456 parámetros |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ 3,0 bits/peso (expertos, d=4, K=2048) + 8-bit (no expertos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del Qwen3.6-35B-A3B, un transformer MoE con 35B parámetros totales y 3B activos por token. La técnica empleada es vector quantization uniforme de los expertos, que representan aproximadamente el 92 % de los pesos del modelo, con una dimensión de codebook d=4 y K=2048 entradas, lo que equivale a 3,0 bits por peso empaquetado. Los tensores no expertos se mantienen en 8-bit. No se realizó ningún entrenamiento adicional; la cuantización es puramente una transformación de representación, verificada comparando cada tensor decodificado contra la fuente bf16 y confirmando que el error de reconstrucción no supera 3 veces la mediana del error del propio artefacto.

El modelo base Qwen3.6-35B-A3B fue desarrollado por Alibaba Qwen, con un enfoque en estabilidad y utilidad real, incluyendo mejoras en coding agéntico, razonamiento a nivel de repositorio y preservación del pensamiento (thinking mode). No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, que incluyen razonamiento multi-step y modo de pensamiento.
- Generación de código: el modelo base está optimizado para coding agéntico, incluyendo flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Tool calling / function calling: no especificado en la model card, pero el modelo base Qwen3.6 soporta esta funcionalidad según la documentación oficial.
- Capacidades multilingües: la model card indica únicamente inglés (en), aunque el modelo base podría soportar más idiomas; no se confirma en esta versión cuantizada.
- Capacidades especiales: no se mencionan capacidades de visión o audio; el modelo es puramente textual.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar el modelo en un Mac con 16 GB de RAM para obtener sugerencias de código, explicaciones de algoritmos o refactorización, aprovechando la velocidad de decodificación (~66 tok/s en M3 Ultra) y el bajo consumo de memoria.
- Chat conversacional en entornos sin conexión: al ser un modelo ligero y con licencia Apache-2.0, puede integrarse en aplicaciones de escritorio o móviles que requieran respuestas de texto sin depender de APIs externas.
- Generación de documentación técnica: el modelo puede redactar comentarios, docstrings y documentación de repositorios, gracias a su capacidad de razonamiento a nivel de repositorio.
- Automatización de tareas de análisis de código: con soporte de tool calling (heredado del modelo base), puede integrarse en pipelines de CI/CD para revisar pull requests, detectar errores comunes o sugerir mejoras.
- Prototipado rápido de agentes conversacionales: su tamaño compacto permite iterar rápidamente en el desarrollo de agentes que requieran razonamiento multi-step, sin necesidad de infraestructura GPU dedicada.
- Educación y aprendizaje: estudiantes y profesionales pueden usarlo para explicar conceptos complejos de programación, matemáticas o lógica, con respuestas razonadas y en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización específica. La model card proporciona mediciones de perplexity relativa y acuerdo top-1 frente a la versión bf16, comparadas con otros builds:

| Build | Tamaño | Perplexity vs bf16 | Acuerdo top-1 |
|---|---|---|---|
| bf16 | 65,4 GiB | 1,000x | 100 % |
| mlx-community 8-bit | 35 GiB | 0,999x | 96,18 % |
| Build parity (18,7 GiB) | 18,7 GiB | 0,991x | 90,75 % |
| **Este modelo** | **13,8 GiB** | **1,029x** | **87,33 %** |
| mlx-community 4-bit | 19 GiB | 1,041x | 85,61 % |

Estos datos indican que el modelo supera al cuantizado 4-bit en perplexity y acuerdo, con un tamaño un 27 % menor. La perplexity se midió sobre un corpus específico, por lo que los resultados pueden variar con otros conjuntos de datos.

## Requisitos de hardware

- VRAM estimada: pico de 13,1 GiB en M3 Ultra; funciona en máquinas con 16 GB de RAM a contexto corto, y es cómodo en 24 GB o más.
- GPU recomendadas: Apple Silicon (M3 Ultra, M4 Max, etc.) por ser un modelo MLX; no está diseñado para GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (librería oficial de MLX), también compatible con exo para clústeres multi-máquina (con precaución en la replicación de codebooks).
- Latencia y throughput: ~66 tok/s de decodificación medido en M3 Ultra con `mlx-lm` y generación greedy de 120 tokens.

## Comparativa con modelos similares

| Modelo | Tamaño | Parámetros | Contexto | Perplexity vs bf16 | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (bf16) | 65,4 GiB | 35B MoE | no disponible | 1,000x | Apache-2.0 |
| mlx-community 4-bit | 19 GiB | 35B MoE | no disponible | 1,041x | Apache-2.0 |
| **Este modelo (VQ 3.4bpw)** | **13,8 GiB** | **35B MoE** | **no disponible** | **1,029x** | **Apache-2.0** |
| Build parity (18,7 GiB) | 18,7 GiB | 35B MoE | no disponible | 0,991x | Apache-2.0 |

La comparativa se limita a otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Perplexity un 2,9 % superior a la versión bf16 y un 3,8 % superior al build parity de 18,7 GiB; es una opción orientada al tamaño, no a la máxima calidad.
- La perplexity se midió sobre un único corpus; otros workloads pueden clasificar los builds de forma diferente.
- No se realizó una evaluación humana ciega de preferencia sobre este modelo.
- Solo soporta inglés según la model card; el uso en otros idiomas puede degradar la calidad.
- En despliegues multi-máquina con exo, los codebooks VQ deben replicarse, no dividirse; se requiere el PR #2268 o la rama `noahzelezny/exo:vq-codebook-replicate` para tensor parallelism correcto.
- No se garantiza el soporte de tool calling o function calling en esta versión cuantizada, aunque el modelo base lo incluye.
- El número de parámetros reportado en el safetensors (4,2B) difiere del total del modelo base (35B); esto puede deberse al formato de almacenamiento cuantizado, pero no se ha documentado explícitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.6-35B-A3B-VQ-3.4bpw
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- PR de exo para replicación de codebooks: https://github.com/exo-explore/exo/pull/2268
- Rama de exo con soporte VQ: https://github.com/noahzelezny/exo/tree/vq-codebook-replicate
- Página de Qwen3.6 en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Página de Qwen3.6 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
