# win10/spark-temporal-engram-4b-v3

## Resumen

Spark Temporal Engram V3 es un modelo de generación de texto de 4.115.365.652 parámetros (aproximadamente 4B) publicado por el usuario win10 en Hugging Face bajo licencia Apache 2.0. Se presenta como un checkpoint fusionado completo que combina un backbone transformer en BF16 con un módulo de memoria denominado "Engram" en FP32. El modelo está etiquetado como `memory-augmented` y `temporal-memory`, y su model card describe un proceso iterativo de entrenamiento en tres rondas de control de calidad (QA) orientado a mejorar la recuperación de hechos, el orden temporal y la respuesta a preguntas naturales y parafraseadas.

La propuesta del modelo es inusual: en lugar de ampliar el backbone, congela el transformer principal y el cabezal LM, y entrena únicamente un conjunto reducido de 1.526.417 parámetros correspondientes a un lector de QA, una proyección de entrada temporal, una GRU y capas de lectura. El objetivo declarado es dotar al modelo de una memoria episódica y temporal que le permita responder preguntas sobre hechos observados previamente en el contexto, incluyendo relaciones temporales como "antes" o "después".

El modelo es relevante como experimento de arquitecturas de memoria aumentada sobre un backbone congelado, pero debe evaluarse con cautela: los benchmarks publicados son internos, con conjuntos de evaluación propios (64 preguntas naturales, 64 parafraseadas, 64 temporales, 12 de recall y 12 de orden), y no hay resultados en benchmarks estándar de la comunidad como MMLU, HumanEval o GSM8K. El repositorio ocupa 28,7 GB y acumula 126 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone congelado BF16 y módulo Engram de memoria temporal en FP32 (lector QA, proyección de entrada temporal, GRU y capas de lectura) |
| Parametros totales | 4.115.365.652 |
| Parametros activos | No es MoE; 1.526.417 parámetros entrenables en la ronda tres |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en BF16/FP32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en` según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer de aproximadamente 4B parámetros en BF16, que permanece congelado, con un módulo de memoria "Engram" en FP32. Este módulo incluye un lector de QA completo, una proyección de entrada temporal, una GRU y dos capas de lectura originales. Los cabezales de frontera y fecha, las tablas estáticas, la proyección dinámica, los sidecars, el backbone y la compuerta de copia (copy gate) permanecen congelados durante la ronda tres. Solo se entrenan 1.526.417 parámetros, y se introduce un nuevo espacio de nombres de memoria para aislar la geometría de evidencia actualizada, manteniendo las capacidades de contexto y memoria configuradas.

El entrenamiento de la ronda tres continúa desde los pesos de la ronda dos con un optimizador nuevo. Cada actualización acumula 20 microbatches: dos de QA de traza (rotando sobre cuatro fuentes), diez de QA natural, cuatro de QA temporal, uno de recall, uno de orden y dos de SFT. El QA representa el 80% de los microbatches y el QA natural el 50%. Un octavo de los microbatches de QA supervisa el caso "Unknown" sin observación. Los datos incluyen 4.811 registros de QA de traza retenidos, 7.718 preguntas naturales sobre 1.200 documentos de entrenamiento y 3.200 preguntas temporales. Los documentos naturales tienen entre 2 y 8 hechos, con predominio de 6 y 8 hechos (80,917% de los documentos). Se usa BF16 CUDA AMP, AdamW sin weight decay, clipping 1, warmup 20, schedule coseno y semilla 863033, con LR de 0,0005 para QA y 0,00002 para el módulo temporal original. La ejecución formal termina en el paso 600 tras 136,29 minutos.

## Capacidades

- Generación de texto conversacional en inglés.
- Recuperación de hechos observados previamente en el contexto (recall), con 12/12 casos superados en la suite interna.
- Razonamiento sobre orden temporal de hechos, con 12/12 casos en la suite interna.
- Respuesta a preguntas naturales sobre documentos con múltiples hechos (61/64 en la suite interna de 64 preguntas).
- Respuesta a preguntas parafraseadas (61/64 en la suite interna).
- Respuesta a preguntas temporales con relaciones "primero", "último", "antes" y "después" (49/64 en la suite interna; desglose: primero 15/16, último 16/16, antes 2/16, después 16/16).
- Reconocimiento de preguntas sobre información no observada, respondiendo "Unknown" (64/64 en la suite interna).
- Memoria temporal aumentada mediante el módulo Engram.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Question answering sobre documentos largos con múltiples hechos: el módulo Engram permite al modelo recordar hechos observados en el contexto y responder preguntas sobre ellos, adecuado para resúmenes de reuniones o informes con varios puntos de datos.
- Extracción de información temporal de registros: dado un histórico de eventos, el modelo puede responder qué ocurrió antes o después de un hecho concreto, útil en análisis de logs o cronologías.
- Asistentes conversacionales con memoria episódica: el modelo puede mantener y consultar hechos mencionados en turnos anteriores dentro de la misma sesión, gracias a su arquitectura de memoria aumentada.
- Detección de información ausente: al responder "Unknown" cuando el hecho no está en el contexto, puede emplearse en sistemas que necesitan distinguir entre información conocida y desconocida, reduciendo respuestas inventadas en dominios acotados.
- Evaluación de arquitecturas de memoria sobre backbone congelado: investigadores pueden usar este checkpoint como referencia para estudiar cómo un módulo pequeño (1,5M de parámetros) modifica el comportamiento de un backbone de 4B sin reentrenarlo.
- Prototipado de QA sobre bases documentales pequeñas: con 1.200 documentos de entrenamiento y preguntas sobre 2 a 8 hechos, sirve para experimentar con pipelines de recuperación y lectura en inglés.
- Investigación en razonamiento temporal: el desglose por relación temporal permite analizar qué relaciones (antes, después, primero, último) domina el modelo, útil para estudiar sesgos en el razonamiento temporal.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la model card, medidos sobre suites internas del autor. No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Checkpoint | NLL (32 registros) | Recall | Order | QA natural | QA parafraseada | QA temporal | Unknown | Carga limpia BF16/FP32 en GPU |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Base | 1,304515068 | 0/12 | 1/12 | 0/64 | 0/64 | 0/64 | 64/64 | No registrado |
| V3 inicial | 1,336399075 | 12/12 | 1/12 | No evaluado | No evaluado | No evaluado | No evaluado | No registrado |
| Paso 200 | 1,036682900 | 5/12 | 7/12 | No evaluado | No evaluado | No evaluado | No evaluado | No registrado |
| Paso 800 | 1,019088555 | 0/12 | 6/12 | No evaluado | No evaluado | No evaluado | No evaluado | No registrado |
| Recall fix | 1,019911441 | 12/12 | 6/12 | No evaluado | No evaluado | No evaluado | No evaluado | No registrado |
| Order fix | 1,020251819 | 12/12 | 12/12 | 0/64 | 0/64 | 0/64 | 64/64 | No registrado |
| QA ronda 1 | 1,020251819 | 12/12 | 12/12 | 14/64 | 14/64 | 0/64 | 64/64 | Superado |
| QA ronda 2 | 1,020031746 | 12/12 | 12/12 | 22/64 | 21/64 | 52/64 | 64/64 | Superado |
| QA ronda 3 | 1,020014452 | 12/12 | 12/12 | 61/64 | 61/64 | 49/64 | 64/64 | Superado |

Criterios de aceptación declarados: QA natural 61/64 (requerido ≥50/64); QA parafraseada 61/64 (requerido ≥40/64); QA temporal 49/64 (requerido ≥48/64); Unknown 64/64; recall 12/12; order 12/12; NLL 1,020014452 con diferencia relativa del 0,001695% respecto a la ronda dos (1,020031746), cumpliendo el criterio de NLL ≤1,02 o diferencia relativa ≤1%. Desglose temporal: primero 15/16, último 16/16, antes 2/16, después 16/16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 28,7 GB e incluye pesos BF16 del backbone y FP32 del módulo Engram. En BF16, el backbone de 4B requiere aproximadamente 8 GB solo para pesos, más el módulo Engram en FP32 y las activaciones; una estimación conservadora sitúa la inferencia completa en torno a 10-14 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: A100, H100 o GPUs con al menos 16-24 GB de VRAM para cargar el checkpoint completo sin cuantización. La model card menciona carga limpia en GPU con BF16/FP32 nativo.
- GPU de consumo: podría caber en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16/FP32; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) requeriría cuantización o descarga parcial, no documentada.
- Opciones de despliegue: transformers con `custom_code` (requiere `trust_remote_code=True`). No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace improbable su uso inmediato en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La arquitectura de memoria aumentada sobre backbone congelado no tiene una categoría estándar clara, y no se han encontrado alternativas con la misma propuesta en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark Temporal Engram V3 | 4.115.365.652 (1.526.417 entrenables) | No disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks publicados son internos y de tamaño reducido (64 preguntas naturales, 64 parafraseadas, 64 temporales, 12 de recall, 12 de orden), sin resultados en benchmarks estándar de la comunidad.
- El rendimiento en la relación temporal "antes" es muy bajo (2/16), lo que indica una limitación clara en ese tipo de razonamiento.
- El modelo solo declara soporte de inglés (`en`); no se documentan capacidades multilingües.
- No se documenta la longitud de contexto, lo que impide planificar su uso en escenarios de contexto largo.
- El uso requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- El repositorio ocupa 28,7 GB, con un tamaño desproporcionado respecto a los 4B parámetros, probablemente por incluir múltiples checkpoints y el módulo Engram en FP32.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos propios del autor sin descripción de composición, el riesgo de sesgos y alucinaciones no puede evaluarse.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación independiente y de documentación sobre el dataset de entrenamiento desaconseja su uso en producción sin validación propia.
- El modelo tiene 126 descargas y 1 like, con una adopción muy baja, lo que limita la disponibilidad de soporte comunitario y de casos de uso verificados.

## Enlaces

- Hugging Face: https://huggingface.co/win10/spark-temporal-engram-4b-v3
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
