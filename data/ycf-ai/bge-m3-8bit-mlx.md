# YCF-AI/bge-m3-8bit-MLX

## Resumen

bge-m3-8bit-MLX es una conversión cuantizada a 8 bits del modelo de embeddings multilingües BAAI/bge-m3, publicada por el usuario YCF-AI. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el encoder XLM-RoBERTa-large original (568 millones de parámetros, salida densa de 1024 dimensiones, pooling CLS y normalización L2) convertido al formato de pesos de MLX y cuantizado en 8 bits afines con grupo de tamaño 64. El resultado ocupa 612 MB en disco frente a los 2,27 GB del FP32 original.

La relevancia del artefacto es puramente práctica: está ajustado para ejecutarse con oMLX 0.7.0 sobre Apple Silicon, con una receta de reconstrucción reproducible byte a byte y sin ejecutar código pickle del repositorio original. Según las mediciones del autor en un Mac Studio M1 Ultra de 64 GB, mantiene un coseno de 0,99969 de media frente a una referencia independiente en PyTorch FP32, con una latencia de consulta individual de 11,8 ms en proceso, y además resulta más rápido en consultas sueltas que la versión FP32 (13,1 ms).

El repositorio incluye únicamente la cabeza densa del BGE-M3 original: las cabezas dispersa (pesos léxicos) y ColBERT (multi-vector) no se distribuyen porque el endpoint `/v1/embeddings` de oMLX no las utiliza. La licencia es MIT, heredada del modelo base, y el pipeline declarado es `sentence-similarity`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (transformer encoder denso): 24 capas, hidden 1024, 16 cabezas de atención, vocabulario 250.002, 8194 posiciones |
| Parámetros totales | 567.754.752 (568 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens utilizables según la tabla de posiciones; el autor fija un límite de servicio de 2048 tokens en oMLX |
| Tipos de cuantización | 8 bits afines con group size 64 en la tabla de word embeddings y en todos los pesos Linear de las 24 capas; LayerNorm, biases, embeddings de posición/tipo y pooler permanecen en FP16 |
| Idiomas soportados | Multilingüe (más de 100 idiomas según el modelo base); recuperación cruzada chino-inglés probada por el autor; etiquetas declaradas: multilingual, en, zh |
| Licencia | MIT (heredada de BAAI/bge-m3) |
| Formato de pesos | safetensors en layout MLX (`model.safetensors`, SHA-256 `b30faac883ee1ced82f43a9564216c081985d991f21d3e985eadcb0d6af85fd5`); repositorio de 0,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es BAAI/bge-m3, un encoder XLM-RoBERTa-large de 24 capas con hidden 1024 y 16 cabezas, que produce un vector denso de 1024 dimensiones mediante pooling CLS y normalización L2 (de modo que la similitud coseno equivale al producto escalar). No requiere instrucción ni prefijo en las consultas. Esta publicación concreta no entrena ni afina nada: parte de la revisión `5617a9f61b028005a4858fdac845db406aefb181` de BAAI/bge-m3 (3 de julio de 2024) y aplica dos scripts de conversión y cuantización.

La innovación técnica está en el proceso de conversión. El repositorio original solo distribuye `pytorch_model.bin`; el autor lo convirtió sin torch y sin ejecutar código pickle, mediante un unpickler restringido que solo admite tipos tensor, y después aplicó cuantización afín de 8 bits (grupo 64) al layout de MLX. La reconstrucción con los scripts de `recipe/` reproduce `model.safetensors` byte a byte. El autor documenta también un problema de rendimiento de oMLX 0.7.0: su implementación nativa de XLM-R construye la máscara de atención en FP32, lo que promociona las activaciones FP16 y, combinado con el vaciado del pool de buffers de MLX tras cada petición, hace que FP16 sea 3,3 veces más lento que FP32 o 8 bits en consultas individuales. La corrección (máscara en FP16) corresponde al PR #4168, presente solo en oMLX v0.7.1.dev1.

No se dispone del número de tokens de entrenamiento, la composición del dataset ni el detalle de las etapas de ajuste del modelo base: no disponible en la información proporcionada. Al ser un modelo de embeddings, no hay RLHF ni DPO.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones con pooling CLS y normalización L2, listos para similitud coseno por producto escalar.
- Recuperación de información multilingüe (retrieval) sobre corpus en más de 100 idiomas, con recuperación cruzada chino-inglés verificada por el autor.
- Similitud semántica entre frases y extracción de características (`feature-extraction`) para pipelines de búsqueda semántica.
- Indexación por lotes apta para RAG: 363 textos y 74,7K tokens procesados en 5,7 s por HTTP (≈13K tokens/s) en M1 Ultra.
- Sin necesidad de prefijo ni instrucción en las consultas, a diferencia de otros modelos de embeddings que requieren plantillas del tipo «query: …».
- No incluye la cabeza dispersa (pesos léxicos) ni la cabeza ColBERT multi-vector del BGE-M3 original.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni comportamiento de agente multi-paso: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica multilingüe en documentación técnica: el modelo indexa documentos en inglés y chino en el mismo espacio vectorial de 1024 dimensiones, de modo que una consulta en un idioma recupera fragmentos en el otro sin traducción intermedia.
- Base de datos vectorial para RAG en producción sobre Apple Silicon: con 612 MB de pesos y un pico de 2,51 GB con lote de 32, cabe holgadamente en la memoria unificada de un Mac Studio o un MacBook Pro, y el coseno de 0,99969 frente a FP32 permite sustituir el modelo completo sin reindexar el corpus con umbrales nuevos.
- Deduplicación y agrupamiento de documentos: la similitud coseno directa sobre vectores normalizados permite detectar duplicados casi exactos y agrupar por temas con un umbral fijo, con un coste de 5,7 s por cada 363 textos.
- Enrutamiento de consultas en sistemas de atención al cliente: clasificar la intención comparando el embedding de la consulta con prototipos por departamento, con 11,8 ms de latencia en proceso por consulta, suficiente para hacerlo en línea.
- Filtrado previo de candidatos en pipelines de relectura (reranking en dos etapas): usar este modelo como recuperador barato sobre millones de fragmentos y reservar un cross-encoder más caro para el top-k.
- Moderación y detección de contenido duplicado en foros: comparar mensajes nuevos contra un índice histórico para localizar repeticiones o spam casi idéntico sin depender de coincidencia léxica exacta.
- Evaluación de calidad de traducciones o resúmenes: medir la similitud semántica entre el texto generado y una referencia mediante coseno, útil como métrica automática complementaria a BLEU o ROUGE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, BEIR, HumanEval, GSM8K) en la información disponible. Al tratarse de un modelo de embeddings, los datos aportados por el autor son métricas de fidelidad frente a una referencia PyTorch FP32 y de rendimiento en inferencia, medidas todas en un Mac Studio M1 Ultra (GPU de 64 núcleos) con 64 GB, macOS 15.8, oMLX 0.7.0 (MLX 0.32.2, mlx-embeddings 0.1.0), sobre un corpus de fidelidad de 371 textos (315 fragmentos de documento, 48 consultas y 8 textos largos de 1K a 7K tokens).

