# ukung/semantic-lite

## Resumen

Semantic-lite es un modelo de embeddings multilingue desarrollado por el usuario ukung y publicado en HuggingFace bajo licencia Apache-2.0. Se construye a partir de Qwen3-0.6B mediante poda de capas (de 28 a 6), lo que reduce el modelo de 596 M a 250 M de parametros (2,4 veces mas pequeno) manteniendo, segun su autor, un rendimiento en recuperacion igual o superior al de modelos de embeddings dedicados. Produce vectores de 1024 dimensiones y admite secuencias de hasta 8192 tokens.

El modelo esta pensado para tareas de similitud semantica, busqueda semantica, recuperacion cross-lingue, clustering, deteccion de duplicados, mineria de parafrasis y generacion aumentada por recuperacion (RAG). Su interes practico reside en la combinacion de un tamano reducido (250 M de parametros, repositorio de 0,5 GB) con una ventana de contexto de 8192 tokens y cobertura multilingue heredada de Qwen3.

Es relevante ahora porque la mayoria de modelos de embeddings multilingues con contexto largo superan los 500 M de parametros, mientras que las alternativas ligeras suelen limitarse a 512 tokens de contexto y a un subconjunto reducido de idiomas. Semantic-lite intenta ocupar ese hueco, aunque su adopcion es todavia muy baja (0 descargas y 1 like en el momento de redactar esta ficha) y no se han publicado evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3-0.6B, podado de 28 a 6 capas, adaptado a extraccion de caracteristicas (embeddings) |
| Parametros totales | 249.969.152 (250 M); el modelo base tenia 596 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (secuencia maxima) |
| Tipos de cuantizacion | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales) |
| Idiomas soportados | Multilingue; el autor declara herencia de la cobertura de Qwen3 (mas de 100 idiomas) y la metadata lista 23: en, id, fr, es, de, pt, it, nl, ja, zh, ko, ar, ru, vi, th, tr, pl, uk, sv, fa, he, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 1024 |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction / sentence-similarity |
| Tamano del repositorio | 0,5 GB |
| Creado / actualizado | 2026-09-13 (segun la ficha de HuggingFace) |

## Arquitectura y entrenamiento

Semantic-lite es un transformer decoder de tipo Qwen3 truncado: se conservan 6 de las 28 capas del modelo base Qwen3-0.6B y se utiliza la salida del modelo como representacion densa de la frase o documento. La poda de capas es la unica transformacion documentada; el autor no especifica si hubo destilacion posterior, ajuste fino supervisado con pares de similitud, entrenamiento contrastivo ni ninguna otra etapa de adaptacion. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

El modelo base Qwen3-0.6B es un transformer decoder con atencion por grupos (GQA), RoPE y normalizacion RMSNorm; semantic-lite hereda esa arquitectura en las capas conservadas, pero al tratarse de un modelo de embeddings no genera texto: su salida util es el vector de 1024 dimensiones. Conviene senalar que, al podar capas pero conservar el vocabulario original, es previsible que una parte importante de los 250 M de parametros resida en las matrices de embeddings; el autor no desglosa la distribucion de parametros.

Como innovacion tecnica, lo mas destacable es precisamente el enfoque de poda agresiva sobre un modelo generativo pequeno para reutilizarlo como encoder de frases, junto con la ventana de 8192 tokens que se conserva tras la poda. El autor recomienda el uso de prompts asimetricos ("query: " para consultas y "passage: " para documentos) en consultas cortas y abstractas, una tecnica habitual en recuperacion densa que mejora la precision.

## Capacidades

