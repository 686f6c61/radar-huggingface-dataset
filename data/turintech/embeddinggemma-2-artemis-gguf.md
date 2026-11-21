# turintech/embeddinggemma-2-Artemis-GGUF

## Resumen

EmbeddingGemma 2 Artemis GGUF es una versión cuantizada del modelo de embeddings `google/embeddinggemma-2`, publicada por TurinTech bajo el paraguas de su pipeline de compresión Artemis. El modelo original es un encoder de Google diseñado para generar representaciones vectoriales densas de 768 dimensiones, orientado a tareas de búsqueda y recuperación de información (retrieval). Esta variante GGUF está pensada para ejecutarse íntegramente en CPU mediante llama.cpp, sin necesidad de GPU.

La propuesta de valor de esta ficha es la eficiencia: el archivo Q4_K_S ocupa 156,935 MB y requiere 0,339 GiB de memoria pico en CPU, manteniendo un Recall@10 de 0,6588 en el conjunto de test BEIR. Según el autor, este resultado supera al de la cuantización UD-Q4_K_XL de Unsloth (0,6427) sobre el mismo benchmark, lo que sitúa a esta compresión como una opción competitiva para despliegues de recuperación semántica en entornos con recursos limitados.

El modelo cuenta con 271.002.648 parámetros totales (aproximadamente 271 millones) y no es un modelo generativo: no mantiene conversaciones ni produce texto, sino que transforma consultas y documentos en vectores para búsqueda semántica. Su relevancia actual radica en la combinación de licencia Apache 2.0, disponibilidad en formatos compatibles con Ollama y LM Studio, y un rendimiento medido sobre BEIR que lo hace apto para sistemas RAG y motores de búsqueda en producción sobre hardware convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer para embeddings (modelo base: google/embeddinggemma-2); detalles internos de la arquitectura no disponibles |
| Parametros totales | 271.002.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entradas de hasta 512 tokens en las mediciones publicadas; límite máximo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_S y Q5_K_S (versiones publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |
| Dimension de embedding | 768 |
| Pooling | Mean pooling (configurado en el servidor) |
| Normalizacion | Activada (`--embd-normalize 2`) |
| Tamano del repositorio | 0,5 GB |
| Runtime verificado | llama.cpp commit f3363593, build CPU |
| Descargas en Hugging Face | 952 |
| Likes en Hugging Face | 10 |

## Arquitectura y entrenamiento

El modelo es una cuantización del encoder `google/embeddinggemma-2`, un modelo de embeddings de Google. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, dimensión de las cabezas de atención, mecanismo de atención exacto), por lo que esos datos se consideran no disponibles. Lo que sí se conoce es su función: producir vectores de 768 dimensiones a partir de texto de entrada, con un máximo de 512 tokens por entrada en las evaluaciones publicadas.

El trabajo de TurinTech se centra en la compresión mediante su pipeline Artemis, que genera archivos GGUF cuantizados en Q4_K_S y Q5_K_S. El autor reporta que la cuantización Q4_K_S preserva mejor la calidad de recuperación que la alternativa UD-Q4_K_XL de Unsloth sobre BEIR test (0,6588 frente a 0,6427 en Recall@10). No se dispone de información sobre los datos de entrenamiento del modelo base, el volumen de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta variante no los incluye.

Una particularidad operativa relevante es el formato de prompts requerido para el correcto funcionamiento del modelo: las consultas deben llevar el prefijo `task: search result | query: ` y los documentos el formato `title: ... | text: ...`. Todas las métricas publicadas se midieron con mean pooling, entradas de hasta 512 tokens y estos prefijos aplicados.

## Capacidades

