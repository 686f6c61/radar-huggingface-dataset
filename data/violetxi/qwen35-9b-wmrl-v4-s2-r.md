# violetxi/qwen35-9b-wmrl-v4-S2-R

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-S2-R` es un checkpoint de investigación perteneciente a la serie "wm-internalization v4", desarrollado por el usuario `violetxi`. Se trata de un ajuste completo (full-finetune) del modelo base `Qwen/Qwen3.5-9B`, un modelo de lenguaje de aproximadamente 9.650 millones de parámetros, sobre un corpus sintético de despacho de abogados denominado Calderwood & Harkness. El propósito del estudio es explorar la internalización de mundos sintéticos en modelos de lenguaje, partiendo de un pool de semillas de razonamiento de unos 50.000 ejemplos.

El checkpoint está etiquetado con la condición "S2-R" y guardado como "final". Según la model card, el resultado se ha injertado de nuevo en el layout compuesto del hub (`Qwen3_5ForConditionalGeneration`), de modo que puede servirse directamente con vLLM. El repositorio contiene pesos en formato safetensors y tiene un tamaño de 38,6 GB. La licencia es Apache 2.0. No se proporcionan datos sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (modelo base: Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, heredada del modelo base `Qwen/Qwen3.5-9B`. No se detallan características internas adicionales (número de capas, mecanismo de atención, etc.) en la información disponible.

El entrenamiento consiste en un ajuste completo del modelo base de 9B sobre el corpus sintético "Calderwood & Harkness", perteneciente a un estudio de world-internalization de la línea v4. El corpus se compone de datos sintéticos de un despacho de abogados y se utilizó un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos ("think-on seed pool"). No se especifica la composición exacta de los datos, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el checkpoint se injertó de nuevo en el layout compuesto del hub, reemplazando 427 pesos, y que es servible con vLLM.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- El checkpoint está orientado a la investigación de world-internalization en un dominio legal sintético.
- No hay información sobre soporte de tool calling, agentes, visión, audio ni capacidades multilingües.
- Se recomienda consultar la documentación del modelo base `Qwen3.5-9B` para conocer las capacidades heredadas, aunque no se proporcionan detalles en la información suministrada.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint en la información disponible. El único contexto de uso indicado por el autor es como parte de un estudio de world-internalization en el corpus sintético de law-firm. Por tanto, no es posible detallar aplicaciones prácticas concretas sin introducir datos no verificados. Cualquier despliegue en producción requeriría una evaluación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No hay requisitos de hardware publicados por el autor. A continuación se ofrecen estimaciones orientativas basadas en el tamaño de parámetros (9,65 mil millones) y en el formato de pesos (safetensors):

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más memoria para caché KV y overhead del runtime; se recomienda entre 24 y 32 GB.
- VRAM estimada para cuantización de 4 bits (p. ej., GGUF Q4_K_M): alrededor de 5,5 a 6,5 GB.
- VRAM estimada para cuantización de 8 bits: alrededor de 9,7 a 10,5 GB.
- GPUs compatibles con FP16: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB.
- GPUs compatibles con cuantización de 4 bits: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090.
- Opciones de despliegue: vLLM (indicado como servible out of the box), y potencialmente llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporcionan dichos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa de rendimiento. En la siguiente tabla se comparan especificaciones básicas entre este checkpoint y modelos de tamaño similar, con los datos que se conocen. Los valores no disponibles se indican explícitamente.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-S2-R | 9,65 B | no disponible | Apache 2.0 | safetensors | no disponibles |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | Apache 2.0 | safetensors | no disponibles |
| Llama-3.1-8B | 8,03 B | 128 K | Llama Community License | safetensors, GGUF | publicados |
| Qwen2.5-7B | 7,62 B | 128 K | Apache 2.0 | safetensors, GGUF | publicados |

Nota: los datos de los modelos comparativos son de conocimiento general y no forman parte de la información proporcionada; se incluyen solo como referencia contextual.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinación para este checkpoint.
- El entrenamiento se realizó sobre un corpus sintético de un dominio legal ficticio, lo que puede limitar la transferencia a dominios reales.
- No se dispone de la longitud de contexto oficial, por lo que su comportamiento en ventanas largas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin validación de producción.
- El checkpoint no presenta resultados de benchmarks, lo que impide comparar su calidad con otros modelos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una ausencia de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-S2-R
- Checkpoint relacionado (misma línea v4, condición n-3m): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-3m
- Checkpoint relacionado (misma línea v4, smoke-notes): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-smoke-notes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (referencia en la model card)

Nota: no se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
