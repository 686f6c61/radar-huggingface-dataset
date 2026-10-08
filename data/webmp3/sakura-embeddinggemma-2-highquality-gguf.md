# webmp3/Sakura-EmbeddingGemma-2-HighQuality-GGUF

## Resumen

Sakura EmbeddingGemma 2 HighQuality GGUF es una familia de cinco cuantizaciones GGUF del modelo de embeddings `google/embeddinggemma-2`, un modelo multilingüe que produce vectores densos de 768 dimensiones (271.002.648 parámetros). El modelo original lo desarrolla Google; esta build es un trabajo comunitario del usuario `webmp3`, que no está afiliado a Google y que parte de la revisión `914f7f89142e33e77833254d9c9b90c3cef7303b` convertida a BF16 GGUF con el script `convert_hf_to_gguf.py` de llama.cpp.

El problema que resuelve es el de desplegar búsqueda semántica y recuperación (retrieval) de alta fidelidad en entornos con recursos muy limitados: los ficheros ocupan entre 177,0 MB y 239,4 MB en disco, frente a los 1,0 GB del repositorio completo. El autor aplica una matriz de importancia propia calculada sobre 16.460 unidades consulta/pasaje (4,47 M de caracteres) procedentes de 13 conjuntos públicos de retrieval, y asigna precisión por grupos de tensores en lugar de usar una única plantilla de cuantización.

La relevancia actual viene de que permite ejecutar embeddings multilingües de calidad casi BF16 en CPU o en cualquier GPU de consumo, con la fidelidad medida explícitamente frente al modelo BF16 sobre 1.400 pares consulta/pasaje reservados. La licencia declarada en el repositorio es Apache 2.0 y el formato es GGUF, compatible con llama.cpp sin parches.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información proporcionada; modelo de embeddings (`feature-extraction`) derivado de `google/embeddinggemma-2` |
| Parámetros totales | 271.002.648 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el ejemplo de uso de `llama-server` emplea `-c 2048` |
| Tipos de cuantización | GGUF: HQ-Q4 (Q4_K_M + IQ4_XS), HQ-Q4-L, HQ-Q5-S, HQ-Q5 (Q5_K_M), HQ-Q6 (Q6_K); con Q5_K, Q6_K, Q8_0 e IQ4_XS por grupos de tensores |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); no se detalla la lista de idiomas |
| Licencia | Apache 2.0 (la declarada por el repositorio) |
| Formato de pesos | GGUF (origen BF16 GGUF) |
| Dimensión de embeddings | 768 |
| Tamaño por fichero | 177,0 MB (Q4) a 239,4 MB (Q6) |
| Tamaño del repositorio | 1,0 GB |
| Autor | webmp3 (build comunitaria, no oficial de Google) |
| Fecha de publicación | 2026-10-07 |

## Arquitectura y entrenamiento

Esta ficha no describe un entrenamiento, sino un proceso de cuantización. El punto de partida es `google/embeddinggemma-2` en BF16, convertido a GGUF. La matriz de importancia se calculó con `llama-imatrix` sobre 16.460 unidades consulta/pasaje (4,47 M de caracteres) extraídas de 13 conjuntos públicos de retrieval en el formato de prompt de EmbeddingGemma: Natural Questions, GooAQ, SQuAD, TriviaQA, MS MARCO, SPECTER, S2ORC, CodeSearchNet, duplicados de StackExchange, Yahoo Answers, ELI5, GermanQuAD y WikiMatrix. El autor declara que ningún pasaje de evaluación comparte una ventana de 80 caracteres con el texto de calibración (0 de 1.400), y que el fichero de matriz solo contiene estadísticas de activación, sin texto.

La cuantización se hizo con `llama-quantize --imatrix` y precisiones por tensor: por ejemplo, HQ-Q4 usa Q4_K_M como preset base, IQ4_XS para la tabla de tokens y los bloques 6-17, Q6_K en los bloques 0-2 y 21-23, Q5_K en los bloques 3-5 y 18-20, y Q8_0 en la cabeza y en `per_layer_model_proj`. HQ-Q6 sube a Q6_K como base, con Q8_0 en los bloques 0-5 y 18-23. `per_layer_model_proj` se convierte a Q8_0 en un segundo paso porque `llama-quantize` lo deja sin cuantizar. La medición se realizó con llama.cpp sin modificar (commit `b86d2f0`, build de CPU), empleando el protocolo y el conjunto de evaluación publicados por AtomicChat.

## Capacidades

