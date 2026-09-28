# stanfordnlp/corenlp-english-default

## Resumen

`stanfordnlp/corenlp-english-default` es el repositorio de artefactos de modelos por defecto para el pipeline de **CoreNLP en ingles**, publicado por el grupo Stanford NLP en Hugging Face. No se trata de un modelo generativo ni de un LLM conversacional, sino del paquete de modelos estadisticos y neuronales que la herramienta CoreNLP (implementada en Java) carga para producir anotaciones linguisticas sobre texto: limites de token y de frase, etiquetado morfosintactico (POS), entidades nombradas (NER), valores numericos y temporales, analisis de dependencias y de constitucion, correferencia, sentimiento, atribucion de citas y extraccion de relaciones.

El repositorio ocupa 2,8 GB y fue creado el 2 de marzo de 2022, con una actualizacion automatica registrada el 27 de septiembre de 2026. La model card indica que tanto esta ficha como el repositorio se generaron de forma automatica mediante el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`, por lo que no incluye detalles de arquitectura por componente, recuento de parametros ni datos de entrenamiento.

Su relevancia actual es la de servir como dependencia lista para descargar desde Hugging Face para proyectos que ya usan CoreNLP en produccion: permite fijar versiones de los modelos en lugar de obtenerlos por otros canales, con la salvedad importante de que la licencia es GPL-2.0 y de que el ambito se limita al idioma ingles. Con 0 descargas y 2 "me gusta" en el momento de la consulta, su adopcion via Hugging Face es marginal dentro del ecosistema de la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de modelos del pipeline CoreNLP; la model card no detalla la arquitectura de cada componente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (no es un modelo generativo con ventana de contexto; CoreNLP procesa documentos segmentados en frases) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | GPL-2.0 |
| Formato de pesos | no disponible en la informacion proporcionada; el repositorio contiene 2,8 GB de artefactos de modelos del pipeline CoreNLP |
| Autor | stanfordnlp |
| Tipo de modelo | suite de anotadores linguisticos (NLP pipeline), no generativo |
| Tareas cubiertas | tokenizacion, segmentacion de frases, POS, NER, valores numericos y temporales, dependencias, constitucion, correferencia, sentimiento, atribucion de citas, relaciones |
| Tamano del repositorio | 2,8 GB |
| Fecha de creacion | 2022-03-02 |
| Ultima actualizacion | 2026-09-27 |
| Descargas | 0 |
| Likes | 2 |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna de los componentes incluidos en el repositorio. La model card se limita a indicar que CoreNLP es una herramienta integral de procesamiento de lenguaje natural en Java y a enumerar las anotaciones que permite derivar, sin especificar si cada anotador se basa en modelos de secuencia, redes neuronales o componentes hibridos. Tampoco se detalla el numero de parametros de cada anotador ni como se distribuyen esos 2,8 GB entre los distintos modelos.

Respecto a los datos de entrenamiento, no hay informacion disponible: no se indica el volumen de tokens, la composicion del corpus, si hubo ajuste por RLHF o DPO, ni ninguna innovacion tecnica concreta (decodificacion especulativa, atencion lineal u otras). El unico dato de proceso documentado es que los artefactos se empaquetaron y publicaron de forma automatica mediante el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`, con fecha de ultima actualizacion del 27 de septiembre de 2026.

## Capacidades

- Tokenizacion y segmentacion de frases en textos en ingles.
- Etiquetado de partes de la oracion (POS tagging).
- Reconocimiento de entidades nombradas (personas, organizaciones, lugares y otras categorias cubiertas por CoreNLP).
- Normalizacion y deteccion de valores numericos y expresiones temporales.
- Analisis sintactico de dependencias y de constitucion (parseo de dependencias y de constituyentes).
- Resolucion de correferencia entre menciones a lo largo de un documento.
- Analisis de sentimiento a nivel de porciones de texto.
- Atribucion de citas (identificacion de quien dice que en discurso con comillas).
- Extraccion de relaciones entre entidades.
- No dispone de generacion de texto, razonamiento generativo, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: no, unicamente ingles en este repositorio.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Indexacion y busqueda de corpus documentales: el pipeline extrae entidades, frases y relaciones de documentos completos, de modo que los resultados se pueden volcar a un indice (por ejemplo, Elasticsearch) para busquedas por entidad o por relacion en lugar de por palabra clave.
- Extraccion de informacion en el ambito legal o administrativo: la combinacion de NER, normalizacion temporal y extraccion de relaciones permite construir lineas de tiempo de eventos (fechas, partes implicadas, obligaciones) a partir de expedientes en ingles.
- Analisis de prensa y discurso publico: la atribucion de citas y el analisis de sentimiento permiten descomponer un articulo en declaraciones atribuidas a cada fuente y medir la polaridad de cada una, util para monitorizacion de medios.
- Construccion de grafos de conocimiento: la correferencia agrupa todas las menciones de una misma entidad a lo largo de un documento, lo que resulta necesario antes de poblar un grafo con nodos de entidad no duplicados.
- Preprocesado para otros sistemas de machine learning: el etiquetado POS, los lemas y los arboles de dependencias se pueden usar como caracteristicas de entrada en clasificadores o para construir conjuntos de datos anotados a escala.
- Normalizacion de expresiones temporales en asistentes internos: la deteccion de valores numericos y temporales permite convertir menciones como fechas o cantidades en formatos estructurados antes de enviarlas a un sistema de agenda o de facturacion.
- Procesamiento por lotes en entornos Java sin GPU: al ser una herramienta Java con modelos servidos desde este repositorio, encaja en backends empresariales que ejecutan procesos nocturnos de anotacion sobre volumenes grandes de texto.
- Enriquecimiento de registros de atencion al cliente en ingles: el sentimiento y la extraccion de entidades permiten clasificar y etiquetar tickets historicos para analitica posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de evaluacion (ni F1 de NER, ni exactitud de POS, ni resultados en MMLU, HumanEval, GSM8K o conjuntos equivalentes), y la busqueda web realizada no devolvio resultados relevantes sobre este repositorio.

