# tahamajs/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2` es un experimento de "cirugía de atención" sobre el modelo base Qwen2.5-0.5B, publicado por el usuario tahamajs. El autor sustituye el mecanismo de atención original del transformer por una implementación propia denominada `flash_attention3_fp8`, registrada en un componente llamado `ATTENTION_REGISTRY`, y aplica un patrón de sustitución híbrido etiquetado como `hybrid_3_1`. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de Alibaba, sino de una modificación técnica de un checkpoint existente.

El modelo cuenta con 535.364.224 parámetros en formato safetensors y un repositorio de apenas 0,2 GB, coherente con un checkpoint de 0,5B en precisión reducida (fp8). Según la model card, el autor midió una perplejidad causal (PPL) catastrófica de 1.198.067,61 antes de destilar, que redujo hasta 426,76 tras un proceso de destilación de conocimiento de 180,4 segundos sobre una NVIDIA RTX 3090 usando el dataset WikiText-2 (`wikitext-2-raw-v1`).

La relevancia de esta ficha es acotada: se trata de una prueba de concepto de investigación sobre sustitución de kernels de atención y recuperación mediante destilación, no de un modelo listo para producción. Aun así, resulta útil para quienes exploran técnicas de transplante de atención, cuantización fp8 y evaluación rápida de daño/recuperación de modelos mediante perplejidad en WikiText-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 (Qwen2.5-0.5B) con atención sustituida por `flash_attention3_fp8` |
| Parámetros totales | 535.364.224 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada en la información) |
| Tipos de cuantización | fp8 (según el nombre del modelo y la atención transplantada); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2. Sobre esa base, el autor realiza un "transplante" del mecanismo de atención: sustituye la atención original por una implementación propia llamada `flash_attention3_fp8`, registrada en un `ATTENTION_REGISTRY`, y aplica un patrón de cirugía `hybrid_3_1`, que presumiblemente alterna capas con la atención original y capas con la nueva atención en una proporción 3:1 (el detalle exacto no se especifica en la información disponible).

El entrenamiento posterior consiste en una destilación de conocimiento (KD) sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), ejecutada en 180,4 segundos sobre una NVIDIA RTX 3090. Los datos reportados por el autor muestran una perplejidad causal previa a la destilación de 1.198.067,61, que cae a 426,76 tras la KD (delta de -1.197.640,85). Esta cifra final sigue siendo muy elevada para un modelo de 0,5B en WikiText-2, lo que sugiere que la recuperación es parcial y que el transplante degrada sustancialmente la calidad del modelo original. No se documentan datos sobre volumen de tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2, sujeta a la degradación introducida por el transplante de atención y la destilación parcial.
- Razonamiento básico y respuesta a instrucciones: capacidad no verificada tras la modificación; la perplejidad reportada sugiere un rendimiento muy por debajo del modelo base.
- Código y matemáticas: no disponible; no se han publicado evaluaciones específicas.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se declaran.
- Evaluación de kernels de atención: el modelo sirve como artefacto de investigación para medir el impacto de sustituir la atención por `flash_attention3_fp8` y el coste de recuperación vía destilación.

## Casos de uso

- Investigación sobre transplante de atención: el modelo permite reproducir el experimento de sustituir la atención de Qwen2.5-0.5B por `flash_attention3_fp8` y medir la caída de perplejidad en WikiText-2 antes y después de la destilación.
- Estudio de recuperación mediante destilación de conocimiento: sirve para analizar cuánto se puede recuperar un modelo dañado con 180,4 segundos de KD en una RTX 3090 y qué PPL residual queda (426,76).
- Benchmarking de kernels fp8 en GPUs de consumo: al estar orientado a fp8 y haberse entrenado en una RTX 3090, es útil para comparar el comportamiento de kernels de atención cuantizados en hardware consumer.
- Pruebas de pipelines de evaluación de perplejidad: el checkpoint y su historial de PPL pre/post KD permiten validar herramientas de evaluación causal sobre WikiText-2.
- Docencia y divulgación técnica: ejemplo práctico de cirugía de modelos, registros de atención y evaluación de daño en checkpoints pequeños.
- Prototipado de bajo coste con requisitos mínimos de VRAM: por su tamaño (0,5B) y formato fp8, puede ejecutarse en GPUs modestas para experimentos exploratorios, siempre que se acepte la degradación de calidad.
- No recomendado para producción, atención al cliente, generación de código o cualquier tarea que requiera calidad lingüística fiable, dado el nivel de perplejidad reportado.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 1.198.067,61 |
| Perplejidad causal post-KD (WikiText-2) | 426,76 |
| Delta de perplejidad | -1.197.640,85 |
| Tiempo de destilación | 180,4 s en NVIDIA RTX 3090 |
| Dataset de evaluación/entrenamiento KD | `wikitext-2-raw-v1` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0,2 GB) y los 535M de parámetros en fp8, la huella de pesos ronda los 0,5 GB, a lo que hay que sumar activaciones y caché KV.
- GPU recomendadas: el autor reporta entrenamiento/destilación en NVIDIA RTX 3090; para inferencia, cualquier GPU con soporte fp8 o capacidad suficiente para cargar el checkpoint.
- ¿Cabe en consumer GPU? Sí, por tamaño (0,5B) es probable que quepa en GPUs consumer modernas, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La atención custom `flash_attention3_fp8` probablemente requiere código específico del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2 | 535.364.224 | no disponible | no disponible | Experimental, PPL post-KD 426,76 en WikiText-2 |
| Qwen2.5-0.5B (base) | ~0,5B | no disponible en esta ficha | no disponible en esta ficha | Modelo oficial de referencia |
| Otros checkpoints Qwen2.5-0.5B modificados | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base no puede cuantificarse porque no se dispone de la PPL de referencia de Qwen2.5-0.5B en WikiText-2 en la información proporcionada. No se identifican alternativas equivalentes de "atención transplantada" en la información disponible.

## Limitaciones y advertencias

- Calidad severamente degradada: la PPL post-KD de 426,76 es muy alta para un modelo de 0,5B, lo que indica que el transplante de atención daña el modelo y la destilación solo recupera parcialmente.
- Perplejidad pre-KD prácticamente inutilizable (1.198.067,61): el checkpoint sin destilar no es funcional para generación coherente.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; además, al derivar de Qwen2.5-0.5B, habría que verificar la licencia del modelo base.
- Idiomas no declarados: no se confirma el soporte multilingüe del modelo base ni el efecto del transplante sobre idiomas distintos del inglés de WikiText-2.
- Riesgo de alucinación: no evaluado; con la degradación observada, la probabilidad de salidas incoherentes es alta.
- Sesgos: no evaluados ni documentados.
- Dependencia de código custom: la atención `flash_attention3_fp8` y el `ATTENTION_REGISTRY` no son estándar, por lo que la carga y ejecución pueden requerir el código del autor y no funcionar en frameworks convencionales.
- Contexto no confirmado: no se documenta la longitud de contexto efectiva tras la modificación.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-flash-attention3-fp8-wikitext2
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio oficial Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper FlashAttention: https://arxiv.org/abs/2205.14135
- Paper FlashAttention-2: https://arxiv.org/abs/2307.08691
- Paper FlashAttention-3: https://arxiv.org/abs/2407.08608
