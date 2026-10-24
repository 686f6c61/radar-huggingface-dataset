# sparrow-decider/sparrow-nano-general

## Resumen

sparrow-nano-general (v1.1) es un modelo de decisión de propósito general de 2,2 MB desarrollado por el proyecto comunitario sparrow-decider, no vinculado a AWS ni a Strands. No es un modelo generativo: responde preguntas cerradas sobre un estado textual —sí/no (la API lo denomina `noul`), elección entre opciones (`choice`) y puntuación en una escala (`score`)— devolviendo probabilidades calibradas. Está afinado a partir de minishlab/potion-base-8M y se distribuye como artefacto propio: un fichero `.sparrow` de 2,2 MB para Python y un blob empaquetado SPB1 `.spb` de 2,53 MB para el runtime en C99.

Su relevancia está en el extremo opuesto a los LLM: ejecuta una decisión en 3,8 ms sobre un ESP32-S3 de 240 MHz (unos 10 dólares) y en 63,5 µs sobre un núcleo de Apple M4 Pro, sin GPU, sin red y sin servidor de modelos. Eso lo convierte en una pieza viable para enrutado de herramientas, gating de modelos grandes y triaje en dispositivos embebidos dentro de agentes y robótica.

La arquitectura es del tier "nano": embeddings estáticos con pooling seguidos de una MLP, es decir, sin atención y sin ventana de contexto en el sentido habitual. El modelo es solo para inglés, se publica bajo licencia Apache 2.0 y es el modelo por defecto del paquete `pip install sparrow-decider`. En el momento de la consulta el repositorio no registraba descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos con pooling + MLP (tier "nano"); sin atención |
| Parámetros totales | No disponible explícitamente; el modelo base es minishlab/potion-base-8M y el artefacto final pesa 2,2 MB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible / no aplica: los embeddings estáticos agrupan palabras sin orden, no hay ventana de contexto definida |
| Tipos de cuantización | Builds int8 con SIMD en ESP32-S3; opción de compilación `-DSPARROW_MAX_DIM=128` para reducir RAM en nano; blob empaquetado SPB1 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sparrow` (2,2 MB, runtime Python) y `.spb` (2,53 MB, blob SPB1 empaquetado para C99) |
| Dependencias | numpy en Python; C99 + libm, sin `malloc` en C |
| Plataformas | ESP32-S3, Raspberry Pi, portátil; componente ESP-IDF en C |
| Modelo base | minishlab/potion-base-8M (finetune) |
| Identificador de versión | `sparrow-nano-general-v1.1` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Sparrow Decider, que abarca desde 47 MB hasta unos pocos KB, y comparte las formas de pregunta y respuesta de Strands Decider. El tier nano combina embeddings estáticos (promediado de vectores de palabra, sin modelar el orden) con una MLP que produce la distribución sobre las opciones o la probabilidad de la respuesta binaria. No hay mecanismo de atención ni estado recurrente, lo que explica tanto el coste computacional (microsegundos en CPU, milisegundos en un MCU) como sus limitaciones semánticas.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en el material proporcionado. Sí se indica que deriva por finetune de minishlab/potion-base-8M y que se distribuye con dos artefactos empaquetados: el `.sparrow` para el runtime de Python y el `.spb` (SPB1) que el runtime en C lee en su sitio desde la flash del microcontrolador, sin asignación dinámica de memoria. La paridad numérica entre ambos runtimes está verificada: en host, el runtime en C coincide con numpy en 286/286 argmax con una diferencia máxima de probabilidad de 1e-6; en ESP32-S3, los builds int8 coinciden con el host en 150-155 de 155 decisiones, con discrepancias debidas a redondeo cerca de empates.

## Capacidades

- Decisión binaria sí/no (`sparrow_noul`), con probabilidad calibrada; un valor cercano a 0,5 debe interpretarse como "no lo sé".
- Elección entre un conjunto de opciones (`choice`), definidas en tiempo de inferencia con nombre y descripción, devolviendo opción, distribución de probabilidades y confianza.
- Puntuación ordinal sobre una escala definida por el usuario (`score`), por ejemplo `["can wait", "today", "now"]`.
- Múltiples preguntas simultáneas sobre el mismo estado textual: la API `d.ask(estado, {...})` acepta un diccionario con varias consultas y devuelve un resultado por cada una.
- Enrutado de herramientas e intenciones dentro de un agente (tool routing, gating de invocaciones).
- Ejecución en dispositivos sin GPU ni conectividad: ESP32-S3, Raspberry Pi y portátiles, con el mismo modelo.
- Interfaces de despliegue: API de Python, CLI (`sparrow-decider ask ...`), servidor HTTP (`sparrow-decider serve --port 8000`, `POST /v1/systemone`) y runtime C para ESP-IDF.
- No soporta generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio ni tool calling en el sentido de function calling generativo: su salida es una etiqueta con probabilidad, no una llamada estructurada.

## Casos de uso

- Enrutado de herramientas en agentes: dado un turno de usuario, decidir entre `weather`, `calendar`, `email` o `search` con `choice` y usar `confidence` como umbral para escalar al modelo grande. A 63,5 µs por decisión en un núcleo de portátil, el coste de enrutar es despreciable frente a la llamada al LLM.
- Gating de modelos grandes: preguntas del tipo "¿esto requiere el modelo de 70B?" o "¿basta una respuesta de plantilla?" para recortar coste por token, ejecutando el filtro en la misma máquina de aplicación sin servidor adicional.
- Triaje y urgencia de tickets: `score` con escala `["can wait", "today", "now"]` sobre el texto del ticket, para priorizar colas de soporte o alertas internas en milisegundos y por lotes.
- Robótica de bajo coste y sistemas embebidos: sobre un ESP32-S3 a 240 MHz, una decisión cuesta 3,8 ms con el blob leído desde flash sin `malloc`, lo que permite bucles de control que consultan al modelo en cada ciclo sin bloquear el sistema.
- Prefiltro en pipelines de voz o asistentes: clasificación gruesa de dominio antes de un ASR/NLU mayor, aceptando su precisión modesta (0,50 de dominio en MASSIVE en-US) como etapa de descarte barata.
- Microservicio de decisiones: exponer `POST /v1/systemone` en una red interna para que varios servicios consulten decisiones homogéneas (urgencia, categoría, sí/no) con un contrato HTTP común.
- Segunda opinión barata en dispositivos con batería: wearables o sensores que deben etiquetar texto corto localmente y solo transmitir cuando la confianza es baja, reduciendo tráfico y consumo.
- Evaluación comparativa de runtimes: usar la paridad documentada entre numpy y C (286/286 argmax, diferencia máxima 1e-6) para validar pipelines que deban migrar de prototipo en Python a firmware en C.

## Benchmarks y rendimiento

Datos publicados en `bench/RESULTS.md` y `site/facts.json` del proyecto; son ejecuciones locales, no puntuaciones de leaderboard.

| Benchmark | sparrow-nano-general v1.1 | Strands Decider 2B (público) |
|---|---:|---:|
| JevBench público, 231 tareas (proxy local v1.5) | 122/231 | No disponible |
| MASSIVE 1.1 en-US, 600 enunciados held-out (dominio) | 0,50 | 0,86 |
| MASSIVE 1.1 en-US, 600 enunciados held-out (intención) | 0,588 | 0,871 |
| RobotBench v0, 55 decisiones de robot escritas a mano | 32/55 | 40/55 |

| Métrica de velocidad | Valor (p50) |
|---|---:|
| ESP32-S3, 240 MHz, int8 SIMD | 3,8 ms por decisión (primer build on-chip: 9,6 ms) |
| Portátil, 1 núcleo Apple M4 Pro, runtime C | 0,06 ms (63,5 µs) |
| Portátil, 1 núcleo, numpy (RobotBench) | 0,21 ms |
| Portátil, 1 núcleo, numpy (JevBench) | 0,37 ms p50 / 4,64 ms p95 |
| RSS pico, numpy, ejecución JevBench | 52,2 MB |

Paridad entre runtimes: 286/286 argmax coincidentes en host con diferencia máxima de 1e-6; en ESP32-S3, 150-155 de 155 decisiones coinciden con el host en builds int8.

## Requisitos de hardware

- VRAM: no requiere GPU; 0 VRAM. La inferencia es enteramente en CPU o MCU.
- Espacio de almacenamiento: 2,2 MB (`.sparrow`) o 2,53 MB (`.spb`); el blob se lee en su sitio desde la flash en el runtime C.
- Memoria: el runtime C no usa `malloc` (contexto estático); `-DSPARROW_MAX_DIM=128` reduce a la mitad la RAM del tier nano. Con numpy, el RSS pico medido en JevBench es de 52,2 MB (dominado por el intérprete y numpy, no por el modelo).
- Hardware validado: ESP32-S3 a 240 MHz (3,8 ms por decisión), Raspberry Pi, portátil con Apple M4 Pro (63,5 µs con runtime C). No se documentan cifras para A100, H100 ni RTX 4090 porque el modelo no las necesita.
- GPU consumer: irrelevante; cabe en cualquier microcontroller con unos kilobytes de RAM libre y en cualquier SoC de placa única.
- Despliegue: `pip install sparrow-decider` (modelo incluido por defecto), CLI `sparrow-decider ask`, servidor HTTP `sparrow-decider serve --port 8000`, runtime C99 con un `.c` y un `.h` como componente ESP-IDF, y `python c/tools/pack.py` para convertir el `.sparrow` en un array C (`--header`, `--symbol`).
- Throughput y latencia: 0,06 ms por decisión en un núcleo M4 Pro con C implica del orden de decenas de miles de decisiones por segundo por núcleo; no se publican cifras de throughput agregado ni de concurrencia para el servidor HTTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sparrow-nano-general v1.1 | No disponible (artefacto de 2,2 MB) | No aplica (embeddings estáticos) | JevBench 122/231; MASSIVE 0,50/0,588; RobotBench 32/55 | Apache 2.0 | HuggingFace + pip + C |
| Strands Decider 2B | 2 000 M (según nombre) | No disponible | MASSIVE 0,86/0,871; RobotBench 40/55 | No disponible | Público; repo strands-labs/strands-decider |
| sparrow-nano-robot | No disponible (mismo tier nano) | No aplica | No disponible en esta información | No disponible | Recomendado por el autor para decisiones sobre números de sensores |
| Resto de tiers Sparrow Decider (hasta 47 MB) | No disponible | No disponible | El autor indica que el sí/no en JevBench está cerca del azar en todos los tiers | No disponible | GitHub del proyecto |

## Limitaciones y advertencias

- Los embeddings estáticos agrupan palabras sin modelar el orden: la negación y el razonamiento multi-paso son débiles por diseño. No debe usarse para juicios que requieran composición semántica.
- Lenguaje abierto alejado de sus datos de entrenamiento queda muy por detrás de un modelo de 2B: en MASSIVE en-US la brecha es de 0,50 frente a 0,86 en dominio y 0,588 frente a 0,871 en intención.
- El juicio sí/no en JevBench está cerca del azar en todos los tiers de la familia, según el propio autor. Un `noul` próximo a 0,5 significa "no lo sé" y debe tratarse como tal, no como una respuesta afirmativa o negativa suave.
- Solo inglés. No hay soporte declarado de otros idiomas ni de mezcla de idiomas.
- No debe ser el único mecanismo de seguridad en un sistema físico; la model card lo excluye explícitamente.
- Fuera de alcance: lenguaje abierto, razonamiento y decisiones sobre números de sensores (para eso el autor remite a sparrow-nano-robot).
- Riesgo de alucinación en el sentido de sobreconfianza en entradas fuera de distribución: las probabilidades son calibradas, pero el modelo no señala OOD de forma explícita, solo devuelve confianza.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto se declara no oficial y sin relación con AWS ni Strands; no hay garantías de mantenimiento, y en el momento de la consulta el repositorio tenía 0 descargas y 0 likes.
- La model card disponible está truncada en la sección de limitaciones (corta en "or use a full"), por lo que puede haber advertencias adicionales no recogidas aquí.
- La fecha de creación del repositorio en los metadatos (23 de octubre de 2026) es posterior a la consulta, lo que conviene verificar antes de citar el modelo como estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparrow-decider/sparrow-nano-general
- Repositorio del proyecto: https://github.com/sparrow-decider/sparrow-decider
- Resultados de benchmarks: https://github.com/sparrow-decider/sparrow-decider/blob/main/bench/RESULTS.md
- Datos de hechos publicados: https://github.com/sparrow-decider/sparrow-decider/blob/main/site/facts.json
- Guía de despliegue en ESP32-S3: https://github.com/sparrow-decider/sparrow-decider/blob/main/docs/quickstart/esp32.md
- Runtime en C: https://github.com/sparrow-decider/sparrow-decider/tree/main/c/sparrow
- Modelo base: https://huggingface.co/minishlab/potion-base-8M
- Modelo hermano para decisiones sobre sensores: https://huggingface.co/sparrow-decider/sparrow-nano-robot
- Proyecto Strands Decider (referencia de formatos de pregunta/respuesta): https://github.com/strands-labs/strands-decider
- Búsqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos corresponden a otros usos del término "sparrow" (ave, diccionarios, empresas homónimas) y no guardan relación con el modelo.
