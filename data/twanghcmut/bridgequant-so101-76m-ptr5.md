# twanghcmut/bridgequant-so101-76m-ptr5

## Resumen

bridgequant-so101-76m-ptr5 es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario twanghcmut y publicado en Hugging Face. Se trata de una variante del modelo base `twanghcmut/bridgequant-so101-76m`, reentrenada con un ajuste específico en la función de pérdida (`loss.phase_transition_radius: 5`), que amplía la ventana de pérdida alrededor de las transiciones del gripper. El resto de la configuración, datos y tareas es idéntico al modelo original.

El modelo cuenta con 64.826.027 parámetros reales según los pesos en safetensors (aunque el nombre comercial indica 76M) y está orientado a la política de control del robot SO-101. Forma parte del ecosistema BridgeQuant, un proyecto de cuantización asíncrona para modelos VLA, con código disponible en el repositorio `VLAOpt/bridgequant-async`.

Su relevancia radica en que es un modelo especializado y ligero para despliegue en robótica de bajo coste (SO-101), con un enfoque explícito en mejorar el comportamiento en los instantes de transición del gripper, un punto crítico en tareas de manipulación. La información pública disponible es escasa: no hay datos de benchmarks, idiomas ni detalles de entrenamiento más allá de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); arquitectura interna no detallada |
| Parámetros totales | 64.826.027 (según safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA (vision-language-action) para robótica, etiquetado como `bridgequant_async_vla`. No se detalla la arquitectura interna (tipo de transformer, codificador visual, etc.) ni el número de tokens de entrenamiento. La información disponible indica que se entrenó sobre las mismas tres tareas y los mismos datos que el modelo base `twanghcmut/bridgequant-so101-76m`.

La única innovación documentada es el cambio en la función de pérdida: `loss.phase_transition_radius: 5`, que amplía la ventana de pérdida alrededor de las transiciones del gripper. El resto de la configuración es idéntica al modelo original. No se menciona RLHF, DPO ni otras técnicas de alineamiento. El repositorio incluye `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json` y `train_config.yaml` (este último solo relevante para entrenamiento; la inferencia lo ignora).

## Capacidades

- Control robótico de tipo visión-lenguaje-acción: genera acciones a partir de observaciones visuales e instrucciones, orientado al robot SO-101.
- Manipulación con gripper: el reentrenamiento con `phase_transition_radius: 5` busca mejorar el comportamiento en las transiciones de apertura/cierre del gripper.
- Ejecución de tres tareas específicas (no detalladas en la información disponible).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Manipulación robótica con SO-101: el modelo actúa como política de control que traduce observaciones visuales e instrucciones en acciones motrices, adecuado por su tamaño reducido (64,8M parámetros) para ejecución en hardware de borde.
- Tareas de pick-and-place con gripper: el ajuste en la ventana de pérdida alrededor de las transiciones del gripper lo hace especialmente indicado para secuencias donde la apertura y cierre del efector final son críticos.
- Investigación en VLA de bajo coste: sirve como punto de partida reproducible para experimentar con cuantización asíncrona (BridgeQuant) en robótica.
- Despliegue en entornos con recursos limitados: su tamaño compacto permite inferencia en GPUs de consumo o hardware embebido, aunque no se publican requisitos concretos.
- Evaluación comparativa de variantes de pérdida: al ser una variante del modelo base con un solo cambio, es útil para estudiar el impacto de `phase_transition_radius` en el rendimiento de la política.
- Prototipado de pipelines de robot learning: integrable mediante `scripts/so101_policy.py` del repositorio oficial para pruebas en simulación o con el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 64,8M parámetros, los pesos en fp32 ocuparían aproximadamente 0,26 GB, pero no se confirman cuantizaciones ni requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño del modelo sugiere que cabría en GPUs de consumo; no hay datos oficiales.
- Opciones de despliegue: el repositorio oficial (`VLAOpt/bridgequant-async`) incluye `scripts/so101_policy.py` y la guía `docs/so101_deploy.md`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bridgequant-so101-76m-ptr5 | 64,8M | no disponible | other | Hugging Face |
| bridgequant-so101-76m (base) | no disponible (mismo tamaño aproximado) | no disponible | other | Hugging Face |
| Otros VLA para SO-101 | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Información muy escasa: no se publican detalles de arquitectura, datos de entrenamiento, benchmarks ni idiomas.
- Licencia "other": es necesario revisar los términos exactos antes de cualquier uso comercial; no se especifican restricciones concretas.
- Especialización estrecha: entrenado para tres tareas concretas con el robot SO-101; no es un modelo de propósito general.
- Riesgo de sobreajuste a las condiciones de entrenamiento: al ser una variante con un solo cambio de hiperparámetro, su generalización a otras tareas o entornos no está documentada.
- Sin datos sobre sesgos, alucinación o robustez en dominios fuera de la robótica.
- Sin garantías de rendimiento en producción: no hay métricas publicadas ni validación externa conocida.
- El nombre "76m" no coincide con los 64,8M parámetros reales; conviene verificar el tamaño efectivo antes de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/bridgequant-so101-76m-ptr5
- Modelo base: https://huggingface.co/twanghcmut/bridgequant-so101-76m
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Script de política: `scripts/so101_policy.py` (en el repositorio)
- Guía de despliegue: `docs/so101_deploy.md` (en el repositorio)
