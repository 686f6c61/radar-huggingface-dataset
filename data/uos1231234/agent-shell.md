# uos1231234/agent-shell

## Resumen

`uos1231234/agent-shell` no es un modelo de lenguaje con pesos: es un runtime de agentes autocontenido escrito en TypeScript y distribuido como paquete (repositorio de 0,0 GB, sin safetensors ni GGUF). Su autor lo describe como la combinación de tres piezas: una máquina de estados ("shell"), un cliente de protocolo compatible con la API de OpenAI y una capa de modelado de información (IM, *Information Modeling*) que actúa como ciudadano de primera clase y concentra el databus, el registro de herramientas, la composición de prompts y el bucle de ejecución.

El problema que aborda es el control del bucle agéntico: en lugar de un FSM con estados intermedios recuperables, el shell implementa un embudo con cinco guardas (tokens, pasos, llamadas a herramienta, tiempo y tasa de error). Cuando una guarda se dispara, el shell cierra la válvula, no se llama al protocolo y la IM termina en `state: 'Tripped'`; no existe estado de recuperación ni sondeo a medio abrir. La afirmación técnica central del autor (ADR-014) es que todas las guardas son alcanzables en el camino feliz: el protocolo inyecta automáticamente `stream: true` y `stream_options.include_usage`, de modo que los umbrales de tokens, pasos y tiempo se alimentan por defecto.

Es relevante para desarrolladores que construyen agentes sobre endpoints compatibles con OpenAI y quieren límites duros y observables en lugar de heurísticas de recuperación, además de integración nativa de MCP (Model Context Protocol) y de herramientas de sistema. El proyecto incluye 197 tests y un conjunto de decisiones de arquitectura documentadas (ADR-001 a ADR-036). No hay datos publicados sobre el modelo subyacente, y las etiquetas `agent` y `llm` del repositorio se refieren al dominio de aplicación, no a artefactos de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal: runtime en TypeScript con máquina de estados (shell) + cliente de protocolo OpenAI + capa de modelado de información (IM) |
| Parámetros totales | No aplica (el repositorio no contiene pesos) |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (la fija el modelo servido tras el endpoint; el runtime solo impone umbrales de guarda) |
| Tipos de cuantización | No aplica (no se distribuyen pesos) |
| Idiomas soportados | No disponible (el runtime es agnóstico al idioma; la documentación y los identificadores están en inglés) |
| Licencia | `other` con `license_name: pfsb` y `license_link: LICENSE` (términos no detallados en la información disponible) |
| Formato de pesos | No aplica; distribución como paquete npm / código TypeScript |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: el proyecto es infraestructura de ejecución. El shell compone la petición final de OpenAI a partir de seis tipos de parte, en orden: `system` (prompt de sistema fijo), `userTemplate` (prompt de usuario con plantilla), `systemTool` (referencia a una herramienta de sistema registrada), `mcp` (referencia a una o varias herramientas bajo un servidor MCP registrado), `skill` (referencia a una habilidad registrada) y `turn` (un `ChatMessage` ya traducido procedente del databus de la IM). El shell resuelve las referencias a herramientas en el campo `tools` nativo de OpenAI y la capa de protocolo no transforma el cuerpo de la petición.

El protocolo se plantea como función pura: la única llamada desde el shell es `streamChat`, que consume fragmentos SSE. Los errores 429 y 503 se reintentan cinco veces con retroceso exponencial dentro de la capa de protocolo; cualquier otro error se propaga sin envolver. Los errores de herramienta se devuelven como texto plano en un turno con `role: 'tool'`, al estilo de *deepseek-harness*, sin prefijo `error:`, sin campo `isError` y sin veredicto separado. La validación interna de herramientas (`path.ts:resolvePath` rechaza rutas fuera del directorio de trabajo, `write.ts:isBlocked` rechaza directorios protegidos por el sistema operativo, `validate.ts:requireReason` rechaza motivos vacíos) funciona como retroalimentación para el modelo; la guarda `errorRate` es la red de seguridad de alcance de sesión y dispara `state: 'Tripped'` cuando el modelo no se autocorrige tras N rondas de error consecutivas (por defecto, en la undécima, con comparación estricta `>`). No se declara ningún uso de RLHF, DPO ni dataset de entrenamiento.

