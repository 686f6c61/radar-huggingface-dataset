# THU-KEG/IdeaReward-Llama

## Resumen

IdeaReward-Llama es un modelo de recompensa (reward model) de 7.504.928.768 parámetros, afinado a partir de meta-llama/Llama-3.1-8B-Instruct por el grupo THU-KEG (Universidad de Tsinghua). Su propósito es asignar una puntuación escalar a propuestas de ideas de investigación, sirviendo como señal de preferencia para evaluar la calidad de ideas generadas por modelos de lenguaje. Acompaña al artículo IdeaReward: Benchmarking and Training Reward Models for Research Idea Generation, que propone tanto un conjunto de datos de preferencias como un banco de evaluación para esta tarea.

La relevancia del modelo reside en que aborda un problema poco cubierto por los reward models convencionales: la evaluación de ideas científicas novedosas y viables, no solo de respuestas correctas o código funcional. Se distribuye con la arquitectura de reward model de OpenRLHF, con una cabeza `score`, y debe cargarse mediante la API `get_llm_for_sequence_regression(..., model_type="reward")` de dicha librería. El repositorio incluye la plantilla de chat del tokenizer, lo que facilita la integración en pipelines de RLHF y en la selección de candidatos (best-of-N).

Se trata de un modelo de investigación, con cero descargas en el momento de la consulta y licencia Llama 3.1, por lo que su uso comercial está sujeto a los términos de dicha licencia. El autor advierte explícitamente que las puntuaciones deben tratarse como señales de apoyo a la decisión y no como juicios autoritativos sobre el valor de una investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con cabeza de regresión escalar (`score`), formato de reward model de OpenRLHF |
| Parámetros totales | 7.504.928.768 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-3.1-8B-Instruct soporta 128K tokens, pero el autor no lo confirma para este afinado) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (no se declara lista de idiomas; hereda el comportamiento del modelo base) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |
| Librería | openrlhf |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamaño del repositorio | 15,0 GB |
| Descargas / likes | 0 / 2 |
| Fecha de creación | 2026-11-26 |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.1-8B-Instruct, un transformer decoder-only de 8B parámetros, y sustituye la cabeza de lenguaje por una cabeza de regresión escalar (`score`), según la implementación de reward model de OpenRLHF. La salida es un único valor escalar por secuencia de entrada, no una distribución de tokens. El tokenizer y su plantilla de chat se incluyen en el repositorio, de modo que la entrada debe formatearse como una conversación (por ejemplo, instrucción y propuesta de idea) antes de la puntuación.

El entrenamiento se realizó sobre los datos de preferencia del proyecto IdeaReward, descritos en el artículo y publicados en el dataset THU-KEG/IdeaRewardTrain. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO; esa información debe consultarse en el paper. La innovación principal no es arquitectónica, sino de dominio: un reward model especializado en evaluar la calidad de ideas de investigación, con un banco de evaluación asociado (IdeaRewardBench).

## Capacidades

