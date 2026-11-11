# Tohirju/Saidzoda-Tajik-BGE-M3

## Resumen

Saidzoda-Tajik-BGE-M3 es un modelo de embeddings de frases especializado en recuperación de información (retrieval) para tayiko, ruso e inglés, desarrollado por el usuario Tohirju. Se trata de un fine-tuning del conocido BAAI/bge-m3, un modelo multilingüe de representación densa que sirve como base para tareas de búsqueda semántica, similitud entre frases y sistemas RAG. El modelo se distribuye bajo una licencia propia denominada `saidzoda-model-licence` y requiere aceptar condiciones de acceso en Hugging Face (modelo gated).

La relevancia de esta ficha radica en que el tayiko es un idioma de bajos recursos con escasa cobertura en modelos de embeddings comerciales, por lo que un ajuste específico sobre una base multilingüe robusta como bge-m3 puede mejorar de forma notable la calidad de recuperación en ese idioma. El modelo tiene 567.754.752 parámetros (aproximadamente 568 millones), un tamaño de repositorio de 2,3 GB y está pensado para su uso con `sentence-transformers` y con Text Embeddings Inference (TEI).

No obstante, conviene señalar desde el principio que la información pública disponible es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, hiperparámetros, benchmarks ni resultados de evaluación. Las descargas y likes son cero en el momento de redactar esta ficha, lo que indica que el modelo es muy reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa (derivado de BAAI/bge-m3) |
| Parametros totales | 567.754.752 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (bge-m3 soporta hasta 8192 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se listan variantes GGUF/ONNX) |
| Idiomas soportados | Tayiko (tg), ruso (ru), inglés (en) |
| Licencia | `saidzoda-model-licence` (licencia propia, acceso restringido) |
| Formato de pesos | safetensors |
| Dimension de embedding | No disponible |
| Libreria | sentence-transformers |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Modelo base | BAAI/bge-m3 |
| Tamano del repositorio | 2,3 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento

El modelo se construye sobre BAAI/bge-m3, cuyo backbone es un transformer encoder de tipo XLM-RoBERTa. BGE-M3 es conocido por producir embeddings densos, dispersos (sparse) y multi-vector en un mismo modelo, aunque no se confirma si este fine-tuning conserva las tres cabeceras o solo la densa. Con 567,7 millones de parámetros, el tamaño es coherente con la variante base de XLM-RoBERTa (~568M), lo que sugiere que no se ha ampliado la arquitectura, sino que se ha ajustado la existente.

