# yasinyaman/toolrank-emb-8b-GGUF

## Resumen

toolrank-emb-8b-GGUF es la distribucion en formato GGUF del modelo de embeddings `yasinyaman/toolrank-emb-8b` (revision v0.2), desarrollado por Yasin Yaman. Se trata de un modelo de recuperacion de herramientas (tool retrieval) para agentes: convierte una peticion del agente y cada descripcion de herramienta en vectores, y ordena las herramientas mas cercanas a la peticion. Esta pensado para funcionar en llama.cpp y Ollama, es decir, sin necesidad de GPU de datacenter.

El modelo parte de `Qwen/Qwen3-Embedding-8B` (licencia Apache-2.0) con un LoRA de toolrank fusionado, manteniendo los mismos pesos, instruccion y texto de herramienta que la version bf16; el unico cambio es el formato numerico. Cuenta con 8.188.515.328 parametros, embeddings de 4096 dimensiones con pooling del ultimo token y normalizacion L2, y una ventana de contexto de 8192 tokens. Se distribuye en cuantizaciones Q4_K_M (5,03 GB) y Q8_0 (8,71 GB).

Su relevancia actual radica en el interes creciente por los agentes basados en MCP (Model Context Protocol): a medida que crecen los catalogos de herramientas, seleccionar la correcta por similitud semantica se vuelve critico. Este modelo permite ejecutar esa recuperacion en hardware modesto, con una perdida de calidad respecto a bf16 que el autor califica de no medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings derivado de Qwen3-Embedding-8B, con LoRA de toolrank fusionado |
| Parametros totales | 8.188.515.328 (8,19B) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF); conversion intermedia a f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Dimensiones del embedding | 4096, pooling del ultimo token, normalizacion L2 |
| Modelo base | Qwen/Qwen3-Embedding-8B con LoRA de yasinyaman/toolrank-emb-8b@v0.2 |

## Arquitectura y entrenamiento

El modelo es un transformer de embeddings basado en Qwen3-Embedding-8B. La adaptacion consiste en un LoRA entrenado por toolrank e integrado (fusionado) en los pesos del modelo base. La salida se obtiene mediante pooling del ultimo token, con vectores de 4096 dimensiones que deben normalizarse con L2 antes de comparar similitudes. El pipeline declarado es `sentence-similarity`.

El LoRA se entreno sobre 20.000 pares procedentes del dataset `mangopy/ToolRet-Training-20w`, que segun la model card no declara licencia. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp a f16 y posteriormente con `llama-quantize`, sin importance matrix. La receta de inferencia usa una instruccion concreta para las peticiones del agente (`Instruct: Given an agent's request for a tool, retrieve the MCP tool that fulfills it.\nQuery: <request>`) y, para las herramientas, el texto de `documentation` o el JSON `{\"server\", \"name\", \"description\", \"inputSchema\"}` en el caso de MCP y OpenAPI. Las cabezas de la version v0.1 se desactivan automaticamente en estos builds, ya que estaban entrenadas sobre el modelo base y penalizaban a este.

## Capacidades

- Generacion de embeddings de similitud semantica para recuperacion de herramientas (tool retrieval).
- Recuperacion de herramientas MCP y OpenAPI a partir de una peticion en lenguaje natural del agente.
- Soporte de instruccion especifica de toolrank para las consultas (`Instruct: ... Query: ...`).
- Indexado de catalogos completos de herramientas con almacenamiento persistente de vectores (cache de embeddings reutilizable tras reinicio).
- Similitud entre frases (pipeline `sentence-similarity`).
- Capacidad multilingue: no disponible en la informacion proporcionada.
- No es un modelo generativo: no produce texto ni realiza tool calling por si mismo; su funcion es clasificar y ordenar herramientas.
- Compatible con endpoints tipo OpenAI (`endpoints_compatible`).

## Casos de uso

- Recuperacion de herramientas en agentes MCP: dado un catalogo de servidores MCP indexado previamente, el modelo ordena las herramientas por relevancia ante cada peticion del agente, reduciendo el numero de herramientas que se pasan al LLM principal.
- Enrutado de peticiones a APIs: en un sistema con cientos de endpoints OpenAPI, el modelo selecciona la operacion adecuada a partir de la descripcion de la peticion del usuario.
- RAG sobre documentacion de herramientas: indexar descripciones y esquemas de entrada (`inputSchema`) para alimentar contextos de agentes con las herramientas correctas.
- Despliegue local o en el borde: al ejecutarse en llama.cpp y Ollama, permite montar un servicio de recuperacion de herramientas sin GPU de datacenter, por ejemplo en un portatil con RTX 3050 Ti de 4 GB.
- Deduplicacion y agrupacion de catalogos: comparar embeddings de herramientas para detectar duplicados o agrupar funcionalidades solapadas antes de exponer un catalogo a un agente.
- Filtrado previo en pipelines multi-agente: reducir un universo de decenas de miles de herramientas (caso ToolRet, 44.453) a un top-k manejable antes de invocar al modelo generativo.
- Busqueda semantica de funciones internas: aplicar la misma logica a funciones o skills internas de una plataforma para enrutar tareas automaticamente.

## Benchmarks y rendimiento

Evaluacion propia de toolrank, con instruccion y texto `documentation` + `instruct_query`, top 100 sobre el corpus completo.

**LiveMCPBench** (94 tareas, 525 herramientas; una tarea equivale aproximadamente a un punto):

