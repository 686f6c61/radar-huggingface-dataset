# thomasskarp/autoapp-agent-graph

## Resumen

`thomasskarp/autoapp-agent-graph` no es un modelo de lenguaje con pesos propios, sino un blueprint de arquitectura y una "system card" que describe una maquina de estados multi-agente determinista para flujos B2B del sector automocion. El repositorio se publica en HuggingFace con `library_name: nextjs` y `pipeline_tag: text-generation`, pero no distribuye safetensors, GGUF ni ningun artefacto de inferencia: lo que contiene es codigo TypeScript, un grafo de agentes documentado y una interfaz de estado tipada (`AutoAppState`) validada con Zod.

El problema que aborda es el fallo no lineal de los prompts monoliticos: cuando una sola llamada al LLM debe extraer datos, valorar un vehiculo, aplicar un margen comercial y redactar anuncios, la probabilidad de exito es el producto de las probabilidades de cada subtarea. La propuesta del autor es deconstruir ese mega-prompt en siete nodos aislados con contexto minimo ("clean-context workers"), gates de verificacion adversarial y un punto de control con intervencion humana (HITL) antes de cualquier mutacion en base de datos.

El unico componente generativo del sistema es Gemini 2.5 Flash, invocado a traves de su API para el nodo de extraccion de especificaciones. El resto de nodos son deterministas: enrutado por regex y clasificacion semantica, valoracion relacional con PostgreSQL `pg_trgm` y un quality checker basado en reglas de negocio. El proyecto se publica bajo licencia MIT y declara soporte para ingles y castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Maquina de estados multi-agente (agent graph) sobre Next.js; no es una red neuronal propia |
| Parametros totales | no aplica (no distribuye pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (delegada al modelo subyacente, Gemini 2.5 Flash) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en, es |
| Licencia | MIT |
| Formato de pesos | no aplica; se distribuye codigo TypeScript / Next.js |
| Modelo generativo subyacente | Gemini 2.5 Flash (API externa) |
| Validacion de esquemas | Zod (validacion estricta en el nodo extractor) |
| Almacenamiento y grounding | PostgreSQL con indice invertido GIN y extension `pg_trgm` |
| Nodos del grafo | 7 (router, extractor, valuator, fan-out de copy, quality checker, gate HITL, dispatcher) |
| Pipeline declarado | text-generation |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

No hay entrenamiento. El proyecto no entrena ni ajusta ningun modelo: es una capa de orquestacion que envuelve llamadas a una API propietaria (Gemini 2.5 Flash) con esquemas tipados y reglas deterministas. El grafo se organiza en siete etapas secuenciales con un unico punto de paralelismo:

1. **Intent Router** (menos de 15 ms): clasificacion por regex y semantica hacia `ADD_STOCK`, `APPRAISAL`, `LEAD_CRM` o `GENERAL_FAQ`, con fallback a `GENERAL_FAQ`.
2. **Spec Extractor** (unos 250 ms): Gemini 2.5 Flash con validacion estricta de esquema Zod sobre los campos marca, modelo, anio, km y precio de venta.
3. **Relational Valuator** (menos de 5 ms): valoracion contra catalogo oficial mediante indice GIN de `pg_trgm`, no mediante recuperacion vectorial. El principio declarado es "relational grounding over vector search": no se le pide al LLM que recuerde numeros, se consultan.
4. **Concurrent Fan-Out** (unos 2,2 s): generacion simultanea de copys para Instagram, Facebook, MercadoLibre y WhatsApp, con limites de caracteres por plataforma.
5. **Quality & Margin Checker** (menos de 2 ms): gate adversarial determinista que rechaza margenes fuera del rango 15-25 %.
6. **Human-in-the-Loop Gate**: estado suspendido que espera confirmacion explicita humana.
7. **Transactional Dispatcher**: escritura serial en PostgreSQL y publicacion en APIs de marketplace.

La innovacion tecnica destacable es de ingenieria, no de modelado: separacion estricta entre lectura paralelizable (generacion de copys en fan-out) y mutacion serial (escrituras en base de datos y publicaciones), verificacion adversarial donde ningun agente generativo se autoevalua, y aislamiento de contexto por nodo para reducir deriva cognitiva y consumo de tokens.

## Capacidades

- Extraccion estructurada de datos de vehiculos a partir de mensajes informales en lenguaje natural ("Just took in a 2021 Toyota Corolla XEI with 45k km, clean title, asking 22M ARS"), con validacion de esquema Zod.
- Clasificacion de intencion en cuatro rutas: alta de stock, tasacion, gestion de leads CRM y preguntas frecuentes.
- Valoracion de precios contra catalogo oficial con grounding relacional sobre PostgreSQL, con trazabilidad del origen del dato (`source: 'POSTGRES_PG_TRGM'`).
- Calculo y aplicacion de margen comercial de concesionario, con validacion automatica del rango 15-25 %.
- Generacion multicanale de contenido de marketing: caption y hashtags para Instagram, titulo y descripcion para Facebook y MercadoLibre, y pitch de chat para WhatsApp.
- Orquestacion multi-agente con estado tipado y explicito (`AutoAppState`), incluyendo campos de validacion (`passed`, `errors`) y de confirmacion (`requiresConfirmation`).
- Punto de control human-in-the-loop que suspende el flujo antes de cualquier mutacion persistente.
- Telemetria de latencia y guardrails por nodo.
- Multilingue limitado a ingles y castellano segun los metadatos del repositorio.
- No soporta tool calling generico declarado ni function calling como capacidad del "modelo": el enrutado y las herramientas son codigo determinista del consumidor, no capacidades inferidas por el LLM.
- No hay capacidades de vision, audio, thinking mode ni decodificacion especulativa documentadas.

## Casos de uso

- **Alta de stock desde mensajes informales de comerciales**: el router clasifica la intencion en menos de 15 ms y el extractor convierte texto libre de WhatsApp en un objeto `draftVehicle` tipado. Es adecuado porque la validacion Zod detiene datos incompletos o malformados antes de que contaminen el pipeline.
- **Tasacion de vehiculos usados contra catalogo oficial**: el nodo valuator consulta un indice GIN de `pg_trgm` en menos de 5 ms en lugar de pedirle cifras al LLM, lo que elimina la alucinacion numerica en un dominio donde un error de precio tiene impacto economico directo.
- **Generacion de anuncios para multiples canales en una sola pasada**: el fan-out concurrente produce copy para Instagram, Facebook, MercadoLibre y WhatsApp en aproximadamente 2,2 s, aplicando los limites de caracteres de cada plataforma.
- **Control de politica comercial antes de publicar**: el quality checker determinista rechaza cualquier operacion cuyo margen quede por debajo del 15 %, funcionando como gate adversarial independiente de los agentes generativos.
- **Aprobacion humana antes de escrituras irreversibles**: el gate HITL suspende el estado y espera confirmacion explicita, lo que permite usar el sistema en produccion sin riesgo de publicar precios o anuncios erroneos en marketplaces.
- **Gestion de leads y atencion de preguntas frecuentes en el CRM**: las rutas `LEAD_CRM` y `GENERAL_FAQ` aprovechan el mismo router y el mismo estado tipado para derivar consultas comerciales sin coste de inferencia generativa.
- **Plantilla de referencia para otros dominios B2B**: el patron de nodos limpios con contexto minimo, gates deterministas y mutaciones seriales es reutilizable en seguros, inmobiliaria o logistica, siempre que el equipo de ingenieria defina los esquemas y las invariantes.
- **Auditoria de latencia por etapa**: la tabla de telemetria por nodo permite identificar que etapa del flujo consume el presupuesto de latencia (aqui, el fan-out de copy con 2,2 s frente a los milisegundos de router, valuator y checker).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, ni comparaciones con modelos de lenguaje. Los unicos datos de rendimiento son las latencias autoinformadas por el autor para cada nodo del grafo:

| Nodo | Mecanismo | Latencia declarada | Guardrail |
|---|---|---|---|
| Router | Regex y clasificacion semantica | menos de 15 ms | Fallback a GENERAL_FAQ |
| Extractor | Gemini 2.5 Flash y Zod | aproximadamente 250 ms | Validacion estricta de esquema |
| Valuator | PostgreSQL `pg_trgm` GIN | menos de 5 ms | Grounding contra libros oficiales |
| Copy Fan-Out | Concurrencia asincrona | aproximadamente 2,2 s | Limites de caracteres por plataforma |
| Quality Checker | Reglas de negocio deterministas | menos de 2 ms | Rechaza margen menor del 15 % |
| HITL Gate | Checkpoint de estado suspendido | intervencion humana | Boton de confirmacion explicito |

Estas cifras proceden de la model card del autor, no de una evaluacion independiente, y no incluyen informacion sobre hardware, region de despliegue ni tasa de acierto del router o del extractor.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El componente generativo se consume via API de Gemini 2.5 Flash, por lo que no se requiere GPU local para ejecutar el blueprint.
- GPU recomendadas: no disponible / no aplica para el grafo. Si se sustituyese Gemini por un modelo local equivalente, los requisitos dependerian de ese modelo, dato no especificado en la informacion disponible.
- GPU de consumo: no aplica al blueprint. El sistema corre en un runtime Node.js, no en GPU.
- Infraestructura minima necesaria: runtime Node.js con Next.js, una instancia de PostgreSQL con la extension `pg_trgm` habilitada e indices GIN, y una clave de API de Gemini.
- Opciones de despliegue: servidor Next.js (Node.js) propio, plataformas de hosting compatibles con Next.js, o contenedor con PostgreSQL gestionado. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no existen pesos que servir.
- Latencia: segun la telemetria del autor, el coste dominante es el fan-out de generacion de copy (aproximadamente 2,2 s), mientras que router, valuator y quality checker suman menos de 25 ms. El nodo extractor anade unos 250 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

Este proyecto no compite con modelos de lenguaje, sino con frameworks de orquestacion de agentes. La tabla siguiente es una comparacion cualitativa basada en documentacion publica de esos proyectos, no verificada en esta busqueda:

| Proyecto | Categoria | Lenguaje principal | Enfoque de orquestacion | Licencia | Modelo subyacente |
|---|---|---|---|---|---|
| autoapp-agent-graph | Blueprint de dominio (automocion B2B) | TypeScript / Next.js | Maquina de estados de 7 nodos con gates deterministas y HITL | MIT | Gemini 2.5 Flash (API) |
| LangGraph | Framework de grafos de estado | Python y JavaScript | Grafo de estados con checkpoints y control de flujo | MIT | Agnastico al proveedor |
| CrewAI | Framework multi-agente | Python | Agentes con roles y tareas delegadas | MIT | Agnastico al proveedor |
| Microsoft AutoGen | Framework multi-agente conversacional | Python y .NET | Conversaciones entre agentes con ejecucion de codigo | MIT | Agnastico al proveedor |

Diferencias clave: los tres frameworks alternativos son genericos y agnosticos al modelo, mientras que autoapp-agent-graph es vertical, esta atado a Gemini 2.5 Flash y a PostgreSQL, y no esta pensado para reutilizarse como libreria sino como referencia de diseno. Datos de rendimiento comparado: no disponible.

## Limitaciones y advertencias

- No es un modelo: no existen pesos, tokenizador, configuracion de inferencia ni artefactos descargables. Cualquier pipeline que espere safetensors o GGUF fallara.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-09-16). No hay evidencia de uso en produccion ni de validacion por terceros.
- Las latencias publicadas son autoinformadas por el autor y no especifican hardware, region, carga concurrente ni condiciones de red.
- Dependencia fuerte de un proveedor propietario: el nodo de extraccion requiere la API de Gemini 2.5 Flash, con los costes, limites de tasa y condiciones de servicio asociados. La licencia MIT cubre el codigo del blueprint, no el modelo subyacente.
- Dependencia de infraestructura especifica: PostgreSQL con la extension `pg_trgm` y indices GIN, ademas del esquema de catalogo oficial contra el que se hace el grounding.
- Riesgo de alucinacion acotado pero no eliminado: el extractor sigue siendo un LLM y puede producir campos plausibles pero incorrectos que superen la validacion de tipos (por ejemplo, un kilometraje numerico equivocado). La validacion Zod comprueba forma, no veracidad.
- Cobertura idiomatica declarada limitada a ingles y castellano. El caso de uso descrito opera con jerga comercial argentina y precios en ARS, lo que puede no generalizar a otros mercados.
- Los limites de margen (15-25 %) y el rango de aceptacion son reglas de negocio codificadas para un concesionario concreto; reutilizarlas sin recalibrar puede rechazar operaciones validas.
- El sistema depende de un gate humano para las escrituras; en escenarios de alto volumen el cuello de botella pasa a ser operativo, no tecnico.
- Ausencia total de benchmarks de calidad (precision de extraccion, tasa de falsos positivos del checker, exactitud de la clasificacion de intencion), lo que impide estimar el comportamiento real del pipeline.
- Los resultados de la busqueda web realizada no aportan informacion adicional verificable sobre el proyecto; todas las referencias utiles provienen del propio repositorio del autor.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/thomasskarp/autoapp-agent-graph
- Repositorio GitHub: https://github.com/thomasskarp/autoapp
- Mapa de arquitectura del grafo de agentes (AGENT_GRAPH.md): https://github.com/thomasskarp/autoapp/blob/main/AGENT_GRAPH.md
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
