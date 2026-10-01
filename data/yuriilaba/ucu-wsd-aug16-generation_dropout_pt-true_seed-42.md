# yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-42

## Resumen

`yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-42` es un modelo de lenguaje de tipo encoder fine-tuneado para la desambiguacion del sentido de las palabras (word sense disambiguation, WSD) en ucraniano. Lo publica el usuario de HuggingFace `yuriilaba` y parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder multilingue basado en la arquitectura XLM-RoBERTa con 278.043.648 parametros. El problema que aborda es clasico en procesamiento del lenguaje natural: decidir, dado un token en contexto, a que acepcion concreta corresponde cuando la palabra es polisemica.

El modelo se entrena sobre tripletas generadas de forma semiautomatica a partir del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_dropout_16_samples.csv`, con pooling sobre el token objetivo (`target-token pooling: True`) y semillas fijas de entrenamiento y validacion (42). El autor reporta una exactitud de desambiguacion de 0.9395 y correlaciones de similitud semantica textual (STS) de 0.7993 Pearson y 0.7899 Spearman, lo que sugiere que el fine-tuning preserva parcialmente la capacidad de representacion semantica general del modelo base mientras especializa el espacio de embeddings hacia la distincion de sentidos.

Su relevancia actual es acotada pero especifica: el ucraniano es un idioma con menos recursos que el ingles o el castellano, y los modelos de desambiguacion lexica publicados abiertamente para esta lengua son escasos. Este checkpoint no tiene descargas ni likes en el momento de redactar la ficha, no declara licencia y no incluye una model card extensa, por lo que debe tratarse como un artefacto de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) con pooling de token objetivo; base `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base XLM-RoBERTa admite 512 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin cuantizar (repo de 1,1 GB, coherente con fp32) |
| Idiomas soportados | no disponible en los metadatos; el autor describe el modelo como fine-tuned para ucraniano y el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de la familia XLM-RoBERTa, heredada de `paraphrase-multilingual-mpnet-base-v2`. El autor anade una cabeza de pooling que opera especificamente sobre el token objetivo (`target-token pooling: True`), en lugar de promediar todos los tokens de la secuencia. Este detalle es relevante para WSD: la representacion que se clasifica o compara es la del token cuya acepcion se quiere resolver, no la del conjunto de la frase, lo que evita diluir la senal lexica en el resto del contexto.

El entrenamiento se realiza sobre tripletas almacenadas en `local_datasets/semi_supervised_2/triplets/triplets_generation_dropout_16_samples.csv`, un esquema de datos semisupervisado con generacion aumentada y dropout (el nombre del checkpoint indica 16 muestras generadas por instancia). La configuracion fija semillas de entrenamiento y de particion de validacion en 42, lo que hace el experimento reproducible. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, la funcion de perdida ni si se aplicaron tecnicas de alineacion como RLHF o DPO; en un modelo de este tipo lo habitual seria entrenamiento contrastivo o de tripletas, pero no se confirma en la model card.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos de estado recurrente. El valor del modelo reside en la especializacion del espacio de embeddings para una tarea lexica concreta, no en una arquitectura novedosa.

## Capacidades

- Generacion de representaciones vectoriales (embeddings) de palabras en contexto para ucraniano.
- Desambiguacion del sentido de palabras: asignacion de la acepcion correcta a un token polisemico, con exactitud reportada de 0.9395.
- Similitud semantica textual (STS): correlaciones de 0.7993 (Pearson) y 0.7899 (Spearman) sobre la evaluacion declarada.
- Recuperacion semantica y busqueda por similitud mediante comparacion de embeddings.
- Transferencia multilingue potencial por herencia del modelo base, aunque no verificada ni declarada por el autor.
- Evaluacion mediante tareas de MTEB: el autor indica que los resultados completos por tarea estan en `evaluation/mteb_results/` del repositorio.
- No hay evidencia de soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido. Es un encoder, no un modelo generativo de instrucciones.

## Casos de uso

