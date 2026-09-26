# thongbuind/SAI-Embedding_100M

## Resumen

SAI-Embedding_100M es un modelo de embeddings de frases y parrafos en vietnamita desarrollado por el autor thongbuind. Se construye convirtiendo un modelo de lenguaje decoder-only, SAI_100M, en un codificador de texto (text encoder) siguiendo el metodo LLM2Vec. El resultado es un modelo de ~114 millones de parametros que reutiliza integramente el backbone del LLM original, sin reentrenar desde cero y sin anadir ninguna cabeza de proyeccion.

El modelo resuelve el problema de generar representaciones densas de frases para busqueda semantica y recuperacion de informacion (retrieval) en vietnamita, un idioma con menor cobertura en la familia de modelos de embedding habituales. La motivacion tecnica es que los LLM decoder-only, pese a haber absorbido mucho conocimiento linguistico en su pretraining, no sirven directamente como codificadores por su atencion causal; LLM2Vec demuestra que basta con activar atencion bidireccional y aplicar unas pocas etapas de adaptacion.

El modelo ofrece 768 dimensiones de embedding con soporte Matryoshka (recortable a 512/256/128/64) y una longitud maxima de 2.048 tokens, aunque fue entrenado con pasajes de 256 a 512 tokens. Se publica bajo el pipeline sentence-similarity y se evalua sobre cuatro conjuntos de retrieval y uno de similitud semantica (STS) en vietnamita. Es relevante ahora como ejemplo de adaptacion de LLM pequenos a tareas de embeddings en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only convertido a codificador de texto mediante LLM2Vec; pre-norm con RMSNorm, Grouped Query Attention con RoPE y FFN SwiGLU |
| Parametros totales | 113.867.520 (~114M) |
| Longitud de contexto | 2.048 tokens (entrenamiento con pasajes de 256-512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensiones de embedding | 768, recortables a 512 / 256 / 128 / 64 (Matryoshka) |
| Modelo base | thongbuind/SAI_100M |
| Tamano del repositorio | 0,9 GB |
| Funcion de similitud | coseno (salida L2-normalizada) |
| Vocabulario | 10.000 tokens (SentencePiece Unigram) |

## Arquitectura y entrenamiento

El backbone es el de SAI_100M, un Transformer decoder-only en vietnamita con 12 capas, hidden size de 768, 12 cabezas de atencion, 6 cabezas KV, dimension de FFN de 3.072, contexto de 2.048 y vocabulario de 10.000. Cada bloque usa pre-norm con RMSNorm, Grouped Query Attention con RoPE y una red feed-forward SwiGLU; ninguna capa lineal emplea bias. El tokenizer es SentencePiece Unigram, entrenado sobre texto vietnamita en minusculas y con byte fallback. SAI-Embedding_100M mantiene intacta esta arquitectura; la cabeza de lenguaje solo interviene en la fase MNTP y no participa en la generacion de embeddings.

El proceso de conversion consta de dos etapas. La primera activa la atencion bidireccional (se elimina la mascara causal, dejando solo el bloqueo de tokens de relleno) y adapta el modelo con masked next-token prediction: se selecciona aleatoriamente el 20 % de los tokens reales (excluyendo `[BOS]`) y se sustituyen segun un patron 80/10/10 (80 % por token de mascara, 10 % por token aleatorio, 10 % sin cambios), prediciendo el token enmascarado en la posicion i desde el hidden state en i-1 a traves de la cabeza LM existente. Como el tokenizer no dispone de `[MASK]`, se usa `[UNK]` en su lugar. La segunda etapa aplica aprendizaje contrastivo supervisado con InfoNCE bidireccional, hard negatives y Matryoshka Representation Learning. A diferencia del LLM2Vec original, aqui se hace fine-tune completo de todos los parametros en lugar de LoRA, se omite la fase no supervisada SimCSE y se emplea batch de mismo origen junto con enmascaramiento de negativos falsos.

## Capacidades

- Generacion de embeddings de frases y parrafos en vietnamita para similitud semantica y recuperacion de informacion.
- Representaciones densas de 768 dimensiones, recortables a 512/256/128/64 mediante Matryoshka sin reentrenar.
- Recuperacion de documentos (retrieval) sobre pasajes de hasta 2.048 tokens.
- Calculo de similitud semantica de texto (STS) en vietnamita.
- Soporte de similitud por coseno con vectores ya normalizados en L2.
- Uso como componente de ranking y reordenacion (reranking) dentro de pipelines de busqueda.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Modelo monolingue: solo vietnamita.

## Casos de uso

- Busqueda semantica en vietnamita: indexar un corpus de documentos en vietnamita y recuperar pasajes relevantes comparando la consulta con los embeddings mediante similitud coseno, aprovechando la ventana de 2.048 tokens por fragmento.
- Sistemas RAG (generation aumentada por recuperacion): usar el modelo como recuperador denso que alimenta a un LLM generador, reduciendo el coste de almacenamiento gracias a las dimensiones Matryoshka recortables.
- Deduplicacion y agrupacion de contenido: calcular embeddings de articulos o registros y detectar duplicados o clusters tematicos por proximidad de vectores.
- Clasificacion de texto por similitud: asignar etiquetas comparando cada texto con embeddings de referencia de cada categoria, sin entrenar un clasificador especifico.
- Moderacion y filtrado semantico: recuperar o marcar contenido similar a patrones definidos dentro de una plataforma en vietnamita.
- Reordenacion de resultados de busqueda: combinar un recuperador lexico rapido con este modelo como reranker semantico para mejorar la precision de los primeros resultados.
- Analisis de encuestas y comentarios: agrupar opiniones o tickets de soporte en vietnamita por significado para obtener temas recurrentes.
- Construccion de indices vectoriales economicos: su tamano de ~114M parametros permite generar embeddings a bajo coste y almacenarlos en dimensiones reducidas (por ejemplo 128) para bases de datos vectoriales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que el modelo fue evaluado sobre cuatro conjuntos de recuperacion de texto y un conjunto de similitud semantica (STS) en vietnamita, siguiendo el formato BEIR, pero no se proporcionan las cifras obtenidas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente 0,46 GB; en FP16/BF16 aproximadamente 0,23 GB; en int8 aproximadamente 0,12 GB (solo pesos, sin tener en cuenta activaciones ni el tokenizer).
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM; tambien funciona en CPU. GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo transformers con codigo personalizado (custom_code) y pipeline sentence-similarity, se puede servir con Hugging Face Transformers y librerias de sentence-transformers/embeddings; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible (el formato publicado es safetensors).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos alternativos en la informacion proporcionada. Como referencia directa, el propio modelo base se incluye a continuacion; el resto de comparaciones queda marcado como no disponible.

| Modelo | Parametros | Contexto | Dimensiones | Licencia | Notas |
|---|---|---|---|---|---|
| SAI-Embedding_100M | ~114M | 2.048 | 768 (Matryoshka) | no disponible | Modelo de embeddings adaptado via LLM2Vec |
| SAI_100M (base) | ~114M | 2.048 | no aplica | no disponible | LLM decoder-only de partida, no genera embeddings |
| Otros modelos de embedding en vietnamita | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la informacion facilitada |

## Limitaciones y advertencias

- Modelo monolingue: solo soporta vietnamita, segun la etiqueta de idioma `vi`. No se garantiza un rendimiento adecuado en otros idiomas.
- Sin licencia declarada en la informacion disponible: el uso comercial queda sin definir y debe consultarse con el autor antes de utilizarlo en produccion.
- No se han publicado cifras de benchmarks en la informacion facilitada, por lo que el rendimiento real no puede verificarse.
- Riesgo de alucinacion no aplicable al ser un modelo de embeddings, pero si puede producir representaciones poco discriminativas en dominios fuera de su entrenamiento.
- Entrenado con pasajes de 256-512 tokens aunque admite entradas de hasta 2.048; los textos muy largos pueden degradar la calidad del embedding.
- Rendimiento no validado en tareas distintas a retrieval y STS (por ejemplo, clasificacion o clustering) en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica poca adopcion y validacion por parte de la comunidad.
- Requiere codigo personalizado (custom_code), lo que puede complicar su carga en entornos estandar sin la version adecuada de las librerias.
- Riesgo de sesgos inherentes al corpus de pretraining del LLM base, no documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thongbuind/SAI-Embedding_100M
- Modelo base SAI_100M: https://huggingface.co/thongbuind/SAI_100M
- Repositorio de desarrollo de SAI: https://github.com/thongbuind/SAI_dev2
- Paper de LLM2Vec (BehnamGhader et al., 2024): https://arxiv.org/abs/2404.05961
- Paper de InfoNCE / Contrastive Predictive Coding: https://arxiv.org/abs/1807.03748
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Referencia adicional en tags (arxiv:2101.06983): https://arxiv.org/abs/2101.06983
- Referencia adicional en tags (arxiv:2212.03533): https://arxiv.org/abs/2212.03533
- Referencia adicional en tags (arxiv:2104.08663): https://arxiv.org/abs/2104.08663
