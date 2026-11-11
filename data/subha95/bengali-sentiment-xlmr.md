# Subha95/bengali-sentiment-xlmr

## Resumen

`bengali-sentiment-xlmr` es un modelo de clasificación de texto obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-base` sobre un conjunto de datos de análisis de sentimiento en bengalí (el dataset no se especifica en la model card). Lo desarrolla el usuario Subha95 y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. El modelo tiene 278.047.493 parámetros y se distribuye en formato safetensors a través de la librería Transformers.

La relevancia del modelo radica en su especialización: parte de un encoder multilingüe preentrenado (XLM-RoBERTa base) y lo adapta a una tarea concreta de clasificación de sentimiento en un idioma de bajos recursos como el bengalí. Sin embargo, la información publicada es muy limitada: la model card fue generada automáticamente por el Trainer, no documenta el dataset de entrenamiento ni el número de clases, y no incluye resultados en el model-index.

Se trata, por tanto, de un modelo pequeño y ligero (apto para inferencia en CPU y GPUs de consumo), pero con documentación insuficiente para evaluar su robustez en producción. Los resultados declarados en el conjunto de evaluación (F1 macro 0,7058, exact match 0,4951) sugieren un rendimiento moderado que conviene validar en un conjunto propio antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base, fine-tuned para clasificación) |
| Parametros totales | 278.047.493 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (XLM-RoBERTa base soporta hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX, no documentada) |
| Idiomas soportados | No disponible (entrenado para bengalí según el nombre del modelo; el encoder base es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `FacebookAI/xlm-roberta-base`, un transformer encoder de tipo RoBERTa multilingüe con 278 millones de parámetros. La cabeza de clasificación se añade sobre el pooler del encoder para la tarea de clasificación de texto (text-classification). No se documenta el número de etiquetas ni la composición del dataset de entrenamiento; la model card indica literalmente "on the None dataset", lo que impide conocer la procedencia, el tamaño y el equilibrio de clases de los datos.

El entrenamiento se realizó con el Trainer de Transformers durante 5 épocas, con learning rate 2e-05, batch size efectivo de 16 (batch 8 con acumulación de gradientes de 2), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 60 pasos de warmup y semilla 42. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación; es un fine-tuning supervisado estándar. Las versiones de framework declaradas son Transformers 5.22.2, PyTorch 2.15.0+cu132, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto para análisis de sentimiento en bengalí (la model card no detalla el conjunto de etiquetas).
- Generación de embeddings de texto vía el encoder XLM-RoBERTa subyacente, reutilizables para otras tareas de NLP.
- Procesamiento de secuencias de hasta 512 tokens (límite arquitectónico de XLM-RoBERTa base; no confirmado explícitamente en la model card).
- Compatible con el pipeline `text-classification` de Transformers y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.
- Capacidad multilingüe potencial heredada del encoder base, aunque el fine-tuning se orienta a bengalí y no se documenta su comportamiento en otros idiomas.

## Casos de uso

- Análisis de sentimiento en redes sociales bengalíes: el modelo puede clasificar publicaciones o comentarios en bengalí para monitorizar la percepción de marca o de eventos, aprovechando el fine-tuning específico sobre XLM-RoBERTa.
- Moderación de contenido y detección de toxicidad indirecta: como clasificador binario o multiclase, puede integrarse en pipelines de filtrado previo para priorizar revisiones humanas en comunidades de habla bengalí.
- Análisis de opiniones de clientes: procesar reseñas de productos o encuestas en bengalí y agregar la polaridad para informes de satisfacción, con un coste de inferencia bajo al tratarse de un modelo de 278 M de parámetros.
- Enriquecimiento de datasets y etiquetado asistido: usar el modelo para preetiquetar grandes volúmenes de texto bengalí y reducir el esfuerzo de anotación manual, con revisión humana posterior.
- Investigación en NLP de bajos recursos: servir como baseline reproducible (semilla 42, hiperparámetros documentados) para comparar nuevas aproximaciones de análisis de sentimiento en bengalí.
- Clasificación por lotes en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, es adecuado para trabajos batch nocturnos o despliegues en dispositivos edge sin GPU dedicada.
- Extracción de embeddings para búsqueda semántica: reutilizar el encoder para indexar documentos en bengalí y construir sistemas de recuperación de información.

## Benchmarks y rendimiento

El model-index publicado no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas del conjunto de evaluación declaradas por el autor en la model card:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,3319 |
| F1 Macro | 0,7058 |
| F1 Micro | 0,75 |
| Precision Macro | 0,7860 |
| Recall Macro | 0,6669 |
| Exact Match Accuracy | 0,4951 |

Evolución durante el entrenamiento (mejor época, la 4):

| Epoca | Validation Loss | F1 Macro | F1 Micro | Precision Macro | Recall Macro | Exact Match |
|---|---|---|---|---|---|---|
| 1 | 0,5196 | 0,1546 | 0,4716 | 0,1297 | 0,1912 | 0,2317 |
| 2 | 0,3661 | 0,5971 | 0,6948 | 0,6155 | 0,5947 | 0,4098 |
| 3 | 0,3499 | 0,6163 | 0,7118 | 0,7704 | 0,6108 | 0,4195 |
| 4 | 0,3319 | 0,7058 | 0,75 | 0,7860 | 0,6669 | 0,4951 |
| 5 | 0,3289 | 0,6952 | 0,7472 | 0,7999 | 0,6607 | 0,4951 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La discrepancia entre F1 micro (0,75) y exact match (0,4951) sugiere un problema con múltiples etiquetas por instancia o un desequilibrio de clases considerable, pero no puede confirmarse sin conocer el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 1,5 y 2,5 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos; entre 1 y 1,5 GB con overhead.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos.
- Funciona en CPU con latencias aceptables para clasificación por lotes; no requiere GPU para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (tag oficial), ONNX Runtime, TorchScript, y servidores de inferencia compatibles con endpoints.
- No se dispone de datos de latencia ni throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Subha95/bengali-sentiment-xlmr | 278 M | No disponible (512 tokens por arquitectura base) | Clasificación de sentimiento en bengalí | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Encoder multilingüe base (sin fine-tuning para sentimiento) | MIT | Hugging Face |
| Modelos de sentimiento bengalí especializados (p. ej., variantes de BanglaBERT) | No disponible | No disponible | Clasificación de sentimiento en bengalí | No disponible | No disponible |

La comparación con alternativas específicas para bengalí no puede completarse con la información proporcionada; no se dispone de métricas comparables de otros modelos en el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Documentación insuficiente: la model card fue generada automáticamente, no especifica el dataset de entrenamiento ("None dataset"), el número de clases ni la definición de las etiquetas.
- Métricas moderadas: F1 macro de 0,7058 y exact match de 0,4951 indican un rendimiento limitado; el exact match bajo sugiere posibles problemas con etiquetas múltiples o desequilibrio de clases.
- Riesgo de sobreajuste: la loss de validación se estabiliza a partir de la época 4 y las métricas macro empeoran ligeramente en la época 5, lo que apunta a un posible sobreajuste con solo 5 épocas y un dataset pequeño (600 pasos totales, 120 por época).
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de dominio, género, dialecto o registro del bengalí.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas confiadas en dominios distintos al de entrenamiento.
- Cobertura lingüística limitada: aunque el encoder base es multilingüe, el fine-tuning se orienta a bengalí y no se documenta su comportamiento en otras lenguas o en variantes dialectales.
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales, pero no exime de validar el modelo en el dominio de aplicación.
- Advertencia para producción: con solo 8 descargas y 0 likes, el modelo carece de validación comunitaria; se recomienda evaluarlo en un conjunto de test propio antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Subha95/bengali-sentiment-xlmr
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Documentación de Transformers (text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
