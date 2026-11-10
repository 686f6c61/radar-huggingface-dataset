# tahamajs/qwen-2.5-0.5b-cosformer-wikitext2

## Resumen

Qwen-2.5-0.5B-cosformer-wikitext2 es un experimento de investigación publicado por el usuario tahamajs en Hugging Face, consistente en el reemplazo de parte de los mecanismos de atención del modelo Qwen2.5-0.5B por atención lineal de tipo cosformer, seguido de un proceso de destilación de conocimiento sobre el conjunto de datos WikiText-2. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de Alibaba, sino de una intervención quirúrgica sobre los pesos de un modelo base existente, con el objetivo de evaluar la viabilidad de sustituir atención cuadrática por atención lineal en un transformer ya entrenado.

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 550 millones de parámetros (494 millones en el modelo base original, 550.347.154 en esta versión según los safetensors publicados). La intervención aplica un patrón denominado `hybrid_3_1`, que presumiblemente mantiene atención estándar en tres de cada cuatro capas y sustituye la restante por cosformer, aunque la model card no detalla la asignación exacta por capa. El resultado se destila sobre WikiText-2 durante 180,6 segundos en una RTX 3090, reduciendo la perplejidad causal de 345.903,37 a 498,61.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un artefacto de investigación con cero descargas, sin licencia declarada, sin idiomas especificados y sin pipeline definido. Su interés radica en documentar empíricamente el coste de sustituir atención softmax por atención lineal en un modelo pequeño, y en servir como referencia para quienes exploren técnicas de transplant de atención y destilación de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: cosformer lineal en patrón `hybrid_3_1` |
| Parametros totales | 550.347.154 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen2.5-0.5B (ruta local `/dev/shm/Qwen2.5-0.5B`) |
| Dataset de destilación | WikiText-2 (`wikitext-2-raw-v1`) |
| Patrón de sustitución | `hybrid_3_1` |
| Perplejidad causal pre-KD | 345.903,37 |
| Perplejidad causal post-KD | 498,61 |
| Tiempo de destilación | 180,6 s en NVIDIA RTX 3090 |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen2.5-0.5B, cuyo mecanismo de atención se ha modificado parcialmente mediante lo que el autor denomina "transplanted attention": se sustituye la atención softmax estándar por atención lineal cosformer en un subconjunto de capas, siguiendo el patrón `hybrid_3_1`. La atención cosformer es una variante de atención lineal que aproxima el producto softmax mediante una función de reweighting coseno, reduciendo la complejidad de O(n²) a O(n) en la longitud de secuencia. El patrón `hybrid_3_1` sugiere que tres de cada cuatro capas conservan atención estándar y una se sustituye, aunque la model card no especifica qué capas concretas ni el criterio de selección.

Tras el transplante, el modelo se somete a destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), presumiblemente usando el modelo base original como profesor. La model card reporta una perplejidad causal pre-destilación de 345.903,37, lo que indica que el transplante por sí solo degrada severamente el modelo, y una perplejidad post-destilación de 498,61, que sigue siendo muy superior a la del Qwen2.5-0.5B original (típicamente en el rango de 10-15 en WikiText-2 para modelos de este tamaño). El proceso de destilación se completó en 180,6 segundos en una RTX 3090, lo que sugiere un número reducido de pasos y un dataset pequeño. No se documentan hiperparámetros, número de tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen2.5-0.5B, aunque degradada por el transplante de atención y la destilación limitada.
- Razonamiento básico y respuesta a instrucciones: capacidad residual del modelo base, no garantizada tras la intervención.
- Generación de código y matemáticas: capacidad limitada por el tamaño del modelo base (0,5B) y potencialmente afectada por el transplante.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5 lo soporta, pero no se confirma en esta versión.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están especificados en la ficha de Hugging Face.
- Modo thinking, visión o audio: no disponible.
- Capacidad principal demostrada: reducción de perplejidad causal sobre WikiText-2 tras destilación (de 345.903,37 a 498,61).

## Casos de uso

