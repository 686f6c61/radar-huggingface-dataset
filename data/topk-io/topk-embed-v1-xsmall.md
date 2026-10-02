# topk-io/topk-embed-v1-xsmall

## Resumen

topk-embed-v1-xsmall es un recuperador (retriever) multimodal de tipo late-interaction desarrollado por topk-io, construido sobre el modelo base Qwen/Qwen3.5-0.8B y publicado bajo licencia Apache 2.0. Con 854.034.496 parametros totales, su funcion no es generar texto, sino producir representaciones vectoriales para busqueda: recibe consultas en texto y las enfrenta tanto a documentos de texto como a imagenes (paginas escaneadas, informes, diapositivas).

A diferencia de los modelos de embeddings clasicos, que comprimen cada entrada en un unico vector, este modelo conserva multiples embeddings por token de texto o por parche de imagen y puntua la relevancia mediante MaxSim: cada vector de la consulta se empareja con su vector mas similar del documento y las similitudes se suman. Este esquema, popularizado por la familia ColBERT, permite capturar coincidencias a nivel de termino y mejora la recuperacion en dominios con vocabulario especifico.

Su relevancia actual reside en tres factores: es multimodal con un unico modelo (texto e imagen comparten espacio de recuperacion), cubre 11 idiomas entre los que se incluye el espanol, y su tamano de 0.8B lo hace desplegable en una sola GPU frente a alternativas multimodales de 3B o mas. Se integra en el ecosistema sentence-transformers mediante la clase MultiVectorEncoder. El repositorio acumula 723 descargas y 10 likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera de recuperacion multi-vector (late interaction, puntuacion MaxSim); multimodal texto-imagen; codigo personalizado (topk_embed) |
| Parametros totales | 854.034.496 (0,85B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; la model card no documenta cuantizaciones. Requiere bfloat16 en GPU) |
| Idiomas soportados | en, ru, fr, nl, de, es, it, pt, da, no (noruego), sv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers, con codigo remoto) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | feature-extraction |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-30 |

## Arquitectura y entrenamiento

El modelo es un late-interaction retriever: en lugar de agregar la salida del encoder en un unico vector de documento, conserva la secuencia de embeddings de los tokens de texto y de los parches de imagen. La consulta tambien se codifica como una secuencia de vectores y la puntuacion se calcula con MaxSim, es decir, para cada vector de consulta se toma el maximo producto escalar contra los vectores del documento y se suman esos maximos. La API expone metodos separados `encode_query` y `encode_document`, y una funcion `similarity` que devuelve una matriz de puntuaciones de una fila por consulta y una columna por documento.

El punto de partida es Qwen/Qwen3.5-0.8B, sobre el que se anade la cabecera multi-vector y el tratamiento de imagenes (etiqueta image-text-to-text), empaquetado como codigo personalizado que debe cargarse con `trust_remote_code=True`. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de refinamiento como RLHF, DPO o ajuste contrastivo con negativos minados. Tampoco se especifica la dimension de los embeddings por token ni la resolucion de los parches de imagen. Toda esta informacion figura como no disponible en la documentacion publicada.

## Capacidades

- Recuperacion texto-a-texto: codifica consultas y documentos y puntua relevancia con MaxSim sobre corpus textuales.
- Recuperacion texto-a-imagen: la misma consulta de texto puede enfrentarse a imagenes como paginas escaneadas, informes o diapositivas, sin necesidad de OCR previo.
- Representacion multi-vector: mantiene un embedding por token o parche, lo que preserva informacion local que los modelos de vector unico pierden.
- Multilingue: 11 idiomas declarados (ingles, ruso, frances, neerlandes, aleman, espanol, italiano, portugues, danes, noruego y sueco), con consultas y documentos potencialmente en idiomas distintos.
- Integracion con sentence-transformers mediante `MultiVectorEncoder`, con carga desde HuggingFace Hub.
- Codificacion por lotes separada para consultas y para documentos, lo que permite preindexar el corpus una sola vez.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso. Su salida son puntuaciones de similitud.
- No se documentan modos de pensamiento, capacidades de audio ni function calling.

## Casos de uso

- Busqueda semantica en RAG sobre documentacion corporativa: se preindexan los fragmentos de texto con `encode_document` una sola vez y en tiempo de consulta se codifica la pregunta con `encode_query`; el esquema multi-vector mejora el recall en consultas con terminos tecnicos o nombres propios poco frecuentes.
- Recuperacion sobre paginas escaneadas y facturas: al aceptar imagenes directamente, evita una etapa de OCR y permite buscar "cual fue el ingreso del tercer trimestre" sobre un PDF escaneado donde el dato esta en una tabla.
- Indexacion de diapositivas y presentaciones: las slides son ricas en contenido visual (graficos, diagramas); el modelo puede recuperar la diapositiva relevante a partir de una consulta textual, util en repositorios internos de conocimiento.
- RAG multilingue en organizaciones europeas: con soporte para espanol, ingles, aleman, frances, italiano, portugues, neerlandes y lenguas nordicas, permite consultar un corpus mixto en varios idiomas desde una unica interfaz de busqueda.
- Busqueda en catalogos de producto con imagen: en comercio electronico, indexar fichas con foto y descripcion y recuperar por consulta textual, aprovechando que ambos formatos comparten espacio de representacion.
- Filtrado y reranking en asistentes internos: dado que devuelve puntuaciones directas, puede actuar como etapa de reranking sobre los candidatos de un buscador lexical (BM25) antes de pasarlos a un LLM generativo.
- Archivado y compliance documental: localizar clausulas o referencias concretas dentro de grandes volumenes de documentos escaneados heterogeneos, donde el OCR introduce errores y un retriever puramente textual falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluacion (ni MTEB, ni BEIR, ni ViDoRe, ni metricas de recall@k) y los resultados de busqueda web obtenidos no contienen informacion tecnica sobre el modelo.

