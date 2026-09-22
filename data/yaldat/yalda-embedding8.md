# Yaldat/Yalda-Embedding8

## Resumen

Yalda-Embedding8 es un modelo de embeddings de texto publicado por el usuario Yaldat en HuggingFace, construido como fine-tune de Qwen/Qwen3-0.6B-Base y etiquetado con la librería sentence-transformers y el pipeline feature-extraction. Con 595.776.512 parámetros (0,6B) y pesos en safetensors, se enmarca en la categoría de modelos densos pequeños para recuperación semántica, donde el coste de inferencia por documento es bajo y el despliegue cabe en una única GPU de consumo.

La model card del repositorio reproduce íntegramente el contenido de Qwen/Qwen3-Embedding-0.6B, de modo que las especificaciones declaradas (28 capas, contexto de 32.768 tokens, dimensión de embedding de hasta 1024 con soporte MRL de 32 a 1024, más de 100 idiomas) corresponden al modelo de referencia de Qwen y no a una documentación propia del autor del fine-tune. No hay información publicada sobre el dataset de ajuste, el procedimiento de entrenamiento ni evaluaciones específicas de Yalda-Embedding8.

Es relevante ahora porque el nicho de embeddings compactos y multilingües es crítico para pipelines de RAG y búsqueda semántica con presupuesto de latencia ajustado. Sin embargo, el repositorio presenta 0 descargas y 0 likes, se creó y actualizó el mismo día (22 de septiembre de 2026) y no incluye resultados de benchmarks propios, por lo que debe tratarse como un artefacto no validado hasta que se reproduzcan evaluaciones de recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) adaptado a extracción de embeddings; 28 capas según la model card heredada |
| Parámetros totales | 595.776.512 (0,6B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (dato declarado en la model card heredada de Qwen3-Embedding-0.6B) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible para este fine-tune; la model card heredada declara más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión de embedding | hasta 1024, con soporte MRL (dimensiones definidas por el usuario entre 32 y 1024) según la model card heredada |
| Modelo base | Qwen/Qwen3-0.6B-Base (tag base_model:finetune) |
| Tamaño del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

La información disponible no describe el procedimiento de entrenamiento del fine-tune. Lo que se puede afirmar con certeza es que parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only denso de la familia Qwen3 con 28 capas y aproximadamente 0,6B de parámetros, y que el resultado se expone como modelo de embeddings (pipeline feature-extraction) compatible con sentence-transformers. El tag arxiv:2506.05176 apunta al artículo técnico de la serie Qwen3 Embedding, que describe la receta general de la familia: ajuste sobre modelos base densos de Qwen3, soporte de instrucciones por tarea (instruction-aware) y dimensiones de salida flexibles mediante MRL.

No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni sobre si se aplicaron técnicas de pooling o normalización específicas distintas de las del modelo de referencia. Tampoco se documenta si el autor realizó ajuste sobre tareas concretas, en qué idioma o dominio, ni con qué hiperparámetros. La innovación técnica destacable del linaje Qwen3-Embedding es la combinación de instrucciones de tarea con embeddings de dimensión configurable, más un contexto de 32k tokens; si el fine-tune conserva esas propiedades es algo que no está verificado en el repositorio.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (pipeline feature-extraction).
- Recuperación de texto multilingüe y cross-lingual, según las capacidades declaradas por la familia Qwen3 Embedding (más de 100 idiomas).
- Recuperación de código (code retrieval), citada explícitamente en la model card heredada.
- Clasificación de texto y clustering mediante representaciones vectoriales.
- Minería de bitextos (bitext mining) para alineación de corpus paralelos.
- Soporte de instrucciones por tarea (instruction-aware): la model card recomienda definir instrucciones específicas y escribirlas en inglés, con mejoras declaradas del 1% al 5%.
- Dimensiones de salida configurables entre 32 y 1024 mediante MRL, útil para索引 comprimidos.
- No es un modelo generativo: no realiza tool calling, function calling ni razonamiento multi-paso. La etiqueta text-generation del repositorio procede del modelo base, no de esta adaptación.
- Compatibilidad declarada con Text Embeddings Inference (tag text-embeddings-inference) y con sentence-transformers >= 2.7.0 y transformers >= 4.51.0.

## Casos de uso

- Búsqueda semántica en bases de conocimiento internas: indexar documentación, tickets o normativa en una base vectorial y recuperar pasajes relevantes para una consulta; el contexto de 32k tokens permite indexar fragmentos largos sin trocear en exceso.
- RAG (generación aumentada por recuperación): usar Yalda-Embedding8 como recuperador de primera etapa y combinar con un reranker de la familia Qwen3 (Qwen3-Reranker-0.6B) para afinar el ranking antes de pasar el contexto a un LLM generador.
- Deduplicación de datasets de entrenamiento: calcular embeddings de millones de documentos y aplicar umbrales de similitud coseno para eliminar duplicados casi idénticos antes de entrenar otros modelos.
- Clustering temático de corpus: agrupar noticias, reseñas o incidencias por similitud semántica sin etiquetas previas, aprovechando que el coste por documento es bajo al ser un modelo de 0,6B.
- Clasificación de texto zero-shot o few-shot: entrenar un clasificador ligero sobre los embeddings congelados (regresión logística, SVM) para moderación de contenido o enrutado de tickets, evitando el coste de ajustar un modelo generativo.
- Recuperación de código en repositorios: construir un índice de funciones y ficheros para búsqueda semántica dentro de una organización ("dónde se valida el token de sesión"), apoyándose en la capacidad de code retrieval declarada por la familia.
- Minería de bitextos y alineación de corpus multilingües: emparejar frases equivalentes entre dos idiomas para construir datasets de traducción o evaluar calidad de traducciones automáticas.
- Sistemas de recomendación por contenido: representar ítems y preferencias del usuario en el mismo espacio vectorial para recomendar artículos, vídeos o productos sin depender de señales colaborativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para Yalda-Embedding8. El repositorio no incluye tabla de evaluaciones ni métricas propias.

Como referencia del linaje, la model card copiada indica que el modelo de 8B de la serie Qwen3 Embedding alcanzó la posición número 1 en la clasificación MTEB multilingüe (a fecha de 5 de junio de 2025) con una puntuación de 70,58. Ese dato corresponde a Qwen3-Embedding-8B, no a este modelo ni al tamaño 0,6B, y no puede extrapolarse al fine-tune aquí descrito.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento de parámetros, sin medir en hardware real): en BF16/FP16, aproximadamente 1,2 GB de pesos; en INT8, unos 0,6 GB; en 4 bits, unos 0,35-0,4 GB. Hay que sumar memoria para activaciones y caché KV, que crece de forma apreciable con secuencias cercanas a los 32k tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para lotes pequeños en precisión reducida; RTX 3060/4060/4090, L4, A10G o A100/H100 para despliegues de alto rendimiento con lotes grandes.
- Cabe en GPU de consumo: sí, de forma holgada, incluidas GPU de portátil con 6-8 GB. También puede ejecutarse en CPU, con latencia mayor.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), vLLM con soporte de embeddings, y conversión a GGUF para llama.cpp/Ollama si se necesita ejecución en CPU o en hardware muy limitado.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de documentos por segundo para este repositorio.
- Requisito de versiones: transformers >= 4.51.0, ya que versiones anteriores fallan con `KeyError: 'qwen3'`; sentence-transformers >= 2.7.0. La model card recomienda flash_attention_2 con `padding_side="left"` para acelerar la inferencia y reducir memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yalda-Embedding8 | 0,6B | 32k (declarado, heredado) | hasta 1024 (MRL 32-1024) | Apache 2.0 | 0 descargas, sin evaluación publicada |
| Qwen3-Embedding-0.6B | 0,6B | 32k | 1024 (MRL) | Apache 2.0 | Modelo de referencia de Qwen, con blog y repositorio propios |
| BGE-M3 | ~568M | 8192 | 1024 | MIT | Ampliamente adoptado, multilingüe y multi-vector |
| multilingual-e5-large | ~560M | 512 | 1024 | MIT | Muy extendido, contexto corto |
| EmbeddingGemma-300m | ~308M | 2048 | 768 (MRL) | licencia Gemma | Modelo reciente de Google, orientado a despliegue en dispositivo |

