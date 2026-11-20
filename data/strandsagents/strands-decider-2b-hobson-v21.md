# StrandsAgents/strands-decider-2B-hobson-v21

## Resumen

strands-decider-2B-hobson-v21 es un modelo de decisión de 2B parámetros desarrollado por StrandsAgents, diseñado específicamente para tareas de clasificación y selección de opciones dentro de flujos de trabajo agénticos. A diferencia de un LLM generativo convencional, este modelo no produce texto libre: recibe un estado (texto de contexto) y un conjunto de preguntas tipadas (sí/no, elección entre N opciones, o puntuación en escala ordenada) y devuelve la opción seleccionada junto con una confianza calibrada. Está construido como un adaptador LoRA sobre Qwen/Qwen3.5-2B-Base, con una pequeña cabeza de lectura que puntúa las opciones.

El modelo resuelve el problema del enrutamiento y la toma de decisiones repetitivas dentro de agentes: selección de herramientas, verificación de argumentos, triaje de tickets, guardarraíles y evaluaciones. La propuesta es delegar las decisiones "mecánicas" a un modelo pequeño y rápido, reservando el LLM grande para las decisiones complejas. La versión v21 incorpora paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B en los casos donde este coincide con la etiqueta gold.

El checkpoint se publica bajo licencia Apache-2.0, con un tamaño de repositorio de 0,1 GB (solo el adaptador y la cabeza de lectura; los pesos base se descargan de Qwen al primer uso). La librería asociada, `strands-decider`, permite consultas por CLI o servidor HTTP local, con soporte de GPU CUDA, MPS y CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-2B-Base + cabeza de lectura para puntuación de opciones |
| Parámetros totales | 2B (modelo base); el adaptador LoRA y la cabeza de lectura añaden un tamaño no especificado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de servicio declarada en JevBench w4096) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) sobre el transformer Qwen/Qwen3.5-2B-Base, al que se añade una cabeza de lectura que puntúa las opciones de una pregunta tipada. Soporta tres tipos de pregunta: `noul` (sí/no), `choice` (una entre N opciones) y `score` (nivel en una escala ordenada). Cada respuesta incluye una confianza calibrada, lo que permite umbralizar decisiones en producción.

El entrenamiento combina múltiples datasets de clasificación y razonamiento: arxiv-classification, clinc_oos, yahoo_answers_topics, emotion, ag_news, dbpedia_14, paws, boolq, civil_comments, banking77, amazon_massive_intent, glue, pavlick-formality-scores, language-identification, PubMedQA, Sarcasm_News_Headline, app_reviews, 20_newsgroups, sst5, subj, TREC-QC, vitaminC, ruletaker, measuring-hate-speech, sms_spam, yelp_review_full, HelpSteer2, Boardgame-QA y hotpot_qa. La versión v21 añade paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B en los casos en que este coincide con la etiqueta gold. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF/DPO.

Como innovación destacable, el modelo separa la decisión de la generación: en lugar de generar texto y parsearlo, puntúa directamente las opciones, lo que reduce latencia y facilita la calibración. El checkpoint publicado es el "seed" de seis, seleccionado mediante una regla definida antes de clasificar los seeds.

## Capacidades

