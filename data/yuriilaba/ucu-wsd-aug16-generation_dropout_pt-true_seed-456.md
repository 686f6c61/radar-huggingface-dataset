# yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-456

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-456` es un ajuste fino (fine-tune) especializado en desambiguacion de sentidos de palabras (WSD, word-sense disambiguation) para el idioma ucraniano. Lo publica la organizacion o usuario `yuriilaba` en HuggingFace, y parte del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, una arquitectura transformer de tipo encoder derivada de XLM-RoBERTa con capacidad multilingue.

El modelo tiene 278.043.648 parametros (aproximadamente 278 millones) almacenados en formato safetensors, con un repositorio de 1,1 GB que incluye artefactos de evaluacion. La variante recoge en su nombre la configuracion de entrenamiento: generacion con dropout (`generation_dropout`), agrupacion por token objetivo (`pt-true`, target-token pooling activado) y semilla de entrenamiento 456. La relevancia de este tipo de modelos radica en que la desambiguacion de sentidos es una tarea central para la traduccion automatica, la recuperacion de informacion y la anotacion linguistica en lenguas con menos recursos, como el ucraniano.

No hay informacion publica sobre licencia, idiomas declarados, pipeline ni resultado de descargas, por lo que su evaluacion debe apoyarse en los datos de entrenamiento y evaluacion descritos en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), ajustado para embeddings de frase; base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 (~278 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base XLM-RoBERTa opera tipicamente con 512 tokens, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no hay artefactos GGUF, AWQ o GPTQ publicados) |
| Idiomas soportados | tarea objetivo en ucraniano; el modelo base es multilingue (mas de 100 idiomas), aunque no se declaran idiomas en la metadata del repo |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo encoder con atencion bidireccional, derivado de XLM-RoBERTa y posteriormente optimizado para representaciones vectoriales de frases mediante la libreria `sentence-transformers`. Sobre esa base, el autor ha realizado un fine-tune orientado a WSD para ucraniano. La configuracion destacada es el uso de *target-token pooling* (`pt-true`), lo que implica que la representacion se extrae a partir del token objetivo desambiguado en lugar de promediar todos los tokens de la secuencia, una estrategia habitual en tareas token-level como WSD.

Los datos de entrenamiento se especifican en la model card como `local_datasets/semi_supervised_2/triplets/triplets_generation_dropout_16_samples.csv`, un conjunto de tripletes (probablemente ancla, positiva y negativa) generado con una estrategia semi-supervisada y *generation dropout* de 16 muestras. Se empleo la semilla 456 para el entrenamiento y la semilla 42 para la division de validacion. No se detalla el numero de tokens de entrenamiento, la composicion completa del dataset, ni si hubo etapas de RLHF o DPO, por lo que esos datos quedan como no disponibles.

## Capacidades

- Desambiguacion de sentidos de palabras (WSD) en ucraniano, con una precision reportada de 0,9398 sobre el conjunto de evaluacion.
- Generacion de embeddings de frase y de token, apta para similitud semantica textual.
- Evaluacion de similitud semantica (STS) con correlaciones de Pearson 0,8005 y Spearman 0,7915.
- Recuperacion semantica y busqueda por similitud vectorial, al heredar la funcionalidad de `sentence-transformers`.
- Soporte multilingue latente por el modelo base XLM-RoBERTa, aunque el fine-tune esta orientado al ucraniano.
- Resultados a nivel de tarea MTEB disponibles en la carpeta `evaluation/mteb_results/` del repositorio.
- No se documenta soporte de *tool calling*, function calling, agentes, vision, audio ni modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Desambiguacion lexica en pipelines de PLN para ucraniano: el modelo clasifica el sentido correcto de una palabra polisemica a partir del contexto, lo que resulta util en anotacion automatica de corpus y en la construccion de recursos lexicos.
- Traduccion automatica asistida por sentido: integrar la desambiguacion antes de traducir permite elegir la acepcion adecuada y reducir errores en lenguas con alta polisemia.
- Busqueda semantica multilingue: al generar embeddings, se puede emplear para recuperar documentos por similitud, con la ventaja de operar sobre texto ucraniano y otras lenguas del modelo base.
- Deduplicacion y agrupamiento de textos: los embeddings permiten agrupar documentos o frases semanticamente equivalentes en corpus de gran tamano.
- Sistemas RAG (generacion aumentada por recuperacion): el modelo puede actuar como recuperador denso de pasajes en ucraniano antes de pasar la informacion a un LLM generativo.
- Evaluacion de similitud semantica: util para validar traducciones o resumenes comparando la similitud entre pares de frases con las correlaciones STS documentadas.
- Analisis lexicografico y construccion de diccionarios: ayuda a identificar y agrupar ejemplos de uso por sentido, acelerando el trabajo de lexicografos.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| WSD (desambiguacion de sentidos) | Accuracy | 0,9397972116603295 |
| STS (similitud semantica textual) | Pearson | 0,8004740383087379 |
| STS (similitud semantica textual) | Spearman | 0,7914950090428702 |

El autor indica que los resultados completos a nivel de tarea MTEB estan en la carpeta `evaluation/mteb_results/` del repositorio, pero no se proporcionan en la informacion disponible. No se han publicado resultados comparativos frente a otros modelos en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32, unos 560 MB en FP16/BF16 y alrededor de 280 MB en cuantizacion INT8.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090, e incluso en GPUs de gama de entrada con 4-6 GB de VRAM.
- Tambien puede ejecutarse en CPU para cargas de inferencia por lotes, dado su tamano reducido (~278 M de parametros).
- Opciones de despliegue: `sentence-transformers`, HuggingFace `transformers`, `txtai`, `FastEmbed` y servidores de embeddings como `TEI` (Text Embeddings Inference). No se han publicado pesos en GGUF para `llama.cpp` ni artefactos para Ollama o vLLM en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ucu-wsd-aug16-generation_dropout_pt-true_seed-456 | ~278 M | no disponible | WSD + embeddings ucraniano | no disponible | HuggingFace (repo publico) |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | ~278 M | 512 tokens (segun modelo base) | Embeddings multilingues | Apache 2.0 (fuente habitual) | HuggingFace |
| sentence-transformers/LaBSE | ~471 M | 512 tokens (segun modelo base) | Embeddings multilingues | Apache 2.0 (fuente habitual) | HuggingFace |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens (segun modelo base) | Embeddings multilingues | MIT (fuente habitual) | HuggingFace |

Rendimiento comparativo: no disponible. Solo se conocen los resultados propios del modelo evaluado; no se aportan metricas de los alternativos en la informacion proporcionada, y los datos de licencia y contexto de estos ultimos no provienen de la model card analizada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al entrenar sobre un conjunto semi-supervisado ucraniano, puede heredar sesgos del corpus de origen y del modelo base multilingue.
- Riesgo de alucinacion: bajo en tareas de clasificacion y similitud, ya que no genera texto libre; sin embargo, las predicciones de sentido pueden ser erroneas ante contextos ambiguos o poco representados.
- Limitaciones de contexto: la ventana de contexto del fine-tune no esta documentada; si hereda los 512 tokens del modelo base, las secuencias largas requeriran truncado o segmentacion.
- Limitaciones de idioma: el fine-tune esta orientado al ucraniano; su rendimiento en otros idiomas no esta validado, aunque el modelo base sea multilingue.
- Restricciones de licencia: la licencia no esta declarada, por lo que no puede confirmarse su uso comercial sin consultar al autor.
- Advertencias para produccion: el repositorio no declara pipeline, idiomas ni licencia, y registra 0 descargas y 0 likes, lo que indica ausencia de validacion externa. Conviene reproducir la evaluacion en el dominio de destino antes de desplegarlo.
- Trazabilidad de datos: no se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo alineamiento por preferencias (RLHF/DPO).

## Enlaces

- HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Carpeta de evaluacion MTEB (referenciada en la model card, no enlazada directamente): `evaluation/mteb_results/` dentro del repositorio del modelo
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
