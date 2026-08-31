# victormuryn/use-natural-no-pt

## Resumen

El modelo `victormuryn/use-natural-no-pt` es un fine-tune del modelo multilingüe de embeddings de frases `paraphrase-multilingual-mpnet-base-v2`, desarrollado por Victor Muryn como parte de una colección dedicada a mejorar los embeddings de frases en ucraniano. Este modelo concreto se entrenó sobre el corpus de texto ucraniano UberText 2.0, sin aplicar ninguna técnica de aumentación de datos y sin utilizar "pool targets" (objetivos de agrupación). El resultado es un modelo de similitud semántica que conserva las capacidades multilingües del modelo base, pero optimizado para representar mejor el ucraniano.

Con 278 millones de parámetros y una arquitectura basada en XLM-RoBERTa (a través del modelo base), este embedding model es adecuado para tareas de búsqueda semántica, clustering, similitud de frases y otras aplicaciones de representación de texto. Su relevancia radica en que aborda un idioma con pocos recursos específicos (ucraniano) dentro de un marco multilingüe, manteniendo la licencia Apache 2.0 que permite uso comercial sin restricciones.

El modelo se publica con formato `safetensors`, compatible con la librería `sentence-transformers` y con la infraestructura de Hugging Face para embeddings (text-embeddings-inference). Está disponible para descarga directa y su uso es sencillo mediante la API estándar de SentenceTransformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa base, derivado de paraphrase-multilingual-mpnet-base-v2) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 512 tokens) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion estandar de sentence-transformers (FP16, INT8, etc.) |
| Idiomas soportados | Multilingue (50+ idiomas segun el modelo base), entrenado especificamente en ucraniano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con pickle via sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `paraphrase-multilingual-mpnet-base-v2`, un transformer de tipo MPNet (Masked and Permuted Language Modeling) preentrenado en 50+ idiomas. La arquitectura subyacente es XLM-RoBERTa con 278M parametros, que produce embeddings de frases de 768 dimensiones mediante pooling sobre la salida del token especial `[CLS]` (o el pooling configurado por defecto en sentence-transformers).

El fine-tuning se realizo sobre el corpus ucraniano UberText 2.0, un dataset de texto plano sin etiquetas. Se utilizo un objetivo contrastivo (contrastive objective) para aprender representaciones de frases, pero sin aplicar aumentacion de datos y sin usar "pool targets" (una tecnica que consiste en agrupar frases similares como objetivos de entrenamiento). La ausencia de aumentacion y de pool targets es una variable experimental dentro de la coleccion del autor, que explora como diferentes estrategias de entrenamiento afectan a la calidad de los embeddings en ucraniano.

No se han publicado detalles sobre el numero exacto de tokens de entrenamiento, el numero de epochs, el tamaño de batch o la funcion de perdida concreta. El entrenamiento se realizo sobre el corpus bruto, sin preprocesamiento adicional ni aumentacion.

## Capacidades

- Generacion de embeddings de frases (sentence embeddings) de 768 dimensiones.
- Similitud semantica entre frases, tanto en ucraniano como en otros idiomas multilingues.
- Busqueda semantica y recuperacion de informacion (retrieval) mediante comparacion de coseno.
- Clustering de textos por similitud semantica.
- Clasificacion de textos mediante embeddings como caracteristicas para modelos downstream.
- Soporte de tool calling: no aplicable (modelo de embeddings, no generativo).
- Capacidades multilingues: heredadas del modelo base, que cubre mas de 50 idiomas, aunque el fine-tuning se centra en ucraniano.
- No incluye capacidades de vision, audio ni generacion de texto.

## Casos de uso

