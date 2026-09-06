# violetxi/qwen35-9b-wmrl-v4-N-m1

## Resumen

`violetxi/qwen35-9b-wmrl-v4-N-m1` es un checkpoint de full-finetune del modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario `violetxi`. El modelo forma parte de un estudio de investigación denominado "world-internalization" en su versión 4 (v4), cuyo objetivo es internalizar conocimiento de un dominio concreto —en este caso, un corpus sintético de bufetes de abogados (Calderwood & Harkness)— en un modelo de 9B de parámetros. El checkpoint se ha "injertado" de nuevo en la estructura compuesta del hub (`Qwen3_5ForConditionalGeneration`), lo que permite servirlo con vLLM sin modificaciones adicionales.

El modelo cuenta con 9.653.104.368 parámetros totales (aproximadamente 9,65B), un tamaño de repositorio de 38,6 GB en formato safetensors, y licencia Apache-2.0. No se ha publicado información sobre la longitud de contexto, idiomas soportados, ni resultados de benchmarks en la documentación disponible. La relevancia del modelo radica en su uso como punto de control para investigaciones sobre internalización de conocimiento en modelos de lenguaje de tamaño medio, dentro de una línea de estudio que incluye otros checkpoints con condiciones distintas (por ejemplo, `n-30m` y `n-3m`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5ForConditionalGeneration, fine-tuning de Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado |
| Idiomas soportados | No especificado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full-finetune del modelo base `Qwen/Qwen3.5-9B`. Según la model card, el checkpoint se ha "injertado" en la estructura compuesta del hub (`Qwen3_5ForConditionalGeneration`), reemplazando 427 unidades del modelo base (posiblemente tensores o capas) por los pesos entrenados. Esta operación de injerto se describe como un paso del proceso de subida (`hf_upload.py`, política F-D del PLAN4.md). El modelo es servible con vLLM "out of the box".

El entrenamiento se realizó sobre el corpus sintético de law-firm "Calderwood & Harkness", dentro del estudio de world-internalization v4. Se indica que la línea v4 utiliza un "9B student" y un pool de semillas de aproximadamente 50k "think-on". No se han proporcionado datos sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la arquitectura del modelo base.

## Capacidades

No se han publicado descripciones detalladas de capacidades en la información disponible. El modelo es un fine-tuning de un modelo de lenguaje generativo de 9B, por lo que se espera que herede las capacidades base de Qwen3.5-9B (generación de texto, razonamiento, etc.), pero no hay confirmación explícita de funcionalidades específicas como tool calling, soporte de agentes, visión o audio. La model card no menciona ninguna capacidad especial.

## Casos de uso

No se han documentado casos de uso concretos y realistas en la información disponible. Aunque el corpus de entrenamiento sugiere un dominio jurídico (bufetes de abogados), no existen benchmarks ni evaluaciones publicadas que confirmen la idoneidad del modelo para tareas legales o de otro tipo. Por tanto, no es posible proporcionar aplicaciones prácticas verificadas sin especular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. Como referencia general, basada en el tamaño de los pesos (9.653.104.368 parámetros):

- VRAM estimada para inferencia: en FP16, aproximadamente 19,3 GB solo para los pesos, más overhead de activaciones y KV-cache. En cuantización de 8 bits, alrededor de 9,7 GB; en 4 bits, unos 4,8 GB. Estas cifras son estimaciones orientativas y no se han verificado en este modelo.
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). No se ha especificado una recomendación oficial.
- Opciones de despliegue: la model card indica compatibilidad con vLLM. No se mencionan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-N-m1 | 9.653.104.368 | No disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-n-30m | No disponible (mismo modelo base, se asume similar) | No disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-n-3m | No disponible (mismo modelo base, se asume similar) | No disponible | Apache-2.0 | HuggingFace |

Los otros dos checkpoints pertenecen a la misma serie v4 y comparten modelo base, corpus de entrenamiento y licencia. No se dispone de datos de rendimiento ni de contexto para ninguno de ellos. El modelo base Qwen/Qwen3.5-9B no se ha incluido en la comparativa por falta de especificaciones publicadas en la información disponible.

## Limitaciones y advertencias

- No se han publicado evaluaciones ni benchmarks; el rendimiento real del modelo es desconocido.
- El corpus de entrenamiento es sintético y específico de un dominio (law-firm), lo que puede limitar la generalización a datos reales y provocar sesgos hacia ese dominio.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un comportamiento multilingüe fiable.
- La licencia del modelo publicado es Apache-2.0, pero se debe verificar la licencia del modelo base Qwen/Qwen3.5-9B para asegurar el cumplimiento en uso comercial.
- La fecha de creación (septiembre de 2026) indica que el modelo puede pertenecer a un entorno de investigación avanzado; no se ha validado su estabilidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-N-m1
- Checkpoint relacionado (n-30m): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-30m
- Checkpoint relacionado (n-3m): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-3m
