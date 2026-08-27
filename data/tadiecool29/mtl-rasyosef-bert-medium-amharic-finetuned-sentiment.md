# tadiecool29/MTL-rasyosef-bert-medium-amharic-finetuned-sentiment

## Resumen

El modelo `MTL-rasyosef-bert-medium-amharic-finetuned-sentiment` es un ajuste fino (fine-tuning) de `rasyosef/bert-medium-amharic-finetuned-sentiment`, un BERT medio preentrenado desde cero para el amhárico y posteriormente afinado para clasificación de sentimiento. Este modelo concreto añade una segunda capa de ajuste, aparentemente orientada a tareas conjuntas de sentimiento y postura (stance) en textos amháricos, aunque el dataset de entrenamiento no está documentado en la model card.

Con 40,4 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo compacto y eficiente para procesamiento de lenguaje natural en amhárico, un idioma con escasos recursos. Su relevancia radica en ofrecer una opción ligera y especializada para análisis de sentimiento y detección de postura en este idioma, con un rendimiento moderado (F1 global de 0,7073 en evaluación). El autor no ha publicado licencia ni detalles sobre el corpus de entrenamiento, lo que limita su uso en producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT medium (encoder transformer, 8 capas, 512 hidden, 8 cabezas) |
| Parametros totales | 40.429.575 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | amhárico (por el modelo base y el nombre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT medium, un transformer encoder con 8 capas, dimensión oculta de 512 y 8 cabezas de atención. El modelo base `rasyosef/bert-medium-amharic` fue preentrenado desde cero sobre 290 millones de tokens de texto amhárico procedentes de los subconjuntos amháricos de OSCAR, mc4 y amharic-sentences-corpus, con un tokenizer propio de 28.672 tokens. Posteriormente, `rasyosef/bert-medium-amharic-finetuned-sentiment` se ajustó para clasificación de sentimiento sobre el dataset amharic-sentiment.

El modelo actual es un segundo ajuste fino sobre ese checkpoint, entrenado con una tasa de aprendizaje de 1e-5, batch de entrenamiento de 16, batch de evaluación de 32, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), scheduler coseno con 300 pasos de warmup y 6 épocas, usando precisión mixta nativa. Los resultados de entrenamiento muestran una mejora progresiva hasta la época 5, con una ligera caída en la época 6. No se especifica el dataset de este segundo ajuste ni si se emplearon técnicas como RLHF o DPO; la model card indica que fue generada automáticamente por el Trainer.

## Capacidades

- Clasificación de sentimiento en amhárico: asigna una etiqueta de polaridad (positiva, negativa, neutra) a textos.
- Detección de postura (stance): identifica la posición del autor respecto a un tema o entidad, con una métrica F1 de 0,7112.
- Procesamiento de texto en amhárico: tokenización y representación contextual específica para este idioma, gracias al preentrenamiento desde cero.
- Tareas de clasificación de secuencias: puede adaptarse a otras tareas de etiquetado de texto con un cabezal de clasificación adicional.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo exclusivamente encoder para comprensión.

## Casos de uso

- Análisis de opiniones en redes sociales amháricas: el modelo puede clasificar comentarios de Twitter, Facebook o foros en amhárico para medir la opinión pública sobre productos, políticos o eventos, aprovechando su doble salida de sentimiento y postura.
- Monitorización de noticias y medios amháricos: permite detectar la postura de artículos o titulares respecto a temas concretos, útil para estudios de medios o seguimiento de campañas.
- Atención al cliente en amhárico: integrado en un sistema de tickets, puede clasificar automáticamente el tono de las quejas (positivo/negativo) y la postura del cliente ante una resolución, priorizando los casos urgentes.
- Investigación académica en PLN de bajos recursos: sirve como punto de partida para experimentos de transferencia de aprendizaje o como baseline en tareas de sentimiento y stance en lenguas etíopes.
- Filtrado de contenido en plataformas amháricas: puede usarse para detectar discursos de odio o polarización, combinando la clasificación de sentimiento con la detección de postura hacia colectivos o ideas.
- Análisis de encuestas y feedback en amhárico: procesa respuestas abiertas de formularios para extraer la polaridad y la posición del encuestado, facilitando el análisis cuantitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card reporta métricas de evaluación sobre un conjunto no especificado:

| Metrica | Valor |
|---|---|
| Loss | 1,4411 |
| Stance F1 | 0,7112 |
| Sentiment F1 | 0,7033 |
| F1 global | 0,7073 |
| Stance Accuracy | 0,7032 |
| Sentiment Accuracy | 0,7082 |

Estos valores son moderados y sugieren que el modelo tiene margen de mejora. No hay comparación con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: ~160 MB en fp32 (40,4M parámetros × 4 bytes), ~80 MB en fp16. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050, o incluso CPU sola para inferencia).
- Compatible con GPUs de consumo: sí, todas las tarjetas de los últimos años pueden ejecutarlo sin problemas.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, o conversión a GGUF para llama.cpp/Ollama (aunque no hay cuantizaciones oficiales publicadas).
- Latencia: en CPU, inferencia de una frase corta en torno a 10-50 ms; en GPU, <5 ms. Throughput estimado de cientos de inferencias por segundo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (F1) |
|---|---|---|---|---|
| MTL-rasyosef-bert-medium-amharic-finetuned-sentiment | 40,4M | 512 | no disponible | 0,7073 (evaluación propia) |
| rasyosef/bert-medium-amharic-finetuned-sentiment (base) | 40,4M | 512 | no disponible | no disponible |
| rasyosef/bert-medium-amharic (preentrenado) | 40,5M | 512 | no disponible | no disponible |

No se dispone de comparativas con otros modelos amháricos (p. ej., XLM-R o AfriBERTa) en las mismas tareas. La información es insuficiente para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor; riesgo legal en producción.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y el equilibrio de clases, lo que impide evaluar sesgos.
- Contexto limitado a 512 tokens: no apto para documentos largos sin truncamiento.
- Solo amhárico: no soporta otros idiomas, y el vocabulario está restringido al tokenizer entrenado en ese idioma.
- Rendimiento moderado: F1 de 0,70 puede ser insuficiente para aplicaciones críticas; se recomienda validar con datos propios.
- Riesgo de alucinación en clasificación: como todo modelo de lenguaje, puede asignar etiquetas erróneas en entradas ambiguas o fuera de distribución.
- Sin soporte para generación ni tareas generativas: es un encoder puro, no sirve para chatbots ni redacción.
- Modelo creado con `generated_from_trainer`: la model card es automática y carece de detalles de evaluación externa o reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-rasyosef-bert-medium-amharic-finetuned-sentiment
- Modelo base (fine-tuned sentimiento): https://huggingface.co/rasyosef/bert-medium-amharic-finetuned-sentiment
- Modelo preentrenado en amhárico: https://huggingface.co/rasyosef/bert-medium-amharic
- Repositorio GitHub de los modelos BERT amháricos: https://github.com/rasyosef/bert-amharic
- Repositorio de clasificación de sentimiento amhárico: https://github.com/rasyosef/amharic-sentiment-classification
