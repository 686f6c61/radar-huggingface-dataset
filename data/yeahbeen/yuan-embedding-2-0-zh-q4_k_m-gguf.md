# yeahbeen/Yuan-embedding-2.0-zh-Q4_K_M-GGUF

## Resumen

El modelo `yeahbeen/Yuan-embedding-2.0-zh-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo de embeddings `IEITYuan/Yuan-embedding-2.0-zh`, realizada por el usuario yeahbeen mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de un modelo de representación vectorial de texto en chino, diseñado para tareas de búsqueda semántica, similitud y recuperación de información. La cuantización Q4_K_M reduce el tamaño del modelo a 0,2 GB, lo que permite su ejecución en entornos con recursos limitados, como CPU o GPUs de baja capacidad.

El modelo original, desarrollado por IEITYuan, está pensado para el procesamiento de lenguaje natural en chino, y esta versión cuantizada facilita su despliegue en producción mediante herramientas compatibles con GGUF, como llama.cpp, llama-server o cualquier runtime que soporte este formato. Al ser un modelo de embeddings, no genera texto, sino que produce vectores densos que representan el significado semántico de las frases o documentos de entrada.

La relevancia de esta ficha radica en que ofrece una opción ligera y de código abierto (licencia Apache 2.0) para sistemas de búsqueda y clasificación en chino, con un tamaño de parámetros de aproximadamente 324 millones, lo que lo sitúa en una gama media-baja en cuanto a capacidad, pero con un coste computacional muy reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 324.472.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `IEITYuan/Yuan-embedding-2.0-zh`. Dado que se trata de un modelo de embeddings basado en la librería sentence-transformers, es probable que emplee una arquitectura transformer, pero este dato no está confirmado en la información proporcionada. Tampoco se conocen los detalles del entrenamiento, como el número de tokens, la composición del dataset o si se aplicaron técnicas de ajuste como RLHF o DPO.

La conversión a GGUF se realizó con llama.cpp, aplicando una cuantización Q4_K_M que reduce el tamaño del modelo de los pesos originales (probablemente en formato safetensors) a un archivo de 0,2 GB. Esta cuantización introduce una pérdida de precisión mínima, pero permite una inferencia mucho más rápida y con menor consumo de memoria, especialmente en CPU.

## Capacidades

- Generación de embeddings de texto en chino: produce vectores densos que capturan el significado semántico de frases o documentos.
- Búsqueda semántica: permite recuperar documentos relevantes a partir de una consulta en chino mediante similitud coseno u otras métricas de distancia.
- Clasificación de texto: los embeddings pueden servir como características de entrada para clasificadores supervisados.
- Agrupamiento (clustering): agrupa documentos por similitud semántica sin necesidad de etiquetas.
- Detección de duplicados: identifica textos con contenido equivalente o muy similar.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en corpus chinos: indexar documentos (artículos, informes, FAQs) y recuperar los más relevantes para una consulta en lenguaje natural, usando el modelo para generar embeddings de consultas y documentos.
- Sistemas de recomendación de contenido: calcular la similitud entre artículos o productos basándose en sus descripciones en chino, para sugerir elementos relacionados.
- Clasificación automática de tickets de soporte: convertir tickets de atención al cliente en embeddings y entrenar un clasificador ligero sobre ellos para categorizarlos por tema o urgencia.
- Deduplicación de registros: en bases de datos con textos en chino (por ejemplo, listados de productos), usar los embeddings para detectar entradas duplicadas o casi duplicadas.
- Análisis de sentimiento en redes sociales: generar embeddings de publicaciones en chino y alimentar un modelo de clasificación para detectar opiniones positivas, negativas o neutras.
- Construcción de chatbots con recuperación aumentada (RAG): integrar el modelo en un pipeline de RAG para recuperar fragmentos de conocimiento en chino y pasarlos a un modelo generativo, mejorando la precisión de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ya que este modelo está orientado a tareas de embeddings y no a generación de texto. Tampoco se han proporcionado resultados en benchmarks específicos de recuperación como MTEB.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 324M parámetros cuantizado a Q4_K_M, el archivo pesa 0,2 GB, por lo que la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM adicional, o en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1050 Ti o superior) puede ejecutarlo sin problemas; también funciona en Apple Silicon mediante llama.cpp.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media, así como en sistemas sin GPU (solo CPU).
- Opciones de despliegue: llama.cpp (CLI o servidor), llama-server, y cualquier runtime compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no se dispone de mediciones oficiales, pero al ser un modelo pequeño, la latencia por embedding es del orden de milisegundos en CPU moderna y aún menor en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de embeddings en chino, como BGE, M3E o text2vec. No se conocen los resultados de benchmarks ni las características técnicas detalladas de estos modelos en relación con el presente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está limitado al idioma chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser una cuantización Q4_K_M, puede haber una ligera pérdida de precisión en los embeddings en comparación con el modelo original en punto flotante.
- No se dispone de información sobre sesgos o alucinaciones, pero al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación es nulo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para confirmar cualquier restricción adicional.
- No se han publicado detalles sobre la longitud máxima de contexto, por lo que se debe asumir un límite conservador (por ejemplo, 512 tokens) hasta verificar el comportamiento real.
- El modelo no está diseñado para tareas generativas ni para razonamiento complejo; su uso debe limitarse a la generación de representaciones vectoriales.

## Enlaces

- [Modelo en HuggingFace: yeahbeen/Yuan-embedding-2.0-zh-Q4_K_M-GGUF](https://huggingface.co/yeahbeen/Yuan-embedding-2.0-zh-Q4_K_M-GGUF)
- [Modelo base: IEITYuan/Yuan-embedding-2.0-zh](https://huggingface.co/IEITYuan/Yuan-embedding-2.0-zh)
