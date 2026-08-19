# Thamo31/Llama-3.2-3B-4bit-classification-routing-merged

## Resumen

El modelo `Thamo31/Llama-3.2-3B-4bit-classification-routing-merged` es un ajuste fino (fine-tuning) del modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, desarrollado por el usuario Thamo31. Según la model card, fue entrenado con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso de entrenamiento optimizado para velocidad y eficiencia. El nombre sugiere una especialización en tareas de clasificación y enrutamiento (routing), aunque la documentación no proporciona detalles sobre el dataset ni los objetivos concretos del entrenamiento.

Con aproximadamente 3.200 millones de parámetros y una cuantización de 4 bits, este modelo está pensado para ejecutarse en entornos con recursos limitados, manteniendo la capacidad conversacional y de generación de texto del Llama 3.2 3B Instruct. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo hace atractivo para integraciones en producción. Sin embargo, al carecer de métricas publicadas y de una descripción detallada de sus capacidades específicas, su adopción requiere una evaluación empírica previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 3B) |
| Parametros totales | 3.212.749.824 (3,2B) |
| Parametros activos | no disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 soporta 128K, pero no se confirma en este fine-tuning) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 3B, un transformer decoder-only con atención causal estándar. El proceso de fine-tuning se realizó partiendo de la versión ya cuantizada en 4 bits (`unsloth/Llama-3.2-3B-Instruct-bnb-4bit`), utilizando la biblioteca Unsloth para acelerar el entrenamiento y TRL (Transformer Reinforcement Learning) de Hugging Face. No se especifica si se emplearon técnicas como RLHF o DPO, ni la composición del dataset de entrenamiento. El nombre "classification-routing" sugiere que el ajuste se orientó a tareas de clasificación de texto y enrutamiento de consultas, pero no hay información pública sobre los datos ni los hiperparámetros utilizados.

## Capacidades

- Generación de texto conversacional: hereda las capacidades instructivas del modelo base Llama 3.2 3B Instruct, incluyendo diálogo multi-turno y respuestas a instrucciones.
- Clasificación y enrutamiento: según el nombre del modelo, está potencialmente optimizado para clasificar entradas y dirigirlas a destinos o categorías, aunque no se aportan ejemplos ni métricas.
- Multilingüismo: limitado al inglés (idioma declarado en la model card).
- Tool calling y agentes: no se menciona soporte específico; el modelo base Llama 3.2 3B Instruct no incluye tool calling nativo, por lo que se asume que no está disponible salvo que se haya añadido en el fine-tuning (sin evidencia).
- Modo de razonamiento extendido: no disponible.

## Casos de uso

Dada la escasa documentación, los casos de uso son potenciales y requieren validación:

- Clasificación de tickets de soporte: el modelo podría categorizar consultas de clientes en temas predefinidos, aprovechando su posible entrenamiento en routing. Se integraría en un pipeline de NLP para asignar prioridades o departamentos.
- Enrutamiento de consultas en asistentes virtuales: dirigir preguntas a diferentes módulos o bases de conocimiento según la intención detectada, reduciendo la carga de modelos más grandes.
- Moderación de contenido: clasificar comentarios o publicaciones en categorías (spam, ofensivo, relevante) con un modelo ligero que puede ejecutarse en CPU o GPUs de gama baja.
- Análisis de sentimiento en inglés: al ser un fine-tuning instructivo, puede adaptarse a tareas de sentimiento si se le proporcionan ejemplos en el prompt.
- Generación de respuestas automáticas en inglés: para chatbots de atención al cliente con presupuesto de cómputo reducido, gracias a su tamaño y cuantización.
- Experimentación académica: como modelo de referencia para estudiar el impacto del fine-tuning en tareas de clasificación con arquitecturas pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, el modelo ocupa aproximadamente 2-3 GB en memoria (3,2B parámetros × 0,5 bytes/parámetro ≈ 1,6 GB, más overhead de activaciones y contexto). Se estima que cabe en GPUs con 4 GB o más.
- GPU recomendadas: NVIDIA GTX 1660 Super (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB), o superiores. También puede ejecutarse en CPU con suficiente RAM (≥8 GB) mediante llama.cpp.
- Compatibilidad con GPU de consumo: sí, la mayoría de GPUs modernas con ≥4 GB de VRAM pueden ejecutarlo.
- Opciones de despliegue: compatible con transformers (pipelines), vLLM (con adaptaciones para 4-bit), llama.cpp (conversión a GGUF), Ollama (si se empaqueta), y Text Generation Inference (TGI) según las etiquetas.
- Latencia y throughput: no hay datos oficiales. En una RTX 3090 se espera una latencia de ~50-100 ms por token y un throughput de ~50-100 tokens/s, pero son estimaciones basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Especialización |
|---|---|---|---|---|---|
| Thamo31/Llama-3.2-3B-4bit-classification-routing-merged | 3,2B | no disponible (base 128K) | Apache 2.0 | 4-bit | Clasificación/routing (presunto) |
| unsloth/Llama-3.2-3B-Instruct-bnb-4bit | 3,2B | 128K | Apache 2.0 | 4-bit | Instruct general |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community License | FP16 | Instruct general |

La comparativa se limita a los modelos base y variantes de Llama 3.2 3B, ya que no hay información sobre otros modelos comparables en la misma tarea. El fine-tuning de Thamo31 podría ofrecer mejor rendimiento en clasificación que el instruct general, pero no hay evidencia pública.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2, puede heredar sesgos de género, raza o ideológicos presentes en los datos de preentrenamiento. No se ha realizado una evaluación de sesgos específica.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de clasificación si el prompt es ambiguo.
- Limitaciones de contexto: aunque el modelo base soporta hasta 128K tokens, no se confirma que este fine-tuning mantenga esa longitud. Se recomienda probar con secuencias cortas y medias.
- Idioma: solo inglés declarado; su rendimiento en otros idiomas es desconocido y probablemente pobre.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Llama 3.2 original tiene su propia licencia (Llama Community License) que puede imponer condiciones adicionales. Se debe verificar la compatibilidad.
- Falta de documentación: no hay papers, datasets ni métricas publicadas, lo que dificulta la reproducibilidad y la confianza en su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thamo31/Llama-3.2-3B-4bit-classification-routing-merged
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Librería Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
