# toranb/theo-qwen-instruct

## Resumen

`theo-qwen-instruct` es un modelo de lenguaje causal de 1.499.628.632 parámetros (≈1,5B, dato real de los safetensors) afinado por el usuario `toranb` para inglés bíblico y teológico. Parte de `toranb/theo-qwen-base` y se ha sometido a una época de *supervised fine-tuning* sobre 153.633 ejemplos, según declara el autor en la model card. No es un asistente de propósito general: es un modelo de nicho, con un formato de prompt propio y tres modos de funcionamiento.

La particularidad del modelo es su diseño de instrucciones por marcador de modo. El primer token del prompt selecciona el comportamiento: chat (`[unused1]`), devocional (`[unused5]`) o resumen de conversación (`[unused6]`). La plantilla de chat incluida en el repositorio escribe ese marcador por el usuario y admite un argumento `documents` que activa el modo *grounded*: el modelo responde únicamente a partir del contexto suministrado y declara que no lo sabe cuando la respuesta no está ahí. Eso lo convierte en una pieza pensada para RAG teológico más que para conversación abierta.

Su relevancia práctica es acotada pero clara: los modelos de 1,5B ajustados a un dominio concreto y con rechazo explícito ante contextos insuficientes son útiles como componente barato de un pipeline de recuperación, y como banco de pruebas para estudiar formatos de instrucción poco convencionales (marcadores `[unusedN]`, salida en minúsculas, ausencia de *system prompt*). El repositorio se publicó el 24 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni *likes*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal; el repositorio se etiqueta como `qwen3` y deriva de `toranb/theo-qwen-base`. Detalle de capas y atencion: no disponible |
| Parametros totales | 1.499.628.632 (≈1,5B, segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no declara ventana de contexto) |
| Tipos de cuantizacion | No disponible. El repo distribuye pesos en safetensors y la model card usa bfloat16 en GPU y float32 en CPU; no se documentan GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | Ingles unicamente (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + `transformers` con `trust_remote_code=True` (`custom_code`); tamano del repo 3,0 GB |

Otros datos declarados: pipeline `text-generation`, creado el 2026-10-24, actualizado el 2026-10-24, requiere `torch>=2.5` y `transformers>=5.0`.

## Arquitectura y entrenamiento

La informacion disponible no detalla el numero de capas, cabezas, tipo de atencion ni la composicion exacta del corpus de preentrenamiento del modelo base. Lo que si se documenta es la fase de ajuste: una epoca de SFT sobre 153.633 ejemplos generados en tres modos (chat, devocional y resumen), con un formato de instruccion basado en marcadores `[unusedN]` al inicio del prompt y con turnos etiquetados como `[unused3] user` / `[unused4] assistant`. El *system prompt* esta fijado por entrenamiento y la plantilla rechaza mensajes de rol `system`.

Una decision de diseno poco habitual y muy determinante: todo el material de entrenamiento esta en minusculas y, salvo cuatro respuestas, en ASCII plano. Por eso la plantilla convierte la entrada a minusculas y el modelo devuelve minusculas; la restauracion de mayusculas queda a cargo de la aplicacion que lo consume. El modo *grounded* anade una consigna entrenada literal ("answer the question using only the context below. if the context does not contain the answer, say you do not know.") seguida del contexto, lo que enseña al modelo a abstenerse. No se menciona RLHF, DPO ni preferencias; solo SFT supervisado. La model card indica ademas que el modelo sirve como punto de partida para mas SFT o *preference tuning* en el mismo formato.

## Capacidades

- Generacion de texto conversational en ingles, multi-turno, en modo chat.
- Question answering anclado a documentos suministrados por el usuario (RAG), con abtencion explicita cuando el contexto no contiene la respuesta.
- Escritura de devocionales breves (≈270 palabras) a partir de un unico pasaje: referencia mas texto del versiculo, con explicacion, evangelio y aplicacion.
- Resumen incremental de conversaciones para poder continuarlas con un prompt corto.
- Oraciones a peticion dentro del chat pastoral.
- Etiquetado por ranking de candidatos en tareas de *cloze* teologico (formato evaluado en el benchmark del autor).
- Seleccion de modo mediante token de control (`[unused1]`, `[unused5]`, `[unused6]`) gestionado por la plantilla de chat incluida.
- Soporte de tool calling / function calling: no. La model card lo declara explicitamente fuera de alcance.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta disenado para tres modos cerrados.
- Vision, audio o *thinking mode*: no disponible.
- Capacidades multilingues: no. Solo ingles.
- *System prompt* configurable: no. Esta fijado y los mensajes de sistema se rechazan.

## Casos de uso

- **RAG sobre corpus teologico o documentacion de una comunidad**: se recuperan pasajes con un buscador vectorial, se pasan como `documents=[{"title": ..., "text": ...}]` y el modelo responde solo con esa base. Su valor esta en la abstención entrenada: reduce respuestas inventadas cuando el fragmento recuperado no cubre la pregunta.
- **Chat pastoral multi-turno para una web de iglesia o comunidad**: con 1,5B de parametros se puede servir en una GPU modesta o en CPU, gestionando conversaciones de varias rondas con el historial empaquetado en una sola instruccion.
- **Generacion automatica de devocionales diarios**: a partir de una referencia y el texto del versiculo se obtiene un texto de unas 270 palabras con estructura fija (explicacion, evangelio, aplicacion), apto para un boletin o una app de lectura diaria con revision editorial humana.
- **Compactado de historial conversacional**: el modo `summary` permite reemplazar un historial largo por un resumen y seguir la conversacion con un prompt corto, util para mantener sesiones largas dentro de una ventana de contexto reducida o desconocida.
- **Prototipado de ajuste fino de dominio**: al ser Apache 2.0 y 1,5B, sirve como base para SFT adicional o *preference tuning* manteniendo el mismo formato de marcadores, sin coste de licencia.
- **Banco de pruebas de evaluacion tipo cloze**: el propio autor publica `eval.json` con 545 casos y un pipeline de ranking de candidatos; ese conjunto se puede reutilizar para medir regresiones al reentrenar.
- **Filtrado y clasificacion de contenido teologico en pipelines internos**: el modelo puntua candidatos de respuesta, lo que permite usarlo como *reranker* o verificador de textos generados por otro modelo mayor.

## Benchmarks y rendimiento

Unico resultado declarado en el `model-index` de la model card. **No esta verificado** por un tercero y el conjunto de evaluacion es interno del autor (`eval.json` del propio repositorio).

| Benchmark | Conjunto de datos | Metrica | Resultado | Verificado |
|---|---|---|---|---|
| Causal Language Modeling (text-generation) | Theology cloze ruler, 545 casos | Pass rate (candidate ranking) | 0,972 | No (declarado por el autor) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- **VRAM estimada (inferencia)**: con pesos en bfloat16, el repositorio ocupa 3,0 GB, por lo que los pesos solos caben en unos 3,5-4 GB de VRAM; hay que sumar la cache KV, cuyo tamano depende de una longitud de contexto no documentada. En CPU con float32 (como indica la model card) hacen falta aproximadamente 6 GB de RAM para los pesos.
- **GPU recomendadas**: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070) para bfloat16; RTX 4090, L40S, A10G, A100 o H100 si se necesita lote grande o muchas peticiones concurrentes.
- **Cabe en GPU de consumo**: si. Es un modelo de 1,5B en 3,0 GB de safetensors; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB lo ejecutan con holgura y permiten varias secuencias simultaneas.
- **Despliegue**: la via documentada es `transformers` con `trust_remote_code=True`, lo que implica cargar codigo del repositorio. Para vLLM, TGI, llama.cpp u Ollama no se ofrece soporte oficial en la informacion disponible; requeriria convertir pesos y replicar el manejo de los tokens `[unusedN]` y la logica de la plantilla, cosa que estos motores no hacen de forma nativa con `custom_code`.
- **Latencia y throughput**: no disponibles. La model card solo fija parametros de muestreo (`temperature` 0,6, `top_k` 40, `top_p` 0,75, `max_new_tokens=400` como ejemplo) y recomienda `temperature` 0,8 para devocionales y oraciones, o `do_sample=False` para decodificacion voraz.

