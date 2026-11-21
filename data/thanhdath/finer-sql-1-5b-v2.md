# thanhdath/FINER-SQL-1.5B-v2

## Resumen

FINER-SQL-1.5B-v2 es un modelo de generación de texto especializado en la traducción de lenguaje natural a SQL (text-to-SQL), desarrollado por el usuario thanhdath. Está construido sobre la arquitectura Qwen2, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones), y se distribuye en formato safetensors bajo licencia Apache 2.0. Forma parte de una familia de tres modelos (0.5B, 1.5B y 3B) denominada FINER-SQL-v2, lo que permite elegir el tamaño en función de los requisitos de precisión y de los recursos de hardware disponibles.

El modelo resuelve el problema de convertir consultas en lenguaje natural en sentencias SQL ejecutables, una tarea crítica en herramientas de analítica conversacional, asistentes de bases de datos y sistemas de business intelligence. Su relevancia radica en que ofrece un rendimiento competitivo en los benchmarks estándar de la tarea (Spider y BIRD) con un tamaño reducido, lo que facilita su despliegue en entornos con recursos limitados.

La información pública disponible es escasa: no se detallan los datos de entrenamiento, el proceso de ajuste ni las capacidades multilingües. La model card se limita a presentar los resultados de evaluación en los conjuntos Spider y BIRD, junto con el enlace al repositorio de código asociado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, según indican las etiquetas del repositorio. No se especifica en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud máxima de contexto configurada.

Tampoco se detallan los datos de entrenamiento: se desconoce el volumen de tokens utilizados, la composición del corpus (si incluyó datos de Spider, BIRD u otros conjuntos text-to-SQL), ni si se aplicaron técnicas de ajuste supervisado, RLHF o DPO. La model card no menciona innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El repositorio de código asociado (github.com/thanhdath/core-db) podría contener información adicional sobre el pipeline de entrenamiento, pero no se ha incluido en los datos proporcionados.

## Capacidades

- Generación de sentencias SQL a partir de consultas en lenguaje natural (text-to-SQL).
- Evaluado específicamente en los conjuntos de datos Spider (Dev y Test) y BIRD (Dev), lo que indica un ajuste orientado a esquemas de bases de datos relacionales.
- Generación de texto general, heredada de la base Qwen2, aunque no se documentan capacidades adicionales.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües ni el conjunto de idiomas soportados.

## Casos de uso

- Asistentes de analítica conversacional: el modelo puede traducir preguntas de usuarios en lenguaje natural a consultas SQL ejecutables contra un esquema de base de datos, integrándose en interfaces de chat o paneles de BI. Su tamaño de 1,5B permite desplegarlo con baja latencia en infraestructura modesta.
- Generación automática de informes: a partir de una pregunta de negocio, el modelo produce la consulta SQL necesaria para extraer los datos, que luego se procesan en un pipeline de reporting.
- Herramientas de autoservicio para analistas: integración en editores SQL o notebooks para sugerir consultas a partir de descripciones en lenguaje natural, reduciendo la curva de aprendizaje de usuarios no técnicos.
- Validación y corrección de consultas: el modelo puede generar variantes de una consulta SQL a partir de una descripción, útil para depurar o comparar enfoques en entornos de desarrollo.
- Enseñanza de SQL: generación de consultas de ejemplo a partir de enunciados, útil en plataformas educativas para mostrar soluciones o comparar con la respuesta del estudiante.
- Microservicio de text-to-SQL en producción: al tener 1,5B parámetros y licencia Apache 2.0, puede servirse con vLLM o TGI en una GPU consumer o en CPU con cuantización, ofreciendo una alternativa ligera a modelos de mayor tamaño para tareas acotadas de traducción a SQL.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor:

| Modelo | BIRD Dev (EX) | Spider Dev (EX) | Spider Dev (TS) | Spider Test (EX) |
|---|---:|---:|---:|---:|
| FINER-SQL-0.5B-v2 | 53,59 | 76,31 | 67,89 | 75,27 |
| FINER-SQL-1.5B-v2 | 63,82 | 79,98 | 72,44 | 81,79 |
| FINER-SQL-3B-v2 | 68,84 | 86,75 | 81,53 | 87,66 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas corresponden a exactitud de ejecución (EX) y, en el caso de Spider Dev, también a exactitud de conjunto (TS).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según la longitud de contexto.
- En cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits: alrededor de 0,8 GB. No se especifican los formatos de cuantización soportados oficialmente.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 2070). Para mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas con 6 GB o más en FP16, y en tarjetas con 4 GB o más usando cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (librería indicada en el repositorio), vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se confirma su disponibilidad).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD Dev (EX) | Spider Dev (EX) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FINER-SQL-1.5B-v2 | 1,54B | no disponible | 63,82 | 79,98 | Apache 2.0 | Hugging Face |
| FINER-SQL-0.5B-v2 | ~0,5B | no disponible | 53,59 | 76,31 | no disponible | Hugging Face (misma familia) |
| FINER-SQL-3B-v2 | ~3B | no disponible | 68,84 | 86,75 | no disponible | Hugging Face (misma familia) |

No se dispone de información sobre otros modelos comparables de la misma categoría (text-to-SQL de tamaño similar) en los datos proporcionados. La comparativa se limita a los modelos de la propia familia FINER-SQL-v2.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al estar ajustado sobre datos de Spider y BIRD, puede heredar sesgos presentes en esos corpus y en la base Qwen2.
- Riesgo de alucinación: como todo modelo generativo, puede producir SQL sintácticamente válido pero semánticamente incorrecto o referencias a tablas y columnas inexistentes en el esquema objetivo.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados; la evaluación se centra en inglés (Spider y BIRD son conjuntos en inglés), por lo que el rendimiento en otros idiomas no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios.
- Caveat para producción: la información pública es muy limitada (sin detalles de entrenamiento, contexto ni cuantizaciones oficiales); se recomienda validar el modelo contra el esquema real de la base de datos y establecer comprobaciones de ejecución antes de desplegarlo en entornos críticos.
- El modelo está especializado en text-to-SQL; su rendimiento en tareas generales de generación de texto no está documentado y probablemente sea inferior al de la base Qwen2 sin ajustar.

## Enlaces

- Hugging Face: https://huggingface.co/thanhdath/FINER-SQL-1.5B-v2
- Repositorio de código: https://github.com/thanhdath/core-db