## Capacidades

- Orquestación de bucles agénticos multi-paso mediante una máquina de estados con cinco guardas independientes: tokens, pasos (`metrics.stepCount`, incrementado incondicionalmente en cada llamada), llamadas a herramienta, tiempo (`metrics.elapsedMs`, anclado a reloj de pared mediante `advanceElapsed` en el bucle de la IM) y tasa de error.
- Terminación dura de guardas: al dispararse una, no se invoca el protocolo y la IM pasa a estado terminal, sin estados de recuperación.
- *Function calling* nativo del protocolo de OpenAI, sin transformación del cuerpo de la petición.
- Consumo de streaming SSE con inyección automática de `stream: true` y `stream_options.include_usage` por parte de la capa de protocolo.
- Reintento automático con retroceso exponencial (5 intentos) para respuestas 429 y 503.
- Registro e invocación de herramientas de sistema (`systemTool`), servidores MCP completos (`mcp`) y habilidades (`skill`) dentro de la composición de prompt.
- Gestión de errores de herramienta como contenido conversacional en turnos `role: 'tool'`, legible por el modelo igual que cualquier otra respuesta de herramienta.
- Persistencia de turnos en un databus interno de la IM (sin compartición entre sesiones en esta versión).
- Compatibilidad declarada únicamente con proveedores con forma de API OpenAI; no hay soporte para los protocolos de Anthropic, Gemini u otros.
- No incluye lógica de negocio: sin expertos, sin tareas y sin heurísticas de selección de herramientas.

## Casos de uso

- Automatización de tareas de shell con límites estrictos de coste y tiempo: las guardas de tokens, pasos y tiempo permiten ejecutar agentes que operan sobre el sistema de ficheros sabiendo que se detendrán de forma determinista al superar un umbral, sin dejar el bucle en un estado semiabierto.
- Integración de herramientas corporativas vía MCP: el tipo de parte `mcp` permite registrar uno o varios servidores MCP y exponer sus herramientas al modelo dentro del mismo prompt compuesto, lo que encaja en entornos donde las capacidades ya están publicadas como servidores MCP.
- Asistentes de línea de comandos (CLI): el paquete se ejecuta con Node.js y `npx tsx`, y la etiqueta `cli` del repositorio apunta a este escenario; el bucle `streamChat` consume SSE y puede alimentar una interfaz de terminal que muestre el progreso por pasos.
- Pasarela unificada sobre endpoints compatibles con OpenAI: al ser el protocolo una función pura con reintentos integrados para 429/503, sirve como capa de resiliencia entre la aplicación y cualquier proveedor que hable el protocolo de OpenAI, incluidos servidores locales como vLLM u Ollama.
- Registro de errores de herramienta para depuración de agentes: al devolver los fallos como texto plano en turnos `role: 'tool'`, los registros de conversación muestran exactamente lo que vio el modelo, lo que simplifica la trazabilidad en desarrollo.
- Control de bucles descontrolados en producción: la guarda `errorRate` (disparo por defecto en la undécima ronda de error consecutiva) actúa como cortacircuitos de sesión cuando el modelo repite una acción inválida, evitando gasto indefinido de tokens.
- Investigación en ingeniería de contexto: las seis partes de prompt y la separación estricta entre IM, shell y protocolo permiten experimentar con composición de contexto y registro de herramientas sin tocar la capa de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio indica 197 tests superados (`npm test`) y verificación de tipos con `npx tsc --noEmit`, pero no se aportan métricas de latencia, throughput ni evaluaciones funcionales. Los datos públicos del repositorio son: 0 descargas, 1 *like* y un tamaño de 0,0 GB.

## Requisitos de hardware

