# Yuanshi123/plz-ps-sft

## Resumen

El modelo `Yuanshi123/plz-ps-sft`, identificado internamente como PrimeSeeker-30B-sft, es un checkpoint privado de ajuste fino (SFT) desarrollado por el usuario Yuanshi123. Está basado en el modelo Qwen/Qwen3-30B-A3B-Thinking-2507 y ha sido afinado específicamente para trayectorias de agente de búsqueda profunda (deep-search) con razonamiento de uso de herramientas (tool-use reasoning). El modelo se creó el 18 de agosto de 2026 y su repositorio ocupa 61,1 GB.

La relevancia de este modelo radica en su especialización en tareas de búsqueda profunda y razonamiento con herramientas, un área de creciente interés en el desarrollo de agentes autónomos. Al estar basado en Qwen3-30B-A3B-Thinking-2507, hereda una arquitectura MoE (Mixture of Experts) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos, lo que permite un equilibrio entre capacidad y eficiencia computacional.

El modelo se distribuye bajo licencia "other" (no especificada en detalle) y está marcado como privado en HuggingFace. La model card indica que debe mantenerse privado hasta que se complete la revisión de licencias y gobernanza de datos del proyecto. No se dispone de información sobre idiomas soportados, contexto máximo ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-30B-A3B-Thinking-2507 |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | 3,0 B (estimado, heredado del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-30B-A3B-Thinking-2507, un modelo MoE (Mixture of Experts) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. Esta arquitectura de mezcla de expertos permite activar solo una fracción de los parámetros en cada paso de inferencia, lo que reduce significativamente el coste computacional en comparación con un modelo denso de tamaño equivalente.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el modelo base, especializado en trayectorias de agente de búsqueda profunda con razonamiento de uso de herramientas. Esto implica que el modelo ha sido entrenado para seguir secuencias de razonamiento multi-paso en las que debe decidir qué herramientas utilizar, interpretar sus resultados y continuar el razonamiento hasta alcanzar una conclusión. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional mediante el pipeline de text-generation de transformers.
- Razonamiento de uso de herramientas (tool-use reasoning) para trayectorias de agente de búsqueda profunda.
- Razonamiento multi-paso para tareas de búsqueda de información complejas.
- Capacidades heredadas del modelo base Qwen3-30B-A3B-Thinking-2507, que incluyen modo thinking (razonamiento explícito) y generación de texto estándar.
- Soporte de endpoints compatible según las etiquetas del repositorio.
- No se dispone de información sobre capacidades multimodales, audio o visión.

## Casos de uso

- Agentes de búsqueda de información profunda: el modelo puede integrarse en sistemas de agentes que necesitan realizar búsquedas multi-paso en bases de conocimiento, consultar APIs externas y sintetizar resultados de forma razonada.
- Razonamiento con herramientas en pipelines de automatización: puede utilizarse para decidir dinámicamente qué herramientas invocar (calculadoras, buscadores, bases de datos) en función de la consulta del usuario.
- Asistentes de investigación asistida: para tareas que requieren descomponer una pregunta compleja en sub-preguntas, buscar información relevante y componer una respuesta final coherente.
- Sistemas de recuperación aumentada por generación (RAG) avanzados: el razonamiento de uso de herramientas permite al modelo decidir cuándo consultar fuentes externas y cómo integrar la información recuperada.
- Desarrollo de agentes autónomos para análisis de datos: el modelo puede guiar la exploración de datos, la generación de consultas y la interpretación de resultados en entornos de ciencia de datos.
- Automatización de tareas de soporte técnico: con su capacidad de razonamiento multi-paso, puede descomponer problemas técnicos en pasos de diagnóstico y consultar manuales o bases de conocimiento según sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Al ser un checkpoint privado en fase de revisión, no hay datos públicos de rendimiento más allá de los que pueda heredar del modelo base Qwen3-30B-A3B-Thinking-2507.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo MoE de 30,5 B parámetros totales con 3 B activos, los requisitos de VRAM dependen de la precisión de los pesos. En FP16 o BF16, el modelo requiere aproximadamente 61 GB de VRAM para alojar todos los parámetros. Con cuantización a 8 bits se reduciría a unos 31 GB, y a 4 bits a unos 16 GB.
- GPU recomendadas: para ejecutar el modelo en FP16 se necesitan GPUs profesionales como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, aunque no cabría en FP16). Con cuantización de 4 bits podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- En consumer GPU: es viable únicamente con cuantización agresiva (4 bits) y posiblemente con offloading de capas a CPU.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede desplegarse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponibles. Al ser una arquitectura MoE con 3 B parámetros activos, la latencia por token debería ser significativamente menor que la de un modelo denso de 30 B, pero no se dispone de mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un checkpoint privado basado en Qwen3-30B-A3B-Thinking-2507, por lo que las comparaciones más relevantes serían con el propio modelo base y con otros modelos MoE de tamaño similar como DeepSeek-V3 o Mixtral 8x22B. Sin embargo, al no haber benchmarks publicados ni especificaciones detalladas del ajuste fino, cualquier comparativa sería especulativa.

## Limitaciones y advertencias

- Modelo privado: el checkpoint está marcado como privado y la model card indica explícitamente que debe mantenerse así hasta completar la revisión de licencias y gobernanza de datos. Su uso en producción no está autorizado sin dicha revisión.
- Licencia "other" no especificada: no se detallan los términos de uso, lo que impide conocer las restricciones de uso comercial o las obligaciones de atribución.
- Sin datos de evaluación: no hay benchmarks públicos que permitan verificar la calidad del ajuste fino ni comparar su rendimiento con alternativas.
- Sesgos y alucinaciones: al no haber evaluación publicada, se desconocen los sesgos específicos del modelo. Como cualquier modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de búsqueda donde puede inventar fuentes o datos.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingües o con contextos largos.
- Sin garantías de producción: al ser un checkpoint de investigación sin documentación de despliegue ni evaluación de robustez, no se recomienda su uso en entornos de producción sin una validación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yuanshi123/plz-ps-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
