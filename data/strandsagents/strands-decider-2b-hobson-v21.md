# StrandsAgents/strands-decider-2B-hobson-v21

## Resumen

strands-decider-2B-hobson-v21 es un modelo de decisión (decision model) para flujos de trabajo agénticos, publicado por StrandsAgents. No es un LLM generativo: su salida consiste en elegir entre conjuntos de opciones o puntuar elementos sobre una escala ordenada, y cada respuesta viene acompañada de una confianza calibrada. Se construye como un adaptador LoRA sobre Qwen/Qwen3.5-2B-Base más una cabeza de lectura (readout head) que puntúa las opciones de una pregunta tipada: `noul` (pregunta sí/no), `choice` (una entre N opciones) y `score` (un nivel dentro de una escala ordenada).

El modelo resuelve las decisiones repetitivas que aparecen dentro de un agente: enrutado de modelo, selección de herramienta, comprobación de argumentos, triaje, guardrails y evaluaciones automáticas, dejando las decisiones difíciles a un LLM mayor. Con 2.000 millones de parámetros en el backbone, está pensado para ejecutarse en local con latencia baja y coste reducido frente a consultar un LLM generativo para cada microdecisión.

La versión v21 parte de la receta de v19 y añade paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B en los casos en que el profesor coincide con la etiqueta gold. Es el checkpoint semilla publicado de un total de seis, elegido mediante una regla definida antes de clasificar las semillas. El repositorio contiene únicamente el adaptador y la cabeza (0,1 GB) bajo licencia Apache-2.0, con el código y la receta de entrenamiento en el repositorio de GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B-Base) con adaptador LoRA y cabeza de lectura para puntuar opciones tipadas |
| Parametros totales | 2B en el modelo base; el repositorio solo aloja el adaptador LoRA y la cabeza de lectura |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible; las evaluaciones de JevBench se sirvieron con ventana de 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el inventario de datos de entrenamiento incluye corpora multilingües, pero no hay declaración oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen/Qwen3.5-2B-Base, un transformer decoder-only de 2.000 millones de parámetros, sobre el que se entrena un adaptador LoRA (relación `adapter` respecto al modelo base) y una cabeza de lectura ligera. Esa cabeza transforma los estados del backbone en puntuaciones por opción, de modo que una misma pregunta tipada —`noul`, `choice` o `score`— produce una distribución normalizada sobre las alternativas junto con una confianza calibrada. El resultado no es texto libre: el modelo no genera, decide y puntúa.

El entrenamiento usa un inventario de 29 datasets que cubre clasificación de temas y noticias (ag_news, dbpedia_14, 20_newsgroups, yahoo_answers_topics), intención y diálogo (clinc_oos, banking77, amazon_massive_intent), sentimiento y emoción (dair-ai/emotion, sst5, yelp_review_full), NLI e inferencia (glue, contractnli vía evaluaciones, paws, boolq), QA multi-salto (hotpotqa, musique, PubMedQA), moderación y toxicidad (civil_comments, measuring-hate-speech, sms_spam), calidad y adecuación de respuestas (nvidia/HelpSteer2), así como subtareas de razonamiento (ruletaker, Boardgame-QA), detección de sarcasmo, subjetividad y formalidad. La receta de v21 añade paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B restringida a los casos en los que el profesor coincide con la etiqueta gold, una técnica que amplía la señal de entrenamiento sin introducir etiquetas ruidosas. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Decisiones tipadas con confianza calibrada: `noul` (sí/no con probabilidad), `choice` (una entre N opciones con distribución completa) y `score` (nivel en una escala ordenada con valor continuo y confianza).
- Clasificación de texto en decenas de dominios: temas, intención del usuario, emoción, sentimiento, toxicidad, spam, formalidad y subjetividad.
- Enrutado de modelo y selección de herramienta dentro de un pipeline agéntico, a partir de un estado descrito en lenguaje natural.
- Comprobación de argumentos y validación de parámetros antes de ejecutar una llamada a herramienta.
- Triaje y priorización (por ejemplo, asignación de un ticket al equipo correspondiente).
- Guardrails y moderación de contenido como clasificador de paso previo a un LLM generativo.
- Evaluaciones automáticas y juicios de adecuación de respuestas (resultados `adequacy_hs2` y `gen:adequacy`).
- Soporte de entrada de imagen mediante el extra opcional `strands-decider[vision]` (requiere transformers 5.18 o superior; disponible en `main` del repositorio de código y en versiones posteriores a la 0.1.0).
- Multilingüismo: no declarado oficialmente; el inventario de datos incluye corpora multilingües como amazon_massive_intent y language-identification.
- No soporta generación de texto libre ni, según la información disponible, tool calling en el sentido de emitir llamadas a funciones; su función es puntuar opciones ya enumeradas por el desarrollador.