- Investigación sobre atención lineal: el modelo sirve como banco de pruebas para medir el impacto de sustituir atención softmax por cosformer en un transformer preentrenado, comparando perplejidad pre y post destilación.
- Estudio de técnicas de transplante de atención: permite reproducir el pipeline `hybrid_3_1` y evaluar variantes del patrón de sustitución por capa.
- Destilación de recuperación tras intervención quirúrgica: útil para investigar cuánto conocimiento se recupera con un presupuesto de destilación muy reducido (180,6 s en una RTX 3090) sobre un dataset pequeño como WikiText-2.
- Referencia para experimentos de eficiencia computacional: al reducir la complejidad de atención en una fracción de capas, puede emplearse para medir ganancias de throughput en secuencias largas, aunque no se publican dichas métricas.
- Docencia y reproducción académica: ejemplo mínimo y de bajo coste (1,3 GB, cabe en cualquier GPU consumer) para ilustrar el efecto de la atención lineal en modelos pequeños.
- Prototipado de pipelines de evaluación de perplejidad: el modelo y sus métricas reportadas permiten validar herramientas de evaluación de modelos de lenguaje sobre WikiText-2.

## Benchmarks y rendimiento

| Metrica | Pre-destilacion | Post-destilacion |
|---|---|---|
| Perplejidad causal (WikiText-2) | 345.903,37 | 498,61 |
| Delta de perplejidad | — | -345.404,77 |
| Tiempo de destilacion | — | 180,6 s (RTX 3090) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son la perplejidad causal sobre WikiText-2 antes y después de la destilación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB para los pesos (550M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,55 GB; en 4 bits: aproximadamente 0,28 GB (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM; el autor reporta entrenamiento/destilación en una NVIDIA RTX 3090.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers con `trust_remote_code` o conversión a GGUF para llama.cpp/Ollama. No se documenta compatibilidad con vLLM o TGI, y la atención cosformer probablemente no está soportada de forma nativa por estos motores sin parches.
- Latencia y throughput: no disponibles. El único dato temporal es el tiempo de destilación (180,6 s en RTX 3090), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-2.5-0.5B-cosformer-wikitext2 | 550M | no disponible | 498,61 (post-KD) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B (base original) | 494M | 32.768 tokens (según documentación oficial de Qwen) | no disponible en esta ficha | Apache 2.0 (según Qwen) | Hugging Face, ampliamente descargado |
| SmolLM2-360M | 360M | 8.192 tokens (según documentación oficial) | no disponible en esta ficha | Apache 2.0 (según HuggingFace) | Hugging Face |
| TinyLlama-1.1B | 1,1B | 2.048 tokens (según documentación oficial) | no disponible en esta ficha | Apache 2.0 (según documentación) | Hugging Face |

La comparación directa es limitada: el modelo de tahamajs es un artefacto de investigación con perplejidad muy superior a la esperable en el modelo base, mientras que las alternativas son modelos de producción con licencias claras y amplio soporte de herramientas. No se dispone de datos de benchmarks comparables para establecer una comparación de rendimiento tarea a tarea.

## Limitaciones y advertencias

- Perplejidad causal de 498,61 en WikiText-2, muy superior a la del Qwen2.5-0.5B original, lo que indica una degradación severa de la calidad del lenguaje tras el transplante y la destilación limitada.
- La perplejidad pre-destilación de 345.903,37 demuestra que el transplante de atención por sí solo rompe el modelo; la recuperación es parcial.
- Licencia no declarada: no se puede asumir uso comercial permitido. La licencia del modelo base Qwen2.5-0.5B es Apache 2.0 según su documentación oficial, pero esta versión modificada no especifica términos.
- Idiomas no declarados: no se puede garantizar soporte multilingüe ni siquiera en inglés.
- Sin pipeline definido en Hugging Face: la carga automática puede fallar; requiere inspección manual de la configuración y posible código personalizado para la atención cosformer.
- Riesgo elevado de alucinación y generación incoherente dado el tamaño del modelo (0,5B) y la degradación por el transplante.
- No se documentan sesgos, pero al derivar de Qwen2.5-0.5B y entrenarse solo con WikiText-2 (inglés, dominio enciclopédico), el modelo probablemente hereda sesgos del base y pierde cobertura de dominios.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de validación por parte de la comunidad.
- No apto para producción: es un artefacto de investigación sin garantías de estabilidad, soporte ni mantenimiento.
- La atención cosformer puede no ser compatible con motores de inferencia estándar (vLLM, TGI, llama.cpp) sin modificaciones, lo que limita su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-cosformer-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de cosformer (Linear Attention with Cosine-based Reweighting): https://arxiv.org/abs/2202.08791
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de transformers sobre atención lineal: https://huggingface.co/docs/transformers