| Variante | Pesos | Consulta individual p50 | Lote 32 (tok/s) | Pico con lote 32 (incl. pesos) | Coseno vs FP32 (media / mínimo) | Solapamiento top-10 | MRR@10 |
|---|---:|---:|---:|---:|---|---:|---:|
| FP32 (original) | 2271 MB | 13,1 ms | 16,2K | 4,16 GB | 1 / 1 | 1,000 | 0,582 |
| FP16 | 1136 MB | 43,3 ms | 15,9K | 3,06 GB | 1,00000 / 0,99997 | 1,000 | 0,582 |
| 8 bits gs64 (este repositorio) | 612 MB | 11,8 ms | 14,1K | 2,51 GB | 0,99969 / 0,99924 | 0,988 | 0,589 |
| Embeddings 4 bits + encoder 8 bits | 485 MB | 12,2 ms | 14,1K | 2,38 GB | 0,99908 / 0,99785 | 0,950 | 0,584 |
| 4 bits | 334 MB | No disponible | No disponible | No disponible | 0,95154 / 0,93266 | 0,819 | 0,585 |

Otras mediciones del autor: consulta individual p50 de 11,8 ms en proceso y 20 ms por HTTP; lote de indexación de 363 textos / 74,7K tokens en 5,7 s por HTTP (≈13K tokens/s); arranque en frío de 1,9 a 4,4 s. Con el vaciado de caché tras cada forward pass, FP16 sube a 44,5 ms frente a 13,3 ms de FP32 y 12,4 ms de 8 bits. La variante de 4 bits queda descartada por el autor: su MRR parece aceptable sobre 48 consultas, pero el coseno cae a 0,95 y el solapamiento de vecinos al 81 %.

