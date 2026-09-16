# tinyopsec/rank-zephyr-7b-v1-full-GGUF

## Resumen

`tinyopsec/rank-zephyr-7b-v1-full-GGUF` es un paquete de cuantizaciones en formato GGUF del modelo `castorini/rank_zephyr_7b_v1_full`, un reranker listwise de 7.241.732.096 parametros (aproximadamente 7,24 mil millones) construido sobre Zephyr-7B-β, que a su vez deriva de Mistral-7B-v0.1. El autor de este repositorio es el usuario `tinyopsec`, que no entrena el modelo sino que publica las versiones cuantizadas (F16 a Q2_K) para su ejecucion en llama.cpp, LM Studio y Ollama; el modelo original lo desarrollan Ronak Pradeep, Sahel Sharifymoghaddam y Jimmy Lin (Universidad de Waterloo, proyecto castorini).

El problema que resuelve es la reordenacion de resultados de busqueda en dos fases: dado un query y una lista de documentos recuperados por un retriever de primera fase (por ejemplo SPLADE++ ED o embeddings Ada-2), el modelo devuelve la lista reordenada por relevancia. Segun la model card, el modelo original alcanza 0,7803 NDCG@10 en DL19 y 0,8211 en DL20 con SPLADE++ ED como primera fase, y fue entrenado sobre reordenaciones generadas por RankGPT-4 a partir de embeddings OpenAI Ada-2.

