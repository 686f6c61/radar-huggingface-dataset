# zzz32768/ornith-1.5-35B-A3B-heretic-APEX-I-quality-GGUF

## Resumen

Ornith-1.5-35B-A3B-heretic-APEX-I-quality-GGUF es una versión "decensored" (abliterated) del modelo base ornith-ai/Ornith-1.5-35B-A3B, creada por el usuario zzz32768 mediante la herramienta Heretic v1.4.0. El proceso de abliteración elimina parcialmente las capas de rechazo de contenido del modelo original, reduciendo sustancialmente su alineación de seguridad. El resultado es un modelo de generación de texto que conserva las capacidades técnicas del original pero con una resistencia mucho menor a producir contenido sensible, ofensivo o inapropiado.

El modelo base pertenece a la familia Ornith-1.5, desarrollada por ornith-ai como un avance hacia modelos de fundación mediante auto-mejora de extremo a extremo. Ornith-1.5-35B-A3B es un modelo de tipo Mixture-of-Experts (MoE) con aproximadamente 35.000 millones de parámetros totales, de los cuales solo ~3.000 millones se activan por token, y está construido sobre la base de Qwen3.5 y Gemma4 con entrenamiento continuado, mid-training y post-training con refuerzo. La versión heretic se distribuye en formato GGUF, lo que permite su ejecución en entornos de CPU y GPU con llama.cpp, Ollama y otros motores compatibles.

