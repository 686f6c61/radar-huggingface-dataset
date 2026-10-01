# yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-456

## Resumen

`yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-456` es un modelo de desambiguacion del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano, publicado por el usuario `yuriilaba` en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo de frases multilingue `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez se construye sobre la arquitectura XLM-RoBERTa. El modelo tiene 278.043.648 parametros y un repositorio de 1,1 GB en formato safetensors.

El modelo resuelve el problema de determinar que acepcion concreta tiene una palabra polisemica dentro de un contexto oracional, tarea central para la anotacion lexica, la construccion de corpus semanticos y el enriquecimiento de sistemas de busqueda o traduccion. Su relevancia es limitada y muy especializada: se trata de un artefacto de investigacion derivado de un experimento concreto (una variante de aumento de datos mediante traduccion inversa, sin pooling sobre el token objetivo y con semilla 456), no de un modelo de proposito general.

La informacion publica es escasa. No se declara licencia, ni pipeline, ni lista de idiomas en los metadatos de HuggingFace. El unico respaldo cuantitativo son las metricas de evaluacion de la propia model card: una exactitud de WSD de 0,9221 y una correlacion STS de Pearson 0,8063 y Spearman 0,7955.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (modelo de encoder tipo transformer, via `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura XLM-RoBERTa admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (solo se declara el formato de pesos original en safetensors) |
| Idiomas soportados | no disponible en los metadatos; el ajuste fino esta orientado al ucraniano y el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, tomado del checkpoint de frases multilingue `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que emplea el objetivo de aprendizaje contrastivo MPNet y produce representaciones de frase de 768 dimensiones. Sobre esa base se aplico un ajuste fino supervisado para la tarea de desambiguacion del sentido de las palabras en ucraniano, con un total de 278 millones de parametros, coherente con el tamano de `xlm-roberta-base`.

La model card detalla la configuracion del experimento: los datos de entrenamiento provienen del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_translation_16_samples.csv`, un conjunto de tripletes generados mediante aumentacion con traduccion inversa (back translation). Se indica que el pooling del token objetivo esta desactivado (`False`), que la semilla de entrenamiento es 456 y que la semilla de particion de validacion es 42. No se especifica el numero de tokens de entrenamiento ni la composicion completa del dataset, y no se menciona el uso de RLHF, DPO ni tecnicas de alineacion similares. Tampoco se describe ninguna innovacion arquitectonica adicional mas alla del ajuste fino sobre el encoder preentrenado.

## Capacidades

