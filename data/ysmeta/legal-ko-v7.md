# ysmeta/legal-ko-v7

## Resumen

ysmeta/legal-ko-v7 es un modelo de embeddings de frases (sentence embeddings) especializado en el dominio legal coreano, desarrollado por YSMETA AI LAB. Se trata de un fine-tuning del modelo BGE-m3-ko, orientado a tareas de recuperación de información (information retrieval) y similitud semántica sobre jurisprudencia, legislación y documentos jurídicos en coreano. El modelo está diseñado para resolver el problema de la búsqueda semántica en corpus legales extensos, donde la terminología especializada y las construcciones sintácticas complejas dificultan la recuperación basada en palabras clave.

Con 567,75 millones de parámetros y una arquitectura basada en XLM-RoBERTa (heredada de su modelo base), legal-ko-v7 está optimizado para generar representaciones densas de alta calidad en textos legales coreanos. El modelo se entrenó con un dataset de 152.556 pares de consulta-documento utilizando funciones de pérdida de ranking por negativos múltiples (CachedMultipleNegativesRankingLoss y MultipleNegativesRankingLoss), una estrategia estándar para fine-tuning de modelos de recuperación. Su relevancia actual radica en la creciente demanda de sistemas de búsqueda semántica y asistentes legales basados en IA en el ámbito jurídico coreano, donde los modelos multilingües generalistas suelen quedarse cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (heredada del modelo base BGE-m3-ko) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base BGE-m3-ko soporta 8192 tokens; el modelo no especifica cambios) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder multilingüe preentrenado con masked language modeling. Al ser un fine-tuning de dragonkue/BGE-m3-ko, hereda la arquitectura de BGE-M3, que incorpora atención bidireccional estándar y soporta secuencias largas. El modelo genera embeddings densos de 1024 dimensiones, adecuados para búsqueda semántica mediante similitud coseno.

El entrenamiento se realizó con un dataset de 152.556 ejemplos, utilizando CachedMultipleNegativesRankingLoss y MultipleNegativesRankingLoss. Estas funciones de pérdida optimizan el modelo para que las representaciones de consultas y documentos relevantes estén cercanas en el espacio vectorial, mientras que los pares negativos (muestreados dentro del batch) quedan alejados. La composición exacta del dataset no se detalla en la documentación, pero por el nombre del modelo y los ejemplos mostrados en la model card, se infiere que incluye jurisprudencia coreana, textos legislativos y doctrina legal. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generacion de embeddings de frases y documentos para busqueda semantica en coreano legal.
- Recuperacion de informacion (information retrieval) sobre jurisprudencia, legislacion y documentos juridicos.
- Similitud semantica entre consultas y textos legales, con soporte para busqueda por similitud coseno.
- Reranking de resultados de busqueda mediante precision@k y recall@k.
- Integracion con pipelines de sentence-transformers y Text Embeddings Inference (TEI).
- Compatible con sistemas de retrieval-augmented generation (RAG) para asistentes legales.
- No soporta tool calling, agentes ni razonamiento multi-paso por ser un modelo de embeddings, no un LLM generativo.

## Casos de uso

