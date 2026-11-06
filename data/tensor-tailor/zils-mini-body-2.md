# tensor-tailor/zils-mini-body-2

## Resumen

zils-mini-body-2 es un modelo de decisión de 4.539 millones de parámetros (4,54 B) desarrollado por el usuario tensor-tailor para el pool de modelos "d3-mini" de Zils, dentro de la subred 127 de Bittensor. Se construye sobre el chasis Qwen3.5-4B (tensores de lenguaje y visión en bf16) y parte de la media uniforme en fp32 de tres modelos de decisión: torchcast-ai/torchcast-decision-4b, Maincode/Matilda-Decision-v1-Mini y perplexity-ai/pplx-decider-flash-v1.2, todos ellos con licencia Apache-2.0.

Sobre esa media se aplica un ajuste fino con LoRA (rango 16, alpha 32) dirigido a las proyecciones de atención y Gated-DeltaNet de las 32 capas de lenguaje (152 matrices), que posteriormente se fusiona en los pesos. El checkpoint publicado corresponde al 75 % de la única época de entrenamiento (paso 2.295 de 3.060). La diferencia principal respecto a su hermano zils-mini-body-1 es que este cuerpo no utiliza filas de destilación de profesor: todo el entrenamiento se basa en etiquetas duras de conjuntos de datos públicos y en respuestas calculadas.

El modelo está pensado para tareas de decisión y razonamiento de formato corto (elección de herramienta, NLI, recuperación, preguntas de resultado con fecha), no como un modelo conversacional general. Su relevancia es acotada: se trata de una contribución a un pool competitivo de Bittensor, con cero descargas y cero "likes" en el momento del análisis, y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B con proyecciones Gated-DeltaNet (chasis zils-ai/d3-mini-4.5b-v1); incluye tensores de visión |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento descartó filas de más de 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bf16 y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer con proyecciones Gated-DeltaNet en las capas de lenguaje, sobre el que Zils define un chasis de 4,5 B con tensores tanto de lenguaje como de visión. El modelo final es el resultado de dos etapas: primero, una media uniforme en fp32 de todos los tensores del chasis entre los tres modelos base citados; segundo, un ajuste fino con LoRA (rango 16, alpha 32, dropout 0,05, learning rate 1e-4 con warm-up lineal de 50 pasos y decaimiento coseno, batch 8 con acumulación de gradiente 2, semilla 4343) aplicado exclusivamente a 152 matrices de atención y Gated-DeltaNet de las 32 capas de lenguaje. El LoRA se fusiona en los pesos y se almacena en bf16.

El entrenamiento combina entropía cruzada sobre las filas etiquetadas con una regularización KL hacia las probabilidades precalculadas de la media de partida (14.817 filas de anclaje, con etiquetas ignoradas). No hay término de destilación de profesor. De las 34.687 filas de entrada, 548 se descartaron por superar los 2.048 tokens (sin truncar), quedando 34.139 filas cargadas. La composición de datos incluye 19.583 filas de razonamiento/NLI/recuperación/lenguaje/herramientas con etiquetas duras de fuentes públicas, 8.604 preguntas de resultado con fecha (ediciones de Wikipedia en 9 idiomas, Wikidata y categorías de arXiv), 4.500 preguntas de herramientas generadas con respuestas calculadas, 2.000 filas de GSM8K y 14.819 preguntas de regularización. La desviación relativa de los tensores de lenguaje respecto a Qwen3.5-4B es de 0,02792, dentro del límite de 0,15 que impone Zils.

## Capacidades

- Razonamiento de formato corto y clasificación: NLI, elección entre opciones, preguntas de resultado con fecha y recuperación de información.
- Elección y puntuación de herramientas (tool calling): selección de herramienta, decisión de no usar herramienta y puntuación de argumentos, entrenado explícitamente con 4.500 filas generadas para ello.
- Razonamiento aritmético básico: incluye 2.000 filas del conjunto de entrenamiento de GSM8K.
- Procesamiento multimodal: el chasis incluye tensores de visión de Qwen3.5-4B, aunque la model card no detalla tareas de visión específicas ni su rendimiento.
- Capacidades multilingües: no documentadas; los datos de entrenamiento incluyen ediciones de Wikipedia en 9 idiomas, pero no se especifica el soporte lingüístico resultante.
- No se documenta soporte de agentes multi-paso, modo "thinking" explícito ni decodificación especulativa.

