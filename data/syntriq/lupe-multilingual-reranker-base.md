# syntriq/lupe-multilingual-reranker-base

## Resumen

Lupe Multilingual Reranker Base es un cross-encoder multilingue de 308 millones de parametros disenado especificamente para la segunda fase de recuperacion (reranking) en sistemas de busqueda y pipelines de RAG. Lo desarrolla syntriq y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones adicionales. Su funcion es reordenar por relevancia un conjunto de 50 a 200 candidatos previamente recuperados mediante un modelo de embeddings o BM25, mejorando la precision del resultado final sin necesidad de reindexar el corpus.

El modelo se construye sobre Horizon-Labs/multilingual-reranker-base y emplea una arquitectura ModernBERT adaptada a cross-encoder, con 307.531.009 parametros totales. Cubre 35 idiomas, entre ellos espanol, aleman, ingles, frances, portugues, arabe, chino, japones, hindi y swahili, lo que lo convierte en una opcion practica para sistemas multilingues que necesitan un reranker unico en lugar de varios modelos por idioma.

Su relevancia actual radica en que compite directamente con alternativas establecidas como gte-multilingual-reranker-base (Alibaba) y jina-reranker-v2-base-multilingual, y segun la evaluacion del propio autor lidera su clase de tamano en MIRACL (media de 18 idiomas) y en los conjuntos alemanes GermanQuAD y GermanDPR. Ademas, ofrece exportaciones ONNX en fp32 e int8 para inferencia en CPU, lo que facilita su despliegue en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT |
| Parametros totales | 307.531.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (cuantizacion dinamica, optimizada para AVX-512 VNNI) |
| Idiomas soportados | 35: ar, bg, bn, ca, cs, da, de, el, en, es, fa, fi, fr, he, hi, hu, id, it, ja, ko, nl, no, pl, pt, ro, ru, sk, sv, sw, te, th, tr, uk, vi, yo, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par consulta-pasaje y produce una puntuacion de relevancia entre 0 y 1, en lugar de generar embeddings independientes. Esta construido sobre Horizon-Labs/multilingual-reranker-base, que a su vez emplea la arquitectura ModernBERT. Segun la model card, se trata de un modelo destilado a partir de un reranker abierto de mayor tamano ("Destilliert aus einem groesseren offenen Reranker") y entrenado sin datos personales reales.

Los datos de entrenamiento citados incluyen sentence-transformers/miracl, wikimedia/wikipedia, HuggingFaceFW/fineweb-2, HuggingFaceFW/finepdfs, PaDaS-Lab/webfaq-retrieval y cross-encoder/ettin-reranker-v1-data. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que la seleccion de checkpoints se realizo sobre una particion de validacion propia y que la eleccion entre etapas de entrenamiento considero tambien conjuntos publicos, lo que introduce un caveat metodologico reconocido por el propio autor.

## Capacidades

- Reranking de pares consulta-pasaje: puntua la relevancia de cada candidato y permite reordenar listas de resultados de busqueda.
- Multilingue: cubre 35 idiomas, incluidos espanol, aleman, ingles, frances, portugues, italiano, arabe, chino, japones, coreano, hindi, turco y vietnamita.
- Integracion con sentence-transformers mediante la clase CrossEncoder, con metodos como rank().
- Inferencia en CPU mediante exportaciones ONNX en fp32 e int8, con alta concordancia respecto al modelo PyTorch (Spearman 1.0000 en fp32 y 0.9968 en int8).
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face, segun los tags del repositorio.
- No genera texto, no produce embeddings y no soporta tool calling ni razonamiento multi-paso: su unica funcion es la puntuacion de relevancia.

## Casos de uso

- Segunda fase de un pipeline RAG: recuperar entre 50 y 200 candidatos con un modelo de embeddings o BM25 y reordenarlos con este cross-encoder para mejorar la precision del contexto entregado al LLM generador.
- Busqueda empresarial multilingue: un unico reranker para corpus que mezclan documentos en espanol, ingles, aleman y frances, evitando mantener modelos separados por idioma.
- Atencion al cliente sobre base de conocimiento: reordenar articulos de ayuda recuperados por similitud vectorial antes de mostrarlos o pasarlos a un agente generativo.
- Busqueda en documentacion tecnica y legal: reranking de fragmentos largos donde la similitud coseno del embedding no distingue matices semanticos finos.
- Sistemas de preguntas y respuestas sobre FAQs: el modelo fue entrenado con el dataset webfaq-retrieval, lo que lo hace adecuado para dominios de preguntas frecuentes.
- Despliegue en entornos sin GPU: la exportacion ONNX int8 permite ejecutar el reranker en CPU con un rendimiento de 7,7 pares por segundo en un Apple M5 (batch 32, 512 tokens por par), suficiente para cargas moderadas.
- Filtrado de candidatos en motores de busqueda internos: combinar BM25 como primera fase y este modelo como segunda para mejorar el orden final sin reindexar el corpus.

## Benchmarks y rendimiento

Resultados de nDCG@10 publicados por el autor. Cada modelo se evaluo con el mismo harness, hasta 200 consultas por conjunto. MIRACL media sobre 18 idiomas; GermanQuAD y GermanDPR reordenan los 100 mejores pasajes de intfloat/multilingual-e5-base; NanoBEIR es el conjunto ingles de 13 tareas con 100 candidatos BM25.

