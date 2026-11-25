# veripazari/modernbert-tr-embed

## Resumen

modernbert-tr-embed es un modelo de embeddings de frases (sentence-transformers) especializado en turco, desarrollado por el usuario veripazari a partir del checkpoint base ytu-ce-cosmos/modernbert-tr-base. Su funcion principal es transformar texto en vectores densos de alta calidad para tareas de similitud semantica, recuperacion de informacion (retrieval), clasificacion de pares, clustering y clasificacion de textos en turco. Con 148,7 millones de parametros, se posiciona como un encoder compacto y eficiente para pipelines de RAG y busqueda semantica en ese idioma.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta disponible en formatos safetensors y ONNX, ademas de ser compatible con Text Embeddings Inference (TEI) y con la libreria sentence-transformers. Su publicacion es reciente (noviembre de 2026) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que se trata de un modelo nuevo y practicamente sin validacion externa por parte de la comunidad.

La relevancia de este modelo radica en la escasez relativa de encoders de embeddings de alta calidad especificamente entrenados y evaluados para turco, un idioma con morfologia aglutinante y gran volumen de contenido web. Al estar construido sobre una arquitectura ModernBERT adaptada al turco, ofrece una ventana de contexto amplia (hasta 8192 tokens segun la arquitectura ModernBERT, aunque no se confirma en la informacion disponible) y un rendimiento declarado en el benchmark MTEB turco (trmteb) que lo hace candidato para sistemas de busqueda y recuperacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con attention linear y RoPE), afinado como sentence-transformer |
| Parametros totales | 148.737.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura ModernBERT soporta hasta 8192 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; no se detallan variantes GGUF ni cuantizaciones especificas) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de encoder transformer que incorpora innovaciones como attention linear (alternando capas de atencion local y global), embeddings posicionales rotatorios (RoPE) y mejoras de eficiencia computacional respecto a BERT clasico. Sobre el checkpoint ytu-ce-cosmos/modernbert-tr-base, adaptado al turco, se ha realizado un afinamiento con objetivo de similitud de frases (probablemente con perdidas contrastivas tipo MultipleNegativesRankingLoss, habitual en sentence-transformers), aunque la informacion proporcionada no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la mezcla de corpus turcos empleados ni los hiperparametros del afinamiento. La model card referencia tres papers (arXiv:2412.19048, arXiv:1807.03748, arXiv:2004.11362) que corresponden, respectivamente, a ModernBERT, SimCLR y Supervised Contrastive Learning, lo que sugiere el uso de aprendizaje contrastivo supervisado en el entrenamiento. El modelo incluye ademas una version ONNX y etiquetas relacionadas con encoderfile y Text Embeddings Inference, lo que indica que fue preparado para despliegue en infraestructura de inferencia de embeddings.

## Capacidades

- Generacion de embeddings de frases y parrafos en turco para similitud semantica.
- Recuperacion de informacion (retrieval) densa: indexacion y busqueda de documentos por similitud vectorial.
- Clasificacion de pares de textos (pair classification): entailment, parafrasis y similitud.
- Clustering de textos: agrupacion de documentos por tematica o estilo.
- Clasificacion de textos (sentiment analysis, categoria de noticias, deteccion de ironia, lenguaje ofensivo).
- Extraccion de caracteristicas (feature extraction) para pipelines downstream.
- Soporte de despliegue via Text Embeddings Inference (TEI) y formato ONNX para inferencia optimizada.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidad multilingue limitada al turco; no se declaran otros idiomas.

## Casos de uso