| Build | NDCG@10 | Recall@5 | Recall@10 |
|---|---:|---:|---:|
| bf16, vLLM | 55,74 | 52,06 | 63,34 |
| Q4_K_M | 56,22 | 52,22 | 62,77 |
| Q8_0 | 55,41 | 52,17 | 62,80 |

**ToolRet** (7.961 peticiones, 44.453 herramientas; medido sobre un build Q4_K_M de la misma receta creado con una version anterior de llama.cpp, del 3 de octubre de 2026, cuyo payload cuantizado difiere de estos ficheros):

| Build | NDCG@10 | cat-macro | Recall@10 | Recall@20 |
|---|---:|---:|---:|---:|
| bf16, vLLM | 58,90 | 54,36 | 69,54 | 75,25 |
| Q4_K_M (build del 3 de octubre) | 59,50 | 54,51 | 69,85 | 75,67 |

Segun el autor, la cuantizacion no introduce perdida medible: Q4_K_M queda dentro de medio punto respecto a bf16 en ambos conjuntos, y Q8_0 se comporta de forma equivalente.

## Requisitos de hardware

- Tamano de los ficheros: Q4_K_M 5,03 GB; Q8_0 8,71 GB.
- VRAM estimada: Q4_K_M requiere al menos 5-6 GB de VRAM para ejecucion completa en GPU; Q8_0 en torno a 9-10 GB. En GPUs de 4 GB (por ejemplo RTX 3050 Ti) estos builds de 8B se ejecutan en parte sobre CPU.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas para Q4_K_M; a partir de 10-12 GB para Q8_0 con carga completa. Para bf16 servido con vLLM se necesita mas memoria (no cuantificado).
- Cabe en GPU consumer: si. Q4_K_M en GPUs de 6-8 GB; en 4 GB solo con offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (con `PARAMETER num_ctx 8192`) y vLLM para la version bf16. Compatible con endpoints tipo OpenAI.
- Latencia medida (portatil con RTX 3050 Ti de 4 GB, 14 GB de RAM, Ollama 0.35.1, una peticion a la vez, sin cache): Q4_K_M 571-668 ms por busqueda nueva, p95 en torno a 0,7 s; Q8_0 780 ms, p95 948 ms.
- Indexado de catalogo: 525 herramientas embebidas en 5,4 min con Q4_K_M y 8,8 min con Q8_0.
- Cache: una peticion ya vista se responde en 3-13 ms desde la cache de embeddings de toolrank.
- Nota critica de configuracion: Ollama ignora el parametro de truncado de la peticion y corta en `num_ctx`; con el valor por defecto de 2048 la documentacion larga de herramientas pierde el final de forma silenciosa, por lo que debe fijarse `num_ctx 8192`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 LiveMCPBench | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| toolrank-emb-8b-GGUF (Q4_K_M) | 8,19B | 8192 | 56,22 | Apache-2.0 | GGUF en HuggingFace |
| toolrank-emb-8b (bf16, vLLM) | 8,19B | 8192 | 55,74 | Apache-2.0 | Safetensors en HuggingFace |
| Qwen3-Embedding-0.6B / 4B (recetas de toolrank) | 0,6B / 4B | no disponible | 6-7 puntos por detras | Apache-2.0 | HuggingFace |
| mradermacher/toolrank-emb-8b-GGUF | 8B | no disponible | no disponible | Apache-2.0 | GGUF en HuggingFace |

Segun el informe de toolrank, los modelos mas pequenos de Qwen3-Embedding (0.6B y 4B) quedan 6-7 puntos por detras en LiveMCPBench y 9-11 puntos en ToolRet. Existe una cuantizacion alternativa publicada por mradermacher para el mismo modelo base.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no redacta respuestas ni ejecuta herramientas; solo ordena y recupera por similitud.
- Riesgo de recuperacion incorrecta: si la descripcion de la herramienta o la peticion son ambiguas, puede priorizar herramientas poco relevantes. Los benchmarks indican NDCG@10 en torno a 56-59, es decir, existe margen de error apreciable.
- Sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingue.
- Limitacion de contexto: 8192 tokens. En Ollama hay que fijar `num_ctx 8192` de forma explicita, ya que el valor por defecto (2048) trunca la documentacion larga.
- Licencia: los pesos del modelo son Apache-2.0, pero los datos de entrenamiento del LoRA (`mangopy/ToolRet-Training-20w`) no declaran licencia, lo que la propia model card senala como una cuestion a revisar en la version bf16.
- Caveat de produccion: los numeros de ToolRet se midieron sobre un build Q4_K_M de una version anterior de llama.cpp (3 de octubre de 2026), con un payload cuantizado distinto del publicado; deben leerse como valores de la receta, no de estos ficheros concretos.
- Advertencia de cuantizacion: las cabezas de la version v0.1 estan desactivadas automaticamente en estos builds; no debe activarse la logica de heads de v0.1 sobre este modelo.
- Rendimiento dependiente del hardware: en GPUs de 4 GB parte del calculo cae en CPU, con latencias de centenas de milisegundos por busqueda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasinyaman/toolrank-emb-8b-GGUF
- Modelo base bf16: https://huggingface.co/yasinyaman/toolrank-emb-8b
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio GitHub de toolrank: https://github.com/yasinyaman/toolrank
- Documentacion del proyecto: https://yaman.dev/toolrank/
- Informe de benchmarks (backlog-d1): https://github.com/yasinyaman/toolrank/blob/main/docs/reports/backlog-d1.md
- Guia de ejecucion local: https://yaman.dev/toolrank/guides/local/
- Cuantizacion alternativa de mradermacher: https://huggingface.co/mradermacher/toolrank-emb-8b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/mangopy/ToolRet-Training-20w