| Modelo | MIRACL media (18 idiomas) | MIRACL-de | MIRACL-en | NanoBEIR | GermanQuAD | GermanDPR | Parametros |
|---|---|---|---|---|---|---|---|
| syntriq/lupe-multilingual-reranker-base | 0.807 | 0.780 | 0.740 | 0.721 | 0.996 | 0.873 | 308M |
| Alibaba-NLP/gte-multilingual-reranker-base | 0.786 | 0.728 | 0.725 | 0.731 | 0.983 | 0.852 | 306M |
| jinaai/jina-reranker-v2-base-multilingual | 0.792 | 0.745 | 0.730 | 0.707 | 0.973 | 0.858 | 278M |
| Horizon-Labs/multilingual-reranker-base | 0.788 | 0.757 | 0.738 | 0.691 | 0.989 | 0.857 | 308M |
| mixedbread-ai/mxbai-rerank-base-v2 | no medido | 0.482 | 0.726 | 0.719 | 0.961 | 0.802 | 494M |

Conjuntos completos de MIRACL dev (todas las consultas):

| Modelo | MIRACL-de (221 consultas) | MIRACL-en (705 consultas) |
|---|---|---|
| syntriq/lupe-multilingual-reranker-base | 0.785 | 0.752 |
| Horizon-Labs/multilingual-reranker-base | 0.764 | 0.738 |

En los conjuntos alemanes completos, el modelo obtiene 0.992 en GermanQuAD (2.204 consultas) y 0.885 en GermanDPR (1.025 consultas). Concordancia de las exportaciones ONNX con PyTorch en CPU:

| Formato | Diferencia maxima absoluta de puntuacion | Spearman | Concordancia top-1 |
|---|---|---|---|
| ONNX fp32 | 7,2e-07 | 1.0000 | 100% |
| ONNX int8 | 0,059 | 0.9968 | 95% |

Rendimiento en CPU Apple M5 (batch 32, 512 tokens por par): PyTorch fp32 9,5 pares/s, ONNX fp32 6,6 pares/s, ONNX int8 7,7 pares/s. El autor senala que en esa CPU ARM ONNX no es mas rapido que PyTorch y que no midio el rendimiento int8 en CPUs x86 con AVX-512 VNNI.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (308M parametros), mas memoria para activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16: alrededor de 0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequenos; A100, H100 o RTX 4090 para throughput alto con lotes grandes.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Despliegue: sentence-transformers (PyTorch), ONNX Runtime con CPUExecutionProvider, Text Embeddings Inference (TEI) y endpoints de Hugging Face.
- Latencia y throughput: en CPU Apple M5, 9,5 pares/s con PyTorch fp32 y 7,7 pares/s con ONNX int8 (batch 32, 512 tokens por par). No se han publicado mediciones en GPU en la informacion disponible.
- Nota: en macOS, el autor recomienda forzar CPUExecutionProvider porque el proveedor CoreML que ONNX Runtime selecciona por defecto fallo con este modelo en su prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MIRACL media | NanoBEIR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| syntriq/lupe-multilingual-reranker-base | 308M | no disponible | 0.807 | 0.721 | Apache 2.0 | Hugging Face, ONNX |
| Alibaba-NLP/gte-multilingual-reranker-base | 306M | no disponible | 0.786 | 0.731 | no disponible en la informacion | Hugging Face |
| jinaai/jina-reranker-v2-base-multilingual | 278M | no disponible | 0.792 | 0.707 | CC BY-NC 4.0 (no comercial) | Hugging Face |
| Horizon-Labs/multilingual-reranker-base | 308M | no disponible | 0.788 | 0.691 | no disponible en la informacion | Hugging Face |

Lupe lidera la media de MIRACL y los conjuntos alemanes, mientras que gte-multilingual-reranker-base obtiene mejor resultado en NanoBEIR (0.731 frente a 0.721). La ventaja de licencia de Lupe frente a jina-reranker-v2 (Apache 2.0 frente a CC BY-NC 4.0) es relevante para uso comercial.

## Limitaciones y advertencias

- Solo reranking: no genera embeddings ni texto; requiere una primera fase de recuperacion (embedding o BM25) que produzca entre 50 y 200 candidatos.
- Diferencias de pocas milesimas en los benchmarks no son estadisticamente significativas: el autor reconoce 200 consultas por conjunto y ausencia de test de significancia.
- La seleccion de checkpoints y de etapas de entrenamiento se realizo sobre particiones de validacion propias y considero conjuntos publicos, lo que puede introducir un sesgo optimista en los resultados reportados.
- Los datos de entrenamiento en ingles incluyen particiones de entrenamiento de datasets cuyos test forman parte de NanoBEIR (NQ, HotpotQA, FEVER, FiQA), lo que puede inflar la puntuacion en ese benchmark.
- El modelo se entreno sin datos personales reales segun el autor, pero no se detallan los sesgos conocidos ni la composicion exacta del corpus.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto), pero si puede asignar puntuaciones altas a pasajes irrelevantes en dominios alejados de los datos de entrenamiento.
- No se especifica la longitud maxima de contexto soportada, lo que limita la planificacion de pasajes largos.
- La cuantizacion int8 esta optimizada para CPUs x86 con AVX-512 VNNI; el rendimiento en otras arquitecturas no se ha medido.
- En macOS, el proveedor CoreML de ONNX Runtime fallo con este modelo en las pruebas del autor; debe forzarse CPUExecutionProvider.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/lupe-multilingual-reranker-base
- Modelo base: https://huggingface.co/Horizon-Labs/multilingual-reranker-base
- Dataset MIRACL: https://huggingface.co/datasets/sentence-transformers/miracl
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset WebFAQ Retrieval: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Dataset Ettin Reranker v1: https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
- Alternativa gte-multilingual-reranker-base: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
- Alternativa jina-reranker-v2-base-multilingual: https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual
- Alternativa mxbai-rerank-base-v2: https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v2
