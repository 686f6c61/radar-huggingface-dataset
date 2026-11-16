# uyycs/bge-small-zh-v1.5

## Resumen

`uyycs/bge-small-zh-v1.5` es una redistribución del modelo de embeddings `BAAI/bge-small-zh-v1.5`, desarrollado originalmente por BAAI (Beijing Academy of Artificial Intelligence) dentro del proyecto FlagEmbedding. Se trata de un modelo de representación de frases (sentence embedding) basado en una arquitectura BERT de tipo encoder, que transforma cualquier texto en un vector denso de baja dimensionalidad utilizable para recuperación de información, búsqueda semántica, clasificación y clustering. El repositorio `uyycs` actúa como espejo del modelo original con licencia MIT.

El modelo pertenece a la generación v1.5 de la familia BGE, publicada en septiembre de 2023, que corrigió la distribución de similitudes de la versión anterior y mejoró la capacidad de recuperación sin necesidad de instrucción de consulta. Con cerca de 24 millones de parámetros y un tamaño de repositorio de 0,2 GB, está diseñado para escenarios donde el coste computacional y la latencia importan, manteniendo un rendimiento competitivo frente a modelos de mayor tamaño de su categoría.

Su relevancia actual radica en que los embeddings compactos siguen siendo la pieza central de los sistemas RAG (retrieval-augmented generation) y de las bases de datos vectoriales. Un modelo de 24M de parámetros puede ejecutarse en CPU o en GPUs de gama baja con un throughput elevado, lo que lo hace atractivo para indexación masiva de corpus en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (representación de frases) |
| Parametros totales | 23.954.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors y pytorch) |
| Idiomas soportados | chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch (bin) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de escala "small" que produce un vector denso por texto de entrada. La familia BGE se entrena con objetivos de similitud contrastiva sobre pares de oraciones y se afina con negativos duros (*hard negatives*) para mejorar la discriminación en tareas de recuperación. La versión v1.5, según la documentación del proyecto FlagEmbedding, ajusta la distribución de similitudes para que las puntuaciones sean más interpretables y refuerza la recuperación sin instrucción de consulta, de modo que el modelo funciona razonablemente bien tanto si se antepone la instrucción `为这个句子生成表示以用于检索相关文章：` como si no.

El proyecto BGE publicó su informe técnico (arXiv:2309.07597) y liberó el conjunto masivo de datos de entrenamiento (BAAI-MTP). La model card del repositorio no detalla el número exacto de tokens de entrenamiento ni la composición del dataset para esta variante concreta, por lo que esos datos deben considerarse no disponibles en la información proporcionada.

## Capacidades

- Generación de embeddings densos de frases para búsqueda semántica y recuperación de pasajes.
- Similitud semántica entre pares de textos (detección de duplicados, deduplicación de corpus).
- Clasificación de textos mediante embeddings como características de entrada.
- Clustering y agrupamiento semántico de documentos.
- Indexación en bases de datos vectoriales para pipelines RAG con LLM.
- Recuperación bilingüe limitada: el modelo está entrenado para chino; su uso con otros idiomas no está respaldado por la documentación.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Búsqueda semántica en corpus chinos: el modelo indexa documentos y consultas en el mismo espacio vectorial, permitiendo recuperar pasajes relevantes por similitud coseno con latencia muy baja gracias a sus 24M de parámetros.
- Pipeline RAG para asistentes en chino: se usa como retriever en una base de datos vectorial (FAISS, Milvus, Qdrant) para alimentar el contexto de un LLM generativo con los fragmentos más relevantes.
- Deduplicación de datasets: calcular embeddings de un corpus y agrupar por similitud para eliminar documentos casi idénticos antes del entrenamiento o la publicación.
- Clasificación de tickets y correos: usar los embeddings como entrada a un clasificador ligero (regresión logística, SVM) para enrutar consultas de soporte en chino.
- Moderación y agrupamiento de contenido: clustering de mensajes de usuarios para detectar temas recurrentes o patrones anómalos en foros y plataformas.
- Motor de recomendación de contenido textual: similitud entre artículos o productos descritos en chino para sugerir elementos relacionados.
- Búsqueda en documentación técnica interna: indexar manuales y bases de conocimiento en chino para consulta por parte de empleados mediante lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio redistribuido no incluye tablas de evaluación específicas para esta variante; el proyecto FlagEmbedding publica resultados agregados en su repositorio de GitHub y en el leaderboard C-MTEB, pero no se han proporcionado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (24M de parámetros ocupan aproximadamente 96 MB de pesos); en fp16 alrededor de 48 MB. Cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con throughput aceptable. Para indexación masiva se recomienda cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) para paralelizar lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en iGPU y CPU.
- Opciones de despliegue: `sentence-transformers`, `transformers` con `AutoModel`, `FlagEmbedding`, `text-embeddings-inference` (TGI), `vLLM` (soporte de embeddings), `Ollama` mediante conversión, y `llama.cpp` si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles de forma oficial en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uyycs/bge-small-zh-v1.5 | 23.954.432 | chino | no disponible | MIT | Hugging Face |
| BAAI/bge-base-zh-v1.5 | no disponible en la información | chino | no disponible | MIT | Hugging Face |
| BAAI/bge-large-zh-v1.5 | no disponible en la información | chino | no disponible | MIT | Hugging Face |
| BAAI/bge-small-en-v1.5 | no disponible en la información | inglés | no disponible | MIT | Hugging Face |

La comparativa se limita a la familia BGE porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos de otros proveedores. Las variantes `base` y `large` ofrecen presumiblemente mayor capacidad de representación a costa de más parámetros y latencia; la variante `small` prioriza eficiencia. No se dispone de cifras de benchmark para cuantificar la diferencia.

## Limitaciones y advertencias

- Entrenado exclusivamente para chino: su uso con textos en castellano u otros idiomas producirá embeddings de baja calidad y recuperación deficiente.
- Riesgo de sesgos: al derivar de datos web masivos en chino, puede heredar sesgos culturales, de género o políticos presentes en el corpus; no se documenta ningún proceso de mitigación específico.
- El modelo no genera texto, por lo que no alucina en el sentido generativo, pero una recuperación deficiente puede introducir contexto irrelevante en pipelines RAG y degradar las respuestas del LLM.
- Longitud de contexto no documentada en la información disponible: para pasajes largos conviene dividir el texto en fragmentos y verificar empíricamente el truncamiento.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; conviene conservar el aviso de copyright original de BAAI.
- Repositorio espejo con 0 descargas y 0 likes: no hay evidencia de validación comunitaria sobre esta copia concreta; para producción se recomienda usar el repositorio oficial `BAAI/bge-small-zh-v1.5` o verificar la integridad de los pesos.
- No se documentan instrucciones de consulta específicas en el repositorio espejo; la familia v1.5 está diseñada para funcionar sin instrucción, pero la instrucción recomendada por BAAI es `为这个句子生成表示以用于检索相关文章：`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/uyycs/bge-small-zh-v1.5
- Modelo original: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Informe técnico de BGE: https://arxiv.org/pdf/2309.07597.pdf
- Paper de LLM-Embedder: https://arxiv.org/pdf/2310.07554.pdf
- Leaderboard C-MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Datos de entrenamiento BGE (BAAI-MTP): https://data.baai.ac.cn/details/BAAI-MTP
