# webAI-Official/granite-4.2-8B

## Resumen

Granite 4.2 8B es un modelo de lenguaje de razonamiento de tamano medio (8.000 millones de parametros) desarrollado por IBM dentro de la familia Granite 4.2, que se completa con variantes densas de 3B y 30B. Su rasgo diferencial es el razonamiento nativo: incorpora una cadena de pensamiento integrada entre las etiquetas `<think>...</think>`, de modo que el modelo razona antes de responder sin necesidad de prompts especiales. Ademas, permite alternar entre modos de pensamiento (completo por defecto, sin pensamiento y de bajo esfuerzo) para ajustar la profundidad de razonamiento frente a la latencia en cada consulta.

El modelo esta pensado para flujos de trabajo empresariales y de agentes, donde las tareas suelen ser ambiguas y requieren varios pasos: seguir instrucciones complejas, recuperar informacion, elegir herramientas, actuar en el orden correcto y verificar el resultado. En esta linea, Granite 4.2 8B soporta tool calling con razonamiento integrado, es decir, decide que herramienta invocar y por que antes de hacer la llamada, usando el esquema de definicion de funciones de OpenAI.

El repositorio analizado aqui (`webAI-Official/granite-4.2-8B`) es una publicacion de terceros que replica el modelo de IBM, con licencia Apache 2.0, sin descargas ni valoraciones registradas y con una model card practicamente vacia (solo el campo de licencia). La informacion tecnica disponible sobre arquitectura, capacidades y modos de razonamiento procede de la documentacion oficial de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con razonamiento nativo (cadena de pensamiento integrada) |
| Parametros totales | 8.000 millones (aproximado; familia densa de 3B, 8B y 30B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la informacion proporcionada |

## Arquitectura y entrenamiento

Granite 4.2 8B pertenece a la familia Granite 4.2 de IBM, formada por modelos densos de razonamiento en tres tamanos (3B, 8B y 30B). Se trata de un transformer denso de tipo decoder-only con razonamiento incorporado: el modelo genera de forma nativa una cadena de pensamiento encerrada en `<think>...</think>` antes de producir la respuesta final, lo que mejora el rendimiento en tareas intensivas en razonamiento. La familia incorpora modos de pensamiento flexibles (pensamiento completo por defecto, sin pensamiento y de bajo esfuerzo) que permiten equilibrar profundidad y latencia por consulta, asi como tool calling aumentado con razonamiento.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se especifican innovaciones de atencion (atencion lineal, decodificacion especulativa ni variantes hibridas). Cualquier dato de este tipo debe considerarse no disponible.

## Capacidades

- Generacion de texto y razonamiento: cadena de pensamiento integrada mediante `<think>...</think>` para tareas que requieren varios pasos.
- Modos de razonamiento configurables: pensamiento completo (por defecto), sin pensamiento y de bajo esfuerzo, seleccionables por consulta.
- Tool calling / function calling: compatible con el esquema de definicion de funciones de OpenAI.
- Tool calling aumentado con razonamiento: el modelo justifica internamente que herramienta invocar y por que antes de la llamada.
- Flujos de agentes: soporta tareas encadenadas de varios pasos (seguir instrucciones, recuperar informacion, elegir herramientas, actuar y verificar).
- Seguimiento de instrucciones complejas orientado a entornos empresariales.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes empresariales de varios pasos: el modelo puede descomponer una tarea ambigua en pasos, elegir la herramienta adecuada, ejecutarla y verificar el resultado, apoyandose en su razonamiento nativo y en el tool calling aumentado con razonamiento.
- Automatizacion de atencion al cliente con herramientas: integrado con APIs de CRM o sistemas de ticketing, el modelo decide cuando consultar el historial del cliente y cuando responder directamente, razonando antes de cada accion.
- Orquestacion de pipelines de datos: encadenar llamadas a bases de datos, servicios de transformacion y validaciones, usando el modo de bajo esfuerzo cuando la latencia importa y el modo completo cuando la tarea es critica.
- Asistentes de analisis y soporte a la decision: tareas que exigen seguir instrucciones largas y razonar sobre informacion recuperada, aprovechando los modos de pensamiento para ajustar coste y profundidad.
- Analisis de documentos y extraccion estructurada: combinado con herramientas de recuperacion, el modelo puede localizar datos en el material aportado y producir salidas estructuradas tras razonar el mapeo.
- Generacion y revision de codigo asistida por herramientas: el soporte de function calling permite integrarlo en entornos de desarrollo donde el modelo consulta documentacion, ejecuta comprobaciones o invoca servicios.
- Moderacion y verificacion de flujos automatizados: el modo de razonamiento completo resulta adecuado para comprobar el resultado de una secuencia de acciones antes de dar por valida la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo de 8.000 millones de parametros: en torno a 16 GB en FP16, unos 8-10 GB en cuantizacion de 8 bits y aproximadamente 5-6 GB en cuantizacion de 4 bits. Son estimaciones genericas por tamano, no cifras oficiales del modelo.
- GPU de datacenter recomendadas: A100, H100 o equivalentes para despliegue en FP16 con margen para contexto largo y concurrencia.
- GPU de consumo: un modelo de 8B en cuantizacion de 4 bits cabe en tarjetas con 8 GB de VRAM o mas (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090). En FP16 requeriria al menos 16-24 GB, es decir, gamas como RTX 4090 o A100.
- Opciones de despliegue: no se especifican en la informacion proporcionada; los formatos de pesos tampoco estan indicados, por lo que la compatibilidad con vLLM, llama.cpp, Ollama o TGI no puede confirmarse.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento nativo | Tool calling | Licencia |
|---|---|---|---|---|---|
| Granite 4.2 8B (este modelo) | 8B (denso) | no disponible | Si (`<think>`) | Si, con razonamiento | Apache 2.0 |
| Granite 4.2 3B | 3B (denso) | no disponible | Si (`<think>`) | Si, con razonamiento | Apache 2.0 |
| Granite 4.2 30B | 30B (denso) | no disponible | Si (`<think>`) | Si, con razonamiento | Apache 2.0 |

No se dispone de datos de rendimiento (benchmarks) que permitan comparar esta variante con alternativas de otros fabricantes del mismo rango de tamano, por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- El repositorio analizado es una publicacion de terceros (`webAI-Official`), no la oficial de IBM; conviene verificar la procedencia e integridad de los pesos antes de usarlos en produccion y contrastar con el repositorio oficial `ibm-granite/granite-4.2-8b`.
- La model card del repositorio esta practicamente vacia (solo la licencia), por lo que no documenta datos de entrenamiento, idiomas, contexto ni cuantizaciones.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas de recuperacion o en llamadas a herramientas mal definidas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; deben evaluarse antes de un despliegue sensible.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- El razonamiento explicito (`<think>`) incrementa el numero de tokens generados y, por tanto, la latencia; conviene usar los modos sin pensamiento o de bajo esfuerzo cuando no se requiera razonamiento profundo.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una copia de terceros es recomendable confirmar la licencia y las condiciones en la fuente original de IBM.
- No hay datos publicados de benchmarks, cuantizaciones ni formatos de pesos en la informacion disponible, lo que limita la planificacion de un despliegue en produccion.

## Enlaces

- Repositorio analizado: https://huggingface.co/webAI-Official/granite-4.2-8B
- Modelo oficial de IBM: https://huggingface.co/ibm-granite/granite-4.2-8b
- README oficial: https://huggingface.co/ibm-granite/granite-4.2-8b/blob/main/README.md
- Documentacion de IBM sobre Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Blog de IBM Research sobre Granite 4.2: https://research.ibm.com/blog/introducing-granite-4-2
- Pagina de la familia Granite: https://www.ibm.com/granite
