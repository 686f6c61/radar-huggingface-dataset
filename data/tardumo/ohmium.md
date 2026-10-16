# tardumo/Ohmium

## Resumen

Ohmium no es un modelo de lenguaje en el sentido convencional: es un sistema multiagente determinista orientado a la mejora de codigo, publicado por el usuario tardumo en HuggingFace bajo el identificador `tardumo/Ohmium`. La model card lo describe como una "deterministic code-improvement network" en la que componentes de agente acotados proponen cambios y trabajadores independientes reproducen la evidencia antes de que la red acepte una nueva generacion. No se publican pesos, arquitectura neuronal ni parametros, por lo que no debe confundirse con un modelo de inferencia al uso.

El repositorio contiene la interfaz de navegador, un servicio Core HTTP, un CLI de worker, la ruta de ejecucion en Docker, la capa de persistencia, reglas de verificacion, tests de integracion y la configuracion de despliegue. El proyecto se articula en torno a un "Genesis Circuit" con ocho roles oficiales (Sense, Filter, Measure, Guard, Route, Memory, Archive y Verify) que se registran en el Core y operan con limites de recursos explicitos.

La relevancia actual del proyecto radica en su propuesta de reproducibilidad verificable: una mutacion de codigo solo se acepta como nueva generacion del lineage si dos verificadores independientes reproducen el benchmark en contenedores Docker aislados sin red y las mediciones se mantienen dentro de una ventana de deriva del cinco por ciento. Aunque el repositorio esta alojado en HuggingFace, su naturaleza es la de un framework de agentes y no la de un modelo con pesos entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sistema multiagente determinista (Core HTTP + worker CLI); no es una red neuronal |
| Parametros totales | no disponible (no aplica; el repositorio declarado ocupa 0.0 GB y no contiene pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizables) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No se trata de una arquitectura transformer, MoE, SSM ni hibrida. Segun la informacion proporcionada, Ohmium es un sistema distribuido con un componente Core que actua como orquestador y multiples workers con roles acotados. El Core publica trabajo, autentica componentes, registra reclamaciones, compara mediciones y confirma mutaciones al lineage solo tras la reproduccion independiente. La persistencia se implementa con JSON atomico y la ejecucion de tareas se realiza en contenedores Docker sin red, con capacidades Linux reducidas y limites de PID, CPU y memoria. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el objeto no es un modelo entrenado.

La innovacion tecnica declarada es el flujo de verificacion por consenso: el autor de una optimizacion debe enviar un patch cuyo digest coincida con su contenido, y dos workers registrados deben replicar el baseline y el candidato en contenedores aislados. Ambas mediciones deben permanecer dentro de la ventana de deriva configurada del cinco por ciento; un replay fallido rechaza la mutacion y devuelve la tarea a la cola. Ademas, los secretos de registro se almacenan unicamente como digests SHA-256 y las comparaciones de credenciales son timing-safe.

## Capacidades

- Orquestacion de un circuito de agentes con ocho roles oficiales (Sense, Filter, Measure, Guard, Route, Memory, Archive y Verify).
- Registro y autenticacion de workers mediante secretos almacenados como digests SHA-256.
- Publicacion de trabajo y descubrimiento de tareas por parte de los workers.
- Recoleccion de telemetria por heartbeat: CPU de proceso, memoria RSS, uso de heap, uptime, numero de verificaciones completadas y numero de fallos.
- Verificacion reproducible de mutaciones de codigo mediante dos verificadores independientes en sandboxes Docker sin red.
- Validacion de digests de patch y separacion entre autor y verificador.
- Persistencia en JSON atomico con estado de runtime privado excluido del servido estatico.
- Transporte mediante REST y Server-Sent Events.
- Limitacion de peticiones por direccion y limites estrictos del cuerpo de las peticiones.
- Interfaz web con vistas de Circuit, Treasury y Deploy, y un indice de codigo fuente en tiempo de build.
- Soporte de agente unico y de sistema multiagente segun las etiquetas del repositorio.
- No se declaran capacidades de generacion de texto, razonamiento, codigo generativo, matematicas, vision, audio ni tool calling en el sentido de un LLM.

## Casos de uso

