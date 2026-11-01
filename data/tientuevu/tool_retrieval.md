# tientuevu/tool_retrieval

## Resumen

`tientuevu/tool_retrieval` es un repositorio de HuggingFace que, segun los metadatos y la model card disponibles, contiene una adaptacion del modelo de embeddings BGE-M3 de BAAI (FlagOpen). Se trata de un modelo de sentence-transformers orientado a la extraccion de caracteristicas y la similitud semantica, pensado para tareas de recuperacion de informacion y, por el nombre del repositorio, especificamente para la recuperacion de herramientas (tool retrieval) en pipelines de agentes. El autor del repositorio es `tientuevu`, pero la model card hace referencia explicita al proyecto original BGE-M3 de BAAI, lo que sugiere que se trata de un fine-tuning o una copia derivada de dicho modelo base.

La relevancia de BGE-M3, y por extension de esta adaptacion, radica en su triple funcionalidad: recuperacion densa, recuperacion multi-vector (estilo ColBERT) y recuperacion dispersa (lexica, tipo BM25), todo ello con soporte para mas de 100 idiomas y una longitud de contexto de hasta 8192 tokens. Esto lo convierte en una pieza util para sistemas RAG y para la seleccion dinamica de herramientas en agentes basados en LLM, donde el modelo debe decidir que funcion o API es la adecuada para una consulta dada.

