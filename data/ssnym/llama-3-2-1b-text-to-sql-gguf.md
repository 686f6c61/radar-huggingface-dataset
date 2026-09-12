# ssnym/llama-3.2-1b-text-to-sql-GGUF

## Resumen

ssnym/llama-3.2-1b-text-to-sql-GGUF no es un modelo completo, sino un adaptador LoRA de ajuste fino para generación de SQL (text-to-SQL) sobre Llama-3.2-1B, convertido a formato GGUF (f16) para su uso con llama.cpp. El adaptador original en safetensors/PEFT vive en ssnym/llama-3.2-1b-text-to-sql, y este repositorio traslada ese mismo artefacto al ecosistema GGUF: un único fichero de aproximadamente 22,5 MB que se superpone al GGUF del modelo base en tiempo de inferencia.

El problema que resuelve es concreto: traducir una pregunta en lenguaje natural más un esquema de tabla a una consulta SQL válida, un caso de uso habitual en asistentes de analítica, herramientas de BI y agentes que consultan bases de datos. Al apoyarse en un modelo de ~1B de parámetros y no requerir la fusión de pesos, el artefacto es muy ligero y puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace atractivo para entornos locales o con requisitos de privacidad estrictos.

El ajuste se ha realizado sobre el dataset b-mc2/sql-create-context, un corpus de tripletas pregunta-esquema-SQL. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha y un tamaño reportado de 0,0 GB, por lo que se trata de un artefacto muy reciente y sin validación comunitaria. La licencia heredada es la Llama 3.2 Community License y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base Llama-3.2-1B); no se detalla la configuración de capas del adaptador |
| Parámetros totales | 11.272.192 parámetros en el adaptador (dato real de safetensors); el modelo base es Llama-3.2-1B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama-3.2-1B) |
| Tipos de cuantización | El adaptador se distribuye únicamente en GGUF f16 (~22,5 MB); se puede aplicar sobre cualquier GGUF del modelo base en cualquier nivel de cuantización (verificado por el autor con Q4_K_M) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (fichero `text-to-sql-adapter-f16.gguf`); el adaptador original está en safetensors/PEFT |
| Tipo de artefacto | Adaptador LoRA, no un modelo autónomo; requiere el GGUF del modelo base |
| Modelo base | ssnym/llama-3.2-1b-text-to-sql (relación: quantized), a su vez derivado de Llama-3.2-1B |
| Dataset de entrenamiento | b-mc2/sql-create-context |
| Pipeline declarado | text-generation |
| Fecha de creación | 2026-09-12 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB (el fichero del adaptador ronda los 22,5 MB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre Llama-3.2-1B, presumiblemente partiendo de la variante Instruct, dado que el autor recomienda explícitamente usar `unsloth/Llama-3.2-1B-Instruct-GGUF` como base para la inferencia. El adaptador resultante tiene 11.272.192 parámetros y se ha convertido a GGUF f16 mediante el script `convert_lora_to_gguf.py` de llama.cpp, conservando la estructura de bajo rango para poder aplicarse en tiempo de ejecución sobre el modelo base sin fusionar pesos.

Los datos de entrenamiento declarados se limitan al dataset b-mc2/sql-create-context, un corpus de ejemplos con contexto de esquema (`CREATE TABLE`) y la consulta SQL correspondiente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros (rango y alpha de LoRA, tasa de aprendizaje, épocas) ni si hubo etapas de RLHF, DPO u otras técnicas de alineamiento posteriores. Tampoco se documenta ninguna innovación técnica adicional más allá del propio flujo de conversión a GGUF y de la decisión de mantener el adaptador separado en lugar de publicar un GGUF fusionado, lo que permite reutilizar el mismo fichero de 22,5 MB sobre cualquier cuantización del modelo base.

## Capacidades

- Generación de consultas SQL a partir de una pregunta en lenguaje natural y un esquema de tablas proporcionado en el prompt, que es la tarea objetivo del ajuste fino.
- Generación de texto general y seguimiento de instrucciones básicas, heredados del modelo base Llama-3.2-1B.
- Comprensión de esquemas con sintaxis `CREATE TABLE` como contexto, tal y como aparecen en el dataset sql-create-context.
- Ejecución local y offline mediante llama.cpp, tanto en modo CLI (`llama-cli`) como en servidor con API compatible con OpenAI (`llama-server`).
- Soporte de despliegue sobre distintas cuantizaciones del modelo base sin necesidad de reconvertir ni volver a cuantizar el adaptador.
- No se documenta soporte de tool calling o function calling específico para este adaptador.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido. El modelo base Llama-3.2-1B es una variante de solo texto dentro de la familia Llama 3.2.

## Casos de uso

- Asistentes de analítica en lenguaje natural: el adaptador traduce preguntas de negocio a SQL sobre un esquema dado, integrándose en una interfaz interna donde el usuario formula la pregunta y el sistema ejecuta la consulta en un almacén de datos.
- Autocompletado en editores SQL e IDE: dado el esquema del proyecto, el modelo puede proponer la consulta completa a partir de un comentario o de una descripción breve, reduciendo el tiempo de escritura de consultas repetitivas.
- Prototipado rápido en pipelines ETL: generación de consultas base que después se revisan y optimizan manualmente, útil para equipos que migran lógica de negocio entre dialectos SQL.
- Entornos con requisitos estrictos de privacidad: al ejecutarse con llama.cpp sobre CPU o GPU local y pesar el adaptador solo 22,5 MB, los esquemas y las preguntas no salen de la infraestructura propia, algo crítico en banca, sanidad o sector público.
- Herramienta de línea de comandos para consultas puntuales: mediante `llama-cli` con el adaptador aplicado, un ingeniero puede obtener una consulta SQL sin depender de servicios externos ni de conectividad.
- Educación y formación en SQL: el modelo puede generar ejemplos de consultas a partir de enunciados y servir como apoyo para practicar, siempre con revisión humana del resultado.
- Generación de datos sintéticos de prueba: producir conjuntos de pares pregunta-SQL para probar validadores, linters o herramientas internas de revisión de consultas.
- Servicio interno con API compatible con OpenAI: desplegado con `llama-server`, puede exponerse como endpoint HTTP para que otras herramientas lo consuman como si fuera una API de chat convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (por ejemplo, exactitud de coincidencia de consultas, ejecución correcta o comparaciones tipo Spider/BIRD), y no se detallan cifras de latencia ni de throughput.

## Requisitos de hardware

- Tamaño del adaptador: aproximadamente 22,5 MB en f16, un coste despreciable frente al modelo base.
- El requisito real lo marca el modelo base Llama-3.2-1B, no el adaptador.
- VRAM estimada para el modelo base: en torno a 0,8-1 GB con cuantización Q4_K_M y alrededor de 2,5 GB en f16, más el pequeño overhead de memoria del adaptador y del contexto. Son estimaciones orientativas, no medidas publicadas para este artefacto.
- Cabe en GPU de consumo sin problema: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU con 4 GB o más de VRAM. En f16 también cabe en GPUs integradas con memoria compartida suficiente.
- Ejecución viable en CPU: al ser un modelo de ~1B en Q4_K_M, puede correr solo con CPU, incluyendo equipos de sobremesa y placas tipo Raspberry Pi 5 en configuraciones moderadas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI) es la vía soportada explícitamente para este adaptador GGUF. Para vLLM, TGI u otros servidores que no consumen adaptadores GGUF, habría que usar el adaptador safetensors/PEFT del repositorio base.
- Latencia y throughput: no disponibles. Como referencia no verificada, un modelo de ~1B en Q4_K_M suele generar decenas de tokens por segundo en CPU moderna y varios cientos en GPU, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ssnym/llama-3.2-1b-text-to-sql-GGUF | 11.272.192 en el adaptador LoRA; base de ~1B | No disponible en la información proporcionada | Llama 3.2 Community License | HuggingFace, formato GGUF (solo adaptador) |
| ssnym/llama-3.2-1b-text-to-sql (adaptador original) | Mismo adaptador, 11.272.192 parámetros | No disponible | Llama 3.2 Community License | HuggingFace, safetensors/PEFT |
| Llama-3.2-1B-Instruct (modelo base sin ajustar) | Orden de 1.000 millones (dato público de Meta, no incluido en la información proporcionada) | No disponible en la información proporcionada | Llama 3.2 Community License | HuggingFace, múltiples cuantizaciones GGUF de terceros |
| Modelos text-to-SQL de mayor tamaño (por ejemplo, familias tipo SQLCoder o NSQL) | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió información relevante sobre este modelo ni sobre alternativas comparables; los resultados obtenidos correspondían a foros técnicos sin relación con el artefacto.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF del modelo base (se recomienda Llama-3.2-1B-Instruct) el fichero del adaptador no sirve para inferir.
- El dato "parámetros totales: 11.272.192" corresponde al adaptador LoRA, no al modelo completo; puede inducir a confusión si se interpreta como el tamaño del modelo desplegado.
- Ausencia total de benchmarks o evaluación publicada: no hay evidencia objetiva de la calidad de las consultas generadas ni de su tasa de acierto.
- Riesgo alto de alucinación en SQL: el modelo puede inventar nombres de columnas o tablas, omitir condiciones de filtrado o producir sintaxis inválida para el dialecto objetivo, especialmente con esquemas grandes o consultas complejas.
- Entrenado sobre un único dataset (b-mc2/sql-create-context), lo que limita la generalización a esquemas reales, consultas multi-turno, subconsultas anidadas, CTEs, funciones de ventana o dialectos específicos como PostgreSQL, BigQuery o Snowflake.
- Idiomas: solo inglés declarado; no hay soporte documentado para preguntas en castellano ni en otras lenguas.
- El modelo base es de ~1B de parámetros, lo que acota su capacidad para razonar sobre esquemas extensos o relaciones complejas entre tablas.
- Nunca debe ejecutarse automáticamente una consulta generada contra una base de datos de producción sin validación previa: existe riesgo de sentencias destructivas (por ejemplo, DDL o DML no deseados) y de consultas costosas.
- Licencia Llama 3.2 Community License: uso comercial permitido con condiciones, incluida la obligación de mostrar "Built with Llama", requisitos de nomenclatura para productos derivados y la cláusula específica para servicios con más de 700 millones de usuarios mensuales. Conviene revisar el texto completo antes de un despliegue comercial.
- Artefacto sin tracción: 0 descargas y 0 likes, repositorio creado y actualizado el mismo día, sin validación por parte de la comunidad.
- Repositorio de 0,0 GB reportados: verificar la descarga real del fichero del adaptador antes de integrarlo en un pipeline.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/ssnym/llama-3.2-1b-text-to-sql-GGUF
- Adaptador original en safetensors/PEFT: https://huggingface.co/ssnym/llama-3.2-1b-text-to-sql
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Script de conversión `convert_lora_to_gguf.py`: incluido en el repositorio de llama.cpp
- GGUF del modelo base recomendado por el autor: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF
- Licencia Llama 3.2 Community License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Repositorio de Meta con los modelos Llama: https://github.com/meta-llama/llama-models

Nota: la búsqueda web asociada no devolvió resultados relevantes sobre este modelo, su entrenamiento o sus benchmarks.
