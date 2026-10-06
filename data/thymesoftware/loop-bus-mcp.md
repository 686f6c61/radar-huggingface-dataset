# thymesoftware/loop-bus-mcp

## Resumen

loop-bus es un servidor MCP (Model Context Protocol) local desarrollado por thymesoftware que permite que dos o más sesiones de agentes de IA deliberen entre sí como pares, mediante un protocolo por rondas y un registro append-only. No se trata de un modelo de lenguaje: es una pieza de infraestructura que orquesta la conversación entre agentes, sean cuales sean los modelos que los alimenten. El repositorio se publica bajo licencia Apache 2.0 y, en el momento de la consulta, acumula 0 descargas y 1 like en HuggingFace.

El sistema expone un único endpoint HTTP MCP en `http://127.0.0.1:8765/mcp` al que se conectan todos los agentes participantes. La deliberación sigue un protocolo de rondas fijo: `blind` → `critique` → `rebuttal` → `synthesis` → `experiment` → `closed`. Durante la fase `blind`, las herramientas de lectura ocultan los planes de los pares para el participante indicado, de modo que cada agente formula su propuesta sin ver la del resto.

Su relevancia actual radica en que es agnóstico respecto al proveedor e incluye soporte para LLM locales. Cualquier cliente compatible con MCP, o un wrapper propio que conecte un modelo a las herramientas del bus, puede participar. Toda la información se almacena en SQLite en modo append-only y un humano puede leer e intervenir desde `http://127.0.0.1:8765/`. El servidor nunca toca Git.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: servidor MCP escrito en Python (no es un modelo de lenguaje) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la informacion proporcionada; las instrucciones MCP y el prompt de wake por defecto estan en ingles, pero el contenido de los mensajes puede usar cualquier idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |
| Version de Python requerida | Python 3.12 o superior |
| Endpoint MCP | HTTP en `http://127.0.0.1:8765/mcp` (puerto configurable) |
| Almacenamiento | SQLite append-only |
| Numero de participantes | No fijo; dos o mas (tres o mas funciona) |

## Arquitectura y entrenamiento

No hay entrenamiento ni pesos asociados: loop-bus no es un modelo. Se distribuye como una aplicacion Python 3.12+ que se ejecuta con `python run.py` (o directamente `server/loop_bus.py`) dentro de un entorno virtual creado con `venv` y `pip`. El proceso levanta un servidor HTTP MCP, gestiona el protocolo por rondas y persiste el transcript en una base de datos SQLite en modo append-only. Los ficheros de configuracion (`config/`) y el estado (`state/`) quedan fuera de Git mediante `.gitignore`.

El roster de participantes no esta codificado de forma fija; se resuelve por prioridad: primero la variable de entorno `LOOPBUS_AGENTS` (lista separada por comas), despues la clave `"agents"` de `config/bus.json`, despues los autores ya presentes en la base de datos del transcript (ruta de compatibilidad) y, por ultimo, los valores por defecto `agent_a, agent_b`. Si una fuente explicita esta presente pero mal formada, el servidor sale con error en lugar de caer silenciosamente a los valores por defecto. Al arrancar, imprime siempre los nombres adoptados y su procedencia. Los nombres no pueden estar vacios, duplicados, ni ser `human`, `system` o `all`, ni contener comas o NUL. El mecanismo `wait()` realiza long-polling para que los agentes intercambien turnos sin intervencion humana dentro de un mismo turno, sujeto a los limites descritos en la guia de waking (`WAKE.en.md`).

## Capacidades

- Deliberacion multiagente por rondas con fases diferenciadas: `blind`, `critique`, `rebuttal`, `synthesis`, `experiment` y `closed`.
- Ocultacion de planes de los pares durante la fase `blind` para el participante indicado, mediante herramientas de lectura.
- Long-polling con `wait()` para permitir intercambio de turnos sin humano en medio dentro de un mismo turno.
- Registro append-only en SQLite de toda la conversacion, consultable e intervenible por una persona en la interfaz web local.
- Roster configurable y escalable a tres o mas participantes, resuelto por variable de entorno, fichero de configuracion o base de datos del transcript.
- Neutralidad de proveedor: cualquier cliente compatible con MCP o wrapper propio puede participar, incluidos modelos locales servidos por un runtime de inferencia local.
- Modo `--stdio` para un unico cliente, con diagnostico por stderr; el modo compartido requiere un unico servidor HTTP.
- Personalizacion de las instrucciones de inicializacion MCP mediante `instructions_file` en `config/bus.json`.
- Configuracion por variables de entorno al arrancar `server/loop_bus.py` directamente: `LOOPBUS_DB`, `LOOPBUS_HOST`, `LOOPBUS_PORT`, `LOOPBUS_CONFIG`, `LOOPBUS_AGENTS`, `LOOPBUS_WAKE_CONFIG`, `LOOPBUS_MAX_BODY`, `LOOPBUS_MAX_FREE`, `LOOPBUS_WAKE`.
- Cambio de puerto con `python run.py --port <puerto>`.
- No realiza ninguna operacion sobre Git: no toca repositorios ni permisos de control de versiones.

## Casos de uso

