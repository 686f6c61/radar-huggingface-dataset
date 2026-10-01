# yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-true_seed-123

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-true_seed-123` es un ajuste fino de un encoder multilingue orientado a la desambiguacion del sentido de las palabras (WSD, *word-sense disambiguation*) en ucraniano. Lo publica el usuario de HuggingFace `yuriilaba`, presumiblemente en el contexto de un trabajo academico (el prefijo "ucu" y la nomenclatura de *seeds* y *splits* apuntan a un experimento de investigacion). Parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder basado en la arquitectura XLM-RoBERTa con 278.043.648 parametros, y se distribuye unicamente en formato `safetensors` (1,1 GB de repositorio).

El problema que aborda es la polisemia lexica: dado un token objetivo en una oracion ucraniana, el modelo debe producir una representacion que permita asignarle el sentido correcto dentro de un inventario de sentidos. La model card reporta una precision WSD de 0,9430 y unos valores de similitud semantica de frases (STS) de 0,7899 de Pearson y 0,7772 de Spearman, ademas de resultados a nivel de tarea MTEB almacenados en el propio repositorio.

Es relevante ahora porque los recursos de PLN especificos para ucraniano siguen siendo escasos en comparacion con el ingles o el aleman, y porque demuestra un flujo de aumento de datos via *back-translation* (traduccion inversa) para generar tripletes de entrenamiento. Conviene advertir, no obstante, que se trata de un checkpoint con cero descargas y cero *likes*, sin licencia declarada y con muy poca documentacion sobre el procedimiento de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa); ajuste fino sobre `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. La arquitectura base XLM-RoBERTa admite hasta 512 tokens; el checkpoint de sentence-transformers del que parte suele limitarse a 128 tokens (no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible. Los pesos se publican sin cuantizar; al ser un encoder de 278 M, admite cuantizacion dinamica de PyTorch o exportacion a ONNX/INT8 con herramientas estandar (no documentado por el autor) |
| Idiomas soportados | Ucraniano como idioma objetivo declarado. El modelo base es multilingue, pero la model card solo certifica el rendimiento en ucraniano |
| Licencia | No disponible. El modelo base se distribuye bajo Apache-2.0, pero el autor no declara licencia para este ajuste |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa en configuracion *base*: un transformer encoder bidireccional de 12 capas y 278 M de parametros, preentrenado de forma multilingue y posteriormente convertido en modelo de frases mediante *sentence-transformers* con objetivos de similitud contrastiva. Sobre esa base, el autor aplica un ajuste fino supervisado con tripletes (ancla, positivo, negativo), una formulacion tipica de los modelos de embeddings. La model card indica que el *pooling* se hace sobre el token objetivo (`target-token pooling: True`), lo que confirma que el modelo no produce una unica representacion de la oracion completa, sino representaciones condicionadas a la posicion del token que se quiere desambiguar.

En cuanto a los datos, el entrenamiento usa el fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_translation_16_samples.csv`. El aumento de datos se realiza por traduccion inversa (*back-translation*), segun se deduce del nombre del experimento (`generation_back_translation`). Se fijan semilla de entrenamiento 123 y semilla de particion de validacion 42, lo que facilita la reproducibilidad del experimento. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, el numero total de tripletes ni sobre el uso de RLHF o DPO (tecnicas que, por otra parte, no se aplican habitualmente a encoders de este tipo). El nombre del fichero sugiere un volumen de muestras muy reducido, aunque el autor no documenta el tamano real del conjunto.

## Capacidades

- Codificacion de texto y generacion de *embeddings* de tokens y de frases; no es un modelo generativo y no produce texto.
- Desambiguacion del sentido de palabras (WSD) en ucraniano, con una precision reportada de 0,9430.
- Similitud semantica textual (STS): 0,7899 de correlacion de Pearson y 0,7772 de Spearman sobre el conjunto evaluado por el autor.
- Agrupacion de representaciones por token objetivo mediante *pooling* posicional, lo que permite comparar el mismo lexema en contextos distintos.
- Recuperacion semantica y busqueda vectorial, al heredar el comportamiento de *sentence-transformers*.
- Soporte multilingue teorico por la base XLM-RoBERTa, no validado en la model card para idiomas distintos del ucraniano.
- Soporte de *tool calling* / *function calling*: no aplica, es un encoder sin interfaz de generacion.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Modo *thinking*, vision o audio: no disponible / no aplica.

## Casos de uso

- Desambiguacion lexica en pipelines de PLN para ucraniano: el modelo se situa como etapa previa a la traduccion automatica o al analisis sintactico, resolviendo el sentido del token polisemico antes de que el sistema aguas abajo lo procese.
- Construccion y enriquecimiento de WordNets ucranianos: genera representaciones por sentido que permiten asignar automaticamente ejemplos de corpus a las acepciones de un lexico, reduciendo el trabajo manual de anotacion.
- Busqueda semantica en corpus ucranianos: al producir *embeddings* de frases, puede indexarse en una base vectorial (FAISS, Qdrant, Milvus) para recuperar documentos por significado y no por coincidencia literal.
- Deduplicacion y agrupacion de documentos: los valores de STS reportados (0,79 de Pearson) permiten umbralizar similitudes para detectar near-duplicates en corpus periodisticos o academicos en ucraniano.
- Clasificacion de textos con pocas etiquetas: con las representaciones del encoder se pueden entrenar clasificadores lineales o *k*-NN sobre conjuntos pequenos, util para moderacion tematica o triaje de tickets.
- Evaluacion de sistemas de traduccion: la representacion condicionada al token objetivo sirve como sonda para medir si una traduccion conserva el sentido correcto de una palabra polisemica.
- Analisis de sentimiento y opinion a nivel de aspecto: el *pooling* sobre el token objetivo permite estudiar como cambia la representacion de un termino segun el contexto (por ejemplo, un adjetivo aplicado a distintos sujetos).
- Investigacion en aumento de datos: el propio flujo de *back-translation* documentado puede replicarse como linea base para experimentos de generacion de tripletes en otras lenguas de bajos recursos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| WSD (ucraniano) | Precision | 0,9430 (0,9429657794676806) |
| STS | Pearson | 0,7899 (0,7899065381847937) |
| STS | Spearman | 0,7772 (0,7772302297261738) |
| MTEB | Resultados por tarea | Almacenados en `evaluation/mteb_results/` del repositorio; valores no publicados en la model card |

No se proporcionan en la informacion disponible los nombres de los conjuntos de evaluacion, el numero de ejemplos ni resultados comparativos con otros sistemas, por lo que no es posible situar estas cifras frente a alternativas.

## Requisitos de hardware

- Pesos en `safetensors` con un repositorio de 1,1 GB, coherente con 278 M de parametros en precision de 32 bits.
- VRAM estimada para inferencia: en torno a 2-3 GB en FP32 con lotes pequenos y aproximadamente 1,5-2 GB en FP16 (estimacion, no publicada por el autor).
- Cabe holgadamente en cualquier GPU de consumo actual: RTX 3060 (12 GB), RTX 4060, RTX 3090, RTX 4090, e incluso en GPUs con 4-6 GB como la GTX 1650 o la RTX 3050.
- Inferencia viable en CPU para cargas de trabajo por lotes; el coste por oracion es bajo al tratarse de un encoder de 12 capas.
- Opciones de despliegue: `sentence-transformers`, `transformers` de HuggingFace, ONNX Runtime, Text Embeddings Inference (TEI) y TorchServe. vLLM y llama.cpp no son las herramientas habituales para este tipo de modelo, ya que estan orientadas a decoders generativos.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros checkpoints publicados especificamente para WSD en ucraniano con los que comparar. La tabla siguiente recoge unicamente los antecesores directos del modelo, como referencia de arquitectura y licencia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `ucu-wsd-aug16-generation_back_translation_pt-true_seed-123` | 278 M | No disponible (base XLM-RoBERTa, hasta 512 tokens) | No disponible | Ajuste especifico para WSD en ucraniano; WSD 0,9430 y STS 0,7899/0,7772 |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | 278 M | 128 tokens en la configuracion habitual del modelo de frases | Apache-2.0 | Modelo base del ajuste; proposito general de similitud semantica multilingue |
| `xlm-roberta-base` | 278 M | 512 tokens | MIT | Encoder multilingue de proposito general, sin ajuste para recuperacion ni para WSD |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido. La licencia Apache-2.0 del modelo base no se hereda automaticamente si el autor no la explicita para el ajuste.
- Volumen de entrenamiento no documentado: el nombre del fichero de datos sugiere un conjunto de pocas muestras, lo que plantea dudas razonables sobre la capacidad de generalizacion de la precision WSD del 0,9430.
- Sin detalles de evaluacion: no se especifica el conjunto de test, su solapamiento con el de entrenamiento ni la cabeza de clasificacion utilizada, de modo que las cifras no son verificables de forma independiente.
- Cero descargas y cero interacciones en HuggingFace: el modelo no ha sido validado por la comunidad.
- Riesgo de sobreajuste al dominio y al inventario de sentidos del corpus de entrenamiento; el rendimiento en otros dominios (legal, medico, tecnico) puede degradarse de forma notable.
- Cobertura linguistica limitada en la practica: aunque la base es multilingue, solo se certifica el ucraniano; usar el modelo en otra lengua carece de respaldo empirico.
- Longitud de contexto restringida: si la configuracion heredada es de 128 tokens, los textos largos requeriran truncado o segmentacion, lo que degrada la desambiguacion en oraciones largas.
- No es un modelo generativo: no debe emplearse para chat, resumen, traduccion directa ni generacion de codigo.
- El riesgo de alucinacion en el sentido generativo no aplica; en su lugar existe riesgo de asignacion erronea de sentido, silencioso y dificil de detectar en produccion.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-01) es posterior a la de consulta habitual y conviene verificarla antes de citar el modelo.
- Para produccion, se recomienda congelar el checkpoint, versionar los pesos y validar la precision WSD sobre un conjunto propio antes de integrarlo en cualquier pipeline critico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-true_seed-123
- Modelo base citado en la model card: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB indicados por el autor: directorio `evaluation/mteb_results/` dentro del repositorio del modelo
- Paper, blog, repositorio de codigo o demo: no disponible
