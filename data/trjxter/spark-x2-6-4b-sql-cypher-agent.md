# trjxter/Spark-X2.6-4B-SQL-Cypher-Agent

## Resumen

Spark-X2.6-4B-SQL-Cypher-Agent es un modelo de 4.112 millones de parametros (4,1B) especializado en generacion de consultas de bases de datos a partir de lenguaje natural. Lo desarrolla el usuario independiente trjxter como un fine-tune LoRA de XHToken/Spark-X2.6-4B, fusionado en los pesos base, y esta disenado para actuar como agente con tool calling: recibe un esquema de base de datos en el mensaje de sistema, razona sobre la pregunta del usuario y emite una unica llamada a herramienta con una consulta de solo lectura, ya sea SQLite SQL contra un esquema relacional o Neo4j Cypher contra un esquema de grafo.

El modelo resuelve el problema del text-to-SQL y text2cypher en entornos agénticos, donde no basta con generar una consulta plausible sino que debe ejecutarse y devolver el resultado correcto. Su relevancia practica radica en que se entreno en una unica GPU de consumo (AMD RX 7800 XT de 16 GB) y se distribuye con licencia Apache 2.0, lo que lo hace desplegable en hardware modesto. Frente a su modelo base, mejora 10,7 puntos de precision de ejecucion global (de 32,5% a 43,7%) en un conjunto de test de 1.000 preguntas.

La arquitectura subyacente es la del modelo base Spark-X2.6-4B, un transformer decoder-only con soporte de tool calling y modo de razonamiento (thinking). El contexto maximo, el vocabulario y los detalles de entrenamiento del base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de XHToken/Spark-X2.6-4B); no se detalla mas |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal); GGUF en Q8_0, Q6_K_XL, Q6_K, Q4_K_XL, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del base XHToken/Spark-X2.6-4B, con el adaptador fusionado en los pesos base y exportado en bf16. La arquitectura concreta del transformer base (numero de capas, dimension oculta, atencion, etc.) no se especifica en la informacion disponible. El modelo incorpora un modo de razonamiento explicito (bloque ` thinking`) antes de emitir la llamada a herramienta, con un presupuesto de pensamiento de 1.024 tokens en la evaluacion reportada.

El entrenamiento se realizo sobre cuatro datasets: trl-lab/SQaLe-2-text-to-SQL-Queries, gretelai/synthetic_text_to_sql, neo4j/text2cypher-2025v1 y megagonlabs/cypherbench. No se detalla el numero total de tokens ni si hubo RLHF o DPO. La innovacion principal es el formato de entrenamiento agéntico: el modelo aprende a emitir una unica llamada a herramienta con nombre y argumento variables (`run_query(query)`, `execute_sql(sql)`, `cypher_query(cypher)`, etc.), a ignorar herramientas irrelevantes en la lista y a responder en una frase cuando el esquema no permite contestar la pregunta, en lugar de llamar a la herramienta.

## Capacidades

- Generacion de consultas SQLite SQL de solo lectura (SELECT o WITH ... SELECT) a partir de preguntas en lenguaje natural y un esquema relacional.
- Generacion de consultas Neo4j Cypher (MATCH ... RETURN) a partir de preguntas y un esquema de grafo (etiquetas de nodo, tipos de relacion y propiedades).
- Tool calling / function calling: emite llamadas estructuradas en formato `<tool_call>` con `<arg_key>` y `<arg_value>`.
- Razonamiento multi-paso con modo thinking antes de la llamada a herramienta.
- Comportamiento agéntico de rechazo: si el esquema no puede responder la pregunta, lo indica en una frase sin invocar la herramienta.
- Robustez ante nombres de herramienta y argumentos arbitrarios, e ignorancia de herramientas no relacionadas.
- Capacidades multilingues limitadas al ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente de consultas sobre bases de datos relacionales: el modelo recibe el DDL del esquema en el mensaje de sistema y la pregunta del usuario, y devuelve una consulta SQL ejecutable. Adecuado para integrarse en un backend que ejecute la consulta y devuelva las filas al usuario.
- Interfaz de lenguaje natural para Neo4j: con el esquema de nodos y relaciones en el system prompt, genera Cypher para explorar grafos de conocimiento, redes sociales o datos de fraude. El modelo fue entrenado especificamente con text2cypher-2025v1 y cypherbench.
- Agente de analitica conversacional: en un pipeline con multiples herramientas, el modelo selecciona la herramienta de consulta correcta e ignora las irrelevantes, lo que permite montar un agente que alterne entre SQL y Cypher segun la fuente de datos.
- Generacion de consultas en herramientas internas de BI: dado que soporta nombres de herramienta arbitrarios (`run_query`, `execute_sql`, etc.), se puede adaptar a la API de consulta existente sin reentrenar.
- Despliegue en hardware de consumo: con cuantizacion Q4_K_M o Q4_K_XL en GGUF y llama.cpp, cabe en GPUs de 16 GB o menos, lo que permite prototipar agentes de bases de datos en estaciones de trabajo o portatiles con GPU.
- Filtrado y validacion de preguntas no respondibles: el modelo esta entrenado para declinar cuando el esquema no cubre la pregunta, lo que sirve como capa de guardarrail en asistentes de datos para evitar consultas invalidas o costosas.
- Evaluacion y benchmarking de pipelines text-to-SQL: su harness de evaluacion por precision de ejecucion (comparacion de resultados, no de texto) lo hace util como referencia en la construccion de suites de test para sistemas de generacion de consultas.