- Generacion de embeddings de frases y documentos con salida de 1024 dimensiones, normalizable mediante `normalize_embeddings=True`.
- Similitud semantica entre pares de textos, con similitudes altas (0,96) para frases parafraseadas y menores (0,79) para textos no relacionados, segun los ejemplos del autor.
- Busqueda semantica sobre corpus vectorizados, comparando la consulta con los documentos mediante producto escalar.
- Recuperacion cross-lingue: los ejemplos del autor muestran correspondencia entre una consulta en indonesio y documentos en indonesio, frances, espanol e ingles.
- Clustering de textos con embeddings normalizados y algoritmos como KMeans de scikit-learn.
- Deteccion de duplicados y mineria de parafrasis mediante `util.paraphrase_mining` de sentence-transformers.
- Codificacion por lotes (batch encoding) para corpus de miles de documentos.
- Aplicaciones de recomendacion basadas en similitud entre preferencias de usuario y descripciones de items.
- Soporte de prompts asimetricos para consultas cortas o abstractas.
- Soporte para despliegue con text-embeddings-inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en la ficha).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de representacion vectorial.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo indexa una base de conocimiento y recupera el fragmento mas relevante para la consulta del usuario antes de pasarlo a un LLM generador. Los 8192 tokens de contexto permiten indexar documentos largos sin trocearlos en exceso, lo que reduce la perdida de contexto en la recuperacion.
- Busqueda semantica en documentacion tecnica: permite consultas en lenguaje natural sobre manuales o wikis internas, con independencia de que la consulta y el documento esten en idiomas distintos, gracias a la cobertura multilingue declarada.
- Deteccion de duplicados y near-duplicates en tickets de soporte o incidencias: vectorizando el historico de tickets y aplicando un umbral de similitud coseno se pueden agrupar incidencias equivalentes redactadas de formas distintas.
- Deduplicacion de datasets de entrenamiento: al ser un modelo de 250 M de parametros, se puede ejecutar sobre millones de documentos en CPU o en una GPU consumer, lo que abarata el proceso frente a encoders de mayor tamano.
- Clustering y organizacion de corpus no etiquetados: agrupar noticias, resenas o articulos por tematica para analisis exploratorio o para generar etiquetas de categoria de forma semiautomatica.
- Moderacion y enrutado de peticiones: clasificar la intencion o el tema de una consulta entrante comparandola con un conjunto de frases de referencia, y derivarla al flujo adecuado.
- Sistemas de recomendacion basados en contenido: representar catalogo y preferencias de usuario en el mismo espacio vectorial de 1024 dimensiones para ordenar items por afinidad sin necesidad de historial de interacciones.
- Memoria semantica para agentes: almacenar resumenes o hechos en una base vectorial y recuperar los mas relevantes por similitud para inyectarlos en el prompt del agente.
- Normalizacion y matching de entidades: comparar nombres de productos, empresas o direcciones entre sistemas distintos para detectar equivalentes pese a variaciones de redaccion o idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MTEB, MIRACL, BEIR ni de ninguna otra suite de evaluacion, y tampoco ofrece comparaciones cuantitativas con modelos de embeddings dedicados mas alla de la afirmacion cualitativa de que "iguala o supera a modelos de embeddings dedicados en recuperacion". Los unicos numeros presentes en la documentacion son similitudes de ejemplo entre frases concretas (0,96 entre parafrasis, 0,79 entre textos no relacionados, 0,91 entre duplicados), que son ilustrativos y no constituyen una evaluacion sistematica.

## Requisitos de hardware

- VRAM estimada de pesos: aproximadamente 1,0 GB en FP32, 0,5 GB en FP16/BF16 y 0,25 GB en INT8.
- Consumo total en inferencia: por debajo de 2 GB en FP16 incluso con lotes moderados, aunque la memoria de activaciones crece con la longitud de secuencia (hasta 8192 tokens) y con el tamano de lote; no hay cifras publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica (RTX 3060, RTX 4060, RTX 4090, T4, L4). En centros de datos, A100 y H100 funcionan pero estan sobredimensionadas para 250 M de parametros; el cuello de botella real sera el lote y el volumen de datos.
- GPU consumer: si, cabe con holgura en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente. Tambien es viable en CPU para lotes pequenos o medianos.
- Opciones de despliegue: sentence-transformers (via PyTorch), text-embeddings-inference (etiqueta declarada en la ficha), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y servidores de embeddings compatibles con la interfaz de sentence-transformers. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma oficial; tampoco hay confirmacion de soporte en vLLM ni ONNX.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por lote ni de documentos por segundo.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas publicas y pueden variar; no se dispone de resultados de benchmarks comparativos para semantic-lite, por lo que la comparacion se limita a caracteristicas objetivas.

