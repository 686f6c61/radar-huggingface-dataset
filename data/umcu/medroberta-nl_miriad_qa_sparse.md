# UMCU/MedRoBERTa.nl_Miriad_QA_sparse

## Resumen

UMCU/MedRoBERTa.nl_Miriad_QA_sparse es un codificador disperso (sparse encoder) de tipo CSR desarrollado por el UMCU (University Medical Center Utrecht) y publicado en HuggingFace. Se trata de un fine-tuning del modelo UMCU/MedRoBERTa.nl_Miriad_QA realizado con la libreria sentence-transformers, y su funcion es proyectar frases y parrafos del dominio biomedico en neerlandes a un espacio vectorial disperso de 3072 dimensiones con un maximo de 192 dimensiones activas, optimizado para busqueda semantica y recuperacion dispersa.

El modelo tiene 125.978.112 parametros (aproximadamente 126 M) y una longitud maxima de secuencia de 512 tokens. Se apoya en un tronco RoBERTa con embeddings de 768 dimensiones sobre el que se aplica un pooling de media de tokens y un autoencoder disperso (SparseAutoEncoder) que expande la representacion a 3072 dimensiones y aplica una restriccion de dispersidad tipo top-k (k=192, k_aux=384). El resultado es un vector disperso compatible con indices invertidos, lo que permite combinar recuperacion lexica eficiente con senal semantica.

