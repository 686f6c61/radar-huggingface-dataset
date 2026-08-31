# victormuryn/use-stochastic-no-pt

## Resumen

El modelo `victormuryn/use-stochastic-no-pt` es un ajuste fino de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` orientado a la generación de embeddings de frases en ucraniano. Forma parte de la colección Ukrainian Sentence Embeddings de Victor Muryn, que explora cómo distintas estrategias de aumentación de datos afectan a la calidad de los embeddings para esta lengua. En concreto, este modelo se entrena sobre el corpus UberText 2.0 aplicando una aumentación estocástica basada en cadenas de Markov, sin usar objetivos de pool (pool targets).

El modelo hereda la arquitectura XLM-RoBERTa multilingüe del modelo base, con 278 millones de parámetros y una ventana de contexto de 512 tokens. Su pipeline es `sentence-similarity`, es decir, está diseñado para producir representaciones vectoriales de frases que permiten calcular similitud semántica, búsqueda semántica o agrupación por similitud. Aunque el entrenamiento se centra en ucraniano, el modelo conserva las capacidades multilingües del modelo base (50 idiomas), lo que lo hace útil para tareas de transferencia o aplicaciones multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, base) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16) |
| Idiomas soportados | 50 idiomas (ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, sk, sl, sq, sr, sv, th, tr, uk, ur, vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder multilingüe preentrenado con masked language modeling en 100 idiomas. El ajuste fino se realiza con un objetivo contrastivo: dado un par de frases, el modelo aprende a maximizar la similitud coseno entre sus embeddings si son semánticamente equivalentes y a minimizarla si no lo son. La aumentación estocástica basada en cadenas de Markov genera variaciones de las frases originales del corpus UberText 2.0, creando pares positivos sin necesidad de traducciones ni anotaciones humanas.

No se utilizan pool targets, lo que significa que el entrenamiento no incorpora una cabeza de clasificación adicional para predecir la pertenencia a un pool de frases; el modelo se optimiza directamente sobre la función de pérdida contrastiva. Esta estrategia es una de las variantes comparadas dentro de la colección, junto con otras como back-translation, masking, dropout o token shuffling. El corpus de entrenamiento es UberText 2.0, un corpus ucraniano de gran tamaño que incluye textos de diversos dominios.

## Capacidades

- Generacion de embeddings de frases y parrafos cortos (hasta 512 tokens) para tareas de similitud semantica, busqueda y agrupacion.
- Soporte multilingue: aunque entrenado principalmente en ucraniano, conserva la capacidad de procesar los 50 idiomas del modelo base, con peor rendimiento en idiomas no ucranianos.
- Compatible con la libreria sentence-transformers, lo que permite integracion directa en pipelines de busqueda semantica, sistemas de recomendacion o deduplicacion de textos.
- No soporta generacion de texto ni tool calling: es un modelo exclusivamente encoder.
- No incluye capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en corpus ucranianos: se puede indexar un conjunto de documentos en ucraniano y consultar con frases naturales para recuperar los mas relevantes por similitud coseno. Adecuado por su entrenamiento especifico en ucraniano.
- Deduplicacion de contenidos: comparar embeddings de articulos o noticias para detectar duplicados o versiones cercanas, util en agregadores de prensa ucraniana.
- Clasificacion de textos por similitud: agrupar comentarios de usuarios o reseñas por tema usando clustering sobre los embeddings generados.
- Sistemas de preguntas y respuestas basados en recuperacion: integrar como componente de retrieval en un pipeline RAG, donde las respuestas se obtienen de una base de conocimiento ucraniana.
- Analisis de sentimiento por similitud: comparar frases de opinion con prototipos positivos/negativos para asignar polaridad sin entrenar un clasificador.
- Transferencia a otros idiomas eslavos: gracias al multilingueismo base, puede servir como punto de partida para tareas en ruso, polaco o checo con ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La coleccion a la que pertenece el modelo no incluye tablas comparativas de rendimiento en tareas estandar como STS o MTEB. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- Inferencia en CPU: viable para lotes pequenos (por ejemplo, 32 frases de 128 tokens) con latencia de milisegundos por frase. Suficiente para aplicaciones de baja frecuencia.
- VRAM estimada: en fp32, el modelo ocupa ~1,1 GB en memoria; en fp16, ~0,56 GB. Cabe en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 3050).
- GPU recomendada: cualquier GPU moderna de NVIDIA con 4 GB o mas para procesar lotes mayores. Una RTX 3060 o superior ofrece margen comodo.
- Despliegue: compatible con sentence-transformers, Hugging Face Inference Endpoints y Text Embeddings Inference (TEI). Para CPU, puede usarse con ONNX Runtime o directamente con PyTorch.
- Latencia estimada: en GPU (RTX 3090), la codificacion de una frase de 128 tokens tarda ~2-3 ms; en CPU moderna, ~20-30 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| use-stochastic-no-pt | 278M | 512 | 50 | Ucraniano, aumentacion markov | Apache 2.0 |
| paraphrase-multilingual-mpnet-base-v2 (base) | 278M | 512 | 50 | Multilingue, parafrasis | Apache 2.0 |
| LaBSE (google) | 471M | 512 | 109 | Multilingue, traduccion | Apache 2.0 |
| multilingual-e5-small | 118M | 512 | 100 | Multilingue, contrastivo | MIT |

El modelo base paraphrase-multilingual-mpnet-base-v2 es su punto de partida y sirve como referencia directa: el ajuste en ucraniano deberia mejorar el rendimiento en esa lengua a costa de posible degradacion en otras. LaBSE ofrece mayor cobertura de idiomas y mejor rendimiento en tareas bilingues, pero es mas pesado. multilingual-e5-small es mas ligero y con licencia MIT, aunque con menor capacidad. No se dispone de comparativas numericas publicadas para este modelo concreto.

## Limitaciones y advertencias

- Sesgo de idioma: el ajuste fino en ucraniano puede degradar el rendimiento en otros idiomas, especialmente en aquellos no relacionados con el eslavo.
- Alucinacion: al ser un modelo encoder, no genera texto, por lo que el riesgo de alucinacion es inexistente en el sentido clasico, pero si puede producir embeddings poco discriminativos para frases con significado ambiguo o muy similar.
- Limitacion de contexto: ventana maxima de 512 tokens; frases o documentos mas largos deben truncarse o dividirse, lo que puede perder informacion.
- Datos de entrenamiento: el corpus UberText 2.0 es de dominio publico pero puede contener sesgos propios de textos web (coloquialismos, ruido, desequilibrios tematicos).
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base tambien esta bajo esa licencia, sin restricciones adicionales conocidas.
- Sin benchmarks publicos: la ausencia de evaluaciones estandar dificulta la comparacion objetiva con otros modelos; se recomienda validacion propia antes de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/victormuryn/use-stochastic-no-pt
- Coleccion Ukrainian Sentence Embeddings: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
- Perfil del autor: https://huggingface.co/victormuryn
