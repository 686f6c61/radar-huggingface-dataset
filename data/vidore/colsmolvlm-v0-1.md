# vidore/colsmolvlm-v0.1

## Resumen

ColSmolVLM-v0.1 es un modelo de recuperación visual de documentos desarrollado por el equipo vidore (ILLUIN). Extiende el VLM SmolVLM-Instruct con una estrategia de interacción tardía estilo ColBERT, generando representaciones multi-vector tanto para texto como para imágenes. Esto permite indexar documentos a partir de sus características visuales sin necesidad de OCR ni de extracción de texto previa, un enfoque novedoso frente a los pipelines tradicionales de recuperación basados en texto.

El modelo se presenta como un adaptador LoRA (0,2 GB) sobre el modelo base vidore/ColSmolVLM-base, entrenado con 127.460 pares consulta-página procedentes de datasets académicos (63%) y un dataset sintético con pseudo-preguntas generadas por Claude-3 Sonnet (37%). Está diseñado para tareas de retrieval visual en dominios como PDFs, gráficos y documentos con diseño complejo, y es una evolución directa del enfoque ColPali presentado en el paper «ColPali: Efficient Document Retrieval with Vision Language Models» (arxiv:2407.01449).

Su relevancia actual radica en que ofrece una alternativa ligera a modelos de retrieval visual más grandes, manteniendo la capacidad de manejar documentos multimodales con un coste computacional reducido, y es compatible con el ecosistema de Sentence Transformers y la librería colpali-engine.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM-Instruct (VLM) con proyección multi-vector estilo ColBERT y adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,2 GB; el modelo base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (SmolVLM-Instruct suele soportar 8192 tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | bfloat16 (formato de entrenamiento); no se listan otras cuantizaciones |
| Idiomas soportados | Entrenado en inglés; posible generalización zero-shot a otros idiomas (no verificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

ColSmolVLM se basa en SmolVLM-Instruct, un modelo de lenguaje y visión de tamaño reducido desarrollado por HuggingFace. Sobre su arquitectura transformer se añade una capa de proyección que produce embeddings multi-vector (uno por token visual y textual) siguiendo el mecanismo de interacción tardía de ColBERT. El modelo se entrena con Low-Rank Adaptation (LoRA) con alpha=32 y r=32, aplicada a las capas transformer del modelo de lenguaje y a la capa de proyección final, inicializada de forma determinista para garantizar reproducibilidad.

El entrenamiento se realizó en bfloat16 con el optimizador paged_adamw_8bit, una tasa de aprendizaje de 5e-4 con decaimiento lineal y 2,5% de pasos de warmup, en una configuración de 4 GPUs con paralelismo de datos. El dataset combina conjuntos académicos abiertos (63%) con páginas de PDFs obtenidas por web crawling y aumentadas con pseudo-preguntas generadas por Claude-3 Sonnet (37%). El conjunto es íntegramente en inglés por diseño, para evaluar la generalización zero-shot a otros idiomas, y se verificó que ninguna página del dataset de evaluación ViDoRe estuviera presente en el entrenamiento para evitar contaminación.

La versión publicada corresponde a un entrenamiento de 3 épocas con batch size 128, usando la librería colpali-engine versión 0.3.5.

## Capacidades

- Recuperación visual de documentos: indexa páginas completas a partir de sus características visuales (layout, gráficos, tablas, imágenes) sin necesidad de OCR.
- Generación de embeddings multi-vector: produce representaciones densas por token (query y documento) que permiten scoring por interacción tardía (MaxSim).
- Consultas en lenguaje natural: acepta preguntas textuales y las proyecta al mismo espacio vectorial que las imágenes.
- Integración con Sentence Transformers: se puede usar como MultiVectorEncoder para pipelines estándar de retrieval.
- Compatibilidad con colpali-engine: soporta procesamiento de imágenes y consultas, y scoring multi-vector.
- Generalización zero-shot a otros idiomas: aunque el entrenamiento es en inglés, el modelo puede transferir a otros idiomas gracias al pretraining multilingüe del modelo base (no garantizado).
- Manejo de documentos con diseño complejo: útil para PDFs con múltiples columnas, gráficos incrustados o tablas.

## Casos de uso

- Búsqueda semántica en archivos PDF corporativos: indexar manuales, informes o contratos escaneados sin necesidad de extraer texto, consultando directamente por contenido visual o conceptual.
- Recuperación de información en documentos científicos: buscar figuras, tablas o resultados específicos en artículos de investigación a partir de descripciones textuales.
- Asistentes de atención al cliente con base de conocimiento visual: permitir que un chatbot recupere la página relevante de un manual de producto a partir de la pregunta del usuario, sin depender de OCR.
- Indexación de documentos históricos o manuscritos: donde el texto no es legible por OCR tradicional, pero el modelo puede capturar la estructura visual.
- Sistemas de gestión documental empresarial: clasificar y recuperar documentos escaneados (facturas, albaranes) por su contenido visual, combinando con metadatos.
- Pipeline de RAG multimodal: integrar el modelo como retriever en un sistema de generación aumentada por recuperación que maneje tanto texto como imágenes, usando los embeddings multi-vector para alimentar un LLM.
- Evaluación de calidad de digitalización: comparar versiones escaneadas de un documento para detectar diferencias visuales relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se enmarca en el benchmark ViDoRe, pero no se proporcionan métricas concretas (NDCG, MRR, etc.) en la model card ni en los resultados de búsqueda web. No se dispone de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero el modelo base (SmolVLM-Instruct) es necesario para la inferencia. SmolVLM tiene variantes desde 80M hasta 2B parámetros; no se especifica cuál se usa, por lo que la VRAM exacta no está disponible.
- Dado el tamaño reducido del modelo base, es probable que quepa en GPUs consumer como RTX 3060 (12 GB) o superiores, pero no hay confirmación oficial.
- Para inferencia se recomienda usar una GPU con al menos 8 GB de VRAM si se utiliza el modelo en bfloat16, y más si se procesan lotes grandes de documentos.
- Opciones de despliegue: la librería colpali-engine (basada en Transformers) y Sentence Transformers con el wrapper MultiVectorEncoder. También es posible usar vLLM para el modelo base, aunque la proyección multi-vector requiere lógica adicional.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparación directa. Sin embargo, se puede contextualizar con otros modelos de recuperación visual:

| Modelo | Enfoque | Tamaño | Contexto | Licencia |
|---|---|---|---|---|
| ColSmolVLM-v0.1 | VLM + ColBERT multi-vector | Adaptador 0,2 GB (base no especificada) | no disponible | no disponible |
| ColPali (vidore/colpali-v1.0) | VLM (PaliGemma) + ColBERT | ~3B parámetros | 8192 tokens | Apache 2.0 |
| ColQwen (vidore/colqwen2-v0.1) | VLM (Qwen2-VL) + ColBERT | ~2B parámetros | 32768 tokens | Apache 2.0 |

ColSmolVLM se posiciona como una alternativa más ligera que ColPali, basada en SmolVLM, lo que podría reducir requisitos de hardware, aunque no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Enfoque principal en documentos tipo PDF y en idiomas de altos recursos (inglés); la generalización a otros formatos o lenguas menos representadas puede ser limitada.
- Depende del mecanismo de interacción tardía multi-vector (ColBERT), que requiere ingeniería adicional para adaptarlo a frameworks de vector retrieval estándar que no soportan nativamente este tipo de representación.
- No se ha verificado el comportamiento en producción con documentos muy ruidosos o de baja calidad de escaneo.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con los autores antes de desplegarlo en entornos productivos.
- El entrenamiento se realizó con datos sintéticos generados por Claude-3 Sonnet, lo que puede introducir sesgos en las pseudo-preguntas y afectar la robustez en dominios muy específicos.
- No hay información sobre sesgos algorítmicos o alucinaciones en la generación de embeddings; al ser un modelo de retrieval, no genera texto, pero la calidad de los embeddings puede degradarse en dominios fuera del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/vidore/colsmolvlm-v0.1
- Modelo base: https://huggingface.co/vidore/ColSmolVLM-base
- Paper ColPali: https://arxiv.org/abs/2407.01449
- Repositorio colpali-engine: https://github.com/illuin-tech/colpali
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
