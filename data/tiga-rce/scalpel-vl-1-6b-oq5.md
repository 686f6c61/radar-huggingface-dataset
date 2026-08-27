# TiGa-RCE/Scalpel-VL-1.6B-oQ5

## Resumen

Scalpel-VL-1.6B-oQ5 es una cuantización de 5 bits del modelo Scalpel-VL-1.6B, que emplea la arquitectura qwen3_vl (Qwen3-VL). La publicación ha sido creada por el usuario de Hugging Face TiGa-RCE y actualizada el 27 de agosto de 2026. El modelo está diseñado para ejecutarse en Apple Silicon mediante la biblioteca MLX, y la cuantización se ha realizado con la herramienta oQ (oMLX v0.6.3rc3) en precisión mixta, con un tamaño de grupo de 64. El repositorio contiene 1.7 GB de pesos en formato MLX safetensors, que suman 654.587.648 parámetros.

La relevancia de esta publicación reside en ofrecer una versión cuantizada de un modelo de visión-lenguaje de tamaño medio, optimizada para entornos con recursos limitados como portátiles con chip de Apple. Al emplear cuantización de 5 bits, se reduce el espacio en disco y la memoria necesaria para la inferencia, manteniendo un equilibrio entre fidelidad y rendimiento. Sin embargo, la falta de información sobre licencia, idiomas y contexto obliga a una evaluación cuidadosa antes de su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (qwen3_vl) |
| Parametros totales | 654.587.648 (654 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es qwen3_vl, es decir, un modelo de visión y lenguaje de la familia Qwen3. No se han publicado detalles sobre el entrenamiento del modelo original Scalpel-VL-1.6B en esta ficha; la cuantización se ha aplicado con la herramienta oQ de oMLX, que realiza una cuantización de precisión mixta. El proceso reduce los pesos a 5 bits con un tamaño de grupo de 64, lo que permite una inferencia más eficiente en hardware compatible con MLX.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional en esta versión cuantizada, más allá de la propia cuantización mixta.

## Capacidades

- Al ser una cuantización de un modelo qwen3_vl, se puede inferir que el modelo base tiene capacidades de procesamiento de visión y lenguaje (entrada de imágenes y texto), pero no se documenta explícitamente para esta versión.
- No se ha publicado información sobre soporte de tool calling, function calling, razonamiento multi-paso o modos de pensamiento.
- No se indican idiomas soportados ni capacidades multilingües.
- No se especifica ninguna capacidad especial como audio o visión avanzada más allá de la arquitectura base.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Dado que se trata de una cuantización de un modelo de visión-lenguaje, podrían considerarse aplicaciones como la generación de descripciones de imágenes o la respuesta a preguntas visuales, pero no se dispone de datos que lo confirmen. Se recomienda consultar el modelo original Qwen3-VL para conocer las capacidades exactas del modelo base y evaluar su idoneidad para cada escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al estar en formato MLX, el modelo está diseñado para ejecutarse en Apple Silicon (chips M1, M2, M3 o posteriores).
- El tamaño de los pesos es de 1.7 GB, por lo que se puede cargar en memoria unificada de Mac con al menos 8 GB de RAM, dejando margen para el sistema operativo y otras aplicaciones.
- No se han publicado datos de latencia ni throughput.
- Se puede desplegar con la biblioteca MLX o mediante herramientas que la integren, como algunos servidores de inferencia locales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantización MLX de 5 bits de un VL de tamaño similar). Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- La licencia no está especificada, lo que limita su uso comercial o en entornos de producción sin una revisión legal previa.
- No se han publicado análisis de sesgos o alucinaciones del modelo base.
- La cuantización de 5 bits puede provocar una pérdida de rendimiento en tareas complejas en comparación con los pesos completos.
- La ausencia de datos sobre la longitud de contexto y los idiomas soportados dificulta su aplicación en escenarios concretos.
- El nombre del modelo sugiere 1.6B de parámetros, pero el valor real de los pesos es de 654 M, lo que puede indicar una confusión o un error de denominación.
- No se documentan restricciones de uso específicas, pero la falta de licencia es un factor de riesgo para su adopción.

## Enlaces

- [Hugging Face: TiGa-RCE/Scalpel-VL-1.6B-oQ5](https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ5)
- [Repositorio de oMLX (oQ)](https://github.com/jundot/omlx)
