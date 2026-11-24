# stefanwiest/hct-spec

## Resumen

`stefanwiest/hct-spec` no es un modelo de lenguaje, sino la especificación canónica de Harmonic Coordination Theory (HCT), un protocolo de señales de coordinación para sistemas multiagente construidos sobre capas de transporte como MCP (Model Context Protocol) y A2A (Agent-to-Agent) y capas de orquestación como LangGraph, CrewAI o AutoGen. El repositorio define siete señales de coordinación en tiempo de ejecución (CUE, FERMATA, ATTACCA, VAMP, CAESURA, TACET y DOWNBEAT) que se mapean directamente a controles de gobernanza deterministas y a requisitos del EU AI Act y del OWASP Agentic Top 10.

El problema que aborda es la falta de semántica de coordinación estandarizada en sistemas multiagente: mientras que el transporte y la orquestación están bien definidos, las señales de control (dispatch, aprobación humana, handoff, reintentos acotados, circuit breakers, cuotas y barreras de sincronización) no lo están. HCT propone un vocabulario formal inspirado en la dirección musical para cubrir ese hueco con semántica determinista.

Es relevante ahora por la entrada en vigor progresiva del EU AI Act y por la publicación del OWASP Agentic Top 10, que exigen mecanismos auditables de supervisión humana y parada de emergencia en sistemas agénticos. El repositorio tiene 0 descargas y 0 likes en Hugging Face, y su licencia es MIT. No contiene pesos ni arquitectura de red neuronal: es documentación y especificación de protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una especificación de protocolo de coordinación multiagente) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene especificación y ejemplos de código; no hay pesos) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. HCT es una especificación de protocolo que define semántica de coordinación en tiempo de ejecución sobre capas existentes: transporte (MCP, A2A) y orquestación (LangGraph, CrewAI, AutoGen). La innovación técnica consiste en formalizar siete señales con mapeo explícito a controles de gobernanza empresarial:

| Señal | Equivalente de ingeniería | Control de gobernanza |
|---|---|---|
| CUE | Dispatch determinista de tareas | Activación de worker con prioridad y cotas de latencia |
| FERMATA | Hold de aprobación humana | Bloqueo de herramientas de alto impacto (EU AI Act Art. 14, OWASP ASI02) |
| ATTACCA | Handoff inmediato | Transición de etapa sin paradas |
| VAMP | Gate de reintento determinista | Bucle acotado de AST, esquema o verificador antes de mutar estado |
| CAESURA | Circuit breaker de emergencia | Parada inmediata del enjambre ante deriva o anomalías de gasto (OWASP ASI04/ASI08) |
| TACET | Standby / conservación de cuota | Supresión explícita de worker bajo backpressure |
| DOWNBEAT | Sincronización de barrera | Checkpoint de estado unificado entre pools de workers paralelos |

El repositorio incluye implementaciones de referencia en Python (`hct-mcp-signals` en PyPI), TypeScript (`@hct-mcp/signals` en npm), Rust (`hct-mcp-signals` en crates.io) y Go (`github.com/stefanwiest/hct-mcp-signals/go`). No se documentan datos de entrenamiento, tokens ni técnicas de RLHF/DPO porque no aplican.

## Capacidades

- Definición formal de siete señales de coordinación multiagente con semántica determinista.
- Mapeo explícito de cada señal a controles de gobernanza del EU AI Act y del OWASP Agentic Top 10.
- Extensión de protocolo para MCP (Model Context Protocol) mediante el paquete `hct-mcp-signals`.
- Extensión de protocolo para A2A (Agent-to-Agent) de Google mediante `hct-a2a`.
- Implementaciones de referencia en cuatro lenguajes: Python, TypeScript, Rust y Go.
- Soporte de holds de aprobación humana bloqueantes (FERMATA) para herramientas de alto impacto.
- Soporte de circuit breakers de emergencia (CAESURA) ante deriva o anomalías de gasto.
- Mecanismo de reintento acotado (VAMP) con límites de AST, esquema o verificador antes de mutar estado.
- Sincronización de barrera (DOWNBEAT) para checkpoints de estado entre workers paralelos.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni audio: no es un modelo generativo.

## Casos de uso

