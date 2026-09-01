# tadiecool29/STL-Davlan-bert-base-multilingual-cased-finetuned-amharic-sentiment

## Resumen

El modelo `STL-Davlan-bert-base-multilingual-cased-finetuned-amharic-sentiment` es un clasificador de análisis de sentimiento en amhárico, desarrollado por el usuario `tadiecool29` mediante fine-tuning del modelo `Davlan/bert-base-multilingual-cased-finetuned-amharic`. Este último es una adaptación de BERT multilingüe con vocabulario específico para amhárico, entrenado para mejorar el rendimiento en tareas de procesamiento del lenguaje natural en ese idioma. El modelo resultante se ha ajustado para la clasificación de polaridad (positivo, negativo, neutro) en textos amháricos.

Con 177,8 millones de parámetros, el modelo mantiene la arquitectura BERT base (12 capas, 768 dimensiones ocultas) pero con un vocabulario ampliado para cubrir el amhárico, lo que explica el mayor número de parámetros respecto al BERT base estándar (110 millones). Su ventana de contexto es de 512 tokens, típica de BERT. La relevancia actual radica en la escasez de recursos de PLN para lenguas etíopes, y este modelo ofrece una opción ligera y desplegable para tareas de sentimiento en amhárico, aunque con un rendimiento moderado (F1 de 0,63 en validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con vocabulario ampliado para amhárico |
| Parametros totales | 177.855.747 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas externas como ONNX Runtime o bitsandbytes) |
| Idiomas soportados | Amhárico (principal); el modelo base es multilingüe, pero el fine-tuning es específico para amhárico |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Transformer encoder) con 12 capas, 768 unidades ocultas y 12 cabezas de atención. La diferencia respecto al BERT base original es que el vocabulario se ha sustituido por uno específico para amhárico, lo que incrementa el número de parámetros de embedding y explica los 177,8 millones totales. El proceso de entrenamiento consistió en un fine-tuning del modelo `Davlan/bert-base-multilingual-cased-finetuned-amharic` sobre un dataset de sentimiento en amhárico no especificado.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0.9, 0.999), scheduler coseno con 300 pasos de calentamiento, 10 épocas y precisión mixta nativa (AMP). No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar. La pérdida de validación final fue de 1.4219, con una precisión de sentimiento de 0.6279, recall de 0.6290, F1 de 0.6275 y accuracy de 0.6347.

## Capacidades

- Clasificación de sentimiento en textos amháricos: el modelo asigna una etiqueta de polaridad (presumiblemente positiva, negativa o neutra) a frases o documentos cortos.
- Inferencia sobre secuencias de hasta 512 tokens, adecuada para tweets, reseñas, comentarios y párrafos breves.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales; es un clasificador de secuencias puro.
- Capacidad multilingüe limitada: aunque el modelo base es multilingüe, el fine-tuning se ha realizado exclusivamente en amhárico, por lo que su rendimiento en otros idiomas no está garantizado.

## Casos de uso

- Monitoreo de redes sociales en amhárico: el modelo puede clasificar automáticamente el sentimiento de tweets, publicaciones de Facebook o comentarios de foros en amhárico, permitiendo a marcas y organizaciones medir la opinión pública en tiempo real.
- Análisis de reseñas de productos: integrado en un pipeline de comercio electrónico, puede procesar reseñas de clientes en amhárico para identificar productos con valoraciones negativas y priorizar la atención al cliente.
- Análisis de noticias y artículos periodísticos: permite a medios y agencias de noticias clasificar el tono de las noticias en amhárico, útil para estudios de sesgo mediático o seguimiento de la opinión pública.
- Investigación académica en PLN para lenguas etíopes: sirve como modelo de referencia para tareas de análisis de sentimiento en amhárico, facilitando la comparación con futuros modelos.
- Detección de crisis de reputación: empresas con presencia en Etiopía pueden usar el modelo para detectar picos de sentimiento negativo en menciones de su marca en amhárico y activar protocolos de respuesta.
- Filtrado de comentarios tóxicos o negativos en plataformas de contenido: aunque no está entrenado específicamente para toxicidad, su clasificación de sentimiento puede usarse como primer filtro para moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara únicamente métricas de evaluación sobre un conjunto de validación no especificado. A continuación se muestran los resultados reportados en la model card:

| Metrica | Valor |
|---|---|
| Loss | 1.4219 |
| Precision (sentimiento) | 0.6279 |
| Recall (sentimiento) | 0.6290 |
| F1 | 0.6275 |
| Accuracy (sentimiento) | 0.6347 |

La tabla de entrenamiento por épocas muestra una mejora progresiva hasta la época 4 (F1 0.6600) y un posterior descenso, indicando posible sobreajuste. No hay comparación con otros modelos de sentimiento en amhárico.

## Requisitos de hardware

- VRAM estimada: en FP32, el modelo ocupa aproximadamente 711 MB (177,8 M parámetros × 4 bytes). En FP16, ~356 MB; en int8, ~178 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Despliegue: compatible con la librería `transformers` de Hugging Face, así como con ONNX Runtime, TensorRT y herramientas de cuantización como `bitsandbytes`. No se proporcionan archivos GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, la inferencia de una secuencia de 512 tokens debería completarse en decenas de milisegundos; en CPU, en el orden de cientos de milisegundos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de análisis de sentimiento en amhárico. El modelo base `Davlan/bert-base-multilingual-cased-finetuned-amharic` está orientado a NER, no a sentimiento, por lo que no es directamente comparable. Otros modelos multilingües como `XLM-RoBERTa` o `mBERT` podrían adaptarse a la tarea, pero no se han publicado comparativas con este modelo. La información disponible no permite una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica que se usó un dataset no especificado, lo que impide evaluar la representatividad y posibles sesgos.
- Rendimiento moderado: con un F1 de 0.6275, el modelo no alcanza niveles de precisión altos; puede ser insuficiente para aplicaciones críticas donde el error sea costoso.
- Posible sobreajuste: la pérdida de validación aumenta a partir de la época 4, sugiriendo que el entrenamiento continuado degrada la generalización.
- Sesgos lingüísticos y culturales: al estar entrenado solo en amhárico, puede no capturar variaciones dialectales o registros formales/informales de manera uniforme.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Sin soporte para tareas generativas: es un clasificador de secuencias; no puede generar texto ni realizar razonamiento complejo.
- Contexto limitado a 512 tokens: no apto para documentos largos sin truncamiento o estrategias de ventana deslizante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-Davlan-bert-base-multilingual-cased-finetuned-amharic-sentiment
- Modelo base (Davlan): https://huggingface.co/Davlan/bert-base-multilingual-cased-finetuned-amharic
- Ficha del modelo base en AI Model Zoo: https://zoo.bimant.com/model/1741
- Espejo de la ficha del modelo base: https://huface.ru/Davlan/bert-base-multilingual-cased-finetuned-amharic
- Ficha del modelo base en ATYUN: https://www.atyun.com/models/info/Davlan/bert-base-multilingual-cased-finetuned-amharic.html?lang=en
