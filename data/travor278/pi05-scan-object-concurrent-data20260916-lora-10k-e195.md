# Travor278/pi05-scan-object-concurrent-data20260916-lora-10k-e195

# Travor278/pi05-scan-object-concurrent-data20260916-lora-10k-e195

## Resumen

Se trata de un checkpoint de inferencia de política robótica publicado por el usuario Travor278, construido como un ajuste fino mediante LoRA sobre PI0.5, la familia de modelos visión-lenguaje-acción (VLA) de OpenPI. El modelo no es un modelo de lenguaje general: es una política entrenada para una tarea concreta de manipulación robótica, la denominada "scan-object-concurrent", definida en el dataset Shiki42/ctr-scan-object-concurrent-20260916. Se distribuye en formato JAX/Orbax, es de solo inferencia y no se ha convertido a safetensors.

El checkpoint corresponde a 10.000 actualizaciones del optimizador (época/etapa E195 según el autor) con batch 16 por experimento, gradient accumulation 1, FSDP en grado 1, semilla 87431 y horizonte de acción de 50 pasos. Representa 12 dimensiones articulares: los deltas de las articulaciones y los grippers en valores absolutos, con máscara de pérdida por relleno temporal (temporal-padding loss mask). El autor indica que la regla estándar de congelación LoRA de OpenPI también entrena el codificador de visión y las cabezas del modelo.

Su relevancia es acotada pero clara para el ámbito de la investigación en robótica: sirve como artefacto reproducible de un ajuste fino eficiente sobre un VLA, incluye los parámetros de inferencia y los activos de normalización necesarios, y viene acompañado de métricas de entrenamiento públicas. No se declara ninguna tasa de éxito en simulación para este checkpoint y no se ha publicado licencia ni información de idiomas, benchmarks o cuantizaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA de la familia PI0.5/OpenPI; el autor no detalla la arquitectura interna) |
| Parametros totales | no disponible (repo de 6,3 GB en total, sin desglose entre pesos, activos de normalización y referencias) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos y 12 dimensiones articulares como datos de la política) |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax; no se realizó conversión a safetensors ni se mencionan variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia; directorio `10000/` como `checkpoint_dir`); sin safetensors |
| Libreria | openpi (JAX) |
| Pipeline | robotics |
| Tarea / dataset | Shiki42/ctr-scan-object-concurrent-20260916 (revision `9c9483af251e9076bab5c31aff97628bf41e1764`) |
| Config de referencia | `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` |
| Commit de OpenPI requerido | `e0e08ba202d53c9da05bd241eeb9c177c2b45e0d` |
| Entrenamiento | 10.000 updates del optimizador, batch 16 por experimento, GA1, FSDP1, seed 87431, LoRA |
| Tamano del repo | 6,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna del modelo base PI0.5 (capas, atención, esquema de flow matching o composición del codificador de visión). Lo que sí se detalla es el procedimiento de ajuste: se parte de una base nueva ("fresh base") y se aplican 10.000 actualizaciones del optimizador con adaptadores LoRA, batch 16 por experimento, gradient accumulation 1 y FSDP en grado 1 sobre JAX. Dos experimentos independientes se ejecutaron compartiendo cada GPU H100, lo que da una idea del coste de entrenamiento. La regla de congelación LoRA estándar de OpenPI implica que el codificador de visión y las cabezas también reciben entrenamiento, además de los adaptadores.

La política se entrena sobre el dataset `ctr-scan-object-concurrent-20260916` con un horizonte de acción de 50 pasos y 12 dimensiones articulares representadas como delta para las articulaciones y valor absoluto para los grippers. Se aplica una máscara de pérdida de relleno temporal. El paquete incluye únicamente los parámetros de inferencia y los activos de normalización asociados; se excluyen el estado del optimizador, el estado de reanudación del cargador de datos y los checkpoints de estado de entrenamiento. El autor indica además que el checkpoint pasó una recarga independiente en CPU y una comprobación de finitud de parámetros, y que los ficheros de inferencia se rehashearon antes de la subida (ver `CHECKPOINT_MANIFEST.json`).

## Capacidades

- Generación de acciones robóticas para una tarea de manipulación concreta: "scan-object-concurrent", con horizonte de 50 pasos de acción.
- Control de 12 dimensiones articulares: deltas de articulaciones y posiciones absolutas de grippers.
- Inferencia con activos de normalización incluidos, lo que permite reproducir el preprocesado de observaciones y la desnormalización de acciones sin reconstruir el pipeline manualmente.
- Ajuste fino eficiente mediante LoRA sobre PI0.5, con el codificador de visión y las cabezas también entrenados.
- Ejecución en el ecosistema OpenPI (JAX/Orbax), pensada para integrarse en su código fuente mediante un commit concreto.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento. No hay información al respecto.
- El modelo es de solo inferencia: no incluye estado de entrenamiento reanudable.

## Casos de uso

