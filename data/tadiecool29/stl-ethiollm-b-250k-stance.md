# tadiecool29/STL-ethiollm-b-250K-stance

## Resumen

STL-ethiollm-b-250K-stance es un modelo de clasificación de postura (stance detection) desarrollado por tadiecool29, obtenido mediante fine-tuning del modelo base EthioNLP/EthioLLM-b-250K. El modelo está diseñado para determinar la posición de un texto (a favor, en contra o neutral) respecto a un tema concreto, una tarea fundamental en el análisis de opiniones y el monitoreo de debates en redes sociales. Su relevancia radica en que está orientado a lenguas etíopes, un ámbito lingüístico poco cubierto por los modelos multilingües comerciales, y se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico.

El modelo cuenta con 278 millones de parámetros, un tamaño moderado que permite su ejecución en hardware de consumo. La model card publicada por el autor reporta métricas de evaluación con un F1 de 0,7233, precisión de 0,7252 y recall de 0,7226, aunque no se especifica el conjunto de datos de entrenamiento ni el de evaluación. Se trata de un modelo de clasificación de secuencias, no generativo, y su arquitectura hereda la del modelo base EthioLLM-b-250K, del que no se ofrecen detalles técnicos en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: EthioNLP/EthioLLM-b-250K) |
| Parametros totales | 278.046.724 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente lenguas etíopes, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la model card. El modelo base EthioNLP/EthioLLM-b-250K es un transformer de 250K parámetros (según su nombre), aunque el fine-tuning resultante tiene 278M parámetros, lo que sugiere que el modelo base real es más grande o que la cifra de 250K se refiere a otra magnitud. No se dispone de información sobre el número de capas, la dimensión de los embeddings ni el tipo de atención.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 1e-5, batch size de entrenamiento de 16, batch size de evaluación de 32, optimizador AdamW (fused) con betas (0.9, 0.999), scheduler de tipo cosine con 300 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica, ni su tamaño ni su composición. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar para clasificación.

## Capacidades

- Clasificación de postura (stance) en textos: determina si un texto está a favor, en contra o es neutral respecto a un tema.
- Específico para lenguas etíopes (presumiblemente amárico, oromo, tigriña, etc.), aunque no se confirma en la documentación.
- Modelo de clasificación de secuencias, no generativo; no produce texto libre.
- No se reporta soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se indica soporte para múltiples idiomas más allá del contexto etíope.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar tuits o publicaciones en amárico u otras lenguas etíopes para medir la opinión pública sobre temas políticos, sociales o de actualidad. Su tamaño moderado permite procesar grandes volúmenes de texto con recursos limitados.
- Monitoreo de debates parlamentarios o foros: permite etiquetar intervenciones según la postura hacia una propuesta o ley, facilitando el análisis de posicionamiento de los actores.
- Investigación académica en lingüística computacional: sirve como punto de partida para estudios sobre detección de postura en lenguas de bajos recursos, donde hay pocos modelos disponibles.
- Sistemas de alerta temprana de polarización: al clasificar la postura en conversaciones online, se puede detectar un aumento de posiciones extremas o enfrentadas en comunidades etíopes.
- Filtrado de contenido para moderación: ayuda a identificar mensajes que toman una postura clara sobre temas sensibles, permitiendo priorizar la revisión humana.
- Evaluación de campañas de comunicación: una organización puede medir si su mensaje genera posturas favorables o desfavorables en la audiencia etíope, usando el modelo para etiquetar respuestas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 0,9425 |
| Precision (stance) | 0,7252 |
| Recall (stance) | 0,7226 |
| F1 (stance) | 0,7233 |
| Accuracy (stance) | 0,7157 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandarizados como MMLU, HumanEval o GLUE. La tabla de entrenamiento muestra una mejora progresiva del F1 desde 0,6155 en la época 1 hasta 0,7233 en la época 9, con una ligera estabilización en las últimas épocas.

## Requisitos de hardware

- Con 278M parámetros, el modelo es ligero y cabe en GPUs de consumo. En FP32 ocuparía aproximadamente 1,1 GB (tamaño del repositorio), por lo que una GPU con 4 GB de VRAM es suficiente para inferencia sin cuantización.
- Con cuantización a 8 bits (si se aplicara) ocuparía unos 0,3 GB, y a 4 bits unos 0,15 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o incluso CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con Hugging Face Transformers, ONNX Runtime, o mediante frameworks como FastAPI para una API REST. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia para una secuencia de 128 tokens debería completarse en milisegundos, permitiendo cientos de predicciones por segundo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (detección de postura en lenguas etíopes) dentro de la documentación proporcionada. Los únicos modelos relacionados son otros fine-tunes del mismo autor sobre la misma familia EthioLLM, como tadiecool29/MTL-ethiollm-l-250K-finetuned y tadiecool29/MTL-ethiollm-large-stance-sentiment, pero no se ofrecen métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento y evaluación no se especifica, lo que impide conocer la distribución de clases, el dominio de los textos o posibles sesgos introducidos por la selección de datos.
- Las métricas reportadas (F1 de 0,72) indican un rendimiento moderado; no es un modelo de alta precisión y puede fallar en textos ambiguos o con lenguaje figurado.
- Al estar entrenado presumiblemente en lenguas etíopes, su uso fuera de ese ámbito lingüístico producirá resultados erróneos.
- No se documenta la longitud máxima de contexto soportada; los modelos de clasificación suelen limitarse a secuencias cortas (512 tokens típicamente), lo que restringe su uso en documentos largos.
- La licencia MIT permite uso comercial sin restricciones, pero al no conocerse el origen del dataset de entrenamiento, podría haber problemas de derechos de autor o privacidad si los datos contienen información personal.
- La model card está marcada como generada automáticamente y el autor indica que se necesita más información, por lo que la documentación es incompleta y no se puede verificar la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-ethiollm-b-250K-stance
- Modelo base EthioNLP/EthioLLM-b-250K: https://huggingface.co/EthioNLP/EthioLLM-b-250K
- Otro fine-tune del autor (MTL-ethiollm-l-250K-finetuned): https://huggingface.co/tadiecool29/MTL-ethiollm-l-250K-finetuned
- Otro fine-tune del autor (MTL-ethiollm-large-stance-sentiment): https://huggingface.co/tadiecool29/MTL-ethiollm-large-stance-sentiment
