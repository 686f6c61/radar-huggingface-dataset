# ThakiCloud/SKILLRET-Reranker-0.6B

## Resumen

SkillRet-Reranker-0.6B es un modelo de reranking (cross-encoder) desarrollado por ThakiCloud, especializado en la recuperación de *skills* (habilidades) para agentes de IA. Dado un requerimiento de usuario en lenguaje natural y un documento de skill candidato, el modelo puntúa la relevancia y utilidad del skill para esa petición. Se presenta como la segunda etapa de un pipeline de recuperación de dos fases, situándose detrás de un retriever de primera etapa como SkillRet-Embedding-0.6B o SkillRet-Embedding-8B.

El modelo es un fine-tuning de Qwen/Qwen3-Reranker-0.6B, con 595.776.512 parámetros totales (aproximadamente 0,6B) y una longitud máxima de secuencia de 8.192 tokens. Mantiene la interfaz de puntuación del Qwen3-Reranker original: el score se obtiene de la probabilidad del token `yes` frente al token `no`, lo que lo hace compatible con el código de inferencia existente para la familia Qwen3-Reranker.

Su relevancia actual radica en que forma parte de la publicación del benchmark SkillRet (arXiv:2605.05726), un conjunto de datos a gran escala para evaluar sistemas de recuperación de skills en agentes LLM. El modelo está pensado para entornos donde un agente debe seleccionar, entre miles de skills disponibles, cuáles son pertinentes para una tarea concreta, y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptado como cross-encoder de ranking |
| Parámetros totales | 595.776.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (el repo contiene safetensors en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Reranker-0.6B, un transformer decoder-only de la familia Qwen3 reutilizado como cross-encoder: la query y el documento se concatenan en un único prompt con formato de chat (`<Instruct>`, `<Query>`, `<Document>`), y la puntuación de relevancia se extrae de los logits del último token, comparando la probabilidad de `yes` frente a `no` mediante un log-softmax sobre ambos. No se trata de un modelo generativo en producción, sino de un scorer de pares query-documento.

El fine-tuning se realizó sobre el split de entrenamiento del benchmark SkillRet, con 63.259 queries y 10.123 skills. El objetivo es entropía cruzada binaria sobre P(`yes`) para cada par query-skill. Los negativos duros se minaron a partir de cuatro retrievers (SkillRet-Embedding-0.6B, SkillRet-Embedding-8B, Qwen3-Embedding-8B y harrier-oss-v1-0.6b): se fusionaron los rangos 21-60 de cada retriever en un pool de candidatos no relevantes y se muestrearon 15 negativos por positivo. El entrenamiento se ejecutó en 4 GPUs NVIDIA B200 con DDP, batch efectivo de 384 (96 por dispositivo), learning rate 2e-5, warmup ratio 0,1, una época, precisión BF16 y longitud máxima de 8.192 tokens. Cada documento de skill se formatea como `name | description | SKILL.md body`, la misma representación que usan los modelos de embedding de SkillRet.

## Capacidades

- Puntuación de relevancia query-skill mediante cross-encoding, con salida en el rango [0, 1] (probabilidad de `yes`).
- Reranking de candidatos devueltos por un retriever de primera etapa (diseñado para rescoring del top-20).
- Manejo de documentos de skill largos gracias a la ventana de 8.192 tokens.
- Compatibilidad con la interfaz de puntuación de Qwen3-Reranker (mismo formato de prompt y extracción de logits).
- Integración en pipelines de recuperación de dos etapas (embedding + reranker).
- Soporte de procesamiento por lotes de pares query-documento con padding y truncación `longest_first`.
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso, visión, audio ni modo thinking más allá del bloque `<think>` vacío usado en el formato de prompt.

## Casos de uso

- Selección de skills en agentes LLM: dado un requerimiento de usuario, el agente recupera primero un conjunto amplio de skills candidatas con un modelo de embedding y luego usa este reranker para ordenar el top-20 y elegir las más pertinentes antes de ejecutar la tarea.
- Enrutamiento de herramientas en asistentes: en un sistema con catálogo de herramientas o skills, el modelo puntúa qué herramienta encaja mejor con la petición, reduciendo llamadas erróneas a funciones irrelevantes.
- Construcción de sistemas RAG sobre documentación de skills: el reranker afina la recuperación de fragmentos de `SKILL.md` para que el agente reciba contexto relevante y no ruido.
- Evaluación y benchmarking de retrievers: al ser parte del release de SkillRet, se usa para medir la calidad de pipelines de recuperación de skills con métricas NDCG, Recall y Completeness.
- Filtrado de candidatos en pipelines de CI/CD de agentes: integrado como etapa de scoring para validar que las skills registradas en un repositorio se recuperan correctamente ante consultas de prueba.
- Despliegue en CPU o GPUs modestas para prototipos: con 0,6B parámetros, permite montar un pipeline de dos etapas en infraestructura limitada, aceptando la latencia adicional del reranking.
- Deduplicación y ordenación de resultados en buscadores internos de skills: el score continuo permite umbralizar y descartar candidatos por debajo de una probabilidad de relevancia.

## Benchmarks y rendimiento

Evaluación sobre el split de evaluación del benchmark SkillRet (4.392 queries, 6.006 skills), con el reranker re-puntuando el top-20 devuelto por SkillRet-Embedding-8B:

| Modelo | NDCG@5 | NDCG@10 | NDCG@15 |
|---|---|---|---|
| SkillRet-Embedding-8B, sin reranking | 0,8458 | 0,8644 | 0,8695 |
| + SkillRet-Reranker-0.6B (este modelo) | 0,8610 | 0,8774 | 0,8821 |

Métricas completas del modelo:

| Métrica | @5 | @10 | @15 |
|---|---|---|---|
| NDCG | 0,8610 | 0,8774 | 0,8821 |
| Recall | 0,8928 | 0,9357 | 0,9510 |
| Completeness | 0,8206 | 0,8896 | 0,9128 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en BF16 (pesos de 0,6B), más memoria para activaciones y lotes de pares de hasta 8.192 tokens; con lotes grandes la VRAM efectiva puede superar varios GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes pequeños; el entrenamiento se realizó en 4× NVIDIA B200, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares con suficiente VRAM para el tamaño de lote elegido.
- Opciones de despliegue: transformers (código de referencia de la model card); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no se garantiza su uso en llama.cpp/Ollama.
- Latencia y throughput: según el autor, re-puntuar 20 candidatos tarda aproximadamente 0,8 s por query en una B200; en GPUs de consumo la latencia será mayor y en CPU puede ser prohibitiva para despliegues sensibles a latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillRet-Reranker-0.6B | 0,6B | 8.192 | Reranker de skills para agentes | Apache 2.0 | HuggingFace (ThakiCloud) |
| Qwen3-Reranker-0.6B | 0,6B | no disponible en la información proporcionada | Reranker genérico | no disponible en la información proporcionada | HuggingFace (Qwen) |
| SkillRet-Embedding-0.6B | 0,6B | no disponible en la información proporcionada | Retriever de primera etapa (embedding) | no disponible en la información proporcionada | HuggingFace (ThakiCloud) |
| SkillRet-Embedding-8B | 8B | no disponible en la información proporcionada | Retriever de primera etapa (embedding) | no disponible en la información proporcionada | HuggingFace (ThakiCloud) |

## Limitaciones y advertencias

- Optimizado para consultas y skills en inglés; el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- El reranking es sustancialmente más lento que la recuperación de primera etapa: unos 0,8 s por query para 20 candidatos en una B200, lo que puede ser inadecuado en despliegues sensibles a latencia, donde conviene usar solo el modelo de embedding.
- Riesgo de alucinación no aplica en el sentido generativo, pero el score puede ser poco fiable fuera de la distribución del benchmark SkillRet (dominios o formatos de skill distintos).
- La calidad depende de la etapa de recuperación previa: si el retriever de primera etapa no incluye el skill correcto en el top-20, el reranker no puede recuperarlo.
- No se documentan sesgos específicos; al entrenarse sobre un dataset concreto de skills, puede heredar sesgos de composición de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni soporte por parte del autor.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin GPUs o con herramientas que dependan de esos formatos.
- El uso de `AutoModelForCausalLM` con la extracción de logits del último token requiere replicar exactamente el formato de prompt; desviaciones en el template pueden degradar la puntuación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Reranker-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Dataset SkillRet: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Retriever SkillRet-Embedding-0.6B: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Retriever SkillRet-Embedding-8B: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-8B
- arXiv (informe técnico): https://arxiv.org/abs/2605.05726
- Blog técnico (inglés): https://thakicloud.com/tech-blog/en/llmops/skillret-small-family-cpu-skill-retrieval/
- Blog técnico (coreano): https://thakicloud.com/tech-blog/ko/llmops/skillret-small-family-cpu-skill-retrieval/