## Requisitos de hardware

- Pesos en disco: 612 MB. Memoria residente en oMLX: aproximadamente 0,6 GB.
- VRAM/memoria unificada mínima estimada: alrededor de 1 GB para inferencia de una sola consulta corta; 2,51 GB de pico con lote de 32 sobre un corpus de evaluación.
- Picos documentados: +2,0 GB adicionales sobre los pesos durante un lote de indexación; +7,9 GB en el peor caso con 24 textos de 2048 tokens y lote 16; entre 14 y 16 GB para una única entrada de 8192 tokens, por la atención O(L²) ingenua de oMLX 0.7.0.
- GPU compatibles: exclusivamente Apple Silicon (M1, M1 Pro/Max/Ultra, M2, M3, M4 y posteriores) a través de MLX. Los datos medidos corresponden a un M1 Ultra de 64 núcleos de GPU.
- No utilizable en GPU NVIDIA o AMD con este artefacto: los pesos están en layout MLX y no se distribuye versión GGUF ni de transformers.
- Opciones de despliegue: servidor oMLX 0.7.0 o superior (probado con MLX 0.32.2 y mlx-embeddings 0.1.0), que expone `/v1/embeddings`; también carga directa con la librería `mlx` o `mlx-embeddings`. Para llama.cpp, Ollama, vLLM o TGI habría que convertir los pesos a GGUF o a safetensors estándar, algo que el repositorio no ofrece.
- Ajustes de servicio recomendados por el autor: `embedding_batch_size` 16 (frente al 32 por defecto de oMLX), límite de contexto 2048 tokens y TTL de inactividad de 1800 s.
- Latencia y throughput (M1 Ultra): 11,8 ms p50 por consulta individual en proceso, 20 ms por HTTP, 14,1K tokens/s con lote 32. Bajar el lote de 32 a 16 cuesta entre un 3 % y un 4 % de throughput de indexación (5,55 s frente a 5,39 s para 363 textos) pero reduce la espera de una consulta individual que llega durante un lote de 256 ms a un valor no especificado en la información disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar este artefacto con las otras variantes de cuantización del mismo BAAI/bge-m3 y con la referencia FP32. No hay datos de otros modelos de embeddings multilingües (por ejemplo, multilingual-e5-large, gte-multilingual-base o paraphrase-multilingual-mpnet), por lo que esa comparación cruzada queda como no disponible.

