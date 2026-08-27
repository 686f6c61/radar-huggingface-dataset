# whoisjones/otter-cross-mmbert

## Resumen

Otter es un reconocedor de entidades nombradas (NER) de tipo abierto y multilingüe desarrollado por whoisjones. A diferencia de los sistemas NER tradicionales con un conjunto fijo de etiquetas, Otter acepta los tipos de entidad como parte de la entrada en lenguaje natural, lo que permite identificar entidades arbitrarias sin necesidad de fine-tuning. El modelo presentado aquí, `otter-cross-mmbert`, es la variante cross-encoder, que antepone las etiquetas al texto mediante un prefijo `[LABEL] <tipo> ... [SEP]` para que el encoder procese conjuntamente etiquetas y texto, logrando mayor precisión que la variante bi-encoder a costa de re-codificar el texto para cada conjunto de etiquetas.

El modelo se basa en el encoder multilingüe mmBERT-base, un Transformer moderno entrenado sobre 3 billones de tokens en más de 1800 idiomas, con el vocabulario extendido con un token especial `[LABEL]`. Con 308,7 millones de parámetros y una ventana de contexto de 1024 tokens, Otter ofrece una solución flexible y zero-shot para extracción de entidades en múltiples idiomas, con licencia Apache 2.0 y pesos en formato safetensors. Su relevancia actual radica en la creciente demanda de sistemas NER adaptables a dominios específicos sin costosos procesos de anotación y entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer basado en mmBERT-base |
| Parametros totales | 308.766.848 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (basado en mmBERT, que cubre 1833 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Otter-cross-mmbert emplea una arquitectura cross-encoder: los tipos de entidad se serializan como prefijo `[LABEL] <tipo> [LABEL] <tipo> ... [SEP]` y se concatenan con el texto de entrada. De esta forma, un único encoder Transformer procesa simultáneamente etiquetas y texto, permitiendo que ambos se atiendan mutuamente. El encoder base es mmBERT-base, un modelo multilingüe moderno entrenado con annealed language learning sobre 3T tokens en más de 1800 idiomas, que supera a XLM-R en tareas de clasificación y recuperación. El vocabulario se extiende con un token especial `[LABEL]` para distinguir las etiquetas del texto.

El entrenamiento de Otter se realiza mediante un pipeline de datos y evaluación disponible en el repositorio GitHub del proyecto. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal reside en el diseño de NER de tipo abierto: no hay un conjunto de etiquetas fijo, sino que los tipos se definen en lenguaje natural en el momento de la inferencia, lo que permite adaptación zero-shot a dominios nuevos sin reentrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas de tipo abierto: acepta cualquier tipo de entidad descrito en lenguaje natural (p. ej., "person", "band", "chemical compound").
- Extracción de spans de caracteres con puntuación de confianza, incluyendo offsets de inicio y fin.
- Soporte multilingüe gracias al encoder mmBERT, que cubre más de 1800 idiomas.
- Inferencia zero-shot: no requiere fine-tuning para nuevos tipos de entidad.
- Procesamiento por lotes: acepta listas de textos y devuelve listas de entidades en el mismo orden.
- Umbral de decisión ajustable para controlar precisión/recall.
- Longitud máxima de span de 30 tokens, adecuada para entidades típicas.
- No se mencionan capacidades de tool calling, agentes, generación de texto ni visión; el modelo está especializado exclusivamente en NER.

## Casos de uso

- Extracción de entidades en documentos multilingües: dado un corpus en varios idiomas, el modelo identifica personas, organizaciones y lugares sin necesidad de adaptación previa, útil para empresas con operaciones internacionales.
- Análisis de noticias y medios: extraer entidades de artículos periodísticos para clasificación temática, seguimiento de protagonistas o detección de tendencias.
- Procesamiento de documentos legales: identificar partes contratantes, fechas, lugares y conceptos jurídicos en contratos o sentencias, facilitando la indexación y búsqueda.
- Indexación semántica para motores de búsqueda: las entidades extraídas se utilizan como metadatos para mejorar la recuperación de información en bases documentales.
- Chatbots y asistentes virtuales: extraer entidades de las consultas de los usuarios (productos, ubicaciones, fechas) para enrutar la conversación o personalizar respuestas.
- Monitoreo de marca en redes sociales: detectar menciones de productos, competidores o personas influyentes en publicaciones de múltiples idiomas, con tipos de entidad definidos ad hoc.
- Sistemas de recomendación: analizar reseñas de usuarios para extraer entidades relevantes (características, marcas, lugares) y alimentar algoritmos de recomendación.
- Análisis de datos biomédicos: identificar compuestos químicos, proteínas o enfermedades en literatura científica, definiendo etiquetas específicas del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de precisión, recall o F1, ni comparaciones con otros sistemas NER. El umbral de predicción por defecto (0.5) se calibró según macro-F1 en la suite de evaluación, pero no se detallan los valores obtenidos.

## Requisitos de hardware

- El modelo tiene 308,7 millones de parámetros, con un tamaño de archivo safetensors de 1,3 GB (presumiblemente en precisión fp32). En fp16, el peso ocuparía aproximadamente 0,6 GB.
- Para inferencia en GPU, se estima un consumo de VRAM de 1-2 GB en fp16 y 2-3 GB en fp32, dependiendo del tamaño del batch. Esto permite ejecutarlo en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- En CPU, la inferencia es viable para lotes pequeños o aplicaciones no críticas en latencia, gracias al tamaño moderado del modelo.
- Opciones de despliegue: el modelo se carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True` de la librería Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que es un encoder y no un modelo generativo.
- No se dispone de datos oficiales de latencia o throughput. Para una estimación, un modelo de 308M en una GPU moderna puede procesar decenas de secuencias por segundo, pero depende del hardware y la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de NER de tipo abierto y multilingüe en la documentación proporcionada. Sin embargo, dentro de la familia Otter existen variantes que pueden compararse:

| Modelo | Arquitectura | Encoder | Contexto | Parámetros | Licencia |
|---|---|---|---|---|---|
| otter-cross-mmbert | Cross-encoder | mmBERT-base | 1024 | 308,7M | Apache 2.0 |
| otter-bi-mmbert | Bi-encoder | mmBERT-base | 1024 | no disponible | Apache 2.0 |
| otter-cross-rembert | Cross-encoder | RemBERT | no disponible | no disponible | Apache 2.0 |
| otter-bi-rembert | Bi-encoder | RemBERT | no disponible | no disponible | Apache 2.0 |

Los cross-encoders son más precisos, mientras que los bi-encoders son más eficientes cuando se aplica un mismo conjunto de etiquetas a un corpus grande. No se dispone de datos de rendimiento comparativo con otros sistemas NER como spaCy, Stanza o GLiNER.

## Limitaciones y advertencias

- Al ser un modelo NER, puede presentar sesgos en ciertos idiomas o tipos de entidad, especialmente en lenguas con menos representación en los datos de entrenamiento de mmBERT.
- Riesgo de alucinación: el modelo puede generar spans que no corresponden a entidades reales, especialmente con umbrales bajos o etiquetas ambiguas.
- Limitación de contexto: la ventana máxima es de 1024 tokens, y el prefijo de etiquetas consume parte de esa longitud, reduciendo el espacio disponible para el texto en conjuntos de etiquetas largos.
- Longitud máxima de span de 30 tokens: entidades más largas (p. ej., títulos de obras) pueden no detectarse correctamente.
- La calidad de la extracción depende críticamente de la redacción de los nombres de etiqueta; términos vagos o inconsistentes degradan el rendimiento.
- No se proporcionan datos de rendimiento cuantitativo, por lo que es necesario validar el modelo en el dominio de aplicación antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del encoder base mmBERT (también Apache 2.0 según su repositorio).
- El modelo requiere `trust_remote_code=True` al cargarlo, lo que implica ejecutar código personalizado del autor; se debe auditar el código en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whoisjones/otter-cross-mmbert
- Repositorio GitHub de Otter: https://github.com/whoisjones/otter
- Modelo bi-encoder con mmBERT: https://huggingface.co/whoisjones/otter-bi-mmbert
- Paper de mmBERT: https://arxiv.org/abs/2509.06888
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
