# YukiKaze1337/cn-sqlite-4b

## Resumen

cn-sqlite-4b es un ajuste fino por LoRA del modelo Qwen3-4B-Instruct-2507 orientado a la traducción de preguntas en chino a consultas SQLite ejecutables. Lo desarrolla el usuario YukiKaze1337 (ChuTongZhang) y se publica bajo licencia Apache 2.0. El modelo recibe el DDL de las tablas, opcionalmente los valores reales de columnas categóricas y una pregunta en chino, y devuelve únicamente la sentencia SQL, sin explicaciones.

El problema que aborda es concreto: los modelos generalistas de 4-7B rinden mal en text-to-SQL sobre esquemas que no han visto, y los modelos grandes en la nube no son viables para despliegues offline. Este ajuste consigue un 64,1% de acierto en un esquema de 14 tablas fuera de distribución, frente al 26,6% del modelo base y al 28,1% de Qwen2.5-Coder-7B sin ajustar.

Con 4.022.468.096 parámetros y un repositorio de 7,6 GB, se distribuye como adaptador LoRA (unos 270 MB) y como GGUF cuantizado en Q4_K_M y Q8_0 para inferencia local con llama.cpp u Ollama. El contexto de entrenamiento está limitado a muestras de 2678 tokens, lo que condiciona su uso a esquemas de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con muestras de hasta 2678 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (~2,5 GB) y Q8_0 (~4,3 GB); adaptador LoRA en bf16 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo fusionado y cuantizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 en modo no thinking y aplica un ajuste LoRA con r = 32, alpha = 64 sobre todas las capas lineales, en bf16 y calculando la pérdida únicamente sobre los tokens de SQL. El entrenamiento usó batch efectivo de 16, learning rate 2e-4 con decaimiento coseno, 3 épocas y agrupación por longitud, con un máximo de 2678 tokens por muestra. Se completó en 2 horas y 7 minutos sobre una única RTX 4090.

El conjunto de datos contiene 10.557 ejemplos, todos sintéticos. El autor diseñó manualmente 8 esquemas de bases de datos de negocio y una especificación de generación de preguntas; DeepSeek generó las preguntas y el SQL sobre 31 esquemas de entre 4 y 15 tablas. El pipeline de filtrado incluye comprobación de ejecución, comparación con una respuesta independiente y revisión tras reescritura coloquial. Los dos conjuntos de test difíciles (retail y autobús urbano) fueron escritos por Claude y no participaron en el diseño de los datos. No se menciona RLHF ni DPO; el ajuste es supervisado sobre SQL.

## Capacidades

- Generación de consultas SQLite a partir de una pregunta en chino y el DDL del esquema.
- Aprovechamiento de valores reales de columnas categóricas incluidas en el prompt para evitar adivinar literales.
- Generación determinista (greedy) y por muestreo, lo que permite estrategias de voto múltiple.
- Reescritura de SQL a partir del mensaje de error de SQLite (hasta 2 reintentos documentados).
- Modo de abstención: con la estrategia de voto, el modelo declina responder cuando la consistencia es baja.
- No soporta tool calling, agentes, visión ni audio según la información disponible.
- Multilingüe limitado al chino; no se documenta soporte de otros idiomas.

## Casos de uso

- Asistente de consultas para aplicaciones de escritorio con SQLite: el modelo traduce preguntas de usuario final a SQL ejecutable en local, sin enviar el esquema ni los datos a la nube, gracias a los GGUF de 2,5 GB que caben en un portátil.
- Herramienta interna de analistas no técnicos: con `ask.py`, se leen el DDL y los valores de las columnas directamente de la base de datos en modo solo lectura y se devuelve el resultado de la consulta, con reescritura automática en caso de error.
- Generación de SQL en pipelines de CI sobre esquemas sintéticos o de prueba: el modelo permite validar migraciones ejecutando consultas generadas contra bases de datos de test.
- Integración en editores o notebooks como autocompletado de consultas: la latencia de un 4B cuantizado en Q4_K_M permite respuestas interactivas en GPU de consumo.
- Enriquecimiento de chatbots de soporte con acceso a datos: el modelo puede convertir preguntas en lenguaje natural sobre pedidos, inventario o reservas en consultas sobre una base SQLite embebida.
- Evaluación comparativa de text-to-SQL: sirve como referencia de un ajuste pequeño y reproducible (2 horas en una RTX 4090) frente a modelos mayores sin ajustar.
- Filtrado previo en sistemas de BI: dado un esquema de hasta 15 tablas, genera candidatos de consulta que luego se validan por ejecución y voto.

