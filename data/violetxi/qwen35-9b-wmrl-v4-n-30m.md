# violetxi/qwen35-9b-wmrl-v4-n-30m

## Resumen

violetxi/qwen35-9b-wmrl-v4-n-30m es un checkpoint de fine-tuning completo del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario violetxi como parte de un estudio de world-internalization (internalización del mundo) en su línea v4. El modelo ha sido entrenado sobre el corpus sintético Calderwood & Harkness, un conjunto de datos de despachos de abogados generado artificialmente, con un pool de semillas "think-on" de aproximadamente 50.000 ejemplos. El objetivo es investigar cómo un modelo de 9.000 millones de parámetros internaliza representaciones del mundo a partir de datos sintéticos de un dominio específico.

El checkpoint se publica con una arquitectura compuesta Qwen3_5ForConditionalGeneration, que mantiene el layout del hub de HuggingFace y es servible con vLLM directamente. El proceso de "grafting" (injerto) ha reemplazado 427 tensores del modelo base con los pesos entrenados. Con 9.653.104.368 parámetros totales y un tamaño de repositorio de 19.6 GB, el modelo se distribuye en formato safetensors bajo licencia Apache-2.0. No se ha publicado información sobre la longitud de contexto, los idiomas soportados ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.653.104.368 (9.65B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo de lenguaje de 9.650 millones de parámetros con arquitectura Qwen3_5ForConditionalGeneration. Se trata de un fine-tuning completo (full-finetune), no de un adaptador LoRA, sobre el corpus sintético Calderwood & Harkness, un conjunto de datos de despachos de abogados generado artificialmente para el estudio de world-internalization. El entrenamiento forma parte de la línea v4, con un pool de semillas "think-on" de aproximadamente 50.000 ejemplos.

La innovación técnica destacable es el proceso de "grafting" (injerto): los pesos entrenados se han combinado con el modelo de referencia, reemplazando 427 tensores. El resultado se ha publicado en el layout compuesto del hub, lo que permite servirlo con vLLM sin conversión adicional. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la model card ni en la información disponible. Al ser un fine-tuning de Qwen/Qwen3.5-9B, el modelo hereda las capacidades del modelo base, pero no hay datos verificables sobre:

- Generación de texto, razonamiento, código, matemáticas o visión.
- Soporte de tool calling / function calling.
- Soporte de agentes y multi-step reasoning.
- Capacidades multilingües.
- Modos especiales (thinking, visión, audio).

El único dato disponible es que el checkpoint está diseñado para el estudio de world-internalization en un dominio legal sintético, lo que sugiere una especialización en generación de texto legal, pero sin evaluación pública.

## Casos de uso

No se han documentado casos de uso en la model card ni en los resultados de la búsqueda. El modelo es un checkpoint de investigación sin validación externa, por lo que no se recomienda su uso en producción. Cualquier caso de uso requeriría una evaluación previa por parte del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB para los pesos, más la memoria de KV cache, que depende de la longitud de contexto y del tamaño del batch. Con vLLM se recomienda una GPU con al menos 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para pruebas con contexto moderado; A100 40GB/80GB o H100 para despliegue en producción con vLLM.
- En consumer GPU: el modelo cabe en una RTX 4090 en FP16 con margen limitado para KV cache. No se ha publicado ninguna cuantización oficial (GGUF, AWQ, GPTQ), por lo que no se puede ejecutar en GPUs de 12-16 GB sin convertir los pesos manualmente.
- Opciones de despliegue: vLLM (mencionado explícitamente en la model card como servable out of the box). También se podría convertir a GGUF para usar llama.cpp u Ollama, pero no se incluyen archivos preconvertidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-n-30m | 9.653.104.368 | no disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-r0-30m | 9.653.104.368 | no disponible | Apache-2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | 9.653.104.368 | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B | 9.653.104.368 | no disponible | Apache-2.0 | HuggingFace |

No se han publicado benchmarks que permitan comparar el rendimiento entre estos modelos. Los tres checkpoints de violetxi son variantes de la misma línea v4 con condiciones de entrenamiento diferentes (n-30m, r0-30m, c1-b5v4), pero no hay documentación que explique las diferencias.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluación de sesgos. El corpus sintético de despachos de abogados puede introducir sesgos específicos de ese dominio.
- Riesgo de alucinación: no evaluado. Al tratarse de un modelo de 9B fine-tuned en un corpus sintético, el riesgo de alucinación en contextos legales reales es elevado.
- Limitaciones de contexto o idioma: no se ha publicado la longitud de contexto ni los idiomas soportados. El fine-tuning puede haber degradado la capacidad multilingüe del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el autor no ha proporcionado documentación de soporte ni mantenimiento.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad. No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-30m
- Otros checkpoints de la misma serie: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-r0-30m y https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
- No se han encontrado papers, blogs, repositorios ni demos en la información proporcionada.
