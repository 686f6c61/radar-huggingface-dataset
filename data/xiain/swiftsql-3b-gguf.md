# xiain/SwiftSQL-3B-GGUF

## Resumen

SwiftSQL-3B es un modelo especializado en text-to-SQL, es decir, en traducir preguntas en lenguaje natural a consultas SQL ejecutables. Lo desarrolla el usuario xiain a partir de Qwen/Qwen2.5-Coder-3B-Instruct mediante ajuste fino supervisado (SFT) verificado en un sandbox de SQLite y una fase posterior de DPO guiado por ejecución y estabilizado con RPO. La distribucion disponible en este repositorio es en formato GGUF, pensada para inferencia local en equipos de consumo.

El modelo es bilingue (ingles y chino) y multidioma en cuanto a dialectos SQL: soporta PostgreSQL, MySQL y SQLite de forma nativa, aceptando DDL `CREATE TABLE` estandar sin conversiones a formatos propietarios. Su propuesta diferencial es doble: por un lado, una politica de rechazo anti-alucinacion que devuelve `"answerable": false` cuando el esquema no contiene las columnas necesarias; por otro, una salida JSON estricta y un modo de autorreparacion de SQL en un solo intento (`repair_sql`).

Con 3.085.938.688 parametros y un peso de 1,80 GB en cuantizacion Q4_K_M, esta pensado para ejecutarse comodamente en Apple Silicon de 16 GB (Mac mini, MacBook) y en GPUs de consumo, ademas de servir APIs compatibles con OpenAI a traves de llama.cpp u Ollama. Es relevante ahora porque cubre un nicho concreto de analitica de datos y agentes SQL donde los modelos generalistas de 3B fallan con frecuencia por fabricacion de columnas inexistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--ctx-size 4096` |
| Tipos de cuantizacion | Q4_K_M (1,80 GB) y Q8_0 (3,06 GB) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Coder-3B-Instruct, sin modificaciones estructurales documentadas. El entrenamiento se articula en dos fases: primero un SFT sobre SQL ejecutable verificado en un sandbox de SQLite, y despues un DPO iterativo guiado por ejecucion y estabilizado con RPO (`rpo_alpha=0.5`), que penaliza las salidas no ejecutables o sintacticamente invalidas. Los datasets citados son `gretelai/synthetic_text_to_sql`, `trl-lab/SQaLe-text-to-SQL-dataset` y `jtjt520j/CSpider_and_DUSQL_sql_create_context`.

La innovacion destacable es el llamado "Fast Auto-Think": el modelo deja el campo `plan` vacio en consultas simples y con un solo JOIN, y solo emite un plan telegrafico de 60 caracteres o menos en consultas complejas (multi-JOIN, CTE, subconsultas, HAVING o funciones de ventana). Esto reduce la latencia frente a esquemas de chain-of-thought completos. Ademas, la salida se fuerza a un unico objeto JSON parseable con campos `answerable`, `plan`, `dialect`, `sql`, `tables` y `missing`, lo que facilita su integracion en pipelines automatizados.

## Capacidades

- Generacion de SQL a partir de lenguaje natural en ingles y chino, con DDL de entrada en formato `CREATE TABLE` estandar.
- Soporte nativo de tres dialectos: PostgreSQL, MySQL y SQLite, seleccionables mediante el campo `Dialect` del prompt.
- Rechazo anti-alucinacion: devuelve `"answerable": false`, `sql` vacio y la lista de columnas faltantes en `missing` cuando el esquema no permite responder.
- Autorreparacion de SQL en un solo intento mediante la tarea `repair_sql`, que recibe la consulta fallida y el mensaje de error de la base de datos.
- Salida JSON estricta con cumplimiento del 100 % en la evaluacion reportada.
- Modo auto de razonamiento (plan vacio o telegrafico segun complejidad de la consulta).
- Capacidad conversacional segun los tags del repositorio (`conversational`).
- Compatibilidad con endpoints tipo OpenAI a traves de llama.cpp y Ollama.
- No se documentan capacidades de vision, audio, tool calling generico ni razonamiento matematico fuera del ambito SQL.

## Casos de uso

- Asistente de analitica para equipos de negocio: un usuario formula una pregunta en lenguaje natural sobre un esquema PostgreSQL y el modelo devuelve la consulta lista para ejecutar, con el plan omitido en consultas simples para minimizar latencia.
- Generacion de consultas en pipelines de BI: integrado en un gateway FastAPI con validacion `sqlglot`, el modelo produce SELECT de solo lectura que pueden encadenarse a herramientas de visualizacion o informes automatizados.
- Agente de bases de datos con autorreparacion: ante un error de sintaxis o de columna inexistente devuelto por el motor, se invoca `repair_sql` con la consulta fallida y el mensaje de error para obtener una version corregida en un unico paso.
- Chatbot interno de soporte a analistas: al recibir un esquema incompleto, el modelo responde con `answerable: false` y las columnas que faltan, evitando que el analista ejecute una consulta inventada contra produccion.
- Migracion y traduccion entre dialectos: dado un DDL y una pregunta, se puede solicitar la misma logica en MySQL o SQLite cambiando el campo `Dialect`, util para equipos con bases heterogeneas.
- Despliegue en estaciones de trabajo de desarrollador: con Q4_K_M (1,80 GB) cabe en un Mac mini de 16 GB o en una GPU de consumo, permitiendo prototipar consultas sin enviar esquemas a servicios en la nube.
- Formacion y docencia de SQL: el campo `plan` telegrafico en consultas complejas sirve como explicacion breve de la estrategia de la consulta generada.

## Benchmarks y rendimiento

Evaluacion sobre 300 muestras retenidas, multidioma y con pruebas de rechazo, segun la model card:

| Metrica | Base 3B | V1 SFT | V2 R1 (RPO-DPO) | V2 R2 (exportado) | Mejor + reparacion 1-shot |
|---|---|---|---|---|---|
| Precision de ejecucion (EX) | 59,42 % | 67,63 % | 71,28 % | 69,15 % | 70,15 % (+10,73) |
| F1 de rechazo (anti-alucinacion) | 0,00 % | 80,00 % | 67,35 % | 90,41 % | 90,41 % (+90,41) |
| Cumplimiento JSON estricto | 100,0 % | 100,0 % | 100,0 % | 100,0 % | 100,0 % |
| Sintaxis multidioma valida | 99,63 % | 100,0 % | 88,01 % | 97,38 % | 97,38 % |
| Longitud media de salida (caracteres) | 177,9 | 222,3 | 210,5 | 216,6 | 217,3 |

Las consultas generadas se transpilaron a un sandbox SQLite en memoria contra esquemas y datos semilla retenidos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5-3 GB para Q4_K_M (peso de 1,80 GB mas overhead de contexto) y unos 4-4,5 GB para Q8_0 (peso de 3,06 GB).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamano pero validas para alta concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores, y en Apple Silicon de 16 GB (Mac mini, MacBook) segun el autor.
- Opciones de despliegue: Ollama (`ollama run hf.co/xiain/SwiftSQL-3B-GGUF:Q8_0`), llama.cpp (`llama-server` con `--parallel 4 --flash-attn`), y un gateway FastAPI del repositorio del autor con autenticacion Bearer, rate limiting y bloqueo de solo lectura via `sqlglot`.
- Latencia y throughput: no se publican cifras concretas; el diseno "Fast Auto-Think" y la cuantizacion Q4_K_M buscan reducir latencia y aumentar concurrencia, pero no hay mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| SwiftSQL-3B | 3,09 B | no disponible (ejemplo a 4096) | Text-to-SQL multidioma con rechazo y reparacion | Apache 2.0 | GGUF |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | no disponible en esta ficha | Codigo generalista | Apache 2.0 | safetensors, GGUF |
| Modelos text-to-SQL genericos de 3B | no disponible | no disponible | Text-to-SQL sin politica de rechazo documentada | variable | variable |

La comparacion cuantitativa con alternativas especializadas en text-to-SQL no esta disponible en la informacion proporcionada; el unico punto de referencia numerico es el modelo base, sobre el que SwiftSQL mejora la precision de ejecucion en 10,73 puntos y el F1 de rechazo en 90,41 puntos.

## Limitaciones y advertencias

- La evaluacion se realizo con 300 muestras y contra un sandbox SQLite; el rendimiento en produccion con esquemas reales grandes puede diferir.
- Solo se documentan ingles y chino como idiomas de entrada; el rendimiento en castellano no esta verificado.
- El modelo genera exclusivamente SELECT de solo lectura por diseno, pero el autor recomienda imponer permisos de solo lectura a nivel de base de datos y validacion estatica con `sqlglot` antes de ejecutar cualquier consulta en produccion.
- Riesgo de alucinacion residual: aunque la politica de rechazo alcanza un F1 de 90,41 %, sigue habiendo casos en los que el modelo puede fabricar columnas o tablas.
- La autorreparacion de un solo intento depende de un guardrail externo que capture el error del motor; sin ese componente, la funcion `repair_sql` no se activa automaticamente.
- No se documentan sesgos especificos, pero al derivar de Qwen2.5-Coder hereda los sesgos de sus datos de entrenamiento, no auditados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la correccion de las consultas generadas.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiain/SwiftSQL-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Codigo, pipeline de entrenamiento y gateway FastAPI: https://github.com/2422725977/swift-sql
- Dataset gretelai/synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset trl-lab/SQaLe-text-to-SQL-dataset: https://huggingface.co/datasets/trl-lab/SQaLe-text-to-SQL-dataset
- Dataset jtjt520j/CSpider_and_DUSQL_sql_create_context: https://huggingface.co/datasets/jtjt520j/CSpider_and_DUSQL_sql_create_context
