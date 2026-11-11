# Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-100

## Resumen

El modelo `Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-100` es un ajuste fino de `FacebookAI/xlm-roberta-large` para la tarea de respuesta a preguntas extractiva (question answering) sobre textos en persa. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia MIT y está pensado para localizar el fragmento exacto de un contexto que responde a una pregunta dada, devolviendo los índices de inicio y fin del span.

Se trata de un encoder transformer de tipo XLM-RoBERTa en su variante large, con 558.842.882 parámetros y una arquitectura de 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención. El ajuste se ha realizado con el `Trainer` de Transformers sobre un conjunto de datos no especificado en la model card, presumiblemente derivado de PersianQuAD (el corpus de QA extractiva en persa), durante 3 épocas con una tasa de aprendizaje de 2e-05 y precisión mixta nativa.

Su relevancia radica en que cubre una laguna concreta: el soporte de QA extractiva en persa de alta calidad con modelos abiertos es limitado, y este ajuste reporta métricas notables en validación (exact match 86,3 y F1 89,03), lo que lo hace útil para pipelines de búsqueda semántica, asistentes documentales o sistemas de preguntas sobre normativa y prensa en persa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) |
| Parametros totales | 558.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (XLM-RoBERTa soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a int8/fp16 con herramientas estándar) |
| Idiomas soportados | no disponible (modelo base multilingüe; ajuste orientado a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa large, un transformer encoder preentrenado de forma multilingüe por Facebook AI. El ajuste fino añade una cabeza de question answering sobre la representación del token `[CLS]` y los tokens de la secuencia, siguiendo el esquema clásico de SQuAD: se predicen dos logits por token (inicio y fin del span) y se selecciona el par con mayor probabilidad conjunta válida. El modelo tiene 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, lo que explica sus ~559 millones de parámetros.

Los detalles del dataset de entrenamiento no están documentados en la model card ("unknown dataset"). Se sabe que se entrenó durante 3 épocas con `train_batch_size=16`, `eval_batch_size=16`, `learning_rate=2e-05`, scheduler lineal, optimizador AdamW fused, semilla 42 y AMP nativo. La curva de validación muestra sobreajuste a partir de la época 2: la pérdida de validación baja de 0,6574 (época 1) a 0,6435 (época 2) y repunta a 0,6848 en la época 3, mientras la pérdida de entrenamiento cae de 0,8072 a 0,2968. No se documenta RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Comprensión lectora en persa: el ajuste está orientado a textos en farsi, aunque el modelo base es multilingüe y podría transferir parcialmente a otros idiomas.
- Manejo de contextos de hasta 512 tokens (límite arquitectónico de XLM-RoBERTa), suficiente para párrafos y secciones de documentos.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de modo "thinking", visión, audio ni capacidades agénticas.
- Integrable con la pipeline `question-answering` de Transformers y con endpoints compatibles.

## Casos de uso

- Búsqueda de respuestas en documentación corporativa en persa: indexar manuales, políticas internas o contratos y usar el modelo para extraer el fragmento exacto que responde a una consulta del empleado, con contexto de hasta 512 tokens por fragmento.
- Asistente de atención al cliente sobre FAQ: dado un artículo de ayuda y la pregunta del usuario, el modelo localiza la frase relevante y permite construir una respuesta citada, reduciendo alucinaciones frente a un modelo generativo.
- Extracción de datos en prensa y boletines oficiales: localizar cifras, fechas o nombres concretos en noticias y comunicados en farsi para alimentar bases de datos estructuradas.
- Soporte a la investigación académica: responder preguntas sobre artículos o tesis en persa extrayendo el pasaje pertinente, útil en revisiones sistemáticas.
- Enriquecimiento de motores de búsqueda internos: combinar recuperación léxica o vectorial con este modelo como reranker extractivo para devolver respuestas directas en lugar de enlaces.
- Verificación de afirmaciones (fact-checking): comprobar si un contexto dado contiene evidencia que respalde o refute una afirmación, devolviendo el span de soporte.
- Procesamiento por lotes de formularios o encuestas: extraer respuestas a preguntas predefinidas de transcripciones o textos largos divididos en fragmentos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (model-index sin entradas; datos tomados de la model card):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,6848 |
| Exact match | 86,3 |
| F1 | 89,03 |

No se han publicado resultados comparativos con otros modelos en la información disponible. No se especifica el tamaño ni la composición exacta del conjunto de evaluación más allá de la referencia "val-100" en el nombre del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2 GB solo para pesos, más activaciones y overhead del runtime (aproximadamente 3-4 GB en total).
- VRAM estimada en fp16: alrededor de 1,1 GB para pesos, con un total práctico de 2-3 GB.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en GPUs de datacenter (A100, H100, L4, T4) sin problema.
- También puede ejecutarse en CPU para cargas de baja concurrencia, con latencias mayores.
- Opciones de despliegue: `transformers` con la pipeline `question-answering`, `text-generation-inference` (TGI) para serving HTTP, ONNX Runtime para optimización, o `optimum` para exportación. No se recomienda `llama.cpp` ni `Ollama` porque no es un modelo generativo causal.
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-100 | 558,8 M | 512 tokens (arquitectura base) | QA extractiva en persa | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 558,8 M | 512 tokens | Modelo base multilingüe (sin ajuste QA) | MIT | Hugging Face |
| deepset/xlm-roberta-large-squad2 | 558,8 M | 512 tokens | QA extractiva en inglés (SQuAD2) | MIT | Hugging Face |
| HooshvareLab/bert-fa-base-uncased | ~110 M | 512 tokens | Modelo base en persa (encoder) | Apache 2.0 | Hugging Face |

La comparación se limita a características estructurales y de licencia; no se dispone de resultados de benchmarks de estos modelos en la información proporcionada para contrastar el rendimiento en persa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar sesgos de dominio ni la calidad de las anotaciones.
- Riesgo de alucinación estructural bajo: al ser extractivo, siempre devuelve un span del contexto, pero puede seleccionar fragmentos incorrectos si la respuesta no está presente o si el contexto supera los 512 tokens.
- La ventana de 512 tokens obliga a trocear documentos largos, lo que puede romper la coherencia de la respuesta si el span relevante queda partido.
- No se especifican los idiomas cubiertos por el ajuste; el uso fuera del persa no está validado y puede degradar el rendimiento.
- Aunque el modelo base es multilingüe, el ajuste puede haber sobreajustado a particularidades léxicas del corpus persa.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero conviene revisar la licencia del modelo base (también MIT) y de los datos de entrenamiento, que no se detallan.
- El repunte de la pérdida de validación en la época 3 sugiere sobreajuste; para producción conviene evaluar checkpoints intermedios si están disponibles.
- No hay garantías de calibración de las probabilidades de span; para umbrales de confianza en producción se recomienda validar sobre un conjunto propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-100
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de la pipeline question-answering de Transformers: https://huggingface.co/docs/transformers/tasks/question_answering
