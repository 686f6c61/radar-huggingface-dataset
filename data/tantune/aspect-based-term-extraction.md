# tantune/aspect-based-term-extraction

## Resumen

`tantune/aspect-based-term-extraction` es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased` sobre un conjunto de datos no especificado. Su propósito declarado es la extracción de términos basados en aspectos (aspect-based term extraction), una tarea típica del análisis de opiniones que consiste en identificar en un texto los términos que designan los aspectos o entidades sobre los que se emite una valoración. El autor es el usuario de Hugging Face `tantune` y el modelo se publicó en noviembre de 2026 bajo licencia Apache 2.0.

Se trata de un modelo encoder-only de 66,4 millones de parámetros, con arquitectura DistilBERT (transformer de 6 capas, destilado de BERT-base), orientado exclusivamente a inferencia de etiquetado secuencial. No genera texto libre ni mantiene conversaciones: devuelve una etiqueta BIO por token, lo que lo hace adecuado para pipelines de extracción de información estructurada a partir de reseñas, encuestas o tickets.

La relevancia de esta ficha es limitada en términos de impacto: el modelo acumula cero descargas y cero likes, la model card está generada automáticamente por el `Trainer` de Hugging Face y contiene secciones sin completar ("More information needed"), y el autor no documenta el dataset de entrenamiento ni los esquemas de etiquetas empleados. Los únicos datos de rendimiento publicados son los del conjunto de evaluación interno: pérdida de 0,1853 en la época 2 y F1 de 0,8264 en la época 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT-base, 6 capas) |
| Parametros totales | 66.365.187 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens de entrada; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión completa; admite cuantización dinámica a int8 mediante herramientas estándar de PyTorch/ONNX) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB, incluye artefactos del Trainer) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder-only de 6 capas y 66 millones de parámetros que se obtiene por destilación de conocimiento de BERT-base durante el preentrenamiento. La cabeza añadida es la estándar de `AutoModelForTokenClassification`, con una capa lineal que proyecta el estado oculto de cada token al número de etiquetas del esquema BIO definido por el autor; ese esquema no se documenta en la model card.

El entrenamiento se realizó con el `Trainer` de Transformers 5.22.1 sobre PyTorch 2.14.1 y Datasets 4.8.5, con los siguientes hiperparámetros: tasa de aprendizaje 2e-5, tamaño de lote de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW con betas (0,9 / 0,999) y epsilon 1e-8, scheduler lineal, 5 épocas y precisión mixta nativa (AMP). El conjunto de entrenamiento no se identifica ("on an unknown dataset") y no se declara el número de tokens, la composición del corpus ni si hubo etapas de ajuste adicionales como RLHF o DPO, algo por otra parte inusual en un modelo de clasificación.

La evolución registrada muestra sobreajuste a partir de la tercera época: la pérdida de validación toca mínimo en la época 2 (0,1853) y repunta después (0,1988 en la época 3, 0,2130 en la 4 y 0,2158 en la 5), mientras que el F1 se estabiliza en torno a 0,826. El checkpoint final publicado corresponde a la época 5, no al óptimo de validación.

## Capacidades

- Etiquetado secuencial de tokens (token classification) para extracción de términos asociados a aspectos en textos.
- Identificación de spans de texto mediante esquema BIO, apto para postprocesado con agregación de entidades.
- Inferencia rápida en CPU gracias al tamaño reducido del encoder (66 millones de parámetros, 6 capas).
- Integración directa con la pipeline `token-classification` de Transformers y con endpoints compatibles (`endpoints_compatible` en los tags del repo).
- No soporta generación de texto, razonamiento multi-paso, matemáticas ni código.
- No soporta tool calling ni function calling: no es un modelo instruido ni conversacional.
- No dispone de modo "thinking", visión ni audio.
- Capacidades multilingües no declaradas; el modelo base es monolingüe en inglés.

## Casos de uso

- Extracción de aspectos en reseñas de producto: el modelo etiqueta los términos que designan características valoradas (batería, pantalla, precio) en reseñas de comercio electrónico, alimentando un pipeline posterior de análisis de sentimiento por aspecto. Es adecuado por su naturaleza de etiquetado por token y su bajo coste de inferencia.
- Procesamiento de encuestas de satisfacción (NPS, CSAT): a partir de respuestas abiertas, el modelo aísla los términos sobre los que el cliente emite juicio, lo que permite agregar métricas por dimensión del servicio sin revisión manual.
- Enrutado de tickets de soporte: los términos extraídos pueden mapearse a categorías de producto o departamento, de modo que el ticket se asigna automáticamente al equipo correspondiente. El tamaño del modelo permite ejecutarlo en el mismo servicio de ingesta sin GPU dedicada.
- Análisis de opiniones en redes sociales: con la ventana de 512 tokens de DistilBERT, procesa publicaciones individuales o fragmentos y extrae los términos de interés para paneles de escucha social.
- Enriquecimiento de bases de conocimiento: los spans extraídos se normalizan y se enlazan a entidades de un catálogo interno, construyendo índices de aspectos por producto o servicio.
- Preetiquetado para anotación humana: el modelo actúa como anotador previo en herramientas tipo Label Studio o Prodigy, reduciendo el esfuerzo de revisión en proyectos de construcción de corpus de análisis de opiniones.
- Filtrado previo en pipelines RAG: los términos de aspecto extraídos de documentos pueden usarse como metadatos para restringir la recuperación antes de la generación con un modelo mayor.

## Benchmarks y rendimiento

Los únicos datos publicados son los del conjunto de evaluación interno del autor, recogidos en la model card. No hay resultados en benchmarks estándar (MMLU, GLUE, CoNLL, SemEval) ni comparaciones con otros modelos.

| Epoca | Paso | Perdida de validacion | F1-score |
|---|---|---|---|
| 1 | 113 | 0,2071 | 0,7250 |
| 2 | 226 | 0,1853 | 0,8108 |
| 3 | 339 | 0,1988 | 0,8261 |
| 4 | 452 | 0,2130 | 0,8258 |
| 5 | 565 | 0,2158 | 0,8264 |

El `model-index` de la model card declara una entrada (`aspect-based-term-extraction`) sin resultados asociados. No se especifica qué conjunto de evaluación se empleó, su tamaño ni su distribución de etiquetas, por lo que el F1 de 0,8264 no es directamente comparable con resultados publicados en la literatura de extracción de aspectos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3 GB para pesos (66,4 millones de parámetros × 4 bytes) más activaciones; en la práctica cabe holgadamente en cualquier GPU con 1 GB o más.
- VRAM estimada en int8: aproximadamente 0,07 GB de pesos, ejecutable en CPU sin dificultad.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia de milisegundos por secuencia corta. Para lotes grandes, cualquier GPU consumer sirve (RTX 3060, RTX 4090, T4).
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida; también en Raspberry Pi para inferencia por CPU con ONNX Runtime.
- Opciones de despliegue: pipeline `token-classification` de Transformers, `text-classification`/token-classification en TGI, exportación a ONNX Runtime, TorchScript o `optimum`; no hay pesos GGUF publicados en el repo, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del encoder se espera un throughput alto en lote, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tantune/aspect-based-term-extraction | 66,4 M | no disponible (base: 512) | Token classification (extracción de aspectos) | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert/distilbert-base-uncased | 66,4 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base | 125 M | 512 | Modelo base (MLM) | MIT | Hugging Face, ampliamente usado |

La comparación con los modelos base es la única posible con la información disponible: el modelo de `tantune` es un fine-tuning de DistilBERT y, por tanto, hereda su arquitectura y su ventana de 512 tokens, con la diferencia de que añade una cabeza de clasificación de tokens específica para la tarea de extracción de aspectos. No se dispone de comparaciones con otros modelos afinados para la misma tarea (por ejemplo, variantes de ABSA sobre BERT o RoBERTa) porque el autor no publica resultados frente a ellos.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen "More information needed", por lo que se desconoce el esquema de etiquetas, el dominio del corpus y la distribución de clases.
- Dataset de entrenamiento no identificado ("unknown dataset"): impide evaluar la cobertura del dominio y el riesgo de sesgo de anotación.
- Sobreajuste documentado: la pérdida de validación mínima se alcanza en la época 2 y el checkpoint publicado es el de la época 5, con pérdida superior; puede ser preferible reentrenar o seleccionar un checkpoint intermedio.
- Riesgo de alucinación estructural: al ser un etiquetador, no genera texto, pero puede producir spans espurios o etiquetas incoherentes fuera de la distribución de entrenamiento; requiere umbral de confianza y validación posterior.
- Idiomas: no se declaran idiomas soportados y el modelo base es monolingüe en inglés; el uso en castellano no está validado.
- Ventana de contexto limitada a 512 tokens (límite del modelo base), insuficiente para documentos largos sin fragmentación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; al no documentarse el dataset, no puede verificarse la procedencia de los datos de entrenamiento.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- Sin datos de benchmarks estándar: el F1 de 0,8264 corresponde a un conjunto de evaluación interno no descrito y no es comparable con resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tantune/aspect-based-term-extraction
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de la pipeline de token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada.
