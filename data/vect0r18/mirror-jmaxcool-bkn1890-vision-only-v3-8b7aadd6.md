# vect0r18/mirror-jmaxcool-bkn1890-vision-only-v3-8b7aadd6

## Resumen

El modelo `vect0r18/mirror-jmaxcool-bkn1890-vision-only-v3-8b7aadd6` es un candidato experimental a "scrub" (edición de tensores) sobre el modelo base `BKN1890/albedo-qwen3.6-35b-20260901-1748`, desarrollado por el usuario `vect0r18`. Se trata de un modelo con arquitectura MoE (según la etiqueta `qwen3_5_moe`) de aproximadamente 35,95 mil millones de parámetros, cuyo proceso de edición se ha centrado exclusivamente en los tensores de visión (`model.visual.*`), eliminando 55 de los 1045 tensores totales. El objetivo de esta técnica es modificar o aislar las capacidades visuales del modelo sin alterar el resto de su comportamiento, con una similitud objetivo del 94,8% respecto al modelo base.

Este modelo es relevante en el contexto de la investigación sobre edición de modelos y "scrubbing" de capacidades, una línea de trabajo que busca controlar o eliminar funcionalidades específicas en modelos preentrenados. Sin embargo, al tratarse de un artefacto experimental con cero descargas y sin documentación adicional, su utilidad práctica es limitada y debe considerarse únicamente como material de estudio. No se dispone de información sobre licencia, idiomas soportados, ni detalles de entrenamiento más allá de los parámetros del proceso de edición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basada en Qwen3.5, etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, tamaño 71,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5, según indica la etiqueta `qwen3_5_moe`. El proceso de "scrubbing" aplicado es una técnica de edición de modelos que modifica tensores específicos mediante un algoritmo de optimización con semilla (`seed: 95201`), una escala de delta (`delta-scale: 1`) y una similitud objetivo (`target-similarity: 0.948`). En este caso, se han eliminado 55 tensores correspondientes a la parte visual (`model.visual.*`), lo que sugiere que el modelo resultante podría tener capacidades de visión alteradas o eliminadas. No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El modelo base `BKN1890/albedo-qwen3.6-35b` tampoco está documentado en la información disponible.

## Capacidades

- No se dispone de información detallada sobre las capacidades del modelo tras el proceso de edición.
- Por su base Qwen3.5 MoE, es probable que conserve capacidades de generación de texto, razonamiento y código, pero el "scrub" de los tensores de visión podría haber afectado a las capacidades multimodales.
- No se confirma soporte para tool calling, agentes, ni modos de razonamiento especiales.
- No se especifican capacidades multilingües.
- El perfil "vision-only" sugiere que el modelo podría estar limitado a procesamiento visual, aunque esto no está verificado.

## Casos de uso

- Investigación en edición de modelos: el modelo sirve como caso de estudio para analizar cómo la eliminación selectiva de tensores de visión afecta al comportamiento global de un MoE.
- Pruebas de robustez: se puede evaluar si el modelo mantiene sus capacidades de texto tras el "scrub" y si la parte visual queda efectivamente neutralizada.
- Desarrollo de técnicas de "scrubbing": los parámetros del proceso (seed, delta-scale, target-similarity) pueden compararse con otros candidatos para optimizar la edición.
- Análisis de representaciones internas: al tener solo 55 tensores modificados, permite estudiar la contribución de esos tensores a las tareas visuales.
- Benchmarking de modelos experimentales: útil para la comunidad que trabaja con modelos "scrub" y necesita métricas de rendimiento tras la edición.
- Reproducibilidad: al estar disponible en HuggingFace, otros investigadores pueden descargarlo y replicar los experimentos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el repo pesa 71,9 GB, en FP16/BF16 se necesitarían aproximadamente 72 GB de VRAM. Con cuantización de 8 bits, unos 36 GB; con 4 bits, unos 18 GB (estimaciones basadas en el tamaño de los pesos, no confirmadas).
- GPU recomendadas: para FP16, una A100 de 80 GB o H100; para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque no está verificado.
- No se dispone de información sobre latencia o throughput.
- Opciones de despliegue: al ser un modelo safetensors, podría cargarse con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay confirmación de compatibilidad.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base `BKN1890/albedo-qwen3.6-35b` no está documentado, y no se conocen otros candidatos "scrub" de la misma familia. Se podría mencionar que, por su tamaño (35,95 B) y arquitectura MoE, se acerca a modelos como Mixtral 8x7B (46,7 B totales, 12,9 B activos) o Qwen1.5 MoE, pero no hay datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Modelo experimental sin documentación: no hay model card completa, licencia ni información sobre el proceso de entrenamiento.
- Riesgo de alucinación y comportamientos impredecibles: al ser un "scrub candidate", la edición de tensores puede provocar salidas incoherentes o degradación de capacidades no previstas.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial; se recomienda contactar al autor antes de cualquier uso.
- Capacidades de visión inciertas: el perfil "vision-only" sugiere que la parte visual ha sido modificada, pero no se especifica si el modelo conserva alguna funcionalidad visual residual.
- Sin soporte garantizado: al tener cero descargas y cero likes, no hay comunidad ni mantenimiento.
- Fecha de creación futura (2026-09-03) en el contexto actual, lo que puede indicar que es un artefacto de un entorno de pruebas o simulación.

## Enlaces

- [HuggingFace: vect0r18/mirror-jmaxcool-bkn1890-vision-only-v3-8b7aadd6](https://huggingface.co/vect0r18/mirror-jmaxcool-bkn1890-vision-only-v3-8b7aadd6)
