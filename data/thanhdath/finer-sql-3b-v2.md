# thanhdath/FINER-SQL-3B-v2

## Resumen

FINER-SQL-3B-v2 es un modelo de generacion de texto especializado en text-to-SQL desarrollado por el usuario de HuggingFace thanhdath. Se trata de un ajuste fino del modelo base Qwen2 de 3B parametros (3.085.938.688 parametros totales segun los pesos en safetensors), entrenado mediante GRPO (Group Relative Policy Optimization) con una recompensa compuesta de formato y ejecucion sobre CoRE-DB, el entorno de base de datos compacto enriquecido con contraejemplos descrito en el trabajo *Small Language Models for Text-to-SQL against Spurious Correctness*. El checkpoint publicado corresponde al step 1000, seleccionado sobre el conjunto de desarrollo.

El modelo aborda un problema concreto y bien delimitado: la generacion de consultas SQL correctas contra esquemas de bases de datos reales, con especial atencion al fenomeno de la "correccion espuria" (consultas que se ejecutan sin error pero devuelven resultados incorrectos). Al estar construido sobre una base de 3B parametros, esta disenado para desplegarse en entornos con recursos limitados, lo que lo hace relevante para equipos que necesitan un generador SQL local sin depender de APIs de modelos frontera.

La relevancia actual del modelo radica en su enfoque de entrenamiento con refuerzo sobre ejecucion real (execution reward) en lugar de simple imitacion supervisada, y en sus resultados reportados en los benchmarks BIRD y Spider, que lo situan en un rango competitivo para su tamano. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, probablemente bf16/fp16; no se confirman GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only de la familia Qwen2, con 3.085.938.688 parametros totales. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto nativa en la informacion proporcionada; estos datos habria que consultarlos en la configuracion del repositorio o en la documentacion del modelo base Qwen2 de 3B.

El entrenamiento se realizo mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que compara grupos de muestras generadas para estimar la ventaja relativa de cada respuesta sin necesidad de un modelo critico separado. La funcion de recompensa combina dos componentes: una recompensa de formato, que penaliza salidas que no respetan la estructura esperada de la consulta SQL, y una recompensa de ejecucion, que valora si la consulta generada produce el resultado correcto al ejecutarse contra la base de datos. El entorno de entrenamiento es CoRE-DB, descrito como una base de datos compacta enriquecida con contraejemplos, disenada especificamente para combatir la correccion espuria. El checkpoint publicado es el step 1000, elegido por su rendimiento en el conjunto de desarrollo.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural (text-to-SQL) sobre esquemas de bases de datos relacionales.
- Razonamiento sobre esquemas: el modelo trabaja contra bases de datos concretas, lo que implica capacidad de interpretar tablas, columnas y relaciones.
- Entrenamiento orientado a la correccion semantica: la recompensa de ejecucion busca reducir consultas sintacticamente validas pero semanticamente erroneas.
- Generacion de texto general (pipeline text-generation), aunque el ajuste esta claramente orientado a la tarea SQL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente SQL en herramientas de analitica interna: el modelo traduce preguntas de negocio en lenguaje natural a consultas SQL ejecutables sobre el esquema de un data warehouse, reduciendo la dependencia de analistas para consultas repetitivas. Su entrenamiento con recompensa de ejecucion lo hace adecuado para entornos donde una consulta incorrecta pero valida es especialmente costosa.
- Generacion de consultas en pipelines de BI: integrado como paso previo a la ejecucion en herramientas de business intelligence, el modelo puede generar y validar consultas contra el esquema antes de lanzarlas, con un coste de inferencia bajo al ser un modelo de 3B.
- Soporte a desarrolladores en migraciones de bases de datos: dado un esquema nuevo, el modelo puede reescribir consultas existentes o generar equivalentes, util en tareas de refactorizacion de capa de datos.
- Educacion y formacion en SQL: el modelo puede generar consultas de referencia para ejercicios y comparar con la solucion del estudiante, aprovechando su entrenamiento contra contraejemplos para explicar por que una consulta aparentemente correcta falla.
- Despliegue local con privacidad de datos: al ser un modelo de 3B con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar esquemas ni datos sensibles a APIs externas, requisito habitual en sectores regulados.
- Evaluacion automatizada de esquemas y consultas: el modelo puede usarse como generador de consultas candidatas en procesos de test de bases de datos, produciendo consultas que luego se validan por ejecucion contra el entorno CoRE-DB o similar.
- Prototipado rapido de interfaces de consulta en lenguaje natural: equipos que construyen chatbots sobre bases de datos pueden usar este checkpoint como base para validar la viabilidad de la tarea antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los de la model card, medidos con k = 30 muestras, temperatura T = 1.0, seleccion vote-after-verify y evaluadores oficiales:

| Benchmark | Metrica | Resultado |
|---|---|---|
| BIRD dev | Execution Accuracy (EX) | 68.77 |
| Spider dev | Execution Accuracy (EX) | 86.75 |
| Spider dev | Test Suite accuracy (TS) | 81.53 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos benchmarks bajo identicas condiciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 8 GB de VRAM para contexto corto.
- Cuantizacion: no se confirman pesos GGUF ni AWQ en el repositorio; si se generan cuantizaciones de 8 bits o 4 bits, el modelo podria caber en GPUs de 4-6 GB, pero este dato no esta verificado en la informacion disponible.
- GPU recomendadas: para bf16, una RTX 3090, RTX 4090, A10G, L4 o A100 son suficientes; para despliegues de alto throughput, A100 o H100 con vLLM.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bf16 (por ejemplo RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4 bits podria caber en GPUs de 4-6 GB, sujeto a conversion no confirmada.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama si se generan los formatos correspondientes, aunque estos ultimos no se confirman.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| FINER-SQL-3B-v2 | 3,09B | no disponible | Apache 2.0 | text-to-SQL con GRPO sobre CoRE-DB |
| Qwen2-3B (base) | ~3B | no disponible en esta ficha | Apache 2.0 | modelo generalista, sin ajuste SQL |
| Alternativas text-to-SQL de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de estos modelos bajo las mismas condiciones de evaluacion (k = 30, T = 1.0, vote-after-verify), por lo que no se ofrece comparacion numerica.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a text-to-SQL; su rendimiento en tareas generales de generacion de texto puede degradarse respecto al modelo base Qwen2.
- Riesgo de alucinacion de esquema: como todo modelo generativo, puede inventar tablas, columnas o funciones SQL que no existen en el esquema real; es imprescindible validar por ejecucion antes de usar la consulta en produccion.
- Correccion espuria residual: aunque el entrenamiento con contraejemplos busca mitigarla, no se garantiza la eliminacion total; los resultados de BIRD dev (68.77 EX) implican que aproximadamente un tercio de las consultas no son correctas en ese conjunto.
- Idiomas: no se especifican los idiomas soportados; no hay garantia de buen rendimiento en castellano ni en otros idiomas distintos del ingles, idioma dominante en los benchmarks BIRD y Spider.
- Longitud de contexto: no disponible; esquemas de bases de datos grandes pueden exceder la ventana del modelo y requerir estrategias de recuperacion o fragmentacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar las obligaciones de atribucion y las condiciones del modelo base Qwen2 del que deriva.
- Procedencia del checkpoint: es un checkpoint comunitario con 166 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente de los resultados reportados.
- Metodologia de evaluacion: los resultados se obtuvieron con k = 30 muestras y seleccion vote-after-verify, lo que implica un coste de inferencia 30 veces mayor que una generacion unica; el rendimiento en modo de una sola pasada puede ser inferior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thanhdath/FINER-SQL-3B-v2
- Prompts de evaluacion: https://huggingface.co/thanhdath/core-db-evaluation-prompts
- Repositorio de codigo core-db-sql: no se proporciona la URL exacta en la informacion disponible (referenciado como `core-db-sql` en GitHub)
- Paper de referencia: *Small Language Models for Text-to-SQL against Spurious Correctness* (no se proporciona URL en la informacion disponible)
- Benchmarks BIRD: no se proporciona enlace en la informacion disponible
- Benchmarks Spider: no se proporciona enlace en la informacion disponible
