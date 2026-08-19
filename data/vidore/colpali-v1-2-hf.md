# vidore/colpali-v1.2-hf

## Resumen

ColPali v1.2 es un modelo de recuperación visual de documentos desarrollado por el equipo vidore, que combina un modelo de lenguaje visual (VLM) con la estrategia de interacción tardía de ColBERT para indexar y buscar documentos a partir de sus características visuales. Está construido sobre PaliGemma-3B, un VLM de Google, y genera representaciones multi-vector tanto para imágenes de documentos como para consultas de texto, permitiendo una recuperación eficiente sin necesidad de OCR ni extracción de texto previa.

El modelo resuelve el problema de la recuperación de información en documentos con diseños complejos, tablas, gráficos o escritura manuscrita, donde los métodos basados en texto pierden información. Su relevancia actual radica en que ofrece un rendimiento superior a los sistemas tradicionales de retrieval sobre texto extraído, con una arquitectura relativamente ligera (2.9 mil millones de parámetros) y una ventana de contexto visual de 448x448 píxeles. La versión v1.2 es una iteración intermedia, ya superada por v1.3, pero sigue siendo útil para integraciones con transformers y Sentence Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma-3B (VLM) con estrategia ColBERT multi-vector |
| Parametros totales | 2.924.613.488 (~2.9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa imágenes de 448x448 píxeles) |
| Tipos de cuantizacion | no disponible (se usa en bfloat16, pero compatible con cuantización estándar de transformers) |
| Idiomas soportados | Inglés (entrenado), con posible generalización zero-shot a otros idiomas |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColPali v1.2 se construye a partir de un modelo SigLIP (vision encoder) cuyos patch-embeddings se alimentan a un modelo de lenguaje PaliGemma-3B. La clave es que los embeddings de parches de imagen se mapean al mismo espacio latente que los tokens de texto, lo que permite aplicar la estrategia de interacción tardía de ColBERT: se calcula la similitud MaxSim entre cada token de la consulta y cada parche de la imagen, sumando los máximos para obtener una puntuación global. Esta arquitectura supera a los bi-encoders tradicionales al capturar interacciones más finas entre texto e imagen.

El entrenamiento se realizó sobre un dataset de 127.460 pares consulta-página, compuesto por un 63% de conjuntos académicos abiertos y un 37% de datos sintéticos generados a partir de PDFs web con pseudo-preguntas creadas por Claude-3 Sonnet. Todo el dataset está en inglés, diseñado para estudiar la generalización zero-shot a otros idiomas. Se entrenó durante 1 época con LoRA (alpha=32, r=32) en las capas del transformer y la capa de proyección final, usando optimizador paged_adamw_8bit, learning rate 5e-5 con decay lineal y 2.5% de warmup, batch size 32 y 8 GPUs en paralelo de datos. Se verificó que ningún documento multi-página del benchmark ViDoRe apareciera en el conjunto de entrenamiento para evitar contaminación.

## Capacidades

- Recuperación visual de documentos: indexa páginas completas como imágenes y las relaciona con consultas de texto sin necesidad de OCR ni extracción de texto.
- Generación de embeddings multi-vector estilo ColBERT: cada documento se representa como un conjunto de vectores de 128 dimensiones (uno por parche de imagen), y cada consulta como un conjunto de vectores de texto.
- Interacción tardía (late interaction) mediante MaxSim: permite un scoring más preciso que la similitud coseno simple de los bi-encoders.
- Soporte para consultas multimodales: puede procesar tanto texto como imágenes de documentos, aunque su uso principal es retrieval de documentos visuales.
- Integración con Sentence Transformers y transformers: se puede usar como `MultiVectorEncoder` en Sentence Transformers o con `ColPaliForRetrieval` en transformers.
- Generalización zero-shot a idiomas no ingleses: aunque el entrenamiento es solo en inglés, el modelo puede transferir a otros idiomas gracias al pretraining multilingüe de Gemma.
- Sin necesidad de OCR: procesa directamente la imagen, lo que evita errores de extracción de texto y funciona con documentos escaneados o manuscritos.

## Casos de uso

