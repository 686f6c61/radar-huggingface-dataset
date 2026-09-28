# stanfordnlp/corenlp-arabic

## Resumen

CoreNLP Arabic es el paquete de modelos de lengua árabe del toolkit Stanford CoreNLP, publicado por el Stanford NLP Group en HuggingFace como repositorio auxiliar (`stanfordnlp/corenlp-arabic`). No es un modelo generativo ni un transformer: es un conjunto de modelos estadísticos y de aprendizaje automático serializados en Java que se encadenan en un pipeline de anotación lingüística. Su función es producir anotaciones sobre texto árabe: fronteras de token y de frase, categorías gramaticales, entidades nombradas, valores numéricos y temporales, y análisis sintáctico.

El repositorio ocupa 0,5 GB y declara únicamente el idioma árabe (`ar`) bajo licencia GPL-2.0. La model card es la plantilla genérica de CoreNLP, generada automáticamente por el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`, y no aporta detalles sobre datos de entrenamiento, métricas ni componentes concretos incluidos en este paquete.

Su relevancia actual es limitada pero específica: sigue siendo una opción madura para proyectos que ya operan sobre la JVM y necesitan un pipeline de PLN árabe reproducible sin dependencias de Python ni GPU. En HuggingFace acumula 0 descargas y 3 "likes", lo que indica que la distribución canónica sigue siendo Maven/JAR y no el hub de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de PLN en Java con anotadores encadenados (modelos de clasificación estadística y parser de constituyentes shift-reduce; el detalle exacto por componente no está documentado en la model card) |
| Parametros totales | no disponible (el repositorio ocupa 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa frases y documentos completos; no existe una ventana de atención) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos cuantizables; no hay versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | árabe (ar) |
| Licencia | GPL-2.0 |
| Formato de pesos | modelos serializados de Java (`.ser.gz`) empaquetados en JAR (`stanford-corenlp-models-arabic`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

CoreNLP es una biblioteca Java que organiza el análisis en anotadores independientes que se ejecutan en cadena sobre una estructura de datos común (`Annotation`). En el caso árabe, la cadena típica cubre tokenización y segmentación, etiquetado gramatical con rasgos morfológicos, lematización, reconocimiento de entidades nombradas y análisis sintáctico de constituyentes y de dependencias. Los componentes estadísticos clásicos de CoreNLP se apoyan en modelos de máxima entropía y campos aleatorios condicionales, mientras que los anotadores más recientes emplean redes neuronales implementadas en Java. La model card no especifica qué variante concreta usa cada anotador en este paquete.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del corpus ni la existencia de ajuste por refuerzo o preferencias: son datos que no aplican al grueso de los anotadores (no hay generación de texto) y que la model card no detalla. Tampoco se documentan innovaciones técnicas específicas de esta versión. La fecha de actualización declarada en el hub (27/09/2026) es posterior a la fecha de creación (02/03/2022) y coherente con un proceso de regeneración automática, no con un reentrenamiento.

## Capacidades

- Tokenización, segmentación de frases y manejo de texto árabe no vocalizado.
- Etiquetado gramatical (POS) con rasgos morfológicos y lematización.
- Reconocimiento de entidades nombradas (persona, organización, lugar y miscelánea).
- Normalización de valores numéricos, temporales y monetarios (timex).
- Análisis sintáctico de constituyentes y de dependencias.
- Salida estructurada en varios formatos (XML, JSON, CoNLL, texto plano), apta para consumo programático.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene modo "thinking".
- No ofrece visión, audio ni multimodalidad.
- Capacidades multilingües: no dispone de ellas; el paquete está limitado al árabe. La propia model card describe la herramienta CoreNLP en general, cuyas funcionalidades (por ejemplo, correferencia o análisis de sentimiento) no están confirmadas para árabe en este paquete.

## Casos de uso

- Preprocesado de corpus árabes para entrenamiento de modelos: tokenización, lematización y normalización previas a la vectorización, con la ventaja de que el pipeline es determinista y auditable frente a soluciones neuronales opacas.
- Indexación y búsqueda documental: la lematización y el POS permiten construir índices en Lucene/Elasticsearch que agrupan variantes morfológicas de un mismo término árabe, mejorando la recuperación frente a la búsqueda por cadena exacta.
- Extracción de entidades en prensa y boletines oficiales: el anotador NER permite poblar bases de conocimiento con personas, organizaciones y lugares citados en texto árabe.
- Anonimización y cumplimiento normativo: detección de nombres de persona en documentos para su pseudonimización antes de compartir el material, un requisito habitual bajo el RGPD.
- Construcción de líneas temporales y análisis de eventos: el anotador de valores temporales normaliza fechas y períodos, lo que permite ordenar cronológicamente hechos extraídos de un corpus.
- Herramientas de aprendizaje de árabe: el análisis de constituyentes y dependencias sirve para generar ejercicios de análisis gramatical y para validar la estructura de oraciones producidas por estudiantes.
- Integración en aplicaciones JVM existentes: al distribuirse como JAR, se puede incrustar en servicios Java o desplegar como servidor HTTP sin introducir un stack Python en producción.
- Enriquecimiento de datasets para anotación humana: el pipeline genera preanotaciones que reducen el coste del etiquetado manual en proyectos de anotación lingüística árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: no aplica. CoreNLP ejecuta la inferencia en CPU a través de la JVM; no existe backend CUDA para estos modelos.
- VRAM estimada: no aplica (no hay pesos en GPU). El repositorio ocupa 0,5 GB en disco.
- Memoria RAM: se debe dimensionar el heap de la JVM; no se publican cifras oficiales. Con varios anotadores activos conviene reservar varios gigabytes para evitar errores de memoria.
- CPU: cualquier procesador x86-64 o ARM con Java 8 o superior. El servidor de CoreNLP admite procesamiento multihilo, por lo que el rendimiento escala con núcleos.
- GPU de consumo: irrelevante para este modelo; cabe en cualquier portátil actual, condicionado únicamente por la RAM asignada a la JVM.
- Opciones de despliegue: uso como librería Java vía Maven, CoreNLP Server (API HTTP con salida JSON/XML) y contenedores Docker a partir del Dockerfile del repositorio oficial. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no expone pesos en formatos de transformer.
- Latencia y throughput: no disponible para árabe; dependen del número de anotadores habilitados y de los hilos configurados.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| stanfordnlp/corenlp-arabic | Pipeline de PLN en Java (estadístico y neuronal en JVM) | árabe | no disponible (repo de 0,5 GB) | no aplica | GPL-2.0 | HuggingFace, Maven, JAR |
| CAMeL Tools | Toolkit de PLN en Python para árabe | árabe, incluidos dialectos | múltiples modelos, no disponible | no aplica | MIT (según repositorio; verificar) | pip y GitHub |
| Farasa | Segmentación, POS, lematización y diacritización | árabe | no disponible | no aplica | no disponible (consultar repositorio) | API web, JAR y wrapper de Python |
| Stanza | Pipeline neuronal en PyTorch | más de 70 idiomas, incluido árabe | no disponible | no aplica | Apache-2.0 (según repositorio; verificar) | pip y GitHub |
| MADAMIRA | Morfología y POS para árabe | árabe estándar y egipcio | no disponible | no aplica | licencia de investigación, no open source | bajo petición |

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar, resumir ni responder preguntas; solo anota.
- Cobertura de dialectos no documentada: la model card declara únicamente `ar` y no detalla el registro cubierto, por lo que el rendimiento en árabe dialectal es incierto y previsiblemente inferior al obtenido en árabe estándar moderno.
- Anotadores no confirmados para árabe: la descripción de la model card corresponde a CoreNLP en su conjunto; funciones como la correferencia o el análisis de sentimiento no están garantizadas en este paquete y deben verificarse antes de diseñar una arquitectura que dependa de ellas.
- Licencia GPL-2.0: es una licencia con copyleft. Integrar el modelo en un producto propietario distribuido puede obligar a liberar el código que lo enlaza bajo los términos de la GPL. Conviene revisar las opciones de licencia comercial que el grupo de Stanford ofrece para su software.
- Riesgo de error de etiquetado: los modelos estadísticos heredan los sesgos y las convenciones del corpus con el que se entrenaron (probablemente prensa y texto formal). No se documenta el corpus, por lo que no es posible auditar la representatividad.
- Sesgo de dominio: al no publicarse la composición del dataset, el comportamiento sobre texto jurídico, técnico, coloquial o de redes sociales no puede anticiparse.
- Dependencia de la segmentación: en árabe, decisiones de tokenización de clíticos afectan a todas las anotaciones posteriores; cambios de versión pueden alterar los resultados de forma no trivial.
- Repositorio con escasa tracción: 0 descargas y 3 "likes" en HuggingFace, con un tamaño de 0,5 GB y contenido preparado de forma automática. Para producción es preferible obtener los modelos desde Maven o desde la distribución oficial de CoreNLP, que además permite fijar la versión.
- Fecha de actualización anómala: el hub declara una modificación en 2026, coherente con un proceso automático; se recomienda comprobar la versión real del paquete antes de fijar dependencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/corenlp-arabic
- Sitio oficial de CoreNLP: https://stanfordnlp.github.io/CoreNLP
- Repositorio de CoreNLP en GitHub: https://github.com/stanfordnlp/CoreNLP
- Repositorio de generación de modelos para HuggingFace: https://github.com/stanfordnlp/huggingface-models
- Documentación de idiomas y modelos disponibles: https://stanfordnlp.github.io/CoreNLP/human-languages.html
- Documentación del servidor CoreNLP: https://stanfordnlp.github.io/CoreNLP/corenlp-server.html
- Página de descarga y modelos de CoreNLP: https://stanfordnlp.github.io/CoreNLP/download.html
- Artículo de referencia del toolkit (Manning et al., ACL 2014, demo de sistemas): https://aclanthology.org/P14-5010/
