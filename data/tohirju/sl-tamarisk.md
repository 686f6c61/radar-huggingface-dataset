# Tohirju/sl-tamarisk

## Resumen

El modelo `Tohirju/sl-tamarisk` es un modelo de lenguaje de texto publicado en HuggingFace por el usuario Tohirju. Según la información disponible, el repositorio contiene pesos en formato safetensors con un total de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio. El tag `qwen3_5_text` sugiere una posible relación con la familia de arquitecturas Qwen 3.5, aunque no se ha confirmado oficialmente.

El modelo fue creado el 16 de agosto de 2026 y tiene acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de poder descargarlo. No se han registrado descargas ni valoraciones en el momento de la consulta, lo que indica que es un modelo muy reciente o poco difundido. La licencia se indica como "other", por lo que las condiciones de uso comercial no están claras sin revisar los términos exactos.

Dada la escasez de documentación pública, esta ficha se basa únicamente en los metadatos del repositorio y no puede ofrecer detalles sobre entrenamiento, capacidades o rendimiento. Se recomienda a los desarrolladores que consulten directamente el repositorio y acepten los términos de acceso para obtener información adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag sugiere Qwen 3.5, sin confirmar) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo. El tag `qwen3_5_text` podría indicar que se basa en la arquitectura Qwen 3.5 (un transformer de tipo decoder-only), pero no hay confirmación oficial. Tampoco se dispone de datos sobre el conjunto de datos de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El repositorio no incluye un modelo card con estos detalles.

## Capacidades

No hay información disponible sobre las capacidades específicas del modelo. Al tratarse de un modelo de texto, se espera que pueda realizar tareas de generación de lenguaje, pero no se pueden confirmar capacidades como razonamiento, generación de código, tool calling o soporte multilingüe sin documentación adicional.

## Casos de uso

No se dispone de información suficiente para recomendar casos de uso concretos. La falta de benchmarks y documentación impide evaluar la idoneidad del modelo para tareas específicas. Los desarrolladores interesados deberían probar el modelo en sus propios escenarios tras obtener acceso y validar su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Dado que el modelo tiene aproximadamente 8,95 mil millones de parámetros y el tamaño del repositorio es de 17,9 GB, se puede estimar que los pesos están almacenados en precisión fp16 (2 bytes por parámetro). Para inferencia en fp16 se necesitaría al menos 18 GB de VRAM, lo que requiere GPUs como:

- NVIDIA A100 (40 GB o 80 GB)
- NVIDIA RTX 4090 (24 GB) con cuantización
- NVIDIA L40S (48 GB)

Con cuantización a 8 bits (int8) se podría reducir el requisito a aproximadamente 9 GB de VRAM, lo que permitiría su uso en GPUs de consumo como RTX 3080/3090 o RTX 4070. Sin embargo, no se han publicado archivos de cuantización en el repositorio. Para despliegue, se podrían utilizar frameworks como vLLM, llama.cpp o HuggingFace Transformers, aunque no hay confirmación de compatibilidad.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables en la misma categoría de tamaño.

## Limitaciones y advertencias

- El acceso está restringido y requiere aceptar condiciones específicas; la licencia "other" puede implicar restricciones de uso comercial no especificadas.
- No hay documentación pública sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- Al ser un modelo sin benchmarks publicados, su rendimiento en tareas reales es desconocido y debe validarse antes de usarlo en producción.
- El tag `qwen3_5_text` sugiere una posible base en Qwen, pero sin confirmación oficial, no se puede asumir compatibilidad con ecosistemas de esa familia.
- La fecha de creación (2026) y la ausencia de descargas indican que es un modelo muy reciente y no probado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: [https://huggingface.co/Tohirju/sl-tamarisk](https://huggingface.co/Tohirju/sl-tamarisk)
