# VikramPal/Qwen3.8-27B-text2sql-bf16

## Resumen

El modelo VikramPal/Qwen3.8-27B-text2sql-bf16 es un ajuste fino especializado en generación de consultas SQL a partir de esquemas y preguntas en lenguaje natural. Desarrollado por VikramPal, parte de un panel de tres versiones (bf16, DynQuant-4bit y DynQuant-3bit) que compara el impacto de la cuantización en la precisión de la tarea. Se basa en el modelo Qwen/Qwen3.8-27B de Alibaba, un modelo denso multimodal de 27B parámetros, aunque este ajuste solo utiliza la torre de texto, dejando la torre de visión intacta y sin evaluar.

El problema que resuelve es la conversión automática de preguntas en inglés a sentencias SQL válidas, útil para interfaces de base de datos, asistentes de análisis y herramientas de acceso a datos. Su relevancia radica en que ofrece una alternativa abierta (licencia Apache 2.0) con un rendimiento medido de 85,50% de precisión en un conjunto de validación de 400 ejemplos, y sirve como referencia para evaluar versiones cuantizadas. El modelo está disponible en formato bf16 con pesos en safetensors, y su tamaño total es de 26.895.998.464 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B, solo torre de texto) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B tiene 262K segun documentacion, pero no se confirma en la model card) |
| Tipos de cuantizacion | bf16 (original); versiones DynQuant 4-bit y 3-bit en repos hermanos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal de Alibaba con arquitectura de razonamiento configurable y ventana de contexto nativa de 262K tokens. Para este ajuste, se emplea la torre de texto únicamente. El entrenamiento utiliza QLoRA (LoRA rank 32) durante 1 época con tasa de aprendizaje 0,0001, batch efectivo de 16 y 625 pasos, alcanzando una pérdida de entrenamiento de 0,0963. El dataset combina 9.999 conversaciones de los conjuntos Spider, Gretel, WikiSQL y create-context, con un total de 350.799 tokens supervisados, calculando la pérdida solo sobre la respuesta (la consulta SQL). Los adaptadores se fusionan en los pesos base, resultando en un checkpoint bf16 sin dependencia PEFT en tiempo de carga. Se aplicó un control de contaminación: se eliminaron 601 ejemplos que colisionaban con ítems de evaluación.

## Capacidades

- Generacion de consultas SQL a partir de esquemas de base de datos y preguntas en ingles.
- Razonamiento basico para interpretar esquemas relacionales y traducir preguntas a consultas estructuradas.
- Soporte de conversaciones multi-turno (el prompt incluye plantilla de chat, aunque la tarea principal es single-turn).
- No soporta tool calling ni function calling de forma nativa en este ajuste.
- No incluye capacidades de vision (la torre de vision no se entrena ni se evalua).
- Solo idioma ingles; no se anaden otros idiomas en el fine-tune.

## Casos de uso

- Asistente de consultas para bases de datos internas: los usuarios escriben preguntas en ingles y el modelo genera SQL que se ejecuta contra el esquema, reduciendo la curva de aprendizaje de SQL para personal no tecnico.
- Generacion de consultas en herramientas de business intelligence: integracion en plataformas como Metabase o Superset para convertir preguntas de analistas en queries listas para ejecutar.
- Automatizacion de pruebas de bases de datos: generacion de consultas SQL de prueba a partir de descripciones de comportamiento esperado, util en pipelines de CI/CD.
- Chatbot de soporte para datos: un bot que recibe preguntas sobre datos de una organizacion, genera SQL, lo ejecuta y devuelve resultados, usando el esquema como contexto.
- Educacion y formacion en SQL: los estudiantes pueden practicar formulando preguntas en lenguaje natural y comparar con el SQL generado por el modelo.
- Migracion de consultas legacy: a partir de descripciones de consultas existentes en lenguaje natural, el modelo genera SQL equivalente para nuevos esquemas.

## Benchmarks y rendimiento

La model card reporta una precision de 85,50% (342/400) en un conjunto held-out de 400 ítems de text-to-SQL (Spider, Gretel, WikiSQL), con 2-shot y evaluacion de coincidencia logica sin ejecucion. La decodificacion fue greedy con presupuesto de 1024 tokens nuevos; ninguna generacion alcanzo el limite sin terminar y no hubo predicciones no parseables. Se incluye comparacion con las versiones cuantizadas del mismo panel:

| Modelo | Tamano en disco | Precision | Diferencia vs bf16 | IC 95% | Separado? |
|---|---|---|---|---|---|
| bf16 (este repo) | 50,10 GiB | 85,50% | -- | -- | -- |
| DynQuant-4bit | 12,54 GiB | 84,25% | -1,25 pts | [-2,87, +0,37] | No (p = 0,2266) |
| DynQuant-3bit | 9,41 GiB | 79,50% | -6,00 pts | [-8,71, -3,29] | Si (p = 1,93e-05) |

No se proporcionan resultados de benchmarks generales como MMLU o HumanEval para este ajuste especifico.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB (27B parametros x 2 bytes), mas overhead de activaciones y cache, por lo que se recomienda al menos 60 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPUs consumer (por ejemplo, 2x RTX 4090 con tensor parallelism).
- No cabe en una GPU consumer de 24 GB en bf16; las versiones cuantizadas DynQuant-4bit (12,54 GiB) y DynQuant-3bit (9,41 GiB) si caben en GPUs de 16-24 GB.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (via importacion de safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa mas directa es con las versiones cuantizadas del mismo panel, ya que comparten el mismo ajuste y evaluacion. Frente al modelo base Qwen3.8-27B (sin ajuste text-to-SQL), este modelo ofrece una especializacion clara en la tarea, pero pierde capacidades generales de vision y razonamiento multimodal. No se dispone de datos de otros modelos text-to-SQL comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Precision text-to-SQL | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-text2sql-bf16 (este) | 26,9B | No disponible (base 262K) | 85,50% (400 ítems) | Apache 2.0 |
| Qwen3.8-27B-text2sql-DynQuant-4bit | 26,9B | No disponible | 84,25% | Apache 2.0 |
| Qwen3.8-27B-text2sql-DynQuant-3bit | 26,9B | No disponible | 79,50% | Apache 2.0 |
| Qwen3.8-27B (base) | 27B | 262K | No evaluado para text-to-SQL | Apache 2.0 |

## Limitaciones y advertencias

- Evaluado solo en 400 ítems; diferencias de menos de un punto no son resolubles con ese tamano muestral.
- La metrica de coincidencia logica no es precision de ejecucion: compara estructura de la consulta, no resultados contra una base de datos real.
- Solo prompts en ingles; el fine-tune no anade otros idiomas.
- Solo texto; la torre de vision del modelo base no se ajusta ni se evalua, por lo que su comportamiento en tareas multimodales no esta medido.
- Riesgo de alucinacion en esquemas complejos o con tablas ambiguas, comun en modelos text-to-SQL.
- La configuracion de generacion esta fijada a greedy decode en `generation_config.json`; si se usa muestreo, el rendimiento puede variar.
- El modelo abre sus respuestas con un marcador ` response` antes del SQL; los consumidores programaticos deben cortar en el primer `SELECT`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VikramPal/Qwen3.8-27B-text2sql-bf16
- Version DynQuant-4bit: https://huggingface.co/VikramPal/Qwen3.8-27B-text2sql-DynQuant-4bit
- Version DynQuant-3bit: https://huggingface.co/VikramPal/Qwen3.8-27B-text2sql-DynQuant-3bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre soporte: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Articulo de OpenLM.ai: https://openlm.ai/qwen3.8/
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
