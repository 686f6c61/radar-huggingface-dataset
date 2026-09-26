# srigf/themis-embeddinggemma-300m-onnx-int8

## Resumen

Este repositorio publica un artefacto de ejecución ONNX cuantizado a INT8 derivado de `google/embeddinggemma-300m`, el modelo de embeddings desarrollado por Google DeepMind. No se trata de un modelo entrenado desde cero por el autor (`srigf`), sino de una conversión y cuantización del modelo base orientada a inferencia local de bajo coste dentro del proyecto Themis — Engenharia Jurídica, según declara su propia model card.

El artefacto se distribuye como un único fichero `model_int8.onnx` de 310.016.659 bytes (opset 18, IR 8) junto con un `tokenizer.json` de 33.385.008 bytes, ambos con checksum SHA-256 publicado. La dimensión de salida del embedding es de 768, la licencia es Gemma y el tamaño total del repositorio es de 0,3 GB.

Su relevancia es práctica: permite ejecutar un modelo de recuperación semántica multilingüe de ~300 M de parámetros en CPU o GPU de gama baja sin salir del entorno local, algo crítico en dominios con requisitos de confidencialidad como el jurídico. Como contrapartida, el propio autor reconoce que no ha reconstruido la cadena de herramientas exacta de exportación y cuantización, por lo que la trazabilidad del artefacto se apoya únicamente en el checksum.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (arquitectura del modelo base, familia Gemma); artefacto ONNX IR 8, opset 18 |
| Parámetros totales | ~308 M en el modelo base `google/embeddinggemma-300m`; recuento exacto del artefacto INT8 no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en este repositorio; el modelo base documenta 2.048 tokens |
| Tipos de cuantización | INT8 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible en la información del repositorio (el modelo base se documenta como multilingüe) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | ONNX (`model_int8.onnx`, fichero único sin `external_data`) + `tokenizer.json` |
| Dimensión de salida del embedding | 768 |
| Tamaño de `model_int8.onnx` | 310.016.659 bytes |
| SHA-256 de `model_int8.onnx` | `1b477e4439d33c26fa925f17fa5901d524daf9487a9f39b38e6d84ba7301f0ea` |
| SHA-256 de `tokenizer.json` | `6852f8d561078cc0cebe70ca03c5bfdd0d60a45f9d2e0e1e4cc05b68e9ec329e` |
| Pipeline declarado | `feature-extraction` |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este artefacto no implica entrenamiento: es una conversión a ONNX seguida de cuantización a INT8 del modelo `google/embeddinggemma-300m`. La model card indica explícitamente que la cadena de herramientas histórica de exportación y cuantización no se ha reconstruido y que el fichero publicado es la versión byte a byte validada por Themis. Por tanto, no hay información sobre el proceso de calibración, el conjunto de datos usado para cuantizar ni el nivel de degradación introducido respecto al modelo en coma flotante.

La arquitectura subyacente corresponde al modelo base de Google DeepMind: un encoder bidireccional de la familia Gemma 3, con 768 dimensiones de embedding y entrenamiento contrastivo para recuperación semántica. Según la documentación de Google, el modelo base se entrenó con conciencia de cuantización y soporta reducciones Matryoshka de la dimensión de salida, extremos que no se pueden verificar en este repositorio concreto: aquí solo se publica la variante de 768 dimensiones en INT8.

## Capacidades

- Generación de embeddings de frases, párrafos y documentos cortos en una única pasada de codificación.
- Recuperación semántica: búsqueda por similitud sobre un índice vectorial a partir de embeddings de consulta.
- Ranking por similitud coseno, incluido el uso como etapa de filtrado previa a un reranker más costoso.
- Embeddings de resúmenes de movimientos y documentos, uso declarado por el autor dentro de Themis.
- Capacidad multilingüe heredada del modelo base, aunque no declarada ni verificada en este repositorio.
- Ejecución local y offline sobre ONNX Runtime, sin dependencia de API externa.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni *function calling*, no implementa agentes ni razonamiento multi-paso, y no tiene modo *thinking*, visión ni audio.
- No genera asesoramiento ni conclusiones jurídicas, tal y como aclara expresamente el autor.

## Casos de uso