| Modelo | Parámetros | Contexto | Tamaño en disco | Licencia | Disponibilidad | Coseno vs FP32 | MRR@10 |
|---|---|---|---:|---|---|---:|---:|
| bge-m3-8bit-MLX (este repo) | 568 M | 8192 (cap de servicio 2048) | 612 MB | MIT | MLX, Apple Silicon | 0,99969 | 0,589 |
| BAAI/bge-m3 FP32 (original) | 568 M | 8192 | 2271 MB | MIT | PyTorch / transformers | 1 | 0,582 |
| BGE-M3 en FP16 | 568 M | 8192 | 1136 MB | MIT | Conversión propia (no distribuida) | 1,00000 | 0,582 |
| BGE-M3 embeddings 4 bits + encoder 8 bits | 568 M | 8192 | 485 MB | MIT | Conversión propia (no distribuida) | 0,99908 | 0,584 |
| BGE-M3 4 bits | 568 M | 8192 | 334 MB | MIT | Conversión propia (no distribuida) | 0,95154 | 0,585 |

Frente al BGE-M3 completo, este repositorio renuncia a las cabezas dispersa y ColBERT, por lo que no puede replicar la recuperación híbrida ni el reranking multi-vector del modelo original.

## Limitaciones y advertencias

- Solo se distribuye la cabeza densa. Las cabezas dispersa (pesos léxicos) y ColBERT (multi-vector) de BGE-M3 no están incluidas y no pueden recuperarse de este repositorio.
- Cuantización con pérdida: el coseno medio frente a FP32 es 0,99969 y el solapamiento del top-10 baja a 0,988. En corpus grandes, una fracción pequeña de vecinos cambiará respecto al modelo original; conviene validar el umbral de similitud sobre datos propios antes de sustituir FP32.
- La variante de 4 bits está explícitamente rechazada por el autor: su coseno cae a 0,95154 y el solapamiento top-10 al 81 %, aunque su MRR sobre 48 consultas no lo delate. No usar 4 bits para indexación en producción.
- No almacenar este modelo en FP16 para oMLX 0.7.0: la máscara de atención en FP32 provoca una penalización de 3,3 veces en latencia de consulta individual (44,5 ms frente a 13,3 ms). La corrección está en el PR #4168, solo presente en oMLX v0.7.1.dev1; la versión estable es todavía 0.7.0.
- Dependencia de plataforma: los pesos están en layout MLX y requieren Apple Silicon. No hay GGUF, ONNX ni safetensors estándar para vLLM, TGI, llama.cpp u Ollama.
- Consumo de memoria desproporcionado con entradas largas: una sola entrada de 8192 tokens consume entre 14 y 16 GB por la atención O(L²) de oMLX 0.7.0. El autor limita el contexto de servicio a 2048 tokens para evitarlo.
- Cobertura lingüística verificada solo parcialmente: el autor probó recuperación cruzada chino-inglés. Los más de 100 idiomas del modelo base no están validados en este artefacto.
- Artefacto con muy poca validación externa: 11 descargas y 0 «me gusta» en el momento de la consulta, un único entorno de medida (M1 Ultra, oMLX 0.7.0) y un corpus de fidelidad de solo 371 textos.
- El modelo base se distribuye como `pytorch_model.bin`; el autor evitó ejecutar el pickle mediante un unpickler restringido, pero conviene mantener esa precaución si se reproducen los scripts de conversión.
- Riesgo de error en recuperación: como todo modelo de embeddings, puede producir vecinos semánticamente plausibles pero incorrectos (falsos positivos) en dominios muy técnicos o con jerga; no genera texto, por lo que no alucina contenido, pero sí puede devolver contexto irrelevante a un sistema RAG.
- Licencia MIT: permite uso comercial, modificación y redistribución con conservación del aviso de copyright y de la licencia. No hay restricciones adicionales conocidas, pero al derivar de BAAI/bge-m3 conviene revisar la licencia del repositorio original.
- Sesgos: no se han publicado evaluaciones de sesgo para este artefacto ni se detallan en la información disponible para el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YCF-AI/bge-m3-8bit-MLX
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Artículo de BGE-M3 (arXiv 2402.03216): https://arxiv.org/abs/2402.03216
- Servidor oMLX: https://github.com/jundot/omlx
- PR #4168 de oMLX (corrección de la máscara de atención en FP16): https://github.com/jundot/omlx/pull/4168
