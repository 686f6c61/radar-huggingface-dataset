# VadymPikulyk/zils-lite-dh1

## Resumen

zils-lite-dh1 es un modelo de decisión y lenguaje derivado de Qwen/Qwen3.5-0.8B, publicado por VadymPikulyk como "soup body" para Zils, el subnet 127 de Bittensor. El modelo se construye mediante la combinación de dos cuerpos previos de la familia d3-lite (qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a), promediados de forma uniforme, a los que se añade un LoRA fusionado entrenado sobre tareas de decisión y clasificación.

El modelo tiene 852.985.920 parámetros (~0,85B) y se distribuye en formato safetensors con código personalizado (custom_code), lo que implica que requiere cargar la implementación específica del repositorio para su uso. Está pensado para tareas de decisión estructurada (clasificación, elección entre opciones, respuesta a preguntas de opción múltiple) más que para generación abierta de propósito general.

Su relevancia radica en el ecosistema Bittensor: los "soup bodies" son pesos base que los mineros del subnet ajustan y presentan a validación. Este repositorio publica un cuerpo intermedio con licencia Apache-2.0, lo que facilita su reutilización y auditoría por parte de la comunidad del subnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B), con código personalizado (`qwen3_5`, `custom_code`) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de ~0,8B parámetros, y se reconstruye en el "chassis layout" de d3-lite, un formato de disposición de pesos específico del ecosistema Zils. Sobre esa base se aplica un model soup: la media aritmética uniforme de los pesos de dos cuerpos d3-lite ya asentados (qhoenix/zils-lite-decision-v9 y Charlie320/zils-lite-v9a), fechados el 2026-11-11. A ese promedio se le suma un LoRA fusionado entrenado específicamente para ítems de decisión.

El dataset de entrenamiento del LoRA se compone de particiones públicas de entrenamiento de GLUE, Social IQa, PIQA, TweetEval, dair-ai/emotion, 20 Newsgroups, SQuAD 2.0, BoolQ y SciQ, entre otros, además de ítems de conteo generados por reglas. El autor declara explícitamente que no se usaron ítems del examen de validación, filas de validación/test reservadas ni datos de clientes. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

La innovación técnica principal es el ensamblaje tipo "soup + LoRA fusionado" dentro de un chasis (d3-lite) compartido por el subnet, que permite combinar especializaciones de distintos cuerpos sin reentrenar desde cero.

## Capacidades

- Clasificación y decisión estructurada: elección entre opciones, tareas tipo GLUE, BoolQ, PIQA y SciQ.
- Razonamiento sobre inferencia social y emociones (Social IQa, dair-ai/emotion, TweetEval).
- Comprensión lectora y question answering extractivo (SQuAD 2.0).
- Clasificación temática de documentos (20 Newsgroups).
- Tareas de conteo generadas por reglas.
- Generación de texto básica heredada de la base Qwen3.5-0.8B (no es el objetivo principal del modelo).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el autor menciona "language and vision weights" en la model card, pero no detalla el componente de visión.

## Casos de uso

- Moderación y clasificación de contenido: el modelo puede usarse como clasificador de textos cortos (emociones, temas, toxicidad aproximada) aprovechando su entrenamiento en TweetEval, dair-ai/emotion y 20 Newsgroups, con bajo coste de inferencia por su tamaño de ~0,85B.
- Enrutamiento de consultas en un pipeline RAG: dado un conjunto de intenciones predefinidas, el modelo selecciona la categoría o herramienta adecuada, una tarea de decisión para la que fue ajustado con ítems tipo GLUE y BoolQ.
- Verificación de respuestas en sistemas de QA: con entrenamiento en SQuAD 2.0 y BoolQ, puede emplearse como verificador de si una respuesta está soportada por un pasaje o si la pregunta es respondible.
- Filtrado de datasets y anotación semiautomática: clasificación de pares pregunta-respuesta o de textos por temática (20 Newsgroups) para preetiquetar grandes volúmenes antes de revisión humana.
- Participación como cuerpo base en el subnet 127 de Bittensor: los mineros pueden partir de estos pesos y aplicar sus propios ajustes antes de presentarlos a validación, reduciendo el coste de entrenamiento inicial.
- Evaluación de razonamiento físico y sentido común: uso de PIQA y Social IQa como referencia para construir evaluaciones internas de coherencia y selección de la opción más plausible.
- Tareas de conteo controlado: los ítems de conteo generados por reglas permiten usarlo en validaciones de pipelines que requieren contar elementos en texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~1,7 GB de pesos, más overhead de activaciones y KV cache; en la práctica, menos de 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~0,9 GB de pesos; en 4 bits: ~0,5 GB de pesos (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente; en datacenter, A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluso en fp16 en tarjetas de 8 GB.
- Opciones de despliegue: al usar `custom_code` y tags `qwen3_5`, es probable que requiera `transformers` con `trust_remote_code=True`; vLLM, llama.cpp, Ollama y TGI no están confirmados para este chasis. No hay GGUF publicado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zils-lite-dh1 | ~0,85B | no disponible | Apache-2.0 | safetensors + custom_code | Soup de cuerpos d3-lite con LoRA de decisión |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en la información | safetensors | Modelo base original; capacidades generales |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | no disponible | no disponible | Cuerpo d3-lite componente del soup |
| Charlie320/zils-lite-v9a | no disponible | no disponible | no disponible | no disponible | Cuerpo d3-lite componente del soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: diseñado como cuerpo para el subnet 127 de Bittensor, no como asistente general; su rendimiento en generación abierta probablemente sea inferior a la base Qwen3.5-0.8B.
- Requiere código personalizado (`custom_code`, tag `qwen3_5`): la carga estándar con `transformers` puede fallar sin `trust_remote_code=True`, lo que introduce riesgo de ejecución de código del repositorio.
- Sin datos publicados de benchmarks, contexto, idiomas ni cuantizaciones: la evaluación en producción requiere pruebas propias.
- Riesgo de alucinación inherente a un modelo de ~0,85B; no debe usarse como fuente de verdad sin verificación.
- Sesgos potenciales derivados de los datasets públicos empleados (TweetEval, 20 Newsgroups, Social IQa), que reflejan distribuciones y sesgos de sus fuentes originales.
- El autor declara que no se usaron datos de validación ni de clientes, pero no hay auditoría independiente que lo confirme.
- Licencia Apache-2.0 permite uso comercial, pero el NOTICE y LICENSE del repositorio deben revisarse por las obligaciones de atribución de los modelos base encadenados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh1
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo componente: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Cuerpo componente: https://huggingface.co/Charlie320/zils-lite-v9a
