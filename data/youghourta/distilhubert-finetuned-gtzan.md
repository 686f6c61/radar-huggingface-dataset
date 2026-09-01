# Youghourta/distilhubert-finetuned-gtzan

## Resumen

El modelo `Youghourta/distilhubert-finetuned-gtzan` es un ajuste fino (fine-tune) del modelo de audio DistilHuBERT sobre el dataset GTZAN, un conjunto de referencia para la clasificación de géneros musicales. Desarrollado por el usuario Youghourta, este modelo está diseñado específicamente para la tarea de clasificación de audio, concretamente para identificar el género de una pieza musical entre las diez categorías del dataset GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock). Con aproximadamente 23,7 millones de parámetros, se trata de un modelo ligero en comparación con otros sistemas de audio basados en transformers, lo que lo hace adecuado para entornos con recursos limitados. Su relevancia actual radica en la creciente demanda de soluciones de clasificación de audio eficientes y desplegables en producción, donde modelos pequeños como este pueden ofrecer un equilibrio entre precisión y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilHuBERT (versión destilada de HuBERT) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilHuBERT es una versión destilada de HuBERT, un modelo de representación de audio basado en la arquitectura transformer. HuBERT aprende representaciones de audio mediante un objetivo de enmascaramiento y predicción de unidades discretas, mientras que DistilHuBERT reduce el número de capas y parámetros mediante destilación de conocimiento, manteniendo un rendimiento cercano al modelo original. En este caso, el modelo base `ntu-spml/distilhubert` se ha ajustado finamente sobre el dataset GTZAN, que contiene 1.000 clips de audio de 30 segundos etiquetados en diez géneros musicales. No se dispone de información detallada sobre el proceso de entrenamiento (número de épocas, tasa de aprendizaje, estrategias de regularización, etc.) en la documentación pública del modelo. El resultado es un clasificador de audio especializado en género musical, con una capa de clasificación añadida sobre las representaciones de DistilHuBERT.

## Capacidades

- Clasificación de audio: el modelo es capaz de asignar una etiqueta de género musical (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) a un clip de audio.
- Extracción de características: al ser una variante de HuBERT, puede utilizarse como extractor de características para otras tareas de audio, aunque su ajuste específico lo orienta a clasificación.
- Procesamiento de señales de audio: acepta entradas de audio en bruto (waveform) y las procesa mediante el extractor de características de DistilHuBERT.
- No soporta generación de texto, tool calling, capacidades multimodales más allá de audio, ni razonamiento multi-paso.

## Casos de uso

- Clasificación automática de géneros musicales en plataformas de streaming: el modelo puede integrarse en sistemas de recomendación o catalogación para etiquetar automáticamente nuevas canciones según su género, mejorando la organización de bibliotecas musicales.
- Análisis de contenido para derechos de autor: permite identificar el género de obras musicales en bases de datos de gestión de derechos, facilitando la clasificación y el seguimiento de regalías.
- Sistemas de búsqueda por similitud musical: al extraer representaciones de audio, puede utilizarse para encontrar canciones con características similares, útil en plataformas de descubrimiento musical.
- Herramientas de producción musical: los productores pueden usar el modelo para etiquetar rápidamente pistas de demostración o maquetas, agilizando el flujo de trabajo en estudios de grabación.
- Investigación en MIR (Music Information Retrieval): sirve como punto de partida para experimentos en clasificación de géneros, comparación de técnicas de destilación o evaluación de modelos ligeros en tareas de audio.
- Automatización de metadatos en archivos digitales: en bibliotecas de audio o archivos históricos, el modelo puede asignar etiquetas de género a grabaciones no catalogadas, reduciendo el esfuerzo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo específico. Otros modelos similares (por ejemplo, `yuval6967/distilhubert-finetuned-gtzan`) reportan una precisión de 0,82 y una pérdida de 0,5716 en el conjunto de evaluación de GTZAN, pero estos datos no deben atribuirse al modelo de Youghourta sin confirmación. Se recomienda evaluar el modelo en el conjunto de prueba de GTZAN para obtener métricas propias antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: con 23,7 millones de parámetros y pesos en FP32, el modelo ocupa aproximadamente 95 MB en memoria (23.691.402 × 4 bytes). En FP16, se reduce a ~48 MB. Esto permite su ejecución en GPU con poca memoria (incluso 2 GB son suficientes) y también en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o superiores. Para inferencia por lotes, una GPU con 4-8 GB es más cómoda.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer actual, incluidas las integradas (aunque con menor velocidad).
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con la librería `transformers` de Hugging Face. También es posible convertirlo a ONNX o TorchScript para inferencia en entornos de producción. No se han reportado integraciones específicas con vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dado el pequeño tamaño, se espera una latencia baja (decenas de milisegundos por clip en GPU), pero depende del hardware y del preprocesado de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | Precisión (eval) | Licencia |
|---|---|---|---|---|
| Youghourta/distilhubert-finetuned-gtzan | 23,7 M | GTZAN | no disponible | no disponible |
| yuval6967/distilhubert-finetuned-gtzan | 23,7 M (aprox.) | GTZAN | 0,82 | no disponible |
| EbisuRyu/distilhubert-finetuned-gtzan | 23,7 M (aprox.) | GTZAN | no disponible | no disponible |
| joheras/distilhubert-finetuned-gtzan | 23,7 M (aprox.) | GTZAN | no disponible | no disponible |

Todos estos modelos comparten la misma arquitectura base (DistilHuBERT) y el mismo dataset de ajuste (GTZAN). Las diferencias pueden residir en los hiperparámetros de entrenamiento, el preprocesado del audio y la división de datos. No se dispone de información pública que permita comparar directamente el rendimiento del modelo de Youghourta con los demás.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos. Al entrenarse en GTZAN, un dataset relativamente pequeño y con predominio de música occidental, el modelo puede tener un rendimiento inferior en géneros no representados o en músicas de otras culturas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación (en el sentido de generar contenido falso) no aplica. Sin embargo, puede producir clasificaciones erróneas si el audio de entrada es atípico o ruidoso.
- Limitaciones de contexto o idioma: el modelo procesa audio, no texto, por lo que no tiene limitaciones de idioma. Sí está limitado a la taxonomía de géneros de GTZAN (10 clases), y no puede clasificar otras categorías sin reentrenamiento.
- Restricciones de licencia: la licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar al autor antes de utilizarlo en aplicaciones comerciales.
- Caveats para producción: el modelo fue creado en agosto de 2026 y no se ha actualizado desde entonces. No hay documentación sobre su robustez frente a variaciones de calidad de audio, diferentes tasas de muestreo o duraciones de clip. Es necesario validar su comportamiento en el dominio de aplicación concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youghourta/distilhubert-finetuned-gtzan
- Modelo similar de yuval6967: https://huggingface.co/yuval6967/distilhubert-finetuned-gtzan
- Modelo similar de EbisuRyu: https://huggingface.co/EbisuRyu/distilhubert-finetuned-gtzan
- Ficha en AIBase: https://model.aibase.com/models/details/1915693431768375298
- Ficha en BimAnt AI Model Zoo: https://zoo.bimant.com/model/306932
