# TdelaSelle/PatriLaRS-lat

## Resumen

PatriLaRS-lat es un modelo de embeddings de frases (sentence-transformers) desarrollado por TdelaSelle y obtenido por fine-tuning del encoder latino bowphs/LaBerta. Su función es convertir oraciones en vectores densos para calcular similitud semántica y recuperar pasajes paralelos o relacionados dentro de corpus en latín, con especial orientación a textos bíblicos y patrísticos, como muestran los ejemplos del widget de la model card (pasajes de la Vulgata y de literatura patrística). Se trata, por tanto, de un modelo de representación y recuperación, no de un modelo generativo.

El modelo cuenta con 125.978.112 parámetros (unos 126 millones), un tamaño de repositorio de 0,5 GB en safetensors y una arquitectura de encoder tipo RoBERTa heredada de LaBerta. El entrenamiento se realizó sobre 86.861 pares con la función de pérdida MultiplePositiveMultipleNegativeRankingLoss, una variante de ranking con múltiples negativos habitual en sentence-transformers, y se evaluó en una tarea de information retrieval sobre un conjunto denominado "laberta mpmnrl closed" definido por el propio autor.

Su relevancia actual se enmarca en el procesamiento de lenguas históricas y de bajos recursos: existen muy pocos retrievers densos ajustados específicamente al latín, y herramientas de este tipo son necesarias para buscar, alinear y agrupar grandes volúmenes de texto latino digitalizado (Patrologia Latina, corpus bíblicos, ediciones críticas). El modelo es muy ligero, se puede ejecutar en CPU o en cualquier GPU de consumo y es compatible con Text Embeddings Inference y con endpoints de Hugging Face, aunque su adopción todavía es mínima: cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo RoBERTa (sentence-transformers denso), derivado de bowphs/LaBerta |
| Parametros totales | 125.978.112 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card ni en los metadatos) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible en los metadatos; por modelo base y datos de ejemplo, orientado a latin |
| Licencia | no disponible (el campo de licencia no aparece en la ficha de Hugging Face) |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Funcion de perdida | MultiplePositiveMultipleNegativeRankingLoss |
| Tamano del dataset de entrenamiento | 86.861 ejemplos |
| Tarea declarada | sentence-similarity, feature-extraction, information-retrieval |
| Autor | TdelaSelle |
| Fecha de publicacion | 29 de septiembre de 2026 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RoBERTa reutilizado como modelo de frases mediante sentence-transformers. El punto de partida es bowphs/LaBerta, un modelo de lenguaje enmascarado para latín, y el resultado es un modelo denso que produce una representación vectorial por oración (pooling no documentado). Con 125.978.112 parámetros, el modelo se sitúa en el rango de los encoders base (~126M), lo que explica un repositorio de solo 0,5 GB en safetensors. No se documentan ni la dimensión de salida, ni la estrategia de pooling, ni el número máximo de tokens por secuencia.

El entrenamiento se realizó con la pérdida MultiplePositiveMultipleNegativeRankingLoss sobre 86.861 ejemplos, un volumen coherente con tareas de recuperación y similitud en dominios especializados. La model card está generada automáticamente por el Trainer, por lo que no incluye detalles sobre la composición del corpus, el número de tokens vistos, técnicas de filtrado ni procesos de ajuste adicionales (no aplica RLHF ni DPO en un modelo de embeddings). La evaluación declarada se realizó sobre el conjunto "laberta mpmnrl closed", definido por el propio autor, con métricas de accuracy, precision y recall a distintos valores de k; no se describe el protocolo de construcción de negativos ni el tamaño del conjunto de evaluación.

## Capacidades

- Generación de embeddings densos de frases en latín para similitud semántica, con soporte nativo de la librería sentence-transformers.
- Recuperación de información (information retrieval) mediante similitud coseno, evaluada con accuracy, precision y recall hasta k=10.
- Detección de pasajes paralelos o intertextuales en corpus latinos (citación bíblica en textos patrísticos, formulaciones repetidas).
- Extracción de características (feature-extraction) para pipelines de clasificación, clustering o deduplicación.
- Indexación vectorial y búsqueda semántica sobre grandes colecciones de texto latino.
- Compatibilidad con Text Embeddings Inference (etiqueta text-embeddings-inference) y con endpoints de Hugging Face (etiqueta endpoints_compatible).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento: es exclusivamente un modelo de representación.
- Capacidad multilingüe: no disponible; los datos de ejemplo son íntegramente latinos y no se declaran otros idiomas.
- No genera texto, por lo que no produce alucinaciones en el sentido generativo, aunque sí puede devolver similitudes engañosas.

## Casos de uso

