# vietnamese-acsa/bamibert-res-acsa-multilabel

## Resumen

El modelo `vietnamese-acsa/bamibert-res-acsa-multilabel` es un modelo de clasificación de texto multilabel, aparentemente un fine-tuning de BamiBERT, un modelo de lenguaje preentrenado para vietnamita desarrollado por Qualcomm AI Research. BamiBERT se entrena desde cero sobre un corpus de 129 GB de texto vietnamita generalista durante 20 épocas, con una longitud de contexto ampliada a 2048 tokens y operando directamente sobre texto crudo, sin necesidad de tokenización externa. Este fine-tuning concreto, cuyo nombre sugiere un dominio de restaurantes (res) y análisis de sentimiento basado en aspectos (ACSA), está diseñado para tareas de clasificación de texto con múltiples etiquetas simultáneas.

La model card es extremadamente escasa: no especifica el dataset de entrenamiento, ni las etiquetas, ni el rendimiento. El repositorio contiene únicamente los pesos en formato safetensors (102,9 millones de parámetros) y los hiperparámetros de entrenamiento. A pesar de la falta de documentación, el modelo es relevante para quienes trabajan con procesamiento de lenguaje natural en vietnamita y necesitan un clasificador multilabel basado en un encoder moderno, aunque su uso en producción requeriría una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT/RoBERTa, variante BamiBERT) |
| Parametros totales | 102.988.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (según BamiBERT base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (inferido por el nombre y el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base BamiBERT es un encoder transformer tipo BERT, entrenado desde cero sobre 129 GB de texto vietnamita durante 20 épocas, con una longitud de contexto de 2048 tokens. A diferencia de PhoBERT, BamiBERT procesa texto crudo sin necesidad de tokenización externa (word segmentation), lo que simplifica el pipeline. Este fine-tuning añade una cabeza de clasificación multilabel sobre la representación de la secuencia, entrenada con los siguientes hiperparámetros: learning rate 5e-05, batch de entrenamiento 8, batch de evaluación 32, optimizador AdamW (fused), scheduler lineal y 3 épocas. No se especifica el dataset de fine-tuning ni el número de etiquetas.

## Capacidades

- Clasificación de texto multilabel: el modelo asigna una o más etiquetas a un texto de entrada, típico en análisis de sentimiento basado en aspectos (ACSA).
- Procesamiento de vietnamita: al estar basado en BamiBERT, hereda la capacidad de representar texto vietnamita sin segmentación previa.
- Contexto de hasta 2048 tokens, suficiente para documentos de longitud media.
- No se documentan capacidades de generación, tool calling, agentes o multimodales.

## Casos de uso

- Análisis de opiniones en restaurantes: dado un comentario en vietnamita, el modelo puede identificar aspectos (comida, servicio, ambiente) y su sentimiento asociado (positivo, negativo, neutro) de forma simultánea.
- Moderación de reseñas en plataformas de delivery: clasificar comentarios en categorías como "queja", "elogio", "sugerencia" y "problema de entrega" para priorizar respuestas.
- Monitorización de redes sociales: detectar menciones negativas sobre una marca en vietnamita, etiquetando múltiples temas a la vez (precio, calidad, atención).
- Análisis de encuestas de satisfacción: categorizar respuestas abiertas en varias dimensiones (limpieza, rapidez, trato) para generar informes automáticos.
- Filtrado de contenido en foros o comunidades: asignar etiquetas temáticas a publicaciones para moderación o recomendación.
- Investigación académica en PLN vietnamita: servir como punto de partida para experimentos de clasificación multilabel, aunque requiere validación de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de HuggingFace está vacío y la model card no incluye métricas de evaluación.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~103M parámetros, la inferencia en FP32 requiere aproximadamente 0,4 GB de VRAM solo para los pesos; con cuantización a int8 o int4 se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPU con suficiente RAM).
- Es compatible con consumer GPUs de gama baja y media.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face Inference Endpoints, o mediante la librería `transformers` en Python. También es compatible con text-embeddings-inference según los tags.
- Latencia y throughput: no disponibles, pero para un modelo de este tamaño se espera una latencia de decenas de milisegundos por ejemplo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bamibert-res-acsa-multilabel (este) | 103M | 2048 | no disponible | Fine-tuning para clasificación multilabel, sin benchmarks publicados |
| PhoBERT (base) | 135M | 256 | MIT | Encoder vietnamita clásico, requiere segmentación de palabras |
| BamiBERT (base) | 103M | 2048 | no disponible | Modelo base sin fine-tuning, entrenado en 129GB de texto vietnamita |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas de clasificación multilabel.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento ni las etiquetas, por lo que el comportamiento real es desconocido.
- No hay métricas de evaluación publicadas; no se puede garantizar precisión, recall o F1 en ninguna tarea.
- El modelo puede heredar sesgos del corpus de preentrenamiento de BamiBERT, que no se documentan.
- Riesgo de alucinación en clasificación: al ser un modelo discriminativo, no genera texto, pero puede asignar etiquetas incorrectas si el dominio de fine-tuning difiere del de uso.
- Licencia no disponible: no se puede confirmar si es permitido su uso comercial o la redistribución.
- El nombre sugiere un dominio de restaurantes, pero no hay confirmación; usarlo en otros dominios puede degradar el rendimiento.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vietnamese-acsa/bamibert-res-acsa-multilabel
- Modelo base BamiBERT: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
- Paper de BamiBERT (arXiv): https://arxiv.org/abs/2607.02259
- Versión HTML del paper: https://arxiv.org/html/2607.02259v1
- Página de BamiBERT en Inferix: https://inferix.co/models/Qualcomm-AI-Research/BamiBERT
