# turintech/embeddinggemma-2-Artemis-GGUF

## Resumen

`turintech/embeddinggemma-2-Artemis-GGUF` es una cuantización en formato GGUF del modelo de embeddings `google/embeddinggemma-2`, publicada por TurinTech bajo el sello Artemis. No es un modelo generativo: es un encoder de texto que convierte cadenas en vectores densos de 768 dimensiones, pensado para búsqueda semántica y recuperación de información (retrieval). Su interés práctico radica en que comprime un modelo de 271 millones de parámetros en un fichero de 156,935 MB (Q4_K_S) que funciona íntegramente en CPU a través del endpoint `/v1/embeddings` de llama.cpp, sin necesidad de GPU.

La propuesta del autor es explícitamente comparativa: frente a la cuantización Q4 de Unsloth (175,674 MB), el fichero Q4_K_S de Artemis ocupa un 10,67 % menos y obtiene un nDCG@10 de 0,859481 frente a 0,857125 en el panel de evaluación interno del autor. Se ofrece también una variante Q5_K_S de 182,04 MB para quien prefiera mayor fidelidad de pesos. El modelo está etiquetado como compatible con endpoints y con licencia apache-2.0, y se distribuye tanto en HuggingFace como en paquetes nativos de Ollama.

Por su tamaño y su orientación a CPU, encaja en escenarios de RAG y búsqueda semántica on-premise o de bajo coste, donde el despliegue de un encoder de mayor tamaño no está justificado. La información publicada no detalla la longitud de contexto nativa ni los idiomas soportados, y limita las mediciones a una configuración concreta de 512 tokens de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para embeddings, derivado del modelo base `google/embeddinggemma-2` (la model card no detalla la arquitectura interna) |
| Parámetros totales | 271.002.648 (~271 M) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens en la configuración probada por el autor; la longitud máxima nativa no se especifica en la información disponible |
| Tipos de cuantización | GGUF: Q4_K_S (por defecto) y Q5_K_S |
| Idiomas soportados | no disponible (la model card no lo especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Dimensión del embedding | 768 |
| Pooling / normalización | pooling `mean`, normalización L2 (`embd_normalize 2`) |
| Tamaño del fichero | 156,935 MB (Q4_K_S) / 182,04 MB (Q5_K_S) |
| Tamaño del repositorio | 0,5 GB |
| Prefijos de tarea | `task: search result \| query: ...` y `title: ... \| text: ...` |
| Pipeline | sentence-similarity / feature-extraction |

## Arquitectura y entrenamiento

El modelo es una cuantización del encoder de embeddings `google/embeddinggemma-2`, no un entrenamiento nuevo. TurinTech aplica su pipeline Artemis para producir ficheros GGUF en dos niveles de cuantización (Q4_K_S y Q5_K_S) y valida el resultado sobre una configuración concreta de llama.cpp fijada al commit `f3363593f457169cdfbdfe22ea399b1cc139ba18`, compilada con `GGML_CUDA=OFF`, `GGML_NATIVE=ON` y `GGML_OPENMP=ON`. La inferencia se sirve con pooling por media y normalización L2, y el endpoint expuesto es `/v1/embeddings`, no un endpoint de chat.

La model card no documenta el proceso de entrenamiento del modelo base: no se indican número de tokens, composición del dataset, ni si hubo fases de contraste, RLHF o DPO. Tampoco se describe ninguna innovación técnica más allá de la propia cuantización y del formato de prefijos de tarea que el autor exige mantener en las peticiones. La validación publicada se limita a una comprobación de interfaz (dos entradas, salida de 768 dimensiones) y a una medición de nDCG@10 en un panel de evaluación interno del que no se especifican composición ni tamaño.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para similitud semántica y recuperación.
- Búsqueda semántica query-document mediante prefijos de tarea (`task: search result | query:` y `title: ... | text: ...`).
- Recuperación aumentada (RAG): indexación de pasajes y embedding de consultas en el mismo espacio vectorial.
- Similitud entre frases (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para clasificación, clustering y deduplicación aguas abajo.
- Ejecución íntegra en CPU, sin GPU, con hilos configurables.
- Exposición vía API compatible con `/v1/embeddings` de llama.cpp y vía API `/api/embed` de Ollama.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: se indexan los pasajes con el prefijo `title: ... | text: ...` y se consulta con `task: search result | query: ...`; el modelo devuelve vectores de 768 dimensiones que se comparan por similitud coseno en un índice vectorial.
- RAG en infraestructura sin GPU: al ejecutarse con `-ngl 0` y 4 hilos en CPU, permite montar un pipeline de recuperación completo en servidores modestos o en el propio portátil del desarrollador.
- Deduplicación de registros y catálogos: se embeben títulos o descripciones y se agrupan por umbral de similitud para eliminar entradas repetidas en bases de datos de producto o incidencias.
- Clustering de tickets de soporte: los embeddings alimentan un algoritmo de agrupamiento (k-means, HDBSCAN) para clasificar consultas entrantes por temática sin etiquetado previo.
- Caché semántica de respuestas: se compara la consulta del usuario con consultas previas embebidas para reutilizar respuestas cacheadas cuando la similitud supera un umbral.
- Filtrado y moderación por similitud: comparación de textos contra un conjunto de referencia de contenido no deseado, útil como primera pasada de bajo coste.
- Anotación y curación de datasets: generación de embeddings masivos en CPU para seleccionar subconjuntos diversos o detectar near-duplicates antes del entrenamiento.
- Motor de recomendación basado en contenido: embeddings de descripciones para calcular vecinos más cercanos entre ítems.

## Benchmarks y rendimiento

| Métrica | Artemis Q4_K_S | Unsloth Q4 | Contexto de la medición |
|---|---|---|---|
| nDCG@10 | 0,859481 | 0,857125 | Panel de evaluación interno del autor |
| Tamaño del fichero | 156,935 MB | 175,674 MB | GGUF en disco |
| Diferencia de tamaño | 10,67 % menor | referencia | Respecto a Unsloth Q4 |

Las mediciones se obtuvieron en Linux sobre CPU con cuatro hilos y un límite de 512 tokens de entrada. No se publican resultados en MMLU, HumanEval, GSM8K, MTEB ni BEIR, ni la composición del panel de evaluación empleado, por lo que el dato de nDCG@10 no es directamente comparable con cifras publicadas de terceros. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El autor ejecuta el modelo con `-ngl 0`, es decir, toda la computación en CPU.
- RAM estimada: en torno a 200-400 MB para el fichero Q4_K_S (156,935 MB) más overhead de llama.cpp; no se publica una cifra oficial.
- GPU recomendadas: no aplica; cualquier GPU consumer (por ejemplo, una RTX 4090) puede alojar el modelo con holgura por tamaño, pero no es el escenario validado por el autor.
- CPU: la build de referencia usa `GGML_NATIVE=ON`, por lo que los binarios compilados quedan ligados a la CPU de compilación y no deben asumirse portables a otra máquina.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embeddings --pooling mean --embd-normalize 2`), Ollama (`turintech/embeddinggemma-2-artemis:q4_k_s` y `:q5_k_s`), y endpoints compatibles con la API de embeddings.
- Parámetros de servidor usados en la validación: `-t 4 -tb 4 -c 512 -b 512 -ub 512 -np 1 --flash-attn off --no-warmup`.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni vectores por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | nDCG@10 (panel del autor) | Licencia |
|---|---|---|---|---|---|---|
| turintech/embeddinggemma-2-Artemis-GGUF (Q4_K_S) | 271 M | 512 tokens en la config. probada | Q4_K_S | 156,935 MB | 0,859481 | apache-2.0 |
| turintech/embeddinggemma-2-Artemis-GGUF (Q5_K_S) | 271 M | 512 tokens en la config. probada | Q5_K_S | 182,04 MB | no disponible | apache-2.0 |
| Unsloth Q4 (mismo modelo base) | mismo base | no disponible | Q4 | 175,674 MB | 0,857125 | no disponible en la información proporcionada |
| google/embeddinggemma-2 (base, safetensors) | 271 M | no disponible | sin cuantizar | no disponible | no disponible | apache-2.0 según el campo del modelo base |

La comparación relevante es entre cuantizaciones del mismo modelo base, ya que el autor no aporta referencias frente a encoders de otros tamaños (por ejemplo, familias de 100 M o 500 M de parámetros). No se dispone de datos para comparar con alternativas de la misma categoría ajenas a EmbeddingGemma.

## Limitaciones y advertencias

- Ventana de contexto: la configuración validada trunca o rechaza entradas por encima de 512 tokens. Los documentos largos deben trocearse antes de embeberse, lo que afecta a la calidad de recuperación en pasajes extensos.
- No es un modelo de chat: no genera texto, razona ni invoca herramientas. Usarlo a través de un endpoint de completions no producirá resultados útiles.
- Dependencia de los prefijos de tarea: omitir `task: search result | query:` o `title: ... | text: ...` degrada la similitud, según indica el autor.
- Riesgo de alucinación: no aplica en sentido estricto al no generar texto, pero sí existe riesgo de falsos positivos en similitud (pasajes semánticamente próximos pero incorrectos) que debe mitigarse con umbrales y reranking.
- Sesgos: la model card no documenta sesgos conocidos ni la composición del corpus de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de género, etnia o dominio.
- Idiomas: no se especifica la cobertura lingüística. No debe asumirse multilingüismo sin una evaluación propia.
- Licencia: el repositorio declara apache-2.0, pero al derivar de un modelo de Google conviene verificar los términos aplicables al modelo base antes de un despliegue comercial.
- Portabilidad de la build: los binarios compilados con `GGML_NATIVE=ON` pueden no ejecutarse en CPUs distintas; hay que recompilar por máquina.
- Validación limitada: las pruebas publicadas cubren dos entradas en un único entorno Linux x86-64 y no establecen rendimiento ni soporte en otros runtimes.
- Reproducibilidad del benchmark: el panel de evaluación y el procedimiento de cálculo del nDCG@10 no se detallan, por lo que la comparación con Unsloth Q4 no es verificable de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/embeddinggemma-2-Artemis-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paquetes nativos de Ollama: https://ollama.com/turintech/embeddinggemma-2-artemis
- TurinTech: https://turintech.ai
- Instrucciones de compilación de llama.cpp en el commit de referencia: https://github.com/ggml-org/llama.cpp/blob/f3363593f457169cdfbdfe22ea399b1cc139ba18/docs/build.md
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Checksum del fichero Q4_K_S (SHA-256): `f76351ba13988274750620577c88911b195a15321c37fc991bed485ed8f81f45`
- Resultados de la búsqueda web: no se ha identificado ningún enlace relevante para este modelo; las entradas devueltas no guardan relación con el contenido de la ficha.