Su relevancia actual es practica: empaquetar un reranker de 7B en GGUF permite desplegar reordenacion listwise de alta calidad en hardware de consumo (desde unos 2,5 GB de VRAM en Q2_K) sin depender de APIs propietarias, algo habitual en pipelines RAG y motores de busqueda autoalojados. La licencia MIT del modelo base facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-v0.1, afinado como Zephyr-7B-β y despues como RankZephyr) |
| Parametros totales | 7.241.732.096 (aproximadamente 7,24 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la arquitectura subyacente (Mistral-7B-v0.1 / Zephyr-7B-β) admite 32.768 tokens, pero los ejemplos de la model card usan `n_ctx=2048` |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (11 ficheros cuantizados; el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.1: un transformer decoder-only denso de 7,24 B de parametros. Sobre esa base se aplico el ajuste de Zephyr-7B-β (que incluye una fase de alineacion tipo DPO) y, posteriormente, el ajuste especifico de RankZephyr para reordenacion. El modelo esta especializado en formulaciones listwise: recibe un query y una lista de pasajes en un unico prompt y genera el orden de relevancia resultante, en lugar de puntuar pares query-documento de forma independiente.

Segun la model card del modelo base, el entrenamiento de RankZephyr utiliza reordenaciones producidas por RankGPT-4 sobre candidatos recuperados con embeddings OpenAI Ada-2. El repositorio que nos ocupa no aporta informacion adicional sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de RLHF/DPO; esos detalles no estan disponibles en la informacion proporcionada. La innovacion relevante de este repositorio concreto es la publicacion de 11 variantes de cuantizacion (k-quants de llama.cpp), desde 16 bits de referencia hasta Q2_K de 2 bits, con tablas de requisitos de VRAM y de RAM declaradas por el autor.

## Capacidades

- Reordenacion listwise de resultados: recibe query y lista de documentos y devuelve el orden por relevancia.
- Reordenacion zero-shot sobre resultados de un retriever de primera fase (SPLADE++ ED, embeddings densos, BM25, etc.).
- Generacion de texto y uso conversacional (pipeline declarado: `text-generation`; plantilla de chat Mistral).
- Instrucciones en formato chat mediante `chat_format="mistral"` en llama-cpp-python o `--chat-template mistral` en llama.cpp.
- Ejecucion en CPU y en GPU con descarga parcial de capas (`n_gpu_layers`), lo que permite despliegue hibrido.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: limitadas a ingles (`language: en`); no se documenta soporte de otros idiomas.

## Casos de uso

- Reordenacion en pipelines RAG: tras recuperar los N mejores fragmentos con un retriever vectorial, el modelo reordena esa lista antes de pasarla al LLM generador; reduce el ruido de contexto y mejora la precision de las respuestas.
- Motor de busqueda corporativo autoalojado: segunda fase de ranking sobre indices Elasticsearch/OpenSearch con BM25 o SPLADE, sin enviar consultas ni documentos a APIs externas.
- Busqueda academica y bibliografica: reordenacion de abstracts recuperados por similitud, donde el orden de relevancia afecta directamente a la utilidad del resultado.
- Sistemas de recomendacion de contenido: reordenar un conjunto de candidatos recuperados por similitud y priorizar los mas relevantes para la consulta o el perfil del usuario.
- Evaluacion automatica de relevancia en investigacion en recuperacion de informacion (IR): reproduccion de experimentos de reranking listwise sobre colecciones como DL19/DL20 con hardware modesto.
- Despliegue en entornos con hardware limitado: la variante Q4_K_M (unos 4,5 GB de VRAM) permite reordenacion de 7B en una GPU de consumo o incluso en CPU con unos 6 GB de RAM.
- Procesamiento por lotes offline: reordenar grandes volumenes de listas de resultados en servidores sin GPU dedicada usando Q2_K o Q3_K (CPU-friendly, 2 a 3,5 GB de RAM).

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo base `castorini/rank_zephyr_7b_v1_full` (precision completa), no a las variantes GGUF de este repositorio.

| Benchmark | Metrica | Resultado (modelo base) | Primera fase |
|---|---|---|---|
| DL19 | NDCG@10 | 0,7803 | SPLADE++ ED |
| DL20 | NDCG@10 | 0,8211 | SPLADE++ ED |

No se han publicado resultados de benchmarks especificos de las cuantizaciones GGUF en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

## Requisitos de hardware

Requisitos declarados por el autor en la model card:

| Cuantizacion | VRAM (GPU) | RAM (CPU) |
|---|---|---|
| F16 | unos 14 GB | unos 17 GB |
| Q8_0 | unos 8 GB | unos 10 GB |
| Q6_K | unos 6,5 GB | unos 8 GB |
| Q5_K_M | unos 5,5 GB | unos 7 GB |
| Q4_K_M | unos 4,5 GB | unos 6 GB |
| Q3_K_M | unos 3,5 GB | unos 5 GB |
| Q2_K | unos 2,5 GB | unos 3,5 GB |

- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070), y Q2_K/Q3_K en GPUs de 4 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con 8 GB o mas (RTX 3070/4060 Ti, RTX 3090, RTX 4090) permite ejecutar F16 o Q8_0 con holgura. A100 y H100 no son necesarias para un modelo de este tamano.
- Despliegue: llama.cpp, llama-cpp-python, LM Studio y Ollama son las opciones documentadas explicitamente. No se documentan recetas para vLLM, TGI ni TensorRT-LLM.
- Ejecucion en CPU: viable con Q2_K (2,0 GB) y Q3_K_S (2,7 GB), declaradas como aptas para CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| tinyopsec/rank-zephyr-7b-v1-full-GGUF (este) | 7,24 B | GGUF (F16 a Q2_K) | MIT | No disponible | Cuantizaciones del reranker; VRAM desde 2,5 GB |
| castorini/rank_zephyr_7b_v1_full | 7,24 B | safetensors | MIT | No disponible | Modelo base sin cuantizar; NDCG@10 0,7803 en DL19 y 0,8211 en DL20 con SPLADE++ ED |
| Zephyr-7B-β | 7,24 B | safetensors | MIT | 32.768 tokens (segun arquitectura Mistral-7B-v0.1) | Base conversacional sin ajuste de reranking; no apto como reranker listwise sin adaptacion |
| RankGPT-4 | No disponible | API propietaria | Propietaria | No disponible | Profesor usado para generar las reordenaciones de entrenamiento; sin pesos abiertos |

No hay datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, salvo los NDCG del modelo base.

## Limitaciones y advertencias

- Modelo especializado en reranking: fuera de esa tarea su calidad como asistente general no esta garantizada ni documentada.
- Requiere un retriever de primera fase; por si solo no realiza recuperacion.
- Solo ingles (`language: en`); el rendimiento en otros idiomas no esta documentado.
- Las cuantizaciones de 2, 3 y 4 bits degradan la precision respecto a F16; no hay medicion publicada de esa perdida de NDCG en este repositorio.
- La plantilla de chat empleada en los ejemplos limita el contexto a 2.048 tokens, muy por debajo de la ventana que admite la arquitectura subyacente; listas de documentos largas pueden truncarse si no se ajusta `n_ctx`.
- Riesgo de alucinacion inherente a los modelos generativos: al generar el orden, puede omitir documentos o inventar identificadores si la lista de entrada es larga o ambigua.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; conviene verificar las cuantizaciones antes de usarlas en produccion.
- La fecha de creacion registrada (2026-09-16) es posterior a la fecha habitual de publicacion de la informacion; conviene confirmar la vigencia del repositorio.
- Licencia MIT heredada del modelo base: permite uso comercial, pero se recomienda revisar tambien las condiciones de Zephyr-7B-β y Mistral-7B-v0.1 en la cadena de dependencias.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberia asumirse su uso en esos flujos sin pruebas previas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/rank-zephyr-7b-v1-full-GGUF
- Modelo base: https://huggingface.co/castorini/rank_zephyr_7b_v1_full
- Paper de RankZephyr (arXiv:2312.02724): https://arxiv.org/abs/2312.02724
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden al entorno digital de la Universite Clermont Auvergne) y no aportan enlaces adicionales relevantes.
