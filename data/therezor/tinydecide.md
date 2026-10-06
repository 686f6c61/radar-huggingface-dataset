# TheREZOR/TinyDecide

## Resumen

TinyDecide es un modelo de decisión de tipo encoder, desarrollado por TheREZOR (Roman REZOR), que no genera texto: lee un mensaje y devuelve probabilidades calibradas para cualquier número de preguntas formuladas en inglés en el momento de la llamada. Se apoya en el discriminador de google/electra-small-discriminator y responde a cuatro tipos de pregunta tipificados: elección entre opciones, sí/no, puntuación en una escala y extracción de fragmentos. Al ser un encoder, una única pasada resuelve todas las preguntas simultáneamente, lo que lo hace muy eficiente en comparación con modelos generativos.

Su relevancia actual radica en el tamaño: la build de 4 bits publicada pesa alrededor de 6,2 MB y ocupa unos 10,4 millones de parámetros, mientras que la versión en precisión completa ronda los 13,8 millones. Esto permite ejecutarlo en un ESP32-S3 con 8 MB de flash y sin PSRAM (por ejemplo, una M5Stack Cardputer), además de en navegador, Node, Python y Rust. El autor declara que la build de 10,4 M obtendría el primer puesto entre las entradas de menos de 100 M parámetros del Decision Index, aunque se trata de una puntuación autoevaluada y no de una entrada listada en el ranking.