## Requisitos de hardware

- VRAM estimada para pesos: en bfloat16, aproximadamente 1,7 GB para los 854 millones de parametros; en float32, alrededor de 3,4 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM en inferencia: hay que sumar activaciones y el coste de procesar imagenes; un margen practico de 4 a 6 GB en bfloat16 es razonable para lotes pequenos, aunque no se dispone de mediciones oficiales.
- Requisito explicito de la model card: GPU CUDA con soporte de bfloat16, es decir, arquitectura Ampere o posterior (A100, H100, RTX 30xx/40xx y superiores). No se documenta soporte de CPU ni de GPU anteriores.
- GPU recomendadas: cualquier GPU Ampere o superior con al menos 8 GB de VRAM. Una RTX 3060 de 12 GB o una RTX 4090 son suficientes para inferencia; para indexacion a gran escala en lote conviene una A100 o H100 por throughput.
- Despliegue: la via documentada es sentence-transformers con `MultiVectorEncoder` y `trust_remote_code=True`. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, y al no tratarse de un modelo generativo los runners de LLM no son aplicables. Tampoco se documenta exportacion a GGUF.
- Almacenamiento del indice: al ser multi-vector, cada documento ocupa tantos vectores como tokens o parches tenga, por lo que el indice resultante es ordenes de magnitud mayor que con un modelo de vector unico. Conviene planificar el almacenamiento en funcion de la dimension de embedding (no publicada) y del volumen del corpus.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| topk-embed-v1-xsmall | Late interaction multi-vector | 854 M | no disponible | Si (texto e imagen) | Apache 2.0 | Base Qwen3.5-0.8B; 11 idiomas; requiere GPU Ampere o superior |
| Familia ColBERT (por ejemplo ColBERTv2) | Late interaction multi-vector | no disponible | no disponible | No (solo texto) | no disponible | Referencia clasica del esquema MaxSim |
| ColPali | Late interaction multi-vector | no disponible | no disponible | Si (documentos visuales) | no disponible | Enfoque equivalente sobre documentos como imagen |
| jina-colbert-v2 | Late interaction multi-vector | no disponible | no disponible | No (solo texto) | no disponible | Alternativa multilingue de vector multiple |
| Modelos de embedding de vector unico (por ejemplo la familia Qwen3-Embedding) | Bi-encoder denso | no disponible | no disponible | No | no disponible | Menor coste de indice, menor recall en consultas de vocabulario especifico |

Los datos de los modelos comparables no se han podido verificar dentro de la informacion proporcionada; se listan como referencias de categoria y sus campos figuran como no disponibles. No se dispone de comparaciones de rendimiento publicadas.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks publicados, por lo que el rendimiento en recuperacion real (recall@k, nDCG) es desconocido y no puede compararse objetivamente con alternativas.
- Codigo personalizado: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar `modeling_topk_embed.py` antes de usarlo en produccion.
- Dependencia de hardware: la model card exige GPU CUDA con bfloat16 (Ampere o posterior). No hay soporte documentado para CPU ni para GPU antiguas, lo que limita el despliegue en entornos modestos.
- Coste de indice: el esquema multi-vector multiplica el almacenamiento y el tiempo de puntuacion respecto a un bi-encoder de vector unico, ya que la similitud MaxSim recorre todos los vectores del documento.
- Idiomas: aunque se declaran 11 idiomas, no se especifica el volumen de datos de entrenamiento por idioma ni la calidad relativa; el rendimiento en espanol podria ser inferior al del ingles.
- Sesgos: los sesgos heredados del modelo base Qwen3.5-0.8B y de los datos de entrenamiento no se documentan ni se han evaluado en la model card.
- Alucinacion: al ser un recuperador, no genera texto y por tanto no alucina contenido, pero si puede producir puntuaciones de relevancia mal calibradas que, aguas abajo, induzcan a un LLM generativo a responder sobre documentos irrelevantes.
- Fechas de publicacion y actualizacion muy recientes (septiembre de 2026) y bajo numero de descargas (723), lo que implica poca validacion independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no cubre las condiciones del modelo base Qwen/Qwen3.5-0.8B, que deben verificarse por separado.
- No se documentan limites de longitud de secuencia ni estrategias de truncado para documentos largos o imagenes de alta resolucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/topk-io/topk-embed-v1-xsmall
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- requirements.txt del repositorio: https://huggingface.co/topk-io/topk-embed-v1-xsmall/blob/main/requirements.txt
- Sitio del autor (TopK, busqueda multi-vector en produccion): https://topk.io

Nota: los resultados de busqueda web devueltos para esta consulta no contenian informacion tecnica sobre el modelo (eran resultados no relacionados sobre perfiles de redes sociales), por lo que no se han incorporado enlaces adicionales como papers, blogs o repositorios de evaluacion.