- El paquete en sí no requiere GPU: es código TypeScript que se ejecuta sobre Node.js y consume un endpoint HTTP compatible con OpenAI.
- VRAM estimada para inferencia: no aplicable al paquete; depende exclusivamente del modelo servido detrás del endpoint, dato que no se especifica en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; vienen determinadas por el proveedor del modelo, no por este runtime.
- Compatibilidad con GPU de consumo: no determinable a partir de la información disponible.
- Opciones de despliegue del runtime: `npm install` y ejecución de los ejemplos con `npx tsx` (`examples/minimal.ts`, `examples/guard-demo.ts`, `examples/tool-flow.ts`). Los tres primeros ejemplos usan un `streamChat` falso y no realizan HTTP real.
- Integración con un endpoint real: requiere el adaptador de una línea descrito en `docs/IM-GUIDE.md`, que convierte la firma de tres argumentos de `client.ts:streamChat` en la firma de dos argumentos que espera el bucle de la IM.
- Latencia y throughput: no disponibles; dependen del modelo y del proveedor, no del runtime.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Funcionalmente, este proyecto pertenece a la categoría de *agent harnesses* o runtimes de agentes (junto con marcos como LangGraph, OpenAI Agents SDK o Vercel AI SDK), no a la categoría de modelos de lenguaje, por lo que una comparación por parámetros, contexto o benchmarks carece de sentido directo.

| Proyecto | Tipo | Protocolo soportado | Guardas de sesión | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| agent-shell | Runtime de agentes en TypeScript | Solo OpenAI | Cinco (token, paso, llamada a herramienta, tiempo, tasa de error) | `pfsb` (términos no detallados) | No disponibles |
| LangGraph | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| OpenAI Agents SDK | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| Vercel AI SDK | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no genera texto por sí mismo y no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- Licencia `pfsb` bajo la etiqueta `other`: los términos concretos no se detallan en la información proporcionada, por lo que no puede confirmarse la viabilidad de uso comercial sin revisar el fichero `LICENSE` del repositorio.
- Adopción mínima y sin validación externa: 0 descargas y 1 *like* en HuggingFace, sin benchmarks publicados ni informes de terceros.
- Madurez incierta: las fechas indicadas de creación y actualización (23 de septiembre de 2026) son posteriores a la fecha habitual de consulta y conviene verificarlas; el conjunto de ADR llega hasta ADR-036, lo que sugiere un diseño en evolución activa.
- Sesgos: no aplicable al runtime en sí, pero el comportamiento final heredará los sesgos del modelo servido tras el endpoint, que no se especifica.
- Riesgo de alucinación: el runtime no incorpora verificación de afirmaciones ni capas de *grounding*; los errores de herramienta se devuelven como texto que el modelo puede interpretar mal.
- Alcance de protocolo limitado: no hay soporte para Anthropic, Gemini ni otros protocolos distintos del de OpenAI.
- Sin compartición de databus entre sesiones: la memoria está limitada a la sesión actual por decisión de diseño explícita.
- Sin lógica de negocio: no incluye selección de herramientas, expertos ni tareas; cualquier heurística de este tipo debe implementarse fuera del paquete.
- Terminación sin recuperación: las guardas son terminales duras, de modo que un disparo por `errorRate` o por tiempo aborta la sesión en lugar de degradarla, lo que exige gestión de errores en la capa superior.
- Elementos eliminados o sustituidos: no existe `tool-runner.ts` y `tools/buckets.ts` fue sustituido (ADR-010, 27 de agosto de 2026), por lo que documentación o ejemplos antiguos pueden estar obsoletos.
- Cobertura de pruebas limitada al propio paquete: los 197 tests no validan la integración con proveedores reales, ya que los ejemplos usan un `streamChat` simulado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/uos1231234/agent-shell
- Guía de integración de la IM: `docs/IM-GUIDE.md` (en el repositorio)
- Registros de decisiones de arquitectura (ADR-001 a ADR-036): `docs/DECISIONS.md` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
- Ejemplos ejecutables: `examples/minimal.ts`, `examples/guard-demo.ts`, `examples/tool-flow.ts` (en el repositorio)
- La búsqueda web asociada no devolvió resultados relevantes sobre el proyecto: únicamente contenido no relacionado con el modelo, por lo que no se han podido verificar enlaces externos, artículos ni demostraciones adicionales.
