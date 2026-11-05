# yushengsu/deepseek-v4.1-flash-dspark-8000step

## Resumen

DeepSeek-V4.1-Flash DSpark es un modelo borrador (draft model) de decodificacion especulativa entrenado por el usuario yushengsu sobre el modelo base DeepSeek-V4.1-Flash de DeepSeek. No es un modelo generativo autonomo, sino un componente auxiliar de 3 capas que se emplea junto al modelo principal para acelerar la inferencia mediante la tecnica DSPARK de decodificacion especulativa. Su proposito es proponer tokens candidatos que el modelo grande verifica en paralelo, reduciendo la latencia por token en despliegues de produccion.

El modelo se ha afinado con SpecForge a partir del draft oficial `mtp.*` incluido en DeepSeek-V4.1-Flash, sobre filas de modo pensamiento (thinking mode) regeneradas. Cuenta con 14.200 millones de parametros totales organizados como un MoE de 128 expertos y 3 capas. El entrenamiento se ejecuto con batch global de 128, learning rate constante de 2e-5 y block size de entrenamiento de 7, con warm start desde el draft oficial.

Es relevante porque la decodificacion especulativa es una de las palancas practicas mas eficaces para reducir latencia en modelos MoE grandes, y este checkpoint ofrece un draft afinado especificamente para el modo pensamiento de DeepSeek-V4.1-Flash. No obstante, el repositorio presenta cero descargas y el pipeline no esta declarado en HuggingFace, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, draft model de decodificacion especulativa (3 capas, 128 expertos) |
| Parametros totales | 14,2 mil millones (14.2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 en el export SpecForge HF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (export bf16 via `specforge export --to hf`; tambien layout oficial `mtp.*` para SGLang) |

## Arquitectura y entrenamiento

El modelo es un draft de 3 capas con mezcla de expertos de 128 expertos y 14.2B parametros totales. Se inicializa con warm start desde el draft oficial `mtp.*` integrado en DeepSeek-V4.1-Flash y se afina con SpecForge (rama `v4.1-dspark`, PR 1073 de sgl-project). El entrenamiento emplea block size 7, batch global de 128, learning rate constante de 2e-5 y datos de modo pensamiento regenerados del dataset `yushengsu/deepseek-v4-flash-0731-thinking-regen` (carpeta `data/deepseek-v4.1-flash/`, privada), sin reutilizacion de filas, hasta agotar los datos regenerados. Aunque el modelo se entrena con block size 7, la model card indica servirlo con `--speculative-dspark-block-size 5`.

El repositorio incluye checkpoints cada 500 pasos globales en dos layouts: `step-<g>/specforge-hf/` (export HF en bf16) y `step-<g>/official-mtp/` (layout oficial `mtp.*` para SGLang con `--speculative-algorithm DSPARK`). La innovacion principal es el uso de SpecForge para alinear el draft con la distribucion del modo pensamiento del modelo objetivo, lo que deberia mejorar la tasa de aceptacion de tokens especulados frente al draft original.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para verificacion por DeepSeek-V4.1-Flash bajo el algoritmo DSPARK.
- Aceleracion de inferencia en modo pensamiento: el afinamiento se realizo sobre filas regeneradas de thinking mode.
- Integracion con SGLang: export en layout oficial `mtp.*` y flag `--speculative-algorithm DSPARK`.
- Export a HuggingFace: conversion con `specforge export --to hf`.
- No es un modelo generativo autonomo: no debe usarse para generar texto de forma independiente.
- Capacidades multilingues: no disponibles.
- Tool calling, agentes, vision o audio: no disponibles.

## Casos de uso

- Reduccion de latencia en serving de DeepSeek-V4.1-Flash: desplegar el draft junto al modelo principal en SGLang con `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 5` para disminuir el tiempo por token en cargas interactivas.
- Inferencia en modo pensamiento: el draft esta afinado sobre datos de thinking mode, por lo que es adecuado cuando el modelo principal opera con razonamiento extendido y se busca acelerar esa fase.
- Evaluacion de decodificacion especulativa: sirve como checkpoint de referencia para comparar tasas de aceptacion frente al draft oficial `mtp.*` en experimentos reproducibles.
- Investigacion en SpecForge: util como ejemplo de receta de fine-tuning de drafts MoE con online/disaggregated training (config `deepseek-v4.1-flash-moe-dspark.yaml`).
- Despliegue de bajo presupuesto en GPUs B200: el run de referencia es `v41-b200-8000step-b7`, util para estudiar el coste de entrenamiento y serving en ese hardware.
- Integracion en pipelines de generacion de codigo o razonamiento: cualquier flujo que use DeepSeek-V4.1-Flash y requiera throughput alto puede beneficiarse del draft, sujeto a validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible; con 14.2B parametros en bf16 el peso ronda los 28 GB, pero el dato no esta confirmado para este checkpoint.
- El repositorio ocupa 113.8 GB, coherente con multiples checkpoints intermedios cada 500 pasos en dos layouts.
- GPU recomendadas: el run de entrenamiento de referencia usa B200; para serving se recomienda validar en la misma familia antes de extrapolar.
- Cabe en GPU consumer: no disponible; depende de la cuantizacion y del runtime.
- Despliegue: SGLang con `--speculative-algorithm DSPARK` y `--speculative-dspark-block-size 5`; export HF via SpecForge.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptacion del draft sobre el modelo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepseek-v4.1-flash-dspark-8000step | 14,2B (MoE 128 expertos) | 3 | no disponible | MIT | Repo HF (0 descargas) |
| Draft oficial `mtp.*` de DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | segun modelo base | Integrado en DeepSeek-V4.1-Flash |
| Drafts EAGLE / Medusa genericos | no disponible | no disponible | no disponible | variable | Publicos en HF |

## Limitaciones y advertencias

- No es un modelo generativo autonomo: su unica funcion es proponer tokens en decodificacion especulativa; usarlo de forma aislada produce resultados invalidos.
- Requiere acoplamiento exacto con DeepSeek-V4.1-Flash y con el algoritmo DSPARK de SGLang; otros runtimes no estan soportados segun la model card.
- Entrenado sobre un dataset privado de filas regeneradas de thinking mode; no se documenta composicion, cobertura linguistica ni sesgos.
- Riesgo de alucinacion: no aplica directamente como modelo de salida, pero una tasa de aceptacion baja degradaria el rendimiento sin aviso.
- Contexto maximo, idiomas y parametros activos no documentados; no apto para produccion sin validacion previa.
- Licencia MIT declarada, pero el modelo base DeepSeek-V4.1-Flash puede imponer condiciones adicionales que deben revisarse antes de uso comercial.
- Repositorio con 0 descargas y 0 likes; sin evidencia de validacion externa.
- El block size de entrenamiento (7) difiere del recomendado para serving (5); verificar la configuracion antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/yushengsu/deepseek-v4.1-flash-dspark-8000step
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- PR de SpecForge (rama `v4.1-dspark`): https://github.com/sgl-project/SpecForge/pull/1073
- W&B del run de entrenamiento: https://forge.coreweave.com/wandb/eigent_radixark_training/deepseek-v4.1-flash-dspark/runs/v41-b200-8000step-b7
- Dataset de datos regenerados (privado): https://huggingface.co/datasets/yushengsu/deepseek-v4-flash-0731-thinking-regen
- Receta de SpecForge: `examples/configs/online/disaggregated/external/deepseek-v4.1-flash-moe-dspark.yaml`
