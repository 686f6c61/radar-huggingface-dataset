# Srimon12/bangla-embed-e5-small-mnrl

## Resumen

`bangla-embed-e5-small-mnrl` es un modelo de embeddings de frases (sentence embeddings) especializado en bengalí, desarrollado por Srimon12 a partir del modelo base `intfloat/multilingual-e5-small`. Su objetivo es mejorar la representación semántica de textos en bengalí, un idioma de bajos recursos que tradicionalmente queda mal cubierto por los modelos multilingües genéricos. El modelo se ha ajustado mediante entrenamiento contrastivo con `MultipleNegativesRankingLoss` y su variante cacheada, sobre un dataset de 33.310 ejemplos, lo que le permite producir representaciones densas de alta calidad para tareas de recuperación de información y similitud semántica.

La arquitectura hereda la del modelo base: un transformer BERT de 12 capas con 117,6 millones de parámetros, lo que lo convierte en un modelo compacto y eficiente para despliegue en entornos con recursos limitados. Aunque el modelo base es multilingüe, este ajuste se centra exclusivamente en bengalí (`bn`). La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para aplicaciones en producción dentro del ecosistema de procesamiento de lenguaje natural en bengalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (12 capas, 12 cabezas de atención) |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de E5-small) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bengalí (bn) como idioma principal; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, una variante del modelo E5 basada en arquitectura BERT con 12 capas y 117 millones de parámetros. El ajuste se ha realizado con `MultipleNegativesRankingLoss` y `CachedMultipleNegativesRankingLoss`, dos funciones de pérdida contrastivas ampliamente usadas para entrenar modelos de embeddings de frases. Estas pérdidas maximizan la similitud entre pares positivos (consulta-respuesta) y minimizan la similitud con ejemplos negativos dentro del mismo lote. El dataset de entrenamiento tiene 33.310 ejemplos, aunque no se detalla su composición exacta (si incluye pares consulta-pasaje, pares de frases similares, etc.).

No se especifica si se aplicaron técnicas adicionales como destilación, entrenamiento en varias etapas o ajuste con datos de NLI, a diferencia de otros modelos similares como `kazalbrur/bangla-embed-e5-small` que sí documenta un entrenamiento en tres fases. La arquitectura heredada de E5-small requiere el uso de prompts específicos (tipo "query: " o "passage: ") para obtener un rendimiento óptimo, una práctica común en la familia E5.

## Capacidades

- Genera embeddings densos de frases y documentos para similitud semántica en bengalí.
- Soporta recuperación de información (retrieval) con búsqueda por similitud coseno.
- Permite clustering de textos y clasificación de frases mediante embeddings.
- Adecuado para tareas de búsqueda semántica y sistemas de pregunta-respuesta basados en recuperación (RAG).
- Compatible con la librería `sentence-transformers` y con el framework `text-embeddings-inference` para despliegue en producción.
- Al estar basado en el modelo multilingüe E5-small, puede procesar otros idiomas aunque con rendimiento degradado respecto al bengalí.
- Requiere el uso de prompts de tipo E5 ("query: ", "passage: ") para obtener buenos resultados.

## Casos de uso

- Búsqueda semántica en bengalí: el modelo permite indexar documentos en bengalí y recuperar los más relevantes para una consulta dada, superando las limitaciones de la búsqueda por palabras clave. Se puede integrar en motores de búsqueda de sitios web, bibliotecas digitales o plataformas de noticias en bengalí.
- Sistemas de recuperación aumentada por generación (RAG): como modelo de embeddings para indexar y recuperar pasajes de conocimiento en bengalí, puede alimentar pipelines de RAG para chatbots o asistentes virtuales que atienden en este idioma.
- Clasificación de documentos: convirtiendo textos en embeddings, se pueden entrenar clasificadores sencillos (regresión logística, SVM) sobre los vectores para categorizar noticias, opiniones o documentos administrativos en bengalí.
- Clustering de contenido: agrupar automáticamente artículos, tweets o comentarios en bengalí por tema o similitud semántica, útil para análisis de redes sociales o periodismo de datos.
- Deduplicación de textos: detectar versiones duplicadas o casi duplicadas de artículos, descripciones de productos o publicaciones en foros en bengalí mediante la similitud coseno entre embeddings.
- Motores de recomendación basados en contenido: recomendar artículos, productos o vídeos en bengalí comparando los embeddings de los ítems ya consumidos con los disponibles en el catálogo.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index se basan en el dataset MIRACL bengalí, una colección de recuperación de información multilingüe. Se utilizó la similitud coseno como métrica de distancia.

