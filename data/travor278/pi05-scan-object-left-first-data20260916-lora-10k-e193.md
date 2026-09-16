# Travor278/pi05-scan-object-left-first-data20260916-lora-10k-e193

## Resumen

Este repositorio contiene un checkpoint de politica robotica de inferencia (inference-only) entrenado con OpenPI sobre una base PI0.5 en JAX/Orbax. Lo publica el usuario Travor278 y corresponde al experimento E193, un ajuste fino con LoRA sobre la tarea "scan-object-left-first" usando el dataset `Shiki42/ctr-scan-object-left-first-20260916` (revision `2a8d55392c903123ba8eb640dd1af4f912b00e20`). No se trata de un modelo de lenguaje, sino de un modelo vision-language-action (VLA) orientado a generar acciones de robot con horizonte fijo de 50 pasos.

El entrenamiento partio de una base fresca y aplico 10.000 actualizaciones del optimizador con batch de 16 por experimento, GA1, FSDP1, semilla 87431 y mascara de perdida con relleno temporal (temporal-padding loss mask). Se representan 12 dimensiones articulares: articulaciones como delta y pinzas en valor absoluto. La regla estandar de congelacion LoRA de OpenPI se relajo para entrenar tambien el codificador de vision y las cabezas. Dos experimentos independientes compartieron cada GPU H100.

