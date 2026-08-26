# yjoonjang/MIMO-mmBERT-base

## Resumen

MIMO-mmBERT-base es un modelo de embeddings de frases (sentence embeddings) desarrollado por yjoonjang, basado en el modelo multilingüe mmBERT-base del JHU CLSP. Se trata de un modelo denso de tipo encoder-only, orientado a tareas de similitud semántica y recuperación de información, que ha sido ajustado mediante destilación de embeddings (EmbedDistillLoss) sobre un dataset de aproximadamente 5,6 millones de muestras.

El modelo resuelve el problema de obtener representaciones vectoriales densas de frases y párrafos en múltiples idiomas, aprovechando el conocimiento multilingüe de mmBERT, que fue preentrenado con 3 billones de tokens en más de 1800 idiomas. Su relevancia actual radica en que ofrece una alternativa moderna a los encoders multilingües clásicos como XLM-R, con una arquitectura ModernBERT actualizada y capacidades de recuperación de información en contextos multilingües.

Con 306,9 millones de parámetros y un tamaño de repositorio de 1,3 GB, es un modelo de tamaño medio comparable a otros encoders multilingües de la familia BERT. Su arquitectura se basa en ModernBERT, que introduce mejoras de eficiencia respecto al transformer original. Los pesos se distribuyen en formato safetensors, lo que garantiza una carga segura y eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer) |
| Parametros totales | 306.939.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (basado en mmBERT, preentrenado en 1800+ idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT de mmBERT, un encoder multilingüe del JHU-CLSP preentrenado sobre 3 billones de tokens en más de 1800 lenguas. ModernBERT introduce mejoras sobre el transformer clásico, incluyendo atención más eficiente y optimizaciones de velocidad y memoria, aunque los detalles concretos de la arquitectura interna del modelo base no se detallan en la información disponible.

El ajuste fino se realizó con sentence-transformers, empleando la función de pérdida EmbedDistillLoss, que permite destilar representaciones de un modelo profesor a un modelo alumno. El dataset de entrenamiento contiene 5.647.936 muestras, aunque no se especifica su composición lingüística exacta. No se menciona el uso de RLHF ni DPO, dado que se trata de un encoder para similitud semántica, no de un modelo generativo.

## Capacidades

- Generación de embeddings densos de frases y párrafos para similitud semántica.
- Recuperación de información multilingüe (information retrieval) con búsqueda por similitud coseno.
- Similitud textual semántica (STS) entre frases en diferentes idiomas.
- Búsqueda de pasajes relevantes en corpus multilingües.
- Extracción de características para pipelines de NLP (clasificación, clustering, deduplicación).
- Compatibilidad con la librería sentence-transformers y Text Embeddings Inference.
- Soporte para recuperación de información en árabe, alemán, inglés y español, según los benchmarks publicados.

## Casos de uso

- Búsqueda semántica en corpus multilingües: el modelo permite indexar documentos en varios idiomas y recuperarlos mediante consultas en otro idioma, gracias a su preentrenamiento multilingüe y al ajuste con EmbedDistillLoss.
- Sistemas de preguntas y respuestas basados en recuperación (RAG): se puede usar como encoder de pasajes y consultas para sistemas de generación aumentada por recuperación, donde la precisión de recuperación es crítica.
- Clasificación de documentos por similitud: permite agrupar o etiquetar documentos según su contenido semántico, útil para moderación de contenido o análisis de opiniones.
- Deduplicación de contenidos: comparación de embeddings para detectar textos duplicados o casi duplicados en grandes volúmenes de datos.
- Motor de recomendación de contenido: comparar la similitud entre artículos, noticias o productos en distintos idiomas para sugerir elementos relacionados.
- Búsqueda de jurisprudencia o documentación técnica: recuperación de documentos legales o técnicos en idiomas mixtos, donde las consultas y los documentos pueden estar en lenguas diferentes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, sobre el dataset NanoMIRACL (recuperación de información):

| Dataset | Cosine Accuracy@1 | Cosine Accuracy@10 | Cosine NDCG@10 | Cosine MRR@10 | Cosine MAP@100 |
|---|---|---|---|---|---|
| NanoMIRACL ar (árabe) | 0,14 | 0,56 | 0,349 | 0,282 | 0,301 |
| NanoMIRACL de (alemán) | 0,26 | 0,92 | 0,566 | 0,457 | 0,462 |
| NanoMIRACL en (inglés) | 0,30 | 0,88 | 0,568 | 0,471 | 0,475 |
| NanoMIRACL es (español) | 0,38 | no disponible | no disponible | no disponible | no disponible |

Nota: los datos para español están parcialmente disponibles; los valores de NDCG, MRR y MAP no se han publicado en la información proporcionada. Los resultados no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 306,9 millones de parámetros en fp32 ocupa aproximadamente 1,2 GB de VRAM; en cuantización int8, alrededor de 0,6 GB. Cabe en cualquier GPU consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con 4-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores. Para despliegues en producción con alto throughput, una A10G o T4 de 16 GB ofrece margen para batche y contexto largo.
- Cabe en consumer GPU: sí, es un modelo ligero que funciona sin problemas en GPUs de escritorio.
- Opciones de despliegue: compatible con sentence-transformers, Text Embeddings Inference (TEI), y puede exportarse a ONNX o TorchScript. También se puede servir con FastAPI o como endpoint en servicios como Hugging Face Inference Endpoints.
- Latencia: sin datos publicados, pero para un encoder de este tamaño se espera una latencia de decenas de milisegundos por lote pequeño en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MIMO-mmBERT-base | 306,9 M | no disponible | 1800+ (base) | no disponible | safetensors |
| XLM-RoBERTa-base | 278 M | 512 tokens | 100 idiomas | MIT | safetensors |
| multilingual-e5-base | 278 M | 512 tokens | 100+ | MIT | safetensors |
| BAAI/bge-m3 | 568 M | 8192 tokens | 100+ | MIT | safetensors |

La comparativa es orientativa: mmBERT-base es más moderno que XLM-R (que data de 2019) y ofrece cobertura en más de 1800 idiomas, aunque no se dispone de benchmarks comparativos directos contra estos modelos en los datos proporcionados.

## Limitaciones y advertencias

- No se dispone de la licencia del modelo, por lo que el uso comercial no está garantizado y se debe contactar al autor o verificar la licencia del modelo base jhu-clsp/mmBERT-base.
- Los benchmarks publicados solo cubren recuperación de información en cuatro idiomas (árabe, alemán, inglés y español) y no están verificados de forma independiente.
- El modelo no es generativo: no produce texto, solo embeddings. No es adecuado para tareas de generación, diálogo o razonamiento.
- La longitud de contexto no está publicada; se recomienda probar antes de usarlo con documentos largos.
- Los sesgos lingüísticos pueden existir dado el desequilibrio en los datos de preentrenamiento de mmBERT, que aunque cubre 1800+ idiomas, no tiene representación uniforme.
- Riesgo de alucinación no aplica al ser un encoder, pero sí puede producir embeddings poco fiables en idiomas poco representados.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que el modelo es reciente o poco probado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yjoonjang/MIMO-mmBERT-base
- Modelo base en HuggingFace: https://huggingface.co/jhu-clsp/mmBERT-base
- Blog de mmBERT en HuggingFace: https://huggingface.co/blog/mmbert
- Paper de mmBERT (arXiv): https://arxiv.org/html/2509.06888v1
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/blob/main/README.md
- Modelo relacionado mmBERT-en-CL: https://huggingface.co/yjoonjang/mmBERT-en-CL
