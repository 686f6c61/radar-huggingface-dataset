# TQZinh/BamiBERT-ViLegalNLI

## Resumen

BamiBERT-ViLegalNLI es un modelo de clasificación de inferencia de lenguaje natural (NLI) adaptado al dominio jurídico vietnamita. Desarrollado por el usuario TQZinh, se trata de un fine-tuning del modelo preentrenado BamiBERT, un encoder monolingüe vietnamita basado en la arquitectura RoBERTa. El modelo está pensado para resolver tareas de entailment y contradicción en pares de premisa-hipótesis extraídos de textos legales, lo que permite automatizar el análisis de relaciones lógicas entre enunciados normativos.

El modelo base BamiBERT fue entrenado desde cero sobre 129 GB de texto vietnamita durante 20 épocas, con una longitud de contexto máxima de 2048 tokens, y elimina la necesidad de segmentación de palabras externa, una mejora significativa frente a modelos anteriores como PhoBERT. El fine-tuning para NLI legal utiliza un conjunto de datos llamado ViLegalNLI, que no se detalla en la información disponible, pero que produce dos etiquetas: CONTRADICTION/LOSE y ENTAILMENT/WIN. Con aproximadamente 103 millones de parámetros, el modelo es compacto y adecuado para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su especialización en el dominio jurídico vietnamita, un área con escasos recursos lingüísticos y técnicos. Su licencia MIT y su disponibilidad en HuggingFace facilitan su integración en sistemas de asistencia legal, búsqueda de jurisprudencia o validación de cláusulas contractuales, aunque su alcance se limita al idioma vietnamita y a un contexto de 512 tokens en el fine-tuning (el modelo base soporta 2048).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (BamiBERT) |
| Parametros totales | 102.952.706 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (base), 512 tokens en fine-tuning |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BamiBERT sigue la arquitectura RoBERTa, que a su vez es una optimización de BERT con entrenamiento más robusto y sin la tarea de predicción de la siguiente oración. El modelo base fue entrenado desde cero sobre 129 GB de texto vietnamita sin segmentación de palabras, durante 20 épocas, alcanzando un contexto de 2048 tokens. Esta elección elimina la dependencia de herramientas de segmentación léxica externas, un cuello de botella habitual en el procesamiento del vietnamita.

El fine-tuning para NLI se realizó sobre el conjunto ViLegalNLI, que contiene pares de premisas y hipótesis de textos jurídicos. El modelo clasifica cada par en dos categorías: entailment (implicación) o contradicción. El entrenamiento se realizó con el tokenizer y la arquitectura de clasificación de secuencias de Transformers, truncando las entradas a 512 tokens, como se muestra en el ejemplo de uso de la model card. No se especifican detalles sobre el número de pasos, la tasa de aprendizaje ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) sobre pares premisa-hipótesis en vietnamita, específicamente para el dominio jurídico.
- Distinguir entre relaciones de implicación (entailment) y contradicción, lo que permite determinar si una hipótesis se deduce lógicamente de una premisa legal.
- Funciona con textos legales vietnamitas, incluyendo leyes, artículos y decisiones judiciales.
- Integración sencilla con la librería Transformers de HuggingFace mediante `AutoModelForSequenceClassification`.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal; se limita a texto.

## Casos de uso

- Asistencia legal automatizada: un sistema puede presentar un artículo de una ley como premisa y una pregunta sobre los derechos del ciudadano como hipótesis. El modelo determina si la ley implica la respuesta, ayudando a abogados o usuarios a localizar normativa relevante.
- Verificación de cumplimiento contractual: dado un contrato (premisa) y una cláusula hipotética (hipótesis), el modelo indica si la cláusula está implícita o contradice el contrato, facilitando la revisión de documentos legales.
- Búsqueda de jurisprudencia: los pares de premisas (sentencias) e hipótesis (preguntas sobre el fallo) pueden clasificarse para identificar si una sentencia apoya una determinada interpretación legal.
- Análisis de documentos normativos: al comparar dos versiones de un mismo artículo legal, el modelo puede detectar si una versión contradice o implica la otra, útil en procesos de actualización legislativa.
- Asistente de redacción legal: un sistema puede verificar si una nueva cláusula propuesta es consistente con el marco legal existente, clasificando la relación como entailment o contradicción.
- Extracción de conocimiento jurídico: al combinar premisas extraídas de bases de datos legales con hipótesis generadas automáticamente, el modelo permite construir sistemas de respuesta a preguntas sobre el derecho vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como exactitud, F1 o comparativas con otros modelos en el conjunto ViLegalNLI.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, un modelo de 103M parámetros requiere aproximadamente 0,4 GB de VRAM (sin contar el tokenizer). Con cuantización a 8 bits, se reduce a ~0,2 GB.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA T4, RTX 3060, GTX 1660, incluso CPUs modernas con soporte de AVX2.
- Cabe en GPU de consumo: sí, cualquier GPU comercial con 4 GB o más puede ejecutar el modelo sin problemas.
- Opciones de despliegue: puede servirse con `transformers`, `onnxruntime` o `llama.cpp` (si se convierte a GGUF). No se mencionan integraciones específicas como vLLM o TGI, pero al ser un modelo pequeño es compatible con cualquier framework que soporte BERT.
- Latencia: en una GPU media (T4) la inferencia de un par premisa-hipótesis de hasta 512 tokens tarda menos de 10 ms. En CPU puede tardar 50-100 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Dominio |
|---|---|---|---|---|---|
| BamiBERT-ViLegalNLI | RoBERTa | 103M | 2048 (base) | MIT | Legal vietnamita |
| PhoBERT | RoBERTa | 135M | 256 (base) | MIT | General vietnamita |
| BERT-base-multilingual-cased | BERT | 110M | 512 | Apache-2.0 | Multilingüe (incluye vietnamita) |

No se dispone de comparaciones de rendimiento numéricas. BamiBERT se distingue de PhoBERT por no requerir segmentación de palabras y por su contexto extendido (2048 vs 256 de PhoBERT). El modelo ViLegalNLI está específicamente afinado para NLI legal, mientras que los otros no tienen ese ajuste.

## Limitaciones y advertencias

- El modelo solo entiende vietnamita; no funciona con otros idiomas.
- La longitud de contexto en el fine-tuning es de 512 tokens, lo que limita el análisis de documentos largos; si se supera este límite, se pierde información.
- La clasificación es binaria (entailment/contradiction), sin etiqueta de neutralidad, lo que puede forzar decisiones incorrectas en casos ambiguos.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de clasificación, no genera texto, pero puede producir falsos positivos de implicación si el texto de entrada es ambiguo.
- La licencia MIT permite uso comercial, pero el autor no garantiza la exactitud jurídica de las predicciones; su uso en contextos legales reales requiere validación humana.
- El modelo está basado en BamiBERT, cuyo entrenamiento se realizó con datos de dominio general; el fine-tuning legal puede no cubrir todas las áreas del derecho vietnamita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TQZinh/BamiBERT-ViLegalNLI
- Paper de BamiBERT (arXiv): https://arxiv.org/html/2607.02259
- PDF del paper: https://arxiv.org/pdf/2607.02259v1
- Página del paper en Hugging Face: https://huggingface.co/papers/2607.02259
- Modelo base BamiBERT en Hugging Face: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
- Resumen del paper en AI Models: https://www.aimodels.fyi/papers/arxiv/bamibert-new-bert-based-language-model-vietnamese