| Modelo | Parametros | Dimensiones | Contexto maximo | Licencia | Observaciones |
|---|---|---|---|---|---|
| semantic-lite (ukung) | 250 M | 1024 | 8192 tokens | Apache-2.0 | Derivado de Qwen3-0.6B por poda 28 a 6 capas; sin benchmarks publicados; adopcion practicamente nula |
| Qwen3-Embedding-0.6B | 596 M | hasta 1024 | 32768 tokens | Apache-2.0 | Modelo base de la misma familia, sin podar; mayor coste de inferencia |
| multilingual-e5-base | 278 M | 768 | 512 tokens | MIT | Referencia consolidada en recuperacion multilingue, con contexto mucho mas corto |
| multilingual-e5-small | 118 M | 384 | 512 tokens | MIT | Alternativa mas ligera, pero con menor dimensionalidad y contexto reducido |
| paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 384 | 128 tokens | Apache-2.0 | Muy extendido para similitud de frases, pero limitado a textos cortos |

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay resultados de MTEB, BEIR ni MIRACL, y la afirmacion de rendimiento superior a modelos dedicados no esta respaldada por datos verificables en la informacion disponible.
- Proceso de entrenamiento no documentado: se desconoce si la poda se acompano de ajuste fino, destilacion o entrenamiento contrastivo. Un modelo podado sin reentrenamiento posterior suele degradar la calidad de los embeddings, y no hay evidencia publicada en sentido contrario.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas atipicas en la ficha (creacion y actualizacion en septiembre de 2026), un detalle que conviene verificar antes de integrar el modelo en un sistema en produccion.
- Cobertura idiomatica declarada de forma inconsistente: se anuncia herencia de mas de 100 idiomas, pero la metadata solo lista 23, y no se aportan metricas por idioma. El rendimiento en idiomas no listados es una incognita.
- Sesgos heredados: al derivar de Qwen3-0.6B, el modelo puede arrastrar los sesgos de genero, culturales y geopoliticos presentes en los datos de preentrenamiento de la familia Qwen3, que no han sido documentados ni mitigados de forma especifica.
- Comportamiento de similitud poco calibrado: en los propios ejemplos del autor, dos frases claramente no relacionadas alcanzan una similitud de 0,85, lo que sugiere una escala comprimida y la necesidad de calibrar umbrales por caso de uso en lugar de usar valores absolutos.
- Contexto de 8192 tokens: aunque amplio, no cubre documentos muy largos, y no se ha publicado informacion sobre el efecto del truncado ni sobre el rendimiento en secuencias cercanas al maximo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No obstante, conviene revisar la licencia del modelo base Qwen3-0.6B por si impone condiciones adicionales sobre los modelos derivados.
- No apto para generacion de texto: es un modelo de embeddings; usarlo como LLM generador producira resultados sin sentido.
- Riesgo en produccion: sin benchmarks, sin historial de mantenimiento y con un unico autor, el modelo deberia tratarse como experimental y validarse contra un corpus propio antes de sustituir a un encoder ya establecido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukung/semantic-lite
- Modelo base: Qwen3-0.6B (familia Qwen3, Alibaba) — referencia accesible desde la ficha del autor, sin enlace directo incluido en la informacion proporcionada
- Libreria sentence-transformers: no se incluye enlace en la informacion proporcionada
- Paper, blog o repositorio del modelo: no disponible
- Demos o espacios asociados: no disponible

Nota: las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los unicos resultados obtenidos trataban sobre el clima de Moorea (Polinesia Francesa) y no guardan ninguna relacion con esta ficha.
