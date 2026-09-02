# tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive-token-pooling

## Resumen

El modelo `multivector-ModernBERT-base-msmarco-cached-contrastive-token-pooling` es un sistema de embeddings multi-vector para recuperación de información, desarrollado por Tom Aarsen sobre la arquitectura ModernBERT-base. Se trata de un modelo de tipo ColBERT (late interaction) que genera una representación vectorial por token tanto para consultas como para documentos, permitiendo una comparación más granular que los embeddings de frase tradicionales. Está fine-tuneado sobre el dataset MS MARCO (tripletas) con una combinación de pérdidas contrastivas y regularización de pooling de tokens, lo que mejora la calidad de los vectores generados.

El modelo resuelve el problema de la búsqueda semántica y la recuperación de pasajes con alta precisión, especialmente en escenarios donde la coincidencia exacta de términos es insuficiente. Su relevancia actual radica en que combina la eficiencia de ModernBERT (atención local y global, contexto largo) con la potencia de los modelos multi-vector, ofreciendo una alternativa ligera (149 millones de parámetros) para sistemas de retrieval y RAG. Está disponible bajo licencia Apache 2.0 y es compatible con la librería sentence-transformers y Text Embeddings Inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder bidireccional) + capa de pooling multi-vector (late interaction) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (ModernBERT-base soporta hasta 8192 tokens, pero no se especifica para este modelo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder bidireccional moderno que combina atención global y local (sliding window) para lograr un equilibrio entre eficiencia y capacidad de modelado de contexto largo. Sobre esta base, se añade una capa de pooling multi-vector que produce un embedding por token de la secuencia de salida, en lugar de un único vector de frase. Esto permite la interacción tardía (late interaction) típica de ColBERT, donde la similitud entre consulta y documento se calcula como la suma de los máximos de similitud coseno entre los vectores de tokens.

El entrenamiento se realizó sobre el dataset `sentence-transformers/msmarco-bm25` (99.000 tripletas) utilizando dos funciones de pérdida: `MultiVectorTokenPoolingLoss` (que regulariza la distribución de los vectores de tokens) y `CachedMultiVectorMultipleNegativesRankingLoss` (una variante de la pérdida contrastiva con múltiples negativos, optimizada con caché para acelerar el entrenamiento). No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado estándar para retrieval.

## Capacidades

- Generación de embeddings multi-vector para consultas y documentos, optimizados para recuperación por interacción tardía.
- Búsqueda semántica de pasajes y documentos con alta granularidad (comparación token a token).
- Extracción de características (feature extraction) para tareas de retrieval y ranking.
- Soporte nativo para la librería sentence-transformers, lo que facilita su integración en pipelines de embeddings.
- Compatible con Text Embeddings Inference (TEI) para despliegue en producción.
- Capacidad de procesar consultas y documentos de forma independiente, permitiendo indexación previa de documentos.
- No soporta generación de texto, tool calling, agentes ni visión; es exclusivamente un modelo de representación.

## Casos de uso

- **Búsqueda semántica en bases de conocimiento**: el modelo puede indexar documentos y responder consultas en lenguaje natural, devolviendo los pasajes más relevantes mediante similitud coseno multi-vector. Su interacción tardía mejora la precisión en consultas con sinónimos o parafraseo.
- **Sistemas RAG (Retrieval-Augmented Generation)**: como componente de recuperación, permite seleccionar los fragmentos más pertinentes para alimentar a un modelo generativo, reduciendo alucinaciones y mejorando la fidelidad de las respuestas.
- **Búsqueda en documentación técnica**: ideal para indexar manuales, APIs o guías de desarrollo, donde los términos técnicos y las variaciones léxicas son frecuentes. La representación por tokens captura matices que los embeddings de frase pierden.
- **Deduplicación y agrupación de documentos**: al generar vectores por token, se pueden comparar documentos completos para detectar duplicados o agrupar temáticamente con mayor sensibilidad que los embeddings globales.
- **Filtrado de contenido en foros o comunidades**: permite encontrar hilos o respuestas relevantes a partir de consultas de usuarios, incluso cuando no hay coincidencia exacta de palabras clave.
- **Sistemas de recomendación basados en texto**: al representar ítems (artículos, productos, noticias) como vectores multi-vector, se pueden calcular similitudes semánticas para sugerir contenido relacionado.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en los conjuntos de evaluación NanoMSMARCO y NanoNQ (métricas de recuperación multi-vector):

| Dataset | Metrica | Valor |
|---|---|---|
| NanoMSMARCO | Maxsim Accuracy@1 | 0.32 |
| NanoMSMARCO | Maxsim Accuracy@3 | 0.50 |
| NanoMSMARCO | Maxsim Accuracy@5 | 0.60 |
| NanoMSMARCO | Maxsim Accuracy@10 | 0.80 |
| NanoMSMARCO | Maxsim Precision@1 | 0.32 |
| NanoMSMARCO | Maxsim Precision@3 | 0.1667 |
| NanoMSMARCO | Maxsim Precision@5 | 0.12 |
| NanoMSMARCO | Maxsim Precision@10 | 0.08 |
| NanoMSMARCO | Maxsim Recall@1 | 0.32 |
| NanoMSMARCO | Maxsim Recall@3 | 0.50 |
| NanoMSMARCO | Maxsim Recall@5 | 0.60 |
| NanoMSMARCO | Maxsim Recall@10 | 0.80 |
| NanoMSMARCO | Maxsim NDCG@10 | 0.5373 |
| NanoMSMARCO | Maxsim MRR@10 | 0.4568 |
| NanoMSMARCO | Maxsim MAP@100 | 0.4661 |
| NanoNQ | Maxsim Accuracy@1 | 0.38 |
| NanoNQ | Maxsim Accuracy@3 | 0.58 |
| NanoNQ | Maxsim Accuracy@5 | 0.68 |
| NanoNQ | Maxsim Accuracy@10 | 0.82 |
| NanoNQ | Maxsim Precision@1 | 0.38 |
| NanoNQ | Maxsim Precision@3 | 0.1933 |
| NanoNQ | Maxsim Precision@5 | 0.136 |
| NanoNQ | Maxsim Precision@10 | 0.086 |
| NanoNQ | Maxsim Recall@1 | 0.36 |
| NanoNQ | Maxsim Recall@3 | 0.55 |
| NanoNQ | Maxsim Recall@5 | 0.63 |
| NanoNQ | Maxsim Recall@10 | 0.77 |
| NanoNQ | Maxsim NDCG@10 | 0.5586 |
| NanoNQ | Maxsim MRR@10 | 0.5077 |
| NanoNQ | Maxsim MAP@100 | 0.4912 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 149 millones de parámetros, en precisión FP32 el modelo ocupa aproximadamente 596 MB. En FP16 o BF16, unos 298 MB. Para inferencia con batch pequeño, una GPU con 4 GB de VRAM es suficiente; para batch grande o indexación de muchos documentos, se recomienda al menos 8 GB.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA, como RTX 3060 (12 GB), RTX 4090, A10G, A100 o H100. También puede ejecutarse en CPU con llama.cpp o similar, aunque con mayor latencia.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que se use cuantización o precisión reducida.
- **Opciones de despliegue**: sentence-transformers (Python), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, y potencialmente vLLM (aunque no está confirmado para este modelo específico). También se puede exportar a ONNX o TensorRT para optimización.
- **Latencia y throughput**: no hay datos oficiales. Para un modelo de 149M, la inferencia en GPU suele ser de unos pocos milisegundos por lote pequeño, pero depende del hardware y la longitud de los textos.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se puede contextualizar con otros modelos multi-vector:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo | 149M | no disponible | Apache 2.0 | Basado en ModernBERT-base, fine-tune en MS MARCO |
| ColBERTv2 | ~110M (base) | 512 tokens | MIT | Modelo clásico de late interaction, entrenado en MS MARCO |
| answerdotai/ModernBERT-base | 149M | 8192 tokens | Apache 2.0 | Modelo base sin capa multi-vector, para embeddings de frase |

La comparación real requeriría ejecutar los mismos benchmarks, lo cual no está disponible en la documentación.

## Limitaciones y advertencias

- **Idioma**: el modelo solo está entrenado y evaluado en inglés. No es adecuado para otros idiomas sin fine-tuning adicional.
- **Dominio**: entrenado exclusivamente en MS MARCO (consultas y pasajes de búsqueda web). Puede degradarse en dominios muy especializados (médico, legal, etc.) sin adaptación.
- **Alucinación**: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación en ese sentido. Sin embargo, la recuperación puede devolver pasajes irrelevantes si la consulta está fuera del dominio de entrenamiento.
- **Contexto**: aunque ModernBERT-base soporta hasta 8192 tokens, no se especifica la longitud máxima de secuencia para este modelo. Se recomienda verificar el comportamiento con secuencias largas.
- **Cuantización**: no se publican versiones cuantizadas (GGUF, etc.), lo que puede limitar su uso en entornos con restricciones de memoria.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no se otorgan garantías.
- **Sesgos**: al entrenarse con datos de búsqueda web, puede reflejar sesgos presentes en MS MARCO (por ejemplo, sobrerrepresentación de ciertos temas o estilos de escritura).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco-cached-contrastive-token-pooling)
- [Modelo base ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base)
- [Paper de ModernBERT (arXiv:2412.13663)](https://arxiv.org/pdf/2412.13663)
- [Modelo relacionado: multivector-ModernBERT-base-msmarco-contrastive](https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco)
- [Modelo relacionado: sin expansión de consulta](https://huggingface.co/tomaarsen/multivector-ModernBERT-base-msmarco-contrastive-no-query-expansion)
- [Post en X sobre el blog de entrenamiento](https://x.com/tomaarsen/status/2092611931890713066)
