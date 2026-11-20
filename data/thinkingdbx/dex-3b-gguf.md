# thinkingdbx/DEx-3B-GGUF

## Resumen

DEx-3B es un modelo de lenguaje de 3.085.938.688 parámetros, desarrollado por el usuario thinkingdbx, obtenido mediante ajuste fino supervisado (LoRA) sobre `Qwen/Qwen2.5-Coder-3B-Instruct`. Está especializado en tareas prácticas de ingeniería de datos y ciencia de datos: SQL analítico, transformaciones ETL con Polars 2.x, Pandas y PySpark, modelado dbt, depuración de pipelines y feature engineering libre de fugas temporales. El modelo se distribuye en formato GGUF cuantizado, lo que lo hace desplegable en CPU y Apple Silicon.

El problema que aborda es concreto: los modelos de código generalistas fallan en esquemas de bases de datos no vistos, alucinan tablas y columnas inexistentes y producen transformaciones de datos que no se ejecutan. El autor entrenó sobre 15.598 ejemplos verificados automáticamente (ejecución real de SQL en DuckDB, ejecución de snippets de Python en subproceso con aserciones, parseo de modelos dbt con `sqlglot` y `pyyaml`), lo que reduce drásticamente ese tipo de errores.

La relevancia actual reside en su tamaño reducido (3B) combinado con una mejora medida de +20 puntos porcentuales en Pass@1 sobre el modelo base en 120 tareas retenidas, y en que las alucinaciones de tabla (`CatalogException`) en esquemas SQL no vistos cayeron de 6 a 0. La longitud de contexto no está especificada en la información disponible; el entrenamiento usó `max_seq_length=1536`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct; detalles internos no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con `max_seq_length=1536`) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (GGUF); pesos fusionados en FP16 safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0, F16); safetensors FP16 para el modelo fusionado |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3B parámetros. El ajuste fino se realizó con MLX LoRA con los siguientes hiperparámetros: `rank=16`, `scale=32`, 16 capas adaptadas, optimizador AdamW, scheduler coseno con LR de `1.5e-5` a `1.5e-6`, `max_seq_length=1536`, pérdida enmascarada sobre el prompt (prompt-masked loss) y 2.500 iteraciones. Posteriormente los pesos se fusionaron a FP16 en safetensors y se convirtieron y cuantizaron con `llama.cpp`.

El dataset consta de 15.598 ejemplos verificados (14.820 de entrenamiento y 778 de validación) distribuidos en cinco pistas. La verificación es el elemento diferenciador: las consultas SQL se ejecutaron en DuckDB contra tablas pobladas; los snippets de Polars 2.x, Pandas y Python de ciencia de datos se ejecutaron en un subproceso en sandbox con aserciones; los modelos SQL y YAML de dbt se parsearon con `sqlglot` y `pyyaml`; y las tareas de depuración se comprobaron para sintaxis válida y correcciones estructuradas. No se menciona RLHF ni DPO en la información disponible. La pérdida de validación bajó de 0,935 a 0,412 a lo largo de 2.500 pasos.

## Capacidades

- Generación de SQL analítico: joins multi-tabla, CTEs, funciones de ventana (`ROW_NUMBER`, `LAG`, `LEAD`, medias móviles), análisis de cohortes y retención, análisis de embudo, deduplicación y consultas de anomalías.
- Generación de código ETL: Polars 2.x moderno (`with_columns`, `group_by`, `pl.len()`, `min_samples=`), Pandas y transformaciones PySpark.
- Modelado dbt y calidad de datos: modelos staging e incrementales, tests en `schema.yml` y refactorización de SQL.
- Depuración de pipelines: análisis de causa raíz y corrección de skew/OOM en Spark, errores en DAGs de Airflow, joins con fan-out, desajustes de zona horaria y problemas de esquema en Parquet.
- Ciencia de datos: particiones temporales sin fuga de información, feature engineering con lags y medias móviles, métricas de forecasting tabular y comprobaciones de drift.
- Formato de prompt ChatML, compatible con Ollama, llama.cpp y LM Studio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; el autor indica que el razonamiento sobre repositorios multi-fichero complejos queda fuera del alcance de un modelo de 3B.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Generación de SQL sobre esquemas desconocidos: el modelo produce consultas DuckDB que referencian tablas y columnas existentes, con una tasa de alucinación de catálogo de 0 sobre esquemas no vistos en la evaluación del autor. Adecuado para asistentes de BI que reciben un DDL y deben responder preguntas analíticas.
- Construcción de transformaciones ETL en Polars 2.x: obtuvo 25/25 en la pista de ETL de la evaluación. Se usaría para traducir especificaciones de negocio en pipelines de agregación y ventanas ejecutables sin revisión manual de sintaxis.
- Migración y refactorización de SQL a dbt: genera modelos staging e incrementales y sus tests en `schema.yml`, lo que permite incorporar un proyecto analítico existente a dbt con validación automática del parseo.
- Diagnóstico de fallos en producción de pipelines: dado un mensaje de error de Spark (skew, OOM), Airflow o Parquet, el modelo devuelve causa raíz y parche estructurado; obtuvo 19/20 en la pista de depuración.
- Feature engineering para modelos predictivos: genera splits temporales sin leakage y features de lag y media móvil, útil en equipos que necesitan prototipos rápidos de variables tabulares.
- Asistente local en portátil para analistas de datos: con la cuantización Q4_K_M (~1,8 GB) se ejecuta en CPU o en Apple Silicon vía Ollama o LM Studio, sin enviar esquemas ni datos a servicios externos, lo que simplifica el cumplimiento en entornos con datos sensibles.
- Automatización de revisiones de calidad en CI: integrado como paso de validación que ejecuta y comprueba SQL generado contra DuckDB antes de fusionar cambios en el repositorio de transformaciones.