Su relevancia es doble: por un lado, cubre un nicho poco atendido como es la recuperacion de informacion biomedica en neerlandes, idioma con menos recursos que el ingles en este dominio; por otro, su formato de salida disperso lo hace util como componente de recuperacion en arquitecturas RAG (retrieval-augmented generation) sobre corpus clinicos y cientificos, donde el coste de indexacion y la interpretabilidad del termino pesan mas que en los embeddings densos puros. La licencia Apache 2.0 facilita su integracion en productos. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 likes, por lo que su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse encoder CSR: transformer RoBERTa (RobertaModel) + pooling de media de tokens + SparseAutoEncoder (768 -> 3072, k=192, k_aux=384) |
| Parametros totales | 125.978.112 (aprox. 126 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (Maximum Sequence Length) |
| Tipos de cuantizacion | No se han publicado cuantizaciones oficiales; el repositorio se distribuye en safetensors con la precision original. Al ser un modelo de ~126 M es viable aplicar cuantizacion generica (int8/fp16) con herramientas estandar, pero no hay artefactos publicados por el autor |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de salida | 3072 dimensiones, con 192 dimensiones activas maximas |
| Funcion de similitud | Similitud coseno |
| Repositorio | 0,5 GB |
| Modelo base | UMCU/MedRoBERTa.nl_Miriad_QA (revision 88e35cb3a2805ba189d70f9ff32e00082ee4066d) |
| Dataset de entrenamiento | UMCU/MIRIAD4.4.nl (dataset_size declarado: 4.486.855) |
| Fecha de publicacion | 7 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un `SparseEncoder` de sentence-transformers compuesto por tres modulos: (1) un transformer `RobertaModel` con `max_seq_length` de 512, `do_lower_case=False` y embeddings de 768 dimensiones; (2) un modulo de pooling que aplica media de tokens (`pooling_mode_mean_tokens: True`, resto de modos desactivados); y (3) un `SparseAutoEncoder` con `input_dim` 768, `hidden_dim` 3072, `k=192`, `k_aux=384`, `normalize=False` y `dead_threshold=30`. El autoencoder expande la representacion densa de 768 dimensiones a 3072 y aplica un mecanismo de seleccion top-k que fuerza la dispersidad, de modo que cada texto queda representado por un maximo de 192 dimensiones no nulas; el parametro `k_aux` (384) actua como rama auxiliar para mitigar el problema de neuronas muertas durante el entrenamiento.

El modelo parte del checkpoint UMCU/MedRoBERTa.nl_Miriad_QA y se ha fine-tuneado con la libreria sentence-transformers sobre el dataset UMCU/MIRIAD4.4.nl, un corpus del dominio biomedico en neerlandes con 4.486.855 elementos declarados en las etiquetas del repositorio. La funcion de perdida aparece registrada como `_WandbLossLoggerWrapper`, lo que indica que el entrenamiento se monitorizo con Weights & Biases. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion interna del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion; tampoco se describen innovaciones adicionales como decodificacion especulativa o atencion lineal (no aplicables a un codificador de recuperacion). La model card cita los identificadores arXiv 2604.25374, 2506.06091 y 1908.10084, pero no se especifica su contenido en la informacion proporcionada.

## Capacidades

- Codificacion de frases y parrafos a vectores dispersos de 3072 dimensiones con 192 dimensiones activas maximas, aptos para indices invertidos.
- Busqueda semantica y recuperacion dispersa (sparse retrieval) mediante similitud coseno entre vectores.
- Procesamiento de textos en neerlandes dentro del dominio biomedico y clinico (el widget de la model card incluye ejemplos de nefrologia, cardiologia, endocrinologia y trasplante hepatico).
- Recuperacion de pasajes relevantes en corpus medicos, con representacion interpretable por dimensiones/terminos activos.
- Generacion de embeddings por lotes (`model.encode`) para indexacion masiva de documentos.
- No genera texto: es un modelo de extraccion de caracteristicas (`feature-extraction`), por lo que no soporta generacion, resumen ni traduccion.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni otras capacidades multimodales.
- No hay soporte multilingue declarado: unicamente neerlandes.

## Casos de uso

- Busqueda semantica sobre documentacion clinica hospitalaria: el modelo indexa protocolos, guias y notas en neerlandes y permite recuperar pasajes por significado, no solo por coincidencia exacta de terminos, gracias a la representacion dispersa de 3072 dimensiones.
- Recuperacion aumentada (RAG) en asistentes medicos en neerlandes: se usa como retriever sobre una base de conocimiento biomedica y los pasajes recuperados se pasan a un modelo generativo; su salida dispersa permite combinarla con un indice invertido tradicional en la misma consulta.
- Recuperacion hibrida sparse + lexica: al producir vectores dispersos, las puntuaciones se pueden fusionar con BM25 en motores que soportan vectores dispersos, mejorando el recall en consultas con terminologia medica muy especifica o siglas.
- Indexacion de literatura cientifica neerlandesa: para revisiones de alcance o busquedas exploratorias sobre grandes volumenes de resumenes, donde el coste de almacenamiento por documento es bajo (192 valores no nulos por vector) frente a un embedding denso de 3072 dimensiones.
- Deduplicacion y agrupacion de documentos: el calculo de similitudes coseno por pares permite detectar duplicados o agrupar pasajes tematicamente proximos en corpus de historia clinica o de publicaciones.
- Construccion de datasets de entrenamiento: recuperar pares pregunta-respuesta o pasajes similares dentro de MIRIAD4.4.nl para generar conjuntos de datos de QA biomedica en neerlandes.
- Sistemas de triaje documental: clasificar y enrutar documentos entrantes (derivaciones, informes) hacia el servicio correspondiente midiendo su similitud con descripciones de referencia del dominio clinico.
- Recuperacion de evidencia en herramientas de soporte a la decision: localizar fragmentos de guias clinicas relevantes para una consulta formulada en lenguaje natural, siempre como componente de recuperacion y no como sistema de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (ni MTEB, ni BEIR, ni metricas de recuperacion como Recall@k, nDCG o MRR para el corpus MIRIAD), y tampoco se proporcionan comparaciones con lineas base. No se deben asumir cifras de rendimiento a partir del nombre o del tamano del modelo.

## Requisitos de hardware

- VRAM para inferencia (solo pesos): aproximadamente 0,5 GB en fp32 con los 125,98 M de parametros; alrededor de 0,25 GB en fp16/bf16 y unos 0,13 GB en int8. Estas cifras no incluyen activaciones ni el overhead del runtime.
- Memoria adicional para el indice: cada documento ocupa 192 valores no nulos en un espacio de 3072 dimensiones, es decir, del orden de 1,5 KB por vector entre indices y valores, mas el coste del indice invertido asociado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4090, A100 o H100 quedan muy sobredimensionados para la inferencia; se pueden usar para indexar grandes volumenes en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090) y tambien en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: sentence-transformers (`SparseEncoder`) es la via oficial documentada en la model card; tambien es viable exportar a ONNX Runtime u otras rutas de inferencia optimizada. Para la recuperacion final se necesita un indice invertido o un motor que soporte vectores dispersos (por ejemplo, Qdrant, OpenSearch o Vespa entre los que ofrecen soporte de sparse vectors). No se documenta en la informacion disponible compatibilidad explicita con vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia por lote ni de documentos indexados por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UMCU/MedRoBERTa.nl_Miriad_QA_sparse | Sparse encoder (CSR) | 125,98 M | 512 tokens | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| UMCU/MedRoBERTa.nl_Miriad_QA (modelo base) | Encoder de sentence-transformers (denso) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Recuperacion lexica tipo BM25 | Recuperacion por coincidencia de terminos | No aplica | No aplica | No disponible (sin comparacion publicada) | No aplica | Estandar en motores de busqueda |
| Otros sparse encoders genericos (estilo SPLADE) | Sparse encoder | No disponible | No disponible | No disponible | Variable segun modelo | HuggingFace |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas de la misma categoria dentro de la informacion proporcionada; las filas se incluyen unicamente como contexto de categoria, con los campos no documentados marcados como no disponibles.

