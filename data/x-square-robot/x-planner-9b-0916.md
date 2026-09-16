# x-square-robot/X-Planner-9B-0916

## Resumen

X-Planner-9B-0916 es un planificador de tareas de robotica de manipulacion desarrollado por X Square Robot (organizacion `x-square-robot` en HuggingFace). Su funcion no es generar texto libre ni ejecutar acciones de bajo nivel, sino transformar una instruccion de tarea, observaciones visuales sincronizadas y, opcionalmente, el historial de ejecucion, en estados de planificacion estructurados que consume una politica de robot posterior. Esta orientado a tareas de horizonte largo, donde la descomposicion en subobjetivos y la replanificacion ante fallos son criticos.

Tecnicamente se apoya en la arquitectura `Qwen3_5ForConditionalGeneration` (Qwen3.5 9B), un transformer multimodal de tipo image-text-to-text, con 9.409.813.744 parametros almacenados en BF16. El checkpoint se distribuye en safetensors, fragmentado en shards de 5 GB y con 760 tensores preservados bit a bit, y se carga con Transformers 5.2.0 sin codigo remoto personalizado. Ocupa aproximadamente 18,82 GB en disco en su precision nativa.

La relevancia de esta publicacion (16 de septiembre de 2026) es doble: por un lado libera pesos de inferencia bajo licencia Apache 2.0, coherente con el modelo base de Qwen; por otro, se acompana de un benchmark publico de 1.500 episodios y 3.490 videos con metadatos de planificacion a nivel de episodio. La model card advierte explicitamente de que este release no incluye una evaluacion nueva del checkpoint, por lo que cualquier cifra procedente del informe tecnico debe conservar su procedencia original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal image-text-to-text, arquitectura Qwen3.5 9B) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica: la model card no documenta una variante MoE para este checkpoint |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el release distribuye únicamente pesos en BF16) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 (pesos); el código de X-Planner es MIT |
| Formato de pesos | safetensors, BF16, 760 tensores, fragmentado en shards de 5 GB |
| Precisión de pesos | BF16 |
| Versión de Transformers registrada | 5.2.0 |
| Tamaño del repositorio | 18,8 GB |
| Tarea declarada (pipeline) | image-text-to-text |
| Fecha de publicación | 16 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que acepta entradas de texto e imagen y genera salidas de texto. El repositorio incluye los pesos, la configuración de modelo y generación, el tokenizer, la plantilla de chat y la configuración del procesador de imagen y vídeo. La carga documentada usa `AutoModelForImageTextToText` con PyTorch, `dtype=torch.bfloat16`, `device_map="auto"` y `attn_implementation="sdpa"`, además de activar la caché de generación tanto en el modelo como en su configuración de texto. No se requiere código remoto personalizado.

La ficha del autor no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u optimización por preferencias. Tampoco describe innovaciones de decodificación (decodificación especulativa, atención lineal u otras). Lo único verificable sobre el proceso es la procedencia: los pesos derivan de la arquitectura Qwen3.5-9B, y el release se limita a material de inferencia, excluyendo logs de entrenamiento, estado del optimizador y rutas específicas de la máquina de entrenamiento. El fichero `release_manifest.json` recoge hashes de fichero y el SHA-256 de los pesos originales sin fragmentar, con fines de procedencia.

La capa especifica de X-Planner reside en el runtime de estados de evento, alojado en el repositorio de código: allí se definen el prompt específico de tarea, la preparación de imagen, el formato del historial y el parser de salida. Es decir, el modelo aporta la capacidad de generación y el repositorio aporta el contrato de datos y la estructura del plan.

## Capacidades

- Generación multimodal image-text-to-text: procesa instrucciones de tarea junto con observaciones visuales sincronizadas.
- Planificación de tareas estructurada: predice estados de planificación que consume una política de robot posterior, en lugar de acciones motoras directas.
- Horizonte largo: está diseñado explícitamente para manipulación robótica de horizonte largo, con descomposición en subobjetivos.
- Uso de historial de ejecución opcional: la entrada admite historial de ejecución, lo que habilita replanificación condicionada al estado real del entorno.
- Soporte de vídeo a nivel de procesador: el repositorio incluye configuración de procesador de imagen y vídeo, y el benchmark asociado contiene vídeos multívista.
- Naturaleza conversacional: el tag `conversational` está declarado en la ficha del modelo.
- Multilingüe limitado: inglés y chino.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica compatibilidad declarada con los endpoints de HuggingFace.

No hay información disponible sobre soporte de tool calling o function calling, modo de razonamiento explícito (thinking mode), capacidades de audio o ejecución de agentes multi-paso fuera del bucle de planificación descrito.

## Casos de uso

