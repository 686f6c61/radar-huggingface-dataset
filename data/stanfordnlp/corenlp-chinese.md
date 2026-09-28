# stanfordnlp/corenlp-chinese

## Resumen

CoreNLP Chinese es la distribucion de modelos y recursos del toolkit CoreNLP de la Universidad de Stanford (grupo stanfordnlp) especificamente preparada para el procesamiento del chino mandarin (codigo de idioma zh). No se trata de un modelo generativo tipo LLM, sino de un conjunto de anotadores linguisticos empaquetados para su uso dentro del framework CoreNLP, escrito en Java, que produce anotaciones sobre texto: segmentacion en tokens y frases, etiquetado morfosintactico (POS), reconocimiento de entidades nombradas, normalizacion de valores numericos y temporales, analisis de dependencias y de constitucion, correferencia, analisis de sentimiento, atribucion de citas y extraccion de relaciones.

El repositorio de HuggingFace tiene un tamano de 5,7 GB, lo que refleja que contiene los artefactos serializados de los distintos modelos del pipeline chino, no un unico fichero de pesos. La model card es generica y fue generada automaticamente por el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`; no incluye detalles de arquitectura, datos de entrenamiento ni resultados de evaluacion.

Su relevancia actual es la de un recurso de referencia para pipelines de PLN en chino que requieren anotaciones linguisticas clasicas reproducibles y ejecutables en la JVM, en un ecosistema donde la mayoria de alternativas modernas se distribuyen como modelos neuronales en Python. La licencia GPL-2.0 condiciona su integracion en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de anotadores linguisticos en Java (componentes estadisticos y neuronales segun el anotador); no es un unico modelo transformer |
| Parametros totales | No disponible (el repositorio agrupa multiples modelos, sin recuento publicado) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No aplica como ventana de atencion; el pipeline procesa documentos divididos en frases |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | GPL-2.0 |
| Formato de pesos | No disponible; se distribuyen artefactos serializados del toolkit CoreNLP, no safetensors ni GGUF |

## Arquitectura y entrenamiento

CoreNLP esta descrito por sus autores como una solucion integral para PLN en Java. La distribucion para chino agrupa los anotadores necesarios para pasar de texto en crudo a una representacion anotada multicapa: limites de token y de frase, POS, entidades nombradas, valores numericos y temporales, analisis de dependencias y de constitucion, correferencia, sentimiento, atribucion de citas y relaciones. Cada anotador aporta su propio modelo, por lo que no existe una arquitectura unica ni un recuento de parametros agregado aplicable.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni sobre innovaciones tecnicas especificas para esta distribucion concreta: la model card unicamente referencia la web del proyecto y el repositorio de GitHub. Tampoco se documenta en el repositorio el proceso de conversion a formato HuggingFace, salvo que fue generado automaticamente mediante `hugging_corenlp.py`.

## Capacidades

- Segmentacion de texto chino en tokens y frases, requisito previo para cualquier otro anotador dado que el chino no separa palabras con espacios.
- Etiquetado morfosintactico (POS tagging) sobre texto chino.
- Reconocimiento de entidades nombradas (personas, organizaciones, localizaciones, etc.) en el esquema de CoreNLP.
- Normalizacion de valores numericos, monetarios y temporales, y resolucion de expresiones de tiempo.
- Analisis sintactico de dependencias y de constitucion (constituency parsing).
- Resolucion de correferencia sobre documentos.
- Analisis de sentimiento a nivel de frase y de documento.
- Atribucion de citas y extraccion de relaciones entre entidades.
- No incluye generacion de texto, razonamiento conversacional, tool calling, capacidades multimodales ni modo de razonamiento explicito.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Preprocesado para pipelines de PLN en chino: la segmentacion en tokens y frases es un paso obligatorio antes de alimentar modelos de clasificacion, busqueda o resumen; este repositorio ofrece ese paso junto con capas adicionales de anotacion dentro del mismo framework.
- Extraccion de entidades en documentos financieros o legales en chino: el anotador NER permite poblar indices de personas, organizaciones y lugares para busqueda facetada o para revision documental.
- Analisis de dependencias para investigacion linguistica: los arboles de dependencias y de constitucion permiten estudios sintacticos cuantitativos sobre corpus chinos sin necesidad de anotacion manual.
- Analisis de sentimiento sobre resenas de producto o comentarios en redes: el anotador de sentimiento produce una etiqueta por frase y una agregada por documento, util para cuadros de mando de opinion.
- Resolucion de correferencia en analisis de noticias: permite encadenar menciones de una misma entidad a lo largo de un articulo, necesario para resumenes y para atribucion correcta de declaraciones.
- Atribucion de citas en periodismo o en analisis de declaraciones publicas: identifica quien dice que en un texto, lo que facilita la verificacion y el seguimiento de fuentes.
- Extraccion de relaciones para construccion de grafos de conocimiento: las relaciones detectadas entre entidades pueden volcarse a una base de datos de grafos para enlazar personas, organizaciones y eventos.
- Anonimizacion y enmascarado de datos personales: la combinacion de NER y normalizacion de valores permite localizar nombres, fechas e importes antes de compartir un corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de F1, exactitud ni comparaciones con otros sistemas para los anotadores chinos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El toolkit esta implementado en Java y se ejecuta sobre la JVM, por lo que el consumo relevante es de memoria RAM del proceso, no de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible; no se documenta en el repositorio un modo de ejecucion acelerado por GPU para esta distribucion.
- Opciones de despliegue: el uso previsto es a traves de CoreNLP sobre la JVM (libreria Java o servidor de anotacion de CoreNLP). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos y no a este tipo de pipeline.
- Latencia y throughput estimados: no disponibles. Dependen del anotador activado, del tamano del documento y de los recursos de la maquina; el tamano del repositorio (5,7 GB) implica tiempos de carga de modelos apreciables en memoria.

## Comparativa con modelos similares

No disponible en la informacion proporcionada. No se han facilitado datos de rendimiento, parametros ni contexto de otros toolkits de PLN para chino (por ejemplo, alternativas basadas en Python) que permitan una comparacion verificable. La unica informacion cuantitativa disponible de este repositorio es su tamano (5,7 GB), 0 descargas y 4 likes en HuggingFace, sin fecha de referencia de uso comparable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al ser modelos estadisticos o neuronales entrenados sobre corpus, es esperable que hereden los sesgos de dichos corpus, pero no se aporta detalle.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no produce texto libre; el riesgo equivalente es la asignacion incorrecta de etiquetas (entidades, relaciones o correferencias erroneas) sin indicacion de incertidumbre.
- Limitaciones de contexto o idioma: el repositorio esta orientado exclusivamente al chino (zh). No se documenta soporte multilingue en esta distribucion.
- Restricciones de licencia: GPL-2.0. Esta licencia copyleft puede condicionar el uso en productos propietarios, ya que la distribucion de software derivado obliga a mantener la misma licencia; conviene revisar el caso de uso con asesoria legal antes de integrarlo en un producto comercial cerrado.
- Caveats para produccion: la model card es generica y generada automaticamente, sin documentacion de versiones de los modelos subyacentes, metricas ni procedencia de datos. El repositorio registra 0 descargas, lo que sugiere que la distribucion en HuggingFace no es la via principal de adopcion del proyecto.
- El consumo de memoria y los tiempos de carga derivados de un repositorio de 5,7 GB deben tenerse en cuenta en entornos con recursos limitados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/stanfordnlp/corenlp-chinese
- Web oficial de CoreNLP: https://stanfordnlp.github.io/CoreNLP
- Repositorio GitHub de CoreNLP: https://github.com/stanfordnlp/CoreNLP
- Repositorio de generacion de tarjetas para HuggingFace: https://github.com/stanfordnlp/huggingface-models