| Metrica | Valor |
|---|---|
| Accuracy@1 (cosine) | 0,91 |
| Accuracy@10 (cosine) | 1,0 |
| Precision@10 (cosine) | 0,207 |
| Recall@10 (cosine) | 0,995 |
| NDCG@10 (cosine) | 0,945 |
| MRR@10 (cosine) | 0,940 |
| MAP@100 (cosine) | 0,918 |

Estos resultados indican un rendimiento muy alto en recuperación de información para el bengalí, especialmente en las métricas de recall y ranking. No se han publicado comparaciones con otros modelos en la información disponible, por lo que no se puede contextualizar estos valores frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT de 118M parámetros, el uso de memoria en FP32 es de aproximadamente 470 MB para los pesos. Con cuantización a FP16 o INT8, el consumo se reduce a unos 240 MB y 120 MB respectivamente, por lo que es ejecutable en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso puede ejecutarse en CPU de forma razonable para cargas moderadas. No requiere GPUs de gama alta.
- Se puede ejecutar en GPU de consumo como NVIDIA GTX 1650, RTX 3060, o incluso en Apple Silicon.
- Opciones de despliegue: compatible con `sentence-transformers` para prototipado, `text-embeddings-inference` para servir en producción, y `ONNX Runtime` para entornos optimizados.
- Latencia y throughput: no se han publicado datos específicos, pero en una GPU moderna (por ejemplo RTX 3090) la codificación de una frase de 128 tokens tarda típicamente menos de 10 ms con un throughput de varios cientos de frases por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento (MIRACL bn) |
|---|---|---|---|---|---|
| Srimon12/bangla-embed-e5-small-mnrl | 118M | 512 | bn (multilingüe base) | MIT | Acc@1: 0,91, NDCG@10: 0,945 |
| kazalbrur/bangla-embed-e5-small | 118M | 512 | bn/en | MIT | no disponible |
| intfloat/multilingual-e5-small | 118M | 512 | multilingüe (100+) | MIT | no disponible (modelo base) |

El modelo de Srimon12 se diferencia del de kazalbrur por su entrenamiento con `CachedMultipleNegativesRankingLoss` y un dataset más pequeño (33.310 frente al entrenamiento en tres etapas del otro). El modelo base multilingüe E5-small tiene buen rendimiento en bengalí, pero el ajuste específico mejora la recuperación en este idioma.

## Limitaciones y advertencias

- El dataset de entrenamiento es relativamente pequeño (33.310 ejemplos), lo que puede limitar la generalización a dominios especializados (legal, médico, técnico) en bengalí.
- No se documentan sesgos evaluados: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente si estos provienen de fuentes de noticias o contenidos web.
- Riesgo de alucinación no aplica directamente (es un modelo de embeddings, no generativo), pero la calidad de los embeddings puede degradarse en frases fuera del dominio de entrenamiento.
- El modelo está optimizado para bengalí; aunque el modelo base es multilingüe, el uso en otros idiomas puede producir resultados subóptimos.
- No se especifican cuantizaciones oficiales ni se ha validado el modelo en entornos de producción de alto rendimiento.
- La licencia MIT permite uso comercial, pero no hay garantía de soporte o mantenimiento por parte del autor.

## Enlaces

- [HuggingFace: Srimon12/bangla-embed-e5-small-mnrl](https://huggingface.co/Srimon12/bangla-embed-e5-small-mnrl)
- [Modelo base: intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small)
- [Modelo similar: kazalbrur/bangla-embed-e5-small](https://huggingface.co/kazalbrur/bangla-embed-e5-small)
- [Paper sobre BanglaEmbed (arXiv)](https://arxiv.org/html/2411.15270v1)