## Casos de uso

- Triaje de soporte al cliente: el modelo recibe el texto de la incidencia y devuelve a qué equipo derivarla (`billing`, `sales`, `retail`) con una confianza por clase, lo que permite enrutar automáticamente y escalar a un humano solo por debajo de un umbral. El ejemplo de la model card muestra este flujo con `choice` y `noul` combinados.
- Enrutado de modelo en una arquitectura híbrida: dado un prompt y una lista de modelos candidatos, el decider elige el más adecuado (por coste o capacidad) antes de invocar al LLM, reduciendo el gasto en modelos grandes para consultas triviales.
- Selección de herramienta en un agente: con el estado de la conversación y las herramientas disponibles como opciones, el modelo decide cuál invocar, con una capa de comprobación de argumentos antes de la ejecución.
- Guardrails en producción: clasificación de contenido tóxico, spam o comentarios de odio en el pipeline de entrada, con la confianza calibrada usada como umbral de bloqueo o de revisión manual.
- Evaluación automática de respuestas generadas: las tareas `adequacy` y `gen:adequacy` permiten puntuar la calidad de las salidas de un LLM en un harness de evaluación continua, sin necesidad de un juez generativo de gran tamaño.
- Moderación y análisis de reseñas a escala: clasificación de sentimiento, sarcasmo y formalidad sobre volúmenes altos de texto (por ejemplo, reseñas de Yelp, correos o formularios), con 2B de parámetros y, por tanto, coste de inferencia muy inferior al de un LLM.
- Gestión documental y contractual: la tarea `contractnli` (86,5 % de exactitud sobre 1.026 ejemplos) indica utilidad para verificar implicaciones entre cláusulas o entre documento y afirmación.
- Filtrado de consultas en sistemas RAG: decidir si la consulta del usuario es respondible o no con el contexto disponible, decisión relevante antes de lanzar la generación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Ninguno está verificado de forma independiente (`verified: false`).

| Conjunto de evaluacion | Metrica | Valor | n |
|---|---|---|---|
| JevBench public, served at 4096 (w4096) | accuracy | 0,7619 | 231 (176 aciertos) |
| eval: held-out short tasks | accuracy | 0,65 | 6000 |
| eval: boardgame | accuracy | 0,821 | 900 |
| eval: contractnli | accuracy | 0,865 | 1026 |
| eval: hotpotqa (held out) | accuracy | 0,746 | 959 |
| eval: musique | accuracy | 0,882 | 1199 |
| eval: musique, answerable | accuracy | 0,886 | 599 |
| eval: musique, unanswerable | accuracy | 0,877 | 600 |
| eval: [4] adequacy_hs2 | accuracy | 0,739 | 234 |
| eval: [5] gen:adequacy | accuracy | 0,788 | 302 |

