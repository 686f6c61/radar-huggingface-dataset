# TheDrainFlorist/Qwen3.6-35B-A3B-VQ-4.6bpw

## Resumen

TheDrainFlorist/Qwen3.6-35B-A3B-VQ-4.6bpw es una cuantización vector-quantized (VQ) del modelo Qwen3.6-35B-A3B, un Mixture-of-Experts (MoE) de 35 mil millones de parámetros totales y 3 mil millones activos, desarrollado por Alibaba. Esta versión, creada por el usuario TheDrainFlorist, está optimizada para Apple Silicon mediante la librería MLX y consigue un tamaño de 18,7 GiB (incluyendo el vision tower en bf16) con una perplexity de 0,991x respecto al modelo bf16 original, superando en calidad a la cuantización 4-bit estándar (1,041x) y siendo incluso más pequeña que esta (18,7 GiB frente a 19 GiB). El resultado es un modelo que cabe en equipos con 32 GB de RAM unificada y que mantiene un rendimiento prácticamente indistinguible del modelo original en términos de perplexity, aunque con una mayor divergencia KL respecto al teacher.

La relevancia de este lanzamiento radica en que demuestra que la vector quantization aplicada a un MoE de 256 expertos puede superar en eficiencia a las cuantizaciones afines tradicionales (8-bit y 4-bit) a igualdad de tamaño, abriendo la puerta a ejecutar modelos de 35B en hardware de consumo de gama alta. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto, con soporte para el pipeline estándar de MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 256 expertos, transformer decoder |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | Vector quantization (VQ) con geometria d2·K512 + d4·K2048; tensores no-expertos en 8-bit |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer decoder con arquitectura MoE de 256 expertos, donde solo 3B de los 35B parámetros se activan por token. La cuantización VQ aplicada por TheDrainFlorist no es un fine-tuning, sino una compresión post-entrenamiento que sustituye los pesos de los expertos por codebooks de vector quantization. El esquema de profundidad es asimétrico: las capas 0-9 (las más cercanas a la entrada) usan una geometría d4·K2048 (dimensión 4, codebook de 2048 entradas), mientras que las capas 10-39 (la cola) usan d2·K512. Los tensores no-expertos (attention, norm, etc.) se mantienen en 8-bit. Esta distribución se eligió tras un barrido sistemático de geometrías y programaciones de capas, donde se comprobó que una cola más rica (d2·K2048) producía un artefacto mayor y peor (20,7 GiB, 1,000x), mientras que una más pobre (d2·K256) degradaba la perplexity (1,002x). El punto óptimo se encontró por bisección en K=512.

El entrenamiento del modelo base (Qwen3.6-35B-A3B) fue realizado por Alibaba, aunque la model card de esta cuantización no proporciona detalles sobre el dataset, el número de tokens o el uso de RLHF/DPO. La cuantización en sí no requiere entrenamiento adicional, solo la construcción de los codebooks y la verificación de reconstrucción.

## Capacidades

- Generación de texto y conversación: el modelo base es un LLM de propósito general, y esta cuantización conserva sus capacidades de generación autoregresiva.
- Razonamiento y matemáticas: el modelo base Qwen3.6-35B-A3B destaca en tareas de razonamiento y código (73,4% en SWE-bench según fuentes externas), capacidades que se mantienen en esta versión cuantizada, aunque con una ligera degradación en la precisión de tokens individuales (top-1 agreement del 90,75% frente al 96,18% del 8-bit).
- Soporte de tool calling y function calling: heredado del modelo base, aunque no se detalla en la model card de esta cuantización.
- Capacidades multilingües: la model card solo lista "en" (inglés), aunque el modelo base de Qwen soporta múltiples idiomas. No se especifica si la cuantización afecta a otros idiomas.
- Ejecución en Apple Silicon: gracias a MLX, el modelo está optimizado para GPUs unificadas de Apple, con un rendimiento de ~55 tok/s en decodificación en un M4 Max.
- Incluye vision tower en bf16 (0,83 GiB), lo que sugiere capacidades multimodales potenciales, aunque no se documentan en la ficha.

## Casos de uso

- Asistente de código en local: un desarrollador puede ejecutar este modelo en un Mac Studio con 32 GB de RAM para autocompletar código, generar funciones y explicar fragmentos, aprovechando el rendimiento de 55 tok/s y la calidad cercana al bf16. Es adecuado porque el tamaño reducido permite mantener el modelo residente en memoria sin swap.
- Chatbot conversacional de bajo coste: al ser un MoE con solo 3B activos, el consumo energético y la latencia son menores que un modelo denso equivalente, lo que lo hace viable para prototipos y despliegues en entornos con recursos limitados.
- Análisis de documentos técnicos: con una ventana de contexto larga (heredada del modelo base, aunque no cuantificada en la ficha), puede resumir y extraer información de informes extensos, siempre que el hardware permita mantener el contexto en memoria.
- Agente autónomo con tool calling: el modelo base soporta function calling, por lo que esta versión puede integrarse en pipelines de agentes que necesiten ejecutar acciones (búsquedas, APIs) desde un Mac, sin depender de servicios en la nube.
- Investigación en compresión de modelos: esta cuantización sirve como caso de estudio para evaluar el impacto de la vector quantization en MoEs de gran escala, comparando perplexity, KL y agreement frente a cuantizaciones afines.
- Desarrollo de aplicaciones de escritorio con IA integrada: al caber en 32 GB y usar MLX, es viable embeber el modelo en aplicaciones macOS que requieran generación de texto offline, como editores de texto con asistencia o herramientas de productividad.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.), pero sí mediciones de perplexity, KL y top-1 agreement sobre un corpus de referencia de 2048 tokens, comparadas contra el teacher bf16. Estos datos se presentan a continuación:

