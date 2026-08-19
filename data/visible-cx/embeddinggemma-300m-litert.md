# visible-cx/embeddinggemma-300m-LiteRT

## Resumen

`visible-cx/embeddinggemma-300m-LiteRT` es un espejo byte-exacto del modelo `litert-community/embeddinggemma-300m`, que a su vez es una conversión a LiteRT (TFLite) del modelo `google/embeddinggemma-300m` de Google. Se trata de un modelo de embeddings de texto de 300 millones de parámetros (308M según el paper original), diseñado para generar representaciones vectoriales densas de 768 dimensiones a partir de texto. Su propósito principal es habilitar tareas de búsqueda semántica, similitud de frases, clasificación y clustering directamente en dispositivos móviles y de borde, sin depender de servidores externos.

El modelo está basado en la familia Gemma 3 y utiliza un encoder de tipo T5Gemma, con una longitud de contexto fija de 512 tokens. El repositorio de `visible-cx` no contiene ningún artefacto nuevo: simplemente re-aloja los dos archivos originales (el `.tflite` y el tokenizador SentencePiece) con verificación de integridad mediante SHA-256. La licencia es Gemma, lo que implica aceptar los términos de uso de Google, la política de usos prohibidos y la licencia Gemma.

La relevancia de este mirror radica en la cadena de suministro: al estar alojado en un repositorio independiente, reduce la dependencia de la disponibilidad del repositorio de `litert-community`. Sin embargo, el propio autor del mirror aclara que no está conectado a ningún flujo de producción y que no se han realizado pruebas de rendimiento sobre estos archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (T5Gemma, basado en Gemma 3) |
| Parametros totales | 300M (denominación comercial; 308M según el paper) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Precision mixta (mixed-precision) |
| Idiomas soportados | No disponible (el paper indica multilingüe, pero no se lista idiomas concretos) |
| Licencia | Gemma (Gemma Terms of Use, Gemma Prohibited Use Policy) |
| Formato de pesos | TFLite / LiteRT (`.tflite`) + tokenizador SentencePiece |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-300m` es un encoder de texto perteneciente a la familia EmbeddingGemma, presentado en el paper "EmbeddingGemma: Powerful and Lightweight Text Representations" (arXiv:2509.20354). Según ese documento, el modelo se construye a partir de la familia Gemma 3, inicializando el encoder desde un encoder T5Gemma y destilando conocimiento desde el modelo Gemini Embedding. Esta receta de entrenamiento permite obtener representaciones de alta calidad con un número reducido de parámetros (308M), optimizado para ejecución en dispositivos cotidianos como teléfonos, portátiles y tablets.

El artefacto LiteRT es una conversión del modelo original al formato TFLite, con precisión mixta y una secuencia máxima de 512 tokens. El repositorio `visible-cx` no incluye información sobre el dataset de entrenamiento ni sobre el proceso de destilación más allá de lo citado. El mirror no realiza ninguna transformación adicional: los archivos son idénticos a los publicados por `litert-community` en la revisión `870cbe05ef460385363c6b574c851ae5d8989ce3`.

## Capacidades

- Generación de embeddings de texto densos de 768 dimensiones, aptos para similitud semántica, recuperación de información, clasificación y clustering.
- Procesamiento de texto multilingüe (según el paper, aunque no se especifica la lista de idiomas en la información disponible).
- Ejecución on-device gracias al formato LiteRT, sin necesidad de conexión a servidores.
- Integración con el runtime LiteRT (versión 2.1.6 en el runtime de Visible) y con la Google AI Edge RAG Library.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de representación de texto.

## Casos de uso

- Búsqueda semántica local en aplicaciones móviles: el modelo permite indexar documentos, notas o mensajes en el dispositivo y recuperarlos por similitud semántica, sin enviar datos a la nube. Su tamaño de 179 MB y su contexto de 512 tokens lo hacen adecuado para bibliotecas de documentos personales.
- Clasificación de texto en tiempo real: por ejemplo, categorización de correos electrónicos o tickets de soporte directamente en el cliente, utilizando los embeddings como entrada a un clasificador ligero.
- Clustering de contenido para organizar automáticamente archivos o fotos con descripciones textuales, agrupando elementos por tema o sentimiento.
- Sistemas RAG (Retrieval-Augmented Generation) en dispositivos de borde: los embeddings generados pueden alimentar un índice vectorial local para responder preguntas sobre documentos privados, combinados con un modelo generativo pequeño.
- Deduplicación de registros: comparar embeddings de textos cortos (como nombres de productos o direcciones) para identificar duplicados con un umbral de similitud coseno.
- Recomendación basada en contenido: generar embeddings de artículos o productos y calcular similitudes para sugerir elementos relacionados, todo ejecutado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El mirror `visible-cx` no incluye mediciones de rendimiento propias, y la única referencia es una similitud coseno de aproximadamente 0.966 entre la versión Core ML y la versión LiteRT, medida sobre textos cortos el 2026-08-11, pero no contra estos archivos exactos. Los benchmarks del modelo base `google/embeddinggemma-300m` están disponibles en el paper (arXiv:2509.20354), pero no se reproducen aquí por no estar incluidos en la información proporcionada.

## Requisitos de hardware

- Tamaño del archivo: 179 MB (modelo `.tflite`) más 4.7 MB del tokenizador SentencePiece.
- Inferencia en CPU: el modelo está diseñado para ejecutarse en dispositivos móviles y de borde; no requiere GPU dedicada.
- Memoria: con 179 MB de pesos, cabe en la mayoría de los smartphones y tablets actuales. El autor del mirror indica que no impone un "memory tier" relevante.
- Runtime: requiere LiteRT (antes TFLite). No es compatible con Core ML ni Core AI (a diferencia de otros artefactos de Visible).
- Despliegue: se puede integrar mediante LiteRT en Android/iOS, o a través de la Google AI Edge RAG Library. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el formato es específico para LiteRT.
- Latencia y throughput: no disponibles; no se han medido en este repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo comparte categoría con otros embeddings ligeros como `all-MiniLM-L6-v2` (80M parámetros, contexto 256) o `bge-small-en` (33M parámetros), pero no hay métricas publicadas en este repositorio que permitan una comparación cuantitativa. El paper de EmbeddingGemma ofrece comparaciones con otros modelos, pero no se incluyen en la información disponible.

## Limitaciones y advertencias

- Longitud de contexto fija de 512 tokens: textos más largos deben truncarse o dividirse, lo que puede perder información.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google, incluyendo la política de usos prohibidos. Es obligatorio cumplir con el Gemma Prohibited Use Policy.
- El repositorio `visible-cx` es un mirror sin verificación de ejecución: los archivos son idénticos a los de `litert-community`, pero no se ha realizado ninguna prueba de inferencia sobre esta copia.
- Riesgo de alucinación no aplica (no genera texto), pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento del modelo base.
- No hay información sobre idiomas específicos soportados, aunque el paper afirma capacidad multilingüe; se recomienda validar en el idioma objetivo antes de producción.
- El modelo está optimizado para on-device; no se recomienda para tareas que requieran contexto muy largo o alta precisión en dominios especializados sin fine-tuning adicional.

## Enlaces

- Repositorio del mirror: https://huggingface.co/visible-cx/embeddinggemma-300m-LiteRT
- Repositorio original de litert-community: https://huggingface.co/litert-community/embeddinggemma-300m
- Modelo base de Google: https://huggingface.co/google/embeddinggemma-300m
- Paper de EmbeddingGemma: https://arxiv.org/html/2509.20354v3
- Documentación oficial de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/embeddinggemma-300m-litert-community
