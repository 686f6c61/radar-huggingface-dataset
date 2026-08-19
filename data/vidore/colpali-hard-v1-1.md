# vidore/colpali-hard-v1.1

## Resumen

ColPali es un modelo de recuperación visual de documentos desarrollado por el equipo Vidore, que combina un modelo de lenguaje y visión (VLM) con la estrategia de interacción tardía de ColBERT. Se basa en PaliGemma-3B, un VLM de Google, y genera representaciones multi-vector tanto para consultas de texto como para imágenes de páginas de documentos, lo que permite indexar documentos directamente a partir de sus características visuales sin necesidad de extraer texto mediante OCR. Esta versión concreta, `colpali-hard-v1.1`, incorpora dos mejoras sobre el ColPali original: el uso de *right padding* en la codificación de consultas para evitar tokens no deseados y la aplicación de *hard negative mining* durante el entrenamiento, además de partir de un checkpoint base fijado (`vidore/colpaligemma-3b-mix-448-base`) que garantiza una inicialización determinista de la capa de proyección.

El modelo fue presentado en el artículo "ColPali: Efficient Document Retrieval with Vision Language Models" (arXiv:2407.01449) y está disponible bajo licencia MIT. Su tamaño de repositorio es de 0,3 GB, con pesos en formato safetensors. Está diseñado específicamente para tareas de recuperación de documentos visuales, como la búsqueda en PDFs, presentaciones o capturas de pantalla, y se integra con librerías como Sentence Transformers y el propio motor de ColPali.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma-3B con estrategia ColBERT (multi-vector) |
| Parametros totales | no disponible (basado en PaliGemma-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColPali se construye a partir de un codificador de vision SigLIP cuyos *patch embeddings* se alimentan a un modelo de lenguaje PaliGemma-3B. Esta arquitectura permite mapear los parches de imagen a un espacio latente similar al de las consultas de texto, habilitando la interacción tardía estilo ColBERT entre tokens de texto y parches de imagen. El resultado es un modelo que produce una representación multi-vector para cada consulta y cada documento, y la similitud se calcula mediante *MaxSim* (máximo de similitud coseno entre vectores). El modelo fue entrenado durante una época con un dataset de 127.460 pares consulta-página, compuesto por un 63% de conjuntos de datos académicos abiertos y un 37% de datos sintéticos generados a partir de páginas de PDFs obtenidos por *web crawling* con pseudo-preguntas creadas por Claude-3 Sonnet. Todo el entrenamiento se realizó en inglés, con *bfloat16*, adaptadores LoRA (alpha=32, r=32) en las capas del transformer y en la capa de proyección final, optimizador `paged_adamw_8bit`, tasa de aprendizaje de 5e-5 con decaimiento lineal y *warmup* del 2,5%, y un *batch size* de 32 en 8 GPUs.

La versión `hard-v1.1` introduce dos cambios clave: el uso de *right padding* para las consultas, que corrige la aparición de tokens no deseados en la codificación, y el *hard negative mining* para mejorar la discriminación entre documentos similares. Además, parte del checkpoint `vidore/colpaligemma-3b-mix-448-base` ya corregido, lo que asegura una inicialización determinista de la capa de proyección.

## Capacidades

- Recuperación visual de documentos: indexa páginas completas (imágenes) y las relaciona con consultas textuales sin necesidad de OCR.
- Generación de representaciones multi-vector estilo ColBERT: cada consulta y cada documento se representan como un conjunto de vectores de 128 dimensiones, permitiendo interacción tardía.
- Búsqueda por similitud semántica visual: puede encontrar documentos relevantes basándose en características visuales como gráficos, tablas, diagramas o maquetación.
- Integración con Sentence Transformers mediante `MultiVectorEncoder`, lo que facilita su uso en pipelines de *embedding* estándar.
- Compatibilidad con el motor de ColPali (`colpali-engine`) para indexación y búsqueda a gran escala.
- Soporte para procesamiento de imágenes a resolución 448x448 (heredado de PaliGemma-3B).
- Entrenado exclusivamente en inglés, aunque el modelo base puede tener cierta capacidad multilingüe residual.

## Casos de uso

- Búsqueda en archivos PDF corporativos: permite indexar documentos escaneados o digitalizados sin extraer texto, facilitando la búsqueda por contenido visual como logotipos, gráficos o tablas.
- Recuperación de diapositivas de presentaciones: un equipo de ventas puede buscar diapositivas específicas por su diseño o contenido gráfico para reutilizarlas en nuevas propuestas.
- Indexación de capturas de pantalla y documentos de diseño: los equipos de producto pueden buscar referencias visuales en un repositorio de imágenes de interfaces de usuario.
- Asistentes de atención al cliente con base de conocimiento visual: un chatbot puede recuperar manuales o guías ilustradas relevantes para responder consultas de usuarios sobre productos.
- Verificación de duplicados en bibliotecas de documentos: detectar documentos visualmente similares en grandes repositorios para evitar redundancias.
- Búsqueda en documentos históricos o manuscritos: donde el OCR falla, la recuperación visual permite encontrar páginas por su estructura o ilustraciones.
- Integración en sistemas RAG (Retrieval-Augmented Generation) para documentos con alto contenido gráfico: el modelo puede proporcionar fragmentos visuales relevantes a un LLM para generar respuestas contextualizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente esa cantidad (probablemente en bfloat16 o fp16).
- Al estar basado en PaliGemma-3B, se estima que el modelo tiene alrededor de 3 mil millones de parámetros, aunque no se confirma explícitamente.
- Para inferencia en bfloat16, se necesitaría un mínimo de 6-8 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como una RTX 3060 12GB o superior.
- Para despliegue en producción con múltiples consultas concurrentes, se recomienda una GPU profesional como A100 (40GB) o H100, o usar cuantización adicional si estuviera disponible.
- Las opciones de despliegue incluyen Sentence Transformers con `MultiVectorEncoder`, el motor `colpali-engine` (que soporta indexación y búsqueda eficiente), y posiblemente vLLM o TGI si se adapta, aunque no hay documentación oficial al respecto.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de recuperación visual. Se puede mencionar que la familia ColPali incluye variantes como `vidore/colpali-v1.1` y `vidore/colpali-v1.0`, que difieren en el padding y el *hard negative mining*. Otros enfoques de recuperación visual incluyen modelos basados en OCR tradicional combinados con *embeddings* de texto, pero no se dispone de métricas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que su rendimiento en otros idiomas puede ser limitado, aunque el modelo base PaliGemma-3B podría aportar cierta capacidad multilingüe residual.
- La recuperación se basa en características visuales; documentos con texto denso pero sin elementos gráficos distintivos pueden no ser indexados de forma óptima.
- El tamaño del contexto no está documentado; se recomienda validar el comportamiento con documentos muy largos.
- No se han publicado benchmarks oficiales para esta versión específica, por lo que su rendimiento comparativo no está verificado.
- Al ser un modelo relativamente reciente (agosto de 2024), puede haber cambios en las librerías de integración que afecten a la reproducción exacta de los resultados.
- La licencia MIT permite uso comercial sin restricciones, pero se debe atribuir el crédito correspondiente.
- El uso de *hard negative mining* puede hacer que el modelo sea más sensible a la calidad de los ejemplos negativos durante el entrenamiento, aunque esto no afecta a la inferencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vidore/colpali-hard-v1.1)
- [Artículo ColPali (arXiv)](https://arxiv.org/abs/2407.01449)
- [Artículo ColBERT (arXiv)](https://arxiv.org/abs/2004.12832)
- [Artículo LoRA (arXiv)](https://arxiv.org/abs/2106.09685)
- [Repositorio original de ColPali en GitHub](https://github.com/ManuelFay/colpali)
- [Colección de modelos ColPali en Hugging Face](https://huggingface.co/collections/vidore/colpali-models)
