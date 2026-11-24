# srv-sngh/jugnu-1.0

## Resumen

Jugnu 1.0 es un modelo de decisión y clasificación de texto de pequeno tamano (149 M de parametros) desarrollado por Sourav Singh en Sourav AI Labs. No es un modelo generativo: recibe un texto, una pregunta y una lista de opciones, y devuelve una de las opciones (o "ninguna") junto con una puntuacion de confianza. Su funcion es actuar como un enrutador rapido y ligero que permite a una aplicacion tomar decisiones de clasificacion muchas veces por segundo sin coste de generacion de texto.

Tecnicamente parte del encoder `Alibaba-NLP/gte-modernbert-base` (Apache 2.0), al que el autor anade una capa de decision propia, un formato de entrada especifico y un entrenamiento supervisado para tareas de zero-shot classification. Esta disenado para escenarios de enrutamiento de mensajes, deteccion de prompt injection, moderacion de contenido, clasificacion de intenciones y seleccion de herramientas, entre otros. Su ventana de entrada es de 2.048 tokens y cada opcion puede tener hasta 32 tokens, con soporte probado de hasta 77 opciones en una sola llamada.

Su relevancia actual reside en la combinacion de latencia muy baja (decenas de milisegundos), huella de memoria reducida (unos 2,1 GB en servicio) y capacidad de ejecutarse en CPU, Apple Silicon (MPS) o CUDA. Frente a alternativas generativas de mayor tamano, ofrece una relacion coste/rendimiento atractiva para tareas de decision acotadas, a costa de limitarse al ingles y de no generar texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT) con capa de decision anadida; base `Alibaba-NLP/gte-modernbert-base` |
| Parametros totales | 149 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de texto; hasta 32 tokens por opcion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,3 GB con pesos y runtime `jugnu_runtime`) |

## Arquitectura y entrenamiento

Jugnu se construye sobre el encoder `gte-modernbert-base`, un transformer de tipo ModernBERT orientado a embeddings y recuperacion. Sobre esa base, el autor anade una capa de decision y un formato de entrada propio que permite formular la tarea como una eleccion entre opciones en lenguaje natural o como una pregunta de si/no. El modelo no genera texto: produce una etiqueta, un indice y puntuaciones de confianza, ademas de un valor `p_none` que estima la probabilidad de que ninguna opcion encaje.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que el autor elimino de los conjuntos de evaluacion los items que aparecian en los datos de entrenamiento antes de puntuar, lo que sugiere un entrenamiento supervisado sobre datos publicos de clasificacion (entre ellos Banking77 y MASSIVE). Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal mas alla de lo que aporta la arquitectura ModernBERT subyacente.

## Capacidades

- Clasificacion zero-shot con un numero arbitrario de opciones en lenguaje natural (probado con hasta 77 opciones en una sola llamada).
- Respuesta de si/no sobre un texto con una pregunta en lenguaje natural (`yes_no`).
- Deteccion de prompt injection: identificar si un texto intenta sobrescribir las instrucciones de un asistente.
- Deteccion de jailbreak.
- Moderacion de contenido: clasificacion de toxicidad (con rendimiento inferior a alternativas generativas en este aspecto).
- Enrutamiento de mensajes a equipos o agentes (por ejemplo, Billing, Delivery, Account).
- Clasificacion de intenciones (intents) en dominios como banca o asistencia al cliente.
- Seleccion de herramientas (tool picking) entre un conjunto de opciones descritas en texto.
- Deteccion de spam.
- Comprobacion de relevancia para RAG: si un pasaje responde a una pregunta dada.
- Capacidad de devolver "ninguna opcion" cuando ninguna encaja, con umbral configurable (`allow_none`).
- No soporta generacion de texto, vision, audio ni razonamiento multi-paso autonomo.

## Casos de uso

- Enrutamiento de tickets de soporte: usar `choose` con opciones como Billing, Delivery y Account para dirigir cada mensaje al equipo correcto. La latencia de decenas de milisegundos permite procesar cada mensaje entrante en tiempo real.
- Deteccion de prompt injection en produccion: aplicar `yes_no` sobre cada entrada de usuario antes de pasarla a un LLM generativo, preguntando si el texto intenta sobrescribir las instrucciones del asistente. El modelo obtuvo 76,3 en esta tarea segun la model card.
- Clasificacion de intenciones bancarias: elegir entre las 77 intenciones de Banking77 en una sola llamada, con un resultado de 89,4 reportado por el autor.
- Moderacion de mensajes en comunidades o chats: preguntar si un mensaje es toxico o abusivo antes de publicarlo, aunque con menor rendimiento que modelos generativos en esta tarea (67,7 frente a 80,2 de SemIf).
- Seleccion de herramientas en un agente: dado un mensaje del usuario y una lista de herramientas descritas en texto, elegir cual puede resolver la peticion (por ejemplo, "schedule a meeting").
- Filtro de spam en formularios o correo: `yes_no` sobre mensajes con premios o promociones para marcarlos como spam.
- Comprobacion de relevancia en pipelines RAG: pasar el pasaje recuperado como texto y preguntar si responde a la consulta del usuario, descartando contextos irrelevantes antes de la generacion.
- Despliegue en dispositivos con recursos limitados: ejecucion en CPU o Apple Silicon con unos 2,1 GB de memoria, adecuada para aplicaciones de escritorio o edge que necesitan decisiones continuas sin GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las cifras de Jugnu se obtuvieron con opciones repetidas en un Mac mini; Laya 0.4.11 se muestra con sus ajustes por defecto anteriores y SemIf corresponde a Qwen3.5-4B en modo `direct`.