- Búsqueda semántica en corpus patrísticos: indexar los pasajes de una colección como la Patrologia Latina y recuperar los fragmentos más próximos a una consulta en latín, superando la búsqueda por coincidencia exacta de términos y sus variantes morfológicas.
- Detección de intertextualidad y citas bíblicas: comparar cada pasaje de un autor patrístico contra el texto de la Vulgata para localizar citas, alusiones y reelaboraciones, usando las métricas de recall@k como medida de cobertura.
- Minería de bitextos y alineación de ediciones: emparejar automáticamente pasajes correspondientes entre dos ediciones, traducciones latinas o versiones de un mismo texto, generando pares candidatos que después se validan manualmente.
- Deduplicación de corpus digitalizados: agrupar por similitud coseno los fragmentos repetidos o casi repetidos procedentes de OCR, compilaciones y florilegios, reduciendo el ruido antes de entrenar otros modelos.
- Clasificación temática por similitud: etiquetar homilías, comentarios bíblicos o tratados teológicos comparando sus embeddings con los de descripciones de tema predefinidas, sin necesidad de reentrenar un clasificador.
- Recuperación aumentada (RAG) sobre fuentes latinas: usar el modelo como retriever en un pipeline en el que un LLM generativo redacta la respuesta final en otra lengua a partir de los pasajes latinos recuperados.
- Apoyo a la investigación filológica: medir la proximidad estilística o formulística entre autores y obras mediante matrices de similitud sobre los embeddings generados.
- Filtrado en bibliotecas digitales: mejorar motores de búsqueda de colecciones latinas ofreciendo resultados ordenados por relevancia semántica en lugar de por coincidencia literal.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto "laberta mpmnrl closed" (tarea information-retrieval). Ninguno de los valores está verificado (`verified: false`):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7971 |
| Cosine Accuracy@3 | 0,8913 |
| Cosine Accuracy@5 | 0,9098 |
| Cosine Accuracy@10 | 0,9256 |
| Cosine Precision@1 | 0,7971 |
| Cosine Precision@3 | 0,3417 |
| Cosine Precision@5 | 0,2153 |
| Cosine Precision@10 | 0,1119 |
| Cosine Recall@1 | 0,6940 |
| Cosine Recall@3 | 0,8331 |
| Cosine Recall@5 | 0,8629 |
| Cosine Recall@10 | 0,8861 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB ni similares) en la información disponible; estos conjuntos no son aplicables a un modelo de embeddings de dominio latino.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 0,5 GB; con activaciones y overhead de inferencia, el consumo se mantiene por debajo de 1,5 GB. En fp16 bajaría a unos 0,25 GB y en int8 a unos 0,13 GB, aunque estas conversiones no están publicadas como artefactos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090, T4, L4, A10, A100, H100). El modelo no requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, e incluso en CPU para indexación por lotes con un throughput aceptable para corpus de tamaño moderado.
- Opciones de despliegue: sentence-transformers (vía Python), Hugging Face Text Embeddings Inference (TEI), exportación a ONNX con Optimum, servidores FastAPI propios sobre PyTorch y endpoints de inferencia de Hugging Face (etiqueta endpoints_compatible).
- vLLM: no confirmado para esta arquitectura concreta; no hay documentación al respecto.
- llama.cpp u Ollama: no disponibles, ya que no se publican pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se conocen resultados comparables publicados sobre el mismo conjunto de evaluación ("laberta mpmnrl closed"), por lo que la comparación numérica directa no es posible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| PatriLaRS-lat | 125.978.112 | no disponible | latin (dominio) | no disponible | IR propio, autodeclarado y no verificado |
| bowphs/LaBerta (modelo base) | no disponible | no disponible | latin | no disponible | no disponible |
| LatinBERT (Bamman y Burns, 2019) | no disponible | no disponible | latin | no disponible | no comparables con el conjunto usado aqui |
| TdelaSelle/PatriLaRS (modelo hermano) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en la ficha de Hugging Face, no se puede asumir permiso de uso comercial; es necesario contactar con el autor antes de integrarlo en un producto.
- Benchmarks autodeclarados y no verificados (`verified: false`), sobre un conjunto de evaluación definido por el propio autor y sin protocolo detallado, lo que impide reproducir la evaluación ni comparar con otros modelos.
- Modelo muy poco validado por la comunidad: cero descargas y cero likes, sin citas ni validaciones independientes conocidas.
- Sesgo de dominio: entrenado sobre textos bíblicos y patrísticos, puede asignar similitudes elevadas a pasajes que comparten vocabulario religioso o fórmulas fijas aunque su contenido semántico difiera.
- Los embeddings no generan texto, por lo que el riesgo de alucinación clásico no aplica, pero la similitud coseno puede inducir a error en la recuperación si se interpreta sin validación humana.
- Idiomas soportados no documentados: no hay garantía de rendimiento fuera del latín, y los corpus latinos con ortografía normalizada o medieval podrían comportarse de forma distinta a los textos de entrenamiento.
- Longitud de contexto no documentada: los textos largos probablemente tengan que dividirse en fragmentos antes de calcular los embeddings, y no se especifica el límite máximo de tokens.
- Trazabilidad limitada del entrenamiento: no se publican la composición del dataset, el número de tokens, la estrategia de negativos ni el pooling utilizado, lo que dificulta diagnosticar errores.
- Rendimiento fuera de dominio sin evaluar: no hay métricas para tareas como clustering, clasificación o detección de paráfrasis en otros corpus latinos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TdelaSelle/PatriLaRS-lat
- Modelo hermano de la misma autora: https://huggingface.co/TdelaSelle/PatriLaRS
- Modelo base LaBerta: https://huggingface.co/bowphs/LaBerta
- Perfil del autor en Hugging Face: https://huggingface.co/TdelaSelle
- Repositorio GitHub PatriBERT: https://github.com/Tdelaselle/PatriBERT
- Ficha en Free2AITools: https://free2aitools.com/model/tdelaselle/patrilars
- Articulo Sentence-BERT (referenciado en las etiquetas del modelo): https://arxiv.org/abs/1908.10084
