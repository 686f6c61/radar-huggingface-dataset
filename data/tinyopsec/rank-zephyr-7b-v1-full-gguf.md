# tinyopsec/rank-zephyr-7b-v1-full-GGUF

## Resumen

RankZephyr-7B-v1-Full GGUF es la versión cuantizada en formato GGUF del modelo castorini/rank_zephyr_7b_v1_full, un fine-tuning de Zephyr-7B-β especializado en reranking listwise zero-shot. Lo publica el usuario tinyopsec en Hugging Face y su interés principal es que permite ejecutar un reranker de recuperación de información de alto rendimiento en hardware de consumo, sin necesidad de GPU de datacenter. El modelo base lo desarrollaron Ronak Pradeep, Sahel Sharifymoghaddam y Jimmy Lin (Universidad de Waterloo, grupo castorini), y se describe en el artículo arXiv:2312.02724.

El modelo resuelve la segunda etapa de un pipeline de búsqueda: recibe una consulta y una lista de documentos recuperados por un primer retriever y devuelve una reordenación por relevancia. Con SPLADE++ ED como primera etapa alcanza 0,7803 NDCG@10 en DL19 y 0,8211 en DL20, cifras que lo situaron como referencia entre los rerankers open source. Arquitectónicamente es un transformer decoder-only de 7.241.732.096 parámetros (unos 7,24 mil millones), derivado de Mistral-7B vía Zephyr-7B-β, con licencia MIT.

La relevancia actual de esta ficha es práctica: el repositorio ofrece once variantes de cuantización entre 2 y 16 bits, desde unos 2 GB hasta unos 14 GB, con requisitos de VRAM documentados, lo que baja la barrera de entrada para desplegar reranking neural en entornos con recursos limitados o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B vía Zephyr-7B-β), fine-tuning para reranking listwise |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de uso emplean n_ctx=2048 |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Zephyr-7B-β, que a su vez deriva de Mistral-7B, un transformer decoder-only denso de 7,24 mil millones de parámetros. El ajuste se orientó a reranking listwise: en lugar de puntuar pares consulta-documento de forma independiente, el modelo recibe la consulta y una lista de documentos en el prompt y genera una permutación ordenada por relevancia. Según la model card, el entrenamiento se realizó sobre reordenaciones producidas por RankGPT-4 aplicadas a embeddings de OpenAI Ada2, lo que transfiere al modelo el comportamiento de un reranker fuerte pero propietario.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación destacable es metodológica: demostrar que un reranking listwise zero-shot robusto se puede obtener con un modelo de 7B abierto, sin entrenamiento específico por colección, y que el resultado se puede cuantizar a GGUF para inferencia local con llama.cpp.

## Capacidades

- Reordenación listwise de documentos: recibe consulta y lista de pasajes y devuelve el orden de relevancia.
- Reranking zero-shot sobre colecciones no vistas durante el entrenamiento.
- Generación de texto conversacional, heredada de Zephyr-7B-β y del chat template de Mistral.
- Razonamiento sobre listas largas de candidatos en una sola pasada (listwise), en lugar de puntuación punto a punto.
- Soporte de plantilla de chat Mistral en llama.cpp, llama-cpp-python, LM Studio y Ollama.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reranking en motores de búsqueda internos: se coloca tras un retriever léxico o denso (por ejemplo BM25 o SPLADE) y reordena los 20-100 candidatos principales antes de mostrarlos; la variante Q5_K_M, de unos 4,8 GB, cabe en una GPU de consumo y mantiene la calidad del listwise.
- Búsqueda documental en estaciones de trabajo sin GPU de datacenter: con Q4_K_M (~3,8 GB) o Q3_K_M (~2,9 GB) se puede ejecutar en una RTX 3060 de 12 GB o incluso en CPU con 5-6 GB de RAM, útil para prototipos y equipos de investigación con presupuesto limitado.
- Aumento de la precisión en pipelines RAG: reordena los fragmentos recuperados de una base vectorial antes de pasarlos al modelo generador, reduciendo el ruido en el contexto y mejorando la fidelidad de las respuestas.
- Evaluación de sistemas de recuperación: sirve como reranker de referencia en experimentos de IR para comparar retrievers de primera etapa con una métrica consistente (NDCG@10 en DL19/DL20).
- Búsqueda en catálogos técnicos o bases de conocimiento de nicho: al ser zero-shot, no requiere entrenamiento específico por dominio; basta con adaptar el prompt de listwise reranking al formato de los documentos.
- Despliegue en local con Ollama o LM Studio para demos y pruebas de concepto: el Modelfile incluido permite crear una instancia con `ollama create` en minutos, sin infraestructura adicional.
- Filtrado previo en pipelines de anotación o curación de datos: ordenar grandes conjuntos de pasajes candidatos por relevancia antes de la revisión humana.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| TREC DL19 | NDCG@10 | 0,7803 |
| TREC DL20 | NDCG@10 | 0,8211 |

