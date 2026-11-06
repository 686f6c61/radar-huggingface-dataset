# Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None

## Resumen

El modelo `Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None` es un ajuste fino (fine-tuning) de `google-bert/bert-base-multilingual-cased` especializado en la tarea de respuesta a preguntas extractiva (question answering). Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0 y está generado con la librería `transformers` mediante el flujo estándar de `Trainer`. Su propósito es localizar la respuesta a una pregunta dentro de un párrafo de contexto, devolviendo el fragmento (span) correspondiente, no texto generado libremente.

El nombre del repositorio indica que se ha entrenado sobre el conjunto PersianQuAD, un corpus de QA extractivo en persa (farsi). El modelo hereda del BERT multilingüe original su tokenizador con vocabulario cased y una arquitectura transformer encoder-only de 177.264.386 parámetros (~177 M), con un límite de contexto típico de 512 tokens. Es, por tanto, un modelo pequeño y ligero, adecuado para despliegues de bajo coste en tareas de búsqueda de respuestas sobre documentos.

La relevancia práctica es acotada pero clara: sirve como componente de recuperación de respuestas en pipelines de búsqueda documental en persa, y como ejemplo de fine-tuning de BERT multilingüe para QA. La model card es la generada automáticamente por el `Trainer` y no contiene descripción de uso, datos ni limitaciones, por lo que buena parte de la información de esta ficha se deduce del modelo base y de los hiperparámetros declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT), 12 capas, hidden size 768, 12 cabezas de atención |
| Parametros totales | 177.264.386 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización dinámica a int8 mediante herramientas estándar de PyTorch) |
| Idiomas soportados | no disponible en la model card; el modelo base es multilingüe (104 idiomas) y el ajuste se realiza sobre un dataset en persa |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base multilingüe: un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, más una cabeza de question answering sobre las representaciones de los tokens de inicio y fin de la respuesta. El tokenizador es WordPiece con distinción de mayúsculas y minúsculas (cased), con un vocabulario multilingüe de aproximadamente 119.000 tokens que cubre escrituras latina, cirílica, árabe y otras, lo que permite procesar texto en persa sin tokenizador específico.

El ajuste fino se realizó durante 3 épocas con un learning rate de 2e-5, batch size de 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP), con semilla 42. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo encoder-only de QA). La pérdida de validación bajó de 0,9987 en la primera época a 0,8079 en la tercera, mientras que la pérdida de entrenamiento descendió de 0,9987 a 0,4399, lo que sugiere cierto sobreajuste a partir de la segunda época (la validación empeora ligeramente entre la época 2 y la 3).

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta, con puntuaciones de inicio y fin.
- Procesamiento multilingüe heredado del modelo base, con especial énfasis en persa por el dataset de ajuste.
- Manejo de texto con distinción de mayúsculas y minúsculas (cased), relevante para nombres propios y siglas.
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: es un encoder discriminativo, no un modelo generativo.
- No soporta visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatible con el pipeline `question-answering` de `transformers` y con endpoints de inferencia compatibles.

## Casos de uso

- Búsqueda de respuestas en documentación en persa: indexar manuales, normativas o artículos y usar el modelo para extraer el fragmento exacto que responde a una consulta del usuario, con un coste computacional muy bajo.
- Asistencia en atención al cliente sobre bases de conocimiento: dado un artículo de FAQ y la pregunta del cliente, el modelo devuelve el span relevante para que un sistema posterior lo presente o lo reformule.
- Extracción de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) dentro de párrafos, útil en procesos de digitalización documental.
- Componente de un pipeline RAG: tras la recuperación de documentos con un retriever (por ejemplo, BM25 o embeddings), el modelo actúa como extractor de la respuesta exacta antes de pasarla a un generador.
- Evaluación y anotación semiautomática de datasets de QA: generar candidatos de respuesta para revisión humana en corpus en persa.
- Filtrado y validación de respuestas en sistemas de encuestas o chatbots: comprobar si una respuesta propuesta aparece literalmente en el contexto de referencia.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de ~177 M de parámetros, se puede ejecutar en CPU para pruebas y en GPU de gama baja para producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (presumiblemente PersianQuAD, aunque no se especifica):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,8079 |
| Exact Match | 79,2 |
| F1 | 82,566 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y la model card no incluye tabla comparativa con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB de pesos (177 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB.
- En fp16 o bf16: aproximadamente 0,35 GB de pesos; en int8 dinámico, alrededor de 0,18 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para producción de alto throughput: A100, H100 o L4 para lotes grandes; para uso individual, cualquier GPU con al menos 4 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` con el pipeline `question-answering`, TorchServe, Triton Inference Server, ONNX Runtime (previa exportación), o servicios de inferencia compatibles con endpoints de Hugging Face. `llama.cpp` y Ollama no son opciones habituales para BERT encoder-only, aunque existen conversiones a GGUF para tareas de embeddings/QA en algunos ecosistemas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y decenas de milisegundos por petición en CPU para contextos de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None | 177 M | 512 tokens (heredado) | QA extractivo (persa) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-multilingual-cased | 177 M | 512 tokens | Modelo base multilingüe (MLM) | Apache 2.0 | Hugging Face |
| Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA | 177 M (presumiblemente) | 512 tokens (heredado) | QA extractivo (dataset no especificado) | no disponible en la información | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 tokens | Modelo base multilingüe (MLM) | MIT | Hugging Face |

La comparación con XLM-RoBERTa se incluye por ser un encoder multilingüe de tamaño similar y uso común en QA multilingüe; no se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card es la generada automáticamente por el `Trainer`; no documenta el dataset de entrenamiento, el dominio de aplicación previsto ni las limitaciones, lo que dificulta evaluar su robustez fuera de PersianQuAD.
- El nombre del repositorio incluye `val-None`, lo que sugiere que el conjunto de validación no estaba especificado o que el split no se configuró correctamente; conviene verificar la procedencia de las métricas.
- Riesgo de sobreajuste: la pérdida de validación empeora en la tercera época (0,7801 → 0,7830 → 0,8079) mientras la de entrenamiento cae, por lo que el modelo puede generalizar peor de lo que indican las métricas de evaluación.
- Al ser un modelo extractivo, no puede responder preguntas cuya respuesta no esté literalmente en el contexto; devolverá un span posiblemente incorrecto en lugar de indicar que no sabe.
- Sesgos heredados del corpus multilingüe de BERT (Wikipedia y otros textos web), con posibles sesgos de género, culturales y geográficos; no se ha realizado ninguna mitigación documentada.
- Limitación de contexto de 512 tokens: documentos largos deben dividirse en fragmentos, lo que puede partir la respuesta y degradar el rendimiento.
- El soporte de idiomas no está declarado; aunque el modelo base es multilingüe, el ajuste sobre persa puede degradar el rendimiento en otras lenguas respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar la licencia del dataset PersianQuAD, que no se detalla en la model card.
- Solo 3 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-PersianQuAD-val-None
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Otro ajuste del mismo autor: https://huggingface.co/Z-Jafari/bert-base-multilingual-cased-finetuned-DS_QA