- **Busqueda semantica en ucraniano**: dado un corpus de documentos en ucraniano, el modelo permite indexar y recuperar fragmentos relevantes mediante similitud coseno, util en motores de busqueda internos o sistemas de preguntas y respuestas.
- **Clustering de articulos de noticias**: agrupar noticias o publicaciones por tema usando embeddings de frases, facilitando la organizacion automatica de contenido en medios digitales ucranianos.
- **Deteccion de duplicados**: comparar pares de textos (por ejemplo, descripciones de productos o comentarios) para identificar duplicados o variantes casi identicas, gracias a la sensibilidad del modelo a diferencias semanticas.
- **Sistemas de recomendacion basados en contenido**: representar items (libros, articulos, productos) mediante embeddings de sus descripciones y recomendar elementos similares por proximidad vectorial.
- **Analisis de sentimiento y clasificacion de textos**: extraer embeddings de oraciones y alimentar clasificadores lineales o MLP para tareas como analisis de opinion, deteccion de toxicidad o clasificacion de temas, especialmente en ucraniano.
- **Parafraseo y similitud de frases**: evaluar automaticamente si dos frases son semanticamente equivalentes, util en sistemas de evaluacion de respuestas, chatbots o herramientas de reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como MMLU, HumanEval, GSM8K u otras, ya que se trata de un modelo de embeddings y no de un modelo generativo. Tampoco se han reportado resultados en tareas de similitud semantica (por ejemplo, STS) en la model card o en la busqueda web.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 278M parametros. En FP32, el peso ocupa aproximadamente 1,1 GB (tamano del repositorio). En FP16, alrededor de 0,56 GB. Para inferencia con batch pequeno, cabe en GPUs con 2-4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo comodamente. Para batch grandes o despliegue en produccion, se recomienda al menos 8 GB (RTX 3060, RTX 4070) o GPUs de datacenter como A10 o T4.
- **CPU**: tambien es posible ejecutarlo en CPU, aunque la latencia sera mayor. Para uso en CPU, se recomienda cuantizacion a INT8 o FP16 para reducir memoria y acelerar.
- **Opciones de despliegue**: compatible con `sentence-transformers` (Python), `text-embeddings-inference` (TEI), `sentence-transformers` en servidores como Hugging Face Inference Endpoints, y herramientas como `onnxruntime` o `TensorRT` si se convierte el modelo.
- **Latencia y throughput**: no se han publicado mediciones especificas. Para un modelo de 278M parametros en GPU moderna, se esperan latencias del orden de 5-20 ms por frase (dependiendo de la longitud del texto y el batch), con throughput de cientos de frases por segundo en GPUs de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `victormuryn/use-natural-no-pt` | 278M | 512 tokens (base) | Multilingue, foco ucraniano | Apache 2.0 | Fine-tune sin aumentacion ni pool targets |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278M | 512 tokens | Multilingue (50+) | Apache 2.0 | Modelo base, entrenado para parafraseo multilingue |
| `sentence-transformers/distiluse-base-multilingual-cased` | 135M | 512 tokens | Multilingue (50+) | Apache 2.0 | Modelo mas pequeno, basado en DistilBERT, menor calidad pero mas rapido |
| `intfloat/multilingual-e5-base` | 278M | 512 tokens | Multilingue | MIT | Entrenado con datos multilingues diversos, buen rendimiento en retrieval |

Nota: la comparativa se basa en caracteristicas tecnicas y disponibilidad publica; no se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- **Especializacion en ucraniano**: aunque el modelo es multilingue, el fine-tuning se realizo exclusivamente con datos ucranianos. Su rendimiento en otros idiomas puede degradarse respecto al modelo base original, especialmente en tareas que requieren matices semanticos de esos idiomas.
- **Sin datos de evaluacion publicados**: no hay benchmarks que permitan cuantificar la calidad del modelo frente a alternativas. Se recomienda evaluar en el caso de uso concreto antes de desplegarlo en produccion.
- **Contexto limitado**: la longitud maxima de secuencia es de 512 tokens (heredada del modelo base). Para documentos largos, se requiere truncamiento o estrategias de segmentacion.
- **Riesgo de sesgos**: el corpus de entrenamiento UberText 2.0 puede contener sesgos linguisticos o tematicos propios del dominio ucraniano. No se han realizado auditorias de sesgo.
- **Sin soporte de generacion**: el modelo solo produce embeddings; no puede generar texto ni mantener conversaciones.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero no ofrece garantias ni soporte del autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/victormuryn/use-natural-no-pt)
- [Perfil del autor en Hugging Face](https://huggingface.co/victormuryn)
- [Dataset de entrenamiento (wsd-training-dataset)](https://huggingface.co/datasets/victormuryn/wsd-training-dataset)
- [Modelo base: paraphrase-multilingual-mpnet-base-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2)
- [Coleccion Ukrainian Sentence Embeddings (referenciada en la model card)](https://huggingface.co/collections/victormuryn/ukrainian-sentence-embeddings-use)
