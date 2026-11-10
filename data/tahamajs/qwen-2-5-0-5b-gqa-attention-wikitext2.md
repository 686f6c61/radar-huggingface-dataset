# tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2` es un experimento de ingeniería sobre el modelo base Qwen2.5-0.5B, publicado por el usuario tahamajs en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una "cirugía" de atención: se sustituye el mecanismo de atención original del transformer por un módulo denominado `gqa_attention` (registrado en una supuesta `ATTENTION_REGISTRY` del framework NeuralOps), manteniendo el resto de pesos del modelo base. El objetivo declarado es reducir la perplejidad mediante un proceso de destilación de conocimiento (KD) tras el transplante de atención.

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba), con una ventana de contexto nativa de 32 768 tokens y licencia Apache 2.0 en su versión original. Sin embargo, la model card de este repositorio no confirma qué licencia aplica a los pesos resultantes ni detalla los idiomas soportados tras la modificación, por lo que esos datos figuran como no disponibles.

La relevancia de esta ficha es limitada pero instructiva: documenta un caso de transferencia de módulos de atención y destilación sobre WikiText-2, con métricas de perplejidad antes y después del proceso. El resultado (PPL causal de 126,42 tras la destilación, frente a 579 546,96 antes) indica que el transplante sin ajuste deja el modelo prácticamente inutilizable y que la destilación recupera parcialmente la coherencia, aunque sigue lejos de los valores típicos de un modelo de 0,5B bien entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen2.5-0.5B, con módulo de atención sustituido por `gqa_attention` (NeuralOps) |
| Parámetros totales | ~0,5 mil millones (heredados del modelo base Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-0.5B soporta 32 768 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el base Qwen2.5-0.5B es Apache 2.0) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2.5-0.5B. La modificación principal consiste en el reemplazo del mecanismo de atención por un módulo `gqa_attention` perteneciente a un registro de atenciones del framework NeuralOps. La model card describe el patrón de cirugía como `hybrid_3_1`, lo que sugiere una sustitución selectiva de capas (probablemente tres capas con atención original por cada una con la atención transplantada, o viceversa; el detalle exacto no se especifica). No se documenta el número de capas afectadas, la dimensionalidad de las cabezas ni la configuración de grupos de query/key/value del nuevo módulo.

El entrenamiento posterior al transplante se realiza mediante destilación de conocimiento sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), un corpus de texto en inglés de Wikipedia de aproximadamente 2 millones de tokens. La destilación se ejecutó en una NVIDIA RTX 3090 y duró 180,4 segundos, lo que indica un ajuste muy corto y de bajo coste computacional. No se mencionan fases de RLHF, DPO ni ajuste por instrucciones. La perplejidad causal pasó de 579 546,96 antes de la destilación a 126,42 después, una mejora de 579 420,54 puntos, pero el valor final sigue siendo muy alto para un modelo de este tamaño en WikiText-2 (los modelos de 0,5B suelen situarse en el rango de 15 a 30 de perplejidad en este corpus).

## Capacidades

- Generación de texto autoregresiva básica, limitada por la perplejidad residual tras la destilación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles: el ajuste se realizó únicamente sobre WikiText-2 en inglés.
- No se documentan capacidades especiales (thinking mode, visión, audio).
- No se documenta modo de instrucciones ni chat template funcional.

## Casos de uso

- Investigación sobre transferencia de módulos de atención: el repositorio sirve como referencia reproducible de un experimento de sustitución de atención con patrón `hybrid_3_1` y destilación posterior, útil para estudiar la estabilidad de arquitecturas híbridas.
- Estudio de recuperación tras cirugía de modelos: la métrica de perplejidad pre y post destilación permite analizar cuánto conocimiento se recupera con un ajuste corto (180 s en RTX 3090) sobre WikiText-2.
- Evaluación de frameworks de atención alternativos: permite comparar el módulo `gqa_attention` de NeuralOps frente a la atención GQA original de Qwen2.5 en tareas de modelado de lenguaje.
- Docencia y divulgación: ejemplo práctico de cómo un transplante sin ajuste degrada gravemente un modelo (PPL de 579 546,96) y cómo la destilación mitiga parcialmente el daño.
- Benchmarking de pipelines de destilación de bajo coste: referencia para medir la eficacia de la destilación en un solo GPU consumer con un corpus pequeño.
- No se recomienda su uso en producción ni en aplicaciones de usuario final debido a la falta de validación, licencia incierta y perplejidad elevada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (WikiText-2) | 579 546,96 |
| Perplejidad causal post-destilación (WikiText-2) | 126,42 |
| Delta de perplejidad | -579 420,54 |
| Tiempo de destilación | 180,4 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (~0,5B parámetros), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~0,5 GB; en 4 bits: ~0,3 GB (estimaciones teóricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 3090) es suficiente para inferencia en FP16.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 o superiores con suficiente VRAM.
- Opciones de despliegue: no documentadas; al ser un modelo basado en Qwen2.5, podría cargarse con transformers, vLLM o llama.cpp siempre que la arquitectura modificada sea compatible, lo cual no está confirmado.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el tiempo de destilación (180,4 s en RTX 3090), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2 | ~0,5B | no disponible | no disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base original) | 0,5B | 32 768 tokens | Apache 2.0 | Modelo oficial, ampliamente validado |
| Qwen2.5-1.5B | 1,5B | 32 768 tokens | Apache 2.0 | Modelo oficial, mayor capacidad |
| SmolLM2-360M | 0,36B | 8 192 tokens | Apache 2.0 | Modelo oficial de Hugging Face |

La comparación directa no está disponible en términos de benchmarks porque este repositorio no publica resultados estándar. Frente al Qwen2.5-0.5B original, la versión modificada presenta una perplejidad en WikiText-2 muy superior (126,42 frente a valores típicos de 15-30 del base), lo que sugiere una degradación significativa de la calidad del modelado de lenguaje.

## Limitaciones y advertencias

- Perplejidad post-destilación de 126,42 en WikiText-2, muy por encima de lo esperable en un modelo de 0,5B bien entrenado, lo que indica calidad de generación limitada.
- El transplante de atención sin ajuste produce una perplejidad de 579 546,96, evidencia de que el modelo es inutilizable antes de la destilación.
- Entrenamiento únicamente sobre WikiText-2 (inglés), sin datos multilingües ni de instrucciones.
- Licencia no especificada en el repositorio, lo que impide confirmar si se hereda Apache 2.0 del base o si hay restricciones adicionales para uso comercial.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés.
- No se documenta el formato de pesos ni la compatibilidad con frameworks de inferencia estándar.
- Riesgo elevado de alucinación y salidas incoherentes dada la perplejidad residual.
- Sin descargas ni likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- No apto para producción sin una evaluación exhaustiva previa.
- La model card no detalla sesgos conocidos; al derivar de Qwen2.5 y ajustarse solo en Wikipedia, puede heredar sesgos del corpus y del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gqa-attention-wikitext2
- Qwen2.5 Technical Report (arXiv): https://arxiv.org/pdf/2412.15115
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
