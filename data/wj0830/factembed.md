# WJ0830/factembed

## Resumen

FactEmbed es un modelo de recuperación de imágenes compuestas (Composed Image Retrieval, CIR) desarrollado por WJ0830 y construido sobre el modelo multimodal Qwen2.5-VL-7B-Instruct. La tarea CIR consiste en recuperar una imagen objetivo a partir de una imagen de referencia y un texto de modificación; FactEmbed aborda esta tarea desacoplando la comprensión de la consulta compuesta de la construcción del embedding discriminativo, mediante un conjunto de latentes factorizados que simulan las modificaciones visuales pretendidas a través de un objetivo intermedio de imaginación del objetivo.

El modelo introduce una arquitectura de embeddings factorizados sobre un transformer multimodal de 7.000 millones de parámetros, entrenada con una pérdida contrastiva a nivel de factor y con destilación de las representaciones descompuestas hacia una capa de atención más profunda del MLLM. Para la inferencia eficiente, retiene el token [EOS] como embedding global y utiliza el mean-pooling de los latentes factorizados para reordenar una lista corta de candidatos, ambos producidos en la misma pasada hacia delante.

Es relevante porque propone un uso más profundo de la capacidad composicional de los MLLM en recuperación multimodal, superando según el autor a trabajos previos en los benchmarks de CIR (FashionIQ y CIRR). El repositorio tiene un tamaño de 0,6 GB, licencia Apache 2.0 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (MLLM) basado en Qwen2.5-VL-7B-Instruct, con embeddings factorizados y destilación a capa de atención profunda |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-VL-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FactEmbed parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal de 7.000 millones de parámetros, y le añade un mecanismo de latentes factorizados que modelan explícitamente las modificaciones visuales implícitas en la consulta compuesta (imagen de referencia más texto de modificación). En lugar de proyectar directamente la consulta compuesta en un único embedding mediante supervisión contrastiva, el modelo resuelve primero la modificación visual pretendida mediante un objetivo de imaginación del objetivo (target-imagination), lo que fuerza a los latentes a anclarse en la semántica del objetivo antes de formar representaciones discriminativas para la recuperación.

El entrenamiento se organiza en tres etapas: una etapa 1 de calentamiento con el objetivo de imaginación del objetivo; una etapa 2 de entrenamiento conjunto que combina recuperación, imaginación y destilación; y una etapa 3 de post-entrenamiento con tripletas aumentadas, que es el modelo final reportado en el paper. Se optimiza una pérdida contrastiva a nivel de factor y se destilan las representaciones descompuestas en una capa de atención más profunda del MLLM. Para la inferencia, se conserva el token [EOS] para el embedding global y se emplea el mean-pooling de los latentes factorizados para reordenar una lista corta de candidatos, sin coste adicional al provenir de la misma pasada hacia delante. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de los benchmarks FashionIQ y CIRR.

## Capacidades

- Recuperación de imágenes compuestas (CIR): dado un par imagen de referencia más texto de modificación, devuelve la imagen objetivo más afín.
- Comprensión composicional multimodal: razona sobre la modificación textual aplicada a la imagen de referencia antes de construir el embedding.
- Imaginación del objetivo: genera latentes factorizados que simulan la imagen objetivo pretendida como paso intermedio.
- Embedding global mediante token [EOS] y reordenación de candidatos mediante mean-pooling de latentes factorizados en una sola pasada.
- Capacidades heredadas del modelo base Qwen2.5-VL-7B-Instruct (procesamiento de imagen y texto), si bien no se detallan en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda visual en comercio electrónico de moda: un usuario sube una prenda de referencia y describe un cambio ("el mismo vestido pero en azul marino y manga larga"); FactEmbed recupera los productos que coinciden con la modificación, aprovechando su entrenamiento específico en FashionIQ.
- Recomendación de estilo personalizada: a partir de una imagen de referencia del armario del usuario y una modificación textual, el sistema sugiere prendas o combinaciones afines, usando el embedding global del token [EOS] para la recuperación inicial y la reordenación con latentes factorizados para refinar.
- Catalogación y etiquetado de inventario visual: dado un producto de referencia y una descripción de variante (color, tejido, corte), localizar en el catálogo la variante correspondiente, reduciendo la intervención manual en la gestión de SKU.
- Búsqueda por ejemplo en plataformas de contenido: localizar imágenes similares con modificaciones concretas (misma escena pero de noche, mismo objeto pero desde otro ángulo) para motores de búsqueda visual internos.
- Evaluación y anotación de datasets de recuperación: usar el modelo para pre-anotar pares de referencia-modificación-objetivo en la construcción de nuevos conjuntos de datos de CIR, aprovechando su capacidad de imaginación del objetivo.
- Filtrado y moderación de contenido visual: recuperar imágenes que cumplan una modificación textual concreta sobre una referencia para revisiones de cumplimiento o búsquedas forenses dentro de un archivo de imágenes.
- Integración en pipelines de búsqueda multimodal: desplegar el modelo como servicio de embeddings para recuperación de dos etapas (recuperación por embedding global y reordenación por latentes factorizados) con una única pasada de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que FactEmbed supera a trabajos previos en los benchmarks de CIR (FashionIQ y CIRR), pero no se incluyen las cifras concretas (R@1, R@5, R@10, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo de 7.000 millones de parámetros en safetensors, la inferencia en precisión completa requeriría del orden de 14-16 GB de VRAM solo para pesos, más memoria para activaciones y procesamiento de imagen.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría esperar GPUs de 24 GB o superiores (RTX 4090, A100, H100) para precisión completa, si bien no se confirma en la model card.
- Cabeza en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: la model card proporciona scripts de evaluación (`scripts/eval/eval_fashioniq.sh` y `scripts/eval/eval_cirr.sh`) dentro del código de release; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables en la información proporcionada. La model card menciona que FactEmbed supera a trabajos previos de CIR basados en MLLM, pero no identifica modelos alternativos concretos ni sus métricas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FactEmbed (WJ0830) | 7.000 M (base Qwen2.5-VL-7B-Instruct) | no disponible | apache-2.0 | Hugging Face (WJ0830/factembed) |
| Alternativas de CIR | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en recuperación de imágenes compuestas: no está pensado como modelo generativo de propósito general, aunque herede el backbone de Qwen2.5-VL-7B-Instruct.
- Entrenado y evaluado en FashionIQ y CIRR: el dominio principal es moda y recuperación de imágenes; el rendimiento fuera de estos dominios no está documentado.
- Sin datos publicados de sesgos, tasas de alucinación ni robustez fuera de distribución.
- Idiomas soportados no especificados: no se confirma el comportamiento multilingüe del texto de modificación.
- Longitud de contexto no documentada, lo que dificulta planificar el despliegue con consultas o descripciones largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base Qwen2.5-VL-7B-Instruct.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- Los checkpoints de las etapas 1 y 2 se publican solo para reproducibilidad; para recuperación debe usarse la etapa 3.
- No se detallan requisitos de hardware ni opciones de cuantización, lo que complica la estimación de costes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WJ0830/factembed
- Demo (Space): https://huggingface.co/spaces/WJ0830/factembed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