## Benchmarks y rendimiento

Exactitud laxa (el resultado de la ejecución coincide con la referencia; columnas adicionales cuentan como acierto) sobre datos generados en el momento:

| Test | Preguntas | Qwen3-4B base | Primera iteracion | cn-sqlite-4b | Qwen2.5-Coder-7B sin ajustar |
|---|---|---|---|---|---|
| Autobús urbano (14 tablas, fuera de distribución) | 64 | 26,6% | 46,9% | 64,1% | 28,1% |
| Retail (12 tablas) | 100 | 42% | 69% | 74% | 55% |
| Gimnasio (5 tablas) | 40 | 75% | 92,5% | 92,5% | 85% |
| Biblioteca (4 tablas) | 40 | 80% | 90% | 92,5% | 77,5% |

Mejoras en inferencia sin reentrenar:

| Test | Generacion directa | Reescritura por error | Voto + reescritura |
|---|---|---|---|
| Retail (100) | 74% | 77% | 82% |
| Autobús (64) | 62,5% | 65,6% | 64,1% |
| Gimnasio (40) | 92,5% | 92,5% | 95,0% |
| Biblioteca (40) | 92,5% | 92,5% | 92,5% |

Referencia externa con el mismo prompt en el conjunto de autobús: deepseek-chat 89%, deepseek-reasoner 97%. La significación estadística se midió con McNemar pareado (p < 0,05 en tres conjuntos; p = 0,125 en biblioteca).

## Requisitos de hardware

- VRAM estimada: unos 8-9 GB en bf16 para los pesos fusionados; unos 6 GB en Q8_0 y unos 4 GB en Q4_K_M contando overhead de contexto.
- GPU recomendadas: RTX 4090 (usada para el entrenamiento), A100 o H100 para mayor throughput; cualquier GPU con 8 GB o más para bf16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con Q4_K_M o Q8_0.
- Despliegue: transformers + PEFT, llama.cpp, Ollama (`ollama run hf.co/YukiKaze1337/cn-sqlite-4b:Q4_K_M`), vLLM y TGI no se mencionan explícitamente.
- Latencia y throughput: no disponibles. La estrategia de voto múltiple es aproximadamente 4 veces más lenta que la generación directa en evaluación por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Autobus (14 tablas) | Licencia | Distribucion |
|---|---|---|---|---|---|
| cn-sqlite-4b | 4,02B | no disponible (entrenado a 2678 tokens) | 64,1% | Apache 2.0 | LoRA + GGUF |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | 26,6% | Apache 2.0 | safetensors |
| Qwen2.5-Coder-7B (sin ajustar) | 7B | no disponible | 28,1% | Apache 2.0 | safetensors |
| deepseek-chat (API) | no disponible | no disponible | 89% | propietaria | API |

## Limitaciones y advertencias

- Solo dialecto SQLite; `RIGHT JOIN` y `FULL JOIN` se excluyeron deliberadamente del entrenamiento.
- Todos los esquemas de entrenamiento y test son sintéticos, con nombres de tabla y columna mayoritariamente en inglés y preguntas más claras que las de usuarios reales; no se ha evaluado en bases de datos de producción reales.
- En esquemas complejos, más de la mitad de los errores restantes son lógicos (joins uno a muchos, orden temporal) y cerca de un tercio consisten en atribuir una columna a la tabla equivocada (8 de 26 errores en retail).
- Límite práctico de 2678 tokens de entrenamiento: esquemas de decenas de tablas exceden la ventana y requieren selección previa de tablas relevantes.
- El modelo no indica cuándo una pregunta no es respondible con el esquema dado; siempre genera una consulta.
- Sin los valores reales de las columnas categóricas en el prompt, el acierto en esquemas desconocidos cae del 64,1% al 54,7%.
- La abstención por baja consistencia reduce las respuestas erróneas de 41 a 17, pero deja sin responder cerca de un 20% de las preguntas; incluso con voto unánime se producen errores (8 de 89), por lo que se recomienda revisión humana.
- Riesgo de alucinación en nombres de columnas y tablas, especialmente en esquemas no vistos.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; los datos y el código del repositorio asociado son MIT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YukiKaze1337/cn-sqlite-4b
- README en inglés: https://huggingface.co/YukiKaze1337/cn-sqlite-4b/blob/main/README_en.md
- Dataset y scripts: https://huggingface.co/datasets/YukiKaze1337/cn-sqlite-sft
- Perfil del autor: https://huggingface.co/YukiKaze1337
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- SQLite-AI (referencia de inferencia en SQLite): https://www.sqlite.ai/sqlite-ai
