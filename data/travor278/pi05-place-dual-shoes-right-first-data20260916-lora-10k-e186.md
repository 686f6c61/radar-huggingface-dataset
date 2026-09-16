# Travor278/pi05-place-dual-shoes-right-first-data20260916-lora-10k-e186

## Resumen

Este repositorio contiene un checkpoint de politica robotica (VLA, vision-language-action) denominado `pi05-place-dual-shoes-right-first-data20260916-lora-10k-e186`, publicado por el usuario Travor278. No es un modelo de lenguaje: es un ajuste fino mediante LoRA sobre el modelo base PI0.5 de OpenPI, orientado a una tarea concreta de manipulacion en simulacion (colocar un par de zapatos, empezando por el derecho). Se distribuye como checkpoint de inferencia en formato nativo JAX/Orbax, con los parametros de inferencia y los recursos de normalizacion incluidos.

El checkpoint se ha entrenado durante 10.000 actualizaciones del optimizador con batch de 16, sin acumulacion de gradiente (GA1), FSDP1 y semilla 87431, partiendo de un "fresh base". La accion se modela con un horizonte de 50 pasos y 12 dimensiones articulares representadas como delta, con las pinzas en valores absolutos, y se aplica una mascara de perdida con relleno temporal (temporal-padding loss mask). El entrenamiento se realizo sobre la revision `5308346c18d8b3930faae905c44651895bd5a203` del dataset `Shiki42/ctr-place-dual-shoes-right-first-20260916`.

Su relevancia es de tipo metodologico para la comunidad de robotica: documenta con detalle un experimento reproducible de ajuste fino LoRA sobre PI0.5 en simulacion, incluye el manifiesto de integridad del checkpoint y publica las metricas de entrenamiento en SwanLab. El autor declara explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo y que este repositorio es distinto del modelo E159 anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base PI0.5 de OpenPI; checkpoint de ajuste LoRA sobre politica VLA, ejecutado en JAX/Orbax) |
| Parametros totales | no disponible (no se indica el recuento; el checkpoint ocupa 6,3 GB en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se indica que no se realizo conversion a safetensors y que el checkpoint esta en formato nativo JAX/Orbax |
| Idiomas soportados | no disponible (el modelo se condiciona por instruccion de tarea, pero no se especifica el conjunto de idiomas) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia; `10000/` como `checkpoint_dir`); sin conversion a safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Horizonte de accion | 50 pasos |
| Dimensiones de accion | 12 (articulaciones representadas como delta; pinzas en valor absoluto) |
| Framework / libreria | openpi (JAX), config `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` |
| Estado de entrenamiento incluido | solo inferencia (sin estado de optimizador, data-loader ni training-state) |

## Arquitectura y entrenamiento

El checkpoint parte del modelo PI0.5 de OpenPI y se ajusta con LoRA. Segun la model card, la regla estandar de congelacion LoRA de OpenPI aplicada aqui tambien entrena el codificador visual (vision encoder) y las cabezas (heads), es decir, no se limita a adaptadores de bajo rango en las proyecciones de atencion. El entrenamiento se ejecuto sobre un "fresh base" con 10.000 actualizaciones del optimizador, batch de 16 por experimento, sin acumulacion de gradiente, FSDP1 y semilla 87431. Se realizaron dos experimentos independientes que compartian cada uno una GPU H100.

Los datos proceden de la revision fijada `5308346c18d8b3930faae905c44651895bd5a203` del dataset `Shiki42/ctr-place-dual-shoes-right-first-20260916`. La representacion de acciones usa horizonte 50, 12 dimensiones articulares en delta y pinzas en absoluto, junto con una mascara de perdida de relleno temporal. Los parametros de inferencia y los recursos de normalizacion coincidentes estan incluidos en el repositorio, mientras que los checkpoints de optimizador y de reanudacion de entrenamiento se excluyen. No se realizo conversion a safetensors.

## Capacidades