- Auditoria reproducible de parches: un equipo puede integrar el flujo autor/verificador para aceptar cambios en un repositorio solo cuando dos contenedores aislados reproducen las mediciones del baseline y del candidato dentro de la ventana de deriva.
- CI/CD con verificacion por consenso: sustituir o complementar pipelines tradicionales con un mecanismo que exige dos replays independientes antes de promover una mutacion al lineage.
- Monitorizacion de flota de agentes: la telemetria por heartbeat (CPU, RSS, heap, uptime, verificaciones y fallos) permite observar el estado real de cada worker y su historial acotado de 36 muestras.
- Investigacion reproducible: el proyecto encaja en flujos academicos que requieren trazabilidad estricta entre la propuesta de cambio, el digest del patch y la evidencia de verificacion.
- Benchmarking determinista: la carpeta `benchmarks/` y `genesis/` permite inspeccionar el primer proof publico, el patch unificado exacto y los tests asociados.
- Registro y despliegue de workers propios: un operador puede registrar identidades adicionales al margen de los ocho roles oficiales y verlas integradas en el mismo registro del Core.
- Endurecimiento de ejecucion en entornos hostiles: el uso de contenedores sin red y con capacidades Linux reducidas sirve como patron para ejecutar codigo no confiable con limites de PID, CPU y memoria.
- Monitorizacion de integridad de estado: la persistencia en JSON atomico y la separacion de estado privado resultan utiles en sistemas que requieren consistencia fuerte ante reinicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una carpeta `benchmarks/` y un "Genesis optimization" reproducible, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K ni equivalentes) en los datos proporcionados.

| Metrica | Valor |
|---|---|
| Benchmarks de LLM | no disponible |
| Throughput declarado | no disponible |
| Latencia declarada | no disponible |
| Ventana de deriva de verificacion | 5 por ciento (segun la model card) |
| Historial de telemetria por maquina | 36 muestras |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el sistema no publica pesos ni requiere GPU para su funcionamiento basico segun la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica, dado que no se distribuye un modelo con pesos.
- Runtime declarado: Node.js 20 o superior, con cero dependencias de runtime.
- Ejecucion de tareas: Docker con sandbox sin red y limites de PID, CPU y memoria.
- Opciones de despliegue: servicio Core HTTP con REST y Server-Sent Events, CLI de worker, y contenedores Docker para la evaluacion y verificacion.
- Latencia y throughput: no disponible.
- Requisitos de red: el sandbox de Docker opera sin red; la comunicacion con el Core se realiza a traves de sus endpoints HTTP.

## Comparativa con modelos similares

No disponible. Ohmium no es un modelo de lenguaje ni un modelo de pesos, por lo que no existe una comparativa directa con modelos de la misma categoria en terminos de parametros, contexto o rendimiento. Como referencia de categoria, podria situarse junto a frameworks de agentes y orquestacion reproducibilidad (por ejemplo, sistemas de CI verificable o redes multiagente), pero la informacion proporcionada no incluye alternativas concretas con las que comparar cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tardumo/Ohmium | no disponible (no es un LLM) | no disponible | no disponible | no disponible | repositorio HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican pesos, arquitectura neuronal ni parametros, por lo que no puede utilizarse como modelo de inferencia de lenguaje.
- No hay licencia declarada en la model card, lo que impide determinar las condiciones de uso comercial o de redistribucion.
- El repositorio figura con 0.0 GB de tamano y 0 descargas, lo que sugiere un estado inicial o contenido no distribuido a traves de HuggingFace.
- La model card advierte de que el proyecto parte de un "honest empty state": no se crean agentes, tareas, proofs, balances de tesoreria, metricas de token ni registros de actividad sinteticos para presentacion. Esto implica que la actividad mostrada sera nula hasta que existan workers reales registrados.
- El sistema depende de Docker con configuracion especifica (sin red, capacidades reducidas, limites de PID, CPU y memoria); entornos sin Docker o con politicas restrictivas no podran ejecutar el flujo de verificacion.
- La verificacion exige una ventana de deriva del cinco por ciento entre baseline y candidato, lo que puede rechazar mutaciones legitimas en sistemas con alta varianza de medicion.
- No se declaran sesgos ni riesgos de alucinacion al no ser un modelo generativo, pero tampoco se documentan auditorias de seguridad mas alla del endurecimiento de contenedores y credenciales.
- No se especifican idiomas soportados ni cobertura multilingue de la interfaz o documentacion.
- La fecha de creacion indicada (2026-10-15) y la de actualizacion (2026-10-15) resultan inusuales respecto al momento habitual de publicacion, lo que conviene verificar en la fuente original.
- No hay informacion sobre mantenimiento, versionado, roadmap ni soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/tardumo/Ohmium
- Red en vivo: https://ohmium.fun/
- Cuenta de X: https://x.com/ohmiumacc
- Espejo de codigo fuente en HuggingFace: https://huggingface.co/tardumo/Ohmium
- Repositorio referenciado por el badge de release: https://github.com/nuttumrunit/Ohmium