- Clasificación de texto con opciones tipadas: sí/no (`noul`), elección entre N opciones (`choice`) y puntuación en escala ordenada (`score`).
- Confianza calibrada por respuesta, apta para umbralizar y para guardarraíles.
- Enrutamiento de decisiones dentro de agentes: selección de herramienta, verificación de argumentos, triaje.
- Razonamiento multi-paso acotado: evaluación en tareas de multi-hop (hotpotqa, musique) y reglas lógicas (ruletaker, boardgame).
- Soporte de imágenes mediante `pip install "strands-decider[vision]"` (transformers 5.18 o superior), con `serve --vision` o `ask --image FILE`.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No genera texto libre; su salida es una opción seleccionada con puntuaciones por opción.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con los equipos disponibles (billing, sales, retail); devuelve el equipo con confianza, como se muestra en el ejemplo de la model card.
- Triaje de urgencia: con una pregunta `noul` ("¿transmite urgencia?") y una `score` ("nivel de frustración"), se puede priorizar la cola de atención al cliente sin invocar un LLM grande.
- Selección de herramientas en agentes: dado el estado de la conversación y la lista de herramientas disponibles, el modelo elige la herramienta adecuada y verifica los argumentos antes de la llamada.
- Guardarraíles de contenido: clasificación de comentarios (civil_comments, measuring-hate-speech) para bloquear o derivar mensajes antes de que lleguen a un LLM generativo.
- Evaluación automática de respuestas: puntuación de adecuación (adecuacy_hs2, gen:adequacy) en pipelines de evaluación de otros modelos o de respuestas de agentes.
- Clasificación de intenciones en asistentes: con clinc_oos, banking77 o amazon_massive_intent, el modelo puede etiquetar la intención del usuario en un dominio acotado con latencia baja.
- Verificación de afirmaciones y preguntas de lectura: boolq, PubMedQA y hotpotqa permiten responder preguntas de sí/no o de opción múltiple sobre documentos, útil en RAG con verificación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Evaluación | Métrica | Valor | n |
|---|---|---|---|
| JevBench public, servido a 4096 | accuracy | 0,7619 (176/231) | 231 |
| Held-out short tasks | accuracy | 0,65 | 6000 |
| Boardgame | accuracy | 0,821 | 900 |
| ContractNLI | accuracy | 0,865 | 1026 |
| HotpotQA (held out) | accuracy | 0,746 | 959 |
| MuSiQue | accuracy | 0,882 | 1199 |
| MuSiQue, answerable | accuracy | 0,886 | 599 |
| MuSiQue, unanswerable | accuracy | 0,877 | 600 |
| [4] adequacy_hs2 | accuracy | 0,739 | 234 |
| [5] gen:adequacy | accuracy | 0,788 | 302 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo base de 2B parámetros más un adaptador LoRA, la inferencia en FP16 requiere del orden de 4-6 GB de VRAM, y en cuantización de 8 bits o 4 bits podría caber en GPUs consumer con 4-8 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 3060/4060/4090, A100 y H100.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 2B; el autor no lo confirma.
- Opciones de despliegue: CLI `strands-decider ask` con `--device cuda`, `mps` o `cpu`; servidor HTTP local con `strands-deci...` (nombre truncado en la información disponible). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-hobson-v21 | 2B (base) + LoRA | 4096 | Clasificación/decisión tipada con confianza calibrada | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B-Base | 2B | No disponible | LLM generativo base | No disponible en la información | Hugging Face |
| Qwen/Qwen3.5-4B | 4B | No disponible | LLM generativo (usado para destilación) | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparables de estos modelos en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo selecciona entre opciones predefinidas y puntúa escalas; no sirve para generación abierta.
- Las métricas de benchmarks son declaradas por el autor y no están verificadas (`verified: false`).
- No se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- Riesgo de alucinación en el sentido de seleccionar una opción incorrecta con alta confianza; la calibración declarada no está verificada de forma independiente.
- Sesgos potenciales derivados de los datasets de entrenamiento (civil_comments, measuring-hate-speech, yelp_review_full, etc.), no documentados por el autor.
- El servidor HTTP se enlaza a 127.0.0.1 y no tiene autenticación: solo para experimentos locales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B-Base tiene su propia licencia que debe verificarse por separado.
- El checkpoint es un "seed" de seis; el autor indica que fue seleccionado por una regla predefinida, pero no se detalla la variabilidad entre seeds.
- El soporte de visión requiere transformers 5.18 o superior y la ruta de imagen está en `main` del repositorio de código; puede no estar en todas las versiones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Repositorio de código, receta de entrenamiento, inventario de datos y evaluaciones: https://github.com/strands-labs/strands-decider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo de destilación: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de visión: `docs/vision.md` en el repositorio de código
