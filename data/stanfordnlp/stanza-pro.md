# stanfordnlp/stanza-pro

## Resumen
Stanza-pro es el paquete de modelos linguisticos que la Universidad de Stanford (Stanford NLP Group) publica para el occitano antiguo (codigo ISO 639-2 `pro`), tambien conocido como provenzal medieval, la lengua de los trovadores. Forma parte de Stanza, una coleccion de herramientas de analisis linguistico que cubre 70 idiomas y que va del texto bruto al analisis sintactico y al reconocimiento de entidades. El repositorio de HuggingFace se distribuye como envoltorio de la libreria `stanza`, con la etiqueta de pipeline `token-classification` y licencia Apache-2.0.

El interes de esta ficha es doble. Por un lado, cubre una lengua historica de recursos muy limitados, donde las herramientas genericas de PLN no funcionan: el occitano antiguo tiene grafia no normalizada, variacion dialectal amplia y una tradicion textual (cancioneros, textos administrativos, literatura devocional) que exige lematizacion y analisis morfosintactico especificos. Por otro, al estar integrado en Stanza, el modelo se apoya en los treebanks de Universal Dependencies v2.8, lo que lo hace directamente usable en proyectos de humanidades digitales sin necesidad de entrenar modelos propios.

El repositorio es pequeno (0,2 GB) y su model card es generada automaticamente por el script `hugging_stanza.py` del repositorio `stanfordnlp/huggingface-models`, por lo que no documenta arquitectura, datos de entrenamiento ni metricas. Ademas, a fecha de la informacion disponible acumula 0 descargas y 0 likes, lo que indica una validacion comunitaria practicamente nula frente a los paquetes de lenguas mayoritarias como `stanza-en`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Stanza procesa el texto por oraciones, no se documenta una ventana fija) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas |
| Idiomas soportados | pro (occitano antiguo / provenzal) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB consumido a traves de la libreria `stanza`; no se detalla si son safetensors, GGUF u otro) |

Datos adicionales del repositorio: autor `stanfordnlp`, libreria `stanza`, pipeline declarado `token-classification`, etiqueta de region `us`, creado y actualizado el 29 de septiembre de 2026.

## Arquitectura y entrenamiento
La model card no aporta informacion sobre la arquitectura concreta utilizada para este paquete: no indica si se trata de un etiquetador neuronal, de un parser de dependencias de transiciones o de una combinacion de modulos, ni detalla el numero de capas, el tipo de embeddings o el mecanismo de atencion. Tampoco se documentan los hiperparametros, el presupuesto de computo ni el proceso de entrenamiento.

Lo unico que se puede afirmar con la informacion disponible es la procedencia de los datos: segun el repositorio GitHub de Stanza, los modelos se entrenan sobre los treebanks de Universal Dependencies v2.8, y los modelos de NER solo se ofrecen para un subconjunto de lenguas ampliamente habladas. No se especifica si el occitano antiguo dispone de modulo NER, ni cuantos tokens componen el corpus de entrenamiento, ni si hubo ajuste fino con RLHF o DPO (poco probable en un modelo de anotacion linguistica, pero no confirmado en la documentacion facilitada).

## Capacidades
- Analisis linguistico de texto en occitano antiguo dentro del ecosistema Stanza: tokenizacion, segmentacion de oraciones y anotacion linguistica por token, segun el pipeline declarado (`token-classification`).
- Anotacion morfosintactica y analisis sintactico siempre que el paquete herede los modulos habituales de Stanza (tokenize, pos, lemma, depparse); la model card no confirma que modulos incluye exactamente este repositorio.
- Etiquetado de dependencias compatible con el esquema de Universal Dependencies v2.8, lo que facilita la exportacion de anotaciones a formatos CoNLL-U.
- Lematizacion potencial de formas historicas, util para normalizar variacion grafica medieval, aunque no se documenta explicitamente en la model card.
- Uso mediante Python a traves de la libreria `stanza`, con carga de modelos por idioma y ejecucion sobre CPU o GPU.
- Reconocimiento de entidades: no disponible para esta lengua; la documentacion oficial indica que los modelos NER solo se publican para unas pocas lenguas ampliamente habladas.
- Multilingue: no. El paquete esta especializado en `pro` (occitano antiguo).
- Tool calling, function calling, modo de razonamiento explicito, vision o audio: no disponible / no aplica; no es un modelo generativo de proposito general.

