# Sru34/distilbert-imdb

## Resumen

`Sru34/distilbert-imdb` es un modelo de clasificación de texto (análisis de sentimiento) obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased` sobre un conjunto de datos no documentado. El autor es Sru34, y el modelo se publica bajo licencia Apache-2.0 con pesos en formato safetensors. Con 66,96 millones de parámetros, se trata de una versión destilada de BERT que conserva la arquitectura transformer original de DistilBERT, diseñada para tareas de clasificación de secuencias.

El modelo está orientado a resolver el problema de clasificación binaria de sentimiento, probablemente sobre reseñas de películas de IMDB (como sugiere el nombre), aunque el autor no especifica el dataset de entrenamiento. Su relevancia radica en que ofrece una alternativa ligera y rápida para tareas de clasificación de texto en producción, con un tamaño de 0,3 GB que permite su ejecución en entornos con recursos limitados. No se dispone de información sobre la longitud de contexto, idiomas soportados o cuantizaciones disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilado de BERT) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT base soporta 512 tokens, pero no confirmado por el autor) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, dado el modelo base uncased) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión reducida de BERT entrenada mediante destilación de conocimiento. DistilBERT conserva la estructura de transformer encoder de BERT pero reduce el número de capas (6 en lugar de 12), lo que lo hace más rápido y ligero manteniendo un alto rendimiento en tareas de comprensión del lenguaje. En este caso, se realizó un fine-tuning sobre el modelo preentrenado `distilbert-base-uncased`, adaptándolo a una tarea específica de clasificación de texto.

El proceso de entrenamiento utilizó los siguientes hiperparámetros: tasa de aprendizaje 5e-5, tamaño de lote 8 (train y eval), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y 3 épocas. Los resultados de validación muestran una mejora progresiva: la pérdida de validación pasó de 0.4960 en la primera época a 0.6741 en la tercera, aunque la accuracy aumentó de 0.806 a 0.857. El dataset de entrenamiento no se especifica en la model card, lo que limita la reproducibilidad y la evaluación de sesgos.

## Capacidades

- Clasificación de texto binaria: el modelo está diseñado para tareas de análisis de sentimiento, distinguiendo entre dos clases (probablemente positivo/negativo).
- Generación de embeddings de texto: al ser un modelo de tipo encoder, puede producir representaciones vectoriales útiles para tareas posteriores (aunque no es su uso principal).
- Inferencia eficiente: gracias a su arquitectura ligera (66,9M parámetros), puede ejecutarse en CPU o GPU de baja gama sin sacrificar demasiado rendimiento.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-step, visión o audio.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar automáticamente opiniones de usuarios como positivas o negativas, lo que resulta útil para monitorizar la satisfacción del cliente en plataformas de e-commerce.
- Moderación de comentarios en foros y redes sociales: permite filtrar contenido tóxico o negativo de forma automatizada, reduciendo la carga de moderación manual.
- Clasificación de tickets de soporte: asignar automáticamente categorías a solicitudes de atención al cliente según el tono (urgente, negativo, positivo) para priorizar la respuesta.
- Análisis de encuestas de satisfacción: procesar respuestas abiertas de encuestas para extraer tendencias de sentimiento agregado.
- Prototipado rápido en proyectos de NLP: al ser un modelo pequeño y con licencia permisiva, es ideal para pruebas de concepto y MVPs en entornos con pocos recursos.
- Detección de spam en correos electrónicos: aunque no es su propósito principal, puede adaptarse mediante fine-tuning adicional para clasificar mensajes como spam o no spam.

## Benchmarks y rendimiento

Los resultados de validación declarados por el autor en la model card son los siguientes (sobre el conjunto de evaluación durante el entrenamiento):

| Época | Pérdida | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 0.4960 | 0.806 | 0.7363 | 0.9385 | 0.8252 |
| 2 | 0.5036 | 0.850 | 0.8225 | 0.8832 | 0.8518 |
| 3 | 0.6741 | 0.857 | 0.8350 | 0.8811 | 0.8574 |

No se han publicado resultados en benchmarks externos (MMLU, GLUE, etc.) en la información disponible. El índice de benchmarks de la model card está vacío.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 0.3 GB en safetensors, lo que equivale a unos 268 MB de pesos. En FP32, la inferencia requiere unos 268 MB de memoria; en FP16 se reduce a la mitad (~134 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, GTX 1650, RTX 2060). También puede ejecutarse en CPU con un rendimiento aceptable.
- Compatible con hardware de consumo: sí, cabe en tarjetas de gama baja como una GTX 1050 Ti o incluso en dispositivos edge con suficiente RAM.
- Opciones de despliegue: se puede servir con librerías como Hugging Face Transformers, o mediante soluciones optimizadas como Text Embeddings Inference (TEI) o Triton. No se especifican cuantizaciones, pero el tamaño permite usarlo con `llama.cpp` o `ONNX Runtime` si se convierte.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en CPU se esperan tiempos de inferencia de milisegundos para textos cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Accuracy (IMDB) | Disponibilidad |
|---|---|---|---|---|---|
| `Sru34/distilbert-imdb` | 66.9M | No disponible (512 tokens probablemente) | Apache-2.0 | 0.857 (validación) | Hugging Face |
| `distilbert/distilbert-base-uncased` | 66.9M | 512 tokens | Apache-2.0 | No entrenado para IMDB | Hugging Face |
| `lvwerra/distilbert-imdb` | 66.9M | 512 tokens | Apache-2.0 | 92.8% (según PromptLayer) | Hugging Face |

El modelo `lvwerra/distilbert-imdb` de lvwerra es un fine-tuning similar sobre IMDB y reporta una accuracy del 92.8% (dato externo, no verificado en este modelo). La comparativa directa no es posible por la falta de datos públicos de evaluación de este modelo. El rendimiento del modelo de Sru34 es notablemente inferior (85.7% en validación), lo que sugiere que el dataset de entrenamiento o el procedimiento de fine-tuning fueron distintos.

## Limitaciones y advertencias

- El dataset de entrenamiento no se documenta, lo que dificulta la reproducibilidad y la comprensión de posibles sesgos.
- La accuracy de validación (85.7%) es relativamente baja en comparación con otros modelos de análisis de sentimiento en IMDB, que suelen superar el 90%.
- El modelo está entrenado probablemente solo en inglés (dado el tokenizador uncased de DistilBERT), por lo que su rendimiento en otros idiomas será pobre.
- No se han realizado pruebas de robustez frente a textos adversarios, sarcasmo o negaciones complejas.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de que el modelo cumpla con normativas de privacidad (por ejemplo, GDPR) si se despliega con datos personales.
- El modelo fue generado automáticamente con `Trainer`, y la model card indica "More information needed", lo que sugiere que no ha sido revisado manualmente por el autor.

## Enlaces

- Hugging Face: [Sru34/distilbert-imdb](https://huggingface.co/Sru34/distilbert-imdb)
- Modelo base: [distilbert/distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- Modelo similar de lvwerra: [lvwerra/distilbert-imdb](https://huggingface.co/lvwerra/distilbert-imdb)
- Modelo similar de tankgauravgt: [tankgauravgt/distilbert-cased-imdb-finetuned](https://huggingface.co/tankgauravgt/distilbert-cased-imdb-finetuned)
- Referencia en PromptLayer: [distilbert-imdb](https://www.promptlayer.com/models/distilbert-imdb/)
