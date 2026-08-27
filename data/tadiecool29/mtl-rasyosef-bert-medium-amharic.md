# tadiecool29/MTL-rasyosef-bert-medium-amharic

## Resumen

MTL-rasyosef-bert-medium-amharic es un modelo de clasificación de texto en amárico, resultado de un fine-tuning multitarea (stance y sentimiento) sobre el modelo preentrenado `rasyosef/bert-medium-amharic`. El modelo base fue desarrollado por Rasyosef y preentrenado desde cero con 290 millones de tokens de texto amárico procedentes de los corpus OSCAR, mc4 y amharic-sentences-corpus. El fine-tuning, realizado por tadiecool29, añade dos cabezas de clasificación para detectar la postura (stance) y el sentimiento de un texto, lo que lo convierte en una herramienta específica para análisis de opinión en un idioma de bajos recursos.

Con 40,4 millones de parámetros y una longitud de contexto de 512 tokens, este modelo ofrece un equilibrio entre tamaño reducido y capacidad de procesamiento lingüístico para el amárico. Su relevancia radica en que cubre una tarea doble (stance y sentimiento) en un idioma con escasos recursos disponibles, y su tamaño compacto permite su despliegue en entornos con limitaciones de hardware. Aunque la model card no especifica el dataset de entrenamiento, las métricas de evaluación reportadas indican un rendimiento aceptable para ambas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT medium (encoder transformer) |
| Parametros totales | 40.429.575 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | amárico |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `rasyosef/bert-medium-amharic` sigue la arquitectura BERT medium, con aproximadamente 40 millones de parámetros. Fue preentrenado desde cero sobre 290 millones de tokens de texto amárico, utilizando un tokenizer propio con un vocabulario de 28.672 subpalabras. El preentrenamiento se realizó con la tarea de modelado de lenguaje enmascarado (MLM), lo que le confiere una representación contextual del amárico.

El fine-tuning de `MTL-rasyosef-bert-medium-amharic` añade dos cabezas de clasificación sobre la salida del token `[CLS]`: una para detección de stance (postura) y otra para análisis de sentimiento. El entrenamiento se realizó con una tasa de aprendizaje de 1e-5, batch de entrenamiento de 16, batch de evaluación de 32, optimizador AdamW con betas (0.9, 0.999), scheduler coseno con 300 pasos de warmup, y 6 épocas completas. Se utilizó precisión mixta (AMP). El dataset de entrenamiento no está especificado en la model card (aparece como "None"), aunque por la naturaleza de las tareas se infiere que contiene textos etiquetados con stance y sentimiento en amárico.

## Capacidades

- Clasificación de sentimiento en amárico: asigna una etiqueta de polaridad (positivo, negativo, neutral) a un texto dado.
- Detección de stance en amárico: identifica la postura del autor respecto a un tema o entidad (a favor, en contra, neutral).
- Modelo de lenguaje enmascarado (fill-mask): al ser una variante de BERT, conserva la capacidad de predecir tokens enmascarados, aunque el fine-tuning se centra en clasificación.
- Procesamiento de texto amárico: tokenización y representación contextual específica para este idioma, con vocabulario propio.
- Inferencia de doble tarea: una sola pasada por el modelo produce simultáneamente predicciones de stance y sentimiento, lo que reduce coste computacional en pipelines multitarea.

## Casos de uso

- Análisis de opiniones en redes sociales en amárico: el modelo puede clasificar tweets o publicaciones de Facebook en cuanto a sentimiento y postura hacia productos, marcas o figuras públicas, facilitando el monitoreo de reputación.
- Monitoreo de campañas políticas: detectar la posición de los usuarios frente a candidatos o propuestas en comentarios y foros, útil para estrategias de comunicación.
- Análisis de comentarios en portales de noticias: clasificar la reacción de los lectores ante artículos, distinguiendo entre apoyo, rechazo o neutralidad.
- Investigación académica en NLP para amárico: servir como modelo de referencia para tareas de análisis de sentimiento y stance en este idioma, dado el escaso número de recursos existentes.
- Moderación de contenido: identificar comentarios con posturas extremas o sentimientos negativos en plataformas digitales, ayudando a priorizar la revisión humana.
- Sistemas de recomendación basados en opiniones: integrar las predicciones de sentimiento y stance para personalizar contenido o filtrar reseñas en aplicaciones de comercio electrónico o servicios locales.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 1.4334 |
| Stance F1 | 0.7101 |
| Sentiment F1 | 0.7070 |
| F1 (promedio) | 0.7085 |
| Stance Acc | 0.7032 |
| Sentiment Acc | 0.7120 |