Nota: los datos de los modelos comparativos provienen de sus fichas públicas y no se han verificado mediante búsqueda web en esta revisión; solo las cifras de Yalda-Embedding8 están confirmadas por el repositorio analizado. Frente a sus alternativas, la ventaja teórica de Yalda-Embedding8 es el contexto de 32k y el soporte MRL, mientras que su desventaja es la ausencia total de validación independiente.

## Limitaciones y advertencias

- La model card del repositorio es una copia literal de la de Qwen/Qwen3-Embedding-0.6B; no documenta el fine-tune, su dataset ni su proceso de entrenamiento.
- Sin resultados de benchmarks propios: el rendimiento real en recuperación, clasificación o clustering es desconocido y puede ser inferior al del modelo de referencia si el ajuste se hizo con datos escasos o muy específicos de dominio.
- 0 descargas y 0 likes, con creación y última actualización el mismo día: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Riesgo de similitudes espurias: como todo modelo de embeddings, puede asignar alta similitud coseno a textos léxicamente próximos pero semánticamente distintos, lo que degrada la precisión de un sistema de recuperación.
- Sesgos: los modelos de embeddings heredan sesgos de representación de sus datos de entrenamiento; no se ha publicado ninguna evaluación de sesgo para este modelo.
- Cobertura idiomática no verificada: el dato de "más de 100 idiomas" corresponde a la familia Qwen3 Embedding, no a este fine-tune. Si el ajuste se centró en un idioma concreto, puede haber degradación en el resto.
- Límite de contexto: 32k tokens declarados; entradas más largas requieren truncado o troceado, y el rendimiento en la parte final de la ventana no está verificado.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías. Conviene verificar también la licencia del modelo base (Qwen3-0.6B-Base, también Apache 2.0).
- En producción, fijar la revisión exacta del repositorio (commit hash) para evitar cambios silenciosos de pesos.
- No es un modelo generativo: no debe usarse para generar texto, tool calling ni razonamiento, a pesar de la etiqueta text-generation presente en los tags heredados del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yaldat/Yalda-Embedding8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo de referencia de la model card: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Blog de la serie Qwen3 Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Artículo técnico referenciado en los tags: https://arxiv.org/abs/2506.05176
- Resto de modelos de la serie: https://huggingface.co/Qwen/Qwen3-Embedding-4B, https://huggingface.co/Qwen/Qwen3-Embedding-8B, https://huggingface.co/Qwen/Qwen3-Reranker-0.6B

Nota sobre la búsqueda web: los resultados obtenidos corresponden a páginas de cuestionarios de entretenimiento de Bing y no contienen información relevante sobre este modelo ni sobre su autor. No se ha localizado documentación adicional, demo, paper específico ni publicación del autor del fine-tune.