No se dispone de información sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset (pares pregunta-respuesta, pares de similitud, corpus paralelos tg-ru-en, etc.), ni si se emplearon técnicas de minería de negativos duros, destilación o aprendizaje contrastivo. Tampoco se documenta si hubo etapas de instruction tuning o evaluación con MTEB. La única señal técnica disponible es la etiqueta `base_model:finetune:BAAI/bge-m3`, que confirma un ajuste fino supervisado sobre la base, pero sin más detalle. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica y similitud textual.
- Recuperación de información (retrieval) multilingüe en tayiko, ruso e inglés.
- Soporte de similitud entre frases (sentence-similarity) mediante `sentence-transformers`.
- Compatible con Text Embeddings Inference (TEI) para despliegue en producción.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Uso como componente de recuperación en pipelines RAG (Retrieval-Augmented Generation).
- Capacidad potencial de búsqueda cross-lingual entre los tres idiomas declarados (no verificada empíricamente).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking), ya que es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en tayiko: indexar documentos en tayiko y recuperar pasajes relevantes ante consultas en el mismo idioma, aprovechando el ajuste específico sobre una base multilingüe para superar la cobertura limitada de los embeddings genéricos en este idioma.
- RAG bilingüe tayiko-ruso: construir un sistema de preguntas y respuestas sobre corpus administrativos o legales donde las consultas llegan en ruso y los documentos fuente están en tayiko (o viceversa), usando el modelo como retriever denso.
- Deduplicación y clustering de textos: agrupar noticias o registros con contenido similar en ruso y tayiko calculando similitud coseno entre embeddings, útil para pipelines de limpieza de datos.
- Motor de búsqueda interno para organizaciones de Asia Central: desplegar el modelo con TEI detrás de una API de búsqueda documental en una intranet, con soporte para consultas en los tres idiomas declarados.
- Moderación y detección de duplicados en foros: comparar mensajes de usuarios contra una base de mensajes previos para detectar spam o contenido repetido en ruso y tayiko.
- Evaluación de similitud semántica en investigación lingüística: medir la cercanía semántica entre pares de frases tg-ru-en en estudios de traducción o análisis contrastivo.
- Filtrado previo en pipelines de traducción automática: seleccionar memorias de traducción relevantes mediante similitud de embeddings antes de pasar el texto a un modelo generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MTEB, MIRACL, retrieval@k ni evaluaciones específicas para tayiko, ruso o inglés en la ficha del modelo ni en la información proporcionada. No deben inferirse cifras a partir del modelo base, ya que el fine-tuning puede alterar el rendimiento de forma sustancial en cualquiera de las dos direcciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (568M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos; en total, 2-3 GB con overhead.
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090). También puede ejecutarse en CPU para cargas moderadas.
- GPU de datacenter: A100, H100, L4 o T4 son válidas; para alto throughput en indexación masiva se recomienda L4 o A10G por relación coste/rendimiento.
- Despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI) para servicio HTTP de alto rendimiento, y potencialmente integración con frameworks RAG como LangChain o LlamaIndex. No se confirma soporte de llama.cpp ni Ollama (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles. Al ser un encoder de ~568M parámetros, se espera un throughput alto en GPU (miles de frases por segundo en batch en una L4), pero no hay mediciones publicadas para este modelo concreto.
- Requisito adicional: al ser un modelo gated, es necesario autenticarse con un token de Hugging Face y aceptar la licencia antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Saidzoda-Tajik-BGE-M3 | 567,7M | No disponible | tg, ru, en | saidzoda-model-licence | Gated |
| BAAI/bge-m3 | ~568M | 8192 tokens | Multilingüe (100+) | MIT | Abierto |
| intfloat/multilingual-e5-base | ~278M | 512 tokens | Multilingüe (100+) | MIT | Abierto |
| intfloat/multilingual-e5-large | ~560M | 512 tokens | Multilingüe (100+) | MIT | Abierto |

La comparación directa con bge-m3 es la más relevante: este modelo parte de él y añade especialización en tayiko, pero pierde la licencia permisiva MIT original y pasa a un acceso restringido. Frente a multilingual-e5, la principal ventaja sería la cobertura del tayiko (no confirmada empíricamente) y un contexto potencialmente mayor (si conserva los 8192 tokens de bge-m3, aunque no está documentado). No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que el fine-tuning mejore al modelo base en tayiko, ruso o inglés.
- Licencia `saidzoda-model-licence` no estándar: es imprescindible revisar sus términos antes de cualquier uso comercial; no se garantiza permiso de uso en producción.
- Acceso restringido (gated): requiere aceptar condiciones y autenticarse; esto complica la automatización de descargas en CI/CD y la reproducibilidad.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos lingüísticos, geográficos o de género.
- Riesgo de sobreajuste al dominio de entrenamiento: si el dataset era pequeño (probable en idiomas de bajos recursos), el modelo puede degradarse en dominios distintos al corpus usado.
- Cobertura idiomática limitada a tg, ru, en: no se declara soporte para otras lenguas de Asia Central (uzbeko, kazajo, kirguís) ni para variantes dialectales del tayiko.
- Sin variantes cuantizadas publicadas: no hay GGUF ni ONNX, lo que limita el despliegue en entornos sin GPU o con restricciones de memoria.
- Modelo de embeddings, no generativo: no puede usarse para chat, generación de texto ni razonamiento; solo produce representaciones vectoriales.
- Popularidad nula (0 descargas, 0 likes): no hay validación comunitaria ni reportes de uso en producción que respalden su calidad.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la integridad del repositorio y la autenticidad del autor antes de integrarlo en un sistema crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tohirju/Saidzoda-Tajik-BGE-M3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Paper de BGE-M3 (arXiv): https://arxiv.org/abs/2402.03216
- Repositorio FlagEmbedding (BAAI): https://github.com/FlagOpen/FlagEmbedding
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference (TEI): https://github.com/huggingface/text-embeddings-inference