## Casos de uso
- Anotacion de corpus de trovadores: el modelo permite procesar cancioneros y poemas occitanos medievales para obtener capas de lematizacion y dependencias, algo imprescindible en estudios de metrica y sintaxis historica donde las herramientas genericas fallan por la grafia no normalizada.
- Humanidades digitales y edicion critica: integrado en Stanza, se puede incorporar a un pipeline que alinee variantes textuales de distintos manuscritos y genere anotaciones CoNLL-U comparables entre testimonios.
- Lexicografia historica: la lematizacion y el etiquetado de categoria gramatical permiten construir indices de formas y lemas de un corpus occitano, base para diccionarios y concordancias.
- Formacion de datos para traduccion automatica historica: las anotaciones generadas pueden servir como datos de partida o de evaluacion para sistemas de traduccion entre occitano antiguo y castellano o frances moderno.
- Investigacion en linguistica diacronica: el etiquetado de dependencias sobre textos de distintos siglos permite comparar construcciones sintacticas y estudiar cambios gramaticales cuantitativamente.
- Analisis documental de archivos y cartularios: procesamiento de textos administrativos y notariales occitanos para extraer estructura oracional y facilitar la catalogacion y busqueda por patrones sintacticos (el reconocimiento de entidades nombradas queda fuera si el paquete no lo incluye).
- Docencia universitaria de filologia occitana: uso como herramienta de apoyo para que el alumnado visualice analisis sintacticos, con la posibilidad de exportar a herramientas de anotacion como brat.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card de `stanfordnlp/stanza-pro` es generada automaticamente y no incluye metricas. La pagina oficial de modelos de Stanza recoge tablas de rendimiento por idioma, pero los valores concretos para occitano antiguo no aparecen en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, el repositorio ocupa 0,2 GB, por lo que el conjunto de pesos es de escala pequena y no requiere aceleradores de gama alta.
- GPU recomendadas: no disponibles en la documentacion. Este tipo de modelos de anotacion linguistica suele ejecutarse correctamente en CPU y, si se usa GPU, en tarjetas consumer (por ejemplo, gama GTX 1650 o RTX 3060); no se confirma con datos del autor.
- Cabe en GPU consumer: si, es esperable dado el tamano del repositorio (0,2 GB), aunque no hay una tabla oficial de requisitos.
- Opciones de despliegue: libreria `stanza` (Python, sobre PyTorch) y su interfaz de linea de comandos; es el unico canal documentado. No se publican pesos en GGUF ni checkpoints compatibles con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Libreria | Tarea principal | Licencia | Tamano del repo | Parametros |
|---|---|---|---|---|---|---|
| stanfordnlp/stanza-pro | Occitano antiguo (`pro`) | stanza | token-classification | Apache-2.0 | 0,2 GB | no disponible |
| stanfordnlp/stanza-en | Ingles | stanza | token-classification | Apache-2.0 (segun el patron del proyecto) | no disponible | no disponible |
| Conjunto de paquetes Stanza | 70 idiomas humanos | stanza | analisis linguistico completo | Apache-2.0 | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos paquetes ni de alternativas externas especializadas en occitano antiguo dentro de la informacion proporcionada. La comparacion se limita, por tanto, a idioma, libreria, tarea, licencia y tamano del repositorio.

## Limitaciones y advertencias
- Documentacion practicamente inexistente: la model card se genera de forma automatica e identifica el idioma y la licencia, pero no describe arquitectura, datos de entrenamiento, modulos incluidos ni metricas de evaluacion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la informacion, lo que impide contrastar su comportamiento real en produccion o investigacion.
- Lengua de muy bajos recursos: el occitano antiguo tiene poca masa textual anotada y grafia no normalizada, lo que puede provocar errores de lematizacion y de asignacion de etiquetas en formas poco frecuentes o con variacion ortografica.
- Cobertura de NER limitada o inexistente: la documentacion general de Stanza indica que los modelos de entidades solo se entrenan para unas pocas lenguas ampliamente habladas.
- Sin cuantizaciones ni formatos de despliegue alternativos: no hay GGUF, ONNX ni variantes optimizadas publicadas, lo que limita la integracion en servidores de inferencia convencionales.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de anotaciones incorrectas presentadas con alta confianza, especialmente en estructuras sintacticas poeticas o arcaicas.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el fichero NOTICE cuando corresponda; no se identifican restricciones adicionales en la informacion disponible.
- Procesamiento por oraciones: los modelos de Stanza no estan disenados para mantener contexto largo entre documentos, por lo que no debe esperarse coherencia de anotacion a nivel de corpus completo sin postprocesado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/stanza-pro
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Web oficial de Stanza: https://stanfordnlp.github.io/stanza
- Pagina de modelos de Stanza: https://stanfordnlp.github.io/stanza/models.html
- Pagina de descarga de modelos: https://stanfordnlp.github.io/stanza/download_models.html
- Sitio de demostracion de Stanza: https://stanza.stanford.edu/
- Modelo hermano para ingles: https://huggingface.co/stanfordnlp/stanza-en
- Repositorio de generacion de model cards: https://github.com/stanfordnlp/huggingface-models
