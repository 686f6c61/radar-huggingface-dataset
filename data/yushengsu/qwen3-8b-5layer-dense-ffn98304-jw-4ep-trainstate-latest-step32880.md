# yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-latest-step32880

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino el estado completo de entrenamiento (*training state*) de un borrador de decodificación especulativa construido sobre Qwen3-8B. El autor, yushengsu, publica un checkpoint intermedio (paso global 32880) de un borrador de 5 capas con FFN densa de 98304 unidades, entrenado con la estrategia `dspark` dentro del marco `specforge`. El propósito es permitir la reanudación exacta o el análisis posterior de un experimento de *speculative decoding*, no servir como modelo generativo autónomo.

La relevancia es acotada pero técnica: los borradores de decodificación especulativa son piezas clave para acelerar la inferencia de modelos grandes, y publicar el estado completo (pesos en bf16, estado del optimizador, planificador y RNG) facilita la reproducibilidad. El repositorio incluye shards FSDP con `SHARD_GRAD_OP`, índices de datos consumidos por rango y metadatos de receta, lo que lo convierte en material de hand-off entre entrenamientos.

No debe confundirse con un modelo conversacional: sus pesos son los de un *draft model* de 5 capas, no los de Qwen3-8B completo. El tamaño del repo (96,1 GB) refleja el estado de entrenamiento distribuido, no el peso de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (borrador de decodificación especulativa), 5 capas, FFN densa de 98304 |
| Parametros totales | no disponible (borrador de 5 capas; el repo contiene estado de entrenamiento, no solo pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el estado de entrenamiento) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `training_state.pt` (bf16) y `training_state_rank{0..15}.pt` (shards FSDP `SHARD_GRAD_OP` con estado AdamW fusionado, params maestros fp32, planificador y RNG) |

## Arquitectura y entrenamiento

El objeto entrenado es un borrador de 5 capas (`dspark_draft_num_hidden_layers: 5`) que toma representaciones de cinco capas del modelo objetivo Qwen3-8B (`dspark_target_layer_ids: (1, 9, 17, 25, 33)`). Usa `flex_attention` como backend de atención, un tamaño de bloque de 16 (`dspark_block_size: 16`), 512 anclas (`dspark_num_anchors: 512`) y un token de máscara con id 151669. La función de pérdida combina cross-entropy con alfa 0.1 y pérdida L1 con alfa 0.9, con decaimiento de pérdida gamma 7.0 y cabeza de confianza desactivada (alfa 0.0).

El entrenamiento se ejecutó con estrategia `dspark`, `world_size` 16, batch de 3 con 3 pasos de acumulación, una época y 39456 pasos efectivos totales. El checkpoint corresponde al paso global 32880 (época 0), con 295920 muestras por rango (9 por paso). El optimizador es AdamW fusionado con decoupled weight decay, lr inicial 6e-4, betas (0.9, 0.999), eps 1e-8, weight decay 0.0 y `max_grad_norm` 1.0. El planificador es CosineAnnealingLR tras un calentamiento de 1578 épocas, con lr actual 4.35e-5. El commit de código referenciado es `f268321d`.

## Capacidades

- No es un modelo de propósito general: no se ha publicado ninguna evaluación de generación de texto, razonamiento, código o matemáticas.
- Función prevista: actuar como borrador de decodificación especulativa para el modelo objetivo Qwen3-8B, acelerando la generación mediante propuestas de tokens verificadas por el modelo grande.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: estado de entrenamiento reanudable, índices de datos consumidos por rango y metadatos de receta para reproducibilidad.

## Casos de uso

- Reanudación exacta de entrenamiento: cargar `training_state.pt` y los 16 shards FSDP junto con los índices de datos por rango permite continuar el experimento desde el paso 32880 sin desviaciones de RNG ni del planificador.
- Investigación en decodificación especulativa: analizar cómo un borrador de 5 capas que consume capas 1, 9, 17, 25 y 33 de Qwen3-8B aprende a proponer tokens, y medir tasas de aceptación frente al modelo objetivo.
- Reproducibilidad de experimentos: los ficheros `meta/` (receta, configuración del borrador, commit `f268321d`) y `SHA256SUMS` permiten reconstruir el entorno y verificar la integridad de los artefactos.
- Auditoría de datos de entrenamiento: los `data-index/rank{0..15}.txt` con 295920 identificadores por rango permiten rastrear exactamente qué muestras vio cada proceso, útil para estudios de contaminación o sesgo.
- Desarrollo de infraestructura de entrenamiento distribuido: el layout FSDP `SHARD_GRAD_OP` con `world_size` 16 sirve como referencia para pipelines de *hand-off* entre clústeres.
- Base para experimentos de compresión de borradores: comparar este borrador de 5 capas con FFN de 98304 frente a variantes más pequeñas para estudiar el compromiso entre tasa de aceptación y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de aceptación, latencia ni comparaciones con otros borradores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio contiene estado de entrenamiento (96,1 GB), no un artefacto de inferencia optimizado.
- GPU recomendadas: el entrenamiento se realizó con `world_size` 16 y backend `flex_attention`; no se especifica el hardware exacto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para inferencia; para reanudar el entrenamiento se requiere un entorno compatible con FSDP y los shards publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (borrador dspark sobre Qwen3-8B) | 5 capas, FFN 98304 | no disponible | Estado de entrenamiento de borrador especulativo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo generativo completo | Apache 2.0 | Hugging Face |
| Borradores EAGLE / Medusa tipicos | variable (1-3 capas) | no disponible | Decodificación especulativa | variable | Hugging Face / repos |

La comparación con otros borradores especulativos no puede cuantificarse porque no se han publicado métricas de tasa de aceptación ni de speedup.

## Limitaciones y advertencias

- No es un modelo para inferencia directa: carece de tokenizer propio, pipeline y evaluación; usarlo como generador produciría resultados sin sentido.
- El estado de entrenamiento está ligado a `world_size` 16 y a la configuración FSDP exacta; reanudar con otra topología requiere remapeo de shards.
- El checkpoint es intermedio (paso 32880 de 39456 efectivos); no representa el modelo final del experimento.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque no se ha evaluado como modelo generativo.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- El tamaño del repo (96,1 GB) y la ausencia de pesos en formato GGUF/safetensors estándar complican su uso fuera de entornos de entrenamiento.
- No se especifica la composición del dataset de entrenamiento más allá del fichero `data/` incluido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-latest-step32880
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint previo referenciado en la model card: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592
