# yjoonjang/all-MiniLM-L6-v2-multi-qa-linear-merge

## Resumen

`yjoonjang/all-MiniLM-L6-v2-multi-qa-linear-merge` es un modelo de demostración creado con la función nativa de fusión de modelos (`SentenceTransformer.merge`) añadida en Sentence Transformers. Se trata de una fusión lineal (weights `[0.5, 0.5]`) de dos checkpoints populares: `sentence-transformers/all-MiniLM-L6-v2` y `sentence-transformers/multi-qa-MiniLM-L6-cos-v1`. El resultado es un modelo de embeddings de frases de 22,7 millones de parámetros, con arquitectura BERT de 6 capas y salida de vectores densos de 384 dimensiones.

El modelo resuelve el problema de obtener representaciones vectoriales de texto para tareas como búsqueda semántica, similitud entre frases o clustering, aprovechando la combinación de las fortalezas de los dos modelos base. Su relevancia actual reside en ser una demostración práctica de la funcionalidad de fusión de modelos de Sentence Transformers, que permite combinar pesos de distintos checkpoints sin entrenamiento adicional.

No se dispone de información sobre licencia específica, idiomas soportados ni benchmarks publicados. La model card indica que es un modelo de demostración, no un lanzamiento afinado para una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM) de 6 capas, transformer encoder |
| Parametros totales | 22.713.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings; los modelos base usan ventanas de 256 tokens) |
| Tipos de cuantizacion | no disponible (repo con pesos en float16, se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible (los modelos base están entrenados principalmente en inglés) |
| Licencia | no disponible (derivado de modelos con licencia Apache 2.0, según sus respectivas model cards) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión lineal de dos modelos de embeddings basados en BERT MiniLM de 6 capas: `all-MiniLM-L6-v2` (entrenado con siamese BERT-NLI para similitud de frases) y `multi-qa-MiniLM-L6-cos-v1` (entrenado con tripletas de preguntas y respuestas para búsqueda semántica). La fusión se realizó promediando los pesos de ambos checkpoints con el método `linear` y pesos `[0.5, 0.5]`, y convirtiendo los pesos resultantes a `float16`. No se realizó ningún entrenamiento adicional; es un proceso de combinación de parámetros. Los modelos base fueron entrenados con objetivos contrastivos (siamese networks) sobre conjuntos de datos como SNLI, MultiNLI y pares de preguntas/respuestas. La innovación principal no está en la arquitectura, sino en la técnica de fusión nativa que permite combinar modelos sin necesidad de ajuste fino posterior.

## Capacidades

- Generación de embeddings de frases y párrafos de hasta 512 tokens.
- Cálculo de similitud semántica entre textos mediante producto escalar o coseno.
- Búsqueda semántica y recuperación de documentos por relevancia.
- Clustering de textos basado en representaciones densas.
- Soporte de la API `sentence-transformers` para codificación y comparación de frases.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Multilingüismo no confirmado; los modelos base están optimizados para inglés.

## Casos de uso

- Búsqueda semántica en corpus pequeños: al ser un modelo de demostración, puede usarse para indexar y recuperar documentos en entornos de baja latencia, gracias a su tamaño reducido (22M parámetros) y velocidad de inferencia.
- Sistemas de recomendación por similitud de textos: por ejemplo, recomendar artículos o productos a partir de la similitud de sus descripciones.
- Clustering de tickets de soporte: agrupar incidencias de atención al cliente por temática usando los embeddings generados.
- Deduplicación de documentos: detectar documentos duplicados o casi duplicados en una base de datos comparando vectores.
- Preprocesamiento para pipelines de NLP: obtener representaciones compactas de frases para alimentar clasificadores o sistemas de aprendizaje automático.
- Evaluación de la técnica de fusión de modelos: sirve como caso de estudio para desarrolladores que quieren explorar cómo la fusión lineal afecta al rendimiento respecto a los modelos individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo de demostración, no hay evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float16 (tamaño de pesos ~45 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; incluso puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU de consumo (RTX 2060, RTX 3060, etc.) y también en dispositivos con poca memoria.
- Opciones de despliegue: compatible con `sentence-transformers`, `Transformers.js` (si se exporta a ONNX), `Ollama` (no oficial), y puede servirse con `vLLM` o `TGI` aunque no es común para modelos de embeddings.
- Latencia y throughput: muy bajos, típicos de modelos MiniLM; se pueden procesar miles de frases por segundo en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `all-MiniLM-L6-v2` (base) | 22,7M | 512 tokens | Referencia estándar en STS | Apache 2.0 | HuggingFace |
| `multi-qa-MiniLM-L6-cos-v1` (base) | 22,7M | 512 tokens | Optimizado para búsqueda de preguntas | Apache 2.0 | HuggingFace |
| `all-MiniLM-L6-v2-multi-qa-linear-merge` (este) | 22,7M | no disponible | Sin benchmarks publicados | no disponible | HuggingFace |

La comparativa se limita a los modelos base porque no se dispone de datos de rendimiento del modelo fusionado. En teoría, la fusión debería combinar las fortalezas de ambos, pero no hay evidencia empírica publicada.

## Limitaciones y advertencias

- Modelo de demostración: no está optimizado para ninguna tarea específica; su rendimiento puede ser inferior al de los modelos base en sus respectivos dominios.
- Licencia no especificada: aunque los modelos base tienen licencia Apache 2.0, la tarjeta del modelo no declara una licencia propia; se recomienda revisar las tarjetas de los modelos originales para conocer las condiciones exactas.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay alucinación en el sentido generativo.
- Sesgos: los modelos base pueden heredar sesgos de sus datos de entrenamiento (principalmente en inglés); no se ha realizado una evaluación de sesgo en este modelo fusionado.
- Limitaciones de contexto: la longitud máxima de entrada está determinada por los modelos base (512 tokens); no se ha verificado si la fusión afecta a este límite.
- Sin soporte de idiomas no ingleses: aunque no se ha confirmado oficialmente, los modelos base son monolingües en inglés.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/yjoonjang/all-MiniLM-L6-v2-multi-qa-linear-merge)
- [Modelo base 1: sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Modelo base 2: sentence-transformers/multi-qa-MiniLM-L6-cos-v1](https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1)
- [Documentación de Sentence Transformers (fusión de modelos)](https://github.com/UKPLab/sentence-transformers)
