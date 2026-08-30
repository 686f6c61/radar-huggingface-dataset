# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw

## Resumen

TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw es una cuantización vectorial (vector quantization, VQ) del modelo multimodal Qwen3.8-Flash-Next de Qwen, desarrollada por el usuario TheDrainFlorist. El objetivo es ejecutar un modelo frontera de gran tamaño en equipos Apple Silicon con 128 GB de memoria unificada, reduciendo el peso del checkpoint de 335 GiB (bf16) a 94.1 GiB mediante una técnica de cuantización sin datos basada en k-means. El modelo conserva la arquitectura MoE ultra dispersa del original, con expertos activados por token, e incorpora una torre de visión en bf16 para capacidades multimodales.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores desplegar un modelo de nivel frontera en hardware de consumo (Mac con Apple Silicon) sin necesidad de GPUs dedicadas, manteniendo una fidelidad alta respecto al profesor bf16 (KL de 50.3 mnats/tok y acuerdo top-1 del 92.8%). El checkpoint incluye el runtime VQ embebido como `model.py`, por lo que funciona con `mlx-lm` sin parches adicionales. El modelo tiene 86.18 mil millones de parámetros totales según los tensores safetensors, aunque el modelo base original declara 180B totales con 10 de 512 expertos activos (según el autor) o 125B con 6B activos (según otras fuentes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra dispersa con vector quantization (VQ) sobre Qwen4 (base: Qwen3.8-Flash-Next) |
| Parametros totales | 86.182.789.523 (86.18B) |
| Parametros activos | no disponible (el modelo base activa 10 de 512 expertos, pero no se especifica para esta cuantización) |
| Longitud de contexto | no disponible (el modelo base soporta 262K, pero no se confirma en esta versión) |
| Tipos de cuantizacion | VQ 4.4 bpw (bits por peso); expertos de capas seleccionadas empaquetados a 10 bits |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (con runtime mlx embebido como `model.py`) |

## Arquitectura y entrenamiento

El modelo es una cuantización vectorial del checkpoint bf16 de Qwen3.8-Flash-Next, que emplea una arquitectura MoE ultra dispersa con 512 expertos y activación de 10 por token (según el autor). La cuantización se realizó sin datos (data-free) mediante el algoritmo k-means/Lloyd sobre los pesos, con semilla 1234, utilizando la herramienta VQLab. Los expertos se cuantizan con dimensión d=2 y K=256 centroides, mientras que la tabla de embeddings n-gram (PLE) usa d=8 y K=4096. Seis capas de mayor apalancamiento (las que más contribuyen a la pérdida de calidad) se actualizaron a d=2/K=1024 con empaquetado de 10 bits. El análisis de apalancamiento por capas muestra que la capa 1 domina el daño por cuantización, seguida de una banda tardía (capas 31-39), y este patrón es consistente en todas las geometrías probadas.

El entrenamiento de la cuantización fue completamente no supervisado y no requirió datos de calibración. El proceso incluye una sonda de una pasada para medir el daño local por capa sin efectos compuestos, y los resultados son reproducibles con VQLab (`vqlab layer-leverage`). El checkpoint final incluye una torre de visión bf16 de 333 tensores (0.84 GiB) injertada, y pasa los controles de integridad (archivo, índice, tokenizer) y una prueba de generación en Apple Silicon.

## Capacidades

- Generación de texto conversacional y de larga forma en inglés, con razonamiento de múltiples pasos gracias a la arquitectura MoE del modelo base.
- Procesamiento multimodal: incluye torre de visión en bf16, lo que permite entrada de imágenes y comprensión visual (el modelo base Qwen3.8-Flash-Next es multimodal).
- Inferencia eficiente en Apple Silicon mediante `mlx-lm`, sin necesidad de GPU dedicada, gracias a la cuantización VQ y el runtime embebido.
- Compatible con `exo` (configuración `vision_config` e `image_token_id`), lo que facilita su uso en entornos distribuidos.
- Alta fidelidad al modelo original: acuerdo top-1 del 92.8% con el profesor bf16 y KL de 50.3 mnats/tok, lo que indica que conserva la distribución de probabilidades del modelo sin cuantizar.
- Capacidad de ejecución en equipos con 128 GB de memoria unificada, lo que lo hace accesible para desarrollo local sin infraestructura cloud.

## Casos de uso

- Desarrollo local de prototipos de IA en Mac: un investigador puede ejecutar este modelo en un Mac Studio con 128 GB de RAM unificada para probar ideas de razonamiento o generación sin depender de APIs externas, gracias a su tamaño reducido (94.1 GiB) y compatibilidad con `mlx-lm`.
- Análisis de documentos con imágenes: al incluir la torre de visión, se puede usar para extraer información de capturas, diagramas o documentos escaneados, procesando texto e imágenes de forma conjunta en un solo modelo.
- Generación de código asistida: el modelo base está entrenado con corpus de código (perplexity 1.916 en código), por lo que puede usarse como asistente de programación local en entornos con datos sensibles que no pueden salir del equipo.
- Chatbots conversacionales de nicho: desarrolladores pueden desplegar un asistente de conversación en inglés con capacidades de razonamiento en una máquina de escritorio, sin costes de inferencia en la nube.
- Investigación en cuantización y eficiencia: el propio modelo sirve como referencia para estudiar el impacto de la vector quantization en modelos MoE, ya que incluye métricas detalladas de fidelidad (KL, top-1, perplexity) y un runtime reproducible con VQLab.
- Entornos offline y con requisitos de privacidad: al ser un checkpoint local, se puede utilizar en entornos sin conexión a internet, como laboratorios, hospitales o instituciones gubernamentales que requieren procesamiento de datos en local.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre un corpus de prosa de referencia (2048 tokens), comparando la fidelidad frente al profesor bf16. Los resultados se presentan en la siguiente tabla:

| build | tamaño | KL a bf16 (mnats/tok) | acuerdo top-1 | perplexity |
|---|---|---|---|---|
| affine q3 (del autor) | 75 GiB | 1083.4 | 61.9% | 12.850 |
| affine q4 (del autor) | 96 GiB | 293.9 | 79.6% | 6.453 |
| **este modelo (VQ 4.4bpw)** | **94.1 GiB** | **50.3** | **92.8%** | **5.223** |
| affine q5 (del autor) | 116 GiB | 91.7 | 87.5% | 5.243 |
| affine q6 (del autor) | 137 GiB | 52.8 | 91.6% | 4.916 |
| affine q8 (del autor) | 178 GiB | 27.1 | 94.9% | 5.197 |
| bf16 teacher | 335 GiB | 0 | 100% | 5.166 |

Además, se reportan perplexidades en corpus adicionales: código 1.916 (corpus mlx público) y literario 7.698 (Gutenberg), frente a 1.902 y 7.664 del profesor. El autor recomienda clasificar por KL en lugar de perplexity, ya que la perplexidad es un agregado que puede enmascarar errores compensados. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- Memoria: se requiere un mínimo de 128 GB de RAM unificada en Apple Silicon (el modelo ocupa 94.1 GiB en disco y carga completa en memoria).
- Chip: compatible con Apple Silicon (M1 Ultra, M2 Ultra, M3 Ultra o superior) con 128 GB de memoria unificada. No requiere GPU dedicada.
- Almacenamiento: 101.1 GB de espacio libre para el repositorio.
- Runtime: `mlx-lm` (sin parches) o `exo` para despliegue distribuido. El checkpoint incluye el runtime VQ como `model.py`.
- Latencia y throughput: no se proporcionan datos específicos en la información disponible. Se espera que la inferencia sea lenta en comparación con GPUs dedicadas, pero adecuada para tareas interactivas en un Mac de gama alta.
- Alternativas: en equipos con menos memoria, se pueden usar las versiones afines de menor tamaño (q3, q4) del mismo autor, aunque con mayor pérdida de calidad.

## Comparativa con modelos similares

La comparativa se realiza con otras cuantizaciones del mismo autor sobre el mismo modelo base, así como con el checkpoint bf16 original:

| Modelo | Tamaño | KL a bf16 | Acuerdo top-1 | Perplexity | Licencia |
|---|---|---|---|---|---|
| **VQ 4.4bpw (este)** | 94.1 GiB | 50.3 | 92.8% | 5.223 | qwen-community-1.0 |
| affine q4 (autor) | 96 GiB | 293.9 | 79.6% | 6.453 | qwen-community-1.0 |
| affine q6 (autor) | 137 GiB | 52.8 | 91.6% | 4.916 | qwen-community-1.0 |
| bf16 teacher | 335 GiB | 0 | 100% | 5.166 | qwen-community-1.0 |

Frente a otras cuantizaciones de modelos similares en el mercado (por ejemplo, versiones GGUF de Llama 3.1 70B o Mixtral 8x7B), este modelo ofrece una capacidad de contexto y razonamiento superior al ser una variante de Qwen4, aunque carece de métricas comparables en benchmarks estándar. No se dispone de datos de otros modelos cuantizados con la misma técnica VQ para una comparación directa.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de calidad respecto al modelo bf16, especialmente en términos de distribución de probabilidades (KL de 50.3 mnats/tok frente a 0 del profesor). Aunque el acuerdo top-1 es alto (92.8%), puede haber diferencias sutiles en generación de texto largo.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen que puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia antes de desplegar en producción.
- El modelo está entrenado principalmente en inglés; no se garantiza un buen rendimiento en otros idiomas, incluido el español.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su rendimiento con otros modelos en tareas específicas.
- El tamaño del repositorio (101.1 GB) y el requisito de 128 GB de RAM unificada limitan su uso a equipos de gama alta; no cabe en Macs con 64 GB o menos.
- La torre de visión está en bf16 y ocupa 0.84 GiB, lo que incrementa el uso de memoria durante la inferencia multimodal.
- Al ser una cuantización sin datos, no se ha calibrado con datos de distribución reales, lo que podría afectar a casos de uso específicos (por ejemplo, dominios técnicos muy especializados).

## Enlaces

- Repositorio HuggingFace: [TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw](https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-4.4bpw)
- Modelo base: [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Herramienta VQLab: [VQLab](https://github.com/noahzelezny/VQLab)
- Documentación de unsloth sobre Qwen3.8-Flash-Next: [unsloth.ai/docs/models/qwen3.8-next](https://unsloth.ai/docs/models/qwen3.8-next)
- Recetas vLLM para Qwen3.8-Flash-Next: [recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- Artículo de ExplainX sobre el lanzamiento: [explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026](https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026)
