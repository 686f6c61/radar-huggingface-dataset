# surogate/rune-26b-a4b-GGUF

## Resumen

Rune 26B-A4B v3 es un modelo de decisión desarrollado por Invergent, publicado en el repositorio `surogate/rune-26b-a4b-GGUF`. A diferencia de un modelo generativo convencional, Rune no produce texto libre: recibe un estado (texto, datos estructurados o una imagen con texto), una pregunta y un conjunto de opciones, y devuelve una única opción junto con una probabilidad sobre todas ellas en un solo paso forward (single forward pass). Responde a tres tipos de preguntas: `choice` (elegir una entre N), `noul` (probabilidad de que una afirmación sea verdadera) y `score` (posición en una escala ordinal).

Técnicamente es un checkpoint estándar `Gemma4ForConditionalGeneration` de tipo mixture-of-experts (MoE), con 26,5B parámetros totales y 8 de 128 expertos activos por token (la designación "A4B" refleja aproximadamente 4B parámetros activos). Mantiene la torre de visión heredada de su modelo base, `google/gemma-4-26B-A4B-it`, por lo que acepta imágenes además de texto, y soporta una ventana de contexto de 262k tokens. Su licencia es Apache 2.0.

Su relevancia actual radica en su posicionamiento en la Decision Index, un leaderboard público de modelos de decisión: en la edición 0.2.1 (publicada el 26 de septiembre de 2026) Rune v3 obtiene un índice de 57,44, quedando segundo a 0,45 puntos de Jev 1.13, y con el modo `thinking` activado alcanzaría aproximadamente 59,2 según la estimación del propio autor. Incorpora además un modo de razonamiento opcional por petición y calibración de probabilidades mediante temperatura de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4ForConditionalGeneration` (transformer MoE con torre de visión) |
| Parametros totales | 25.805.936.206 (~26,5B) |
| Parametros activos | 8 de 128 expertos por token (aproximadamente 4B, designación "A4B") |
| Longitud de contexto | 262k tokens |
| Tipos de cuantizacion | bf16 (safetensors); los builds GGUF de la versión v1 permanecen en el historial del repositorio (revisión `2a15504`), sin detalle de qué cuantizaciones concretas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF en revisiones anteriores |
| Pipeline declarado | text-classification |
| Motor de servicio recomendado | surogate (endpoint de decisiones) |

## Arquitectura y entrenamiento

El modelo es un checkpoint MoE del tipo `Gemma4ForConditionalGeneration`, con 26,5B parámetros totales y activación dispersa de 8 expertos de un total de 128 por token. Conserva la torre de visión del modelo base, de modo que procesa tanto entradas de texto como imágenes que contienen texto. Su salida no es texto generado, sino una decisión estructurada: la opción seleccionada y su probabilidad asociada, calculadas en un único paso forward. El autor indica que se sirve con mayor rapidez mediante el motor surogate, cuyo endpoint de decisiones implementa el protocolo con el que se entrenó Rune.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se documenta un modo de razonamiento (`thinking`) desacoplado del entrenamiento base: cuando está activado por petición, si la confianza de una sola pasada (la probabilidad de la opción principal, o el mayor de p y 1-p para verdadero/falso) cae por debajo de 0,7, el modelo razona hasta 512 tokens antes de responder; el resto de preguntas mantienen su respuesta de una pasada. Aproximadamente una de cada diez preguntas activa este razonamiento.

Se documenta también un mecanismo de calibración: a temperatura por defecto el modelo es sobreconfiado, y leer las respuestas con temperatura 2 alinea las probabilidades con la precisión real, sin cambiar la opción elegida.

## Capacidades

- Toma de decisiones estructurada en tres modalidades: `choice` (elegir una opción entre N), `noul` (probabilidad de veracidad de una afirmación) y `score` (posición en una escala ordinal).
- Devolución de probabilidad calibrable sobre todas las opciones, no solo de la opción elegida.
- Procesamiento de texto, datos estructurados e imágenes con texto (torre de visión conservada).
- Modo de razonamiento opcional por petición (`"thinking": true`) con umbral de confianza de 0,7 y hasta 512 tokens de razonamiento.
- Ajuste de calibración mediante temperatura de decisión (`--decision-temperature 2`).
- Contexto largo de 262k tokens para estados extensos.
- Áreas de evaluación cubiertas según la Decision Index: Knowledge & Reasoning, Language, Retrieval & Classification, Tools & Automation y Arts & Human Taste.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Clasificación y enrutado de solicitudes: dado un texto de entrada y un conjunto de categorías, el modelo devuelve la categoría más probable con su probabilidad, adecuado para triaje de tickets o enrutado a colas.
- Verificación de afirmaciones: en modalidad `noul`, asigna una probabilidad de veracidad a una afirmación, útil en pipelines de fact-checking o de control de calidad de contenido generado.
- Puntuación en escalas ordinales: en modalidad `score`, sitúa una respuesta en una escala (por ejemplo, relevancia o calidad), aplicable a evaluación automática de respuestas.
- Inspección de documentos con imágenes: al conservar la torre de visión y 262k tokens de contexto, puede responder preguntas con opciones sobre capturas, formularios escaneados o páginas de documentos con texto.
- Moderación y filtrado con umbral de confianza: la probabilidad calibrada permite fijar umbrales para derivar casos dudosos a revisión humana.
- Evaluación de modelos y benchmarking: su integración en la Decision Index (151.034 peticiones de 44 benchmarks) lo hace apto como componente de evaluación automática de sistemas.
- Selección entre alternativas en asistentes: ante varias respuestas candidatas de otro modelo, elegir la mejor opción mediante `choice` en un único paso forward, con baja latencia en los casos sin razonamiento (~0,2 s).

## Benchmarks y rendimiento

Resultados publicados en la Decision Index, edición 0.2.1 (0.2 suite, 151.034 peticiones de 44 benchmarks, panel de 38 benchmarks), a 26 de septiembre de 2026. Las puntuaciones son "skill" en %, normalizadas de modo que el azar puntúa 0:

| Sistema | Index | Raw | Knowledge & Reasoning | Language | Retrieval & Classification | Tools & Automation | Arts & Human Taste |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Surogate Rune v3, `thinking: true`** (bf16) | **59,2**\* | | 48,0 | 64,0 | 64,7 | 72,4 | 41,3 |
| Jev 1.13 | 57,89 | 68,08 | 51,3 | 62,0 | 55,4 | 75,1 | 37,7 |
| **Surogate Rune v3** (bf16) | 57,44 | 67,30 | 43,4 | 63,1 | 63,5 | 71,2 | 41,9 |
| AutoJev-27B | 56,40 | 66,89 | 40,9 | 63,5 | 54,9 | 79,3 | 39,4 |
| simple-jev (Qwen3.8-27B) | 55,74 | 66,26 | 36,6 | 62,1 | 63,2 | 76,2 | 36,5 |
| Decider chat (Qwen3.6-27B) | 51,35 | 63,06 | 37,0 | 57,1 | 52,2 | 71,4 | 35,1 |
| Winnow-12B (Q8_0) | 50,02 | 61,91 | 33,8 | 56,0 | 54,0 | 71,0 | 30,0 |
| JoshuaSP diffusiongemma (26B-A4B) | 49,47 | 61,28 | 32,7 | 53,5 | 58,4 | 70,2 | 26,7 |
| Jevfire | 49,37 | 61,63 | 30,5 | 53,3 | 56,2 | 72,3 | 32,2 |
| Decider 35B-A3B (NVFP4) | 47,11 | 59,72 | 31,8 | 55,5 | 54,7 | 56,5 | 32,6 |

\* Estimación del autor, aún no presente en el leaderboard: parte de las puntuaciones 0.2.1 del leaderboard para Rune v3 y aplica la variación que introdujo `thinking` en cada benchmark, medida en la ejecución completa con el scorer oficial 0.2 (el scorer 0.2.1 no es público). Reconstruidas del mismo modo, las filas publicadas de Rune v3 (57,44) y Jev 1.13 (57,89) coinciden exactamente.

En la edición anterior (0.2, 40 benchmarks, media simple de áreas), Rune v3 obtuvo 53,39, y 54,89 con `thinking`, frente a 51,67 de Jev 1.13. La edición 0.2.1 retira RouterBench y SGD del panel, pondera Knowledge & Reasoning y Language al 26 % cada una y Arts & Human Taste al 10 %, y reajusta cinco benchmarks. El índice cuenta las peticiones sin respuesta como incorrectas.

Ganancias de `thinking` en skill (suite 0.2 completa, scorer oficial 0.2): GSM8K +15,2, CRUXEval +11,4, CLadder +10,4, BBH +8,0, PhishNChips +5,1. ForecastBench, cuyas respuestas son probabilidades, pierde 9,8 puntos porque el razonamiento vuelve esas probabilidades más extremas.

Calibración (medida sobre los 33 benchmarks del Decision Index con respuesta correcta o incorrecta por campo, cada benchmark ponderado por igual):

| Temperatura de decisión | Precisión | Confianza media | ECE | Brier |
|---|---|---|---|---|
| 1 (por defecto) | 73,9 % | 86,4 % | 12,5 % | 0,385 |
| 2 | 73,9 % | 73,6 % | 2,2 % | 0,360 |

La temperatura solo modifica las probabilidades, nunca la opción elegida.

## Requisitos de hardware

Nota: la model card no publica cifras de VRAM, GPU concretas ni throughput; las estimaciones siguientes se derivan del número de parámetros y son orientativas.

- Inferencia en bf16: los 26,5B parámetros ocupan aproximadamente 53 GB de pesos, además de la caché KV para contextos largos (hasta 262k tokens).
- Cuantización GGUF (builds v1 del historial, sin detalle de cuantizaciones concretas): a Q8_0 el peso rondaría ~28 GB y a Q4_K_M ~16 GB, lo que permitiría su ejecución en GPUs de gama alta para consumidores (por ejemplo, una RTX 4090 de 24 GB con cuantizaciones de 4 bits).
- Despliegue recomendado: motor surogate con endpoint de decisiones; el autor indica que es el modo más rápido de servirlo. Para pesos GGUF, las alternativas habituales serían llama.cpp u Ollama (no confirmado explícitamente para esta versión).
- Latencia documentada: una pregunta sin razonamiento se responde en torno a 0,2 s; una pregunta con `thinking` tarda aproximadamente 5 s. La opción `--vision` debe activarse al arrancar el servidor para procesar imágenes.
- GPU recomendadas: no especificadas por el autor. Por tamaño, orientativamente se requerirían aceleradores con 48-80 GB de memoria (A100 80 GB, H100) para bf16 sin cuantizar, o GPUs de 24 GB con cuantización agresiva.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoría (modelos de decisión del panel de la Decision Index 0.2.1):

| Modelo | Índice (skill) | Raw | Knowledge & Reasoning | Tools & Automation | Licencia |
| --- | --- | --- | --- | --- | --- |
| Rune v3 (`thinking`) | 59,2 (estimado) | no disponible | 48,0 | 72,4 | Apache 2.0 |
| Jev 1.13 | 57,89 | 68,08 | 51,3 | 75,1 | no disponible |
| Rune v3 | 57,44 | 67,30 | 43,4 | 71,2 | Apache 2.0 |
| AutoJev-27B | 56,40 | 66,89 | 40,9 | 79,3 | no disponible |

Con 26,5B parámetros totales y 8/128 expertos activos, Rune v3 se sitúa en el rango de tamaño de AutoJev-27B y simple-jev (Qwen3.8-27B), superándolos en el índice global. Frente a Jev 1.13, que le supera ligeramente en el índice base (0,45 puntos), Rune v3 quedaría por delante con el modo `thinking` según la estimación del autor. Rune destaca en Retrieval & Classification (63,5) y Arts & Human Taste (41,9-41,3), mientras que Jev 1.13 y AutoJev-27B obtienen mejores puntuaciones en Tools & Automation. Los datos de licencia, contexto y formatos de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a cualquier modelo de decisión; el autor mitiga parcialmente este riesgo mediante probabilidades calibradas y el umbral de confianza de 0,7 que activa el modo `thinking`.
- Sobreconfianza en las probabilidades: a temperatura por defecto el ECE es del 12,5 % (precisión 73,9 % frente a confianza media 86,4 %); requiere usar temperatura 2 para probabilidades bien calibradas.
- El modo `thinking` no está disponible junto con imágenes.
- El razonamiento empeora tareas cuyas respuestas son probabilidades: ForecastBench pierde 9,8 puntos de skill con `thinking`.
- La latencia se multiplica por unas 25 veces cuando se activa el razonamiento (~5 s frente a ~0,2 s).
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero debe verificarse la procedencia del modelo base `google/gemma-4-26B-A4B-it` y sus condiciones.
- El repositorio se denomina `-GGUF`, pero la versión v3 aloja pesos bf16 safetensors; los builds GGUF corresponden a la v1 y solo están accesibles en revisiones anteriores del historial.
- La información de la model card está truncada al final (sección de imágenes), por lo que pueden faltar detalles de uso del modo visión.
- Las cifras de hardware del apartado anterior son estimaciones derivadas del tamaño, no medidas publicadas por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/surogate/rune-26b-a4b-GGUF
- Revisión con los builds GGUF de Rune v1: https://huggingface.co/surogate/rune-26b-a4b-GGUF/tree/2a155046d99949c8d8b413e213a78b4dc724dcb6
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Motor de entrenamiento y servicio surogate: https://github.com/invergent-ai/surogate
- Blog de lanzamiento: https://invergent.ai/blog/rune/
- Decision Index (leaderboard): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Web del autor: https://invergent.ai