El modelo está pensado para clasificación zero-shot y extracción de información en inglés, con licencia Apache 2.0, y se distribuye con cuatro motores de inferencia que reproducen los mismos ficheros de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder discriminativo, derivado de google/electra-small-discriminator |
| Parametros totales | 13,8 M (precision completa); 10,4 M (build de 4 bits publicada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (build publicada) y precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario propio (.bin) acompanado de metadatos meta.json; no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer discriminativo basado en ELECTRA-small, reutilizado como cabezal de decisión en lugar de como generador. El modelo no produce tokens: para cada consulta devuelve una distribución de probabilidad sobre las respuestas candidatas. Soporta cuatro modalidades de pregunta: `choice` (entre 2 y 32 opciones, con `probs`, `pick` y `confidence`), `noul` (afirmación de sí/no, con la probabilidad `p` de ser verdadera), `score` (escala ordenada, con `probs` y `score` entre 0 y 1) y `span` (extracción de un fragmento, con `text` y `p_present`). Una sola pasada del encoder responde simultáneamente a todas las preguntas de una petición, lo que reduce el coste frente a plantear cada pregunta como una tarea independiente.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí indica que el autor calibra el modelo expresamente y que la build de 4 bits reproduce las respuestas de la versión en precisión completa. El motor JavaScript es la referencia de la implementación y coincide con PyTorch con un error de 3e-6; los motores Python (numpy), Rust y ESP32-S3 se validan contra él mediante un conjunto de conformidad que incluye 288 cadenas de tokenizador en varios sistemas de escritura y 84 peticiones que cubren los cuatro tipos de pregunta, varias preguntas por petición, correcciones y entradas mal formadas.

## Capacidades

- Clasificación de intención: asignar un mensaje a una de entre 2 y 32 etiquetas definidas por el usuario (aplicación, skill, categoría).
- Preguntas booleanas: comprobar afirmaciones tipo "el mensaje es urgente" devolviendo una probabilidad.
- Puntuación en escala: valorar tono, prioridad o sentimiento en niveles definidos por el usuario, con salida normalizada entre 0 y 1.
- Extracción de entidades por span: extraer horas, importes, nombres o lugares de un mensaje.
- Ejecución multi-pregunta en una sola pasada del encoder.
- Clasificación zero-shot: las preguntas y las opciones se escriben en inglés en tiempo de inferencia, sin reentrenamiento.
- No genera texto: la salida son probabilidades y etiquetas, no lenguaje natural.
- Idiomas: solo inglés.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutado de comandos de voz o chat: decidir a qué aplicación o skill corresponde un mensaje (por ejemplo, `restaurants` con p = 0,97 sobre un texto de reserva de mesa) antes de disparar la acción correspondiente.
- Clasificación de bandeja de entrada: ordenar correos o mensajes según spam, urgencia y tipo de contenido usando varias preguntas `choice` y `noul` en una sola llamada.
- Extracción de campos: obtener hora, importe, nombre o lugar de un mensaje con la pregunta `span`, útil para prellenar formularios o registrar eventos.
- Puntuación de tono o prioridad: valorar el sentimiento o la urgencia en una escala definida por el producto, con salida calibrada entre 0 y 1.
- Asistentes embebidos sin conexión: desplegar el modelo en un ESP32-S3 (8 MB de flash, sin PSRAM) para que un dispositivo portátil clasifique mensajes localmente, sin servidor ni clave de API.
- Aplicaciones de privacidad estricta en navegador: ejecutar el modelo en el cliente mediante el motor JavaScript, de forma que los mensajes no salgan del dispositivo.
- Gobernanza de contenidos ligeros: clasificar mensajes por categoría antes de enrutarlos a sistemas más costosos, actuando como filtro previo de bajo coste.
- Preprocesado de pipelines de datos: etiquetar grandes volúmenes de mensajes cortos en inglés con varios criterios a la vez, aprovechando que una única pasada resuelve todas las preguntas.

## Benchmarks y rendimiento

| Metrica | TinyDecide 10,4 M (4 bits) | TinyDecide 13,8 M (precision completa) |
|---|---|---|
| Decision Index | 5,77 | 6,31 |
| Decision Index por millon de parametros | 0,55 | No disponible |

El autor compara estas cifras con ocho modelos mayores del Decision Index, cuyo rango de puntuación va de 1,38 a 5,07. La mejor entrada del tablero comparable en eficiencia por parámetro registra 0,052 frente a los 0,55 de TinyDecide. Los líderes del tablero son modelos de 26 000 a 31 000 millones de parámetros que rondan los 57 puntos. Estas puntuaciones son autoevaluadas y no constituyen una entrada listada en el ranking. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: viable incluso en microcontroladores; el modelo entero ocupa alrededor de 6,2 MB en la build de 4 bits.
- ESP32-S3: cabe en los 8 MB de flash sin PSRAM, como en la M5Stack Cardputer.
- GPU: no se documentan requisitos de GPU; el tamaño hace irrelevante el uso de aceleradores dedicados.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo, e incluso sin GPU.
- Opciones de despliegue: motores propios en JavaScript (navegador y Node 22 o superior), Python con numpy, Rust y ESP32-S3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyDecide (4 bits) | 10,4 M | No disponible | 5,77 (autoevaluado) | Apache 2.0 | HuggingFace |
| TinyDecide (precision completa) | 13,8 M | No disponible | 6,31 (autoevaluado) | Apache 2.0 | HuggingFace |
| google/electra-small-discriminator (modelo base) | ~13,8 M | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Lideres del Decision Index | 26 000-31 000 M | No disponible | ~57 | No disponible | No disponible |

No se dispone de datos comparativos con alternativas de la misma categoría (modelos de decisión pequeños) más allá de las cifras del propio tablero. El resto de entradas comparables figuran como "no disponible".

## Limitaciones y advertencias

- Solo inglés: el modelo no está entrenado para otros idiomas, aunque el conjunto de conformidad del tokenizador cubra varios sistemas de escritura.
- No genera texto: no sirve para tareas de generación, resumen ni diálogo libre.
- Sensibilidad al enunciado: al depender de preguntas y opciones escritas en tiempo de inferencia, la formulación exacta de las etiquetas puede alterar los resultados.
- Calibración autoevaluada: las cifras del Decision Index proceden del propio autor, no de una entrada verificada en el ranking.
- Riesgo de alucinación en extracción: el tipo `span` devuelve `p_present`, por lo que conviene umbralar la confianza antes de aceptar un fragmento extraído.
- Sesgos: la información disponible no documenta sesgos específicos ni la composición del dataset de entrenamiento, por lo que no puede evaluarse su comportamiento en dominios sensibles.
- Licencia: el modelo se publica bajo Apache 2.0, sin restricciones declaradas para uso comercial en esta ficha. Hay que tener en cuenta que otros recursos del mismo autor (por ejemplo, el modelo embebido del proyecto cardputer-ai) heredan CC BY-NC-SA 4.0, por lo que conviene revisar el NOTICE.md de cada repositorio antes de reutilizar componentes.
- Producción: se desconoce la longitud de contexto soportada, la latencia y el throughput, datos necesarios para dimensionar despliegues en servidor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheREZOR/TinyDecide
- Playground (Space): https://huggingface.co/spaces/TheREZOR/TinyDecide-Playground
- Perfil del autor: https://huggingface.co/TheREZOR/models
- Repositorio cardputer-ai: https://github.com/therezor/cardputer-ai
- Releases de cardputer-ai: https://github.com/therezor/cardputer-ai/releases
- Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
