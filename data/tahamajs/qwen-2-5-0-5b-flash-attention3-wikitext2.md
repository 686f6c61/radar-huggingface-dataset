# tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2` es un experimento de investigación publicado en Hugging Face que aplica una cirugía de atención al modelo base Qwen2.5-0.5B, sustituyendo su mecanismo de atención original por una implementación etiquetada como `flash_attention3` a través de un registro denominado `ATTENTION_REGISTRY`. El autor es `tahamajs` y el artefacto se distribuye en formato safetensors con 535.364.224 parámetros reales, lo que confirma que la arquitectura subyacente es la de Qwen2.5-0.5B.

El proceso descrito en la model card incluye un patrón de sustitución llamado `hybrid_3_1` y una fase posterior de destilación de conocimiento sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una NVIDIA RTX 3090 durante 180,4 segundos. La perplexity causal previa a la destilación era de 779190,64 y la posterior de 669,12, una reducción drástica que indica que el transplante inicial dejó el modelo prácticamente inutilizable y que la destilación lo recuperó parcialmente.

Es relevante ahora porque documenta un flujo de trabajo reproducible para intercambiar kernels de atención en modelos pequeños sin reentrenar desde cero, algo útil para quienes investigan eficiencia de atención, portabilidad de kernels y recuperación mediante destilación. No obstante, el repositorio no incluye pipeline, licencia, idiomas ni resultados de benchmarks más allá de la perplexity, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención `flash_attention3` transplantada vía `ATTENTION_REGISTRY`; patrón de cirugía `hybrid_3_1` |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen2.5-0.5B, no confirmada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen2.5-0.5B |
| Dataset de destilación | WikiText-2 (`wikitext-2-raw-v1`) |
| PPL causal pre-destilación | 779190.64 |
| PPL causal post-destilación | 669.12 |
| Delta de PPL | -778521.52 |
| Tiempo de destilación | 180.4 s en NVIDIA RTX 3090 |
| Tamano del repo | 1.3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con 535.364.224 parámetros, sobre el que se ha realizado una operación de "cirugía" consistente en reemplazar el módulo de atención por una implementación registrada como `flash_attention3` dentro de un `ATTENTION_REGISTRY`. El patrón `hybrid_3_1` sugiere una política de sustitución parcial por capas (probablemente tres capas con la atención nueva por cada una con la original, aunque el detalle exacto no se especifica en la información disponible). No se documenta si la atención transplantada es FlashAttention-3 real o una implementación propia etiquetada así.

El entrenamiento posterior es una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), no un preentrenamiento completo. La model card reporta que la perplexity causal pasó de 779190,64 antes de la destilación a 669,12 después, en 180,4 segundos sobre una RTX 3090. No se especifican hiperparámetros, número de tokens vistos, función de pérdida de destilación ni si hubo RLHF o DPO. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá del cambio de kernel.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen2.5-0.5B, sujeta a la degradación observada en la perplexity post-destilación (669,12 sobre WikiText-2, valor muy alto para un modelo de este tamaño).
- Razonamiento básico y respuesta a instrucciones en la medida en que el base Qwen2.5-0.5B las conserva; no se documenta evaluación específica tras la cirugía.
- Generación de código y matemáticas elementales: capacidad potencialmente heredada del base, sin verificación publicada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el único dataset documentado es WikiText-2 en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transplante de kernels de atención: el artefacto sirve como referencia reproducible para estudiar cómo afecta sustituir el mecanismo de atención de un transformer pequeño y qué coste de recuperación exige la destilación posterior.
- Experimentos de recuperación por destilación: el par de valores de perplexity pre y post destilación permite calibrar técnicas de knowledge distillation sobre modelos dañados por cirugía arquitectónica.
- Benchmarking de kernels de atención en GPUs de consumo: el flujo se ejecutó en una RTX 3090 en 180,4 segundos, lo que lo hace viable para pruebas de portabilidad de kernels en hardware asequible.
- Docencia y divulgación técnica: útil para explicar de forma práctica el concepto de "model surgery" y sus consecuencias medibles en perplexity.
- Validación de pipelines de evaluación de PPL: puede emplearse como caso de prueba con un valor de referencia conocido (669,12 en WikiText-2) para verificar implementaciones de cálculo de perplexity causal.
- Estudio de robustez de modelos pequeños: permite analizar hasta qué punto un modelo de 0,5B conserva capacidades tras una modificación agresiva de su atención y una destilación corta.

No se recomienda su uso en producción, atención al cliente, generación de código en CI/CD ni tareas generativas reales, dado el nivel de perplexity reportado y la ausencia de evaluaciones de calidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PPL causal pre-destilación (WikiText-2) | 779190.64 |
| PPL causal post-destilación (WikiText-2) | 669.12 |
| Delta de PPL | -778521.52 |
| Tiempo de destilación | 180.4 s (NVIDIA RTX 3090) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp16 (535M parámetros), en torno a 0,6 GB en int8 y 0,3-0,4 GB en cuantizaciones de 4 bits, estimaciones teóricas a partir del número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; el autor validó el flujo de destilación en una NVIDIA RTX 3090.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPUs con suficiente memoria compartida en cuantización).
- Opciones de despliegue: al ser safetensors de Qwen2, es compatible con transformers, vLLM y TGI en principio; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en el repositorio.
- Latencia y throughput: no disponibles. El único dato temporal es el de la destilación (180,4 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2 | 535.364.224 | no disponible | no disponible | Experimental, PPL WikiText-2 669,12 |
| Qwen2.5-0.5B (base) | ~494M (0,5B nominal) | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Modelo oficial listo para uso |
| Qwen2.5-0.5B-Instruct | ~494M (0,5B nominal) | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Modelo oficial ajustado a instrucciones |

La comparación directa con el base Qwen2.5-0.5B no es posible en términos de perplexity porque el repositorio no reporta el valor del base bajo el mismo protocolo. El modelo aquí descrito presenta un número de parámetros ligeramente superior al nominal del base, coherente con posibles capas o parámetros añadidos durante la cirugía.

## Limitaciones y advertencias

- La perplexity post-destilación de 669,12 en WikiText-2 es extremadamente alta para un modelo de 0,5B, lo que indica una calidad de lenguaje muy degradada respecto al base original.
- La perplexity pre-destilación de 779190,64 muestra que el transplante de atención rompe el modelo antes de la destilación; la recuperación es solo parcial.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B y haberse destilado únicamente sobre WikiText-2, es probable que herede sesgos del base y del corpus, sin mitigación documentada.
- Riesgo elevado de alucinación y de generación incoherente dado el nivel de perplexity reportado.
- Limitaciones de idioma: el único dataset documentado es inglés (WikiText-2); no hay evidencia de capacidades multilingües tras la cirugía.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del base Qwen2.5-0.5B debería verificarse por separado.
- No hay información sobre el pipeline, por lo que no se garantiza compatibilidad directa con `text-generation` en transformers sin pruebas.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- No debe usarse en producción sin una evaluación propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-flash-attention3-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, sin enlace público)
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext (referencia estándar del dataset citado)
- Repositorio oficial de Qwen2.5: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
