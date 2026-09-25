# w4ngg/VN_reranker_legal

## Resumen

w4ngg/VN_reranker_legal es un modelo de reranking (reordenacion) orientado al dominio juridico, publicado por el usuario w4ngg en HuggingFace. Por su etiqueta de arquitectura (xlm-roberta) y su numero de parametros (567.755.777, en el rango de un encoder tipo XLM-R large), se trata de un cross-encoder que recibe un par consulta-documento y produce una puntuacion de relevancia, pensado para colocarse como segunda etapa de un pipeline de recuperacion aumentada por generacion (RAG) sobre documentacion legal.

El modelo resuelve un problema concreto en sistemas de busqueda juridica: la recuperacion densa o lexica devuelve candidatos con ruido, y un cross-encoder reordena esos candidatos con mucha mayor precision que un bi-encoder, porque procesa consulta y documento de forma conjunta. El prefijo "VN" del identificador y los repositorios relacionados del mismo autor (DSC-Legal-IR-QA, un sistema de recuperacion de informacion juridica vietnamita) apuntan a que el dominio objetivo es el derecho vietnamita, aunque la model card no lo confirma de forma explicita.

La relevancia actual del modelo es limitada pero clara: es un artefacto muy reciente (creado el 24 de septiembre de 2026 segun los metadatos), sin descargas ni "likes", sin model card descriptiva y sin benchmarks publicados. Su interes esta, por tanto, en su uso como componente especializado dentro de un stack RAG juridico vietnamita, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (etiqueta `xlm-roberta`); uso esperado como cross-encoder de reranking |
| Parametros totales | 567.755.777 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia XLM-RoBERTa tiene un limite tipico de 512 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (2,3 GB, consistente con fp32) |
| Idiomas soportados | no disponible en la model card; el identificador y los repositorios relacionados apuntan al vietnamita, sin confirmacion oficial |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre el entrenamiento en la model card, que se limita a la linea de licencia `apache-2.0`. La unica evidencia estructural es la etiqueta `xlm-roberta` y el recuento de parametros de los safetensors (567.755.777), compatible con una inicializacion a partir de un encoder multilingue tipo XLM-R large y un ajuste fino posterior para una tarea de puntuacion de pares (query, documento). No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de NLI supervisado, destilacion, DPO/RLHF ni sobre ninguna innovacion tecnica declarada.

En el contexto de los repositorios del mismo autor, el reranker aparece integrado en un pipeline de recuperacion juridica (DSC-Legal-IR-QA), y los modelos vietnamitas de reranking juridico publicos suelen construirse a partir de datos de inferencia de lenguaje natural (NLI) convertidos a pares consulta-documento con etiqueta binaria, o de conjuntos de recuperacion juridica anotados. Es una practica habitual en la categoria, pero no un dato confirmado para este checkpoint concreto.

## Capacidades

- Puntuacion de relevancia de pares consulta-documento (cross-encoder), apta para reordenar listas de candidatos devueltas por un retriever.
- Recuperacion de informacion en dominio juridico, presumiblemente en vietnamita y con terminologia normativa.
- Integracion como segunda etapa en pipelines RAG (retrieve and rerank) antes de la generacion con un modelo de lenguaje.
- Procesamiento por lotes de pares, propio de los cross-encoders basados en encoder bidireccional.
- Capacidad multilingue potencial heredada de XLM-RoBERTa, no documentada ni verificada en este checkpoint.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling y uso agentico: no disponibles; el modelo es un reranker, no un modelo generativo ni una politica de agentes.
- Modo "thinking", decodificacion especulativa o atencion lineal: no disponibles.

## Casos de uso

