# thunderboltc/mbart50-sanlish-to-bangla_1934

## Resumen

El modelo `mbart50-sanlish-to-bangla_1934` es un ajuste fino (fine-tune) de `facebook/mbart-large-50-many-to-many-mmt`, el modelo multilingüe de traducción automática de Meta, especializado en la traducción de texto "sanlish" (una mezcla de sánscrito e inglés, o bengalí romanizado con términos ingleses, común en redes sociales y comunicación informal en Bangladesh) a bengalí nativo. Lo desarrolla el usuario `thunderboltc` y se publicó en agosto de 2026.

Con 611 millones de parámetros, el modelo hereda la arquitectura encoder-decoder de mBART-50, lo que le permite aprovechar el conocimiento multilingüe del modelo base y especializarlo en el par de lenguas sanlish→bengalí. Su relevancia radica en abordar un problema frecuente en el procesamiento de lenguaje natural para lenguas de bajos recursos: la normalización de texto híbrido y romanizado hacia la escritura estándar bengalí.

La model card es escasa en detalles: no especifica el dataset de entrenamiento, la licencia ni los idiomas soportados de forma explícita. Los resultados de evaluación reportan una pérdida de 3,0056, un BLEU de 14,7263 y un ChrF de 40,3129, lo que sugiere un rendimiento moderado que debe interpretarse con cautela al carecer de datos comparativos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mBART-large-50, many-to-many) |
| Parametros totales | 611.129.542 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredado del modelo base mBART-50) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Sanlish→bengalí (el modelo base soporta 50 idiomas, incluido bengalí) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura mBART-large-50, un transformer encoder-decoder con 12 capas en cada componente, diseñado originalmente para traducción automática multilingüe many-to-many entre 50 idiomas. El ajuste fino se realizó sobre el checkpoint preentrenado de Facebook, adaptando las representaciones multilingües al par de traducción específico sanlish→bengalí.

El entrenamiento se ejecutó durante 25 épocas con un tamaño de lote de 4, una tasa de aprendizaje de 3e-05 con programador lineal (linear scheduler) y optimizador Adam (betas 0,9 y 0,999). Se utilizó precisión mixta nativa (Native AMP) con PyTorch 2.11.0 y Transformers 4.44.2. El dataset de entrenamiento no está especificado en la model card (aparece como "None"). La pérdida de entrenamiento descendió de 3,5861 en la época 1 a 0,0079 en la época 25, mientras que la pérdida de validación se estabilizó en torno a 3,0 a partir de la época 9, lo que indica posible sobreajuste en las últimas épocas.

## Capacidades

- Traducción automática de texto sanlish (mezcla de sánscrito, inglés y bengalí romanizado) a bengalí estándar en escritura nativa.
- Generación de texto a texto (text2text-generation) mediante la API de Transformers.
- Herencia de las capacidades multilingües del modelo base mBART-50, aunque el ajuste fino puede haber reducido el rendimiento en otros pares de idiomas.
- Soporte de decodificación autoregresiva con beam search u otras estrategias de generación disponibles en la librería Transformers.
- Compatible con los pipelines de Hugging Face para traducción (pipeline("translation", model="thunderboltc/mbart50-sanlish-to-bangla_1934")).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio, dado que es un modelo puramente de traducción.

## Casos de uso

- Normalizacion de contenido de redes sociales: el modelo puede convertir comentarios y publicaciones escritas en bengalí romanizado o mezclado con inglés a bengalí nativo, facilitando el análisis posterior con herramientas de NLP estándar.
- Preprocesamiento para pipelines de NLP en bengali: al normalizar texto híbrido a escritura estándar, se pueden aplicar modelos de análisis de sentimiento, clasificacion o extraccion de entidades que requieren entrada en bengalí nativo.
- Traduccion de atencion al cliente: empresas que operan en Bangladesh pueden convertir consultas de usuarios escritas en sanlish a bengalí formal antes de enrutarlas a sistemas de respuesta automatica o agentes humanos.
- Archivado y preservacion digital: normalizacion de contenido historico o informal en sanlish a bengalí estandar para su almacenamiento, busqueda y consulta en repositorios digitales.
- Localizacion de aplicaciones y servicios: traduccion de contenido generado por usuarios en sanlish a bengalí para su integracion en interfaces, documentacion o sistemas de recomendacion.
- Construccion de datasets paralelos: el modelo puede usarse para generar datos de entrenamiento adicionales (traducciones sanlish→bengalí) para otros modelos de traduccion o de generacion de texto en bengalí.
- Asistencia en educacion y alfabetizacion digital: conversion de materiales educativos informales escritos en sanlish a bengalí estandar, facilitando su uso en plataformas de aprendizaje.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card, obtenidos sobre el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 3,0056 |
| BLEU | 14,7263 |
| ChrF | 40,3129 |