## Comparativa con modelos similares

La busqueda web no aporta datos de licencia, contexto ni benchmarks de los modelos alternativos; las celdas que no constan se marcan como no disponibles para no inferir cifras.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `toranb/theo-qwen-instruct` | ≈1,5B | No disponible | Ingles teologico, 3 modos, RAG con abstención | Apache 2.0 | Hugging Face, `transformers` + `custom_code` |
| `Qwen/Qwen2.5-3B-Instruct` | ≈3B (segun el nombre del repositorio) | No disponible en la busqueda | Asistente generalista, codigo y matematicas | No disponible en la busqueda | Hugging Face, `transformers` |
| `Qwen/Qwen3-4B-Instruct-2507` | ≈4B (segun el nombre del repositorio) | No disponible en la busqueda | Asistente generalista de la familia Qwen3 | No disponible en la busqueda | Hugging Face, `transformers` |
| `Qwen2.5 7B Instruct Turbo` (Together AI) | ≈7B | No disponible en la busqueda | Texto general, codigo, matematicas, texto largo | No disponible en la busqueda | Endpoint alojado en Together AI |

Lectura practica: frente a estos generalistas, `theo-qwen-instruct` es entre dos y cinco veces mas pequeno, solo habla ingles, no tiene *tool calling* ni *system prompt*, y su unica ventaja medible es la abstención en modo *grounded* dentro de su dominio. La comparacion de rendimiento no es posible con los datos disponibles, porque el unico benchmark del autor es propio y no verificable de forma externa.

