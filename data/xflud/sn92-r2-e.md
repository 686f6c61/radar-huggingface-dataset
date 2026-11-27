# xflud/sn92-r2-e

## Resumen

`xflud/sn92-r2-e` es un fine-tune del modelo `MachinePulseAI/karpo-decision-31B`, publicado por el usuario xflud bajo licencia Apache 2.0 y con acceso restringido (gated) en Hugging Face. El nombre y los tags (`reax`, `bittensor`, `sn92`) lo vinculan al ecosistema de subnets de Bittensor, en concreto a la subnet 92, un entorno de entrenamiento descentralizado donde los modelos se publican como artefactos de ronda (round 2, variante `e`). No se trata, por tanto, de un modelo de propósito general presentado con documentación de producto, sino de un checkpoint derivado de un modelo base ya existente.

El modelo hereda la arquitectura y el tamaño del base: aproximadamente 31.270 millones de parámetros en pesos safetensors, lo que lo sitúa en la franja de los modelos densos de ~31B. Los tags incluyen `gemma4`, lo que sugiere que la familia base podría estar emparentada con la arquitectura Gemma, aunque esta información no está confirmada por ninguna fuente oficial en la documentación disponible. El repositorio ocupa 62,6 GB, coherente con pesos en precisión de 16 bits para ese número de parámetros.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: no hay pipeline declarado, no hay idiomas especificados, no hay benchmarks publicados y el acceso está restringido. Es un artefacto de interés para quienes siguen el ecosistema Bittensor y los fine-tunes derivados de `karpo-decision-31B`, no para quienes buscan un modelo listo para producción con garantías documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tags indican `gemma4`; sin confirmar) |
| Parametros totales | 31.273.088.876 (~31,27B) |
| Parametros activos | No aplica (no hay indicios de MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo solo con safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de los tags del repositorio, que incluyen `gemma4`. Esto apunta a una posible base arquitectónica de la familia Gemma, pero no hay ficha técnica, paper ni model card que lo confirme. El modelo es un fine-tune de `MachinePulseAI/karpo-decision-31B`, del cual tampoco se documentan aquí detalles de arquitectura, número de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF, DPO o similares.

El contexto de publicación (subnet 92 de Bittensor, ronda 2) sugiere un entrenamiento orientado a una tarea o recompensa específica definida por la subnet, pero no se especifica cuál. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Cualquier afirmación al respecto sería especulativa y no se incluye.

## Capacidades

- Generación de texto: capacidad esperable por herencia del modelo base de ~31B, sin confirmación documentada.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado; el campo de idiomas del repo está vacío.
- Capacidades especiales (modo thinking, visión, audio): no documentado.

No se han publicado listas de capacidades verificadas para este checkpoint. La ausencia de pipeline y de model card detallada impide confirmar cualquiera de las capacidades anteriores más allá de la inferencia por tamaño del modelo base.

## Casos de uso

- Evaluación de fine-tunes en el ecosistema Bittensor: el modelo sirve para comparar el efecto de la ronda 2 de la subnet 92 frente a otros checkpoints de la misma familia, siempre que se tenga acceso aprobado al repo gated.
- Investigación sobre destilación y ajuste de modelos de ~31B: útil como punto de partida para estudiar cómo se comporta un fine-tune derivado de `karpo-decision-31B` en tareas específicas, comparándolo con el base.
- Reproducibilidad de experimentos descentralizados: para quienes replican resultados de subnets, este checkpoint es un artefacto de referencia de una ronda concreta.
- Pruebas de integración con safetensors: al publicarse solo en safetensors, es adecuado para pipelines que cargan pesos directamente con `transformers` o `safetensors` y requieren control fino de la carga.
- Base para cuantización propia: al no ofrecer GGUF ni otras cuantizaciones, el usuario puede generar sus propias versiones (por ejemplo, con llama.cpp o GPTQ) a partir de los pesos originales, asumiendo el coste de cómputo.
- Estudio de licencias y acceso restringido: caso práctico para analizar cómo se distribuyen modelos gated con licencia Apache 2.0 en Hugging Face y qué implica para la cadena de derivados.

En todos los casos, el uso en producción requeriría validación previa, dado que no hay benchmarks ni documentación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 62 GB solo para pesos, más overhead de activaciones y KV cache; se necesitan GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- VRAM estimada en cuantización de 8 bits: aproximadamente 31-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: aproximadamente 16-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090, siempre que el usuario genere la cuantización, ya que el repo no la incluye.
- GPU recomendadas: A100 80 GB o H100 para fp16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits con cuantización propia.
- Despliegue: `transformers` con safetensors como opción directa; vLLM y TGI si se confirma compatibilidad arquitectónica; llama.cpp/Ollama solo tras convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| xflud/sn92-r2-e | ~31,27B | No disponible | Apache 2.0 | Gated | Fine-tune de karpo-decision-31B, ecosistema Bittensor |
| MachinePulseAI/karpo-decision-31B | ~31B (por nombre) | No disponible | No disponible | No disponible | Modelo base del que deriva |
| Gemma 2 27B (referencia de familia) | 27B | 8K | Gemma license | Abierto | Comparable en tamaño; arquitectura y licencia distintas |
| Qwen2.5 32B (referencia de tamaño) | 32,5B | 128K | Apache 2.0 | Abierto | Alternativa densa de tamaño similar con documentación completa |

La comparación con Gemma 2 27B y Qwen2.5 32B es orientativa por rango de parámetros; no implica equivalencia de rendimiento ni de arquitectura, y no se dispone de datos que permitan comparar resultados.

## Limitaciones y advertencias

- Ausencia total de model card, benchmarks e idiomas declarados: no hay base documental para evaluar su calidad.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso en pipelines automatizados.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede acotarse.
- Sesgos: desconocidos; no hay información sobre datos de entrenamiento ni sobre procesos de alineación.
- Licencia Apache 2.0 declarada, pero el modelo base (`karpo-decision-31B`) podría tener condiciones adicionales no reflejadas aquí; conviene verificar la cadena de licencias antes de uso comercial.
- Contexto e idiomas no documentados: no debe asumirse una ventana larga ni cobertura multilingüe.
- Origen en subnet de Bittensor: el checkpoint puede estar optimizado para una recompensa concreta y no para uso general.
- Sin cuantizaciones oficiales: el coste de adaptación al hardware recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/xflud/sn92-r2-e
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Bittensor (ecosistema referenciado en tags): https://bittensor.com
- No se han encontrado papers, blogs, repos ni demos adicionales en la información disponible.
