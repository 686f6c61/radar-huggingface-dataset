# zhiqian99/Qwen3-Reranker-0.6B-GGUF-llama_cpp

## Resumen

Qwen3-Reranker-0.6B-GGUF-llama_cpp es una conversión a formato GGUF del modelo de reranking Qwen3-Reranker-0.6B, desarrollada por la comunidad para su ejecución en llama.cpp y servidores compatibles. El modelo original, publicado por Qwen, está diseñado para tareas de text-ranking, es decir, para puntuar la relevancia de un conjunto de documentos frente a una consulta, un componente crítico en pipelines de recuperación aumentada por generación (RAG) y sistemas de búsqueda semántica.

La relevancia de esta conversión concreta radica en que la mayoría de los GGUFs comunitarios del mismo modelo producen puntuaciones basura (valores del orden de 4.5e-23) porque omiten tensores específicos del reranker, como el clasificador `cls.output.weight` y la metadata `pooling_type = RANK`. Esta versión, convertida con el script oficial `convert_hf_to_gguf.py`, incorpora todos los elementos necesarios y funciona correctamente con llama-server mediante el endpoint `/v1/rerank`.

El modelo tiene aproximadamente 595 millones de parámetros, licencia Apache 2.0 y está pensado para desplegarse en hardware modesto: las cuantizaciones van desde 1.12 GB (F16) hasta 0.28 GB (Q2_K), lo que lo hace viable incluso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3, detalles del modelo original no disponibles) |
| Parametros totales | 595.778.560 (~0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (sugerido en la configuracion de llama-server) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M, Q4_0, Q3_K_M, Q2_K |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Reranker-0.6B, un reranker de la familia Qwen3. Los detalles internos de la arquitectura y el entrenamiento del modelo original no se detallan en la informacion disponible. Como reranker, el modelo recibe un par (consulta, documento) y devuelve una puntuacion de relevancia mediante un clasificador binario (etiquetas "yes"/"no") que se extrae del tensor `lm_head` durante la conversion a GGUF.

La conversion realizada por `convert_hf_to_gguf.py` aplica tres transformaciones criticas: extrae `cls.output.weight` del `lm_head`, establece `pooling_type = RANK` en la metadata y fija las etiquetas de salida del clasificador como `["yes", "no"]`. Sin estos pasos, llama-server no tiene forma de calcular puntuaciones de relevancia, lo que explica que muchos GGUFs alternativos del mismo modelo produzcan resultados inutilizables.

## Capacidades

- Reranking de documentos: dado un query y una lista de documentos, asigna una puntuacion de relevancia a cada uno.
- Integracion con llama.cpp: compatible con `llama-server` y el endpoint `/v1/rerank` de la API.
- Soporte para pipelines RAG: puede combinarse con modelos de embedding y chat en una unica instancia de llama-server mediante routing de modelos.
- Multilingue: no se ha publicado informacion sobre los idiomas soportados.
- Sin capacidades de generacion de texto: es un modelo exclusivamente de clasificacion, no un LLM generativo.
- Sin tool calling ni capacidades de agente: su funcion es exclusivamente puntuar pares query-documento.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo se usa como segunda fase de un pipeline de recuperacion. Tras obtener candidatos mediante un embedding de similitud coseno, el reranker puntua los documentos y selecciona los mas relevantes antes de pasarlos al LLM generador. Su tamano reducido permite ejecutarlo como servicio dedicado junto al modelo de chat.

- Busqueda semantica en documentacion tecnica: en un corpus de manuales o documentacion de APIs, el modelo puede clasificar las paginas mas relevantes para una consulta concreta, mejorando la precision frente a la busqueda puramente vectorial.

- Filtrado de candidatos en sistemas de soporte: dado un ticket de usuario y una base de conocimiento de articulos, el reranker prioriza los articulos que con mayor probabilidad resuelven la consulta, reduciendo el tiempo de resolucion en centros de soporte.

- Moderacion y clasificacion de contenido: aunque no es su uso principal, el clasificador binario puede adaptarse para tareas de clasificacion de pares texto-texto, como deteccion de duplicados o verificacion de consistencia entre documentos.

- Recuperacion de informacion en el ambito juridico: ordenar clausulas o sentencias frente a una consulta legal, aprovechando la ventana de contexto de 32K tokens para procesar documentos extensos.

- Evaluacion de calidad de pares pregunta-respuesta: puntuar la relevancia de respuestas generadas automaticamente frente a preguntas de usuarios, util en sistemas de QA automatizado.

## Benchmarks y rendimiento

La model card incluye resultados de cuantizacion sobre el dataset MTEB AskUbuntuDupQuestions (361 queries) ejecutado con llama-server `/v1/rerank` en una RTX 3090. Todas las cuantizaciones se generaron a partir de la misma fuente F16 con `llama-quantize`.

| Quant | Tamano | NDCG@10 | MAP@10 | MRR@10 | Delta NDCG@10 |
|---|---|---|---|---|---|
| F16 | 1,12 GB | 0,6688 | 0,5143 | 0,7317 | baseline |
| Q8_0 | 0,60 GB | 0,6677 | 0,5143 | 0,7329 | -0,2 % |
| Q6_K | 0,46 GB | 0,6691 | 0,5156 | 0,7353 | +0,0 % |
| Q5_K_M | 0,41 GB | 0,6671 | 0,5138 | 0,7377 | -0,3 % |
| Q5_0 | 0,41 GB | 0,6678 | 0,5118 | 0,7423 | -0,2 % |
| Q4_K_M | 0,37 GB | 0,6669 | 0,5120 | 0,7345 | -0,3 % |
| Q4_0 | 0,36 GB | 0,6556 | 0,5010 | 0,7211 | -2,0 % |
| Q3_K_M | 0,32 GB | 0,6551 | 0,5004 | 0,7354 | -2,1 % |
| Q2_K | 0,28 GB | 0,4770 | 0,3104 | 0,5668 | -28,7 % |

Conclusiones de la card: Q4_K_M (0,37 GB) es el punto optimo, con una reduccion de 3x respecto a F16 y solo un 0,3 % de perdida de calidad. Por debajo de Q4_K_M la calidad se degrada notablemente: Q4_0 y Q3_K_M pierden alrededor del 2 %, y Q2_K es inutilizable (-28,7 %). Los modelos pequenos son mas sensibles a la cuantizacion que los grandes.

No se han publicado benchmarks del modelo original (no cuantizado) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 0,28 GB (Q2_K) hasta 1,12 GB (F16). Con Q4_K_M, el punto optimo, se necesitan aproximadamente 0,4 GB para los pesos, mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente. La card de referencia se genero en una RTX 3090, pero el modelo tambien funciona en CPU sin problemas.
- Cabe en GPUs consumer: si, incluso en modelos integrados con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server` con `--reranking --pooling rank --embedding`), compatible con la API `/v1/rerank`. Puede integrarse en un servidor unico junto a modelos de embedding y chat mediante el archivo `models.ini`.
- Latencia y throughput: no se han publicado datos concretos de latencia. Dado el tamano del modelo (0,6B), la inferencia en GPU es del orden de milisegundos por consulta, y en CPU es viable para cargas moderadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros rerankers (p. ej., bge-reranker-v2-m3 o Cohere Rerank) en la informacion proporcionada. La comparativa mas relevante es con las versiones mayores de la misma familia, disponibles en GGUF:

| Modelo | Parametros | Contexto | Tamano F16 | Notas |
|---|---|---|---|---|
| Qwen3-Reranker-0.6B | 0,6B | 32K | 1,12 GB | Este modelo. Menor calidad, menor coste. |
| Qwen3-Reranker-4B | 4B | no disponible | no disponible | Mayor precision, requiere ~8 GB VRAM. |
| Qwen3-Reranker-8B | 8B | no disponible | no disponible | Mayor calidad, requiere ~16 GB VRAM. |

La eleccion entre tamaños depende del presupuesto de hardware y de la calidad requerida en la tarea de reranking.

## Limitaciones y advertencias

- Sensibilidad a la cuantizacion: las cuantizaciones por debajo de Q4_K_M degradan significativamente la calidad (Q2_K pierde un 28,7 % de NDCG@10). No se recomienda usar Q2_K ni Q4_0 en produccion.
- Dependencia de la conversion: solo los GGUFs generados con el script oficial de llama.cpp o con el fix de la rama de JonathanMiddleton funcionan correctamente. Otros GGUFs de la comunidad pueden producir puntuaciones basura (4.5e-23) sin errores aparentes.
- Uso exclusivo de `/v1/rerank`: el endpoint `/v1/embeddings` devuelve ceros para este modelo, por lo que no es utilizable como generador de embeddings.
- Limitaciones del modelo original: no se dispone de informacion sobre sesgos, idiomas soportados o rendimiento fuera de los benchmarks citados. Como cualquier modelo de clasificacion, puede presentar sesgos en los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero la responsabilidad del despliegue recae en el usuario.
- Contexto: la ventana de 32K tokens es amplia pero no infinita; documentos muy largos deben truncarse o dividirse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhiqian99/Qwen3-Reranker-0.6B-GGUF-llama_cpp
- Modelo original: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Guia de llama-server para Qwen3 (multi-modelo): https://gist.github.com/VooDisss/42bce4eb5c76d3c325633886c5e348ee
- Issue de llama.cpp sobre GGUFs de reranker rotos: https://github.com/ggml-org/llama.cpp/issues/16407
- Version alternativa en QuantFactory: https://huggingface.co/QuantFactory/Qwen3-Reranker-0.6B-GGUF
- Version con fix para llama.cpp (JonathanMiddleton): https://huggingface.co/JonathanMiddleton/Qwen3-Reranker-0.6B
- Version en ModelScope: https://www.modelscope.cn/models/dengcao/Qwen3-Reranker-0.6B-GGUF
