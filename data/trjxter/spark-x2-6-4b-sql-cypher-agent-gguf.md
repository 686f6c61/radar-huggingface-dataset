# trjxter/Spark-X2.6-4B-SQL-Cypher-Agent-GGUF

## Resumen

Spark-X2.6-4B-SQL-Cypher-Agent-GGUF es la distribucion en formato GGUF del modelo trjxter/Spark-X2.6-4B-SQL-Cypher-Agent, un ajuste fino mediante LoRA sobre XHToken/Spark-X2.6-4B. El modelo resuelve una tarea muy concreta: responder preguntas sobre una base de datos generando una unica consulta de solo lectura, ya sea en SQLite SQL o en Cypher para Neo4j, razonando previamente antes de emitir la consulta. Con 4.112.079.360 parametros (~4B), esta pensado para integrarse como agente con tool calling en pipelines de analitica conversacional.

El repositorio GGUF incluye cinco cuantizaciones (Q8_0, Q6_K_XL, Q6_K, Q4_K_XL y Q4_K_M) generadas con llama.cpp a partir del modelo fusionado en bf16, ademas de la importance matrix empleada para calibrar las variantes K-quant. La arquitectura subyacente es la denominada "Spark" (`spark2_5` en llama.cpp), que requiere llama.cpp b10828 o superior. El modelo esta entrenado solo en ingles y se distribuye bajo licencia Apache-2.0.

