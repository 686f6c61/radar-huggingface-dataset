# Travor278/pi05-pick-dual-bottles-concurrent-data20260916-lora-10k-e191

## Resumen

El modelo `Travor278/pi05-pick-dual-bottles-concurrent-data20260916-lora-10k-e191`, también etiquetado como E191, es un checkpoint de inferencia para robótica construido sobre la arquitectura PI0.5 (pi05) del ecosistema OpenPI. No es un modelo de lenguaje al uso: se trata de una política vision-language-action (VLA) afinada con LoRA para una tarea concreta de manipulación bimanual, recoger dos botellas de forma concurrente, entrenada íntegramente en simulación sobre el dataset `Shiki42/ctr-pick-dual-bottles-concurrent-20260916`.

El checkpoint lo publica el usuario Travor278 y se distribuye en formato nativo JAX/Orbax, solo para inferencia: no incluye estado de optimizador, estado de entrenamiento ni el estado reanudable del cargador de datos, y no se ha realizado conversión a safetensors. El repositorio ocupa 6,3 GB e incluye los parámetros de inferencia y los activos de normalización correspondientes, pero no los pesos base de PI0.5, que deben obtenerse por separado mediante la variable `PI05_JAX_BASE`.

Su relevancia es acotada y experimental: sirve como artefacto reproducibLED de un experimento de fine-tuning LoRA (10.000 actualizaciones de optimizador, batch 16, GA1, FSDP1, semilla 87431) y como punto de comparación frente al checkpoint anterior E164 del mismo autor. El propio autor indica explícitamente que no se reclama ninguna tasa de éxito en simulación para este checkpoint nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base PI0.5 de OpenPI; política VLA, no se detalla en la model card) |
| Parametros totales | no disponible (el repositorio contiene un adaptador LoRA + activos de normalización; los pesos base no se incluyen) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (se declara un horizonte de acción de 50 pasos, no una longitud de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se ha realizado conversión a safetensors ni a formatos cuantizados) |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint nativo de OpenPI, sin conversión a safetensors) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificarla como PI0.5 dentro de OpenPI. Lo que sí se detalla es el procedimiento de ajuste: se parte de un base fresco, se aplica LoRA con la regla de congelación estándar de OpenPI (que además entrena el codificador de visión y las cabezas) y se ejecutan 10.000 actualizaciones de optimizador con batch 16 por experimento, GA1 y FSDP1 sobre H100, con dos experimentos independientes compartiendo cada H100. La semilla empleada es 87431 y se aplica una máscara de pérdida por relleno temporal (temporal-padding loss mask).

La interfaz de acción tiene un horizonte de 50 pasos y 12 dimensiones articulares, representadas como delta para las articulaciones y de forma absoluta para las pinzas. La revisión del dataset utilizada es `9e1d13781d4e6cc074a4de98230e3853d2d302a0`. Para reproducir la inferencia hay que usar el commit de código fuente OpenPI `3c81dae612a8f407a8bc158a978e2b6498a22f07` con la configuración `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` (el autor advierte que el nombre histórico de la configuración no cambia el dataset ni la tarea). Se incluyen ficheros de referencia de configuración y transformación en `source_reference`, pero el repositorio no es una instalación Python autónoma. El checkpoint pasó una recarga independiente en CPU y una comprobación de parámetros finitos, y los ficheros de inferencia fueron rehasheados antes de la subida (ver `CHECKPOINT_MANIFEST.json`).

## Capacidades

- Generación de acciones motoras para manipulación robótica: produce secuencias de 12 dimensiones articulares con horizonte de 50 pasos, en representación delta para las articulaciones y absoluta para las pinzas.
- Ejecución de una tarea bimanual concreta en simulación: recogida concurrente de dos botellas, según el dataset de entrenamiento declarado.
- Política condicionada por observación visual (componente vision del pipeline VLA de PI0.5) y por el estado del robot, con normalización incluida en el repositorio.
- Inferencia sobre el runtime OpenPI en JAX, con parámetros de inferencia completos y activos de normalización emparejados.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni generación de texto.
- No se declara modo de razonamiento (thinking mode), audio ni otras modalidades adicionales.
- No se declara ninguna capacidad fuera del entorno de simulación para el que se entrenó.

## Casos de uso

