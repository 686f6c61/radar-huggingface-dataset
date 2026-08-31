# victormuryn/use-stochastic-pt

## Resumen
El modelo **use-stochastic-pt** es un fine-tuning de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, entrenado sobre el corpus de texto ucraniano **UberText 2.0** con una técnica de aumentación estocástica basada en cadenas de Markov y objetivos de pool (pool targets). Forma parte de la colección *Ukrainian Sentence Embeddings* del autor Victor Muryn, que explora sistemáticamente el efecto de distintas estrategias de aumentación y entrenamiento en la calidad de los embeddings de frases para ucraniano.

El modelo está diseñado para tareas de **similitud semántica de frases** y **extracción de características** (feature extraction), con especial foco en el ucraniano, aunque hereda la capacidad multilingüe del modelo base (más de 50 idiomas). Su arquitectura es un transformer basado en MPNet con 278 millones de parámetros, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en su enfoque experimental: al comparar diferentes estrategias de aumentación (traducción inversa, enmascaramiento, dropout, etc.) dentro de una misma colección, permite a investigadores y desarrolladores evaluar qué técnica produce mejores embeddings para ucraniano, un idioma con recursos relativamente limitados en el ámbito de los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MPNet, encoder) |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, típicamente 512 tokens para MPNet) |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | Multilingüe (50+): ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, sk, sl, sq, sr, sv, th, tr, uk, ur, vi; entrenamiento principal en ucraniano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en **MPNet** (Masked and Permuted Language Modeling), una variante del transformer encoder que combina el enmascaramiento de BERT con la permutación de XLNet, logrando una mejor modelización de dependencias a larga distancia. El modelo base, `paraphrase-multilingual-mpnet-base-v2`, fue entrenado por sentence-transformers sobre más de 50 idiomas con el objetivo de producir embeddings de frases alineados multilingüemente.

El fine-tuning se realizó sobre el corpus **UberText 2.0**, un gran conjunto de datos de texto ucraniano. La técnica de aumentación empleada es **estocástica basada en cadenas de Markov**: se generan frases sintéticas modificando el texto original mediante procesos de Markov, lo que introduce variaciones controladas que sirven como ejemplos positivos en el entrenamiento contrastivo. Además, se utilizaron **pool targets**, una estrategia que agrupa oraciones similares para mejorar la calidad del embedding.

El objetivo de entrenamiento es **contrastivo**: el modelo aprende a acercar representaciones de frases semánticamente relacionadas y a separar las no relacionadas. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades
- **Generación de embeddings de frases**: produce vectores densos de alta dimensionalidad aptos para búsqueda semántica, clustering y similitud coseno.
- **Similitud semántica de frases**: permite calcular la similitud entre dos o más frases, tanto en ucraniano como en otros idiomas del modelo base.
- **Extracción de características**: puede usarse como encoder para pipelines de clasificación, recuperación de información o sistemas de recomendación.
- **Multilingüe**: hereda el soporte multilingüe del modelo base, aunque su entrenamiento específico en ucraniano puede degradar ligeramente el rendimiento en otros idiomas.
- **Compatibilidad con sentence-transformers**: integración directa con la librería, incluyendo soporte para `SentenceTransformer`, `util.pytorch_cos_sim` y demás utilidades.
- **Compatibilidad con Text Embeddings Inference (TEI)**: el modelo es compatible con el servidor de inferencia de Hugging Face para embeddings.

## Casos de uso
- **Búsqueda semántica en ucraniano**: indexar documentos, artículos o noticias en ucraniano y permitir búsquedas por similitud semántica en lugar de coincidencia exacta de términos. El modelo es adecuado por su entrenamiento específico en el corpus UberText 2.0.
- **Sistemas de preguntas y respuestas**: emparejar preguntas de usuarios con respuestas previamente almacenadas en ucraniano mediante similitud coseno de embeddings.
- **Clasificación de textos**: usar los embeddings como características de entrada para clasificadores supervisados, por ejemplo, en análisis de sentimiento o categorización de documentos en ucraniano.
- **Deduplicación de contenidos**: detectar artículos, publicaciones o documentos duplicados o casi duplicados en ucraniano, útil en agregadores de noticias o gestión de contenidos.
- **Evaluación de estrategias de aumentación**: como parte de la colección USE, permite a investigadores comparar el impacto de distintas técnicas de aumentación en la calidad de embeddings, siendo un punto de referencia para experimentos futuros.
- **Sistemas de recomendación**: generar embeddings de ítems (productos, artículos, etc.) y de preferencias de usuario para recomendar contenidos relevantes en ucraniano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como Spearman correlation, MMLU, HumanEval u otros estándares. Al ser un modelo de embeddings, lo habitual sería evaluarlo en tareas de similitud semántica (STS) o recuperación de información, pero no hay datos públicos al respecto.

## Requisitos de hardware
- **VRAM estimada**: al ser un modelo de 278 M parámetros, la inferencia es ligera. Con cuantización de 8 bits cabría en ~300 MB de VRAM; en FP32 ocupa ~1,1 GB (tamaño del repo).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1650, RTX 3060, etc.). También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: sentence-transformers (Python), Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o exportación a ONNX para inferencia optimizada.
- **Latencia y throughput**: no hay datos publicados, pero para un modelo de este tamaño en GPU moderna se esperan latencias de pocos milisegundos por frase y throughput de cientos de frases por segundo.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| **use-stochastic-pt** (este) | 278 M | ~512 | 50+ (entrenado en ucraniano) | Apache 2.0 | Fine-tuning con aumentación Markov + pool targets |
| **paraphrase-multilingual-mpnet-base-v2** (base) | 278 M | ~512 | 50+ | Apache 2.0 | Modelo base sin fine-tuning específico en ucraniano |
| **use-natural-pt** (misma colección) | 278 M | ~512 | 50+ (entrenado en ucraniano) | Apache 2.0 | Fine-tuning sin aumentación, con pool targets |
| **use-generated-pt** (misma colección) | 278 M | ~512 | 50+ (entrenado en ucraniano) | Apache 2.0 | Fine-tuning con aumentación generada, con pool targets |

La comparación directa entre estos modelos solo es posible mediante evaluación en tareas STS en ucraniano, que no está publicada. La colección completa permite aislar el efecto de la estrategia de aumentación manteniendo el resto de variables constantes.

## Limitaciones y advertencias
- **Enfoque principal en ucraniano**: el fine-tuning se realizó exclusivamente sobre texto ucraniano, por lo que el rendimiento en otros idiomas puede verse degradado respecto al modelo base.
- **Sin benchmarks publicados**: no hay métricas objetivas que permitan evaluar su calidad real frente a alternativas.
- **Modelo experimental**: forma parte de una colección de investigación y no ha sido validado en producción; no hay evidencia de uso en aplicaciones reales.
- **Cero descargas y sin comunidad**: el modelo no tiene descargas ni valoraciones, lo que indica que no ha sido probado por terceros.
- **Riesgo de sesgos**: al entrenarse sobre UberText 2.0, puede heredar sesgos presentes en el corpus (por ejemplo, de género, geográficos o temáticos).
- **Alucinaciones**: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente, pero sí puede producir embeddings poco fiables para dominios muy específicos no representados en el corpus.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías de calidad o soporte.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/victormuryn/use-stochastic-pt
- Colección Ukrainian Sentence Embeddings: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
- Perfil del autor: https://huggingface.co/victormuryn
