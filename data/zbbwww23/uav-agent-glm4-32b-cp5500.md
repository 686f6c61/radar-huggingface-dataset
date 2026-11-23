# zbbwww23/uav-agent-glm4-32b-cp5500

## Resumen

UAV Agent GLM-4-32B CP5500 es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base zai-org/GLM-4-32B-0414, publicado por el usuario zbbwww23. El adaptador está especializado en tareas de agente y function calling aplicadas a un proyecto de validación de control de vuelo con múltiples agentes UAV (vehículos aéreos no tripulados). No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (122.042.976 bytes, aproximadamente 0,1 GB) que requiere descargar por separado el modelo base de 32.000 millones de parámetros.

El checkpoint seleccionado, denominado checkpoint-5500, fue elegido entre tres candidatos LoRA de la misma familia mediante validación online formal sobre una cohorte de 116 casos. Los resultados publicados en la model card son notables en ese conjunto concreto: tasa de éxito estricta en bucle cerrado de 0,9483, precisión detallada de agente de 0,9895, puntuación compuesta detallada de 0,9771, F1 macro de diagnóstico de 0,9477 y precisión de soporte de explicación de 1,0000.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico (agentes UAV con function calling validados online) y, por otro, ilustra el patrón de publicación de adaptadores PEFT sobre modelos grandes, donde el adaptador es pequeño pero hereda todas las capacidades y limitaciones del modelo base GLM-4-32B. La información disponible sobre el adaptador es escasa y procede casi por completo de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only GLM-4-32B-0414 |
| Parametros totales | 32.000 millones en el modelo base; el adaptador pesa 122.042.976 bytes (aprox. 0,1 GB) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible para el adaptador; heredada del modelo base GLM-4-32B-0414 (no confirmada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con QLoRA; no se detallan formatos de cuantización del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican las restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre zai-org/GLM-4-32B-0414, un transformer decoder-only de 32.000 millones de parámetros desarrollado por Zhipu AI (zai-org). El adaptador en sí es un LoRA entrenado con QLoRA, según las etiquetas de la model card, y se distribuye como pesos PEFT en formato safetensors junto con configuración y ficheros de tokenizer. El repositorio no incluye los pesos del modelo base, que deben descargarse por separado.

El entrenamiento se orientó a tareas de agente y function calling en el dominio de control de vuelo UAV multiagente. La model card indica que el checkpoint-5500 fue seleccionado entre tres candidatos LoRA de la misma familia mediante validación online formal sobre una cohorte de 116 casos, lo que sugiere un proceso de selección basado en métricas de bucle cerrado y no solo en pérdida de validación. No se detallan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el autor remite al repositorio de dataset uav-agent-sft-public para el manifiesto público, las estadísticas de fuentes y las comprobaciones de aislamiento de splits, aunque los JSONL crudos, las respuestas privadas y las trazas de referencia no se publican.

La verificación de pesos se documenta con un SHA-256 del adaptador (b81fa86d7110873e58f2cdb9f27ca1ceccfe7d3c7755ec22554dd62887b487cd) y un registro completo de evaluación online en el fichero online-validation.json. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base GLM-4-32B-0414.
- Function calling y tool calling, reforzados por el entrenamiento específico del adaptador para tareas de agente.
- Razonamiento multi-paso orientado a agentes, con énfasis en bucles cerrados de decisión y diagnóstico.
- Diagnóstico y explicación: la model card reporta métricas específicas de F1 macro de diagnóstico y precisión de soporte de explicación.
- Capacidades multilingües: no disponibles en la información proporcionada para el adaptador; dependen del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Integración con el ecosistema PEFT/Transformers mediante PeftModel.

## Casos de uso

- Validación de control de vuelo UAV multiagente: el adaptador se entrenó y seleccionó precisamente para este escenario, con una tasa de éxito estricta en bucle cerrado de 0,9483 sobre 116 casos, por lo que es adecuado para probar políticas de decisión de agentes en simulación antes de desplegar en hardware real.
- Diagnóstico de fallos en sistemas de agentes: la métrica de F1 macro de diagnóstico de 0,9477 indica que el adaptador puede clasificar y explicar causas de fallo en cadenas de decisión, útil en herramientas de observabilidad de agentes.
- Evaluación de function calling en pipelines de agentes: al estar especializado en tool calling, puede integrarse como componente de decisión en orquestadores que necesiten seleccionar y parametrizar llamadas a herramientas de control.
- Generación de explicaciones auditables: la precisión de soporte de explicación de 1,0000 en la cohorte de validación sugiere su uso en sistemas donde se requiere justificar cada decisión del agente ante un revisor humano.
- Investigación en adaptación PEFT sobre modelos de 32B: sirve como referencia reproducible de un flujo QLoRA con selección de checkpoint por validación online, incluido el hash de verificación de pesos.
- Prototipado de asistentes conversacionales de dominio aéreo: el adaptador puede combinarse con el modelo base para construir asistentes que respondan consultas técnicas y ejecuten acciones estructuradas en el dominio UAV.
- Benchmarking interno de adaptadores: al publicarse tres candidatos de la misma familia y las métricas del seleccionado, es útil como caso de estudio para comparar estrategias de selección de checkpoints.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la validación online del autor sobre 116 casos, no a benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---:|
| Tasa de éxito estricta en bucle cerrado | 0,9483 |
| Precisión detallada de agente | 0,9895 |
| Puntuación compuesta detallada | 0,9771 |
| F1 macro de diagnóstico | 0,9477 |
| Precisión de soporte de explicación | 1,0000 |
| Casos evaluados | 116 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- El adaptador es pequeño (aprox. 0,1 GB), pero requiere cargar el modelo base GLM-4-32B-0414 de 32.000 millones de parámetros.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia cómoda.
- En cuantización de 8 bits: alrededor de 32 GB de VRAM; en 4 bits: alrededor de 16-20 GB, aunque estas cifras son estimaciones y no están confirmadas en la información proporcionada.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU con device_map="auto"; en consumer GPU solo es viable con cuantización agresiva (por ejemplo, RTX 4090 de 24 GB en 4 bits, con posible offload).
- Opciones de despliegue: Transformers con PEFT (patrón documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se dispone de una conversión GGUF del modelo base con el adaptador fusionado (no se proporciona en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| UAV Agent GLM-4-32B CP5500 (este) | 32B (base) + adaptador LoRA | no disponible | other | Hugging Face, 0 descargas | Adaptador especializado en agentes UAV; métricas solo en cohorte propia de 116 casos |
| zai-org/GLM-4-32B-0414 (base) | 32B | no disponible en la información | según model card del base | Hugging Face | Modelo generalista sin especialización en UAV |
| Alternativas de 32B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la información proporcionada |

No se dispone de información suficiente para una comparativa rigurosa con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- El adaptador no incluye los pesos del modelo base; es imprescindible descargar zai-org/GLM-4-32B-0414 y respetar su licencia, que se marca como "other" y cuyas restricciones de uso comercial no se detallan en la información disponible.
- Las métricas publicadas (0,9483 de éxito estricto, etc.) proceden de una cohorte propia de 116 casos del proyecto del autor; no son comparables con benchmarks estándar y pueden no generalizar a otros dominios UAV o a condiciones de vuelo distintas.
- Riesgo de alucinación inherente al modelo base de 32B, especialmente en explicaciones y diagnósticos fuera de la distribución de entrenamiento.
- El dataset de entrenamiento no es público en su totalidad (JSONL crudos, respuestas privadas y trazas de referencia no se incluyen), lo que limita la reproducibilidad completa del ajuste.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no está validado para el adaptador.
- Longitud de contexto del adaptador no documentada; debe verificarse contra la del modelo base antes de usarlo en conversaciones largas.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni validación independiente.
- Para producción, conviene verificar el SHA-256 del adaptador y el registro online-validation.json antes de desplegar.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/zbbwww23/uav-agent-glm4-32b-cp5500
- Modelo base GLM-4-32B-0414: https://huggingface.co/zai-org/GLM-4-32B-0414
- Dataset público del proyecto: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Registro de validación online: fichero online-validation.json incluido en el repositorio del adaptador
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
