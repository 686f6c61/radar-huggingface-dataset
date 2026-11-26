# ue2627-ir-gir/medir-rag-bi-encoder-merged

## Resumen

medir-rag-bi-encoder-merged es un modelo bi-encoder (dense retrieval) para recuperacion de informacion en el dominio biomedico, desarrollado en el marco del proyecto MedIR-RAG de la Universidad de Evora (asignatura Recuperacao de Informacao em Bases de Texto). Se construye a partir de BAAI/bge-small-en-v1.5, un transformer BERT pequeno de 33,36 millones de parametros, al que se le ha aplicado un ajuste fino mediante LoRA sobre pares pregunta/pasaje del corpus BioASQ y posteriormente se ha fusionado el adaptador en los pesos base, dando lugar a un modelo completo listo para usar con sentence-transformers.

El modelo resuelve el problema de la recuperacion densa de pasajes cientificos en un corpus de gran escala: se ha evaluado sobre los 39.958.371 documentos de PubMed, lo que lo situa en un escenario realista de busqueda biomedica. Su interes practico radica en que combina un tamano muy reducido (apto para GPU de consumo e incluso CPU) con un ajuste especifico al dominio medico, y sus resultados mejoran de forma notable cuando se integra en busqueda hibrida con BM25 mediante Reciprocal Rank Fusion (RRF).

Es relevante ahora porque demuestra un patron habitual en pipelines RAG especializados: partir de un embedding generalista ligero, ajustarlo con LoRA sobre pares del dominio y desplegarlo junto a un recuperador lexico. No obstante, se trata de un modelo de investigacion con cero descargas y sin licencia declarada, por lo que su adopcion en produccion requiere verificar previamente los terminos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bi-encoder denso), base BAAI/bge-small-en-v1.5 con adaptador LoRA fusionado |
| Parametros totales | 33.360.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de sentence-transformers/transformers, pero no declarada por el autor) |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles; el entrenamiento se realizo sobre BioASQ, en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de BAAI/bge-small-en-v1.5: un encoder transformer BERT de tipo small con 33,36 millones de parametros, utilizado como bi-encoder, es decir, codifica preguntas y pasajes de forma independiente en un mismo espacio vectorial y la similitud se calcula mediante producto escalar o coseno sobre embeddings normalizados. Sobre estos pesos se entreno un adaptador LoRA con pares pregunta/pasaje de BioASQ, en el contexto del proyecto MedIR-RAG, y posteriormente el adaptador se fusiono en los pesos base para producir un modelo completo (de ahi el sufijo "merged").

El codigo de entrenamiento se distribuye como `train_bi_encoder.py` en el repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de LoRA (rango, alpha, modulos objetivo) ni si se aplicaron tecnicas de negativos duros, destilacion o DPO. Tampoco se detalla la estrategia de pooling ni la longitud maxima de secuencia empleada durante el entrenamiento.

## Capacidades

