# victormuryn/use-dropout-no-pt

## Resumen

El modelo `victormuryn/use-dropout-no-pt` es un ajuste fino de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, diseñado para generar embeddings de frases de alta calidad en ucraniano. Fue desarrollado por Victor Muryn como parte de una colección que explora distintas estrategias de entrenamiento para embeddings de frases en ucraniano. El modelo se entrenó sobre el corpus UberText 2.0 con una técnica de aumento de datos basada en dropout, sin usar objetivos de agrupación (pool targets). Esta variante concreta aplica dropout como método de regularización para crear pares positivos durante el entrenamiento contrastivo.

El modelo tiene 278 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. Su relevancia radica en que aborda un idioma con menos recursos (ucraniano) y ofrece una alternativa multilingüe que puede transferir conocimiento de otros idiomas al ucraniano. Al estar basado en MPNet, hereda una arquitectura transformer encoder con atención completa, lo que lo hace adecuado para tareas de similitud semántica, búsqueda y clustering.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (transformer encoder) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado del modelo base, no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors con precision fp32; puede cuantizarse a fp16 o int8 mediante herramientas externas) |
| Idiomas soportados | Multilingue (hereda del base: 50+ idiomas), optimizado para ucraniano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MPNet (Masked and Permuted Language Modeling), una variante de transformer encoder que combina enmascarado y permutación de tokens para aprender representaciones contextuales. El modelo base `paraphrase-multilingual-mpnet-base-v2` ya está entrenado para producir embeddings de frases en múltiples idiomas mediante un objetivo contrastivo. Sobre esta base, se realizó un ajuste fino adicional utilizando el corpus ucraniano UberText 2.0, que contiene más de 3 mil millones de tokens de texto en ucraniano.

La técnica de aumento empleada fue dropout: durante el entrenamiento, se aplica dropout a las representaciones de entrada para generar dos versiones ligeramente diferentes de la misma frase, que se utilizan como par positivo en la pérdida contrastiva. No se usaron "pool targets" (objetivos de agrupación), lo que significa que el modelo no recibe etiquetas de similitud explícitas, sino que aprende a maximizar la similitud entre versiones aumentadas de la misma frase y a minimizarla entre frases distintas. Esta estrategia es común en el aprendizaje contrastivo auto-supervisado.

## Capacidades

- Generación de embeddings de frases de alta dimensionalidad (768 dimensiones) para similitud semántica.
- Soporte multilingüe heredado del modelo base, aunque con especialización en ucraniano.
- Adecuado para tareas de búsqueda semántica, recuperación de información y clustering.
- No soporta tool calling, agentes ni generación de texto; es exclusivamente un modelo de representación (encoder).
- No dispone de modo de pensamiento extendido ni capacidades multimodales.

## Casos de uso

- Búsqueda semántica en ucraniano: permite indexar documentos y consultas en ucraniano y recuperar resultados por similitud semántica en lugar de coincidencia exacta. Se puede integrar en motores de búsqueda internos o en sistemas de preguntas y respuestas.
- Clustering de documentos en ucraniano: agrupa noticias, artículos o mensajes de foros por tema mediante embeddings, útil para análisis de tendencias o moderación de contenido.
- Detección de duplicados: identifica textos duplicados o casi duplicados en bases de datos grandes, por ejemplo en repositorios de documentos legales ucranianos.
- Clasificación de textos: los embeddings generados pueden servir como características de entrada para clasificadores supervisados, como análisis de sentimiento o categorización de soporte técnico.
- Sistemas de recomendación basados en contenido: calcula similitud entre ítems (productos, artículos) usando sus descripciones en ucraniano para sugerir elementos relacionados.
- Recuperación de información multilingüe: aunque está optimizado para ucraniano, hereda capacidades multilingües del modelo base, por lo que puede utilizarse en pipelines que procesan consultas en varios idiomas y documentos en ucraniano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de evaluación sobre conjuntos estándar como MMLU, HumanEval o similares, ya que se trata de un modelo de embeddings y su evaluación típica sería en tareas de similitud semántica (STS) o recuperación, pero no se proporcionan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión fp32, el modelo ocupa aproximadamente 1,1 GB (278M parámetros × 4 bytes). En fp16, unos 556 MB; en int8, unos 278 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Ejemplos: NVIDIA GTX 1050 Ti, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10.
- Es posible ejecutarlo en CPU con razonable latencia para lote pequeño, aunque la GPU acelera el proceso.
- Opciones de despliegue: compatible con la librería `sentence-transformers` (Python), con `text-embeddings-inference` (TEI) para servidores de embeddings de alta concurrencia, y con frameworks como Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. Como referencia, un modelo de este tamaño en GPU T4 suele procesar entre 100 y 300 frases por segundo en batch, dependiendo de la longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| victormuryn/use-dropout-no-pt | 278M | 512 | Multilingüe (optimizado ucraniano) | Apache 2.0 | Ajuste fino con dropout, sin pool targets |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278M | 512 | Multilingüe (50+) | Apache 2.0 | Modelo base, entrenado en paráfrasis multilingüe |
| victormuryn/use-natural-no-pt | 278M | 512 | Multilingüe (optimizado ucraniano) | Apache 2.0 | Variante sin aumento de datos, misma colección |

No se dispone de datos de rendimiento comparativos entre estas variantes. La elección entre ellas dependerá de la estrategia de aumento que mejor se adapte al dominio de aplicación.

## Limitaciones y advertencias

- El modelo está especializado en ucraniano; su rendimiento en otros idiomas puede ser inferior al del modelo base, aunque hereda capacidades multilingües.
- No se han publicado métricas de evaluación, por lo que el rendimiento real en tareas concretas es desconocido.
- El corpus de entrenamiento (UberText 2.0) puede contener sesgos inherentes al contenido de la web ucraniana; se recomienda auditar los embeddings para casos de uso sensibles.
- La longitud de contexto está limitada a 512 tokens; frases más largas deben truncarse, lo que puede perder información.
- Al ser un modelo de embeddings, no genera texto ni interactúa; su uso se limita a producir representaciones vectoriales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar al autor si se publican trabajos derivados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/victormuryn/use-dropout-no-pt)
- [Colección de embeddings ucranianos](https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use)
- [Modelo base: paraphrase-multilingual-mpnet-base-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2)
- [Dataset de entrenamiento: wsd-training-dataset](https://huggingface.co/datasets/victormuryn/wsd-training-dataset)
- [Corpus UberText 2.0](https://lang.org.ua/en/ubertext/)