- Desambiguacion lexica en pipelines de PLN para ucraniano: el modelo se inserta como clasificador o generador de representaciones sobre el token objetivo, permitiendo anotar corpus con la acepcion correcta sin intervencion manual.
- Construccion y ampliacion de recursos lexicos: al agrupar embeddings por sentido, se pueden proponer candidatos de acepciones nuevas o fusionar entradas duplicadas en un lexico o WordNet ucraniano, con revision humana posterior.
- Busqueda semantica y recuperacion de informacion: los embeddings contextuales permiten indexar documentos ucranianos y responder consultas por similitud, distinguiendo usos de una misma palabra en dominios distintos.
- Deduplicacion y agrupacion de contenidos: la componente STS del modelo (Pearson 0.799) es adecuada para detectar parafrasis, noticias repetidas o variantes de una misma pregunta en foros y sistemas de soporte.
- Anotacion asistida con aprendizaje activo: dado que no hay licencia declarada y el rendimiento reportado es alto, es un candidato razonable para preetiquetar grandes volumenes de texto y que anotadores humanos corrijan solo los casos de baja confianza.
- Evaluacion de traduccion automatica y de resumenes: comparar el embedding del token objetivo entre original y traduccion permite detectar elecciones lexicas erroneas cuando la polisemia no se preserva.
- Filtrado de contenido y control de calidad editorial: deteccion de cambios de sentido no deseados en reescritura automatica o en textos generados por otros modelos.
- Sistemas de recomendacion basados en contenido: representar articulos o descripciones de producto en ucraniano y recomendar por cercania semantica, diferenciando sentidos que un modelo puramente lexico confundiria.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| Desambiguacion de sentidos (WSD) | Exactitud | 0.9394803548795945 |
| Similitud semantica textual (STS) | Pearson | 0.7992594992931791 |
| Similitud semantica textual (STS) | Spearman | 0.7899127833023291 |
| MTEB (resto de tareas) | no disponible | resultados en `evaluation/mteb_results/` del repositorio, no incluidos en la informacion proporcionada |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, que no aplican a un encoder de este tipo. Tampoco se ofrece comparacion con lineas base en la model card, por lo que no es posible contrastar la mejora atribuible al fine-tuning frente al modelo de partida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (coincide con el tamano del repo), unos 0,56 GB en fp16/bf16 y unos 0,28 GB en int8. Hay que anadir memoria para activaciones y lote, tipicamente 0,5-2 GB adicionales segun la longitud de secuencia y el batch.
- GPU recomendadas: cualquier GPU con 4 GB o mas es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problema. Para lotes grandes en servidor, una A10G, L4, A100 o H100 ofrecen mas margen y mejor throughput, pero no son necesarias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida suficiente. Tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` y `transformers` son las vias naturales; tambien es exportable a ONNX o TorchScript para inferencia optimizada. vLLM y Text Embeddings Inference (TEI) admiten modelos encoder de embeddings. `llama.cpp` y Ollama no son adecuados sin una conversion manual a GGUF, ya que no es un modelo causal de generacion de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Para dimensionar, un encoder de 278M parametros procesa lotes de decenas o cientos de secuencias por segundo en GPU moderna, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-42 | 278 M | no disponible (base: 512 tokens) | WSD acc. 0.9395; STS Pearson 0.7993 | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 tokens | no disponible en esta ficha; es el modelo base | Apache-2.0 | HuggingFace |
| sentence-transformers/LaBSE | 471 M | 512 tokens | no disponible en esta ficha | Apache-2.0 | HuggingFace |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | no disponible en esta ficha | MIT | HuggingFace |

No se conocen modelos publicos directamente comparables en la tarea especifica de WSD para ucraniano dentro de la informacion proporcionada. Los modelos de la tabla son alternativas de la misma categoria (encoders multilingues de embeddings) pero no estan evaluados en WSD ucraniano, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, el uso comercial es juridicamente incierto. Hay que contactar con el autor antes de integrarlo en un producto.
- Ausencia de model card detallada: no se documentan sesgos, composicion del dataset de tripletas ni procedencia de los datos de entrenamiento, lo que impide auditar el modelo.
- Sesgo linguistico y de dominio: al ser un fine-tuning especifico, el comportamiento fuera del ucraniano y fuera del dominio de los datos de tripletas no esta garantizado, aunque el modelo base sea multilingue.
- Riesgo de sobreajuste a la particion de validacion: con semillas fijas (42) y un dataset semisupervisado generado, las cifras de 0.9395 de exactitud en WSD pueden no replicarse en datos reales de otro dominio.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de asignacion incorrecta de sentido con alta confianza en tokens poco frecuentes o en contextos ambiguos.
- Confusion entre tareas: el autor mezcla metricas de WSD y de STS en la misma evaluacion; conviene verificar en `evaluation/mteb_results/` si las tareas estan correctamente separadas antes de reutilizar las cifras.
- Limitacion de contexto: al derivar de XLM-RoBERTa, el modelo no puede procesar secuencias largas; la desambiguacion se limita a la ventana de contexto del encoder.
- Sin adopcion verificable: 0 descargas y 0 likes implican que el checkpoint no ha sido validado por terceros ni reproducido de forma independiente.
- Reproducibilidad parcial: se referencian rutas locales (`local_datasets/semi_supervised_2/...`) que no forman parte del repositorio, por lo que el entrenamiento no se puede replicar tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_dropout_pt-true_seed-42
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB del autor: carpeta `evaluation/mteb_results/` dentro del repositorio del modelo (no se proporciona URL directa)
- Paper de XLM-RoBERTa (arquitectura base): https://arxiv.org/abs/1911.02116
- Paper de Sentence-BERT (framework de embeddings): https://arxiv.org/abs/1908.10084
- MTEB (benchmark de embeddings): https://arxiv.org/abs/2210.07316