- Busqueda de jurisprudencia relevante: un abogado puede consultar un caso concreto y obtener sentencias similares del corpus legal coreano. El modelo es adecuado porque ha sido entrenado especificamente con textos juridicos y muestra un accuracy@1 de 0,92 en el benchmark legal-hard-slice.
- Asistentes legales con RAG: integrable en pipelines de retrieval-augmented generation donde un LLM generativo responde preguntas legales citando fuentes recuperadas por este modelo. Su recall@10 de 0,99 garantiza que las sentencias relevantes aparezcan en los primeros resultados.
- Analisis de contratos y documentos: permite agrupar clausulas contractuales similares o detectar documentos con contenido juridico equivalente, facilitando revisiones masivas de contratos.
- Sistemas de gestion documental en despachos: clasificacion y busqueda semantica de expedientes, dictamenes y escritos legales almacenados en bases de datos vectoriales.
- Investigacion academica en derecho: los investigadores pueden localizar doctrina y jurisprudencia relacionada con un tema especifico sin depender de palabras clave exactas, gracias a la comprension semantica del lenguaje legal.
- Chatbots de orientacion legal: un sistema conversacional puede recuperar la normativa o sentencia aplicable a una consulta ciudadana formulada en lenguaje natural, como los ejemplos de la model card sobre objecion de conciencia al servicio militar.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el dataset EVE-Bench-Legal-1.0 (subconjunto "legal hard slice"), un benchmark de recuperacion legal en coreano:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,92 |
| Cosine Accuracy@10 | 0,99 |
| Cosine Precision@1 | 0,92 |
| Cosine Precision@3 | 0,3222 |
| Cosine Precision@5 | 0,1967 |
| Cosine Precision@10 | 0,0990 |
| Cosine Recall@1 | 0,92 |
| Cosine Recall@3 | 0,9667 |
| Cosine Recall@5 | 0,9833 |
| Cosine Recall@10 | 0,99 |
| Cosine NDCG@10 | 0,9582 |
| Cosine MRR@10 | 0,9477 |
| Cosine MAP@100 | 0,9482 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los valores de precision decrecientes a mayor k son esperables en tareas de recuperacion con multiples documentos relevantes por consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 567,75 millones de parametros. En FP32, el checkpoint ocupa aproximadamente 2,3 GB (tamano del repo), por lo que se necesitan al menos 3-4 GB de VRAM para inferencia en FP32.
- En FP16, el uso de VRAM se reduce a aproximadamente 1,2 GB, lo que permite ejecutarlo en GPUs consumer de gama media como RTX 3060 o superiores.
- Con cuantizacion INT8 (no documentada oficialmente, pero posible con herramientas como llama.cpp o bitsandbytes), cabria en GPUs con 1 GB de VRAM, aunque no se garantiza la calidad de los embeddings.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32, o 2 GB para FP16. Tarjetas como RTX 3060, RTX 4060, T4 o A10 son suficientes.
- Opciones de despliegue: sentence-transformers, Hugging Face Text Embeddings Inference (TEI), endpoints compatibles con la API de Hugging Face, y librerias de busqueda vectorial como FAISS o Qdrant.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia, un modelo de este tamano en una GPU T4 suele procesar entre 100 y 300 frases por segundo en FP16, dependiendo de la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso legal coreano |
|---|---|---|---|---|---|
| ysmeta/legal-ko-v7 | 567,75 M | no disponible (base: 8192) | ko | MIT | Especializado, fine-tuning sobre BGE-m3-ko |
| dragonkue/BGE-m3-ko | 567,75 M | 8192 | ko, multilingue | MIT | Generalista, no especializado en legal |
| KoSimCSE-roberta | 110 M | 512 | ko | MIT | Generalista, embeddings de frases en coreano |
| law-legal-ko-sroberta-multitask | no disponible | no disponible | ko | no disponible | Especializado en legal coreano, pero sin datos publicos recientes |

La comparativa se basa en modelos disponibles en Hugging Face para embeddings en coreano. legal-ko-v7 destaca por su especializacion en el dominio legal, mientras que BGE-m3-ko es su base generalista y KoSimCSE-roberta es una alternativa mas ligera pero con menor capacidad. No se dispone de benchmarks comparativos directos entre estos modelos.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el idioma coreano; no es util para textos legales en otros idiomas.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales. Para respuestas legales se necesita un LLM adicional.
- Los benchmarks declarados son proporcionados por el autor y no estan verificados de forma independiente (campo "verified: false" en la model card).
- El dataset de entrenamiento no esta documentado en detalle; se desconoce su cobertura temporal, el equilibrio entre fuentes (jurisprudencia, legislacion, doctrina) y posibles sesgos hacia ciertos tipos de casos.
- La precision@3 y precision@5 son notablemente bajas (0,32 y 0,20 respectivamente), lo que sugiere que cuando hay multiples documentos relevantes, el modelo no los prioriza de forma optima en los primeros puestos.
- No se documentan cuantizaciones oficiales; el uso de cuantizacion puede degradar la calidad de los embeddings.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base BGE-m3-ko tambien es MIT, por lo que no hay restricciones de licencia adicionales.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es un modelo reciente o poco adoptado; su rendimiento en produccion no esta contrastado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ysmeta/legal-ko-v7
- Dataset de evaluacion EVE-Bench-Legal-1.0: https://huggingface.co/datasets/ysmeta/EVE-Bench-Legal-1.0
- Perfil de YSMETA AI LAB: https://huggingface.co/ysmeta/datasets
- Modelo base BGE-m3-ko: https://huggingface.co/dragonkue/BGE-m3-ko
