# tys22/amharic-sentiment-xlmr-v2

## Resumen

`tys22/amharic-sentiment-xlmr-v2` es un modelo de clasificación de texto desarrollado por el usuario tys22 y publicado en Hugging Face. Está orientado al análisis de sentimiento en lengua amhárica, un idioma etíope considerado de bajos recursos lingüísticos. Aunque la model card está vacía y no incluye información técnica, por el identificador del modelo y por el tag `xlm-roberta` puede deducirse que se trata de un ajuste fino sobre XLM-RoBERTa base.

El modelo cuenta con 278.045.955 parámetros y sus pesos en formato `safetensors` ocupan aproximadamente 1,1 GB. No se especifican los datos de entrenamiento, la licencia ni métricas de evaluación, por lo que su rendimiento no puede evaluarse directamente a partir de la documentación disponible.

Su relevancia reside en la escasez de modelos de procesamiento del lenguaje natural para el amhárico, donde el análisis de sentimiento resulta clave para aplicaciones de escucha social, atención al cliente y monitorización de opiniones en Etiopía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa) |
| Parámetros totales | 278.045.955 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible. El identificador del modelo sugiere amhárico, pero la documentación no lo confirma |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, una arquitectura Transformer encoder-only preentrenada en alrededor de cien idiomas mediante la tarea de modelado de lenguaje enmascarado (MLM). Este checkpoint es un ajuste fino para la tarea de clasificación de texto, aplicado al análisis de sentimiento en lengua amhárica según se deduce del identificador del modelo y del pipeline declarado.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO. Tampoco se han publicado detalles sobre el procedimiento de ajuste fino, hiperparámetros o infraestructura de cómputo.

## Capacidades

- Clasificación de sentimiento en textos en lengua amhárica, siempre que el idioma de trabajo sea el amhárico.
- Es un modelo discriminativo, no generativo: devuelve una o varias etiquetas de probabilidad, no texto libre.
- No soporta tool calling, function calling, razonamiento multi-step, vision ni audio.
- Sus capacidades multilingües son las heredadas del modelo base XLM-RoBERTa, pero este checkpoint está especializado en amhárico.
- Al tratarse de un clasificador, no está diseñado para tareas de generación de texto, resumen, traducción ni chatbots conversacionales.

## Casos de uso

- Monitorización de redes sociales: permite clasificar automáticamente publicaciones en amhárico como positivas, negativas o neutras para medir la opinión pública sobre una marca, organización o evento en Etiopía.
- Análisis de reseñas de productos en comercios electrónicos etíopes: ayuda a detectar insatisfacción o quejas frecuentes a partir de los comentarios de los compradores.
- Atención al cliente automatizada: un sistema puede enrutar mensajes o tickets escritos en amhárico hacia los agentes adecuados según el tono o sentimiento detectado.
- Análisis de noticias y artículos de prensa en medios digitales amhara: permite clasificar la orientación emocional de los titulares o de los artículos completos para estudios de framing o seguimiento de tendencias.
- Encuestas de satisfacción: procesa respuestas abiertas en amhárico y las clasifica por sentimiento para obtener métricas agregadas de satisfacción.
- Investigación sociolingüística: sirve como herramienta para análisis masivo de opiniones en corpus amhara, facilitando estudios sobre polarización, actitudes o comportamiento en redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP32 ocupa alrededor de 1,1 GB, por lo que se recomienda un mínimo de 2 GB de VRAM para lotes pequeños. En FP16, el peso se reduciría a aproximadamente 0,56 GB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, como una RTX 3050, GTX 1660 Super o una Tesla T4 de Google Colab.
- Es un modelo de tamaño contenido que cabe en GPUs de consumo.
- Opciones de despliegue: `transformers` mediante `AutoModelForSequenceClassification`, y potencialmente servicios compatibles con el tag `text-embeddings-inference`, aunque se trate de un clasificador de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han aportado datos de otros modelos de análisis de sentimiento en amhárico. Como punto de referencia, el modelo base XLM-RoBERTa, del que deriva este checkpoint, es una alternativa genérica para clasificación de texto, pero no está afinado específicamente para el amhárico.

## Limitaciones y advertencias

- Sesgos: no se han realizado estudios de sesgo y el conjunto de datos de entrenamiento es desconocido, por lo que el modelo puede reflejar sesgos presentes en dichos datos.
- Riesgo de clasificación incorrecta: al ser un clasificador, no genera texto, pero las falsas clasificaciones pueden afectar a sistemas posteriores que dependan de la etiqueta.
- Limitaciones de idioma: no está confirmado que el modelo funcione correctamente en otros idiomas distintos del amhárico.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o su redistribución.
- Falta de documentación: la model card es una plantilla generada automáticamente, sin información de entrenamiento, evaluación ni ejemplos de uso, lo que dificulta su adopción en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tys22/amharic-sentiment-xlmr-v2
- Artículo de XLM-RoBERTa: https://arxiv.org/abs/1910.09700
- Cuaderno de análisis de sentimiento en amhárico (Ethiopian DS/AI Community): https://github.com/Ethiopian-DS-AI-Community/datasets/blob/main/amharic_sentiment_analysis_starter.ipynb
- Repositorio de análisis de sentimiento en amhárico: https://github.com/liyaSileshi/amharic-sentiment-analysis
