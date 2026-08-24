# wsber123/bert-mini-finetuned-sst2

## Resumen

El modelo `wsber123/bert-mini-finetuned-sst2` es una versión del conocido BERT-mini, ajustada para la clasificación de sentimiento binario sobre el conjunto de datos SST-2 (Stanford Sentiment Treebank). Con 11,17 millones de parámetros, se trata de un modelo extremadamente ligero, diseñado para tareas de análisis de sentimiento en inglés con un coste computacional muy reducido. Lo publica el usuario `wsber123` bajo licencia Apache 2.0, lo que permite su uso comercial y su modificación sin restricciones.

Este modelo destaca por su tamaño compacto, que lo hace apto para entornos con recursos limitados, como dispositivos móviles o servidores de baja capacidad. Su arquitectura corresponde a un transformer encoder de 4 capas y 256 unidades ocultas, típico de la familia BERT-mini. La longitud de contexto se limita a 512 tokens, un estándar en BERT. Aunque no se ha publicado información detallada sobre el proceso de entrenamiento, el hecho de que esté ajustado sobre SST-2 indica que su finalidad principal es la clasificación binaria de sentimientos (positivo/negativo).

A pesar de que el repositorio carece de una model card completa, la licencia abierta y el tamaño reducido lo convierten en una opción interesante para prototipos y aplicaciones de análisis de texto en tiempo real. No obstante, su ámbito de uso se restringe al inglés y a la tarea específica de análisis de sentimiento, sin capacidades adicionales como generación de texto o razonamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) |
| Parámetros totales | 11.171.074 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (típico de BERT, no confirmado) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (inferido del dataset SST-2) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en la variante BERT-mini, que reduce el número de capas (4) y la dimensión oculta (256) respecto a BERT-base (12 capas, 768 dimensiones). Este diseño lo hace mucho más eficiente en términos de memoria y cómputo, a costa de una menor capacidad de representación.

No se dispone de información detallada sobre el proceso de entrenamiento del modelo `wsber123/bert-mini-finetuned-sst2`. La model card solo incluye la licencia, sin datos sobre el número de épocas, el optimizador utilizado, la composición del dataset de entrenamiento ni si se aplicaron técnicas como el ajuste fino con destilación o el uso de optimizadores específicos. Se sabe que el modelo está ajustado sobre el dataset SST-2, que contiene frases en inglés etiquetadas como positivas o negativas, pero no se han publicado más detalles.

## Capacidades

- Clasificación de texto binaria: detecta si una frase expresa sentimiento positivo o negativo.
- Análisis de sentimiento en textos cortos: adecuado para tweets, reseñas, comentarios y otros fragmentos breves.
- Inferencia rápida: al ser un modelo de 11 millones de parámetros, puede ejecutarse en tiempo real en CPU o en GPUs de gama baja.
- No ofrece capacidades de generación de texto, tool calling, razonamiento multi-step ni soporte multilingüe más allá del inglés.

## Casos de uso

- Análisis de opiniones en redes sociales: se puede utilizar para monitorizar el sentimiento de los usuarios sobre una marca o producto en Twitter, Facebook o foros, procesando grandes volúmenes de mensajes con un coste computacional mínimo.
- Clasificación de reseñas de productos: en plataformas de comercio electrónico, se puede integrar para etiquetar automáticamente las reseñas como positivas o negativas, ayudando a priorizar la atención al cliente.
- Detección de comentarios tóxicos o negativos en foros y comunidades online: el modelo puede actuar como un filtro inicial para identificar mensajes conflictivos, aunque no está específicamente entrenado para detectar toxicidad, solo sentimiento.
- Análisis de encuestas de satisfacción: se puede aplicar a respuestas abiertas de encuestas para clasificar la actitud del cliente, permitiendo una agregación rápida de métricas de satisfacción.
- Prototipos de chatbots con análisis de emociones: en un sistema conversacional, el modelo puede clasificar la actitud del usuario en cada turno para adaptar la respuesta del bot.
- Clasificación de noticias o artículos por polaridad: útil para agencias de comunicación que necesiten categorizar noticias en positivas, negativas o neutrales, aunque el modelo solo distingue entre dos clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de rendimiento en SST-2 ni comparaciones con otros modelos de la misma categoría. Es probable que el modelo tenga un rendimiento inferior al de modelos más grandes como BERT-base o DistilBERT, pero no se puede cuantificar sin datos oficiales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 11 millones de parámetros, la inferencia en CPU es viable. Con cuantización o en CPU se puede ejecutar sin GPU. En GPU, el consumo de VRAM es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti o superior). También funciona en CPU.
- Compatibilidad con GPU de consumo: sí, se puede ejecutar en una RTX 4090, pero no es necesario; incluso un Raspberry Pi podría ejecutar el modelo si se usa una versión optimizada.
- Opciones de despliegue: se puede usar con Hugging Face Transformers (PyTorch/TensorFlow), ONNX Runtime, o mediante servidores de inferencia como FastAPI. También es compatible con TensorFlow Lite para móviles.
- Latencia y throughput: no se dispone de datos medidos, pero dada su tamaño, la inferencia en CPU es de milisegundos por ejemplo, en una CPU moderna se puede esperar una latencia inferior a 10 ms por ejemplo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsber123/bert-mini-finetuned-sst2 | 11,17 M | 512 | Clasificación de sentimiento (binario) | Apache 2.0 | Hugging Face |
| M-FAC/bert-mini-finetuned-sst2 | 11,17 M | 512 | Clasificación de sentimiento (binario) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased-finetuned-sst-2 | 67 M | 512 | Clasificación de sentimiento (binario) | Apache 2.0 | Hugging Face |

La comparación con M-FAC es directa, ya que ambos comparten la misma arquitectura y tarea, aunque no se conoce si el modelo `wsber123` es una copia o una variante de M-FAC. DistilBERT es un modelo más grande y con mayor capacidad, pero también más pesado. No se dispone de métricas de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgo potencial: el modelo hereda los sesgos presentes en el dataset SST-2, que es mayoritariamente de texto en inglés y de un dominio específico (críticas de películas). Puede tener un rendimiento inferior en otros dominios o en textos no escritos en inglés.
- Alucinación: no aplica, ya que es un clasificador y no genera texto.
- Contexto limitado: la longitud de contexto máxima es de 512 tokens, por lo que no es adecuado para documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte o mantenimiento.
- Sin información de entrenamiento: al no conocerse el proceso de entrenamiento, no se puede evaluar la robustez ni la posible sobre-ajuste al dataset SST-2.
- Uso en producción: al ser un modelo sin benchmarks publicados, se recomienda evaluarlo en el conjunto de datos objetivo antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wsber123/bert-mini-finetuned-sst2)
- [M-FAC/bert-mini-finetuned-sst2 (modelo similar)](https://huggingface.co/M-FAC/bert-mini-finetuned-sst2)
- [Catálogo de modelos de Microsoft (M-FAC)](https://ai.azure.com/catalog/models/m-fac-bert-mini-finetuned-sst2)