- Gobernanza de agentes en producción regulada: integrar FERMATA como hold bloqueante antes de que un agente ejecute herramientas de alto impacto, de modo que se cumpla el requisito de supervisión humana del EU AI Act Art. 14 y el control OWASP ASI02.
- Orquestación de pipelines multiagente con LangGraph o CrewAI: usar CUE y ATTACCA para dispatch determinista y handoffs sin paradas entre etapas, reduciendo la latencia de coordinación en flujos de varias etapas.
- Control de gasto en enjambres de agentes: implementar CAESURA como circuit breaker que detiene el enjambre completo ante anomalías de coste o deriva de comportamiento, alineado con OWASP ASI04/ASI08.
- Reintentos seguros en generación de código agéntica: aplicar VAMP para limitar bucles de verificación (AST, esquema, tests) antes de que el agente mute el estado del repositorio, evitando bucles infinitos de corrección.
- Gestión de backpressure en sistemas con cuotas: usar TACET para suprimir explícitamente workers cuando se alcanzan límites de cuota o rate limits de APIs externas, conservando recursos.
- Checkpointing distribuido: emplear DOWNBEAT como barrera de sincronización que unifica el estado entre pools de workers paralelos antes de continuar, útil en flujos con fan-out/fan-in.
- Auditoría de conformidad: mapear las señales emitidas por el sistema a los controles del OWASP Agentic Top 10 para generar evidencia de gobernanza en auditorías internas o externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento de modelos; la model card menciona un paper de "Architectural Convergence" con cifras de 2.6x de speedup y 100% de coherencia de estado, pero no se aportan detalles metodológicos ni datos verificables en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo neuronal).
- GPU recomendadas: no aplica.
- Cabe en consumer GPU: no aplica.
- Opciones de despliegue: las implementaciones de referencia se distribuyen como librerías (PyPI, npm, crates.io, Go modules) que se integran en el código del orquestador; no requieren infraestructura de inferencia.
- Latencia y throughput: no disponibles; dependen de la implementación del orquestador y del transporte subyacente (MCP o A2A).

## Comparativa con modelos similares

| Criterio | HCT (hct-spec) | MCP (Anthropic) | A2A (Google) |
|---|---|---|---|
| Categoría | Especificación de señales de coordinación | Protocolo de transporte para herramientas y contexto | Protocolo de comunicación agente-a-agente |
| Nivel de la pila | Capa de coordinación sobre transporte y orquestación | Capa de transporte | Capa de transporte entre agentes |
| Gobernanza integrada | Sí (mapeo a EU AI Act y OWASP Agentic Top 10) | No definida en el protocolo | No definida en el protocolo |
| Implementaciones de referencia | Python, TypeScript, Rust, Go | SDKs oficiales en varios lenguajes | SDKs en varios lenguajes |
| Licencia | MIT | Especificación abierta | Especificación abierta |
| Madurez / adopción | 0 descargas, 0 likes en Hugging Face | Amplia adopción industrial | Adopción creciente |

La comparativa con modelos de lenguaje no aplica porque HCT no es un modelo. Frente a frameworks de orquestación como LangGraph, CrewAI o AutoGen, HCT no compite sino que se posiciona como capa de semántica de coordinación que esos frameworks pueden consumir.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse para tareas de inferencia.
- Adopción prácticamente nula: 0 descargas y 0 likes en Hugging Face en la fecha de consulta, lo que implica ausencia de validación comunitaria.
- Documentación dependiente del autor: la especificación, los papers y las implementaciones están vinculados a un único autor (Stefan Wiest), sin gobernanza multiempresa ni proceso de estandarización formal.
- Riesgo de fragmentación: al definir semántica propia sobre MCP y A2A, podría divergir de futuras estandarizaciones de esos protocolos.
- Idiomas soportados no documentados: la especificación está redactada en inglés y no se declara soporte multilingüe.
- Sin benchmarks verificables: las cifras de rendimiento mencionadas en los papers asociados no están detalladas en la información disponible.
- Licencia MIT: permisiva para uso comercial, pero sin garantías ni soporte; el autor ofrece servicios de advisory y auditoría de pago a partir del Q1 2027.
- Caveat para producción: al tratarse de una especificación sin adopción extendida, su integración requiere validación propia y no debe asumirse interoperabilidad con implementaciones de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stefanwiest/hct-spec
- Paper Harmonic Coordination Theory (2025): https://www.stefanwiest.de/research/papers/harmonic-coordination-theory/
- Paper Architectural Convergence (2026): https://www.stefanwiest.de/research/papers/architectural-convergence/
- Ensayo The 97% Problem: https://www.stefanwiest.de/writing/essays/97-percent-problem/
- Paper The Genesis Framework: https://www.stefanwiest.de/research/papers/genesis-framework/
- Repositorio hct-mcp-signals: https://github.com/stefanwiest/hct-mcp-signals
- Repositorio hct-a2a: https://github.com/stefanwiest/hct-a2a
- Repositorio hct-patterns: https://github.com/stefanwiest/hct-patterns
- Paquete PyPI: https://pypi.org/project/hct-mcp-signals/
- Paquete npm: https://www.npmjs.com/package/@hct-mcp/signals
- Paquete crates.io: https://crates.io/crates/hct-mcp-signals
- Advisory y auditorías: https://www.stefanwiest.de/advisory/
- Web del autor: https://www.stefanwiest.de
- GitHub del autor: https://github.com/stefanwiest
- LinkedIn del autor: https://www.linkedin.com/in/stefanwiest
- Substack del autor: https://seekingsota.substack.com
