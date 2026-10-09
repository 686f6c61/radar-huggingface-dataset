# xinyuzhou/ClinicalJev-9B-v0.1-preview

## Resumen

ClinicalJev-9B-v0.1-preview es un modelo de 9.000 millones de parametros orientado a clasificacion clinica local, publicado por el usuario xinyuzhou en HuggingFace. No es un modelo generativo al uso: dado un texto de estado ("state"), una pregunta en el campo `instructions` y un conjunto de candidatos o una rubrica predefinida, devuelve una eleccion y una distribucion de probabilidad sobre los candidatos. La inferencia se realiza leyendo los logits del siguiente token en una posicion concreta y normalizando unicamente las etiquetas permitidas, sin generar completacion de texto.

El modelo parte de un backbone Qwen y se presenta como version preview v0.1, con entrenamiento limitado a ingles y chino simplificado. Soporta tres primitivas de tarea: `Choice` (eleccion entre candidatos nombrados), `Score` (puntuacion ordinal sobre una rubrica ordenada) y `Noul` (estimacion de verdad de una proposicion si/no). Su relevancia para desarrollo e investigacion radica en que ofrece una interfaz determinista y local para tareas de anotacion y fenotipado clinico, con salidas probabilisticas calibradas por etiqueta en lugar de texto libre.

La model card declara una comparacion contra "Jev 1.13.0" sobre 13 conjuntos de datos retenidos, pero no publica los valores numericos de dicha comparacion. No se dispone de licencia declarada, ni de datos de contexto, cuantizacion o formato de pesos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen (detalle especifico no disponible) |
| Parametros totales | 9B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) y chino simplificado (zh) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se apoya en un backbone Qwen, por lo que cabe esperar una arquitectura transformer de tipo decoder. La particularidad reside en la cabeza de salida y en el procedimiento de inferencia: en lugar de decodificar tokens de forma autorregresiva, el modelo construye una plantilla de chat nativa con el contexto antes de la pregunta seleccionada y un prefijo de respuesta JSON abierto, y a continuacion lee los logits del siguiente token para normalizar solo las etiquetas permitidas. El formateador usado en los ejemplos coloca el contexto antes de la pregunta, admite entre 2 y 50 candidatos o niveles, y deshabilita el modo "thinking" del template nativo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. La model card indica que el entrenamiento se limito a ingles y chino simplificado y que no se usaron particiones de entrenamiento, validacion ni test procedentes de los benchmarks reportados. La innovacion tecnica destacable es la lectura discriminativa de logits con normalizacion restringida a las etiquetas validas, aplicada a tres primitivas de tarea (Choice, Score y Noul), lo que evita la generacion de texto y acota la salida al espacio de etiquetas definido por el usuario. Para `Score`, la salida es el nivel de rubrica ponderado por probabilidad; para `Noul`, se mapean nueve bins de valoracion a una estimacion en el intervalo [0.01, 0.99].

## Capacidades

- Clasificacion por eleccion forzada (`Choice`): selecciona un candidato entre opciones nombradas con descripcion y devuelve una distribucion de probabilidad sobre estas.
- Puntuacion ordinal (`Score`): asigna probabilidades a los niveles de una rubrica ordenada de menor a mayor y devuelve el indice esperado ponderado por probabilidad, de 0 a K−1.
- Estimacion de verdad (`Noul`): evalua una proposicion de si/no y produce una estimacion de veracidad, con criterios opcionales de `true`/`false`.
- Salida estructurada en JSON restringida a etiquetas definidas por el usuario, con normalizacion de probabilidades sobre el conjunto permitido.
- No genera texto libre ni decodificacion autorregresiva en el uso documentado.
- Soporte multilingue limitado a ingles y chino simplificado; el backbone Qwen es multilingue pero el rendimiento en otros idiomas no ha sido validado.
- Modo "thinking" deshabilitado en el template de chat nativo.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Extraccion de sintomas y hallazgos de notas clinicas: usando la primitiva `Choice` con candidatos del tipo "presente", "ausente" e "incierto", el modelo permite determinar de forma sistematica la presencia de un sintoma y obtener la probabilidad asociada, lo que facilita umbrales de confianza en pipelines de extraccion de informacion.
- Puntuacion de severidad con escalas ordinales: con la primitiva `Score` y una rubrica ordenada ("no soportado", "posible", "soportado explicitamente"), se puede clasificar la intensidad de un hallazgo y obtener tanto la distribucion como el nivel esperado para analisis estadistico.
- Verificacion de afirmaciones en resumenes clinicos: la primitiva `Noul` permite comprobar si una afirmacion se sostiene sobre el texto fuente, util para auditar resumenes automaticos y detectar contenido no respaldado.
- Fenotipado de cohortes para investigacion: aplicando preguntas estandarizadas a grandes volumenes de notas, el modelo permite etiquetar pacientes por caracteristicas clinicas de forma reproducible, apoyandose en salidas probabilisticas para filtrar casos ambiguos.
- Triaje y priorizacion de hallazgos criticos: al puntuar la evidencia de hallazgos relevantes en notas entrantes, se pueden priorizar casos para revision humana segun la probabilidad asignada a cada hallazgo.
- Preanotacion para equipos de etiquetado: el modelo puede generar etiquetas previas con su probabilidad asociada, reduciendo el trabajo manual en proyectos de anotacion clinica y permitiendo a los anotadores revisar unicamente los casos de baja confianza.
- Auditoria de calidad documental: comparando la evidencia reportada frente a las afirmaciones de un informe, se pueden detectar secciones sin soporte textual mediante preguntas `Noul` agregadas.
- Control de calidad de clasificadores previos: las distribuciones de probabilidad sobre candidatos permiten calibrar y detectar desviaciones frente a etiquetas ya existentes en un sistema en produccion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una figura de comparacion de ClinicalJev-9B-v0.1-preview frente a Jev 1.13.0 sobre 13 conjuntos de datos retenidos, e indica que no se utilizaron particiones de entrenamiento, validacion ni test de dichos benchmarks, pero no se aportan los valores concretos.

