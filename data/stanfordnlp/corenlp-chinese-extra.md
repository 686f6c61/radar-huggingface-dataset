# stanfordnlp/corenlp-chinese-extra

## Resumen

`stanfordnlp/corenlp-chinese-extra` es un paquete de modelos de CoreNLP para chino publicado por el Stanford NLP Group en HuggingFace. No es un modelo generativo ni un transformer entrenado de forma monolítica: CoreNLP es una suite de herramientas de PLN escrita en Java que produce anotaciones lingüísticas sobre texto (segmentación de palabras y frases, etiquetado gramatical, entidades nombradas, valores numéricos y temporales, análisis de dependencias y constituyentes, correferencia, análisis de sentimiento, atribución de citas y relaciones). Este repositorio concreto contiene la variante "extra" del paquete de modelos chinos, es decir, componentes adicionales que se suman a los modelos base del mismo idioma.

El repositorio ocupa 0,6 GB y declara el idioma chino (zh) con licencia GPL-2.0. La model card es automática, generada por el script `hugging_corenlp.py` del repositorio `stanfordnlp/huggingface-models`, y no documenta ni la composición interna del paquete ni los datos de entrenamiento, los números de parámetros o métricas de evaluación.

Su relevancia práctica es la de un componente de infraestructura: para equipos que ya operan pipelines de PLN en Java sobre corpus en chino y necesitan anotaciones lingüísticas completas (no generación de texto), este repositorio ofrece los ficheros de modelo adicionales en un formato directamente consumible por CoreNLP. El contraste con la ausencia de benchmarks publicados y con una licencia copyleft fuerte son los dos factores que condicionan su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite de componentes de PLN en Java con modulos basados en reglas, aprendizaje automatico probabilistico y aprendizaje profundo (segun la descripcion de CoreNLP); no es un unico transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (CoreNLP procesa documentos completos dividiendolos en frases; no se documenta un limite de contexto) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | chino (zh) |
| Licencia | GPL-2.0 |
| Formato de pesos | no disponible; el repositorio contiene ficheros de modelo de CoreNLP (0,6 GB), no safetensors ni GGUF |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

El repositorio no describe ninguna arquitectura de red neuronal concreta. La documentacion de CoreNLP indica que la suite combina componentes basados en reglas, aprendizaje automatico probabilistico y aprendizaje profundo, y que el motor es compatible con modelos de distintos idiomas, distribuidos en paquetes separados (entre ellos chino y espanol). Los ficheros de este repositorio son los modelos del paquete "extra" para chino, que se cargan desde la propia libreria Java de CoreNLP.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO ni sobre innovaciones tecnicas especificas de este paquete. Tampoco se documenta que componentes exactos incluye la variante "extra" frente a la variante base: la model card se limita a enlazar la web y el repositorio de CoreNLP. Cualquier afirmacion sobre el contenido interno de los ficheros seria una suposicion no verificada con la informacion disponible.

## Capacidades

Las capacidades que se enumeran a continuacion corresponden a las que la model card atribuye a CoreNLP como suite; la disponibilidad efectiva de cada anotador para chino y, en particular, en el paquete "extra", no esta documentada en la informacion disponible.

- Segmentacion en tokens y deteccion de limites de frase.
- Etiquetado de categorias gramaticales (POS tagging).
- Reconocimiento de entidades nombradas (NER).
- Normalizacion de valores numericos y temporales.
- Analisis sintactico de dependencias y de constituyentes.
- Resolucion de correferencia.
- Analisis de sentimiento.
- Atribucion de citas (quote attribution).
- Extraccion de relaciones.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales.
- No se documenta soporte de tool calling, function calling ni comportamiento agente.
- Multilingue: no; el paquete cubre unicamente chino.

## Casos de uso

