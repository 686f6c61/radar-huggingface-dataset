# SZLHOLDINGS/miniembed-nano-r1-candidate

## Resumen

MiniEmbed-Nano r1 candidate es un modelo de embeddings de frases (sentence-transformers) desarrollado por SZLHOLDINGS como candidato experimental para sustituir un fixture previo basado en tablas hash (MiniEmbed-Nano) en tareas de recuperación de memoria de investigación. Se trata de un fine-tuning del conocido `sentence-transformers/all-MiniLM-L6-v2`, una arquitectura BERT de 6 capas y 22,7 millones de parámetros, entrenado con MultipleNegativesRankingLoss sobre dos corpus internos de SZL.

El modelo se publica con la etiqueta explícita "proposal-only": es un candidato real entrenado por descenso de gradiente, pero no ha sido aceptado ni integrado en ningún flujo de producción. El autor es transparente sobre el alcance de la evaluación: los resultados publicados corresponden únicamente a un slice held-out de los dos corpus de entrenamiento, con etiquetas débiles (título del chunk como query, texto del chunk como positivo), y no constituyen una medida de calidad general de recuperación ni un resultado MTEB.

Su relevancia es limitada y muy específica: demuestra que un embedder neuronal pequeño puede superar a una línea base léxica BM25 en el corpus concreto de SZL, pero no aporta evidencia sobre rendimiento multilingüe, dominios generales ni robustez fuera de distribución. Es, por tanto, un artefacto de investigación reproducible más que un modelo listo para adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), base `all-MiniLM-L6-v2` |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base all-MiniLM-L6-v2 admite 256 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el campo de idiomas del repo esta vacio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2` en el commit `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`, un encoder BERT de 6 capas y 384 dimensiones de embedding, y se fine-tunea como sentence embedder. El entrenamiento se realizó con MultipleNegativesRankingLoss, optimizador con learning rate 2e-05, batch 32, 2 épocas y semilla 20260721, alcanzando una pérdida final de entrenamiento de 0,84741. La ejecución se llevó a cabo el 2026-11-05 mediante `hf jobs uv run` (flavor t4-small recomendado) con el script `szl-estate/jobs/train_miniembed.py`.

Los datos de entrenamiento provienen de dos corpus de SZL: `SZLHOLDINGS/szl-second-brain-inrepo` y `SZLHOLDINGS/rag-corpus-v1`, construyendo pares (título del chunk como query, texto del chunk como positivo) con etiquetas débiles y split sembrado. Se descartaron explícitamente `frontier-candidates` (solo handles) y `a11oy-verifiable-corpus` (logs de recibos). El hash SHA-256 de los pares de entrenamiento (`pairs.train.jsonl`) es `22adee30dadd02111732a89511750219331f60e458dad91852503cceda4a4c0f`. No se documenta el número total de tokens de entrenamiento ni la composición lingüística del dataset.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Búsqueda y recuperación de memoria de investigación sobre corpus internos de SZL (rol `research-memory`).
- Codificación de queries y documentos en un espacio vectorial compartido para ranking por similitud coseno.
- Compatible con `text-embeddings-inference` y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de embeddings, no un modelo generativo.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Recuperación de memoria de investigación en el ecosistema szl-skills: el modelo sustituiría al fixture hash de MiniEmbed-Nano en el rol de retrieval, codificando chunks y queries para ranking por similitud. Adecuado por su tamaño reducido y su entrenamiento específico sobre los corpus de SZL, aunque sujeto a aceptación humana previa.
- Búsqueda semántica sobre documentación interna: indexar chunks de repositorios y recuperar los más relevantes para una consulta en lenguaje natural, aprovechando que fue entrenado con pares título-texto de corpus in-repo.
- Ranking de candidatos en pipelines RAG: como primera etapa de recuperación densa antes de un reranker, con la ventaja de sus 22,7 M de parámetros y su bajo coste de inferencia.
- Deduplicación y clustering de documentos: agrupar chunks con contenido semánticamente próximo mediante similitud de embeddings.
- Evaluación comparativa de recuperación: servir como baseline neuronal frente a BM25 en experimentos controlados sobre los corpus de SZL, dado que el autor publica el protocolo de evaluación y el hash de los pares.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0,1 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de embedding a pequeña escala.
- Prototipado de sistemas de búsqueda en investigación: permite validar rápidamente una arquitectura de retrieval denso antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Evaluación held-out del propio autor sobre un slice de los dos corpus de entrenamiento (276 queries sobre 276 chunks held-out, split por fichero fuente, etiquetas débiles, relevancia binaria). No es MTEB ni evidencia de calidad general.

| Metrica | miniembed-r1 candidate | BM25 lexical baseline |
|---|---|---|
| nDCG@10 | 0,604261 | 0,527441 |
| recall@1 | 0,521739 | 0,460145 |
| recall@5 | 0,637681 | 0,554348 |
| recall@10 | 0,699275 | 0,597826 |

No se han publicado resultados de benchmarks generales (MMLU, MTEB, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,7 M de parámetros; el repo completo ocupa 0,1 GB.
- GPU recomendadas: el autor cita `t4-small` como flavor recomendado para el entrenamiento; para inferencia basta una T4, una RTX 3060 o incluso CPU.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 2060, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp ni Ollama (son runtimes para modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniEmbed-Nano r1 candidate | 22,7 M | no disponible | nDCG@10 0,604 en slice propio | apache-2.0 | Hugging Face (candidato) |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens (modelo base) | no evaluado en este slice | apache-2.0 | Hugging Face (ampliamente usado) |
| BM25 (baseline léxico) | n/a | n/a | nDCG@10 0,527 en el mismo slice | n/a | implementaciones múltiples |
| MiniEmbed-Nano (fixture hash) | n/a | n/a | no es un embedder neuronal | no disponible | Hugging Face |

La comparación con otros embedders neuronales de tamaño similar (por ejemplo, variantes de E5-small o BGE-small) no está disponible en la información proporcionada, ya que no se han publicado evaluaciones cruzadas.

## Limitaciones y advertencias

- Estado "proposal-only": el autor indica explícitamente que no debe conectarse a ningún skill hasta que un humano lo acepte; no sobrescribe el repo fixture MiniEmbed-Nano.
- La evaluación se limita a 276 queries sobre 276 chunks de dos corpus internos con etiquetas débiles; no es evidencia de calidad general de recuperación ni un resultado MTEB.
- Idiomas soportados no declarados; no hay garantía de rendimiento multilingüe.
- Longitud de contexto no declarada por el autor; el modelo base tiene 256 tokens, lo que limita chunks largos.
- Riesgo de sesgo heredado del corpus de SZL y de las etiquetas débiles título-texto, que pueden favorecer chunks con títulos descriptivos.
- Sin datos de energía ni de coste computacional del entrenamiento (marcado como UNAVAILABLE por el autor).
- Sin descargas ni likes en el momento de la ficha (0/0), lo que implica ausencia de validación por parte de la comunidad.
- Licencia apache-2.0 permite uso comercial, pero la falta de evaluación general desaconseja su adopción en producción sin validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/miniembed-nano-r1-candidate
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Fixture previo: https://huggingface.co/SZLHOLDINGS/MiniEmbed-Nano
- Corpus de entrenamiento: https://huggingface.co/SZLHOLDINGS/szl-second-brain-inrepo
- Corpus de entrenamiento: https://huggingface.co/SZLHOLDINGS/rag-corpus-v1