- Generacion de embeddings densos para recuperacion de informacion (retrieval) en el dominio biomedico.
- Codificacion de preguntas y pasajes en un espacio vectorial comun, con normalizacion opcional de embeddings para similitud coseno.
- Busqueda semantica sobre corpus de gran escala: evaluado sobre los 39.958.371 documentos de PubMed.
- Integracion en busqueda hibrida con BM25 mediante Reciprocal Rank Fusion (RRF), con mejora sustancial de metricas.
- Uso directo con la libreria sentence-transformers (`SentenceTransformer.encode`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un modelo de representacion para recuperacion.
- Capacidades multilingues: no disponibles; el modelo base y los datos de entrenamiento son en ingles.

## Casos de uso

- Recuperacion de evidencia biomedica en pipelines RAG: el modelo indexa pasajes de PubMed y recupera los mas relevantes para una pregunta clinica, sirviendo como primera etapa antes de un modelo generador que redacte la respuesta.
- Busqueda hibrida en literatura cientifica: combinado con BM25 y fusion RRF, permite construir un recuperador que captura tanto coincidencias lexicas (terminos MeSH, nombres de farmacos) como similitud semantica, con metricas documentadas de 0,4613 NDCG@5 y 0,6482 MRR@10 sobre el conjunto de test de BioASQ.
- Deduplicacion y agrupacion semantica de documentos: los embeddings permiten agrupar pasajes o articulos con contenido equivalente para eliminar redundancia en indices documentales.
- Sistemas de pregunta-respuesta sobre corpus medico: como componente de recuperacion en arquitecturas extractivas o generativas, alimentando el contexto del modelo de respuesta.
- Clasificacion y filtrado por similitud: uso de los embeddings para puntuar la relevancia de candidatos en tareas de triaje documental o enrutamiento de consultas a subindices especializados.
- Evaluacion y experimentacion academica: reproduccion de los experimentos de MedIR-RAG con el codigo de entrenamiento incluido, util para estudiar el efecto del ajuste LoRA en retrieval biomedico de bajo coste computacional.
- Despliegue en entornos con recursos limitados: sus 33,36 millones de parametros permiten ejecutar la indexacion y la inferencia en CPU o en GPU de consumo, lo que facilita prototipos y entornos docentes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el corpus completo de PubMed (39.958.371 documentos) y 279 preguntas de test de BioASQ:

| Metrica | Modelo solo | Hibrido con BM25 (RRF) |
|---|---|---|
| NDCG@5 | 0,1871 | 0,4613 |
| MRR@10 | 0,2795 | 0,6482 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de retrieval como BEIR) ni metricas del modelo base sin ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70 MB en fp32 (33,36 millones de parametros x 4 bytes), unos 35 MB en fp16 y alrededor de 20 MB en int8. El repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 4090 o A100 esta enormemente sobredimensionada para este modelo. Funciona tambien en CPU sin problema para cargas moderadas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: sentence-transformers (nativo), transformers con pooling manual, ONNX Runtime, y servidores de embeddings como TEI (Text Embeddings Inference) o FastAPI con batching. No se declara soporte explicito de vLLM ni llama.cpp (este ultimo no aplica a un encoder BERT).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-bi-encoder-merged | 33,36 M | no disponible | Biomedico (BioASQ/PubMed) | no disponible | Hugging Face, 0 descargas |
| BAAI/bge-small-en-v1.5 (base) | 33,36 M | 512 tokens (segun modelo base) | Generalista, ingles | MIT (segun modelo base) | Ampliamente disponible |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens (segun modelo base) | Generalista, ingles | MIT (segun modelo base) | Ampliamente disponible |
| Modelos de retrieval biomedico especializados (p. ej., BioBERT-based) | variable | variable | Biomedico | variable | variable |

La comparativa de rendimiento frente a estos modelos no esta disponible en la informacion proporcionada; solo se documentan las metricas del modelo ajustado sobre BioASQ. Los datos de contexto y licencia de los modelos BAAI se indican a titulo orientativo segun la documentacion publica del modelo base y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, por lo que el uso comercial no esta garantizado y requiere contactar con el autor o consultar la licencia del modelo base.
- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion externa de los resultados.
- Entrenado exclusivamente sobre pares de BioASQ: el rendimiento fuera del dominio biomedico o en otros idiomas es incierto y probablemente deficiente.
- Idioma: el modelo base y los datos de entrenamiento son en ingles; no se declara soporte multilingue ni para castellano.
- Riesgo de sesgo: el corpus PubMed y BioASQ pueden reflejar sesgos de la literatura cientifica (infrarrepresentacion de ciertas poblaciones, sesgo de publicacion), que se trasladarian a los rankings de recuperacion.
- No es un modelo generativo: no produce respuestas, solo embeddings; cualquier riesgo de alucinacion recae en el modelo generador que se conecte aguas abajo.
- Metricas modestas en solitario (NDCG@5 de 0,1871): su uso aislado como recuperador denso sobre un corpus de casi 40 millones de documentos es limitado; rinde mejor en hibrido con BM25.
- Longitud de contexto no declarada: se desconoce la longitud maxima de secuencia efectiva para pasajes largos.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el mismo dia (26 de noviembre de 2026) y no hay indicios de soporte continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ue2627-ir-gir/medir-rag-bi-encoder-merged
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Codigo de entrenamiento: `train_bi_encoder.py` (incluido en el repositorio del modelo)
- Proyecto MedIR-RAG, Universidad de Evora: no disponible (no se proporciona URL en la informacion)
- Paper o blog del modelo: no disponible