- Busqueda semantica en turco: indexar un corpus de documentos turcos con embeddings del modelo y recuperar los mas relevantes ante una consulta en lenguaje natural, aprovechando su rendimiento en tareas de retrieval como MSMarcoTR (ndcg@10 de 57,87) y TQuad (87,14).
- Sistemas RAG (Retrieval-Augmented Generation) para asistentes en turco: usar el modelo como recuperador en un pipeline que alimente a un LLM generativo con pasajes relevantes de una base documental turca.
- Moderacion de contenido: clasificar comentarios y publicaciones en turco como ofensivos o no ofensivos, apoyandose en su capacidad de clasificacion de textos y en el dataset offenseval incluido en la evaluacion.
- Analisis de sentimiento de resenas: procesar resenas de peliculas o productos en turco y clasificarlas como positivas o negativas (accuracy declarada de 89,34 en el dataset Turkish-Movie-Review).
- Deduplicacion y agrupamiento de noticias: usar clustering de embeddings para agrupar articulos periodisticos turcos por tematica (v-measure de 64,42 en TurkishColumnWritingClustering y 62,22 en TurkishAbstractCorpusClustering).
- Deteccion de parafrasis y similitud entre preguntas: emplear la similitud coseno entre embeddings para identificar preguntas duplicadas en foros o plataformas de QA en turco (ndcg@10 de 95,18 en QuoraRetrievalTR).
- Clasificacion automatica de noticias por categoria: etiquetar articulos turcos en categorias predefinidas con alta precision (accuracy de 93,64 en TurkishNewsCategoryClassification y 93,33 en Turkish75NewsClassification).
- Motor de busqueda en documentacion tecnica o cientifica en turco: recuperar pasajes relevantes de articulos o manuales (ndcg@10 de 77,06 en SciFactTR y 75,93 en SquadTRRetrieval).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (MTEB turco, trmteb). No verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Retrieval | MTEB ArguAnaTR | ndcg_at_10 | 50,01 |
| Retrieval | MTEB CQADupstackGamingRetrievalTR | ndcg_at_10 | 56,37 |
| Retrieval | MTEB FiQA2018TR | ndcg_at_10 | 46,20 |
| Retrieval | MTEB MSMarcoTRRetrieval | ndcg_at_10 | 57,87 |
| Retrieval | MTEB NFCorpusTR | ndcg_at_10 | 9,47 |
| Retrieval | MTEB QuoraRetrievalTR | ndcg_at_10 | 95,18 |
| Retrieval | MTEB SCIDOCSTR | ndcg_at_10 | 3,37 |
| Retrieval | MTEB SciFactTR | ndcg_at_10 | 77,06 |
| Retrieval | MTEB SquadTRRetrieval | ndcg_at_10 | 75,93 |
| Retrieval | MTEB TQuadRetrieval | ndcg_at_10 | 87,14 |
| PairClassification | MTEB MnliTr | max_ap | 65,92 |
| PairClassification | MTEB SnliTr | max_ap | 67,29 |
| STS | MTEB STSbTR | cosine_spearman | 77,62 |
| Classification | MTEB THYSentimentClassification | accuracy | 68,14 |
| Classification | MTEB TSTimelineNewsCategoryClassification | accuracy | 67,91 |
| Classification | MTEB Turkish75NewsClassification | accuracy | 93,33 |
| Classification | MTEB TurkishIronyClassification | accuracy | 57,67 |
| Classification | MTEB TurkishMovieSentimentClassification | accuracy | 89,34 |
| Classification | MTEB TurkishNewsCategoryClassification | accuracy | 93,64 |
| Clustering | MTEB TurkishAbstractCorpusClustering | v_measure | 62,22 |
| Clustering | MTEB TurkishColumnWritingClustering | v_measure | 64,42 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval o GSM8K no aplican a un encoder de embeddings).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 148,7 millones de parametros, en precision FP16 requiere aproximadamente 300 MB de pesos; en FP32, unos 600 MB. El consumo real depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; se puede ejecutar en NVIDIA T4, L4, A10, RTX 3060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con 4 GB o mas de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TEI), ONNX Runtime, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no se declaran en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados comparativos con otros modelos de embeddings para turco, por lo que no es posible establecer una comparativa cuantitativa fiable. Como alternativas de la misma categoria (encoders de embeddings multilingues o especificos de turco) podrian considerarse modelos como multilingual-e5, BGE-M3 o sentence-transformers multilingues, pero no se aportan datos de rendimiento comparables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| modernbert-tr-embed | 148,7 M | no disponible | Apache 2.0 | Hugging Face, safetensors, ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco: no debe esperarse un rendimiento adecuado en otros idiomas.
- Es un encoder de embeddings, no un modelo generativo: no puede usarse para generacion de texto, razonamiento, codigo ni agentes.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo "verified": false en el model-index).
- Rendimiento bajo en algunos datasets de retrieval como SCIDOCSTR (3,37) y NFCorpusTR (9,47), lo que sugiere limitaciones en dominios cientificos o medicos especializados.
- Riesgo de sesgos presente en los corpus turcos de entrenamiento (noticias, redes sociales, resenas), que puede reflejarse en los embeddings y en tareas de clasificacion.
- No se detalla la composicion del dataset de entrenamiento ni el numero de tokens, lo que dificulta evaluar la cobertura linguistica y de dominios.
- El modelo tiene cero descargas y cero likes en el momento de la ficha: carece de validacion externa por parte de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar la licencia del modelo base (ytu-ce-cosmos/modernbert-tr-base) por si impone condiciones adicionales.
- No se declaran cuantizaciones GGUF ni soporte confirmado en llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/modernbert-tr-embed
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
- Paper ModernBERT (arXiv:2412.19048): https://arxiv.org/abs/2412.19048
- Paper SimCLR (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Paper Supervised Contrastive Learning (arXiv:2004.11362): https://arxiv.org/abs/2004.11362
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Benchmark MTEB: https://github.com/embeddings-benchmark/mteb
