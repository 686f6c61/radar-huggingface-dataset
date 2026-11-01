# XORAS-CORE/xoras-agent-framework

## Resumen

XORAS Agent Framework es un framework de orquestacion multi-agente distribuido desarrollado por XORAS Systems (Anthony Junior Oxendine). No se trata de un modelo de lenguaje, sino de una infraestructura de runtime que gobierna la ejecucion de agentes autonomos sobre modelos LLM subyacentes. Su propuesta central es resolver tres fallos sistemicos de las arquitecturas multi-agente actuales: el estado compartido sin propietario, la autoevaluacion ciega de agentes y la degradacion de latencia por intercambio de pesos entre GPUs.

La arquitectura introduce un modelo de aislamiento de estado denominado Judge-Gate (principio de escritor unico) combinado con Witness-Gate, un mecanismo de control de concurrencia optimista basado en Compare-And-Set con versionado monotonico. Adicionalmente incorpora un motor de validacion independiente (Blackbox Validator) que evalua artefactos generados por agentes sin acceso a su contexto de autoria, y una capa de memoria semantica basada en un lattice hiperbolico de Poincare de 24 cabezas y 18.432 dimensiones.

El proyecto se distribuye como paquete PyPI (v2.4.3) bajo licencia MIT, con repositorio en GitHub y una demo interactiva en Hugging Face Spaces. Es relevante para equipos que construyen sistemas agenticos en produccion y necesitan garantias formales de consistencia de estado y verificacion independiente de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de orquestacion multi-agente (no es un modelo de lenguaje); runtime con aislamiento de estado Judge-Gate, CAS Witness-Gate y memoria hiperbolica de Poincare |
| Parametros totales | no disponible (no aplica: no es un modelo neuronal) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del LLM subyacente que orqueste el framework) |
| Tipos de cuantizacion | no disponible (no aplica al framework) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; se distribuye como paquete Python via PyPI) |

## Arquitectura y entrenamiento

El framework no entrena un modelo neuronal propio. Su nucleo es un runtime de agentes que impone tres capas de control. La primera es Judge-Gate: cada clave del tejido de memoria global tiene un agente propietario exclusivo, y solo ese agente puede confirmar escrituras; las propuestas de otros agentes se cursan como tickets de delta estructurados y cualquier intento de escritura no autorizado falla de forma cerrada con un error `JUDGE_GATE_VIOLATION`. La segunda es Witness-Gate: todas las escrituras exigen semantica Compare-And-Set con `expected_version` coincidente, de modo que las escrituras obsoletas se rechazan con `WITNESS_GATE_VIOLATION`. En pruebas de colision con 20 hilos sobre la misma version base, el autor reporta exactamente 1 commit y 19 mutaciones obsoletas interceptadas; con bucle de reintento, 20 operaciones secuenciales completadas con 0 actualizaciones perdidas.

La tercera capa es el motor de validacion independiente, que recibe cero contexto del autor y evalua unicamente contra estructura AST, contratos de esquema de funciones y codigos de salida de ejecucion en sandbox (exito si `code == 0`). Los errores de sintaxis, esquemas ausentes y excepciones en tiempo de ejecucion se rechazan de forma cerrada. La memoria semantica se organiza en un lattice hiperbolico de 24 cabezas Poincare de 768 dimensiones cada una (18.432 dimensiones totales) con curvatura seccional constante K = -1,0, usando distancia geodesica en el modelo de bola de Poincare para preservar jerarquias con distorsion minima. El autor reporta latencias de consulta sub-milisegundo en RAM unificada de Apple Silicon y en nodos Windows con GPU RTX. No se especifican volumenes de datos de entrenamiento ni procesos de RLHF/DPO, ya que el framework no entrena modelos.

## Capacidades

- Aislamiento de estado multi-agente con escritor unico por clave y errores de violacion tipados.
- Control de concurrencia optimista con Compare-And-Set y versionado monotonico para evitar actualizaciones perdidas.
- Validacion independiente de artefactos generados por agentes mediante AST, contratos de esquema y ejecucion en sandbox.
- Memoria semantica jerarquica basada en embeddings hiperbolicos de Poincare (24 cabezas x 768 dimensiones).
- Orquestacion de multiples LLM en el mismo despliegue, con gestion de intercambio de pesos entre GPUs.
- Distribucion como paquete Python instalable via PyPI, integrable en pipelines existentes.
- Soporte de despliegue en Apple Silicon (RAM unificada) y en nodos Windows con GPU RTX.
- No incluye capacidades de generacion de texto, vision, audio ni tool calling propias: estas dependen del LLM subyacente que el framework orqueste.

## Casos de uso

