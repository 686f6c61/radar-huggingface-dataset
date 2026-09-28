# stanfordnlp/corenlp-french

## Resumen

`stanfordnlp/corenlp-french` es el paquete de modelos de CoreNLP para frances publicado por el Stanford NLP Group en HuggingFace. No se trata de un modelo generativo ni de un transformer de lenguaje: es el conjunto de artefactos que permite ejecutar el pipeline de anotacion linguistica de CoreNLP sobre texto en frances. CoreNLP es un toolkit escrito en Java que produce anotaciones como segmentacion de tokens y frases, etiquetado morfosintactico (POS), entidades nombradas, valores numericos y temporales, analisis de dependencias y de constituyentes, correferencia, sentimiento, atribucion de citas y relaciones.

El repositorio ocupa 0,6 GB, esta etiquetado exclusivamente con el idioma `fr` y se distribuye bajo licencia GPL-2.0. La model card fue generada automaticamente mediante el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`, por lo que no incluye informacion sobre arquitectura, datos de entrenamiento ni evaluacion.

Su relevancia es practica: cubre la necesidad de un pipeline NLP completo y maduro para frances dentro de entornos Java, sin depender de modelos generativos ni de APIs externas. La contrapartida es que la informacion publicada es minima (0 descargas registradas y 4 likes), no hay benchmarks ni detalle de los componentes incluidos para este idioma concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura de los componentes; CoreNLP es un pipeline de anotacion en Java, no un modelo generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo autorregresivo; procesa documentos completos segun los limites del pipeline de CoreNLP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (`fr`) |
| Licencia | GPL-2.0 |
| Formato de pesos | no disponible (repositorio de modelos de CoreNLP de 0,6 GB; la model card no detalla el formato de los ficheros) |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion | 2022-03-02 |
| Ultima actualizacion | 2026-09-27 |
| Descargas / likes | 0 / 4 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna de los componentes incluidos para frances, ni sobre el volumen de datos de entrenamiento, su composicion o si se aplicaron tecnicas de ajuste como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica concreta asociada a este paquete. Lo unico verificable es que el repositorio fue preparado de forma automatica con `hugging_corenlp.py` y que su ultima actualizacion registrada es del 27 de septiembre de 2026.

El texto de la model card describe CoreNLP de forma general, no especifica: "CoreNLP enables users to derive linguistic annotations for text, including token and sentence boundaries, parts of speech, named entities, numeric and time values, dependency and constituency parses, coreference, sentiment, quote attributions, and relations". No se indica en la informacion proporcionada que subconjunto de esas anotaciones esta efectivamente cubierto por los modelos franceses de este repositorio.

## Capacidades

- Anotacion linguistica de texto en frances dentro del pipeline de CoreNLP (la model card describe la cobertura general del toolkit, no la especifica por idioma).
- Segmentacion de tokens y de fronteras de frase.
- Etiquetado de partes de la oracion (POS tagging).
- Reconocimiento de entidades nombradas.
- Extraccion de valores numericos y temporales.
- Analisis sintactico de dependencias y de constituyentes.
- Correferencia.
- Analisis de sentimiento.
- Atribucion de citas (quote attributions).
- Extraccion de relaciones.
- No es un modelo generativo: no soporta generacion de texto, resumen, traduccion ni respuesta a preguntas por si mismo.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no, unicamente frances.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Preprocesado de corpus franceses para investigacion en linguistica computacional: el pipeline genera anotaciones de POS, dependencias y constituyentes sobre texto en frances, lo que permite construir corpus anotados de forma reproducible dentro de un flujo Java.
- Extraccion de entidades en documentacion empresarial en frances: integracion en un backend Java que procese contratos, informes o expedientes y extraiga personas, organizaciones, lugares, fechas y cantidades monetarias.
- Analisis de sentimiento en resenas o encuestas: al incluir analisis de sentimiento, permite clasificar opiniones de clientes en frances dentro de un sistema propio, sin enviar datos a servicios externos de terceros.
- Construccion de indices de busqueda semantica ligera: las anotaciones de lemas, POS y entidades pueden alimentar un motor de busqueda que necesite normalizar y enriquecer documentos franceses antes de indexarlos.
- Resolucion de correferencia en textos largos: util en analisis de noticias o informes juridicos donde hay que encadenar menciones a una misma entidad a lo largo del documento.
- Normalizacion de fechas y cantidades para pipelines de datos: la extraccion de valores numericos y temporales permite convertir expresiones en lenguaje natural a formatos estructurados antes de cargarlos en una base de datos o en un sistema financiero.
- Analisis de citas en prensa: la atribucion de citas permite identificar quien dice que en articulos periodisticos franceses, util para monitorizacion de medios.
- Sistemas de anonimizacion previa: la deteccion de entidades nombradas sirve como primera capa para localizar datos personales en textos franceses antes de aplicar reglas de redaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni F1 para ninguna de las tareas del pipeline, y la busqueda web realizada no aporto resultados tecnicos relevantes (unicamente enlaces a Google Translate, sin relacion con este modelo).

## Requisitos de hardware

- VRAM para inferencia: no aplica. CoreNLP es un toolkit Java que se ejecuta sobre la JVM y no requiere GPU.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no aplica, al no ser un modelo de inferencia neuronal acelerada.
- Almacenamiento: el repositorio ocupa 0,6 GB, por lo que se necesita al menos ese espacio en disco para los ficheros de modelo, mas el espacio de la distribucion de CoreNLP y de la JVM.
- Memoria RAM: no disponible. La model card no publica requisitos de memoria; depende del modelo cargado y del tamano de los documentos procesados.
- Opciones de despliegue: la model card apunta al uso mediante el toolkit CoreNLP en Java (API Java y servidor de CoreNLP segun la documentacion oficial del proyecto). No se detallan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de paquete.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La busqueda web proporcionada no devolvio modelos comparables: los resultados fueron enlaces a Google Translate, sin relacion con toolkits de anotacion linguistica. No se dispone de datos de benchmarks ni de especificaciones de alternativas dentro de la informacion facilitada, por lo que la comparativa cuantitativa no es posible.

| Modelo | Tipo | Idioma | Licencia | Parametros / contexto | Datos de rendimiento |
|---|---|---|---|---|---|
| stanfordnlp/corenlp-french | Paquete de modelos de pipeline NLP (Java) | frances | GPL-2.0 | no disponible | no disponible |
| Alternativas comparables (por ejemplo, toolkits de anotacion linguistica para frances) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar, resumir, traducir ni mantener conversaciones. Usarlo para esas tareas es un error de planteamiento.
- Ausencia total de evaluacion publicada: no hay metricas de precision, recall ni F1 en la informacion disponible, lo que impide estimar su calidad real en produccion.
- Procedencia de los datos de entrenamiento desconocida: al no documentarse el corpus, no se pueden evaluar sesgos sistematicos ni la representatividad dialectal del frances cubierto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de errores de anotacion (entidades mal clasificadas, dependencias incorrectas) sin cota conocida.
- Cobertura limitada a un unico idioma (`fr`); no sirve para textos multilingues sin anadir modelos de otros idiomas.
- Licencia GPL-2.0: es una licencia copyleft. Su integracion en productos propietarios o distribuidos puede obligar a liberar el codigo derivado; conviene revisar el cumplimiento legal antes de un uso comercial.
- Informacion del repositorio muy escasa: la model card se genero automaticamente y no documenta que componentes concretos incluye el paquete frances ni su version.
- Senales de adopcion minimas: 0 descargas y 4 likes registrados, sin evidencia publica de uso en produccion ni de mantenimiento activo mas alla de la fecha de actualizacion.
- No se documentan limites de longitud de entrada, consumo de memoria ni comportamiento con documentos muy largos.
- La fecha de ultima actualizacion (2026-09-27) es posterior a la de creacion (2022-03-02), pero no se acompana de changelog ni notas de version que expliquen los cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/corenlp-french
- Web oficial de CoreNLP: https://stanfordnlp.github.io/CoreNLP
- Repositorio GitHub de CoreNLP: https://github.com/stanfordnlp/CoreNLP
- Repositorio `stanfordnlp/huggingface-models` (referenciado en la model card como origen del script `hugging_corenlp.py`): no disponible como enlace directo en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