## Casos de uso

- Clasificación y enrutamiento de consultas: el modelo puede decidir entre opciones discretas (por ejemplo, qué herramienta invocar o si no invocar ninguna) gracias a su entrenamiento específico en 4.500 preguntas de herramientas con respuestas calculadas.
- Puntuación de argumentos en pipelines de function calling: puede evaluar la corrección de los argumentos generados por otro modelo antes de ejecutar una llamada a API, actuando como verificador en un sistema de dos etapas.
- Verificación de hechos con fecha de corte: su entrenamiento con 8.604 preguntas de resultado resueltas antes del 20 de octubre de 2026 lo hace adecuado para tareas de resolución de afirmaciones sobre eventos datados (ediciones de Wikipedia, Wikidata, listados de arXiv).
- Inferencia de relación textual (NLI): útil en pipelines de deduplicación semántica o detección de contradicciones en corpus documentales, gracias a las 19.583 filas de razonamiento y NLI con etiquetas duras.
- Razonamiento aritmético de un paso: resolución de problemas de GSM8K en entornos educativos o de validación de cálculos simples, aunque sin garantías de robustez más allá de ese dominio.
- Selección de modelo en un pool competitivo: como cuerpo participante en el pool d3-mini de Bittensor, puede desplegarse para comparar su rendimiento relativo frente a otros cuerpos del mismo chasis en tareas de decisión.
- Filtrado y priorización en recuperación de información: puede puntuar la relevancia de pasajes recuperados antes de pasarlos a un modelo generador de mayor tamaño, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del proceso de selección de checkpoint: una ganancia media de 1,82928 en los dos conjuntos de desarrollo primarios del autor, frente a 1,82879 del cuerpo de época final. No se especifica qué miden esas cifras ni son comparables con benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 11 y 13 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,3-2,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- GPU de consumo: cabe en tarjetas de 12 GB o más en bf16 con contexto corto; en cuantización de 4 bits podría caber en GPUs de 8 GB, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `trust_remote_code=True` en Transformers; vLLM, TGI y llama.cpp no están confirmados como compatibles con esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-body-2 | 4,54 B | no disponible | Apache-2.0 | Decisión, tool calling, NLI | HuggingFace, 0 descargas |
| zils-mini-body-1 | no disponible | no disponible | Apache-2.0 | Decisión, con destilación de profesor | HuggingFace (mismo autor) |
| Qwen3.5-4B | 4 B (aproximado) | no disponible | Apache-2.0 | Modelo base generalista | HuggingFace |
| torchcast-decision-4b | ~4 B | no disponible | Apache-2.0 | Decisión | HuggingFace |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | Apache-2.0 | Decisión | HuggingFace |
| perplexity-ai/pplx-decider-flash-v1.2 | no disponible | no disponible | Apache-2.0 | Decisión | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; los datos de entrenamiento provienen de fuentes públicas heterogéneas (Wikipedia, Wikidata, arXiv, tasksource) con posibles sesgos de cobertura geográfica y lingüística.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el entrenamiento con etiquetas duras y respuestas calculadas mitiga parcialmente el problema en tareas de decisión, pero no lo elimina en generación libre.
- Contexto limitado: las filas de entrenamiento de más de 2.048 tokens se descartaron, por lo que el modelo no está entrenado para secuencias largas aunque el chasis base las soporte.
- Idiomas: no se especifica el soporte multilingüe resultante; el uso en idiomas distintos del inglés no está garantizado.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- Madurez: cero descargas y cero "likes" en el momento del análisis; sin validación externa ni benchmarks públicos.
- Dependencia del ecosistema Zils: el modelo está diseñado para el pool d3-mini de Bittensor y su formato de evaluación; su utilidad fuera de ese contexto no está demostrada.
- Datos de entrenamiento reutilizados: 15.104 filas provienen del feed M3 del autor y no son nuevas, lo que limita la comparación limpia con otros cuerpos del pool.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensor-tailor/zils-mini-body-2
- Modelo base torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Chasis zils-ai/d3-mini-4.5b-v1: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Modelo padre Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano zils-mini-body-1: https://huggingface.co/tensor-tailor/zils-mini-body-1
