# Trinityk/modernbert-embed-base_finetune_512

## Resumen

`Trinityk/modernbert-embed-base_finetune_512` es un modelo de embeddings de frases (sentence embeddings) obtenido mediante fine-tuning supervisado de `nomic-ai/modernbert-embed-base`, un encoder basado en la arquitectura ModernBERT. Lo desarrolla el usuario Trinityk y su propósito es la generación de representaciones vectoriales densas para tareas de similitud semántica, búsqueda y recuperación de información. Con 149.014.272 parámetros y un repositorio de 0,6 GB, se sitúa en la gama "base" de modelos de embeddings.

El modelo se ha entrenado con `MultipleNegativesRankingLoss` sobre un conjunto de datos de 2.828 ejemplos en formato de tripletas, lo que lo orienta a tareas de ranking y recuperación (retrieval). Es relevante para desarrolladores que necesitan un encoder compacto y desplegable en infraestructura modesta para construir sistemas RAG, motores de búsqueda semántica o deduplicación de documentos, aprovechando la eficiencia de ModernBERT frente a encoders transformer clásicos.

La licencia CC0-1.0 permite uso comercial sin restricciones, lo que reduce la fricción legal en producción. No obstante, el modelo está declarado únicamente para inglés y su volumen de entrenamiento es reducido, por lo que su rendimiento fuera del dominio de los datos de ajuste debe validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con atención eficiente), fine-tuning de `nomic-ai/modernbert-embed-base` |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del modelo sugiere 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `nomic-ai/modernbert-embed-base`, un encoder ModernBERT adaptado a embeddings de frases. ModernBERT es una familia de encoders transformer que incorpora atención con rotación posicional (RoPE), alternancia entre atención global y local, y capas de feed-forward optimizadas, lo que permite procesar secuencias más largas con menor coste computacional que BERT clásico. El fine-tuning se ha realizado con la librería `sentence-transformers` y la función de pérdida `MultipleNegativesRankingLoss`, que entrena el modelo para acercar pares positivos (query-documento) y alejar negativos muestreados en el batch.

El conjunto de entrenamiento consta de 2.828 ejemplos en formato de tripletas, un volumen pequeño que sugiere un ajuste de dominio específico más que un entrenamiento generalista. No se dispone de información sobre la composición del dataset, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a encoders de embeddings). La innovación principal reside en heredar la eficiencia arquitectónica de ModernBERT y adaptarla a similitud semántica mediante entrenamiento contrastivo supervisado.

## Capacidades

- Generación de embeddings de frases para similitud semántica y ranking.
- Recuperación de información (retrieval) query-documento mediante similitud coseno.
- Extracción de características (`feature-extraction`) para pipelines de NLP.
- Búsqueda semántica y clustering de documentos por representación vectorial.
- Deduplicación y detección de near-duplicates mediante distancia entre embeddings.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- Soporte monolingüe: únicamente inglés.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido (es un encoder, no un modelo generativo).

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y recuperar fragmentos relevantes ante consultas en lenguaje natural, usando la similitud coseno entre embeddings de query y documento.
- Construcción de pipelines RAG: generar embeddings de chunks de conocimiento para alimentar un sistema de recuperación aumentada, aprovechando el tamaño compacto del modelo para reducir latencia y coste de indexación.
- Deduplicación de registros en bases de datos: calcular embeddings de entradas textuales y agrupar las que superan un umbral de similitud coseno, útil en limpieza de datasets y CRM.
- Clasificación de tickets de soporte: representar el texto de cada ticket y entrenar un clasificador ligero (regresión logística o k-NN) sobre los embeddings para enrutar incidencias por categoría.
- Motor de recomendación de contenido textual: calcular similitud entre artículos, noticias o publicaciones para sugerir contenido relacionado sin depender de metadatos.
- Detección de plagio o paráfrasis: comparar embeddings de pares de textos para identificar reescrituras con alto solapamiento semántico.
- Filtrado de candidatos en pipelines de anotación: pre-seleccionar pares query-documento prometedores antes de un reranker más costoso, reduciendo el número de inferencias del modelo grande.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | dev | Cosine Accuracy | 0,9959100484848022 |
| Triplet | dev | Cosine Accuracy | 0,9938650131225586 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, BEIR) en la información disponible. Los valores anteriores corresponden al conjunto de desarrollo del propio autor y no son comparables con benchmarks públicos de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB (149 M parámetros × 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes con `text-embeddings-inference`.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TGI para embeddings), `vLLM` (soporte de embeddings según versión), ONNX Runtime y FastAPI con batching propio.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Trinityk/modernbert-embed-base_finetune_512 | 149 M | no disponible (sugerido 512) | CC0-1.0 | en | Fine-tuning sobre 2.828 tripletas, autor individual |
| nomic-ai/modernbert-embed-base | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| BAAI/bge-base-en-v1.5 | 109 M | 512 | MIT | en | Referencia habitual en retrieval inglés, ampliamente evaluado en MTEB |
| sentence-transformers/all-MiniLM-L6-v2 | 22 M | 256 | Apache-2.0 | en | Modelo compacto muy usado en producción por su baja latencia |

La comparación de rendimiento con alternativas no está disponible porque no se han publicado métricas en benchmarks públicos (MTEB/BEIR) para este modelo.

## Limitaciones y advertencias

- Entrenado únicamente con 2.828 ejemplos: el ajuste puede sobreajustarse al dominio de las tripletas y generalizar peor en otros dominios.
- Idioma limitado al inglés; no se garantiza rendimiento en castellano ni en otros idiomas.
- Los benchmarks declarados son de validación interna del autor y no están verificados de forma independiente; no deben usarse como métrica comparativa frente a modelos evaluados en MTEB.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base y del dataset de fine-tuning, no documentado.
- Al ser un encoder de embeddings, no genera texto y no puede usarse para tareas generativas; su uso se restringe a representaciones vectoriales.
- La longitud de contexto no está confirmada en la información disponible; si el nombre del modelo indica 512 tokens, las secuencias más largas requerirán truncado.
- Licencia CC0-1.0: permite uso comercial sin atribución, pero conviene revisar las condiciones del modelo base `nomic-ai/modernbert-embed-base` por si impusieran requisitos adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Trinityk/modernbert-embed-base_finetune_512
- Modelo base: https://huggingface.co/nomic-ai/modernbert-embed-base
- Paper de Sentence-BERT (referencia del enfoque): https://arxiv.org/abs/1908.10084
- Paper de atención (referencia citada en tags): https://arxiv.org/abs/1705.00652
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
