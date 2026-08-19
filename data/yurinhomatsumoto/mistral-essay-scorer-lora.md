# YurinhoMatsumoto/mistral-essay-scorer-lora

## Resumen

El modelo `YurinhoMatsumoto/mistral-essay-scorer-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder de 7 mil millones de parámetros desarrollado por Mistral AI. Su propósito declarado es la corrección automática de ensayos: dado un prompt con la pregunta, una respuesta de referencia, la respuesta del estudiante y un esquema de puntuación (mark scheme), el modelo devuelve una puntuación y una justificación.

El adaptador se publica en formato PEFT con pesos en safetensors, lo que permite cargarlo directamente sobre el modelo base mediante la librería `peft` de Hugging Face. No se han publicado métricas de evaluación, detalles del conjunto de datos de entrenamiento ni especificaciones de licencia, por lo que su uso en producción requiere verificación previa. La relevancia de este modelo radica en la creciente demanda de herramientas de evaluación automática de escritura académica, aunque su adopción actual es muy limitada (0 descargas, 0 likes) y carece de documentación técnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B-Instruct-v0.3) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base) + adaptador LoRA (tamano no publicado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 8192 tokens, pero el adaptador no especifica) |
| Tipos de cuantizacion | No publicado (el adaptador se entrega en safetensors; se puede cuantizar el modelo base) |
| Idiomas soportados | No disponibles (el modelo base soporta principalmente ingles; no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Mistral-7B-Instruct-v0.3, un transformer autoregresivo con atención de ventana deslizante (sliding window attention) y una ventana de contexto de 8192 tokens. El adaptador LoRA se entrena mediante SFT (supervised fine-tuning) sobre el modelo base, lo que implica ajustar una matriz de bajo rango que modifica los pesos de las capas de atención y feed-forward sin necesidad de reentrenar todo el modelo. El autor no ha publicado el conjunto de datos de entrenamiento, los hiperparámetros (rank, alpha, dropout), ni el régimen de entrenamiento (precisión, número de pasos, etc.). La biblioteca `PEFT` 0.19.1 aparece en los metadatos, lo que confirma el uso de la herramienta estándar para adaptadores.

No se indica si se usó RLHF, DPO o algún otro método de alineación adicional. Tampoco hay información sobre la composición del dataset (por ejemplo, si incluye ensayos en inglés de estudiantes, esquemas de evaluación, etc.). Dado que el modelo base es una versión instruct, el adaptador probablemente se entrenó para seguir instrucciones de puntuación, pero esto es una inferencia razonable y no un dato confirmado.

## Capacidades

- Generación de texto: el adaptador hereda la capacidad generativa del modelo base, pero está orientado a la tarea de puntuación de ensayos.
- Razonamiento y comprensión de texto: puede analizar un ensayo y producir una puntuación numérica y una justificación textual, según el esquema de evaluación.
- Tool calling: no se ha documentado soporte para tool calling en el adaptador.
- Agentes y multi-step reasoning: no se ha documentado.
- Capacidades multilingües: no se especifican; el modelo base es principalmente inglés, por lo que se espera que el adaptador funcione mejor en inglés.
- Capacidades especiales: ninguna documentada (no visión, no audio).

## Casos de uso

- Corrección de ensayos en entornos educativos: el modelo puede asignar una puntuación a respuestas de estudiantes siguiendo un esquema de corrección predefinido. Se integraría en un pipeline de evaluación donde se le pasa el prompt con la pregunta, la respuesta de referencia, la respuesta del alumno y el mark scheme, y devuelve una puntuación con justificación.
- Asistencia a docentes en evaluación formativa: los profesores pueden usar el modelo para obtener una primera revisión de ensayos y dedicar tiempo a casos más complejos, reduciendo la carga de trabajo manual.
- Evaluación estandarizada en plataformas de aprendizaje online: plataformas como Moodle o Canvas podrían incorporar este adaptador para puntuar automáticamente ensayos en exámenes de práctica, siempre que se valide su precisión.
- Generación de feedback automatizado: además de la puntuación, el modelo puede producir una explicación racional, útil para dar retroalimentación a los estudiantes sobre sus errores.
- Investigación en NLP educativa: como adaptador LoRA, se puede usar como línea base para experimentos sobre scoring automático de ensayos, comparando con otros enfoques.
- Filtrado de respuestas en entornos de exámenes en línea: para detectar respuestas fuera de tema o de baja calidad, el modelo puede puntuar rápidamente y señalar las que requieren revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas específicas de scoring de ensayos (por ejemplo, correlación con puntuaciones humanas, QWK - Cohen's kappa). Tampoco hay comparación con otros modelos de scoring de ensayos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización del modelo base. Con el modelo base en fp16 se necesitan aproximadamente 14-16 GB de VRAM para los 7B parámetros. Con cuantización de 4 bits (bitsandbytes), se reduce a unos 4-6 GB.
- GPU recomendadas: para fp16, una GPU con al menos 16 GB (por ejemplo, RTX 4080/4090, A100 40GB). Para 4 bits, una GPU consumer de 8 GB puede funcionar (RTX 3070/3080, etc.).
- Compatibilidad con GPUs consumer: sí, con cuantización. El adaptador LoRA es ligero y se puede cargar sobre el modelo cuantizado.
- Opciones de despliegue: mediante Hugging Face Transformers + PEFT, vLLM (si se fusiona el adaptador con el modelo base), llama.cpp (si se convierte a GGUF), o TGI. No hay soporte directo de Ollama para adaptadores LoRA, pero se puede fusionar.
- Latencia y throughput: no disponibles, ya que no se ha medido el rendimiento del adaptador.

## Comparativa con modelos similares

No hay datos públicos para este adaptador específico. Se puede comparar con otros adaptadores LoRA para scoring de ensayos, como `yaffo/essay_grader_merged` (basado en `unsloth/mistral-7b-bnb-4bit`) o el sistema `AiAWE` (basado en Gemma-3-27B-it). Sin embargo, no hay benchmarks publicados que permitan una comparación cuantitativa. La comparación cualitativa sería:

| Modelo | Base | Tipo | Puntuación de ensayos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `YurinhoMatsumoto/mistral-essay-scorer-lora` | Mistral-7B-Instruct-v0.3 | LoRA | Sí | No disponible | HF |
| `yaffo/essay_grader_merged` | unsloth/mistral-7b-bnb-4bit | LoRA (merged) | Sí | No disponible | HF |
| `AiAWE` (Gayed, 2026) | Gemma-3-27B-it | LoRA | Sí | No disponible | GitHub |

No se puede afirmar cuál es mejor sin datos.

## Limitaciones y advertencias

- Sesgos: al ser un adaptador sobre un modelo entrenado con datos de internet, puede reflejar sesgos lingüísticos y culturales del inglés. No se ha evaluado su comportamiento con poblaciones diversas.
- Riesgo de alucinación: como modelo generativo, puede producir justificaciones inventadas o puntuaciones inconsistentes con el esquema de evaluación.
- Limitaciones de contexto: el modelo base tiene 8192 tokens, pero el adaptador puede no funcionar correctamente con textos largos si el entrenamiento no lo cubrió.
- Idiomas: no se especifica soporte multilingüe; probablemente solo funciona bien en inglés.
- Restricciones de licencia: la licencia no está indicada, lo que impide conocer si es permitido su uso comercial. Hay que contactar al autor o asumir riesgo legal.
- Carencia de documentación: no hay información sobre el conjunto de datos de entrenamiento, hiperparámetros, ni evaluación. No es recomendable usar en producción sin una validación exhaustiva.
- Modelo pequeño: 7B de parámetros puede no alcanzar el rendimiento de modelos más grandes en tareas de scoring complejas.

## Enlaces

- HuggingFace: https://huggingface.co/YurinhoMatsumoto/mistral-essay-scorer-lora
- Proyecto similar de grading con Mistral-7B: https://github.com/HalaKhalifa/automatic-essay-grading
- Artículo sobre sesgo en scoring con LoRA (Gemma-3): https://arxiv.org/abs/2607.14605
- Sistema AiAWE (GitHub): https://github.com/wwrwbs/AI_AWE/tree/main/essay_score
- Artículo sobre scoring con características lingüísticas: https://arxiv.org/html/2502.09497
- Adaptador similar: https://huggingface.co/yaffo/essay_grader_merged
