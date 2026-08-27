# tadiecool29/MTL-amroberta-stance-sentiment

## Resumen

El modelo `MTL-amroberta-stance-sentiment` es un fine-tuning del modelo `uhhlt/am-roberta` (una variante de RoBERTa entrenada para amárico) para realizar de forma conjunta dos tareas de clasificación de texto: detección de postura (stance) y análisis de sentimiento. Ha sido desarrollado por el usuario `tadiecool29` y publicado en Hugging Face con licencia MIT. El modelo se enmarca en un enfoque de aprendizaje multitarea (MTL) modular, descrito en el artículo "Modular Multi-Task Learning for Emotion-Aware Stance Inference", que busca abordar la complejidad emocional de los contenidos generados por usuarios en redes sociales.

Con 442,88 millones de parámetros, el modelo es un encoder Transformer de tipo RoBERTa, adaptado al amárico. Su relevancia radica en ofrecer una solución específica para el análisis de opinión en un idioma de bajos recursos, combinando dos tareas complementarias en un único modelo. Aunque no se especifica la longitud de contexto, es previsible que herede el límite típico de RoBERTa (512 tokens). El repositorio incluye pesos en formato `safetensors` y es compatible con la librería `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa) |
| Parametros totales | 442.880.263 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, heredado de RoBERTa) |
| Tipos de cuantizacion | no disponible (solo safetensors, precision no especificada) |
| Idiomas soportados | amárico (inferido del modelo base `uhhlt/am-roberta`, no declarado explicitamente) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `uhhlt/am-roberta`, un encoder Transformer de tipo RoBERTa preentrenado en amárico. Sobre esta base se ha realizado un fine-tuning multitarea con dos cabezas de clasificación: una para detección de postura (a favor, en contra, neutral) y otra para análisis de sentimiento (positivo, negativo, neutral). El entrenamiento se realizó con el `Trainer` de Hugging Face, utilizando una tasa de aprendizaje de 1e-5, optimizador AdamW (betas 0.9/0.999), scheduler coseno con 300 pasos de calentamiento, batch de 16 para entrenamiento y 32 para evaluación, y 6 épocas con precisión mixta (AMP). No se especifica el tamaño ni la composición del dataset de entrenamiento, aunque el artículo asociado menciona un framework MTL modular que integra un encoder compartido basado en RoBERTa.

## Capacidades

- Clasificación de postura (stance) en textos cortos: identifica si el autor está a favor, en contra o neutral respecto a un tema.
- Análisis de sentimiento: clasifica el texto en positivo, negativo o neutral.
- Procesamiento de texto en amárico, un idioma etíope de bajos recursos.
- Salida dual simultánea: el modelo produce dos etiquetas por entrada (postura y sentimiento) en una sola pasada.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Monitoreo de opinión pública en redes sociales en amárico: el modelo puede analizar tweets o publicaciones de Facebook para detectar la postura de los usuarios sobre temas políticos o sociales, y su sentimiento asociado, permitiendo a periodistas o analistas seguir tendencias en tiempo real.
- Detección de desinformación: combinando postura y sentimiento, se pueden identificar contenidos que expresan una postura contraria a hechos verificados con una carga emocional negativa, ayudando a priorizar la revisión manual de posibles bulos.
- Investigación académica en procesamiento del lenguaje natural para lenguas africanas: sirve como punto de partida para estudios comparativos sobre análisis de opinión en amárico, dado que es uno de los pocos modelos específicos para este idioma.
- Análisis de campañas electorales: partidos políticos o consultoras pueden usar el modelo para medir la recepción de sus mensajes en amárico, clasificando la postura y el sentimiento de las respuestas de los votantes en redes sociales.
- Atención al cliente en servicios locales: empresas etíopes pueden integrar el modelo en sus sistemas de escucha social para clasificar comentarios de clientes en amárico, identificando quejas (sentimiento negativo) y su postura hacia la marca.
- Moderación de contenido en plataformas amáricas: el modelo puede preclasificar comentarios según su postura y sentimiento, facilitando la labor de moderadores humanos al priorizar contenidos con sentimiento extremo o posturas polarizadas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 1.4867 |
| Stance F1 | 0.7333 |
| Sentiment F1 | 0.7019 |
| F1 (media) | 0.7176 |
| Stance Acc | 0.7257 |
| Sentiment Acc | 0.7057 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El `model-index` de la model card no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 442,88 millones de parámetros. En FP32 (4 bytes por parámetro) los pesos ocupan ~1,77 GB; en FP16 ~0,88 GB. Con overhead de activaciones y buffers, se recomienda al menos 4 GB de VRAM para FP16 y 6 GB para FP32.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM, como RTX 3060, RTX 3070, RTX 4060, o GPUs de datacenter como A10, T4 o V100. Una RTX 4090 o A100 sería excesiva pero funcionaría sin problemas.
- Inferencia en CPU: posible, aunque más lenta; con 442M parámetros, un procesador moderno puede procesar unas pocas decenas de secuencias por segundo.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con Hugging Face Inference Endpoints, o mediante frameworks como vLLM (aunque no es óptimo para clasificación), o simplemente con la API de `pipeline` de transformers. También se puede exportar a ONNX para optimización.
- Latencia estimada: en una GPU T4, una inferencia de una secuencia de 128 tokens debería tardar entre 5 y 15 ms, dependiendo del batch.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de postura o sentimiento en amárico. Como referencia, se puede comparar con el modelo base `uhhlt/am-roberta` (sin fine-tuning), que no está especializado en estas tareas y no produce salidas de clasificación directas. Tampoco se conocen modelos alternativos específicos para amárico en estas tareas en el ecosistema de Hugging Face. Por tanto, la comparativa se limita a indicar que este modelo es, hasta donde se sabe, una de las pocas opciones disponibles para análisis de postura y sentimiento en amárico.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para amárico; no es utilizable en otros idiomas.
- No genera texto: es un clasificador de secuencias, por lo que no es adecuado para tareas generativas.
- Los datos de entrenamiento no están documentados; no se conocen los dominios ni la posible existencia de sesgos en el dataset.
- Las métricas reportadas (F1 ~0.72) indican un rendimiento moderado; puede haber errores en textos con jerga, sarcasmo o contextos poco representados.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el modelo base `uhhlt/am-roberta` también tenga una licencia permisiva (se asume que sí, pero no se ha confirmado).
- No se especifica la longitud de contexto; si se hereda de RoBERTa, será de 512 tokens, lo que limita el análisis de textos largos.
- El modelo fue creado en 2026, por lo que su mantenimiento y soporte a largo plazo no está garantizado.

## Enlaces

- [Hugging Face - MTL-amroberta-stance-sentiment](https://huggingface.co/tadiecool29/MTL-amroberta-stance-sentiment)
- [Modelo base uhhlt/am-roberta](https://huggingface.co/uhhlt/am-roberta)
- [Artículo: Modular Multi-Task Learning for Emotion-Aware Stance Inference (MDPI)](https://www.mdpi.com/2227-7390/13/20/3287)
- [Resumen en Semantic Scholar](https://www.semanticscholar.org/paper/Modular-Multi-Task-Learning-for-Emotion-Aware-in-Im-Chan/7bf21ab0ce2d54874a2aea9347505d82936228b4)
