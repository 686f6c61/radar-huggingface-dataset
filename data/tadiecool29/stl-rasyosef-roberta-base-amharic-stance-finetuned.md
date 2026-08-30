# tadiecool29/STL-rasyosef-roberta-base-amharic-stance-finetuned

## Resumen

STL-rasyosef-roberta-base-amharic-stance-finetuned es un modelo de detección de postura (stance detection) en amárico, desarrollado por tadiecool29 mediante fine-tuning del modelo rasyosef/roberta-base-amharic. El modelo clasifica textos en amárico según la postura o sentimiento expresado, empleando una arquitectura RoBERTa base de aproximadamente 110 millones de parámetros. Su relevancia radica en cubrir una tarea de clasificación de texto para un idioma de bajos recursos como el amárico, donde la disponibilidad de modelos especializados es limitada.

El modelo fue entrenado durante 10 épocas con un learning rate de 1e-05, scheduler coseno y optimizador AdamW, alcanzando un F1 de 0,7675 en el conjunto de evaluación. Está disponible en formato safetensors y es compatible con la librería transformers de HuggingFace. El autor declara las métricas bajo la etiqueta "sentiment" aunque el nombre del modelo indica fine-tuning para stance, lo que sugiere cierta ambigüedad en la definición de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder-only) |
| Parametros totales | 110.619.652 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (valor tipico de RoBERTa base, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en RoBERTa, una arquitectura transformer encoder-only preentrenada con un objetivo de modelado de lenguaje enmascarado (MLM). La variante base cuenta con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El fine-tuning se realizó sobre rasyosef/roberta-base-amharic, un modelo RoBERTa preentrenado específicamente para amárico, añadiendo una cabeza de clasificación sobre el token [CLS].

El entrenamiento se llevó a cabo con un learning rate de 1e-05, batch size de 16 para entrenamiento y 32 para evaluación, 10 épocas, scheduler coseno con 300 pasos de warmup y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado por el autor. La pérdida de entrenamiento desciende hasta 0,0122 en la época 8, mientras que la pérdida de validación aumenta progresivamente desde 0,6501 en la época 1 hasta 1,5291 en la época 8, lo que indica un claro sobreajuste al conjunto de entrenamiento.

## Capacidades

- Detección de postura (stance detection) en textos en amárico, clasificando la posición o sentimiento expresado.
- Clasificación de texto de secuencia completa mediante la cabeza de clasificación añadida sobre el token [CLS].
- Fine-tuning específico para tareas de análisis de opinión y sentimiento en amárico.
- Compatible con pipelines de transformers para inferencia y fine-tuning adicional.
- Soporte de endpoints compatible, segun las etiquetas del repositorio.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar publicaciones en amárico en X (Twitter), Facebook o foros para determinar la postura de los usuarios sobre temas concretos, facilitando estudios de opinión pública en Etiopía.
- Monitoreo de noticias: permite categorizar artículos de prensa amárica según la postura editorial hacia entidades o eventos, útil para medios y agencias de análisis.
- Investigación académica en PNL: sirve como punto de partida para estudios sobre detección de postura en idiomas de bajos recursos, permitiendo comparar estrategias de fine-tuning y aumentación de datos.
- Análisis de discurso político: puede aplicarse a discursos y declaraciones de políticos etíopes para identificar posturas sobre políticas o candidatos.
- Sistemas de recomendación de contenido: integrable en plataformas que necesiten filtrar o priorizar contenido amárico según la postura expresada.
- Evaluación de campañas de marketing: permite a empresas analizar la recepción de campañas publicitarias en el mercado etíope mediante el análisis de comentarios y reseñas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación tras el entrenamiento completo (época 8):

| Metrica | Valor |
|---|---|
| Pérdida (loss) | 1,5291 |
| Precisión (sentiment precision) | 0,7696 |
| Recall (sentiment recall) | 0,7659 |
| F1 | 0,7675 |
| Exactitud (sentiment accuracy) | 0,7581 |

Evolución del F1 durante el entrenamiento: el mejor valor se alcanzó en la época 5 con 0,7745, descendiendo ligeramente en épocas posteriores. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 110 millones de parámetros, lo que supone aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs compatibles: NVIDIA GTX 1060 6GB, RTX 3060, RTX 4060, RTX 4090, asi como GPUs de datacenter como A100 o H100.
- Inferencia en CPU viable para clasificación por lotes pequeños gracias al tamaño reducido del modelo.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, TorchServe, o exportación a otros formatos. El repositorio incluye la etiqueta endpoints_compatible, lo que sugiere compatibilidad con la inference API de HuggingFace.
- Latencia estimada: del orden de milisegundos por muestra en GPU moderna, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de postura en amárico en los datos proporcionados. El modelo base rasyosef/roberta-base-amharic es la referencia principal, y su rendimiento sin fine-tuning no se ha documentado en esta ficha. No se puede establecer una comparativa rigurosa sin datos adicionales de modelos alternativos.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar la cobertura de dominios, el equilibrio de clases y los posibles sesgos introducidos.
- La licencia del modelo no está especificada, por lo que no se puede garantizar su uso comercial o en producción sin consultar al autor.
- Las métricas están declaradas como "sentiment" aunque el modelo se denomina "stance-finetuned"; la terminología inconsistente sugiere que la tarea exacta podría no estar bien definida.
- La pérdida de validación aumenta significativamente a partir de la época 3 (de 0,6501 a 1,5291 en la época 8), lo que indica sobreajuste al conjunto de entrenamiento.
- El modelo solo soporta amárico, limitando su uso a textos en este idioma.
- Sin cuantizaciones publicadas ni soporte documentado para herramientas como vLLM u Ollama.
- Con 0 descargas y 0 likes en HuggingFace, es un modelo sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-rasyosef-roberta-base-amharic-stance-finetuned
- Modelo base: https://huggingface.co/rasyosef/roberta-base-amharic
- Colección de modelos de embeddings en amárico: https://huggingface.co/collections/rasyosef/amharic-text-embedding-models
- Perfil del autor del modelo base: https://huggingface.co/rasyosef/collections
- Paper sobre modelos de embedding en amárico: https://aclanthology.org/2025.findings-acl.543.pdf
- Repositorio de clasificación de noticias en amárico: https://github.com/rasyosef/amharic-news-category-classification
