# YichengWangCA/R1-Distill-Qwen-14B-AIME-DPO-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) publicado por YichengWangCA, diseñado para ajustar el modelo base DeepSeek-R1-Distill-Qwen-14B. El nombre del adaptador sugiere que fue entrenado con el conjunto de datos AIME (American Invitational Mathematics Examination) mediante optimización con DPO (Direct Preference Optimization), aunque no se proporcionan detalles adicionales en la model card. El adaptador tiene un tamaño de 0.6 GB y se distribuye en formato safetensors, compatible con la librería PEFT de Hugging Face.

El modelo base, DeepSeek-R1-Distill-Qwen-14B, es una versión destilada de DeepSeek-R1, basada en la arquitectura Qwen 2.5 de 14 mil millones de parámetros. Fue entrenado con 800 mil muestras generadas por DeepSeek-R1 para transferir capacidades de razonamiento, especialmente en matemáticas y código. Este adaptador LoRA pretende refinar aún más esas capacidades en problemas de tipo AIME, aunque no hay evidencia pública de resultados o evaluaciones que lo confirmen.

La relevancia de este adaptador radica en que ofrece una vía de ajuste eficiente en parámetros sobre un modelo de razonamiento ya optimizado, permitiendo a desarrolladores e investigadores adaptar el modelo a dominios específicos sin necesidad de un fine-tuning completo. Sin embargo, la falta de documentación y de métricas de evaluación limita su utilidad práctica hasta que se publiquen más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre DeepSeek-R1-Distill-Qwen-14B (base: Qwen 2.5, transformer denso) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se especifica) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, típicamente 32 768 tokens en Qwen 2.5) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente inglés y chino, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre DeepSeek-R1-Distill-Qwen-14B, un modelo transformer denso de 14 mil millones de parámetros derivado de Qwen 2.5. El modelo base fue destilado a partir de DeepSeek-R1 utilizando 800 mil muestras de razonamiento generadas por el propio R1, con el objetivo de transferir capacidades de razonamiento complejo, especialmente en matemáticas y código. La técnica de destilación emplea cold-start data y refuerzo posterior, según la documentación de DeepSeek.

En cuanto al adaptador, el nombre indica un entrenamiento con DPO sobre problemas AIME, pero no se proporcionan hiperparámetros, composición del dataset, número de pasos, ni detalles sobre el proceso de entrenamiento. La model card no incluye información sobre el régimen de entrenamiento (precisión mixta, optimizador, etc.). Tampoco se especifica si se aplicó alguna técnica adicional como decodificación especulativa o atención lineal. Toda la información sobre el entrenamiento del adaptador se considera no disponible.

## Capacidades

- Razonamiento matemático: el adaptador está orientado a problemas de tipo AIME, por lo que se espera que mejore el rendimiento en problemas de competición matemática, aunque no hay métricas que lo confirmen.
- Razonamiento general: hereda las capacidades de razonamiento del modelo base DeepSeek-R1-Distill-Qwen-14B, que incluyen cadenas de pensamiento y resolución de problemas complejos.
- Generación de código: el modelo base tiene buen rendimiento en tareas de programación, y el adaptador podría mantener o mejorar estas capacidades, aunque no se ha verificado.
- Tool calling y function calling: no se menciona soporte específico en el adaptador; el modelo base no tiene soporte nativo de tool calling documentado.
- Capacidades multilingües: no se especifican para el adaptador; el modelo base soporta principalmente inglés y chino.
- Modo thinking: el modelo base DeepSeek-R1-Distill-Qwen-14B es capaz de generar razonamiento explícito antes de responder, pero no se confirma si el adaptador mantiene este comportamiento.

## Casos de uso

