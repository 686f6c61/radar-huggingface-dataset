# thealper2/embeddinggemma-2-tr

## Resumen

EmbeddingGemma 2 — Turkish retrieval es un modelo de embeddings de texto afinado a partir de `google/embeddinggemma-2` (Google DeepMind) por el usuario `thealper2`, especializado en búsqueda semántica en turco. El ajuste se realizó con un objetivo contrastivo sobre dos conjuntos públicos de recuperación en turco: MS MARCO-TR (consulta de búsqueda → pasaje web, traducido automáticamente) y MLSUM-TR (titular o resumen de noticia → artículo completo). El resultado es un codificador de 271 millones de parámetros que produce vectores de 768 dimensiones con pooling medio y normalización L2.

Su relevancia radica en que aborda una carencia habitual: los modelos de embeddings de referencia rinden por debajo de lo óptimo en turco, un idioma aglutinante con morfología compleja. El modelo es especialmente práctico por su soporte de Matryoshka Representation Learning (dimensiones 512/256/128), que permite reducir el tamaño de los índices vectoriales sin reentrenar, y por su tamaño contenido, que lo hace viable en GPU de consumo e incluso en CPU para cargas moderadas.

Cabe destacar que se trata de un modelo de solo texto: los codificadores de visión y audio del checkpoint original no se incluyen ni se cargaron durante el entrenamiento. El pipeline asociado en Hugging Face es `sentence-similarity` y la librería de referencia es `sentence-transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional basado en EmbeddingGemma 2 (vía de texto; 24 capas) |
| Parametros totales | 271.002.648 (según safetensors; 271.002.624 declarados en la model card) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son entrenados) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 y float32 (float16 no recomendado: desbordamiento de activaciones); no disponible información sobre cuantizaciones adicionales (GGUF, int8, etc.) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (modelo); datos de entrenamiento con restricciones no comerciales (ver Limitaciones) |
| Formato de pesos | safetensors (1,1 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional de 24 capas heredado de `google/embeddinggemma-2`, del que solo se conserva la vía de texto: embeddings de tokens, las 24 capas bidireccionales, embeddings por capa y una proyección de 512 a 768 dimensiones. La salida es un vector de 768 dimensiones obtenido por pooling medio (incluyendo los tokens de prompt) y normalizado con L2. Gracias a MRL (Matryoshka Representation Learning), los embeddings pueden truncarse a 512, 256 o 128 dimensiones renormalizándose, lo que facilita índices vectoriales más compactos.

El entrenamiento fue un fine-tuning completo (271 M de parámetros entrenables) con un objetivo contrastivo sobre 69.183 filas de (consulta, positivo, negativo duro): 49.504 de MS MARCO-TR (60.000 consultas de entrenamiento disponibles) y 19.679 de MLSUM-TR (30.000 consultas). Cada batch se muestrea de una única fuente de forma proporcional, de modo que los negativos dentro del batch provienen del mismo dominio. Las consultas de validación y test se separan por clúster de documentos para evitar fugas de positivos al conjunto de entrenamiento. El modelo emplea prompts diferenciados en inferencia: `SearchQuery` para consultas y `Document` (`title: none | text: …` o `title: {título} | text: {cuerpo}`) para documentos, y debe usarse con bfloat16 o float32, nunca float16.

## Capacidades

- Generacion de embeddings de 768 dimensiones (mean pooling, L2-normalizados) para similitud semántica en turco.
- Recuperación semántica (retrieval): ranking de pasajes web y artículos de noticias ante consultas en lenguaje natural.
- Embeddings Matryoshka: truncado a 512, 256 o 128 dimensiones con renormalización, útil para búsqueda ANN y compresión de índices.
- Extracción de características (feature extraction) y clustering semántico mediante la librería `sentence-transformers`.
- Cálculo de similitud coseno entre consultas y documentos mediante `model.similarity()`.
- Uso de prompts específicos de tarea (`SearchQuery`, `Document`) que deben respetarse para reproducir el comportamiento de entrenamiento.
- No incluye capacidades de visión ni audio (no se cargaron durante el fine-tuning).
- No es un modelo generativo: no produce texto, ni soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Buscador semántico sobre corpus de noticias en turco: el modelo se entrenó con MLSUM-TR (titular/resumen → cuerpo del artículo), por lo que es adecuado para recuperar artículos relevantes a partir de una consulta o titular.
- Motor de búsqueda interno sobre pasajes web en turco: el entrenamiento con MS MARCO-TR (consulta → pasaje) lo hace idóneo para RAG en turco, generando embeddings de consultas y chunks de documentos para un índice vectorial.
- Deduplicación y agrupamiento de documentos: los embeddings normalizados permiten agrupar artículos o pasajes similares por similitud coseno con coste computacional bajo.
- Sistemas de recomendación de contenido: comparar el embedding de un artículo leído con los del catálogo para recomendar noticias o documentos afines.
- Búsqueda ligera en dispositivo o edge: con 271 M de parámetros y dimensiones Matryoshka de 128, puede desplegarse en hardware modesto manteniendo calidad razonable.
- Clasificación zero-shot o few-shot en turco: los embeddings pueden alimentar un clasificador ligero (por ejemplo, regresión logística sobre los vectores) para tareas de categorización de noticias.
- Detección de duplicados casi idénticos en corpus de prensa: la similitud coseno entre embeddings permite identificar contenido redundante de forma eficiente.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el conjunto MS MARCO-TR + MLSUM-TR held-out queries (Track A), split de test. El propio autor advierte de que no es un benchmark completo de relevancia humana: hay aproximadamente una etiqueta por consulta, por lo que las cifras deben interpretarse como cotas inferiores (no han sido verificadas de forma independiente).

| Metrica | Valor |
|---|---|
| nDCG@10 | 0,8329 |
| MRR@10 | 0,8017 |
| Recall@1 | 0,7185 |
| Recall@10 | 0,9306 |

Rendimiento de codificación medido por el autor:

| Concepto | Valor |
|---|---|
| Codificación de documentos | 178,8 documentos/s |
| Codificación de consultas (p50) | 58,69 ms |
| Búsqueda exacta en GPU | 0,006 ms/consulta |
| Pico de VRAM durante codificación | 8,18 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: el pico medido por el autor durante la codificación fue de 8,18 GiB (presumiblemente en bfloat16 con batches amplios); el checkpoint ocupa unos 1,0-1,1 GiB, por lo que con batches pequeños y bfloat16 deberían bastar GPU con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte bfloat16 (RTX 3060/4060 o superiores, RTX 4090, A100, L4, T4 con float32). No se publican recomendaciones oficiales.
- Consumer GPUs: sí, cabe con holgura en GPUs de consumo de 8 GB o más; en CPU también es viable dado el tamaño (271 M), aunque sin cifras de latencia publicadas.
- Despliegue: `sentence-transformers >= 6.1` con `transformers >= 5.19` (soporte nativo de `EmbeddingGemma2Model`). Compatible con los flujos habituales de sentence-transformers; no hay información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Usar siempre bfloat16 o float32; float16 provoca desbordamiento de activaciones.
- Latencia y throughput: 178,8 documentos/s en codificación y 58,69 ms (p50) por consulta según las mediciones del autor; la búsqueda exacta sobre embeddings en GPU es de 0,006 ms/consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Idioma |
|---|---|---|---|---|---|
| thealper2/embeddinggemma-2-tr | 271 M | 512 tokens | 768 (MRL: 512/256/128) | Apache 2.0 (datos con restricciones) | Turco |
| google/embeddinggemma-2 (base) | no disponible en la información proporcionada | 512 tokens (entrenamiento del derivado) | 768 | no disponible | Multilingüe (incluye turco) |
| BGE-M3 (BAAI) | ~568 M | 8192 tokens | 1024 | MIT | Multilingüe (100+ idiomas) |
| multilingual-e5-large (intfloat) | ~560 M | 512 tokens | 1024 | MIT | Multilingüe |

La ventaja diferencial del modelo frente a los alternativos multilingües es la especialización explícita en recuperación en turco con datos del propio idioma, a costa de un contexto de 512 tokens (frente a los 8192 de BGE-M3) y de un alcance limitado a texto. Los datos de rendimiento de los modelos alternativos no están disponibles en la información proporcionada, por lo que no se ofrece comparación numérica directa.

## Limitaciones y advertencias

- Calidad de los datos de MS MARCO-TR: el conjunto está traducido automáticamente del inglés; algunas consultas y pasajes son artificiales o incorrectos, y los temas siguen la distribución de la búsqueda web en inglés (centrada en EE. UU.).
- Etiquetas de relevancia incompletas: MS MARCO tiene aproximadamente un pasaje etiquetado por consulta y MLSUM exactamente un artículo por titular; otros documentos relevantes cuentan como errores, de modo que los benchmarks son cotas inferiores.
- Dominio limitado: el modelo se optimizó para noticias (MLSUM, 2010-2019) y pasajes web genéricos; otros dominios (legal, médico, técnico) no están optimizados.
- Truncamiento: documentos de más de 512 tokens se truncan; muchos artículos de MLSUM superan esa longitud, lo que puede degradar la calidad de sus embeddings.
- Documentos con título: los documentos con título no se vieron durante el fine-tuning; si se usa el formato `title: {título} | text: {cuerpo}`, se aplica la convención del modelo base sin garantías de rendimiento.
- Sesgos: al heredar datos de búsqueda web traducidos y prensa turca, puede reproducir sesgos temáticos, geográficos y de contenido de esas fuentes; no se han publicado auditorías de sesgo.
- Alucinación: no aplica directamente por tratarse de un modelo de embeddings, pero un retrieval defectuoso puede propagar errores a sistemas RAG aguas abajo.
- Restricciones de licencia para uso comercial: aunque el modelo se publica bajo Apache 2.0, MLSUM está restringido a uso no comercial de investigación (los artículos siguen siendo copyright de los editores) y los términos originales de MS MARCO también son no comerciales. Debe verificarse la compatibilidad legal antes de cualquier despliegue comercial.
- Requisitos de precisión: el uso de float16 está expresamente desaconsejado por desbordamiento de activaciones; usar bfloat16 o float32.
- Métricas no verificadas: los benchmarks proceden del autor y no han sido verificados independientemente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thealper2/embeddinggemma-2-tr
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset MS MARCO-TR: https://huggingface.co/datasets/parsak/msmarco-tr
- Dataset MLSUM: https://huggingface.co/datasets/reciTAL/mlsum
- Model card de EmbeddingGemma 2 (Google DeepMind): https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2
- Paper GradCache (Gao et al., 2021): https://arxiv.org/abs/2101.06983
- Paper Matryoshka Representation Learning (Kusupati et al., 2022): https://arxiv.org/abs/2205.13147
