# vllm-project/colqwen3.5-4.5B-v3

## Resumen

ColQwen3.5-4.5B-v3 es un modelo de recuperación visual de documentos (visual document retrieval) que emplea interacción tardía estilo ColBERT sobre el modelo base Qwen3.5-4B. Lo desarrolla el usuario athrael-soju y esta copia concreta la mantiene el proyecto vLLM en su organizacion de HuggingFace para usarla en su integracion continua, con el objetivo de reducir el riesgo de cadena de suministro. Resuelve el problema de buscar informacion dentro de documentos que no estan en texto plano (PDFs maquetados, tablas, graficos, formularios escaneados) generando embeddings multi-vector por pagina, sin necesidad de un pipeline OCR previo.

El modelo tiene 4.540.085.056 parametros (4,5B) y produce representaciones de 320 dimensiones por token visual/textual, con una ventana de contexto de 262.144 tokens. Incorpora un adaptador LoRA (r=16, alpha=64) entrenado sobre Qwen3.5-4B y el checkpoint final es un model soup evolutivo por capas con la version V2, lo que aporta una mejora declarada de +0,0219 puntos frente a V2 en el conjunto de benchmarks.

Es relevante ahora porque la recuperacion multimodal de documentos es una pieza critica en pipelines RAG sobre corpus empresariales, y este modelo se situa en el puesto 6 del leaderboard ViDoRe V3 (61,46 de media en tarea) y en el top-3 de la categoria de 4B, con licencia Apache 2.0 y soporte multilingue en ingles, frances, aleman, espanol y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3.5-4B) con cabeza de proyeccion y late interaction ColBERT (multi-vector) |
| Parametros totales | 4.540.085.056 (4,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, fr, de, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 320 (cabeza entrenada; el valor 128 en algunas columnas del leaderboard es el default de la clase en colpali-engine) |
| Adaptador | LoRA r=16, alpha=64, scheduler coseno |
| Tamano del repo | 27,3 GB |
| Libreria | colpali_engine (tambien sentence-transformers >= 6.0.0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer vision-language, y anade una cabeza de proyeccion que mapea las representaciones a 320 dimensiones. La recuperacion se hace con late interaction de ColBERT: cada consulta y cada pagina de documento se representan como una secuencia de vectores, y la similitud se calcula como suma de max-sim entre tokens de consulta y tokens de documento. Esto permite matching fino a nivel de fragmento sin colapsar todo el documento en un unico vector, algo especialmente util en paginas con tablas, graficos y texto denso.

El entrenamiento usa LoRA (r=16, alpha=64) con planificacion coseno, hiperparametros seleccionados mediante busqueda automatizada. El checkpoint final es un model soup evolutivo por capas que fusiona esta version con V2, con una mejora agregada de +0,0219 puntos en los benchmarks. Los datasets de entrenamiento incluyen vidore/colpali_train_set, openbmb/VisRAG-Ret-Train-Synthetic-data, openbmb/VisRAG-Ret-Train-In-domain-data, llamaindex/vdr-multilingual-train, vidore/tatdqa_train y Metric-AI/tabfquad_train_set. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

Un detalle tecnico importante: el modelo requiere transformers >= 5.2.0. Las versiones anteriores ejecutaban el modelo con atencion causal, lo que produce embeddings distintos; si se construyo un indice con una version antigua hay que reindexar los documentos.

## Capacidades

- Recuperacion visual de documentos: genera embeddings multi-vector por pagina para busqueda semantica directa sobre imagenes de documentos, sin OCR.
- Late interaction ColBERT: calculo de similitud token a token mediante max-sim, con mayor granularidad que los embeddings densos de un solo vector.
- Busqueda multilingue en ingles, frances, aleman, espanol y chino.
- Manejo de documentos con estructura compleja: tablas (TabFQuad, TatDQA), graficos, formularios e infografias.
- Integracion como retriever en pipelines RAG: compatible con colpali-engine y con MultiVectorEncoder de sentence-transformers.
- Contexto largo de 262.144 tokens, adecuado para paginas de alta densidad o lotes de fragmentos visuales.
- No se documentan en la informacion disponible capacidades de generacion de texto, tool calling, agentes, vision general o audio; el modelo esta especializado en recuperacion.

## Casos de uso

- RAG sobre corpus de PDFs corporativos: indexar cada pagina como imagen y recuperar las paginas relevantes para una consulta, evitando errores de extraccion de texto en maquetaciones complejas. El contexto de 262.144 tokens permite procesar paginas densas sin truncar.
- Busqueda en informes financieros y tablas: los benchmarks muestran buen rendimiento en TabFquad (95,9) y Tatdqa (84,0), por lo que es adecuado para localizar cifras y filas concretas en estados financieros y memorias anuales.
- Atencion al cliente sobre documentacion tecnica: recuperar el fragmento exacto de un manual o ficha de producto a partir de una consulta del usuario, alimentando despues un LLM generador.
- Cumplimiento normativo y legal: localizar clausulas o apartados en contratos escaneados y documentos regulatorios multilingues (en, fr, de, es, zh) sin depender de OCR.
- Busqueda cientifica y biomedica: recuperar figuras, tablas y secciones de articulos; el benchmark BioMed alcanza 65,3 en nDCG@5.
- Indexacion de documentacion interna para asistentes empresariales: desplegar el modelo como servicio de embeddings multi-vector en vLLM y conectarlo a un motor de busqueda vectorial para consultas internas.
- Moderacion y triaje documental: clasificar y enrutar documentos entrantes comparandolos contra plantillas de referencia mediante similitud de late interaction.

## Benchmarks y rendimiento

ViDoRe V3 (nDCG@10), captura del 2026-04-20:

| Puesto | Modelo | Memoria (MB) | Parametros (B) | Dim. embedding | Max tokens | Media (tarea) | Media (publica) | Media (privada) |
|---|---|---|---|---|---|---|---|---|
| 1 | nemotron-colembed-vl-8b-v2 | 16722 | 8,7 | 4096 | 262144 | 63,42 | 63,54 | 62,92 |
| 2 | webAI-ColVec1-9b | — | 9,42 | 2560 | 262144 | 63,00 | 64,45 | 57,20 |
| 3 | webAI-ColVec1-4b | — | 4,541 | 640 | 262144 | 62,22 | 63,39 | 57,55 |
| 4 | tomoro-colqwen3-embed-8b | 16724 | 8,0 | 320 | 262144 | 61,59 | 61,60 | 61,56 |
| 5 | nemotron-colembed-vl-4b-v2 | 9206 | 4,8 | 2560 | 262144 | 61,54 | 61,42 | 62,04 |
| **6** | **colqwen3.5-4.5B-v3** | **8660** | **4,6** | **128** | **262144** | **61,46** | **61,56** | **61,06** |
| 7 | Ops-Colqwen3-4B | 9206 | 4,8 | 2560 | 32768 | 61,17 | 61,27 | 60,78 |
| 8 | tomoro-colqwen3-embed-4b | 8466 | 4,0 | 320 | 262144 | 60,20 | 60,16 | 60,33 |
| 9 | llama-nemotron-colembed-vl-3b-v2 | 8403 | 4,407 | 3072 | 8192 | 59,79 | 59,70 | 60,16 |
| 10 | jina-embeddings-v4 | 7500 | 3,935 | 2048 | 32768 | 57,52 | 57,54 | 57,41 |

ViDoRe V1+V2 (nDCG@5), seleccion de tareas:

| Puesto | Modelo | ArxivQA | DocVQA | InfoVQA | ShiftProj | SynAI | Tabfquad | Tatdqa | BioMed | Avg |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ops-Colqwen3-4B | 91,8 | 66,5 | 94,0 | 90,8 | 99,6 | 93,6 | 82,4 | 65,5 | 84,9 |
| 2 | nemotron-colembed-vl-8b-v2 | 93,1 | 68,1 | 94,6 | 93,3 | 100,0 | 97,7 | 83,4 | 66,2 | 84,8 |
| 3 | nemotron-colembed-vl-4b-v2 | 92,0 | 67,4 | 93,3 | 92,3 | 99,3 | 98,1 | 81,2 | 64,3 | 83,9 |
| **4** | **colqwen3.5-4.5B-v3** | 91,9 | 66,6 | 93,6 | 90,2 | 100,0 | 95,9 | **84,0** | 65,3 | **83,7** |
| 5 | llama-nemotron-colembed-vl-3b-v2 | 90,4 | 67,2 | 94,7 | 92,0 | 100,0 | 97,3 | 81,0 | 63,2 | 83,6 |

## Requisitos de hardware

- VRAM en BF16: aproximadamente 9 GB solo para pesos; el leaderboard reporta 8.660 MB de memoria para este modelo, lo que sugiere una huella cercana a 9 GB en inferencia.
- VRAM con cuantizacion: no se publican pesos cuantizados oficiales; al ser un modelo de retrieval con adaptador LoRA, la cuantizacion a 8 bits o 4 bits requeriria conversion propia y validacion de la calidad de los embeddings.
- GPU recomendadas: A100 40/80 GB o H100 para indexacion de grandes volumenes con alto throughput; L40S o RTX 6000 Ada como alternativa de coste medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en BF16, con margen para lotes moderados. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) seria necesario cuantizar.
- Despliegue: colpali-engine como libreria de referencia; sentence-transformers >= 6.0.0 con MultiVectorEncoder; vLLM como servidor de inferencia (el proyecto vLLM mantiene este checkpoint para sus pruebas); llama.cpp y Ollama no tienen soporte documentado para este pipeline de retrieval multi-vector.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (B) | Contexto | ViDoRe V3 media (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| colqwen3.5-4.5B-v3 | 4,6 | 262144 | 61,46 | Apache 2.0 | HuggingFace (copia vLLM y original) |
| nemotron-colembed-vl-4b-v2 | 4,8 | 262144 | 61,54 | no disponible en la informacion | HuggingFace |
| Ops-Colqwen3-4B | 4,8 | 32768 | 61,17 | no disponible en la informacion | HuggingFace |
| tomoro-colqwen3-embed-4b | 4,0 | 262144 | 60,20 | no disponible en la informacion | HuggingFace |

Frente a nemotron-colembed-vl-4b-v2, el modelo de este analisis pierde 0,08 puntos en la media de tarea de ViDoRe V3 pero usa un contexto 8 veces mayor que Ops-Colqwen3-4B y una dimension de embedding menor (320 frente a 2560), lo que reduce el coste de almacenamiento del indice vectorial. En ViDoRe V1+V2 queda 1,2 puntos por debajo de Ops-Colqwen3-4B y 1,1 por debajo de nemotron-colembed-vl-4b-v2, aunque lidera la tarea Tatdqa con 84,0.

## Limitaciones y advertencias

- Queda 1,9 puntos por debajo de Nemotron 8B en la media de tarea de ViDoRe V3; no es la mejor opcion absoluta de la categoria.
- La media de ViDoRe V1+V2 esta ligeramente por debajo de Ops-ColQwen3 y de las variantes Nemotron.
- Peor area de rendimiento: tareas V2 como ESG (58,0) y Econ (59,9), donde pierde entre 3 y 8 puntos frente a los lideres.
- Submissions de 4B+ publicadas despues de v3 (webAI-ColVec1-4b y 9b) ya superan su media global; el puesto 6 del leaderboard puede degradarse con nuevas entradas.
- Requiere transformers >= 5.2.0; indices construidos con versiones anteriores usaron atencion causal y producen embeddings incompatibles, obligando a reindexar.
- La dimension real de embedding es 320, no 128; herramientas que lean el valor por defecto de colpali-engine pueden configurar mal el indice.
- No se publican datos sobre sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de los benchmarks ViDoRe.
- El modelo solo cubre cinco idiomas (en, fr, de, es, zh); el rendimiento en otros idiomas no esta documentado.
- Es un modelo de retrieval, no un generador: no debe usarse para producir respuestas directamente, sino como componente de un pipeline RAG.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- Esta copia concreta es un espejo del repositorio original en una cuenta personal; para produccion conviene fijar el commit y verificar la integridad de los pesos.

## Enlaces

- Modelo en HuggingFace (copia vLLM): https://huggingface.co/vllm-project/colqwen3.5-4.5B-v3
- Modelo original: https://huggingface.co/athrael-soju/colqwen3.5-4.5B-v3
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Leaderboard ViDoRe V3: https://huggingface.co/spaces/vidore/vidore-leaderboard
- Paper ColPali (arXiv 2407.01449): https://arxiv.org/abs/2407.01449
- Documentacion de Sentence Transformers: https://www.sbert.net/
- Dataset vidore/colpali_train_set: https://huggingface.co/datasets/vidore/colpali_train_set
- Dataset openbmb/VisRAG-Ret-Train-Synthetic-data: https://huggingface.co/datasets/openbmb/VisRAG-Ret-Train-Synthetic-data
- Dataset openbmb/VisRAG-Ret-Train-In-domain-data: https://huggingface.co/datasets/openbmb/VisRAG-Ret-Train-In-domain-data
- Dataset llamaindex/vdr-multilingual-train: https://huggingface.co/datasets/llamaindex/vdr-multilingual-train
- Dataset vidore/tatdqa_train: https://huggingface.co/datasets/vidore/tatdqa_train
- Dataset Metric-AI/tabfquad_train_set: https://huggingface.co/datasets/Metric-AI/tabfquad_train_set