La relevancia de este modelo radica en su utilidad para investigación en seguridad de IA, red-teaming y estudios de alineación, donde se necesita un modelo que genere contenido sin restricciones para evaluar riesgos y diseñar salvaguardas. No está recomendado para despliegue en servicios públicos o entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, basada en Qwen3.5 y Gemma4 |
| Parámetros totales | ~35B (35B-A3B) |
| Parámetros activos | ~3B |
| Longitud de contexto | Hasta 256k tokens |
| Tipos de cuantización | GGUF (cuantizaciones específicas no disponibles en la información proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE que activa aproximadamente 3.000 millones de parámetros por token, con un total de ~35.000 millones. La arquitectura es transformer estándar con atención completa, entrenada sobre una mezcla de datos que incluye Qwen3.5 y Gemma4 como punto de partida, seguida de fases de continuación de pretraining, mid-training y post-training con reinforcement learning. El modelo base presenta capacidades de razonamiento explícito: la respuesta del asistente comienza con un bloque de pensamiento (`thinking...`) antes de la respuesta final, y soporta tool calling mediante bloques `<tool_call>`.

La versión heretic se ha obtenido mediante abliteration con Heretic v1.4.0, que aplica una LoRA adapter con preservación de norma de fila (row-norm preservation). Los parámetros de abliteration incluyen un `direction_scope` global con `direction_index` 32.01, normalización de fila completa con rango LoRA 3, y pesos máximos en las proyecciones `attn.o_proj` (1.37) y `mlp.down_proj` (1.45). Este proceso reduce drásticamente la probabilidad de que el modelo rechace peticiones de contenido sensible.

## Capacidades

- Generación de texto con razonamiento explícito (thinking mode): el modelo produce una cadena de pensamiento interna antes de la respuesta final.
- Generación de código y agentes: el modelo base supera a Qwen 3.6-35B en benchmarks de codificación y agentes (Terminal-Bench 2.1: 67.8 vs 64.2 del Ornith-1.0).
- Tool calling / function calling: soporta bloques `<tool_call>` que se pueden exponer como llamadas a herramientas estilo OpenAI.
- Razonamiento multi-step y planificación: el modelo base fue entrenado con reinforcement learning para tareas complejas de agentes.
- Capacidades multilingües: no disponible en la información proporcionada, aunque al estar basado en Qwen3.5 y Gemma4 es probable que soporte múltiples idiomas.
- Capacidad de "uncensored" / "decensored": tras la abliteration, el modelo reduce significativamente los rechazos por contenido prohibido, lo que permite generar contenido que el modelo base bloquearía.

## Casos de uso

- Investigación en seguridad de IA: el modelo es adecuado para evaluar la eficacia de técnicas de abliteration y medir el impacto en el comportamiento de rechazo, comparando con el modelo base. Se puede usar para generar datasets de evaluación de jailbreaks y medir la tasa de éxito de ataques adversariales.
- Red-teaming de sistemas de moderación: permite probar los límites de sistemas de filtrado de contenido generado por IA, identificando debilidades en los sistemas de moderación de texto.
- Estudios de alineación: investigación académica sobre cómo los modelos internalizan las políticas de seguridad y cómo se pueden eliminar o restaurar mediante técnicas de interpretabilidad (como el análisis de dirección en el espacio de activaciones).
- Benchmarking de robustez: evaluación comparativa de la degradación de capacidades técnicas (razonamiento, código, matemáticas) tras la ablación de la alineación de seguridad.
- Desarrollo de técnicas de mitigación: investigación sobre cómo detectar y contrarrestar modelos ablated, mediante técnicas de detección de contenido o restauración de alineación.
- Generación de contenido de ficción sin restricciones: para proyectos de escritura creativa donde el modelo base rechaza temáticas sensibles (violencia explícita, contenido adulto en ficción), siempre con responsabilidad y fuera de entornos de producción.

## Benchmarks y rendimiento

La información de benchmarks disponible en la documentación es parcial. La model card del modelo base (Ornith-1.5-35B-A3B) presenta una tabla comparativa que incluye Terminal-Bench 2.1, pero la tabla está incompleta en la información proporcionada. Los datos disponibles son:

| Benchmark | Ornith-1.5-35B-A3B (base) | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 67.8 | 64.2 | — | — | — | — |

El resto de la tabla (MMLU, HumanEval, GSM8K, etc.) no está disponible en la información proporcionada. Para la versión heretic, la model card solo reporta métricas de abliteration:

| Métrica | Modelo heretic | Modelo original |
|---|---|---|
| Keywords (tasa de rechazo) | 34/104 | 100/104 |
| KL divergence | 0.0856933 | 0 (por definición) |

La métrica "Keywords" indica que el modelo heretic rechaza solo 34 de 104 palabras clave sensibles probadas, frente a 100/104 del original, lo que confirma la reducción sustancial de la alineación de seguridad.

## Requisitos de hardware

- VRAM estimada: al ser un MoE de 35B con 3B activos, la VRAM necesaria depende de la cuantización. Para cuantizaciones Q4_K_M (~20 GB de pesos), se puede ejecutar en GPUs de consumo de 24 GB (RTX 3090, RTX 4090). Para Q8_0 (~35 GB), se necesita una GPU de 48 GB o más (A6000, A100 40GB) o múltiples GPUs.
- El repo de DGX Spark indica que el modelo base puede ejecutarse en una DGX Spark (GB10, ~128 GB de memoria unificada) con cuantización NVFP4 y hasta 256k de contexto.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con el modelo base en formato safetensors), TGI. El formato GGUF permite ejecución en CPU y GPU de consumo.
- Latencia y throughput: no se han publicado datos específicos para esta versión GGUF. Como referencia, un MoE de 3B activos por token tiene throughput sustancialmente superior a un modelo denso de 35B, típicamente 3-5 veces más rápido por token en hardware equivalente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | MoE | 35B | 3B | 256k | MIT |
| Ornith-1.5-35B-A3B-heretic (este modelo) | MoE | 35B | 3B | 256k | MIT |
| Qwen 3.6-35B-A3B | MoE | 35B | 3B | no disponible | Apache 2.0 (probable) |
| Gemma 4-31B | Denso | 31B | 31B | no disponible | Gemma license |

En rendimiento, el modelo base Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de codificación y agentes según la model card, y supera ampliamente a Gemma 4-31B en agentes de codificación. La versión heretic mantiene las mismas capacidades técnicas pero con la alineación de seguridad reducida. No hay datos de benchmarks de la versión heretic más allá de las métricas de abliteration.

## Limitaciones y advertencias

- El modelo ha sido sometido a una reducción sustancial de su alineación de seguridad. Es más probable que genere contenido dañino, inexacto, sesgado, ofensivo o inapropiado que el modelo base.
- No debe desplegarse en servicios públicos o entornos de usuario final. El uso previsto es exclusivamente para investigación y experimentación (seguridad, alineación, red-teaming).
- Todos los resultados deben tratarse como no fiables y verificarse de forma independiente antes de cualquier uso.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- La licencia MIT permite uso comercial, pero la advertencia del autor recomienda explícitamente no desplegar en producción. La responsabilidad legal y ética del uso recae en el usuario.
- No se han publicado datos de rendimiento técnico (MMLU, HumanEval, etc.) para la versión heretic, por lo que no se puede cuantificar la degradación de capacidades tras la ablación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzz32768/ornith-1.5-35B-A3B-heretic-APEX-I-quality-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Repo de DGX Spark (Mia AI Lab): https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark/blob/main/README.md
- Heretic project: https://heretic-project.org
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
