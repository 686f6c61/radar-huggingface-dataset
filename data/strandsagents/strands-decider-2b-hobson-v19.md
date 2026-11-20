# StrandsAgents/strands-decider-2B-hobson-v19

## Resumen

strands-decider-2B-hobson-v19 es un modelo de decisión de 2 mil millones de parámetros desarrollado por StrandsAgents. A diferencia de un LLM generativo, no produce texto libre: recibe un estado (un texto de entrada) y un conjunto de preguntas tipadas, y devuelve una elección entre opciones o una puntuación en una escala ordenada, acompañada de una confianza calibrada. El modelo se construye como un adaptador LoRA sobre `Qwen/Qwen3.5-2B-Base` más una pequeña cabeza de lectura que puntúa las opciones de cada pregunta.

La relevancia del modelo está en su orientación a flujos agénticos: enrutamiento de modelos, selección de herramientas, validación de argumentos, triaje, guardarraíles y evaluaciones. La idea es delegar en este modelo las decisiones rutinarias y reservar el LLM grande para las decisiones difíciles, reduciendo coste y latencia. Soporta tres tipos de pregunta: `noul` (sí/no), `choice` (una entre N opciones) y `score` (un nivel en una escala ordenada).

El checkpoint se publica con licencia Apache-2.0, un tamaño de repositorio de 0,1 GB (coherente con un adaptador LoRA más la cabeza), y se sirve mediante la librería `strands-decider`, que permite uso por CLI o mediante un servidor HTTP local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-2B-Base, con cabeza de lectura para puntuar opciones |
| Parametros totales | 2B en el modelo base; el adaptador LoRA y la cabeza añaden un número de parámetros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Evaluado a ventanas de 3072 y 4096 tokens; longitud máxima de contexto no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B-Base` y se entrena como adaptador LoRA con PEFT, añadiendo una cabeza de lectura que transforma el estado oculto en puntuaciones sobre las opciones de una pregunta tipada. La salida se normaliza para producir una distribución de probabilidad sobre las opciones (`choice`, `score`) o una probabilidad para `noul`, con una confianza derivada de esa distribución. El modelo está diseñado explícitamente para calibración, de ahí que cada respuesta incluya una confianza numérica.

El entrenamiento combina un conjunto amplio de datasets de clasificación y razonamiento, entre ellos `ccdv/arxiv-classification`, `clinc/clinc_oos`, `ag_news`, `dbpedia_14`, `banking77`, `amazon_massive_intent`, `glue`, `boolq`, `paws`, `civil_comments`, `sst5`, `trec-qc`, `vitaminc`, `ruletaker`, `hotpot_qa`, `Boardgame-QA`, `PubMedQA`, `HelpSteer2`, `measuring-hate-speech` y `yelp_review_full`, entre otros. El número exacto de tokens de entrenamiento, la composición porcentual del dataset y si se aplicó RLHF o DPO no están disponibles en la información proporcionada. La receta completa, el inventario de datos y las evaluaciones se publican en el repositorio de GitHub del proyecto.

## Capacidades

- Clasificación y decisión tipada: responde preguntas `noul` (sí/no), `choice` (una entre N opciones) y `score` (nivel en escala ordenada).
- Confianza calibrada: cada respuesta incluye una puntuación de confianza y la distribución completa sobre las opciones.
- Enrutamiento de modelos y selección de herramientas dentro de flujos agénticos.
- Validación de argumentos y comprobación de precondiciones antes de ejecutar una acción.
- Triaje y priorización de entradas (por ejemplo, urgencia o equipo responsable).
- Guardarraíles y clasificación de seguridad o adecuación de contenido.
- Evaluaciones automáticas de respuestas generadas.
- Razonamiento multi-paso acotado: evaluación sobre `hotpotqa`, `musique` y `contractnli` en formato de decisión.
- Soporte de múltiples preguntas en una sola llamada, sobre un mismo estado.
- Capacidades multilingües: no disponibles (el modelo incluye `amazon_massive_intent` y `language-identification` en el entrenamiento, pero no se documenta el alcance idiomático).
- No genera texto libre; no es un modelo de chat ni de completado.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje del usuario, el modelo decide a qué equipo derivarlo (`choice` entre billing, sales, retail) y si el mensaje transmite urgencia (`noul`), como muestra el ejemplo de la model card.
- Selección de herramientas en un agente: antes de invocar una herramienta, el modelo elige la más adecuada entre un conjunto finito y asigna confianza, lo que permite activar un fallback al LLM grande si la confianza es baja.
- Validación de argumentos: comprobar si los parámetros de una llamada a herramienta son coherentes con el estado de la conversación antes de ejecutarla, reduciendo errores en pipelines agénticos.
- Triaje de tickets y correos: clasificar por categoría y severidad con una escala ordenada (`score`), priorizando la cola de trabajo.
- Guardarraíles de contenido: clasificar si una entrada es adecuada, tóxica o sensible usando el modelo como filtro previo barato antes del LLM principal.
- Evaluación automática de respuestas: puntuar la adecuación de una respuesta generada (`adequacy`) en una escala ordenada, como en las evaluaciones internas del autor.
- Clasificación de documentos y contratos: decidir si un contrato contiene una cláusula concreta (`contractnli`) o clasificar documentos por temática (`arxiv-classification`, `20_newsgroups`).
- Filtrado de spam y detección de sarcasmo o emoción en mensajes cortos (`sms_spam`, `Sarcasm_News_Headline`, `dair-ai/emotion`).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| JevBench public, servido a 4096 | accuracy | 0,7229 (167/231) |
| JevBench public, servido a 3072 | accuracy | 0,7229 (167/231) |
| eval: held-out short tasks | accuracy | 0,641 (n=6000) |
| eval: boardgame | accuracy | 0,822 (n=900) |
| eval: contractnli | accuracy | 0,872 (n=1026) |
| eval: hotpotqa (held out) | accuracy | 0,717 (n=959) |
| eval: musique | accuracy | 0,884 (n=1199) |
| eval: musique, answerable | accuracy | 0,870 (n=599) |
| eval: musique, unanswerable | accuracy | 0,898 (n=600) |
| eval: [4] adequacy_hs2 | accuracy | 0,722 (n=234) |
| eval: [5] gen:adequacy | accuracy | 0,798 (n=302) |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible, ya que el modelo no está orientado a generación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo base de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM para los pesos, más el adaptador LoRA y la cabeza (de tamaño reducido) y el espacio de activaciones para contextos de 3072-4096 tokens.
- GPU recomendadas: no especificadas por el autor. El CLI acepta `--device cuda`, `mps` o `cpu`, y sin flag selecciona el mejor dispositivo disponible.
- GPU de consumo: un modelo de 2B es desplegable en GPUs de consumo con suficiente VRAM; el autor no publica una lista de GPUs validadas.
- Opciones de despliegue: la librería `strands-decider` (instalable con `pip install strands-decider`) para CLI y servidor HTTP local en `127.0.0.1:8000`; el servidor no tiene autenticación y está pensado para experimentos locales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-hobson-v19 | 2B (base) + LoRA | Evaluado a 3072/4096 | Modelo de decisión tipada | Apache-2.0 | Hugging Face + GitHub |
| Qwen/Qwen3.5-2B-Base | 2B | No disponible | LLM generativo base | No disponible en la información | Hugging Face |
| LLM generativo de propósito general (p. ej. modelos de 7-8B) | 7-8B | Variable | Generación de texto | Variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (modelos de decisión) en la información proporcionada. La comparación con LLM generativos no es directa, ya que el modelo no genera texto y su salida es una distribución sobre opciones con confianza calibrada.

## Limitaciones y advertencias

- El modelo no genera texto libre; solo responde a preguntas tipadas con opciones predefinidas. No sirve para chat ni completado.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El autor advierte que un reentrenamiento produce cifras algo distintas con las mismas respuestas, lo que implica variabilidad entre checkpoints.
- El servidor HTTP se enlaza a `127.0.0.1` y no tiene autenticación: no debe exponerse a redes no confiables.
- La longitud máxima de contexto no está documentada; las evaluaciones se limitan a ventanas de 3072 y 4096 tokens.
- El alcance multilingüe no está documentado, aunque el entrenamiento incluye datasets multilingües.
- No se documentan sesgos conocidos ni tasas de alucinación (el modelo no genera texto, por lo que el riesgo de alucinación se traslada a la calibración de la confianza).
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE.md` en el repositorio para condiciones adicionales.
- El tamaño del adaptador (0,1 GB) implica que el modelo base debe descargarse por separado desde el Hub en el primer uso.

## Enlaces

- Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Repositorio GitHub (código, receta, datos y evaluaciones): https://github.com/strands-labs/strands-decider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