## Requisitos de hardware

- VRAM para inferencia: no disponible. CoreNLP es una herramienta Java orientada a ejecucion en CPU; la informacion proporcionada no documenta requisitos de GPU ni uso de CUDA.
- GPU recomendadas: no disponibles. No se documenta ninguna GPU concreta (A100, H100, RTX 4090 u otras) para este repositorio.
- Viabilidad en GPU de consumo: no aplica segun la informacion disponible; el consumo relevante es de memoria RAM del proceso Java, no de VRAM.
- Memoria: el repositorio ocupa 2,8 GB en disco. Como referencia de planificacion, conviene reservar al menos esa cantidad de memoria para cargar los anotadores que se vayan a usar, aunque el desglose exacto por anotador no esta documentado. El dato preciso de RAM minima y recomendada es no disponible.
- Opciones de despliegue: la via documentada es la propia libreria CoreNLP en Java, que descarga o carga estos modelos; la model card enlaza a la web oficial y al repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline de anotacion no generativo. Existen wrappers de terceros (por ejemplo, para Python) mencionados de forma general en el ecosistema, pero no aparecen en la informacion proporcionada.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad ni de documentos procesados por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de alternativas, por lo que la comparacion se limita a caracteristicas verificables de forma general. Los datos de las alternativas no proceden de la busqueda realizada y deben confirmarse en sus propias fichas.

| Herramienta | Autor | Enfoque | Licencia | Idiomas | Rendimiento comparado |
|---|---|---|---|---|---|
| CoreNLP (english-default) | Stanford NLP | Pipeline Java de anotacion linguistica | GPL-2.0 | Ingles | no disponible |
| Stanza | Stanford NLP | Pipeline NLP en Python sobre modelos neuronales | Confirmar en su repositorio | Multilingue | no disponible |
| spaCy | Explosion | Pipeline NLP en Python, modelos por idioma | MIT (confirmar en su repositorio) | Multilingue | no disponible |
| NLTK | NLTK Project | Toolkit educativo y de investigacion en Python | Apache 2.0 (confirmar en su repositorio) | Multilingue | no disponible |

No se han encontrado en la informacion disponible comparaciones directas de parametros, contexto, rendimiento o cobertura frente a este repositorio concreto.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde a instrucciones, no soporta chat, tool calling ni uso como agente. Cualquier expectativa en ese sentido es incorrecta.
- Idioma: los modelos estan entrenados unicamente para ingles. Aplicarlos a texto en castellano u otros idiomas produce anotaciones poco fiables.
- Licencia GPL-2.0: permite uso comercial, pero es una licencia copyleft. La distribucion de obras derivadas o la integracion mediante enlace con software propietario puede activar obligaciones de liberacion del codigo bajo la misma licencia. Es un punto critico que debe revisar el departamento legal antes de incorporarlo a un producto cerrado.
- Ausencia de trazabilidad de rendimiento: no hay metricas publicadas en la informacion disponible, por lo que no es posible estimar la calidad de las anotaciones sin una evaluacion propia sobre el dominio de destino.
- Riesgo de error en tareas sensibles: como cualquier sistema estadistico de anotacion, puede producir errores en NER, correferencia, dependencias y sentimiento, especialmente con texto informal, jerga, dominios especializados o ruido de OCR. No debe usarse como fuente unica de verdad en flujos con consecuencias legales o economicas.
- Sin informacion de sesgos: la model card no documenta evaluaciones de sesgo demografico, geografico o de dominio, ni la composicion del corpus de entrenamiento.
- Mantenimiento: la ficha se genera de forma automatica y la fecha de ultima actualizacion registrada (2026-09-27) corresponde al proceso de empaquetado, no necesariamente a una revision del contenido de los modelos.
- Adopcion baja en Hugging Face: 0 descargas y 2 likes en el momento consultado, lo que reduce la probabilidad de encontrar soporte comunitario especifico para esta publicacion.
- La busqueda web asociada no devolvio resultados pertinentes: los enlaces obtenidos correspondian a sitios sin relacion con el modelo, por lo que no se han incorporado como referencias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stanfordnlp/corenlp-english-default
- Web oficial de CoreNLP: https://stanfordnlp.github.io/CoreNLP
- Repositorio GitHub de CoreNLP: https://github.com/stanfordnlp/CoreNLP
- Repositorio de empaquetado para Hugging Face: https://github.com/stanfordnlp/huggingface-models (referenciado en la model card como origen del script `hugging_corenlp.py`)
- Paper, blog o demo especificos: no disponibles en la informacion proporcionada.