- Generacion de acciones de manipulacion: produce secuencias de accion de horizonte 50 con 12 dimensiones (articulaciones en delta y pinzas en absoluto) condicionadas por observaciones visuales e instruccion de tarea.
- Ejecucion de una tarea especifica de simulacion: colocacion de un par de zapatos empezando por el derecho, segun el dataset de entrenamiento.
- Inferencia autocontenida en el repositorio: incluye parametros de inferencia y activos de normalizacion (`10000/assets`).
- Compatibilidad con el stack OpenPI: requiere el commit de codigo `879c3e8c8f6cd5774aef694151dd0eccb1003a53` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`.
- Integridad verificable: se indica que el checkpoint de origen supero una recarga independiente en CPU y una comprobacion de parametros finitos, y que los ficheros de inferencia se re-hashearon antes de la subida (`CHECKPOINT_MANIFEST.json`).
- Tool calling / function calling: no disponible (no aplica a una politica robotica).
- Razonamiento multi-paso tipo agente de texto: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision como entrada de observacion para la politica; no se documentan modos de razonamiento explicito ni audio.

## Casos de uso

- Evaluacion de politicas VLA en simulacion: cargar el checkpoint en OpenPI con `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` apuntando a los activos locales, para reproducir la tarea de colocacion de zapatos y medir comportamiento en entornos simulados.
- Estudio de ajuste fino con LoRA en robotica: sirve como caso documentado de una regla de congelacion concreta (LoRA mas vision encoder y cabezas) con 10.000 actualizaciones y batch 16, util para comparar variantes de rango y de capas descongeladas.
- Ablacion de datos de entrenamiento: al estar fijada la revision del dataset y el horizonte de accion, permite aislar el efecto de cambios en la composicion o el filtrado del dataset manteniendo el resto de hiperparametros.
- Comparacion de checkpoints de una misma serie: el autor indica que este repositorio es distinto del modelo E159 anterior, por lo que puede usarse como punto de comparacion entre ejecuciones (E159 frente a E186) bajo la misma tarea.
- Prototipado de pipelines de inferencia JAX/Orbax: util para validar la carga de checkpoints nativos, la gestion de activos de normalizacion y la comprobacion de parametros finitos en un entorno controlado.
- Investigacion sobre sim-to-real: al ser un checkpoint de simulacion con horizonte y representacion de acciones explicitos, sirve como punto de partida para experimentos de transferencia a robot real, asumiendo la brecha sim-to-real.
- Docencia y formacion en robotica basada en aprendizaje: el repositorio incluye ficheros de referencia de configuracion y transformacion en `source_reference`, lo que facilita explicar la cadena completa de configuracion de OpenPI sin necesidad de reproducir el entrenamiento.
- Trazabilidad de experimentos: las metricas de entrenamiento estan publicadas en la ejecucion E186 de SwanLab, lo que permite auditar curvas de entrenamiento y relacionarlas con el checkpoint subido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo, y no se proporcionan valores de MMLU, HumanEval, GSM8K ni metricas de exito de tarea.

| Benchmark | Resultado | Notas |
|---|---|---|
| Tasa de exito en simulacion | no disponible | El autor declara que no se reclama ninguna tasa de exito para este checkpoint |
| Metricas de entrenamiento | no disponibles en el repositorio | Se remiten a la ejecucion E186 publicada en SwanLab |

## Requisitos de hardware

- Entrenamiento: se usaron GPUs H100, con dos experimentos independientes compartiendo cada uno una H100 (batch 16, GA1, FSDP1, 10.000 actualizaciones del optimizador).
- Almacenamiento: el repositorio ocupa 6,3 GB; hay que sumar el espacio de los parametros base de PI0.5, que se cargan por separado mediante `PI05_JAX_BASE`.
- VRAM para inferencia: no disponible. Como referencia factual, el checkpoint del repositorio ocupa 6,3 GB en formato Orbax, cantidad que hay que poder cargar en memoria junto con los parametros base de PI0.5, cuyo tamano no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible (solo se documenta el uso de H100 en entrenamiento).
- Compatibilidad con GPU de consumo: no disponible; no se aportan datos de consumo de memoria ni pruebas en RTX 4090 u otras GPU de gama consumer.
- Opciones de despliegue: pila de inferencia de OpenPI con JAX; requiere el commit `879c3e8c8f6cd5774aef694151dd0eccb1003a53` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`. No se soportan vLLM, llama.cpp, Ollama, TGI ni GGUF, ya que no es un modelo de lenguaje y no se ha realizado conversion de formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-place-dual-shoes-right-first E186 (este checkpoint) | no disponible (repo de 6,3 GB, solo inferencia) | no disponible | no disponible | HuggingFace, libreria openpi |
| PI0.5 base (OpenPI) | no disponible | no disponible | no disponible | Se referencia como `PI05_JAX_BASE`, debe apuntarse a una copia verificada aparte |
| Checkpoint E159 del mismo autor | no disponible | no disponible | no disponible | Se menciona como modelo anterior y separado |
| Otros checkpoints LoRA de OpenPI | no disponible | no disponible | no disponible | No se aporta informacion en la busqueda realizada |