No se han publicado en la información disponible resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, MT-Bench) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 el backbone de 2B ocupa aproximadamente 4-5 GB incluyendo activaciones y overhead de runtime; en cuantización de 8 bits en torno a 2-3 GB; en 4 bits en torno a 1,5-2 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el backbone en fp16 con margen (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). En A100 o H100 el modelo queda sobradamente dimensionado y el cuello de botella pasa a ser la latencia de red o el preprocesado.
- Consumer GPU: sí, cabe con holgura en GPUs de gama media y alta (RTX 3060 12 GB en adelante). Con cuantización de 8 o 4 bits también es viable en GPUs de 6-8 GB.
- CPU y Apple Silicon: la CLI admite `--device cuda`, `mps` o `cpu`, y sin argumento selecciona el mejor dispositivo disponible, por lo que hay soporte explícito de CPU y de MPS en Mac.
- Opciones de despliegue: la librería oficial `strands-decider` (`pip install strands-decider`), modo servidor HTTP local (`strands-decider serve`) que escucha en 127.0.0.1 sin autenticación, y uso directo mediante transformers + PEFT cargando el adaptador. El extra `strands-decider[vision]` habilita la ruta de imagen. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de alternativas equivalentes de la misma categoría (modelo de decisión tipada con confianza calibrada). La comparación siguiente se limita a los elementos que sí están documentados en la información disponible.

| Modelo | Parametros | Tarea | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-hobson-v21 | 2B (base) + adaptador LoRA | Decision tipada y puntuacion | Opcion + confianza calibrada | Apache-2.0 | HuggingFace + repo de codigo |
| Qwen/Qwen3.5-2B-Base | 2B | Generacion de texto | Texto libre | no disponible | HuggingFace |
| Qwen/Qwen3.5-4B | 4B | Generacion de texto (profesor de destilacion en v21) | Texto libre | no disponible | HuggingFace |

Frente a un clasificador encoder clásico, la diferencia declarada por el autor es la combinación de tres tipos de pregunta (`noul`, `choice`, `score`) sobre un mismo checkpoint y la emisión de confianza calibrada, en lugar de una única etiqueta por tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente por el autor. El inventario de entrenamiento incluye datasets de moderación y de discurso de odio (civil_comments, measuring-hate-speech) y de reseñas, lo que puede trasladar sesgos de dominio y de anotación de esas fuentes.
- Riesgo de alucinación: bajo en el sentido generativo, ya que el modelo no produce texto libre; la salida se restringe al espacio de opciones proporcionado. El riesgo real es de calibración defectuosa, es decir, asignar confianza alta a una opción incorrecta.
- Benchmarks no verificados: todos los resultados del `model-index` están marcados como `verified: false` y proceden del propio autor, con conjuntos internos (`hobson-internal`) que no son reproducibles externamente.
- Rendimiento moderado en tareas cortas: 0,65 de exactitud sobre 6.000 ejemplos en el conjunto held-out de tareas cortas, el valor más bajo de la tabla publicada, lo que sugiere cautela en dominios de entrada muy breve.
- Limitaciones de idioma: no hay declaración oficial de idiomas soportados; no debe asumirse cobertura multilingüe más allá de lo que permitan los datos del backbone.
- Limitaciones de contexto: la ventana efectiva no está documentada; las evaluaciones se sirvieron a 4096 tokens, por lo que estados muy largos pueden degradar la decisión.
- Dependencia del modelo base: al ser un adaptador sobre Qwen/Qwen3.5-2B-Base, su uso implica cargar también esos pesos y aceptar la licencia del modelo base. El repositorio del adaptador es Apache-2.0, pero la licencia del backbone no se detalla en la información disponible.
- Servidor sin autenticación: `strands-decider serve` se enlaza a 127.0.0.1 y no implementa autenticación; el propio autor lo indica para experimentos locales, no para exposición en red.
- Advertencia de producción: la confianza calibrada conviene recalibrarla con datos propios del dominio antes de usarla como umbral automático en un sistema con consecuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Repositorio de código, receta de entrenamiento, inventario de datos y evaluaciones: https://github.com/strands-labs/strands-decider
- Documentación de la ruta de visión: `docs/vision.md` en el repositorio de código
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo profesor de destilación: https://huggingface.co/Qwen/Qwen3.5-4B
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos fueron convertidores de divisas, sin relación con la ficha); no se han encontrado papers, blogs técnicos ni demos adicionales.