Evolución durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Stance F1 | Sentiment F1 | F1 | Stance Acc | Sentiment Acc |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1.9226 | 1.0 | 402 | 1.8563 | 0.5304 | 0.6048 | 0.5676 | 0.5424 | 0.6297 |
| 1.5487 | 2.0 | 804 | 1.5113 | 0.6818 | 0.6915 | 0.6866 | 0.6746 | 0.6933 |
| 1.4161 | 3.0 | 1206 | 1.4579 | 0.7021 | 0.6870 | 0.6946 | 0.6958 | 0.6945 |
| 1.2897 | 4.0 | 1608 | 1.4353 | 0.7065 | 0.7098 | 0.7081 | 0.6983 | 0.7145 |
| 1.2129 | 5.0 | 2010 | 1.4353 | 0.7087 | 0.7091 | 0.7089 | 0.7020 | 0.7132 |
| 1.2527 | 6.0 | 2412 | 1.4334 | 0.7101 | 0.7070 | 0.7085 | 0.7032 | 0.7120 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 40,4 millones de parámetros, lo que en precisión fp32 ocupa aproximadamente 162 MB. Con una cuantización a int8 (si estuviera disponible) se reduciría a unos 40 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Despliegue: compatible con la librería `transformers` de Hugging Face, por lo que puede servirse con herramientas como Hugging Face Inference Endpoints, vLLM (aunque no es óptimo para modelos tan pequeños), o mediante exportación a ONNX para entornos de producción.
- Latencia: al ser un modelo pequeño, la inferencia en GPU es del orden de milisegundos por muestra; en CPU puede ser de decenas de milisegundos.
- Throughput: en una GPU moderna (por ejemplo, RTX 3090) se pueden procesar cientos de muestras por segundo con batch adecuado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos publicados para este modelo frente a alternativas. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Idiomas | Tarea | Licencia |
|---|---|---|---|---|---|
| MTL-rasyosef-bert-medium-amharic (este) | 40,4 M | 512 | amárico | stance + sentimiento | no disponible |
| rasyosef/bert-medium-amharic (base) | 40,4 M | 512 | amárico | MLM / fill-mask | no disponible |
| rasyosef/bert-medium-amharic-finetuned-sentiment | 40,4 M | 512 | amárico | sentimiento | no disponible |
| mBERT (multilingüe) | 178 M | 512 | 104 idiomas (incluye amárico) | MLM / clasificación | Apache 2.0 |

El modelo base y sus fine-tunings están orientados específicamente al amárico, mientras que mBERT es multilingüe pero con menor precisión en idiomas de bajos recursos. No se han encontrado benchmarks que comparen directamente estos modelos.

## Limitaciones y advertencias

- El dataset de entrenamiento del fine-tuning no está documentado (aparece como "None" en la model card), lo que impide evaluar posibles sesgos o la representatividad de los datos.
- El modelo está limitado al idioma amárico; no soporta otros idiomas.
- La longitud de contexto es de 512 tokens, por lo que textos más largos deben truncarse o dividirse, lo que puede perder información relevante.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Las métricas de evaluación (F1 ~0.71) indican un rendimiento moderado; puede haber errores de clasificación en casos ambiguos o con vocabulario poco frecuente.
- Al ser un modelo de clasificación, no genera texto libre; su uso se limita a tareas de etiquetado.
- No se han realizado evaluaciones de sesgo o robustez frente a ataques adversariales, por lo que su comportamiento en entornos no controlados es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-rasyosef-bert-medium-amharic
- Modelo base: https://huggingface.co/rasyosef/bert-medium-amharic
- Repositorio GitHub del modelo base: https://github.com/rasyosef/bert-amharic
- Fine-tuning de sentimiento del modelo base: https://huggingface.co/rasyosef/bert-medium-amharic-finetuned-sentiment
- Entrada en catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/rasyosef-bert-medium-amharic
