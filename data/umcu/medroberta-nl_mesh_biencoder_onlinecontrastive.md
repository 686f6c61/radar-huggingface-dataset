# UMCU/MedRoBERTa.nl_MeSH_biencoder_OnlineContrastive

## Resumen

MedRoBERTa.nl_MeSH_biencoder_OnlineContrastive es un modelo de embeddings de frases (sentence transformer) en neerlandés especializado en el dominio biomédico. Lo desarrolla el University Medical Center Utrecht (UMCU) y parte del modelo base CLTL/MedRoBERTa.nl, un RoBERTa adaptado al neerlandés médico. El modelo se ha afinado con una pérdida OnlineContrastiveLoss sobre un conjunto de 445.355 pares derivados del corpus UMCU/PubmedAbstracts_Dutch_v1_with_MeSH, con el objetivo de alinear representaciones de abstracts y términos MeSH en un espacio denso.

La arquitectura es un transformer encoder de tipo RoBERTa con 125.978.112 parámetros, empaquetado en formato sentence-transformers (safetensors). Su función principal es la similitud semántica y la extracción de características densas, lo que lo hace útil para tareas de recuperación, clustering y clasificación en textos biomédicos en neerlandés. No es un modelo generativo: produce vectores de embedding, no texto.

Su relevancia actual radica en la escasez de modelos de embeddings especializados en neerlandés biomédico, un dominio donde los modelos multilingües genéricos suelen rendir peor por la terminología técnica y las abreviaturas clínicas. La licencia Apache 2.0 facilita su integración en producción, aunque el modelo es reciente y tiene un volumen de descargas muy bajo, lo que limita la evidencia empírica de su robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: CLTL/MedRoBERTa.nl) |
| Parámetros totales | 125.978.112 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base RoBERTa suele admitir 512 tokens, pero no se confirma) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | neerlandés (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un biencoder denso construido sobre CLTL/MedRoBERTa.nl, un encoder RoBERTa adaptado al dominio médico en neerlandés. La salida es un vector de embedding por frase, adecuado para similitud coseno y búsqueda semántica. El entrenamiento se realizó con la pérdida OnlineContrastiveLoss, una variante contrastiva que genera pares negativos en línea durante el entrenamiento, lo que suele mejorar la discriminación entre ejemplos similares y no similares sin necesidad de minería negativa offline exhaustiva.

El conjunto de entrenamiento consta de 445.355 ejemplos derivados de UMCU/PubmedAbstracts_Dutch_v1_with_MeSH, un corpus de abstracts de PubMed en neerlandés anotados con términos MeSH. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni si hubo fases adicionales de RLHF o DPO (no aplicables típicamente a modelos de embeddings). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de frases densos para similitud semántica y recuperación de información.
- Extracción de características (feature-extraction) para clasificación y clustering de textos biomédicos.
- Especialización en terminología médica neerlandesa y en la relación entre abstracts y descriptores MeSH.
- Soporte de sentence-similarity mediante similitud coseno entre vectores.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües limitadas al neerlandés; no se documenta transferencia a otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en literatura biomédica neerlandesa: indexar abstracts de PubMed en neerlandés y recuperar los más relevantes para una consulta clínica mediante similitud de embeddings, aprovechando el ajuste al dominio MeSH.
- Clasificación automática de abstracts por descriptor MeSH: usar los embeddings como entrada a un clasificador ligero para asignar términos MeSH a nuevos abstracts, reduciendo el trabajo manual de indexación.
- Deduplicación y clustering de publicaciones: agrupar abstracts con contenido temático similar para revisiones sistemáticas o análisis bibliométricos, gracias a la representación densa del biencoder.
- Sistemas de recomendación de literatura: sugerir artículos relacionados a un investigador a partir de un abstract semilla, calculando vecinos más cercanos en el espacio de embeddings.
- Enriquecimiento de bases de datos clínicas: mapear textos libres de historiales o informes a vocabularios controlados comparando embeddings de fragmentos con embeddings de términos MeSH.
- Filtrado de relevancia en pipelines de revisión: descartar abstracts no relacionados con un tema antes de una revisión manual, reduciendo el volumen de lectura con un umbral de similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 126 M de parámetros, más overhead de activaciones y tokenización; en la práctica, menos de 2 GB para lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Transformers, Text Embeddings Inference (TEI), ONNX Runtime; no se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UMCU/MedRoBERTa.nl_MeSH_biencoder_OnlineContrastive | 125.978.112 | no disponible | nl (biomédico) | Apache 2.0 | Hugging Face |
| CLTL/MedRoBERTa.nl (base) | no disponible | no disponible | nl (biomédico) | no disponible | Hugging Face |
| Modelos de embeddings multilingües genéricos | variable | variable | multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en neerlandés; su uso en otros idiomas no está respaldado.
- Al ser un modelo de embeddings y no generativo, puede heredar sesgos del corpus PubMed neerlandés y del etiquetado MeSH, con posible infrarrepresentación de ciertas especialidades o poblaciones.
- Riesgo de similitudes espurias en textos con terminología ambigua o abreviaturas clínicas no vistas en entrenamiento.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en producción es incierto.
- La longitud máxima de contexto no está documentada; secuencias largas pueden truncarse y perder información.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base CLTL/MedRoBERTa.nl y del corpus de entrenamiento.
- El volumen de descargas (18) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UMCU/MedRoBERTa.nl_MeSH_biencoder_OnlineContrastive
- Modelo base: https://huggingface.co/CLTL/MedRoBERTa.nl
- Dataset: https://huggingface.co/datasets/UMCU/PubmedAbstracts_Dutch_v1_with_MeSH
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper referenciado arXiv:2604.25374: https://arxiv.org/abs/2604.25374