- Desambiguacion del sentido de palabras (WSD) en ucraniano, con una exactitud declarada de 0,9221 en la evaluacion del autor.
- Generacion de embeddings de frase y de oracion (uso propio de sentence-transformers), con correlacion semantica STS de 0,8063 (Pearson) y 0,7955 (Spearman).
- Similitud semantica textual, util para recuperacion y agrupamiento de textos.
- Capacidad multilingue heredada del modelo base `paraphrase-multilingual-mpnet-base-v2`, orientada a mas de 50 idiomas, aunque el ajuste fino se ha realizado sobre datos en ucraniano.
- Soporte de tool calling / function calling: no disponible (es un modelo de representacion tipo encoder, no un modelo generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible. El modelo no genera texto de forma autoregresiva.

## Casos de uso

- Anotacion lexica de corpus en ucraniano: el modelo puede asignar la acepcion correcta a palabras polisemicas dentro de su contexto, alimentando corpus anotados semanticamente con una exactitud declarada superior al 92 %.
- Construccion y enriquecimiento de bases de conocimiento tipo WordNet: permite enlazar ocurrencias textuales con synsets concretos, paso previo habitual en tareas de entity linking y de integracion lexicografica.
- Preprocesamiento para traduccion automatica: al desambiguar el sentido antes de traducir se reduce la ambiguedad lexica que provoca errores en sistemas de MT, especialmente en pares con lenguas morfologicamente ricas.
- Busqueda semantica y recuperacion de informacion: los embeddings generados permiten indexar documentos ucranianos y recuperar pasajes por similitud conceptual en lugar de coincidencia exacta de terminos.
- Clasificacion y agrupamiento de textos ucranianos: los vectores de frase sirven como caracteristicas de entrada para modelos de clasificacion, clustering o deteccion de duplicados en corpus grandes.
- Filtrado y deduplicacion de datasets multilingues: la correlacion STS declarada permite descartar pares de oraciones casi identicas o mal alineadas en pipelines de curacion de datos.
- Evaluacion de embeddings y comparacion de variantes: el repositorio incluye resultados MTEB en `evaluation/mteb_results/`, por lo que sirve como punto de referencia para comparar estrategias de aumento de datos en WSD.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor:

| Metrica | Resultado |
|---|---|
| WSD accuracy | 0,9220532319391636 |
| STS Pearson | 0,8063216198157097 |
| STS Spearman | 0,7955248402393552 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que los resultados completos por tarea de MTEB estan en `evaluation/mteb_results/`, pero no se han facilitado los valores concretos. No se dispone de comparaciones directas con otros modelos en las mismas condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 278 millones de parametros, no confirmada por el autor): en fp32 en torno a 1,1 GB; en fp16/bfloat16 en torno a 0,55-0,6 GB; en int8 en torno a 0,3 GB. Hay que sumar el consumo del tokenizador y de los tensores de activacion, por lo que en la practica conviene reservar al menos 1-2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente; en la mayoria de casos el modelo esta infrautilizado en GPUs de gama alta.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable. Con 278 millones de parametros la inferencia en CPU es lenta pero perfectamente utilizable para procesamiento por lotes offline.
- Opciones de despliegue: la via natural es la libreria `sentence-transformers` sobre PyTorch o la libreria `transformers` de HuggingFace. Tambien es posible exportar a ONNX Runtime, TorchScript u otras herramientas de compilacion. No se recomienda vLLM, TGI ni llama.cpp, ya que estan orientados a modelos generativos de decoder y no a encoders de representacion.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo. Al ser un encoder no generativo, el throughput se mide en oraciones procesadas por segundo por lote, metrica que el autor no facilita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ucu-wsd-aug16-generation_back_translation_pt-false_seed-456` | 278 M | no disponible | WSD en ucraniano y embeddings de frase | no disponible | HuggingFace |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | ~278 M | hasta 512 tokens (arquitectura) | Embeddings de frase multilingues | Apache 2.0 (segun la fuente original) | HuggingFace, ampliamente usado |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | ~118 M | hasta 512 tokens (arquitectura) | Embeddings de frase multilingues, version ligera | Apache 2.0 (segun la fuente original) | HuggingFace |
| `sentence-transformers/LaBSE` | ~471 M | hasta 512 tokens (arquitectura) | Embeddings bilingues y multilingues | Apache 2.0 (segun la fuente original) | HuggingFace |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos y el aqui descrito, mas alla de las metricas WSD y STS declaradas por el autor. La comparacion se limita a parametros, contexto y licencia; los datos de rendimiento relativo no estan disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgos y el modelo hereda los sesgos de los datos de preentrenamiento multilingues de XLM-RoBERTa.
- Riesgo de alucinacion: bajo en el sentido generativo, porque el modelo no produce texto libre. El riesgo real es de asignacion erronea de sentido o de similitud semantica mal calibrada ante vocabulario fuera de dominio.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el ajuste fino. La arquitectura XLM-RoBERTa admite hasta 512 tokens, pero la configuracion de sentence-transformers suele reducirla, y el autor no especifica el valor empleado.
- Limitaciones de idioma: el ajuste fino se ha realizado sobre datos en ucraniano. Aunque el modelo base es multilingue, aplicar este checkpoint a otros idiomas sin validacion previa puede degradar gravemente el rendimiento.
- Restricciones de licencia: la licencia no esta declarada en la ficha de HuggingFace, lo que impide confirmar si se permite el uso comercial. Antes de cualquier uso en produccion debe aclararse este punto con el autor.
- Caveat de trazabilidad: los unicos datos de rendimiento proceden del propio autor y no han sido replicados por terceros. El modelo tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha, por lo que carece de validacion externa.
- Caveat de identificacion: el identificador incluye la cadena `aug16` y el nombre del fichero de entrenamiento menciona `16_samples`, lo que sugiere un conjunto de datos muy pequeno. Esto aumenta el riesgo de sobreajuste y de que las metricas no se generalicen.
- Uso no previsto: el modelo no es un asistente conversacional ni un generador de codigo; no debe emplearse como sustituto de un LLM generativo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-456
- Variante relacionada del mismo autor: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_pt-true_seed-42
- Variante con nombre casi identico: https://huggingface.co/yuriilaba/ucu-wsd-generation_back_translation_pt-false_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Paper de XLM-RoBERTa (arquitectura subyacente): https://arxiv.org/abs/1911.02116
- Paper de MPNet (objetivo de preentrenamiento): https://arxiv.org/abs/2004.05150
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Resultados MTEB referenciados por el autor: disponibles en el propio repositorio, en la ruta `evaluation/mteb_results/` (no se ha facilitado URL directa)
