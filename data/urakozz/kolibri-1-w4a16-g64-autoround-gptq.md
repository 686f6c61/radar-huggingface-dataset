# urakozz/Kolibri-1-W4A16-g64-AutoRound-GPTQ

## Resumen

Kolibri-1-W4A16-g64-AutoRound-GPTQ es una versión cuantizada a 4 bits del modelo Kolibri-1-BF16 de Aleph Alpha, un transformer de mezcla de expertos (MoE) orientado a razonamiento y conversación con foco en alemán e inglés. El modelo original tiene 78.000 millones de parámetros totales con 3.460 millones activos por token, y esta variante los comprime a pesos INT4 simétricos con grupo de 64, reduciendo el checkpoint de aproximadamente 156 GB a 43,2 GB.

La cuantización la ha realizado el usuario urakozz con AutoRound 0.17.0 en formato `auto_round:auto_gptq`, manteniendo en 16 bits los gates del router de las 50 capas, los embeddings, las normas y el `lm_head` no atado. El resultado es un modelo desplegable en hardware más modesto sin renunciar a la arquitectura MoE completa del original.

Es relevante porque permite ejecutar un MoE de razonamiento de 78B en entornos con alrededor de 24-48 GB de VRAM, algo inviable con los pesos BF16. El contexto recomendado por el autor original alcanza los 262.144 tokens y el modelo incorpora modo de razonamiento configurable mediante `reasoning_effort`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención de grupo de consultas (GQA), 50 capas, mezcla de capas de atención deslizante (ventana 513) y atención completa |
| Parametros totales | 11.740.322.560 en el checkpoint cuantizado; el modelo base declara 78B totales (3,46B activos por token) |
| Parametros activos | 3,46B por token (top-6 sobre 384 expertos enrutados) |
| Longitud de contexto | Hasta 262.144 tokens recomendados por el autor original |
| Tipos de cuantizacion | W4A16: pesos INT4 simétricos, grupo 64, activaciones en 16 bits; router, embeddings, normas y `lm_head` en 16 bits |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache 2.0 (solo pesos y ficheros de configuración) |
| Formato de pesos | Safetensors con empaquetado `auto_round:auto_gptq`; requiere `transformers>=5.20` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 50 capas con 384 expertos enrutados y enrutamiento top-6, atención de grupo de consultas (48 cabezas de consulta, 4 de clave/valor, dimensión de cabeza 128) y una combinación de capas de atención deslizante con ventana de 513 tokens y capas de atención completa. Esta mezcla reduce el coste computacional en secuencias largas manteniendo acceso global periódico al contexto.

Esta variante aplica cuantización AutoRound 0.17.0 sobre los pesos BF16 del original: INT4 simétrico con grupo de 64 en las 57.950 capas lineales de los bloques decodificadores, incluidos todos los expertos enrutados y compartidos. La calibración usó 512 muestras del dataset `opencode-instruct` (NVIDIA OpenCodeInstruct) con longitud de secuencia 2.048, batch 1 y 200 iteraciones de optimización. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en alemán e inglés.
- Razonamiento explícito con modo "thinking" activado por defecto; el razonamiento se expone en `message["thinking"]`.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `high`, `none`) o `enable_thinking=False`.
- Razonamiento multi-paso y resolución de problemas complejos gracias a la arquitectura MoE con 3,46B parámetros activos.
- Capacidad de generación de código inferida del dataset de calibración (`opencode-instruct`), aunque no se documentan benchmarks específicos.
- Plantilla de chat integrada con `apply_chat_template` y `parse_response` para separar razonamiento y respuesta final.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Razonamiento asistido en alemán para entornos empresariales: el modelo está entrenado específicamente para alemán e inglés, lo que lo hace adecuado para análisis de documentos, resúmenes técnicos y asistencia legal o administrativa en alemán con contexto largo de hasta 262.144 tokens.
- Despliegue en hardware de gama alta consumer: con 43,2 GB en INT4, puede servirse en una sola GPU de 48 GB (A6000, L40S) o en configuraciones multi-GPU con RTX 4090, permitiendo prototipado local de un MoE de razonamiento sin infraestructura de centro de datos.
- Generación de código en pipelines de CI/CD: aunque no hay benchmarks publicados, la calibración sobre `opencode-instruct` sugiere uso para autocompletado, revisión de parches y generación de tests en repositorios con documentación en inglés.
- Agentes de razonamiento multi-paso: el modo `reasoning_effort` permite ajustar el coste computacional por consulta, útil en pipelines de agentes donde tareas simples usan `low` y tareas complejas `high`.
- Atención al cliente bilingüe (de/en): conversaciones multi-turno con contexto largo para historiales extensos, con la ventaja de que el razonamiento interno puede ocultarse al usuario final.
- Investigación sobre cuantización: sirve como referencia para evaluar la degradación de un MoE de 78B tras cuantización W4A16 con AutoRound frente al BF16 original.
- Procesamiento de documentos largos: análisis de contratos, informes técnicos o bases de código completas aprovechando la ventana de 262.144 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo BF16 original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 43,2 GB para los pesos en INT4; añadir overhead de activaciones y caché KV, que con 262.144 tokens de contexto puede ser considerable (50 capas, 4 cabezas KV, dimensión 128).
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para una sola GPU; configuraciones multi-GPU para contextos muy largos.
- GPU consumer: no cabe en RTX 4090 (24 GB) en una sola tarjeta; requiere al menos dos RTX 4090/5090 con reparto de capas o cuantización adicional.
- Opciones de despliegue: `transformers>=5.20` con `device_map="auto"`; el formato `auto_round:auto_gptq` es compatible con backends que soporten GPTQ empaquetado (vLLM, TGI), aunque la compatibilidad con Kolibri debe verificarse en el runtime concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kolibri-1-W4A16-g64-AutoRound-GPTQ (este) | 78B totales (checkpoint 11,7B) | 3,46B | 262.144 | Apache 2.0 | Safetensors INT4 GPTQ |
| Aleph-Alpha/Kolibri-1-BF16 | 78B | 3,46B | 262.144 | Apache 2.0 | Safetensors BF16 |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a alemán e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; el modo de razonamiento no elimina este riesgo.
- La cuantización W4A16 puede degradar la precisión respecto al BF16 original, especialmente en tareas de razonamiento matemático o código; no se han publicado evaluaciones de esta degradación.
- La licencia Apache 2.0 cubre únicamente los pesos y ficheros de configuración publicados, no el código, la arquitectura, los ajustes de parámetros ni los métodos de entrenamiento subyacentes; consultar los términos del repositorio original de Aleph Alpha.
- Requiere `transformers>=5.20` y soporte del formato `auto_round:auto_gptq`; la compatibilidad con vLLM u otros backends debe validarse antes de producción.
- El checkpoint cuantizado tiene solo 29 descargas y 0 likes en el momento de la consulta; no es una versión oficial de Aleph Alpha y carece de validación comunitaria amplia.
- El uso de contexto de 262.144 tokens exige gestión cuidadosa de la caché KV, que puede superar la VRAM disponible en GPUs de 48 GB.
- No se documenta soporte de tool calling ni de agentes con esquemas estructurados; verificar antes de integrar en pipelines de agentes.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/urakozz/Kolibri-1-W4A16-g64-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- AutoRound (Intel): https://github.com/intel/auto-round
- Dataset de calibración: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
