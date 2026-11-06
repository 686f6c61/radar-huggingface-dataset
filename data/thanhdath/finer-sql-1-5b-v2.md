# thanhdath/FINER-SQL-1.5B-v2

## Resumen

FINER-SQL-1.5B-v2 es un modelo de generacion de texto especializado en text-to-SQL desarrollado por thanhdath. Se construye a partir de una base Qwen2 de 1.500 millones de parametros (1.543.714.304 parametros reales en safetensors) y se entrena de forma continuada mediante GRPO (Group Relative Policy Optimization) con una recompensa compuesta de formato y ejecucion. El modelo esta disenado para traducir preguntas en lenguaje natural a consultas SQL correctas, atacando especificamente el problema de la "correccion espuria": consultas que devuelven resultados plausibles pero que no responden realmente a la pregunta formulada.

El entrenamiento se realiza sobre CoRE-DB, un entorno de base de datos compacto enriquecido con contraejemplos, descrito en el trabajo *Small Language Models for Text-to-SQL against Spurious Correctness*. El checkpoint publicado corresponde al paso 6750, seleccionado sobre el conjunto de desarrollo. Con 1.500 millones de parametros, el modelo es lo suficientemente pequeno para desplegarse en hardware modesto, lo que resulta relevante para equipos que necesitan un generador de SQL local sin depender de APIs externas.

La relevancia actual del modelo radica en su enfoque: en lugar de escalar el tamano, utiliza reinforcement learning con recompensas de ejecucion para mejorar la fidelidad semantica de las consultas generadas en bases de datos reales (BIRD y Spider), dos de los benchmarks de referencia en text-to-SQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de transformers/GGUF, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only de la familia Qwen2, con 1.500 millones de parametros. Sobre esa base se aplica un entrenamiento continuado con GRPO, un algoritmo de optimizacion por politica que genera multiples muestras por prompt y las compara mediante una recompensa. En este caso la recompensa combina dos senales: una de formato (que la salida sea SQL valido y bien estructurado) y otra de ejecucion (que la consulta ejecutada contra la base de datos produzca el resultado esperado).

El entorno de entrenamiento es CoRE-DB, descrito como una base de datos compacta enriquecida con contraejemplos, disenada para penalizar la correccion espuria. El checkpoint publicado es el paso 6750, elegido por su rendimiento en el conjunto de desarrollo. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases adicionales de RLHF o DPO mas alla del GRPO descrito.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural (text-to-SQL).
- Entrenamiento orientado a bases de datos reales con esquemas y contenido concretos (BIRD, Spider).
- Generacion de texto general heredada de la base Qwen2.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas de negocio en SQL ejecutable contra un esquema conocido, reduciendo el tiempo de iteracion manual en herramientas de BI.
- Generacion de SQL en pipelines de datos: integrado como paso previo a la ejecucion de consultas en flujos ETL, permite a usuarios no tecnicos formular extracciones sin escribir SQL.
- Evaluacion de calidad de esquemas: al estar entrenado contra contraejemplos, puede usarse para detectar preguntas ambiguas que producen consultas espuriamente correctas.
- Prototipado de interfaces de lenguaje natural sobre bases de datos: con 1.500 millones de parametros cabe en GPUs de consumo, lo que facilita demos locales de chat-to-SQL.
- Formacion y evaluacion de investigadores: sirve como referencia de bajo coste para estudiar tecnicas de GRPO aplicadas a text-to-SQL frente a modelos mayores.
- Automatizacion de informes internos: dado un esquema de base de datos fijo, el modelo puede generar consultas recurrentes para paneles y reportes periodicos.
- Filtrado previo en sistemas de recuperacion: puede generar consultas de filtrado estructurado antes de lanzar busquedas semanticas sobre datos tabulares.

## Benchmarks y rendimiento

Datos publicados en la model card (k = 30 muestras, T = 1.0, seleccion vote-after-verify, evaluadores oficiales):

| Benchmark | Metrica | Resultado |
|---|---|---|
| BIRD dev | Execution Accuracy (EX) | 63.75 |
| Spider dev | Execution Accuracy (EX) | 79.98 |
| Spider dev | Test Suite Accuracy (TS) | 72.44 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3.1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.6 GB para pesos; en 4 bits, alrededor de 0.8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4 para fp16; A100/H100 no son necesarias pero ofrecen mayor throughput en lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB en cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF (no confirmada por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FINER-SQL-1.5B-v2 | 1.5B | no disponible | Text-to-SQL con GRPO sobre CoRE-DB | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en text-to-SQL; su rendimiento en generacion de texto general no esta documentado y puede degradarse respecto a la base Qwen2 original.
- No se declaran los idiomas soportados; el soporte multilingue en la formulacion de preguntas no esta garantizado.
- Riesgo de alucinacion en esquemas desconocidos: si el esquema de la base de datos no se proporciona correctamente en el prompt, el modelo puede inventar tablas o columnas.
- La correccion espuria sigue siendo un riesgo residual, aunque el entrenamiento con contraejemplos la mitiga parcialmente.
- No hay informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Los benchmarks publicados usan seleccion vote-after-verify con k = 30; el rendimiento en una sola pasada sin votacion puede ser inferior.
- No se especifica la longitud de contexto, lo que dificulta planificar su uso con esquemas de base de datos extensos.

## Enlaces

- Hugging Face: https://huggingface.co/thanhdath/FINER-SQL-1.5B-v2
- Prompts de evaluacion: https://huggingface.co/thanhdath/core-db-evaluation-prompts
- Repositorio de codigo `core-db-sql`: no disponible como URL directa en la informacion proporcionada
- Paper *Small Language Models for Text-to-SQL against Spurious Correctness*: no disponible como URL directa en la informacion proporcionada
