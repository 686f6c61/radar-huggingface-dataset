# tadiecool29/STL-amroberta-sentiment

## Resumen

STL-amroberta-sentiment es un modelo de análisis de sentimiento (clasificación de polaridad) desarrollado por tadiecool29 mediante fine-tuning del modelo base `uhhlt/am-roberta`, una variante de RoBERTa adaptada al amárico. El modelo se ha entrenado sobre un conjunto de datos no especificado, con el objetivo de clasificar textos en categorías de sentimiento (presumiblemente positivo, negativo y neutral). Con 442,9 millones de parámetros, es un modelo de gran tamaño que requiere recursos de hardware moderados para su inferencia.

La relevancia de este modelo radica en su especialización en amárico, un idioma con escasos recursos de NLP, y en su licencia MIT, que permite uso comercial sin restricciones. Sin embargo, la ausencia de documentación detallada sobre el dataset de entrenamiento y la falta de benchmarks estandarizados limitan su evaluación objetiva. El modelo se distribuye en formato safetensors y es compatible con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en RoBERTa, modelo base `uhhlt/am-roberta`) |
| Parametros totales | 442.877.187 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (presumiblemente amárico, dado el modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `uhhlt/am-roberta`, que a su vez se basa en la arquitectura RoBERTa (una variante optimizada de BERT con entrenamiento más robusto). RoBERTa emplea un transformer encoder con atención bidireccional, preentrenado con enmascaramiento dinámico y sin la tarea de predicción de siguiente frase. El fine-tuning se realizó con la librería Transformers, utilizando un optimizador AdamW con tasa de aprendizaje de 1e-05, scheduler de coseno con 300 pasos de calentamiento, y 10 épocas. Se usó precisión mixta nativa (AMP) y un tamaño de batch de 16 para entrenamiento y 32 para evaluación. El dataset de entrenamiento no está documentado, lo que impide conocer la composición y el volumen de datos.

No se especifican innovaciones técnicas adicionales más allá del fine-tuning estándar. El modelo se entrenó para la tarea de clasificación de sentimiento, con una capa de clasificación añadida sobre la salida del token `[CLS]`.

## Capacidades

- Clasificación de sentimiento: asigna una etiqueta de polaridad (positivo, negativo o neutral) a un texto de entrada.
- Procesamiento de texto en amárico (presumiblemente, dado el modelo base), aunque no se confirma explícitamente.
- Inferencia mediante la API de Transformers, con soporte para `pipeline` de clasificación de texto.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar tweets o publicaciones en amárico para medir la opinión pública sobre temas concretos, aunque su precisión (F1 ~0.67) sugiere que es adecuado para análisis agregado, no para decisiones individuales.
- Monitoreo de marca: empresas que operan en Etiopía o con audiencia amárica pueden usar el modelo para rastrear menciones de marca y detectar sentimiento negativo en comentarios de clientes.
- Análisis de reseñas de productos: clasificar reseñas de comercio electrónico en amárico para identificar productos con valoraciones mayoritariamente positivas o negativas.
- Análisis de comentarios en noticias: medios de comunicación pueden evaluar la reacción de los lectores ante artículos, ayudando a ajustar la línea editorial.
- Investigación académica en NLP para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de análisis de sentimiento en amárico, aunque se recomienda validar su rendimiento en dominios específicos.
- Sistemas de atención al cliente: integrar el modelo en un flujo de clasificación de tickets para priorizar quejas urgentes, siempre que se combine con umbrales de confianza y revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible. El autor declara las siguientes métricas de evaluación sobre un conjunto de validación no especificado:

| Metrica | Valor |
|---|---|
| Loss | 1.0446 |
| Precision (sentimiento) | 0.6743 |
| Recall (sentimiento) | 0.6767 |
| F1 | 0.6739 |
| Accuracy (sentimiento) | 0.6833 |

Estos valores indican un rendimiento moderado, con una precisión y recall equilibrados. La evolución del entrenamiento muestra que el mejor F1 se alcanzó en la época 4 (0.6836), con ligero sobreajuste posterior (la loss de validación aumenta a partir de la época 3).

## Requisitos de hardware

- VRAM estimada para inferencia: con 442,9 millones de parámetros en fp32, el modelo ocupa aproximadamente 1,77 GB en memoria. Para inferencia con batch pequeño, se recomienda al menos 2-4 GB de VRAM en GPU, o 4-8 GB de RAM en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). En GPUs de datacenter como A100 o H100, el modelo se ejecuta con holgura.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face. Para CPU, se puede usar llama.cpp o ONNX Runtime, aunque no se proporcionan pesos GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de un texto corto debería ser inferior a 100 ms, pero no se puede confirmar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (análisis de sentimiento en amárico). El autor ha publicado otros modelos similares, como `STL-amroberta-stance` (detección de postura) y `MTL-afriberta-base-stance-sentiment` (multitarea), pero no se han encontrado métricas comparables. Se recomienda evaluar el modelo frente a otros fine-tunes de RoBERTa para amárico, como los disponibles en el hub de Hugging Face, antes de elegirlo para producción.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica la procedencia ni el tamaño de los datos, lo que impide evaluar posibles sesgos o la representatividad de los dominios cubiertos.
- Rendimiento moderado: con un F1 de 0.67, el modelo puede cometer errores en textos ambiguos o con lenguaje coloquial, por lo que no es recomendable para aplicaciones críticas sin supervisión humana.
- Idioma no confirmado: aunque el modelo base es para amárico, no se documenta explícitamente el idioma de entrenamiento, lo que podría limitar su uso en otros idiomas.
- Sin cuantizaciones disponibles: solo se ofrecen pesos en safetensors, lo que dificulta su despliegue en entornos con recursos limitados.
- Licencia MIT: permite uso comercial y modificación, pero el usuario es responsable de cumplir con las licencias del modelo base (`uhhlt/am-roberta`), que no se detallan aquí.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, pero puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-amroberta-sentiment
- Modelo base `uhhlt/am-roberta`: https://huggingface.co/uhhlt/am-roberta
- Modelo relacionado del mismo autor (detección de postura): https://huggingface.co/tadiecool29/STL-amroberta-stance
- Modelo relacionado del mismo autor (multitarea): https://huggingface.co/tadiecool29/MTL-afriberta-base-stance-sentiment