## Benchmarks y rendimiento

Evaluación del autor sobre 120 tareas retenidas en tres esquemas no vistos (`cloud_billing_finops`, `energy_smart_grid`, `banking_credit_risk`). Las salidas SQL se ejecutaron en DuckDB, las de Python se comprobó su sintaxis y las de dbt se parsearon con `sqlglot` y `pyyaml`.

| Pista | Qwen2.5-Coder-3B-Instruct (base) | DEx-3B | Delta |
|---|---|---|---|
| SQL DuckDB con conocimiento de esquema (Pass@1) | 50,0% (24/48) | 75,0% (36/48) | +25,0 pts |
| ETL (Polars 2.x / Pandas / PySpark) | 76,0% (19/25) | 100,0% (25/25) | +24,0 pts |
| Depuración de pipelines | 75,0% (15/20) | 95,0% (19/20) | +20,0 pts |
| Modelos dbt y refactorización SQL | 81,5% (22/27) | 88,9% (24/27) | +7,4 pts |
| Pass@1 global | 66,7% (80/120) | 86,7% (104/120) | +20,0 pts |

Datos adicionales reportados: las alucinaciones de tabla (`CatalogException`) en esquemas SQL no vistos pasaron de 6 a 0, y la pérdida de validación bajó de 0,935 a 0,412. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,8 GB con Q4_K_M, ~3,1 GB con Q8_0 y ~5,8 GB con F16 (tamaños de fichero indicados por el autor; el consumo real de memoria añade overhead del runtime y de la caché KV).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar Q4_K_M; para Q8_0 se recomienda 6 GB o más y para F16 8 GB o más.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU y en Apple Silicon.
- Opciones de despliegue: Ollama (incluye `Modelfile` listo), llama.cpp (`llama-cli`), LM Studio con formato de prompt ChatML. El repositorio incluye etiqueta `endpoints_compatible`. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DEx-3B | 3,09B | no disponible | Ingeniería y ciencia de datos (SQL, ETL, dbt, debugging) | Apache-2.0 | GGUF + safetensors FP16 |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible en la información | Código generalista | Apache-2.0 | Múltiples formatos |
| Modelos de código de 7B (familia Qwen2.5-Coder) | 7B | no disponible en la información | Código generalista | según variante | Múltiples formatos |

La comparación cuantitativa disponible se limita al modelo base: DEx-3B supera a `Qwen2.5-Coder-3B-Instruct` en +20 puntos de Pass@1 global en la evaluación del autor, con la mayor ganancia en SQL con conocimiento de esquema (+25 puntos). No hay datos de benchmarks frente a modelos de 7B ni frente a otros fine-tunes de ingeniería de datos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado principalmente sobre SQL compatible con DuckDB y patrones de Polars 2.x, Pandas y PySpark; la sintaxis propietaria de otros motores (por ejemplo, dialectos específicos de almacenes comerciales) puede requerir ajustes manuales.
- Con 3B parámetros, el razonamiento sobre repositorios multi-fichero complejos queda fuera de alcance, según el propio autor.
- Solo soporta inglés según la model card; no se declaran capacidades en castellano ni en otros idiomas.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó 1.536 tokens, por lo que esquemas o pipelines muy extensos pueden degradar la calidad.
- Riesgo de alucinación persistente en dominios fuera de los cinco ejes entrenados (SQL, ETL, dbt, debugging, ciencia de datos); no hay evaluación de robustez fuera de ese ámbito.
- Los benchmarks son autoinformados por el autor, con 120 tareas y tres esquemas, sin validación independiente; el tamaño muestral por pista es reducido (20-48 tareas).
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0, que permite uso comercial; se heredan las condiciones del modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin adopción comunitaria verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingdbx/DEx-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio de llama.cpp (conversión y cuantización): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- DuckDB: https://duckdb.org
- Polars: https://pola.rs
- dbt: https://www.getdbt.com
- sqlglot: https://github.com/tobymao/sqlglot