- Generación de embeddings de texto para similitud semántica y `feature-extraction` (no es un modelo generativo: no produce texto).
- Recuperación de pasajes (retrieval) en modo consulta/documento, con prefijos de tarea obligatorios: `task: search result | query: <texto>` para consultas y `title: none | text: <texto>` para documentos.
- Búsqueda semántica multilingüe, con calibración que incluye datos en alemán (GermanQuAD, WikiMatrix) además de inglés.
- Búsqueda sobre código, respaldada por CodeSearchNet y StackExchange en la calibración; en el conjunto de evaluación de código, HQ-Q4 alcanza un 92,0 % de top-1 frente al BF16.
- Similitud entre frases y detección de duplicados mediante distancia coseno.
- Agrupamiento (clustering) y clasificación por vecino más próximo sobre vectores de 768 dimensiones.
- No soporta tool calling, function calling ni razonamiento multi-paso, al no ser un modelo de lenguaje generativo.
- No hay capacidades de visión ni de audio en la información proporcionada.

## Casos de uso

- Búsqueda semántica en aplicaciones con recursos limitados: con 177-239 MB por fichero, el modelo se puede empaquetar dentro de la propia aplicación y ejecutar en CPU, sin depender de una API externa de embeddings.
- Recuperación aumentada (RAG) sobre documentación técnica: el modelo indexa fragmentos con el prefijo de documento y responde a consultas con el prefijo de búsqueda; la cuantización Q5 mantiene un 94,5 % de coincidencia de vecino más próximo con el BF16, suficiente para pipelines de recuperación en producción.
- Búsqueda de código en repositorios: los datos de calibración incluyen CodeSearchNet, y la variante Q4 obtiene un top-1 del 92,0 % en el subconjunto de código, por lo que sirve para localizar funciones o fragmentos a partir de lenguaje natural.
- Deduplicación de corpus y control de calidad de datasets: comparando vectores con distancia coseno y un umbral fijado sobre una muestra etiquetada, se pueden detectar documentos casi idénticos antes de entrenar otros modelos.
- Enrutado y clasificación de tickets de soporte: se vectoriza el texto del ticket y se asigna a la cola correspondiente por similitud con ejemplos ya etiquetados; el modelo multilingüe permite mezclar tickets en varios idiomas en el mismo índice.
- Memoria de agentes y caché semántica: almacenar embeddings de interacciones previas para recuperar respuestas o contexto relevante en lugar de repetir llamadas a un modelo generativo.
- Recomendación por contenido: representar ítems y consultas de usuario en el mismo espacio de 768 dimensiones para ordenar resultados por similitud, incluso en despliegues sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generativos (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no es generativo. El autor sí publica mediciones de fidelidad frente al modelo BF16: distancia `1 - coseno` (menor es mejor) y porcentaje de veces que el vecino más próximo coincide con el del BF16 (`top-1`), sobre 1.400 pares consulta/pasaje reservados.

| Fichero | Tamaño | 1-cos neutro | top-1 neutro | 1-cos código | top-1 código |
|---|---:|---:|---:|---:|---:|
| `embeddinggemma-2-Sakura-HQ-Q4.gguf` | 177,0 MB | 0,00567 | 86,5 % | 0,00449 | 92,0 % |
| `embeddinggemma-2-Sakura-HQ-Q4-L.gguf` | 183,3 MB | 0,00490 | 88,1 % | 0,00377 | 93,0 % |
| `embeddinggemma-2-Sakura-HQ-Q5-S.gguf` | 192,7 MB | 0,00291 | 92,1 % | 0,00200 | 95,0 % |
| `embeddinggemma-2-Sakura-HQ-Q5.gguf` | 214,9 MB | 0,00189 | 94,5 % | 0,00141 | 95,8 % |
| `embeddinggemma-2-Sakura-HQ-Q6.gguf` | 239,4 MB | 0,00072 | 95,9 % | 0,00053 | 96,3 % |

Según el autor, Q4 es el fichero más pequeño que sigue siendo útil, Q5 es el punto de equilibrio y Q6 se acerca a la pérdida nula para retrieval. En Q5 y Q6 no se midieron de nuevo los ficheros de la competencia: se listan tal como fueron publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los casos. El fichero va de 177,0 MB a 239,4 MB y hay que sumar el contexto y el overhead del runtime, de modo que un presupuesto práctico de 0,3-0,6 GB es suficiente.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria libre. El modelo cabe sobradamente en una RTX 4090, una RTX 3060 o incluso en iGPU integradas; no requiere A100 ni H100.
- Consumer GPU: sí, en todas las gamas actuales. También es viable en CPU exclusivamente: el autor midió los cinco ficheros con una build de CPU de llama.cpp (commit `b86d2f0`).
- Opciones de despliegue: llama.cpp mediante `llama-server -m <fichero>.gguf --embeddings --pooling mean -c 2048`, que es el procedimiento documentado por el autor. Otros runtimes no se mencionan en la información proporcionada.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia, solo métricas de fidelidad vectorial.

## Comparativa con modelos similares

No hay datos en la información proporcionada sobre otros modelos de embeddings de familias distintas. La comparación disponible es entre builds de cuantización del mismo modelo base, con las cifras de fidelidad tal como las publicó cada autor.

| Build | Tamaño | 1-cos neutro | top-1 neutro | Observación del autor |
|---|---:|---:|---:|---|
| Sakura HQ-Q4 | 177,0 MB | 0,00567 | 86,5 % | Distancia entre un 22 % y un 30 % menor que las alternativas Q4 por 1,3-1,6 MB más; top-1 neutro entre 0,6 y 1,4 puntos inferior, pero top-1 de código superior |
| AtomicChat AD-Q4_K_M | 175,4 MB | 0,00724 | 87,9 % | Referencia publicada, no remedida |
| Unsloth UD-Q4_K_XL | 175,7 MB | 0,00811 | 87,1 % | Referencia publicada, no remedida |
| Sakura HQ-Q5 | 214,9 MB | 0,00189 | 94,5 % | Distancia entre un 5 % y un 12 % menor por un 2,3-2,5 % más de tamaño; ganancia pequeña |
| Unsloth UD-Q5_K_XL | 210,1 MB | 0,00199 | 93,9 % | Referencia publicada, no remedida |
| AutoRound Q5_K_S | 209,6 MB | 0,00215 | 93,8 % | Referencia publicada, no remedida |
| Sakura HQ-Q6 | 239,4 MB | 0,00072 | 95,9 % | Entre un 1,5 % y un 3,8 % más pequeño, pero con distancia y top-1 peores que AtomicChat y AutoRound |
| AtomicChat AD-Q6_K | 245,3 MB | 0,00055 | 96,3 % | Referencia publicada, no remedida |
| AutoRound Q6_K | 243,0 MB | 0,00066 | 97,5 % | Referencia publicada, no remedida |
| Unsloth UD-Q6_K_XL | 248,8 MB | 0,00080 | 97,0 % | Referencia publicada, no remedida |

El propio autor resume que la serie está claramente por delante en la clase Q4 en distancia, prácticamente igualada en Q5, y es un compromiso tamaño-calidad en Q6.

## Limitaciones y advertencias

- Es una build comunitaria; no está publicada ni validada por Google. El autor lo indica explícitamente.
- No es un modelo generativo: no responde preguntas ni redacta texto, solo produce vectores. Cualquier caso de uso debe combinarlo con otro modelo.
- Requiere prefijos de tarea en la entrada (`task: search result | query: ...`, `title: none | text: ...`); omitirlos degrada la calidad de los embeddings.
- La cuantización introduce pérdida medible: en Q4, el top-1 neutro baja al 86,5 % frente al BF16, lo que puede ser insuficiente en recuperación de alta exigencia.
- En la clase Q6, según las propias mediciones del autor, las builds de AtomicChat y AutoRound obtienen mejor distancia y mejor top-1, a cambio de 4-6 MB más de tamaño.
- El conjunto de evaluación son 1.400 pares y un único test set; el autor advierte que diferencias de un punto en top-1 están dentro del ruido esperable.
- La matriz de importancia no contiene texto de los pasajes de evaluación (0 de 1.400 comparten ventana de 80 caracteres), pero el conjunto de calibración está sesgado hacia inglés y alemán; otras familias de idiomas no están representadas y su fidelidad no ha sido medida.
- La licencia Apache 2.0 es la declarada por este repositorio de cuantización. La información proporcionada no incluye la licencia del modelo base `google/embeddinggemma-2`, por lo que conviene verificarla antes de un uso comercial.
- La longitud de contexto del modelo no se especifica en la información disponible; el ejemplo de uso fija `-c 2048`, un valor de configuración del servidor, no necesariamente el límite del modelo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en similitud si se eligen umbrales de distancia inadecuados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/webmp3/Sakura-EmbeddingGemma-2-HighQuality-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Conjunto de métricas y protocolo de evaluación de referencia: https://huggingface.co/datasets/AtomicChat/embeddinggemma-2-GGUF-metrics
- Runtime empleado y citado en la ficha (llama.cpp): https://github.com/ggml-org/llama.cpp

No se han encontrado en la información proporcionada otros enlaces a papers, blogs o demos.
