# sparrow-decider/sparrow-micro-general

## Resumen

sparrow-micro-general es un modelo de decision de 7,6 MB desarrollado por el proyecto comunitario sparrow-decider. No genera texto: responde tres tipos de pregunta sobre un estado textual dado, concretamente si/no (`noul`), eleccion de una opcion entre varias (`choice`) y puntuacion en una escala (`score`), devolviendo probabilidades calibradas. Su nombre completo con version es `sparrow-micro-general-v1.1` y pertenece al tier micro de la familia Sparrow Decider, que abarca desde 47 MB hasta unos pocos KB.

Tecnicamente no es un transformer generativo, sino un clasificador construido sobre embeddings estaticos: parte de potion-base-8M de MinishLab (vocabulario completo, 256 dimensiones), aplica mean-pooling a los vectores de estado, pregunta y opcion, y pasa el resultado por un MLP que puntua cada opcion. El modelo se ha destilado de un checkpoint Strands Decider 4B sobre unas 430.000 decisiones y se distribuye con matrices en int8 con escala por fila.

Su relevancia esta en el coste: 0,22 ms por decision en un solo nucleo de portatil con el runtime en C, sin malloc y con dependencias minimas (numpy en Python, C99 + libm en C). Esta pensado para enrutado de herramientas, gating y decisiones de urgencia en Raspberry Pi, sistemas empotrados y pipelines de agentes donde no cabe ni tiene sentido invocar un LLM. Es un proyecto comunitario no oficial, sin relacion con AWS ni con Strands, y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estaticos potion-base-8M (256 dimensiones) con mean-pooling de estado, pregunta y opcion, mas un MLP que puntua cada opcion contra el estado y la pregunta |
| Parametros totales | no disponible; el checkpoint ocupa 7,6 MB (`.sparrow`) y 8,88 MB (blob SPB1), y el modelo base se denomina potion-base-8M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no hay ventana de contexto autoregresiva, la entrada es un texto de estado, una pregunta y un conjunto de opciones |
| Tipos de cuantizacion | int8 con escala por fila en las matrices; no se documentan otros formatos |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (los pesos derivados de potion-base-8M conservan la licencia MIT de MinishLab) |
| Formato de pesos | `.sparrow` (Python, 7,6 MB) y `.spb` (blob SPB1 empaquetado para el runtime en C, 8,88 MB) |
| Dimension de embedding | 256 (`SPARROW_MAX_DIM` por defecto en el runtime C) |
| Tarea declarada (pipeline) | text-classification |
| Tipos de decision | `noul` (si/no), `choice` (elegir una opcion), `score` (puntuar en una escala) |
| Libreria y runtime | paquete `sparrow-decider` (Python + numpy) y runtime C99 con libm, sin malloc |
| Hardware objetivo | Raspberry Pi y portatil (CPU) |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

El modelo es un clasificador de decisiones, no un generador. Sobre los embeddings estaticos de potion-base-8M (vocabulario completo, 256 dimensiones) se calculan vectores medios para el estado, la pregunta y cada opcion; un MLP puntua cada opcion comparandola simultaneamente contra el estado y la pregunta. El resultado se interpreta segun el tipo de decision: probabilidad de `true` en `noul`, distribucion sobre opciones en `choice` y valor escalar calibrado en `score`. Las matrices se comprimen a int8 con una escala por fila, lo que explica el tamano final de 7,6 MB.

El entrenamiento combina una mezcla general de decisiones con decisiones de robot generadas, usando exclusivamente filas de tasksource marcadas para uso comercial (cada fuente conserva su propia licencia). El modelo se destila de un checkpoint Strands Decider 4B: los objetivos son 50% senal del profesor y 50% etiquetas gold, sobre aproximadamente 430.000 decisiones, con calibracion de temperatura por tipo de pregunta. La model card reporta paridad numerica entre el runtime C y numpy en 586 de 586 argmaxes, con una diferencia maxima de probabilidad de 3e-6.

## Capacidades