| Tarea | Jugnu | Laya 0.4.11 | SemIf |
|---|---|---|---|
| Parametros | 149 M | 421 M | 4 B |
| Descarga | ~288 MB | 1,4 GB por checkpoint | no disponible |
| Velocidad, texto de 100 tokens, 4 opciones repetidas | 22,6 ms | 46 ms | no disponible |
| Velocidad, texto de 500 tokens, 10 opciones repetidas | 61,0 ms | 117 ms | no disponible |
| Banking77, 77 intenciones en una llamada | 89,4 | 57,1 | no admite mas de 16 opciones |
| MASSIVE intent, 20 opciones | 91,0 | 76,6 | no admite mas de 16 opciones |
| Prompt injection | 76,3 | 67,5 | 64,9 |
| Toxicidad | 67,7 | 56,1 | 80,2 |
| Jailbreak | 89,9 | 70,7 | 88,8 |

Segun el autor, frente a SemIf en ocho tareas cotidianas Jugnu gana en prompt injection y clasificacion de topicos, empata en cuatro y pierde en toxicidad y verificacion de hechos. No se detallan en la informacion disponible los conjuntos de test concretos ni los intervalos de confianza completos.

## Requisitos de hardware

- Memoria en servicio: aproximadamente 2,1 GB segun la model card.
- Descarga: unos 288 MB (repo de 0,3 GB con pesos y runtime).
- GPU recomendadas: no se especifican modelos concretos; el autor indica soporte para CUDA, Apple Silicon (MPS) y CPU.
- Cabe en GPU de consumo: si, dado su tamano de 149 M de parametros; cualquier GPU con suficiente VRAM para 2,1 GB de memoria en servicio es suficiente.
- Opciones de despliegue: runtime propio `jugnu_runtime` (instalable via `pip install ./jugnu-1.0.0`), servidor Krill con endpoint HTTP `/v1/decide`, y descarga mediante `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 22,6 ms para texto de 100 tokens con 4 opciones y 61,0 ms para 500 tokens con 10 opciones en un Mac mini; 37 ms tipicos conviviendo con dos modelos de chat y un modelo de voz en el mismo equipo.
- Throughput: no disponible de forma explicita; la latencia por llamada permite varias decisiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Banking77 | Prompt injection | Toxicidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Jugnu 1.0 | 149 M | 2.048 tokens | 89,4 | 76,3 | 67,7 | Apache 2.0 | Hugging Face |
| Laya 0.4.11 | 421 M | no disponible | 57,1 | 67,5 | 56,1 | no disponible | Descarga publica |
| SemIf (Qwen3.5-4B, modo `direct`) | 4 B | no disponible | no admite >16 opciones | 64,9 | 80,2 | no disponible | no disponible |

Jugnu destaca por menor tamano y latencia, mayor numero de opciones por llamada y mejor rendimiento en clasificacion de intenciones y prompt injection. SemIf, al ser un modelo generativo de 4 B, obtiene mejor resultado en toxicidad pero no puede manejar mas de 16 opciones por llamada. Laya 0.4.11 queda por debajo en la mayoria de las tareas comparadas segun los datos del autor.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- No genera texto: cualquier caso de uso que requiera explicaciones o respuestas abiertas necesita un modelo generativo adicional.
- Sensibilidad a la formulacion de la pregunta: la model card advierte explicitamente que Jugnu es sensible a como se redacta la pregunta, lo que puede degradar el rendimiento si no se cuida el prompt.
- Rendimiento inferior a modelos generativos en moderacion de toxicidad (67,7 frente a 80,2 de SemIf) y en verificacion de hechos.
- Los benchmarks son los reportados por el propio autor; no se dispone de evaluaciones independientes ni de intervalos de confianza completos en la informacion proporcionada.
- Riesgo de alucinacion: al no generar texto, el riesgo se traslada a falsos positivos o negativos en la clasificacion; conviene calibrar umbrales con datos propios, especialmente en `yes_no`.
- Limite de 2.048 tokens de entrada y 32 tokens por opcion; textos mas largos deben truncarse o dividirse.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base `gte-modernbert-base` tambien es Apache 2.0, por lo que no se identifican restricciones adicionales.
- El ecosistema de despliegue es limitado: el runtime propio y Krill son las opciones documentadas; no hay soporte declarado para vLLM, llama.cpp u Ollama.
- Modelo con muy pocas descargas (6) y sin likes en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/srv-sngh/jugnu-1.0
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- Sourav AI Labs: https://souravailabs.ai
- Repositorio Krill: https://github.com/srvsngh99/Krill