Los resultados corresponden al modelo base con SPLADE++ ED como retriever de primera etapa, según la model card. No se han publicado en la información disponible resultados de benchmarks para las variantes GGUF cuantizadas, ni comparaciones con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia según la model card: F16 ~14 GB; Q8_0 ~8 GB; Q6_K ~6,5 GB; Q5_K_M ~5,5 GB; Q4_K_M ~4,5 GB; Q3_K_M ~3,5 GB; Q2_K ~2,5 GB.
- RAM para inferencia en CPU: F16 ~17 GB; Q8_0 ~10 GB; Q6_K ~8 GB; Q5_K_M ~7 GB; Q4_K_M ~6 GB; Q3_K_M ~5 GB; Q2_K ~3,5 GB.
- GPU recomendadas: A100 o H100 para F16 y Q8_0 con lotes grandes; RTX 4090 (24 GB) para F16 y Q8_0; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q3_K_M.
- Cabe en GPU de consumo: sí, desde Q4_K_M en tarjetas de 6-8 GB y desde Q3_K_M en tarjetas de 4-6 GB; Q2_K permite ejecución en CPU con 3,5 GB de RAM.
- Opciones de despliegue: llama.cpp (`./main`), llama-cpp-python, LM Studio y Ollama (mediante Modelfile). No se documentan vLLM ni TGI para este repositorio GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Reranking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/rank-zephyr-7b-v1-full-GGUF (este) | 7,24 B | no disponible | Listwise zero-shot; 0,7803 NDCG@10 en DL19 y 0,8211 en DL20 | MIT | GGUF, 11 cuantizaciones |
| castorini/rank_zephyr_7b_v1_full | 7,24 B | no disponible | Listwise zero-shot; mismas metricas | MIT | Safetensors (modelo base) |
| Zephyr-7B-β | 7,24 B | no disponible | No especializado en reranking | MIT | Safetensors y GGUF de terceros |
| Mistral-7B | 7,24 B | 32k en la versión original | No especializado; requiere prompting ad hoc | Apache 2.0 | Safetensors y GGUF |

La comparación con Zephyr-7B-β y Mistral-7B es relevante porque comparten arquitectura y tamaño; la diferencia es el fine-tuning específico para reranking listwise, que en el caso de RankZephyr aporta métricas publicadas en DL19 y DL20. No se dispone en la información proporcionada de resultados comparativos de otros rerankers open source en la misma tabla.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado para reranking listwise; su uso como modelo generativo general no está validado y probablemente rinda por debajo de Zephyr-7B-β en tareas abiertas.
- Idioma: la etiqueta del repositorio indica solo inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Contexto: la longitud de contexto no se especifica en la información disponible y los ejemplos de uso fijan n_ctx=2048; listas de documentos muy largas pueden truncarse o degradar el ranking.
- Cuantización: las variantes Q3 y Q2 reducen el tamaño pero pueden degradar la precisión del ranking; la model card no publica métricas por cuantización, por lo que conviene validar NDCG en el dominio propio antes de producción.
- Sesgos: no documentados en la información proporcionada; al derivar de Mistral-7B y Zephyr-7B-β, puede heredar sesgos de sus datos de preentrenamiento y ajuste.
- Alucinación: como modelo generativo, puede producir texto plausible fuera del formato de ranking esperado; es necesario parsear y validar la salida.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los pesos base y de los datos de entrenamiento derivados de RankGPT-4 y OpenAI Ada2, que no se detallan en la información disponible.
- Repositorio de terceros: la cuantización la mantiene un usuario individual (tinyopsec), no el equipo castorini; no hay garantía de mantenimiento ni de equivalencia exacta con el modelo base.
- Fecha de creación del repositorio: 2026-09-16, según los metadatos de Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/rank-zephyr-7b-v1-full-GGUF
- Modelo base: https://huggingface.co/castorini/rank_zephyr_7b_v1_full
- Artículo: https://arxiv.org/abs/2312.02724
- Referencia de Zephyr-7B-β: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
- Referencia de Mistral-7B: https://huggingface.co/mistralai/Mistral-7B-v0.1
