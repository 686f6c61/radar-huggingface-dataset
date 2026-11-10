# tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2` es un experimento de investigación publicado en Hugging Face que consiste en un transplante de mecanismo de atención sobre el modelo base Qwen2.5-0.5B. El autor sustituye la atención estándar del transformer por una implementación propia denominada `cluster_attention`, registrada en lo que la model card llama `ATTENTION_REGISTRY`, y posteriormente realiza una fase de destilación de conocimiento (KD) para recuperar la coherencia del modelo tras la cirugía.

El modelo no es un lanzamiento de producción ni una versión oficial de Qwen: es un artefacto de investigación con 535.364.224 parámetros (ligeramente por encima de los 494M típicos de Qwen2.5-0.5B, presumiblemente por los parámetros adicionales del nuevo módulo de atención) y un tamaño de repositorio de 1,3 GB en formato safetensors. El pipeline, la licencia y los idiomas no están declarados en la información disponible.

Su relevancia es acotada: sirve como prueba de concepto de que es posible intercambiar el mecanismo de atención de un LLM pequeño y reentrenar mediante destilación en una sola GPU consumer (RTX 3090, 180,2 s), partiendo de una perplejidad causal inicial de 440.626,27 y bajando a 1.045,39 tras la destilación sobre WikiText-2. Es material para quienes investigan arquitecturas alternativas de atención, no un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención sustituida por `cluster_attention`; patrón de cirugía `hybrid_3_1` |
| Parametros totales | 535.364.224 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar, y le aplica una "cirugía" arquitectónica: se reemplaza el módulo de atención por `cluster_attention`, una implementación registrada en el `ATTENTION_REGISTRY` del autor. El patrón `hybrid_3_1` sugiere una mezcla de capas con atención original y capas con atención clusterizada en proporción 3:1, aunque la información disponible no detalla la semántica exacta de ese patrón ni la formulación matemática de `cluster_attention`.

Tras el transplante, el modelo queda completamente desalineado: la perplejidad causal pre-destilación es de 440.626,27, un valor que indica que la sustitución rompe el comportamiento del modelo. El autor aplica entonces destilación de conocimiento sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), lo que reduce la perplejidad a 1.045,39 (delta de -439.580,89). El proceso de destilación se ejecutó en 180,2 segundos sobre una NVIDIA RTX 3090. No se documentan el número de tokens de entrenamiento, la composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Tampoco se especifica qué modelo actúa como profesor en la destilación, aunque por el contexto se infiere que es el Qwen2.5-0.5B original.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2, sujeta a la degradación introducida por la cirugía de atención.
- Razonamiento y conocimiento factual limitados: la perplejidad post-destilación de 1.045,39 sobre WikiText-2 es muy superior a la de un modelo Qwen2.5-0.5B intacto, lo que indica una calidad de modelado del lenguaje notablemente degradada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el único corpus de ajuste documentado es WikiText-2 en inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el modelo sirve como referencia reproducible para estudiar cómo afecta `cluster_attention` a la perplejidad y a la calidad de generación frente a la atención estándar de Qwen2.
- Experimentos de transplante de módulos en LLMs pequeños: permite analizar el coste de recuperación (180,2 s en RTX 3090) tras sustituir un componente arquitectónico y reentrenar por destilación.
- Estudio de curvas de destilación de conocimiento: la diferencia entre PPL pre (440.626,27) y post (1.045,39) es un punto de partida para medir cuánta capacidad se recupera con KD sobre un corpus pequeño como WikiText-2.
- Docencia y divulgación: ejemplo didáctico de cirugía arquitectónica y de las limitaciones de la destilación cuando el corpus de ajuste es reducido y de dominio único.
- Benchmarking de infraestructura de entrenamiento: referencia de tiempos de destilación en GPU consumer para tareas de recuperación de modelos de ~0,5B.
- No recomendado para atención al cliente, generación de código en producción, RAG ni ninguna aplicación orientada a usuarios finales, dada la falta de licencia declarada y la degradación de calidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD (WikiText-2) | 440.626,27 |
| Perplejidad causal post-KD (WikiText-2) | 1.045,39 |
| Delta de perplejidad | -439.580,89 |
| Tiempo de destilación | 180,2 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,1 GB solo para pesos (535M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~0,6 GB; en 4 bits: ~0,3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en fp16; el autor validó el entrenamiento en una RTX 3090.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (carga estándar de safetensors); vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo y es probable que requieran adaptación por el módulo `cluster_attention` no estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2 | 535.364.224 | No disponible | No disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base original) | ~494M | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | Producción, ampliamente adoptado |
| Qwen2.5-1.5B | ~1.540M | 32.768 tokens (según documentación oficial de Qwen) | Apache 2.0 (según documentación oficial de Qwen) | Producción |

La comparación relevante es con el Qwen2.5-0.5B original: el modelo aquí descrito añade ~41M de parámetros (probablemente del módulo de atención), no declara licencia ni contexto, y presenta una perplejidad post-destilación muy superior a la del base, por lo que no es un sustituto funcional.

## Limitaciones y advertencias

- Calidad degradada: la perplejidad post-destilación de 1.045,39 sobre WikiText-2 es indicativa de un modelado del lenguaje muy pobre en comparación con el Qwen2.5-0.5B original.
- Licencia no declarada: no se puede asumir uso comercial; la ausencia de licencia impide determinar los términos de redistribución.
- Idiomas no declarados: el único corpus de ajuste documentado es WikiText-2 en inglés, por lo que el comportamiento en castellano u otros idiomas es desconocido.
- Riesgo de alucinación elevado: un modelo con esta perplejidad y sin ajuste por RLHF produce texto incoherente con alta probabilidad.
- Compatibilidad limitada: el módulo `cluster_attention` no es estándar, por lo que las herramientas de inferencia habituales (vLLM, llama.cpp, TGI) probablemente no lo carguen sin modificaciones.
- Contexto no documentado: se desconoce si la cirugía preserva la ventana de 32.768 tokens del Qwen2.5 original.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o revisión por terceros.
- Sesgos: no documentados por el autor; los sesgos heredados de Qwen2.5-0.5B no han sido evaluados tras la cirugía.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cluster-attention-wikitext2
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
