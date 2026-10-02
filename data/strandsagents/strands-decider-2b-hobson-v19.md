# StrandsAgents/strands-decider-2B-hobson-v19

## Resumen

Strands Decider 2B es un modelo de decisión (también llamado *system one model*) publicado por StrandsAgents sobre el modelo base `Qwen/Qwen3.5-2B-Base`. A diferencia de un LLM generativo, no produce texto libre: recibe un estado y un conjunto de preguntas tipadas y devuelve, para cada una, una elección entre opciones o una puntuación en una escala ordenada, acompañada de una confianza calibrada. El repositorio `strands-decider-2B-hobson-v19` contiene un adaptador LoRA (formato PEFT) más una pequeña cabeza de lectura (*readout head*) que puntúa las opciones de la pregunta.

El modelo está pensado para ocupar las decisiones repetitivas dentro de un flujo agéntico: enrutado de peticiones entre modelos, selección de herramientas, comprobación de argumentos, triaje, guardarraíles y evaluaciones. La propuesta es dejar las decisiones triviales o de alta frecuencia a este modelo de ~1,9B parámetros y reservar el LLM grande para los casos que realmente requieren generación. Según los resultados de búsqueda, AWS ha publicado este modelo bajo licencia Apache-2.0, con una latencia mediana de 115 ms en una RTX 3090 y un tercer puesto de 33 modelos en su clase de tamaño en JevBench.

El checkpoint se distribuye como adaptador sobre el modelo base, por lo que su repo pesa solo 0,1 GB y requiere descargar Qwen3.5-2B-Base por separado en el primer uso. La fecha de creación declarada en el Hub es el 30 de septiembre de 2026 y la de actualización el 1 de octubre de 2026, con 25 *likes* y 0 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B-Base) con adaptador LoRA y cabeza de lectura para puntuación de opciones; sin cabeza de lenguaje, sustituida por una *pointer head* según los resultados de búsqueda |
| Parámetros totales | 1,9B según la nota de prensa y el hilo de Reddit; el modelo base se denomina comercialmente 2B. No disponible en la model card con cifra exacta |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. Las evaluaciones JevBench se sirven con ventanas de 3072 y 4096 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT, 0,1 GB); requiere el modelo base Qwen/Qwen3.5-2B-Base |

