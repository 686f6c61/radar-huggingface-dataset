# wangzhang/Qwen3.6-35B-A3B-abliterated-GGUF

## Resumen

El modelo `wangzhang/Qwen3.6-35B-A3B-abliterated-GGUF` es una versión modificada del modelo Qwen3.6-35B-A3B de Alibaba, publicada por Wangzhang Wu en formato GGUF para su uso con herramientas de inferencia local como llama.cpp, Ollama o LM Studio. La modificación principal consiste en la aplicación de la técnica de abliteración (mediante el método Abliterix), que interviene en el espacio de pesos o representaciones del modelo para reducir drásticamente su comportamiento de rechazo ante peticiones que el modelo original consideraría problemáticas. El resultado es un modelo "sin censura" que conserva las capacidades generales del modelo base, con una divergencia KL de solo 0.0189 respecto al original.

El modelo base Qwen3.6-35B-A3B es un modelo de arquitectura híbrida que combina Gated DeltaNet (una variante de state space model) con Gated Attention, y utiliza un enrutamiento sparse de Mixture-of-Experts (MoE) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Según la información disponible, el modelo base incorpora además un vision encoder para razonamiento multimodal unificado, aunque no se confirma si esta capacidad se conserva íntegramente en la versión abliterated. La relevancia de esta ficha radica en que permite a desarrolladores e investigadores ejecutar un modelo de alto rendimiento en hardware de consumo mediante cuantización, pero con la advertencia explícita de que se han eliminado los mecanismos de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet, Gated Attention y vision encoder (según modelo base) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina Gated DeltaNet, una variante de state space model que ofrece eficiencia computacional en secuencias largas, con Gated Attention, un mecanismo de atención con compuertas que mejora la selectividad de la información. El conjunto se combina con un enrutamiento sparse de Mixture-of-Experts, donde solo 3.000 millones de los 35.000 millones de parámetros se activan por token, lo que reduce el coste de inferencia. Según la documentación de Vast.ai, el modelo base incorpora un vision encoder para razonamiento multimodal unificado, aunque no se especifica si esta capacidad se mantiene en la versión abliterated.

La versión abliterated se obtuvo aplicando la técnica Abliterix, una intervención en el espacio de pesos o representaciones que reduce el comportamiento de rechazo del modelo. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens utilizados, ni los métodos de alineación (RLHF, DPO, etc.) empleados por Qwen para el modelo base. La model card del autor indica que la revisión exacta del checkpoint base no quedó registrada en los artefactos de publicación.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades generales del modelo Qwen3.6-35B-A3B, que incluyen razonamiento complejo, matemáticas y generación de código, aunque no se han publicado benchmarks específicos de estas capacidades para la versión abliterated.
- Ausencia de rechazo: el modelo ha sido modificado para reducir drásticamente las respuestas de rechazo. Según la evaluación del autor, solo rechaza 7 de cada 100 prompts de prueba, frente a 100 de 100 en el modelo original.
- Multimodalidad: el modelo base incorpora un vision encoder, pero no se confirma si la versión abliterated GGUF conserva esta capacidad. La model card no menciona soporte de imágenes.
- Tool calling y function calling: no se especifica en la información disponible, aunque es probable que el modelo base los soporte dado que es un Qwen reciente. No se puede confirmar.
- Capacidades multilingües: no se especifican los idiomas soportados. El modelo base de Qwen suele ser multilingüe, pero no hay datos concretos.

## Casos de uso

- Investigación académica sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin guardarraíles, comparando sus respuestas con el modelo original para analizar el impacto de la abliteración en la calidad y el sesgo de las salidas.
- Pruebas de estrés de sistemas de moderación: se puede utilizar para generar contenido que normalmente sería rechazado, con el fin de evaluar y mejorar filtros de contenido, sistemas de detección de toxicidad o clasificadores de seguridad en entornos controlados.
- Generación creativa sin restricciones: escritores y artistas pueden explorar temas tabú o controvertidos en ficción, poesía o guiones, donde el modelo original podría negarse a colaborar. La baja divergencia KL (0.0189) sugiere que la calidad del texto se mantiene cercana al original.
- Desarrollo de agentes conversacionales para nichos específicos: asistentes de rol, juegos de texto o simulaciones de personajes que requieren respuestas sin filtros morales, siempre que el despliegue se realice en entornos aislados y con control de acceso.
- Evaluación de robustez de modelos: comparar el rendimiento del modelo abliterated frente al original en tareas de razonamiento, código o matemáticas para medir si la intervención afecta a las capacidades cognitivas, más allá de la divergencia KL.
- Despliegue en entornos de investigación con hardware limitado: gracias a la cuantización Q4_K_M (20 GB), el modelo puede ejecutarse en GPUs de consumo como la RTX 3090 o 4090, permitiendo experimentos locales con un modelo de 35B sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