- Búsqueda en archivos de documentos escaneados: una empresa puede indexar miles de PDFs escaneados (facturas, contratos, formularios) y permitir búsquedas por contenido visual sin OCR previo, reduciendo costes y errores de extracción.
- Recuperación de información en papers científicos: los investigadores pueden buscar figuras, tablas o ecuaciones en artículos académicos indexando las páginas como imágenes, algo que los sistemas basados en texto pierden.
- Asistentes de atención al cliente con documentos de producto: un chatbot puede recuperar la página exacta de un manual de usuario que responde a la pregunta del cliente, usando el modelo para encontrar la sección relevante visualmente.
- Búsqueda en informes financieros y gráficos: analistas pueden localizar rápidamente páginas con gráficos o tablas específicas en informes anuales, sin depender de que el texto esté bien estructurado.
- Indexación de documentos legales manuscritos: despachos de abogados pueden buscar cláusulas o firmas en documentos históricos manuscritos, donde el OCR falla pero la imagen conserva la información.
- Pipeline de RAG multimodal: el modelo se puede integrar en sistemas de generación aumentada por recuperación (RAG) que necesitan recuperar fragmentos visuales de documentos, combinando los embeddings con un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de rendimiento, aunque el paper original (arXiv:2407.01449) reporta mejoras frente a métodos basados en OCR en el benchmark ViDoRe. Para esta ficha, no se dispone de datos cuantitativos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~2.9B parámetros. En bfloat16 (formato recomendado) ocupa aproximadamente 5.8 GB, por lo que cabe en GPUs con 8 GB o más. Con cuantización de 8 bits (~2.9 GB) o 4 bits (~1.5 GB) puede ejecutarse en GPUs con menos memoria.
- GPU recomendadas: RTX 3090/4090 (24 GB) para trabajar cómodamente en bfloat16; A100 o H100 para despliegues de producción con alto throughput. En Apple Silicon (MPS) también es compatible.
- Si cabe en consumer GPU: sí, una RTX 3060 de 12 GB puede ejecutar el modelo en bfloat16, y una RTX 4060 de 8 GB con cuantización de 8 bits.
- Opciones de despliegue: vLLM (si se adapta a multi-vector), Sentence Transformers, transformers con `device_map`, o llama.cpp si se convierte a GGUF (aunque no hay conversión oficial).
- Latencia y throughput: no disponible; depende del hardware y del número de parches de imagen procesados. Para una página de 448x448, se generan alrededor de 1030 vectores de documento (según el ejemplo de la model card), lo que implica un coste de memoria y cómputo mayor que un bi-encoder simple.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para comparar con alternativas concretas. El propio ecosistema vidore ofrece versiones anteriores (colpali-v1.0, colpali-v1.1) y posteriores (colpali-v1.3), así como variantes como BiPali o ColVision, pero no hay métricas comparativas publicadas en la información disponible. Se recomienda consultar el benchmark ViDoRe para comparaciones con otros retrievers visuales.

## Limitaciones y advertencias

- Entrenado solo en inglés: aunque puede generalizar a otros idiomas, el rendimiento fuera del inglés no está garantizado y puede degradarse.
- Requiere ingeniería para frameworks de retrieval estándar: la naturaleza multi-vector (estilo ColBERT) no es compatible con índices vectoriales tradicionales (como FAISS con similitud coseno simple), por lo que se necesita adaptar el pipeline de búsqueda.
- Licencia Gemma: restringe el uso comercial bajo los términos de la licencia de Google para modelos Gemma, que incluye limitaciones para organizaciones con más de 700 millones de usuarios mensuales.
- Riesgo de alucinación en la generación de pseudo-preguntas: el dataset sintético se generó con Claude-3 Sonnet, lo que puede introducir sesgos o errores en las consultas de entrenamiento.
- Sin soporte nativo para otros formatos de entrada: el modelo espera imágenes de documentos; no procesa directamente audio, video ni texto plano sin imagen.
- La versión v1.2 está superada por v1.3: se recomienda evaluar la versión más reciente para nuevos proyectos, aunque v1.2 sigue siendo válida para integraciones con transformers.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/vidore/colpali-v1.2-hf
- HuggingFace de la versión original (no HF): https://huggingface.co/vidore/colpali-v1.2
- Repositorio GitHub (código de entrenamiento e inferencia): https://github.com/illuin-tech/colpali
- Paper original (arXiv:2407.01449): https://arxiv.org/abs/2407.01449
- Paper de ColBERT (arXiv:2004.12832): https://arxiv.org/abs/2004.12832
- Paper de LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Modelo base PaliGemma-3B: https://huggingface.co/google/paligemma-3b-mix-448
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
