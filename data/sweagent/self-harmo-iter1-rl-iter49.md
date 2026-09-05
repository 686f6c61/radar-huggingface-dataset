# sweagent/self-harmo-iter1-rl-iter49

## Resumen

El modelo `sweagent/self-harmo-iter1-rl-iter49` es un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) del modelo multimodal `Qwen/Qwen3.5-35B-A3B-Base`, publicado por el usuario `sweagent`. El nombre sugiere una iteración (iter49) de un proceso de entrenamiento de refuerzo denominado "self-harmo" (posiblemente autoarmonización), aunque el autor no documenta el objetivo concreto ni el proceso seguido. El modelo hereda la arquitectura híbrida eficiente del base: una mezcla de expertos (MoE) con capas de Gated DeltaNet y atención con compuertas, más un codificador visual, y está orientado a tareas de texto e imagen. Con 68.164.077.424 parámetros totales y 3.000 millones activos, ofrece un equilibrio entre capacidad y eficiencia computacional. La ventana de contexto nativa es de 262.144 tokens, ampliable hasta aproximadamente 1.010.000, y el modelo base soporta 201 idiomas. La ausencia de documentación específica del fine-tuning limita la evaluación de sus capacidades reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrido con Gated DeltaNet + Gated Attention y MoE sparse (según modelo base) |
| Parámetros totales | 68.164.077.424 (según safetensors) |
| Parámetros activos | 3.000 millones (3B, según modelo base Qwen3.5-35B-A3B) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta ~1.010.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible para el fine-tuning; el modelo base soporta 201 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura híbrida que combina Gated Delta Networks (atención lineal) con atención de compuertas y una mezcla de expertos sparse. La estructura de capas es 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)), con 40 capas en total. Dispone de 256 expertos, de los cuales 8 se activan por token más 1 experto compartido, lo que permite mantener un coste de cómputo bajo (3B activos) mientras se mantiene una gran capacidad de almacenamiento (68B totales en el checkpoint). El modelo incluye un codificador visual, por lo que es multimodal (image-text-to-text). Según la documentación del base, el entrenamiento incluyó preentrenamiento y postentrenamiento con RL a escala en entornos de millones de agentes, además de una cobertura multilingüe amplia. El checkpoint `self-harmo-iter1-rl-iter49` es un fine-tuning por refuerzo, pero no se proporciona información sobre el dataset, la función de recompensa ni el proceso de entrenamiento. Se desconoce si el fine-tuning ha modificado la arquitectura o la capa visual.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base, que muestra resultados competitivos en benchmarks de conocimiento como MMLU-Pro.
- Visión: el pipeline es image-text-to-text, por lo que acepta imágenes como entrada y puede generar texto a partir de ellas.
- Código y agentes: el modelo base está diseñado para tareas de codificación y agentes con razonamiento multi-paso, según la documentación de Qwen3.5.
- Multilingüismo: el modelo base soporta 201 idiomas y dialectos, lo que potencialmente se mantiene en el fine-tuning.
- Tool calling / function calling: no se documenta específicamente para este checkpoint; el modelo base de Qwen3.5 es compatible con herramientas a través de la API oficial, pero no hay datos concretos para este fine-tuning.
- Eficiencia: la activación sparse de 3B parámetros permite una inferencia más rápida que un modelo denso de tamaño equivalente.

## Casos de uso

