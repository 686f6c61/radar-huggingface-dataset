# vidore/colqwen2.5-v0.2

## Resumen

ColQwen2.5 (vidore/colqwen2.5-v0.2) es un modelo de recuperación visual de documentos (visual document retrieval) desarrollado por el equipo de Vidore, basado en la arquitectura de Qwen2.5-VL-3B-Instruct y en la estrategia de late interaction de ColBERT. Su objetivo es indexar y recuperar documentos a partir de sus características visuales, sin necesidad de depender de texto extraído mediante OCR, lo que lo hace especialmente útil para documentos complejos como gráficos, tablas o páginas escaneadas.

El modelo genera representaciones multi-vector (varios vectores por imagen o consulta) que permiten una comparación más fina entre consultas y documentos, superando las limitaciones de los embeddings de una sola vectorización. Fue presentado en el artículo "ColPali: Efficient Document Retrieval with Vision Language Models" (arXiv:2407.01449) y se publica bajo licencia MIT. Con un tamaño de repositorio de 0,3 GB, es ligero y puede ejecutarse en hardware de consumo, aunque los requisitos exactos dependen de la resolución de las imágenes procesadas.

Esta versión (v0.2) introduce mejoras respecto a la original: acepta resoluciones de imagen dinámicas sin distorsionar la relación de aspecto y genera hasta 768 parches de imagen como máximo, lo que mejora el rendimiento en documentos de alta densidad visual a costa de un mayor uso de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Language Model (VLM) basado en Qwen2.5-VL-3B-Instruct con estrategia ColBERT (late interaction multi-vector) |
| Parametros totales | Aproximadamente 3B (modelo base Qwen2.5-VL-3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2.5-VL-3B, no especificado en la ficha) |
| Tipos de cuantizacion | No especificados; los pesos se distribuyen en formato safetensors (bfloat16 por defecto en entrenamiento) |
| Idiomas soportados | Ingles (entrenamiento exclusivamente en ingles; puede generalizar a otros idiomas de forma zero-shot) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColQwen2.5 parte de Qwen2.5-VL-3B-Instruct, un modelo de lenguaje y visión de 3 mil millones de parametros, y lo extiende para producir embeddings multi-vector estilo ColBERT. En lugar de generar un único vector por documento, el modelo produce una secuencia de vectores (uno por cada parche de imagen y token de texto) que se comparan mediante late interaction (suma de maximos productos escalares). Esto permite capturar correspondencias parciales entre consulta y documento, ideal para buscar informacion concreta en paginas densas.

El entrenamiento se realizo sobre un conjunto de 127.460 pares consulta-pagina, compuesto por un 63% de datasets academicos abiertos y un 37% de datos sinteticos generados a partir de paginas PDF obtenidas por web crawling, con pseudo-preguntas creadas mediante Claude-3 Sonnet. El conjunto es exclusivamente en ingles para estudiar la generalizacion zero-shot a otros idiomas, y se verifico que no hubiera solapamiento entre los documentos de entrenamiento y los del benchmark ViDoRe. Se entreno durante 1 epoca en bfloat16, usando adaptadores LoRA (alpha=32, r=32) sobre las capas transformer y la proyeccion final, con optimizador paged_adamw_8bit, learning rate 5e-5 con decaimiento lineal y warmup del 2,5%, y batch size 32 en 8 GPUs.

Una caracteristica clave de esta version es que no redimensiona las imagenes de entrada, sino que mantiene su resolucion original y genera hasta 768 parches de imagen. Esto mejora la precision en documentos con graficos o tablas pequenas, aunque incrementa el consumo de memoria proporcionalmente al numero de parches.

## Capacidades

- Recuperacion visual de documentos: indexa y busca paginas completas (PDF, imagenes, capturas) a partir de su contenido visual, sin depender de OCR.
- Multi-vector ColBERT: genera multiples vectores por documento y consulta, permitiendo coincidencias parciales y una relevancia mas granular.
- Procesamiento de imagenes a resolucion dinamica: no distorsiona la relacion de aspecto y admite hasta 768 parches de imagen.
- Integracion con Sentence Transformers: se puede usar como `MultiVectorEncoder` para codificar consultas y documentos en un pipeline estandar.
- Compatible con ColPali Engine: soporta la libreria `colpali-engine` para despliegue en produccion, con opcion de Flash Attention 2.
- Capacidad multilingue limitada: aunque entrenado solo en ingles, el modelo base Qwen2.5-VL tiene conocimiento multilingue que puede transferirse en escenarios zero-shot.
- No incluye generacion de texto: es un modelo de retrieval, no un LLM conversacional; no genera respuestas, solo embeddings.

## Casos de uso

