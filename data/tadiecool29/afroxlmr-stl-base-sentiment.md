# tadiecool29/afroxlmr-stl-base-sentiment

## Resumen

El modelo afroxlmr-stl-base-sentiment es un fine-tuning del modelo Davlan/afro-xlmr-base, desarrollado por el usuario tadiecool29, especializado en análisis de sentimiento. Se trata de un clasificador de texto que asigna una etiqueta de sentimiento (positivo, negativo o neutral) a fragmentos de texto, probablemente en lenguas africanas, dado que su modelo base está orientado a ese dominio.

El modelo tiene 278 millones de parámetros y se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones. Aunque no se especifica el dataset de entrenamiento, las métricas de evaluación reportadas indican un F1 de 0,7268, lo que sugiere un rendimiento moderado en la tarea. Su relevancia radica en la escasez de modelos de análisis de sentimiento específicos para lenguas africanas, un área con poca cobertura en el ecosistema de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (basado en XLM-RoBERTa, modelo base afro-xlmr-base) |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base orientado a lenguas africanas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder-only preentrenado multilingüe. El modelo base afro-xlmr-base es una adaptación de XLM-RoBERTa para lenguas africanas, con un vocabulario ampliado y entrenamiento continuo en corpus africanos. El fine-tuning se realizó con los siguientes hiperparámetros: learning rate 1e-05, batch size de entrenamiento 16, batch size de evaluación 32, optimizador AdamW con betas (0,9, 0,999), scheduler cosine con 300 pasos de warmup, 6 épocas y precisión mixta nativa. No se especifica el dataset de entrenamiento, pero las métricas de evaluación indican una pérdida de 0,7492 y un F1 de 0,7268.

## Capacidades

- Clasificación de sentimiento en texto (positivo, negativo, neutral) mediante clasificación de secuencias.
- Es un modelo encoder-only, por lo que no genera texto ni tiene capacidades de generación.
- No soporta tool calling ni funciones de agente.
- No tiene capacidades multimodales (solo texto).
- Multilingüe limitado a lenguas africanas (aunque no se especifica cuáles).
- No tiene modo de razonamiento especial.

## Casos de uso

- Monitoreo de redes sociales en lenguas africanas: el modelo puede clasificar publicaciones de Twitter o Facebook para medir la opinión pública sobre temas concretos, gracias a su especialización en el dominio lingüístico africano.
- Análisis de comentarios de clientes en servicios locales: permite categorizar reseñas de productos o servicios en plataformas de comercio electrónico, ayudando a identificar problemas recurrentes.
- Análisis de noticias y artículos: clasifica el tono de artículos periodísticos en medios africanos, útil para estudios de medios y comunicación.
- Investigación académica en NLP para lenguas de bajos recursos: sirve como baseline para tareas de análisis de sentimiento en lenguas africanas, donde hay pocos recursos etiquetados.
- Sistemas de recomendación basados en opiniones: integra la clasificación de feedback de usuarios para ajustar recomendaciones en aplicaciones de reseñas.
- Análisis de encuestas y formularios: categoriza respuestas abiertas en encuestas de satisfacción, facilitando el análisis cuantitativo de datos cualitativos.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss | 0,7492 |
| Precision | 0,7270 |
| Recall | 0,7267 |
| F1 | 0,7268 |
| Accuracy | 0,7319 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278 millones de parámetros, el modelo ocupa aproximadamente 1,1 GB en FP32. Para inferencia en FP16, se reduce a unos 0,6 GB, por lo que cabe en GPUs con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna, como una NVIDIA RTX 3060 (12 GB) o superior, es suficiente. También puede ejecutarse en CPU con memoria RAM suficiente (al menos 4 GB).
- Opciones de despliegue: se puede usar con la librería transformers de Hugging Face, o exportar a ONNX para inferencia optimizada. No se recomienda vLLM ni TGI, ya que están orientados a generación de texto.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo pequeño, la inferencia es rápida en GPU (del orden de milisegundos por muestra).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base afro-xlmr-base tiene una variante grande (afro-xlmr-large) con más parámetros, pero no se han reportado métricas comparables en la documentación disponible.

## Limitaciones y advertencias

- No se especifica el dataset de entrenamiento, por lo que el rendimiento puede degradarse en dominios o estilos de texto no representados durante el fine-tuning.
- Al ser un modelo encoder-only de tamaño moderado, puede tener limitaciones en contextos muy largos o vocabulario técnico especializado.
- No hay información sobre sesgos o alucinaciones, pero al ser un clasificador, el riesgo de alucinación es bajo; sin embargo, puede presentar sesgos derivados de los datos de entrenamiento no documentados.
- La licencia MIT permite uso comercial, pero no ofrece garantías de precisión ni de idoneidad para aplicaciones críticas.
- El modelo está orientado a lenguas africanas, pero no se especifica cuáles, por lo que su uso en otras lenguas puede ser limitado o producir resultados poco fiables.

## Enlaces

- HuggingFace: https://huggingface.co/tadiecool29/afroxlmr-stl-base-sentiment
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Paper AfroXLMR-Social (arXiv PDF): https://arxiv.org/pdf/2503.18247v3
- Paper AfroXLMR-Social (arXiv HTML): https://arxiv.org/html/2503.18247v1
- Paper AfroXLMR-Social (ACL Anthology): https://aclanthology.org/2025.findings-emnlp.842/