| Build | Tamano (GiB) | Perplexity | vs bf16 | KL (mnats) | Top-1 agreement |
|---|---|---|---|---|---|
| bf16 (teacher) | 65,4 | 4,7215 | 1,000x | 0 | 100% |
| mlx-community 8-bit | 35 | 4,7150 | 0,999x | 7,449 | 96,18% |
| **Este modelo (VQ 4.6bpw)** | **18,7** | **4,6812** | **0,991x** | **44,573** | **90,75%** |
| mlx-community 4-bit | 19 | 4,9154 | 1,041x | 78,557 | 85,61% |

Nota: la perplexity es corpus-específica y solo es comparable entre modelos evaluados con el mismo harness y corpus. La columna KL mide la divergencia respecto a la distribución del teacher; un valor más alto indica mayor distancia, aunque la perplexity agregada pueda ser similar. El autor advierte que una perplexity ligeramente inferior al bf16 (0,991x) no debe interpretarse como "mejor que el teacher", sino como un artefacto de la cuantización sobre un corpus finito.

## Requisitos de hardware

- Memoria pico medida: 18,0 GiB durante la generación, lo que permite ejecutar el modelo en equipos con 32 GB de RAM unificada con margen para contexto.
- GPU recomendadas: Apple Silicon (M3 Ultra, M4 Max, etc.) con al menos 32 GB de memoria unificada. No es compatible con GPUs NVIDIA/AMD de forma nativa, ya que usa MLX.
- En un M4 Max (128 GB) se midió una velocidad de decodificación de ~55 tok/s con generación greedy de 120 tokens.
- La cuantización 8-bit del mismo modelo requiere 48 GB+ de RAM, por lo que esta versión VQ reduce el requisito de hardware en un 33%.
- Opciones de despliegue: exclusivamente mediante `mlx-lm` (pip install mlx-lm) y el comando `python -m mlx_lm generate`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX.
- Latencia: no se proporcionan datos de tiempo hasta el primer token (TTFT) ni de throughput en producción, solo la velocidad de decodificación mencionada.

## Comparativa con modelos similares

La comparativa más directa es con las otras cuantizaciones del mismo modelo base, ya que no se dispone de datos de benchmarks de tareas para comparar con otros MoE como Llama 3.3 70B o Mixtral 8x22B.

| Modelo | Tamano (GiB) | Perplexity (vs bf16) | KL (mnats) | Top-1 agreement | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B bf16 | 65,4 | 1,000x | 0 | 100% | Apache 2.0 |
| mlx-community 8-bit | 35 | 0,999x | 7,449 | 96,18% | Apache 2.0 |
| **Este modelo (VQ)** | **18,7** | **0,991x** | **44,573** | **90,75%** | Apache 2.0 |
| mlx-community 4-bit | 19 | 1,041x | 78,557 | 85,61% | Apache 2.0 |

En términos de tamaño y calidad, este modelo VQ supera al 4-bit estándar en perplexity y es ligeramente más pequeño, aunque con una KL mayor que el 8-bit. No se dispone de comparativas con otros modelos de la misma categoría (MoE de ~35B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización VQ introduce una mayor divergencia KL respecto al teacher (44,573 mnats) que la cuantización 8-bit (7,449), lo que indica que la distribución de salida se aleja más del modelo original, aunque la perplexidad agregada sea similar.
- El top-1 agreement es del 90,75%, frente al 96,18% del 8-bit. Esto significa que en aproximadamente 1 de cada 10 tokens, el modelo cuantizado elige una palabra diferente a la que elegiría el bf16, lo que puede afectar a tareas que requieren precisión exacta (como generación de código con sintaxis estricta).
- La model card solo declara soporte para inglés ("en"), aunque el modelo base es multilingüe. No se ha verificado el comportamiento en otros idiomas con esta cuantización.
- Es una cuantización experimental creada por un tercero, no un lanzamiento oficial de Alibaba. No hay garantías de soporte ni de mantenimiento a largo plazo.
- El modelo incluye un vision tower en bf16 que añade 0,83 GiB al tamaño total, pero no se documenta su funcionalidad ni si las capacidades multimodales del modelo base se conservan íntegramente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3.6-35B-A3B, que también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Para producción, es recomendable validar el comportamiento del modelo en el dominio específico de la aplicación, dado que las métricas reportadas son solo de perplexity y no de tareas downstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.6-35B-A3B-VQ-4.6bpw
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página de Qwen3.6 en LM Studio: https://lmstudio.ai/models/qwen3.6
- Cuantización NVFP4 de NVIDIA para el mismo modelo base: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Artículo sobre Qwen 3.6-35B-A3B (aimadetools.com): https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
