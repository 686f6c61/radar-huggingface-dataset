# thealper2/mlx-qwen3.5-0.8b-text-to-sql

## Resumen

`thealper2/mlx-qwen3.5-0.8b-text-to-sql` es un adaptador LoRA publicado en HuggingFace que convierte una pregunta en ingles y un esquema `CREATE TABLE` en una unica consulta SQLite. Se monta sobre el checkpoint `mlx-community/Qwen3.5-0.8B-bf16`, una conversion a MLX del modelo `Qwen/Qwen3.5-0.8B`, y esta pensado para ejecutarse en Apple Silicon mediante `mlx-lm`. El autor lo presenta como un proyecto experimental y educativo, no como un sistema listo para produccion.

El interes del adaptador esta en su relacion coste/rendimiento: con solo 3,608 millones de parametros entrenables sobre un modelo base de 752,392 millones totales, y un entrenamiento de 69 segundos en un Apple M1 de 8 GB, eleva la precision de ejecucion en el split de test de 44,0 % (base) a 90,0 % (base + adaptador). Es un ejemplo claro de como un ajuste fino pequeno y bien dirigido puede especializar un modelo compacto en una tarea estructurada.

El modelo base pertenece a la familia Qwen3.5, con arquitectura hibrida de atencion lineal y atencion completa de 24 capas. El adaptador no modifica el tokenizador ni el modelo de vision del checkpoint original: MLX-LM carga unicamente el submodelo de texto, que es el que se ajusto. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5`), transformer hibrido con atencion lineal y atencion completa, 24 capas |
| Parametros totales | 752,392 M (modelo base); 3,608 M entrenables en el adaptador LoRA |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia en entrenamiento: 256 tokens) |
| Tipos de cuantizacion | no disponible; el adaptador se entreno contra el base en bf16 sin cuantizar |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX): `adapters.safetensors` + `adapter_config.json`; requiere el base en bf16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo Qwen3.5 de 24 capas con atencion hibrida (lineal y completa). El ajuste se realizo con LoRA de rango 8, escala 20.0 y dropout 0.0, sobre las ultimas 16 capas del transformer, que es el conjunto de objetivos por defecto de MLX-LM para esta arquitectura. El optimizador fue Adam con tasa de aprendizaje 1e-05, 2000 micro-lotes de tamano 1 con acumulacion de gradiente 4, longitud maxima de secuencia de 256, enmascaramiento del prompt y checkpointing de gradientes activados. El entrenamiento se ejecuto en un Apple M1 de 8 GB con macOS 27.0, Python 3.12.15, mlx 0.32.4 y mlx-lm 0.32.2, con un tiempo de pared de 69,0 s y un pico de memoria de 7,54 GB. La perdida final de entrenamiento fue 0,076 y la de validacion 0,07.

Los datos provienen del dataset `b-mc2/sql-create-context` (78.577 preguntas en ingles con contexto `CREATE TABLE` y SQL de referencia, construido a partir de WikiSQL y Spider, licencia CC-BY-4.0). El autor aplico un unico shuffle con semilla 42 y reservo 100 ejemplos para test, 200 para validacion y 2000 para entrenamiento, descartando el resto. El formato es chat JSONL de MLX-LM con la perdida calculada solo sobre la respuesta del asistente. El prompt de usuario concatena el esquema, la pregunta y la instruccion "Write a SQLite query that answers the question. Return only the SQL query."; el objetivo es el SQL del dataset de forma literal.

## Capacidades

- Generacion de consultas SQLite de tipo `SELECT` a partir de una pregunta en ingles y uno o varios esquemas `CREATE TABLE`.
- Salida restringida a una unica consulta SQL, sin explicaciones adicionales cuando el modelo sigue la instruccion.
- Especializacion en esquemas con tipos de columna inferidos por el autor del dataset y sin filas de ejemplo.
- Cobertura de consultas de una sola tabla, propias de la porcion derivada de WikiSQL, y de esquemas mas complejos procedentes de Spider.
- No soporta otros dialectos SQL distintos de SQLite.
- No soporta sentencias que modifiquen datos (`INSERT`, `UPDATE`, `DELETE`, `DDL`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en el adaptador.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Prototipado de asistentes de consulta sobre bases de datos SQLite: el adaptador traduce preguntas en lenguaje natural a `SELECT` ejecutables contra un esquema dado, lo que permite construir demos de analitica conversacional en local sin depender de APIs externas.
- Ensenanza de ajuste fino con LoRA: sirve como caso de estudio reproducible de un entrenamiento completo en un portatil Apple Silicon de 8 GB, con hiperparametros, semilla y metricas documentados.
- Generacion asistida de consultas en herramientas internas de exploracion de datos: el usuario describe lo que quiere y el modelo propone el SQL, que despues se revisa antes de ejecutarse con credenciales de solo lectura.
- Evaluacion de pipelines text-to-SQL: el adaptador y su conjunto de test de 100 ejemplos permiten comparar estrategias de decodificacion, prompts o modelos base con una metrica de precision de ejecucion definida.
- Automatizacion de informes sobre esquemas pequenos y estables: para tablas con `CREATE TABLE` conocido y consultas de agregacion o filtrado, el modelo genera la consulta en una sola pasada con decodificacion greedy.
- Filtrado y preprocesado en cuadernos de analisis: integrado en un notebook de MLX, el adaptador convierte preguntas de negocio en SQL que el propio cuaderno ejecuta contra una copia en memoria de la base de datos.
- Banco de pruebas para validacion de SQL generado: su tasa de SQL valido del 99,0 % y su precision de ejecucion del 90,0 % lo hacen util para calibrar capas de validacion, listas blancas de consultas y limites de recursos antes de exponer un sistema a usuarios.

## Benchmarks y rendimiento

Evaluacion sobre el split de test reservado (100 ejemplos), decodificacion greedy, modo thinking desactivado y un maximo de 200 tokens nuevos. La precision de ejecucion se mide instanciando el esquema en tres bases SQLite en memoria con 25 filas aleatorias sembradas por tabla y comparando el multiconjunto de filas devuelto con el de la referencia.

| Modelo | Precision de ejecucion | Exact match | Exact match normalizado | SQL valido | Fecha |
|---|---|---|---|---|---|
| Base `mlx-community/Qwen3.5-0.8B-bf16` | 44,0 % (44/100) | 3,0 % | 18,0 % | 92,0 % | 2026-10-25 |
| Base + este adaptador | 90,0 % (90/100) | 81,0 % | 81,0 % | 99,0 % | 2026-10-25 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entorno de inferencia previsto: macOS sobre Apple Silicon con `mlx-lm`; el autor no documenta despliegue en CUDA.
- Memoria: el entrenamiento consumio un pico de 7,54 GB en un Apple M1 de 8 GB; la inferencia con el base en bf16 y el adaptador LoRA deberia situarse en un orden de magnitud similar, aunque no se proporciona una cifra medida de VRAM o memoria unificada para inferencia.
- GPU recomendadas: no disponible; el unico hardware documentado es un Apple M1 de 8 GB.
- Cabe en GPU de consumo: no confirmado; el autor solo valida el flujo en Apple Silicon.
- Opciones de despliegue: `mlx-lm` sobre el checkpoint `mlx-community/Qwen3.5-0.8B-bf16`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Base `mlx-community/Qwen3.5-0.8B-bf16` | 752,392 M | no disponible | Modelo generalista multimodal (solo texto en MLX-LM) | Apache 2.0 | HuggingFace |
| Base + este adaptador | 752,392 M (3,608 M entrenables) | no disponible | Text-to-SQL SQLite especializado | Apache 2.0 | HuggingFace |
| Alternativas text-to-SQL de 0,5-1 B parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a sus resultados en el test del adaptador.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA; no es un modelo autonomo y debe cargarse sobre la revision exacta `3067585164dbcc505eec73d554349de6a27571a4` de `mlx-community/Qwen3.5-0.8B-bf16`.
- El SQL generado debe revisarse o validarse antes de ejecutarse; el autor desaconseja ejecutarlo contra bases de datos de produccion o sensibles sin credenciales de solo lectura, listas blancas de consultas y limites de recursos.
- Fuera de alcance: otros dialectos SQL, esquemas sin contexto `CREATE TABLE`, sentencias que modifican datos y cualquier uso en el que un SQL incorrecto cause dano.
- Los esquemas del dataset llevan tipos de columna inferidos por el autor del dataset y no incluyen filas; muchas preguntas derivadas de WikiSQL son busquedas en una sola tabla y los valores suelen estar en minusculas.
- Algunas referencias del dataset son imperfectas, lo que puede propagarse al comportamiento del modelo.
- La evaluacion de ejecucion usa filas aleatorias sesgadas hacia los literales de la consulta de referencia, por lo que puede aceptar SQL incorrecto en casos limite.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el modelo puede generar SQL sintacticamente valido pero semanticamente incorrecto, como refleja la diferencia entre el 99,0 % de SQL valido y el 90,0 % de precision de ejecucion.
- Limitacion de idioma: solo ingles; las preguntas en castellano no estan cubiertas por el entrenamiento.
- Limitacion de contexto: la longitud maxima de secuencia durante el entrenamiento fue de 256 tokens, lo que restringe los esquemas y preguntas largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`b-mc2/sql-create-context`) tiene licencia CC-BY-4.0 y debe atribuirse.
- Estado del proyecto: experimental y educativo; sin descargas ni likes en el momento de la consulta, sin garantias de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/mlx-qwen3.5-0.8b-text-to-sql
- Modelo base en MLX: https://huggingface.co/mlx-community/Qwen3.5-0.8B-bf16
- Pesos originales: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- MLX-LM: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