- Decisiones booleanas (`noul`) con probabilidad calibrada; un valor cercano a 0,5 se interpreta como "no lo se".
- Eleccion entre opciones (`choice`) comparando cada opcion contra el estado y la pregunta; es el caso de uso del ejemplo de enrutado de herramientas (calendario, correo, busqueda, meteo).
- Puntuacion en escala (`score`) con calibracion por tipo de pregunta.
- Enrutado de dominio en ingles: 0,635 de acierto en dominio MASSIVE 1.1 en-US (600 enunciados held-out), por encima de los tiers nano (0,50-0,518).
- Decisiones sobre estados estructurados tipo clave-valor en texto (por ejemplo, lecturas de sensores volcadas como lineas `motor_temp_c: 96`).
- Ejecucion en CPU sin GPU: 0,22 ms por decision con el runtime C en un nucleo.
- Integracion como paso previo o filtro barato antes de un LLM mayor, o como arbitro en bucles de agente.
- No soporta tool calling generativo, agentes multi-paso por si mismo, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutado de herramientas en agentes: dado el turno del usuario, `choice` selecciona que herramienta invocar (calendario, correo, busqueda, meteo) con una latencia de 0,22 ms, lo que permite resolver el enrutado antes de gastar una llamada al LLM grande.
- Gating de urgencia en robotica de bajo coste: sobre un estado textual con lecturas de sensores, `noul` responde a preguntas como "esta el motor sobrecalentado?" y `score` ordena la severidad; encaja en una Raspberry Pi por su consumo de memoria y su carencia de dependencias pesadas.
- Triaje de tickets o correo entrante: clasificacion si/no y seleccion de categoria sobre el asunto y el cuerpo, executada en el propio servidor o en el dispositivo sin enviar datos a un tercero.
- Filtro previo en pipelines de atencion al cliente: descarta o deriva conversaciones antes de un modelo generativo, reduciendo el numero de invocaciones caras.
- Decisiones offline en dispositivos empotrados: el runtime C99 sin malloc y el blob `.spb` permiten integrar el modelo en firmware o utilidades de sistema con un binario de 8,88 MB.
- Control de calidad en CI: comprobaciones deterministas de clasificacion en tests automatizados, con paridad numerica verificada entre las implementaciones Python y C.
- Enrutado de dominio en asistentes de voz o texto en ingles: elegir el dominio de una utterance antes de aplicar un modelo especializado.
- Experimentacion e investigacion: linea base de destilacion de decisiones para comparar con el profesor Strands Decider 4B o con los tiers superiores de Sparrow.

## Benchmarks y rendimiento

Resultados publicados en `bench/RESULTS.md` y `site/facts.json` del repositorio, medidos en un nucleo de Apple M4 Pro. No son puntuaciones de leaderboard y el tier micro no se ha medido en microcontrolador.

| Benchmark | sparrow-micro-general v1.1 | Strands Decider 2B (publico) |
|---|---:|---:|
| MASSIVE 1.1 en-US, 600 enunciados held-out (dominio) | 0,635 | 0,86 |
| MASSIVE 1.1 en-US, 600 enunciados held-out (intencion) | 0,542 | 0,871 |
| JevBench publico, 231 tareas (proxy local v1.5) | 117/231 | no disponible |
| RobotBench v0, 55 decisiones de robot escritas a mano | 30/55 | 40/55 |

| Entorno de ejecucion | Tiempo por decision (p50) |
|---|---:|
| Portatil, 1 nucleo, runtime C | 0,22 ms (217 us) |
| Portatil, 1 nucleo, numpy (RobotBench) | 0,38 ms |
| Portatil, 1 nucleo, numpy (JevBench) | 0,6 ms p50 / 4,93 ms p95 |
| RSS pico con numpy en la ejecucion de JevBench | 99,4 MB |

Paridad entre runtimes: el runtime C coincide con numpy en 586/586 argmaxes, con una diferencia maxima de probabilidad de 3e-6.

## Requisitos de hardware