- Busqueda juridica en produccion: dado un conjunto de articulos, decretos o sentencias recuperados por un retriever vectorial sobre Qdrant o similar, el reranker reordena los candidatos por relevancia real respecto a la consulta del usuario, elevando la precision en el top-5 que se pasa al generador.
- Asistente legal con RAG: como etapa intermedia entre la recuperacion y el modelo generativo (por ejemplo, un Llama-3 en un backend FastAPI), para reducir el contexto irrelevante y el coste en tokens de la generacion.
- Deteccion de conflictos normativos: en pipelines que comparan articulos de distintas normas, la puntuacion de relevancia del cross-encoder ayuda a identificar que textos regulatorios son realmente comparables entre si antes de aplicar la logica de deteccion.
- Filtrado de citas y referencias: verificar si un fragmento normativo citado por un usuario o por un modelo generativo corresponde realmente a la consulta planteada, como capa de control de calidad.
- Deduplicacion semantica de documentos: puntuar pares de fragmentos para agrupar versiones redundantes de un mismo articulo o consolidar resultados de varias fuentes oficiales.
- Evaluacion y auditoria de retrievers: usar el reranker como juez de relevancia relativa para medir la calidad de un indice vectorial o de un modelo de embeddings en un corpus juridico.
- Preprocesado de corpus para anotacion: priorizar pares consulta-documento candidatos para revision humana en la construccion de conjuntos de datos juridicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas, no tiene descargas y no aparece ningun resultado de evaluacion (NDCG, MRR, Recall@k, MMLU, HumanEval u otros) asociado a este identificador.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los pesos ocupan unos 2,27 GB y con activaciones y lotes de tamanos tipicos el consumo se situa en el rango de 3 a 5 GB; en fp16, los pesos bajan a unos 1,13 GB; en int8 a unos 0,57 GB; en 4 bits a unos 0,28-0,35 GB.
- GPU recomendadas: el modelo cabe holgadamente en tarjetas de consumo. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB permiten lotes grandes y baja latencia. En entornos de servidor, una NVIDIA L4, A10G, A100 o H100 ofrecen margen de sobra para servir con concurrencia alta.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: `sentence-transformers` con la clase CrossEncoder, HuggingFace Text Embeddings Inference (TEI) con soporte de reranking, vLLM mediante su API de scoring, ONNX Runtime o TensorRT para optimizacion, y un servicio FastAPI propio, que es el patron que aparece en los repositorios del autor.
- Latencia y throughput estimados: no disponibles. Al ser un cross-encoder, el coste crece linealmente con el numero de pares (consulta, documento) y con la longitud de cada documento, por lo que el throughput depende directamente del tamano del lote y de la longitud de los fragmentos juridicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| w4ngg/VN_reranker_legal | 567.755.777 | no disponible | no disponible (probable vietnamita) | apache-2.0 | HuggingFace, 0 descargas |
| ngdangkhanh/vietnamese-law-rerank-model | no disponible | no disponible | vietnamita | no disponible | HuggingFace |
| AITeamVN/Vietnamese_Reranker | no disponible | no disponible | vietnamita | no disponible | HuggingFace |
| BAAI/bge-reranker-v2-m3 | no disponible en la informacion recogida | no disponible en la informacion recogida | multilingue | no disponible en la informacion recogida | HuggingFace (referencia externa, datos no verificados en esta busqueda) |

Los dos primeros alternativos proceden de la busqueda web y estan orientados al mismo nicho (reranking juridico en vietnamita); el tercero se incluye como referencia de la categoria de rerankers multilingues, pero sus cifras no se han confirmado con la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion de la tarea exacta, del formato de entrada, del significado de la puntuacion de salida ni de las instrucciones de uso. Es imprescindible validar el comportamiento antes de integrarlo.
- Sin benchmarks publicados ni evaluaciones de terceros: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Sin usuarios ni descargas: el modelo no ha sido validado por la comunidad, por lo que los fallos de entrenamiento, sesgos o artefactos no estan documentados.
- Idioma y dominio no confirmados: aunque el identificador y el ecosistema del autor apuntan al vietnamita juridico, la model card no declara idiomas soportados. Usarlo fuera de ese dominio o idioma es una extrapolacion sin garantias.
- Riesgo de sesgo de dominio y de falsos positivos: un reranker ajustado en un corpus juridico concreto puede sobrevalorar fragmentos con vocabulario normativo aunque no respondan a la consulta, y penalizar parafrasis coloquiales.
- Limitacion de contexto: si el checkpoint hereda el limite de 512 tokens de XLM-RoBERTa, los documentos largos deben trocearse, lo que fragmenta articulos y puede degradar la puntuacion.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero no cubre las obligaciones derivadas del uso de los datos de entrenamiento, que se desconocen.
- Metadatos anomales: la fecha de creacion registrada (24 de septiembre de 2026) es posterior a la fecha habitual de publicacion de modelos en el ecosistema, lo que sugiere un artefacto de metadatos o una publicacion muy reciente. Conviene verificar la vigencia del repositorio.
- En produccion, un reranker solo no resuelve el problema: su rendimiento final depende del retriever que alimenta los candidatos y del generador que consume los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/w4ngg/VN_reranker_legal
- Repositorio del autor con el reranker integrado: https://github.com/w4ngg/DSC-Legal-IR-QA/blob/main/retrieval/src/legal_ir/reranker.py
- Sistema Legal-RAG con modulo de reranking: https://github.com/ngnam1104/Legal-RAG/blob/main/backend/models/reranker.py
- Modelo alternativo vietnamita de reranking juridico: https://huggingface.co/ngdangkhanh/vietnamese-law-rerank-model
- Reranker vietnamita de AITeamVN: https://huggingface.co/AITeamVN/Vietnamese_Reranker
- Articulo sobre recuperacion de informacion juridica vietnamita en sistemas de pregunta-respuesta: https://arxiv.org/html/2409.13699v1