- Generación de embeddings de texto: convierte consultas y documentos en vectores densos de 768 dimensiones para búsqueda semántica.
- Recuperación de información (retrieval): diseñado específicamente para tareas de búsqueda y ranking de documentos.
- Similitud semántica: pipeline declarado `sentence-similarity` en Hugging Face.
- Soporte de endpoints compatible: expuesto mediante `/v1/embeddings` en llama-server y `/api/embed` en Ollama.
- Ejecución en CPU: no requiere GPU; el autor verifica el funcionamiento con `-ngl 0` (cero capas en GPU).
- Compatibilidad con llama.cpp, Ollama y LM Studio.
- No soporta generación de texto, diálogo, tool calling, razonamiento multi-paso ni capacidades de agente, al ser un modelo exclusivamente de embeddings.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo indexa fragmentos de documentación como vectores de 768 dimensiones y permite recuperar los pasajes más relevantes ante una consulta en lenguaje natural, usando el prefijo `task: search result | query: ` para las consultas y el formato `title: ... | text: ...` para los documentos.
- Sistemas RAG (Retrieval-Augmented Generation) en producción: actúa como recuperador en pipelines RAG, generando embeddings de los chunks de una base de conocimiento y de las preguntas de los usuarios; su bajo consumo (0,339 GiB de memoria pico en Q4_K_S) permite desplegarlo en el mismo servidor CPU que el generador o en un nodo separado de bajo coste.
- Motor de búsqueda interno para empresas: indexación de correos, wikis y documentos corporativos con recuperación semántica sobre CPU, sin necesidad de infraestructura GPU, lo que reduce el coste operativo de un buscador interno.
- Deduplicación y agrupamiento de documentos: cálculo de similitud entre pares de textos para detectar duplicados o agrupar contenido temáticamente, aprovechando la normalización de embeddings y el pooling configurado.
- Clasificación de tickets y enrutamiento: embeddings de tickets de soporte comparados contra embeddings de categorías predefinidas para asignar automáticamente el equipo o la cola correspondiente.
- Filtrado y ranking en pipelines de datos: puntuación de relevancia de candidatos recuperados por un primer motor (por ejemplo, BM25) para reordenarlos semánticamente antes de pasarlos a un modelo generativo.
- Despliegue en entornos edge o sin GPU: al ejecutarse con llama.cpp en CPU y ocupar menos de 160 MB en Q4_K_S, es viable en servidores modestos, contenedores ligeros o dispositivos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recall@10 en BEIR test (Q4_K_S Artemis) | 0,6588 |
| Recall@10 en BEIR test (Unsloth UD-Q4_K_XL, referencia del autor) | 0,6427 |
| Tamano del archivo Q4_K_S | 156,935 MB |
| Memoria pico en CPU (Q4_K_S) | 0,339 GiB |

Los datos de BEIR corresponden al conjunto de test y fueron medidos por el autor con mean pooling, normalización de embeddings y entradas de hasta 512 tokens. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el autor ejecuta con `-ngl 0`. En CPU, el Q4_K_S necesita 0,339 GiB de memoria pico.
- GPU recomendadas: no aplica para el despliegue verificado; el autor no ha comprobado el funcionamiento en GPU con estos archivos.
- Cabe en cualquier CPU moderna x86-64 con al menos 0,5 GB de RAM disponible para el modelo; no requiere GPU de consumo.
- Opciones de despliegue verificadas: llama.cpp (commit f3363593, build CPU con OpenMP), Ollama (`turintech/embeddinggemma-2-artemis`) y LM Studio (`turintech/embeddinggemma-2-artemis`).
- Configuración recomendada por el autor: `llama-server -m embeddinggemma-2-Artemis-Q4_K_S.gguf --embeddings --pooling mean --embd-normalize 2 -ngl 0 -t 4 -tb 4 -c 512 -b 512 -ub 512 -np 1 --flash-attn off`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de portabilidad: el build del autor usa `GGML_NATIVE=ON`, por lo que los binarios pueden no funcionar en CPUs distintas a la de compilación; se recomienda recompilar para el hardware de destino.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall@10 BEIR test | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| embeddinggemma-2-Artemis-GGUF (Q4_K_S) | 271 M | 512 tokens (medido) | 0,6588 | Apache 2.0 | GGUF | Ejecución en CPU verificada |
| embeddinggemma-2-Artemis (Q5_K_S) | 271 M | 512 tokens (medido) | No disponible | Apache 2.0 | GGUF | Mayor tamaño que Q4_K_S |
| google/embeddinggemma-2 | 271 M | No disponible | No disponible | No disponible en esta ficha | No disponible | Modelo base del que deriva esta cuantización |
| Unsloth UD-Q4_K_XL (referencia del autor) | No disponible | 512 tokens (medido) | 0,6427 | No disponible | GGUF | Cuantización alternativa citada como comparación |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-paso.
- El límite de contexto verificado en las mediciones es de 512 tokens por entrada; textos más largos deben fragmentarse.
- El formato de los prompts es obligatorio para el rendimiento esperado: consultas con prefijo `task: search result | query: ` y documentos con `title: ... | text: ...`. Omitirlos puede degradar la calidad de recuperación.
- El rendimiento en GPU y con otros builds de llama.cpp no ha sido comprobado por el autor; solo se verificó un build CPU concreto.
- El build de referencia usa `GGML_NATIVE=ON`, lo que puede generar binarios no portables entre CPUs.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de recuperaciones irrelevantes o falsos positivos en similitud semántica, especialmente con dominios muy especializados.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo de Google, puede heredar sesgos de su corpus de entrenamiento, no documentados en esta ficha.
- Idiomas soportados: no disponibles; conviene validar el rendimiento en castellano antes de usarlo en producción multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `google/embeddinggemma-2` y las licencias de las dependencias del runtime.
- Los resultados de BEIR son los reportados por el autor; no se dispone de una evaluación independiente que los confirme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/embeddinggemma-2-Artemis-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- TurinTech en Hugging Face: https://huggingface.co/turintech
- Web de TurinTech: https://www.turintech.ai
- Ollama: https://ollama.com/turintech/embeddinggemma-2-artemis
- LM Studio: https://lmstudio.ai/turintech/embeddinggemma-2-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/blob/f3363593f457169cdfbdfe22ea399b1cc139ba18/docs/build.md
