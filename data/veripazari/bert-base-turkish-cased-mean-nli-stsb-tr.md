# veripazari/bert-base-turkish-cased-mean-nli-stsb-tr

## Resumen

`veripazari/bert-base-turkish-cased-mean-nli-stsb-tr` es un modelo de embeddings de frases (sentence-transformers) para turco, derivado de un BERT base en su variante *cased* y ajustado para producir representaciones densas de 768 dimensiones mediante *mean pooling*. No es un modelo generativo: su función es mapear frases y párrafos a un espacio vectorial donde la similitud semántica se aproxima con distancia coseno o producto escalar. El modelo original fue desarrollado por el usuario `emrecan` y esta version es un espejo documentado y traducido al turco por VeriPazari, que lo archiva para el ecosistema de IA en turco.

El problema que resuelve es la ausencia de encoders de similitud semántica bien documentados para turco, un idioma con morfología aglutinante y relativamente pocos recursos de evaluación. Al estar entrenado sobre versiones traducidas automáticamente de los datasets NLI (`nli_tr`) y STS-b (`emrecan/stsb-mt-turkish`), ofrece una base práctica para búsqueda semántica, deduplicación y clustering de texto en turco sin necesidad de entrenar desde cero.

Es relevante ahora por su licencia permisiva (Apache 2.0), su tamaño contenido (110,6 millones de parámetros, ~440 MB en fp32) y su compatibilidad con el stack estándar de `sentence-transformers`, `transformers` y Text Embeddings Inference, lo que permite desplegarlo en CPU o en GPUs de gama baja. La contrapartida es que su calidad está acotada por la traducción automática de los datos de entrenamiento y por un contexto máximo típico de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (cased), con pooling de media (mean pooling) sobre embeddings contextualizados |
| Parametros totales | 110.617.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT base estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo incluye pesos safetensors y formato OpenVINO |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, OpenVINO |

## Arquitectura y entrenamiento

Se trata de un encoder Transformer tipo BERT base en variante *cased* (sensible a mayúsculas), con 110,6 millones de parámetros y salida de 768 dimensiones. La representación de frase se obtiene mediante *mean pooling* con máscara de atención, tal como se documenta en la model card. No hay cabecera generativa ni decoder: la salida es un vector denso por frase, adecuado para similitud, clustering y recuperación.

El entrenamiento siguió los scripts de ejemplo de `sentence-transformers`: primero `training_nli_v2.py` sobre el dataset NLI en turco y después `training_stsbenchmark_continue_training.py` sobre STS-b traducido al turco. Se usó `CosineSimilarityLoss`, 4 épocas, `batch_size` de 16, `max_grad_norm` de 1 y evaluación cada 200 pasos con `EmbeddingSimilarityEvaluator`. No se documenta el número exacto de tokens de entrenamiento ni si hubo etapas adicionales de RLHF o DPO (no aplicables a un encoder de similitud). La innovación técnica es limitada: se apoya en el pipeline estándar de SBERT, sin decodificación especulativa ni atención lineal.

## Capacidades

- Generación de embeddings de frase y párrafo de 768 dimensiones para similitud semántica.
- Búsqueda semántica y recuperación densa (dense retrieval) en turco.
- Clustering y agrupamiento de documentos por similitud vectorial.
- Deduplicación y near-duplicate detection de textos en turco.
- Clasificación de texto por similitud con prototipos o ejemplos etiquetados (zero-shot vía embeddings).
- Re-ranking semántico en pipelines de búsqueda híbrida (BM25 + vectores).
- Soporte de `feature-extraction` y `sentence-similarity` en `transformers` y `sentence-transformers`.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no; está entrenado y evaluado únicamente en turco.

## Casos de uso

- Búsqueda semántica en turco sobre catálogos o bases de conocimiento: se indexan documentos como vectores de 768 dimensiones y se recuperan por similitud coseno; el modelo es adecuado porque está ajustado sobre NLI/STS en turco y funciona en CPU.
- Deduplicación de reseñas o tickets de soporte: se agrupan textos con similitud coseno alta para colapsar duplicados; el coste por frase es bajo (~110 M parámetros) y permite procesar lotes grandes.
- Clustering de noticias o publicaciones: se generan embeddings y se aplica k-means o HDBSCAN para agrupar temáticamente contenido en turco, aprovechando el espacio denso de 768 dimensiones.
- Re-ranking en motores de búsqueda híbridos: se combina una primera fase léxica (BM25) con una segunda fase de similitud semántica usando este modelo, mejorando la relevancia en consultas con paráfrasis.
- Moderación y triaje de contenido: se compara el texto entrante con prototipos de categorías (spam, queja, consulta) y se asigna la clase más cercana por similitud.
- Sistemas de preguntas frecuentes (FAQ): se empareja la consulta del usuario con la pregunta canónica más similar del corpus, devolviendo la respuesta asociada; el modelo es ligero y desplegable con TEI o `sentence-transformers`.
- Análisis de similitud entre pares de frases para evaluación de traducción o paráfrasis, usando las métricas de correlación reportadas en la model card.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card sobre STS-b traducido al turco (correlaciones de Pearson y Spearman):

