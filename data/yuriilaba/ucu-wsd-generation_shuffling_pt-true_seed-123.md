# yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-123

## Resumen

El modelo `yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-123` es un ajuste fino de tipo sentence-transformers orientado a la desambiguacion del sentido de las palabras (WSD, *word-sense disambiguation*) en ucraniano. Lo publica el usuario `yuriilaba` en Hugging Face y parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un modelo multilingue basado en la arquitectura XLM-RoBERTa. Con 278.043.648 parametros (unos 278 M) y un repositorio de 1,1 GB, se trata de un encoder de escala base, no de un modelo generativo.

El problema que aborda es clasico en procesamiento del lenguaje natural: decidir que acepcion de una palabra polisemica se activa en un contexto dado. El autor declara una precision WSD del 93,38 % y unos valores de similitud semantica de Pearson 0,8036 y Spearman 0,7945, ademas de resultados MTEB a nivel de tarea depositados en el propio repositorio. Frente a los grandes modelos generativos, su relevancia practica esta en el coste: es un encoder pequeno, rapido y desplegable en CPU, pensado para producir representaciones vectoriales.

La ficha se ha elaborado con la informacion de la model card y los metadatos de Hugging Face. La model card es muy escueta: no detalla composicion del dataset, licencia, idiomas soportados ni hiperparametros mas alla de las semillas y la estrategia de *pooling*. La busqueda web asociada no devolvio ningun resultado relevante sobre este modelo, por lo que las secciones que dependen de documentacion externa quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (heredada de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`) |
| Parametros totales | 278.043.648 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base XLM-RoBERTa opera con un maximo de 512 tokens |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ ni GPTQ. El tamano del repo (1,1 GB) es coherente con pesos en fp32 |
| Idiomas soportados | No disponible como lista oficial. La tarea declarada es en ucraniano; el modelo base es multilingue |
| Licencia | No disponible. La licencia del modelo base es Apache-2.0, pero el autor no especifica la del ajuste fino |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Estrategia de pooling | *Target-token pooling* activado (`True`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de tipo XLM-RoBERTa, reutilizado desde `paraphrase-multilingual-mpnet-base-v2`. Ese modelo base se entreno con el objetivo de *sentence embeddings* (MPNet con entrenamiento multilingue de sentence-transformers), de modo que el ajuste fino parte de un espacio vectorial ya alineado para similitud semantica entre frases en mas de cien idiomas. El ajuste se realizo sobre tripletas, un regimen tipico de aprendizaje metrico en el que se optimiza la cercania entre pares positivos y la separacion respecto a negativos.

Los datos de entrenamiento proceden del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_token_shuffling.csv`, segun la model card. El nombre sugiere un pipeline semisupervisado de generacion de tripletas con *shuffling* de tokens, pero el autor no documenta el volumen de ejemplos, la composicion del corpus, el numero de tokens vistos ni el proceso de anotacion. Tampoco se indica si hubo una fase de RLHF o DPO: en un encoder de representaciones esto no seria de aplicacion habitual.

Los unicos hiperparametros publicados son la semilla de entrenamiento (123) y la semilla de particion de validacion (42). Se activa el *target-token pooling*, es decir, la representacion se construye agregando las activaciones correspondientes al token objetivo en lugar de promediar toda la secuencia, algo coherente con una tarea de desambiguacion a nivel de palabra. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, ni son esperables en este tipo de modelo.

## Capacidades

- Generacion de *embeddings* de frase y de palabra: el modelo produce representaciones vectoriales, no texto. No es un modelo generativo ni conversacional.
- Desambiguacion del sentido de palabras (WSD) en ucraniano, con una precision declarada del 93,38 % en la evaluacion del autor.
- Similitud semantica textual (STS), con Pearson 0,8036 y Spearman 0,7945 declarados.
- *Target-token pooling*: permite obtener la representacion de un token concreto dentro de una secuencia, util para tareas de nivel lexico.
- Capacidad multilingue potencial heredada del modelo base, aunque no validada ni documentada para este ajuste.
- Evaluacion MTEB a nivel de tarea, depositada en el directorio `evaluation/mteb_results/` del repositorio.
- No hay evidencia de soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito. Son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Anotacion automatica de corpus ucranianos: el modelo puede predecir el sentido de palabras polisemicas en textos anotados parcialmente, reduciendo el coste de anotacion manual en proyectos de linguistica computacional.
- Construccion de lexicos y recursos de sentido: al agrupar las representaciones de un mismo lema en contextos distintos, se pueden inducir inventarios de acepciones y poblarlos con ejemplos reales extraidos de corpus.
- Recuperacion semantica de documentos en ucraniano: indexando los *embeddings* de fragmentos en una base vectorial, se puede implementar busqueda por similitud que no dependa de coincidencia exacta de terminos.
- Deduplicacion y agrupamiento tematico de noticias o informes: el *embedding* de frase permite agrupar documentos por cercania semantica y detectar duplicados casi identicos en grandes volumenes.
- Filtrado y clasificacion de resenas o tickets: entrenando un clasificador ligero sobre las representaciones congeladas, se pueden categorizar quejas o consultas sin necesidad de un LLM generativo, con coste de inferencia muy bajo.
- Desambiguacion como paso previo en pipelines de traduccion automatica o de analisis sintactico: fijar la acepcion antes de traducir o de resolver dependencias reduce errores en lenguas con alta polisemia.
- Sistemas de respuesta a preguntas extractiva sobre documentacion tecnica: combinando la busqueda vectorial con un reranker, el modelo sirve para seleccionar el pasaje relevante antes de que un modelo generativo redacte la respuesta.
- Evaluacion de similitud entre pares de frases en control de calidad de traducciones, usando el modelo como metrica automatica complementaria a BLEU o COMET.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| Precision WSD | 0,9337769328263625 (93,38 %) |
| STS Pearson | 0,8035850415796697 |
| STS Spearman | 0,7945252561917714 |

No se dispone de los resultados MTEB completos, que el autor remite al directorio `evaluation/mteb_results/` del repositorio. Tampoco hay cifras comparativas con otros modelos en la informacion proporcionada, ni se documenta el conjunto de evaluacion empleado, por lo que estos numeros no son verificables de forma independiente ni directamente comparables con la literatura.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con pesos en fp32, unos 0,6 GB en fp16 y unos 0,3 GB en int8, sin contar activaciones ni el *batch*.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Inferencia en CPU perfectamente viable: con 278 M de parametros, el coste por *batch* es bajo y no requiere acelerador dedicado.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para indexar corpus muy grandes en paralelo, donde el cuello de botella es el volumen de datos, no el modelo.
- Opciones de despliegue: `sentence-transformers`, `transformers`, ONNX Runtime, Text Embeddings Inference (TEI) o un servicio FastAPI propio. No hay pesos GGUF publicados; la conversion a GGUF u ONNX seria responsabilidad del usuario.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-123` | 278 M | No disponible (base de 512 tokens) | Encoder de *embeddings* ajustado para WSD en ucraniano | No disponible | Hugging Face, 0 descargas |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (modelo base) | 278 M | 512 tokens | Encoder de *embeddings* multilingue | Apache-2.0 | Hugging Face, ampliamente utilizado |
| `xlm-roberta-base` | 278 M | 512 tokens | Encoder transformer multilingue sin ajuste de similitud | MIT | Hugging Face |
| `bert-base-multilingual-cased` (mBERT) | 178 M | 512 tokens | Encoder transformer multilingue | Apache-2.0 | Hugging Face |

No hay datos publicos que permitan comparar el rendimiento de este ajuste con las alternativas en WSD ucraniano. La unica cifra disponible es la del propio modelo (93,38 % de precision WSD) y no se especifica el conjunto de prueba, por lo que la comparacion de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El autor no describe la procedencia del corpus de entrenamiento ni su composicion demografica o tematica, por lo que no se puede evaluar el sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto. El riesgo equivalente es la asignacion de una acepcion incorrecta o de un *embedding* poco discriminativo en contextos ambiguos.
- Cobertura idiomatica: la tarea declarada es el ucraniano. Aunque el modelo base es multilingue, no hay validacion publicada de su comportamiento en otros idiomas tras el ajuste.
- Limitacion de contexto: al derivar de XLM-RoBERTa, el limite previsible es de 512 tokens. Textos mas largos requieren troceado, lo que puede romper la coherencia necesaria para desambiguar.
- Licencia: no especificada. Esto es un bloqueo practico para uso comercial: sin una licencia explicita no se puede asumir permiso de uso, redistribucion ni modificacion, aunque el modelo base sea Apache-2.0.
- Reproducibilidad limitada: se conocen las semillas (123 y 42), pero no los hiperparametros de entrenamiento, la tasa de aprendizaje, el numero de epocas ni el preprocesado exacto.
- Dataset de entrenamiento no accesible: la ruta `local_datasets/...` apunta a un fichero local del autor, no publicado en el repositorio.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de uso en produccion, ni incidencias reportadas, ni mantenimiento posterior a la fecha de subida.
- Resultados no verificados de forma independiente: las cifras WSD y STS provienen unicamente de la model card, sin conjunto de evaluacion publico ni comparacion con la literatura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-generation_shuffling_pt-true_seed-123
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB del autor: directorio `evaluation/mteb_results/` dentro del repositorio del modelo.
- Referencia de la arquitectura subyacente (XLM-RoBERTa): https://arxiv.org/abs/1911.02116
- Nota sobre la busqueda web: los resultados devueltos (foros de Orange y guias de Baidu) no guardan ninguna relacion con el modelo y no se han incluido como fuentes. No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este modelo.