- Planificación de manipulación de horizonte largo en entornos de laboratorio: el modelo recibe la instrucción en lenguaje natural y las observaciones visuales sincronizadas, y devuelve una secuencia de estados de planificación que una política de bajo nivel ejecuta paso a paso. Es adecuado porque su salida está estructurada para ese consumidor, no en texto libre.
- Replanificación ante fallos de ejecución: al aceptar historial de ejecución opcional, puede regenerar el plan cuando una acción previa no alcanza el subobjetivo previsto, en lugar de repetir la secuencia original.
- Capa de alto nivel en un stack de robótica existente: se inserta entre la interfaz de instrucción (voz o texto) y el controlador de bajo nivel, traduciendo intenciones en subobjetivos verificables.
- Evaluación y regresión de políticas: sirve como componente de referencia en un pipeline de evaluación que use el benchmark público de 1.500 episodios y 3.490 vídeos con metadatos de planificación a nivel de episodio.
- Generación de datos de planificación para entrenamiento: los estados de planificación producidos sobre nuevas grabaciones pueden usarse como supervisión auxiliar para políticas downstream, siempre que se revisen antes de incorporarlos.
- Investigación en embodied AI con reproducibilidad: el release documenta procedencia mediante hashes y recomienda descargar con `--revision <commit>`, lo que permite fijar una revisión concreta en experimentos comparables.
- Supervisión de operadores en teleoperación: los subobjetivos generados pueden mostrarse como guía al operador humano durante tareas largas.
- Automatización en entornos controlados (almacén o laboratorio): planificación de secuencias de recogida y colocación donde las condiciones del entorno están acotadas y las observaciones son estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que no reporta una evaluación nueva de X-Planner-9B-0916 y que los resultados del informe técnico o de otras revisiones del checkpoint deben conservar su procedencia original de modelo y evaluación.

El benchmark publicado es un release de datos y medios, no una tabla de resultados: contiene 1.500 episodios, 3.490 vídeos y metadatos de planificación a nivel de episodio, con vídeos multívista reproducibles en la vista previa del dataset. Las anotaciones temporales completas de puntuación y el protocolo fijo de evaluación de extremo a extremo se distribuyen por separado de este release de medios.

| Métrica | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación específica de planificación | no disponible (no incluida en este release) |

## Requisitos de hardware

- Pesos en BF16: los pesos ocupan aproximadamente 18,82 GB, según la propia model card.
- Memoria total de inferencia: además de los pesos, hay que reservar memoria para activaciones, tokens visuales y caché de generación; el consumo depende de las entradas y de la longitud de generación. Como referencia aritmética, sobre una GPU de 24 GB quedan menos de 6 GB de margen para todo lo demás.
- GPU recomendadas: A100 (40 GB o 80 GB) y H100 (80 GB) ofrecen margen holgado para BF16 con entradas visuales y generación larga. La model card no enumera GPU concretas.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16, pero con margen ajustado; longitudes de generación o resoluciones de imagen altas pueden provocar errores de memoria.
- Despliegue documentado: Transformers con soporte de Qwen3.5, PyTorch y Accelerate, con `device_map="auto"` y atención SDPA. El tag `endpoints_compatible` sugiere uso con endpoints de HuggingFace.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no documentados en la ficha del modelo. No se distribuyen pesos GGUF en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| X-Planner-9B-0916 | 9.409.813.744 | no disponible | Apache 2.0 (pesos), MIT (código) | HuggingFace, 0 descargas y 0 likes | Sin evaluación publicada en este release |
| Qwen3.5-9B (modelo base de la arquitectura) | 9B, según la referencia de la model card | no disponible | Apache 2.0, según la model card de X-Planner | HuggingFace | No se dispone de comparación de rendimiento con X-Planner en la información proporcionada |
| Otros planificadores para robótica embodied | no disponible | no disponible | no disponible | no disponible | La model card no incluye ninguna comparación con sistemas alternativos |

No hay datos de rendimiento comparativo disponibles. Cualquier comparación cuantitativa con planificadores alternativos requeriría ejecutar el protocolo de evaluación de extremo a extremo sobre el mismo benchmark, y ese protocolo no forma parte de este release.

## Limitaciones y advertencias

- Ausencia de evaluación publicada: la model card afirma explícitamente que no reporta una evaluación nueva de este checkpoint. No hay cifras verificables de rendimiento para esta revisión.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado. En un planificador que produce estados estructurados, una alucinación se traduce en subobjetivos imposibles o inconsistentes con el estado real del entorno; se recomienda validación downstream antes de ejecutar.
- Idiomas: soporte declarado únicamente de inglés y chino. No hay soporte documentado de castellano.
- Dependencia del runtime: la inferencia de planificación requiere el runtime de estados de evento del repositorio de código, con un backend de datos compatible y un snapshot de eventos preparado. La disponibilidad pública de ese backend está sujeta a lo que indique la documentación del repositorio. El manifiesto de vídeo crudo del benchmark no es un snapshot de eventos válido.
- Licencia: los pesos son Apache 2.0 y el código MIT, pero los datos y medios del benchmark conservan sus propios términos de origen, descritos en la ficha del dataset. Verificar antes de uso comercial de los datos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros.
- Contexto sin especificar: la longitud máxima de contexto no está documentada, lo que impide planificar con precisión la memoria necesaria para secuencias largas o muchas observaciones visuales.
- Sin cuantizaciones oficiales: no se distribuyen pesos GGUF ni AWQ/GPTQ en el repositorio, lo que limita el despliegue en hardware de gama baja.
- Fechas del release: el checkpoint está fechado el 16 de septiembre de 2026; conviene fijar la revisión mediante `--revision <commit>` para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/x-square-robot/X-Planner-9B-0916
- Código e interfaz de inferencia: https://github.com/X-Square-Robot/Xplanner
- Runtime de estados de evento: https://github.com/X-Square-Robot/Xplanner/tree/main/x_planner/data/event_states
- Dataset de benchmark y vista previa de vídeo: https://huggingface.co/datasets/x-square-robot/xplanner-benchmark
- Página del proyecto: https://x-square-robot.github.io/Xplanner/
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen3.5-9B
- Búsqueda web: no se han encontrado enlaces relevantes sobre el modelo. Los resultados devueltos corresponden a la red social X y no guardan relación con X-Planner ni con X Square Robot.
