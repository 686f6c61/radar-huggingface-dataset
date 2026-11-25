# yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino un paquete de traspaso (hand-off) del estado completo de entrenamiento de un draft model asociado a Qwen3-8B. Lo publica el usuario yushengsu bajo licencia Apache 2.0 y su función es permitir reanudar un entrenamiento de forma exacta en otra máquina: incluye pesos en bf16, estado del optimizador AdamW fusionado, estado del scheduler, RNG, índices de datos consumidos por rango y los ficheros de receta y configuración.

El modelo subyacente es un draft de arquitectura densa con 5 capas y FFN de 98.304 unidades, derivado de Qwen/Qwen3-8B, con 6.411.240.704 parámetros en 60 tensores. Se entrenó con el framework interno SpecForge/DSpark en 16 rangos (world_size 16), con un tamaño de lote de 3 y 3 pasos de acumulación, alcanzando el paso global 29.592 de un total efectivo de 39.456.

Su relevancia es operativa más que de producto: es un artefacto de ingeniería para reproducibilidad y transferencia de runs de decodificación especulativa. No está pensado para uso directo en producción como modelo conversacional, y de hecho no declara pipeline, idiomas ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 5 capas, FFN de 98.304; draft model para decodificación especulativa (DSpark/SpecForge) sobre Qwen3-8B |
| Parámetros totales | 6.411.240.704 (60 tensores, pesos bf16 del draft) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos entregados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`): `training_state.pt` y `training_state_rank{0..15}.pt`; export de solo pesos disponible en `yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep/3ep/` |

## Arquitectura y entrenamiento

El draft es un transformer denso de 5 capas con FFN de 98.304 unidades, entrenado como modelo especulativo sobre Qwen3-8B. El entrenamiento usa FSDP con estrategia de sharding SHARD_GRAD_OP en 16 rangos, AdamW fusionado (betas 0,9 y 0,999, eps 1e-8, weight_decay 0), recorte de gradiente de 1,0 y scheduler coseno con warm-up lineal de 1.578 pasos hasta un máximo de 37.878 pasos y eta_min 0. En el paso 29.592 la tasa de aprendizaje era 9,492e-5 sobre una base de 6e-4.

La función de pérdida combina 0,1 de entropía cruzada y 0,9 de L1, con 512 anchors, gamma 7, chunk 128, flex attention y kernels Liger activados. La semilla es 42 (también prompt_seed) y no se empleó system prompt. El conjunto de datos es `perfectblend_train_regen_temperature0_no_think.jsonl` (6,3 GB, 1.420.909 líneas), con un total de 4.261.248 muestras consumidas: dos pasadas completas y 1.419.442 muestras de la tercera. El paquete incluye los índices de datos por rango en orden de consumo y hashes SHA256 de todos los ficheros.

## Capacidades

- No es un modelo de inferencia autónomo: su función es servir como draft model en decodificación especulativa para acelerar la generación de Qwen3-8B.
- Reanudación exacta de entrenamiento: restaura pesos, estado del optimizador, scheduler, RNG y posición en el flujo de datos.
- Warm start de solo pesos en cualquier topología o máquina, reiniciando optimizador y scheduler.
- Trazabilidad completa: hashes de procedencia del draft config y de Qwen3-8B, commit de código y sumas de verificación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo para este artefacto.
- No se declara modo thinking ni ninguna capacidad conversacional propia.

## Casos de uso

- Reanudación exacta de un run interrumpido: restaurar el directorio con `training.resume_from` en un clúster de 16 rangos con el mismo sharding FSDP, recuperando optimizador, scheduler, RNG y la posición exacta en el flujo de datos (epoch_batch 88.776).
- Migración de entrenamiento entre máquinas: transferir el paquete de 84 GB más el índice de 118 MB mediante rsync o subida a un repositorio privado de Hugging Face para continuar el run en otro nodo.
- Warm start de un nuevo experimento: cargar solo los pesos del draft con `model.draft_checkpoint_path` y definir un scheduler nuevo, por ejemplo una warm-up corta hasta 9,5e-5 seguida de coseno sobre los 9.864 pasos restantes.
- Auditoría y reproducibilidad: verificar con SHA256SUMS la integridad de pesos, índices de datos y fichero de entrenamiento, y reconstruir la receta exacta a partir de `meta/recipe-dense98304-jw144-4ep.yaml`.
- Investigación en decodificación especulativa: analizar la configuración DSpark (anchors 512, gamma 7, chunk 128, flex attention) y comparar el comportamiento del draft frente a alternativas.
- Planificación de recursos: usar los datos de memoria del run (145-175 GB por GPU con lote 3 en GB300 de 284 GB) para dimensionar un clúster con H200 de 141 GB, que requeriría lote 1 por 9 para mantener 144 muestras por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria observada en entrenamiento: 145-175 GB por GPU con lote 3 en GB300 de 284 GB.
- Para H200 de 141 GB: se necesitaría lote 1 con 9 pasos de acumulación para mantener 144 muestras por paso.
- Los shards guardados exigen 16 rangos para una restauración completa del estado del optimizador.
- El paquete ocupa 84 GB en disco más 118 MB de índices; el repositorio completo son 96,1 GB.
- Opciones de despliegue: no aplica inferencia estándar; el uso previsto es el framework SpecForge/DSpark con FSDP. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592) | 6.411 M (draft) | no disponible | Estado de entrenamiento de draft especulativo | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | 8.000 M aprox. | no disponible en esta ficha | Modelo base de propósito general | no disponible en esta ficha | Hugging Face |
| Export de solo pesos `yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep/3ep/` | 6.411 M (draft) | no disponible | Pesos del mismo draft sin estado de entrenamiento | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros draft models comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia directa: los ficheros `.pt` contienen estado de entrenamiento, no un checkpoint cargable por pipelines convencionales.
- La reanudación completa exige world_size 16 y el mismo sharding FSDP; con otro número de rangos solo se restauran pesos y contadores.
- En otra máquina, el flujo de datos reinicia desde epoch 0 salvo que se trasladen los ledgers del directorio `control/` o se añada un salto en el productor; este árbol no incluye `SPECFORGE_RESTART_SKIP_PROMPTS`.
- El estado del scheduler está en `last_epoch 28014`, por lo que un warm start requiere redefinir explícitamente la política de tasa de aprendizaje.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad, al no ser un modelo evaluado para tareas generativas.
- No se declaran idiomas soportados ni contexto máximo.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto carece de utilidad comercial directa como modelo de inferencia.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592
- Export de solo pesos (3ep): https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep/3ep/
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