Su relevancia practica radica en el binomio tamano-rendimiento: con 4B parametros y cuantizaciones de entre 2,6 y 4,4 GB, puede ejecutarse en una GPU de consumo, y el autor reporta una precision de ejecucion del 43,7% en un test de 1.000 preguntas frente al 32,5% del modelo base (una mejora de 10,7 puntos, p ≈ 4e-13). Es, por tanto, una pieza especializada para text-to-SQL y text-to-Cypher mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark (`spark2_5` en llama.cpp), transformer; detalles internos no disponibles |
| Parametros totales | 4.112.079.360 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K_XL, Q6_K, Q4_K_XL, Q4_K_M (ademas de BF16 en el modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del modelo base XHToken/Spark-X2.6-4B, que emplea la arquitectura Spark (identificador `spark2_5` en llama.cpp). El modelo resultante se fusiona en bf16 y de ahi se derivan las cuantizaciones GGUF mediante `convert_hf_to_gguf.py` (build b11779) y `llama-quantize` de la misma compilacion. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; solo indica que se trata de un fine-tune LoRA y que los datasets de entrenamiento tienen licencias MIT y Apache-2.0.

La innovacion tecnica mas destacable esta en el proceso de cuantizacion. Las variantes K-quant se generaron con una importance matrix construida a partir de aproximadamente 242.000 tokens de los propios ejemplos de entrenamiento del modelo (pensamientos, tool calls y esquemas de los cuatro datasets), lo que calibra la cuantizacion sobre la distribucion real de uso. Ademas, el autor define una receta propia "XL" que aplica Q8_0 al embedding de tokens (que hace doble funcion como cabeza de salida, el 8,2% de los pesos) y sube un escalon las matrices de atencion (`attn_qkv`, `attn_output`), manteniendo el bloque feed-forward (69% de los pesos) en el tipo base. Segun el autor, en Q4 esto reduce a la mitad la divergencia KL respecto a Q4_K_M. El modelo incorpora plantilla de chat embebida y modo de razonamiento activado por defecto.

## Capacidades

- Generacion de texto conversacional orientada a tareas de bases de datos.
- Text-to-SQL: genera una unica consulta SQLite SQL de solo lectura a partir de una pregunta en lenguaje natural y un esquema proporcionado en el mensaje de sistema.
- Text-to-Cypher: genera una unica consulta Cypher para Neo4j bajo el mismo esquema de funcionamiento.
- Tool calling / function calling: emite llamadas estructuradas a una herramienta de ejecucion de consultas (`run_query`) con el argumento `query`.
- Razonamiento previo (thinking mode): produce una cadena de pensamiento separada en `message.reasoning_content` antes de la llamada a herramienta; configurable con `enable_thinking: false` o `reasoning_effort: low` (la plantilla solo admite `high` y `low`).
- Formato de salida parseado: la respuesta se devuelve dividida entre pensamiento y `tool_calls`, lo que facilita su integracion en agentes.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistente de analitica sobre SQLite: el modelo recibe el esquema de la base de datos en el mensaje de sistema y la pregunta del usuario, y devuelve una consulta SQL de solo lectura lista para ejecutar; su ventana de contexto configurable (el ejemplo usa 8192 tokens) permite incluir esquemas de tamano moderado.
- Consultas sobre grafos Neo4j: generacion de Cypher para equipos que trabajan con bases de datos de grafos y necesitan una capa de lenguaje natural sin escribir consultas a mano.
- Agente de autoservicio para equipos de datos: integrado via tool calling en un orquestador, el modelo decide la consulta y el orquestador la ejecuta y devuelve el resultado, reduciendo la dependencia del equipo de BI para consultas rutinarias.
- Despliegue en local o en el borde: con cuantizaciones de 2,6 a 4,4 GB cabe en GPUs de consumo (por ejemplo, una RX 7800 XT de 16 GB segun las pruebas del autor), lo que permite montar un asistente de consultas sin enviar esquemas ni datos a servicios externos.
- Generacion de consultas en pipelines de CI/CD o herramientas internas: al requerir solo llama.cpp b10828 o superior y exponer una API compatible con OpenAI (`llama-server`), puede integrarse como microservicio en herramientas de desarrollo.
- Prototipado rapido de interfaces text-to-query: util para validar la viabilidad de una funcionalidad de consulta en lenguaje natural antes de invertir en modelos mayores, dado su bajo coste de inferencia (90-138 tok/s segun cuantizacion en la GPU citada).
- Educacion y demostraciones: su tamano reducido y su salida estructurada (pensamiento + consulta) lo hacen adecuado para mostrar como razona un agente antes de emitir una consulta, en entornos de formacion.

## Benchmarks y rendimiento

Los datos disponibles son de evaluacion propia del autor sobre ejecucion de consultas (execution accuracy), no benchmarks estandar como MMLU o HumanEval.

| Metrica | Resultado |
|---|---|
| Precision en evalset de 200 preguntas (adaptador sin fusionar sobre base bf16) | 45,4% |
| Precision en evalset de 200 preguntas, Q8_0 | 43,2% |
| Precision en evalset de 200 preguntas, Q6_K_XL | 44,5% |
| Precision en evalset de 200 preguntas, Q6_K | 41,5% |
| Precision en evalset de 200 preguntas, Q4_K_XL | 42,7% |
| Precision en evalset de 200 preguntas, Q4_K_M | 42,5% |
| Precision en test set de 1.000 preguntas, Q8_0 | 43,7% |
| Precision en test set de 1.000 preguntas, Spark-X2.6-4B base en Q8_0 | 32,5% |
| KLD vs BF16 (Q8_0 / Q6_K_XL / Q6_K / Q4_K_XL / Q4_K_M) | 0,0005 / 0,0016 / 0,0026 / 0,0119 / 0,0224 |
| Mismo token top vs BF16 (Q8_0 / Q6_K_XL / Q6_K / Q4_K_XL / Q4_K_M) | 99,45% / 99,08% / 98,81% / 97,36% / 96,51% |
| Velocidad de generacion en AMD RX 7800 XT (Q8_0 / Q6_K_XL / Q6_K / Q4_K_XL / Q4_K_M) | 90 / 105 / 119 / 126 / 138 tok/s |
| Velocidad BF16 en la misma GPU | 58 tok/s |

Notas del autor: con 200 preguntas, el margen de ruido es de aproximadamente ±3,5 puntos, por lo que esas cinco cifras no permiten ordenar las cuantizaciones entre si. La mejora de Q8_0 sobre el base en el test de 1.000 preguntas es de +10,7 puntos con p ≈ 4e-13. Las mediciones de velocidad se hicieron con `llama-bench` (128 tokens), ROCm y flash attention.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB (Q4_K_M), 2,85 GB (Q4_K_XL), 3,38 GB (Q6_K), 3,69 GB (Q6_K_XL) y 4,38 GB (Q8_0) solo para los pesos; hay que sumar el espacio de la cache KV segun el contexto configurado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones Q4; el autor valido el modelo en una AMD RX 7800 XT (16 GB, ROCm) con flash attention.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas para Q4_K_M/Q4_K_XL, y de 6 GB o mas para Q8_0 con contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con requisito minimo de la build b10828 o superior; API compatible con OpenAI para peticiones de chat con `tools`.
- Parametros de ejecucion sugeridos por el autor: `-ngl 99 -fa on -c 8192 --reasoning-budget 1024`, `temperature: 0` para consultas, y `--reasoning-effort` limitado a `high` o `low`.
- Latencia y throughput: 90 tok/s (Q8_0) hasta 138 tok/s (Q4_K_M) en una RX 7800 XT; BF16 a 58 tok/s en la misma tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-SQL-Cypher-Agent (este) | ~4B | no disponible | Text-to-SQL y text-to-Cypher con tool calling | Apache-2.0 | GGUF en Hugging Face |
| XHToken/Spark-X2.6-4B (base) | ~4B | no disponible | Proposito general | Apache-2.0 | Hugging Face |
| Otros modelos text-to-SQL de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos especializados en text-to-SQL o text-to-Cypher que permitan una comparacion cuantitativa fiable; la unica referencia directa es el modelo base, sobre el que este ajuste mejora 10,7 puntos en el test de 1.000 preguntas.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Genera una unica consulta por turno y esta restringido a consultas de solo lectura; no esta pensado para operaciones de escritura ni para planes multi-consulta complejos.
- Riesgo de alucinacion en nombres de tablas, columnas o relaciones si el esquema proporcionado es incompleto o ambiguo; la precision medida (43,7% en el test de 1.000 preguntas) implica que mas de la mitad de las consultas no son correctas en ese conjunto.
- El modo de razonamiento esta activado por defecto y consume tokens; hay que ajustar `--reasoning-budget` o `reasoning_effort` para controlar latencia y coste.
- Requiere llama.cpp b10828 o superior por la arquitectura `spark2_5`; versiones anteriores no cargaran el modelo.
- La plantilla de chat solo admite `reasoning_effort` con valores `high` y `low`; configurar `medium` a nivel de servidor provocara un comportamiento no soportado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad sobre los resultados reportados por el autor.
- Aunque la licencia es Apache-2.0, conviene revisar las licencias de los datasets de entrenamiento (MIT y Apache-2.0 segun el autor) antes de un uso comercial.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto maxima ni comportamiento fuera del dominio de bases de datos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/trjxter/Spark-X2.6-4B-SQL-Cypher-Agent-GGUF
- Modelo base del ajuste: https://huggingface.co/trjxter/Spark-X2.6-4B-SQL-Cypher-Agent
- Modelo preentrenado original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Ficheros de cuantizacion: Spark-X2.6-4B-SQL-Cypher-Agent-Q8_0.gguf, Spark-X2.6-4B-SQL-Cypher-Agent-Q6_K_XL.gguf, Spark-X2.6-4B-SQL-Cypher-Agent-Q6_K.gguf, Spark-X2.6-4B-SQL-Cypher-Agent-Q4_K_XL.gguf, Spark-X2.6-4B-SQL-Cypher-Agent-Q4_K_M.gguf
- Importance matrix: Spark-X2.6-4B-SQL-Cypher-Agent-imatrix.gguf
- No se han proporcionado enlaces a papers, blogs, repositorios de codigo ni demos en la informacion disponible.