- Deliberacion entre agentes heterogeneos: conectar un agente basado en un modelo en la nube y otro servido localmente al mismo endpoint MCP para que contrasten propuestas en las fases `blind` y `critique`, aprovechando la neutralidad de proveedor del bus.
- Revision por pares de planes tecnicos: usar la fase `blind` para que cada agente redacte su plan sin conocer el del otro y despues someterlo a `critique` y `rebuttal`, obteniendo una sintesis final en la fase `synthesis`.
- Experimentacion colaborativa: aprovechar la fase `experiment` para que los participantes propongan y contrasten pruebas concretas sobre un problema compartido, con el transcript registrado en SQLite como evidencia.
- Auditoria humana de conversaciones multiagente: al ser el registro append-only y existir una interfaz web en `http://127.0.0.1:8765/`, un operador puede leer la deliberacion completa e intervenir en cualquier momento sin alterar el historial.
- Orquestacion de LLM locales en un equipo de trabajo: un programa propio que llame a una API de inferencia local y lea/escriba el bus puede actuar como participante, lo que permite montar deliberaciones sin coste de API externa.
- Investigacion sobre protocolos de consenso entre agentes: el protocolo fijo por rondas y la resolucion configurable del roster permiten reproducir experimentos con distintos numeros de participantes (dos, tres o mas) y comparar resultados.
- Integracion en pipelines de agentes con MCP: conectar clientes MCP ya existentes (los ejemplos incluidos usan Claude Code y Codex CLI) al bus para habilitar flujos de trabajo con varios agentes sobre una misma base de datos de estado.
- Pruebas de comportamiento cooperativo frente a competitivo: la ocultacion de planes en `blind` frente a la exposicion posterior permite estudiar como cambian las respuestas de un mismo modelo segun el contexto social del turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. loop-bus no es un modelo de lenguaje, por lo que metricas como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se proporcionan mediciones de latencia o throughput del servidor MCP.

## Requisitos de hardware

- El servidor del bus en si no requiere GPU: es un proceso Python 3.12+ que depende de los paquetes de `requirements.txt` y persiste estado en SQLite.
- Entorno de ejecucion: Python 3.12 o superior con `venv` y `pip`. Los comandos de ejemplo usan `.venv/bin/python` en Linux/macOS y `.venv\Scripts\python.exe` en Windows.
- Cada participante necesita, por su parte, un cliente MCP o un worker que conecte el modelo al bus, ademas del acceso al modelo elegido. `pip install -r requirements.txt` solo instala las dependencias Python del bus; no instala clientes de modelo, aplicaciones de escritorio, runtimes de inferencia ni pesos.
- El modo de waking (WAKE) requiere que el ejecutable configurado en el campo `command` de cada participante este instalado en la maquina que ejecuta el bus y listo para funcionar sin configuracion interactiva. Debe estar en el `PATH` del proceso del bus o usar ruta absoluta en `command[0]`.
- Los ejemplos incluidos usan Claude Code y Codex CLI, que deben instalarse por separado y autenticarse antes de habilitar WAKE, verificando con `claude --version` o `codex --version`.
- No se proporcionan estimaciones de VRAM, GPU recomendadas, latencia ni throughput para el bus en la informacion disponible. La VRAM necesaria dependera exclusivamente del modelo o modelos que se conecten como participantes.

## Comparativa con modelos similares

No disponible. loop-bus no es un modelo de lenguaje, sino un servidor MCP de orquestacion de deliberacion multiagente, por lo que no procede compararlo con modelos de parametros o contexto comparables. En la informacion proporcionada no se citan alternativas equivalentes de orquestacion entre agentes.

## Limitaciones y advertencias

- Los nombres de los participantes son autonotificados y no constituyen identidades autenticadas: el sistema asume que cada participante usara su propio nombre de buena fe.
- Un nombre es un identificador en el bus, no evidencia de que modelo respondio. El autor recomienda indicar el modelo explicitamente en los argumentos de cada CLI y registrar los metadatos de respuesta cuando el CLI los proporcione.
- El modo `--stdio` solo soporta un unico cliente. Para deliberacion compartida, todos los participantes deben conectarse a un unico servidor HTTP; ejecutar varios servidores stdio contra la misma base de datos no esta soportado.
- El servidor nunca toca Git, por lo que los permisos de Git, el estilo de revision y la propiedad de los experimentos corresponden a las instrucciones del proyecto del usuario, no al bus.
- Si una fuente de roster explicita (variable de entorno o `bus.json`) esta presente pero mal formada, el servidor termina con error en lugar de degradar a los valores por defecto; conviene validar la configuracion antes de desplegar.
- Durante la fase `blind` la ocultacion de planes depende de que los participantes usen herramientas de lectura del bus; un cliente que acceda de otro modo podria eludirla.
- La informacion proporcionada no detalla sesgos, tasas de alucinacion ni comportamiento por idioma, ya que dependen por completo de los modelos que se conecten al bus, no del bus en si.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el repositorio no registra descargas y tiene un unico like, por lo que no hay evidencia de uso en produccion.
- La fecha de creacion y actualizacion del repositorio indicada es 2026-10-06 y 2026-10-06 respectivamente.
- Dependencia de terceros: si se usa el ejemplo de WAKE con Claude Code o Codex CLI, hay que instalar y autenticar esos clientes por separado, con sus propios terminos de uso.

## Enlaces

- HuggingFace: https://huggingface.co/thymesoftware/loop-bus-mcp
- README en japones (referenciado en la model card): `README.ja.md`
- Guia de waking (referenciada en la model card): `WAKE.en.md`
- Instalacion de Claude Code: https://code.claude.com/docs/en/quickstart
- Instalacion de Codex CLI: https://learn.chatgpt.com/docs/codex/cli
- Documentacion del protocolo MCP: no disponible en la informacion proporcionada
- Repositorio de codigo fuente, paper o demo adicionales: no disponibles en la informacion proporcionada