| Split | Epoca | cosine_pearson | cosine_spearman | euclidean_pearson | euclidean_spearman | manhattan_pearson | manhattan_spearman | dot_pearson | dot_spearman |
|---|---|---|---|---|---|---|---|---|---|
| test | - | 0.834 | 0.830 | 0.820 | 0.819 | 0.819 | 0.818 | 0.799 | 0.789 |
| validation | 1 | 0.850 | 0.848 | 0.831 | 0.835 | 0.830 | 0.830 | 0.800 | 0.806 |
| validation | 2 | 0.857 | 0.857 | 0.844 | 0.848 | 0.844 | 0.848 | 0.813 | 0.810 |
| validation | 3 | 0.860 | 0.859 | 0.846 | 0.851 | 0.846 | 0.850 | 0.825 | 0.822 |
| validation | 4 | 0.859 | 0.860 | 0.846 | 0.851 | 0.846 | 0.851 | 0.825 | 0.823 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible, ya que el modelo no es generativo y esas evaluaciones no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 (110,6 M parámetros), ~0,25 GB en fp16 y ~0,12 GB en int8.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo y en CPU: es viable en portátiles sin GPU dedicada para lotes moderados.
- Opciones de despliegue: `sentence-transformers`, `transformers`, Text Embeddings Inference (TEI), OpenVINO (el repo incluye pesos en ese formato) y servidores compatibles con endpoints de embeddings.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamaño, se espera procesamiento por lotes en CPU a decenas de frases por segundo y en GPU a cientos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| veripazari/bert-base-turkish-cased-mean-nli-stsb-tr | 110,6 M | no disponible (BERT base: 512) | tr | Apache 2.0 | Encoder de similitud en turco, entrenado sobre NLI/STS traducidos |
| emrecan/bert-base-turkish-cased-mean-nli-stsb-tr | no disponible | no disponible | tr | no disponible en la informacion proporcionada | Modelo original del que deriva este espejo |
| dbmdz/bert-base-turkish-cased | no disponible | no disponible | tr | no disponible en la informacion proporcionada | BERT base en turco sin ajuste específico de similitud de frases |
| paraphrase-multilingual-MiniLM-L12-v2 | no disponible | no disponible | multilingüe | no disponible en la informacion proporcionada | Alternativa multilingüe; no específica de turco |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre traducciones automáticas de NLI y STS-b: la calidad semántica en turco puede degradarse en dominios alejados del texto traducido.
- Sesgos no documentados: no se han publicado análisis de sesgo de género, político o cultural para este modelo.
- Riesgo de similitud espuria: al ser un encoder de similitud, frases con solapamiento léxico pueden recibir puntuaciones altas aunque su significado difiera.
- Limitación de contexto: BERT base estándar admite 512 tokens; textos más largos requieren truncado o segmentación, lo que puede perder información.
- Solo turco: no es adecuado para consultas multilingües ni para mezclar idiomas en el mismo índice.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datasets traducidos (`nli_tr`, `emrecan/stsb-mt-turkish`) por posibles restricciones heredadas.
- Modelo espejo con 0 descargas y 0 likes: no hay validación comunitaria ni mantenimiento activo documentado; el autor original es `emrecan`.
- No apto para generación de texto, razonamiento, tool calling ni agentes: es exclusivamente un extractor de embeddings.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/veripazari/bert-base-turkish-cased-mean-nli-stsb-tr
- Modelo original: https://huggingface.co/emrecan/bert-base-turkish-cased-mean-nli-stsb-tr
- Plataforma que archiva el modelo: https://veripazari.com.tr
- Documentación de Sentence-Transformers: https://www.SBERT.net
- Repositorio de Sentence-Transformers: https://github.com/UKPLab/sentence-transformers
- Script de entrenamiento NLI: https://github.com/UKPLab/sentence-transformers/blob/master/examples/training/nli/training_nli_v2.py
- Script de entrenamiento STS: https://github.com/UKPLab/sentence-transformers/blob/master/examples/training/sts/training_stsbenchmark_continue_training.py
- Dataset NLI en turco: https://huggingface.co/datasets/nli_tr
- Dataset STS-b traducido al turco: https://huggingface.co/datasets/emrecan/stsb-mt-turkish
- Ejemplos de entrenamiento: https://github.com/UKPLab/sentence-transformers/tree/master/examples/training
