# victormuryn/use-generated-pt

## Resumen

El modelo `victormuryn/use-generated-pt` es un fine-tuning del modelo multilingüe de embeddings de frases `paraphrase-multilingual-mpnet-base-v2` (basado en XLM-RoBERTa), entrenado específicamente para mejorar la calidad de los embeddings de oraciones en ucraniano. Lo desarrolla Victor Muryn como parte de la colección "Ukrainian Sentence Embeddings", que explora distintas estrategias de aumentación de datos y supervisión para el entrenamiento contrastivo de embeddings.

Este modelo concreto utiliza un corpus de texto ucraniano (UberText 2.0) con aumentación generada (es decir, frases sintéticas producidas por un modelo generativo) y "pool targets", un mecanismo de supervisión adicional durante el entrenamiento contrastivo. El objetivo es abordar la escasez de datos de entrenamiento de alta calidad para el ucraniano en tareas de similitud semántica y recuperación de información.

La relevancia actual radica en que los modelos de embeddings multilingües suelen estar dominados por lenguas con muchos recursos, y este trabajo contribuye a mejorar la representación del ucraniano, un idioma con menos datos disponibles. El modelo tiene 278 millones de parámetros, soporta más de 50 idiomas, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa base) con pooling mean sobre tokens |
| Parametros totales | 278.043.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de paraphrase-multilingual-mpnet-base-v2) |
| Tipos de cuantizacion | no disponible (modelo en safetensors, se puede cuantizar con herramientas externas) |
| Idiomas soportados | Multilingüe: ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, sk, sl, sq, sr, sv, th, tr, uk, ur, vi (50+ incluyendo variantes como fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `paraphrase-multilingual-mpnet-base-v2`, que a su vez deriva de XLM-RoBERTa (arquitectura transformer encoder-only con atención bidireccional). La capa de pooling utilizada es la media de los tokens de salida (mean pooling), estándar en sentence-transformers. El modelo original fue preentrenado con un objetivo de enmascarado de tokens en 50+ idiomas, y posteriormente fine-tuned con pares de frases parafraseadas.

Para este fine-tuning, se utilizó el corpus ucraniano UberText 2.0, que contiene aproximadamente 11 millones de documentos y más de 100 millones de frases. La estrategia de aumentación "generated" consiste en generar frases sintéticas adicionales mediante un modelo de lenguaje generativo, con el objetivo de aumentar la diversidad de ejemplos de entrenamiento y cubrir palabras polisémicas subrepresentadas. Además, se emplearon "pool targets", un mecanismo que añade una señal de supervisión extra durante el entrenamiento contrastivo, probablemente basado en agrupar ejemplos similares o en usar prototipos de clase. No se especifica si se usó RLHF o DPO; el método es contrastivo (típicamente con pérdida tipo triplet o contrastive loss).

No se han publicado detalles adicionales sobre hiperparámetros, número de pasos de entrenamiento o composición exacta del dataset aumentado en la información disponible.

## Capacidades

- Generación de embeddings de frases (sentence embeddings) de alta calidad, especialmente optimizados para ucraniano.
- Similitud semántica entre frases: cálculo de similitud coseno entre vectores.
- Búsqueda semántica y recuperación de información (retrieval) en corpus multilingües.
- Soporte de más de 50 idiomas, con especial énfasis en ucraniano gracias al fine-tuning.
- Compatible con el ecosistema sentence-transformers, lo que permite usarlo en pipelines de búsqueda, clustering, clasificación de texto y deduplicación.
- Capacidad de extracción de características (feature extraction) para downstream tasks.
- No soporta tool calling ni razonamiento multi-paso (es un modelo de embeddings, no generativo).
- No tiene capacidades de visión ni audio.

## Casos de uso

- Búsqueda semántica en documentos ucranianos: indexar artículos, informes o páginas web en ucraniano y permitir búsquedas por similitud semántica en lugar de solo coincidencia de palabras clave. El modelo genera embeddings que capturan el significado, mejorando la precisión en consultas coloquiales o parafraseadas.
- Sistemas de recomendación de contenido: comparar embeddings de artículos o noticias en ucraniano para sugerir contenido relacionado. La ventana de 512 tokens permite procesar párrafos completos.
- Clasificación de texto multilingüe: usar los embeddings como características de entrada para clasificadores (p. ej., análisis de sentimiento, detección de temas) en ucraniano y otros idiomas, aprovechando el preentrenamiento multilingüe.
- Deduplicación de documentos: detectar duplicados o versiones casi idénticas en grandes corpus ucranianos (p. ej., archivos legales o periodísticos) mediante umbrales de similitud coseno.
- Agrupación (clustering) de conversaciones o comentarios: agrupar mensajes de foros o redes sociales en ucraniano por tema o intención, útil para moderación o análisis de tendencias.
- Sistemas de preguntas y respuestas (QA) basados en recuperación: integrar el modelo como retriever en pipelines RAG para responder preguntas sobre documentación ucraniana, combinando embeddings de consultas y pasajes.
- Evaluación de similitud de frases en aplicaciones de traducción automática: comparar la salida de un traductor con una referencia para medir calidad, aunque requiere adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de embeddings (p. ej., STS, MTEB). El autor menciona que la colección explora diferentes estrategias, pero no aporta números comparativos en la documentación pública.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 278M de parámetros en fp32 (~1.1 GB). En cuantización FP16 o BF16, el uso de VRAM sería aproximadamente 0.6 GB para los pesos, más memoria para activaciones (dependiendo del batch y longitud de secuencia). En la práctica, puede ejecutarse en GPU con 2-4 GB de VRAM sin problemas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o GPUs de datacenter como T4 o A10. Para producción con alto throughput, una T4 o A100 sería adecuada.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna con 4 GB o más. También puede ejecutarse en CPU para inferencia de lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: compatible con sentence-transformers, Transformers, y puede servirse mediante Text Embeddings Inference (TEI) (indicado en los tags), así como con frameworks como vLLM (aunque no es un modelo generativo, TEI es la opción natural). También se puede usar con ONNX Runtime o convertir a GGUF para llama.cpp, aunque no es habitual para embeddings.
- Latencia y throughput: no se han publicado cifras oficiales. Con una GPU T4, se pueden procesar cientos de frases por segundo en lotes de 32-64, dependiendo de la longitud. En CPU, la latencia por frase puede ser de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `victormuryn/use-generated-pt` | 278M | 512 | 50+ | Apache 2.0 | Fine-tuning multilingüe con aumentación generada + pool targets para ucraniano |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278M | 512 | 50+ | Apache 2.0 | Modelo base, entrenado con pares parafraseados multilingües |
| `victormuryn/use-natural-pt` | 278M | 512 | 50+ | Apache 2.0 | Fine-tuning en UberText 2.0 sin aumentación, con pool targets |
| `victormuryn/use-generated-no-pt` | 278M | 512 | 50+ | Apache 2.0 | Fine-tuning con aumentación generada, sin pool targets |

La comparativa se centra en la familia de modelos del mismo autor, ya que no se dispone de benchmarks para comparar con otros modelos de embeddings como `multilingual-e5-large` o `bge-m3`. La diferencia clave entre las variantes es la estrategia de aumentación y el uso de pool targets, que afectan a la calidad de los embeddings en ucraniano. Para elegir entre ellos, sería necesario evaluar en tareas específicas de similitud semántica en ucraniano, aunque no se han publicado resultados.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no puede generar texto, responder preguntas ni realizar razonamiento. Solo produce vectores de frases.
- Enfoque principal en ucraniano: aunque es multilingüe, el fine-tuning se realizó exclusivamente con texto ucraniano, por lo que el rendimiento en otros idiomas puede no mejorar respecto al modelo base y podría degradarse ligeramente en algunos casos.
- Contexto limitado a 512 tokens: las frases o textos más largos deben truncarse, lo que puede perder información relevante en documentos extensos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que este modelo supere a su base o a otras alternativas en tareas estándar. Se recomienda evaluar en el caso de uso concreto antes de adoptarlo.
- Riesgo de sesgos del corpus de entrenamiento: UberText 2.0 proviene de web y puede contener sesgos culturales, de género o políticos propios del contenido ucraniano de internet.
- Alucinación no aplica (no es generativo), pero los embeddings pueden reflejar sesgos semánticos del corpus.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo base (paraphrase-multilingual-mpnet-base-v2) también es Apache 2.0, por lo que no hay problemas de licencia.
- El autor no ha publicado paper ni documentación técnica detallada (solo la model card), por lo que la reproducibilidad es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/victormuryn/use-generated-pt
- Colección de embeddings ucranianos: https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Corpus UberText 2.0: https://lang.org.ua/en/ubertext/
- Otros modelos del autor: https://huggingface.co/victormuryn/models
- Modelo relacionado con aumentación Markov: https://huggingface.co/victormuryn/mpnet-use-markov-pt
