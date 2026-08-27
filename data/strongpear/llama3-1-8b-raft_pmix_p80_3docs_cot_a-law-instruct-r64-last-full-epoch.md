# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch

## Resumen

El modelo `strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch` es un adaptador LoRA (Low-Rank Adaptation) de rango 64 construido sobre el modelo base `meta-llama/Llama-3.1-8B`. Ha sido desarrollado por el usuario strongpear y su nombre sugiere un fine-tuning orientado a tareas legales (LAW) con razonamiento de cadena de pensamiento (CoT), utilizando una combinación de técnicas como RAFT (Retrieval Augmented Fine-Tuning), PMIX (posiblemente una estrategia de mezcla de prompts) y el uso de tres documentos de contexto (3DOCS). El adaptador se distribuye en formato safetensors y ocupa aproximadamente 0,7 GB.

La relevancia de este modelo radica en que demuestra cómo se puede especializar un LLM generalista de 8 mil millones de parámetros mediante LoRA para dominios específicos, en este caso el legal, sin necesidad de reentrenar el modelo completo. Sin embargo, la información pública disponible es muy limitada: la model card está prácticamente vacía y no se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros ni los resultados de evaluación. Esto dificulta una evaluación rigurosa de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador tiene ~0,7 GB; el modelo base tiene 8.030 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantizacion) |
| Idiomas soportados | No disponible (el modelo base soporta multilingue, pero el adaptador no especifica) |
| Licencia | No disponible (el modelo base usa la licencia Llama 3.1 Community, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de Llama 3.1 8B, que emplea atención por ventanas con RoPE (Rotary Position Embeddings), normalización RMSNorm y capas feed-forward con SwiGLU. El fine-tuning se realizó mediante LoRA con rango 64, lo que implica que solo se actualizaron matrices de baja dimensión en las capas de atención y feed-forward, manteniendo congelados los pesos del modelo base. Esta técnica reduce drásticamente el número de parámetros entrenables y los requisitos de memoria.

El nombre del modelo sugiere que el entrenamiento combinó varias estrategias: RAFT (que integra recuperación de información durante el fine-tuning para mejorar la fidelidad factual), PMIX (posiblemente una técnica de mezcla de prompts o de datos), y el uso de tres documentos de contexto (3DOCS) para entrenar al modelo a razonar sobre múltiples fuentes. Además, se incluyó cadena de pensamiento (CoT) para fomentar el razonamiento paso a paso. Sin embargo, no se han publicado detalles concretos sobre el dataset, el número de tokens de entrenamiento, el régimen de precisión (fp16, bf16, etc.) ni el tiempo de cómputo. La versión de PEFT utilizada es la 0.20.0.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Llama 3.1 8B, conserva las capacidades generales de generación, comprensión y razonamiento del modelo base, aunque el adaptador está especializado en dominios legales.
- Razonamiento de cadena de pensamiento (CoT): el nombre del modelo indica que fue entrenado para producir razonamientos paso a paso, lo que puede mejorar la calidad de las respuestas en tareas que requieren análisis lógico.
- Especialización legal: el sufijo "A-LAW-Instruct" sugiere que el adaptador está orientado a instrucciones y consultas legales, posiblemente para responder preguntas sobre normativas, contratos o jurisprudencia.
- Uso de múltiples documentos: la etiqueta "3DOCS" apunta a que el modelo fue entrenado para procesar y razonar sobre tres documentos de contexto simultáneamente, lo que podría ser útil en tareas de análisis comparativo o síntesis de información legal.
- No se dispone de información sobre soporte de tool calling, funciones de agente, capacidades multimodales o idiomas específicos más allá de lo que hereda del modelo base.

## Casos de uso

- Asistencia legal para redacción de documentos: el modelo puede ayudar a redactar cláusulas contractuales, memorandos o escritos legales, aprovechando su entrenamiento en instrucciones legales y su capacidad de razonamiento CoT para estructurar argumentos.
- Análisis de contratos: dado su entrenamiento con múltiples documentos, podría comparar cláusulas de varios contratos y resumir diferencias o riesgos potenciales, aunque no hay evidencia pública de su rendimiento en esta tarea.
- Respuesta a consultas jurídicas frecuentes: puede generar respuestas preliminares a preguntas legales comunes, sirviendo como herramienta de apoyo para profesionales del derecho, siempre que se valide la exactitud de las respuestas.
- Extracción de información de expedientes legales: el modelo podría procesar documentos legales extensos y extraer entidades, fechas o referencias normativas relevantes, gracias a la ventana de contexto del modelo base (128k tokens).
- Generación de resúmenes de jurisprudencia: con su capacidad de razonamiento sobre varios documentos, podría sintetizar sentencias o dictámenes, aunque se requiere verificación humana.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para especializaciones posteriores en subdominios legales (laboral, penal, mercantil) mediante entrenamiento adicional con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas que reporten el rendimiento del modelo en tareas legales o generales. Por tanto, no es posible comparar cuantitativamente este adaptador con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Llama 3.1 8B, los requisitos de hardware son los del modelo base más el pequeño overhead del adaptador. El modelo base en precisión fp16 ocupa aproximadamente 16 GB de VRAM, y en cuantización 4-bit (GGUF) puede reducirse a unos 5-6 GB.
- GPU recomendadas: para inferencia en fp16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantización 4-bit, una GPU con 8 GB (RTX 3070, RTX 4060) podría ser suficiente.
- El adaptador en sí es ligero (0,7 GB) y puede cargarse junto con el modelo base en memoria.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con transformers y cargar mediante `PeftModel`. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. Para entornos de bajos recursos, se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos específicos. Como referencia, Llama 3.1 8B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en fp16, dependiendo de la implementación.

## Comparativa con modelos similares

El autor ha publicado otros adaptadores LoRA sobre el mismo modelo base, como `strongpear/Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64` (especializado en medicina) y `strongpear/Llama3.1-8B-QA_CoT-LAW-Instruct-r64` (también legal, pero sin las etiquetas RAFT/PMIX/3DOCS). No se dispone de información detallada sobre ninguno de ellos, por lo que la comparación se limita a los nombres y a la ausencia de documentación.

| Modelo | Base | Especialidad | Técnicas | Documentación |
|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64 | Llama-3.1-8B | Legal | RAFT, PMIX, 3DOCS, CoT | Muy escasa |
| strongpear/Llama3.1-8B-QA_CoT-LAW-Instruct-r64 | Llama-3.1-8B | Legal | QA, CoT | Sin model card |
| strongpear/Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64 | Llama-3.1-8B | Médico | QA, CoT | Parcial (loss 0.5788) |

No se dispone de comparativas con otros modelos legales de código abierto (como LegalBERT o modelos jurídicos específicos) porque no hay datos de rendimiento.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el dataset de entrenamiento, los hiperparámetros, el régimen de precisión ni los criterios de evaluación. Esto impide conocer su calidad y reproducibilidad.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información legal incorrecta o inventada. Su uso en contextos profesionales sin supervisión humana es peligroso.
- Sesgos potenciales: el entrenamiento en datos legales puede introducir sesgos propios del dominio (por ejemplo, sobrerrepresentación de ciertas jurisdicciones o estilos de redacción). No se han documentado medidas de mitigación.
- Licencia no declarada: aunque el modelo base tiene la licencia Llama 3.1 Community, el adaptador no especifica su propia licencia. Esto genera incertidumbre sobre los términos de uso comercial y redistribución.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede afirmar que el modelo supere al base en tareas legales. La especialización podría incluso degradar el rendimiento general si el dataset de entrenamiento fue limitado.
- Contexto y multilingüismo: no se confirma si el adaptador mantiene la ventana de 128k tokens del base ni si conserva las capacidades multilingües. En la práctica, el entrenamiento con documentos legales probablemente se realizó en un idioma concreto (posiblemente inglés), lo que podría reducir su utilidad en otros idiomas.

## Enlaces

- [HuggingFace: strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch](https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch)
- [HuggingFace: strongpear/Llama3.1-8B-QA_CoT-LAW-Instruct-r64](https://huggingface.co/strongpear/Llama3.1-8B-QA_CoT-LAW-Instruct-r64)
- [HuggingFace: strongpear/Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64](https://huggingface.co/strongpear/Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64)
- [Modelo base: meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
- [Documentación de Llama 3.1 (Meta)](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_1/)
- [Llama 3.1 8B en Ollama](https://ollama.com/library/llama3.1:8b)
