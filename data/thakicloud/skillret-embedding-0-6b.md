# ThakiCloud/SKILLRET-Embedding-0.6B

## Resumen

SkillRet-Embedding-0.6B es un modelo de embeddings de frases desarrollado por ThakiCloud, obtenido por ajuste fino del modelo Qwen/Qwen3-Embedding-0.6B. Su propósito específico es la recuperación de habilidades (skills) para agentes LLM: dada una petición en lenguaje natural, el modelo identifica qué habilidades de una biblioteca extensa resultan relevantes. Se trata, por tanto, de un modelo de similitud semántica orientado a un dominio concreto, no de un modelo generativo.

El modelo cuenta con 595.776.512 parámetros (aproximadamente 0,6 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Está construido sobre la librería sentence-transformers y es compatible con text-embeddings-inference y con los endpoints de Hugging Face. Su entrenamiento se realizó sobre el split de entrenamiento del benchmark SkillRet, con 127.190 pares consulta-habilidad provenientes de 63.259 consultas y 10.123 habilidades.

Su relevancia actual radica en la creciente adopción de arquitecturas de agentes que seleccionan herramientas o habilidades de forma dinámica. Un recuperador especializado como este permite desacoplar la selección de habilidades del razonamiento del agente, reduciendo el contexto necesario y mejorando la precisión de la selección. El modelo está optimizado exclusivamente para inglés y su uso previsto es la recuperación, no la ejecución de habilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3-Embedding-0.6B) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (la model card menciona variantes cuantizadas en el paper arXiv:2609.16391, sin detallar los tipos) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer denso derivado de Qwen3-Embedding-0.6B, adaptado mediante ajuste fino supervisado con aprendizaje contrastivo. La función de pérdida empleada es MultipleNegativesRankingLoss (InfoNCE) con compartición de negativos entre GPUs, lo que amplía el número efectivo de negativos por consulta y mejora la discriminación entre habilidades similares.

El entrenamiento se realizó sobre el split de entrenamiento del benchmark SkillRet: 127.190 pares consulta-habilidad construidos a partir de 63.259 consultas y 10.123 habilidades. Se usaron 4 GPUs NVIDIA B200 en modo DDP, con un batch efectivo de 384 (96 por dispositivo), precisión BF16, tasa de aprendizaje de 2e-5, una sola época y una longitud máxima de secuencia de 8.192 tokens. El tiempo total de entrenamiento fue de aproximadamente 6 horas. El modelo emplea un prefijo de instrucción para las consultas ("Instruct: Given a skill search query, retrieve relevant skills that match the query\nQuery: ") y normalización de embeddings, práctica habitual en los modelos de la familia Qwen3-Embedding.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (retrieval).
- Recuperación de habilidades de agente a partir de consultas en lenguaje natural.
- Codificación de documentos de habilidad con formato estructurado (nombre y descripción, por ejemplo "ci-cd-setup | Configure continuous integration...").
- Soporte de instrucciones de consulta mediante prefijo, lo que permite orientar la tarea de recuperación.
- Embeddings normalizados listos para búsqueda por producto escalar o similitud coseno.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo de embeddings.

## Casos de uso

- Selección de habilidades en agentes LLM: ante una petición del usuario, el modelo recupera las k habilidades más relevantes de una biblioteca de miles de entradas, que el agente puede entonces cargar en su contexto. Es adecuado porque fue entrenado específicamente sobre pares consulta-habilidad y alcanza un Recall@10 de 0,8774 en el benchmark.
- Enrutamiento de herramientas en plataformas de automatización: en un sistema con cientos de integraciones (CI/CD, debugging, bases de datos), el modelo permite mapear la intención del usuario a la integración correcta sin emplear un LLM generativo, reduciendo coste y latencia.
- Indexación semántica de catálogos de skills o plugins: generar embeddings de cada entrada del catálogo y mantener un índice vectorial para búsqueda en tiempo real.
- Búsqueda interna de documentación operativa: recuperar procedimientos o runbooks descritos como habilidades ante consultas de ingeniería, aprovechando el contexto de 8.192 tokens para descripciones largas.
- Filtrado previo en pipelines RAG de agentes: reducir el conjunto de candidatos antes de un reranking más costoso o de una llamada a un LLM, mejorando la eficiencia del pipeline.
- Evaluación y benchmarking de sistemas de recuperación de habilidades: servir como referencia o baseline en experimentos sobre el benchmark SkillRet.
- Deduplicación y agrupación de habilidades: usar los embeddings para detectar habilidades redundantes o solapadas en una biblioteca grande.

## Benchmarks y rendimiento

Evaluación sobre el split de test del benchmark SkillRet (4.392 consultas, 6.006 habilidades), según la model card:

| Metrica | @5 | @10 | @15 |
|---|---|---|---|
| NDCG | 0,7902 | 0,8112 | 0,8187 |
| Recall | 0,8238 | 0,8774 | 0,9016 |
| Completeness | 0,7083 | 0,7894 | 0,8265 |
| MAP | 0,7409 | 0,7538 | 0,7570 |
| Precision | 0,2591 | 0,1401 | 0,0962 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16/BF16 para los pesos (595,8 M de parámetros); en FP32, unos 2,4 GB. La VRAM real incluye overhead de activaciones y del runtime, por lo que conviene reservar al menos 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; para alto throughput, GPUs de datacenter como A100, H100 o B200. El entrenamiento se realizó en 4× NVIDIA B200.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs integradas o CPU para cargas pequeñas.
- Opciones de despliegue: sentence-transformers (librería nativa), text-embeddings-inference (TGI para embeddings), endpoints de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkillRet-Embedding-0.6B | 595,8 M | 8.192 tokens | Recuperación de skills para agentes (inglés) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | 0,6 B | no disponible en la información | Embeddings generales y multilingües | no disponible en la información | Hugging Face |
| Otros recuperadores de la familia Qwen3-Embedding | 0,6 B / 4 B / 8 B (según familia) | no disponible en la información | Embeddings generales | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está optimizado exclusivamente para consultas y habilidades en inglés; su rendimiento en otros idiomas no está garantizado.
- El rendimiento puede degradarse en dominios fuera de la distribución del benchmark SkillRet.
- El modelo recupera habilidades pero no las ejecuta; cualquier ejecución debe realizarla el sistema agente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes: la precisión a @15 es baja (0,0962), lo que indica que ampliar k introduce muchos falsos positivos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-Embedding-0.6B y del dataset SkillRet.
- El modelo fue entrenado con una sola época sobre un dataset específico; puede presentar sobreajuste al formato exacto de las entradas del benchmark (nombre de habilidad seguido de descripción).
- No se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos web puede heredar sesgos de dicho corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper del benchmark SkillRet: https://arxiv.org/abs/2605.05726
- Paper sobre cuantización de embedders (variantes cuantizadas): https://arxiv.org/abs/2609.16391
- Dataset SkillRet: https://huggingface.co/datasets/ThakiCloud/SKILLRET