- Pipelines de generacion de codigo con verificacion automatica: el Blackbox Validator comprueba AST, esquemas de funciones y codigos de salida en sandbox antes de aceptar el artefacto de un agente, lo que permite integrar el framework en CI/CD como puerta de calidad independiente del autor del codigo.
- Sistemas multi-agente con estado compartido en produccion: Judge-Gate garantiza que solo el agente propietario de cada clave escriba, eliminando condiciones de carrera silenciosas en blackboards compartidos entre agentes de investigacion, redaccion y revision.
- Orquestacion de agentes con reintentos seguros: Witness-Gate con CAS permite reintentar operaciones concurrentes sin actualizaciones perdidas, adecuado para flujos donde varios agentes proponen mutaciones sobre el mismo registro (por ejemplo, enriquecimiento de entidades).
- Memoria a largo plazo para asistentes conversacionales: el lattice de Poincare preserva relaciones jerarquicas entre conceptos (taxonomias, ontologias de producto, arboles de decision) con consultas sub-milisegundo, util para recuperacion semantica en asistentes con historial extenso.
- Despliegue multi-modelo en hardware heterogeneo: la gestion de intercambio de pesos entre GPUs y la compatibilidad con Apple Silicon y RTX permiten montar entornos de desarrollo y produccion con distintos aceleradores sin reescribir la capa de orquestacion.
- Validacion de agentes en entornos regulados: la separacion estricta entre autor y validador, junto con los recibos de verificacion inmutables en disco, facilita la trazabilidad y auditoria de decisiones automatizadas.
- Investigacion en sistemas distribuidos: los recibos de concurrencia y de validacion independiente sirven como artefactos reproducibles para estudiar condiciones de carrera y perdidas de actualizacion en arquitecturas agenticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta resultados empiricos cualitativos en pruebas de concurrencia (20 hilos, 1 commit y 19 mutaciones interceptadas; 0 actualizaciones perdidas con reintentos) y latencias de consulta sub-milisegundo en el lattice de Poincare, pero no se aportan tablas comparativas con MMLU, HumanEval, GSM8K ni metricas estandar de modelos de lenguaje, ya que el framework no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del LLM subyacente que se orqueste, no del framework.
- GPU recomendadas: el autor menciona nodos Windows con GPU RTX y Apple Silicon con RAM unificada; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con consumer GPU: no disponible de forma explicita; la arquitectura esta pensada para ejecucion local en Apple Silicon y RTX, lo que sugiere viabilidad en hardware de consumo, pero sin cifras confirmadas.
- Opciones de despliegue: paquete PyPI (`xoras-agent-framework` v2.4.3) instalable en Python; demo interactiva en Hugging Face Spaces (XORAS-SENTINEL). No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta consultas al lattice de Poincare en latencias sub-milisegundo; no se aportan cifras de throughput de agentes ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Framework | Enfoque | Aislamiento de estado | Validacion independiente | Licencia | Distribucion |
|---|---|---|---|---|---|
| XORAS Agent Framework | Runtime multi-agente con Judge-Gate, Witness-Gate y lattice de Poincare | Si (escritor unico + CAS) | Si (AST, esquema, sandbox) | MIT | PyPI, GitHub, HF Spaces |
| LangGraph | Grafos de estado para agentes | No especifico (depende del implementador) | No integrada | MIT | PyPI |
| CrewAI | Orquestacion de roles de agentes | No especifico | No integrada | MIT | PyPI |
| AutoGen (Microsoft) | Conversacion multi-agente | No especifico | No integrada | MIT | PyPI |

La comparativa se limita a caracteristicas arquitectonicas declaradas por cada proyecto; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo, vision ni audio por si mismo; sus capacidades dependen del LLM subyacente que orqueste.
- No se han publicado benchmarks estandarizados ni comparativas cuantitativas con frameworks alternativos; las afirmaciones de rendimiento provienen del autor y de recibos locales, no de evaluaciones independientes.
- El proyecto tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha, lo que indica adopcion muy temprana y ausencia de validacion por parte de la comunidad.
- La documentacion tecnica es densa en notacion matematica y afirmaciones de rendimiento (sub-milisegundo, 0 actualizaciones perdidas) que no se acompanan de metodologia reproducible publica mas alla de los recibos en disco.
- No se especifican idiomas soportados ni sesgos conocidos; al no ser un modelo linguistico, estos riesgos recaen sobre el LLM subyacente.
- Riesgo de alucinacion: no aplica al framework en si, pero los agentes orquestados pueden alucinar; el Blackbox Validator mitiga artefactos verificables (codigo, esquemas) pero no afirmaciones en lenguaje natural.
- Licencia MIT permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar los terminos de las dependencias y del LLM subyacente.
- Para produccion: la madurez del proyecto (version 2.4.3, autor unico, sin comunidad consolidada) aconseja evaluacion exhaustiva y plan de contingencia antes de adoptarlo en sistemas criticos.

## Enlaces

- Hugging Face: https://huggingface.co/XORAS-CORE/xoras-agent-framework
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/XORAS-CORE/XORAS-SENTINEL
- PyPI: https://pypi.org/project/xoras-agent-framework/
- GitHub: https://github.com/aoxendine3/xoras
- YouTube: https://www.youtube.com/@xorassystems
- Perfil del autor en X: https://x.com/AnthonyOxe93342