- No requiere GPU: el modelo se ejecuta en CPU, un solo nucleo es suficiente.
- Memoria: 99,4 MB de RSS pico con la implementacion numpy en JevBench; el runtime C no usa malloc y trabaja con buffers estaticos (tamano no publicado). El blob empaquetado ocupa 8,88 MB.
- Cabe en cualquier GPU de consumo (RTX 4090, etc.) por tamano, pero no hay soporte de inferencia en GPU ni tiene sentido usarla.
- Plataformas validadas: portatil (medido en Apple M4 Pro) y Raspberry Pi (soporte declarado). El rendimiento en microcontrolador no se ha medido.
- Despliegue: `pip install sparrow-decider` para Python con numpy; runtime C99 en `c/sparrow` con `#include "sparrow.h"` y `SPARROW_MAX_DIM` por defecto a 256. Carga por nombre dejando el fichero en `~/.cache/sparrow-decider/` o en una ruta de `$SPARROW_MODELS`.
- No hay soporte para vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo y no publica pesos en GGUF ni safetensors.
- Throughput implicito: a 0,22 ms por decision en un nucleo, el limite practico son miles de decisiones por segundo y nucleo, sin contar el coste de serializacion de la entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MASSIVE dominio / intencion | RobotBench v0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sparrow-micro-general v1.1 | no disponible (7,6 MB, embeddings 256-d + MLP) | no aplica | 0,635 / 0,542 | 30/55 | Apache-2.0 | HuggingFace |
| Strands Decider 2B | 2B (por denominacion) | no disponible | 0,86 / 0,871 | 40/55 | no disponible en la informacion | publico |
| sparrow-nano-robot | no disponible (tier nano, vocabulario podado) | no aplica | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| potion-base-8M (modelo base) | ~8M por denominacion, no confirmado en la ficha | no aplica | no disponible | no disponible | MIT | HuggingFace |

Frente a los tiers nano de la misma familia, micro sacrifica tamano (7,6 MB frente a un rango de 47 MB a pocos KB en la familia) a cambio del vocabulario completo y mejor enrutado de dominio. Frente al profesor Strands Decider 4B y al Decider 2B, la diferencia de calidad en lenguaje abierto es grande (0,635 frente a 0,86 en dominio MASSIVE), que es el compromiso explicito del diseno. Para decisiones que dependen de numeros de sensores, la propia model card remite a sparrow-nano-robot, que si incorpora pooling de numeros clave-valor.

## Limitaciones y advertencias

- Los embeddings estaticos agrupan palabras sin orden: la negacion y el razonamiento multi-paso son debiles por construccion.
- Lenguaje abierto fuera de la distribucion de entrenamiento queda muy por detras del modelo de 2B (0,635 frente a 0,86 en dominio MASSIVE; 0,542 frente a 0,871 en intencion).
- El juicio si/no en JevBench esta cerca del azar en todos los tiers de Sparrow; una salida `noul` proxima a 0,5 debe leerse como "no lo se", no como una respuesta.
- No hay pooling de numeros clave-valor: las decisiones que dependen de valores de sensores concretos no son fiables con este tier.
- Solo ingles; la normalizacion de texto es exacta para alfabetos latinos.
- El modelo sugiere decisiones: la model card prohibe explicitamente usarlo como unico mecanismo de seguridad en un sistema fisico.
- Sesgos: no se documenta una evaluacion de sesgos en la informacion disponible; el entrenamiento usa filas de tasksource marcadas para uso comercial, con las licencias de cada fuente.
- Licencia Apache-2.0 para el modelo, pero los pesos derivados de potion-base-8M arrastran la MIT de MinishLab, cuyos avisos deben conservarse; conviene revisar `LICENSE`, `NOTICE` y `LICENSE-potion-base-8M.txt` antes de un uso comercial.
- Proyecto comunitario no oficial: no es un producto de AWS ni de Strands, sin garantias de soporte ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparrow-decider/sparrow-micro-general
- Repositorio del proyecto: https://github.com/sparrow-decider/sparrow-decider
- Resultados de benchmarks (`bench/RESULTS.md`): https://github.com/sparrow-decider/sparrow-decider/blob/main/bench/RESULTS.md
- Informe de investigacion (`research/REPORT.md`): https://github.com/sparrow-decider/sparrow-decider/blob/main/research/REPORT.md
- Guia del runtime C: https://github.com/sparrow-decider/sparrow-decider/blob/main/docs/quickstart/c.md
- Codigo del runtime C (`c/sparrow`): https://github.com/sparrow-decider/sparrow-decider/tree/main/c/sparrow
- Datos de referencia del sitio: `site/facts.json` (ruta relativa indicada en la model card)
- Modelo base potion-base-8M: https://huggingface.co/minishlab/potion-base-8M
- Model2Vec (MinishLab): https://github.com/MinishLab/model2vec
- Strands Decider (formatos de pregunta y respuesta equivalentes): https://github.com/strands-labs/strands-decider
- sparrow-nano-robot (alternativa con pooling numerico): https://huggingface.co/sparrow-decider/sparrow-nano-robot
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre este modelo; los unicos resultados fueron referencias al ave Passer domesticus, traducciones del termino y servicios homonimos sin relacion.