- Ejecución de la política objetivo en simulación: cargar el directorio `10000/` como `checkpoint_dir` y evaluar el comportamiento del brazo en la tarea de escaneo concurrente de objetos, teniendo en cuenta que el autor no declara ninguna tasa de éxito.
- Comparación entre checkpoints del mismo autor: al existir un modelo anterior (E168) entrenado con datos previos, este E195 permite estudiar el efecto de refrescar el dataset y continuar el ajuste LoRA sobre la misma familia de tareas.
- Reproducción de una receta de ajuste fino LoRA para VLA: la model card documenta batch, gradient accumulation, FSDP, semilla, horizonte y dimensiones, lo que facilita replicar el experimento con el commit de OpenPI indicado.
- Validación de pipelines de normalización y transformación: los activos de normalización incluidos y los ficheros de referencia en `source_reference` sirven para comprobar que el preprocesado coincide con el usado en entrenamiento antes de desplegar cualquier política derivada.
- Punto de partida para nuevos ajustes finos: dado que se libera como checkpoint de inferencia sobre PI0.5, puede utilizarse como inicialización para otras tareas del mismo entorno, siempre que se respete la revisión del dataset y la configuración de referencia.
- Docencia e investigación sobre entrenamiento distribuido en JAX: el dato de que dos experimentos independientes compartiesen cada H100 con batch 16 permite dimensionar ejercicios de planificación de recursos para ajustes LoRA de bajo coste.
- Pruebas de integración con el código fuente de OpenPI: verificar la compatibilidad del commit `e0e08ba202d53c9da05bd241eeb9c177c2b45e0d`, las variables de entorno requeridas y la resolución de `PI05_JAX_BASE` en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito en simulación para este checkpoint nuevo. Las únicas métricas disponibles son las de entrenamiento, alojadas en el panel de SwanLab del autor (run E195 de `CTR-PI05-LoRA10k`), que no se reproducen en la información proporcionada.

## Requisitos de hardware

- Repositorio completo: 6,3 GB. No se especifica cuánto de ese tamaño corresponde a los parámetros de inferencia, a los activos de normalización y a los ficheros de referencia, por lo que no puede derivarse el número de parámetros ni la VRAM exacta.
- Entrenamiento documentado: cada GPU H100 albergó dos experimentos independientes con batch 16 y LoRA, lo que sugiere que el ajuste es asequible en GPUs de 80 GB e, indiciariamente, en gamas inferiores, aunque esto no se confirma en la información disponible.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La única GPU mencionada en la documentación es la H100, y solo en el contexto del entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint está atado a OpenPI con JAX/Orbax y a un commit concreto del código fuente. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI; tampoco hay conversión a safetensors ni a GGUF.
- Variables de entorno requeridas: `PARALLELVLA_DATASET_REPO` (apuntando a `Shiki42/ctr-scan-object-concurrent-20260916`) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando a `10000/assets`). `PI05_JAX_BASE` debe apuntar a un directorio de parámetros base PI0.5 verificado por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travor278/pi05-scan-object-concurrent...e195 | no disponible | horizonte de acción 50, 12 dims articulares | sin tasa de éxito declarada | no disponible | HuggingFace, JAX/Orbax, 0 descargas |
| Travor278 E168 (modelo anterior del mismo autor) | no disponible | no disponible | no disponible | no disponible | mencionado en la model card como repo separado; sin enlace en la información |
| PI0.5 base (OpenPI) | no disponible | no disponible | no disponible | no disponible en la información | referencia requerida vía `PI05_JAX_BASE`; no se enlaza el repositorio base |
| Otras políticas robóticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no permite una comparación cuantitativa con alternativas de la misma categoría. Los resultados de búsqueda web recuperados no guardan relación con el modelo (corresponden a ofertas de empleo de un portal alemán), por lo que no aportan datos comparativos.

## Limitaciones y advertencias

- No se declara ninguna tasa de éxito en simulación para este checkpoint; el autor lo indica de forma explícita. No debe asumirse que supera al modelo E168 ni a la base PI0.5.
- Es un artefacto de investigación ligado a una tarea y un dataset concretos; su generalización a otras tareas, objetos o entornos no está documentada.
- El entrenamiento se realizó en simulación y sobre una revisión específica del dataset. El comportamiento en hardware real no está validado en la información disponible.
- Sin licencia declarada: no puede asumirse permiso de uso comercial. Cualquier uso en producción requiere aclarar la licencia con el autor y verificar las licencias del modelo base y del dataset.
- No se distribuyen pesos en safetensors ni en GGUF, y no se ha realizado conversión. La integración fuera de OpenPI/JAX requeriría trabajo adicional de conversión no soportado por el autor.
- Requiere un commit concreto del código fuente de OpenPI (`e0e08ba202d53c9da05bd241eeb9c177c2b45e0d`) y la configuración `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`; no es una instalación Python autónoma.
- Dependencia externa de `PI05_JAX_BASE`: hay que aportar por separado un directorio de parámetros base PI0.5 verificado. Sin él, la inferencia no puede ejecutarse según la documentación.
- Se excluyen los checkpoints de estado de entrenamiento, del optimizador y del cargador de datos: no se puede reanudar el entrenamiento desde este repositorio.
- El nombre histórico de la configuración (`pi05_putcab_...`) no coincide con la tarea o el dataset actuales, según advierte el propio autor; no debe interpretarse como una política de "put cable".
- No se documentan sesgos, comportamientos de alucinación ni limitaciones idiomáticas específicas, entre otras razones porque no es un modelo de lenguaje de propósito general y carece de ficha de idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida más allá de la comprobación declarada por el autor (recarga en CPU y comprobación de finitud de parámetros).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-concurrent-data20260916-lora-10k-e195
- Dataset: https://huggingface.co/datasets/Shiki42/ctr-scan-object-concurrent-20260916
- Métricas de entrenamiento (SwanLab, run E195 de CTR-PI05-LoRA10k): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Librería OpenPI (referencia general del ecosistema JAX utilizado): https://github.com/Physical-Intelligence/openpi
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes para este modelo (corresponden a un portal de empleo sin relación con el proyecto).
