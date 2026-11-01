# srinivaspadmanabhuni/agentic-ai-reference-agents

## Resumen

`agentic-ai-reference-agents` es un repositorio de código publicado en HuggingFace por el desarrollador srinivaspadmanabhuni que contiene 132 agentes de referencia para evaluar sistemas de IA agéntica. No se trata de un modelo de pesos: el repositorio aloja implementaciones ejecutables de agentes construidos sobre frameworks como LangGraph, CrewAI, AutoGen, n8n, MCP, OpenAI Agents SDK y LlamaIndex, con el objetivo de servir como banco de pruebas (systems under test) para el catálogo abierto Agentic AI Test Checklist 110.

Cada agente se ejecuta localmente contra back-ends simulados (mocks con direcciones `.example` y cadenas canario) y utiliza modelos Qwen2.5-Instruct servidos por llama.cpp en CPU, de modo que todo el conjunto funciona sin claves de API y a coste cero. El repositorio documenta ejecuciones registradas, pruebas unitarias y variantes con defectos sembrados para validar la herramienta de auditoría `agentest` (versiones 3.2.1 a 4.0).

Su relevancia actual radica en que proporciona un corpus reproducible y abierto para medir comportamiento agéntico real (tool calling, handoffs, aprobación humana, sesgos, privacidad, inyección de instrucciones) en lugar de limitarse a benchmarks estáticos de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de agentes (código Python, n8n, frameworks de orquestación); no es un modelo con arquitectura propia |
| Parametros totales | No aplica al repositorio; los LLM subyacentes son Qwen2.5-7B-Instruct y Qwen2.5-1.5B-Instruct |
| Parametros activos | No disponible (Moonlight-16B-A3B se usa en A120 y A125-A126, pero no se detalla su configuración MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (Qwen2.5-7B-Instruct, ~4,7 GB); Q2_K para Moonlight-16B-A3B en A125-A126 |
| Idiomas soportados | Inglés; algunos agentes cubren inglés/hindi/telugu, inglés/marathi, inglés/tamil/bengalí, inglés/gujarati e inglés/punjabi |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (el repositorio contiene código); los pesos se cargan como GGUF mediante llama.cpp |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Organiza 132 agentes en carpetas (`a01_*` a `a132_*`) agrupados en 13 fases. Las fases iniciales (A1-A12) cubren patrones simples: reglas sin LLM, una única llamada al modelo, RAG, cadenas de prompts, handoffs, ReAct con aprobación humana, herramientas MCP, flujos low-code en n8n, equipos multiagente, equipos de programación, evaluador-optimizador con guardarraíles y flujos de aprobación duraderos. Las fases siguientes escalan a sistemas de estilo producción: supervisor LangGraph, map-reduce, plan-and-execute con replanificación, MCP multiservidor, RAG multihop con citas verificadas, crews jerárquicos de CrewAI, asistentes con memoria entre procesos, debates SelectorGroupChat y negociación en AutoGen, agentes de navegador con guardarraíles y orquestadores n8n con subflujos.

A partir de A26 se añaden agentes empresariales (banca, seguros, administración sanitaria, RR. HH., SRE, analítica) con escrituras de solo lectura o sujetas a aprobación sobre mocks sintéticos. Las fases 5 a 13 introducen agentes de cobertura con function calling compatible con OpenAI y trazas OpenTelemetry GenAI, variantes con defectos sembrados (A90-A98 realizan escrituras sin restricción de forma intencionada para generar casos de fallo), mesas de decisión con atributos protegidos y variantes contrafactuales (A105-A110), y pruebas ciegas contra reglas congeladas de `agentest` v3.3.0, v3.4.0 y v4.0. La inferencia se sirve mediante `common/gguf_llm_server.py` (Qwen2.5-7B-Instruct GGUF Q4_K_M en CPU con llama.cpp) exponiendo una API compatible con OpenAI; las primeras ejecuciones usaron `common/local_llm_server.py` con Qwen2.5-1.5B-Instruct y se conservan en `aNN_*/proof/baseline-1.5B/` como material comparativo de fallos.

## Capacidades

- Orquestación multiagente con patrones supervisor, jerárquico, swarm y map-reduce.
- Tool calling y function calling mediante API compatible con OpenAI y servidores MCP.
- Flujos con aprobación humana y escrituras restringidas o sujetas a aprobación.
- RAG multihop con verificación de citas y recuperación sobre back-ends simulados.
- Memoria persistente entre procesos en asistentes de larga duración.
- Agentes de navegador con guardarraíles sobre un sitio mock local.
- Trazas nativas OpenTelemetry GenAI para observabilidad de agentes.
- Mesas de decisión con variantes contrafactuales sobre atributos protegidos (sesgo y explicabilidad).
- Moderación de contenido multilingüe (inglés/hindi/tamil, inglés/marathi, inglés/bengalí, inglés/gujarati, inglés/punjabi).
- Detección de inyección de instrucciones en escenarios de seguridad (A124, A130).
- Ejecución local sin claves de API ni coste de inferencia.

## Casos de uso

- Evaluación de frameworks agénticos: comparar el mismo patrón (por ejemplo, supervisor o handoff) implementado en LangGraph, CrewAI y AutoGen sobre mocks idénticos, usando las ejecuciones registradas en `proof/` como referencia reproducible.
- Auditoría de sesgos en decisiones automatizadas: las mesas A105-A110 (preaprobación de hipotecas, cribado de currículos, triaje de urgencias, selección de inquilinos) incluyen variantes contrafactuales que cambian un atributo protegido, lo que permite medir disparidad de trato con `agentest`.
- Pruebas de regresión de agentes en CI: las pruebas unitarias y las tres ejecuciones grabadas por agente permiten fijar comportamiento esperado y detectar roturas al actualizar prompts, herramientas o modelos.
- Validación de guardarraíles y seguridad: los agentes con inyección de instrucciones (A124, A130) y los de defectos sembrados (A90-A98) generan casos de fallo reales para comprobar que las comprobaciones de `agentest` los detectan (tasa de captura 90/90 en la variante seed-aware de v3.2.1).
- Formación y prototipado de arquitecturas agénticas: el visor estático y la UI Gradio (`python app.py`, una pestaña por agente) permiten inspeccionar trazas y decisiones sin infraestructura de pago.
- Desarrollo de flujos low-code: los agentes n8n (A1, A12, A24) sirven de plantilla para orquestadores con subflujos y enrutado por reglas en entornos empresariales.
- Investigación en observabilidad: las trazas OpenTelemetry GenAI de las fases 5 y posteriores permiten instrumentar y comparar latencias y pasos de razonamiento entre patrones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio reporta estados de ejecución por agente (por ejemplo, A1 «partial 3/4» y A2 «working 3/3» con Qwen2.5-7B-Instruct) y una tasa de captura de 90/90 en la comprobación seed-aware de `agentest` v3.2.1, pero no incluye métricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM: no aplica al repositorio; para el LLM subyacente, Qwen2.5-7B-Instruct en GGUF Q4_K_M ocupa aproximadamente 4,7 GB.
- Inferencia en CPU mediante llama.cpp, sin GPU obligatoria; el servidor local expone una API compatible con OpenAI.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no confirmado explícitamente, aunque el diseño está pensado para ejecución local en CPU.
- Despliegue: llama.cpp (`common/gguf_llm_server.py`, `common/local_llm_server.py`), UI Gradio con `python app.py`; el visor de HuggingFace Spaces es estático porque los Spaces Gradio/Docker alojados requieren plan de pago.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Nº de agentes/patrones | Modelos usados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| srinivaspadmanabhuni/agentic-ai-reference-agents | Repositorio de agentes de referencia | 132 agentes en 13 fases | Qwen2.5-7B-Instruct, Qwen2.5-1.5B-Instruct, Gemma 3 4B, Moonlight-16B-A3B | Apache 2.0 | HuggingFace (código) + visor estático |
| AgentBench (Liu et al., 2023) | Benchmark de agentes LLM | Múltiples entornos | Varios LLM comerciales y abiertos | No disponible | Paper y repositorio |
| ToolBench / ToolLLM (Qin et al., 2023) | Benchmark de tool calling | Miles de APIs | Varios | No disponible | Paper y repositorio |
| WebArena (Zhou et al., 2023) | Entorno web para agentes | Varios sitios | Varios | No disponible | Paper y repositorio |

La comparación directa es limitada: este repositorio no es un modelo ni un benchmark de precisión, sino un conjunto de implementaciones ejecutables con pruebas y trazas, orientado a auditar comportamiento agéntico con `agentest`.

## Limitaciones y advertencias

- No contiene pesos de modelo; quien busque un modelo para inferencia directa debe acudir a Qwen2.5-Instruct, Gemma 3 o Moonlight-16B-A3B.
- Todos los back-ends son mocks con direcciones `.example` y cadenas canario; los resultados no reflejan sistemas productivos reales.
- Las ejecuciones principales usan Qwen2.5-7B-Instruct en Q4_K_M sobre CPU, lo que limita el rendimiento absoluto y puede introducir fallos no representativos de modelos mayores.
- Los agentes A90-A98 realizan escrituras sin restricción de forma intencionada para generar casos de fallo; no deben desplegarse fuera del entorno de prueba.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Idiomas: el núcleo está en inglés; los agentes multilingües cubren solo pares concretos (hindi, telugu, tamil, bengalí, marathi, gujarati, punjabi) y no hay soporte general declarado.
- Riesgo de alucinación y sesgos: no evaluado de forma agregada en la información disponible; las mesas de decisión con atributos protegidos están diseñadas para medirlos, no para garantizar su ausencia.
- Licencia Apache 2.0 permite uso comercial del código, pero los modelos subyacentes tienen sus propias licencias que deben verificarse por separado.
- El visor alojado es estático; la ejecución en vivo requiere máquina propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/srinivaspadmanabhuni/agentic-ai-reference-agents
- Visor de ejecuciones (Space estático): https://huggingface.co/spaces/srinivaspadmanabhuni/agentic-ai-reference-agents-viewer
- Dataset del catálogo de pruebas: https://huggingface.co/datasets/srinivaspadmanabhuni/agentic-ai-test-checklist-110
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- ReAct (arXiv:2210.03629): https://arxiv.org/abs/2210.03629
- Reflexion (arXiv:2303.11366): https://arxiv.org/abs/2303.11366
- Tree of Thoughts (arXiv:2305.04091): https://arxiv.org/abs/2305.04091
- Self-Refine (arXiv:2303.17651): https://arxiv.org/abs/2303.17651
- AutoGen (arXiv:2308.08155): https://arxiv.org/abs/2308.08155
- MetaGPT (arXiv:2308.00352): https://arxiv.org/abs/2308.00352
- Retrieval-Augmented Generation (arXiv:2005.11401): https://arxiv.org/abs/2005.11401
- Qwen2.5 Technical Report (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
