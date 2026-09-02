# spelunk-cloud/F2LLM-v2-330M-Q8_0-GGUF

## Resumen

F2LLM-v2-330M-Q8_0-GGUF es una versión cuantizada en Q8_0 del modelo de embeddings `codefuse-ai/F2LLM-v2-330M`, distribuida por el usuario `spelunk-cloud` en Hugging Face. El modelo original es un encoder de frases de 330 millones de parámetros basado en una arquitectura Qwen3 decoder, que produce vectores de 896 dimensiones. Esta versión GGUF está pensada para ser utilizada como modelo de embeddings embebido en aplicaciones de escritorio o servidores ligeros, concretamente en el proyecto Inkentry (y su variante spelunk), donde se ejecuta mediante los motores candle y llama.cpp.

La relevancia de esta ficha radica en que ofrece una alternativa de embeddings de tamaño reducido, con licencia Apache-2.0, que puede desplegarse en CPU o GPU consumer sin necesidad de cuantización adicional en el dispositivo. Al estar pre-cuantizado, el primer arranque solo requiere descargar un archivo de aproximadamente 340 MB. El modelo está diseñado para tareas de similitud de frases y recuperación semántica, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 decoder (encoder de embeddings) |
| Parametros totales | 334.349.184 (330M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (proyecciones y tabla de embeddings), F32 (RMSNorm) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos variantes: nombres HF y llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `codefuse-ai/F2LLM-v2-330M` es un encoder de frases basado en una arquitectura Qwen3 decoder, con una dimensión de embeddings de 896. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados ni el método de entrenamiento (si se usó contraste, hard negatives, etc.). La versión GGUF aquí descrita es una cuantización Q8_0 de los pesos originales en BF16, realizada con la herramienta `convert_hf_to_gguf.py` de llama.cpp. La cuantización mantiene las proyecciones y la tabla de embeddings en Q8_0, mientras que los pesos de RMSNorm se conservan en F32 por su tamaño despreciable. No se han introducido otras modificaciones en los pesos; el tokenizer se redistribuye sin cambios.

## Capacidades

- Genera embeddings de frases de 896 dimensiones para tareas de similitud semántica.
- Soporta comparación de vectores mediante similitud coseno u otras métricas de distancia.
- Adecuado para recuperación de información, búsqueda semántica y clustering.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; se desconoce el alcance idiomático.

## Casos de uso

- Búsqueda semántica en documentos locales: el modelo puede indexar párrafos o frases de un corpus y permitir consultas en lenguaje natural, devolviendo los fragmentos más relevantes por similitud coseno. Su tamaño reducido permite ejecutarlo en un portátil sin GPU.
- Sistemas RAG (retrieval-augmented generation) ligeros: como componente de recuperación en pipelines de generación aumentada, donde se necesita un encoder rápido y de bajo consumo que pueda ejecutarse en CPU.
- Deduplicación de textos: comparar embeddings de documentos para detectar duplicados o versiones casi idénticas en grandes colecciones, útil en gestión de contenidos o limpieza de datasets.
- Clasificación de texto por similitud: agrupar tickets de soporte, comentarios o reseñas en categorías temáticas mediante clustering de embeddings, sin necesidad de entrenar un clasificador supervisado.
- Moderación de contenido: identificar mensajes que se asemejan a patrones conocidos (spam, abuso) comparando con un conjunto de ejemplos etiquetados, aprovechando la baja latencia del modelo en entornos de producción.
- Motor de recomendación basado en contenido: representar ítems (artículos, productos, noticias) como vectores y recomendar elementos similares según la proximidad en el espacio de embeddings, con un coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `codefuse-ai/F2LLM-v2-330M` no tiene métricas públicas de tareas como MTEB, STS o similares en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el modelo completo en Q8_0 (el archivo pesa ~340 MB). En CPU, el uso de RAM es similar.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, integradas modernas). También funciona en Apple Silicon mediante Metal.
- En consumer GPU: sí, cabe en prácticamente cualquier GPU actual, incluidas las integradas de Intel o AMD.
- Opciones de despliegue: llama.cpp (motor nativo), candle (runtime de Rust), o cualquier framework que soporte GGUF (Ollama, llama-cpp-python, etc.).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño (330M), se espera una latencia de pocos milisegundos por lote pequeño en CPU moderna y menor en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension embeddings | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| F2LLM-v2-330M (Q8_0) | 330M | 896 | no disponible | Apache-2.0 | GGUF |
| all-MiniLM-L6-v2 | 22M | 384 | 256 tokens | Apache-2.0 | ONNX, safetensors |
| bge-small-en-v1.5 | 33M | 384 | 512 tokens | MIT | safetensors |
| gte-small | 33M | 384 | 512 tokens | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo (p. ej., puntuaciones en MTEB) para F2LLM-v2-330M, por lo que no es posible posicionarlo cuantitativamente frente a estas alternativas. En términos de tamaño, es significativamente mayor que los modelos de 22-33M, lo que sugiere una mayor capacidad de representación, pero también un mayor coste computacional.

## Limitaciones y advertencias

- Al ser un modelo de embeddings, no genera texto; cualquier uso que requiera generación debe combinarse con un LLM generativo.
- No se han documentado los idiomas soportados; es posible que el rendimiento sea desigual en lenguas distintas de las del entrenamiento original.
- El tamaño de contexto no está especificado; para frases muy largas puede degradarse la calidad del embedding.
- La cuantización Q8_0 introduce una pérdida mínima de precisión frente a BF16, pero en tareas de similitud suele ser aceptable; no se han publicado evaluaciones que lo confirmen.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de modificación (NOTICE) y la atribución correspondiente.
- No hay garantías de soporte o mantenimiento por parte del autor de la cuantización; el modelo base pertenece a CodeFuse (Alibaba).

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/spelunk-cloud/F2LLM-v2-330M-Q8_0-GGUF
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-330M
- Proyecto Inkentry (uso principal): https://github.com/inkentries/inkentry
- Documentación de spelunk (modelos de terceros): https://github.com/spelunk-cloud/spelunk/blob/main/docs/third-party-models.md
- Documentación de atribución de modelos: https://github.com/spelunk-cloud/spelunk/blob/main/docs/model-attribution.md
- Guía de inicio de spelunk: https://www.spelunk.cloud/docs/getting-started