## Benchmarks y rendimiento

Precision de ejecucion sobre un conjunto de test de 1.000 preguntas (250 por dataset, ninguna vista en entrenamiento). Mismo harness para ambos modelos: llama.cpp, mismos prompts, decodificacion greedy, presupuesto de pensamiento de 1.024 tokens.

| Modelo | Global | CypherBench | gretel | SQaLe | text2cypher | Llamada bien formada | Consulta parsea |
|---|---|---|---|---|---|---|---|
| Spark-X2.6-4B (base, Q8_0) | 32,5% | 22,4% | 55,3% | 36,6% | 12,4% | 95,3% | 92,2% |
| Este modelo (Q8_0) | 43,7% | 35,5% | 64,6% | 43,2% | 27,7% | 97,8% | 95,8% |

Mejora global de +10,7 puntos (intervalo del 95%: ±2,9). En comparacion pregunta a pregunta sobre las 856 preguntas puntuables por ambos: el fine-tune acerto 129 en solitario y el base 37 en solitario (test de signos, p ≈ 4e-13). El adaptador sin fusionar sobre el base bf16 obtuvo 43,9% en el mismo test, por lo que la fusion y la cuantizacion a Q8_0 no degradaron de forma medible.

Metodologia de puntuacion: una pregunta cuenta solo si la consulta devuelve el mismo resultado que la consulta de referencia (multiconjunto de filas, con orden cuando la referencia ordena). En SQaLe se comparan varias copias del esquema rellenadas aleatoriamente; en CypherBench y text2cypher se ejecutan sobre grafos muestreados en Neo4j. No se publican resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 12-16 GB.
- VRAM estimada en GGUF Q8_0: aproximadamente 4,5 GB; en Q4_K_M: aproximadamente 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 16 GB o mas para bf16 (RTX 4080/4090, A100, H100); para cuantizaciones Q4/Q6 basta con 6-8 GB (RTX 3060, RTX 4060 Ti, RX 7800 XT).
- Cabe en GPU de consumo: si, tanto en bf16 en tarjetas de 16 GB como en GGUF en tarjetas de 6-8 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (repo principal en bf16) y llama.cpp con los GGUF del repo trjxter/Spark-X2.6-4B-SQL-Cypher-Agent-GGUF. No se documenta soporte explicito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en una AMD RX 7800 XT de 16 GB, lo que da una referencia del hardware minimo de ajuste.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se comparan los aspectos estructurales conocidos frente al modelo base del que deriva.

| Modelo | Parametros | Contexto | Precision de ejecucion (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-SQL-Cypher-Agent | 4,1B | no disponible | 43,7% | Apache 2.0 | HuggingFace (bf16 + GGUF) |
| XHToken/Spark-X2.6-4B (base) | 4,1B | no disponible | 32,5% | no disponible en esta ficha | HuggingFace |

No se identifican en la informacion disponible otros modelos de tamano y tarea comparables con datos publicados.

## Limitaciones y advertencias

- Solo soporta ingles; las preguntas en otros idiomas no estan cubiertas por el entrenamiento.
- La precision de ejecucion global es del 43,7%, lo que implica que mas de la mitad de las preguntas del test no devuelven el resultado correcto. No es adecuado para uso autonomo sin validacion humana o ejecucion supervisada.
- El rendimiento mas bajo se da en text2cypher (27,7%), por lo que la generacion de Cypher es el punto mas debil frente a SQL.
- Riesgo de alucinacion en nombres de tablas, columnas o propiedades no presentes en el esquema; el modelo puede generar consultas sintacticamente validas pero semanticamente incorrectas.
- Depende de un formato de prompt especifico: mensaje de sistema con esquema, ejemplos opcionales y reglas, pregunta como mensaje de usuario y una herramienta de consulta en `tools`. Desviarse de este formato puede degradar el rendimiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets sinteticos y de benchmarks (gretel, SQaLe, cypherbench, text2cypher) puede heredar sus distribuciones y no generalizar bien a esquemas reales muy distintos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base XHToken/Spark-X2.6-4B debe verificarse por separado, ya que sus terminos no se detallan en esta ficha.
- El contexto maximo no esta documentado, lo que limita la planificacion de esquemas muy grandes en el mensaje de sistema.
- El modelo esta entrenado para consultas de solo lectura; no debe usarse para generar operaciones de escritura (INSERT, UPDATE, DELETE) sin salvaguardas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trjxter/Spark-X2.6-4B-SQL-Cypher-Agent
- GGUF para llama.cpp: https://huggingface.co/trjxter/Spark-X2.6-4B-SQL-Cypher-Agent-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Dataset SQaLe-2: https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Queries
- Dataset gretelai synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset neo4j text2cypher-2025v1: https://huggingface.co/datasets/neo4j/text2cypher-2025v1
- Dataset CypherBench: https://huggingface.co/datasets/megagonlabs/cypherbench