- Recogida bimanual de dos botellas en simulación: es el caso de uso literal del checkpoint, que predice acciones de 12 dimensiones con horizonte 50 para completar la tarea concurrente sobre el dataset `ctr-pick-dual-bottles-concurrent`.
- Reproducción de experimentos LoRA en OpenPI: al publicarse la configuración exacta, el commit de código y la revisión del dataset, permite replicar el ajuste y auditar la receta de congelación de capas (LoRA más codificador de visión y cabezas).
- Comparación de checkpoints de la misma familia: sirve como punto de referencia frente al checkpoint E164 del mismo autor para estudiar el efecto del refresco de datos (20260916) y de las 10.000 actualizaciones.
- Evaluación de políticas en pipelines de simulación: el checkpoint es solo de inferencia, por lo que puede cargarse en un bucle de rollout para medir tasas de éxito propias, dado que el autor no publica ninguna.
- Estudio de representación de acciones: útil para experimentar con la mezcla de deltas articulares y valores absolutos de pinza y con el horizonte de acción de 50 pasos en tareas de manipulación diestra.
- Punto de partida para nuevo fine-tuning: al ser un adaptador LoRA sobre PI0.5, puede reutilizarse como inicialización para tareas relacionadas, siempre que se disponga del base `PI05_JAX_BASE` verificado por separado.
- Verificación de integridad de artefactos: el `CHECKPOINT_MANIFEST.json` y el rehash de los ficheros de inferencia permiten practicar flujos de validación de checkpoints antes de desplegarlos.
- Docencia e investigación en VLA: como ejemplo compacto de checkpoint OpenPI con metadatos completos de entrenamiento (semilla, batch, FSDP, máscara de pérdida) para analizar trazabilidad experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que no se reclama ninguna tasa de éxito en simulación para este checkpoint nuevo. Las métricas de entrenamiento se encuentran en la ejecución E191 alojada en SwanLab (enlace en la sección de enlaces), pero no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (6,3 GB) corresponde al adaptador y a los activos de normalización, no al conjunto completo de pesos, ya que el base PI0.5 debe obtenerse aparte.
- GPU recomendadas: no se especifican en la model card. El entrenamiento se realizó sobre H100 (dos experimentos independientes compartiendo cada H100) con FSDP1 y batch 16 por experimento.
- Cabe en GPU de consumo: no disponible; no hay datos que lo confirmen ni que lo descarten, y depende del base PI0.5 que se cargue por separado.
- Opciones de despliegue: runtime OpenPI en JAX, cargando el directorio `10000/` como `checkpoint_dir`. No hay formatos GGUF, llama.cpp, Ollama, vLLM ni TGI disponibles, dado que no se realizó conversión a safetensors ni cuantización.
- Variables de entorno necesarias: `PARALLELVLA_DATASET_REPO=Shiki42/ctr-pick-dual-bottles-concurrent-20260916`, `PARALLELVLA_NORM_ASSETS_DIR` apuntando a `10000/assets` local y `PI05_JAX_BASE` apuntando a un directorio de parámetros base PI0.5 verificado por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick-dual-bottles-concurrent-data20260916-lora-10k-e191 (E191) | Checkpoint LoRA de inferencia sobre PI0.5, JAX/Orbax | no disponible | Horizonte de acción 50, 12 dims articulares | no disponible | Repositorio HuggingFace de 6,3 GB, solo inferencia |
| Checkpoint E164 del mismo autor | Checkpoint LoRA de inferencia sobre PI0.5, JAX/Orbax | no disponible | no disponible | no disponible | Mencionado en la model card como modelo anterior y separado |
| Modelo base PI0.5 de OpenPI | Política VLA base | no disponible | no disponible | no disponible | Debe obtenerse por separado; no incluido en este repositorio |

No se dispone de datos comparativos adicionales (parámetros, benchmarks o licencia) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin cobertura explícita y debe consultarse con el autor antes de cualquier despliegue productivo.
- El autor no reclama ninguna tasa de éxito en simulación para este checkpoint: el rendimiento real de la política es desconocido y requiere evaluación propia.
- Está entrenado exclusivamente en simulación sobre una única tarea (recogida concurrente de dos botellas); no hay evidencia de transferencia a robots reales.
- El repositorio es solo de inferencia: no incluye optimizador, estado de entrenamiento ni estado reanudable del cargador de datos, por lo que no permite reanudar el entrenamiento tal cual.
- No incluye los pesos base de PI0.5; es imprescindible disponer de `PI05_JAX_BASE` verificado por separado, lo que añade una dependencia externa y un riesgo de incompatibilidad.
- Requiere un commit concreto del código OpenPI (`3c81dae612a8f407a8bc158a978e2b6498a22f07`) y una configuración cuyo nombre histórico (`pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`) no refleja la tarea real; usar otra revisión puede romper la reproducibilidad.
- No hay conversión a safetensors ni formatos cuantizados, lo que limita las opciones de despliegue a JAX/Orbax y dificulta la integración con ecosistemas tipo GGUF, Ollama, vLLM o TGI.
- El repositorio no es una instalación Python autónoma; los ficheros de `source_reference` son solo material de referencia de configuración y transformación.
- No se documentan sesgos, composición del dataset ni cobertura de escenarios; el dataset referenciado es un identificador de HuggingFace sin descripción en la información disponible.
- Riesgo de alucinación: no aplica en el sentido textual habitual, pero sí existe riesgo de generalización incorrecta fuera de la distribución de la simulación de entrenamiento.
- Las fechas del repositorio (creación y actualización en septiembre de 2026) proceden de los metadatos tal cual se publicaron.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-concurrent-data20260916-lora-10k-e191
- Dataset referenciado: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-concurrent-20260916
- Métricas de entrenamiento (ejecución E191): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Repositorio OpenPI referenciado por la model card (commit compatible `3c81dae612a8f407a8bc158a978e2b6498a22f07`; la model card no incluye URL explícita): https://github.com/Physical-Intelligence/openpi
