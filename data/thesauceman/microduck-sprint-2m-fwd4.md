# TheSauceman/microduck-sprint-2m-fwd4

## Resumen

microduck-sprint-2m-fwd4 es una politica de control (policy) de aprendizaje por refuerzo entrenada para el robot cuadrupedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo de proposito general: es un controlador de locomocion que consume una observacion de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en bucle de forma perpetua hasta que se le indique lo contrario. Se distribuye en formato ONNX, con el normalizador de observaciones ya integrado en el propio fichero, de modo que el robot puede alimentarlo con observaciones en crudo.

El modelo lo publica el usuario TheSauceman en HuggingFace, con un repositorio de tamano practicamente nulo, coherente con una red de politica de dimensiones reducidas. La model card lo describe como una marcha (gait) que se carga en una ranura de politica del demonio `robotctl` del microduck. La innovacion principal respecto a iteraciones anteriores de la misma tarea es de recompensa y regularizacion: patas espejadas, penalizacion por giro, suavizado mas agresivo, mayor libertad en caderas y rodillas y perturbaciones de entrenamiento para mejorar la estabilidad, lo que elevo la velocidad objetivo alcanzada de 0,65 a 0,85 metros por segundo.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de politicas de locomocion con mjlab (MuJoCo + stack de RL), con instrucciones exactas de reproduccion (commit, semilla, checkpoint) y un manifiesto compatible con el ecosistema de politicas del microduck. No hay informacion publica sobre licencia, idiomas ni benchmarks estandar, y los resultados de busqueda web disponibles no contienen datos utiles sobre este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de control entrenada con aprendizaje por refuerzo (no se especifica la topologia interna); inferencia via ONNX |
| Parametros totales | no disponible (el repositorio ocupa menos de 0,1 GB, compatible con una red pequena) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; admite una observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

Se trata de una politica de control para robotica entrenada mediante aprendizaje por refuerzo, no de un transformer ni de un modelo de lenguaje. La tarea se identifica como `Mjlab-Sprint2m-MicroDuck`, lo que apunta a un pipeline basado en mjlab (entorno de simulacion fisica) sobre la base `mjlab-microduck 0.1.0` en el commit `8d0dbc94c`. La interfaz del controlador esta fijada: 61 dimensiones de observacion como entrada, 14 acciones como salida y una frecuencia de control de 50 Hz. El normalizador de observaciones esta embebido en el fichero ONNX, por lo que la politica espera observaciones sin preprocesar.

El entrenamiento se realizo con 4096 entornos en paralelo durante un maximo de 3000 iteraciones, semilla 1, con TensorBoard como logger, sobre el repositorio `SteveTarter/microduck-challenges` en la rama `main`, commit `e3f7d04cd`, checkpoint 2750. La model card documenta explicitamente que el proceso no es reproducible bit a bit: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una politica comparable, pero no identica. En cuanto a las decisiones de diseno, la descripcion menciona patas espejadas y una penalizacion por giro para mantener la trayectoria recta, un suavizado mas flojo y articulaciones de cadera y rodilla con mayor rango para permitir zancadas mas amplias, perturbaciones ("shoves") durante el entrenamiento para ganar robustez, y una recompensa mucho mayor por alcanzar la velocidad objetivo, que es lo que explica la mejora de 0,65 a 0,85 m/s. No se detalla la composicion del dataset (al ser RL, la experiencia se genera por simulacion) ni el uso de RLHF o DPO, que no aplican en este contexto.

## Capacidades

- Locomocion cuadrupeda continua: genera una marcha estable a una velocidad objetivo de 0,85 m/s.
- Ejecucion perpetua: la politica esta disenada para correr indefinidamente hasta que se detenga de forma explicita, no para episodios acotados.
- Mantenimiento de rumbo: las patas espejadas y la penalizacion por giro reducen la deriva lateral y favorecen el avance en linea recta.
- Robustez ante perturbaciones: el entrenamiento con empujes busca estabilidad frente a empujones externos.
- Control a 50 Hz: ciclo de control de 20 ms, adecuado para un bucle de control en tiempo real.
- Entrada de observaciones en crudo: el normalizador esta integrado en el ONNX, sin necesidad de preprocesado externo.
- Integracion con el demonio `robotctl`: se carga como politica en una ranura mediante `robotctl policy load`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio, generacion de texto ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Locomocion base del microduck: cargar la politica en una ranura con `sudo robotctl policy load <slot> TheSauceman/microduck-sprint-2m-fwd4` para que el robot camine de forma continua a velocidad objetivo.
- Pruebas de velocidad maxima del chasis: usar esta politica como referencia de "sprint" para medir el rendimiento mecanico del robot a 0,85 m/s frente a politicas mas conservadoras.
- Validacion de robustez en banco de pruebas: aplicar empujes controlados al robot y comprobar la recuperacion, dado que el entrenamiento incluyo perturbaciones de este tipo.
- Trayectorias rectas en pasillo: gracias a la penalizacion por giro y a las patas espejadas, es adecuada para desplazamientos en linea recta sobre superficies planas donde la deriva lateral es critica.
- Benchmark interno de politicas: comparar esta marcha con otras politicas del mismo repositorio (`microduck-challenges`) bajo identicas condiciones de simulacion y semilla.
- Reproduccion de experimentos de RL: replicar el entrenamiento con el comando documentado para estudiar el efecto de la recompensa de velocidad y del suavizado sobre la marcha resultante.
- Base para ajuste fino o curricula: emplear el checkpoint 2750 como punto de partida para tareas derivadas (giros, terrenos irregulares, cambios de velocidad).

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que ademas no aplican a un modelo de control. El unico dato cuantitativo publicado es la velocidad alcanzada por la politica, comparada con la iteracion anterior de la misma tarea:

