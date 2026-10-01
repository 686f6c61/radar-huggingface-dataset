# yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-true_seed-42

# ucu-wsd-aug16-generation_back_translation_pt-true_seed-42

## Resumen

Se trata de un modelo de desambiguacion del sentido de las palabras (word sense disambiguation, WSD) para ucraniano, publicado por el usuario yuriilaba en HuggingFace. No es un modelo generativo: es un encoder de frases afinado a partir de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez deriva de la arquitectura XLM-RoBERTa base. El modelo aprende representaciones contextuales que permiten distinguir el sentido correcto de una palabra polisemica a partir de su contexto oracional, y ademas conserva capacidades de similitud semantica de frases (STS).

El checkpoint tiene 278.043.648 parametros (unos 278 millones) almacenados en safetensors, con un repositorio de 1,1 GB, lo que corresponde a pesos en precision completa (FP32). El entrenamiento se realizo sobre el fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_translation_16_samples.csv`, con pooling sobre el token objetivo (`target-token pooling: True`) y semilla 42 tanto para el split de validacion como para el entrenamiento.

La relevancia de esta publicacion es doble. Por un lado, aporta un resultado de exactitud WSD de 0,9414 sobre un conjunto de evaluacion en ucraniano, un idioma con menos recursos para tareas de desambiguacion lexica. Por otro, su enfoque de entrenamiento (tripletas generadas mediante traduccion inversa y pooling centrado en el token objetivo) es reproducible y reutilizable para otras lenguas. Sus limitaciones principales son la ausencia de licencia declarada, la falta de documentacion sobre idiomas y datos, y el hecho de que sea un modelo de encoder, no de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa base (heredada del modelo base `paraphrase-multilingual-mpnet-base-v2`); tarea de sentence embeddings con pooling sobre token objetivo |
| Parametros totales | 278.043.648 (aproximadamente 278 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (configuracion estandar de XLM-RoBERTa; no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en precision completa) |
| Idiomas soportados | No disponible oficialmente. La tarea declarada es ucraniano; el modelo base es multilingue (mas de 100 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Parametros de entrenamiento | Target-token pooling: True; semilla de entrenamiento: 42; semilla del split de validacion: 42 |
| Datos de entrenamiento | `local_datasets/semi_supervised_2/triplets/triplets_generation_translation_16_samples.csv` |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder transformer de tipo XLM-RoBERTa base (12 capas, dimension oculta de 768 y vocabulario multilingue de gran tamano, coherente con los 278 M de parametros registrados en el safetensors). Sobre esa base, el autor ha realizado un ajuste fino orientado a WSD con una estrategia de *pooling* sobre el token objetivo: en lugar de promediar o usar el token `[CLS]` de toda la secuencia, la representacion se extrae especificamente de la posicion de la palabra cuya acepcion se quiere desambiguar. Esto es una decision de diseno relevante, porque en WSD la señal discriminativa esta localizada en el token ambiguo y en su ventana de contexto, no en la frase completa.

El entrenamiento parte de tripletas almacenadas en un CSV, generadas mediante traduccion inversa (*back translation*) segun indica el propio nombre del checkpoint. No se documenta el numero de tokens, la composicion exacta del corpus, ni si hubo fases adicionales de RLHF o DPO; tampoco se aporta informacion sobre la funcion de perdida mas alla de lo implicito en el formato de tripletas (probablemente una perdida de tipo triplet margin o contrastiva, aunque esto no se confirma en la model card). El ajuste se ejecuto con semilla fija (42), lo que facilita la replicacion del experimento si se dispone del conjunto de datos, pero tambien implica que no se ha publicado una estimacion de varianza entre semillas.

## Capacidades

- Desambiguacion del sentido de palabras (WSD) en ucraniano: seleccion de la acepcion correcta de un termino polisemico a partir de su contexto oracional, con exactitud reportada de 0,9414 sobre el conjunto de evaluacion del autor.
- Generacion de embeddings de frases y oraciones: al derivar del modelo `paraphrase-multilingual-mpnet-base-v2`, conserva la capacidad de producir representaciones vectoriales comparables mediante similitud coseno.
- Similitud semantica textual (STS): Pearson 0,7891 y Spearman 0,7766 en la evaluacion declarada.
- Evaluacion multilingue: la model card indica que los resultados completos por tarea de MTEB estan en `evaluation/mteb_results/`, lo que sugiere que se ejecutaron tareas de MTEB, aunque los valores no se incluyen en el README.
- Procesamiento por lotes de frases cortas o pares de frases con contexto limitado a 512 tokens.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un encoder, no un modelo de chat o instrucciones.
- No dispone de modo *thinking*, vision ni audio.
- Capacidad multilingue: no declarada explicitamente para este checkpoint; la herencia del modelo base la hace plausible, pero sin validacion publicada en la model card.

## Casos de uso

- Desambiguacion lexica en pipelines de anotacion linguistica: el modelo recibe una oracion y la posicion del token ambiguo, y devuelve su sentido; puede integrarse en herramientas de anotacion semantica para corpus ucranianos. La exactitud de 0,9414 sobre el conjunto de evaluacion lo hace util como preanotador con revision humana.
- Construccion de recursos lexicograficos: procesamiento por lotes de ejemplos de uso extraidos de corpus para agrupar ocurrencias por acepcion y ayudar a redactar o ampliar entradas de diccionario.
- Recuperacion de informacion en ucraniano: usar los embeddings del modelo para indexar documentos y consultas, aprovechando que la representacion esta condicionada al contexto del token objetivo, lo que mejora la discriminacion en consultas con terminos polisemicos.
- Deduplicacion y agrupacion semantica de contenidos: calcular similitudes entre pares de frases (los valores STS de ~0,79 indican una calidad razonable en esta tarea) para agrupar noticias, preguntas frecuentes o tickets repetidos.
- Filtrado de ambiguedad en sistemas de traduccion automatica: como modulo previo que etiqueta el sentido de terminos polisemicos para que un motor de traduccion elija la equivalencia correcta en la lengua destino.
- Enriquecimiento de bases de conocimiento y grafos de conocimiento: asignar sentidos normalizados a menciones extraidas de texto para vincularlas a entradas de una ontologia o de WordNet en ucraniano.
- Clasificacion de intenciones y enrutado de consultas: convertir las representaciones en caracteristicas para modelos posteriores de clasificacion de texto corto en ucraniano.
- Investigacion en linguistica computacional: servir como punto de partida para experimentos de ajuste fino en WSD de otras lenguas de bajos recursos, replicando el esquema de tripletas con semilla fija.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| WSD accuracy | 0,9413814955640051 | Conjunto de evaluacion del autor (ucraniano) |
| STS Pearson | 0,7890999117198096 | Tarea STS del autor |
| STS Spearman | 0,7765985803654032 | Tarea STS del autor |
| MTEB (resultados por tarea) | Publicados en `evaluation/mteb_results/`, valores no incluidos en la model card | MTEB |

No se han facilitado en la informacion disponible los resultados desglosados por tarea de MTEB ni comparaciones numericas con otros sistemas de WSD en ucraniano.

## Requisitos de hardware

- Memoria de pesos en FP32 (formato publicado): aproximadamente 1,11 GB (278 M x 4 bytes), consistente con el tamano de repositorio de 1,1 GB.
- Memoria de pesos en FP16/BF16: aproximadamente 0,56 GB.
- Memoria de pesos en INT8: aproximadamente 0,28 GB (requiere cuantizacion posterior, no publicada).
- Vram total estimada para inferencia: por debajo de 2 GB en FP32 para lotes pequenos, incluyendo activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no es necesario acelerador de centro de datos. Funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4 o cualquier GPU con 4 GB o mas de memoria. A100 o H100 solo tendrian sentido para procesamiento masivo por lotes.
- Inferencia en CPU: viable para volumentes moderados, dado el tamano del modelo; util para despliegues sin GPU.
- Opciones de despliegue: libreria `transformers` y `sentence-transformers`; exportacion a ONNX u OpenVINO para produccion en CPU; Text Embeddings Inference (TEI) para servir embeddings por HTTP. vLLM no es aplicable porque el modelo no es generativo. llama.cpp y Ollama requeririan una conversion a GGUF que no esta publicada.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de frases procesadas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| ucu-wsd-aug16-generation_back_translation_pt-true_seed-42 | 278 M | 512 tokens (heredado) | WSD en ucraniano + embeddings | No disponible | WSD accuracy 0,9414; STS Pearson 0,7891 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 tokens | Embeddings multilingues y similitud semantica | Apache 2.0 (segun su model card publica) | Punto de partida del ajuste; no se aportan metricas comparativas en la model card |
| xlm-roberta-base | 278 M | 512 tokens | Modelo de lenguaje enmascarado multilingue (sin ajuste para embeddings) | MIT (segun su model card publica) | No disponible para WSD en ucraniano |
| bert-base-multilingual-cased (mBERT) | 178 M | 512 tokens | Modelo de lenguaje enmascarado multilingue | Apache 2.0 (segun su model card publica) | No disponible para WSD en ucraniano |

La comparacion cuantitativa con alternativas especificas de WSD en ucraniano no esta disponible, ya que la model card no incluye una linea base ni resultados de otros sistemas sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita, el uso comercial y la redistribucion quedan en un limbo juridico. Es un bloqueo habitual en revisiones de compliance y debe resolverse contactando con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados. Aunque la tarea es ucraniana y el modelo base es multilingue, no hay validacion publicada fuera de ese idioma.
- Riesgo de alucinacion: al ser un encoder y no un modelo generativo, no genera texto libre y, por tanto, no alucina en el sentido habitual. Si se usa como clasificador de sentidos, puede asignar una acepcion incorrecta cuando el contexto es insuficiente o muy corto, sin señal de incertidumbre calibrada.
- Sesgos: no se documenta ningun analisis de sesgos. El modelo hereda los sesgos del corpus de entrenamiento y del modelo base multilingue, cuyo preentrenamiento se realizo sobre datos web filtrados.
- Limitacion de contexto: 512 tokens por secuencia, heredado del modelo base. No es adecuado para documentos largos sin troceado previo.
- Datos y reproducibilidad: la ruta de entrenamiento apunta a un fichero local (`local_datasets/...`), por lo que el conjunto de datos no esta publicado en el repositorio. No es posible reproducir el ajuste tal cual sin acceso a ese CSV.
- Semilla unica: el entrenamiento usa semilla 42 sin publicar variabilidad entre semillas, de modo que la exactitud de 0,9414 corresponde a una unica ejecucion y a un unico split de validacion.
- Adopcion nula: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no ha pasado por validacion independiente de la comunidad ni por auditorias externas.
- Uso inadecuado: no debe emplearse como modelo de chat, asistente o generador de codigo; su proposito es producir representaciones vectoriales y puntuaciones de similitud.
- Evaluacion incompleta: los resultados de MTEB se referencian pero no se transcriben en la model card, lo que impide verificar el rendimiento en tareas distintas de WSD y STS sin descargar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-true_seed-42
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Arquitectura de referencia del encoder subyacente: https://huggingface.co/FacebookAI/xlm-roberta-base
- Resultados MTEB incluidos en el repositorio: `evaluation/mteb_results/` (ruta interna del repositorio del modelo)
- Repositorio MTEB (framework de evaluacion): https://github.com/embeddings-benchmark/mteb

No se han encontrado en la informacion disponible papers, blogs tecnicos, demos ni repositorios adicionales asociados a este checkpoint.
