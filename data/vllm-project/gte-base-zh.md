# vllm-project/gte-base-zh

## Resumen

gte-base-zh es un modelo de embeddings de texto (sentence-transformers) basado en la arquitectura BERT, desarrollado originalmente por el equipo de Alibaba DAMO Academy y redistribuido en el espacio vllm-project para su uso con motores de inferencia compatibles. Con 102.268.160 parametros, esta disenado para generar representaciones vectoriales densas de frases y parrafos, principalmente en chino, y se evalua en las tareas del benchmark C-MTEB (Chinese Massive Text Embedding Benchmark).

El modelo resuelve el problema de la busqueda semantica y la similitud textual en chino: convierte texto en vectores de 768 dimensiones que permiten recuperacion, clustering, clasificacion y reranking sin necesidad de coincidencia lexica exacta. Es relevante para pipelines RAG (retrieval-augmented generation) en castellano-chino o entornos multilingues donde se necesite indexar documentacion en chino.

La ficha se basa en los datos publicados en la model card de Hugging Face y en los resultados de la model-index. No se dispone de informacion sobre el proceso exacto de entrenamiento ni sobre el numero de tokens utilizados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 102.268.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos); el modelo esta orientado al chino por sus benchmarks C-MTEB |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estandar, un transformer encoder con atencion bidireccional disenado para producir embeddings de frase. La model card no detalla el numero de capas, dimensiones ocultas ni cabezas de atencion, aunque por el numero de parametros (102M) corresponde a la variante "base" de BERT (tipicamente 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus ni si se aplicaron tecnicas de RLHF, DPO o contrastive learning especificas. La model card unicamente incluye los resultados de evaluacion en C-MTEB, sin describir el procedimiento de entrenamiento. El tag `arxiv:2308.03281` apunta al paper de GTE (General Text Embeddings), que describe el enfoque de entrenamiento multi-etapa con pares de texto, pero los detalles concretos no se reproducen en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y busqueda densa.
- Recuperacion de informacion (retrieval) en chino, con resultados medidos en CmedqaRetrieval.
- Reranking de candidatos en pipelines de busqueda (CMedQAv1 y CMedQAv2).
- Clustering de documentos y frases (CLSClusteringP2P y S2S).
- Clasificacion de textos (AmazonReviewsClassification en chino).
- Pair classification para determinar si dos textos son equivalentes o contradictorios (CMNLI).
- Soporte de similitud por coseno, producto escalar, distancia euclidea y Manhattan, segun las metricas reportadas.
- No soporta tool calling, agentes ni generacion de texto: es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica en chino: indexar manuales, FAQs o articulos y recuperar los fragmentos mas relevantes mediante similitud coseno, aprovechando los resultados de retrieval medidos en CmedqaRetrieval (recall@10 de 55,264).
- RAG (retrieval-augmented generation) sobre corpus chinos: usar el modelo como retriever en un pipeline que alimente a un LLM generativo, con reranking posterior mediante el mismo modelo o uno especializado (los resultados de reranking en CMedQAv1 alcanzan MAP de 86,79).
- Deduplicacion y near-duplicate detection: comparar embeddings de pares de documentos para identificar contenido repetido, apoyandose en la alta precision de pair classification en CMNLI (F1 de 79,57).
- Clustering de noticias o tickets de soporte: agrupar textos por tematica sin etiquetas previas, usando los resultados de CLSClusteringP2P (v-measure de 42,58) como referencia de calidad.
- Clasificacion de resenas o feedback de usuarios: entrenar un clasificador ligero sobre los embeddings generados, con accuracy de 45,82 en AmazonReviewsClassification (zh) como linea base.
- Moderacion de contenido asistida: calcular similitud entre mensajes entrantes y una base de ejemplos problematicos para priorizar revision humana.
- Sistemas de recomendacion basados en contenido: representar items textuales (titulos, descripciones) como vectores y calcular afinidad con el perfil del usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| STS | C-MTEB/AFQMC | cos_sim_spearman | 49,065 |
| STS | C-MTEB/ATEC | cos_sim_spearman | 50,831 |
| STS | C-MTEB/BQ | cos_sim_spearman | 65,498 |
| Classification | AmazonReviewsClassification (zh) | accuracy | 45,818 |
| Classification | AmazonReviewsClassification (zh) | f1 | 43,998 |
| Clustering | CLSClusteringP2P | v_measure | 42,580 |
| Clustering | CLSClusteringS2S | v_measure | 40,421 |
| Reranking | CMedQAv1 | map | 86,791 |
| Reranking | CMedQAv1 | mrr | 88,813 |
| Reranking | CMedQAv2 | map | 87,202 |
| Reranking | CMedQAv2 | mrr | 89,466 |
| Retrieval | CmedqaRetrieval | ndcg_at_10 | 44,375 |
| Retrieval | CmedqaRetrieval | recall_at_10 | 55,264 |
| Retrieval | CmedqaRetrieval | map_at_10 | 37,759 |
| PairClassification | C-MTEB/CMNLI | cos_sim_f1 | 79,571 |
| PairClassification | C-MTEB/CMNLI | cos_sim_ap | 85,600 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generacion, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,4 GB (102M parametros x 4 bytes).
- VRAM estimada en FP16/BF16: aproximadamente 0,2 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para lotes pequenos.
- GPU recomendadas para alto throughput: A100, H100, L40S o RTX 4090 para indexacion masiva por lotes.
- Opciones de despliegue: sentence-transformers (PyTorch), Text Embeddings Inference (TEI, tag `text-embeddings-inference` presente), vLLM (por el espacio de nombres del repo), ONNX Runtime y llama.cpp no confirmado para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gte-base-zh (este) | 102M | no disponible | chino (benchmarks C-MTEB) | MIT | Hugging Face |
| gte-large-zh | no disponible en esta ficha | no disponible | chino | MIT | Hugging Face |
| bge-base-zh-v1.5 | no disponible en esta ficha | no disponible | chino | MIT | Hugging Face |
| m3e-base | no disponible en esta ficha | no disponible | chino | MIT | Hugging Face |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa fiable. La comparativa se limita a la categoria y licencia.

## Limitaciones y advertencias

- Los resultados de benchmark estan marcados como `verified: false` en la model-index; no han sido validados de forma independiente.
- El modelo esta orientado al chino segun sus benchmarks, aunque los metadatos declaren `en` como idioma; el rendimiento en castellano o en otros idiomas no esta documentado.
- Es un modelo exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de robustez, lo que limita la evaluacion de riesgos en produccion.
- La longitud maxima de contexto no esta declarada; en arquitecturas BERT suele ser de 512 tokens, pero debe confirmarse antes de usarlo con documentos largos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperar pasajes irrelevantes en dominios fuera de distribucion (los benchmarks son mayoritariamente medicos y de resenas).
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la procedencia original del modelo (Alibaba DAMO) por si hubiera terminos adicionales no reflejados en el repo redistribuido.
- El numero de descargas (24) y likes (0) sugiere que este repo concreto es una redistribucion reciente con poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/gte-base-zh
- Paper de GTE (referenciado en tags): https://arxiv.org/abs/2308.03281
- Repo original de GTE (Alibaba DAMO): no disponible en la informacion proporcionada
- Benchmark C-MTEB: no disponible en la informacion proporcionada
- Documentacion de Text Embeddings Inference: no disponible en la informacion proporcionada
