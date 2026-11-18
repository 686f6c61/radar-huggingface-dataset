# vennyvirtuoso/bge-base-scirepeval-biencoder

## Resumen

bge-base-scirepeval-biencoder es un modelo de embeddings de frases (bi-encoder denso) desarrollado por el usuario vennyvirtuoso, obtenido mediante fine-tuning del checkpoint BAAI/bge-base-en-v1.5 sobre el conjunto de datos allenai/scirepeval. Su propósito es la recuperación densa de documentos científicos: convierte consultas y pasajes en vectores normalizados de 768 dimensiones que pueden compararse por similitud coseno para tareas de búsqueda semántica, reranking en pipelines RAG y descubrimiento de literatura técnica.

El modelo parte de la arquitectura BERT-base (109.482.240 parámetros, encoder de 12 capas) y se especializa mediante Multiple Negatives Ranking Loss (MNRL) sobre grafos de citas científicas. Según la model card, el fine-tuning mejora la precisión en triplas de un 93,05 % a un 94,30 % en el split de test, y eleva el Recall@1 de un 64,60 % a un 69,35 %, lo que lo hace útil como segunda etapa de ranking en sistemas de recuperación de documentación científica.

Su relevancia actual radica en que ofrece una alternativa ligera (0,4 GB en el repositorio), con licencia Apache 2.0 y compatible con sentence-transformers, para pipelines de recuperación especializados en dominio científico sin recurrir a APIs de modelos frontera. No obstante, el modelo es de reciente publicación, sin descargas ni likes, y su evaluación se limita a los datos reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (bi-encoder denso) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BAAI/bge-base-en-v1.5 admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (entrenado en mixed precision bfloat16/fp16; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible (el modelo base es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en BERT-base: un encoder transformer de 12 capas que proyecta textos (consultas y pasajes) a un espacio vectorial denso de 768 dimensiones, con embeddings normalizados para comparación por similitud coseno. La arquitectura no incorpora mecanismos de atención lineal ni decodificación especulativa; es un encoder estándar orientado a extracción de características y similitud de frases.

El entrenamiento se realizó mediante fine-tuning del checkpoint BAAI/bge-base-en-v1.5 con Multiple Negatives Ranking Loss (MNRL) sobre el dataset allenai/scirepeval, que contiene grafos de citas científicas con pares positivos (documentos citados) y negativos en batch. La model card indica que la evaluación se hizo sobre splits de test disjuntos por grupo para evitar fuga de datos, y que el entrenamiento usó precisión mixta (bfloat16/fp16). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para textos científicos (título y abstract).
- Similitud semántica entre consultas y pasajes mediante coseno.
- Recuperación densa (dense retrieval) para búsqueda de literatura científica.
- Reranking de candidatos en pipelines RAG de dos etapas.
- Extracción de características (feature-extraction) compatible con transformers y sentence-transformers.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponibles; el modelo base es en inglés.
- Capacidades especiales: especialización en dominio científico (scirepeval), sin modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica de literatura científica: indexar títulos y abstracts como vectores de 768 dimensiones y recuperar los documentos más relevantes para una consulta mediante similitud coseno, aprovechando el fine-tuning sobre grafos de citas de SciRepEval.
- Reranking en pipelines RAG de dos etapas: usar el bi-encoder como segunda etapa para reordenar los candidatos recuperados por un retriever de primera etapa (por ejemplo, BM25), mejorando la precisión gracias al margen positivo-negativo reportado (+0,4045).
- Descubrimiento de artículos relacionados: dado un paper semilla, calcular similitudes contra un corpus indexado para sugerir trabajos afines, útil en revisiones sistemáticas y herramientas de recomendación académica.
- Asistencia a revisores y bibliotecarios: agrupar y deduplicar documentos por similitud semántica, detectando duplicados o trabajos muy próximos en grandes repositorios.
- Construcción de bases vectoriales para documentación técnica interna: generar embeddings de manuales y notas técnicas para un motor de búsqueda semántica local, con despliegue en infraestructura propia por su licencia Apache 2.0.
- Microservicios de baja latencia: la model card reporta un throughput de evaluación de 155,7 muestras/segundo, lo que permite servir el modelo en contenedores ligeros para consultas de similitud en tiempo real.
- Filtrado de candidatos en pipelines de revisión de literatura: pre-seleccionar abstracts relevantes antes de pasarlos a un modelo generativo de mayor coste, reduciendo el número de llamadas a APIs frontera.

## Benchmarks y rendimiento

Datos reportados en la model card del autor (split de test retenido):

| Metrica | Baseline preentrenado | Fine-tuned | Delta |
|---|---|---|---|
| Precision en triplas (zero-shot / test) | 93,05 % | 94,30 % | +1,25 % |
| Margen coseno positivo-negativo | +0,1725 | +0,4045 | +0,2320 (+134,5 %) |
| Recall@1 en batch | 64,60 % | 69,35 % | +4,75 % |
| MRR | 0,7389 | 0,7846 | +0,0457 |
| Throughput de evaluacion | no disponible | 155,7 muestras/s | no disponible |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp16 (109 M de parámetros); en torno a 1 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en tarjetas consumer como RTX 3060, RTX 4060 o superiores; también en A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, transformers, Text Embeddings Inference (TEI), vLLM (según la model card) y pipelines estándar de Hugging Face.
- Latencia y throughput: la model card reporta 155,7 muestras/segundo en evaluación; no se dispone de latencia por consulta ni de cifras de throughput en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bge-base-scirepeval-biencoder | 109,5 M | no disponible (base: 512 tokens) | Apache 2.0 | Fine-tuned en SciRepEval; sin descargas ni validacion externa |
| BAAI/bge-base-en-v1.5 | 109,5 M | 512 tokens | MIT | Modelo base generalista en ingles; referencia del fine-tuning |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | MIT | Version mas ligera del mismo linaje, menor coste computacional |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Apache 2.0 | Alternativa ligera y muy extendida para similitud de frases |

No se dispone de comparaciones de rendimiento con estos modelos en la información proporcionada; la tabla recoge solo datos estructurales y de licencia.

## Limitaciones y advertencias

- Modelo sin descargas ni likes y de publicación muy reciente: no hay validación independiente de los resultados reportados.
- Los benchmarks proceden únicamente de la model card del autor; no se han verificado externamente.
- Especializado en dominio científico en inglés; su rendimiento fuera de ese dominio o en otros idiomas no está documentado.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de sesgo heredado del corpus SciRepEval y del modelo base BAAI/bge-base-en-v1.5, no evaluado en la información disponible.
- La longitud de contexto no se especifica en la model card; se asume la del modelo base (512 tokens), lo que limita el tamaño de los pasajes indexados.
- Riesgo de falsos positivos en similitud semántica fuera de distribución; la model card reporta mejoras de margen, pero no evalúa dominios ajenos a SciRepEval.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset allenai/scirepeval y del modelo base.
- La model card incluye afirmaciones de uso (por ejemplo, escaneo de cumplimiento GDPR/HIPAA) que no están respaldadas por evaluaciones específicas y deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/bge-base-scirepeval-biencoder
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Dataset SciRepEval: https://huggingface.co/datasets/allenai/scirepeval
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