| Comparacion | Ambito | Resultado |
|---|---|---|
| ClinicalJev-9B-v0.1-preview vs Jev 1.13.0 | 13 datasets retenidos | figura sin valores numericos disponibles |

## Requisitos de hardware

- VRAM estimada de pesos: en bf16/fp16, aproximadamente 18 GB solo para los 9B de parametros; en int8, en torno a 9 GB; en int4, alrededor de 5 GB. Son estimaciones derivadas del numero de parametros, no cifras confirmadas por el autor.
- VRAM total recomendada: previsiblemente 20-24 GB en precision de 16 bits contando activaciones y overhead, 12-14 GB en int8 y 8-10 GB en int4.
- GPU recomendadas: no especificadas por el autor. Por tamano, encajan A100 40/80 GB, H100, L40S y, en el extremo consumo, RTX 4090 o RTX 3090 de 24 GB para precision de 16 bits.
- Viabilidad en GPU de consumo: plausible en RTX 4090/3090 con cuantizacion, y en tarjetas de 8-12 GB si se aplican cuantizaciones de 4 u 8 bits; no confirmado por el autor.
- Despliegue: la libreria indicada es transformers, con aceleracion opcional mediante accelerate segun el ejemplo oficial. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; dada la lectura personalizada de logits, el soporte en estos motores no esta garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| ClinicalJev-9B-v0.1-preview | 9B | no disponible | no disponible | HuggingFace | Clasificacion clinica por logits (Choice, Score, Noul) |
| Jev 1.13.0 | no disponible | no disponible | no disponible | no disponible | Referencia de comparacion citada en la model card |
| Modelos medicos generativos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos numericos ni de especificaciones de los modelos alternativos en la informacion proporcionada. La unica comparacion declarada es frente a Jev 1.13.0, sin valores publicados. La comparacion directa con modelos generativos de proposito general no es estrictamente equivalente, porque ClinicalJev opera con una cabeza discriminativa sobre etiquetas y no mediante generacion de texto.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, por lo que el uso comercial queda sin cobertura legal clara y debe consultarse con el autor antes de cualquier despliegue en produccion.
- Version preview v0.1: se trata de una publicacion preliminar, sin garantia de estabilidad de API, comportamiento ni pesos.
- Cobertura idiomatica restringida: el entrenamiento se limito a ingles y chino simplificado; el rendimiento en otros idiomas no ha sido validado pese a que el backbone Qwen sea multilingue.
- Riesgo de asignacion erronea de etiquetas: aunque la salida se restringe al conjunto de candidatos y no puede generar texto fuera de las etiquetas, si puede asignar una probabilidad elevada a una etiqueta incorrecta, especialmente con rubricas ambiguas o mal redactadas.
- Sensibilidad al orden: el propio autor advierte que el orden de los candidatos y de la rubrica importa, lo que introduce variabilidad en los resultados segun como se formulen las preguntas.
- Sin datos de sesgos publicados: no se documentan evaluaciones de sesgo demografico, de subgrupos ni de equidad clinica.
- Metadatos de inferencia: la model card marca `inference: false`, de modo que no esta habilitado para inferencia alojada en HuggingFace.
- Contexto maximo no documentado: se desconoce la longitud maxima de entrada soportada, lo que dificulta planificar el tratamiento de notas clinicas largas.
- Adopcion nula: cero descargas y cero "me gusta" en el momento de la consulta, sin validacion por parte de la comunidad.
- Fechas de publicacion en 2026 en los metadatos, lo que resulta inconsistente con el estado actual y debe tratarse con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xinyuzhou/ClinicalJev-9B-v0.1-preview
- Repositorio de referencia citado en la model card: https://github.com/xzhou-code/ClinicalJev
- Documentacion de la primitiva Choice: https://docs.typesafe.ai/primitives/choice
- Documentacion de la primitiva Score: https://docs.typesafe.ai/primitives/score
- Documentacion de la primitiva Noul: https://docs.typesafe.ai/primitives/noul
- Imagen de portada de la model card: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/hero-9B.png
- Figura de comparacion de benchmarks: https://raw.githubusercontent.com/xzhou-code/ClinicalJev/main/assets/comparison-9B.png
