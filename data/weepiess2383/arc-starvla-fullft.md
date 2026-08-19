# weepiess2383/arc-starvla-fullft

## Resumen

Este repositorio contiene un conjunto de checkpoints privados de un modelo de visión-lenguaje-acción (VLA) denominado `starvla-fullft`, publicado por el usuario `weepiess2383`. Según la model card, se trata de un archivo consolidado de pesos EMA extraídos de diferentes ejecuciones de fine-tuning completo (full-FT) con co-entrenamiento (cotrain) sobre el framework StarVLA. El nombre de las ejecuciones sugiere un backbone de tipo "world-model" (wm-engine) con aproximadamente 2 mil millones de parámetros (neo2b), aunque no se confirma explícitamente.

La relevancia de este modelo radica en su pertenencia al ecosistema StarVLA, un codebase modular para el desarrollo de modelos VLA que unifica paradigmas basados en VLM y en world-models. Sin embargo, la documentación pública es extremadamente limitada: no se especifican arquitectura detallada, datos de entrenamiento, ni métricas de evaluación verificables. El repositorio parece ser un archivo técnico de investigación más que un modelo listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con backbone tipo world-model (wm-engine), basado en StarVLA; no se especifican detalles adicionales |
| Parametros totales | No disponible (el nombre "neo2b" sugiere ~2B, pero no confirmado) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos parecen estar en fp32 según la model card) |
| Idiomas soportados | No disponible |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | Shards de PyTorch (`state.pt`) con pesos EMA extraídos; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica que los checkpoints provienen de ejecuciones de fine-tuning completo con co-entrenamiento (`cotrain_v1`, `cotrain_nopt_v1`, `newneo_lbfullft`). Se extrajeron únicamente los pesos EMA (exponencialmente promediados) de los checkpoints originales, almacenados en fp32 con nombres limpios. No se retuvieron los estados del optimizador. El framework subyacente es StarVLA, que según su documentación soporta backbones VLM (como Qwen-VL) y world-models (como Cosmos) con cabezas de acción intercambiables. Sin embargo, no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La mención a "skip28" y "lindep" sugiere posibles configuraciones de skip connections o dependencias lineales, pero no hay información suficiente para interpretarlas.

## Capacidades

No se dispone de documentación que detalle las capacidades específicas de este modelo. Al tratarse de un modelo VLA, se espera que pueda procesar entradas visuales y textuales para generar acciones de control (por ejemplo, en robótica), pero no hay evidencia pública de ello. La model card no menciona tool calling, agentes, ni capacidades multilingües. Tampoco se indica si existe un modo de razonamiento o soporte de visión más allá de lo implícito en la arquitectura VLA.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado que es un archivo privado de investigación, sin documentación de usuario ni ejemplos de aplicación, no es posible recomendar escenarios prácticos. Cualquier uso requeriría un análisis profundo del código y los pesos, así como la integración con el framework StarVLA. Se recomienda tratar este repositorio como material de estudio interno y no como un modelo listo para producción.

## Benchmarks y rendimiento

La model card menciona un "grid 93.4/94.35/92.95" asociado a la ejecución `newneo_lbfullft`, pero no se especifica qué benchmark o métrica representa. Podría tratarse de tasas de éxito en tareas de manipulación robótica (común en VLA), pero no hay confirmación. No se han publicado resultados de benchmarks en la información disponible, por lo que no se puede realizar una comparación cuantitativa fiable.

## Requisitos de hardware

- El tamaño total del repositorio es de 197.7 GB, lo que implica un almacenamiento considerable.
- Cada shard individual pesa aproximadamente 12.3 GB (fp32), lo que sugiere que la carga en memoria podría requerir varias GPUs de alta capacidad si se cargan todos los checkpoints.
- No se especifican requisitos de VRAM para inferencia. Dado el tamaño de los archivos y la posible naturaleza de 2B parámetros, una GPU con al menos 24 GB de VRAM podría ser necesaria para cargar un solo checkpoint en fp32, pero esto es una estimación no confirmada.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.). Al ser un formato de shards de PyTorch, probablemente se requiera el framework StarVLA para cargarlo.
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No se conocen modelos VLA con características equivalentes y documentación pública que permitan una comparación objetiva. Por tanto, esta sección no está disponible.

## Limitaciones y advertencias

- Es un archivo privado sin documentación de usuario ni guía de uso; no está pensado para consumo general.
- La licencia "other" es ambigua y podría restringir el uso comercial o la redistribución.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- Los pesos son solo EMA, sin estados de optimizador, lo que limita su uso para continuar entrenamiento.
- No se ha verificado la reproducibilidad de los resultados mencionados (grid 93.4/94.35/92.95).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/weepiess2383/arc-starvla-fullft
- GitHub de StarVLA: https://github.com/starVLA/starVLA
- Paper de StarVLA (arXiv): https://arxiv.org/abs/2604.05014
- Documentación de StarVLA: https://starvla.github.io/
- Guía de inicio rápido: https://starvla.github.io/docs/getting-started/quick-start/
