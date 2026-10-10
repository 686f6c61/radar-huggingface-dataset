# YCF-AI/bge-reranker-v2-m3-fp16emb

## Resumen

bge-reranker-v2-m3-fp16emb es un cross-encoder multilingüe de reranking publicado por YCF-AI como derivado cuantizado de BAAI/bge-reranker-v2-m3. No es un modelo generativo: recibe un par (consulta, documento) y devuelve un único logit de relevancia, que se normaliza con sigmoid a un valor en [0, 1]. Su función es la segunda etapa de un pipeline de recuperación: reordenar los candidatos que devuelve un retriever denso o híbrido antes de pasarlos a un LLM dentro de un sistema RAG.

La arquitectura es XLM-RoBERTa-large con 24 capas, dimensión oculta 1024 y una cabeza de clasificación de un solo logit, con 567.755.777 parámetros totales. La modificación respecto al checkpoint original es deliberadamente mínima: las tres tablas de embedding (palabra, posición y tipo de token, 264.393.728 parámetros) se almacenan en FP16, mientras que los otros 390 tensores permanecen en FP32.

El resultado es un checkpoint de 1.742.284.059 bytes frente a los 2.271.071.852 del original (2,27 GB a 1,74 GB) sin pérdida medible de puntuaciones: todas las tablas de embedding son exactamente representables en FP16, `transformers` lo carga como FP32 y reproduce los scores originales con un error máximo de 6e-7 sobre 160 pares. Está ajustado para oMLX sobre Apple Silicon (etiquetas m1, apple-silicon, mlx, omlx) y mantiene licencia Apache-2.0. Es relevante ahora porque reduce el coste de memoria de la fase de reranking en máquinas con un LLM grande residente, un escenario habitual en despliegues locales de RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large cross-encoder, 24 capas, hidden 1024, cabeza de un logit; score = sigmoid(logit) en [0, 1] |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo; oMLX 0.7.0 trunca cada par (consulta, documento) a 512 tokens |
| Tipos de cuantizacion | Mixta: 3 tablas de embedding (264.393.728 parametros) en FP16 y otros 390 tensores en FP32. El checkpoint upstream es FP32. Las variantes 8-bit y 4-bit no cargan en oMLX 0.7.0 |
| Idiomas soportados | Multilingue, en, zh (segun metadatos del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (1.742.284.059 bytes); tamano de repositorio 1,8 GB |
| Modelo base | BAAI/bge-reranker-v2-m3 (revision 953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e, 2024-06-24) |
| Relacion con el base | Quantized |
| Libreria | transformers |
| Pipeline | text-classification |
| Etiquetas de despliegue | text-embeddings-inference, endpoints_compatible |
| Descargas / likes | 13 / 0 |
| Fecha de creacion / actualizacion | 2026-10-10 / 2026-10-10 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa-large: 24 capas, dimensión oculta 1024, atención bidireccional sobre la concatenación de consulta y documento, y una cabeza que emite un logit único de relevancia. A diferencia de un bi-encoder, no produce embeddings reutilizables: hay que ejecutar el forward completo por cada par, lo que lo hace más preciso pero más costoso, y por eso se usa como segunda etapa sobre un conjunto reducido de candidatos.

No hay reentrenamiento ni ajuste fino. La receta documentada es `recipe/make_fp16_embeddings.py`, que convierte únicamente las tres tablas de embedding a FP16 tras verificar elemento a elemento que los 567.755.777 parámetros son exactamente representables en esa precisión. El `config.json` es el archivo upstream sin modificar y sigue declarando `torch_dtype: float32`; la mezcla de precisión vive solo en los dtypes de los tensores. La fidelidad se comprobó en dos entornos: en `transformers` sobre CPU la diferencia máxima de probabilidad es 6e-7 sobre 160 pares; en oMLX/MLX es 2.3e-4 sobre 1874 pares frente a PyTorch FP32, con top-1 idéntico en el 100 % de los casos y sin inversiones de orden en los umbrales 0,05 / 0,2 / 0,5.

La decisión de no convertir también las capas lineales está documentada y medida: el build all-FP16 (1,14 GB) es un 9,9 % más lento en oMLX 0.7.0 cuando hay un modelo grande residente, porque el motor construye la máscara de atención en FP32 y las matrices en FP16 se convierten hacia arriba en cada petición, además de que el pool de buffers de MLX se limpia tras cada request. Las tablas de embedding solo se consultan por filas, por lo que mantenerlas en FP16 no tiene coste. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en el modelo upstream.

## Capacidades

- Puntuación de relevancia consulta-documento: devuelve un logit por par, convertido a probabilidad con sigmoid.
- Reranking multilingüe: evaluación medida con consultas zh→zh, en→en y zh↔en sobre documentos técnicos en chino e inglés.
- Mejora del ranking de una primera etapa: sobre el conjunto de evaluación, ΔMRR@10 de +0,100 respecto a la fusión RRF de dos retrievers (IC 95 % [+0,009, +0,194], 18 victorias y 12 derrotas), con mayor ganancia en consultas cruzadas de idioma (MRR 0,496 → 0,675).
- Procesamiento por lotes de candidatos: la latencia y la memoria se han medido con lotes de 3, 24, 64 y 128 pares.
- Integración en pipelines RAG: pensado como etapa intermedia entre el retriever y el LLM generador.
- Compatibilidad de carga: `transformers` en CPU/GPU, oMLX/MLX en Apple Silicon, y etiquetas de `text-embeddings-inference` y endpoints compatibles.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene capacidades de visión, audio ni modo de pensamiento. Es exclusivamente un clasificador de pares.

## Casos de uso

- Reranking en pipelines RAG: recuperar 40-50 candidatos con un retriever denso o híbrido y reordenarlos con el cross-encoder antes de construir el prompt. Los datos medidos muestran una mejora de MRR@10 de 0,589 a 0,689 sobre la fusión de dos retrievers, lo que reduce el número de fragmentos irrelevantes que consume el LLM.
- Búsqueda documental técnica multilingüe: el modelo está evaluado sobre chunks de documentación técnica con consultas en chino, inglés y cruzadas, un escenario típico de documentación de producto o base de conocimiento interna en empresas con contenido en varios idiomas.
- Atención al cliente sobre base de conocimiento: reordenar artículos candidatos para que el agente o el chatbot reciba la respuesta correcta en primera posición, donde R@1 pasa de 0,438 (solo primera etapa densa) a 0,542 con reranking.
- Despliegue local en Apple Silicon junto a un LLM residente: es el escenario para el que está optimizado. Con un LLM de 28,5 GB cargado, 24 documentos se resuelven en unos 454 ms p50 y el proceso ocupa 2,82 GB tras carga y tráfico, frente a 3,30 GB del checkpoint FP32.
- Servicio de reranking por HTTP: el modelo se sirve a través de `/v1/rerank` de oMLX; 3 documentos cortos se resuelven en 21 ms, adecuado para reordenar en línea dentro de una interfaz de búsqueda.
- Filtrado y deduplicación por umbral: al ser un score calibrado en [0, 1] y estable en los umbrales 0,05 / 0,2 / 0,5 (sin inversiones de orden respecto a FP32), sirve para descartar pares por debajo de un corte fijo antes de etapas más caras.
- Evaluación comparativa de retrievers: al reproducir exactamente las puntuaciones del checkpoint oficial, puede usarse como referencia fija para medir el efecto de cambios en la primera etapa de recuperación sin introducir ruido numérico propio.
- Prototipado en portátiles Apple Silicon: la huella de 2,82 GB y la carga en `transformers` como FP32 permiten trabajar en un M1 con memoria unificada modesta sin renunciar a las puntuaciones del modelo original.

## Benchmarks y rendimiento

Calidad de ranking sobre 48 consultas (zh→zh, en→en, zh↔en), 315 chunks de documentos técnicos, unos 40 candidatos por consulta (chunk correcto + 30 no correctos más difíciles de una primera etapa con dos retrievers + 8 aleatorios), 1874 pares en total:

| Ranking | R@1 | R@3 | MRR@10 | nDCG@10 |
|---|---:|---:|---:|---:|
| Primera etapa, BGE-M3 denso | 0,438 | 0,750 | 0,591 | 0,657 |
| Primera etapa, dos retrievers fusionados (RRF) | 0,375 | 0,792 | 0,589 | 0,672 |
| Reranker de referencia PyTorch FP32 | 0,542 | 0,812 | 0,689 | 0,763 |
| Este repositorio en oMLX (identico a FP32 y all-FP16 en oMLX) | 0,542 | 0,812 | 0,689 | 0,763 |

Comparativa de builds, medida en Mac Studio M1 Ultra (GPU de 64 núcleos), 64 GB, macOS 15.8, oMLX 0.7.0 (MLX 0.32.2), con un LLM grande residente:

| Build | Fichero | p50 con 24 documentos y LLM residente | Huella tras carga y trafico | Veredicto |
|---|---:|---:|---:|---|
| FP32 (upstream) | 2,27 GB | 446,5 ms (runs 443 / 446 / 447 / 454) | 3,30 GB | linea base |
| Tablas de embedding en FP16 (este repositorio) | 1,74 GB | 453,5 ms (+1,6 %) | 2,82 GB | sin perdida, sin up-cast por peticion |
| All-FP16 | 1,14 GB | 490,5 ms (+9,9 %) | 2,08 GB | no adoptado en 0.7.0 |
| 8-bit / 4-bit | no disponible | no disponible | no disponible | no cargan en 0.7.0 (loader estricto: "Received 290 parameters not in model") |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo de reranking y no de un modelo generativo.

## Requisitos de hardware

- Pesos en disco: 1,74 GB (1.742.284.059 bytes), frente a 2,27 GB del checkpoint FP32.
- Huella del proceso medida en oMLX 0.7.0 tras la carga y tráfico: 2,82 GB (FP32: 3,30 GB).
- Memoria de activaciones adicional por petición, en el peor caso con todos los pares a 512 tokens: +1,8 GB con 24 documentos, +3,1 GB con 64 documentos y +5,9 GB con 128 documentos. oMLX 0.7.0 no impone tope al tamaño de la petición.
- Hardware medido: Mac Studio M1 Ultra con GPU de 64 núcleos y 64 GB de memoria unificada, macOS 15.8. No hay mediciones publicadas sobre CUDA en la información disponible.
- Encaja en equipos de consumo: al tratarse de un encoder de 568M parámetros, cabe en Apple Silicon de gama consumer (M1 y posteriores) con memoria unificada suficiente para los pesos, las activaciones y cualquier LLM que se mantenga residente. En GPUs de consumo, el peso de los parámetros en FP32 ronda los 2,3 GB, por lo que debería caber en tarjetas con 4 GB o más de VRAM, sin contar activaciones ni el overhead del runtime; esta cifra es una estimación derivada del tamaño de los pesos, no una medición publicada.
- Opciones de despliegue documentadas: `transformers` (carga como FP32 y reproduce las puntuaciones originales), oMLX 0.7.0 en Apple Silicon con el endpoint `/v1/rerank`, y las etiquetas del repositorio indican compatibilidad con `text-embeddings-inference` y con endpoints de HuggingFace.
- No hay datos disponibles sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia medida en HTTP sobre oMLX 0.7.0: 24 documentos en 412 ms p50 (430 ms p95) en solitario y unos 454 ms con un LLM de 28,5 GB residente; 3 documentos cortos en 21 ms; primera petición en frío, 1,9 s.
- No se dispone de cifras de throughput (documentos por segundo) ni de latencias con GPU dedicada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otras familias de rerankers (por ejemplo, variantes multimodales o basadas en LLM decoder) que permitan una comparacion externa. La comparacion posible es interna, contra el checkpoint del que deriva y contra sus propias variantes de precision:

| Modelo / build | Parametros | Precision de pesos | Tamano en disco | Contexto | MRR@10 | Latencia p50 (24 docs, LLM residente) | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| YCF-AI/bge-reranker-v2-m3-fp16emb | 567.755.777 | Embeddings FP16 + resto FP32 | 1,74 GB | 8192 en el modelo / 512 por par en oMLX 0.7.0 | 0,689 | 453,5 ms | Apache-2.0 |
| BAAI/bge-reranker-v2-m3 (upstream) | 567.755.777 | FP32 | 2,27 GB | 8192 en el modelo / 512 por par en oMLX 0.7.0 | 0,689 | 446,5 ms | Apache-2.0 |
| Build all-FP16 (no adoptado) | 567.755.777 | FP16 completo | 1,14 GB | No disponible | 0,689 en oMLX | 490,5 ms (+9,9 %) | Apache-2.0 |
| Build 8-bit / 4-bit | No disponible | 8/4 bits | No disponible | No disponible | No disponible | No carga en oMLX 0.7.0 | No disponible |

Como referencia de etapa previa, el retriever BGE-M3 denso obtiene MRR@10 0,591 y la fusión RRF de dos retrievers 0,589 sobre el mismo conjunto, frente al 0,689 del reranker.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no hace tool calling, no ejecuta agentes ni razonamiento multi-paso. Cualquier expectativa de ese tipo es un error de uso.
- Truncamiento silencioso en oMLX 0.7.0: aunque el modelo admite 8192 tokens, el endpoint `/v1/rerank` de esa versión trunca cada par (consulta, documento) a 512 tokens (issue upstream #4161). Para documentos largos hay que trocearlos en el cliente. El reenvío de `max_length` llega a partir de v0.7.1.dev1.
- Las variantes cuantizadas a 8 y 4 bits no cargan en oMLX 0.7.0 por un loader estricto ("Received 290 parameters not in model"), lo que limita las opciones de reducción de memoria en esa versión.
- El build all-FP16, más pequeño, penaliza la latencia un 9,9 % con un modelo grande residente en oMLX 0.7.0, por el up-cast de las matrices lineales y la gestión del pool de buffers de MLX.
- Consumo de memoria variable y sin tope en oMLX 0.7.0: una petición de 128 documentos puede añadir 5,9 GB de activaciones en el peor caso, además de los 2,82 GB de huella base. Conviene limitar el número de candidatos por petición.
- Diferencia numérica frente a PyTorch FP32: hasta 2,3e-4 de delta máximo en probabilidad sobre 1874 pares, por la suma en FP16 de las filas de embedding dentro de MLX. No se observaron inversiones de orden por encima de 0,01 ni cambios en los umbrales 0,05 / 0,2 / 0,5, pero aplicaciones que ordenen por scores casi idénticos podrían notar diferencias en el cuarto decimal.
- Arranque en frío de 1,9 s en la primera petición, relevante si el servicio se escala a cero.
- Cobertura de idiomas declarada como multilingüe, en y zh. La evaluación publicada se limita a chino e inglés, incluido el caso cruzado; no hay mediciones para otras lenguas.
- Licencia Apache-2.0 heredada del modelo upstream, sin restricciones adicionales conocidas para uso comercial, pero conviene verificar la licencia del checkpoint base en su propio repositorio.
- Todas las cifras de rendimiento proceden de una sola máquina (Mac Studio M1 Ultra, macOS 15.8, oMLX 0.7.0) y de una única ejecución por configuración; no hay validación independiente ni resultados en CUDA.
- La model card proporcionada está truncada: las secciones de guía de uso (documentos largos, tamaño de petición, número de candidatos, umbrales) y el script de cliente no están completos en la información disponible, por lo que sus recomendaciones concretas no se pueden reproducir aquí.
- Riesgo de sesgo y de alucinación: no aplica generación de texto, pero el score de relevancia puede heredar los sesgos del modelo base, no documentados en esta información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YCF-AI/bge-reranker-v2-m3-fp16emb
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Repositorio de oMLX: https://github.com/jundot/omlx
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2402.03216 y https://arxiv.org/abs/2312.15503
- Issue upstream de oMLX sobre el truncado a 512 tokens: #4161 (referenciado en la model card; no se dispone de URL directa en la información proporcionada)
- PR upstream de oMLX #4168, incluido en v0.7.1.dev1: no se dispone de URL directa en la información proporcionada
