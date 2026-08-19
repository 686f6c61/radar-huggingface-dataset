# vidore/colqwen2.5-v0.1

## Resumen

ColQwen2.5 es un modelo de recuperación visual de documentos desarrollado por el equipo vidore (Illuin Technology). Extiende el modelo de lenguaje y visión Qwen2.5-VL-3B-Instruct con una estrategia de representación multi-vector tipo ColBERT, lo que permite indexar y recuperar documentos a partir de sus características visuales sin necesidad de OCR ni extracción de texto. El modelo procesa imágenes de resolución dinámica sin distorsión de aspecto, generando hasta 768 parches de imagen por documento, lo que mejora la precisión en documentos complejos como PDFs, tablas o gráficos.

La arquitectura combina un encoder visual-lingüístico con un mecanismo de interacción tardía (late interaction) que calcula la similitud entre consultas y documentos mediante MaxSim. Entrenado sobre un conjunto de 127.460 pares consulta-página (63% de datasets académicos abiertos y 37% sintético generado con Claude-3 Sonnet), el modelo está disponible bajo licencia MIT y se integra fácilmente con Sentence Transformers y el ecosistema ColPali. Su relevancia actual radica en ofrecer una alternativa eficiente a los pipelines clásicos de OCR + embeddings para recuperación de información en documentos visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-3B-Instruct + adaptador ColBERT multi-vector (late interaction) |
| Parametros totales | 3B (modelo base, sin contabilizar la proyeccion final) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Ingles (entrenamiento), aunque el modelo base es multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColQwen2.5 se basa en el modelo Qwen2.5-VL-3B-Instruct, al que se le añade una capa de proyección final que genera representaciones multi-vector por documento y consulta. Cada imagen se divide en un máximo de 768 parches (resolución dinámica sin cambio de aspecto), y cada parche produce un vector de 128 dimensiones. La similitud entre consulta y documento se calcula mediante MaxSim, una operación de interacción tardía que suma los máximos de similitud coseno entre los vectores de la consulta y los del documento.

El entrenamiento se realizó durante una época sobre un dataset de 127.460 pares consulta-página, compuesto por un 63% de datasets académicos abiertos y un 37% de páginas web con pseudo-preguntas generadas por Claude-3 Sonnet. Se utilizaron adaptadores LoRA con alpha=32 y r=32 sobre las capas del transformer y la capa de proyección final, en formato bfloat16, con el optimizador paged_adamw_8bit, una tasa de aprendizaje de 5e-5 con decaimiento lineal y un 2.5% de pasos de calentamiento, y un tamaño de lote de 32 distribuido en 8 GPUs. El dataset es exclusivamente en inglés para estudiar la generalización zero-shot a otros idiomas, y se verificó que no hubiera solapamiento con el benchmark ViDoRe.

## Capacidades

- Recuperación de documentos visuales: indexa páginas completas (PDFs, imágenes, capturas) a partir de sus características visuales, sin necesidad de OCR.
- Representaciones multi-vector: genera embeddings densos por parche de imagen, permitiendo búsquedas por similitud semántica y visual.
- Resolución dinámica: acepta imágenes de cualquier tamaño y relación de aspecto, ajustando el número de parches hasta un máximo de 768.
- Integración con Sentence Transformers: soporta la clase `MultiVectorEncoder` para codificar consultas y documentos de forma sencilla.
- Compatibilidad con el ecosistema ColPali: se puede usar con `colpali-engine` para pipelines de retrieval de extremo a extremo.
- Generalización zero-shot: aunque entrenado en inglés, el modelo base multilingüe permite cierto grado de transferencia a otros idiomas.
- Búsqueda multimodal: combina información textual y visual en una misma representación, útil para documentos con gráficos, tablas o diagramas.

## Casos de uso

- Búsqueda semántica en archivos PDF escaneados: el modelo indexa páginas directamente desde su imagen, permitiendo consultas como "¿cuál es la cifra de ingresos en 2023?" sin necesidad de extraer texto previo.
- Recuperación de información en informes financieros y documentos corporativos: al no depender de OCR, maneja tablas y gráficos complejos con mayor robustez que los pipelines tradicionales.
- Sistemas RAG visuales: integración con bases de datos vectoriales para responder preguntas sobre documentación técnica, manuales o patentes a partir de sus representaciones visuales.
- Archivado y organización de documentos históricos: indexación de documentos escaneados o fotografías de archivo para búsquedas por contenido visual y textual.
- Asistentes de atención al cliente con documentación visual: permite recuperar pasajes relevantes de guías ilustradas o capturas de pantalla para responder consultas de usuarios.
- Análisis de capturas de pantalla y UI: búsqueda de elementos específicos en imágenes de interfaces de usuario, útil para testing o documentación de productos.
- Búsqueda en papers científicos: localización de figuras, tablas o secciones concretas en artículos académicos a partir de consultas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo pertenece a la familia ColPali, cuya evaluación se realiza en el benchmark ViDoRe, pero no se incluyen métricas específicas para esta versión en la documentación proporcionada.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. Dado que el modelo base tiene 3B parámetros, se puede inferir que en bfloat16 ocupa aproximadamente 6 GB de VRAM, lo que lo hace ejecutable en GPUs de consumo como RTX 3090 o RTX 4090, así como en GPUs de datacenter (A10, A100). Para despliegue en producción se recomienda usar `colpali-engine` con soporte de Flash Attention 2 y procesamiento por lotes. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa. El modelo más cercano es ColPali original (basado en PaliGemma-3B), pero no se han publicado métricas comparativas en la información proporcionada. Se recomienda consultar el benchmark ViDoRe para evaluaciones independientes.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con documentos en inglés, por lo que su rendimiento en otros idiomas puede degradarse, aunque el modelo base sea multilingüe.
- Está enfocado en documentos tipo PDF y recursos de alta calidad; puede tener un rendimiento inferior en imágenes de baja resolución o con ruido visual.
- No es un modelo generativo: solo produce embeddings para retrieval, no genera texto ni respuestas.
- La versión 0.1 no incluye el prefijo "Query:" en el procesador de `colpali-engine` a partir de la versión 0.3.13, lo que puede causar diferencias en los embeddings si se usa con versiones recientes de la librería.
- Al ser un modelo de retrieval, no está exento de alucinaciones en el sentido de que puede recuperar documentos visualmente similares pero semánticamente irrelevantes si la consulta es ambigua.
- La licencia MIT permite uso comercial sin restricciones, pero se debe verificar la licencia del modelo base Qwen2.5-VL-3B (Apache 2.0) para cumplir con sus términos.

## Enlaces

- HuggingFace: https://huggingface.co/vidore/colqwen2.5-v0.1
- Paper ColPali: https://arxiv.org/abs/2407.01449
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Repositorio oficial: https://github.com/illuin-tech/colpali
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