- Busqueda en documentos escaneados: una empresa puede indexar miles de facturas o contratos escaneados y permitir a los empleados buscar por conceptos como "total a pagar" o "clausula de penalizacion" sin necesidad de OCR previo.
- Recuperacion aumentada por generacion (RAG) visual: integrar ColQwen2.5 como componente de retrieval en un pipeline de RAG donde los documentos fuente son imagenes o PDFs, y las consultas del usuario se comparan directamente con las representaciones visuales.
- Indexacion de graficos y tablas: en informes financieros o cientificos, el modelo puede localizar la pagina que contiene un grafico especifico (por ejemplo, "evolucion del PIB entre 2010 y 2020") sin depender de que el texto este estructurado.
- Archivo y clasificacion de documentos: clasificar automaticamente paginas en categorias (facturas, informes, formularios) comparando su representacion visual con consultas predefinidas.
- Asistentes de soporte tecnico: un chatbot puede usar ColQwen2.5 para encontrar la pagina del manual de usuario que responde a una pregunta del cliente, incluso si el manual contiene diagramas o capturas de pantalla.
- Verificacion de duplicados en bases de datos documentales: detectar documentos visualmente similares o versiones duplicadas de un mismo archivo comparando sus embeddings multi-vector.
- Investigacion academica: localizar rapidamente figuras o tablas relevantes en grandes colecciones de articulos cientificos en PDF, sin necesidad de leer el texto completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evalua contra el benchmark ViDoRe (coleccion de tareas de retrieval visual), pero no se incluyen numeros concretos en la documentacion proporcionada. Se recomienda consultar el articulo de ColPali (arXiv:2407.01449) para resultados comparativos con otros modelos de retrieval.

## Requisitos de hardware

- El modelo base tiene aproximadamente 3B parametros, por lo que en precision bfloat16 ocupa unos 6 GB en memoria. Sin embargo, el repositorio pesa solo 0,3 GB, lo que sugiere que puede distribuirse con pesos cuantizados o solo los adaptadores LoRA; en cualquier caso, la inferencia requiere cargar el modelo base completo.
- VRAM estimada: al menos 8 GB para imagenes de baja resolucion (pocos parches); con resoluciones altas (hasta 768 parches) se recomiendan 16 GB o mas, ya que cada parche genera un vector adicional.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para uso comodo con resoluciones altas; GPUs de datacenter como A100 o H100 para despliegues de gran volumen. Tambien es compatible con Apple Silicon (MPS) segun la documentacion.
- En GPU de consumo (por ejemplo, RTX 3060 de 12 GB) puede ejecutarse con resoluciones moderadas y batch pequeno.
- Opciones de despliegue: mediante Sentence Transformers (`MultiVectorEncoder`), ColPali Engine (`colpali-engine`), o con Transformers directamente. No se mencionan integraciones con vLLM u Ollama, ya que es un modelo de retrieval y no de generacion.
- Latencia y throughput: no especificados en la documentacion; dependen del numero de parches de imagen y del hardware. En una GPU moderna, la codificacion de una pagina suele tardar decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| ColQwen2.5 (este) | VLM + ColBERT | ~3B | No disponible | MIT | Retrieval visual multi-vector |
| ColPali (original) | VLM (PaliGemma) + ColBERT | ~3B | No disponible | MIT | Retrieval visual multi-vector |
| ColBERTv2 (texto) | Transformer + ColBERT | ~110M-400M | Hasta 512 tokens | MIT | Retrieval textual multi-vector |

No se dispone de datos comparativos de rendimiento en la informacion proporcionada. ColPali (original) es el predecesor directo y comparte la misma estrategia, pero ColQwen2.5 mejora la resolucion dinamica de imagen. ColBERTv2 es una alternativa puramente textual, sin capacidad visual, por lo que no es directamente comparable en tareas de documentos con graficos o tablas.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: el rendimiento en otros idiomas puede degradarse, aunque el modelo base Qwen2.5-VL tiene cierto conocimiento multilingue.
- No es un modelo generativo: no produce texto ni respuestas, solo embeddings para retrieval. No debe usarse como chat o asistente.
- Dependencia de la resolucion de imagen: el numero de parches (hasta 768) afecta directamente al consumo de memoria y a la velocidad; imagenes muy grandes pueden agotar la VRAM.
- Riesgo de alucinacion en la recuperacion: como cualquier modelo de retrieval, puede devolver documentos visualmente similares pero semanticamente irrelevantes, especialmente con consultas ambiguas.
- Sesgos del dataset de entrenamiento: al usar datos academicos y web-crawled, puede haber sesgos hacia ciertos dominios o estilos de documentos.
- Cambios en el prefijo de consulta: la version 0.3.13 de `colpali-engine` elimino el prefijo "Query: " con el que se entreno el modelo, lo que puede causar diferencias en los embeddings si se usa esa libreria. Se recomienda usar Sentence Transformers o ajustar el prefijo manualmente.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base Qwen2.5-VL tiene su propia licencia (Apache 2.0) que debe respetarse en derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vidore/colqwen2.5-v0.2
- Repositorio ColPali (GitHub): https://github.com/ManuelFay/colpali (mencionado en la model card)
- Paper ColPali: https://arxiv.org/abs/2407.01449
- Paper ColBERT (original): https://arxiv.org/abs/2004.12832
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
- Modelo base: https://huggingface.co/vidore/colqwen2.5-base