No obstante, la informacion publica del repositorio es muy escasa: cero descargas, cero likes, repositorio de 0.0 GB y sin resultados de benchmarks propios. La mayor parte de los datos tecnicos que se pueden aportar proceden de la model card del BGE-M3 original, no de esta adaptacion concreta, por lo que deben interpretarse como referencia del modelo base y no como garantia de rendimiento del artefacto alojado en `tientuevu/tool_retrieval`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa-large, con extension de longitud de contexto a 8192 tokens y preentrenamiento RetroMAE (segun la model card del BGE-M3 original) |
| Parametros totales | no disponible (el modelo base BGE-M3 se basa en XLM-RoBERTa-large, aproximadamente 568M parametros, pero no se confirma para esta adaptacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (segun la model card del BGE-M3 original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mas de 100 idiomas segun la model card del BGE-M3 original; no se confirma para esta adaptacion |
| Licencia | MIT |
| Formato de pesos | safetensors (segun los tags del repositorio) |

## Arquitectura y entrenamiento

La model card del repositorio describe el BGE-M3 original, del que esta adaptacion parece derivar. BGE-M3 se construye a partir de XLM-RoBERTa-large, cuya longitud de contexto se extiende hasta 8192 tokens y se preentrena adicionalmente con RetroMAE (modelo `bge-m3-retromae`). Sobre esa base se aplica aprendizaje contrastivo (`bge-m3-unsupervised`) y, finalmente, un fine-tuning unificado que entrena simultaneamente las tres cabeceras de recuperacion: densa, dispersa y multi-vector (`bge-m3`). La dimension de embedding denso es de 1024.

El entrenamiento unificado permite que un mismo modelo genere, en una sola pasada, un embedding denso, pesos lexicos tipo BM25 (recuperacion dispersa) y representaciones multi-vector estilo ColBERT. Los datos de fine-tuning estan publicados como `bge-m3-data`, y el dataset MLDR (13 idiomas) se utiliza para evaluacion de recuperacion de documentos largos. No se dispone de informacion sobre el proceso de entrenamiento especifico de la adaptacion `tool_retrieval`, ni sobre si se aplicaron datos de tool calling, RLHF o DPO. Tampoco se detalla el volumen de tokens utilizado.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para similitud semantica entre consultas y documentos o herramientas.
- Recuperacion dispersa (sparse retrieval) con pesos lexicos por token, util para coincidencia exacta de terminos y nombres de funciones.
- Recuperacion multi-vector (estilo ColBERT) para matching a nivel de token entre consulta y candidato.
- Procesamiento de entradas de hasta 8192 tokens, lo que permite indexar descripciones largas de herramientas, documentacion de APIs o fragmentos extensos de codigo.
- Soporte multilingue de mas de 100 idiomas segun la model card del modelo base.
- Aplicable a recuperacion de herramientas (tool retrieval) por el nombre del repositorio, aunque no se detalla el dataset ni el esquema de entrenamiento especifico.
- No se documentan capacidades de generacion de texto, razonamiento, codigo generativo, vision ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Seleccion dinamica de herramientas en agentes LLM: dado un catalogo de funciones o APIs descritas en lenguaje natural, el modelo genera embeddings de la consulta del usuario y de cada herramienta para recuperar las candidatas mas relevantes antes de que el LLM decida cual invocar.
- Enrutamiento de consultas en atencion al cliente: clasificar la intencion del usuario y dirigirla al departamento o flujo adecuado comparando la consulta con descripciones predefinidas de cada cola o servicio.
- Busqueda semantica sobre documentacion tecnica: indexar manuales, READMEs y referencias de API de hasta 8192 tokens y recuperar los fragmentos relevantes para responder consultas de desarrolladores.
- Recuperacion hibrida en pipelines RAG: combinar la salida densa y la dispersa del modelo con BM25 en motores como Milvus o Vespa para mejorar la precision en consultas con terminos exactos (nombres de funciones, codigos de error).
- Deduplicacion y agrupacion de tickets o incidencias: calcular similitud entre descripciones de tickets para agrupar casos equivalentes y reducir el volumen de trabajo manual en mesas de ayuda.
- Filtrado previo en sistemas de recomendacion de contenido: comparar perfiles o consultas de usuarios con descripciones de articulos o recursos para generar candidatos antes de un re-ranking supervisado.
- Re-ranking ligero en pipelines de recuperacion: usar las representaciones multi-vector para refinar los resultados devueltos por un primer recuperador, reduciendo falsos positivos antes de un cross-encoder mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta adaptacion concreta. La model card del BGE-M3 original menciona mejoras en la evaluacion MIRACL tras corregir un error de filtrado de pasajes (actualizacion de julio de 2024) y cita un benchmark externo de Towards Data Science en el que BGE-M3 supera a modelos de OpenAI en ingles y otros idiomas, pero no se proporcionan cifras numericas en la informacion facilitada, por lo que no se presentan valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para esta adaptacion. Para un encoder tipo XLM-RoBERTa-large en FP16, la estimacion habitual ronda los 1-2 GB de VRAM, pero no se confirma.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para un encoder de este tamano en FP16; no se dispone de datos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente si (RTX 3060, RTX 4060, RTX 4090), dado el tamano tipico de un encoder de ~568M parametros, aunque no se confirma.
- Opciones de despliegue: sentence-transformers (libreria declarada en el repositorio), ademas de los ecosistemas compatibles con BGE-M3 como Milvus (recuperacion hibrida) y Vespa. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcionalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tientuevu/tool_retrieval | no disponible | 8192 (segun base BGE-M3) | densa, dispersa, multi-vector (segun base) | MIT | HuggingFace, 0 descargas |
| BAAI/bge-m3 | ~568M (XLM-RoBERTa-large) | 8192 | densa, dispersa, multi-vector | MIT | HuggingFace, modelo oficial |
| BAAI/bge-large-en-v1.5 | no disponible | 512 | densa | MIT | HuggingFace, solo ingles |
| BAAI/bge-base-en-v1.5 | no disponible | 512 | densa | MIT | HuggingFace, solo ingles |

La comparativa se basa en los datos de la model card del BGE-M3 original, ya que no hay informacion suficiente sobre el rendimiento o el entrenamiento especifico de `tientuevu/tool_retrieval`. Frente a `bge-large-en-v1.5` y `bge-base-en-v1.5`, la ventaja del modelo base BGE-M3 es el contexto de 8192 tokens, el multilingue y la recuperacion hibrida; la desventaja es un mayor coste computacional por la longitud de contexto y el tamano del encoder.

## Limitaciones y advertencias

- La informacion publica del repositorio es practicamente nula: cero descargas, cero likes, repositorio de 0.0 GB y sin model card propia. No se puede verificar que los pesos esten realmente subidos ni que correspondan a la arquitectura descrita.
- La model card del repositorio es una copia de la del BGE-M3 original; no documenta el proceso de adaptacion a tool retrieval, el dataset utilizado ni las metricas obtenidas.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero la recuperacion de herramientas puede devolver candidatas incorrectas si las descripciones del catalogo son ambiguas o incompletas.
- Sesgos: no documentados; al heredar de XLM-RoBERTa-large y de datos web multilingues, es previsible que arrastre sesgos linguisticos y culturales del corpus original, aunque no se confirma.
- Limitaciones de contexto: la ventana de 8192 tokens corresponde al modelo base; no se confirma que la adaptacion la conserve.
- Restricciones de licencia: licencia MIT declarada, lo que permite uso comercial, pero al ser una adaptacion de un modelo de BAAI conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- Para produccion: al no haber benchmarks ni validacion independiente, no se recomienda desplegar esta adaptacion sin evaluarla contra el BGE-M3 oficial en el propio catalogo de herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tientuevu/tool_retrieval
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Repositorio de codigo FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Codigo especifico de BGE-M3: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset de fine-tuning bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperacion hibrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de Vespa para BGE-M3: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Ejemplo de fine-tuning unificado: https://github.com/FlagOpen/FlagEmbedding/tree/master/examples/unified_finetune
- Repositorio RetroMAE: https://github.com/staoxiao/RetroMAE
- Paper DPR: https://arxiv.org/abs/2004.04906
- Paper RetroMAE: https://arxiv.org/abs/2107.05720
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Paper sobre eficiencia de recuperacion: https://arxiv.org/abs/2106.14807
- Benchmark externo de Towards Data Science: https://towardsdatascience.com/openai-vs-open-source-multilingual-embedding-models-e5ccb7c90f05
- Dataset de reproduccion MIRACL: https://huggingface.co/datasets/hanhainebula/bge-m3_miracl_2cr