Su relevancia es acotada y de nicho: es un artefacto de investigacion reproducible (se incluyen los activos de normalizacion y las referencias de configuracion/transformacion, mas un `CHECKPOINT_MANIFEST.json`) pensado para evaluacion en simulacion dentro del ecosistema OpenPI. El autor no declara ninguna tasa de exito en simulacion para este checkpoint y no existe conversion a safetensors. El repositorio ocupa 6,3 GB, no tiene descargas ni likes, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; checkpoint de politica VLA de la familia pi0.5 / OpenPI (JAX/Orbax) |
| Parametros totales | no disponible |
| Parametros activos | no aplica — la informacion no indica arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible (el checkpoint define un horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (no se realizo conversion a safetensors ni se publican cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robotica; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | checkpoint JAX/Orbax para inferencia (directorio `10000/`), sin safetensors |
| Libreria | openpi |
| Pipeline | robotics |
| Tarea | scan-object-left-first (manipulacion robotica en simulacion) |
| Dataset de entrenamiento | Shiki42/ctr-scan-object-left-first-20260916, revision 2a8d55392c903123ba8eb640dd1af4f912b00e20 |
| Horizonte de accion | 50 pasos |
| Dimension de acciones | 12 dimensiones articulares (articulaciones en delta, pinzas en absoluto) |
| Tamano del repositorio | 6,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un checkpoint de inferencia de OpenPI en formato JAX/Orbax, derivado de la familia pi0.5. No se detalla en el material proporcionado la arquitectura interna (composicion del codificador de vision, del tronco de lenguaje ni del modulo de accion), por lo que ese punto queda como no disponible. Si se especifica que la regla estandar de congelacion LoRA de OpenPI se aplico con una excepcion: tambien se entrenan el codificador de vision y las cabezas, lo que implica que la adaptacion no se limita a las capas de atencion.

El entrenamiento consistio en 10.000 actualizaciones del optimizador partiendo de una base fresca, con batch de 16 por experimento, acumulacion de gradiente 1 (GA1), FSDP1, semilla 87431, horizonte de accion 50 y 12 dimensiones articulares (articulaciones en delta, pinzas en absoluto). Se empleo una mascara de perdida con relleno temporal. El checkpoint de origen supero una recarga independiente en CPU y una comprobacion de parametros finitos, y los ficheros de inferencia se rehashearon antes de la subida, con registro en `CHECKPOINT_MANIFEST.json`. Se excluyen el optimizador, el estado de reanudacion del cargador de datos y los checkpoints de estado de entrenamiento. El autor indica que este repositorio es independiente del modelo E166 anterior.

## Capacidades

- Generacion de acciones de robot: produce secuencias de accion con horizonte de 50 pasos sobre 12 dimensiones articulares (articulaciones como delta y pinzas como valor absoluto).
- Control condicionado por vision: al entrenarse tambien el codificador de vision, el modelo consume observaciones visuales de simulacion ademas del estado articular.
- Ejecucion de la tarea especifica "scan-object-left-first" en simulacion, segun el dataset de entrenamiento declarado.
- Inferencia con activos de normalizacion incluidos, que deben apuntarse mediante `PARALLELVLA_NORM_ASSETS_DIR`.
- Integracion en el ecosistema OpenPI con el commit de codigo `90f88ff2089bfc71db1011291dee48282d28aee2` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`.
- Soporte de tool calling / function calling: no aplica (modelo de robotica, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible / no aplica.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, vision generativa): no disponibles; la unica modalidad documentada es vision mas estado articular para producir acciones.

## Casos de uso

- Evaluacion de politicas en simulacion: cargar el directorio `10000/` como `checkpoint_dir` en OpenPI y medir la tasa de exito de la tarea scan-object-left-first. Es el uso previsto por el autor, que explicitamente no reclama ningun resultado de exito, por lo que la metrica debe obtenerse en una evaluacion propia.
- Estudio de adaptacion LoRA en VLA: comparar este checkpoint con la base PI0.5 fresca y con el modelo E166 del mismo autor para aislar el efecto de 10.000 actualizaciones LoRA sobre el codificador de vision y las cabezas.
- Reproducibilidad de experimentos: gracias al manifiesto de checkpoint, la revision fijada del dataset y el commit exacto de OpenPI, permite reproducir la carga de pesos y el pipeline de normalizacion en un entorno controlado.
- Investigacion sobre orden de escaneo: el dataset se centra en escanear un objeto empezando por la izquierda, de modo que este checkpoint sirve como punto de partida para estudiar sensibilidad al orden de exploracion o a variaciones de consigna.
- Punto de partida para ajustes posteriores: al ser un adaptador LoRA sobre base PI0.5, puede reutilizarse como inicializacion para nuevos ciclos de entrenamiento con datos adicionales, siempre respetando la configuracion de OpenPI indicada.
- Docencia y formacion interna: como ejemplo completo de artefacto OpenPI (activos de normalizacion, manifiesto y referencias de transformacion) para ensenar el flujo de trabajo de un VLA en JAX.
- Validacion de infraestructura: probar recargas de checkpoints Orbax, comprobaciones de parametros finitos y despliegues de inferencia JAX antes de escalar a otros modelos de la misma familia.
- Exploracion de sim-to-real: solo como fase exploratoria y con advertencia explicita, dado que no hay evidencia publicada de exito ni en simulacion ni en transferencia al mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo. Las metricas de entrenamiento se encuentran en la ejecucion E193 alojada en SwanLab, cuyo enlace se incluye en la seccion de enlaces; no se proporcionan cifras concretas en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,3 GB, lo que da una referencia del orden de magnitud de los pesos en precision de entrenamiento, pero no se publica ningun requisito de VRAM.
- GPU recomendadas: no disponible como recomendacion del autor. Durante el entrenamiento se usaron GPUs H100 (dos experimentos independientes compartieron cada H100).
- Compatibilidad con GPU de consumo: no disponible. No se documenta ninguna prueba en GPUs tipo RTX 4090 o similares.
- Opciones de despliegue: scripts de inferencia de OpenPI sobre JAX/Orbax. No se contemplan ni mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato de checkpoint.
- Dependencias de entorno: `PARALLELVLA_DATASET_REPO`, `PARALLELVLA_NORM_ASSETS_DIR` apuntando a `10000/assets` y `PI05_JAX_BASE` apuntando a un directorio de parametros base PI0.5 verificado por separado cuando la configuracion lo requiera.
- Latencia y throughput: no disponibles.
- Nota de portabilidad: el repositorio no es una instalacion Python autonoma; requiere el codigo fuente de OpenPI en el commit compatible indicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-scan-object-left-first-data20260916-lora-10k-e193 (este) | no disponible | horizonte de accion 50 | no publicado (el autor no reclama tasa de exito) | no disponible | HuggingFace, 0 descargas, 6,3 GB |
| pi05 E166 (mismo autor, repositorio anterior) | no disponible | no disponible | no disponible | no disponible | mencionado en la model card; repositorio separado |
| Base PI0.5 (parametros base requeridos por la configuracion) | no disponible | no disponible | no disponible | no disponible | debe obtenerse y verificarse por separado (`PI05_JAX_BASE`) |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otras alternativas de la misma categoria mas alla de las anteriores.

## Limitaciones y advertencias

- Modelo de robotica de proposito especifico: la tarea declarada es scan-object-left-first, no un modelo de lenguaje general.
- Sin licencia declarada: no puede determinarse si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso productivo.
- Solo inferencia: el checkpoint no incluye optimizador, estado del cargador de datos ni estados de entrenamiento, por lo que no permite reanudar el entrenamiento tal cual.
- Sin conversion a safetensors: el formato es JAX/Orbax, lo que restringe las herramientas de despliegue utilizables.
- Dependencia estricta del codigo: se requiere el commit `90f88ff2089bfc71db1011291dee48282d28aee2` de OpenPI y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`.
- Dependencia de una base externa: `PI05_JAX_BASE` debe apuntar a un directorio de parametros base PI0.5 verificado aparte.
- Rendimiento no validado publicamente: no hay tasa de exito en simulacion publicada ni resultados de benchmarks; el riesgo de que la politica no generalice fuera de las condiciones del dataset es alto.
- Sesgos conocidos: no disponibles, aunque al entrenarse sobre un unico dataset de simulacion con un orden de escaneo concreto, la generalizacion a otras disposiciones, objetos o instrucciones es incierta.
- Riesgo de alucinacion: no aplica en el sentido linguistico; en su lugar existe riesgo de acciones fisicamente invalidas o no seguras, agravado por la ausencia de metricas de exito.
- Idoneidad para produccion: muy limitada. Sin metricas, sin licencia y con cero adopcion (0 descargas, 0 likes), debe tratarse como artefacto de investigacion.
- Resultados de busqueda web irrelevantes: las busquedas devolvieron paginas sobre la sede de Microsoft en Redmond, sin relacion con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-left-first-data20260916-lora-10k-e193
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-left-first-20260916 (revision `2a8d55392c903123ba8eb640dd1af4f912b00e20`)
- Metricas de entrenamiento (ejecucion E193): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Commit de OpenPI compatible: `90f88ff2089bfc71db1011291dee48282d28aee2` (no se incluye URL del repositorio en la informacion disponible)
- Manifiesto del checkpoint: `CHECKPOINT_MANIFEST.json` (incluido en el repositorio; no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
