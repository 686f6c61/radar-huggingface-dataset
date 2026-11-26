# speakleash/Bielik-SPLADE-82M-v1.0

## Resumen

Bielik-SPLADE-82M-v1.0 es un modelo de recuperación de información dispersa (sparse retrieval) basado en SPLADE, especializado en lengua polaca y desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH y Gaia AI Factory. Se trata de un fine-tuning de `sdadas/polish-splade`, del que hereda arquitectura y tokenizador, y transforma cada texto en una bolsa ponderada de términos del vocabulario (50.001 dimensiones, mayoritariamente ceros). Esto permite servirlo desde un índice invertido convencional (Anserini/Lucene con impact index, vectores dispersos de Qdrant o Elasticsearch), sin necesidad de infraestructura vectorial densa.

El modelo resuelve el problema de la búsqueda léxica-semántica en polaco: supera a BM25 y a su modelo base en la mayoría de tareas del benchmark PIRB. Con 82 millones de parámetros y una ventana de 512 tokens, está pensado para indexación y consulta de baja latencia, incluyendo un export int8 ONNX que reduce el tiempo de consulta en CPU de 44,9 ms a 3,7 ms en un AMD Ryzen 5 5600X.

Es relevante ahora porque forma parte de la colección Bielik-SPLADE v1.0, que incluye variantes de 50M, un codificador de consultas estático (sin transformer en tiempo de consulta) y exports ONNX int8, lo que permite desplegar recuperación polaca de calidad en hardware modesto y con costes de índice reducidos (378,5 dimensiones activas por documento y 13.945 postings por consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa con cabeza MLM para SPLADE (sparse encoder) |
| Parametros totales | 82.017.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 en PyTorch; export int8 ONNX disponible |
| Idiomas soportados | Polaco (pl) |
| Licencia | gemma |
| Formato de pesos | safetensors (repo de 0,3 GB); ONNX int8 en repositorio aparte |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SPLADE sobre un backbone RoBERTa de 82M de parámetros, idéntico en arquitectura y tokenizador a `sdadas/polish-splade`. La salida es una representación dispersa de 50.001 dimensiones sobre el vocabulario del tokenizador, donde cada término recibe un peso aprendido; la similitud entre consulta y documento se calcula mediante producto escalar sobre los términos activos. No se utiliza prefijo ni instrucción para consultas o documentos: el modelo fue entrenado y evaluado sin prompt.

Los detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF/DPO no están disponibles en la información proporcionada. El modelo se presenta como fine-tuning de `sdadas/polish-splade`, y su evaluación se ha realizado sobre las 32 tareas públicas del benchmark PIRB (de un total de 41; las 9 tareas del grupo Web Datasets no son públicas).

## Capacidades

- Recuperación de información dispersa (sparse retrieval) en polaco: genera representaciones tipo bolsa de términos ponderada sobre un vocabulario de 50.001 dimensiones.
- Codificación separada de consultas y documentos mediante `encode_query` y `encode_document` en `SparseEncoder` de sentence-transformers (requiere versión >= 5.0).
- Inspección de la representación: el método `decode` devuelve los pares (token, peso) más fuertes de una consulta.
- Compatibilidad con índices invertidos estándar: Anserini/Lucene impact index, vectores dispersos de Qdrant, Elasticsearch y otros.
- Extracción de características (pipeline `feature-extraction`).
- Inferencia en CPU sin PyTorch mediante el export int8 ONNX.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento; es un modelo puramente de recuperación.

## Casos de uso

- Motor de búsqueda documental en polaco: indexar corpus administrativos, legales o corporativos con un índice invertido Lucene/Anserini y recuperar pasajes relevantes con producto escalar sobre los términos activos, aprovechando la ventana de 512 tokens por documento.
- Búsqueda semántica en comercio electrónico: indexar descripciones de producto y recuperar candidatos ante consultas de usuarios en polaco, con coste de índice reducido (378,5 dimensiones activas por documento) frente a alternativas densas.
- Recuperación aumentada para generación (RAG): usar el modelo como primer recuperador en un pipeline RAG en polaco, alimentando un LLM generador con los pasajes recuperados; el export int8 ONNX permite ejecutar la fase de recuperación en CPU junto al servicio de generación.
- Atención al cliente y bases de conocimiento: indexar FAQs y artículos de soporte y resolver consultas de usuarios con recuperación léxico-semántica, sirviendo el índice desde Elasticsearch o Qdrant con vectores dispersos.
- Búsqueda jurídica y regulatoria: recuperar fragmentos normativos y jurisprudencia en polaco, donde la coincidencia de términos especializados y la expansión implícita de SPLADE aportan ventaja sobre BM25 (40,32 de nDCG@10 medio frente a 55,01 del modelo).
- Despliegue en hardware modesto: servir consultas en CPU con el export int8 ONNX (3,7 ms por consulta en un Ryzen 5 5600X) para aplicaciones de búsqueda interna sin GPU.
- Evaluación y ajuste de sistemas de recuperación: usar el modelo como referencia o base para fine-tuning adicional en dominios específicos, dado que comparte tokenizador y vocabulario con el resto de la colección Bielik-SPLADE.

## Benchmarks y rendimiento

Resultados sobre las 32 tareas públicas de PIRB (media de nDCG@10). El modelo base y BM25 corresponden a las puntuaciones por tarea del leaderboard oficial de PIRB, promediadas por el autor sobre las mismas 32 tareas.

| Modelo | nDCG@10 medio (32 tareas públicas PIRB) | Dimensiones activas por documento | Postings por consulta |
|---|---:|---:|---:|
| Bielik-SPLADE-82M-v1.0 | 55,01 | 378,5 | 13.945 |
| Bielik-SPLADE-50M-v1.0 | 53,81 | no disponible | 12.725 |
| Bielik-SPLADE-static-v1.0 (consultas sobre índice del 82M) | 52,37 | no disponible | 9.046 |
| sdadas/polish-splade | 51,34 | 424,5 | 16.807 |
| BM25 (pyserini) | 40,32 | no disponible | no disponible |

El modelo supera a `sdadas/polish-splade` en 31 de las 32 tareas; en la restante (poquad) ambos obtienen 19,57. El desglose por tarea no está disponible en la información proporcionada. Los resultados cubren solo la parte pública de PIRB: no son comparables con las medias de 41 tareas del leaderboard oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 82M de parámetros; en fp32 ocupa aproximadamente 0,33 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con más de 1 GB de VRAM. En int8 ONNX el peso se reduce a la mitad aproximadamente.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU moderna (RTX 3060 en adelante, A10, L4, A100, H100) puede servirlo, aunque el modelo está optimizado para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual, incluidas las de gama baja.
- Opciones de despliegue: sentence-transformers >= 5.0 con `SparseEncoder`; export int8 ONNX para inferencia en CPU sin PyTorch; integración con índices invertidos Anserini/Lucene, Qdrant y Elasticsearch para los vectores dispersos. La model card indica compatibilidad con text-embeddings-inference y endpoints.
- Latencia y throughput: en CPU AMD Ryzen 5 5600X, una consulta tarda 44,9 ms (mediana, batch 1, 6 hilos) en PyTorch fp32 y 3,7 ms con el export int8 ONNX. En PyTorch el tiempo apenas varía con el número de hilos (45,4 ms con un solo hilo), porque cerca de la mitad corresponde a la capa de salida MLM (768 × 50.001), que PyTorch no paraleliza en esa CPU; el export ONNX no tiene esa limitación. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 medio (32 tareas PIRB) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Bielik-SPLADE-82M-v1.0 | 82M | 512 tokens | 55,01 | gemma | Hugging Face (safetensors y ONNX int8) |
| Bielik-SPLADE-50M-v1.0 | 50M | no disponible | 53,81 | no disponible | Hugging Face |
| Bielik-SPLADE-static-v1.0 | no disponible (encoder estático de consultas) | no disponible | 52,37 (sobre índice del 82M) | no disponible | Hugging Face |
| sdadas/polish-splade | 82M | no disponible | 51,34 | no disponible | Hugging Face |
| BM25 (pyserini) | no aplica | no aplica | 40,32 | no aplica | pyserini |

La comparativa se limita al ecosistema de recuperación polaca evaluado en PIRB; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta polaco; no está entrenado ni evaluado para otros idiomas.
- Ventana máxima de 512 tokens: los documentos más largos deben fragmentarse antes de la indexación.
- Los resultados publicados cubren únicamente 32 de las 41 tareas de PIRB y no son comparables con las medias oficiales de 41 tareas.
- Riesgo de sesgos y alucinación: no se documentan análisis de sesgo en la información disponible; al ser un modelo de recuperación, puede devolver documentos irrelevantes o favorecer términos sobrerrepresentados en los datos de entrenamiento.
- La licencia es `gemma`, lo que impone las condiciones de la licencia Gemma de Google; conviene revisar sus restricciones antes de un uso comercial. No se detallan en la información proporcionada.
- El rendimiento en CPU con PyTorch está limitado por la capa de salida MLM (768 × 50.001); para producción en CPU se recomienda el export int8 ONNX.
- El modelo no incluye cabecera de generación ni capacidades de razonamiento; su uso está restringido a recuperación y extracción de características.
- No se han publicado detalles sobre datos de entrenamiento, número de tokens ni proceso de alineación, lo que dificulta evaluar riesgos de contaminación o sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0
- Colección Bielik-SPLADE v1.0: https://huggingface.co/collections/speakleash/bielik-splade-v10
- Modelo de 50M: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0
- Codificador de consultas estático: https://huggingface.co/speakleash/Bielik-SPLADE-static-v1.0
- Export int8 ONNX del 82M: https://huggingface.co/speakleash/Bielik-SPLADE-82M-v1.0-ONNX-INT8
- Export int8 ONNX del 50M: https://huggingface.co/speakleash/Bielik-SPLADE-50M-v1.0-ONNX-INT8
- Modelo base: https://huggingface.co/sdadas/polish-splade
- Leaderboard PIRB: https://huggingface.co/spaces/sdadas/pirb
- Paper de referencia (arXiv:2402.13350): https://arxiv.org/abs/2402.13350
