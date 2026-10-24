# sparrow-decider/sparrow-tiny-general

## Resumen

sparrow-tiny-general es un modelo de decisión de 17,9 MB construido sobre el encoder bidireccional Ettin 32M (jhu-clsp/ettin-encoder-32m). No genera texto libre: responde preguntas cerradas sobre un estado de texto en tres formatos: sí/no (`noul`), elección entre opciones (`choice`) y puntuación en una escala (`score`), devolviendo probabilidades calibradas. Lo desarrolla sparrow-decider, un proyecto comunitario no oficial (no es un producto de AWS ni de Strands) que mantiene una familia de deciders desde 47 MB hasta unos pocos KB.

Su relevancia está en el coste de inferencia: 23 ms por decisión en un solo núcleo de portátil (Apple M4 Pro) ejecutando únicamente Python y numpy, con un pico de memoria de 604,6 MB. Eso lo sitúa en el nicho de enrutado de herramientas y clasificación de intenciones en edge (portátil, Raspberry Pi), donde un LLM de 2B-4B es demasiado caro en latencia o memoria.

Dentro de la propia familia Sparrow es el tier con mejor puntuación publicada en JevBench (123/231), aunque el autor advierte que sigue lejos de un 2B en lenguaje abierto y que es débil en decisiones robóticas y en el enrutado de dominios de MASSIVE. Es, por tanto, una pieza de plomería para agentes, no un sustituto de un modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Ettin 32M + cabeza pointer (una sola pasada forward) |
| Parametros totales | no disponible (encoder base de 32M; fichero de pesos de 17,9 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (un unico fichero `.sparrow` de 17,9 MB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (los pesos base Ettin se distribuyen bajo MIT) |
| Formato de pesos | `.sparrow` (runtime propio `sparrow-decider`, Python + numpy) |
| Tarea declarada | `text-classification` (decision: `noul`, `choice`, `score`) |
| Modelo base | jhu-clsp/ettin-encoder-32m (finetune) |
| Tamano del repositorio | 0,0 GB (fichero principal de 17,9 MB) |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es un encoder bidireccional Ettin de 32M de parametros con una cabeza pointer añadida. Cada opción candidata recibe un logit calculado como producto escalar escalado entre el estado medio del encoder sobre los tokens `<answer>` y el estado medio sobre el span de esa opción. Una sola pasada forward responde la pregunta completa, sin decodificacion autoregresiva, lo que explica los 23 ms por decisión y el hecho de que el runtime sea unicamente Python con numpy en los tiers de encoder.

El entrenamiento parte de los pesos Ettin y usa un mix general de decisiones; solo se utilizaron filas de tasksource marcadas para uso comercial, y cada fuente conserva su propia licencia. El modelo se destila desde un checkpoint de Strands Decider 4B con objetivos mixtos al 50% profesor y 50% gold, con calibracion de temperatura por tipo de pregunta (`noul`, `choice`, `score`). Los prompts (estados, preguntas y opciones numeradas) se renderizan exactamente igual que en Strands Decider, de modo que ambos comparten formas de entrada y salida.

## Capacidades

- Decisiones de eleccion entre opciones (`choice`) con probabilidades calibradas, por ejemplo seleccionar qué herramienta debe invocar un agente.
- Decisiones booleanas (`noul`) con umbral calibrado; un valor cercano a 0,5 equivale a "no lo sé".
- Puntuacion en escala (`score`) sobre un estado de texto.
- Procesamiento de texto en inglés con sensibilidad al orden de las palabras (el autor lo recomienda cuando el orden importa mas que en los tiers estaticos).
- Enrutado de herramientas y clasificacion de intenciones de una sola pasada, apto para bucles de agente.
- Ejecucion en CPU sin GPU: runtime Python/numpy, sin runtime en C para los tiers de encoder.
- Integracion via CLI (`sparrow-decider --model tiny-general`) y API Python (`Decider.load()` / `d.ask()`).
- No soporta generacion de texto libre, visión, audio ni razonamiento multi-paso explicito.

## Casos de uso

- Enrutado de herramientas en agentes: dado el mensaje del usuario y un conjunto de herramientas con criterios textuales, el modelo devuelve cuál invocar en 23 ms; el ejemplo de la model card resuelve una pregunta sobre el tiempo en París hacia `weather` frente a `calendar`, `email` o `search`.
- Triage de tickets y correo: clasificar cada mensaje entrante en categorías (facturación, soporte técnico, cancelación) antes de asignarlo a una cola, con una latencia por debajo del umbral perceptible en un flujo humano.
- Enrutado de intenciones en asistentes de voz o IVR embebidos: el modelo corre en Raspberry Pi y numpy puro, sin dependencias nativas, y devuelve la intención con un `choice` sobre un catálogo cerrado (0,592 de accuracy de intención en MASSIVE 1.1 en-US, 600 enunciados held-out).
- Etiquetado masivo offline: a ~43 decisiones por segundo y núcleo (1/0,023 s), permite clasificar corpus medianos con coste energético mínimo frente a un LLM generativo.
- Guardarraíl de bajo coste en pipelines de agentes: comprobar si una acción propuesta encaja con la intención declarada antes de ejecutarla, como capa adicional (nunca como único mecanismo de seguridad).
- Selección de siguiente paso en automatizaciones ligeras: elegir entre "leer calendario", "enviar correo" o "buscar en la web" en función del estado textual de la conversación.
- Componente de decisión en robótica de hobby: pese a su debilidad medida (20/55 en RobotBench v0), sirve para decisiones de selección no críticas; el autor recomienda `sparrow-nano-robot` para ese dominio.
- Sustituto de clasificadores clásicos en entornos sin GPU: cuando un modelo de 2B no cabe en el dispositivo pero se necesita una decisión semantica sobre texto corto en inglés.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en un núcleo de Apple M4 Pro (no son puntuaciones de leaderboard).

| Benchmark | sparrow-tiny-general-v1.0 | Strands Decider 2B (público) |
|---|---|---|
| JevBench público, 231 tareas (proxy local v1.5) | 123/231 | no disponible |
| MASSIVE 1.1 en-US, 600 enunciados held-out, dominio | 0,368 | 0,86 |
| MASSIVE 1.1 en-US, 600 enunciados held-out, intención | 0,592 | 0,871 |
| RobotBench v0, 55 decisiones de robot escritas a mano | 20/55 | 40/55 |

| Medida de velocidad | Valor |
|---|---|
| Tiempo por decisión (p50) | 23 ms |
| JevBench p50 / p95 | 22,59 ms / 124,0 ms |
| RobotBench, tiempo por pregunta | 19,81 ms |
| Pico de RSS en la ejecución de JevBench | 604,6 MB |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con numpy. El consumo relevante es RAM: pico de 604,6 MB en la ejecución de JevBench.
- GPU: no necesaria ni soportada por el runtime publicado; no hay backend CUDA, vLLM, TGI ni llama.cpp documentado para este formato `.sparrow`.
- Cabe en cualquier equipo consumer: portátil convencional, Apple M4 Pro (medición de referencia) y Raspberry Pi según la model card.
- Despliegue: `pip install sparrow-decider`, descarga del fichero con `huggingface_hub` o `hf download`, y carga con `Decider.load(path)` o por nombre desde `~/.cache/sparrow-decider/` o `$SPARROW_MODELS`.
- Latencia: 23 ms p50 por decisión (22,59 ms p50 y 124,0 ms p95 en JevBench); 19,81 ms por pregunta en RobotBench.
- Throughput estimado: ~43 decisiones por segundo por núcleo, derivado de la latencia p50 (cálculo propio, no publicado).
- El pico de 0,6 GB de RSS es notablemente superior a lo que sugiere un fichero de 17,9 MB; hay que presupuestarlo en dispositivos con poca memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench | MASSIVE (dom./int.) | RobotBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sparrow-tiny-general | encoder 32M (fichero 17,9 MB) | no disponible | 123/231 | 0,368 / 0,592 | 20/55 | Apache-2.0 | HuggingFace, runtime Python/numpy |
| Strands Decider 2B | ~2B | no disponible | no disponible | 0,86 / 0,871 | 40/55 | Apache-2.0 (proyecto Strands) | público, requiere más cómputo |
| Strands Decider 4B (profesor) | ~4B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | usado como profesor en la destilación |
| sparrow-nano-robot | no disponible (familia de 47 MB a pocos KB) | no disponible | no disponible | no disponible | recomendado por el autor para robots | Apache-2.0 (familia Sparrow) | HuggingFace |
| Ettin encoder 32M | 32M | no disponible | no aplica | no aplica | no aplica | MIT | HuggingFace (modelo base) |

## Limitaciones y advertencias

- Inglés únicamente; no hay soporte multilingüe declarado.
- El juicio sí/no en JevBench está cerca del azar en todos los tiers de Sparrow; un `noul` próximo a 0,5 debe interpretarse como "no lo sé", no como una respuesta utilizable.
- Enrutado de dominio débil: 0,368 en MASSIVE 1.1 en-US, muy por debajo del 0,86 de Strands Decider 2B.
- Decisiones robóticas flojas (20/55 en RobotBench v0 frente a 40/55 del 2B); el autor recomienda `sparrow-nano-robot` para ese uso.
- El lenguaje abierto alejado de sus datos de entrenamiento queda claramente por detrás del 2B.
- Fuera de alcance: microcontroladores (usar un tier nano) y ser el único mecanismo de seguridad en un sistema físico.
- Pico de memoria de ~0,6 GB con el runtime numpy, desproporcionado respecto al tamano del fichero.
- Formato propietario `.sparrow` y runtime propio: no hay soporte conocido en vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración en stacks estándar.
- Licencia Apache-2.0 para el modelo, pero los pesos base Ettin son MIT con su propio aviso de copyright en `LICENSE-ettin.txt`; hay que conservar ambas atribuciones.
- Proyecto comunitario no oficial, sin relación con AWS ni con Strands; descargas y likes a fecha de la información: 0, sinvalidacion externa.
- Repositorio de 0,0 GB en HuggingFace y fecha de creación 2026-10-23: conviene verificar que el fichero de pesos está realmente subido antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparrow-decider/sparrow-tiny-general
- Repositorio del proyecto: https://github.com/sparrow-decider/sparrow-decider
- Resultados de benchmarks: https://github.com/sparrow-decider/sparrow-decider/blob/main/bench/RESULTS.md
- Datos de referencia del sitio: https://github.com/sparrow-decider/sparrow-decider/blob/main/site/facts.json
- Informe de investigación: https://github.com/sparrow-decider/sparrow-decider/blob/main/research/REPORT.md
- Issues: https://github.com/sparrow-decider/sparrow-decider/issues
- Discusiones: https://github.com/sparrow-decider/sparrow-decider/discussions
- Modelo base Ettin 32M: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Familia de encoders Ettin (JHU CLSP): https://huggingface.co/jhu-clsp
- Strands Decider (profesor y formato de prompt): https://github.com/strands-labs/strands-decider
- Tier recomendado para robótica: https://huggingface.co/sparrow-decider/sparrow-nano-robot
- Contacto del autor: vivek@sparrowdecider.com
- Paper: no disponible
- Demo: no disponible