La model card del autor proporciona métricas específicas de la abliteración, no benchmarks generales de capacidad. Se presentan a continuación:

| Metrica | Valor |
|---|---|
| Refusals (LLM judge, 100 eval prompts) | 7/100 |
| KL divergence desde el modelo base | 0.0189 |
| Refusals del modelo original | 100/100 |
| Modelo juez | google/gemini-3-flash-preview |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta versión abliterated en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según el archivo GGUF elegido, se necesitan aproximadamente 65 GB para BF16, 35 GB para Q8_0 y 20 GB para Q4_K_M. Hay que añadir overhead de contexto y KV cache, por lo que se recomienda un margen adicional de 2-4 GB.
- GPUs recomendadas: para Q4_K_M, una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente. Para Q8_0, se necesita una GPU con 48 GB (por ejemplo, A6000 o dos RTX 3090 en paralelo). Para BF16, se requieren GPUs de 80 GB como A100 o H100.
- Compatibilidad con hardware de consumo: sí, la versión Q4_K_M cabe en GPUs de consumo de 24 GB, lo que la hace accesible para entusiastas y pequeños equipos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier herramienta compatible con GGUF. También se puede servir mediante servidores compatibles con la API de OpenAI usando backends como llama.cpp server o vLLM (si se convierte a otro formato).
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un MoE con 3B activos en una RTX 4090 con Q4_K_M suele ofrecer entre 30 y 60 tokens por segundo, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Refusals |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | safetensors | 100/100 |
| Qwen3.6-35B-A3B-abliterated (GGUF) | 35B | 3B | no disponible | Apache 2.0 | GGUF | 7/100 |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Apache 2.0 | safetensors | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE comparables en la información proporcionada. La principal diferencia entre el modelo base y la versión abliterated es el comportamiento de rechazo, mientras que la divergencia KL de 0.0189 indica que las capacidades generales se mantienen muy cercanas.

## Limitaciones y advertencias

- Ausencia de guardarraíles: el modelo ha sido modificado para eliminar o reducir drásticamente los mecanismos de rechazo. Puede generar contenido ofensivo, explícito, peligroso o ilegal. No debe desplegarse en producción sin un análisis de riesgos exhaustivo y medidas de control.
- Sesgos y alucinaciones: al igual que el modelo base, puede presentar sesgos sociales y alucinaciones. La abliteración no corrige estos problemas y podría incluso amplificarlos al eliminar las restricciones que mitigaban parcialmente ciertos sesgos.
- Riesgo de uso indebido: el modelo puede facilitar la creación de malware, fraudes, acoso o desinformación. El autor declara que se publica únicamente con fines de investigación y que el usuario es responsable del uso.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Se recomienda consultar la documentación del modelo base Qwen3.6-35B-A3B para conocer este dato antes de desplegarlo.
- Capacidades multimodales inciertas: aunque el modelo base incluye vision encoder, no se confirma que la versión abliterated GGUF conserve esta funcionalidad. Es posible que la conversión a GGUF haya omitido el procesamiento de imágenes.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor incluye un aviso de que el modelo se distribuye "AS IS" sin garantías. Se recomienda revisar los términos del modelo base original y las leyes aplicables antes de cualquier uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated-GGUF
- Repositorio del modelo abliterated original (safetensors): https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Qwen 3.6 (27B dense vs 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Página del modelo en Inferix: https://inferix.co/models/wangzhang/Qwen3.6-35B-A3B-abliterated-GGUF
- Página del modelo en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