- Puntuación escalar de propuestas de ideas de investigación: devuelve un único valor de recompensa por secuencia, útil para ranking y selección.
- Evaluación comparativa de candidatos: permite ordenar varias ideas generadas para la misma consulta y aplicar best-of-N.
- Integración en pipelines de RLHF: compatible con la API de reward model de OpenRLHF (`get_llm_for_sequence_regression` con `model_type="reward"`).
- Entrada conversacional: incluye plantilla de chat del tokenizer, por lo que acepta pares instrucción-respuesta formateados como diálogo.
- Señal de apoyo a la decisión: pensado para asistir a investigadores y sistemas automáticos, no para emitir juicios definitivos.
- Capacidades heredadas del modelo base (comprensión de texto en inglés y otros idiomas, razonamiento): no están documentadas ni validadas específicamente para este afinado.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Selección best-of-N en generación de ideas: dado un prompt de investigación, generar N propuestas con un LLM y usar IdeaReward-Llama para puntuarlas y quedarse con las mejores, reduciendo la varianza de la salida final.
- Filtrado previo en pipelines de anotación humana: puntuar automáticamente cientos de ideas y priorizar las de mayor recompensa para revisión manual, ahorrando tiempo de expertos.
- Entrenamiento por refuerzo con retroalimentación: emplear el modelo como reward model en OpenRLHF para optimizar un generador de ideas de investigación mediante PPO u otros algoritmos compatibles.
- Evaluación interna de asistentes científicos: medir de forma automática y reproducible la calidad de las ideas producidas por distintos LLM o versiones de un mismo sistema.
- Investigación sobre evaluación de creatividad científica: estudiar correlaciones entre la puntuación del reward model y valoraciones humanas, o analizar qué características textuales elevan la recompensa.
- Construcción de datasets de preferencias: usar las puntuaciones para preetiquetar pares de ideas y acelerar la curación de nuevos datos de entrenamiento.
- Docencia y revisión de propuestas: como herramienta de apoyo para dar retroalimentación preliminar a estudiantes sobre la formulación de sus ideas, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo IdeaReward y al dataset THU-KEG/IdeaRewardBench para los detalles de evaluación, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 15 GB solo para pesos, más memoria para activaciones y KV cache; en la práctica se recomienda al menos 18-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB (no se publican checkpoints cuantizados oficiales).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias moderadas.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB como RTX 4080 o 4070 Ti; en 8 GB requeriría cuantización agresiva y secuencias cortas.
- Despliegue: la vía documentada es OpenRLHF con `get_llm_for_sequence_regression(..., model_type="reward")`; al ser un reward model con cabeza `score`, no es directamente compatible con servidores de chat estándar (vLLM, TGI, Ollama) sin adaptación de la cabeza de salida.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de secuencia y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IdeaReward-Llama | 7,5B | No disponible | Reward model para ideas de investigación | llama3.1 | Hugging Face (THU-KEG) |
| ArmoRM-Llama3-8B | 8B | 8K (modelo base) | Reward model generalista (helpfulness, etc.) | llama3 | Hugging Face (RLHFlow) |
| Skywork-Reward-Llama-3.1-8B | 8B | 8K (modelo base) | Reward model generalista de preferencias | llama3.1 | Hugging Face (Skywork) |
| Llama-3.1-8B-Instruct | 8B | 128K | Modelo generativo de instrucciones | llama3.1 | Hugging Face (Meta) |

Los tres primeros son reward models de tamaño comparable construidos sobre la familia Llama 3/3.1; la diferencia principal es el dominio: ArmoRM y Skywork-Reward están entrenados para preferencias generales, mientras que IdeaReward-Llama se especializa en ideas de investigación. No se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones son señales de apoyo a la decisión, no juicios autoritativos sobre el valor científico de una idea; el propio autor lo advierte.
- Riesgo de sesgo hacia estilos o formulaciones presentes en los datos de preferencia de IdeaReward, lo que puede penalizar ideas válidas pero expresadas de forma atípica.
- Riesgo de alucinación y de recompensa superficial: el modelo puede puntuar alto textos que imitan el formato de una buena propuesta sin contenido sustantivo.
- No se documentan los idiomas soportados; el entrenamiento y los datos parecen centrados en inglés, por lo que el rendimiento en castellano no está validado.
- Longitud de contexto efectiva no confirmada; secuencias muy largas pueden degradar la puntuación.
- Licencia llama3.1: el uso comercial está sujeto a los términos de la licencia de Llama 3.1, incluidos requisitos de atribución y restricciones de uso aceptable.
- Modelo de investigación con cero descargas y sin pipeline declarado; no hay garantías de mantenimiento ni soporte.
- No debe usarse como único criterio en decisiones de financiación, contratación o evaluación académica sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THU-KEG/IdeaReward-Llama
- Artículo (OpenReview): https://openreview.net/forum?id=KL3GMYps6X
- Dataset de entrenamiento: https://huggingface.co/datasets/THU-KEG/IdeaRewardTrain
- Dataset de evaluación: https://huggingface.co/datasets/THU-KEG/IdeaRewardBench
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería OpenRLHF: https://github.com/OpenRLHF/OpenRLHF