Otros datos del repositorio: pipeline `text-classification`, librería `peft`, relación con el modelo base `adapter`, región `us`, 25 *likes*, 0 descargas.

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B-Base` y se ajusta mediante un adaptador LoRA de tipo PEFT al que se añade una cabeza de lectura específica. Esa cabeza puntúa cada opción de una pregunta tipada. Los tres tipos de pregunta documentados son `noul` (pregunta binaria sí/no), `choice` (una opción entre N alternativas) y `score` (un nivel dentro de una escala ordenada). La salida incluye siempre una confianza calibrada por pregunta y una distribución de puntuación por opción. Según los resultados de búsqueda, el diseño prescinde de la cabeza de lenguaje del modelo base y la reemplaza por una *pointer head*.

El entrenamiento utiliza un inventario amplio de conjuntos de datos, declarados en la model card: clasificación de arXiv, CLINC OOS, Yahoo Answers Topics, emociones (dair-ai/emotion), AG News, DBpedia 14, PAWS, BoolQ, Civil Comments, Banking77, Amazon Massive Intent, GLUE, puntuaciones de formalidad de Pavlick, identificación de idioma (papluca), PubMedQA, sarcasmo en titulares de noticias, reseñas de apps, 20 Newsgroups, SST-5, subjetividad, TREC-QC, VitaminC, RuleTaker, Measuring Hate Speech, SMS Spam, Yelp Review Full, HelpSteer2, Boardgame-QA y HotpotQA. No se especifica en la información disponible el número total de tokens, la composición exacta por tarea ni si se aplicaron etapas de RLHF o DPO. El mismo repositorio de GitHub (`strands-labs/strands-decider`) aloja el código, la receta de entrenamiento, el inventario de datos y las evaluaciones bajo la misma licencia Apache-2.0. La model card advierte que un reentrenamiento produce cifras ligeramente distintas con las mismas respuestas, lo que indica sensibilidad al proceso de entrenamiento.

## Capacidades

- Decisión tipada: responde preguntas binarias (`noul`), de elección entre N opciones (`choice`) y de puntuación en escala ordenada (`score`).
- Confianza calibrada por respuesta: cada salida incluye una probabilidad para la opción elegida y una distribución sobre las alternativas o los niveles de la escala.
- Enrutado de modelos y selección de herramientas dentro de flujos agénticos.
- Comprobación de argumentos y validación de llamadas a funciones antes de su ejecución.
- Triaje y priorización de peticiones, con clasificación de urgencia o categoría de equipo.
- Guardarraíles y evaluaciones: filtrado de contenido y puntuación automática de calidad de respuestas.
- Clasificación de texto en dominios muy variados (noticias, reseñas, intenciones, emociones, toxicidad, NLI, QA), según los conjuntos de datos de entrenamiento declarados.
- Comprensión de preguntas multi-salto y de si una pregunta es respondible o no (evaluaciones sobre MuSiQue y HotpotQA).
- Exposición de un servidor HTTP local con endpoint `POST /v1/systemone` que acepta el estado y un mapa de preguntas.
- No genera texto libre: no es un modelo de chat ni de generación de código, y no se documentan capacidades de visión, audio ni *tool calling* generativo.

## Casos de uso

- Enrutado de peticiones en una plataforma multi-modelo: dado el texto de entrada del usuario, el modelo decide con una pregunta `choice` si debe atenderlo un modelo pequeño, uno grande o una herramienta concreta, reduciendo el coste frente a consultar siempre al LLM mayor.
- Selección de herramientas en un agente: antes de invocar una función, el modelo resuelve con `choice` cuál de las herramientas disponibles encaja mejor con el estado actual, y con `noul` comprueba si falta información para invocarla.
- Triaje de tickets de soporte: el ejemplo oficial de la model card clasifica una queja de pagos en `billing`, `sales` o `retail`, detecta urgencia y estima el nivel de frustración del usuario en una escala de tres niveles.
- Guardarraíles de entrada y salida: clasificar si una petición o una respuesta incumple una política mediante preguntas `noul`, aprovechando la confianza calibrada para fijar umbrales de derivación a revisión humana.
- Evaluación automática de respuestas: puntuar adecuación de salidas generadas por otros modelos (`adequacy_hs2`, `gen:adequacy` en las evaluaciones internas), útil como juez ligero y barato en pipelines de evaluación continua.
- Filtrado de contenido y moderación: puntuar toxicidad, odio o spam en comentarios y mensajes, con las categorías entrenadas a partir de Measuring Hate Speech, Civil Comments y SMS Spam.
- Clasificación de documentos y contratos: determinar relaciones de inferencia y contradicción en NLI (`contractnli` con 0,872 de exactitud) para enrutar cláusulas a revisión legal o a procesos automáticos.
- Decisión híbrida dentro de un agente: resolver de forma masiva las decisiones rutinarias y derivar al LLM únicamente las que devuelvan baja confianza, usando el umbral sobre la calibración como criterio de escalado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el *model-index* de la model card. Todas las métricas figuran como no verificadas (`verified: false`).

| Conjunto de evaluación | Métrica | Valor | Muestra |
|---|---|---|---|
| JevBench public, servido a 4096 | accuracy | 0,7229 | 167/231 |
| JevBench public, servido a 3072 | accuracy | 0,7229 | 167/231 |
| eval: held-out short tasks | accuracy | 0,641 | n=6000 |
| eval: boardgame | accuracy | 0,822 | n=900 |
| eval: contractnli | accuracy | 0,872 | n=1026 |
| eval: hotpotqa (held out) | accuracy | 0,717 | n=959 |
| eval: musique | accuracy | 0,884 | n=1199 |
| eval: musique, answerable | accuracy | 0,87 | n=599 |
| eval: musique, unanswerable | accuracy | 0,898 | n=600 |
| eval: [4] adequacy_hs2 | accuracy | 0,722 | n=234 |
| eval: [5] gen:adequacy | accuracy | 0,798 | n=302 |

Según los resultados de búsqueda, el modelo quedó tercero de 33 modelos en su clase de tamaño en JevBench. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que además no serían aplicables a un modelo sin cabeza generativa.

## Requisitos de hardware

- Parámetros: ~1,9B. Estimación de VRAM para los pesos del modelo base más el adaptador: en torno a 4 GB en fp16, 2 GB en int8 y 1-1,5 GB en int4, más la memoria de caché KV según la ventana utilizada (las evaluaciones se sirven a 3072 y 4096 tokens).
- El checkpoint distribuido en el Hub es únicamente el adaptador LoRA (0,1 GB); el modelo base `Qwen/Qwen3.5-2B-Base` se descarga aparte en el primer uso.
- Cabe holgadamente en GPU de consumo: RTX 3090, RTX 4090 y tarjetas con 8 GB o más de VRAM en cuantizaciones de 8 y 4 bits; en fp16 es razonable desde 6-8 GB.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; pueden usarse para servir muchas réplicas concurrentes.
- Opciones de despliegue: paquete `strands-decider` vía `pip install strands-decider`, con CLI (`strands-decider ask`) y servidor HTTP local (`strands-decider serve ... --port 8000`, endpoint `/v1/systemone`). Selección de dispositivo con `--device cuda`, `mps` o `cpu`. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia declarada: 115 ms de mediana en una RTX 3090 según los resultados de búsqueda. No hay datos publicados de throughput.
- El servidor escucha en `127.0.0.1` y no tiene autenticación, por lo que está pensado para experimentación local.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos de decisión comparables en la información proporcionada. La comparativa se limita al modelo base y a la categoría general.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-hobson-v19 | Modelo de decisión (LoRA + readout head) | ~1,9B | No disponible (evaluado a 3072 y 4096) | Apache-2.0 | HuggingFace, adaptador + GitHub |
| Qwen/Qwen3.5-2B-Base | LLM generativo (base del anterior) | 2B | No disponible | No disponible en la información proporcionada (la del adaptador es Apache-2.0) | HuggingFace |
| Alternativas de la misma categoría (modelos de decisión de ~2B) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no puede emplearse como chatbot, generador de código ni resumidor.
- Los resultados de benchmarks están declarados por el autor y figuran como no verificados; deben tratarse como indicativos hasta su reproducción independiente.
- La exactitud en tareas cortas retenidas es de 0,641 (n=6000), notablemente inferior a la de las evaluaciones específicas por dominio, lo que sugiere degradación fuera de los dominios cubiertos por el entrenamiento.
- El autor advierte que un reentrenamiento produce cifras distintas con las mismas respuestas, lo que implica variabilidad entre ejecuciones de entrenamiento.
- No se especifican los idiomas soportados en la model card; los conjuntos de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- No hay datos publicados sobre sesgos demográficos, socioculturales o lingüísticos, ni sobre tasas de alucinación o error por tipo de pregunta.
- La calibración de confianza es una propiedad declarada, pero no se aportan métricas de calibración (ECE, curvas de fiabilidad) en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos de los conjuntos de datos de entrenamiento y del modelo base antes de un despliegue en producción.
- El servidor HTTP incluido escucha solo en `127.0.0.1` y no implementa autenticación; no debe exponerse directamente a una red.
- No se documentan cuantizaciones publicadas ni formatos GGUF, lo que limita el despliegue fuera del ecosistema PEFT/PyTorch sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de código, receta de entrenamiento y evaluaciones: https://github.com/strands-labs/strands-decider
- Blog de presentación: https://strandsagents.com/blog/introducing-strands-decider/
- Hilo en Reddit: https://www.reddit.com/r/machinelearningnews/comments/1wvmut4/strands_decider_2b_aws_opensourced_a_19b_decision/
- Artículo de SQ Magazine: https://sqmagazine.co.uk/amazon-strands-decider-2b-open-source-decision-model/
- Paper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