- Asistentes multimodales en español: gracias a la entrada de imagen y texto, el modelo puede utilizarse para responder preguntas sobre capturas de pantalla, diagramas o documentos escaneados, siempre que se cuantice adecuadamente para el hardware disponible.
- Automatización de tareas de agente: con soporte de razonamiento multi-paso y visión, es adecuado para entornos de agente que necesitan interpretar interfaces gráficas y ejecutar acciones, como navegación web o uso de aplicaciones.
- Análisis de documentos con formato complejo: la capacidad de procesar imágenes junto con texto permite extraer información de informes, tablas o gráficos en un pipeline de RAG multimodal.
- Traducción y generación multilingüe: si se mantiene la cobertura de 201 idiomas, puede usarse para traducción automática entre lenguas con soporte de contexto largo.
- Asistencia en programación: el modelo base muestra buenos resultados en codificación, por lo que puede integrarse en editores o IDEs para autocompletado y generación de código con contexto de ventana amplio.
- Investigación en RL y adaptación: dado que es un checkpoint de RL iterativo, puede servir como referencia para estudiar el efecto de iteraciones sucesivas de RL sobre un modelo base, aunque sin documentación del proceso su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. La model card del modelo base incluye una tabla comparativa con modelos como GPT-5-mini, GPT-OSS-120B, Qwen3-235B-A22B, Qwen3.5-122B-A10B, Qwen3.5-27B y Qwen3.5-35B-A3B, pero los datos se cortan en la información proporcionada y no corresponden al checkpoint `self-harmo-iter1-rl-iter49`. Por tanto, no se pueden presentar resultados fiables para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en formato safetensors pesa 136,3 GB, por lo que se necesitan al menos 136 GB de VRAM para cargar los pesos en FP16. Con cuantización a 4 bits, la VRAM estimada sería de aproximadamente 34-40 GB, y en 8 bits alrededor de 68-70 GB. Estas cifras son orientativas y dependen del runtime y del contexto.
- GPU recomendadas: para FP16, una GPU con 160 GB+ (A100 80GB en paralelo o H100 80GB en clúster) es necesaria. Con cuantización 4-bit, una A100 80GB o H100 80GB podría alojar el modelo, y una RTX 4090 de 24GB no es suficiente para cargar los pesos completos en 4-bit sin recurrir a técnicas de offloading.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers según la documentación del modelo base. Para despliegue en CPU o GPU de consumo, se puede convertir a GGUF y usar llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones específicas para este checkpoint.

## Comparativa con modelos similares

La comparativa se basa en el modelo base, ya que no hay datos del fine-tuning. Los modelos comparables son Qwen3.5-122B-A10B (MoE de 122B totales y 10B activos) y Qwen3-235B-A22B (MoE de 235B totales y 22B activos). Ambos son alternativas de mayor tamaño dentro de la misma familia. El modelo base Qwen3.5-35B-A3B ofrece menor coste de activación (3B) pero también menor capacidad total. La licencia Apache-2.0 se mantiene en todos ellos. No se dispone de información completa sobre rendimiento comparativo para el checkpoint específico.

| Modelo | Parámetros totales | Parámetros activos | Contexto nativo | Licencia |
|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B (según documentación; 68B en safetensors) | 3B | 262.144 | Apache-2.0 |
| Qwen3.5-122B-A10B | 122B (según nomenclatura) | 10B (según nomenclatura) | no disponible | Apache-2.0 |
| Qwen3-235B-A22B | 235B (según nomenclatura) | 22B (según nomenclatura) | no disponible | no disponible |

Nota: los datos de parámetros de los modelos Qwen3.5-122B y Qwen3-235B se deducen de sus nombres, no de mediciones verificadas en la información disponible.

## Limitaciones y advertencias

- Falta de documentación: el autor no proporciona detalles sobre el dataset, la función de recompensa ni el proceso de RL del fine-tuning, lo que dificulta evaluar la fiabilidad y el alcance de las modificaciones.
- Sin benchmarks propios: no existen resultados de evaluación para este checkpoint; cualquier afirmación sobre su rendimiento se basa en el modelo base, que puede no reflejar el comportamiento del fine-tuning.
- Posible reducción de generalización: un entrenamiento de RL en un dominio concreto puede degradar el rendimiento en tareas fuera de ese dominio.
- Riesgo de alucinación: al igual que todos los modelos de lenguaje de gran tamaño, puede generar contenido plausible pero incorrecto, especialmente sin verificación externa.
- Sesgos: no se han evaluado sesgos en este fine-tuning; el modelo base puede heredar sesgos de los datos de preentrenamiento.
- Limitaciones de contexto: aunque el contexto nativo es de 262.144 tokens, el rendimiento en ventanas muy largas puede degradarse y requiere hardware con mucha memoria.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia original de Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sweagent/self-harmo-iter1-rl-iter49
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Página de Qwen Chat: https://chat.qwen.ai
- Referencia a la API de Alibaba Cloud Model Studio: https://modelstudio.alibabacloud.com/
