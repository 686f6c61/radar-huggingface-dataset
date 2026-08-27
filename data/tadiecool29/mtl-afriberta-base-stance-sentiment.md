# tadiecool29/MTL-afriberta-base-stance-sentiment

## Resumen

El modelo `MTL-afriberta-base-stance-sentiment` es un ajuste fino (fine-tune) del modelo multilingüe `castorini/afriberta_base` (AfriBERTa base), desarrollado por el usuario `tadiecool29`. AfriBERTa base es un transformer preentrenado con alrededor de 111 millones de parámetros, diseñado específicamente para lenguas africanas de bajos recursos. Este fine-tune añade una cabecera de clasificación multitarea que predice simultáneamente la postura (stance) y el sentimiento de un texto, lo que lo convierte en una herramienta útil para análisis de opinión y detección de posicionamiento en dominios donde los modelos multilingües generalistas suelen fallar.

El modelo se publica con pesos en formato `safetensors` y está integrado en el ecosistema `transformers`. Aunque la model card es escasa en detalles sobre el dataset de entrenamiento y las limitaciones, los resultados de evaluación reportados por el autor indican un rendimiento moderado en las dos tareas (F1 de 0,7343 combinado). Su relevancia radica en que aborda dos tareas complementarias con un único modelo, aprovechando la representación multilingüe de AfriBERTa, y puede ser un punto de partida para sistemas de análisis de sentimiento y detección de posturas en contextos africanos o multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con 8 capas, 6 cabezas de atención, 768 unidades ocultas y 3072 de feed-forward |
| Parametros totales | 111.460.615 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base AfriBERTa usa 512 tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base fue preentrenado en 11 idiomas africanos: Afaan Oromoo, amárico, gahuza, hausa, igbo, pidgin nigeriano, etc.; el fine-tune no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `castorini/afriberta_base` es un transformer encoder de tipo BERT con 8 capas, 6 cabezas de atención, 768 unidades ocultas y 3072 unidades en la capa feed-forward. Fue preentrenado con un objetivo de modelado de lenguaje enmascarado sobre 11 idiomas africanos de bajos recursos, lo que le permite capturar representaciones lingüísticas específicas de esas lenguas. El fine-tune `MTL-afriberta-base-stance-sentiment` añade una cabecera de clasificación multitarea que produce dos salidas: una para la postura (stance) y otra para el sentimiento. El entrenamiento se realizó con una tasa de aprendizaje de 1e-5, tamaño de lote de 16, optimizador AdamW, programador de tasa coseno con 300 pasos de calentamiento y 6 épocas, usando precisión mixta nativa. No se especifica el dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO; la model card indica que el dataset es "None", lo que sugiere que la información no fue completada por el autor.

## Capacidades

- Clasificación de postura (stance): identifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema o entidad.
- Clasificación de sentimiento: detecta la polaridad afectiva del texto (positivo, negativo, neutro).
- Procesamiento multilingüe: al estar basado en AfriBERTa, hereda la capacidad de representar lenguas africanas de bajos recursos, aunque el fine-tune no especifica qué idiomas cubre.
- Integración con `transformers`: se puede cargar fácilmente con `AutoModelForSequenceClassification` o similar para tareas de clasificación de texto.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente discriminativo.

## Casos de uso

- Análisis de opinión en redes sociales: el modelo puede clasificar automáticamente tweets o publicaciones en lenguas africanas para detectar la postura y el sentimiento hacia un producto, político o evento, facilitando el monitoreo de marca o la investigación social.
- Detección de desinformación: combinando la postura y el sentimiento, se pueden identificar contenidos que expresan una postura negativa o escéptica hacia temas de salud pública o política, ayudando a priorizar la verificación de hechos.
- Atención al cliente automatizada: en un sistema de tickets, el modelo puede clasificar la postura del cliente (queja, solicitud, elogio) y el sentimiento asociado, permitiendo enrutar las incidencias más urgentes o negativas a agentes humanos.
- Investigación académica en lingüística computacional: sirve como herramienta de anotación automática para construir corpus etiquetados de stance y sentimiento en idiomas africanos, reduciendo el esfuerzo manual.
- Análisis de debates parlamentarios o foros públicos: el modelo puede clasificar intervenciones de políticos o ciudadanos para estudiar la polarización y las posturas sobre temas legislativos en contextos multilingües.
- Sistemas de recomendación de contenido: al conocer la postura y el sentimiento de un usuario hacia ciertos temas, se pueden personalizar feeds de noticias o recomendaciones de contenido en plataformas que operan en idiomas africanos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de evaluación durante el entrenamiento (última época):

| Metrica | Valor |
|---|---|
| Loss | 1,4347 |
| Stance F1 | 0,7627 |
| Sentiment F1 | 0,7060 |
| F1 (combinado) | 0,7343 |
| Stance Accuracy | 0,7544 |
| Sentiment Accuracy | 0,7107 |

No se han publicado comparaciones con otros modelos en la información disponible. La model card no incluye resultados en benchmarks externos como MMLU, GLUE o similares.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 111 millones de parámetros, la inferencia en FP32 requiere aproximadamente 445 MB de memoria para los pesos, más overhead de activaciones. Con cuantización a int8, el requisito baja a unos 112 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable latencia para tareas de clasificación.
- Despliegue: compatible con `transformers` (PyTorch), `ONNX Runtime`, `TensorFlow` (si se convierte) y herramientas como `vLLM` (aunque no es óptimo para modelos encoder pequeños). Para producción, se puede servir con `FastAPI` + `transformers` o mediante `Triton Inference Server`.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, la clasificación de un texto de longitud media (128 tokens) debería completarse en menos de 10 ms, permitiendo cientos de peticiones por segundo con batching.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (clasificación de stance y sentimiento en idiomas africanos). El modelo base AfriBERTa se puede comparar con otros modelos multilingües como `XLM-R` o `mBERT`, pero el fine-tune específico no tiene competidores documentados en la información proporcionada. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento, por lo que se desconoce la distribución de clases, el dominio textual y los posibles sesgos introducidos.
- No se ha documentado la licencia del modelo, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo solo realiza clasificación; no genera texto ni mantiene conversaciones.
- Al estar basado en AfriBERTa, su rendimiento en idiomas fuera de los 11 africanos preentrenados puede ser deficiente.
- Los resultados de evaluación reportados son del conjunto de validación del propio entrenamiento, no de un benchmark independiente, por lo que pueden no reflejar el rendimiento en datos reales.
- No se han publicado análisis de sesgos ni de alucinación (aunque al ser discriminativo, el riesgo de alucinación es menor que en modelos generativos).
- La longitud de contexto no está especificada; si se hereda de AfriBERTa, es de 512 tokens, lo que limita el análisis de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-afriberta-base-stance-sentiment
- Modelo base AfriBERTa: https://huggingface.co/castorini/afriberta_base
- Repositorio GitHub de AfriBERTa: https://github.com/castorini/afriberta
- Documentación de AfriBERTa en AI Model Zoo: https://zoo.bimant.com/model/12142
