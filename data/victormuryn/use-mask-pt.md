# victormuryn/use-mask-pt

## Resumen

El modelo `victormuryn/use-mask-pt` es un encoder de frases (sentence embeddings) multilingüe, resultado de un fine-tuning de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` sobre el corpus ucraniano UberText 2.0. El entrenamiento emplea una estrategia de augmentación por enmascaramiento (masking) y utiliza "pool targets" como señal de supervisión adicional durante el aprendizaje contrastivo. Forma parte de la colección "Ukrainian Sentence Embeddings" (USE), que explora distintas técnicas de augmentación para mejorar la calidad de los embeddings en ucraniano.

Con 278 millones de parámetros y una arquitectura basada en MPNet (una variante de transformer encoder), este modelo está diseñado para tareas de similitud semántica, búsqueda de frases y clustering. Su relevancia actual radica en que ofrece un embedding multilingüe con especialización en ucraniano, un idioma con pocos recursos disponibles en el ecosistema de modelos de embeddings. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, convertible a otros formatos) |
| Idiomas soportados | Multilingüe (50+ idiomas declarados: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, sk, sl, sq, sr, sv, th, tr, uk, ur, vi, fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `paraphrase-multilingual-mpnet-base-v2`, un encoder MPNet preentrenado multilingüe. MPNet combina técnicas de MLM y permutación de tokens, ofreciendo una representación contextual robusta. El fine-tuning se realizó con un objetivo contrastivo sobre UberText 2.0, un corpus ucraniano de gran tamaño. La augmentación por enmascaramiento consiste en ocultar aleatoriamente tokens de las frases originales para generar pares positivos; además, se utilizan "pool targets" (objetivos de agrupación) que proporcionan una señal de supervisión adicional durante el entrenamiento. Este enfoque busca mejorar la calidad de los embeddings para ucraniano, un idioma con escasez de recursos específicos en este tipo de modelos.

## Capacidades

- Generación de embeddings de frases (sentence embeddings) de alta calidad para ucraniano, con soporte multilingüe heredado del modelo base.
- Similitud semántica entre frases: permite calcular distancias coseno o euclídeas para comparar significado.
- Búsqueda semántica: indexación de documentos y recuperación por similitud semántica, no solo por coincidencia de tokens.
- Clustering y agrupación de textos por contenido temático.
- Clasificación de textos mediante la comparación con representaciones de clases (zero-shot).
- Compatible con la librería `sentence-transformers` y con `text-embeddings-inference` (TEI) para despliegue en producción.

## Casos de uso

- Búsqueda semántica en ucraniano: indexar artículos, noticias o documentos legales en ucraniano y permitir consultas en lenguaje natural, devolviendo resultados por significado, no por palabras clave exactas. El modelo está especializado en ucraniano, lo que mejora la precisión frente a modelos multilingües genéricos.
- Deduplicación de contenidos: detectar artículos duplicados o muy similares en grandes corpus de texto ucraniano (por ejemplo, agregadores de noticias). Los embeddings permiten comparar miles de documentos con coste computacional reducido.
- Sistemas de recomendación de documentos: dado un artículo de interés, encontrar otros relacionados por temática. La similitud coseno de los embeddings es suficiente para recomendar contenidos.
- Clasificación de tickets de soporte: asignar categorías a mensajes de usuarios en ucraniano comparando el embedding del ticket con embeddings de ejemplos etiquetados. Útil en atención al cliente multilingüe.
- Análisis de sentimiento en redes sociales: aunque el modelo no está entrenado específicamente para sentimiento, los embeddings pueden alimentar clasificadores posteriores (regresión logística o MLP) sobre representaciones de frases.
- Agrupación de comentarios o feedback: en plataformas que reciben opiniones en ucraniano, agrupar comentarios por temas recurrentes para priorizar mejoras de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión FP16, el modelo ocupa aproximadamente 556 MB (278M parámetros × 2 bytes). En FP32, ~1,1 GB. Con cuantización a 8 bits, ~278 MB. Estas cifras son estimaciones teóricas basadas en el tamaño de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Para procesamiento por lotes grande, se recomienda una GPU con 6 GB o más (RTX 3060, RTX 4060, etc.).
- Es compatible con GPUs consumer; no requiere hardware especializado.
- Opciones de despliegue: la librería `sentence-transformers` permite ejecución en CPU y GPU. Para producción, se puede usar `text-embeddings-inference` (TEI) de Hugging Face, que ofrece endpoints de embeddings optimizados y es compatible con este modelo. También se puede desplegar con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles de forma oficial. En una GPU consumer moderna (RTX 3060), se espera una latencia de milisegundos por frase (típicamente <10 ms) y un throughput de cientos de frases por segundo, dependiendo del tamaño del lote.

## Comparativa con modelos similares

El modelo pertenece a una colección de embeddings ucranianos (USE) que incluye variantes con distintas augmentaciones (natural, generada, traducción, enmascaramiento, dropout, token-shuffle, combinada, estocástica). No se dispone de datos comparativos numéricos entre estas variantes. Como referencia, el modelo base `paraphrase-multilingual-mpnet-base-v2` es un modelo multilingüe genérico de 278M parámetros, con contexto de 512 tokens (dato no confirmado en la ficha original). Alternativas en el espacio de embeddings ucranianos son escasas; otros modelos multilingües como `intfloat/multilingual-e5-large` o `BAAI/bge-m3` podrían servir como comparación, pero no se dispone de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El modelo está fine-tuneado específicamente sobre corpus ucraniano; aunque el modelo base es multilingüe, el rendimiento en otros idiomas puede verse degradado respecto al ucraniano.
- No se han publicado evaluaciones de sesgos o robustez. El corpus UberText 2.0 puede contener sesgos presentes en el texto web ucraniano.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no presenta alucinación en el sentido generativo. Sin embargo, los embeddings pueden reflejar sesgos semánticos del corpus de entrenamiento.
- La longitud de contexto no está documentada; se recomienda asumir el límite del modelo base (512 tokens típico de MPNet) para evitar truncamientos inesperados.
- No se proporcionan garantías de rendimiento para dominios específicos (legal, médico, etc.). Es recomendable evaluar el modelo en el dominio de aplicación antes de usarlo en producción.
- Al ser un modelo relativamente pequeño (278M), puede superar a modelos más grandes en tareas específicas de ucraniano, pero para tareas multilingües generales puede ser menos competitivo que modelos como E5 o BGE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victormuryn/use-mask-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/victormuryn/wsd-training-dataset
- Colección de embeddings ucranianos: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