- Búsqueda semántica sobre corpus jurídico: indexar expedientes, sentencias y normativa en un almacén vectorial y recuperar los pasajes relevantes para una consulta en lenguaje natural, con el modelo ejecutándose en local para no exponer material confidencial.
- RAG sobre documentación interna: usar el modelo como retriever en un pipeline de generación aumentada, de modo que un LLM reciba únicamente los fragmentos recuperados; el encoder aporta el ranking y el LLM la redacción final.
- Deduplicación de documentos y escritos: calcular embeddings de todos los ficheros de un repositorio y marcar como duplicados aquellos con similitud coseno por encima de un umbral, reduciendo el almacenamiento y el ruido en los resultados de búsqueda.
- Agrupación de movimientos procesales: proyectar cada movimiento en el espacio de 768 dimensiones y aplicar clustering para descubrir patrones de tramitación, tipos de incidencia o cargas de trabajo por materia.
- Clasificación sin etiquetas: construir prototipos de categoría (por ejemplo, «laboral», «mercantil», «penal») como embeddings de descripciones textuales y asignar cada documento a la clase más próxima, sin necesidad de entrenar un clasificador supervisado.
- Filtrado previo en pipelines de búsqueda a escala: reducir un corpus de decenas de miles de fragmentos a unos cientos con este encoder barato y dejar la reordenación fina a un modelo mayor.
- Enrutado de consultas: detectar si una pregunta del usuario se parece más a documentación interna, a jurisprudencia o a formularios, y decidir así qué índice consultar.
- Despliegue en hardware modesto: servir el endpoint de embeddings en un portátil o en un contenedor pequeño sin GPU, gracias a un fichero de ~0,3 GB en INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluación de la calidad de recuperación del artefacto INT8 (por ejemplo, comparación contra el modelo base en coma flotante), ni métricas de latencia o throughput medidas.

## Requisitos de hardware

- Pesos: 310.016.659 bytes (~296 MiB) para `model_int8.onnx`; el repositorio completo ocupa 0,3 GB.
- VRAM estimada para inferencia: del orden de 0,5 a 1,5 GB incluyendo runtime, *buffers* de activación y tokenizador, dependiendo de la longitud de secuencia y del tamaño de lote. Cifra orientativa, no medida por el autor.
- GPU: cualquier GPU con soporte CUDA y 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, T4). No requiere A100 ni H100.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con ONNX Runtime.
- CPU: la inferencia en CPU es viable y es el escenario natural de este artefacto, dado su tamaño INT8 y su uso declarado en local por parte de Themis.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), `optimum`/`onnxruntime` sobre Transformers, FastEmbed, Text Embeddings Inference (TEI) con soporte ONNX e Infinity. `llama.cpp` y `vLLM` no consumen este fichero ONNX: para esos entornos habría que partir del modelo base y convertirlo al formato correspondiente.
- Latencia y throughput: no disponible; no se han publicado mediciones en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión de salida | Licencia | Formato |
|---|---|---|---|---|---|
| srigf/themis-embeddinggemma-300m-onnx-int8 | ~308 M (base) | no disponible en el repo; 2.048 tokens en el base | 768 | Gemma Terms of Use | ONNX INT8 |
| google/embeddinggemma-300m | ~308 M | 2.048 tokens | 768 (con reducciones Matryoshka en el modelo original) | Gemma Terms of Use | safetensors |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | 768 | MIT | safetensors |
| BAAI/bge-m3 | 568 M | 8.192 tokens | 1.024 | MIT | safetensors |
| Qwen/Qwen3-Embedding-0.6B | ~600 M | 32.000 tokens | configurable | Apache 2.0 | safetensors |

No se dispone de resultados de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- El modelo no genera texto ni asesoramiento jurídico; cualquier uso que espere respuestas redactadas requiere un LLM adicional en el pipeline.
- Artefacto cuantizado a INT8 sin evaluación publicada: se desconoce la pérdida de calidad en recuperación respecto al modelo base en coma flotante.
- La cadena de herramientas de exportación y cuantización no se ha reconstruido, según admite el autor; la única garantía de integridad es el SHA-256 declarado, que conviene verificar antes de cargar el fichero.
- Repositorio con 0 descargas y 0 likes y sin validación externa: no hay evidencia independiente de funcionamiento correcto más allá de la declaración del autor.
- Sesgos: al derivar de un modelo entrenado sobre datos web, hereda sesgos lingüísticos y culturales del corpus original, no cuantificados en este repositorio. No hay ajuste específico al dominio jurídico.
- Idiomas: no se declaran idiomas soportados en este repositorio; aunque el modelo base es multilingüe, no se puede confirmar el comportamiento en portugués, español u otras lenguas concretas sin evaluación propia.
- Longitud de contexto limitada (2.048 tokens en el modelo base): los documentos largos deben trocearse, lo que puede fragmentar unidades de sentido jurídico.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a esas condiciones y a la Gemma Prohibited Use Policy; el derivado debe conservar los ficheros `LICENSE` y `NOTICE` y hacer extensivas las obligaciones a los usuarios posteriores.
- Riesgo genérico de recuperación de contexto irrelevante o engañoso cuando las consultas son ambiguas, lo que en un pipeline RAG puede inducir respuestas erróneas del modelo generativo que consuma los fragmentos.
- Cargar ficheros ONNX de terceros implica ejecutar código de un origen no verificado: conviene auditar el grafo y el entorno antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/srigf/themis-embeddinggemma-300m-onnx-int8
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
