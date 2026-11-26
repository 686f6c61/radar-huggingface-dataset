# vennyvirtuoso/routeagent-0.5b

## Resumen

RouteAgent-0.5b es un modelo de lenguaje especializado en enrutamiento de intenciones (intent routing) y despacho a agentes, desarrollado por el usuario vennyvirtuoso a partir de un ajuste fino del modelo base Qwen2.5-0.5B-Instruct de Alibaba. Su funcion no es la generacion de texto generalista, sino clasificar consultas de usuario y decidir a que agente o cluster de herramientas derivarlas (web_search, code_interpreter, sql_database, rag_knowledge_base o direct_response), emitiendo la decision en JSON valido conforme a RFC-8259.

El modelo resuelve un problema concreto en arquitecturas multiagente (LangGraph, CrewAI, AutoGen): la necesidad de un router rapido, determinista y barato que decida el camino de una consulta antes de invocar modelos mayores. Con 494 millones de parametros y una arquitectura transformer densa heredada de Qwen2, esta disenado para despliegues en el borde (edge) y microservicios de baja latencia, con una latencia declarada de 53,4 ms por consulta en la configuracion de evaluacion del autor.

Su relevancia actual radica en que permite separar la capa de decision (barata) de la capa de generacion (costosa), reduciendo el coste por consulta en pipelines agenticos. La licencia Apache 2.0 facilita su adopcion comercial. No obstante, el modelo es muy reciente (publicado en noviembre de 2026 segun los metadatos) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 494.032.768 (~490M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona bfloat16/fp16 en entrenamiento) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, y se ha ajustado mediante fine-tuning supervisado sobre el dataset RouteAgent, descrito por el autor como un corpus de 10.000 pares con esquema forzado (schema-enforced) para enrutamiento de intenciones multidominio y despacho de agentes. El checkpoint publicado es un merge standalone del modelo ajustado, es decir, los pesos resultantes no requieren cargar adaptadores PEFT por separado, aunque el autor menciona compatibilidad con transformers, sentence-transformers, peft y accelerate.

La innovacion principal no es arquitectonica sino de proposito: el entrenamiento fuerza al modelo a emitir exclusivamente JSON valido sin preambulo conversacional ni bloques de codigo Markdown, con un esquema que incluye campos como target_agent, urgency, rewritten_query y needs_clarification. El autor declara evaluacion sobre particiones de test disjuntas por grupo (group-disjoint) para medir generalizacion fuera de distribucion. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de intenciones y enrutamiento a un conjunto fijo de cinco destinos: web_search, code_interpreter, sql_database, rag_knowledge_base y direct_response.
- Generacion de salida estructurada en JSON valido (RFC-8259) sin texto adicional, disenada para parseo directo.
- Reescritura de la consulta del usuario (campo rewritten_query), incluyendo traduccion a SQL en casos de enrutamiento a base de datos.
- Asignacion de nivel de urgencia (campo urgency) y deteccion de necesidad de aclaracion (needs_clarification).
- Integracion declarada con frameworks multiagente: LangGraph, CrewAI y AutoGen.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se declaran capacidades de vision, audio, tool calling nativo del modelo base ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutamiento en atencion al cliente empresarial: el modelo clasifica la consulta entrante entre 77 intenciones financieras finas (cuentas, tarjetas, transferencias, disputas) y la deriva al agente o flujo adecuado con latencia de decenas de milisegundos, lo que permite atender picos de trafico sin invocar un LLM grande por consulta.
- Orquestacion de pipelines multiagente: en una arquitectura LangGraph o CrewAI, RouteAgent actua como nodo de decision inicial que selecciona que herramienta o subagente ejecuta la tarea, reduciendo el numero de llamadas a modelos mayores y el coste asociado.
- Enrutamiento hacia bases de datos: ante preguntas analiticas, el modelo emite el destino sql_database y una rewritten_query en forma de consulta SQL, que puede pasarse a un ejecutor con validacion posterior.
- Triaje de tickets de soporte: clasificacion por urgencia y tipo de incidencia en sistemas de helpdesk, usando el campo urgency para priorizar la cola de atencion.
- Despliegue en el borde y microservicios: con ~490M parametros, el modelo cabe en entornos con recursos limitados y puede servirse como microservicio de clasificacion de baja latencia junto a la aplicacion principal.
- Analitica de transcripciones de centros de llamadas: categorizacion de consultas de clientes para generar metricas de demanda por intent y derivar informes agregados.
- Filtro previo en asistentes RAG: decidir si una consulta debe resolverse contra la base de conocimiento (rag_knowledge_base), buscarse en web o responderse directamente, evitando recuperaciones innecesarias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, sobre la particion de test retenida:

| Metrica | Valor |
|---|---|
| Precision de clasificacion de ruta (fine-tuned) | 100,00% |
| Precision de ruta del baseline zero-shot | 0,00% |
| Ganancia absoluta de precision de ruta | +100,00% |
| Tasa de JSON valido (fine-tuned) | 100,00% |
| Tasa de JSON valido del baseline zero-shot | 97,00% |
| Ganancia absoluta de cumplimiento JSON | +3,00% |
| Latencia de enrutamiento de intencion unica | 53,4 ms/consulta |
| Parametros | 490M |

Advertencia: estos datos proceden exclusivamente de la model card del autor y no han sido replicados de forma independiente. Una precision del 100% y un baseline zero-shot del 0% son valores atipicos que sugieren un conjunto de test muy acotado o un esquema de evaluacion poco exigente; deben interpretarse con cautela. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/fp16, aproximadamente 1 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 0,5-0,6 GB; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones calculadas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 pueden servirlo con holgura. Para despliegue en el borde, es viable en CPU y en aceleradores de baja potencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio). El autor menciona compatibilidad con sentence-transformers, peft y accelerate.
- Latencia y throughput: el autor declara 53,4 ms por consulta en su configuracion de evaluacion; no se especifica el hardware empleado. El throughput no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RouteAgent-0.5b | ~490M | no disponible | Enrutamiento de intenciones y despacho a agentes | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | ~490M | 32.768 tokens (segun documentacion de Qwen) | Generacion de texto generalista e instrucciones | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-1.5B-Instruct | ~1.500M | 32.768 tokens (segun documentacion de Qwen) | Generacion de texto generalista e instrucciones | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | ~360M | 8.192 tokens (segun documentacion de HuggingFace) | Generacion de texto generalista en el borde | Apache 2.0 | Hugging Face |

La comparativa es aproximada: RouteAgent es un modelo de tarea especifica sin equivalente directo publicado, por lo que la comparacion con instruct generalistas mide tamano y licencia, no rendimiento en enrutamiento. No se dispone de datos independientes que permitan comparar su precision frente a alternativas.

## Limitaciones y advertencias

- Validacion externa nula: cero descargas y cero likes en el momento de la ficha; los unicos resultados son los declarados por el autor.
- Benchmark sospechosamente perfecto (100% de precision y 100% de JSON valido) con baseline zero-shot del 0%; posible sobreajuste al conjunto de test o evaluacion poco representativa. Requiere validacion propia antes de produccion.
- El conjunto de destinos esta fijado a cinco rutas; cambiar el esquema de salida o anadir agentes exige reentrenamiento o prompting adicional.
- Riesgo de alucinacion en el campo rewritten_query, especialmente al generar SQL: la consulta reescrita debe validarse y ejecutarse con permisos restringidos.
- Idiomas soportados no declarados; el comportamiento multilingue es incierto y depende del modelo base Qwen2.5.
- Longitud de contexto no especificada en la model card; no debe asumirse la ventana del modelo base sin verificacion.
- Capacidad generalista muy limitada por el tamano (490M) y por el ajuste especifico; no es adecuado como modelo de respuesta final.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el dataset RouteAgent referenciado debe verificarse de forma independiente.
- Fecha de publicacion en metadatos (noviembre de 2026) posterior a la fecha habitual de referencia; conviene confirmar la procedencia y autoria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/routeagent-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset referenciado por el autor: https://huggingface.co/datasets/RouteAgent
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del modelo.
