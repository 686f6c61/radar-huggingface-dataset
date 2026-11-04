# watermelonlalala/nusabert-metadata-s1

## Resumen

nusabert-metadata-s1 es un modelo de clasificación de texto en indonesio obtenido por fine-tuning de LazarusNLP/NusaBERT-base, un BERT base entrenado específicamente para ese idioma. Lo publica el usuario watermelonlalala en HuggingFace y su tarea concreta es la clasificación binaria de toxicidad: cada texto de entrada se etiqueta como `non_toxic` o `toxic`. El modelo tiene 110.643.458 parámetros (BERT base, 12 capas, dimensión oculta 768) y un repositorio de 0,4 GB en formato safetensors.

El interés técnico del modelo es limitado pero claro: se trata de un ajuste fino con búsqueda de hiperparámetros mediante Optuna sobre una base ya especializada en indonesio, lo que lo hace directamente utilizable en pipelines de moderación de contenido para ese idioma con la librería transformers y con Text Embeddings Inference. No es un modelo generativo ni un LLM: es un clasificador discriminativo que devuelve una etiqueta y su probabilidad.

En el momento de redactar esta ficha el modelo no tiene descargas ni likes registrados, la licencia no está declarada y no se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento. Cualquier evaluación de su calidad real requiere probarlo contra un conjunto de validación propio en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), fine-tuned para clasificación de secuencias |
| Parametros totales | 110.643.458 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la del BERT base original es 512 tokens) |
| Tipos de cuantizacion | no disponible (compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder tipo BERT base: 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros, con una cabeza de clasificación de una sola etiqueta (`single_label_classification`) añadida sobre el token [CLS]. El modelo parte de LazarusNLP/NusaBERT-base, un BERT entrenado para indonesio, y se ajusta fino para distinguir entre contenido tóxico y no tóxico.

Según la model card, los hiperparámetros se seleccionaron mediante Optuna, lo que sugiere una búsqueda automatizada de tasa de aprendizaje, batch size y número de épocas, aunque el autor no publica los valores elegidos, el número de pasos de entrenamiento ni la composición del dataset. Tampoco se documenta si hubo balanceo de clases, aumento de datos o validación cruzada. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre el proceso de anotación de las etiquetas.

## Capacidades

- Clasificación binaria de toxicidad en indonesio: devuelve `toxic` o `non_toxic` con la probabilidad asociada.
- Procesamiento de texto corto y medio típico de comentarios, publicaciones y mensajes en redes sociales.
- Integración directa con `AutoTokenizer` y `AutoModelForSequenceClassification` de transformers.
- Compatible con Text Embeddings Inference y con endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al indonesio; no se ha validado su comportamiento en malayo, javanés u otras lenguas cercanas.
- El autor recomienda aplicar el mismo preprocesado que en entrenamiento (minúsculas, normalización de emojis, menciones y URLs) para que las predicciones sean consistentes.

## Casos de uso

- Moderación de comentarios en plataformas indonesias: el modelo clasifica cada comentario como tóxico o no tóxico antes de publicarlo, con un coste de inferencia bajo al ser un BERT base de 110 millones de parámetros.
- Filtrado previo en foros y comunidades: se puede ejecutar sobre el flujo de ingesta para derivar los mensajes marcados como `toxic` a revisión humana, reduciendo la carga de los moderadores.
- Análisis de sentimiento tóxico en monitorización de marca: procesar menciones en redes sociales en indonesio y agregar la proporción de contenido tóxico por campaña o periodo.
- Etiquetado de datasets para entrenamiento de modelos mayores: usar el clasificador como anotador automático de grandes volúmenes de texto en indonesio antes de entrenar un LLM o un clasificador más grande.
- Detección de abuso en sistemas de atención al cliente: clasificar los mensajes entrantes de usuarios y activar protocolos de escalado cuando se detecta toxicidad.
- Investigación en NLP indonesio: servir como baseline de clasificación de toxicidad para comparar con modelos multilingües o con clasificadores basados en LLM.
- Preprocesado en pipelines de moderación con Text Embeddings Inference: desplegarlo como servicio HTTP de baja latencia junto a otros clasificadores del mismo stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos en la model card, y el repositorio no contiene informes de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: alrededor de 0,45 GB solo para los pesos, más el overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,25 GB de pesos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción de alto throughput: T4, L4, A10G, A100 o H100, aunque el modelo es lo bastante pequeño como para que la CPU sea viable en cargas moderadas.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (soportado según los tags), ONNX Runtime y cualquier servidor compatible con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un BERT base, la latencia por petición en GPU debería situarse en el orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| watermelonlalala/nusabert-metadata-s1 | 110,6 M | no disponible | Clasificación de toxicidad en indonesio | no disponible | HuggingFace, 0 descargas |
| LazarusNLP/NusaBERT-base | no disponible en la información proporcionada | no disponible | Modelo base BERT para indonesio | no disponible | HuggingFace |
| indobert-base-p2 (IndoBERT) | ~124 M | 512 tokens | Modelo base BERT para indonesio | no disponible | HuggingFace |
| xlm-roberta-base | ~278 M | 512 tokens | Modelo multilingüe base | MIT | HuggingFace |

La comparación directa con clasificadores de toxicidad específicos para indonesio no está disponible en la información proporcionada. Frente a un modelo multilingüe como XLM-R, este ajuste fino tiene la ventaja de un tamaño menor y de estar especializado en indonesio, pero carece de métricas publicadas que permitan afirmar que su rendimiento es superior.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: se desconoce la precisión, el recall y el F1 del modelo, así que no se puede garantizar su calidad en producción sin una validación propia.
- Sesgos desconocidos: el autor no documenta la composición del dataset de entrenamiento ni cómo se definió la toxicidad, por lo que pueden existir sesgos hacia determinados registros, dialectos o grupos.
- Riesgo de falsos positivos y falsos negativos en contextos irónicos, sarcásticos o con jerga regional indonesia no representada en el entrenamiento.
- Dependencia del preprocesado: si el texto de entrada no se normaliza igual que en entrenamiento (minúsculas, emojis, menciones, URLs), las predicciones pueden degradarse.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor o asumir los términos del modelo base.
- Modelo sin tracción: cero descargas y cero likes en el momento de la ficha, sin comunidad que haya validado su comportamiento.
- Contexto limitado al del BERT base original (512 tokens); textos más largos requieren truncado o segmentación.
- Solo indonesio: no se ha evaluado su comportamiento en malayo ni en otras lenguas austronesias cercanas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/watermelonlalala/nusabert-metadata-s1
- Modelo base: https://huggingface.co/LazarusNLP/NusaBERT-base