- Resolución de problemas de competición matemática: el adaptador podría emplearse para generar soluciones paso a paso a problemas de nivel AIME, útil en plataformas educativas o de preparación de exámenes. Su entrenamiento con DPO sobre AIME sugiere una especialización en este dominio, aunque sin benchmarks no se puede garantizar la mejora.
- Asistente de tutoría en matemáticas: integrado en un sistema de chat, el modelo podría explicar razonamientos matemáticos complejos a estudiantes, aprovechando la capacidad de razonamiento del modelo base.
- Generación de código con razonamiento: para tareas de programación que requieren planificación y deducción lógica, el adaptador podría ofrecer soluciones más robustas que el modelo base, aunque no hay evidencia.
- Investigación en fine-tuning eficiente: como ejemplo de adaptación LoRA sobre un modelo de razonamiento, puede servir como caso de estudio para investigadores interesados en técnicas de ajuste con pocos parámetros.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador pequeño (0.6 GB), permite experimentar con el modelo base sin necesidad de ajustar todos los parámetros, reduciendo requisitos de hardware.
- Evaluación de DPO en dominios específicos: el adaptador puede utilizarse para comparar el efecto de DPO frente a otros métodos de alineación en tareas matemáticas, aunque se necesitaría más documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación, ni comparaciones con el modelo base u otros adaptadores. No se puede confirmar si el adaptador mejora el rendimiento en AIME o en otras tareas.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base completo (DeepSeek-R1-Distill-Qwen-14B) más el adaptador. El modelo base en precisión fp16 ocupa aproximadamente 28 GB de VRAM. Con cuantización (por ejemplo, 4 bits) se puede reducir a unos 8-10 GB, pero el adaptador no incluye cuantización propia.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs con al menos 32 GB de VRAM (A100, RTX 4090 con 24 GB no es suficiente en fp16, pero sí con cuantización). Con cuantización 4 bits, una RTX 3090 o RTX 4090 (24 GB) podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, mediante bitsandbytes o GPTQ) en GPUs de 16-24 GB, aunque el adaptador no proporciona versiones cuantizadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, todos compatibles con modelos base de Qwen y con adaptadores LoRA mediante PEFT. Para cargar el adaptador, se puede usar el pipeline de transformers con `peft`.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos similares, ya que no hay datos de rendimiento ni especificaciones detalladas. Se puede comparar el modelo base con alternativas, pero el adaptador en sí no tiene métricas. Por tanto, la comparativa se limita al modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B (base) | 14B | 32 768 | MIT (según DeepSeek) | Hugging Face |
| Qwen 2.5 14B | 14B | 32 768 | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128 000 | Llama 3.1 Community License | Hugging Face |

El adaptador no modifica la arquitectura base, por lo que su comparativa real dependería de los resultados en AIME, que no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos del adaptador. El modelo base puede heredar sesgos de los datos de entrenamiento de Qwen y DeepSeek, pero no se ha evaluado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos si el razonamiento falla.
- Limitaciones de contexto: la longitud de contexto no se especifica para el adaptador; se asume la del modelo base (32 768 tokens), pero no se garantiza.
- Restricciones de licencia: la licencia del adaptador no está disponible. El modelo base DeepSeek-R1-Distill-Qwen-14B se distribuye bajo licencia MIT, pero el adaptador podría tener condiciones diferentes. Se recomienda contactar al autor antes de uso comercial.
- Carencia de documentación: la model card está vacía en casi todos los campos, lo que impide conocer el proceso de entrenamiento, los datos utilizados y las evaluaciones. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de sobreajuste: al estar entrenado específicamente en AIME, podría degradar el rendimiento en otras tareas fuera de ese dominio, aunque no hay evidencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/YichengWangCA/R1-Distill-Qwen-14B-AIME-DPO-LoRA
- Modelo base DeepSeek-R1-Distill-Qwen-14B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Versión de unsloth del modelo base: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-14B
- Página de NVIDIA NIM para el modelo base: https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-qwen-14b
- Artículo de referencia sobre estimación de emisiones (citado en la model card): https://arxiv.org/abs/1910.09700