| Metrica | Valor |
|---|---|
| Velocidad objetivo alcanzada | 0,85 m/s |
| Velocidad en la iteracion previa | 0,65 m/s |
| Entornos de entrenamiento | 4096 en paralelo |
| Iteraciones maximas | 3000 |
| Checkpoint publicado | 2750 |
| Frecuencia de control | 50 Hz |

No hay tabla comparativa con otras politicas publicada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un ONNX de repositorio inferior a 0,1 GB, es plausible que la inferencia quepa en memoria de sistema sin GPU dedicada, pero no hay cifra publicada.
- GPU recomendadas: no disponibles. No hay requisitos publicados ni evidencia de que se necesite GPU para inferencia.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el formato ONNX permite ejecucion en CPU, lo que en principio evita la necesidad de una GPU de consumo.
- Opciones de despliegue: ONNX Runtime como via principal, integrado en el demonio `robotctl` del microduck. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: el bucle de control corre a 50 Hz (20 ms por paso), pero no se publica el tiempo de inferencia por paso ni el throughput del modelo.
- Entrenamiento: el comando documentado usa 4096 entornos en paralelo, lo que implica un coste de simulacion elevado; no se especifica el hardware empleado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TheSauceman/microduck-sprint-2m-fwd4 | Politica RL (ONNX) | no disponible | 61-D obs / 14 acciones | 0,85 m/s | no disponible | HuggingFace |
| Otras politicas de `SteveTarter/microduck-challenges` | Politica RL | no disponible | interfaz microduck | no disponible | no disponible | repositorio GitHub |
| Politicas de referencia de Pollen Robotics para microduck | Politica RL | no disponible | interfaz microduck | no disponible | no disponible | repositorio GitHub |

No se dispone de datos publicos de rendimiento, tamano o licencia de las alternativas como para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia en el repositorio, no hay autorizacion explicita de uso comercial ni de redistribucion; hay que contactar con el autor antes de cualquier uso productivo.
- Rendimiento ligado al simulador: la politica se entreno en simulacion (mjlab) y no se documenta su comportamiento en el robot fisico ni el gap sim-a-real.
- Sin datos de generalizacion: no se publica rendimiento en terrenos irregulares, pendientes, superficies deslizantes ni ante cargas externas distintas de los empujes de entrenamiento.
- Sensibilidad a la velocidad objetivo: la recompensa esta fuertemente sesgada hacia alcanzar la velocidad de sprint, lo que puede reducir el control fino a velocidades bajas.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento no es bit-reproducible; los pesos no se pueden regenerar exactamente.
- Interfaz fija: solo funciona con la observacion de 61 dimensiones y las 14 acciones del microduck; no es reutilizable en otros robots sin reentrenamiento.
- Ausencia de documentacion sobre sesgos: no aplica en el sentido habitual de los modelos de lenguaje, pero tampoco hay analisis de fallos ni de condiciones de borde.
- Version y fecha: la model card indica creacion en 2026-10-15, con base `mjlab-microduck 0.1.0`; futuras versiones del demonio o del manifiesto (esquema 2) podrian romper la compatibilidad.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheSauceman/microduck-sprint-2m-fwd4
- Repositorio de retos y entrenamiento: https://github.com/SteveTarter/microduck-challenges
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Documentacion del manifiesto de politicas (`docs/policy-manifest.md` en el repositorio del demonio `robotctl`), referenciada en la model card: no se dispone de URL directa en la informacion proporcionada.
- No se han encontrado papers, blogs ni demos adicionales sobre este modelo en los resultados de busqueda disponibles.
