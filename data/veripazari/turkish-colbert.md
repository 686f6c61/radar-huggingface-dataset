# veripazari/turkish-colbert

## Resumen

Turkish-ColBERT es un modelo de recuperación de pasajes (passage retrieval) en turco basado en la arquitectura ColBERT de interacción tardía (late interaction) multi-vector. Lo desarrolló originalmente el grupo de investigación COSMOS AI de la Universidad Técnica de Yıldız (YTU) y esta ficha corresponde a la réplica archivada por VeriPazarı, que preserva la documentación original y lo distribuye con licencia MIT para la comunidad de IA en turco.

El modelo parte de Cosmos Turkish Base BERT (`ytu-ce-cosmos/turkish-base-bert-uncased`), un BERT base de 110,8 millones de parámetros, y se afina sobre 500.000 tripletas (consulta, pasaje positivo, pasaje negativo) extraídas de una traducción al turco del dataset MS MARCO. El resultado es un recuperador que genera embeddings por token (multi-vector) y puntúa la relevancia mediante MaxSim, en lugar de un único vector por texto.

Es relevante para pipelines RAG y búsqueda semántica en turco, un idioma con menos cobertura en modelos de retrieval de alta calidad. Su licencia MIT y su integración con Sentence Transformers (`MultiVectorEncoder`) y RAGatouille lo hacen desplegable en producción sin restricciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional) con cabeza de interacción tardía ColBERT (multi-vector) |
| Parámetros totales | 110.813.952 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT soporta típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos safetensors; cuantización GGUF/ONNX no documentada) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base (12 capas, dimensión oculta 768, 110,8 M de parámetros) heredado de `ytu-ce-cosmos/turkish-base-bert-uncased`, adaptado al paradigma ColBERT: cada texto se representa como una matriz de embeddings por token (dimensión de proyección 256 según el ejemplo de la model card, con hasta 32 tokens por consulta y 39 por documento en el ejemplo mostrado). La puntuación de relevancia se calcula con MaxSim, sumando para cada token de la consulta la similitud máxima con los tokens del documento.

El ajuste fino se realizó sobre 500.000 tripletas (consulta, positivo, negativo) procedentes de una versión traducida al turco de MS MARCO (`parsak/msmarco-tr`). La model card no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; no hay información disponible sobre innovaciones como decodificación especulativa o atención lineal, ya que no es un modelo generativo.

Una particularidad operativa importante: el tokenizador es *uncased* y requiere conversión manual a minúsculas con manejo específico de la i sin punto turca mediante `text.replace("I", "ı").lower()`, debido a una incidencia conocida del tokenizador de Transformers (issue #6680).

## Capacidades

- Generación de embeddings multi-vector para recuperación de pasajes (passage retrieval) en turco.
- Búsqueda semántica y reordenación (reranking) mediante puntuación MaxSim de interacción tardía.
- Codificación separada de consultas (`encode_query`) y documentos (`encode_document`), propia del paradigma asimétrico de ColBERT.
- Integración con Sentence Transformers (versión 6.0.0 o superior) mediante `MultiVectorEncoder`.
- Integración con RAGatouille para indexación y búsqueda sobre colecciones de documentos.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Soporte exclusivo de turco; no cubre otros idiomas.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Búsqueda semántica en corpus turcos: indexar una colección de documentos con `encode_document` y recuperar los pasajes más relevantes ante consultas en turco mediante MaxSim, aprovechando la representación por token para captar coincidencias léxicas y semánticas parciales.
- Recuperación en pipelines RAG en turco: usar el modelo como recuperador inicial sobre una base documental y pasar los pasajes recuperados a un LLM generativo, con RAGatouille como capa de indexación (`rag.index` y `rag.search`).
- Atención al cliente sobre base de conocimiento: recuperar artículos de ayuda o FAQ en turco a partir de la consulta del usuario, con la ventaja de que la interacción tardía tolera reformulaciones y variaciones morfológicas del turco.
- Búsqueda legal o administrativa: localizar cláusulas o artículos relevantes en documentación regulatoria turca, donde la coincidencia exacta de términos no basta y se requiere recuperación semántica a nivel de pasaje.
- Reranking de resultados: usar las puntuaciones MaxSim para reordenar los candidatos devueltos por un recuperador léxico (BM25) y mejorar la precisión en la parte alta del ranking.
- Investigación en recuperación de información multilingüe: servir como baseline turco en experimentos de retrieval y como punto de comparación con recuperadores densos de un solo vector.
- Moderación o deduplicación de contenido: calcular similitud entre pasajes turcos para detectar duplicados o contenido semánticamente próximo.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card:

| Dataset | R@1 | R@5 | R@10 | MRR@10 |
|---|---|---|---|---|
| Scifact-tr | 48,38 | 67,85 | 75,52 | 56,88 |
| WikiRAG-TR | 31,21 | 75,63 | 79,63 | 49,08 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 110,8 M de parámetros ocupan aproximadamente 0,44 GB; en fp16, unos 0,22 GB. El coste real depende del número de tokens codificados por lote, ya que la salida es multi-vector.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para lotes moderados; A100, H100 o RTX 4090 ofrecen margen amplio para indexación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores; incluso CPU es viable para volúmenes pequeños.
- Opciones de despliegue: Sentence Transformers (`MultiVectorEncoder`), RAGatouille, Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkish-colbert (este modelo) | 110,8 M | no disponible | ColBERT multi-vector | MIT | Hugging Face |
| ytu-ce-cosmos/turkish-base-bert-uncased | 110,8 M (BERT base) | no disponible | Encoder BERT | no disponible | Hugging Face |
| Recuperadores densos turcos de un solo vector | no disponible | no disponible | Bi-encoder | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos comparables, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo soporta turco; no es multilingüe y su uso en otros idiomas degradará la calidad de recuperación.
- Requiere conversión manual a minúsculas con manejo de la i sin punto (`text.replace("I", "ı").lower()`); omitir este paso produce resultados incorrectos por la incidencia conocida del tokenizador.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en la recuperación: la puntuación MaxSim puede priorizar coincidencias superficiales de tokens.
- Entrenado sobre una traducción automática de MS MARCO; los sesgos y errores de traducción del corpus pueden propagarse al modelo.
- La longitud de contexto no está documentada; el límite típico de BERT (512 tokens) puede truncar pasajes largos.
- Es una réplica archivada por VeriPazarı del modelo original de ytu-ce-cosmos; conviene verificar que los pesos coinciden con el original antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones que deben revisarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/veripazari/turkish-colbert
- Modelo original: https://huggingface.co/ytu-ce-cosmos/turkish-colbert
- Modelo base: https://huggingface.co/ytu-ce-cosmos/turkish-base-bert-uncased
- Dataset de entrenamiento (MS MARCO turco): https://huggingface.co/datasets/parsak/msmarco-tr
- Dataset de evaluación Scifact-tr: https://huggingface.co/datasets/AbdulkaderSaoud/scifact-tr
- Dataset de evaluación WikiRAG-TR: https://huggingface.co/datasets/Metin/WikiRAG-TR
- Paper ColBERT: https://doi.org/10.48550/arXiv.2112.01488
- Paper de los modelos BERT turcos: https://arxiv.org/abs/2307.14134
- Incidencia del tokenizador: https://github.com/huggingface/transformers/issues/6680
- Documentación de Sentence Transformers: https://www.sbert.net/
- Grupo de investigación COSMOS AI: https://cosmos.yildiz.edu.tr
- Plataforma VeriPazarı: https://veripazari.com.tr