## Limitaciones y advertencias

- Cobertura linguistica restringida al neerlandes; no hay soporte declarado de otros idiomas, ni siquiera del ingles, lo que limita su uso en corpus multilingues.
- Dominio acotado al ambito biomedico y clinico; el rendimiento fuera de ese dominio no esta documentado y previsiblemente sera inferior.
- Longitud maxima de 512 tokens: los documentos largos deben trocearse antes de la indexacion, con la consiguiente perdida de contexto entre fragmentos.
- No es un modelo generativo: no produce texto, por lo que el riesgo de alucinacion en sentido estricto no aplica, pero si existe el riesgo de recuperar pasajes irrelevantes o sesgados que un sistema posterior utilice como si fueran evidencia.
- Sesgos: al entrenarse sobre un corpus biomedico en neerlandes (MIRIAD4.4.nl), puede heredar sesgos de representacion de poblaciones, especialidades o terminologias presentes en dichas fuentes. No se documenta ninguna evaluacion de sesgo en la informacion disponible.
- Ausencia de validacion externa: el modelo registra 0 descargas y 0 likes, y fue publicado en octubre de 2026, por lo que no hay evidencia de uso en produccion ni replicacion independiente de resultados.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero la procedencia de los datos de entrenamiento (corpus clinico y biomedico) puede estar sujeta a condiciones adicionales de privacidad y uso de datos sanitarios que la licencia del modelo no cubre.
- No es un producto sanitario ni esta destinado a diagnostico, tratamiento o decision clinica directa; cualquier aplicacion en ese contexto requiere validacion regulatoria y supervision profesional.
- El repositorio ocupa 0,5 GB, coherente con los pesos en safetensors, pero no se especifica la revision exacta de los artefactos ni checksums en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UMCU/MedRoBERTa.nl_Miriad_QA_sparse
- Modelo base: https://huggingface.co/UMCU/MedRoBERTa.nl_Miriad_QA
- Dataset de entrenamiento: https://huggingface.co/datasets/UMCU/MIRIAD4.4.nl
- Documentacion de Sentence Transformers: https://sbert.net
- Documentacion de Sparse Encoder (uso): https://www.sbert.net/docs/sparse_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Sparse encoders en HuggingFace: https://huggingface.co/models?library=sentence-transformers&other=sparse-encoder
- arXiv citado en la model card: https://arxiv.org/abs/2604.25374
- arXiv citado en la model card: https://arxiv.org/abs/2506.06091
- arXiv citado en la model card: https://arxiv.org/abs/1908.10084
