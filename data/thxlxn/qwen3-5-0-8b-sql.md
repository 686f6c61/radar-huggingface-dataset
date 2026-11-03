# thxlxn/qwen3.5-0.8b-sql

## Resumen

Qwen3.5-0.8B-SQL es un modelo especializado en generación de SQL (text-to-SQL) obtenido mediante destilación de conocimiento desde un Qwen 3.5 de 9B parámetros hacia un estudiante Qwen 3.5 de 0.8B. Lo desarrolla el usuario thxlxn y se publica bajo licencia Apache 2.0. El problema que aborda es concreto: el modelo base de 0.8B cometía errores de tipo `no_such_column` en el 72% de sus fallos al construir consultas con `JOIN` sobre esquemas de múltiples tablas.

La propuesta es un pipeline de destilación con verificación automática por ejecución en SQLite: el profesor genera SQL, se valida contra el esquema DDL y solo se conservan las consultas que ejecutan correctamente. Con 1.430 ejemplos verificados y un ajuste LoRA se logra recuperar aproximadamente el 95% de la precisión del profesor, reduciendo las alucinaciones de columna un 78% y con una latencia 2,34 veces menor.

Arquitectura transformer densa de 772.845.888 parámetros (0,8B), pensada para despliegue local con requisitos de VRAM muy bajos. Es relevante para quienes necesitan text-to-SQL fiable en entornos con recursos limitados, donde un 9B no es viable por latencia o memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.5 0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 16 bits (exportado por el autor); otras cuantizaciones GGUF no confirmadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (16-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5 0.8B, un transformer denso, y se especializa mediante un LoRA de rango 16 y alpha 32 entrenado con Unsloth en precisión de 16 bits. El entrenamiento consistió en 3 épocas (270 pasos) con scheduler de learning rate coseno y optimizador `adamw_8bit`; posteriormente el adaptador se fusionó con los pesos base y se exportó a GGUF de 16 bits.

El dato diferencial es el proceso de destilación procedural. Se partió del dataset `b-mc2/sql-create-context`, filtrado para conservar únicamente esquemas que exigieran al menos un `JOIN` (2.001 filas). El profesor (Qwen 3.5 9B servido vía Ollama) generó SQL para 1.698 filas de entrenamiento; un paso de verificación automática ejecutó cada consulta contra una base SQLite con el DDL correspondiente, descartando 268 consultas inválidas y dejando 1.430 ejemplos verificados. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural y un esquema DDL dado (text-to-SQL).
- Resolución de consultas con `JOIN` sobre múltiples tablas, el punto crítico que motivó el ajuste.
- Reducción drástica de alucinaciones de columna (`no_such_column`), con anclaje al esquema proporcionado.
- Generación de SQL ejecutable y validable contra SQLite.
- Conversacional (tag `conversational` en el repositorio).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes de consulta sobre bases de datos internas: el modelo recibe el DDL de las tablas relevantes y devuelve SQL listo para ejecutar contra SQLite u otro motor compatible, con bajo índice de columnas inexistentes gracias al ajuste sobre esquemas con `JOIN`.
- Generación de SQL en herramientas de BI y analítica self-service: usuarios no técnicos formulan preguntas en inglés y el modelo traduce a consultas multi-tabla, con latencia de ~257 ms por consulta que permite respuestas interactivas.
- Validación y corrección de SQL en pipelines de datos: puede integrarse como generador en un flujo con verificación por ejecución (el mismo mecanismo usado en el entrenamiento), descartando consultas inválidas antes de llegar a producción.
- Despliegue en entornos con GPU de consumo o CPU: con 0,8B de parámetros y exportación GGUF, cabe en hardware modesto, lo que lo hace adecuado para herramientas de escritorio o servicios on-premise con VRAM limitada.
- Enriquecimiento de agentes de código: como subcomponente especializado que genera la parte SQL de una tarea mayor, reduciendo la carga sobre un modelo generalista más grande.
- Evaluación y benchmarking de pipelines text-to-SQL: sirve como baseline ligero y reproducible para comparar estrategias de destilación o de verificación por ejecución, dado que el repositorio incluye el pipeline completo.
- Prototipado rápido de interfaces de consulta a datos: al ejecutarse en local con Ollama o llama.cpp, permite iterar sobre esquemas y prompts sin coste de API.

## Benchmarks y rendimiento

Evaluación sobre 303 consultas multi-tabla no vistas; la precisión se define como ejecución válida contra una base SQLite con el esquema DDL proporcionado.

| Modelo | Parámetros | Ejecución SQL válida | Latencia media | Alucinaciones de columna |
|---|---|---|---|---|
| Qwen 3.5 (Student, base) | 0,8B | 50,50% (153/303) | ~209 ms | 108 |
| Qwen 3.5 (Teacher) | 9B | 84,49% (256/303) | ~601 ms | 20 |
| Qwen 3.5-SQL (Distilled) | 0,8B | 82,84% (251/303) | ~257 ms | 24 |

Conclusiones declaradas por el autor: reducción del 78% en errores `no_such_column` y eficiencia Pareto, ya que el estudiante destilado iguala al profesor de 9B (a 5 consultas de distancia) con una latencia 2,34 veces menor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada; con 772.845.888 parámetros, los pesos en 16 bits ocupan aproximadamente 1,5 GB, por lo que la inferencia en 16 bits requiere del orden de 2 GB de VRAM más overhead de contexto.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con 4 GB o más de VRAM debería ser suficiente en 16 bits, incluidas RTX 3060, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU consumer modernas; el autor no publica una tabla de requisitos.
- Opciones de despliegue: Ollama (usado para el profesor en el pipeline), llama.cpp y servidores GGUF; el repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: latencia media medida de ~257 ms por consulta en la evaluación del autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ejecución SQL válida (303 consultas) | Latencia media | Licencia |
|---|---|---|---|---|---|
| Qwen 3.5-SQL (Distilled) | 0,8B | no disponible | 82,84% | ~257 ms | apache-2.0 |
| Qwen 3.5 (Student, base) | 0,8B | no disponible | 50,50% | ~209 ms | no disponible |
| Qwen 3.5 (Teacher) | 9B | no disponible | 84,49% | ~601 ms | no disponible |

No se dispone de datos de otros modelos text-to-SQL especializados (por ejemplo, variantes SQLCoder o similares) en la información proporcionada, por lo que la comparativa se limita a los tres modelos evaluados por el autor.

## Limitaciones y advertencias

- Especialización estrecha: está ajustado exclusivamente para text-to-SQL sobre esquemas con `JOIN`; su rendimiento en tareas generales de lenguaje puede haberse degradado respecto al modelo base.
- Idioma: solo inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; los esquemas DDL grandes podrían no caber o degradar la calidad.
- Tasa de error residual: un 17,16% de las consultas de evaluación no ejecutaron válidamente, por lo que se recomienda verificación por ejecución en producción.
- Alucinaciones de columna: aunque reducidas a 24 en el conjunto de prueba, siguen presentes; no debe confiarse el SQL directamente a producción sin validación.
- Dataset de entrenamiento pequeño (1.430 ejemplos verificados) y derivado de un único dataset (`b-mc2/sql-create-context`), lo que puede limitar la generalización a dialectos SQL distintos de SQLite o a esquemas muy diferentes.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones del modelo base Qwen 3.5 0.8B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa prácticamente nulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thxlxn/qwen3.5-0.8b-sql
- Repositorio del pipeline de destilación: https://github.com/thxlxn/qwen3.5-0.8b-sql-distillation
- Dataset base: https://huggingface.co/datasets/b-mc2/sql-create-context
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