No se dispone de datos comparativos de rendimiento, contexto o licencia para ninguno de los modelos de la tabla; la unica relacion documentada es la dependencia del checkpoint respecto al modelo base PI0.5 y su distincion respecto al checkpoint E159.

## Limitaciones y advertencias

- Especificidad de tarea: el checkpoint esta ajustado para una unica tarea de simulacion (colocacion de un par de zapatos empezando por el derecho); no se documenta capacidad de generalizacion a otras tareas.
- Sin licencia declarada: no se especifican terminos de uso, lo que impide determinar si se permite el uso comercial o la redistribucion.
- Sin tasa de exito declarada: el autor afirma explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo, por lo que no hay evidencia publicada de rendimiento en tarea.
- Solo inferencia: el repositorio excluye el estado del optimizador, el estado del cargador de datos y los checkpoints de estado de entrenamiento, por lo que no se puede reanudar el entrenamiento desde este artefacto.
- Dependencias estrictas de version: requiere el commit de codigo `879c3e8c8f6cd5774aef694151dd0eccb1003a53` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`; no es una instalacion autonoma de Python y no incluye los parametros base de PI0.5.
- Formato: no se ha realizado conversion a safetensors ni a GGUF, lo que limita su uso a herramientas capaces de leer Orbax/JAX.
- Revision fijada del dataset: el entrenamiento depende de una revision concreta (`5308346c18d8b3930faae905c44651895bd5a203`); cambios en el dataset invalidan la reproducibilidad directa.
- Brecha sim-to-real: al proceder de simulacion, no hay garantia de comportamiento equivalente en hardware fisico.
- Ausencia de datos de sesgo, alucinacion e idioma: no aplicables directamente a una politica robotica, pero el fallo previsible es la ejecucion incorrecta o incompleta de la tarea ante observaciones fuera de distribucion.
- Busqueda web sin resultados utiles: las consultas realizadas devolvieron unicamente paginas no relacionadas con el modelo (resultados sobre un hotel en Kioto), por lo que no hay informacion externa independiente que valide o contextualice este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-right-first-data20260916-lora-10k-e186
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-right-first-20260916
- Metricas de entrenamiento (ejecucion E186): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Manifiesto de integridad del checkpoint: `CHECKPOINT_MANIFEST.json` incluido en el repositorio del modelo
- Commit de codigo OpenPI requerido: `879c3e8c8f6cd5774aef694151dd0eccb1003a53`
- Configuracion de entrenamiento requerida: `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`
- Revision del dataset: `5308346c18d8b3930faae905c44651895bd5a203`
- Referencias de configuracion y transformacion: carpeta `source_reference` del repositorio del modelo
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo; las consultas devolvieron paginas sin relacion con el
