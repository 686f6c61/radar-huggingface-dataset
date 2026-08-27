# tadiecool29/MTL-afroxlmr-base-stance-sentiment

## Resumen

MTL-afroxlmr-base-stance-sentiment es un modelo de clasificación multi-tarea desarrollado por tadiecool29, obtenido mediante fine-tuning del modelo multilingüe afro-xlmr-base (Davlan/afro-xlmr-base). Está diseñado para resolver simultáneamente dos tareas de análisis de texto: detección de postura (stance) y análisis de sentimiento. El modelo base, afro-xlmr-base, es una adaptación de XLM-R-base mediante masked language modeling sobre 17 lenguas africanas y 3 lenguas de alto recurso (árabe, francés e inglés), lo que lo hace especialmente relevante para procesamiento de lenguaje natural en contextos africanos y multilingües.

Con 278 millones de parámetros, este modelo se presenta como una solución ligera y eficiente para tareas de clasificación en entornos con recursos limitados. Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors facilita su integración en pipelines de transformers. Aunque la model card no especifica el dataset de entrenamiento, los resultados reportados indican un rendimiento moderado en las métricas de F1 y precisión para ambas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R-base) con dos cabezas de clasificación (stance y sentimiento) |
| Parametros totales | 278.049.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base afro-xlmr-base usa 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base cubre 17 lenguas africanas y 3 adicionales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-R-base, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, adaptado por Davlan/afro-xlmr-base mediante entrenamiento de masked language modeling en un corpus multilingüe africano. Sobre esta base, se añaden dos cabezas de clasificación independientes: una para stance (postura) y otra para sentimiento, compartiendo el mismo encoder. El fine-tuning se realizó con el framework transformers, utilizando un optimizador AdamW con learning rate de 1e-05, batch size de 16 para entrenamiento y 32 para evaluación, scheduler cosine con 300 pasos de warmup, y 6 épocas con mixed precision (AMP). No se especifica el dataset de entrenamiento en la model card, lo que limita la reproducibilidad del proceso.

## Capacidades

- Clasificación de postura (stance): determina si un texto expresa una posición a favor, en contra o neutral respecto a un tema.
- Análisis de sentimiento: clasifica el texto en categorías de sentimiento (positivo, negativo, neutral).
- Procesamiento multilingüe: hereda del modelo base la capacidad de manejar múltiples lenguas africanas y árabico, francés e inglés, aunque no se detallan los idiomas exactos del fine-tuning.
- Inferencia eficiente: al ser un modelo de 278M parámetros, es adecuado para despliegue en entornos con recursos computacionales limitados.
- Integración con transformers: compatible con la librería transformers y el formato safetensors, facilitando su uso en pipelines estándar.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de clasificación.

## Casos de uso

- Monitoreo de opinión en redes sociales: el modelo puede clasificar automáticamente comentarios o publicaciones en lenguas africanas para detectar posturas y sentimientos hacia marcas, políticos o eventos, permitiendo a organizaciones medir la percepción pública en tiempo real.
- Análisis de noticias y artículos periodísticos: permite etiquetar contenido informativo según su postura editorial y tono emocional, útil para estudios de medios o verificación de sesgos en coberturas.
- Atención al cliente automatizada: integrado en sistemas de tickets, puede clasificar la actitud del cliente (satisfecho, frustrado, neutral) y su postura ante un producto o servicio, priorizando respuestas para casos negativos.
- Investigación académica en ciencias sociales: facilita el análisis de corpus multilingües africanos para estudiar discursos políticos, movimientos sociales o campañas de salud pública, reduciendo el trabajo manual de anotación.
- Moderación de contenido en plataformas: ayuda a identificar comentarios con posturas extremas o sentimientos negativos que puedan requerir revisión humana, aunque no es un clasificador de toxicidad específico.
- Sistemas de recomendación de contenido: al conocer la postura y sentimiento del usuario hacia ciertos temas, se pueden personalizar feeds o sugerencias en aplicaciones de noticias o redes sociales.

## Benchmarks y rendimiento

Los resultados presentados a continuación son los declarados por el autor en la model card, obtenidos sobre el conjunto de evaluación. No se proporcionan comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Loss | 1.3078 |
| Stance F1 | 0.7826 |
| Sentiment F1 | 0.7244 |
| F1 (promedio) | 0.7535 |
| Stance Accuracy | 0.7756 |
| Sentiment Accuracy | 0.7282 |

La tabla de entrenamiento muestra una mejora progresiva del F1 desde 0.6918 en la primera época hasta 0.7535 en la sexta, con una estabilización en las últimas épocas. No se han publicado resultados en benchmarks estandarizados como MMLU o GLUE.

## Requisitos de hardware

- VRAM estimada: con 278M parámetros, el modelo en precisión fp32 ocupa aproximadamente 1.1 GB de memoria. En cuantización de 8 bits podría reducirse a unos 300-400 MB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja, así como en CPU para inferencia con baja latencia.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es compatible con llama.cpp si se convierte a formato GGUF, aunque no se proporciona.
- Latencia y throughput: no disponible; depende del hardware y la optimización. En una GPU moderna, la inferencia de un texto corto debería completarse en milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para tareas de stance y sentimiento en lenguas africanas. El modelo base afro-xlmr-base es un encoder multilingüe, pero no está especializado en estas tareas. Alternativas genéricas como XLM-R-base o mBERT podrían adaptarse con fine-tuning, pero no se han encontrado comparaciones publicadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide evaluar la representatividad de los datos y los posibles sesgos introducidos.
- El modelo está diseñado únicamente para clasificación; no genera texto ni realiza razonamiento complejo.
- La longitud de contexto está limitada a 512 tokens (heredada del modelo base), lo que restringe el análisis de documentos largos.
- No se han documentado los idiomas exactos cubiertos por el fine-tuning; aunque el modelo base soporta lenguas africanas, el rendimiento puede variar significativamente entre ellas.
- Al ser un modelo pequeño, su precisión en tareas de stance y sentimiento es moderada (F1 ~0.75), por lo que puede no ser adecuado para aplicaciones donde se requiera alta exactitud.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se han realizado evaluaciones de sesgos de género, etnia o religión, por lo que su uso en contextos sensibles requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-afroxlmr-base-stance-sentiment
- Modelo base afro-xlmr-base: https://huggingface.co/Davlan/afro-xlmr-base
- Documentación de afro-xlmr-base (README): https://huggingface.co/Davlan/afro-xlmr-base/blob/main/README.md