Evolucion del entrenamiento (seleccion de epocas representativas):

| Epoca | Loss entrenamiento | Loss validacion | BLEU | ChrF |
|---|---|---|---|---|
| 1 | 3,5861 | 2,8079 | 4,4064 | 22,2837 |
| 5 | 0,3903 | 2,7702 | 12,7659 | 34,2661 |
| 10 | 0,0692 | 2,9155 | 15,2580 | 38,2711 |
| 15 | 0,0253 | 2,9553 | 14,9336 | 39,1814 |
| 20 | 0,0157 | 2,9821 | 14,9393 | 40,0835 |
| 25 | 0,0079 | 3,0056 | 14,7263 | 40,3129 |

El mejor BLEU se alcanzo en la epoca 10 (15,2580) y el mejor ChrF en la epoca 21 (40,9619). El checkpoint final (epoca 25) fue seleccionado como mejor checkpoint por BLEU de validacion segun el autor, aunque el BLEU de la epoca 10 es ligeramente superior. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB (611M parametros × 4 bytes).
- VRAM estimada en FP16/BF16: aproximadamente 1,2 GB.
- VRAM estimada en INT8: aproximadamente 0,6 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1660, RTX 3060, RTX 4090) es suficiente para inferencia. Para entrenamiento o fine-tune adicional, se recomienda al menos 16 GB de VRAM (RTX 4090, A100).
- El modelo cabe comodamente en GPUs consumer de gama media e incluso en CPU con cuantizacion.
- Opciones de despliegue: Hugging Face Transformers (pipeline de traduccion), Hugging Face TGI (Text Generation Inference), llama.cpp con conversion a GGUF (no confirmado para mBART), o servidores custom con FastAPI.
- Latencia estimada: para un encoder-decoder de 611M parametros en una RTX 3090, la generacion de una frase de 20-30 tokens suele completarse en 200-500 ms, dependiendo de la longitud de la secuencia de entrada y la estrategia de decodificacion.
- Nota: vLLM tiene soporte limitado para arquitecturas encoder-decoder como mBART; se recomienda usar Transformers o TGI para despliegue en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU (sanlish→bengali) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thunderboltc/mbart50-sanlish-to-bangla_1934 | 611M | 1024 | 14,73 | no disponible | Hugging Face |
| facebook/mbart-large-50-many-to-many-mmt (base) | 611M | 1024 | no evaluado para este par | MIT | Hugging Face |
| BanglaT5 | 220M-580M | 512-1024 | no disponible | no disponible | Hugging Face |
| mT5 (small/base) | 300M-580M | 512-1024 | no disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados comparativos directos en la tarea sanlish→bengalí para los modelos alternativos. El articulo de arXiv 2501.02599 evalua mBART50, mT5 y BanglaT5 en problemas matematicos en bengalí, pero no en traduccion sanlish→bengalí. La comparativa debe interpretarse como orientativa.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado: la model card indica "None dataset", lo que impide evaluar la calidad, tamano y posibles sesgos de los datos utilizados.
- La licencia no esta especificada: no se puede confirmar si el modelo es de uso libre para aplicaciones comerciales. Se recomienda contactar al autor antes de usarlo en produccion.
- El BLEU de 14,73 es relativamente bajo en terminos absolutos, lo que sugiere que la calidad de traduccion puede ser limitada para textos complejos o tecnicos.
- La perdida de validacion se estanca en torno a 3,0 a partir de la epoca 9 mientras la perdida de entrenamiento sigue descendiendo, lo que indica sobreajuste al conjunto de entrenamiento.
- No se documentan sesgos especificos, pero al tratarse de un modelo entrenado sobre datos no especificados, podria reflejar sesgos presentes en el corpus original (por ejemplo, sesgos de genero, dialecto o registro informal).
- Riesgo de alucinacion: como todo modelo de traduccion neuronal, puede producir traducciones gramaticalmente correctas pero semanticamente incorrectas, especialmente con texto ambiguo o muy coloquial.
- La longitud de contexto de 1024 tokens limita la traduccion de documentos largos, que deben segmentarse previamente.
- No se proporciona informacion sobre el rendimiento en otros pares de idiomas tras el ajuste fino; es probable que la especializacion haya degradado las capacidades multilingües originales del modelo base.
- El repositorio ocupa 61,1 GB, lo que sugiere que incluye checkpoints de entrenamiento intermedios ademas de los pesos finales; el modelo principal ocupa aproximadamente 2,47 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla_1934
- Repositorio del modelo (archivos): https://huggingface.co/thunderboltc/mbart50-sanlish-to-bangla_1934/tree/main
- Modelo base: https://huggingface.co/facebook/mbart-large-50-many-to-many-mmt
- Articulo relacionado (problemas matematicos en bengalí con mBART50, mT5 y BanglaT5): https://arxiv.org/pdf/2501.02599v1