## Limitaciones y advertencias

- **Solo ingles**. No hay soporte multilingue; cualquier uso en castellano queda fuera de las capacidades declaradas.
- **Entrada y salida en minusculas**. La plantilla convierte la entrada y el modelo responde en minusculas y practicamente en ASCII; hay que restaurar mayusculas (y cualquier carácter no ASCII) en la aplicacion.
- **Sin *system prompt***. Los mensajes de rol `system` se rechazan; el comportamiento se fija solo con los modos y, en su caso, con `documents`.
- **Sin *tool calling* ni comportamiento de agente**. No es un asistente de proposito general y no debe plantearse como sustituto de uno.
- **Riesgo de alucinacion fuera del modo *grounded***. En chat sin contexto el modelo responde de memoria teologica; la abstención solo esta entrenada cuando se aporta contexto.
- **Contexto desconocido**. No se declara ventana de contexto, lo que impide dimensionar la cache KV o garantizar el comportamiento del modo `summary` con historiales largos.
- **Benchmark no verificado**. El 0,972 de *pass rate* procede de un conjunto interno de 545 casos, con metrica de ranking de candidatos y sin validacion independiente; no es comparable con MMLU o HumanEval.
- **Sesgo de dominio**. El corpus es cristiano y confesional; las respuestas devocionales incorporan una estructura fija (explicacion, evangelio, aplicacion) y una perspectiva teologica concreta. No es un modelo neutral para historia de las religiones.
- **Riesgo de ejecucion de codigo**. La carga requiere `trust_remote_code=True`; conviene auditar el codigo del repositorio antes de desplegarlo en produccion.
- **Sin validacion externa**. 0 descargas y 0 *likes* en el momento de la ficha: no hay evidencia de uso en produccion ni informes de terceros.
- **Licencia**. Apache 2.0 permite uso comercial y modificacion; el autor no documenta restricciones adicionales, pero el cumplimiento debe verificarse contra el fichero de licencia del repositorio y el del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toranb/theo-qwen-instruct
- Modelo base: https://huggingface.co/toranb/theo-qwen-base
- Conjunto de evaluacion (`eval.json`, 545 casos): incluido en el repositorio del modelo
- Requisitos de ejecucion (`requirements.txt`, torch>=2.5, transformers>=5.0): incluido en el repositorio del modelo
- Referencia de comparacion, Qwen2.5 7B Instruct Turbo (Together AI): https://www.together.ai/models/qwen2-5-7b-instruct-turbo
- Referencia de comparacion, Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Referencia de comparacion, Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Vision general de la familia Qwen2.5-Instruct: https://www.emergentmind.com/topics/qwen2-5-instruct-models
- Guia de despliegue de chatbots con Qwen3 Instruct: https://pyimagesearch.com/2026/06/29/building-an-intelligent-chatbot-with-qwen3-instruct-and-thinking-models/