- Preprocesado de corpus en chino para motores de busqueda y sistemas de recuperacion de informacion: la segmentacion de palabras y el etiquetado POS permiten indexar terminos en lugar de caracteres, lo que mejora la precision en chino, un idioma sin separadores de palabra explicitos.
- Extraccion de entidades en documentos empresariales chinos (contratos, informes, correspondencia): el componente NER y la normalizacion de valores numericos y temporales permiten poblar bases de datos estructuradas a partir de texto libre.
- Analisis de sentimiento sobre resenas y redes sociales en chino: util para monitorizacion de marca y analisis de opinion, siempre que se valide la calidad del anotador sobre el dominio concreto.
- Construccion de grafos de conocimiento: la combinacion de NER, relaciones y correferencia facilita resolver menciones de una misma entidad a lo largo de un documento antes de volcarlas a un grafo.
- Investigacion linguistica y anotacion de corpus academicos: los analisis de dependencias y constituyentes sirven como anotacion de referencia para estudios sintacticos sobre chino.
- Integracion en aplicaciones Java empresariales existentes: al ser una libreria Java con modelos distribuidos como ficheros, se puede desplegar como servidor HTTP de CoreNLP dentro de la misma infraestructura JVM, sin introducir un stack de inferencia de GPU.
- Pipeline de resumen extractivo o atribucion de declaraciones en prensa: la atribucion de citas permite vincular afirmaciones con su emisor dentro de un articulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; CoreNLP se ejecuta en CPU y no se documenta soporte de aceleracion por GPU para estos modelos.
- GPU recomendadas: no aplica / no disponible.
- Ejecucion en GPU de consumo: no aplica; el requisito es memoria RAM de la JVM, no VRAM. El tamano del repositorio es de 0,6 GB, pero el consumo de heap depende de los anotadores cargados, dato no disponible en la informacion proporcionada.
- Opciones de despliegue: servidor de CoreNLP (Java) y clientes que lo consumen, como el cliente CoreNLP de Stanza. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en safetensors ni GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada solo cubre el ecosistema de CoreNLP, por lo que la comparacion se limita a lo que se puede verificar.

| Modelo | Tipo | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| stanfordnlp/corenlp-chinese-extra | Paquete de modelos CoreNLP (Java), componentes de PLN | zh | GPL-2.0 | Ficheros de modelo CoreNLP (0,6 GB) | HuggingFace |
| stanfordnlp/corenlp-chinese | Paquete base de modelos CoreNLP para chino | zh | no disponible en la informacion proporcionada | Ficheros de modelo CoreNLP (existe la revision v4.5.9) | HuggingFace |
| stanfordnlp/CoreNLP (repositorio principal) | Suite Java de herramientas de PLN | multilingue con paquetes por idioma | no disponible en la informacion proporcionada | Codigo fuente Java + modelos descargables | GitHub |
| Alternativas de PLN en chino (Stanza, HanLP, jieba, LTP) | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparables en la busqueda web realizada |

## Limitaciones y advertencias

- Licencia GPL-2.0: es una licencia copyleft fuerte. Integrar estos ficheros de modelo en un producto propietario puede obligar a liberar el codigo derivado; conviene revision legal antes de cualquier uso comercial.
- La model card es autogenerada y no documenta el contenido exacto del paquete "extra" ni su diferencia respecto al paquete base, lo que dificulta evaluar que anotadores esta recibiendo realmente el usuario.
- No hay benchmarks publicados en la informacion disponible, por lo que no se puede estimar la calidad de las anotaciones en chino ni compararla con alternativas.
- El repositorio tiene 0 descargas y 0 likes, senal de que no ha sido validado por la comunidad.
- Cubre unicamente chino; no sirve para otros idiomas.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni flujos de agente.
- Los componentes estadisticos y de aprendizaje profundo de PLN pueden degradarse en dominios alejados de sus datos de entrenamiento (texto informal, jerga, dominios tecnicos) y no hay informacion sobre dichos datos de entrenamiento.
- La resolucion de correferencia y la extraccion de relaciones son tareas propensas a errores que se propagan aguas abajo en pipelines de extraccion de informacion.
- No se dispone de informacion sobre sesgos especificos, comportamiento multilingue mixto (texto chino con latinismos) ni sobre la robustez frente a texto ruidoso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/corenlp-chinese-extra
- Paquete base para chino: https://huggingface.co/stanfordnlp/corenlp-chinese
- Revision v4.5.9 del paquete base: https://huggingface.co/stanfordnlp/corenlp-chinese/tree/v4.5.9
- Repositorio CoreNLP en GitHub: https://github.com/stanfordnlp/CoreNLP
- Web oficial de CoreNLP: https://stanfordnlp.github.io/CoreNLP/
- Pagina del Stanford NLP Group sobre software CoreNLP: http://www-nlp.stanford.edu/software/corenlp.html
